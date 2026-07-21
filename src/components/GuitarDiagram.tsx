import type {GuitarVoicing} from '../core/guitar/voicings'
import {accessibleDescription,textTab} from '../core/guitar/voicings'

export function GuitarDiagram({voicing,compact=false}:{voicing:GuitarVoicing;compact?:boolean}){
 const pressed=voicing.frets.filter((f):f is number=>f!=null&&f>0)
 const openPosition=voicing.frets.includes(0)||!pressed.length
 const base=openPosition?1:Math.max(1,Math.min(...pressed))
 return <div className={`guitar-detail ${compact?'compact':''}`}>
  <div className="diagram" role="img" aria-label={accessibleDescription(voicing)}>
   <div className={`nut ${openPosition?'':'soft'}`}/>{!openPosition&&<span className="fret-number">{base}fr</span>}
   <div className="strings">{voicing.frets.map((f,i)=><div className="string" key={i}><span className="marker top">{f==null?'×':f===0?'○':''}</span>{f!=null&&f>0?<span className="finger" style={{top:`${10+(f-base)*24}px`}}/>:null}</div>)}</div>
   <div className="frets">{[0,1,2,3].map(i=><span key={i}/>)}</div>
  </div>
  <div className="diagram-copy"><span className="eyebrow">{voicing.label}</span><small>{voicing.caged?`CAGED ${voicing.caged} form · `:''}{voicing.difficulty}</small>{!compact&&<pre>{textTab(voicing)}</pre>}</div>
 </div>
}
