const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const filename=path.join(__dirname,'../spotify-coverflow.js');
let source=readFileSync(filename,'utf8');
const apiMarker='    return {mount,inspectorHtml,bindInspector,initialize,login,logout,playAlbum,resumeAlbum,activatePlayback,loadTracks,selectTrack,pauseAlbum,setPlaybackVolume,getPlaybackState,seekTo,setTrackRepeat,setShuffle,markExtracted,markRemoved,setBeforeRedirect(callback){beforeRedirect=callback;}};';
assert.ok(source.includes(apiMarker),'Spotify API export must be present');
source=source.replace(apiMarker,"    window.__setTestPlayer=value=>{player=value;deviceId='device';playbackElementActivated=false};\n"+apiMarker);
const context=vm.createContext({window:{},location:{origin:'https://audio.test',pathname:'/'},matchMedia:()=>({matches:false})});
vm.runInContext(source+'\nwindow.__api=SpotifyCoverflow;',context);

test('the Spotify player is activated once during a user gesture before delayed turntable playback',async()=>{
    let activations=0;
    context.window.__setTestPlayer({activateElement(){activations++;return Promise.resolve();}});
    assert.equal(await context.window.__api.activatePlayback(),true);
    assert.equal(await context.window.__api.activatePlayback(),true);
    assert.equal(activations,1);
});

test('Spotify activation remains retryable when the browser rejects it',async()=>{
    let activations=0;
    context.window.__setTestPlayer({activateElement(){activations++;return Promise.reject(new Error('gesture required'));}});
    await assert.rejects(context.window.__api.activatePlayback(),/gesture required/);
    await assert.rejects(context.window.__api.activatePlayback(),/gesture required/);
    assert.equal(activations,2);
});
