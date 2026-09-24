# Fase 04 — Performance Three.js / GSAP

## Input
- PROGRESS.md (fases 01 y 03)

## Tareas
1. Capar pixelRatio (ver fase 03) y throttlear el render loop si no se necesita animación continua.
2. Reducir polycount, reutilizar materiales/geometrías en vez de instanciar repetido, `dispose()` al remover objetos.
3. Comprimir texturas (resolución acorde al viewport, mipmaps).
4. Evaluar lazy load de modelos/escenas pesadas fuera del viewport inicial.
5. Consolidar timelines de GSAP (evitar tweens redundantes sobre el mismo elemento).
6. Si en fase 02 se adoptó bundler: tree-shaking y code-splitting de Three.js (importar solo submódulos usados).

## Output esperado
Entrada en PROGRESS.md con métricas post-optimización comparadas contra la baseline de fase 01.

## Criterio de salida
Mejora medible en FPS y/o Lighthouse Performance frente a fase 01, sin regresiones visuales.
