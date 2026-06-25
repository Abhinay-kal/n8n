<?php
namespace SeoOptAgent\Services;

use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Models\ConnectionStatus;
use SeoOptAgent\Models\PluginMetadata;

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

    private function save(string $key, $value): void {
        $this->cache[$key] = $value;
        $this->repo->saveSettings($this->cache);
    }

    public function getBackendUrl(): string {
        return $this->cache['backend_url'] ?? '';
    }

    public function getApiKey(): string {
        return $this->cache['api_key'] ?? '';
    }

    public function getConnectionStatus(): ConnectionStatus {
        $val = $this->cache['connection_status'] ?? ConnectionStatus::NEVER_CONNECTED;
        return new ConnectionStatus($val);
    }

    public function setConnectionStatus(ConnectionStatus $status): void {
        $this->save('connection_status', $status->getValue());
    }

    public function getLastSuccessfulConnection(): int {
        return (int)($this->cache['last_success'] ?? 0);
    }

    public function setLastSuccessfulConnection(int $timestamp): void {
        $this->save('last_success', $timestamp);
    }

    public function getLastConnectionError(): string {
        return $this->cache['last_error'] ?? '';
    }

    public function setLastConnectionError(string $error): void {
        $this->save('last_error', $error);
    }

    public function getMetadata(): PluginMetadata {
        return new PluginMetadata($this->cache['metadata'] ?? []);
    }

    public function updateMetadata(PluginMetadata $meta): void {
        $this->save('metadata', $meta->toArray());
    }
}\n