<?php
/**
 * RevEg Fresh Foods - Admin Dashboard Stats API for Apache PHP Hosting
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$db = getDatabase();
$products = $db['products'] ?? [];
$categories = $db['categories'] ?? [];
$gallery = $db['gallery'] ?? [];
$testimonials = $db['testimonials'] ?? [];
$media = $db['media'] ?? [];
$sections = $db['sections'] ?? [];
$enquiries = $db['enquiries'] ?? [];

// Load inquiries from inquiries.json if db.json is missing them
$paths = getSitePaths();
$inquiriesJson = readJsonFile($paths['inquiriesJsonPath'], []);
if (!empty($inquiriesJson)) {
    $enquiries = $inquiriesJson;
}

$activeProducts = count(array_filter($products, function($p) { return ($p['status'] ?? 'active') === 'active'; }));
$unreadEnquiries = count(array_filter($enquiries, function($e) { return ($e['status'] ?? 'new') === 'new'; }));
$activeSections = count(array_filter($sections, function($s) { return !empty($s['enabled']); }));

$response = [
    'metrics' => [
        'totalProducts' => count($products),
        'activeProducts' => $activeProducts,
        'totalCategories' => count($categories),
        'totalGallery' => count($gallery),
        'totalTestimonials' => count($testimonials),
        'totalEnquiries' => count($enquiries),
        'unreadEnquiries' => $unreadEnquiries,
        'totalMedia' => count($media),
        'activeSections' => $activeSections,
    ],
    'recentEnquiries' => array_slice($enquiries, 0, 5),
    'recentProducts' => array_slice($products, 0, 5),
    'siteSettings' => $db['settings'] ?? null,
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
