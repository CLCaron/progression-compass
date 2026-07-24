import {fireEvent,render,screen} from '@testing-library/react'
import {beforeEach,describe,expect,it} from 'vitest'
import {App} from '../app/App'

describe('saved song identity',()=>{
 beforeEach(()=>window.localStorage.clear())
 it('renames the visible song and updates the same saved copy',()=>{render(<App/>);const title=screen.getByLabelText('Song title');fireEvent.change(title,{target:{value:'Northbound'}});fireEvent.click(screen.getByRole('button',{name:'Save song'}));let saved=JSON.parse(window.localStorage.getItem('progression-compass:saves')!);expect(saved.songs).toHaveLength(1);expect(saved.songs[0].name).toBe('Northbound');const id=saved.songs[0].id;fireEvent.change(title,{target:{value:'Northbound Again'}});expect(screen.getByText('Unsaved changes')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Update song'}));saved=JSON.parse(window.localStorage.getItem('progression-compass:saves')!);expect(saved.songs).toHaveLength(1);expect(saved.songs[0].id).toBe(id);expect(saved.songs[0].name).toBe('Northbound Again')})
})
