import {createPCScene} from './pc-scene.js';
import {PARTS,STEPS,DISASSEMBLY,QUIZ,FAULTS,SAFETY_CHECKS,PREPOWER_CHECKS,SOURCES,PLATFORM} from './content.js';
import {courseFrame,fullAmounts,missingPowerRequirements,checkedAll,stepChecksPassed,frontier,scoreAnswers,safeLoad} from './state.js';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY='pc-lab-learning-v1', ids=PARTS.map(p=>p.id), partMap=Object.fromEntries(PARTS.map(p=>[p.id,p])), sourceMap=Object.fromEntries(SOURCES.map(s=>[s.id,s]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storage;
try {storage=window.localStorage;} catch {}
const saved=storage?safeLoad(storage,KEY):null;
const learner={version:1,safety:{},prepower:{},checks:{},completed:{assemble:[],disassemble:[]},answers:{},quizAttempts:[],faultAnswers:{},faultHistory:[],events:[],...saved};
for(const k of ['safety','prepower','checks','answers','faultAnswers']) if(!learner[k]||typeof learner[k]!=='object'||Array.isArray(learner[k]))learner[k]={};
for(const k of ['quizAttempts','faultHistory','events']) if(!Array.isArray(learner[k]))learner[k]=[];
if(!learner.completed||typeof learner.completed!=='object')learner.completed={};
for(const d of ['assemble','disassemble']) if(!Array.isArray(learner.completed[d]))learner.completed[d]=[];
let scene=null, mode='observe', index=0, progress=1, explosion=0, selected='motherboard', isolated=null, labels=true, speed=1, running=false, autoRotate=false, practice=false, sata=false, sidebar='tasks', reduced=matchMedia('(prefers-reduced-motion: reduce)').matches, quizSubmitted=false, toastTimer, lastTime=0, lastStats=0;
const list=()=>mode==='disassemble'?DISASSEMBLY:STEPS;
const direction=()=>mode==='disassemble'?'disassemble':'assemble';
const timelineMode=()=>mode==='assemble'||mode==='disassemble';
const currentStep=()=>list()[index];
const checkKey=()=>direction()+':'+currentStep().id;
const currentChecks=()=>learner.checks[checkKey()]||{};
const dateText=()=>new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'medium',timeZone:'Asia/Shanghai'}).format(new Date());
function persist(){try{storage?.setItem(KEY,JSON.stringify(learner));$('#save-status').textContent=storage?'本机记录已保存 · '+new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Shanghai'}).format(new Date()):'当前仅在会话中记录，请导出报告';}catch{$('#save-status').textContent='本机存储不可用，请导出报告';}}
function event(type,detail){learner.events.push({time:new Date().toISOString(),type,detail});if(learner.events.length>800)learner.events.shift();persist();}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3800);}
function sourceLinks(refs){return `<div class="source-links">${(refs||[]).filter(id=>sourceMap[id]).map(id=>`<a href="${esc(sourceMap[id].url)}" target="_blank" rel="noopener noreferrer" title="${esc(sourceMap[id].title)}">${esc(id)} · 官方依据 ↗</a>`).join('')}</div>`;}
const bullets=items=>`<ul class="detail-list">${(items||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
function frame(){return timelineMode()?courseFrame(ids,list(),index,progress,direction(),sata):fullAmounts(ids,sata);}
function syncScene(){scene?.setState({amounts:frame(),explosion:mode==='explode'?explosion:0,selected,isolated,labels,mode,phase:timelineMode()?{index,progress,direction:direction(),stepId:currentStep().id}:null});}
function syncTransport(){
  $('#play').innerHTML=`<span>${running?'Ⅱ':'▶'}</span> ${running?'暂停':'播放'}`;
  $('#play').setAttribute('aria-label',running?'暂停动画':'播放动画');
  if(timelineMode()){
    $('#transport-kicker').textContent=practice?'PRACTICE / CHECK BEFORE NEXT':'GUIDED '+(mode==='assemble'?'ASSEMBLY':'DISASSEMBLY');
    $('#transport-title').textContent=currentStep().title;
    $('#step-counter').textContent=String(index+1).padStart(2,'0')+' / '+list().length;
    $('#range-left').textContent='本步';$('#range-right').textContent='完成';
    $('#timeline').setAttribute('aria-label','当前步骤动画进度');$('#timeline').value=Math.round(progress*100);$('#range-value').textContent=Math.round(progress*100)+'%';
  }else{
    $('#transport-kicker').textContent=mode==='explode'?'EXPLODED VIEW / STRUCTURE':'STRUCTURE EXPLORATION';
    $('#transport-title').textContent=mode==='explode'?'连续爆炸拆解':'整机结构';$('#step-counter').textContent=mode==='explode'?Math.round(explosion*100)+'%':'READY';
    $('#range-left').textContent='合拢';$('#range-right').textContent='展开';$('#timeline').setAttribute('aria-label','爆炸拆解程度');$('#timeline').value=mode==='explode'?Math.round(explosion*100):0;$('#range-value').textContent=mode==='explode'?Math.round(explosion*100)+'%':'0%';
  }
  $('#previous').disabled=!timelineMode()||index===0;$('#next').disabled=!timelineMode()||index===list().length-1;
  $('#assessment').classList.toggle('active',practice);$('#assessment').innerHTML=practice?'实训中 <span>✓</span>':'实训考核 <span>↗</span>';
}
function syncHUD(){
  const label={observe:'整机结构观察',explode:'结构爆炸 · 用于认识层级',assemble:practice?'装配实训 · 需逐步检查':'装配演示 · 可跳转观察',disassemble:practice?'拆卸实训 · 先执行断电':'规范拆卸 · 演示路径'};
  $('#stage-mode').textContent=label[mode];
  if(timelineMode()){
    const step=currentStep();
    $('#step-hud').innerHTML=`<span class="hud-index">${esc(step.id)}</span><div><strong>${esc(step.title)}</strong><span>${esc(practice?'逐项检查后，确认本工位完成。':(step.short||'观察示意不计入实训完成记录。'))}</span></div>`;
  }else $('#step-hud').innerHTML=`<span class="hud-index">${mode==='explode'?'EXPLODE':'EXPLORE'}</span><div><strong>${mode==='explode'?'沿检修方向展开，认识装配层级':'从整机认识每一个部件'}</strong><span>${mode==='explode'?'爆炸量仅用于观察；规范拆卸请进入对应模式。':'点选模型或部件清单，查看作用与接口。'}</span></div>`;
}
function renderOutline(){
  const outline=$('#outline');
  $('#tasks-tab').setAttribute('aria-pressed',String(sidebar==='tasks'));$('#parts-tab').setAttribute('aria-pressed',String(sidebar==='parts'));
  if(sidebar==='parts'){
    $('#list-subtitle').textContent='HARDWARE INVENTORY';$('#list-count').textContent=PARTS.length+' PARTS';
    outline.innerHTML=PARTS.map((p,i)=>`<button class="part-row ${selected===p.id?'active':''}" data-part="${esc(p.id)}" aria-pressed="${selected===p.id}"><span class="part-icon">${String(i+1).padStart(2,'0')}</span><span class="row-label">${esc(p.name)}<small>${esc(p.en||p.spec)}</small></span></button>`).join('');
  }else{
    const steps=list(), done=learner.completed[direction()], f=frontier(steps,done);let chapter='';
    $('#list-subtitle').textContent=mode==='disassemble'?'DISASSEMBLY SEQUENCE':'ASSEMBLY SEQUENCE';$('#list-count').textContent=steps.length+' STEPS';
    outline.innerHTML=steps.map((s,i)=>{const head=chapter!==s.chapter?`<div class="chapter-title">${esc(s.chapter)}</div>`:'';chapter=s.chapter;return head+`<button class="step-row ${timelineMode()&&index===i?'active':''} ${done.includes(s.id)?'complete':''}" data-step="${i}" aria-current="${timelineMode()&&index===i?'step':'false'}"><span class="step-number">${done.includes(s.id)?'✓':String(i+1).padStart(2,'0')}</span><span class="row-label">${esc(s.short||s.title)}</span>${practice&&i>f?'<span class="row-lock" aria-label="前置工位未完成">○</span>':''}</button>`;}).join('');
  }
}
function renderInspector(){
  const content=$('#inspector-content');
  if(timelineMode()&&sidebar!=='parts'){
    const s=currentStep(), done=learner.completed[direction()].includes(s.id), checks=currentChecks();
    const optionalSkipped=mode==='disassemble'&&index===4&&!sata;
    $('#inspector-label').textContent=practice?'工位执行与检查':'操作指导';$('#inspector-index').textContent=String(index+1).padStart(2,'0')+' / '+list().length;
    content.innerHTML=`${practice?`<div class="training-badge">${done?'✓ 本工位已确认':'实训执行中'} · ${learner.completed[direction()].length} / ${list().length} 工位<div class="progress-bar"><span style="width:${learner.completed[direction()].length/list().length*100}%"></span></div></div>`:''}<div class="content-kicker">${esc(s.id)} / ${esc(s.chapter)}</div><h2>${esc(s.title)}</h2><p>${esc(s.instruction)}</p><h3>进入本步前</h3>${bullets(s.prerequisites||[])}<h3>为什么这样做</h3><div class="info-block">${esc(s.principle)}</div>${s.warning?`<div class="warning"><strong>操作注意</strong>${esc(s.warning)}</div>`:''}<h3>${practice?'本工位检查（逐项确认）':'完成检查点'}</h3>${practice&&optionalSkipped?'<div class="info-block">本机未启用 SATA 扩展。本工位可记录为未配置并跳过，无需执行不存在器件的拆除检查。</div>':practice?(s.checks||[]).map((c,i)=>`<label class="check-label"><input type="checkbox" data-step-check="${i}" ${checks[i]?'checked':''}><span>${esc(c)}</span></label>`).join(''):bullets(s.checks)}${mode==='assemble'&&index===17?`<button class="secondary-btn wide" data-action="prepower">打开通电前总检 ↗</button>`:''}${mode==='assemble'&&index===18?'<button class="secondary-btn wide" data-action="uefi">查看 POST / UEFI 教学模拟 ↗</button>':''}${practice?`<button class="primary-btn wide" data-action="confirm-step">${optionalSkipped?'记录未配置并继续':'确认本工位完成'} →</button>`:'<p class="small-note">演示可自由跳转，不会计入实训完成记录。</p>'}${sourceLinks(s.sources)}`;
  }else{
    const p=partMap[selected]||PARTS[0];$('#inspector-label').textContent='部件知识';$('#inspector-index').textContent=String(PARTS.findIndex(x=>x.id===p.id)+1).padStart(2,'0');
    content.innerHTML=`<div class="content-kicker">${esc(p.en||'HARDWARE COMPONENT')}</div><h2>${esc(p.name)}</h2><div class="part-spec">${esc(p.spec)}</div><p>${esc(p.description)}</p><h3>安装位置与接口</h3><div class="info-block">${esc(p.location)}</div><h3>实训要点</h3>${bullets(Array.isArray(p.precautions)?p.precautions:[p.precautions])}<button class="secondary-btn wide" data-action="focus">聚焦此部件 ↗</button>${p.id.startsWith('sata')?`<label class="check-label"><input type="checkbox" id="sata-toggle" ${sata?'checked':''}><span>启用可选 SATA 扩展支线（数据与供电同时接入）</span></label>`:''}${sourceLinks(p.sources)}`;
  }
}
function render(){
  $$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  $('#labels-btn').setAttribute('aria-pressed',String(labels));$('#isolate-btn').setAttribute('aria-pressed',String(!!isolated));$('#motion-btn').setAttribute('aria-pressed',String(reduced));
  renderOutline();renderInspector();syncTransport();syncHUD();syncScene();
}
function stop(){running=false;autoRotate=false;syncTransport();}
function setMode(next,keepPractice=false){
  if(practice&&!keepPractice){practice=false;toast('已返回演示观察；已确认的实训记录保留。');}
  stop();mode=next;index=0;progress=1;explosion=next==='explode'?.7:0;isolated=null;
  if(timelineMode()){selected=currentStep().partIds?.find(id=>partMap[id])||'motherboard';sidebar='tasks';progress=0;}
  render();
}
function selectPart(id,focus=true){if(!partMap[id])return;selected=id;sidebar='parts';if(isolated)isolated=id;renderOutline();renderInspector();syncScene();if(focus)scene?.focusPart?.(id);}
function visitStep(i,{fromPlayback=false}={}){
  const steps=list();i=Math.max(0,Math.min(steps.length-1,i));
  if(practice&&i>frontier(steps,learner.completed[direction()])){toast('请先完成前面的工位检查；观察跳转不会计入实训。');return false;}
  if(!fromPlayback)stop();index=i;progress=reduced?1:0;isolated=null;selected=steps[i].partIds?.find(id=>partMap[id])||'motherboard';sidebar='tasks';render();
  const active=$('.step-row.active'), outline=$('#outline');
  if(active){const a=active.getBoundingClientRect(),b=outline.getBoundingClientRect();if(a.bottom>b.bottom)outline.scrollTop+=a.bottom-b.bottom+8;else if(a.top<b.top)outline.scrollTop-=b.top-a.top+8;}
  if((mode==='assemble'&&index>=3&&index<=9)||(mode==='disassemble'&&index>=8&&index<=12))scene?.focusPart?.('motherboard');
  else scene?.resetView();
  return true;
}
function togglePlay(){
  if(running){stop();return;}
  if(reduced){
    if(timelineMode()){progress=1;syncScene();syncTransport();toast('减少动态已启用：显示本步终态。可用“下一步”继续。');}
    else if(mode==='explode'){explosion=explosion>.5?0:1;syncScene();syncTransport();}
    else toast('减少动态已启用。可使用预设视角或手动旋转模型。');
    return;
  }
  if(timelineMode()&&progress>=1){if(index===list().length-1||practice)progress=0;else visitStep(index+1);}
  if(mode==='explode'&&explosion>=.999)explosion=0;
  if(mode==='observe')autoRotate=true;
  running=true;syncTransport();
}
function openDialog(title,html,kicker='PC LAB / LEARNING'){$('#dialog-title').textContent=title;$('#dialog-kicker').textContent=kicker;$('#dialog-body').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function showPlatform(){openDialog('固定教学平台',`<p>${esc(PLATFORM.description)}</p><div class="spec-grid">${PLATFORM.specs.map(s=>`<div class="spec-item"><small>${esc(s.label)}</small><strong>${esc(s.value)}</strong></div>`).join('')}</div><div class="warning"><strong>备课与实物核对</strong>本模型是教学结构示意。实训主板需要提前核对 Ryzen 5 5600 的 BIOS 支持；未核实的最低版本号不作为本课事实。接口、螺钉与散热器装法只适用于对应平台。</div><button class="secondary-btn wide" data-action="sources">查看官方知识来源 ↗</button>`,'PLATFORM / ATX · AM4 · DDR4');}
function showSources(){openDialog('知识来源与教学边界',`<p>课程使用一套固定平台。下面的厂商资料用于核验接口、安装条件与安全要点，不能把其中某个型号的参数推广到所有电脑。</p>${SOURCES.map(s=>`<div class="source-item"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.id)} · ${esc(s.title)} ↗</a><p>${esc(s.note||'对应平台的官方资料。')}</p></div>`).join('')}<div class="warning"><strong>教学模型边界</strong>几何为程序建模，未复刻制造尺寸、公差、完整走线和装配力矩。POST / UEFI 窗口是模拟，不读取你当前电脑的数据。电源作为封闭模块；不开展电源内部拆解。</div>`,'REFERENCES / VERIFIED 2026-10-20');}
function showHelp(){openDialog('如何使用这个工作台',`<div class="help-grid"><section><h3>01 · 观察结构</h3><p>在模型上拖动旋转，滚轮缩放。用预设视角、复位与部件清单定位。隔离按钮只保留当前部件。</p></section><section><h3>02 · 爆炸与装配</h3><p>爆炸滑杆认识层级；装配和拆卸使用各自步骤。播放可暂停，速度可调，动画中可切换工位。</p></section><section><h3>03 · 实训考核</h3><p>进入考核后重新确认安全条件，逐工位勾选检查并确认完成。演示跳转与观看不会取得实训成绩。</p></section><section><h3>04 · 数据与键盘</h3><p>Tab 切换焦点、Enter 激活按钮；未操作表单时空格播放，左右方向键切步。报告可导出，学习数据只保存在此浏览器。</p></section></div><p class="small-note" style="margin-top:18px">若本机存储不可用，课件仍可使用；关闭页面前导出学习报告。截图只导出三维画布。减少动态时，播放直接显示当前步骤终态。</p>`,'WORKBENCH / QUICK GUIDE');}
function startPractice(){
  const d=mode==='disassemble'?'disassemble':'assemble', steps=d==='assemble'?STEPS:DISASSEMBLY;
  const count=learner.completed[d].length;
  openDialog(d==='assemble'?'进入装配实训':'进入拆卸实训',`<p>先重新确认本次工位安全条件。实训按顺序进行，每步检查后才记为完成；既往记录与错题历史保留。</p>${SAFETY_CHECKS.map(s=>`<label class="check-label"><input type="checkbox" data-entry-safety="${esc(s.id)}"><span>${esc(s.text)}</span></label>`).join('')}<div class="info-block">本方向已确认：${count} / ${steps.length} 工位。${d==='disassemble'?'拆卸入口必须再次关机、关闭电源并拔下交流线。':'使用本课固定硬件与匹配线材。'}</div><div class="dialog-actions">${count?'<button class="secondary-btn" data-action="new-practice" data-direction="'+d+'">从头重练（保留历史）</button>':''}<button class="primary-btn" data-action="begin-practice" data-direction="${d}">${count?'继续实训':'开始实训'} →</button></div>`,'PRACTICE / SAFETY GATE');
}
function beginPractice(d,restart=false){
  const values=Object.fromEntries($$('[data-entry-safety]').map(x=>[x.dataset.entrySafety,x.checked]));
  if(!checkedAll(SAFETY_CHECKS,values)){toast('请逐项确认本次断电、ESD 与工位条件。');return;}
  if(restart){event('restart-practice',{direction:d,previousCompleted:[...learner.completed[d]]});learner.completed[d]=[];for(const key of Object.keys(learner.checks))if(key.startsWith(d+':'))delete learner.checks[key];if(d==='assemble')learner.prepower={};}
  learner.safety=values;event('safety-confirmed',{direction:d,values});
  practice=true;setMode(d,true);const f=frontier(list(),learner.completed[d]);visitStep(Math.min(f,list().length-1));$('#modal').close();toast('实训已开始：观看动作，逐项检查，再确认本工位。');
}
function showPrepower(){openDialog('通电前总检',`<p>本表记录教学中的逐项检查，不代表软件已经检测了真实硬件。实物通电应遵循教师和实训室要求。</p>${PREPOWER_CHECKS.map(s=>`<label class="check-label"><input type="checkbox" data-prepower="${esc(s.id)}" ${learner.prepower[s.id]?'checked':''}><span>${esc(s.text)}</span></label>`).join('')}<button class="primary-btn wide" data-action="save-prepower">保存总检结果</button>`,'POWER ON / PRE-FLIGHT CHECK');}
function confirmStep(){
  if(!practice)return;
  const steps=list(),s=currentStep(),d=direction(),f=frontier(steps,learner.completed[d]);
  if(index>f){toast('前置工位尚未确认。');return;}
  if(!checkedAll(SAFETY_CHECKS,learner.safety)){toast('请先完成本次安全条件确认。');return;}
  const skipped=d==='disassemble'&&index===4&&!sata;
  if(!skipped&&!stepChecksPassed(s,currentChecks())){toast('请先逐项确认当前工位的检查点。');return;}
  if(d==='assemble'&&index>=17){
    const missing=missingPowerRequirements(courseFrame(ids,STEPS,17,1,'assemble',sata));
    if(missing.length){toast('模型尚缺通电前置部件：'+missing.map(x=>partMap[x]?.name||x).join('、'));return;}
    if(!checkedAll(PREPOWER_CHECKS,learner.prepower)){showPrepower();toast('总检全部确认后，再完成当前工位。');return;}
  }
  if(!learner.completed[d].includes(s.id))learner.completed[d].push(s.id);
  progress=1;event(skipped?'step-skipped-unconfigured':'step-confirmed',{direction:d,step:s.id,checks:{...currentChecks()},skipped});
  if(index<steps.length-1){visitStep(index+1);toast('已记录 '+s.id+'，继续下一工位。');}
  else {stop();render();showPracticeResult();}
}
function showPracticeResult(){const d=direction(),n=list().length;openDialog('本方向实训记录',`<div class="result-score"><b>${learner.completed[d].length}<small>/ ${n} 工位</small></b><div><strong>${learner.completed[d].length===n?'该方向工位已全部确认':'实训仍在进行'}</strong><small>自报检查记录，真实操作需教师评定</small></div></div><p>继续完成知识自测和故障排查，导出带时间与修正历史的学习报告。工位记录不会因为切换观察模式而被清除。</p><div class="dialog-actions"><button class="secondary-btn" data-action="quiz">知识自测</button><button class="primary-btn" data-action="report">导出学习报告 ↓</button></div>`,'PRACTICE / LEARNING EVIDENCE');}
function showUEFI(){
  if(practice&&(!checkedAll(PREPOWER_CHECKS,learner.prepower)||index<18)){toast('实训中需先完成总检和前置工位，才能进入通电模拟。');return;}
  openDialog('POST / UEFI 首次启动检查',`<span class="sim-badge">教学模拟 · 不读取当前设备</span><p>实际装配完成后，先观察 POST，再按本板手册使用 Delete 进入 UEFI。下面是要核对的项目示例，不是硬件实测值。</p><div class="uefi-grid"><span>Processor</span><strong>AMD Ryzen 5 5600</strong><span>Memory</span><strong>16 GB / DDR4</strong><span>M2_1</span><strong>NVMe SSD · 已识别示例</strong><span>CPU_FAN1</span><strong>需现场确认转速</strong><span>CPU Temperature</span><strong>需现场观察趋势</strong><span>Bootable OS</span><strong>未在本课安装</strong></div><h3>应记录的结论</h3>${bullets(['风扇转动不能单独证明 POST 已通过。','SSD 被识别与其中存在可引导系统，是两件事。','本课 Ryzen 5 5600 需要独显，显示器应接显卡。','CPU 温度快速异常或风扇异常时安全停机检查，不延长运行试探。'])}<button class="secondary-btn wide" data-action="faults">进入故障判断练习 ↗</button>`,'FIRMWARE / TEACHING SIMULATION');
}
function showQuiz(submitted=quizSubmitted){
  quizSubmitted=submitted;const score=scoreAnswers(QUIZ,learner.answers);
  openDialog('硬件装配知识自测',`${submitted?`<div class="result-score"><b>${score.score}<small>/ 100</small></b><div><strong>${score.score>=80&&score.criticalPassed?'知识自测达到本课要求':'请查看解析并修正'}</strong><small>${score.correct} / ${score.total} 正确 · 关键安全题${score.criticalPassed?'全部正确':'尚有错误或未作答'}</small></div></div>`:'<p>完成后可查看逐题解析。80 分且关键安全题全部正确为本课自测要求；不等同于实物操作考核。</p>'}${QUIZ.map((q,i)=>`<section class="question"><h3>${i+1}. ${esc(q.question)}${q.critical?'<span class="critical">关键安全</span>':''}</h3>${q.options.map((o,j)=>`<label class="answer-option"><input type="radio" name="quiz-${esc(q.id)}" data-quiz="${esc(q.id)}" value="${j}" ${learner.answers[q.id]===j?'checked':''}><span>${String.fromCharCode(65+j)}. ${esc(o)}</span></label>`).join('')}${submitted?`<div class="feedback ${learner.answers[q.id]===q.answer?'correct':''}">${learner.answers[q.id]===q.answer?'✓ 回答正确':Number.isInteger(learner.answers[q.id])?'请修正本题':'本题尚未作答'} · ${esc(q.explanation)}</div>`:''}</section>`).join('')}<div class="dialog-actions"><button class="secondary-btn" data-action="report">导出报告</button><button class="primary-btn" data-action="submit-quiz">${submitted?'重新提交并保留历史':'提交自测，查看解析'} →</button></div>`,'ASSESSMENT / KNOWLEDGE CHECK');
}
function submitQuiz(){const score=scoreAnswers(QUIZ,learner.answers);learner.quizAttempts.push({time:new Date().toISOString(),answers:{...learner.answers},...score});if(learner.quizAttempts.length>50)learner.quizAttempts.shift();event('quiz-submitted',{score:score.score,criticalPassed:score.criticalPassed});showQuiz(true);$('#dialog-body').scrollIntoView({block:'start'});$('#modal').scrollTop=0;}
function showFaults(){openDialog('故障排查 · 选择下一项检查',`<p>根据现象选择优先验证动作。调试灯用于缩小范围，不能单独证明某个部件已损坏；内部检查一律先断电。</p>${FAULTS.map((f,i)=>{const value=learner.faultAnswers[f.id];return `<section class="question"><h3>${String(i+1).padStart(2,'0')} / ${esc(f.title)}</h3><div class="info-block">${esc(f.symptom)}</div>${f.options.map((o,j)=>`<label class="answer-option"><input type="radio" name="fault-${esc(f.id)}" data-fault="${esc(f.id)}" value="${j}" ${value===j?'checked':''}><span>${esc(o)}</span></label>`).join('')}${Number.isInteger(value)?`<div class="feedback ${value===f.answer?'correct':''}">${value===f.answer?'✓ 优先检查正确':'换一个验证方向'} · ${esc(f.explanation)}</div>`:''}</section>`;}).join('')}`,'DIAGNOSIS / VERIFY BEFORE REPLACING');}
function download(name,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function report(){
  const latest=learner.quizAttempts.at(-1), faultCorrect=FAULTS.filter(f=>learner.faultAnswers[f.id]===f.answer).length;
  const faultCriticalPassed=scoreAnswers(FAULTS,learner.faultAnswers).criticalPassed;
  const safetyPassed=checkedAll(SAFETY_CHECKS,learner.safety), assembly=learner.completed.assemble.length, disassembly=learner.completed.disassemble.length;
  const score=Math.round((safetyPassed?20:0)+(latest?latest.score*.15:0)+assembly/STEPS.length*30+faultCorrect/Math.max(1,FAULTS.length)*20+disassembly/DISASSEMBLY.length*15);
  const passed=safetyPassed&&assembly===STEPS.length&&disassembly===DISASSEMBLY.length&&latest?.criticalPassed&&faultCriticalPassed&&score>=80;
  const lines=['# PC LAB · 电脑主机拆装实训学习报告','',`生成时间：${dateText()}（Asia/Shanghai）`,'','## 固定教学平台',PLATFORM.title,PLATFORM.description,'','## 结果',`- 课程形成性得分：${score} / 100（安全20、知识15、装配30、排故20、拆卸15）`,`- 当前状态：${passed?'满足本课数字学习完成条件':'仍有未完成或待修正项目'}`,`- 本次安全条件：${safetyPassed?'已自报确认':'未全部确认'}`,`- 装配确认：${assembly} / ${STEPS.length} 工位`,`- 拆卸确认：${disassembly} / ${DISASSEMBLY.length} 工位`,`- 最近知识自测：${latest?latest.score+'分，关键安全题'+(latest.criticalPassed?'全部正确':'未全部正确'):'尚未提交'}`,`- 故障练习：${faultCorrect} / ${FAULTS.length} 当前正确`,`- 关键安全排故：${faultCriticalPassed?'全部正确':'存在未作答或错误，不能通过本课数字学习'}`,'','说明：这是浏览器中的自报检查与形成性评价，不代替真实设备操作和教师评定。演示跳转不记入完成记录。','', '## 安全检查',...SAFETY_CHECKS.map(s=>`- [${learner.safety[s.id]?'x':' '}] ${s.text}`),'','## 通电前检查',...PREPOWER_CHECKS.map(s=>`- [${learner.prepower[s.id]?'x':' '}] ${s.text}`),'','## 装配工位',...STEPS.map(s=>`- [${learner.completed.assemble.includes(s.id)?'x':' '}] ${s.id} ${s.title}`),'','## 拆卸工位',...DISASSEMBLY.map(s=>`- [${learner.completed.disassemble.includes(s.id)?'x':' '}] ${s.id} ${s.title}`),'','## 自测提交历史',...learner.quizAttempts.map((a,i)=>`${i+1}. ${a.time} · ${a.score}分 · 关键项${a.criticalPassed?'通过':'未通过'} · 答案 ${JSON.stringify(a.answers)}`),'','## 故障尝试历史',...learner.faultHistory.map(a=>`- ${a.time} ${a.id}: 选择${a.answer+1} ${a.correct?'正确':'错误（保留以供复盘）'}`),'','## 操作事件',...learner.events.map(a=>`- ${a.time} ${a.type}: ${JSON.stringify(a.detail)}`),'','## 官方来源',...SOURCES.map(s=>`- ${s.id} [${s.title}](${s.url})`),'','## 教学边界','模型为教学比例，非制造CAD；不读取真实电脑硬件，不提供通用力矩、温度合格线或BIOS最低版号；不包含电源内部维修。',''];
  download('电脑主机拆装实训-学习报告.md',lines.join('\n'),'text/markdown;charset=utf-8');toast('已导出带工位、答题与修正历史的学习报告。');
}

$$('[data-mode]').forEach(b=>b.addEventListener('click',()=>{setMode(b.dataset.mode);scene?.resetView();}));
$('#tasks-tab').onclick=()=>{sidebar='tasks';renderOutline();renderInspector();};$('#parts-tab').onclick=()=>{sidebar='parts';renderOutline();renderInspector();};
$('#outline').addEventListener('click',e=>{const part=e.target.closest('[data-part]'),step=e.target.closest('[data-step]');if(part)selectPart(part.dataset.part);if(step){if(!timelineMode())setMode('assemble');visitStep(Number(step.dataset.step));}});
$('#labels-btn').onclick=()=>{labels=!labels;render();};$('#isolate-btn').onclick=()=>{isolated=isolated?null:selected;render();if(isolated)scene?.focusPart?.(isolated);else scene?.resetView();};
$('#reset-view').onclick=()=>{stop();isolated=null;scene?.resetView();$$('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view==='iso')));render();};
$$('[data-view]').forEach(b=>b.onclick=()=>{scene?.setView(b.dataset.view);$$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
$('#capture').onclick=()=>{try{const data=scene?.capture();if(!data){toast('当前三维截图尚未就绪。');return;}const bytes=Uint8Array.from(atob(data.split(',')[1]),c=>c.charCodeAt(0));download('PC-LAB-'+mode+'.png',bytes,'image/png');toast('已导出当前三维模型截图。');}catch{toast('当前浏览器无法导出画布截图。');}};
$('#play').onclick=togglePlay;$('#previous').onclick=()=>visitStep(index-1);$('#next').onclick=()=>{if(practice)confirmStep();else visitStep(index+1);};
$('#restart').onclick=()=>{stop();if(timelineMode()){progress=0;if(!practice)visitStep(0);else render();}else if(mode==='explode'){explosion=0;syncScene();syncTransport();}else scene?.resetView();};
$('#speed').onchange=e=>{speed=Number(e.target.value);};
$('#timeline').oninput=e=>{const t=Number(e.target.value)/100;stop();if(timelineMode())progress=t;else{if(mode==='observe'){mode='explode';$$('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));syncHUD();}explosion=t;}syncScene();syncTransport();};
$('#motion-btn').onclick=()=>{reduced=!reduced;stop();if(reduced&&timelineMode())progress=1;render();toast(reduced?'已减少动态：播放显示步骤终态。':'已启用分步动画。');};
$('#platform-btn').onclick=showPlatform;$('#sources-btn').onclick=showSources;$('#help').onclick=showHelp;$('#assessment').onclick=()=>{if(practice){practice=false;stop();render();toast('已离开实训模式，完成记录保留。');}else startPractice();};
$('#quiz-btn').onclick=()=>showQuiz();$('#faults-btn').onclick=showFaults;$('#report-btn').onclick=report;$('#close-modal').onclick=()=>$('#modal').close();
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b)return;
  const actions={sources:showSources,focus:()=>scene?.focusPart?.(selected),prepower:showPrepower,uefi:showUEFI,'confirm-step':confirmStep,quiz:()=>showQuiz(),faults:showFaults,report,'submit-quiz':submitQuiz,'begin-practice':()=>beginPractice(b.dataset.direction),'new-practice':()=>beginPractice(b.dataset.direction,true),'save-prepower':()=>{persist();if(checkedAll(PREPOWER_CHECKS,learner.prepower)){event('prepower-confirmed',{values:{...learner.prepower}});$('#modal').close();toast('总检已保存，可返回确认当前工位。');}else toast('已保存现有检查；全部确认前不能通电。');}};
  actions[b.dataset.action]?.();
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.matches('[data-step-check]')){learner.checks[checkKey()]||={};learner.checks[checkKey()][t.dataset.stepCheck]=t.checked;persist();}
  if(t.matches('[data-prepower]')){learner.prepower[t.dataset.prepower]=t.checked;persist();}
  if(t.matches('[data-quiz]')){learner.answers[t.dataset.quiz]=Number(t.value);persist();}
  if(t.matches('[data-fault]')){const f=FAULTS.find(f=>f.id===t.dataset.fault);learner.faultAnswers[f.id]=Number(t.value);learner.faultHistory.push({time:new Date().toISOString(),id:f.id,answer:Number(t.value),correct:Number(t.value)===f.answer});if(learner.faultHistory.length>150)learner.faultHistory.shift();persist();const scroll=$('#modal').scrollTop;showFaults();$('#modal').scrollTop=scroll;}
  if(t.id==='sata-toggle'){sata=t.checked;syncScene();toast(sata?'已启用 SATA 扩展：数据与供电为独立连接。':'已关闭可选 SATA 扩展，不影响主线实训。');}
});
document.addEventListener('keydown',e=>{if($('#modal').open||e.target.closest('input,select,textarea,button,a'))return;if(e.code==='Space'){e.preventDefault();togglePlay();}if(e.code==='ArrowRight'&&timelineMode()){e.preventDefault();if(practice)confirmStep();else visitStep(index+1);}if(e.code==='ArrowLeft'&&timelineMode()){e.preventDefault();visitStep(index-1);}});
function animate(time){
  const dt=lastTime?Math.min((time-lastTime)/1000,.08):0;lastTime=time;
  if(running){
    if(timelineMode()){
      progress=Math.min(1,progress+dt*speed/Math.max(.5,Number(currentStep().duration)||3));
      if(progress>=1){if(practice||index>=list().length-1)stop();else visitStep(index+1,{fromPlayback:true});}
    }else if(mode==='explode'){explosion=Math.min(1,explosion+dt*speed/6);if(explosion>=1)stop();}
    else if(autoRotate&&scene?.rotate)scene.rotate(dt*.18);
    syncScene();syncTransport();
  }
  if(time-lastStats>3000&&scene){lastStats=time;const s=scene.getStats?.();if(s){$('#render-status').textContent=`${s.fps||0} FPS · ${Number(s.triangles||0).toLocaleString()} TRI`;$('#render-status').title=JSON.stringify(s);}}
  requestAnimationFrame(animate);
}
render();persist();
try{scene=createPCScene($('#viewport'),{onSelect:id=>selectPart(id,false)});syncScene();$('#loading').hidden=true;}catch(error){$('#loading').hidden=true;$('#scene-error').hidden=false;$('#capture').disabled=true;$('#render-status').textContent='WEBGL UNAVAILABLE';console.error('PC LAB scene initialization failed',error);}
requestAnimationFrame(animate);
