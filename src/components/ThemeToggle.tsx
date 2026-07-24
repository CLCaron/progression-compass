import {useLayoutEffect,useState} from 'react'

export type Theme='light'|'dark'
const storageKey='progression-compass-theme'

function preferredTheme():Theme{
 const applied=document.documentElement.dataset.theme
 if(applied==='light'||applied==='dark')return applied
 try{
  const saved=window.localStorage.getItem(storageKey)
  if(saved==='light'||saved==='dark')return saved
 }catch{/* Local preferences are optional. */}
 return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'
}

export function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>(preferredTheme)
 useLayoutEffect(()=>{
  document.documentElement.dataset.theme=theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101719':'#26373d')
  try{window.localStorage.setItem(storageKey,theme)}catch{/* The switch still works for this visit. */}
 },[theme])
 const dark=theme==='dark'
 return <button type="button" className="theme-toggle" aria-label={`Switch to ${dark?'light':'dark'} mode`} aria-pressed={dark} onClick={()=>setTheme(dark?'light':'dark')}><span aria-hidden="true">{dark?'☀':'☾'}</span><small>{dark?'Light':'Dark'}</small></button>
}
