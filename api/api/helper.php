<?php
// backend/api/helper.php

// Setup CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode([
        'status' => 'error',
        'message' => $message
    ]);
    exit;
}

function getRequestBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}
