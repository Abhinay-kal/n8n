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

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Register autoloader for PSR-4
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

// Bootstrap the plugin
function run_seo_opt_agent() {
    $plugin = new SeoOptAgent\\\\Bootstrap\\\\Plugin(__FILE__);
    $plugin->run();
}

run_seo_opt_agent();
""",

    'bootstrap/Plugin.php': """<?php
namespace SeoOptAgent\\Bootstrap;

use SeoOptAgent\\Config\\Constants;
use SeoOptAgent\\Repository\\SettingsRepository;

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

        // Load dependencies and hooks via ServiceContainer
        $this->serviceContainer->registerServices($this->loader);
    }

    public function activate() {
        // Activation tasks
        $settings = new SettingsRepository();
        if (empty($settings->getPluginUuid())) {
            $settings->updatePluginUuid(wp_generate_uuid4());
        }
        $settings->updatePluginVersion(SEO_OPT_AGENT_VERSION);
        $settings->updateInstallationTimestamp(time());
    }

    public function deactivate() {
        // Deactivation tasks (do not delete data)
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
    protected $actions;
    protected $filters;

    public function __construct() {
        $this->actions = [];
        $this->filters = [];
    }

    public function addAction($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->actions = $this->add($this->actions, $hook, $component, $callback, $priority, $accepted_args);
    }

    public function addFilter($hook, $component, $callback, $priority = 10, $accepted_args = 1) {
        $this->filters = $this->add($this->filters, $hook, $component, $callback, $priority, $accepted_args);
    }

    private function add($hooks, $hook, $component, $callback, $priority, $accepted_args) {
        $hooks[] = [
            'hook'          => $hook,
            'component'     => $component,
            'callback'      => $callback,
            'priority'      => $priority,
            'accepted_args' => $accepted_args
        ];
        return $hooks;
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

    'bootstrap/ServiceContainer.php': """<?php
namespace SeoOptAgent\\Bootstrap;

use SeoOptAgent\\Admin\\Menu;
use SeoOptAgent\\Admin\\SettingsPage;
use SeoOptAgent\\Admin\\Notices;
use SeoOptAgent\\Api\\BackendClient;
use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Services\\ConnectionService;
use SeoOptAgent\\Services\\HealthService;

class ServiceContainer {
    public function registerServices(Loader $loader) {
        $settingsRepo = new SettingsRepository();
        $backendClient = new BackendClient($settingsRepo);
        
        $healthService = new HealthService($settingsRepo);
        $connectionService = new ConnectionService($backendClient, $settingsRepo, $healthService);

        $notices = new Notices();
        $menu = new Menu();
        $settingsPage = new SettingsPage($settingsRepo, $connectionService, $notices);

        // Register Admin Menu
        $loader->addAction('admin_menu', $menu, 'register');
        
        // Register Settings and Hooks
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
            [new SettingsPage(), 'renderPage']
        );

        add_submenu_page(
            'seo-opt-agent',
            __('Diagnostics', 'seo-opt-agent'),
            __('Diagnostics', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent-diagnostics',
            [$this, 'renderDiagnostics']
        );

        add_submenu_page(
            'seo-opt-agent',
            __('About', 'seo-opt-agent'),
            __('About', 'seo-opt-agent'),
            Permissions::MANAGE_CAPABILITY,
            'seo-opt-agent-about',
            [$this, 'renderAbout']
        );
    }

    public function renderOverview() {
        echo '<div class="wrap"><h1>' . esc_html__('SEO Platform Overview', 'seo-opt-agent') . '</h1><p>' . esc_html__('Welcome to the SEO Optimization Platform Agent.', 'seo-opt-agent') . '</p></div>';
    }

    public function renderDiagnostics() {
        echo '<div class="wrap"><h1>' . esc_html__('Diagnostics', 'seo-opt-agent') . '</h1><p>' . esc_html__('Diagnostics tools will be available in future phases.', 'seo-opt-agent') . '</p></div>';
    }

    public function renderAbout() {
        echo '<div class="wrap"><h1>' . esc_html__('About', 'seo-opt-agent') . '</h1><p>' . esc_html__('Phase P1 Foundation Build.', 'seo-opt-agent') . '</p></div>';
    }
}
""",

    'admin/SettingsPage.php': """<?php
namespace SeoOptAgent\\Admin;

use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Services\\ConnectionService;
use SeoOptAgent\\Security\\Nonce;
use SeoOptAgent\\Security\\Permissions;

class SettingsPage {
    private $settingsRepo;
    private $connectionService;
    private $notices;

    public function __construct(SettingsRepository $settingsRepo = null, ConnectionService $connectionService = null, Notices $notices = null) {
        $this->settingsRepo = $settingsRepo ?: new SettingsRepository();
        $this->connectionService = $connectionService;
        $this->notices = $notices;
    }

    public function registerSettings() {
        register_setting('seo_opt_agent_options', 'seo_opt_backend_url', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('seo_opt_agent_options', 'seo_opt_api_key', ['sanitize_callback' => 'sanitize_text_field']);
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
        
        $url = $this->settingsRepo->getBackendUrl();
        $apiKey = $this->settingsRepo->getApiKey();
        $maskedKey = !empty($apiKey) ? str_repeat('*', max(0, strlen($apiKey) - 4)) . substr($apiKey, -4) : '';
        
        $uuid = $this->settingsRepo->getPluginUuid();
        $version = $this->settingsRepo->getPluginVersion();
        $status = $this->settingsRepo->getConnectionStatus();
        $lastSuccess = $this->settingsRepo->getLastSuccessfulConnection();
        $lastError = $this->settingsRepo->getLastConnectionError();

        ?>
        <div class="wrap">
            <h1><?php esc_html_e('SEO Platform Connection', 'seo-opt-agent'); ?></h1>
            <div id="seo-opt-notices-container"></div>
            <form method="post" action="options.php">
                <?php settings_fields('seo_opt_agent_options'); ?>
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="seo_opt_backend_url"><?php esc_html_e('Backend URL', 'seo-opt-agent'); ?></label></th>
                        <td><input type="url" id="seo_opt_backend_url" name="seo_opt_backend_url" value="<?php echo esc_attr($url); ?>" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="seo_opt_api_key"><?php esc_html_e('API Key', 'seo-opt-agent'); ?></label></th>
                        <td><input type="password" id="seo_opt_api_key" name="seo_opt_api_key" value="<?php echo esc_attr($maskedKey); ?>" class="regular-text" placeholder="Enter new API key to update"></td>
                    </tr>
                </table>

                <h2><?php esc_html_e('System Information (Read-Only)', 'seo-opt-agent'); ?></h2>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Plugin UUID', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($uuid); ?></code></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Plugin Version', 'seo-opt-agent'); ?></th>
                        <td><code><?php echo esc_html($version); ?></code></td>
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

        $result = $this->connectionService->testConnection();
        if ($result['success']) {
            wp_send_json_success([
                'message' => __('Connection successful!', 'seo-opt-agent'),
                'status' => $this->settingsRepo->getConnectionStatus(),
                'last_success' => date('Y-m-d H:i:s', $this->settingsRepo->getLastSuccessfulConnection())
            ]);
        } else {
            wp_send_json_error([
                'message' => $result['message'],
                'status' => $this->settingsRepo->getConnectionStatus(),
                'last_error' => $this->settingsRepo->getLastConnectionError()
            ]);
        }
    }
}
""",

    'admin/Notices.php': """<?php
namespace SeoOptAgent\\Admin;

class Notices {
    // Utility class for admin notices if needed in PHP
}
""",

    'api/BackendClient.php': """<?php
namespace SeoOptAgent\\Api;

use SeoOptAgent\\Repository\\SettingsRepository;

class BackendClient {
    private $settings;

    public function __construct(SettingsRepository $settings) {
        $this->settings = $settings;
    }

    public function get($endpoint) {
        return $this->request('GET', $endpoint);
    }

    public function post($endpoint, $body = []) {
        return $this->request('POST', $endpoint, $body);
    }

    private function request($method, $endpoint, $body = []) {
        $url = rtrim($this->settings->getBackendUrl(), '/') . '/' . ltrim($endpoint, '/');
        $apiKey = $this->settings->getApiKey();

        if (empty($url) || empty($apiKey)) {
            return new \\WP_Error('config_missing', 'Backend URL or API Key is missing.');
        }

        $args = [
            'method'      => $method,
            'timeout'     => 15,
            'redirection' => 5,
            'httpversion' => '1.0',
            'blocking'    => true,
            'headers'     => [
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json'
            ],
            'sslverify'   => true, // Production ready
        ];

        if ($method === 'POST' && !empty($body)) {
            $args['body'] = wp_json_encode($body);
        }

        $response = wp_remote_request($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $statusCode = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($statusCode >= 400) {
            $message = isset($data['error']) ? $data['error'] : 'Unknown HTTP Error';
            return new \\WP_Error('http_error_' . $statusCode, $message, ['status' => $statusCode]);
        }

        return $data;
    }
}
""",

    'config/Constants.php': """<?php
namespace SeoOptAgent\\Config;

class Constants {
    public function __construct($pluginFile) {
        if (!defined('SEO_OPT_AGENT_VERSION')) {
            define('SEO_OPT_AGENT_VERSION', '1.0.0');
        }
        if (!defined('SEO_OPT_AGENT_PATH')) {
            define('SEO_OPT_AGENT_PATH', plugin_dir_path($pluginFile));
        }
        if (!defined('SEO_OPT_AGENT_URL')) {
            define('SEO_OPT_AGENT_URL', plugin_dir_url($pluginFile));
        }
    }
}
""",

    'repository/SettingsRepository.php': """<?php
namespace SeoOptAgent\\Repository;

class SettingsRepository {
    public function getBackendUrl() {
        return get_option('seo_opt_backend_url', '');
    }

    public function getApiKey() {
        // Fallback or handle masked keys safely on save
        // If the saved option is masked (contains *), it wasn't updated properly, but we prevent saving masked strings in JS/PHP if possible.
        // The password field in WP options API will overwrite if not handled, so we should hook into pre_update_option if needed.
        return get_option('seo_opt_api_key', '');
    }

    public function getPluginUuid() {
        return get_option('seo_opt_plugin_uuid', '');
    }

    public function updatePluginUuid($uuid) {
        update_option('seo_opt_plugin_uuid', $uuid);
    }

    public function getPluginVersion() {
        return get_option('seo_opt_plugin_version', '');
    }

    public function updatePluginVersion($version) {
        update_option('seo_opt_plugin_version', $version);
    }

    public function getConnectionStatus() {
        return get_option('seo_opt_connection_status', 'Never Connected');
    }

    public function updateConnectionStatus($status) {
        update_option('seo_opt_connection_status', $status);
    }

    public function getLastSuccessfulConnection() {
        return get_option('seo_opt_last_success', '');
    }

    public function updateLastSuccessfulConnection($timestamp) {
        update_option('seo_opt_last_success', $timestamp);
    }

    public function getLastConnectionError() {
        return get_option('seo_opt_last_error', '');
    }

    public function updateLastConnectionError($error) {
        update_option('seo_opt_last_error', $error);
    }

    public function updateInstallationTimestamp($timestamp) {
        if (!get_option('seo_opt_installed_at')) {
            update_option('seo_opt_installed_at', $timestamp);
        }
    }
}
""",

    'services/ConnectionService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Api\\BackendClient;
use SeoOptAgent\\Repository\\SettingsRepository;
use SeoOptAgent\\Services\\HealthService;

class ConnectionService {
    private $client;
    private $settings;
    private $health;

    public function __construct(BackendClient $client, SettingsRepository $settings, HealthService $health) {
        $this->client = $client;
        $this->settings = $settings;
        $this->health = $health;
    }

    public function testConnection() {
        $response = $this->client->get('/status');

        if (is_wp_error($response)) {
            $errorCode = $response->get_error_code();
            $errorMessage = $response->get_error_message();
            
            $status = $this->health->determineErrorStatus($errorCode);
            
            $this->settings->updateConnectionStatus($status);
            $this->settings->updateLastConnectionError($errorMessage);
            
            return ['success' => false, 'message' => $errorMessage];
        }

        if (isset($response['success']) && $response['success'] === true) {
            $this->settings->updateConnectionStatus('Connected');
            $this->settings->updateLastSuccessfulConnection(time());
            $this->settings->updateLastConnectionError('');
            return ['success' => true];
        }

        $this->settings->updateConnectionStatus('Backend Unreachable');
        $this->settings->updateLastConnectionError('Invalid response format');
        return ['success' => false, 'message' => 'Invalid response format from backend'];
    }
}
""",

    'services/HealthService.php': """<?php
namespace SeoOptAgent\\Services;

use SeoOptAgent\\Repository\\SettingsRepository;

class HealthService {
    private $settings;

    public function __construct(SettingsRepository $settings) {
        $this->settings = $settings;
    }

    public function determineErrorStatus($errorCode) {
        if ($errorCode === 'config_missing') {
            return 'Configuration Missing';
        }
        if ($errorCode === 'http_error_401' || $errorCode === 'http_error_403') {
            return 'Authentication Failed';
        }
        if (strpos($errorCode, 'http_error_') !== false) {
            return 'Backend Unreachable';
        }
        return 'Disconnected';
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
    public function log($level, $message, array $context = []);
}
""",

    'assets/js/admin.js': """
jQuery(document).ready(function($) {
    $('#seo-opt-test-connection').on('click', function(e) {
        e.preventDefault();
        var $btn = $(this);
        var originalText = $btn.text();
        
        $btn.text(seoOptAgentObj.saving_text).prop('disabled', true);
        $('#seo-opt-notices-container').html('');
        
        $.post(seoOptAgentObj.ajax_url, {
            action: 'seo_opt_test_connection',
            nonce: seoOptAgentObj.nonce
        }, function(response) {
            var noticeClass = response.success ? 'notice-success' : 'notice-error';
            var html = '<div class="notice ' + noticeClass + ' is-dismissible"><p>' + response.data.message + '</p></div>';
            $('#seo-opt-notices-container').html(html);
            
            // Update UI elements
            $('#seo-opt-status-text').text(response.data.status);
            if (response.success) {
                $('#seo-opt-last-success').text(response.data.last_success);
                $('#seo-opt-last-error').text('None').css('color', 'inherit');
            } else {
                $('#seo-opt-last-error').text(response.data.last_error || 'Unknown Error').css('color', '#d63638');
            }
        }).fail(function() {
            $('#seo-opt-notices-container').html('<div class="notice notice-error is-dismissible"><p>Network error occurred.</p></div>');
        }).always(function() {
            $btn.text(originalText).prop('disabled', false);
        });
    });

    // Prevent saving masked password
    $('form').on('submit', function() {
        var $apiKey = $('#seo_opt_api_key');
        if ($apiKey.val().indexOf('****') !== -1) {
            $apiKey.prop('disabled', true); // Prevent sending masked value
        }
    });
});
""",

    'assets/css/admin.css': """
/* Minimal CSS for Admin */
#seo-opt-notices-container {
    margin-bottom: 20px;
}
""",

    'uninstall.php': """<?php
// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

delete_option( 'seo_opt_backend_url' );
delete_option( 'seo_opt_api_key' );
delete_option( 'seo_opt_plugin_uuid' );
delete_option( 'seo_opt_plugin_version' );
delete_option( 'seo_opt_connection_status' );
delete_option( 'seo_opt_last_success' );
delete_option( 'seo_opt_last_error' );
delete_option( 'seo_opt_installed_at' );
""",

    'readme.txt': """=== SEO Optimization Platform Agent ===
Contributors: SEO Optimization Team
Requires at least: 5.8
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

Connects WordPress securely to the SEO Optimization Platform backend for AI-driven content audits and rewrites.
"""
}

for filepath, content in files.items():
    full_path = os.path.join(base_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w') as f:
        f.write(content.strip() + '\\n')
print("Successfully generated plugin scaffold.")
