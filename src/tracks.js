const TRACKS = [
  { city: '拉斯维加斯', name: '赌城大道', en: 'VEGAS STRIP', time: 'night', theme: 'vegas', stars: 1,
    base: 300, modes: [[1, 44, 6.1], [2, 22, 5.91]] },
  { city: '迪拜', name: '沙漠高速', en: 'DUBAI DESERT RUN', time: 'day', theme: 'dubai', stars: 2,
    base: 320, modes: [[1, 65, 2.09], [3, 50, 2.72]] },
  { city: '迈阿密', name: '海滨大道', en: 'MIAMI OCEAN DRIVE', time: 'day', theme: 'miami', stars: 2,
    base: 280, modes: [[2, 43, 4.91], [3, 71, 3.3]], sea: true },
  { city: '东京', name: '湾岸夜线', en: 'TOKYO BAYSHORE', time: 'night', theme: 'tokyo', stars: 3,
    base: 260, modes: [[2, 63, 1.45], [3, 33, 2.25], [5, 18, 1.81]], precip: 'rain' },
  { city: '洛杉矶', name: '日落大道', en: 'LA SUNSET', time: 'dusk', theme: 'la', stars: 3,
    base: 240, modes: [[1, 69, 6.25], [4, 41, 5.7], [6, 14, 4.54]] },
  { city: '伦敦', name: '泰晤士环线', en: 'LONDON THAMES', time: 'dusk', theme: 'london', stars: 3,
    base: 250, modes: [[1, 41, 2.75], [2, 27, .39], [5, 25, 2.56]], sea: true },
  { city: '纽约', name: '午夜曼哈顿', en: 'NY MIDNIGHT', time: 'night', theme: 'newyork', stars: 4,
    base: 250, modes: [[4, 61, 3.95], [2, 31, 2.35]] },
  { city: '上海', name: '外滩暮色', en: 'SHANGHAI BUND', time: 'dusk', theme: 'shanghai', stars: 4,
    base: 255, modes: [[3, 65, 3.93], [4, 36, .73], [6, 14, 5.94]] },
  { city: '香港', name: '维港霓虹', en: 'HONG KONG HARBOR', time: 'night', theme: 'hongkong', stars: 4,
    base: 245, modes: [[2, 70, .07], [4, 32, 6.2], [6, 18, 5.86]], precip: 'rain', sea: true },
  { city: '巴黎', name: '凯旋环线', en: 'PARIS TRIOMPHE', time: 'day', theme: 'paris', stars: 4,
    base: 220, modes: [[2, 43, 3.66], [5, 30, .55], [7, 12, 2.04]] },
  { city: '阿尔卑斯', name: '雪山隘口', en: 'ALPINE PASS', time: 'day', theme: 'alps', stars: 5,
    base: 230, modes: [[3, 81, .8], [5, 40, 4.08], [7, 13, 3.29]], precip: 'snow' },
  { city: '摩纳哥', name: '蒙特卡洛街道', en: 'MONACO MONTE CARLO', time: 'day', theme: 'monaco', stars: 5,
    base: 210, modes: [[4, 43, 2.66], [3, 36, 4.95], [6, 25, 1.17], [7, 17, 5.43]], sea: true },
];
const timeIcon = t => t === 'day' ? '☀' : t === 'dusk' ? '🌆' : '☾';


export { TRACKS, timeIcon };
