import {useState} from 'react'
import {parseChord} from '../core/theory/chords'
import {identifyChord,parseShapeCode,shapeCode,shapeStringNoteNames} from '../core/guitar/finder'
import {customVoicing,type FretMap} from '../core/guitar/voicings'
import {GuitarDiagram} from './GuitarDiagram'

const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
const strings=['Low E','A','D','G','B','High E']
const qualities=[
 {suffix:'',label:'Major',hint:'bright · settled'},{suffix:'m',label:'Minor',hint:'darker · open'},{suffix:'7',label:'7',hint:'wants to move'},{suffix:'maj7',label:'Maj 7',hint:'warm · dreamy'},
 {suffix:'m7',label:'Min 7',hint:'soft · soulful'},{suffix:'sus2',label:'Sus 2',hint:'wide · unresolved'},{suffix:'sus4',label:'Sus 4',hint:'lifted · waiting'},{suffix:'add9',label:'Add 9',hint:'open · colorful'},
 {suffix:'6',label:'6',hint:'sweet · classic'},{suffix:'m6',label:'Min 6',hint:'wistful · tense'},{suffix:'9',label:'9',hint:'rich · moving'},{suffix:'m9',label:'Min 9',hint:'deep · spacious'},
 {suffix:'dim',label:'Diminished',hint:'unstable · tense'},{suffix:'aug',label:'Augmented',hint:'restless · bright'}
]

function parts(symbol?:string){const normalized=symbol?parseChord(symbol)?.normalized:undefined;const match=normalized?.match(/^([A-G](?:#|b)?)(maj7|m7|m9|m6|m|dim|aug|sus2|sus4|add9|7|9|6)?(?:\/([A-G](?:#|b)?))?$/);return{root:match?.[1]??'C',suffix:match?.[2]??'',bass:match?.[3]??''}}

export function ChordComposer({initialSymbol,initialFrets,mode,onSave,onCancel}:{initialSymbol?:string;initialFrets?:FretMap;mode:'add'|'edit';onSave:(symbol:string,frets?:FretMap)=>void;onCancel:()=>void}){
 const initial=parts(initialSymbol)
 const [method,setMethod]=useState<'name'|'shape'>('name')
 const [root,setRoot]=useState(initial.root),[suffix,setSuffix]=useState(initial.suffix),[bass,setBass]=useState(initial.bass)
 const [direct,setDirect]=useState(''),[error,setError]=useState('')
 const [frets,setFrets]=useState<FretMap>(initialFrets??[3,2,0,0,3,3]),[code,setCode]=useState(shapeCode(initialFrets??[3,2,0,0,3,3]))
 const built=`${root}${suffix}${bass?`/${bass}`:''}`,preview=parseChord(direct.trim()||built)?.normalized
 const matches=identifyChord(frets),notes=shapeStringNoteNames(frets)
 const submit=()=>{if(!preview){setError('That chord symbol is not recognized yet. Try something like F#m7 or Bb/D.');return}onSave(preview)}
 const updateString=(index:number,value:string)=>{const next=[...frets] as FretMap;next[index]=value==='x'?null:Number(value);setFrets(next);setCode(shapeCode(next));setError('')}
 const updateCode=(value:string)=>{setCode(value);const parsed=parseShapeCode(value);if(parsed){setFrets(parsed);setError('')}else setError('Enter six strings from low E to high E, such as 320033 or x 3 2 0 1 0.')}
 return <section className="chord-composer" aria-labelledby="chord-composer-title">
  <header><div><span className="eyebrow">{mode==='add'?'Add a chord':'Edit chord'}</span><h3 id="chord-composer-title">{method==='name'?'Build the chord you hear':'Find the chord you played'}</h3><p>{method==='name'?'Choose a root and character. The app handles the chord symbol for you.':'Set each string exactly as you played it. We’ll name the most likely chords.'}</p></div><div className="chord-preview" aria-live="polite"><small>{method==='name'?'Your chord':'Best match'}</small><strong>{method==='name'?preview??'—':matches[0]?.symbol??'?'}</strong></div><button className="close-shapes" onClick={onCancel} aria-label="Close chord builder">×</button></header>
  <div className="entry-method-tabs" role="tablist" aria-label="Chord entry method"><button role="tab" aria-selected={method==='name'} className={method==='name'?'active':''} onClick={()=>{setMethod('name');setError('')}}>Choose by name</button><button role="tab" aria-selected={method==='shape'} className={method==='shape'?'active':''} onClick={()=>{setMethod('shape');setError('')}}>Find from a shape <span>New</span></button></div>
  {method==='name'?<>
   <div className="composer-section"><span className="composer-label">1 · Root note</span><div className="root-options">{roots.map(note=><button className={root===note&&!direct?'active':''} onClick={()=>{setRoot(note);if(bass===note)setBass('');setDirect('');setError('')}} key={note}>{note}</button>)}</div></div>
   <div className="composer-section"><span className="composer-label">2 · Chord character</span><div className="quality-options">{qualities.map(option=><button className={suffix===option.suffix&&!direct?'active':''} onClick={()=>{setSuffix(option.suffix);setDirect('');setError('')}} key={option.suffix||'major'}><strong>{option.label}</strong><small>{option.hint}</small></button>)}</div></div>
   <div className="composer-bottom"><label><span className="composer-label">3 · Bass note <i>optional</i></span><select value={bass} onChange={event=>{setBass(event.target.value);setDirect('')}}><option value="">Use the root</option>{roots.filter(note=>note!==root).map(note=><option value={note} key={note}>{note} in the bass</option>)}</select></label><details><summary>Prefer typing a chord symbol?</summary><div className="direct-chord"><input value={direct} onChange={event=>{setDirect(event.target.value);setError('')}} placeholder="e.g. F#m7 or Bb/D" aria-label="Type a chord symbol directly"/><small>This shortcut is optional.</small></div></details></div>
   {error&&<p className="validation" role="alert">{error}</p>}<div className="composer-actions"><button className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" onClick={submit}>{mode==='add'?`Add ${preview??'chord'}`:`Update to ${preview??'chord'}`}</button></div>
  </>:<div className="shape-finder">
   <div className="shape-code"><label><span className="composer-label">Quick shape entry</span><input value={code} onChange={event=>updateCode(event.target.value)} aria-label="Six-string shape code"/><small>Low E → high E. Use <b>x</b> for a muted string.</small></label></div>
   <div className="string-editor">{frets.map((fret,index)=><label key={strings[index]}><span>{strings[index]}</span><select value={fret??'x'} onChange={event=>updateString(index,event.target.value)}><option value="x">× Muted</option>{Array.from({length:25},(_,f)=><option value={f} key={f}>{f} fret</option>)}</select><b>{notes[index]??'—'}</b></label>)}</div>
   {error&&<p className="validation" role="alert">{error}</p>}
   <div className="finder-results"><div className="finder-diagram">{matches[0]&&<GuitarDiagram voicing={customVoicing(matches[0].symbol,frets)}/>}<small>Notes: {notes.filter(Boolean).join(' · ')||'Choose at least two strings'}</small></div><div className="match-list"><span className="composer-label">Possible chords</span>{matches.length?matches.map((match,index)=><button className={index===0?'best':''} onClick={()=>onSave(match.symbol,frets)} key={match.symbol}><span><strong>{match.symbol}</strong><small>{match.fit} · {match.detail}</small></span><b>{mode==='add'?'Add chord':'Use chord'} →</b></button>):<p>Choose at least two sounding strings to see matches.</p>}</div></div>
   <div className="composer-actions"><button className="button ghost" onClick={onCancel}>Cancel</button></div>
  </div>}
 </section>
}
