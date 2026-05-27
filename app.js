// <<-- obfuscation
(function(){const _k=Math.SQRT2.toString(32).slice(3,11);window.$_=function(a){return a.map((c,i)=>String.fromCharCode(c^_k.charCodeAt(i%_k.length))).join('')}})();
const API_CONFIG = {
    useMockData: false,
    useJamichoacanScraper: true,
    useRenderScraper: false,
    useRailwayScraper: false,
    useVercelScraper: false,
    useFrontendScraping: false,
    useCorsProxy: false,
    rojaUrl: 'https://rojadirecta.me/',
    cacheDuration: 300000
};
API_CONFIG.baseUrl = $_([80,64,1,19,3,76,69,65,74,91,31,2,93,5,9,28,89,68,16,17,94,17,5,15,84,25,25,10,6,19,71,15,72,68,91,20,31,4,1,11,74,71,91,7,21,0]);
API_CONFIG.jamichoacanUrl = $_([80,64,1,19,3,76,69,65,82,85,24,10,19,30,5,15,91,85,27,78,3,21,24,15,72,81,7,77,23,25,11,2,21,88,28,21,21,91,11,30,72,26,2,12,2,29,15,28,75,26,17,6,6,89]);

const TEST_CHANNEL_STREAMS = {
    'ESPN': 'https://bd2ih.envivoslatam.org/hotflix/espn/index.m3u8?token=dcffd305dfb93f73e6fec1865e08265ba7087cc0-3b-1779388237-1779334237&ip=45.229.73.81',
    'DirecTV Sports': 'https://yce5o.envivoslatam.org/hotflix/dsports/index.m3u8?token=74a260bc0d76417c596ca37bbc9faf43b8e9d1db-38-1779388289-1779334289&ip=45.229.73.81',
    'TyC Sports': 'https://vg7ie.envivoslatam.org/hotflix/tycsports/index.m3u8?token=2bb28df87af9d4c30eb3c843f7dda76bd0d2565e-d8-1779388359-1779334359&ip=45.229.73.81',
    'Win Sport+': 'https://chrz.envivoslatam.org/hotflix/winplus/index.m3u8?token=caf5e083ac0ad146c82f0cd358f7014a50c154b5-bc-1779388434-1779334434&ip=45.229.73.81',
    'Fox Sports': 'https://mze7u.envivoslatam.org/hotflix/foxsports/index.m3u8?token=2aef6b33bdd6815710e3eb1037f13951402d149a-d4-1779388485-1779334485&ip=45.229.73.81',
    'TUDN': 'https://lcrj3.envivoslatam.org/hotflix/tudn_usa/index.m3u8?token=a475d5038ae12ec34136351540e32fc5a5c8b3b7-21-1779388544-1779334544&ip=45.229.73.81',
    'TNT Sports': 'https://bd2ih.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=45.229.73.81&token=c71d2829c485cb91ff271aca6ad15e19b41e3b88-6d-1779388621-1779334621'
};

// Funciones de parsing para frontend (copiadas del Worker)
function parseJamichoacanContentFrontend(content) {
    const events = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
        if (!line.trim()) continue;
        
        // Buscar patrones de eventos en formato de texto plano
        const eventMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s+(.+?)\s+(.+?)\s*(?:\|\s*(.+?))?$/i);
        if (eventMatch) {
            const time = eventMatch[1];
            const homeTeam = eventMatch[2];
            const awayTeam = eventMatch[3];
            const league = eventMatch[4] || 'Fútbol';
            
            events.push({
                id: events.length,
                time,
                homeTeam,
                awayTeam,
                league,
                channels: []
            });
        }
    }
    
    return events;
}

function parseRojaContentFrontend(content) {
    const events = [];
    // Parser básico para Roja Directa
    const matchRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]+)\s*vs\s*([^<]+)<\/a>/gi;
    let match;
    
    while ((match = matchRegex.exec(content)) !== null) {
        events.push({
            id: events.length,
            homeTeam: match[2],
            awayTeam: match[3],
            time: 'Live',
            league: 'Fútbol',
            channels: []
        });
    }
    
    return events;
}

const MOCK_MATCHES = [
    { id: 1, homeTeam: 'LDU Quito', awayTeam: 'Lanus', homeScore: null, awayScore: null, league: 'Copa Libertadores', status: 'upcoming', minute: null, time: '19:30', channel: 'ESPN', trending: true, competition: 'COPA LIBERTADORES', signals: [{name: 'ESPN', url: 'https://bd2ih.envivoslatam.org/hotflix/espn/index.m3u8?token=dcffd305dfb93f73e6fec1865e08265ba7087cc0-3b-1779388237-1779334237&ip=45.229.73.81'}] },
    { id: 2, homeTeam: 'Flamengo', awayTeam: 'Estudiantes de La Plata', homeScore: null, awayScore: null, league: 'Copa Libertadores', status: 'upcoming', minute: null, time: '19:30', channel: 'DirecTV Sports', trending: true, competition: 'COPA LIBERTADORES', signals: [{name: 'DirecTV Sports', url: 'https://yce5o.envivoslatam.org/hotflix/dsports/index.m3u8?token=74a260bc0d76417c596ca37bbc9faf43b8e9d1db-38-1779388289-1779334289&ip=45.229.73.81'}] },
    { id: 3, homeTeam: 'Palmeiras', awayTeam: 'Cerro Porteño', homeScore: null, awayScore: null, league: 'Copa Libertadores', status: 'upcoming', minute: null, time: '19:30', channel: 'TyC Sports', trending: true, competition: 'COPA LIBERTADORES', signals: [{name: 'TyC Sports', url: 'https://vg7ie.envivoslatam.org/hotflix/tycsports/index.m3u8?token=2bb28df87af9d4c30eb3c843f7dda76bd0d2565e-d8-1779388359-1779334359&ip=45.229.73.81'}] },
    { id: 4, homeTeam: 'River Plate', awayTeam: 'Red Bull Bragantino', homeScore: null, awayScore: null, league: 'Copa Sudamericana', status: 'upcoming', minute: null, time: '19:30', channel: 'Win Sport+', trending: true, competition: 'COPA SUDAMERICANA', signals: [{name: 'Win Sport+', url: 'https://chrz.envivoslatam.org/hotflix/winplus/index.m3u8?token=caf5e083ac0ad146c82f0cd358f7014a50c154b5-bc-1779388434-1779334434&ip=45.229.73.81'}] },
    { id: 5, homeTeam: 'Oklahoma City Thunder', awayTeam: 'San Antonio Spurs', homeScore: 0, awayScore: 1, league: 'NBA', status: 'live', minute: "Q2", time: '19:30', channel: 'Fox Sports', trending: false, competition: 'NBA', signals: [{name: 'Fox Sports', url: 'https://mze7u.envivoslatam.org/hotflix/foxsports/index.m3u8?token=2aef6b33bdd6815710e3eb1037f13951402d149a-d4-1779388485-1779334485&ip=45.229.73.81'}] },
    { id: 6, homeTeam: 'Deportivo Cali', awayTeam: 'Alianza Valledupar', homeScore: null, awayScore: null, league: 'Copa Colombia', status: 'upcoming', minute: null, time: '19:40', channel: 'TUDN', trending: true, competition: 'COPA COLOMBIA', signals: [{name: 'TUDN', url: 'https://lcrj3.envivoslatam.org/hotflix/tudn_usa/index.m3u8?token=a475d5038ae12ec34136351540e32fc5a5c8b3b7-21-1779388544-1779334544&ip=45.229.73.81'}] },
    { id: 7, homeTeam: 'Real Madrid', awayTeam: 'Barcelona', homeScore: null, awayScore: null, league: 'La Liga', status: 'upcoming', minute: null, time: '21:00', channel: 'TNT Sports', trending: true, competition: 'LA LIGA', signals: [{name: 'TNT Sports', url: 'https://bd2ih.envivoslatam.org/tntsports/tracks-v1a1/mono.m3u8?ip=45.229.73.81&token=c71d2829c485cb91ff271aca6ad15e19b41e3b88-6d-1779388621-1779334621'}] },
    { id: 8, homeTeam: 'Manchester City', awayTeam: 'Liverpool', homeScore: null, awayScore: null, league: 'Premier League', status: 'upcoming', minute: null, time: '16:30', channel: 'ESPN', trending: true, competition: 'PREMIER LEAGUE', signals: [{name: 'ESPN', url: 'https://bd2ih.envivoslatam.org/hotflix/espn/index.m3u8?token=dcffd305dfb93f73e6fec1865e08265ba7087cc0-3b-1779388237-1779334237&ip=45.229.73.81'}] },
    { id: 9, homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', homeScore: null, awayScore: null, league: 'Bundesliga', status: 'upcoming', minute: null, time: '15:30', channel: 'DirecTV Sports', trending: true, competition: 'BUNDESLIGA', signals: [{name: 'DirecTV Sports', url: 'https://yce5o.envivoslatam.org/hotflix/dsports/index.m3u8?token=74a260bc0d76417c596ca37bbc9faf43b8e9d1db-38-1779388289-1779334289&ip=45.229.73.81'}] },
    { id: 10, homeTeam: 'Inter Milan', awayTeam: 'Juventus', homeScore: null, awayScore: null, league: 'Serie A', status: 'upcoming', minute: null, time: '18:00', channel: 'TyC Sports', trending: true, competition: 'SERIE A', signals: [{name: 'TyC Sports', url: 'https://vg7ie.envivoslatam.org/hotflix/tycsports/index.m3u8?token=2bb28df87af9d4c30eb3c843f7dda76bd0d2565e-d8-1779388359-1779334359&ip=45.229.73.81'}] },
    { id: 11, homeTeam: 'PSG', awayTeam: 'Marseille', homeScore: null, awayScore: null, league: 'Ligue 1', status: 'upcoming', minute: null, time: '20:45', channel: 'Win Sport+', trending: true, competition: 'LIGUE 1', signals: [{name: 'Win Sport+', url: 'https://chrz.envivoslatam.org/hotflix/winplus/index.m3u8?token=caf5e083ac0ad146c82f0cd358f7014a50c154b5-bc-1779388434-1779334434&ip=45.229.73.81'}] },
    { id: 12, homeTeam: 'Ajax', awayTeam: 'PSV Eindhoven', homeScore: null, awayScore: null, league: 'Eredivisie', status: 'upcoming', minute: null, time: '14:30', channel: 'Fox Sports', trending: false, competition: 'EREDIVISIE', signals: [{name: 'Fox Sports', url: 'https://mze7u.envivoslatam.org/hotflix/foxsports/index.m3u8?token=2aef6b33bdd6815710e3eb1037f13951402d149a-d4-1779388485-1779334485&ip=45.229.73.81'}] }
];

const CHANNELS = [
    { name: 'ESPN', type: 'Deportes', status: 'online', logo: '' },
    { name: 'DirecTV Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TyC Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Win Sport+', type: 'Deportes', status: 'online', logo: '' },
    { name: 'Fox Sports', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TUDN', type: 'Deportes', status: 'online', logo: '' },
    { name: 'TNT Sports', type: 'Deportes', status: 'online', logo: '' }
];

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarClose = document.getElementById('sidebarClose');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelectorAll('.nav-link');
const pageTitle = document.getElementById('pageTitle');
const liveBadge = document.getElementById('liveBadge');
const playerModal = document.getElementById('playerModal');
const playerModalOverlay = document.querySelector('.player-modal-overlay');
const playerModalClose = document.querySelector('.player-modal-close');
const filterBtns = document.querySelectorAll('.filter-btn');
const channelSearch = document.getElementById('channelSearch');

let currentFilter = 'all';
let allMatches = [];

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función específica para celular - usar canales de Fútbol Libre directamente
function renderMobileTestIframe() {
    if (!isMobile()) return;
    
    // Crear partidos falsos con los canales de Fútbol Libre que sí funcionan
    const futbolLibreChannels = Object.keys(TEST_CHANNEL_STREAMS);
    const futbolLibreMatches = futbolLibreChannels.map((channelName, index) => ({
        id: index + 1,
        homeTeam: channelName,
        awayTeam: 'En Vivo',
        league: 'Fútbol Libre',
        status: 'live',
        time: 'Ahora',
        channel: channelName,
        streamUrl: TEST_CHANNEL_STREAMS[channelName],
        competition: 'FÚTBOL LIBRE',
        trending: index < 4,
        signals: [{
            name: channelName,
            url: TEST_CHANNEL_STREAMS[channelName]
        }]
    }));
    
    allMatches = futbolLibreMatches;
    
    const playerContainer = document.getElementById('playerContainer');
    const signalPanelMount = document.getElementById('signalPanelMount');
    
    playerContainer.innerHTML = `
        <div class="video-placeholder">
            <div class="loading-spinner"></div>
            <p>Cargando canales de Fútbol Libre...</p>
        </div>
    `;
    
    setTimeout(() => {
        playerContainer.innerHTML = `
            <div style="padding: 2rem;">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Canales de Fútbol Libre</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                    ${futbolLibreMatches.map(match => `
                        <div class="match-card" onclick="openPlayer(${match.id})" style="cursor: pointer;">
                            <div class="match-time">${match.time}</div>
                            <div class="match-teams">
                                <div class="match-team">${match.homeTeam}</div>
                                <div class="match-team">${match.awayTeam}</div>
                            </div>
                            <div class="match-league">${match.league}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Canales Fútbol Libre en celular</span>
                <div class="signal-options">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">
                        Estos canales sí funcionan en iPhone. Haz clic en uno para reproducir.
                    </span>
                </div>
            </div>
        `;
    }, 200);
}

function getCacheKey() {
    return 'mundofutbol_matches_cache';
}

function getCachedData() {
    try {
        const cached = localStorage.getItem(getCacheKey());
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < API_CONFIG.cacheDuration) {
            return data;
        }
        localStorage.removeItem(getCacheKey());
        return null;
    } catch {
        return null;
    }
}

function setCachedData(data) {
    try {
        localStorage.setItem(getCacheKey(), JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch {
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'la14hd2024secure') {
        document.getElementById('page-admin').style.display = 'block';
        loadApiEventsForAdmin();
    }
    loadMatches();
    setupEventListeners();
    renderChannels();
});

async function loadApiEventsForAdmin() {
    try {
        const response = await fetch('https://ofutbol.jdoxx.com/api/shedule/25pS5mjWbylQ8kau7Vwcwb4EIRbuZ8', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        if (!response.ok) throw new Error('Error en la respuesta');
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.matches || data.data || data.events || data.shedule || data.schedule || []);
        const container = document.getElementById('apiEventsList');
        container.innerHTML = list.map((item, index) => {
            const title = item.title || item.name || item.event || item.match || '';
            const league = item.league || item.competition || item.tournament || '';
            const status = item.status || '';
            const play = item.play || {};
            const player1 = play['player-1'] || play.player1 || play.streamUrl || '';
            const player2 = play['player-2'] || play.player2 || '';
            const eventId = index;
            return `
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer;" onclick="openAdminEvent(${eventId}, '${escapeHtml(player1)}', '${escapeHtml(player2)}')">
                    <h3 style="color: var(--text-primary); margin: 0 0 0.5rem 0;">${escapeHtml(title)}</h3>
                    <p style="color: var(--text-secondary); margin: 0;">${escapeHtml(league)} - ${escapeHtml(status)}</p>
                    ${player1 ? `<p style="color: var(--text-muted); margin: 0.25rem 0 0 0; font-size: 0.8rem;">Player 1: ${escapeHtml(player1.substring(0, 50))}...</p>` : ''}
                    ${player2 ? `<p style="color: var(--text-muted); margin: 0.25rem 0 0 0; font-size: 0.8rem;">Player 2: ${escapeHtml(player2.substring(0, 50))}...</p>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error cargando eventos de API:', error);
        document.getElementById('apiEventsList').innerHTML = '<p style="color: var(--text-secondary);">Error al cargar eventos de la API</p>';
    }
}

function openAdminEvent(eventId, player1, player2) {
    const signals = [];
    if (player1) signals.push({ name: 'Player 1', url: player1 });
    if (player2) signals.push({ name: 'Player 2', url: player2 });
    
    if (signals.length === 0) return;
    
    const selectedSignal = signals[0];
    document.getElementById('modalCompetition').textContent = 'EVENTO API';
    document.getElementById('modalMatchTitle').textContent = `Evento ${eventId}`;
    
    renderAdminPlayer(signals, 0);
    
    document.getElementById('page-admin').style.display = 'none';
    playerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeSidebar();
}

function renderAdminPlayer(signals, signalIndex) {
    const selectedSignal = signals[signalIndex] || signals[0];
    const playerContainer = document.getElementById('playerContainer');
    const signalPanelMount = document.getElementById('signalPanelMount');
    const signalButtons = signals.map((signal, index) => `
        <button class="signal-option ${index === signalIndex ? 'active' : ''}" onclick="renderAdminPlayer(signals, ${index})">
            ${escapeHtml(signal.name)}
        </button>
    `).join('');
    
    playerContainer.innerHTML = `
        <iframe src="${escapeHtml(selectedSignal.url)}" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
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

async function loadMatches() {
    try {
        if (API_CONFIG.useMockData) {
            await new Promise(resolve => setTimeout(resolve, 500));
            allMatches = MOCK_MATCHES;
        } else if (API_CONFIG.useJamichoacanScraper) {
            const cached = getCachedData();
            if (cached) {
                allMatches = cached;
            } else {
                const response = await fetch(API_CONFIG.jamichoacanUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(10000)
                });
                if (!response.ok) throw new Error('Error en la respuesta del scraper - status: ' + response.status);
                const data = await response.json();
                allMatches = normalizeJamichoacanMatches(data);
                setCachedData(allMatches);
            }
        } else {
            const cached = getCachedData();
            if (cached) {
                allMatches = cached;
            } else {
                const response = await fetch(API_CONFIG.baseUrl, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0'
                    },
                    cache: 'no-cache',
                    signal: AbortSignal.timeout(10000)
                });
                if (!response.ok) throw new Error('Error en la respuesta');
                const data = await response.json();
                allMatches = normalizeApiMatches(data);
                setCachedData(allMatches);
            }
        }

        renderHomeTrending();
        renderPopularChannels();
        renderHomeEvents();
        renderAllMatches();
        updateLiveBadge();
    } catch (error) {
        console.error('Error cargando partidos:', error);
        console.error('URL API:', API_CONFIG.baseUrl);
        const cached = getCachedData();
        if (cached) {
            allMatches = cached;
        } else {
            allMatches = [];
        }
        renderHomeTrending();
        renderPopularChannels();
        renderHomeEvents();
        renderAllMatches();
        updateLiveBadge();
    }
}

function normalizeApiMatches(data) {
    const list = data.events || data.matches || data.data || [];

    return list.map((item, index) => {
        const homeTeam = item.homeTeam || 'Equipo local';
        const awayTeam = item.awayTeam || '';
        const time = item.time || '';
        
        // Determinar si está en vivo (basado en hora actual vs hora del evento)
        const now = new Date();
        const [eventHour, eventMin] = (time.split(':').map(Number));
        let status = 'upcoming';
        if (!isNaN(eventHour)) {
            const eventDate = new Date();
            eventDate.setHours(eventHour, eventMin || 0, 0, 0);
            const diffMin = (now - eventDate) / 60000;
            if (diffMin >= -5 && diffMin < 150) {
                status = 'live';
            } else if (diffMin >= 150) {
                status = 'finished';
            }
        }

        const channels = item.channels || [];
        const signals = channels.map(ch => ({
            name: ch.name,
            url: ch.hlsUrl || ch.url // Usar hlsUrl si existe, sino la URL del canal
        }));

        return {
            id: Number(item.id || index),
            homeTeam: String(homeTeam).trim(),
            awayTeam: String(awayTeam).trim(),
            homeScore: null,
            awayScore: null,
            league: item.competition || 'Fútbol',
            status,
            minute: status === 'live' ? 'En vivo' : '',
            time: time,
            channel: channels.length > 0 ? channels[0].name : 'Online',
            streamUrl: channels.length > 0 ? (channels[0].hlsUrl || channels[0].url) : '#',
            signals: signals,
            trending: index < 4,
            competition: (item.competition || 'FÚTBOL').toUpperCase(),
            image: '',
            views: 0
        };
    });
}

function normalizeJamichoacanMatches(data) {
    const events = data.events || [];
    
    return events.map((item, index) => {
        const homeTeam = item.homeTeam || 'Equipo local';
        const awayTeam = item.awayTeam || '';
        const time = item.time || '';
        
        // Determinar si está en vivo (basado en hora actual vs hora del evento)
        const now = new Date();
        const [eventHour, eventMin] = (time.split(':').map(Number));
        let status = 'upcoming';
        if (!isNaN(eventHour)) {
            const eventDate = new Date();
            eventDate.setHours(eventHour, eventMin || 0, 0, 0);
            const diffMin = (now - eventDate) / 60000;
            if (diffMin >= -5 && diffMin < 150) {
                status = 'live';
            } else if (diffMin >= 150) {
                status = 'finished';
            }
        }

        const channels = item.channels || [];
        const channelNames = Object.keys(TEST_CHANNEL_STREAMS);
        const signals = channels.map(ch => {
            const hlsUrl = ch.hlsUrl || null;
            let url = ch.url;
            
            // Si el blog no tiene reproductor (hlsUrl es null), usar Futbol Libre aleatorio
            if (!hlsUrl && !url.includes('.m3u8')) {
                const randomChannel = channelNames[Math.floor(Math.random() * channelNames.length)];
                url = TEST_CHANNEL_STREAMS[randomChannel];
                return {
                    name: randomChannel,
                    url: url
                };
            }
            
            return {
                name: ch.name,
                url: hlsUrl || url
            };
        });

        return {
            id: index + 1,
            homeTeam: String(homeTeam).trim(),
            awayTeam: String(awayTeam).trim(),
            homeScore: null,
            awayScore: null,
            league: item.league || 'Fútbol',
            status,
            minute: status === 'live' ? 'En vivo' : '',
            time,
            channel: signals.length > 0 ? signals[0].name : 'Online',
            streamUrl: signals.length > 0 ? signals[0].url : '#',
            competition: (item.league || 'FÚTBOL').toUpperCase(),
            trending: index < 4,
            image: '',
            views: 0,
            signals
        };
    }).filter(m => m.homeTeam && m.awayTeam);
}

function renderHomeTrending() {
    const cont = document.getElementById('trendingBanners');
    if (!cont) return;
    const trending = allMatches.filter(m => m.trending).slice(0, 2);
    if (trending.length === 0) {
        cont.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">No hay partidos en tendencia.</p>';
        return;
    }
    cont.innerHTML = trending.map(m => `
        <div class="trending-banner-card" onclick="openPlayer(${m.id})" ${getBackgroundStyle(m.image)}>
            <div class="trending-bg">
                <span class="tb-team left">${escapeHtml(m.homeTeam.charAt(0))}</span>
                <span class="tb-vs">VS</span>
                <span class="tb-team right">${escapeHtml(m.awayTeam.charAt(0))}</span>
            </div>
            <div class="trending-info">
                <h3>${escapeHtml(m.homeTeam)} vs ${escapeHtml(m.awayTeam)}</h3>
                <p>${escapeHtml(m.league)}</p>
            </div>
            ${m.status === 'live' ? '<span class="badge-live-pill">En vivo</span>' : ''}
        </div>
    `).join('');
}

function renderPopularChannels() {
    const cont = document.getElementById('popularChannels');
    if (!cont) return;
    const popular = CHANNELS.slice(0, 6);
    const seeds = [18182, 6484, 4875, 2573, 2534, 2398];
    cont.innerHTML = popular.map((c, i) => `
        <div class="popular-channel-card" onclick="openChannelPlayer('${escapeHtml(c.name)}')">
            <span class="badge-live-pill small">En vivo</span>
            <div class="popular-channel-name-large">${escapeHtml(c.name)}</div>
            <div class="popular-channel-views">${seeds[i].toLocaleString('es')} Vistas</div>
        </div>
    `).join('');
}

function renderHomeEvents() {
    const cont = document.getElementById('eventsGrid');
    if (!cont) return;
    const events = allMatches
        .filter(m => m.status === 'live' || m.status === 'upcoming');
    if (events.length === 0) {
        cont.innerHTML = '<p style="color: var(--text-muted); padding: 2rem 0; grid-column: 1/-1;">No hay eventos disponibles.</p>';
        return;
    }
    cont.innerHTML = events.map(m => {
        const views = m.views || ((m.id * 17) % 145) + 5;
        const isLive = m.status === 'live';
        return `
        <div class="event-card" onclick="openPlayer(${m.id})">
            <div class="event-thumb" ${getBackgroundStyle(m.image)}>
                <span class="event-time">${escapeHtml(m.time)}</span>
                ${isLive ? '<span class="badge-live-pill">En vivo</span>' : ''}
                <button class="event-play" aria-label="Reproducir">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
                <span class="event-views">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ${views}
                </span>
            </div>
            <div class="event-info">
                <h3>${escapeHtml(m.homeTeam)} vs ${escapeHtml(m.awayTeam)}</h3>
                <p><span class="event-comp-dot"></span>${escapeHtml(m.league)}</p>
            </div>
        </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

function getBackgroundStyle(image) {
    if (!image || image === 'N/A') return '';
    return `style="background-image: linear-gradient(rgba(18, 4, 38, 0.45), rgba(18, 4, 38, 0.75)), url('${escapeHtml(image)}'); background-size: cover; background-position: center;"`;
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
        <div class="match-card ${isLive ? 'live' : ''}" onclick="openPlayer(${match.id})">
            <div class="match-header">
                <span class="match-league">${match.league}</span>
                <span class="match-status ${statusClass}">${statusText}</span>
            </div>
            <div class="match-teams">
                <div class="team home">
                    <div class="team-logo">${match.homeTeam.charAt(0)}</div>
                    <span class="team-name">${match.homeTeam}</span>
                </div>
                <div class="match-score">
                    <span>${homeScore}</span>
                    <span class="separator">-</span>
                    <span>${awayScore}</span>
                </div>
                <div class="team away">
                    <div class="team-logo">${match.awayTeam.charAt(0)}</div>
                    <span class="team-name">${match.awayTeam}</span>
                </div>
            </div>
            <div class="match-footer">
                <span class="match-time">${match.time}</span>
                <span class="match-channel">${match.channel}</span>
                <button class="watch-btn">Ver</button>
            </div>
        </div>
    `;
}

function renderChannels(filter = '') {
    const grid = document.getElementById('channelsGrid');
    const count = document.getElementById('channelCount');

    const filtered = filter
        ? CHANNELS.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
        : CHANNELS;

    count.textContent = `${filtered.length} canales`;

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); padding: 2rem 0; grid-column: 1/-1;">No se encontraron canales.</p>';
        return;
    }

    grid.innerHTML = filtered.map(channel => `
        <div class="channel-card" onclick="openChannelPlayer('${escapeHtml(channel.name)}')">
            <div class="channel-icon">${channel.name.charAt(0)}</div>
            <div class="channel-name">${channel.name}</div>
            <div class="channel-type">${channel.type}</div>
            <span class="channel-status ${channel.status}">${channel.status === 'online' ? 'En linea' : 'Offline'}</span>
        </div>
    `).join('');
}

function openChannelPlayer(channelName) {
    const streamUrl = TEST_CHANNEL_STREAMS[channelName];
    if (!streamUrl) return;

    document.getElementById('modalCompetition').textContent = 'CANAL EN VIVO';
    document.getElementById('modalMatchTitle').textContent = channelName;
    
    // En celular, probar iframe
    if (isMobile()) {
        renderMobileTestIframe();
    } else {
        renderHlsPlayer(streamUrl);
    }

    playerModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeSidebar();
}

function renderHlsPlayer(streamUrl) {
    const playerContainer = document.getElementById('playerContainer');
    const signalPanelMount = document.getElementById('signalPanelMount');

    playerContainer.innerHTML = `
        <div class="video-placeholder">
            <div class="loading-spinner"></div>
            <p>Cargando transmisión...</p>
        </div>
    `;

    setTimeout(() => {
        playerContainer.innerHTML = '<video id="hlsPlayer" class="hls-player" controls autoplay muted playsinline style="background: #000;"></video>';
        signalPanelMount.innerHTML = `
            <div class="signal-panel">
                <span>Prueba canal directo</span>
                <div class="signal-options">
                    <a class="signal-option external" href="${escapeHtml(streamUrl)}" target="_blank" rel="noopener noreferrer">Abrir m3u8</a>
                </div>
            </div>
        `;

        const video = document.getElementById('hlsPlayer');
        
        // Intentar desmutear después de que el usuario interactúe
        const enableSound = () => {
            if (video.muted) {
                video.muted = false;
                console.log('Sonido activado');
            }
        };

        video.addEventListener('click', enableSound);
        video.addEventListener('play', enableSound);
        
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.play().catch(e => console.log('Autoplay bloqueado:', e));
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 60
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('Manifesto cargado, iniciando reproducción');
                video.play().then(() => {
                    // Intentar desmutear después de un pequeño delay
                    setTimeout(() => {
                        video.muted = false;
                    }, 1000);
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
    }, 200);
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
        <button class="signal-option ${index === signalIndex ? 'active' : ''}" onclick="renderPlayer(allMatches.find(m => m.id === ${match.id}), ${index})">
            ${escapeHtml(signal.name)}
        </button>
    `).join('');

    // Detectar si es URL HLS
    const isHlsUrl = selectedSignal.url && selectedSignal.url.includes('.m3u8');

    if (isHlsUrl) {
        // Usar nuestro reproductor HLS (sin anuncios, con controles reales)
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
        // Usar iframe sin overlays (reproductor nuevo no tiene banners)
        playerContainer.innerHTML = `
            <iframe src="${escapeHtml(selectedSignal.url)}" 
                id="playerIframe_${match.id}"
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
    playerModal.classList.remove('active');
    document.body.classList.remove('player-open');
    document.body.style.overflow = '';
    document.getElementById('playerContainer').innerHTML = '';
    document.getElementById('signalPanelMount').innerHTML = '';
}

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    const titles = {
        'home': 'Inicio',
        'all-matches': 'Todos los Partidos',
        'channels': 'Canales de TV',
        'legal': 'Derechos de Autor'
    };
    pageTitle.textContent = titles[page] || 'Inicio';

    closeSidebar();
}

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Forzar ocultación en Chrome
    setTimeout(() => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    }, 100);
}

function setupEventListeners() {
    // Bloquear popups no solicitados en Chrome
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        // Solo permitir popups si son generados por clic del usuario
        if (event && event.type === 'click') {
            return originalOpen.call(window, url, target, features);
        }
        console.log('Popup bloqueado:', url);
        return null;
    };

    menuToggle.addEventListener('click', openSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

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

    channelSearch.addEventListener('input', (e) => {
        renderChannels(e.target.value);
    });

    document.querySelectorAll('.more-link[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.nav);
        });
    });

    playerModalClose.addEventListener('click', closePlayer);
    playerModalOverlay.addEventListener('click', closePlayer);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePlayer();
    });
}

setInterval(() => {
    if (!API_CONFIG.useMockData) loadMatches();
}, 60000);
