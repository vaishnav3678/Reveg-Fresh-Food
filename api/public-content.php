<?php
/**
 * RevEg Fresh Foods - Public Content Endpoint for Apache PHP Hosting
 * Serves site settings, products, categories, dynamic hero, and sections from data/db.json
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$paths = getSitePaths();
$data = readJsonFile($paths['dbJsonPath'], []);

// Merge latest dynamic hero data if available
$heroData = readJsonFile($paths['heroJsonPath'], null);
if ($heroData && is_array($heroData)) {
    $data['hero'] = array_merge(isset($data['hero']) && is_array($data['hero']) ? $data['hero'] : [], $heroData);
}

// Format public response
$response = [
    'settings' => $data['settings'] ?? null,
    'theme' => $data['theme'] ?? null,
    'seo' => $data['seo'] ?? null,
    'sections' => isset($data['sections']) && is_array($data['sections'])
        ? array_values(array_filter($data['sections'], function($s) { return !empty($s['enabled']); }))
        : [],
    'hero' => $data['hero'] ?? null,
    'about' => $data['about'] ?? null,
    'products' => isset($data['products']) && is_array($data['products'])
        ? array_values(array_filter($data['products'], function($p) { return ($p['status'] ?? 'active') === 'active'; }))
        : [],
    'categories' => isset($data['categories']) && is_array($data['categories'])
        ? array_values(array_filter($data['categories'], function($c) { return ($c['status'] ?? 'active') === 'active'; }))
        : [],
    'gallery' => isset($data['gallery']) && is_array($data['gallery'])
        ? array_values(array_filter($data['gallery'], function($g) { return !empty($g['isEnabled']); }))
        : [],
    'testimonials' => isset($data['testimonials']) && is_array($data['testimonials'])
        ? array_values(array_filter($data['testimonials'], function($t) { return !empty($t['isApproved']); }))
        : [],
    'navigation' => $data['navigation'] ?? null,
    'footer' => $data['footer'] ?? null,
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
