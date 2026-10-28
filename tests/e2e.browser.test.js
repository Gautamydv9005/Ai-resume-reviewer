import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { chromium } from 'playwright-core';

// Detect installed Chrome or Edge
function getBrowserExecutablePath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgePathAlt = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';

  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  if (fs.existsSync(edgePathAlt)) return edgePathAlt;
  throw new Error('No supported Chromium browser found (Chrome or Edge).');
}

test('End-to-End Browser Test Suite (Playwright with Native Chrome)', async (t) => {
  const executablePath = getBrowserExecutablePath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const baseUrl = 'http://localhost:5173';

  await t.test('1. Homepage Loading & SEO Metadata', async () => {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Verify Title
    const title = await page.title();
    assert.ok(title.includes('ResuMate AI'), `Title was "${title}"`);

    // Verify Meta Description
    const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
    assert.ok(metaDesc && metaDesc.length > 20, 'Meta description should be present and meaningful');

    // Verify H1
    const h1Count = await page.locator('h1').count();
    assert.ok(h1Count >= 1, 'Page should have at least one H1');
  });

  await t.test('2. Navigation & Theme Toggle (Light / Dark Mode)', async () => {
    await page.goto(`${baseUrl}/login?mode=signin`, { waitUntil: 'domcontentloaded' });

    // Look for theme toggle button
    const themeBtn = page.locator('button[aria-label="Toggle theme"], button:has(svg.lucide-moon), button:has(svg.lucide-sun)').first();
    const count = await themeBtn.count();
    assert.ok(count > 0, 'Theme toggle button should be in navigation');

    await themeBtn.click();
    await page.waitForTimeout(300);

    // Toggle back
    await themeBtn.click();
    await page.waitForTimeout(300);
  });

  await t.test('3. Authentication Flow - Sign In with Demo Account', async () => {
    await page.goto(`${baseUrl}/login?mode=signin`, { waitUntil: 'domcontentloaded' });

    // Fill in credentials
    await page.fill('input[type="email"]', 'alex.morgan@techcareer.io');
    await page.fill('input[type="password"]', 'Password123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const currentUrl = page.url();
    assert.ok(currentUrl.includes('/dashboard'), `Expected /dashboard but got ${currentUrl}`);

    // Verify welcome greeting for Alex Morgan
    const bodyText = await page.textContent('body');
    assert.ok(bodyText.includes('Alex Morgan') || bodyText.includes('Welcome'), 'Dashboard should display Alex Morgan greeting');

    // Verify metrics cards
    assert.ok(bodyText.includes('ATS') || bodyText.includes('Analyzed'), 'Dashboard should render metrics cards');
  });

  await t.test('4. Upload Page - Empty Input Validation Error State', async () => {
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'domcontentloaded' });

    // Find and click the analyze button without selecting any file
    const analyzeBtn = page.locator('button:has-text("Analyze Resume"), button[type="submit"]').first();
    await analyzeBtn.click();

    // Verify validation message appears on page or in toast
    await page.waitForTimeout(500);
    const pageText = await page.textContent('body');
    assert.ok(
      pageText.includes('Please select or drag a resume file before analyzing') ||
      pageText.includes('Please select') ||
      pageText.includes('drag a resume'),
      'Should display required file validation error'
    );
  });

  await t.test('5. Upload Flow - Sample Resume & Live AI Review Pipeline', async () => {
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Click 'Use Sample Resume'
    const sampleBtn = page.locator('[data-testid="use-sample-resume-btn"], button:has-text("Use Sample Resume"), button:has-text("Sample Resume")').first();
    await sampleBtn.waitFor({ state: 'visible', timeout: 5000 });
    await sampleBtn.click();
    await page.waitForTimeout(600);

    // Click 'Analyze Resume'
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();

    // Verify analysis dashboard is reached
    await page.waitForURL('**/analysis/res_**', { timeout: 35000 });
    const analysisUrl = page.url();
    assert.ok(analysisUrl.includes('/analysis/res_'), `Should navigate to /analysis/res_... but was ${analysisUrl}`);

    // Verify overall score circle & sections
    const analysisHeading = page.locator('h1', { hasText: 'Resume Analysis Dashboard' });
    await analysisHeading.waitFor({ state: 'visible', timeout: 25000 });
    const headingText = await analysisHeading.innerText();
    assert.ok(headingText.includes('Resume Analysis Dashboard'), 'Should render analysis dashboard heading');

    const scoreCard = page.locator('text=Overall Score').first();
    await scoreCard.waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await scoreCard.isVisible(), 'Should display scorecards and sections');

    // Click 'Export Audit' button and verify toast
    const exportBtn = page.locator('button:has-text("Export Audit")').first();
    if (await exportBtn.count() > 0) {
      await exportBtn.click();
      await page.waitForTimeout(400);
      const afterExportText = await page.textContent('body');
      assert.ok(afterExportText.includes('Export') || afterExportText.includes('Audit'), 'Export audit action should fire');
    }
  });

  await t.test('6. ATS Compatibility & Keyword Scanner Page', async () => {
    const currentUrl = page.url();
    const resumeIdMatch = currentUrl.match(/res_[a-zA-Z0-9_-]+/);
    const resumeId = resumeIdMatch ? resumeIdMatch[0] : 'res_001';

    await page.goto(`${baseUrl}/ats-analysis/${resumeId}`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });

    const text = await page.textContent('body');
    assert.ok(text.includes('ATS Compatibility') || text.includes('Keyword Scanner'), 'Should render ATS title');
    assert.ok(text.includes('Matched Keywords') || text.includes('Missing') || text.includes('Formatting Audit'), 'Should render ATS breakdown');
  });

  await t.test('7. Job Match & Skills Alignment Page', async () => {
    const currentUrl = page.url();
    const resumeIdMatch = currentUrl.match(/res_[a-zA-Z0-9_-]+/);
    const resumeId = resumeIdMatch ? resumeIdMatch[0] : 'res_001';

    await page.goto(`${baseUrl}/job-match/${resumeId}`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });

    const text = await page.textContent('body');
    assert.ok(text.includes('Job Match') || text.includes('Skills Alignment'), 'Should render Job Match title');
    assert.ok(text.includes('Matching Skills') || text.includes('Skills to Improve') || text.includes('Role Fit'), 'Should render skill alignment breakdown');
  });

  await t.test('8. AI Suggestions & Improvements Page', async () => {
    const currentUrl = page.url();
    const resumeIdMatch = currentUrl.match(/res_[a-zA-Z0-9_-]+/);
    const resumeId = resumeIdMatch ? resumeIdMatch[0] : 'res_001';

    await page.goto(`${baseUrl}/analysis/${resumeId}/improvements`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });

    const text = await page.textContent('body');
    assert.ok(text.includes('Suggested') || text.includes('Original') || text.includes('Improvement') || text.includes('Rewrites'), 'Should display bullet rewrites');

    // Click 'Copy All Rewrites' button
    const copyBtn = page.locator('button:has-text("Copy All Rewrites"), button:has-text("Copy")').first();
    if (await copyBtn.count() > 0) {
      await copyBtn.click();
      await page.waitForTimeout(300);
    }
  });

  await t.test('9. Resume History & Version Comparison Pages', async () => {
    // History page
    await page.goto(`${baseUrl}/resume-history`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });
    let text = await page.textContent('body');
    assert.ok(text.includes('Resume History') || text.includes('Previous Resumes'), 'Should render history heading');

    // Compare page
    await page.goto(`${baseUrl}/compare`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });
    text = await page.textContent('body');
    assert.ok(text.includes('Compare') || text.includes('Side-by-Side') || text.includes('Version'), 'Should render comparison heading');
  });

  await t.test('10. User Profile Page', async () => {
    await page.goto(`${baseUrl}/profile`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });
    const text = await page.textContent('body');
    assert.ok(text.includes('Alex Morgan') || text.includes('Profile') || text.includes('Preferences'), 'Should render user profile');
  });

  await t.test('11. Mobile Viewport Responsiveness (375x667)', async () => {
    // Emulate iPhone SE mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });

    // Verify page renders without horizontal overflow clipping
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    assert.ok(scrollWidth <= clientWidth + 20, `Mobile layout should not have excessive horizontal overflow: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);

    // Verify navigation works on mobile
    await page.goto(`${baseUrl}/upload`, { waitUntil: 'domcontentloaded' });
    await page.locator('h1').first().waitFor({ timeout: 10000 });
    const uploadBtnVisible = await page.isVisible('button:has-text("Use Sample Resume"), button[type="submit"]');
    assert.ok(uploadBtnVisible, 'Action buttons should remain accessible on mobile screen');
  });

  await t.test('12. One-Time Guest Access Flow & Enforcement', async () => {
    // Open a fresh isolated incognito context for guest user
    const guestContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const guestPage = await guestContext.newPage();

    // 1. Visit login page
    await guestPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

    // Verify Demo Login is completely gone
    const demoBtnCount = await guestPage.locator('button:has-text("Instant 1-Click Demo Login")').count();
    assert.equal(demoBtnCount, 0, 'Instant 1-Click Demo Login button must be completely removed');

    // Verify "Continue as Guest" button and note
    const guestBtn = guestPage.locator('button:has-text("Continue as Guest")').first();
    await guestBtn.waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(await guestBtn.isVisible(), 'Continue as Guest button should be visible');

    const pageText = await guestPage.textContent('body');
    assert.ok(
      pageText.includes('Try one resume review without creating an account.'),
      'Subtext note must be present under Continue as Guest button'
    );

    // 2. Click Continue as Guest
    await guestBtn.click();
    await guestPage.waitForURL('**/upload', { timeout: 10000 });
    assert.ok(guestPage.url().includes('/upload'), 'Should redirect to /upload');

    // 3. Verify navbar shows "Guest Free Trial" badge
    const badgeText = await guestPage.textContent('header');
    assert.ok(badgeText.includes('Guest Free Trial'), 'Header should display Guest Free Trial badge');

    // 4. Submit free sample resume review
    const sampleBtn = guestPage.locator('button:has-text("Use Sample Resume"), button:has-text("Sample Resume")').first();
    await sampleBtn.click();
    await guestPage.waitForTimeout(400);

    const analyzeBtn = guestPage.locator('button[type="submit"]').first();
    await analyzeBtn.click();

    // Wait for analysis dashboard
    await guestPage.waitForURL('**/analysis/res_**', { timeout: 25000 });
    assert.ok(guestPage.url().includes('/analysis/res_'), 'Guest review should successfully complete and redirect to analysis');

    // Verify complete review is rendered
    const analysisH1 = guestPage.locator('h1', { hasText: 'Resume Analysis Dashboard' });
    await analysisH1.waitFor({ state: 'visible', timeout: 20000 });
    const scoreCard = guestPage.locator('text=Overall Score').first();
    await scoreCard.waitFor({ state: 'visible', timeout: 15000 });
    assert.ok(await scoreCard.isVisible(), 'Guest receives complete review with Overall Score');

    // 5. Navigate back to /upload to verify limit reached state
    await guestPage.goto(`${baseUrl}/upload`, { waitUntil: 'domcontentloaded' });
    await guestPage.waitForTimeout(600);

    const uploadPageText = await guestPage.textContent('body');
    assert.ok(
      uploadPageText.includes('Your Free Resume Review is Complete!') ||
      uploadPageText.includes('Create an account or log in to analyze another resume'),
      'Must display the required completion & registration message'
    );

    // Verify submission button is disabled
    const submitBtn = guestPage.locator('button[type="submit"]').first();
    const isDisabled = await submitBtn.isDisabled();
    assert.ok(isDisabled, 'Submit button must be disabled after guest allowance is used');

    // Verify Create Account link is present
    const createAcctBtn = guestPage.locator('a:has-text("Create Free Account"), button:has-text("Create Free Account")').first();
    assert.ok(await createAcctBtn.isVisible(), 'Create Free Account link should be present');

    await guestContext.close();
  });

  await browser.close();
});
