// Cloudflare Worker para proxy de streams HLS y canal.php
// Este worker actúa como intermediario para bypass de restricciones de IP y CORS

const PROXY_BASE = 'https://futbolibre-proxy.mundofutbolcol.workers.dev';

function addCorsHeaders(response) {
  const newResp = new Response(response.body, response);
  newResp.headers.set('Access-Control-Allow-Origin', '*');
  newResp.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  newResp.headers.set('Access-Control-Allow-Headers', '*');
  newResp.headers.set('Access-Control-Expose-Headers', '*');
  return newResp;
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    }
  });
}

async function proxyFetch(url, extraHeaders = {}) {
  return await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
      'Accept-Language': 'es-419,es;q=0.5',
      ...extraHeaders
    }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') return handleOptions();
    
    // /ts endpoint: proxy raw MPEG-TS streams (Xtream Codes)
    if (url.pathname === '/ts') {
      const tsUrl = url.searchParams.get('url');
      if (!tsUrl) return new Response('Error: Se requiere "url"', { status: 400 });
      
      try {
        const isXtream = tsUrl.includes('ahhshitherewegoagain') || tsUrl.includes('dieselhosting');
        const headers = {
          'User-Agent': isXtream ? 'VLC/3.0.18' : 'Mozilla/5.0',
        };
        const clientRange = request.headers.get('Range');
        if (clientRange) {
          headers['Range'] = clientRange;
        }
        const response = await fetch(tsUrl, { headers });
        if (!response.ok && response.status !== 206) {
          if (response.status === 444) {
            return new Response('Stream blocked by server', { status: 502 });
          }
          return new Response(`Error: ${response.status}`, { status: response.status });
        }
        
        const newResp = addCorsHeaders(response);
        newResp.headers.set('Content-Type', 'video/mp2t');
        newResp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        newResp.headers.delete('Content-Length');
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // /hls endpoint: proxy HLS playlists with segment URL rewriting
    if (url.pathname === '/hls') {
      const m3u8Url = url.searchParams.get('url');
      if (!m3u8Url) return new Response('Error: Se requiere "url"', { status: 400 });
      
      try {
        const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
        const isXtream = m3u8Url.includes('ahhshitherewegoagain') || m3u8Url.includes('dieselhosting');
        const response = await fetch(m3u8Url, {
          headers: {
            'User-Agent': isXtream ? 'VLC/3.0.18' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Accept-Language': 'es-419,es;q=0.5',
            'Referer': new URL(m3u8Url).origin,
            'Origin': new URL(m3u8Url).origin,
          }
        });
        if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
        
        const contentType = response.headers.get('Content-Type') || '';
        const text = await response.text();
        
        // If it's an M3U8 playlist, rewrite segment URLs
        if (text.startsWith('#EXTM3U')) {
          const lines = text.split('\n');
          const rewritten = lines.map(line => {
            const trimmed = line.trim();
            // Skip comments, tags, and empty lines
            if (trimmed.startsWith('#') || !trimmed) return line;
            // If it's a URL/path, rewrite it through the proxy
            if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
              const segmentUrl = trimmed.startsWith('/')
                ? new URL(trimmed, new URL(m3u8Url).origin).href
                : baseUrl + trimmed;
              return `${PROXY_BASE}/hlsseg?url=${encodeURIComponent(segmentUrl)}`;
            }
            return line;
          }).join('\n');
          
          const newResp = new Response(rewritten);
          addCorsHeaders(newResp);
          newResp.headers.set('Content-Type', contentType || 'application/vnd.apple.mpegurl');
          newResp.headers.set('Cache-Control', 'no-cache');
          return newResp;
        }
        
        // Not an M3U8, pass through
        const newResp = addCorsHeaders(response);
        newResp.headers.set('Cache-Control', 'no-cache');
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // /hlsseg endpoint: proxy HLS segments (TS, M4S, etc.)
    if (url.pathname === '/hlsseg') {
      const segUrl = url.searchParams.get('url');
      if (!segUrl) return new Response('Error: Se requiere "url"', { status: 400 });
      
      try {
        const isXtream = segUrl.includes('ahhshitherewegoagain') || segUrl.includes('dieselhosting');
        const response = await fetch(segUrl, {
          headers: {
            'User-Agent': isXtream ? 'VLC/3.0.18' : 'Mozilla/5.0',
            'Referer': new URL(segUrl).origin,
            'Origin': new URL(segUrl).origin,
            'Range': request.headers.get('Range') || 'bytes=0-',
          }
        });
        if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
        
        const newResp = addCorsHeaders(response);
        newResp.headers.set('Cache-Control', 'no-cache');
        if (response.headers.get('Content-Type')) {
          newResp.headers.set('Content-Type', response.headers.get('Content-Type'));
        }
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de iframe de tododeportes.xyz
    if (url.pathname === '/player') {
      const channelId = url.searchParams.get('channel');
      if (!channelId) return new Response('Error: Se requiere "channel"', { status: 400 });
      
      try {
        const playerUrl = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?player=${channelId}`;
        const response = await proxyFetch(playerUrl, {
          'Referer': 'https://tododeportes.xyz/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        });
        if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
        
        const html = await response.text();
        const originalSrc = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?stream=${channelId}`;
        const proxySrc = `${PROXY_BASE}/stream?channel=${channelId}`;
        const modifiedHtml = html.replace(originalSrc, proxySrc);
        
        const newResp = new Response(modifiedHtml, response);
        newResp.headers.set('Access-Control-Allow-Origin', '*');
        newResp.headers.set('Content-Type', 'text/html; charset=UTF-8');
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de stream HLS de tododeportes.xyz
    if (url.pathname === '/stream') {
      const channelId = url.searchParams.get('channel');
      if (!channelId) return new Response('Error: Se requiere "channel"', { status: 400 });
      
      try {
        const streamUrl = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?stream=${channelId}`;
        const response = await proxyFetch(streamUrl, { 'Referer': 'https://tododeportes.xyz/' });
        if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
        
        const newResp = addCorsHeaders(response);
        newResp.headers.set('Content-Type', 'application/vnd.apple.mpegurl');
        newResp.headers.set('Cache-Control', 'no-cache');
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de canal.php
    if (url.pathname === '/canal') {
      const streamName = url.searchParams.get('stream');
      if (!streamName) return new Response('Error: Se requiere "stream"', { status: 400 });
      
      try {
        const canalUrl = `https://la14hd.com/vivo/canales.php?stream=${streamName}`;
        const response = await proxyFetch(canalUrl, {
          'Referer': 'https://deporflix.net/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        });
        if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
        
        const html = await response.text();
        const newResp = new Response(html, response);
        newResp.headers.set('Access-Control-Allow-Origin', '*');
        newResp.headers.set('Content-Type', 'text/html; charset=UTF-8');
        return newResp;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint genérico para proxy de streams (compatibilidad hacia atrás)
    const streamUrl = url.searchParams.get('url');
    if (!streamUrl) {
      return new Response('Error: Se requiere el parámetro "url"', { status: 400 });
    }
    
    try {
      const response = await proxyFetch(streamUrl, {
        'Referer': new URL(streamUrl).origin,
        'Origin': new URL(streamUrl).origin,
        'Range': request.headers.get('Range') || 'bytes=0-',
      });
      if (!response.ok) return new Response(`Error: ${response.status}`, { status: response.status });
      
      const newResp = addCorsHeaders(response);
      newResp.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      if (response.headers.get('Content-Type')) {
        newResp.headers.set('Content-Type', response.headers.get('Content-Type'));
      }
      return newResp;
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
