/**
 * Chart.js analytics tab — line chart + CSV report download.
 */

let analyticsChart = null;

export function getMockHistory() {
    const labels = [];
    const temps = [];
    const humidity = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(d.getHours() - i);
        labels.push(`${String(d.getHours()).padStart(2, '0')}:00`);
        temps.push(20 + Math.sin(i / 3) * 4 + Math.random() * 2);
        humidity.push(55 + Math.cos(i / 4) * 12 + Math.random() * 5);
    }

    return { labels, temps, humidity };
}

/**
 * Chart.js line chart — temperature & humidity history
 *
 * const ctx = document.getElementById('analyticsChart').getContext('2d');
 * analyticsChart = new Chart(ctx, {
 *     type: 'line',
 *     data: {
 *         labels: ['08:00', '09:00', ...],
 *         datasets: [
 *             {
 *                 label: 'Температура (°C)',
 *                 data: [22, 23, 24, ...],
 *                 borderColor: '#ef5350',
 *                 backgroundColor: 'rgba(239, 83, 80, 0.08)',
 *                 tension: 0.4,
 *                 fill: true,
 *                 yAxisID: 'y'
 *             },
 *             {
 *                 label: 'Вологість повітря (%)',
 *                 data: [60, 62, 58, ...],
 *                 borderColor: '#42a5f5',
 *                 backgroundColor: 'rgba(66, 165, 245, 0.08)',
 *                 tension: 0.4,
 *                 fill: true,
 *                 yAxisID: 'y1'
 *             }
 *         ]
 *     },
 *     options: {
 *         responsive: true,
 *         maintainAspectRatio: false,
 *         interaction: { mode: 'index', intersect: false },
 *         plugins: { legend: { position: 'top' } },
 *         scales: {
 *             y: {
 *                 type: 'linear',
 *                 position: 'left',
 *                 title: { display: true, text: '°C' }
 *             },
 *             y1: {
 *                 type: 'linear',
 *                 position: 'right',
 *                 grid: { drawOnChartArea: false },
 *                 title: { display: true, text: '%' },
 *                 min: 0,
 *                 max: 100
 *             }
 *         }
 *     }
 * });
 */
export function initAnalyticsChart() {
    const canvas = document.getElementById('analyticsChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (analyticsChart) {
        analyticsChart.resize();
        return;
    }

    const { labels, temps, humidity } = getMockHistory();
    const ctx = canvas.getContext('2d');

    analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Температура (°C)',
                    data: temps,
                    borderColor: '#ef5350',
                    backgroundColor: 'rgba(239, 83, 80, 0.08)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: 'Вологість повітря (%)',
                    data: humidity,
                    borderColor: '#42a5f5',
                    backgroundColor: 'rgba(66, 165, 245, 0.08)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { family: "'Inter', system-ui, sans-serif" }, padding: 16 }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    position: 'left',
                    title: { display: true, text: '°C', color: '#6b7280' },
                    grid: { color: 'rgba(0,0,0,0.04)' }
                },
                y1: {
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: { display: true, text: '%', color: '#6b7280' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

export function initCharts() {
    initAnalyticsChart();
}
