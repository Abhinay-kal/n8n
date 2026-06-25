<?php
namespace SeoOptAgent\Services;

use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Security\SecretStoreInterface;
use SeoOptAgent\Models\ConnectionStatus;
use SeoOptAgent\Models\RegistrationStatus;
use SeoOptAgent\Models\PluginIdentity;
use SeoOptAgent\Models\BackendIdentity;

class ConfigService {
    private $repo;
    private $secretStore;
    private $cache;

    public function __construct(SettingsRepository $repo, SecretStoreInterface $secretStore) {
        $this->repo = $repo;
        $this->secretStore = $secretStore;
        $this->cache = $this->repo->getSettings();
    }

    public function getAll(): array {
        return $this->cache;
    }

    public function save(string $key, $value): void {
        $this->cache[$key] = $value;
        $this->repo->saveSettings($this->cache);
    }

    public function getBackendUrl(): string {
        return rtrim($this->cache['backend_url'] ?? '', '/');
    }

    // Secrets are now handled by SecretStore
    public function getApiKey(): string {
        return $this->secretStore->getSecret('api_key');
    }

    public function setApiKey(string $key): void {
        $this->secretStore->setSecret('api_key', $key);
    }
    
    public function getRegistrationToken(): string {
        return $this->secretStore->getSecret('registration_token');
    }

    public function setRegistrationToken(string $token): void {
        $this->secretStore->setSecret('registration_token', $token);
    }

    public function clearRegistrationToken(): void {
        $this->secretStore->deleteSecret('registration_token');
    }

    public function getConnectionStatus(): ConnectionStatus {
        return new ConnectionStatus($this->cache['connection_status'] ?? ConnectionStatus::NOT_CONFIGURED);
    }

    public function setConnectionStatus(ConnectionStatus $status): void {
        $this->save('connection_status', $status->getValue());
    }

    public function getRegistrationStatus(): RegistrationStatus {
        return new RegistrationStatus($this->cache['registration_status'] ?? RegistrationStatus::UNREGISTERED);
    }

    public function setRegistrationStatus(RegistrationStatus $status): void {
        $this->save('registration_status', $status->getValue());
    }

    public function getLastConnectionError(): string {
        return $this->cache['last_error'] ?? '';
    }

    public function setLastConnectionError(string $error): void {
        $this->save('last_error', $error);
    }

    public function getIdentity(): PluginIdentity {
        return new PluginIdentity($this->cache['identity'] ?? []);
    }

    public function updateIdentity(PluginIdentity $identity): void {
        // Validation: never overwrite existing UUIDs
        $existing = $this->getIdentity();
        $data = $identity->toArray();
        
        if (!empty($existing->getPluginUuid())) {
            $data['pluginUuid'] = $existing->getPluginUuid();
        }
        if (!empty($existing->getInstallationUuid())) {
            $data['installationUuid'] = $existing->getInstallationUuid();
        }
        if (!empty($existing->getGeneratedAt())) {
            $data['generatedAt'] = $existing->getGeneratedAt();
        }
        
        $this->save('identity', $data);
    }

    public function getBackendIdentity(): BackendIdentity {
        return new BackendIdentity($this->cache['backend_identity'] ?? []);
    }

    public function updateBackendIdentity(BackendIdentity $identity): void {
        $this->save('backend_identity', $identity->toArray());
    }
}\n