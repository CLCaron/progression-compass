import {useState} from 'react'
import {guitarRoutes,progressionTab,type GuitarRoute,type GuitarVoicing} from '../core/guitar/voicings'
import {GuitarDiagram} from './GuitarDiagram'

export function GuitarPaths({symbols,anchor,onPreview,onChoose,playing}:{symbols:string[];anchor?:GuitarVoicing;onPreview:(route:GuitarRoute)=>void;onChoose:(route:GuitarRoute)=>void;playing:boolean}){
 const routes=guitarRoutes(symbols,anchor)
 const [kind,setKind]=useState('connected')
 const active=routes.find(r=>r.kind===kind)??routes[0]
 if(!active)return <p className="path-unavailable">Guitar paths are coming for these chord qualities. The harmonic suggestion still works.</p>
 return <div className="guitar-paths">
  <div className="route-tabs" role="tablist" aria-label="Guitar route intention">{routes.map(route=><button role="tab" aria-selected={route.kind===active.kind} className={route.kind===active.kind?'active':''} onClick={()=>setKind(route.kind)} key={route.kind}>{route.title}</button>)}</div>
  <p className="route-description">{active.description}</p>
  <div className="route-shapes">{active.voicings.map((voicing,index)=><div className="route-shape" key={voicing.id}><strong>{symbols[index]}</strong><GuitarDiagram voicing={voicing} compact/>{index<active.voicings.length-1&&<span className="route-arrow">→</span>}</div>)}</div>
  <details className="route-tab"><summary>Show progression tab</summary><pre>{progressionTab(active.voicings)}</pre></details>
  <div className="route-actions"><button className="button ghost" onClick={()=>onPreview(active)}>{playing?'■ Stop':'▶ Hear shapes'}</button><button className="button" onClick={()=>onChoose(active)}>Use these shapes</button></div>
 </div>
}
