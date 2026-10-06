# Contexto del Proyecto
(No modificar sin decisión explícita del usuario — es la referencia fija para todos los agentes)

## Stack actual
- HTML5 / CSS3 vanilla / JavaScript ES6+
- Three.js ^0.175.0 (WebGL)
- GSAP ^3.12.7
- Sin bundler (public/ servido directo)
- Fuentes locales en public/fonts/

## Cambio ya decidido por el usuario
- Gestor de paquetes → **pnpm** (reemplaza npm)

## Objetivos del refactor
1. Rendimiento web y mobile (Core Web Vitals, FPS estable en gama media/baja)
2. Diseño responsivo **mobile-first** para todos los viewports
3. Código mantenible SIN sobre-ingeniería

## Restricciones duras
- No introducir frameworks (React/Vue/Svelte/etc.) — el proyecto sigue siendo vanilla.
- Cualquier herramienta nueva (bundler, compresores de assets) se propone en fase 02 con justificación de rendimiento medible, nunca por moda.
- PROGRESS.md es la única fuente de verdad del avance — prohibido duplicar estado o decisiones en otros archivos.

## Decisiones abiertas (se resuelven en fase 02, con datos de fase 01)
- ¿Se introduce un bundler ligero (ej. Vite) solo para build de producción (minificación + code-splitting de Three.js), manteniendo el dev server simple? Requiere justificación con métricas.
- ¿Compresión de texturas/modelos (KTX2/Draco) si el proyecto carga assets 3D pesados?
