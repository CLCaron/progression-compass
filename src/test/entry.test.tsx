import {fireEvent,render,screen} from '@testing-library/react'
import {describe,expect,it,vi} from 'vitest'
import {ChordComposer} from '../components/ChordComposer'

describe('guided chord entry',()=>{
 it('builds a chord from musical choices',()=>{const save=vi.fn();render(<ChordComposer mode="add" onSave={save} onCancel={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'A'}));fireEvent.click(screen.getByRole('button',{name:/Minor darker/}));fireEvent.click(screen.getByRole('button',{name:'Add Am'}));expect(save).toHaveBeenCalledWith('Am')})
 it('opens an existing chord for editing',()=>{render(<ChordComposer mode="edit" initialSymbol="E7" onSave={()=>{}} onCancel={()=>{}}/>);expect(screen.getByText('E7')).toBeTruthy();expect(screen.getByRole('button',{name:'Update to E7'})).toBeTruthy()})
})
