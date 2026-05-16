/**
 * Sensor badges, stats, plant status, greenhouse stage sizing.
 */

const SELECTORS = {
    light: '#sensor-light-value',
    temp: '#sensor-temp-value',
    soil: '#sensor-soil-value',
    statTemp: '#stat-temp',
    statAir: '#stat-air-hum',
    statSoil: '#stat-soil-hum',
    plantName: '#plant-name',
    plantStatus: '#plant-status',
    lastSync: '#last-sync'
};

/** Matches square box.png (1∶1) */
const STAGE_RATIO = 1;

function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

export function updateLastSync() {
    const el = document.querySelector(SELECTORS.lastSync);
    if (!el) return;
    const now = new Date();
    el.textContent = `Оновлення: ${now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

export function updatePlantStatus(temp, airHum, soilHum) {
    const badge = document.querySelector(SELECTORS.plantStatus);
    if (!badge) return;

    const needsAttention =
        temp > 28 || temp < 16 || airHum < 35 || airHum > 85 || soilHum < 25;

    badge.classList.remove('status-optimal', 'status-warning');

    if (needsAttention) {
        badge.classList.add('status-warning');
        badge.textContent = 'Стан: Потребує уваги';
    } else {
        badge.classList.add('status-optimal');
        badge.textContent = 'Стан: Оптимальні умови';
    }
}

export function updateSensors(temp, airHum, soilHum, light) {
    setText(SELECTORS.light, `${light}%`);
    setText(SELECTORS.temp, `${temp}°C`);
    setText(SELECTORS.soil, `${soilHum}%`);

    setText(SELECTORS.statTemp, `${temp}°C`);
    setText(SELECTORS.statAir, `${airHum}%`);
    setText(SELECTORS.statSoil, `${soilHum}%`);

    updatePlantStatus(temp, airHum, soilHum);
}

export function setPlantName(name) {
    setText(SELECTORS.plantName, `Рослина: ${name}`);
}

export async function fetchMetrics() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const temp = parseFloat(data.temp) || 24;
        const airHum = parseFloat(data.humidity) || 62;
        const soilHum = parseFloat(data.soil_moisture) || 45;
        const light = parseFloat(data.light) || 85;

        updateSensors(temp, airHum, soilHum, light);
        updateLastSync();
    } catch (error) {
        console.warn('Дані з API недоступні:', error);
    }
}

/** Largest square that fits the panel — uses full width OR full height */
export function fitGreenhouseStage() {
    const container = document.getElementById('greenhouse-container');
    const stage = container?.querySelector('.greenhouse-stage');
    if (!container || !stage) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    const size = Math.floor(Math.min(cw, ch));

    stage.style.width = `${size}px`;
    stage.style.height = `${size}px`;
}

export function initGreenhouse() {
    setPlantName('Кокос');
    updateSensors(24, 62, 45, 85);
    updateLastSync();

    const img = document.querySelector('.greenhouse-image');
    img?.addEventListener('load', fitGreenhouseStage);

    fitGreenhouseStage();
    window.addEventListener('resize', fitGreenhouseStage);

    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => fitGreenhouseStage());
        const panel = document.querySelector('.greenhouse-panel');
        const box = document.getElementById('greenhouse-container');
        if (panel) ro.observe(panel);
        if (box) ro.observe(box);
    }

    requestAnimationFrame(() => requestAnimationFrame(fitGreenhouseStage));
}
