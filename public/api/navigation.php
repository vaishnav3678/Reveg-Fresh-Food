<?php
/**
 * RevEg Fresh Foods - Navigation API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();

if ($method === 'GET') {
    echo json_encode($db['navigation'] ?? [], JSON_PRETTY_PRINT);
    exit;
}

requireAdminAuth();

if ($method === 'PUT' || $method === 'POST') {
    $body = getRequestBody();
    $db['navigation'] = $body;
    saveDatabase($db);
    echo json_encode(['success' => true, 'navigation' => $body]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
