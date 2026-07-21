export type NoteName='C'|'C#'|'D'|'Eb'|'E'|'F'|'F#'|'G'|'Ab'|'A'|'Bb'|'B'
export type ChordQuality='major'|'minor'|'diminished'|'augmented'|'sus2'|'sus4'
export interface ParsedChord{symbol:string;normalized:string;root:NoteName;rootPc:number;quality:ChordQuality;extensions:string[];bass?:NoteName;pitchClasses:number[]}
export interface KeyInterpretation{id:string;tonic:NoteName;mode:'major'|'minor';score:number;label:'Strong match'|'Common interpretation'|'Possible interpretation'|'Ambiguous';romanNumerals:string[];summary:string}
