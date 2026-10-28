/* Quiet mechanical ambience. Independent of the simulated signal/recording graph. */
(function(root){
    'use strict';
    const profiles=Object.freeze({
        hum:{level:.0024,frequency:60},fan:{level:.008,frequency:420},motor:{level:.004,frequency:150}
    });
    function activity(dev){
        if(!dev.powered||dev.state?.damage||dev.runtimeDisposed)return null;
        if(['powerValve','powerBias','receiver','integratedSilver','preClassic'].includes(dev.type))return 'hum';
        if(dev.type==='powerDual')return 'fan';
        if((dev.state?.tt?.running||dev.state?.playing)&&['turntable','turntableVintage','turntableLinear','turntableBelt','turntableDirect','tapeDeck','cdPlayer'].includes(dev.type))return 'motor';
        return null;
    }
    function create(context,destination){
        const voices=new Map(),bus=context.createGain();bus.gain.value=0;bus.connect(destination);
        let noiseBuffer=null,disposed=false;
        function noise(){
            if(noiseBuffer)return noiseBuffer;
            noiseBuffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate);
            const values=noiseBuffer.getChannelData(0);let smooth=0;
            for(let i=0;i<values.length;i++){smooth=.96*smooth+.04*(Math.random()*2-1);values[i]=smooth;}
            // Close the loop gently rather than repeating an abrupt buffer seam.
            const blend=Math.min(2048,values.length/2);for(let i=0;i<blend;i++){const t=i/(blend-1);values[i]*=t;values[values.length-1-i]*=t;}
            return noiseBuffer;
        }
        function start(kind){
            const spec=profiles[kind],gain=context.createGain(),filter=context.createBiquadFilter();
            let source;
            if(kind==='hum'){
                source=context.createOscillator();source.setPeriodicWave(context.createPeriodicWave(new Float32Array(5),new Float32Array([0,1,.12,.045,.015])));source.frequency.value=spec.frequency;
            }else{source=context.createBufferSource();source.buffer=noise();source.loop=true;source.playbackRate.value=kind==='motor'?.72:1;}
            filter.type='lowpass';filter.frequency.value=spec.frequency;filter.Q.value=.5;
            gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(bus);source.start();
            const voice={source,filter,gain,kind};voices.set(kind,voice);return voice;
        }
        function stop(kind,immediate=false){
            const voice=voices.get(kind);if(!voice)return;voices.delete(kind);
            const now=context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setTargetAtTime(0,now,.12);
            voice.source.onended=()=>{voice.source.disconnect();voice.filter.disconnect();voice.gain.disconnect();};
            voice.source.stop(immediate?now:now+.7);
        }
        return {
            sync(devices,{enabled=true,volume=.5}={}){
                if(disposed)return;
                const allowed=enabled&&volume>0&&context.state==='running',counts={};
                if(allowed)for(const dev of devices){const kind=activity(dev);if(kind)counts[kind]=(counts[kind]||0)+1;}
                const now=context.currentTime;
                // At most three sustained sources, regardless of the number of devices on the canvas.
                for(const kind of Object.keys(profiles)){
                    if(!counts[kind]){stop(kind,!allowed);continue;}
                    const voice=voices.get(kind)||start(kind);
                    voice.gain.gain.setTargetAtTime(profiles[kind].level*Math.min(1.35,1+.08*(counts[kind]-1)),now,.5);
                }
                bus.gain.setTargetAtTime(allowed?Math.min(1,Math.max(0,volume))*.75:0,now,allowed?.25:.04);
            },
            dispose(){if(disposed)return;disposed=true;for(const kind of [...voices.keys()])stop(kind,true);bus.disconnect();noiseBuffer=null;},
            get voiceCount(){return voices.size;}
        };
    }
    const api=Object.freeze({create,activity,profiles});
    if(typeof module==='object'&&module.exports)module.exports=api;else root.EquipmentAcoustics=api;
})(typeof globalThis==='object'?globalThis:this);
