/**
 * MundoFutbol — Android TV & Smart TV Navigation Engine
 * Proporciona navegación espacial D-pad premium y cursor virtual con control remoto.
 */

(function() {
    // 1. Detección de entorno de TV
    window.isTV = /TV|SmartTV|AndroidTV|AppleTV|Roku|Tizen|Web0S|NetCast|Opera TV|Viera|Cast|BRAVIA|MundoFutbolTV/i.test(navigator.userAgent) || 
                  (window.innerWidth >= 960 && window.innerHeight >= 540 && !('ontouchstart' in window) && !/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent));

    console.log('[TV Engine] Inicializando motor de navegación. TV Detectada:', window.isTV);

    // selectores de elementos navegables
    const FOCUSABLE_SELECTOR = 'a.nav-link, a.mobile-nav-link, .match-card, .featured-card, .featured-final-card, .channel-card, .popular-channel-card, .match-card-large, .featured-channel-card, .trending-banner-card, .event-card, .apk-btn, .search-input, .event-ch-btn, .player-back-btn, .report-btn, .mob-ctrl-btn, #loginBtn, #installBtn, .view-channels-btn, .signal-option, .player-modal-close';

    // Estados de navegación
    let currentMode = 'dpad'; // 'dpad' | 'cursor'
    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    
    // Movimiento continuo del cursor
    let keyState = { up: false, down: false, left: false, right: false };
    let cursorInterval = null;
    const CURSOR_SPEED = 15; // Velocidad del cursor (píxeles por frame)

    // Inicializar elementos visuales una vez cargado el DOM
    document.addEventListener('DOMContentLoaded', () => {
        initTvWidgets();
        setupMutationObserver();
        setupKeyListeners();
        
        // Ejecución inicial de índices
        setTimeout(ensureTabIndices, 800);
        setTimeout(ensureTabIndices, 2000);
    });

    // Crear elementos de control flotantes en el DOM
    function initTvWidgets() {
        if (document.getElementById('virtualCursor')) return;

        // 1. Cursor Virtual (Glow Naranja)
        const cursor = document.createElement('div');
        cursor.id = 'virtualCursor';
        document.body.appendChild(cursor);

        // 2. Control Flotante de Modo
        const toggle = document.createElement('div');
        toggle.id = 'navModeToggle';
        toggle.tabIndex = 0;
        toggle.innerHTML = `
            <span class="toggle-badge">Modo D-pad 🎮</span>
            <span>OK para Cursor 🖱️</span>
            <span class="toggle-hint">(O pulsa Atrás/Menú)</span>
        `;
        document.body.appendChild(toggle);

        // Cambiar modo al hacer clic en el widget flotante
        toggle.addEventListener('click', toggleNavigationMode);

        // 3. Mostrar widget automáticamente si es TV
        if (window.isTV) {
            toggle.classList.add('visible');
        }

        // Posicionar cursor en el centro
        updateCursorPosition();
    }

    // Actualizar coordenadas del cursor virtual
    function updateCursorPosition() {
        const cursor = document.getElementById('virtualCursor');
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
    }

    // Cambiar entre modo Botones (D-pad) y modo Cursor (Mouse virtual)
    window.setNavigationMode = function(mode) {
        currentMode = mode;
        const cursorEl = document.getElementById('virtualCursor');
        const toggleEl = document.getElementById('navModeToggle');
        
        if (mode === 'cursor') {
            if (cursorEl) cursorEl.classList.add('active');
            if (toggleEl) {
                toggleEl.querySelector('.toggle-badge').innerHTML = 'Modo: Cursor 🖱️';
                toggleEl.querySelector('.toggle-badge').nextElementSibling.innerHTML = 'Pulsa OK para D-pad 🎮';
                toggleEl.classList.add('visible');
            }
            if (document.activeElement) document.activeElement.blur();
            showTVToast("Cursor activado. Navega con las Flechas.");
        } else {
            if (cursorEl) cursorEl.classList.remove('active');
            if (toggleEl) {
                toggleEl.querySelector('.toggle-badge').innerHTML = 'Modo: D-pad 🎮';
                toggleEl.querySelector('.toggle-badge').nextElementSibling.innerHTML = 'Pulsa OK para Cursor 🖱️';
                
                const playerModal = document.getElementById('playerModal');
                const isPlayerActive = playerModal && (playerModal.classList.contains('active') || playerModal.style.display === 'flex');
                if (!isPlayerActive && !window.isTV) {
                    toggleEl.classList.remove('visible');
                }
            }
            // Enfocar el primer elemento navegable actual
            const elements = getFocusableElements();
            if (elements.length > 0) {
                elements[0].focus();
                scrollActiveElement(elements[0]);
            }
            showTVToast("Modo Botones activado.");
        }
    };

    window.toggleNavigationMode = function() {
        window.setNavigationMode(currentMode === 'dpad' ? 'cursor' : 'dpad');
    };

    // Mostrar Notificación en Pantalla optimizada para TV
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
        
        // Limpiar toast previo
        if (toast.timeoutId) clearTimeout(toast.timeoutId);
        
        toast.timeoutId = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(100px)';
        }, 3200);
    };

    // Obtener elementos focusables visibles en la pantalla actual
    function getFocusableElements() {
        const elements = Array.from(document.querySelectorAll(FOCUSABLE_SELECTOR));
        return elements.filter(el => {
            if (el.id === 'virtualCursor' || el.id === 'tvToast') return false;
            
            // Si el modo toggle está oculto, no incluirlo
            if (el.id === 'navModeToggle' && !el.classList.contains('visible')) return false;

            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

            // Verificar si el elemento está visible subiendo en el árbol de padres
            let p = el.parentElement;
            while (p) {
                const pStyle = window.getComputedStyle(p);
                if (pStyle.display === 'none' || pStyle.visibility === 'hidden') return false;
                p = p.parentElement;
            }

            // Excluir elementos que están en páginas inactivas
            const page = el.closest('.page');
            if (page && !page.classList.contains('active') && page.style.display === 'none') return false;
            
            return true;
        });
    }

    // Asegurar que todos los elementos navegables tengan tabindex="0"
    function ensureTabIndices() {
        const elements = document.querySelectorAll(FOCUSABLE_SELECTOR);
        elements.forEach(el => {
            if (el.getAttribute('tabindex') !== '0') {
                el.setAttribute('tabindex', '0');
            }
        });
    }

    // Observador de mutaciones para añadir tabindex a elementos inyectados dinámicamente
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach(m => {
                if (m.addedNodes.length > 0) shouldUpdate = true;
            });
            if (shouldUpdate) {
                ensureTabIndices();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Centrar suavemente el elemento en pantalla
    function scrollActiveElement(el) {
        if (!el) return;
        el.scrollIntoView({
            behavior: window.isTV ? 'auto' : 'smooth', // Instantáneo en TV para evitar stutter
            block: 'center',
            inline: 'center'
        });
    }

    // Bucle para el movimiento suave y continuo del cursor virtual
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
                cursorX = Math.max(12, Math.min(window.innerWidth - 12, cursorX + dx));
                cursorY = Math.max(12, Math.min(window.innerHeight - 12, cursorY + dy));
                updateCursorPosition();
            }
        }, 16); // Aproximadamente 60 FPS para máxima suavidad
    }

    function stopCursorMovement() {
        if (!keyState.left && !keyState.right && !keyState.up && !keyState.down) {
            clearInterval(cursorInterval);
            cursorInterval = null;
        }
    }

    // Simula hacer clic en las coordenadas del cursor
    function simulateCursorClick() {
        const el = document.elementFromPoint(cursorX, cursorY);
        if (!el) return;

        console.log('[TV Engine] Simulando click en elemento:', el.tagName, el.id, el.className);

        // Efecto visual rápido de pulsación del cursor
        const cursorEl = document.getElementById('virtualCursor');
        if (cursorEl) {
            cursorEl.style.transform = 'translate(-50%, -50%) scale(0.7)';
            setTimeout(() => { cursorEl.style.transform = 'translate(-50%, -50%) scale(1)'; }, 150);
        }

        // Si es un Iframe, el navegador bloquea eventos internos por seguridad
        if (el.tagName === 'IFRAME') {
            el.focus();
            showTVToast("Reproductor Enfocado. Usa control del Iframe.");
            return;
        }

        // Disparar click nativo
        el.click();

        // Si es un elemento interactivo, transferirle el foco nativo
        if (typeof el.focus === 'function' && el.matches(FOCUSABLE_SELECTOR)) {
            el.focus();
        }
    }

    // Algoritmo de Navegación Espacial 2D con puntuación por vectores
    function handleDpadNavigation(direction) {
        const active = document.activeElement;
        const candidates = getFocusableElements();
        
        if (candidates.length === 0) return;

        // Si no hay elemento activo o no pertenece a los focusables, enfocar el primero
        if (!active || !active.matches(FOCUSABLE_SELECTOR) || !candidates.includes(active)) {
            candidates[0].focus();
            scrollActiveElement(candidates[0]);
            return;
        }

        const currRect = active.getBoundingClientRect();
        const currCenter = {
            x: currRect.left + currRect.width / 2,
            y: currRect.top + currRect.height / 2
        };

        let bestCandidate = null;
        let lowestScore = Infinity;

        candidates.forEach(cand => {
            if (cand === active) return;

            const candRect = cand.getBoundingClientRect();
            const candCenter = {
                x: candRect.left + candRect.width / 2,
                y: candRect.top + candRect.height / 2
            };

            const dx = candCenter.x - currCenter.x;
            const dy = candCenter.y - currCenter.y;

            let dProj = 0;   // Distancia en la dirección proyectada
            let dOrtho = 0;  // Desviación ortogonal (perpendicular)

            if (direction === 'right') {
                dProj = dx;
                dOrtho = Math.abs(dy);
            } else if (direction === 'left') {
                dProj = -dx;
                dOrtho = Math.abs(dy);
            } else if (direction === 'down') {
                dProj = dy;
                dOrtho = Math.abs(dx);
            } else if (direction === 'up') {
                dProj = -dy;
                dOrtho = Math.abs(dx);
            }

            // Descartar si está en la dirección contraria (tolerancia de 6px por bordes)
            if (dProj <= -6) return;

            // Fórmula de Costo de Navegación Espacial: Penalizar desvíos laterales
            const score = dProj + 2.8 * dOrtho;

            if (score < lowestScore) {
                lowestScore = score;
                bestCandidate = cand;
            }
        });

        if (bestCandidate) {
            bestCandidate.focus();
            scrollActiveElement(bestCandidate);
        }
    }

    // Configurar escuchas de teclado globales para mandos de TV
    function setupKeyListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key;
            
            // 1. Manejo del botón Atrás (Backspace/Escape o códigos TV específicos)
            if (key === 'Backspace' || key === 'Escape' || e.keyCode === 10009 || e.keyCode === 461) {
                const playerModal = document.getElementById('playerModal');
                const isPlayerActive = playerModal && (playerModal.classList.contains('active') || playerModal.style.display === 'flex');
                
                if (isPlayerActive) {
                    e.preventDefault();
                    if (typeof closePlayer === 'function') {
                        closePlayer();
                        showTVToast("Reproductor Cerrado.");
                        // Regresar foco al grid
                        setTimeout(() => {
                            const elements = getFocusableElements();
                            if (elements.length > 0) {
                                elements[0].focus();
                                scrollActiveElement(elements[0]);
                            }
                        }, 400);
                    }
                    return;
                }
            }

            // 2. Tecla Menú o Info (ej. F2, KeyM o código de control) para alternar cursor manual
            if (key === 'F2' || key === 'Info' || key === 'Menu' || e.keyCode === 10114 || e.keyCode === 458) {
                e.preventDefault();
                toggleNavigationMode();
                return;
            }

            // 3. Manejo de Flechas D-pad
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                e.preventDefault();
                
                if (currentMode === 'cursor') {
                    // Marcar estado del botón presionado para movimiento continuo
                    if (key === 'ArrowUp') keyState.up = true;
                    if (key === 'ArrowDown') keyState.down = true;
                    if (key === 'ArrowLeft') keyState.left = true;
                    if (key === 'ArrowRight') keyState.right = true;
                    
                    startCursorMovement();
                } else {
                    // Navegación espacial D-pad
                    const dirMap = {
                        'ArrowUp': 'up',
                        'ArrowDown': 'down',
                        'ArrowLeft': 'left',
                        'ArrowRight': 'right'
                    };
                    handleDpadNavigation(dirMap[key]);
                }
            }

            // 4. Manejo del botón de selección OK / Enter
            if (key === 'Enter' || e.keyCode === 13) {
                if (currentMode === 'cursor') {
                    e.preventDefault();
                    simulateCursorClick();
                } else {
                    // En modo D-pad, si no hay nada enfocado, OK activa el primer botón
                    const active = document.activeElement;
                    if (!active || active === document.body) {
                        e.preventDefault();
                        const elements = getFocusableElements();
                        if (elements.length > 0) {
                            elements[0].focus();
                            scrollActiveElement(elements[0]);
                        }
                    }
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                if (currentMode === 'cursor') {
                    if (key === 'ArrowUp') keyState.up = false;
                    if (key === 'ArrowDown') keyState.down = false;
                    if (key === 'ArrowLeft') keyState.left = false;
                    if (key === 'ArrowRight') keyState.right = false;
                    
                    stopCursorMovement();
                }
            }
        });
    }

    // 5. Automatización: Cambiar dinámicamente a Cursor al abrir reproductor, volver a D-pad al cerrar
    let lastPlayerActive = false;
    setInterval(() => {
        const playerModal = document.getElementById('playerModal');
        if (playerModal) {
            const isActive = playerModal.classList.contains('active') || playerModal.style.display === 'flex';
            if (isActive !== lastPlayerActive) {
                lastPlayerActive = isActive;
                if (isActive) {
                    // Retrasar levemente para dar tiempo a la animación de apertura del modal
                    setTimeout(() => {
                        window.setNavigationMode('cursor');
                        // Posicionar el cursor sobre el centro superior de la pantalla (donde suele estar el Play del iframe)
                        cursorX = window.innerWidth / 2;
                        cursorY = window.innerHeight * 0.45;
                        updateCursorPosition();
                    }, 500);
                } else {
                    window.setNavigationMode('dpad');
                }
            }
        }
    }, 450);
})();
