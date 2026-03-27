const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3005';
const EMAIL = 'test@test.com';
const PASSWORD = 'password123';

const results = [];

function report(scenario, pass, detail = '') {
  results.push({ scenario, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${scenario}${detail ? ': ' + detail : ''}`);
}

async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('#email', EMAIL);
  await page.fill('#password', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Test 1: Unauthenticated redirect
  {
    const page = await browser.newPage();
    try {
      await page.goto(`${BASE_URL}/profile`);
      await page.waitForLoadState('networkidle');
      const url = page.url();
      if (url.includes('/login')) {
        report('Unauthenticated redirect to /login', true, `Redirected to: ${url}`);
      } else {
        report('Unauthenticated redirect to /login', false, `Stayed at: ${url}`);
      }
    } catch (e) {
      report('Unauthenticated redirect to /login', false, e.message.substring(0, 200));
    }
    await page.close();
  }

  // Authenticated session
  const page = await browser.newPage();
  try {
    await login(page);
    report('Login with credentials', true, `Landed at: ${page.url()}`);
  } catch (e) {
    report('Login with credentials', false, e.message.substring(0, 200));
    await browser.close();
    printSummary();
    return;
  }

  // Test 2: Profile page renders (name, status, avatar visible)
  try {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const url = page.url();
    if (url.includes('/login')) {
      report('Profile page renders (authenticated)', false, 'Redirected to login');
    } else {
      const nameInput = await page.locator('#profile-name').count();
      const statusInput = await page.locator('#profile-status').count();
      const avatarElements = await page.locator('[class*="avatar" i], [class*="Avatar"]').count();
      report('Profile page renders (name, status, avatar visible)',
        nameInput > 0 && statusInput > 0 && avatarElements > 0,
        `Name input: ${nameInput}, Status input: ${statusInput}, Avatar elements: ${avatarElements}`);
    }
  } catch (e) {
    report('Profile page renders (authenticated)', false, e.message.substring(0, 200));
  }

  // Test 3: Name field editable and saves
  try {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const nameInput = page.locator('#profile-name');
    await nameInput.waitFor({ timeout: 8000 });
    await nameInput.click({ clickCount: 3 });
    await nameInput.fill('Updated Profile Name');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    // Check if name persisted after reload
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const currentValue = await page.locator('#profile-name').inputValue();
    report('Name field editable and persists after save',
      currentValue === 'Updated Profile Name',
      `Saved value: "${currentValue}"`);
  } catch (e) {
    report('Name field editable and persists after save', false, e.message.substring(0, 200));
  }

  // Test 4: Status field editable and saves
  try {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const statusInput = page.locator('#profile-status');
    await statusInput.waitFor({ timeout: 8000 });
    await statusInput.click({ clickCount: 3 });
    await statusInput.fill('Learning every day');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const currentValue = await page.locator('#profile-status').inputValue();
    report('Status field editable and persists after save',
      currentValue === 'Learning every day',
      `Saved value: "${currentValue}"`);
  } catch (e) {
    report('Status field editable and persists after save', false, e.message.substring(0, 200));
  }

  // Test 5: Avatar section visible with file input
  try {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const avatarElements = await page.locator('[class*="avatar" i], [class*="Avatar"]').count();
    const fileInput = await page.locator('input[type="file"]').count();
    const changePhotoBtn = await page.getByText(/change photo|ganti foto/i).count();
    report('Avatar section visible with file input',
      avatarElements > 0 && fileInput > 0,
      `Avatar elements: ${avatarElements}, File inputs: ${fileInput}, Change Photo buttons: ${changePhotoBtn}`);
  } catch (e) {
    report('Avatar section visible with file input', false, e.message.substring(0, 200));
  }

  // Test 6: First Steps badge banner — only shown when profile is complete
  // After saving name + status above, user still has no image, so badge is not eligible yet.
  // The badge section should be hidden since neither eligible nor claimed.
  // This tests that the badge correctly does NOT show for incomplete profile.
  try {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const badgeBanner = await page.locator('[class*="badgeBanner"]').count();
    const badgeText = await page.getByText(/first steps|langkah pertama/i).count();
    // Badge should NOT show (user has no image uploaded yet — profile incomplete)
    report('First Steps badge hidden when profile incomplete (no image)',
      badgeBanner === 0 && badgeText === 0,
      `Badge banner: ${badgeBanner}, Badge text: ${badgeText} — correctly hidden`);
  } catch (e) {
    report('First Steps badge hidden when profile incomplete', false, e.message.substring(0, 200));
  }

  // Test 7: Responsive at 375px
  try {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const winWidth = await page.evaluate(() => window.innerWidth);
    report('Responsive layout at 375px (no horizontal overflow)',
      scrollWidth <= winWidth + 5,
      `Scroll width: ${scrollWidth}px, Window: ${winWidth}px`);
  } catch (e) {
    report('Responsive layout at 375px', false, e.message.substring(0, 200));
  }

  await browser.close();
  printSummary();

  function printSummary() {
    console.log('\n========================================');
    console.log('         PROFILE UI TEST REPORT        ');
    console.log('========================================');
    let passed = 0, failed = 0;
    for (const r of results) {
      const status = r.pass ? '[PASS]' : '[FAIL]';
      console.log(`${status}  ${r.scenario}`);
      if (r.detail) console.log(`         ${r.detail}`);
    }
    console.log('----------------------------------------');
    const total = results.length;
    results.forEach(r => r.pass ? passed++ : failed++);
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Overall Result: ${failed === 0 ? 'PASS' : 'FAIL'}`);
    console.log('========================================');
  }
})();
