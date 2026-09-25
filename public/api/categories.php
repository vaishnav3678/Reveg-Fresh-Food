<?php
/**
 * RevEg Fresh Foods - Categories API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$paths = getSitePaths();
$db = getDatabase();
$categories = isset($db['categories']) && is_array($db['categories']) ? $db['categories'] : [];

$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $id = $parts[0];
}

if ($method === 'GET') {
    echo json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

requireAdminAuth();

if ($method === 'DELETE' || ($method === 'POST' && (($_GET['action'] ?? '') === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }
    $categories = array_values(array_filter($categories, function($c) use ($id) {
        return ($c['id'] ?? '') !== $id;
    }));
    $db['categories'] = $categories;
    saveDatabase($db);
    echo json_encode(['success' => true, 'message' => 'Category deleted']);
    exit;
}

$body = getRequestBody();
$targetId = $id ?: ($body['id'] ?? '');

if ($method === 'PUT' || ($method === 'POST' && ($targetId || ($_GET['action'] ?? '') === 'update' || ($_POST['_method'] ?? '') === 'PUT'))) {
    for ($i = 0; $i < count($categories); $i++) {
        if ($categories[$i]['id'] === $targetId) {
            $categories[$i] = array_merge($categories[$i], $body);
            $categories[$i]['id'] = $targetId;
            $db['categories'] = $categories;
            saveDatabase($db);
            echo json_encode(['success' => true, 'category' => $categories[$i]]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Category not found']);
    exit;
}

if ($method === 'POST') {
    $newCat = [
        'id' => $body['id'] ?? ('cat_' . time() . '_' . substr(md5(uniqid()), 0, 4)),
        'name' => $body['name'] ?? 'New Category',
        'slug' => $body['slug'] ?? strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $body['name'] ?? 'cat')),
        'tagline' => $body['tagline'] ?? '',
        'description' => $body['description'] ?? '',
        'badge' => $body['badge'] ?? 'Delicacy',
        'image' => $body['image'] ?? '',
        'iconName' => $body['iconName'] ?? 'Sparkles',
        'items' => $body['items'] ?? [],
        'sampleProducts' => $body['sampleProducts'] ?? [],
        'status' => $body['status'] ?? 'active',
        'sortOrder' => count($categories) + 1,
    ];
    $categories[] = $newCat;
    $db['categories'] = $categories;
    saveDatabase($db);
    echo json_encode(['success' => true, 'category' => $newCat]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
