import { investmentApi } from './api.js';

const LOCAL_STARTUPS_KEY = 'ventureAnalytics.customStartups';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('startup-table-body');
    const searchInput = document.getElementById('search');
    const sectorSelect = document.getElementById('filter-sector');
    const riskSelect = document.getElementById('filter-risk');
    const addButton = document.getElementById('add-startup-button');
    const modal = document.getElementById('startup-modal');
    const form = document.getElementById('startup-form');
    const closeModalButton = document.getElementById('close-startup-modal');
    const cancelModalButton = document.getElementById('cancel-startup-modal');

    let searchTimer = null;

    async function loadStartups() {
        try {
            const payload = await investmentApi.getStartups({
                search: searchInput.value.trim(),
                sector: sectorSelect.value,
                risk: riskSelect.value
            });

            const localStartups = getLocalStartups();
            const sectors = [...new Set([...payload.sectors, ...localStartups.map((startup) => startup.sector)])].sort();
            populateSectors(sectors);

            renderTable(applyClientFilters([...payload.items, ...localStartups]));
        } catch (error) {
            renderPageError('.main-content', error.message);
        }
    }

    function populateSectors(sectors) {
        const existingValue = sectorSelect.value;
        sectorSelect.innerHTML = '<option value="">All Sectors</option>';

        sectors.forEach((sector) => {
            const option = document.createElement('option');
            option.value = sector;
            option.textContent = sector;
            sectorSelect.appendChild(option);
        });

        sectorSelect.value = existingValue;
    }

    function renderTable(data) {
        tableBody.innerHTML = '';

        if (!data.length) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="9" style="text-align: center; color: var(--text-secondary); padding: 25px 0;">
                    No startups matched the current filters.
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        data.forEach((startup) => {
            const row = document.createElement('tr');
            const ltvCacRatio = Number(startup.ltvCacRatio || 0);
            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(startup.name)}</strong>
                    ${startup.isLocal ? '<span class="table-note">Added locally</span>' : ''}
                </td>
                <td>${escapeHtml(startup.sector)}</td>
                <td>${escapeHtml(startup.fundingStage)}</td>
                <td>${escapeHtml([startup.city, startup.state].filter(Boolean).join(', ') || 'India')}</td>
                <td>${formatCurrency(startup.totalFunding)}</td>
                <td>${Number(startup.runway || 0).toFixed(1)} mo</td>
                <td>${ltvCacRatio ? `${ltvCacRatio.toFixed(2)}x` : 'N/A'}</td>
                <td><span class="badge ${getRiskBadge(startup.riskLevel)}">${startup.riskLevel}</span></td>
                <td><a href="/pages/details.html?id=${encodeURIComponent(startup.id)}" class="btn btn-secondary">Details</a></td>
            `;
            tableBody.appendChild(row);
        });
    }

    function applyClientFilters(items) {
        const search = searchInput.value.trim().toLowerCase();
        const sector = sectorSelect.value;
        const risk = riskSelect.value;

        return items.filter((startup) => {
            const searchable = [
                startup.name,
                startup.sector,
                startup.city,
                startup.state,
                startup.fundingStage
            ].join(' ').toLowerCase();

            return (!search || searchable.includes(search))
                && (!sector || startup.sector === sector)
                && (!risk || startup.riskLevel === risk);
        });
    }

    searchInput.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(loadStartups, 250);
    });

    sectorSelect.addEventListener('change', loadStartups);
    riskSelect.addEventListener('change', loadStartups);

    addButton.addEventListener('click', () => openModal());
    closeModalButton.addEventListener('click', () => closeModal());
    cancelModalButton.addEventListener('click', () => closeModal());
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const startup = buildStartupFromForm(formData);
        const localStartups = getLocalStartups();

        localStartups.unshift(startup);
        localStorage.setItem(LOCAL_STARTUPS_KEY, JSON.stringify(localStartups));
        closeModal();
        showToast(`${startup.name} added to the portfolio.`);
        loadStartups();
    });

    await loadStartups();
});

function openModal() {
    const modal = document.getElementById('startup-modal');
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('#startup-form input[name="name"]').focus();
}

function closeModal() {
    const modal = document.getElementById('startup-modal');
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.getElementById('startup-form').reset();
}

function getLocalStartups() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STARTUPS_KEY) || '[]');
    } catch (_error) {
        return [];
    }
}

function buildStartupFromForm(formData) {
    const totalFunding = Number(formData.get('totalFundingCr') || 0) * 10000000;
    const valuation = Number(formData.get('valuationCr') || 0) * 10000000;
    const cac = Number(formData.get('cac') || 1);
    const ltv = Number(formData.get('ltv') || 1);
    const runway = Number(formData.get('runway') || 0);
    const riskLevel = String(formData.get('riskLevel') || 'Medium');
    const city = String(formData.get('city') || '').trim();
    const state = String(formData.get('state') || '').trim();
    const sector = String(formData.get('sector') || '').trim();
    const name = String(formData.get('name') || '').trim();

    return {
        id: `local-${Date.now()}`,
        isLocal: true,
        name,
        sector,
        fundingStage: String(formData.get('fundingStage') || 'Seed'),
        city,
        state,
        foundedYear: new Date().getFullYear(),
        founders: 'User-entered portfolio prospect',
        businessModel: `${sector} operating model`,
        revenueModel: 'Projected subscriptions, platform fees, and enterprise revenue',
        description: `${name} is a user-added ${sector} prospect based in ${city}, ${state}.`,
        partnerName: 'To be validated',
        dealType: 'LOI',
        marketTrend: riskLevel === 'Low' ? 78 : riskLevel === 'Medium' ? 68 : 55,
        competitorScore: riskLevel === 'Low' ? 48 : riskLevel === 'Medium' ? 60 : 72,
        impactScore: riskLevel === 'Low' ? 8 : riskLevel === 'Medium' ? 6.8 : 5.5,
        valuation,
        employeeCount: 25,
        totalFunding,
        riskScore: riskScoreFromLevel(riskLevel),
        riskLevel,
        cac,
        ltv,
        burnRate: runway > 0 ? Math.round((totalFunding * 0.55) / runway) : 0,
        runway,
        churnRate: Number(formData.get('churnRate') || 0),
        customerCount: Math.max(100, Math.round((totalFunding / 10000000) * 1200)),
        ltvCacRatio: Number((ltv / cac).toFixed(2)),
        history: buildLocalHistory(totalFunding)
    };
}

function buildLocalHistory(totalFunding) {
    const baseline = Math.max(1200000, totalFunding * 0.08);
    return [0.58, 0.66, 0.74, 0.83, 0.92, 1].map((factor) => Math.round(baseline * factor));
}

function riskScoreFromLevel(riskLevel) {
    if (riskLevel === 'Low') return 28;
    if (riskLevel === 'High') return 72;
    return 48;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => toast.classList.add('is-visible'), 20);
    window.setTimeout(() => {
        toast.classList.remove('is-visible');
        window.setTimeout(() => toast.remove(), 220);
    }, 2600);
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]);
}
