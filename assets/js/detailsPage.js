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
        renderDeepDetails(startup, financialHistory);

        const chartValues = financialHistory.data.map((value) => Number((value / 10000000).toFixed(2)));
        const ctx = document.getElementById('historyChart').getContext('2d');
        const chartColor = getChartColor(startup.riskLevel);

        createLineChart(
            ctx,
            financialHistory.labels,
            chartValues,
            'Revenue (INR Cr)',
            chartColor
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
        row.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
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
        chip.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
        signalDetails.appendChild(chip);
    });

    document.getElementById('startup-thesis').textContent = buildThesis(startup, ltvCacRatio);
}

function renderDeepDetails(startup, financialHistory) {
    const latestRevenue = Number(financialHistory.data?.[financialHistory.data.length - 1] || 0);
    const firstRevenue = Number(financialHistory.data?.[0] || 0);
    const growthRate = firstRevenue > 0 ? ((latestRevenue - firstRevenue) / firstRevenue) * 100 : 0;
    const ltvCacRatio = startup.cac ? startup.ltv / startup.cac : 0;
    const impliedEquity = startup.valuation ? (startup.totalFunding / startup.valuation) * 100 : 0;

    document.getElementById('history-narrative').textContent = buildHistoryNarrative(startup, growthRate, latestRevenue);
    document.getElementById('history-growth-badge').textContent = `${growthRate.toFixed(1)}% six-month growth`;

    renderDetailRows('funding-readout', [
        ['Funding Stage', startup.fundingStage || 'N/A'],
        ['Total Funding', formatCompactCurrency(startup.totalFunding)],
        ['Current Valuation', formatCompactCurrency(startup.valuation)],
        ['Implied Equity', `${impliedEquity.toFixed(2)}%`],
        ['Likely Instrument', getInstrument(startup.fundingStage)]
    ]);

    renderDetailRows('market-readout', [
        ['Sector', startup.sector || 'N/A'],
        ['Market Trend', `${Number(startup.marketTrend || 0).toFixed(0)}/100`],
        ['Competitor Score', `${Number(startup.competitorScore || 0).toFixed(0)}/100`],
        ['Partner', startup.partnerName || 'N/A'],
        ['Deal Type', startup.dealType || 'N/A'],
        ['Impact Score', `${Number(startup.impactScore || 0).toFixed(1)}/10`]
    ]);

    renderDetailRows('risk-readout', [
        ['Decision Signal', getDecisionSignal(startup, ltvCacRatio)],
        ['Risk Score', `${Number(startup.riskScore || 0).toFixed(0)}/100`],
        ['Burn Rate', `${formatCompactCurrency(startup.burnRate)}/mo`],
        ['Runway', `${Number(startup.runway || 0).toFixed(1)} months`],
        ['Churn', `${Number(startup.churnRate || 0).toFixed(1)}%`],
        ['Reason', buildRiskReason(startup)]
    ]);

    renderSqlReadout(startup);
}

function renderDetailRows(containerId, rows) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    rows.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
        container.appendChild(row);
    });
}

function renderSqlReadout(startup) {
    const container = document.getElementById('sql-readout');
    const rows = [
        ['startups', `startup_id=${startup.id}, sector_id via ${startup.sector}`],
        ['financial_metrics', 'CAC, LTV, burn_rate, runway, churn_rate'],
        ['market_data', `trend=${Number(startup.marketTrend || 0).toFixed(0)}, competitor=${Number(startup.competitorScore || 0).toFixed(0)}`],
        ['partnerships', `${startup.partnerName || 'N/A'} (${startup.dealType || 'N/A'})`],
        ['risk_analysis', `risk_score=${Number(startup.riskScore || 0).toFixed(0)}`],
        ['investments', `${startup.fundingStage || 'N/A'} round, ${formatCompactCurrency(startup.totalFunding)} funding`]
    ];

    container.innerHTML = rows.map(([tableName, description]) => `
        <div>
            <strong>${escapeHtml(tableName)}</strong>
            <span>${escapeHtml(description)}</span>
        </div>
    `).join('');
}

function buildHistoryNarrative(startup, growthRate, latestRevenue) {
    const latestRevenueText = formatCompactCurrency(latestRevenue);

    if (growthRate >= 80) {
        return `${startup.name} shows breakout revenue movement: ${growthRate.toFixed(1)}% six-month growth and latest monthly revenue of ${latestRevenueText}.`;
    }

    if (growthRate >= 35) {
        return `${startup.name} shows steady scaling: ${growthRate.toFixed(1)}% six-month growth and latest monthly revenue of ${latestRevenueText}.`;
    }

    return `${startup.name} is still validating monetization: ${growthRate.toFixed(1)}% six-month growth and latest monthly revenue of ${latestRevenueText}.`;
}

function getDecisionSignal(startup, ltvCacRatio) {
    if (ltvCacRatio >= 5 && Number(startup.riskScore || 0) < 45 && Number(startup.runway || 0) >= 10) {
        return 'Invest: strong unit economics and controlled risk';
    }

    if (Number(startup.riskScore || 0) >= 65 || Number(startup.runway || 0) < 6) {
        return 'Review: risk or runway trigger is active';
    }

    return 'Watch: promising, but needs operating proof';
}

function buildRiskReason(startup) {
    if (startup.riskLevel === 'Low') {
        return 'Healthy runway, low churn, and manageable burn pressure.';
    }

    if (startup.riskLevel === 'High') {
        return 'Short runway, heavier execution risk, or elevated churn.';
    }

    return 'Moderate risk profile; monitor churn, burn, and next-round readiness.';
}

function getInstrument(stage) {
    if (stage === 'Seed' || stage === 'Pre-Seed') {
        return 'SAFE / Convertible Note';
    }

    return 'Preferred Equity';
}

function getChartColor(riskLevel) {
    if (riskLevel === 'High') {
        return '#ff6b6b';
    }

    if (riskLevel === 'Medium') {
        return '#ffb347';
    }

    return '#00ff88';
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

function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}
