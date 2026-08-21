<?php
// backend/api/plans.php
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
            $plan = $db->get('plans', $id);
            sendResponse($plan);
        } else {
            $plans = $db->getAll('plans');
            sendResponse($plans);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['name']) || empty($data['price']) || empty($data['duration'])) {
            sendError('Plan name, price, and duration are required');
        }
        $newPlan = $db->create('plans', $data);
        sendResponse($newPlan, 201);
    } 
    
    elseif ($method === 'PUT') {
        if (!$id) {
            sendError('Plan ID is required');
        }
        $data = getRequestBody();
        $updated = $db->update('plans', $id, $data);
        sendResponse($updated);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Plan ID is required');
        }
        $db->delete('plans', $id);
        sendResponse(['status' => 'success', 'message' => 'Plan deleted successfully']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
