<?php
/**
 * RevEg Fresh Foods - Testimonials API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$db = getDatabase();
$testimonials = isset($db['testimonials']) && is_array($db['testimonials']) ? $db['testimonials'] : [];

$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $id = $parts[0];
}

if ($method === 'GET') {
    echo json_encode($testimonials, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

requireAdminAuth();

if ($method === 'DELETE' || ($method === 'POST' && (($_GET['action'] ?? '') === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }
    $testimonials = array_values(array_filter($testimonials, function($t) use ($id) {
        return ($t['id'] ?? '') !== $id;
    }));
    $db['testimonials'] = $testimonials;
    saveDatabase($db);
    echo json_encode(['success' => true, 'message' => 'Testimonial deleted']);
    exit;
}

$body = getRequestBody();
$targetId = $id ?: ($body['id'] ?? '');

if ($method === 'PUT' || ($method === 'POST' && ($targetId || ($_GET['action'] ?? '') === 'update' || ($_POST['_method'] ?? '') === 'PUT'))) {
    for ($i = 0; $i < count($testimonials); $i++) {
        if ($testimonials[$i]['id'] === $targetId) {
            $testimonials[$i] = array_merge($testimonials[$i], $body);
            $testimonials[$i]['id'] = $targetId;
            $db['testimonials'] = $testimonials;
            saveDatabase($db);
            echo json_encode(['success' => true, 'testimonial' => $testimonials[$i]]);
            exit;
        }
    }
    http_response_code(404);
    echo json_encode(['error' => 'Testimonial not found']);
    exit;
}

if ($method === 'POST') {
    $newTestimonial = [
        'id' => $body['id'] ?? ('test_' . time() . '_' . substr(md5(uniqid()), 0, 4)),
        'name' => $body['name'] ?? 'Customer Name',
        'designation' => $body['designation'] ?? 'Valued Customer',
        'location' => $body['location'] ?? 'Maharashtra',
        'avatar' => $body['avatar'] ?? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        'rating' => intval($body['rating'] ?? 5),
        'comment' => $body['comment'] ?? '',
        'event' => $body['event'] ?? 'Festive Sweets Order',
        'isApproved' => $body['isApproved'] ?? true,
        'sortOrder' => count($testimonials) + 1,
        'createdAt' => date('c'),
    ];
    $testimonials[] = $newTestimonial;
    $db['testimonials'] = $testimonials;
    saveDatabase($db);
    echo json_encode(['success' => true, 'testimonial' => $newTestimonial]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
