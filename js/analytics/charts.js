/**
 * Аналітика: окремі графіки + режим нашарування (ДАНІ З БД).
 */
import { getChartTheme, buildGradient, hexToRgba } from './chart-theme.js';

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
        yAxis: 'yTemp'
    },
    humidity: {
        id: CHART_IDS.humidity,
        label: 'Вологість повітря (%)',
        color: '#29b6f6',
        yAxis: 'yPct',
        max: 100
    },
    soilMoisture: {
        id: CHART_IDS.soil,
        label: 'Вологість ґрунту (%)',
        color: '#66bb6a',
        yAxis: 'yPct',
        max: 100
    },
    light: {
        id: CHART_IDS.light,
        label: 'Освітленість (%)',
        color: '#ffa726',
        yAxis: 'yPct',
        max: 100
    }
};

const charts = {};
let historyData = null;
let overlayMode = false;

// НОВА ФУНКЦІЯ: Завантаження реальної історії з БД
async function loadRealHistory() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) {
            throw new Error('Помилка сервера при завантаженні графіків');
        }
        return await response.json();
    } catch (error) {
        console.error("Не вдалося завантажити графіки:", error);
        // Запобіжник: якщо БД недоступна, повертаємо порожні масиви, щоб графіки не впали
        return { labels: [], temperature: [], humidity: [], soilMoisture: [], light: [] };
    }
}

function themedScales(theme, yLabel, yMax, extra = {}) {
    const yScale = {
        grid: { color: theme.grid, drawBorder: false },
        border: { display: false },
        ticks: {
            font: { size: 10, family: theme.font },
            color: theme.text,
            padding: 6
        },
        ...extra
    };
    if (yLabel) {
        yScale.title = {
            display: true,
            text: yLabel,
            color: theme.text,
            font: { size: 10, weight: '600' }
        };
    }
    if (yMax != null) {
        yScale.min = 0;
        yScale.max = yMax;
    }

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme.isDark ? '#1e2420' : '#fff',
                titleColor: theme.isDark ? '#f2f2f7' : '#1d1d1f',
                bodyColor: theme.text,
                borderColor: theme.border,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 10,
                displayColors: true
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    font: { size: 10, family: theme.font },
                    color: theme.textMuted,
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 7
                }
            },
            y: yScale
        }
    };
}

function makeDataset(key, data) {
    const meta = SERIES[key];
    return {
        label: meta.label,
        data,
        borderColor: meta.color,
        backgroundColor: (ctx) => buildGradient(ctx.chart.ctx, meta.color, ctx.chart.chartArea),
        borderWidth: 2.5,
        tension: 0.42,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: meta.color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2
    };
}

function createSingleChart(canvasId, key, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return null;

    const meta = SERIES[key];
    const theme = getChartTheme();
    const yLabel = meta.yAxis === 'yPct' ? '%' : '°C';

    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: historyData.labels,
            datasets: [{ ...makeDataset(key, values), yAxisID: 'y' }]
        },
        options: themedScales(theme, yLabel, meta.max)
    });
}

function createCombinedChart() {
    const canvas = document.getElementById(CHART_IDS.combined);
    if (!canvas || typeof Chart === 'undefined') return null;

    const theme = getChartTheme();

    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: historyData.labels,
            datasets: [
                { ...makeDataset('temperature', historyData.temperature), yAxisID: 'yTemp', borderWidth: 2.5 },
                {
                    ...makeDataset('humidity', historyData.humidity),
                    yAxisID: 'yPct',
                    borderWidth: 2,
                    borderColor: SERIES.humidity.color
                },
                {
                    ...makeDataset('soilMoisture', historyData.soilMoisture),
                    yAxisID: 'yPct',
                    borderWidth: 2,
                    borderColor: SERIES.soilMoisture.color
                },
                {
                    ...makeDataset('light', historyData.light),
                    yAxisID: 'yPct',
                    borderWidth: 2,
                    borderColor: SERIES.light.color
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 11, family: theme.font },
                        color: theme.text,
                        padding: 16
                    }
                },
                tooltip: themedScales(theme).plugins.tooltip
            },
            scales: {
                x: themedScales(theme).scales.x,
                yTemp: {
                    position: 'left',
                    grid: { color: theme.grid, drawBorder: false },
                    border: { display: false },
                    ticks: { color: hexToRgba(SERIES.temperature.color, 0.9), font: { size: 10 } },
                    title: { display: true, text: '°C', color: SERIES.temperature.color, font: { size: 10, weight: '600' } }
                },
                yPct: {
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false },
                    border: { display: false },
                    ticks: { color: theme.text, font: { size: 10 } },
                    title: { display: true, text: '%', color: theme.text, font: { size: 10, weight: '600' } }
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

    // ЗМІНЕНО: Тепер ми чекаємо дані з бази, а не з моку
    historyData = await loadRealHistory();

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