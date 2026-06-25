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
        
        const selectors = [
            'div[contenteditable="true"]',
            'fieldset div[contenteditable="true"]',
            '[data-testid="chat-input"]',
            'textarea[placeholder*="message" i]',
            'textarea[aria-label*="message" i]',
            'textarea[placeholder*="Reply" i]',
            '[aria-label*="Reply to Claude" i]',
            'text="Continue with Google"',
            'text="Email address"',
            'text="Sign in to Claude"',
            'text="Log in"',
            'text="Welcome back"'
        ];
        
        const promises = selectors.map(s => page.waitForSelector(s, { state: 'visible', timeout: 30000 }).then(() => s));
        const res = await Promise.any(promises);
        console.log('selector found:', res);
    } catch(e) {
        console.log('Error:', e.message);
    }
    await browser.close();
})();
