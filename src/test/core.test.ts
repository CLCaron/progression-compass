import {describe,expect,it} from 'vitest'
import {parseTopNoteFrets,highENotes} from '../core/context/topNotes'
import {accessibleDescription,guitarRoutes,isValidVoicing,progressionTab,textTab,voicingsFor} from '../core/guitar/voicings'
import {identifyChord,parseShapeCode,shapeNoteNames} from '../core/guitar/finder'
import {generateSuggestions} from '../core/suggestions/engine'
import {analyzeProgression} from '../core/theory/analysis'
import {isSaveEnvelope,parseShare,readSavedSongs,serializeShare} from '../core/serialization/data'
import {createSong,newInstance,newSection,sectionLabel} from '../core/song/sections'
import {wholeSongSectionStarters} from '../core/song/sectionSuggestions'
describe('guitar and context',()=>{
 it('turns high E frets into notes',()=>expect(highENotes(parseTopNoteFrets('0 → 2 → 3')!)).toEqual(['E','F#','G']))
 it('makes tab and accessible text',()=>{const v=voicingsFor('Am')[0]!;expect(textTab(v)).toContain('e|--0--');expect(accessibleDescription(v)).toContain('low E muted')})
 it('offers valid open and movable shapes',()=>{const shapes=voicingsFor('C');expect(shapes.length).toBeGreaterThanOrEqual(3);expect(shapes.every(isValidVoicing)).toBe(true);expect(shapes.some(v=>v.caged==='E')).toBe(true);expect(shapes.some(v=>v.caged==='A')).toBe(true)})
 it('builds distinct connected, expressive, and comfortable paths',()=>{const routes=guitarRoutes(['F','C','G'],voicingsFor('Am')[0]);expect(routes.map(r=>r.kind)).toEqual(['connected','expressive','comfortable']);expect(new Set(routes.map(r=>r.voicings.map(v=>v.id).join('|'))).size).toBe(3);expect(progressionTab(routes[0]!.voicings)).toContain('e|')})
 it('identifies 320033 as G while respecting doubled notes',()=>{const shape=parseShapeCode('320033')!;expect(shapeNoteNames(shape)).toEqual(['G','B','D','G','D','G']);expect(identifyChord(shape)[0]).toMatchObject({symbol:'G',fit:'Exact notes'})})
 it('accepts muted and separated shape entry',()=>expect(parseShapeCode('x 3 2 0 1 0')).toEqual([null,3,2,0,1,0]))
})
describe('recommendations',()=>{
 const key=analyzeProgression(['E','Am']).find(k=>k.id==='A-minor')
 it('returns useful evidence without context',()=>expect(generateSuggestions(['E','Am'],key,'keep',false,[]).every(s=>s.evidence.length>0)).toBe(true))
 it('changes ranking for resolve intent',()=>expect(generateSuggestions(['E','Am'],key,'resolve',false,[])[0]?.category).toBe('Resolve'))
})
describe('saving and sharing',()=>{
 it('round trips a URL',()=>expect(parseShare(serializeShare(['E','Am'],'A-minor'))).toEqual({chords:['E','Am'],key:'A-minor'}))
 it('rejects corrupt saved data',()=>expect(isSaveEnvelope({version:1,progressions:[{bad:true}]})).toBe(false))
 it('accepts saved songs with sections and custom shapes',()=>{const song=createSong(['G'],[null],[[3,2,0,0,3,3]]);expect(isSaveEnvelope({version:3,songs:[{id:'1',name:'Song',song,tempo:90,updatedAt:'today'}]})).toBe(true)})
 it('migrates version 1 saves into a single section',()=>expect(readSavedSongs({version:1,progressions:[{id:'1',name:'Old idea',chords:['E','Am'],tempo:90,updatedAt:'today'}]})?.[0]?.song.sections[0]?.progression.voicingIds).toEqual([null,null]))
})
describe('song sections',()=>{
 it('numbers linked section appearances',()=>{const song=createSong(['E','Am']);song.sections[0]!.kind='verse';song.sections[0]!.name=undefined;song.arrangement.push(newInstance(song.sections[0]!.id));expect(song.arrangement.map(item=>sectionLabel(song,item.id))).toEqual(['Verse 1','Verse 2'])})
 it('uses the whole song and section purpose to shape starter ideas',()=>{const song=createSong(['E','Am']),after=song.arrangement[0]!.id,chorus=wholeSongSectionStarters(song,after,'chorus'),bridge=wholeSongSectionStarters(song,after,'bridge');expect(chorus.length).toBe(3);expect(bridge.length).toBe(3);expect(chorus[0]?.path).not.toEqual(bridge[0]?.path);expect(chorus[0]?.evidence.some(item=>item.includes('strongest center'))).toBe(true)})
 it('uses earlier sections and both arrangement boundaries as evidence',()=>{const song=createSong(['C','E','Am','F','G']),pre=newSection('prechorus',{chords:['F','C','Em'],voicingIds:[null,null,null],customFrets:[null,null,null]});song.sections.push(pre);const preInstance=newInstance(pre.id);song.arrangement.push(preInstance);const chorus=wholeSongSectionStarters(song,preInstance.id,'chorus')[0]!;expect(chorus.evidence.some(item=>item.includes('2 written sections'))).toBe(true);expect(chorus.evidence.some(item=>item.includes('ending Em'))).toBe(true);const between=wholeSongSectionStarters(song,song.arrangement[0]!.id,'chorus')[0]!;expect(between.evidence.some(item=>item.includes('following section'))).toBe(true);const opening=wholeSongSectionStarters(song,song.arrangement[0]!.id,'intro','before')[0]!;expect(opening.evidence.some(item=>item.includes('following section'))).toBe(true);expect(opening.description).toContain('before C → E → Am → F → G')})
 it('transposes candidates instead of falling back to the original A minor catalog',()=>{const song=createSong(['D','Bm','G','A']),suggestions=wholeSongSectionStarters(song,song.arrangement[0]!.id,'chorus');expect(suggestions[0]?.evidence[0]).toMatch(/D major|B minor/);expect(suggestions.some(item=>item.evidence.some(evidence=>evidence.includes('guitar route')))).toBe(true);expect(suggestions.map(item=>item.path).some(path=>path.join('|')==='F|C|G')).toBe(false)})
})
