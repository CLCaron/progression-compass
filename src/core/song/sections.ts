import type {FretMap} from '../guitar/voicings'

export type SectionKind='intro'|'verse'|'prechorus'|'chorus'|'bridge'|'instrumental'|'breakdown'|'outro'|'custom'
export type InsertionPosition='before'|'after'
export interface ProgressionState{chords:string[];voicingIds:(string|null)[];customFrets:(FretMap|null)[]}
export interface SectionDefinition{id:string;kind:SectionKind;name?:string;progression:ProgressionState}
export interface SectionInstance{id:string;sectionId:string}
export interface SongState{sections:SectionDefinition[];arrangement:SectionInstance[]}
export interface SectionStarter{id:string;title:string;path:string[];description:string;evidence:string[];score:number}

export const sectionKinds:{id:SectionKind;label:string;purpose:string;guidance:string}[]=[
 {id:'intro',label:'Intro',purpose:'Set the scene',guidance:'An intro establishes the sound world before the main story begins. It can be a shortened verse, a hook, or something unique.'},
 {id:'verse',label:'Verse',purpose:'Tell the story',guidance:'Verses usually carry changing lyrics over familiar music. Returning after a chorus makes room for the story to move forward.'},
 {id:'prechorus',label:'Pre-chorus',purpose:'Build anticipation',guidance:'A pre-chorus links a verse to a chorus by increasing expectation. It is useful, but many songs move directly from verse to chorus.'},
 {id:'chorus',label:'Chorus',purpose:'Create the arrival',guidance:'A chorus is the recurring emotional or lyrical center. It often follows a verse or pre-chorus, but its sense of arrival matters more than the label.'},
 {id:'bridge',label:'Bridge',purpose:'Change the perspective',guidance:'A bridge introduces meaningful contrast—new harmony, lyrics, melody, texture, or viewpoint. It often appears once after the song has established its main pattern.'},
 {id:'instrumental',label:'Instrumental',purpose:'Let the music speak',guidance:'An instrumental section gives melody, rhythm, or tone the foreground. It can replace a vocal section or create a break before the return.'},
 {id:'breakdown',label:'Breakdown',purpose:'Pull the energy back',guidance:'A breakdown changes the texture or energy more than the song’s story. It can make the next full section feel larger.'},
 {id:'outro',label:'Outro',purpose:'Leave the final impression',guidance:'An outro decides how the song leaves: resolving, repeating, fading, or ending on a final surprise.'},
 {id:'custom',label:'Custom',purpose:'Name it yourself',guidance:'Use a custom role when the section has a clear job that the familiar labels do not capture.'}
]
const id=()=>globalThis.crypto?.randomUUID?.()??`section-${Date.now()}-${Math.random().toString(16).slice(2)}`
export const emptyProgression=():ProgressionState=>({chords:[],voicingIds:[],customFrets:[]})
export const cloneProgression=(p:ProgressionState):ProgressionState=>({chords:[...p.chords],voicingIds:[...p.voicingIds],customFrets:p.customFrets.map(shape=>shape?[...shape] as FretMap:null)})
export function createSong(chords:string[],voicingIds?:(string|null)[],customFrets?:(FretMap|null)[]):SongState{const sectionId=id();return{sections:[{id:sectionId,kind:'custom',name:'Section 1',progression:{chords:[...chords],voicingIds:voicingIds?.length===chords.length?[...voicingIds]:chords.map(()=>null),customFrets:customFrets?.length===chords.length?customFrets.map(shape=>shape?[...shape] as FretMap:null):chords.map(()=>null)}}],arrangement:[{id:id(),sectionId}]}}
export function sectionLabel(song:SongState,instanceId:string){const instance=song.arrangement.find(item=>item.id===instanceId),section=song.sections.find(item=>item.id===instance?.sectionId);if(!section)return'Untitled section';if(section.name)return section.name;const sameKind=song.arrangement.filter(item=>song.sections.find(candidate=>candidate.id===item.sectionId)?.kind===section.kind);const base=sectionKinds.find(item=>item.id===section.kind)?.label??'Section';return sameKind.length>1?`${base} ${sameKind.findIndex(item=>item.id===instanceId)+1}`:base}
export const linkedCount=(song:SongState,sectionId:string)=>song.arrangement.filter(item=>item.sectionId===sectionId).length
export function newSection(kind:SectionKind,progression=emptyProgression(),name?:string){return{id:id(),kind,name,progression:cloneProgression(progression)} satisfies SectionDefinition}
export const newInstance=(sectionId:string)=>({id:id(),sectionId}) satisfies SectionInstance

const sectionAt=(song:SongState,index:number)=>song.sections.find(section=>section.id===song.arrangement[index]?.sectionId)
const labelFor=(kind:SectionKind|undefined)=>sectionKinds.find(item=>item.id===kind)?.label.toLowerCase()
export interface SectionRoleSuggestion{kind:SectionKind;reason:string}
export function sectionInsertionIndex(song:SongState,anchorInstanceId:string,position:InsertionPosition){const anchorIndex=song.arrangement.findIndex(item=>item.id===anchorInstanceId);if(anchorIndex<0)return song.arrangement.length;return Math.max(0,Math.min(song.arrangement.length,anchorIndex+(position==='after'?1:0)))}

export function nextSectionSuggestions(song:SongState,anchorInstanceId:string,position:InsertionPosition='after'):SectionRoleSuggestion[]{
 const insertionIndex=sectionInsertionIndex(song,anchorInstanceId,position),previous=sectionAt(song,insertionIndex-1)?.kind,following=sectionAt(song,insertionIndex)?.kind
 const counts=song.arrangement.reduce((result,_,arrangementIndex)=>{const kind=sectionAt(song,arrangementIndex)?.kind;if(kind)result[kind]=(result[kind]??0)+1;return result},{} as Partial<Record<SectionKind,number>>)
 let candidates:SectionKind[]
 if(!previous)candidates=['intro','instrumental','verse']
 else if(previous==='intro')candidates=['verse','chorus','instrumental']
 else if(previous==='verse')candidates=counts.chorus?['prechorus','chorus','verse']:['chorus','prechorus','verse']
 else if(previous==='prechorus')candidates=['chorus','verse','breakdown']
 else if(previous==='chorus')candidates=(counts.verse??0)<2?['verse','bridge','breakdown']:(counts.bridge??0)<1?['bridge','verse','breakdown']:['verse','outro','instrumental']
 else if(previous==='bridge')candidates=['chorus','outro','verse']
 else if(previous==='breakdown')candidates=['chorus','outro','instrumental']
 else if(previous==='instrumental')candidates=['chorus','verse','outro']
 else if(previous==='outro')candidates=['custom','chorus','instrumental']
 else candidates=['verse','chorus','intro']
 const nextLabel=labelFor(following),previousLabel=labelFor(previous)
 return candidates.map(kind=>{
  let reason=previous?`A ${labelFor(kind)} can follow the ${previousLabel} and give the next part a distinct job.`:`A ${labelFor(kind)} can establish how the listener enters the song.`
  if(!previous&&kind==='intro')reason='An intro can preview the verse, reveal one hook, or establish the texture before any singing begins.'
  else if(!previous&&kind==='instrumental')reason='An instrumental opening can establish mood or melody without promising that its music must return unchanged.'
  else if(!previous&&kind==='verse')reason='Starting directly with the verse can be the strongest choice when the song does not need a separate runway.'
  if(previous==='chorus'&&kind==='verse'&&(counts.verse??0)<2)reason='A second verse returns to the story before introducing a later contrast.'
  else if(kind==='bridge')reason='A bridge earns its name by changing perspective. It often works after the verse–chorus pattern is established, but placement alone does not define it.'
  else if(kind==='prechorus')reason='A pre-chorus can create a stronger climb into the next chorus; skip it if the direct jump already feels right.'
  else if(kind==='chorus')reason='A chorus can provide the recurring arrival or central hook after this section.'
  else if(kind==='outro')reason='An outro can turn the last idea into an ending instead of beginning another cycle.'
  if(nextLabel)reason+=` Inserted here, it would sit before the existing ${nextLabel}.`
  return{kind,reason}
 })
}

export function sectionPlacementGuidance(song:SongState,instanceId:string,kind:SectionKind){
 const index=song.arrangement.findIndex(item=>item.id===instanceId),previous=sectionAt(song,index-1)?.kind,following=sectionAt(song,index+1)?.kind,definition=sectionKinds.find(item=>item.id===kind)!
 const neighbors=[previous?`after the ${labelFor(previous)}`:'at the beginning',following?`before the ${labelFor(following)}`:'at the end'].join(' and ')
 if(kind==='bridge')return `${definition.guidance} This one sits ${neighbors}. That can work if it genuinely changes the song’s perspective; it does not have to follow one exact section type.`
 return `${definition.guidance} Here it sits ${neighbors}. Treat that as context, not a rule.`
}
