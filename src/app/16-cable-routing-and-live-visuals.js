/* Cable routing, meters, spectrum analysis, and live equipment rendering. */
        let cableBundleRevision=0,cachedCableBundleRevision=-1;
        const cableBundleOffsets=new WeakMap();
        function invalidateCableBundles(){cableBundleRevision++;}
        function connectionDevices(connection){
            if(!connection.outDeviceId)connection.outDeviceId=document.getElementById(connection.outId)?.closest('.device-node')?.id||'';
            if(!connection.inDeviceId)connection.inDeviceId=document.getElementById(connection.inId)?.closest('.device-node')?.id||'';
            return [connection.outDeviceId,connection.inDeviceId];
        }
        function getCableBundleOffset(connection) {
            if(cachedCableBundleRevision!==cableBundleRevision){
                const bundles=new Map();
                state.connections.forEach(item=>{
                    const [from,to]=connectionDevices(item);if(!from||!to)return;
                    const key=[from,to].sort().join('|'),bundle=bundles.get(key)||[];bundle.push(item);bundles.set(key,bundle);
                });
                bundles.forEach(bundle=>bundle.forEach((item,index)=>cableBundleOffsets.set(item,(index-(bundle.length-1)/2)*14)));
                cachedCableBundleRevision=cableBundleRevision;
            }
            return cableBundleOffsets.get(connection)||0;
        }
        function updateStackFeetDuringMove(affectedDeviceIds){
            // Re-evaluate supports at the live drag position, including equipment below it.
            updateStackFeet();
        }
        function updateCables(affectedDeviceIds=null) {
            const partial=affectedDeviceIds instanceof Set;
            state.connections.forEach(c => {
                if(partial){const [from,to]=connectionDevices(c);if(!affectedDeviceIds.has(from)&&!affectedDeviceIds.has(to))return;}
                const p1 = document.getElementById(c.outId); const p2 = document.getElementById(c.inId);
                c.el.dataset.slack=String(c.slack??5);
                let settle=0;
                if(c.seatStarted!=null){
                    const progress=Math.min(1,(performance.now()-c.seatStarted)/440);
                    if(progress>=1||powerMotionPreference.matches){
                        delete c.seatStarted;delete c.el.dataset.seating;delete c.el.dataset.seatEnd;delete c.el.dataset.seatOffset;delete c.el.dataset.seatOpacity;
                        c.seatAnimations?.forEach(animation=>animation.cancel());delete c.seatAnimations;
                    }else{
                        c.el.dataset.seating='true';c.el.dataset.seatEnd=c.seatEnd;
                        c.el.dataset.seatOffset=String(6*(1-Math.min(1,progress/.45))**3);
                        c.el.dataset.seatOpacity=String(Math.min(1,(1-progress)*4));
                        settle=Math.sin(progress*Math.PI*2)*3*(1-progress);
                    }
                }
                if(p1 && p2) drawCable(c.el, getPortCenter(p1), getPortCenter(p2), [], c.type, {x:0,y:settle}, getCableBundleOffset(c));
                applyCableAppearance(c);
            });
            updateBluetoothLinks(partial?affectedDeviceIds:null);
            syncPlatterVinyls(partial?affectedDeviceIds:null);
            if(partial){
                affectedDeviceIds.forEach(id=>{
                    const lamp=state.devices[id]?.el;
                    if(lamp?.classList.contains('device-type-pendantLamp')){const drop=Math.round((state.devices[id].dragVisualPosition?.y??lamp.offsetTop)+80)+'px';if(lamp.style.getPropertyValue('--pendant-drop')!==drop)lamp.style.setProperty('--pendant-drop',drop);}
                });
                updateStackFeetDuringMove(affectedDeviceIds);
            }else{
                world.querySelectorAll('.device-type-pendantLamp').forEach(lamp=>{const drop=Math.round(lamp.offsetTop+80)+'px';if(lamp.style.getPropertyValue('--pendant-drop')!==drop)lamp.style.setProperty('--pendant-drop',drop);});
                updateStackFeet();
            }
            Hardware.updateLightingDemo();
            scheduleVisuals();
        }

        // --- PROPAGAÇÃO REAL DE ENERGIA/SINAL PELA CADEIA DE ÁUDIO ---
        function isSourceRunning(dev) {
            return state.audioCtx?.state === 'running' && !!dev.powered && (RADIO_RECEIVERS.has(dev.type)?!!dev.state.radioOn:SOURCE_TYPES.has(dev.type)&&dev.state.playing===true&&(!SIGNAL_GENERATOR_TYPES.has(dev.type)||dev.state.signalLevel>0));
        }

        function updateStereoPowerMeters(dev) {
            if (!dev || !['powerStereo','powerVintage'].includes(dev.type)) return;
            ['L', 'R'].forEach(channel => {
                const peak = dev.meters?.peaks[channel === 'L' ? 0 : 1] || 0;
                const thresholds = [-48,-36,-24,-18,-12,-6,-3,0];
                const litCount = dev.powered ? thresholds.filter(db => audioDb(peak) >= db).length : 0;
                const leds = [...dev.el.querySelectorAll(`[data-meter="${channel}"] i`)];
                leds.forEach((led,index)=>Hardware.setLed(led,index>=leds.length-litCount));
            });
        }

        function updateCableFlows() {
            GuidedAccess.notify();
            updateListeningControls();
            if(spotifyPlayingTurntable||spotifyVolume>0)scheduleSpotifyVolume();
            updateStackFeet();
            syncSourceSequencer();
            // Atualiza compatibilidade após trocas de sinal, entrada ou estado dos aparelhos.
            if (state.selectedConnection) updatePortGuidance(true);
            // Uma caixa mono ocupa o lado definido pela saída à qual está conectada.
            Object.values(state.devices).forEach(dev => {
                if (!dev.outputPan) return;
                if(dev.type==='spkActiveCompact'){dev.outputPan.pan.setTargetAtTime(0,state.audioCtx.currentTime,.015);return;}
                const cable = state.connections.find(connection => document.getElementById(connection.inId)?.closest('.device-node')?.id === dev.id);
                const output = cable && document.getElementById(cable.outId);
                const channel = output?.dataset.channel || (/R$/.test(output?.dataset.node || '') ? 'R' : /L$/.test(output?.dataset.node || '') ? 'L' : '');
                dev.outputPan.pan.setTargetAtTime(channel === 'L' ? -1 : channel === 'R' ? 1 : 0, state.audioCtx.currentTime, .015);
            });
            // Descobre quais aparelhos estão recebendo ou gerando sinal sonoro
            const activeDevices = new Set();
            const connectedDevices = new Set();
            
            // 1. Fontes de áudio geradoras (toca-discos, streamer, Bluetooth) que estão ligadas
            if (state.isPlaying) {
                Object.values(state.devices).forEach(dev => {
                    if (isSourceRunning(dev)) activeDevices.add(dev.id);
                });
            }

            // 2. Propagação através das conexões da cadeia (ex: Fonte -> Receiver -> Caixas/Sub/Fones)
            let changed = true;
            let iterations = 0;
            while (changed && iterations < Object.keys(state.devices).length) {
                changed = false;
                iterations++;
                state.connections.forEach(c => {
                    if(c.miswired)return;
                    const outPortEl = document.getElementById(c.outId);
                    const inPortEl = document.getElementById(c.inId);
                    if (!outPortEl || !inPortEl) return;

                    const outDevEl = outPortEl.closest('.device-node');
                    const inDevEl = inPortEl.closest('.device-node');
                    if (!outDevEl || !inDevEl) return;

                    const devOut = state.devices[outDevEl.id];
                    const devIn = state.devices[inDevEl.id];
                    connectedDevices.add(devOut.id);
                    connectedDevices.add(devIn.id);

                    if(RADIO_RECEIVERS.has(devIn.type)){const selected=devIn.state.receiverInput||'line1',prefix=selected==='line1'?'in':selected;if(selected==='fm'||!new RegExp('^'+prefix+'[LR]$').test(inPortEl.dataset.node))return;}
                    if(devIn.type==='streamIntegrated'&&devIn.state.streamInput!=='line')return;
                    if(controlAmpConfig(devIn.type)&&!inPortEl.dataset.node.startsWith(devIn.state.integratedSource===3&&controlAmpConfig(devIn.type).phono!==false?'phono':'line'+devIn.state.integratedSource))return;
                    if(devIn.type==='preamp'&&!inPortEl.dataset.node.startsWith('in'+devIn.state.preSource))return;
                    if (MATRIX_TYPES.has(devIn.type) && !inPortEl.dataset.node.startsWith(`in${devIn.state.matrixInput}`)) return;
                    if (devIn.state.damage||!portCarriesSignal(devOut, outPortEl)) return;

                    // O seletor RCA só encaminha sinal para o par de saída escolhido.
                    if (!isSelectedSwitchOutput(devOut, outPortEl)) return;

                    // Se o aparelho de origem tem sinal e está ligado, ele transmite sinal pelo cabo
                    if (devOut && devOut.powered && activeDevices.has(devOut.id)) {
                        if (devIn && !activeDevices.has(devIn.id)) {
                            const needsPower = !PASSIVE_SPK.has(devIn.type) && !PASSIVE_SUB_TYPES.has(devIn.type) && !HP_TYPES.has(devIn.type);
                            if (!needsPower || devIn.powered) {
                                activeDevices.add(devIn.id);
                                changed = true;
                            }
                        }
                    }
                });
            }

            // 2b. Ligação sem fio Bluetooth (transmissor → fone)
            Object.values(state.devices).forEach(dev => {
                if (BT_TX_TYPES.has(dev.type) && dev.powered && activeDevices.has(dev.id) && dev.btPairedId) {
                    const hp = state.devices[dev.btPairedId];
                    if (hp&&!hp.state.damage&&!dev.state.damage) {
                        connectedDevices.add(dev.id);
                        connectedDevices.add(hp.id);
                        activeDevices.add(hp.id);
                    }
                }
            });

            Object.values(state.devices).forEach(dev => {
                const hasSignal = activeDevices.has(dev.id);
                const isConnected = connectedDevices.has(dev.id);
                dev.el.classList.toggle('device-connected', isConnected);
                dev.el.classList.toggle('device-disconnected', !isConnected);
                dev.el.classList.toggle('device-has-signal', hasSignal);
                dev.el.classList.toggle('device-no-signal', !hasSignal);
                dev.el.dataset.power = dev.el.querySelector('.power-btn') ? (dev.powered ? 'on' : 'off') : 'n/a';
                dev.el.dataset.connection = isConnected ? 'connected' : 'disconnected';
                dev.el.dataset.signal = hasSignal ? 'ativo' : 'sem sinal';
                updateStereoPowerMeters(dev);
                const deviceName = DEVICE_NAMES[dev.type] || dev.type;
                const powerLabel = dev.el.dataset.power === 'n/a' ? 'energia não aplicável' : (dev.powered ? 'ligado' : 'sem energia');
                dev.el.setAttribute('aria-label', `${deviceName}, ${powerLabel}, ${isConnected ? 'conectado' : 'desconectado'}, ${hasSignal ? 'com sinal' : 'sem sinal'}`);
            });

            // 3. Aplica a animação de pulso/fluxo APENAS nos cabos onde a corrente de áudio realmente está passando
            state.connections.forEach(c => {
                const outPortEl = document.getElementById(c.outId);
                const outDevEl = outPortEl ? outPortEl.closest('.device-node') : null;
                const devOut = outDevEl ? state.devices[outDevEl.id] : null;

                // O cabo só tem fluxo se a fonte estiver ligada e com áudio ativo alcançando essa saída
                const isCarryingSignal = !!(!c.miswired && devOut && devOut.powered && activeDevices.has(devOut.id) && portCarriesSignal(devOut, outPortEl));
                c.el.classList.toggle('signal-idle', !isCarryingSignal);
                c.el.dataset.signal = isCarryingSignal ? 'ativo' : 'sem sinal';
                c.el.setAttribute('aria-label', `${c.el.querySelector('title')?.textContent || 'Cabo de áudio'} · ${isCarryingSignal ? 'sinal ativo' : 'sem sinal'}`);
                
                c.el.querySelectorAll('path').forEach(p => {
                    if (isCarryingSignal) {
                        p.classList.add('active');
                    } else {
                        p.classList.remove('active');
                    }
                });
            });
            scheduleVisuals();
        }

        canvas.addEventListener('click', e => {
            const targetPath = e.target.closest('path');
            if (targetPath) {
                const group = targetPath.closest('.cable-group');
                const conn = state.connections.find(c => c.el === group || c.el === targetPath);
                if (conn) {
                    selectCable(conn);
                }
            } else if (e.target === canvas || e.target === world || e.target.id === 'cables-layer') {
                selectCable(null);
            }
        });

        let activeSpectrum = null;
        function disposeSpectrum() {
            if(!activeSpectrum)return;
            activeSpectrum.taps.forEach(tap=>{try{tap.source.disconnect(tap.analyzer);}catch{}tap.analyzer.disconnect();});
            activeSpectrum.silent.disconnect();activeSpectrum=null;
        }
        function spectrumInspectorHtml(dev) {
            return `<section class="spectrum-panel"><h3>Analisador de espectro</h3><div class="spectrum-selectors"><label>Canal<select id="spectrum-channel"><option value="L">Esquerdo · L</option><option value="R">Direito · R</option></select></label>${CROSSOVER_TYPES.has(dev.type)?'<label>Saída<select id="spectrum-band"><option value="Low">Graves</option><option value="Mid">Médios</option><option value="High">Agudos</option></select></label>':''}</div><div class="spectrum-legend"><span data-series="input">Entrada</span><span data-series="output">Saída</span></div><canvas id="audio-spectrum" role="img" aria-label="Espectro ao vivo comparando entrada e saída, de 20 Hz a 20 kHz e de menos 90 a zero dBFS"></canvas><p id="spectrum-description">Reproduza uma fonte conectada para comparar o áudio antes e depois do processamento.</p></section>`;
        }
        function setupSpectrum(dev) {
            disposeSpectrum();
            const canvas=document.getElementById('audio-spectrum');if(!canvas)return;
            const channel=document.getElementById('spectrum-channel').value;
            const band=document.getElementById('spectrum-band')?.value||'';
            const sourceNodes=[dev.nodes['in'+channel],dev.nodes['out'+band+channel]];
            if(sourceNodes.some(node=>!node))return;
            const silent=state.audioCtx.createGain();silent.gain.value=0;silent.connect(state.audioCtx.destination);
            const taps=sourceNodes.map(source=>{const analyzer=state.audioCtx.createAnalyser();analyzer.fftSize=4096;analyzer.smoothingTimeConstant=.65;analyzer.minDecibels=-100;analyzer.maxDecibels=0;source.connect(analyzer);analyzer.connect(silent);return{source,analyzer,data:new Float32Array(analyzer.frequencyBinCount)};});
            activeSpectrum={dev,canvas,silent,taps};
            drawSpectrum();
        }
        function drawSpectrum(){
            const spectrum=activeSpectrum;if(!spectrum)return;
            if(!spectrum.canvas.isConnected||!state.devices[spectrum.dev.id]){disposeSpectrum();return;}
            const canvas=spectrum.canvas,width=Math.max(220,canvas.clientWidth),height=170,ratio=window.devicePixelRatio||1;
            if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}
            const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#10171c';ctx.fillRect(0,0,width,height);
            const left=30,right=12,top=14,bottom=25,w=width-left-right,h=height-top-bottom;
            const x=f=>left+Math.log10(f/20)/3*w,y=db=>top+(1-Math.max(0,Math.min(1,(db+90)/90)))*h;
            ctx.font='9px "Inter",sans-serif';ctx.lineWidth=1;
            [0,-30,-60,-90].forEach(db=>{ctx.strokeStyle='#34404a';ctx.beginPath();ctx.moveTo(left,y(db));ctx.lineTo(width-right,y(db));ctx.stroke();ctx.fillStyle='#8294a0';ctx.textAlign='right';ctx.fillText(String(db),left-5,y(db)+3);});
            [[20,'20'],[100,'100'],[1000,'1k'],[10000,'10k'],[20000,'20k']].forEach(([f,label])=>{ctx.strokeStyle='#25323b';ctx.beginPath();ctx.moveTo(x(f),top);ctx.lineTo(x(f),height-bottom);ctx.stroke();ctx.fillStyle='#8294a0';ctx.textAlign='center';ctx.fillText(label,x(f),height-9);});
            let inputPeak=-Infinity;
            spectrum.taps.forEach((tap,index)=>{
                tap.analyzer.getFloatFrequencyData(tap.data);
                ctx.strokeStyle=index?'#55c7ff':'#a3adb8';ctx.lineWidth=index?1.8:1.2;ctx.beginPath();
                for(let step=0;step<=180;step++){
                    const f=20*Math.pow(1000,step/180),next=20*Math.pow(1000,(step+1)/180);
                    const bin=f/(state.audioCtx.sampleRate/2)*tap.data.length,end=Math.min(tap.data.length-1,Math.ceil(next/(state.audioCtx.sampleRate/2)*tap.data.length));
                    let db=-100;for(let k=Math.max(1,Math.floor(bin));k<=end;k++)db=Math.max(db,tap.data[k]);
                    if(!index)inputPeak=Math.max(inputPeak,db);
                    const px=left+step/180*w,py=y(db);if(step===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
                }
                ctx.stroke();
            });
            const info=document.getElementById('spectrum-description');
            if(info)info.textContent=inputPeak>-85?'Comparação ao vivo · frequência em Hz e nível em dBFS. Cinza: entrada. Azul: saída.':'Sem áudio na entrada. Reproduza uma fonte conectada; o gráfico responde também à sua música.';
        }

        function connectProjectPorts(from,nodeOut,to,nodeIn){
            const output=from.el.querySelector(`[data-node="${nodeOut}"]`),input=to.el.querySelector(`[data-node="${nodeIn}"]`);
            if(!output||!input||!getPortCompatibility(output,input).compatible)throw new Error('Ligação do projeto incompatível.');
            const el=document.createElementNS('http://www.w3.org/2000/svg','g');el.setAttribute('class','cable-group');svgLayer.appendChild(el);
            const type=output.dataset.type;drawCable(el,getPortCenter(output),getPortCenter(input),[],type);
            const miswired=output.dataset.io!=='out'||input.dataset.io!=='in';
            state.connections.push({outId:output.id,inId:input.id,outDeviceId:from.id,inDeviceId:to.id,el,type,wps:[],miswired});invalidateCableBundles();if(miswired)el.dataset.miswired='true';else from.nodes[nodeOut].connect(to.nodes[nodeIn]);output.classList.add('connected');input.classList.add('connected');
        }

        let pendantLightTick=0,pendantLightSignature='',visualFrame=0,visualTimer=0,visualRendering=false;
        function scheduleVisuals(delay=0){
            if(document.visibilityState!=='visible'||visualFrame)return;
            if(visualTimer){if(delay)return;clearTimeout(visualTimer);visualTimer=0;}
            if(delay)visualTimer=setTimeout(()=>{visualTimer=0;visualFrame=requestAnimationFrame(renderVisuals);},delay);
            else visualFrame=requestAnimationFrame(renderVisuals);
        }
        function renderVisuals() {
            visualFrame=0;
            if(document.visibilityState!=='visible')return;
            visualRendering=true;
            const now=performance.now();
            if(now-pendantLightTick>=90){
                pendantLightTick=now;
                const filaments=world.querySelectorAll('.device-type-pendantLamp .pendant-filament');
                if(filaments.length&&document.visibilityState==='visible'){
                    const worldRect=world.getBoundingClientRect(),scale=worldRect.width/world.offsetWidth;
                    const signature=powerMotionPreference.matches?'still':[...filaments].map(filament=>{const rect=filament.getBoundingClientRect();return Math.round((rect.left+rect.width/2-worldRect.left)/scale/3)+','+Math.round((rect.top+rect.height/2-worldRect.top)/scale/3);}).join(';');
                    if(signature!==pendantLightSignature){pendantLightSignature=signature;Hardware.updateLightingDemo();}
                }else pendantLightSignature='';
            }
            if(state.connections.some(connection=>connection.seatStarted!=null))updateCables();
            updateRealtimePanels(performance.now());
            updateTransportMotion(performance.now());
            updateExtraDisplays(performance.now());
            updateIntegratedDisplays(performance.now());
            updateReceiverRadioDisplays(performance.now());
            updateCustomPowerDisplays(performance.now());

            // Simulação física de cabo com alta densidade e amortecimento de borracha
            if (isPatching && tempCableEl && startPort && dragPhysics.activeTarget) {
                const now=performance.now(),dt=Math.min(32,now-(dragPhysics.frameTime||now-16));
                dragPhysics.frameTime=now;
                const target=dragPhysics.activeTarget;
                const previous=dragPhysics.displayedTarget||target;
                const blend=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-dt/(hoveredTargetPort?45:18));
                dragPhysics.displayedTarget=hoveredTargetPort?{x:previous.x+(target.x-previous.x)*blend,y:previous.y+(target.y-previous.y)*blend}:{...target};
                const springK = 0.095; // Força restauradora suave da gravidade
                const damping = 0.80;  // Amortecimento alto para dissipar o movimento sem efeito "elástico/mola"

                // Força restauradora em direção à posição de equilíbrio
                const forceX = -dragPhysics.swingX * springK;
                const forceY = -dragPhysics.swingY * springK;

                dragPhysics.swingVelX = (dragPhysics.swingVelX + forceX) * damping;
                dragPhysics.swingVelY = (dragPhysics.swingVelY + forceY) * damping;

                dragPhysics.swingX += dragPhysics.swingVelX;
                dragPhysics.swingY += dragPhysics.swingVelY;

                // Redesenha a oscilação a 60fps enquanto o cabo balança
                drawCable(
                    tempCableEl, 
                    getPortCenter(startPort), 
                    dragPhysics.displayedTarget, 
                    [], 
                    startPort.dataset.type, 
                    { x: dragPhysics.swingX, y: dragPhysics.swingY }
                );
            }

            // Animação de cones dos alto-falantes se a simulação de som estiver ativa
            {
                const reduced=powerMotionPreference.matches;
                Object.values(state.devices).forEach(dev => {
                    const woofers=dev.visualWoofers??=dev.el.querySelectorAll('.spk-woofer,.classic-box-woofer');
                    if (dev.analyzer && dev.dataArray && woofers.length) {
                        dev.analyzer.getByteFrequencyData(dev.dataArray);
                        let sum=0;for(let i=0;i<Math.min(10,dev.dataArray.length);i++)sum+=dev.dataArray[i];
                        const avg=sum/Math.min(10,dev.dataArray.length);
                        const punch = (SUB_TYPES.has(dev.type) || PASSIVE_SUB_TYPES.has(dev.type)) ? .025 : .014;
                        const scale=1+(!reduced&&dev.powered!==false?(avg/255)*punch:0);
                        woofers.forEach(w=>{w.style.transform=`${w.classList.contains('classic-box-woofer')?'translateX(-50%) ':''}scale(${scale})`;});
                    }
                });
            }
            const devices=Object.values(state.devices);
            const activeAudio=devices.some(dev=>dev.state?.playing||dev.state?.radioOn||(dev.meters?.visible&&dev.powered===true&&dev.meters.peaks.some(peak=>peak>.001)));
            const activeCable=isPatching||state.connections.some(connection=>connection.seatStarted!=null);
            Hardware.renderLightingDemo();
            visualRendering=false;
            scheduleVisuals(activeCable?0:activeAudio?33:pendantLightSignature?90:0);
        }
        document.addEventListener('visibilitychange',()=>{
            if(document.visibilityState==='visible')scheduleVisuals();
            else {cancelAnimationFrame(visualFrame);clearTimeout(visualTimer);visualFrame=0;visualTimer=0;}
        });
        window.addEventListener('audio-lighting-dirty',()=>{if(!visualRendering)scheduleVisuals();});
        for(const type of ['input','change','click','pointerup','keyup','wheel','scroll'])document.addEventListener(type,()=>scheduleVisuals(),{capture:true,passive:true});
        window.addEventListener('resize',()=>scheduleVisuals(),{passive:true});
