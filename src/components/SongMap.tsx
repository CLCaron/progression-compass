import {useState} from 'react'
import {linkedCount,sectionLabel,type InsertionPosition,type SongState} from '../core/song/sections'

interface SongMapProps{
 song:SongState
 activeId:string
 playing:boolean
 onSelect:(id:string)=>void
 onMove:(id:string,by:number)=>void
 onReorder:(from:string,to:string)=>void
 onRemove:(id:string)=>void
 onAdd:(anchorId:string,position:InsertionPosition)=>void
 onEdit:()=>void
 onPlay:()=>void
}

export function SongMap({song,activeId,playing,onSelect,onMove,onReorder,onRemove,onAdd,onEdit,onPlay}:SongMapProps){
 const [dragging,setDragging]=useState<string|null>(null)
 const firstInstance=song.arrangement[0]!,lastInstance=song.arrangement.at(-1)!
 return <section className="song-map" aria-labelledby="song-map-title">
  <header><div><span className="step">00</span><div><h2 id="song-map-title">Arrangement</h2><p>Add an opening, insert after any section, or use the arrows and drag to reorder.</p></div></div><button className="play-song" onClick={onPlay}>{playing?'■ Stop song':'▶ Play full song'}</button></header>
  <div className="section-track"><button className="add-section-tile add-beginning" onClick={()=>onAdd(firstInstance.id,'before')}><b>＋</b><span>Add beginning</span><small>Intro, atmosphere, or direct start</small></button>{song.arrangement.map((instance,index)=>{const section=song.sections.find(item=>item.id===instance.sectionId),label=sectionLabel(song,instance.id),linked=linkedCount(song,instance.sectionId)>1;return <article className={`section-tile ${activeId===instance.id?'active':''}`} draggable onDragStart={()=>setDragging(instance.id)} onDragEnd={()=>setDragging(null)} onDragOver={event=>event.preventDefault()} onDrop={()=>{if(dragging&&dragging!==instance.id)onReorder(dragging,instance.id);setDragging(null)}} key={instance.id}>
   <button className="section-main" onClick={()=>onSelect(instance.id)}><span>{label}</span><small>{section?.progression.chords.join(' · ')||'Blank section'}</small>{linked&&<b>↗ Linked</b>}</button>
   <div className="section-actions"><button onClick={()=>onMove(instance.id,-1)} disabled={index===0} aria-label={`Move ${label} left`}>←</button><button onClick={()=>onMove(instance.id,1)} disabled={index===song.arrangement.length-1} aria-label={`Move ${label} right`}>→</button><button onClick={()=>{onSelect(instance.id);onEdit()}} aria-label={`Change ${label} role`}>Role</button><button onClick={()=>onAdd(instance.id,'after')} aria-label={`Insert section after ${label}`}>＋ After</button><button onClick={()=>onRemove(instance.id)} disabled={song.arrangement.length===1} aria-label={`Remove ${label}`}>×</button></div>
  </article>})}<button className="add-section-tile" onClick={()=>onAdd(lastInstance.id,'after')}><b>＋</b><span>Add to end</span><small>Reuse, vary, or start new</small></button></div>
 </section>
}
