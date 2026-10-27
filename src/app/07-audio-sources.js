/* File playback, vinyl noise, source transport, and sequencer behavior. */
        function readAudioTrackTitle(buffer){
            try{
                const bytes=new Uint8Array(buffer),view=new DataView(buffer);
                if(bytes.length<10||String.fromCharCode(...bytes.slice(0,3))!=='ID3')return '';
                const version=bytes[3];if(![2,3,4].includes(version)||(bytes[5]&0x80))return '';
                const sync=o=>(bytes[o]<<21)|(bytes[o+1]<<14)|(bytes[o+2]<<7)|bytes[o+3];
                const end=Math.min(bytes.length,10+sync(6),1024*1024);let offset=10;
                if(bytes[5]&0x40){if(version===3)offset+=4+view.getUint32(offset);else if(version===4)offset+=sync(offset);else return '';}
                while(offset+(version===2?6:10)<=end){
                    const idLength=version===2?3:4,id=String.fromCharCode(...bytes.slice(offset,offset+idLength));
                    if(!/^[A-Z0-9]+$/.test(id))break;
                    const header=version===2?6:10,size=version===2?(bytes[offset+3]<<16)|(bytes[offset+4]<<8)|bytes[offset+5]:version===4?sync(offset+4):view.getUint32(offset+4);
                    if(size<1||offset+header+size>end)break;
                    if(id==='TIT2'||id==='TT2'){
                        if(version!==2&&bytes[offset+9])return '';
                        const frame=bytes.slice(offset+header,offset+header+size),encoding=frame[0];
                        const text=new TextDecoder(encoding===0?'iso-8859-1':encoding===1?(frame[1]===0xfe&&frame[2]===0xff?'utf-16be':'utf-16le'):encoding===2?'utf-16be':'utf-8').decode(frame.subarray(1));
                        return text.replace(/\u0000/g,' ').replace(/^\uFEFF/,'').trim().slice(0,240);
                    }
                    offset+=header+size;
                }
            }catch{}
            return '';
        }
        function refreshCdDisplay(dev){
            dev.refreshStreamDisplay?.();
            if(dev.type!=='cdPlayer')return;
            const title=dev.el.querySelector('[data-cd-title]');if(!title)return;
            const name=dev.audioBuffer?(dev.trackTitle||dev.fileName?.replace(/\.[^.]+$/,'')||'FAIXA 01'):'DEMONSTRAÇÃO';
            if(title.textContent!==name){title.textContent=name;title.parentElement.title=name;}
            const distance=Math.max(0,title.scrollWidth-title.parentElement.clientWidth);
            title.style.setProperty('--cd-scroll-distance',`${-distance}px`);title.classList.toggle('is-scrolling',distance>2&&dev.powered);
            const seconds=dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?appState.audio.context.currentTime-dev.demoStartedAt:0);
            const time=formatAudioTime(seconds).padStart(5,'0');
            dev.el.querySelector('[data-cd-time]').textContent=time;
            dev.el.querySelector('[data-cd-duration]').textContent=dev.audioBuffer?'/ '+formatAudioTime(dev.audioBuffer.duration).padStart(5,'0'):'DEMO';
            dev.el.querySelector('[data-cd-status]').textContent=!dev.powered?'OFF':dev.state.playing?'▶ PLAY':'Ⅱ PAUSE';
            dev.el.querySelector('[data-cd-repeat]').textContent=dev.state.repeat?'↻ REPEAT':'';
        }

        function stopFilePlayback(dev) {
            const playback = dev.filePlayback;
            if (!playback) return;
            dev.fileOffset = sourcePosition(dev);
            playback.source.onended = null;
            playback.source.stop(); playback.source.disconnect(); playback.splitter.disconnect();
            dev.filePlayback = null;
        }
        function startFilePlayback(dev) {
            if (!dev.audioBuffer || !dev.state.playing || !dev.powered) return;
            const source = appState.audio.context.createBufferSource();
            source.buffer = dev.audioBuffer;
            source.loop = !!dev.state.repeat;
            const rate = dev.ttRate ? dev.ttRate() : 1;
            source.playbackRate.value = rate;
            const splitter = appState.audio.context.createChannelSplitter(2);
            source.connect(splitter);
            splitter.connect(dev.nodes.genL, 0);
            splitter.connect(dev.nodes.genR, dev.audioBuffer.numberOfChannels > 1 ? 1 : 0);
            if ((dev.fileOffset || 0) >= dev.audioBuffer.duration) dev.fileOffset = 0;
            dev.filePlayback = {source,splitter,startedAt:appState.audio.context.currentTime,rate};
            source.onended = () => {
                if (dev.filePlayback?.source !== source) return;
                source.disconnect(); splitter.disconnect(); dev.filePlayback = null; dev.fileOffset = 0;
                setSourcePlaying(dev, false);
            };
            source.start(0, dev.fileOffset || 0);
        }
        async function loadSourceAudio(dev, file) {
            const token = dev.fileLoadToken = (dev.fileLoadToken || 0) + 1;
            await setSourcePlaying(dev, false);
            dev.fileMessage = 'Carregando áudio…';
            if (appState.interface.selectedDeviceId === dev.id) selectDevice(dev.id, true);
            try {
                const bytes = await file.arrayBuffer();
                const streamMetadata=dev.type==='streamIntegrated'?readStreamMetadata(bytes):null;
                const trackTitle = readAudioTrackTitle(bytes) || file.name.replace(/\.[^.]+$/, '');
                const buffer = await appState.audio.context.decodeAudioData(bytes);
                if (!appState.project.devices[dev.id] || dev.fileLoadToken !== token) return;
                dev.audioBuffer = buffer; dev.fileOffset = 0;
                dev.mediaBlob=file;dev.mediaKey='audio_'+Date.now()+'_'+Math.random().toString(36).slice(2);scheduleProjectSave();
                dev.fileName = file.name; dev.trackTitle=trackTitle; dev.demoOffset=0; dev.fileMessage = '';
                if(streamMetadata)dev.setStreamMetadata(streamMetadata);
                refreshCdDisplay(dev);
            } catch (error) {
                if (dev.fileLoadToken !== token) return;
                dev.fileMessage = 'Não foi possível ler este áudio. Tente um arquivo MP3 ou WAV.';
            }
            if (appState.interface.selectedDeviceId === dev.id && appState.project.devices[dev.id]) selectDevice(dev.id, true);
        }

        const VINYL_NOISE_LEVELS={none:{label:'Sem ruído',gain:0},low:{label:'Ruído baixo',gain:.016},medium:{label:'Ruído médio',gain:.035},high:{label:'Ruído alto',gain:.07}};
        function noiseLevelIcon(level){
            const waveforms={
                low:'M2 12h2l1.5-1.5 2 3 2.5-4 2 5 2-4 2 3 2-2 1.5 .5H22',
                medium:'M2 12h2l1.5-3 2 6 2.5-8 2 10 2-8 2 6 2-4 1.5 1H22',
                high:'M2 12h2l1.5-5 2 10 2.5-13 2 16 2-13 2 10 2-6 1.5 1H22'
            };
            const symbol=level==='none'
                ? '<circle cx="12" cy="12" r="8.25"/><path d="m6.25 17.75 11.5-11.5"/>'
                : `<path class="noise-level-axis" d="M2 12h20"/><path d="${waveforms[level]||waveforms.low}"/>`;
            return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">${symbol}</svg>`;
        }
        function tapeWowLevelIcon(level){
            const controlY={low:8,medium:4,high:-2}[level]??8;
            return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path class="noise-level-axis" d="M2 12h20"/><path d="M2 12Q4.5 ${controlY} 7 12T12 12T17 12T22 12"/></svg>`;
        }
        let vinylNoiseBuffer=null;
        function stopVinylNoise(dev){
            const voice=dev.vinylNoise;dev.vinylNoise=null;
            if(!voice)return;
            clearTimeout(voice.crackleTimer);
            const time=appState.audio.context.currentTime;
            voice.gain.gain.cancelAndHoldAtTime(time);voice.gain.gain.linearRampToValueAtTime(0,time+.012);
            voice.source.stop(time+.015);
        }
        function syncVinylNoise(dev){
            if(!TURNTABLE_TYPES.has(dev.type))return;
            if(!dev.state.playing||!dev.powered){stopVinylNoise(dev);return;}
            if(dev.vinylNoise)return;
            const context=appState.audio.context;
            if(!vinylNoiseBuffer){
                const size=Math.ceil(context.sampleRate*11);
                vinylNoiseBuffer=context.createBuffer(2,size,context.sampleRate);
                for(let channel=0;channel<2;channel++){
                    const data=vinylNoiseBuffer.getChannelData(channel);let soft=0;
                    for(let i=0;i<size;i++){
                        soft=.6*soft+.4*(Math.random()*2-1);
                        data[i]=soft*.2;
                    }
                    for(let i=0;i<256;i++){data[i]*=i/256;data[size-1-i]*=i/256;}
                }
            }
            const source=context.createBufferSource(),gain=context.createGain(),split=context.createChannelSplitter(2);
            const high=context.createBiquadFilter(),low=context.createBiquadFilter();
            high.type='highpass';high.frequency.value=100;low.type='lowpass';low.frequency.value=5200;
            source.buffer=vinylNoiseBuffer;source.loop=true;
            gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime((VINYL_NOISE_LEVELS[dev.state.vinylNoiseLevel]||VINYL_NOISE_LEVELS.medium).gain,context.currentTime+.06);
            source.connect(high);high.connect(low);low.connect(gain);gain.connect(split);
            split.connect(dev.nodes.genL,0);split.connect(dev.nodes.genR,1);
            source.onended=()=>{source.disconnect();high.disconnect();low.disconnect();gain.disconnect();split.disconnect();};
            source.start(0,Math.random()*9);
            const voice={source,gain,crackleTimer:null};dev.vinylNoise=voice;
            const scheduleCrackle=()=>{
                if(dev.vinylNoise!==voice)return;
                voice.crackleTimer=setTimeout(()=>{
                    if(dev.vinylNoise!==voice||!dev.state.playing||!dev.powered)return;
                    if(context.state==='running'){
                        const duration=.0015+Math.random()*.004;
                        const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
                        const samples=buffer.getChannelData(0),amplitude=.16+Math.random()*.24;
                        for(let i=0;i<samples.length;i++){
                            const phase=i/samples.length;
                            samples[i]=amplitude*(Math.random()*1.2-.6+Math.sin(i*.8)*.35)*Math.min(1,phase*30)*Math.exp(-phase*7);
                        }
                        const tick=context.createBufferSource(),pan=context.createStereoPanner();
                        tick.buffer=buffer;pan.pan.value=(Math.random()-.5)*.8;
                        tick.connect(pan);pan.connect(high);
                        tick.onended=()=>{tick.disconnect();pan.disconnect();};
                        tick.start();
                    }
                    scheduleCrackle();
                },220+Math.random()*1450);
            };
            scheduleCrackle();
        }

        async function setSourcePlaying(dev, playing, mechanism=false, trackIndex=null) {
            if(CAPTURE_INTERFACE_TYPES.has(dev.type))return playing?dev.startMicCapture():dev.stopMicCapture();
            if(dev.type==='streamIntegrated'&&playing&&dev.state.streamInput!=='library')dev.selectStreamInput('library');
            if(dev.linearSetPlaying&&!mechanism){if(playing&&Number.isInteger(trackIndex))dev.pendingSpotifyTrack=trackIndex;return dev.linearSetPlaying(playing);}
            if(dev.state.damage&&playing)return;
            if(playing&&dev.type==='cdPlayer')dev.setTrayOpen?.(false);
            if (!SOURCE_TYPES.has(dev.type)) return;
            if (playing && appState.audio.context.state !== 'running') {
                try {
                    await appState.audio.context.resume();
                    if (appState.audio.context.state !== 'running') throw new Error('Áudio bloqueado pelo navegador.');
                } catch (error) {
                    dev.state.playing = false;
                    if (dev.state.tt) dev.state.tt.running = false;
                    dev.refreshTurntable?.();
                    updateCableFlows();
                    dev.fileMessage = 'O navegador não ativou a saída de áudio. Clique em Reproduzir novamente; confira se a aba está silenciada.';
                    const status = appState.interface.selectedDeviceId === dev.id ? document.getElementById('source-file-message') : null;
                    if (status) {
                        status.textContent = 'O navegador não ativou a saída de áudio. Clique em Reproduzir novamente; confira se a aba está silenciada.';
                        status.classList.add('text-red-400');
                    }
                    return;
                }
            }
            if(playing&&(dev.state.damage||!appState.project.devices[dev.id]))return;
            if(dev.spotifyVinyl){
                if(playing){
                    if(spotifyPlayingTurntable&&spotifyPlayingTurntable!==dev.id){spotifyVinylNotice('Pare o outro toca-discos do Spotify antes de reproduzir este.');return;}
                    spotifyVolume=0;
                    try{
                        await SpotifyCoverflow.setPlaybackVolume(0);
                        const chosenTrack=Number.isInteger(trackIndex)?trackIndex:dev.pendingSpotifyTrack;
                        const resumed=!dev.spotifyNeedsRestart&&!Number.isInteger(chosenTrack)&&await SpotifyCoverflow.resumeAlbum(dev.spotifyVinyl.uri);
                        if(!resumed)await SpotifyCoverflow.playAlbum(dev.spotifyVinyl,chosenTrack);
                    }catch(error){spotifyVinylNotice(error.message||'Não foi possível iniciar o Spotify.');return;}
                    dev.spotifyNeedsRestart=false;
                    dev.pendingSpotifyTrack=null;
                    spotifyPlayingTurntable=dev.id;
                }else if(spotifyPlayingTurntable===dev.id){
                    spotifyPlayingTurntable=null;spotifyVolume=0;
                    try{await SpotifyCoverflow.setPlaybackVolume(0);await SpotifyCoverflow.pauseAlbum();}catch{}
                }
            }
            stopFilePlayback(dev);
            if(!dev.audioBuffer){
                if(dev.state.playing && dev.demoStartedAt != null) dev.demoOffset=(dev.demoOffset||0)+appState.audio.context.currentTime-dev.demoStartedAt;
                dev.demoStartedAt=playing?appState.audio.context.currentTime:null;
            }
            dev.state.playing = !!playing;
            syncMobileContextActions();
            dev.spotifyVinyl?.el.classList.toggle('is-playing',dev.state.playing);
            syncVinylNoise(dev);
            syncTapeHiss(dev);
            syncSignalGenerator(dev);
            if (dev.state.playing && dev.audioBuffer) startFilePlayback(dev);
            if (dev.state.tt) dev.state.tt.running = dev.state.playing;
            ['genR','genL'].forEach(key => dev.nodes[key]?.gain.setTargetAtTime(dev.state.playing ? 1 : 0, appState.audio.context.currentTime, .015));
            dev.el.querySelectorAll('[data-source-play]').forEach(button => {
                button.setAttribute('aria-label',dev.state.playing?'Pausar':'Reproduzir');
                button.setAttribute('aria-pressed', String(dev.state.playing));
            });
            if (appState.interface.selectedDeviceId === dev.id) {
                const button = document.getElementById('source-inspector-play');
                if (button) { button.classList.toggle('is-on', dev.state.playing); button.setAttribute('aria-pressed', String(dev.state.playing)); }
            }
            dev.refreshTurntable?.();
            refreshCdDisplay(dev);
            syncSourceSequencer();
            updateCableFlows();
        }
        function syncSourceSequencer() {
            appStateStore.actions.setAudioRuntime('isPlaying',Object.values(appState.project.devices).some(isSourceRunning));
            if (!appState.audio.isPlaying) { clearInterval(appState.audio.sequenceInterval); appStateStore.actions.setAudioRuntime('sequenceInterval',null); return; }
            if (appState.audio.sequenceInterval) return;
                let step = 0;
                appStateStore.actions.setAudioRuntime('sequenceInterval',setInterval(() => {
                    if (appState.audio.context.state !== 'running') return;
                    Object.values(appState.project.devices).forEach(dev => {
                        // Só toca se o dispositivo estiver ligado (e, no toca-discos, com o prato girando)
                        if (!isSourceRunning(dev) || dev.audioBuffer || dev.spotifyVinyl || RADIO_RECEIVERS.has(dev.type) || SIGNAL_GENERATOR_TYPES.has(dev.type)) return;

                        const outR = dev.nodes.genR || dev.nodes.outR;
                        const outL = dev.nodes.genL || dev.nodes.outL;
                        if (TURNTABLE_TYPES.has(dev.type)) {
                            const ttr = dev.ttRate ? dev.ttRate() : 1;
                            if (step % 4 === 0) {
                                if (outR) playNote(50 * ttr, 'sine', 0.4, 0.8, 0, outR);
                                if (outL) playNote(50 * ttr, 'sine', 0.4, 0.8, 0, outL);
                            }
                            if (step % 2 !== 0) {
                                if (outR) playNote(400 * ttr, 'square', 0.1, 0.08, 0, outR);
                                if (outL) playNote(400 * ttr, 'square', 0.1, 0.08, 0, outL);
                            }
                        } else if (dev.type === 'streamer' || dev.type==='streamIntegrated' || dev.type === 'cdPlayer' || BT_RX_TYPES.has(dev.type)) {
                            const melodyR = [261.63, 329.63, 392.00, 523.25];
                            const melodyL = [329.63, 392.00, 523.25, 659.25];
                            const noteR = melodyR[step % melodyR.length];
                            const noteL = melodyL[step % melodyL.length];
                            const wave = BT_RX_TYPES.has(dev.type) ? 'sawtooth' : dev.type === 'cdPlayer' ? 'sine' : 'triangle';
                            if (outR) playNote(noteR, wave, 0.25, 0.22, 0, outR);
                            if (outL) playNote(noteL, wave, 0.25, 0.22, 0, outL);
                        }
                    });
                    step++;
                }, 300));
        }

        // --- DRAG & DROP CORRIGIDO (SEM DELAY E SEM OFFSET) ---
        const catalogDescriptions = {
            ...Object.fromEntries(Object.entries(FURNITURE_TYPES).map(([key,config])=>[key,config.description])),
            pendantLamp:'Luminária pendente com cúpula metálica, cabo até o teto, lâmpada de filamento e luz amarela direcional.',
            wallLampCage:'Arandela industrial com vidro e grade de proteção. Emite luz âmbar em todas as direções.',
            wallLampDome:'Arandela com prato metálico e lâmpada de filamento. A cúpula direciona a luz para baixo.',
            ...Object.fromEntries(Object.entries(INTERFACE_DEVICES).map(([key,config])=>[key,config.description])),
            turntableVintage: 'Toca-discos vintage com madeira e aço escovado, ajuste de pitch e saída RCA LINE ou PHONO.',
            turntableLinear:'Toca-discos tangencial automático com dois braços paralelos, detecção simulada de diâmetro, velocidades de 33⅓ e 45 rpm, cue e retorno automático.',
            streamIntegrated:'Streamer com amplificador estéreo de 40 W por canal, fonte interna, entrada de linha, fones e pré-out. Tela colorida funcional e volume superior com halo luminoso.',
            turntable: 'Toca discos de vinil. Ajuste o pitch e escolha a SAÍDA: LINE (pré interno) ou PHONO (cápsula MM, sem pré/RIAA de reprodução).',
            streamer: 'Reproduz música digital e envia áudio estéreo de linha por RCA L/R ou AUX P2.',
            signalGeneratorVintage:'Gerador vintage com tela matricial, senoide, varredura, ruído rosa e saídas de linha L/R.',
            signalGenerator:'Senoide, varredura logarítmica e ruído rosa, com saídas de linha L/R e nível ajustável.',
            tapeDeck:'Tape deck de rolo aberto com reprodução estéreo, ruído de fita, wow/flutter e medidores VU.',
            preamp:'Seleciona AUX, CD, TAPE ou PHONO (com equalização RIAA para toca-discos); ajusta volume, graves e agudos e entrega sinal de linha ao amplificador.',
            benchMeter:'Medidor de bancada com LCD, barras VU L/R, espectro e correlação estéreo em tempo real.',
            benchMeterVintage:'Medidor vintage em madeira e metal, com ponteiros VU L/R calibrados, espectro e correlação estéreo.',
            cdPlayer: 'Lê CDs e envia áudio estéreo em nível de linha por RCA.',
            audioInterface1:'Interface USB compacta para capturar uma entrada do computador e encaminhar o sinal estéreo às saídas conectadas.',
            audioInterface2:'Interface USB com controle geral de volume para as saídas de linha e fones.',
            audioInterface3:'Interface USB com níveis independentes para entrada, linha e fones.',
            audioInterface4:'Interface USB com saída de linha e dois controles independentes de fones.',
            btReceiverA: 'Recebe áudio Bluetooth e converte para saída estéreo RCA.',
            btTransmitterPro: 'Recebe áudio estéreo RCA e transmite para fones Bluetooth.',
            eqStudio: 'Equalizador de 7 bandas com nível de saída e conexões RCA ou P10 estéreo.',
            eqVintage: 'Equalizador de 7 bandas com acabamento vintage e conexões RCA ou P10 estéreo.',
            receiver: 'Recebe fontes de linha, amplifica para caixas e oferece saídas RCA, sub e fones.',
            powerAmp: 'Receiver moderno com volume estéreo e saídas amplificadas para caixas passivas.',
            powerStereo: 'Amplificador de potência com entradas RCA ou P10 estéreo e ganhos A/L e B/R independentes.',
            powerVintage: 'Amplificador de potência vintage com ganhos A/L e B/R independentes e saídas para caixas passivas.',
            headphoneAmp: 'Amplificador vintage de fones com entrada RCA, volume e saídas P10 e P2.',
            headphoneAmpModern: 'Amplificador de fones com entrada RCA, volume e saídas P10 e P2.',
            headphoneAmp4: 'Distribui uma entrada RCA estéreo para quatro saídas P10 com volumes independentes.',
            rcaSwitch: 'Recebe um par RCA e seleciona o envio para a saída A ou B.',
            rcaMatrix: 'Seleciona uma das três entradas RCA estéreo e envia para qualquer combinação das quatro saídas.',
            rcaMatrixVintage: 'Switch vintage: uma de três entradas RCA estéreo para até quatro saídas ativadas individualmente.',
            rcaSwitchVintage: 'Recebe um par RCA e seleciona a saída A ou B, com acabamento vintage em madeira e metal.',
            mixer: 'Combina três fontes estéreo RCA com volume independente por canal.',
            mixerVintage: 'Mixer vintage que combina três fontes estéreo RCA com volume por canal.',
            speakerSwitch: 'Seleciona o par A ou B de caixas passivas ligado à saída amplificada.',
            speakerSwitchVintage: 'Seletor vintage que alterna a saída do amplificador entre caixas A e B.',
            crossover: 'Divide o sinal RCA em graves, médios e agudos para saídas separadas.',
            crossoverVintage: 'Crossover vintage que separa o áudio em três faixas de frequência.',
            spkPassiveWood: 'Caixa passiva: recebe sinal amplificado do receiver ou amplificador por fio.',
            spkPassiveCarbon: 'Caixa passiva: recebe sinal amplificado do receiver ou amplificador por fio.',
            spkPassiveGridBlack: 'Caixa passiva de três vias com tweeter, médio, woofer de cone claro, duto frontal e grade preta removível. Gabinete de madeira e suporte metálico. Impedância nominal de 4 Ω; amplificação recomendada até 200 W.',
            spkPassiveGridOrange: 'Caixa passiva de três vias com tweeter, médio, woofer de cone claro, duto frontal e grade laranja removível. Gabinete de madeira e suporte metálico. Impedância nominal de 4 Ω; amplificação recomendada até 200 W.',
            spkActiveMonitor: 'Caixa ativa: recebe sinal de linha RCA mono, com volume próprio; o lado L/R vem da saída conectada.',
            spkActiveCompact:'Caixa ativa compacta com RCA L/R e AUX P2 de linha, controle de volume e assinatura sonora própria. Preserva os canais estéreo.',
            spkActiveRounded:'Monitor ativo de duas vias, gabinete arredondado, guia de ondas e apoio isolante. Entrada mono P10 de linha adaptada para o simulador, volume e alimentação próprios. Use duas unidades para estéreo.',
            spkActiveBookshelf: 'Caixa ativa: recebe sinal de linha RCA mono, com volume próprio; o lado L/R vem da saída conectada.',
            subwoofer: 'Subwoofer ativo com entrada RCA LFE mono dedicada para frequências graves.',
            subwooferCube: 'Subwoofer ativo compacto com entrada RCA LFE mono dedicada.',
            subwooferPro: 'Subwoofer ativo de maior porte com entrada RCA LFE mono dedicada.',
            subwooferPassive: 'Subwoofer passivo: recebe sinal amplificado do amplificador por fio de caixa.',
            subwooferPassiveVintage: 'Subwoofer passivo vintage: recebe sinal amplificado por fio de caixa.',
            hpStudio: 'Fone de estúdio com arco duplo, faixa de suspensão, almofadas em tecido, entrada P2 estéreo na ponta do cabo e pareamento Bluetooth.',
            hpMonitor:'Fone em couro preto texturizado, almofadas com pregas e hastes articuladas com detalhes metálicos quentes. Suporte padrão e entrada P2 estéreo na ponta do cabo, somente por cabo.',
            hpMax:'Fone com conchas prateadas e arco em malha. Suporte padrão e conexão exclusivamente por Bluetooth com um transmissor do simulador.',
            hpClassic: 'Fone clássico com conchas de madeira, arco costurado e almofadas em couro marrom. Entrada P2 estéreo na ponta do cabo, somente por cabo.'
        };
        // Uma linguagem de ícones para todo o catálogo: mesmo traço, escala e enquadramento.
