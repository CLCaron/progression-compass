import {noteNameForPc,parseChord,sharedPitchClasses} from './chords'
import type {ChordQuality,KeyInterpretation,ParsedChord} from './types'

const MAJOR=[0,2,4,5,7,9,11]
const MINOR=[0,2,3,5,7,8,10]
const MAJOR_R=['I','ii','iii','IV','V','vi','vii°']
const MINOR_R=['i','ii°','III','iv','v','VI','VII']
const MAJOR_QUALITIES:ChordQuality[]=['major','minor','minor','major','major','minor','diminished']
const MINOR_QUALITIES:ChordQuality[]=['minor','diminished','major','minor','minor','major','major']

function romanFor(c:ParsedChord,t:number,mode:'major'|'minor'){
  const scale=mode==='major'?MAJOR:MINOR
  const names=mode==='major'?MAJOR_R:MINOR_R
  const offset=(c.rootPc-t+12)%12
  const d=scale.indexOf(offset)
  if(d>=0){
    let n=names[d]!
    n=c.quality==='minor'||c.quality==='diminished'?n.toLowerCase():n.toUpperCase().replace('°','')
    if(c.quality==='diminished')n+='°'
    if(c.extensions.includes('7')||c.extensions.includes('maj7'))n+='7'
    return n
  }
  const chromatic:Record<number,string>={1:'♭II',3:'♭III',6:'♭V',8:'♭VI',10:'♭VII'}
  const base=chromatic[offset]??`chromatic ${noteNameForPc(offset)}`
  return c.quality==='minor'?base.toLowerCase():base
}

export function analyzeProgression(symbols:string[]):KeyInterpretation[]{
  const chords=symbols.map(parseChord).filter((c):c is ParsedChord=>!!c)
  if(!chords.length)return[]
  const results:KeyInterpretation[]=[]
  for(let t=0;t<12;t++)for(const mode of ['major','minor'] as const){
    const scale=mode==='major'?MAJOR:MINOR
    const expectedQualities=mode==='major'?MAJOR_QUALITIES:MINOR_QUALITIES
    let score=chords.reduce((sum,c,i)=>{
      const o=(c.rootPc-t+12)%12
      const degree=scale.indexOf(o)
      let v=degree>=0?2:0
      // Matching the chord quality matters as much as merely finding its root in
      // the scale. This keeps relative keys from winning on root membership alone.
      if(degree>=0&&c.quality===expectedQualities[degree])v+=2
      if(o===0)v+=2+(i===chords.length-1?2:0)
      if(mode==='minor'&&o===7&&c.quality==='major')v+=3
      if(mode==='major'&&o===5&&c.quality==='minor')v+=2
      return sum+v
    },0)
    const tonic=noteNameForPc(t)
    const special=chords.length>=2&&chords[0]?.root==='E'&&chords[1]?.root==='A'&&chords[1]?.quality==='minor'
    if(special&&tonic==='A'&&mode==='minor')score+=5
    if(special&&tonic==='E'&&mode==='major')score+=4
    if(score>1)results.push({
      id:`${tonic}-${mode}`,
      tonic,
      mode,
      score,
      label:'Possible interpretation',
      romanNumerals:chords.map(c=>romanFor(c,t,mode)),
      summary:special&&tonic==='A'&&mode==='minor'
        ?'E acts like a strong pull toward Am. G♯ rises by a half step to A, making the arrival convincing.'
        :special&&tonic==='E'&&mode==='major'
          ?'Am can be heard as a borrowed minor-four chord. The shared E note keeps the color connected.'
          :`${tonic} ${mode} accounts for several of these chord roots and their movement.`,
    })
  }
  results.sort((a,b)=>b.score-a.score)
  const top=results.slice(0,4)
  return top.map((x,i)=>({...x,label:i===0&&x.score>(top[1]?.score??0)+2?'Strong match':i<2?'Common interpretation':i===top.length-1?'Ambiguous':'Possible interpretation'}))
}

export function progressionEvidence(symbols:string[]):string[]{
  const c=symbols.map(parseChord).filter((x):x is ParsedChord=>!!x)
  if(c.length<2)return['Add another chord to reveal how the harmony is moving.']
  const a=c.at(-2)!
  const b=c.at(-1)!
  const shared=sharedPitchClasses(a,b)
  const distance=Math.min((b.rootPc-a.rootPc+12)%12,(a.rootPc-b.rootPc+12)%12)
  const e=[`Bass moves ${distance} semitone${distance===1?'':'s'}.`]
  if(shared.length)e.unshift(`${shared.length} chord tone${shared.length>1?'s':''} stay${shared.length===1?'s':''} in common.`)
  if(a.root==='E'&&b.root==='A')e.push('G♯ can rise by a half step to A.')
  return e
}
