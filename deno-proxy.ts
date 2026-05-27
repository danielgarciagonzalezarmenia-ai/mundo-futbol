// Deno Deploy para proxy de streams HLS
// Este servidor actúa como intermediario para bypass de restricciones de IP

Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // Obtener la URL del stream del parámetro 'url'
  const streamUrl = url.searchParams.get('url');
  
  if (!streamUrl) {
    return new Response('Error: Se requiere el parámetro "url"', { status: 400 });
  }
  
  try {
    // Hacer fetch al stream original
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://la14hd.com/',
        'Origin': 'https://la14hd.com',
        'Accept': '*/*',
        'Accept-Language': 'es-419,es;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
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
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
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
});
