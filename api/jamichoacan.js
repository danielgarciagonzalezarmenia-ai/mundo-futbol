export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://jamichoacan.org.mx/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Error fetching jamichoacan', status: response.status });
    }

    const content = await response.text();
    const events = parseJamichoacanContent(content);

    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
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
