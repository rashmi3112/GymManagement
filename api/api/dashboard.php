<?php
// backend/api/dashboard.php
require_once __DIR__ . '/helper.php';
require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = new Firestore();
$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$parts = array_filter(explode('/', $pathInfo));
$action = current($parts); // stats, revenue, member-growth, activity

try {
    if ($method !== 'GET') {
        sendError('Method not allowed', 405);
    }

    if ($action === 'stats') {
        $members = $db->getAll('members');
        $payments = $db->getAll('payments');
        $attendance = $db->getAll('attendance');

        $today = date('Y-m-d');
        $todayAttendance = 0;
        foreach ($attendance as $att) {
            if (isset($att['date']) && $att['date'] === $today) {
                $todayAttendance++;
            }
        }

        $totalRevenue = 0;
        foreach ($payments as $p) {
            $totalRevenue += (float)($p['amount'] ?? 0);
        }

        $activeCount = 0;
        foreach ($members as $m) {
            if (isset($m['status']) && $m['status'] === 'active') {
                $activeCount++;
            }
        }

        sendResponse([
            'members' => count($members),
            'activeMembers' => $activeCount,
            'attendance' => $todayAttendance,
            'revenue' => $totalRevenue
        ]);
    } 
    
    elseif ($action === 'revenue') {
        $payments = $db->getAll('payments');
        
        // Group payments by month for the last 6 months
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthKey = date('Y-m', strtotime("-{$i} months"));
            $months[$monthKey] = [
                'month' => date('M', strtotime("-{$i} months")),
                'Revenue' => 0
            ];
        }

        foreach ($payments as $p) {
            if (isset($p['createdAt'])) {
                $createdMonth = substr($p['createdAt'], 0, 7); // e.g. "2026-08"
                if (isset($months[$createdMonth])) {
                    $months[$createdMonth]['Revenue'] += (float)($p['amount'] ?? 0);
                }
            }
        }

        sendResponse(array_values($months));
    } 
    
    elseif ($action === 'member-growth') {
        $members = $db->getAll('members');
        
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthKey = date('Y-m', strtotime("-{$i} months"));
            $months[$monthKey] = [
                'month' => date('M', strtotime("-{$i} months")),
                'Members' => 0
            ];
        }

        foreach ($members as $m) {
            if (isset($m['createdAt'])) {
                $createdMonth = substr($m['createdAt'], 0, 7);
                // Increment all months from the join date forward (cumulative)
                foreach ($months as $key => &$data) {
                    if ($createdMonth <= $key) {
                        $data['Members']++;
                    }
                }
            }
        }

        sendResponse(array_values($months));
    } 
    
    elseif ($action === 'activity') {
        // Return recent checkins as activity
        $attendance = $db->getAll('attendance');
        
        // Sort by checkIn descending
        usort($attendance, function($a, $b) {
            return strcmp($b['checkIn'] ?? '', $a['checkIn'] ?? '');
        });

        sendResponse(array_slice($attendance, 0, 5));
    } 
    
    else {
        sendError('Invalid dashboard action target');
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}
