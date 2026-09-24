# Fase 03 — Responsive Mobile-First

## Input
- PROGRESS.md (estructura definida en fase 02)

## Tareas
1. Reescribir CSS mobile-first: estilos base para viewport pequeño, media queries `min-width` para escalar (nunca `max-width` como base).
2. Verificar `<meta name="viewport">` correcto en index.html.
3. Unidades relativas (rem/%/vw/vh/clamp()) en vez de px fijos donde afecte layout.
4. Adaptar la escena Three.js: recalcular aspect ratio y renderer.setSize en resize; capar densidad de píxeles en mobile (Math.min(devicePixelRatio, 2)).
5. Revisar controles táctiles si hay interacción con la escena (orbit/drag).
6. Fuentes: font-display: swap y precarga solo de los pesos realmente usados.

## Output esperado
Entrada en PROGRESS.md con breakpoints definidos y checklist de viewports probados (320/375/768/1024/1440).

## Criterio de salida
UI y escena 3D correctas en los 5 viewports de referencia.
