import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import {ChordComposer} from '../components/ChordComposer'

describe('guided chord entry',()=>{
 it('builds a chord from musical choices',()=>{const save=vi.fn();render(<ChordComposer mode="add" onSave={save} onCancel={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'A'}));fireEvent.click(screen.getByRole('button',{name:/Minor darker/}));fireEvent.click(screen.getByRole('button',{name:'Add Am'}));expect(save).toHaveBeenCalledWith('Am')})
 it('opens an existing chord for editing',()=>{render(<ChordComposer mode="edit" initialSymbol="E7" onSave={()=>{}} onCancel={()=>{}}/>);expect(screen.getByText('E7')).toBeTruthy();expect(screen.getByRole('button',{name:'Update to E7'})).toBeTruthy()})
 it('finds a chord from an exact six-string shape',()=>{const save=vi.fn();render(<ChordComposer mode="add" onSave={save} onCancel={()=>{}}/>);fireEvent.click(screen.getByRole('tab',{name:/Find from a shape/}));fireEvent.click(screen.getByRole('button',{name:/G Exact notes.*Add chord/}));expect(save).toHaveBeenCalledWith('G',[3,2,0,0,3,3])})
})
