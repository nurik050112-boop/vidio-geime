import fs from 'node:fs';
import ts from 'typescript';
const file = 'src/game/GameRuntime.tsx';
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(file);
const fn = source.statements.find(ts.isFunctionDeclaration);
const statements = [...fn.body.statements];
const start = statements.findIndex(node => ts.isIfStatement(node) && node.expression.getText(source) === '!saveReady');
if (start < 0) throw new Error('Render boundary not found');
const viewNodes = statements.slice(start).filter(node => !ts.isVariableStatement(node));
const logicNodes = [...statements.slice(0, start), ...statements.slice(start).filter(ts.isVariableStatement)];
const locals = new Map();
function register(node) {
  if (ts.isIdentifier(node)) locals.set(checker.getSymbolAtLocation(node), node.text);
  else ts.forEachChild(node, register);
}
fn.parameters.forEach(param => register(param.name));
for (const statement of statements) {
  if (ts.isVariableStatement(statement)) statement.declarationList.declarations.forEach(decl => register(decl.name));
  if (ts.isFunctionDeclaration(statement)) register(statement.name);
}
function dependencies(nodes) {
  const names = new Map();
  function visit(node) {
    if (ts.isIdentifier(node)) {
      let symbol = checker.getSymbolAtLocation(node);
      if (ts.isShorthandPropertyAssignment(node.parent)) symbol = checker.getShorthandAssignmentValueSymbol(node.parent) ?? symbol;
      if (locals.has(symbol)) {
        const narrowed = checker.getNonNullableType(checker.getTypeAtLocation(node)) === checker.getTypeAtLocation(node);
        names.set(locals.get(symbol), narrowed);
      }
    }
    ts.forEachChild(node, visit);
  }
  nodes.forEach(visit);
  return names;
}
const imports = source.statements.filter(ts.isImportDeclaration).map(node => node.getText(source)).join('\n');
const captures = [...dependencies(viewNodes).keys()];
const wrapNames = names => names.reduce((lines, name, index) => { if (index % 6 === 0) lines.push([]); lines.at(-1).push(name); return lines; }, []).map(line => '  ' + line.join(', ')).join(',\n');
fs.writeFileSync('src/game/useGameController.ts', imports + '\n\n' + fn.getText(source).slice(0, fn.getText(source).indexOf('{\n')).replace('GameRuntime', 'useGameController') + '{\n' + logicNodes.map(node => node.getFullText(source)).join('') + '\n  return {\n' + wrapNames(captures) + '\n  };\n}\n\nexport type GameViewModel = ReturnType<typeof useGameController>;\n');
// Controller contains no JSX; all screens keep typed inputs and their original conditions.
const out = 'src/components/game';
fs.mkdirSync(out, { recursive: true });
const taken = new Set();
const components = [];
function componentName(node) {
  const element = ts.isJsxElement(node) ? node.openingElement : node;
  const attr = element.attributes?.properties.find(prop => prop.name?.text === 'className');
  let base = attr?.initializer?.getText(source).replace(/^["'{`]+/, '').split(/[ $?'"`]/)[0] ?? element.tagName?.getText(source) ?? 'panel';
  if (!/^[a-z-]+$/i.test(base)) base = 'panel';
  base = base.split('-').map(part => part[0]?.toUpperCase() + part.slice(1)).join('');
  const name = base + 'View';
  let unique = name, index = 2;
  while (taken.has(unique)) unique = name + index++;
  taken.add(unique);
  return unique;
}
const lineCount = text => text.split('\n').length;
function processNode(node, owner, allowExtract = true) {
  const replacements = [];
  function visit(child) {
    if (ts.isArrowFunction(child) || ts.isFunctionExpression(child)) return;
    const large = lineCount(child.getText(source)) > 24;
    if (allowExtract && (ts.isJsxElement(child) || ts.isJsxFragment(child)) && large) {
      const name = componentName(child);
      const body = lineCount(child.getText(source)) > 115 ? processNode(child, name) : child.getText(source);
      const deps = dependencies([child]);
      const props = [...deps].map(([key, nonnull]) => `  ${key}: ${nonnull ? 'NonNullable<' : ''}GameViewModel['${key}']${nonnull ? '>' : ''};`).join('\n');
      const adjustedImports = imports.replaceAll("from './", "from '../../game/").replaceAll("from '../", "from '../../");
      // Apply the two relative rebases independently to avoid double replacement.
      const safeImports = imports.replace(/from '([^']+)'/g, (_, specifier) => `from '${specifier.startsWith('./') ? '../../game/' + specifier.slice(2) : specifier.startsWith('../') ? '../../' + specifier.slice(3) : specifier}'`);
      components.push({ name, body, deps, text: `${safeImports}\nimport type { GameViewModel } from '../../game/useGameController';\n\n${deps.size ? `type Props = {\n${props}\n};\n` : ''}\nexport function ${name}(${deps.size ? `{ ${[...deps.keys()].join(', ')} }: Props` : ''}) {\n  return (${body});\n}\n` });
      replacements.push({ start: child.getStart(source), end: child.end, text: `<${name}${[...deps.keys()].map(key => ` ${key}={${key}}`).join('')} />` });
      return;
    }
    ts.forEachChild(child, visit);
  }
  ts.forEachChild(node, visit);
  let text = node.getText(source);
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) text = text.slice(0, replacement.start - node.getStart(source)) + replacement.text + text.slice(replacement.end - node.getStart(source));
  return text;
}
const viewBody = viewNodes.map(node => processNode(node, 'GameView')).join('\n');
for (const component of components) {
  const childImports = components.filter(child => child !== component && component.body.includes(`<${child.name} `)).map(child => `import { ${child.name} } from './${child.name}';`).join('\n');
  fs.writeFileSync(`${out}/${component.name}.tsx`, childImports + '\n' + component.text);
}
const viewImports = components.filter(child => viewBody.includes(`<${child.name}`)).map(child => `import { ${child.name} } from '../components/game/${child.name}';`).join('\n');
fs.writeFileSync('src/game/GameView.tsx', imports + '\n' + viewImports + "\nimport type { GameViewModel } from './useGameController';\n\nexport function GameView(model: GameViewModel) {\n  const {\n" + wrapNames(captures) + '\n  } = model;\n' + viewBody + '\n}\n');
fs.writeFileSync(file, "import type { User } from '@supabase/supabase-js';\nimport { useGameController } from './useGameController';\nimport { GameView } from './GameView';\n\nexport function GameRuntime(props: { authUser: User | null; guestMode: boolean }) {\n  const model = useGameController(props);\n  return <GameView {...model} />;\n}\n");
console.log(`Extracted ${components.length} view components`);
