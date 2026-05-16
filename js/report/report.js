/**
 * Звіт PDF — верстка HTML + html2canvas (кирилиця).
 */
import { loadMockHistory } from '../data/history.js';
import { formatReportDateTime } from '../ui/date.js';

const PDF_STYLES = `
    #pdf-report-root { position: fixed; left: -9999px; top: 0; z-index: -1; }
    .pdf-report {
        width: 720px;
        padding: 0;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        color: #1d1d1f;
        background: #eef8f0;
        box-sizing: border-box;
    }
    .pdf-report__banner {
        padding: 28px 40px 24px;
        background: linear-gradient(135deg, #2e7d4a 0%, #34c759 55%, #5dd879 100%);
        color: #fff;
    }
    .pdf-report__banner-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }
    .pdf-report__brand-block { flex: 1; }
    .pdf-report__app-name {
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.9;
    }
    .pdf-report__logo {
        margin: 4px 0 0;
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.03em;
    }
    .pdf-report__tagline {
        margin: 6px 0 0;
        font-size: 14px;
        opacity: 0.92;
    }
    .pdf-report__date {
        margin: 0;
        padding: 10px 14px;
        font-size: 12px;
        font-weight: 600;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        white-space: nowrap;
        text-align: right;
    }
    .pdf-report__body { padding: 28px 40px 32px; background: #fff; }
    .pdf-report__section { margin-bottom: 24px; }
    .pdf-report__heading {
        margin: 0 0 14px;
        font-size: 16px;
        font-weight: 700;
        color: #2e7d4a;
    }
    .pdf-report__metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }
    .pdf-metric {
        padding: 12px 14px;
        background: #f4faf5;
        border-radius: 12px;
        border-left: 4px solid #34c759;
    }
    .pdf-metric--temp { border-left-color: #ef5350; }
    .pdf-metric--air { border-left-color: #29b6f6; }
    .pdf-metric--soil { border-left-color: #66bb6a; }
    .pdf-metric--light { border-left-color: #ffa726; }
    .pdf-metric--plant { border-left-color: #8d6e63; grid-column: 1 / -1; }
    .pdf-metric--status { border-left-color: #34c759; grid-column: 1 / -1; }
    .pdf-metric__label {
        display: block;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #86868b;
        margin-bottom: 4px;
    }
    .pdf-metric__value {
        font-size: 16px;
        font-weight: 700;
        color: #1d1d1f;
    }
    .pdf-report__table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11px;
        border-radius: 10px;
        overflow: hidden;
    }
    .pdf-report__table th {
        padding: 10px 8px;
        text-align: left;
        font-weight: 700;
        background: #e8f5e9;
        color: #1d1d1f;
    }
    .pdf-report__table td {
        padding: 7px 8px;
        border-bottom: 1px solid #e8ece9;
    }
    .pdf-report__table tbody tr:nth-child(even) td { background: #f9fcfa; }
    .pdf-report__footer {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #e5e5ea;
        font-size: 10px;
        color: #86868b;
        text-align: center;
    }
`;

function getCurrentMetrics() {
    const plantRaw = document.getElementById('plant-name')?.textContent ?? '—';
    const statusRaw = document.getElementById('plant-status')?.textContent ?? '—';

    return {
        temp: document.getElementById('stat-temp')?.textContent ?? '—',
        air: document.getElementById('stat-air-hum')?.textContent ?? '—',
        soil: document.getElementById('stat-soil-hum')?.textContent ?? '—',
        light: document.getElementById('stat-light')?.textContent ?? '—',
        plant: plantRaw.replace(/^Рослина:\s*/i, '').trim() || plantRaw,
        status: statusRaw.replace(/^Стан:\s*/i, '').trim() || statusRaw
    };
}

function buildReportHtml(history, metrics) {
    const dateTime = formatReportDateTime();

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

    return `
    <div class="pdf-report">
        <div class="pdf-report__banner">
            <div class="pdf-report__banner-row">
                <div class="pdf-report__brand-block">
                    <p class="pdf-report__app-name">Greenhouse App</p>
                    <p class="pdf-report__logo">Greenhouse</p>
                    <p class="pdf-report__tagline">Розумна мікроферма · Звіт</p>
                </div>
                <p class="pdf-report__date">${dateTime}</p>
            </div>
        </div>
        <div class="pdf-report__body">
            <section class="pdf-report__section">
                <h2 class="pdf-report__heading">Поточні показники</h2>
                <div class="pdf-report__metrics">
                    <div class="pdf-metric pdf-metric--plant"><span class="pdf-metric__label">Рослина</span><span class="pdf-metric__value">${metrics.plant}</span></div>
                    <div class="pdf-metric pdf-metric--status"><span class="pdf-metric__label">Стан</span><span class="pdf-metric__value">${metrics.status}</span></div>
                    <div class="pdf-metric pdf-metric--temp"><span class="pdf-metric__label">Температура</span><span class="pdf-metric__value">${metrics.temp}</span></div>
                    <div class="pdf-metric pdf-metric--air"><span class="pdf-metric__label">Вологість повітря</span><span class="pdf-metric__value">${metrics.air}</span></div>
                    <div class="pdf-metric pdf-metric--soil"><span class="pdf-metric__label">Вологість ґрунту</span><span class="pdf-metric__value">${metrics.soil}</span></div>
                    <div class="pdf-metric pdf-metric--light"><span class="pdf-metric__label">Освітленість</span><span class="pdf-metric__value">${metrics.light}</span></div>
                </div>
            </section>
            <section class="pdf-report__section">
                <h2 class="pdf-report__heading">Історія за 24 години</h2>
                <table class="pdf-report__table">
                    <thead>
                        <tr>
                            <th>Час</th>
                            <th>Температура</th>
                            <th>Повітря</th>
                            <th>Ґрунт</th>
                            <th>Освітленість</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </section>
            <footer class="pdf-report__footer">Greenhouse App · Згенеровано автоматично</footer>
        </div>
    </div>`;
}

async function buildReportElement() {
    const history = await loadMockHistory();
    const metrics = getCurrentMetrics();

    const wrap = document.createElement('div');
    wrap.id = 'pdf-report-root';
    wrap.innerHTML = buildReportHtml(history, metrics);

    const style = document.createElement('style');
    style.id = 'pdf-report-styles';
    style.textContent = PDF_STYLES;

    document.head.appendChild(style);
    document.body.appendChild(wrap);
    return { wrap, style };
}

export async function downloadPdfReport() {
    const btn = document.getElementById('btn-download-report');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Генерація PDF…';
    }

    let reportRoot;
    let reportStyle;

    try {
        const { jsPDF } = window.jspdf;
        const html2canvas = window.html2canvas;
        if (!jsPDF) throw new Error('jsPDF не завантажено');
        if (!html2canvas) throw new Error('html2canvas не завантажено');

        const built = await buildReportElement();
        reportRoot = built.wrap;
        reportStyle = built.style;

        const page = reportRoot.querySelector('.pdf-report');
        const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const contentWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;

        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + margin;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
            heightLeft -= pageHeight - margin * 2;
        }

        pdf.save(`greenhouse-zvit-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
        console.error('Помилка PDF:', error);
        alert('Не вдалося створити PDF.');
    } finally {
        reportRoot?.remove();
        reportStyle?.remove();
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
