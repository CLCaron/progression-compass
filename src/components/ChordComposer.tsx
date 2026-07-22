import {useState} from 'react'
import {parseChord} from '../core/theory/chords'

const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
const qualities=[
 {suffix:'',label:'Major',hint:'bright · settled'},{suffix:'m',label:'Minor',hint:'darker · open'},{suffix:'7',label:'7',hint:'wants to move'},{suffix:'maj7',label:'Maj 7',hint:'warm · dreamy'},
 {suffix:'m7',label:'Min 7',hint:'soft · soulful'},{suffix:'sus2',label:'Sus 2',hint:'wide · unresolved'},{suffix:'sus4',label:'Sus 4',hint:'lifted · waiting'},{suffix:'add9',label:'Add 9',hint:'open · colorful'},
 {suffix:'6',label:'6',hint:'sweet · classic'},{suffix:'m6',label:'Min 6',hint:'wistful · tense'},{suffix:'9',label:'9',hint:'rich · moving'},{suffix:'m9',label:'Min 9',hint:'deep · spacious'},
 {suffix:'dim',label:'Diminished',hint:'unstable · tense'},{suffix:'aug',label:'Augmented',hint:'restless · bright'}
]

function parts(symbol?:string){const normalized=symbol?parseChord(symbol)?.normalized:undefined;const match=normalized?.match(/^([A-G](?:#|b)?)(maj7|m7|m9|m6|m|dim|aug|sus2|sus4|add9|7|9|6)?(?:\/([A-G](?:#|b)?))?$/);return{root:match?.[1]??'C',suffix:match?.[2]??'',bass:match?.[3]??''}}

export function ChordComposer({initialSymbol,mode,onSave,onCancel}:{initialSymbol?:string;mode:'add'|'edit';onSave:(symbol:string)=>void;onCancel:()=>void}){
 const initial=parts(initialSymbol)
 const [root,setRoot]=useState(initial.root)
 const [suffix,setSuffix]=useState(initial.suffix)
 const [bass,setBass]=useState(initial.bass)
 const [direct,setDirect]=useState('')
 const [error,setError]=useState('')
 const built=`${root}${suffix}${bass?`/${bass}`:''}`
 const preview=parseChord(direct.trim()||built)?.normalized
 const submit=()=>{if(!preview){setError('That chord symbol is not recognized yet. Try something like F#m7 or Bb/D.');return}onSave(preview)}
 return <section className="chord-composer" aria-labelledby="chord-composer-title">
  <header><div><span className="eyebrow">{mode==='add'?'Add a chord':'Edit chord'}</span><h3 id="chord-composer-title">Build the chord you hear</h3><p>Choose a root and character. The app handles the chord symbol for you.</p></div><div className="chord-preview" aria-live="polite"><small>Your chord</small><strong>{preview??'—'}</strong></div><button className="close-shapes" onClick={onCancel} aria-label="Close chord builder">×</button></header>
  <div className="composer-section"><span className="composer-label">1 · Root note</span><div className="root-options">{roots.map(note=><button className={root===note&&!direct?'active':''} onClick={()=>{setRoot(note);if(bass===note)setBass('');setDirect('');setError('')}} key={note}>{note}</button>)}</div></div>
  <div className="composer-section"><span className="composer-label">2 · Chord character</span><div className="quality-options">{qualities.map(option=><button className={suffix===option.suffix&&!direct?'active':''} onClick={()=>{setSuffix(option.suffix);setDirect('');setError('')}} key={option.suffix||'major'}><strong>{option.label}</strong><small>{option.hint}</small></button>)}</div></div>
  <div className="composer-bottom"><label><span className="composer-label">3 · Bass note <i>optional</i></span><select value={bass} onChange={event=>{setBass(event.target.value);setDirect('')}}><option value="">Use the root</option>{roots.filter(note=>note!==root).map(note=><option value={note} key={note}>{note} in the bass</option>)}</select></label><details><summary>Prefer typing a chord symbol?</summary><div className="direct-chord"><input value={direct} onChange={event=>{setDirect(event.target.value);setError('')}} placeholder="e.g. F#m7 or Bb/D" aria-label="Type a chord symbol directly"/><small>This shortcut is optional.</small></div></details></div>
  {error&&<p className="validation" role="alert">{error}</p>}
  <div className="composer-actions"><button className="button ghost" onClick={onCancel}>Cancel</button><button className="button primary" onClick={submit}>{mode==='add'?`Add ${preview??'chord'}`:`Update to ${preview??'chord'}`}</button></div>
 </section>
}
