<?php
// backend/api/workouts.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$id = !empty($pathInfo) ? basename($pathInfo) : null;

try {
    if ($method === 'GET') {
        if ($id) {
            $workout = $db->get('workouts', $id);
            sendResponse($workout);
        } else {
            $workouts = $db->getAll('workouts');
            sendResponse($workouts);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['memberId']) || empty($data['planName'])) {
            sendError('Member ID and routine title are required');
        }
        $data['createdAt'] = date('Y-m-d\TH:i:s\Z');
        $newWorkout = $db->create('workouts', $data);
        sendResponse($newWorkout, 201);
    } 
    
    elseif ($method === 'PUT') {
        if (!$id) {
            sendError('Workout ID is required');
        }
        $data = getRequestBody();
        $updated = $db->update('workouts', $id, $data);
        sendResponse($updated);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Workout ID is required');
        }
        $db->delete('workouts', $id);
        sendResponse(['status' => 'success', 'message' => 'Workout routine deleted']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
