/**
 * Аналітика: окремі графіки + режим нашарування.
 */
import { loadMockHistory } from '../data/history.js';

const CHART_IDS = {
    temp: 'chart-temp',
    humidity: 'chart-humidity',
    soil: 'chart-soil',
    light: 'chart-light',
    combined: 'chart-combined'
};

const SERIES = {
    temperature: {
        id: CHART_IDS.temp,
        label: 'Температура (°C)',
        color: '#ef5350',
        fill: 'rgba(239, 83, 80, 0.1)',
        yAxis: 'yTemp'
    },
    humidity: {
        id: CHART_IDS.humidity,
        label: 'Вологість повітря (%)',
        color: '#42a5f5',
        fill: 'rgba(66, 165, 245, 0.1)',
        yAxis: 'yPct',
        max: 100
    },
    soilMoisture: {
        id: CHART_IDS.soil,
        label: 'Вологість ґрунту (%)',
        color: '#8d6e63',
        fill: 'rgba(141, 110, 99, 0.12)',
        yAxis: 'yPct',
        max: 100
    },
    light: {
        id: CHART_IDS.light,
        label: 'Освітленість (%)',
        color: '#ffb300',
        fill: 'rgba(255, 179, 0, 0.12)',
        yAxis: 'yPct',
        max: 100
    }
};

const charts = {};
let historyData = null;
let overlayMode = false;

function baseOptions(yLabel, yMax) {
    const yScale = {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: { font: { size: 10 } }
    };
    if (yLabel) yScale.title = { display: true, text: yLabel, color: '#6e6e73', font: { size: 10 } };
    if (yMax != null) {
        yScale.min = 0;
        yScale.max = yMax;
    }

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: 'rgba(0,0,0,0.04)' },
                ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }
            },
            y: yScale
        }
    };
}

function makeDataset(key, data, opts = {}) {
    const meta = SERIES[key];
    return {
        label: meta.label,
        data,
        borderColor: meta.color,
        backgroundColor: meta.fill,
        borderWidth: 2,
        tension: 0.38,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
        yAxisID: opts.yAxisID || 'y',
        ...opts.extra
    };
}

function createSingleChart(canvasId, key, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const meta = SERIES[key];
    const yLabel = meta.yAxis === 'yPct' ? '%' : '°C';

    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: historyData.labels,
            datasets: [makeDataset(key, values)]
        },
        options: baseOptions(yLabel, meta.max)
    });
}

function createCombinedChart() {
    const canvas = document.getElementById(CHART_IDS.combined);
    if (!canvas || typeof Chart === 'undefined') return null;

    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: historyData.labels,
            datasets: [
                { ...makeDataset('temperature', historyData.temperature, { extra: { yAxisID: 'yTemp' } }) },
                { ...makeDataset('humidity', historyData.humidity, { extra: { yAxisID: 'yPct', borderWidth: 1.5 } }) },
                { ...makeDataset('soilMoisture', historyData.soilMoisture, { extra: { yAxisID: 'yPct', borderWidth: 1.5 } }) },
                { ...makeDataset('light', historyData.light, { extra: { yAxisID: 'yPct', borderWidth: 1.5 } }) }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11 }, boxWidth: 12, padding: 14 }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { font: { size: 10 }, maxTicksLimit: 10 }
                },
                yTemp: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: '°C', color: '#ef5350' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                yPct: {
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: { display: true, text: '%', color: '#6e6e73' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function setViewMode(overlay) {
    overlayMode = overlay;
    const split = document.getElementById('analytics-split');
    const combinedWrap = document.getElementById('analytics-overlay');
    const btn = document.getElementById('btn-chart-overlay');

    split?.classList.toggle('is-hidden', overlay);
    combinedWrap?.classList.toggle('is-hidden', !overlay);
    btn?.classList.toggle('is-active', overlay);
    btn?.setAttribute('aria-pressed', String(overlay));
    if (btn) {
        btn.textContent = overlay ? 'Показати окремо' : 'Показати разом (нашарування)';
    }

    if (overlay) charts.combined?.resize();
    else Object.values(charts).forEach((c) => c && c !== charts.combined && c.resize());
}

function bindOverlayToggle() {
    const btn = document.getElementById('btn-chart-overlay');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', () => setViewMode(!overlayMode));
}

export async function initCharts() {
    if (typeof Chart === 'undefined') return;

    historyData = await loadMockHistory();

    if (!charts.temperature) {
        charts.temperature = createSingleChart(CHART_IDS.temp, 'temperature', historyData.temperature);
        charts.humidity = createSingleChart(CHART_IDS.humidity, 'humidity', historyData.humidity);
        charts.soil = createSingleChart(CHART_IDS.soil, 'soilMoisture', historyData.soilMoisture);
        charts.light = createSingleChart(CHART_IDS.light, 'light', historyData.light);
        charts.combined = createCombinedChart();
        bindOverlayToggle();
    } else {
        Object.values(charts).forEach((c) => c?.resize());
    }

    setViewMode(overlayMode);
}

export function getHistoryForReport() {
    return historyData;
}
