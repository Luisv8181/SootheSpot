export const FOREST_STOPS = [.12,.35,.63,.86] as const;
export type ForestMark = {x:number;y:number;time:number};
export function forestPosition(x:number) {return Number.isFinite(x)?Math.max(.06,Math.min(.94,x)):.12;}
export function forestStation(x:number) {const p=forestPosition(x);return FOREST_STOPS.reduce<number>((best,value,index)=>Math.abs(value-p)<Math.abs(FOREST_STOPS[best]-p)?index:best,0);}
export function forestViewport(w:number,h:number) {const width=Math.max(1,Number.isFinite(w)?w:640),height=Math.max(1,Number.isFinite(h)?h:480);const scale=Math.min(1,960/width,640/height);return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};}
export function forestRipple(marks:ForestMark[],mark:ForestMark,still:boolean) {return [...(still?[]:marks.slice(-23)),{x:forestPosition(mark.x),y:Math.max(.60,Math.min(.78,Number.isFinite(mark.y)?mark.y:.7)),time:mark.time}];}
