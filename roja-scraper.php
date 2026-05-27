<?php
/**
 * Scraper PHP para rojadirectablog.com
 * Extrae eventos y canales del formato de texto plano
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// URL de rojadirectablog
$url = 'https://rojadirectablog.com/default.php';

// Fetch del contenido
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$content = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Debug logging
error_log("HTTP Code: " . $httpCode);
error_log("CURL Error: " . $error);
error_log("Content Length: " . strlen($content));
error_log("Content Preview: " . substr($content, 0, 500));

if ($httpCode !== 200 || !$content) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error fetching URL', 
        'httpCode' => $httpCode,
        'curlError' => $error,
        'contentLength' => strlen($content)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Parsear el contenido
$events = parseRojadirectaContent($content);

echo json_encode(['events' => $events], JSON_UNESCAPED_UNICODE);

function parseRojadirectaContent($content) {
    $events = [];
    $lines = explode("\n", $content);
    
    $currentEvent = null;
    $eventId = 0;
    
    error_log("Total lines: " . count($lines));
    
    foreach ($lines as $line) {
        $line = trim($line);
        error_log("Processing line: " . substr($line, 0, 100));
        
        // Detectar línea de evento (formato: "- Copa Libertadores: Equipo1 vs Equipo2Hora")
        if (preg_match('/^- ([^:]+): ([^-]+)(\d{1,2}:\d{2})$/', $line, $matches)) {
            if ($currentEvent) {
                $events[] = $currentEvent;
            }
            
            $competition = trim($matches[1]);
            $teams = trim($matches[2]);
            $time = $matches[3];
            
            error_log("Found event: " . $competition . " - " . $teams . " - " . $time);
            
            // Separar equipos
            $homeTeam = $teams;
            $awayTeam = '';
            if (preg_match('/(.+)\s+vs\s+(.+)/i', $teams, $teamMatch)) {
                $homeTeam = trim($teamMatch[1]);
                $awayTeam = trim($teamMatch[2]);
            }
            
            $currentEvent = [
                'id' => $eventId++,
                'competition' => $competition,
                'homeTeam' => $homeTeam,
                'awayTeam' => $awayTeam,
                'time' => $time,
                'channels' => []
            ];
        }
        // Detectar línea de canal (formato: "- [Canal X](URL)")
        elseif ($currentEvent && preg_match('/^- \[([^\]]+)\]\((https?:\/\/[^\)]+)\)/', $line, $matches)) {
            $channelName = trim($matches[1]);
            $channelUrl = $matches[2];
            
            error_log("Found channel: " . $channelName . " - " . $channelUrl);
            
            // Decodificar URL si está en base64
            if (strpos($channelUrl, '?r=') !== false) {
                $parts = explode('?r=', $channelUrl);
                if (isset($parts[1])) {
                    $decoded = base64_decode($parts[1]);
                    if ($decoded) {
                        $channelUrl = $decoded;
                        error_log("Decoded URL: " . $channelUrl);
                    }
                }
            }
            
            $currentEvent['channels'][] = [
                'name' => $channelName,
                'url' => $channelUrl,
                'hlsUrl' => null
            ];
        }
    }
    
    // Agregar el último evento
    if ($currentEvent) {
        $events[] = $currentEvent;
    }
    
    error_log("Total events found: " . count($events));
    
    return $events;
}
?>
