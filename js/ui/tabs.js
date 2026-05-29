/**
 * Перемикання вкладок: Моніторинг / Аналітика.
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
                const active = b === btn;
                b.classList.toggle('active', active);
                b.setAttribute('aria-selected', String(active));
            });

            Object.entries(panels).forEach(([key, panel]) => {
                const active = key === tab;
                panel.classList.toggle('active', active);
                panel.hidden = !active;
            });

            if (tab === 'analytics') onAnalyticsShow?.();
            else if (tab === 'monitoring') onMonitoringShow?.();
        });
    });
}
