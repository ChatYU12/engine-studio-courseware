import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';
import vm from 'node:vm';
import * as content from '../src/content.js';
import * as state from '../src/state.js';

// These expectations come from the fixed AM4 lesson and its acceptance matrix.
// Browser/WebGL, geometry collisions and image quality need separate visual QA.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const {PARTS, STEPS, DISASSEMBLY, QUIZ, FAULTS, SAFETY_CHECKS, PREPOWER_CHECKS, SOURCES} = content;
const ids = PARTS.map(p => p.id), knownIds = new Set([...ids, ...state.INTERNAL_IDS]);
const cases = [];
function test(name, check) {
  try {check(); cases.push({name, passed:true});}
  catch (error) {cases.push({name, passed:false, error:error.message});}
}
const frame = (id, progress=1, direction='assemble', sata=false) => {
  const steps=direction==='assemble'?STEPS:DISASSEMBLY, i=steps.findIndex(s=>s.id===id);
  assert(i>=0, `Unknown expected course station ${id}`);
  return state.courseFrame(ids, steps, i, progress, direction, sata);
};
const dframe = (id,p=1,sata=false)=>frame(id,p,'disassemble',sata);

test('20 assembly / 15 disassembly stations and unique identifiers',()=>{
  assert.equal(STEPS.length,20); assert.equal(DISASSEMBLY.length,15);
  for (const group of [PARTS,STEPS,DISASSEMBLY,QUIZ,FAULTS,SOURCES])
    assert.equal(new Set(group.map(x=>x.id)).size,group.length);
});
test('All course part/source references resolve; no hidden typo installs',()=>{
  const sources = new Set(SOURCES.map(s=>s.id));
  for (const item of [...PARTS,...STEPS,...DISASSEMBLY,...QUIZ,...FAULTS]) {
    for (const ref of item.sources||[]) assert(sources.has(ref),`${item.id}: unknown source ${ref}`);
    for (const ref of [...item.partIds||[],...item.installIds||[],...item.removeIds||[]])
      assert(knownIds.has(ref),`${item.id}: unknown component ${ref}`);
  }
  for (const s of [...STEPS,...DISASSEMBLY]) {
    assert(s.instruction&&s.principle&&s.prerequisites.length&&s.checks.length,`${s.id}: incomplete teaching contract`);
  }
  for (const q of [...QUIZ,...FAULTS]) assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length,`${q.id}: invalid answer`);
});
test('Opening the case starts with a fitted panel, then removes it; closing restores it',()=>{
  assert.equal(frame('A03',0).panel,1,'A03 must begin with fitted side panel');
  assert.equal(frame('A03').panel,0); assert.equal(frame('A20').panel,1);
});
test('AM4 preparation preserves backplate and disconnects CPU fan until A08',()=>{
  assert.equal(frame('A04').cpu,1); assert.equal(frame('A04').retentionBrackets,1);
  assert.equal(frame('A05').retentionBrackets,0); assert.equal(frame('A05').backplate,1);
  assert.equal(frame('A07').cooler,1); assert.equal(frame('A07').cpuFan,0);
  assert.equal(frame('A08').cpuFan,1);
});
test('A2/B2 fill together and cannot be powered before installation',()=>{
  const a=frame('A09'); assert.equal(a.ramA2,1); assert.equal(a.ramB2,1);
  assert(state.missingPowerRequirements(frame('A08')).includes('ramA2'));
});
test('M.2 insertion has cover clear while SSD enters, then restores cover',()=>{
  const middle=frame('A10',.5);
  assert(middle.ssd>0&&middle.ssd<1,'SSD should be in its insertion phase');
  assert(middle.m2Shield<.1,'M.2 cover must be clear during SSD insertion');
  assert.equal(frame('A10').ssd,1); assert.equal(frame('A10').m2Shield,1);
});
test('Power prerequisites become complete only after GPU auxiliary power',()=>{
  for (let i=0;i<16;i++) {
    assert(state.missingPowerRequirements(state.courseFrame(ids,STEPS,i,1)).length>0,`${STEPS[i].id} is not ready to power on`);
  }
  assert(state.missingPowerRequirements(frame('A16')).includes('gpuPower'));
  assert.deepEqual(state.missingPowerRequirements(frame('A17')),[]);
  for (const id of state.POWER_REQUIREMENTS) {
    const amounts=frame('A18'); amounts[id]=0;
    assert(state.missingPowerRequirements(amounts).includes(id),`Missing ${id} must block power readiness`);
  }
});
test('All eight pre-power checks and all safety checks require explicit true',()=>{
  for (const checks of [SAFETY_CHECKS,PREPOWER_CHECKS]) {
    const all=Object.fromEntries(checks.map(c=>[c.id,true])); assert(state.checkedAll(checks,all));
    for (const c of checks) {assert(!state.checkedAll(checks,{...all,[c.id]:false})); assert(!state.checkedAll(checks,{...all,[c.id]:'true'}));}
    assert(!state.checkedAll(checks,{}));
  }
});
test('Complete assembly equals the same complete machine used for observation',()=>{
  for (const sata of [false,true]) assert.deepEqual(frame('A20',1,'assemble',sata),state.fullAmounts(ids,sata));
});
test('Optional SATA has both independent connections and leaves main route complete',()=>{
  for (const id of state.OPTIONAL_IDS) {
    assert.equal(frame('A15',1,'assemble',false)[id],0);
    assert.equal(frame('A15',1,'assemble',true)[id],1);
    assert.equal(dframe('D05',1,true)[id],0);
  }
  assert.deepEqual(state.missingPowerRequirements(frame('A18',1,'assemble',false)),[]);
});
test('Disassembly releases GPU power before card and external board harnesses before board',()=>{
  assert.equal(dframe('D01').panel,0); assert.equal(dframe('D01').gpuPower,1);
  assert.equal(dframe('D03').gpuPower,0); assert.equal(dframe('D03').gpu,1);
  assert.equal(dframe('D04').gpu,0);
  const beforeBoard=dframe('D07');
  for (const id of ['gpu','gpuPower','atx','eps','frontIO'])assert.equal(beforeBoard[id],0,`${id} must be released`);
  assert.equal(beforeBoard.motherboard,1);
  const out=dframe('D08'); assert.equal(out.motherboard,0);
  for (const id of ['cpu','cooler','cpuFan','ramA2','ramB2','ssd','m2Shield']) assert.equal(out[id],1,`${id} must follow motherboard as a subassembly`);
});
test('D09 removes M.2 cover before moving SSD',()=>{
  const early=dframe('D09',.25); assert.equal(early.ssd,1,'SSD remains seated until cover clears');
  assert(early.m2Shield<1,'Cover removal must happen first');
  const middle=dframe('D09',.65); assert.equal(middle.m2Shield,0,'Cover should already be removed');
  assert(middle.ssd<1,'SSD should then exit');
});
test('AM4 disassembly disconnects fan before cooler; locked CPU remains until D13',()=>{
  assert.equal(dframe('D10').cpuFan,1);
  assert.equal(dframe('D11').cpuFan,0); assert.equal(dframe('D11').cooler,1);
  assert.equal(dframe('D12').cooler,0); assert.equal(dframe('D12').cpu,1);
  assert.equal(dframe('D12').backplate,1); assert.equal(dframe('D13').cpu,0);
});
test('Both complete disassembly variants retain fixed chassis fans but disconnect SYS_FAN',()=>{
  for (const sata of [false,true]) {
    const a=dframe('D15',1,sata);
    for (const id of knownIds) assert.equal(a[id],['chassis','fans'].includes(id)?1:0,`${id}: final disassembly state`);
  }
});
test('Case fan connection changes independently of the fixed physical fans',()=>{
  assert.equal(frame('A14').fans,1);assert.equal(frame('A14').sysFan,0);
  assert.equal(frame('A15').fans,1);assert.equal(frame('A15').sysFan,1);
  assert.equal(dframe('D06').fans,1);assert.equal(dframe('D06').sysFan,0);
});
test('AM4 cooler remains seated during the initial release/twist phase',()=>{
  assert.equal(dframe('D12',.1).cooler,1);
  assert.equal(dframe('D12',.1).cpu,1);
});
test('Animation endpoints are deterministic and bounded at every station',()=>{
  for (const [steps,direction] of [[STEPS,'assemble'],[DISASSEMBLY,'disassemble']]) {
    for (const sata of [false,true]) for (let i=0;i<steps.length;i++) for (const p of [0,.1,.5,.9,1]) {
      const amounts=state.courseFrame(ids,steps,i,p,direction,sata);
      for(const [id,a] of Object.entries(amounts)) assert(Number.isFinite(a)&&a>=0&&a<=1,`${steps[i].id} ${p}: ${id} out of range`);
      if(i&&p===0)assert.deepEqual(amounts,state.courseFrame(ids,steps,i-1,1,direction,sata),`${steps[i].id} starts at previous endpoint`);
    }
  }
});
test('Viewing/rendering any station does not mutate completion or course data',()=>{
  const completed=[], before=JSON.stringify({STEPS,DISASSEMBLY});
  for(let i=STEPS.length-1;i>=0;i--)state.courseFrame(ids,STEPS,i,1);
  assert.equal(state.frontier(STEPS,completed),0); assert.deepEqual(completed,[]);
  assert.equal(JSON.stringify({STEPS,DISASSEMBLY}),before);
  const withGap=[STEPS[0].id,STEPS[2].id];assert.equal(state.frontier(STEPS,withGap),1,'Later records cannot close prerequisite gaps');
});
test('Knowledge scoring snapshots preserve critical failures even above 80 points',()=>{
  const answers=Object.fromEntries(QUIZ.map(q=>[q.id,q.answer]));
  const all=state.scoreAnswers(QUIZ,answers); assert.equal(all.score,100);assert(all.criticalPassed);
  const q=QUIZ.find(q=>q.critical);const bad={...answers,[q.id]:(q.answer+1)%q.options.length};
  const oneBad=state.scoreAnswers(QUIZ,bad);assert(oneBad.score>=80);assert(!oneBad.criticalPassed);
  assert.equal(state.scoreAnswers(QUIZ,{}).score,0);assert(!state.scoreAnswers(QUIZ,{}).criticalPassed);
  assert(!state.scoreAnswers(QUIZ,{...answers,[q.id]:99}).criticalPassed);
  assert.equal(answers[q.id],q.answer,'Scoring must not rewrite answers');
});
test('Stored progress read degrades on denied access, malformed JSON and non-object JSON',()=>{
  assert.equal(state.safeLoad({getItem(){throw new Error('SecurityError');}},'x'),null);
  for(const raw of ['{bad','[]','null','3','"record"'])assert.equal(state.safeLoad({getItem:()=>raw},'x'),null);
  assert.deepEqual(state.safeLoad({getItem:()=>'{"version":1}'},'x'),{version:1});
});

// A small DOM double executes app control functions without a browser or WebGL.
// This catches workflow gates and unavailable-storage/WebGL paths, not layout.
const source=await readFile(resolve(root,'src/app.js'),'utf8');
function appHarness({denyStorage=false,failWrite=false,failScene=false,saved=null}={}) {
  const elements=new Map(),downloads=[],blobs=[],diagnostics=[];
  const element=(selector)=>{
    if(!elements.has(selector))elements.set(selector,{
      style:{},dataset:{},classList:{toggle(){},add(){},remove(){}},hidden:selector==='#scene-error',disabled:false,open:false,scrollTop:0,textContent:'',innerHTML:'',
      setAttribute(){},addEventListener(){},scrollIntoView(){},getBoundingClientRect(){return {left:0,right:100,top:0,bottom:100};},
      showModal(){this.open=true;},close(){this.open=false;},click(){if(this.download)downloads.push(this.download);},
    });
    return elements.get(selector);
  };
  const stored={getItem(){if(denyStorage)throw new Error('denied');return saved?JSON.stringify(saved):null;},setItem(){if(failWrite)throw new Error('quota');}};
  const window={};Object.defineProperty(window,'localStorage',{get(){if(denyStorage)throw new Error('denied');return stored;}});
  const context=vm.createContext({...content,...state,console:{...console,error:(...args)=>diagnostics.push(args)},Date,Intl,Blob:class {constructor(parts){this.contents=parts.join('');}},URL:{createObjectURL(blob){blobs.push(blob);return 'blob:test-'+blobs.length;},revokeObjectURL(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},matchMedia:()=>({matches:true}),window,
    document:{querySelector:element,querySelectorAll(selector){return selector==='[data-entry-safety]'?SAFETY_CHECKS.map(s=>({dataset:{entrySafety:s.id},checked:true})):[];},createElement:()=>element('anchor-'+downloads.length),addEventListener(){}},
    createPCScene(){if(failScene)throw new Error('WebGL unavailable test');return {setState(){},resetView(){},getStats(){return {triangles:0};}};},
  });
  const exportCode='\nglobalThis.harness={snapshot:()=>structuredSnapshot(),setMode,visitStep,beginPractice,confirmStep,showUEFI,selectPart,submitQuiz,report,learner,getElement:s=>document.querySelector(s)};function structuredSnapshot(){return JSON.parse(JSON.stringify({mode,index,progress,practice,learner}));}';
  vm.runInContext(source.replace(/^import .*;\n/gm,'')+exportCode,context);
  return {app:context.harness,elements,downloads,blobs,diagnostics};
}
test('Unavailable localStorage and WebGL keep knowledge controls usable',()=>{
  for(const options of [{denyStorage:true},{failWrite:true},{failScene:true}]){
    const {app}=appHarness(options);app.setMode('assemble');assert.equal(app.snapshot().index,0);
    app.selectPart('not-a-course-component');app.visitStep(19);assert.equal(app.snapshot().index,19);
    assert.equal(app.snapshot().learner.completed.assemble.length,0);
    if(options.failScene)assert.equal(app.getElement('#scene-error').hidden,false);
    if(options.denyStorage||options.failWrite)assert.match(app.getElement('#save-status').textContent,/导出报告/);
  }
});
test('Practice blocks jumping, unconfirmed steps and pre-power bypass; demo awards nothing',()=>{
  const {app}=appHarness();app.setMode('assemble');app.visitStep(19);
  assert.equal(app.snapshot().learner.completed.assemble.length,0);
  app.beginPractice('assemble');assert.equal(app.snapshot().index,0);
  assert.equal(app.visitStep(18),false);app.confirmStep();assert.equal(app.snapshot().learner.completed.assemble.length,0);
  for(let i=0;i<STEPS.length;i++){
    app.learner.checks['assemble:'+STEPS[i].id]=Object.fromEntries(STEPS[i].checks.map((_,j)=>[j,true]));
    if(i===17){app.confirmStep();assert.equal(app.snapshot().learner.completed.assemble.length,17,'A18 blocked before pre-power checks');app.learner.prepower=Object.fromEntries(PREPOWER_CHECKS.map(s=>[s.id,true]));}
    app.confirmStep();
  }
  assert.equal(app.snapshot().learner.completed.assemble.length,20);
  app.setMode('observe');assert.equal(app.snapshot().practice,false);assert.equal(app.snapshot().learner.completed.assemble.length,20);
});
test('Timeline input captures the new control value before transport synchronization writes it',()=>{
  const {app}=appHarness();app.setMode('assemble');
  const slider=app.getElement('#timeline');
  for(const percentage of [67,22,100,0]){
    slider.value=String(percentage);
    slider.oninput({target:slider});
    assert.equal(app.snapshot().progress,percentage/100,'Input must preserve the new user value even when stop() syncs transport');
    assert.equal(Number(slider.value),percentage);
    assert.equal(app.getElement('#range-value').textContent,percentage+'%');
  }
});
test('Disassembly practice requires a fresh entry check and preserves prior assembly record',()=>{
  const {app}=appHarness();app.learner.completed.assemble=STEPS.map(s=>s.id);
  app.setMode('disassemble');app.beginPractice('disassemble');
  assert.equal(app.visitStep(3),false);
  for(const s of DISASSEMBLY){app.learner.checks['disassemble:'+s.id]=Object.fromEntries(s.checks.map((_,j)=>[j,true]));app.confirmStep();}
  assert.equal(app.snapshot().learner.completed.disassemble.length,15);assert.equal(app.snapshot().learner.completed.assemble.length,20);
});
test('Unconfigured SATA disassembly station may be skipped without fake component checks',()=>{
  const {app}=appHarness();app.setMode('disassemble');app.beginPractice('disassemble');
  for(const s of DISASSEMBLY.slice(0,4)){app.learner.checks['disassemble:'+s.id]=Object.fromEntries(s.checks.map((_,j)=>[j,true]));app.confirmStep();}
  assert.equal(app.snapshot().index,4);app.confirmStep();
  assert.equal(app.snapshot().index,5);assert(app.learner.completed.disassemble.includes('D05'));
});
test('Submitted assessment is an immutable evidence snapshot after answer correction',()=>{
  const {app}=appHarness();const q=QUIZ.find(q=>q.critical);
  Object.assign(app.learner.answers,Object.fromEntries(QUIZ.map(q=>[q.id,q.answer])));
  app.learner.answers[q.id]=(q.answer+1)%q.options.length;app.submitQuiz();
  const attempt=JSON.stringify(app.learner.quizAttempts[0]);
  app.learner.answers[q.id]=q.answer;app.submitQuiz();
  assert.equal(JSON.stringify(app.learner.quizAttempts[0]),attempt);assert.equal(app.learner.quizAttempts.length,2);
  assert.equal(app.learner.quizAttempts[0].criticalPassed,false);assert.equal(app.learner.quizAttempts[1].criticalPassed,true);
});
test('Digital completion cannot pass while safety-critical fault judgments are wrong or unanswered',()=>{
  const {app,blobs}=appHarness();
  app.learner.safety=Object.fromEntries(SAFETY_CHECKS.map(s=>[s.id,true]));
  app.learner.completed.assemble=STEPS.map(s=>s.id);app.learner.completed.disassemble=DISASSEMBLY.map(s=>s.id);
  Object.assign(app.learner.answers,Object.fromEntries(QUIZ.map(q=>[q.id,q.answer])));app.submitQuiz();
  app.report();
  assert.match(blobs.at(-1).contents,/仍有未完成或待修正项目/,'Zero attempted fault judgments must not count as complete digital learning');
  Object.assign(app.learner.faultAnswers,Object.fromEntries(FAULTS.map(f=>[f.id,f.answer])));app.report();
  assert.match(blobs.at(-1).contents,/满足本课数字学习完成条件/);
  const unsafe=FAULTS.find(f=>f.critical);app.learner.faultAnswers[unsafe.id]=(unsafe.answer+1)%unsafe.options.length;app.report();
  assert.match(blobs.at(-1).contents,/仍有未完成或待修正项目/,'Safety-critical fault error must block completion even when weighted score exceeds 80');
});

const failed=cases.filter(x=>!x.passed);
const record={time:new Date().toISOString(),scope:'Course-data/state and app-control regression; no visual or WebGL rendering assertions',passed:cases.length-failed.length,total:cases.length,cases};
await mkdir(resolve(root,'qa'),{recursive:true});
await writeFile(resolve(root,'qa/course-check-results.json'),JSON.stringify(record,null,2)+'\n');
for(const c of cases)console.log(`${c.passed?'PASS':'FAIL'} ${c.name}${c.error?'\n  '+c.error:''}`);
console.log(`\n${record.passed}/${record.total} checks passed; recorded qa/course-check-results.json`);
if(failed.length)process.exitCode=1;
