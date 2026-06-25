<?php
namespace SeoOptAgent\Services;

use SeoOptAgent\Api\BackendClient;
use SeoOptAgent\Models\ConnectionResult;
use SeoOptAgent\Models\ConnectionStatus;
use SeoOptAgent\Models\RegistrationData;
use SeoOptAgent\Utils\LoggerInterface;

class RegistrationService {
    private $client;
    private $config;
    private $logger;

    public function __construct(BackendClient $client, ConfigService $config, LoggerInterface $logger) {
        $this->client = $client;
        $this->config = $config;
        $this->logger = $logger;
    }

    public function handshake(): ConnectionResult {
        $this->config->setConnectionStatus(new ConnectionStatus(ConnectionStatus::HANDSHAKING));
        $identity = $this->config->getIdentity();

        $payload = [
            'plugin' => [
                'uuid' => $identity->getPluginUuid(),
                'version' => $identity->getPluginVersion(),
                'installationUuid' => $identity->getInstallationUuid()
            ],
            'wordpress' => [
                'version' => $identity->getWpVersion(),
                'phpVersion' => $identity->getPhpVersion()
            ],
            'site' => [
                'url' => $identity->getSiteUrl(),
                'name' => $identity->getSiteName()
            ]
        ];

        $response = $this->client->post('/plugin/handshake', $payload);

        if (!$response['success']) {
            return $this->handleFailure($response);
        }

        $data = $response['data'];
        if (isset($data['compatible']) && !$data['compatible']) {
            $status = new ConnectionStatus(ConnectionStatus::VERSION_MISMATCH);
            $this->config->setConnectionStatus($status);
            $this->config->setLastConnectionError('Version Mismatch');
            return new ConnectionResult(false, 'Plugin version is not compatible with backend.', $status);
        }

        // Store intermediate capabilities and version
        $regData = $this->config->getRegistrationData();
        $regArray = $regData->toArray();
        $regArray['backendVersion'] = $data['backendVersion'] ?? '';
        $regArray['apiVersion'] = $data['apiVersion'] ?? '';
        $regArray['capabilities'] = $data['capabilities'] ?? [];
        $this->config->updateRegistrationData(new RegistrationData($regArray));
        
        $this->config->setConnectionStatus(new ConnectionStatus(ConnectionStatus::CONFIGURED));
        $this->config->setLastConnectionError('');
        
        return new ConnectionResult(true, 'Handshake successful.', new ConnectionStatus(ConnectionStatus::CONFIGURED));
    }

    public function register(): ConnectionResult {
        $this->config->setConnectionStatus(new ConnectionStatus(ConnectionStatus::REGISTERING));
        
        $identity = $this->config->getIdentity();
        $response = $this->client->post('/plugin/register', [
            'installationUuid' => $identity->getInstallationUuid()
        ]);

        if (!$response['success']) {
            return $this->handleFailure($response);
        }

        $data = $response['data'];
        
        $regData = $this->config->getRegistrationData();
        $regArray = $regData->toArray();
        $regArray['registrationId'] = $data['registrationId'] ?? '';
        $regArray['registrationToken'] = $data['registrationToken'] ?? '';
        $regArray['siteId'] = $data['siteId'] ?? '';
        $regArray['expiresAt'] = $data['expiresAt'] ?? 0;
        
        if (isset($data['capabilities'])) {
            $regArray['capabilities'] = $data['capabilities'];
        }

        $this->config->updateRegistrationData(new RegistrationData($regArray));
        $this->config->setConnectionStatus(new ConnectionStatus(ConnectionStatus::CONNECTED));
        $this->config->setLastConnectionError('');

        return new ConnectionResult(true, 'Registration successful.', new ConnectionStatus(ConnectionStatus::CONNECTED));
    }

    public function disconnect(): ConnectionResult {
        $response = $this->client->post('/plugin/disconnect');
        
        // Clear registration data whether backend succeeds or fails
        $this->config->updateRegistrationData(new RegistrationData([]));
        $this->config->setConnectionStatus(new ConnectionStatus(ConnectionStatus::DISCONNECTED));
        $this->config->setLastConnectionError('');
        
        return new ConnectionResult(true, 'Disconnected.', new ConnectionStatus(ConnectionStatus::DISCONNECTED));
    }

    private function handleFailure(array $response): ConnectionResult {
        $errorCode = $response['error_code'];
        $errorMessage = $response['message'];
        
        if ($errorCode === 'timeout') {
            $status = new ConnectionStatus(ConnectionStatus::TIMEOUT);
        } elseif ($errorCode === 'http_error_401' || $errorCode === 'http_error_403') {
            $status = new ConnectionStatus(ConnectionStatus::AUTH_FAILED);
        } elseif (strpos($errorCode, 'http_error_') !== false) {
            $status = new ConnectionStatus(ConnectionStatus::SERVER_UNREACHABLE);
        } else {
            $status = new ConnectionStatus(ConnectionStatus::DISCONNECTED);
        }
        
        $this->config->setConnectionStatus($status);
        $this->config->setLastConnectionError($errorMessage);
        $this->logger->log('error', "API Call Failed", ['code' => $errorCode, 'message' => $errorMessage]);
        
        return new ConnectionResult(false, $errorMessage, $status);
    }
}\n