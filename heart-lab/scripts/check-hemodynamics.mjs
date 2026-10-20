import { PHASES } from '../src/content.js';
import { leftPressure, aorticPressure, leftAtrial, rightVentricular, pulmonaryPressure, rightAtrial } from '../src/pressures.js';

const phaseAt=t=>PHASES.find(p=>t>=p.start&&t<p.end)||PHASES.at(-1);
const filling=new Set(['atrial','rapid-filling','diastasis']);
const isovol=new Set(['iso-contraction','iso-relaxation']);
const eject=new Set(['rapid-ejection','reduced-ejection']);
const eps=1e-7;
const errors=[];
for(let i=0;i<=10000;i++){
  const t=i/10000,p=phaseAt(t),lv=leftPressure(t),ao=aorticPressure(t),la=leftAtrial(t);
  const rv=rightVentricular(t),pa=pulmonaryPressure(t),ra=rightAtrial(t);
  const bad=(condition,message)=>{if(condition)errors.push(`${p.id} at t=${t.toFixed(4)}: ${message}`);};
  bad(![lv,ao,la,rv,pa,ra].every(Number.isFinite),'non-finite pressure');
  if(filling.has(p.id)){
    bad(lv>la+eps,'LV pressure exceeds LA during ventricular filling');
    bad(rv>ra+eps,'RV pressure exceeds RA during ventricular filling');
  }
  if(isovol.has(p.id)){
    bad(lv<la-eps||lv>ao+eps,'LV is not between LA and aortic pressure during isovolumetric contraction/relaxation');
    bad(rv<ra-eps||rv>pa+eps,'RV is not between RA and pulmonary artery pressure during isovolumetric contraction/relaxation');
  }
  if(eject.has(p.id)){
    bad(lv<ao-eps,'LV pressure falls below aortic pressure during ejection');
    bad(rv<pa-eps,'RV pressure falls below pulmonary artery pressure during ejection');
  }
}
for(const t of [.12,.18,.43,.49]){
  const pairs=t===.12?[[leftPressure(t),leftAtrial(t)],[rightVentricular(t),rightAtrial(t)]]:
    t===.18||t===.43?[[leftPressure(t),aorticPressure(t)],[rightVentricular(t),pulmonaryPressure(t)]]:
    [[leftPressure(t),leftAtrial(t)],[rightVentricular(t),rightAtrial(t)]];
  if(pairs.some(([a,b])=>Math.abs(a-b)>.01))errors.push(`phase boundary pressure crossover mismatch at t=${t}`);
}
if(errors.length){console.error(errors.slice(0,12).join('\n'));process.exit(1);}
console.log('Hemodynamic gradients pass: 10,001 samples, six phases, four pressure-crossing boundaries.');
