import { test, expect } from '@playwright/test';

test('Guest Experience Verification', async ({ page }) => {
    // 1. Landing Page
    console.log('Navigating to Landing Page...');
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle(/Clearship|MarketLive/i);

    // Verify 3D Map (indirectly via canvas presence)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    console.log('Landing Page Loaded with Map.');

    // 2. Waitlist Flow
    console.log('Navigating to Waitlist...');
    await page.goto('http://localhost:5173/access');

    // Fill Email
    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill('v1_auto_verify@test.com');

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Verify Success
    // Look for "success" text or toast
    const successIndicator = page.getByText(/success|joined|welcome/i);
    await expect(successIndicator).toBeVisible({ timeout: 10000 });

    console.log('Waitlist Joined Successfully.');
});
