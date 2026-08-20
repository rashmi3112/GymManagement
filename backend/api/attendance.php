<?php
// backend/api/attendance.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$parts = array_filter(explode('/', $pathInfo));
$action = current($parts); // today, checkin, or the attendance doc ID

try {
    if ($method === 'GET') {
        if ($action === 'today') {
            // Get all checkins for today
            $all = $db->getAll('attendance');
            $today = date('Y-m-d');
            
            // Filter locally by checkIn date starting with today's date
            $todayAttendance = [];
            foreach ($all as $att) {
                if (isset($att['checkIn']) && str_starts_with($att['checkIn'], $today)) {
                    $todayAttendance[] = $att;
                }
            }
            sendResponse($todayAttendance);
        } else {
            // Get all attendance logs
            $attendance = $db->getAll('attendance');
            sendResponse($attendance);
        }
    } 
    
    elseif ($method === 'POST' && $action === 'checkin') {
        $data = getRequestBody();
        if (empty($data['memberId']) || empty($data['name'])) {
            sendError('Member ID and Name are required for check-in');
        }

        // Set local checkIn ISO timestamp
        $data['checkIn'] = date('Y-m-d\TH:i:s\Z');
        $data['date'] = date('Y-m-d');
        $data['checkOut'] = null;

        $newCheckIn = $db->create('attendance', $data);
        sendResponse($newCheckIn, 201);
    } 
    
    elseif ($method === 'PUT') {
        // Path should match /attendance/{id}/checkout
        $id = $action;
        $subAction = next($parts);

        if (!$id || $subAction !== 'checkout') {
            sendError('Invalid check-out path structure');
        }

        $checkOutTime = date('Y-m-d\TH:i:s\Z');
        $updated = $db->update('attendance', $id, [
            'checkOut' => $checkOutTime
        ]);

        sendResponse($updated);
    } 
    
    else {
        sendError('Method or action not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
