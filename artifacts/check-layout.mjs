import { chromium } from 'playwright';
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await page.addInitScript(() => {
    localStorage.setItem('dragon-game-guest-mode', 'yes');
    localStorage.setItem('dragon-game-save-v1', JSON.stringify({version:1,introSkipped:true}));
  });
  await page.goto('http://127.0.0.1:5173/game');
  await page.locator('.pause-control').click();
  await page.keyboard.press('Escape');
  console.log(await page.evaluate(() => ['.game','.stage','.sky','.mobile-joystick','.battle-controls'].map(s => {
    const e=document.querySelector(s), c=getComputedStyle(e);
    return {s,rect:e.getBoundingClientRect().toJSON(),height:c.height,minHeight:c.minHeight,padding:c.padding,position:c.position};
  })));
  await page.screenshot({path:'artifacts/verification/layout-error.png'});
} finally { await browser.close(); }
