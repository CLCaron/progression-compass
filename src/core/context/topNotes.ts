import {noteNameForPc} from '../theory/chords'
export function parseTopNoteFrets(value:string):number[]|null{const t=value.trim().split(/\s*(?:→|->|,|\s)\s*/).filter(Boolean);if(!t.length)return[];const v=t.map(Number);return v.every(n=>Number.isInteger(n)&&n>=0&&n<=24)?v:null}
export const highENotes=(frets:number[])=>frets.map(f=>noteNameForPc(4+f))
export const highETextTab=(frets:number[])=>`e|--${frets.join('--')}--`
