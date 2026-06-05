require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PROFILE_DIR = path.join(__dirname, 'temp-chrome-data');

const CONFIG = {
headless: false,
timeout: 120000,
responseTimeout: 180000,
maxRetries: 3
};

function log(message) {
console.error(`[${new Date().toISOString()}] ${message}`);
}

function randomDelay(min = 1000, max = 3000) {
return new Promise(resolve =>
setTimeout(resolve,
Math.floor(Math.random() * (max - min + 1)) + min
)
);
}

async function saveFailure(page, error) {
try {
const timestamp = Date.now();

```
    await page.screenshot({
        path: `failure-${timestamp}.png`,
        fullPage: true
    });

    fs.writeFileSync(
        `failure-${timestamp}.txt`,
        String(error)
    );
} catch (_) {}
```

}

async function waitForResponse(page) {

```
const start = Date.now();
let previousText = '';
let stableCount = 0;

while (Date.now() - start < CONFIG.responseTimeout) {

    try {

        const blocks = await page.locator('.prose').all();

        if (blocks.length === 0) {
            await page.waitForTimeout(2000);
            continue;
        }

        const text =
            await blocks[blocks.length - 1].innerText();

        if (!text || text.length < 20) {
            await page.waitForTimeout(2000);
            continue;
        }

        if (text === previousText) {
            stableCount++;
        } else {
            stableCount = 0;
        }

        previousText = text;

        if (stableCount >= 3) {
            return text;
        }

        await page.waitForTimeout(3000);

    } catch (_) {
        await page.waitForTimeout(2000);
    }
}

throw new Error('Response timeout');
```

}

(async () => {

```
const prompt = process.argv[2];

if (!prompt) {
    console.log(JSON.stringify({
        success: false,
        error: 'No prompt supplied'
    }));
    process.exit(1);
}

let context;

try {

    log('Launching persistent browser');

    context =
        await chromium.launchPersistentContext(
            PROFILE_DIR,
            {
                headless: CONFIG.headless
            }
        );

    const page = await context.newPage();

    page.setDefaultTimeout(CONFIG.timeout);

    log('Opening Claude');

    await page.goto(
        'https://claude.ai/new',
        {
            waitUntil: 'networkidle'
        }
    );

    if (
        page.url().includes('login') ||
        page.url().includes('signin')
    ) {

        throw new Error(
            'Claude session expired. Login required.'
        );
    }

    await randomDelay();

    const input =
        page.locator(
            'div[contenteditable="true"]'
        ).first();

    await input.waitFor();

    log('Submitting prompt');

    await input.click();

    await input.pressSequentially(prompt);

    await page.keyboard.press('Enter');

    const response =
        await waitForResponse(page);

    const result = {
        success: true,
        response
    };

    console.log(JSON.stringify(result));

    await context.close();

} catch (error) {

    log(`ERROR: ${error.message}`);

    try {
        const pages = context?.pages?.() || [];

        if (pages.length) {
            await saveFailure(
                pages[0],
                error
            );
        }
    } catch (_) {}

    console.log(JSON.stringify({
        success: false,
        error: error.message
    }));

    if (context) {
        await context.close();
    }

    process.exit(1);
}
```

})();
