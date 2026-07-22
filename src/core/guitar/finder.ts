import {noteNameForPc,parseChord} from '../theory/chords'
import type {FretMap} from './voicings'

const tuningPcs=[4,9,2,7,11,4]
const roots=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
const suffixes=['','m','7','maj7','m7','sus2','sus4','add9','6','m6','9','m9','dim','aug']
export interface ChordMatch{symbol:string;score:number;fit:'Exact notes'|'Likely match'|'Possible match';detail:string}

export function parseShapeCode(input:string):FretMap|null{
 const clean=input.trim().toLowerCase();let values:string[]
 if(/^[x0-9]{6}$/.test(clean))values=[...clean]
 else values=clean.split(/[\s,|/-]+/).filter(Boolean)
 if(values.length!==6)return null
 const frets=values.map(value=>value==='x'?null:Number(value));if(frets.some(fret=>fret!=null&&(!Number.isInteger(fret)||fret<0||fret>24)))return null
 return frets as FretMap
}
export const shapeCode=(frets:FretMap)=>frets.every(fret=>fret==null||fret<10)?frets.map(fret=>fret??'x').join(''):frets.map(fret=>fret??'x').join(' ')
export const shapePitchClasses=(frets:FretMap)=>frets.flatMap((fret,string)=>fret==null?[]:[(tuningPcs[string]!+fret)%12])
export const shapeNoteNames=(frets:FretMap)=>shapePitchClasses(frets).map(noteNameForPc)
export const shapeStringNoteNames=(frets:FretMap)=>frets.map((fret,string)=>fret==null?null:noteNameForPc((tuningPcs[string]!+fret)%12))

export function identifyChord(frets:FretMap):ChordMatch[]{
 const sounding=shapePitchClasses(frets);if(sounding.length<2)return[]
 const played=[...new Set(sounding)],bass=sounding[0]
 return roots.flatMap(root=>suffixes.map(suffix=>parseChord(`${root}${suffix}`)).filter(Boolean).map(chord=>{
  const missing=chord!.pitchClasses.filter(pc=>!played.includes(pc)),extra=played.filter(pc=>!chord!.pitchClasses.includes(pc));if(!played.includes(chord!.rootPc)||missing.length>1||extra.length>1)return null
  const exact=!missing.length&&!extra.length,rootBass=bass===chord!.rootPc
  const symbol=!rootBass&&chord!.pitchClasses.includes(bass!)?`${chord!.normalized}/${noteNameForPc(bass!)}`:chord!.normalized
  const score=100-missing.length*14-extra.length*20+(rootBass?5:0)-chord!.pitchClasses.length*.1
  const changes=[missing.length?`missing ${missing.map(noteNameForPc).join(', ')}`:'',extra.length?`includes ${extra.map(noteNameForPc).join(', ')}`:''].filter(Boolean)
  return{symbol,score,fit:exact?'Exact notes':!missing.length?'Likely match':'Possible match',detail:exact?`${rootBass?'Root':'Chord tone'} in the bass · ${played.length} unique notes`:changes.join(' · ')} as ChordMatch
 })).filter((match):match is ChordMatch=>Boolean(match)).sort((a,b)=>b.score-a.score||a.symbol.length-b.symbol.length).filter((match,index,all)=>all.findIndex(item=>item.symbol===match.symbol)===index).slice(0,6)
}
