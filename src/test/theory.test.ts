import {describe,expect,it} from 'vitest'
import {parseChord,sharedPitchClasses} from '../core/theory/chords'
import {analyzeProgression} from '../core/theory/analysis'
describe('chord parsing',()=>{
 it.each(['E','Em','E7','Emaj7','Em7','Esus2','Esus4','Eadd9','E/G#','Bb','F#m','C#dim','Am6','Am7','Am9','Caug'])('parses %s',symbol=>expect(parseChord(symbol)).not.toBeNull())
 it('normalizes enharmonic roots',()=>expect(parseChord('Db')?.root).toBe('C#'))
 it('rejects unsupported input',()=>expect(parseChord('H potato')).toBeNull())
 it('finds common tones',()=>expect(sharedPitchClasses(parseChord('E')!,parseChord('Am')!)).toContain(4))
})
describe('tonal analysis',()=>{
 const keys=analyzeProgression(['E','Am'])
 it('offers A minor and E major',()=>expect(keys.map(k=>k.id)).toEqual(expect.arrayContaining(['A-minor','E-major'])))
 it('analyzes the two readings',()=>{expect(keys.find(k=>k.id==='A-minor')?.romanNumerals).toEqual(['V','i']);expect(keys.find(k=>k.id==='E-major')?.romanNumerals).toEqual(['I','iv'])})
})
