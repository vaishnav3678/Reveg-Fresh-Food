<?php
/**
 * RevEg Fresh Foods - Sections API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();

if ($method === 'GET') {
    echo json_encode($db['sections'] ?? [], JSON_PRETTY_PRINT);
    exit;
}

requireAdminAuth();

if ($method === 'PUT' || $method === 'POST') {
    $body = getRequestBody();
    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Sections must be an array']);
        exit;
    }
    $db['sections'] = $body;
    saveDatabase($db);
    echo json_encode(['success' => true, 'sections' => $body]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
