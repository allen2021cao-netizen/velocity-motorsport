import {surfaceFeedback,gripFeedback} from './driving-feedback';
import {resolveContacts} from './race-contact';
import {freshTactics,tacticalPlan,PERSONALITIES} from './race-tactics';
import {allFinished,crossingTime} from './race-finish';
import {RenderMotion} from './render-motion';
import {drivingCue,mountDrivingCue} from './driving-cue';
import {AdaptiveQuality} from './adaptive-quality';
import {EnvironmentDetail} from './environment/detail';
import {mountRaceTiming,CheckpointTiming,raceOrder} from './race-timing';
import {mountExperience} from './experience';
import {createCityShowcase} from './environment/showcase';
import {createTrackCurve,CIRCUITS,circuitCurvature} from './circuits/circuit';
import {buildCircuitVenue} from './circuits/venue';
import {RaceAudio} from './race-audio';
import {cameraPose} from './camera-rig';
import {createVehicleOrbit} from './vehicle-orbit';
import {mountDrivingHelp} from './driving-help';
import {mountMenu} from './menu';
import {DIFFICULTIES,aiTargetSpeed,stepOpponent,freshDriver,roadCurvature,matchedOpponents,drivingCurvature,opponentPit} from './race-ai';
import {buildAutomobile} from './automotive/model';
import * as THREE from 'three';
import {ensureDetailedCar,DETAILED_VEHICLES} from './detailed-vehicles';
import {CARS} from './cars.js';
import {TRACKS,timeIcon} from './tracks.js';
import {stepVehicle,readGamepad} from './physics';
import {Session,options,mountSetup} from './session';
import {setupGraphics} from './graphics';
import {Atmosphere} from './environment/atmosphere';
import {RoadSurfaces} from './environment/materials';
import {buildCity,animateCity} from './environment/city';
import {CITY_PROFILES} from './environment/profiles';
'use strict';
if (typeof THREE === 'undefined') {
  document.getElementById('loadErr').style.display = 'flex';
  throw new Error('THREE not loaded');
}

/* ================================================================
   地下狂飙 UNDERGROUND VELOCITY 手机版 — 8赛道 · 4难度 · 触屏
   ================================================================ */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const TAU = Math.PI * 2;
function fmt(t) {
  if (t == null || !isFinite(t)) return '--:--.---';
  const m = Math.floor(t / 60), s = Math.floor(t % 60), ms = Math.floor((t % 1) * 1000);
  return m + ':' + String(s).padStart(2, '0') + '.' + String(ms).padStart(3, '0');
}
let rndSeed = 12345;
const rnd = () => { rndSeed = (rndSeed * 16807) % 2147483647; return rndSeed / 2147483647; };

// ---------------- 车辆 ----------------
// ---------------- 难度 ----------------
// 难度标定(第一名胜率):简单~99% / 普通~80% / 困难~50% / 传奇~15%
// Difficulty changes driver decisions; vehicle performance never depends on player pace.
const DIFFS = DIFFICULTIES;
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); }


// ---------------- 赛道 ----------------
// 12条赛道形状经旋转/镜像相关性优化,两两相似度≤0.83,条条独特
// ---------------- 渲染器(移动端优化) ----------------
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, 0.1, 2200);
camera.position.set(0, 4, 12);

const ambient = new THREE.AmbientLight(0x3a4060, .85); scene.add(ambient);
const hemi = new THREE.HemisphereLight(0x2a3555, 0x0a0c14, .5); scene.add(hemi);
const sunLight = new THREE.DirectionalLight(0x8899cc, .35);
sunLight.position.set(-200, 300, 100); scene.add(sunLight);
const graphics=setupGraphics(renderer,scene,camera,sunLight);
const atmosphere=new Atmosphere(renderer,scene,sunLight,ambient,hemi);
const surfaces=new RoadSurfaces();
let cityReport=null,tourAngle=0,cityShowcase=null,tourTime=0;
const session=new Session();
const renderMotion=new RenderMotion();
const environmentDetail=new EnvironmentDetail();
const drivingCoach=mountDrivingCue();
let currentCue=null,cueTick=0,renderAlpha=1;
let wetness=0;

// ---------------- 程序纹理 ----------------
function canvasTex(w, h, fn, wrap) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  if (wrap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
const glowTex = canvasTex(128, 128, (g, w, h) => {
  const r = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, h);
});
// —— 场景美化辅助:调色 / 云朵纹理 ——
function shadeCol(hex, f) {
  const r = clamp(((hex >> 16) & 255) * f, 0, 255) | 0;
  const g2 = clamp(((hex >> 8) & 255) * f, 0, 255) | 0;
  const b = clamp((hex & 255) * f, 0, 255) | 0;
  return (r << 16) | (g2 << 8) | b;
}
function mixCol(a, b, t) {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (((ar + (br - ar) * t) | 0) << 16) | (((ag + (bg - ag) * t) | 0) << 8) | ((ab + (bb - ab) * t) | 0);
}
const hex6 = c => '#' + ('00000' + c.toString(16)).slice(-6);
// 写实积云:平坦阴影底 + 蓬松亮顶
const cloudTex = canvasTex(256, 128, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const baseY = h * .62;
  const sh = g.createRadialGradient(w / 2, baseY, 8, w / 2, baseY, w * .42);
  sh.addColorStop(0, 'rgba(185,196,212,.55)'); sh.addColorStop(1, 'rgba(185,196,212,0)');
  g.fillStyle = sh; g.beginPath(); g.ellipse(w / 2, baseY, w * .4, h * .16, 0, 0, TAU); g.fill();
  for (let i = 0; i < 14; i++) {
    const x = w * .15 + Math.random() * w * .7;
    const y = baseY - Math.random() * h * .34;
    const r = 12 + Math.random() * 22;
    const gr = g.createRadialGradient(x, y - r * .3, 1, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,.95)');
    gr.addColorStop(.6, 'rgba(245,248,252,.55)');
    gr.addColorStop(1, 'rgba(245,248,252,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
});
function shadeHexStr(hex, f) { return hex6(shadeCol(parseInt(hex.slice(1), 16), f)); }
// 镂空钢架纹理(埃菲尔/东京塔)
const latticeTex = (() => {
  const t = canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.92)'; g.lineWidth = 3.5;
    for (let i = -h; i < w + h; i += 16) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke();
      g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke();
    }
    g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 2); g.lineTo(w, 2); g.stroke();
    g.beginPath(); g.moveTo(0, h - 2); g.lineTo(w, h - 2); g.stroke();
  }, true);
  t.repeat.set(6, 8);
  return t;
})();
// 大本钟表盘
const clockTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#2a2318'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f6ecd2'; g.beginPath(); g.arc(64, 64, 54, 0, TAU); g.fill();
  g.strokeStyle = '#8a7434'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 54, 0, TAU); g.stroke();
  g.strokeStyle = '#3a3020'; g.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    g.beginPath();
    g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44);
    g.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50);
    g.stroke();
  }
  g.lineWidth = 4;
  g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 30); g.stroke();
  g.beginPath(); g.moveTo(64, 64); g.lineTo(86, 72); g.stroke();
  g.fillStyle = '#3a3020'; g.beginPath(); g.arc(64, 64, 4, 0, TAU); g.fill();
});
function makeRoadTex(day, lineColor) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = day ? '#3f434c' : '#14161c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      const v = day ? 60 + Math.random() * 40 : 20 + Math.random() * 34;
      g.fillStyle = 'rgba(' + (v | 0) + ',' + (v + 4 | 0) + ',' + (v + 10 | 0) + ',.5)';
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
    g.fillStyle = day ? '#eef0f4' : '#c8cdd6'; g.fillRect(10, 0, 5, h); g.fillRect(w - 15, 0, 5, h);
    g.fillStyle = lineColor;
    for (let y = 0; y < h; y += 64) { g.fillRect(w / 2 - 7, y, 5, 34); g.fillRect(w / 2 + 3, y, 5, 34); }
  }, true);
}
// 写实夜景立面:楼层横梁/窗框/暖冷窗光/窗帘/女儿墙
function facadeNight(colsArr) {
  return canvasTex(256, 512, (g, w, h) => {
    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#161a26'); base.addColorStop(.75, '#10131d'); base.addColorStop(1, '#0a0c13');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 36) { g.fillStyle = 'rgba(255,255,255,.045)'; g.fillRect(0, y, w, 3); }
    for (let y = 10; y < h - 14; y += 36) for (let x = 10; x < w - 14; x += 26) {
      if (Math.random() < .38) {
        const warm = Math.random() < .72;
        const gr = g.createLinearGradient(x, y, x, y + 22);
        gr.addColorStop(0, warm ? '#ffe3ae' : '#c3e3ff');
        gr.addColorStop(1, warm ? '#c9922f' : '#5d88b8');
        g.fillStyle = gr; g.globalAlpha = .55 + Math.random() * .45;
        g.fillRect(x, y, 17, 22); g.globalAlpha = 1;
        if (Math.random() < .35) { g.fillStyle = 'rgba(10,12,18,.75)'; g.fillRect(x, y, 17, 8 + Math.random() * 8); }
      } else {
        g.fillStyle = '#131826'; g.fillRect(x, y, 17, 22);
        g.fillStyle = 'rgba(120,150,200,.06)'; g.fillRect(x, y, 17, 5);
      }
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.strokeRect(x - .5, y - .5, 18, 23);
    }
    g.fillStyle = '#1c2130'; g.fillRect(0, 0, w, 7);
  });
}
// 写实日景立面:天空反射玻璃/窗台阴影/中梃/底部AO
function facadeDay(baseCol, winCol) {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = baseCol; g.fillRect(0, 0, w, h);
    const ao = g.createLinearGradient(0, 0, 0, h);
    ao.addColorStop(0, 'rgba(255,255,255,.10)'); ao.addColorStop(.8, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,.22)');
    g.fillStyle = ao; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    for (let y = 0; y < h; y += 40) { g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(0, y, w, 3); }
    for (let y = 12; y < h - 16; y += 40) for (let x = 10; x < w - 16; x += 28) {
      const gr = g.createLinearGradient(x, y, x, y + 24);
      gr.addColorStop(0, '#cfe2f2'); gr.addColorStop(.45, winCol); gr.addColorStop(1, shadeHexStr(winCol, .7));
      g.fillStyle = gr; g.fillRect(x, y, 18, 24);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, 18, 3);
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.strokeRect(x - .5, y - .5, 19, 25);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + 24, 18, 2);
      g.fillStyle = 'rgba(40,50,60,.5)'; g.fillRect(x + 8, y, 2, 24);
    }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, w, 8);
  });
}
// 写实黄昏立面:高比例暖窗 + 晚霞玻璃反光
function facadeDusk() {
  return canvasTex(256, 512, (g, w, h) => {
    const base = g.createLinearGradient(0, 0, 0, h);
    base.addColorStop(0, '#33283e'); base.addColorStop(1, '#1d1728');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 36) { g.fillStyle = 'rgba(255,190,120,.05)'; g.fillRect(0, y, w, 3); }
    for (let y = 10; y < h - 14; y += 36) for (let x = 10; x < w - 14; x += 26) {
      if (Math.random() < .46) {
        const warm = Math.random() < .85;
        const gr = g.createLinearGradient(x, y, x, y + 22);
        gr.addColorStop(0, warm ? '#ffd9a0' : '#bcd8f8');
        gr.addColorStop(1, warm ? '#b87b28' : '#5878a8');
        g.fillStyle = gr; g.globalAlpha = .5 + Math.random() * .5;
        g.fillRect(x, y, 17, 22); g.globalAlpha = 1;
      } else {
        g.fillStyle = '#241d33'; g.fillRect(x, y, 17, 22);
        g.fillStyle = 'rgba(255,150,80,.10)'; g.fillRect(x, y, 17, 6);
      }
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.5; g.strokeRect(x - .5, y - .5, 18, 23);
    }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, w, 7);
  });
}
function neonSignTex(text, color) {
  return canvasTex(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.font = 'italic bold 64px "Arial Black", Impact, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = color; g.shadowBlur = 26;
    g.fillStyle = color; g.fillText(text, w / 2, h / 2);
    g.shadowBlur = 8; g.fillStyle = '#ffffff'; g.fillText(text, w / 2, h / 2);
  });
}
const bannerTex = canvasTex(1024, 128, (g, w, h) => {
  g.fillStyle = '#0c0e16'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) for (let y = 0; y < 16; y += 8)
    { g.fillStyle = ((x / 32 + y / 8) % 2) ? '#fff' : '#111'; g.fillRect(x, y, 32, 8); g.fillRect(x, h - 16 + y, 32, 8); }
  g.font = 'italic bold 62px "Arial Black", Impact'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = '#b9ff00'; g.shadowBlur = 22; g.fillStyle = '#b9ff00';
  g.fillText('START  //  FINISH', w / 2, h / 2 + 2);
});
const checkerTex = canvasTex(256, 64, (g, w, h) => {
  for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16)
    { g.fillStyle = ((x + y) / 16 % 2) ? '#e8e8e8' : '#101010'; g.fillRect(x, y, 16, 16); }
});

// ---------------- 赛道数据 ----------------
let ROAD_W = 8;
const SAMPLES = 1400;
let curve = null, trackLen = 0, SEG = 1, avgCurveFac = .85;
let sPts = [], sTan = [], sNrm = [], sCurv = [], sDriveCurv = [];
const wrapIdx = i => ((i % SAMPLES) + SAMPLES) % SAMPLES;

function buildTrackData(T) {
  ROAD_W=T.circuit?.halfWidth||8;
  curve=createTrackCurve(T);
  trackLen = curve.getLength();
  sPts = []; sTan = []; sNrm = []; sCurv = [];
  for (let i = 0; i < SAMPLES; i++) {
    const u = i / SAMPLES;
    sPts.push(curve.getPointAt(u));
    const t = curve.getTangentAt(u); t.y = 0; t.normalize();
    sTan.push(t);
    sNrm.push(new THREE.Vector3(-t.z, 0, t.x));
  }
  for (let i = 0; i < SAMPLES; i++) {
    const a = sTan[i], b = sTan[(i + 14) % SAMPLES];
    sCurv.push(Math.acos(clamp(a.dot(b), -1, 1)));
  }
  if(T.circuit)sCurv=circuitCurvature(sTan);
  SEG = trackLen / SAMPLES;
  sDriveCurv=drivingCurvature(sTan);
  // 全程平均过弯系数(用于AI路段节奏归一化,须与AI前瞻公式一致)
  let cfSum = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const cc = Math.max(sCurv[(i + 30) % SAMPLES], sCurv[(i + 60) % SAMPLES], sCurv[i]);
    cfSum += clamp(1.15 - cc * 2.2, .5, 1.15);
  }
  avgCurveFac = cfSum / SAMPLES;
}
function approxLen(T) { return T.circuit?.length||TAU * T.base * 1.06; }

// ---------------- 世界构建 ----------------
let worldGroup = null;
let worldDisposables = [];
let precipSpeed = 45, precipMode = null;
function D_(x) { worldDisposables.push(x); return x; }

function disposeWorld() {
  if (!worldGroup) return;
  scene.remove(worldGroup);
  for (const d of worldDisposables) { if (d && d.dispose) d.dispose(); }
  worldDisposables = [];
  worldGroup = null;
}
function buildStrip(offA, offB, yA, yB, mat) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const j = i % SAMPLES, p = sPts[j], n = sNrm[j];
    pos.push(p.x + n.x * offA, yA, p.z + n.z * offA, p.x + n.x * offB, yB, p.z + n.z * offB);
    uv.push(0, i / SAMPLES * 260, 1, i / SAMPLES * 260);
  }
  for (let i = 0; i < SAMPLES; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  const geo = D_(new THREE.BufferGeometry());
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo, mat);mesh.receiveShadow=true;return mesh;
}
function addPalm(x, z, s) {
  const lean = (Math.sin(x * 3.1) + Math.cos(z * 2.3)) * .07;
  const trunk = new THREE.Mesh(palmTrunkGeo, palmTrunkMat);
  trunk.position.set(x, 3 * s, z); trunk.scale.setScalar(s);
  trunk.rotation.z = lean;
  worldGroup.add(trunk);
  const topX = x - Math.sin(lean) * 6 * s, topY = 6 * s * Math.cos(lean);
  for (let i = 0; i < 8; i++) { // 8片垂坠叶,两色交替
    const leaf = new THREE.Mesh(palmLeafGeo, i % 2 ? palmLeafMat2 : palmLeafMat);
    const a = i / 8 * TAU + x * .1;
    leaf.position.set(topX + Math.cos(a) * 1.35 * s, topY - .25 * s, z + Math.sin(a) * 1.35 * s);
    leaf.rotation.set(Math.sin(a) * 1.15, -a, Math.cos(a) * 1.15);
    leaf.scale.set(s * .9, s * 1.25, s * .9);
    worldGroup.add(leaf);
  }
  for (let i = 0; i < 3; i++) { // 椰子
    const nut = new THREE.Mesh(coconutGeo, palmTrunkMat);
    const a = i / 3 * TAU;
    nut.position.set(topX + Math.cos(a) * .38 * s, topY - .45 * s, z + Math.sin(a) * .38 * s);
    nut.scale.setScalar(s);
    worldGroup.add(nut);
  }
}
function addPine(x, z, s, snowy) {
  const trunk = new THREE.Mesh(pineTrunkGeo, palmTrunkMat);
  trunk.position.set(x, 1.2 * s, z); trunk.scale.setScalar(s);
  worldGroup.add(trunk);
  for (let i = 0; i < 4; i++) { // 四层塔冠,两色交替
    const sc = 1.65 - i * .33;
    const cone = new THREE.Mesh(pineConeGeo, i % 2 ? pineMat2 : pineMat);
    cone.position.set(x, (2.1 + i * 1.35) * s, z);
    cone.scale.set(s * sc, s * .85, s * sc);
    worldGroup.add(cone);
    if (snowy) { // 每层顶部积雪
      const cap = new THREE.Mesh(pineConeGeo, snowMat);
      cap.position.set(x, (2.35 + i * 1.35) * s, z);
      cap.scale.set(s * sc * .8, s * .3, s * sc * .8);
      worldGroup.add(cap);
    }
  }
}
function addTree(x, z, s) { // 欧陆阔叶行道树:多球冠层两色
  const trunk = new THREE.Mesh(pineTrunkGeo, palmTrunkMat);
  trunk.position.set(x, 1.2 * s, z); trunk.scale.set(s * 1.1, s * 1.4, s * 1.1);
  worldGroup.add(trunk);
  for (const [ox, oy, oz, r] of [[0, 4.2, 0, 1.9], [-1.1, 3.4, .5, 1.25], [1.05, 3.5, -.4, 1.3], [.2, 3.2, 1.05, 1.1]]) {
    const blob = new THREE.Mesh(canopyGeo, (ox + oz) > 0 ? canopyMat2 : canopyMat);
    blob.position.set(x + ox * s, oy * s, z + oz * s);
    blob.scale.setScalar(r * s);
    worldGroup.add(blob);
  }
}
function addMountain(x, z, r, h, snowCap) {
  const m = new THREE.Mesh(mountainGeo, mountainMat);
  m.position.set(x, 0, z); m.scale.set(r, h, r);
  worldGroup.add(m);
  if (snowCap) {
    const cap = new THREE.Mesh(mountainGeo, snowMat);
    cap.position.set(x, h * .55, z); cap.scale.set(r * .45, h * .45, r * .45);
    worldGroup.add(cap);
  }
}
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const palmTrunkGeo = new THREE.CylinderGeometry(.16, .3, 6, 6);
const palmLeafGeo = new THREE.ConeGeometry(.5, 2.6, 5);
const pineTrunkGeo = new THREE.CylinderGeometry(.2, .3, 2.4, 6);
const pineConeGeo = new THREE.ConeGeometry(1.6, 2.6, 8);
const mountainGeo = new THREE.ConeGeometry(1, 1, 9);
const palmTrunkMat = new THREE.MeshPhongMaterial({ color: 0x6b4f33 });
const palmLeafMat = new THREE.MeshPhongMaterial({ color: 0x2e7d3a, side: THREE.DoubleSide });
const palmLeafMat2 = new THREE.MeshPhongMaterial({ color: 0x49a04f, side: THREE.DoubleSide });
const pineMat = new THREE.MeshPhongMaterial({ color: 0x1e4d2b });
const pineMat2 = new THREE.MeshPhongMaterial({ color: 0x2e6b3c });
const coconutGeo = new THREE.SphereGeometry(.22, 6, 5);
const canopyGeo = new THREE.SphereGeometry(1, 10, 8);
const canopyMat = new THREE.MeshPhongMaterial({ color: 0x3f7d3a });
const canopyMat2 = new THREE.MeshPhongMaterial({ color: 0x5d9c4a });
const snowMat = new THREE.MeshPhongMaterial({ color: 0xf2f7fb });
const mountainMat = new THREE.MeshPhongMaterial({ color: 0x5a6472 });

const stars = (() => { // 三层星空:微光星海+亮星+暖星
  const grp = new THREE.Group();
  const mk = (count, size, color, op) => {
    const g = new THREE.BufferGeometry(); const sp = [];
    for (let i = 0; i < count; i++) {
      const th = Math.random() * TAU, ph = Math.random() * .48 + .06, r = 1250;
      sp.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    grp.add(new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, fog: false, transparent: true, opacity: op })));
  };
  mk(700, 1.4, 0x9fb4d8, .7);
  mk(120, 2.6, 0xffffff, .95);
  mk(60, 2.2, 0xffd9a8, .9);
  scene.add(grp); return grp;
})();
const skyOrb = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xcfe0ff, transparent: true, opacity: .95, fog: false, depthWrite: false }));
skyOrb.scale.set(130, 130, 1); skyOrb.position.set(-500, 420, 300); scene.add(skyOrb);

const rainCount = 650;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);
for (let i = 0; i < rainCount; i++) {
  rainPos[i * 3] = (Math.random() - .5) * 160;
  rainPos[i * 3 + 1] = Math.random() * 60;
  rainPos[i * 3 + 2] = (Math.random() - .5) * 160;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({ color: 0x6688aa, size: .16, transparent: true, opacity: .55 });
const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);

// ---------------- 粒子系统(固定缓冲对象池,零逐帧分配):氮气蓝焰/漂移胎烟/碰撞火花 ----------------
const PMAX = 240;
const pPos = new Float32Array(PMAX * 3), pVel = new Float32Array(PMAX * 3);
const pCol = new Float32Array(PMAX * 3), pColB = new Float32Array(PMAX * 3);
const pLife = new Float32Array(PMAX), pLifeMax = new Float32Array(PMAX), pGrav = new Float32Array(PMAX);
for (let i = 0; i < PMAX; i++) pPos[i * 3 + 1] = -999;
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
const pPoints = new THREE.Points(pGeo, new THREE.PointsMaterial({
  size: .5, vertexColors: true, transparent: true, opacity: .9,
  blending: THREE.AdditiveBlending, depthWrite: false }));
pPoints.frustumCulled = false;
scene.add(pPoints);
let pHead = 0, pBudget = 1, slBudget = 1; // 画质自适应系数(掉帧时自动降低)
function spawnP(x, y, z, vx, vy, vz, r, g, b, life, grav) {
  const i = pHead; pHead = (pHead + 1) % PMAX;
  pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
  pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
  pColB[i * 3] = r; pColB[i * 3 + 1] = g; pColB[i * 3 + 2] = b;
  pCol[i * 3] = r; pCol[i * 3 + 1] = g; pCol[i * 3 + 2] = b;
  pLife[i] = life; pLifeMax[i] = life; pGrav[i] = grav;
}
function spawnBurst(x, y, z, n, r, g, b, spd, life, grav) {
  n = Math.max(1, (n * pBudget) | 0);
  for (let k = 0; k < n; k++) {
    const a = Math.random() * TAU, s2 = spd * (.4 + Math.random());
    spawnP(x, y, z, Math.cos(a) * s2, spd * .5 * Math.random(), Math.sin(a) * s2, r, g, b, life * (.6 + Math.random() * .8), grav);
  }
}
function updateParticles(dt) {
  for (let i = 0; i < PMAX; i++) {
    if (pLife[i] <= 0) continue;
    pLife[i] -= dt;
    if (pLife[i] <= 0) { pPos[i * 3 + 1] = -999; pCol[i * 3] = pCol[i * 3 + 1] = pCol[i * 3 + 2] = 0; continue; }
    pVel[i * 3 + 1] -= pGrav[i] * dt;
    pPos[i * 3] += pVel[i * 3] * dt;
    pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
    pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
    if (pPos[i * 3 + 1] < .05) { pPos[i * 3 + 1] = .05; pVel[i * 3 + 1] = 0; }
    const f = pLife[i] / pLifeMax[i], f2 = f * f; // 加色混合下以颜色衰减模拟淡出
    pCol[i * 3] = pColB[i * 3] * f2; pCol[i * 3 + 1] = pColB[i * 3 + 1] * f2; pCol[i * 3 + 2] = pColB[i * 3 + 2] * f2;
  }
  pGeo.attributes.position.needsUpdate = true;
  pGeo.attributes.color.needsUpdate = true;
}

const ENVS = {
  tokyo:    { sky: 0x070a14, fog: [0x070a14, 60, 430],  amb: [0x3a4060, .85], hemi: [0x2a3555, 0x0a0c14, .5], sun: [0x8899cc, .35, -200, 300, 100], ground: 0x0a0c13, orb: [0xcfe0ff, 130, -500, 420, 300], line: '#e8b62a' },
  hongkong: { sky: 0x081018, fog: [0x081018, 60, 420],  amb: [0x3a4a66, .85], hemi: [0x2a3d5c, 0x0a0e16, .5], sun: [0x88aacc, .3, 200, 300, -100], ground: 0x0a0e16, orb: [0xcfe0ff, 110, 500, 400, -300], line: '#e8e8e8' },
  newyork:  { sky: 0x05070e, fog: [0x05070e, 70, 460],  amb: [0x38405c, .8],  hemi: [0x283252, 0x090b12, .5], sun: [0x8899cc, .3, -150, 320, 150], ground: 0x0c0e15, orb: [0xd8e4ff, 120, 450, 460, 250], line: '#e8b62a' },
  la:       { sky: 0x2b1030, fog: [0x3a1c3c, 90, 620],  amb: [0x554066, .75], hemi: [0x6a3a5a, 0x201626, .5], sun: [0xff7038, .95, -800, 90, 260], ground: 0x221a28, orb: [0xff9a50, 420, -950, 100, 320], line: '#e8b62a' },
  miami:    { sky: 0x7fc4e8, fog: [0xbfe0ee, 150, 950], amb: [0xa8b8c8, .8],  hemi: [0xbfd8ee, 0x9a8f72, .75], sun: [0xfff2d8, 1.1, 200, 320, -120], ground: 0xd8c9a0, orb: [0xfff6d8, 190, 620, 520, -380], line: '#e8b62a' },
  paris:    { sky: 0xa8c4dc, fog: [0xd0d8e0, 130, 850], amb: [0xa0a8b4, .8],  hemi: [0xbccce0, 0x84806e, .7],  sun: [0xfff0d0, 1.0, -180, 300, 160], ground: 0x70757d, orb: [0xfff6e0, 170, -560, 480, 420], line: '#e8e8e8' },
  dubai:    { sky: 0xa8cbe0, fog: [0xe0cfa8, 140, 900], amb: [0xb8ac90, .85], hemi: [0xc8d8e8, 0xb09a6a, .75], sun: [0xfff0c8, 1.15, 150, 340, 100], ground: 0xcbb180, orb: [0xfff8dc, 210, 520, 560, 320], line: '#e8b62a' },
  alps:     { sky: 0x90c8ec, fog: [0xdce9f2, 150, 1000], amb: [0xa8b4c4, .85], hemi: [0xcfe2f2, 0x9aa4ac, .75], sun: [0xf8f4ea, 1.05, -160, 360, 140], ground: 0xeef4f8, orb: [0xffffff, 160, -520, 540, 380], line: '#e8b62a' },
  shanghai: { sky: 0x627780, fog: [0xa6a39a, 120, 1100], amb: [0xc0cbd1, .9], hemi: [0xb8d5e0, 0x57594e, 1.1], sun: [0xffd8ad, 2.0, 200, 300, 100], ground: 0x505855, orb: [0xffd1a0, 120, 500, 160, -250], line: '#e8b62a' },
  vegas:    { sky: 0x0c0714, fog: [0x140a20, 70, 480],  amb: [0x4c3a66, .9],  hemi: [0x3a2a5c, 0x0d0a14, .55], sun: [0x8899cc, .3, -150, 300, 100], ground: 0x231a12, orb: [0xd8e4ff, 110, -450, 420, 300], line: '#e8e8e8' },
  london:   { sky: 0x39414e, fog: [0x4a5260, 90, 650],  amb: [0x6a7280, .8],  hemi: [0x77808f, 0x3a3d42, .6], sun: [0xffc890, .5, -600, 120, 200], ground: 0x33373d, orb: [0xffd0a0, 260, -800, 140, 260], line: '#e8e8e8' },
  monaco:   { sky: 0x8fc8e8, fog: [0xc8e0ec, 140, 900], amb: [0xa8b4c0, .8],  hemi: [0xbfd8ea, 0x8f8878, .75], sun: [0xfff2d8, 1.1, 180, 320, -100], ground: 0x9a9486, orb: [0xfff6d8, 180, 600, 500, -360], line: '#e8e8e8' },
};

const signTexts = [
  ['NITRO', '#37e0ff'], ['夜行者', '#ff37a0'], ['GARAGE 24H', '#b9ff00'], ['TUNER', '#ff8a00'],
  ['DRIFT ZONE', '#37e0ff'], ['改装王', '#ff2a5a'], ['SPEED KING', '#b9ff00'], ['午夜俱乐部', '#c88aff'],
];

function buildWorld(ti) {
  if(cityShowcase){cityShowcase.dispose();cityShowcase=null;}
  disposeWorld();
  rndSeed = 4242 + ti * 977;
  const T = TRACKS[ti], E = ENVS[T.theme];
  const night = T.time === 'night', dusk = T.time === 'dusk', day = T.time === 'day';
  buildTrackData(T);
  worldGroup = new THREE.Group(); scene.add(worldGroup);

  scene.background = new THREE.Color(E.sky);
  scene.fog = new THREE.Fog(E.fog[0], E.fog[1], E.fog[2]);
  ambient.color.setHex(E.amb[0]); ambient.intensity = E.amb[1];
  hemi.color.setHex(E.hemi[0]); hemi.groundColor.setHex(E.hemi[1]); hemi.intensity = E.hemi[2];
  sunLight.color.setHex(E.sun[0]); sunLight.intensity = E.sun[1];
  sunLight.position.set(E.sun[2], E.sun[3], E.sun[4]);
  stars.visible = night&&!T.circuit;
  skyOrb.material.color.setHex(E.orb[0]);
  skyOrb.scale.set(E.orb[1], E.orb[1], 1);
  skyOrb.position.set(E.orb[2], E.orb[3], E.orb[4]);
  precipMode = options.weather==='rain'?'rain':options.weather==='clear'?null:T.precip || null;
  wetness=precipMode==='rain'?.7:precipMode==='snow'?.4:0;
  rain.visible = !!precipMode;
  if (precipMode === 'snow') { rainMat.color.setHex(0xffffff); rainMat.size = .32; rainMat.opacity = .8; precipSpeed = 9; }
  else { rainMat.color.setHex(0x6688aa); rainMat.size = .16; rainMat.opacity = .55; precipSpeed = 45; }

  skyOrb.visible=false;stars.visible=night&&!wetness&&!T.circuit;
  atmosphere.set(T.circuit?{...CITY_PROFILES[T.theme],sky:T.time==='night'?'night':T.time==='dusk'?'sunset':'day'}:CITY_PROFILES[T.theme],wetness>0);
  if(T.circuit)scene.fog=new THREE.Fog(T.time==='night'?0x202a3a:0xc1d5dc,1800,11000);
  const roadMat=D_(surfaces.material(wetness>0));
  // Physical road/ground separation needs no bias: a negative bias hides distant kerbs.
  if(T.circuit)roadMat.polygonOffset=false;
  worldGroup.add(buildStrip(ROAD_W,-ROAD_W,0,0,roadMat));
  if(!T.circuit){
  const wallMat = D_(new THREE.MeshStandardMaterial({ color: 0x91958f, roughness: .9, side: THREE.DoubleSide }));
  worldGroup.add(buildStrip(ROAD_W + .3, ROAD_W + .3, 0, 1.1, wallMat));
  worldGroup.add(buildStrip(-ROAD_W - .3, -ROAD_W - .3, 1.1, 0, wallMat));
  // 红白路肩条纹(沿赛道方向重复,F1式护墙顶缘)
  const curbTex = D_(canvasTex(16, 64, (g, w, h) => {
    for (let y = 0; y < 4; y++) { g.fillStyle = y % 2 ? '#e8e8e8' : '#e8402a'; g.fillRect(0, y * 16, w, 16); }
  }, true));
  const railMat = D_(new THREE.MeshBasicMaterial({ map: curbTex, side: THREE.DoubleSide }));
  worldGroup.add(buildStrip(ROAD_W + .32, ROAD_W + .32, 1.1, 1.02, railMat));
  worldGroup.add(buildStrip(-ROAD_W - .32, -ROAD_W - .32, 1.02, 1.1, railMat));
  }
  // 路肩带(人行道/草肩/沙肩)
  const shoulderMat = D_(new THREE.MeshPhongMaterial({ color: T.circuit&&['shanghai','miami'].includes(T.theme)?0x648145:(night || dusk) ? 0x2b303c : shadeCol(E.ground, 1.22), shininess: 8 }));
  worldGroup.add(buildStrip(ROAD_W + 2.6, ROAD_W + .36, .04, .04, shoulderMat));
  worldGroup.add(buildStrip(-ROAD_W - .36, -ROAD_W - 2.6, .04, .04, shoulderMat));

  let maxR = T.base; for (const m of T.modes) maxR += Math.abs(m[1]);
  // 地面材质纹理(噪点细节)
  const groundTexC = D_(canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = hex6(T.theme==='alps'?0xd9e1e3:T.theme==='dubai'?0xb6a785:T.circuit&&(T.theme==='shanghai'||T.theme==='miami')?0x648145:0x6e746b); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) {
      g.fillStyle = hex6(shadeCol(T.theme==='alps'?0xd9e1e3:T.theme==='dubai'?0xb6a785:T.circuit&&(T.theme==='shanghai'||T.theme==='miami')?0x648145:0x6e746b, .85 + Math.random() * .3));
      g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
  }, true));
  groundTexC.repeat.set(600, 600);
  const groundMat = D_(new THREE.MeshStandardMaterial({ map: groundTexC, roughness: 1 }));
  const g2 = new THREE.Mesh(D_(new THREE.PlaneGeometry(T.circuit?20000:6000, T.circuit?20000:6000)), groundMat);
  g2.rotation.x = -Math.PI / 2; g2.position.y = -.05; g2.receiveShadow=true;worldGroup.add(g2);

  {
    const p = sPts[0], n = sNrm[0], t = sTan[0];
    const check = new THREE.Mesh(D_(new THREE.PlaneGeometry(ROAD_W * 2, 4)), D_(new THREE.MeshBasicMaterial({ map: checkerTex })));
    check.rotation.x = -Math.PI / 2;
    check.position.set(p.x, .02, p.z);
    check.rotation.z = Math.atan2(t.x, t.z);
    worldGroup.add(check);
    const poleM = D_(new THREE.MeshPhongMaterial({ color: 0x333a4a }));
    for (const s of [-1, 1]) {
      const pole = new THREE.Mesh(D_(new THREE.CylinderGeometry(.35, .35, 9, 8)), poleM);
      pole.position.set(p.x + n.x * (ROAD_W + 1.2) * s, 4.5, p.z + n.z * (ROAD_W + 1.2) * s);
      worldGroup.add(pole);
    }
    const banner = new THREE.Mesh(D_(new THREE.BoxGeometry(ROAD_W * 2 + 3, 2.2, .4)), D_(new THREE.MeshBasicMaterial({ map: bannerTex })));
    banner.position.set(p.x, 8, p.z);
    banner.rotation.y = Math.atan2(t.x, t.z) + Math.PI / 2;
    worldGroup.add(banner);
  }

  cityReport=T.circuit?buildCircuitVenue(worldGroup,sPts,sNrm,T.theme,worldDisposables,trackLen,ROAD_W):buildCity(worldGroup,sPts,sNrm,T.theme,worldDisposables,trackLen);
  environmentDetail.register(worldGroup);
  buildMinimapPath();
}

// ---------------- 车辆模型(拟真外观) ----------------
// 环境反射贴图(车漆/玻璃/镀铬的反光)
const envTex = (() => {
  const faces = [];
  for (let i = 0; i < 6; i++) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 64);
    if (i === 2) { grad.addColorStop(0, '#dce8fa'); grad.addColorStop(1, '#8fa8cc'); }
    else if (i === 3) { grad.addColorStop(0, '#242833'); grad.addColorStop(1, '#0b0d13'); }
    else { grad.addColorStop(0, '#9db8dc'); grad.addColorStop(.55, '#46536e'); grad.addColorStop(1, '#141822'); }
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    faces.push(c);
  }
  const t = new THREE.CubeTexture(faces);
  t.needsUpdate = true;
  return t;
})();
const plateTex = canvasTex(128, 32, (g, w, h) => {
  g.fillStyle = '#e8eaf0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1848c8'; g.fillRect(0, 0, 14, h);
  g.fillStyle = '#101318'; g.font = 'bold 19px Arial'; g.textAlign = 'center';
  g.fillText('UV·2026', w / 2 + 7, 23);
});
// 底盘轮廓:含前后轮拱
const buildCar = buildAutomobile;
const carObjs = CARS.map(c => {const car=buildCar({...c,type:c.type==='458'?'f40':c.type});car.cfg=c;return car;});
carObjs.forEach(c => { scene.add(c.group); c.group.visible = false; });

const headlight = new THREE.SpotLight(0xcfe4ff, 120, 130, .48, .55, 1.2);
const headlightTarget = new THREE.Object3D();
scene.add(headlight); scene.add(headlightTarget);
headlight.target = headlightTarget;
headlight.visible = false;
function placeHeadlight(position,heading){
 const x=Math.sin(heading),z=Math.cos(heading);
 headlight.position.set(position.x+x*1.8,position.y+1.1,position.z+z*1.8);
 headlightTarget.position.set(position.x+x*45,position.y,position.z+z*45);
}

// ---------------- 展厅 ----------------
const showroom = new THREE.Group();
const ped = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, .35, 32),
  new THREE.MeshPhongMaterial({ color: 0x181c28, shininess: 110, specular: 0x8899bb }));
ped.position.y = .17; showroom.add(ped);
const ring = new THREE.Mesh(new THREE.TorusGeometry(4.6, .07, 8, 48),
  new THREE.MeshBasicMaterial({ color: 0xb9ff00 }));
ring.rotation.x = Math.PI / 2; ring.position.y = .36; showroom.add(ring);
const showLights = [];
[[0xff37a0, 8, -6], [0x37e0ff, -8, -6], [0xffffff, 0, 9]].forEach(([col, x, z]) => {
  const sl = new THREE.SpotLight(col, 45, 60, .6, .6, 1.5);
  sl.position.set(x, 12, z);
  sl.target = ped; showroom.add(sl); showLights.push(sl);
});
scene.add(showroom);

// ================= 状态 =================
const player = {
  car: null, cfg: null,
  pos: new THREE.Vector3(), heading: 0, speed: 0, steer: 0, drift: 0,
  trackIdx: 0, s: 0, lap: 1, lastS: 0,
  nos: 100, nosMax: 100, nosActive: false,
  lapStart: 0, best: null, finished: false, finishTime: null, wrongWay: 0, gearDisp: 1,
};
const ais = [];
let state = 'menu';
let selected = 12, diffSel = 1, trackSel = 7;
let camMode = 0;
let menuTab='car',menuUI=null;
let raceTime = 0, countdownT = 0;
let checkpointTiming=null;
let shake = 0, camAngle = .8;
let paused = false;
const camPos = new THREE.Vector3(0, 6, 14);
const keys = {};
const vk = { left: false, right: false, gas: false, brake: false, nos: false, drift: false }; // 虚拟按键

// ---------------- 设置(本地持久化) + 触觉反馈 ----------------
const SETS = { sens: 1, muted: false };
try {
  const sv = JSON.parse(localStorage.getItem('uv_mobile_sets') || '{}');
  if (sv.sens === 0 || sv.sens === 1 || sv.sens === 2) SETS.sens = sv.sens;
  if (sv.muted === true) SETS.muted = true;
} catch (e) {}
function saveSets() { try { localStorage.setItem('uv_mobile_sets', JSON.stringify(SETS)); } catch (e) {} }
// 转向灵敏度:steerK=转向阻尼速率(越大越贼) yaw=转向力度系数
const SENS = [{ steerK: 5.5, yaw: .88 }, { steerK: 7, yaw: 1 }, { steerK: 9.5, yaw: 1.12 }];
const canVib = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
function vib(p) { if (canVib) { try { navigator.vibrate(p); } catch (e) {} } }

// ---------------- 音频 ----------------
let AC = null, master = null, musicGain = null, raceAudio = null, muted = SETS.muted;
let noiseBuf = null;
function setMuted(m) {
  muted = m; SETS.muted = m; saveSets();
  if (master) master.gain.setTargetAtTime(m ? 0 : .6,AC.currentTime,.015);
  const bs = document.getElementById('btnSound'); if (bs) bs.textContent = m ? '🔇' : '🔊';
  const st = document.getElementById('soundTog');
  if (st) { st.textContent = m ? '关 OFF' : '开 ON'; st.classList.toggle('sel', !m); }
}
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = muted ? 0 : .6; master.connect(AC.destination);
  raceAudio=new RaceAudio(AC,master);
  noiseBuf=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);
  const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  musicGain = AC.createGain(); musicGain.gain.value = .10; musicGain.connect(master);
  startMusic();
}
function beep(freq, dur, vol, type) {
  if (!AC) return;
  const o = AC.createOscillator(), gn = AC.createGain();
  o.type = type || 'square'; o.frequency.value = freq;
  gn.gain.setValueAtTime(vol || .2, AC.currentTime);
  gn.gain.exponentialRampToValueAtTime(.001, AC.currentTime + (dur || .15));
  o.connect(gn); gn.connect(master);
  o.start(); o.stop(AC.currentTime + (dur || .15) + .02);
}
function thud(vol) {raceAudio?.impact(vol);}
let musicStep = 0, nextNoteT = 0;
const bassSeq = [45, 0, 45, 48, 0, 45, 0, 43, 45, 0, 45, 48, 50, 0, 43, 0];
function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function startMusic() {
  nextNoteT = AC.currentTime + .1; musicStep = 0;
  setInterval(() => {
    if (!AC) return;
    while (nextNoteT < AC.currentTime + .12) {
      const t = nextNoteT, st = musicStep % 16;
      if (st % 4 === 0) {
        const o = AC.createOscillator(), gn = AC.createGain();
        o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(38, t + .1);
        gn.gain.setValueAtTime(.5, t); gn.gain.exponentialRampToValueAtTime(.001, t + .16);
        o.connect(gn); gn.connect(musicGain); o.start(t); o.stop(t + .18);
      }
      if (st % 2 === 1) {
        const src = AC.createBufferSource(); src.buffer = noiseBuf;
        const f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
        const gn = AC.createGain(); gn.gain.setValueAtTime(.06, t); gn.gain.exponentialRampToValueAtTime(.001, t + .05);
        src.connect(f); f.connect(gn); gn.connect(musicGain); src.start(t); src.stop(t + .06);
      }
      const note = bassSeq[st];
      if (note) {
        const o = AC.createOscillator(); o.type = 'sawtooth';
        const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 4;
        const gn = AC.createGain(); gn.gain.setValueAtTime(.16, t); gn.gain.exponentialRampToValueAtTime(.001, t + .13);
        o.frequency.value = midi(note);
        o.connect(f); f.connect(gn); gn.connect(musicGain); o.start(t); o.stop(t + .15);
      }
      nextNoteT += .135; musicStep++;
    }
  }, 30);
}

// ---------------- 输入(键盘 + 触屏) ----------------
function toggleCam() {
  if (paused||(state !== 'race' && state !== 'countdown')) return;
  camMode = (camMode + 1) % 3;
  renderMotion.reset();renderAlpha=1;
  chasePrevious=null;
  document.getElementById('cockpit').style.display = 'none';
  if (player.car) {
    player.car.bodyParts.visible = !camMode || player.car.detailed;
    player.car.wheels.forEach(w => w.visible = true);
  }
  showMsg(['追尾视角','座舱视角','车头视角'][camMode],'C / 视角按钮切换',1.2);
  beep(880, .06, .12);
}
addEventListener('keydown', e => {
  if(e.target.closest('[data-orbit],#menuViewport'))return;
  if(e.target.closest('input,select,button,summary,a,[contenteditable]')&&e.code!=='Escape')return;
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  initAudio();
  if (state === 'menu') {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') switchCar(-1);
    if (e.code === 'KeyD' || e.code === 'ArrowRight') switchCar(1);
    if (e.code === 'Enter') startRace();
  }
  if (!e.repeat&&e.code === 'KeyC') toggleCam();
  if (!e.repeat&&e.code === 'KeyM') setMuted(!muted);
  if (!e.repeat&&e.code === 'KeyR' && state === 'race'&&!paused) resetToTrack();
  if (!e.repeat&&e.code === 'Escape' && (state === 'race'||state === 'countdown')) togglePause();
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('pointerdown', initAudio);
document.addEventListener('visibilitychange',()=>{if(document.hidden){raceAudio?.silence();if(musicGain)musicGain.gain.setTargetAtTime(0,AC.currentTime,.02);}});
addEventListener('touchstart', initAudio, { passive: true });
addEventListener('contextmenu', e => e.preventDefault());
// iOS 防误触:禁用双指缩放手势与双击缩放
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('touchmove', e => {
  if (!e.target.closest('#menu') && !e.target.closest('#resultsBox')) e.preventDefault();
}, { passive: false });

// 触屏按键绑定(多点触控:每个按键独立跟踪 pointerId,可同时转向+氮气+油门)
const releaseTouchControls=[];
function bindHold(id, key) {
  const el = document.getElementById(id);
  const pointers=new Set();
  const sync=()=>{vk[key]=pointers.size>0;el.classList.toggle('on',vk[key]);};
  const on = e => { e.preventDefault();if(paused||!['race','countdown'].includes(state))return;initAudio();el.setPointerCapture(e.pointerId);pointers.add(e.pointerId);sync();vib(8); };
  const off = e => { pointers.delete(e.pointerId);sync(); };
  releaseTouchControls.push(()=>{pointers.clear();sync();});
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('lostpointercapture', off);
}
bindHold('btnL', 'left');
bindHold('btnR', 'right');
bindHold('btnGas', 'gas');
bindHold('btnBrake', 'brake');
bindHold('btnNos', 'nos');
bindHold('btnDrift', 'drift');
document.getElementById('btnCam').addEventListener('click', e => { e.preventDefault(); toggleCam();e.currentTarget.blur(); });
document.getElementById('btnPause').addEventListener('pointerdown', e => { e.preventDefault(); vib(10); if (state === 'race') togglePause(); });
document.getElementById('btnReset').addEventListener('pointerdown', e => { e.preventDefault(); if (state === 'race') { vib(12); resetToTrack(); } });
document.getElementById('btnSound').addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); setMuted(!muted); vib(8); });
// 暂停面板设置:转向灵敏度 / 声音开关
[...document.querySelectorAll('#sensRow .setBtn')].forEach(b => {
  b.classList.toggle('sel', +b.dataset.s === SETS.sens);
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); initAudio();
    SETS.sens = +b.dataset.s; saveSets();if(document.getElementById('steeringSensitivity'))document.getElementById('steeringSensitivity').value=String(SETS.sens);
    [...document.querySelectorAll('#sensRow .setBtn')].forEach(x => x.classList.toggle('sel', x === b));
    beep(700 + SETS.sens * 120, .06, .12, 'triangle'); vib(10);
  });
});
document.getElementById('soundTog').addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); setMuted(!muted); vib(8); });
setMuted(SETS.muted); // 同步声音按钮初始状态

// 竖屏时自动暂停比赛
if (window.matchMedia) {
  const pq = matchMedia('(orientation: portrait)');
  const onOri = ev => { if (ev.matches && state === 'race' && !paused) togglePause(); };
  if (pq.addEventListener) pq.addEventListener('change', onOri);
  else if (pq.addListener) pq.addListener(onOri);
}
// 尽力全屏 + 锁定横屏(安卓有效,iOS靠旋转提示)
function goFullscreen() {
  const el = document.documentElement;
  const fs = el.requestFullscreen || el.webkitRequestFullscreen;
  try {
    if (fs) {
      const p = fs.call(el);
      if (p && p.then) p.then(lockLandscape).catch(() => {});
      else lockLandscape();
    } else lockLandscape();
  } catch (e) {}
}
function lockLandscape() {
  try {
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  } catch (e) {}
}

document.getElementById('prevCar').onclick = () => { initAudio(); switchCar(-1); };
document.getElementById('nextCar').onclick = () => { initAudio(); switchCar(1); };
document.getElementById('startBtn').onclick = () => { initAudio(); startRace(); };
document.getElementById('againBtn').onclick = () => { document.getElementById('results').style.display = 'none'; startRace(); };
document.getElementById('garageBtn').onclick = () => { document.getElementById('results').style.display = 'none'; toMenu(); };
document.getElementById('resumeBtn').onclick = togglePause;
document.getElementById('quitBtn').onclick = () => { paused = false; document.getElementById('pause').style.display = 'none'; toMenu(); };

function togglePause() {
  paused = !paused;
  clearInput();
  document.activeElement?.blur();
  document.getElementById('pause').style.display = paused ? 'flex' : 'none';
  if(paused)raceAudio?.silence();
}

// ---------------- 选择界面 ----------------
const diffRow = document.getElementById('diffRow');
DIFFS.forEach((d, i) => {
  const b = document.createElement('div');
  b.setAttribute('role','button');b.tabIndex=0;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();b.click();}};
  b.className = 'diffBtn' + (i === diffSel ? ' sel' : '');
  b.innerHTML = '<span class="dn">' + d.name + '</span><span class="de">' + d.en + '</span>';
  b.onclick = () => { initAudio(); diffSel = i;document.getElementById('difficultyNote').textContent=DIFFS[i].description+' 对手含保守 / 稳定 / 进攻型，无追赶加速。';refreshMenuPreview(); beep(700, .06, .12, 'triangle');
    [...diffRow.children].forEach((c, j) => c.classList.toggle('sel', j === i)); };
  diffRow.appendChild(b);
});
const trackGrid = document.getElementById('trackGrid');
// 赛道形状预览小图
function drawTrackShape(cv, T) {
  const g = cv.getContext('2d'), W2 = cv.width;
  const N = 360, xs = [], zs = [];
  let mnX = 1e9, mxX = -1e9, mnZ = 1e9, mxZ = -1e9;
  const previewCurve=createTrackCurve(T);
  for (let i = 0; i < N; i++) {
    const {x,z}=previewCurve.getPointAt(i/N);
    xs.push(x); zs.push(z);
    if (x < mnX) mnX = x; if (x > mxX) mxX = x;
    if (z < mnZ) mnZ = z; if (z > mxZ) mxZ = z;
  }
  const pad = 5, sc = Math.min((W2 - pad * 2) / (mxX - mnX), (W2 - pad * 2) / (mxZ - mnZ));
  const ox = (W2 - (mxX - mnX) * sc) / 2, oz = (W2 - (mxZ - mnZ) * sc) / 2;
  g.clearRect(0, 0, W2, W2);
  g.beginPath();
  for (let i = 0; i <= N; i++) {
    const j = i % N;
    const x = ox + (xs[j] - mnX) * sc, y = oz + (zs[j] - mnZ) * sc;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.strokeStyle = '#b9ff00'; g.lineWidth = 1.6; g.stroke();
  g.fillStyle = '#fff';
  g.fillRect(ox + (xs[0] - mnX) * sc - 1.5, oz + (zs[0] - mnZ) * sc - 1.5, 3, 3);
}
TRACKS.forEach((t, i) => {
  const b = document.createElement('div');
  b.setAttribute('role','button');b.tabIndex=0;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();b.click();}};
  b.className = 'trackBtn' + (i === trackSel ? ' sel' : '');
  const km = (approxLen(t) / 1000).toFixed(t.circuit?3:1);
  b.innerHTML = '<canvas class="tshape" width="38" height="38"></canvas><span><div class="tn">' + timeIcon(t.time) + ' ' + t.city + ' · ' + t.name + '</div><div class="ts">' + '★★★★★'.slice(0, t.stars) + '☆☆☆☆☆'.slice(0, 5 - t.stars) + '</div><div class="tc">' + km + 'KM · ' + (t.circuit?t.circuit.turns+' 弯 · ':'') + (t.time === 'day' ? '白天' : t.time === 'dusk' ? '黄昏' : '夜晚') + '</div>' + (t.circuit?'<div class="tc">'+t.circuit.description+'</div>':'') + '</span>';
  b.onclick = () => {
    initAudio(); if (trackSel === i) return;
    trackSel = i;
    [...trackGrid.children].forEach((c, j) => c.classList.toggle('sel', j === i));
    buildWorld(trackSel);syncMenuScene();
    beep(760, .07, .13, 'triangle');
  };
  trackGrid.appendChild(b);
  drawTrackShape(b.querySelector('canvas'), t);
});

function switchCar(dir) {
  
  selected = (selected + dir + CARS.length) % CARS.length;
  if(state==='menu')syncMenuScene();else updateMenuCar();refreshMenuPreview();
  beep(660, .07, .15, 'triangle');
}
function updateMenuCar() {
  const selectedCar=carObjs[selected];
  if(!selectedCar.assetStatus){
    ensureDetailedCar(selectedCar).then(()=>{if(carObjs[selected]===selectedCar){if(state==='vehicle')enterVehicle();else if(state==='menu')syncMenuScene();}});
  }
  carObjs.forEach((c, i) => {
    c.group.visible = (i === selected && c.assetStatus !== 'loading');
    c.bodyParts.visible = true;c.bodyParts.rotation.set(0,0,0);
    c.wheels.forEach(w => {w.visible=true;});c.frontPivots.forEach(p=>p.rotation.y=0);
    c.glowPlane.visible = false;
    if (i === selected) {
      c.group.position.set(0, .36, 0);
      c.group.rotation.set(0, camAngle + Math.PI / 2, 0);
    }
  });
  const retry=document.getElementById('retryModel');if(retry)retry.hidden=selectedCar.assetStatus!=='fallback';
  const loading=selectedCar.assetStatus==='loading';
  document.getElementById('menuPreview')?.classList.toggle('vehicle-loading',loading&&menuTab!=='track');
  document.getElementById('vehicleOrbitSurface')?.classList.toggle('vehicle-loading',loading);
  const cfg = CARS[selected];
  document.getElementById('carName').textContent = cfg.nameCn;
  document.getElementById('carNameEn').textContent = cfg.nameEn;
  document.getElementById('carDesc').textContent = selectedCar.assetStatus==='loading'?'正在载入精细车模… 载入后可直接鉴赏与驾驶。':selectedCar.assetStatus==='fallback'?'精细模型暂未载入，当前显示简化后备车型。':cfg.desc;
  const st = [(cfg.top - 240) / 100, cfg.accel, cfg.handling, cfg.nos];
  st.forEach((v, i) => document.getElementById('st' + i).style.width = clamp(v * 100, 8, 100) + '%');
}
function toMenu() {
  if(cityShowcase)buildWorld(trackSel);
  
  state = 'menu';
  showroom.visible=true;if(worldGroup)worldGroup.visible=true;document.getElementById('vehicleOverlay')?.classList.add('hidden');
  document.getElementById('tourOverlay')?.classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('hud').style.display = 'none';
  document.getElementById('cockpit').style.display = 'none';
  camMode = 0;
  showLights.forEach(l => l.visible = true);
  ring.visible = true; ped.visible = true;
  headlight.visible = false;
  carObjs.forEach(c => c.group.visible = false);
  syncMenuScene();
}

// ---------------- 比赛流程 ----------------
function placeOnTrack(carObj, distAhead, lat) {
  const idx = wrapIdx(Math.round(distAhead / SEG));
  const p = sPts[idx], n = sNrm[idx], t = sTan[idx];
  carObj.group.position.set(p.x + n.x * lat, 0, p.z + n.z * lat);
  carObj.group.rotation.set(0, Math.atan2(t.x, t.z), 0);
  return idx;
}
let preparingRace=false;
async function startRace() {
  if(preparingRace)return;
  preparingRace=true;
  const chosen=selected,chosenTrack=trackSel,chosenMode=options.mode,chosenDifficulty=diffSel;
  const pool=carObjs.map((c,i)=>i).filter(i=>i!==chosen);
  for(let i=pool.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[pool[i],pool[j]]=[pool[j],pool[i]];}
  const aiIdx=options.mode==='time'?[]:chosenDifficulty===0?pool.slice(0,3):matchedOpponents(CARS,chosen,chosenDifficulty);
  const startButton=document.getElementById('startBtn'),label=startButton.innerHTML;
  startButton.disabled=true;startButton.textContent='准备赛车…';
  try{await Promise.all([chosen,...aiIdx].map(i=>ensureDetailedCar(carObjs[i])));}
  finally{preparingRace=false;startButton.disabled=false;startButton.innerHTML=label;}
  if(selected!==chosen||trackSel!==chosenTrack||options.mode!==chosenMode||diffSel!==chosenDifficulty)return;
  if(cityShowcase)buildWorld(trackSel);
  document.activeElement?.blur();
  const T = TRACKS[trackSel], D = DIFFS[diffSel];
  session.start(T.theme,CARS[selected].recordId||CARS[selected].type);
  Object.assign(player,{contactX:0,contactZ:0,contactCooldown:0,fuel:100,wear:0,temperature:60,longG:0,latG:0,traction:false,abs:false});
  lastCount=4;
  document.getElementById('pitButton').style.display=options.mode==='endurance'?'block':'none';
  const nightish = T.time !== 'day';
  worldGroup.visible=true;showroom.visible=false;document.getElementById('vehicleOverlay')?.classList.add('hidden');document.getElementById('tourOverlay')?.classList.add('hidden');
  state = 'countdown'; countdownT = 3.8; raceTime = 0; paused = false;
  checkpointTiming=new CheckpointTiming(trackLen);
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('hud').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('hud').classList.remove('post-finish');
  document.getElementById('diffTxt').textContent = '难度 ' + D.en + ' · ' + T.city;
  showLights.forEach(l => l.visible = false);
  ring.visible = false; ped.visible = false;
  headlight.visible = nightish;

  player.car = carObjs[selected];
  player.cfg = CARS[selected];
  document.getElementById('cockpit').style.display = 'none';

  ais.length = 0;
  let aiN = 0;
  const gridLat = [2.9, -2.9, 2.9, -2.9];
  const gridDist = [26, 19, 12, 5];
  carObjs.forEach((c, i) => {
    const inRace = (i === selected) || aiIdx.indexOf(i) >= 0;
    c.group.visible = inRace;
    if (!inRace) return;
    c.bodyParts.visible = true;
    c.wheels.forEach(w => w.visible = true);
    c.glowPlane.visible = nightish;
    if (i === selected) return;
    const d = gridDist[aiN], lat = gridLat[aiN];
    placeOnTrack(c, d, lat);
    ais.push({ tactics:freshTactics(aiN%3), lateralVelocity:0, contactYaw:0, car: c, dist: d, speed: 0, driver:{...freshDriver(),temperature:60}, planTimer:0, slow: 0, finished: false, finishTime: null, lat: lat });
    aiN++;
  });
  player.car.bodyParts.visible = !camMode || player.car.detailed;
  player.car.wheels.forEach(w => w.visible = true);
  const pIdx = placeOnTrack(player.car, gridDist[3], gridLat[3]);
  player.pos.copy(player.car.group.position);
  player.heading = player.car.group.rotation.y;
  player.contactX=0;player.contactZ=0;player.speed = 0; player.drift = 0; player.steer = 0;player.throttlePressure=0;player.brakePressure=0;
  player.trackIdx = pIdx; player.s = pIdx / SAMPLES; player.lastS = player.s;
  player.lap = 1;
  player.nosMax = 30 + 70 * player.cfg.nos;
  player.nos = player.nosMax;
  player.lapStart = 0; player.best = null; player.finished = false; player.finishTime = null;

  lastRank = 4;
  camPos.copy(player.pos).add(new THREE.Vector3(-Math.sin(player.heading) * 10, 4, -Math.cos(player.heading) * 10));
  updateHudStatic();
  showMsg('', '');
  clearInput();accumulator=0;renderAlpha=1;cueTick=0;currentCue=null;chasePrevious=null;adaptiveQuality.reset();
  const racers=[player.car,...ais.map(a=>a.car)];
  placeHeadlight(player.pos,player.heading);
  renderMotion.setTargets([...racers.flatMap(c=>[c.group,c.bodyParts,...c.wheels,...c.frontPivots,c.steeringWheel].filter(Boolean)),headlight,headlightTarget]);
}
function resetToTrack() {
  const idx = player.trackIdx;
  const p = sPts[idx], t = sTan[idx];
  session.invalid=true;
  player.pos.set(p.x, 0, p.z);
  player.heading = Math.atan2(t.x, t.z);
  player.contactX=0;player.contactZ=0;player.speed = 0; player.drift = 0;
  player.steer=0;player.car.group.position.copy(player.pos);player.car.group.rotation.set(0,player.heading,0);
  player.car.bodyParts.rotation.set(0,0,0);
  placeHeadlight(player.pos,player.heading);
  renderMotion.reset();accumulator=0;renderAlpha=1;chasePrevious=null;cueTick=0;currentCue=null;
  thud(.2);
}

let msgTimer = 0;
function showMsg(main, sub, dur) {
  const m = document.getElementById('msg'), s = document.getElementById('submsg');
  m.textContent = main; s.textContent = sub || '';
  m.style.opacity = main ? 1 : 0; s.style.opacity = sub ? 1 : 0;
  msgTimer = dur || 1.4;
}

function flashFx(op) { // 冲线/重撞白闪
  const f = document.getElementById('flash');
  f.style.transition = 'none'; f.style.opacity = op;
  requestAnimationFrame(() => requestAnimationFrame(() => { f.style.transition = 'opacity .5s ease-out'; f.style.opacity = 0; }));
}
function finishRace() {
  player.finished = true;
  player.finishTime = raceTime;
  state = 'finishing';
  player.speed=0;player.throttlePressure=0;player.brakePressure=1;
  document.getElementById('hud').classList.add('post-finish');
  showMsg('FINISH!', '你已完赛 · 等待其他车辆冲线', 3);
  flashFx(.85);
  vib([40, 60, 40, 60, 130]); // 冲线震动节拍
  spawnBurst(player.pos.x, 1, player.pos.z, 26, 1, .85, .3, 7, .9, 5); // 金色庆祝粒子
  beep(880, .3, .25, 'triangle'); setTimeout(() => beep(1320, .5, .25, 'triangle'), 200);

}
function showResults() {
  if(!allFinished(player,ais))return;
  state='finished';
  const rows=raceOrder([
    {id:'player',name:player.cfg.nameCn+'(你)',me:true,distance:((player.lap-1)+player.s)*trackLen,finishTime:player.finishTime},
    ...ais.map(a=>({id:a.car.cfg.type,name:a.car.cfg.nameCn,me:false,distance:a.dist,finishTime:a.finishTime}))
  ]).map(r=>({...r,time:r.finishTime}));
  const myRank = rows.findIndex(r => r.me) + 1;
  // 大名次牌 + 总时间数字滚动
  const rkEl = document.getElementById('resRankBig');
  const rkTxt = ['🥇 冠军 P1', '🥈 亚军 P2', '🥉 季军 P3', 'P4'][myRank - 1];
  rkEl.innerHTML = '<div class="rk' + (myRank === 1 ? '' : ' p' + myRank) + '">' + rkTxt + '</div>' +
    '<div class="rks">总时间 <b id="resTimeCnt">0:00.000</b></div>';
  document.getElementById('resTimeCnt').textContent=fmt(player.finishTime);
  const list = document.getElementById('resList');
  list.innerHTML = '';
  rows.forEach((r, i) => {
    const div = document.createElement('div');
    div.className = 'resRow' + (r.me ? ' me' : '') + (i === 0 ? ' first' : '');
    div.style.animationDelay = (.25 + i * .13) + 's';
    div.innerHTML = '<div class="rp">' + (i === 0 ? '🏆' : (i + 1)) + '</div><div class="rn">' + r.name + '</div><div class="rt">' + (fmt(r.time)+(i===0?'':'<small> +'+(r.time-rows[0].time).toFixed(3)+' 秒</small>')) + '</div>';
    list.appendChild(div);
  });
  const T = TRACKS[trackSel], DF = DIFFS[diffSel];
  document.getElementById('resSub').textContent = T.city + ' · ' + T.name + ' · ' + DF.name + ' · 最终排名';
  document.getElementById('bestLapRes').textContent = '⚡ 最快圈速: ' + fmt(player.best) + (rows[0].me ? ' — 冠军!YOU WIN!' : '');
  document.getElementById('results').style.display = 'flex';
  if (myRank === 1) { // 夺冠小号角
    beep(1046, .18, .2, 'triangle');
    setTimeout(() => beep(1318, .18, .2, 'triangle'), 160);
    setTimeout(() => beep(1568, .3, .22, 'triangle'), 320);
  }
  vib(myRank === 1 ? [30, 50, 30, 50, 90] : 30);
}

// ---------------- 玩家物理 ----------------
const fwdV = new THREE.Vector3(), tmpV = new THREE.Vector3();
function updatePlayer(dt) {
  const cfg = player.cfg, D = DIFFS[diffSel];
  const pad=readGamepad();
  const throttle=Math.max(pad.throttle,(keys.KeyW||keys.ArrowUp||vk.gas)?1:0);
  let brake=Math.max(pad.brake,(keys.KeyS||keys.ArrowDown||vk.brake)?1:0);
  const steerIn=pad.steer||(((keys.KeyA||keys.ArrowLeft||vk.left)?1:0)-((keys.KeyD||keys.ArrowRight||vk.right)?1:0));
  const handbrake=!!(keys.Space||vk.drift||pad.handbrake);
  player.nosActive=false;
  const drive=state==='race';
  const turnPlan=aiTargetSpeed(sCurv,SEG,player.trackIdx,cfg,options,2,wetness);
  const assistBrake=drive&&options.cornerAssist&&Math.abs(steerIn)>.25?clamp((player.speed-turnPlan*.96)/6,0,.85):0;brake=Math.max(brake,assistBrake);player.cornerBraking=assistBrake>.05;
  const sensitivity=[.78,1,1.2][SETS.sens];
  const physics=stepVehicle(player,{throttle:drive&&assistBrake<.05?throttle:0,brake:drive?brake:1,steer:steerIn,handbrake},{...cfg,wheelbase:player.car.group.userData.dimensions?.wheelbase||2.65},{...options,steering:sensitivity},dt,wetness);
  const moveDir=physics.moveDir;
  player.pos.x+=Math.sin(moveDir)*player.speed*dt;
  player.pos.z+=Math.cos(moveDir)*player.speed*dt;
  if(drive&&options.mode==='endurance'&&(keys.KeyP||pitHeld)&&player.s<.045&&player.speed<5/3.6){
    session.pit+=dt;player.speed=0;
    if(session.pit>=8){player.fuel=100;player.wear=0;player.temperature=65;session.pit=0;showMsg('补给完成','油量 100% · 全新轮胎',2);}
  }else session.pit=0;
  const slip = Math.abs(player.drift) * Math.abs(player.speed);

  // 漂移胎烟粒子(按画质系数节流)
  if (slip > 2.2 && Math.random() < pBudget * .8) {
    const bx = player.pos.x - Math.sin(player.heading) * 1.6, bz = player.pos.z - Math.cos(player.heading) * 1.6;
    spawnP(bx + (Math.random() - .5) * 1.6, .18, bz + (Math.random() - .5) * 1.6,
      (Math.random() - .5) * 1.2, .8 + Math.random() * .8, (Math.random() - .5) * 1.2,
      .42, .48, .6, .55 + Math.random() * .3, -.6);
  }
  // 氮气尾焰粒子(蓝焰喷溅)
  if (player.nosActive) {
    const hx2 = Math.sin(player.heading), hz2 = Math.cos(player.heading);
    const nFl = pBudget > .5 ? 2 : 1;
    for (let k = 0; k < nFl; k++) {
      const side = Math.random() < .5 ? -.45 : .45;
      spawnP(player.pos.x - hx2 * 2.35 + hz2 * side, .32, player.pos.z - hz2 * 2.35 - hx2 * side,
        -hx2 * (6 + Math.random() * 4), .6 + Math.random() * 1.2, -hz2 * (6 + Math.random() * 4),
        .25 + Math.random() * .2, .72, 1, .22 + Math.random() * .14, 1);
    }
  }

  let bi = player.trackIdx, bd = Infinity;
  for (let o = -40; o <= 40; o++) {
    const j = wrapIdx(player.trackIdx + o);
    const dx = player.pos.x - sPts[j].x, dz = player.pos.z - sPts[j].z;
    const d = dx * dx + dz * dz;
    if (d < bd) { bd = d; bi = j; }
  }
  player.trackIdx = bi;
  player.pos.x+=(player.contactX||0)*dt;player.pos.z+=(player.contactZ||0)*dt;
  player.contactX=(player.contactX||0)*Math.exp(-4*dt);player.contactZ=(player.contactZ||0)*Math.exp(-4*dt);
  const n = sNrm[bi], cp = sPts[bi];
  const lat = (player.pos.x - cp.x) * n.x + (player.pos.z - cp.z) * n.z;
  player.latOnTrack = lat;
  const maxLat = ROAD_W - 1.05;
  if (TRACKS[trackSel].circuit && Math.abs(lat)>maxLat) {
    // Open runoff: grass/sidewalk drag rather than an invisible wall with impact sparks.
    const over=Math.abs(lat)-maxLat;
    player.speed*=Math.exp(-dt*Math.min(1.8,over*.28));
    if(over>2)session.invalid=true;
    if(over>5){const correction=(over-5)*(1-Math.exp(-dt*6));player.pos.x-=n.x*Math.sign(lat)*correction;player.pos.z-=n.z*Math.sign(lat)*correction;}
  } else if (!TRACKS[trackSel].circuit && Math.abs(lat) > maxLat) {
    const over = Math.abs(lat) - maxLat;
    player.pos.x -= n.x * Math.sign(lat) * over;
    player.pos.z -= n.z * Math.sign(lat) * over;
    const impact = clamp(over * .5 + Math.abs(player.speed) * .004, 0, .5);
    player.speed *= (1 - clamp(.10 + over * .1, 0, .3) * dt * 32);
    if (impact > .06) {
      thud(impact); shake = Math.max(shake, impact * .8);
      vib(clamp(impact * 220, 25, 170) | 0); // 碰撞触觉
      spawnBurst(player.pos.x, .5, player.pos.z, 8, 1, .62, .18, 4, .4, 6); // 碰撞火花
    }
    const tHead = Math.atan2(sTan[bi].x, sTan[bi].z);
    let dh = tHead - player.heading;
    while (dh > Math.PI) dh -= TAU; while (dh < -Math.PI) dh += TAU;
    player.heading += clamp(dh, -1, 1) * 1.6 * dt;
  }

  player.lastS = player.s;
  player.s = bi / SAMPLES;
  if(state==='race')session.progress(player.lastS,player.s,raceTime-player.lapStart);
  if (player.lastS > .88 && player.s < .12 && session.checkpoints===3) {
    if (state === 'race') {
      const lapT = raceTime - player.lapStart;
      player.lastCompletedLapTime=lapT;
      const validLap=session.complete(lapT);
      if (validLap) {
        if (player.best == null || lapT < player.best) {
          player.best = lapT;
          showMsg('', '⚡ 最快圈 ' + fmt(lapT), 2);
        }
      }
      player.lapStart = raceTime;
      player.lap++;
      if (player.lap > session.laps) { finishRace(); }
      else if (player.lap === session.laps) { showMsg('最后一圈', 'FINAL LAP', 1.8); beep(660, .2, .2); }
      else { showMsg('LAP ' + player.lap + '/' + session.laps, '', 1.2); }
    }
  } else if (player.lastS < .12 && player.s > .88) {
    session.invalid=true;
  }

  const velDot = Math.sin(moveDir) * sTan[bi].x + Math.cos(moveDir) * sTan[bi].z;
  if (player.speed > 6 && velDot < -.4) player.wrongWay += dt; else player.wrongWay = 0;

  const car=player.car;
  car.group.position.copy(player.pos);
  car.group.rotation.y = player.heading;
  car.group.rotation.z = damp(car.group.rotation.z, -player.steer * clamp(player.speed * .004, 0, .05)*options.bodyMotion, 6, dt);
  const wheelSpin = player.speed * dt / (car.wheelRadius||.34);
  car.wheels.forEach(w => w.rotation.x += wheelSpin);
  car.frontPivots.forEach(p => p.rotation.y = player.steer);
  car.brakeLight.emissiveIntensity=brake?4:.5;
  if(car.steeringWheel){if(car.modelKind==='imported-glb'&&car.steeringWheel.userData.steeringAxis!=='z')car.steeringWheel.rotation.y=-player.steer*3.2;else car.steeringWheel.rotation.z=-player.steer*3.2;}
  car.bodyParts.rotation.x=damp(car.bodyParts.rotation.x,clamp(player.longG,-1.5,1.5)*.028*options.bodyMotion,5,dt);
  car.bodyParts.rotation.z=damp(car.bodyParts.rotation.z,clamp(-player.latG,-1.5,1.5)*.025*options.bodyMotion,5,dt);
  car.flames.forEach(f => {
    f.visible = player.nosActive;
    if (f.visible) { f.scale.set(1, 1, .6 + Math.random() * .9); f.material.color.setHSL(.55 + Math.random() * .06, 1, .6); }
  });
  fwdV.set(Math.sin(player.heading), 0, Math.cos(player.heading));
  placeHeadlight(player.pos,player.heading);

}

// ---------------- AI ----------------
function updateAI(dt) {
  const D = DIFFS[diffSel];
  const playerTotal = (player.lap - 1) + player.s;
  const playerDist = playerTotal * trackLen;
  const traffic=ais.filter(a=>!a.finished).map(a=>({id:a.car.cfg.type,dist:a.dist,lat:a.lat,speed:a.speed,acceleration:a.driver.longG*9.81}));
  if(!player.finished)traffic.push({dist:playerDist,lat:player.latOnTrack||0,speed:player.speed,acceleration:player.longG*9.81});
  for (const a of ais) {
    if (a.finished) continue;
    const idx = wrapIdx(Math.round(a.dist / SEG));
    const curvAhead = Math.max(sCurv[wrapIdx(idx + 30)], sCurv[wrapIdx(idx + 60)], sCurv[idx]);
    a.planTimer-=dt;
    if(a.planTimer<=0){a.plannedSpeed=aiTargetSpeed(sDriveCurv,SEG,idx,a.car.cfg,options,diffSel,wetness,a.driver);a.planTimer=.08;}
    let target=a.plannedSpeed;
    const t0=sTan[idx],t1=sTan[wrapIdx(idx+Math.max(8,Math.round(Math.max(20,a.speed*1.2)/SEG)))];
    const corner=t0.z*t1.x-t0.x*t1.z;
    const avoid=tacticalPlan(a,traffic.filter(o=>o.id!==a.car.cfg.type),trackLen,ROAD_W,dt,a.tactics,corner,raceTime<2);
    a.trafficTarget=avoid.target;
    target=Math.min(target,avoid.target);
    const pit=opponentPit(a,trackLen,session.laps,options,(state==='race'||state==='finishing')?dt:0,wetness);
    target=Math.min(target,pit.target);
    a.commandTarget=target;
    if(a.slow>0){a.slow-=dt;target*=.84;}else if(Math.random()<D.mistake*dt&&curvAhead>.08)a.slow=1.1;
    if(pit.holding)a.speed=0;else if(state==='race'||state==='finishing')a.speed=stepOpponent(a.speed,target,a.car.cfg,options,diffSel,dt,wetness,a.driver,roadCurvature(sDriveCurv,SEG,idx));else a.speed=damp(a.speed,0,4,dt);
    const previousDistance=a.dist;
    a.dist += a.speed * dt;
    const arrival=crossingTime(previousDistance,a.dist,session.laps*trackLen,raceTime,dt);
    if(arrival!==null){a.finished=true;a.finishTime=arrival;a.dist=session.laps*trackLen;a.speed=0;}
    // 采样点间连续插值,消除逐格跳动
    const fIdx = a.dist / SEG;
    const i0 = wrapIdx(Math.floor(fIdx)), i1 = wrapIdx(i0 + 1);
    const fr = fIdx - Math.floor(fIdx);
    const p0 = sPts[i0], p1 = sPts[i1], n0 = sNrm[i0], n1 = sNrm[i1];
    a.laneVelocity=(state==='race'||state==='finishing')?(avoid.lat-a.lat)/dt:0;
    a.lat = (state==='race'||state==='finishing')?avoid.lat:a.lat;
    a.lat+=(a.lateralVelocity||0)*dt;a.lateralVelocity*=Math.exp(-4*dt);
    const over=Math.abs(a.lat)-(ROAD_W-1.05);
    if(over>0){
      if(TRACKS[trackSel].circuit){a.speed*=Math.exp(-dt*Math.min(1.8,over*.28));if(over>5)a.lat-=Math.sign(a.lat)*(over-5)*(1-Math.exp(-dt*6));}
      else{a.lat=Math.sign(a.lat)*(ROAD_W-1.05);a.speed*=1-clamp(.10+over*.1,0,.3)*dt*32;a.lateralVelocity=0;}
    }
    a.contactYaw*=Math.exp(-3*dt);
    a.car.group.position.set(
      lerp(p0.x, p1.x, fr) + lerp(n0.x, n1.x, fr) * a.lat, 0,
      lerp(p0.z, p1.z, fr) + lerp(n0.z, n1.z, fr) * a.lat);
    // 朝向平滑阻尼(处理±π环绕)
    const tn = sTan[wrapIdx(i0 + 8)], tc = sTan[i0];
    const targetHeading = Math.atan2(tn.x + tc.x, tn.z + tc.z);
    if (a.heading == null) a.heading = targetHeading;
    let dh = targetHeading - a.heading;
    while (dh > Math.PI) dh -= TAU; while (dh < -Math.PI) dh += TAU;
    a.heading += dh * (1 - Math.exp(-10 * dt));
    a.car.group.rotation.y = a.heading+a.contactYaw;
    const turnSign=Math.sign(tc.z*tn.x-tc.x*tn.z);
    a.car.frontPivots.forEach(p=>p.rotation.y=a.driver.steer*turnSign);
    const spin = a.speed * dt / (a.car.wheelRadius||.34);
    a.car.wheels.forEach(w => w.rotation.x += spin);
  }
}


// Resolve every pair after movement and before render interpolation captures the pose.
function updateContacts(dt){
  const racers=[...(!player.finished?[{player:true,car:player.car}]:[]),...ais.filter(a=>!a.finished)];
  const bodies=racers.map(a=>{
    const pos=a.player?player.pos:a.car.group.position,h=a.player?player.heading:a.car.group.rotation.y;
    const t=a.player?{x:Math.sin(h),z:Math.cos(h)}:sTan[wrapIdx(Math.round(a.dist/SEG))];
    const n={x:-t.z,z:t.x},speed=a.player?player.speed:a.speed;
    return{x:pos.x,z:pos.z,heading:h,vx:t.x*speed+(a.player?(player.contactX||0):n.x*(a.lateralVelocity+(a.laneVelocity||0))),vz:t.z*speed+(a.player?(player.contactZ||0):n.z*(a.lateralVelocity+(a.laneVelocity||0))),length:4.3,width:2.1};
  });
  const original=bodies.map(b=>({x:b.x,z:b.z})),impacts=resolveContacts(bodies);
  racers.forEach((a,i)=>{
    const b=bodies[i],old=original[i],impact=impacts.get(i)||0;
    if(a.player){
      player.pos.x=b.x;player.pos.z=b.z;
      const hx=Math.sin(player.heading),hz=Math.cos(player.heading);
      player.speed=Math.max(0,b.vx*hx+b.vz*hz);
      player.contactX=b.vx-hx*player.speed;player.contactZ=b.vz-hz*player.speed;
      player.contactCooldown=Math.max(0,(player.contactCooldown||0)-dt);
      if(impact>.3&&player.contactCooldown===0){thud(clamp(impact*.025,.06,.4));shake=Math.max(shake,Math.min(.3,impact*.015));vib(28);player.contactCooldown=.25;}
      player.car.group.position.copy(player.pos);placeHeadlight(player.pos,player.heading);
    }else{
      const idx=wrapIdx(Math.round(a.dist/SEG)),t=sTan[idx],n=sNrm[idx],dx=b.x-old.x,dz=b.z-old.z;
      a.dist+=dx*t.x+dz*t.z;a.lat+=dx*n.x+dz*n.z;
      a.speed=Math.max(0,b.vx*t.x+b.vz*t.z);a.driver.speed=a.speed;
      a.lateralVelocity=b.vx*n.x+b.vz*n.z-(a.laneVelocity||0);
      if(impact>.3){a.contactYaw=clamp(-Math.atan2(a.lateralVelocity,Math.max(8,a.speed)),-.22,.22);a.tactics.mode='recover';a.tactics.cooldown=1.5;}
      a.car.group.position.set(b.x,0,b.z);a.car.group.rotation.y=a.heading+a.contactYaw;
    }
  });
}

// ---------------- 摄像机 ----------------
function presentationRect(){if(state==='tour'&&cityShowcase)return undefined;if(state==='menu')return menuUI?.rect();const overlay=state==='vehicle'?document.getElementById('vehicleOverlay'):state==='tour'?document.getElementById('tourOverlay'):null;if(overlay){const height=Math.max(150,overlay.getBoundingClientRect().top-12);return new DOMRect(0,0,innerWidth,height);}return undefined;}
let chasePrevious=null;
const chasePoint=new THREE.Vector3(),chaseDelta=new THREE.Vector3();
const cabinPose={eye:new THREE.Vector3(),target:new THREE.Vector3(),up:new THREE.Vector3()};
const viewButton=document.getElementById('btnCam');
function updateCamera(dt) {
  if(camMode!==0||!['race','countdown'].includes(state))chasePrevious=null;
  const rect=presentationRect();if(rect)camera.up.set(0,1,0);camera.aspect=rect?rect.width/Math.max(1,rect.height):innerWidth/innerHeight;
  orbitSurface.style.display=state==='vehicle'?'block':'none';if(state==='vehicle')orbitSurface.style.height=rect.height+'px';
  if(state==='menu'||state==='vehicle')document.querySelectorAll('[aria-label="切换自动旋转"]').forEach(b=>{const active=vehicleOrbit.snapshot().automatic;b.setAttribute('aria-pressed',String(active));b.textContent=active?'暂停旋转':'自动旋转';});
  const cityView=state==='tour'||(state==='menu'&&menuTab==='track');
  camera.near=cityView?2:camMode===1&&state==='race'?.04:.15;camera.far=cityView&&TRACKS[trackSel].circuit?12000:cityView?5000:4000;
  if(viewButton.dataset.mode!==String(camMode)){viewButton.dataset.mode=String(camMode);viewButton.innerHTML='<span>切换视角 ↻</span><small>'+['追尾','驾驶舱','车头'][camMode]+' · C</small>';viewButton.setAttribute('aria-label','切换车辆视角，当前'+['追尾','驾驶舱','车头'][camMode]);}
  if(state==='vehicle'){
    const car=carObjs[selected];car.group.rotation.set(0,0,0);
    const target=vehicleView==='wheel'?new THREE.Vector3((car.group.userData.dimensions?.width||1.9)*.45,.70,car.frontPivots[0]?.position.z||1.3):new THREE.Vector3(0,1,0);
    vehicleOrbit.view(camera,dt,target,vehicleView==='wheel'?1.25:2.65);return;
  }
  if(cityShowcase&&(state==='tour'||(state==='menu'&&menuTab==='track'))){tourTime+=Math.min(dt,1/30);cityShowcase.view(camera,tourTime);return;}
  if(state==='tour'||(state==='menu'&&menuTab==='track')){
    if(state==='tour')tourAngle+=Math.min(dt,1/30)*.025;const angle=state==='tour'?tourAngle:Math.atan2(sPts[0].x-cityReport.focus.x,sPts[0].z-cityReport.focus.z);
    const focus=cityReport.focus,radius=(cityReport.previewRadius||(cityReport.key==='alps'?650:440))/Math.min(1,camera.aspect);
    camera.position.set(focus.x+Math.sin(angle)*radius,focus.y+Math.max(cityReport.key==='alps'?520:170,radius*(TRACKS[trackSel].circuit?.95:.38)),focus.z+Math.cos(angle)*radius);
    camera.lookAt(focus);camera.fov=48;camera.updateProjectionMatrix();return;
  }
  if(state==='menu'){
    carObjs[selected].group.rotation.set(0,0,0);vehicleOrbit.view(camera,dt,new THREE.Vector3(0,.92,0),1.6+Math.sin(vehicleOrbit.snapshot().pitch)*1.1);return;
  }
  if(state==='finishing'){
    const watching=ais.filter(a=>!a.finished).sort((a,b)=>b.dist-a.dist)[0];
    if(watching){const p=watching.car.group.position;camera.up.set(0,1,0);fwdV.set(0,0,1).applyQuaternion(watching.car.group.quaternion);
      tmpV.copy(p).addScaledVector(fwdV,-8);tmpV.y=4;camera.position.lerp(tmpV,1-Math.exp(-5*dt));camera.lookAt(p.x,1,p.z);camera.fov=64;camera.updateProjectionMatrix();return;}
  }
  const viewPosition=player.car.group.position;
  fwdV.set(0,0,1).applyQuaternion(player.car.group.quaternion);
  const spd = Math.abs(player.speed);
  if (camMode === 0) {
    camera.up.set(0,1,0);
    const dist = 5.1 + Math.min(spd * .003, .3), h = 1.75 + Math.min(spd * .001, .1);
    tmpV.copy(viewPosition).addScaledVector(fwdV, -dist);tmpV.y+=h;
    // Follow translation immediately; smooth only the relative orbit to avoid speed-dependent lag.
    if(!chasePrevious||chasePrevious.distanceTo(viewPosition)>30)camPos.copy(tmpV);
    else camPos.add(chaseDelta.subVectors(viewPosition,chasePrevious));
    chasePrevious=chasePoint.copy(viewPosition);
    camPos.x = damp(camPos.x, tmpV.x, 8, dt);
    camPos.y = damp(camPos.y, tmpV.y, 8, dt);
    camPos.z = damp(camPos.z, tmpV.z, 8, dt);
    camera.position.copy(camPos);
    if (shake > 0) camera.position.add(tmpV.set((Math.random() - .5) * shake*options.cameraMotion, (Math.random() - .5) * shake*options.cameraMotion, (Math.random() - .5) * shake*options.cameraMotion));
    const spdJit = clamp((spd - 42) / 50, 0, 1) * .014*options.cameraMotion; // 高速路面微震,增强速度感
    if (spdJit > 0 && state === 'race') camera.position.y += Math.sin(raceTime*37) * spdJit;
    tmpV.copy(viewPosition).addScaledVector(fwdV, 5.5);tmpV.y+=1;
    camera.lookAt(tmpV);
  } else {
    const anchor=camMode===1?player.car.cockpit:player.car.bonnet;
    const pose=cameraPose(player.car.bodyParts,anchor,cabinPose,options.cameraMotion);camera.position.copy(pose.eye);camera.up.copy(pose.up);camera.lookAt(pose.target);
  }

  shake = Math.max(0, shake - dt * 1.6);
  const targetFov = camMode===1?68:camMode===2?64:58+Math.pow(Math.min(spd/90,1),.8)*12*options.cameraMotion;
  camera.fov = damp(camera.fov, targetFov, 5, dt);
  camera.updateProjectionMatrix();
}

// ---------------- HUD ----------------
const spdCtx = document.getElementById('speedo').getContext('2d');
const mapCtx = document.getElementById('minimap').getContext('2d');
const slCanvas = document.getElementById('speedlines');
const slCtx = slCanvas.getContext('2d');
function sizeSpeedlines() { slCanvas.width = innerWidth; slCanvas.height = innerHeight; }
sizeSpeedlines();

let mapPath = null;
function buildMinimapPath() {
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
  sPts.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); });
  const pad = 14, W2 = 170;
  const sc = Math.min((W2 - pad * 2) / (maxX - minX), (W2 - pad * 2) / (maxZ - minZ));
  mapPath = { px: x => pad + (x - minX) * sc, pz: z => pad + (z - minZ) * sc };
}
function drawMinimap() {
  const g = mapCtx;
  g.clearRect(0, 0, 170, 170);
  g.save();
  g.beginPath();
  for (let i = 0; i <= SAMPLES; i += 8) {
    const p = sPts[i % SAMPLES];
    const x = mapPath.px(p.x), y = mapPath.pz(p.z);
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
  g.strokeStyle = 'rgba(20,26,40,.9)'; g.lineWidth = 9; g.stroke();
  g.strokeStyle = 'rgba(120,140,180,.85)'; g.lineWidth = 4.5; g.stroke();
  const s0 = sPts[0];
  g.fillStyle = '#b9ff00';
  g.fillRect(mapPath.px(s0.x) - 3, mapPath.pz(s0.z) - 3, 6, 6);
  for (const a of ais) {
    const p = a.car.group.position;
    g.fillStyle = '#ff5555';
    g.beginPath(); g.arc(mapPath.px(p.x), mapPath.pz(p.z), 3.4, 0, TAU); g.fill();
  }
  g.fillStyle = '#b9ff00';
  g.shadowColor = '#b9ff00'; g.shadowBlur = 8;
  g.beginPath(); g.arc(mapPath.px(player.pos.x), mapPath.pz(player.pos.z), 4.4, 0, TAU); g.fill();
  g.restore();
}
function drawSpeedo() {
  const g = spdCtx, W2 = 280, H2 = 320, cx = 150, cy = 195, R = 108;
  g.clearRect(0, 0, W2, H2);
  const kmh = Math.abs(player.speed) * 3.6;
  g.save();
  g.beginPath(); g.arc(cx, cy, R + 12, 0, TAU);
  g.fillStyle = 'rgba(8,10,18,.78)'; g.fill();
  g.strokeStyle = 'rgba(185,255,0,.5)'; g.lineWidth = 2; g.stroke();
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25, MAXK = 340;
  for (let v = 0; v <= MAXK; v += 20) {
    const a = a0 + (a1 - a0) * v / MAXK;
    const inR = v % 60 === 0 ? R - 16 : R - 9;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * inR, cy + Math.sin(a) * inR);
    g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    g.strokeStyle = v >= 260 ? '#ff5533' : '#c6d2e8'; g.lineWidth = v % 60 === 0 ? 3 : 1.5;
    g.stroke();
    if (v % 60 === 0) {
      g.font = 'bold 13px Arial'; g.fillStyle = '#8fa0b8'; g.textAlign = 'center';
      g.fillText(v, cx + Math.cos(a) * (R - 28), cy + Math.sin(a) * (R - 28) + 4);
    }
  }
  const na = a0 + (a1 - a0) * clamp(kmh / MAXK, 0, 1);
  g.beginPath();
  g.moveTo(cx + Math.cos(na + 2.9) * 12, cy + Math.sin(na + 2.9) * 12);
  g.lineTo(cx + Math.cos(na) * (R - 14), cy + Math.sin(na) * (R - 14));
  g.lineTo(cx + Math.cos(na - 2.9) * 12, cy + Math.sin(na - 2.9) * 12);
  g.closePath();
  g.fillStyle = '#ff4422'; g.shadowColor = '#ff4422'; g.shadowBlur = 10; g.fill();
  g.shadowBlur = 0;
  g.beginPath(); g.arc(cx, cy, 7, 0, TAU); g.fillStyle = '#dde4f0'; g.fill();
  g.font = 'italic bold 44px "Arial Black"'; g.textAlign = 'center';
  g.fillStyle = player.nosActive ? '#37e0ff' : '#ffffff';
  g.shadowColor = player.nosActive ? '#37e0ff' : '#b9ff00'; g.shadowBlur = 12;
  g.fillText(Math.round(kmh), cx, cy + 62);
  g.shadowBlur = 0;
  g.font = 'bold 12px Arial'; g.fillStyle = '#8fa0b8';
  g.fillText('KM/H', cx, cy + 80);
  g.font = 'italic bold 20px "Arial Black"'; g.fillStyle = '#b9ff00';
  g.fillText((player.speed < -0.5 ? 'R' : player.gearDisp || 1), cx, cy - 34);
  g.font = 'bold 10px Arial'; g.fillStyle = '#66748a'; g.fillText('GEAR', cx, cy - 22);
  g.restore();
}
function drawSpeedlines() {
  const g = slCtx, W2 = slCanvas.width, H2 = slCanvas.height;
  g.clearRect(0, 0, W2, H2);
  const kmh = Math.abs(player.speed) * 3.6;
  const intensity = player.nosActive ? 1 : clamp((kmh - 210) / 130, 0, .5);
  if (intensity <= 0 || state === 'menu') return;
  const cx = W2 / 2, cy = H2 / 2;
  g.save();
  g.globalCompositeOperation = 'lighter';
  const nLines = Math.floor(36 * intensity * slBudget);
  for (let i = 0; i < nLines; i++) {
    const a = Math.random() * TAU;
    const r0 = 110 + Math.random() * 280;
    const r1 = r0 + 60 + Math.random() * 220 * intensity;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .72);
    g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .72);
    g.strokeStyle = player.nosActive ? 'rgba(120,220,255,' + (.1 + Math.random() * .3) + ')' : 'rgba(220,230,255,' + (.05 + Math.random() * .16) + ')';
    g.lineWidth = 1 + Math.random() * 1.6;
    g.stroke();
  }
  g.restore();
}
// ---------------- 座舱仪表台 ----------------
const cluCtx = document.getElementById('cluster').getContext('2d');
const nosFillEl = document.getElementById('nosFill'), nosBarEl = document.getElementById('nosBar');
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function dial(g, cx, cy, r, max, minor, major, redFrom, val, label, needleCol) {
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25;
  g.beginPath(); g.arc(cx, cy, r + 6, 0, TAU); g.fillStyle = '#0a0c12'; g.fill();
  g.strokeStyle = '#2b3140'; g.lineWidth = 2.5; g.stroke();
  const ra = a0 + (a1 - a0) * redFrom / max;
  g.beginPath(); g.arc(cx, cy, r - 7, ra, a1);
  g.strokeStyle = 'rgba(215,45,45,.85)'; g.lineWidth = 6; g.stroke();
  for (let v = 0; v <= max + .0001; v += minor) {
    const a = a0 + (a1 - a0) * v / max;
    const m = v / major;
    const isMaj = Math.abs(m - Math.round(m)) < .01;
    const ir = isMaj ? r - 15 : r - 9;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * ir, cy + Math.sin(a) * ir);
    g.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
    g.strokeStyle = v >= redFrom ? '#ff5544' : '#c9d4e8';
    g.lineWidth = isMaj ? 2.5 : 1.2;
    g.stroke();
    if (isMaj) {
      g.font = 'bold 11px Arial'; g.fillStyle = '#9fb0c8'; g.textAlign = 'center';
      g.fillText(Math.round(v), cx + Math.cos(a) * (r - 26), cy + Math.sin(a) * (r - 26) + 4);
    }
  }
  g.font = 'bold 9px Arial'; g.fillStyle = '#5a6478'; g.textAlign = 'center';
  g.fillText(label, cx, cy + r * .55);
  const na = a0 + (a1 - a0) * clamp(val / max, 0, 1);
  g.beginPath();
  g.moveTo(cx + Math.cos(na + 2.8) * 8, cy + Math.sin(na + 2.8) * 8);
  g.lineTo(cx + Math.cos(na) * (r - 12), cy + Math.sin(na) * (r - 12));
  g.lineTo(cx + Math.cos(na - 2.8) * 8, cy + Math.sin(na - 2.8) * 8);
  g.closePath();
  g.fillStyle = needleCol; g.shadowColor = needleCol; g.shadowBlur = 8; g.fill();
  g.shadowBlur = 0;
  g.beginPath(); g.arc(cx, cy, 5.5, 0, TAU); g.fillStyle = '#dde4f0'; g.fill();
}
function drawCluster() {
  const g = cluCtx, W = 560, H = 200;
  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(7,8,12,.94)';
  g.strokeStyle = '#242a3a'; g.lineWidth = 3;
  rr(g, 3, 3, W - 6, H - 6, 18); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 1;
  rr(g, 8, 8, W - 16, H - 16, 14); g.stroke();
  const kmh = Math.abs(player.speed) * 3.6;
  dial(g, 122, 102, 76, 8, .5, 1, 6.5, player.rpmDisp || .8, 'RPM×1000', '#ffb03a');
  dial(g, 438, 102, 76, 340, 10, 60, 300, kmh, 'KM/H', '#cfe0ff');
  g.textAlign = 'center';
  g.font = 'italic bold 11px "Arial Black"';
  g.fillStyle = '#5a6478';
  g.fillText('UNDERGROUND', 280, 48);
  g.font = 'italic bold 50px "Arial Black"';
  g.fillStyle = '#b9ff00'; g.shadowColor = '#b9ff00'; g.shadowBlur = 12;
  g.fillText(player.speed < -0.5 ? 'R' : (player.gearDisp || 1), 280, 112);
  g.shadowBlur = 0;
  g.font = 'bold 10px Arial'; g.fillStyle = '#66748a'; g.fillText('GEAR 挡位', 280, 128);
  g.font = 'bold 19px Consolas, monospace'; g.fillStyle = '#e8ecf4';
  g.fillText(Math.round(kmh) + ' km/h', 280, 154);
  const nosF = clamp(player.nos / player.nosMax, 0, 1);
  g.fillStyle = '#101622'; rr(g, 230, 166, 100, 10, 5); g.fill();
  if (nosF > .02) { g.fillStyle = '#37e0ff'; rr(g, 232, 168, 96 * nosF, 6, 3); g.fill(); }
  g.font = 'bold 9px Arial'; g.fillStyle = '#37e0ff'; g.fillText('N₂O', 280, 190);
}
const hudElements=Object.fromEntries(['lapTxt','posBig','tTotal','tLap','tBest','msg','submsg'].map(id=>[id,document.getElementById(id)]));
function hudText(id,text){const element=hudElements[id];if(element.textContent!==text)element.textContent=text;}
function updateHudStatic() {hudText('lapTxt','圈 LAP ' + Math.min(player.lap, session.laps) + '/' + session.laps);}
const renderRaceTiming=mountRaceTiming(document.getElementById('raceTimingRows'));
let telemetryEl;
const wrongWayEl=document.getElementById('wrongway'),wheelSvgEl=document.getElementById('wheelSvg');
let hudTick = 0, lastRank = 4;
function updateHud(dt) {
  drawSpeedo();
  drawMinimap();
  drawSpeedlines();
  if (camMode === 1) drawCluster();
  nosFillEl.style.height = clamp(player.nos / player.nosMax * 100, 0, 100) + '%';
  nosBarEl.classList.toggle('active', player.nosActive);
  hudTick += dt;
  if (hudTick > .1) {
    hudTick = 0;
    const playerTotal = (player.lap - 1) + player.s;
    const rank=renderRaceTiming([
      {id:'player',name:player.cfg.nameCn,distance:playerTotal*trackLen,finishTime:player.finishTime,me:true},
      ...ais.map(a=>({id:a.car.cfg.type,name:a.car.cfg.nameCn,distance:a.dist,finishTime:a.finishTime}))
    ],raceTime,fmt,checkpointTiming);
    if (state === 'race' && raceTime > 6 && rank !== lastRank) { // 超车/被超即时提示
      if (rank < lastRank) { showMsg('', '↑ 超车!P' + rank, 1.2); beep(980, .1, .16, 'triangle'); vib(16); }
      else { showMsg('', '↓ 被超 P' + rank, 1); }
    }
    lastRank = rank;
    const posBig = hudElements.posBig,rankKey=rank+'/'+(ais.length+1);
    if(posBig.dataset.rank!==rankKey){posBig.dataset.rank=rankKey;posBig.innerHTML = rank + '<small>/' + (ais.length+1) + '</small>';posBig.style.color = rank === 1 ? '#b9ff00' : '#fff';}
    updateHudStatic();
    if(state==='finishing'){hudText('submsg','你已完赛 · 等待 '+ais.filter(a=>!a.finished).length+' 辆车冲线');hudElements.submsg.style.opacity=1;msgTimer=1;}
    hudText('tTotal',fmt(player.finishTime??raceTime));
    hudText('tLap',fmt(player.finished?player.lastCompletedLapTime:raceTime-player.lapStart));
    hudText('tBest',fmt(player.best));
    telemetryEl.textContent=(options.mode==='time'?'TIME ATTACK':'MOTORSPORT')+'  /  '+(player.abs?'ABS ': '')+(player.traction?'TCS ': '')+Math.abs(player.latG).toFixed(2)+' G'+'\n'+(wetness?'湿地':'干地')+' · 胎温 '+Math.round(player.temperature)+'°C'+(session.invalid?' · 本圈无效':'')+(options.mode==='endurance'?'\n油量 '+Math.round(player.fuel)+'% · 胎耗 '+Math.round(player.wear*100)+'%'+(session.pit?' · 补给 '+session.pit.toFixed(1)+'/8 秒':''):'');
    wrongWayEl.style.display=player.wrongWay>1?'block':'none';
  }
  wheelSvgEl.style.transform='rotate('+(-player.steer*100)+'deg)';
  if (msgTimer > 0) {
    msgTimer -= dt;
    if (msgTimer <= 0) {
      hudElements.msg.style.opacity = 0;
      hudElements.submsg.style.opacity = 0;
    }
  }
}

// ---------------- 倒计时 ----------------
let lastCount = 4;
function updateCountdown(dt) {
  countdownT -= dt;
  const n = Math.ceil(countdownT - .8);
  if (n !== lastCount && n >= 1 && n <= 3) {
    lastCount = n;
    const T = TRACKS[trackSel];
    showMsg(String(n), T.city + ' · ' + T.name, 1);
    beep(440, .18, .25);
    vib(30);
  }
  if (countdownT <= .8 && state === 'countdown') {
    state = 'race';
    player.lapStart = 0;
    showMsg('GO!', '', 1);
    beep(880, .5, .3, 'triangle');
    vib([35, 45, 70]); // 起步震动节拍
    lastCount = 4;
  }
}

// ---------------- 降水 ----------------
function updateRain(dt) {
  if (!rain.visible) return;
  const arr = rain.geometry.attributes.position.array;
  const cx2 = camera.position.x, cz2 = camera.position.z;
  for (let i = 0; i < rainCount; i++) {
    arr[i * 3 + 1] -= (precipSpeed + (i % 7) * (precipSpeed * .09)) * dt;
    if (arr[i * 3 + 1] < 0) {
      arr[i * 3] = cx2 + (Math.random() - .5) * 160;
      arr[i * 3 + 1] = 45 + Math.random() * 15;
      arr[i * 3 + 2] = cz2 + (Math.random() - .5) * 160;
    }
  }
  rain.geometry.attributes.position.needsUpdate = true;
}

// ---------------- 画质自适应(掉帧自动降负载,回稳后恢复) ----------------
let qLevel = 0, fpsEMA = 60;
const adaptiveQuality=new AdaptiveQuality();
const qualityFloor=()=>options.quality==='low'?3:options.quality==='balanced'?1:0;
const QPIX = [2, 1.5, 1.2, 1.0];
function applyQuality() {
  environmentDetail.setQuality(qLevel>=3?'low':qLevel>=2?'balanced':options.quality);
  graphics.quality(qLevel>=3?'low':qLevel>=2?'balanced':options.quality);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, QPIX[qLevel]));
  renderer.setSize(innerWidth, innerHeight);
  graphics.resize();
  pBudget = [1, .7, .45, .25][qLevel];       // 粒子生成概率
  slBudget = [1, .8, .55, .35][qLevel];      // 速度线密度
  rainGeo.setDrawRange(0, Math.floor(rainCount * [1, .7, .45, .2][qLevel])); // 雨雪数量
}
function autoQuality(rawDt) {
  fpsEMA = lerp(fpsEMA, Math.min(240, 1 / Math.max(rawDt, 1e-4)), .06);
  const next=adaptiveQuality.update(rawDt,qLevel,qualityFloor(),state==='race'&&!paused&&!document.hidden);
  if(next!==qLevel){qLevel=next;applyQuality();}
}

// ---------------- 主循环 ----------------
const clock = new THREE.Clock();
let accumulator=0;
function loop() {
  requestAnimationFrame(loop);
  const rawDt = clock.getDelta();
  let dt = Math.min(rawDt, .1);
  autoQuality(rawDt);
  experience.update(rawDt,state==='race'&&!paused,options.quality);
  if (paused) dt = 0;
  accumulator+=dt;
  while(accumulator>=1/120){
    const step=1/120;
    renderMotion.beforeStep();
    if(state==='countdown')updateCountdown(step);
    if(state==='race'||state==='finishing'||state==='countdown'){
      if(state==='race'||state==='finishing')raceTime+=step;
      if(!player.finished)updatePlayer(step);updateAI(step);updateContacts(step);
      if(checkpointTiming&&(state==='race'||state==='finishing'||state==='countdown')){
        const i=player.trackIdx,offset=(player.pos.x-sPts[i].x)*sTan[i].x+(player.pos.z-sPts[i].z)*sTan[i].z;
        if(!player.finished)checkpointTiming.sample('player',Math.max(0,((player.lap-1)+player.s)*trackLen+clamp(offset,-SEG/2,SEG/2)),raceTime);
        ais.forEach(a=>checkpointTiming.sample(a.car.cfg.type,a.dist,raceTime));
      }
      if(state==='finishing'&&allFinished(player,ais))showResults();
    }
    renderMotion.afterStep();
    accumulator-=step;
  }
  cueTick-=dt;
  if(state==='race'&&!paused&&options.line&&cueTick<=0){
    currentCue=Math.abs(player.latOnTrack||0)>ROAD_W-1.05?{action:'recover',target:null,distance:null}:drivingCue(sDriveCurv,SEG,player.trackIdx,player.cfg,options,player,wetness);cueTick=.1;
  }
  drivingCoach.update(currentCue,state==='race'&&!paused&&options.line&&player.wrongWay<1,!!player.cornerBraking);
  if(state!=='menu'&&state!=='tour'&&state!=='vehicle'){
    updateHud(dt);
  }
  if(raceAudio){
    const active=!paused&&(state==='race'||state==='finishing'||state==='countdown');
    const throttle=state==='countdown'?((keys.KeyW||keys.ArrowUp||vk.gas)?1:0):player.throttlePressure||0;
    const heading=player.heading||0;
    const surface=surfaceFeedback(TRACKS[trackSel].theme,!!TRACKS[trackSel].circuit,ROAD_W,player.latOnTrack||0,player.s,wetness);
    raceAudio.update({surface,grip:gripFeedback(player,options,player.cfg?.handling||.9,wetness),active,type:CARS[selected].type,top:CARS[selected].top,speed:player.speed,throttle,brake:player.brakePressure||0,slip:Math.abs(player.drift)*Math.abs(player.speed),wet:wetness,camera:camMode,countdown:state==='countdown',fuel:player.fuel,opponents:ais.map(a=>{const dx=a.car.group.position.x-player.pos.x,dz=a.car.group.position.z-player.pos.z;return {x:dx*Math.cos(heading)-dz*Math.sin(heading),z:dx*Math.sin(heading)+dz*Math.cos(heading),speed:a.speed,type:a.car.cfg.type};})},Math.min(rawDt,.1));
    const audioState=raceAudio.snapshot();player.gearDisp=audioState.gear;player.rpmDisp=audioState.rpm/1000;
    musicGain.gain.setTargetAtTime(document.hidden||paused?0:active?.035:.10,AC.currentTime,.15);
  }
  const interpolate=['race','countdown','finishing'].includes(state);
  if(interpolate){if(!paused)renderAlpha=accumulator/(1/120);renderMotion.apply(renderAlpha);}
  if(!paused)updateCamera(dt);
  if(quickQuality.dataset.scene!==state){quickQuality.dataset.scene=state;quickQuality.classList.toggle('in-race',state==='race'||state==='countdown');}
  const parked=state==='menu'||state==='vehicle';
  (parked?carObjs[selected]:player.car)?.updateInstruments?.(parked?0:Math.abs(player.speed)*3.6,parked?.8:player.rpmDisp||.8);
  updateRain(dt || .001);
  updateParticles(dt || .001);
  animateCity(worldGroup,dt);
  environmentDetail.update(player.car?.group.position||showroom.position,state==='menu'||state==='tour'||state==='vehicle');
  const previewCity=state==='tour'||(state==='menu'&&menuTab==='track');graphics.render(previewCity&&cityShowcase?cityShowcase.focus:previewCity?cityReport.focus:state==='menu'||state==='vehicle'?showroom.position:player.car.group.position,previewCity,state==='vehicle'||(state==='menu'&&menuTab!=='track'),presentationRect());
  if(interpolate)renderMotion.restore();
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  graphics.resize();
  sizeSpeedlines();
});
addEventListener('orientationchange', () => {
  setTimeout(() => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    graphics.resize();
  sizeSpeedlines();
  }, 300);
});

mountSetup(key=>{refreshQualityLabel();graphics.quality(options.quality);qLevel=options.quality==='low'?3:options.quality==='balanced'?1:0;applyQuality();if(!['quality','bodyMotion','cameraMotion'].includes(key))buildWorld(trackSel);if(state==='menu')syncMenuScene();});
telemetryEl=document.getElementById('telemetry');
const tourButton=document.createElement('button');tourButton.id='tourBtn';tourButton.textContent='城市巡览  ↗';document.getElementById('selPanel').append(tourButton);
const tourOverlay=document.createElement('div');tourOverlay.id='tourOverlay';tourOverlay.className='hidden';tourOverlay.innerHTML='<div><small>CITY EXPLORER</small><h2 id="tourCity"></h2><p id="tourLandmark"></p></div><div class="tour-actions"><button id="tourPrev">上一座城市</button><button id="tourNext">下一座城市</button><button id="tourBack">返回车库</button></div>';document.body.append(tourOverlay);
function enterTour(){
 state='tour';paused=false;document.getElementById('menu').classList.add('hidden');document.getElementById('hud').style.display='none';
 carObjs.forEach(c=>c.group.visible=false);showroom.visible=false;headlight.visible=false;
 tourAngle=Math.atan2(sPts[0].x-cityReport.focus.x,sPts[0].z-cityReport.focus.z);
 if(TRACKS[trackSel].circuit)showCityPreview();
 tourOverlay.classList.remove('hidden');document.getElementById('tourCity').textContent=cityShowcase?.title||CITY_PROFILES[TRACKS[trackSel].theme].label;document.getElementById('tourLandmark').textContent=cityShowcase?.description||cityReport.landmark;
}
tourButton.onclick=enterTour;document.getElementById('tourBack').onclick=toMenu;
for(const [id,step] of [['tourPrev',-1],['tourNext',1]])document.getElementById(id).onclick=()=>{trackSel=(trackSel+step+TRACKS.length)%TRACKS.length;[...trackGrid.children].forEach((c,j)=>c.classList.toggle('sel',j===trackSel));buildWorld(trackSel);enterTour();};
const vehicleOrbit=createVehicleOrbit();let vehicleView='front';
const vehicleButton=document.createElement('button');vehicleButton.id='vehicleBtn';vehicleButton.textContent='车辆鉴赏  ↗';document.getElementById('selPanel').append(vehicleButton);
const vehicleOverlay=document.createElement('div');vehicleOverlay.id='vehicleOverlay';vehicleOverlay.className='hidden';vehicleOverlay.innerHTML='<small>AUTOMOTIVE ATELIER</small><h2 id="vehicleTitle"></h2><p id="vehicleInfo"></p><a href="/models/CREDITS.md" target="_blank" rel="noopener" style="color:#b8c9cc;font-size:11px">车模来源与许可</a><div class="vehicle-actions"><button data-view="front">前侧</button><button data-view="rear">后侧</button><button data-view="side">侧面</button><button data-view="wheel">轮组细节</button><button id="vehiclePrev">上一辆</button><button id="vehicleNext">下一辆</button><button id="vehicleBack">返回车库</button></div>';document.body.append(vehicleOverlay);
function enterVehicle(){state='vehicle';paused=false;updateMenuCar();worldGroup.visible=false;showroom.visible=true;showLights.forEach(l=>l.visible=true);headlight.visible=false;document.getElementById('menu').classList.add('hidden');document.getElementById('hud').style.display='none';vehicleOverlay.classList.remove('hidden');document.getElementById('vehicleTitle').textContent=CARS[selected].nameCn;document.getElementById('vehicleInfo').textContent=carObjs[selected].assetStatus==='loading'?'正在载入精细车模…':carObjs[selected].modelKind==='imported-glb'?'精细 GLB 车模 · 分体轮组 · 多层车漆':'独立曲面车身 · 三维座舱 · 分体制动轮组';if(carObjs[selected].assetCredit)document.getElementById('vehicleInfo').textContent+=' · 模型：'+carObjs[selected].assetCredit;}
vehicleButton.onclick=enterVehicle;document.getElementById('vehicleBack').onclick=toMenu;
vehicleOverlay.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{vehicleView=b.dataset.view;vehicleOrbit.preset(vehicleView);});
for(const [id,step] of [['vehiclePrev',-1],['vehicleNext',1]])document.getElementById(id).onclick=()=>{switchCar(step);enterVehicle();};
let pitHeld=false;
document.getElementById('pitButton').addEventListener('pointerdown',e=>{pitHeld=true;e.target.setPointerCapture(e.pointerId);});
for(const type of ['pointerup','pointercancel'])document.getElementById('pitButton').addEventListener(type,()=>pitHeld=false);
const clearInput=()=>{Object.keys(keys).forEach(k=>keys[k]=false);Object.keys(vk).forEach(k=>vk[k]=false);releaseTouchControls.forEach(release=>release());pitHeld=false;};
addEventListener('blur',()=>{clearInput();if((state==='race'||state==='countdown')&&!paused)togglePause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if((state==='race'||state==='countdown')&&!paused)togglePause();}});
document.querySelector('#title .sub').textContent='13 CARS  /  12 CITIES  /  ONE PASSION';
document.querySelector('#title .en').textContent='MOTORSPORT · 精于每一道弯';
document.querySelectorAll('.statRow')[3].style.display='none';
document.getElementById('btnNos').style.display='none';document.getElementById('nosBar').style.display='none';
document.querySelector('#mirror').textContent='COCKPIT VIEW';
const difficultyNote=document.createElement('p');difficultyNote.id='difficultyNote';difficultyNote.textContent=DIFFS[diffSel].description+' 对手含保守 / 稳定 / 进攻型，无追赶加速。';diffRow.after(difficultyNote);
document.getElementById('carPanel').append(vehicleButton);document.getElementById('setupPanel').prepend(diffRow.previousElementSibling,diffRow,difficultyNote);
const steerLabel=document.createElement('label');steerLabel.innerHTML='转向灵敏度<select id="steeringSensitivity"><option value="0">舒缓</option><option value="1">标准</option><option value="2">灵敏</option></select>';document.getElementById('setupPanel').insertBefore(steerLabel,document.getElementById('sessionNote'));const steerSelect=document.getElementById('steeringSensitivity');steerSelect.value=String(SETS.sens);steerSelect.onchange=()=>{SETS.sens=Number(steerSelect.value);saveSets();document.querySelectorAll('#sensRow .setBtn').forEach(b=>b.classList.toggle('sel',Number(b.dataset.s)===SETS.sens));};
const quickQuality=document.createElement('div');quickQuality.id='quickQuality';quickQuality.setAttribute('role','group');quickQuality.setAttribute('aria-label','画质');
for(const [value,label]of [['low','流畅'],['balanced','均衡'],['high','最高']]){const button=document.createElement('button');button.type='button';button.dataset.quality=value;button.textContent=label;button.addEventListener('click',()=>{setQuality(value);try{localStorage.setItem('uv3-setup',JSON.stringify(options));}catch{}});quickQuality.append(button);}document.body.append(quickQuality);
function refreshQualityLabel(){document.querySelectorAll('#quickQuality button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.quality===options.quality)));}
function setQuality(value){options.quality=value;qLevel=qualityFloor();adaptiveQuality.reset();applyQuality();refreshQualityLabel();try{localStorage.setItem('uv3-setup',JSON.stringify(options));}catch{}}
const experience=mountExperience(setQuality);
refreshQualityLabel();
menuUI=mountMenu(tab=>{menuTab=tab;if(worldGroup)syncMenuScene();});
document.getElementById('menuPreview').append(tourButton);
mountDrivingHelp(clearInput);
const menuViewport=document.getElementById('menuViewport');menuViewport.tabIndex=0;menuViewport.setAttribute('aria-label','三维车辆展示，拖动旋转，滚轮或双指缩放');vehicleOrbit.bind(menuViewport,()=>state==='menu'&&menuTab!=='track');
const orbitSurface=document.createElement('div');orbitSurface.id='vehicleOrbitSurface';orbitSurface.dataset.orbit='true';orbitSurface.tabIndex=0;orbitSurface.setAttribute('aria-label','360 度车辆展示，拖动旋转，滚轮或双指缩放');document.body.append(orbitSurface);vehicleOrbit.bind(orbitSurface,()=>state==='vehicle');
function orbitToolbar(parent){const bar=document.createElement('div');bar.className='orbit-toolbar';bar.innerHTML='<button aria-label="放大车辆">＋</button><button aria-label="缩小车辆">−</button><button aria-label="复位车辆视角">复位</button><button aria-label="切换自动旋转">自动旋转</button>';const buttons=bar.querySelectorAll('button');buttons[0].onclick=()=>vehicleOrbit.scale(.8);buttons[1].onclick=()=>vehicleOrbit.scale(1.25);buttons[2].onclick=()=>{vehicleView='front';vehicleOrbit.reset();};buttons[3].onclick=()=>vehicleOrbit.toggle();parent.append(bar);}
orbitToolbar(document.getElementById('menuPreview'));orbitToolbar(vehicleOverlay);
function refreshMenuPreview(){if(!menuUI)return;document.getElementById('menuPreview').classList.toggle('city-preview',menuTab==='track');document.getElementById('previewKind').textContent=menuTab==='track'?(cityShowcase?'CITY EXPLORER':'CITY PREVIEW'):'360° VEHICLE STUDIO';document.getElementById('previewName').textContent=menuTab==='track'?(cityShowcase?.title||CITY_PROFILES[TRACKS[trackSel].theme].label):CARS[selected].nameCn;document.getElementById('previewStatus').textContent=menuTab==='track'?(cityShowcase?.description||cityReport?.landmark):'拖动旋转 · 滚轮 / 双指缩放';document.getElementById('raceSummary').textContent=CARS[selected].nameCn+' · '+TRACKS[trackSel].city+' / '+DIFFS[diffSel].name;}
function showCityPreview(){
 if(!cityShowcase){cityShowcase=createCityShowcase(TRACKS[trackSel].theme);scene.add(cityShowcase.group);tourTime=0;atmosphere.set(cityShowcase.profile,false);scene.fog=new THREE.Fog(cityShowcase.profile.sky==='night'?0x152538:0xbbbac1,750,2600);}
 worldGroup.visible=false;showLights.forEach(l=>l.visible=false);rain.visible=false;stars.visible=false;
}
function syncMenuScene(){const city=menuTab==='track';if(!city&&cityShowcase)buildWorld(trackSel);document.getElementById('menuPreview')?.classList.toggle('vehicle-loading',!city&&carObjs[selected].assetStatus==='loading');worldGroup.visible=city;showroom.visible=!city;showLights.forEach(l=>l.visible=!city);if(city){carObjs.forEach(c=>c.group.visible=false);if(TRACKS[trackSel].circuit)showCityPreview();}else updateMenuCar();refreshMenuPreview();}
graphics.quality(options.quality);qLevel=options.quality==='low'?3:options.quality==='balanced'?1:0;applyQuality();
const retryModel=document.createElement('button');retryModel.id='retryModel';retryModel.textContent='重新加载精细模型';retryModel.hidden=true;retryModel.onclick=()=>{carObjs[selected].assetStatus=undefined;updateMenuCar();};document.getElementById('carPanel').append(retryModel);

window.addEventListener('vehicle-model-ready',event=>{if(event.detail!==CARS[selected].type)return;if(state==='menu')syncMenuScene();else if(state==='vehicle')enterVehicle();});

buildWorld(trackSel);menuUI.select('car');toMenu();loop();
// Read-only diagnostics for performance and smoke testing.
window.__velocity={snapshot:()=>({state,paused,raceTime,playerFinish:player.finishTime,finishTimes:ais.map(a=>a.finishTime),track:TRACKS[trackSel].theme,trackLength:trackLen,roadWidth:ROAD_W*2,car:CARS[selected].type,speed:player.speed,heading:player.heading,position:player.pos.toArray(),lap:player.lap,laps:session.laps,mode:options.mode,wetness,ai:ais.length,fuel:player.fuel,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,fps:fpsEMA,physicsHz:120,quality:options.quality,qualityLevel:qLevel,audio:raceAudio?.snapshot(),detailed:!!carObjs[selected].detailed,modelKind:carObjs[selected].modelKind,dimensions:carObjs[selected].group.userData.dimensions,wheelCount:carObjs[selected].wheels.length,assetCredit:carObjs[selected].assetCredit,assetError:!!carObjs[selected].assetError,assetStatus:carObjs[selected].assetStatus,bodyLod:carObjs[selected].bodyLod?.getCurrentLevel(),aiLods:ais.map(a=>({car:a.car.cfg.type,level:a.car.bodyLod?.getCurrentLevel()})),steeringAngle:carObjs[selected].steeringWheel?.rotation.z,wheelPositions:carObjs[selected].wheels.map(w=>w.parent.position.toArray()),cockpit:carObjs[selected].cockpit,bonnet:carObjs[selected].bonnet,camera:camMode,motion:{body:options.bodyMotion,camera:options.cameraMotion},cameraEye:camera.position.toArray(),cameraClip:[camera.near,camera.far],pixelRatio:renderer.getPixelRatio(),orbit:vehicleOrbit.snapshot(),pedals:{throttle:player.throttlePressure,brake:player.brakePressure},cornerBraking:!!player.cornerBraking,menuTab,difficulty:diffSel,aiSpeeds:ais.map(a=>a.speed),aiDiagnostics:ais.map(a=>({car:a.car.cfg.type,speed:a.speed,planned:a.plannedSpeed,traffic:a.trafficTarget,target:a.commandTarget,throttle:a.driver.throttlePressure,brake:a.driver.brakePressure,distance:a.dist,lat:a.lat,latG:a.driver.latG,position:a.car.group.position.toArray(),heading:a.car.group.rotation.y,personality:PERSONALITIES[a.tactics.profile].name,tactic:a.tactics.mode,lateralVelocity:a.lateralVelocity,contactYaw:a.contactYaw})),sceneVisibility:{world:worldGroup.visible,showroom:showroom.visible,cars:carObjs.filter(c=>c.group.visible).length},environment:{...cityReport,sky:atmosphere.snapshot(),surfaces:surfaces.status}})};

if(import.meta.env.DEV)window.__raceFinishTest=()=>{
 if(state!=='race')throw new Error('Start a local race first');
 ais.forEach((a,i)=>{a.dist=session.laps*trackLen-80-i*70;a.speed=24;a.driver.speed=24;a.driver.fuel=100;a.planTimer=0;a.finished=false;a.finishTime=null;});
 player.lap=session.laps+1;player.s=0;player.lastCompletedLapTime=raceTime;finishRace();
};

if(import.meta.env.DEV)window.__raceCombatTest=(scenario)=>{
 if(state!=='race'||ais.length!==3)throw new Error('Start a three-opponent race first');
 const cornerDistance=Math.max(40,sCurv.findIndex(k=>k>.3)*SEG);
 const layouts={corner:[[cornerDistance,-1.4,15],[cornerDistance,1.4,15],[cornerDistance+30,0,15]],crowded:[[100,0,20],[104,0,15],[102,1.9,20]],blocked:[[100,0,30],[115,0,8],[112,-2.8,15]],lapped:[[trackLen+100,0,30],[115,0,8],[112,-2.8,15]],scrape:[[100,0,20],[100,2,20],[120,-2.8,20]]};
 const layout=layouts[scenario];if(!layout)throw new Error('Unknown combat scenario');
 ais.forEach((a,i)=>{const [dist,lat,speed]=layout[i];Object.assign(a,{dist,lat,speed,lateralVelocity:scenario==='scrape'&&i===0?3:0,contactYaw:0,tactics:freshTactics(i),planTimer:0,finished:false});a.driver.speed=speed;placeOnTrack(a.car,dist,lat);a.heading=a.car.group.rotation.y;});
 raceTime=Math.max(6,raceTime);renderMotion.reset();
};
