<?php
// backend/middleware/auth.php

class AuthMiddleware {
    public static function getAuthenticatedUser() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            self::unauthorized('Authorization token is missing or malformed');
        }

        $token = substr($authHeader, 7);
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            self::unauthorized('Invalid authorization token format');
        }

        // Decode payload (middle part of JWT)
        $payloadJson = self::base64UrlDecode($parts[1]);
        $payload = json_decode($payloadJson, true);

        if (!$payload) {
            self::unauthorized('Failed to parse authorization token claims');
        }

        // Check expiry (exp is Unix timestamp)
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            self::unauthorized('Authorization token has expired');
        }

        return [
            'uid' => $payload['user_id'] ?? $payload['sub'] ?? '',
            'email' => $payload['email'] ?? '',
            'name' => $payload['name'] ?? '',
        ];
    }

    private static function base64UrlDecode($input) {
        $remainder = strlen($input) % 4;
        if ($remainder) {
            $padlen = 4 - $remainder;
            $input .= str_repeat('=', $padlen);
        }
        return base64_decode(strtr($input, '-_', '+/'));
    }

    private static function unauthorized($msg) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => $msg
        ]);
        exit;
    }
}
