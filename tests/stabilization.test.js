const DatabaseConnection = require('../src/db/database');
const Migrations = require('../src/db/migrations');
const { JobRepository } = require('../src/repositories/JobRepository');
const { ProjectRepository } = require('../src/repositories/ProjectRepository');
const { SiteRepository } = require('../src/repositories/SiteRepository');
const JobService = require('../src/services/JobService');
const { ProjectService } = require('../src/services/ProjectService');
const { PROJECT_STATUSES } = require('../src/models/ContentProject');
const path = require('path');
const fs = require('fs');

describe('Job System Stabilization', () => {
    let dbConnection;
    let db;
    let jobRepository;
    let projectRepository;
    let siteRepository;
    let jobService;
    let projectService;
    let logger;
    const testDbPath = path.join(__dirname, 'test_stabilization.sqlite');

    beforeEach(async () => {
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
        
        dbConnection = new DatabaseConnection({ dbPath: testDbPath });
        db = await dbConnection.connect();
        await new Migrations(db).run();

        logger = { info: jest.fn(), error: jest.fn() };
        jobRepository = new JobRepository(db);
        projectRepository = new ProjectRepository(db);
        siteRepository = new SiteRepository(db);
        
        jobService = new JobService({ jobRepository, projectRepository, siteRepository, logger });
        projectService = new ProjectService({ projectRepository, jobRepository, logger });

        // Setup a test site
        const now = new Date().toISOString();
        db.prepare("INSERT INTO sites (id, name, domain, created_at) VALUES (1, 'Test Site', 'example.com', ?)").run(now);
        db.prepare("INSERT INTO site_settings (site_id, audit_prompt, rewrite_prompt, updated_at, created_at) VALUES (1, 'Audit v1', 'Rewrite v1', ?, ?)").run(now, now);
    });

    afterEach(() => {
        dbConnection.close();
        if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    });

    test('should create job with snapshots and update project status', async () => {
        const job = await jobService.createJob({ siteId: 1, wpPostId: 101, type: 'REWRITE' });
        
        expect(job.status).toBe('PENDING');
        expect(job.rewrite_prompt_snapshot).toBe('Rewrite v1');
        
        const project = await projectRepository.getProjectByWpPostId(1, 101);
        expect(project.status).toBe(PROJECT_STATUSES.REWRITE_PENDING);
    });

    test('should maintain snapshot integrity after site settings update', async () => {
        const job = await jobService.createJob({ siteId: 1, wpPostId: 101, type: 'REWRITE' });
        
        // Update site settings
        db.prepare("UPDATE site_settings SET rewrite_prompt = 'Rewrite v2' WHERE site_id = 1").run();
        
        const freshJob = await jobService.getJobById(job.id);
        expect(freshJob.rewrite_prompt_snapshot).toBe('Rewrite v1');
    });

    test('should enforce valid project transitions', async () => {
        const project = await projectRepository.createProject(1, 102);
        expect(project.status).toBe(PROJECT_STATUSES.CREATED);
        
        // Invalid: CREATED -> REWRITE_COMPLETE
        await expect(projectRepository.updateStatus(project.id, PROJECT_STATUSES.REWRITE_COMPLETE))
            .rejects.toThrow('Invalid project transition');
    });

    test('should reconcile project states on recovery', async () => {
        const job = await jobService.createJob({ siteId: 1, wpPostId: 101, type: 'REWRITE' });
        const project = await projectRepository.getProjectByWpPostId(1, 101);
        
        // Simulate crash while processing
        await jobRepository.markProcessing(job.id);
        // Force bypass validation for simulation if needed, but here we can just do valid transitions
        await projectRepository.updateStatus(project.id, PROJECT_STATUSES.REWRITING);
        
        // 1. Recover Jobs
        await jobService.recoverInterruptedJobs();
        const recoveredJob = await jobService.getJobById(job.id);
        expect(recoveredJob.status).toBe('PENDING');
        
        // Project is still REWRITING (inconsistent)
        let staleProject = await projectRepository.getProjectById(project.id);
        expect(staleProject.status).toBe(PROJECT_STATUSES.REWRITING);
        
        // 2. Reconcile Projects
        await projectService.reconcileProjectStates();
        const fixedProject = await projectRepository.getProjectById(project.id);
        expect(fixedProject.status).toBe(PROJECT_STATUSES.REWRITE_PENDING);
    });
});
