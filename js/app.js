/**
 * Точка входу застосунку Greenhouse.
 */
import { initTheme } from './ui/theme.js';
import { initDate } from './ui/date.js';
import { initTabs } from './ui/tabs.js';
import { initControls } from './ui/controls.js';
import { initGreenhouse, fitGreenhouseStage } from './monitoring/greenhouse.js';
import { initCharts } from './analytics/charts.js';
import { initReportDownload } from './report/report.js';
import { initEffects } from './monitoring/effects.js';
import { startMetricsPolling } from './api/metrics.js';
import { updateSensors } from './core/sensors.js';

function bootstrap() {
    initTheme();
    initEffects();
    initDate();
    initGreenhouse();
    initControls();
    initReportDownload();

    initTabs({
        onAnalyticsShow: () => initCharts(),
        onMonitoringShow: () => requestAnimationFrame(fitGreenhouseStage)
    });

    startMetricsPolling();
}

document.addEventListener('DOMContentLoaded', bootstrap);

window.updateSensors = updateSensors;
