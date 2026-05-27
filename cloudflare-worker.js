// Cloudflare Worker para proxy de streams HLS y canal.php
// Este worker actúa como intermediario para bypass de restricciones de IP y CORS

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Endpoint para proxy de iframe de tododeportes.xyz
    if (url.pathname === '/player') {
      const channelId = url.searchParams.get('channel');
      
      if (!channelId) {
        return new Response('Error: Se requiere el parámetro "channel"', { status: 400 });
      }
      
      try {
        const playerUrl = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?player=${channelId}`;
        const response = await fetch(playerUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://tododeportes.xyz/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.5',
          }
        });
        
        if (!response.ok) {
          return new Response(`Error del player: ${response.status}`, { status: response.status });
        }
        
        const html = await response.text();
        
        // Reemplazar la URL del stream para que pase por el Worker
        const originalSrc = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?stream=${channelId}`;
        const proxySrc = `https://futbolibre-proxy.mundofutbolcol.workers.dev/stream?channel=${channelId}`;
        
        console.log(`Original SRC: ${originalSrc}`);
        console.log(`Proxy SRC: ${proxySrc}`);
        console.log(`HTML contains original: ${html.includes(originalSrc)}`);
        
        const modifiedHtml = html.replace(originalSrc, proxySrc);
        
        console.log(`HTML contains proxy after replace: ${modifiedHtml.includes(proxySrc)}`);
        
        // Configurar CORS
        const newResponse = new Response(modifiedHtml, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');
        newResponse.headers.set('Content-Type', 'text/html; charset=UTF-8');
        
        return newResponse;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de stream HLS de tododeportes.xyz
    if (url.pathname === '/stream') {
      const channelId = url.searchParams.get('channel');
      
      if (!channelId) {
        return new Response('Error: Se requiere el parámetro "channel"', { status: 400 });
      }
      
      try {
        const streamUrl = `https://tododeportes.xyz/streams/tvtvhd/proxy.php?stream=${channelId}`;
        const response = await fetch(streamUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://tododeportes.xyz/',
            'Accept': '*/*',
            'Accept-Language': 'es-419,es;q=0.5',
          }
        });
        
        if (!response.ok) {
          return new Response(`Error del stream: ${response.status}`, { status: response.status });
        }
        
        // Configurar CORS y headers para streaming
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');
        newResponse.headers.set('Content-Type', 'application/vnd.apple.mpegurl');
        newResponse.headers.set('Cache-Control', 'no-cache');
        
        return newResponse;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de canal.php (similar a futbolibre/la14hd)
    if (url.pathname === '/canal') {
      const streamName = url.searchParams.get('stream');
      
      if (!streamName) {
        return new Response('Error: Se requiere el parámetro "stream"', { status: 400 });
      }
      
      try {
        // Llamar a canales.php de la14hd
        const canalUrl = `https://la14hd.com/vivo/canales.php?stream=${streamName}`;
        const response = await fetch(canalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://deporflix.net/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'es-419,es;q=0.5',
          }
        });
        
        if (!response.ok) {
          return new Response(`Error del canal: ${response.status}`, { status: response.status });
        }
        
        const html = await response.text();
        
        // Configurar CORS
        const newResponse = new Response(html, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        newResponse.headers.set('Access-Control-Allow-Headers', '*');
        newResponse.headers.set('Content-Type', 'text/html; charset=UTF-8');
        
        return newResponse;
        
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    // Endpoint para proxy de streams HLS (original)
    const streamUrl = url.searchParams.get('url');
    
    if (!streamUrl) {
      return new Response('Error: Se requiere el parámetro "url"', { status: 400 });
    }
    
    try {
      // Hacer fetch al stream original con headers de futbolibre
      const response = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://futbol-libre.su/',
          'Origin': 'https://futbol-libre.su',
          'Accept': '*/*',
          'Accept-Language': 'es-419,es;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Range': request.headers.get('Range') || 'bytes=0-',
        }
      });
      
      if (!response.ok) {
        return new Response(`Error del stream: ${response.status}`, { status: response.status });
      }
      
      // Clonar la respuesta para modificar headers
      const newResponse = new Response(response.body, response);
      
      // Configurar CORS para permitir acceso desde cualquier origen
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', '*');
      newResponse.headers.set('Access-Control-Expose-Headers', '*');
      newResponse.headers.set('Access-Control-Allow-Credentials', 'false');
      
      // Headers para streaming de video
      newResponse.headers.set('Content-Type', 'application/vnd.apple.mpegurl');
      newResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // Copiar headers de respuesta del stream original
      if (response.headers.get('Content-Type')) {
        newResponse.headers.set('Content-Type', response.headers.get('Content-Type'));
      }
      
      // Manejar preflight requests
      if (request.method === 'OPTIONS') {
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
      
      return newResponse;
      
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
