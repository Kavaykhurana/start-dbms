import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    setCurrentDate();

    try {
        const dashboard = await investmentApi.getDashboard();
        const { summary, sectorGrowth, investmentTrends } = dashboard;

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
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});
