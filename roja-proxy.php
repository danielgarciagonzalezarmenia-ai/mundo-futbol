<?php
/**
 * Scraper de rojadirectablog.com
 * Extrae eventos, canales y URLs HLS reales
 */

define('SOURCE_URL', 'https://rojadirectablog.com/default.php');
define('CACHE_FILE', __DIR__ . '/roja_cache.json');
define('CACHE_DURATION', 300); // 5 minutos

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function getCachedData() {
    if (!file_exists(CACHE_FILE)) return null;
    $cache = json_decode(file_get_contents(CACHE_FILE), true);
    if (!$cache || !isset($cache['data']) || !isset($cache['timestamp'])) return null;
    if ((time() - $cache['timestamp']) > CACHE_DURATION) {
        @unlink(CACHE_FILE);
        return null;
    }
    return $cache['data'];
}

function setCachedData($data) {
    file_put_contents(CACHE_FILE, json_encode([
        'data' => $data,
        'timestamp' => time()
    ]));
}

function fetchHtml($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    $html = curl_exec($ch);
    curl_close($ch);
    return $html;
}

function extractHlsUrl($html) {
    // Buscar URLs .m3u8 en el HTML
    if (preg_match_all('/https?:\/\/[^\s\'"<>]+\.m3u8[^\s\'"<>]*/i', $html, $matches)) {
        // Devolver la primera URL encontrada
        return $matches[0][0];
    }
    
    // También buscar en scripts embed
    if (preg_match_all('/(https?:\/\/[^\s\'"<>]+\.m3u8[^\s\'"<>]*)/i', $html, $matches)) {
        return $matches[1][0];
    }
    
    return null;
}

function parseEvents($html) {
    $events = [];
    
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8">' . $html);
    libxml_clear_errors();
    
    $xpath = new DOMXPath($dom);
    
    // Buscar elementos li que contienen eventos
    $items = $xpath->query("//li[contains(@class, 'list-group-item')]");
    
    $eventId = 0;
    foreach ($items as $item) {
        $text = trim($item->textContent);
        
        if (!preg_match('/^(.+?)(\d{1,2}:\d{2})\s*$/u', $text, $matches)) continue;
        
        $title = trim($matches[1]);
        $time = trim($matches[2]);
        
        // Extraer canales (links)
        $links = $xpath->query(".//a[contains(@href, 'rojadirectablog.com')]", $item);
        $channels = [];
        
        foreach ($links as $link) {
            $href = $link->getAttribute('href');
            $name = trim($link->textContent);
            
            if (empty($name) || stripos($name, 'canal') === false) continue;
            
            $channels[] = [
                'name' => $name,
                'url' => $href
            ];
        }
        
        if (count($channels) === 0) continue;
        
        // Separar competicion de equipos
        $competition = '';
        $teams = $title;
        if (strpos($title, ':') !== false) {
            $parts = explode(':', $title, 2);
            $competition = trim($parts[0]);
            $teams = trim($parts[1]);
        }
        
        // Separar home vs away
        $homeTeam = $teams;
        $awayTeam = '';
        if (stripos($teams, ' vs ') !== false) {
            $teamParts = preg_split('/\s+vs\s+/i', $teams, 2);
            $homeTeam = trim($teamParts[0]);
            $awayTeam = trim($teamParts[1]);
        }
        
        $events[] = [
            'id' => $eventId++,
            'title' => $title,
            'competition' => $competition,
            'homeTeam' => $homeTeam,
            'awayTeam' => $awayTeam,
            'time' => $time,
            'channels' => $channels
        ];
    }
    
    return $events;
}

function extractHlsUrlsFromChannels($events) {
    // Extraer URL HLS de cada página de canal
    foreach ($events as &$event) {
        foreach ($event['channels'] as &$channel) {
            $channelHtml = fetchHtml($channel['url']);
            $hlsUrl = extractHlsUrl($channelHtml);
            $channel['hlsUrl'] = $hlsUrl;
        }
    }
    return $events;
}

// Try cache first
$cached = getCachedData();
if ($cached !== null) {
    echo json_encode(['events' => $cached]);
    exit;
}

$html = fetchHtml(SOURCE_URL);
if (!$html) {
    echo json_encode(['error' => 'No se pudo obtener la fuente', 'events' => []]);
    exit;
}

$events = parseEvents($html);
$events = extractHlsUrlsFromChannels($events);
setCachedData($events);

echo json_encode(['events' => $events]);
?>
