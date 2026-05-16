/**
 * PDF report generation (Ukrainian).
 */

import { getMockHistory } from './charts.js';
import { formatUkrainianDate } from './date.js';

function getCurrentMetrics() {
    const temp = document.getElementById('stat-temp')?.textContent ?? '—';
    const air = document.getElementById('stat-air-hum')?.textContent ?? '—';
    const soil = document.getElementById('stat-soil-hum')?.textContent ?? '—';
    const plant = document.getElementById('plant-name')?.textContent ?? '—';
    const status = document.getElementById('plant-status')?.textContent ?? '—';
    return { temp, air, soil, plant, status };
}

function buildReportElement() {
    const { labels, temps, humidity } = getMockHistory();
    const metrics = getCurrentMetrics();
    const dateStr = formatUkrainianDate();

    const rows = labels
        .map(
            (label, i) =>
                `<tr>
          <td>${label}</td>
          <td>${temps[i].toFixed(1)} °C</td>
          <td>${humidity[i].toFixed(1)} %</td>
        </tr>`
        )
        .join('');

    const el = document.createElement('div');
    el.id = 'pdf-report-root';
    el.innerHTML = `
    <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color: #1d1d1f; padding: 32px; max-width: 720px;">
      <div style="border-bottom: 3px solid #34c759; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0 0 6px; font-size: 26px; font-weight: 700;">Greenhouse — Звіт</h1>
        <p style="margin: 0; color: #6e6e73; font-size: 14px;">Розумна мікроферма · ${dateStr}</p>
      </div>
      <section style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; margin: 0 0 12px; color: #34c759;">Поточний стан</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #6e6e73;">Рослина</td><td style="padding: 8px 0; font-weight: 600;">${metrics.plant}</td></tr>
          <tr><td style="padding: 8px 0; color: #6e6e73;">Статус</td><td style="padding: 8px 0; font-weight: 600;">${metrics.status}</td></tr>
          <tr><td style="padding: 8px 0; color: #6e6e73;">Температура</td><td style="padding: 8px 0; font-weight: 600;">${metrics.temp}</td></tr>
          <tr><td style="padding: 8px 0; color: #6e6e73;">Вологість повітря</td><td style="padding: 8px 0; font-weight: 600;">${metrics.air}</td></tr>
          <tr><td style="padding: 8px 0; color: #6e6e73;">Вологість ґрунту</td><td style="padding: 8px 0; font-weight: 600;">${metrics.soil}</td></tr>
        </table>
      </section>
      <section>
        <h2 style="font-size: 16px; margin: 0 0 12px; color: #34c759;">Історія за 24 години</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f5f5f7;">
              <th style="text-align: left; padding: 10px; border-radius: 8px 0 0 0;">Час</th>
              <th style="text-align: left; padding: 10px;">Температура</th>
              <th style="text-align: left; padding: 10px; border-radius: 0 8px 0 0;">Вологість пов.</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <p style="margin-top: 28px; font-size: 11px; color: #86868b;">Згенеровано автоматично системою Greenhouse</p>
    </div>`;

    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.width = '720px';
    el.style.background = '#fff';
    document.body.appendChild(el);
    return el;
}

export async function downloadPdfReport() {
    const btn = document.getElementById('btn-download-report');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Генерація PDF…';
    }

    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) throw new Error('jsPDF не завантажено');

        const reportEl = buildReportElement();
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const content = reportEl.firstElementChild || reportEl;

        await new Promise((resolve, reject) => {
            doc.html(content, {
                callback: (pdf) => {
                    try {
                        pdf.save(`greenhouse-zvit-${new Date().toISOString().slice(0, 10)}.pdf`);
                        reportEl.remove();
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },
                x: 12,
                y: 12,
                width: 186,
                windowWidth: 720,
                html2canvas: { scale: 0.55, useCORS: true, logging: false }
            });
        });
    } catch (error) {
        console.error('Помилка PDF:', error);
        alert('Не вдалося створити PDF. Перевірте підключення до інтернету (бібліотека jsPDF).');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="btn-download__icon" aria-hidden="true">📄</span> Завантажити звіт (PDF)';
        }
    }
}

export function initReportDownload() {
    const btn = document.getElementById('btn-download-report');
    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = 'true';
    btn.addEventListener('click', downloadPdfReport);
}
