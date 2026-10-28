/* Frontal wood-cabinet preamplifier: independent tone controls and channel matrix. */
        const CLASSIC_PREAMP_DEFAULTS={classicMode:2,classicBassL:0,classicBassR:0,classicTrebleL:0,classicTrebleR:0,classicMonitor:false,classicLowCut:false,classicHighCut:false};
        const CLASSIC_PREAMP_MODES=['Canal esquerdo','Mono','Estéreo','Canais invertidos','Canal direito'];
        const CLASSIC_PREAMP_SWITCHES=[['classicMonitor','Monitor de fita'],['classicLowCut','Filtro de graves'],['classicHighCut','Filtro de agudos']];
        function classicPreampMarkup(){
            const dial=(key,label,legend,kind='classic')=>`<label class="classic-dial classic-dial-${key}"><span class="classic-dial-scale" aria-hidden="true">${legend}</span><button type="button" ${kind==='source'?'data-pre-rotary':kind==='integrated'?`data-integrated-knob="${key}"`:`data-classic-knob="${key}"`} role="slider" aria-label="${label}" title="${label}"></button><span class="classic-dial-label">${label}</span></label>`;
            const lever=(key,label,legend)=>`<label class="classic-lever classic-lever-${key}"><span>${label}</span><small>${legend}</small><button type="button" ${key==='direct'?'data-integrated-direct':`data-classic-toggle="${key}"`} data-button-model="chromeLever" aria-label="${label}" title="${label}" aria-pressed="false"></button></label>`;
            return `<div class="device-header"><span>Pré · Console de Madeira</span></div><section class="classic-preamp-case"><div class="classic-preamp-panel">
                <i class="classic-screw screw-tl" aria-hidden="true"></i><i class="classic-screw screw-tr" aria-hidden="true"></i><i class="classic-screw screw-bl" aria-hidden="true"></i><i class="classic-screw screw-br" aria-hidden="true"></i>
                <div class="classic-preamp-heading">Stereo <span>control console</span><i class="device-led" aria-hidden="true"></i></div>
                ${dial('source','Fonte','AUX · TUNER · TAPE · PHONO','source')}${dial('volume','Volume','0 · · · · 10','integrated')}
                ${dial('classicMode','Modo de canais','L · MONO · STEREO · REV · R')}${dial('balance','Balanço L/R','L · · 0 · · R','integrated')}
                <span class="classic-tone-caption classic-treble-caption">TREBLE</span><span class="classic-tone-caption classic-bass-caption">BASS</span>
                ${dial('classicTrebleL','Agudos L','− · 0 · +')}${dial('classicTrebleR','Agudos R','− · 0 · +')}${dial('classicBassL','Graves L','− · 0 · +')}${dial('classicBassR','Graves R','− · 0 · +')}
                <div class="classic-switches">${lever('classicMonitor','Monitor de fita','SOURCE / TAPE')}${lever('direct','Bypass de tonalidade','TONE / BYPASS')}${lever('classicLowCut','Filtro de graves','FLAT / 35 Hz')}${lever('classicHighCut','Filtro de agudos','FLAT / 7 kHz')}</div>
                <label class="classic-power"><span>POWER</span><small>OFF / ON</small><div data-power-slot><button type="button" class="power-btn" title="Ligar ou desligar"></button></div></label>
                <div hidden><span class="pre-source-text"></span><span class="pre-volume-text"></span><span class="pre-status-text"></span>${controlAmpSources('preClassic').map((label,i)=>`<button type="button" data-integrated-source="${i}">${label}</button>`).join('')}<button data-pre-toggle="preMuted"></button><button data-pre-toggle="preInvert"></button></div>
            </div><div class="integrated-connections classic-preamp-connections">${['AUX','TUNER','TAPE','PHONO','PRE OUT'].map((label,i)=>`<div><small>${label}</small>${hardwarePair(i===4?'out':'in',i===4?'pre':i===3?'phono':'line'+i,i===3?'phono':'line')}</div>`).join('')}</div></section>`;
        }
        function configureClassicPreamp(dev){
            const ctx=appState.audio.context,filters=[];Object.assign(dev.state,CLASSIC_PREAMP_DEFAULTS);
            // This hook uses the existing preamp matrix, including mute/polarity/output power gates.
            dev.preMatrixCoefficient=(input,output)=>{
                const mode=dev.state.classicMode;
                const route=mode===0?(input===0?1:0):mode===1?.5:mode===3?(input!==output?1:0):mode===4?(input===1?1:0):input===output?1:0;
                const balance=dev.state.balance;return route*(output===0?1-Math.max(0,balance):1+Math.min(0,balance));
            };
            dev.integratedFilters.forEach(({treble,volume})=>{
                const highpass=ctx.createBiquadFilter(),lowpass=ctx.createBiquadFilter();highpass.type='highpass';lowpass.type='lowpass';highpass.Q.value=lowpass.Q.value=Math.SQRT1_2;
                treble.disconnect(volume);treble.connect(highpass);highpass.connect(lowpass);lowpass.connect(volume);filters.push({highpass,lowpass});(dev.modelAudioNodes||=[]).push(highpass,lowpass);
            });
            dev.classicFilters=filters;
            const apply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                const st=dev.state,finite=(value,fallback=0)=>Number.isFinite(value)?value:fallback;
                st.classicMode=Math.max(0,Math.min(4,Math.round(finite(st.classicMode,2))));
                for(const key of ['classicBassL','classicBassR','classicTrebleL','classicTrebleR'])st[key]=Math.max(-10,Math.min(10,finite(st[key])));
                CLASSIC_PREAMP_SWITCHES.forEach(([key])=>st[key]=!!st[key]);apply();
                const t=ctx.currentTime;
                if(st.classicMonitor)dev.integratedGates.forEach(({gate,index})=>gate.gain.setTargetAtTime(index===2?1:0,t,.02));
                dev.integratedFilters.forEach(({bass,treble,volume,ch})=>{volume.gain.setTargetAtTime(st.preMuted?0:st.volume,t,.02);bass.gain.setTargetAtTime(st.direct?0:st['classicBass'+ch],t,.025);treble.gain.setTargetAtTime(st.direct?0:st['classicTreble'+ch],t,.025);});
                filters.forEach(({highpass,lowpass})=>{highpass.frequency.setTargetAtTime(st.classicLowCut?35:.01,t,.03);lowpass.frequency.setTargetAtTime(st.classicHighCut?7000:ctx.sampleRate/2,t,.03);});
                dev.el.querySelectorAll('[data-classic-knob]').forEach(knob=>{const key=knob.dataset.classicKnob,value=st[key],min=key==='classicMode'?0:-10,max=key==='classicMode'?4:10;knob.style.setProperty('--integrated-angle',(-120+(value-min)/(max-min)*240)+'deg');knob.setAttribute('aria-valuenow',value);knob.setAttribute('aria-valuetext',key==='classicMode'?CLASSIC_PREAMP_MODES[value]:integratedSettingText('bass',value));});
                dev.el.querySelectorAll('[data-classic-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(st[button.dataset.classicToggle])));
                if(appState.interface.selectedDeviceId===dev.id)inspectorContent.querySelectorAll('[data-classic-setting]').forEach(input=>{
                    const key=input.dataset.classicSetting;input.value=st[key];const output=input.parentElement.querySelector('output');if(output)output.textContent=integratedSettingText('bass',st[key]);
                });
            };
            dev.setClassicPreamp=(key,value)=>{
                if(!Object.hasOwn(CLASSIC_PREAMP_DEFAULTS,key))return;
                dev.state[key]=value;dev.applyIntegrated();updateCableFlows();scheduleProjectSave();
            };
            dev.el.querySelectorAll('[data-classic-knob]').forEach(knob=>{const key=knob.dataset.classicKnob,mode=key==='classicMode';Hardware.bindKnob(knob,{get:()=>dev.state[key],set:value=>dev.setClassicPreamp(key,value),min:mode?0:-10,max:mode?4:10,step:mode?1:.5,format:value=>mode?CLASSIC_PREAMP_MODES[value]:integratedSettingText('bass',value)});});
            dev.el.querySelectorAll('[data-classic-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.classicToggle;dev.setClassicPreamp(key,!dev.state[key]);if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);}));
            dev.applyIntegrated();
        }
        function classicPreampInspector(dev){
            const st=dev.state;
            return `<section class="classic-preamp-inspector"><label>Modo de canais<select data-classic-setting="classicMode">${CLASSIC_PREAMP_MODES.map((label,i)=>`<option value="${i}" ${st.classicMode===i?'selected':''}>${label}</option>`).join('')}</select></label>
                ${['L','R'].map(ch=>`<fieldset><legend>${ch==='L'?'Canal esquerdo':'Canal direito'}</legend>${[['classicBass','Graves'],['classicTreble','Agudos']].map(([key,label])=>`<label>${label} <output>${integratedSettingText('bass',st[key+ch])}</output><input type="range" data-classic-setting="${key+ch}" min="-10" max="10" step=".5" value="${st[key+ch]}" aria-label="${label} ${ch}"></label>`).join('')}</fieldset>`).join('')}
                ${CLASSIC_PREAMP_SWITCHES.map(([key,label])=>`<button type="button" class="tt-insp-btn" data-classic-inspector-toggle="${key}" aria-pressed="${st[key]}">${label}</button>`).join('')}
                <p>O monitor de fita seleciona TAPE sem alterar a posição do seletor. Os filtros atuam abaixo de 35 Hz e acima de 7 kHz. O bypass preserva os filtros e ignora a tonalidade dos dois canais.</p>
                ${[['preMuted','Mute'],['preInvert','Inverter polaridade']].map(([key,label])=>`<button type="button" class="tt-insp-btn" data-pre-inspector-toggle="${key}" aria-pressed="${st[key]}">${label}</button>`).join('')}</section>`;
        }
        function bindClassicPreampInspector(dev){
            inspectorContent.querySelectorAll('[data-classic-setting]').forEach(input=>input.addEventListener('input',()=>{dev.setClassicPreamp(input.dataset.classicSetting,Number(input.value));const output=input.parentElement.querySelector('output');if(output)output.textContent=integratedSettingText('bass',Number(input.value));}));
            inspectorContent.querySelectorAll('[data-classic-inspector-toggle]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-classic-toggle="${button.dataset.classicInspectorToggle}"]`).click()));
        }
