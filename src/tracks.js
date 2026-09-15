import RATINGS from './track-ratings.json';
import {CIRCUITS} from './circuits/circuit';
const TRACKS = [
 {city:'日本铃鹿',name:'铃鹿',en:'SUZUKA',time:'day',theme:'suzuka',base:900,modes:[]},
 {city:'日本富士',name:'富士',en:'FUJI',time:'day',theme:'fuji',base:900,modes:[]},
  {city:'巴瑟斯特',name:'全景山',en:'MOUNT PANORAMA',time:'day',theme:'bathurst',base:900,modes:[]},
  {city:'菲利普岛',name:'菲利普岛',en:'PHILLIP ISLAND',time:'day',theme:'phillip',base:650,modes:[]},
  { city:'奥地利',name:'红牛环',en:'RED BULL RING',time:'day',theme:'redbull',base:700,modes:[] },
  { city:'瑞士',name:'阿罗萨山地赛',en:'AROSA CLASSICCAR',time:'day',theme:'arosa',base:1600,modes:[] },
  { city: '拉斯维加斯', name: '赌城大道', en: 'VEGAS STRIP', time: 'night', theme: 'vegas',
    base: 300, modes: [[1, 44, 6.1], [2, 22, 5.91]] },
  { city: '迪拜', name: '沙漠高速', en: 'DUBAI DESERT RUN', time: 'day', theme: 'dubai',
    base: 320, modes: [[1, 65, 2.09], [3, 50, 2.72]] },
  { city: '迈阿密', name: '海滨大道', en: 'MIAMI OCEAN DRIVE', time: 'day', theme: 'miami',
    base: 280, modes: [[2, 43, 4.91], [3, 71, 3.3]], sea: true },
  { city: '东京', name: '湾岸夜线', en: 'TOKYO BAYSHORE', time: 'night', theme: 'tokyo',
    base: 260, modes: [[2, 63, 1.45], [3, 33, 2.25], [5, 18, 1.81]], precip: 'rain' },
  { city: '洛杉矶', name: '日落大道', en: 'LA SUNSET', time: 'dusk', theme: 'la',
    base: 240, modes: [[1, 69, 6.25], [4, 41, 5.7], [6, 14, 4.54]] },
  { city: '伦敦', name: '泰晤士环线', en: 'LONDON THAMES', time: 'dusk', theme: 'london',
    base: 250, modes: [[1, 41, 2.75], [2, 27, .39], [5, 25, 2.56]], sea: true },
  { city: '纽约', name: '午夜曼哈顿', en: 'NY MIDNIGHT', time: 'night', theme: 'newyork',
    base: 250, modes: [[4, 61, 3.95], [2, 31, 2.35]] },
  { city: '上海', name: '外滩暮色', en: 'SHANGHAI BUND', time: 'dusk', theme: 'shanghai',
    base: 255, modes: [[3, 65, 3.93], [4, 36, .73], [6, 14, 5.94]] },
  { city: '香港', name: '维港霓虹', en: 'HONG KONG HARBOR', time: 'night', theme: 'hongkong',
    base: 245, modes: [[2, 70, .07], [4, 32, 6.2], [6, 18, 5.86]], precip: 'rain', sea: true },
  { city: '巴黎', name: '凯旋环线', en: 'PARIS TRIOMPHE', time: 'day', theme: 'paris',
    base: 220, modes: [[2, 43, 3.66], [5, 30, .55], [7, 12, 2.04]] },
  { city: '摩纳哥', name: '蒙特卡洛街道', en: 'MONACO MONTE CARLO', time: 'day', theme: 'monaco',
    base: 210, modes: [[4, 43, 2.66], [3, 36, 4.95], [6, 25, 1.17], [7, 17, 5.43]], sea: true },
];
const TRACK_REGIONS=[
 {name:'欧洲',themes:['redbull','arosa','monaco','london','paris']},
 {name:'北美洲',themes:['vegas','miami','la','newyork']},
 {name:'亚洲',themes:['shanghai','suzuka','fuji','tokyo','hongkong','dubai']},
 {name:'澳洲',themes:['bathurst','phillip']},
];
const order=TRACK_REGIONS.flatMap(region=>region.themes);
for(const track of TRACKS)track.region=TRACK_REGIONS.find(region=>region.themes.includes(track.theme)).name;
TRACKS.sort((a,b)=>order.indexOf(a.theme)-order.indexOf(b.theme));
for(const track of TRACKS){const circuit=CIRCUITS[track.theme];if(circuit){Object.assign(track,{name:circuit.name,en:circuit.en,circuit});if(track.theme==='shanghai')track.time='day';}}
for(const track of TRACKS){const rating=RATINGS[track.theme]||{stars:3,reason:'评级中'};Object.assign(track,{stars:rating.stars,difficulty:rating});}
const timeIcon = t => t === 'day' ? '☀' : t === 'dusk' ? '🌆' : '☾';


export { TRACKS, TRACK_REGIONS, timeIcon };
