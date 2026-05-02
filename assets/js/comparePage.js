import { investmentApi } from './api.js';

const state = {
    startups: [],
    selectedIds: [],
    scoreChart: null,
    capitalChart: null
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const payload = await investmentApi.getStartups();
        state.startups = payload.items || [];
        state.selectedIds = state.startups.slice(0, 3).map((startup) => String(startup.id));

        bindSelectors();
        renderComparison();
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function bindSelectors() {
    ['compare-a', 'compare-b', 'compare-c'].forEach((id, index) => {
        const select = document.getElementById(id);
        select.innerHTML = state.startups
            .map((startup) => `<option value="${startup.id}">${escapeHtml(startup.name)} - ${escapeHtml(startup.sector)}</option>`)
            .join('');
        select.value = state.selectedIds[index] || String(state.startups[index]?.id || '');

        select.addEventListener('change', () => {
            state.selectedIds[index] = select.value;
            renderComparison();
        });
    });
}

function renderComparison() {
    const selected = state.selectedIds
        .map((id) => state.startups.find((startup) => String(startup.id) === String(id)))
        .filter(Boolean);

    renderSummary(selected);
    renderCharts(selected);
    renderCards(selected);
}

function renderSummary(selected) {
    const bestByScore = [...selected].sort((a, b) => getDecisionScore(b) - getDecisionScore(a))[0];
    const bestRunway = [...selected].sort((a, b) => Number(b.runway || 0) - Number(a.runway || 0))[0];
    const lowestRisk = [...selected].sort((a, b) => Number(a.riskScore || 0) - Number(b.riskScore || 0))[0];

    document.getElementById('comparison-summary').innerHTML = `
        <div class="glass-card comparison-summary-card">
            ${renderSummaryItem('Best overall', bestByScore?.name || '-', bestByScore ? `${getDecisionScore(bestByScore).toFixed(1)}/100 decision index` : 'Select startups')}
            ${renderSummaryItem('Best runway', bestRunway?.name || '-', bestRunway ? `${Number(bestRunway.runway || 0).toFixed(1)} months` : 'Select startups')}
            ${renderSummaryItem('Lowest risk', lowestRisk?.name || '-', lowestRisk ? `Risk score ${Number(lowestRisk.riskScore || 0).toFixed(0)}` : 'Select startups')}
        </div>
    `;
}

function renderCards(selected) {
    const grid = document.getElementById('comparison-grid');

    grid.innerHTML = selected.map((startup, index) => {
        const decisionScore = getDecisionScore(startup);
        const signal = getSignal(decisionScore, startup);
        const ltvCacRatio = Number(startup.ltvCacRatio || 0);
        const runway = Number(startup.runway || 0);
        const riskScore = Number(startup.riskScore || 0);

        return `
            <article class="glass-card comparison-card">
                <div class="comparison-rank">Option ${index + 1}</div>
                <div class="comparison-title">
                    <div>
                        <h2>${escapeHtml(startup.name)}</h2>
                        <p>${escapeHtml(startup.sector)} • ${escapeHtml(startup.fundingStage)} • ${escapeHtml([startup.city, startup.state].filter(Boolean).join(', ') || 'India')}</p>
                    </div>
                    <strong>${decisionScore.toFixed(1)}</strong>
                </div>
                <div class="comparison-verdict ${signal.className}">
                    <span>${signal.label}</span>
                    <small>${signal.reason}</small>
                </div>
                <div class="comparison-metric-list">
                    ${renderComparisonMetric('Funding', formatCompactCurrency(startup.totalFunding), 'investments.invested_amount_inr')}
                    ${renderComparisonMetric('Valuation', formatCompactCurrency(startup.valuation), 'startups.current_valuation_inr')}
                    ${renderComparisonMetric('Runway', `${runway.toFixed(1)} mo`, 'financial_metrics.runway_months')}
                    ${renderComparisonMetric('LTV/CAC', `${ltvCacRatio.toFixed(2)}x`, 'financial_metrics.ltv_inr / cac_inr')}
                    ${renderComparisonMetric('Risk', riskScore.toFixed(0), 'risk_analysis.risk_score')}
                    ${renderComparisonMetric('Risk Level', startup.riskLevel, 'computed CASE expression')}
                </div>
                <a class="btn btn-secondary full-width-action" href="/details?id=${startup.id}">Open Details</a>
            </article>
        `;
    }).join('');
}

function renderCharts(selected) {
    if (!window.Chart) {
        return;
    }

    const labels = selected.map((startup) => startup.name);
    const decisionScores = selected.map((startup) => getDecisionScore(startup));
    const riskScores = selected.map((startup) => Number(startup.riskScore || 0));
    const fundingCr = selected.map((startup) => Number(startup.totalFunding || 0) / 10000000);
    const valuationCr = selected.map((startup) => Number(startup.valuation || 0) / 10000000);

    state.scoreChart?.destroy();
    state.capitalChart?.destroy();

    state.scoreChart = new Chart(document.getElementById('comparison-score-chart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Decision Index',
                    data: decisionScores,
                    backgroundColor: 'rgba(0, 210, 255, 0.65)',
                    borderColor: '#00d2ff',
                    borderWidth: 1,
                    borderRadius: 8
                },
                {
                    label: 'Risk Score',
                    data: riskScores,
                    backgroundColor: 'rgba(255, 107, 107, 0.55)',
                    borderColor: '#ff6b6b',
                    borderWidth: 1,
                    borderRadius: 8
                }
            ]
        },
        options: getChartOptions('Score')
    });

    state.capitalChart = new Chart(document.getElementById('comparison-capital-chart'), {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Funding (Cr)',
                    data: fundingCr,
                    backgroundColor: 'rgba(0, 255, 136, 0.58)',
                    borderColor: '#00ff88',
                    borderWidth: 1,
                    borderRadius: 8
                },
                {
                    label: 'Valuation (Cr)',
                    data: valuationCr,
                    backgroundColor: 'rgba(255, 179, 71, 0.55)',
                    borderColor: '#ffb347',
                    borderWidth: 1,
                    borderRadius: 8
                }
            ]
        },
        options: getChartOptions('INR Crore')
    });
}

function getChartOptions(yTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeOutQuart'
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#b0b3b8' }
            },
            y: {
                beginAtZero: true,
                title: { display: true, text: yTitle, color: '#b0b3b8' },
                grid: { color: 'rgba(255,255,255,0.06)' },
                ticks: { color: '#b0b3b8' }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#b0b3b8',
                    usePointStyle: true,
                    boxWidth: 10
                }
            }
        }
    };
}

function getDecisionScore(startup) {
    const ltvScore = Math.min(45, Number(startup.ltvCacRatio || 0) * 7.5);
    const runwayScore = Math.min(25, Number(startup.runway || 0) * 1.35);
    const riskScore = Math.max(0, (100 - Number(startup.riskScore || 50)) * 0.30);

    return ltvScore + runwayScore + riskScore;
}

function getSignal(decisionScore, startup) {
    const runway = Number(startup.runway || 0);
    const risk = Number(startup.riskScore || 0);

    if (decisionScore >= 68 && runway >= 10 && risk < 45) {
        return { label: 'Invest first', reason: 'Best mix of unit economics, risk, and runway.', className: 'decision-invest' };
    }

    if (decisionScore >= 50 && risk < 65) {
        return { label: 'Keep in diligence', reason: 'Good candidate, but needs monitoring.', className: 'decision-watch' };
    }

    return { label: 'Review deeply', reason: 'Risk, runway, or economics need improvement.', className: 'decision-review' };
}

function renderSummaryItem(label, value, helper) {
    return `
        <div>
            <span>${label}</span>
            <strong>${escapeHtml(value)}</strong>
            <small>${escapeHtml(helper)}</small>
        </div>
    `;
}

function renderComparisonMetric(label, value, source) {
    return `
        <div>
            <span>${label}</span>
            <strong>${escapeHtml(value)}</strong>
            <small>${escapeHtml(source)}</small>
        </div>
    `;
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
