import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

// Dimensions are proportional teaching geometry (1 unit ≈ 100 mm), not a CAD model.
// +X is the case front, +Y is up, +Z is the accessible component side.
const IDS = ['chassis', 'panel', 'standoffs', 'ioShield', 'motherboard', 'cpu', 'cooler', 'ramA2', 'ramB2', 'ssd', 'm2Shield', 'psu', 'atx', 'eps', 'frontIO', 'fans', 'sataSSD', 'sataData', 'sataPower', 'gpu', 'gpuPower'];
const NAMES = { chassis: 'ATX 中塔机箱', panel: '透明侧板', standoffs: 'ATX 支柱', ioShield: '后 I/O 挡板', motherboard: 'B550-A PRO 主板', cpu: 'Ryzen 5 5600 · AM4', cooler: 'Wraith Stealth / CPU_FAN1', ramA2: 'DDR4 · DIMMA2', ramB2: 'DDR4 · DIMMB2', ssd: 'M2_1 · NVMe 2280', m2Shield: 'M.2 散热片', psu: 'CX650M · ATX 电源', atx: 'ATX_PWR1 · 24-pin', eps: 'CPU_PWR1 · EPS 4+4', frontIO: '机箱 USB / AUDIO / JFP1', fans: '机箱风扇 · SYS_FAN', sataSSD: '可选 SATA SSD', sataData: 'SATA 数据线', sataPower: 'SATA 电源线', gpu: 'RTX 3060 · PCI_E1', gpuPower: 'PCIe 6+2 · 显卡供电' };
const CHILDREN = ['cpu', 'cooler', 'ramA2', 'ramB2', 'ssd', 'm2Shield'];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = n => THREE.MathUtils.clamp(Number(n) || 0, 0, 1);
const smooth = n => n * n * (3 - 2 * n);

export function createPCScene(container, { onSelect = () => {} } = {}) {
  if (!container) throw new Error('3D 场景缺少容器');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  renderer.domElement.setAttribute('aria-label', '可旋转、缩放并选择部件的电脑主机三维模型');
  renderer.domElement.setAttribute('role', 'img');
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#10191f');
  scene.fog = new THREE.Fog('#10191f', 16, 35);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.03, 100);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2.0;
  controls.maxDistance = 19;
  controls.maxPolarAngle = Math.PI * 0.89;
  controls.target.set(0, 0.05, 0.25);
  const hemisphere = new THREE.HemisphereLight('#dcefff', '#24343b', 2.1);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight('#fff3dd', 4.0);
  key.position.set(2.5, 7, 8); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 25 });
  key.shadow.bias = -0.0005; key.shadow.normalBias = 0.015;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#9bc7e3', 2.1); rim.position.set(-5, 4, -3); scene.add(rim);
  const frontFill = new THREE.DirectionalLight('#b9d3e0', 1.4); frontFill.position.set(6, -0.5, 3); scene.add(frontFill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: '#122027', roughness: 0.9, metalness: 0.08 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.36; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(18, 36, '#29404b', '#1c3039'); grid.position.y = -2.35; grid.material.transparent = true; grid.material.opacity = 0.3; scene.add(grid);
  const system = new THREE.Group(); scene.add(system);
  const palette = {
    frame: { color: '#49565e', metalness: 0.65, roughness: 0.37 },
    dark: { color: '#182229', metalness: 0.34, roughness: 0.42 },
    black: { color: '#10171b', metalness: 0.2, roughness: 0.55 },
    silver: { color: '#c0cbd0', metalness: 0.78, roughness: 0.28 },
    aluminium: { color: '#8c9ca4', metalness: 0.69, roughness: 0.33 },
    pcb: { color: '#173f35', metalness: 0.2, roughness: 0.64 },
    gpuPCB: { color: '#253438', metalness: 0.18, roughness: 0.65 },
    gold: { color: '#cbb279', metalness: 0.68, roughness: 0.33 },
    socket: { color: '#d4d2c2', metalness: 0.1, roughness: 0.7 },
    amber: { color: '#d6a34a', metalness: 0.35, roughness: 0.4 },
    white: { color: '#c5d0ce', metalness: 0.1, roughness: 0.6 },
    rubber: { color: '#090d0f', metalness: 0.0, roughness: 0.93 },
    wire: { color: '#222c31', metalness: 0.08, roughness: 0.65 },
    redWire: { color: '#8d493c', metalness: 0.05, roughness: 0.65 },
    glass: { color: '#8aaeba', transparent: true, opacity: 0.075, metalness: 0.1, roughness: 0.2, depthWrite: false, side: THREE.DoubleSide },
  };
  const parts = new Map();
  const pickables = [];
  const labelsLayer = document.createElement('div');
  labelsLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:3';
  container.appendChild(labelsLayer);
  let state = { amounts: { ...Object.fromEntries(IDS.map(id => [id, 1])), backplate: 1, retentionBrackets: 0, cpuFan: 1, sysFan: 1 }, explosion: 0, selected: null, isolated: null, labels: true, mode: 'observe', phase: null };
  let dead = false, frameId, lastTime = performance.now(), frameCount = 0, fps = 0, fpsAt = lastTime;
  const views = { iso: [6.3, 4.0, 7.6], side: [0.2, 0.5, 11.6], rear: [-8.5, 3.5, 6.0], top: [0.25, 11.6, 1.5] };
  const staging = {
    chassis: [0, 0, 0], panel: [0, 0, 3.5], standoffs: [0.25, 0, 1.8], ioShield: [-1.15, 0, 1.2],
    motherboard: [0.3, -1.5, 3.9], cpu: [0, 0, 1.25], cooler: [0, 0, 1.65], ramA2: [0, 0, 1.2], ramB2: [0.15, 0, 1.5], ssd: [0, 0, 1], m2Shield: [0, 0.1, 0.8],
    psu: [-0.7, 0, 2.7], atx: [0, 0, 1.0], eps: [0, 0, 1.0], frontIO: [0, 0, 1.2], fans: [0, 0, 1.9], sataSSD: [0.5, 0.2, 2.0], sataData: [0, 0, 1], sataPower: [0, 0, 1], gpu: [0, 0.3, 2.9], gpuPower: [0, 0, 1.2],
  };
  const explode = {
    chassis: [0, 0, 0], panel: [0, 0, 3.3], standoffs: [0, 0, 0.3], ioShield: [-0.9, 0, 0], motherboard: [0, 0, 0.9],
    cpu: [0, 0.15, 0.85], cooler: [0, 0.1, 1.8], ramA2: [0.15, 0.2, 1.25], ramB2: [0.35, 0.2, 1.65], ssd: [0.1, 0, 0.7], m2Shield: [0.1, 0, 1.3],
    psu: [-0.65, -0.05, 1.55], atx: [0, 0, 0.8], eps: [0, 0, 0.8], frontIO: [0, -0.15, 0.6], fans: [0.55, 0, 0.25], sataSSD: [0.4, -0.1, 1.3], sataData: [0, 0, 0.75], sataPower: [0, 0, 0.75], gpu: [0.1, -0.2, 2.05], gpuPower: [0.1, 0, 1.4],
  };

  function part(id, parent = system) {
    const root = new THREE.Group(), content = new THREE.Group(); root.name = id; root.add(content); parent.add(root);
    const label = document.createElement('span'); label.textContent = NAMES[id];
    label.style.cssText = 'position:absolute;left:0;top:0;white-space:nowrap;padding:5px 8px;border:1px solid #60778370;border-left:2px solid #cba35f;border-radius:4px;background:#111c26e8;color:#e1e8eb;font:500 11px/1.3 system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 3px 14px #0004;display:none';
    labelsLayer.appendChild(label);
    const p = { id, root, content, materials: new Map(), base: V(), stage: V(...staging[id]), explode: V(...explode[id]), anchor: V(), label, shown: true };
    parts.set(id, p); return p;
  }
  function mat(p, key) {
    if (!p.materials.has(key)) p.materials.set(key, new THREE.MeshStandardMaterial(palette[key] || palette.dark));
    return p.materials.get(key);
  }
  function mesh(p, geometry, material = 'dark', parent = p.content, position = [0, 0, 0]) {
    const m = new THREE.Mesh(geometry, typeof material === 'string' ? mat(p, material) : material);
    m.position.set(...position); m.castShadow = material !== 'glass'; m.receiveShadow = true; m.userData.partId = p.id;
    parent.add(m); if (material !== 'glass') pickables.push(m); return m;
  }
  function box(p, size, pos, material = 'dark', parent = p.content) { return mesh(p, new THREE.BoxGeometry(...size), material, parent, pos); }
  function cyl(p, radius, height, pos, material = 'silver', parent = p.content, segments = 20) {
    const m = mesh(p, new THREE.CylinderGeometry(radius, radius, height, segments), material, parent, pos); m.rotation.x = Math.PI / 2; return m;
  }
  function instancedBoxes(p, size, positions, material = 'dark', parent = p.content) {
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), mat(p, material), positions.length); m.castShadow = true; m.receiveShadow = true;
    const transform = new THREE.Object3D(); positions.forEach((pos, i) => { transform.position.set(...pos); transform.updateMatrix(); m.setMatrixAt(i, transform.matrix); });
    m.userData.partId = p.id; parent.add(m); pickables.push(m); return m;
  }
  function screws(p, positions, radius = 0.032, parent = p.content) {
    const m = new THREE.InstancedMesh(new THREE.CylinderGeometry(radius, radius, 0.022, 12), mat(p, 'silver'), positions.length);
    const transform = new THREE.Object3D(); transform.rotation.x = Math.PI / 2;
    positions.forEach((pos, i) => { transform.position.set(...pos); transform.updateMatrix(); m.setMatrixAt(i, transform.matrix); });
    m.userData.partId = p.id; parent.add(m); pickables.push(m);
    instancedBoxes(p, [radius * 1.25, radius * 0.2, 0.006], positions.map(v => [v[0], v[1], v[2] + 0.014]), 'black', parent);
  }
  function text(p, value, width, pos, color = '#d5e1dc', parent = p.content, rotation = null) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 768, 128); ctx.fillStyle = color; ctx.font = '600 70px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(value, 384, 67);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const m = mesh(p, new THREE.PlaneGeometry(width, width / 6), material, parent, pos); m.castShadow = false;
    if (rotation) m.rotation.set(...rotation); return m;
  }
  function wire(p, points, radius = 0.018, material = 'wire', parent = p.content) {
    const curve = new THREE.CatmullRomCurve3(points.map(a => V(...a)), false, 'centripetal');
    return mesh(p, new THREE.TubeGeometry(curve, 36, radius, 7, false), material, parent);
  }
  function connector(p, size, pos, rows = 2, count = 4, parent = p.content, material = 'black') {
    const m = box(p, size, pos, material, parent);
    const holes = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < count; c++) holes.push([pos[0] + (c - (count - 1) / 2) * size[0] / count, pos[1] + (r - (rows - 1) / 2) * size[1] / rows, pos[2] + size[2] / 2 + 0.002]);
    instancedBoxes(p, [size[0] / count * 0.52, size[1] / rows * 0.52, 0.006], holes, 'gold', parent); return m;
  }
  function fan(p, radius, position, rotation = [0, 0, 0], parent = p.content, frame = true) {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.set(...rotation); parent.add(group);
    if (frame) {
      const ring = mesh(p, new THREE.TorusGeometry(radius * 0.99, radius * 0.055, 8, 48), 'dark', group); ring.position.z = 0.015;
      const corners = [-1, 1].flatMap(x => [-1, 1].map(y => [x * radius * 0.89, y * radius * 0.89, 0]));
      corners.forEach(pos => box(p, [radius * 0.25, radius * 0.25, 0.13], pos, 'black', group));
      screws(p, corners.map(pos => [pos[0], pos[1], 0.08]), radius * 0.055, group);
    }
    const blades = new THREE.Group(); group.add(blades);
    const blade = new THREE.Shape(); blade.moveTo(radius * 0.14, -radius * 0.05); blade.bezierCurveTo(radius * 0.42, -radius * 0.08, radius * 0.84, radius * 0.03, radius * 0.92, radius * 0.35); blade.bezierCurveTo(radius * 0.55, radius * 0.52, radius * 0.2, radius * 0.24, radius * 0.14, -radius * 0.05);
    const geo = new THREE.ExtrudeGeometry(blade, { depth: 0.035, bevelEnabled: false, curveSegments: 7 });
    for (let i = 0; i < 9; i++) { const b = mesh(p, geo, 'frame', blades); b.rotation.z = i / 9 * Math.PI * 2; }
    cyl(p, radius * 0.22, 0.095, [0, 0, 0.045], 'black', group, 32);
    cyl(p, radius * 0.13, 0.006, [0, 0, 0.096], 'silver', group, 24);
    return group;
  }

  // Open-frame ATX case: actual 4000D-inspired proportions without claiming CAD fidelity.
  const chassis = part('chassis');
  box(chassis, [4.08, 0.12, 2.15], [0, -2.12, 0], 'frame');
  box(chassis, [4.08, 0.1, 2.15], [0, 2.12, 0], 'frame');
  box(chassis, [3.94, 4.12, 0.065], [0, 0, -1.025], 'dark');
  for (const x of [-1.99, 1.99]) for (const z of [-1.01, 1.01]) box(chassis, [0.11, 4.25, 0.1], [x, 0, z], 'frame');
  for (const y of [-2.04, 2.04]) for (const z of [-1.01, 1.01]) box(chassis, [4.0, 0.09, 0.08], [0, y, z], 'frame');
  // Rear structure surrounds, rather than covers, the I/O opening and slot area.
  box(chassis, [0.065, 0.66, 2.02], [-1.995, 1.73, 0], 'dark');
  box(chassis, [0.065, 0.87, 2.02], [-1.995, -1.65, 0], 'dark');
  box(chassis, [0.065, 2.5, 0.16], [-1.995, 0.1, 0.96], 'frame');
  box(chassis, [0.065, 2.5, 0.16], [-1.995, 0.1, -0.95], 'frame');
  // Front perforated mesh is made of actual slender metal ribs.
  instancedBoxes(chassis, [0.055, 3.88, 0.025], Array.from({ length: 26 }, (_, i) => [2.035, 0, -0.94 + i * 0.075]), 'frame');
  instancedBoxes(chassis, [0.055, 0.025, 1.88], Array.from({ length: 44 }, (_, i) => [2.04, -1.94 + i * 0.09, 0]), 'dark');
  box(chassis, [0.12, 0.16, 2.09], [2.0, 2.01, 0], 'dark');
  box(chassis, [0.12, 0.16, 2.09], [2.0, -2.01, 0], 'dark');
  box(chassis, [1.04, 0.06, 1.55], [1.42, -1.14, -0.12], 'dark');
  // The PSU bay remains cut away on the service side for training visibility.
  box(chassis, [1.85, 0.055, 0.55], [-1.0, -1.13, -0.75], 'frame');
  for (const x of [-1.47, 1.4]) for (const z of [-0.79, 0.79]) box(chassis, [0.48, 0.18, 0.3], [x, -2.28, z], 'rubber');
  instancedBoxes(chassis, [0.23, 0.025, 0.025], Array.from({ length: 20 }, (_, i) => [-0.75 + (i % 10) * 0.25, 2.183, -0.4 + Math.floor(i / 10) * 0.8]), 'black');
  const caseIO = new THREE.Group(); caseIO.position.set(1.46, 2.184, 0.5); caseIO.rotation.x = -Math.PI / 2; chassis.content.add(caseIO);
  cyl(chassis, 0.065, 0.018, [-0.21, 0, 0], 'silver', caseIO); box(chassis, [0.16, 0.055, 0.015], [0.08, 0, 0], 'black', caseIO); cyl(chassis, 0.027, 0.02, [0.3, 0, 0], 'black', caseIO);
  text(chassis, 'ATX / COMPONENT SIDE', 1.7, [0.65, -2.035, 1.062], '#a7bac3');
  chassis.anchor.set(1.7, 1.9, 0.95);
  const panel = part('panel');
  box(panel, [3.82, 3.98, 0.025], [0, 0, 1.065], 'glass');
  for (const x of [-1.92, 1.92]) box(panel, [0.045, 4.03, 0.045], [x, 0, 1.07], 'frame');
  for (const y of [-2.01, 2.01]) box(panel, [3.88, 0.045, 0.045], [0, y, 1.07], 'frame');
  screws(panel, [-1, 1].flatMap(x => [-1, 1].map(y => [x * 1.84, y * 1.9, 1.105])), 0.048); panel.anchor.set(0, 1.75, 1.1);

  const boardBase = V(-0.56, 0.25, -0.66);
  const holes = [[-1.1, 1.38], [0.1, 1.38], [1.1, 1.38], [-1.1, 0], [0.1, 0], [1.1, 0], [-1.1, -1.38], [0.1, -1.38], [1.1, -1.38]];
  const standoffs = part('standoffs'); standoffs.base.copy(boardBase);
  holes.forEach(([x, y]) => { const stand = mesh(standoffs, new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), 'gold', standoffs.content, [x, y, -0.085]); stand.rotation.x = Math.PI / 2; cyl(standoffs, 0.022, 0.06, [x, y, 0], 'silver'); }); standoffs.anchor.set(1.08, 1.38, 0);
  const ioShield = part('ioShield');
  box(ioShield, [0.025, 1.58, 0.52], [-1.965, 0.93, -0.65], 'silver');
  instancedBoxes(ioShield, [0.032, 0.095, 0.24], Array.from({ length: 5 }, (_, i) => [-1.942, 0.31 + i * 0.26, -0.65]), 'black'); ioShield.anchor.set(-1.98, 1.55, -0.3);

  const mb = part('motherboard'); mb.base.copy(boardBase); mb.anchor.set(0.86, -1.2, 0.16);
  const workbench = new THREE.Group(); workbench.position.set(-0.26, -1.45, 3.24); scene.add(workbench);
  const benchMaterial = new THREE.MeshStandardMaterial({ color: '#283b43', roughness: 0.65, metalness: 0.35 });
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 3.5), benchMaterial); benchTop.receiveShadow = true; benchTop.castShadow = true; workbench.add(benchTop);
  const esdMat = new THREE.Mesh(new THREE.BoxGeometry(2.75, 0.02, 3.34), new THREE.MeshStandardMaterial({ color: '#194951', roughness: 0.95, metalness: 0 })); esdMat.position.y = 0.105; esdMat.receiveShadow = true; workbench.add(esdMat);
  for (const x of [-1.25, 1.25]) for (const z of [-1.48, 1.48]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), benchMaterial); leg.position.set(x, -0.49, z); workbench.add(leg); }
  text(mb, 'ESD / PRE-ASSEMBLY', 1.65, [0, 0.12, 1.6], '#78a3a5', workbench, [-Math.PI / 2, 0, 0]);
  box(mb, [2.44, 3.05, 0.055], [0, 0, 0], 'pcb');
  // Board edge layers, gold mounting rings, copper traces, and genuinely located sockets.
  box(mb, [2.445, 0.012, 0.06], [0, -1.51, 0], 'gold');
  holes.forEach(([x, y]) => { cyl(mb, 0.071, 0.004, [x, y, 0.031], 'gold'); cyl(mb, 0.035, 0.009, [x, y, 0.035], 'black'); });
  const tracePositions = [];
  for (let i = 0; i < 11; i++) tracePositions.push([-0.55 + i * 0.055, -0.75, 0.032]);
  instancedBoxes(mb, [0.008, 0.88, 0.002], tracePositions, 'gold');
  instancedBoxes(mb, [0.5, 0.007, 0.002], Array.from({ length: 9 }, (_, i) => [0.25, -0.75 + i * 0.047, 0.032]), 'gold');
  const socketPos = [-0.22, 0.71, 0.095];
  box(mb, [0.62, 0.62, 0.1], socketPos, 'socket');
  const pinHoles = [];
  for (let x = 0; x < 12; x++) for (let y = 0; y < 12; y++) if (!(x > 3 && x < 8 && y > 3 && y < 8)) pinHoles.push([-0.22 + (x - 5.5) * 0.04, 0.71 + (y - 5.5) * 0.04, 0.149]);
  instancedBoxes(mb, [0.012, 0.012, 0.006], pinHoles, 'dark');
  // AM4 has a side locking lever, never an Intel-style load plate.
  const lever = new THREE.Group(); lever.position.set(0.12, 0.41, 0.14); mb.content.add(lever);
  box(mb, [0.025, 0.62, 0.023], [0, 0.28, 0], 'silver', lever); cyl(mb, 0.026, 0.04, [0, 0.6, 0], 'silver', lever);
  const triangle = new THREE.Shape(); triangle.moveTo(0, 0); triangle.lineTo(0.075, 0); triangle.lineTo(0, 0.075); triangle.closePath();
  mesh(mb, new THREE.ShapeGeometry(triangle), 'amber', mb.content, [-0.53, 0.405, 0.153]);
  text(mb, 'AM4', 0.32, [-0.24, 0.27, 0.04]);
  const backplate = new THREE.Group(); mb.root.add(backplate);
  box(mb, [0.84, 0.96, 0.035], [-0.22, 0.7, -0.06], 'dark', backplate);
  text(mb, 'AM4 BACKPLATE', 0.7, [-0.22, 0.7, -0.085], '#b8c5c6', backplate, [0, Math.PI, 0]);
  const brackets = new THREE.Group(); mb.content.add(brackets);
  for (const y of [0.27, 1.15]) { box(mb, [0.88, 0.1, 0.11], [-0.22, y, 0.12], 'black', brackets); screws(mb, [[-0.58, y, 0.19], [0.14, y, 0.19]], 0.043, brackets); }
  const vrmPositions = [];
  for (let i = 0; i < 9; i++) vrmPositions.push([-0.91, 0.4 + i * 0.11, 0.09]);
  instancedBoxes(mb, [0.16, 0.08, 0.11], vrmPositions, 'dark');
  box(mb, [0.25, 1.15, 0.22], [-1.08, 0.82, 0.19], 'aluminium');
  instancedBoxes(mb, [0.26, 0.024, 0.16], Array.from({ length: 17 }, (_, i) => [-1.08, 0.3 + i * 0.061, 0.33]), 'silver');
  box(mb, [1.0, 0.2, 0.16], [-0.4, 1.37, 0.15], 'aluminium');
  instancedBoxes(mb, [0.025, 0.21, 0.11], Array.from({ length: 15 }, (_, i) => [-0.85 + i * 0.065, 1.37, 0.26]), 'silver');
  // Four DDR4 slots, with the installed modules deliberately occupying A2/B2.
  const ramXs = [0.38, 0.59, 0.8, 1.01]; const clips = [];
  ramXs.forEach((x, i) => {
    box(mb, [0.105, 1.34, 0.13], [x, 0.68, 0.11], i % 2 ? 'aluminium' : 'black');
    box(mb, [0.035, 1.22, 0.02], [x, 0.68, 0.183], 'black');
    box(mb, [0.045, 0.04, 0.025], [x, 0.52, 0.196], 'socket');
    for (const y of [-0.035, 1.395]) { const c = box(mb, [0.13, 0.105, 0.12], [x, y, 0.14], 'socket'); clips.push({ mesh: c, slot: i, end: y > 1 ? 1 : -1, y }); }
    text(mb, ['DIMMA1', 'DIMMA2', 'DIMMB1', 'DIMMB2'][i], 0.41, [x, -0.15, 0.042], i % 2 ? '#f1c679' : '#9aafa5', mb.content, [0, 0, Math.PI / 2]);
  });
  connector(mb, [0.14, 0.76, 0.18], [1.11, -0.56, 0.13], 12, 2);
  text(mb, 'ATX_PWR1', 0.5, [0.91, -0.59, 0.04], '#e0e3ce', mb.content, [0, 0, Math.PI / 2]);
  connector(mb, [0.38, 0.16, 0.16], [-0.87, 1.39, 0.16], 2, 4); text(mb, 'CPU_PWR1', 0.52, [-0.86, 1.22, 0.05]);
  connector(mb, [0.21, 0.1, 0.11], [0.27, 1.39, 0.11], 1, 4); text(mb, 'CPU_FAN1', 0.5, [0.21, 1.48, 0.05]);
  // Board overview, MSI manual p.26: SYS_FAN1 is upper-right; SYS_FAN6 is left of M2_1.
  connector(mb, [0.135, 0.095, 0.1], [1.145, 1.275, 0.11], 1, 4);
  connector(mb, [0.18, 0.095, 0.1], [-0.69, 0.08, 0.11], 1, 4);
  text(mb, 'SYS_FAN1', 0.4, [1.02, 1.46, 0.05]); text(mb, 'SYS_FAN6', 0.48, [-0.75, 0.18, 0.05]);
  connector(mb, [0.17, 0.09, 0.08], [0.97, -1.42, 0.09], 2, 5); text(mb, 'JFP1', 0.28, [0.97, -1.26, 0.04]);
  connector(mb, [0.16, 0.085, 0.08], [-0.98, -1.4, 0.09], 2, 5); text(mb, 'JAUD1', 0.35, [-0.97, -1.22, 0.04]);
  connector(mb, [0.32, 0.11, 0.12], [0.54, -1.4, 0.11], 2, 10); text(mb, 'JUSB', 0.3, [0.54, -1.23, 0.04]);
  for (let i = 0; i < 4; i++) box(mb, [0.15, 0.12, 0.16], [1.11, -0.99 - i * 0.13, 0.12], 'black');
  text(mb, 'SATA', 0.32, [0.87, -1.02, 0.04]);
  const pcieY = -0.44;
  box(mb, [1.65, 0.11, 0.13], [-0.15, pcieY, 0.1], 'silver'); box(mb, [1.55, 0.035, 0.025], [-0.15, pcieY, 0.175], 'black');
  const gpuLatch = box(mb, [0.15, 0.19, 0.13], [0.75, pcieY, 0.13], 'socket');
  text(mb, 'PCI_E1', 0.48, [-0.65, pcieY - 0.14, 0.04]);
  box(mb, [1.65, 0.085, 0.11], [-0.15, -1.04, 0.09], 'black'); text(mb, 'PCI_E3', 0.4, [-0.66, -1.18, 0.04]);
  box(mb, [0.34, 0.08, 0.1], [-0.84, -0.76, 0.08], 'black');
  box(mb, [0.48, 0.5, 0.15], [0.59, -0.86, 0.14], 'aluminium');
  text(mb, 'B550', 0.38, [0.59, -0.86, 0.225]);
  cyl(mb, 0.14, 0.035, [-0.59, -1.22, 0.065], 'silver', mb.content, 32);
  text(mb, 'MSI  B550-A PRO', 1.25, [-0.18, -1.39, 0.045], '#c1d2c8');
  text(mb, 'M2_1', 0.38, [-0.67, 0.015, 0.04]);
  const smallCaps = [[-0.83, 0.2], [-0.98, -0.36], [-1.03, -0.6], [-1.06, -0.85], [0.14, -1.04], [0.27, -1.14], [0.93, -0.08]];
  smallCaps.forEach(([x, y]) => cyl(mb, 0.043, 0.085, [x, y, 0.09], 'silver', mb.content, 12));
  for (let i = 0; i < 5; i++) box(mb, [0.19, 0.19, 0.035], [-0.96 + i * 0.2, -0.87, 0.05], 'black');
  // Rear-I/O blocks terminate at the matching cut-out, never at the case front.
  for (let i = 0; i < 5; i++) { box(mb, [0.22, 0.23, 0.29], [-1.14, 0.1 + i * 0.28, 0.18], 'silver'); box(mb, [0.025, 0.12, 0.19], [-1.265, 0.1 + i * 0.28, 0.18], 'black'); }
  // CPU: silver heat spreader, AM4 PGA underside, corner alignment mark.
  const cpu = part('cpu', mb.root); cpu.base.set(-0.22, 0.71, 0.18); cpu.anchor.set(0, 0, 0.075);
  box(cpu, [0.405, 0.405, 0.025], [0, 0, 0], 'pcb'); box(cpu, [0.368, 0.368, 0.041], [0, 0, 0.03], 'silver');
  text(cpu, 'AMD RYZEN', 0.31, [0, 0.045, 0.053], '#3b4e55'); text(cpu, '5 5600', 0.25, [0, -0.048, 0.054], '#3b4e55');
  mesh(cpu, new THREE.ShapeGeometry(triangle), 'gold', cpu.content, [-0.195, -0.196, 0.017]);
  const pins = [];
  for (let x = 0; x < 13; x++) for (let y = 0; y < 13; y++) if (!(x > 4 && x < 8 && y > 4 && y < 8)) pins.push([(x - 6) * 0.027, (y - 6) * 0.027, -0.034]);
  instancedBoxes(cpu, [0.007, 0.007, 0.045], pins, 'gold');
  // Wraith Stealth: axial fan above radial aluminium fins, four spring screw ears.
  const cooler = part('cooler', mb.root); cooler.base.set(-0.22, 0.71, 0.24); cooler.anchor.set(0, 0, 0.65);
  cyl(cooler, 0.37, 0.055, [0, 0, 0.035], 'aluminium', cooler.content, 48);
  const fins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.018, 0.25), mat(cooler, 'silver'), 44); const finMatrix = new THREE.Object3D();
  for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2; finMatrix.position.set(Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0.17); finMatrix.rotation.z = a; finMatrix.updateMatrix(); fins.setMatrixAt(i, finMatrix.matrix); }
  fins.castShadow = true; fins.userData.partId = 'cooler'; cooler.content.add(fins); pickables.push(fins);
  cyl(cooler, 0.28, 0.25, [0, 0, 0.16], 'aluminium', cooler.content, 40);
  const coolerFan = fan(cooler, 0.44, [0, 0, 0.41], [0, 0, 0], cooler.content, false);
  mesh(cooler, new THREE.TorusGeometry(0.455, 0.047, 10, 56), 'black', cooler.content, [0, 0, 0.43]);
  text(cooler, 'AMD', 0.22, [0, 0, 0.514]);
  const coolerScrews = [[-0.36, -0.44, 0.26], [0.36, 0.44, 0.26], [0.36, -0.44, 0.26], [-0.36, 0.44, 0.26]];
  coolerScrews.forEach((pos, i) => { box(cooler, [0.16, 0.15, 0.1], [pos[0], pos[1], 0.23], 'black'); cyl(cooler, 0.041, 0.2, pos, 'silver'); text(cooler, String([1, 3, 2, 4][i]), 0.13, [pos[0], pos[1], 0.375], '#f3bd6d'); });
  const cpuFanLine = wire(cooler, [[0.39, 0.26, 0.43], [0.58, 0.34, 0.28], [0.62, 0.55, 0.07], [0.49, 0.68, -0.04]], 0.011);
  const cpuFanPlug = new THREE.Group(); cooler.content.add(cpuFanPlug);
  connector(cooler, [0.18, 0.085, 0.08], [0.49, 0.68, -0.04], 1, 4, cpuFanPlug);
  let lastCpuFan = -1;

  function memory(id, x) {
    const p = part(id, mb.root); p.base.set(x, 0.68, 0.2); p.anchor.set(0, 0.45, 0.35);
    box(p, [0.035, 1.29, 0.39], [0, 0, 0.19], 'pcb');
    box(p, [0.045, 1.19, 0.055], [0, 0, 0.015], 'gold');
    // Asymmetric DDR4 key shown as a dark interruption, not a centred DDR5 notch.
    box(p, [0.052, 0.055, 0.065], [0, -0.16, 0.015], 'black');
    const chips = [];
    for (let i = 0; i < 8; i++) for (const side of [-1, 1]) chips.push([side * 0.025, -0.52 + i * 0.147, 0.22]);
    instancedBoxes(p, [0.025, 0.11, 0.18], chips, 'black');
    box(p, [0.052, 1.22, 0.055], [0, 0, 0.395], 'dark');
    text(p, 'DDR4 8GB', 0.65, [0.042, 0, 0.24], '#d4ded7', p.content, [0, Math.PI / 2, Math.PI / 2]);
    return p;
  }
  memory('ramA2', ramXs[1]); memory('ramB2', ramXs[3]);
  const ssd = part('ssd', mb.root); ssd.base.set(-0.05, -0.1, 0.085); ssd.anchor.set(0.25, 0, 0.045);
  box(ssd, [0.8, 0.22, 0.018], [0, 0, 0], 'pcb'); box(ssd, [0.08, 0.2, 0.02], [0.365, 0, 0.003], 'gold');
  box(ssd, [0.15, 0.15, 0.025], [0.21, 0, 0.024], 'black'); box(ssd, [0.44, 0.16, 0.026], [-0.105, 0, 0.026], 'black');
  text(ssd, 'NVMe 2280', 0.46, [-0.08, 0, 0.044]); screws(ssd, [[-0.365, 0, 0.022]], 0.021);
  box(mb, [0.08, 0.25, 0.065], [0.385, -0.1, 0.06], 'black');
  const m2 = part('m2Shield', mb.root); m2.base.set(-0.04, -0.1, 0.15); m2.anchor.set(0.32, 0, 0.07);
  box(m2, [0.98, 0.27, 0.065], [0, 0, 0], 'aluminium');
  instancedBoxes(m2, [0.79, 0.008, 0.014], Array.from({ length: 5 }, (_, i) => [0, -0.09 + i * 0.045, 0.04]), 'dark');
  screws(m2, [[-0.43, 0, 0.05], [0.43, 0, 0.05]], 0.024); text(m2, 'M.2 SHIELD', 0.54, [0, 0, 0.052]);

  // Closed PSU module: only exterior grille, label and modular connectors are shown.
  const psu = part('psu'); psu.base.set(-1.12, -1.69, -0.05); psu.anchor.set(0.2, 0, 0.83);
  box(psu, [1.5, 0.82, 1.5], [0, 0, 0], 'black');
  const grilleFan = fan(psu, 0.56, [0, -0.445, 0], [Math.PI / 2, 0, 0], psu.content, false);
  for (let i = 1; i <= 7; i++) { const ring = mesh(psu, new THREE.TorusGeometry(0.07 + i * 0.065, 0.012, 5, 44), 'frame', psu.content, [0, -0.467, 0]); ring.rotation.x = Math.PI / 2; }
  box(psu, [1.22, 0.56, 0.01], [0, 0.03, 0.756], 'dark'); text(psu, 'CORSAIR', 0.91, [0, 0.16, 0.77]); text(psu, 'CX650M', 0.87, [0, -0.02, 0.771], '#dfb66b'); text(psu, '650 W  /  SEMI-MODULAR', 1.03, [0, -0.21, 0.771], '#9baeb8');
  box(psu, [0.035, 0.28, 0.45], [-0.765, -0.02, 0.25], 'dark'); box(psu, [0.045, 0.16, 0.22], [-0.79, 0.2, -0.4], 'black');
  instancedBoxes(psu, [0.03, 0.025, 0.07], Array.from({ length: 48 }, (_, i) => [-0.77, -0.31 + Math.floor(i / 8) * 0.12, -0.57 + (i % 8) * 0.145]), 'frame');
  for (let i = 0; i < 3; i++) box(psu, [0.025, 0.18, 0.3], [0.765, -0.22 + i * 0.23, 0.3], 'dark');

  // Discrete power harnesses preserve EPS / PCIe endpoint distinction.
  const atx = part('atx'); atx.anchor.set(0.58, -0.3, -0.1);
  for (let i = 0; i < 7; i++) wire(atx, [[-0.37, -1.61 + i * 0.018, 0.3], [0.18, -1.34, 0.48 + i * 0.026], [0.91, -0.69, 0.13 + i * 0.024], [0.62, -0.31 + i * 0.04, -0.2]], 0.018);
  connector(atx, [0.16, 0.75, 0.2], [0.55, -0.31, -0.34], 12, 2); box(atx, [0.06, 0.17, 0.09], [0.67, -0.31, -0.33], 'socket');
  text(atx, '24-PIN', 0.45, [0.67, -0.25, -0.05], '#d2b57b', atx.content, [0, 0, Math.PI / 2]);
  const eps = part('eps'); eps.anchor.set(-1.4, 1.71, -0.15);
  for (let i = 0; i < 4; i++) wire(eps, [[-0.4, -1.7, -0.54 + i * 0.04], [-0.6, -1.05, -0.88 + i * 0.02], [-1.52, 1.9, -0.77 + i * 0.025], [-1.43 + i * 0.045, 1.64, -0.25]], 0.016);
  connector(eps, [0.38, 0.16, 0.17], [-1.43, 1.64, -0.35], 2, 4); box(eps, [0.08, 0.055, 0.06], [-1.43, 1.75, -0.3], 'socket'); text(eps, 'CPU / EPS 4+4', 0.79, [-1.38, 1.85, -0.18], '#dfb66b');
  const frontIO = part('frontIO'); frontIO.anchor.set(0.38, -1.3, -0.15);
  wire(frontIO, [[1.4, 1.9, -0.76], [1.47, 0.6, -0.84], [1.2, -1.2, -0.3], [-0.02, -1.15, -0.26]], 0.035);
  wire(frontIO, [[1.5, 1.9, -0.8], [1.6, -0.3, -0.7], [1.1, -1.5, -0.25], [-1.54, -1.15, -0.39]], 0.022);
  wire(frontIO, [[1.6, 1.9, -0.8], [1.7, -1, -0.7], [0.43, -1.31, -0.28]], 0.012);
  connector(frontIO, [0.32, 0.11, 0.12], [-0.02, -1.15, -0.39], 2, 10); connector(frontIO, [0.16, 0.085, 0.09], [-1.54, -1.15, -0.4], 2, 5); connector(frontIO, [0.1, 0.07, 0.1], [0.43, -1.17, -0.41], 1, 2);
  text(frontIO, 'USB / AUDIO / PWR SW', 1.4, [0.2, -1.45, -0.05], '#d9c59f');
  const fans = part('fans'); fans.anchor.set(1.78, 0.3, 0.4);
  fan(fans, 0.56, [1.77, 0.3, 0.05], [0, Math.PI / 2, 0]);
  fan(fans, 0.55, [-1.84, 1.53, 0.17], [0, -Math.PI / 2, 0]);
  const sysFanCableGroup = new THREE.Group(); fans.content.add(sysFanCableGroup);
  const frontFanLine = wire(fans, [[1.73, -0.21, -0.4], [1.46, 0.4, -0.7], [0.9, 1.55, -0.4], [0.585, 1.525, -0.44]], 0.012, 'wire', sysFanCableGroup);
  const rearFanLine = wire(fans, [[-1.83, 1.03, -0.35], [-1.7, 0.4, -0.64], [-1.25, 0.33, -0.44]], 0.012, 'wire', sysFanCableGroup);
  const sysFanPlugs = new THREE.Group(); sysFanCableGroup.add(sysFanPlugs);
  connector(fans, [0.14, 0.095, 0.1], [0.585, 1.525, -0.44], 1, 4, sysFanPlugs);
  connector(fans, [0.18, 0.095, 0.1], [-1.25, 0.33, -0.44], 1, 4, sysFanPlugs);
  let lastSysFan = -1;
  text(fans, 'INTAKE →', 0.8, [1.84, -0.38, 0.1], '#d6be83', fans.content, [0, Math.PI / 2, 0]);
  text(fans, '← EXHAUST', 0.81, [-1.82, 2.0, 0.3], '#d6be83');
  const sata = part('sataSSD'); sata.base.set(1.3, -1.5, 0.45); sata.anchor.set(0, 0, 0.1);
  box(sata, [0.7, 1.0, 0.07], [0, 0, 0], 'dark'); box(sata, [0.61, 0.62, 0.01], [0, 0.07, 0.042], 'silver'); text(sata, 'SATA SSD', 0.52, [0, 0.15, 0.052], '#263c45'); text(sata, '2.5 INCH', 0.4, [0, -0.02, 0.053], '#263c45'); connector(sata, [0.23, 0.08, 0.05], [-0.15, -0.48, 0.05], 1, 7); connector(sata, [0.33, 0.08, 0.05], [0.16, -0.48, 0.05], 1, 8);
  const sataData = part('sataData'); sataData.anchor.set(0.8, -1.46, 0.28);
  wire(sataData, [[1.16, -1.97, 0.5], [0.87, -1.68, 0.6], [0.8, -0.95, 0.1], [0.55, -0.75, -0.43]], 0.025, 'redWire'); connector(sataData, [0.15, 0.1, 0.09], [0.55, -0.75, -0.39], 1, 7);
  const sataPower = part('sataPower'); sataPower.anchor.set(0.95, -1.8, 0.7);
  for (let i = 0; i < 4; i++) wire(sataPower, [[-0.37, -1.85 + i * 0.04, 0.3], [0.5, -2.0 + i * 0.035, 0.75], [1.46, -1.96 + i * 0.02, 0.51]], 0.013); connector(sataPower, [0.33, 0.075, 0.08], [1.46, -1.96, 0.51], 1, 8);

  // RTX 3060: perpendicular to the motherboard. PCB horizontal, both fans face down.
  const gpu = part('gpu'); gpu.base.set(-0.39, -0.12, 0.02); gpu.anchor.set(0.25, -0.14, 0.72);
  box(gpu, [2.35, 0.035, 1.15], [-0.38, 0, -0.02], 'gpuPCB');
  box(gpu, [1.45, 0.13, 0.04], [-0.35, -0.015, -0.585], 'gold');
  box(gpu, [2.22, 0.035, 1.05], [-0.38, 0.055, -0.03], 'dark');
  const gpuFinPositions = Array.from({ length: 42 }, (_, i) => [-1.42 + i * 0.051, -0.13, -0.025]);
  instancedBoxes(gpu, [0.016, 0.23, 0.96], gpuFinPositions, 'aluminium');
  box(gpu, [2.35, 0.15, 0.12], [-0.38, -0.21, 0.53], 'frame'); box(gpu, [2.35, 0.15, 0.08], [-0.38, -0.21, -0.53], 'black');
  fan(gpu, 0.45, [-0.96, -0.29, -0.03], [Math.PI / 2, 0, 0], gpu.content, false); fan(gpu, 0.45, [0.16, -0.29, -0.03], [Math.PI / 2, 0, 0], gpu.content, false);
  for (const x of [-0.96, 0.16]) { const r = mesh(gpu, new THREE.TorusGeometry(0.475, 0.055, 8, 44), 'dark', gpu.content, [x, -0.3, -0.03]); r.rotation.x = Math.PI / 2; }
  box(gpu, [0.055, 0.42, 1.12], [-1.59, -0.13, 0], 'silver');
  instancedBoxes(gpu, [0.06, 0.045, 0.13], Array.from({ length: 8 }, (_, i) => [-1.627, -0.2 + Math.floor(i / 4) * 0.15, -0.4 + i % 4 * 0.26]), 'black');
  text(gpu, 'GEFORCE RTX 3060', 1.61, [-0.38, -0.18, 0.596], '#d9e2e4');
  text(gpu, 'VENTUS 2X  /  12G', 1.35, [-0.38, 0.08, 0.12], '#b4c5cc', gpu.content, [-Math.PI / 2, 0, 0]);
  screws(gpu, [[-1.59, 0.08, 0.54], [-1.59, -0.31, 0.54]], 0.035);
  connector(gpu, [0.36, 0.17, 0.15], [0.55, 0.065, 0.42], 2, 4);
  const gpuPower = part('gpuPower'); gpuPower.anchor.set(0.21, 0.08, 0.65);
  for (let i = 0; i < 5; i++) wire(gpuPower, [[-0.36, -1.63 + i * 0.035, 0.4], [0.65, -1.18, 0.77 + i * 0.025], [0.8, -0.52, 0.84 + i * 0.02], [0.16 + i * 0.045, -0.015, 0.5]], 0.016);
  connector(gpuPower, [0.36, 0.17, 0.15], [0.16, 0.035, 0.52], 2, 4); box(gpuPower, [0.07, 0.055, 0.07], [0.16, 0.15, 0.57], 'socket'); text(gpuPower, 'PCIe 6+2', 0.73, [0.28, 0.25, 0.65], '#e1ba75');

  function amount(id) { return clamp(state.amounts[id] ?? 0); }
  function updateParts() {
    const exploded = clamp(state.explosion);
    const boardAmount = amount('motherboard');
    for (const p of parts.values()) {
      const a = amount(p.id), t = smooth(a), child = CHILDREN.includes(p.id);
      p.root.position.copy(p.base).addScaledVector(p.stage, 1 - t).addScaledVector(p.explode, exploded);
      p.root.rotation.set(0, 0, 0);
      if (p.id === 'motherboard') {
        // Pre-assembled board lies flat on the work surface; CPU / DIMM / M.2 follow it.
        p.root.rotation.x = -Math.PI / 2 * (1 - t);
      }
      if (p.id === 'ssd') {
        // M2_1 connector is toward the DIMMs (right), per MSI board overview.
        const angle = (1 - smooth(Math.min(a / 0.85, 1))) * Math.PI / 6;
        p.root.rotation.y = angle; p.root.position.x += (1 - Math.cos(angle)) * 0.4; p.root.position.z += Math.sin(angle) * 0.4;
      }
      if (p.id === 'cooler' && state.mode === 'disassemble' && state.phase?.stepId === 'D12') {
        // The first 23% is a small left/right release motion at full seating height.
        // Subsequent amount changes lift the already-released AM4 cooler straight out.
        const release = clamp(state.phase.progress) / 0.23;
        p.root.rotation.z = release < 1 ? Math.sin(release * Math.PI * 2) * 0.085 : 0;
      }
      const preview = state.selected === p.id;
      let shown = a > 0.002 || preview || p.id === 'chassis';
      if (p.id === 'motherboard') shown ||= CHILDREN.some(id => amount(id) > 0.002 || state.selected === id);
      p.shown = shown && (!state.isolated || state.isolated === p.id);
      p.content.visible = p.shown;
      const selected = state.selected === p.id;
      for (const [key, m] of p.materials) {
        m.emissive.set(selected ? '#dc8d26' : '#000000'); m.emissiveIntensity = selected ? (key === 'pcb' ? 0.045 : key === 'black' || key === 'dark' ? 0.16 : 0.1) : 0;
      }
      if (p.id === 'panel') mat(p, 'glass').opacity = selected ? 0.14 : 0.055;
    }
    // The AM4 rear plate is part of the motherboard. Only the two plastic brackets leave.
    brackets.visible = amount('retentionBrackets') > 0.002;
    brackets.position.z = (1 - amount('retentionBrackets')) * 0.6;
    backplate.visible = amount('backplate') > 0.002 && (mb.shown || state.isolated === 'cooler');
    backplate.position.z = -(1 - amount('backplate')) * 0.5 - exploded * 0.3;
    workbench.visible = boardAmount < 0.995 && !state.isolated && (mb.shown || CHILDREN.some(id => amount(id) > 0.002 || state.selected === id));
    const cpuFanAmount = amount('cpuFan');
    if (Math.abs(cpuFanAmount - lastCpuFan) > 0.001) {
      const loose = 1 - smooth(cpuFanAmount), end = [0.49 + 0.18 * loose, 0.68 - 0.2 * loose, -0.04 + 0.25 * loose];
      cpuFanLine.geometry.dispose();
      const curve = new THREE.CatmullRomCurve3([[0.39, 0.26, 0.43], [0.58, 0.34, 0.28], [0.62, 0.55 - 0.08 * loose, 0.07 + 0.15 * loose], end].map(a => V(...a)));
      cpuFanLine.geometry = new THREE.TubeGeometry(curve, 28, 0.011, 6, false);
      cpuFanPlug.position.set(0.18 * loose, -0.2 * loose, 0.25 * loose);
      lastCpuFan = cpuFanAmount;
    }
    const sysFanAmount = amount('sysFan');
    if (Math.abs(sysFanAmount - lastSysFan) > 0.001) {
      const loose = 1 - smooth(sysFanAmount), shift = V(0, -0.14 * loose, 0.24 * loose);
      const frontEnd = V(0.585, 1.525, -0.44).add(shift), rearEnd = V(-1.25, 0.33, -0.44).add(shift);
      frontFanLine.geometry.dispose(); rearFanLine.geometry.dispose();
      frontFanLine.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(1.73, -0.21, -0.4), V(1.46, 0.4, -0.7), V(0.9, 1.55 - 0.06 * loose, -0.4 + 0.12 * loose), frontEnd]), 32, 0.012, 6, false);
      rearFanLine.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1.83, 1.03, -0.35), V(-1.7, 0.4, -0.64), rearEnd]), 24, 0.012, 6, false);
      sysFanPlugs.position.copy(shift); lastSysFan = sysFanAmount;
    }
    lever.rotation.x = amount('cpu') >= 0.98 ? 0 : Math.PI * 0.45;
    clips.forEach(c => {
      const id = c.slot === 1 ? 'ramA2' : c.slot === 3 ? 'ramB2' : null;
      const open = id && state.selected === id && amount(id) < 0.94;
      c.mesh.position.y = c.y + (open ? 0.065 * c.end : 0);
      c.mesh.rotation.x = open ? 0.5 * c.end : 0;
    });
    gpuLatch.rotation.x = state.selected === 'gpu' && amount('gpu') < 0.95 ? -0.6 : 0;
    system.updateMatrixWorld(true);
  }

  const primaryLabels = new Set(['motherboard', 'cpu', 'cooler', 'ramA2', 'ramB2', 'ssd', 'psu', 'gpu']);
  const screen = new THREE.Vector3();
  function updateLabels() {
    const w = container.clientWidth, h = container.clientHeight, occupied = [];
    const candidates = [...parts.values()].sort((a, b) => Number(b.id === state.selected) - Number(a.id === state.selected));
    for (const p of candidates) {
      const show = p.shown && (state.labels && (primaryLabels.has(p.id) || clamp(state.explosion) > 0.25) || p.id === state.selected);
      if (!show) { p.label.style.display = 'none'; continue; }
      screen.copy(p.anchor); p.root.localToWorld(screen); screen.project(camera);
      const x = (screen.x * 0.5 + 0.5) * w, y = (-screen.y * 0.5 + 0.5) * h;
      const selected = p.id === state.selected, lw = Math.min(230, NAMES[p.id].length * 11 + 22), lh = 28;
      const left = Math.max(8, Math.min(w - lw - 8, x + 12)), top = Math.max(8, Math.min(h - lh - 8, y - 14));
      const outside = screen.z < -1 || screen.z > 1 || x < 0 || x > w || y < 0 || y > h;
      const collides = occupied.some(r => left < r.x + r.w + 5 && left + lw + 5 > r.x && top < r.y + r.h + 5 && top + lh + 5 > r.y);
      if (outside || collides && !selected || w < 550 && !selected && occupied.length > 2) { p.label.style.display = 'none'; continue; }
      p.label.style.display = 'block'; p.label.style.transform = `translate(${Math.round(left)}px,${Math.round(top)}px)`;
      p.label.style.borderColor = selected ? '#efb05b' : '#60778370'; p.label.style.background = selected ? '#3a2c1deb' : '#111c26e8'; p.label.style.zIndex = selected ? '2' : '1';
      occupied.push({ x: left, y: top, w: lw, h: lh });
    }
  }

  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let pointerStart = null;
  function pointerDown(e) { pointerStart = { x: e.clientX, y: e.clientY, button: e.button }; }
  function pointerUp(e) {
    if (!pointerStart || pointerStart.button !== 0 || Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 6) { pointerStart = null; return; }
    pointerStart = null;
    const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    const hit = hits.find(h => { const p = parts.get(h.object.userData.partId); return p?.shown && h.object.visible && visibleParents(h.object); });
    if (hit) onSelect(hit.object.userData.partId);
  }
  function visibleParents(obj) { for (let p = obj.parent; p; p = p.parent) if (!p.visible) return false; return true; }
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  function resize() { const w = Math.max(1, container.clientWidth), h = Math.max(1, container.clientHeight); renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function setView(name = 'iso') {
    const pos = views[name] || views.iso, expanded=state.explosion>0.1; camera.position.set(...pos).multiplyScalar(expanded?1.5:1); controls.target.set(0, 0.05, expanded?1.4:0.25); controls.update();
  }
  function tick(now) {
    if (dead) return;
    controls.update(); updateLabels(); renderer.render(scene, camera);
    frameCount++; if (now - fpsAt > 700) { fps = Math.round(frameCount * 1000 / (now - fpsAt)); frameCount = 0; fpsAt = now; }
    lastTime = now; frameId = requestAnimationFrame(tick);
  }
  updateParts(); setView('iso'); frameId = requestAnimationFrame(tick);
  return {
    setState(next = {}) {
      if (dead) return;
      state = { ...state, ...next, amounts: next.amounts ? { ...state.amounts, ...next.amounts } : state.amounts };
      state.explosion = clamp(state.explosion); if (!parts.has(state.selected)) state.selected = null; if (!parts.has(state.isolated)) state.isolated = null;
      updateParts();
    },
    setView,
    rotate(radians = 0) {
      if (dead || !Number.isFinite(radians)) return;
      const offset = camera.position.clone().sub(controls.target).applyAxisAngle(V(0, 1, 0), radians);
      camera.position.copy(controls.target).add(offset); controls.update();
    },
    resetView() { setView('iso'); },
    focusPart(id) {
      const p = parts.get(id); if (!p) return;
      system.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(p.content);
      const target = bounds.getCenter(V());
      const size = bounds.getSize(V()); const distance = Math.max(1.8, Math.min(8, Math.max(size.x, size.y, size.z) * 2.5));
      let direction = camera.position.clone().sub(controls.target).normalize();
      // CPU/memory close-ups use the board's current component-side normal.
      if (CHILDREN.includes(id) || id === 'motherboard') direction = V(0.18, 0.12, 1).applyQuaternion(mb.root.getWorldQuaternion(new THREE.Quaternion())).normalize();
      controls.target.copy(target); camera.position.copy(target).addScaledVector(direction, distance); controls.update();
    },
    capture() { renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    getStats() { return { calls: renderer.info.render.calls, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, fps, pixelRatio: renderer.getPixelRatio(), width: renderer.domElement.width, height: renderer.domElement.height, webgl: true }; },
    dispose() {
      if (dead) return; dead = true; cancelAnimationFrame(frameId); observer.disconnect(); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp);
      const geometries = new Set(), materials = new Set(), textures = new Set();
      scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); for (const m of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) { materials.add(m); if (m.map) textures.add(m.map); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove(); labelsLayer.remove();
    },
  };
}
