<?php
/**
 * RevEg Fresh Foods - Master API Router for Apache PHP Hosting
 * Dispatches requests to the appropriate PHP endpoint script.
 */

$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH);

// Extract the subpath after /api/
$subpath = '';
if (preg_match('#/api(?:/index\.php)?/(.*)$#i', $path, $matches)) {
    $subpath = $matches[1];
} elseif (preg_match('#/api$#i', $path)) {
    $subpath = '';
}

$segments = explode('/', trim($subpath, '/'));
$endpoint = strtolower($segments[0] ?? '');

// If endpoint ends in .php, strip it
if (substr($endpoint, -4) === '.php') {
    $endpoint = substr($endpoint, 0, -4);
}

// Pass remaining segments to PATH_INFO or GET
if (count($segments) > 1) {
    $_GET['id'] = $segments[1];
    $_SERVER['PATH_INFO'] = '/' . implode('/', array_slice($segments, 1));
}
if (count($segments) > 2) {
    if ($segments[2] === 'status') {
        $_GET['action'] = 'status';
    }
}

// Route mapping
$routes = [
    'public-content' => 'public-content.php',
    'hero' => 'hero.php',
    'upload-hero' => 'upload-hero.php',
    'upload-product' => 'upload-product.php',
    'upload' => 'upload-product.php',
    'products' => 'products.php',
    'categories' => 'categories.php',
    'gallery' => 'gallery.php',
    'testimonials' => 'testimonials.php',
    'inquiries' => 'inquiries.php',
    'enquiries' => 'inquiries.php',
    'stats' => 'stats.php',
    'settings' => 'settings.php',
    'theme' => 'theme.php',
    'seo' => 'seo.php',
    'sections' => 'sections.php',
    'about' => 'about.php',
    'navigation' => 'navigation.php',
    'footer' => 'footer.php',
    'media' => 'media.php',
    'auth' => 'auth.php',
];

if (isset($routes[$endpoint])) {
    require __DIR__ . '/' . $routes[$endpoint];
    exit;
}

// Default fallback
header('Content-Type: application/json; charset=UTF-8');
echo json_encode([
    'status' => 'RevEg Fresh Foods PHP API Active',
    'version' => '2.5.0',
    'endpoints' => array_keys($routes),
], JSON_PRETTY_PRINT);
