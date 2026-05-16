/**
 * Світла / темна тема (збереження в localStorage).
 */

const STORAGE_KEY = 'greenhouse-theme';

function applyTheme(theme) {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const isDark = next === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.classList.toggle('is-active', isDark);
    btn.title = isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему';
    btn.innerHTML = isDark
        ? '<span class="theme-toggle__icon" aria-hidden="true">☀️</span><span class="theme-toggle__label">Світла</span>'
        : '<span class="theme-toggle__icon" aria-hidden="true">🌙</span><span class="theme-toggle__label">Темна</span>';
}

export function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    applyTheme(saved === 'dark' ? 'dark' : 'light');

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
}
