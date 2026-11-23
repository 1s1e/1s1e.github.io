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

const state = { mode: 'exterior', labels: true, dims: false, elev: false, spin: false, pool: true };

// ---------------------------------------------------------------- cameras
const persp = new THREE.PerspectiveCamera(32, 1, 0.5, 600);
const ortho = new THREE.OrthographicCamera(-20, 20, 15, -15, 0.5, 600);
let camera = persp;
let controls = null;
const hint = document.getElementById('hint');

function makeControls(cam) {
  const c = new OrbitControls(cam, canvas);
  c.enableDamping = true; c.dampingFactor = 0.08;
  c.maxPolarAngle = 1.53; c.minDistance = 5; c.maxDistance = 400;
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
Object.assign(sun.shadow.camera, { left: -27, right: 27, top: 27, bottom: -27, near: 1, far: 120 });
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
const POOL_PTS = boxPts(-26, -1, 0, 5, 55, 10.6);
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
    if (lawn && LAWN_PATCH) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(LAWN_PATCH.p, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(LAWN_PATCH.n, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(LAWN_PATCH.uv, 2));
      const patch = new THREE.Mesh(geo, lawn.material);
      patch.receiveShadow = true; patch.visible = false;
      gltf.scene.add(patch); groups.nopool.push(patch);
    }
    setMode(state.mode, false);
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
  plan: { dir: [-0.22, 0.86, 0.46], box: 'mode' },
  pool: { dir: [0.5, 0.62, -0.6], box: 'pool' },
};
const ELEV_VIEWS = ['front', 'left', 'rear', 'right'];
let tween = null;

function fit(dirArr, pts) {
  const dir = new THREE.Vector3(...dirArr).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(up, dir).normalize();
  const cu = new THREE.Vector3().crossVectors(dir, right).normalize();
  const w = stage.clientWidth, h = stage.clientHeight;
  const ctl = document.getElementById('controls').getBoundingClientRect(), ttl = document.querySelector('.title-card').getBoundingClientRect();
  const padTop = (w < 640 ? ttl.bottom + 10 : 24) / h, padBot = Math.max(40, h - ctl.top + 12) / h;
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
  swapCamera(state.elev && ELEV_VIEWS.includes(name));
  if (v.box === 'pool' && !state.pool) { state.pool = true; document.getElementById('t-pool').checked = true; setMode(state.mode, false); }
  const pts = v.box === 'pool' ? POOL_VIEW_PTS : [...HULL[state.mode], ...(state.dims ? DIM_PTS : []), ...(state.pool ? POOL_PTS : [])];
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
requestAnimationFrame(frame);
loadModel();
