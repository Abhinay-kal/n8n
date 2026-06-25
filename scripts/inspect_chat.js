const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
    const profilePath = path.join(__dirname, '../temp-chrome-data');
    console.log('Using profile:', profilePath);

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
        console.log('Current URL:', page.url());

        // Find chat links
        const links = await page.locator('a[href*="/chat/"]').evaluateAll(elements => elements.map(el => el.href));
        console.log('Found chat links:', links);

        if (links.length > 0) {
            const latestChatUrl = links[0];
            console.log('Navigating to latest chat:', latestChatUrl);
            await page.goto(latestChatUrl, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(5000);

            // Get all messages
            const messages = await page.locator('[data-message-author-role]').evaluateAll(elements => 
                elements.map(el => ({
                    role: el.getAttribute('data-message-author-role'),
                    text: el.textContent.trim().substring(0, 300) + '...'
                }))
            );
            console.log('Chat messages:', JSON.stringify(messages, null, 2));

            await page.screenshot({ path: path.join(__dirname, '../latest_chat.png') });
            console.log('Screenshot saved to latest_chat.png');
        } else {
            console.log('No chat links found!');
        }

    } catch (e) {
        console.error('Error during inspection:', e);
    } finally {
        await context.close();
    }
}

main();
