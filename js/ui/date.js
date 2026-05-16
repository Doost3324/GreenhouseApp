/**
 * Дата в шапці та годинник у футері.
 */
const UKRAINIAN_MONTHS = [
    'Січня', 'Лютого', 'Березня', 'Квітня', 'Травня', 'Червня',
    'Липня', 'Серпня', 'Вересня', 'Жовтня', 'Листопада', 'Грудня'
];

export function formatUkrainianDate(date = new Date()) {
    return `${date.getDate()} ${UKRAINIAN_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function renderCurrentDate() {
    const el = document.getElementById('current-date');
    if (!el) return;
    const now = new Date();
    el.textContent = formatUkrainianDate(now);
    el.setAttribute('datetime', now.toISOString().slice(0, 10));
}

function renderFooterClock() {
    const el = document.getElementById('footer-clock');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('uk-UA', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function initDate() {
    renderCurrentDate();
    renderFooterClock();
    setInterval(renderCurrentDate, 60_000);
    setInterval(renderFooterClock, 1000);
}
