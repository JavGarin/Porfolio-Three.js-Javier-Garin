// Vertex shader — quad a pantalla completa en cámara ortográfica
export const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Fragment shader — ruido Simplex fractal procedural
// Optimizaciones de fluidez:
//   · Movimiento circular en el tiempo (evita el "scroll diagonal" evidente)
//   · fbm normalizado correctamente a [-1,1]
//   · smoothstep con rangos más amplios → transiciones orgánicas suaves
//   · Highlights con falloff cuadrático en lugar de pow(1.5) abrupto
//   · Protección contra uContrast == 0
export const fragmentShader = `
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

// ── Simplex Noise 2D ─────────────────────────────────────────────────────────
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1  = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h  = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= (1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h));
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

// ── fBm 3 octavas normalizado ────────────────────────────────────────────────
float fbm(vec2 st) {
    float value     = 0.0;
    float amplitude = 0.5;
    float total     = 0.0;
    for (int i = 0; i < 3; i++) {
        value     += amplitude * snoise(st);
        total     += amplitude;
        st        *= 2.0;
        amplitude *= 0.5;
    }
    return value / total;   // normalizado: evita clipping en smoothstep
}

// ── fBm ligero 2 octavas para acentos ───────────────────────────────────────
float fbmLight(vec2 st) {
    return (0.667 * snoise(st) + 0.333 * snoise(st * 2.0));
}

void main() {
    // ── Movimiento circular del tiempo ───────────────────────────────────────
    // Dos frecuencias angulares distintas crean una trayectoria que nunca
    // se repite visiblemente → el fondo evoluciona, no "scrollea".
    float speed = uNoiseSpeed;
    vec2 drift  = vec2(
        cos(uTime * speed * 0.7) * 0.6 + uTime * speed * 0.08,
        sin(uTime * speed * 0.5) * 0.6 + uTime * speed * 0.05
    );

    vec2 noiseCoord = vUv * uNoiseScale + drift;

    // ── Capa base ────────────────────────────────────────────────────────────
    float baseNoise   = fbm(noiseCoord);
    float detailNoise = fbmLight(noiseCoord * 2.2 - drift * 0.4);

    // Rango amplio de smoothstep → transiciones más suaves y etéreas
    float pattern = smoothstep(-0.15, 0.65, baseNoise + 0.28 * detailNoise);
    vec3 color    = mix(uColor1, uColor2, pattern);

    // ── Capa de acentos (highlights) ─────────────────────────────────────────
    vec2 hCoord          = noiseCoord * 0.75 + vec2(5.3, 2.7) + drift * 0.15;
    float highlightNoise = fbmLight(hCoord);
    float highlights     = smoothstep(0.35, 0.65, highlightNoise);
    highlights           = highlights * highlights; // falloff cuadrático suave
    color = mix(color, uColor3, highlights * 0.55);

    // ── Ajustes finales ───────────────────────────────────────────────────────
    color = pow(max(color, vec3(0.0)), vec3(1.0 / max(uContrast, 0.01)));
    color *= uBrightness;
    color  = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
}
`;
