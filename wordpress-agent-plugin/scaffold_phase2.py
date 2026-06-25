import os

base_dir = '/Users/abhinaykalkhanday/Desktop/n8n/wordpress-agent-plugin'

files = {
    'models/PluginIdentity.php': """<?php
namespace SeoOptAgent\\Models;

class PluginIdentity {
    private $pluginUuid;
    private $installationUuid;
    private $pluginVersion;
    private $wpVersion;
    private $phpVersion;
    private $siteUrl;
    private $homeUrl;
    private $siteName;
    private $timezone;
    private $language;
    private $environment;
    private $generatedAt;

    public function __construct(array $data = []) {
        $this->pluginUuid = $data['pluginUuid'] ?? '';
        $this->installationUuid = $data['installationUuid'] ?? '';
        $this->pluginVersion = $data['pluginVersion'] ?? '';
        $this->wpVersion = $data['wpVersion'] ?? '';
        $this->phpVersion = $data['phpVersion'] ?? '';
        $this->siteUrl = $data['siteUrl'] ?? '';
        $this->homeUrl = $data['homeUrl'] ?? '';
        $this->siteName = $data['siteName'] ?? '';
        $this->timezone = $data['timezone'] ?? '';
        $this->language = $data['language'] ?? '';
        $this->environment = $data['environment'] ?? 'production';
        $this->generatedAt = $data['generatedAt'] ?? 0;
    }

    public function toArray(): array {
        return [
            'pluginUuid' => $this->pluginUuid,
            'installationUuid' => $this->installationUuid,
            'pluginVersion' => $this->pluginVersion,
            'wpVersion' => $this->wpVersion,
            'phpVersion' => $this->phpVersion,
            'siteUrl' => $this->siteUrl,
            'homeUrl' => $this->homeUrl,
            'siteName' => $this->siteName,
            'timezone' => $this->timezone,
            'language' => $this->language,
            'environment' => $this->environment,
            'generatedAt' => $this->generatedAt,
        ];
    }
    
    // Getters and Setters omitted for brevity but used directly or via toArray
    public function getPluginUuid() { return $this->pluginUuid; }
    public function getInstallationUuid() { return $this->installationUuid; }
    public function getPluginVersion() { return $this->pluginVersion; }
    public function getWpVersion() { return $this->wpVersion; }
    public function getPhpVersion() { return $this->phpVersion; }
    public function getSiteUrl() { return $this->siteUrl; }
    public function getHomeUrl() { return $this->homeUrl; }
    public function getSiteName() { return $this->siteName; }
    public function getGeneratedAt() { return $this->generatedAt; }
    
    public function setInstallationUuid($v) { $this->installationUuid = $v; }
    public function setPluginUuid($v) { $this->pluginUuid = $v; }
    public function setPluginVersion($v) { $this->pluginVersion = $v; }
    public function setWpVersion($v) { $this->wpVersion = $v; }
    public function setPhpVersion($v) { $this->phpVersion = $v; }
    public function setSiteUrl($v) { $this->siteUrl = $v; }
    public function setHomeUrl($v) { $this->homeUrl = $v; }
    public function setSiteName($v) { $this->siteName = $v; }
    public function setTimezone($v) { $this->timezone = $v; }
    public function setLanguage($v) { $this->language = $v; }
    public function setEnvironment($v) { $this->environment = $v; }
    public function setGeneratedAt($v) { $this->generatedAt = $v; }
}
""",

    'models/RegistrationData.php': """<?php
namespace SeoOptAgent\\Models;

class RegistrationData {
    private $registrationId;
    private $registrationToken;
    private $siteId;
    private $expiresAt;
    private $backendVersion;
    private $apiVersion;
    private $capabilities;

    public function __construct(array $data = []) {
        $this->registrationId = $data['registrationId'] ?? '';
        $this->registrationToken = $data['registrationToken'] ?? '';
        $this->siteId = $data['siteId'] ?? '';
        $this->expiresAt = $data['expiresAt'] ?? 0;
        $this->backendVersion = $data['backendVersion'] ?? '';
        $this->apiVersion = $data['apiVersion'] ?? '';
        $this->capabilities = $data['capabilities'] ?? [];
    }

    public function toArray(): array {
        return [
            'registrationId' => $this->registrationId,
            'registrationToken' => $this->registrationToken,
            'siteId' => $this->siteId,
            'expiresAt' => $this->expiresAt,
            'backendVersion' => $this->backendVersion,
            'apiVersion' => $this->apiVersion,
            'capabilities' => $this->capabilities,
        ];
    }
    
    public function getRegistrationToken() { return $this->registrationToken; }
    public function getSiteId() { return $this->siteId; }
    public function getBackendVersion() { return $this->backendVersion; }
    public function getApiVersion() { return $this->apiVersion; }
    public function getCapabilities() { return $this->capabilities; }
}
""",

    'models/ConnectionStatus.php': """<?php
namespace SeoOptAgent\\Models;

class ConnectionStatus {
    const NOT_CONFIGURED = 'NOT_CONFIGURED';
    const CONFIGURED = 'CONFIGURED';
    const CONNECTING = 'CONNECTING';
    const HANDSHAKING = 'HANDSHAKING';
    const REGISTERING = 'REGISTERING';
    const CONNECTED = 'CONNECTED';
    const AUTH_FAILED = 'AUTH_FAILED';
    const VERSION_MISMATCH = 'VERSION_MISMATCH';
    const SERVER_UNREACHABLE = 'SERVER_UNREACHABLE';
    const TIMEOUT = 'TIMEOUT';
    const DISCONNECTED = 'DISCONNECTED';

    private $status;

    public function __construct(string $status = self::NOT_CONFIGURED) {
        $this->status = $status;
    }

    public function getValue(): string {
        return $this->status;
    }

    public function getLabel(): string {
        $map = [
            self::NOT_CONFIGURED => 'Not Configured',
            self::CONFIGURED => 'Configured',
            self::CONNECTING => 'Connecting',
            self::HANDSHAKING => 'Handshaking',
            self::REGISTERING => 'Registering',
            self::CONNECTED => 'Connected',
            self::AUTH_FAILED => 'Authentication Failed',
            self::VERSION_MISMATCH => 'Version Mismatch',
            self::SERVER_UNREACHABLE => 'Backend Unreachable',
            self::TIMEOUT => 'Timeout',
            self::DISCONNECTED => 'Disconnected',
        ];
        return $map[$this->status] ?? 'Unknown';
    }
}
""",

    'services/ConfigService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Models\\ConnectionStatus;
use SeoOptAgent\\Models\\PluginIdentity;
use SeoOptAgent\\Models\\RegistrationData;

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
}
""",

    'api/HttpClient.php': """<?php
namespace SeoOptAgent\\Api;

class HttpClient {
    public function request(string $method, string $url, array $headers = [], array $body = []): array {
        // Prevent insecure HTTP unless localhost (developer mode)
        if (strpos($url, 'http://') === 0 && strpos($url, 'http://localhost') === false && strpos($url, 'http://127.0.0.1') === false) {
            return [
                'success' => false,
                'error_code' => 'insecure_connection',
                'message' => 'Insecure HTTP connections are not allowed.',
                'status' => 0
            ];
        }

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
            $errorCode = $response->get_error_code();
            if (strpos($errorCode, 'timeout') !== false) {
                $errorCode = 'timeout';
            }
            return [
                'success' => false,
                'error_code' => $errorCode,
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
}
""",

    'api/BackendClient.php': """<?php
namespace SeoOptAgent\\Api;

use SeoOptAgent\\Services\\ConfigService;

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
        $url = $this->config->getBackendUrl();
        if (empty($url)) {
            return [
                'success' => false,
                'error_code' => 'config_missing',
                'message' => 'Backend URL is missing.'
            ];
        }
        $fullUrl = rtrim($url, '/') . '/' . ltrim($endpoint, '/');
        $apiKey = $this->config->getApiKey();
        $token = $this->config->getRegistrationToken();

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];

        if (!empty($apiKey)) {
            $headers['x-api-key'] = $apiKey;
        }
        if (!empty($token)) {
            $headers['Authorization'] = 'Bearer ' . $token;
        }

        return $this->httpClient->request($method, $fullUrl, $headers, $body);
    }
}
""",

    'services/RegistrationService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Api\\BackendClient;
use SeoOptAgent\\Models\\ConnectionResult;
use SeoOptAgent\\Models\\ConnectionStatus;
use SeoOptAgent\\Models\\RegistrationData;
use SeoOptAgent\\Utils\\LoggerInterface;

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
}
""",

    'bootstrap/Plugin.php': """<?php
namespace SeoOptAgent\\Bootstrap;

use SeoOptAgent\\Config\\Constants;
use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Models\\PluginIdentity;

class Plugin {
    private $loader;
    private $serviceContainer;
    private $pluginFile;

    public function __construct($pluginFile) {
        $this->pluginFile = $pluginFile;
        $this->initializeConstants();
        $this->loader = new Loader();
        $this->serviceContainer = new ServiceContainer();
        
        $this->setHooks();
    }

    private function initializeConstants() {
        new Constants($this->pluginFile);
    }

    private function setHooks() {
        register_activation_hook($this->pluginFile, [$this, 'activate']);
        register_deactivation_hook($this->pluginFile, [$this, 'deactivate']);

        $this->serviceContainer->registerServices($this->loader);
    }

    public function activate() {
        $repo = new SettingsRepository();
        $config = new ConfigService($repo);
        
        $identity = $config->getIdentity();
        $identityArray = $identity->toArray();
        
        if (empty($identityArray['pluginUuid'])) {
            $identityArray['pluginUuid'] = wp_generate_uuid4();
        }
        if (empty($identityArray['installationUuid'])) {
            $identityArray['installationUuid'] = wp_generate_uuid4();
        }
        if (empty($identityArray['generatedAt'])) {
            $identityArray['generatedAt'] = time();
        }

        global $wp_version;
        $identityArray['pluginVersion'] = SEO_OPT_AGENT_VERSION;
        $identityArray['wpVersion'] = $wp_version;
        $identityArray['phpVersion'] = phpversion();
        $identityArray['siteUrl'] = site_url();
        $identityArray['homeUrl'] = home_url();
        $identityArray['siteName'] = get_bloginfo('name');
        $identityArray['timezone'] = wp_timezone_string();
        $identityArray['language'] = get_locale();
        $identityArray['environment'] = wp_get_environment_type();
        
        $config->updateIdentity(new PluginIdentity($identityArray));
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    public function run() {
        $this->loader->run();
    }
}
""",

    'bootstrap/ServiceContainer.php': """<?php
namespace SeoOptAgent\\Bootstrap;

use SeoOptAgent\\Admin\\AdminModule;
use SeoOptAgent\\Admin\\Notices;
use SeoOptAgent\\Api\\HttpClient;
use SeoOptAgent\\Api\\BackendClient;
use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Services\\RegistrationService;
use SeoOptAgent\\Utils\\NullLogger;

class ServiceContainer {
    public function registerServices(Loader $loader) {
        $logger = new NullLogger();
        $settingsRepo = new SettingsRepository();
        $configService = new ConfigService($settingsRepo);
        
        $httpClient = new HttpClient();
        $backendClient = new BackendClient($httpClient, $configService);
        
        $registrationService = new RegistrationService($backendClient, $configService, $logger);
        
        $notices = new Notices();

        $modules = [
            new AdminModule($configService, $registrationService, $notices)
        ];

        foreach ($modules as $module) {
            $module->register($loader);
        }
    }
}
""",

    'admin/AdminModule.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Bootstrap\\ModuleInterface;
use SeoOptAgent\\Bootstrap\\Loader;
use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Services\\RegistrationService;

class AdminModule implements ModuleInterface {
    private $configService;
    private $registrationService;
    private $notices;

    public function __construct(ConfigService $configService, RegistrationService $registrationService, Notices $notices) {
        $this->configService = $configService;
        $this->registrationService = $registrationService;
        $this->notices = $notices;
    }

    public function register(Loader $loader): void {
        $menu = new Menu($this->configService, $this->registrationService);
        $settingsPage = new SettingsPage($this->configService, $this->registrationService, $this->notices);

        $loader->addAction('admin_menu', $menu, 'register');
        $loader->addAction('admin_init', $settingsPage, 'registerSettings');
        $loader->addAction('admin_enqueue_scripts', $settingsPage, 'enqueueAssets');
        
        $loader->addAction('wp_ajax_seo_opt_handshake', $settingsPage, 'handleHandshake');
        $loader->addAction('wp_ajax_seo_opt_register', $settingsPage, 'handleRegister');
        $loader->addAction('wp_ajax_seo_opt_disconnect', $settingsPage, 'handleDisconnect');
    }
}
""",

    'admin/SettingsPage.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Services\\RegistrationService;
use SeoOptAgent\\Security\\Nonce;
use SeoOptAgent\\Security\\Permissions;

class SettingsPage {
    private $config;
    private $registration;
    private $notices;

    public function __construct(ConfigService $config, RegistrationService $registration, Notices $notices) {
        $this->config = $config;
        $this->registration = $registration;
        $this->notices = $notices;
    }

    public function registerSettings() {
        register_setting('seo_opt_agent_options_group', 'seo_opt_agent_settings', [
            'sanitize_callback' => [$this, 'sanitizeSettings']
        ]);
    }

    public function sanitizeSettings($input) {
        $sanitized = $this->config->getAll();
        
        if (isset($input['backend_url'])) {
            $sanitized['backend_url'] = esc_url_raw($input['backend_url']);
        }
        if (isset($input['api_key'])) {
            $newKey = sanitize_text_field($input['api_key']);
            if (strpos($newKey, '****') === false && !empty($newKey)) {
                $sanitized['api_key'] = $newKey;
            }
        }
        return $sanitized;
    }

    public function enqueueAssets($hook) {
        if (strpos($hook, 'seo-opt-agent-connection') === false) {
            return;
        }
        wp_enqueue_script('seo-opt-admin-js', SEO_OPT_AGENT_URL . 'assets/js/admin.js', ['jquery'], SEO_OPT_AGENT_VERSION, true);
        wp_localize_script('seo-opt-admin-js', 'seoOptAgentObj', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => Nonce::create('seo_opt_ajax_action'),
            'loading_text' => __('Processing...', 'seo-opt-agent'),
        ]);
        wp_enqueue_style('seo-opt-admin-css', SEO_OPT_AGENT_URL . 'assets/css/admin.css', [], SEO_OPT_AGENT_VERSION);
    }

    public function renderPage() {
        if (!Permissions::canManageSettings()) {
            return;
        }
        
        $url = $this->config->getBackendUrl();
        $apiKey = $this->config->getApiKey();
        $maskedKey = !empty($apiKey) ? str_repeat('*', max(0, strlen($apiKey) - 4)) . substr($apiKey, -4) : '';
        
        $identity = $this->config->getIdentity();
        $regData = $this->config->getRegistrationData();
        $status = $this->config->getConnectionStatus()->getLabel();
        $lastError = $this->config->getLastConnectionError();

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('SEO Platform Connection', 'seo-opt-agent'); ?></h1>
            <div id="seo-opt-notices-container"></div>
            <form method="post" action="options.php">
                <?php settings_fields('seo_opt_agent_options_group'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="seo_opt_backend_url"><?php esc_html_e('Backend URL', 'seo-opt-agent'); ?></label></th>
                        <td><input type="url" id="seo_opt_backend_url" name="seo_opt_agent_settings[backend_url]" value="<?php echo esc_attr($url); ?>" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="seo_opt_api_key"><?php esc_html_e('API Key', 'seo-opt-agent'); ?></label></th>
                        <td><input type="password" id="seo_opt_api_key" name="seo_opt_agent_settings[api_key]" value="<?php echo esc_attr($maskedKey); ?>" class="regular-text" placeholder="Enter new API key to update"></td>
                    </tr>
                </table>

                <h2><?php esc_html_e('Plugin Identity (Read-Only)', 'seo-opt-agent'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Plugin UUID', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($identity->getPluginUuid()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Installation UUID', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($identity->getInstallationUuid()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Generated At', 'seo-opt-agent'); ?></th>
                        <td><?php echo esc_html($identity->getGeneratedAt() ? date('Y-m-d H:i:s', $identity->getGeneratedAt()) : 'N/A'); ?></td>
                    </tr>
                </table>

                <h2><?php esc_html_e('Connection State', 'seo-opt-agent'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Registration Status', 'seo-opt-agent'); ?></th>
                        <td><strong id="seo-opt-status-text"><?php echo esc_html($status); ?></strong></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Backend Version', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-backend-version"><?php echo esc_html($regData->getBackendVersion() ?: 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('API Version', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-api-version"><?php echo esc_html($regData->getApiVersion() ?: 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Capabilities', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-capabilities"><?php echo esc_html(implode(', ', $regData->getCapabilities()) ?: 'None'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Last Error', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-last-error" style="color: #d63638;"><?php echo esc_html($lastError ?: 'None'); ?></td>
                    </tr>
                </table>

                <p class="submit">
                    <?php submit_button(__('Save Settings', 'seo-opt-agent'), 'primary', 'submit', false); ?>
                    <button type="button" id="seo-opt-handshake" class="button button-secondary"><?php esc_html_e('Handshake', 'seo-opt-agent'); ?></button>
                    <button type="button" id="seo-opt-register" class="button button-secondary"><?php esc_html_e('Register', 'seo-opt-agent'); ?></button>
                    <button type="button" id="seo-opt-disconnect" class="button button-secondary"><?php esc_html_e('Disconnect', 'seo-opt-agent'); ?></button>
                </p>
            </form>
        </div>
        <?php
    }

    private function verifyAjax() {
        if (!Nonce::verify($_POST['nonce'], 'seo_opt_ajax_action')) {
            wp_send_json_error(['message' => __('Invalid security token.', 'seo-opt-agent')]);
        }
        if (!Permissions::canManageSettings()) {
            wp_send_json_error(['message' => __('Insufficient permissions.', 'seo-opt-agent')]);
        }
    }

    public function handleHandshake() {
        $this->verifyAjax();
        $result = $this->registration->handshake();
        $this->respondWithResult($result);
    }

    public function handleRegister() {
        $this->verifyAjax();
        $result = $this->registration->register();
        $this->respondWithResult($result);
    }

    public function handleDisconnect() {
        $this->verifyAjax();
        $result = $this->registration->disconnect();
        $this->respondWithResult($result);
    }

    private function respondWithResult($result) {
        $regData = $this->config->getRegistrationData();
        $response = [
            'message' => $result->getMessage(),
            'status' => $result->getStatus()->getLabel(),
            'backend_version' => $regData->getBackendVersion() ?: 'N/A',
            'api_version' => $regData->getApiVersion() ?: 'N/A',
            'capabilities' => implode(', ', $regData->getCapabilities()) ?: 'None',
            'last_error' => $this->config->getLastConnectionError()
        ];

        if ($result->isSuccess()) {
            wp_send_json_success($response);
        } else {
            wp_send_json_error($response);
        }
    }
}
""",

    'assets/js/admin.js': """
jQuery(document).ready(function($) {
    function handleAction($btn, actionName) {
        var originalText = $btn.text();
        $btn.text(seoOptAgentObj.loading_text).prop('disabled', true);
        $('#seo-opt-notices-container').html('');
        
        $.post(seoOptAgentObj.ajax_url, {
            action: actionName,
            nonce: seoOptAgentObj.nonce
        }, function(response) {
            var noticeClass = response.success ? 'notice-success' : 'notice-error';
            var html = '<div class="notice ' + noticeClass + ' is-dismissible"><p>' + response.data.message + '</p></div>';
            $('#seo-opt-notices-container').html(html);
            
            $('#seo-opt-status-text').text(response.data.status);
            $('#seo-opt-backend-version').text(response.data.backend_version);
            $('#seo-opt-api-version').text(response.data.api_version);
            $('#seo-opt-capabilities').text(response.data.capabilities);
            
            if (response.success) {
                $('#seo-opt-last-error').text('None').css('color', 'inherit');
            } else {
                $('#seo-opt-last-error').text(response.data.last_error || 'Unknown Error').css('color', '#d63638');
            }
        }).fail(function() {
            $('#seo-opt-notices-container').html('<div class="notice notice-error is-dismissible"><p>Network error occurred.</p></div>');
        }).always(function() {
            $btn.text(originalText).prop('disabled', false);
        });
    }

    $('#seo-opt-handshake').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_handshake');
    });

    $('#seo-opt-register').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_register');
    });

    $('#seo-opt-disconnect').on('click', function(e) {
        e.preventDefault();
        handleAction($(this), 'seo_opt_disconnect');
    });

    $('form').on('submit', function() {
        var $apiKey = $('#seo_opt_api_key');
        if ($apiKey.val().indexOf('****') !== -1) {
            $apiKey.prop('disabled', true);
        }
    });
});
""",
    
    'admin/Menu.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Security\\Permissions;

class Menu {
    private $configService;
    private $registrationService;

    public function __construct($configService, $registrationService) {
        $this->configService = $configService;
        $this->registrationService = $registrationService;
    }

    public function register() {
        if (!Permissions::canManageSettings()) {
            return;
        }

        add_menu_page(
            __('SEO Platform', 'seo-opt-agent'),
            __('SEO Platform', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent',
            [$this, 'renderOverview'],
            'dashicons-chart-area',
            30
        );

        add_submenu_page(
            'seo-opt-agent',
            __('Overview', 'seo-opt-agent'),
            __('Overview', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent',
            [$this, 'renderOverview']
        );

        add_submenu_page(
            'seo-opt-agent',
            __('Connection', 'seo-opt-agent'),
            __('Connection', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent-connection',
            [new SettingsPage($this->configService, $this->registrationService, new Notices()), 'renderPage']
        );

        add_submenu_page(
            'seo-opt-agent',
            __('Diagnostics', 'seo-opt-agent'),
            __('Diagnostics', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent-diagnostics',
            [$this, 'renderDiagnostics']
        );
    }

    public function renderOverview() {
        echo '<div class="wrap"><h1>' . esc_html__('SEO Platform Overview', 'seo-opt-agent') . '</h1><p>' . esc_html__('Welcome to the SEO Optimization Platform Agent.', 'seo-opt-agent') . '</p></div>';
    }

    public function renderDiagnostics() {
        echo '<div class="wrap"><h1>' . esc_html__('Diagnostics', 'seo-opt-agent') . '</h1><p>' . esc_html__('Diagnostics tools will be available in future phases.', 'seo-opt-agent') . '</p></div>';
    }
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\\n')
print("Successfully generated phase 2 plugin scaffold.")
