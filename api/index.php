<?php
// api/index.php — works on shared hosting (InfinityFree, 000webhost) and localhost

// ── CORS (handle before anything else) ──────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Route parsing ────────────────────────────────────────────────────────────
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri  = trim($uri, '/');
$parts = array_values(array_filter(explode('/', $uri)));

// Strip leading 'api' segment if present (local dev: /api/plans, shared host: /plans)
if (count($parts) > 0 && $parts[0] === 'api') {
    array_shift($parts);
}

if (empty($parts)) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'API endpoint not specified.']);
    exit;
}

$resource = $parts[0]; // members, plans, attendance, etc.

// Map resources to API files
$routeMap = [
    'members'       => 'api/members.php',
    'plans'         => 'api/plans.php',
    'attendance'    => 'api/attendance.php',
    'payments'      => 'api/payments.php',
    'trainers'      => 'api/trainers.php',
    'workouts'      => 'api/workouts.php',
    'diet-plans'    => 'api/diet.php',
    'notifications' => 'api/notifications.php',
    'settings'      => 'api/settings.php',
    'dashboard'     => 'api/dashboard.php',
];

if (!isset($routeMap[$resource])) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => "Resource '{$resource}' not found"]);
    exit;
}

// Pass sub-path (IDs, sub-actions) via PATH_INFO so endpoint scripts can read them
$subPath = implode('/', array_slice($parts, 1));
$_SERVER['PATH_INFO'] = '/' . $subPath;

// Dispatch
try {
    require_once __DIR__ . '/' . $routeMap[$resource];
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage(),
    ]);
    exit;
}
