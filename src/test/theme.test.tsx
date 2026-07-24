import {fireEvent,render,screen} from '@testing-library/react'
import {beforeEach,describe,expect,it,vi} from 'vitest'
import {ThemeToggle} from '../components/ThemeToggle'

describe('display theme',()=>{
 beforeEach(()=>{delete document.documentElement.dataset.theme;window.localStorage.clear();document.head.innerHTML='<meta name="theme-color" content="#26373d">';Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn().mockReturnValue({matches:false})})})
 it('switches modes, updates browser color, and remembers the choice',()=>{render(<ThemeToggle/>);const toggle=screen.getByRole('button',{name:'Switch to dark mode'});fireEvent.click(toggle);expect(document.documentElement.dataset.theme).toBe('dark');expect(window.localStorage.getItem('progression-compass-theme')).toBe('dark');expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#101719');expect(screen.getByRole('button',{name:'Switch to light mode'})).toBeTruthy()})
 it('uses the saved choice on return visits',()=>{window.localStorage.setItem('progression-compass-theme','dark');render(<ThemeToggle/>);expect(document.documentElement.dataset.theme).toBe('dark');expect(screen.getByRole('button',{name:'Switch to light mode'})).toBeTruthy()})
 it('follows the device preference when no choice has been saved',()=>{Object.defineProperty(window,'matchMedia',{writable:true,value:vi.fn().mockReturnValue({matches:true})});render(<ThemeToggle/>);expect(document.documentElement.dataset.theme).toBe('dark')})
})
