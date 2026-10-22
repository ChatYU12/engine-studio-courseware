// Teaching state and learner evidence are intentionally separate.
export const OPTIONAL_IDS = ['sataSSD','sataData','sataPower'];
export const INTERNAL_IDS = ['backplate','retentionBrackets','cpuFan','sysFan'];
export function initialAmounts(ids, direction='assemble', sata=false) {
  const amounts = Object.fromEntries(ids.map(id=>[id, direction==='disassemble'?1:0]));
  amounts.chassis = 1;
  amounts.panel=1;
  amounts.fans=1;
  amounts.m2Shield=1;
  for (const id of OPTIONAL_IDS) amounts[id] = direction==='disassemble'&&sata?1:0;
  amounts.backplate=1;
  amounts.retentionBrackets=direction==='assemble'?1:0;
  amounts.cpuFan=direction==='disassemble'?1:0;
  amounts.sysFan=direction==='disassemble'?1:0;
  return amounts;
}
export function mutations(step, index, direction) {
  const install=[...(step.installIds||[])].map(id=>id==='fans'?'sysFan':id), remove=[...(step.removeIds||[])].map(id=>id==='fans'?'sysFan':id);
  if(direction==='assemble') {
    if(index===4) remove.push('retentionBrackets');
    if(index===7) install.push('cpuFan');
  } else {
    if(index===10) remove.push('cpuFan');
    if(index===13) remove.push('backplate');
  }
  return {install,remove};
}
export function courseFrame(ids, steps, index, progress, direction='assemble', sata=false) {
  const a=initialAmounts(ids,direction,sata);
  const end=Math.min(Math.max(0,index),steps.length-1);
  for(let i=0;i<=end;i++) {
    const t=i===end?Math.min(1,Math.max(0,progress)):1;
    const {install,remove}=mutations(steps[i],i,direction);
    for(const id of install) a[id]=(a[id]||0)+(1-(a[id]||0))*t;
    for(const id of remove) a[id]=(a[id]||0)*(1-t);
    // Remove the cover first, insert the SSD, then refit the cover.
    if(direction==='assemble'&&i===9){
      a.ssd=Math.min(1,Math.max(0,(t-.22)/.48));
      a.m2Shield=t<.22?1-t/.22:t<.72?0:Math.min(1,(t-.72)/.28);
    }
    if(direction==='disassemble'&&i===8){
      a.m2Shield=Math.max(0,1-t/.32);
      a.ssd=t<.36?1:Math.max(0,1-(t-.36)/.64);
    }
    // The initial heatsink-release phase stays seated while the scene twists it.
    if(direction==='disassemble'&&i===11)a.cooler=t<.23?1:Math.max(0,1-(t-.23)/.77);
    if(sata&&direction==='assemble'&&i===14) for(const id of OPTIONAL_IDS)a[id]=t;
  }
  return a;
}
export function fullAmounts(ids,sata=false) {
  const a=Object.fromEntries(ids.map(id=>[id,1]));
  for(const id of OPTIONAL_IDS) a[id]=sata?1:0;
  a.backplate=1;a.retentionBrackets=0;a.cpuFan=1;a.sysFan=1;
  return a;
}
export const POWER_REQUIREMENTS=['cpu','cooler','cpuFan','ramA2','ramB2','ssd','m2Shield','motherboard','standoffs','ioShield','psu','atx','eps','frontIO','fans','sysFan','gpu','gpuPower'];
export function missingPowerRequirements(amounts) {return POWER_REQUIREMENTS.filter(id=>(amounts[id]||0)<.999);}
export function checkedAll(items,values) {return items.every(x=>values?.[typeof x==='string'?x:x.id]===true);}
export function stepChecksPassed(step,values) {return (step.checks||[]).every((_,i)=>values?.[i]===true);}
export function frontier(steps,completed) {return steps.findIndex(s=>!completed.includes(s.id))<0?steps.length:steps.findIndex(s=>!completed.includes(s.id));}
export function scoreAnswers(questions, answers) {
  const results=questions.map(q=>({id:q.id,correct:answers[q.id]===q.answer,critical:!!q.critical,answered:Number.isInteger(answers[q.id])}));
  const correct=results.filter(x=>x.correct).length;
  return {correct,total:questions.length,score:Math.round(correct/Math.max(questions.length,1)*100),criticalPassed:results.filter(x=>x.critical).every(x=>x.correct),results};
}
export function safeLoad(storage,key) {
  try {const x=JSON.parse(storage.getItem(key)||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:null;} catch {return null;}
}
