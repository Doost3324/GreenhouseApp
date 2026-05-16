/**
 * Розмір сцени теплиці та ініціалізація візуалізації.
 */
import { CONFIG } from '../core/config.js';
import { setPlantName, updateSensors, updateLastSync } from '../core/sensors.js';
import { initPlantViewer } from './plant-viewer.js';

const STAGE_EDGE_MARGIN = 4;

export function fitGreenhouseStage() {
    const container = document.getElementById('greenhouse-container');
    const stage = container?.querySelector('.greenhouse-stage');
    if (!container || !stage) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    const availW = Math.max(0, cw - STAGE_EDGE_MARGIN * 2);
    const availH = Math.max(0, ch - STAGE_EDGE_MARGIN * 2);
    const size = Math.floor(Math.min(availW, availH));

    stage.style.width = `${size}px`;
    stage.style.height = `${size}px`;
}

export function initGreenhouse() {
    const d = CONFIG.defaults;
    setPlantName('Сукулент');
    initPlantViewer();
    updateSensors(d.temp, d.humidity, d.soilMoisture, Math.round((d.lightLux / CONFIG.lightLuxMax) * 100));
    updateLastSync();

    document.querySelector('.greenhouse-box--back')?.addEventListener('load', fitGreenhouseStage);
    fitGreenhouseStage();
    window.addEventListener('resize', fitGreenhouseStage);

    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(fitGreenhouseStage);
        document.querySelector('.greenhouse-panel') && ro.observe(document.querySelector('.greenhouse-panel'));
        document.getElementById('greenhouse-container') && ro.observe(document.getElementById('greenhouse-container'));
    }

    requestAnimationFrame(() => requestAnimationFrame(fitGreenhouseStage));
}
