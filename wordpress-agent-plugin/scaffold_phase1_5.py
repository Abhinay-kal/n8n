import os

base_dir = '/Users/abhinaykalkhanday/Desktop/n8n/wordpress-agent-plugin'

files = {
    'seo-optimization-platform.php': """<?php
/**
 * Plugin Name: SEO Optimization Platform Agent
 * Plugin URI: https://seo-optimization-platform.com/
 * Description: Connects WordPress securely to the SEO Optimization Platform backend for AI-driven content audits and rewrites.
 * Version: 1.0.0
 * Author: SEO Optimization Team
 * Author URI: https://seo-optimization-platform.com/
 * Text Domain: seo-opt-agent
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'WPINC' ) ) {
    die;
}

spl_autoload_register(function ($class) {
    $prefix = 'SeoOptAgent\\\\\\\\';
    $base_dir = plugin_dir_path(__FILE__);
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\\\\\\\', '/', $relative_class) . '.php';
    if (file_exists($file)) {
        require $file;
    }
});

function run_seo_opt_agent() {
    $plugin = new SeoOptAgent\\\\Bootstrap\\\\Plugin(__FILE__);
    $plugin->run();
}

run_seo_opt_agent();
""",

    'bootstrap/Plugin.php': """<?php
namespace SeoOptAgent\\Bootstrap;

use SeoOptAgent\\Config\\Constants;
use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Models\\PluginMetadata;

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
        
        $meta = $config->getMetadata();
        if (empty($meta->getUuid())) {
            $meta->setUuid(wp_generate_uuid4());
        }
        $meta->setPluginVersion(SEO_OPT_AGENT_VERSION);
        $meta->setPhpVersion(phpversion());
        global $wp_version;
        $meta->setWpVersion($wp_version);
        
        if (empty($meta->getInstalledAt())) {
            $meta->setInstalledAt(time());
        }
        
        $config->updateMetadata($meta);
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    public function run() {
        $this->loader->run();
    }
}
""",

    'bootstrap/Loader.php': """<?php
namespace SeoOptAgent\\Bootstrap;

class Loader {
    protected $actions = [];
    protected $filters = [];

    public function addAction($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->actions[] = [
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        ];
    }

    public function addFilter($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->filters[] = [
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        ];
    }

    public function run() {
        foreach ($this->filters as $hook) {
            add_filter($hook['hook'], [$hook['component'], $hook['callback']], $hook['priority'], $hook['accepted_args']);
        }
        foreach ($this->actions as $hook) {
            add_action($hook['hook'], [$hook['component'], $hook['callback']], $hook['priority'], $hook['accepted_args']);
        }
    }
}
""",

    'bootstrap/ModuleInterface.php': """<?php
namespace SeoOptAgent\\Bootstrap;

interface ModuleInterface {
    public function register(Loader $loader): void;
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
use SeoOptAgent\\Services\\ConnectionService;
use SeoOptAgent\\Services\\HealthService;
use SeoOptAgent\\Utils\\NullLogger;

class ServiceContainer {
    public function registerServices(Loader $loader) {
        $logger = new NullLogger();
        $settingsRepo = new SettingsRepository();
        $configService = new ConfigService($settingsRepo);
        
        $httpClient = new HttpClient();
        $backendClient = new BackendClient($httpClient, $configService);
        
        $healthService = new HealthService();
        $connectionService = new ConnectionService($backendClient, $configService, $healthService, $logger);
        
        $notices = new Notices();

        // Register Modules
        $modules = [
            new AdminModule($configService, $connectionService, $notices)
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
use SeoOptAgent\\Services\\ConnectionService;

class AdminModule implements ModuleInterface {
    private $configService;
    private $connectionService;
    private $notices;

    public function __construct(ConfigService $configService, ConnectionService $connectionService, Notices $notices) {
        $this->configService = $configService;
        $this->connectionService = $connectionService;
        $this->notices = $notices;
    }

    public function register(Loader $loader): void {
        $menu = new Menu($this->configService, $this->connectionService);
        $settingsPage = new SettingsPage($this->configService, $this->connectionService, $this->notices);

        $loader->addAction('admin_menu', $menu, 'register');
        $loader->addAction('admin_init', $settingsPage, 'registerSettings');
        $loader->addAction('admin_enqueue_scripts', $settingsPage, 'enqueueAssets');
        $loader->addAction('wp_ajax_seo_opt_test_connection', $settingsPage, 'handleTestConnection');
    }
}
""",

    'admin/Menu.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Security\\Permissions;

class Menu {
    private $configService;
    private $connectionService;

    public function __construct($configService, $connectionService) {
        $this->configService = $configService;
        $this->connectionService = $connectionService;
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
            [new SettingsPage($this->configService, $this->connectionService, new Notices()), 'renderPage']
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
""",

    'admin/SettingsPage.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Services\\ConfigService;
use SeoOptAgent\\Services\\ConnectionService;
use SeoOptAgent\\Security\\Nonce;
use SeoOptAgent\\Security\\Permissions;

class SettingsPage {
    private $config;
    private $connection;
    private $notices;

    public function __construct(ConfigService $config, ConnectionService $connection, Notices $notices) {
        $this->config = $config;
        $this->connection = $connection;
        $this->notices = $notices;
    }

    public function registerSettings() {
        register_setting('seo_opt_agent_options_group', 'seo_opt_agent_settings', [
            'sanitize_callback' => [$this, 'sanitizeSettings']
        ]);
    }

    public function sanitizeSettings($input) {
        $sanitized = $this->config->getAll(); // Get existing defaults
        
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
            'nonce' => Nonce::create('seo_opt_test_connection'),
            'saving_text' => __('Testing connection...', 'seo-opt-agent'),
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
        
        $meta = $this->config->getMetadata();
        $status = $this->config->getConnectionStatus()->getLabel();
        $lastSuccess = $this->config->getLastSuccessfulConnection();
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

                <h2><?php esc_html_e('System Information (Read-Only)', 'seo-opt-agent'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Plugin UUID', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($meta->getUuid()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Plugin Version', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($meta->getPluginVersion()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('WordPress Version', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($meta->getWpVersion()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('PHP Version', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($meta->getPhpVersion()); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Installation Date', 'seo-opt-agent'); ?></th>
                        <td><?php echo esc_html($meta->getInstalledAt() ? date('Y-m-d H:i:s', $meta->getInstalledAt()) : 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Connection Status', 'seo-opt-agent'); ?></th>
                        <td><strong id="seo-opt-status-text"><?php echo esc_html($status); ?></strong></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Last Successful Connection', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-last-success"><?php echo esc_html($lastSuccess ? date('Y-m-d H:i:s', $lastSuccess) : 'Never'); ?></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Last Error', 'seo-opt-agent'); ?></th>
                        <td id="seo-opt-last-error" style="color: #d63638;"><?php echo esc_html($lastError ?: 'None'); ?></td>
                    </tr>
                </table>

                <p class="submit">
                    <?php submit_button(__('Save Changes', 'seo-opt-agent'), 'primary', 'submit', false); ?>
                    <button type="button" id="seo-opt-test-connection" class="button button-secondary"><?php esc_html_e('Test Connection', 'seo-opt-agent'); ?></button>
                </p>
            </form>
        </div>
        <?php
    }

    public function handleTestConnection() {
        if (!Nonce::verify($_POST['nonce'], 'seo_opt_test_connection')) {
            wp_send_json_error(['message' => __('Invalid security token.', 'seo-opt-agent')]);
        }
        if (!Permissions::canManageSettings()) {
            wp_send_json_error(['message' => __('Insufficient permissions.', 'seo-opt-agent')]);
        }

        $result = $this->connection->testConnection();
        if ($result->isSuccess()) {
            wp_send_json_success([
                'message' => __('Connection successful!', 'seo-opt-agent'),
                'status' => $result->getStatus()->getLabel(),
                'last_success' => date('Y-m-d H:i:s', $this->config->getLastSuccessfulConnection())
            ]);
        } else {
            wp_send_json_error([
                'message' => $result->getMessage(),
                'status' => $result->getStatus()->getLabel(),
                'last_error' => $this->config->getLastConnectionError()
            ]);
        }
    }
}
""",

    'admin/Notices.php': """<?php
namespace SeoOptAgent\\Admin;

class Notices {
    
}
""",

    'api/HttpClient.php': """<?php
namespace SeoOptAgent\\Api;

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
}
""",

    'config/Constants.php': """<?php
namespace SeoOptAgent\\Config;

class Constants {
    public function __construct($pluginFile) {
        if (!defined('SEO_OPT_AGENT_VERSION')) {
            define('SEO_OPT_AGENT_VERSION', '1.0.1');
        }
        if (!defined('SEO_OPT_AGENT_PATH')) {
            define('SEO_OPT_AGENT_PATH', plugin_dir_path($pluginFile));
        }
        if (!defined('SEO_OPT_AGENT_URL')) {
            define('SEO_OPT_AGENT_URL', plugin_dir_url($pluginFile));
        }
        if (!defined('SEO_OPT_AGENT_SETTINGS_KEY')) {
            define('SEO_OPT_AGENT_SETTINGS_KEY', 'seo_opt_agent_settings');
        }
    }
}
""",

    'repository/SettingsRepository.php': """<?php
namespace SeoOptAgent\\Repository;

class SettingsRepository {
    public function getSettings(): array {
        return get_option(SEO_OPT_AGENT_SETTINGS_KEY, []);
    }

    public function saveSettings(array $settings): void {
        update_option(SEO_OPT_AGENT_SETTINGS_KEY, $settings);
    }
    
    public function deleteSettings(): void {
        delete_option(SEO_OPT_AGENT_SETTINGS_KEY);
    }
}
""",

    'models/ConnectionStatus.php': """<?php
namespace SeoOptAgent\\Models;

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
}
""",

    'models/ConnectionResult.php': """<?php
namespace SeoOptAgent\\Models;

class ConnectionResult {
    private $success;
    private $message;
    private $status;

    public function __construct(bool $success, string $message, ConnectionStatus $status) {
        $this->success = $success;
        $this->message = $message;
        $this->status = $status;
    }

    public function isSuccess(): bool {
        return $this->success;
    }

    public function getMessage(): string {
        return $this->message;
    }

    public function getStatus(): ConnectionStatus {
        return $this->status;
    }
}
""",

    'models/PluginMetadata.php': """<?php
namespace SeoOptAgent\\Models;

class PluginMetadata {
    private $uuid;
    private $pluginVersion;
    private $wpVersion;
    private $phpVersion;
    private $installedAt;

    public function __construct(array $data = []) {
        $this->uuid = $data['uuid'] ?? '';
        $this->pluginVersion = $data['plugin_version'] ?? '';
        $this->wpVersion = $data['wp_version'] ?? '';
        $this->phpVersion = $data['php_version'] ?? '';
        $this->installedAt = $data['installed_at'] ?? 0;
    }

    public function toArray(): array {
        return [
            'uuid' => $this->uuid,
            'plugin_version' => $this->pluginVersion,
            'wp_version' => $this->wpVersion,
            'php_version' => $this->phpVersion,
            'installed_at' => $this->installedAt,
        ];
    }
    
    // Getters
    public function getUuid() { return $this->uuid; }
    public function getPluginVersion() { return $this->pluginVersion; }
    public function getWpVersion() { return $this->wpVersion; }
    public function getPhpVersion() { return $this->phpVersion; }
    public function getInstalledAt() { return $this->installedAt; }

    // Setters
    public function setUuid($v) { $this->uuid = $v; }
    public function setPluginVersion($v) { $this->pluginVersion = $v; }
    public function setWpVersion($v) { $this->wpVersion = $v; }
    public function setPhpVersion($v) { $this->phpVersion = $v; }
    public function setInstalledAt($v) { $this->installedAt = $v; }
}
""",

    'services/ConfigService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Models\\ConnectionStatus;
use SeoOptAgent\\Models\\PluginMetadata;

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
}
""",

    'services/ConnectionService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Api\\BackendClient;
use SeoOptAgent\\Models\\ConnectionResult;
use SeoOptAgent\\Models\\ConnectionStatus;
use SeoOptAgent\\Utils\\LoggerInterface;

class ConnectionService {
    private $client;
    private $config;
    private $health;
    private $logger;

    public function __construct(BackendClient $client, ConfigService $config, HealthService $health, LoggerInterface $logger) {
        $this->client = $client;
        $this->config = $config;
        $this->health = $health;
        $this->logger = $logger;
    }

    public function testConnection(): ConnectionResult {
        $response = $this->client->get('/status');

        if (!$response['success']) {
            $errorCode = $response['error_code'];
            $errorMessage = $response['message'];
            
            $status = $this->health->determineErrorStatus($errorCode);
            
            $this->config->setConnectionStatus($status);
            $this->config->setLastConnectionError($errorMessage);
            $this->logger->log('error', "Connection test failed", ['code' => $errorCode, 'message' => $errorMessage]);
            
            return new ConnectionResult(false, $errorMessage, $status);
        }

        $data = $response['data'];
        if (isset($data['success']) && $data['success'] === true) {
            $status = new ConnectionStatus(ConnectionStatus::CONNECTED);
            $this->config->setConnectionStatus($status);
            $this->config->setLastSuccessfulConnection(time());
            $this->config->setLastConnectionError('');
            $this->logger->log('info', "Connection test succeeded");
            
            return new ConnectionResult(true, 'Connection successful', $status);
        }

        $status = new ConnectionStatus(ConnectionStatus::UNREACHABLE);
        $this->config->setConnectionStatus($status);
        $this->config->setLastConnectionError('Invalid response format');
        $this->logger->log('error', "Connection test failed: Invalid response format");
        
        return new ConnectionResult(false, 'Invalid response format from backend', $status);
    }
}
""",

    'services/HealthService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Models\\ConnectionStatus;

class HealthService {
    public function determineErrorStatus(string $errorCode): ConnectionStatus {
        if ($errorCode === 'config_missing') {
            return new ConnectionStatus(ConnectionStatus::CONFIG_MISSING);
        }
        if ($errorCode === 'http_error_401' || $errorCode === 'http_error_403') {
            return new ConnectionStatus(ConnectionStatus::AUTH_FAILED);
        }
        if (strpos($errorCode, 'http_error_') !== false) {
            return new ConnectionStatus(ConnectionStatus::UNREACHABLE);
        }
        return new ConnectionStatus(ConnectionStatus::DISCONNECTED);
    }
}
""",

    'security/Nonce.php': """<?php
namespace SeoOptAgent\\Security;

class Nonce {
    public static function create($action) {
        return wp_create_nonce($action);
    }

    public static function verify($nonce, $action) {
        return wp_verify_nonce($nonce, $action);
    }
}
""",

    'security/Permissions.php': """<?php
namespace SeoOptAgent\\Security;

class Permissions {
    const MANAGE_CAPABILITY = 'manage_options';

    public static function canManageSettings() {
        return current_user_can(self::MANAGE_CAPABILITY);
    }
}
""",

    'utils/LoggerInterface.php': """<?php
namespace SeoOptAgent\\Utils;

interface LoggerInterface {
    public function log(string $level, string $message, array $context = []): void;
}
""",

    'utils/NullLogger.php': """<?php
namespace SeoOptAgent\\Utils;

class NullLogger implements LoggerInterface {
    public function log(string $level, string $message, array $context = []): void {
        // Discard logs
    }
}
""",

    'uninstall.php': """<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Ensure the constant is defined for uninstallation
if (!defined('SEO_OPT_AGENT_SETTINGS_KEY')) {
    define('SEO_OPT_AGENT_SETTINGS_KEY', 'seo_opt_agent_settings');
}

delete_option( SEO_OPT_AGENT_SETTINGS_KEY );

// Cleanup legacy options from Phase P1
delete_option( 'seo_opt_backend_url' );
delete_option( 'seo_opt_api_key' );
delete_option( 'seo_opt_plugin_uuid' );
delete_option( 'seo_opt_plugin_version' );
delete_option( 'seo_opt_connection_status' );
delete_option( 'seo_opt_last_success' );
delete_option( 'seo_opt_last_error' );
delete_option( 'seo_opt_installed_at' );
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\\n')
print("Successfully generated phase 1.5 plugin scaffold.")
