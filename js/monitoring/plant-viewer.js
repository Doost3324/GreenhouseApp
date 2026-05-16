/**
 * 3D-рослина в теплиці (GLB) — обертання мишею.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { CONFIG } from '../core/config.js';

const DRACO_URL = 'https://cdn.jsdelivr.net/npm/three@0.172.0/examples/jsm/libs/draco/';

let renderer;
let scene;
let camera;
let plantRoot;
let slotEl;
let canvasEl;
let rotY = 0.55;
let rotX = 0.15;
let dragging = false;
let lastX = 0;
let lastY = 0;
let rafId = 0;

function fitCamera() {
    if (!plantRoot || !camera) return;

    const box = new THREE.Box3().setFromObject(plantRoot);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const dist = maxDim * 1.65;

    plantRoot.position.sub(center);
    plantRoot.position.y += size.y * 0.02;

    camera.position.set(0, maxDim * 0.35, dist);
    camera.lookAt(0, 0, 0);
    camera.near = dist / 100;
    camera.far = dist * 20;
    camera.updateProjectionMatrix();
}

function applyOrbit() {
    if (!plantRoot) return;
    plantRoot.rotation.set(rotX, rotY, 0);
}

function resize() {
    if (!renderer || !camera || !slotEl) return;
    const w = Math.max(1, slotEl.clientWidth);
    const h = Math.max(1, slotEl.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function render() {
    renderer?.render(scene, camera);
}

function onPointerDown(e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    slotEl?.classList.add('is-dragging');
    canvasEl?.setPointerCapture(e.pointerId);
    e.preventDefault();
}

function onPointerMove(e) {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.008;
    rotX = Math.max(-0.45, Math.min(0.55, rotX + (e.clientY - lastY) * 0.005));
    lastX = e.clientX;
    lastY = e.clientY;
    applyOrbit();
    render();
}

function onPointerUp(e) {
    dragging = false;
    slotEl?.classList.remove('is-dragging');
    try {
        canvasEl?.releasePointerCapture(e.pointerId);
    } catch {
        /* noop */
    }
}

function onVisibility() {
    if (document.hidden) {
        cancelAnimationFrame(rafId);
        return;
    }
    const tick = () => {
        if (!dragging && plantRoot) {
            rotY += 0.0012;
            applyOrbit();
            render();
        }
        rafId = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
}

export function initPlantViewer() {
    slotEl = document.getElementById('plant-slot');
    canvasEl = document.getElementById('plant-canvas');
    if (!slotEl || !canvasEl) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.01, 100);

    renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9a6b, 1.1));
    const key = new THREE.DirectionalLight(0xfff8ee, 1.35);
    key.position.set(2.5, 4, 3);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8e6ff, 0.45);
    fill.position.set(-2, 1, -1);
    scene.add(fill);

    plantRoot = new THREE.Group();
    scene.add(plantRoot);

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_URL);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(
        CONFIG.plantModelUrl,
        (gltf) => {
            plantRoot.add(gltf.scene);
            applyOrbit();
            fitCamera();
            resize();
            render();
            slotEl.classList.add('is-ready');
        },
        undefined,
        (err) => console.error('Модель рослини:', err)
    );

    slotEl.addEventListener('pointerdown', onPointerDown);
    slotEl.addEventListener('pointermove', onPointerMove);
    slotEl.addEventListener('pointerup', onPointerUp);
    slotEl.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('resize', () => { resize(); render(); });
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => { resize(); render(); }).observe(slotEl);
    }
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
}
