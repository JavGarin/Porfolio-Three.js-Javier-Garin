# Fase 02 — Arquitectura y Tooling

## Input
- PROGRESS.md (hallazgos de fase 01)
- CONTEXT.md

## Tareas
1. Definir estructura de módulos JS (ej. src/scene.js, camera.js, lights.js, models.js, animations.js, ui.js, utils.js) — SOLO si el tamaño/complejidad actual de index.js lo justifica.
2. Resolver la decisión de bundler pendiente en CONTEXT.md usando datos de fase 01 (no por defecto).
3. Migrar el gestor de paquetes a pnpm: pnpm-lock.yaml + script `dev` real en package.json.
4. Definir convención de carpetas (public/ vs src/ si aplica).

## Output esperado
Entrada en PROGRESS.md con la estructura de carpetas final y la decisión de tooling justificada en 2-3 líneas.

## Criterio de salida
package.json con pnpm configurado y script `dev` funcional. Estructura de módulos documentada.
