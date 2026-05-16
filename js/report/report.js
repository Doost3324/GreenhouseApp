/**
 * Звіт PDF (українською).
 */
import { loadMockHistory } from '../data/history.js';
import { formatUkrainianDate } from '../ui/date.js';

function getCurrentMetrics() {
    return {
        temp: document.getElementById('stat-temp')?.textContent ?? '—',
        air: document.getElementById('stat-air-hum')?.textContent ?? '—',
        soil: document.getElementById('stat-soil-hum')?.textContent ?? '—',
        light: document.getElementById('stat-light')?.textContent ?? '—',
        plant: document.getElementById('plant-name')?.textContent ?? '—',
        status: document.getElementById('plant-status')?.textContent ?? '—'
    };
}

async function buildReportElement() {
    const history = await loadMockHistory();
    const metrics = getCurrentMetrics();
    const dateStr = formatUkrainianDate();

    const rows = history.labels
        .map(
            (label, i) => `<tr>
          <td>${label}</td>
          <td>${history.temperature[i].toFixed(1)} °C</td>
          <td>${history.humidity[i].toFixed(1)} %</td>
          <td>${history.soilMoisture[i].toFixed(1)} %</td>
          <td>${history.light[i].toFixed(1)} %</td>
        </tr>`
        )
        .join('');

    const el = document.createElement('div');
    el.id = 'pdf-report-root';
    el.innerHTML = `
    <div style="font-family: system-ui, sans-serif; color: #1d1d1f; padding: 32px; max-width: 720px;">
      <div style="border-bottom: 3px solid #34c759; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="margin: 0 0 6px; font-size: 26px;">Greenhouse — Звіт</h1>
        <p style="margin: 0; color: #6e6e73; font-size: 14px;">${dateStr}</p>
      </div>
      <section style="margin-bottom: 24px;">
        <h2 style="font-size: 16px; color: #34c759;">Поточний стан</h2>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="color:#6e6e73">Рослина</td><td style="font-weight:600">${metrics.plant}</td></tr>
          <tr><td style="color:#6e6e73">Статус</td><td style="font-weight:600">${metrics.status}</td></tr>
          <tr><td style="color:#6e6e73">Температура</td><td style="font-weight:600">${metrics.temp}</td></tr>
          <tr><td style="color:#6e6e73">Вологість повітря</td><td style="font-weight:600">${metrics.air}</td></tr>
          <tr><td style="color:#6e6e73">Вологість ґрунту</td><td style="font-weight:600">${metrics.soil}</td></tr>
          <tr><td style="color:#6e6e73">Освітленість</td><td style="font-weight:600">${metrics.light}</td></tr>
        </table>
      </section>
      <section>
        <h2 style="font-size: 16px; color: #34c759;">Історія (тестові дані, 24 год)</h2>
        <table style="width:100%; font-size:12px; border-collapse:collapse">
          <thead><tr style="background:#f5f5f7">
            <th style="padding:8px;text-align:left">Час</th>
            <th style="padding:8px;text-align:left">t°</th>
            <th style="padding:8px;text-align:left">Повітря</th>
            <th style="padding:8px;text-align:left">Ґрунт</th>
            <th style="padding:8px;text-align:left">Світло</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </div>`;

    el.style.cssText = 'position:fixed;left:-9999px;top:0;width:720px;background:#fff';
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

        const reportEl = await buildReportElement();
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        await new Promise((resolve, reject) => {
            doc.html(reportEl.firstElementChild || reportEl, {
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
        alert('Не вдалося створити PDF.');
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
