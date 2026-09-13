import * as THREE from 'three';
const TAU = Math.PI * 2;
export function vehicleFactory({envTex, plateTex, glowTex}) {
function archedBottom(s, zFront) {
  s.lineTo(-1.88, .2);
  s.absarc(-1.42, .2, .46, Math.PI, 0, true);
  s.lineTo(.96, .2);
  s.absarc(1.42, .2, .46, Math.PI, 0, true);
  s.lineTo(zFront, .2);
}
// 各车型侧面轮廓(挤出成车身)
const PROFILES = {
  p911: {
    W: 1.7, mirrorY: .93, zNose: 2.24, zTail: -2.24,
    body(s) {
      s.moveTo(2.25, .2); s.lineTo(2.3, .46);
      s.quadraticCurveTo(2.28, .6, 2.0, .66);
      s.quadraticCurveTo(1.4, .73, 1.0, .75);
      s.quadraticCurveTo(.7, .78, .48, .96);
      s.lineTo(-1.28, .95);
      s.quadraticCurveTo(-1.75, .88, -2.0, .82);
      s.lineTo(-2.22, .78);
      s.quadraticCurveTo(-2.28, .6, -2.24, .42);
      s.lineTo(-2.18, .2);
      archedBottom(s, 2.25);
    },
    glass(s) {
      s.moveTo(.5, .92);
      s.quadraticCurveTo(.18, 1.28, -.1, 1.3);
      s.quadraticCurveTo(-.7, 1.26, -1.3, .93);
      s.lineTo(-1.05, .88); s.lineTo(.3, .88);
    },
  },
  f40: {
    W: 1.88, mirrorY: .74, zNose: 2.28, zTail: -2.3,
    body(s) {
      s.moveTo(2.28, .2); s.lineTo(2.33, .36);
      s.quadraticCurveTo(2.3, .47, 2.05, .5);
      s.quadraticCurveTo(1.3, .58, .78, .68);
      s.lineTo(-.5, .8);
      s.quadraticCurveTo(-1.4, .82, -2.1, .8);
      s.lineTo(-2.26, .76); s.lineTo(-2.3, .48); s.lineTo(-2.24, .2);
      archedBottom(s, 2.28);
    },
    glass(s) {
      s.moveTo(.75, .66);
      s.quadraticCurveTo(.35, 1.02, .1, 1.05);
      s.lineTo(-.25, 1.04);
      s.quadraticCurveTo(-.5, .98, -.62, .8);
      s.lineTo(-.4, .76); s.lineTo(.5, .66);
    },
  },
  r34: {
    W: 1.76, mirrorY: .86, zNose: 2.2, zTail: -2.22,
    body(s) {
      s.moveTo(2.2, .22); s.lineTo(2.26, .54);
      s.quadraticCurveTo(2.2, .68, 1.9, .71);
      s.quadraticCurveTo(1.1, .78, .78, .8);
      s.lineTo(-1.1, .88); s.lineTo(-1.98, .9); s.lineTo(-2.2, .88);
      s.quadraticCurveTo(-2.26, .66, -2.22, .46);
      s.lineTo(-2.16, .22);
      archedBottom(s, 2.2);
    },
    glass(s) {
      s.moveTo(.72, .8);
      s.quadraticCurveTo(.3, 1.26, -.02, 1.29);
      s.lineTo(-.5, 1.27);
      s.quadraticCurveTo(-.95, 1.1, -1.15, .88);
      s.lineTo(-.85, .84); s.lineTo(.45, .8);
    },
  },
  m3: {
    W: 1.74, mirrorY: .86, zNose: 2.18, zTail: -2.2,
    body(s) {
      s.moveTo(2.18, .2); s.lineTo(2.24, .5);
      s.quadraticCurveTo(2.16, .64, 1.86, .68);
      s.quadraticCurveTo(1.0, .78, .72, .81);
      s.lineTo(-1.3, .89); s.lineTo(-1.95, .91); s.lineTo(-2.16, .87);
      s.quadraticCurveTo(-2.24, .64, -2.2, .44);
      s.lineTo(-2.12, .2);
      archedBottom(s, 2.18);
    },
    glass(s) {
      s.moveTo(.66, .8);
      s.quadraticCurveTo(.22, 1.2, -.08, 1.23);
      s.lineTo(-.58, 1.21);
      s.quadraticCurveTo(-.98, 1.06, -1.22, .88);
      s.lineTo(-.9, .84); s.lineTo(.4, .8);
    },
  },
  diablo: {
    W: 1.92, mirrorY: .68, zNose: 2.3, zTail: -2.28,
    body(s) {
      s.moveTo(2.3, .18); s.lineTo(2.34, .3);
      s.quadraticCurveTo(2.32, .4, 2.1, .44);
      s.quadraticCurveTo(1.3, .52, .82, .62);
      s.lineTo(-1.2, .78);
      s.quadraticCurveTo(-1.7, .79, -2.0, .78);
      s.lineTo(-2.26, .74); s.lineTo(-2.3, .44); s.lineTo(-2.24, .18);
      archedBottom(s, 2.3);
    },
    glass(s) {
      s.moveTo(.78, .6);
      s.quadraticCurveTo(.3, 1.04, 0, 1.07);
      s.lineTo(-.4, 1.06);
      s.quadraticCurveTo(-.75, .95, -.95, .78);
      s.lineTo(-.7, .74); s.lineTo(.5, .6);
    },
  },
  supra: {
    W: 1.8, mirrorY: .87, zNose: 2.2, zTail: -2.2,
    body(s) {
      s.moveTo(2.2, .22); s.lineTo(2.26, .5);
      s.quadraticCurveTo(2.22, .66, 1.95, .7);
      s.quadraticCurveTo(1.1, .8, .75, .82);
      s.lineTo(-1.15, .86);
      s.quadraticCurveTo(-1.85, .86, -2.1, .8);
      s.lineTo(-2.2, .74);
      s.quadraticCurveTo(-2.26, .5, -2.2, .32);
      s.lineTo(-2.14, .22);
      archedBottom(s, 2.2);
    },
    glass(s) {
      s.moveTo(.7, .8);
      s.quadraticCurveTo(.25, 1.22, -.05, 1.24);
      s.lineTo(-.45, 1.22);
      s.quadraticCurveTo(-.9, 1.06, -1.1, .85);
      s.lineTo(-.8, .82); s.lineTo(.45, .8);
    },
  },
  viper: {
    W: 1.9, mirrorY: .8, zNose: 2.3, zTail: -2.26,
    body(s) {
      s.moveTo(2.3, .2); s.lineTo(2.34, .42);
      s.quadraticCurveTo(2.3, .55, 2.05, .6);
      s.quadraticCurveTo(1.2, .68, .4, .72);
      s.lineTo(.1, .74);
      s.lineTo(-1.5, .82); s.lineTo(-2.05, .8); s.lineTo(-2.24, .74);
      s.quadraticCurveTo(-2.3, .5, -2.22, .2);
      archedBottom(s, 2.3);
    },
    glass(s) {
      s.moveTo(.08, .72);
      s.quadraticCurveTo(-.35, 1.1, -.62, 1.12);
      s.lineTo(-1.0, 1.1);
      s.quadraticCurveTo(-1.3, .98, -1.45, .8);
      s.lineTo(-1.15, .78); s.lineTo(-.2, .72);
    },
  },
  clk: {
    W: 1.95, mirrorY: .66, zNose: 2.32, zTail: -2.32,
    body(s) {
      s.moveTo(2.32, .16); s.lineTo(2.36, .3);
      s.quadraticCurveTo(2.34, .42, 2.05, .46);
      s.quadraticCurveTo(1.2, .54, .8, .6);
      s.lineTo(-.7, .72);
      s.quadraticCurveTo(-1.6, .76, -2.2, .74);
      s.lineTo(-2.3, .7); s.lineTo(-2.34, .4); s.lineTo(-2.28, .16);
      archedBottom(s, 2.32);
    },
    glass(s) {
      s.moveTo(.75, .58);
      s.quadraticCurveTo(.35, 1.0, .05, 1.03);
      s.lineTo(-.35, 1.02);
      s.quadraticCurveTo(-.68, .92, -.85, .74);
      s.lineTo(-.6, .7); s.lineTo(.5, .58);
    },
  },
  r8: {
    W: 1.9, mirrorY: .8, zNose: 2.2, zTail: -2.2,
    body(s) {
      s.moveTo(2.2, .2); s.lineTo(2.25, .46);
      s.quadraticCurveTo(2.18, .6, 1.9, .64);
      s.quadraticCurveTo(1.1, .7, .7, .72);
      s.lineTo(-.9, .8);
      s.quadraticCurveTo(-1.6, .82, -2.0, .78);
      s.lineTo(-2.18, .72);
      s.quadraticCurveTo(-2.24, .5, -2.16, .2);
      archedBottom(s, 2.2);
    },
    glass(s) {
      s.moveTo(.65, .7);
      s.quadraticCurveTo(.25, 1.08, -.05, 1.1);
      s.lineTo(-.5, 1.08);
      s.quadraticCurveTo(-.85, .95, -1.05, .78);
      s.lineTo(-.8, .75); s.lineTo(.4, .7);
    },
  },
  mcf1: {
    W: 1.82, mirrorY: .8, zNose: 2.22, zTail: -2.26,
    body(s) {
      s.moveTo(2.22, .18); s.lineTo(2.26, .36);
      s.quadraticCurveTo(2.22, .5, 1.95, .55);
      s.quadraticCurveTo(1.15, .64, .75, .68);
      s.lineTo(-.85, .78);
      s.quadraticCurveTo(-1.6, .8, -2.05, .76);
      s.lineTo(-2.22, .7); s.lineTo(-2.26, .42); s.lineTo(-2.2, .18);
      archedBottom(s, 2.22);
    },
    glass(s) {
      s.moveTo(.7, .66);
      s.quadraticCurveTo(.3, 1.06, 0, 1.09);
      s.lineTo(-.35, 1.08);
      s.quadraticCurveTo(-.65, .98, -.8, .8);
      s.lineTo(-.55, .76); s.lineTo(.45, .66);
    },
  },
  gt40: {
    W: 1.9, mirrorY: .72, zNose: 2.24, zTail: -2.24,
    body(s) {
      s.moveTo(2.24, .18); s.lineTo(2.28, .34);
      s.quadraticCurveTo(2.24, .46, 2.0, .5);
      s.quadraticCurveTo(1.2, .58, .8, .62);
      s.lineTo(-.7, .72);
      s.quadraticCurveTo(-1.5, .74, -2.0, .72);
      s.lineTo(-2.2, .68); s.lineTo(-2.24, .4); s.lineTo(-2.18, .18);
      archedBottom(s, 2.24);
    },
    glass(s) {
      s.moveTo(.75, .6);
      s.quadraticCurveTo(.35, .98, .05, 1.01);
      s.lineTo(-.3, 1.0);
      s.quadraticCurveTo(-.6, .9, -.75, .74);
      s.lineTo(-.5, .7); s.lineTo(.5, .6);
    },
  },
  c5: {
    W: 1.87, mirrorY: .84, zNose: 2.28, zTail: -2.18,
    body(s) {
      s.moveTo(2.28, .2); s.lineTo(2.32, .44);
      s.quadraticCurveTo(2.26, .58, 2.0, .62);
      s.quadraticCurveTo(1.0, .72, .5, .76);
      s.lineTo(-1.2, .86); s.lineTo(-1.9, .87); s.lineTo(-2.12, .83);
      s.quadraticCurveTo(-2.2, .6, -2.14, .2);
      archedBottom(s, 2.28);
    },
    glass(s) {
      s.moveTo(.45, .76);
      s.quadraticCurveTo(.05, 1.16, -.25, 1.18);
      s.lineTo(-.7, 1.16);
      s.quadraticCurveTo(-1.05, 1.0, -1.25, .86);
      s.lineTo(-.95, .82); s.lineTo(.2, .76);
    },
  },
};
function extrudeProfile(fn, width, mat, bevel) {
  const s = new THREE.Shape();
  fn(s);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: width, bevelEnabled: true, bevelThickness: bevel || .08,
    bevelSize: bevel || .09, bevelSegments: 5, curveSegments: 20,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  // Taper the shoulders and bumpers in three dimensions instead of a uniform extrusion.
  const positions=geo.attributes.position;
  for(let i=0;i<positions.count;i++){
    const z=Math.abs(positions.getZ(i)),y=positions.getY(i);
    const bumper=1-Math.max(0,z-1.65)*.19;
    const shoulder=1-Math.max(0,y-.57)*.25;
    positions.setX(i,positions.getX(i)*bumper*shoulder);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}
function buildCar(cfg) {
  const g = new THREE.Group();
  const P = PROFILES[cfg.type];
  const W = P.W;
  const paint = new THREE.MeshPhongMaterial({ color: cfg.color, shininess: 110, specular: 0xccccdd,
    envMap: envTex, combine: THREE.MixOperation, reflectivity: .28 });
  const dark = new THREE.MeshPhongMaterial({ color: 0x14161d, shininess: 45, specular: 0x445566 });
  const glass = new THREE.MeshPhongMaterial({ color: 0x0d1420, shininess: 180, specular: 0xaabbdd,
    envMap: envTex, combine: THREE.MixOperation, reflectivity: .5 });
  const chrome = new THREE.MeshPhongMaterial({ color: 0xb8bfcc, shininess: 160, specular: 0xffffff,
    envMap: envTex, combine: THREE.MixOperation, reflectivity: .65 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
  const redMat = new THREE.MeshBasicMaterial({ color: 0xd41818 });
  const bodyParts = new THREE.Group();

  // 车身壳体 + 玻璃座舱
  bodyParts.add(extrudeProfile(P.body, W - .18, paint));
  bodyParts.add(extrudeProfile(P.glass, W - .62, glass, .05));

  // 侧裙 / 前铲 / 后扩散器 / 进气口
  const rocker = new THREE.Mesh(new THREE.BoxGeometry(W + .02, .09, 1.8), dark);
  rocker.position.set(0, .18, 0); bodyParts.add(rocker);
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(W - .12, .05, .3), dark);
  splitter.position.set(0, .15, P.zNose - .12); bodyParts.add(splitter);
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(W - .3, .06, .42), dark);
  diffuser.position.set(0, .2, P.zTail + .1); diffuser.rotation.x = .3; bodyParts.add(diffuser);
  const intake = new THREE.Mesh(new THREE.BoxGeometry(W * .5, .13, .08), dark);
  intake.position.set(0, .35, P.zNose + .02); bodyParts.add(intake);

  // 车牌
  const plateG = new THREE.PlaneGeometry(.46, .12);
  const plateM = new THREE.MeshBasicMaterial({ map: plateTex });
  const pf = new THREE.Mesh(plateG, plateM);
  pf.position.set(0, .28, P.zNose + .075); bodyParts.add(pf);
  const pr = new THREE.Mesh(plateG, plateM);
  pr.position.set(0, .32, P.zTail - .06); pr.rotation.y = Math.PI; bodyParts.add(pr);

  // 后视镜
  for (const sd of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.16, .028, .05), paint);
    arm.position.set(sd * (W / 2 + .06), P.mirrorY, .58); bodyParts.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(.07, .1, .15), paint);
    head.position.set(sd * (W / 2 + .16), P.mirrorY + .02, .56); bodyParts.add(head);
  }

  // 灯光光晕
  const lamp = (x, y, z, color, size) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: .8, depthWrite: false }));
    spr.scale.set(size*.35, size*.35, 1); spr.material.opacity=.45; spr.position.set(x, y, z); bodyParts.add(spr);
  };
  const discCyl = new THREE.CylinderGeometry(1, 1, .035, 12);
  discCyl.rotateX(Math.PI / 2);

  // —— 车型专属细节 ——
  let exhaust = [[-.42, .28, .07], [.42, .28, .07]];
  if (cfg.type === 'p911') {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1.5, .05, .5), paint); // 鲸尾
    tail.position.set(0, .88, -1.92); tail.rotation.x = -.06; bodyParts.add(tail);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(1.5, .09, .07), dark);
    lip.position.set(0, .93, -2.13); bodyParts.add(lip);
    for (const sd of [-1, 1]) { // 立式圆大灯
      const hl = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), lampMat);
      hl.scale.set(1, .85, .5); hl.position.set(sd * .56, .58, 2.16); bodyParts.add(hl);
      lamp(sd * .56, .58, 2.28, 0xcfe4ff, 1.3);
    }
    const tl = new THREE.Mesh(new THREE.BoxGeometry(1.44, .09, .05), redMat); // 贯穿尾灯
    tl.position.set(0, .6, -2.27); bodyParts.add(tl);
    lamp(-.6, .6, -2.35, 0xff2233, 1.0); lamp(.6, .6, -2.35, 0xff2233, 1.0);
    exhaust = [[-.5, .28, .07], [.5, .28, .07]];
  } else if (cfg.type === 'f40') {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(W, .09, .44), paint); // 一体大尾翼
    wing.position.set(0, 1.04, -1.9); bodyParts.add(wing);
    for (const sd of [-1, 1]) {
      const plate2 = new THREE.Mesh(new THREE.BoxGeometry(.07, .3, .5), paint);
      plate2.position.set(sd * (W / 2 - .05), .88, -1.92); bodyParts.add(plate2);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.32, .06, .06), lampMat); // 扁平灯组
      hl.position.set(sd * .6, .46, 2.24); bodyParts.add(hl);
      lamp(sd * .6, .46, 2.33, 0xcfe4ff, 1.2);
      for (const xo of [.44, .66]) { // 四圆尾灯
        const tl = new THREE.Mesh(discCyl, redMat);
        tl.scale.set(.085, .085, 1); tl.position.set(sd * xo, .58, -2.31); bodyParts.add(tl);
      }
      lamp(sd * .55, .58, -2.4, 0xff2233, 1.0);
    }
    for (let i = 0; i < 3; i++) { // 车头百叶
      const v = new THREE.Mesh(new THREE.BoxGeometry(.55, .015, .09), dark);
      v.position.set(0, .555 + i * .025, 1.4 - i * .24); bodyParts.add(v);
    }
    exhaust = [[-.15, .32, .06], [0, .32, .06], [.15, .32, .06]]; // 标志性三出
  } else if (cfg.type === 'r34') {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(.56, .07, .66), paint); // 引擎盖鼓包
    scoop.position.set(0, .76, 1.3); bodyParts.add(scoop);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, .42), paint); // 双层尾翼
    wing.position.set(0, 1.3, -2.02); wing.rotation.x = -.08; bodyParts.add(wing);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.58, .03, .3), dark);
    blade.position.set(0, 1.14, -2.0); bodyParts.add(blade);
    for (const sd of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.08, .34, .24), dark);
      strut.position.set(sd * .6, 1.06, -2.02); bodyParts.add(strut);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.3, .11, .06), lampMat); // 棱角大灯
      hl.position.set(sd * .56, .58, 2.2); bodyParts.add(hl);
      lamp(sd * .56, .58, 2.3, 0xcfe4ff, 1.3);
      for (const xo of [.46, .7]) { // 招牌四圆尾灯
        const tl = new THREE.Mesh(discCyl, redMat);
        tl.scale.set(.105, .105, 1); tl.position.set(sd * xo, .68, -2.25); bodyParts.add(tl);
        lamp(sd * xo, .68, -2.33, 0xff2233, .8);
      }
    }
    const grille = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .05), dark);
    grille.position.set(0, .56, 2.25); bodyParts.add(grille);
    exhaust = [[-.5, .3, .1]]; // 单边大口径
  } else if (cfg.type === 'm3') {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.66, .04, .42), dark); // GTR 碳纤尾翼
    wing.position.set(0, 1.18, -2.05); wing.rotation.x = -.08; bodyParts.add(wing);
    for (const sd of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.06, .28, .2), paint);
      strut.position.set(sd * .45, 1.02, -2.0); bodyParts.add(strut);
      for (const xo of [.48, .64]) { // 四眼大灯
        const hl = new THREE.Mesh(discCyl, lampMat);
        hl.scale.set(.075, .075, 1); hl.position.set(sd * xo, .57, 2.15); bodyParts.add(hl);
      }
      lamp(sd * .56, .57, 2.26, 0xcfe4ff, 1.3);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.4, .1, .05), redMat);
      tl.position.set(sd * .55, .68, -2.23); bodyParts.add(tl);
      lamp(sd * .55, .68, -2.31, 0xff2233, .9);
      const kidney = new THREE.Mesh(new THREE.BoxGeometry(.2, .11, .05), dark); // 双肾格栅
      kidney.position.set(sd * .14, .55, 2.22); bodyParts.add(kidney);
    }
    const stripeG = new THREE.PlaneGeometry(.12, 1.1); // M 条纹
    for (const [xo, col] of [[-.32, 0x2255cc], [-.17, 0xcc2222]]) {
      const st = new THREE.Mesh(stripeG, new THREE.MeshBasicMaterial({ color: col }));
      st.position.set(xo, .77, 1.25);
      st.rotation.x = -Math.PI / 2 + .1;
      bodyParts.add(st);
    }
    exhaust = [[-.32, .28, .065], [-.16, .28, .065]];
  } else if (cfg.type === 'diablo') {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, .4), paint); // SV 尾翼
    wing.position.set(0, 1.0, -2.06); wing.rotation.x = -.1; bodyParts.add(wing);
    for (const sd of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.07, .24, .2), dark);
      strut.position.set(sd * .55, .86, -2.04); bodyParts.add(strut);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.32, .05, .05), lampMat); // 弹出灯缝
      hl.position.set(sd * .55, .48, 2.28); bodyParts.add(hl);
      lamp(sd * .55, .48, 2.37, 0xcfe4ff, 1.2);
      const naca = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .72), dark); // 侧进气
      naca.position.set(sd * (W / 2 + .01), .56, -.5); bodyParts.add(naca);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.42, .12, .05), redMat);
      tl.position.set(sd * .55, .58, -2.32); bodyParts.add(tl);
      lamp(sd * .55, .58, -2.4, 0xff2233, .9);
    }
    for (let i = 0; i < 3; i++) { // 引擎盖百叶
      const v = new THREE.Mesh(new THREE.BoxGeometry(1.15, .015, .1), dark);
      v.position.set(0, .795, -1.25 - i * .22); bodyParts.add(v);
    }
    exhaust = [[-.18, .28, .055], [-.06, .28, .055], [.06, .28, .055], [.18, .28, .055]]; // 四出
  } else if (cfg.type === 'supra') {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, .38), paint); // 环形高尾翼
    blade.position.set(0, 1.26, -2.0); blade.rotation.x = -.06; bodyParts.add(blade);
    for (const sd of [-1, 1]) {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.07, .42, .12), paint);
      strut.position.set(sd * .62, 1.02, -2.02); strut.rotation.x = .15; bodyParts.add(strut);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), lampMat); // 圆润大灯
      hl.scale.set(1, .7, .45); hl.position.set(sd * .58, .6, 2.12); bodyParts.add(hl);
      lamp(sd * .58, .6, 2.24, 0xcfe4ff, 1.3);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.5, .13, .05), redMat); // 宽椭圆尾灯
      tl.position.set(sd * .5, .64, -2.24); bodyParts.add(tl);
      lamp(sd * .5, .64, -2.32, 0xff2233, 1.0);
    }
    exhaust = [[.45, .3, .105]]; // 单边大炮筒
  } else if (cfg.type === 'viper') {
    const stripeG2 = new THREE.PlaneGeometry(.15, 1.7); // 双白条(引擎盖)
    for (const sd of [-1, 1]) {
      const st = new THREE.Mesh(stripeG2, new THREE.MeshBasicMaterial({ color: 0xf0f2f5 }));
      st.position.set(sd * .12, .675, 1.25);
      st.rotation.x = -Math.PI / 2 + .07;
      bodyParts.add(st);
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 1.5, 8), chrome); // 侧排气
      pipe.rotation.x = Math.PI / 2; pipe.position.set(sd * (W / 2 + .04), .23, .1); bodyParts.add(pipe);
      const hl = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), lampMat); // 泪眼大灯
      hl.scale.set(1.1, .6, .4); hl.position.set(sd * .6, .5, 2.22); bodyParts.add(hl);
      lamp(sd * .6, .5, 2.34, 0xcfe4ff, 1.2);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.42, .11, .05), redMat);
      tl.position.set(sd * .5, .66, -2.28); bodyParts.add(tl);
      lamp(sd * .5, .66, -2.36, 0xff2233, .9);
    }
    exhaust = [[-.42, .26, .07], [.42, .26, .07]];
  } else if (cfg.type === 'clk') {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(.24, .12, .7), dark); // 车顶进气道
    scoop.position.set(0, 1.06, -.35); bodyParts.add(scoop);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, .04, .45), dark); // 勒芒大尾翼
    wing.position.set(0, 1.1, -2.18); bodyParts.add(wing);
    for (const sd of [-1, 1]) {
      const plate3 = new THREE.Mesh(new THREE.BoxGeometry(.05, .2, .5), dark);
      plate3.position.set(sd * .93, 1.0, -2.16); bodyParts.add(plate3);
      const strut = new THREE.Mesh(new THREE.BoxGeometry(.07, .3, .15), dark);
      strut.position.set(sd * .5, .92, -2.2); bodyParts.add(strut);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.34, .07, .06), lampMat); // 细长灯组
      hl.position.set(sd * .58, .48, 2.3); bodyParts.add(hl);
      lamp(sd * .58, .48, 2.4, 0xcfe4ff, 1.2);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.5, .07, .04), redMat);
      tl.position.set(sd * .5, .6, -2.34); bodyParts.add(tl);
      lamp(sd * .5, .6, -2.42, 0xff2233, .8);
    }
    exhaust = [[-.25, .3, .08], [.25, .3, .08]];
  } else if (cfg.type === 'r8') {
    for (const sd of [-1, 1]) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(.05, .38, .95), dark); // 侧刃
      blade.position.set(sd * (W / 2 + .01), .52, -.55); bodyParts.add(blade);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.36, .05, .06), lampMat); // LED日行灯
      hl.position.set(sd * .58, .56, 2.14); bodyParts.add(hl);
      lamp(sd * .58, .56, 2.24, 0xcfe4ff, 1.2);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.4, .08, .05), redMat);
      tl.position.set(sd * .52, .66, -2.22); bodyParts.add(tl);
      lamp(sd * .52, .66, -2.3, 0xff2233, .9);
    }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(1.4, .05, .3), dark); // 升降尾翼
    lip.position.set(0, .92, -2.0); bodyParts.add(lip);
    exhaust = [[-.4, .3, .09], [.4, .3, .09]];
  } else if (cfg.type === 'mcf1') {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(.3, .16, .6), dark); // 车顶进气
    scoop.position.set(0, 1.12, -.35); bodyParts.add(scoop);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(1.5, .04, .26), paint);
    lip.position.set(0, .84, -2.16); lip.rotation.x = -.2; bodyParts.add(lip);
    for (const sd of [-1, 1]) {
      const hl = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), lampMat);
      hl.scale.set(1, .7, .5); hl.position.set(sd * .55, .5, 2.18); bodyParts.add(hl);
      lamp(sd * .55, .5, 2.28, 0xcfe4ff, 1.2);
      const tl = new THREE.Mesh(discCyl, redMat);
      tl.scale.set(.09, .09, 1); tl.position.set(sd * .55, .62, -2.28); bodyParts.add(tl);
      lamp(sd * .55, .62, -2.36, 0xff2233, .9);
    }
    exhaust = [[-.22, .3, .06], [-.08, .3, .06], [.08, .3, .06], [.22, .3, .06]]; // 中置四出
  } else if (cfg.type === 'gt40') {
    const orangeM = new THREE.MeshBasicMaterial({ color: 0xff7300 }); // 海湾橙中条
    const st1 = new THREE.Mesh(new THREE.PlaneGeometry(.3, 1.5), orangeM);
    st1.position.set(0, .585, 1.4); st1.rotation.x = -Math.PI / 2 + .06; bodyParts.add(st1);
    const st2 = new THREE.Mesh(new THREE.PlaneGeometry(.3, .8), orangeM);
    st2.position.set(0, 1.045, -.12); st2.rotation.x = -Math.PI / 2; bodyParts.add(st2);
    for (const sd of [-1, 1]) {
      for (const xo of [.42, .62]) { // 双圆覆盖大灯
        const hl = new THREE.Mesh(discCyl, lampMat);
        hl.scale.set(.08, .08, 1); hl.position.set(sd * xo, .46, 2.2); bodyParts.add(hl);
      }
      lamp(sd * .52, .46, 2.3, 0xcfe4ff, 1.2);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(.36, .09, .05), redMat);
      tl.position.set(sd * .5, .6, -2.26); bodyParts.add(tl);
      lamp(sd * .5, .6, -2.34, 0xff2233, .9);
    }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(1.7, .05, .2), dark);
    lip.position.set(0, .76, -2.22); bodyParts.add(lip);
    exhaust = [[-.2, .3, .06], [-.07, .3, .06], [.07, .3, .06], [.2, .3, .06]];
  } else if (cfg.type === 'c5') {
    for (const sd of [-1, 1]) {
      const pop = new THREE.Mesh(new THREE.BoxGeometry(.4, .05, .3), paint); // 翻灯盖板
      pop.position.set(sd * .55, .625, 1.9); bodyParts.add(pop);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(.34, .05, .05), lampMat);
      hl.position.set(sd * .55, .5, 2.26); bodyParts.add(hl);
      lamp(sd * .55, .5, 2.36, 0xcfe4ff, 1.1);
      for (const xo of [.4, .62]) { // 四圆尾灯
        const tl = new THREE.Mesh(discCyl, redMat);
        tl.scale.set(.1, .1, 1); tl.position.set(sd * xo, .66, -2.2); bodyParts.add(tl);
      }
      lamp(sd * .5, .66, -2.28, 0xff2233, .9);
    }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(1.5, .06, .24), paint);
    lip.position.set(0, .95, -2.05); bodyParts.add(lip);
    exhaust = [[-.18, .26, .07], [.18, .26, .07]];
  }

  // 排气管 + 氮气火焰
  const flames = [];
  for (const [ex, ey, er] of exhaust) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(er, er + .015, .34, 10), chrome);
    tip.rotation.x = Math.PI / 2; tip.position.set(ex, ey, P.zTail - .02); bodyParts.add(tip);
  }
  for (const i of [0, exhaust.length - 1]) {
    const flameG = new THREE.ConeGeometry(.12, .9, 8);
    flameG.rotateX(-Math.PI / 2);
    const flame = new THREE.Mesh(flameG, new THREE.MeshBasicMaterial({ color: 0x66c8ff, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false }));
    flame.position.set(exhaust[i][0], exhaust[i][1], P.zTail - .55); flame.visible = false;
    bodyParts.add(flame); flames.push(flame);
  }
  // 底盘霓虹
  const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.4),
    new THREE.MeshBasicMaterial({ map: glowTex, color: cfg.glow, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
  glowPlane.rotation.x = -Math.PI / 2; glowPlane.position.y = .08;
  bodyParts.add(glowPlane);
  g.add(bodyParts);

  // —— 车轮:轮胎+辐条轮毂+刹车盘 ——
  const tireMat = new THREE.MeshPhongMaterial({ color: 0x0a0b0e, shininess: 18, specular: 0x223344 });
  const rimMat = new THREE.MeshPhongMaterial({ color: 0xd0d5e0, shininess: 140, specular: 0xffffff,
    envMap: envTex, combine: THREE.MixOperation, reflectivity: .5 });
  const barrelMat = new THREE.MeshPhongMaterial({ color: 0x1c1f28, shininess: 60 });
  const discMat = new THREE.MeshPhongMaterial({ color: 0x9298a4, shininess: 90, specular: 0xccccdd });
  const tireGeo = new THREE.TorusGeometry(.25, .1, 10, 20);
  tireGeo.rotateY(Math.PI / 2);
  const barrelGeo = new THREE.CylinderGeometry(.2, .2, .24, 16, 1, true);
  barrelGeo.rotateZ(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(.05, .19, .05);
  const capGeo = new THREE.CylinderGeometry(.055, .055, .26, 10);
  capGeo.rotateZ(Math.PI / 2);
  const discGeo = new THREE.CylinderGeometry(.155, .155, .05, 14);
  discGeo.rotateZ(Math.PI / 2);
  const wheels = [], frontPivots = [];
  for (const [x, z, front] of [[-.84, 1.42, 1], [.84, 1.42, 1], [-.84, -1.42, 0], [.84, -1.42, 0]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, .34, z);
    const spin = new THREE.Group();
    spin.add(new THREE.Mesh(tireGeo, tireMat));
    spin.add(new THREE.Mesh(barrelGeo, barrelMat));
    spin.add(new THREE.Mesh(discGeo, discMat));
    for (let i = 0; i < 5; i++) {
      const wrap = new THREE.Group();
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.position.y = .1;
      wrap.add(spoke);
      wrap.rotation.x = i / 5 * TAU;
      spin.add(wrap);
    }
    spin.add(new THREE.Mesh(capGeo, rimMat));
    pivot.add(spin);
    g.add(pivot);
    wheels.push(spin);
    if (front) frontPivots.push(pivot);
  }
  return { group: g, bodyParts, wheels, frontPivots, flames, glowPlane, cfg };
}

return buildCar;
}
