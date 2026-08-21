<?php
// backend/index.php

// Setup basic request routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Ensure we have a clean path without trailing slash
$uri = trim($uri, '/');
$parts = explode('/', $uri);

// Expect the first segment to be 'api'
if (count($parts) < 2 || $parts[0] !== 'api') {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'API endpoint not specified or incorrect.'
    ]);
    exit;
}

$resource = $parts[1]; // members, plans, attendance, etc.
$id = $parts[2] ?? null;

// Map resources to API files
$routeMap = [
    'members' => 'api/members.php',
    'plans' => 'api/plans.php',
    'attendance' => 'api/attendance.php',
    'payments' => 'api/payments.php',
    'trainers' => 'api/trainers.php',
    'workouts' => 'api/workouts.php',
    'diet-plans' => 'api/diet.php',
    'notifications' => 'api/notifications.php',
    'settings' => 'api/settings.php',
    'dashboard' => 'api/dashboard.php',
];

if (!isset($routeMap[$resource])) {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => "Resource '{$resource}' not found"
    ]);
    exit;
}

// Setup PATH_INFO for the targeted API script so it can read IDs/sub-actions
$subPath = implode('/', array_slice($parts, 2));
$_SERVER['PATH_INFO'] = '/' . $subPath;

// Route request to the correct script file inside a try/catch to return JSON on errors
try {
    require_once __DIR__ . '/' . $routeMap[$resource];
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
    exit;
}
