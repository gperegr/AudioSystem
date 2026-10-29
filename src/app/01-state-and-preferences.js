/* Application state, preferences, dialogs, and headphone calibration. */

        const DEFAULT_BACKDROP='loftIllustrated';
        const DEFAULT_ROOM_SETTINGS={preset:'small',intensity:5};
        const DEFAULT_UI_SOUND_VOLUME=.5;
        const appStateStore=AudioSystemApplicationState.createStore({
            audio:{environment:{...DEFAULT_ROOM_SETTINGS}},
            preferences:{uiSoundVolume:DEFAULT_UI_SOUND_VOLUME}
        });
        const appState=appStateStore.domains;

        const APP_PREFERENCES_KEY='audio-system-interface-preferences';
        function readAppPreferences(){try{const value=JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}}
        const savedAppPreferences=readAppPreferences();
        appStateStore.actions.setPreference('connectionGuidanceEnabled',savedAppPreferences.connectionGuidanceEnabled!==false);
        appStateStore.actions.setPreference('roomParticleAmount',Number.isFinite(savedAppPreferences.roomParticleAmount)?Math.max(0,Math.min(100,savedAppPreferences.roomParticleAmount/(savedAppPreferences.particleScaleVersion===2?1:2))):25);
        if(Number.isFinite(savedAppPreferences.roomParticleAmount)&&savedAppPreferences.particleScaleVersion!==2){
            try{localStorage.setItem(APP_PREFERENCES_KEY,JSON.stringify({...savedAppPreferences,roomParticleAmount:appState.preferences.roomParticleAmount,particleScaleVersion:2}));}catch{}
        }
        appStateStore.actions.setPreference('developerModeEnabled',savedAppPreferences.developerMode===true);
        appStateStore.actions.setPreference('headphonePromptSeen',savedAppPreferences.headphonePromptSeen===true);
        appStateStore.actions.setListeningPreferences({
            outputLevel:Number.isFinite(savedAppPreferences.listeningOutputLevel)?Math.max(.5,Math.min(1.2,savedAppPreferences.listeningOutputLevel)):1,
            bass:Number.isFinite(savedAppPreferences.listeningBass)?Math.max(-6,Math.min(6,savedAppPreferences.listeningBass)):0,
            treble:Number.isFinite(savedAppPreferences.listeningTreble)?Math.max(-6,Math.min(6,savedAppPreferences.listeningTreble)):0
        });
        let appPreferencesSaveTimer=0;
        function scheduleAppPreferencesSave(){
            clearTimeout(appPreferencesSaveTimer);
            appPreferencesSaveTimer=setTimeout(()=>{
                if(!canvas.clientWidth||!canvas.clientHeight)return;
                const focusX=(canvas.clientWidth/2-view.x)/view.zoom,focusY=(canvas.clientHeight/2-view.y)/view.zoom;
                try{localStorage.setItem(APP_PREFERENCES_KEY,JSON.stringify({theme:appState.canvas.theme,grid:appState.canvas.grid,backdrop:appState.canvas.backdrop,time:appState.canvas.time,connectionGuidanceEnabled:appState.preferences.connectionGuidanceEnabled,roomParticleAmount:appState.preferences.roomParticleAmount,particleScaleVersion:2,developerMode:appState.preferences.developerModeEnabled,headphonePromptSeen:appState.preferences.headphonePromptSeen,inspectorPinned:sidebarPinned.properties,signalHistoryExpanded,listeningOutputLevel:appState.preferences.listening.outputLevel,listeningBass:appState.preferences.listening.bass,listeningTreble:appState.preferences.listening.treble,zoom:view.zoom,focusX,focusY}));}catch{}
            },450);
        }
        const appDialog=document.getElementById('app-confirm-dialog');
        function showAppDialog({title='Aviso',message='',acceptLabel='OK',cancelLabel='Cancelar',requireChoice=false}={}){
            return new Promise(resolve=>{
                const titleNode=appDialog.querySelector('#app-confirm-title'),messageNode=appDialog.querySelector('#app-confirm-message'),cancel=appDialog.querySelector('[data-dialog-cancel]'),accept=appDialog.querySelector('[data-dialog-accept]');
                titleNode.textContent=title;messageNode.textContent=message;accept.textContent=acceptLabel;cancel.textContent=cancelLabel;cancel.hidden=!requireChoice;accept.classList.toggle('is-danger',requireChoice&&/risco|dan/i.test(title));
                let settled=false;
                const finish=value=>{if(settled)return;settled=true;if(appDialog.open)appDialog.close();resolve(value);};
                accept.onclick=()=>finish(true);cancel.onclick=()=>finish(false);
                appDialog.oncancel=event=>{event.preventDefault();finish(false);};
                appDialog.onclose=()=>{if(!settled)finish(false);};
                appDialog.showModal();accept.focus();
            });
        }
        const headphoneCalibrationDialog=document.getElementById('headphone-calibration-dialog');
        const headphoneCalibrationSteps=[
            {title:'Som forte',message:'Toque e ajuste até soar forte e confortável.'},
            {title:'Detalhe sutil',message:'Sem mexer no volume do fone, o detalhe deve ser audível.'},
            {title:'Esquerda e direita',message:'Os dois lados devem soar equilibrados.'},
            {title:'Graves',message:'Ajuste até sentir o corpo do som, sem abafar os detalhes.'},
            {title:'Agudos',message:'Ajuste até ouvir os detalhes, sem aspereza.'},
            {title:'Sons de interação',message:'Ajuste o slider e toque para ouvir. Pare quando ficar confortável.'}
        ];
        const headphoneCalibrationIcons=[
            '<path d="M4 16v-4a8 8 0 0 1 16 0v4M4 14h4v7H6a2 2 0 0 1-2-2v-5Zm12 0h4v5a2 2 0 0 1-2 2h-2v-7Z"/>',
            '<path d="M4 10h4l5-4v12l-5-4H4zM16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>',
            '<path d="M3 12h4m3-4v8m4-11v14m4-8v2m3-1h1"/>',
            '<path d="M4 7h6v10H4zM14 7h6v10h-6zM7 4v3m10-3v3M7 17v3m10-3v3"/>',
            '<path d="M5 7h14M5 12h14M5 17h14"/><circle cx="9" cy="7" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="11" cy="17" r="2"/>',
            '<path d="M3 14c2-7 4-7 6 0s4 7 6 0 4-7 6 0"/>',
            '<path d="M3 14c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/>',
            '<path d="m4 12 5 5L20 6"/>'
        ];
        const headphoneAnswerLabels=[['Baixo','Bom','Alto'],['Não ouvi','Ouvi','Alto']];
        const headphoneAnswerIcons=['<path d="M4 10h4l5-4v12l-5-4H4zM16 10c1 1 1 3 0 4"/>','<path d="m4 12 5 5L20 6"/>','<path d="M4 10h4l5-4v12l-5-4H4zM16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>'];
        let headphoneCalibrationStep=-1,headphoneCalibrationVoices=[],headphoneCalibrationTimers=[],headphoneCalibrationPreviewTimer=0,lastHeadphoneCalibrationPreview=0,headphoneCalibrationLooping=false,headphoneCalibrationAnswers={},headphoneCalibrationBases={};
        function setHeadphoneCalibrationPlayLabel(looping){
            const play=document.getElementById('headphone-calibration-play');
            play.querySelector('span').textContent=looping?'Parar':'Tocar';
            play.querySelector('path').setAttribute('d',looping?'M7 7h10v10H7z':'m8 5 11 7-11 7Z');
            play.setAttribute('aria-label',looping?'Parar som repetido':'Tocar exemplo de '+(headphoneCalibrationSteps[headphoneCalibrationStep]?.title||'escuta').toLowerCase());
        }
        function stopHeadphoneCalibrationSound(){
            headphoneCalibrationTimers.splice(0).forEach(clearTimeout);
            clearTimeout(headphoneCalibrationPreviewTimer);headphoneCalibrationPreviewTimer=0;
            headphoneCalibrationLooping=false;setHeadphoneCalibrationPlayLabel(false);
            if(!appState.audio.context)return;
            const now=appState.audio.context.currentTime;
            headphoneCalibrationVoices.splice(0).forEach(voice=>{try{voice.stop(now+.02);}catch{}});
        }
        function renderHeadphoneCalibration(){
            const step=headphoneCalibrationSteps[headphoneCalibrationStep],done=headphoneCalibrationStep===headphoneCalibrationSteps.length;
            if(headphoneCalibrationStep<2&&step&&!headphoneCalibrationBases[headphoneCalibrationStep])headphoneCalibrationBases[headphoneCalibrationStep]={program:appState.preferences.listening.outputLevel};
            document.getElementById('headphone-calibration-progress').textContent=step?`${headphoneCalibrationStep+1}/${headphoneCalibrationSteps.length}`:'';
            document.getElementById('headphone-calibration-icon').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${headphoneCalibrationIcons[done?7:headphoneCalibrationStep<0?0:[1,2,3,5,6,4][headphoneCalibrationStep]]}</svg>`;
            document.getElementById('headphone-calibration-title').textContent=step?.title|| (done?'Pronto para ouvir':'Ajuste a escuta');
            document.getElementById('headphone-calibration-message').textContent=step?.message|| (done?'Na primeira música, confira o volume novamente.':'Fones ajudam a ouvir nuances. Pause a música e comece com volume baixo.');
            document.getElementById('headphone-calibration-play').hidden=!step;
            const answerGroup=document.getElementById('headphone-calibration-answers'),labels=headphoneAnswerLabels[headphoneCalibrationStep]||[];
            answerGroup.hidden=!labels.length;
            answerGroup.querySelectorAll('button').forEach((button,index)=>{button.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${headphoneAnswerIcons[index]}</svg><span>${labels[index]||''}</span>`;button.classList.toggle('is-selected',headphoneCalibrationAnswers[headphoneCalibrationStep]===button.dataset.calibrationAnswer);button.setAttribute('aria-pressed',String(headphoneCalibrationAnswers[headphoneCalibrationStep]===button.dataset.calibrationAnswer));});
            document.getElementById('headphone-calibration-ui-volume').hidden=headphoneCalibrationStep!==5;
            const toneControl=document.getElementById('headphone-calibration-tone'),toneKind=headphoneCalibrationStep===3?'bass':headphoneCalibrationStep===4?'treble':null;
            toneControl.hidden=!toneKind;
            if(toneKind){const value=appState.preferences.listening[toneKind];document.getElementById('headphone-calibration-tone-label').textContent=toneKind==='bass'?'Graves':'Agudos';document.getElementById('headphone-calibration-tone-value').textContent=`${value>0?'+':''}${value} dB`;document.getElementById('headphone-calibration-tone-slider').value=value;document.getElementById('headphone-calibration-tone-slider').setAttribute('aria-label',toneKind==='bass'?'Graves da escuta':'Agudos da escuta');}
            document.getElementById('headphone-calibration-ui-slider').value=Math.round(appState.preferences.uiSoundVolume*100);
            document.getElementById('headphone-calibration-ui-value').textContent=appState.preferences.uiSoundVolume?`${Math.round(appState.preferences.uiSoundVolume*100)}%`:'desligados';
            document.getElementById('headphone-calibration-back').hidden=headphoneCalibrationStep<0;
            document.getElementById('headphone-calibration-skip').hidden=done;
            const next=document.getElementById('headphone-calibration-next'),nextLabel=done?'Concluir':step?'Próxima etapa':'Iniciar ajuste';
            next.setAttribute('aria-label',nextLabel);next.title=nextLabel;
            next.querySelector('path').setAttribute('d',done?'m4 12 5 5L20 6':'M5 12h14m-6-6 6 6-6 6');
            setHeadphoneCalibrationPlayLabel(headphoneCalibrationLooping);
            document.getElementById('headphone-calibration-status').textContent='';
        }
        let headphoneCalibrationTransitioning=false,headphoneCalibrationTransitionCleanup=null;
        function transitionHeadphoneCalibration(direction,update){
            if(headphoneCalibrationTransitioning)return;
            const windowElement=headphoneCalibrationDialog.querySelector('.headphone-calibration-stage-window');
            const stage=document.getElementById('headphone-calibration-stage');
            if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){update();return;}
            headphoneCalibrationTransitioning=true;
            const ghost=stage.cloneNode(true);
            ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
            ghost.removeAttribute('role');ghost.setAttribute('aria-hidden','true');ghost.inert=true;
            ghost.classList.add('headphone-calibration-stage-ghost');
            windowElement.append(ghost);
            update();
            const distance=Math.min(100,Math.max(48,windowElement.clientWidth*.18));
            const options={duration:390,easing:'cubic-bezier(.22,.72,.18,1)',fill:'both'};
            const animations=[
                ghost.animate([{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*distance}px)`,opacity:0}],options),
                stage.animate([{transform:`translateX(${direction*distance}px)`,opacity:0},{transform:'translateX(0)',opacity:1}],options)
            ];
            let cleaned=false;
            const cleanup=()=>{if(cleaned)return;cleaned=true;animations.forEach(animation=>animation.cancel());ghost.remove();headphoneCalibrationTransitioning=false;headphoneCalibrationTransitionCleanup=null;};
            headphoneCalibrationTransitionCleanup=cleanup;
            Promise.allSettled(animations.map(animation=>animation.finished)).then(cleanup);
        }
        async function playHeadphoneCalibrationSound(loopReplay=false,playOnce=false){
            const step=headphoneCalibrationStep,status=document.getElementById('headphone-calibration-status');
            if(step<0||step>=headphoneCalibrationSteps.length)return;
            if([0,1,3,4].includes(step)&&headphoneCalibrationLooping&&!loopReplay){stopHeadphoneCalibrationSound();status.textContent='Reprodução parada.';return;}
            try{
                initAudio();const context=appState.audio.context;
                if(context.state!=='running')await context.resume();
                if(!headphoneCalibrationDialog.open||step!==headphoneCalibrationStep||context.state!=='running')return;
                stopHeadphoneCalibrationSound();
                if(step===5){
                    if(!appState.preferences.uiSoundVolume){status.textContent='Sons de interação desligados. Aumente o controle para ouvi-los.';return;}
                    playUiSound('receiverClick');
                    headphoneCalibrationTimers.push(setTimeout(()=>{if(headphoneCalibrationDialog.open&&headphoneCalibrationStep===5)playUiSound('connect');},400));
                    status.textContent='Tocando um clique e uma conexão da interface.';return;
                }
                const start=context.currentTime+.04;
                const tone=(frequency,delay,level,pan=0)=>{
                    const oscillator=context.createOscillator(),envelope=context.createGain(),stereo=context.createStereoPanner(),at=start+delay,duration=.55;
                    oscillator.type='sine';oscillator.frequency.value=frequency;stereo.pan.value=pan;
                    envelope.gain.setValueAtTime(0,at);envelope.gain.linearRampToValueAtTime(level,at+.06);envelope.gain.setValueAtTime(level,at+duration-.12);envelope.gain.linearRampToValueAtTime(0,at+duration);
                    oscillator.connect(envelope);envelope.connect(stereo);stereo.connect(appState.audio.masterGain);
                    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();stereo.disconnect();headphoneCalibrationVoices=headphoneCalibrationVoices.filter(voice=>voice!==oscillator);};
                    headphoneCalibrationVoices.push(oscillator);oscillator.start(at);oscillator.stop(at+duration+.01);
                };
                if(step===0){tone(440,0,.24);tone(660,.72,.2);}
                if(step===1){const preview={low:1.8,okay:1,high:.45}[headphoneCalibrationAnswers[1]]||1;tone(900,0,.024*preview);tone(1200,.72,.021*preview);}
                if(step===2){tone(520,0,.06,-1);tone(620,.72,.06,1);}
                if(step===3){tone(90,0,.12);tone(140,.72,.1);}
                if(step===4){tone(3200,0,.025);tone(4800,.72,.02);}
                if([0,1,3,4].includes(step)&&!playOnce){
                    headphoneCalibrationLooping=true;setHeadphoneCalibrationPlayLabel(true);
                    headphoneCalibrationTimers.push(setTimeout(()=>{if(headphoneCalibrationDialog.open&&headphoneCalibrationStep===step&&headphoneCalibrationLooping)playHeadphoneCalibrationSound(true);},1650));
                }
                status.textContent=playOnce?'Prévia reproduzida.':[0,1,3,4].includes(step)?'Repetindo com pausa curta.':'Tocando primeiro à esquerda, depois à direita.';
            }catch{stopHeadphoneCalibrationSound();status.textContent='O navegador bloqueou o áudio. Toque em “Tocar” novamente.';}
        }
        function openHeadphoneCalibration(){
            if(headphoneCalibrationDialog.open)return;
            headphoneCalibrationStep=-1;headphoneCalibrationAnswers={};headphoneCalibrationBases={};lastHeadphoneCalibrationPreview=0;renderHeadphoneCalibration();headphoneCalibrationDialog.showModal();
            document.getElementById('headphone-calibration-next').focus();
        }
        document.getElementById('headphone-calibration-play').addEventListener('click',()=>playHeadphoneCalibrationSound());
        document.getElementById('headphone-calibration-tone-slider').addEventListener('input',event=>{
            const kind=headphoneCalibrationStep===3?'bass':headphoneCalibrationStep===4?'treble':null;
            if(!kind)return;
            setListeningTone(kind,Number(event.target.value));
            document.getElementById('headphone-calibration-tone-value').textContent=`${event.target.value>0?'+':''}${event.target.value} dB`;
            if(!headphoneCalibrationLooping)playHeadphoneCalibrationSound();
        });
        document.getElementById('headphone-calibration-ui-slider').addEventListener('input',event=>{
            setInteractionVolume(Number(event.target.value));
            if(!headphoneCalibrationDialog.open||headphoneCalibrationStep!==5||!appState.preferences.uiSoundVolume||headphoneCalibrationPreviewTimer)return;
            const delay=Math.max(30,120-(performance.now()-lastHeadphoneCalibrationPreview));
            headphoneCalibrationPreviewTimer=setTimeout(()=>{
                headphoneCalibrationPreviewTimer=0;lastHeadphoneCalibrationPreview=performance.now();
                if(headphoneCalibrationDialog.open&&headphoneCalibrationStep===5&&appState.preferences.uiSoundVolume)playUiSound('receiverClick');
            },delay);
        });
        document.querySelectorAll('[data-calibration-answer]').forEach(button=>button.addEventListener('click',()=>{
            const step=headphoneCalibrationStep,answer=button.dataset.calibrationAnswer,base=headphoneCalibrationBases[step];
            if(!base)return;
            headphoneCalibrationAnswers[step]=answer;
            button.parentElement.querySelectorAll('button').forEach(option=>{const selected=option===button;option.classList.toggle('is-selected',selected);option.setAttribute('aria-pressed',String(selected));});
            const status=document.getElementById('headphone-calibration-status');
            if(step===0){
                if(answer!=='okay')setListeningOutputLevel(base.program+(answer==='low'?.1:-.15));
                else stopHeadphoneCalibrationSound();
                status.textContent=answer==='okay'?'Nível escolhido mantido.':appState.preferences.listening.outputLevel===base.program?'Limite de ajuste atingido; priorize o volume físico confortável.':answer==='low'?'Saída do programa levemente ampliada.':'Saída do programa suavizada.';
            }
            if(step===1){setListeningOutputLevel(base.program+(answer==='low'?.1:answer==='high'?-.1:0));status.textContent=answer==='okay'?'Nível de escuta mantido.':appState.preferences.listening.outputLevel===base.program?'Limite de ajuste atingido; priorize o conforto.':answer==='low'?'Detalhes ampliados; confira se o som forte continua confortável.':'Nível de escuta suavizado.';playHeadphoneCalibrationSound(headphoneCalibrationLooping,!headphoneCalibrationLooping);}
        }));
        document.getElementById('headphone-calibration-next').addEventListener('click',()=>{
            if(headphoneCalibrationTransitioning)return;
            stopHeadphoneCalibrationSound();
            if(headphoneCalibrationStep===headphoneCalibrationSteps.length){persistHeadphoneCalibration();headphoneCalibrationDialog.close();return;}
            transitionHeadphoneCalibration(1,()=>{headphoneCalibrationStep++;renderHeadphoneCalibration();});
        });
        document.getElementById('headphone-calibration-back').addEventListener('click',()=>{
            if(headphoneCalibrationTransitioning)return;
            stopHeadphoneCalibrationSound();
            if(headphoneCalibrationStep===1){setListeningOutputLevel(headphoneCalibrationBases[1]?.program??appState.preferences.listening.outputLevel);delete headphoneCalibrationAnswers[1];delete headphoneCalibrationBases[1];}
            if(headphoneCalibrationStep===0){setListeningOutputLevel(headphoneCalibrationBases[0]?.program??appState.preferences.listening.outputLevel);delete headphoneCalibrationAnswers[0];delete headphoneCalibrationBases[0];}
            transitionHeadphoneCalibration(-1,()=>{headphoneCalibrationStep=Math.max(-1,headphoneCalibrationStep-1);renderHeadphoneCalibration();});
        });
        function persistHeadphoneCalibration(){
            appStateStore.actions.setPreference('headphonePromptSeen',true);
            try{localStorage.setItem(APP_PREFERENCES_KEY,JSON.stringify({...readAppPreferences(),headphonePromptSeen:true,listeningOutputLevel:appState.preferences.listening.outputLevel,listeningBass:appState.preferences.listening.bass,listeningTreble:appState.preferences.listening.treble}));}catch{}
            scheduleAppPreferencesSave();
        }
        document.getElementById('headphone-calibration-skip').addEventListener('click',()=>{persistHeadphoneCalibration();headphoneCalibrationDialog.close();});
        headphoneCalibrationDialog.addEventListener('close',()=>{
            headphoneCalibrationTransitionCleanup?.();
            stopHeadphoneCalibrationSound();
            persistHeadphoneCalibration();
        });
        document.addEventListener('visibilitychange',()=>{if(document.hidden&&headphoneCalibrationDialog.open)stopHeadphoneCalibrationSound();});

        const canvas = document.getElementById('canvas');
        const world = document.getElementById('audio-world');
