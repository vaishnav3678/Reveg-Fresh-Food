<?php
/**
 * RevEg Fresh Foods - Hero Banner Configuration & Image API
 * Compatible with FileZilla / Apache PHP hosting
 * Supports GET (fetch), POST/PUT (update), and DELETE (delete/reset image)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$uploadHeroDir = $baseDir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'hero';
$heroJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'hero.json';
$dbJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'db.json';

// Default authentic fallback hero settings
$defaultHero = [
    'badge' => '100% Vegetarian • Pure Desi Ghee & Fresh Ingredients',
    'heading' => 'Authentic Taste of Tradition, Freshness You Can Trust',
    'highlightWord' => 'Tradition',
    'description' => 'Handcrafted traditional Indian sweets, festive faral delicacies, and savory namkeen made with heirloom recipes, pure ingredients, and zero compromise on hygiene.',
    'primaryCtaText' => 'Order on WhatsApp',
    'primaryCtaLink' => '#contact',
    'secondaryCtaText' => 'Diwali Faral Specials',
    'secondaryCtaLink' => '#festive-specials',
    'heroImage' => 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&auto=format&fit=crop&q=80',
    'experienceYears' => 'Heritage Taste',
    'purityGuarantee' => '100% Pure & Fresh',
];

function loadHeroConfig($heroJsonPath, $dbJsonPath, $defaultHero) {
    if (file_exists($heroJsonPath)) {
        $content = @file_get_contents($heroJsonPath);
        if ($content) {
            $decoded = @json_decode($content, true);
            if (is_array($decoded) && !empty($decoded)) {
                return array_merge($defaultHero, $decoded);
            }
        }
    }
    if (file_exists($dbJsonPath)) {
        $content = @file_get_contents($dbJsonPath);
        if ($content) {
            $decoded = @json_decode($content, true);
            if (is_array($decoded) && isset($decoded['hero']) && is_array($decoded['hero'])) {
                return array_merge($defaultHero, $decoded['hero']);
            }
        }
    }
    return $defaultHero;
}

function saveHeroConfig($heroJsonPath, $dbJsonPath, $heroData) {
    if (!file_exists(dirname($heroJsonPath))) {
        @mkdir(dirname($heroJsonPath), 0755, true);
    }
    @file_put_contents($heroJsonPath, json_encode($heroData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    if (file_exists($dbJsonPath)) {
        $content = @file_get_contents($dbJsonPath);
        if ($content) {
            $db = @json_decode($content, true);
            if (is_array($db)) {
                $db['hero'] = $heroData;
                @file_put_contents($dbJsonPath, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            }
        }
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. GET Request: Return current hero configuration
if ($method === 'GET') {
    $hero = loadHeroConfig($heroJsonPath, $dbJsonPath, $defaultHero);
    echo json_encode([
        'success' => true,
        'hero' => $hero,
        'heroImage' => isset($hero['heroImage']) ? $hero['heroImage'] : $defaultHero['heroImage'],
    ]);
    exit;
}

// 2. DELETE Request (or POST with action=delete): Delete current uploaded hero image
if ($method === 'DELETE' || ($method === 'POST' && ($action === 'delete' || isset($_POST['_method']) && strtoupper($_POST['_method']) === 'DELETE'))) {
    $hero = loadHeroConfig($heroJsonPath, $dbJsonPath, $defaultHero);
    $currentImage = isset($hero['heroImage']) ? $hero['heroImage'] : '';

    // If current image is in uploads/hero, physically delete it from server
    if ($currentImage && strpos($currentImage, 'uploads/hero/') !== false) {
        $filename = basename($currentImage);
        $fullPath = $uploadHeroDir . DIRECTORY_SEPARATOR . $filename;
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    // Reset hero image to authentic default
    $hero['heroImage'] = $defaultHero['heroImage'];
    $hero['imageUrl'] = $defaultHero['heroImage'];
    $hero['updatedAt'] = date('c');

    saveHeroConfig($heroJsonPath, $dbJsonPath, $hero);

    echo json_encode([
        'success' => true,
        'message' => 'Hero image deleted and reset to default heritage visual.',
        'hero' => $hero,
        'heroImage' => $hero['heroImage'],
    ]);
    exit;
}

// 3. POST / PUT Request: Update hero configuration
if ($method === 'POST' || $method === 'PUT') {
    $rawInput = file_get_contents('php://input');
    $data = @json_decode($rawInput, true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    $currentHero = loadHeroConfig($heroJsonPath, $dbJsonPath, $defaultHero);
    $updatedHero = array_merge($currentHero, $data);
    $updatedHero['updatedAt'] = date('c');

    // Ensure heroImage and imageUrl are synced
    if (isset($updatedHero['imageUrl']) && !isset($data['heroImage'])) {
        $updatedHero['heroImage'] = $updatedHero['imageUrl'];
    } elseif (isset($updatedHero['heroImage'])) {
        $updatedHero['imageUrl'] = $updatedHero['heroImage'];
    }

    saveHeroConfig($heroJsonPath, $dbJsonPath, $updatedHero);

    echo json_encode([
        'success' => true,
        'message' => 'Hero banner settings updated successfully.',
        'hero' => $updatedHero,
        'heroImage' => $updatedHero['heroImage'],
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
