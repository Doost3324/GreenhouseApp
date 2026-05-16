import { CONFIG } from '../core/config.js';

let cachedHistory = null;

/** Тестова історія з data/mock-history.json */
export async function loadMockHistory() {
    if (cachedHistory) return cachedHistory;

    try {
        const res = await fetch(CONFIG.mockHistoryUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        cachedHistory = await res.json();
        return cachedHistory;
    } catch (err) {
        console.warn('mock-history недоступний, використовую резервні дані:', err);
        cachedHistory = buildFallbackHistory();
        return cachedHistory;
    }
}

function buildFallbackHistory() {
    const labels = [];
    const temperature = [];
    const humidity = [];
    const soilMoisture = [];
    const light = [];

    for (let i = 23; i >= 0; i--) {
        const h = (new Date().getHours() - i + 24) % 24;
        labels.push(`${String(h).padStart(2, '0')}:00`);
        temperature.push(22 + Math.sin(i / 3) * 3);
        humidity.push(58 + Math.cos(i / 4) * 10);
        soilMoisture.push(44 + Math.sin(i / 5) * 6);
        light.push(60 + Math.sin(i / 2) * 20);
    }

    return { labels, temperature, humidity, soilMoisture, light };
}
