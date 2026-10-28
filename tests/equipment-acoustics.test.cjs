const {test}=require('node:test'),assert=require('node:assert/strict');
const {activity,create}=require('../src/modules/equipment-acoustics.js');
const dev=(type,extra={})=>({type,powered:true,state:{},...extra});
test('ambience only belongs to selected powered equipment; motors follow transport',()=>{
    assert.equal(activity(dev('powerValve')),'hum');assert.equal(activity(dev('powerDual')),'fan');
    for(const type of ['speaker','spkElectrostatic','headphone','audioInterface1','eqStudio'])assert.equal(activity(dev(type)),null);
    assert.equal(activity(dev('tapeDeck')),null);assert.equal(activity(dev('tapeDeck',{state:{playing:true}})),'motor');
    assert.equal(activity(dev('turntableDirect',{state:{tt:{running:true}}})),'motor');
    for(const extra of [{powered:false},{state:{damage:{kind:'failed'}}},{runtimeDisposed:true}])assert.equal(activity(dev('powerValve',extra)),null);
});
function harness(){
    const sources=[],nodes=[],param=()=>({value:0,setTargetAtTime(value){this.value=value;},cancelScheduledValues(){}});
    const node=()=>{const n={gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){this.disconnected=true;}};nodes.push(n);return n;};
    const source=()=>{const n=Object.assign(node(),{playbackRate:param(),setPeriodicWave(){},start(){this.started=true;},stop(time){this.stopped=time;this.onended?.();}});sources.push(n);return n;};
    const context={state:'running',currentTime:1,sampleRate:8000,createGain:node,createBiquadFilter:node,createOscillator:source,createBufferSource:source,createPeriodicWave(){},createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}};
    return {context,sources,nodes,engine:create(context,{})};
}
test('large assemblies use at most three quiet sources, and reconcile without restarting',()=>{
    const h=harness(),devices=Array.from({length:100},()=>dev('powerValve')).concat(dev('powerDual'),dev('tapeDeck',{state:{playing:true}}));
    h.engine.sync(devices);assert.equal(h.engine.voiceCount,3);assert.equal(h.sources.length,3);
    h.engine.sync(devices);assert.equal(h.sources.length,3);
    assert(h.nodes.every(n=>n.gain.value<=.75));
    h.engine.sync([]);assert.equal(h.engine.voiceCount,0);assert(h.sources.every(n=>n.disconnected));
});
test('mute, hidden-page policy, suspended context and disposal stop sources',()=>{
    for(const settings of [{enabled:false},{volume:0}]){const h=harness();h.engine.sync([dev('powerDual')]);h.engine.sync([dev('powerDual')],settings);assert.equal(h.engine.voiceCount,0);assert(h.sources.every(n=>n.stopped===1));}
    const h=harness();h.context.state='suspended';h.engine.sync([dev('powerValve')]);assert.equal(h.sources.length,0);
    h.context.state='running';h.engine.sync([dev('powerValve')]);h.engine.dispose();h.engine.dispose();h.engine.sync([dev('powerValve')]);assert.equal(h.engine.voiceCount,0);assert.equal(h.sources.length,1);assert(h.nodes.every(n=>n.disconnected));
});
