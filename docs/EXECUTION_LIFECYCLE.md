# Project Execution Lifecycle (Post-Milestone 4 & 10.5)

This document outlines the current state-driven execution model for content projects and jobs.

## 1. Project States
Projects follow a strict transition lifecycle enforced by `ProjectRepository.updateStatus` and `ContentProject.isValidTransition`.

| Status | Description | Valid Next States |
| :--- | :--- | :--- |
| **CREATED** | Project record created, no jobs yet. | AUDIT_PENDING, REWRITE_PENDING, FAILED |
| **AUDIT_PENDING** | Audit job created and waiting. | AUDITING, FAILED |
| **AUDITING** | Worker is currently executing audit. | AUDIT_COMPLETE, AUDIT_PENDING (Recovery), FAILED |
| **AUDIT_COMPLETE** | Audit successful. | REWRITE_PENDING, FAILED |
| **REWRITE_PENDING** | Rewrite job created and waiting. | REWRITING, FAILED |
| **REWRITING** | Worker is currently executing rewrite. | REWRITE_COMPLETE, REWRITE_PENDING (Recovery), FAILED |
| **REWRITE_COMPLETE** | Rewrite successful. | REVIEW_PENDING, FAILED |
| **REVIEW_PENDING** | Waiting for manual or automated review. | COMPLETED, FAILED |
| **COMPLETED** | Lifecycle finished successfully. | ARCHIVED |
| **FAILED** | An error occurred during any stage. | AUDIT_PENDING, REWRITE_PENDING (Retry) |

## 2. Job States
Jobs follow a standard uppercase status model.

*   **PENDING**: Waiting in queue.
*   **PROCESSING**: Currently being executed by the worker.
*   **COMPLETED**: Successfully finished.
*   **FAILED**: Error occurred during execution.

## 3. Execution Ownership
Execution is entirely driven by persistent job records and snapshots.

1.  **Job Creation**: `JobService.createJob` captures snapshots of site-wide prompts (`audit_prompt` and `rewrite_prompt`) into the job record.
2.  **Worker Loop**: `ClaudeWorker` fetches `PENDING` jobs from `JobRepository`.
3.  **Snapshot Execution**: `ClaudeWorker.executeJob` uses the snapshots stored in the job, ignoring any changes to site settings that occurred after the job was queued.
4.  **State Sync**: The worker updates both the Job status and the Project status atomically during the start and finish of execution.

## 4. Recovery & Reconciliation
The system automatically recovers from crashes during `BootstrapManager` initialization.

1.  **Job Recovery**: Any job left in `PROCESSING` is reset to `PENDING`.
2.  **Project Reconciliation**: `ProjectService.reconcileProjectStates` finds projects left in `AUDITING` or `REWRITING` and reverts them to `AUDIT_PENDING` or `REWRITE_PENDING` if their jobs were recovered.

## 5. Execution Paths
*   **Background Worker**: Automatically picks up `PENDING` jobs.
*   **API `/rewrite`**: Creates a job, captures snapshots, and triggers `executeJob` immediately. All executions are now tracked in the database.
