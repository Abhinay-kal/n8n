<?php
namespace SeoOptAgent\Bootstrap;

use SeoOptAgent\Config\Constants;
use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Models\PluginMetadata;

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
}\n