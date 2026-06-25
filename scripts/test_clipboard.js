const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testTyping() {
    const profilePath = path.join(__dirname, 'temp-chrome-data');
    console.log('Using profile:', profilePath);

    const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        channel: 'chrome',
        args: [
            '--no-sandbox',
            '--disable-extensions',
            '--disable-component-extensions-with-background-pages',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    
    page.on('close', () => console.log('EVENT: Page closed!'));
    page.on('crash', () => console.log('EVENT: Page crashed!'));

    try {
        console.log('Navigating...');
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded' });
        
        console.log("Sleeping 10 seconds...");
        await new Promise(r => setTimeout(r, 10000));
        
        console.log("Survived 10 seconds!");
        
    } catch (e) {
        console.error("Caught error:", e.message);
    } finally {
        await context.close();
    }
}

testTyping();