<?php
/**
 * Proxy para ejecutar el scraper de Python
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Ejecutar el script de Python
$pythonPath = 'python'; // o 'python3' dependiendo del servidor
$scriptPath = __DIR__ . '/roja_scraper.py';

$output = shell_exec("$pythonPath $scriptPath 2>&1");

echo $output;
?>
