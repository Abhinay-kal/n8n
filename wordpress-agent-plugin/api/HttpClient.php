<?php
namespace SeoOptAgent\Api;

class HttpClient {
    public function request(string $method, string $url, array $headers = [], array $body = []): array {
        $args = [
            'method'      => $method,
            'timeout'     => 15,
            'redirection' => 5,
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers'     => $headers,
            'sslverify'   => true,
        ];

        if ($method === 'POST' && !empty($body)) {
            $args['body'] = wp_json_encode($body);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return [
                'success' => false,
                'error_code' => $response->get_error_code(),
                'message' => $response->get_error_message(),
                'status' => 0
            ];
        }

        $statusCode = wp_remote_retrieve_response_code($response);
        $bodyRaw = wp_remote_retrieve_body($response);
        $data = json_decode($bodyRaw, true) ?: [];

        if ($statusCode >= 400) {
            $message = $data['error'] ?? 'Unknown HTTP Error';
            return [
                'success' => false,
                'error_code' => 'http_error_' . $statusCode,
                'message' => $message,
                'status' => $statusCode
            ];
        }

        return [
            'success' => true,
            'data' => $data,
            'status' => $statusCode
        ];
    }
}\n