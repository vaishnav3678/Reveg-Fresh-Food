<?php
/**
 * RevEg Fresh Foods - Dynamic Hero Image Upload Handler
 * Compatible with FileZilla / Apache / cPanel / Hostinger PHP Hosting
 * Supports: JPG, JPEG, PNG, WEBP formats with security validation
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. Use POST.']);
    exit;
}

// 1. Locate upload folder relative to script
// In deployment, script is in /api/, uploads is in /uploads/hero/
$baseDir = dirname(__DIR__); // public_html or site root
$uploadDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'hero';

if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to create uploads/hero directory on server.']);
        exit;
    }
}

// 2. Locate data directory for persistence
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}
$heroJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'hero.json';

// 3. Check uploaded file field (accepts 'hero_image', 'image', or 'file')
$fileField = null;
if (isset($_FILES['hero_image'])) {
    $fileField = $_FILES['hero_image'];
} elseif (isset($_FILES['image'])) {
    $fileField = $_FILES['image'];
} elseif (isset($_FILES['file'])) {
    $fileField = $_FILES['file'];
}

if (!$fileField || empty($fileField['tmp_name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No image file uploaded. Please select an image.']);
    exit;
}

// 4. Check upload error code
if ($fileField['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE   => 'Uploaded file exceeds upload_max_filesize in php.ini.',
        UPLOAD_ERR_FORM_SIZE  => 'Uploaded file exceeds MAX_FILE_SIZE specified in form.',
        UPLOAD_ERR_PARTIAL    => 'Uploaded file was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder on server.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
    ];
    $msg = isset($errors[$fileField['error']]) ? $errors[$fileField['error']] : 'Upload error code: ' . $fileField['error'];
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $msg]);
    exit;
}

// 5. File size check (Max 10MB)
$maxSizeBytes = 10 * 1024 * 1024;
if ($fileField['size'] > $maxSizeBytes) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Image size exceeds maximum limit of 10MB.']);
    exit;
}

// 6. File extension check (JPG, JPEG, PNG, WEBP only)
$originalName = basename($fileField['name']);
$extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($extension, $allowedExtensions, true)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid file format .' . htmlspecialchars($extension) . '. Only JPG, JPEG, PNG, and WEBP formats are supported.'
    ]);
    exit;
}

// 7. MIME type check using finfo or mime_content_type
$tmpPath = $fileField['tmp_name'];
$allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/webp'];
$detectedMime = null;

if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $detectedMime = $finfo->file($tmpPath);
} elseif (function_exists('mime_content_type')) {
    $detectedMime = mime_content_type($tmpPath);
}

if ($detectedMime && !in_array($detectedMime, $allowedMimes, true)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'File validation failed: Detected MIME type (' . htmlspecialchars($detectedMime) . ') is not an allowed image format.'
    ]);
    exit;
}

// 8. Image content verification (prevent disguised executable files)
$imageInfo = @getimagesize($tmpPath);
if ($imageInfo === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Uploaded file is corrupt or not a valid image.']);
    exit;
}

$imageWidth = $imageInfo[0];
$imageHeight = $imageInfo[1];

// 9. Generate secure sanitized unique filename
// Avoid special characters, script tags, and path traversal
$uniqueSuffix = date('Ymd_His') . '_' . bin2hex(random_bytes(4));
$newFilename = 'hero_' . $uniqueSuffix . '.' . $extension;
$destinationPath = $uploadDir . DIRECTORY_SEPARATOR . $newFilename;

// 10. Move uploaded file
if (!move_uploaded_file($tmpPath, $destinationPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file to uploads/hero directory. Check folder permissions.']);
    exit;
}

chmod($destinationPath, 0644);

// 11. Relative URL for portable hosting (works in root or /site2/ subfolder)
$relativeUrl = 'uploads/hero/' . $newFilename;

// 12. Persist to data/hero.json
$currentHero = [];
if (file_exists($heroJsonPath)) {
    $jsonContent = @file_get_contents($heroJsonPath);
    if ($jsonContent) {
        $decoded = @json_decode($jsonContent, true);
        if (is_array($decoded)) {
            $currentHero = $decoded;
        }
    }
}

// Retain previous fields and update heroImage
$currentHero['heroImage'] = $relativeUrl;
$currentHero['imageUrl'] = $relativeUrl; // Support both naming styles
$currentHero['updatedAt'] = date('c');
$currentHero['imageWidth'] = $imageWidth;
$currentHero['imageHeight'] = $imageHeight;
$currentHero['imageSize'] = $fileField['size'];

@file_put_contents($heroJsonPath, json_encode($currentHero, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

// 13. Also update data/db.json if it exists
$dbJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'db.json';
if (file_exists($dbJsonPath)) {
    $dbContent = @file_get_contents($dbJsonPath);
    if ($dbContent) {
        $dbData = @json_decode($dbContent, true);
        if (is_array($dbData)) {
            if (!isset($dbData['hero']) || !is_array($dbData['hero'])) {
                $dbData['hero'] = [];
            }
            $dbData['hero']['heroImage'] = $relativeUrl;
            $dbData['hero']['imageUrl'] = $relativeUrl;
            $dbData['hero']['updatedAt'] = date('c');
            @file_put_contents($dbJsonPath, json_encode($dbData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }
    }
}

// 14. Return success response
echo json_encode([
    'success' => true,
    'message' => 'Hero image uploaded and updated successfully.',
    'url' => $relativeUrl,
    'filename' => $newFilename,
    'width' => $imageWidth,
    'height' => $imageHeight,
    'size' => $fileField['size'],
    'mime' => $detectedMime ?: ('image/' . $extension),
    'hero' => $currentHero,
]);
