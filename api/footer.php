<?php
/**
 * RevEg Fresh Foods - Footer API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();

if ($method === 'GET') {
    echo json_encode($db['footer'] ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

requireAdminAuth();

if ($method === 'PUT' || $method === 'POST') {
    $body = getRequestBody();
    $db['footer'] = $body;
    saveDatabase($db);
    echo json_encode(['success' => true, 'footer' => $body]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
