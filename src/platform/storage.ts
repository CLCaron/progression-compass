import type {SavedProgression,SaveEnvelope} from '../core/serialization/data'
import {readSavedProgressions} from '../core/serialization/data'
export interface StorageAdapter{load():SavedProgression[];save(items:SavedProgression[]):void}
const key='progression-compass:saves'
export const browserStorage:StorageAdapter={load(){try{const raw=localStorage.getItem(key);if(!raw)return[];const data:unknown=JSON.parse(raw);return readSavedProgressions(data)??[]}catch{return[]}},save(items){const data:SaveEnvelope={version:2,progressions:items};localStorage.setItem(key,JSON.stringify(data))}}
export const browserClipboard={async copy(text:string){if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text)}}
