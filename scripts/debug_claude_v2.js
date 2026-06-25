const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function debugClaude() {
    const profilePath = path.join(__dirname, 'temp-chrome-data');
    console.log('Using profile:', profilePath);

    const context = await chromium.launchPersistentContext(profilePath, {
        headless: true,
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

    const page = await context.newPage();
    try {
        console.log('Navigating to https://claude.ai...');
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('Current URL:', page.url());

        // Wait a bit for JS to render
        await new Promise(r => setTimeout(r, 5000));

        const html = await page.content();
        fs.writeFileSync('debug_claude.html', html);
        console.log('HTML saved to debug_claude.html');

        const selectors = [
            'div[contenteditable="true"]',
            'textarea',
            '[data-testid*="chat"]',
            '[aria-label*="Write"]',
            'p[data-placeholder]',
            'div[contenteditable="true"][role="textbox"]',
            'div.ProseMirror'
        ];

        for (const selector of selectors) {
            const elements = await page.$$(selector);
            console.log(`Selector "${selector}": ${elements.length} matches`);
            for (let i = 0; i < elements.length; i++) {
                const isVisible = await elements[i].isVisible();
                const innerText = await elements[i].innerText();
                const placeholder = await elements[i].getAttribute('placeholder') || await elements[i].getAttribute('data-placeholder');
                console.log(`  [${i}] Visible: ${isVisible}, Text: "${innerText.slice(0, 20)}...", Placeholder: "${placeholder}"`);
            }
        }

        await page.screenshot({ path: 'debug_claude.png' });
        console.log('Screenshot saved to debug_claude.png');

    } catch (error) {
        console.error('Error during debug:', error);
    } finally {
        await context.close();
    }
}

debugClaude();
