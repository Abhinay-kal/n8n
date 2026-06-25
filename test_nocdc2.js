const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launchPersistentContext('/Users/abhinaykalkhanday/Desktop/n8n/temp-chrome-data', { 
    headless: false, 
    channel: 'chrome',
    ignoreDefaultArgs: ["--enable-automation"],
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage();
  await page.goto('https://claude.ai');
  console.log('Opened. Waiting 30s...');
  await new Promise(r => setTimeout(r, 30000));
  console.log('Done wait.');
  await browser.close();
})();
