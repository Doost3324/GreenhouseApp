import { initDate } from './js/date.js';
import { initTabs } from './js/tabs.js';
import { initControls } from './js/controls.js';
import { initGreenhouse, fetchMetrics, updateSensors, fitGreenhouseStage } from './js/greenhouse.js';
import { initCharts } from './js/charts.js';
import { initReportDownload } from './js/report.js';
import { initEffects } from './js/animation.js';

function bootstrap() {
    initEffects();
    initDate();
    initGreenhouse();
    initControls();
    initReportDownload();
    initTabs({
        onAnalyticsShow: initCharts,
        onMonitoringShow: () => requestAnimationFrame(fitGreenhouseStage)
    });

    fetchMetrics();
    setInterval(fetchMetrics, 3000);
}

document.addEventListener('DOMContentLoaded', bootstrap);

window.updateSensors = updateSensors;
