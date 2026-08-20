<?php
// backend/index.php

// Setup basic request routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = str_replace('/backend/index.php', '', $uri); // Clean up subfolders if run in subdirectory
$uri = trim($uri, '/');

$parts = explode('/', $uri);

// We expect path to start with api/
if (count($parts) < 2 || $parts[0] !== 'api') {
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'API endpoint not found. Path must begin with /api/'
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

// Route request to the correct script file
require_once __DIR__ . '/' . $routeMap[$resource];
