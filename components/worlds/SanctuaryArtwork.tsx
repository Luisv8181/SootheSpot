import garden from "../../public/worlds/sanctuary-garden.webp";
import portrait from "../../public/worlds/sanctuary-garden-portrait.webp";
import { useId } from "react";

export function SanctuaryArtwork({ fallback=false,onReady,onError }: { fallback?:boolean;onReady?:()=>void;onError?:()=>void }={}) {
  const id=useId().replace(/:/g,"");
  if(!fallback)return <picture className="sanctuary-artwork"><source media="(max-width: 640px)" srcSet={portrait.src}/><img src={garden.src} width={garden.width} height={garden.height} alt="" loading={onReady?"eager":"lazy"} decoding="async" onLoad={onReady} onError={onError}/></picture>;
  return <svg className="sanctuary-artwork sanctuary-fallback" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
    <defs><linearGradient id={`${id}s`} x2="0" y2="1"><stop stopColor="#647496"/><stop offset=".5" stopColor="#eab99b"/><stop offset="1" stopColor="#163d43"/></linearGradient><radialGradient id={`${id}w`}><stop stopColor="#89b3ad"/><stop offset="1" stopColor="#143f45"/></radialGradient></defs>
    <path fill={`url(#${id}s)`} d="M0 0H1000V1000H0Z"/><circle cx="730" cy="280" r="66" fill="#ffe3af" opacity=".6"/>
    <path fill="#5b6480" d="M0 450 210 240 350 440 520 260 710 420 850 300 1000 500V1000H0Z"/><path fill="#37566b" d="M0 540 190 450 320 580 510 400 690 520 1000 480V1000H0Z"/>
    <path fill="#b4a48a" d="M0 590Q500 460 1000 590V1000H0Z"/><ellipse cx="650" cy="740" rx="300" ry="180" fill={`url(#${id}w)`} stroke="#e2c6a0" strokeWidth="16"/>
    <path d="M390 520C355 -80 850 -70 810 520" fill="none" stroke="#ac8859" strokeWidth="12"/>
    {[516,550,579,611,642].map((x,index)=><g key={x}><path d={`M${x} 90V${440+index*12}`} stroke="#ffdf99" strokeWidth="2"/><circle cx={x} cy={440+index*12} r="5" fill="#ffe7ac"/></g>)}
    {[{x:140,y:680},{x:230,y:770},{x:290,y:710}].map(({x,y})=><g key={x}>{Array.from({length:7},(_,j)=><ellipse key={j} cx={x} cy={y-27} rx="13" ry="36" fill="#f8ead4" transform={`rotate(${j*360/7} ${x} ${y})`}/>)}<circle cx={x} cy={y} r="14" fill="#dba653"/></g>)}
  </svg>;
}
