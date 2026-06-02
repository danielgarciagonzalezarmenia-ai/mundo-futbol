/**
 * Mundo Futbol - Admin Panel Controller
 * Handles Firestore CRUD, Push Notifications sending, and team autocomplete suggestions.
 */

// Configuración secreta para interactuar con el proxy de envío push
const ADMIN_SECRET = 'mf2024secure_token';

// Variable para rastrear el ID del partido en edición
let editingMatchId = null;

// Inicialización de Pestañas del Panel Admin
function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.admin-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `admin-tab-${tabName}`);
    });
    
    // Si entramos a Métricas, redibujar gráfico si existe la función
    if (tabName === 'metrics' && typeof drawChart === 'function') {
        const canvas = document.getElementById('adminMetricsChart');
        if (canvas) drawChart(canvas);
    }
}

// ==========================================================================
// SECCIÓN PARTIDOS (FIRESTORE CRUD)
// ==========================================================================

// Añadir fila de canal dinámico al formulario
function addChannelRow(name = '', url = '') {
    const container = document.getElementById('channelsContainer');
    if (!container) return;

    const rowId = 'ch-row-' + Date.now() + Math.random().toString(36).substr(2, 5);

    const div = document.createElement('div');
    div.className = 'channel-row-input';
    div.id = rowId;
    div.innerHTML = `
        <input type="text" placeholder="Nombre de señal (Ej: ESPN)" class="ch-name" value="${name}" required style="flex:1;">
        <input type="text" placeholder="URL HLS Stream (.m3u8 / .mpd)" class="ch-url" value="${url}" required style="flex:2;">
        <button type="button" class="channel-remove-btn" onclick="removeChannelRow('${rowId}')" title="Eliminar Canal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    container.appendChild(div);
}

// Eliminar fila de canal
function removeChannelRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) row.remove();
}

// Mostrar sugerencias inteligentes de escudos de equipos
function showTeamSuggestions(input, side) {
    const dropdown = document.getElementById(`${side}Suggestions`);
    if (!dropdown) return;

    const query = input.value.trim().toLowerCase();
    if (!query || query.length < 2) {
        dropdown.style.display = 'none';
        return;
    }

    // Buscar nombres y alias de equipos
    const suggestions = [];
    const seen = new Set();

    // 1. Buscar en aliases
    if (typeof TEAM_ALIASES !== 'undefined') {
        for (const aliasKey in TEAM_ALIASES) {
            if (aliasKey.includes(query)) {
                const officialName = TEAM_ALIASES[aliasKey];
                const displayName = officialName.charAt(0).toUpperCase() + officialName.slice(1);
                if (!seen.has(displayName)) {
                    seen.add(displayName);
                    suggestions.push(displayName);
                }
            }
        }
    }

    // 2. Buscar en LOGO_INDEX si está disponible
    if (typeof LOGO_INDEX !== 'undefined') {
        ['clubes', 'selecciones', 'mundial2026'].forEach(cat => {
            if (LOGO_INDEX[cat]) {
                for (const teamKey in LOGO_INDEX[cat]) {
                    if (teamKey.includes(query)) {
                        const displayName = teamKey.charAt(0).toUpperCase() + teamKey.slice(1);
                        if (!seen.has(displayName)) {
                            seen.add(displayName);
                            suggestions.push(displayName);
                        }
                    }
                }
            }
        });
    }

    if (suggestions.length === 0) {
        dropdown.style.display = 'none';
        return;
    }

    // Limitar a 6 sugerencias y renderizar
    dropdown.innerHTML = suggestions.slice(0, 6).map(name => {
        const logoUrl = getTeamLogo(name);
        return `
            <div class="suggestion-item" onclick="selectTeam('${name}', '${side}')">
                ${logoUrl ? `<img src="${logoUrl}" alt="${name}">` : ''}
                <span>${name}</span>
            </div>
        `;
    }).join('');
    
    dropdown.style.display = 'block';
}

// Seleccionar equipo del autocompletado
function selectTeam(name, side) {
    const input = document.getElementById(`match${side.charAt(0).toUpperCase() + side.slice(1)}`);
    if (input) input.value = name;
    
    const dropdown = document.getElementById(`${side}Suggestions`);
    if (dropdown) dropdown.style.display = 'none';
}

// Guardar partido (Añadir o Editar en Firestore)
async function saveMatch(event) {
    event.preventDefault();
    
    if (typeof db === 'undefined') {
        alert('Error: Firebase Firestore no está disponible.');
        return;
    }

    const id = document.getElementById('matchId').value;
    const comp = document.getElementById('matchComp').value.trim();
    const time = document.getElementById('matchTime').value.trim();
    const home = document.getElementById('matchHome').value.trim();
    const away = document.getElementById('matchAway').value.trim();
    const featured = document.getElementById('matchFeatured').checked;
    const active = document.getElementById('matchActive').checked;

    // Recoger canales/señales
    const channels = [];
    document.querySelectorAll('.channel-row-input').forEach(row => {
        const name = row.querySelector('.ch-name').value.trim();
        const url = row.querySelector('.ch-url').value.trim();
        if (name && url) {
            channels.push({ name, url });
        }
    });

    if (channels.length === 0) {
        alert('Por favor agrega al menos una señal de transmisión.');
        return;
    }

    const matchData = {
        comp,
        time,
        home,
        away,
        featured,
        active,
        channels,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (id) {
            // Actualizar existente
            await db.collection('events').doc(id).update(matchData);
            console.log('[Firestore] Partido actualizado:', id);
        } else {
            // Crear nuevo
            matchData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('events').add(matchData);
            console.log('[Firestore] Partido agregado');
        }
        
        resetMatchForm();
        alert('¡Partido guardado con éxito!');
    } catch (error) {
        console.error('[Firestore] Error al guardar partido:', error);
        alert('Error al guardar partido: ' + error.message);
    }
}

// Cargar partido en formulario para edición
function editMatch(id, comp, time, home, away, featured, active, channelsJson) {
    document.getElementById('matchId').value = id;
    document.getElementById('matchComp').value = comp;
    document.getElementById('matchTime').value = time;
    document.getElementById('matchHome').value = home;
    document.getElementById('matchAway').value = away;
    document.getElementById('matchFeatured').checked = featured;
    document.getElementById('matchActive').checked = active;

    // Limpiar canales existentes y rellenar con los del partido
    const container = document.getElementById('channelsContainer');
    if (container) container.innerHTML = '';

    try {
        const channels = JSON.parse(decodeURIComponent(channelsJson));
        channels.forEach(ch => addChannelRow(ch.name, ch.url));
    } catch (e) {
        console.error('Error al parsear canales para edición:', e);
        addChannelRow();
    }

    document.getElementById('adminFormTitle').innerHTML = `
        <span style="background:#e11d48; width:8px; height:8px; border-radius:50%;"></span>
        Editando Partido
    `;
    
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'block';
    
    // Scroll suave al formulario
    document.getElementById('page-admin').scrollTo({ top: 0, behavior: 'smooth' });
}

// Eliminar partido de Firestore
async function deleteMatch(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este partido permanentemente de la nube?')) return;
    
    if (typeof db === 'undefined') return;

    try {
        await db.collection('events').doc(id).delete();
        console.log('[Firestore] Partido eliminado:', id);
        alert('Partido eliminado de la nube.');
    } catch (error) {
        console.error('[Firestore] Error al eliminar partido:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// Reiniciar formulario a valores por defecto
function resetMatchForm() {
    document.getElementById('matchId').value = '';
    document.getElementById('matchForm').reset();
    
    const container = document.getElementById('channelsContainer');
    if (container) container.innerHTML = '';
    
    // Agregar un canal en blanco por defecto
    addChannelRow();

    document.getElementById('adminFormTitle').innerHTML = `
        <span style="background:var(--gradient-primary); width:8px; height:8px; border-radius:50%;"></span>
        Agregar Nuevo Partido
    `;
    
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// Cargar y escuchar la lista de partidos en la sección Admin
function listenAdminMatches() {
    if (typeof db === 'undefined') return;

    db.collection('events').orderBy('time', 'asc').onSnapshot(snapshot => {
        const listDiv = document.getElementById('adminMatchesList');
        if (!listDiv) return;

        if (snapshot.empty) {
            listDiv.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">No hay partidos en la nube. ¡Agrega uno arriba!</div>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const id = doc.id;
            const channelsStr = encodeURIComponent(JSON.stringify(data.channels || []));

            html += `
                <div class="admin-match-card" style="opacity: ${data.active ? 1 : 0.5};">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
                        <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${escapeHtml(data.comp)}</span>
                        <div style="display:flex; gap:6px;">
                            ${data.featured ? '<span style="background:#eab308; color:#000; font-size:0.65rem; font-weight:bold; padding:2px 6px; border-radius:4px;">⭐ DESTACADO</span>' : ''}
                            ${data.active ? '<span style="background:#22c55e; color:#fff; font-size:0.65rem; font-weight:bold; padding:2px 6px; border-radius:4px;">🟢 ACTIVO</span>' : '<span style="background:#ef4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:2px 6px; border-radius:4px;">🔴 OCULTO</span>'}
                        </div>
                    </div>
                    
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0;">
                        <div style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.85rem; color:var(--text-primary); flex:1;">
                            ${teamLogoHtml(data.home)}
                            <span>${escapeHtml(data.home)}</span>
                        </div>
                        <span style="font-size:0.8rem; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:6px; color:#f97316; font-weight:bold; margin:0 8px;">${escapeHtml(data.time)}</span>
                        <div style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:0.85rem; color:var(--text-primary); flex:1; justify-content:flex-end; text-align:right;">
                            <span>${escapeHtml(data.away)}</span>
                            ${teamLogoHtml(data.away)}
                        </div>
                    </div>

                    <div style="font-size:0.75rem; color:var(--text-secondary); background:rgba(0,0,0,0.15); padding:8px; border-radius:8px;">
                        <strong>Señales:</strong> ${data.channels ? data.channels.map(c => escapeHtml(c.name)).join(', ') : 'Ninguna'}
                    </div>

                    <div style="display:flex; gap:8px; margin-top:8px;">
                        <button onclick="editMatch('${id}', '${escapeHtml(data.comp)}', '${escapeHtml(data.time)}', '${escapeHtml(data.home)}', '${escapeHtml(data.away)}', ${data.featured}, ${data.active}, '${channelsStr}')" style="flex:1; padding:8px; border-radius:var(--radius-pill); border:1px solid rgba(249,115,22,0.3); background:rgba(249,115,22,0.05); color:#f97316; cursor:pointer; font-size:0.75rem; font-weight:600;">Editar</button>
                        <button onclick="deleteMatch('${id}')" style="flex:1; padding:8px; border-radius:var(--radius-pill); border:1px solid rgba(239,68,68,0.3); background:rgba(239,68,68,0.05); color:#ef4444; cursor:pointer; font-size:0.75rem; font-weight:600;">Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
    });
}

// ==========================================================================
// SECCIÓN NOTIFICACIONES PUSH (FCM VIA PROXY PHP)
// ==========================================================================

// Escuchar contador de usuarios suscritos
function listenSubscribersCount() {
    if (typeof db === 'undefined') return;

    db.collection('subscriptions').onSnapshot(snapshot => {
        const countSpan = document.getElementById('subscribersCount');
        if (countSpan) {
            countSpan.innerHTML = `<strong>${snapshot.size} dispositivos</strong> suscritos a notificaciones en vivo.`;
        }
    }, error => {
        console.error('Error al escuchar suscriptores:', error);
    });
}

// Enviar Notificación Push Masiva llamando al proxy send-push.php
async function sendNotification(event) {
    event.preventDefault();
    
    const title = document.getElementById('pushTitle').value.trim();
    const body = document.getElementById('pushMessage').value.trim();
    const link = document.getElementById('pushLink').value.trim();

    if (!confirm(`¿Estás seguro de que deseas enviar esta notificación push en vivo a todos los dispositivos registrados?`)) return;

    // Deshabilitar botón durante el envío
    const form = document.getElementById('notificationForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    try {
        const res = await fetch('send-push.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                body,
                link,
                secret: ADMIN_SECRET
            })
        });

        const data = await res.json();
        
        if (res.ok) {
            alert(`¡Notificación enviada con éxito!\nEnviadas: ${data.sentCount}\nFallidas: ${data.failedCount || 0}`);
            form.reset();
        } else {
            alert('Error al enviar notificaciones: ' + (data.error || 'Desconocido'));
        }
    } catch (e) {
        console.error('Error en fetch send-push.php:', e);
        alert('Error de conexión al enviar notificaciones: ' + e.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Cerrar sugerencias al hacer clic afuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('#matchHome') && !e.target.closest('#homeSuggestions')) {
        const dropdown = document.getElementById('homeSuggestions');
        if (dropdown) dropdown.style.display = 'none';
    }
    if (!e.target.closest('#matchAway') && !e.target.closest('#awaySuggestions')) {
        const dropdown = document.getElementById('awaySuggestions');
        if (dropdown) dropdown.style.display = 'none';
    }
});

// Función de escape HTML auxiliar
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

// Inicialización de la pantalla al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Agregar el primer canal en blanco al formulario
    addChannelRow();
    
    // Iniciar escuchas en tiempo real si el administrador está logueado
    if (localStorage.getItem('mf_admin') === '1' || window.location.search.includes('admin=la14hd2024secure')) {
        listenAdminMatches();
        listenSubscribersCount();
    }
});
