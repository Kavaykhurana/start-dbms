import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const payload = await investmentApi.getInvestors();
        const investors = payload.items || [];

        renderSummary(investors);
        renderInvestors(investors);
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function renderSummary(investors) {
    const totalDeployed = investors.reduce((sum, investor) => sum + Number(investor.totalDeployedInr || 0), 0);
    const avgRisk = average(investors.map((investor) => investor.avgRiskScore));
    const avgRoi = average(investors.map((investor) => investor.roiProxy));
    const sectorCount = new Set(investors.flatMap((investor) => investor.sectors || [])).size;

    document.getElementById('investor-summary').innerHTML = `
        ${renderSummaryTile('Investors', investors.length, 'Funding source records')}
        ${renderSummaryTile('Deployed', formatCompactCurrency(totalDeployed), 'Across portfolio')}
        ${renderSummaryTile('Avg risk', avgRisk.toFixed(1), 'RiskAnalysis exposure')}
        ${renderSummaryTile('Sector spread', sectorCount, `ROI proxy ${avgRoi.toFixed(1)}%`)}
    `;
}

function renderInvestors(investors) {
    const grid = document.getElementById('investor-grid');

    grid.innerHTML = investors.map((investor) => `
        <article class="glass-card investor-card">
            <div class="investor-card-header">
                <div>
                    <span class="system-label">${escapeHtml(investor.investorType)}</span>
                    <h2>${escapeHtml(investor.name)}</h2>
                    <p>${escapeHtml(investor.hqCity)} • ${escapeHtml(investor.riskPreference)} risk preference</p>
                </div>
                <strong>${formatCompactCurrency(investor.totalDeployedInr)}</strong>
            </div>
            <div class="recommendation-metrics">
                ${renderMetric('Startups', investor.startupCount, 'Funded companies')}
                ${renderMetric('Avg Risk', Number(investor.avgRiskScore || 0).toFixed(1), 'RiskAnalysis')}
                ${renderMetric('Avg LTV/CAC', `${Number(investor.avgLtvCac || 0).toFixed(2)}x`, 'Unit economics')}
                ${renderMetric('ROI proxy', `${Number(investor.roiProxy || 0).toFixed(1)}%`, 'sp_CalculateROI logic')}
            </div>
            <div class="portfolio-chip-row">
                ${(investor.sectors || []).slice(0, 8).map((sector) => `<span>${escapeHtml(sector)}</span>`).join('')}
            </div>
            <div class="investor-startup-list">
                ${(investor.startups || []).slice(0, 10).map((startup) => `<span>${escapeHtml(startup)}</span>`).join('')}
            </div>
        </article>
    `).join('');
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

function renderMetric(label, value, helper) {
    return `
        <div>
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}
