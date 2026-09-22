import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url = process.env.TEST_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true });
await mkdir('artifacts/verification', { recursive: true });
const saveKey = 'dragon-game-save-v1';
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await page.locator('.guest-button').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/verification/home-desktop.png', fullPage: true });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(150);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Landing overflow at ${width}: ${await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => el.className).join(', '))}`);
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.locator('.guest-button').click();
  await page.getByRole('button', { name: 'Пропустить', exact: true }).click();
  await page.locator('.battle-3d.ready').waitFor({ timeout: 20000 });
  await page.locator('.attack-control').waitFor();
  await page.waitForFunction(() => !document.querySelector('.attack-control').disabled);
  await page.waitForTimeout(1000);
  const readSave = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey);
  const beforeMove = await readSave();
  await page.keyboard.down('d');
  await page.waitForTimeout(2000);
  await page.keyboard.up('d');
  await page.waitForTimeout(900);
  const afterMove = await readSave();
  assert(afterMove.heroPosition.x > beforeMove.heroPosition.x, `D moves to camera right: ${JSON.stringify({ before: beforeMove.heroPosition, after: afterMove.heroPosition, direction: afterMove.heroDirection, hp: afterMove.heroHp, dialogs: await page.locator('dialog[open]').allTextContents() })}`);
  console.log('PASS: landing, entry, keyboard');
  await page.getByRole('button', { name: 'Гайд', exact: true }).click();
  const pausedHp = await page.locator('.hud-bars').innerText();
  await page.waitForTimeout(2300);
  assert.equal(await page.locator('.hud-bars').innerText(), pausedHp, 'Guide pauses combat');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await page.getByRole('button', { name: 'Магия', exact: true }).click();
  await page.locator('dialog .magic-staff').first().click();
  await page.keyboard.press('Escape');
  await page.locator('.arcane-spell-panel').waitFor();
  const manaBefore = (await readSave()).heroMana;
  await page.locator('.arcane-skill-button').click();
  await page.waitForTimeout(800);
  assert((await readSave()).heroMana < manaBefore, 'Magic consumes mana');
  console.log('PASS: guide pause, magic');
  await page.getByRole('button', { name: 'Пауза', exact: true }).click();
  await page.screenshot({ path: 'artifacts/verification/pause-desktop.png' });
  await page.keyboard.press('Escape');
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [844, 390], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await page.waitForFunction(height => Math.abs(document.querySelector('.stage').getBoundingClientRect().height - height) < 1, height);
    const layout = await page.evaluate(() => {
      const selectors = ['.compact-game-hud', '.mobile-joystick', '.battle-controls'];
      return { overflow: document.documentElement.scrollWidth > innerWidth + 1,
        outside: selectors.flatMap(selector => { const r = document.querySelector(selector).getBoundingClientRect(); return r.left < 0 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1 ? [{ selector, rect: r.toJSON() }] : []; }) };
    });
    assert.equal(layout.overflow, false, `Game overflow at ${width}×${height}`);
    if (layout.outside.length) await page.screenshot({ path: 'artifacts/verification/layout-error.png' });
    assert.deepEqual(layout.outside, [], `Controls outside ${width}×${height}`);
    if (width === 390) await page.screenshot({ path: 'artifacts/verification/game-mobile.png' });
  }
  await page.getByRole('link', { name: 'Мир', exact: true }).click();
  await page.locator('.world-page').waitFor();
  assert.equal(await page.locator('canvas').count(), 0, 'Map releases the 3D scene');
  const mapHp = (await readSave()).heroHp;
  await page.waitForTimeout(2000);
  assert.equal((await readSave()).heroHp, mapHp, 'No damage on the map');
  const inventory = (await readSave()).weapons.map(weapon => weapon.id);
  await page.reload();
  await page.locator('.world-page').waitFor();
  await page.waitForTimeout(900);
  assert.deepEqual((await readSave()).weapons.map(weapon => weapon.id), inventory, 'Inventory survives refresh');
  await page.goto(`${url}/achievements`);
  await page.locator('.achievements-screen').waitFor();
  await page.reload();
  await page.locator('.achievements-screen').waitFor();
  await page.goto(`${url}/missing-page`);
  assert(await page.getByText('Такой страницы пока нет').isVisible());
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log('PASS: entry, keyboard, pause, guide, magic, 5 viewports, map, refresh, achievements, 404');
  await context.close();
} finally { await browser.close(); }
