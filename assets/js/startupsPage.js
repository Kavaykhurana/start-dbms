import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('startup-table-body');
    const searchInput = document.getElementById('search');
    const sectorSelect = document.getElementById('filter-sector');
    const riskSelect = document.getElementById('filter-risk');

    let sectorOptionsLoaded = false;
    let searchTimer = null;

    async function loadStartups() {
        try {
            const payload = await investmentApi.getStartups({
                search: searchInput.value.trim(),
                sector: sectorSelect.value,
                risk: riskSelect.value
            });

            if (!sectorOptionsLoaded) {
                populateSectors(payload.sectors);
                sectorOptionsLoaded = true;
            }

            renderTable(payload.items);
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
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 25px 0;">
                    No startups matched the current filters.
                </td>
            `;
            tableBody.appendChild(row);
            return;
        }

        data.forEach((startup) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${startup.name}</strong></td>
                <td>${startup.sector}</td>
                <td>${startup.fundingStage}</td>
                <td>${formatCurrency(startup.totalFunding)}</td>
                <td><span class="badge ${getRiskBadge(startup.riskLevel)}">${startup.riskLevel}</span></td>
                <td><a href="/pages/details.html?id=${startup.id}" class="btn" style="background: rgba(255,255,255,0.1); color: white;">Details</a></td>
            `;
            tableBody.appendChild(row);
        });
    }

    searchInput.addEventListener('input', () => {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(loadStartups, 250);
    });

    sectorSelect.addEventListener('change', loadStartups);
    riskSelect.addEventListener('change', loadStartups);

    await loadStartups();
});
