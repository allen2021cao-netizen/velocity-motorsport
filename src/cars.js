const CARS = [
  { nameCn: '保时捷 911 Turbo', nameEn: 'PORSCHE 911 TURBO (993)', type: 'p911',
    color: 0xd9d100, glow: 0xffaa00, top: 296, accel: .84, handling: .90, nos: .78,
    desc: '经典空冷之王,后置引擎带来极致的弯道稳定性。' },
  { nameCn: '法拉利 F40', nameEn: 'FERRARI F40', type: 'f40',
    color: 0xcc1111, glow: 0xff2222, top: 324, accel: .92, handling: .74, nos: .85,
    desc: '恩佐时代的绝唱,V8双涡轮暴力美学,直线之神。' },
  { nameCn: '日产 Skyline GT-R', nameEn: 'NISSAN SKYLINE GT-R R34', type: 'r34',
    color: 0x2957d0, glow: 0x00d0ff, top: 288, accel: .80, handling: .84, nos: 1.0,
    desc: '东瀛战神R34,RB26+四驱,氮气容量全场最大。' },
  { nameCn: '宝马 M3 GTR', nameEn: 'BMW M3 GTR (E46)', type: 'm3',
    color: 0xe8e8f0, glow: 0x3388ff, top: 284, accel: .82, handling: .96, nos: .78,
    desc: '传奇涂装的化身,V8高转咆哮,弯道如刀锋般精准。' },
  { nameCn: '兰博基尼 Diablo SV', nameEn: 'LAMBORGHINI DIABLO SV', type: 'diablo',
    color: 0x7733cc, glow: 0xb14dff, top: 328, accel: .90, handling: .70, nos: .85,
    desc: '楔形传奇大牛,V12咆哮,极速与狂野的化身。' },
  { nameCn: '丰田 Supra', nameEn: 'TOYOTA SUPRA MK4 (A80)', type: 'supra',
    color: 0xff7a1a, glow: 0xffa030, top: 282, accel: .78, handling: .82, nos: .95,
    desc: '牛魔王2JZ,东瀛改装图腾,氮气直线机器。' },
  { nameCn: '道奇 Viper GTS', nameEn: 'DODGE VIPER GTS', type: 'viper',
    color: 0x1a3fd0, glow: 0x3a6aff, top: 310, accel: .88, handling: .70, nos: .80,
    desc: 'V10巨兽,蓝底白条,美式暴力美学。' },
  { nameCn: '奔驰 CLK GTR', nameEn: 'MERCEDES-BENZ CLK GTR', type: 'clk',
    color: 0xc8ccd4, glow: 0xe8e8ff, top: 318, accel: .86, handling: .88, nos: .75,
    desc: '勒芒直通公路的银箭战神,贴地飞行。' },
  { nameCn: '奥迪 R8', nameEn: 'AUDI R8 V10', type: 'r8',
    color: 0x6b7280, glow: 0xdadfff, top: 301, accel: .85, handling: .90, nos: .80,
    desc: '四环旗舰,中置V10+quattro四驱,全能战士。' },
  { nameCn: '迈凯伦 F1', nameEn: 'McLAREN F1', type: 'mcf1',
    color: 0xff9500, glow: 0xffb060, top: 340, accel: .93, handling: .86, nos: .70,
    desc: '中置驾驶席的世纪神话,自吸V12,极速之王。' },
  { nameCn: '福特 GT40', nameEn: 'FORD GT40 MK I', type: 'gt40',
    color: 0x88b8d8, glow: 0x9fd0ff, top: 315, accel: .87, handling: .78, nos: .75,
    desc: '勒芒四连冠传奇,海湾涂装,为击败法拉利而生。' },
  { nameCn: '雪佛兰 Corvette', nameEn: 'CHEVROLET CORVETTE C5', type: 'c5',
    color: 0x9e1b32, glow: 0xff5060, top: 293, accel: .84, handling: .80, nos: .88,
    desc: '美式国民超跑,LS1大排量V8,性价比之王。' },
];
// AI 配速用:车辆综合性能系数(极速55% + 操控25% + 加速20%,车队平均=1)
{
  const avgT = CARS.reduce((s, c) => s + c.top, 0) / CARS.length;
  const avgH = CARS.reduce((s, c) => s + c.handling, 0) / CARS.length;
  const avgA = CARS.reduce((s, c) => s + c.accel, 0) / CARS.length;
  CARS.forEach(c => {
    const raw = (c.top / avgT) * .55 + (c.handling / avgH) * .25 + (c.accel / avgA) * .20;
    c.paceFac = raw; // 无压缩:完全反映车辆真实性能
  });
}


CARS.push({nameCn:'法拉利 458 Italia',nameEn:'FERRARI 458 ITALIA',type:'458',color:0xb31321,glow:0xff3c30,top:325,accel:.88,handling:.93,nos:0,paceFac:1.04,desc:'中置 V8 · 多层车漆、完整座舱与独立轮组。进入驾驶席，感受每一道弯。'});
export { CARS };
