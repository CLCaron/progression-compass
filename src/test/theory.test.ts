import {describe,expect,it} from 'vitest'
import {parseChord,sharedPitchClasses} from '../core/theory/chords'
import {analyzeProgression,describeTonalRelationship} from '../core/theory/analysis'
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
 it('keeps the relative minor visible for a C-major chorus and demotes a quality mismatch',()=>{const chorus=analyzeProgression(['C','G','Am','F']);expect(chorus.slice(0,2).map(key=>key.id)).toEqual(['C-major','A-minor']);expect(chorus.findIndex(key=>key.id==='F-major')).toBeGreaterThan(chorus.findIndex(key=>key.id==='A-minor'))})
 it('separates the local center from the whole song and explains their relationship',()=>{const chorus=analyzeProgression(['C','G','Am','F'])[0],song=analyzeProgression(['C','E','Am','F','G','C','G','Am','F','F','G','E','Am','G'])[0],relationship=describeTonalRelationship(chorus,song);expect(song?.id).toBe('A-minor');expect(relationship).toMatchObject({kind:'relative',title:'Same notes, different sense of home'});expect(relationship?.explanation).toContain('share the same basic note collection')})
})
