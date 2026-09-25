<?php
/**
 * RevEg Fresh Foods - Settings API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();

if ($method === 'GET') {
    echo json_encode($db['settings'] ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

requireAdminAuth();

if ($method === 'PUT' || $method === 'POST') {
    $body = getRequestBody();
    $current = $db['settings'] ?? [];
    $updated = array_merge($current, $body);
    $db['settings'] = $updated;
    saveDatabase($db);
    echo json_encode(['success' => true, 'settings' => $updated]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
