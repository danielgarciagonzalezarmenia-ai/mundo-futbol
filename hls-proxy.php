<?php
// hls-proxy.php
// Proxy gratuito en PHP para transmitir señales HLS (.m3u8 y .ts) evadiendo CORS y bloqueos de Referer.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$url = $_GET['url'] ?? '';
if (empty($url)) {
    http_response_code(400);
    echo "Error: Se requiere el parametro 'url'";
    exit;
}

// Decodificar la URL del stream
$url = rawurldecode($url);

// Asignar el referer correcto. Si es de fubohd/la14hd, suplantamos con la14hd.com
$referer = 'https://la14hd.com/'; 
if (strpos($url, 'fubohd.com') === false && strpos($url, 'la14hd.com') === false) {
    $parsed = parse_url($url);
    $referer = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '');
}

// Inicializar curl para hacer la petición simulada en el backend
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

$headers = [
    "Referer: $referer",
    "Origin: $referer"
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// Comprobar si la petición solicita un archivo de lista de reproducción (.m3u8)
$isM3u8 = (strpos(strtolower(parse_url($url, PHP_URL_PATH)), '.m3u8') !== false) || (strpos($url, 'm3u8') !== false);

if ($isM3u8) {
    $response = curl_exec($ch);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);
    
    if ($response === false) {
        http_response_code(502);
        echo "Error al obtener la lista HLS";
        exit;
    }
    
    // Reescribir todas las líneas del .m3u8 para canalizarlas a través de nuestro propio proxy
    $baseUrl = substr($url, 0, strrpos($url, '/') + 1);
    $lines = explode("\n", $response);
    $rewrittenLines = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line)) {
            $rewrittenLines[] = '';
            continue;
        }
        
        if (strpos($line, '#') === 0) {
            $rewrittenLines[] = $line;
            continue;
        }
        
        // Construir la URL absoluta del fragmento de video
        if (strpos($line, 'http://') !== 0 && strpos($line, 'https://') !== 0) {
            if (strpos($line, '/') === 0) {
                $parsed = parse_url($url);
                $fullSegmentUrl = ($parsed['scheme'] ?? 'https') . '://' . ($parsed['host'] ?? '') . $line;
            } else {
                $fullSegmentUrl = $baseUrl . $line;
            }
        } else {
            $fullSegmentUrl = $line;
        }
        
        // Hacer que el fragmento también se pida mediante este proxy PHP
        $myUrl = ($_SERVER['HTTPS'] ?? 'off') === 'on' ? 'https' : 'http';
        $myUrl .= "://" . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'];
        $rewrittenLines[] = $myUrl . "?url=" . rawurlencode($fullSegmentUrl);
    }
    
    header('Content-Type: ' . ($contentType ?: 'application/x-mpegURL'));
    header('Cache-Control: no-cache, no-store, must-revalidate');
    echo implode("\n", $rewrittenLines);
} else {
    // Si es un fragmento de video (.ts), enviarlo directamente en tiempo real para no sobrecargar el servidor
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    
    if (isset($_SERVER['HTTP_RANGE'])) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($headers, ["Range: " . $_SERVER['HTTP_RANGE']]));
    }
    
    header('Content-Type: video/mp2t');
    header('Cache-Control: no-cache, no-store, must-revalidate');
    
    curl_exec($ch);
    curl_close($ch);
}
?>
