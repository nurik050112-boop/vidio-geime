import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();

function extract(file, folder, keepName) {
  const source = program.getSourceFile(file);
  const declarations = source.statements.filter(node => !ts.isImportDeclaration(node) && node.name?.text !== keepName);
  const groups = [];
  for (const node of declarations) {
    const size = node.getText(source).split('\n').length;
    if (!groups.length || groups.at(-1).size + size > 125) groups.push({ nodes: [], size: 0 });
    groups.at(-1).nodes.push(node);
    groups.at(-1).size += size;
  }
  const symbols = new Map();
  function names(node) {
    return ts.isVariableStatement(node) ? node.declarationList.declarations.map(entry => entry.name) : [node.name];
  }
  for (const group of groups) {
    const first = names(group.nodes[0])[0].text;
    group.file = `${folder}/${first[0].toLowerCase()}${first.slice(1)}.ts`;
    for (const node of group.nodes) for (const name of names(node)) {
      symbols.set(checker.getSymbolAtLocation(name), { group, name: name.text, type: ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) });
    }
  }
  const originalImports = new Map();
  for (const node of source.statements.filter(ts.isImportDeclaration)) {
    const clause = node.importClause;
    const specifier = node.moduleSpecifier.text;
    for (const element of clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : []) {
      originalImports.set(checker.getSymbolAtLocation(element.name), { name: element.getText(source), specifier, type: clause.isTypeOnly || element.isTypeOnly });
    }
    if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      originalImports.set(checker.getSymbolAtLocation(clause.namedBindings.name), { name: clause.namedBindings.name.text, specifier, namespace: true });
    }
  }
  function relative(from, to) { const value = path.posix.relative(path.posix.dirname(from), to).replace(/\.tsx?$/, ''); return value.startsWith('.') ? value : './' + value; }
  function imports(nodes, group) {
    const entries = new Map();
    function visit(node) {
      let symbol = ts.isIdentifier(node) ? checker.getSymbolAtLocation(node) : null;
      if (ts.isIdentifier(node) && ts.isShorthandPropertyAssignment(node.parent)) symbol = checker.getShorthandAssignmentValueSymbol(node.parent) ?? symbol;
      const local = symbols.get(symbol);
      const original = originalImports.get(symbol);
      if (local && local.group !== group) entries.set(local.name, { ...local, specifier: relative(group.file, local.group.file) });
      if (original) entries.set(original.name, { ...original, specifier: original.specifier.startsWith('.') ? relative(group.file, path.posix.normalize(path.posix.join(path.posix.dirname(file), original.specifier))) : original.specifier });
      ts.forEachChild(node, visit);
    }
    nodes.forEach(visit);
    const bySpecifier = new Map();
    for (const entry of entries.values()) {
      const list = bySpecifier.get(entry.specifier) ?? []; list.push(entry); bySpecifier.set(entry.specifier, list);
    }
    return [...bySpecifier].map(([specifier, list]) => {
      if (list[0].namespace) return `import * as ${list[0].name} from '${specifier}';`;
      return `import { ${list.map(item => (item.type && !item.name.startsWith('type ') ? 'type ' : '') + item.name).join(', ')} } from '${specifier}';`;
    }).join('\n');
  }
  fs.mkdirSync(folder, { recursive: true });
  for (const group of groups) {
    fs.writeFileSync(group.file, imports(group.nodes, group) + '\n\n' + group.nodes.map(node => 'export ' + node.getText(source).replace(/^export /, '')).join('\n\n') + '\n');
  }
  const kept = source.statements.find(node => node.name?.text === keepName);
  fs.writeFileSync(file, imports([kept], { file }) + '\n\n' + kept.getText(source) + '\n');
  console.log(`${file}: extracted ${groups.length} modules`);
}
extract('src/game/GameRuntime.tsx', 'src/game/data', 'GameRuntime');
extract('src/components/BattleScene3D.tsx', 'src/game/scene/models', 'BattleScene3D');
