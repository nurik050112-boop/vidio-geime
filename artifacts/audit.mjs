import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173');
  await page.screenshot({ path: 'artifacts/after-landing-desktop.png', fullPage: true });
  await page.locator('.guest-button').click();
  await page.getByRole('button', { name: 'Пропустить', exact: true }).click();
  await page.waitForTimeout(5000);
  await page.locator('dialog button').filter({hasText:'Продолжить'}).click({ timeout: 500 }).catch(() => {});
  await page.screenshot({ path: 'artifacts/after-game-desktop.png' });
  console.log(JSON.stringify({ body: (await page.locator('body').innerText()).slice(0, 3000), errors }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/after-game-mobile.png' });
  console.log(JSON.stringify({ width: await page.evaluate(() => document.documentElement.scrollWidth), viewport: 390 }));
} finally { await browser.close(); }
