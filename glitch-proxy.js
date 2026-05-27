const express = require('express');
const app = express();

// Proxy endpoint para streams HLS con bypass de IP
app.get('/api/proxy', async (req, res) => {
  const streamUrl = req.query.url;
  
  if (!streamUrl) {
    return res.status(400).send('Error: Se requiere el parámetro "url"');
  }
  
  try {
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
      return res.status(response.status).send(`Error del stream: ${response.status}`);
    }
    
    // Configurar CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    
    // Pipe el stream al cliente
    response.body.pipe(res);
    
  } catch (error) {
    return res.status(500).send(`Error: ${error.message}`);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Proxy server running on port ${listener.address().port}`);
});
