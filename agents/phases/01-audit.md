# Fase 01 — Auditoría

## Input
- CONTEXT.md
- Código actual en public/

## Tareas
1. Medir peso actual de assets (JS, texturas, modelos 3D, fuentes).
2. Ejecutar Lighthouse (mobile + desktop) y registrar baseline (Performance, LCP, TBT, CLS).
3. Medir FPS de la escena Three.js emulando un dispositivo de gama media.
4. Revisar el CSS actual: ¿hay media queries? ¿enfoque desktop-first o mobile-first?
5. Listar dependencias realmente usadas vs. declaradas en package.json.

## Output esperado
Entrada en PROGRESS.md con: tabla de métricas base, hallazgos priorizados (alto/medio/bajo impacto), y recomendación (sí/no) sobre bundler, con evidencia.

## Criterio de salida
Métricas base documentadas + mínimo 3 cuellos de botella identificados con evidencia, no opinión.
