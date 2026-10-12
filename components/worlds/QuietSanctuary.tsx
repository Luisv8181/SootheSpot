"use client";
import { useEffect,useRef,useState } from "react";
import type { Language } from "@/domain/i18n/copy";
import { addSanctuaryMark,SANCTUARY_AREAS,sanctuaryAreaAt,sanctuaryNoteAt,sanctuaryPoint,sanctuaryPoolPoint,sanctuaryStrings,type SanctuaryArea,type SanctuaryMark,type SanctuaryPoint } from "@/domain/worlds/sanctuary";
import { SanctuaryArtwork } from "./SanctuaryArtwork";
import { LightSound,type LightInstrument } from "./LightSound";
import "./quietSanctuary.css";

export function QuietSanctuary({language,running,paused,complete,still,onInteract}:{language:Language;running:boolean;paused:boolean;complete:boolean;still:boolean;onInteract:()=>void}) {
  const en=language==="en",disabled=paused||complete;
  const [area,setArea]=useState<SanctuaryArea>("pool"),[explore,setExplore]=useState(false),[portrait,setPortrait]=useState(false),[hidden,setHidden]=useState(false);
  const [ready,setReady]=useState(false),[fallback,setFallback]=useState(false),[marks,setMarks]=useState<SanctuaryMark[]>([]),[bloom,setBloom]=useState(false),[note,setNote]=useState(-1),[chime,setChime]=useState(0);
  const material=useRef<HTMLDivElement>(null),instrument=useRef<LightInstrument|null>(null),gesture=useRef<{id:number;area:SanctuaryArea;note:number}|null>(null),serial=useRef(0),lastRipple=useRef(-Infinity),lastChime=useRef(-Infinity);
  const motion=running&&!still&&!hidden&&!complete;
  useEffect(()=>{const media=window.matchMedia("(max-width: 640px)");const resize=()=>setPortrait(media.matches);const visibility=()=>setHidden(document.hidden);resize();visibility();media.addEventListener("change",resize);document.addEventListener("visibilitychange",visibility);return()=>{media.removeEventListener("change",resize);document.removeEventListener("visibilitychange",visibility);};},[]);
  useEffect(()=>{if(!running||hidden||complete){gesture.current=null;setBloom(false);setMarks([]);}},[running,hidden,complete]);
  function ripple(point:SanctuaryPoint) {const now=performance.now();if(now-lastRipple.current<100)return;lastRipple.current=now;const p=sanctuaryPoolPoint(point,portrait);setMarks(current=>addSanctuaryMark(current,{id:++serial.current,...p},still));onInteract();}
  function pluck(index:number) {setNote(index);const now=performance.now();if(now-lastChime.current>=100){setChime(current=>current+1);lastChime.current=now;}instrument.current?.pluck(index,.7);onInteract();}
  function point(event:React.PointerEvent<HTMLButtonElement>) {const box=material.current?.getBoundingClientRect()??event.currentTarget.getBoundingClientRect();return sanctuaryPoint({x:(event.clientX-box.left)/box.width,y:(event.clientY-box.top)/box.height});}
  function down(event:React.PointerEvent<HTMLButtonElement>){if(disabled||gesture.current)return;const p=point(event),next=sanctuaryAreaAt(p);setArea(next);event.currentTarget.setPointerCapture(event.pointerId);gesture.current={id:event.pointerId,area:next,note:sanctuaryNoteAt(p.x,portrait)};if(next==="pool")ripple(p);else if(next==="arch")pluck(gesture.current.note);else{setBloom(true);onInteract();}}
  function move(event:React.PointerEvent<HTMLButtonElement>){const current=gesture.current;if(disabled||current?.id!==event.pointerId)return;const p=point(event);if(current.area==="pool")ripple(p);else if(current.area==="arch"){const next=sanctuaryNoteAt(p.x,portrait);if(next!==current.note){const from=current.note;current.note=next;for(let i=from+(next>from?1:-1);next>from?i<=next:i>=next;i+=next>from?1:-1)pluck(i);}}}
  function release(id:number){if(gesture.current?.id!==id)return;if(gesture.current.area==="flowers")setBloom(false);gesture.current=null;}
  function choose(next:SanctuaryArea){setArea(next);setBloom(false);gesture.current=null;}
  function action(){if(disabled)return;if(area==="pool")ripple({x:.65,y:.74});else if(area==="arch")pluck((note+1)%5);else{setBloom(current=>!current);onInteract();}}
  const names:Record<SanctuaryArea,string>=en?{pool:"Reflection pool",arch:"Musical arch",flowers:"Flower garden"}:{pool:"Estanque",arch:"Arco musical",flowers:"Jardín de flores"};
  const invitation=complete?(en?"Let the garden rest.":"Deja que el jardín descanse."):paused?(en?"There is no hurry.":"No hay prisa."):area==="pool"?(en?"Touch the water. Let it find its edges.":"Toca el agua. Deja que encuentre sus bordes."):area==="arch"?(en?"A small melody, entirely yours.":"Una pequeña melodía, solo tuya."):(en?"Let a flower open, then let it rest.":"Deja que una flor se abra y luego descanse.");
  const flowers=portrait?[{x:.155,y:.657},{x:.233,y:.762},{x:.342,y:.708}]:[{x:.108,y:.66},{x:.175,y:.79},{x:.235,y:.715}];
  const transform=explore&&!still?(area==="arch"?"scale(1.06) translate(-.6%, 1.8%)":area==="flowers"?"scale(1.06) translate(1.8%, -.8%)":"scale(1.06) translate(-.6%, -1.8%)"):"none";
  return <section className="quiet-sanctuary" data-area={area} data-note={note} data-bloom={String(bloom)} data-movement={explore&&!still?"explore":"stationary"} data-artwork={fallback?"fallback":ready?"ready":"loading"} data-motion={motion?"moving":"still"}>
    <button className="sanctuary-surface" aria-label={en?"Explore the sanctuary":"Explorar el refugio"} aria-describedby="sanctuary-instructions" disabled={disabled} onPointerDown={down} onPointerMove={move} onPointerUp={event=>release(event.pointerId)} onPointerCancel={event=>release(event.pointerId)} onLostPointerCapture={event=>release(event.pointerId)} onClick={event=>{if(event.detail===0)action();}} onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();choose(SANCTUARY_AREAS[(SANCTUARY_AREAS.indexOf(area)+(event.key==="ArrowRight"?1:2))%3]);}else if(/^[1-5]$/.test(event.key)){event.preventDefault();if(!event.repeat){setArea("arch");pluck(Number(event.key)-1);}}}}>
      <div className="sanctuary-material" ref={material} style={{transform}}>
        <SanctuaryArtwork fallback={fallback} onReady={()=>setReady(true)} onError={()=>{setFallback(true);setReady(true);}}/>
        <svg className="sanctuary-responses" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          {portrait&&!fallback&&<line x1="660" y1="140" x2="660" y2="374" stroke="#ffdf9c" strokeWidth="1.3" opacity=".7"/>}
          {marks.map(mark=><ellipse key={mark.id} className={`sanctuary-ripple${still?" deliberate-mark":""}`} cx={mark.x*1000} cy={mark.y*1000} rx="34" ry="12" onAnimationEnd={()=>setMarks(current=>current.filter(item=>item.id!==mark.id))}/>)}
          {note>=0&&<g key={chime} className="sanctuary-chime"><line x1={sanctuaryStrings(portrait)[note].x*1000} x2={sanctuaryStrings(portrait)[note].x*1000} y1={sanctuaryStrings(portrait)[note].top*1000} y2={sanctuaryStrings(portrait)[note].end*1000}/><circle cx={sanctuaryStrings(portrait)[note].x*1000} cy={sanctuaryStrings(portrait)[note].end*1000} r="7"/></g>}
          {flowers.map(({x,y},index)=><g key={index} className="sanctuary-flower" style={{opacity:bloom?.82:0}} transform={`translate(${x*1000} ${y*1000})`}>{Array.from({length:7},(_,j)=><ellipse key={j} cx="0" cy={bloom?-19:-7} rx={bloom?11:5} ry={bloom?29:11} transform={`rotate(${j*360/7})`}/>)}<circle r="7"/></g>)}
        </svg>
      </div>
    </button>
    <nav className="sanctuary-areas" aria-label={en?"Places in the sanctuary":"Lugares del refugio"}>{SANCTUARY_AREAS.map(place=><button key={place} aria-pressed={area===place} onClick={()=>choose(place)} disabled={disabled}>{names[place]}</button>)}</nav>
    <div className="sanctuary-caption"><p className="sanctuary-invitation" aria-live="polite">{invitation}</p><p id="sanctuary-instructions">{en?"Touch the pool, strum the arch, or hold a flower. You can use the buttons instead. Nothing is saved.":"Toca el estanque, desliza sobre el arco o mantén una flor. También puedes usar los botones. No se guarda nada."}</p>
      <p className="sanctuary-key-hint">{en?"Arrows visit each place. Enter or Space responds. Keys 1–5 play the arch.":"Las flechas cambian de lugar. Intro o Espacio responden. Las teclas 1–5 tocan el arco."}</p>
      <div className="sanctuary-actions">{area==="pool"?<button className="world-secondary" disabled={disabled} onClick={action}>{en?"Place a ripple":"Crear una onda"}</button>:area==="flowers"?<button className="world-secondary" aria-pressed={bloom} disabled={disabled} onClick={action}>{bloom?en?"Let flowers rest":"Dejar descansar las flores":en?"Open flowers":"Abrir las flores"}</button>:<div className="sanctuary-notes" aria-label={en?"Arch notes":"Notas del arco"}>{Array.from({length:5},(_,i)=><button key={i} aria-label={en?`Play sanctuary note ${i+1}`:`Tocar nota del refugio ${i+1}`} aria-pressed={note===i} disabled={disabled} onClick={()=>pluck(i)}>{i+1}</button>)}</div>}
        <button className="sanctuary-view" disabled={still||disabled} aria-pressed={explore&&!still} onClick={()=>setExplore(current=>!current)}>{explore&&!still?en?"Stationary view":"Vista fija":en?"Explore view":"Explorar la vista"}</button>
      </div>
      <LightSound kind="sanctuary" language={language} running={running} complete={complete} instrument={instrument} onStart={onInteract}/>
      {fallback&&<p className="sanctuary-key-hint" role="status">{en?"A simple garden is available while the artwork is unavailable.":"Puedes usar un jardín sencillo mientras la imagen no esté disponible."}</p>}
    </div>
  </section>;
}
