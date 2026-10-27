/* Bench meters, tape deck, signal generator, and shared equipment helpers. */
        const EXTRA_AUDIO_TYPES=new Set(['preamp','benchMeter','benchMeterVintage','tapeDeck']);
        function extraPair(io,node,signal){const label=signal==='phono'?'phono':'de linha';return `<div class="extra-pair">${['L','R'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}"${signal?` data-signal="${signal}"`:''} title="${io==='in'?'Entrada':'Saída'} ${label} ${ch}"></div>`).join('')}</div>`;}
        const tapeVuAngle=vu=>-48+94*Math.min(1,Math.max(0,10**(vu/20)/10**(3/20)));
        function extraVu(calibrated=false){
            if(!calibrated)return `<div class="extra-vu-pair">${['L','R'].map((ch,i)=>`<div class="extra-vu"><span>−20　−10　0　+3</span><i data-live-vu="${i}"></i><b>VU · ${ch}</b></div>`).join('')}</div>`;
            const point=(angle,radius)=>({x:50+Math.sin(angle*Math.PI/180)*radius,y:62-Math.cos(angle*Math.PI/180)*radius});
            const ticks=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3].map(vu=>{
                const angle=tapeVuAngle(vu),a=point(angle,43),b=point(angle,47),text=point(angle,53);
                return `<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="${vu>0?'#a63326':'#3f4236'}" stroke-width=".8"/>${[-20,-10,0,3].includes(vu)?`<text x="${text.x}" y="${text.y}" fill="${vu>0?'#a63326':'#333b2d'}" text-anchor="middle" dominant-baseline="middle" font-size="6" font-family="Inter,sans-serif" font-weight="700">${vu>0?'+':''}${vu}</text>`:''}`;
            }).join('');
            return `<div class="extra-vu-pair">${['L','R'].map((ch,index)=>`<div class="extra-vu calibrated-tape-vu" title="VU ${ch} · 0 VU = −18 dBFS, referência senoidal"><svg viewBox="0 0 100 70" aria-label="VU ${ch}, referência de zero em menos 18 dBFS"><path d="M${point(-48,45).x} ${point(-48,45).y} A45 45 0 0 1 ${point(46,45).x} ${point(46,45).y}" fill="none" stroke="#6e705b" stroke-width=".7"/>${ticks}<text x="85" y="58" text-anchor="end" fill="#333b2d" font-family="Inter,sans-serif" font-size="7" font-weight="700">VU · ${ch}</text><line x1="50" y1="62" x2="50" y2="19" stroke="#29352b" stroke-width="1.1" data-live-vu="${index}" transform="rotate(-48 50 62)"/><circle cx="50" cy="62" r="2.1" fill="#303b2d"/></svg></div>`).join('')}</div>`;
        }

        function benchLcdMarkup(){
            return `<div class="bench-lcd"><header><span>VU · REF −18 dBFS</span><b data-bench-clip>CLIP</b></header>${['L','R'].map((ch,index)=>`<div class="bench-lcd-channel"><b>${ch}</b><div class="bench-lcd-bar" data-bench-lcd-bar="${index}" role="meter" aria-label="VU ${ch}" aria-valuemin="-20" aria-valuemax="3">${Array.from({length:46},(_,i)=>`<i class="${i>=40?'is-headroom':''}"></i>`).join('')}</div><output data-bench-lcd-value="${index}">−∞</output></div>`).join('')}<div class="bench-lcd-scale">${[-20,-10,-5,0,3].map(value=>`<span style="left:${(value+20)/23*100}%">${value>0?'+':''}${value}</span>`).join('')}</div><footer>STEREO LEVEL · VU</footer></div>`;
        }
        function updateCalibratedVuEnvelope(dev,elapsed){
            dev.vuEnvelope||=[0,0];
            [0,1].forEach(channel=>{
                const samples=dev.meters?.channels[channel]?.[0]?.data;let rectified=0;
                if(dev.powered&&state.audioCtx.state==='running'&&samples){for(const sample of samples)rectified+=Math.abs(sample);rectified=rectified/samples.length*Math.PI/2;}
                dev.vuEnvelope[channel]+=(rectified-dev.vuEnvelope[channel])*(1-Math.exp(-elapsed/.065));
            });
        }
        function updateBenchLcd(dev,now){
            const screen=dev.el.querySelector('.bench-lcd');if(!screen)return;screen.classList.toggle('is-off',!dev.powered);
            [0,1].forEach(channel=>{
                const vu=audioDb(dev.vuEnvelope?.[channel]||0)+18,silent=(dev.vuEnvelope?.[channel]||0)<.000001,lit=dev.powered?Math.round(Math.max(0,Math.min(1,(vu+20)/23))*46):0;
                const bar=screen.querySelector(`[data-bench-lcd-bar="${channel}"]`);
                [...bar.children].forEach((segment,index)=>segment.classList.toggle('is-lit',index<lit));
                const value=screen.querySelector(`[data-bench-lcd-value="${channel}"]`);value.textContent=!dev.powered?'—':silent?'−∞':(vu>0?'+':'')+vu.toFixed(1);
                bar.setAttribute('aria-valuenow',String(Math.max(-20,Math.min(3,vu))));bar.setAttribute('aria-valuetext',!dev.powered?'Desligado':silent?'Sem sinal':vu.toFixed(1)+' VU, zero em menos 18 dBFS');
            });
            screen.querySelector('[data-bench-clip]').classList.toggle('is-clipping',dev.powered&&now<(dev.meters?.clipUntil||0));
        }

        function tapeDeckMarkup(){
            const reelMetal='<svg viewBox="0 0 180 180" aria-hidden="true"><path fill="var(--tape-metal)" stroke="#edf0ea" stroke-width=".8" fill-rule="evenodd" d="M90 3 A87 87 0 1 1 90 177 A87 87 0 1 1 90 3 Z M47.68 31.75 A72 72 0 0 1 132.32 31.75 L115.27 55.21 A43 43 0 0 0 64.73 55.21 Z M161.61 82.47 A72 72 0 0 1 119.29 155.78 L107.49 129.28 A43 43 0 0 0 132.76 85.51 Z M60.71 155.78 A72 72 0 0 1 18.39 82.47 L47.24 85.51 A43 43 0 0 0 72.51 129.28 Z"/><circle cx="90" cy="90" r="83" fill="none" stroke="#89918e" stroke-width=".8"/><circle cx="90" cy="90" r="79.5" fill="none" stroke="#eef0e9" stroke-width=".5"/><circle cx="90" cy="90" r="29" fill="#929b96" stroke="#e6e9e2" stroke-width="1.3"/></svg>';
            const keys=[
                ['data-tape-back','Retroceder dez segundos','<path d="M10 5 2 12l8 7V5Zm10 0-8 7 8 7V5Z"/>'],
                ['data-source-play','Reproduzir ou pausar fita','<path class="tape-symbol-play" d="M7 4v16l13-8Z"/><path class="tape-symbol-pause" d="M6 5h5v14H6zM15 5h5v14h-5z"/>'],
                ['data-tape-stop','Parar e rebobinar','<path d="M7 7h10v10H7z"/>'],
                ['data-tape-forward','Avançar dez segundos','<path d="m3 5 8 7-8 7V5Zm10 0 8 7-8 7V5Z"/>']
            ];
            return `<div class="device-header"><span>Tape deck · rolo aberto</span></div>
                <section class="tape-face">
                    <header><strong>TAPE DECK <small>STEREO</small></strong><span>OPEN REEL · TWO TRACK</span></header>
                    ${['tl','tr','bl','br'].map(corner=>`<i class="tape-screw tape-screw-${corner}" aria-hidden="true"></i>`).join('')}
                    <div class="tape-reels">${[0,1].map(i=>`<div class="tape-reel reel-${i}" data-lighting-relief="11" data-lighting-shape="round"><div class="tape-winding"></div><div class="reel-metal">${reelMetal}<b></b></div></div>`).join('')}</div>
                    <div class="tape-threading" aria-label="Fita contornando as guias e passando pelos cabeçotes">
                        <svg viewBox="0 0 462 274" aria-hidden="true"><path d="M39.4 147.1 L58.2 240.8 A9 9 0 0 0 67 248 H395 A9 9 0 0 0 404 240 L414.7 139.6" fill="none" stroke="#3d291e" stroke-width="2.2"/><path d="M39.4 147.1 L58.2 240.8 M404 240 L414.7 139.6" fill="none" stroke="#ad825b" stroke-width=".5"/></svg>
                        <i class="tape-guide tape-guide-left" data-lighting-relief="4" data-lighting-shape="round"></i><i class="tape-guide tape-guide-right" data-lighting-relief="4" data-lighting-shape="round"></i>
                        <div class="tape-head-cover" data-lighting-relief="6"><span>ANALOG <b>STEREO</b></span><small>PRECISION TAPE TRANSPORT</small></div>
                    </div>
                    <div class="tape-control-panel">
                        <div class="tape-transport"><div class="tape-readout"><output data-tape-counter aria-label="Tempo da fita">00:00</output><span class="tape-play-status"><i aria-hidden="true"></i>PLAY</span></div><div class="tape-keys">${keys.map(([attr,label,symbol])=>`<button type="button" ${attr} aria-label="${label}"${attr==='data-source-play'?' aria-pressed="false"':''}><svg class="tape-transport-icon" viewBox="0 0 26 24" aria-hidden="true">${symbol}</svg></button>`).join('')}</div></div>
                        ${extraVu(true)}
                        <div class="tape-bottom"><div class="extra-io"><small>LINE OUT <span>L / R</span></small>${extraPair('out','out')}</div><label class="tape-level"><button class="receiver-dial" data-tape-level aria-label="Nível de saída" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80"></button><small>OUTPUT</small></label><div class="extra-power" data-power-slot><small>POWER</small><button class="power-btn" aria-label="Ligar ou desligar Tape Deck"></button></div></div>
                    </div>
                </section>`;
        }

        function extraDeviceMarkup(type){
            const power='<div class="extra-power" data-power-slot><button class="power-btn"></button></div>';
            if(type==='preamp')return `<div class="device-header"><span>Pré · Slim</span></div><section class="extra-rack preamp-face"><div class="preamp-inputs"><strong>PRÉ-AMPLIFICADOR</strong><div class="preamp-sources">${['AUX','CD','TAPE','PHONO'].map((name,i)=>`<div><button data-pre-source="${i+1}">${name}</button>${extraPair('in','in'+(i+1),i===3?'phono':undefined)}</div>`).join('')}</div></div><div class="preamp-knobs">${[['volume','VOLUME'],['bass','GRAVES'],['treble','AGUDOS']].map(([key,label])=>`<label><button class="receiver-dial" data-pre-knob="${key}" aria-label="${label}" role="slider" aria-valuemin="${key==='volume'?0:-12}" aria-valuemax="${key==='volume'?100:12}"></button><span>${label}</span></label>`).join('')}</div><div class="extra-io"><small>LINE OUT</small>${extraPair('out','out')}</div>${power}</section>`;
            if(BENCH_METER_TYPES.has(type))return `<div class="device-header"><span>${type==='benchMeterVintage'?'Medidor de bancada vintage':'Medidor de áudio de bancada'}</span></div><section class="extra-rack bench-face"><span class="bench-handle is-left" aria-hidden="true"><i></i></span><span class="bench-handle is-right" aria-hidden="true"><i></i></span><div class="extra-io"><small>LINE IN</small>${extraPair('in','in')}<small>LINE OUT</small>${extraPair('out','out')}</div>${type==='benchMeterVintage'?extraVu(true):benchLcdMarkup()}<div class="bench-screen"><canvas data-bench-spectrum width="360" height="72" aria-label="Espectro real dos canais L e R"></canvas><div class="correlation-scale"><span>−1</span><div><i data-correlation-dot></i></div><span>+1</span></div><output data-correlation-value>SEM SINAL</output></div>${power}</section>`;
            return tapeDeckMarkup();
        }
        function setupExtraRouting(dev){
            const context=state.audioCtx;
            if(dev.type==='preamp'){
                Object.assign(dev.state,{preSource:1,volume:.8,bass:0,treble:0});dev.preGates=[];dev.preFilters=[];
                ['L','R'].forEach(ch=>{
                    const summer=context.createGain(),low=context.createBiquadFilter(),high=context.createBiquadFilter(),volume=context.createGain(),power=context.createGain();
                    low.type='lowshelf';low.frequency.value=120;high.type='highshelf';high.frequency.value=4000;
                    summer.connect(low);low.connect(high);high.connect(volume);volume.connect(power);dev.nodes['out'+ch]=power;
                    for(let input=1;input<=4;input++){
                        const node=dev.nodes['in'+input+ch]=context.createGain(),gate=context.createGain();
                        if(input===4){
                            // PHONO: equalização RIAA de reprodução (inverso da saída PHONO do toca-discos) + ganho de nível phono para linha.
                            const riaaLow=context.createBiquadFilter(),riaaHigh=context.createBiquadFilter(),riaaGain=context.createGain();
                            riaaLow.type='lowshelf';riaaLow.frequency.value=120;riaaLow.gain.value=9;
                            riaaHigh.type='highshelf';riaaHigh.frequency.value=2122;riaaHigh.gain.value=-9;riaaGain.gain.value=ELECTRICAL_MODEL.phonoGain;
                            node.connect(riaaLow);riaaLow.connect(riaaHigh);riaaHigh.connect(riaaGain);connectPhonoPlayback(dev,riaaGain,gate);
                        }else node.connect(gate);
                        gate.connect(summer);dev.preGates.push({gate,input});
                    }
                    dev.preFilters.push({low,high,volume});(dev.powerNodes||=[]).push(power);
                });
                dev.applyPreamp=()=>{
                    const time=context.currentTime;
                    dev.preGates.forEach(({gate,input})=>gate.gain.setTargetAtTime(input===dev.state.preSource?1:0,time,.015));
                    dev.preFilters.forEach(({low,high,volume})=>{low.gain.setTargetAtTime(dev.state.bass,time,.02);high.gain.setTargetAtTime(dev.state.treble,time,.02);volume.gain.setTargetAtTime(dev.state.volume,time,.015);});
                    dev.el.querySelectorAll('[data-pre-source]').forEach(button=>{const selected=Number(button.dataset.preSource)===dev.state.preSource;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
                    dev.el.querySelectorAll('[data-pre-knob]').forEach(knob=>{
                        const key=knob.dataset.preKnob,fraction=key==='volume'?dev.state.volume:(dev.state[key]+12)/24;
                        knob.style.setProperty('--dial-angle',`${-135+fraction*270}deg`);knob.style.setProperty('--knob-angle',`${-135+fraction*270}deg`);knob.setAttribute('aria-valuenow',key==='volume'?Math.round(dev.state.volume*100):dev.state[key]);
                    });
                };dev.applyPreamp();
            }else if(BENCH_METER_TYPES.has(dev.type)){
                ['L','R'].forEach(ch=>{dev.nodes['in'+ch]=context.createGain();dev.nodes['out'+ch]=context.createGain();dev.nodes['in'+ch].connect(dev.nodes['out'+ch]);(dev.powerNodes||=[]).push(dev.nodes['out'+ch]);});
            }
        }
        function setupTapeAudio(dev){
            const context=state.audioCtx;Object.assign(dev.state,{tapeHiss:35,tapeWow:35,tapeVolume:.8});
            dev.tapeNodes=[];dev.tapeDepths=[];dev.tapeLevels=[];
            const wow=context.createOscillator(),flutter=context.createOscillator();wow.frequency.value=.55;flutter.frequency.value=6.3;
            ['L','R'].forEach(ch=>{
                const gen=dev.nodes['gen'+ch],power=dev.powerNodes[ch==='L'?1:0],delay=context.createDelay(.05),low=context.createBiquadFilter(),volume=context.createGain(),depth=context.createGain(),fine=context.createGain();
                gen.disconnect(power);delay.delayTime.value=.008;low.type='lowpass';low.frequency.value=15000;low.Q.value=.55;
                gen.connect(delay);delay.connect(low);low.connect(volume);volume.connect(power);
                depth.gain.value=.00045*.35;fine.gain.value=.000025*.35;wow.connect(depth);depth.connect(delay.delayTime);flutter.connect(fine);fine.connect(delay.delayTime);
                dev.tapeDepths.push(depth,fine);dev.tapeLevels.push(volume);dev.tapeNodes.push(delay,low,volume,depth,fine);
            });
            wow.start();flutter.start();dev.tapeOscillators=[wow,flutter];
            dev.applyTapeSettings=()=>{
                dev.tapeDepths.forEach((gain,index)=>gain.gain.setTargetAtTime((index%2?.000025:.00045)*dev.state.tapeWow/100,context.currentTime,.04));
                dev.tapeLevels.forEach(gain=>gain.gain.setTargetAtTime(dev.state.tapeVolume,context.currentTime,.02));
                dev.tapeHiss?.gain.gain.setTargetAtTime(dev.state.tapeHiss*.0003,context.currentTime,.03);
                const knob=dev.el.querySelector('[data-tape-level]');if(knob){knob.style.setProperty('--dial-angle',`${-135+dev.state.tapeVolume*270}deg`);knob.setAttribute('aria-valuenow',Math.round(dev.state.tapeVolume*100));}
            };dev.applyTapeSettings();
        }
        let tapeHissBuffer=null;
        function syncTapeHiss(dev){
            if(dev.type!=='tapeDeck')return;
            if(!dev.state.playing||!dev.powered){
                const voice=dev.tapeHiss;dev.tapeHiss=null;if(voice){const t=state.audioCtx.currentTime;voice.gain.gain.cancelAndHoldAtTime(t);voice.gain.gain.linearRampToValueAtTime(0,t+.012);voice.source.stop(t+.015);}return;
            }
            if(dev.tapeHiss)return;
            const context=state.audioCtx;
            if(!tapeHissBuffer){tapeHissBuffer=context.createBuffer(2,context.sampleRate*7,context.sampleRate);for(let ch=0;ch<2;ch++){const data=tapeHissBuffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.35;for(let i=0;i<256;i++){data[i]*=i/256;data[data.length-1-i]*=i/256;}}}
            const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter(),split=context.createChannelSplitter(2);
            source.buffer=tapeHissBuffer;source.loop=true;filter.type='highpass';filter.frequency.value=450;
            gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(dev.state.tapeHiss*.0003,context.currentTime+.035);
            source.connect(filter);filter.connect(gain);gain.connect(split);split.connect(dev.nodes.genL,0);split.connect(dev.nodes.genR,1);
            source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();split.disconnect();};source.start(0,Math.random()*5);dev.tapeHiss={source,gain};
        }
        function extraInspectorHtml(dev){
            if(dev.type==='preamp')return `<section class="flex flex-col gap-4"><label class="text-sm text-gray-300">Fonte<select id="preamp-source" class="w-full bg-gray-800 border border-gray-600 p-2 rounded">${['AUX','CD','TAPE','PHONO'].map((name,i)=>`<option value="${i+1}" ${dev.state.preSource===i+1?'selected':''}>${name}</option>`).join('')}</select></label>${[['volume','Volume',0,100,Math.round(dev.state.volume*100)],['bass','Graves (dB)',-12,12,dev.state.bass],['treble','Agudos (dB)',-12,12,dev.state.treble]].map(([key,label,min,max,value])=>`<label class="text-sm text-gray-300">${label} <output id="preamp-value-${key}">${value}</output><input type="range" data-preamp-setting="${key}" min="${min}" max="${max}" step="${key==='volume'?1:.5}" value="${value}"></label>`).join('')}<p class="text-xs text-gray-400">AUX, CD e TAPE recebem linha; PHONO recebe a cápsula MM do toca-discos. Ligue LINE OUT ao amplificador de potência. Os canais L/R permanecem separados.</p></section>`;
            if(BENCH_METER_TYPES.has(dev.type))return '<p class="text-sm text-gray-400">Ligue em série entre equipamentos de linha: entrada → medidor → saída. VU indica nível; correlação próxima de +1 indica canais semelhantes e valores negativos indicam oposição de fase. Sem sinal, a correlação não é calculada. Os VUs usam 0 VU = −18 dBFS como referência senoidal; +3 VU não indica saturação digital.</p><div class="text-sm text-gray-300">Correlação estéreo: <output id="bench-inspector-correlation">SEM SINAL</output></div>';
            if(dev.type==='tapeDeck')return `<section class="flex flex-col gap-4">${[['tapeVolume','Nível de saída',Math.round(dev.state.tapeVolume*100)]].map(([key,label,value])=>`<label class="text-sm text-gray-300">${label} <output id="tape-value-${key}">${value}%</output><input type="range" data-tape-setting="${key}" min="0" max="100" step="1" value="${value}"></label>`).join('')}${[['tapeHiss','Ruído de fita'],['tapeWow','Oscilação da fita']].map(([key,label])=>`<div class="flex flex-col gap-3"><span class="text-sm text-gray-300">${label}</span><div class="noise-level-buttons ${key==='tapeWow'?'noise-level-buttons--three':''}" role="group" aria-label="${label}">${(key==='tapeHiss'?[[0,'none'],[15,'low'],[35,'medium'],[65,'high']]:[[15,'low'],[35,'medium'],[65,'high']]).map(([value,level])=>{const selected=dev.state[key]===value;const name=key==='tapeWow'?`Oscilação ${level==='low'?'baixa':level==='medium'?'média':'alta'}`:level==='none'?'Sem ruído':`Ruído ${level==='low'?'baixo':level==='medium'?'médio':'alto'}`;return `<button type="button" class="tt-insp-btn noise-level-button ${selected?'is-on':''}" data-tape-preset="${key}" data-value="${value}" aria-label="${name}" title="${name}" aria-pressed="${selected}">${key==='tapeWow'?tapeWowLevelIcon(level):noiseLevelIcon(level)}</button>`}).join('')}</div></div>`).join('')}</section>`;
            return '';
        }
        function bindExtraInspector(dev){
            inspectorContent.querySelectorAll('[data-tape-preset]').forEach(button=>button.addEventListener('click',()=>{
                const key=button.dataset.tapePreset;dev.state[key]=Number(button.dataset.value);dev.applyTapeSettings();
                inspectorContent.querySelectorAll(`[data-tape-preset="${key}"]`).forEach(item=>{const selected=item===button;item.classList.toggle('is-on',selected);item.setAttribute('aria-pressed',String(selected));});
            }));
            document.getElementById('preamp-source')?.addEventListener('change',event=>{dev.state.preSource=Number(event.target.value);dev.applyPreamp();updateCableFlows();});
            inspectorContent.querySelectorAll('[data-preamp-setting]').forEach(input=>input.addEventListener('input',()=>{
                const key=input.dataset.preampSetting;dev.state[key]=Number(input.value)/(key==='volume'?100:1);dev.applyPreamp();document.getElementById('preamp-value-'+key).textContent=input.value;
            }));
            inspectorContent.querySelectorAll('[data-tape-setting]').forEach(input=>input.addEventListener('input',()=>{
                const key=input.dataset.tapeSetting;dev.state[key]=Number(input.value)/(key==='tapeVolume'?100:1);dev.applyTapeSettings();document.getElementById('tape-value-'+key).textContent=input.value+'%';
            }));
        }
        function bindExtraDevice(dev){
            const knobDrag=(knob,get,set,min,max)=>Hardware.bindKnob(knob,{get,set,min,max});
            if(dev.type==='preamp'){
                dev.el.querySelectorAll('[data-pre-source]').forEach(button=>button.onclick=()=>{dev.state.preSource=Number(button.dataset.preSource);dev.applyPreamp();updateCableFlows();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);});
                dev.el.querySelectorAll('[data-pre-knob]').forEach(knob=>{const key=knob.dataset.preKnob;knobDrag(knob,()=>dev.state[key],value=>{dev.state[key]=value;dev.applyPreamp();const input=document.querySelector(`[data-preamp-setting="${key}"]`);if(input&&state.selectedDeviceId===dev.id){input.value=key==='volume'?Math.round(value*100):value.toFixed(1);document.getElementById('preamp-value-'+key).textContent=input.value;}},key==='volume'?0:-12,key==='volume'?1:12);});
            }
            if(dev.type==='tapeDeck'){
                dev.el.querySelector('[data-tape-back]').onclick=()=>{const position=tapePosition(dev);if(dev.audioBuffer)seekSource(dev,position-10);else{dev.demoOffset=Math.max(0,position-10);dev.demoStartedAt=state.audioCtx.currentTime;}};
                dev.el.querySelector('[data-tape-forward]').onclick=()=>{const position=tapePosition(dev);if(dev.audioBuffer)seekSource(dev,position+10);else{dev.demoOffset=Math.min(180,position+10);dev.demoStartedAt=state.audioCtx.currentTime;}};
                dev.el.querySelector('[data-tape-stop]').onclick=async()=>{await setSourcePlaying(dev,false);dev.fileOffset=0;dev.demoOffset=0;};
                knobDrag(dev.el.querySelector('[data-tape-level]'),()=>dev.state.tapeVolume,value=>{dev.state.tapeVolume=value;dev.applyTapeSettings();const input=document.querySelector('[data-tape-setting="tapeVolume"]');if(input&&state.selectedDeviceId===dev.id){input.value=Math.round(value*100);document.getElementById('tape-value-tapeVolume').textContent=input.value+'%';}},0,1);
            }
        }
        function tapePosition(dev){return dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?state.audioCtx.currentTime-dev.demoStartedAt:0);}
        const needleMotion=new WeakMap();
        function dampedNeedle(needle,target,now,rest){
            const previous=needleMotion.get(needle)||{angle:rest,time:now-16};
            const elapsed=Math.max(0,Math.min(.25,(now-previous.time)/1000));
            const response=target>previous.angle?.14:.42;
            const angle=matchMedia('(prefers-reduced-motion: reduce)').matches?target:previous.angle+(target-previous.angle)*(1-Math.exp(-elapsed/response));
            needleMotion.set(needle,{angle,time:now});return angle;
        }
        let lastTransportFrame;
        function updateTransportMotion(now){
            const elapsed=lastTransportFrame==null?0:Math.max(0,Math.min(.1,(now-lastTransportFrame)/1000));lastTransportFrame=now;
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            Object.values(state.devices).forEach(dev=>{
                if(dev.type==='tapeDeck'&&dev.meters?.visible!==false)updateTapeReels(dev,tapePosition(dev),elapsed,isSourceRunning(dev));
                if(!TURNTABLE_TYPES.has(dev.type))return;
                const running=dev.powered&&dev.state.tt?.running;
                const target=running?(dev.type==='turntableLinear'?(dev.state.tt.speed===45?45:100/3)*6*(1+dev.state.tt.pitch*.03):200*(dev.ttRate?.()||1)):0;
                const speed=dev.platterSpeed||0,response=running?.18:.65;
                let next=reduced?0:target+(speed-target)*Math.exp(-elapsed/response);
                if(!running&&next<.1)next=0;
                // Integrate speed to preserve the platter's phase through stop/start.
                const travel=reduced?0:target*elapsed+(speed-target)*response*(1-Math.exp(-elapsed/response));
                dev.platterSpeed=next;dev.platterAngle=((dev.platterAngle||0)+travel)%360;
                dev.el.style.setProperty('--tt-strobe-offset',(dev.platterAngle/360*80).toFixed(3)+'px');
                dev.updateLinearMotion?.(now,elapsed,reduced);
            });
        }
        function updateTapeReels(dev,seconds,elapsed,running){
            const duration=dev.audioBuffer?.duration||180;
            const target=Math.max(0,Math.min(duration,seconds));
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            const previous=dev.tapeVisualPosition??target;
            const difference=target-previous;
            const visual=reduced||Math.abs(difference)<.03?target:previous+difference*(1-Math.exp(-elapsed/.22));
            dev.tapeVisualPosition=visual;
            // Cache stationary geometry. Rotating a flange never invalidates the lighting cache.
            const parts=dev.tapeVisualParts||=(Array.from(dev.el.querySelectorAll('.tape-reel'),reel=>({
                winding:reel.querySelector('.tape-winding'),metal:reel.querySelector('.reel-metal'),radius:null
            })));
            const radii=[Math.sqrt(28**2+(79**2-28**2)*(1-visual/duration)),Math.sqrt(28**2+(79**2-28**2)*visual/duration)];
            dev.tapeReelAngles||=[0,0];dev.tapeReelSpeeds||=[0,0];
            const seeking=Math.abs(visual-previous-(running?elapsed:0))>.07;
            const transportRate=seeking?Math.max(-55,Math.min(55,(visual-previous)/Math.max(.001,elapsed))):running?1:0;
            parts.forEach((part,index)=>{
                const radius=radii[index];
                if(part.radius===null||Math.abs(radius-part.radius)>.025){
                    part.winding.style.transform=`scale(${(radius/79).toFixed(4)})`;part.radius=radius;
                }
                const speed=dev.tapeReelSpeeds[index],goal=reduced?0:transportRate*130*60/radius,response=(running||seeking) ? .18 : .38;
                const decay=Math.exp(-elapsed/response);
                const next=Math.abs(goal+(speed-goal)*decay)<.08?0:goal+(speed-goal)*decay;
                const travel=reduced?0:goal*elapsed+(speed-goal)*response*(1-decay);
                dev.tapeReelSpeeds[index]=next;
                if(Math.abs(travel)>.0001){
                    dev.tapeReelAngles[index]=(dev.tapeReelAngles[index]+travel)%360;
                    part.metal.style.transform=`rotate(${dev.tapeReelAngles[index].toFixed(3)}deg)`;
                }
            });
            if(dev.tapeThreadPosition==null||Math.abs(visual-dev.tapeThreadPosition)>.025){
                // The free tape leaves each changing winding tangentially toward its guide.
                const tangent=(cx,cy,r,px,py,side)=>{const dx=px-cx,dy=py-cy,d2=dx*dx+dy*dy,k=r*r/d2,t=r*Math.sqrt(Math.max(0,d2-r*r))/d2;return {x:cx+k*dx+side*t*(-dy),y:cy+k*dy+side*t*dx};};
                const a=tangent(109,133,radii[0],67,239,1),b=tangent(353,133,radii[1],395,239,-1);
                const paths=dev.tapeThreadPaths||=dev.el.querySelectorAll('.tape-threading>svg>path');
                paths[0]?.setAttribute('d',`M${a.x} ${a.y} L58.2 240.8 A9 9 0 0 0 67 248 H395 A9 9 0 0 0 404 240 L${b.x} ${b.y}`);
                paths[1]?.setAttribute('d',`M${a.x} ${a.y} L58.2 240.8 M404 240 L${b.x} ${b.y}`);
                dev.tapeThreadPosition=visual;
            }
            const counterSeconds=Math.floor(target);
            if(dev.tapeCounterSeconds!==counterSeconds){
                const counter=dev.tapeCounter||=dev.el.querySelector('[data-tape-counter]');
                if(counter)counter.textContent=`${String(Math.floor(counterSeconds/60)).padStart(2,'0')}:${String(counterSeconds%60).padStart(2,'0')}`;
                dev.tapeCounterSeconds=counterSeconds;
            }
        }
        let lastExtraDisplay=0;
        function updateExtraDisplays(now){
            if(now-lastExtraDisplay<75)return;
            const elapsed=Math.min(.3,(now-lastExtraDisplay)/1000);lastExtraDisplay=now;
            Object.values(state.devices).forEach(dev=>{
                if(SIGNAL_GENERATOR_TYPES.has(dev.type)){updateSignalGeneratorDisplay(dev);return;}
                if(!EXTRA_AUDIO_TYPES.has(dev.type))return;
                if(dev.meters&&!dev.meters.visible)return;
                if(dev.type==='tapeDeck'||BENCH_METER_TYPES.has(dev.type))updateCalibratedVuEnvelope(dev,elapsed);
                if(dev.type==='benchMeter')updateBenchLcd(dev,now);
                dev.el.querySelectorAll('[data-live-vu]').forEach(needle=>{
                    const channel=Number(needle.dataset.liveVu),level=dev.powered?(dev.meters?.levels[channel]||0):0;
                    if(dev.type==='tapeDeck'||BENCH_METER_TYPES.has(dev.type)){
                        const vu=audioDb(dev.vuEnvelope[channel])+18;
                        const calibration=deviceGaugeCalibrationAngle(dev,now,-48,46);
                        needle.setAttribute('transform',`rotate(${calibration??dampedNeedle(needle,tapeVuAngle(vu),now,-48)} 50 62)`);
                        needle.parentElement.setAttribute('aria-label',`VU ${channel?'R':'L'}: ${Number.isFinite(vu)?vu.toFixed(1):'menos infinito'} VU; referência 0 VU = −18 dBFS`);
                    }else {const calibration=deviceGaugeCalibrationAngle(dev,now,-48,46);needle.style.transform=`rotate(${calibration??dampedNeedle(needle,-48+Math.max(0,Math.min(1,(audioDb(level)+48)/48))*94,now,-48)}deg)`;}
                });
                if(dev.type==='tapeDeck'){
                    const running=isSourceRunning(dev);dev.el.classList.toggle('tape-running',running);
                    return;
                }
                if(!BENCH_METER_TYPES.has(dev.type)||!dev.meters)return;
                const l=dev.meters.channels[0][0],r=dev.meters.channels[1][0];if(!l||!r)return;
                let lr=0,ll=0,rr=0;
                for(let i=0;i<l.data.length;i++){lr+=l.data[i]*r.data[i];ll+=l.data[i]**2;rr+=r.data[i]**2;}
                const correlation=dev.powered&&state.audioCtx.state==='running'&&ll>1e-7&&rr>1e-7?Math.max(-1,Math.min(1,lr/Math.sqrt(ll*rr))):null;
                const label=correlation===null?'SEM SINAL':correlation.toFixed(2);
                dev.el.querySelector('[data-correlation-value]').textContent='CORR · '+label;
                const dot=dev.el.querySelector('[data-correlation-dot]');dot.style.left=`${((correlation??0)+1)*50}%`;dot.style.opacity=correlation===null?'.2':'1';dot.style.background=correlation!==null&&correlation<0?'#f87171':'#6ee7b7';
                if(state.selectedDeviceId===dev.id){const output=document.getElementById('bench-inspector-correlation');if(output)output.textContent=label;}
                const canvas=dev.el.querySelector('[data-bench-spectrum]'),ctx=canvas.getContext('2d');ctx.fillStyle='#071316';ctx.fillRect(0,0,360,72);
                ctx.strokeStyle='#213b42';ctx.lineWidth=1;for(let y=12;y<72;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke();}
                [l,r].forEach((tap,index)=>{
                    const data=tap.frequencyData||=(new Float32Array(tap.analyzer.frequencyBinCount));tap.analyzer.getFloatFrequencyData(data);
                    ctx.beginPath();ctx.strokeStyle=index?'#f2bd65':'#65cbe1';
                    for(let x=0;x<=360;x+=3){const hz=20*1000**(x/360),bin=Math.min(data.length-1,Math.floor(hz*2/state.audioCtx.sampleRate*data.length));const db=dev.powered&&state.audioCtx.state==='running'?data[bin]:-100,y=68-Math.max(0,Math.min(1,(db+90)/90))*64;if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
                });
            });
        }

        const SIGNAL_FREQUENCIES=[20,50,100,200,440,1000,2000,5000,10000,20000];
        function signalHardwareSelector(key,label,options){
            return `<div class="signal-control"><span>${label}</span><div class="signal-hardware-selector" data-signal-selector="${key}" role="group" aria-label="${label}">${options.map(([value,text,title])=>`<button type="button" data-signal-choice="${key}" data-value="${value}" aria-pressed="false" title="${title||text}" aria-label="${title||text}">${text}</button>`).join('')}</div></div>`;
        }
        function generatorMarkup(){
            const stepper=(key,label)=>`<div class="signal-control"><span>${label}</span><div class="signal-stepper"><button type="button" data-signal-step="${key}" data-direction="-1" aria-label="Diminuir ${label.toLowerCase()}">−</button><button type="button" data-signal-step="${key}" data-direction="1" aria-label="Aumentar ${label.toLowerCase()}">+</button></div></div>`;
            return `<div class="device-header"><span>GERADOR DE SINAIS</span></div><section class="signal-face"><div class="signal-screen"><div class="signal-screen-heading"><strong data-signal-mode>SENOIDE</strong><b data-signal-status>PAUSADO</b></div><span data-signal-frequency>1.000 Hz</span><svg class="signal-waveform" viewBox="0 0 180 22" aria-label="Prévia ilustrativa da forma de onda"><path d="M0 11H180" class="signal-wave-axis"/><path data-signal-wave fill="none"/></svg><small data-signal-channel>L + R · NÍVEL 2/10</small><div class="signal-sweep-track" hidden><i data-signal-progress></i></div></div><div class="signal-control-bank">${signalHardwareSelector('signalMode','SINAL',[['sine','SENO','Senoide'],['sweep','VAR.','Varredura'],['pink','ROSA','Ruído rosa']])}${stepper('signalFrequency','FREQUÊNCIA')}${signalHardwareSelector('sweepSeconds','VARREDURA · s',[[10,'10'],[20,'20'],[30,'30'],[60,'60']])}${signalHardwareSelector('signalChannel','CANAL',[['L','L','Somente esquerdo'],['both','L+R','Esquerdo e direito'],['R','R','Somente direito']])}<div class="signal-control signal-level-control"><span>NÍVEL</span><button type="button" class="signal-level-knob" data-signal-level-knob role="slider" aria-label="Nível do gerador" aria-valuemin="0" aria-valuemax="10" aria-valuenow="2" title="Arraste para ajustar o nível"></button></div><div class="signal-control"><span>TRANSPORTE</span><button type="button" data-source-play aria-label="Reproduzir sinal">▶ / Ⅱ</button></div></div><div class="signal-ports"><div><div class="port" data-type="rca-l" data-io="out" data-node="outL" title="Saída de linha L"></div><small>L</small></div><div><div class="port" data-type="rca-r" data-io="out" data-node="outR" title="Saída de linha R"></div><small>R</small></div><span>LINE OUT</span></div><div data-power-slot><button class="power-btn"></button></div></section>`;
        }
        const SIGNAL_PIXEL_FONT={
            '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
            A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01110','10001','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['01110','00100','00100','00100','00100','00100','01110'],J:['00001','00001','00001','00001','10001','10001','01110'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
            '.':['0','0','0','0','0','0','1'],'/':['00001','00001','00010','00100','01000','10000','10000'],'+':['00000','00100','00100','11111','00100','00100','00000'],'-':['00000','00000','00000','11111','00000','00000','00000']
        };
        function drawVintageSignalDisplay(dev,{frequency,running,progress,phase,cycles}){
            const canvas=dev.el.querySelector('.signal-vintage-lcd');if(!canvas)return;const ctx=canvas.getContext('2d'),s=dev.state;
            ctx.imageSmoothingEnabled=false;ctx.fillStyle=dev.powered?'#29321f':'#24281e';ctx.fillRect(0,0,168,62);
            // Individual LCD cells stay visible under the active bitmap characters.
            ctx.fillStyle='#354027';for(let y=1;y<62;y+=2)for(let x=1;x<168;x+=2)ctx.fillRect(x,y,1,1);
            ctx.fillStyle=dev.powered?'#bccb72':'#414b30';
            function text(value,x,y,scale=1){
                for(const character of String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()){
                    const glyph=SIGNAL_PIXEL_FONT[character];if(glyph)glyph.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='1')ctx.fillRect(x+dx*scale,y+dy*scale,scale,scale);}));x+=6*scale;
                }
            }
            if(!dev.powered){text('STANDBY',8,26);return;}
            text(signalModeLabels[s.signalMode],3,2);text(running?(s.signalLevel?'ON':'ZERO'):'PAUSA',126,2);
            const readout=s.signalMode==='pink'?'20HZ-20KHZ':Math.round(frequency).toLocaleString('pt-BR')+' HZ';text(readout,3,14,2);
            text((s.signalChannel==='both'?'L+R':s.signalChannel)+' NIVEL '+s.signalLevel+'/10',3,33);
            if(s.signalMode==='sweep')text(s.sweepSeconds+'S',138,33);
            for(let x=0;x<164;x+=2){const wave=s.signalMode==='pink'?(Math.sin(x*1.73+phase)*.4+Math.sin(x*.41+phase*.7)*.35+Math.sin(x*.097+phase*.2)*.25):Math.sin(x/164*Math.PI*2*cycles-phase);ctx.fillRect(x+2,Math.round(50-wave*s.signalLevel/10*6),2,2);}
            if(s.signalMode==='sweep'){ctx.fillStyle='#55613b';ctx.fillRect(2,60,164,1);ctx.fillStyle='#bccb72';ctx.fillRect(2,60,Math.round(164*progress),1);}
        }

        const signalModeLabels={sine:'SENOIDE',sweep:'VARREDURA',pink:'RUÍDO ROSA'};
        function refreshSignalGeneratorControls(dev){
            const s=dev.state;
            dev.el.querySelectorAll('[data-signal-selector]').forEach(selector=>{
                const key=selector.dataset.signalSelector,buttons=[...selector.querySelectorAll('[data-signal-choice]')],index=buttons.findIndex(button=>String(s[key])===button.dataset.value),disabled=key==='sweepSeconds'&&s.signalMode!=='sweep';
                selector.style.setProperty('--selector-position',String(Math.max(0,index)/Math.max(1,buttons.length-1)));selector.classList.toggle('is-disabled',disabled);
                buttons.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===index));button.disabled=disabled;});
            });
            const knob=dev.el.querySelector('[data-signal-level-knob]');knob.setAttribute('aria-valuenow',String(s.signalLevel));knob.setAttribute('aria-valuetext',s.signalLevel+' de 10');knob.title=`Nível ${s.signalLevel}/10 · arraste para ajustar`;updateKnobAngle(dev,'[data-signal-level-knob]',s.signalLevel,0,10);
            dev.el.querySelectorAll('[data-signal-step]').forEach(button=>{
                const frequencyControl=button.dataset.signalStep==='signalFrequency',index=frequencyControl?SIGNAL_FREQUENCIES.indexOf(s.signalFrequency):s.signalLevel,max=frequencyControl?SIGNAL_FREQUENCIES.length-1:10;
                button.disabled=(frequencyControl&&s.signalMode!=='sine')||(Number(button.dataset.direction)<0?index<=0:index>=max);
            });
            if(state.selectedDeviceId===dev.id){
                [['mode',s.signalMode],['frequency',s.signalFrequency],['sweep',s.sweepSeconds],['channel',s.signalChannel],['level',s.signalLevel]].forEach(([key,value])=>{const input=document.getElementById('signal-'+key);if(input){input.value=value;if(key==='frequency')input.disabled=s.signalMode!=='sine';if(key==='sweep')input.disabled=s.signalMode!=='sweep';}});
                const label=document.getElementById('signal-level-value');if(label)label.textContent=s.signalLevel+'/10';
                const slider=document.getElementById('signal-level');if(slider){slider.setAttribute('aria-valuetext',s.signalLevel+' de 10');slider.nextElementSibling?.querySelectorAll('span').forEach((tick,index)=>tick.classList.toggle('is-current',index===s.signalLevel));}
            }
            updateSignalGeneratorDisplay(dev);
        }
        function updateSignalGeneratorDisplay(dev){
            const s=dev.state,running=dev.powered&&s.playing&&state.audioCtx?.state==='running',elapsed=running&&s.signalMode==='sweep'?Math.max(0,state.audioCtx.currentTime-(dev.signalSweepStartedAt||0)):0,progress=Math.min(1,elapsed/s.sweepSeconds),frequency=s.signalMode==='sweep'?20*1000**progress:s.signalFrequency;
            const screen=dev.el.querySelector('.signal-screen');screen.classList.toggle('is-off',!dev.powered);screen.dataset.running=String(running);
            screen.querySelector('[data-signal-mode]').textContent=signalModeLabels[s.signalMode];
            screen.querySelector('[data-signal-status]').textContent=!dev.powered?'DESLIGADO':running?(s.signalLevel?'ATIVO':'NÍVEL ZERO'):s.playing?'ÁUDIO SUSPENSO':'PAUSADO';
            screen.querySelector('[data-signal-frequency]').textContent=!dev.powered?'— — —':s.signalMode==='pink'?'20 Hz — 20 kHz':Math.round(frequency).toLocaleString('pt-BR')+' Hz';
            screen.querySelector('[data-signal-channel]').textContent=`${s.signalChannel==='both'?'L + R':s.signalChannel} · NÍVEL ${s.signalLevel}/10${s.signalMode==='sweep'?' · '+s.sweepSeconds+' s':''}`;
            screen.querySelector('.signal-sweep-track').hidden=s.signalMode!=='sweep'||!dev.powered;
            screen.querySelector('[data-signal-progress]').style.transform=`scaleX(${progress})`;
            const phase=running&&!matchMedia('(prefers-reduced-motion: reduce)').matches?state.audioCtx.currentTime*2:0,cycles=1+Math.max(0,Math.min(1,Math.log10(frequency/20)/3))*7,amplitude=dev.powered?s.signalLevel/10*9:0;
            const points=[];for(let x=0;x<=180;x+=3){const wave=s.signalMode==='pink'?(Math.sin(x*1.73+phase)*.4+Math.sin(x*.41+phase*.7)*.35+Math.sin(x*.097+phase*.2)*.25):Math.sin(x/180*Math.PI*2*cycles-phase);points.push(`${x===0?'M':'L'}${x} ${(11-wave*amplitude).toFixed(2)}`);}
            screen.querySelector('[data-signal-wave]').setAttribute('d',points.join(' '));
            if(dev.type==='signalGeneratorVintage')drawVintageSignalDisplay(dev,{frequency,running,progress,phase,cycles});
        }
        function setSignalGeneratorSetting(dev,key,value){
            if(!['signalMode','signalFrequency','signalLevel','signalChannel','sweepSeconds'].includes(key))return;
            dev.state[key]=value;configureSignalGenerator(dev);
            const s=dev.state,graph=dev.signalGraph,t=state.audioCtx.currentTime;
            if(graph&&(key==='signalLevel'||key==='signalChannel')){
                graph.gain.gain.setTargetAtTime(s.signalLevel/10*.2,t,.015);
                graph.left.gain.setTargetAtTime(s.signalChannel==='R'?0:1,t,.015);graph.right.gain.setTargetAtTime(s.signalChannel==='L'?0:1,t,.015);
            }else if(key==='signalMode'||(key==='signalFrequency'&&s.signalMode==='sine')||(key==='sweepSeconds'&&s.signalMode==='sweep'))syncSignalGenerator(dev);
            refreshSignalGeneratorControls(dev);updateCableFlows();scheduleProjectSave();
        }
        function bindSignalGeneratorPanel(dev){
            const knob=dev.el.querySelector('[data-signal-level-knob]');
            Hardware.bindKnob(knob,{get:()=>dev.state.signalLevel,set:value=>setSignalGeneratorSetting(dev,'signalLevel',value),min:0,max:10});

            dev.el.querySelectorAll('[data-signal-choice]').forEach(button=>button.addEventListener('click',event=>{
                event.stopPropagation();const key=button.dataset.signalChoice;setSignalGeneratorSetting(dev,key,key==='sweepSeconds'?Number(button.dataset.value):button.dataset.value);
            }));
            dev.el.querySelectorAll('[data-signal-step]').forEach(button=>button.addEventListener('click',event=>{
                event.stopPropagation();const key=button.dataset.signalStep,direction=Number(button.dataset.direction);
                setSignalGeneratorSetting(dev,key,key==='signalFrequency'?SIGNAL_FREQUENCIES[Math.max(0,Math.min(SIGNAL_FREQUENCIES.length-1,SIGNAL_FREQUENCIES.indexOf(dev.state[key])+direction))]:Math.max(0,Math.min(10,dev.state[key]+direction)));
            }));
        }
        function configureSignalGenerator(dev){
            const s=dev.state;
            s.signalMode=['sine','sweep','pink'].includes(s.signalMode)?s.signalMode:'sine';
            s.signalFrequency=SIGNAL_FREQUENCIES.includes(s.signalFrequency)?s.signalFrequency:1000;
            s.signalLevel=Number.isFinite(s.signalLevel)?Math.max(0,Math.min(10,Math.round(s.signalLevel))):2;
            s.signalChannel=['both','L','R'].includes(s.signalChannel)?s.signalChannel:'both';
            s.sweepSeconds=[10,20,30,60].includes(s.sweepSeconds)?s.sweepSeconds:20;
            refreshSignalGeneratorControls(dev);
        }
        function stopSignalGenerator(dev){
            clearTimeout(dev.signalSweepTimer);dev.signalSweepTimer=null;
            const graph=dev.signalGraph;if(!graph)return;dev.signalGraph=null;
            const now=state.audioCtx.currentTime;graph.gain.gain.cancelScheduledValues(now);graph.gain.gain.setTargetAtTime(0,now,.004);
            try{graph.source.stop(now+.03);}catch{}
            graph.source.onended=()=>graph.nodes.forEach(node=>{try{node.disconnect();}catch{}});
        }
        function syncSignalGenerator(dev){
            if(!SIGNAL_GENERATOR_TYPES.has(dev.type))return;
            stopSignalGenerator(dev);configureSignalGenerator(dev);
            if(!dev.state.playing||!dev.powered)return;
            const context=state.audioCtx,s=dev.state,gain=context.createGain();gain.gain.value=0;
            let source;
            if(s.signalMode==='pink'){
                const buffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=buffer.getChannelData(0);
                let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
                for(let i=0;i<data.length;i++){const white=Math.random()*2-1;b0=.99886*b0+white*.0555179;b1=.99332*b1+white*.0750759;b2=.969*b2+white*.153852;b3=.8665*b3+white*.3104856;b4=.55*b4+white*.5329522;b5=-.7616*b5-white*.016898;data[i]=(b0+b1+b2+b3+b4+b5+b6+white*.5362)*.11;b6=white*.115926;}
                source=context.createBufferSource();source.buffer=buffer;source.loop=true;
            }else{source=context.createOscillator();source.type='sine';source.frequency.value=s.signalMode==='sweep'?20:s.signalFrequency;}
            const left=context.createGain(),right=context.createGain();left.gain.value=s.signalChannel==='R'?0:1;right.gain.value=s.signalChannel==='L'?0:1;
            const shaping=[];if(s.signalMode==='pink'){const high=context.createBiquadFilter(),low=context.createBiquadFilter();high.type='highpass';high.frequency.value=20;low.type='lowpass';low.frequency.value=Math.min(20000,context.sampleRate*.45);source.connect(high);high.connect(low);low.connect(gain);shaping.push(high,low);}else source.connect(gain);gain.connect(left);gain.connect(right);left.connect(dev.nodes.genL);right.connect(dev.nodes.genR);
            gain.gain.setTargetAtTime(s.signalLevel/10*.2,context.currentTime,.015);
            dev.signalGraph={source,gain,left,right,nodes:[source,gain,left,right,...shaping]};source.start();
            if(s.signalMode==='sweep'){
                const sweep=()=>{if(dev.signalGraph?.source!==source)return;const now=context.currentTime;dev.signalSweepStartedAt=now;source.frequency.cancelScheduledValues(now);source.frequency.setValueAtTime(20,now);source.frequency.exponentialRampToValueAtTime(20000,now+s.sweepSeconds);source.frequency.setValueAtTime(20,now+s.sweepSeconds+.03);dev.signalSweepTimer=setTimeout(sweep,(s.sweepSeconds+.03)*1000);};sweep();
            }
        }
        function signalInspectorHtml(dev){const s=dev.state;return `<section class="signal-properties"><label>Sinal<select id="signal-mode">${[['sine','Senoide'],['sweep','Varredura'],['pink','Ruído rosa']].map(([v,n])=>`<option value="${v}" ${s.signalMode===v?'selected':''}>${n}</option>`).join('')}</select></label><label>Frequência da senoide<select id="signal-frequency">${SIGNAL_FREQUENCIES.map(f=>`<option value="${f}" ${s.signalFrequency===f?'selected':''}>${f.toLocaleString('pt-BR')} Hz</option>`).join('')}</select></label><label>Duração da varredura<select id="signal-sweep">${[10,20,30,60].map(v=>`<option value="${v}" ${s.sweepSeconds===v?'selected':''}>${v} segundos</option>`).join('')}</select></label><label>Canal<select id="signal-channel">${[['both','L + R'],['L','Somente L'],['R','Somente R']].map(([v,n])=>`<option value="${v}" ${s.signalChannel===v?'selected':''}>${n}</option>`).join('')}</select></label><label>Nível <output id="signal-level-value">${s.signalLevel}/10</output><input id="signal-level" type="range" min="0" max="10" step="1" value="${s.signalLevel}"></label><p>Saída de linha RCA. Varredura logarítmica de 20 Hz a 20 kHz em repetição. Use o espectro de um equalizador ou medidor para observar a resposta.</p></section>`;}
        function bindSignalInspector(dev){
            [['mode','signalMode',String],['frequency','signalFrequency',Number],['sweep','sweepSeconds',Number],['channel','signalChannel',String],['level','signalLevel',Number]].forEach(([id,key,parse])=>document.getElementById('signal-'+id).addEventListener(id==='level'?'input':'change',event=>setSignalGeneratorSetting(dev,key,parse(event.target.value))));
            refreshSignalGeneratorControls(dev);
        }
        function expandFurnitureGroup(devices){
            if(!devices.some(dev=>FURNITURE_TYPES[dev.type]))return devices;
            const group=new Map(devices.map(dev=>[dev.id,dev]));
            const boxes=new Map(Object.values(state.devices).map(dev=>[dev.id,{
                dev,x:parseFloat(dev.el.style.left)||0,y:parseFloat(dev.el.style.top)||0,w:dev.el.offsetWidth,h:dev.el.offsetHeight
            }]));
            const belongsTo=(box,support)=>{
                const overlap=Math.min(box.x+box.w,support.x+support.w)-Math.max(box.x,support.x);
                if(overlap<=.5)return false;
                const config=FURNITURE_TYPES[support.dev.type];
                if(config){
                    // Keep every item inside a bay, including deliberately floating
                    // placements. A table's open space below its top is not a bay.
                    const insideWidth=box.x>=support.x+config.inset-.5&&box.x+box.w<=support.x+support.w-config.inset+.5;
                    const insideBay=insideWidth&&(config.rack||config.back)&&config.surfaces.some((surface,i)=>i>0&&box.y>=support.y+config.surfaces[i-1]+(config.rack?16:20)-.5&&box.y+box.h<=support.y+surface+.5);
                    if(insideBay)return true;
                    // Include contact and the full visible-foot gap, even on a top
                    // with a small overhang. No attraction changes that spacing.
                    return config.surfaces.some(surface=>{const gap=support.y+surface-box.y-box.h;return gap>=-.5&&gap<=STACK_FEET.height+.5;});
                }
                const gap=support.y-box.y-box.h;
                return gap>=-.5&&gap<=STACK_FEET.height+.5&&overlap>=Math.min(box.w,support.w)*.7;
            };
            let changed=true;
            while(changed){
                changed=false;
                for(const box of boxes.values()){
                    if(group.has(box.dev.id))continue;
                    if([...group.keys()].some(id=>belongsTo(box,boxes.get(id)))){group.set(box.dev.id,box.dev);changed=true;}
                }
            }
            return [...group.values()];
        }
