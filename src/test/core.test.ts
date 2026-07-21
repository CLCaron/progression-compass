import {describe,expect,it} from 'vitest'
import {parseTopNoteFrets,highENotes} from '../core/context/topNotes'
import {accessibleDescription,guitarRoutes,isValidVoicing,progressionTab,textTab,voicingsFor} from '../core/guitar/voicings'
import {generateSuggestions} from '../core/suggestions/engine'
import {analyzeProgression} from '../core/theory/analysis'
import {isSaveEnvelope,parseShare,readSavedProgressions,serializeShare} from '../core/serialization/data'
describe('guitar and context',()=>{
 it('turns high E frets into notes',()=>expect(highENotes(parseTopNoteFrets('0 → 2 → 3')!)).toEqual(['E','F#','G']))
 it('makes tab and accessible text',()=>{const v=voicingsFor('Am')[0]!;expect(textTab(v)).toContain('e|--0--');expect(accessibleDescription(v)).toContain('low E muted')})
 it('offers valid open and movable shapes',()=>{const shapes=voicingsFor('C');expect(shapes.length).toBeGreaterThanOrEqual(3);expect(shapes.every(isValidVoicing)).toBe(true);expect(shapes.some(v=>v.caged==='E')).toBe(true);expect(shapes.some(v=>v.caged==='A')).toBe(true)})
 it('builds distinct connected, expressive, and comfortable paths',()=>{const routes=guitarRoutes(['F','C','G'],voicingsFor('Am')[0]);expect(routes.map(r=>r.kind)).toEqual(['connected','expressive','comfortable']);expect(new Set(routes.map(r=>r.voicings.map(v=>v.id).join('|'))).size).toBe(3);expect(progressionTab(routes[0]!.voicings)).toContain('e|')})
})
describe('recommendations',()=>{
 const key=analyzeProgression(['E','Am']).find(k=>k.id==='A-minor')
 it('returns useful evidence without context',()=>expect(generateSuggestions(['E','Am'],key,'keep',false,[]).every(s=>s.evidence.length>0)).toBe(true))
 it('changes ranking for resolve intent',()=>expect(generateSuggestions(['E','Am'],key,'resolve',false,[])[0]?.category).toBe('Resolve'))
})
describe('saving and sharing',()=>{
 it('round trips a URL',()=>expect(parseShare(serializeShare(['E','Am'],'A-minor'))).toEqual({chords:['E','Am'],key:'A-minor'}))
 it('rejects corrupt saved data',()=>expect(isSaveEnvelope({version:1,progressions:[{bad:true}]})).toBe(false))
 it('accepts saved guitar shape choices',()=>expect(isSaveEnvelope({version:2,progressions:[{id:'1',name:'Idea',chords:['E'],voicingIds:['E-open'],tempo:90,updatedAt:'today'}]})).toBe(true))
 it('migrates version 1 saves with empty shape choices',()=>expect(readSavedProgressions({version:1,progressions:[{id:'1',name:'Old idea',chords:['E','Am'],tempo:90,updatedAt:'today'}]})?.[0]?.voicingIds).toEqual([null,null]))
})
