import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const analytics = await investmentApi.getAnalytics();

        const scatterCtx = document.getElementById('scatterChart').getContext('2d');
        const scatterData = analytics.scatter.points.map((point) => ({
            label: point.label,
            x: point.x,
            y: point.y
        }));
        createScatterPlot(scatterCtx, scatterData, 'Startups (CAC vs LTV)');

        const burnCtx = document.getElementById('burnRunwayChart').getContext('2d');
        new Chart(burnCtx, {
            type: 'bar',
            data: {
                labels: analytics.burnRunway.labels,
                datasets: [
                    {
                        label: 'Burn Rate (INR Lakhs)',
                        data: analytics.burnRunway.burnRateLakhs,
                        backgroundColor: '#ff4d4d'
                    },
                    {
                        label: 'Runway (Months)',
                        data: analytics.burnRunway.runwayMonths,
                        backgroundColor: '#00d2ff'
                    }
                ]
            },
            options: {
                animation: {
                    duration: 850,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                resizeDelay: 80,
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });

        const radarCtx = document.getElementById('radarChart').getContext('2d');
        createRadarChart(radarCtx, analytics.radar.labels, analytics.radar.datasets);

        if (analytics.fundingByStage) {
            const stageCtx = document.getElementById('stageFundingChart').getContext('2d');
            createDoughnutChart(stageCtx, analytics.fundingByStage.labels, analytics.fundingByStage.data, 'Funding (INR Cr)');
        }

        if (analytics.riskBySector) {
            const riskCtx = document.getElementById('sectorRiskChart').getContext('2d');
            createBarChart(riskCtx, analytics.riskBySector.labels, analytics.riskBySector.data, 'Average Risk Score');
        }

        if (analytics.valuationFunding) {
            const valuationCtx = document.getElementById('valuationFundingChart').getContext('2d');
            createScatterPlot(
                valuationCtx,
                analytics.valuationFunding.points,
                'Startups (Funding Cr vs Valuation Cr)'
            );
        }

        if (analytics.churnBySector) {
            const churnCtx = document.getElementById('churnSectorChart').getContext('2d');
            createBarChart(churnCtx, analytics.churnBySector.labels, analytics.churnBySector.data, 'Average Churn (%)');
        }

        renderAnalyticsTakeaways(analytics);
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});

function renderAnalyticsTakeaways(analytics) {
    const container = document.getElementById('analytics-takeaways');

    if (!container) {
        return;
    }

    const efficiencyLeader = getHighestRatioPoint(analytics.scatter.points);
    const shortestRunway = getIndexedMinimum(analytics.burnRunway.labels, analytics.burnRunway.runwayMonths);
    const highestRiskSector = getIndexedMaximum(analytics.riskBySector.labels, analytics.riskBySector.data);
    const highestChurnSector = getIndexedMaximum(analytics.churnBySector.labels, analytics.churnBySector.data);
    const valuationLeader = getHighestRatioPoint(analytics.valuationFunding.points);

    container.innerHTML = `
        ${renderTakeaway('Best unit economics', efficiencyLeader.label, `${efficiencyLeader.ratio.toFixed(2)}x LTV/CAC`)}
        ${renderTakeaway('Shortest runway', shortestRunway.label, `${shortestRunway.value.toFixed(1)} months`)}
        ${renderTakeaway('Highest sector risk', highestRiskSector.label, `${highestRiskSector.value.toFixed(1)} risk score`)}
        ${renderTakeaway('Highest churn sector', highestChurnSector.label, `${highestChurnSector.value.toFixed(1)}% churn`)}
        ${renderTakeaway('Valuation multiple leader', valuationLeader.label, `${valuationLeader.ratio.toFixed(1)}x valuation/funding`)}
    `;
}

function renderTakeaway(label, value, helper) {
    return `
        <div class="analytics-takeaway">
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${helper}</small>
        </div>
    `;
}

function getHighestRatioPoint(points = []) {
    return [...points]
        .map((point) => ({
            ...point,
            ratio: Number(point.y || 0) / Math.max(Number(point.x || 0), 1)
        }))
        .sort((a, b) => b.ratio - a.ratio)[0] || { label: '-', ratio: 0 };
}

function getIndexedMaximum(labels = [], values = []) {
    return labels
        .map((label, index) => ({ label, value: Number(values[index] || 0) }))
        .sort((a, b) => b.value - a.value)[0] || { label: '-', value: 0 };
}

function getIndexedMinimum(labels = [], values = []) {
    return labels
        .map((label, index) => ({ label, value: Number(values[index] || 0) }))
        .sort((a, b) => a.value - b.value)[0] || { label: '-', value: 0 };
}
