export type MenuTab='car'|'track'|'setup';
export function mountMenu(onTab:(tab:MenuTab)=>void){
 const menu=document.getElementById('menu')!,title=document.getElementById('title')!,car=document.getElementById('carPanel')!,track=document.getElementById('selPanel')!,setup=document.getElementById('setupPanel')!,start=document.getElementById('startBtn')!;
 const tabs=document.createElement('nav');tabs.id='menuTabs';tabs.setAttribute('aria-label','赛前准备');tabs.innerHTML='<button id="navCar" data-tab="car">01 选择车辆</button><button id="navTrack" data-tab="track">02 选择赛道</button><button id="navSetup" data-tab="setup">03 比赛设置</button>';
 const work=document.createElement('div');work.id='menuWorkspace';const preview=document.createElement('div');preview.id='menuPreview';preview.setAttribute('aria-label','三维预览');preview.innerHTML='<div id="menuViewport"></div><div id="previewCaption"><span id="previewKind">GARAGE</span><strong id="previewName"></strong><small id="previewStatus"></small></div>';
 const controls=document.createElement('div');controls.id='menuControls';controls.append(car,track,setup);work.append(preview,controls);const footer=document.createElement('div');footer.id='menuFooter';const summary=document.createElement('span');summary.id='raceSummary';footer.append(summary,start);menu.replaceChildren(title,tabs,work,footer);
 function select(tab:MenuTab){for(const el of [car,track,setup])el.classList.toggle('menu-inactive',el!==({car,track,setup}[tab]));tabs.querySelectorAll('button').forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});controls.scrollTop=0;onTab(tab);}
 tabs.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>select(b.dataset.tab as MenuTab));
 return{select,rect:()=>document.getElementById('menuViewport')!.getBoundingClientRect()};
}
