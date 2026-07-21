import {useEffect,useMemo,useRef,useState} from 'react'
import {analyzeProgression,progressionEvidence} from '../core/theory/analysis'
import {parseChord} from '../core/theory/chords'
import {generateSuggestions,type Direction,type Suggestion} from '../core/suggestions/engine'
import {hasOpenHighE,voicingsFor} from '../core/guitar/voicings'
import {highENotes,highETextTab,parseTopNoteFrets} from '../core/context/topNotes'
import {parseShare,serializeShare,type SavedProgression} from '../core/serialization/data'
import {browserClipboard,browserStorage} from '../platform/storage'
import {BrowserAudio} from '../platform/audio'
import {GuitarDiagram} from '../components/GuitarDiagram'
import {SuggestionCard} from '../components/SuggestionCard'

const directions:{id:Direction;label:string;symbol:string}[]=[
 {id:'keep',label:'Keep this feeling',symbol:'≈'},{id:'build',label:'Build it up',symbol:'↗'},{id:'resolve',label:'Let it resolve',symbol:'⌄'},
 {id:'darker',label:'Get darker',symbol:'◐'},{id:'brighter',label:'Get brighter',symbol:'☼'},{id:'bigger',label:'Make it bigger',symbol:'✦'},
 {id:'pull',label:'Pull it back',symbol:'↙'},{id:'chorus',label:'Open into a chorus',symbol:'◎'},{id:'loop',label:'Make it loop',symbol:'↻'},
 {id:'unexpected',label:'Take me somewhere unexpected',symbol:'⌁'}]
type History={past:string[][];present:string[];future:string[][]}
const initialShare=parseShare(window.location.search)
const initialChords=initialShare?.chords.every(c=>parseChord(c))?initialShare.chords:['E','Am']

export function App(){
 const [history,setHistory]=useState<History>({past:[],present:initialChords,future:[]})
 const chords=history.present
 const commit=(next:string[])=>setHistory(h=>({past:[...h.past,h.present].slice(-40),present:next,future:[]}))
 const [draft,setDraft]=useState('')
 const [error,setError]=useState('')
 const [activeKey,setActiveKey]=useState(initialShare?.key??'A-minor')
 const [direction,setDirection]=useState<Direction>('keep')
 const [preserveHighE,setPreserveHighE]=useState(false)
 const [ringingAnswer,setRingingAnswer]=useState<'ask'|'yes'|'no'|'moves'>('ask')
 const [topNoteText,setTopNoteText]=useState('0 → 2 → 3')
 const [tempo,setTempo]=useState(86)
 const [loop,setLoop]=useState(false)
 const [playing,setPlaying]=useState<string|null>(null)
 const [expandedChord,setExpandedChord]=useState<number|null>(null)
 const [saves,setSaves]=useState<SavedProgression[]>(()=>browserStorage.load())
 const [saveName,setSaveName]=useState('Untitled idea')
 const [notice,setNotice]=useState('')
 const [refine,setRefine]=useState(false)
 const [style,setStyle]=useState('')
 const [section,setSection]=useState('')
 const audio=useRef(new BrowserAudio())
 const playToken=useRef(0)
 const interpretations=useMemo(()=>analyzeProgression(chords),[chords])
 const active=interpretations.find(k=>k.id===activeKey)??interpretations[0]
 const frets=parseTopNoteFrets(topNoteText)
 const highEAvailable=hasOpenHighE(chords.slice(0,2))
 const suggestions=useMemo(()=>generateSuggestions(chords,active,direction,preserveHighE,frets??[]),[chords,active,direction,preserveHighE,frets])
 useEffect(()=>{if(active&&!interpretations.some(k=>k.id===activeKey))setActiveKey(active.id)},[active,activeKey,interpretations])
 const status=(message:string)=>{setNotice(message);window.setTimeout(()=>setNotice(''),2600)}
 const addChord=()=>{const parsed=parseChord(draft);if(!parsed){setError('Try a common symbol such as C, F#m, Bb, E7, Am9, or E/G#.');return}commit([...chords,parsed.normalized]);setDraft('');setError('')}
 const updateChord=(index:number,value:string)=>{const parsed=parseChord(value);if(!parsed){setError(`“${value}” is not a chord format this version knows yet.`);return}const next=[...chords];next[index]=parsed.normalized;commit(next);setError('')}
 const move=(index:number,by:number)=>{const next=[...chords],target=index+by;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target]!,next[index]!];commit(next)}
 const stop=()=>{playToken.current++;audio.current.stop();setPlaying(null)}
 const playSymbols=async(symbols:string[],id:string)=>{if(playing===id){stop();return}const token=++playToken.current;setPlaying(id);try{do{for(const symbol of symbols){if(playToken.current!==token)return;const chord=parseChord(symbol);if(chord)await audio.current.playChord(chord.pitchClasses,Math.max(.35,45/tempo));await new Promise(r=>setTimeout(r,60000/tempo))}}while(loop&&playToken.current===token)}catch{status('Audio could not start. Tap preview again or check browser sound permissions.')}finally{if(playToken.current===token)setPlaying(null)}}
 const addPath=(s:Suggestion)=>{commit([...chords,...s.path]);status(`Added ${s.path.join(' → ')}`)}
 const copy=async(text:string,label:string)=>{try{await browserClipboard.copy(text);status(`${label} copied`)}catch{status('Clipboard access was unavailable. Select the text and copy it manually.')}}
 const save=()=>{const item:SavedProgression={id:crypto.randomUUID(),name:saveName.trim()||'Untitled idea',chords,tempo,updatedAt:new Date().toISOString()};const next=[item,...saves];setSaves(next);browserStorage.save(next);status('Progression saved on this device')}
 const share=async()=>{const url=`${location.origin}${location.pathname}${serializeShare(chords,active?.id)}`;window.history.replaceState(null,'',serializeShare(chords,active?.id));await copy(url,'Share link')}
 const removeSave=(id:string)=>{const next=saves.filter(s=>s.id!==id);setSaves(next);browserStorage.save(next)}
 const analysisSummary=active?`${chords.join(' → ')}\n${active.romanNumerals.join(' → ')} in ${active.tonic} ${active.mode}\n${active.summary}`:'No analysis available'
 return <div className="app-shell">
  <header className="topbar"><a className="brand" href="/" aria-label="Progression Compass home"><span className="brand-mark">P/C</span><span>Progression<br/>Compass</span></a><div className="header-actions"><span className="saved-state"><i/> Saved on this device</span><details className="menu"><summary className="icon-button" aria-label="Open save and share menu">•••</summary><div className="menu-pop"><label>Idea name<input value={saveName} onChange={e=>setSaveName(e.target.value)}/></label><button onClick={save}>Save progression</button><button onClick={share}>Copy share link</button><button onClick={()=>copy(chords.join(' → '),'Progression')}>Copy chords</button><button onClick={()=>copy(active?.romanNumerals.join(' → ')??'','Roman numerals')}>Copy numerals</button><button onClick={()=>copy(analysisSummary,'Analysis')}>Copy analysis</button>{saves.length>0&&<div className="saved-list"><span className="eyebrow">Saved ideas</span>{saves.map(s=><div key={s.id}><button onClick={()=>{commit(s.chords);setTempo(s.tempo);status(`Loaded ${s.name}`)}}>{s.name}<small>{s.chords.join(' · ')}</small></button><button className="delete" onClick={()=>removeSave(s.id)} aria-label={`Delete ${s.name}`}>×</button></div>)}</div>}</div></details></div></header>
  <main>
   <section className="hero"><span className="kicker">Songwriting compass <i>not a theory test</i></span><h1>Where does your<br/><em>idea want to go?</em></h1><p>Drop in the chords you found. We’ll listen for the shape of it, then offer a few musically grounded ways forward.</p></section>
   <section className="workbench" aria-labelledby="progression-title">
    <div className="section-heading"><div><span className="step">01</span><h2 id="progression-title">Your progression</h2></div><div className="history-controls"><button onClick={()=>setHistory(h=>h.past.length?{past:h.past.slice(0,-1),present:h.past.at(-1)!,future:[h.present,...h.future]}:h)} disabled={!history.past.length}>↶ <span>Undo</span></button><button onClick={()=>setHistory(h=>h.future.length?{past:[...h.past,h.present],present:h.future[0]!,future:h.future.slice(1)}:h)} disabled={!history.future.length}>↷ <span>Redo</span></button></div></div>
    <div className="chord-row">{chords.map((chord,index)=><div className="chord-wrap" key={index+chord}>{index>0&&<span className="arrow">→</span>}<article className="chord-card"><button className="chord-name" onClick={()=>{const v=prompt('Edit chord',chord);if(v!=null)updateChord(index,v)}} aria-label={`Edit ${chord}`}>{chord}<small>{parseChord(chord)?.quality}</small></button><div className="chord-tools"><button onClick={()=>move(index,-1)} disabled={index===0} aria-label={`Move ${chord} left`}>←</button><button onClick={()=>move(index,1)} disabled={index===chords.length-1} aria-label={`Move ${chord} right`}>→</button><button onClick={()=>commit([...chords.slice(0,index+1),chord,...chords.slice(index+1)])} aria-label={`Duplicate ${chord}`}>⧉</button><button onClick={()=>commit(chords.filter((_,i)=>i!==index))} aria-label={`Remove ${chord}`}>×</button></div><button className="shape-toggle" onClick={()=>setExpandedChord(expandedChord===index?null:index)}>{expandedChord===index?'Hide':'Guitar shape'}</button>{expandedChord===index&&<div className="shape-pop">{voicingsFor(chord)[0]?<GuitarDiagram voicing={voicingsFor(chord)[0]!}/>:<p>No curated shape yet. The harmony is still included.</p>}</div>}</article></div>)}<form className="add-chord" onSubmit={e=>{e.preventDefault();addChord()}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add chord" aria-label="Chord symbol"/><button type="submit" aria-label="Add chord">＋</button></form></div>
    {error&&<p className="validation" role="alert">{error}</p>}
    <div className="transport"><button className="play-main" onClick={()=>playSymbols(chords,'progression')}>{playing==='progression'?'■':'▶'} <span>{playing==='progression'?'Stop':'Play idea'}</span></button><label>Tempo <input type="range" min="50" max="180" value={tempo} onChange={e=>setTempo(Number(e.target.value))}/><b>{tempo}</b></label><button className={`loop ${loop?'on':''}`} onClick={()=>setLoop(!loop)} aria-pressed={loop}>↻ Loop</button><button className="clear" onClick={()=>{if(confirm('Clear this progression?'))commit([])}}>Clear</button></div>
   </section>
   <section className="tonal panel">
    <div className="section-heading"><div><span className="step">02</span><h2>A couple ways to hear it</h2></div><span className="uncertain">Harmony can be ambiguous</span></div>
    <div className="key-grid">{interpretations.slice(0,2).map(k=><button className={`key-card ${active?.id===k.id?'active':''}`} onClick={()=>setActiveKey(k.id)} key={k.id}><span className="radio"/><span><strong>{k.tonic} {k.mode}</strong><small>{k.label}</small></span><b>{k.romanNumerals.join(' → ')}</b></button>)}</div>
    {active&&<div className="interpretation"><span className="quote-mark">“</span><p>{active.summary}</p><details><summary>Go deeper into the theory</summary><div className="theory-detail"><p>Roman numerals describe each chord’s relationship to the selected home key. Uppercase usually means major; lowercase means minor; ♭ marks a lowered scale degree.</p><ul>{progressionEvidence(chords).map(e=><li key={e}>{e}</li>)}</ul></div></details></div>}
   </section>
   <section className="direction panel">
    <div className="section-heading"><div><span className="step">03</span><h2>What should the idea do next?</h2></div><span className="optional">Optional — change this anytime</span></div>
    <div className="direction-grid">{directions.map(d=><button key={d.id} className={direction===d.id?'active':''} onClick={()=>setDirection(d.id)}><span>{d.symbol}</span>{d.label}</button>)}</div>
    {highEAvailable&&ringingAnswer==='ask'&&<div className="context-prompt"><span className="string-icon">≋</span><div><strong>Both guitar shapes keep the high E ringing.</strong><p>Is that part of the sound you want to preserve?</p></div><div><button onClick={()=>{setPreserveHighE(true);setRingingAnswer('yes')}}>Keep it ringing</button><button onClick={()=>setRingingAnswer('no')}>Doesn’t matter</button><button onClick={()=>setRingingAnswer('moves')}>I move that note</button></div></div>}
    {ringingAnswer==='moves'&&<div className="top-note"><label>High E string movement<input value={topNoteText} onChange={e=>setTopNoteText(e.target.value)} aria-describedby="top-help"/></label>{frets?<div><code>{highETextTab(frets)}</code><span>{highENotes(frets).join(' → ')}</span></div>:<p id="top-help" role="alert">Use frets from 0–24, such as 0 → 2 → 3.</p>}</div>}
    <details className="refine" open={refine} onToggle={e=>setRefine(e.currentTarget.open)}><summary>Refine suggestions <span>Style, section & movement</span></summary><div className="refine-grid"><label>Song section<select value={section} onChange={e=>setSection(e.target.value)}><option value="">Not specified</option><option>Verse</option><option>Pre-chorus</option><option>Chorus</option><option>Bridge</option><option>Outro</option></select></label><label>General style<select value={style} onChange={e=>setStyle(e.target.value)}><option value="">Not specified</option><option>Pop</option><option>Rock</option><option>Indie</option><option>Folk</option><option>Cinematic</option><option>R&amp;B</option></select></label><p>These details gently shape the creative framing. Core harmony remains based on the chords and selected home key.</p></div></details>
   </section>
   <section className="suggestions panel"><div className="section-heading"><div><span className="step">04</span><h2>Possible next moves</h2></div><span className="updated">↻ Shaped for “{directions.find(d=>d.id===direction)?.label}”</span></div><div className="suggestion-grid">{suggestions.slice(0,5).map(s=><SuggestionCard key={s.id} suggestion={s} playing={playing===s.id} onPreview={()=>playSymbols([...chords,...s.path],s.id)} onAdd={()=>addPath(s)}/>)}</div><p className="ear-note">These are routes, not rules. Your ear gets the final say.</p></section>
  </main>
  <footer><span className="brand-mark">P/C</span><p><strong>Progression Compass</strong><br/>Made for the moment between finding something<br/>and knowing what it is.</p><span>Everything stays on this device.<br/>No account. No tracking.</span></footer>
  <div className="toast" role="status" aria-live="polite">{notice}</div>
 </div>
}

