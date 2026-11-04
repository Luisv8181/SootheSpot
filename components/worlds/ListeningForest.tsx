"use client";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { FOREST_STOPS,forestPosition,forestRipple,forestStation,forestViewport,type ForestMark } from "@/domain/worlds/forest";
import { forestArtwork,ForestArtwork } from "./ForestArtwork";
import { drawForest,forestView } from "./forestEngine";
import { ForestSound } from "./ForestSound";
import "./listeningForest.css";

const names={en:["Breathing grove","Listening bridge","Waterfall clearing","Lantern pool"],es:["Claro para respirar","Puente para escuchar","Claro de la cascada","Estanque de luces"]};
const invitations={en:[
  ["Let the flowers set a gentle rhythm.","If comfortable, breathe in as they open and out as they close. No need to match them or take a deep breath.","You can return to your own rhythm whenever you like."],
  ["Let one sound come to you.","Notice something nearby, then something farther away. Use the forest sound or listen to your own surroundings.","There is no right sound to find. Let your attention rest."],
  ["Feel what is supporting you.","If comfortable, soften your hands and let your shoulders settle. You can stay exactly as you are.","Notice the contact of your feet or seat. Nothing needs to change."],
  ["Give a little light to the water.","Touch the pool or use Release a light. Watch its circles spread, with no need to make another.","Stay as long as this feels useful, or continue along the trail."]
],es:[
  ["Deja que las flores marquen un ritmo suave.","Si te resulta cómodo, inspira al abrirse y espira al cerrarse. No necesitas seguirlas ni respirar profundo.","Puedes volver a tu propio ritmo cuando quieras."],
  ["Deja que un sonido llegue a ti.","Nota algo cercano y luego algo más lejano. Usa el sonido del bosque o escucha tu entorno.","No hay un sonido correcto. Deja descansar tu atención."],
  ["Siente lo que te sostiene.","Si te resulta cómodo, afloja las manos y deja descansar los hombros. También puedes quedarte como estás.","Nota el contacto de tus pies o tu asiento. No necesitas cambiar nada."],
  ["Regala un poco de luz al agua.","Toca el estanque o usa Soltar una luz. Observa los círculos sin necesidad de crear otro.","Quédate mientras te resulte útil o continúa por el sendero."]
]};
export function ListeningForest({language,running,paused,complete,still,sampleTime,onInteract}:{language:Language;running:boolean;paused:boolean;complete:boolean;still:boolean;sampleTime:()=>number;onInteract:()=>void}){
  const en=language==="en",disabled=paused||complete;
  const [position,setPosition]=useState(.12),[exercise,setExercise]=useState(false),[step,setStep]=useState(0),[marks,setMarks]=useState<ForestMark[]>([]),[ready,setReady]=useState(false),[fallback,setFallback]=useState(false),[hidden,setHidden]=useState(false);
  const station=forestStation(position),canvas=useRef<HTMLCanvasElement>(null),surface=useRef<HTMLButtonElement>(null),draw=useRef<()=>void>(()=>{}),raf=useRef(0),current=useRef(.12),lastMark=useRef(-Infinity);
  const state=useRef({position,still,exercise,station,marks,running,hidden,sampleTime});state.current={position,still,exercise,station,marks,running,hidden,sampleTime};
  useEffect(()=>{const listener=()=>setHidden(document.hidden);listener();document.addEventListener("visibilitychange",listener);return()=>document.removeEventListener("visibilitychange",listener);},[]);
  useEffect(()=>{setExercise(false);setStep(0);},[station]);
  useEffect(()=>{if(paused||complete||hidden)setMarks([]);},[paused,complete,hidden]);
  useEffect(()=>{if(still)setMarks([]);},[still]);
  useEffect(()=>{
    const node=canvas.current;if(!node)return;let context:CanvasRenderingContext2D|null=null;
    try{context=node.getContext("2d",{alpha:false});}catch{setFallback(true);}
    if(!context){setFallback(true);setReady(true);return;}
    const c=context,img=new Image();let loaded=false,disposed=false,frames=0,last=0;
    function render(){if(disposed)return;const s=state.current;const moving=s.running&&!s.still&&!s.hidden;
      const delta=s.position-current.current;if(moving)current.current+=Math.sign(delta)*Math.min(Math.abs(delta),.0035);else if(s.still)current.current=s.position;
      drawForest(c,loaded?img:null,s,s.still?0:s.sampleTime(),current.current,moving&&Math.abs(delta)>.002);
      node!.dataset.frames=String(++frames);node!.dataset.position=current.current.toFixed(4);
    }
    draw.current=render;
    const resize=()=>{const box=surface.current?.getBoundingClientRect();if(!box)return;const size=forestViewport(box.width,box.height);node.width=size.width;node.height=size.height;render();};
    const observer=new ResizeObserver(resize);if(surface.current)observer.observe(surface.current);resize();
    img.onload=()=>{if(disposed)return;loaded=true;setReady(true);render();};img.onerror=()=>{if(disposed)return;setFallback(true);setReady(true);render();};img.src=forestArtwork.src;
    function loop(now:number){if(disposed)return;if(now-last>1000/30){render();last=now;}raf.current=requestAnimationFrame(loop);}
    // The scheduler is controlled by the effect below, not by image loading.
    startLoop.current=()=>{cancelAnimationFrame(raf.current);last=0;raf.current=requestAnimationFrame(loop);};
    return()=>{disposed=true;cancelAnimationFrame(raf.current);observer.disconnect();img.onload=null;img.onerror=null;draw.current=()=>{};startLoop.current=()=>{};};
  },[]);
  const startLoop=useRef<()=>void>(()=>{});
  useEffect(()=>{cancelAnimationFrame(raf.current);draw.current();if(running&&!still&&!hidden&&!complete)startLoop.current();return()=>cancelAnimationFrame(raf.current);},[running,still,hidden,complete]);
  useEffect(()=>{draw.current();},[position,exercise,marks,ready]);
  function travel(next:number){if(disabled)return;setPosition(forestPosition(next));onInteract();}
  function light(x=position,y=.71){if(disabled)return;const now=sampleTime();if(now-lastMark.current<.1)return;lastMark.current=now;setMarks(old=>forestRipple(old,{x,y,time:now},still));onInteract();}
  function interact(event:React.PointerEvent<HTMLButtonElement>){if(disabled)return;const box=event.currentTarget.getBoundingClientRect(),view=forestView(canvas.current?.width||box.width,canvas.current?.height||box.height,current.current),x=(view.left+(event.clientX-box.left)/box.width*view.span)/1440,y=(event.clientY-box.top)/box.height;
    if(y>.56&&y<.81&&x>.28){light(x,y);return;}travel(x);
  }
  return <section className="listening-forest" data-station={station} data-lights={marks.length} data-exercise={exercise} data-artwork={fallback?"fallback":ready?"ready":"loading"} data-motion={running&&!still&&!hidden&&!complete?"flowing":"still"}>
    <div className="forest-location"><span>{en?"AN IMAGINED JOURNEY · RÍO CELESTE, COSTA RICA":"UN VIAJE IMAGINADO · RÍO CELESTE, COSTA RICA"}</span><span>{en?"Pixel paradise":"Paraíso de píxeles"}</span></div>
    <button ref={surface} className="forest-surface" aria-label={en?"Explore the Listening Forest":"Explorar el bosque"} aria-describedby="forest-instructions" disabled={disabled} onPointerDown={interact} onClick={event=>{if(event.detail===0){setExercise(true);onInteract();}}} onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();travel(position+(event.key==="ArrowRight"?.025:-.025));}else if(/^[1-4]$/.test(event.key)){event.preventDefault();travel(FOREST_STOPS[Number(event.key)-1]);}}}>
      <ForestArtwork/><canvas ref={canvas} aria-hidden="true"/>
      {!ready&&<span className="forest-loading">{en?"Opening the canopy…":"Abriendo el dosel…"}</span>}
    </button>
    <nav className="forest-stations" aria-label={en?"Forest clearings":"Claros del bosque"}>{names[language].map((name,index)=><button key={name} aria-pressed={station===index} disabled={disabled} onClick={()=>travel(FOREST_STOPS[index])}><span aria-hidden="true">{["✿","≈","⋮","✧"][index]}</span>{name}</button>)}</nav>
    <div className="forest-guide">
      <p className="forest-eyebrow">{en?"A PLACE TO PAUSE":"UN LUGAR PARA PAUSAR"}</p><h3>{names[language][station]}</h3>
      <p id="forest-instructions">{en?"Touch the path to wander. Use ← → to walk, or 1–4 to visit a clearing. Touch the water to leave a light.":"Toca el sendero para caminar. Usa ← → para andar o 1–4 para visitar un claro. Toca el agua para dejar una luz."}</p>
      <div className="forest-walk"><button disabled={disabled||position<=.06} aria-label={en?"Walk left":"Caminar a la izquierda"} onClick={()=>travel(position-.07)}>←</button><span>{en?"Follow your curiosity. Every pause is optional.":"Sigue tu curiosidad. Cada pausa es opcional."}</span><button disabled={disabled||position>=.94} aria-label={en?"Walk right":"Caminar a la derecha"} onClick={()=>travel(position+.07)}>→</button></div>
      {exercise?<div className="forest-invitation"><p aria-live="polite">{still&&station===0?(en?"Rest your gaze on one flower and breathe in your own comfortable rhythm. You can simply look, too.":"Descansa la mirada en una flor y respira a tu propio ritmo cómodo. También puedes simplemente mirar."):invitations[language][station][step]}</p><div className="forest-actions"><button className="world-secondary" disabled={disabled} onClick={()=>{setStep((step+1)%3);onInteract();}}>{en?"Next invitation":"Siguiente invitación"}</button><button className="forest-skip" onClick={()=>setExercise(false)}>{en?"Just wander":"Solo pasear"}</button></div></div>:<button className="world-secondary" disabled={disabled} onClick={()=>{setExercise(true);setStep(0);onInteract();}}>{en?"Try this pause":"Probar esta pausa"}</button>}
      {station===3&&<button className="forest-release world-secondary" disabled={disabled} onClick={()=>light(.86,.70)}>{en?"Release a light":"Soltar una luz"}</button>}
      <ForestSound language={language} running={running} complete={complete} onStart={onInteract} station={station}/>
      {fallback&&<p role="status">{en?"A simpler forest is available. The clearing buttons and invitations still work.":"Hay un bosque sencillo disponible. Los botones y las invitaciones siguen funcionando."}</p>}
      <p className="forest-credit">{en?"Inspired by Río Celeste. An artistic landscape, not a map of the park. Nothing you do here is saved.":"Inspirado en Río Celeste. Un paisaje artístico, no un mapa del parque. No se guarda lo que haces aquí."}</p>
    </div>
  </section>;
}
