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
    await browser.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.close = function() { console.log('Blocked window.close'); };
    });
    const page = browser.pages()[0];
    page.on('close', () => console.log('PAGE CLOSED'));
    try {
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded', timeout: 30000 });
        console.log('goto done');
    } catch(e) {
        console.log('Error:', e.message);
    }
    await browser.close();
})();
