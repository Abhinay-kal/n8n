<?php
namespace SeoOptAgent\Models;

class ConnectionStatus {
    const CONNECTED = 'connected';
    const DISCONNECTED = 'disconnected';
    const NEVER_CONNECTED = 'never_connected';
    const CONFIG_MISSING = 'config_missing';
    const UNREACHABLE = 'unreachable';
    const AUTH_FAILED = 'auth_failed';

    private $status;

    public function __construct(string $status = self::NEVER_CONNECTED) {
        $this->status = $status;
    }

    public function getValue(): string {
        return $this->status;
    }

    public function getLabel(): string {
        $map = [
            self::CONNECTED => 'Connected',
            self::DISCONNECTED => 'Disconnected',
            self::NEVER_CONNECTED => 'Never Connected',
            self::CONFIG_MISSING => 'Configuration Missing',
            self::UNREACHABLE => 'Backend Unreachable',
            self::AUTH_FAILED => 'Authentication Failed',
        ];
        return $map[$this->status] ?? 'Unknown';
    }
}\n