import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import {SectionComposer} from '../components/SectionComposer'
import {createSong} from '../core/song/sections'

describe('section creation choices',()=>{
 it('asks whether to reuse, vary, or start fresh when the type exists',()=>{const song=createSong(['E','Am']);song.sections[0]!.kind='verse';song.sections[0]!.name=undefined;const create=vi.fn();render(<SectionComposer sections={song.sections} previousChords={['E','Am']} onCreate={create} onCancel={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:/Verse Tell the story/}));expect(screen.getByRole('button',{name:/Reuse Verse/})).toBeTruthy();expect(screen.getByRole('button',{name:/Create a variation/})).toBeTruthy();expect(screen.getByRole('button',{name:/Start a new verse/})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:/Reuse Verse/}));expect(create).toHaveBeenCalledWith(expect.objectContaining({kind:'verse',mode:'reuse',sourceId:song.sections[0]!.id}))})
 it('offers section-aware starters for a new type',()=>{const song=createSong(['E','Am']);render(<SectionComposer sections={song.sections} previousChords={['E','Am']} onCreate={()=>{}} onCancel={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:/Chorus Create the arrival/}));expect(screen.getByRole('button',{name:'Start completely blank'})).toBeTruthy();expect(screen.getAllByText(/→/).length).toBeGreaterThan(0)})
})
