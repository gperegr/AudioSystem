/* A single, lazily decoded, gapless menu soundtrack on the app's existing audio context. */
(() => {
    'use strict';
    function create({getContext,getOutput,getVolume,isVisible,onChange=()=>{},url='./assets/audio/menu-blues.mp3?v=1'}){
        let context=null,buffer=null,bufferPromise=null,source=null,gain=null;
        let wanted=false,generation=0,offset=0,startedAt=0,error=null;
        const volume=()=>Math.max(0,Math.min(1,Number(getVolume())||0));
        const notify=()=>onChange();
        function updateVolume(){
            if(!gain||!context)return;
            const now=context.currentTime;gain.gain.cancelScheduledValues(now);
            gain.gain.setValueAtTime(gain.gain.value,now);gain.gain.linearRampToValueAtTime(volume(),now+.15);
        }
        function load(){
            if(!bufferPromise)bufferPromise=fetch(url).then(response=>{
                if(!response.ok)throw new Error('Menu soundtrack unavailable');return response.arrayBuffer();
            }).then(bytes=>context.decodeAudioData(bytes)).then(decoded=>{buffer=decoded;return decoded;}).catch(reason=>{bufferPromise=null;throw reason;});
            return bufferPromise;
        }
        async function play({gesture=false}={}){
            if(!isVisible()||!volume())return false;
            if(source){updateVolume();return true;}
            const request=++generation;wanted=true;error=null;notify();
            try{
                context=getContext();
                // A visibility change must never unlock a previously suspended context.
                if(gesture&&context.state!=='running')await context.resume();
                if(request!==generation||!wanted)return false;
                if(context.state!=='running'){wanted=false;notify();return false;}
                const decoded=await load();
                if(request!==generation||!wanted||!isVisible()||!volume())return false;
                const node=context.createBufferSource(),level=context.createGain();
                node.buffer=decoded;node.loop=true;node.loopStart=0;node.loopEnd=decoded.duration;
                level.gain.value=0;node.connect(level);level.connect(getOutput());
                const start=context.currentTime+.015;startedAt=start;
                node.onended=()=>{node.disconnect();level.disconnect();if(source===node){source=null;gain=null;wanted=false;notify();}};
                source=node;gain=level;node.start(start,offset%decoded.duration);
                level.gain.setValueAtTime(0,start);level.gain.linearRampToValueAtTime(volume(),start+.5);
                notify();return true;
            }catch(reason){if(request===generation){wanted=false;error=reason;notify();}return false;}
        }
        function stop({fade=.18}={}){
            ++generation;wanted=false;
            const node=source,level=gain;source=null;gain=null;
            if(node){
                const now=context.currentTime;
                offset=(offset+Math.max(0,now-startedAt))%buffer.duration;
                if(context.state==='running'&&fade>0){
                    level.gain.cancelScheduledValues(now);level.gain.setValueAtTime(level.gain.value,now);level.gain.linearRampToValueAtTime(0,now+fade);node.stop(now+fade+.02);
                }else{node.stop();node.disconnect();level.disconnect();}
            }
            notify();
        }
        return Object.freeze({play,stop,updateVolume,get active(){return wanted||!!source;},get state(){return {playing:!!source,loading:wanted&&!source,loaded:!!buffer,duration:buffer?.duration||0,loop:source?.loop||false,volume:volume(),error:!!error};}});
    }
    window.AudioLabMenuMusic=Object.freeze({create});
})();
