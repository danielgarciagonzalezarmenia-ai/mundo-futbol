<?php
/**
 * Proxy seguro para envío de notificaciones push de Firebase FCM v1
 * Mundo Futbol - 2026
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validar que la petición sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido. Utiliza POST']);
    exit;
}

// Leer cuerpo del POST
$input = json_decode(file_get_contents('php://input'), true);

$title = $input['title'] ?? '';
$body = $input['body'] ?? '';
$link = $input['link'] ?? '';
$adminSecret = $input['secret'] ?? '';

// Clave secreta para autorizar el envío (debe coincidir con la del panel admin)
$configSecret = 'mf2024secure_token'; 

if (empty($adminSecret) || $adminSecret !== $configSecret) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado. Clave incorrecta']);
    exit;
}

if (empty($title) || empty($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos obligatorios: title y body']);
    exit;
}

// Cargar credenciales de la cuenta de servicio de Firebase
$serviceAccountPath = __DIR__ . '/firebase-service-account.json';
if (!file_exists($serviceAccountPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Archivo de cuenta de servicio no encontrado localmente']);
    exit;
}

$serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
$projectId = $serviceAccount['project_id'];
$clientEmail = $serviceAccount['client_email'];
$privateKey = $serviceAccount['private_key'];

// 1. Función para codificar en Base64Url
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

// 2. Generar JWT para autenticación de Google OAuth2
$now = time();
$header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
$payload = json_encode([
    'iss' => $clientEmail,
    'scope' => 'https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/datastore',
    'aud' => 'https://oauth2.googleapis.com/token',
    'exp' => $now + 3600,
    'iat' => $now
]);

$signatureInput = base64UrlEncode($header) . '.' . base64UrlEncode($payload);
$signature = '';

if (!openssl_sign($signatureInput, $signature, $privateKey, OPENSSL_ALGO_SHA256)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al firmar JWT con OpenSSL']);
    exit;
}

$jwt = $signatureInput . '.' . base64UrlEncode($signature);

// 3. Solicitar Token de Acceso (OAuth2) de Google
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion' => $jwt
]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$oauthResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

$accessToken = $oauthResponse['access_token'] ?? null;

if (!$accessToken) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener token OAuth2 de Google', 'details' => $oauthResponse]);
    exit;
}

// 4. Obtener todos los tokens registrados en Firestore (colección "subscriptions")
$firestoreUrl = "https://firestore.googleapis.com/v1/projects/{$projectId}/databases/(default)/documents/subscriptions?pageSize=1000";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $firestoreUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer {$accessToken}",
    "Accept: application/json"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$firestoreResponse = json_decode(curl_exec($ch), true);
curl_close($ch);

$documents = $firestoreResponse['documents'] ?? [];

if (empty($documents)) {
    echo json_encode(['success' => true, 'sentCount' => 0, 'message' => 'No hay usuarios suscritos para enviar notificaciones']);
    exit;
}

// 5. Enviar notificación push a cada token usando FCM v1 API
$fcmUrl = "https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send";
$successCount = 0;
$failedCount = 0;

foreach ($documents as $doc) {
    $fields = $doc['fields'] ?? [];
    $token = $fields['token']['stringValue'] ?? null;
    
    if (!$token) continue;
    
    // Armar el payload de la notificación de FCM v1
    $message = [
        'message' => [
            'token' => $token,
            'notification' => [
                'title' => $title,
                'body' => $body
            ]
        ]
    ];
    
    // Añadir enlace de redirección opcional
    if (!empty($link)) {
        $message['message']['data'] = [
            'click_action' => $link,
            'url' => $link
        ];
        $message['message']['webpush'] = [
            'fcm_options' => [
                'link' => $link
            ]
        ];
    }
    
    // Enviar petición POST a FCM
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fcmUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer {$accessToken}",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $res = json_decode(curl_exec($ch), true);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $successCount++;
    } else {
        $failedCount++;
        // Si el token ya no es válido, podríamos borrarlo de Firestore para mantener limpia la DB
        if (isset($res['error']['status']) && ($res['error']['status'] === 'UNREGISTERED' || $res['error']['status'] === 'INVALID_ARGUMENT')) {
            $docName = $doc['name']; // URL completa del documento
            $chDelete = curl_init();
            curl_setopt($chDelete, CURLOPT_URL, "https://firestore.googleapis.com/v1/{$docName}");
            curl_setopt($chDelete, CURLOPT_CUSTOMREQUEST, 'DELETE');
            curl_setopt($chDelete, CURLOPT_HTTPHEADER, ["Authorization: Bearer {$accessToken}"]);
            curl_setopt($chDelete, CURLOPT_RETURNTRANSFER, true);
            curl_exec($chDelete);
            curl_close($chDelete);
        }
    }
}

echo json_encode([
    'success' => true,
    'sentCount' => $successCount,
    'failedCount' => $failedCount,
    'message' => "Notificación enviada con éxito a {$successCount} usuarios. ({$failedCount} fallidas/limpiadas)"
]);
