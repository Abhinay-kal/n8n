const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SELECTORS = [
    '[data-message-author-role="assistant"]',
    '.font-claude-response-body',
    '.font-claude-message',
    'main [class*="assistant"]',
    '[data-testid*="assistant"]'
];

async function main() {
    const profilePath = path.join(__dirname, '../temp-chrome-data');
    const context = await chromium.launchPersistentContext(profilePath, {
        headless: false,
        channel: 'chrome',
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox'
        ]
    });

    const page = context.pages()[0] || await context.newPage();
    try {
        console.log('Navigating to Claude...');
        await page.goto('https://claude.ai', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);

        const links = await page.locator('a[href*="/chat/"]').evaluateAll(elements => elements.map(el => el.href));
        if (links.length > 0) {
            const latestChatUrl = links[0];
            console.log('Navigating to latest chat:', latestChatUrl);
            await page.goto(latestChatUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);

            for (const selector of SELECTORS) {
                const locator = page.locator(selector);
                const count = await locator.count();
                console.log(`\n--- Selector: "${selector}" (matches: ${count}) ---`);
                for (let i = 0; i < count; i++) {
                    const node = locator.nth(i);
                    const text = await node.textContent().catch(() => '');
                    const html = await node.innerHTML().catch(() => '');
                    console.log(`[${i}] Text (first 100 chars): "${text.trim().substring(0, 100)}"`);
                    console.log(`[${i}] HTML (first 200 chars): "${html.trim().substring(0, 200)}"`);
                }
            }
        } else {
            console.log('No chat links found!');
        }

    } catch (e) {
        console.error('Error during DOM inspection:', e);
    } finally {
        await context.close();
    }
}

main();
