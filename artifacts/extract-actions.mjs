import fs from 'node:fs';
import ts from 'typescript';
const file = 'src/game/useGameController.ts';
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(file);
const fn = source.statements.find(ts.isFunctionDeclaration);
const locals = new Map();
function register(node) {
  if (ts.isIdentifier(node)) locals.set(checker.getSymbolAtLocation(node), node.text);
  else ts.forEachChild(node, register);
}
fn.parameters.forEach(param => register(param.name));
for (const node of fn.body.statements) {
  if (ts.isVariableStatement(node)) node.declarationList.declarations.forEach(decl => register(decl.name));
  if (ts.isFunctionDeclaration(node)) register(node.name);
}
function dependencies(node) {
  const names = new Set();
  function visit(child) {
    if (ts.isIdentifier(child)) {
      const symbol = ts.isShorthandPropertyAssignment(child.parent) ? checker.getShorthandAssignmentValueSymbol(child.parent) : checker.getSymbolAtLocation(child);
      if (locals.has(symbol) && child !== node.name) names.add(locals.get(symbol));
    }
    ts.forEachChild(child, visit);
  }
  visit(node);
  return [...names];
}
const edits = [], actionImports = [], required = new Set();
const staticImports = source.statements.filter(ts.isImportDeclaration).map(node => node.getText(source).replace(/from '([^']+)'/g, (_, specifier) => `from '${specifier.startsWith('./') ? '../' + specifier.slice(2) : specifier.startsWith('../') ? '../../' + specifier.slice(3) : specifier}'`)).join('\n');
fs.mkdirSync('src/game/actions', { recursive: true });
for (const node of fn.body.statements.filter(ts.isFunctionDeclaration)) {
  const name = node.name.text;
  const runName = 'run' + name[0].toUpperCase() + name.slice(1);
  const deps = dependencies(node);
  deps.forEach(name => required.add(name));
  const returnType = checker.typeToString(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)), node, ts.TypeFormatFlags.NoTruncation);
  if (/\bany\b/.test(returnType)) throw new Error('Untyped action ' + name);
  const params = node.parameters.map(param => `${param.name.getText(source)}${param.questionToken ? '?' : ''}: ${param.type ? param.type.getText(source) : checker.typeToString(checker.getTypeAtLocation(param), param, ts.TypeFormatFlags.NoTruncation)}`);
  const context = deps.length ? `type Context = Pick<GameViewModel, ${deps.map(name => `'${name}'`).join(' | ')}>;\n` : '';
  const destructure = deps.length ? `\n  const { ${deps.join(', ')} } = context;` : '';
  const body = node.body.getText(source).slice(1, -1);
  fs.writeFileSync(`src/game/actions/${name}.ts`, staticImports + "\nimport type { GameViewModel } from '../useGameController';\n\n" + context + `\nexport function ${runName}(${[...(deps.length ? ['context: Context'] : []), ...params].join(', ')}): ${returnType} {${destructure}${body}\n}\n`);
  const args = [...(deps.length ? [`{ ${deps.join(', ')} }`] : []), ...node.parameters.map(param => param.name.getText(source))];
  const wrapper = `function ${name}(${node.parameters.map(param => param.getText(source)).join(', ')}): ${returnType} {\n    return ${runName}(${args.join(', ')});\n  }`;
  edits.push({ start: node.getStart(source), end: node.end, text: wrapper });
  actionImports.push(`import { ${runName} } from './actions/${name}';`);
}
const result = fn.body.statements.findLast(ts.isReturnStatement);
const viewNames = result.expression.properties.map(prop => prop.name.text);
const outputNames = [...new Set([...viewNames, ...required])];
const lines = [];
for (let i = 0; i < outputNames.length; i += 5) lines.push('    ' + outputNames.slice(i, i + 5).join(', '));
edits.push({ start: result.getStart(source), end: result.end, text: 'return {\n' + lines.join(',\n') + '\n  };' });
let code = source.text;
for (const edit of edits.sort((a,b) => b.start - a.start)) code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
fs.writeFileSync(file, actionImports.join('\n') + '\n' + code);
console.log(`Extracted ${actionImports.length} actions`);
