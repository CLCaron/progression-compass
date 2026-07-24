import {noteNameForPc,parseChord} from './chords'

interface LessonDefinition{title:string;formula:string;explanation:string;comparison?:string}
export interface ChordLesson extends LessonDefinition{symbol:string;notes:string[];bass?:string}

const lessons:Record<string,LessonDefinition>={
 '':{title:'Major triad',formula:'1 · 3 · 5',explanation:'The root, major third, and fifth make the stable major sound.'},
 m:{title:'Minor triad',formula:'1 · ♭3 · 5',explanation:'Lowering the third by one fret changes the chord from major to minor.'},
 '7':{title:'Dominant seventh',formula:'1 · 3 · 5 · ♭7',explanation:'A major chord with a lowered seventh. That extra note creates a pull that often resolves down a fifth.',comparison:'“7” means a lowered seventh; “maj7” uses the natural seventh instead.'},
 maj7:{title:'Major seventh',formula:'1 · 3 · 5 · 7',explanation:'A major chord with the natural seventh, one semitone below the root. It sounds settled and tense at once.',comparison:'Unlike a plain “7” chord, maj7 keeps the seventh only one fret below the root.'},
 m7:{title:'Minor seventh',formula:'1 · ♭3 · 5 · ♭7',explanation:'A minor triad with a lowered seventh. It softens the edge of the minor chord.'},
 sus2:{title:'Suspended second',formula:'1 · 2 · 5',explanation:'“Sus” means the third is removed. Here it is replaced by the second, so the chord is neither clearly major nor minor.',comparison:'Sus2 replaces the third; add9 keeps the third and adds the same pitch an octave higher.'},
 sus4:{title:'Suspended fourth',formula:'1 · 4 · 5',explanation:'“Sus” means the third is removed. Here it is replaced by the fourth, which often wants to fall back to the third.',comparison:'Try moving the suspended fourth down one fret to hear it resolve into a major chord.'},
 add9:{title:'Added ninth',formula:'1 · 3 · 5 · 9',explanation:'The major triad stays intact and the ninth is added for color and openness.',comparison:'Add9 keeps the third; sus2 removes it.'},
 '6':{title:'Major sixth',formula:'1 · 3 · 5 · 6',explanation:'A major triad with the sixth added. It gives the chord a warm, less final kind of stability.'},
 m6:{title:'Minor sixth',formula:'1 · ♭3 · 5 · 6',explanation:'A minor triad with a natural sixth, creating a wistful tension.'},
 '9':{title:'Dominant ninth',formula:'1 · 3 · 5 · ♭7 · 9',explanation:'A dominant seventh with the ninth added. The pull remains, but the sound becomes wider and richer.'},
 m9:{title:'Minor ninth',formula:'1 · ♭3 · 5 · ♭7 · 9',explanation:'A minor seventh with the ninth added for a spacious, layered color.'},
 dim:{title:'Diminished triad',formula:'1 · ♭3 · ♭5',explanation:'Both the third and fifth are lowered. The tight symmetry makes the chord feel unstable and ready to move.'},
 aug:{title:'Augmented triad',formula:'1 · 3 · ♯5',explanation:'The fifth is raised by one fret, making the chord feel bright, unsettled, and open-ended.'},
}

const suffixFrom=(symbol:string)=>parseChord(symbol)?.normalized.match(/^[A-G](?:#|b)?(maj7|m7|m9|m6|m|dim|aug|sus2|sus4|add9|7|9|6)?/)?.[1]??''

export function chordLesson(symbol:string):ChordLesson|null{
 const chord=parseChord(symbol)
 if(!chord)return null
 const definition=lessons[suffixFrom(chord.normalized)]??lessons['']!
 return{...definition,symbol:chord.normalized,notes:chord.pitchClasses.map(noteNameForPc),bass:chord.bass}
}
