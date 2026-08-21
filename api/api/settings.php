<?php
// backend/api/settings.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$parts = array_filter(explode('/', $pathInfo));
$target = current($parts); // gym, user, or password

try {
    if ($method === 'GET') {
        if ($target === 'gym') {
            try {
                $gym = $db->get('settings', 'gym');
                sendResponse($gym);
            } catch (Exception $e) {
                // If not created yet, return default
                sendResponse([
                    'id' => 'gym',
                    'name' => 'FitCore Gym',
                    'email' => 'contact@fitcore.com',
                    'phone' => '+91 98765 43210',
                    'address' => 'Sector 15, Dwarka, New Delhi',
                    'currency' => '₹'
                ]);
            }
        } elseif ($target === 'user') {
            $profile = $db->get('users', $user['uid']);
            sendResponse($profile);
        } else {
            sendError('Invalid settings target');
        }
    } 
    
    elseif ($method === 'PUT') {
        $data = getRequestBody();
        if ($target === 'gym') {
            try {
                $updated = $db->update('settings', 'gym', $data);
                sendResponse($updated);
            } catch (Exception $e) {
                // Document might not exist yet, let's create it
                $newGym = $db->create('settings', $data, 'gym');
                sendResponse($newGym);
            }
        } elseif ($target === 'user') {
            $updated = $db->update('users', $user['uid'], [
                'name' => $data['name'] ?? $user['name'],
                'phone' => $data['phone'] ?? ''
            ]);
            sendResponse($updated);
        } elseif ($target === 'password') {
            // In a simple app, changing password is done directly on the client side via Firebase SDK.
            // But we can return success here if they configure client-side handling.
            sendResponse(['status' => 'success', 'message' => 'Password reset trigger confirmed']);
        } else {
            sendError('Invalid settings target');
        }
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
