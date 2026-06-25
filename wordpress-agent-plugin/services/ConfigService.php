<?php
namespace SeoOptAgent\Services;

use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Models\ConnectionStatus;
use SeoOptAgent\Models\PluginIdentity;
use SeoOptAgent\Models\RegistrationData;

class ConfigService {
    private $repo;
    private $cache;

    public function __construct(SettingsRepository $repo) {
        $this->repo = $repo;
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

    public function getApiKey(): string {
        return $this->cache['api_key'] ?? '';
    }
    
    public function getRegistrationToken(): string {
        $regData = $this->getRegistrationData();
        return $regData->getRegistrationToken();
    }

    public function getConnectionStatus(): ConnectionStatus {
        $val = $this->cache['connection_status'] ?? ConnectionStatus::NOT_CONFIGURED;
        return new ConnectionStatus($val);
    }

    public function setConnectionStatus(ConnectionStatus $status): void {
        $this->save('connection_status', $status->getValue());
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
        $this->save('identity', $identity->toArray());
    }

    public function getRegistrationData(): RegistrationData {
        return new RegistrationData($this->cache['registration'] ?? []);
    }

    public function updateRegistrationData(RegistrationData $data): void {
        $this->save('registration', $data->toArray());
    }
}\n