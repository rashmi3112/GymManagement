<?php
// backend/api/trainers.php
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
            $trainer = $db->get('trainers', $id);
            sendResponse($trainer);
        } else {
            $trainers = $db->getAll('trainers');
            sendResponse($trainers);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['name']) || empty($data['email'])) {
            sendError('Trainer name and email are required');
        }
        $newTrainer = $db->create('trainers', $data);
        sendResponse($newTrainer, 201);
    } 
    
    elseif ($method === 'PUT') {
        if (!$id) {
            sendError('Trainer ID is required');
        }
        $data = getRequestBody();
        $updated = $db->update('trainers', $id, $data);
        sendResponse($updated);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Trainer ID is required');
        }
        $db->delete('trainers', $id);
        sendResponse(['status' => 'success', 'message' => 'Trainer deleted successfully']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
