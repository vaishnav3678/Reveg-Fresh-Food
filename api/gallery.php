<?php
/**
 * RevEg Fresh Foods - Gallery API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();
$gallery = isset($db['gallery']) && is_array($db['gallery']) ? $db['gallery'] : [];

$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $id = $parts[0];
}

if ($method === 'GET') {
    echo json_encode($gallery, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

requireAdminAuth();

if ($method === 'DELETE' || ($method === 'POST' && (($_GET['action'] ?? '') === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }
    $gallery = array_values(array_filter($gallery, function($g) use ($id) {
        return ($g['id'] ?? '') !== $id;
    }));
    $db['gallery'] = $gallery;
    saveDatabase($db);
    echo json_encode(['success' => true, 'message' => 'Gallery item deleted']);
    exit;
}

$body = getRequestBody();
$targetId = $id ?: ($body['id'] ?? '');

if ($method === 'PUT' || ($method === 'POST' && ($targetId || ($_GET['action'] ?? '') === 'update' || ($_POST['_method'] ?? '') === 'PUT'))) {
    for ($i = 0; $i < count($gallery); $i++) {
        if ($gallery[$i]['id'] === $targetId) {
            $gallery[$i] = array_merge($gallery[$i], $body);
            $gallery[$i]['id'] = $targetId;
            $db['gallery'] = $gallery;
            saveDatabase($db);
            echo json_encode(['success' => true, 'item' => $gallery[$i]]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Item not found']);
    exit;
}

if ($method === 'POST') {
    $newItem = [
        'id' => $body['id'] ?? ('gal_' . time() . '_' . substr(md5(uniqid()), 0, 4)),
        'title' => $body['title'] ?? 'Food Photo',
        'category' => $body['category'] ?? 'Sweets',
        'image' => $body['image'] ?? 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        'description' => $body['description'] ?? '',
        'isEnabled' => $body['isEnabled'] ?? true,
        'sortOrder' => count($gallery) + 1,
    ];
    $gallery[] = $newItem;
    $db['gallery'] = $gallery;
    saveDatabase($db);
    echo json_encode(['success' => true, 'item' => $newItem]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
