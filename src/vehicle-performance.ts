/** Game balance parameters, not manufacturer test results. Neutral defaults preserve older callers. */
export interface VehiclePerformance {top:number;accel:number;handling:number;braking?:number;agility?:number;stability?:number;wheelbase?:number;}
export const VEHICLE_TRAITS:Record<string,{braking:number;agility:number;stability:number}>={
 p911:{braking:1.06,agility:1.08,stability:1.12},f40:{braking:.94,agility:1.02,stability:.82},
 r34:{braking:.97,agility:.94,stability:1.1},m3:{braking:1.04,agility:1.03,stability:1.08},
 diablo:{braking:1.12,agility:1.07,stability:1.06},supra:{braking:.94,agility:.96,stability:.94},
 viper:{braking:.87,agility:.8,stability:.91},clk:{braking:1.03,agility:.88,stability:1.09},
 r8:{braking:1.06,agility:1.05,stability:1.12},mcf1:{braking:1.08,agility:1.13,stability:.91},
 gt40:{braking:.88,agility:.98,stability:.83},c5:{braking:1.01,agility:1.02,stability:1.02},
 '458':{braking:1.1,agility:1.15,stability:1.04}
};
export const PERFORMANCE_AXES=[
 {key:'top',name:'极速',reference:360,description:'直道速度上限'},
 {key:'accel',name:'加速',reference:1,description:'出弯与直道动力'},
 {key:'handling',name:'抓地',reference:1,description:'轮胎可用横向抓地'},
 {key:'braking',name:'制动',reference:1.2,description:'同速度下的制动距离'},
 {key:'agility',name:'响应',reference:1.2,description:'转向输入建立速度'},
 {key:'stability',name:'稳定',reference:1.2,description:'抑制侧滑并恢复碰撞偏移'},
] as const;
export function performanceScores(car:VehiclePerformance){return PERFORMANCE_AXES.map(a=>Math.round(Math.min(100,Math.max(0,(car[a.key]??1)/a.reference*100))));}
export function recoveryRate(car:VehiclePerformance){return 4*(car.stability??1);}
