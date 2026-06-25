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

            // Let's inspect the hierarchy of parent elements for the first .font-claude-response-body
            const parents = await page.locator('.font-claude-response-body').first().evaluate(node => {
                let current = node;
                const path = [];
                while (current && current.tagName.toLowerCase() !== 'body') {
                    path.push({
                        tagName: current.tagName.toLowerCase(),
                        id: current.id,
                        className: current.className,
                        attributes: Array.from(current.attributes).map(attr => `${attr.name}="${attr.value}"`)
                    });
                    current = current.parentElement;
                }
                return path;
            });

            console.log('Parent hierarchy:');
            console.log(JSON.stringify(parents, null, 2));

        } else {
            console.log('No chat links found!');
        }

    } catch (e) {
        console.error('Error during parent inspection:', e);
    } finally {
        await context.close();
    }
}

main();
