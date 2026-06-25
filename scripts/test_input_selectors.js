const { chromium } = require('playwright');
const path = require('path');

async function snapshot() {
    const profilePath = path.join(__dirname, 'temp-chrome-data');
    console.log('Using profile:', profilePath);

    const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        channel: 'chrome',
        args: [
            '--no-sandbox'
        ]
    });

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    
    try {
        console.log('Navigating to Claude...');
        await page.goto('https://claude.ai', { waitUntil: 'networkidle' });
        console.log('URL:', page.url());
        
        const selectors = [
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"]',
            '.ProseMirror',
            '[data-testid="chat-input"]',
            'textarea[placeholder*="Claude"]',
            'textarea',
            '[aria-label*="Write a message"]',
            '[data-testid*="chat"]'
        ];

        for (const sel of selectors) {
            const elements = await page.$$(sel);
            console.log(`\n--- Input Selector: ${sel} (${elements.length} found) ---`);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await context.close();
    }
}

snapshot();