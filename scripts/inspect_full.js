const { chromium } = require('playwright');
const path = require('path');

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

            const selector = '.font-claude-response';
            const locator = page.locator(selector);
            const count = await locator.count();
            console.log(`\nFound ${count} elements matching "${selector}":`);
            for (let i = 0; i < count; i++) {
                const node = locator.nth(i);
                const text = await node.textContent().catch(() => '');
                const tagName = await node.evaluate(el => el.tagName.toLowerCase());
                const className = await node.evaluate(el => el.className);
                console.log(`[${i}] <${tagName} class="${className}">`);
                console.log(`    Text (length ${text.trim().length}): "${text.trim().substring(0, 300)}"`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await context.close();
    }
}

main();
