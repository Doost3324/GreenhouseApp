/**
 * Перемикачі керування: вентиляція, полив, освітлення.
 */
import {
    setWateringActive,
    setLightingActive,
    setVentilationActive
} from '../monitoring/effects.js';

const deviceStates = { fan: false, pump: false, light: false };

async function sendDeviceCommand(device, isOn) {
    try {
        const response = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device, state: isOn ? 'on' : 'off' })
        });
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.warn('Команда не надіслана:', error);
    }
}

function applyVisualEffect(device, isOn) {
    switch (device) {
        case 'pump': setWateringActive(isOn); break;
        case 'light': setLightingActive(isOn); break;
        case 'fan': setVentilationActive(isOn); break;
        default: break;
    }
}

export function initControls() {
    document.querySelectorAll('.toggle-switch input[data-device]').forEach((input) => {
        input.addEventListener('change', () => {
            const device = input.dataset.device;
            deviceStates[device] = input.checked;
            applyVisualEffect(device, input.checked);
            sendDeviceCommand(device, input.checked);
        });
    });
}
