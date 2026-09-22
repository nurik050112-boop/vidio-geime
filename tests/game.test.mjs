import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

async function loadModule(file) {
  const source = await readFile(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { cameraRelativeDirection, leftKeys, rightKeys, forwardKeys } = await loadModule('../src/game/controls.ts');
const { validateGameSave } = await loadModule('../src/lib/validateGameSave.ts');
const { browserStorage } = await loadModule('../src/lib/browserStorage.ts');

test('WASD and arrows have consistent directions', () => {
  assert(leftKeys.includes('keya') && leftKeys.includes('arrowleft'));
  assert(rightKeys.includes('keyd') && rightKeys.includes('arrowright'));
  assert(forwardKeys.includes('keyw') && forwardKeys.includes('arrowup'));
  for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const forward = cameraRelativeDirection(0, 1, yaw);
    const right = cameraRelativeDirection(1, 0, yaw);
    assert(Math.abs(Math.hypot(forward.x, forward.z) - 1) < 1e-10);
    assert(Math.abs(forward.x * right.x + forward.z * right.z) < 1e-10);
  }
  assert(cameraRelativeDirection(1, 0, Math.PI).x > 0.999);
  assert(cameraRelativeDirection(0, 1, Math.PI).z < -0.999);
});

test('valid partial legacy saves remain readable', () => {
  const save = { version: 1, gold: 420, chapter: 0, heroPosition: { x: -18000, z: 0 }, weapons: [], cityMonsters: [1000] };
  assert.deepEqual(validateGameSave(save), save);
});

test('corrupt saves cannot poison the game state', () => {
  for (const value of [null, [], 'text', { version: 2 }, { version: 1, chapter: 'no' },
    { version: 1, chapter: -3 }, { version: 1, gold: Infinity }, { version: 1, weapons: 'bad' },
    { version: 1, heroPosition: { x: null, z: 0 } }, { version: 1, bbiBossStage: 'invalid' },
    { version: 1, items: {} }, { version: 1, weapons: [{ id: 'broken', name: 'Broken', damage: 5, price: 2, rarity: 'invalid' }] }]) {
    assert.equal(validateGameSave(value), null);
  }
});

test('blocked browser storage does not crash guest play', () => {
  globalThis.window = { get localStorage() { throw new Error('blocked'); } };
  assert.equal(browserStorage.getItem('save'), null);
  assert.equal(browserStorage.setItem('save', 'data'), false);
  assert.doesNotThrow(() => browserStorage.removeItem('save'));
  delete globalThis.window;
});
