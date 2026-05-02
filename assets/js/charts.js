// Chart.js global configurations and chart creators

const chartConfig = {
    defaults: {
        color: '#b0b3b8',
        font: {
            family: "'Inter', sans-serif"
        }
    }
};

function createBarChart(ctx, labels, data, label) {
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: 'rgba(0, 210, 255, 0.6)',
                borderColor: '#00d2ff',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
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
                backgroundColor: '#00d2ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'CAC ($)', color: '#b0b3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                y: { title: { display: true, text: 'LTV ($)', color: '#b0b3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
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
