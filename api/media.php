<?php
/**
 * RevEg Fresh Foods - Media Library API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$paths = getSitePaths();
$db = getDatabase();
$media = isset($db['media']) && is_array($db['media']) ? $db['media'] : [];

$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $id = $parts[0];
}

requireAdminAuth();

if ($method === 'GET') {
    echo json_encode($media, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($method === 'DELETE' || ($method === 'POST' && (($_GET['action'] ?? '') === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }

    $deletedItem = null;
    $media = array_values(array_filter($media, function($m) use ($id, &$deletedItem) {
        if (($m['id'] ?? '') === $id) {
            $deletedItem = $m;
            return false;
        }
        return true;
    }));

    if ($deletedItem && !empty($deletedItem['url'])) {
        $rel = ltrim($deletedItem['url'], '/');
        $fullPath = $paths['baseDir'] . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $rel);
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    $db['media'] = $media;
    saveDatabase($db);
    echo json_encode(['success' => true, 'message' => 'Media item deleted']);
    exit;
}

// Multipart or Base64 Upload
if ($method === 'POST') {
    $fileField = $_FILES['image'] ?? $_FILES['file'] ?? null;
    $body = getRequestBody();

    if ($fileField && !empty($fileField['tmp_name']) && $fileField['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($fileField['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($ext, $allowed, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid file format']);
            exit;
        }

        $destDir = $paths['uploadsDir'];
        $newFilename = 'media_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
        $destPath = $destDir . DIRECTORY_SEPARATOR . $newFilename;

        if (move_uploaded_file($fileField['tmp_name'], $destPath)) {
            @chmod($destPath, 0644);
            $relUrl = 'uploads/' . $newFilename;
            $newItem = [
                'id' => 'med_' . time() . '_' . substr(md5(uniqid()), 0, 4),
                'name' => $body['name'] ?? $fileField['name'],
                'originalName' => $fileField['name'],
                'url' => $relUrl,
                'mimeType' => 'image/' . $ext,
                'size' => $fileField['size'],
                'uploadedAt' => date('c'),
            ];
            array_unshift($media, $newItem);
            $db['media'] = $media;
            saveDatabase($db);

            echo json_encode(['success' => true, 'media' => $newItem]);
            exit;
        }
    }

    // Base64 upload
    if (!empty($body['base64Data'])) {
        $base64 = $body['base64Data'];
        if (preg_match('/^data:(image\/[a-zA-Z]+);base64,(.+)$/', $base64, $matches)) {
            $mime = $matches[1];
            $ext = str_replace('image/', '', $mime);
            if ($ext === 'jpeg') $ext = 'jpg';
            $decoded = base64_decode($matches[2]);
            if ($decoded) {
                $newFilename = 'media_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
                $destPath = $paths['uploadsDir'] . DIRECTORY_SEPARATOR . $newFilename;
                file_put_contents($destPath, $decoded);
                @chmod($destPath, 0644);
                $relUrl = 'uploads/' . $newFilename;
                $newItem = [
                    'id' => 'med_' . time() . '_' . substr(md5(uniqid()), 0, 4),
                    'name' => $body['name'] ?? $newFilename,
                    'originalName' => $newFilename,
                    'url' => $relUrl,
                    'mimeType' => $mime,
                    'size' => strlen($decoded),
                    'uploadedAt' => date('c'),
                ];
                array_unshift($media, $newItem);
                $db['media'] = $media;
                saveDatabase($db);
                echo json_encode(['success' => true, 'media' => $newItem]);
                exit;
            }
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'No image file or valid base64 provided']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
