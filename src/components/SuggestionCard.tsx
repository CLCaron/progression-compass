import type {Suggestion} from '../core/suggestions/engine'
import type {GuitarRoute,GuitarVoicing} from '../core/guitar/voicings'
import {GuitarPaths} from './GuitarPaths'

export function SuggestionCard({suggestion,onPreview,onPreviewRoute,onChooseRoute,onAdd,playing,routePlaying,anchor}:{suggestion:Suggestion;onPreview:()=>void;onPreviewRoute:(route:GuitarRoute)=>void;onChooseRoute:(route:GuitarRoute)=>void;onAdd:()=>void;playing:boolean;routePlaying:boolean;anchor?:GuitarVoicing}){
 return <article className="suggestion-card"><div className="suggestion-top"><span className="route-tag">{suggestion.category}</span><span className="feeling">{suggestion.feeling}</span></div><h3>{suggestion.title}</h3><div className="path">{suggestion.path.map((c,i)=><span key={c+i}>{c}{i<suggestion.path.length-1&&<b>→</b>}</span>)}</div><p>{suggestion.explanation}</p><details><summary>Why this fits</summary><ul>{suggestion.evidence.map(e=><li key={e}>{e}</li>)}</ul></details>
 <details className="guitar-path-disclosure"><summary>Explore guitar paths <span>3 ways across the neck</span></summary><GuitarPaths symbols={suggestion.path} anchor={anchor} onPreview={onPreviewRoute} onChoose={onChooseRoute} playing={routePlaying}/></details>
 <div className="card-actions"><button className="button ghost" onClick={onPreview}>{playing?'■ Stop':'▶ Preview'}</button><button className="button add" onClick={onAdd}>Add path <span>＋</span></button></div></article>
}
