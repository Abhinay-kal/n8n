<?php
namespace SeoOptAgent\Bootstrap;

use SeoOptAgent\Config\Constants;
use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Models\PluginIdentity;

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
}\n