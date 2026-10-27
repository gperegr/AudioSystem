/* Audio engine startup, interaction sounds, transports, receiver radio, and meters. */
        const isAppleTouchDevice=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
        function configurePlaybackSession(){
            try{
                if(navigator.audioSession){
                    const capturing=Object.values(appState.project.devices).some(dev=>dev.capturePending||dev.authorizingCapture||dev.micStream);
                    const sessionType=capturing?'play-and-record':'playback';
                    if(navigator.audioSession.type!==sessionType)navigator.audioSession.type=sessionType;
                    return navigator.audioSession.type===sessionType;
                }
            }catch{ /* Older Safari versions have no writable Audio Session API. */ }
            return false;
        }
        function prepareLegacyPlayback(){
            if(configurePlaybackSession()||!isAppleTouchDevice())return;
            if(!legacyPlaybackAudio){
                // Older iOS routes Web Audio through the ringer. A silent media session
                // selects the media output without changing the simulator's audio graph.
                const samples=8000,bytes=new Uint8Array(44+samples),view=new DataView(bytes.buffer);
                const text=(offset,value)=>[...value].forEach((letter,i)=>bytes[offset+i]=letter.charCodeAt(0));
                text(0,'RIFF');view.setUint32(4,36+samples,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true);view.setUint32(28,8000,true);view.setUint16(32,1,true);view.setUint16(34,8,true);text(36,'data');view.setUint32(40,samples,true);bytes.fill(128,44);
                legacyPlaybackAudio=document.createElement('audio');
                legacyPlaybackAudio.loop=true;legacyPlaybackAudio.preload='auto';legacyPlaybackAudio.setAttribute('playsinline','');legacyPlaybackAudio.disableRemotePlayback=true;
                legacyPlaybackAudio.src=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
            }
            if(legacyPlaybackAudio.paused)legacyPlaybackAudio.play()?.catch(()=>{});
        }
        function initAudio() {
            if (appState.audio.context) return;
            configurePlaybackSession();
            appStateStore.actions.setAudioRuntime('context',new (window.AudioContext || window.webkitAudioContext)({latencyHint:'interactive'}));
            appStateStore.actions.setAudioRuntime('masterGain',appState.audio.context.createGain());
            // Add a little more listening level while leaving headroom for summed sources.
            appState.audio.masterGain.gain.value = 0.7*appState.preferences.listening.outputLevel;
            const bass=appState.audio.context.createBiquadFilter(),treble=appState.audio.context.createBiquadFilter();
            bass.type='lowshelf';bass.frequency.value=140;bass.gain.value=appState.preferences.listening.bass;
            treble.type='highshelf';treble.frequency.value=4500;treble.gain.value=appState.preferences.listening.treble;
            const peakGuard=appState.audio.context.createDynamicsCompressor();
            peakGuard.threshold.value=-4;peakGuard.knee.value=0;peakGuard.ratio.value=12;peakGuard.attack.value=.003;peakGuard.release.value=.12;
            bass.connect(treble);treble.connect(peakGuard);peakGuard.connect(appState.audio.context.destination);
            appStateStore.actions.setAudioRuntime('listeningToneInput',bass);appStateStore.actions.setAudioRuntime('listeningToneFilters',{bass,treble});
            setupRoomAudio();
            appState.audio.context.addEventListener('statechange', () => {
                if(appState.audio.context.state==='interrupted')audioNeedsGestureRecovery=true;
                updateCableFlows();
            });
        }
        function setListeningOutputLevel(value){
            appStateStore.actions.setListeningPreferences({outputLevel:Math.round(Math.max(.5,Math.min(1.2,Number(value)||1))*100)/100});
            if(appState.audio.masterGain)appState.audio.masterGain.gain.setTargetAtTime(.7*appState.preferences.listening.outputLevel,appState.audio.context.currentTime,.04);
            const slider=document.getElementById('listening-output-level'),output=document.getElementById('listening-output-value');
            if(slider)slider.value=Math.round(appState.preferences.listening.outputLevel*100);
            if(output)output.textContent=Math.round(appState.preferences.listening.outputLevel*100)+'%';
            scheduleAppPreferencesSave();
        }
        function setListeningTone(kind,value){
            if(kind!=='bass'&&kind!=='treble')return;
            const amount=Math.max(-6,Math.min(6,Math.round(Number(value)||0)));
            appStateStore.actions.setListeningPreferences({[kind]:amount});
            if(appState.audio.listeningToneFilters)appState.audio.listeningToneFilters[kind].gain.setTargetAtTime(amount,appState.audio.context.currentTime,.045);
            const slider=document.getElementById(`listening-${kind}-level`),output=document.getElementById(`listening-${kind}-value`);
            if(slider)slider.value=amount;
            if(output)output.textContent=`${amount>0?'+':''}${amount} dB`;
            scheduleAppPreferencesSave();
        }
        function activateAudioFromGesture(event){
            if(!event.isTrusted||document.visibilityState==='hidden')return;
            if(event.type==='pointerdown'&&(event.pointerType==='touch'||event.button!==0))return;
            if(event.type==='keydown'&&(event.repeat||event.ctrlKey||event.metaKey||event.altKey||['Shift','Control','Alt','Meta','Escape'].includes(event.key)))return;
            try{
                initAudio();const context=appState.audio.context;
                prepareLegacyPlayback();
                // Start inside the trusted gesture, before any await. Touch Safari may
                // ignore pointerdown but accepts touchend/click and a started buffer.
                if(!audioPrimed||audioNeedsGestureRecovery){
                    const source=context.createBufferSource();source.buffer=context.createBuffer(1,1,context.sampleRate);source.connect(context.destination);
                    source.onended=()=>source.disconnect();source.start(0);audioPrimed=true;audioNeedsGestureRecovery=false;
                }
                if(context.state!=='running')context.resume().then(()=>{audioNeedsGestureRecovery=context.state!=='running';updateCableFlows();}).catch(()=>{audioNeedsGestureRecovery=true;});
            }catch{ /* Playback controls can retry when the browser allows audio. */ }
        }
        for(const name of ['pointerdown','pointerup','touchend','click','keydown'])document.addEventListener(name,activateAudioFromGesture,{capture:true,passive:true});
        function resumeAudioAfterReturn(){
            const context=appState.audio.context;
            if(!context||!audioPrimed||document.visibilityState==='hidden'||context.state==='closed')return;
            prepareLegacyPlayback();
            if(context.state!=='running')context.resume().then(()=>{if(context.state!=='running')audioNeedsGestureRecovery=true;updateCableFlows();}).catch(()=>{audioNeedsGestureRecovery=true;});
        }
        document.addEventListener('visibilitychange',()=>{
            if(document.visibilityState==='hidden'){audioNeedsGestureRecovery=true;legacyPlaybackAudio?.pause();}
            else resumeAudioAfterReturn();
        });
        window.addEventListener('pageshow',resumeAudioAfterReturn);
        window.addEventListener('focus',()=>{audioNeedsGestureRecovery=true;resumeAudioAfterReturn();});
        window.addEventListener('blur',()=>{audioNeedsGestureRecovery=true;});
        window.addEventListener('pagehide',()=>{audioNeedsGestureRecovery=true;legacyPlaybackAudio?.pause();});

        const uiSoundTimes = {};
        let uiNoiseBuffer=null,uiEffectsGain=null,uiEffectsLimiter=null;
        const interactionGain=value=>Math.min(1.4,Math.max(0,value)*1.3);
        function ensureUiEffectsBus(context){
            if(uiEffectsGain)return;
            uiEffectsGain=context.createGain();uiEffectsGain.gain.value=interactionGain(appState.preferences.uiSoundVolume);
            uiEffectsLimiter=context.createDynamicsCompressor();uiEffectsLimiter.threshold.value=-14;uiEffectsLimiter.knee.value=12;uiEffectsLimiter.ratio.value=6;uiEffectsLimiter.attack.value=.003;uiEffectsLimiter.release.value=.12;
            uiEffectsGain.connect(uiEffectsLimiter);uiEffectsLimiter.connect(appState.audio.listeningToneInput);
        }
        const uiSoundProfiles={
            click:{duration:.065,frequency:1100,noise:.09,tone:210,body:.014},
            receiverClick:{duration:.048,frequency:1800,noise:.115,tone:155,body:.018},
            pickup:{duration:.12,frequency:420,noise:.075,tone:105,body:.04},
            drop:{duration:.155,frequency:320,noise:.10,tone:85,body:.055},
            feet:{duration:.12,frequency:1900,noise:.045,tone:980,body:.17},
            feetRetract:{duration:.12,frequency:1900,noise:.045,tone:980,body:.17},
            connect:{duration:.095,frequency:1350,noise:.085,tone:240,body:.012},
            disconnect:{duration:.12,frequency:720,noise:.075,tone:165,body:.012},
            adjust:{duration:.055,frequency:950,noise:.04,tone:0,body:0},
            catalogGear:{duration:.024,frequency:1350,noise:.009,tone:185,body:.0015,attack:.0015,lowpass:2400,ring:2100,ringLevel:.0006,cooldown:28},
            discard:{duration:.13,frequency:2400,noise:.20,tone:95,body:.045},
            ...Hardware.buttonSounds,
            ...Hardware.movementSounds
        };
        function prepareUiAudio(){
            initAudio();const context=appState.audio.context;
            ensureUiEffectsBus(context);
            if(!uiNoiseBuffer){
                uiNoiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
                const data=uiNoiseBuffer.getChannelData(0);let smooth=0;
                for(let i=0;i<data.length;i++){smooth=.65*smooth+.35*(Math.random()*2-1);data[i]=smooth;}
            }
        }
        document.addEventListener('pointerover',()=>{try{prepareUiAudio();}catch{}},{once:true,passive:true});
        document.addEventListener('pointerdown',event=>{
            if(event.button!==0)return;
            try{prepareUiAudio();}catch{}
            const control=event.target.closest('button,input,select,textarea,.port,.speaker-grille,.grille-restore,[role="button"]');
            if(!control&&event.target.closest('.device-node,.catalog-item'))playUiSound('pickup');
        },{capture:true});
        async function playUiSound(kind = 'click', options = {}) {
            if(appState.project.restoringProject)return;
            const now=performance.now(),profile=uiSoundProfiles[kind]||uiSoundProfiles.click;
            if(now-(uiSoundTimes[kind]??-Infinity)<(profile.cooldown??(kind==='drag'?140:kind==='adjust'?95:55)))return;
            uiSoundTimes[kind]=now;
            if(appState.preferences.uiSoundVolume===0)return;
            try{
                initAudio();const context=appState.audio.context;
                if(context.state!=='running')await context.resume();
                if(context.state!=='running')return;
                prepareUiAudio();
                const variation=(.94+Math.random()*.12)*(options.pitch??1);
                const burst=(delay,level=1)=>{
                    const time=context.currentTime+delay,duration=profile.duration;
                    const noise=context.createBufferSource(),filter=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain();
                    noise.buffer=uiNoiseBuffer;filter.type='bandpass';filter.frequency.value=profile.frequency*variation*(kind==='discard'?.7+Math.random()*.9:1);filter.Q.value=profile.resonance??(kind==='discard'?1.5:.65);
                    const wooden=kind==='pickup'||kind==='drop',bubble=kind==='feet'||kind==='feetRetract';
                    low.type='lowpass';low.frequency.value=profile.lowpass??(wooden?1400:kind==='receiverClick'?4300:kind==='discard'?5600:2200);
                    const constructionLevel=(kind.startsWith('move')?1.8:kind.startsWith('hw')?1.5:1.35)*(options.level??1);
                    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(profile.noise*level*constructionLevel,time+(profile.attack??(wooden||bubble||kind==='discard'||kind==='receiverClick'?.0015:Math.min(.012,duration*.18))));gain.gain.exponentialRampToValueAtTime(.00001,time+duration);
                    noise.connect(filter);filter.connect(low);low.connect(gain);gain.connect(uiEffectsGain);
                    noise.onended=()=>{noise.disconnect();filter.disconnect();low.disconnect();gain.disconnect();};
                    noise.start(time,Math.random()*.6,duration);
                    if(profile.tone){
                        const tone=context.createOscillator(),body=context.createGain();tone.type='sine';tone.frequency.value=profile.tone*variation;
                        if(wooden)tone.frequency.exponentialRampToValueAtTime(profile.tone*variation*.72,time+.045);
                        if(bubble){tone.frequency.exponentialRampToValueAtTime(260*variation,time+.025);tone.frequency.exponentialRampToValueAtTime(130*variation,time+.075);}
                        body.gain.setValueAtTime(0,time);body.gain.linearRampToValueAtTime(profile.body*level*constructionLevel,time+(profile.attack??(wooden||bubble||kind==='receiverClick'?.002:.008)));body.gain.exponentialRampToValueAtTime(.00001,time+duration);
                        tone.connect(body);body.connect(uiEffectsGain);tone.onended=()=>{tone.disconnect();body.disconnect();};tone.start(time);tone.stop(time+duration);
                    }
                    if(profile.ring){
                        const ring=context.createOscillator(),ringGain=context.createGain();ring.type='sine';ring.frequency.value=profile.ring*variation;
                        ringGain.gain.setValueAtTime(0,time);ringGain.gain.linearRampToValueAtTime(profile.ringLevel*level*constructionLevel,time+.001);ringGain.gain.exponentialRampToValueAtTime(.00001,time+duration);
                        ring.connect(ringGain);ringGain.connect(uiEffectsGain);ring.onended=()=>{ring.disconnect();ringGain.disconnect();};ring.start(time);ring.stop(time+duration);
                    }
                };
                burst(0);
                if(profile.bounce)burst(profile.bounce,profile.bounceLevel??.25);
                if(kind==='connect')burst(.042,.45);
                if(kind==='receiverClick')burst(.018,.38);
                if(kind==='discard'){burst(.023,.62);burst(.061,.35);burst(.104,.16);}
            }catch(error){ /* Feedback is optional when audio is unavailable. */ }
        }
        function enableCatalogScrollSound(element){
            const scrollKeys=new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);
            let armed=false,inputType='',lastPosition=element.scrollTop,lastTime=performance.now(),lastMovement=0,distance=0,speed=0;
            function arm(event){
                if(!event.isTrusted||event.ctrlKey||event.metaKey)return;
                if(event.type==='keydown'&&(!scrollKeys.has(event.key)||event.target.closest('input,select,textarea,[contenteditable]')))return;
                const now=performance.now();
                if(!armed||now-lastMovement>220){lastPosition=element.scrollTop;lastTime=now;distance=0;speed=0;}
                armed=true;inputType=event.type==='wheel'?'wheel':event.type==='keydown'?'keyboard':event.pointerType;lastMovement=now;
            }
            for(const type of ['wheel','pointerdown','keydown'])element.addEventListener(type,arm,{capture:true,passive:true});
            element.addEventListener('scroll',()=>{
                const now=performance.now(),position=element.scrollTop,travel=Math.abs(position-lastPosition),elapsed=Math.max(8,now-lastTime);
                lastPosition=position;lastTime=now;
                if(!armed||(inputType==='wheel'&&!wheelScrollMotions.get(element)?.frame)||now-lastMovement>220||appState.project.restoringProject||document.visibilityState!=='visible'||!element.clientHeight||getComputedStyle(element).visibility==='hidden'){
                    armed=false;distance=0;return;
                }
                lastMovement=now;
                speed+=(travel*1000/elapsed-speed)*.4;
                distance+=travel;
                // Each tooth follows actual travel, including native touch and wheel inertia.
                // Discard excess travel instead of queuing sounds after the list has stopped.
                if(distance<16)return;
                distance%=16;
                if(appState.preferences.uiSoundVolume===0||appState.audio.context?.state!=='running')return;
                const intensity=Math.min(1,speed/1400);
                playUiSound('catalogGear',{level:.4+intensity*.55,pitch:.85+intensity*.35});
            },{passive:true});
        }
        enableCatalogScrollSound(equipmentCatalog.querySelector('.overflow-y-auto'));
        let cableHumVoice=null,cableHumRequest=0;
        function stopCableHum(){
            cableHumRequest++;
            const voice=cableHumVoice;cableHumVoice=null;
            if(!voice)return;
            const now=appState.audio.context.currentTime;
            voice.gain.gain.cancelAndHoldAtTime(now);
            voice.gain.gain.linearRampToValueAtTime(0,now+.006);
            voice.oscillator.stop(now+.008);
        }
        async function startCableHum(){
            stopCableHum();const request=cableHumRequest;
            try{
                initAudio();const context=appState.audio.context;
                if(context.state!=='running')await context.resume();
                if(request!==cableHumRequest||!isPatching||context.state!=='running')return;
                prepareUiAudio();
                uiEffectsGain.gain.setTargetAtTime(interactionGain(appState.preferences.uiSoundVolume),context.currentTime,.02);
                const oscillator=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain();
                const real=new Float32Array(7),imag=new Float32Array([0,1,.28,.16,.07,.03,.02]);
                oscillator.setPeriodicWave(context.createPeriodicWave(real,imag));oscillator.frequency.value=60;
                filter.type='lowpass';filter.frequency.value=650;filter.Q.value=.5;
                gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(.035,context.currentTime+.035);
                oscillator.connect(filter);filter.connect(gain);gain.connect(uiEffectsGain);
                oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
                oscillator.start();cableHumVoice={oscillator,gain};
            }catch(error){ /* Cable feedback remains optional if audio is blocked. */ }
        }
        function cancelCableDrag(){
            stopCableHum();
            if(!isPatching)return;
            tempCableEl?.remove();hoveredTargetPort?.classList.remove('port-highlight');
            isPatching=false;startPort=null;tempCableEl=null;hoveredTargetPort=null;hoveredGuidancePort=null;
            dragPhysics.activeTarget=null;updatePortGuidance();
        }
        window.addEventListener('pointerup',stopCableHum,{capture:true});
        window.addEventListener('blur',cancelCableDrag);
        window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelCableDrag();},{capture:true});
        const soundControls=document.createElement('div');
        soundControls.className='flex flex-col gap-2 mb-4';
        soundControls.innerHTML='<label for="ui-sound-volume" class="text-xs text-gray-400">Sons de interação <span id="ui-sound-value">50%</span></label><input id="ui-sound-volume" aria-label="Volume dos sons de interação; zero silencia" type="range" min="0" max="100" step="5" value="50">';
        clearCatalogFooter.prepend(soundControls);
        function setInteractionVolume(percent){
            const value=Math.max(0,Math.min(100,Number(percent)||0));
            appStateStore.actions.setPreference('uiSoundVolume',value/100);
            document.getElementById('ui-sound-volume').value=value;
            document.getElementById('ui-sound-value').textContent=value?`${value}%`:'desligados';
            document.getElementById('headphone-calibration-ui-slider').value=value;
            document.getElementById('headphone-calibration-ui-value').textContent=value?`${value}%`:'desligados';
            uiEffectsGain?.gain.setTargetAtTime(interactionGain(appState.preferences.uiSoundVolume),appState.audio.context.currentTime,.02);
            scheduleProjectSave();
        }
        soundControls.querySelector('input').addEventListener('input',event=>setInteractionVolume(event.target.value));
        const sliderSoundValues=new WeakMap();
        document.addEventListener('focusin',event=>{
            if(event.target.matches('input[type="range"]'))sliderSoundValues.set(event.target,Number(event.target.value));
        });
        document.addEventListener('pointerdown',event=>{
            if(event.target.matches('input[type="range"]'))sliderSoundValues.set(event.target,Number(event.target.value));
        },{capture:true});
        document.addEventListener('input',event=>{
            const el=event.target;
            if(!event.isTrusted||!el.matches('input[type="range"]')||['ui-sound-volume','headphone-calibration-ui-slider'].includes(el.id))return;
            const value=Number(el.value),previous=sliderSoundValues.get(el);
            sliderSoundValues.set(el,value);
            if(previous!==undefined&&Math.abs(value-previous)<1e-7)return;
            playUiSound(Hardware.movementSound(el,'slider'));
        });
        function controlClickSound(control){
            if(control.matches('[role="slider"]'))return 'click';
            const device=control.closest('.device-type-receiver,.device-type-powerAmp');
            const inspectorReceiver=control.closest('#inspector')&&RADIO_RECEIVERS.has(appState.project.devices[appState.interface.selectedDeviceId]?.type)&&control.matches('[data-receiver-inspector-input],#radio-input-toggle,#inspector-power-toggle');
            return device||inspectorReceiver?'receiverClick':'click';
        }
        document.addEventListener('pointerdown',event=>{
            const control=event.target.closest('button,input[type="checkbox"],[role="button"]');
            if(event.button===0&&control&&!control.disabled&&!control.hasAttribute('data-hardware-feedback')&&!control.matches('[role="slider"],[data-hardware-linear]'))playUiSound(controlClickSound(control));
        },{capture:true});
        document.addEventListener('click',event=>{
            const control=event.target.closest('button,input[type="checkbox"],[role="button"]');
            if(event.detail===0&&control&&!control.disabled&&!control.hasAttribute('data-hardware-feedback')&&!control.matches('[role="slider"],[data-hardware-linear]'))playUiSound(controlClickSound(control));
        },{capture:true});
        document.addEventListener('change', event => {
            if (event.target.matches('select')) playUiSound('click');
        });

        function playNote(freq, type, duration, vol, timeOffset, destNode) {
            if (!appState.audio.context) return;
            const osc = appState.audio.context.createOscillator();
            const gain = appState.audio.context.createGain();
            osc.type = type; osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, appState.audio.context.currentTime + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.0001, appState.audio.context.currentTime + timeOffset + duration);
            osc.connect(gain); gain.connect(destNode);
            osc.start(appState.audio.context.currentTime + timeOffset);
            osc.stop(appState.audio.context.currentTime + timeOffset + duration);
        }

        function sourcePosition(dev) {
            if (!dev.audioBuffer) return 0;
            const playback = dev.filePlayback;
            let position = (dev.fileOffset || 0) + (playback ? (appState.audio.context.currentTime - playback.startedAt) * playback.rate : 0);
            if (dev.state.repeat) position %= dev.audioBuffer.duration;
            return Math.max(0, Math.min(dev.audioBuffer.duration, position));
        }
        function formatAudioTime(seconds) {
            const value = Math.max(0, Math.floor(seconds || 0));
            return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;
        }
        function seekSource(dev, seconds) {
            if (!dev.audioBuffer) return;
            stopFilePlayback(dev);
            dev.fileOffset = Math.max(0,Math.min(dev.audioBuffer.duration,seconds));
            if (dev.fileOffset === dev.audioBuffer.duration && !dev.state.repeat) setSourcePlaying(dev,false);
            else startFilePlayback(dev);
            updateRealtimePanels(performance.now(),true);
        }
        function transportInspectorHtml(dev) {
            const spotify=!!dev.spotifyVinyl,playback=spotify?SpotifyCoverflow.getPlaybackState():null;
            const active=spotify&&(playback.context===dev.spotifyVinyl.uri||spotifyPlayingTurntable===dev.id);
            const position=spotify?(active?playback.position:0):sourcePosition(dev),duration=spotify?(active?playback.duration:0):dev.audioBuffer.duration;
            const repeat=spotify?playback.repeat:!!dev.state.repeat,disabled=spotify&&(!playback.connected||!active||!duration)?'disabled':'';
            const playButton=spotify?`<button class="tt-insp-btn source-play-toggle ${dev.state.playing?'is-playing':''}" id="source-play-pause" type="button" title="${dev.state.playing?'Pausar':'Reproduzir'}" aria-label="${dev.state.playing?'Pausar':'Reproduzir'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="source-play-icon" d="M7 4v16l13-8Z"/><path class="source-pause-icon" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></button>`:'';
            const shuffleButton=spotify?`<button class="tt-insp-btn ${playback.shuffle?'is-on':''}" id="source-shuffle" type="button" title="Ordem aleatória" aria-label="Ordem aleatória" aria-pressed="${playback.shuffle}" ${!playback.connected?'disabled':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h3c5 0 7 12 12 12h3m-4-4 4 4-4 4M3 18h3c2.5 0 4-2.5 5.4-5m3-2C16 8.5 17.5 6 20 6h1m-4-4 4 4-4 4"/></svg></button>`:'';
            return `<div class="audio-transport"><label for="source-progress">Transporte da música</label>${spotify?'<span id="source-track-title" class="spotify-track-title">Aguardando faixa do Spotify</span>':''}<div class="transport-time"><span id="source-position">${formatAudioTime(position)}</span><span id="source-duration">${formatAudioTime(duration)}</span></div><input id="source-progress" type="range" min="0" max="${Math.max(.1,duration)}" step="0.1" value="${position}" aria-label="Posição da faixa" ${disabled}><div class="transport-buttons">${playButton}<button class="tt-insp-btn" id="source-rewind" type="button" title="Retroceder 10 segundos" aria-label="Retroceder 10 segundos" ${disabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8V4m0 4h4M5.4 8a8 8 0 1 1-1 8"/><text x="12" y="16" text-anchor="middle">10</text></svg></button><button class="tt-insp-btn" id="source-forward" type="button" title="Avançar 10 segundos" aria-label="Avançar 10 segundos" ${disabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8V4m0 4h-4M18.6 8a8 8 0 1 0 1 8"/><text x="12" y="16" text-anchor="middle">10</text></svg></button><button class="tt-insp-btn ${repeat?'is-on':''}" id="source-repeat" type="button" title="Repetir faixa" aria-label="Repetir faixa" aria-pressed="${repeat}" ${disabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V7a3 3 0 0 1 3-3h11l-2.5-2.5M18 4l-2.5 2.5M20 15v2a3 3 0 0 1-3 3H6l2.5 2.5M6 20l-2.5-2.5"/></svg></button>${shuffleButton}</div></div>`;
        }
        function spotifyTrackInspectorHtml(){
            return '<section class="spotify-track-panel" aria-label="Faixas do disco"><h3>Faixas do disco</h3><span class="spotify-track-album"></span><div class="spotify-track-list" role="list"><p role="status">Carregando faixas…</p></div></section>';
        }
        async function bindSpotifyTrackInspector(dev){
            const panel=document.querySelector('#inspector-content .spotify-track-panel');
            if(!panel||!dev.spotifyVinyl)return;
            const vinyl=dev.spotifyVinyl,uri=vinyl.uri,list=panel.querySelector('.spotify-track-list');
            panel.querySelector('.spotify-track-album').textContent=vinyl.name;
            try{
                const tracks=await SpotifyCoverflow.loadTracks(uri);
                if(!panel.isConnected||dev.spotifyVinyl?.uri!==uri)return;
                list.replaceChildren();
                tracks.forEach((track,index)=>{
                    if(!track)return;
                    const button=document.createElement('button');button.type='button';button.className='spotify-track-item';button.dataset.index=index;button.dataset.uri=track.uri;
                    const number=document.createElement('span');number.className='spotify-track-number';number.textContent=String(track.number).padStart(2,'0');
                    const title=document.createElement('span');title.className='spotify-track-name';title.textContent=track.name;
                    const time=document.createElement('time');time.textContent=formatAudioTime(track.duration/1000);
                    button.append(number,title,time);list.append(button);
                });
                if(!list.children.length)list.textContent='Nenhuma faixa disponível neste disco.';
                list.addEventListener('click',async event=>{
                    const button=event.target.closest('.spotify-track-item');if(!button||dev.spotifyVinyl?.uri!==uri)return;
                    if(!dev.powered){spotifyVinylNotice('Ligue o toca-discos para reproduzir a faixa.');return;}
                    if(spotifyPlayingTurntable&&spotifyPlayingTurntable!==dev.id){spotifyVinylNotice('Pare o outro toca-discos do Spotify antes de reproduzir este.');return;}
                    const index=Number(button.dataset.index);
                    try{if(dev.state.playing)await SpotifyCoverflow.selectTrack(vinyl,index);else await setSourcePlaying(dev,true,false,index);}
                    catch(error){spotifyVinylNotice(error.message||'Não foi possível tocar a faixa.');}
                });
                updateSpotifyTrackSelection(dev);
            }catch(error){if(panel.isConnected)list.textContent=error.message||'Não foi possível carregar as faixas.';}
        }
        function updateSpotifyTrackSelection(dev){
            const panel=document.querySelector('#inspector-content .spotify-track-panel');if(!panel||!dev.spotifyVinyl)return;
            const playback=SpotifyCoverflow.getPlaybackState(),current=playback.context===dev.spotifyVinyl.uri?playback.trackUri:'';
            if(panel.dataset.currentTrack===current)return;
            panel.dataset.currentTrack=current;
            panel.querySelectorAll('.spotify-track-item').forEach(button=>{const active=!!current&&button.dataset.uri===current;button.classList.toggle('is-current',active);button.setAttribute('aria-current',active?'true':'false');});
        }
        function bindTransportInspector(dev) {
            if(dev.spotifyVinyl){
                const seek=seconds=>SpotifyCoverflow.seekTo(seconds).catch(error=>spotifyVinylNotice(error.message||'Não foi possível avançar a faixa.'));
                document.getElementById('source-play-pause').addEventListener('click',()=>{
                    if(!dev.powered){spotifyVinylNotice('Ligue o toca-discos para reproduzir.');return;}
                    setSourcePlaying(dev,!dev.state.playing);
                });
                document.getElementById('source-shuffle').addEventListener('click',async event=>{
                    const enabled=event.currentTarget.getAttribute('aria-pressed')!=='true';
                    try{await SpotifyCoverflow.setShuffle(enabled);event.currentTarget.classList.toggle('is-on',enabled);event.currentTarget.setAttribute('aria-pressed',String(enabled));}
                    catch(error){spotifyVinylNotice(error.message||'Não foi possível mudar a ordem aleatória.');}
                });
                document.getElementById('source-progress').addEventListener('input',event=>{document.getElementById('source-position').textContent=formatAudioTime(Number(event.target.value));});
                document.getElementById('source-progress').addEventListener('change',event=>{seek(Number(event.target.value));event.target.blur();});
                document.getElementById('source-rewind').addEventListener('click',()=>seek(SpotifyCoverflow.getPlaybackState().position-10));
                document.getElementById('source-forward').addEventListener('click',()=>seek(SpotifyCoverflow.getPlaybackState().position+10));
                document.getElementById('source-repeat').addEventListener('click',async event=>{
                    const enabled=event.currentTarget.getAttribute('aria-pressed')!=='true';
                    try{await SpotifyCoverflow.setTrackRepeat(enabled);event.currentTarget.classList.toggle('is-on',enabled);event.currentTarget.setAttribute('aria-pressed',String(enabled));}
                    catch(error){spotifyVinylNotice(error.message||'Não foi possível mudar a repetição.');}
                });
                return;
            }
            document.getElementById('source-progress').addEventListener('input',event=>seekSource(dev,Number(event.target.value)));
            document.getElementById('source-rewind').addEventListener('click',()=>seekSource(dev,sourcePosition(dev)-10));
            document.getElementById('source-forward').addEventListener('click',()=>seekSource(dev,sourcePosition(dev)+10));
            document.getElementById('source-repeat').addEventListener('click',event=>{
                stopFilePlayback(dev);
                dev.state.repeat=!dev.state.repeat;
                startFilePlayback(dev);
                event.currentTarget.classList.toggle('is-on',dev.state.repeat);
                event.currentTarget.setAttribute('aria-pressed',String(dev.state.repeat));
            });
        }
        const RECEIVER_INPUTS=[['line1','LINHA 1'],['line2','LINHA 2'],['line3','LINHA 3'],['phono','PHONO'],['fm','FM']];
        function receiverConnectionsMarkup(type){
            const pair=(io,node,format,signal)=>`<div class="receiver-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${node==='in'?'Linha 1':node==='line2'?'Linha 2':node==='line3'?'Linha 3':node==='phono'?'Phono':signal==='amplified'?'Saída para caixa passiva':'Saída de linha'} · ${ch}"></div>`).join('')}</div>`;
            const group=(name,ports)=>`<div class="receiver-connection"><span>${name}</span>${ports}</div>`;
            return `<div class="receiver-input-bank">${[['LINHA 1','in'],['LINHA 2','line2'],['LINHA 3','line3'],['PHONO','phono']].map(([name,node])=>group(name,pair('in',node,'rca',node==='phono'?'phono':'line'))).join('')}</div><div class="receiver-output-bank">${group('LINE OUT',pair('out',type==='receiver'?'out':'lineOut','rca','line'))}${group('SPEAKERS · L/R',pair('out',type==='receiver'?'spkOut':'out','wire','amplified'))}${group('SUB · MONO','<div class="port" data-type="rca" data-io="out" data-node="outSub" data-signal="line" data-role="lfe-out" title="Saída de linha mono para subwoofer"></div>')}${group('PHONES · P10','<div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída estéreo para fones P10"></div>')}</div>`;
        }
        function receiverSourceButtons(){return `<div class="receiver-source-buttons" role="group" aria-label="Fonte do receiver">${RECEIVER_INPUTS.map(([key,label])=>`<button type="button" data-receiver-input="${key}" aria-pressed="${key==='line1'}"><span>${label}</span></button>`).join('')}</div>`;}
        const RADIO_RECEIVERS=new Set(['receiver','powerAmp']);
        let receiverRadioNoiseBuffer=null;
        const FM_SCALE={min:87.5,max:108,step:.5};
        const fmScalePosition=frequency=>5+(frequency-FM_SCALE.min)/(FM_SCALE.max-FM_SCALE.min)*90;
        const snapFmStation=frequency=>Math.round(frequency/FM_SCALE.step)*FM_SCALE.step;
        const randomFmStation=()=>89+Math.floor(Math.random()*35)*FM_SCALE.step;

        function radioReception(frequency,station){
            const distance=Math.abs(frequency-station);
            return Math.exp(-((distance/.24)**2));
        }
        function setupReceiverRadio(dev){
            const ctx=appState.audio.context;
            Object.assign(dev.state,{receiverInput:'line1',radioOn:false,radioFrequency:88,radioStation:randomFmStation()});
            dev.radioMusic={};dev.radioLine={};dev.receiverInputGates=[];dev.receiverInputNodes=[];
            ['L','R'].forEach(ch=>{
                const target=dev.receiverRadioTargets[ch],line=dev.radioLine[ch]=ctx.createGain(),music=dev.radioMusic[ch]=ctx.createGain();
                dev.nodes['in'+ch].disconnect(target);line.connect(target);music.gain.value=0;music.connect(target);
                for(const [key] of RECEIVER_INPUTS.filter(([key])=>key!=='fm')){
                    const input=key==='line1'?dev.nodes['in'+ch]:(dev.nodes[key+ch]=ctx.createGain()),gate=ctx.createGain();
                    gate.gain.value=key==='line1'?1:0;dev.receiverInputGates.push({gate,key});dev.receiverInputNodes.push(gate);
                    if(key==='phono'){
                        const low=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),gain=ctx.createGain();
                        low.type='lowshelf';low.frequency.value=120;low.gain.value=9;high.type='highshelf';high.frequency.value=2122;high.gain.value=-9;gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        input.connect(low);low.connect(high);high.connect(gain);connectPhonoPlayback(dev,gain,gate);dev.receiverInputNodes.push(low,high,gain);
                    }else input.connect(gate);
                    gate.connect(line);
                }

            });
            if(dev.type==='powerAmp'){
                const sum=ctx.createGain();sum.gain.value=.5;const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=120;low.Q.value=.707;
                dev.nodes.outSub=ctx.createGain();dev.nodes.outPhone=ctx.createChannelMerger(2);dev.receiverInputNodes.push(sum,low);
                ['L','R'].forEach((ch,index)=>{const out=dev.nodes['lineOut'+ch]=ctx.createGain();out.gain.value=.74;dev.nodes['out'+ch].connect(out);out.connect(sum);out.connect(dev.nodes.outPhone,0,index);});
                sum.connect(low);low.connect(dev.nodes.outSub);
            }
            dev.selectReceiverInput=key=>{
                if(!RECEIVER_INPUTS.some(([value])=>value===key))return;
                dev.state.receiverInput=key;dev.state.radioOn=key==='fm';dev.syncRadio();updateCableFlows();scheduleProjectSave();
            };
            dev.el.querySelectorAll('[data-receiver-input]').forEach(button=>{button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',()=>{dev.selectReceiverInput(button.dataset.receiverInput);if(dev.state.radioOn)ctx.resume().then(()=>{if(appState.project.devices[dev.id]){dev.syncRadio();updateCableFlows();}}).catch(()=>{});});});
            dev.radioNoiseGain=ctx.createGain();dev.radioNoiseGain.gain.value=0;
            const filter=dev.radioNoiseFilter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=6500;
            filter.connect(dev.radioNoiseGain);['L','R'].forEach(ch=>dev.radioNoiseGain.connect(dev.receiverRadioTargets[ch]));
            dev.syncRadio=()=>{
                const on=!!dev.state.radioOn&&dev.powered&&ctx.state==='running',frequency=dev.state.radioFrequency,q=dev.audioBuffer?radioReception(frequency,dev.state.radioStation):0,t=ctx.currentTime;
                ['L','R'].forEach(ch=>{dev.radioLine[ch].gain.setTargetAtTime(dev.state.radioOn?0:1,t,.025);dev.radioMusic[ch].gain.setTargetAtTime(on?q*.7:0,t,.03);});
                dev.receiverInputGates.forEach(({gate,key})=>gate.gain.setTargetAtTime(key===dev.state.receiverInput?1:0,t,.025));
                dev.el.querySelectorAll('[data-receiver-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.receiverInput===dev.state.receiverInput)));
                if(appState.interface.selectedDeviceId===dev.id)document.querySelectorAll('[data-receiver-inspector-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.receiverInspectorInput===dev.state.receiverInput)));
                dev.radioNoiseGain.gain.setTargetAtTime(on?.055*(1-q)**1.4:0,t,.025);
                if(on&&!dev.radioNoiseSource){
                    if(!receiverRadioNoiseBuffer){receiverRadioNoiseBuffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);const data=receiverRadioNoiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
                    const noise=dev.radioNoiseSource=ctx.createBufferSource();noise.buffer=receiverRadioNoiseBuffer;noise.loop=true;noise.connect(filter);noise.start();
                }
                if(on&&dev.audioBuffer&&!dev.radioVoice){
                    const voice=ctx.createBufferSource(),split=ctx.createChannelSplitter(2);voice.buffer=dev.audioBuffer;voice.loop=true;voice.connect(split);split.connect(dev.radioMusic.L,0);split.connect(dev.radioMusic.R,dev.audioBuffer.numberOfChannels>1?1:0);voice.start();dev.radioVoice={voice,split};
                }
                if(!on)stopReceiverRadioVoices(dev);
                const text=dev.state.radioOn?`FM · ${frequency.toFixed(1)} MHz`:'STEREO · '+(RECEIVER_INPUTS.find(([key])=>key===dev.state.receiverInput)?.[1]||'LINHA 1');
                const display=dev.el.querySelector('.receiver-radio b,.poweramp-screen strong');if(display)display.textContent=text;
                const needle=dev.el.querySelector('.radio-tuning-needle');if(needle)needle.style.left=fmScalePosition(frequency)+'%';
                const knob=dev.el.querySelector('[data-radio-knob]');
                if(knob){knob.style.setProperty('--radio-angle',(-135+(frequency-87.5)/20.5*270)+'deg');knob.setAttribute('aria-valuenow',String(frequency));knob.setAttribute('aria-valuetext',frequency.toFixed(1)+' MHz');}
                dev.el.classList.toggle('receiver-fm-active',!!dev.state.radioOn);
                dev.el.classList.toggle('receiver-fm-tuned',!!dev.state.radioOn&&q>.9);
                updateReceiverRadioDisplay(dev,performance.now());
                if(appState.interface.selectedDeviceId===dev.id){
                    const output=document.getElementById('radio-frequency-value'),slider=document.getElementById('radio-frequency'),status=document.getElementById('radio-reception'),toggle=document.getElementById('radio-input-toggle');
                    if(output)output.textContent=frequency.toFixed(1)+' MHz';if(slider)slider.value=frequency;
                    if(status)status.textContent=!dev.state.radioOn?'Selecione FM para ouvir o rádio':!dev.audioBuffer?'Carregue um MP3 para criar uma estação':q>.9?'ESTÉREO · SINTONIZADO':q>.1?'Sinal fraco · ajuste a sintonia':'Buscando estação…';
                    if(toggle){toggle.setAttribute('aria-pressed',String(dev.state.radioOn));}
                }
            };
            dev.tuneRadio=value=>{dev.state.radioFrequency=Math.round(Math.max(87.5,Math.min(108,Number(value)||87.5))*10)/10;dev.syncRadio();scheduleProjectSave();};
            const tuningKnob=dev.el.querySelector('[data-radio-knob]');
            const activateTuner=()=>{if(!dev.state.radioOn)dev.selectReceiverInput('fm');ctx.resume().then(()=>{if(appState.project.devices[dev.id]){dev.syncRadio();updateCableFlows();}}).catch(()=>{});};
            Hardware.bindKnob(tuningKnob,{get:()=>dev.state.radioFrequency,set:dev.tuneRadio,min:87.5,max:108,step:.1,activate:activateTuner,format:value=>value.toFixed(1)+' MHz'});
            const display=dev.el.querySelector('.receiver-radio,.poweramp-screen');
            if(display?.classList.contains('receiver-radio')){
                // The ruler and needle share one frequency-to-position conversion.
                const scale=display.querySelector('i');scale.className='fm-calibrated-scale';scale.replaceChildren();
                for(let frequency=FM_SCALE.min;frequency<=FM_SCALE.max;frequency+=FM_SCALE.step){
                    const tick=document.createElement('em');tick.className='fm-scale-tick';tick.style.left=fmScalePosition(frequency)+'%';
                    if(Number.isInteger(frequency))tick.classList.add('is-major');
                    scale.appendChild(tick);
                }
                const labels=display.querySelector('span');labels.className='fm-calibrated-labels';labels.replaceChildren();
                for(const frequency of [88,92,96,100,104,108]){const label=document.createElement('small');label.textContent=String(frequency);label.style.left=fmScalePosition(frequency)+'%';labels.appendChild(label);}
                const needle=document.createElement('em');needle.className='radio-tuning-needle';needle.setAttribute('aria-hidden','true');display.appendChild(needle);
            }
            if(display){
                display.tabIndex=0;display.setAttribute('role','group');display.setAttribute('aria-label','Sintonia FM: arraste horizontalmente ou use as setas');display.title='Sintonia FM · arraste horizontalmente ou use as setas';
                display.addEventListener('pointerdown',e=>{if(e.button!==0||!dev.state.radioOn)return;e.preventDefault();e.stopPropagation();display.setPointerCapture(e.pointerId);const x=e.clientX,frequency=dev.state.radioFrequency;
                    const move=event=>dev.tuneRadio(frequency+(event.clientX-x)/12/view.zoom);
                    const end=()=>{display.removeEventListener('pointermove',move);display.removeEventListener('pointerup',end);display.removeEventListener('pointercancel',end);display.removeEventListener('lostpointercapture',end);};
                    display.addEventListener('pointermove',move);display.addEventListener('pointerup',end);display.addEventListener('pointercancel',end);display.addEventListener('lostpointercapture',end);
                });
                display.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();dev.tuneRadio(dev.state.radioFrequency+(e.key==='ArrowRight'?.1:-.1));});
            }
            dev.syncRadio();
        }
        function updateReceiverRadioDisplay(dev,now){
            if(dev.type!=='powerAmp')return;
            const screen=dev.el.querySelector('.receiver-fm-animation');if(!screen)return;
            const on=dev.powered&&dev.state.radioOn,q=on&&dev.audioBuffer?radioReception(dev.state.radioFrequency,dev.state.radioStation):0;
            screen.style.opacity=on?'1':'.2';
            const points=[];
            for(let x=0;x<=180;x+=4){
                const frequency=dev.state.radioFrequency+(x/180-.5)*1.8,signal=on&&dev.audioBuffer?radioReception(frequency,dev.state.radioStation):0;
                const jitter=on&&!matchMedia('(prefers-reduced-motion: reduce)').matches?(Math.sin(x*1.73+now*.013)+Math.sin(x*.57-now*.009))*1.3*(1-signal):0;
                points.push(`${x?'L':'M'}${x} ${(21-signal*17-jitter).toFixed(2)}`);
            }
            screen.querySelector('[data-fm-spectrum]').setAttribute('d',points.join(' '));screen.querySelector('[data-fm-strength]').setAttribute('width',String(q*178));
        }
        let lastReceiverRadioFrame=0;
        function updateReceiverRadioDisplays(now){
            if(now-lastReceiverRadioFrame<100)return;lastReceiverRadioFrame=now;
            Object.values(appState.project.devices).filter(dev=>dev.type==='powerAmp').forEach(dev=>updateReceiverRadioDisplay(dev,now));
        }
        function stopReceiverRadioVoices(dev){
            if(dev.radioVoice){dev.radioVoice.voice.stop();dev.radioVoice.voice.disconnect();dev.radioVoice.split.disconnect();dev.radioVoice=null;}
            if(dev.radioNoiseSource){dev.radioNoiseSource.stop();dev.radioNoiseSource.disconnect();dev.radioNoiseSource=null;}
        }
        function radioInspectorHtml(dev){
            return `<section class="flex flex-col gap-3 border-t border-gray-700 pt-4"><strong class="text-sm text-gray-200">Fonte do receiver</strong><div class="grid grid-cols-2 gap-2">${RECEIVER_INPUTS.map(([key,label])=>`<button type="button" class="tt-insp-btn" data-receiver-inspector-input="${key}" aria-pressed="${dev.state.receiverInput===key}">${label}</button>`).join('')}</div><strong class="text-sm text-gray-200">Rádio FM</strong><button type="button" id="radio-input-toggle" class="tt-insp-btn" aria-pressed="${!!dev.state.radioOn}">RÁDIO FM</button><button type="button" id="radio-load" class="tt-insp-btn">CARREGAR MP3 COMO ESTAÇÃO</button><input id="radio-file" type="file" accept="audio/mpeg,.mp3" hidden><p id="radio-file-name" class="text-xs text-gray-400 break-words"></p><div class="flex items-center justify-between gap-2"><button type="button" class="tt-insp-btn" data-radio-step="-1" aria-label="Diminuir frequência">−</button><output id="radio-frequency-value" class="text-sm font-mono">${dev.state.radioFrequency.toFixed(1)} MHz</output><button type="button" class="tt-insp-btn" data-radio-step="1" aria-label="Aumentar frequência">+</button></div><input id="radio-frequency" type="range" min="87.5" max="108" step="0.1" value="${dev.state.radioFrequency}" aria-label="Sintonia FM"><p id="radio-reception" class="text-xs text-gray-400" role="status"></p><p class="text-xs text-gray-500">Varra a faixa com o seletor ou arraste o visor do receiver até o chiado desaparecer. A faixa toca em repetição na estação encontrada.</p></section>`;
        }
        function bindRadioInspector(dev){
            const filename=document.getElementById('radio-file-name');filename.textContent=dev.fileMessage||dev.fileName||'Nenhuma estação carregada';
            const activate=async()=>{try{await appState.audio.context.resume();if(appState.project.devices[dev.id]){dev.syncRadio();updateCableFlows();}}catch{if(appState.interface.selectedDeviceId===dev.id)filename.textContent='Não foi possível ativar o áudio. Tente novamente.';}};
            document.getElementById('radio-input-toggle').onclick=()=>{dev.selectReceiverInput(dev.state.radioOn?'line1':'fm');activate();scheduleProjectSave();updateCableFlows();};
            const fileInput=document.getElementById('radio-file');document.getElementById('radio-load').onclick=()=>fileInput.click();
            fileInput.onchange=async()=>{
                const file=fileInput.files[0];if(!file)return;const token=dev.fileLoadToken=(dev.fileLoadToken||0)+1;filename.textContent='Carregando estação…';
                try{
                    await appState.audio.context.resume();const buffer=await appState.audio.context.decodeAudioData(await file.arrayBuffer());if(!appState.project.devices[dev.id]||dev.fileLoadToken!==token)return;
                    stopReceiverRadioVoices(dev);dev.audioBuffer=buffer;dev.mediaBlob=file;dev.mediaKey='radio_'+Date.now()+'_'+Math.random().toString(36).slice(2);dev.fileName=file.name;dev.fileMessage='';dev.state.receiverInput='fm';dev.state.radioStation=randomFmStation();dev.state.radioOn=true;
                    if(Math.abs(dev.state.radioFrequency-dev.state.radioStation)<1)dev.state.radioFrequency=87.5;dev.syncRadio();updateCableFlows();scheduleProjectSave();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);
                }catch{if(dev.fileLoadToken!==token||!appState.project.devices[dev.id])return;dev.fileMessage='Não foi possível carregar o MP3.';if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);}
            };
            document.getElementById('radio-frequency').oninput=e=>{dev.tuneRadio(e.target.value);activate();};
            document.querySelectorAll('[data-radio-step]').forEach(button=>button.onclick=()=>{dev.tuneRadio(dev.state.radioFrequency+Number(button.dataset.radioStep)*.1);activate();});
            document.querySelectorAll('[data-receiver-inspector-input]').forEach(button=>button.onclick=()=>{dev.selectReceiverInput(button.dataset.receiverInspectorInput);activate();});
            dev.syncRadio();
        }

        let audioMeterObserver=null;
        const audioMeterDevices=new WeakMap();
        function setupAudioMeters(dev) {
            const context=appState.audio.context, nodes=[], taps=[], analyzers=[];
            const silent=context.createGain();silent.gain.value=0;silent.connect(context.destination);
            const channels=[[],[]];
            const analyze=(node,channel)=>{
                const analyzer=context.createAnalyser();analyzer.fftSize=256;
                node.connect(analyzer);analyzer.connect(silent);taps.push([node,analyzer]);nodes.push(analyzer);analyzers.push(analyzer);
                channels[channel].push({analyzer,data:new Float32Array(analyzer.fftSize)});
            };
            // Receiver meters measure left and right outputs directly. Auxiliary
            // mono/sub and headphone outputs must not be folded into either reading.
            const ports=RADIO_RECEIVERS.has(dev.type)?[]:[...dev.el.querySelectorAll('.port[data-io="out"]')].filter(port=>!POWER_OUTPUT_TYPES.has(dev.type)||port.dataset.type==='wire');
            if(RADIO_RECEIVERS.has(dev.type)){
                analyze(dev.nodes.spkOutL||dev.nodes.outL,0);analyze(dev.nodes.spkOutR||dev.nodes.outR,1);
            }
            const seen=new Set();
            ports.forEach(port=>{
                const node=dev.nodes[port.dataset.node];if(!node || seen.has(node))return;seen.add(node);
                if(port.dataset.channel) analyze(node,port.dataset.channel==='L'?0:1);
                else {const split=context.createChannelSplitter(2);node.connect(split);taps.push([node,split]);nodes.push(split);analyzeChannel(split);}
            });
            function analyzeChannel(node){
                [0,1].forEach(channel=>{const analyzer=context.createAnalyser();analyzer.fftSize=256;node.connect(analyzer,channel);analyzer.connect(silent);taps.push([node,analyzer,channel]);nodes.push(analyzer);analyzers.push(analyzer);channels[channel].push({analyzer,data:new Float32Array(analyzer.fftSize)});});
            }
            if(!ports.length&&!RADIO_RECEIVERS.has(dev.type)){const node=dev.listeningGain||dev.outputPan||dev.analyzer;if(node){const split=context.createChannelSplitter(2);node.connect(split);taps.push([node,split]);nodes.push(split);analyzeChannel(split);}}
            if(!channels.some(list=>list.length)){silent.disconnect();return;}
            dev.meters={channels,clipUntil:0,levels:[0,0],peaks:[0,0],visible:true};
            dev.setMeterVisibility=visible=>{
                if(dev.meters.visible===visible)return;dev.meters.visible=visible;
                if(visible){taps.forEach(([node,target,output])=>output==null?node.connect(target):node.connect(target,output));analyzers.forEach(analyzer=>analyzer.connect(silent));}
                else{taps.forEach(([node,target])=>{try{node.disconnect(target)}catch{}});analyzers.forEach(analyzer=>{try{analyzer.disconnect(silent)}catch{}});}
            };
            if(typeof IntersectionObserver==='function'){
                audioMeterObserver||=new IntersectionObserver(entries=>entries.forEach(entry=>{const meterDev=audioMeterDevices.get(entry.target);meterDev?.setMeterVisibility?.(entry.isIntersecting&&entry.intersectionRatio>0);}),{threshold:0});
                audioMeterDevices.set(dev.el,dev);audioMeterObserver.observe(dev.el);dev.disposeMeters=()=>{audioMeterObserver?.unobserve(dev.el);audioMeterDevices.delete(dev.el);taps.forEach(([node,target])=>{try{node.disconnect(target)}catch{}});nodes.forEach(node=>node.disconnect());silent.disconnect();};
            }else{dev.setMeterVisibility(true);dev.disposeMeters=()=>{taps.forEach(([node,target])=>{try{node.disconnect(target)}catch{}});nodes.forEach(node=>node.disconnect());silent.disconnect();};}
        }
        // Audio controls update their graphs in target handlers before this bubbles.
        inspectorContent.addEventListener('input',()=>updateCableFlows());
        window.addEventListener('pointerup',event=>{
            if(event.target instanceof Element&&event.target.closest('.integrated-knob,.receiver-dial,.bias-gain-knob,.amp4-knob,[data-pre-knob]'))updateCableFlows();
        });
        const audioDb=value=>value>0.000001?20*Math.log10(value):-Infinity;
        const audioDbText=value=>Number.isFinite(audioDb(value))?`${audioDb(value).toFixed(1)} dBFS`:'−∞ dBFS';
        let lastAudioPanelUpdate=0;
        function updateRealtimePanels(now,force=false){
            if(!force&&now-lastAudioPanelUpdate<80)return;lastAudioPanelUpdate=now;
            drawSpectrum();
            Object.values(appState.project.devices).forEach(dev=>{
                refreshCdDisplay(dev);
                Hardware.updateAccents(dev);
                const meter=dev.meters;if(!meter||!meter.visible)return;
                [0,1].forEach(channel=>{
                    let peak=0,rms=0;
                    meter.channels[channel].forEach(tap=>{
                        tap.analyzer.getFloatTimeDomainData(tap.data);let energy=0,localPeak=0;
                        for(const sample of tap.data){localPeak=Math.max(localPeak,Math.abs(sample));energy+=sample*sample;}
                        peak=Math.max(peak,localPeak);rms=Math.max(rms,Math.sqrt(energy/tap.data.length));
                    });
                    if(appState.audio.context.state!=='running'){peak=0;rms=0;}
                    meter.levels[channel]=rms;meter.peaks[channel]=peak;
                    const headphoneClip=dev.outputCircuits?.some(circuit=>circuit.paths.some(path=>path.clipping));
                    const electricalClip=POWER_OUTPUT_TYPES.has(dev.type)?dev.electricalStages?.some(stage=>stage.clipping)||headphoneClip:headphoneClip||peak>=.999;
                    if(electricalClip)meter.clipUntil=now+1800;
                });
                if(dev.type==='powerAmp'){
                    meter.displayLevels||=[0,0];
                    dev.el.querySelectorAll('[data-receiver-level]').forEach(bar=>{
                        const channel=Number(bar.dataset.receiverLevel),value=dev.powered?meter.levels[channel]||0:0;
                        const target=Math.max(0,Math.min(1,(audioDb(value)+60)/60)),previous=meter.displayLevels[channel];
                        const amount=target>previous?target:previous+(target-previous)*.45;
                        meter.displayLevels[channel]=amount;bar.style.width=(amount*100).toFixed(2)+'%';
                        const readout=bar.closest('.poweramp-meter-channel');readout.setAttribute('aria-label',`${channel?'CH B · direito':'CH A · esquerdo'}: ${audioDbText(value)}`);readout.title=audioDbText(value);
                    });
                }
                updateStereoPowerMeters(dev);
                dev.el.querySelectorAll('.receiver-vu i').forEach((needle,index)=>{
                    const level=Math.max(0,Math.min(1,(audioDb(meter.levels[index]||0)+48)/48));
                    const calibration=deviceGaugeCalibrationAngle(dev,now,-45,30);
                    needle.style.transform=`rotate(${calibration??dampedNeedle(needle,-45+level*75,now,-45)}deg)`;
                });
            });
            readElectricalStages();
            updateReferenceHardware(now);
            Object.values(appState.project.devices).forEach(dev=>dev.refreshStreamDisplay?.());
            Object.values(appState.project.devices).filter(isPassiveLoad).forEach(applySpeakerLoadDynamics);
            const selected=appState.project.devices[appState.interface.selectedDeviceId];
            if(selected?.spotifyVinyl&&document.getElementById('source-track-title')){
                const playback=SpotifyCoverflow.getPlaybackState(),active=playback.context===selected.spotifyVinyl.uri||spotifyPlayingTurntable===selected.id;
                const ready=playback.connected&&active&&playback.duration>0,position=ready?playback.position:0,duration=ready?playback.duration:0;
                const progress=document.getElementById('source-progress');progress.max=Math.max(.1,duration);progress.disabled=!ready;
                if(document.activeElement!==progress)progress.value=position;
                if(document.activeElement!==progress)document.getElementById('source-position').textContent=formatAudioTime(position);
                document.getElementById('source-duration').textContent=formatAudioTime(duration);
                document.getElementById('source-track-title').textContent=ready?playback.track:'Aguardando faixa do Spotify';
                for(const id of ['source-rewind','source-forward','source-repeat'])document.getElementById(id).disabled=!ready;
                document.getElementById('source-repeat').classList.toggle('is-on',playback.repeat);
                document.getElementById('source-repeat').setAttribute('aria-pressed',String(playback.repeat));
                const playButton=document.getElementById('source-play-pause');
                playButton.classList.toggle('is-playing',!!selected.state.playing);
                playButton.disabled=!selected.powered||!!(spotifyPlayingTurntable&&spotifyPlayingTurntable!==selected.id);
                playButton.title=selected.state.playing?'Pausar':'Reproduzir';
                playButton.setAttribute('aria-label',playButton.title);
                const shuffleButton=document.getElementById('source-shuffle');
                shuffleButton.disabled=!playback.connected;
                shuffleButton.classList.toggle('is-on',playback.shuffle);
                shuffleButton.setAttribute('aria-pressed',String(playback.shuffle));
                updateSpotifyTrackSelection(selected);
            }else if(selected?.audioBuffer){const progress=document.getElementById('source-progress'),label=document.getElementById('source-position');const position=sourcePosition(selected);if(progress&&document.activeElement!==progress)progress.value=position;if(label)label.textContent=formatAudioTime(position);}
        }

