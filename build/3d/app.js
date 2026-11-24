// The Isle - 3D viewer, rebuilt from scratch on the /lot and /shadow system.
// Scene, ground registration and sun follow the /shadow study; the layer
// stack, names, order and defaults follow the /lot viewer; the model is
// layered in as one rigid group placed by a least-squares fit of the pool
// enclosure corners against the survey registration (max error 0.05 m).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LAWN_PATCH } from './lawn-patch.js?v=24';

const FT = 0.3048;
// ---- shared master frame (Web Mercator image stack, 8455 x 8543 px) ------
const MPP_SHADOW = 0.0658;                    // /shadow ground scale, m per px
const GW = 1900 * MPP_SHADOW, GD = 1800 * MPP_SHADOW;
const SHADOW_ORIGIN = [3300, 3600];           // /shadow ground crop, master px
const MPP_LOT = 0.065822;                     // /lot frame scale at the lot
const LOT_FRAME = [423, 598, 7609, 7689];     // /lot frame rect, master px
const DETAIL_RECT = [3840, 3910, 720, 1000];  // survey + detail rect, master px
const PLAN_RECT = [3880, 3930, 590, 840];     // floor plan rect, master px
const GROUND_Y = -0.1306;                     // lawn top stands 0.03 m proud
// master frame px -> world metres (world is centred on the /shadow ground)
const worldFromMaster = (fx, fy) => [
  (fx - SHADOW_ORIGIN[0]) * MPP_SHADOW - GW / 2,
  (fy - SHADOW_ORIGIN[1]) * MPP_SHADOW - GD / 2
];
const CENTRE = new THREE.Vector3(-5.55, 0, -11.94); // house centre, world
// surveyed lot polygon in world XZ, taken from the surveyor's own vector
// linework in the site plan PDF (American Surveying & Mapping, 2026-09-25),
// carried into this frame by the recorded site plan fit: the boundary
// segments themselves (front 77.50 ft, west 143.32 ft, east 156.85 ft, rear
// 39.85 ft + 38.82 ft with its knick), not a fit to the raster lines.
// Order: front_east, front_west, rear_west, rear_knick, rear_east.
const LOT_WORLD = [[2.356, 14.650], [-20.442, 8.191], [-8.496, -33.980], [3.318, -32.781], [15.436, -31.496]];

// model-space helpers (the model's own plan coordinates, feet)
const P = (u, v, z = 0) => new THREE.Vector3((54 - v) * FT, z * FT, (u - 83) * FT);
const Z2F = 12.729;

const ROOMS = [
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
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = false;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.45;

const state = { mode: 'exterior', house: true, labels: true, dims: false, elev: false, spin: false, pool: true, lawn: true, sat: true, base: 'render', ov: {} };
let lawnSlab = null, lawnPatch = null, wallPatchMesh = null, modelGroup = null;

// render on demand
let dirty = 3;
const invalidate = (n = 2, shadows = false) => { dirty = Math.max(dirty, n); if (shadows) renderer.shadowMap.needsUpdate = true; };

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

// ---------------------------------------------------------------- sun (NOAA, from the /shadow study)
const LAT = 28.1773, LON = -82.2341;
const RAD = Math.PI / 180;
function tzOffsetMinutes(y, m, d) {
  const dstStart = new Date(Date.UTC(y, 2, 1)); dstStart.setUTCDate(1 + ((7 - dstStart.getUTCDay()) % 7) + 7);
  const dstEnd = new Date(Date.UTC(y, 10, 1)); dstEnd.setUTCDate(1 + ((7 - dstEnd.getUTCDay()) % 7));
  const cur = Date.UTC(y, m - 1, d);
  return (cur >= dstStart.getTime() && cur < dstEnd.getTime()) ? 240 : 300;
}
function sunPosition(y, mo, d, mins) {
  const tzOff = tzOffsetMinutes(y, mo, d);
  const utc = Date.UTC(y, mo - 1, d, 0, mins + tzOff) / 86400000 + 2440587.5;
  const T = (utc - 2451545.0) / 36525;
  const L0 = ((280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360 + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const Mr = M * RAD;
  const C = (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;
  const epsR = eps * RAD;
  const yv = Math.tan(epsR / 2) ** 2;
  const eqtime = 4 / RAD * (yv * Math.sin(2 * L0 * RAD) - 2 * e * Math.sin(Mr)
    + 4 * e * yv * Math.sin(Mr) * Math.cos(2 * L0 * RAD) - 0.5 * yv * yv * Math.sin(4 * L0 * RAD)
    - 1.25 * e * e * Math.sin(2 * Mr));
  let tst = (mins + eqtime + 4 * LON + tzOff) % 1440; if (tst < 0) tst += 1440;
  let ha = tst / 4 - 180; if (ha < -180) ha += 360;
  const latR = LAT * RAD, declR = decl * RAD, haR = ha * RAD;
  const cosZen = Math.sin(latR) * Math.sin(declR) + Math.cos(latR) * Math.cos(declR) * Math.cos(haR);
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZen))) / RAD;
  const alt = 90 - zen;
  let az = Math.atan2(Math.sin(haR), Math.cos(haR) * Math.sin(latR) - Math.tan(declR) * Math.cos(latR)) / RAD + 180;
  az = ((az % 360) + 360) % 360;
  return { alt, az };
}
function sunTimes(y, mo, d) {
  // Sunrise and sunset are read at the NOAA horizon, altitude -0.833 degrees
  // (refraction plus the solar disc), the convention the /shadow study's
  // verified times use.
  const HORIZON = -0.833;
  let prev = null, rise = null, set = null, noon = null, best = -90;
  for (let m = 0; m <= 1440; m += 4) {
    const a = sunPosition(y, mo, d, m).alt;
    if (a > best) { best = a; noon = m; }
    if (prev !== null && prev.a < HORIZON && a >= HORIZON) {
      let lo = prev.m, hi = m;
      for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; (sunPosition(y, mo, d, mid).alt < HORIZON) ? lo = mid : hi = mid; }
      rise = (lo + hi) / 2;
    }
    if (prev !== null && prev.a >= HORIZON && a < HORIZON) {
      let lo = prev.m, hi = m;
      for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; (sunPosition(y, mo, d, mid).alt >= HORIZON) ? lo = mid : hi = mid; }
      set = (lo + hi) / 2;
    }
    prev = { m, a };
  }
  return { rise, noon, set };
}
const hemi = new THREE.HemisphereLight(0xeaf1f8, 0xcfc9bd, 0.9);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff6e8, 3.0);
sun.castShadow = true;
const lowQ = new URLSearchParams(location.search).has('lowq');
const sm = lowQ ? 1024 : coarse ? 2048 : 4096;
sun.shadow.mapSize.set(sm, sm);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 400 });
sun.shadow.camera.updateProjectionMatrix();
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.035;
sun.target.position.copy(CENTRE);
scene.add(sun, sun.target);

// ---------------------------------------------------------------- ground and layers
// Files are the /lot and /shadow originals, byte-identical. Each texture is
// uploaded at native size wherever the device GPU allows; only a GPU whose
// maximum texture size is smaller gets a halved copy, so the picture the
// device can show stays the file's own pixels.
const maxTex = renderer.capabilities.maxTextureSize;
// Phones and tablets kill pages that take too much memory, and this page's
// sheets run to 60-100 megapixels each at native size. On a memory-
// constrained device the textures are uploaded at a reduced size that
// still exceeds the screen's own pixel count; the files themselves are
// unchanged, and placement is geometry, so nothing moves. Desktops keep
// the native upload wherever the GPU allows it.
const constrained = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
const texCap = constrained ? 4096 : maxTex;
function loadTex(url, srgb = true, onReady) {
  const tex = new THREE.TextureLoader().load(url, () => {
    const img = tex.image;
    if (img && (img.width > texCap || img.height > texCap)) {
      const s = texCap / Math.max(img.width, img.height);
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.width * s)); cv.height = Math.max(1, Math.round(img.height * s));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      tex.image = cv; tex.needsUpdate = true;
    }
    invalidate();
    if (onReady) onReady(tex);
  });
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}
const texCache = {};
function getTex(url) {
  if (!texCache[url]) texCache[url] = loadTex(url);
  return texCache[url];
}
function rectPlane(rect, scale, y, mat) {
  const [fx, fy, w, h] = rect;
  const [cx, cz] = worldFromMaster(fx + w / 2, fy + h / 2);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w * scale, h * scale), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(cx, y, cz);
  return m;
}
const layerGroup = new THREE.Group(); layerGroup.name = 'viewer__layers'; scene.add(layerGroup);
// ground bases: the /lot satellites on the /lot frame, the /shadow grounds on theirs
const BASE_DEFS = {
  master: { file: 'layers/02-satellite.jpg', rect: LOT_FRAME, scale: MPP_LOT },
  cleaned: { file: 'layers/02b-satellite-cleaned.jpg', rect: LOT_FRAME, scale: MPP_LOT },
  render: { file: 'layers/02c-satellite-render.jpg', rect: LOT_FRAME, scale: MPP_LOT },
  shadow: { file: 'layers/ground.jpg', rect: [3300, 3600, 1900, 1800], scale: MPP_SHADOW },
  shadownat: { file: 'layers/ground-natural.jpg', rect: [3300, 3600, 1900, 1800], scale: MPP_SHADOW }
};
const baseMeshes = {};
function ensureBase(key) {
  if (baseMeshes[key]) return baseMeshes[key];
  const d = BASE_DEFS[key];
  const m = rectPlane(d.rect, d.scale, GROUND_Y, new THREE.MeshStandardMaterial({ map: loadTex('./' + d.file), roughness: 1, metalness: 0 }));
  m.receiveShadow = true;
  m.visible = false;
  layerGroup.add(m);
  baseMeshes[key] = m;
  return m;
}
// overlays: the /lot stack, its names, order and defaults
const OV_DEFS = [
  { key: 'interior', file: '11-floor-plan-house.png', rect: PLAN_RECT, ord: 4, on: true },
  { key: 'exterior', file: '12-floor-plan-pool.png', rect: PLAN_RECT, ord: 5, on: true },
  { key: 'property', file: '03-property-lines.png', detail: '03-property-lines-detail.png', rect: LOT_FRAME, ord: 6, on: true },
  { key: 'surveylines', file: '08-survey-lines.png', rect: DETAIL_RECT, ord: 7, on: false },
  { key: 'surveydata', file: '09-survey-data.png', rect: DETAIL_RECT, ord: 8, on: false },
  { key: 'flood', file: '04-flood-lines-2026.png', detail: '04-flood-lines-2026-detail.png', rect: LOT_FRAME, ord: 10, on: false },
  { key: 'floodmap', file: '06-fema-map-2026.png', rect: LOT_FRAME, ord: 11, on: false },
  { key: 'floodold', file: '05-flood-lines-previous.png', detail: '05-flood-lines-previous-detail.png', rect: LOT_FRAME, ord: 12, on: false },
  { key: 'floodmapold', file: '07-fema-map-previous.png', rect: LOT_FRAME, ord: 13, on: false },
  { key: 'street', file: '01-street-map.png', rect: LOT_FRAME, ord: 14, on: false },
  { key: 'highlight', file: '10-lot-highlight.png', detail: '10-lot-highlight-detail.png', rect: LOT_FRAME, ord: 15, on: false },
  { key: 'mhside', file: '14-measurements-house-side.png', detail: '14-measurements-house-side-detail.png', rect: LOT_FRAME, ord: 20, on: false },
  { key: 'mhback', file: '15-measurements-house-back.png', detail: '15-measurements-house-back-detail.png', rect: LOT_FRAME, ord: 21, on: false },
  { key: 'mhfront', file: '16-measurements-house-front.png', detail: '16-measurements-house-front-detail.png', rect: LOT_FRAME, ord: 22, on: false },
  { key: 'mhcorner', file: '17-measurements-house-corner.png', detail: '17-measurements-house-corner-detail.png', rect: LOT_FRAME, ord: 23, on: false },
  { key: 'meside', file: '18-measurements-enclosure-side.png', detail: '18-measurements-enclosure-side-detail.png', rect: LOT_FRAME, ord: 24, on: false },
  { key: 'meback', file: '19-measurements-enclosure-back.png', detail: '19-measurements-enclosure-back-detail.png', rect: LOT_FRAME, ord: 25, on: false },
  { key: 'mecorner', file: '20-measurements-enclosure-corner.png', detail: '20-measurements-enclosure-corner-detail.png', rect: LOT_FRAME, ord: 26, on: false }
];
for (const d of OV_DEFS) state.ov[d.key] = d.on;
// The two survey sheets are 8640x12000 each; decoding and uploading one on
// the first click stalls the view for seconds. Load and upload them in the
// background once the viewer is up, one at a time, so the first click on
// Survey lines or Survey data is instant like every other layer.
function preloadSurvey() {
  const keys = ['surveylines', 'surveydata'];
  const step = (i) => {
    if (i >= keys.length) return;
    const d = OV_DEFS.find(x => x.key === keys[i]); if (!d) return;
    const url = './layers/' + d.file;
    if (texCache[url]) { step(i + 1); return; }
    texCache[url] = loadTex(url, true, (tex) => {
      try { renderer.initTexture(tex); } catch (e) { /* first render uploads it instead */ }
      setTimeout(() => step(i + 1), 1200);
    });
  };
  step(0);
}
const ovMeshes = {};
function layerY(d) { return (d.key === 'interior' || d.key === 'exterior') ? 0.02 : 0.012 + d.ord * 0.0012; }
function ensureOverlay(d) {
  if (ovMeshes[d.key]) return ovMeshes[d.key];
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: getTex('./layers/' + d.file), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
  const m = rectPlane(d.rect, MPP_LOT, layerY(d), mat);
  m.renderOrder = 10 + d.ord;
  g.add(m);
  if (d.detail) {
    const dm = rectPlane(DETAIL_RECT, MPP_LOT, layerY(d) + 0.0006, new THREE.MeshBasicMaterial({ map: getTex('./layers/' + d.detail), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    dm.renderOrder = 10 + d.ord + 0.5;
    g.add(dm);
  }
  g.visible = false;
  layerGroup.add(g);
  ovMeshes[d.key] = g;
  return g;
}
function applyLayers() {
  for (const k of Object.keys(baseMeshes)) baseMeshes[k].visible = false;
  if (state.sat) ensureBase(state.base).visible = true;
  for (const d of OV_DEFS) {
    if (state.ov[d.key]) ensureOverlay(d).visible = true;
    else if (ovMeshes[d.key]) ovMeshes[d.key].visible = false;
  }
  invalidate();
}
function layerFitPts() {
  if (!state.sat && !OV_DEFS.some((d) => state.ov[d.key])) return [];
  const [fx, fy, w, h] = LOT_FRAME;
  return [[fx, fy], [fx + w, fy], [fx + w, fy + h], [fx, fy + h]].map(([x, y]) => {
    const [wx, wz] = worldFromMaster(x, y);
    return new THREE.Vector3(wx, 0, wz);
  });
}

// ---------------------------------------------------------------- model
const groups = { site: [], f1: [], f2: [], roof_lower: [], roof_upper: [], pool: [], nopool: [] };
const boxPts = (u0, v0, z0, u1, v1, z1) => [0, 1, 2, 3, 4, 5, 6, 7].map((i) => P(i & 1 ? u1 : u0, i & 2 ? v1 : v0, i & 4 ? z1 : z0));
const HULL = {
  exterior: [...boxPts(-1, -1, 0, 84, 55, 12), ...boxPts(20, -1, 12, 50, 55, 22.5), ...boxPts(46, 12, 12, 84, 50, 15.5), ...boxPts(27, 6, 22.5, 42, 48, 27.8)],
  upper: [...boxPts(-1, -1, 0, 84, 55, 12), ...boxPts(20, -1, 12, 50, 55, 22), ...boxPts(46, 12, 12, 84, 50, 15.5)],
  main: boxPts(-1, -1, 0, 84, 55, 11.4)
};
const POOL_PTS = boxPts(-26, -1, 0, 5, 55, 11.4);
const POOL_VIEW_PTS = boxPts(-26, -1, 0, 14, 55, 11.5);
const DIM_PTS = [P(88, 58.5, 0), P(88, 58.5, 28.5)];
const MW = (p) => p.clone().applyMatrix4(modelGroup.matrixWorld);
function applyLawn() {
  if (lawnSlab) lawnSlab.visible = state.lawn;
  if (lawnPatch) lawnPatch.visible = state.lawn && !state.pool;
}
function lawnPatchOutline() {
  // Boundary loop of the lawn patch's top face, in model coords (x, z): the
  // outline of the cut-out the model's own lawn leaves over the pool water.
  const p = LAWN_PATCH.p, TOP = -0.1006, edges = new Map();
  const key = (x, z) => x.toFixed(4) + ',' + z.toFixed(4);
  for (let i = 0; i < p.length; i += 9) {
    const t = [p[i], p[i + 1], p[i + 2], p[i + 3], p[i + 4], p[i + 5], p[i + 6], p[i + 7], p[i + 8]];
    if (Math.abs(t[1] - TOP) > 1e-4 || Math.abs(t[4] - TOP) > 1e-4 || Math.abs(t[7] - TOP) > 1e-4) continue;
    const pts = [[t[0], t[2]], [t[3], t[5]], [t[6], t[8]]];
    for (let e = 0; e < 3; e++) {
      const a = pts[e], b = pts[(e + 1) % 3];
      const k = [key(a[0], a[1]), key(b[0], b[1])].sort().join('|');
      edges.set(k, (edges.get(k) || 0) + 1);
    }
  }
  const adj = new Map();
  for (const [k, c] of edges) {
    if (c !== 1) continue;
    const [a, b] = k.split('|');
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push(b); adj.get(b).push(a);
  }
  if (!adj.size) return [];
  const start = adj.keys().next().value, loop = [start];
  let prev = null, cur = start;
  for (let guard = 0; guard < 1000; guard++) {
    const nxt = (adj.get(cur) || []).find(n => n !== prev);
    if (!nxt || nxt === start) break;
    loop.push(nxt); prev = cur; cur = nxt;
  }
  return loop.map(s => s.split(',').map(Number));
}
function buildLawnSlab(lawnMesh) {
  // The model's grass, re-laid to the surveyed lot lines exactly: a slab with
  // the lot polygon as its outline, the lawn's own top height and thickness,
  // and the lawn's own material, its texture placed by the same planar fit
  // the model's lawn uses, so the grass grain matches.
  const posA = lawnMesh.geometry.getAttribute('position');
  const uvA = lawnMesh.geometry.getAttribute('uv');
  // least squares fit: uv = a + b*x + c*z over the lawn's own vertices
  let n = 0, sx = 0, sz = 0, su = 0, sv = 0, sxx = 0, szz = 0, sxz = 0, sxu = 0, szu = 0, sxv = 0, szv = 0;
  const step = Math.max(1, Math.floor(posA.count / 4000));
  for (let i = 0; i < posA.count; i += step) {
    const x = posA.getX(i), z = posA.getZ(i), u = uvA.getX(i), v = uvA.getY(i);
    n++; sx += x; sz += z; su += u; sv += v; sxx += x * x; szz += z * z; sxz += x * z; sxu += x * u; szu += z * u; sxv += x * v; szv += z * v;
  }
  const A = [[n, sx, sz], [sx, sxx, sxz], [sz, sxz, szz]];
  const solve = (b) => {
    const M = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < 3; c++) {
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < 3; r++) { if (r === c) continue; const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
  };
  const fu = solve([su, sxu, szu]), fv = solve([sv, sxv, szv]);
  const shape = new THREE.Shape();
  LOT_WORLD.forEach(([x, z], i) => { if (i === 0) shape.moveTo(x, -z); else shape.lineTo(x, -z); });
  shape.closePath();
  // The pool opening: the model's own lawn is cut away over the pool water
  // (the lawn patch fills that cut-out while the pool is off), and the slab
  // keeps the same opening. Without it the slab's top, which sits above the
  // water surface, covers the pool with grass.
  modelGroup.updateMatrixWorld(true);
  const holePts = lawnPatchOutline();
  if (holePts.length > 2) {
    const hole = new THREE.Path();
    holePts.forEach(([mx, mz], i) => {
      const w = new THREE.Vector3(mx, 0, mz).applyMatrix4(modelGroup.matrixWorld);
      if (i === 0) hole.moveTo(w.x, -w.z); else hole.lineTo(w.x, -w.z);
    });
    hole.closePath();
    shape.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3048, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, lawnMesh.material);
  mesh.position.y = -0.4054; // slab spans y -0.4054..-0.1006, the lawn's own thickness and top
  mesh.receiveShadow = true;
  // UVs: world -> model space (inverse group transform), then the fitted map
  const inv = new THREE.Matrix4().copy(modelGroup.matrixWorld).invert();
  const p = geo.getAttribute('position');
  const uv = new Float32Array(p.count * 2);
  const v3t = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v3t.set(p.getX(i), p.getY(i) + mesh.position.y, p.getZ(i)).applyMatrix4(inv);
    uv[i * 2] = fu[0] + fu[1] * v3t.x + fu[2] * v3t.z;
    uv[i * 2 + 1] = fv[0] + fv[1] * v3t.x + fv[2] * v3t.z;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return mesh;
}
function loadModel() {
  new GLTFLoader().load('./model.glb?v=24', (gltf) => {
    modelGroup = new THREE.Group();
    modelGroup.rotation.y = THREE.MathUtils.degToRad(-15.8323);
    modelGroup.position.set(-16.706, 0, 2.648);
    modelGroup.add(gltf.scene);
    scene.add(modelGroup);
    modelGroup.updateMatrixWorld(true);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const POF = +(new URLSearchParams(location.search).get('pof') ?? 1);
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
        mat.side = THREE.FrontSide; mat.shadowSide = THREE.DoubleSide;
        o.castShadow = m === 'spatile'; o.receiveShadow = true;
      } else {
        o.castShadow = m !== 'lawn' && m !== 'foam'; o.receiveShadow = true;
        mat.side = THREE.DoubleSide; mat.shadowSide = THREE.DoubleSide;
        if (g === 'f1' || g === 'f2') { mat.polygonOffset = true; mat.polygonOffsetFactor = POF; mat.polygonOffsetUnits = 0; }
      }
    });
    const lawn = gltf.scene.getObjectByName('site__lawn');
    if (lawn) {
      lawn.visible = false; // replaced by the lot-lines slab below
      lawn.userData.keepHidden = true; // the mode/group pass must never reshow it
      lawnSlab = buildLawnSlab(lawn);
      scene.add(lawnSlab);
      if (LAWN_PATCH) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(LAWN_PATCH.p, 3));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(LAWN_PATCH.n, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(LAWN_PATCH.uv, 2));
        const patch = new THREE.Mesh(geo, lawn.material);
        patch.receiveShadow = true; patch.visible = false;
        lawnPatch = patch;
        gltf.scene.add(patch); groups.nopool.push(patch);
      }
    }
    // --- viewer-side corrections (source model untouched) ----------------
    // 1) Solid wall where the source model leaves the Cafe's east wall open
    const stuccoObj = gltf.scene.getObjectByName('f1__stucco');
    let stuccoMat = null;
    if (stuccoObj) stuccoObj.traverse((o) => { if (!stuccoMat && o.isMesh) stuccoMat = o.material; });
    if (stuccoMat) {
      const wallPatch = new THREE.Mesh(new THREE.BoxGeometry(0.85 * FT, 11.333 * FT, 8.2 * FT), stuccoMat);
      wallPatch.position.set((54 - 0.375) * FT, (11.333 * FT) / 2, (9.5 - 83) * FT);
      wallPatch.castShadow = true; wallPatch.receiveShadow = true;
      wallPatch.name = 'viewer__east_wall_patch';
      wallPatchMesh = wallPatch;
      gltf.scene.add(wallPatch);
    }
    // 2) Pool enclosure raised to 11'-0" (source cage tops out at 10.48 ft)
    const CAGE_RAISE = 11.0 / 10.48;
    for (const n of ['pool__cage', 'pool__screen']) {
      const o = gltf.scene.getObjectByName(n);
      if (o) o.scale.y = CAGE_RAISE;
    }
    dimGroupInit();
    setMode(state.mode, false);
    applyLayers();
    document.getElementById('loading').classList.add('done');
    setView('hero', true);
    invalidate(4, true);
    window.__viewer.ready = true;
    if (!constrained) setTimeout(preloadSurvey, 2500);
  }, undefined, (err) => {
    document.getElementById('loading-text').textContent = 'The model could not be loaded.';
    document.querySelector('.spinner').style.display = 'none';
    console.error(err);
  });
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
const dimLabels = [];
let allLabels = [...roomLabels];
const v3 = new THREE.Vector3();
function updateLabels() {
  if (!modelGroup) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  const placed = [];
  const cand = [];
  for (const l of allLabels) {
    const isDim = l.el.classList.contains('dim');
    let want = isDim ? state.dims : (state.labels && (!l.pool || state.pool) && ((state.mode === 'main' && l.floor === 1) || (state.mode === 'upper' && l.floor === 2)));
    if (want) {
      v3.copy(l.pos).applyMatrix4(modelGroup.matrixWorld).project(camera);
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

// ---------------------------------------------------------------- dimensions (model space, child of the model group)
let dimGroup = null;
function dimGroupInit() {
  if (dimGroup) return;
  dimGroup = new THREE.Group(); dimGroup.visible = false;
  modelGroup.add(dimGroup);
  const dimLine = (a, b, text, tickDir) => {
    const pts = [a, b];
    const t = tickDir.clone().multiplyScalar(0.45);
    for (const p of [a, b]) pts.push(p.clone().sub(t), p.clone().add(t));
    const g = new THREE.BufferGeometry().setFromPoints([pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]]);
    dimGroup.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x1d2a3b })));
    if (text) dimLabels.push(makeLabel(text, null, a.clone().lerp(b, 0.5), 'dim', 20));
  };
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
  allLabels = [...roomLabels, ...dimLabels];
}

// ---------------------------------------------------------------- camera views
const VIEWS = {
  hero: { dir: [-0.52, 0.2, 0.83], box: 'full' },
  front: { dir: [0, 0.07, 1], box: 'full' },
  left: { dir: [-1, 0.1, 0], box: 'full' },
  rear: { dir: [0.0, 0.1, -1], box: 'full' },
  right: { dir: [1, 0.1, 0], box: 'full' },
  top: { dir: [0, 1, 0.0015], box: 'full' },
  bird: { dir: [0, 1, 0.0015], box: 'bird' },
  plan: { dir: [-0.22, 0.86, 0.46], box: 'mode' },
  pool: { dir: [0.5, 0.62, -0.6], box: 'pool' }
};
const ELEV_VIEWS = ['front', 'left', 'rear', 'right'];
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
  const v = VIEWS[name]; if (!v || !modelGroup) return;
  lastView = name;
  swapCamera((state.elev && ELEV_VIEWS.includes(name)) || name === 'bird');
  if (v.box === 'pool' && !state.pool) { state.pool = true; document.getElementById('t-pool').checked = true; setMode(state.mode, false); }
  const hull = HULL[state.mode].map(MW);
  const lotPts = LOT_WORLD.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const pts = v.box === 'pool' ? POOL_VIEW_PTS.map(MW)
    : v.box === 'bird' ? [...layerFitPts(), ...hull]
    : v.box === 'mode' ? [...hull, ...(state.dims ? DIM_PTS.map(MW) : []), ...(state.pool ? POOL_PTS.map(MW) : []), ...lotPts]
    : [...hull, ...(state.dims ? DIM_PTS.map(MW) : []), ...(state.pool ? POOL_PTS.map(MW) : [])];
  const { pos, target, H } = fit(v.dir, pts);
  if (instant || reduceMotion) {
    camera.position.copy(pos); controls.target.copy(target);
    if (H) setOrthoFrustum(H);
    controls.update(); tween = null; invalidate(3); return;
  }
  const H0 = camera.isOrthographicCamera ? (camera.top - camera.bottom) / camera.zoom : null;
  tween = { t0: performance.now(), dur: 900, p0: camera.position.clone(), p1: pos, q0: controls.target.clone(), q1: target, H0, H1: H };
  invalidate(3);
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
  const show = { site: true, f1: state.house, f2: state.house && mode !== 'main', roof_lower: state.house && mode !== 'main', roof_upper: state.house && mode === 'exterior', pool: state.pool, nopool: !state.pool };
  for (const [g, arr] of Object.entries(groups)) for (const o of arr) o.visible = show[g] && !o.userData.keepHidden;
  if (wallPatchMesh) wallPatchMesh.visible = state.house;
  applyLawn();
  invalidate(3, true);
  document.querySelectorAll('.segmented button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  if (moveCamera) setView(mode === 'exterior' ? 'hero' : 'plan');
}

// ---------------------------------------------------------------- sun controls
const sunState = { date: '2026-11-23', mins: 690 };
const fmtClock = (mins) => {
  if (mins === null || mins === undefined || isNaN(mins)) return '--:--';
  const m = Math.round(mins);
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
function applySun() {
  const [y, mo, d] = sunState.date.split('-').map(Number);
  const { alt, az } = sunPosition(y, mo, d, sunState.mins);
  const altr = alt * RAD, azr = az * RAD;
  const dir = new THREE.Vector3(Math.cos(altr) * Math.sin(azr), Math.sin(altr), -Math.cos(altr) * Math.cos(azr));
  sun.position.copy(CENTRE).addScaledVector(dir, 170);
  const day = Math.max(0, Math.sin(altr));
  sun.intensity = 3.0 * Math.min(1, day * 3.2);
  hemi.intensity = 0.35 + 0.6 * Math.min(1, day * 1.6 + 0.15);
  const t = sunTimes(y, mo, d);
  document.getElementById('sun-clock').textContent = fmtClock(sunState.mins);
  document.getElementById('sun-facts').textContent =
    'Sunrise ' + fmtClock(t.rise) + ' · Solar noon ' + fmtClock(t.noon) + ' · Sunset ' + fmtClock(t.set) +
    ' · Altitude ' + alt.toFixed(1) + '° · Azimuth ' + az.toFixed(1) + '°';
  invalidate(2, true);
}
const sunDateEl = document.getElementById('sun-date');
const sunTimeEl = document.getElementById('sun-time');
function syncSunInputs() { sunDateEl.value = sunState.date; sunTimeEl.value = sunState.mins; }
sunDateEl.addEventListener('change', () => { sunState.date = sunDateEl.value || sunState.date; stopPlay(); applySun(); });
sunTimeEl.addEventListener('input', () => { sunState.mins = +sunTimeEl.value; stopPlay(); applySun(); });
function setSunMins(m) { sunState.mins = Math.round(m); syncSunInputs(); applySun(); }
document.getElementById('sun-rise').addEventListener('click', () => { const [y, mo, d] = sunState.date.split('-').map(Number); const t = sunTimes(y, mo, d); if (t.rise !== null) setSunMins(t.rise); });
document.getElementById('sun-noon').addEventListener('click', () => { const [y, mo, d] = sunState.date.split('-').map(Number); const t = sunTimes(y, mo, d); if (t.noon !== null) setSunMins(t.noon); });
document.getElementById('sun-set').addEventListener('click', () => { const [y, mo, d] = sunState.date.split('-').map(Number); const t = sunTimes(y, mo, d); if (t.set !== null) setSunMins(t.set); });
document.getElementById('sun-longest').addEventListener('click', () => { sunState.date = sunState.date.slice(0, 4) + '-06-21'; syncSunInputs(); applySun(); });
document.getElementById('sun-shortest').addEventListener('click', () => { sunState.date = sunState.date.slice(0, 4) + '-12-21'; syncSunInputs(); applySun(); });
let playTimer = null, playKind = null;
function stopPlay() {
  if (playTimer) clearInterval(playTimer);
  playTimer = null; playKind = null;
  document.getElementById('sun-playday').textContent = 'Play day';
  document.getElementById('sun-playyear').textContent = 'Play year';
}
function startPlay(kind, btn, label) {
  if (playKind === kind) { stopPlay(); return; }
  stopPlay();
  playKind = kind;
  btn.textContent = 'Stop';
  playTimer = setInterval(() => {
    if (kind === 'day') {
      sunState.mins += 5;
      if (sunState.mins > 1260) sunState.mins = 300;
    } else {
      const dt = new Date(sunState.date + 'T12:00:00');
      dt.setDate(dt.getDate() + 1);
      sunState.date = dt.toISOString().slice(0, 10);
    }
    syncSunInputs(); applySun();
  }, kind === 'day' ? 60 : 110);
}
document.getElementById('sun-playday').addEventListener('click', (e) => startPlay('day', e.currentTarget));
document.getElementById('sun-playyear').addEventListener('click', (e) => startPlay('year', e.currentTarget));

// ---------------------------------------------------------------- UI wiring
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
document.getElementById('t-house').addEventListener('change', (e) => { state.house = e.target.checked; setMode(state.mode, false); });
document.getElementById('t-pool').addEventListener('change', (e) => { state.pool = e.target.checked; setMode(state.mode, false); });
document.getElementById('t-lawn').addEventListener('change', (e) => { state.lawn = e.target.checked; applyLawn(); invalidate(); });
document.getElementById('t-labels').addEventListener('change', (e) => { state.labels = e.target.checked; invalidate(); });
document.getElementById('t-dims').addEventListener('change', (e) => { state.dims = e.target.checked; if (dimGroup) dimGroup.visible = state.dims; invalidate(); });
document.getElementById('t-elev').addEventListener('change', (e) => { state.elev = e.target.checked; setView(lastView); });
document.getElementById('t-spin').addEventListener('change', (e) => { state.spin = e.target.checked; controls.autoRotate = state.spin; invalidate(); });
document.getElementById('t-sat').addEventListener('change', (e) => { state.sat = e.target.checked; applyLayers(); });
document.querySelectorAll('#seg-variant button').forEach((b) => b.addEventListener('click', () => {
  state.base = b.dataset.v;
  document.querySelectorAll('#seg-variant button').forEach((x) => x.classList.toggle('on', x === b));
  applyLayers();
}));
for (const d of OV_DEFS) {
  const el = document.getElementById('t-ov-' + d.key);
  if (el) el.addEventListener('change', (e) => { state.ov[d.key] = e.target.checked; applyLayers(); });
}
function setAllLayers(on) {
  state.sat = on; document.getElementById('t-sat').checked = on;
  for (const d of OV_DEFS) { state.ov[d.key] = on; const el = document.getElementById('t-ov-' + d.key); if (el) el.checked = on; }
  applyLayers();
}
document.querySelectorAll('.sec').forEach((sec) => {
  const tog = sec.querySelector('.sec-toggle');
  if (tog) tog.addEventListener('click', () => sec.classList.toggle('closed'));
  const switches = [...sec.querySelectorAll('input[id^="t-ov-"]')];
  if (!switches.length) return;
  const head = sec.querySelector('.sec-head');
  const mk = (label, on) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sec-all'; b.textContent = label; b.addEventListener('click', () => { switches.forEach((el) => { if (el.checked !== on) el.click(); }); }); head.appendChild(b); };
  mk('Show', true); mk('Hide', false);
});
document.getElementById('layers-all').addEventListener('click', () => setAllLayers(true));
document.getElementById('layers-none').addEventListener('click', () => setAllLayers(false));
document.getElementById('layers-reset').addEventListener('click', () => {
  stopPlay();
  state.house = state.pool = state.lawn = state.labels = true;
  state.dims = state.elev = state.spin = false;
  for (const [id, v] of [['t-house', 1], ['t-pool', 1], ['t-lawn', 1], ['t-labels', 1], ['t-dims', 0], ['t-elev', 0], ['t-spin', 0]]) document.getElementById(id).checked = !!v;
  controls.autoRotate = false;
  if (dimGroup) dimGroup.visible = false;
  state.sat = true; document.getElementById('t-sat').checked = true;
  state.base = 'render';
  document.querySelectorAll('#seg-variant button').forEach((x) => x.classList.toggle('on', x.dataset.v === 'render'));
  for (const d of OV_DEFS) { state.ov[d.key] = d.on; const el = document.getElementById('t-ov-' + d.key); if (el) el.checked = d.on; }
  sunState.date = '2026-11-23'; sunState.mins = 690; syncSunInputs(); applySun();
  applyLayers();
  setMode('exterior', false);
  setView('hero');
});
document.getElementById('photo').addEventListener('click', () => {
  dirty = Math.max(dirty, 2); renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, camera);
  canvas.toBlob((b) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = 'the-isle-3d-view.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  });
});
document.getElementById('full').addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else stage.requestFullscreen?.();
});
document.getElementById('download').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = './model.glb'; a.download = 'the-isle-3d-model.glb'; a.click();
});
document.getElementById('menu-hide').addEventListener('click', () => {
  if (matchMedia('(max-width: 760px)').matches) { document.getElementById('panel').classList.remove('open'); return; }
  document.body.classList.add('panelhidden'); resize();
});
document.getElementById('menu-show').addEventListener('click', () => {
  if (matchMedia('(max-width: 760px)').matches) { document.getElementById('panel').classList.add('open'); return; }
  document.body.classList.remove('panelhidden'); resize();
});

// ---------------------------------------------------------------- frame loop
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  persp.aspect = w / h; persp.updateProjectionMatrix();
  ortho.aspect = w / h; ortho.updateProjectionMatrix();
  invalidate();
}
new ResizeObserver(resize).observe(stage);
window.addEventListener('resize', resize);
function frame(now) {
  requestAnimationFrame(frame);
  if (tween) { stepTween(now); dirty = Math.max(dirty, 2); }
  if (controls.autoRotate) dirty = Math.max(dirty, 2);
  if (dirty > 0) {
    controls.update();
    renderer.render(scene, camera);
    updateLabels();
    dirty--;
  }
}
window.__viewer = { ready: false, state, setMode, setView, invalidate, get camera() { return camera; }, get controls() { return controls; } };
resize();
syncSunInputs();
applySun();
loadModel();
requestAnimationFrame(frame);
