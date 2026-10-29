/* Power, capture interfaces, equipment controls, deletion, pairing, and restoration. */
        const powerOnAnimations=new WeakMap();
        const powerMotionPreference=matchMedia('(prefers-reduced-motion: reduce)');
        function deviceGaugeCalibrationAngle(dev,now,rest,maximum){
            const calibration=dev.gaugeCalibration;if(!calibration)return null;
            const elapsed=now-calibration.startedAt,duration=calibration.duration;
            if(elapsed>=duration){dev.gaugeCalibration=null;return null;}
            const ease=value=>value<.5?4*value*value*value:1-Math.pow(-2*value+2,3)/2;
            const rise=duration*.36,hold=duration*.08;
            if(elapsed<rise)return rest+(maximum-rest)*ease(elapsed/rise);
            if(elapsed<rise+hold)return maximum;
            return rest+(maximum-rest)*(1-ease((elapsed-rise-hold)/(duration-rise-hold)));
        }
        function stopPowerOnRitual(dev){
            powerOnAnimations.get(dev)?.forEach(animation=>animation.cancel());powerOnAnimations.delete(dev);
        }
        function animateDevicePower(dev){
            stopPowerOnRitual(dev);
            dev.gaugeCalibration=null;
            const reducedMotion=powerMotionPreference.matches;
            if(!dev.powered||dev.state.damage||appState.project.restoringProject||(reducedMotion&&dev.type!=='prePrecision'))return;
            dev.gaugeCalibration={startedAt:performance.now(),duration:reducedMotion?420:1250};
            const animations=[];
            const fade=(element,delay,duration)=>{
                const opacity=getComputedStyle(element).opacity;
                animations.push(element.animate([{opacity:0},{opacity}],{delay,duration,easing:'ease-in-out',fill:'backwards'}));
            };
            dev.el.querySelectorAll('.hw-led,.device-led,.hw-bar-lens').forEach(element=>fade(element,0,760));
            // Screens and gauge faces stay opaque; the meter loops animate their needles.
            powerOnAnimations.set(dev,animations);
        }
        powerMotionPreference.addEventListener('change',event=>{if(event.matches)Object.values(appState.project.devices).forEach(dev=>{stopPowerOnRitual(dev);});});

        function toggleDevicePower(dev) {
            dev.powered = dev.state.damage ? false : !dev.powered;
            (dev.outputCircuits||[]).forEach(circuit=>circuit.gate.gain.setValueAtTime(dev.powered&&!dev.state.damage?1:0,appState.audio.context.currentTime));
            dev.el.classList.toggle('device-damaged',!!dev.state.damage);
            dev.syncRadio?.();
            dev.syncValvePower?.();
            dev.applyStream?.();
            if (!dev.powered && SOURCE_TYPES.has(dev.type)) setSourcePlaying(dev, false);
            const powerTime = appState.audio.context ? appState.audio.context.currentTime : 0;
            if (dev.powerGain) {
                dev.powerGain.gain.setValueAtTime(dev.powered ? 1.0 : 0.0, powerTime);
            }
            (dev.powerNodes || []).forEach(node => node.gain.setValueAtTime(dev.powered ? 1.0 : 0.0, powerTime));
            dev.refreshDirectControls?.();
            if(dev.type==='turntableBelt'&&dev.powered)setSourcePlaying(dev,true);
            
            const btn = dev.el.querySelector('.power-btn');
            if (btn) {
                const stateText = btn.parentElement.querySelector('.power-state');
                btn.setAttribute('aria-pressed', String(dev.powered));
                if(btn.matches('.power-rocker-switch,.hw-slide-power,.hw-chrome-lever'))btn.setAttribute('aria-checked',String(dev.powered));
                if (dev.powered) {
                    btn.classList.remove('off');
                    btn.title = 'Ligado (Clique para desligar)';
                    if (stateText) stateText.textContent = 'ON';
                    dev.el.classList.remove('power-off');
                } else {
                    btn.classList.add('off');
                    btn.title = 'Desligado (Clique para ligar)';
                    if (stateText) stateText.textContent = 'OFF';
                    dev.el.classList.add('power-off');
                }
            }

            // Atualiza inspeção caso esteja selecionado
            if (appState.interface.selectedDeviceId === dev.id) {
                const statusLbl = document.getElementById('lbl-power-status');
                if (statusLbl) {
                    statusLbl.innerText = dev.powered ? 'LIGADO' : 'DESLIGADO';
                    statusLbl.className = dev.powered ? 'text-xs text-emerald-400 font-bold' : 'text-xs text-red-400 font-bold';
                }
                const propertyToggle = document.getElementById('inspector-power-toggle');
                if (propertyToggle) {
                    propertyToggle.setAttribute('aria-pressed', String(dev.powered));
                    propertyToggle.classList.toggle('is-on', dev.powered);
                }
            }
            syncMobileContextActions();
            dev.refreshTurntable?.();
            refreshCdDisplay(dev);
            animateDevicePower(dev);
            updateCableFlows();
        }

        function setupActiveSpeaker(dev) {
            dev.state.volume = 0.8;
            const knob = dev.el.querySelector('[data-sp="vol"]');
            dev.setSpeakerVolume = v => {
                const n = Math.max(0, Math.min(1, v));
                const pct = Math.round(n * 100);
                dev.state.volume = n;
                dev.volumeNode?.gain.setTargetAtTime(n * 1.25, appState.audio.context.currentTime, 0.015);
                knob.style.setProperty('--knob-angle', `${-135 + n * 270}deg`);
                knob.setAttribute('aria-valuenow', pct);
                if (appState.interface.selectedDeviceId === dev.id) {
                    const r = document.getElementById('sp-insp-vol');
                    if (r && Number(r.value) !== pct) r.value = pct;
                    const l = document.getElementById('sp-insp-vol-lbl');
                    if (l) l.textContent = `${pct}%`;
                }
            };
            Hardware.bindKnob(knob,{get:()=>dev.state.volume,set:dev.setSpeakerVolume});
            dev.setSpeakerVolume(0.8);
        }

        function speakerInspectorHtml(dev) {
            const v = Math.round((dev.state.volume ?? 0.8) * 100);
            return `<div class="flex flex-col gap-2 mt-4"><div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume</span><span id="sp-insp-vol-lbl" class="text-xs text-blue-400 font-mono">${v}%</span></div><input id="sp-insp-vol" aria-label="Volume" type="range" min="0" max="100" step="1" value="${v}" class="w-full"></div>`;
        }

        const LINEAR_DISC_TYPES={lp:'30 cm · LP',single:'17 cm · Single',none:'Sem disco'};
        function setupLinearTurntable(dev){
            const tt=dev.state.tt={running:false,pitch:0,output:'line',speed:33,disc:'lp',trim33:0,trim45:0};
            const el=dev.el,mechanism=dev.linear={phase:'idle',deadline:0,arm:485,target:485,operation:0,cue:0,disposed:false,message:''};
            const phaseNames={idle:'Em repouso',scanning:'Detectando o disco',lowering:'Descendo a agulha',playing:'Em reprodução',raised:'Agulha elevada',returning:'Retornando ao repouso'};
            const duration=()=>dev.audioBuffer?.duration||180;
            const leadIn=()=>tt.disc==='single'?297:380;
            const leadOut=()=>tt.disc==='single'?255:270;
            const hasDisc=()=>tt.disc!=='none'||!!dev.spotifyVinyl;
            const position=()=>dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?(appState.audio.context.currentTime-dev.demoStartedAt)*dev.ttRate():0);
            const pause=()=>{
                const seconds=position();
                setSourcePlaying(dev,false,true);
                if(!dev.audioBuffer)dev.demoOffset=seconds;
            };
            const refresh=()=>{
                tt.running=dev.powered&&mechanism.phase!=='idle';
                const lowered=mechanism.phase==='playing';
                el.dataset.linearPhase=mechanism.phase;el.dataset.linearDisc=tt.disc;
                el.classList.toggle('tt-motor',tt.running);el.classList.toggle('tt-stopped',!tt.running);
                el.classList.toggle('linear-needle-down',lowered);
                const status=!dev.powered?'Desligado':mechanism.message||phaseNames[mechanism.phase];
                el.querySelector('[data-linear-status]').textContent=status;
                el.querySelector('[data-linear-rpm]').textContent=(dev.powered?(tt.speed===45?45:100/3)*(1+tt.pitch*.03):0).toFixed(2);
                el.querySelectorAll('[data-linear-speed]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.linearSpeed)===tt.speed)));
                el.querySelector('[data-linear-lift]').setAttribute('aria-pressed',String(mechanism.phase==='raised'));
                el.querySelector('[data-linear-start]').setAttribute('aria-pressed',String(lowered||mechanism.phase==='scanning'||mechanism.phase==='lowering'));
                for(const speed of [33,45]){
                    const knob=el.querySelector(`[data-linear-trim="${speed}"]`),value=tt['trim'+speed];
                    knob.style.setProperty('--knob-angle',`${value*135}deg`);knob.setAttribute('aria-valuenow',String(Math.round(value*30)/10));
                }
                if(appState.interface.selectedDeviceId===dev.id){
                    const q=id=>document.getElementById(id);
                    if(q('linear-status'))q('linear-status').textContent=status;
                    q('linear-disc-group')?.querySelectorAll('[data-linear-disc-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.linearDiscChoice===tt.disc)));
                    [33,45].forEach(speed=>{
                        q('linear-speed-'+speed)?.setAttribute('aria-pressed',String(tt.speed===speed));
                        const slider=q('linear-trim-'+speed),value=Math.round(tt['trim'+speed]*30)/10;
                        if(slider)slider.value=value;
                        if(q('linear-trim-value-'+speed))q('linear-trim-value-'+speed).textContent=`${value>0?'+':''}${value.toFixed(1)}%`;
                    });
                    q('linear-lift')?.setAttribute('aria-pressed',String(mechanism.phase==='raised'));
                }
            };
            dev.refreshTurntable=refresh;
            dev.ttRate=()=>((tt.speed===45?45:100/3)/(tt.disc==='single'?45:100/3))*(1+tt.pitch*.03);
            dev.linearStop=()=>{
                mechanism.operation++;mechanism.cue=0;pause();dev.fileOffset=0;dev.demoOffset=0;
                mechanism.phase=Math.abs(mechanism.arm-485)<.1?'idle':'returning';
                mechanism.deadline=performance.now()+750;mechanism.target=485;refresh();
            };
            dev.linearStart=async()=>{
                if(!dev.powered||dev.state.damage||mechanism.disposed||['scanning','lowering','playing'].includes(mechanism.phase))return;
                const operation=++mechanism.operation;
                const spotifyActivation=dev.spotifyVinyl?SpotifyCoverflow.activatePlayback():null;
                try{await appState.audio.context.resume();}catch{}
                if(spotifyActivation){
                    let activated=false;
                    try{activated=await spotifyActivation;}catch{mechanism.message='O navegador bloqueou a ativação do Spotify. Pressione INICIAR novamente.';refresh();return;}
                    if(!activated){mechanism.message='Player do Spotify ainda conectando. Tente novamente.';refresh();return;}
                }
                if(operation!==mechanism.operation||mechanism.disposed||!dev.powered)return;
                if(appState.audio.context.state!=='running'){mechanism.message='Clique novamente para ativar o áudio';refresh();return;}
                mechanism.message='';mechanism.cue=0;
                if(mechanism.phase==='raised'&&hasDisc()){
                    mechanism.phase='lowering';mechanism.target=Math.min(leadIn(),mechanism.arm);mechanism.deadline=performance.now()+430;
                }else{
                    // The sensor traverses the rim before a diameter is accepted.
                    mechanism.phase='scanning';mechanism.target=hasDisc()?leadIn():245;mechanism.deadline=performance.now()+1250;
                    tt.speed=tt.disc==='single'?45:33;tt.pitch=tt['trim'+tt.speed];
                    dev.fileOffset=0;dev.demoOffset=0;
                }
                refresh();
            };
            dev.linearSetPlaying=playing=>playing?dev.linearStart():dev.linearStop();
            dev.ttToggleRun=()=>dev.state.playing||['scanning','lowering'].includes(mechanism.phase)?dev.linearStop():dev.linearStart();
            dev.linearLift=()=>{
                if(!dev.powered)return;
                if(mechanism.phase==='playing'){
                    mechanism.operation++;pause();mechanism.phase='raised';mechanism.target=mechanism.arm;refresh();
                }else if(mechanism.phase==='raised')dev.linearStart();
            };
            dev.linearCue=direction=>{
                if(!direction){
                    if(mechanism.cue){
                        const progress=Math.max(0,Math.min(1,(leadIn()-mechanism.target)/(leadIn()-leadOut())));
                        if(dev.audioBuffer)dev.fileOffset=progress*duration();else dev.demoOffset=progress*duration();
                    }
                    mechanism.cue=0;return;
                }
                if(!dev.powered||!hasDisc())return;
                mechanism.operation++;pause();mechanism.message='';mechanism.phase='raised';mechanism.cue=direction;mechanism.target=mechanism.arm;refresh();
            };
            const changeRate=callback=>{
                const restart=!!dev.filePlayback,seconds=position();
                if(restart)stopFilePlayback(dev);
                callback();tt.pitch=tt['trim'+tt.speed];
                if(!dev.audioBuffer){dev.demoOffset=seconds;dev.demoStartedAt=dev.state.playing?appState.audio.context.currentTime:null;}
                if(restart)startFilePlayback(dev);
                refresh();
            };
            dev.linearSetSpeed=speed=>changeRate(()=>{tt.speed=Number(speed)===45?45:33;});
            dev.linearSetTrim=(speed,value)=>{
                speed=Number(speed)===45?45:33;
                const trimmed=Math.max(-1,Math.min(1,Number(value)||0));
                if(speed!==tt.speed){tt['trim'+speed]=trimmed;refresh();}
                else changeRate(()=>{tt['trim'+speed]=trimmed;});
            };
            dev.ttSetPitch=value=>dev.linearSetTrim(tt.speed,value);
            dev.ttSetOutput=()=>{tt.output='line';dev.setOutputMode('line');revalidateSignalConnections();refresh();updateCableFlows();};
            dev.linearSetDisc=disc=>{
                dev.linearStop();tt.disc=Object.hasOwn(LINEAR_DISC_TYPES,disc)?disc:'lp';
                tt.speed=tt.disc==='single'?45:33;tt.pitch=tt['trim'+tt.speed];mechanism.message='';refresh();scheduleProjectSave();
            };
            dev.restoreLinear=()=>{
                mechanism.operation++;mechanism.phase='idle';mechanism.arm=mechanism.target=485;mechanism.cue=0;mechanism.message='';
                tt.disc=Object.hasOwn(LINEAR_DISC_TYPES,tt.disc)?tt.disc:'lp';tt.speed=tt.speed===45?45:33;
                for(const key of ['trim33','trim45'])tt[key]=Number.isFinite(tt[key])?Math.max(-1,Math.min(1,tt[key])):0;
                tt.pitch=tt['trim'+tt.speed];tt.running=false;refresh();
            };
            dev.resetLinear=()=>{Object.assign(tt,{disc:'lp',speed:33,trim33:0,trim45:0});dev.restoreLinear();};
            dev.disposeLinear=()=>{mechanism.operation++;mechanism.disposed=true;mechanism.cue=0;dev.state.playing=false;};
            dev.updateLinearMotion=(now,elapsed,reduced)=>{
                if(mechanism.disposed)return;
                if(!dev.powered&&mechanism.phase!=='idle'&&mechanism.phase!=='returning')dev.linearStop();
                if(mechanism.phase==='scanning'&&now>=mechanism.deadline){
                    if(!hasDisc()){mechanism.message='Sem disco · retorno automático';dev.linearStop();}
                    else {mechanism.phase='lowering';mechanism.deadline=now+430;refresh();}
                }else if(mechanism.phase==='lowering'&&now>=mechanism.deadline&&Math.abs(mechanism.arm-mechanism.target)<.8){
                    mechanism.phase='playing';
                    setSourcePlaying(dev,true,true).then(()=>{if(!dev.state.playing&&mechanism.phase==='playing'){mechanism.phase='raised';refresh();}});
                    refresh();
                }else if(mechanism.phase==='returning'&&now>=mechanism.deadline){
                    mechanism.phase='idle';mechanism.arm=mechanism.target=485;refresh();
                }
                if(mechanism.phase==='playing'){
                    const seconds=position();
                    if(!dev.spotifyVinyl&&seconds>=duration()&&!dev.state.repeat){dev.linearStop();}
                    else mechanism.target=leadIn()+(leadOut()-leadIn())*Math.min(1,(seconds%duration())/duration());
                }
                if(mechanism.cue){
                    mechanism.target=Math.max(leadOut(),Math.min(485,mechanism.target+mechanism.cue*65*elapsed));
                    const progress=Math.max(0,Math.min(1,(leadIn()-mechanism.target)/(leadIn()-leadOut())));
                    if(dev.audioBuffer)dev.fileOffset=progress*duration();else dev.demoOffset=progress*duration();
                }
                mechanism.arm=reduced?mechanism.target:mechanism.arm+(mechanism.target-mechanism.arm)*(1-Math.exp(-elapsed/(mechanism.cue?.06:.15)));
                el.querySelector('[data-linear-carriage]').setAttribute('transform',`translate(${(mechanism.arm-485).toFixed(3)} 0)`);
                el.querySelector('.linear-rim-pattern')?.setAttribute('patternTransform',`translate(${(reduced?0:(dev.platterAngle||0)/72).toFixed(3)} 0)`);
            };
            const bind=(selector,handler)=>el.querySelector(selector).addEventListener('click',event=>{event.stopPropagation();handler();scheduleProjectSave();});
            bind('[data-linear-start]',dev.linearStart);bind('[data-linear-stop]',dev.linearStop);bind('[data-linear-lift]',dev.linearLift);
            el.querySelectorAll('[data-linear-speed]').forEach(button=>button.addEventListener('click',()=>{dev.linearSetSpeed(button.dataset.linearSpeed);scheduleProjectSave();}));
            el.querySelectorAll('[data-linear-cue]').forEach(button=>{
                button.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();button.setPointerCapture(event.pointerId);dev.linearCue(Number(button.dataset.linearCue)*(event.shiftKey?3:1));});
                for(const name of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(name,()=>dev.linearCue(0));
                button.addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)dev.linearCue(Number(button.dataset.linearCue));}});
                button.addEventListener('keyup',()=>dev.linearCue(0));
                // Also support activation without a pointer press (assistive technology).
                button.addEventListener('click',event=>{if(event.detail===0&&mechanism.cue===0){dev.linearCue(Number(button.dataset.linearCue));mechanism.target=Math.max(leadOut(),Math.min(485,mechanism.target+Number(button.dataset.linearCue)*12));dev.linearCue(0);}});
            });
            el.querySelectorAll('[data-linear-trim]').forEach(knob=>{
                const speed=Number(knob.dataset.linearTrim);
                Hardware.bindKnob(knob,{get:()=>tt['trim'+speed]*3,set:value=>dev.linearSetTrim(speed,value/3),min:-3,max:3,model:'recessed',width:18,height:18,format:value=>`${value>0?'+':''}${value.toFixed(1)}%`});
                knob.addEventListener('dblclick',()=>dev.linearSetTrim(speed,0));
            });
            refresh();
        }
        function linearTurntableInspector(dev){
            const tt=dev.state.tt;
            return `<section class="linear-inspector"><p>O carro move os dois braços em linha reta. O sensor detecta o diâmetro escolhido e só baixa a agulha quando há disco.</p>
                <span>Disco sobre o prato</span><div id="linear-disc-group" class="linear-disc-choices" role="group" aria-label="Tamanho do disco">${[['lp','LP · 30 cm'],['single','Single · 17 cm']].map(([key,label])=>`<button type="button" data-linear-disc-choice="${key}" class="tt-insp-btn" aria-label="${label}. Clique novamente para retirar o disco" title="${label} · clique novamente para retirar" aria-pressed="${tt.disc===key}"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${key==='lp'?26:18}"/><circle cx="32" cy="32" r="${key==='lp'?9:7}"/><circle cx="32" cy="32" r="2"/><path d="M32 ${key==='lp'?6:14}v4"/></svg></button>`).join('')}</div>
                <output id="linear-status" role="status">${dev.el.querySelector('[data-linear-status]').textContent}</output>
                <div class="linear-inspector-row"><button id="linear-start" class="tt-insp-btn">INICIAR</button><button id="linear-stop" class="tt-insp-btn">PARAR / RETORNAR</button></div>
                <button id="linear-lift" class="tt-insp-btn" aria-pressed="${dev.linear.phase==='raised'}">ELEVAR / BAIXAR AGULHA</button>
                <div class="linear-inspector-row">${[33,45].map(speed=>`<button id="linear-speed-${speed}" class="tt-insp-btn" aria-pressed="${tt.speed===speed}">${speed===33?'33⅓':'45'} RPM</button>`).join('')}</div>
                ${[33,45].map(speed=>`<label for="linear-trim-${speed}">Ajuste fino · ${speed===33?'33⅓':'45'} rpm <output id="linear-trim-value-${speed}">${(tt['trim'+speed]*3).toFixed(1)}%</output></label><input id="linear-trim-${speed}" type="range" min="-3" max="3" step="0.1" value="${tt['trim'+speed]*3}">`).join('')}
                <p>Mantenha as setas do aparelho pressionadas para mover o carro com a agulha elevada. Shift acelera o movimento. Use ELEVAR / BAIXAR para retomar a escuta. Ao fim do lado, o braço retorna e o motor para.</p>
                </section>`;
        }
        function bindLinearInspector(dev){
            const q=id=>document.getElementById(id);
            q('linear-disc-group').querySelectorAll('[data-linear-disc-choice]').forEach(button=>button.addEventListener('click',()=>dev.linearSetDisc(dev.state.tt.disc===button.dataset.linearDiscChoice?'none':button.dataset.linearDiscChoice)));
            q('linear-start').onclick=dev.linearStart;q('linear-stop').onclick=dev.linearStop;q('linear-lift').onclick=dev.linearLift;
            for(const speed of [33,45]){
                q('linear-speed-'+speed).onclick=()=>dev.linearSetSpeed(speed);
                q('linear-trim-'+speed).oninput=event=>dev.linearSetTrim(speed,Number(event.target.value)/3);
            }
        }

        function setupTurntable(dev) {
            if(dev.type==='turntableLinear'){setupLinearTurntable(dev);return;}
            const tt = dev.state.tt = { running: false, pitch: 0, output: 'line' };
            const el = dev.el;
            const direct=dev.type==='turntableDirect';
            if(direct)Object.assign(tt,{speed:33,pitchRange:8,stylusLight:false});
            dev.ttPitchRange=()=>direct&&tt.pitchRange===16?16:8;
            dev.ttRate = () => (direct&&tt.speed===45?1.35:1)*(1 + tt.pitch * dev.ttPitchRange()/100);
            const stop = e => e.stopPropagation();
            const startBtn = el.querySelector('[data-tt="startstop"]');
            const outSw = el.querySelector('[data-tt="output"]');
            const pitchEl = el.querySelector('[data-tt="pitch"]');
            const record = el.querySelector('[data-tt="record"]');
            const pitchPct = () => Math.round(tt.pitch * dev.ttPitchRange() * 10) / 10;
            const pitchText = () => `${pitchPct() > 0 ? '+' : ''}${pitchPct().toFixed(1)}%`;
            dev.refreshTurntable = () => {
                el.classList.toggle('tt-motor', dev.powered && tt.running);
                el.classList.toggle('tt-stopped', !tt.running);
                record.style.setProperty('--tt-period', (1.8 / dev.ttRate()).toFixed(3) + 's');
                dev.refreshDirectControls?.();
                startBtn?.setAttribute('aria-pressed', String(tt.running));
                outSw?.setAttribute('aria-checked', String(tt.output === 'phono'));
                outSw?.setAttribute('aria-label',`Saída do toca-discos: ${tt.output.toUpperCase()}. Use as setas para selecionar LINE ou PHONO.`);
                if(outSw)outSw.title=tt.output==='line'?'LINE · pré interno ligado, sinal de linha':'PHONO · cápsula MM, requer pré/RIAA externo';
                outSw?.querySelectorAll('[data-m]').forEach(n => n.classList.toggle('is-on', n.dataset.m === tt.output));
                pitchEl?.style.setProperty('--p', ((tt.pitch + 1) / 2).toFixed(3));
                pitchEl?.setAttribute('aria-valuenow', pitchPct());
                pitchEl?.setAttribute('aria-valuemin',-dev.ttPitchRange());pitchEl?.setAttribute('aria-valuemax',dev.ttPitchRange());
                if(pitchEl)pitchEl.title = `Pitch ${pitchText()} · arraste (duplo clique para zerar)`;
                // Painel de propriedades (se este aparelho estiver selecionado)
                if (appState.interface.selectedDeviceId === dev.id) {
                    const q = id => document.getElementById(id);
                    const run = q('tt-insp-run');
                    if (run) { run.setAttribute('aria-pressed', String(tt.running)); run.classList.toggle('is-on', tt.running); }
                    ['line', 'phono'].forEach(m => q('tt-insp-out-' + m)?.classList.toggle('is-on', tt.output === m));
                    const ps = q('tt-insp-pitch'); if(ps){ps.min=-dev.ttPitchRange();ps.max=dev.ttPitchRange();ps.value=pitchPct();}
                    const pl = q('tt-insp-pitch-lbl'); if (pl) pl.textContent = pitchText();
                }
            };
            dev.ttToggleRun = () => {
                if (!dev.powered) return;
                setSourcePlaying(dev, !dev.state.playing);
            };
            dev.ttSetOutput = mode => {
                tt.output = mode === 'line' ? 'line' : 'phono';
                dev.setOutputMode(tt.output);
                revalidateSignalConnections();
                dev.refreshTurntable();
                updateCableFlows();
            };
            dev.ttSetPitch = v => {
                const restartFile = !!dev.filePlayback;
                if (restartFile) stopFilePlayback(dev);
                const n = Math.max(-1, Math.min(1, v));
                tt.pitch = Math.abs(n) < .06 ? 0 : n;
                if (restartFile) startFilePlayback(dev);
                dev.refreshTurntable();
                updateCableFlows();
            };
            startBtn?.addEventListener('pointerdown', stop);
            startBtn?.addEventListener('click', e => { stop(e); dev.ttToggleRun(); });
            outSw?.addEventListener('pointerdown', stop);
            outSw?.addEventListener('click', e => {stop(e);const mode=e.target.closest('[data-m]')?.dataset.m;dev.ttSetOutput(mode||(tt.output==='phono'?'line':'phono'));});
            outSw?.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();dev.ttSetOutput(e.key==='ArrowLeft'||e.key==='Home'?'line':'phono');}});
            if(pitchEl)Hardware.bindLinear(pitchEl,{get:()=>tt.pitch,set:dev.ttSetPitch,min:-1,max:1,format:()=>pitchText(),pointerToValue:event=>{
                const track=pitchEl.querySelector('.at-pitch-track').getBoundingClientRect();
                return 1-2*Math.max(0,Math.min(1,(event.clientY-track.top)/Math.max(1,track.height)));
            }});
            pitchEl?.addEventListener('dblclick',event=>{stop(event);dev.ttSetPitch(0);});
            if(direct){
                dev.refreshDirectControls=()=>{
                    el.classList.toggle('direct-light-on',dev.powered&&tt.stylusLight);
                    const roots=[el,...(appState.interface.selectedDeviceId===dev.id?[inspectorContent]:[])];
                    roots.forEach(root=>{
                        root.querySelectorAll('[data-direct-speed]').forEach(button=>{const active=Number(button.dataset.directSpeed)===tt.speed;button.setAttribute('aria-pressed',String(active));button.classList.toggle('is-on',active);});
                        root.querySelectorAll('[data-direct-range]').forEach(button=>{const label='±'+dev.ttPitchRange();(button.querySelector('.hw-plunger-legend,.hw-mechanical-key-legend')||button).textContent=label;const sizer=button.querySelector('.hw-button-sizer');if(sizer)sizer.textContent=label;button.setAttribute('aria-pressed',String(tt.pitchRange===16));button.classList.toggle('is-on',tt.pitchRange===16);});
                        root.querySelectorAll('[data-direct-light]').forEach(button=>{button.setAttribute('aria-pressed',String(tt.stylusLight));button.classList.toggle('is-on',tt.stylusLight);});
                    });
                };
                dev.ttSetDirect=(key,value)=>{
                    if(!['speed','pitchRange','stylusLight'].includes(key))return;
                    const restart=!!dev.filePlayback&&key!=='stylusLight';if(restart)stopFilePlayback(dev);
                    tt[key]=key==='speed'?(Number(value)===45?45:33):key==='pitchRange'?(Number(value)===16?16:8):!!value;
                    if(restart)startFilePlayback(dev);dev.refreshTurntable();updateCableFlows();scheduleProjectSave();
                };
                bindDirectTurntableControls(dev,el);
            }
            dev.refreshTurntable();
        }

        function bindDirectTurntableControls(dev,root){
            root.querySelectorAll('[data-direct-speed],[data-direct-range],[data-direct-reset],[data-direct-light]').forEach(button=>{
                button.addEventListener('pointerdown',event=>event.stopPropagation());
                button.addEventListener('click',event=>{
                    event.stopPropagation();const tt=dev.state.tt;
                    if(button.hasAttribute('data-direct-speed'))dev.ttSetDirect('speed',button.dataset.directSpeed);
                    else if(button.hasAttribute('data-direct-range'))dev.ttSetDirect('pitchRange',tt.pitchRange===16?8:16);
                    else if(button.hasAttribute('data-direct-light'))dev.ttSetDirect('stylusLight',!tt.stylusLight);
                    else{dev.ttSetPitch(0);scheduleProjectSave();}
                });
            });
        }

        function turntableInspectorHtml(dev) {
            if(dev.type==='turntableLinear')return linearTurntableInspector(dev);
            const tt = dev.state.tt;
            const range=dev.ttPitchRange(),pct = Math.round(tt.pitch * range * 10) / 10;
            return `
                <div class="flex flex-col gap-4">
                    ${dev.type==='turntableDirect'?'<div class="direct-inspector-controls"><div class="direct-speed-options"><button type="button" class="tt-insp-btn" data-direct-speed="33">33⅓ RPM</button><button type="button" class="tt-insp-btn" data-direct-speed="45">45 RPM</button></div><div class="direct-pitch-range"><span>Faixa de pitch</span><button type="button" class="tt-insp-btn" data-direct-range aria-label="Faixa de pitch">±8</button></div><button type="button" class="tt-insp-btn" data-direct-reset>Zerar pitch</button></div>':''}
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-gray-300">Start / Stop</span>
                        <button id="tt-insp-run" type="button" class="tt-insp-btn ${tt.running ? 'is-on' : ''}" aria-pressed="${tt.running}">INICIAR / PARAR</button>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-gray-300">Saída</span>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="tt-insp-out-line" type="button" class="tt-insp-btn ${tt.output === 'line' ? 'is-on' : ''}">LINE</button>
                            <button id="tt-insp-out-phono" type="button" class="tt-insp-btn ${tt.output === 'phono' ? 'is-on' : ''}">PHONO</button>
                        </div>
                        <p class="text-xs text-gray-400">LINE: pré interno ligado, pronto para entrada de linha. PHONO: sinal da cápsula MM, que exige entrada PHONO com ganho e RIAA ou conversor externo.</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Pitch</span><span class="text-xs text-blue-400 font-mono" id="tt-insp-pitch-lbl">${pct > 0 ? '+' : ''}${pct.toFixed(1)}%</span></div>
                        <input id="tt-insp-pitch" aria-label="Pitch" type="range" min="-${range}" max="${range}" step="0.1" value="${pct}" class="w-full">
                    </div>
                </div>`;
        }

        function bindTurntableInspector(dev) {
            if(dev.type==='turntableLinear'){bindLinearInspector(dev);return;}
            const q = id => document.getElementById(id);
            q('tt-insp-run').addEventListener('click', () => dev.ttToggleRun());
            q('tt-insp-out-line').addEventListener('click', () => dev.ttSetOutput('line'));
            q('tt-insp-out-phono').addEventListener('click', () => dev.ttSetOutput('phono'));
            q('tt-insp-pitch').addEventListener('input', e => dev.ttSetPitch(Number(e.target.value) / dev.ttPitchRange()));
            if(dev.type==='turntableDirect'){bindDirectTurntableControls(dev,inspectorContent);dev.refreshDirectControls();}
        }

        async function refreshCaptureInputs(dev,select=document.getElementById('ai-input-device')){
            if(!navigator.mediaDevices?.enumerateDevices)return;
            const selected=dev.micDeviceId||select?.value||'';
            try{
                const devices=await navigator.mediaDevices.enumerateDevices();
                const inputs=devices.filter(device=>device.kind==='audioinput');
                dev.captureInputLabelsAvailable=inputs.some(device=>!!device.label);GuidedAccess.notify();
                if(!select?.isConnected)return;
                select.replaceChildren(new Option('Entrada padrão do sistema',''));
                inputs.forEach((device,index)=>select.add(new Option(device.label||`Entrada de áudio ${index+1}`,device.deviceId)));
                select.value=inputs.some(device=>device.deviceId===selected)?selected:'';
                dev.micDeviceId=select.value;GuidedAccess.notify();
            }catch{}
        }

        function captureStateMessage(){
            return 'O Safari recusou a captura porque a página não está pronta (InvalidStateError). Abra o endereço do programa diretamente em uma aba ativa do Safari, recarregue e tente novamente. Se persistir, feche outras abas deste programa.';
        }
        async function requestCaptureAudio(audio){
            if(document.visibilityState!=='visible')throw new DOMException('Mantenha a aba visível para capturar áudio.','InvalidStateError');
            configurePlaybackSession();
            try{return await navigator.mediaDevices.getUserMedia({audio});}
            catch(error){
                if(error.name!=='InvalidStateError')throw error;
                // WebKit may still be restoring a page's capture state after focus.
                // Retry once after its next visible frame, keeping the original error
                // if the document is still inactive.
                await new Promise(resolve=>requestAnimationFrame(resolve));
                if(document.visibilityState!=='visible'||!document.hasFocus())throw error;
                return navigator.mediaDevices.getUserMedia({audio});
            }
        }

        async function authorizeCaptureInputs(dev,button){
            const status=document.getElementById('ai-capture-status');
            const report=message=>{dev.micMessage=message;if(status?.isConnected)status.textContent=message;};
            if(!navigator.mediaDevices?.getUserMedia){report('Abra em HTTPS ou localhost para permitir o microfone.');return;}
            let permissionStream;
            button.disabled=true;dev.authorizingCapture=true;
            report('Aguardando permissão do microfone…');
            try{
                // Bare request directly from the user's click: no AudioContext, device ID,
                // or optional capture constraints can block Safari's permission discovery.
                permissionStream=await requestCaptureAudio(true);
                await refreshCaptureInputs(dev);
                report('Acesso autorizado. Escolha sua interface e toque em Iniciar captura.');
            }catch(error){
                report(error.name==='InvalidStateError'?captureStateMessage():error.name==='NotAllowedError'
                    ?'Microfone bloqueado. No Safari: Ajustes → Sites → Microfone → Permitir para este site. No macOS: Ajustes do Sistema → Privacidade e Segurança → Microfone → Safari. Depois recarregue.'
                    :error.name==='NotFoundError'?'Nenhuma entrada disponível. Confira Ajustes do Sistema → Som → Entrada.'
                    :'Não foi possível acessar o microfone ('+(error.name||'erro')+'). Confira as permissões do site e do macOS.');
            }finally{permissionStream?.getTracks().forEach(track=>track.stop());dev.authorizingCapture=false;configurePlaybackSession();if(button.isConnected)button.disabled=false;}
        }

        function bindDeviceEvents(dev) {
            if(dev.type==='cdPlayer'){
                const tray=dev.el.querySelector('.cd-tray');
                dev.setTrayOpen=open=>{
                    dev.state.trayOpen=!!open;dev.el.classList.toggle('cd-tray-open',!!open);
                    tray.setAttribute('aria-expanded',String(!!open));tray.setAttribute('aria-label',open?'Fechar bandeja do CD':'Abrir bandeja do CD');tray.title=open?'Fechar bandeja':'Abrir bandeja';
                    if(open)setSourcePlaying(dev,false);
                };
                tray.addEventListener('pointerdown',event=>event.stopPropagation());
                tray.addEventListener('click',()=>{dev.setTrayOpen(!dev.state.trayOpen);scheduleProjectSave();});
            }

            if (SOURCE_TYPES.has(dev.type) && !TURNTABLE_TYPES.has(dev.type)) {
                const integrated = dev.el.querySelector('[data-source-play]');
                const button = integrated || document.createElement('button');
                if(!integrated){button.type = 'button'; button.className = 'source-play-button';button.dataset.sourcePlay = ''; button.textContent = '▶ / Ⅱ';}
                button.setAttribute('aria-pressed', 'false');
                button.addEventListener('pointerdown', event => event.stopPropagation());
                button.addEventListener('click', event => { event.stopPropagation(); if (dev.powered) setSourcePlaying(dev, !dev.state.playing); });
                if(!integrated) dev.el.appendChild(button);
            }
            if (TURNTABLE_TYPES.has(dev.type)) setupTurntable(dev);
            if (ACTIVE_SPK.has(dev.type) || SUB_TYPES.has(dev.type)) setupActiveSpeaker(dev);
            if(TURNTABLE_TYPES.has(dev.type)){
                const lidButton=document.createElement('button');lidButton.type='button';lidButton.className='tt-lid-button';lidButton.title='Abrir tampa';lidButton.setAttribute('aria-label','Abrir tampa');lidButton.setAttribute('aria-expanded','false');
                lidButton.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 17h18M4 14l3-9h14l-3 9Z"/></svg>';
                const deck=dev.el.querySelector('.at-deck');deck.appendChild(lidButton);deck.style.setProperty('--lid-depth',Math.round(deck.clientWidth*.84)+'px');
                dev.setLidOpen=open=>{dev.state.lidOpen=!!open;dev.el.classList.toggle('lid-open',!!open);lidButton.setAttribute('aria-expanded',String(!!open));lidButton.title=open?'Fechar tampa':'Abrir tampa';lidButton.setAttribute('aria-label',lidButton.title);};
                lidButton.addEventListener('click',()=>{dev.setLidOpen(!dev.state.lidOpen);playUiSound('click');scheduleProjectSave();});
            }
            if((ACTIVE_SPK.has(dev.type)||PASSIVE_SPK.has(dev.type))&&!['spkActiveRounded','spkActiveCompact','spkActiveBookshelf','spkPassiveCarbon','shelfWood','shelfCoax','shelfTop','floorCoax','floorFlax','floorDiamond'].includes(dev.type)&&!dev.el.querySelector('.speaker-grille')){
                const face=dev.el.querySelector('.sp-face'),woofer=face?.querySelector('.spk-woofer');
                if(face&&woofer){
                    const grille=document.createElement('button');grille.type='button';grille.className='speaker-grille fabric-grille';grille.setAttribute('aria-label','Remover grade da caixa');grille.title='Remover grade';
                    const restore=document.createElement('button');restore.type='button';restore.className='grille-restore';restore.textContent='RECOLOCAR GRADE';
                    face.append(grille,restore);
                    const fit=()=>{grille.style.height=Math.min(face.clientHeight-12,woofer.offsetTop+woofer.offsetHeight+8)-8+'px';};
                    fit();requestAnimationFrame(fit);
                }
            }
            const grille = dev.el.querySelector('.speaker-grille');
            if (grille) {
                const toggleGrille = e => {
                    e.stopPropagation();
                    const removed = dev.el.classList.toggle('grille-off');
                    grille.setAttribute('aria-label', removed ? 'Recolocar grade da caixa' : 'Remover grade da caixa');scheduleProjectSave();
                };
                const restore = dev.el.querySelector('.grille-restore');
                if(restore){
                    const label=restore.title||'Recolocar grade';
                    restore.setAttribute('aria-label',label);
                    restore.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M12 4v16M16 4v16"/></svg>';
                }
                restore.addEventListener('pointerdown', e => e.stopPropagation());
                restore.addEventListener('click', toggleGrille);
                grille.addEventListener('pointerdown', e => e.stopPropagation());
                grille.addEventListener('click', toggleGrille);
                if (grille.tagName !== 'BUTTON') grille.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGrille(e); }
                });
            }

            if (dev.type === 'receiver') {
                dev.state.balance = 0;
                const setReceiverControl = (control, value) => {
                    dev.state[control] = value;
                    const balance = dev.state.balance || 0;
                    dev.nodes.volR.gain.value = dev.state.volume * (balance < 0 ? 1 + balance : 1);
                    dev.nodes.volL.gain.value = dev.state.volume * (balance > 0 ? 1 - balance : 1);
                    dev.nodes.bassR.gain.value = dev.nodes.bassL.gain.value = dev.state.bass;
                    dev.nodes.trebleR.gain.value = dev.nodes.trebleL.gain.value = dev.state.treble;
                    const range = control === 'volume' ? [0,1] : control === 'balance' ? [-1,1] : [-15,15];
                    updateKnobAngle(dev, `[data-receiver-control="${control}"]`, value, ...range);
                    const slider = document.getElementById(control === 'volume' ? 'sl-vol' : `sl-${control}`);
                    if (appState.interface.selectedDeviceId === dev.id && slider) {
                        slider.value = value;
                        const label = document.getElementById(control === 'volume' ? 'lbl-vol' : `lbl-${control}`);
                        if (label) label.textContent = control === 'volume' ? `${Math.round(value*100)}%` : control === 'balance' ? (Math.abs(value)<.01 ? 'Centro' : `${value<0?'L':'R'} ${Math.round(Math.abs(value)*100)}%`) : `${value.toFixed(1)}dB`;
                    }
                };
                dev.el.querySelectorAll('[data-receiver-control]').forEach(knob => {
                    const control = knob.dataset.receiverControl;
                    const min = control === 'volume' ? 0 : control === 'balance' ? -1 : -15;
                    const max = control === 'volume' || control === 'balance' ? 1 : 15;
                    knob.setAttribute('role', 'slider');
                    knob.setAttribute('aria-valuemin', min);
                    knob.setAttribute('aria-valuemax', max);
                    Hardware.bindKnob(knob,{get:()=>dev.state[control]||0,set:value=>setReceiverControl(control,value),min,max});
                });
                updateKnobAngle(dev, '[data-receiver-control="volume"]', dev.state.volume, 0, 1);
                updateKnobAngle(dev, '[data-receiver-control="bass"]', dev.state.bass, -15, 15);
                updateKnobAngle(dev, '[data-receiver-control="treble"]', dev.state.treble, -15, 15);
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                updateKnobAngle(dev, '.amp-volume-knob', dev.state.volume, 0, 1);
            } else if (dev.type === 'headphoneAmp4') {
                dev.state.channelVolumes ||= [0.8, 0.8, 0.8, 0.8];
                dev.state.channelVolumes.forEach((value, index) => {
                    const knob = dev.el.querySelector(`[data-channel-knob="${index + 1}"]`);
                    if (knob) knob.setAttribute('aria-valuenow', String(Math.round(value * 100)));
                    updateKnobAngle(dev, `.amp4-channel:nth-child(${index + 1}) .amp4-knob`, value, 0, 1);
                });
            } else if (MIXER_TYPES.has(dev.type)) {
                dev.state.channelVolumes ||= [0.8, 0.8, 0.8];
                dev.state.channelVolumes.forEach((value, channel) => setMixerVolume(dev, channel, value));
            }

            // Power Button físico
            const pBtn = dev.el.querySelector('.power-btn');
            if (pBtn) {
                const panel = document.createElement('div');
                panel.className='power-control-panel power-rocker-housing';
                panel.setAttribute('aria-label','Controle de energia integrado ao equipamento');
                pBtn.setAttribute('role','switch');pBtn.setAttribute('aria-checked','true');
                pBtn.setAttribute('aria-label', 'Ligar ou desligar equipamento');
                pBtn.setAttribute('aria-pressed', 'true');
                pBtn.title = 'Ligado (Clique para desligar)';
                const oldButtonGroup = pBtn.parentElement;
                dev.el.querySelector('.device-header .device-led')?.remove();
                pBtn.remove();
                if (oldButtonGroup && !oldButtonGroup.matches('[data-power-slot]') && oldButtonGroup !== dev.el.querySelector('.device-header') && !oldButtonGroup.children.length) oldButtonGroup.remove();
                panel.appendChild(pBtn);
                const powerSlot = dev.el.querySelector('[data-power-slot]');
                if (powerSlot) {
                    panel.classList.add('power-panel-embedded');
                    powerSlot.appendChild(panel);
                } else {
                    const deviceBody = dev.el.querySelector('.device-header')?.nextElementSibling;
                    (deviceBody || dev.el).appendChild(panel);
                }
                pBtn.dataset.rockerAxis='vertical';
                pBtn.addEventListener('pointerdown', e => e.stopPropagation());
                pBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    toggleDevicePower(dev);
                });
            }

            const handle = dev.el.querySelector('.device-header');
            if (handle) {
                handle.setAttribute('role', 'tooltip');
                handle.setAttribute('aria-hidden', 'true');
                handle.addEventListener('dragstart', e => e.preventDefault());
                dev.el.addEventListener('pointerdown', e => {
                    if (e.button !== 0) return;
                    if (e.target.closest('button, input, select, textarea, .port, .speaker-grille, .grille-restore, [role="button"]')) return;
                    const touchHold = e.pointerType === 'touch';
                    // On touch screens a tap must remain available for wiring and selection.
                    // Movement starts only after a short deliberate press, so passing a cable
                    // across a device does not pick it up accidentally.
                    const directTouchMove=touchHold&&touchMovementMode;
                    let touchReady = !touchHold||directTouchMove;
                    let holdTimer = touchHold&&!directTouchMove ? setTimeout(() => { touchReady = true; }, 320) : null;
                    if (!touchHold) e.preventDefault();
                    window.getSelection()?.removeAllRanges();
                    if (e.shiftKey || e.metaKey || e.ctrlKey) toggleDeviceSelection(dev.id);
                    else if (appState.interface.selectedDeviceIds.has(dev.id)) selectDevice(dev.id, true);
                    else selectDevice(dev.id);

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const movingDevices = expandFurnitureGroup([...appState.interface.selectedDeviceIds].map(id => appState.project.devices[id]).filter(Boolean));
                    const transformDrag=typeof CSS!=='undefined'&&CSS.supports?.('translate','1px 1px');
                    const initialPositions = movingDevices.map(item => ({
                        dev:item,
                        x:parseFloat(item.el.style.left) || 0,
                        y:parseFloat(item.el.style.top) || 0
                    }));
                    const dragBounds={left:Math.min(...initialPositions.map(p=>p.x)),top:Math.min(...initialPositions.map(p=>p.y)),right:Math.max(...initialPositions.map(p=>p.x+p.dev.el.offsetWidth)),bottom:Math.max(...initialPositions.map(p=>p.y+p.dev.el.offsetHeight))};
                    const origin = initialPositions[0] || { x:0, y:0 };
                    const baseY = Math.max(...initialPositions.map(position => position.y + position.dev.el.offsetHeight));
                    const ignored = new Set(movingDevices.map(item => item.id));
                    let isDragging = false, frame = 0, lastTime = 0, released = false;
                    let targets = initialPositions.map(p=>({...p}));
                    const visualPositions=new Map(initialPositions.map(p=>[p.dev.id,{x:p.x,y:p.y}]));
                    const initialById=new Map(initialPositions.map(p=>[p.dev.id,{x:p.x,y:p.y}]));
                    const discardPreviews=new Map();
                    let discardPreviewLayer=null;
                    let alignmentGuideLayer=null;
                    const alignmentTolerance=10;
                    function clearAlignmentGuides(remove=false){
                        if(!alignmentGuideLayer)return;
                        if(remove){alignmentGuideLayer.remove();alignmentGuideLayer=null;return;}
                        alignmentGuideLayer.querySelectorAll('i').forEach(line=>line.style.display='none');
                    }
                    function alignDragTargets(){
                        if(initialPositions.length===0)return;
                        const movingIds=new Set(initialPositions.map(item=>item.dev.id));
                        const stationary=Object.values(appState.project.devices).filter(item=>!movingIds.has(item.id)&&item.el?.isConnected);
                        const findSnap=(axis)=>{
                            const horizontal=axis==='x',candidates=[];
                            targets.forEach(p=>{
                                const size=horizontal?p.dev.el.offsetWidth:p.dev.el.offsetHeight,start=horizontal?p.x:p.y;
                                candidates.push({value:start,offset:0},{value:start+size/2,offset:size/2},{value:start+size,offset:size});
                            });
                            let best=null;
                            for(const p of targets)for(const other of stationary){
                                const start=horizontal?p.x:p.y,size=horizontal?p.dev.el.offsetWidth:p.dev.el.offsetHeight,otherStart=horizontal?parseFloat(other.el.style.left)||0:parseFloat(other.el.style.top)||0,otherSize=horizontal?other.el.offsetWidth:other.el.offsetHeight;
                                const own=[start,start+size/2,start+size],fixed=[otherStart,otherStart+otherSize/2,otherStart+otherSize];
                                for(const value of own)for(const target of fixed){const delta=target-value,distance=Math.abs(delta);if(distance<=alignmentTolerance/view.zoom&&(!best||distance<best.distance))best={delta,value:value+delta};}
                            }
                            return best;
                        };
                        let snapX=findSnap('x'),snapY=findSnap('y');
                        const sideInset=sceneSideInset(),bottomLimit=movingDevices.some(item=>WALL_LAMP_TYPES[item.type])?wallPlacementBottom():maxEquipmentBottom();
                        if(snapX&&targets.some(p=>p.x+snapX.delta<sideInset||p.x+snapX.delta+p.dev.el.offsetWidth>world.offsetWidth-sideInset))snapX=null;
                        if(snapY&&targets.some(p=>p.y+snapY.delta<0||p.y+snapY.delta+p.dev.el.offsetHeight>bottomLimit))snapY=null;
                        if(snapX)targets=targets.map(p=>({...p,x:p.x+snapX.delta}));
                        if(snapY)targets=targets.map(p=>({...p,y:p.y+snapY.delta}));
                        if(!snapX&&!snapY){clearAlignmentGuides();return;}
                        if(!alignmentGuideLayer){
                            alignmentGuideLayer=document.createElement('div');alignmentGuideLayer.className='alignment-guide-layer';alignmentGuideLayer.setAttribute('aria-hidden','true');
                            alignmentGuideLayer.innerHTML='<i class="alignment-guide-x"></i><i class="alignment-guide-y"></i>';document.body.appendChild(alignmentGuideLayer);
                        }
                        const bounds=canvas.getBoundingClientRect(),worldBounds=world.getBoundingClientRect(),gx=alignmentGuideLayer.querySelector('.alignment-guide-x'),gy=alignmentGuideLayer.querySelector('.alignment-guide-y');
                        if(snapX){const x=worldBounds.left+snapX.value*view.zoom;gx.style.display='block';gx.style.left=`${x}px`;gx.style.top=`${bounds.top}px`;gx.style.width='1px';gx.style.height=`${bounds.height}px`;gx.style.transform='none';}
                        else gx.style.display='none';
                        if(snapY){const y=worldBounds.top+snapY.value*view.zoom;gy.style.display='block';gy.style.left=`${bounds.left}px`;gy.style.top=`${y}px`;gy.style.width=`${bounds.width}px`;gy.style.height='1px';gy.style.transform='none';}
                        else gy.style.display='none';
                    }
                    const discardGrabOffsets=new Map(movingDevices.map(item=>{const rect=item.el.getBoundingClientRect();return [item.id,{dx:rect.left-startX,dy:rect.top-startY}];}));
                    function updateDiscardPreview(ev){
                        if(!isOverCatalog(ev)){clearDiscardPreview();return;}
                        document.body.classList.add('dragging-over-discard');
                        movingDevices.forEach(item=>{
                            let preview=discardPreviews.get(item.id);
                            if(!preview){
                                if(!discardPreviewLayer){
                                    discardPreviewLayer=document.createElement('div');discardPreviewLayer.className='equipment-preview-world';
                                    discardPreviewLayer.setAttribute('aria-hidden','true');discardPreviewLayer.inert=true;
                                    const worldStyle=getComputedStyle(world);
                                    for(const property of worldStyle)if(property.startsWith('--'))discardPreviewLayer.style.setProperty(property,worldStyle.getPropertyValue(property));
                                    document.body.appendChild(discardPreviewLayer);
                                }
                                const clone=item.el.cloneNode(true);
                                const originals=[item.el,...item.el.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
                                const previewIds=new Map();
                                copies.forEach((copy,i)=>{if(copy.id){const next='discard_'+copy.id;previewIds.set(copy.id,next);copy.id=next;}if(copy.tagName==='CANVAS')copy.getContext('2d')?.drawImage(originals[i],0,0);});
                                // Keep local SVG masks, gradients and clips pointing at the cloned definitions.
                                copies.forEach(copy=>{for(const attribute of [...copy.attributes]){
                                    let value=attribute.value;
                                    for(const [id,next]of previewIds){value=value.replaceAll('url(#'+id+')','url(#'+next+')');if(['href','xlink:href'].includes(attribute.name)&&value==='#'+id)value='#'+next;}
                                    if(value!==attribute.value)copy.setAttribute(attribute.name,value);
                                }});
                                clone.setAttribute('aria-hidden','true');clone.inert=true;
                                Object.assign(clone.style,{position:'fixed',margin:'0',width:item.el.offsetWidth+'px',height:item.el.offsetHeight+'px',translate:'none',transform:`scale(${view.zoom})`,transformOrigin:'0 0',zIndex:'10000',pointerEvents:'none',transition:'none'});
                                preview={clone,...discardGrabOffsets.get(item.id),visibility:item.el.style.visibility};
                                discardPreviews.set(item.id,preview);discardPreviewLayer.appendChild(clone);item.el.style.visibility='hidden';
                            }
                            preview.clone.style.left=ev.clientX+preview.dx+'px';preview.clone.style.top=ev.clientY+preview.dy+'px';
                        });
                    }
                    function clearDiscardPreview(){
                        document.body.classList.remove('dragging-over-discard');
                        discardPreviews.forEach((preview,id)=>{preview.clone.remove();const item=appState.project.devices[id];if(item)item.el.style.visibility=preview.visibility;});discardPreviews.clear();
                        discardPreviewLayer?.remove();discardPreviewLayer=null;
                    }

                    movingDevices.forEach(item=>item.cancelPlacementMotion?.());
                    const cancel = () => { document.body.classList.remove('equipment-drag-active');clearDiscardPreview();clearAlignmentGuides(true);cancelAnimationFrame(frame); frame=0;movingDevices.forEach(item=>{item.el.style.translate='none';delete item.dragVisualPosition;item.el.classList.remove('equipment-dragging','history-settling');}); };
                    movingDevices.forEach(item=>item.cancelPlacementMotion=cancel);
                    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
                    let falling=new Map();
                    const animate = now => {
                        frame=0;
                        if (!targets.every(p=>appState.project.devices[p.dev.id])) return;
                        const dt=Math.min(32,now-(lastTime||now-16));lastTime=now;
                        const blend=!released||reducedMotion?1:1-Math.exp(-dt/55);
                        const intermediate=targets.map(p=>{
                            const current=visualPositions.get(p.dev.id)||p,x=current.x,y=current.y;
                            const fall=falling.get(p.dev.id);
                            const progress=fall?Math.min(1,(now-fall.started)/fall.duration):0;
                            const nextY=fall?fall.y+(p.y-fall.y)*progress*progress:Math.abs(p.y-y)<.2?p.y:y+(p.y-y)*blend;
                            return {dev:p.dev,x:Math.abs(p.x-x)<.2?p.x:x+(p.x-x)*blend,y:nextY};
                        });
                        const resolved=intermediate;
                        let moved=false;
                        resolved.forEach(p=>{
                            const current=visualPositions.get(p.dev.id)||p,x=current.x,y=current.y;
                            moved ||= Math.abs(x-p.x)+Math.abs(y-p.y)>.01;
                            visualPositions.set(p.dev.id,{x:p.x,y:p.y});p.dev.dragVisualPosition={x:p.x,y:p.y};
                            if(transformDrag){const base=initialById.get(p.dev.id);p.dev.el.style.translate=`${p.x-base.x}px ${p.y-base.y}px`;}
                            else{p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;}
                        });
                        if(moved) updateCables(ignored);
                        const pending=resolved.some((p,i)=>Math.abs(p.x-targets[i].x)+Math.abs(p.y-targets[i].y)>.1);
                        if(pending&&moved) frame=requestAnimationFrame(animate);
                        else if(released){
                            targets.forEach(p=>{p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;p.dev.el.style.translate='none';delete p.dev.dragVisualPosition;p.dev.el.classList.remove('equipment-dragging','history-settling');});
                            updateCables();
                        }
                    };
                    const aim = (ev,settle=false) => {
                        const wallDragScale=movingDevices.length===1&&WALL_LAMP_TYPES[movingDevices[0].type]&&canvas.dataset.theme==='scene'?parseFloat(world.style.getPropertyValue('--room-far-scale'))||1:1;
                        const rawX=(ev.clientX-startX)/view.zoom/wallDragScale,rawY=(ev.clientY-startY)/view.zoom/wallDragScale;
                        const sideInset=sceneSideInset();
                        const dx=Math.max(sideInset-dragBounds.left,Math.min(settle?snapCoordinate(origin.x+rawX)-origin.x:rawX,world.offsetWidth-sideInset-dragBounds.right));
                        const bottomLimit=movingDevices.some(item=>WALL_LAMP_TYPES[item.type])?wallPlacementBottom():maxEquipmentBottom();
                        const dy=Math.max(-dragBounds.top,Math.min(settle?snapCoordinate(baseY+rawY)-baseY:rawY,bottomLimit-dragBounds.bottom));
                        targets=initialPositions.map(p=>{
                            const x=p.x+dx,y=p.y+dy;
                            const target=settle&&initialPositions.length===1?snapOnEquipment(p.dev,x,y):{x,y};
                            return {dev:p.dev,x:target.x,y:target.y};
                        });
                        if(!settle)alignDragTargets();else clearAlignmentGuides();
                        if(settle){
                            targets=settleEquipmentDrop(targets,ignored,initialPositions);
                            if(targets!==initialPositions){
                                const beforeGravity=targets;
                                targets=gravityDropTargets(targets,ignored);
                                if(!reducedMotion)falling=new Map(targets.filter((p,i)=>p.y-beforeGravity[i].y>1).map(p=>{
                                    const y=parseFloat(p.dev.el.style.top)||0;
                                    return [p.dev.id,{y,started:performance.now(),duration:Math.min(1150,540+(p.y-y)*.24)}];
                                }));
                            }
                        }
                        if(!frame){lastTime=0;frame=requestAnimationFrame(animate);}
                    };
                    const move = ev => {
                        if (touchHold && !touchReady) {
                            if (Math.hypot(ev.clientX-startX,ev.clientY-startY) > 8) {
                                clearTimeout(holdTimer); holdTimer = null; touchReady = false;
                            }
                            return;
                        }
                        ev.preventDefault();
                        isDragging = Math.hypot(ev.clientX-startX,ev.clientY-startY)>3||isDragging;
                        if(!isDragging)return;
                        document.body.classList.add('equipment-drag-active');
                            movingDevices.forEach(item=>item.el.classList.add('equipment-dragging'));
                        aim(ev);updateDiscardPreview(ev);
                        equipmentCatalog.classList.add('discard-ready');
                        discardZone.setAttribute('aria-hidden','false');
                        discardZone.querySelector('strong').textContent=isOverCatalog(ev)?'Solte para descartar':'Arraste aqui para descartar';
                        discardZone.querySelector('[data-discard-caption]').textContent=movingDevices.length>1?`Remover ${movingDevices.length} equipamentos e seus cabos.`:'Solte nesta área para remover o equipamento e seus cabos.';
                        equipmentCatalog.classList.toggle('return-drag-over',isOverCatalog(ev));
                    };
                    const up = ev => {
                        clearTimeout(holdTimer); holdTimer = null;
                        if(ev.cancelled){abortDrag();return;}
                        window.removeEventListener('pointermove',move);
                        window.removeEventListener('pointerup',up);
                        equipmentCatalog.classList.remove('return-drag-over','discard-ready');
                        discardZone.setAttribute('aria-hidden','true');
                        window.removeEventListener('blur',abortDrag);
                        window.removeEventListener('keydown',cancelWithEscape);
                        released=true;document.body.classList.remove('equipment-drag-active');clearDiscardPreview();clearAlignmentGuides(true);scheduleInspectorPosition();
                        if(isDragging)movingDevices.forEach(item=>item.el.classList.add('history-settling'));
                        if(isDragging&&isOverCatalog(ev)){
                            playUiSound('discard');showDiscardCloud(ev.clientX,ev.clientY);
                            cancel();recordDeletedDevices(initialPositions.map(p=>p.dev));initialPositions.forEach(p=>{if(appState.project.devices[p.dev.id])deleteDevice(p.dev,false);});
                        }else if(isDragging){aim(ev,true);recordMovement(initialPositions,targets);playUiSound('drop');}else cancel();
                    };

                    const abortDrag=()=>{
                        clearTimeout(holdTimer); holdTimer = null;
                        window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);
                        window.removeEventListener('blur',abortDrag);window.removeEventListener('keydown',cancelWithEscape);
                        cancel();
                        initialPositions.forEach(p=>{if(appState.project.devices[p.dev.id]){p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;}});
                        equipmentCatalog.classList.remove('return-drag-over','discard-ready');discardZone.setAttribute('aria-hidden','true');
                        updateCables();scheduleInspectorPosition();
                    };
                    const cancelWithEscape=event=>{if(event.key==='Escape'){event.preventDefault();abortDrag();}};
                    window.addEventListener('blur',abortDrag);
                    window.addEventListener('keydown',cancelWithEscape);

                    window.addEventListener('pointermove', move);
                    window.addEventListener('pointerup', up);
                });
            }

            dev.el.querySelectorAll('.eq-slider').forEach(sl => {
                sl.addEventListener('pointerdown', e => e.stopPropagation());
                sl.addEventListener('input', () => {
                    const band = parseInt(sl.dataset.band, 10);
                    const val = parseFloat(sl.value);
                    dev.state.eq[band] = val;
                    sl.title = `${EQ_BANDS[dev.type][band]} Hz · ${val} dB`;
                    const lbl = dev.el.querySelector(`.lbl-band-${band}`);
                    if (lbl) lbl.textContent = `${val > 0 ? '+' : ''}${val}dB`;
                    applyEqGains(dev);
                    if (appState.interface.selectedDeviceId === dev.id) {
                        const insp = document.getElementById(`lbl-eq-${band}`);
                        if (insp) insp.innerText = `${val > 0 ? '+' : ''}${val}dB`;
                        const slider = document.getElementById(`sl-eq-${band}`);
                        if (slider) slider.value = val;
                    }
                });
            });

            dev.el.querySelectorAll('[data-mixer-channel]').forEach(slider => {
                const channel = Number(slider.dataset.mixerChannel);
                slider.addEventListener('pointerdown', e => e.stopPropagation());
                slider.addEventListener('input', () => {
                    setMixerVolume(dev, channel, Number(slider.value));
                    if (appState.interface.selectedDeviceId === dev.id) {
                        const inspectorSlider = document.getElementById(`sl-mixer-${channel}`);
                        if (inspectorSlider) inspectorSlider.value = slider.value;
                    }
                });
            });

            dev.el.querySelectorAll('[data-channel-knob]').forEach(knob=>{
                const channel=Number(knob.dataset.channelKnob)-1;
                Hardware.bindKnob(knob,{get:()=>dev.state.channelVolumes?.[channel]??.8,set:value=>setHeadphoneAmp4Volume(dev,channel,value)});
            });

            dev.el.querySelectorAll('[data-switch-source]').forEach(button => {
                button.addEventListener('pointerdown', e => e.stopPropagation());
                button.addEventListener('click', e => {
                    e.stopPropagation();
                    dev.selectedSource = button.dataset.switchSource;
                    ['A', 'B'].forEach(source => {
                        const active = source === dev.selectedSource;
                        dev.el.querySelector(`[data-switch-source="${source}"]`)?.classList.toggle('active', active);
                        dev.el.querySelector(`[data-switch-source="${source}"]`)?.setAttribute('aria-pressed', String(active));
                        ['R', 'L'].forEach(channel => {
                            const route = dev.nodes[`route${source}${channel}`];
                            if (route) route.gain.setTargetAtTime(active ? 1 : 0, appState.audio.context.currentTime, 0.015);
                        });
                    });
                    updateCableFlows();
                });
            });

            updatePortGuidance();

            const pairBtn = dev.el.querySelector('.btn-bt-pair');
            if (pairBtn) {
                pairBtn.addEventListener('pointerdown', e => e.stopPropagation());
                pairBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    handlePairClick(dev);
                });
            }
        }

        function showDiscardCloud(x,y){
            const cloud=document.createElement('div');cloud.className='discard-cloud';cloud.setAttribute('aria-hidden','true');
            cloud.style.left=x+'px';cloud.style.top=y+'px';document.body.appendChild(cloud);
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            for(let i=0;i<(reduced?8:28);i++){
                const fine=i>=16;
                const puff=document.createElement('i'),angle=i/28*Math.PI*2+Math.random()*.5,distance=fine?38+Math.random()*35:16+Math.random()*35,size=fine?4+Math.random()*9:18+Math.random()*25;
                if(fine){puff.style.filter='blur(.4px)';puff.style.background='#d8d1c2';}
                puff.style.width=size+'px';puff.style.height=size+'px';cloud.appendChild(puff);
                puff.animate(reduced?[{opacity:.6},{opacity:0}]:[
                    {transform:'translate(-50%,-50%) scale(.25)',opacity:0},
                    {transform:`translate(calc(-50% + ${Math.cos(angle)*distance*.55}px),calc(-50% + ${Math.sin(angle)*distance*.55}px)) scale(1)`,opacity:.8,offset:.25},
                    {transform:`translate(calc(-50% + ${Math.cos(angle)*distance}px),calc(-50% + ${Math.sin(angle)*distance-14}px)) scale(1.35)`,opacity:0}
                ],{duration:reduced?140:360+Math.random()*150,delay:reduced?0:Math.random()*30,easing:'ease-out',fill:'both'});
            }
            setTimeout(()=>cloud.remove(),560);
        }
        function disposeDeviceRuntime(dev) {
            if(!dev||dev.runtimeDisposed)return;
            dev.runtimeDisposed=true;
            syncEquipmentAcoustics(performance.now(),true);
            disposeSignalHistory();

            // Stop asynchronous capture first. A pending getUserMedia request is
            // invalidated by stopMicCapture and its eventual stream is discarded.
            dev.stopMicCapture?.(false);
            dev.disposeCoverflow?.();
            dev.disposeLinear?.();
            dev.disposeStream?.();
            Hardware.dispose(dev);
            stopPowerOnRitual(dev);
            dev.cancelPlacementMotion?.();
            stopVinylNoise(dev);
            if(dev.syncRadio){
                stopReceiverRadioVoices(dev);
                dev.radioNoiseGain.disconnect();dev.radioNoiseFilter.disconnect();
                Object.values(dev.radioMusic).forEach(node=>node.disconnect());
                Object.values(dev.radioLine).forEach(node=>node.disconnect());
                dev.receiverInputNodes.forEach(node=>node.disconnect());
            }
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))stopSignalGenerator(dev);
            if(dev.type==='tapeDeck'){
                dev.state.playing=false;syncTapeHiss(dev);
                dev.tapeOscillators?.forEach(node=>{node.stop();node.disconnect();});
                dev.tapeNodes?.forEach(node=>node.disconnect());
            }
            stopFilePlayback(dev);
            dev.disposeMeters?.();
            dev.modelAudioNodes?.forEach(node=>node.disconnect());
            dev.voicingNodes?.forEach(node=>node.disconnect());
            dev.listeningGain?.disconnect();
            dev.auxSplitter?.disconnect();
            dev.audioBuffer=null;dev.mediaBlob=null;dev.mediaKey=null;
        }

        function deleteDevice(dev,recordHistory=false) {
            if (!dev || !appState.project.devices[dev.id]) return;
            if(recordHistory)recordDeletedDevices([dev]);
            if(dev.spotifyVinyl){if(spotifyPlayingTurntable===dev.id){spotifyPlayingTurntable=null;SpotifyCoverflow.setPlaybackVolume(0).catch(()=>{});SpotifyCoverflow.pauseAlbum().catch(()=>{});}dev.spotifyVinyl.turntableId=null;dev.spotifyVinyl.el.classList.remove('is-on-platter');}
            disposeDeviceRuntime(dev);

            if (appState.interface.pairingId === dev.id) clearPairing();
            if (dev.btPairedId) unpairDevice(dev);
            Object.values(appState.project.devices).forEach(other => {
                if (other.btPairedId === dev.id) unpairDevice(other);
            });

            for (let idx = appState.project.connections.length - 1; idx >= 0; idx--) {
                const connection = appState.project.connections[idx];
                const outPort = document.getElementById(connection.outId);
                const inPort = document.getElementById(connection.inId);
                if (outPort?.closest('.device-node')?.id === dev.id || inPort?.closest('.device-node')?.id === dev.id) {
                    removeConnection(idx);
                }
            }

            if (dev.btLinkEl) dev.btLinkEl.remove();
            if (dev.powerGain) {
                try { dev.powerGain.disconnect(); } catch (e) {}
            }
            dev.el.remove();
            appStateStore.actions.removeDevice(dev.id);
            updateMovementHistoryButtons();
            if (appState.interface.selectedDeviceIds.has(dev.id)) {
                const remaining = [...appState.interface.selectedDeviceIds].filter(id => id !== dev.id);
                if (appState.interface.selectedDeviceId === dev.id) setDeviceSelection(remaining);
                else {
                    appState.interface.selectedDeviceIds.delete(dev.id);
                    syncDeviceSelection();
                }
            }
            updateCables();
            updateBluetoothLinks();
            updateCableFlows();
        }

        function setPairingUi(dev, mode) {
            const indicator = dev.el.querySelector('.bt-indicator');
            const nameEl = dev.el.querySelector('.bt-device-name');
            const btn = dev.el.querySelector('.btn-bt-pair');
            if(btn){
                const label=mode==='search'?'Cancelar pareamento Bluetooth':mode==='linked'?'Desconectar Bluetooth':'Parear Bluetooth';
                btn.title=label;btn.setAttribute('aria-label',label);btn.dataset.pairing=mode;btn.setAttribute('aria-pressed',String(mode==='linked'));
            }
            if (mode === 'search') {
                dev.el.classList.add('pairing');
                if (indicator) {
                    indicator.classList.add('searching');
                    indicator.classList.remove('linked');
                }
                if (nameEl) nameEl.textContent = 'Procurando...';
            } else if (mode === 'linked') {
                dev.el.classList.remove('pairing');
                if (indicator) {
                    indicator.classList.remove('searching');
                    indicator.classList.add('linked');
                }
            } else {
                dev.el.classList.remove('pairing');
                if (indicator) {
                    indicator.classList.remove('searching', 'linked');
                }
                if (nameEl && BT_TX_TYPES.has(dev.type)) nameEl.textContent = 'Sem conexão';
            }
        }

        function handlePairClick(dev) {
            if(!BT_TX_TYPES.has(dev.type)&&!BT_HP_TYPES.has(dev.type))return;
            if (dev.btPairedId) {
                unpairDevice(dev);
                return;
            }
            if (appState.interface.pairingId === dev.id) {
                clearPairing();
                return;
            }
            if (appState.interface.pairingId) {
                const other = appState.project.devices[appState.interface.pairingId];
                if (other && canPair(other, dev)) {
                    pairDevices(other, dev);
                    return;
                }
            }
            if (BT_TX_TYPES.has(dev.type) || BT_HP_TYPES.has(dev.type)) {
                clearPairing();
                appStateStore.actions.setPairingId(dev.id);
                setPairingUi(dev, 'search');
            }
        }

        function canPair(a, b) {
            if(a?.state.damage||b?.state.damage)return false;
            if (!a || !b || a.id === b.id) return false;
            return (BT_TX_TYPES.has(a.type) && BT_HP_TYPES.has(b.type)) || (BT_HP_TYPES.has(a.type) && BT_TX_TYPES.has(b.type));
        }

        function clearPairing() {
            if (appState.interface.pairingId && appState.project.devices[appState.interface.pairingId] && !appState.project.devices[appState.interface.pairingId].btPairedId) {
                setPairingUi(appState.project.devices[appState.interface.pairingId], 'idle');
            }
            appStateStore.actions.setPairingId(null);
        }

        function pairDevices(a, b) {
            if(!canPair(a,b))return;
            const src = BT_TX_TYPES.has(a.type) ? a : b;
            const dest = HP_TYPES.has(a.type) ? a : b;
            unpairDevice(src);
            unpairDevice(dest);
            src.btPairedId = dest.id;
            dest.btPairedId = src.id;
            if (src.nodes.btOut && dest.nodes.in) {
                try { src.nodes.btOut.connect(dest.nodes.in); } catch (e) {}
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'bluetooth-link');
            svgLayer.appendChild(path);
            src.btLinkEl = path;
            dest.btLinkEl = path;
            const srcName = DEVICE_NAMES[src.type] || src.type;
            const destName = DEVICE_NAMES[dest.type] || dest.type;
            const srcLabel = src.el.querySelector('.bt-device-name');
            if (srcLabel) srcLabel.textContent = destName;
            setPairingUi(src, 'linked');
            setPairingUi(dest, 'linked');
            const destBtn = dest.el.querySelector('.btn-bt-pair');
            if (destBtn) destBtn.setAttribute('aria-pressed','true');
            clearPairing();
            src.el.classList.remove('pairing');
            dest.el.classList.remove('pairing');
            updateBluetoothLinks();
            updateCableFlows();
        }

        function unpairDevice(dev) {
            if (!dev || !dev.btPairedId) {
                setPairingUi(dev, 'idle');
                return;
            }
            const other = appState.project.devices[dev.btPairedId];
            const src = BT_TX_TYPES.has(dev.type) ? dev : other;
            const dest = HP_TYPES.has(dev.type) ? dev : other;
            if (src && dest && src.nodes.btOut && dest.nodes.in) {
                try { src.nodes.btOut.disconnect(dest.nodes.in); } catch (e) {}
            }
            if (dev.btLinkEl) {
                dev.btLinkEl.remove();
            }
            [dev, other].forEach(d => {
                if (!d) return;
                d.btPairedId = null;
                d.btLinkEl = null;
                setPairingUi(d, 'idle');
            });
            updateCableFlows();
        }

        function updateBluetoothLinks(affectedDeviceIds=null) {
            Object.values(appState.project.devices).forEach(dev => {
                if(affectedDeviceIds&&!affectedDeviceIds.has(dev.id)&&!affectedDeviceIds.has(dev.btPairedId))return;
                if (!dev.btLinkEl || !dev.btPairedId || !BT_TX_TYPES.has(dev.type)) return;
                const dest = appState.project.devices[dev.btPairedId];
                if (!dest) return;
                const r1 = dev.el.getBoundingClientRect();
                const r2 = dest.el.getBoundingClientRect();
                const p1 = screenToWorld(r1.left + r1.width / 2, r1.top + r1.height / 2);
                const p2 = screenToWorld(r2.left + r2.width / 2, r2.top + r2.height / 2);
                const midX = (p1.x + p2.x) / 2;
                const midY = Math.min(p1.y, p2.y) - 48;
                dev.btLinkEl.setAttribute('d', `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`);
            });
        }

        function hasRestorableSettings(dev) {
            if(controlAmpConfig(dev.type)||CUSTOM_POWER_AMPS[dev.type])return true;
            // Listening controls and live meters alone are not equipment settings.
            return SOURCE_TYPES.has(dev.type)&&!CAPTURE_INTERFACE_TYPES.has(dev.type)||EQ_TYPES.has(dev.type)||MIXER_TYPES.has(dev.type)
                ||SELECTOR_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type)
                ||ACTIVE_SPK.has(dev.type)||SUB_TYPES.has(dev.type)||dev.type==='hpKubaDisco2'
                ||['preamp','receiver','powerAmp','powerStereo','powerVintage','headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(dev.type);
        }
        async function restoreDeviceSettings(dev) {
            if(!appState.project.devices[dev.id]||!hasRestorableSettings(dev))return;
            if(appState.interface.selectedDeviceId!==dev.id)selectDevice(dev.id,true);
            const input=(id,value,eventType='input')=>{const element=document.getElementById(id);if(element){element.value=String(value);element.dispatchEvent(new Event(eventType,{bubbles:true}));}};
            let message='Configurações padrão restauradas.';
            if(dev.type==='integratedUtility')Object.assign(dev.state,{utilityLoudness:false,utilityMono:false});
            if(dev.type==='prePrecision')dev.state.precisionGain=0;
            if(dev.type==='preClassic')Object.assign(dev.state,CLASSIC_PREAMP_DEFAULTS);
            if(dev.type==='preGlass')Object.assign(dev.state,{glassLowCut:false,glassHighCut:false,glassLoudness:false});
            if(dev.type==='hpKubaDisco2'){dev.state.kubaWood='tauari';updateKubaAppearance(dev);}
            if(dev.syncRadio){dev.state.radioOn=false;dev.state.receiverInput='line1';dev.state.radioFrequency=88;dev.syncRadio();}
            if(controlAmpConfig(dev.type)){Object.assign(dev.state,{integratedSource:0,volume:.8,bass:0,treble:0,balance:0,direct:false,preMuted:false,preMono:false,preInvert:false,subLevel:.8,subFrequency:80});dev.applyIntegrated();}
            if(dev.type==='preamp'){Object.assign(dev.state,{preSource:1,volume:.8,bass:0,treble:0});dev.applyPreamp();}
            if(SIGNAL_GENERATOR_TYPES.has(dev.type)){stopSignalGenerator(dev);Object.assign(dev.state,{signalMode:'sine',signalFrequency:1000,signalChannel:'both',signalLevel:2,sweepSeconds:20});configureSignalGenerator(dev);}
            if(dev.type==='tapeDeck'){Object.assign(dev.state,{tapeHiss:35,tapeWow:35,tapeVolume:.8});dev.applyTapeSettings();}
            if(isListeningDevice(dev)){dev.state.solo=false;dev.state.muted=false;}
            if(SOURCE_TYPES.has(dev.type)){
                await setSourcePlaying(dev,false);
                dev.state.repeat=false;dev.fileOffset=0;dev.demoOffset=0;
                if(TURNTABLE_TYPES.has(dev.type)){
                    dev.state.vinylNoiseLevel='medium';
                    dev.resetLinear?.();
                    dev.ttSetPitch(0);
                    const previousMode=dev.state.tt.output;
                    dev.state.tt.output='line';
                    const canResetOutput=appState.project.connections.every(cable=>getPortCompatibility(document.getElementById(cable.outId),document.getElementById(cable.inId)).compatible);
                    dev.state.tt.output=previousMode;
                    if(canResetOutput)dev.ttSetOutput('line');
                    else message='Ajustes restaurados; saída PHONO mantida para preservar as conexões existentes.';
                }
            }
            dev.resetStream?.();
            if(dev.type==='receiver'){
                input('sl-balance',0);input('sl-vol',.8);input('sl-bass',0);input('sl-treble',0);dev.state.finish='vintage';dev.el.classList.remove('receiver-modern');
            }
            if(EQ_TYPES.has(dev.type)){
                GRAPHIC_EQ_FREQUENCIES.forEach((_,index)=>input(`sl-eq-${index}`,0));input('sl-eq-level',1);
                dev.el.querySelectorAll('[data-band]').forEach(slider=>{slider.title=`${GRAPHIC_EQ_FREQUENCIES[Number(slider.dataset.band)]} Hz · 0 dB`;});
            }
            if(MIXER_TYPES.has(dev.type))[0,1,2].forEach(channel=>setMixerVolume(dev,channel,.8));
            if(dev.type==='headphoneAmp4')[0,1,2,3].forEach(channel=>setHeadphoneAmp4Volume(dev,channel,.8));
            if(['headphoneAmp','headphoneAmpModern'].includes(dev.type))dev.setPhoneVolume(.8);
            if(CUSTOM_POWER_AMPS[dev.type]||['powerStereo','powerVintage'].includes(dev.type))['L','R'].forEach(channel=>dev.setChannelGain(channel,DEFAULT_POWER_GAIN));
            if(dev.type==='powerAmp')dev.setAmplifierVolume(1);
            if(ACTIVE_SPK.has(dev.type)||SUB_TYPES.has(dev.type))dev.setSpeakerVolume(.8);
            if(MATRIX_TYPES.has(dev.type)){dev.state.matrixInput=1;dev.state.matrixOutputs=[true,false,false,false];dev.updateMatrix();}
            if(SELECTOR_TYPES.has(dev.type))dev.el.querySelector('[data-switch-source="A"]').click();
            if(dev.type==='furnitureTable'){Object.assign(dev.state,{benchSurface:'wood',benchBackdrop:false,benchDecorations:[]});updateBenchAppearance(dev);}
            if(FURNITURE_TYPES[dev.type]){dev.state.material=furnitureMaterialFor(dev.type);dev.el.dataset.material=dev.state.material;if(FURNITURE_TYPES[dev.type].back){dev.state.hasBack=true;dev.el.dataset.back='true';}}
            if(dev.meters)dev.meters.clipUntil=0;
            if(appState.interface.selectedDeviceId===dev.id){selectDevice(dev.id,true);document.getElementById('restore-settings-status').textContent=message;}
            updateCableFlows();
        }

