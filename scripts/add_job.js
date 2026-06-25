const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'jobs.sqlite'));

async function addJob() {
    try {
        const promptPath = path.join(__dirname, 'prompts', 'input.txt');
        if (!fs.existsSync(promptPath)) {
            console.error('Error: prompts/input.txt not found.');
            return;
        }

        const prompt = fs.readFileSync(promptPath, 'utf8').trim();
        if (!prompt) {
            console.error('Error: prompts/input.txt is empty.');
            return;
        }

        const now = new Date().toISOString();
        const wpPostId = Date.now(); // Unique ID

        const stmt = db.prepare(`
            INSERT INTO jobs (wp_post_id, prompt, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(wpPostId, prompt, 'pending', now, now);
        console.log(`Job added successfully! ID: ${info.lastInsertRowid}, wp_post_id: ${wpPostId}`);
        console.log('--- Prompt Content ---');
        console.log(prompt);
        console.log('----------------------');

    } catch (error) {
        console.error('Failed to add job:', error.message);
    } finally {
        db.close();
    }
}

addJob();
