// Chart.js global configurations and chart creators

const chartConfig = {
    defaults: {
        color: '#b0b3b8',
        font: {
            family: "'Inter', sans-serif"
        }
    }
};

const sharedChartOptions = {
    animation: {
        duration: 850,
        easing: 'easeOutQuart'
    },
    interaction: {
        intersect: false,
        mode: 'nearest'
    },
    resizeDelay: 80
};

const chartColors = ['#00d2ff', '#00ff88', '#ffb347', '#ff6b6b', '#b388ff', '#5eead4', '#f472b6'];

if (window.Chart) {
    Chart.defaults.color = chartConfig.defaults.color;
    Chart.defaults.font.family = chartConfig.defaults.font.family;
}

function createBarChart(ctx, labels, data, label, colors = ['rgba(0, 210, 255, 0.6)']) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: labels.map((_, index) => colors[index % colors.length]),
                borderColor: '#00d2ff',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            ...sharedChartOptions,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function createDoughnutChart(ctx, labels, data, label) {
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label,
                data,
                backgroundColor: labels.map((_, index) => chartColors[index % chartColors.length]),
                borderColor: 'rgba(7, 11, 18, 0.8)',
                borderWidth: 3
            }]
        },
        options: {
            ...sharedChartOptions,
            cutout: '64%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 10,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function createLineChart(ctx, labels, data, label, color = '#00ff88') {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '22',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: color
            }]
        },
        options: {
            ...sharedChartOptions,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function createScatterPlot(ctx, data, label) {
    return new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: label,
                data: data,
                backgroundColor: data.map((_, index) => chartColors[index % chartColors.length]),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            ...sharedChartOptions,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'CAC / Funding (INR)', color: '#b0b3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { title: { display: true, text: 'LTV / Valuation (INR)', color: '#b0b3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label(context) {
                            const point = context.raw;
                            const name = point.label ? `${point.label}: ` : '';
                            return `${name}${point.x}, ${point.y}`;
                        }
                    }
                }
            }
        }
    });
}

function createRadarChart(ctx, labels, datasets) {
    return new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            ...sharedChartOptions,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: { color: '#b0b3b8' },
                    ticks: { display: false }
                }
            }
        }
    });
}
