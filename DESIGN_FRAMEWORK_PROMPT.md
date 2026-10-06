# Neo-Frame Canvas UI (Floating Viewport Design System)

> **Nombre del estilo propuesto:** **Neo-Frame Canvas** *(o "Floating Viewport UI")*  
> **Esencia:** Marco flotante suspendido sobre un fondo infinito, con bordes milimétricos, esquinas redondeadas, micro-márgenes progresivos y disposición periférica de elementos (cabecera arriba, botones en esquinas inferiores, modal flotante con glassmorphism).

---

## 📋 Prompt Maestro para reutilizar en otros proyectos (Landing, E-commerce, SaaS)

Puedes copiar y pegar este prompt directamente en cualquier asistente de IA (Gemini, Claude, ChatGPT) para crear una interfaz con este mismo estilo:

```markdown
Actúa como un Diseñador UI/UX Senior y Desarrollador Frontend experto. Necesito que diseñes e implementes la interfaz de un Hero Section (o página completa) utilizando el estilo de diseño "Neo-Frame Canvas" (Floating Viewport UI).

### Concepto Visual y Estilo ("Neo-Frame Canvas"):
1. **Efecto Flotante Periférico:**
   - La pantalla completa tiene un fondo base oscuro o dinámico (video, canvas o gradiente sutil).
   - En lugar de ocupar el 100% del borde de la pantalla de forma convencional, el contenido principal se aloja dentro de un "Contenedor Marco" (`.main-container`) con márgenes externos periféricos (`inset: 8px` en móvil, escalando hasta `inset: 26px` en desktop grande).
   - Este marco tiene bordes redondeados (`border-radius: 12px` a `18px`) y un borde sutil y elegante (`border: 1px solid rgba(255, 255, 255, 0.12 - 0.14)`).
   - Gracias a los márgenes perimetrales, da la sensación óptica premium de que la interfaz está "flotando suspendida" como una pantalla o dispositivo dentro del viewport.

2. **Distribución del Contenido (Layout de 4 Vértices):**
   - **Vértice Superior Izquierdo:** Identidad, título principal (H1) y subtítulo/rol o propuesta de valor (H2) con tipografía minimalista y tamaño fluido vía `clamp()`.
   - **Vértice Superior Derecho:** Controles secundarios (selector de idioma, switch de tema o badge de estado).
   - **Vértice Inferior Izquierdo:** Marca de agua o copyright sutil (`opacity: 0.35`, tamaño pequeño, no interactuable).
   - **Vértice Inferior Derecho:** Menú de navegación / Acciones principales / CTAs (enlaces directos a secciones, modal interactivo o carrito de compra) alineados al borde inferior derecho con touch targets cómodos.
   - **Panel Modal / Drawer Flotante:** Un panel lateral o tarjeta modal (`.info-panel`) con fondo semitransparente oscuro (`background: rgba(14, 14, 14, 0.92)` en mobile / `rgba(18, 18, 18, 0.45)` en desktop) y desenfoque `backdrop-filter: blur(16px)`. En mobile tiene `height: auto` para respetar el tamaño del texto y no tapar los enlaces inferiores.

3. **Paleta y Tipografía:**
   - Fondo exterior: `#000000`.
   - Superficies: Negros profundos con bordes translúcidos (`rgba(255, 255, 255, 0.14)`).
   - Texto principal: Blanco roto (`#f8f8f8`) y gris secundario (`#a0a0a0`).
   - Color de acento vivo (ej. Coral / Rojo neón `#e74d4d`, o el acento del e-commerce) para estados hover, active y botones de acción.
   - Tipografía: Monospace limpia o Sans-Serif técnica moderna con espaciados calculados y fluidos vía CSS `clamp()`.

4. **Requisitos Técnicos:**
   - HTML5 semántico y CSS3 puro (Mobile-First con CSS Variables).
   - Reactividad ligera para apertura/cierre de paneles (Alpine.js o vanilla JavaScript).
   - Accesibilidad: aria-labels, touch-targets de mínimo 40-44px y compatibilidad perfecta en viewports móviles (320px) hasta pantallas 2K/4K.
   - NO incluir dependencias 3D pesadas (permitir cualquier fondo CSS, SVG, video o gradiente).
```

---

## 🧱 Estructura Base HTML (Plantilla Limpia)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neo-Frame Canvas Hero</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body x-data="{ showPanel: false, panelTitle: '', panelBody: '', activeLink: null,
  open(title, body, key) {
    if (this.showPanel && this.activeLink === key) { this.close(); return; }
    this.panelTitle = title; this.panelBody = body; this.activeLink = key; this.showPanel = true;
  },
  close() { this.showPanel = false; this.activeLink = null; }
}">

  <!-- Capa 1: Fondo Exterior Infinito -->
  <div class="background-canvas">
    <!-- Aquí puedes colocar un degradado, video o fondo abstracto -->
  </div>

  <!-- Capa 2: Marco Flotante Suspendido -->
  <main class="main-container">
    <div class="content-frame">
      
      <!-- Vértice Superior: Header & Acciones Rápidas -->
      <header class="frame-header">
        <div class="brand">
          <h1>Nombre Marca / Proyecto</h1>
          <h2>Concepto / Propuesta de Valor</h2>
        </div>
        <div class="header-actions">
          <!-- Botón de acción rápida, idioma o badge -->
          <span class="badge-status">DISPONIBLE 2026</span>
        </div>
      </header>

      <!-- Panel Desplegable Flotante (Glassmorphism) -->
      <aside class="floating-panel"
             x-show="showPanel"
             @click.outside="close()"
             x-cloak>
        <button class="close-btn" @click="close()" aria-label="Cerrar">&times;</button>
        <div class="panel-inner">
          <h3 x-text="panelTitle"></h3>
          <p x-text="panelBody"></p>
        </div>
      </aside>

      <!-- Vértice Inferior Izquierdo: Marca de agua -->
      <div class="frame-watermark">Marca Registrada®</div>

      <!-- Vértice Inferior Derecho: CTAs / Navegación -->
      <nav class="frame-nav">
        <button @click="open('Acerca de', 'Descripción detallada de la propuesta de valor...', 'about')"
                :class="{ 'active': activeLink === 'about' }">
          Acerca de
        </button>
        <button @click="open('Productos', 'Catálogo o características exclusivas...', 'products')"
                :class="{ 'active': activeLink === 'products' }">
          Productos
        </button>
        <button @click="open('Contacto', 'dev.ejemplo@correo.com | Enlaces directos...', 'contact')"
                :class="{ 'active': activeLink === 'contact' }">
          Contacto
        </button>
      </nav>

    </div>
  </main>

  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</body>
</html>
```

---

## 🎨 Hoja de Estilos CSS Base (`style.css`)

```css
/* Tokens de Diseño — Neo-Frame Canvas */
:root {
  --bg-dark: #000000;
  --color-white: #f8f8f8;
  --color-gray: #a0a0a0;
  --color-accent: #e74d4d;
  
  --frame-border: rgba(255, 255, 255, 0.14);
  --panel-bg-mobile: rgba(14, 14, 14, 0.94);
  --panel-bg-desktop: rgba(18, 18, 18, 0.50);
  
  /* Márgenes exteriores dinámicos que generan la ilusión flotante */
  --frame-inset: 8px;
  --frame-radius: 12px;
  --frame-padding: 14px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; overflow: hidden; background: var(--bg-dark); color: var(--color-white); font-family: system-ui, sans-serif; }
[x-cloak] { display: none !important; }

/* Fondo exterior base */
.background-canvas {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, #161616 0%, #050505 100%);
  z-index: 1;
}

/* Marco Flotante con Inset perimetral */
.main-container {
  position: fixed;
  inset: var(--frame-inset);
  z-index: 2;
  pointer-events: none;
}

.content-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px solid var(--frame-border);
  border-radius: var(--frame-radius);
  overflow: hidden;
  pointer-events: auto;
}

/* Header */
.frame-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--frame-padding);
  z-index: 20;
}

.brand h1 {
  font-size: clamp(1.2rem, 4.5vw, 2.2rem);
  font-weight: 400;
  letter-spacing: 0.5px;
}
.brand h2 {
  font-size: clamp(0.75rem, 2.5vw, 1rem);
  color: var(--color-gray);
  font-weight: 300;
}

.badge-status {
  font-size: 0.75rem;
  letter-spacing: 1px;
  border: 1px solid var(--frame-border);
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
}

/* Panel Desplegable (Altura fluida, nunca bloquea el menú inferior en mobile) */
.floating-panel {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: auto;
  height: auto;
  max-height: calc(100% - 95px);
  background: var(--panel-bg-mobile);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--frame-border);
  border-radius: var(--frame-radius);
  padding: 20px 18px 28px 20px;
  z-index: 100;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--color-gray);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 6px;
}

/* Vértices Inferiores */
.frame-watermark {
  position: absolute;
  bottom: 12px;
  left: 14px;
  font-size: clamp(0.5rem, 1.8vw, 0.65rem);
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
  z-index: 10;
}

.frame-nav {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  z-index: 110; /* Prioridad para interacción */
}

.frame-nav button {
  background: none;
  border: none;
  color: var(--color-white);
  font-size: clamp(0.72rem, 2.4vw, 0.85rem);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  padding: 6px 4px;
  transition: color 0.2s ease, opacity 0.2s ease;
  opacity: 0.8;
}

.frame-nav button:hover,
.frame-nav button.active {
  color: var(--color-accent);
  opacity: 1;
}

/* Breakpoints Progresivos */
@media (min-width: 768px) {
  :root {
    --frame-inset: 16px;
    --frame-radius: 16px;
    --frame-padding: 24px;
  }
  
  .floating-panel {
    top: 20px;
    right: 22px;
    left: auto;
    width: 340px;
    background: var(--panel-bg-desktop);
    max-height: calc(100% - 80px);
  }
}

@media (min-width: 1200px) {
  :root {
    --frame-inset: 24px;
    --frame-radius: 18px;
    --frame-padding: 32px;
  }
}
```
