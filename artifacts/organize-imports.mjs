import fs from 'node:fs';
import ts from 'typescript';
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, process.cwd());
const versions = new Map();
const host = {
  getScriptFileNames: () => parsed.fileNames,
  getScriptVersion: file => String(versions.get(file) ?? 0),
  getScriptSnapshot: file => ts.sys.fileExists(file) ? ts.ScriptSnapshot.fromString(ts.sys.readFile(file)) : undefined,
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => parsed.options,
  getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists, readFile: ts.sys.readFile, readDirectory: ts.sys.readDirectory,
};
const service = ts.createLanguageService(host);
for (const file of parsed.fileNames.filter(file => /src\/(game|components\/game)/.test(file.replaceAll('\\', '/')))) {
  for (const change of service.organizeImports({ type: 'file', fileName: file }, {}, {})) {
    let text = fs.readFileSync(change.fileName, 'utf8');
    for (const edit of [...change.textChanges].sort((a, b) => b.span.start - a.span.start)) text = text.slice(0, edit.span.start) + edit.newText + text.slice(edit.span.start + edit.span.length);
    fs.writeFileSync(change.fileName, text);
  }
}
console.log('Imports organized');
