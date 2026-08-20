<?php
// backend/api/payments.php
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
            $payment = $db->get('payments', $id);
            sendResponse($payment);
        } else {
            $payments = $db->getAll('payments');
            sendResponse($payments);
        }
    } 
    
    elseif ($method === 'POST') {
        $data = getRequestBody();
        if (empty($data['memberId']) || empty($data['amount']) || empty($data['planId'])) {
            sendError('Member, Plan and Amount are required fields');
        }
        
        $data['createdAt'] = date('Y-m-d\TH:i:s\Z');
        $newPayment = $db->create('payments', $data);

        // Update the member's expiry date and active status in Firestore
        $memberId = $data['memberId'];
        $member = $db->get('members', $memberId);
        
        // Calculate new expiry date based on plan duration (usually months)
        $plan = $db->get('plans', $data['planId']);
        $durationMonths = isset($plan['duration']) ? (int)$plan['duration'] : 1;
        
        $expiryDate = date('Y-m-d', strtotime("+{$durationMonths} months"));

        $db->update('members', $memberId, [
            'status' => 'active',
            'plan' => $plan['name'] ?? 'Custom',
            'membershipExpiry' => $expiryDate
        ]);

        sendResponse($newPayment, 201);
    } 
    
    elseif ($method === 'DELETE') {
        if (!$id) {
            sendError('Payment receipt ID is required for deletion');
        }
        $db->delete('payments', $id);
        sendResponse(['status' => 'success', 'message' => 'Payment receipt deleted']);
    } 
    
    else {
        sendError('Method not allowed', 405);
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
