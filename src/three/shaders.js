// =============================================================================
//  shaders.js — Sistema de Particulas "Viento Cosmico"
//  · vertexShader: pasa posicion y tamano. Sin calculo adicional.
//  · fragmentShader: circulo suave con falloff Gaussiano via gl_PointCoord.
//    dot(uv,uv) evita sqrt; exp() da borde difuminado cosmico natural.
// =============================================================================

export const vertexShader = `
attribute float aSize;
attribute float aOpacity;

varying float vOpacity;

void main() {
    vOpacity     = aOpacity;
    gl_PointSize = aSize;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = `
uniform vec3 uColor;
varying float vOpacity;

void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float r2 = dot(uv, uv);
    if (r2 > 0.25) discard;

    float alpha = exp(-r2 * 9.0) * vOpacity;
    gl_FragColor = vec4(uColor, alpha);
}
`;
