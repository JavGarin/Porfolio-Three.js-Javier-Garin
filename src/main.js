import Alpine from 'alpinejs';
import './style.css';

// Registrar componente reactivo de la aplicación
Alpine.data('portfolioApp', () => ({
    activeLink: null,
    showPanel: false,
    panelContent: '',
    currentLang: 'es',
    currentTheme: document.documentElement.getAttribute('data-theme') || 'dark',

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.setAttribute('content', theme === 'dark' ? '#000000' : '#f0e6e2');
        }
        if (window.__updateThreeTheme) {
            window.__updateThreeTheme(theme);
        }
        window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }));
    },

    openPanel(templateId, linkName) {
        if (this.showPanel && this.activeLink === linkName) {
            this.closePanel();
            return;
        }
        const template = document.getElementById(templateId);
        if (template) {
            const contentClone = template.content.cloneNode(true);
            this.panelContent = '';
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(contentClone);
            this.panelContent = tempDiv.innerHTML;
            this.activeLink = linkName;
            this.showPanel = true;
        } else {
            console.error('Template no encontrado:', templateId);
            this.panelContent = '<p>Error: Contenido no encontrado.</p>';
            this.activeLink = linkName;
            this.showPanel = true;
        }
    },

    closePanel() {
        this.showPanel = false;
        this.activeLink = null;
    },

    setLang(lang) {
        this.currentLang = lang;
        if (this.showPanel && this.activeLink) {
            const activeTemplateId = `template-${this.activeLink}`;
            this.openPanel(activeTemplateId, this.activeLink);
        }
    }
}));

// Registrar Alpine globalmente y arrancarlo de inmediato
window.Alpine = Alpine;
Alpine.start();

// Code-splitting: Carga diferida y asíncrona del módulo Three.js
// Permite que la UI, Alpine y el CSS se pinten inmediatamente (FCP instantáneo)
function loadBackground() {
    import('./three/shaderBackground.js')
        .then(({ initBackground }) => {
            initBackground();
        })
        .catch((err) => {
            console.error('Error al inicializar fondo Three.js:', err);
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBackground);
} else {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(loadBackground);
    } else {
        setTimeout(loadBackground, 0);
    }
}
