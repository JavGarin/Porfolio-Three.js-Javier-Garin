import Alpine from 'alpinejs';
import './style.css';

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
