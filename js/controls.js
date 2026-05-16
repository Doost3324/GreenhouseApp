/**
 * iOS-style toggle switches — ventilation, watering, lighting.
 */

import {
    setWateringActive,
    setLightingActive,
    setVentilationActive
} from './animation.js';

const deviceStates = { fan: false, pump: false, light: false };

async function sendDeviceCommand(device, isOn) {
    const state = isOn ? 'on' : 'off';

    try {
        const response = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ device, state })
        });
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.warn('Команда не надіслана:', error);
    }
}

function applyVisualEffect(device, isOn) {
    switch (device) {
        case 'pump':
            setWateringActive(isOn);
            break;
        case 'light':
            setLightingActive(isOn);
            break;
        case 'fan':
            setVentilationActive(isOn);
            break;
        default:
            break;
    }
}

function handleDeviceChange(device, isOn) {
    deviceStates[device] = isOn;
    applyVisualEffect(device, isOn);
    sendDeviceCommand(device, isOn);
}

export function initControls() {
    document.querySelectorAll('.toggle-switch input[data-device]').forEach((input) => {
        input.addEventListener('change', () => {
            const device = input.dataset.device;
            handleDeviceChange(device, input.checked);
        });
    });
}

export function getDeviceStates() {
    return { ...deviceStates };
}
