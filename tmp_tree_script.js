<script src="https://d3js.org/d3.v7.min.js"></script>
<script>
    const initialJsonData = {"name":"/","total_count":601,"children":[{"name":".agents","total_count":6,"children":[{"name":"rules","total_count":4,"children":[{"name":"graphify.md","total_count":4,"children":[{"name":"Graphify CLI","total_count":1,"children":[]},{"name":"Graphify MCP","total_count":1,"children":[]},{"name":"Graphify Rules","total_count":1,"children":[]},{"name":"graphify-out/","total_count":1,"children":[]}]}]},{"name":"workflows","total_count":2,"children":[{"name":"graphify.md","total_count":2,"children":[{"name":"Graphify Skill Definition","total_count":1,"children":[]},{"name":"Graphify Workflow","total_count":1,"children":[]}]}]}]},{"name":".github","total_count":1,"children":[{"name":"workflows","total_count":1,"children":[{"name":"playwright.yml","total_count":1,"children":[{"name":"Playwright Tests Workflow","total_count":1,"children":[]}]}]}]},{"name":"archive","total_count":21,"children":[{"name":"failure-1780488085427.png","total_count":4,"children":[{"name":"Claude Free Plan","total_count":1,"children":[]},{"name":"Claude Landing Page","total_count":1,"children":[]},{"name":"Claude Max Plan","total_count":1,"children":[]},{"name":"Claude Pro Plan","total_count":1,"children":[]}]},{"name":"failure-1780488313707.png","total_count":4,"children":[{"name":"Claude","total_count":1,"children":[]},{"name":"Free Plan","total_count":1,"children":[]},{"name":"Max Plan","total_count":1,"children":[]},{"name":"Pro Plan","total_count":1,"children":[]}]},{"name":"failure-1780488984322.png","total_count":2,"children":[{"name":"Claude Interface","total_count":1,"children":[]},{"name":"Sonnet 4.6 Medium","total_count":1,"children":[]}]},{"name":"failure-1780489161255.png","total_count":5,"children":[{"name":"Handling Ambiguity","total_count":1,"children":[]},{"name":"Impact vs Output","total_count":1,"children":[]},{"name":"Junior Engineer","total_count":1,"children":[]},{"name":"Scope of Thinking","total_count":1,"children":[]},{"name":"Senior Engineer","total_count":1,"children":[]}]},{"name":"failure-1780489233782.png","total_count":5,"children":[{"name":"Junior Engineer","total_count":1,"children":[]},{"name":"Ownership & influence","total_count":1,"children":[]},{"name":"Problem-solving approach","total_count":1,"children":[]},{"name":"Scope of thinking","total_count":1,"children":[]},{"name":"Senior Engineer","total_count":1,"children":[]}]},{"name":"snapshot_assistant.png","total_count":1,"children":[{"name":"Snapshot Assistant Image","total_count":1,"children":[]}]}]},{"name":"backup.sh","total_count":1,"children":[{"name":"backup.sh script","total_count":1,"children":[]}]},{"name":"claude_response.txt","total_count":1,"children":[{"name":"Claude SEO Response","total_count":1,"children":[]}]},{"name":"DEPLOYMENT_COMMANDS.md","total_count":1,"children":[{"name":"Deployment Commands","total_count":1,"children":[]}]},{"name":"DEPLOYMENT_STAGING.md","total_count":1,"children":[{"name":"Staging Deployment Design","total_count":1,"children":[]}]},{"name":"docs","total_count":1,"children":[{"name":"EXECUTION_LIFECYCLE.md","total_count":1,"children":[{"name":"Project Execution Lifecycle","total_count":1,"children":[]}]}]},{"name":"e2e","total_count":3,"children":[{"name":"workflow.spec.js","total_count":2,"children":[{"name":"path","total_count":1,"children":[]},{"name":"{ test, expect }","total_count":1,"children":[]}]},{"name":"example.spec.js","total_count":1,"children":[]}]},{"name":"healthcheck.sh","total_count":1,"children":[{"name":"healthcheck.sh script","total_count":1,"children":[]}]},{"name":"install.sh","total_count":1,"children":[{"name":"install.sh script","total_count":1,"children":[]}]},{"name":"latest_chat.png","total_count":3,"children":[{"name":"E-E-A-T score","total_count":1,"children":[]},{"name":"SEO audit of WordPress article","total_count":1,"children":[]},{"name":"YMYL","total_count":1,"children":[]}]},{"name":"logs","total_count":1,"children":[{"name":"claude-ui-change-2026-06-12T09-45-34-202Z.png","total_count":1,"children":[{"name":"Claude UI Change Screenshot","total_count":1,"children":[]}]}]},{"name":"package.json","total_count":21,"children":[{"name":"@playwright/test","total_count":1,"children":[]},{"name":"@types/node","total_count":1,"children":[]},{"name":"author","total_count":1,"children":[]},{"name":"better-sqlite3","total_count":1,"children":[]},{"name":"dependencies","total_count":1,"children":[]},{"name":"description","total_count":1,"children":[]},{"name":"devDependencies","total_count":1,"children":[]},{"name":"dotenv","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]},{"name":"jest","total_count":1,"children":[]},{"name":"keywords","total_count":1,"children":[]},{"name":"legacy-start","total_count":1,"children":[]},{"name":"license","total_count":1,"children":[]},{"name":"main","total_count":1,"children":[]},{"name":"name","total_count":1,"children":[]},{"name":"playwright","total_count":1,"children":[]},{"name":"scripts","total_count":1,"children":[]},{"name":"start","total_count":1,"children":[]},{"name":"test","total_count":1,"children":[]},{"name":"type","total_count":1,"children":[]},{"name":"version","total_count":1,"children":[]}]},{"name":"PRODUCTION_LAUNCH_CHECKLIST.md","total_count":1,"children":[{"name":"Production Launch Checklist","total_count":1,"children":[]}]},{"name":"prompts","total_count":1,"children":[{"name":"input.txt","total_count":1,"children":[{"name":"SEO Audit Prompt","total_count":1,"children":[]}]}]},{"name":"README.md","total_count":2,"children":[{"name":"Claude Worker Foundation","total_count":1,"children":[]},{"name":"Persistent Job System","total_count":1,"children":[]}]},{"name":"restart.sh","total_count":1,"children":[{"name":"restart.sh script","total_count":1,"children":[]}]},{"name":"restore.sh","total_count":1,"children":[{"name":"restore.sh script","total_count":1,"children":[]}]},{"name":"scripts","total_count":59,"children":[{"name":"add_job.js","total_count":5,"children":[{"name":"addJob()","total_count":1,"children":[]},{"name":"Database","total_count":1,"children":[]},{"name":"db","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]}]},{"name":"autonomous_run.js","total_count":5,"children":[{"name":"Database","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"runPipeline()","total_count":1,"children":[]},{"name":"{ spawn }","total_count":1,"children":[]}]},{"name":"check_config.js","total_count":2,"children":[{"name":"config","total_count":1,"children":[]},{"name":"{ loadConfig }","total_count":1,"children":[]}]},{"name":"claude.js","total_count":8,"children":[{"name":"getSingletonWorker()","total_count":1,"children":[]},{"name":"runClaude()","total_count":1,"children":[]},{"name":"{ BrowserManager }","total_count":1,"children":[]},{"name":"{ ClaudeWorker }","total_count":1,"children":[]},{"name":"{ createLogger }","total_count":1,"children":[]},{"name":"{ loadConfig }","total_count":1,"children":[]},{"name":"{ PersistentWorkerState: WorkerState }","total_count":1,"children":[]},{"name":"{ SessionMonitor }","total_count":1,"children":[]}]},{"name":"debug_claude.js","total_count":3,"children":[{"name":"debugClaude()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"debug_claude_v2.js","total_count":4,"children":[{"name":"debugClaude()","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"inspect_chat.js","total_count":4,"children":[{"name":"fs","total_count":1,"children":[]},{"name":"main()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"inspect_dom.js","total_count":5,"children":[{"name":"fs","total_count":1,"children":[]},{"name":"main()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"SELECTORS","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"inspect_full.js","total_count":3,"children":[{"name":"main()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"inspect_parent.js","total_count":3,"children":[{"name":"main()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"legacy_server.js","total_count":1,"children":[{"name":"{ startServer }","total_count":1,"children":[]}]},{"name":"test_clipboard.js","total_count":4,"children":[{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"testTyping()","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"test_input_selectors.js","total_count":3,"children":[{"name":"path","total_count":1,"children":[]},{"name":"snapshot()","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"test_selectors.js","total_count":3,"children":[{"name":"path","total_count":1,"children":[]},{"name":"snapshot()","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"test_selectors_headless.js","total_count":3,"children":[{"name":"path","total_count":1,"children":[]},{"name":"snapshot()","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]}]},{"name":"test_whitespace.js","total_count":3,"children":[{"name":"actualText","total_count":1,"children":[]},{"name":"expectedPrefix","total_count":1,"children":[]},{"name":"normalizeWhitespace()","total_count":1,"children":[]}]}]},{"name":"SOAK_TEST_PLAN.md","total_count":1,"children":[{"name":"14-Day Soak Test Plan","total_count":1,"children":[]}]},{"name":"src","total_count":455,"children":[{"name":"api","total_count":16,"children":[{"name":"auditRoutes.js","total_count":2,"children":[{"name":"createAuditRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"jobRoutes.js","total_count":2,"children":[{"name":"createJobRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"projectRoutes.js","total_count":2,"children":[{"name":"createProjectRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"publishingRoutes.js","total_count":2,"children":[{"name":"createPublishingRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"rewriteRoutes.js","total_count":2,"children":[{"name":"createRewriteRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"siteRoutes.js","total_count":2,"children":[{"name":"createSiteRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"statusRoutes.js","total_count":2,"children":[{"name":"createStatusRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"wordpressRoutes.js","total_count":2,"children":[{"name":"createWordPressRoutes()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]}]},{"name":"bootstrap","total_count":50,"children":[{"name":"BootstrapManager.js","total_count":40,"children":[{"name":"._printHeader()","total_count":1,"children":[]},{"name":"._reportFailures()","total_count":1,"children":[]},{"name":"._runPhase1()","total_count":1,"children":[]},{"name":"._runPhase2()","total_count":1,"children":[]},{"name":"._runPhase3()","total_count":1,"children":[]},{"name":"._runPhase3_5()","total_count":1,"children":[]},{"name":"._runPhase4()","total_count":1,"children":[]},{"name":"._verifyReadiness()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".run()","total_count":1,"children":[]},{"name":"BootstrapManager","total_count":1,"children":[]},{"name":"DatabaseConnection","total_count":1,"children":[]},{"name":"JobService","total_count":1,"children":[]},{"name":"Migrations","total_count":1,"children":[]},{"name":"PublishingService","total_count":1,"children":[]},{"name":"SyncService","total_count":1,"children":[]},{"name":"{ BrowserManager }","total_count":1,"children":[]},{"name":"{ BrowserRecovery }","total_count":1,"children":[]},{"name":"{ ClaudeHealthCheck }","total_count":1,"children":[]},{"name":"{ ClaudeManager }","total_count":1,"children":[]},{"name":"{ ClaudeWorker }","total_count":1,"children":[]},{"name":"{ createLogger }","total_count":1,"children":[]},{"name":"{ DashboardService }","total_count":1,"children":[]},{"name":"{ JobRepository }","total_count":1,"children":[]},{"name":"{ loadConfig }","total_count":1,"children":[]},{"name":"{ LogRepository, EventRepository }","total_count":1,"children":[]},{"name":"{ MetricsService }","total_count":1,"children":[]},{"name":"{ PreFlightValidator }","total_count":1,"children":[]},{"name":"{ ProjectRepository }","total_count":1,"children":[]},{"name":"{ ProjectService }","total_count":1,"children":[]},{"name":"{ PublishingRepository }","total_count":1,"children":[]},{"name":"{ QueueService }","total_count":1,"children":[]},{"name":"{ RecoveryManager }","total_count":1,"children":[]},{"name":"{ SessionDetector }","total_count":1,"children":[]},{"name":"{ SessionMonitor }","total_count":1,"children":[]},{"name":"{ SessionRecovery }","total_count":1,"children":[]},{"name":"{ SiteRepository }","total_count":1,"children":[]},{"name":"{ SiteService }","total_count":1,"children":[]},{"name":"{ StateMachine }","total_count":1,"children":[]},{"name":"{ WordPressRepository }","total_count":1,"children":[]}]},{"name":"PreFlightValidator.js","total_count":10,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".ensureDirectories()","total_count":1,"children":[]},{"name":".getActions()","total_count":1,"children":[]},{"name":".getErrors()","total_count":1,"children":[]},{"name":".validateConfig()","total_count":1,"children":[]},{"name":".validateEnv()","total_count":1,"children":[]},{"name":".validateProfile()","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"PreFlightValidator","total_count":1,"children":[]}]}]},{"name":"browser","total_count":3,"children":[{"name":"BrowserRecovery.js","total_count":3,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".recover()","total_count":1,"children":[]},{"name":"BrowserRecovery","total_count":1,"children":[]}]}]},{"name":"config","total_count":7,"children":[{"name":"config.js","total_count":5,"children":[{"name":"fs","total_count":1,"children":[]},{"name":"loadConfig()","total_count":1,"children":[]},{"name":"parseBoolean()","total_count":1,"children":[]},{"name":"parseInteger()","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]}]},{"name":"security.js","total_count":2,"children":[{"name":"loadSecurityConfig()","total_count":1,"children":[]},{"name":"{ parseInteger }","total_count":1,"children":[]}]}]},{"name":"db","total_count":11,"children":[{"name":"database.js","total_count":8,"children":[{"name":".close()","total_count":1,"children":[]},{"name":".connect()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".get()","total_count":1,"children":[]},{"name":"Database","total_count":1,"children":[]},{"name":"DatabaseConnection","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]}]},{"name":"migrations.js","total_count":3,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".run()","total_count":1,"children":[]},{"name":"Migrations","total_count":1,"children":[]}]}]},{"name":"errors","total_count":18,"children":[{"name":"ClaudeErrors.js","total_count":18,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":"BrowserError","total_count":1,"children":[]},{"name":"ClaudeError","total_count":1,"children":[]},{"name":"ContentUnavailableError","total_count":1,"children":[]},{"name":"createClaudeError()","total_count":1,"children":[]},{"name":"InvalidProjectContentError","total_count":1,"children":[]},{"name":"InvalidResponseQualityError","total_count":1,"children":[]},{"name":"normalizeError()","total_count":1,"children":[]},{"name":"ProfileLockError","total_count":1,"children":[]},{"name":"RecoveryReport","total_count":1,"children":[]},{"name":"ValidationError","total_count":1,"children":[]}]}]},{"name":"index.js","total_count":3,"children":[{"name":"main()","total_count":1,"children":[]},{"name":"{ BootstrapManager }","total_count":1,"children":[]},{"name":"{ createApp }","total_count":1,"children":[]}]},{"name":"middleware","total_count":5,"children":[{"name":"auth.js","total_count":2,"children":[{"name":"createAuthMiddleware()","total_count":1,"children":[]},{"name":"crypto","total_count":1,"children":[]}]},{"name":"rateLimiter.js","total_count":1,"children":[{"name":"createRateLimiter()","total_count":1,"children":[]}]},{"name":"secureHeaders.js","total_count":1,"children":[{"name":"secureHeaders()","total_count":1,"children":[]}]},{"name":"validation.js","total_count":1,"children":[{"name":"validateRewriteRequest()","total_count":1,"children":[]}]}]},{"name":"models","total_count":17,"children":[{"name":"ContentProject.js","total_count":5,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".isValidTransition()","total_count":1,"children":[]},{"name":"ContentProject","total_count":1,"children":[]},{"name":"PROJECT_STATUSES","total_count":1,"children":[]},{"name":"VALID_PROJECT_TRANSITIONS","total_count":1,"children":[]}]},{"name":"Site.js","total_count":3,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".toJSON()","total_count":1,"children":[]},{"name":"Site","total_count":1,"children":[]}]},{"name":"WorkerState.js","total_count":9,"children":[{"name":"._loadInitialState()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".getSnapshot()","total_count":1,"children":[]},{"name":".getState()","total_count":1,"children":[]},{"name":".incrementRecoveryAttempts()","total_count":1,"children":[]},{"name":".resetRecoveryAttempts()","total_count":1,"children":[]},{"name":".setState()","total_count":1,"children":[]},{"name":"PersistentWorkerState","total_count":1,"children":[]},{"name":"WORKER_STATES","total_count":1,"children":[]}]}]},{"name":"monitor","total_count":23,"children":[{"name":"RecoveryManager.js","total_count":7,"children":[{"name":"._recoverFromCaptcha()","total_count":1,"children":[]},{"name":"._recoverFromNetwork()","total_count":1,"children":[]},{"name":"._recoverFromRateLimit()","total_count":1,"children":[]},{"name":"._sleep()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".executeRecovery()","total_count":1,"children":[]},{"name":"RecoveryManager","total_count":1,"children":[]}]},{"name":"SessionMonitor.js","total_count":6,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".getStatus()","total_count":1,"children":[]},{"name":".runHealthCheck()","total_count":1,"children":[]},{"name":".start()","total_count":1,"children":[]},{"name":".stop()","total_count":1,"children":[]},{"name":"SessionMonitor","total_count":1,"children":[]}]},{"name":"StateMachine.js","total_count":10,"children":[{"name":"._persistState()","total_count":1,"children":[]},{"name":"._recordTransition()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".getHistory()","total_count":1,"children":[]},{"name":".getState()","total_count":1,"children":[]},{"name":".resetToStarting()","total_count":1,"children":[]},{"name":".syncWithDatabase()","total_count":1,"children":[]},{"name":".transition()","total_count":1,"children":[]},{"name":"ALLOWED_TRANSITIONS","total_count":1,"children":[]},{"name":"StateMachine","total_count":1,"children":[]}]}]},{"name":"repositories","total_count":75,"children":[{"name":"JobRepository.js","total_count":19,"children":[{"name":"._updateStatus()","total_count":1,"children":[]},{"name":"._validateStatus()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".createJob()","total_count":1,"children":[]},{"name":".deleteJob()","total_count":1,"children":[]},{"name":".getJobById()","total_count":1,"children":[]},{"name":".getJobsByProjectId()","total_count":1,"children":[]},{"name":".getJobsBySiteId()","total_count":1,"children":[]},{"name":".getPendingJobs()","total_count":1,"children":[]},{"name":".getQueueStats()","total_count":1,"children":[]},{"name":".getQueueSummary()","total_count":1,"children":[]},{"name":".getSiteQueue()","total_count":1,"children":[]},{"name":".markCompleted()","total_count":1,"children":[]},{"name":".markFailed()","total_count":1,"children":[]},{"name":".markProcessing()","total_count":1,"children":[]},{"name":".recoverProcessingJobs()","total_count":1,"children":[]},{"name":".updateTimestamp()","total_count":1,"children":[]},{"name":"JobRepository","total_count":1,"children":[]},{"name":"VALID_STATUSES","total_count":1,"children":[]}]},{"name":"LogRepository.js","total_count":9,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".createEvent()","total_count":1,"children":[]},{"name":".createExecutionLog()","total_count":1,"children":[]},{"name":".getEventsByProjectId()","total_count":1,"children":[]},{"name":".getLogsByJobId()","total_count":1,"children":[]},{"name":".getLogsByProjectId()","total_count":1,"children":[]},{"name":"EventRepository","total_count":1,"children":[]},{"name":"LogRepository","total_count":1,"children":[]}]},{"name":"ProjectRepository.js","total_count":17,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".createAudit()","total_count":1,"children":[]},{"name":".createProject()","total_count":1,"children":[]},{"name":".createRewrite()","total_count":1,"children":[]},{"name":".createVersion()","total_count":1,"children":[]},{"name":".getAuditById()","total_count":1,"children":[]},{"name":".getAuditsByProjectId()","total_count":1,"children":[]},{"name":".getLatestVersion()","total_count":1,"children":[]},{"name":".getProjectById()","total_count":1,"children":[]},{"name":".getProjectByWpPostId()","total_count":1,"children":[]},{"name":".getProjectsByStatus()","total_count":1,"children":[]},{"name":".getRewriteById()","total_count":1,"children":[]},{"name":".getRewritesByProjectId()","total_count":1,"children":[]},{"name":".getVersionsByProjectId()","total_count":1,"children":[]},{"name":".updateStatus()","total_count":1,"children":[]},{"name":"ProjectRepository","total_count":1,"children":[]},{"name":"{ ContentProject, PROJECT_STATUSES }","total_count":1,"children":[]}]},{"name":"PublishingRepository.js","total_count":5,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".createPublishedDraft()","total_count":1,"children":[]},{"name":".getPublishedDraftById()","total_count":1,"children":[]},{"name":".getPublishedDraftsByProjectId()","total_count":1,"children":[]},{"name":"PublishingRepository","total_count":1,"children":[]}]},{"name":"SiteRepository.js","total_count":12,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".createSite()","total_count":1,"children":[]},{"name":".deleteSite()","total_count":1,"children":[]},{"name":".disableSite()","total_count":1,"children":[]},{"name":".getAllSites()","total_count":1,"children":[]},{"name":".getSiteByDomain()","total_count":1,"children":[]},{"name":".getSiteById()","total_count":1,"children":[]},{"name":".getSiteSettings()","total_count":1,"children":[]},{"name":".updateSite()","total_count":1,"children":[]},{"name":".updateSiteSettings()","total_count":1,"children":[]},{"name":"SiteRepository","total_count":1,"children":[]},{"name":"{ Site }","total_count":1,"children":[]}]},{"name":"WordPressRepository.js","total_count":13,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".getAuthorsBySiteId()","total_count":1,"children":[]},{"name":".getCategoriesBySiteId()","total_count":1,"children":[]},{"name":".getPostByWpId()","total_count":1,"children":[]},{"name":".getPostsBySiteId()","total_count":1,"children":[]},{"name":".getTagsBySiteId()","total_count":1,"children":[]},{"name":".startSyncRun()","total_count":1,"children":[]},{"name":".updateSyncRun()","total_count":1,"children":[]},{"name":".upsertAuthor()","total_count":1,"children":[]},{"name":".upsertCategory()","total_count":1,"children":[]},{"name":".upsertPost()","total_count":1,"children":[]},{"name":".upsertTag()","total_count":1,"children":[]},{"name":"WordPressRepository","total_count":1,"children":[]}]}]},{"name":"routes","total_count":8,"children":[{"name":"health.js","total_count":2,"children":[{"name":"createHealthRouter()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"queue.js","total_count":2,"children":[{"name":"createQueueRouter()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"rewrite.js","total_count":2,"children":[{"name":"createRewriteRouter()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]},{"name":"status.js","total_count":2,"children":[{"name":"createStatusRouter()","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]}]}]},{"name":"server.js","total_count":16,"children":[{"name":"createApp()","total_count":1,"children":[]},{"name":"createQueueRouter","total_count":1,"children":[]},{"name":"express","total_count":1,"children":[]},{"name":"{ createAuditRoutes }","total_count":1,"children":[]},{"name":"{ createAuthMiddleware }","total_count":1,"children":[]},{"name":"{ createJobRoutes }","total_count":1,"children":[]},{"name":"{ createProjectRoutes }","total_count":1,"children":[]},{"name":"{ createPublishingRoutes }","total_count":1,"children":[]},{"name":"{ createRateLimiter }","total_count":1,"children":[]},{"name":"{ createRewriteRoutes }","total_count":1,"children":[]},{"name":"{ createSiteRoutes }","total_count":1,"children":[]},{"name":"{ createStatusRoutes }","total_count":1,"children":[]},{"name":"{ createWordPressRoutes }","total_count":1,"children":[]},{"name":"{ loadSecurityConfig }","total_count":1,"children":[]},{"name":"{ secureHeaders }","total_count":1,"children":[]},{"name":"{ validateRewriteRequest }","total_count":1,"children":[]}]},{"name":"services","total_count":168,"children":[{"name":"BrowserManager.js","total_count":18,"children":[{"name":"._attachSinglePage()","total_count":1,"children":[]},{"name":"._closeDuplicatePages()","total_count":1,"children":[]},{"name":"._initializeInternal()","total_count":1,"children":[]},{"name":"._launchContext()","total_count":1,"children":[]},{"name":"._markPage()","total_count":1,"children":[]},{"name":"._pages()","total_count":1,"children":[]},{"name":"._restartInternal()","total_count":1,"children":[]},{"name":"._sleep()","total_count":1,"children":[]},{"name":".close()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".getPage()","total_count":1,"children":[]},{"name":".initialize()","total_count":1,"children":[]},{"name":".isHealthy()","total_count":1,"children":[]},{"name":".restart()","total_count":1,"children":[]},{"name":"BrowserManager","total_count":1,"children":[]},{"name":"{ BrowserError, ProfileLockError }","total_count":1,"children":[]},{"name":"{ chromium }","total_count":1,"children":[]},{"name":"{ WORKER_STATES }","total_count":1,"children":[]}]},{"name":"ClaudeManager.js","total_count":35,"children":[{"name":"._attemptSubmit()","total_count":1,"children":[]},{"name":"._captureDiagnostics()","total_count":1,"children":[]},{"name":"._containsMeaningfulContent()","total_count":1,"children":[]},{"name":"._ensureClaudeHome()","total_count":1,"children":[]},{"name":"._extractChatId()","total_count":1,"children":[]},{"name":"._focusAndClearInput()","total_count":1,"children":[]},{"name":"._getLatestAssistantContent()","total_count":1,"children":[]},{"name":"._getLatestAssistantText()","total_count":1,"children":[]},{"name":"._getPageSnapshot()","total_count":1,"children":[]},{"name":"._isInputReady()","total_count":1,"children":[]},{"name":"._isRetryable()","total_count":1,"children":[]},{"name":"._readInputValue()","total_count":1,"children":[]},{"name":"._readResponseState()","total_count":1,"children":[]},{"name":"._sendPromptOnce()","total_count":1,"children":[]},{"name":"._sleep()","total_count":1,"children":[]},{"name":"._submissionStarted()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".detectCompletion()","total_count":1,"children":[]},{"name":".detectErrors()","total_count":1,"children":[]},{"name":".ensureHealthy()","total_count":1,"children":[]},{"name":".findFirstAvailable()","total_count":1,"children":[]},{"name":".getStatus()","total_count":1,"children":[]},{"name":".initialize()","total_count":1,"children":[]},{"name":".recover()","total_count":1,"children":[]},{"name":".retry()","total_count":1,"children":[]},{"name":".SELECTORS_MATCH()","total_count":1,"children":[]},{"name":".sendPrompt()","total_count":1,"children":[]},{"name":".validateResponse()","total_count":1,"children":[]},{"name":".waitForResponse()","total_count":1,"children":[]},{"name":"ClaudeManager","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"SELECTORS","total_count":1,"children":[]},{"name":"{ \n    ValidationError, \n    RecoveryReport, \n    InvalidProjectContentError, \n    InvalidResponseQualityError, \n    createClaudeError, \n    normalizeError \n}","total_count":1,"children":[]},{"name":"{ WORKER_STATES }","total_count":1,"children":[]}]},{"name":"ClaudeWorker.js","total_count":22,"children":[{"name":"._processPendingJobs()","total_count":1,"children":[]},{"name":"._recordJobChat()","total_count":1,"children":[]},{"name":"._resetWorkerState()","total_count":1,"children":[]},{"name":"._saveResponse()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".executeJob()","total_count":1,"children":[]},{"name":".getQueueSize()","total_count":1,"children":[]},{"name":".getStatusSnapshot()","total_count":1,"children":[]},{"name":".initialize()","total_count":1,"children":[]},{"name":".isHealthy()","total_count":1,"children":[]},{"name":".rewrite()","total_count":1,"children":[]},{"name":".startProcessing()","total_count":1,"children":[]},{"name":".stopProcessing()","total_count":1,"children":[]},{"name":"AuditPromptBuilder","total_count":1,"children":[]},{"name":"ClaudeWorker","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"RewritePromptBuilder","total_count":1,"children":[]},{"name":"{ ContentUnavailableError, InvalidProjectContentError }","total_count":1,"children":[]},{"name":"{ FailureClassifier }","total_count":1,"children":[]},{"name":"{ PROJECT_STATUSES }","total_count":1,"children":[]},{"name":"{ WORKER_STATES }","total_count":1,"children":[]}]},{"name":"DashboardService.js","total_count":9,"children":[{"name":"._calculateSuccessRate()","total_count":1,"children":[]},{"name":"._check()","total_count":1,"children":[]},{"name":"._colorizeState()","total_count":1,"children":[]},{"name":"._formatUptime()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".draw()","total_count":1,"children":[]},{"name":".start()","total_count":1,"children":[]},{"name":".stop()","total_count":1,"children":[]},{"name":"DashboardService","total_count":1,"children":[]}]},{"name":"JobService.js","total_count":14,"children":[{"name":".completeJob()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".createJob()","total_count":1,"children":[]},{"name":".failJob()","total_count":1,"children":[]},{"name":".getJobById()","total_count":1,"children":[]},{"name":".getJobsBySiteId()","total_count":1,"children":[]},{"name":".getPendingJobs()","total_count":1,"children":[]},{"name":".getQueueStats()","total_count":1,"children":[]},{"name":".getQueueSummary()","total_count":1,"children":[]},{"name":".getSiteQueue()","total_count":1,"children":[]},{"name":".recoverInterruptedJobs()","total_count":1,"children":[]},{"name":".startJob()","total_count":1,"children":[]},{"name":"JobService","total_count":1,"children":[]},{"name":"{ PROJECT_STATUSES }","total_count":1,"children":[]}]},{"name":"MetricsService.js","total_count":11,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".getSnapshot()","total_count":1,"children":[]},{"name":".recordIncident()","total_count":1,"children":[]},{"name":".recordJobCompletion()","total_count":1,"children":[]},{"name":".recordJobFailure()","total_count":1,"children":[]},{"name":".recordRecovery()","total_count":1,"children":[]},{"name":".shutdown()","total_count":1,"children":[]},{"name":".start()","total_count":1,"children":[]},{"name":".stop()","total_count":1,"children":[]},{"name":".updateState()","total_count":1,"children":[]},{"name":"MetricsService","total_count":1,"children":[]}]},{"name":"ProjectService.js","total_count":14,"children":[{"name":".completeAudit()","total_count":1,"children":[]},{"name":".completeRewrite()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".getLatestAuditByProjectId()","total_count":1,"children":[]},{"name":".getPostByProjectId()","total_count":1,"children":[]},{"name":".getProjectDetails()","total_count":1,"children":[]},{"name":".getProjectHistory()","total_count":1,"children":[]},{"name":".reconcileProjectStates()","total_count":1,"children":[]},{"name":".recordEvent()","total_count":1,"children":[]},{"name":".updateProjectStatus()","total_count":1,"children":[]},{"name":"AuditParser","total_count":1,"children":[]},{"name":"DiffTracker","total_count":1,"children":[]},{"name":"ProjectService","total_count":1,"children":[]},{"name":"{ PROJECT_STATUSES }","total_count":1,"children":[]}]},{"name":"PublishingService.js","total_count":6,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".getPublishingHistory()","total_count":1,"children":[]},{"name":".publishToWordPress()","total_count":1,"children":[]},{"name":"PublishingService","total_count":1,"children":[]},{"name":"WordPressClient","total_count":1,"children":[]},{"name":"{ PROJECT_STATUSES }","total_count":1,"children":[]}]},{"name":"QueueService.js","total_count":8,"children":[{"name":"._drain()","total_count":1,"children":[]},{"name":"._getNextJob()","total_count":1,"children":[]},{"name":".add()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".pause()","total_count":1,"children":[]},{"name":".resume()","total_count":1,"children":[]},{"name":".size()","total_count":1,"children":[]},{"name":"QueueService","total_count":1,"children":[]}]},{"name":"SiteService.js","total_count":11,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".createSite()","total_count":1,"children":[]},{"name":".disableSite()","total_count":1,"children":[]},{"name":".getAllSites()","total_count":1,"children":[]},{"name":".getDecryptedCredentials()","total_count":1,"children":[]},{"name":".getSite()","total_count":1,"children":[]},{"name":".getSiteSettings()","total_count":1,"children":[]},{"name":".updateSite()","total_count":1,"children":[]},{"name":".updateSiteSettings()","total_count":1,"children":[]},{"name":"Encryption","total_count":1,"children":[]},{"name":"SiteService","total_count":1,"children":[]}]},{"name":"SyncService.js","total_count":7,"children":[{"name":"._getAuthorLocalId()","total_count":1,"children":[]},{"name":"._syncTaxonomy()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".syncSite()","total_count":1,"children":[]},{"name":".testConnection()","total_count":1,"children":[]},{"name":"SyncService","total_count":1,"children":[]},{"name":"WordPressClient","total_count":1,"children":[]}]},{"name":"WordPressClient.js","total_count":13,"children":[{"name":"._getHeaders()","total_count":1,"children":[]},{"name":"._request()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".createDraft()","total_count":1,"children":[]},{"name":".createPendingReview()","total_count":1,"children":[]},{"name":".getAuthors()","total_count":1,"children":[]},{"name":".getCategories()","total_count":1,"children":[]},{"name":".getPages()","total_count":1,"children":[]},{"name":".getPosts()","total_count":1,"children":[]},{"name":".getTags()","total_count":1,"children":[]},{"name":".testConnection()","total_count":1,"children":[]},{"name":".updateDraft()","total_count":1,"children":[]},{"name":"WordPressClient","total_count":1,"children":[]}]}]},{"name":"session","total_count":11,"children":[{"name":"ClaudeHealthCheck.js","total_count":3,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".execute()","total_count":1,"children":[]},{"name":"ClaudeHealthCheck","total_count":1,"children":[]}]},{"name":"SessionDetector.js","total_count":3,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".detect()","total_count":1,"children":[]},{"name":"SessionDetector","total_count":1,"children":[]}]},{"name":"SessionRecovery.js","total_count":5,"children":[{"name":"._isLoggedIn()","total_count":1,"children":[]},{"name":"._sleep()","total_count":1,"children":[]},{"name":".constructor()","total_count":1,"children":[]},{"name":".recoverFromLogout()","total_count":1,"children":[]},{"name":"SessionRecovery","total_count":1,"children":[]}]}]},{"name":"utils","total_count":24,"children":[{"name":"AuditParser.js","total_count":4,"children":[{"name":"._extractList()","total_count":1,"children":[]},{"name":"._extractScore()","total_count":1,"children":[]},{"name":".parse()","total_count":1,"children":[]},{"name":"AuditParser","total_count":1,"children":[]}]},{"name":"AuditPromptBuilder.js","total_count":2,"children":[{"name":".build()","total_count":1,"children":[]},{"name":"AuditPromptBuilder","total_count":1,"children":[]}]},{"name":"DiffTracker.js","total_count":3,"children":[{"name":"._getWords()","total_count":1,"children":[]},{"name":".calculate()","total_count":1,"children":[]},{"name":"DiffTracker","total_count":1,"children":[]}]},{"name":"encryption.js","total_count":5,"children":[{"name":".constructor()","total_count":1,"children":[]},{"name":".decrypt()","total_count":1,"children":[]},{"name":".encrypt()","total_count":1,"children":[]},{"name":"crypto","total_count":1,"children":[]},{"name":"Encryption","total_count":1,"children":[]}]},{"name":"FailureClassifier.js","total_count":3,"children":[{"name":".classify()","total_count":1,"children":[]},{"name":"FAILURE_CATEGORIES","total_count":1,"children":[]},{"name":"FailureClassifier","total_count":1,"children":[]}]},{"name":"logger.js","total_count":5,"children":[{"name":"createLogger()","total_count":1,"children":[]},{"name":"normalizePayload()","total_count":1,"children":[]},{"name":"redact()","total_count":1,"children":[]},{"name":"SENSITIVE_KEYS","total_count":1,"children":[]},{"name":"write()","total_count":1,"children":[]}]},{"name":"RewritePromptBuilder.js","total_count":2,"children":[{"name":".build()","total_count":1,"children":[]},{"name":"RewritePromptBuilder","total_count":1,"children":[]}]}]}]},{"name":"start.sh","total_count":1,"children":[{"name":"start.sh script","total_count":1,"children":[]}]},{"name":"stop.sh","total_count":1,"children":[{"name":"stop.sh script","total_count":1,"children":[]}]},{"name":"tests","total_count":12,"children":[{"name":"stabilization.test.js","total_count":10,"children":[{"name":"DatabaseConnection","total_count":1,"children":[]},{"name":"fs","total_count":1,"children":[]},{"name":"JobService","total_count":1,"children":[]},{"name":"Migrations","total_count":1,"children":[]},{"name":"path","total_count":1,"children":[]},{"name":"{ JobRepository }","total_count":1,"children":[]},{"name":"{ PROJECT_STATUSES }","total_count":1,"children":[]},{"name":"{ ProjectRepository }","total_count":1,"children":[]},{"name":"{ ProjectService }","total_count":1,"children":[]},{"name":"{ SiteRepository }","total_count":1,"children":[]}]},{"name":"validation.test.js","total_count":2,"children":[{"name":"{ ClaudeManager }","total_count":1,"children":[]},{"name":"{ ValidationError }","total_count":1,"children":[]}]}]},{"name":"tmp_script.js","total_count":1,"children":[{"name":"showInfo()","total_count":1,"children":[]}]},{"name":"update.sh","total_count":1,"children":[{"name":"update.sh script","total_count":1,"children":[]}]},{"name":"ecosystem.config.js","total_count":1,"children":[]}]};

    function transformData(jsonData) {
        // Helper function to recursively build the children structure
        function processNode(node, parentL1StageName) {
            let displayName = node.name;
            // Append total_count if it exists and is not already in the name
            if (node.total_count !== undefined) {
                if (!/\(Total Count: \d+\)$/.test(displayName)) {
                    displayName += ` (Total Count: ${node.total_count})`;
                }
            }

            const newNode = { name: displayName };

            if (parentL1StageName === "Root") {
                 newNode.originalStageName = node.name;
            } else {
                newNode.originalStageName = parentL1StageName;
            }

            if (node.children && node.children.length > 0) {
                const stageNameToPass = (parentL1StageName === "Root") ? node.name : parentL1StageName;
                newNode.children = node.children.map(child => processNode(child, stageNameToPass));
            }

            return newNode;
        }

        let rootDisplayName = jsonData.name;
        if (jsonData.total_count !== undefined && !/\(Total Count: \d+\)$/.test(rootDisplayName)) {
            rootDisplayName += ` (Total Count: ${jsonData.total_count})`;
        }

        return {
            name: rootDisplayName,
            originalStageName: "Root",
            children: (jsonData.children || []).map(child => processNode(child, "Root"))
        };
    }

    const treeData = transformData(initialJsonData);

    // Auto-populated phaseColors: every depth-1 child of the root gets
    // a stable colour from a bigger palette so all top-level dirs are
    // distinguishable.
    const PALETTE = [
      ["#3498DB","#2980B9","#AED6F1"], ["#2ECC71","#27AE60","#A9DFBF"],
      ["#E74C3C","#C0392B","#F5B7B1"], ["#9B59B6","#8E44AD","#D7BDE2"],
      ["#F39C12","#D68910","#FAD7A0"], ["#1ABC9C","#117864","#A2D9CE"],
      ["#34495E","#1B2631","#ABB2B9"], ["#E67E22","#BA4A00","#F5CBA7"],
      ["#16A085","#0E6655","#A2D9CE"], ["#D35400","#A04000","#EDBB99"],
      ["#7F8C8D","#566573","#D5DBDB"], ["#C0392B","#7B241C","#F5B7B1"],
      ["#2E86C1","#1B4F72","#A9CCE3"], ["#28B463","#196F3D","#A9DFBF"],
      ["#AF7AC5","#6C3483","#D2B4DE"],
    ];
    const phaseColors = { "Root": { fill: "#4A4A4A", stroke: "#333333", collapsedFill: "#6C757D" },
                          "Default": { fill: "#BDC3C7", stroke: "#95A5A6", collapsedFill: "#ECF0F1" } };
    (initialJsonData.children || []).forEach((c, i) => {
      const pal = PALETTE[i % PALETTE.length];
      phaseColors[c.name] = { fill: pal[0], stroke: pal[1], collapsedFill: pal[2] };
    });

    const levelSpecificPalettes = {
      0: { fill: "#4A4A4A", stroke: "#333333", collapsedFill: "#6C757D" },
      2: { fill: "#6ab04c", stroke: "#508a38", collapsedFill: "#a3d391" },
      3: { fill: "#f0932b", stroke: "#d0730f", collapsedFill: "#f6c07e" },
      4: { fill: "#be2edd", stroke: "#a01cb3", collapsedFill: "#e08bf2" },
      5: { fill: "#00a8ff", stroke: "#007ac1", collapsedFill: "#74d2ff" },
      6: { fill: "#e55039", stroke: "#c23620", collapsedFill: "#f09a8d" },
      default: { fill: "#747d8c", stroke: "#57606f", collapsedFill: "#a4b0be" }
    };

    const svgElement = d3.select("#tree-svg");
    const initialSvgWidth = +svgElement.attr("width");
    const initialSvgHeight = +svgElement.attr("height");
    const margin = { top: 40, right: 120, bottom: 80, left: 450 };
    let width = initialSvgWidth - margin.left - margin.right;
    let height = initialSvgHeight - margin.top - margin.bottom;
    const duration = 500;
    let nodeCounter = 0;
    const g = svgElement.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const treemap = d3.tree().nodeSize([40, 0]);
    let rootNode = d3.hierarchy(treeData, d => d.children);
    rootNode.x0 = 0;
    rootNode.y0 = 0;

    if (rootNode.children) {
      rootNode.children.forEach(d_child => {
        if (d_child.children) { collapseBranch(d_child); }
      });
    }
    updateTree(rootNode);

    function collapseBranch(d) { if (d.children) { d._children = d.children; d._children.forEach(collapseBranch); d.children = null; } }
    function expandBranch(d) { if (d._children) { d.children = d._children; d._children = null; } if (d.children) { d.children.forEach(expandBranch); } }
    window.expandAll = () => { expandBranch(rootNode); updateTree(rootNode); };
    window.collapseAll = () => { if (rootNode.children) { rootNode.children.forEach(collapseBranch); } updateTree(rootNode); };
    window.resetView = () => { if (rootNode.children) { rootNode.children.forEach(d_child => { if (d_child.children || d_child._children) { collapseBranch(d_child); } }); } if (rootNode._children && !rootNode.children) { rootNode.children = rootNode._children; rootNode._children = null; } updateTree(rootNode); };

    function updateTree(source) {
      const treeLayoutData = treemap(rootNode);
      let nodes = treeLayoutData.descendants();
      let links = treeLayoutData.descendants().slice(1);

      let minX = 0;
      let maxX = 0;
      if (nodes.length > 0) {
        minX = d3.min(nodes, d => d.x);
        maxX = d3.max(nodes, d => d.x);
      }

      let neededHeight = Math.max(initialSvgHeight, maxX - minX + margin.top + margin.bottom + 100);
      svgElement.transition().duration(duration / 2).attr("height", neededHeight);
      g.transition().duration(duration / 2).attr("transform", `translate(${margin.left},${margin.top - minX + 40})`);

      nodes.forEach(d => { d.y = d.depth * 400; }); // Adjust horizontal separation if needed

      const node = g.selectAll('g.node').data(nodes, d => d.id || (d.id = ++nodeCounter));
      const nodeEnter = node.enter().append('g')
        .attr('class', d => "node" + (d.children || d._children ? " node--internal" : " node--leaf") + (d._children ? " _children" : ""))
        .attr('transform', d => `translate(${source.y0},${source.x0})`)
        .on('click', (event, d) => { if (d.children) { d._children = d.children; d.children = null; } else if (d._children) { d.children = d._children; d._children = null; } updateTree(d); })
        .style('cursor', d => (d.children || d._children) ? 'pointer' : 'default');

      nodeEnter.append('circle').attr('r', 1e-6);

      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children || d._children ? -14 : 14)
        .attr('text-anchor', d => d.children || d._children ? 'end' : 'start')
        .style("fill-opacity", 1e-6)
        .call(wrapText, 380);

      const nodeUpdate = nodeEnter.merge(node);
      nodeUpdate.transition().duration(duration)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .attr('class', d => "node" + (d.children ? " node--internal" : " node--leaf") + (d._children ? " node--internal _children" : ""));

      nodeUpdate.select('circle').attr('r', 8.5)
        .style('fill', d => {
            let palette;
            if (d.depth === 0) {
                palette = levelSpecificPalettes[0];
            } else if (d.depth === 1) {
                palette = phaseColors[d.data.originalStageName] || phaseColors.Default;
            } else {
                palette = levelSpecificPalettes[d.depth] || levelSpecificPalettes.default;
            }
            if (d._children) return palette.collapsedFill;
            if (d.children) return palette.fill;
            return "#fff";
        })
        .style('stroke', d => {
            let palette;
            if (d.depth === 0) {
                palette = levelSpecificPalettes[0];
            } else if (d.depth === 1) {
                palette = phaseColors[d.data.originalStageName] || phaseColors.Default;
            } else {
                palette = levelSpecificPalettes[d.depth] || levelSpecificPalettes.default;
            }
            return palette.stroke;
        });
      nodeUpdate.select('text').style("fill-opacity", 1).call(wrapText, 380);

      const nodeExit = node.exit().transition().duration(duration).attr('transform', d => `translate(${source.y},${source.x})`).remove();
      nodeExit.select('circle').attr('r', 1e-6);
      nodeExit.select('text').style('fill-opacity', 1e-6);

      const link = g.selectAll('path.link').data(links, d => d.id);
      const linkEnter = link.enter().insert('path', "g").attr('class', 'link').attr('d', d => { const o = { x: source.x0, y: source.y0 }; return diagonal(o, o); });

      linkEnter.merge(link).transition().duration(duration).attr('d', d => diagonal(d, d.parent))
        .style('stroke', d => {
            const sourceNode = d.parent;
            if (!sourceNode) return phaseColors.Default.stroke;
            const l1AncestorName = sourceNode.data.originalStageName;
            const colorPalette = phaseColors[l1AncestorName] || phaseColors.Default;
            return colorPalette.stroke;
        });
      link.exit().transition().duration(duration).attr('d', d => { const o = { x: source.x, y: source.y }; return diagonal(o, o); }).remove();
      nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });
    }

    function diagonal(s, d) { return `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`; }

    function wrapText(textElements, maxWidth) {
        const textPartColors = {
            name: '#343a40',
            count: '#0056b3'
        };
        const countRegex = /(\s\(Total Count: \d+\))$/;

        textElements.each(function () {
            const textD3 = d3.select(this);
            const originalNodeText = textD3.datum().data.name;
            const x = parseFloat(textD3.attr("x") || 0);
            const initialDy = textD3.attr("dy");
            const textAnchor = textD3.attr("text-anchor");
            const lineHeight = 1.1;

            textD3.text(null);

            let namePart = originalNodeText;
            let countPartText = "";

            const countMatch = originalNodeText.match(countRegex);
            if (countMatch && originalNodeText.endsWith(countMatch[0])) {
                namePart = originalNodeText.substring(0, originalNodeText.length - countMatch[0].length).trim();
                countPartText = countMatch[0].trim();
            }

            const tokens = [];
            namePart.split(/\s+/).filter(Boolean).forEach(word => {
                tokens.push({ text: word, type: 'name' });
            });
            if (countPartText) {
                tokens.push({ text: countPartText, type: 'count' });
            }

            if (tokens.length === 0 && originalNodeText) {
                tokens.push({ text: originalNodeText, type: 'name' });
            }

            let currentTspan = textD3.append("tspan").attr("x", x).attr("dy", initialDy);
            if (textAnchor === "end") currentTspan.attr("text-anchor", "end");

            let lineTokens = [];

            for (let i = 0; i < tokens.length; i++) {
                const tokenObj = tokens[i];

                lineTokens.push(tokenObj);
                currentTspan.text(lineTokens.map(t => t.text).join(" "));

                if (currentTspan.node().getComputedTextLength() > maxWidth && lineTokens.length > 1) {
                    lineTokens.pop();

                    currentTspan.text(null);
                    lineTokens.forEach((prevToken, idx) => {
                        currentTspan.append("tspan")
                            .text((idx > 0 ? " " : "") + prevToken.text)
                            .style("fill", textPartColors[prevToken.type] || textPartColors.name)
                            .style("font-weight", prevToken.type === 'count' ? "bold" : "normal");
                    });

                    lineTokens = [tokenObj];
                    currentTspan = textD3.append("tspan").attr("x", x).attr("dy", lineHeight + "em");
                    if (textAnchor === "end") currentTspan.attr("text-anchor", "end");
                }
            }

            currentTspan.text(null);
            lineTokens.forEach((token, idx) => {
                currentTspan.append("tspan")
                    .text((idx > 0 ? " " : "") + token.text)
                    .style("fill", textPartColors[token.type] || textPartColors.name)
                    .style("font-weight", token.type === 'count' ? "bold" : "normal");
            });

            if (textD3.selectAll("tspan > tspan").empty() && textD3.select("tspan").text().length === 0 && originalNodeText) {
                let t = textD3.select("tspan");
                let displayText = originalNodeText;
                t.text(displayText).style("fill", textPartColors.name);
                if (t.node() && t.node().getComputedTextLength() > maxWidth && displayText.length > 20) {
                    let estimatedChars = Math.floor(maxWidth / (t.node().getComputedTextLength()/displayText.length) );
                    displayText = displayText.substring(0, Math.max(0, estimatedChars - 3)) + "...";
                    t.text(displayText);
                }
            }
        });
    }
  </script>