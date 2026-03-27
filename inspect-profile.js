const { chromium } = require('playwright');
const BASE_URL = 'http://localhost:3005';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('#email', 'test@test.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.href.includes('/login'), { timeout: 15000 });

  // Go to profile
  await page.goto(`${BASE_URL}/profile`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Get all inputs
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, textarea')).map(el => ({
      tag: el.tagName,
      name: el.getAttribute('name'),
      id: el.getAttribute('id'),
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      class: el.className.substring(0, 80)
    }));
  });
  console.log('INPUTS:', JSON.stringify(inputs, null, 2));

  // Get all elements containing badge-related text
  const badgeInfo = await page.evaluate(() => {
    const all = document.querySelectorAll('[class*="badge"], [class*="Badge"], [class*="first"], [class*="banner"]');
    return Array.from(all).map(el => ({
      class: el.className.substring(0, 100),
      text: el.textContent?.substring(0, 100)
    }));
  });
  console.log('BADGE ELEMENTS:', JSON.stringify(badgeInfo, null, 2));

  // Get page text summary
  const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('PAGE TEXT:', pageText);

  await browser.close();
})();
