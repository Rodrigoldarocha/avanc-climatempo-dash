import { chromium } from 'playwright';

const dir = 'C:/Users/Rodri/.gemini/antigravity/brain/06e0c381-630e-4da2-af87-f1de63261b82';

async function shot(name, fn) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await fn(page);
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: false });
    console.log(`✓ ${name}`);
  } catch(e) {
    console.error(`✗ ${name}: ${e.message}`);
  }
  await browser.close();
}

(async () => {
  // Mobile dashboard (default)
  await shot('mob_dashboard', async (page) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  // Mobile locais grid
  await shot('mob_locais', async (page) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // Find all buttons and log them
    const allText = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a[href], [role="button"]'))
        .map(el => el.textContent?.trim()).filter(Boolean).slice(0, 20);
    });
    console.log('Clickable elements:', allText);
    // Click "Locais"
    const locais = page.locator('button, a').filter({ hasText: /^Locais$/ }).first();
    await locais.click({ timeout: 5000 });
    await page.waitForTimeout(3000);
  });

  // Mobile detail
  await shot('mob_detail', async (page) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const locais = page.locator('button, a').filter({ hasText: /^Locais$/ }).first();
    await locais.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    // Click first location card
    const cards = page.locator('[class*="card"], [class*="grid"] > button').first();
    await cards.click({ timeout: 5000 });
    await page.waitForTimeout(5000);
  });

  // Desktop dashboard
  await shot('desk_dashboard', async (page) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
  });

  // Desktop detail
  await shot('desk_detail', async (page) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const locais = page.locator('button, a').filter({ hasText: /^Locais$/ }).first();
    await locais.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    const cards = page.locator('[class*="grid"] > button').first();
    await cards.click({ timeout: 5000 });
    await page.waitForTimeout(5000);
  });

  console.log('Done!');
})();
