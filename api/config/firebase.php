<?php
// backend/config/firebase.php

// Load .env file manually into PHP environment
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            putenv("{$name}={$value}");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

define('FIREBASE_PROJECT_ID', getenv('FIREBASE_PROJECT_ID') ?: 'fitcore-gym-db');

class Firestore {
    private $projectId;
    private $baseUrl;

    public function __construct() {
        $this->projectId = FIREBASE_PROJECT_ID;
        $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents";
    }

    /**
     * Parse Firestore values to standard PHP values
     */
    private function parseValue($val) {
        if (!is_array($val)) return $val;
        
        $key = key($val);
        $value = current($val);

        switch ($key) {
            case 'stringValue': return (string)$value;
            case 'integerValue': return (int)$value;
            case 'doubleValue': return (float)$value;
            case 'booleanValue': return (bool)$value;
            case 'nullValue': return null;
            case 'timestampValue': return $value; // returns ISO string
            case 'arrayValue':
                $arr = isset($value['values']) ? $value['values'] : [];
                return array_map([$this, 'parseValue'], $arr);
            case 'mapValue':
                $fields = isset($value['fields']) ? $value['fields'] : [];
                return $this->parseFields($fields);
            default: return $value;
        }
    }

    /**
     * Map a standard PHP value to a Firestore field wrapper
     */
    private function mapValue($val) {
        if (is_null($val)) return ['nullValue' => null];
        if (is_bool($val)) return ['booleanValue' => $val];
        if (is_int($val)) return ['integerValue' => (string)$val];
        if (is_float($val)) return ['doubleValue' => $val];
        if (is_string($val)) return ['stringValue' => $val];
        
        if (is_array($val)) {
            // Check if associative array (map) or sequential (list)
            if (array_keys($val) === range(0, count($val) - 1)) {
                return [
                    'arrayValue' => [
                        'values' => array_map([$this, 'mapValue'], $val)
                    ]
                ];
            } else {
                return [
                    'mapValue' => [
                        'fields' => $this->mapFields($val)
                    ]
                ];
            }
        }
        return ['stringValue' => (string)$val];
    }

    private function parseFields($fields) {
        $data = [];
        if (is_array($fields)) {
            foreach ($fields as $key => $val) {
                $data[$key] = $this->parseValue($val);
            }
        }
        return $data;
    }

    private function mapFields($data) {
        $fields = [];
        foreach ($data as $key => $val) {
            $fields[$key] = $this->mapValue($val);
        }
        return $fields;
    }

    private function parseDocument($doc) {
        if (isset($doc['error'])) {
            throw new Exception($doc['error']['message'] ?? 'Firestore Error');
        }
        $parts = explode('/', $doc['name']);
        $id = end($parts);
        $data = $this->parseFields($doc['fields'] ?? []);
        $data['id'] = $id;
        return $data;
    }

    private function request($method, $path, $data = null) {
        $url = $this->baseUrl . $path;
        $ch = curl_init($url);
        
        $headers = ['Content-Type: application/json'];
        
        // Setup authorization if Bearer token is provided
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
        }

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Local development testing

        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $json = json_decode($response, true);
        if ($status >= 400) {
            throw new Exception($json['error']['message'] ?? "Request failed with code {$status}");
        }

        return $json;
    }

    // ─── CRUD METHODS ────────────────────────

    public function getAll($collection) {
        try {
            $res = $this->request('GET', "/{$collection}");
            $docs = $res['documents'] ?? [];
            return array_map([$this, 'parseDocument'], $docs);
        } catch (Exception $e) {
            return []; // Return empty array on not found or empty collection
        }
    }

    public function get($collection, $id) {
        $res = $this->request('GET', "/{$collection}/{$id}");
        return $this->parseDocument($res);
    }

    public function create($collection, $data, $id = null) {
        $fields = $this->mapFields($data);
        $payload = ['fields' => $fields];
        
        if ($id) {
            $res = $this->request('POST', "/{$collection}?documentId={$id}", $payload);
        } else {
            $res = $this->request('POST', "/{$collection}", $payload);
        }
        return $this->parseDocument($res);
    }

    public function update($collection, $id, $data) {
        $fields = $this->mapFields($data);
        $payload = ['fields' => $fields];
        
        // Build the update mask to update only specific fields
        $mask = [];
        foreach (array_keys($data) as $key) {
            $mask[] = "updateMask.fieldPaths={$key}";
        }
        $queryStr = implode('&', $mask);

        $res = $this->request('PATCH', "/{$collection}/{$id}?{$queryStr}", $payload);
        return $this->parseDocument($res);
    }

    public function delete($collection, $id) {
        $this->request('DELETE', "/{$collection}/{$id}");
        return true;
    }
}
