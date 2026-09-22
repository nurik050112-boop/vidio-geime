import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.setItem('dragon-game-guest-mode', 'yes'));
  const page = await context.newPage();
  await page.goto(`${process.env.TEST_URL ?? 'http://127.0.0.1:5173'}/achievements`);
  await page.locator('.achievement-list').waitFor();
  const submit = async code => {
    await page.locator('.achievement-code-form input').fill(code);
    await page.locator('.achievement-code-form button').click();
  };
  assert.equal(await page.locator('.teleport-button').count(), 0);
  await submit('0009000ddd');
  await page.locator('.teleport-button').first().waitFor();
  assert(await page.locator('.teleport-button').count() > 0);
  const trophies = await page.locator('.achievement.unlocked').count();
  await page.reload();
  await page.locator('.achievement-list').waitFor();
  assert.equal(await page.locator('.achievement.unlocked').count(), trophies, 'Trophies persist');
  assert.equal(await page.locator('.teleport-button').count(), 0, 'Teleport resets on re-entry');
  await submit('wrong-code');
  assert.equal(await page.locator('.teleport-button').count(), 0, 'Wrong code does not grant access');
  await submit('98981n');
  await page.locator('.teleport-button').first().waitFor();
  assert(await page.locator('.teleport-button').count() > 0, 'Re-entering the code grants access');
  await page.getByRole('link', { name: 'Пылающий мир', exact: true }).click();
  await page.locator('.world-page').waitFor();
  await page.getByRole('link', { name: 'Достижения', exact: true }).click();
  await page.locator('.achievement-list').waitFor();
  assert(await page.locator('.teleport-button').count() > 0, 'Menu navigation preserves this session');
  console.log('PASS: teleport locked, code unlock, reload reset, trophies preserved, wrong code, re-unlock, menu navigation');
} finally { await browser.close(); }
