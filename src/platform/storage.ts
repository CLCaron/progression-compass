import type {SavedSong,SaveEnvelope} from '../core/serialization/data'
import {readSavedSongs} from '../core/serialization/data'
export interface StorageAdapter{load():SavedSong[];save(items:SavedSong[]):void}
const key='progression-compass:saves'
export const browserStorage:StorageAdapter={load(){try{const raw=localStorage.getItem(key);if(!raw)return[];const data:unknown=JSON.parse(raw);return readSavedSongs(data)??[]}catch{return[]}},save(items){const data:SaveEnvelope={version:3,songs:items};localStorage.setItem(key,JSON.stringify(data))}}
export const browserClipboard={async copy(text:string){if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text)}}
