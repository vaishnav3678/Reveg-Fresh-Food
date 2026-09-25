<?php
/**
 * RevEg Fresh Foods - Inquiries CRM API for Apache PHP Hosting
 * Handles public submissions and admin inquiry management (stats, search, filter, status, delete)
 */

require_once __DIR__ . '/db-helper.php';
sendCorsHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$paths = getSitePaths();
$inquiriesFile = $paths['inquiriesJsonPath'];
$db = getDatabase();

// Load inquiries from inquiries.json or db.json
$inquiries = readJsonFile($inquiriesFile, []);
if (empty($inquiries) && isset($db['enquiries']) && is_array($db['enquiries'])) {
    $inquiries = $db['enquiries'];
}

function saveAllInquiries($paths, &$db, $inquiries) {
    writeJsonFile($paths['inquiriesJsonPath'], $inquiries);
    $db['enquiries'] = $inquiries;
    saveDatabase($db);
}

// Compute inquiry stats helper
function computeStats($inquiries) {
    $now = time();
    $todayStart = strtotime('today midnight');
    $weekAgo = $now - (7 * 86400);
    $monthStart = strtotime('first day of this month midnight');

    $stats = [
        'total' => count($inquiries),
        'newCount' => 0,
        'pendingCount' => 0,
        'contactedCount' => 0,
        'completedCount' => 0,
        'cancelledCount' => 0,
        'todayCount' => 0,
        'thisWeekCount' => 0,
        'thisMonthCount' => 0,
    ];

    foreach ($inquiries as $inq) {
        $st = $inq['status'] ?? 'new';
        if ($st === 'new') $stats['newCount']++;
        elseif ($st === 'pending') $stats['pendingCount']++;
        elseif ($st === 'contacted') $stats['contactedCount']++;
        elseif ($st === 'completed') $stats['completedCount']++;
        elseif ($st === 'cancelled') $stats['cancelledCount']++;

        $createdTs = strtotime($inq['createdAt'] ?? '');
        if ($createdTs) {
            if ($createdTs >= $todayStart) $stats['todayCount']++;
            if ($createdTs >= $weekAgo) $stats['thisWeekCount']++;
            if ($createdTs >= $monthStart) $stats['thisMonthCount']++;
        }
    }

    return $stats;
}

$action = $_GET['action'] ?? '';
$id = $_GET['id'] ?? '';
if (!$id && isset($_SERVER['PATH_INFO'])) {
    $parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    if (!empty($parts[0])) $id = $parts[0];
    if (isset($parts[1]) && $parts[1] === 'status') $action = 'status';
}

// 1. GET Stats
if ($method === 'GET' && ($action === 'stats' || isset($_GET['stats']))) {
    echo json_encode(computeStats($inquiries), JSON_PRETTY_PRINT);
    exit;
}

// 2. GET Inquiries (List with filters)
if ($method === 'GET') {
    $status = $_GET['status'] ?? 'all';
    $search = strtolower(trim($_GET['search'] ?? ''));
    $fromDate = $_GET['fromDate'] ?? '';
    $toDate = $_GET['toDate'] ?? '';

    $filtered = $inquiries;

    if ($status && $status !== 'all') {
        $filtered = array_values(array_filter($filtered, function($i) use ($status) {
            return ($i['status'] ?? 'new') === $status;
        }));
    }

    if ($search) {
        $filtered = array_values(array_filter($filtered, function($i) use ($search) {
            $name = strtolower($i['customerName'] ?? '');
            $phone = strtolower($i['phone'] ?? '');
            $email = strtolower($i['email'] ?? '');
            $inqId = strtolower($i['inquiryId'] ?? '');
            $prod = strtolower($i['product'] ?? '');
            $msg = strtolower($i['message'] ?? '');
            return strpos($name, $search) !== false ||
                   strpos($phone, $search) !== false ||
                   strpos($email, $search) !== false ||
                   strpos($inqId, $search) !== false ||
                   strpos($prod, $search) !== false ||
                   strpos($msg, $search) !== false;
        }));
    }

    if ($fromDate) {
        $fromTs = strtotime($fromDate);
        $filtered = array_values(array_filter($filtered, function($i) use ($fromTs) {
            return strtotime($i['createdAt'] ?? '') >= $fromTs;
        }));
    }

    if ($toDate) {
        $toTs = strtotime($toDate) + 86400;
        $filtered = array_values(array_filter($filtered, function($i) use ($toTs) {
            return strtotime($i['createdAt'] ?? '') <= $toTs;
        }));
    }

    echo json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 3. DELETE Inquiry
if ($method === 'DELETE' || ($method === 'POST' && ($action === 'delete' || ($_POST['_method'] ?? '') === 'DELETE'))) {
    requireAdminAuth();
    if (!$id) {
        $input = getRequestBody();
        $id = $input['id'] ?? '';
    }

    $inquiries = array_values(array_filter($inquiries, function($i) use ($id) {
        return ($i['id'] ?? '') !== $id && ($i['inquiryId'] ?? '') !== $id;
    }));

    saveAllInquiries($paths, $db, $inquiries);
    echo json_encode(['success' => true, 'message' => 'Inquiry deleted successfully']);
    exit;
}

// 4. PATCH or POST update status
if ($method === 'PATCH' || ($method === 'POST' && ($action === 'status' || isset($_GET['status_update'])))) {
    requireAdminAuth();
    $input = getRequestBody();
    $targetId = $id ?: ($input['id'] ?? '');
    $newStatus = $input['status'] ?? $_GET['status'] ?? '';

    $valid = ['new', 'contacted', 'pending', 'completed', 'cancelled'];
    if (!in_array($newStatus, $valid, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status. Must be: ' . implode(', ', $valid)]);
        exit;
    }

    $found = false;
    for ($i = 0; $i < count($inquiries); $i++) {
        if (($inquiries[$i]['id'] ?? '') === $targetId || ($inquiries[$i]['inquiryId'] ?? '') === $targetId) {
            $inquiries[$i]['status'] = $newStatus;
            $inquiries[$i]['updatedAt'] = date('c');
            $found = $inquiries[$i];
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Inquiry not found']);
        exit;
    }

    saveAllInquiries($paths, $db, $inquiries);
    echo json_encode(['success' => true, 'inquiry' => $found]);
    exit;
}

// 5. POST: Public Customer Submission
if ($method === 'POST') {
    $data = getRequestBody();

    $customerName = trim($data['customerName'] ?? $data['name'] ?? '');
    $rawPhone = trim($data['phone'] ?? $data['mobileNumber'] ?? '');
    $cleanPhone = preg_replace('/[^0-9+]/', '', $rawPhone);
    $digitsOnly = preg_replace('/[^0-9]/', '', $cleanPhone);
    $email = trim($data['email'] ?? '');
    $message = trim($data['message'] ?? $data['customRequirement'] ?? '');
    $product = trim($data['product'] ?? $data['inquiryType'] ?? $data['inquiryOption'] ?? 'Festive Faral & Sweets Order');
    $quantity = trim($data['quantity'] ?? $data['packSize'] ?? '1 kg');
    $source = trim($data['source'] ?? 'Website Inquiry Form');

    if (empty($customerName) || strlen($customerName) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid customer name (at least 2 characters).']);
        exit;
    }

    if (strlen($digitsOnly) < 10) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid 10-digit mobile number.']);
        exit;
    }

    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid email format.']);
        exit;
    }

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'Please enter your message or inquiry requirements.']);
        exit;
    }

    $inquiryId = $data['inquiryId'] ?? ('INQ-' . date('Y') . '-' . rand(10000, 99999));
    $uniqueId = $data['id'] ?? ('inq_' . time() . '_' . substr(md5(uniqid()), 0, 5));
    $timestamp = date('c');

    $newRecord = [
        'id' => $uniqueId,
        'inquiryId' => $inquiryId,
        'customerName' => $customerName,
        'phone' => $cleanPhone,
        'email' => $email,
        'product' => $product,
        'quantity' => $quantity,
        'message' => $message,
        'source' => $source,
        'status' => 'new',
        'createdAt' => $timestamp,
        'updatedAt' => $timestamp,
    ];

    // Check if ID already exists (update or prepend)
    $existsIndex = -1;
    for ($i = 0; $i < count($inquiries); $i++) {
        if (($inquiries[$i]['id'] ?? '') === $uniqueId || ($inquiries[$i]['inquiryId'] ?? '') === $inquiryId) {
            $existsIndex = $i;
            break;
        }
    }

    if ($existsIndex >= 0) {
        $inquiries[$existsIndex] = array_merge($inquiries[$existsIndex], $newRecord);
    } else {
        array_unshift($inquiries, $newRecord);
    }

    saveAllInquiries($paths, $db, $inquiries);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Your inquiry has been successfully registered with RevEg Fresh Foods.',
        'inquiry' => $newRecord,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
