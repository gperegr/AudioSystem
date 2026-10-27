const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const script=readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
const moduleSource=script.slice(script.indexOf('        const isAppleTouchDevice='),script.indexOf('        const uiSoundTimes = {}'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function harness({apple=false,ipad=false,session=true,sessionThrows=false,rejectMedia=false,pendingBlocked=false}={}){
    let gesture=null,created=0,mediaCreated=0,mediaPlays=0,primeStarts=0,graphSetups=0,allowReturn=false;
    const handlers=new Map(),contexts=[],media=[],blobs=[];
    const document={visibilityState:'visible',addEventListener(name,fn,options){handlers.set('doc:'+name,{fn,options});},createElement(tag){assert.equal(tag,'audio');mediaCreated++;const audio={paused:true,setAttribute(){},play(){mediaPlays++;if(rejectMedia)return Promise.reject(Error('NotAllowedError'));audio.paused=false;return Promise.resolve();},pause(){audio.paused=true;}};media.push(audio);return audio;}};
    const window={addEventListener(name,fn){handlers.set('win:'+name,{fn});}};
    class AudioContext{
        constructor(){created++;this.state='suspended';this.sampleRate=48000;this.destination={};this.listeners={};this.resumeCalls=0;contexts.push(this);}
        createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){},disconnect(){}};}
        createBiquadFilter(){return {type:'',frequency:{value:0},gain:{value:0},connect(){},disconnect(){}};}
        createDynamicsCompressor(){return {threshold:{value:0},knee:{value:0},ratio:{value:0},attack:{value:0},release:{value:0},connect(){},disconnect(){}};}
        createBuffer(channels,length,rate){assert.equal(channels,1);assert.equal(length,1);return {length,rate};}
        createBufferSource(){const node={connect(){},disconnect(){},start(){primeStarts++;assert.ok(gesture,'The silent buffer must start synchronously inside the gesture');this.started=true;},onended:null};this.primer=node;return node;}
        addEventListener(name,fn){this.listeners[name]=fn;}
        resume(){this.resumeCalls++;if(!['touchend','click','keydown','pointerup'].includes(gesture)&&!allowReturn)return pendingBlocked?new Promise(()=>{}):Promise.reject(Error('NotAllowedError'));this.state='running';this.listeners.statechange?.();this.primer?.onended?.();return Promise.resolve();}
    }
    window.AudioContext=AudioContext;
    const navigator={userAgent:apple?'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7 like Mac OS X)':'Desktop',platform:ipad?'MacIntel':apple?'iPhone':'Linux',maxTouchPoints:ipad?5:apple?1:0};
    if(session){let type='auto';navigator.audioSession={get type(){return type;},set type(value){if(sessionThrows)throw Error('Unsupported session');type=value;}};}
    const sandbox={window,document,navigator,state:{audioCtx:null,devices:{},listeningOutputLevel:1,listeningBass:0,listeningTreble:0},setupRoomAudio(){graphSetups++;},updateCableFlows(){},URL:{createObjectURL(blob){blobs.push(blob);return 'blob:local-silence';}},Blob,Uint8Array,DataView};
    vm.createContext(sandbox);vm.runInContext('let audioPrimed=false,audioNeedsGestureRecovery=false,legacyPlaybackAudio=null;\n'+moduleSource,sandbox);
    function dispatch(name,{trusted=true,pointerType='touch',button=0,key='Enter',repeat=false}={}){
        gesture=name;try{handlers.get('doc:'+name).fn({type:name,isTrusted:trusted,pointerType,button,key,repeat});}finally{gesture=null;}
    }
    return {sandbox,handlers,contexts,media,blobs,dispatch,counts:()=>({created,mediaCreated,mediaPlays,primeStarts,graphSetups}),async returnToPage(name='pageshow'){allowReturn=true;handlers.get('win:'+name).fn();await settle();allowReturn=false;},visibility(value){document.visibilityState=value;allowReturn=true;handlers.get('doc:visibilitychange').fn();allowReturn=false;}};
}
test('a first touchend initializes and unlocks audio synchronously, even if pointerdown was ignored',async()=>{
    const h=harness();h.dispatch('pointerdown');assert.equal(h.counts().created,0);
    h.dispatch('touchend');await settle();assert.equal(h.contexts[0].state,'running');assert.equal(h.sandbox.navigator.audioSession.type,'playback');assert.equal(h.counts().primeStarts,1);assert.equal(h.counts().mediaCreated,0);
    for(const name of ['pointerdown','pointerup','touchend','click','keydown'])assert.equal(h.handlers.get('doc:'+name).options.capture,true);
});
test('programmatic clicks and repeated or modified keys cannot activate audio',()=>{
    const h=harness();h.dispatch('click',{trusted:false});h.dispatch('keydown',{repeat:true});h.dispatch('keydown',{key:'Escape'});assert.equal(h.counts().created,0);
});
test('a real keyboard activation works and does not rebuild the graph on later gestures',async()=>{
    const h=harness();h.dispatch('keydown');await settle();h.dispatch('click');h.dispatch('pointerup');await settle();assert.equal(h.contexts[0].state,'running');assert.equal(h.counts().created,1);assert.equal(h.counts().graphSetups,1);assert.equal(h.counts().primeStarts,1);
});
test('an earlier blocked attempt does not prevent a subsequent touch from unlocking',async()=>{
    const h=harness();h.dispatch('pointerdown',{pointerType:'mouse'});await settle();assert.equal(h.contexts[0].state,'suspended');h.dispatch('touchend');await settle();assert.equal(h.contexts[0].state,'running');
});
test('a pending resume from an ineligible gesture can be retried during touchend',async()=>{
    const h=harness({pendingBlocked:true});h.dispatch('pointerdown',{pointerType:'mouse'});assert.equal(h.contexts[0].state,'suspended');h.dispatch('touchend');await settle();assert.equal(h.contexts[0].state,'running');assert.equal(h.contexts[0].resumeCalls,2);
});
test('returning to the page never enables audio before a user activation',async()=>{
    const h=harness();vm.runInContext('initAudio()',h.sandbox);await h.returnToPage();assert.equal(h.contexts[0].resumeCalls,0);assert.equal(h.contexts[0].state,'suspended');
});
test('an interrupted or suspended unlocked context recovers on return without recreating sources',async()=>{
    const h=harness();h.dispatch('touchend');await settle();for(const name of ['pageshow','focus']){h.contexts[0].state='interrupted';await h.returnToPage(name);assert.equal(h.contexts[0].state,'running');}h.contexts[0].state='suspended';h.visibility('hidden');assert.equal(h.contexts[0].state,'suspended');h.visibility('visible');await settle();assert.equal(h.contexts[0].state,'running');assert.equal(h.counts().created,1);assert.equal(h.counts().graphSetups,1);
});
test('legacy iPhone and desktop-identifying iPad get one valid silent media session',async()=>{
    for(const ipad of [false,true]){const h=harness({apple:!ipad,ipad,session:false});h.dispatch('touchend');await settle();h.dispatch('click');assert.equal(h.counts().mediaCreated,1);assert.equal(h.counts().mediaPlays,1);const bytes=new Uint8Array(await h.blobs[0].arrayBuffer()),view=new DataView(bytes.buffer);assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'RIFF');assert.equal(view.getUint32(24,true),8000);assert.equal(view.getUint32(40,true),8000);assert.ok(bytes.slice(44).every(value=>value===128));assert.equal(h.media[0].loop,true);assert.notEqual(h.media[0].muted,true);h.visibility('hidden');assert.equal(h.media[0].paused,true);h.visibility('visible');await settle();assert.equal(h.counts().mediaPlays,2);}
});
test('missing or rejected session APIs and media playback do not stop Web Audio',async()=>{
    for(const settings of [{session:false},{apple:true,sessionThrows:true,rejectMedia:true}]){const h=harness(settings);h.dispatch('touchend');await settle();assert.equal(h.contexts[0].state,'running');if(!settings.apple)assert.equal(h.counts().mediaCreated,0);}
});
