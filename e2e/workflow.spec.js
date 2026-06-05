const { test, expect } = require('@playwright/test');
const path = require('path');

test('local workflow test', async ({ page }) => {
  // Navigate to the local index.html file
  const filePath = 'file://' + path.resolve('index.html');
  await page.goto(filePath);

  // Check the initial state
  await expect(page).toHaveTitle(/Playwright Workflow Demo/);
  await expect(page.locator('#result')).toBeEmpty();

  // Click the button
  const button = page.locator('#trigger-btn');
  await button.click();

  // Verify the result message
  await expect(page.locator('#result')).toHaveText('Workflow Successfully Executed!');
  
  // Verify button state change
  await expect(button).toHaveText('Done');
  await expect(button).toBeDisabled();
});
