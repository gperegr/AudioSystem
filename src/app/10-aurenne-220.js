/* Audio graphs and controls for the Aurenne P-220 preamp and R-220 power amp. */
        const AURENNE_220 = new Set(['preAurenne220','powerAurenne220']);
        const P220_SOURCES = ['aux','phono1','phono2','fm','am'];
        const P220_SOURCE_LABELS = ['AUX','PHONO 1','PHONO 2','FM','AM'];
        const P220_MONITOR = ['SOURCE','TAPE 1','TAPE 2'];
        const P220_DB = [-Infinity,-70,-66,-62,-58,-54,-52,-50,-48,-46,-44,-42,-40,-38,-36,-34,-32,-30,-28,-26,-24,-22,-20,-18,-16,-14,-12,-10,-8,-6,-3,0];
        const P220_IMPEDANCES = [33000,47000,100000];
        const P220_KNOBS = {
            volumeStep:[0,31,1,value=>value ? P220_DB[value]+' dB' : '−∞ dB'],
            bass:[-10,10,.5,value=>value+' dB'], mid:[-5,5,.5,value=>value+' dB'],
            treble:[-10,10,.5,value=>value+' dB'], balance:[-1,1,.05,value=>value===0?'L = R':Math.round(Math.abs(value)*100)+'% '+(value<0?'L':'R')],
            source:[0,4,1,value=>P220_SOURCE_LABELS[value]],
            impedance:[0,2,1,value=>P220_IMPEDANCES[value]/1000+' kΩ'],
            tuning:[0,1000,1],
        };
        const P220_DEFAULTS = Object.freeze({
            source:0, monitor:0, volumeStep:17, bass:0, mid:0, treble:0, balance:0,
            tone:true, loudness:false, bassTurn:false, trebleTurn:false, muted:false,
            mono:false, fmMuting:false, subsonic:false, highFilter:false,
            impedance1:1, impedance2:1, tuning:0, stationBand:'fm',
        });
        const R220_DEFAULTS = Object.freeze({speakerA:true,speakerB:false});
        const P220_INPUTS = ['aux','phono1','phono2','tape1','tape2'];
        const p220Band = dev => P220_SOURCES[dev.state.aurenne220.source];
        const isP220Band = key => key==='fm'||key==='am';
        const p220DisplayFrequency = (dev,position) => {
            const band=p220Band(dev)==='am'?'am':'fm',frequency=Aurenne220Panel.frequency(band,position/10);
            return band==='am'?Math.round(frequency)+' kHz':frequency.toFixed(1)+' MHz';
        };
        function normalizeAurenne220(dev) {
            const defaults=dev.type==='preAurenne220'?P220_DEFAULTS:R220_DEFAULTS;
            const input=dev.state.aurenne220;
            const state={...defaults};
            if(input&&typeof input==='object'&&!Array.isArray(input)){
                for(const key of Object.keys(defaults)){
                    const value=input[key];
                    if(typeof defaults[key]==='boolean'&&typeof value==='boolean')state[key]=value;
                    if(key==='stationBand'&&isP220Band(value))state[key]=value;
                    if(!Number.isFinite(value))continue;
                    const range=P220_KNOBS[key]||({monitor:[0,2,1],impedance1:[0,2,1],impedance2:[1,2,1]})[key];
                    if(range){
                        const [min,max,step]=range;
                        state[key]=Number(Math.max(min,Math.min(max,Math.round(value/step)*step)).toFixed(2));
                    }
                }
            }
            dev.state.aurenne220=state;
        }
        function aurenneAudioGraph(dev) {
            const ctx=appState.audio.context;
            const keep=node=>{(dev.modelAudioNodes||=[]).push(node);return node;};
            const gain=(value=1)=>{const node=keep(ctx.createGain());node.gain.value=value;return node;};
            const filter=(type,hz,q=1)=>{const node=keep(ctx.createBiquadFilter());node.type=type;node.frequency.value=hz;node.Q.value=q;return node;};
            const onePole=(type,hz)=>{
                const k=Math.tan(Math.PI*hz/ctx.sampleRate);
                return keep(ctx.createIIRFilter(type==='highpass'?[1,-1]:[k,k],[1+k,k-1]));
            };
            const switchable=(input,filterNode)=>{
                const dry=gain(1),wet=gain(0),out=gain();
                input.connect(dry).connect(out);
                input.connect(filterNode).connect(wet).connect(out);
                return {dry,wet,out};
            };
            const level=(param,value)=>param.setTargetAtTime(value,ctx.currentTime,.018);
            const selectFilter=(path,on)=>{
                level(path.dry.gain,on?0:1);
                level(path.wet.gain,on?1:0);
            };
            return {ctx,keep,gain,filter,onePole,switchable,level,selectFilter};
        }
        function installP220Phono(input,graph,output,dev) {
            const {ctx,keep,gain}=graph;
            const a=2*ctx.sampleRate*.00318,b=2*ctx.sampleRate*.000318,c=2*ctx.sampleRate*.000075;
            const riaa=keep(ctx.createIIRFilter([1+b,2,1-b],[
                (1+a)*(1+c),(1+a)*(1-c)+(1-a)*(1+c),(1-a)*(1-c),
            ]));
            const magnitude=new Float32Array(1);
            riaa.getFrequencyResponse(new Float32Array([1000]),magnitude,new Float32Array(1));
            const trim=gain(ELECTRICAL_MODEL.phonoGain/magnitude[0]);
            input.connect(riaa).connect(trim);
            connectPhonoPlayback(dev,trim,output);
        }

        function configureP220(dev) {
            const graph=aurenneAudioGraph(dev);
            const {ctx,keep,gain,filter,onePole,switchable,level,selectFilter}=graph;
            const channels=['L','R'];
            const radioMusic=[gain(),gain()],radioNoise=filter('lowpass',6500,.707),noiseGain=gain(0);
            const monoBus=gain();
            radioNoise.connect(noiseGain);
            dev.state.aurenne220={...P220_DEFAULTS};
            dev.aurenneRadio={armed:false,graph,music:radioMusic,noiseFilter:radioNoise,noiseGain,stereo:false,signal:0};
            const phones=dev.nodes.outPhone1=dev.nodes.outPhone2=keep(ctx.createChannelMerger(2));
            const stages=channels.map((channel,index)=>{
                const program=gain(),monitor=gain(),listen=gain();
                const sources=P220_INPUTS.map(key=>{
                    const input=dev.nodes[key+channel]=gain(),gate=gain(0);
                    if(key.startsWith('phono'))installP220Phono(input,graph,gate,dev);
                    else input.connect(gate);
                    return {key,gate};
                });
                const radio=filter('lowpass',15000,.707);
                const radioDirect=gain(0),radioCross=gain(0);
                radioMusic[index].connect(radioDirect).connect(radio);
                radioMusic[1-index].connect(radioCross).connect(radio);
                radio.connect(program);
                noiseGain.connect(program);
                for(const source of sources)source.gate.connect(source.key.startsWith('tape')?monitor:program);

                for(const deck of [1,2])program.connect(dev.nodes['rec'+deck+channel]=gain());
                const sourceGate=gain(),monitorGate=gain(0);
                program.connect(sourceGate).connect(listen);
                monitor.connect(monitorGate).connect(listen);
                listen.connect(gain(.5)).connect(monoBus);
                const mono=gain(0),stereo=gain(),toneInput=gain();
                listen.connect(stereo).connect(toneInput);
                monoBus.connect(mono).connect(toneInput);

                const bass=filter('lowshelf',200),mid=filter('peaking',1500,.8),treble=filter('highshelf',2500);
                toneInput.connect(bass).connect(mid).connect(treble);
                const bassBoost=filter('lowshelf',90),trebleBoost=filter('highshelf',7500);
                treble.connect(bassBoost).connect(trebleBoost);
                const lowCut=switchable(trebleBoost,onePole('highpass',16));
                const highCut=switchable(lowCut.out,onePole('lowpass',3000));
                const volume=gain(0),output=dev.nodes['pre'+channel]=gain();
                highCut.out.connect(volume).connect(output);
                output.connect(phones,0,index);
                return {channel,sources,radio,radioDirect,radioCross,sourceGate,monitorGate,mono,stereo,bass,mid,treble,bassBoost,trebleBoost,lowCut,highCut,volume};
            });
            dev.aurenneRadio.stages=stages;

            dev.syncAurenne=()=>{
                const state=dev.state.aurenne220;
                const source=p220Band(dev),amount=P220_DB[state.volumeStep];
                const loudness=state.loudness?Math.min(1,-amount/30):0;
                for(const stage of stages){
                    for(const {key,gate} of stage.sources)level(gate.gain,(key===source||key==='tape'+state.monitor)?1:0);
                    level(stage.sourceGate.gain,state.monitor?0:1);
                    level(stage.monitorGate.gain,state.monitor?1:0);
                    level(stage.stereo.gain,state.mono?0:1);
                    level(stage.mono.gain,state.mono?1:0);
                    level(stage.bass.frequency,state.bassTurn?400:200);
                    level(stage.treble.frequency,state.trebleTurn?5000:2500);
                    level(stage.bass.gain,state.tone?state.bass:0);
                    level(stage.mid.gain,state.tone?state.mid:0);
                    level(stage.treble.gain,state.tone?state.treble:0);
                    level(stage.bassBoost.gain,loudness*8);
                    level(stage.trebleBoost.gain,loudness*6);
                    selectFilter(stage.lowCut,state.subsonic);
                    selectFilter(stage.highCut,state.highFilter);
                    level(stage.volume.gain,p220ListeningGain(dev,stage.channel));
                }
                syncP220Radio(dev);
                syncAurenneFront(dev);
                refreshP220Inspector(dev);
            };
            dev.aurenneInputOhms=port=>{
                const node=port.dataset.node;
                if(node.startsWith('phono1'))return P220_IMPEDANCES[dev.state.aurenne220.impedance1];
                if(node.startsWith('phono2'))return P220_IMPEDANCES[dev.state.aurenne220.impedance2];
            };
            dev.aurenneInputs=(port,channelHint)=>p220RoutedInputs(dev,port,channelHint);
            dev.disposeAurenne=()=>stopP220Radio(dev);
            dev.resetAurenne=()=>{
                const stationBand=dev.state.aurenne220.stationBand;
                dev.state.aurenne220={...P220_DEFAULTS,stationBand};
                dev.aurenneRadio.armed=false;
                dev.syncAurenne();
            };
            bindAurenneFront(dev);
            dev.syncAurenne();
        }

        function p220ListeningGain(dev,channel) {
            const state=dev.state.aurenne220;
            const amount=P220_DB[state.volumeStep];
            const pan=channel==='L'?1-Math.max(0,state.balance):channel==='R'?1+Math.min(0,state.balance):1;
            // AUX sensitivity of 150 mV maps to 1.5 V at full volume.
            return 10**((20+amount-(state.muted?20:0))/20)*pan;
        }
        const p220RecordPort=port=>/^rec[12][LR]$/.test(port?.dataset.node||'');
        function p220RoutedInputs(dev,output,channelHint='') {
            const state=dev.state.aurenne220,record=p220RecordPort(output);
            const prefix=!record&&state.monitor?'tape'+state.monitor:p220Band(dev);
            if(isP220Band(prefix))return [];
            const channel=portChannel(output)||channelHint;
            return [...dev.el.querySelectorAll('.port[data-io="in"]')].filter(input=>
                input.dataset.node.slice(0,-1)===prefix&&
                (!channel||!record&&state.mono||portChannel(input)===channel));
        }
        function p220RadioOnOutput(dev,output) {
            return !!(dev.aurenneRadio?.audible&&(p220RecordPort(output)||!dev.state.aurenne220.monitor));
        }

        let p220NoiseBuffer=null;
        function p220StationFrequency(band) {return band==='am'?1000:98;}
        function stopP220Radio(dev) {
            const radio=dev.aurenneRadio;
            for(const key of ['noise','voice']){
                const voice=radio[key];
                if(!voice)continue;
                voice.source.stop();
                voice.source.disconnect();
                voice.split?.disconnect();
                radio[key]=null;
            }
        }
        function syncP220Radio(dev) {
            const radio=dev.aurenneRadio,state=dev.state.aurenne220;
            const {ctx,level}=radio.graph,band=p220Band(dev);
            const active=radio.armed&&isP220Band(band)&&dev.powered&&!dev.state.damage&&ctx.state==='running';
            const am=band==='am';
            const frequency=Aurenne220Panel.frequency(am?'am':'fm',state.tuning/10);
            const station=active&&dev.audioBuffer&&band===state.stationBand;
            const offset=station?(frequency-p220StationFrequency(band))/(am?12:.20):0;
            const reception=station?Math.exp(-(offset**2)):0;
            const audible=active&&(am||!state.fmMuting||reception>.24);
            const width=am||dev.audioBuffer?.numberOfChannels===1?0:Math.max(0,(reception-.25)/.75);
            radio.offset=offset;
            radio.signal=reception;
            radio.stereo=audible&&width>.75;
            radio.audible=!!audible;
            level(radio.noiseFilter.frequency,am?4000:6500);
            level(radio.noiseGain.gain,audible?(am?.022:.032)*(1-reception)**1.4:0);
            for(const stage of radio.stages){
                level(stage.radio.frequency,am?8500:15000);
                const music=audible?reception*.30:0;
                level(stage.radioDirect.gain,music*(.5+width/2));
                level(stage.radioCross.gain,music*(.5-width/2));
            }
            if(!active){stopP220Radio(dev);return;}
            if(!radio.noise){
                if(p220NoiseBuffer?.context!==ctx){
                    const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);
                    const samples=buffer.getChannelData(0);
                    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
                    p220NoiseBuffer={context:ctx,buffer};
                }
                const source=ctx.createBufferSource();
                source.buffer=p220NoiseBuffer.buffer;
                source.loop=true;
                source.connect(radio.noiseFilter);
                source.start();
                radio.noise={source};
            }
            if(station&&!radio.voice){
                const source=ctx.createBufferSource(),split=ctx.createChannelSplitter(2);
                source.buffer=dev.audioBuffer;source.loop=true;source.connect(split);
                split.connect(radio.music[0],0);
                split.connect(radio.music[1],dev.audioBuffer.numberOfChannels>1?1:0);
                source.start();
                radio.voice={source,split};
            }
        }
        function armP220Radio(dev) {
            if(!isP220Band(p220Band(dev))||!dev.powered||dev.runtimeDisposed)return;
            const radio=dev.aurenneRadio,ctx=radio.graph.ctx;
            radio.armed=true;
            if(ctx.state==='running')return;
            ctx.resume().then(()=>{
                if(dev.runtimeDisposed)return;
                dev.syncAurenne();
                updateCableFlows();
            }).catch(()=>{});
        }

        function configureR220(dev) {
            const {ctx,keep,gain,level}=aurenneAudioGraph(dev);
            dev.state.aurenne220={...R220_DEFAULTS};
            const outputs=[];
            dev.electricalStages=['L','R'].map(channel=>{
                const input=dev.nodes['in'+channel]=gain();
                // Normalized line input (1.5 V RMS) reaches rated speaker output.
                const before=gain(peakLimitForWatts(220,8)*2/1.5/4),shaper=keep(ctx.createWaveShaper());
                shaper.curve=electricalLimitCurve(peakLimitForWatts(220,8));
                shaper.oversample='2x';
                const gate=gain(),analyzer=keep(ctx.createAnalyser());
                analyzer.fftSize=1024;
                input.connect(before).connect(shaper).connect(gain(4)).connect(gate);
                gate.connect(analyzer);
                for(const bank of ['A','B']){
                    const output=dev.nodes['speaker'+bank+channel]=gain(bank==='A'?1:0);
                    gate.connect(output);
                    outputs.push({bank,output});
                }
                return {channel,shaper,gate,analyzer,samples:new Float32Array(analyzer.fftSize),rms:0,peakLimit:Infinity,load:null};
            });
            dev.syncAurenne=()=>{
                for(const {bank,output} of outputs)level(output.gain,dev.state.aurenne220['speaker'+bank]?1:0);
                syncAurenneFront(dev);
            };
            dev.resetAurenne=()=>{dev.state.aurenne220={...R220_DEFAULTS};dev.syncAurenne();};
            bindAurenneFront(dev);
            dev.syncAurenne();
        }

        function aurenneKnobState(dev,key) {
            return key==='impedance'?(p220Band(dev)==='phono2'?'impedance2':'impedance1'):key;
        }
        function changeAurenneControl(dev,key,value) {
            const state=dev.state.aurenne220,setting=aurenneKnobState(dev,key);
            if(key==='source'&&value!==state.source){
                stopP220Radio(dev);
                dev.aurenneRadio.armed=false;
            }
            state[setting]=setting==='impedance2'?Math.max(1,value):value;
            if(key==='source'||key==='tuning')armP220Radio(dev);
            dev.syncAurenne();
            updateCableFlows();
            scheduleProjectSave();
        }
        function bindAurenneFront(dev) {
            for(const button of dev.el.querySelectorAll('[data-aurenne-switch]:not(.power-btn)')){
                const key=button.dataset.aurenneSwitch;
                button.addEventListener('click',()=>{
                    const value=dev.state.aurenne220[key];
                    changeAurenneControl(dev,key,key==='monitor'?(value+1)%3:!value);
                });
            }
            for(const knob of dev.el.querySelectorAll('[data-aurenne-knob]')){
                const key=knob.dataset.aurenneKnob,[min,max,step,format]=P220_KNOBS[key],width=knob.offsetWidth;
                Hardware.bindKnob(knob,{
                    min,max,step,width,height:width,
                    get:()=>dev.state.aurenne220[aurenneKnobState(dev,key)],
                    set:value=>changeAurenneControl(dev,key,value),
                    format:format||(value=>p220DisplayFrequency(dev,value)),
                    activate:key==='tuning'?()=>{armP220Radio(dev);dev.syncAurenne();updateCableFlows();}:undefined,
                });
            }
        }
        function syncAurenneFront(dev) {
            const state=dev.state.aurenne220;
            dev.el.querySelectorAll('[data-aurenne-switch]').forEach(button=>{
                const key=button.dataset.aurenneSwitch,value=key==='power'?dev.powered:state[key];
                const detail=button.nextElementSibling;
                button.classList.toggle('up',!!value);
                button.setAttribute('aria-pressed',String(!!value));
                if(key==='power')button.setAttribute('aria-checked',String(!!value));
                if(key==='monitor'){
                    button.dataset.position=String(value);
                    detail.textContent=P220_MONITOR[value];
                }
                else if(key==='bassTurn')detail.textContent=value?'400 Hz':'200 Hz';
                else if(key==='trebleTurn')detail.textContent=value?'5 kHz':'2.5 kHz';
                else if(!['muted','subsonic','highFilter','mono'].includes(key))detail.textContent=value?'ON':'OFF';
            });
            if(dev.type!=='preAurenne220')return;
            const source=p220Band(dev);
            dev.el.querySelectorAll('[data-aurenne-knob]').forEach(knob=>{
                const key=knob.dataset.aurenneKnob,[min,max,,format]=P220_KNOBS[key],value=state[aurenneKnobState(dev,key)];
                const sweep=key==='tuning'?270:key==='volumeStep'?270:245;
                knob.style.setProperty('--index',(-sweep/2+(value-min)/(max-min)*sweep)+'deg');
                knob.setAttribute('aria-valuenow',String(value));
                knob.setAttribute('aria-valuetext',format?format(value):p220DisplayFrequency(dev,value));
            });
            dev.el.querySelector('.pointer').style.setProperty('--dial-position',String(state.tuning/1000));
            for(const lamp of dev.el.querySelectorAll('[data-aurenne-lamp]')){
                const name=lamp.dataset.aurenneLamp;
                lamp.classList.toggle('red',dev.powered&&name===source);
                lamp.classList.toggle('green',dev.powered&&name==='stereo'&&dev.aurenneRadio.stereo);
            }
        }

        let lastAurenneFrame=0;
        function updateAurenneDisplays(now) {
            if(now-lastAurenneFrame<70)return;
            const elapsed=(now-lastAurenneFrame)/1000;
            lastAurenneFrame=now;
            for(const dev of Object.values(appState.project.devices)){
                if(dev.type==='powerAurenne220'){
                    const watts=Math.max(...['L','R'].map(channel=>wattsAtLoad(amplifierChannelRms(dev,channel),dev.channelLoads?.[channel])));
                    dev.el.classList.toggle('fan-on',dev.powered&&(watts>30||dev.el.classList.contains('fan-on')&&watts>18));
                    continue;
                }
                if(dev.type!=='preAurenne220'||dev.meters?.visible===false)continue;
                const radio=dev.aurenneRadio;
                const peak=index=>Math.max(0,Math.min(1,(audioDb(dev.meters?.peaks[index]||0)+22)/25));
                const targets=[peak(0),peak(1),radio.signal,.5+Math.max(-.45,Math.min(.45,-radio.offset*.2))];
                dev.aurenneMeterPositions??=[0,0,0,.5];
                dev.el.querySelectorAll('[data-meter]').forEach((canvas,index)=>{
                    const target=dev.powered?targets[index]:index===3?.5:0;
                    const previous=dev.aurenneMeterPositions[index];
                    const value=powerMotionPreference.matches?target:previous+(target-previous)*(1-Math.exp(-elapsed/(target>previous?.12:.32)));
                    if(Math.abs(value-previous)<.001&&canvas.dataset.drawn==='true')return;
                    dev.aurenneMeterPositions[index]=value;
                    canvas.dataset.drawn='true';
                    Aurenne220Panel.drawMeter(canvas,value);
                });
            }
        }

        function p220InspectorHtml(dev) {
            const state=dev.state.aurenne220,options=P220_SOURCE_LABELS.map((label,index)=>`<option value="${index}" ${index===state.source?'selected':''}>${label}</option>`).join('');
            return `<section class="flex flex-col gap-2 border-t border-gray-700 pt-4">
                <label>Fonte<select data-p220-source>${options}</select></label>
                <label>Sintonia <output data-p220-frequency></output><input type="range" min="0" max="1000" step="1" data-slider-precision="native" data-p220-tuning aria-label="Sintonia" value="${state.tuning}"></label>
                <button type="button" class="tt-insp-btn" data-p220-start>OUVIR RÁDIO</button>
                <label>Faixa da estação local<select data-p220-band><option value="fm" ${state.stationBand==='fm'?'selected':''}>FM</option><option value="am" ${state.stationBand==='am'?'selected':''}>AM</option></select></label>
                <button type="button" class="tt-insp-btn" data-p220-load>CARREGAR ÁUDIO COMO ESTAÇÃO</button>
                <input type="file" data-p220-file accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" hidden>
                <button type="button" class="tt-insp-btn" data-p220-remove ${dev.audioBuffer?'':'hidden'}>REMOVER ESTAÇÃO LOCAL</button>
                <p data-p220-status class="text-xs text-gray-300" role="status"></p>
            </section>`;
        }
        function refreshP220Inspector(dev) {
            if(appState.interface.selectedDeviceId!==dev.id)return;
            const status=inspectorContent.querySelector('[data-p220-status]');
            if(!status)return;
            const state=dev.state.aurenne220,band=p220Band(dev),radio=dev.aurenneRadio;
            const file=dev.audioBuffer?`${dev.fileName} · ${state.stationBand.toUpperCase()} · ${p220StationFrequency(state.stationBand)} ${state.stationBand==='fm'?'MHz':'kHz'}`:'Carregue um áudio para criar uma estação.';
            const reception=radio.signal>.75?'Sintonizado':radio.signal>.08?'Sinal fraco':'Fora de sintonia';
            const message=dev.fileMessage||(isP220Band(band)&&radio.armed&&dev.audioBuffer&&state.stationBand===band?`${file} · ${AudioSystemLanguage.translate(reception)}`:file);
            if(status.textContent!==message)status.textContent=message;
            inspectorContent.querySelector('[data-p220-source]').value=String(state.source);
            const tuning=inspectorContent.querySelector('[data-p220-tuning]'),frequency=p220DisplayFrequency(dev,state.tuning);
            tuning.value=String(state.tuning);
            tuning.setAttribute('aria-valuetext',frequency);
            inspectorContent.querySelector('[data-p220-frequency]').textContent=frequency;
            inspectorContent.querySelector('[data-p220-start]').disabled=!dev.powered;
        }
        function bindP220Inspector(dev) {
            const q=selector=>inspectorContent.querySelector(selector);
            q('[data-p220-source]').onchange=event=>changeAurenneControl(dev,'source',+event.currentTarget.value);
            q('[data-p220-tuning]').oninput=event=>changeAurenneControl(dev,'tuning',+event.currentTarget.value);
            q('[data-p220-start]').onclick=()=>{
                if(!isP220Band(p220Band(dev)))changeAurenneControl(dev,'source',P220_SOURCES.indexOf(dev.state.aurenne220.stationBand));
                else {armP220Radio(dev);dev.syncAurenne();updateCableFlows();}
            };
            q('[data-p220-band]').onchange=event=>{
                dev.fileLoadToken=(dev.fileLoadToken||0)+1;
                stopP220Radio(dev);
                dev.state.aurenne220.stationBand=event.currentTarget.value;
                dev.fileMessage='';
                dev.syncAurenne();
                updateCableFlows();
                scheduleProjectSave();
            };
            q('[data-p220-load]').onclick=()=>q('[data-p220-file]').click();
            q('[data-p220-remove]').onclick=()=>{
                dev.fileLoadToken=(dev.fileLoadToken||0)+1;
                stopP220Radio(dev);
                dev.audioBuffer=null;dev.mediaBlob=null;dev.mediaKey=null;dev.fileName='';dev.fileMessage='';
                dev.syncAurenne();updateCableFlows();scheduleProjectSave();selectDevice(dev.id,true);
            };
            q('[data-p220-file]').onchange=async event=>{
                const file=event.currentTarget.files[0];
                if(!file)return;
                event.currentTarget.value='';
                const token=dev.fileLoadToken=(dev.fileLoadToken||0)+1;
                dev.fileMessage='Carregando estação…';
                refreshP220Inspector(dev);
                try{
                    const buffer=await appState.audio.context.decodeAudioData(await file.arrayBuffer());
                    if(dev.runtimeDisposed||dev.fileLoadToken!==token)return;
                    stopP220Radio(dev);
                    dev.audioBuffer=buffer;dev.mediaBlob=file;dev.mediaKey='radio_'+Date.now()+'_'+Math.random().toString(36).slice(2);
                    dev.fileName=file.name;dev.fileMessage='';
                    dev.syncAurenne();updateCableFlows();scheduleProjectSave();
                    if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);
                }catch{
                    if(dev.runtimeDisposed||dev.fileLoadToken!==token)return;
                    dev.fileMessage='Não foi possível carregar a estação.';refreshP220Inspector(dev);
                }
            };
            refreshP220Inspector(dev);
        }
