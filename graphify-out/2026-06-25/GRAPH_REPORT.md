# Graph Report - n8n  (2026-06-25)

## Corpus Check
- 121 files · ~167,698 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 770 nodes · 956 edges · 93 communities (35 shown, 58 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cee7ed3e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Auditroutes Components|Auditroutes Components]]
- [[_COMMUNITY_Claudeerrors Components|Claudeerrors Components]]
- [[_COMMUNITY_Bootstrapmanager Components|Bootstrapmanager Components]]
- [[_COMMUNITY_Migrations Components|Migrations Components]]
- [[_COMMUNITY_Createclaudeerror Components|Createclaudeerror Components]]
- [[_COMMUNITY_Bootstrapmanager Components|Bootstrapmanager Components]]
- [[_COMMUNITY_Package Components|Package Components]]
- [[_COMMUNITY_Syncservice Components|Syncservice Components]]
- [[_COMMUNITY_Jobrepository Components|Jobrepository Components]]
- [[_COMMUNITY_Siteservice Components|Siteservice Components]]
- [[_COMMUNITY_Site Components|Site Components]]
- [[_COMMUNITY_Projectrepository Components|Projectrepository Components]]
- [[_COMMUNITY_Script Components|Script Components]]
- [[_COMMUNITY_Browsermanager Components|Browsermanager Components]]
- [[_COMMUNITY_Wordpressrepository Components|Wordpressrepository Components]]
- [[_COMMUNITY_Claudeworker Components|Claudeworker Components]]
- [[_COMMUNITY_Jobservice Components|Jobservice Components]]
- [[_COMMUNITY_Metricsservice Components|Metricsservice Components]]
- [[_COMMUNITY_Preflightvalidator Components|Preflightvalidator Components]]
- [[_COMMUNITY_Statemachine Components|Statemachine Components]]
- [[_COMMUNITY_Projectservice Components|Projectservice Components]]
- [[_COMMUNITY_Logrepository Components|Logrepository Components]]
- [[_COMMUNITY_Dashboardservice Components|Dashboardservice Components]]
- [[_COMMUNITY_Database Components|Database Components]]
- [[_COMMUNITY_Queueservice Components|Queueservice Components]]
- [[_COMMUNITY_Recoverymanager Components|Recoverymanager Components]]
- [[_COMMUNITY_Sessionmonitor Components|Sessionmonitor Components]]
- [[_COMMUNITY_Cli Components|Cli Components]]
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
- [[_COMMUNITY_Engineer Components|Engineer Components]]
- [[_COMMUNITY_Backup Components|Backup Components]]
- [[_COMMUNITY_Interface Components|Interface Components]]
- [[_COMMUNITY_Lifecycle Components|Lifecycle Components]]
- [[_COMMUNITY_Engineer Components|Engineer Components]]
- [[_COMMUNITY_Healthcheck Components|Healthcheck Components]]
- [[_COMMUNITY_Install Components|Install Components]]
- [[_COMMUNITY_Eeat Components|Eeat Components]]
- [[_COMMUNITY_Restart Components|Restart Components]]
- [[_COMMUNITY_Restore Components|Restore Components]]
- [[_COMMUNITY_Server Components|Server Components]]
- [[_COMMUNITY_Start Components|Start Components]]
- [[_COMMUNITY_Stop Components|Stop Components]]
- [[_COMMUNITY_Update Components|Update Components]]
- [[_COMMUNITY_Btn Components|Btn Components]]
- [[_COMMUNITY_Response Components|Response Components]]
- [[_COMMUNITY_Ambiguity Components|Ambiguity Components]]
- [[_COMMUNITY_Output Components|Output Components]]
- [[_COMMUNITY_Thinking Components|Thinking Components]]
- [[_COMMUNITY_Change Components|Change Components]]
- [[_COMMUNITY_Claude Components|Claude Components]]
- [[_COMMUNITY_Workflow Components|Workflow Components]]
- [[_COMMUNITY_Prompt Components|Prompt Components]]
- [[_COMMUNITY_Image Components|Image Components]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]

## God Nodes (most connected - your core abstractions)
1. `ClaudeManager` - 32 edges
2. `JobRepository` - 20 edges
3. `BrowserManager` - 19 edges
4. `ProjectRepository` - 18 edges
5. `createApp()` - 16 edges
6. `ClaudeWorker` - 16 edges
7. `WordPressRepository` - 14 edges
8. `SiteRepository` - 13 edges
9. `JobService` - 13 edges
10. `ProjectService` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Deployment Commands` --references--> `Claude Worker Foundation`  [EXTRACTED]
  DEPLOYMENT_COMMANDS.md → README.md
- `Production Launch Checklist` --references--> `Claude Worker Foundation`  [EXTRACTED]
  PRODUCTION_LAUNCH_CHECKLIST.md → README.md
- `Project Execution Lifecycle` --references--> `Persistent Job System`  [EXTRACTED]
  docs/EXECUTION_LIFECYCLE.md → README.md
- `getSingletonWorker()` --calls--> `loadConfig()`  [EXTRACTED]
  scripts/claude.js → src/config/config.js
- `getSingletonWorker()` --calls--> `createLogger()`  [EXTRACTED]
  scripts/claude.js → src/utils/logger.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Graphify System Components** — graphify_rules_graphify, graphify_workflows_graphify, graphify_output_directory [EXTRACTED 0.90]
- **Claude Pricing Tiers** — failure1780488085427_claude_free_plan, failure1780488085427_claude_pro_plan, failure1780488085427_claude_max_plan [EXTRACTED 0.75]
- **Junior vs Senior Engineer Differences** — failure_junior_engineer, failure_senior_engineer, failure_scope_of_thinking, failure_handling_ambiguity, failure_impact_vs_output [EXTRACTED 0.75]
- **Junior vs Senior Comparison** — failure1780489233782_junior_engineer, failure1780489233782_senior_engineer, failure1780489233782_scope_of_thinking [EXTRACTED 1.00]

## Communities (93 total, 58 thin omitted)

### Community 0 - "Auditroutes Components"
Cohesion: 0.05
Nodes (41): createAuditRoutes(), express, createJobRoutes(), express, createProjectRoutes(), express, createPublishingRoutes(), express (+33 more)

### Community 1 - "Claudeerrors Components"
Cohesion: 0.05
Nodes (32): BrowserError, ClaudeError, ContentUnavailableError, InvalidProjectContentError, InvalidResponseQualityError, ProfileLockError, RecoveryReport, ValidationError (+24 more)

### Community 2 - "Bootstrapmanager Components"
Cohesion: 0.06
Nodes (23): BootstrapManager, fs, loadConfig(), parseBoolean(), parseInteger(), path, loadSecurityConfig(), { parseInteger } (+15 more)

### Community 3 - "Migrations Components"
Cohesion: 0.18
Nodes (10): DatabaseConnection, fs, { JobRepository }, JobService, Migrations, path, { PROJECT_STATUSES }, { ProjectRepository } (+2 more)

### Community 4 - "Createclaudeerror Components"
Cohesion: 0.14
Nodes (3): createClaudeError(), normalizeError(), ClaudeManager

### Community 5 - "Bootstrapmanager Components"
Cohesion: 0.07
Nodes (29): { BrowserManager }, { BrowserRecovery }, { ClaudeHealthCheck }, { ClaudeManager }, { ClaudeWorker }, { createLogger }, { DashboardService }, DatabaseConnection (+21 more)

### Community 6 - "Package Components"
Cohesion: 0.08
Nodes (23): author, dependencies, better-sqlite3, dotenv, express, playwright, playwright-extra, puppeteer-extra-plugin-stealth (+15 more)

### Community 7 - "Syncservice Components"
Cohesion: 0.14
Nodes (3): SyncService, WordPressClient, WordPressClient

### Community 9 - "Siteservice Components"
Cohesion: 0.12
Nodes (4): Encryption, SiteService, crypto, Encryption

### Community 10 - "Site Components"
Cohesion: 0.15
Nodes (3): Site, { Site }, SiteRepository

### Community 12 - "Script Components"
Cohesion: 0.13
Nodes (10): g, levelSpecificPalettes, margin, PALETTE, phaseColors, rootNode, svgElement, treeData (+2 more)

### Community 18 - "Preflightvalidator Components"
Cohesion: 0.18
Nodes (3): fs, path, PreFlightValidator

### Community 23 - "Database Components"
Cohesion: 0.22
Nodes (4): Database, DatabaseConnection, fs, path

### Community 27 - "Cli Components"
Cohesion: 0.33
Nodes (6): Graphify CLI, Graphify MCP, graphify-out/, Graphify Rules, Graphify Skill Definition, Graphify Workflow

### Community 29 - "Job Components"
Cohesion: 0.33
Nodes (4): Database, db, fs, path

### Community 30 - "Run Components"
Cohesion: 0.33
Nodes (4): Database, fs, path, { spawn }

### Community 31 - "Dom Components"
Cohesion: 0.33
Nodes (4): { chromium }, fs, path, SELECTORS

### Community 33 - "Commands Components"
Cohesion: 0.08
Nodes (23): Filesystem Layout, Infrastructure, PM2 Configuration (`ecosystem.config.js`), Staging Deployment Design, Deployment Commands, Project Execution Lifecycle, Production Launch Checklist, Claude Worker Foundation (+15 more)

### Community 34 - "Engineer Components"
Cohesion: 0.60
Nodes (5): Junior Engineer, Ownership & influence, Problem-solving approach, Scope of thinking, Senior Engineer

### Community 35 - "V2 Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 36 - "Chat Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 37 - "Clipboard Components"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 39 - "Claude Components"
Cohesion: 0.50
Nodes (4): Claude, Free Plan, Max Plan, Pro Plan

### Community 40 - "Plan Components"
Cohesion: 0.50
Nodes (4): Claude Free Plan, Claude Landing Page, Claude Max Plan, Claude Pro Plan

### Community 51 - "Eeat Components"
Cohesion: 0.67
Nodes (3): E-E-A-T score, SEO audit of WordPress article, YMYL

### Community 58 - "Lifecycle Components"
Cohesion: 0.20
Nodes (9): 1. Fresh Installation, 2. Update Deployment, 3. Lifecycle Management, 4. Backup & Restore, 5. Rollback, 6. Manual Headed Login (Recovery), Backup, Deployment Commands Reference (+1 more)

### Community 82 - "Community 82"
Cohesion: 0.27
Nodes (5): ContentProject, PROJECT_STATUSES, VALID_PROJECT_TRANSITIONS, { ContentProject, PROJECT_STATUSES }, { PROJECT_STATUSES }

### Community 83 - "Community 83"
Cohesion: 0.22
Nodes (8): 1. Server Preparation, 2. Environment Configuration, 3. Proxy & Security, 4. Claude Authentication (Manual Initialization), 5. Startup & Readiness, 6. Monitoring & Verification, 7. Backups, Final Production Launch Checklist

### Community 84 - "Community 84"
Cohesion: 0.25
Nodes (4): AuditParser, DiffTracker, { PROJECT_STATUSES }, DiffTracker

### Community 86 - "Community 86"
Cohesion: 0.29
Nodes (6): 1. Project States, 2. Job States, 3. Execution Ownership, 4. Recovery & Reconciliation, 5. Execution Paths, Project Execution Lifecycle (Post-Milestone 4 & 10.5)

### Community 87 - "Community 87"
Cohesion: 0.29
Nodes (3): { PROJECT_STATUSES }, PublishingService, WordPressClient

## Knowledge Gaps
- **261 isolated node(s):** `name`, `version`, `description`, `main`, `start` (+256 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClaudeManager` connect `Createclaudeerror Components` to `Claudeerrors Components`, `Bootstrapmanager Components`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `BrowserManager` connect `Browsermanager Components` to `Claudeerrors Components`, `Bootstrapmanager Components`, `Bootstrapmanager Components`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `JobRepository` connect `Jobrepository Components` to `Migrations Components`, `Bootstrapmanager Components`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _264 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auditroutes Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `Claudeerrors Components` be split into smaller, more focused modules?**
  _Cohesion score 0.05052790346907994 - nodes in this community are weakly interconnected._
- **Should `Bootstrapmanager Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06086956521739131 - nodes in this community are weakly interconnected._