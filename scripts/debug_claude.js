const { chromium } = require('playwright');
const path = require('path');

async function debugClaude() {
    const userDataDir = path.join(__dirname, 'chrome-profile');
    const browser = await chromium.launchPersistentContext(userDataDir, {
        headless: true, // Keep it headless for now, I can't see the UI anyway
    });

    const page = await browser.newPage();
    try {
        console.log('Navigating to https://claude.ai...');
        await page.goto('https://claude.ai', { waitUntil: 'networkidle' });
        console.log('Current URL:', page.url());

        const html = await page.content();
        const fs = require('fs');
        fs.writeFileSync('debug_claude.html', html);
        console.log('HTML saved to debug_claude.html');

        // Check for common input selectors
        const selectors = [
            'div[contenteditable="true"]',
            'textarea',
            '[data-testid*="chat"]',
            '[aria-label*="Write"]',
            'p[data-placeholder]'
        ];

        for (const selector of selectors) {
            const element = await page.$(selector);
            console.log(`Selector "${selector}": ${element ? 'FOUND' : 'NOT FOUND'}`);
        }

    } catch (error) {
        console.error('Error during debug:', error);
    } finally {
        await browser.close();
    }
}

debugClaude();
