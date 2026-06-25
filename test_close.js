const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.on('close', () => console.log('PAGE_CLOSED fired!'));
    await page.evaluate(() => window.close());
    await new Promise(r => setTimeout(r, 2000));
    console.log('Done');
    await browser.close();
})();
