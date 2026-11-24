import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* Rebuild sample, Nov 24, 2026. Scene construction follows the /shadow page:
   a PlaneGeometry ground with a standard texture, world axes +X east and
   +Z south (north at -Z), and every placed item carried in a local frame of
   metres from the ground texture's top-left corner. The sun engine is the
   /shadow page's own NOAA code, unchanged. The model is layered in as one
   rigid group: rotation.y and position from the measured fit recorded in
   REBUILD-SPEC.md. The model file itself is untouched. */

/* ---------------- NOAA solar position (from /shadow, unchanged) ---------------- */
var LAT = 28.1773, LON = -82.2341;

function dayOfYear(y, m, d) {
  var start = Date.UTC(y, 0, 1);
  return Math.round((Date.UTC(y, m - 1, d) - start) / 86400000) + 1;
}
function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
function nthSunday(y, month, n) {
  var first = new Date(Date.UTC(y, month, 1));
  var dow = first.getUTCDay();
  return 1 + ((7 - dow) % 7) + (n - 1) * 7;
}
function tzOffsetHours(y, m, d) {
  var startDay = nthSunday(y, 2, 2);
  var endDay = nthSunday(y, 10, 1);
  if (m < 3 || m > 11) return -5;
  if (m > 3 && m < 11) return -4;
  if (m === 3) return d >= startDay ? -4 : -5;
  return d < endDay ? -4 : -5;
}
function sunPosition(y, mo, d, hourLocal) {
  var doy = dayOfYear(y, mo, d);
  var daysInYear = isLeap(y) ? 366 : 365;
  var gamma = 2 * Math.PI / daysInYear * (doy - 1 + (hourLocal - 12) / 24);
  var eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
  var decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
  var tz = tzOffsetHours(y, mo, d);
  var timeOffset = eqtime + 4 * LON - 60 * tz;
  var tst = hourLocal * 60 + timeOffset;
  var haDeg = tst / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  if (haDeg > 180) haDeg -= 360;
  var ha = haDeg * Math.PI / 180;
  var lat = LAT * Math.PI / 180;
  var cosZen = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  cosZen = Math.max(-1, Math.min(1, cosZen));
  var alt = 90 - Math.acos(cosZen) * 180 / Math.PI;
  var az = Math.atan2(Math.sin(ha),
    Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) * 180 / Math.PI + 180;
  return { alt: alt, az: (az + 360) % 360 };
}

/* ---------------- Scene (the /shadow pattern) ---------------- */
var container = document.getElementById('scene');
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xdfe7ea);
var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);

var controls = new OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 8;
controls.maxDistance = 400;

var ambient = new THREE.AmbientLight(0xbfd0e0, 0.55);
scene.add(ambient);
var sun = new THREE.DirectionalLight(0xfff2dd, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -95; sun.shadow.camera.right = 95;
sun.shadow.camera.top = 95; sun.shadow.camera.bottom = -95;
sun.shadow.camera.near = 10; sun.shadow.camera.far = 420;
sun.shadow.bias = -0.0006;
sun.shadow.radius = 3;
scene.add(sun);
scene.add(sun.target);

/* Ground: the /shadow satellite crop, 1900 px by 1800 px at 0.0658 m per px,
   centred on the world origin, texture north at -Z. Its height is -0.1306 m
   so the model lawn's top (y = -0.1006 m in the model) stands 0.03 m proud. */
var GROUND_W = 1900 * 0.0658, GROUND_D = 1800 * 0.0658;
var groundTex = new THREE.TextureLoader().load('ground.jpg');
groundTex.colorSpace = THREE.SRGBColorSpace;
groundTex.anisotropy = 8;
var ground = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND_W, GROUND_D),
  new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1306;
ground.receiveShadow = true;
scene.add(ground);

/* The house centre in world coords, from the spec's local frame:
   local (56.96, 47.28) -> world (-5.55, -11.94). */
var CENTRE = new THREE.Vector3(-5.55, 0, -11.94);
controls.target.copy(CENTRE);

/* ---------------- The model, layered in ---------------- */
window.__sample = { ready: false };
new GLTFLoader().load('model.glb', (gltf) => {
  var model = gltf.scene;
  model.rotation.y = -15.8323 * Math.PI / 180;
  model.position.set(-16.706, 0, 2.648);
  model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(model);
  window.__sample.ready = true;
});

/* Sun for the sample: Nov 23, 2026, 11:30 local, the /shadow placement. */
function placeSun() {
  var sp = sunPosition(2026, 11, 23, 11.5);
  var altR = sp.alt * Math.PI / 180, azR = sp.az * Math.PI / 180;
  var dir = new THREE.Vector3(
    Math.cos(altR) * Math.sin(azR),
    Math.sin(altR),
    -Math.cos(altR) * Math.cos(azR)
  );
  sun.position.copy(CENTRE).addScaledVector(dir, 180);
  sun.target.position.copy(CENTRE);
  sun.intensity = sp.alt > 0 ? 2.6 : 0;
}
placeSun();

/* ---------------- Views ---------------- */
function setView(name) {
  document.getElementById('v-top').classList.toggle('on', name === 'top');
  document.getElementById('v-hero').classList.toggle('on', name === 'hero');
  if (name === 'top') {
    camera.up.set(0, 0, -1);
    camera.position.set(CENTRE.x, 105, CENTRE.z + 0.01);
  } else {
    camera.up.set(0, 1, 0);
    camera.position.set(CENTRE.x - 34, 30, CENTRE.z + 52);
  }
  controls.target.copy(CENTRE);
  controls.update();
}
document.getElementById('v-top').addEventListener('click', () => setView('top'));
document.getElementById('v-hero').addEventListener('click', () => setView('hero'));
setView('top');

function resize() {
  var w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

renderer.setAnimationLoop(() => renderer.render(scene, camera));
