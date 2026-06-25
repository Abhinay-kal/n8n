<?php
namespace SeoOptAgent\Api;

use SeoOptAgent\Services\ConfigService;

class BackendClient {
    private $httpClient;
    private $config;

    public function __construct(HttpClient $httpClient, ConfigService $config) {
        $this->httpClient = $httpClient;
        $this->config = $config;
    }

    public function get(string $endpoint): array {
        return $this->request('GET', $endpoint);
    }

    public function post(string $endpoint, array $body = []): array {
        return $this->request('POST', $endpoint, $body);
    }

    private function request(string $method, string $endpoint, array $body = []): array {
        $url = rtrim($this->config->getBackendUrl(), '/') . '/' . ltrim($endpoint, '/');
        $apiKey = $this->config->getApiKey();

        if (empty($url) || empty($apiKey)) {
            return [
                'success' => false,
                'error_code' => 'config_missing',
                'message' => 'Backend URL or API Key is missing.'
            ];
        }

        $headers = [
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];

        return $this->httpClient->request($method, $url, $headers, $body);
    }
}\n