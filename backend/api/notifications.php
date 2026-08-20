<?php
// backend/api/notifications.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$parts = array_filter(explode('/', $pathInfo));
$action = current($parts); // read-all, or notification ID

try {
    if ($method === 'GET') {
        $notifications = $db->getAll('notifications');
        sendResponse($notifications);
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['title']) || empty($data['body'])) {
            sendError('Notification title and body are required');
        }
        $data['read'] = false;
        $data['createdAt'] = date('Y-m-d\TH:i:s\Z');
        
        $newNotif = $db->create('notifications', $data);
        sendResponse($newNotif, 201);
    } 
    
    elseif ($method === 'PUT') {
        if ($action === 'read-all') {
            // Mark all read
            $all = $db->getAll('notifications');
            foreach ($all as $n) {
                if (!$n['read']) {
                    $db->update('notifications', $n['id'], ['read' => true]);
                }
            }
            sendResponse(['status' => 'success', 'message' => 'All notifications marked read']);
        } else {
            // Mark specific read (/notifications/{id}/read)
            $id = $action;
            $subAction = next($parts);
            if (!$id || $subAction !== 'read') {
                sendError('Invalid read path structure');
            }
            $updated = $db->update('notifications', $id, ['read' => true]);
            sendResponse($updated);
        }
    } 
    
    elseif ($method === 'DELETE') {
        $id = $action;
        if (!$id) {
            sendError('Notification ID is required');
        }
        $db->delete('notifications', $id);
        sendResponse(['status' => 'success', 'message' => 'Notification deleted successfully']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
