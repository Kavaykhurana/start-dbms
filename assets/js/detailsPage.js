import { investmentApi } from './api.js';

const LOCAL_STARTUPS_KEY = 'ventureAnalytics.customStartups';
const HISTORY_LABELS = ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'];

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const startupId = urlParams.get('id') || '1';

    try {
        const payload = startupId.startsWith('local-')
            ? getLocalStartupDetails(startupId)
            : await investmentApi.getStartup(Number(startupId));

        if (!payload) {
            throw new Error('Startup not found.');
        }

        const { startup, financialHistory } = payload;

        document.getElementById('startup-name').textContent = startup.name;

        const badge = document.getElementById('startup-badge');
        badge.textContent = startup.fundingStage;
        badge.classList.add(getRiskBadge(startup.riskLevel));

        document.getElementById('val-cac').textContent = formatCurrency(startup.cac);
        document.getElementById('val-ltv').textContent = formatCurrency(startup.ltv);
        document.getElementById('val-burn').textContent = `${formatCompactCurrency(startup.burnRate)}/mo`;
        document.getElementById('val-runway').textContent = `${startup.runway.toFixed(1)} Months`;
        document.getElementById('startup-description').textContent = startup.description || `${startup.name} is a ${startup.sector} startup based in ${startup.city || 'India'}.`;

        renderProfile(startup);
        renderSignals(startup);

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

function renderProfile(startup) {
    const profileDetails = document.getElementById('profile-details');
    const details = [
        ['Location', [startup.city, startup.state].filter(Boolean).join(', ') || 'India'],
        ['Founded', startup.foundedYear || 'N/A'],
        ['Founders', startup.founders || 'N/A'],
        ['Business Model', startup.businessModel || 'N/A'],
        ['Revenue Model', startup.revenueModel || 'N/A'],
        ['Employees', Number(startup.employeeCount || 0).toLocaleString('en-IN')],
        ['Valuation', formatCompactCurrency(startup.valuation)],
        ['Total Funding', formatCompactCurrency(startup.totalFunding)]
    ];

    profileDetails.innerHTML = '';
    details.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        profileDetails.appendChild(row);
    });
}

function renderSignals(startup) {
    const signalDetails = document.getElementById('signal-details');
    const ltvCacRatio = startup.cac ? startup.ltv / startup.cac : 0;
    const signals = [
        ['LTV/CAC', `${ltvCacRatio.toFixed(2)}x`],
        ['Risk Score', Number(startup.riskScore || 0).toFixed(0)],
        ['Churn', `${Number(startup.churnRate || 0).toFixed(1)}%`],
        ['Customers', Number(startup.customerCount || 0).toLocaleString('en-IN')],
        ['Market Trend', `${Number(startup.marketTrend || 0).toFixed(0)}/100`],
        ['Partner Deal', `${startup.partnerName || 'N/A'} • ${startup.dealType || 'N/A'}`]
    ];

    signalDetails.innerHTML = '';
    signals.forEach(([label, value]) => {
        const chip = document.createElement('div');
        chip.className = 'metric-chip';
        chip.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
        signalDetails.appendChild(chip);
    });

    document.getElementById('startup-thesis').textContent = buildThesis(startup, ltvCacRatio);
}

function buildThesis(startup, ltvCacRatio) {
    if (startup.riskLevel === 'Low') {
        return `${startup.name} looks investment-ready because runway is healthy, churn is controlled, and LTV/CAC is ${ltvCacRatio.toFixed(1)}x.`;
    }

    if (startup.riskLevel === 'High') {
        return `${startup.name} needs tighter validation before investment because runway and execution risk are elevated.`;
    }

    return `${startup.name} is a watchlist candidate: market signal is useful, but the next decision should depend on churn and burn improvement.`;
}

function getLocalStartupDetails(startupId) {
    const startup = getLocalStartups().find((item) => item.id === startupId);

    if (!startup) {
        return null;
    }

    return {
        startup,
        financialHistory: {
            labels: HISTORY_LABELS,
            data: startup.history || []
        }
    };
}

function getLocalStartups() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_STARTUPS_KEY) || '[]');
    } catch (_error) {
        return [];
    }
}
