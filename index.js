import * as THREE from 'three';

// --- Parámetros Configurables ---
const PARAMS = {
    bgColor: '#0a0a0a', // Fondo base inicial
    color1: '#2f2e2e', // Color principal 1 del shader
    color2: '#eb7b7b', // Color principal 2 del shader
    color3: '#5CEBFF', // Color del ruido/highlights
    noiseScale: 10,   // Escala base del ruido
    noiseSpeed: 0.32,  // Velocidad base del ruido
    brightness: 1.0,
    contrast: 1.35,
    glitchFrequency: 8.0, // Cada cuántos segundos ocurre un glitch
    glitchDuration: 0.7,  // Cuánto dura el glitch
    glitchIntensity: 1.0,// Qué tan intenso es el glitch
};

// --- Variables Globales ---
let scene, camera, renderer, clock;
let shaderMaterial, shaderMesh;

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
    float timeModFreq = mod(uTime, 1.0 / uGlitchFrequency);
    float glitchProgress = 0.0;
    bool shouldGlitchNow = random(vec2(floor(uTime * uGlitchFrequency), 0.0)) > 0.6;
    bool isGlitching = shouldGlitchNow && (timeModFreq < uGlitchDuration);

    if (isGlitching) {
        glitchProgress = smoothstep(0.0, uGlitchDuration, timeModFreq);
    }

    // --- Calcular UVs ---
    vec2 currentUv = vUv;
    float horizontalOffset = 0.0;
    float randomNoiseEffect = 0.0;

    if (isGlitching) {
        horizontalOffset = (snoise(vec2(uTime * 20.0 + vUv.y * 10.0, vUv.y * 35.0)) * 0.5 + 0.5);
        horizontalOffset *= pow(random(vec2(floor(vUv.y * 80.0), floor(uTime * 15.0))), 3.0);
        horizontalOffset *= uGlitchIntensity * glitchProgress;

        randomNoiseEffect = (random(vUv + uTime * 0.8) * 2.0 - 1.0) * 0.25 * uGlitchIntensity * glitchProgress;
        currentUv.x += horizontalOffset * (random(vec2(uTime, vUv.y)) > 0.5 ? 1.0 : -1.0);
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
    color += randomNoiseEffect;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

// --- Inicialización Principal ---
function init() {
    if (typeof THREE === 'undefined') {
        console.error("Three.js no está cargado.");
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

    // --- Cámara ---
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // --- Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Crear el fondo con Shader ---
    createBackgroundShader();

    // Aplicar parámetros iniciales
    applyInitialParams();

    // --- Event Listeners ---
    addEventListeners();

    // --- Iniciar Animación ---
    animate();
}

function applyInitialParams() {
    const initialColor = new THREE.Color(PARAMS.bgColor);
    scene.background = initialColor;
    document.body.style.backgroundColor = PARAMS.bgColor;
    updateBodyTheme(PARAMS.bgColor);

    if(shaderMaterial) {
        shaderMaterial.uniforms.uColor1.value.set(PARAMS.color1);
        shaderMaterial.uniforms.uColor2.value.set(PARAMS.color2);
        shaderMaterial.uniforms.uColor3.value.set(PARAMS.color3);
        shaderMaterial.uniforms.uNoiseScale.value = PARAMS.noiseScale;
        shaderMaterial.uniforms.uNoiseSpeed.value = PARAMS.noiseSpeed;
        shaderMaterial.uniforms.uBrightness.value = PARAMS.brightness;
        shaderMaterial.uniforms.uContrast.value = PARAMS.contrast;
        shaderMaterial.uniforms.uGlitchFrequency.value = PARAMS.glitchFrequency > 0 ? (1.0 / PARAMS.glitchFrequency) : 999.0;
        shaderMaterial.uniforms.uGlitchDuration.value = PARAMS.glitchDuration;
        shaderMaterial.uniforms.uGlitchIntensity.value = PARAMS.glitchIntensity;
    }
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
            uGlitchFrequency: { value: PARAMS.glitchFrequency > 0 ? (1.0 / PARAMS.glitchFrequency) : 999.0 },
            uGlitchDuration: { value: PARAMS.glitchDuration },
            uGlitchIntensity: { value: PARAMS.glitchIntensity },
        },
        depthTest: false,
        depthWrite: false,
    });
    shaderMesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(shaderMesh);
}

function addEventListeners() {
    window.addEventListener('resize', onWindowResize);
}

function removeEventListeners() {
    window.removeEventListener('resize', onWindowResize);
}

function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (shaderMaterial) {
        shaderMaterial.uniforms.uResolution.value.set(w, h);
    }
}

function updateBodyTheme(bgColorHex) {
    try {
        const color = new THREE.Color(bgColorHex);
        const luminance = 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
        if (luminance > 0.5) {
            document.body.setAttribute('data-bg-theme', 'light');
        } else {
            document.body.setAttribute('data-bg-theme', 'dark');
        }
    } catch (error) {
        console.error("Error al procesar color de fondo:", error);
        document.body.setAttribute('data-bg-theme', 'dark');
    }
}

// --- Bucle de Animación ---
function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    if (shaderMaterial) {
        shaderMaterial.uniforms.uTime.value = elapsedTime;
        const scaleOscillation = Math.sin(elapsedTime * 0.3) * 0.4;
        shaderMaterial.uniforms.uNoiseScale.value = PARAMS.noiseScale + scaleOscillation;
    }

    renderer.render(scene, camera);
}

// --- Ejecutar Inicialización ---
init();