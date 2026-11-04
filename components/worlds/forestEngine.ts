import type { ForestMark } from "@/domain/worlds/forest";
export type ForestState={position:number;still:boolean;exercise:boolean;station:number;marks:ForestMark[]};
const W=1440,H=480;
const fract=(n:number)=>n-Math.floor(n);
const rnd=(n:number)=>fract(Math.sin(n*127.1+31.7)*43758.5453);
export function forestView(width:number,height:number,position:number){const span=Math.min(W,width/height*H);return {span,left:Math.max(0,Math.min(W-span,position*W-span*.45))};}
export function drawForest(c:CanvasRenderingContext2D,art:HTMLImageElement|null,state:ForestState,t:number,position:number,walking:boolean){
  const {width,height}=c.canvas,scale=height/H,{span,left}=forestView(width,height,position);
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,width,height);c.imageSmoothingEnabled=false;
  c.scale(scale,scale);c.translate(-left,0);
  if(art)c.drawImage(art,0,0,W,H);else{
    c.fillStyle="#94d8c1";c.fillRect(0,0,W,H);c.fillStyle="#176b57";
    for(let i=0;i<75;i++){const x=i*21;c.fillRect(x,20+rnd(i)*100,18,330);c.fillStyle=i%2?"#216d4a":"#164c42";c.fillRect(x-12,rnd(i+2)*80,42,190);}
    c.fillStyle="#21cdd5";c.fillRect(280,290,1160,95);c.fillStyle="#f2d28c";c.fillRect(0,405,W,28);
  }
  // Rippling refraction follows a masked river, leaving the walking bank intact.
  c.save();c.beginPath();c.moveTo(400,322);c.lineTo(665,326);c.lineTo(810,309);c.lineTo(926,301);c.lineTo(1380,279);c.lineTo(1440,318);c.lineTo(1440,390);c.lineTo(1180,393);c.lineTo(965,375);c.lineTo(794,392);c.lineTo(520,397);c.lineTo(400,365);c.closePath();c.clip();
  if(art)for(let y=280;y<400;y+=3){const shift=Math.round(Math.sin(y*.12+t*2.1)*2+Math.sin(y*.035-t*1.4)*2);c.drawImage(art,0,y/H*art.height,art.width,3/H*art.height,shift,y,W,3);}
  for(let i=0;i<170;i++){const y=290+rnd(i+19)*110,x=(rnd(i)*W+t*(7+rnd(i+7)*16))%W;const glow=.12+.24*(.5+.5*Math.sin(t*1.8+i));c.fillStyle=`rgba(201,255,229,${glow})`;c.fillRect(Math.round(x),Math.round(y),3+rnd(i+2)*16,1);}
  c.restore();
  // Waterfall ribbons descend in separate bands, with a cloud of rising spray.
  for(let i=0;i<65;i++){const x=865+rnd(i+50)*65,y=70+fract(rnd(i+3)+t*(.18+rnd(i)*.22))*232;
    const taper=Math.max(0,1-Math.abs(x-907)/42);c.fillStyle=`rgba(222,255,251,${(.1+rnd(i+2)*.40)*taper})`;c.fillRect(Math.round(x+Math.sin(y*.04)*5),Math.round(y),1+rnd(i+1)*3,8+rnd(i+5)*24);}
  for(let i=0;i<38;i++){const phase=fract(rnd(i+400)+t*.16);c.fillStyle=`rgba(221,255,245,${(1-phase)*.18})`;c.fillRect(Math.round(905+(rnd(i+5)-.5)*160*phase),Math.round(310-phase*37),5+phase*20,2+phase*6);}
  // Long, translucent sun shafts and low river mist shift independently.
  for(let i=0;i<4;i++){const x=100+i*380+Math.sin(t*.16+i)*20;c.fillStyle="rgba(255,240,155,.055)";c.beginPath();c.moveTo(x,0);c.lineTo(x+18,0);c.lineTo(x+150,375);c.lineTo(x+80,375);c.fill();}
  for(let i=0;i<9;i++){c.fillStyle="rgba(212,249,232,.035)";c.fillRect(Math.round(300+i*140+Math.sin(t*.2+i)*24),280+i%3*10,170,4);}
  // The upper canopy moves in narrow strips; rooted trunks remain still.
  if(art){for(let x=0;x<W;x+=32){const dx=Math.round(Math.sin(t*.65+x*.02)*2);c.drawImage(art,x/W*art.width,0,32/W*art.width,.12*art.height,x+dx,0,33,H*.12);}}
  for(let i=0;i<24;i++){
    const x=35+i*62,sway=Math.sin(t*.8+i)*5;c.strokeStyle=i%2?"#58a748":"#247946";c.lineWidth=2;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+12+sway,38,x+sway,66+rnd(i)*45);c.stroke();
    for(let j=0;j<4;j++){c.fillStyle=j%2?"#6fb958":"#32984b";c.fillRect(Math.round(x+sway*j/4+(j%2?4:-7)),18+j*16,7,4);}
  }
  // Four butterfly families and falling petals have independent bounded paths.
  for(let i=0;i<8;i++){
    const x=110+i*170+Math.sin(t*.33+i)*37,y=150+rnd(i+12)*95+Math.sin(t*.8+i)*18,flap=1+Math.abs(Math.sin(t*6+i))*4;
    c.fillStyle=i%2?"#8be8ff":"#ffe68a";c.fillRect(Math.round(x-flap),Math.round(y),flap,3);c.fillRect(Math.round(x+1),Math.round(y),flap,3);c.fillStyle="#214f58";c.fillRect(Math.round(x),Math.round(y),1,4);
  }
  for(let i=0;i<18;i++){const x=(rnd(i+92)*W+t*3)%W,y=fract(rnd(i+202)+t*.017)*360;c.fillStyle=i%3?"#f3dca8":"#ffc0af";c.globalAlpha=.4;c.fillRect(Math.round(x+Math.sin(t+i)*8),Math.round(y),2,2);}c.globalAlpha=1;
  // Small flowers at the grove offer a visible, optional comfortable breathing rhythm.
  const opening=state.exercise&&state.station===0?(.5-.5*Math.cos(t*Math.PI/4)):.45;
  for(let i=0;i<5;i++){const x=125+i*24,y=350+Math.sin(i)*8;c.fillStyle="#245e3a";c.fillRect(x,y,2,17);for(let p=0;p<6;p++){const a=p*Math.PI/3;c.fillStyle=p%2?"#ffb3b3":"#ffe4ad";c.fillRect(Math.round(x+Math.cos(a)*(3+opening*5)-2),Math.round(y+Math.sin(a)*(3+opening*5)-2),5,5);}c.fillStyle="#fff2b6";c.fillRect(x-1,y-1,3,3);}
  state.marks.forEach(mark=>{const age=state.still?1:Math.max(0,t-mark.time);if(age>4)return;c.globalAlpha=state.still?.85:Math.max(0,1-age/4);c.strokeStyle="#fff9ba";c.lineWidth=1;c.beginPath();c.ellipse(mark.x*W,mark.y*H,5+age*12,2+age*4,0,0,Math.PI*2);c.stroke();c.fillStyle="#fff2a0";c.fillRect(mark.x*W-2,mark.y*H-5-age*7,4,4);});c.globalAlpha=1;
  // A pixel traveler gives the trail a human scale; no score, inventory or objectives.
  const px=Math.round(position*W),py=420,step=walking?Math.sin(t*13)*3:0;
  c.fillStyle="#133f3a66";c.fillRect(px-9,py+1,18,3);c.fillStyle="#164b52";c.fillRect(px-5,py-8,4,9+step);c.fillRect(px+2,py-8,4,9-step);
  c.fillStyle="#e9905a";c.fillRect(px-7,py-22,14,15);c.fillStyle="#f9cf91";c.fillRect(px-5,py-31,10,9);c.fillStyle="#654d30";c.fillRect(px-7,py-34,14,5);c.fillRect(px-10,py-30,20,3);c.fillStyle="#83b997";c.fillRect(px-4,py-20,8,10);
  for(let i=0;i<22;i++){const x=i*70+Math.sin(t*.7+i)*4;c.fillStyle=i%2?"#1b6a42":"#368947";c.fillRect(Math.round(x),460,4,20);for(let j=0;j<4;j++){c.fillRect(Math.round(x-4-j*3),459-j*5,5+j*2,3);c.fillRect(Math.round(x+3),459-j*5,5+j*2,3);}}
  c.setTransform(1,0,0,1,0,0);
  return {left,span};
}
