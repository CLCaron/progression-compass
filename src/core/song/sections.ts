import type {FretMap} from '../guitar/voicings'

export type SectionKind='intro'|'verse'|'prechorus'|'chorus'|'bridge'|'instrumental'|'breakdown'|'outro'|'custom'
export interface ProgressionState{chords:string[];voicingIds:(string|null)[];customFrets:(FretMap|null)[]}
export interface SectionDefinition{id:string;kind:SectionKind;name?:string;progression:ProgressionState}
export interface SectionInstance{id:string;sectionId:string}
export interface SongState{sections:SectionDefinition[];arrangement:SectionInstance[]}
export interface SectionStarter{id:string;title:string;path:string[];description:string;evidence:string[];score:number}

export const sectionKinds:{id:SectionKind;label:string;purpose:string}[]=[
 {id:'intro',label:'Intro',purpose:'Set the scene'},{id:'verse',label:'Verse',purpose:'Tell the story'},{id:'prechorus',label:'Pre-chorus',purpose:'Build anticipation'},{id:'chorus',label:'Chorus',purpose:'Create the arrival'},
 {id:'bridge',label:'Bridge',purpose:'Change the perspective'},{id:'instrumental',label:'Instrumental',purpose:'Let the music speak'},{id:'breakdown',label:'Breakdown',purpose:'Pull the energy back'},{id:'outro',label:'Outro',purpose:'Leave the final impression'},{id:'custom',label:'Custom',purpose:'Name it yourself'}
]
const id=()=>globalThis.crypto?.randomUUID?.()??`section-${Date.now()}-${Math.random().toString(16).slice(2)}`
export const emptyProgression=():ProgressionState=>({chords:[],voicingIds:[],customFrets:[]})
export const cloneProgression=(p:ProgressionState):ProgressionState=>({chords:[...p.chords],voicingIds:[...p.voicingIds],customFrets:p.customFrets.map(shape=>shape?[...shape] as FretMap:null)})
export function createSong(chords:string[],voicingIds?:(string|null)[],customFrets?:(FretMap|null)[]):SongState{const sectionId=id();return{sections:[{id:sectionId,kind:'custom',name:'Section 1',progression:{chords:[...chords],voicingIds:voicingIds?.length===chords.length?[...voicingIds]:chords.map(()=>null),customFrets:customFrets?.length===chords.length?customFrets.map(shape=>shape?[...shape] as FretMap:null):chords.map(()=>null)}}],arrangement:[{id:id(),sectionId}]}}
export function sectionLabel(song:SongState,instanceId:string){const instance=song.arrangement.find(item=>item.id===instanceId),section=song.sections.find(item=>item.id===instance?.sectionId);if(!section)return'Untitled section';if(section.name)return section.name;const sameKind=song.arrangement.filter(item=>song.sections.find(candidate=>candidate.id===item.sectionId)?.kind===section.kind);const base=sectionKinds.find(item=>item.id===section.kind)?.label??'Section';return sameKind.length>1?`${base} ${sameKind.findIndex(item=>item.id===instanceId)+1}`:base}
export const linkedCount=(song:SongState,sectionId:string)=>song.arrangement.filter(item=>item.sectionId===sectionId).length
export function newSection(kind:SectionKind,progression=emptyProgression(),name?:string){return{id:id(),kind,name,progression:cloneProgression(progression)} satisfies SectionDefinition}
export const newInstance=(sectionId:string)=>({id:id(),sectionId}) satisfies SectionInstance
