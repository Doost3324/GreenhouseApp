/**
 * Спільні стилі Chart.js під тему застосунку.
 */

function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
}

export function getChartTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        isDark,
        text: cssVar('--color-text-secondary', '#6e6e73'),
        textMuted: cssVar('--color-text-tertiary', '#86868b'),
        grid: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        font: cssVar('--font-family', 'system-ui, sans-serif')
    };
}

export function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildGradient(ctx, hex, chartArea) {
    if (!chartArea) return hexToRgba(hex, 0.15);
    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    g.addColorStop(0, hexToRgba(hex, 0.35));
    g.addColorStop(0.6, hexToRgba(hex, 0.08));
    g.addColorStop(1, hexToRgba(hex, 0));
    return g;
}
