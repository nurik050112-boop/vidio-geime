import fs from 'node:fs';
import ts from 'typescript';
const file='src/game/useGameController.ts';
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,process.cwd());
const program=ts.createProgram(parsed.fileNames,parsed.options), checker=program.getTypeChecker(), source=program.getSourceFile(file);
const fn=source.statements.find(ts.isFunctionDeclaration), locals=new Map();
function register(node){if(ts.isIdentifier(node))locals.set(checker.getSymbolAtLocation(node),node.text);else ts.forEachChild(node,register);}
fn.parameters.forEach(param=>register(param.name));
for(const node of fn.body.statements){if(ts.isVariableStatement(node))node.declarationList.declarations.forEach(decl=>register(decl.name));if(ts.isFunctionDeclaration(node))register(node.name);}
const names=['CollisionContext','ForcedLocation','LevelStats','AchievementStorage','CreatorCredits','BossMusic','IntroVoice','EndingVoice','MessageVoice','AudioCleanup','QuestRewards','HeroRespawn','SpiritRespawn','DailyReward','MovementLoop','Gravity','KeyboardMovement','KeyboardAttack','MonsterSpawn','MonsterReference','MonsterChase','MonsterState','MonsterAttacks','EnemyBurn','ClickDuel','SpellCooldown','ManaRegeneration','ManaLimit','DuelSearch','Nickname','OnlinePresence','DuelRequests'];
const imports=source.statements.filter(ts.isImportDeclaration).map(node=>node.getText(source).replace(/from '([^']+)'/g,(_,s)=>`from '${s.startsWith('./')?'../'+s.slice(2):s.startsWith('../')?'../../'+s.slice(3):s}'`)).join('\n');
const edits=[], hooks=[], required=new Set();
fs.mkdirSync('src/game/effects',{recursive:true});
let index=0;
for(const node of fn.body.statements){
 if(!ts.isExpressionStatement(node)||node.expression.expression?.getText(source)!=='useEffect')continue;
 const name='use'+names[index++], deps=new Set();
 function visit(child){if(ts.isIdentifier(child)){const symbol=ts.isShorthandPropertyAssignment(child.parent)?checker.getShorthandAssignmentValueSymbol(child.parent):checker.getSymbolAtLocation(child);if(locals.has(symbol))deps.add(locals.get(symbol));}ts.forEachChild(child,visit);}
 visit(node);deps.forEach(name=>required.add(name));
 const fields=[...deps];
 const context=`type Context = Pick<GameViewModel, ${fields.map(name=>`'${name}'`).join(' | ')}>;`;
 fs.writeFileSync(`src/game/effects/${name}.ts`,imports+`\nimport type { GameViewModel } from '../useGameController';\n\n${context}\n\nexport function ${name}(context: Context): void {\n  const { ${fields.join(', ')} } = context;\n  ${node.getText(source)}\n}\n`);
 edits.push({start:node.getStart(source),end:node.end,text:`${name}({ ${fields.join(', ')} });`});
 hooks.push(`import { ${name} } from './effects/${name}';`);
}
const ret=fn.body.statements.findLast(ts.isReturnStatement), fields=[...new Set([...ret.expression.properties.map(prop=>prop.name.text),...required])],lines=[];
for(let i=0;i<fields.length;i+=5)lines.push('    '+fields.slice(i,i+5).join(', '));
edits.push({start:ret.getStart(source),end:ret.end,text:'return {\n'+lines.join(',\n')+'\n  };'});
let code=source.text;for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
fs.writeFileSync(file,hooks.join('\n')+'\n'+code);
console.log('Extracted '+index+' effects');
