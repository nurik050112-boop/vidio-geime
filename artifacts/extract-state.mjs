import fs from 'node:fs';
import ts from 'typescript';
const file='src/game/useGameController.ts';
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile), parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram(parsed.fileNames,parsed.options), checker=program.getTypeChecker(), source=program.getSourceFile(file), fn=source.statements.find(ts.isFunctionDeclaration);
const locals=new Map();
function bindings(node){const items=[];function walk(child){if(ts.isIdentifier(child))items.push(child);else ts.forEachChild(child,walk);}walk(node);return items;}
fn.parameters.forEach(param=>bindings(param.name).forEach(name=>locals.set(checker.getSymbolAtLocation(name),name)));
for(const node of fn.body.statements){if(ts.isVariableStatement(node))node.declarationList.declarations.forEach(decl=>bindings(decl.name).forEach(name=>locals.set(checker.getSymbolAtLocation(name),name)));if(ts.isFunctionDeclaration(node))locals.set(checker.getSymbolAtLocation(node.name),node.name);}
const groups=[];let group=null;
for(const node of fn.body.statements){
 if(!ts.isVariableStatement(node)||node.getText(source).includes('useLocation(')){group=null;continue;}
 const count=node.getText(source).split('\n').length, outputs=node.declarationList.declarations.flatMap(decl=>bindings(decl.name));
 if(!group||group.lines+count>68||group.outputs.length+outputs.length>30){group={nodes:[],outputs:[],lines:0};groups.push(group);}
 group.nodes.push(node);group.outputs.push(...outputs);group.lines+=count;
}
const originals=source.statements.filter(ts.isImportDeclaration).map(node=>node.getText(source).replace(/from '([^']+)'/g,(_,s)=>`from '${s.startsWith('./')?'../'+s.slice(2):s.startsWith('../')?'../../'+s.slice(3):s}'`)).join('\n');
const edits=[],imports=[];
fs.mkdirSync('src/game/state',{recursive:true});
const typeOf=node=>checker.typeToString(checker.getTypeAtLocation(node),node,ts.TypeFormatFlags.NoTruncation);
for(const group of groups){
 if(group.outputs.some(node=>/\bany\b/.test(typeOf(node))))continue;
 const own=new Set(group.outputs.map(node=>checker.getSymbolAtLocation(node))),deps=new Map();
 function visit(child){if(ts.isIdentifier(child)){const symbol=ts.isShorthandPropertyAssignment(child.parent)?checker.getShorthandAssignmentValueSymbol(child.parent):checker.getSymbolAtLocation(child);if(locals.has(symbol)&&!own.has(symbol))deps.set(locals.get(symbol).text,locals.get(symbol));}ts.forEachChild(child,visit);}
 group.nodes.forEach(visit);
 if([...deps.values()].some(node=>/\bany\b/.test(typeOf(node))))continue;
 const first=group.outputs[0].text, name='use'+first[0].toUpperCase()+first.slice(1)+'State';
 const context=deps.size?'type Input = {\n'+[...deps].map(([name,node])=>`  ${name}: ${typeOf(node)};`).join('\n')+'\n};\n':'';
 const state='type State = {\n'+group.outputs.map(node=>`  ${node.text}: ${typeOf(node)};`).join('\n')+'\n};';
 const keys=group.outputs.map(node=>node.text),params=[...deps.keys()];
 const chunks=[];for(let i=0;i<keys.length;i+=5)chunks.push('    '+keys.slice(i,i+5).join(', '));
 fs.writeFileSync(`src/game/state/${name}.ts`,originals+"\nimport type * as React from 'react';\n\n"+context+state+`\n\nexport function ${name}(${params.length?'input: Input':''}): State {\n${params.length?'  const { '+params.join(', ')+' } = input;\n':''}`+group.nodes.map(node=>node.getFullText(source)).join('')+'\n  return {\n'+chunks.join(',\n')+'\n  };\n}\n');
 edits.push({start:group.nodes[0].getStart(source),end:group.nodes.at(-1).end,text:'const {\n'+chunks.join(',\n')+`\n  } = ${name}(${params.length?'{ '+params.join(', ')+' }':''});`});
 imports.push(`import { ${name} } from './state/${name}';`);
}
let code=source.text;for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
fs.writeFileSync(file,imports.join('\n')+'\n'+code);
console.log('Extracted '+imports.length+' state and calculation hooks');
