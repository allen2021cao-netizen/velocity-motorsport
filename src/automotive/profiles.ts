// Metre-based art targets, not manufacturer CAD. Distinct longitudinal and transverse sections.
export interface CarShape {length:number;width:number;height:number;wheelbase:number;wheel:number;front:number;rear:number;roofFront:number;roofRear:number;screen:number;backlight:number;waist:number;nose:number;tail:number;bulge:number;spokes:number;cockpit:number;wing:number;round:boolean;}
const base:CarShape={length:4.5,width:1.85,height:1.25,wheelbase:2.65,wheel:.33,front:1.3,rear:-1.35,roofFront:.12,roofRear:-.65,screen:.86,backlight:-1.25,waist:.7,nose:.48,tail:.72,bulge:.15,spokes:5,cockpit:.34,wing:0,round:true};
export const SHAPES:Record<string,CarShape>={
 p911:{...base,length:4.25,width:1.8,height:1.3,wheelbase:2.27,front:1.19,rear:-1.08,screen:.63,roofFront:.08,roofRear:-.58,backlight:-1.43,nose:.55,tail:.71,bulge:.19,wing:.94},
 f40:{...base,length:4.36,width:1.97,height:1.125,wheelbase:2.45,front:1.27,rear:-1.18,screen:.69,roofFront:.12,roofRear:-.45,backlight:-1.0,nose:.42,tail:.7,bulge:.12,wing:1.05,round:false},
 r34:{...base,cockpit:-.34,length:4.6,width:1.785,height:1.36,wheelbase:2.665,front:1.36,rear:-1.305,screen:.83,roofFront:.24,roofRear:-.7,backlight:-1.28,waist:.83,nose:.68,tail:.86,bulge:.07,spokes:6,wing:1.22,round:false},
 m3:{...base,length:4.49,width:1.82,height:1.35,wheelbase:2.73,front:1.39,rear:-1.34,screen:.79,roofFront:.18,roofRear:-.69,backlight:-1.3,waist:.8,nose:.62,tail:.8,bulge:.09,spokes:10,wing:1.14,round:false},
 diablo:{...base,length:4.47,width:2.04,height:1.1,wheelbase:2.65,front:1.35,rear:-1.3,screen:.83,roofFront:.16,roofRear:-.5,backlight:-.99,nose:.49,tail:.7,bulge:.08,wing:1.0,round:false},
 supra:{...base,cockpit:-.34,length:4.52,width:1.81,height:1.275,wheelbase:2.55,front:1.35,rear:-1.2,screen:.48,roofFront:-.12,roofRear:-.73,backlight:-1.38,nose:.54,tail:.76,bulge:.16,wing:1.22},
 viper:{...base,length:4.49,width:1.92,height:1.19,wheelbase:2.44,front:1.34,rear:-1.1,screen:.25,roofFront:-.28,roofRear:-.8,backlight:-1.28,nose:.57,tail:.73,bulge:.12,spokes:5},
 clk:{...base,length:4.85,width:1.95,height:1.1,wheelbase:2.67,front:1.38,rear:-1.29,screen:.9,roofFront:.18,roofRear:-.45,backlight:-.98,nose:.48,tail:.7,bulge:.08,spokes:10,wing:1.06},
 r8:{...base,length:4.43,width:1.9,height:1.25,wheelbase:2.65,front:1.34,rear:-1.31,screen:.88,roofFront:.23,roofRear:-.51,backlight:-1.0,nose:.52,tail:.74,bulge:.1,spokes:10,round:false},
 mcf1:{...base,length:4.29,width:1.82,height:1.14,wheelbase:2.718,front:1.39,rear:-1.328,screen:.9,roofFront:.2,roofRear:-.44,backlight:-1.03,nose:.41,tail:.68,bulge:.14,cockpit:0},
 gt40:{...base,length:4.19,width:1.78,height:1.03,wheelbase:2.413,front:1.24,rear:-1.173,screen:.76,roofFront:.12,roofRear:-.48,backlight:-.93,nose:.38,tail:.64,bulge:.18,spokes:6},
 c5:{...base,length:4.56,width:1.87,height:1.21,wheelbase:2.654,front:1.37,rear:-1.284,screen:.48,roofFront:-.12,roofRear:-.7,backlight:-1.4,nose:.54,tail:.76,bulge:.10},
};
