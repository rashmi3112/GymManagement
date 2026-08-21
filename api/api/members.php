<?php
// backend/api/members.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

// Authenticate user
$user = AuthMiddleware::getAuthenticatedUser();

$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$id = !empty($pathInfo) ? basename($pathInfo) : null;

try {
    if ($method === 'GET') {
        if ($id) {
            // Get single member details
            $member = $db->get('members', $id);
            sendResponse($member);
        } else {
            // Get all members
            $members = $db->getAll('members');
            sendResponse($members);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['name']) || empty($data['email'])) {
            sendError('Name and email are required fields');
        }
        
        $newMember = $db->create('members', $data);
        sendResponse($newMember, 21);
    } 
    
    elseif ($method === 'PUT') {
        if (!$id) {
            sendError('Member ID is required for updates');
        }
        $data = getRequestBody();
        $updated = $db->update('members', $id, $data);
        sendResponse($updated);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Member ID is required for deletion');
        }
        $db->delete('members', $id);
        sendResponse(['status' => 'success', 'message' => 'Member deleted successfully']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
