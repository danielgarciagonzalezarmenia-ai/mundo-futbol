/**
 * Cloudflare Worker para scraping de rojadirectablog
 * Extrae eventos y canales (sin URLs HLS por ahora)
 */

const SOURCE_URL = 'https://rojadirectablog.com/default.php';
const CACHE_DURATION = 300; // 5 minutos

async function fetchHtml(url) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    return await response.text();
}

function parseEvents(html) {
    const events = [];
    const lines = html.split('\n');
    
    let currentEvent = null;
    let eventId = 0;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Detectar línea de evento (formato: "- Copa Libertadores: Equipo1 vs Equipo2Hora")
        const eventMatch = trimmedLine.match(/^- ([^:]+): ([^-]+)(\d{1,2}:\d{2})$/);
        if (eventMatch) {
            if (currentEvent) {
                events.push(currentEvent);
            }
            
            const competition = eventMatch[1].trim();
            const teams = eventMatch[2].trim();
            const time = eventMatch[3];
            
            // Separar equipos
            let homeTeam = teams;
            let awayTeam = '';
            const teamMatch = teams.match(/(.+)\s+vs\s+(.+)/i);
            if (teamMatch) {
                homeTeam = teamMatch[1].trim();
                awayTeam = teamMatch[2].trim();
            }
            
            currentEvent = {
                id: eventId++,
                competition: competition,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                time: time,
                channels: []
            };
        }
        // Detectar línea de canal (formato: "- [Canal X](URL)")
        else if (currentEvent) {
            const channelMatch = trimmedLine.match(/^- \[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
            if (channelMatch) {
                let channelUrl = channelMatch[2];
                const channelName = channelMatch[1].trim();
                
                // Decodificar URL si está en base64
                if (channelUrl.includes('?r=')) {
                    const parts = channelUrl.split('?r=');
                    if (parts[1]) {
                        try {
                            const decoded = atob(parts[1]);
                            if (decoded) {
                                channelUrl = decoded;
                            }
                        } catch (e) {
                            // Error decoding, keep original
                        }
                    }
                }
                
                currentEvent.channels.push({
                    name: channelName,
                    url: channelUrl,
                    hlsUrl: null
                });
            }
        }
    }
    
    // Agregar el último evento
    if (currentEvent) {
        events.push(currentEvent);
    }
    
    return events;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json; charset=utf-8'
        };
        
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        try {
            // Intentar usar caché
            const cacheKey = 'roja_events';
            if (env.CACHE) {
                const cached = await env.CACHE.get(cacheKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    return new Response(JSON.stringify({ events: data }), {
                        headers: corsHeaders
                    });
                }
            }
            
            // Fetch y parsear
            const html = await fetchHtml(SOURCE_URL);
            if (!html) {
                return new Response(JSON.stringify({ error: 'No se pudo obtener la fuente', events: [] }), {
                    headers: corsHeaders
                });
            }
            
            const events = parseEvents(html);
            
            // Guardar en caché
            if (env.CACHE) {
                await env.CACHE.put(cacheKey, JSON.stringify(events), {
                    expirationTtl: CACHE_DURATION
                });
            }
            
            return new Response(JSON.stringify({ events: events }), {
                headers: corsHeaders
            });
            
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message, events: [] }), {
                headers: corsHeaders,
                status: 500
            });
        }
    }
};
