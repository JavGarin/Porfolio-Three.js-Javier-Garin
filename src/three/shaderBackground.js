// =============================================================================
//  shaderBackground.js — Viento Cósmico de Partículas Continuo (Infinite Loop)
//
//  Arquitectura:
//  · THREE.Points + BufferGeometry: 1 único draw call por frame
//  · Gran densidad de micro-partículas (polvo estelar) para efecto cósmico notorio
//  · Loop infinito continuo: reemisión suave en los bordes de entrada sin vacíos
//  · Variación de tamaños por capas de profundidad (80% diminutas, 15% medias, 5% brillantes)
//  · Turbulencia sinusoidal individualizada para movimiento fluido y orgánico
//  · Pausa automática en pestaña oculta para rendimiento óptimo
// =============================================================================

import {
    Scene,
    Color,
    OrthographicCamera,
    WebGLRenderer,
    BufferGeometry,
    BufferAttribute,
    Points,
    ShaderMaterial,
    AdditiveBlending,
} from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import { vertexShader, fragmentShader } from './shaders.js';

// Configuración general
const PARAMS = {
    bgColor:        '#0a0a0a',
    particleColor:  '#d6d6d6',
    windAngle:      16,          // grados de inclinación (flujo natural hacia la derecha-abajo)
    windSpeed:      0.18,        // velocidad de crucero constante (reducida para un movimiento más suave)
    turbulence:     0.04,        // amplitud de ondulación sinusoidal
    turbulenceFreq: 0.65,        // cadencia de oscilación
};

// Conteo denso pero ultra-ligero para GPU (puntos 2D sin fragment shaders pesados)
function getParticleCount() {
    const w = window.innerWidth;
    if (w < 480)  return 1500;  // Móviles
    if (w < 768)  return 2400;  // Tablets / Móviles grandes
    if (w < 1440) return 3600;  // Laptops / Desktops
    return 4800;                 // Pantallas grandes / 2K+
}

function getOptimalPixelRatio() {
    return window.innerWidth < 768
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, 2.0);
}

function rand(min, max) { return min + Math.random() * (max - min); }

function windVector(angleDeg, speed) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: Math.cos(rad) * speed, y: -Math.sin(rad) * speed };
}

// Estado del módulo
let scene, camera, renderer, timer;
let geometry, material, pointsMesh;
let positions, opacities, phases, speeds, turbFreqs;
let particleCount = 0;
let dpr = 1;
let animationFrameId = null;
let isPaused = false;

const FRAME_INTERVAL = 1000 / 60;
let lastFrameTime = 0;

// Reubica una partícula en el origen del viento para un loop infinito constante
function respawnParticle(i, initial = false) {
    const i3 = i * 3;

    if (initial) {
        // Distribución inicial homogénea por toda la pantalla
        positions[i3]     = rand(-1.35, 1.35);
        positions[i3 + 1] = rand(-1.15, 1.15);
    } else {
        // Flujo continuo: el 80% entra por el lateral izquierdo, el 20% por arriba
        if (Math.random() < 0.80) {
            positions[i3]     = -1.35 - rand(0.02, 0.25);
            positions[i3 + 1] = rand(-1.15, 1.15);
        } else {
            positions[i3]     = rand(-1.35, 1.35);
            positions[i3 + 1] = 1.15 + rand(0.02, 0.25);
        }
    }

    positions[i3 + 2] = 0;
}

function createParticleData(n) {
    particleCount = n;
    positions  = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    opacities  = new Float32Array(n);
    phases     = new Float32Array(n);
    speeds     = new Float32Array(n);
    turbFreqs  = new Float32Array(n);

    for (let i = 0; i < n; i++) {
        respawnParticle(i, true);

        // Capas volumétricas:
        // ~80% Micro-partículas (polvo cósmico etéreo)
        // ~15% Partículas intermedias
        // ~5%  Partículas estelares más notorias y brillantes
        const roll = Math.random();
        if (roll < 0.80) {
            sizes[i]     = rand(0.8, 1.8) * dpr;
            opacities[i] = rand(0.12, 0.45);
            speeds[i]    = rand(0.70, 1.15);
        } else if (roll < 0.95) {
            sizes[i]     = rand(1.9, 3.0) * dpr;
            opacities[i] = rand(0.35, 0.70);
            speeds[i]    = rand(0.95, 1.35);
        } else {
            sizes[i]     = rand(3.1, 4.8) * dpr;
            opacities[i] = rand(0.65, 0.95);
            speeds[i]    = rand(1.15, 1.55);
        }

        phases[i]    = rand(0, Math.PI * 2);
        turbFreqs[i] = rand(0.7, 1.3);
    }

    return sizes;
}

export function initBackground() {
    const container = document.getElementById('threejs-container');
    if (!container) return;
    if (renderer) disposeBackground();

    dpr   = getOptimalPixelRatio();
    timer = new Timer();

    const w = window.innerWidth;
    const h = window.innerHeight;

    scene  = new Scene();
    scene.background = new Color(PARAMS.bgColor);
    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new WebGLRenderer({
        antialias:       false,
        powerPreference: 'high-performance',
        depth:           false,
        stencil:         false,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    container.appendChild(renderer.domElement);

    const sizes = createParticleData(getParticleCount());

    geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('aSize',    new BufferAttribute(sizes, 1));
    geometry.setAttribute('aOpacity', new BufferAttribute(opacities, 1));

    material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uColor: { value: new Color(PARAMS.particleColor) },
        },
        transparent: true,
        blending:    AdditiveBlending,
        depthTest:   false,
        depthWrite:  false,
    });

    pointsMesh = new Points(geometry, material);
    scene.add(pointsMesh);

    document.body.style.backgroundColor = PARAMS.bgColor;

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    lastFrameTime = performance.now();
    isPaused = false;
    animate(lastFrameTime);
}

function onWindowResize() {
    if (!renderer) return;
    dpr = getOptimalPixelRatio();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(dpr);
}

function onVisibilityChange() {
    document.hidden ? pauseBackground() : resumeBackground();
}

export function pauseBackground() {
    isPaused = true;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

export function resumeBackground() {
    if (!isPaused) return;
    isPaused = false;
    if (timer) timer.reset();
    lastFrameTime = performance.now();
    animate(lastFrameTime);
}

function animate(currentTime) {
    if (isPaused) return;
    animationFrameId = requestAnimationFrame(animate);

    if (!lastFrameTime) {
        lastFrameTime = currentTime;
        return;
    }

    const elapsed = currentTime - lastFrameTime;
    if (elapsed < FRAME_INTERVAL - 1.0) return;

    // dt capado para evitar tirones tras pausas o desajustes
    const dt = Math.min(elapsed / 1000, 0.05);
    lastFrameTime = currentTime;

    if (timer) timer.update(currentTime);
    const t = timer ? timer.getElapsed() : 0;
    const wind = windVector(PARAMS.windAngle, PARAMS.windSpeed);
    const turb = PARAMS.turbulence;
    const baseFreq = PARAMS.turbulenceFreq;

    for (let i = 0; i < particleCount; i++) {
        const i3  = i * 3;
        const spd = speeds[i];
        const ph  = phases[i];
        const tf  = turbFreqs[i];

        // Desplazamiento del viento con turbulencia sinusoidal ondulante
        positions[i3]     += wind.x * spd * dt;
        positions[i3 + 1] += wind.y * spd * dt
                           + Math.sin(t * baseFreq * tf + ph) * turb * dt;

        // Loop infinito continuo: al salir del cuadrante visible por derecha o abajo,
        // la partícula se reinyecta suavemente en el origen del flujo
        if (positions[i3] > 1.35 || positions[i3 + 1] < -1.15) {
            respawnParticle(i, false);
        }
    }

    geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

export function disposeBackground() {
    pauseBackground();
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (geometry)  { geometry.dispose();  geometry  = null; }
    if (material)  { material.dispose();  material  = null; }
    if (pointsMesh && scene) scene.remove(pointsMesh);
    pointsMesh = null;
    if (renderer) {
        renderer.dispose();
        renderer.domElement?.parentNode?.removeChild(renderer.domElement);
        renderer = null;
    }
    if (timer) {
        timer.dispose();
        timer = null;
    }
    scene = null; camera = null;
    positions = null; opacities = null; phases = null; speeds = null; turbFreqs = null;
}
