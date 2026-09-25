<?php
/**
 * RevEg Fresh Foods - Theme API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();

if ($method === 'GET') {
    echo json_encode($db['theme'] ?? [], JSON_PRETTY_PRINT);
    exit;
}

requireAdminAuth();

if ($method === 'PUT' || $method === 'POST') {
    $body = getRequestBody();
    $current = $db['theme'] ?? [];
    $updated = array_merge($current, $body);
    $db['theme'] = $updated;
    saveDatabase($db);
    echo json_encode(['success' => true, 'theme' => $updated]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
