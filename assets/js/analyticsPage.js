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
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});
