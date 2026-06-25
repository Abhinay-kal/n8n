<?php
namespace SeoOptAgent\Bootstrap;

use SeoOptAgent\Admin\AdminModule;
use SeoOptAgent\Admin\Notices;
use SeoOptAgent\Api\HttpClient;
use SeoOptAgent\Api\BackendClient;
use SeoOptAgent\Repository\SettingsRepository;
use SeoOptAgent\Services\ConfigService;
use SeoOptAgent\Services\RegistrationService;
use SeoOptAgent\Utils\NullLogger;

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
}\n