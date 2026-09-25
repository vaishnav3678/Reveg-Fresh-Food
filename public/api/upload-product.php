<?php
/**
 * RevEg Fresh Foods - Product and Media Image Upload API
 * Handles JPG, JPEG, PNG, WEBP, and GIF uploads up to 10MB
 * Compatible with FileZilla Apache PHP hosting.
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

$paths = getSitePaths();
$targetSubfolder = $_POST['type'] ?? $_GET['type'] ?? 'products';
$destDir = $paths['uploadsDir'] . DIRECTORY_SEPARATOR . ($targetSubfolder === 'hero' ? 'hero' : 'products');

if (!file_exists($destDir)) {
    @mkdir($destDir, 0755, true);
}

$fileField = $_FILES['image'] ?? $_FILES['product_image'] ?? $_FILES['file'] ?? $_FILES['hero_image'] ?? null;

if (!$fileField || empty($fileField['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image file uploaded.']);
    exit;
}

if ($fileField['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Upload error code: ' . $fileField['error']]);
    exit;
}

$maxSizeBytes = 10 * 1024 * 1024;
if ($fileField['size'] > $maxSizeBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Image size exceeds maximum limit of 10MB.']);
    exit;
}

$ext = strtolower(pathinfo($fileField['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
if (!in_array($ext, $allowed, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid file format. Supported formats: JPG, JPEG, PNG, WEBP.']);
    exit;
}

$prefix = $targetSubfolder === 'hero' ? 'hero_' : 'prod_';
$newFilename = $prefix . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
$destPath = $destDir . DIRECTORY_SEPARATOR . $newFilename;

if (!move_uploaded_file($fileField['tmp_name'], $destPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file. Check uploads directory permissions.']);
    exit;
}

@chmod($destPath, 0644);

$relativeUrl = 'uploads/' . ($targetSubfolder === 'hero' ? 'hero/' : 'products/') . $newFilename;

echo json_encode([
    'success' => true,
    'message' => 'Image uploaded successfully.',
    'url' => $relativeUrl,
    'filename' => $newFilename,
    'size' => $fileField['size'],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
