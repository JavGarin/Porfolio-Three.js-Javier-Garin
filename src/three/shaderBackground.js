import {
    Scene,
    Color,
    OrthographicCamera,
    WebGLRenderer,
    PlaneGeometry,
    ShaderMaterial,
    Mesh,
    Vector2,
    Clock,
} from 'three';
import { vertexShader, fragmentShader } from './shaders.js';

// --- Parámetros configurables ---
export const PARAMS = {
    bgColor: '#0a0a0a',
    color1: '#2f2e2e',
    color2: '#eb7b7b',
    color3: '#5CEBFF',
    noiseScale: 10,
    noiseSpeed: 0.32,
    brightness: 1.0,
    contrast: 1.35,
};

let scene, camera, renderer, clock;
let shaderMaterial, shaderMesh, geometry;
let animationFrameId = null;
let isPaused = false;

// Throttle a 60 FPS para no desperdiciar GPU en pantallas de 120/144 Hz
// Se compara con un margen de 1ms para absorber jitter del scheduler del SO.
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~16.67 ms
let lastFrameTime = 0;

// uTime se wrappea a 3600s para evitar pérdida de precisión de float
// después de horas de ejecución (valores grandes → snoise produce artefactos)
const TIME_WRAP = 3600.0;

/**
 * Pixel ratio adaptativo: 1.5× en móvil, 2.0× en desktop.
 * Ahorra ~44% de fragmentos sombreados en smartphones sin pérdida visual apreciable.
 */
function getOptimalPixelRatio() {
    return window.innerWidth < 768
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, 2.0);
}

export function initBackground() {
    const container = document.getElementById('threejs-container');
    if (!container) return;

    if (renderer) disposeBackground();

    const w = window.innerWidth;
    const h = window.innerHeight;
    clock = new Clock();

    scene = new Scene();
    scene.background = new Color(PARAMS.bgColor);

    camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    renderer = new WebGLRenderer({
        antialias: false,
        powerPreference: 'high-performance',
        depth: false,
        stencil: false,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(getOptimalPixelRatio());
    container.appendChild(renderer.domElement);

    geometry = new PlaneGeometry(2, 2);
    shaderMaterial = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime:       { value: 0.0 },
            uResolution: { value: new Vector2(w, h) },
            uColor1:     { value: new Color(PARAMS.color1) },
            uColor2:     { value: new Color(PARAMS.color2) },
            uColor3:     { value: new Color(PARAMS.color3) },
            uNoiseScale: { value: PARAMS.noiseScale },
            uNoiseSpeed: { value: PARAMS.noiseSpeed },
            uBrightness: { value: PARAMS.brightness },
            uContrast:   { value: PARAMS.contrast },
        },
        depthTest:  false,
        depthWrite: false,
    });

    shaderMesh = new Mesh(geometry, shaderMaterial);
    scene.add(shaderMesh);

    document.body.style.backgroundColor = PARAMS.bgColor;

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    lastFrameTime = performance.now();
    isPaused = false;
    animate(lastFrameTime);
}

function onWindowResize() {
    if (!renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(getOptimalPixelRatio());
    if (shaderMaterial) shaderMaterial.uniforms.uResolution.value.set(w, h);
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
    if (clock) clock.getDelta();
    lastFrameTime = performance.now();
    animate(lastFrameTime);
}

function animate(currentTime) {
    if (isPaused) return;
    animationFrameId = requestAnimationFrame(animate);

    // Throttle simple: si no ha pasado suficiente tiempo, saltamos el frame.
    // No acumulamos corrección de delta para evitar micro-stutters.
    const elapsed = currentTime - lastFrameTime;
    if (elapsed < FRAME_INTERVAL - 1.0) return;
    lastFrameTime = currentTime;

    if (shaderMaterial) {
        // Wrapping del tiempo: evita pérdida de precisión float tras horas de ejecución
        const t = clock.getElapsedTime() % TIME_WRAP;
        shaderMaterial.uniforms.uTime.value = t;
        // uNoiseScale es constante — la variación orgánica se hace en GLSL
        // con la oscilación circular del vector drift, no en CPU.
    }

    renderer.render(scene, camera);
}

export function disposeBackground() {
    pauseBackground();
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    if (geometry)     { geometry.dispose();       geometry = null; }
    if (shaderMaterial){ shaderMaterial.dispose(); shaderMaterial = null; }
    if (shaderMesh && scene) scene.remove(shaderMesh);
    shaderMesh = null;
    if (renderer) {
        renderer.dispose();
        renderer.domElement?.parentNode?.removeChild(renderer.domElement);
        renderer = null;
    }
    scene = null; camera = null; clock = null;
}
