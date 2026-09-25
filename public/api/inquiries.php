<?php
/**
 * RevEg Fresh Foods - Inquiries CRM API for Apache PHP Hosting
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$baseDir = dirname(__DIR__);
$dataDir = $baseDir . DIRECTORY_SEPARATOR . 'data';
$inquiriesFile = $dataDir . DIRECTORY_SEPARATOR . 'inquiries.json';

if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$inquiries = [];
if (file_exists($inquiriesFile)) {
    $content = @file_get_contents($inquiriesFile);
    if ($content) {
        $inquiries = @json_decode($content, true) ?: [];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['success' => true, 'inquiries' => $inquiries]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = @json_decode($rawInput, true) ?: $_POST;

    $customerName = trim($data['customerName'] ?? $data['name'] ?? '');
    $phone = trim($data['phone'] ?? $data['mobileNumber'] ?? '');
    $message = trim($data['message'] ?? $data['customRequirement'] ?? '');

    if (empty($customerName) || empty($phone)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Customer name and phone number are required.']);
        exit;
    }

    $inquiryId = $data['inquiryId'] ?? ('INQ-' . date('Y') . '-' . rand(10000, 99999));
    $newRecord = [
        'id' => $data['id'] ?? ('inq_' . time() . '_' . substr(md5(uniqid()), 0, 5)),
        'inquiryId' => $inquiryId,
        'customerName' => $customerName,
        'phone' => $phone,
        'email' => trim($data['email'] ?? ''),
        'product' => trim($data['product'] ?? $data['inquiryOption'] ?? 'Festive Delicacy'),
        'quantity' => trim($data['quantity'] ?? '1 kg'),
        'message' => $message,
        'source' => trim($data['source'] ?? 'Website Inquiry Form'),
        'status' => 'new',
        'createdAt' => date('c'),
        'updatedAt' => date('c'),
    ];

    array_unshift($inquiries, $newRecord);
    file_put_contents($inquiriesFile, json_encode($inquiries, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    echo json_encode([
        'success' => true,
        'message' => 'Inquiry registered successfully.',
        'inquiry' => $newRecord
    ]);
    exit;
}
