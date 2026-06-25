<?php
namespace SeoOptAgent\Admin;

use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Services\ConnectionService;
use SeoOptAgent\Security\Nonce;
use SeoOptAgent\Security\Permissions;

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
}\n