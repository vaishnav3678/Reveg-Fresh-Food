<?php
/**
 * RevEg Fresh Foods - Products API for Apache PHP Hosting
 * Handles GET (list), POST (create), PUT (update), DELETE (remove)
 * Compatible with FileZilla Apache PHP hosting and subfolder installations.
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$paths = getSitePaths();
$db = getDatabase();
$products = isset($db['products']) && is_array($db['products']) ? $db['products'] : [];

// Determine targeted ID from query, path info, or input
$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $pathParts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($pathParts[0])) {
        $id = $pathParts[0];
    }
}

// 1. GET: Return products
if ($method === 'GET') {
    if ($id) {
        foreach ($products as $p) {
            if ($p['id'] === $id) {
                echo json_encode($p, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
                exit;
            }
        }
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }
    echo json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Check admin authentication for modifications
requireAdminAuth();

// 2. DELETE: Remove product
if ($method === 'DELETE' || ($method === 'POST' && (($_GET['action'] ?? '') === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required for deletion']);
        exit;
    }

    $initialCount = count($products);
    $products = array_values(array_filter($products, function($p) use ($id) {
        return $p['id'] !== $id;
    }));

    if (count($products) === $initialCount) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit;
    }

    $db['products'] = $products;
    saveDatabase($db);

    echo json_encode(['success' => true, 'message' => 'Product deleted successfully', 'id' => $id]);
    exit;
}

// Handle file upload if present
$uploadedImageUrl = null;
$fileField = $_FILES['image'] ?? $_FILES['product_image'] ?? $_FILES['file'] ?? null;
if ($fileField && !empty($fileField['tmp_name']) && $fileField['error'] === UPLOAD_ERR_OK) {
    $ext = strtolower(pathinfo($fileField['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (in_array($ext, $allowed, true) && $fileField['size'] <= 10 * 1024 * 1024) {
        $newFilename = 'prod_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.' . $ext;
        $dest = $paths['productsUploadsDir'] . DIRECTORY_SEPARATOR . $newFilename;
        if (move_uploaded_file($fileField['tmp_name'], $dest)) {
            @chmod($dest, 0644);
            $uploadedImageUrl = 'uploads/products/' . $newFilename;
        }
    }
}

// 3. PUT or POST update: Update existing product
$body = getRequestBody();
$targetId = $id ?: ($body['id'] ?? '');

if (($method === 'PUT') || ($method === 'POST' && ($targetId || ($_GET['action'] ?? '') === 'update' || ($_POST['_method'] ?? '') === 'PUT'))) {
    if (!$targetId) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required']);
        exit;
    }

    $foundIndex = -1;
    for ($i = 0; $i < count($products); $i++) {
        if ($products[$i]['id'] === $targetId) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex === -1) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found with ID ' . $targetId]);
        exit;
    }

    $existing = $products[$foundIndex];
    $updated = array_merge($existing, $body);
    $updated['id'] = $targetId; // prevent ID mutation

    if ($uploadedImageUrl) {
        $updated['image'] = $uploadedImageUrl;
    }

    // Ensure array fields are arrays
    if (isset($updated['packSizes']) && is_string($updated['packSizes'])) {
        $updated['packSizes'] = array_map('trim', explode(',', $updated['packSizes']));
    }
    if (isset($updated['ingredientsHighlight']) && is_string($updated['ingredientsHighlight'])) {
        $updated['ingredientsHighlight'] = array_map('trim', explode(',', $updated['ingredientsHighlight']));
    }
    if (isset($updated['secondaryCategories']) && is_string($updated['secondaryCategories'])) {
        $updated['secondaryCategories'] = array_map('trim', explode(',', $updated['secondaryCategories']));
    }

    $products[$foundIndex] = $updated;
    $db['products'] = $products;
    saveDatabase($db);

    echo json_encode([
        'success' => true,
        'message' => 'Product updated successfully',
        'product' => $updated,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 4. POST: Create new product
if ($method === 'POST') {
    $name = trim($body['name'] ?? '');
    if (!$name) {
        http_response_code(400);
        echo json_encode(['error' => 'Product name is required']);
        exit;
    }

    $newId = $body['id'] ?? ('prod_' . time() . '_' . substr(md5(uniqid()), 0, 5));
    $image = $uploadedImageUrl ?: ($body['image'] ?? 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80');

    $packSizes = $body['packSizes'] ?? ['250g', '500g', '1 kg'];
    if (is_string($packSizes)) {
        $packSizes = array_map('trim', explode(',', $packSizes));
    }

    $ingredients = $body['ingredientsHighlight'] ?? [];
    if (is_string($ingredients)) {
        $ingredients = array_map('trim', explode(',', $ingredients));
    }

    $secondary = $body['secondaryCategories'] ?? [];
    if (is_string($secondary)) {
        $secondary = array_map('trim', explode(',', $secondary));
    }

    $newProduct = [
        'id' => $newId,
        'name' => $name,
        'category' => $body['category'] ?? 'sweets',
        'secondaryCategories' => $secondary,
        'description' => $body['description'] ?? '',
        'detailedDescription' => $body['detailedDescription'] ?? '',
        'image' => $image,
        'isPopular' => !empty($body['isPopular']),
        'isFestiveSpecial' => !empty($body['isFestiveSpecial']),
        'packSizes' => $packSizes,
        'tasteProfile' => $body['tasteProfile'] ?? '',
        'ingredientsHighlight' => $ingredients,
        'texture' => $body['texture'] ?? '',
        'price' => $body['price'] ?? '',
        'discountPrice' => $body['discountPrice'] ?? '',
        'quantity' => $body['quantity'] ?? 'In Stock (Fresh Batches Daily)',
        'priceGuide' => $body['priceGuide'] ?? '',
        'status' => $body['status'] ?? 'active',
        'sortOrder' => count($products) + 1,
    ];

    $products[] = $newProduct;
    $db['products'] = $products;
    saveDatabase($db);

    echo json_encode([
        'success' => true,
        'message' => 'Product added successfully',
        'product' => $newProduct,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
