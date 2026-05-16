/**
 * SPA tab switching — Моніторинг / Аналітика.
 */

export function initTabs({ onAnalyticsShow, onMonitoringShow } = {}) {
    const buttons = document.querySelectorAll('.tab-btn');
    const panels = {
        monitoring: document.getElementById('tab-monitoring'),
        analytics: document.getElementById('tab-analytics')
    };

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (!tab || !panels[tab]) return;

            buttons.forEach((b) => {
                const isActive = b === btn;
                b.classList.toggle('active', isActive);
                b.setAttribute('aria-selected', String(isActive));
            });

            Object.entries(panels).forEach(([key, panel]) => {
                const isActive = key === tab;
                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;
            });

            if (tab === 'analytics') {
                onAnalyticsShow?.();
            } else if (tab === 'monitoring') {
                onMonitoringShow?.();
            }
        });
    });
}
