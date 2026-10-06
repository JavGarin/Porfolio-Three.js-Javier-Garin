# Agents Harness — Refactor porfolio-three.js-javier-garin

## Propósito
Este directorio es el harness de spec-driven development para refactorizar el proyecto. Cualquier modelo/agente que se incorpore DEBE seguir este protocolo antes de tocar código.

## Protocolo de arranque (obligatorio, en este orden)
1. Leer `CONTEXT.md` — stack, restricciones y objetivos. No cambia salvo decisión explícita del usuario.
2. Leer `PROGRESS.md` completo — historial de sesiones, fase activa, última entrada.
3. Abrir SOLO el archivo de la fase activa en `phases/0X-*.md` y ejecutar lo que ahí se define. No adelantar fases.
4. Antes de terminar la sesión: añadir una entrada a `PROGRESS.md` usando `templates/entry-template.md`.

## Fases (secuenciales, no paralelas)
| Fase | Archivo | Objetivo |
|---|---|---|
| 01 | phases/01-audit.md | Medir el estado actual (perf, bundle, responsive) |
| 02 | phases/02-architecture.md | Estructura de módulos + decisión de tooling |
| 03 | phases/03-mobile-first-responsive.md | Refactor CSS/HTML mobile-first |
| 04 | phases/04-performance-threejs.md | Optimización Three.js/GSAP |
| 05 | phases/05-qa-validation.md | Validación final y cierre |

## Reglas duras (no negociables)
- Gestor de paquetes: **pnpm** únicamente.
- Prohibida la sobre-ingeniería: no frameworks, no state managers, no abstracciones sin necesidad medible en PROGRESS.md.
- Prohibido el uso de APIs obsoletas o deprecated (ver `rules/no-deprecated-code.md`).
- Toda decisión de arquitectura se documenta en PROGRESS.md — nunca queda solo "en la cabeza" del agente.
- No se avanza de fase sin cerrar la entrada de la fase anterior en PROGRESS.md.
