import { investmentApi } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const analytics = await investmentApi.getAnalytics();

        const scatterCtx = document.getElementById('scatterChart').getContext('2d');
        const scatterData = analytics.scatter.points.map((point) => ({
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
    } catch (error) {
        renderPageError('.main-content', error.message);
    }
});
