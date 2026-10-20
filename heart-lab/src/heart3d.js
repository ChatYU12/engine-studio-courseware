import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const C = {
  muscle: 0xc87e81,
  paleMuscle: 0xf2b7ad,
  rightBlood: 0x3aafd0,
  leftBlood: 0xd64f5b,
  vesselBlue: 0x358eaf,
  vesselRed: 0xc94952,
  septum: 0xb57b80,
  valve: 0xffe9ca,
  electric: 0xffcc67,
  ink: 0x182a36
};

const v3 = (p) => new THREE.Vector3(p[0], p[1], p[2]);
const material = (color, extra={}) => new THREE.MeshPhysicalMaterial({color, roughness:.42, metalness:.02, clearcoat:.28, clearcoatRoughness:.45, ...extra});

export function createHeartScene(container, onPick=()=>{}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f2ec);
  scene.fog = new THREE.Fog(0xf4f2ec, 11, 19);
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 80);
  camera.position.set(0.35, 1.25, 8.8);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','可旋转的三维心脏解剖教学模型');
  renderer.domElement.tabIndex = 0;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfff8ef, 0x9aa8ad, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(-3,5,7); key.castShadow=true; scene.add(key);
  const fill = new THREE.DirectionalLight(0x9cc2ce, 1.25); fill.position.set(5,1,4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xff8b7c, 1.1); rim.position.set(0,2,-5); scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,.02,0);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.minDistance = 5.5;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI * .88;
  controls.update();

  const model = new THREE.Group(); scene.add(model);
  const components = new Map();
  const labelAnchors = new Map();
  const selectable = [];
  const worldPoint = (key) => components.get(key)?.userData.labelPoint || new THREE.Vector3();

  function register(key, title, group, labelPos) {
    group.userData.key = key;
    group.userData.title = title;
    group.userData.labelPoint = v3(labelPos);
    components.set(key, group);
    model.add(group);
    group.traverse(o=>{ if(o.isMesh){ o.userData.key=key; selectable.push(o); } });
    return group;
  }
  function addSphere(parent, key, pos, scale, mat) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1,42,30),mat);
    mesh.position.set(...pos); mesh.scale.set(...scale); mesh.castShadow=true; mesh.receiveShadow=true;
    mesh.userData.key=key; parent.add(mesh); selectable.push(mesh); return mesh;
  }
  function addTube(parent, key, pts, radius, color, opacity=1) {
    const curve = new THREE.CatmullRomCurve3(pts.map(v3));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(32,pts.length*12),radius,14,false),material(color,{roughness:.28, clearcoat:.48, transparent:opacity<1, opacity}));
    mesh.userData.key=key; mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); selectable.push(mesh);
    return {mesh,curve};
  }
  function makeChamber(key,title,pos,outerScale,innerScale,color,wallColor,labelPos) {
    const g = new THREE.Group();
    addSphere(g,key,pos,outerScale,material(wallColor,{transparent:true,opacity:.40,roughness:.32,side:THREE.DoubleSide,depthWrite:false}));
    addSphere(g,key,[pos[0],pos[1],pos[2]+outerScale[2]*.30],[innerScale[0],innerScale[1],innerScale[2]],material(color,{roughness:.32,clearcoat:.52,emissive:color,emissiveIntensity:.035}));
    for(const child of g.children) child.position.sub(v3(pos));
    g.position.set(...pos);
    return register(key,title,g,labelPos);
  }

  // A softly lit epicardial silhouette gives the open teaching view a coherent heart outline.
  const silhouette = new THREE.Shape();
  silhouette.moveTo(-.92,.76); silhouette.bezierCurveTo(-1.47,1.15,-1.70,.44,-1.17,-.26);
  silhouette.bezierCurveTo(-.84,-.71,-.36,-1.28,.27,-1.61);
  silhouette.bezierCurveTo(.44,-1.72,.60,-1.58,.78,-1.36);
  silhouette.bezierCurveTo(1.40,-.65,1.65,.28,1.22,.83);
  silhouette.bezierCurveTo(.91,1.22,.38,.91,.12,.75);
  silhouette.bezierCurveTo(-.22,1.02,-.67,1.10,-.92,.76);
  const outlineGeo = new THREE.ExtrudeGeometry(silhouette,{depth:.19,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:.13,bevelThickness:.12,curveSegments:24});
  const outline = new THREE.Mesh(outlineGeo,material(C.muscle,{transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false,roughness:.62}));
  outline.position.z=-.74; outline.castShadow=true; outline.receiveShadow=true; outline.userData.key='heart-wall'; model.add(outline); selectable.push(outline);
  register('heart-wall','心壁与心尖',new THREE.Group(),[0,-1.48,-.45]).add(outline);

  const ra = makeChamber('right-atrium','右心房',[-.65,.51,.02],[.52,.48,.45],[.36,.34,.25],C.rightBlood,0xc9787b,[-.76,.87,.30]);
  const la = makeChamber('left-atrium','左心房',[.51,.62,-.20],[.54,.42,.42],[.38,.31,.24],C.leftBlood,0xd08b88,[.65,.93,-.05]);
  const rv = makeChamber('right-ventricle','右心室',[-.30,-.43,.10],[.61,.78,.51],[.42,.61,.32],C.rightBlood,0xc9787b,[-.78,-.35,.42]);
  const lv = makeChamber('left-ventricle','左心室',[.48,-.42,-.02],[.66,.84,.57],[.45,.65,.37],C.leftBlood,0xc9787b,[.80,-.46,.36]);

  // Septa are deliberately visible in the teaching cutaway.
  const septumGroup = new THREE.Group();
  const septalPlate = new THREE.Mesh(new THREE.BoxGeometry(.12,1.27,.28),material(C.septum,{roughness:.54}));
  septalPlate.position.set(-.02,-.19,-.06); septalPlate.rotation.z=-.13; septalPlate.userData.key='interventricular-septum'; septumGroup.add(septalPlate); selectable.push(septalPlate);
  const atrialPlate = new THREE.Mesh(new THREE.BoxGeometry(.095,.56,.20),material(0xd8a0a0,{roughness:.53}));
  atrialPlate.position.set(-.05,.57,-.1); atrialPlate.rotation.z=-.10; atrialPlate.userData.key='interatrial-septum'; septumGroup.add(atrialPlate); selectable.push(atrialPlate);
  register('septa','房间隔与室间隔',septumGroup,[.03,-.12,.28]);

  const vessels = new Map();
  const svc = addTube(model,'svc',[[-.64,1.91,.0],[-.65,1.38,.02],[-.65,.91,.05]],.19,C.vesselBlue);
  const ivc = addTube(model,'ivc',[[-.66,-1.98,-.05],[-.64,-1.36,-.02],[-.65,-.20,.05]],.18,C.vesselBlue);
  const pt = addTube(model,'pulmonary-trunk',[[-.34,-.05,.36],[-.40,.40,.58],[-.37,.92,.58],[-.55,1.20,.48]],.20,C.vesselBlue);
  const rpa = addTube(model,'pulmonary-arteries',[[-.54,1.14,.48],[-1.12,1.18,.22],[-1.66,1.04,-.04]],.115,C.vesselBlue);
  const lpa = addTube(model,'pulmonary-arteries',[[-.51,1.15,.46],[.10,1.20,.18],[1.05,1.06,-.02]],.115,C.vesselBlue);
  const ao = addTube(model,'aorta',[[.43,-.03,.04],[.42,.46,.06],[.46,1.03,-.05],[.42,1.43,-.28],[.05,1.60,-.36],[-.36,1.48,-.36],[-.39,.98,-.38]],.23,C.vesselRed);
  addTube(model,'aorta',[[-.03,1.54,-.35],[-.07,1.91,-.38],[-.08,2.18,-.4]],.072,C.vesselRed);
  addTube(model,'aorta',[[.20,1.57,-.36],[.23,1.91,-.38],[.25,2.12,-.4]],.072,C.vesselRed);
  addTube(model,'aorta',[[.43,1.49,-.36],[.53,1.83,-.38],[.58,2.06,-.4]],.072,C.vesselRed);
  const pv1=addTube(model,'pulmonary-veins',[[1.74,.88,-.45],[1.30,.82,-.35],[.93,.69,-.25]],.095,C.vesselRed);
  const pv2=addTube(model,'pulmonary-veins',[[1.69,.48,-.47],[1.23,.52,-.34],[.90,.59,-.26]],.095,C.vesselRed);
  const pv3=addTube(model,'pulmonary-veins',[[-1.70,.88,-.42],[-1.24,.82,-.34],[-.02,.72,-.29]],.095,C.vesselRed);
  const pv4=addTube(model,'pulmonary-veins',[[-1.63,.49,-.44],[-1.18,.54,-.32],[-.01,.62,-.28]],.095,C.vesselRed);
  [svc,ivc,pt,rpa,lpa,ao,pv1,pv2,pv3,pv4].forEach((o,i)=>vessels.set(i,o));

  // Four annuli mark valve planes; the feathered leaflet plate is toggled with the cycle state.
  const valveGroups = new Map();
  function valve(key,title,pos,color,rad=.235) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad,.034,12,56),material(C.valve,{metalness:.12,roughness:.28,emissive:0x9b684b,emissiveIntensity:.08}));
    ring.rotation.x=Math.PI/2; ring.userData.key=key; g.add(ring); selectable.push(ring);
    const leaflets = new THREE.Group();
    for(let i=0;i<3;i++){
      const angle=i*Math.PI*2/3;
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(rad*.31,20,16),material(0xffe6cf,{roughness:.30,transparent:true,opacity:.9}));
      leaf.scale.set(.72,.12,1.15); leaf.position.set(Math.cos(angle)*rad*.40,0,Math.sin(angle)*rad*.40); leaf.userData.key=key; leaflets.add(leaf); selectable.push(leaf);
    }
    leaflets.userData.key=key; g.add(leaflets); g.position.set(...pos); g.userData.open=false; g.userData.leaflets=leaflets;
    valveGroups.set(key,g); register(key,title,g,[pos[0],pos[1]+.22,pos[2]+.16]); return g;
  }
  const tv=valve('tricuspid-valve','三尖瓣',[-.52,.04,.52],C.rightBlood,.23);
  const mv=valve('mitral-valve','二尖瓣',[.50,.04,.51],C.leftBlood,.25);
  const pv=valve('pulmonary-valve','肺动脉瓣',[-.37,.47,.78],C.rightBlood,.19);
  const av=valve('aortic-valve','主动脉瓣',[.40,.48,.40],C.leftBlood,.19);

  const supportGroup=new THREE.Group(); model.add(supportGroup);
  function supportLine(key,pts,r=.012){return addTube(supportGroup,key,pts,r,0xf4dfcb,.96);}
  supportLine('chordae-tendineae',[[-.69,.03,.69],[-.62,-.20,.72],[-.49,-.48,.66]],.012);
  supportLine('chordae-tendineae',[[-.45,.02,.72],[-.40,-.19,.72],[-.49,-.48,.66]],.012);
  supportLine('chordae-tendineae',[[.32,.02,.72],[.40,-.22,.70],[.45,-.49,.62]],.012);
  supportLine('chordae-tendineae',[[.66,.03,.67],[.56,-.23,.68],[.45,-.49,.62]],.012);
  const papillaryMat=material(0xe8aca4,{roughness:.48});
  for(const [key,p] of [['right-papillary-muscle',[-.49,-.53,.62]],['left-papillary-muscle',[.45,-.55,.58]]]){
    const pm=new THREE.Mesh(new THREE.ConeGeometry(.09,.25,18),papillaryMat);pm.position.set(...p);pm.userData.key=key;supportGroup.add(pm);selectable.push(pm);
  }
  supportGroup.visible=false;

  const coronaryGroup=new THREE.Group(); model.add(coronaryGroup);
  function coronary(key,title,pts,r,labelPos){
    const g=new THREE.Group();const x=addTube(g,key,pts,r,0xc54b45,.98);g.userData.key=key;g.userData.title=title;g.userData.labelPoint=v3(labelPos);coronaryGroup.add(g);components.set(key,g);return x;
  }
  coronary('right-coronary-artery','右冠状动脉',[[.26,.42,.69],[.03,.34,.77],[-.30,.22,.78],[-.70,.15,.68],[-.96,-.02,.43]],.035,[ -.58,.22,.82]);
  coronary('anterior-interventricular-artery','前室间支（左前降支）',[[.25,.46,.68],[.12,.14,.78],[.05,-.28,.76],[.12,-.72,.66],[.34,-1.20,.42]],.042,[.10,-.37,.84]);
  coronary('circumflex-artery','旋支',[[.25,.45,.68],[.60,.34,.61],[.93,.18,.40],[1.10,.06,.10]],.032,[.82,.22,.63]);
  coronary('coronary-sinus','冠状窦（后面观）',[[1.10,.05,-.56],[.70,.10,-.61],[.25,.05,-.62],[-.15,-.02,-.60],[-.62,-.08,-.49]],.055,[-.02,.16,-.64]);
  coronaryGroup.visible=false;

  // Conduction paths are schematic traces on the anterior surface, not separate gross-anatomy cords.
  const electricGroup=new THREE.Group(); model.add(electricGroup);
  const traces=[];
  const trace=(pts,r=.025)=>{const x=addTube(electricGroup,'conduction-system',pts,r,C.electric,.98); traces.push(x.curve); return x;};
  trace([[-.70,.92,.43],[-.54,.80,.54],[-.20,.73,.56],[.19,.74,.52],[.51,.83,.40]],.026);
  trace([[-.62,.68,.59],[-.43,.45,.63],[-.18,.30,.69]],.029);
  trace([[-.18,.30,.69],[-.07,.19,.72],[-.06,-.09,.69],[-.13,-.48,.63],[-.23,-.90,.50]],.034);
  trace([[-.12,-.36,.65],[.16,-.55,.57],[.42,-.81,.48],[.57,-1.10,.32]],.028);
  trace([[-.14,-.48,.62],[-.48,-.61,.53],[-.62,-.92,.39],[-.57,-1.12,.25]],.025);
  trace([[.22,-.70,.54],[.06,-.93,.48],[-.08,-1.18,.33]],.020);
  const node=(key,p,r)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,26,18),new THREE.MeshPhysicalMaterial({color:C.electric,emissive:C.electric,emissiveIntensity:1.7,roughness:.22}));m.position.set(...p);m.userData.key='conduction-system';electricGroup.add(m);selectable.push(m);};
  node('conduction-system',[-.70,.92,.43],.09); node('conduction-system',[-.18,.30,.69],.075);
  const spark=new THREE.Mesh(new THREE.SphereGeometry(.075,24,18),new THREE.MeshBasicMaterial({color:0xfff1ad})); electricGroup.add(spark);
  electricGroup.visible=false;

  const flowGroup=new THREE.Group(); model.add(flowGroup);
  const flowCurves=[
    new THREE.CatmullRomCurve3([v3([-.67,.82,.54]),v3([-.54,.42,.70]),v3([-.35,-.03,.72]),v3([-.32,-.48,.60]),v3([-.37,.40,.75]),v3([-.43,.86,.63])]),
    new THREE.CatmullRomCurve3([v3([-.36,.72,.60]),v3([-.18,.40,.71]),v3([-.18,.03,.79]),v3([-.08,.40,.82]),v3([-.12,.91,.63])]),
    new THREE.CatmullRomCurve3([v3([-.16,-.32,.68]),v3([-.10,.18,.82]),v3([-.38,.78,.78]),v3([-.94,1.03,.28]),v3([-1.47,1.00,-.09]),v3([-.45,1.13,.37]),v3([.48,.78,.25]),v3([.34,.34,.63]),v3([.47,-.20,.65]),v3([.48,-.68,.50]),v3([.45,1.05,-.20])])
  ];
  const flowParticles=[];
  for(let j=0;j<3;j++) for(let i=0;i<8;i++){
    const m=new THREE.Mesh(new THREE.SphereGeometry(j===2?.055:.047,14,12),material(j===1?C.leftBlood:C.rightBlood,{emissive:j===1?C.leftBlood:C.rightBlood,emissiveIntensity:.28,roughness:.24}));
    flowGroup.add(m); flowParticles.push({mesh:m,curve:flowCurves[j],phase:i/8+j*.17});
  }
  flowGroup.visible=false;

  // Selection under a click opens a precise teaching note instead of relying on hover alone.
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  renderer.domElement.addEventListener('pointerdown',e=>{renderer.domElement._downX=e.clientX;renderer.domElement._downY=e.clientY;});
  renderer.domElement.addEventListener('click',e=>{
    if(Math.hypot(e.clientX-(renderer.domElement._downX||e.clientX),e.clientY-(renderer.domElement._downY||e.clientY))>6)return;
    const r=renderer.domElement.getBoundingClientRect(); pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1); raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(selectable.filter(o=>o.visible),false)[0]; if(hit?.object?.userData?.key) onPick(hit.object.userData.key);
  });

  const labelsRoot=document.createElement('div'); labelsRoot.className='anatomy-labels'; container.appendChild(labelsRoot);
  const labelDefs=[
    ['svc','上腔静脉',[-.72,1.76,.10]],['aorta','主动脉弓',[.28,1.77,-.28]],['pulmonary-trunk','肺动脉干',[-.58,1.30,.60]],
    ['right-atrium','右心房',[-.82,.60,.52]],['left-atrium','左心房',[.68,.75,.22]],['right-ventricle','右心室',[-.78,-.35,.54]],['left-ventricle','左心室',[.83,-.42,.42]],
    ['mitral-valve','二尖瓣',[.64,.04,.74]],['tricuspid-valve','三尖瓣',[-.76,.02,.77]],['conduction-system','传导系统',[-.18,-.05,.82]],
    ['anterior-interventricular-artery','前室间支',[.11,-.36,.83]],['right-coronary-artery','右冠状动脉',[-.55,.20,.85]],['coronary-sinus','冠状窦（后）',[.12,.14,-.66]],['chordae-tendineae','腱索/乳头肌',[.55,-.38,.78]]
  ];
  const labelEls=new Map();
  for(const [key,text,pos] of labelDefs){const el=document.createElement('span');el.className='anatomy-label';el.textContent=text;el.dataset.key=key;labelsRoot.appendChild(el);labelEls.set(key,{el,p:v3(pos)});}
  labelEls.get('conduction-system').el.style.display='none';
  for(const key of ['anterior-interventricular-artery','right-coronary-artery','coronary-sinus'])labelEls.get(key).el.style.display='none';
  labelEls.get('chordae-tendineae').el.style.display='none';

  const clock=new THREE.Clock();
  let beat=0, labelsOn=true, resizeObserver;
  function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);resize();
  function animate(){requestAnimationFrame(animate);clock.getDelta();controls.update();
    flowParticles.forEach(p=>{const u=(beat*2.1+p.phase)%1;p.mesh.position.copy(p.curve.getPointAt(u));});
    if(beat<.05) spark.position.copy(traces[1].getPointAt(Math.min(1,beat/.05)));
    else if(beat<.15) spark.position.copy(traces[1].getPointAt(1)); // Physiological AV nodal delay.
    else if(beat<.21) spark.position.copy(traces[2].getPointAt((beat-.15)/.06));
    else if(beat<.29) spark.position.copy(traces[3].getPointAt((beat-.21)/.08));
    else spark.visible=false;
    spark.visible=beat<.30;
    const systole=beat>.12&&beat<.43?Math.sin(Math.PI*(beat-.12)/.31):0;
    lv.scale.set(1-.014*systole,1-.025*systole,1-.02*systole); rv.scale.set(1-.016*systole,1-.024*systole,1-.02*systole);
    const atrial=beat<.12?Math.max(0,Math.sin(Math.PI*beat/.12)):0;
    ra.scale.set(1-.018*atrial,1-.022*atrial,1-.016*atrial); la.scale.set(1-.018*atrial,1-.022*atrial,1-.016*atrial);
    if(labelsOn){for(const [key,{el,p}] of labelEls){const q=p.clone().project(camera);const x=(q.x*.5+.5)*container.clientWidth, y=(-q.y*.5+.5)*container.clientHeight;el.style.transform=`translate(${x}px,${y}px)`;el.style.opacity=q.z>1?'0':'1';if(key==='coronary-sinus')el.style.display=coronaryGroup.visible&&camera.position.z<-.1?'':'none';}}
    renderer.render(scene,camera);
  }
  animate();

  function setValve(key,open){const g=valveGroups.get(key);if(!g)return;g.userData.open=!!open;g.userData.leaflets.visible=!open;g.children[0].material.color.set(open?0x9ad6d8:0xffe9ca);}
  function updateBeat(t){beat=((t%1)+1)%1;
    const fill=(beat<.12 || beat>.49);
    const atrial=beat<.12;
    const eject=beat>.18&&beat<.43;
    setValve('tricuspid-valve',fill||atrial);setValve('mitral-valve',fill||atrial);
    setValve('pulmonary-valve',eject);setValve('aortic-valve',eject);
  }
  function setLayer(which,on){if(which==='conduction'){electricGroup.visible=!!on;labelEls.get('conduction-system').el.style.display=on?'':'none';}if(which==='flow')flowGroup.visible=!!on;if(which==='labels'){labelsOn=!!on;labelsRoot.style.display=on?'':'none';}if(which==='septa')components.get('septa').visible=!!on;if(which==='heart-wall')components.get('heart-wall').visible=!!on;if(which==='supports'){supportGroup.visible=!!on;labelEls.get('chordae-tendineae').el.style.display=on?'':'none';}if(which==='coronary'){coronaryGroup.visible=!!on;for(const key of ['anterior-interventricular-artery','right-coronary-artery','coronary-sinus'])labelEls.get(key).el.style.display=on?'':'none';}}
  function setView(view){const v={front:[.25,1.2,8.8],posterior:[-.25,1.15,-8.8],left:[-8,1.0,.1],right:[8,1.0,.1],reset:[.35,1.25,8.8]}[view]||[.35,1.25,8.8];camera.position.set(...v);camera.up.set(0,1,0);controls.target.set(0,.02,0);controls.update();}
  function focus(key){const g=components.get(key);if(!g)return;const p=g.userData.labelPoint||g.position;controls.target.lerp(p,.78);controls.update();onPick(key);}
  function dispose(){resizeObserver?.disconnect();controls.dispose();renderer.dispose();container.innerHTML='';}
  return {scene,camera,renderer,controls,components,updateBeat,setLayer,setView,focus,dispose,get beat(){return beat;}};
}
