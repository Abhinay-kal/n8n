const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launchPersistentContext(
        '/Users/abhinaykalkhanday/Desktop/n8n/temp-chrome-data',
        {
            headless: false,
            channel: 'chrome',
            args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
        }
    );
    const page = await browser.newPage();
    console.log('Navigating to Claude...');
    await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    console.log('Waiting 5s...');
    await page.waitForTimeout(5000);
    
    console.log('Getting HTML...');
    const html = await page.content();
    fs.writeFileSync('claude_dump.html', html);
    
    console.log('Done.');
    await browser.close();
})();
