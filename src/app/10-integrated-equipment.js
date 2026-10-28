/* Room audio, streamers, integrated amplifiers, preamps, and speaker renderers. */
        const ROOM_PRESETS={near:{name:'Audição próxima',decay:.12,predelay:.004,tone:12500},small:{name:'Sala pequena',decay:.42,predelay:.012,tone:8500},large:{name:'Sala ampla',decay:1.05,predelay:.025,tone:6500}};
        function setupRoomAudio(){
            const context=appState.audio.context,input=appState.audio.masterGain,dry=context.createGain(),wet=context.createGain(),convolver=context.createConvolver(),delay=context.createDelay(.1),filter=context.createBiquadFilter();
            filter.type='lowpass';input.connect(dry);dry.connect(appState.audio.listeningToneInput);input.connect(delay);delay.connect(convolver);convolver.connect(filter);filter.connect(wet);wet.connect(appState.audio.listeningToneInput);
            appStateStore.actions.setAudioRuntime('roomAudio',{dry,wet,convolver,delay,filter,preset:null,impulses:new Map()});applyRoomAudio();
        }
        function applyRoomAudio(){
            const s=appState.audio.environment||DEFAULT_ROOM_SETTINGS,preset=ROOM_PRESETS[s.preset]||ROOM_PRESETS.small,graph=appState.audio.roomAudio;if(!graph)return;
            const context=appState.audio.context,t=context.currentTime;
            if(graph.preset!==s.preset){
                if(!graph.impulses.has(s.preset)){
                    const length=Math.ceil(context.sampleRate*preset.decay),buffer=context.createBuffer(2,length,context.sampleRate);let seed=5371;
                    for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=((seed/4294967296)*2-1)*Math.pow(1-i/length,2.5);}}
                    graph.impulses.set(s.preset,buffer);
                }
                graph.convolver.buffer=graph.impulses.get(s.preset);graph.preset=s.preset;
            }
            graph.delay.delayTime.setTargetAtTime(preset.predelay,t,.03);graph.filter.frequency.setTargetAtTime(preset.tone,t,.03);
            graph.dry.gain.setTargetAtTime(1-s.intensity*.018,t,.04);graph.wet.gain.setTargetAtTime(s.intensity*.045,t,.04);
        }


        function streamIntegratedMarkup(){
            const icon=(path)=>`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${path}</svg>`;
            const pair=(io,node,signal,kind='rca')=>`<div class="stream-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${kind==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${kind==='wire'?'data-role="amp-speaker-out"':''} title="${signal==='amplified'?'Caixa passiva':io==='in'?'Entrada de linha':'Pré-out variável'} · ${ch}"></div>`).join('')}</div>`;
            return `<div class="device-header"><span>Streamer Integrado</span></div><section class="stream-console">
                <div class="stream-top"><i class="stream-top-seam"></i><div class="stream-volume-well"><button data-stream-volume role="slider" aria-label="Volume principal" title="Volume · arraste ou use as setas; duplo clique para silenciar"></button><span class="stream-dial-value" aria-hidden="true"><b data-stream-volume-number>30</b><small>VOLUME</small></span></div></div>
                <div class="stream-housing" aria-hidden="true"></div>
                <div class="stream-heat-sink stream-heat-left"></div><div class="stream-heat-sink stream-heat-right"></div>
                <div class="stream-glass"><div class="stream-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button></div><div class="stream-phone"><div class="port" data-type="p2" data-io="out" data-node="outPhone" data-signal="headphone" title="Fones P2 estéreo · silencia as caixas ao conectar"></div><small>PHONES</small></div>
                    <section class="stream-screen" aria-label="Tela do streamer"><header><span data-stream-source-label>DEMONSTRAÇÃO</span><span data-stream-state>PAUSADO</span></header>
                        <div class="stream-now"><button class="stream-cover" data-button-model="ui" data-stream-cover title="Informações da faixa" aria-label="Mostrar informações da faixa"><img src="assets/artwork/stream-cover.svg" alt="Capa da faixa" loading="lazy" decoding="async"></button><div class="stream-track"><strong data-stream-title>Horizonte azul</strong><span data-stream-artist>Sessão de demonstração</span><span data-stream-album>Escuta tranquila</span><small data-stream-format>FONTE INTERNA</small></div></div>
                        <div class="stream-track-info" hidden><strong data-stream-info-title>Informações da reprodução</strong><p data-stream-info></p><button data-button-model="ui" data-stream-back>VOLTAR</button></div>
                        <div class="stream-home" hidden><span>ESCOLHA A FONTE</span><button data-button-model="ui" data-stream-input="library" aria-label="Selecionar música interna"><span class="stream-input-icon" aria-hidden="true">${icon('<path d="M9 18V5l12-2v13M9 8l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')}</span><b>Música</b><small>Arquivo / demonstração</small></button><button data-button-model="ui" data-stream-input="line" aria-label="Selecionar entrada de linha"><span class="stream-input-icon" aria-hidden="true">${icon('<path d="M8 3v5m8-5v5M6 8h12v4a6 6 0 0 1-12 0ZM12 18v4"/>')}</span><b>Linha</b><small>Entrada RCA estéreo</small></button></div>
                        <div class="stream-timeline"><input type="range" data-stream-seek data-hardware-slider="seek" min="0" max="180" step="0.1" value="0" aria-label="Posição da faixa"><div><time data-stream-elapsed>0:00</time><span data-stream-screen-volume>VOL 30</span><time data-stream-duration>3:00</time></div></div>
                        <div class="stream-line-view" hidden><div class="stream-line-heading"><strong>LINHA</strong><small>ESPECTRO · ENTRADA RCA</small></div><div class="stream-spectra">${['L','R'].map((ch,i)=>`<div class="stream-spectrum-row" data-stream-spectrum="${i}"><b>${ch}</b><svg viewBox="0 0 240 32" role="img" aria-label="Espectro de frequência da entrada ${ch}"><path class="stream-spectrum-grid" d="M0 10h240M0 20h240M0 30h240M80 0v30m80-30v30"/><path data-stream-spectrum-fill d="M0 30H240Z"/><path data-stream-spectrum-trace d="M0 30H240"/></svg></div>`).join('')}</div><div class="stream-spectrum-scale"><small>20 Hz</small><small>1 kHz</small><small>20 kHz</small></div></div>
                    </section><div class="stream-front-keys">
                        <button data-stream-action="home" data-button-model="roundKey" title="Fontes / tela de reprodução" aria-label="Abrir menu de fontes">${icon('<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>')}</button>
                        <button data-stream-action="back" data-button-model="roundKey" title="Retroceder 10 segundos" aria-label="Retroceder 10 segundos">${icon('<path d="M5 5v14m14-14-10 7 10 7Z"/>')}</button>
                        <button data-source-play data-stream-action="play" data-button-model="roundKey" title="Reproduzir / pausar música interna" aria-label="Reproduzir ou pausar">${icon('<path data-stream-play-symbol d="m8 4 12 8-12 8Z"/>')}</button>
                        <button data-stream-action="next" data-button-model="roundKey" title="Avançar 10 segundos" aria-label="Avançar 10 segundos">${icon('<path d="M19 5v14M5 5l10 7-10 7Z"/>')}</button>
                        <button data-stream-action="mute" data-button-model="roundKey" title="Silenciar / restaurar volume" aria-label="Silenciar ou restaurar volume" aria-pressed="false">${icon('<path d="M3 9v6h4l5 5V4L7 9Zm13-1 5 8m0-8-5 8"/>')}</button>
                    </div><div class="stream-glass-reflection" aria-hidden="true"></div></div>
                <div class="stream-service-rail"><label><small>LINE IN</small>${pair('in','line','line')}</label><label><small>PRE OUT</small>${pair('out','pre','line')}</label><label><small>SPEAKERS · L / R</small>${pair('out','speaker','amplified','wire')}</label></div>
            </section>`;
        }
        function readStreamMetadata(buffer){
            const result={title:readAudioTrackTitle(buffer),artist:'',album:'',cover:null};
            try{
                const bytes=new Uint8Array(buffer),view=new DataView(buffer),ascii=(a,b)=>String.fromCharCode(...bytes.subarray(a,b));
                const text=frame=>new TextDecoder(frame[0]===0?'iso-8859-1':frame[0]===1?(frame[1]===0xfe&&frame[2]===0xff?'utf-16be':'utf-16le'):frame[0]===2?'utf-16be':'utf-8').decode(frame.subarray(1)).replace(/\u0000/g,' ').replace(/^\uFEFF/,'').trim().slice(0,240);
                const picture=(mime,data)=>{if(['image/jpeg','image/png','image/webp'].includes(mime)&&data.length>0&&data.length<=4*1024*1024)result.cover=new Blob([data],{type:mime});};
                if(bytes.length>10&&ascii(0,3)==='ID3'&&[3,4].includes(bytes[3])&&!(bytes[5]&0x80)){
                    const sync=o=>(bytes[o]<<21)|(bytes[o+1]<<14)|(bytes[o+2]<<7)|bytes[o+3],version=bytes[3],end=Math.min(bytes.length,10+sync(6),16*1024*1024);let offset=10;
                    if(bytes[5]&0x40)offset+=version===3?4+view.getUint32(offset):sync(offset);
                    while(offset+10<=end){
                        const id=ascii(offset,offset+4),size=version===4?sync(offset+4):view.getUint32(offset+4);if(!/^[A-Z0-9]{4}$/.test(id)||size<1||offset+10+size>end)break;
                        if(!bytes[offset+9]){
                            const frame=bytes.subarray(offset+10,offset+10+size);
                            if(id==='TIT2')result.title=text(frame);if(id==='TPE1')result.artist=text(frame);if(id==='TALB')result.album=text(frame);
                            if(id==='APIC'&&!result.cover){
                                let p=1;while(p<frame.length&&frame[p])p++;const mime=new TextDecoder().decode(frame.subarray(1,p)).toLowerCase();p+=2;
                                const width=frame[0]===1||frame[0]===2?2:1;
                                while(p+width<=frame.length&&(frame[p]||width===2&&frame[p+1]))p+=width;p+=width;
                                picture(mime,frame.slice(p));
                            }
                        }
                        offset+=10+size;
                    }
                }else if(bytes.length>8&&ascii(0,4)==='fLaC'){
                    let offset=4;
                    while(offset+4<=bytes.length&&offset<16*1024*1024){
                        const type=bytes[offset]&127,last=bytes[offset]&128,size=(bytes[offset+1]<<16)|(bytes[offset+2]<<8)|bytes[offset+3],start=offset+4,end=start+size;if(end>bytes.length)break;
                        if(type===4){
                            let p=start;const length=()=>{if(p+4>end)throw Error('Metadata truncada');const n=view.getUint32(p,true);p+=4;return n;};
                            const vendor=length();p+=vendor;const count=Math.min(1000,length());for(let i=0;i<count;i++){const n=length();if(p+n>end)break;const entry=new TextDecoder().decode(bytes.subarray(p,p+n)),split=entry.indexOf('='),key=entry.slice(0,split).toUpperCase(),value=entry.slice(split+1).slice(0,240);if(key==='TITLE')result.title=value;if(key==='ARTIST')result.artist=value;if(key==='ALBUM')result.album=value;p+=n;}
                        }else if(type===6&&!result.cover){
                            let p=start;const length=()=>{if(p+4>end)throw Error('Capa truncada');const n=view.getUint32(p);p+=4;return n;};
                            length();const mimeLength=length();if(p+mimeLength>end)break;const mime=new TextDecoder().decode(bytes.subarray(p,p+mimeLength));p+=mimeLength;const desc=length();p+=desc+16;const dataLength=length();if(p+dataLength<=end)picture(mime,bytes.slice(p,p+dataLength));
                        }
                        offset=end;if(last)break;
                    }
                }
            }catch{}
            return result;
        }
        function configureStreamIntegrated(dev){
            const ctx=appState.audio.context,el=dev.el,owned=dev.modelAudioNodes||=[];
            const gain=(value=1)=>{const node=ctx.createGain();node.gain.value=value;owned.push(node);return node;};
            Object.assign(dev.state,{volume:.3,streamInput:'library',streamMute:false,streamPage:'playing'});
            dev.streamChannels=[];dev.powerNodes=[];dev.nodes.outPhone=ctx.createChannelMerger(2);owned.push(dev.nodes.outPhone);
            for(const [index,ch]of ['L','R'].entries()){
                const internal=dev.nodes['gen'+ch]=gain(0),line=dev.nodes['line'+ch]=gain(),internalGate=gain(),lineGate=gain(0),bus=gain(),volume=gain(.3),power=gain(),speaker=dev.nodes['speaker'+ch]=gain(),pre=dev.nodes['pre'+ch]=gain();
                internal.connect(internalGate);line.connect(lineGate);internalGate.connect(bus);lineGate.connect(bus);bus.connect(volume);volume.connect(power);power.connect(speaker);power.connect(pre);power.connect(dev.nodes.outPhone,0,index);
                dev.streamChannels.push({internalGate,lineGate,volume,speaker});dev.powerNodes.push(power);
            }
            dev.streamSpectra=['L','R'].map((ch,i)=>{
                const analyzer=ctx.createAnalyser();analyzer.fftSize=2048;analyzer.smoothingTimeConstant=.72;analyzer.minDecibels=-90;analyzer.maxDecibels=-10;
                dev.nodes['line'+ch].connect(analyzer);owned.push(analyzer);
                const row=el.querySelector(`[data-stream-spectrum="${i}"]`);
                return {analyzer,data:new Float32Array(analyzer.frequencyBinCount),trace:row.querySelector('[data-stream-spectrum-trace]'),fill:row.querySelector('[data-stream-spectrum-fill]')};
            });
            const q=selector=>el.querySelector(selector),position=()=>dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?ctx.currentTime-dev.demoStartedAt:0);
            dev.refreshStreamDisplay=()=>{
                const st=dev.state,library=st.streamInput==='library',duration=dev.audioBuffer?.duration||180;
                if(!dev.audioBuffer&&st.playing&&position()>=duration){if(st.repeat){dev.demoOffset=0;dev.demoStartedAt=ctx.currentTime;}else {setSourcePlaying(dev,false);dev.demoOffset=0;}}
                const seconds=Math.min(duration,position()),volume=Math.round(st.volume*100),page=st.streamPage;
                el.dataset.streamPage=page;el.classList.toggle('stream-muted',!!st.streamMute);
                q('[data-stream-volume-number]').textContent=st.streamMute?'—':volume;
                q('[data-stream-volume]').style.setProperty('--knob-angle',`${-135+st.volume*270}deg`);q('[data-stream-volume]').style.setProperty('--hw-halo-value',`${st.volume*270}deg`);
                const dial=q('[data-stream-volume]'),angle=(-135+st.volume*270)*Math.PI/180;dial.style.setProperty('--stream-rim-offset',`${st.volume*60}px`);dial.style.setProperty('--stream-index-offset',`${Math.sin(angle)*64}px`);dial.style.setProperty('--stream-index-visible',Math.cos(angle)>0?'1':'0');
                q('[data-stream-source-label]').textContent=library?dev.audioBuffer?'ARQUIVO LOCAL':'DEMONSTRAÇÃO':'ENTRADA DE LINHA';
                q('[data-stream-state]').textContent=st.streamMute?'MUTE':!library?'AUX':st.playing?'REPRODUZINDO':'PAUSADO';
                q('[data-stream-title]').textContent=dev.audioBuffer?(dev.trackTitle||dev.fileName||'Arquivo local'):'Horizonte azul';
                q('[data-stream-artist]').textContent=dev.audioBuffer?(dev.streamMetadata?.artist||'Arquivo local'):'Sessão de demonstração';
                q('[data-stream-album]').textContent=dev.audioBuffer?(dev.streamMetadata?.album||''):'Escuta tranquila';
                const format=dev.audioBuffer?`PCM · ${(dev.audioBuffer.sampleRate/1000).toLocaleString('pt-BR')} kHz · ${dev.audioBuffer.numberOfChannels} ch`:'SÍNTESE ESTÉREO';
                q('[data-stream-format]').textContent=format;
                q('[data-stream-elapsed]').textContent=formatAudioTime(seconds);q('[data-stream-duration]').textContent=formatAudioTime(duration);q('[data-stream-screen-volume]').textContent=st.streamMute?'MUTE':`VOL ${volume}`;
                const seek=q('[data-stream-seek]');seek.max=duration;if(document.activeElement!==seek)seek.value=seconds;
                q('.stream-now').hidden=page!=='playing'||!library;q('.stream-timeline').hidden=page!=='playing'||!library;q('.stream-line-view').hidden=page!=='playing'||library;q('.stream-home').hidden=page!=='home';q('.stream-track-info').hidden=page!=='info';
                q('[data-stream-info]').textContent=library?`${dev.audioBuffer?dev.fileName||'Arquivo local':'Demonstração interna'} · ${format} · ${formatAudioTime(duration)}`:'Entrada RCA estéreo · sinal de linha · volume variável';
                q('[data-stream-action="mute"]').setAttribute('aria-pressed',String(st.streamMute));q('[data-stream-action="play"]').setAttribute('aria-pressed',String(dev.powered&&st.playing));
                el.querySelectorAll('[data-stream-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.streamInput===st.streamInput)));
                if(!library&&page==='playing')drawStreamLineSpectra(dev);
                if(appState.interface.selectedDeviceId===dev.id){const slider=document.getElementById('stream-volume');if(slider&&document.activeElement!==slider)slider.value=volume;const value=document.getElementById('stream-volume-label');if(value)value.textContent=volume+'%';document.getElementById('stream-mute')?.setAttribute('aria-pressed',String(st.streamMute));document.querySelectorAll('[data-stream-inspector-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.streamInspectorInput===st.streamInput)));}
            };
            dev.applyStream=()=>{
                const st=dev.state;st.volume=Math.max(0,Math.min(1,Number(st.volume)||0));st.streamInput=st.streamInput==='line'?'line':'library';st.streamMute=!!st.streamMute;st.streamPage=['playing','home','info'].includes(st.streamPage)?st.streamPage:'playing';
                dev.streamChannels.forEach(({internalGate,lineGate,volume})=>{internalGate.gain.setTargetAtTime(st.streamInput==='library'?1:0,ctx.currentTime,.02);lineGate.gain.setTargetAtTime(st.streamInput==='line'?1:0,ctx.currentTime,.02);volume.gain.setTargetAtTime(st.streamMute?0:st.volume,ctx.currentTime,.02);});
                dev.refreshStreamDisplay();Hardware.sync(dev);
            };
            dev.refreshStreamRouting=()=>{
                const connected=appState.project.connections.some(c=>c.outId===q('[data-node="outPhone"]').id);if(connected===dev.streamPhonesConnected)return;dev.streamPhonesConnected=connected;
                dev.streamChannels.forEach(({speaker})=>speaker.gain.setTargetAtTime(connected?0:1,ctx.currentTime,.02));
            };
            dev.selectStreamInput=input=>{dev.state.streamInput=input==='line'?'line':'library';dev.state.streamPage='playing';if(dev.state.streamInput==='line')setSourcePlaying(dev,false);dev.applyStream();updateCableFlows();scheduleProjectSave();};
            dev.setStreamVolume=value=>{dev.state.volume=Number(value);dev.applyStream();scheduleProjectSave();};
            dev.toggleStreamMute=()=>{dev.state.streamMute=!dev.state.streamMute;dev.applyStream();updateCableFlows();scheduleProjectSave();};
            dev.setStreamMetadata=metadata=>{if(dev.streamCoverUrl)URL.revokeObjectURL(dev.streamCoverUrl);dev.streamCoverUrl=metadata?.cover?URL.createObjectURL(metadata.cover):null;dev.streamMetadata=metadata||{};if(metadata?.title)dev.trackTitle=metadata.title;q('.stream-cover img').src=dev.streamCoverUrl||'assets/artwork/stream-cover.svg';dev.refreshStreamDisplay();};
            dev.disposeStream=()=>{dev.state.playing=false;if(dev.streamCoverUrl)URL.revokeObjectURL(dev.streamCoverUrl);};
            dev.resetStream=()=>{Object.assign(dev.state,{volume:.3,streamInput:'library',streamMute:false,streamPage:'playing'});dev.applyStream();};
            const page=value=>{dev.state.streamPage=value;dev.refreshStreamDisplay();scheduleProjectSave();};
            const seek=seconds=>{if(dev.audioBuffer)seekSource(dev,seconds);else {dev.demoOffset=Math.max(0,Math.min(180,seconds));dev.demoStartedAt=dev.state.playing?ctx.currentTime:null;}dev.refreshStreamDisplay();};
            q('[data-stream-action="home"]').onclick=()=>page(dev.state.streamPage==='home'?'playing':'home');q('[data-stream-cover]').onclick=()=>page('info');q('[data-stream-back]').onclick=()=>page('playing');q('[data-stream-action="mute"]').onclick=dev.toggleStreamMute;
            q('[data-stream-action="back"]').onclick=()=>seek(position()-10);q('[data-stream-action="next"]').onclick=()=>seek(position()+10);
            q('[data-stream-seek]').oninput=event=>seek(Number(event.target.value));
            el.querySelectorAll('[data-stream-input]').forEach(button=>button.onclick=()=>dev.selectStreamInput(button.dataset.streamInput));
            Hardware.bindKnob(q('[data-stream-volume]'),{get:()=>dev.state.volume*100,set:value=>dev.setStreamVolume(value/100),min:0,max:100,model:'haloDisc',width:144,height:28,format:value=>`${Math.round(value)}%`});
            q('[data-stream-volume]').addEventListener('dblclick',dev.toggleStreamMute);
            dev.applyStream();
        }
        function drawStreamLineSpectra(dev){
            if(!dev.meters?.visible)return;
            const active=dev.powered&&appState.audio.context.state==='running',nyquist=appState.audio.context.sampleRate/2,maxHz=Math.min(20000,nyquist),points=96;
            dev.streamSpectra.forEach(({analyzer,data,trace,fill})=>{
                if(active)analyzer.getFloatFrequencyData(data);
                const path=[];
                for(let i=0;i<=points;i++){
                    const hz=20*(maxHz/20)**(i/points),next=20*(maxHz/20)**((i+1)/points);
                    const first=Math.min(data.length-1,Math.max(1,Math.floor(hz/nyquist*data.length))),last=Math.min(data.length-1,Math.max(first,Math.ceil(next/nyquist*data.length)-1));
                    let peak=-90;if(active)for(let bin=first;bin<=last;bin++)peak=Math.max(peak,data[bin]);
                    const x=i/points*240,y=30-Math.max(0,Math.min(1,(peak+90)/80))*28;
                    path.push(`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
                }
                const d=path.join('');trace.setAttribute('d',d);fill.setAttribute('d',d+'L240 30L0 30Z');
            });
        }
        function streamIntegratedInspector(dev){
            return `<section class="stream-inspector"><p>Fonte interna e amplificador estéreo no mesmo aparelho. A biblioteca usa a demonstração ou um arquivo carregado abaixo.</p><div>${[['library','Música interna'],['line','Entrada de linha']].map(([key,label])=>`<button type="button" class="tt-insp-btn" data-stream-inspector-input="${key}" aria-pressed="${dev.state.streamInput===key}">${label}</button>`).join('')}</div><label for="stream-volume">Volume <output id="stream-volume-label">${Math.round(dev.state.volume*100)}%</output></label><input id="stream-volume" type="range" min="0" max="100" step="10" value="${Math.round(dev.state.volume*100)}"><button id="stream-mute" class="tt-insp-btn" aria-pressed="${dev.state.streamMute}">SILENCIAR / RESTAURAR</button><p>O botão superior mantém dez passos de volume, com rotação suave entre eles. Conectar fones silencia as caixas; PRE OUT mantém o volume variável. O halo acompanha o volume e permanece estável durante a música.</p></section>`;
        }
        function bindStreamInspector(dev){
            document.querySelectorAll('[data-stream-inspector-input]').forEach(button=>button.onclick=()=>dev.selectStreamInput(button.dataset.streamInspectorInput));
            document.getElementById('stream-volume').oninput=event=>dev.setStreamVolume(Number(event.target.value)/100);document.getElementById('stream-mute').onclick=dev.toggleStreamMute;
        }

        function hardwarePair(io,node,signal='line'){
            return `<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${signal==='amplified'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${signal==='amplified'?'data-role="amp-speaker-out"':''} title="${signal==='phono'?'Phono':signal==='amplified'?'Caixas passivas':io==='in'?'Entrada de linha':'Saída de linha'} · ${ch}"></div>`).join('')}</div>`;
        }
        function utilityAmpMarkup(){
            const knob=(key,label)=>`<label class="utility-dial utility-${key}"><button data-integrated-knob="${key}" aria-label="${label}" title="${label}"></button><span>${label}</span></label>`;
            return `<div class="device-header"><span>Integrado · Essencial</span></div><section class="integrated-face utility-face"><div class="utility-front"><span class="utility-engraving">STEREO INTEGRATED AMPLIFIER</span><div class="utility-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button><small>POWER</small></div><div class="utility-phones"><div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Fones P10 estéreo"></div><small>PHONES</small></div>${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${knob('volume','VOLUME')}
                <div class="utility-sources">${['AUX','TUNER','TAPE','PHONO'].map((name,index)=>`<label><button data-button-model="plainKey" data-integrated-source="${index}" aria-label="Selecionar ${name}" aria-pressed="${index===0}"></button><span>${name}</span></label>`).join('')}</div>
                <div class="utility-options"><label><button data-button-model="plainKey" data-integrated-direct aria-pressed="false" aria-label="Ignorar controles de tonalidade"></button><span>TONE DEFEAT</span></label>${[['utilityLoudness','LOUDNESS'],['utilityMono','MONO']].map(([key,name])=>`<label><button data-button-model="plainKey" data-utility-toggle="${key}" aria-pressed="false" aria-label="${name}"></button><span>${name}</span></label>`).join('')}</div>
                <div class="utility-power-meter"><span>POWER · W</span><div>${[.1,1,5,10,20].map((value,i)=>`<label><i data-utility-led="${i}"></i><small>${value}</small></label>`).join('')}</div></div></div>
                <div class="integrated-connections utility-connections">${[0,1,2].map((i)=>`<div><small>${['AUX','TUNER','TAPE'][i]}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>PHONO</small>${hardwarePair('in','phono','phono')}</div><div><small>PRE OUT</small>${hardwarePair('out','pre')}</div><div><small>SPEAKERS L/R</small>${hardwarePair('out','speaker','amplified')}</div></div></section>`;
        }
        function configureUtilityAmp(dev){
            const ctx=appState.audio.context,monoGates=[];Object.assign(dev.state,{utilityLoudness:false,utilityMono:false});
            dev.integratedFilters.forEach(({bass},output)=>{
                dev.nodes['in'+['L','R'][output]].disconnect(bass);
                ['L','R'].forEach((ch,input)=>{const gain=ctx.createGain();dev.nodes['in'+ch].connect(gain);gain.connect(bass);monoGates.push({gain,input,output});(dev.modelAudioNodes||=[]).push(gain);});
            });
            const apply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                const st=dev.state;st.utilityLoudness=!!st.utilityLoudness;st.utilityMono=!!st.utilityMono;apply();
                monoGates.forEach(({gain,input,output})=>gain.gain.setTargetAtTime(st.utilityMono?.5:input===output?1:0,ctx.currentTime,.02));
                dev.integratedFilters.forEach(({bass,treble})=>{bass.gain.setTargetAtTime((st.direct?0:st.bass)+(st.utilityLoudness?6*(1-st.volume):0),ctx.currentTime,.025);treble.gain.setTargetAtTime((st.direct?0:st.treble)+(st.utilityLoudness?2*(1-st.volume):0),ctx.currentTime,.025);});
                dev.el.querySelectorAll('[data-utility-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(st[button.dataset.utilityToggle])));
            };
            dev.el.querySelectorAll('[data-utility-toggle]').forEach(button=>button.onclick=()=>{dev.state[button.dataset.utilityToggle]=!dev.state[button.dataset.utilityToggle];dev.applyIntegrated();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();});
            dev.applyIntegrated();
        }
        const GLASS_PREAMP_SWITCHES=[['glassLowCut','LOW FILTER'],['glassHighCut','HIGH FILTER'],['glassLoudness','LOUDNESS']];
        function glassPreampMarkup(){
            const knob=(key,label,extra='')=>`<label class="glass-pre-dial glass-pre-${key}"><button type="button" ${key==='source'?'data-pre-rotary':`data-integrated-knob="${key}"`} aria-label="${label}"></button><span class="glass-lit">${label}</span>${extra}</label>`;
            const lever=(key,label,group='pre')=>`<label class="glass-pre-switch"><button type="button" data-${group==='pre'?'pre-toggle':group==='glass'?'glass-toggle':'integrated-direct'}${group==='direct'?'':`="${key}"`} data-button-model="chromeLever" aria-pressed="false" aria-label="${label}" title="${label}"></button><span>${label}</span></label>`;
            return `<div class="device-header"><span>Pré · Vidro Clássico</span></div><section class="glass-pre-face">
                <div class="glass-pre-top" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                <div class="glass-pre-glass"><span class="glass-pre-heading glass-lit">STEREO CONTROL CENTER</span><small class="pre-status-text glass-pre-status glass-lit">STEREO</small>
                    ${knob('source','INPUT','<small class="pre-source-text glass-lit">AUXILIAR</small>')}${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${knob('volume','VOLUME','<small class="pre-volume-text" hidden>8/10</small>')}
                    <div class="glass-pre-reflections" aria-hidden="true"></div>
                </div>
                <div class="glass-pre-switch-row"><label class="glass-pre-switch"><div data-power-slot><button type="button" class="power-btn" data-button-model="chromeLever" title="Ligar / desligar"></button></div><span>POWER</span></label>
                    ${lever('preMono','MONO')}${lever('preInvert','PHASE')}${GLASS_PREAMP_SWITCHES.map(([key,label])=>lever(key,label,'glass')).join('')}${lever('','TONE DEFEAT','direct')}${lever('preMuted','MUTE')}
                </div>
                <div class="glass-pre-end glass-pre-end-left" aria-hidden="true"><i></i><i></i></div><div class="glass-pre-end glass-pre-end-right" aria-hidden="true"><i></i><i></i></div>
                <div class="integrated-connections glass-pre-connections">${['AUX','TUNER','TAPE'].map((label,i)=>`<div><small>${label}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>PHONO</small>${hardwarePair('in','phono','phono')}</div><div><small>LINE OUT</small>${hardwarePair('out','pre')}</div></div>
                <div hidden>${controlAmpSources('preGlass').map((label,i)=>`<button type="button" data-integrated-source="${i}">${label}</button>`).join('')}</div>
            </section>`;
        }
        function configureGlassPreamp(dev){
            const ctx=appState.audio.context,filters=[];
            Object.assign(dev.state,{glassLowCut:false,glassHighCut:false,glassLoudness:false});
            dev.integratedFilters.forEach(({treble,volume})=>{
                const highpass=ctx.createBiquadFilter(),lowpass=ctx.createBiquadFilter();highpass.type='highpass';lowpass.type='lowpass';highpass.Q.value=lowpass.Q.value=Math.SQRT1_2;
                treble.disconnect(volume);treble.connect(highpass);highpass.connect(lowpass);lowpass.connect(volume);filters.push({highpass,lowpass});(dev.modelAudioNodes||=[]).push(highpass,lowpass);
            });
            const baseApply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                const st=dev.state;GLASS_PREAMP_SWITCHES.forEach(([key])=>st[key]=!!st[key]);baseApply();
                filters.forEach(({highpass,lowpass})=>{highpass.frequency.setTargetAtTime(st.glassLowCut?35:.01,ctx.currentTime,.03);lowpass.frequency.setTargetAtTime(st.glassHighCut?7000:ctx.sampleRate/2,ctx.currentTime,.03);});
                dev.integratedFilters.forEach(({bass,treble})=>{bass.gain.setTargetAtTime((st.direct?0:st.bass)+(st.glassLoudness?5*(1-st.volume):0),ctx.currentTime,.025);treble.gain.setTargetAtTime((st.direct?0:st.treble)+(st.glassLoudness?2*(1-st.volume):0),ctx.currentTime,.025);});
                dev.el.querySelectorAll('[data-glass-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(st[button.dataset.glassToggle])));
                dev.el.querySelectorAll('[data-pre-toggle],[data-glass-toggle],[data-integrated-direct]').forEach(button=>button.dataset.togglePosition=button.getAttribute('aria-pressed')==='true'?'2':'0');
            };
            dev.el.querySelectorAll('[data-glass-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.glassToggle;dev.state[key]=!dev.state[key];dev.applyIntegrated();updateCableFlows();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.applyIntegrated();
        }
        function glassPreampInspector(dev){
            return `<section class="glass-pre-inspector"><p>Três entradas de linha e PHONO estéreo. LINE OUT alimenta uma potência ou caixas ativas. O painel de vidro e as inscrições iluminadas acompanham o estado de energia.</p>
                <div>${[['preMuted','Mute'],['preMono','Mono'],['preInvert','Inverter polaridade']].map(([key,label])=>`<button type="button" class="tt-insp-btn" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${label}</button>`).join('')}</div>
                <div>${GLASS_PREAMP_SWITCHES.map(([key,label])=>`<button type="button" class="tt-insp-btn" data-glass-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${label}</button>`).join('')}</div>
                <p>LOW FILTER reduz frequências abaixo de 35 Hz; HIGH FILTER suaviza a região acima de 7 kHz. LOUDNESS reforça discretamente graves e agudos em volumes baixos. TONE DEFEAT ignora os ajustes de graves e agudos, preservando os filtros e o loudness.</p></section>`;
        }

        function precisionMeterMarkup(){
            const x=angle=>64+Math.sin(angle*Math.PI/180)*49,y=angle=>77-Math.cos(angle*Math.PI/180)*49;
            const ticks=[-40,-30,-20,-15,-10,-6,-3,0,3].map((value,i)=>{const angle=-55+i*110/8,a=x(angle),b=y(angle);return `<path d="M${a} ${b}l${Math.sin(angle*Math.PI/180)*-5} ${Math.cos(angle*Math.PI/180)*5}" stroke="${value>0?'#a0392e':'#323933'}" stroke-width=".8"/><text x="${64+Math.sin(angle*Math.PI/180)*59}" y="${77-Math.cos(angle*Math.PI/180)*59}" text-anchor="middle" font-size="5" fill="${value>0?'#9c352b':'#3d4439'}">${value>0?'+':''}${value}</text>`;}).join('');
            return `<div class="precision-meter"><svg viewBox="0 0 128 86" role="img" aria-label="Modulômetro estéreo de saída em dBFS"><path d="M3 3h122v79H3Z" fill="#e2dcc2" stroke="#9b9d8d"/><path d="M${x(-55)} ${y(-55)}A49 49 0 0 1 ${x(55)} ${y(55)}" stroke="#525c4c" stroke-width=".6" fill="none"/>${ticks}<text x="64" y="55" text-anchor="middle" fill="#4d5647" font-size="5" letter-spacing="1.3">OUTPUT · dBFS</text><text x="24" y="69" fill="#333b32" font-size="6">L</text><text x="99" y="69" fill="#a44337" font-size="6">R</text><path data-precision-needle="0" d="M63 77V24" stroke="#27372e" stroke-width="1" transform="rotate(-55 64 77)"/><path data-precision-needle="1" d="M65 77V26" stroke="#b13d31" stroke-width=".9" transform="rotate(-55 64 77)"/><ellipse cx="64" cy="78" rx="8" ry="3.5" fill="#3b4637"/></svg><i class="precision-meter-glass"></i></div>`;
        }
        function precisionPreampMarkup(){
            return `<div class="device-header"><span>Pré · Precisão</span></div><section class="precision-face"><div class="precision-front"><i class="precision-screw precision-screw-a"></i><i class="precision-screw precision-screw-b"></i><i class="precision-screw precision-screw-c"></i><i class="precision-screw precision-screw-d"></i><span class="precision-engraving">STEREO LINE PREAMPLIFIER</span>${precisionMeterMarkup()}
                <label class="precision-source"><button data-pre-rotary aria-label="Selecionar entrada de linha"></button><span>INPUT</span><small class="pre-source-text">LINE 1</small></label>
                <label class="precision-gain"><button data-precision-gain data-button-model="industrialToggle" data-toggle-position="0" aria-label="Ganho de saída: 0, 6 ou 12 dB" title="Ganho: 0 / +6 / +12 dB"></button><span>GAIN</span><small data-precision-gain-label>0 dB</small></label>
                <label class="precision-volume"><button data-integrated-knob="volume" aria-label="Volume principal"></button><span>VOLUME</span><small class="pre-volume-text">8/10</small></label>
                <label class="precision-balance"><button data-integrated-knob="balance" aria-label="Balanço esquerdo / direito"></button><span>BALANCE</span></label>
                <div class="precision-switches">${[['preMuted','MUTE'],['preMono','MONO'],['preInvert','PHASE']].map(([key,label])=>`<label><button data-pre-toggle="${key}" data-button-model="industrialToggle" aria-pressed="false" aria-label="${label}"></button><span>${label}</span></label>`).join('')}</div><small class="pre-status-text precision-status">STEREO</small><div class="precision-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button></div></div>
                <div class="integrated-connections precision-connections">${[0,1,2,3].map(i=>`<div><small>LINE ${i+1}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>LINE OUT</small>${hardwarePair('out','pre')}</div></div><div hidden>${[0,1,2,3].map(i=>`<button data-integrated-source="${i}">LINE ${i+1}</button>`).join('')}</div></section>`;
        }
        function configurePrecisionPreamp(dev){
            const apply=dev.applyIntegrated;dev.state.precisionGain=0;
            dev.applyIntegrated=()=>{
                const st=dev.state;st.precisionGain=[0,6,12].includes(st.precisionGain)?st.precisionGain:0;apply();
                dev.el.querySelector('[data-precision-gain]').dataset.togglePosition=String(st.precisionGain/6);dev.el.querySelector('[data-precision-gain]').setAttribute('aria-label',`Ganho de saída: ${st.precisionGain} dB. Clique para alternar 0, 6 e 12 dB.`);dev.el.querySelector('[data-precision-gain-label]').textContent=(st.precisionGain?'+':'')+st.precisionGain+' dB';
                if(appState.interface.selectedDeviceId===dev.id){const slider=inspectorContent.querySelector('[data-precision-inspector-gain]');if(slider){slider.value=String(st.precisionGain);syncInspectorGainVisual(slider);const value=inspectorContent.querySelector('[data-precision-gain-value]');if(value)value.textContent=(st.precisionGain?'+':'')+st.precisionGain+' dB';}}
                dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.dataset.togglePosition=st[button.dataset.preToggle]?'2':'0');
            };
            dev.el.querySelector('[data-precision-gain]').onclick=()=>{dev.state.precisionGain=(dev.state.precisionGain+6)%18;dev.applyIntegrated();scheduleProjectSave();};dev.applyIntegrated();
        }
        function updateReferenceHardware(now){
            Object.values(appState.project.devices).forEach(dev=>{
                if(dev.type==='integratedUtility'){
                    const power=dev.powered?Math.max(...['L','R'].map(ch=>wattsAtLoad(amplifierChannelRms(dev,ch),dev.channelLoads?.[ch]??8))):0;
                    dev.el.querySelectorAll('[data-utility-led]').forEach((led,i)=>led.classList.toggle('is-on',power>=[.1,1,5,10,20][i]));
                }
                if(dev.type==='prePrecision')dev.el.querySelectorAll('[data-precision-needle]').forEach((needle,i)=>{
                    const db=audioDb(dev.powered?dev.meters?.levels[i]||0:0),angle=-55+Math.max(0,Math.min(1,(db+40)/43))*110;
                    const calibration=deviceGaugeCalibrationAngle(dev,now,-55,55);
                    needle.setAttribute('transform',`rotate(${calibration??dampedNeedle(needle,angle,now,-55).toFixed(3)} 64 77)`);
                });
            });
        }

        function integratedGauge(watts){
            const point=(angle,r)=>({x:50+Math.sin(angle*Math.PI/180)*r,y:62-Math.cos(angle*Math.PI/180)*r});
            const markings=[.0001,.001,.01,.1,1].map(f=>{const a=-48+(Math.log10(f)+4)*24,p=point(a,43),q=point(a,47),t=point(a,53);return `<path d="M${p.x} ${p.y}L${q.x} ${q.y}"/><text x="${t.x}" y="${t.y}" text-anchor="middle" font-size="5.5">${Number((f*watts).toFixed(3))}</text>`;}).join('');
            return `<div class="integrated-gauges">${['L','R'].map((ch,i)=>`<div class="integrated-gauge"><svg viewBox="0 0 100 70" aria-label="Potência simulada ${ch}"><g class="integrated-scale">${markings}<text x="85" y="59" font-size="7" text-anchor="end">W · ${ch}</text></g><line data-integrated-needle="${i}" x1="50" y1="62" x2="50" y2="19" transform="rotate(-48 50 62)"/><circle cx="50" cy="62" r="2"/></svg></div>`).join('')}</div>`;
        }
        function integratedMarkup(type){
            if(type==='integratedUtility')return utilityAmpMarkup();
            const config=INTEGRATED_AMPS[type];
            const knob=(key,label,big=false)=>`<label class="integrated-knob-group"><button type="button" class="integrated-knob ${big?'is-large':''}" data-integrated-knob="${key}" role="slider" tabindex="0" aria-label="${label}" title="${label} · arraste para ajustar"><i></i></button><span>${label}</span></label>`;
            const sources=`<div class="integrated-sources"><span>INPUT</span><div>${['LINE 1','LINE 2','LINE 3','PHONO'].map((label,index)=>`<button type="button" data-integrated-source="${index}" aria-pressed="${index===0}">${label}</button>`).join('')}</div></div>`;
            const ports=(io,node,format,signal)=>`<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${node==='phono'?'Phono':io==='in'?'Linha':signal==='amplified'?'Saída amplificada':'Saída de linha'} ${ch}" ${signal==='amplified'?'data-role="amp-speaker-out"':''}></div>`).join('')}</div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="integrated-face finish-${config.finish}"><div class="integrated-main"><div class="integrated-power"><div data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div><i class="integrated-status-led" aria-hidden="true"></i><div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída de fones P10 estéreo"></div><small>PHONES</small></div>${type==='integratedMinimal'?knob('volume','VOLUME',true):sources}${config.meters?integratedGauge(config.watts):'<div class="integrated-green-window" aria-hidden="true"><i></i></div>'}${type==='integratedMinimal'?sources:knob('volume','VOLUME',true)}${config.tone?`<div class="integrated-tones">${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}<button type="button" class="integrated-direct" data-integrated-direct aria-pressed="false">DIRECT</button></div>`:''}</div><div class="integrated-connections">${[0,1,2].map(i=>`<div><small>LINE ${i+1}</small>${ports('in','line'+i,'rca','line')}</div>`).join('')}<div><small>PHONO</small>${ports('in','phono','rca','phono')}</div><div><small>PRE OUT</small>${ports('out','pre','rca','line')}</div><div><small>SPEAKERS · L/R</small>${ports('out','speaker','wire','amplified')}</div></div></section>`;
        }
        function configureIntegratedAmp(dev){
            const config=controlAmpConfig(dev.type),ctx=appState.audio.context;
            Object.assign(dev.state,{integratedSource:0,balance:0,direct:false});
            dev.integratedGates=[];dev.integratedFilters=[];dev.powerNodes=[];
            dev.nodes.outPhone=ctx.createChannelMerger(2);
            ['L','R'].forEach((ch,channel)=>{
                const bus=dev.nodes['in'+ch]=ctx.createGain();
                for(let i=0;i<4;i++){
                    const input=dev.nodes[(i===3&&config.phono!==false?'phono':'line'+i)+ch]=ctx.createGain(),gate=ctx.createGain();
                    dev.integratedGates.push({gate,index:i});
                    if(i===3&&config.phono!==false){
                        const low=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),gain=ctx.createGain();
                        low.type='lowshelf';low.frequency.value=120;low.gain.value=9;high.type='highshelf';high.frequency.value=2122;high.gain.value=-9;gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        input.connect(low);low.connect(high);high.connect(gain);connectPhonoPlayback(dev,gain,gate);
                    }else input.connect(gate);
                    gate.connect(bus);
                }
                const bass=ctx.createBiquadFilter(),treble=ctx.createBiquadFilter(),volume=ctx.createGain(),power=ctx.createGain();
                bass.type='lowshelf';bass.frequency.value=100;treble.type='highshelf';treble.frequency.value=3500;
                bus.connect(bass);bass.connect(treble);treble.connect(volume);volume.connect(power);
                const speaker=dev.nodes['speaker'+ch]=ctx.createGain(),pre=dev.nodes['pre'+ch]=ctx.createGain();
                power.connect(speaker);power.connect(pre);power.connect(dev.nodes.outPhone,0,channel);
                dev.powerNodes.push(power);dev.integratedFilters.push({bass,treble,volume,ch});
            });
            dev.applyIntegrated=()=>{
                const t=ctx.currentTime,st=dev.state;
                st.volume=Math.max(0,Math.min(1,st.volume));st.bass=Math.max(-10,Math.min(10,st.bass||0));st.treble=Math.max(-10,Math.min(10,st.treble||0));st.balance=Math.max(-1,Math.min(1,st.balance||0));if(CUSTOM_PREAMPS[dev.type]){st.subLevel=Math.max(0,Math.min(1,st.subLevel??.8));st.subFrequency=Math.max(40,Math.min(200,st.subFrequency??80));}st.integratedSource=Math.max(0,Math.min(3,Math.round(st.integratedSource||0)));
                dev.integratedGates.forEach(({gate,index})=>gate.gain.setTargetAtTime(index===st.integratedSource?1:0,t,.02));
                dev.integratedFilters.forEach(({bass,treble,volume,ch})=>{
                    bass.gain.setTargetAtTime(config.tone&&!st.direct?st.bass:0,t,.025);treble.gain.setTargetAtTime(config.tone&&!st.direct?st.treble:0,t,.025);
                    const balance=config.tone||config.balance?st.balance||0:0;volume.gain.setTargetAtTime((st.preMuted?0:st.volume)*(ch==='L'?1-Math.max(0,balance):1+Math.min(0,balance)),t,.02);
                });
                dev.el.querySelectorAll('[data-integrated-source]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.integratedSource)===st.integratedSource)));
                dev.el.querySelector('[data-integrated-direct]')?.setAttribute('aria-pressed',String(!!st.direct));
                dev.el.querySelectorAll('[data-integrated-knob]').forEach(knob=>{
                    const key=knob.dataset.integratedKnob,min=key==='volume'||key==='subLevel'?0:key==='balance'?-1:-10,max=['volume','subLevel','balance'].includes(key)?1:10;
                    knob.style.setProperty('--integrated-angle',(-135+(st[key]-min)/(max-min)*270)+'deg');knob.setAttribute('aria-valuemin',min);knob.setAttribute('aria-valuemax',max);knob.setAttribute('aria-valuenow',st[key]);
                });
            };
            dev.applyIntegrated();
            dev.el.querySelectorAll('[data-integrated-source]').forEach(button=>button.addEventListener('click',()=>{dev.state.integratedSource=Number(button.dataset.integratedSource);dev.applyIntegrated();updateCableFlows();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.el.querySelector('[data-integrated-direct]')?.addEventListener('click',()=>{dev.state.direct=!dev.state.direct;dev.applyIntegrated();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();});
            dev.el.querySelectorAll('[data-integrated-knob]').forEach(knob=>{
                const key=knob.dataset.integratedKnob,min=key==='volume'||key==='subLevel'?0:key==='balance'?-1:-10,max=['volume','subLevel','balance'].includes(key)?1:10;
                const set=value=>{dev.state[key]=Number((min+Math.round(Math.max(0,Math.min(1,(value-min)/(max-min)))*10)/10*(max-min)).toFixed(3));dev.applyIntegrated();const input=document.querySelector(`[data-integrated-setting="${key}"],[data-custom-pre-setting="${key}"]`);if(input&&appState.interface.selectedDeviceId===dev.id){input.value=dev.state[key];input.previousElementSibling.querySelector('output').textContent=integratedSettingText(key,dev.state[key]);}scheduleProjectSave();};
                Hardware.bindKnob(knob,{get:()=>dev.state[key],set,min,max});
            });
        }
        function integratedSettingText(key,value){return key==='volume'||key==='subLevel'?Math.round(value*10)+'/10':key==='balance'?value===0?'Centro':(value<0?'L ':'R ')+Math.round(Math.abs(value)*5):(value>0?'+':'')+value+' dB';}
        function integratedInspectorHtml(dev){
            const config=controlAmpConfig(dev.type),keys=config.tone&&dev.type!=='preClassic'?[['volume','Volume',0,1],['bass','Graves',-10,10],['treble','Agudos',-10,10],['balance','Balanço L/R',-1,1]]:[['volume','Volume',0,1],...(config.balance?[['balance','Balanço L/R',-1,1]]:[])];
            return `<section class="flex flex-col gap-4"><span class="text-sm text-gray-300">Fonte selecionada</span><div class="grid grid-cols-2 gap-2">${controlAmpSources(dev.type).map((name,index)=>`<button class="tt-insp-btn ${dev.state.integratedSource===index?'is-on':''}" data-integrated-inspector-source="${index}" aria-pressed="${dev.state.integratedSource===index}">${name}</button>`).join('')}</div>${keys.map(([key,name,min,max])=>`<label class="flex flex-col gap-2 text-sm text-gray-300"><span>${name} <output>${integratedSettingText(key,dev.state[key])}</output></span><input type="range" data-integrated-setting="${key}" min="${min}" max="${max}" step="${(max-min)/10}" value="${dev.state[key]}"></label>`).join('')}${config.tone?`<button class="tt-insp-btn ${dev.state.direct?'is-on':''}" data-integrated-inspector-direct title="Ignora os ajustes de graves e agudos, deixando a tonalidade neutra. Volume, balanço e subwoofer continuam ativos. Ao desativar, os ajustes anteriores voltam a ser aplicados." aria-pressed="${!!dev.state.direct}">DIRECT</button>`:''}</section>`;
        }
        function bindIntegratedInspector(dev){
            if(!controlAmpConfig(dev.type))return;
            inspectorContent.querySelectorAll('[data-integrated-setting]').forEach(input=>input.addEventListener('input',()=>{const key=input.dataset.integratedSetting;dev.state[key]=Number(input.value);dev.applyIntegrated();input.previousElementSibling.querySelector('output').textContent=integratedSettingText(key,dev.state[key]);scheduleProjectSave();}));
            inspectorContent.querySelectorAll('[data-integrated-inspector-source]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-integrated-source="${button.dataset.integratedInspectorSource}"]`).click()));
            inspectorContent.querySelector('[data-integrated-inspector-direct]')?.addEventListener('click',()=>dev.el.querySelector('[data-integrated-direct]').click());
        }
        let lastIntegratedDisplay=0;
        function updateIntegratedDisplays(now){
            if(now-lastIntegratedDisplay<80)return;const elapsed=Math.min(.3,(now-lastIntegratedDisplay)/1000);lastIntegratedDisplay=now;
            Object.values(appState.project.devices).filter(dev=>CUSTOM_PREAMPS[dev.type]).forEach(dev=>{
                dev.el.querySelectorAll('[data-pre-level]').forEach(bar=>{const level=dev.powered?dev.meters?.levels[Number(bar.dataset.preLevel)]||0:0;bar.style.width=Math.max(0,Math.min(100,(audioDb(level)+60)/60*100))+'%';});
                drawReferencePreampDisplay(dev);
            });
            Object.values(appState.project.devices).filter(dev=>INTEGRATED_AMPS[dev.type]?.meters).forEach(dev=>{
                dev.integratedEnvelope||=[0,0];
                dev.el.querySelectorAll('[data-integrated-needle]').forEach(needle=>{
                    const i=Number(needle.dataset.integratedNeedle),value=dev.powered?amplifierChannelRms(dev,i?'R':'L'):0;
                    dev.integratedEnvelope[i]+=(value-dev.integratedEnvelope[i])*(1-Math.exp(-elapsed/.13));
                    const load=dev.channelLoads?.[i?'R':'L']??Infinity,watts=wattsAtLoad(dev.integratedEnvelope[i],load);
                    const fraction=Math.max(.0001,Math.min(1,watts/dev.state.ratedWatts));
                    const calibration=deviceGaugeCalibrationAngle(dev,now,-48,48);
                    needle.setAttribute('transform',`rotate(${calibration??dampedNeedle(needle,-48+(Math.log10(fraction)+4)*24,now,-48)} 50 62)`);
                    needle.parentElement.setAttribute('aria-label',`Potência simulada ${i?'R':'L'}: ${watts.toFixed(2)} W`);
                });
            });
        }

        function drawReferencePreampDisplay(dev){
            const canvas=dev.el.querySelector('.pre-reference-pixels');if(!canvas)return;
            const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0b2014';ctx.fillRect(0,0,288,62);
            ctx.fillStyle='#163321';for(let y=1;y<62;y+=2)for(let x=1;x<288;x+=2)ctx.fillRect(x,y,1,1);
            if(!dev.powered){canvas.setAttribute('aria-label','Pré-amplificador desligado');return;}
            const draw=(text,x,y,scale=1)=>{
                ctx.fillStyle='#a7ed7a';for(const char of text){const glyph=SIGNAL_PIXEL_FONT[char];glyph?.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='1')ctx.fillRect(x+dx*scale,y+dy*scale,scale,scale);}));x+=6*scale;}
            };
            const st=dev.state,source=controlAmpSources(dev.type)[st.integratedSource].toUpperCase(),volume=st.preMuted?'MUTE':Math.round(st.volume*10)+'/10';
            draw(source,8,6,2);draw([st.preMono?'MONO':'STEREO',st.preInvert?'INVERT':''].filter(Boolean).join(' '),8,28);
            draw(volume,196,6,3);
            [0,1].forEach(ch=>{const y=43+ch*8;draw(ch?'R':'L',8,y);const level=dev.meters?.levels[ch]||0,amount=st.preMuted?0:Math.max(0,Math.min(1,(audioDb(level)+60)/60));for(let n=0;n<65;n++){ctx.fillStyle=n<amount*65?'#8ed56c':'#25452c';ctx.fillRect(20+n*4,y+2,2,4);}});
            canvas.setAttribute('aria-label',`${source}, volume ${st.preMuted?'mudo':Math.round(st.volume*10)+' de 10'}, ${st.preMono?'mono':'estéreo'}`);
        }
        function customPreampMarkup(type){
            if(type==='preClassic')return classicPreampMarkup();
            if(type==='preGlass')return glassPreampMarkup();
            if(type==='prePrecision')return precisionPreampMarkup();
            const config=CUSTOM_PREAMPS[type];
            const knob=(key,label,big=false)=>`<label class="integrated-knob-group"><button class="integrated-knob ${big?'is-large':''}" data-integrated-knob="${key}" role="slider" aria-label="${label}"><i></i></button><span>${label}</span></label>`;
            const encoder=`<label class="integrated-knob-group"><button class="integrated-knob is-large" data-pre-rotary role="slider" aria-label="Selecionar fonte" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><i></i></button><span>INPUT</span></label>`;
            const toggle=(key,label)=>`<button type="button" class="integrated-direct" data-pre-toggle="${key}" aria-pressed="false">${label}</button>`;
            const port=(io,node,signal)=>`<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${signal==='phono'?'Phono':io==='in'?'Entrada de linha':'Saída de linha'} ${ch}"></div>`).join('')}</div>`;
            const screen=`<div class="custom-pre-screen">${type==='preReference'?'<canvas class="pre-reference-pixels" width="288" height="62" role="img" aria-label="Visor verde do pré-amplificador"></canvas>':''}<span class="pre-source-text">LINE 1</span><strong class="pre-volume-text">8/10</strong><small class="pre-status-text">STEREO</small><div class="pre-stereo-levels">${[0,1].map(i=>`<span><b>${i?'R':'L'}</b><em><i data-pre-level="${i}"></i></em></span>`).join('')}</div></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="integrated-face custom-pre-face pre-finish-${config.finish}">${type==='preReference'?'<i class="pre-handle handle-left" aria-hidden="true"></i><i class="pre-handle handle-right" aria-hidden="true"></i>':''}<div class="custom-pre-main">${encoder}<div class="custom-pre-center">${screen}<div class="custom-pre-switches"><div data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div>${toggle('preMuted','MUTE')}${type==='preReference'?toggle('preMono','MONO')+toggle('preInvert','INVERT'):config.tone?'<button type="button" class="integrated-direct" data-integrated-direct aria-pressed="false">DIRECT</button>':''}</div></div>${knob('volume','VOLUME',true)}${config.tone?`<div class="custom-pre-tones">${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${config.crossover?knob('subLevel','SUB'):''}</div>`:knob('balance','BALANCE')}</div><div class="integrated-connections">${[0,1,2,3].map(index=>`<div><small>${index===3&&config.phono?'PHONO':'LINE '+(index+1)}</small>${port('in',index===3&&config.phono?'phono':'line'+index,index===3&&config.phono?'phono':'line')}</div>`).join('')}<div><small>LINE OUT</small>${port('out','pre','line')}</div>${config.sub?'<div><small>SUB · MONO</small><div class="port" data-type="rca" data-io="out" data-node="subOut" data-signal="line" data-role="lfe-out" title="Subwoofer · saída mono em nível de linha"></div></div>':''}${config.phones?`<div><small>PHONES</small><div class="port" data-type="${config.finish==='control'?'p2':'p10'}" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída estéreo para fones"></div></div>`:''}</div><div hidden>${controlAmpSources(type).map((name,index)=>`<button data-integrated-source="${index}">${name}</button>`).join('')}</div></section>`;
        }
        function configureCustomPreamp(dev){
            const config=CUSTOM_PREAMPS[dev.type],ctx=appState.audio.context;
            Object.assign(dev.state,{preMuted:false,preMono:false,preInvert:false,subLevel:.8,subFrequency:80});
            // A matrix before the output gates provides real mono and polarity inversion.
            const matrix=[];
            dev.integratedFilters.forEach(({volume},input)=>{
                volume.disconnect(dev.powerNodes[input]);
                [0,1].forEach(output=>{const gain=ctx.createGain();volume.connect(gain);gain.connect(dev.powerNodes[output]);matrix.push({gain,input,output});(dev.modelAudioNodes||=[]).push(gain);});
            });
            let subLevel,subFilter;
            if(config.sub){
                const sum=ctx.createGain();sum.gain.value=.5;
                dev.powerNodes.forEach(power=>power.connect(sum));
                subLevel=ctx.createGain();dev.nodes.subOut=ctx.createGain();
                if(config.crossover){subFilter=ctx.createBiquadFilter();subFilter.type='lowpass';subFilter.frequency.value=80;subFilter.Q.value=.707;sum.connect(subFilter);subFilter.connect(subLevel);}else sum.connect(subLevel);
                subLevel.connect(dev.nodes.subOut);
            }
            const baseApply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                baseApply();const st=dev.state,t=ctx.currentTime;
                matrix.forEach(({gain,input,output})=>gain.gain.setTargetAtTime((dev.preMatrixCoefficient?dev.preMatrixCoefficient(input,output):(st.preMono ? .5 : input===output ? 1 : 0))*(st.preInvert?-1:1)*(dev.type==='prePrecision'?10**((st.precisionGain||0)/20):1),t,.02));
                subLevel?.gain.setTargetAtTime(st.subLevel,t,.02);subFilter?.frequency.setTargetAtTime(st.subFrequency,t,.03);
                const rotor=dev.el.querySelector('[data-pre-rotary]');rotor.style.setProperty('--integrated-angle',(-120+st.integratedSource*80)+'deg');rotor.setAttribute('aria-valuenow',st.integratedSource);rotor.setAttribute('aria-valuetext',controlAmpSources(dev.type)[st.integratedSource]);
                dev.el.querySelector('.pre-source-text').textContent=controlAmpSources(dev.type)[st.integratedSource].toUpperCase();
                dev.el.querySelector('.pre-volume-text').textContent=st.preMuted?'MUTE':Math.round(st.volume*10)+'/10';
                dev.el.querySelector('.pre-status-text').textContent=[st.preMono?'MONO':'STEREO',st.preInvert?'INVERT':'',st.direct?'DIRECT':''].filter(Boolean).join(' · ');
                dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(!!st[button.dataset.preToggle])));
                drawReferencePreampDisplay(dev);
            };
            const rotor=dev.el.querySelector('[data-pre-rotary]');
            const setSource=index=>{dev.el.querySelector(`[data-integrated-source="${Math.max(0,Math.min(3,index))}"]`).click();};
            Hardware.bindKnob(rotor,{get:()=>dev.state.integratedSource,set:setSource,min:0,max:3,step:1,format:value=>controlAmpSources(dev.type)[value]});
            dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.preToggle;dev.state[key]=!dev.state[key];dev.applyIntegrated();updateCableFlows();if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.applyIntegrated();
        }
        function customPreampInspectorHtml(dev){
            if(dev.type==='preClassic')return classicPreampInspector(dev);
            if(dev.type==='preGlass')return glassPreampInspector(dev);
            if(dev.type==='prePrecision')return `<div class="precision-inspector-options">${[['preMuted','Silenciar'],['preMono','Mono'],['preInvert','Inverter polaridade']].map(([key,name])=>`<button class="tt-insp-btn" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${name}</button>`).join('')}<label class="flex flex-col gap-2 text-sm text-gray-300"><span>Ganho de saída <output data-precision-gain-value>${dev.state.precisionGain?'+':''}${dev.state.precisionGain} dB</output></span><input class="gain-spark-slider" data-precision-inspector-gain data-gain-steps="3" type="range" min="0" max="12" step="6" value="${dev.state.precisionGain}" aria-label="Ganho de saída" aria-valuetext="${dev.state.precisionGain?'+':''}${dev.state.precisionGain} dB"></label><p>O modulômetro acompanha as saídas L/R reais em dBFS. A agulha preta representa L e a vermelha representa R; o ganho selecionado atua antes das saídas.</p></div>`;
            const config=CUSTOM_PREAMPS[dev.type];
            return `<div class="flex flex-col gap-3">${[['preMuted','Mute'],...(dev.type==='preReference'?[['preMono','Mono'],['preInvert','Inverter polaridade']]:[])].map(([key,name])=>`<button class="tt-insp-btn ${dev.state[key]?'is-on':''}" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${name}</button>`).join('')}${config.crossover?`<label class="flex flex-col gap-2 text-sm text-gray-300"><span>Subwoofer <output>${Math.round(dev.state.subLevel*10)}/10</output></span><input type="range" data-custom-pre-setting="subLevel" min="0" max="1" step=".1" value="${dev.state.subLevel}"></label><label class="flex flex-col gap-2 text-sm text-gray-300"><span>Corte do subwoofer <output>${dev.state.subFrequency} Hz</output></span><input type="range" data-custom-pre-setting="subFrequency" min="40" max="200" step="16" value="${dev.state.subFrequency}"></label>`:''}</div>`;
        }
        function bindCustomPreampInspector(dev){
            if(!CUSTOM_PREAMPS[dev.type])return;
            if(dev.type==='preClassic')bindClassicPreampInspector(dev);
            inspectorContent.querySelectorAll('[data-glass-inspector-toggle]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-glass-toggle="${button.dataset.glassInspectorToggle}"]`).click()));
            inspectorContent.querySelector('[data-precision-inspector-gain]')?.addEventListener('input',event=>{dev.state.precisionGain=Number(event.target.value);dev.applyIntegrated();inspectorContent.querySelector('[data-precision-gain-value]').textContent=(dev.state.precisionGain?'+':'')+dev.state.precisionGain+' dB';scheduleProjectSave();});
            inspectorContent.querySelectorAll('[data-pre-inspector-toggle]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-pre-toggle="${button.dataset.preInspectorToggle}"]`).click()));
            inspectorContent.querySelectorAll('[data-custom-pre-setting]').forEach(input=>input.addEventListener('input',()=>{const key=input.dataset.customPreSetting;dev.state[key]=Number(input.value);dev.applyIntegrated();input.previousElementSibling.querySelector('output').textContent=key==='subLevel'?Math.round(dev.state[key]*10)+'/10':dev.state[key]+' Hz';scheduleProjectSave();}));
        }


        function valveAssemblyMarkup(){
            const id='valve_'+Math.random().toString(36).slice(2,10);
            const fill=name=>`url(#${id}_${name})`;
            const transformer=(x,y,w,h)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill('black')}" stroke="#58645f" stroke-width="1.3"/><path d="M${x+9} ${y+4}H${x+w-9}" stroke="#89948b" stroke-opacity=".35" stroke-width="2"/><rect x="${x+8}" y="${y+h-14}" width="${w-16}" height="14" rx="2" fill="#1c2623" stroke="#56625a" stroke-width=".6"/>${[0,1,2].map(n=>`<path d="M${x+13} ${y+h-10+n*3}h${w-26}" stroke="#526055" stroke-opacity=".45" stroke-width=".7"/>`).join('')}<circle cx="${x+13}" cy="${y+h-7}" r="1.6" fill="#869488"/><circle cx="${x+w-13}" cy="${y+h-7}" r="1.6" fill="#869488"/></g>`;
            const tube=(cx,y,w,h,small=false)=>{
                const x=cx-w/2,base=y+h-11,plateX=x+w*.25,plateY=y+h*.24,plateW=w*.5,plateH=h*.51;
                return `<g><ellipse cx="${cx}" cy="${base+9}" rx="${w*.6}" ry="3" fill="#142321" opacity=".45"/><rect x="${x-3}" y="${base}" width="${w+6}" height="11" rx="3" fill="${fill('socket')}" stroke="#52675a" stroke-width=".8"/><path d="M${x+1} ${base+2}h${w-2}" stroke="#9aafa0" stroke-opacity=".5"/><rect x="${x}" y="${y}" width="${w}" height="${h-7}" rx="${w*.43}" fill="${fill('glass')}" stroke="#b7ced0" stroke-opacity=".8" stroke-width="1.2"/><ellipse cx="${cx}" cy="${y+w*.24}" rx="${w*.29}" ry="${w*.12}" fill="#bdc9bc" opacity=".36"/><rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="2" fill="${fill('plate')}" stroke="#8e9a8a" stroke-width=".7"/>${Array.from({length:small?5:8},(_,n)=>`<path d="M${plateX+3} ${plateY+5+n*(plateH-10)/(small?4:7)}h${plateW-6}" stroke="#a3ad96" stroke-opacity=".38" stroke-width=".65"/>`).join('')}<path d="M${cx-w*.14} ${y+h*.19}V${base-2}M${cx+w*.14} ${y+h*.19}V${base-2}" stroke="#b0b59a" stroke-opacity=".6" stroke-width=".8"/><path d="M${x+w*.15} ${y+w*.34}v${h-w*.5-17}" stroke="#e7faff" stroke-opacity=".52" stroke-width="${small?1.2:2}" stroke-linecap="round"/><path d="M${x+w*.86} ${y+w*.42}v${h-w*.6-22}" stroke="#c6e5eb" stroke-opacity=".2" stroke-width="1"/><g class="valve-svg-glow"><ellipse cx="${cx}" cy="${base-6}" rx="${w*.22}" ry="${small?8:12}" fill="#ffa13a" opacity=".26" filter="${fill('glow')}"/><path d="M${cx-1.5} ${base-12}v10m3-10v10" stroke="#ffd89a" stroke-width="${small?1:1.5}" stroke-linecap="round"/><ellipse cx="${cx}" cy="${base+2}" rx="${w*.4}" ry="2" fill="#80dc9a" opacity=".6"/></g></g>`;
            };
            return `<svg class="valve-assembly" viewBox="0 0 760 184" aria-hidden="true"><defs><linearGradient id="${id}_black"><stop stop-color="#4b5650"/><stop offset=".13" stop-color="#1c2521"/><stop offset=".75" stop-color="#0b1511"/><stop offset="1" stop-color="#3c4940"/></linearGradient><linearGradient id="${id}_deck" x2="0" y2="1"><stop stop-color="#eef7f3"/><stop offset=".24" stop-color="#bccdc7"/><stop offset=".7" stop-color="#6e8984"/><stop offset="1" stop-color="#ceddd8"/></linearGradient><linearGradient id="${id}_glass"><stop stop-color="#cce7e52b"/><stop offset=".22" stop-color="#5a706a99"/><stop offset=".6" stop-color="#172d25cc"/><stop offset=".84" stop-color="#91b5a426"/><stop offset="1" stop-color="#d6ece447"/></linearGradient><linearGradient id="${id}_plate"><stop stop-color="#7e8980"/><stop offset=".27" stop-color="#38483b"/><stop offset=".75" stop-color="#26382c"/><stop offset="1" stop-color="#7f8d7c"/></linearGradient><linearGradient id="${id}_socket" x2="0" y2="1"><stop stop-color="#7d9381"/><stop offset=".3" stop-color="#324936"/><stop offset="1" stop-color="#182e1d"/></linearGradient><filter id="${id}_glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2"/></filter></defs><path d="M7 161H753L760 181H0Z" fill="${fill('deck')}" stroke="#9aafa8"/><path d="M9 164H751" stroke="#f3fff9" stroke-width="2"/>${transformer(25,27,190,137)}${transformer(285,13,190,151)}${transformer(545,27,190,137)}${[160,306,454,600].map(x=>tube(x,30,60,145)).join('')}${[60,166,272,380,488,594,700].map(x=>tube(x,106,31,76,true)).join('')}<path d="M1 183H759" stroke="#d2e7dd" stroke-width="2"/></svg>`;
        }
        function customPowerMarkup(type){
            const config=CUSTOM_POWER_AMPS[type];
            const ports=(io,node,format,signal)=>`<div class="custom-power-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${format==='wire'?'data-role="amp-speaker-out"':''} title="${io==='in'?'Entrada de linha':'Saída amplificada para caixa'} ${ch}"></div>`).join('')}</div>`;
            const connectorRow=`<div class="custom-power-connections"><div><small>LINE IN · L/R</small>${ports('in','in','rca','line')}</div><div class="custom-power-energy" data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div><div><small>SPEAKERS · L/R</small>${ports('out','out','wire','amplified')}</div></div>`;
            const valveArt=type==='powerValve'?valveAssemblyMarkup():'';
            const powerAngle=watts=>watts<=0?-100:-100+(Math.log10(watts/250)+4)*46;
            const biasTicks=[0,.1,1,10,100,250].map(watts=>{const angle=powerAngle(watts)*Math.PI/180;const label=watts===0?'0':String(watts);return `<path d="M${60+Math.sin(angle)*40} ${62-Math.cos(angle)*40}L${60+Math.sin(angle)*46} ${62-Math.cos(angle)*46}"/><text x="${60+Math.sin(angle)*32}" y="${64-Math.cos(angle)*32}" text-anchor="middle" style="font-size:6px;letter-spacing:0">${label}</text>`;}).join('');
            const biasArt=`<i class="bias-heatsink heatsink-left" aria-hidden="true"></i><i class="bias-heatsink heatsink-right" aria-hidden="true"></i><div class="bias-center"><div class="bias-meter"><svg viewBox="0 0 120 120" role="img" aria-label="Potência de saída simulada em watts"><g>${biasTicks}</g><text x="60" y="97" text-anchor="middle">W</text><line x1="60" y1="62" x2="60" y2="22" data-bias-needle transform="rotate(-100 60 62)"/><circle cx="60" cy="62" r="3"/></svg></div></div><div class="bias-vent vent-left"></div><div class="bias-vent vent-right"></div>`;
            const dualArt='<i class="dual-handle handle-left" aria-hidden="true"></i><i class="dual-handle handle-right" aria-hidden="true"></i><div class="dual-top-vents" aria-hidden="true"></div><div class="custom-power-indicators"><span><i data-dual-led="0"></i><b>L</b></span><span><i data-dual-led="1"></i><b>R</b></span></div>';
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="custom-power-face power-finish-${config.finish}"><div class="custom-power-main">${type==='powerValve'?valveArt:type==='powerBias'?biasArt:dualArt}</div>${connectorRow}</section>`;
        }
        function configureCustomPower(dev){
            const ctx=appState.audio.context,gains={};dev.powerNodes=[];dev.state.channelGain={L:DEFAULT_POWER_GAIN,R:DEFAULT_POWER_GAIN};
            ['L','R'].forEach(ch=>{
                const input=dev.nodes['in'+ch]=ctx.createGain(),gain=gains[ch]=ctx.createGain(),power=ctx.createGain(),stage=ctx.createGain(),output=dev.nodes['out'+ch]=ctx.createGain();
                stage.gain.value=1.35;input.connect(gain);gain.connect(power);power.connect(stage);stage.connect(output);dev.powerNodes.push(power);
            });
            dev.setChannelGain=(ch,value)=>{
                const bounded=Math.max(0,Math.min(1,Number(value)||0)),level=dev.type==='powerBias'?Math.round(bounded*10)/10:bounded;dev.state.channelGain[ch]=level;gains[ch].gain.setTargetAtTime(level,ctx.currentTime,.02);
                const knob=dev.el.querySelector(`[data-bias-gain="${ch}"]`);if(knob){knob.style.setProperty('--gain-angle',(-135+level*270)+'deg');knob.setAttribute('aria-valuenow',String(Math.round(level*10)));knob.setAttribute('aria-valuetext',Math.round(level*10)+' de 10');}
                const slider=appState.interface.selectedDeviceId===dev.id?document.getElementById('power-gain-'+ch):null;if(slider){slider.value=level;syncInspectorGainVisual(slider);}
            };
            ['L','R'].forEach(ch=>{
                const knob=dev.el.querySelector(`[data-bias-gain="${ch}"]`);
                dev.setChannelGain(ch,DEFAULT_POWER_GAIN);
                if(knob)Hardware.bindKnob(knob,{get:()=>dev.state.channelGain[ch],set:value=>dev.setChannelGain(ch,value)});
            });
        }
        let lastCustomPowerDisplay=0;
        function updateCustomPowerDisplays(now){
            if(now-lastCustomPowerDisplay<16)return;const elapsed=Math.min(.1,(now-lastCustomPowerDisplay)/1000);lastCustomPowerDisplay=now;
            Object.values(appState.project.devices).filter(dev=>CUSTOM_POWER_AMPS[dev.type]).forEach(dev=>{
                dev.el.querySelectorAll('[data-dual-led]').forEach(led=>{
                    const peak=dev.meters?.peaks[Number(led.dataset.dualLed)]||0,active=dev.powered&&peak>.0001;Hardware.setLed(led,active,peak>=.99);
                });
                const needle=dev.el.querySelector('[data-bias-needle]');if(!needle)return;
                const watts=dev.powered?Math.max(...[0,1].map(i=>wattsAtLoad(amplifierChannelRms(dev,i?'R':'L'),dev.channelLoads?.[i?'R':'L']??Infinity))):0;
                const fraction=Math.min(1,watts/dev.state.ratedWatts);
                const target=fraction>.0001?-100+(Math.log10(fraction)+4)*46:-100;
                dev.biasVisual??=-100;
                const response=target>dev.biasVisual?.22:.65;
                const calibration=deviceGaugeCalibrationAngle(dev,now,-100,84);
                dev.biasVisual=calibration??(matchMedia('(prefers-reduced-motion: reduce)').matches?target:dev.biasVisual+(target-dev.biasVisual)*(1-Math.exp(-elapsed/response)));
                needle.setAttribute('transform',`rotate(${dev.biasVisual} 60 62)`);
                needle.closest('svg').setAttribute('aria-label',`Potência de saída simulada: ${watts.toFixed(2)} W, maior nível entre os canais A e B`);
                needle.closest('.bias-meter').title=`${watts.toFixed(2)} W · maior nível entre A e B`;

            });
        }

        function bookshelfSpeakerMarkup(type){
            const config=BOOKSHELF_SPEAKERS[type];
            const driver=(kind,size,top)=>`<div class="tower-driver shelf-${kind} ${kind==='woofer'?'spk-woofer':''}" style="--driver-size:${size}px;top:${top}px" aria-hidden="true"><i class="tower-cone"><b></b>${type==='shelfCoax'?'<em class="shelf-coax-dome"></em>':''}</i><span class="tower-driver-screws"><i></i><i></i><i></i><i></i></span></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="bookshelf-body shelf-finish-${config.finish}">${type==='shelfTop'?'<div class="shelf-top-tweeter" aria-hidden="true"><i></i></div>':''}<div class="bookshelf-cabinet">${type==='shelfCoax'?driver('woofer',214,92):type==='shelfWood'?driver('tweeter',94,35)+driver('woofer',224,195):driver('woofer',222,90)}${['shelfWood','shelfCoax','shelfTop'].includes(type)?'':'<button class="speaker-grille bookshelf-grille" type="button" aria-label="Remover grade da caixa" title="Remover grade"></button><button class="grille-restore" type="button" title="Recolocar grade">RECOLOCAR GRADE</button>'}<div class="tower-terminal"><div class="port" data-type="wire" data-io="in" data-node="in" data-signal="amplified" title="Entrada amplificada para caixa passiva"></div><small>SPEAKER IN</small></div></div></section>`;
        }
        function floorSpeakerMarkup(type){
            const config=FLOOR_SPEAKERS[type];
            const driver=(kind,size,top)=>`<div class="tower-driver tower-${kind} ${kind==='bass'?'spk-woofer':''}" style="--driver-size:${size}px;top:${top}px"><i class="tower-cone"><b></b>${kind==='coax'?'<em class="tower-coax-tweeter"></em>':''}</i><span class="tower-driver-screws" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>`;
            const drivers=type==='floorDiamond'?driver('mid',140,38)+driver('bass',172,270)+driver('bass',172,502):type==='floorCoax'?driver('bass',160,50)+driver('bass',160,255)+driver('coax',128,511)+driver('bass',160,735)+driver('bass',160,940):driver('mid',166,20)+driver('tweeter',52,214)+driver('bass',166,300)+driver('bass',166,498)+driver('bass',166,696);
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="tower-body tower-${config.finish}">${type==='floorDiamond'?'<div class="tower-top-tweeter" aria-hidden="true"><i><b></b></i></div>':''}<div class="tower-cabinet"><div class="tower-baffle">${drivers}${type==='floorFlax'?'<div class="tower-front-vent" aria-hidden="true"></div>':''}<div class="tower-terminal"><div class="port" data-type="wire" data-io="in" data-node="in" data-signal="amplified" title="Entrada amplificada para caixa passiva"></div><small>SPEAKER IN</small></div></div></div><div class="tower-plinth" aria-hidden="true"></div><i class="tower-foot foot-left" aria-hidden="true"></i><i class="tower-foot foot-right" aria-hidden="true"></i></section>`;
        }
        function createPendantLamp(x,y,requestedId=null){
            const id=requestedId||'dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
            const el=document.createElement('div');
            el.id=id;el.className='device-node device-type-pendantLamp';el.dataset.equipmentType='pendantLamp';
            el.tabIndex=0;el.setAttribute('aria-label','Luminária pendente. Arraste pela cúpula para mover.');
            const shadeShape='M193 5 Q183 7 175 16 C140 51 89 73 16 87 Q10 89 12 93 Q100 99 210 98 Q320 99 408 93 Q410 89 404 87 C331 73 280 51 245 16 Q237 7 227 5Z';
            const shadeSvg=`<svg class="pendant-shade" viewBox="0 0 420 110" aria-hidden="true"><defs>
                <linearGradient id="${id}-iron" x1="0" y1="0" x2=".73" y2="1"><stop stop-color="#4e5450"/><stop offset=".16" stop-color="#303633"/><stop offset=".54" stop-color="#1b211f"/><stop offset=".85" stop-color="#141918"/><stop offset="1" stop-color="#3b3830"/></linearGradient>
                <radialGradient id="${id}-sheen" cx=".29" cy=".08" r=".8"><stop stop-color="#c0bdae" stop-opacity=".3"/><stop offset=".43" stop-color="#868a81" stop-opacity=".09"/><stop offset="1" stop-color="#070b0b" stop-opacity=".28"/></radialGradient>
                <linearGradient id="${id}-edge" x2="0" y2="1"><stop stop-color="#77796b"/><stop offset=".46" stop-color="#323832"/><stop offset="1" stop-color="#131716"/></linearGradient>
                <radialGradient id="${id}-underside"><stop stop-color="#ac8350" stop-opacity=".72"/><stop offset=".65" stop-color="#4d4030"/><stop offset="1" stop-color="#111715"/></radialGradient>
                <filter id="${id}-texture"><feTurbulence type="fractalNoise" baseFrequency=".35" numOctaves="2" seed="6" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
                <clipPath id="${id}-shade-clip"><path d="${shadeShape}"/></clipPath>
            </defs><path d="${shadeShape}" fill="url(#${id}-iron)"/><path d="${shadeShape}" fill="url(#${id}-sheen)"/>
            <g clip-path="url(#${id}-shade-clip)"><rect width="420" height="106" filter="url(#${id}-texture)" opacity=".12" style="mix-blend-mode:soft-light"/><path d="M21 86 Q118 65 175 16 Q147 63 18 92Z" fill="#b5b8a8" opacity=".08"/></g>
            <path d="M13 91 Q210 100 407 91 Q318 103 210 102 Q102 103 13 91Z" fill="url(#${id}-edge)"/><path d="M37 97 Q210 111 383 97 Q210 105 37 97Z" fill="url(#${id}-underside)"/><path d="M27 94 Q210 101 393 94" fill="none" stroke="#b0a58a" stroke-opacity=".2" stroke-width=".8"/></svg>`;
            el.innerHTML=`<div class="device-header" aria-hidden="true"></div><div class="pendant-suspension" aria-hidden="true"><i class="pendant-cord"></i><div class="pendant-fixture"><i class="pendant-strain"></i><i class="pendant-socket"><i class="pendant-socket-grip"></i></i><i class="pendant-bulb"><i class="pendant-glass-stem"></i><i class="pendant-filament"></i><i class="pendant-filament-wire"></i></i>${shadeSvg}</div></div>`;
            el.style.left=Math.max(sceneSideInset(),Math.min(world.offsetWidth-504-sceneSideInset(),x))+'px';
            el.style.top=Math.max(0,Math.min(maxEquipmentBottom()-276,y))+'px';
            world.appendChild(el);
            const dev={id,type:'pendantLamp',el,nodes:{},state:{},powered:true};
            appStateStore.actions.registerDevice(dev);bindDeviceEvents(dev);selectDevice(id);updateCables();scheduleProjectSave();
        }
        function createWallLamp(type,x,y,requestedId=null){
            const id=requestedId||'dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
            const model=WALL_LAMP_TYPES[type];
            const el=document.createElement('div');
            el.id=id;el.className=`device-node wall-lamp-node device-type-${type}`;
            el.dataset.equipmentType=type;el.dataset.lampModel=model;
            el.tabIndex=0;el.setAttribute('aria-label',`${DEVICE_NAMES[type]}. Arraste pela luminária para posicionar.`);
            const shade=model==='dome'?'<svg class="wall-lamp-dome-shade" viewBox="0 0 420 110" aria-hidden="true"><defs><linearGradient id="wall-shade-'+id+'" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#171b1a"/><stop offset=".19" stop-color="#303532"/><stop offset=".5" stop-color="#515550"/><stop offset=".81" stop-color="#303532"/><stop offset="1" stop-color="#171b1a"/></linearGradient><pattern id="wall-brush-'+id+'" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1h5M0 4h5" stroke="#c9c2ac" stroke-opacity=".1" stroke-width=".5"/></pattern></defs><path d="M193 5 Q183 7 175 16 C140 51 89 73 16 87 Q10 89 12 93 Q100 99 210 98 Q320 99 408 93 Q410 89 404 87 C331 73 280 51 245 16 Q237 7 227 5Z" fill="url(#wall-shade-'+id+')"/><path d="M193 5 Q183 7 175 16 C140 51 89 73 16 87 Q10 89 12 93 Q100 99 210 98 Q320 99 408 93 Q410 89 404 87 C331 73 280 51 245 16 Q237 7 227 5Z" fill="url(#wall-brush-'+id+')"/><path d="M173 19Q210 25 247 19M45 84Q210 95 375 84" fill="none" stroke="#b5b3a3" stroke-opacity=".24" stroke-width="1"/><path d="M13 92Q210 103 407 92" fill="none" stroke="#9a937f" stroke-opacity=".55" stroke-width="5"/><path d="M40 97Q210 111 380 97" fill="none" stroke="#bb925e" stroke-opacity=".4" stroke-width="5"/></svg>':'';
            el.innerHTML=`<div class="device-header" aria-hidden="true"></div><span class="wall-lamp-plate"><i></i><i></i></span><span class="wall-lamp-arm"></span><span class="wall-lamp-socket"></span><span class="wall-lamp-bulb"><i class="wall-lamp-filament"></i></span>${model==='cage'?'<span class="wall-lamp-glass"></span><span class="wall-lamp-cage"></span>':shade}`;
            wallLampLayer.appendChild(el);
            const parallaxScale=canvas.dataset.theme==='scene'?parseFloat(world.style.getPropertyValue('--room-far-scale'))||1:1;
            const farX=canvas.dataset.theme==='scene'?parseFloat(world.style.getPropertyValue('--room-far-x'))||0:0;
            const farY=canvas.dataset.theme==='scene'?parseFloat(world.style.getPropertyValue('--room-far-y'))||0:0;
            const horizon=canvas.dataset.theme==='scene'?parseFloat(world.style.getPropertyValue('--room-horizon-shift'))||0:0;
            const localX=world.offsetWidth/2+(x-world.offsetWidth/2-farX)/parallaxScale;
            const localY=world.offsetHeight+(y-world.offsetHeight-farY-horizon)/parallaxScale;
            el.style.left=Math.max(sceneSideInset(),Math.min(world.offsetWidth-el.offsetWidth-sceneSideInset(),snapCoordinate(localX)))+'px';
            el.style.top=Math.max(0,Math.min(wallPlacementBottom()-el.offsetHeight,snapCoordinate(localY)))+'px';
            const dev={id,type,el,nodes:{},state:{},powered:true};
            appStateStore.actions.registerDevice(dev);bindDeviceEvents(dev);selectDevice(id);updateCables();scheduleProjectSave();
        }
