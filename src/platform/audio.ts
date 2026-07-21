export class BrowserAudio{
 private context?:AudioContext
 private active:OscillatorNode[]=[]
 stop(){this.active.forEach(o=>{try{o.stop()}catch{return}});this.active=[]}
 async playChord(pitchClasses:number[],duration=.65){
  this.stop();this.context??=new AudioContext();await this.context.resume();const now=this.context.currentTime
  pitchClasses.slice(0,4).forEach((pc,index)=>{const osc=this.context!.createOscillator(),gain=this.context!.createGain();osc.type=index===0?'triangle':'sine';osc.frequency.value=110*Math.pow(2,((pc-9+12)%12)/12);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.07/(index+1),now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(this.context!.destination);osc.start(now);osc.stop(now+duration+.05);this.active.push(osc)})
 }
 async playMidi(notes:number[],duration=.65){
  this.stop();this.context??=new AudioContext();await this.context.resume();const now=this.context.currentTime
  notes.forEach((midi,index)=>{const osc=this.context!.createOscillator(),gain=this.context!.createGain();osc.type=index<2?'triangle':'sine';osc.frequency.value=440*Math.pow(2,(midi-69)/12);gain.gain.setValueAtTime(.0001,now+index*.012);gain.gain.exponentialRampToValueAtTime(.035,now+.025+index*.012);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain).connect(this.context!.destination);osc.start(now+index*.012);osc.stop(now+duration+.05);this.active.push(osc)})
 }
}

