<?php
// backend/api/diet.php
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
            $diet = $db->get('diet_plans', $id);
            sendResponse($diet);
        } else {
            $diets = $db->getAll('diet_plans');
            sendResponse($diets);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['memberId']) || empty($data['planName'])) {
            sendError('Member ID and diet program title are required');
        }
        $data['createdAt'] = date('Y-m-d\TH:i:s\Z');
        $newDiet = $db->create('diet_plans', $data);
        sendResponse($newDiet, 201);
    } 
    
    elseif ($method === 'PUT') {
        if (!$id) {
            sendError('Diet plan ID is required');
        }
        $data = getRequestBody();
        $updated = $db->update('diet_plans', $id, $data);
        sendResponse($updated);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Diet plan ID is required');
        }
        $db->delete('diet_plans', $id);
        sendResponse(['status' => 'success', 'message' => 'Diet plan deleted successfully']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
