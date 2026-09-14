export function mountDrivingHelp(clearInput:()=>void){
 const help=document.createElement('details');help.id='drivingHelp';
 help.innerHTML='<summary>操作说明 · 键盘 / 触屏</summary><p><kbd>W / ↑</kbd> 加速　<kbd>S / ↓</kbd> 刹车<br><kbd>A D / ← →</kbd> 转向　<kbd>Space</kbd> 手刹<br><kbd>C</kbd> 切换视角　<kbd>R</kbd> 返回赛道<br><kbd>Esc</kbd> 暂停　<kbd>M</kbd> 静音<br><kbd>P</kbd> 耐力赛维修区补给</p><p>车库：A / D 选车，Enter 开始；Tab 移动焦点，Enter / 空格确认。</p><p>3D 展示：拖动旋转，滚轮或双指缩放。聚焦展示区后，方向键旋转，+ / − 缩放，Home 复位。</p><p>触屏：按住油门、刹车及方向按钮，可同时操作。比赛中点击「隐藏操作」收起按钮，再点「显示操作」恢复。</p><p>入弯：直线提前刹车 → 松刹转入弯心 → 回正后渐进加速。全油门与刹车同时按下时，刹车优先。</p>';
 document.getElementById('menuControls')!.append(help);
 const toggle=document.createElement('button');toggle.id='controlsToggle';toggle.setAttribute('aria-controls','touchUI');document.getElementById('hud')!.append(toggle);
 let hidden=false;
 try{hidden=localStorage.getItem('uv3-controls-hidden')==='true';}catch{}
 function render(){document.getElementById('touchUI')!.classList.toggle('controls-hidden',hidden);toggle.textContent=hidden?'显示操作':'隐藏操作';toggle.setAttribute('aria-expanded',String(!hidden));}
 toggle.onclick=()=>{clearInput();hidden=!hidden;render();try{localStorage.setItem('uv3-controls-hidden',String(hidden));}catch{}toggle.blur();};render();
}
