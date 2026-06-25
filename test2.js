const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launchPersistentContext(
        '/Users/abhinaykalkhanday/Desktop/n8n/temp-chrome-data',
        {
            headless: false,
            channel: 'chrome',
            args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
        }
    );
    const page = browser.pages()[0];
    page.on('close', () => console.log('PAGE CLOSED'));
    try {
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('goto done');
        await page.waitForSelector('div[contenteditable="true"]', { timeout: 30000 });
        console.log('selector found');
    } catch(e) {
        console.log('Error:', e.message);
    }
    await browser.close();
})();
