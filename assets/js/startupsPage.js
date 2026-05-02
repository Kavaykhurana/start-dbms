import { investmentApi } from './api.js';

const LOCAL_STARTUPS_KEY = 'ventureAnalytics.customStartups';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('startup-table-body');
    const searchInput = document.getElementById('search');
    const sectorSelect = document.getElementById('filter-sector');
    const riskSelect = document.getElementById('filter-risk');
    const resultCount = document.getElementById('startup-result-count');
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
            const allStartups = [...payload.items, ...localStartups];
            const filteredStartups = applyClientFilters(allStartups);

            populateSectors(sectors);
            renderPortfolioSummary(allStartups, filteredStartups);
            renderPortfolioInsights(allStartups);

            renderTable(filteredStartups);
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
        resultCount.textContent = `${data.length} startups shown in the current portfolio view`;

        if (!data.length) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 25px 0;">
                    No startups matched the current filters.
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        data.forEach((startup) => {
            const row = document.createElement('tr');
            const ltvCacRatio = Number(startup.ltvCacRatio || 0);
            const runway = Number(startup.runway || 0);
            const riskScore = Number(startup.riskScore || 0);
            const decision = getDecisionSignal(startup);
            const runwayPercent = Math.min(100, Math.max(5, (runway / 18) * 100));
            const ltvPercent = Math.min(100, Math.max(5, (ltvCacRatio / 7) * 100));

            row.innerHTML = `
                <td class="startup-profile-cell">
                    <strong>${escapeHtml(startup.name)}</strong>
                    <span>${escapeHtml(startup.sector)} • ${escapeHtml(startup.fundingStage)} • ${escapeHtml([startup.city, startup.state].filter(Boolean).join(', ') || 'India')}</span>
                    <div class="profile-tags">
                        <em>${startup.isLocal ? 'Local session entry' : 'Seed DB record'}</em>
                        <em>${getStageMaturity(startup.fundingStage)}</em>
                    </div>
                </td>
                <td>
                    <strong>${formatCompactCurrency(startup.totalFunding)}</strong>
                    <span class="cell-note">Funding raised</span>
                    <span class="cell-note">Valuation ${formatCompactCurrency(startup.valuation)}</span>
                </td>
                <td>
                    <div class="mini-meter runway-meter"><span style="width: ${runwayPercent}%"></span></div>
                    <strong>${runway.toFixed(1)} mo</strong>
                    <span class="cell-note">${getRunwayCopy(runway)}</span>
                </td>
                <td>
                    <div class="mini-meter economics-meter"><span style="width: ${ltvPercent}%"></span></div>
                    <strong>${ltvCacRatio ? `${ltvCacRatio.toFixed(2)}x` : 'N/A'}</strong>
                    <span class="cell-note">${getEconomicsCopy(ltvCacRatio)}</span>
                </td>
                <td>
                    <span class="badge ${getRiskBadge(startup.riskLevel)}">${startup.riskLevel}</span>
                    <span class="cell-note">Risk score ${riskScore.toFixed(0)}</span>
                </td>
                <td class="decision-cell">
                    <strong class="${decision.className}">${decision.label}</strong>
                    <span>${decision.reason}</span>
                    <a href="${buildDetailsUrl(startup.id)}" class="btn btn-secondary">Details</a>
                </td>
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

function renderPortfolioSummary(allStartups, filteredStartups) {
    const container = document.getElementById('startup-summary-grid');
    const totalFunding = allStartups.reduce((sum, startup) => sum + Number(startup.totalFunding || 0), 0);
    const totalValuation = allStartups.reduce((sum, startup) => sum + Number(startup.valuation || 0), 0);
    const avgRunway = average(allStartups.map((startup) => Number(startup.runway || 0)));
    const sectors = new Set(allStartups.map((startup) => startup.sector));

    container.innerHTML = `
        ${renderSummaryTile('Portfolio size', `${allStartups.length}`, `${filteredStartups.length} visible after filters`)}
        ${renderSummaryTile('Capital tracked', formatCompactCurrency(totalFunding), 'Total funding across startups')}
        ${renderSummaryTile('Valuation base', formatCompactCurrency(totalValuation), 'Current marked valuation')}
        ${renderSummaryTile('Sector spread', `${sectors.size}`, `Avg runway ${avgRunway.toFixed(1)} months`)}
    `;
}

function renderPortfolioInsights(startups) {
    const stageCounts = countBy(startups, 'fundingStage');
    const riskCounts = countBy(startups, 'riskLevel');
    const sectorFunding = Object.entries(groupBy(startups, 'sector'))
        .map(([sector, sectorStartups]) => ({
            sector,
            funding: sectorStartups.reduce((sum, startup) => sum + Number(startup.totalFunding || 0), 0),
            count: sectorStartups.length
        }))
        .sort((a, b) => b.funding - a.funding)[0];
    const watchlist = startups
        .filter((startup) => Number(startup.runway || 0) < 8 || startup.riskLevel === 'High')
        .sort((a, b) => Number(a.runway || 0) - Number(b.runway || 0))
        .slice(0, 3);

    document.getElementById('stage-mix-card').innerHTML = `
        <span class="system-label">Funding stage mix</span>
        <h3>${Object.keys(stageCounts).length} active stages</h3>
        <div class="portfolio-chip-row">${renderCountChips(stageCounts)}</div>
    `;

    document.getElementById('risk-mix-card').innerHTML = `
        <span class="system-label">Risk distribution</span>
        <h3>${riskCounts.Low || 0} low-risk startups</h3>
        <div class="portfolio-chip-row">${renderCountChips(riskCounts)}</div>
    `;

    document.getElementById('sector-leader-card').innerHTML = `
        <span class="system-label">Capital concentration</span>
        <h3>${escapeHtml(sectorFunding?.sector || 'No sector')}</h3>
        <p>${sectorFunding ? `${formatCompactCurrency(sectorFunding.funding)} deployed across ${sectorFunding.count} startup${sectorFunding.count === 1 ? '' : 's'}.` : 'No funding data available.'}</p>
    `;

    document.getElementById('watchlist-card').innerHTML = `
        <span class="system-label">Runway watchlist</span>
        <h3>${watchlist.length} needs review</h3>
        <div class="watchlist-mini">
            ${watchlist.map((startup) => `<a href="${buildDetailsUrl(startup.id)}"><strong>${escapeHtml(startup.name)}</strong><span>${Number(startup.runway || 0).toFixed(1)} mo • ${startup.riskLevel}</span></a>`).join('') || '<p>No urgent runway alerts.</p>'}
        </div>
    `;
}

function renderSummaryTile(label, value, helper) {
    return `
        <div>
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function buildDetailsUrl(startupId) {
    return `/details?id=${encodeURIComponent(startupId)}`;
}

function renderCountChips(counts) {
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => `<span>${escapeHtml(label)} <strong>${count}</strong></span>`)
        .join('');
}

function getDecisionSignal(startup) {
    const ltvCacRatio = Number(startup.ltvCacRatio || 0);
    const riskScore = Number(startup.riskScore || 0);
    const runway = Number(startup.runway || 0);

    if (ltvCacRatio >= 5 && riskScore < 45 && runway >= 10) {
        return {
            label: 'Invest',
            reason: 'Strong economics',
            className: 'decision-invest'
        };
    }

    if (riskScore >= 65 || runway < 6) {
        return {
            label: 'Review',
            reason: 'Risk trigger',
            className: 'decision-review'
        };
    }

    return {
        label: 'Watch',
        reason: 'Needs monitoring',
        className: 'decision-watch'
    };
}

function getStageMaturity(stage) {
    if (stage === 'Series B') {
        return 'Scale stage';
    }

    if (stage === 'Series A') {
        return 'Growth stage';
    }

    return 'Early stage';
}

function getRunwayCopy(runway) {
    if (runway >= 12) {
        return 'Healthy buffer';
    }

    if (runway >= 8) {
        return 'Moderate buffer';
    }

    return 'Low runway alert';
}

function getEconomicsCopy(ltvCacRatio) {
    if (ltvCacRatio >= 5) {
        return 'Efficient acquisition';
    }

    if (ltvCacRatio >= 3) {
        return 'Acceptable economics';
    }

    return 'Needs CAC control';
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function countBy(items, key) {
    return items.reduce((counts, item) => {
        const value = item[key] || 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
        return counts;
    }, {});
}

function groupBy(items, key) {
    return items.reduce((groups, item) => {
        const value = item[key] || 'Unknown';
        groups[value] = groups[value] || [];
        groups[value].push(item);
        return groups;
    }, {});
}

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
    const riskScore = riskScoreFromLevel(riskLevel);

    const startup = {
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
        riskScore,
        riskLevel,
        cac,
        ltv,
        burnRate: runway > 0 ? Math.round((totalFunding * 0.55) / runway) : 0,
        runway,
        churnRate: Number(formData.get('churnRate') || 0),
        customerCount: Math.max(100, Math.round((totalFunding / 10000000) * 1200)),
        ltvCacRatio: Number((ltv / cac).toFixed(2)),
        history: []
    };

    startup.history = buildLocalHistory(startup);

    return startup;
}

function buildLocalHistory(startup) {
    const latestRevenue = Math.max(1200000, Number(startup.totalFunding || 0) * 0.08);
    const seedShapes = {
        Fintech: [0.44, 0.51, 0.64, 0.74, 0.88, 1],
        Edtech: [0.38, 0.45, 0.53, 0.70, 0.82, 1],
        Healthtech: [0.50, 0.54, 0.61, 0.72, 0.80, 1],
        ClimateTech: [0.34, 0.42, 0.58, 0.62, 0.83, 1],
        SaaS: [0.41, 0.52, 0.66, 0.78, 0.89, 1],
        Gaming: [0.31, 0.55, 0.48, 0.73, 0.82, 1],
        Biotech: [0.28, 0.32, 0.44, 0.57, 0.68, 1]
    };
    const fallbackShape = [0.40, 0.49, 0.60, 0.72, 0.86, 1];
    const shape = seedShapes[startup.sector] || fallbackShape;
    const riskAdjustment = startup.riskLevel === 'High' ? [0, 0.03, -0.04, 0.02, -0.02, 0] : [0, 0, 0.01, 0, 0.01, 0];

    return shape.map((factor, index) => Math.round(latestRevenue * Math.max(0.2, factor + riskAdjustment[index])));
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
