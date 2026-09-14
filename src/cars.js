const CARS = [
  { nameCn: '保时捷 911 Carrera 4S', nameEn: 'PORSCHE 911 CARRERA 4S', type: 'p911',
    color: 0xd9d100, glow: 0xffaa00, top: 296, accel: .84, handling: .90, nos: .78,
    desc: '完整曲面车身、精细灯组与座舱，感受经典 911 的驾驶魅力。' },
  { nameCn: '法拉利 F40', nameEn: 'FERRARI F40', type: 'f40',
    color: 0xcc1111, glow: 0xff2222, top: 324, accel: .92, handling: .74, nos: .85,
    desc: '精细 F40 车体与座舱，独立轮组、灯组及动态主仪表。' },
  { nameCn: '日产 Skyline GT-R', nameEn: 'NISSAN SKYLINE GT-R R34', type: 'r34',
    color: 0x2957d0, glow: 0x00d0ff, top: 288, accel: .80, handling: .84, nos: 1.0,
    desc: '精细 R34 外观，补建右舵座舱、转动方向盘与动态仪表。' },
  { nameCn: '宝马 M4 Competition', nameEn: 'BMW M4 COMPETITION M PACKAGE', type: 'm3',
    color: 0xe8e8f0, glow: 0x3388ff, top: 284, accel: .82, handling: .96, nos: .78,
    desc: '高精度 M Package 车身、独立制动轮组与完整内饰。' },
  { nameCn: '兰博基尼 Diablo SV', nameEn: 'LAMBORGHINI DIABLO SV', type: 'diablo',
    color: 0x7733cc, glow: 0xb14dff, top: 328, accel: .90, handling: .70, nos: .85,
    desc: '原创近似重建：SV 双进气口、引擎盖百叶、独立轮组及座舱细节。' },
  { nameCn: '丰田 Supra A80 改装版', nameEn: 'TOYOTA SUPRA MK4 (A80)', type: 'supra',
    color: 0xff7a1a, glow: 0xffa030, top: 282, accel: .78, handling: .82, nos: .95,
    desc: 'A80 改装车身与内饰，精细灯组、独立轮组和转动方向盘。' },
  { nameCn: '道奇 Viper GTS', nameEn: 'DODGE VIPER GTS', type: 'viper',
    color: 0x1a3fd0, glow: 0x3a6aff, top: 310, accel: .88, handling: .70, nos: .80,
    desc: '原创近似重建：长引擎盖、蓝白条纹、通风鳃与座舱细节。' },
  { nameCn: '奔驰 CLK GTR', nameEn: 'MERCEDES-BENZ CLK GTR', type: 'clk',
    color: 0xc8ccd4, glow: 0xe8e8ff, top: 318, accel: .86, handling: .88, nos: .75,
    desc: '原创近似重建：GT1 通风口、独立灯组、尾翼端板与扩散器。' },
  { nameCn: '奥迪 R8', nameEn: 'AUDI R8 V10', type: 'r8',
    color: 0x6b7280, glow: 0xdadfff, top: 301, accel: .85, handling: .90, nos: .80,
    desc: '精细 R8 外观、分体轮组与补建左舵座舱。' },
  { nameCn: '迈凯伦 F1 LM', nameEn: 'McLAREN F1 LM', type: 'mcf1',
    color: 0xff9500, glow: 0xffb060, top: 340, accel: .93, handling: .86, nos: .70,
    desc: '精细 F1 LM 车体、中央驾驶席与独立轮组；保留 LM 尾翼及空气动力外观。' },
  { nameCn: '福特 GT40', nameEn: 'FORD GT40 MARK II', type: 'gt40',
    color: 0x88b8d8, glow: 0x9fd0ff, top: 315, accel: .87, handling: .78, nos: .75,
    desc: 'Mark II 经典赛车，低矮座舱、精细车体与独立旋转轮组。' },
  { nameCn: '雪佛兰 Corvette', nameEn: 'CHEVROLET CORVETTE C5', type: 'c5',
    color: 0x9e1b32, glow: 0xff5060, top: 293, accel: .84, handling: .80, nos: .88,
    desc: '原创近似重建：翻灯接缝、隆起引擎盖、四圆尾灯与四出排气。' },
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
