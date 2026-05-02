import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    setCurrentDate();

    try {
        const [dashboard, startupListing] = await Promise.all([
            investmentApi.getDashboard(),
            investmentApi.getStartups()
        ]);
        const { summary, sectorGrowth, investmentTrends, stageFunding, riskDistribution, topStartups = [] } = dashboard;
        const startups = startupListing.items || [];

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

        renderLtvCacChart(startups);
        renderRunwayWatchChart(startups);
        renderPortfolioMix(startups);
        renderDiligenceAlerts(startups);
        renderTopStartups(topStartups);
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function renderLtvCacChart(startups) {
    const canvas = document.getElementById('ltvCacChart');

    if (!canvas || !startups.length) {
        return;
    }

    const leaders = [...startups]
        .sort((a, b) => b.ltvCacRatio - a.ltvCacRatio)
        .slice(0, 6);

    createHorizontalBarChart(
        canvas.getContext('2d'),
        leaders.map((startup) => startup.name),
        leaders.map((startup) => startup.ltvCacRatio),
        'LTV/CAC Ratio',
        ['rgba(0, 210, 255, 0.72)', 'rgba(0, 255, 136, 0.72)', 'rgba(94, 234, 212, 0.72)']
    );
}

function renderRunwayWatchChart(startups) {
    const canvas = document.getElementById('runwayWatchChart');

    if (!canvas || !startups.length) {
        return;
    }

    const watchlist = [...startups]
        .sort((a, b) => a.runway - b.runway)
        .slice(0, 6);

    createHorizontalBarChart(
        canvas.getContext('2d'),
        watchlist.map((startup) => startup.name),
        watchlist.map((startup) => startup.runway),
        'Runway Months',
        watchlist.map((startup) => getRiskColor(startup.riskLevel, 0.72))
    );
}

function renderPortfolioMix(startups) {
    const container = document.getElementById('portfolio-mix');

    if (!container || !startups.length) {
        return;
    }

    const totalFunding = startups.reduce((sum, startup) => sum + startup.totalFunding, 0);
    const sectors = new Set(startups.map((startup) => startup.sector));
    const seedCount = startups.filter((startup) => startup.fundingStage === 'Seed').length;
    const seriesCount = startups.length - seedCount;
    const lowRiskCount = startups.filter((startup) => startup.riskLevel === 'Low').length;
    const avgRunway = average(startups.map((startup) => startup.runway));

    container.innerHTML = `
        ${renderInsightRow('Capital deployed', formatCompactCurrency(totalFunding), 'Across active investment records')}
        ${renderInsightRow('Sector coverage', `${sectors.size} sectors`, 'Fintech, SaaS, Energy, Edtech and more')}
        ${renderInsightRow('Stage balance', `${seriesCount} scaled / ${seedCount} seed`, 'Useful for funding-round analysis')}
        ${renderInsightRow('Risk quality', `${lowRiskCount} low-risk startups`, `Average runway ${avgRunway.toFixed(1)} months`)}
    `;
}

function renderDiligenceAlerts(startups) {
    const container = document.getElementById('diligence-alerts');

    if (!container || !startups.length) {
        return;
    }

    const alerts = [...startups]
        .filter((startup) => startup.runway < 8 || startup.riskLevel === 'High')
        .sort((a, b) => (b.riskScore - a.riskScore) || (a.runway - b.runway))
        .slice(0, 5);

    container.innerHTML = alerts.map((startup) => `
        <a href="/pages/details.html?id=${startup.id}" class="alert-row">
            <span>
                <strong>${startup.name}</strong>
                <small>${startup.sector} • ${startup.city} • ${startup.fundingStage}</small>
            </span>
            <span class="badge ${getRiskBadge(startup.riskLevel)}">${startup.riskLevel}</span>
            <em>${startup.runway.toFixed(1)} mo runway</em>
        </a>
    `).join('');
}

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

function renderInsightRow(label, value, helper) {
    return `
        <div class="insight-row">
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function getRiskColor(level, alpha = 1) {
    const normalizedLevel = String(level || '').toLowerCase();

    if (normalizedLevel === 'low') {
        return `rgba(0, 255, 136, ${alpha})`;
    }

    if (normalizedLevel === 'medium') {
        return `rgba(255, 204, 0, ${alpha})`;
    }

    return `rgba(255, 77, 77, ${alpha})`;
}

function average(values) {
    if (!values.length) {
        return 0;
    }

    return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}
