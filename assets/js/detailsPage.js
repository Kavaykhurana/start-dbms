import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const startupId = Number(urlParams.get('id') || 1);

    try {
        const payload = await investmentApi.getStartup(startupId);
        const { startup, financialHistory } = payload;

        document.getElementById('startup-name').textContent = startup.name;

        const badge = document.getElementById('startup-badge');
        badge.textContent = startup.fundingStage;
        badge.classList.add(getRiskBadge(startup.riskLevel));

        document.getElementById('val-cac').textContent = formatCurrency(startup.cac);
        document.getElementById('val-ltv').textContent = formatCurrency(startup.ltv);
        document.getElementById('val-burn').textContent = `${formatCompactCurrency(startup.burnRate)}/mo`;
        document.getElementById('val-runway').textContent = `${startup.runway.toFixed(1)} Months`;

        const chartValues = financialHistory.data.map((value) => Number((value / 10000000).toFixed(2)));
        const ctx = document.getElementById('historyChart').getContext('2d');

        createLineChart(
            ctx,
            financialHistory.labels,
            chartValues,
            'Revenue (INR Cr)',
            '#00ff88'
        );
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});
