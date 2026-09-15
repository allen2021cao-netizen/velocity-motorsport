import {VEHICLE_TRAITS} from './vehicle-performance';
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
  { nameCn: '兰博基尼 Veneno', nameEn: 'LAMBORGHINI VENENO', type: 'diablo', recordId:'LAMBORGHINI VENENO',
    color: 0xe95212, glow: 0xffaa55, top: 355, accel: 0.96, handling: 0.91, nos: 0.85,
    desc: '6.5L V12 · 精细车身、复杂空气动力套件与独立轮组。' },
  { nameCn: '丰田 Supra A80 改装版', nameEn: 'TOYOTA SUPRA MK4 (A80)', type: 'supra',
    color: 0xff7a1a, glow: 0xffa030, top: 282, accel: .78, handling: .82, nos: .95,
    desc: 'A80 改装车身与内饰，精细灯组、独立轮组和转动方向盘。' },
  { nameCn: '道奇 Challenger Concept', nameEn: 'DODGE CHALLENGER CONCEPT', type: 'viper', recordId:'DODGE CHALLENGER CONCEPT',
    color: 0xc94f15, glow: 0xffaa55, top: 280, accel: 0.7, handling: 0.76, nos: 0.8,
    desc: '6.1L HEMI V8 · 长轴距美式肌肉车，精细复古灯组及车身。' },
  { nameCn: '奔驰 SLR McLaren', nameEn: 'MERCEDES-BENZ SLR McLAREN', type: 'clk', recordId:'MERCEDES-BENZ SLR McLAREN',
    color: 0xc8ccd4, glow: 0xffaa55, top: 334, accel: 0.87, handling: 0.84, nos: 0.75,
    desc: '5.5L 机械增压 V8 · 精细长车头、侧排气与完整内饰。' },
  { nameCn: '奥迪 R8', nameEn: 'AUDI R8 V10', type: 'r8',
    color: 0x6b7280, glow: 0xdadfff, top: 301, accel: .85, handling: .90, nos: .80,
    desc: '精细 R8 外观、分体轮组与补建左舵座舱。' },
  { nameCn: '迈凯伦 F1 LM', nameEn: 'McLAREN F1 LM', type: 'mcf1',
    color: 0xff9500, glow: 0xffb060, top: 340, accel: .93, handling: .86, nos: .70,
    desc: '精细 F1 LM 车体、中央驾驶席与独立轮组；保留 LM 尾翼及空气动力外观。' },
  { nameCn: '福特 GT40', nameEn: 'FORD GT40 MARK II', type: 'gt40',
    color: 0x88b8d8, glow: 0x9fd0ff, top: 315, accel: .87, handling: .78, nos: .75,
    desc: 'Mark II 经典赛车，低矮座舱、精细车体与独立旋转轮组。' },
  { nameCn: '雪佛兰 Corvette C7', nameEn: 'CHEVROLET CORVETTE C7 STINGRAY', type: 'c5', recordId:'CHEVROLET CORVETTE C7 STINGRAY',
    color: 0x2982ab, glow: 0xffaa55, top: 290, accel: 0.84, handling: 0.9, nos: 0.88,
    desc: '6.2L V8 · Stingray 精细车身、通风口、灯组及四出排气。' },
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
CARS.forEach(car=>Object.assign(car,VEHICLE_TRAITS[car.type]));
export { CARS };
