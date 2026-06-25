const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { spawn } = require('child_process');

async function runPipeline() {
    console.log('🚀 Starting Autonomous Pipeline...');

    // 1. Ensure prompt exists
    const promptPath = path.join(__dirname, 'prompts', 'input.txt');
    if (!fs.existsSync(promptPath)) {
        console.error('❌ Error: prompts/input.txt not found.');
        process.exit(1);
    }
    const prompt = fs.readFileSync(promptPath, 'utf8');
    const wpPostId = `auto_${Date.now()}`;

    // 2. Add job to database
    console.log('📝 Adding job to database...');
    const db = new Database(path.join(__dirname, 'jobs.sqlite'));
    try {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
            INSERT INTO jobs (wp_post_id, prompt, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(wpPostId, prompt, 'pending', now, now);
        console.log(`✅ Job added with ID: ${wpPostId}`);
    } catch (error) {
        console.error('❌ Failed to add job:', error.message);
        db.close();
        process.exit(1);
    }
    db.close();

    // 3. Start the server if not running
    console.log('🌐 Checking if server is running...');
    const server = spawn('node', ['server.js'], {
        detached: true,
        stdio: 'inherit'
    });
    server.unref();

    console.log('⏳ Waiting for job completion (polling database)...');
    
    // 4. Poll database for completion
    const pollInterval = setInterval(() => {
        const pollDb = new Database(path.join(__dirname, 'jobs.sqlite'));
        const job = pollDb.prepare('SELECT status, error FROM jobs WHERE wp_post_id = ?').get(wpPostId);
        pollDb.close();

        if (job) {
            if (job.status === 'completed') {
                clearInterval(pollInterval);
                console.log('\n✨ Pipeline Finished Successfully!');
                console.log('📄 Results saved to claude_response.html and claude_response.txt');
                process.exit(0);
            } else if (job.status === 'failed') {
                clearInterval(pollInterval);
                console.log(`\n❌ Pipeline Failed: ${job.error}`);
                process.exit(1);
            } else {
                process.stdout.write(`\rStatus: ${job.status}...   `);
            }
        }
    }, 5000);
}

runPipeline().catch(err => {
    console.error('💥 Fatal error in pipeline:', err);
    process.exit(1);
});
