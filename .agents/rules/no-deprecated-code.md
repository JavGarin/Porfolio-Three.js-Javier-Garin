# Regla: Código Moderno y Prohibición de APIs Deprecated (2025-2026)

- **Prohibido el uso de APIs obsoletas o marcadas como deprecated**:
  Todo el código implementado o refactorizado en este proyecto debe cumplir rigurosamente con los estándares web y de bibliotecas actuales (2025-2026).

- **Three.js (^0.175.0+)**:
  - **No usar `Clock`**: `Clock` presenta inconsistencias históricas de delta en cambios de pestaña y está deprecado en Three.js moderno.
  - **Usar `Timer`**: Importar `Timer` desde `three/addons/misc/Timer.js`.
  - **Ciclo de vida con `Timer`**:
    - Instanciar: `timer = new Timer();`
    - Actualizar por frame: `timer.update(currentTime);`
    - Obtener tiempo transcurrido / delta: `timer.getElapsed()`, `timer.getDelta()`.
    - Reseteo tras inactividad: `timer.reset()` en `resumeBackground()` o handlers de visibilidad.
    - Limpieza: `timer.dispose()` en la función de desmontaje (`disposeBackground()`).

- **Estándares Web y DOM**:
  - **Portapapeles**: No utilizar `document.execCommand('copy')`. Usar la API asíncrona estándar `navigator.clipboard.writeText()`.
  - **HTML semántico**: No usar enlaces o atributos legacy como `rel="shortcut icon"` (usar únicamente `rel="icon"`).
