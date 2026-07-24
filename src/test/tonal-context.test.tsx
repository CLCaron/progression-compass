import {fireEvent,render,screen} from '@testing-library/react'
import {beforeEach,describe,expect,it} from 'vitest'
import {App} from '../app/App'
import {createSong,newInstance,newSection,type ProgressionState} from '../core/song/sections'

const progression=(chords:string[]):ProgressionState=>({chords,voicingIds:chords.map(()=>null),customFrets:chords.map(()=>null)})

describe('song-aware tonal context',()=>{
 beforeEach(()=>window.localStorage.clear())
 it('shows a relative-major chorus inside an A-minor song without hiding the song reading',()=>{const song=createSong(['C','E','Am','F','G']);song.sections[0]!.kind='verse';song.sections[0]!.name=undefined;const chorus=newSection('chorus',progression(['C','G','Am','F'])),bridge=newSection('bridge',progression(['F','G','E','Am','G']));song.sections.push(chorus,bridge);const chorusInstance=newInstance(chorus.id);song.arrangement.push(chorusInstance,newInstance(bridge.id));window.localStorage.setItem('progression-compass:saves',JSON.stringify({version:3,songs:[{id:'context-song',name:'Context Song',song,tempo:86,updatedAt:'today'}]}));render(<App/>);fireEvent.click(screen.getByLabelText('Open save and share menu'));fireEvent.click(screen.getByRole('button',{name:/^Context Song 3 sections/}));fireEvent.click(screen.getByText('Chorus').closest('button')!);expect(screen.getByText('This section')).toBeTruthy();expect(screen.getByText('Whole song')).toBeTruthy();expect(screen.getByText('Same notes, different sense of home')).toBeTruthy();expect(screen.getByText('Strongest local reading')).toBeTruthy();expect(screen.getByText('Matches the whole-song center')).toBeTruthy();expect(screen.getAllByText('C major').length).toBeGreaterThan(0);expect(screen.getAllByText('A minor').length).toBeGreaterThan(0)})
})
