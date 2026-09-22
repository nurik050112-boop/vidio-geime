import fs from 'node:fs';
import ts from 'typescript';
const files = fs.readdirSync('src/components/game').map(name => 'src/components/game/' + name);
const names = files.map(file => file.split('/').at(-1).slice(0, -4));
names.push('PlayWorldView');
files.push('src/game/GameView.tsx');
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  const parsed = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const props = parsed.statements.find(node => ts.isTypeAliasDeclaration(node) && node.name.text === 'Props');
  if (props) code = code.slice(0, props.getStart(parsed)) + code.slice(props.end);
  let keys = [];
  code = code.replace(/export function (\w+)\(\{ ([^}]+) \}: Props\) \{/, (_, name, params) => {
    keys = params.split(', ').map(key => key.trim());
    return `export function ${name}() {\n__GAME_KEYS__`;
  });
  if (file === 'src/game/GameView.tsx') {
    code = code.replace('export function GameView(model: GameViewModel)', 'export function GameView()');
    code = code.replace(/  const \{([\s\S]*?)\} = model;/, (_, params) => { keys = params.split(',').map(key => key.trim()); return '__GAME_KEYS__'; });
  }
  for (const name of names) code = code.replace(new RegExp(`<${name}(?:\\s+\\w+=\\{\\w+\\})*\\s*/>`, 'g'), `<${name} />`);
  const used = keys.filter(key => new RegExp(`\\b${key}\\b`).test(code));
  const chunks = [];
  for (let i = 0; i < used.length; i += 5) chunks.push('    ' + used.slice(i, i + 5).join(', '));
  const declaration = used.length ? '  const {\n' + chunks.join(',\n') + '\n  } = useGameModel();' : '';
  code = code.replace('__GAME_KEYS__', declaration);
  if (used.length) code = `import { useGameModel } from '${file.startsWith('src/game') ? './GameContext' : '../../game/GameContext'}';\n` + code;
  if (/DuelTradeView|PanelView2/.test(file)) code = code.replace('  return (', '  if (!duelOpponent) return null;\n  return (');
  if (/DuelRequestScreenView/.test(file)) code = code.replace('  return (', '  if (!incomingDuelRequest || !incomingRequestPlayer) return null;\n  return (');
  fs.writeFileSync(file, code);
}
