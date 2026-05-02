import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    setCurrentDate();

    try {
        const dashboard = await investmentApi.getDashboard();
        const { summary, sectorGrowth, investmentTrends, stageFunding, riskDistribution, topStartups = [] } = dashboard;

        document.getElementById('total-startups').textContent = summary.totalStartups;
        document.getElementById('total-funding').textContent = formatCompactCurrency(summary.totalFundingInr);
        document.getElementById('avg-roi').textContent = formatPercent(summary.avgROI, 1);

        const riskLevelElement = document.getElementById('risk-level');
        riskLevelElement.textContent = summary.riskLevel;
        riskLevelElement.style.color = getRiskAccent(summary.riskLevel);

        const sectorCtx = document.getElementById('sectorChart').getContext('2d');
        createBarChart(sectorCtx, sectorGrowth.labels, sectorGrowth.data, 'Trend Score');

        const trendsCtx = document.getElementById('trendsChart').getContext('2d');
        createLineChart(trendsCtx, investmentTrends.labels, investmentTrends.data, 'Funding (INR Cr)', '#00d2ff');

        if (stageFunding) {
            const stageCtx = document.getElementById('stageFundingChart').getContext('2d');
            createDoughnutChart(stageCtx, stageFunding.labels, stageFunding.data, 'Funding (INR Cr)');
        }

        if (riskDistribution) {
            const riskCtx = document.getElementById('riskDistributionChart').getContext('2d');
            createDoughnutChart(riskCtx, riskDistribution.labels, riskDistribution.data, 'Startups');
        }

        renderTopStartups(topStartups);
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function renderTopStartups(startups) {
    const container = document.getElementById('top-startup-list');

    if (!container) {
        return;
    }

    container.innerHTML = '';

    startups.forEach((startup) => {
        const card = document.createElement('a');
        card.href = `/pages/details.html?id=${startup.startupId}`;
        card.className = 'signal-card';
        card.innerHTML = `
            <span class="signal-rank">#${startup.rank}</span>
            <strong>${startup.name}</strong>
            <span>${startup.sector} • ${startup.fundingStage}</span>
            <span class="signal-score">${startup.decisionScore.toFixed(2)}/10 • ${startup.signal}</span>
        `;
        container.appendChild(card);
    });
}
