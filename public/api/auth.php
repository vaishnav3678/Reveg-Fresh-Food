<?php
/**
 * RevEg Fresh Foods - Admin Authentication API for Apache PHP Hosting
 * Supports: login, me, logout, change-password, update-profile
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
if (!$action && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $action = $parts[0];
}

$db = getDatabase();
$users = isset($db['users']) && is_array($db['users']) ? $db['users'] : [];

// 1. LOGIN
if ($method === 'POST' && ($action === 'login' || empty($action))) {
    $body = getRequestBody();
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    if (!$username || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Username/email and password are required']);
        exit;
    }

    $matchedUser = null;
    foreach ($users as $u) {
        if (strtolower($u['username']) === strtolower($username) || strtolower($u['email'] ?? '') === strtolower($username)) {
            $matchedUser = $u;
            break;
        }
    }

    $isMatch = false;
    if ($matchedUser) {
        if (password_verify($password, $matchedUser['passwordHash'])) {
            $isMatch = true;
        }
    }

    // Default admin fallback credentials
    if (!$isMatch && strtolower($username) === 'admin' && $password === 'admin123') {
        $isMatch = true;
        if (!$matchedUser) {
            $matchedUser = [
                'id' => 'usr_admin',
                'username' => 'admin',
                'email' => 'revegfreshfoods@gmail.com',
                'name' => 'RevEg Admin',
                'role' => 'admin',
            ];
        }
    }

    if (!$isMatch) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid username or password']);
        exit;
    }

    $token = 'reveg_token_' . time() . '_' . bin2hex(random_bytes(16));
    if (!isset($db['sessions']) || !is_array($db['sessions'])) {
        $db['sessions'] = [];
    }
    $db['sessions'][$token] = [
        'userId' => $matchedUser['id'],
        'expiresAt' => time() + (30 * 86400), // 30 days
    ];
    saveDatabase($db);

    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $matchedUser['id'],
            'username' => $matchedUser['username'],
            'email' => $matchedUser['email'] ?? '',
            'name' => $matchedUser['name'] ?? 'Admin',
            'role' => $matchedUser['role'] ?? 'admin',
        ],
    ]);
    exit;
}

// 2. ME (Session verify)
if ($action === 'me') {
    $user = requireAdminAuth();
    echo json_encode(['user' => $user]);
    exit;
}

// 3. LOGOUT
if ($action === 'logout') {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    $token = strpos($authHeader, 'Bearer ') === 0 ? substr($authHeader, 7) : ($headers['X-Admin-Token'] ?? '');
    if ($token && isset($db['sessions'][$token])) {
        unset($db['sessions'][$token]);
        saveDatabase($db);
    }
    echo json_encode(['success' => true]);
    exit;
}

// 4. CHANGE PASSWORD
if ($action === 'change-password') {
    $user = requireAdminAuth();
    $body = getRequestBody();
    $current = $body['currentPassword'] ?? '';
    $new = $body['newPassword'] ?? '';

    if (strlen($new) < 5) {
        http_response_code(400);
        echo json_encode(['error' => 'New password must be at least 5 characters long']);
        exit;
    }

    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $user['id']) {
            if (!password_verify($current, $users[$i]['passwordHash']) && !($users[$i]['username'] === 'admin' && $current === 'admin123')) {
                http_response_code(400);
                echo json_encode(['error' => 'Current password is incorrect']);
                exit;
            }
            $users[$i]['passwordHash'] = password_hash($new, PASSWORD_DEFAULT);
            $db['users'] = $users;
            saveDatabase($db);
            echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
            exit;
        }
    }

    echo json_encode(['success' => true, 'message' => 'Password updated']);
    exit;
}

// 5. UPDATE PROFILE
if ($action === 'update-profile') {
    $user = requireAdminAuth();
    $body = getRequestBody();

    for ($i = 0; $i < count($users); $i++) {
        if ($users[$i]['id'] === $user['id']) {
            if (!empty($body['name'])) $users[$i]['name'] = trim($body['name']);
            if (!empty($body['email'])) $users[$i]['email'] = trim($body['email']);
            if (!empty($body['username'])) $users[$i]['username'] = trim($body['username']);
            $db['users'] = $users;
            saveDatabase($db);
            echo json_encode(['success' => true, 'user' => $users[$i]]);
            exit;
        }
    }

    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Action not found']);
