import {parseChord} from '../theory/chords'

export type FretMap=[number|null,number|null,number|null,number|null,number|null,number|null]
export type VoicingDifficulty='easy'|'moderate'|'stretch'
export interface GuitarVoicing{
 id:string;chord:string;frets:FretMap;label:string;position:number;caged?:'E'|'A';difficulty:VoicingDifficulty;barre:boolean;tags:string[]
}
export type GuitarRouteKind='connected'|'expressive'|'comfortable'
export interface GuitarRoute{kind:GuitarRouteKind;title:string;description:string;voicings:GuitarVoicing[];score:number}

const tuning=[40,45,50,55,59,64]
const curated:GuitarVoicing[]=[
 shape('E-open','E',[0,2,2,1,0,0],'Open E',0,'easy',false,['open','ringing']),shape('E7-open','E7',[0,2,0,1,0,0],'Open E7',0,'easy',false,['open','ringing']),
 shape('Am-open','Am',[null,0,2,2,1,0],'Open Am',0,'easy',false,['open','ringing']),shape('C-open','C',[null,3,2,0,1,0],'Open C',0,'easy',false,['open','ringing']),
 shape('Cmaj7-open','Cmaj7',[null,3,2,0,0,0],'Open Cmaj7',0,'easy',false,['open','ringing']),shape('G-open','G',[3,2,0,0,0,3],'Open G',0,'easy',false,['open']),
 shape('D-open','D',[null,null,0,2,3,2],'Open D',0,'easy',false,['open']),shape('Dm-open','Dm',[null,null,0,2,3,1],'Open Dm',0,'easy',false,['open']),
 shape('Fmaj7-open','Fmaj7',[null,null,3,2,1,0],'Open Fmaj7',0,'easy',false,['open','ringing']),shape('F-mini','F',[null,null,3,2,1,1],'Small F',1,'moderate',true,['compact']),
 shape('B7-open','B7',[null,2,1,2,0,2],'Open B7',0,'moderate',false,['open'])
]

function shape(id:string,chord:string,frets:FretMap,label:string,position:number,difficulty:VoicingDifficulty,barre:boolean,tags:string[],caged?:'E'|'A'):GuitarVoicing{return{id,chord,frets,label,position,caged,difficulty,barre,tags}}
const mod=(n:number)=>((n%12)+12)%12
function movable(symbol:string):GuitarVoicing[]{
 const chord=parseChord(symbol);if(!chord||chord.bass||!['major','minor'].includes(chord.quality))return[]
 const suffix=chord.symbol.slice(chord.symbol.match(/^[A-G](?:#|b)?/)?.[0].length??1)
 const dominant=suffix==='7';if(suffix&&!['m','7'].includes(suffix))return[]
 const minor=chord.quality==='minor',out:GuitarVoicing[]=[]
 const eBase=mod(chord.rootPc-4),aBase=mod(chord.rootPc-9)
 for(const fret of [eBase,eBase+12])if(fret>0&&fret<=12){const f=(minor?[fret,fret+2,fret+2,fret,fret,fret]:dominant?[fret,fret+2,fret,fret+1,fret,fret]:[fret,fret+2,fret+2,fret+1,fret,fret]) as FretMap;out.push(shape(`${symbol}-E-${fret}`,symbol,f,`E-form · fret ${fret}`,fret,fret>=8?'stretch':'moderate',true,['movable',fret>=7?'upper-register':'mid-neck'],'E'))}
 for(const fret of [aBase,aBase+12])if(fret>0&&fret<=12){const f=(minor?[null,fret,fret+2,fret+2,fret+1,fret]:dominant?[null,fret,fret+2,fret,fret+2,fret]:[null,fret,fret+2,fret+2,fret+2,fret]) as FretMap;out.push(shape(`${symbol}-A-${fret}`,symbol,f,`A-form · fret ${fret}`,fret,fret>=8?'stretch':'moderate',true,['movable',fret>=7?'upper-register':'mid-neck'],'A'))}
 return out
}
export function voicingsFor(symbol:string){const normalized=parseChord(symbol)?.normalized??symbol;const items=[...curated.filter(v=>v.chord===normalized),...movable(normalized)];return items.filter((v,i)=>items.findIndex(other=>other.frets.join(',')===v.frets.join(','))===i)}
export const midiNotes=(v:GuitarVoicing)=>v.frets.flatMap((f,i)=>f==null?[]:[tuning[i]!+f])
export const pitchClassesForVoicing=(v:GuitarVoicing)=>[...new Set(midiNotes(v).map(n=>n%12))]
export function customVoicing(chord:string,frets:FretMap):GuitarVoicing{const pressed=frets.filter((f):f is number=>f!=null&&f>0);const position=pressed.length?Math.min(...pressed):0;return{id:`custom-${chord}-${frets.map(f=>f??'x').join('-')}`,chord,frets,label:`Your shape · ${frets.map(f=>f??'x').join('')}`,position,difficulty:'moderate',barre:false,tags:['custom']}}
export const isValidVoicing=(v:GuitarVoicing)=>{const chord=parseChord(v.chord);if(!chord)return false;const pcs=pitchClassesForVoicing(v);return pcs.every(pc=>chord.pitchClasses.includes(pc))&&pcs.includes(chord.rootPc)&&pcs.length>=Math.min(3,chord.pitchClasses.length)}
export const hasOpenHighE=(symbols:string[])=>symbols.length>1&&symbols.every(symbol=>voicingsFor(symbol).some(v=>v.frets[5]===0))

function distance(a:GuitarVoicing,b:GuitarVoicing){const shared=pitchClassesForVoicing(a).filter(pc=>pitchClassesForVoicing(b).includes(pc)).length;const topA=midiNotes(a).at(-1)??64,topB=midiNotes(b).at(-1)??64;return Math.abs(a.position-b.position)*2+Math.abs(topA-topB)*.45-shared*1.8+(a.barre!==b.barre ? .5 : 0)}
function combinations(groups:GuitarVoicing[][],limit=180){let rows:GuitarVoicing[][]=[[]];for(const group of groups){rows=rows.flatMap(row=>group.slice(0,6).map(v=>[...row,v])).sort((a,b)=>a.reduce((s,v)=>s+v.position,0)-b.reduce((s,v)=>s+v.position,0)).slice(0,limit)}return rows}
function routeScore(kind:GuitarRouteKind,row:GuitarVoicing[],anchor?:GuitarVoicing){const sequence=anchor?[anchor,...row]:row;const transitions=sequence.slice(1).map((v,i)=>distance(sequence[i]!,v));const movement=transitions.reduce((a,b)=>a+b,0);const positions=row.map(v=>v.position);const span=Math.max(...positions)-Math.min(...positions);const net=Math.abs((positions.at(-1)??0)-(anchor?.position??positions[0]??0));const ease=row.reduce((n,v)=>n+(v.difficulty==='easy'?6:v.difficulty==='moderate'?2:-2)+(v.barre?-2:2),0);if(kind==='connected')return 100-movement;if(kind==='comfortable')return 70+ease-movement*.45;return 55+span*3+net*2-movement*.25}
export function guitarRoutes(symbols:string[],anchor?:GuitarVoicing):GuitarRoute[]{const groups=symbols.map(voicingsFor);if(!groups.length||groups.some(g=>!g.length))return[];const rows=combinations(groups);const definitions:{kind:GuitarRouteKind;title:string;description:string}[]=[{kind:'connected',title:'Stay connected',description:'Small shifts and shared tones keep the chords flowing.'},{kind:'expressive',title:'Change the scene',description:'A deliberate move into a new register gives the idea a lift.'},{kind:'comfortable',title:'Keep it comfortable',description:'Favors friendly shapes while still allowing useful movement.'}];const used=new Set<string>();return definitions.flatMap(def=>{const ranked=rows.map(voicings=>({...def,voicings,score:routeScore(def.kind,voicings,anchor)})).sort((a,b)=>b.score-a.score);const best=ranked.find(r=>!used.has(r.voicings.map(v=>v.id).join('|')))??ranked[0];if(!best)return[];used.add(best.voicings.map(v=>v.id).join('|'));return[best]})}
export function textTab(v:GuitarVoicing){return ['e','B','G','D','A','E'].map((name,i)=>`${name}|--${v.frets[5-i]==null?'x':v.frets[5-i]}--`).join('\n')}
export function progressionTab(voicings:GuitarVoicing[]){return ['e','B','G','D','A','E'].map((name,stringIndex)=>`${name}|${voicings.map(v=>`--${String(v.frets[5-stringIndex]??'x').padEnd(2,'-')}`).join('|')}|`).join('\n')}
export function accessibleDescription(v:GuitarVoicing){const names=['low E','A','D','G','B','high E'];return `${v.chord}, ${v.label}: ${v.frets.map((f,i)=>`${names[i]} ${f==null?'muted':f===0?'open':`fret ${f}`}`).join(', ')}.`}
