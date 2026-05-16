import { CONFIG } from '../core/config.js';
import { parseLivePayload, updateSensors, updateLastSync } from '../core/sensors.js';

export async function fetchMetrics() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        const metrics = parseLivePayload(data);
        updateSensors(metrics.temp, metrics.airHum, metrics.soilHum, metrics.lightPercent);
        updateLastSync();
        return metrics;
    } catch (error) {
        console.warn('Дані з API недоступні:', error);
        return null;
    }
}

export function startMetricsPolling() {
    fetchMetrics();
    return setInterval(fetchMetrics, CONFIG.metricsPollMs);
}
