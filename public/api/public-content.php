<?php
/**
 * RevEg Fresh Foods - Public Content Endpoint for Apache PHP Hosting
 * Serves site settings, products, categories, dynamic hero, and sections from data/db.json
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$dbJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'db.json';
$heroJsonPath = $dataDir . DIRECTORY_SEPARATOR . 'hero.json';

$data = [];
if (file_exists($dbJsonPath)) {
    $content = @file_get_contents($dbJsonPath);
    if ($content) {
        $data = @json_decode($content, true);
    }
}

// Merge latest dynamic hero data if available
if (file_exists($heroJsonPath)) {
    $heroContent = @file_get_contents($heroJsonPath);
    if ($heroContent) {
        $heroData = @json_decode($heroContent, true);
        if (is_array($heroData)) {
            $data['hero'] = array_merge(isset($data['hero']) && is_array($data['hero']) ? $data['hero'] : [], $heroData);
        }
    }
}

// Remove sensitive admin users and sessions
unset($data['users']);
unset($data['sessions']);

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
