<?php
namespace SeoOptAgent\Admin;

use SeoOptAgent\Bootstrap\ModuleInterface;
use SeoOptAgent\Bootstrap\Loader;
use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Services\ConnectionService;

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
}\n