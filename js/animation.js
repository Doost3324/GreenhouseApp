/**
 * Greenhouse visual effects — watering, lighting, ventilation.
 */

const CONTAINER_ID = 'greenhouse-container';
const PARTICLES_ID = 'sprinkler-particles';
const PARTICLE_COUNT = 32;

function getContainer() {
    return document.getElementById(CONTAINER_ID);
}

function setEffectClass(className, isActive) {
    const container = getContainer();
    if (!container) return;
    container.classList.toggle(className, Boolean(isActive));
}

export function setWateringActive(isActive) {
    setEffectClass('is-watering', isActive);
}

export function setLightingActive(isActive) {
    setEffectClass('is-lit', isActive);
}

export function setVentilationActive(isActive) {
    setEffectClass('is-ventilating', isActive);
}

function createSprinklerParticles() {
    const layer = document.getElementById(PARTICLES_ID);
    if (!layer || layer.dataset.ready === 'true') return;

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement('span');
        particle.className = 'sprinkle-particle';

        const x = 18 + Math.random() * 64;
        const startY = Math.random() * 12;
        const size = 3 + Math.random() * 4;
        const delay = Math.random() * 2.2;
        const duration = 0.9 + Math.random() * 0.8;
        const drift = (Math.random() - 0.5) * 24;
        const alpha = 0.35 + Math.random() * 0.4;

        particle.style.setProperty('--x', `${x}%`);
        particle.style.setProperty('--start-y', `${startY}%`);
        particle.style.setProperty('--size', `${size}px`);
        particle.style.setProperty('--delay', `${delay}s`);
        particle.style.setProperty('--duration', `${duration}s`);
        particle.style.setProperty('--drift', `${drift}px`);
        particle.style.setProperty('--alpha', String(alpha));

        fragment.appendChild(particle);
    }

    layer.appendChild(fragment);
    layer.dataset.ready = 'true';
}

export function initEffects() {
    createSprinklerParticles();
}

export function isWateringActive() {
    return getContainer()?.classList.contains('is-watering') ?? false;
}
