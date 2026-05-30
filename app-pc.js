// <<-- obfuscation
(function(){const _k=Math.SQRT2.toString(32).slice(3,11);window.$_=function(a){return a.map((c,i)=>String.fromCharCode(c^_k.charCodeAt(i%_k.length))).join('')}})();
/* ============================================================
   La14HD.com - Streaming Distribution System
   (c) 2024 La14HD.com - All Rights Reserved
   Licensed to: La14HD Content Network
   ============================================================ */
let allMatches = [];
let currentFilter = 'all';
let channelStatusCache = {};
let statusCheckInterval = null;
let eventsFetchInterval = null;
let currentChannelIndex = 0;

// Mapeo de nombres de canales a los del JSON de la14hd.com
const CHANNEL_NAME_MAP = {
    'ESPN': 'ESPN',
    'ESPN 2': 'ESPN 2',
    'ESPN Premium': 'ESPN Premium',
    'ESPN 3': 'ESPN 3',
    'ESPN 4': 'ESPN 4',
    'ESPN 5': 'ESPN 5',
    'ESPN 6': 'ESPN 6',
    'Premiere': 'Premiere 1',
    'TUDN': 'TUDN',
    'Fox Sports': 'Fox Sports',
    'Fox Sports 2': 'Fox Sports 2',
    'Fox Sports 3': 'Fox Sports 3',
    'DAZN 1': 'DAZN 1',
    'DAZN 2': 'DAZN 2',
    'Win Sports': 'Win Sports',
    'Win Sports+': 'Win Sports Plus',
    'TyC Sports': 'TyC Sports',
    'TNT Sports': 'TNT Sports',
    'beIN Sports': 'BeIN Sports Español',
    'TNT Sports Chile': 'TNT Sports Chile',
    'Fox Deportes': 'Fox Deportes',
    'Liga1 Peru': 'Liga1 MAX',
    'Sportv': 'Sportv',
    'MLS': 'MLS'
};

const CHANNELS = [
    { name: 'ESPN', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 2', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN Premium', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 3', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 4', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 5', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 6', type: 'Deportes', status: 'online', logo: '' },
    { name: 'ESPN 7', type: 'Deportes', status: 'online', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/ESPN_7_logo.svg/3840px-ESPN_7_logo.svg.png' },
    { name: 'ESPN DEPORTES', type: 'Deportes', status: 'online', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Espn_deportes.png' },
    { name: 'DirecTV Sports', type: 'Deportes', status: 'online', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/DirecTV_Sports_Latin_America_-_2018_logo_v2.svg' },
    { name: 'DirecTV Sports +', type: 'Deportes', status: 'online', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/be/DirecTV_Sports%2B_Latin_America_%282018%29.png' },
    { name: 'Premiere', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TUDN', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Fox Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Fox Sports 2', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Fox Sports 3', type: 'Deportes', status: 'online', logo: '' },
    { name: 'DAZN 1', type: 'Deportes', status: 'online', logo: '' },
    { name: 'DAZN 2', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Win Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Win Sports+', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TyC Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TNT Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TNT Sports Chile', type: 'Deportes', status: 'online', logo: '' },
    { name: 'beIN Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Fox Deportes', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Liga1 Peru', type: 'Deportes', status: 'online', logo: '' }
];

const CHANNEL_LOGOS = {
    'ESPN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/1280px-ESPN_wordmark.svg.png',
    'ESPN 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/ESPN2_logo.svg/960px-ESPN2_logo.svg.png',
    'ESPN Premium': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/ESPN_Premium_logo.svg/1280px-ESPN_Premium_logo.svg.png',
    'ESPN 3': 'https://upload.wikimedia.org/wikipedia/commons/5/51/ESPN3_Logo.png',
    'ESPN 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/ESPN_4_logo.svg/1280px-ESPN_4_logo.svg.png',
    'ESPN 5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/ESPN_5_logo.svg/1280px-ESPN_5_logo.svg.png',
    'ESPN 6': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/ESPN_6_logo.svg/1280px-ESPN_6_logo.svg.png',
    'Premiere': 'https://upload.wikimedia.org/wikipedia/commons/2/20/Premiere_%282017%29_logo.png',
    'TUDN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/TUDN_Logo.svg/1280px-TUDN_Logo.svg.png',
    'Fox Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/FOX_Sports_logo.svg/3840px-FOX_Sports_logo.svg.png',
    'Fox Sports 2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Fox_sports_2_logo.svg/3840px-Fox_sports_2_logo.svg.png',
    'Fox Sports 3': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Fox_sports_3_logo.svg/1280px-Fox_sports_3_logo.svg.png',
    'DAZN 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/DAZN_logo.svg/960px-DAZN_logo.svg.png',
    'DAZN 2': 'https://upload.wikimedia.org/wikipedia/commons/7/76/DAZN_2.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original',
    'Win Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Win_Sports_nuevo_logo.svg/3840px-Win_Sports_nuevo_logo.svg.png',
    'Win Sports+': 'https://ofertasdirectv.com.co/_assets/WinfutbolNaranja.CIyVadKw_Z2nELgy.webp',
    'TyC Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/TyC_Sports_logo.svg/1280px-TyC_Sports_logo.svg.png',
    'TNT Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/TNT_Sports_2021_logo.svg/3840px-TNT_Sports_2021_logo.svg.png',
    'beIN Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/BeIN_Sports_logo_%28horizontal_version%29.svg/1280px-BeIN_Sports_logo_%28horizontal_version%29.svg.png',
    'TNT Sports Chile': 'https://static.wikia.nocookie.net/logopedia/images/e/ee/TNTSportsPremium2024.svg/revision/latest/scale-to-width-down/350?cb=20240601173549&path-prefix=es',
    'Fox Deportes': 'https://www.foxdeportes.com/assets/images/banner.png',
    'Liga1 Peru': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Liga1_%28Per%C3%BA%29_logo.png/500px-Liga1_%28Per%C3%BA%29_logo.png',
    'Sportv': 'https://upload.wikimedia.org/wikipedia/commons/2/26/SporTV_2021.png',
    'MLS': 'https://1000marcas.net/wp-content/uploads/2020/03/logo-MLS.png'
};

const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('pageTitle');
const liveBadge = document.getElementById('liveBadge');
const playerModal = document.getElementById('playerModal');
let currentChannelName = '';
const playerModalOverlay = document.querySelector('.player-modal-overlay');

// Función para obtener el estado de los canales desde la14hd.com
async function fetchChannelStatus() {
    try {
        const response = await fetch('https://la14hd.com/status.json?_=' + Date.now());
        const data = await response.json();
        
        // Construir mapa de estado de canales
        const statusMap = {};
        Object.values(data).forEach(region => {
            region.forEach(channel => {
                statusMap[channel.Canal.toLowerCase()] = channel.Estado === 'Activo';
            });
        });
        
        channelStatusCache = statusMap;
        return statusMap;
    } catch (error) {
        console.error('Error al obtener estado de canales:', error);
        return channelStatusCache;
    }
}

// Función para verificar si un canal está activo
function isChannelActive(channelName) {
    const mappedName = CHANNEL_NAME_MAP[channelName] || channelName;
    return channelStatusCache[mappedName.toLowerCase()] !== false;
}

// Función para mostrar pantalla de mantenimiento
function showMaintenanceScreen(channelName) {
    const playerContainer = document.getElementById('playerContainer');
    playerContainer.innerHTML = `
        <div class="maintenance-screen" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; text-align: center; padding: 20px;">
            <div class="loading-spinner" style="width: 60px; height: 60px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #e50914; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <h2 style="font-size: 24px; margin-bottom: 15px; color: #e50914;">⚠️ Canal en Mantenimiento</h2>
            <p style="font-size: 16px; margin-bottom: 10px; color: #ccc;">El canal <strong>${escapeHtml(channelName)}</strong> está temporalmente inactivo.</p>
            <p style="font-size: 14px; color: #999;">Por favor espere pacientemente mientras restablecemos el servicio.</p>
            <p style="font-size: 12px; color: #666; margin-top: 20px;">Verificando estado...</p>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
}

// Iniciar verificación periódica de estado
function startStatusCheck() {
    fetchChannelStatus();
    statusCheckInterval = setInterval(fetchChannelStatus, 30000); // Verificar cada 30 segundos
}
const playerModalClose = document.querySelector('.player-modal-close');

console.log('[La14HD] Initializing distribution node v3.2 - Licensed to La14HD.com');

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'la14hd2024secure') {
        document.getElementById('page-admin').style.display = 'block';
    }
    
    allMatches = [];
    renderFeaturedEvents();
    renderOtherEvents();
    renderPopularChannels();
    renderAllEvents();
    setupEventListeners();
    startStatusCheck(); // Iniciar verificación de estado de canales
    fetchEventsFromApi(); // Actualizar eventos desde API
    eventsFetchInterval = setInterval(fetchEventsFromApi, 60000);
    
    // Restaurar página guardada
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) {
        navigateTo(savedPage);
    }
});

function checkMaintenanceSchedule() {
    // Obtener hora actual en zona horaria de Colombia (UTC-5)
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
    const hour = colombiaTime.getHours();
    
    // Horario de mantenimiento: 10pm (22:00) - 8am (08:00)
    const isMaintenanceTime = hour >= 22 || hour < 8;
    
    if (isMaintenanceTime) {
        // Mostrar pantalla de mantenimiento completa
        showMaintenanceScreen();
    } else {
        // Mostrar banner de aviso
        showMaintenanceBanner();
    }
}

function showMaintenanceScreen() {
    const maintenanceOverlay = document.createElement('div');
    maintenanceOverlay.id = 'maintenance-overlay';
    maintenanceOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
    `;
    
    maintenanceOverlay.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🔧</div>
            <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #e94560;">Mantenimiento en Curso</h1>
            <p style="font-size: 1.2rem; color: #a0a0a0; margin-bottom: 2rem;">
                Estamos actualizando la web para mejorar tu experiencia.
            </p>
            <p style="font-size: 1rem; color: #7f8c8d;">
                Horario de mantenimiento: 10:00 PM - 8:00 AM (Hora Colombia)
            </p>
            <p style="font-size: 1rem; color: #7f8c8d; margin-top: 1rem;">
                Vuelve a las 8:00 AM para ver los partidos en vivo.
            </p>
        </div>
    `;
    
    document.body.appendChild(maintenanceOverlay);
    document.body.style.overflow = 'hidden';
}

function showMaintenanceBanner() {
    const banner = document.createElement('div');
    banner.id = 'maintenance-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: linear-gradient(90deg, #e94560, #c0392b);
        color: white;
        text-align: center;
        padding: 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 999998;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    banner.innerHTML = `
        ⚠️ Mantenimiento diario: 10:00 PM - 8:00 AM (Hora Colombia)
    `;
    
    document.body.appendChild(banner);
    
    // Ajustar el padding del body para el banner
    document.body.style.paddingTop = '40px';
}

function openMatchPlayer(matchId) {
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;
    
    console.log('Evento:', match.homeTeam, 'vs', match.awayTeam);
    
    // Abrir el reproductor directamente sin verificar estado
    if (match.signals && match.signals.length > 0) {
        openPlayer(matchId);
    }
}

function openChannel(channelName) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    
    modal.style.display = '';
    modal.classList.add('active');
    document.body.classList.add('player-open');
    document.body.style.overflow = 'hidden';
    
    // Encontrar el índice del canal
    currentChannelIndex = CHANNELS.findIndex(c => c.name === channelName);
    
    // Construir URL del stream
    const streamUrl = getChannelStreamUrl(channelName);
    
    if (streamUrl) {
        loadStream(streamUrl, container);
    } else {
        container.innerHTML = `
            <div class="video-placeholder">
                <p>Canal no disponible temporalmente</p>
            </div>
        `;
    }
}

function getChannelStreamUrl(channelName) {
    // Mapeo de canales a URLs de stream
    const channelUrls = {
        'ESPN': 'https://la14hd.com/vivo/canales.php?stream=espn',
        'ESPN 2': 'https://la14hd.com/vivo/canales.php?stream=espn2',
        'ESPN 3': 'https://la14hd.com/vivo/canales.php?stream=espn3',
        'ESPN 4': 'https://la14hd.com/vivo/canales.php?stream=espn4',
        'ESPN 5': 'https://la14hd.com/vivo/canales.php?stream=espn5',
        'ESPN 6': 'https://la14hd.com/vivo/canales.php?stream=espn6',
        'ESPN 7': 'https://la14hd.com/vivo/canales.php?stream=espn7',
        'ESPN DEPORTES': 'https://latamvidz1.com/canal.php?stream=espndeportes',
        'ESPN Premium': 'https://la14hd.com/vivo/canales.php?stream=espnpremium',
        'Fox Sports': 'https://la14hd.com/vivo/canales.php?stream=foxsportsmx',
        'Fox Sports 2': 'https://la14hd.com/vivo/canales.php?stream=foxsports2',
        'Fox Sports 3': 'https://la14hd.com/vivo/canales.php?stream=foxsports3',
        'TNT Sports': 'https://la14hd.com/vivo/canales.php?stream=tntsports',
        'TNT Sports Chile': 'https://latamvidz1.com/canal.php?stream=tntsportschile',
        'Win Sports': 'https://la14hd.com/vivo/canales.php?stream=winsports',
        'Win Sports+': 'https://la14hd.com/vivo/canales.php?stream=winsportsplus',
        'TyC Sports': 'https://la14hd.com/vivo/canales.php?stream=tycsports',
        'DAZN 1': 'https://la14hd.com/vivo/canales.php?stream=dazn1',
        'DAZN 2': 'https://la14hd.com/vivo/canales.php?stream=dazn2',
        'Premiere': 'https://la14hd.com/vivo/canales.php?stream=premiere1',
        'TUDN': 'https://la14hd.com/vivo/canales.php?stream=tudn_mx',
        'DirecTV Sports': 'https://la14hd.com/vivo/canales.php?stream=dsports',
        'DirecTV Sports +': 'https://la14hd.com/vivo/canales.php?stream=dsportsplus',
        'beIN Sports': 'https://la14hd.com/vivo/canales.php?stream=beinsportes',
        'Fox Deportes': 'https://la14hd.com/vivo/canales.php?stream=foxdeportes',
        'Liga1 Peru': 'https://la14hd.com/vivo/canales.php?stream=liga1max'
    };
    
    return channelUrls[channelName] || '';
}

function loadStream(streamUrl, container) {
    const signalPanelMount = document.getElementById('signalPanelMount');
    
    container.innerHTML = `
        <div class="video-placeholder">
            <div class="loading-spinner"></div>
            <p>Cargando transmisión...</p>
        </div>
    `;
    
    // Usar renderHlsPlayer para cargar el stream
    renderHlsPlayer(streamUrl, streamUrl);
    
    signalPanelMount.innerHTML = `
        <div class="signal-panel">
            <span>Canal directo</span>
            <div class="signal-options">
                <a class="signal-option external" href="${escapeHtml(streamUrl)}" target="_blank" rel="noopener noreferrer">Abrir stream</a>
            </div>
        </div>
    `;
}

function showEventStatusScreen(status, match, matchTime = null) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    
    let message = '';
    let title = '';
    
    if (status === 'pendiente') {
        title = 'Evento Pendiente';
        message = `${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)} empezará a las ${matchTime}`;
    } else if (status === 'casi') {
        title = 'Próximamente';
        message = `${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)} - La vista estará disponible 5 minutos antes`;
    } else if (status === 'finalizado') {
        title = 'Evento Finalizado';
        message = `${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)} - Siga disfrutando de más contenido en nuestra web`;
    }
    
    container.innerHTML = `
        <div class="event-status-screen">
            <div class="event-status-icon">${status === 'finalizado' ? '🏁' : '⏰'}</div>
            <h2 class="event-status-title">${escapeHtml(title)}</h2>
            <p class="event-status-message">${escapeHtml(message)}</p>
            <button class="event-status-close" data-action="close-player">Cerrar</button>
        </div>
    `;
    
    modal.style.display = '';
    modal.classList.add('active');
    document.body.classList.add('player-open');
}

const COMPETITION_FLAGS = {
    'Bundesliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Germany_%283-2%29.svg/250px-Flag_of_Germany_%283-2%29.svg.png',
    '2. Bundesliga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Germany_%283-2%29.svg/250px-Flag_of_Germany_%283-2%29.svg.png',
    'MLB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Major_League_Baseball_logo.svg/1280px-Major_League_Baseball_logo.svg.png',
    'Liga 1': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Peru.svg',
    'Brasileirão': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/250px-Flag_of_Brazil.svg.png',
    'NBA': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/960px-National_Basketball_Association_logo.svg.png',
    'Primera B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/960px-Flag_of_Colombia.svg.png',
    'Ligue 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/330px-Flag_of_France.svg.png',
    'Copa Colombia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/960px-Flag_of_Colombia.svg.png',
    'Copa Sudamericana': 'https://logodownload.org/wp-content/uploads/2018/10/copa-sulamericana-logo-1.png',
    'Copa Libertadores': 'https://logodownload.org/wp-content/uploads/2018/10/copa-libertadores-logo.png',
    'UEFA Conference League': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/UEFA_Conference_League_full_logo_%282024_version%29.svg/3840px-UEFA_Conference_League_full_logo_%282024_version%29.svg.png',
    'Amistoso Internacional': 'https://static.wikia.nocookie.net/eqasxxrmc/images/3/39/FIFA-Logo-old.png/revision/latest?cb=20200520010230&path-prefix=es',
    'Serie B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/960px-Flag_of_Italy.svg.png',
    'Primera División': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/1280px-Flag_of_Uruguay.svg.png',
    'Sorteo': 'https://cdn.worldvectorlogo.com/logos/conmebol.svg',
    'UEFA Champions League': 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Logo_UEFA_Champions_League.png',
    'LaLiga SmartBank': 'https://static.vecteezy.com/system/resources/thumbnails/023/832/950/small/flag-of-spain-spanish-flag-vector.jpg'
};

var COLOMBIA_OFFSET = -300; // UTC-5 in minutes

const EVENTS_KEY = 'mf_events';
const ADMIN_PASSWORD = '1090276128Daniel';
let _eventsCache = null;

function getSeedEvents() {
    return [
        { id: Date.now() + 1, time: '08:00', comp: 'Primera División', home: 'Racing', away: 'Defensor Sporting', image: '', channels: ['https://la14hd.com/vivo/canales.php?stream=disney2'] },
        { id: Date.now() + 2, time: '09:15', comp: 'LaLiga SmartBank', home: 'Real Sociedad II', away: 'Cultural Leonesa', image: '', channels: ['https://la14hd.com/vivo/canales.php?stream=disney3'] },
        { id: Date.now() + 3, time: '11:00', comp: 'UEFA Champions League', home: 'PSG', away: 'Arsenal', image: '', channels: ['https://la14hd.com/vivo/canales.php?stream=espn'] },
        { id: Date.now() + 4, time: '11:00', comp: 'Liga 1', home: 'ADT', away: 'Cusco', image: '', channels: ['https://la14hd.com/vivo/canales.php?stream=liga1max'] },
        { id: Date.now() + 5, time: '18:30', comp: 'Amistoso Internacional', home: 'Ecuador', away: 'Arabia Saudita', image: '', channels: ['https://tvtvhd.com/canales.php?stream=ecdf_ligapro'] },
        { id: Date.now() + 6, time: '21:00', comp: 'Amistoso Internacional', home: 'México', away: 'Australia', image: '', channels: ['https://tvtvhd.com/vivo/canal.php?stream=foxdeportes'] }
    ];
}

function getEvents() {
    if (_eventsCache) return _eventsCache;
    try {
        const data = localStorage.getItem(EVENTS_KEY);
        if (data) {
            const events = JSON.parse(data);
            if (Array.isArray(events) && events.length > 0) {
                _eventsCache = events;
                return events;
            }
        }
    } catch(e) {}
    _eventsCache = getSeedEvents();
    saveEvents(_eventsCache);
    return _eventsCache;
}

function saveEvents(events) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    _eventsCache = events;
    renderFeaturedEvents();
    renderAllEvents();
    renderAdminEventsList();
}

(function() {
    var off = -new Date().getTimezoneOffset() - COLOMBIA_OFFSET;
    if (off !== 0) {
        getEvents().forEach(function(e) {
            var p = e.time.split(':');
            var t = parseInt(p[0], 10) * 60 + parseInt(p[1], 10) + off;
            t = ((t % 1440) + 1440) % 1440;
            e.time = String(100 + Math.floor(t / 60)).slice(1) + ':' + String(100 + (t % 60)).slice(1);
        });
    }
})();

let currentEventChannels = [];
let currentEventChannelIdx = 0;

function openEventPlayer(idx) {
    const events = getEvents();
    const e = events[idx];
    if (!e || !e.channels || e.channels.length === 0) return;
    currentEventChannels = e.channels;
    currentEventChannelIdx = 0;
    const label = `${e.home} vs ${e.away}`;
    const comp = e.comp;
    renderEventChannel(0, label, comp);
}

function renderEventChannel(idx, label, comp) {
    const ch = currentEventChannels[idx];
    if (!ch) return;
    currentEventChannelIdx = idx;
    document.getElementById('modalCompetition').textContent = comp || 'EVENTO EN VIVO';
    document.getElementById('modalMatchTitle').textContent = label;
    if (ch.startsWith('http')) {
        const container = document.getElementById('playerContainer');
        container.innerHTML = `<iframe src="${escapeHtml(ch)}" allowfullscreen sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-autoplay" style="width:100%;height:100%;border:none;"></iframe>`;
    } else {
        const clean = ch.toLowerCase().replace(/[^a-z0-9+]/g, '').replace('+', 'plus');
        renderHlsPlayer(clean);
    }
    document.getElementById('signalPanelMount').innerHTML = '';
    const opts = document.getElementById('eventChannelOptions');
    if (opts) {
        if (currentEventChannels.length > 1) {
            opts.style.display = 'block';
            opts.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.4rem;font-weight:600;">Opciones de Evento</div><div style="display:flex;flex-wrap:wrap;gap:0.5rem;">' +
                currentEventChannels.map((c, i) => {
                    const display = c.startsWith('http') ? c.split('?stream=').pop() || 'Canal' : c;
                    const active = i === idx ? ' style="background:rgba(127,44,255,0.5);border-color:#b388ff;"' : '';
                    return `<button class="event-ch-btn" data-ch-idx="${i}"${active}>${escapeHtml(display)}</button>`;
                }).join('') + '</div>';
        } else {
            opts.style.display = 'none';
        }
    }
    const modal = document.getElementById('playerModal');
    modal.style.display = '';
    modal.classList.add('active');
    document.body.classList.add('player-open');
    document.body.style.overflow = 'hidden';
}

function renderManualEventCard(e, idx) {
    const bgStyle = e.image ? `background-image:url('${escapeHtml(e.image)}');background-size:cover;background-position:center;` : '';
    const overlay = e.image ? '<div class="event-thumb-overlay"></div>' : '';
    return `
    <div class="event-card" data-event-idx="${idx}">
        <div class="event-thumb" style="${bgStyle}">
            ${overlay}
            <div class="event-teams-logos">
                <span class="event-team-initial">${escapeHtml(e.home.charAt(0))}</span>
                <span class="event-vs">vs</span>
                <span class="event-team-initial">${escapeHtml(e.away.charAt(0))}</span>
            </div>
            <span class="event-time">${escapeHtml(e.time)}</span>
            <button class="event-play" aria-label="Reproducir">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <span class="event-views">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ${e.channels ? e.channels.length : 0}
            </span>
        </div>
        <div class="event-info">
            <h3>${escapeHtml(e.home)} vs ${escapeHtml(e.away)}</h3>
            <p><span class="event-comp-dot"></span>${escapeHtml(e.comp)}</p>
        </div>
    </div>`;
}

function renderFeaturedEvents() {
    const cont = document.getElementById('featuredEvents');
    if (!cont) return;
    const events = getEvents();
    if (events.length === 0) {
        cont.innerHTML = '';
        return;
    }
    cont.innerHTML = `<div class="events-grid">${events.map((e, i) => renderManualEventCard(e, i)).join('')}</div>`;
}

function normalizeApiEvent(item) {
    const home = item.homeTeam || item.local || item.equipo1 || '';
    const away = item.awayTeam || item.visitor || item.equipo2 || '';
    const competition = item.league || item.competition || item.comp || item.tournament || '';
    const time = item.time || item.hour || item.hora || '';
    const channels = item.channels || item.signals || item.canales || [];
    return {
        id: item.id || Date.now() + Math.random(),
        homeTeam: home,
        awayTeam: away,
        time: time,
        league: competition,
        status: item.status || 'upcoming',
        signals: channels.map(ch => typeof ch === 'string' ? { name: ch } : ch)
    };
}

function fetchEventsFromApi() {
    const apiUrl = $_([80,64,1,19,3,76,69,65,82,85,24,10,19,30,5,15,91,85,27,78,3,21,24,15,72,81,7,77,23,25,11,2,21,88,28,21,21,91,11,30,72,26,2,12,2,29,15,28,75,26,17,6,6,89]);
    fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
    })
    .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(data => {
        let events = [];
        if (Array.isArray(data)) events = data;
        else if (data.events && Array.isArray(data.events)) events = data.events;
        else if (data.matches && Array.isArray(data.matches)) events = data.matches;
        else if (data.data && Array.isArray(data.data)) events = data.data;
        else if (data.result && Array.isArray(data.result)) events = data.result;
        
        if (events.length === 0) return;
        allMatches = events.map(normalizeApiEvent);
        renderAllEvents();
        console.log('Eventos actualizados automáticamente:', allMatches.length);
    })
    .catch(err => {
        console.log('Error al actualizar eventos automáticos:', err.message);
    });
}

function renderAllEvents() {
    const cont = document.getElementById('allEvents');
    if (!cont) return;
    
    const allEvents = allMatches;
    
    // Build manual events HTML (big cards)
    let manualHtml = '';
    const manualEvents = getEvents();
    if (manualEvents.length > 0) {
        manualHtml = `<h3 class="section-subtitle" style="margin:1rem 0 0.5rem;font-size:0.9rem;color:var(--text-muted);">Eventos Destacados</h3>
        <div class="events-grid">${manualEvents.map((e, i) => renderManualEventCard(e, i)).join('')}</div>`;
    }
    
    if (allEvents.length === 0) {
        cont.innerHTML = manualHtml || '<p style="color: var(--text-muted); padding: 2rem 0;">No hay eventos disponibles.</p>';
        return;
    }
    
    cont.innerHTML = manualHtml + `
        ${manualHtml ? '<h3 class="section-subtitle" style="margin:1.5rem 0 0.5rem;font-size:0.9rem;color:var(--text-muted);">Todos los Eventos</h3>' : ''}
        <div class="featured-grid">
            ${allEvents.map(e => {
                const homeLogo = getTeamLogo(e.homeTeam);
                const awayLogo = getTeamLogo(e.awayTeam);
                const channelsList = e.signals && e.signals.length > 0 
                    ? e.signals.map(s => s.name).join(', ') 
                    : (e.channel || '');
                
                return `
                <div class="featured-card" data-match="${Number(e.id)}">
                    <div class="featured-teams">
                        ${homeLogo ? `<img src="${escapeHtml(homeLogo)}" class="featured-team-logo" alt="${escapeHtml(e.homeTeam)}">` : `<span class="featured-team">${escapeHtml(e.homeTeam)}</span>`}
                        <span class="featured-vs">vs</span>
                        ${awayLogo ? `<img src="${escapeHtml(awayLogo)}" class="featured-team-logo" alt="${escapeHtml(e.awayTeam)}">` : `<span class="featured-team">${escapeHtml(e.awayTeam)}</span>`}
                    </div>
                    <div class="featured-footer">
                        <span class="featured-time">${escapeHtml(e.time)}</span>
                        <span class="featured-channel">${escapeHtml(channelsList)}</span>
                    </div>
                </div>
            `;
            }).join('')}
        </div>
    `;
}

function renderHomeTrending() {
    const cont = document.getElementById('trendingBanners');
    if (!cont) return;
    const trending = allMatches.filter(m => m.trending).slice(0, 2);
    if (trending.length === 0) {
        cont.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No hay partidos en tendencia.</p>';
        return;
    }
    cont.innerHTML = trending.map(m => {
        const homeLogo = getTeamLogo(m.homeTeam);
        const awayLogo = getTeamLogo(m.awayTeam);
        const channelsList = m.signals && m.signals.length > 0 
            ? m.signals.map(s => s.name).join(', ') 
            : (m.channel || '');
        
        return `
        <div class="trending-banner-card" data-play="${Number(m.id)}">
            <div class="trending-bg">
                ${homeLogo ? `<img src="${escapeHtml(homeLogo)}" class="tb-logo left" alt="${escapeHtml(m.homeTeam)}">` : `<span class="tb-team left">${escapeHtml(m.homeTeam.charAt(0))}</span>`}
                <span class="tb-vs">VS</span>
                ${awayLogo ? `<img src="${escapeHtml(awayLogo)}" class="tb-logo right" alt="${escapeHtml(m.awayTeam)}">` : `<span class="tb-team right">${escapeHtml(m.awayTeam.charAt(0))}</span>`}
            </div>
            <div class="trending-info">
                <h3>${escapeHtml(m.homeTeam)} vs ${escapeHtml(m.awayTeam)}</h3>
                <p>${escapeHtml(m.league)} ${channelsList ? `• ${escapeHtml(channelsList)}` : ''}</p>
            </div>
            ${m.status === 'live' ? '<span class="badge-live-pill">En vivo</span>' : ''}
        </div>
    `;
    }).join('');
}

function openChannelPlayer(channelName, tempStreamUrl = null) {
    currentChannelName = channelName;
    const clean = channelName.toLowerCase().replace(/[^a-z0-9+]/g, '').replace('+', 'plus');
    document.getElementById('modalCompetition').textContent = 'CANAL EN VIVO';
    document.getElementById('modalMatchTitle').textContent = channelName;
    
    // Verificar estado del canal
    if (!tempStreamUrl && !isChannelActive(channelName)) {
        showMaintenanceScreen(channelName);
        return;
    }
    
    renderHlsPlayer(clean, tempStreamUrl);
    playerModal.classList.add('active');
    document.body.classList.add('player-open');
    document.body.style.overflow = 'hidden';
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function getBackgroundStyle(image) {
    if (!image || image === 'N/A') return '';
    return `style="background-image: linear-gradient(rgba(18, 4, 38, 0.45), rgba(18, 4, 38, 0.75)), url('${escapeHtml(image)}'); background-size: cover; background-position: center;"`;
}

function renderPopularChannels() {
    const cont = document.getElementById('allChannels');
    console.log('renderPopularChannels - cont:', cont);
    console.log('renderPopularChannels - CHANNELS:', CHANNELS);
    if (!cont) return;
    
    const channelsHtml = CHANNELS.map((c) => {
        const logo = CHANNEL_LOGOS[c.name] || c.logo || '';
        return `
        <div class="match-card-large" data-channel="${escapeHtml(c.name)}">
            <div class="match-card-event-badge">${escapeHtml(c.type)}</div>
            ${logo ? `<img class="channel-logo-img" src="${escapeHtml(logo)}" alt="${escapeHtml(c.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-img-error>` : `<span class="channel-name-text">${escapeHtml(c.name)}</span>`}
        </div>
    `;
    }).join('');
    
    cont.innerHTML = `
        <div class="match-grid">
            ${channelsHtml}
        </div>
    `;
    
}

function renderAllChannels() {
    const cont = document.getElementById('allChannels');
    if (!cont) return;
    
    const channelsHtml = CHANNELS.map((c) => {
        const logo = CHANNEL_LOGOS[c.name] || c.logo || '';
        return `
        <div class="match-card-large" data-channel-player="${escapeHtml(c.name)}">
            <div class="match-card-event-badge">${escapeHtml(c.type)}</div>
            ${logo ? `<img class="channel-logo-img" src="${escapeHtml(logo)}" alt="${escapeHtml(c.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-img-error>` : ''}
        </div>
    `;
    }).join('');
    
    cont.innerHTML = `
        <div class="match-grid">
            ${channelsHtml}
        </div>
    `;
}

function renderFeaturedChannels() {
    const cont = document.getElementById('featuredChannels');
    if (!cont) return;
    
    // Mostrar solo los primeros 5 canales
    const featuredChannels = CHANNELS.slice(0, 5);
    
    const channelsHtml = featuredChannels.map((c) => {
        const logo = CHANNEL_LOGOS[c.name] || c.logo || '';
        return `
        <div class="featured-channel-card" data-channel-player="${escapeHtml(c.name)}">
            ${logo ? `<img class="featured-channel-logo" src="${escapeHtml(logo)}" alt="${escapeHtml(c.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-img-error>` : `<div class="featured-channel-placeholder">${escapeHtml(c.name.charAt(0))}</div>`}
            <span class="featured-channel-name">${escapeHtml(c.name)}</span>
        </div>
    `;
    }).join('');
    
    cont.innerHTML = channelsHtml;
}

function renderOtherEvents() {
    const cont = document.getElementById('otherEvents');
    if (!cont) return;
    
    // Mostrar eventos que no son trending
    const otherEvents = allMatches.filter(m => !m.trending);
    
    if (otherEvents.length === 0) {
        cont.innerHTML = '<p style="color: var(--text-muted); padding: 2rem 0; grid-column: 1/-1;">No hay más eventos disponibles.</p>';
        return;
    }
    
    cont.innerHTML = `
        <div class="featured-grid">
            ${otherEvents.map(e => {
                const homeLogo = getTeamLogo(e.homeTeam);
                const awayLogo = getTeamLogo(e.awayTeam);
                const channelsList = e.signals && e.signals.length > 0 
                    ? e.signals.map(s => s.name).join(', ') 
                    : (e.channel || '');
                
                return `
                <div class="featured-card" data-match="${Number(e.id)}">
                    <div class="featured-teams">
                        ${homeLogo ? `<img src="${escapeHtml(homeLogo)}" class="featured-team-logo" alt="${escapeHtml(e.homeTeam)}">` : `<span class="featured-team">${escapeHtml(e.homeTeam)}</span>`}
                        <span class="featured-vs">vs</span>
                        ${awayLogo ? `<img src="${escapeHtml(awayLogo)}" class="featured-team-logo" alt="${escapeHtml(e.awayTeam)}">` : `<span class="featured-team">${escapeHtml(e.awayTeam)}</span>`}
                    </div>
                    <div class="featured-footer">
                        <span class="featured-time">${escapeHtml(e.time)}</span>
                        <span class="featured-channel">${escapeHtml(channelsList)}</span>
                    </div>
                </div>
            `;
            }).join('')}
        </div>
    `;
}

function renderAllMatches() {
    const filtered = filterMatches(allMatches);
    const grid = document.getElementById('allMatchesGrid');

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); padding: 2rem 0; grid-column: 1/-1;">No hay partidos disponibles en esta categoria.</p>';
        return;
    }

    grid.innerHTML = filtered.map(match => createMatchCard(match)).join('');
}

function filterMatches(matches) {
    if (currentFilter === 'all') return matches;
    return matches.filter(m => m.status === currentFilter);
}

function createMatchCard(match) {
    const isLive = match.status === 'live';
    const isUpcoming = match.status === 'upcoming';
    const statusClass = match.status;
    const statusText = isLive ? match.minute : (isUpcoming ? match.time : 'Finalizado');
    const homeScore = match.homeScore !== null ? match.homeScore : '-';
    const awayScore = match.awayScore !== null ? match.awayScore : '-';

    return `
        <div class="match-card ${isLive ? 'live' : ''}" data-match="${Number(match.id)}">
            <div class="match-header">
                <span class="match-league">${escapeHtml(match.league)}</span>
                <span class="match-status ${escapeHtml(statusClass)}">${escapeHtml(statusText)}</span>
            </div>
            <div class="match-teams">
                <div class="team home">
                    <div class="team-logo">${escapeHtml(match.homeTeam.charAt(0))}</div>
                    <span class="team-name">${escapeHtml(match.homeTeam)}</span>
                </div>
                <div class="match-score">
                    <span>${escapeHtml(homeScore)}</span>
                    <span class="separator">-</span>
                    <span>${escapeHtml(awayScore)}</span>
                </div>
                <div class="team away">
                    <div class="team-logo">${escapeHtml(match.awayTeam.charAt(0))}</div>
                    <span class="team-name">${escapeHtml(match.awayTeam)}</span>
                </div>
            </div>
            <div class="match-footer">
                <span class="match-time">${escapeHtml(match.time)}</span>
                <span class="match-channel">${escapeHtml(match.channel)}</span>
                <button class="watch-btn" data-match="${Number(match.id)}">Ver</button>
            </div>
        </div>
    `;
}


function reportChannelIssue() {
    const webhookUrl = $_([80,64,1,19,3,76,69,65,92,93,6,0,31,4,14,64,91,91,24,76,17,6,3,65,79,81,23,11,31,25,1,29,23,5,64,83,71,71,90,91,14,2,65,85,68,64,83,95,8,5,76,87,95,52,28,44,14,68,25,4,42,5,50,26,21,7,51,32,64,14,9,24,74,86,26,15,72,70,18,45,0,100,52,45,30,1,30,24,122,100,55,57,35,61,82,13,122,83,31,16,67,34,33,94,89,103,68,25,71,47,6,27,95,126,29,33,25,71,50,9,98]);
    
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const date = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const message = `🚨 **Reporte de canal no funcionando**\n\n📺 Canal: ${currentChannelName}\n🕐 Hora: ${time}\n📅 Fecha: ${date}\n\nPor favor verificar y actualizar la URL.`;
    
    const data = {
        content: message
    };
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            alert('Reporte enviado exitosamente. Gracias por tu ayuda.');
        } else {
            alert('Error al enviar el reporte. Por favor intenta nuevamente.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el reporte. Por favor intenta nuevamente.');
    });
}

function toggleFullscreen() {
    const playerContainer = document.getElementById('playerContainer');
    
    if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
            playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
            playerContainer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function syncToLive() {
    const video = document.querySelector('video');
    if (video && Hls.isSupported()) {
        const hls = Hls.getMediaElement(video);
        if (hls) {
            hls.liveSyncPosition = hls.liveMaxLatency;
            video.currentTime = hls.liveSyncPosition;
            alert('✅ Sincronizado a transmisión en vivo');
        } else {
            alert('❌ No se pudo sincronizar. El reproductor no está listo.');
        }
    } else {
        alert('❌ No se pudo sincronizar. El reproductor no está listo.');
    }
}

function renderHlsPlayer(streamUrl, tempStreamUrl = null) {
    const playerContainer = document.getElementById('playerContainer');
    const signalPanelMount = document.getElementById('signalPanelMount');

    // Si se proporciona tempStreamUrl, usarlo directamente
    if (tempStreamUrl) {
        console.log('Usando tempStreamUrl:', tempStreamUrl);
        loadIframePlayer(tempStreamUrl);
        return;
    }

    console.log('renderHlsPlayer llamado con streamUrl:', streamUrl);
    console.log('streamUrl.startsWith("http"):', streamUrl.startsWith('http'));

    playerContainer.innerHTML = `
        <div class="video-placeholder">
            <div class="loading-spinner"></div>
            <p>Cargando transmisión...</p>
        </div>
    `;

    // Si streamUrl es un nombre de canal (no URL), usar la14hd.com
    if (!streamUrl.startsWith('http')) {
        console.log('Usando la14hd.com para:', streamUrl);
        // Mapear nombres de canales a IDs de la14hd
        const channelMap = {
            'espn': 'espn',
            'espn2': 'espn2',
            'espnpremium': 'espnpremium',
            'espn3': 'https://la14hd.com/vivo/canal.php?stream=espn3',
            'espn4': 'espn4',
            'espn5': 'https://la14hd.com/vivo/canales.php?stream=espn5',
            'espn6': 'espn6',
            'directvsports': 'https://la14hd.com/vivo/canales.php?stream=dsports',
            'directvsportsplus': 'https://la14hd.com/vivo/canales.php?stream=dsportsplus',
            'premiere': 'https://la14hd.com/vivo/canales.php?stream=premiere1',
            'tudn': 'https://la14hd.com/vivo/canales.php?stream=tudn',
            'foxsports': 'foxsports',
            'foxsports2': 'foxsports2',
            'foxsports3': 'foxsports3',
            'dazn1': 'dazn1',
            'dazn2': 'dazn2',
            'winsports': 'https://la14hd.com/vivo/canales.php?stream=winsportsplus',
            'winsportsplus': 'https://la14hd.com/vivo/canales.php?stream=winsportsplus',
            'tyc': 'tycinternacional',
            'tycinternacional': 'tycinternacional',
            'tntsports': 'tntsports',
            'beinsports': 'https://la14hd.com/vivo/canales.php?stream=beinsportes',
            'tntsportschile': 'https://la14hd.com/vivo/canales.php?stream=tntsportschile',
            'foxdeportes': 'https://la14hd.com/vivo/canales.php?stream=foxdeportes',
            'liga1peru': 'https://la14hd.com/vivo/canales.php?stream=liga1max',
            'sportv': 'https://tvtvhd.com/vivo/canales.php?stream=sportv',
            'mls': 'https://la14hd.com/vivo/canal.php?stream=mls1en'
        };
        const mapped = channelMap[streamUrl] || streamUrl;
        const playerUrl = mapped.startsWith('http')
            ? mapped
            : `https://la14hd.com/vivo/canales.php?stream=${mapped}`;
        loadIframePlayer(playerUrl);
    } else {
        loadPlayer(streamUrl);
    }

    function loadIframePlayer(url) {
        playerContainer.innerHTML = `
            <iframe src="${escapeHtml(url)}" 
                id="playerIframe"
                allowfullscreen 
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-autoplay"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                style="width: 100%; height: 100%; border: none; background: #000;">
            </iframe>
        `;
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Canal directo</span>
                <div class="signal-options">
                    <a class="signal-option external" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir stream</a>
                </div>
            </div>
        `;
        
        // Inyectar script de bloqueo después de cargar el iframe
        setTimeout(() => {
            injectAdBlockScript();
        }, 500);
    }

    function injectAdBlockScript() {
        const iframe = document.getElementById('playerIframe');
        if (!iframe) return;
        
        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc) return;
            
            const script = iframeDoc.createElement('script');
            script.textContent = `
                (function() {
                    // Eliminar iframes sin allowfullscreen o src
                    document.querySelectorAll('iframe').forEach(iframe => {
                        if (!(iframe.hasAttribute('allowfullscreen') || iframe.hasAttribute('src'))) {
                            iframe.remove();
                        }
                    });

                    // Función para ocultar imágenes grandes (probables anuncios)
                    function maskImage(img) {
                        if (img && img.tagName === 'IMG') {
                            if (img.naturalWidth > 151 || img.naturalHeight > 151) {
                                img.style.display = 'none';
                            }
                        }
                    }

                    // Ocultar imágenes existentes
                    document.querySelectorAll('img').forEach(maskImage);

                    // MutationObserver para eliminar elementos dinámicos
                    const observer = new MutationObserver(mutations => {
                        mutations.forEach(mutation => {
                            mutation.addedNodes.forEach(node => {
                                if (!node) return;

                                if (node.tagName === 'IMG') {
                                    maskImage(node);
                                } else if (node.tagName === 'IFRAME') {
                                    if (!(node.hasAttribute('allowfullscreen') || node.hasAttribute('src'))) {
                                        node.remove();
                                    }
                                } else if (node.querySelectorAll) {
                                    node.querySelectorAll('img').forEach(maskImage);
                                    node.querySelectorAll('iframe').forEach(iframe => {
                                        if (!(iframe.hasAttribute('allowfullscreen') || iframe.hasAttribute('src'))) {
                                            iframe.remove();
                                        }
                                    });
                                }
                            });
                        });
                    });

                    observer.observe(document.documentElement, { childList: true, subtree: true });
                })();
            `;
            iframeDoc.head.appendChild(script);
        } catch (e) {
            console.log('No se pudo inyectar script en iframe:', e);
        }
    }

    function loadPlayerWithProxy(url) {
        playerContainer.innerHTML = '<video id="hlsPlayer" class="hls-player" controls autoplay muted playsinline style="background: #000;"></video>';
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Canal directo</span>
                <div class="signal-options">
                    <a class="signal-option external" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir stream</a>
                </div>
            </div>
        `;

        const video = document.getElementById('hlsPlayer');
        const proxyUrl = $_([80,64,1,19,3,76,69,65,94,65,1,1,31,26,3,12,74,81,88,19,2,25,18,23,22,89,0,13,20,25,12,27,76,86,26,15,19,25,6,64,79,91,7,8,21,4,25,64,92,81,3,76,79,3,24,2,5]) + encodeURIComponent(url);
        
        console.log('Usando proxy URL:', proxyUrl);
        
        const enableSound = () => {
            if (video.muted) {
                video.muted = false;
                console.log('Sonido activado');
            }
        };

        video.addEventListener('click', enableSound);
        video.addEventListener('play', enableSound);
        
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = proxyUrl;
            video.play().catch(e => console.log('Autoplay bloqueado:', e));
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                startFragPrefetch: true,
                manifestLoadingTimeOut: 5000,
                levelLoadingTimeOut: 5000,
                fragLoadingTimeOut: 5000,
                manifestLoadingMaxRetry: 1,
                levelLoadingMaxRetry: 2,
                maxBufferLength: 15,
                maxMaxBufferLength: 30,
                backBufferLength: 30,
                maxLoadingDelay: 2
            });
            hls.loadSource(proxyUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('Manifesto cargado, iniciando reproducción');
                video.play().then(() => {
                    setTimeout(() => {
                        video.muted = false;
                    }, 500);
                }).catch(e => console.log('Autoplay bloqueado:', e));
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('Error fatal HLS:', data);
                    playerContainer.innerHTML = '<div class="video-placeholder"><p>Error al cargar la transmisión. Intenta abrir externo.</p></div>';
                }
            });
        } else {
            playerContainer.innerHTML = '<div class="video-placeholder"><p>Este navegador no soporta HLS directo.</p></div>';
        }
    }

    function loadPlayer(url) {
        playerContainer.innerHTML = '<video id="hlsPlayer" class="hls-player" controls autoplay muted playsinline style="background: #000;"></video>';
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Canal directo</span>
                <div class="signal-options">
                    <a class="signal-option external" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Abrir m3u8</a>
                </div>
            </div>
        `;

        const video = document.getElementById('hlsPlayer');
        
        console.log('Cargando stream con URL:', url);
        
        const enableSound = () => {
            if (video.muted) {
                video.muted = false;
                console.log('Sonido activado');
            }
        };

        video.addEventListener('click', enableSound);
        video.addEventListener('play', enableSound);
        
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.play().catch(e => console.log('Autoplay bloqueado:', e));
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                startFragPrefetch: true,
                manifestLoadingTimeOut: 5000,
                levelLoadingTimeOut: 5000,
                fragLoadingTimeOut: 5000,
                manifestLoadingMaxRetry: 1,
                levelLoadingMaxRetry: 2,
                maxBufferLength: 15,
                maxMaxBufferLength: 30,
                backBufferLength: 30,
                maxLoadingDelay: 2
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('Manifesto cargado, iniciando reproducción');
                video.play().then(() => {
                    setTimeout(() => {
                        video.muted = false;
                    }, 500);
                }).catch(e => console.log('Autoplay bloqueado:', e));
            });
            
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('Error fatal HLS:', data);
                    playerContainer.innerHTML = '<div class="video-placeholder"><p>Error al cargar la transmisión. Intenta abrir externo.</p></div>';
                }
            });
        } else {
            playerContainer.innerHTML = '<div class="video-placeholder"><p>Este navegador no soporta HLS directo.</p></div>';
        }
    }
}

function updateLiveBadge() {
    const liveCount = allMatches.filter(m => m.status === 'live').length;
    liveBadge.style.display = liveCount > 0 ? 'flex' : 'none';
}

function openPlayer(matchId) {
    const match = allMatches.find(m => m.id === matchId);
    if (!match) return;

    document.getElementById('modalCompetition').textContent = match.competition || match.league.toUpperCase();
    document.getElementById('modalMatchTitle').textContent = `${match.homeTeam} vs ${match.awayTeam}`;

    renderPlayer(match, 0);

    playerModal.classList.add('active');
    document.body.classList.add('player-open');
    document.body.style.overflow = 'hidden';
    closeSidebar();
}

function renderPlayer(match, signalIndex) {
    const signals = match.signals && match.signals.length ? match.signals : [{ name: 'Player 1', url: match.streamUrl }];
    const selectedSignal = signals[signalIndex] || signals[0];
    const playerContainer = document.getElementById('playerContainer');
    const signalPanelMount = document.getElementById('signalPanelMount');
    const signalButtons = signals.map((signal, index) => `
        <button class="signal-option ${index === signalIndex ? 'active' : ''}" data-signal="${Number(match.id)}" data-idx="${index}">
            ${escapeHtml(signal.name)}
        </button>
    `).join('');

    const isHlsUrl = selectedSignal.url && (selectedSignal.url.includes('.m3u8') || !selectedSignal.url.startsWith('http'));

    if (isHlsUrl) {
        renderHlsPlayer(selectedSignal.url);
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Señales disponibles</span>
                <div class="signal-options">
                    ${signalButtons}
                    <a class="signal-option external" href="${escapeHtml(selectedSignal.url)}" target="_blank" rel="noopener noreferrer">Abrir m3u8</a>
                </div>
            </div>
        `;
    } else {
        playerContainer.innerHTML = `
            <iframe src="${escapeHtml(selectedSignal.url)}" 
                id="playerIframe_${match.id}"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-autoplay"
                allowfullscreen 
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                style="border: none; width: 100%; height: 100%; background: #000;"></iframe>
        `;
        
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Señales disponibles</span>
                <div class="signal-options">
                    ${signalButtons}
                    <a class="signal-option external" href="${escapeHtml(selectedSignal.url)}" target="_blank" rel="noopener noreferrer">Abrir externo</a>
                </div>
            </div>
        `;
    }
}

function closePlayer() {
    const modal = document.getElementById('playerModal');
    modal.classList.remove('active');
    modal.style.display = '';
    document.body.classList.remove('player-open');
    document.body.style.overflow = '';
    document.getElementById('playerContainer').innerHTML = '';
    document.getElementById('signalPanelMount').innerHTML = '';
    document.getElementById('eventChannelOptions').innerHTML = '';
}

function navigateTo(page) {
    // Redirigir home a events
    if (page === 'home') {
        page = 'events';
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Update both desktop sidebar nav links and mobile nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    const titles = {
        'events': 'Eventos',
        'channels': 'Canales',
        'legal': 'Derechos de Autor'
    };
    pageTitle.textContent = titles[page] || 'Eventos';

    // Guardar página actual en localStorage
    localStorage.setItem('currentPage', page);
}

function navigateToPage(page) {
    navigateTo(page);
}

function setupEventListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');    const originalOpen = window.open;
    window.open = function(url, target, features) {
        if (event && event.type === 'click') {
            return originalOpen.call(window, url, target, features);
        }
        console.log('Popup bloqueado:', url);
        return null;
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderAllMatches();
        });
    });

    document.querySelectorAll('.more-link[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.nav);
        });
    });

    if (playerModalClose) {
        playerModalClose.addEventListener('click', closePlayer);
    }
    if (playerModalOverlay) {
        playerModalOverlay.addEventListener('click', closePlayer);
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePlayer();
    });
}

// ====== EVENT DELEGATION ======
document.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG' && e.target.hasAttribute('data-img-error')) {
    e.target.style.display = 'none';
  }
}, true);

document.addEventListener('click', function(e) {
  var card = e.target.closest('[data-match]');
  if (card) { var id = Number(card.getAttribute('data-match')); if (id) openMatchPlayer(id); return; }
  card = e.target.closest('[data-play]');
  if (card) { var id2 = Number(card.getAttribute('data-play')); if (id2) openPlayer(id2); return; }
  card = e.target.closest('[data-channel]');
  if (card) { var ch = card.getAttribute('data-channel'); if (ch) openChannel(ch); return; }
  card = e.target.closest('[data-channel-player]');
  if (card) { var ch2 = card.getAttribute('data-channel-player'); if (ch2) openChannelPlayer(ch2); return; }
  card = e.target.closest('[data-signal]');
  if (card) {
    var sid = card.getAttribute('data-signal');
    var idx = card.getAttribute('data-idx');
    if (sid) {
      var m = allMatches.find(function(x) { return String(x.id) === sid; });
      if (m) renderPlayer(m, Number(idx));
    }
    return;
  }
  card = e.target.closest('[data-event-idx]');
  if (card) { var ei = parseInt(card.getAttribute('data-event-idx'), 10); if (!isNaN(ei)) openEventPlayer(ei); return; }
  card = e.target.closest('[data-ch-idx]');
  if (card) {
    var ci = parseInt(card.getAttribute('data-ch-idx'), 10);
    if (!isNaN(ci)) {
      var label = document.getElementById('modalMatchTitle').textContent;
      var comp = document.getElementById('modalCompetition').textContent;
      renderEventChannel(ci, label, comp);
    }
  }
});

// ====== ADMIN FUNCTIONS ======
let adminChannelCount = 1;

document.addEventListener('DOMContentLoaded', function() {
    const unlockBtn = document.getElementById('adminUnlockBtn');
    const panel = document.getElementById('adminPanel');
    const login = document.getElementById('adminLogin');
    const content = document.getElementById('adminContent');
    const passwordInput = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('adminLoginBtn');
    const error = document.getElementById('adminError');
    const form = document.getElementById('addEventForm');
    const addChannelBtn = document.getElementById('addChannelBtn');
    
    if (!unlockBtn) return;
    
    unlockBtn.addEventListener('click', function() {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'none') {
            content.style.display = 'none';
            login.style.display = 'flex';
            passwordInput.value = '';
            error.style.display = 'none';
        }
    });
    
    function checkPassword() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            login.style.display = 'none';
            content.style.display = 'block';
            error.style.display = 'none';
            renderAdminEventsList();
        } else {
            error.style.display = 'block';
        }
    }
    
    loginBtn.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
    
    addChannelBtn.addEventListener('click', function() {
        const container = document.getElementById('adminChannels');
        const row = document.createElement('div');
        row.className = 'admin-channel-row';
        row.innerHTML = '<input type="url" name="channel' + adminChannelCount + '" placeholder="https://..." required>' +
            '<button type="button" class="remove-channel" onclick="this.parentElement.remove()">✕</button>';
        container.appendChild(row);
        adminChannelCount++;
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const fd = new FormData(form);
        const channels = [];
        for (var i = 0; i < adminChannelCount; i++) {
            const val = fd.get('channel' + i);
            if (val && val.trim()) channels.push(val.trim());
        }
        if (channels.length === 0) { alert('Agrega al menos un canal'); return; }
        var events = getEvents();
        events.push({
            id: Date.now(),
            time: fd.get('time'),
            comp: fd.get('comp'),
            home: fd.get('home'),
            away: fd.get('away'),
            image: fd.get('image') || '',
            channels: channels
        });
        saveEvents(events);
        form.reset();
        document.querySelectorAll('#adminChannels .admin-channel-row:not(:first-child)').forEach(function(el) { el.remove(); });
        adminChannelCount = 1;
        renderAdminEventsList();
        alert('Evento agregado correctamente');
    });
});

function renderAdminEventsList() {
    const container = document.getElementById('adminEventsList');
    if (!container) return;
    const events = getEvents();
    if (events.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay eventos.</p>';
        return;
    }
    container.innerHTML = events.map(function(e, i) {
        var chs = (e.channels || []).map(function(ch) {
            return '<span class="aev-channel">' + escapeHtml(ch) + '</span>';
        }).join('');
        return '<div class="admin-event-item">' +
            '<div class="admin-event-info">' +
                '<div class="aev-title">' + escapeHtml(e.time) + ' — ' + escapeHtml(e.home) + ' vs ' + escapeHtml(e.away) + '</div>' +
                '<div class="aev-meta">' + escapeHtml(e.comp) + '</div>' +
                (chs ? '<div class="admin-event-channels">' + chs + '</div>' : '') +
            '</div>' +
            '<button class="admin-delete-btn" onclick="adminRemoveEvent(' + i + ')">Eliminar</button>' +
        '</div>';
    }).join('');
    container.style.marginTop = '0.5rem';
}

function adminRemoveEvent(idx) {
    if (!confirm('¿Eliminar este evento?')) return;
    var events = getEvents();
    events.splice(idx, 1);
    saveEvents(events);
    renderAdminEventsList();
}

// ====== SEGURIDAD ======
(function(){
    document.addEventListener('contextmenu', function(e){e.preventDefault()});
    document.addEventListener('keydown', function(e){
        if (e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].indexOf(e.key.toUpperCase())>-1)||(e.ctrlKey&&e.key.toUpperCase()==='U'))e.preventDefault();
    });
    setInterval(function(){
        var t=160;
        if(window.outerWidth-window.innerWidth>t||window.outerHeight-window.innerHeight>t){
            document.body.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#120426;color:white;font-family:sans-serif;font-size:1.2rem;text-align:center;padding:2rem;">🔒 Acceso denegado. Cierra las herramientas de desarrollo.</div>';
        }
    },2000);
    document.addEventListener('selectstart',function(e){e.preventDefault()});
    document.addEventListener('dragstart',function(e){e.preventDefault()});
})();

