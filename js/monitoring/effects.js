/**
 * Візуальні ефекти теплиці: полив (дощ), освітлення, вентиляція.
 */

const CONTAINER_ID = 'greenhouse-container';
const PARTICLES_ID = 'sprinkler-particles';
const STREAKS_ID = 'rain-streaks';
const DROP_COUNT = 88;
const STREAK_COUNT = 48;

function getContainer() {
    return document.getElementById(CONTAINER_ID);
}

function setEffectClass(className, isActive) {
    getContainer()?.classList.toggle(className, Boolean(isActive));
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

function createDrops(layer) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < DROP_COUNT; i++) {
        const p = document.createElement('span');
        p.className = 'sprinkle-particle';
        p.style.setProperty('--x', `${10 + Math.random() * 80}%`);
        p.style.setProperty('--start-y', `${Math.random() * 8}%`);
        p.style.setProperty('--size', `${2 + Math.random() * 5}px`);
        p.style.setProperty('--delay', `${Math.random() * 1.8}s`);
        p.style.setProperty('--duration', `${0.55 + Math.random() * 0.45}s`);
        p.style.setProperty('--drift', `${(Math.random() - 0.5) * 36}px`);
        p.style.setProperty('--alpha', String(0.45 + Math.random() * 0.45));
        fragment.appendChild(p);
    }

    layer.appendChild(fragment);
}

function createStreaks(layer) {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < STREAK_COUNT; i++) {
        const s = document.createElement('span');
        s.className = 'rain-streak';
        s.style.setProperty('--x', `${8 + Math.random() * 84}%`);
        s.style.setProperty('--len', `${14 + Math.random() * 22}px`);
        s.style.setProperty('--delay', `${Math.random() * 1.2}s`);
        s.style.setProperty('--duration', `${0.35 + Math.random() * 0.35}s`);
        s.style.setProperty('--alpha', String(0.35 + Math.random() * 0.4));
        fragment.appendChild(s);
    }

    layer.appendChild(fragment);
}

export function initEffects() {
    const particles = document.getElementById(PARTICLES_ID);
    const streaks = document.getElementById(STREAKS_ID);

    if (particles && particles.dataset.ready !== 'true') {
        createDrops(particles);
        particles.dataset.ready = 'true';
    }
    if (streaks && streaks.dataset.ready !== 'true') {
        createStreaks(streaks);
        streaks.dataset.ready = 'true';
    }
}
