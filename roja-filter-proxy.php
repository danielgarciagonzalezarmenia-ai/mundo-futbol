<?php
/**
 * Proxy PHP que filtra HTML de rojadirectablog y elimina scripts de anuncios
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: text/html; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener la URL del parámetro
$url = $_GET['url'] ?? '';

if (empty($url)) {
    http_response_code(400);
    echo 'Error: URL parameter is required';
    exit;
}

// Validar que sea una URL de rojadirectablog
if (!strpos($url, 'rojadirectablog.com')) {
    http_response_code(403);
    echo 'Error: Only rojadirectablog.com URLs are allowed';
    exit;
}

// Fetch del HTML
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$html) {
    http_response_code($httpCode);
    echo 'Error fetching URL';
    exit;
}

// Filtrar scripts de anuncios
$html = filterAds($html);

// Reemplazar URLs relativas por absolutas
$html = makeUrlsAbsolute($html, $url);

echo $html;

function filterAds($html) {
    // Eliminar scripts de anuncios conocidos
    $adPatterns = [
        '/<script[^>]*src=["\']https?:\/\/llvpn\.com[^"\']*["\'][^>]*>.*?<\/script>/is',
        '/<script[^>]*src=["\']https?:\/\/.*?tag\.min\.js[^"\']*["\'][^>]*>.*?<\/script>/is',
        '/<script[^>]*src=["\']https?:\/\/.*?gtag\.js[^"\']*["\'][^>]*>.*?<\/script>/is',
        '/<script[^>]*>\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];\s*function\s*gtag\(\)[^<]*<\/script>/is',
        '/<script[^>]*>\s*\(function\(s\)\{s\.dataset\.zone[^<]*<\/script>/is',
    ];
    
    foreach ($adPatterns as $pattern) {
        $html = preg_replace($pattern, '', $html);
    }
    
    // Eliminar iframes de anuncios
    $html = preg_replace('/<iframe[^>]*src=["\'][^"\']*llvpn\.com[^"\']*["\'][^>]*>.*?<\/iframe>/is', '', $html);
    
    return $html;
}

function makeUrlsAbsolute($html, $baseUrl) {
    // Convertir URLs relativas a absolutas
    $baseDomain = parse_url($baseUrl, PHP_URL_SCHEME) . '://' . parse_url($baseUrl, PHP_URL_HOST);
    
    // Reemplazar href relativas
    $html = preg_replace('/href=["\']\/([^"\']*)["\']/', 'href="' . $baseDomain . '/$1"', $html);
    
    // Reemplazar src relativas
    $html = preg_replace('/src=["\']\/([^"\']*)["\']/', 'src="' . $baseDomain . '/$1"', $html);
    
    return $html;
}
?>
