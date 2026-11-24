import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LAWN_PATCH } from './lawn-patch.js';

const FT = 0.3048;
// plan coordinates (u from rear bay tip toward street, v across, z up; feet) -> scene metres
const P = (u, v, z = 0) => new THREE.Vector3((54 - v) * FT, z * FT, (u - 83) * FT);
const Z2F = 12.729;

const ROOMS = [
  // main floor
  { f: 1, t: 'Gathering Room', s: '17′-4″ × 24′-5″', u: 31, v: 21.5, p: 9 },
  { f: 1, t: "Owner's Suite", s: '16′-5″ × 24′-11″', u: 13, v: 45.5, p: 9 },
  { f: 1, t: '3-Car Garage', s: '27′-4″ × 22′-9″', u: 71.5, v: 40.2, p: 9 },
  { f: 1, t: 'Kitchen', u: 40.5, v: 6, p: 8 },
  { f: 1, t: 'Cafe', s: '12′-5″ × 15′-10″', u: 20.5, v: 7, p: 8 },
  { f: 1, t: 'Covered Lanai', s: '16′-4″ × 15′-3″', u: 11.5, v: 21.5, p: 8 },
  { f: 1, t: 'Bedroom 2', s: '12′-5″ × 17′-11″', u: 66.5, v: 7, p: 8 },
  { f: 1, t: 'Bedroom 3', s: '11′-9″ × 10′-0″', u: 46.4, v: 48.3, p: 7 },
  { f: 1, t: 'Flex', s: '10′-9″ × 12′-8″', u: 51.5, v: 29.5, p: 7 },
  { f: 1, t: 'Foyer', s: '7′-5″ × 12′-5″', u: 55.5, v: 16.2, p: 7 },
  { f: 1, t: 'Porch', u: 63.2, v: 19.7, p: 6 },
  { f: 1, t: "Owner's Bath", u: 30, v: 46.5, p: 6 },
  { f: 1, t: 'Laundry', u: 55.8, v: 46, p: 5 },
  { f: 1, t: 'Pantry', u: 47.5, v: 3.4, p: 4 },
  { f: 1, t: 'Bath 2', u: 54.5, v: 4.5, p: 4 },
  { f: 1, t: 'Bath 3', u: 39.9, v: 39, p: 4 },
  { f: 1, t: 'Pool Bath', u: 10.5, v: 33.2, p: 3 },
  { f: 1, t: 'Pool', s: '34′-0″ × 15′-0″', u: -19.5, v: 30, p: 9, pool: true, z: 1 },
  { f: 1, t: 'Spa', s: '9′-0″ × 5′-0″', u: -7, v: 22, p: 8, pool: true, z: 2.5 },
  { f: 1, t: 'Sun Shelf', s: '11′-0″ × 6′-0″', u: -14.5, v: 40, p: 7, pool: true, z: 1 },
  { f: 1, t: 'Steps', u: -14.5, v: 11.5, p: 6, pool: true, z: 1 },
  { f: 1, t: 'Pool Deck', s: '54′-0″ × 30′-0″', u: -3.5, v: 8, p: 7, pool: true, z: 1 },
  // upper floor
  { f: 2, t: 'Loft', s: '14′-11″ × 24′-10″', u: 34.2, v: 23, p: 9 },
  { f: 2, t: 'Media Room', s: '15′-0″ × 16′-6″', u: 30, v: 7.8, p: 9 },
  { f: 2, t: 'Bedroom 4', s: '13′-2″ × 16′-0″', u: 34.5, v: 47.3, p: 9 },
  { f: 2, t: 'HVAC / Storage', u: 43.5, v: 7.5, p: 6 },
  { f: 2, t: 'Bath 4', u: 36.5, v: 38.3, p: 6 },
];

const canvas = document.getElementById('view');
const stage = document.getElementById('stage');
const labelLayer = document.getElementById('labels');
const coarse = matchMedia('(pointer: coarse)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(new URLSearchParams(location.search).has('lowq') ? 1 : Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;

const state = { mode: 'exterior', labels: true, dims: false, elev: false, spin: false, pool: true, lawn: true, sat: true, satVariant: 'render', satExtent: 'tight', ov: { interior: true, exterior: true, property: true } };
let lawnMesh = null, lawnPatch = null;
function applyLawn() {
  if (lawnMesh) lawnMesh.visible = state.lawn;
  if (lawnPatch) lawnPatch.visible = state.lawn && !state.pool;
}

// ---------------------------------------------------------------- cameras
const persp = new THREE.PerspectiveCamera(32, 1, 0.5, 5000);
const ortho = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.5, 5000);
let camera = persp;
let controls = null;
const hint = document.getElementById('hint');

function makeControls(cam) {
  const c = new OrbitControls(cam, canvas);
  c.enableDamping = true; c.dampingFactor = 0.08;
  c.maxPolarAngle = 1.53; c.minDistance = 5; c.maxDistance = 2000;
  c.zoomSpeed = 0.9; c.rotateSpeed = 0.75;
  c.autoRotate = state.spin; c.autoRotateSpeed = 0.9;
  c.addEventListener('change', () => invalidate());
  c.addEventListener('start', () => { hint.classList.add('gone'); tween = null; });
  return c;
}
controls = makeControls(camera);

function swapCamera(toOrtho) {
  const next = toOrtho ? ortho : persp;
  if (next === camera) return;
  const old = controls;
  const target = old.target.clone();
  const pos = camera.position.clone();
  camera = next;
  camera.position.copy(pos);
  controls = makeControls(camera);
  controls.target.copy(target);
  old.dispose();
  resize();
  invalidate(3, true);
}

scene.add(new THREE.HemisphereLight(0xeaf1f8, 0xcfc9bd, 0.95));
const sun = new THREE.DirectionalLight(0xfff6e8, 3.0);
const CENTER = P(30, 27, 0);
sun.position.copy(CENTER).add(new THREE.Vector3(-17, 30, 24));
sun.target.position.copy(CENTER);
sun.castShadow = true;
const lowQ = new URLSearchParams(location.search).has('lowq');
const POF = +(new URLSearchParams(location.search).get('pof') ?? 1);
const sm = lowQ ? 1024 : coarse ? 2048 : 4096;
sun.shadow.mapSize.set(sm, sm);
Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 1, far: 320 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.035;
scene.add(sun, sun.target);

// render on demand; the static sun shadow is only re-rendered when visibility changes
let dirty = 3;
const invalidate = (n = 2, shadows = false) => { dirty = Math.max(dirty, n); if (shadows) renderer.shadowMap.needsUpdate = true; };
renderer.shadowMap.autoUpdate = false;

// ---------------------------------------------------------------- model
const groups = { site: [], f1: [], f2: [], roof_lower: [], roof_upper: [], pool: [], nopool: [] };
// tight fitting hulls (plan feet): single-storey body with eaves, two-storey core with the upper roof
const boxPts = (u0, v0, z0, u1, v1, z1) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => P(i & 1 ? u1 : u0, i & 2 ? v1 : v0, i & 4 ? z1 : z0));
const HULL = {
  exterior: [...boxPts(-1, -1, 0, 84, 55, 12), ...boxPts(20, -1, 12, 50, 55, 22.5), ...boxPts(46, 12, 12, 84, 50, 15.5), ...boxPts(27, 6, 22.5, 42, 48, 27.8)],
  upper: [...boxPts(-1, -1, 0, 84, 55, 12), ...boxPts(20, -1, 12, 50, 55, 22), ...boxPts(46, 12, 12, 84, 50, 15.5)],
  main: boxPts(-1, -1, 0, 84, 55, 11.4),
};
// the pool and cage as measured from the model itself: cage u -25..5, v 0..54, top 10.5 ft
const POOL_PTS = boxPts(-26, -1, 0, 5, 55, 11.4);
const POOL_VIEW_PTS = boxPts(-26, -1, 0, 14, 55, 11.5);
const DIM_PTS = [P(88, 58.5, 0), P(88, 58.5, 28.5)];

function loadModel() {
  new GLTFLoader().load('./model.glb', (gltf) => {
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      const name = (o.name || o.parent?.name || '');
      const [g, m] = name.split('__');
      if (groups[g]) groups[g].push(o);
      o.userData.group = g; o.userData.mat = m;
      const mat = o.material;
      if (mat.map) { mat.map.anisotropy = Math.min(8, maxAniso); mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping; }
      if (m === 'glass') {
        mat.transparent = true; mat.depthWrite = false; mat.envMapIntensity = 2.2; mat.side = THREE.DoubleSide;
        o.castShadow = false; o.receiveShadow = false; o.renderOrder = 2;
      } else if (m === 'water' || m === 'screen') {
        mat.transparent = true; mat.depthWrite = false; mat.side = THREE.DoubleSide;
        if (m === 'water') mat.envMapIntensity = 2.4;
        o.castShadow = false; o.receiveShadow = false; o.renderOrder = m === 'water' ? 1 : 3;
      } else if (m === 'poolfin' || m === 'pooltile' || m === 'spatile') {
        // the pool shell is single-sided on purpose, so it never shows from outside or below the ground
        mat.side = THREE.FrontSide; mat.shadowSide = THREE.DoubleSide;
        o.castShadow = m === 'spatile'; o.receiveShadow = true;
      } else {
        o.castShadow = m !== 'lawn' && m !== 'foam'; o.receiveShadow = true;
        mat.side = THREE.DoubleSide; mat.shadowSide = THREE.DoubleSide;
        if (g === 'f1' || g === 'f2') { mat.polygonOffset = true; mat.polygonOffsetFactor = POF; mat.polygonOffsetUnits = 0; }
      }
    });
    scene.add(gltf.scene);
    // lawn patch that closes the pool cut-out while the pool is switched off
    const lawn = gltf.scene.getObjectByName('site__lawn');
    lawnMesh = lawn;
    if (lawn && LAWN_PATCH) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(LAWN_PATCH.p, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(LAWN_PATCH.n, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(LAWN_PATCH.uv, 2));
      const patch = new THREE.Mesh(geo, lawn.material);
      patch.receiveShadow = true; patch.visible = false;
      lawnPatch = patch;
      gltf.scene.add(patch); groups.nopool.push(patch);
    }
    // --- Viewer-side corrections (source model untouched) -----------------
    // 1) Solid wall where the source model leaves the Cafe's east wall open
    //    (measured gap u 5.5 to 13.5 ft, full height; the floor plan shows a
    //    solid wall). Panel uses the model's own stucco material.
    const stuccoObj = gltf.scene.getObjectByName('f1__stucco');
    let stuccoMat = null;
    if (stuccoObj) stuccoObj.traverse((o) => { if (!stuccoMat && o.isMesh) stuccoMat = o.material; });
    if (stuccoMat) {
      const FTm = 0.3048;
      const wallPatch = new THREE.Mesh(
        new THREE.BoxGeometry(0.85 * FTm, 11.333 * FTm, 8.2 * FTm),
        stuccoMat
      );
      // Centre: v 0.375 ft (the wall assembly), mid height, u 9.5 ft
      wallPatch.position.set((54 - 0.375) * FTm, (11.333 * FTm) / 2, (9.5 - 83) * FTm);
      wallPatch.castShadow = true;
      wallPatch.receiveShadow = true;
      wallPatch.name = 'viewer__east_wall_patch';
      gltf.scene.add(wallPatch);
    }
    // 2) Pool enclosure raised so its top beam sits right under the roof,
    //    11'-0", just clear under the roof. The source cage tops out
    //    at 10.48 ft; cage and screen scale together about the ground, so
    //    posts, mid rails and doors keep their proportions.
    const CAGE_RAISE = 11.0 / 10.48;
    for (const n of ['pool__cage', 'pool__screen']) {
      const o = gltf.scene.getObjectByName(n);
      if (o) o.scale.y = CAGE_RAISE;
    }
    setMode(state.mode, false);
    applyLayers();
    document.getElementById('loading').classList.add('done');
    setView('hero', true);
    invalidate(4, true);
    window.__viewer.ready = true;
  }, undefined, (err) => {
    document.getElementById('loading-text').textContent = 'The model could not be loaded.';
    document.querySelector('.spinner').style.display = 'none';
    console.error(err);
  });
}

// ---------------------------------------------------------------- dimensions
const dimGroup = new THREE.Group(); dimGroup.visible = false; scene.add(dimGroup);
const dimLabels = [];
function dimLine(a, b, text, tickDir) {
  const pts = [a, b];
  const t = tickDir.clone().multiplyScalar(0.45);
  for (const p of [a, b]) pts.push(p.clone().sub(t), p.clone().add(t));
  const g = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]]);
  dimGroup.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x1d2a3b })));
  if (text) dimLabels.push(makeLabel(text, null, a.clone().lerp(b, 0.5), 'dim', 20));
}
const yG = 0.05;
dimLine(P(87.5, 54, yG), P(87.5, 0, yG), '54′-0″', new THREE.Vector3(0, 0, 1));
dimLine(P(83, 58, yG), P(0, 58, yG), '83′-0″', new THREE.Vector3(1, 0, 0));
const hx = new THREE.Vector3(1, 0, 0);
dimLine(P(87.5, 58, 0), P(87.5, 58, 27.73), null, hx);
for (const [z, t] of [[27.73, '≈ 27′-9″ ridge'], [21.8125, '21′-9¾″ plate'], [11.333, '11′-4″ plate']]) {
  const p = P(87.5, 58, z);
  dimGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([p.clone().sub(hx.clone().multiplyScalar(0.45)), p.clone().add(hx.clone().multiplyScalar(0.45))]), new THREE.LineBasicMaterial({ color: 0x1d2a3b })));
  dimLabels.push(makeLabel(t, null, p, 'dim', 20));
}

// ---------------------------------------------------------------- labels
function makeLabel(text, sub, pos, cls, prio) {
  const el = document.createElement('div');
  el.className = 'room' + (cls ? ' ' + cls : '');
  el.textContent = text;
  if (sub) { const s = document.createElement('small'); s.textContent = sub; el.appendChild(s); }
  labelLayer.appendChild(el);
  return { el, pos, prio, w: 0, h: 0, shown: false };
}
const roomLabels = ROOMS.map((r) => Object.assign(makeLabel(r.t, r.s, P(r.u, r.v, (r.f === 2 ? Z2F : 0) + (r.z ?? 3.5)), '', r.p), { floor: r.f, pool: !!r.pool }));
const allLabels = [...roomLabels, ...dimLabels];
function measureLabels() { for (const l of allLabels) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; } }

const v3 = new THREE.Vector3();
function updateLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  const placed = [];
  const cand = [];
  for (const l of allLabels) {
    const isDim = l.el.classList.contains('dim');
    let want = isDim ? state.dims : (state.labels && (!l.pool || state.pool) && ((state.mode === 'main' && l.floor === 1) || (state.mode === 'upper' && l.floor === 2)));
    if (want) {
      v3.copy(l.pos).project(camera);
      if (v3.z > 1 || v3.z < -1) want = false;
      l.x = (v3.x * 0.5 + 0.5) * w; l.y = (-v3.y * 0.5 + 0.5) * h;
      if (isDim && l.w) l.x = Math.min(Math.max(l.x, l.w / 2 + 6), w - l.w / 2 - 6);
      if (isDim && l.h) l.y = Math.min(Math.max(l.y, l.h / 2 + 6), h - l.h / 2 - 6);
    }
    if (want) cand.push(l); else if (l.shown) { l.el.classList.remove('on'); l.shown = false; l.px = undefined; }
  }
  cand.sort((a, b) => b.prio - a.prio);
  for (const l of cand) {
    if (!l.w) { l.w = l.el.offsetWidth; l.h = l.el.offsetHeight; }
    const r = { x0: l.x - l.w / 2 - 3, x1: l.x + l.w / 2 + 3, y0: l.y - l.h / 2 - 3, y1: l.y + l.h / 2 + 3 };
    const hit = placed.some((q) => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);
    if (hit) { if (l.shown) { l.el.classList.remove('on'); l.shown = false; } continue; }
    placed.push(r);
    if (Math.abs((l.px ?? -999) - l.x) > 0.5 || Math.abs((l.py ?? -999) - l.y) > 0.5) {
      l.px = l.x; l.py = l.y;
      l.el.style.transform = `translate(-50%, -50%) translate(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px)`;
    }
    if (!l.shown) { l.el.classList.add('on'); l.shown = true; }
  }
}

// ---------------------------------------------------------------- camera
const VIEWS = {
  hero: { dir: [-0.52, 0.2, 0.83], box: 'full' },
  front: { dir: [0, 0.07, 1], box: 'full' },
  left: { dir: [-1, 0.1, 0], box: 'full' },
  rear: { dir: [0.0, 0.1, -1], box: 'full' },
  right: { dir: [1, 0.1, 0], box: 'full' },
  top: { dir: [0, 1, 0.0015], box: 'full' },
  bird: { dir: [0, 1, 0.0015], box: 'bird' },
  plan: { dir: [-0.22, 0.86, 0.46], box: 'mode' },
  pool: { dir: [0.5, 0.62, -0.6], box: 'pool' },
};
const ELEV_VIEWS = ['front', 'left', 'rear', 'right'];
const BIRD_C = [(54 - 27) * 0.3048, 0, (41.5 - 83) * 0.3048];
const BIRD_PTS = [[-95, -95], [95, -95], [95, 95], [-95, 95]].map(([dx, dz]) => new THREE.Vector3(BIRD_C[0] + dx, 0, BIRD_C[2] + dz));
let tween = null;

function fit(dirArr, pts) {
  const dir = new THREE.Vector3(...dirArr).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, dir).normalize();
  const cu = new THREE.Vector3().crossVectors(dir, right).normalize();
  const w = stage.clientWidth, h = stage.clientHeight;
  const padTop = 24 / h, padBot = 24 / h;
  const usableV = Math.max(0.3, 1 - padTop - padBot), usableH = 0.94;
  let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity, c0 = Infinity, c1 = -Infinity;
  for (const p of pts) {
    const a = p.dot(right), b = p.dot(cu), c = p.dot(dir);
    a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); c0 = Math.min(c0, c); c1 = Math.max(c1, c);
  }
  const target = new THREE.Vector3().addScaledVector(right, (a0 + a1) / 2).addScaledVector(cu, (b0 + b1) / 2).addScaledVector(dir, (c0 + c1) / 2);
  if (camera.isOrthographicCamera) {
    const H = Math.max((b1 - b0) / usableV, (a1 - a0) / (usableH * camera.aspect));
    const off = cu.clone().multiplyScalar(-(padBot - padTop) * H / 2);
    const t = target.clone().add(off);
    return { pos: t.clone().addScaledVector(dir, 160), target: t, H };
  }
  const tv = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), th = tv * camera.aspect;
  let D = 0;
  for (const p of pts) {
    const c = p.clone().sub(target), z = c.dot(dir);
    D = Math.max(D, z + Math.abs(c.dot(cu)) / (tv * usableV), z + Math.abs(c.dot(right)) / (th * usableH));
  }
  const off = cu.clone().multiplyScalar(-(padBot - padTop) * tv * D);
  return { pos: target.clone().addScaledVector(dir, D).add(off), target: target.add(off), H: null };
}

function setOrthoFrustum(H) {
  const a = camera.aspect;
  camera.top = H / 2; camera.bottom = -H / 2;
  camera.left = -H * a / 2; camera.right = H * a / 2;
  camera.zoom = 1;
  camera.updateProjectionMatrix();
}

let lastView = 'hero';
function setView(name, instant) {
  const v = VIEWS[name]; if (!v) return;
  lastView = name;
  swapCamera((state.elev && ELEV_VIEWS.includes(name)) || name === 'bird');
  if (v.box === 'pool' && !state.pool) { state.pool = true; document.getElementById('t-pool').checked = true; setMode(state.mode, false); }
  const pts = v.box === 'pool' ? POOL_VIEW_PTS : v.box === 'bird' ? [...BIRD_PTS, ...HULL[state.mode], ...layerFitPts()] : [...HULL[state.mode], ...(state.dims ? DIM_PTS : []), ...(state.pool ? POOL_PTS : []), ...layerFitPts()];
  const { pos, target, H } = fit(v.dir, pts);
  if (instant || reduceMotion) {
    camera.position.copy(pos); controls.target.copy(target);
    if (H) setOrthoFrustum(H);
    controls.update(); tween = null; invalidate(3); return;
  }
  const H0 = camera.isOrthographicCamera ? (camera.top - camera.bottom) / camera.zoom : null;
  tween = { t0: performance.now(), dur: 900, p0: camera.position.clone(), p1: pos, q0: controls.target.clone(), q1: target, H0, H1: H };
}
function stepTween(now) {
  if (!tween) return;
  const k = Math.min(1, (now - tween.t0) / tween.dur);
  const e = 1 - Math.pow(1 - k, 4);
  const o0 = tween.p0.clone().sub(tween.q0), o1 = tween.p1.clone().sub(tween.q1);
  const l = THREE.MathUtils.lerp(o0.length(), o1.length(), e);
  const q = new THREE.Quaternion().setFromUnitVectors(o0.clone().normalize(), o1.clone().normalize());
  const o = o0.clone().normalize().applyQuaternion(new THREE.Quaternion().slerp(q, e)).multiplyScalar(l);
  controls.target.lerpVectors(tween.q0, tween.q1, e);
  camera.position.copy(controls.target).add(o);
  if (tween.H1 && tween.H0) setOrthoFrustum(THREE.MathUtils.lerp(tween.H0, tween.H1, e));
  if (k >= 1) tween = null;
}

function setMode(mode, moveCamera = true) {
  state.mode = mode;
  const show = { site: true, f1: true, f2: mode !== 'main', roof_lower: mode !== 'main', roof_upper: mode === 'exterior', pool: state.pool, nopool: !state.pool };
  for (const [g, arr] of Object.entries(groups)) for (const o of arr) o.visible = show[g];
  applyLawn();
  syncLayerHoles();
  invalidate(3, true);
  document.querySelectorAll('.segmented button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  if (moveCamera) setView(mode === 'exterior' ? 'hero' : 'plan');
}

// ---------------------------------------------------------------- UI
document.querySelectorAll('.segmented button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
document.querySelector('.segmented').addEventListener('keydown', (e) => {
  const btns = [...document.querySelectorAll('.segmented button')];
  const i = btns.findIndex((b) => b.getAttribute('aria-checked') === 'true');
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
    n.focus(); setMode(n.dataset.mode); e.preventDefault();
  }
});
document.querySelectorAll('.chips button').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));

// ---- ground layers: the lot survey and satellite images, registered to the
// lot master frame (8455 x 8543 px, Web Mercator). The transform was solved
// against the lot work's own floor plan pool layer: 17.0 degrees, 4.628 px
// per foot, house origin (u 0, v 0) at frame px (4341.43, 4239.67). The pool
// outline matched the model to about a foot.
const TIGHT_WIN = [3700, 3750, 4780, 4960];
const FULL_WIN = [0, 0, 8455, 8543];
function pxToPlanUV(x, y) {
  const rx = x - 4341.43, ry = y - 4239.67;
  return {
    u: (-1.260 * rx + 4.453 * ry) / 21.42,
    v: (-1.260 * ry - 4.453 * rx) / 21.42
  };
}
const layerGroup = new THREE.Group();
layerGroup.name = 'viewer__ground_layers';
scene.add(layerGroup);
const layerMeshes = {};
function planToPx(u, v) {
  return [4341.43 + u * -1.260 + v * -4.453, 4239.67 + u * 4.453 + v * -1.260];
}
function syncLayerHoles() {
  for (const m of Object.values(layerMeshes)) if (m.userData.fullGeo) m.geometry = state.pool ? m.userData.holedGeo : m.userData.fullGeo;
}
function layerQuad(win, url, transparent, ro) {
  const [x0, y0, x1, y1] = win;
  // Build the sheet in plan coordinates. While the pool is shown, the sheet
  // carries a hole over the pool basin, so the layers never cut through the
  // pool: through the water you see the pool's own finish, as modelled. The
  // basin floor drops about 1.4 m, below the sheet's -0.50 m level, in the
  // deep centre. With the pool off, the whole sheet is used.
  const buildGeo = (withHole) => {
    const outer = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(([px, py]) => pxToPlanUV(px, py));
    const shape = new THREE.Shape();
    outer.forEach(({ u, v }, i) => { if (i === 0) shape.moveTo(u, v); else shape.lineTo(u, v); });
    shape.closePath();
    if (withHole) {
      const hole = new THREE.Path();
      const HC = [[-24.5, 8.5], [-1.5, 8.5], [-1.5, 43.5], [-24.5, 43.5]];
      HC.forEach(([u, v], i) => { if (i === 0) hole.moveTo(u, v); else hole.lineTo(u, v); });
      hole.closePath();
      shape.holes.push(hole);
    }
    const g = new THREE.ShapeGeometry(shape, 2);
    const p = g.getAttribute('position');
    const pos = [], uv = [];
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i), v = p.getY(i);
      pos.push((54 - v) * FT, -0.50, (u - 83) * FT);
      const [px, py] = planToPx(u, v);
      uv.push((px - x0) / (x1 - x0), 1 - (py - y0) / (y1 - y0));
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return g;
  };
  const g = buildGeo(true);
  const tex = new THREE.TextureLoader().load(url, () => invalidate());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
    map: tex, side: THREE.DoubleSide, toneMapped: false,
    transparent: !!transparent, depthWrite: !transparent
  }));
  m.renderOrder = ro !== undefined ? ro : (transparent ? -1 : 0);
  m.visible = false;
  m.userData.holedGeo = g;
  m.userData.fullGeo = buildGeo(false);
  layerGroup.add(m);
  return m;
}
const OV_DEFS = [['interior', 4], ['exterior', 5], ['property', 6], ['surveylines', 7], ['surveydata', 8], ['flood', 10], ['floodmap', 11], ['floodold', 12], ['floodmapold', 13], ['highlight', 15], ['mhside', 20], ['mhback', 21], ['mhfront', 22], ['mhcorner', 23], ['meside', 24], ['meback', 25], ['mecorner', 26]];
const OV_ORD = Object.fromEntries(OV_DEFS);
function ensureLayer(key) {
  if (layerMeshes[key]) return layerMeshes[key];
  let m;
  if (key.startsWith('ov-')) {
    const cut = key.lastIndexOf('-');
    const name = key.slice(3, cut), extent = key.slice(cut + 1);
    m = layerQuad(extent === 'full' ? FULL_WIN : TIGHT_WIN, './layers/ov-' + name + '-' + extent + '.png', true, 10 + (OV_ORD[name] || 0));
  } else {
    const [variant, extent] = key.split('-');
    m = layerQuad(extent === 'full' ? FULL_WIN : TIGHT_WIN, './layers/sat-' + variant + '-' + extent + '.jpg', false);
  }
  layerMeshes[key] = m;
  return m;
}
function applyLayers() {
  for (const k of Object.keys(layerMeshes)) layerMeshes[k].visible = false;
  if (state.sat) ensureLayer(state.satVariant + '-' + state.satExtent).visible = true;
  for (const [name] of OV_DEFS) if (state.ov[name]) ensureLayer('ov-' + name + '-' + state.satExtent).visible = true;
}
function layerFitPts() {
  const pts = [];
  const wins = [];
  if (state.sat || OV_DEFS.some(([n]) => state.ov[n])) wins.push(state.satExtent === 'full' ? FULL_WIN : TIGHT_WIN);
  for (const [x0, y0, x1, y1] of wins)
    for (const [px, py] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
      const { u, v } = pxToPlanUV(px, py);
      pts.push(new THREE.Vector3((54 - v) * FT, 0, (u - 83) * FT));
    }
  return pts;
}
document.getElementById('t-lawn').addEventListener('change', (e) => { state.lawn = e.target.checked; applyLawn(); invalidate(); });
for (const [name] of OV_DEFS) {
  const el = document.getElementById('t-ov-' + name);
  if (el) el.addEventListener('change', (e) => { state.ov[name] = e.target.checked; applyLayers(); invalidate(); });
}
function setAllLayers(on) {
  state.sat = on; document.getElementById('t-sat').checked = on;
  for (const [name] of OV_DEFS) { state.ov[name] = on; const el = document.getElementById('t-ov-' + name); if (el) el.checked = on; }
  applyLayers(); invalidate();
}
document.getElementById('layers-all').addEventListener('click', () => setAllLayers(true));
document.getElementById('layers-none').addEventListener('click', () => setAllLayers(false));
document.getElementById('t-sat').addEventListener('change', (e) => { state.sat = e.target.checked; applyLayers(); invalidate(); });
function segWire(id, fn) {
  const seg = document.getElementById(id);
  seg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    fn(b.dataset.v);
    applyLayers();
    invalidate();
  }));
}
segWire('seg-variant', (v) => { state.satVariant = v; if (!state.sat) { state.sat = true; document.getElementById('t-sat').checked = true; } });
segWire('seg-extent', (v) => { state.satExtent = v; if (!state.sat) { state.sat = true; document.getElementById('t-sat').checked = true; } });

document.getElementById('t-labels').addEventListener('change', (e) => { state.labels = e.target.checked; invalidate(); });
document.getElementById('t-dims').addEventListener('change', (e) => { state.dims = e.target.checked; dimGroup.visible = state.dims; invalidate(); if (state.dims) setView(lastView); });
document.getElementById('t-elev').addEventListener('change', (e) => {
  state.elev = e.target.checked;
  if (ELEV_VIEWS.includes(lastView)) setView(lastView);
  else invalidate();
});
document.getElementById('t-pool').addEventListener('change', (e) => {
  state.pool = e.target.checked;
  setMode(state.mode, false);
  setView(!state.pool && lastView === 'pool' ? 'rear' : lastView);
});
document.getElementById('t-spin').addEventListener('change', (e) => {
  state.spin = e.target.checked;
  controls.autoRotate = state.spin;
  invalidate();
});
document.getElementById('download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = './model.glb'; a.download = 'the-isle-3d-model.glb';
  document.body.appendChild(a); a.click(); a.remove();
});
document.getElementById('photo').addEventListener('click', () => {
  renderer.render(scene, camera);
  canvas.toBlob((b) => {
    if (!b) return;
    const url = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = url; a.download = 'the-isle-3d-view.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
});
document.getElementById('full').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else stage.requestFullscreen?.();
});

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  persp.aspect = w / h; persp.fov = w < h ? 40 : 32; persp.updateProjectionMatrix();
  const effH = (ortho.top - ortho.bottom) / (ortho.zoom || 1);
  ortho.aspect = w / h;
  ortho.top = effH / 2; ortho.bottom = -effH / 2;
  ortho.left = -effH * ortho.aspect / 2; ortho.right = effH * ortho.aspect / 2;
  ortho.zoom = 1; ortho.updateProjectionMatrix();
  invalidate(3);
}
addEventListener('resize', () => { resize(); measureLabels(); });
document.addEventListener('fullscreenchange', () => setTimeout(resize, 60));
resize();

// render on demand: only when the camera moves or something changes
function frame(now) {
  if (tween) { stepTween(now); invalidate(); }
  if (state.spin) invalidate();
  controls.update();
  if (dirty > 0) {
    dirty--;
    renderer.render(scene, camera);
  }
  updateLabels();
  requestAnimationFrame(frame);
}
window.__viewer = { ready: false, setMode, setView, state, get camera() { return camera; }, get controls() { return controls; }, invalidate };
applyLayers();
requestAnimationFrame(frame);
loadModel();

// ---------------------------------------------------------------- sun (from the shadow study: NOAA solar position for the lot)
const SUN_LAT = 28.1773, SUN_LON = -82.2341;
function sunIsLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function sunDoy(y, mo, d) { return Math.round((Date.UTC(y, mo - 1, d) - Date.UTC(y, 0, 1)) / 864e5) + 1; }
function sunNthSunday(y, month, n) { const dow = new Date(Date.UTC(y, month, 1)).getUTCDay(); return 1 + ((7 - dow) % 7) + (n - 1) * 7; }
function sunTz(y, mo, d) {
  const startDay = sunNthSunday(y, 2, 2), endDay = sunNthSunday(y, 10, 1);
  if (mo < 3 || mo > 11) return -5;
  if (mo > 3 && mo < 11) return -4;
  if (mo === 3) return d >= startDay ? -4 : -5;
  return d < endDay ? -4 : -5;
}
function sunPosition(y, mo, d, hourLocal) {
  const doy = sunDoy(y, mo, d), daysInYear = sunIsLeap(y) ? 366 : 365;
  const gamma = 2 * Math.PI / daysInYear * (doy - 1 + (hourLocal - 12) / 24);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  const timeOffset = eqtime + 4 * SUN_LON - 60 * sunTz(y, mo, d);
  const tst = hourLocal * 60 + timeOffset;
  let haDeg = tst / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  if (haDeg > 180) haDeg -= 360;
  const ha = haDeg * Math.PI / 180, lat = SUN_LAT * Math.PI / 180;
  let cosZen = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  cosZen = Math.max(-1, Math.min(1, cosZen));
  const alt = 90 - Math.acos(cosZen) * 180 / Math.PI;
  const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) * 180 / Math.PI + 180;
  return { alt, az: (az + 360) % 360 };
}
function sunTimes(y, mo, d) {
  let rise = null, set = null, noon = 0, maxA = -90, prevA = sunPosition(y, mo, d, 0).alt, prevM = 0;
  for (let m = 2; m <= 1440; m += 2) {
    const a = sunPosition(y, mo, d, m / 60).alt;
    if (prevA < -0.583 && a >= -0.583 && rise === null) rise = prevM + (m - prevM) * (-0.583 - prevA) / (a - prevA);
    if (prevA >= -0.583 && a < -0.583) set = prevM + (m - prevM) * (-0.583 - prevA) / (a - prevA);
    if (a > maxA) { maxA = a; noon = m; }
    prevA = a; prevM = m;
  }
  return { rise, noon, set };
}
function sunFmt(mins) {
  if (mins === null || mins === undefined) return '--:--';
  const hh = Math.floor(mins / 60), mm = Math.floor(mins % 60);
  return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
}
const sunDateEl = document.getElementById('sun-date');
const sunTimeEl = document.getElementById('sun-time');
const sunClockEl = document.getElementById('sun-clock');
const sunFactsEl = document.getElementById('sun-facts');
const hemi = scene.children.find((o) => o.isHemisphereLight);
function applySun() {
  const parts = sunDateEl.value.split('-');
  const y = +parts[0], mo = +parts[1], d = +parts[2];
  const mins = +sunTimeEl.value;
  sunClockEl.textContent = sunFmt(mins);
  const sp = sunPosition(y, mo, d, mins / 60);
  const altR = sp.alt * Math.PI / 180, azR = sp.az * Math.PI / 180;
  const E = Math.cos(altR) * Math.sin(azR), N = Math.cos(altR) * Math.cos(azR);
  // scene axes against true compass: +Z bears S16W, +X bears WNW (the shadow study's site rotation)
  const dir = new THREE.Vector3(-0.9613 * E + 0.2756 * N, Math.sin(altR), -0.2756 * E - 0.9613 * N);
  const dayF = Math.max(0, Math.min(1, sp.alt / 30));
  if (sp.alt > -1) {
    sun.visible = true;
    sun.position.copy(CENTER).addScaledVector(dir, 110);
    sun.intensity = 3.0 * Math.max(0.1, Math.min(1, sp.alt / 25));
  } else sun.visible = false;
  if (hemi) hemi.intensity = 0.25 + 0.7 * dayF;
  scene.environmentIntensity = 0.15 + 0.35 * dayF;
  const t = sunTimes(y, mo, d);
  sunFactsEl.textContent = sp.alt <= 0
    ? 'Sun below the horizon · Sunrise ' + sunFmt(t.rise) + ' · Sunset ' + sunFmt(t.set)
    : 'Sunrise ' + sunFmt(t.rise) + ' · Solar noon ' + sunFmt(t.noon) + ' · Sunset ' + sunFmt(t.set) + ' · Altitude ' + sp.alt.toFixed(1) + '° · Azimuth ' + sp.az.toFixed(1) + '°';
  invalidate(2, true);
}
let sunPlayTimer = null;
function sunStopPlay() {
  if (sunPlayTimer) { clearInterval(sunPlayTimer); sunPlayTimer = null; }
  document.getElementById('sun-playday').textContent = 'Play day';
  document.getElementById('sun-playyear').textContent = 'Play year';
}
function sunSetTime(mins) { sunTimeEl.value = Math.max(300, Math.min(1260, Math.round(mins))); applySun(); }
sunDateEl.addEventListener('change', () => { sunStopPlay(); applySun(); });
sunTimeEl.addEventListener('input', () => { sunStopPlay(); applySun(); });
document.getElementById('sun-rise').addEventListener('click', () => { const p = sunDateEl.value.split('-'); const t = sunTimes(+p[0], +p[1], +p[2]); if (t.rise !== null) sunSetTime(t.rise); });
document.getElementById('sun-noon').addEventListener('click', () => { const p = sunDateEl.value.split('-'); const t = sunTimes(+p[0], +p[1], +p[2]); sunSetTime(t.noon); });
document.getElementById('sun-set').addEventListener('click', () => { const p = sunDateEl.value.split('-'); const t = sunTimes(+p[0], +p[1], +p[2]); if (t.set !== null) sunSetTime(t.set); });
document.getElementById('sun-longest').addEventListener('click', () => { const p = sunDateEl.value.split('-'); sunDateEl.value = p[0] + '-06-21'; applySun(); });
document.getElementById('sun-shortest').addEventListener('click', () => { const p = sunDateEl.value.split('-'); sunDateEl.value = p[0] + '-12-21'; applySun(); });
document.getElementById('sun-playday').addEventListener('click', (e) => {
  if (sunPlayTimer) { sunStopPlay(); return; }
  e.target.textContent = 'Stop';
  sunPlayTimer = setInterval(() => {
    let v = +sunTimeEl.value + 6;
    if (v > 1260) { sunStopPlay(); return; }
    sunTimeEl.value = v; applySun();
  }, 60);
});
document.getElementById('sun-playyear').addEventListener('click', (e) => {
  if (sunPlayTimer) { sunStopPlay(); return; }
  e.target.textContent = 'Stop';
  sunPlayTimer = setInterval(() => {
    const p = sunDateEl.value.split('-');
    const dt = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]) + 3 * 864e5);
    if (dt.getUTCFullYear() !== +p[0]) { sunStopPlay(); return; }
    sunDateEl.value = dt.toISOString().slice(0, 10); applySun();
  }, 60);
});
applySun();

// ---------------------------------------------------------------- hide-away menu (as on /lot and /shadow)
const panelEl = document.getElementById('panel');
const menuShowBtn = document.getElementById('menu-show');
const mobilePanel = () => window.matchMedia('(max-width: 760px)').matches;
document.getElementById('menu-hide').addEventListener('click', () => {
  if (mobilePanel()) panelEl.classList.remove('open'); else document.body.classList.add('panelhidden');
  resize();
});
menuShowBtn.addEventListener('click', () => {
  if (mobilePanel()) panelEl.classList.add('open'); else document.body.classList.remove('panelhidden');
  resize();
});
document.querySelectorAll('.sec-toggle').forEach((b) => b.addEventListener('click', () => b.closest('.sec').classList.toggle('closed')));
document.getElementById('layers-reset').addEventListener('click', () => {
  document.querySelector('[data-mode="exterior"]').click();
  document.querySelector('[data-view="hero"]').click();
  const setT = (id, on) => { const el = document.getElementById(id); el.checked = on; el.dispatchEvent(new Event('change')); };
  setT('t-pool', true); setT('t-lawn', true); setT('t-labels', true);
  setT('t-dims', false); setT('t-elev', false); setT('t-spin', false);
  setT('t-sat', true);
  document.querySelector('#seg-variant [data-v="render"]').click();
  document.querySelector('#seg-extent [data-v="tight"]').click();
  ['interior', 'exterior', 'property', 'surveylines', 'surveydata', 'highlight', 'flood', 'floodmap', 'floodold', 'floodmapold', 'mhside', 'mhback', 'mhfront', 'mhcorner', 'meside', 'meback', 'mecorner']
    .forEach((k) => setT('t-ov-' + k, ['interior', 'exterior', 'property'].includes(k)));
  const sd = document.getElementById('sun-date'), st = document.getElementById('sun-time');
  sd.value = '2026-11-23'; st.value = '690';
  sd.dispatchEvent(new Event('change')); st.dispatchEvent(new Event('input'));
  invalidate();
});
