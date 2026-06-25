# Graph Report - /Users/abhinaykalkhanday/Desktop/n8n  (2026-06-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 690 nodes · 884 edges · 77 communities (28 shown, 49 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6127d067`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Auditroutes Components|Auditroutes Components]]
- [[_COMMUNITY_Migrations Components|Migrations Components]]
- [[_COMMUNITY_Bootstrapmanager Components|Bootstrapmanager Components]]
- [[_COMMUNITY_Createclaudeerror Components|Createclaudeerror Components]]
- [[_COMMUNITY_Bootstrapmanager Components|Bootstrapmanager Components]]
- [[_COMMUNITY_Claudeerrors Components|Claudeerrors Components]]
- [[_COMMUNITY_Package Components|Package Components]]
- [[_COMMUNITY_Syncservice Components|Syncservice Components]]
- [[_COMMUNITY_Jobrepository Components|Jobrepository Components]]
- [[_COMMUNITY_Siteservice Components|Siteservice Components]]
- [[_COMMUNITY_Site Components|Site Components]]
- [[_COMMUNITY_Projectrepository Components|Projectrepository Components]]
- [[_COMMUNITY_Browsermanager Components|Browsermanager Components]]
- [[_COMMUNITY_Wordpressrepository Components|Wordpressrepository Components]]
- [[_COMMUNITY_Claudeworker Components|Claudeworker Components]]
- [[_COMMUNITY_Claudeworker Components|Claudeworker Components]]
- [[_COMMUNITY_Jobservice Components|Jobservice Components]]
- [[_COMMUNITY_Metricsservice Components|Metricsservice Components]]
- [[_COMMUNITY_Preflightvalidator Components|Preflightvalidator Components]]
- [[_COMMUNITY_Statemachine Components|Statemachine Components]]
- [[_COMMUNITY_Projectservice Components|Projectservice Components]]
- [[_COMMUNITY_Browsererror Components|Browsererror Components]]
- [[_COMMUNITY_Logrepository Components|Logrepository Components]]
- [[_COMMUNITY_Dashboardservice Components|Dashboardservice Components]]
- [[_COMMUNITY_Database Components|Database Components]]
- [[_COMMUNITY_Queueservice Components|Queueservice Components]]
- [[_COMMUNITY_Persistentworkerstate Components|Persistentworkerstate Components]]
- [[_COMMUNITY_Recoverymanager Components|Recoverymanager Components]]
- [[_COMMUNITY_Sessionmonitor Components|Sessionmonitor Components]]
- [[_COMMUNITY_Publishingrepository Components|Publishingrepository Components]]
- [[_COMMUNITY_Job Components|Job Components]]
- [[_COMMUNITY_Run Components|Run Components]]
- [[_COMMUNITY_Dom Components|Dom Components]]
- [[_COMMUNITY_Sessionrecovery Components|Sessionrecovery Components]]
- [[_COMMUNITY_Commands Components|Commands Components]]
- [[_COMMUNITY_Engineer Components|Engineer Components]]
- [[_COMMUNITY_V2 Components|V2 Components]]
- [[_COMMUNITY_Chat Components|Chat Components]]
- [[_COMMUNITY_Clipboard Components|Clipboard Components]]
- [[_COMMUNITY_Browserrecovery Components|Browserrecovery Components]]
- [[_COMMUNITY_Claude Components|Claude Components]]
- [[_COMMUNITY_Plan Components|Plan Components]]
- [[_COMMUNITY_Claude Components|Claude Components]]
- [[_COMMUNITY_Full Components|Full Components]]
- [[_COMMUNITY_Parent Components|Parent Components]]
- [[_COMMUNITY_Selectors Components|Selectors Components]]
- [[_COMMUNITY_Selectors Components|Selectors Components]]
- [[_COMMUNITY_Headless Components|Headless Components]]
- [[_COMMUNITY_Whitespace Components|Whitespace Components]]
- [[_COMMUNITY_Claudehealthcheck Components|Claudehealthcheck Components]]
- [[_COMMUNITY_Sessiondetector Components|Sessiondetector Components]]
- [[_COMMUNITY_Spec Components|Spec Components]]
- [[_COMMUNITY_Eeat Components|Eeat Components]]
- [[_COMMUNITY_Health Components|Health Components]]
- [[_COMMUNITY_Rewrite Components|Rewrite Components]]
- [[_COMMUNITY_Status Components|Status Components]]
- [[_COMMUNITY_Auditpromptbuilder Components|Auditpromptbuilder Components]]
- [[_COMMUNITY_Rewritepromptbuilder Components|Rewritepromptbuilder Components]]
- [[_COMMUNITY_Backup Components|Backup Components]]
- [[_COMMUNITY_Interface Components|Interface Components]]
- [[_COMMUNITY_Lifecycle Components|Lifecycle Components]]
- [[_COMMUNITY_Engineer Components|Engineer Components]]
- [[_COMMUNITY_Healthcheck Components|Healthcheck Components]]
- [[_COMMUNITY_Install Components|Install Components]]
- [[_COMMUNITY_Restart Components|Restart Components]]
- [[_COMMUNITY_Server Components|Server Components]]
- [[_COMMUNITY_Start Components|Start Components]]
- [[_COMMUNITY_Response Components|Response Components]]
- [[_COMMUNITY_Spec Components|Spec Components]]
- [[_COMMUNITY_Config Components|Config Components]]
- [[_COMMUNITY_Ambiguity Components|Ambiguity Components]]
- [[_COMMUNITY_Output Components|Output Components]]
- [[_COMMUNITY_Thinking Components|Thinking Components]]
- [[_COMMUNITY_Change Components|Change Components]]

## God Nodes (most connected - your core abstractions)
1. `ClaudeManager` - 32 edges
2. `JobRepository` - 20 edges
3. `ProjectRepository` - 18 edges
4. `BrowserManager` - 17 edges
5. `createApp()` - 16 edges
6. `ClaudeWorker` - 16 edges
7. `WordPressRepository` - 14 edges
8. `SiteRepository` - 13 edges
9. `JobService` - 13 edges
10. `ProjectService` - 13 edges

## Surprising Connections (you probably didn't know these)
- `getSingletonWorker()` --calls--> `loadConfig()`  [EXTRACTED]
  scripts/claude.js → src/config/config.js
- `getSingletonWorker()` --calls--> `createLogger()`  [EXTRACTED]
  scripts/claude.js → src/utils/logger.js
- `Deployment Commands` --references--> `Claude Worker Foundation`  [EXTRACTED]
  DEPLOYMENT_COMMANDS.md → README.md
- `Staging Deployment Design` --references--> `Claude Worker Foundation`  [EXTRACTED]
  DEPLOYMENT_STAGING.md → README.md
- `Production Launch Checklist` --references--> `Claude Worker Foundation`  [EXTRACTED]
  PRODUCTION_LAUNCH_CHECKLIST.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify System Components** — graphify_rules_graphify, graphify_workflows_graphify, graphify_output_directory [EXTRACTED 0.90]

## Communities (77 total, 49 thin omitted)

### Community 0 - "Auditroutes Components"
Cohesion: 0.05
Nodes (41): createAuditRoutes(), express, createJobRoutes(), express, createProjectRoutes(), express, createPublishingRoutes(), express (+33 more)

### Community 1 - "Migrations Components"
Cohesion: 0.05
Nodes (31): BrowserError, ClaudeError, ContentUnavailableError, InvalidProjectContentError, InvalidResponseQualityError, ProfileLockError, RecoveryReport, ValidationError (+23 more)

### Community 2 - "Bootstrapmanager Components"
Cohesion: 0.06
Nodes (24): Migrations, ContentProject, PROJECT_STATUSES, VALID_PROJECT_TRANSITIONS, { ContentProject, PROJECT_STATUSES }, { PROJECT_STATUSES }, AuditParser, DiffTracker (+16 more)

### Community 3 - "Createclaudeerror Components"
Cohesion: 0.06
Nodes (14): PersistentWorkerState, { BrowserManager }, { ClaudeWorker }, { createLogger }, getSingletonWorker(), { loadConfig }, { PersistentWorkerState: WorkerState }, runClaude() (+6 more)

### Community 4 - "Bootstrapmanager Components"
Cohesion: 0.14
Nodes (3): createClaudeError(), normalizeError(), ClaudeManager

### Community 5 - "Claudeerrors Components"
Cohesion: 0.07
Nodes (29): { BrowserManager }, { BrowserRecovery }, { ClaudeHealthCheck }, { ClaudeManager }, { ClaudeWorker }, { createLogger }, { DashboardService }, DatabaseConnection (+21 more)

### Community 6 - "Package Components"
Cohesion: 0.14
Nodes (10): BootstrapManager, fs, loadConfig(), parseBoolean(), parseInteger(), path, loadSecurityConfig(), { parseInteger } (+2 more)

### Community 7 - "Syncservice Components"
Cohesion: 0.09
Nodes (21): author, dependencies, better-sqlite3, dotenv, express, playwright, description, devDependencies (+13 more)

### Community 8 - "Jobrepository Components"
Cohesion: 0.14
Nodes (3): SyncService, WordPressClient, WordPressClient

### Community 10 - "Site Components"
Cohesion: 0.12
Nodes (4): Encryption, SiteService, crypto, Encryption

### Community 11 - "Projectrepository Components"
Cohesion: 0.15
Nodes (3): Site, { Site }, SiteRepository

### Community 17 - "Metricsservice Components"
Cohesion: 0.18
Nodes (3): fs, path, PreFlightValidator

### Community 22 - "Logrepository Components"
Cohesion: 0.22
Nodes (4): Database, DatabaseConnection, fs, path

### Community 26 - "Persistentworkerstate Components"
Cohesion: 0.33
Nodes (6): Graphify CLI, Graphify MCP, graphify-out/, Graphify Rules, Graphify Skill Definition, Graphify Workflow

### Community 28 - "Sessionmonitor Components"
Cohesion: 0.33
Nodes (4): Database, db, fs, path

### Community 29 - "Publishingrepository Components"
Cohesion: 0.33
Nodes (4): Database, fs, path, { spawn }

### Community 30 - "Job Components"
Cohesion: 0.33
Nodes (4): { chromium }, fs, path, SELECTORS

### Community 32 - "Dom Components"
Cohesion: 0.40
Nodes (5): Deployment Commands, Staging Deployment Design, Production Launch Checklist, Claude Worker Foundation, 14-Day Soak Test Plan

### Community 33 - "Sessionrecovery Components"
Cohesion: 0.60
Nodes (5): Junior Engineer, Ownership & influence, Problem-solving approach, Scope of thinking, Senior Engineer

### Community 34 - "Commands Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 35 - "Engineer Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 36 - "V2 Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 38 - "Clipboard Components"
Cohesion: 0.50
Nodes (4): Claude, Free Plan, Max Plan, Pro Plan

### Community 39 - "Browserrecovery Components"
Cohesion: 0.50
Nodes (4): Claude Free Plan, Claude Landing Page, Claude Max Plan, Claude Pro Plan

### Community 50 - "Sessiondetector Components"
Cohesion: 0.67
Nodes (3): E-E-A-T score, SEO audit of WordPress article, YMYL

## Knowledge Gaps
- **208 isolated node(s):** `backup.sh script`, `{ test, expect }`, `path`, `healthcheck.sh script`, `install.sh script` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **49 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClaudeManager` connect `Bootstrapmanager Components` to `Migrations Components`, `Claudeerrors Components`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `JobRepository` connect `Siteservice Components` to `Bootstrapmanager Components`, `Claudeerrors Components`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `BrowserManager` connect `Wordpressrepository Components` to `Migrations Components`, `Createclaudeerror Components`, `Claudeerrors Components`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `backup.sh script`, `{ test, expect }`, `path` to the rest of the system?**
  _211 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auditroutes Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `Migrations Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05176470588235294 - nodes in this community are weakly interconnected._
- **Should `Bootstrapmanager Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05656565656565657 - nodes in this community are weakly interconnected._