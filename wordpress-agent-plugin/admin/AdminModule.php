<?php
namespace SeoOptAgent\Admin;

use SeoOptAgent\Bootstrap\ModuleInterface;
use SeoOptAgent\Bootstrap\Loader;
use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Services\RegistrationService;

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
}\n