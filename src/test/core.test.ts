import {describe,expect,it} from 'vitest'
import {parseTopNoteFrets,highENotes} from '../core/context/topNotes'
import {accessibleDescription,textTab,voicingsFor} from '../core/guitar/voicings'
import {generateSuggestions} from '../core/suggestions/engine'
import {analyzeProgression} from '../core/theory/analysis'
import {isSaveEnvelope,parseShare,serializeShare} from '../core/serialization/data'
describe('guitar and context',()=>{
 it('turns high E frets into notes',()=>expect(highENotes(parseTopNoteFrets('0 → 2 → 3')!)).toEqual(['E','F#','G']))
 it('makes tab and accessible text',()=>{const v=voicingsFor('Am')[0]!;expect(textTab(v)).toContain('e|--0--');expect(accessibleDescription(v)).toContain('low E muted')})
})
describe('recommendations',()=>{
 const key=analyzeProgression(['E','Am']).find(k=>k.id==='A-minor')
 it('returns useful evidence without context',()=>expect(generateSuggestions(['E','Am'],key,'keep',false,[]).every(s=>s.evidence.length>0)).toBe(true))
 it('changes ranking for resolve intent',()=>expect(generateSuggestions(['E','Am'],key,'resolve',false,[])[0]?.category).toBe('Resolve'))
})
describe('saving and sharing',()=>{
 it('round trips a URL',()=>expect(parseShare(serializeShare(['E','Am'],'A-minor'))).toEqual({chords:['E','Am'],key:'A-minor'}))
 it('rejects corrupt saved data',()=>expect(isSaveEnvelope({version:1,progressions:[{bad:true}]})).toBe(false))
})
