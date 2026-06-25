# System Design & Anti-Bot Evasion Strategy
**Claude Worker Foundation**

This document outlines the advanced system design choices and specific anti-bot evasion techniques implemented in this project to reliably automate interactions with the Claude Web UI without triggering Cloudflare Turnstile or Claude's internal bot-protection systems.

---

## 🛡️ Anti-Bot & Evasion Techniques

### 1. Cloudflare Turnstile Evasion (Passive CDP Monitoring)
Most automation scripts fail at the Cloudflare Turnstile challenge because they actively poll the DOM (e.g., using `page.waitForSelector` or `page.evaluate`) to check if the challenge is solved. 
**Our Strategy:** Turnstile actively monitors and penalizes CDP (Chrome DevTools Protocol) DOM evaluation. To bypass this, our `ClaudeManager` avoids querying the DOM entirely while the challenge is active. Instead, it relies *passively* on network navigation events using `page.waitForURL`. This does not inject any evaluation scripts into the renderer, allowing the challenge to pass naturally as a human's browser would.

### 2. Stealth Plugin Initialization Fix
We utilize `playwright-extra` coupled with `puppeteer-extra-plugin-stealth` to spoof standard webdriver fingerprints (e.g., masking the `navigator.webdriver` flag, mocking WebGL, and adding missing plugins).
**Our Strategy:** A known flaw in Playwright's `launchPersistentContext` is that the stealth plugin often fails to hook into the very first automatically generated page. Our `BrowserManager` explicitly intercepts this: it closes the default zombie page immediately and spawns a fresh `context.newPage()`. This guarantees that the stealth scripts are injected into the execution context before any network requests are made.

### 3. Chromium Launch Argument Hardening
We strip standard automation flags that reveal the browser's automated nature to the target server.
**Our Strategy:** 
- We pass `--disable-blink-features=AutomationControlled` to prevent Chrome from announcing its automated state to the DOM.
- We utilize `ignoreDefaultArgs: ['--enable-automation']` to suppress the "Chrome is being controlled by automated test software" infobar and internal flags.
- We remove the sandbox (`--no-sandbox`, `--disable-setuid-sandbox`) to allow deeper OS-level execution without tripping restricted container heuristics.

---

## 🏛️ System Design & Architecture

### Stateful, Persistent Workers
Instead of launching a fresh, cold browser for every request (which is a massive red flag for bot detection systems), the `BrowserManager` maintains a persistent user data directory. This ensures that session cookies, cached assets, and trust tokens are retained across runs, mimicking a long-lived, trusted human user session.

### Finite State Machine (FSM) Recovery
The `PersistentWorkerState` tracks exactly what phase the automation is in. If the Claude UI changes dynamically or the page crashes (e.g., `Target page, context or browser has been closed`), the `FailureClassifier` interprets the error. Instead of failing the job, the system gracefully recycles the browser context, restores the session, and retries the prompt seamlessly.

### Decoupled Job Queue (SQLite)
To prevent prompt loss during a browser crash, jobs are serialized into a persistent SQLite database (`jobs.sqlite`) with a `status` tracking system (`pending`, `processing`, `completed`, `failed`). This guarantees exactly-once processing even if the node process abruptly exits.
