/**
 * MundoFutbol — Android TV & Smart TV Navigation Engine
 * Cursor virtual persistente (siempre activo) controlado por control remoto.
 */

(function() {
    // 1. Detección de entorno de TV
    window.isTV = /TV|SmartTV|AndroidTV|AppleTV|Roku|Tizen|Web0S|NetCast|Opera TV|Viera|Cast|BRAVIA|MundoFutbolTV/i.test(navigator.userAgent) || 
                  (window.innerWidth >= 960 && window.innerHeight >= 540 && !('ontouchstart' in window) && !/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent));

    console.log('[TV Engine] Inicializando cursor virtual persistente. TV Detectada:', window.isTV);

    // Si no es TV ni Wrapper, no activar cursor para evitar interferencias en PC/móvil con mouse real
    if (!window.isTV) {
        console.log('[TV Engine] Cursor desactivado (No es entorno de TV).');
        return;
    }

    // Coordenadas iniciales del cursor (centro de la pantalla)
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    
    // Movimiento continuo
    let keyState = { up: false, down: false, left: false, right: false };
    let cursorInterval = null;
    const CURSOR_SPEED = 16; // Velocidad del cursor (píxeles por frame)

    // Inicializar elementos visuales cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        initTvCursor();
        setupKeyListeners();
        
        // Mantener el cursor al frente
        setInterval(() => {
            const cursor = document.getElementById('virtualCursor');
            if (cursor && cursor.parentElement) {
                // Si por alguna razón se re-renderiza el body y queda atrás, traerlo al frente
                if (cursor.parentElement.lastElementChild !== cursor) {
                    document.body.appendChild(cursor);
                }
            }
        }, 3000);
    });

    // Crear el elemento visual del cursor (resplandor naranja premium)
    function initTvCursor() {
        if (document.getElementById('virtualCursor')) return;

        const cursor = document.createElement('div');
        cursor.id = 'virtualCursor';
        // Forzar clase activa para que siempre sea visible
        cursor.className = 'active';
        document.body.appendChild(cursor);

        // Posicionar cursor en el centro inicialmente
        updateCursorPosition();
        
        showTVToast("Control por Cursor Activo 🖱️");
    }

    // Actualizar posición física del cursor
    function updateCursorPosition() {
        const cursor = document.getElementById('virtualCursor');
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
    }

    // Mostrar notificaciones en pantalla adaptadas para TV
    window.showTVToast = function(msg) {
        let toast = document.getElementById('tvToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'tvToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 50px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: rgba(249, 115, 22, 0.95);
                color: #fff;
                padding: 14px 28px;
                border-radius: 40px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 0.82rem;
                font-weight: 700;
                z-index: 1000000;
                box-shadow: 0 12px 36px rgba(0,0,0,0.65), 0 0 25px rgba(249,115,22,0.3);
                transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
                opacity: 0;
                pointer-events: none;
            `;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        
        toast.timeoutId = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 3000);
    };

    // Bucle de animación suave del cursor (60fps)
    function startCursorMovement() {
        if (cursorInterval) return;
        cursorInterval = setInterval(() => {
            let dx = 0;
            let dy = 0;
            if (keyState.left) dx = -CURSOR_SPEED;
            if (keyState.right) dx = CURSOR_SPEED;
            if (keyState.up) dy = -CURSOR_SPEED;
            if (keyState.down) dy = CURSOR_SPEED;
            
            if (dx !== 0 || dy !== 0) {
                cursorX = Math.max(10, Math.min(window.innerWidth - 10, cursorX + dx));
                cursorY = Math.max(10, Math.min(window.innerHeight - 10, cursorY + dy));
                updateCursorPosition();
            }
        }, 16);
    }

    function stopCursorMovement() {
        if (!keyState.left && !keyState.right && !keyState.up && !keyState.down) {
            clearInterval(cursorInterval);
            cursorInterval = null;
        }
    }

    // Simular un clic en la coordenada actual del cursor
    function simulateCursorClick() {
        const el = document.elementFromPoint(cursorX, cursorY);
        if (!el) return;

        console.log('[TV Engine] Clic en coordenadas:', cursorX, cursorY, 'Elemento:', el.tagName, el.id, el.className);

        // Efecto visual rápido de pulsación del cursor
        const cursorEl = document.getElementById('virtualCursor');
        if (cursorEl) {
            cursorEl.style.transform = 'translate(-50%, -50%) scale(0.6)';
            setTimeout(() => { cursorEl.style.transform = 'translate(-50%, -50%) scale(1)'; }, 150);
        }

        // Si es un iframe, transferirle el foco
        if (el.tagName === 'IFRAME') {
            el.focus();
            showTVToast("Reproductor enfocado. Presiona Atrás en el control para salir.");
            return;
        }

        // Hacer clic nativo en el elemento
        el.click();

        // Si es un input de texto, enfocarlo
        if (el.tagName === 'INPUT') {
            el.focus();
        }
    }

    // Configurar los escuchas de teclas
    function setupKeyListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key;

            // 1. Botón Atrás (Cierra el reproductor)
            if (key === 'Backspace' || key === 'Escape' || e.keyCode === 10009 || e.keyCode === 461) {
                const playerModal = document.getElementById('playerModal');
                const isPlayerActive = playerModal && (playerModal.classList.contains('active') || playerModal.style.display === 'flex');
                
                if (isPlayerActive) {
                    e.preventDefault();
                    if (typeof closePlayer === 'function') {
                        closePlayer();
                        showTVToast("Reproductor Cerrado.");
                    }
                    return;
                }
            }

            // 2. Movimiento con Flechas
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                e.preventDefault();
                
                if (key === 'ArrowUp') keyState.up = true;
                if (key === 'ArrowDown') keyState.down = true;
                if (key === 'ArrowLeft') keyState.left = true;
                if (key === 'ArrowRight') keyState.right = true;
                
                startCursorMovement();
            }

            // 3. Botón de Selección (OK/Enter)
            if (key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                simulateCursorClick();
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                if (key === 'ArrowUp') keyState.up = false;
                if (key === 'ArrowDown') keyState.down = false;
                if (key === 'ArrowLeft') keyState.left = false;
                if (key === 'ArrowRight') keyState.right = false;
                
                stopCursorMovement();
            }
        });
    }
})();
