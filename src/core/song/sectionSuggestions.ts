import {guitarRoutes,customVoicing,voicingsFor,type GuitarVoicing} from '../guitar/voicings'
import {analyzeProgression} from '../theory/analysis'
import {noteNameForPc,parseChord,sharedPitchClasses} from '../theory/chords'
import {sectionKinds,type ProgressionState,type SectionKind,type SectionStarter,type SongState} from './sections'

type Mode='major'|'minor'
type Tag='steady'|'open'|'build'|'arrival'|'resolve'|'dark'|'contrast'|'descending'
interface Template{id:string;title:string;mode:Mode;steps:{degree:number;suffix?:string}[];tags:Tag[];base:number}
const templates:Template[]=[
 {id:'major-center',title:'Center the hook',mode:'major',steps:[{degree:0},{degree:4},{degree:5},{degree:3}],tags:['arrival','steady','open'],base:65},
 {id:'major-open',title:'Open the horizon',mode:'major',steps:[{degree:3},{degree:0},{degree:4}],tags:['open','arrival'],base:68},
 {id:'major-lift',title:'Lift through familiar ground',mode:'major',steps:[{degree:5},{degree:3},{degree:0},{degree:4}],tags:['build','open'],base:63},
 {id:'major-cadence',title:'Make the arrival clear',mode:'major',steps:[{degree:1},{degree:4},{degree:0}],tags:['build','resolve','arrival'],base:66},
 {id:'major-climb',title:'Raise the energy',mode:'major',steps:[{degree:0},{degree:2},{degree:3},{degree:4}],tags:['build','steady'],base:58},
 {id:'major-fall',title:'Let it settle downward',mode:'major',steps:[{degree:5},{degree:4},{degree:3},{degree:0}],tags:['descending','resolve'],base:61},
 {id:'minor-open',title:'Open the minor horizon',mode:'minor',steps:[{degree:5},{degree:2},{degree:6}],tags:['open','steady'],base:67},
 {id:'minor-center',title:'Gather around home',mode:'minor',steps:[{degree:2},{degree:6},{degree:0},{degree:5}],tags:['arrival','open'],base:64},
 {id:'minor-cadence',title:'Lean into the pull',mode:'minor',steps:[{degree:3},{degree:4,suffix:'7'},{degree:0}],tags:['build','resolve','arrival'],base:69},
 {id:'minor-shadow',title:'Follow the descending shadow',mode:'minor',steps:[{degree:0},{degree:6},{degree:5},{degree:4,suffix:'7'}],tags:['dark','descending','build'],base:63},
 {id:'minor-rise',title:'Rise back toward home',mode:'minor',steps:[{degree:5},{degree:6},{degree:0}],tags:['build','arrival'],base:62},
 {id:'minor-wide',title:'Widen the frame',mode:'minor',steps:[{degree:0},{degree:3},{degree:5},{degree:4,suffix:'7'}],tags:['contrast','build'],base:58}
]
const scale={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10]}
const qualities={major:['','m','m','','','m','dim'],minor:['m','dim','','m','m','','']}
const desired:Record<SectionKind,Tag[]>={intro:['open','steady'],verse:['steady','open'],prechorus:['build','resolve'],chorus:['arrival','open','build'],bridge:['contrast','dark'],instrumental:['contrast','build'],breakdown:['dark','steady','descending'],outro:['resolve','descending'],custom:['steady','open']}

const selectedVoicings=(progression:ProgressionState)=>progression.chords.map((chord,index)=>progression.customFrets[index]?customVoicing(chord,progression.customFrets[index]!):voicingsFor(chord).find(item=>item.id===progression.voicingIds[index])??voicingsFor(chord)[0])
const rootsOf=(symbols:string[])=>symbols.map(parseChord).filter(Boolean).map(chord=>chord!.rootPc)
const overlap=(a:number[],b:number[])=>{const left=new Set(a),right=new Set(b),union=new Set([...left,...right]);return union.size?[...left].filter(item=>right.has(item)).length/union.size:0}
const chordFor=(tonic:number,mode:Mode,step:{degree:number;suffix?:string})=>`${noteNameForPc(tonic+scale[mode][step.degree]!)}${step.suffix??qualities[mode][step.degree]}`
const boundaryEvidence=(from:string|undefined,to:string|undefined,label:string)=>{const a=from&&parseChord(from),b=to&&parseChord(to);if(!a||!b)return null;const shared=sharedPitchClasses(a,b);return shared.length?`${to} keeps ${shared.map(noteNameForPc).join(' and ')} from the ${label} ending ${from}.`:`${from} → ${to} creates a clean ${Math.min((b.rootPc-a.rootPc+12)%12,(a.rootPc-b.rootPc+12)%12)}-semitone root move at the ${label} boundary.`}
const followingEvidence=(from:string|undefined,to:string|undefined)=>{const a=from&&parseChord(from),b=to&&parseChord(to);if(!a||!b)return null;const shared=sharedPitchClasses(a,b);return shared.length?`${from} carries ${shared.map(noteNameForPc).join(' and ')} into the following section’s opening ${to}.`:`${from} leaves a ${Math.min((b.rootPc-a.rootPc+12)%12,(a.rootPc-b.rootPc+12)%12)}-semitone root move into the following section’s ${to}.`}

export function wholeSongSectionStarters(song:SongState,afterInstanceId:string,kind:SectionKind):SectionStarter[]{
 const allChords=song.sections.flatMap(section=>section.progression.chords),interpretation=analyzeProgression(allChords)[0]??analyzeProgression(song.sections[0]?.progression.chords??[])[0]
 const tonic=interpretation?parseChord(interpretation.tonic)?.rootPc??0:0,mode:Mode=interpretation?.mode??'major',activeIndex=song.arrangement.findIndex(item=>item.id===afterInstanceId)
 const previous=song.sections.find(section=>section.id===song.arrangement[activeIndex]?.sectionId)?.progression??song.sections[0]?.progression??{chords:[],voicingIds:[],customFrets:[]}
 const following=song.sections.find(section=>section.id===song.arrangement[activeIndex+1]?.sectionId)?.progression
 const previousRoots=rootsOf(previous.chords),songRoots=rootsOf(allChords),existingSequences=new Set(song.sections.map(section=>section.progression.chords.join('|'))),anchor=selectedVoicings(previous).at(-1)
 const modes:Mode[]=kind==='bridge'||kind==='instrumental'?[mode,mode==='major'?'minor':'major']:[mode]
 const candidates=modes.flatMap(candidateMode=>templates.filter(template=>template.mode===candidateMode).map(template=>{
  const path=template.steps.map(step=>chordFor(tonic,candidateMode,step)),candidateRoots=rootsOf(path),roleHits=template.tags.filter(tag=>desired[kind].includes(tag)).length
  const previousOverlap=overlap(previousRoots,candidateRoots),songOverlap=overlap(songRoots,candidateRoots),first=parseChord(path[0]!),lastPrevious=parseChord(previous.chords.at(-1)??''),shared=first&&lastPrevious?sharedPitchClasses(lastPrevious,first).length:0
  let score=template.base+roleHits*10+shared*2+songOverlap*8
  if(kind==='chorus')score+=12-Math.abs(previousOverlap-.5)*20
  else if(kind==='bridge'||kind==='instrumental')score+=(1-previousOverlap)*14+(candidateMode!==mode?8:0)
  else if(kind==='verse'||kind==='intro')score+=previousOverlap*9
  else score+=8-Math.abs(previousOverlap-.45)*12
  if(existingSequences.has(path.join('|')))score-=24
  const nextShared=following?.chords[0]&&parseChord(path.at(-1)??'')&&parseChord(following.chords[0])?sharedPitchClasses(parseChord(path.at(-1)!)!,parseChord(following.chords[0])!).length:0;score+=nextShared*2
  const routes=guitarRoutes(path,anchor as GuitarVoicing|undefined),preferredKind=kind==='chorus'||kind==='bridge'||kind==='instrumental'?'expressive':kind==='breakdown'||kind==='outro'?'comfortable':'connected',preferredRoute=routes.find(route=>route.kind===preferredKind),registerShift=anchor&&preferredRoute?Math.abs(preferredRoute.voicings[0]!.position-anchor.position):0
  if(preferredRoute){score+=5;if(preferredKind==='expressive')score+=Math.min(8,registerShift);else if(preferredKind==='connected')score+=Math.max(0,6-registerShift)}else score-=4
  const familiar=candidateRoots.filter(root=>songRoots.includes(root)).length,newRoots=new Set(candidateRoots.filter(root=>!songRoots.includes(root))).size
  const guitarEvidence=preferredRoute&&anchor?(preferredKind==='expressive'?`The expressive guitar route moves ${registerShift?`${registerShift} fret${registerShift===1?'':'s'}`:'into a contrasting voicing'} from the last selected ${previous.chords.at(-1)??''} shape.`:`The ${preferredRoute.title.toLowerCase()} guitar route begins ${registerShift?`${registerShift} fret${registerShift===1?'':'s'} away`:'in the same position'} as the last selected shape.`):preferredRoute?'A complete guitar route is available for every chord.':'Some chords need additional guitar voicings.'
  const evidence=[`${interpretation?.tonic??'C'} ${mode} is the strongest center across ${song.sections.filter(section=>section.progression.chords.length).length||1} written section${song.sections.filter(section=>section.progression.chords.length).length===1?'':'s'}.`,boundaryEvidence(previous.chords.at(-1),path[0],'previous section'),following?followingEvidence(path.at(-1),following.chords[0]):null,kind==='bridge'||kind==='instrumental'?`${newRoots} new root${newRoots===1?'':'s'} create${newRoots===1?'s':''} contrast with the existing song.`:`${familiar} of ${candidateRoots.length} chord roots already belong to the song’s harmonic vocabulary.`,guitarEvidence].filter((item):item is string=>Boolean(item))
  const role=sectionKinds.find(item=>item.id===kind)?.label.toLowerCase()??'section',description=`Built as a ${role} after ${previous.chords.join(' → ')||'the current section'}, balancing ${kind==='bridge'?'contrast':'continuity'} with a clear section boundary.`
  return{id:`whole-${kind}-${candidateMode}-${template.id}`,title:template.title,path,description,evidence,score}
 })).sort((a,b)=>b.score-a.score)
 return candidates.filter((candidate,index,all)=>all.findIndex(item=>item.path.join('|')===candidate.path.join('|'))===index).slice(0,3)
}
