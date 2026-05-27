/**
 * Cloudflare Worker para jamichoacan.org.mx
 * Extrae eventos y canales del formato de texto plano
 */

export default {
  async fetch(request, env, ctx) {
    // CORS headers - headers más permisivos para iOS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Handle OPTIONS requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Fetch jamichoacan.org.mx
      const response = await fetch('https://jamichoacan.org.mx/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: 'Error fetching URL',
            httpCode: response.status
          }),
          { status: 500, headers: corsHeaders }
        );
      }

      const content = await response.text();
      const events = parseJamichoacanContent(content);
      
      // Extraer reproductores de blogs para cada canal (limitado a primeros 10 eventos para evitar timeout)
      const eventsToProcess = events.slice(0, 10);
      for (const event of eventsToProcess) {
        for (const channel of event.channels) {
          if (channel.url && !channel.url.includes('.m3u8')) {
            const playerUrl = await extractPlayerFromBlog(channel.url);
            if (playerUrl) {
              channel.hlsUrl = playerUrl;
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ events }),
        { headers: corsHeaders }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};

function parseJamichoacanContent(content) {
  const htmlEvents = parseHtmlEvents(content);
  if (htmlEvents.length > 0) {
    return htmlEvents;
  }

  const events = [];
  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|ul|ol|h[1-6]|a)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/\r/g, '\n');
  const lines = text.split('\n');
  
  let currentEvent = null;
  let eventId = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Detectar línea de evento (formato: "- Liga: Equipo1 - Equipo2Hora AM/PM")
    const eventMatch = trimmedLine.match(/^-?\s*([^:]+):\s*(.+?)\s*(\d{1,2}:\d{2}\s*(AM|PM))/i);
    if (eventMatch) {
      if (currentEvent) {
        events.push(currentEvent);
      }
      
      const league = eventMatch[1].trim();
      const teams = eventMatch[2].trim();
      const time = eventMatch[3].trim();
      
      // Separar equipos
      const teamMatch = teams.match(/(.+?)\s+-\s+(.+)/);
      let homeTeam = teams;
      let awayTeam = '';
      
      if (teamMatch) {
        homeTeam = teamMatch[1].trim();
        awayTeam = teamMatch[2].trim();
      }
      
      currentEvent = {
        id: eventId++,
        league,
        homeTeam,
        awayTeam,
        time,
        channels: []
      };
    }
    // Detectar línea de canal (formato: "- [CANAL-1 Calidad 720p](URL)")
    else if (currentEvent) {
      const channelMatch = trimmedLine.match(/^-?\s*\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
      if (channelMatch) {
        const channelName = channelMatch[1].trim();
        const channelUrl = channelMatch[2];
        
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

function parseHtmlEvents(content) {
  const events = [];
  const eventRegex = /<li[^>]*class=["']AR["'][^>]*>[\s\S]*?<a[^>]*>\s*([\s\S]*?)<span[^>]*class=["']t["'][^>]*>\s*([^<]+)\s*<\/span>[\s\S]*?<\/a>\s*<ul>\s*([\s\S]*?)<\/ul>/gi;
  let match;
  let eventId = 0;

  while ((match = eventRegex.exec(content)) !== null) {
    const rawTitle = cleanHtml(match[1]);
    const time = cleanHtml(match[2]);
    const channelsHtml = match[3];
    const titleMatch = rawTitle.match(/^([^:]+):\s*(.+)$/);
    const league = titleMatch ? titleMatch[1].trim() : 'Fútbol';
    const teams = titleMatch ? titleMatch[2].trim() : rawTitle;
    const teamMatch = teams.match(/(.+?)\s+-\s+(.+)/);
    const homeTeam = teamMatch ? teamMatch[1].trim() : teams;
    const awayTeam = teamMatch ? teamMatch[2].trim() : '';
    const channels = [];
    const channelRegex = /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let channelMatch;

    while ((channelMatch = channelRegex.exec(channelsHtml)) !== null) {
      channels.push({
        name: cleanHtml(channelMatch[2]).replace(/\s+/g, ' ').trim(),
        url: channelMatch[1],
        hlsUrl: null
      });
    }

    events.push({
      id: eventId++,
      league,
      homeTeam,
      awayTeam,
      time,
      channels
    });
  }

  return events;
}

function cleanHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractPlayerFromBlog(blogUrl) {
  try {
    const response = await fetch(blogUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Buscar URLs .m3u8 en el HTML (ignorar YouTube)
    const m3u8Match = html.match(/https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/i);
    if (m3u8Match && !m3u8Match[0].includes('youtube')) {
      return m3u8Match[0];
    }
    
    // Si no encuentra .m3u8, buscar iframes con src (ignorar YouTube)
    const iframeMatch = html.match(/<iframe[^>]*src=["'](https?:\/\/[^"']+)["'][^>]*>/i);
    if (iframeMatch && !iframeMatch[1].includes('youtube')) {
      return iframeMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting player from blog:', error);
    return null;
  }
}
