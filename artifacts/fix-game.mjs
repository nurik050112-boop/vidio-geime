import fs from 'node:fs';
let source = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');
source = source.replace("import { backwardKeys", "import { GameControls } from '../components/GameControls';\nimport { GameDialog } from '../components/GameDialog';\nimport { useGameActivity } from '../game/useGameActivity';\nimport { browserStorage } from '../lib/browserStorage';\nimport { backwardKeys");
source = source.replaceAll('window.localStorage.', 'browserStorage.');
source = source.replace('const savedGameRef = useRef(readGameSave());', 'const [initialSave] = useState(readGameSave);\n  const savedGameRef = useRef(initialSave);');
const gates = [...source.slice(source.indexOf('  if (!introSkipped) {'), source.indexOf('  return (\n    <main className={`game')).matchAll(/^  if \((.*)\) \{/gm)].map(match => `(${match[1]})`);
const insertion = source.indexOf('  useEffect(() => {\n    levelStatMultiplierRef');
const activity = `  const { active: gameActive, activeRef: gameActiveRef, manualPause, setManualPause } = useGameActivity(\n    Boolean((authUser || guestMode) && !isWorldPage && !isAchievementsPage && !creatorCreditsOpen\n      && !tutorialOpen && !questPanelOpen && !inventoryPanelOpen && duelStatus === 'idle' && !incomingDuelRequest\n      && !(${gates.join(' || ')})),\n    () => {\n      pressedKeys.current.clear();\n      movementVelocity.current = { x: 0, z: 0 };\n      cameraPointer.current = null;\n      resetJoystick();\n    },\n  );\n\n`;
const firstEffect = source.indexOf('  useEffect(', source.indexOf('export function HomePage'));
source = source.slice(0, firstEffect) + activity + source.slice(firstEffect);
for (const signature of ['function fightMonster() {', 'function strike() {', 'function castArcaneSkill() {', 'function attackFromStageClick() {', 'function startCameraDrag(event: ReactPointerEvent<HTMLDivElement>) {', 'function startJoystick(event: ReactPointerEvent<HTMLDivElement>) {']) {
  source = source.replace(signature, signature + '\n    if (!gameActiveRef.current) return;');
}
source = source.replace('const tickMovement = () => {', 'const tickMovement = () => {\n      if (!gameActiveRef.current) {\n        lastMoveAt.current = null;\n        frame = window.requestAnimationFrame(tickMovement);\n        return;\n      }');
source = source.replace('function onKeyDown(event: KeyboardEvent) {', 'function onKeyDown(event: KeyboardEvent) {\n      if (!gameActiveRef.current) return;');
source = source.replace("if (event.code === 'Space' && verticalVelocity.current === 0) {", "if (event.code === 'Space' && !event.repeat && verticalVelocity.current === 0) {\n        event.preventDefault();");
source = source.replace('if (event.repeat || isTyping || event.code', 'if (!gameActiveRef.current || event.repeat || isTyping || event.code');
source = source.replace('if (!monster.alive || currentMonsters', 'if (!gameActiveRef.current || !monster.alive || currentMonsters');
source = source.replace('const state = monsterBotRef.current;', 'if (!gameActiveRef.current) return;\n      const state = monsterBotRef.current;');
source = source.replace('const burnTimer = window.setInterval(() => {', 'const burnTimer = window.setInterval(() => {\n      if (!gameActiveRef.current) return;');
source = source.replace('const duelTimer = window.setInterval(() => {', 'const duelTimer = window.setInterval(() => {\n      if (!gameActiveRef.current) return;');
source = source.replace('const gravityTimer = window.setInterval(() => {', 'const gravityTimer = window.setInterval(() => {\n      if (!gameActiveRef.current) return;');
source = source.replace('function resetMovementInput() {', 'function resetMovementInput() {\n      resetJoystick();');
source = source.replace('window.setTimeout(() => {\n      resetWinStreak', 'const timer = window.setTimeout(() => {\n      resetWinStreak');
source = source.replace("setMessage('Здоровье героя упало до 0. Игра началась заново.');\n    }, 700);", "setMessage('Здоровье героя упало до 0. Игра началась заново.');\n    }, 700);\n    return () => window.clearTimeout(timer);");
source = source.replace('key={mapSceneKey}\n              dragonColor', 'key={mapSceneKey}\n              paused={!gameActive}\n              dragonColor');
source = source.replace('<section className="stage" aria-label="Поле битвы">', `<section className="stage" aria-label="Поле битвы">\n        <GameControls disabled={!gameActive || heroHp <= 0} onAttack={attackFromStageClick}\n          onPause={() => setManualPause(true)} onJump={() => {\n            if (verticalVelocity.current === 0) { verticalVelocity.current = 24; playHeroAnimation('step', 360); }\n          }} />`);
source = source.replace('      {tutorialOpen && (', `      {manualPause && !isWorldPage && (\n        <GameDialog title="Игра на паузе" onClose={() => setManualPause(false)} className="pause-dialog">\n          <p className="eyebrow">Можно передохнуть</p><h2>Игра на паузе</h2>\n          <p>Герой в безопасности. Продолжим приключение?</p>\n          <button onClick={() => setManualPause(false)} type="button">Продолжить</button>\n        </GameDialog>\n      )}\n      {tutorialOpen && (`);
source = source.replace('        <div className="tutorial-overlay" role="dialog" aria-label="Обучение игре">', '        <GameDialog title="Обучение игре" onClose={closeTutorial} className="guide-dialog">');
source = source.replace('        </div>\n      )}\n      <section className="stage"', '        </GameDialog>\n      )}\n      <section className="stage"');
for (const [panel, title, setter] of [['quest', 'Квесты', 'setQuestPanelOpen'], ['inventory', 'Инвентарь', 'setInventoryPanelOpen']]) {
  const start = source.indexOf(`      {${panel}PanelOpen && (`);
  const end = source.indexOf('\n      )}', start);
  let block = source.slice(start, end);
  block = block.replace(/<div className="game-modal"[^>]*>/, `<GameDialog title="${title}" onClose={() => ${setter}(false)}>`);
  const close = block.lastIndexOf('</div>');
  block = block.slice(0, close) + '</GameDialog>' + block.slice(close + 6);
  source = source.slice(0, start) + block + source.slice(end);
}
source = source.replace('role="button"\n          tabIndex={0}', 'role="region"\n          aria-label="3D-сцена: проведи для поворота камеры"');
fs.writeFileSync('src/pages/HomePage.tsx', source);
