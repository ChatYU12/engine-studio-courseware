import { createHeartScene } from './heart3d.js';
import { STRUCTURES, PHASES, NAV, QUIZ, SOURCES } from './content.js';
import { leftPressure, aorticPressure, leftAtrial, rightVentricular, pulmonaryPressure, rightAtrial } from './pressures.js';

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};

const nav=$('#courseNav');
nav.innerHTML=NAV.map(n=>`<button class="nav-item ${n.id==='anatomy'?'active':''}" data-jump="${n.id}" aria-current="${n.id==='anatomy'?'page':'false'}"><span class="nav-num">${n.num}</span><span><span class="nav-title">${n.title}</span><span class="nav-desc">${n.desc}</span></span></button>`).join('');
$('#moduleTabs').innerHTML=NAV.map(n=>`<button class="module-tab ${n.id==='anatomy'?'active':''}" data-jump="${n.id}" aria-selected="${n.id==='anatomy'}"><span>${n.num}</span>${n.title}</button>`).join('');
const moduleInfo={
  overview:['课程导览','把结构、电活动、压力和循环连成一条因果链','学习目标 · 30 分钟'],
  anatomy:['三维解剖','识别四腔、四瓣、大血管、心壁和冠状循环','观察 · 点选 · 旋转'],
  electrical:['心肌电活动','理解起搏细胞自律性、工作心肌动作电位和传导顺序','电信号 · 延搁 · 收缩'],
  cycle:['心动周期','把 ECG、压力、瓣膜状态和心室容积放到同一时间轴','逐期判读 · 联动曲线'],
  circulation:['体肺循环','比较两个串联回路的压力、阻力和输出匹配','双循环 · 动力学'],
  practice:['实训与自测','完成结构观察任务、阶段判断和即时测验','4 项任务 · 8 道自测']
};
let activePanel='anatomy', currentTime=.025, playing=false, playRate=.45, lastTick=performance.now(), toastTimer;
let heartModel=null;

function openPanel(id,scroll=true){
  if(!moduleInfo[id])return;
  activePanel=id;
  $$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==id);
  $$('[data-jump]').forEach(b=>{const active=b.dataset.jump===id;b.classList.toggle('active',active);if(b.classList.contains('nav-item'))b.setAttribute('aria-current',active?'page':'false');if(b.classList.contains('module-tab'))b.setAttribute('aria-selected',active?'true':'false');});
  const info=moduleInfo[id];$('#moduleNumber').textContent=NAV.find(n=>n.id===id).num;$('#moduleTitle').textContent=info[0];$('#moduleDesc').textContent=info[1];$('#moduleTag').textContent=info[2];
  $('#sidebar').classList.remove('open');
  if(scroll)window.scrollTo({top:0,behavior:'smooth'});
  if(id==='anatomy')requestAnimationFrame(()=>{if(heartModel)heartModel.renderer.setSize($('#heartStage').clientWidth,$('#heartStage').clientHeight,false);});
}

// The structural model is initialized only after its visible host has a measured size.
function initModel(){
  if(heartModel)return;
  const host=$('#heartStage');
  const descriptions={
    'right-atrium':'右心房','left-atrium':'左心房','right-ventricle':'右心室','left-ventricle':'左心室','septa':'房间隔与室间隔',
    'tricuspid-valve':'三尖瓣','mitral-valve':'二尖瓣','pulmonary-valve':'肺动脉瓣','aortic-valve':'主动脉瓣','aorta':'主动脉与主动脉弓',
    'pulmonary-trunk':'肺动脉干','svc':'上腔静脉','ivc':'下腔静脉','pulmonary-arteries':'左右肺动脉','pulmonary-veins':'肺静脉',
    'right-coronary-artery':'右冠状动脉','anterior-interventricular-artery':'前室间支（左前降支）','coronary-sinus':'冠状窦','chordae-tendineae':'腱索与乳头肌',
    'conduction-system':'心脏传导系统','interventricular-septum':'室间隔','interatrial-septum':'房间隔','heart-wall':'心壁与心尖'
  };
  heartModel=createHeartScene(host,key=>selectStructure(key,false));
  host.querySelector('.loading-model')?.remove();
  $('#structureSelect').innerHTML='<option value="">选择一个结构…</option>'+Object.entries(STRUCTURES).map(([key,d])=>`<option value="${key}">${d.name}</option>`).join('');
  $('#structureSelect').addEventListener('change',e=>{if(e.target.value)selectStructure(e.target.value,true);});
  $$('.layer-button').forEach(btn=>btn.addEventListener('click',()=>{
    const on=btn.getAttribute('aria-pressed')!=='true';btn.setAttribute('aria-pressed',String(on));heartModel.setLayer(btn.dataset.layer,on);
  }));
  $$('[data-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view,btn)));
  $('#viewReset').addEventListener('click',()=>setView('reset'));
  function selectStructure(key,focus){
    const d=STRUCTURES[key];if(!d)return;
    $('#structureTag').textContent=d.tag;$('#structureName').textContent=d.name;$('#structureEn').textContent=d.en;$('#structureBody').textContent=d.body;$('#structureCheck').textContent=d.check;
    const idx=Object.keys(STRUCTURES).indexOf(key)+1;$('#structureIndex').textContent=String(idx).padStart(2,'0');
    const select=$('#structureSelect');if(select&&select.value!==key)select.value=key;
    if(focus)heartModel.focus(key);
    toast(`${d.name} · 已定位`);
  }
  function setView(view,button){heartModel.setView(view);$$('[data-view]').forEach(b=>b.classList.toggle('active',b===button));if(view==='reset')$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='front'));}
  openPanel('anatomy',false);
}

// A single normalized timebase synchronizes every module and the 3D valve state.
function phaseAt(t){return PHASES.find(p=>t>=p.start&&t<p.end)||PHASES[PHASES.length-1];}
function volumeAt(t){
  if(t<.12)return 112+13*ease(0,.12,t);
  if(t<.18)return 125;
  if(t<.43)return 125-70*ease(.18,.43,t);
  if(t<.49)return 55;
  if(t<.60)return 55+47*ease(.49,.60,t);
  if(t<.94)return 102+10*ease(.60,.94,t);
  return 112;
}
function phaseTextUpdate(t){
  const p=phaseAt(t),idx=PHASES.indexOf(p)+1;
  $('#globalPhaseName').textContent=p.name;$('#timeValue').textContent=(t*.8).toFixed(2);
  $('#phaseOrdinal').textContent=String(idx).padStart(2,'0');$('#phaseAlt').textContent=p.alt;$('#phaseTitle').textContent=p.name;$('#phaseEcg').textContent=p.ecg;$('#phaseValves').textContent=p.valves;$('#phaseFlows').textContent=p.flows;
  $('#phaseCardText').textContent=`${p.card} 左侧：${p.lv}；右侧：${p.rv}；左室容积：${p.volume}。`;
  $('#volumeValue').textContent=Math.round(volumeAt(t));$('#svValue').textContent='70';$('#isovolumeState').textContent=(p.id==='iso-contraction'||p.id==='iso-relaxation')?'容积恒定':'非等容期';
  $('#globalTime').value=String(Math.round(t*1000));
  if(heartModel)heartModel.updateBeat(t);
  const avOpen=['atrial','rapid-filling','diastasis'].includes(p.id);
  const semiOpen=['rapid-ejection','reduced-ejection'].includes(p.id);
  const valves=[['三尖瓣',avOpen],['二尖瓣',avOpen],['肺动脉瓣',semiOpen],['主动脉瓣',semiOpen]];
  $('#valveMatrix').innerHTML=valves.map(([n,on])=>`<div class="valve-status ${on?'open':'closed'}"><span><i class="status-dot"></i>${n}</span><b>${on?'开放':'关闭'}</b></div>`).join('');
  $$('.phase-chip').forEach((el,i)=>el.classList.toggle('active',PHASES[i]===p));
  updateCursors(t);updateConduction(t,p);updateCirculation(t,p);
}

function makeSvgCharts(){
  const x0=82,x1=968,top0=43,top1=202,bot0=263,bot1=379;
  const x=t=>x0+(x1-x0)*t;
  const yTop=v=>top1-(v/140)*(top1-top0);
  const yBot=v=>bot1-(v/35)*(bot1-bot0);
  const ns='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},parent)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(parent)parent.appendChild(e);return e;};
  const makePath=(f,y,steps=240)=>{let d='';for(let i=0;i<=steps;i++){const t=i/steps;d+=(i?' L':'M')+x(t).toFixed(2)+' '+y(f(t)).toFixed(2);}return d;};
  const ecg=$('#ecgChart');
  const ecgBase=58;let ecgPath='';for(let i=0;i<=400;i++){const t=i/400;const g=(mu,s,a)=>a*Math.exp(-Math.pow((t-mu)/s,2));const v=g(.04,.018,9)-g(.116,.008,7)+g(.128,.006,30)-g(.143,.009,11)+g(.385,.050,14);ecgPath+=(i?' L':'M')+x(t).toFixed(2)+' '+(ecgBase-v).toFixed(2);}
  ecg.innerHTML='';el('line',{x1:x0,y1:ecgBase,x2:x1,y2:ecgBase,class:'pressure-grid'},ecg);el('path',{d:ecgPath,class:'ecg-path'},ecg);
  [['P',.04],['QRS',.13],['T',.385]].forEach(([label,t])=>{el('text',{x:x(t),y:16,'text-anchor':'middle',class:'chart-small-label'},ecg).textContent=label;});
  el('line',{id:'ecgCursor',x1:x(.025),y1:20,x2:x(.025),y2:78,class:'chart-cursor'},ecg);
  const chart=$('#pressureChart');chart.innerHTML='';
  // Phase bands share a common normalized time axis.
  const bands=[[0,.12,'心房收缩'],[.12,.18,'等容收缩'],[.18,.43,'射血'],[.43,.49,'等容舒张'],[.49,.60,'快速充盈'],[.60,1,'舒张中期']];
  bands.forEach(([a,b,label])=>{el('rect',{x:x(a),y:28,width:x(b)-x(a),height:367,class:'phase-band'},chart);el('text',{x:(x(a)+x(b))/2,y:421,'text-anchor':'middle',class:'chart-phase-label'},chart).textContent=label;});
  for(const v of [0,35,70,105,140]){const yy=yTop(v);el('line',{x1:x0,y1:yy,x2:x1,y2:yy,class:'pressure-grid'},chart);el('text',{x:54,y:yy+3,'text-anchor':'end',class:'chart-axis-label'},chart).textContent=String(v);}
  for(const v of [0,10,20,30]){const yy=yBot(v);el('line',{x1:x0,y1:yy,x2:x1,y2:yy,class:'pressure-grid'},chart);el('text',{x:54,y:yy+3,'text-anchor':'end',class:'chart-axis-label'},chart).textContent=String(v);}
  for(const t of [0,.25,.5,.75,1]){const xx=x(t);el('line',{x1:xx,y1:top0,x2:xx,y2:bot1,class:'pressure-grid'},chart);el('text',{x:xx,y:408,'text-anchor':'middle',class:'chart-small-label'},chart).textContent=(t*.8).toFixed(1);}
  el('text',{x:15,y:39,class:'chart-axis-label'},chart).textContent='左心';el('text',{x:15,y:258,class:'chart-axis-label'},chart).textContent='右心';el('text',{x:16,y:54,class:'chart-small-label'},chart).textContent='mmHg';el('text',{x:16,y:272,class:'chart-small-label'},chart).textContent='mmHg';
  const lines=[['lv',leftPressure,yTop],['ao',aorticPressure,yTop],['la',leftAtrial,yTop],['rv',rightVentricular,yBot],['pa',pulmonaryPressure,yBot],['ra',rightAtrial,yBot]];
  lines.forEach(([name,fn,y])=>el('path',{id:`curve-${name}`,d:makePath(fn,y),class:`pressure-line ${name}`},chart));
  el('line',{id:'pressureCursor',x1:x(.025),y1:top0,x2:x(.025),y2:bot1,class:'chart-cursor'},chart);
  lines.forEach(([name,fn,y])=>el('circle',{id:`marker-${name}`,cx:x(.025),cy:y(fn(.025)),r:5,fill:`var(--marker-${name})`,class:'chart-marker'},chart));
  const volume=$('#volumeChart');volume.innerHTML='';const vx=t=>x(t),vy=v=>157-(v-45)/(135-45)*128;
  [55,85,115,125].forEach(v=>{el('line',{x1:x0,y1:vy(v),x2:x1,y2:vy(v),class:'pressure-grid'},volume);el('text',{x:53,y:vy(v)+3,'text-anchor':'end',class:'chart-axis-label'},volume).textContent=String(v);});
  for(const t of [0,.25,.5,.75,1]){const xx=vx(t);el('line',{x1:xx,y1:25,x2:xx,y2:160,class:'pressure-grid'},volume);el('text',{x:xx,y:179,'text-anchor':'middle',class:'chart-small-label'},volume).textContent=(t*.8).toFixed(1);}
  const volPath=makePath(volumeAt,vy,240),area=volPath+` L${x1} 158 L${x0} 158 Z`;
  el('path',{d:area,class:'volume-area'},volume);el('path',{d:volPath,class:'volume-path'},volume);
  el('text',{x:87,y:vy(125)-5,class:'chart-small-label'},volume).textContent='EDV ≈ 125 mL';el('text',{x:87,y:vy(55)+14,class:'chart-small-label'},volume).textContent='ESV ≈ 55 mL';
  el('line',{id:'volumeCursor',x1:x(.025),y1:24,x2:x(.025),y2:159,class:'chart-cursor'},volume);el('circle',{id:'marker-volume',cx:x(.025),cy:vy(volumeAt(.025)),r:5,fill:'#557f7d',class:'chart-marker'},volume);
}
function updateCursors(t){
  const x=82+(968-82)*t;for(const id of ['ecgCursor','pressureCursor','volumeCursor']){const e=$(`#${id}`);if(e){e.setAttribute('x1',x);e.setAttribute('x2',x);}}
  const points={lv:[leftPressure(t),v=>202-(v/140)*(202-43)],ao:[aorticPressure(t),v=>202-(v/140)*(202-43)],la:[leftAtrial(t),v=>202-(v/140)*(202-43)],rv:[rightVentricular(t),v=>379-(v/35)*(379-263)],pa:[pulmonaryPressure(t),v=>379-(v/35)*(379-263)],ra:[rightAtrial(t),v=>379-(v/35)*(379-263)]};
  for(const [key,[val,y]] of Object.entries(points)){const m=$(`#marker-${key}`);if(m){m.setAttribute('cx',x);m.setAttribute('cy',y(val));}}
  const m=$('#marker-volume');if(m){m.setAttribute('cx',x);m.setAttribute('cy',157-(volumeAt(t)-45)/(135-45)*128);}
}

const conductionSteps=[
  ['01','窦房结 SA','自发去极化，窦性冲动起始。'],['02','心房肌 / 房间束','激动向右、左心房扩布，P 波表示心房去极化。'],['03','房室结 AV','慢传导产生约 0.1 s 延搁；心房收缩先完成。'],['04','房室束 His','穿越房室纤维骨架进入室间隔。'],['05','左右束支','沿室间隔向心尖快速下行。'],['06','浦肯野纤维','快速激动心室肌；心室自心尖方向向流出道收缩。']
];
$('#conductionSteps').innerHTML=conductionSteps.map(([num,title,body],i)=>`<div class="conduction-step" data-step="${i}"><b>${num} · ${title}</b>${body}</div>`).join('');
function updateConduction(t,p){
  const active=t<.055?0:t<.10?1:t<.16?2:t<.195?3:t<.225?4:t<.29?5:-1;
  const titles=['窦房结自发去极化','心房肌去极化','房室结生理性延搁','冲动进入房室束','左右束支快速下传','浦肯野纤维激动心室'];
  const bodies=['起搏细胞达到阈值后放电，启动一次心搏。','心房去极化形成 P 波，心房随后收缩。','AV 结的慢传导留出心房完成充盈的时间；图示延搁为教学时间轴。','冲动穿过纤维骨架唯一正常的房室电连接。','束支把激动送向心尖，再经浦肯野网络分布。','心室去极化形成 QRS，机械收缩随后开始。'];
  $('#conductionStatus').textContent=active<0?'复极 / 不应期':titles[active];$('#electricalEventTitle').textContent=active<0?'复极与不应期':titles[active];$('#electricalEventBody').textContent=active<0?'心室工作肌平台期和不应期延续，避免在同一搏中发生强直样连续收缩。':bodies[active];
  $$('.conduction-step').forEach((el,i)=>el.classList.toggle('active',i===active));
  $$('[data-conduction]').forEach(el=>{const stage=el.dataset.conduction;const on=(active===0&&stage==='atria')||(active===1&&stage==='atria')||(active===2&&stage==='av')||(active===3&&stage==='his')||(active===4&&stage==='bundles')||(active===5&&stage==='purkinje');el.classList.toggle('is-active',on);});
  const dot=$('#electricalDot');if(dot){const pts=[[354,83],[410,111],[423,149],[447,179],[475,203],[447,231]];const [x,y]=pts[Math.max(0,active)];dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.style.opacity=active<0?'0':'1';}
}

const circuitNodes=[
  ['上/下腔静脉','体循环回流','venous'],['右心房','接收静脉血','venous'],['三尖瓣','右房室口','venous'],['右心室','肺循环泵','venous'],['肺动脉瓣','右室流出道','venous'],['肺动脉','去肺气体交换','venous'],['肺毛细血管','CO₂出 / O₂入','oxygenated'],['肺静脉','回流富氧血','oxygenated'],['左心房','接收肺静脉血','oxygenated'],['二尖瓣','左房室口','oxygenated'],['左心室','体循环泵','oxygenated'],['主动脉瓣','左室流出道','oxygenated'],['主动脉','送入体循环','oxygenated'],['体循环毛细血管','组织供氧后回流','venous']
];
$('#circuitPath').innerHTML=circuitNodes.map(([name,sub,kind],i)=>`<div class="circuit-node ${kind}" data-circuit-index="${i}"><b>${name}</b><span>${sub}</span></div>`).join('');
let routeTimer=null;
$('#flowPlay').addEventListener('click',()=>{
  if(routeTimer){clearInterval(routeTimer);routeTimer=null;$('#flowPlay').textContent='播放整条血流路径　→';$('#circuitMessage').textContent='已停止路径播放，可按当前周期继续观察。';$$('.circuit-node').forEach(n=>n.classList.remove('active'));return;}
  let i=0;const nodes=$$('.circuit-node');$('#flowPlay').textContent='停止路径播放　×';$('#circuitMessage').textContent='沿顺序观察：体静脉回流 → 右心 → 肺 → 左心 → 主动脉 → 组织。';
  routeTimer=setInterval(()=>{nodes.forEach(n=>n.classList.toggle('active',Number(n.dataset.circuitIndex)===i));i++;if(i>=nodes.length){clearInterval(routeTimer);routeTimer=null;$('#flowPlay').textContent='再播放一次　↻';$('#circuitMessage').textContent='路径播放完成。体循环与肺循环首尾相接、串联运行。';}},470);
});
function updateCirculation(t,p){
  let active=[];
  if(['atrial','rapid-filling','diastasis'].includes(p.id))active=[0,1,2,3,7,8,9,10];
  else if(p.id==='iso-contraction'||p.id==='iso-relaxation')active=[0,1,7,8];
  else active=[3,4,5,6,7,10,11,12,13];
  $$('.circuit-node').forEach((n,i)=>n.classList.toggle('active',active.includes(i)));
  $('#flowSyncState').textContent=`当前阶段：${p.name}。右心与左心同搏；瓣膜压差决定各自流入或射血。`;
  $('#circuitMessage').textContent=`心动周期现在处于“${p.name}”：${p.flows}。`;
}

function renderTime(t){currentTime=clamp(t,0,0.9999);$('#globalTime').value=String(Math.round(currentTime*1000));phaseTextUpdate(currentTime);}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800);}

function initPhaseStrip(){
  $('#phaseStrip').innerHTML=PHASES.map((p,i)=>`<button class="phase-chip" data-phase="${p.id}" aria-label="跳到${p.name}"><i>${String(i+1).padStart(2,'0')}</i><b>${p.name}</b></button>`).join('');
  $$('.phase-chip').forEach(btn=>btn.addEventListener('click',()=>{const p=PHASES.find(x=>x.id===btn.dataset.phase);renderTime((p.start+p.end)/2);}));
}
function initQuiz(){
  $('#quizContainer').innerHTML=QUIZ.map((item,i)=>`<section class="quiz-question" data-question="${i}"><h4><span>${String(i+1).padStart(2,'0')}</span>${item.q}</h4>${item.opts.map((o,j)=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${j}"><span>${String.fromCharCode(65+j)}. ${o}</span></label>`).join('')}<p class="quiz-explanation" hidden></p></section>`).join('');
  $('#submitQuiz').addEventListener('click',()=>{
    let answered=0,score=0;QUIZ.forEach((item,i)=>{const q=$(`[data-question="${i}"]`),sel=$(`input[name="q${i}"]:checked`,q),exp=$('.quiz-explanation',q);if(!sel){exp.hidden=true;return;}answered++;const correct=Number(sel.value)===item.a;score+=correct?1:0;q.classList.toggle('incorrect',!correct);exp.hidden=false;exp.textContent=`${correct?'正确。':'再想一想。'}${item.why}`;});
    if(answered<QUIZ.length){$('#quizResult').textContent=`已答 ${answered}/${QUIZ.length} 题。补完未答题目后可查看完整得分。`;return;}
    $('#quizResult').textContent=`得分：${score} / ${QUIZ.length}。${score===QUIZ.length?'核心机制掌握完整。':'可依据每题解析返回相应模块复习，再次提交。'}`;showToast(`测验完成：${score}/${QUIZ.length}`);
  });
  $('#resetQuiz').addEventListener('click',()=>{$$('#quizContainer input').forEach(i=>i.checked=false);$$('.quiz-question').forEach(q=>{q.classList.remove('incorrect');const e=$('.quiz-explanation',q);e.hidden=true;e.textContent='';});$('#quizResult').textContent='';});
}
function initTasks(){
  $$('[data-task]').forEach(el=>el.addEventListener('change',updateTaskProgress));
  updateTaskProgress();
  $('#exportNotes').addEventListener('click',()=>{
    const completed=$$('[data-task]:checked').map(e=>e.closest('label').querySelector('b').textContent);
    const content=`# 心脏解剖与泵血机制实训记录\n\n日期：${new Date().toLocaleDateString('zh-CN')}\n当前心动周期阶段：${phaseAt(currentTime).name}\n已完成任务：${completed.length}/4\n\n${completed.map(x=>`- [x] ${x}`).join('\n')||'尚未勾选任务'}\n\n本记录仅保存在本机下载文件中。\n`;
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type:'text/markdown;charset=utf-8'}));a.download='心脏生理学实训观察记录.md';a.click();URL.revokeObjectURL(a.href);showToast('实训记录已下载');
  });
}
function updateTaskProgress(){const done=$$('[data-task]:checked').length;$('#taskProgress').textContent=`${done} / 4`;$('#taskProgressBar').style.width=`${done/4*100}%`;}

function initSources(){
  $('#sourceList').innerHTML=SOURCES.map((s,i)=>`<div class="source-item"><div><a href="${s.url}" target="_blank" rel="noopener noreferrer">${String(i+1).padStart(2,'0')} · ${s.title}</a><span>${s.desc}</span></div><em>↗</em></div>`).join('');
  for(const [button,dialog] of [['sourcesOpen',$('#sourcesDialog')],['teacherOpen',$('#teacherDialog')]])$( '#'+button).addEventListener('click',()=>dialog.showModal());
  $$('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog').close()));
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
}
function initNavigation(){
  $$('[data-jump]').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.jump)));
  $('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,select,textarea,button')||$('dialog[open]'))return;
    if(e.code==='Space'){e.preventDefault();togglePlay();}
    if(e.key==='ArrowRight')renderTime((currentTime+.01)%1);
    if(e.key==='ArrowLeft')renderTime((currentTime+.99)%1);
    if(e.key.toLowerCase()==='r'&&activePanel==='anatomy')heartModel?.setView('reset');
  });
  document.addEventListener('click',e=>{if(window.innerWidth<=820&&!e.target.closest('#sidebar')&&!e.target.closest('#menuToggle'))$('#sidebar').classList.remove('open');});
}
function togglePlay(){
  playing=!playing;lastTick=performance.now();$('#cyclePlay').textContent=playing?'Ⅱ':'▶';$('#cyclePlay').setAttribute('aria-label',playing?'暂停心动周期':'播放心动周期');
}
$('#cyclePlay').addEventListener('click',togglePlay);
$('#globalTime').addEventListener('input',e=>{if(playing)togglePlay();renderTime(Number(e.target.value)/1000);});
let speedMenu=document.createElement('select');speedMenu.className='speed-select';speedMenu.setAttribute('aria-label','播放速度');speedMenu.innerHTML='<option value="0.22">慢放 0.22×</option><option value="0.45" selected>标准 0.45×</option><option value="1">1×</option>';$('.cycle-time').appendChild(speedMenu);speedMenu.addEventListener('change',()=>playRate=Number(speedMenu.value));
$('#sourcesOpen').addEventListener('keydown',()=>{});

makeSvgCharts();initPhaseStrip();initQuiz();initTasks();initSources();initNavigation();initModel();renderTime(currentTime);
setInterval(()=>{
  const now=performance.now();if(playing){const dt=Math.min(80,now-lastTick);currentTime=(currentTime+dt/800*playRate)%1;renderTime(currentTime);}lastTick=now;
},24);
window.heartLab={
  get state(){return {panel:activePanel,time:currentTime,phase:phaseAt(currentTime).id,playing,taskCount:$$('[data-task]:checked').length};},
  go:openPanel,setTime:renderTime,phaseAt,pressure:{leftPressure,aorticPressure,leftAtrial,rightVentricular,pulmonaryPressure,rightAtrial,volumeAt},
  get model(){return heartModel;}
};
