<?php
/**
 * Proxy API para MundoFutbol
 * 
 * INSTRUCCIONES:
 * 1. Registra tu dominio en ofutbol.jdoxx.com (URL Origen)
 * 2. Sube este archivo a tu hosting
 * 3. En app.js, cambia useMockData a false
 * 4. Cambia la URL de la API a la ruta de este archivo
 * 
 * El proxy es opcional pero recomendado para evitar problemas de CORS
 */

// API Configuration
define('API_URL', 'https://ofutbol.jdoxx.com/api/shedule/25pS5mjWbylQ8kau7Vwcwb4EIRbuZ8');
define('CACHE_DIR', __DIR__ . '/cache');
define('LOG_DIR', __DIR__ . '/logs');

// Enable CORS for all origins
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function ensureDirectories() {
    if (!is_dir(CACHE_DIR)) {
        @mkdir(CACHE_DIR, 0775, true);
    }

    if (!is_dir(LOG_DIR)) {
        @mkdir(LOG_DIR, 0775, true);
    }
}

function getClientIp() {
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        return $_SERVER['HTTP_CF_CONNECTING_IP'];
    }

    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }

    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function getDailyCacheFile() {
    return CACHE_DIR . '/events_' . date('Y-m-d') . '.json';
}

function getDailyLogFile() {
    return LOG_DIR . '/requests_' . date('Y-m-d') . '.log';
}

function logRequest($source, $cacheHit) {
    $line = sprintf(
        "%s\tip=%s\tcache=%s\tsource=%s\turi=%s\tua=%s\n",
        date('c'),
        getClientIp(),
        $cacheHit ? 'hit' : 'miss',
        $source,
        $_SERVER['REQUEST_URI'] ?? '',
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    );

    @file_put_contents(getDailyLogFile(), $line, FILE_APPEND | LOCK_EX);
}

function getCachedData() {
    $cacheFile = getDailyCacheFile();

    if (!file_exists($cacheFile)) {
        return null;
    }

    $cache = json_decode(file_get_contents($cacheFile), true);
    if (!$cache || !isset($cache['data'])) {
        return null;
    }

    return $cache['data'];
}

function setCachedData($data) {
    $cacheFile = getDailyCacheFile();
    $cache = [
        'data' => $data,
        'timestamp' => time(),
        'date' => date('Y-m-d')
    ];

    file_put_contents($cacheFile, json_encode($cache));
}

function fetchFromApi() {
    $ch = curl_init(API_URL);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        error_log('CURL Error: ' . $error);
        return ['error' => 'Error de conexión a la API'];
    }
    
    if ($httpCode !== 200) {
        error_log('HTTP Error: ' . $httpCode);
        return ['error' => 'Error en la respuesta de la API'];
    }
    
    return json_decode($response, true);
}

ensureDirectories();

$forceRefresh = isset($_GET['refresh']) && $_GET['refresh'] === '1';

// Try to get cached data first
if (!$forceRefresh) {
    $cachedData = getCachedData();
    if ($cachedData !== null) {
        header('X-Cache-Status: HIT');
        logRequest('daily-cache', true);
        echo json_encode($cachedData);
        exit;
    }
}

// If no cache, fetch from API
$apiData = fetchFromApi();

if (isset($apiData['error'])) {
    // If API fails, try to return today's cache
    $todayCacheFile = getDailyCacheFile();
    if (file_exists($todayCacheFile)) {
        $staleCache = json_decode(file_get_contents($todayCacheFile), true);
        if ($staleCache && isset($staleCache['data'])) {
            header('X-Cache-Status: STALE');
            logRequest('stale-cache', true);
            echo json_encode($staleCache['data']);
            exit;
        }
    }

    header('X-Cache-Status: MISS');
    logRequest('upstream-error', false);
    echo json_encode(['error' => $apiData['error']]);
    exit;
}

// Cache the successful response
setCachedData($apiData);

// Return the data
header('X-Cache-Status: MISS');
logRequest('upstream-success', false);
echo json_encode($apiData);
?>
