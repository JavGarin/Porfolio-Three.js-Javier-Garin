// index.js
import * as THREE from 'three';
import { Pane } from 'tweakpane';
const gsap = window.gsap;

// --- Parámetros Configurables ---
const PARAMS = {
    bgColor: '#0a0a0a',
    color1: '#494341',
    color2: '#0066ff', 
    color3: '#e29595',
    noiseScale: 5.5,
    noiseSpeed: 0.06,
    brightness: 1.0,
    contrast: 1.1,
    glitchFrequency: 9.0,
    glitchDuration: 0.2,
    glitchIntensity: 0.06,
};

// --- Variables Globales ---
let scene, camera, renderer, clock;
let shaderMaterial, shaderMesh;
let pane;

// --- Shaders ---
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uBrightness;
uniform float uContrast;
uniform float uGlitchFrequency;
uniform float uGlitchDuration;
uniform float uGlitchIntensity;

// Función de ruido pseudo-aleatorio 2D
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Ruido Simplex 2D (snoise)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= (1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ));
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// Función fBm (Fractal Brownian Motion)
float fbm(vec2 st) {
    float value = 0.0; float amplitude = 0.5; float frequency = 0.0;
    int octaves = 5;
    for (int i = 0; i < octaves; i++) {
        value += amplitude * snoise(st);
        st *= 2.0; amplitude *= 0.5;
    }
    return value;
}

void main() {
    // --- Calcular Glitch ---
    float timeInCycle = mod(uTime, uGlitchFrequency);
    float glitchProgress = 0.0;
    bool isGlitching = timeInCycle < uGlitchDuration;

    if (isGlitching) {
        glitchProgress = 1.0;
    }

    // --- Calcular UVs ---
    vec2 currentUv = vUv;
    float horizontalOffset = 0.0;
    float randomNoise = 0.0;

    if (isGlitching) {
        horizontalOffset = (snoise(vec2(uTime * 10.0, vUv.y * 25.0)) * 0.5 + 0.5);
        horizontalOffset *= pow(random(vec2(floor(vUv.y * 50.0), uTime * 5.0)), 2.0);
        horizontalOffset *= uGlitchIntensity * glitchProgress;

        randomNoise = (random(vUv + uTime * 0.5) * 2.0 - 1.0) * 0.15 * uGlitchIntensity * glitchProgress;
        currentUv.x += horizontalOffset;
    }

    // --- Calcular Color Base ---
    vec2 noiseCoord = currentUv * uNoiseScale + vec2(uTime * uNoiseSpeed, uTime * uNoiseSpeed * 0.3);
    float baseNoise = fbm(noiseCoord);
    float detailNoise = fbm(noiseCoord * 2.5 + vec2(-uTime * uNoiseSpeed * 0.8, 0.0));

    float pattern = smoothstep(0.2, 0.7, baseNoise + 0.3 * detailNoise);
    vec3 color = mix(uColor1, uColor2, pattern);

    float highlightNoise = fbm(noiseCoord * 0.8 + 5.0 + vec2(uTime * uNoiseSpeed * 0.2, -uTime * uNoiseSpeed * 0.1));
    float highlights = smoothstep(0.5, 0.7, highlightNoise);
    highlights = pow(highlights, 1.5);
    color = mix(color, uColor3, highlights * 0.6);

    // --- Ajustes Finales ---
    color = pow(color, vec3(1.0 / uContrast));
    color *= uBrightness;
    color += randomNoise;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

// --- Inicialización Principal ---
function init() {
    if (typeof THREE === 'undefined' || typeof Pane === 'undefined') {
        console.error("Three.js o Tweakpane no cargados.");
        return;
    }

    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error("Contenedor #threejs-container no encontrado.");
        return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    clock = new THREE.Clock();

    // --- Escena ---
    scene = new THREE.Scene();
    scene.background = new THREE.Color(PARAMS.bgColor);
    document.body.style.backgroundColor = PARAMS.bgColor;
    updateBodyTheme(PARAMS.bgColor);

    // --- Cámara ---
    camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
    camera.position.z = 1;

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Crear el fondo con Shader ---
    createBackgroundShader();

    // --- Tweakpane Setup ---
    setupTweakpane();

    // --- Event Listeners ---
    addEventListeners();

    // --- Iniciar Animación ---
    animate();
}

function createBackgroundShader() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    shaderMaterial = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uColor1: { value: new THREE.Color(PARAMS.color1) },
            uColor2: { value: new THREE.Color(PARAMS.color2) },
            uColor3: { value: new THREE.Color(PARAMS.color3) },
            uNoiseScale: { value: PARAMS.noiseScale },
            uNoiseSpeed: { value: PARAMS.noiseSpeed },
            uBrightness: { value: PARAMS.brightness },
            uContrast: { value: PARAMS.contrast },
            uGlitchFrequency: { value: PARAMS.glitchFrequency },
            uGlitchDuration: { value: PARAMS.glitchDuration },
            uGlitchIntensity: { value: PARAMS.glitchIntensity },
        },
    });
    shaderMesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(shaderMesh);
}

function setupTweakpane() {
    pane = new Pane({
        title: 'Configuración Visual',
        expanded: false,
    });

    // Selector de color de fondo
    pane.addBinding(PARAMS, 'bgColor', {
        label: 'Fondo Base',
        options: {
            'Oscuro': '#0a0a0a',
            'Blanco': '#ffffff',
            'Gris': '#808080',
        }
    }).on('change', (ev) => {
        const newColor = new THREE.Color(ev.value);
        scene.background = newColor;
        document.body.style.backgroundColor = ev.value;
        updateBodyTheme(ev.value);
    });

    // Controles del shader
    const shaderFolder = pane.addFolder({ title: 'Efecto Shader' });
    shaderFolder.addBinding(PARAMS, 'color1', { label: 'Color 1' })
        .on('change', (ev) => { shaderMaterial.uniforms.uColor1.value.set(ev.value); });
    shaderFolder.addBinding(PARAMS, 'color2', { label: 'Color 2' })
        .on('change', (ev) => { shaderMaterial.uniforms.uColor2.value.set(ev.value); });
    shaderFolder.addBinding(PARAMS, 'color3', { label: 'Color Ruido' })
        .on('change', (ev) => { shaderMaterial.uniforms.uColor3.value.set(ev.value); });

    shaderFolder.addBinding(PARAMS, 'noiseScale', { label: 'Escala Ruido', min: 0.1, max: 15.0, step: 0.1 })
        .on('change', (ev) => { shaderMaterial.uniforms.uNoiseScale.value = ev.value; });
    shaderFolder.addBinding(PARAMS, 'noiseSpeed', { label: 'Velocidad Ruido', min: 0.0, max: 0.5, step: 0.01 })
        .on('change', (ev) => { shaderMaterial.uniforms.uNoiseSpeed.value = ev.value; });

    shaderFolder.addBinding(PARAMS, 'brightness', { label: 'Brillo', min: 0.0, max: 2.0, step: 0.05 })
        .on('change', (ev) => { shaderMaterial.uniforms.uBrightness.value = ev.value; });
    shaderFolder.addBinding(PARAMS, 'contrast', { label: 'Contraste', min: 0.5, max: 2.5, step: 0.05 })
        .on('change', (ev) => { shaderMaterial.uniforms.uContrast.value = ev.value; });

    // Controles del efecto Glitch
    const glitchFolder = pane.addFolder({ title: 'Efecto Glitch VHS' });
    glitchFolder.addBinding(PARAMS, 'glitchFrequency', { label: 'Frecuencia (s)', min: 1.0, max: 20.0, step: 0.5 })
        .on('change', (ev) => { shaderMaterial.uniforms.uGlitchFrequency.value = ev.value; });
    glitchFolder.addBinding(PARAMS, 'glitchDuration', { label: 'Duración (s)', min: 0.05, max: 1.0, step: 0.01 })
        .on('change', (ev) => { shaderMaterial.uniforms.uGlitchDuration.value = ev.value; });
    glitchFolder.addBinding(PARAMS, 'glitchIntensity', { label: 'Intensidad', min: 0.0, max: 0.2, step: 0.005 })
        .on('change', (ev) => { shaderMaterial.uniforms.uGlitchIntensity.value = ev.value; });
}

function updateBodyTheme(bgColorHex) {
    const color = new THREE.Color(bgColorHex);
    const isLight = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) > 0.5;
    if (isLight) {
        document.body.setAttribute('data-bg-theme', 'light');
    } else {
        document.body.removeAttribute('data-bg-theme');
    }
}

function addEventListeners() {
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    if (shaderMaterial) {
        shaderMaterial.uniforms.uResolution.value.set(w, h);
    }
}

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (shaderMaterial) {
        shaderMaterial.uniforms.uTime.value = elapsedTime;
    }

    renderer.render(scene, camera);
}

// --- Punto de Entrada ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}