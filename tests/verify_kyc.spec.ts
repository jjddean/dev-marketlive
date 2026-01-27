import { test, expect } from '@playwright/test';

test('Verify KYC Flow', async ({ page }) => {
    // Capture console logs to debug
    page.on('console', msg => console.log(`BROWSER LOAD: ${msg.text()}`));

    try {
        // 1. Navigate to Compliance Page
        console.log('Navigating to compliance...');
        await page.goto('http://localhost:5173/compliance');
        await page.waitForLoadState('networkidle');

        // 2. Open Modal
        console.log('Looking for Start button...');
        const startBtn = page.getByRole('button', { name: /Start KYC Process|Verification Active|Verification Complete|Submission Received/i });

        if (await startBtn.isVisible()) {
            console.log('Button found, clicking...');
            await startBtn.click();
        } else {
            console.log('Start button not found. Dumping page text:');
            const text = await page.innerText('body');
            console.log(text.substring(0, 500)); // First 500 chars
            throw new Error('Start button not visible');
        }

        // 3. Handle Potential "Already Submitted" State
        const statusHeading = page.getByRole('heading', { name: /Submission Received|Verification Complete/i });
        if (await statusHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('KYC already submitted/verified. Cleaning up...');
            const restartBtn = page.getByRole('button', { name: 'Submit Another (Test)' });
            if (await restartBtn.isVisible()) {
                await restartBtn.click();
            } else {
                console.log('No restart button, test complete (already verified state).');
                return;
            }
        }

        // 4. Fill Detail Form (Step 1)
        console.log('Filling form...');
        await page.fill('input[placeholder="Acme Logistics Ltd"]', 'Playwright Logistics Ltd');
        await page.fill('input[placeholder="12345678"]', '99998888');
        await page.click('button:has-text("Continue")');

        // 5. Upload Step (Step 2)
        console.log('Uploading file...');
        await page.setInputFiles('input[type="file"] >> nth=0', {
            name: 'file.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('dummy content')
        });

        // Wait for UI update
        await page.waitForTimeout(2000);

        // 6. Submit
        console.log('Submitting...');
        const submitBtn = page.getByRole('button', { name: 'Submit for Review' });
        await expect(submitBtn).toBeEnabled({ timeout: 5000 });
        await submitBtn.click();

        // 7. Verify Success
        console.log('Verifying success...');
        await expect(page.getByText('Submission Received')).toBeVisible({ timeout: 10000 });
        console.log('TEST PASSED');

    } catch (error) {
        console.error('TEST FAILED:', error);
        await page.screenshot({ path: 'failure.png' });
        throw error;
    }
});
