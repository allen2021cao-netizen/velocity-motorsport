import fs from 'node:fs';
import {TRACKS} from '../src/tracks.js';
import {evaluateTrack} from '../src/track-difficulty';
const ratings=Object.fromEntries(TRACKS.map(t=>[t.theme,evaluateTrack(t)]));
fs.writeFileSync('src/track-ratings.json',JSON.stringify(ratings,null,2)+'\n');
console.table(TRACKS.map(t=>({track:t.city,...ratings[t.theme],metrics:undefined})));
