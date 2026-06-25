const { chromium } = require('playwright');
const path = require('path');

async function snapshot() {
    const profilePath = path.join(__dirname, 'temp-chrome-data');
    console.log('Using profile:', profilePath);

    const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        channel: 'chrome',
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-infobars',
            '--disable-dev-shm-usage',
            '--disable-browser-side-navigation',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    const pages = context.pages();
    const page = pages[0];
    
    try {
        console.log('Navigating to Claude...');
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 5000)); // wait for load
        console.log('URL:', page.url());
        
        const selectors = [
            '.font-claude-message',
            '[data-message-author-role="assistant"]',
            '.grid-cols-1.gap-y-3',
            'article',
            'main article',
            'main [class*="assistant"]',
            '[data-testid*="assistant"]',
            '.flex-1.flex.flex-col.gap-3',
            'main'
        ];

        for (const sel of selectors) {
            const elements = await page.$$(sel);
            console.log(`\n--- Selector: ${sel} (${elements.length} found) ---`);
            for (let i = 0; i < elements.length; i++) {
                const isVis = await elements[i].isVisible();
                const text = await elements[i].innerText().catch(e => e.message);
                console.log(`[${i}] visible: ${isVis}, length: ${text.length}, preview: ${text.slice(0, 50).replace(/\n/g, ' ')}`);
            }
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await context.close();
    }
}

snapshot();