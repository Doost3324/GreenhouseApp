import { CONFIG } from './config.js';

const SELECTORS = {
    light: '#sensor-light-value',
    temp: '#sensor-temp-value',
    soil: '#sensor-soil-value',
    air: '#sensor-air-value',
    statTemp: '#stat-temp',
    statAir: '#stat-air-hum',
    statSoil: '#stat-soil-hum',
    statLight: '#stat-light',
    plantName: '#plant-name',
    plantStatus: '#plant-status',
    lastSync: '#last-sync'
};

function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

/** Сире значення люкс → відсоток 0–100 */
export function luxToPercent(lux) {
    const value = Number(lux);
    if (Number.isNaN(value)) return 0;
    return Math.min(100, Math.round((value / CONFIG.lightLuxMax) * 100));
}

export function updateLastSync() {
    const el = document.querySelector(SELECTORS.lastSync);
    if (!el) return;
    const now = new Date();
    el.textContent = `Оновлення: ${now.toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })}`;
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

export function updateSensors(temp, airHum, soilHum, lightPercent) {
    setText(SELECTORS.light, `${lightPercent}%`);
    setText(SELECTORS.temp, `${temp}°C`);
    setText(SELECTORS.soil, `${soilHum}%`);
    setText(SELECTORS.air, `${airHum}%`);

    setText(SELECTORS.statTemp, `${temp}°C`);
    setText(SELECTORS.statAir, `${airHum}%`);
    setText(SELECTORS.statSoil, `${soilHum}%`);
    setText(SELECTORS.statLight, `${lightPercent}%`);

    updatePlantStatus(temp, airHum, soilHum);
}

export function setPlantName(name) {
    setText(SELECTORS.plantName, `Рослина: ${name}`);
}

export function parseLivePayload(data) {
    const d = CONFIG.defaults;
    return {
        temp: parseFloat(data.temp) || d.temp,
        airHum: parseFloat(data.humidity) || d.humidity,
        soilHum: parseFloat(data.soil_moisture) || d.soilMoisture,
        lightPercent: luxToPercent(data.light ?? d.lightLux)
    };
}
