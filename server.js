const express = require('express');
const app = express();
const path = require('path');
const { Readable } = require('stream');

app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '.')));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.get('/api/roja', async (req, res) => {
  try {
    const response = await fetch('https://rojadirecta.me/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Error fetching roja', status: response.status });
    }

    const content = await response.text();
    const events = parseRojaContent(content);

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint para streams HLS con bypass de IP
app.get('/api/proxy', async (req, res) => {
  const streamUrl = req.query.url;
  
  console.log('=== Proxy Request ===');
  console.log('Stream URL:', streamUrl);
  console.log('Time:', new Date().toISOString());
  
  if (!streamUrl) {
    console.log('Error: Missing URL parameter');
    return res.status(400).send('Error: Se requiere el parámetro "url"');
  }
  
  try {
    console.log('Fetching stream...');
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
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.log('Error: Stream response not OK');
      return res.status(response.status).send(`Error del stream: ${response.status}`);
    }
    
    // Configurar CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    
    console.log('Piping stream to client...');
    // Pipe el stream al cliente
    const buffer = await response.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));
    stream.pipe(res);
    
    console.log('Stream piped successfully');
    
  } catch (error) {
    console.log('Error:', error.message);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

function parseRojaContent(content) {
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

function parseJamichoacanContent(content) {
  const events = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
