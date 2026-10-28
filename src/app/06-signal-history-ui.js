/* Standard input/output history for the connected component in the inspector. */
        const signalHistoryRecords=new Map();
        let signalHistoryPanel=null,signalHistorySignature='',signalHistoryLastGraph=0;
        let signalHistoryExpanded=savedAppPreferences.signalHistoryExpanded===true;
        const signalHistoryText=text=>window.AudioSystemLanguage?.translate(text)||text;
        function signalHistoryInspectorHtml(dev){
            if(!dev.el.querySelector('.port')&&!dev.btPairedId)return '';
            return `<details id="signal-history-panel" class="signal-history-panel" ${signalHistoryExpanded?'open':''}><summary>Histórico do sinal</summary><div class="signal-history-legend"><span>Entrada</span><span>Saída</span><small>12 s · −60 → 0 dBFS</small></div><small>Maior nível entre portas e canais. Escala digital, não volume real.</small><small>Spotify não passa por estes medidores.</small><div id="signal-history-rows" data-signal-history-rows></div></details>`;
        }
        function bindSignalHistoryPreference(){
            const panel=document.getElementById('signal-history-panel');if(!panel)return;
            panel.addEventListener('toggle',()=>{signalHistoryExpanded=panel.open;scheduleAppPreferencesSave();});
        }
        function disposeSignalHistoryRecord(record){
            for(const [source,target,output]of record.links){try{source.disconnect(target,output);}catch{}}
            for(const node of record.owned){try{node.disconnect();}catch{}}
        }
        function disposeSignalHistory(){
            signalHistoryRecords.forEach(disposeSignalHistoryRecord);signalHistoryRecords.clear();
            signalHistoryPanel=null;signalHistorySignature='';
        }
        function signalHistoryChain(selected){
            const devices=appState.project.devices,neighbors=new Map(Object.keys(devices).map(id=>[id,new Set()]));
            const link=(a,b)=>{if(neighbors.has(a)&&neighbors.has(b)){neighbors.get(a).add(b);neighbors.get(b).add(a);}};
            for(const cable of appState.project.connections){
                link(document.getElementById(cable.outId)?.closest('.device-node')?.id,document.getElementById(cable.inId)?.closest('.device-node')?.id);
            }
            for(const dev of Object.values(devices))if(dev.btPairedId)link(dev.id,dev.btPairedId);
            const found=new Set([selected.id]),queue=[selected.id];
            for(let i=0;i<queue.length;i++)for(const id of neighbors.get(queue[i])||[])if(!found.has(id)){found.add(id);queue.push(id);}
            return queue.map(id=>devices[id]).filter(Boolean);
        }
        function createSignalHistoryRecord(dev){
            const context=appState.audio.context,record={dev,links:[],owned:[],in:[],out:[],history:{in:[],out:[]},clipUntil:0};
            const sink=context.createGain();sink.gain.value=0;sink.connect(context.destination);record.owned.push(sink);
            const connect=(source,target,output=0)=>{source.connect(target,output);record.links.push([source,target,output]);};
            const tap=(node,output,io)=>{
                const analyzer=context.createAnalyser();analyzer.fftSize=2048;connect(node,analyzer,output);analyzer.connect(sink);
                record.owned.push(analyzer);record[io].push({analyzer,samples:new Float32Array(analyzer.fftSize)});
            };
            for(const io of ['in','out']){
                const seen=new Set();
                for(const port of dev.el.querySelectorAll(`.port[data-io="${io}"]`)){
                    // Observe the arriving cable before an input gain or source selector.
                    const cable=io==='in'?appState.project.connections.find(c=>c.inId===port.id&&!c.miswired):null;
                    const source=cable&&document.getElementById(cable.outId);
                    const upstream=source&&appState.project.devices[source.closest('.device-node')?.id];
                    const node=upstream?.nodes[source.dataset.node]||dev.nodes[port.dataset.node];if(!node||seen.has(node))continue;seen.add(node);
                    if(node.numberOfOutputs>1){for(let output=0;output<node.numberOfOutputs;output++)tap(node,output,io);}
                    else if(node.numberOfOutputs){
                        // Split before measuring: opposite-polarity stereo must not cancel.
                        const split=context.createChannelSplitter(2);record.owned.push(split);connect(node,split);
                        tap(split,0,io);tap(split,1,io);
                    }
                }
            }
            // Wireless-only headphones expose their actual receive node without a cable port.
            if(!record.in.length&&dev.btPairedId&&dev.nodes.in){tap(dev.nodes.in,0,'in');}
            return record;
        }
        function buildSignalHistoryRows(panel,devices){
            const host=panel.querySelector('[data-signal-history-rows]');host.replaceChildren();
            for(const dev of devices){
                const record=signalHistoryRecords.get(dev.id),row=document.createElement('article');row.className='signal-history-device';
                const name=document.createElement('button');name.type='button';name.className='signal-history-name';
                name.textContent=signalHistoryText(DEVICE_NAMES[dev.type]||dev.type);name.onclick=()=>selectDevice(dev.id);
                row.appendChild(name);record.row=row;
                for(const io of ['in','out']){
                    const line=document.createElement('div');line.className='signal-history-reading';line.dataset.direction=io;
                    line.innerHTML=`<span>${signalHistoryText(io==='in'?'Entrada':'Saída')}</span><div class="signal-history-trace"><svg viewBox="0 0 240 27" preserveAspectRatio="none" aria-hidden="true"><path class="signal-history-peak"/><path class="signal-history-rms"/><path class="signal-history-clips"/></svg><i></i></div><output>—</output><small></small>`;
                    row.appendChild(line);
                }
                host.appendChild(row);
            }
        }
        function updateSignalHistory(now){
            const panel=document.getElementById('signal-history-panel'),rect=panel?.getBoundingClientRect();
            const visible=panel?.open&&panel.getClientRects().length&&rect.bottom>0&&rect.top<innerHeight&&rect.right>0&&rect.left<innerWidth&&getComputedStyle(inspectorContent).visibility!=='hidden';
            const selected=appState.project.devices[appState.interface.selectedDeviceId];
            if(!visible||document.hidden||!selected||!appState.audio.context){if(signalHistoryRecords.size)disposeSignalHistory();return;}
            if(panel!==signalHistoryPanel){signalHistoryPanel=panel;signalHistorySignature='';}
            if(!signalHistorySignature||now-signalHistoryLastGraph>400){
                signalHistoryLastGraph=now;const devices=signalHistoryChain(selected);
                const topology=devices.map(dev=>dev.id+':'+(dev.btPairedId||'')).join('|')+'|'+appState.project.connections.map(c=>c.outId+':'+c.inId+':'+!!c.miswired).join('|');
                const signature=topology+'|'+window.AudioSystemLanguage?.language;
                if(signature!==signalHistorySignature){
                    // Cable changes can replace an input tap's upstream node.
                    const old=new Map(signalHistoryRecords);signalHistoryRecords.forEach(disposeSignalHistoryRecord);signalHistoryRecords.clear();
                    for(const dev of devices){const record=createSignalHistoryRecord(dev);if(old.has(dev.id))record.history=old.get(dev.id).history;signalHistoryRecords.set(dev.id,record);}
                    buildSignalHistoryRows(panel,devices);signalHistorySignature=signature;
                }
            }
            const running=appState.audio.context.state==='running';
            for(const record of signalHistoryRecords.values()){
                const dev=record.dev,spotify=!!dev.spotifyVinyl;
                const clipping=running&&(dev.electricalStages?.some(stage=>stage.clipping)||dev.outputCircuits?.some(circuit=>circuit.paths.some(path=>path.clipping)));
                if(clipping)record.clipUntil=now+1200;
                for(const io of ['in','out']){
                    const line=record.row.querySelector(`[data-direction="${io}"]`),reading={rms:0,peak:0};
                    if(running&&!spotify)for(const tap of record[io]){
                        tap.analyzer.getFloatTimeDomainData(tap.samples);const value=SignalHistory.measure(tap.samples);
                        reading.rms=Math.max(reading.rms,value.rms);reading.peak=Math.max(reading.peak,value.peak);
                    }
                    const unavailable=!record[io].length||spotify;
                    const state=unavailable?'unavailable':!running?'paused':SignalHistory.status(reading,io==='out'&&record.clipUntil>now);
                    line.dataset.state=state;
                    const history=record.history[io];SignalHistory.append(history,now,reading,io==='out'&&clipping);
                    line.querySelector('.signal-history-rms').setAttribute('d',SignalHistory.path(history,now));
                    line.querySelector('.signal-history-peak').setAttribute('d',SignalHistory.path(history,now,'peak'));
                    line.querySelector('.signal-history-clips').setAttribute('d',SignalHistory.clips(history,now));
                    line.querySelector('i').style.width=(SignalHistory.scale(reading.rms)*100).toFixed(1)+'%';
                    const db=SignalHistory.db(reading.rms),peak=SignalHistory.db(reading.peak);
                    line.querySelector('output').textContent=unavailable?'—':Number.isFinite(db)?db.toFixed(1):'−∞';
                    line.querySelector('small').textContent=signalHistoryText(spotify?'Spotify não mensurável':({unavailable:'Sem porta',paused:'Áudio suspenso',clip:'Saturação detectada',high:'Pico alto',silent:'Sem sinal digital',low:'Nível baixo',signal:'Sinal presente'})[state]);
                    line.title=signalHistoryText('Pico')+': '+(Number.isFinite(peak)?peak.toFixed(1):'−∞')+' dBFS';
                }
            }
        }
        document.addEventListener('visibilitychange',()=>{if(document.hidden)disposeSignalHistory();});
        window.addEventListener('pagehide',disposeSignalHistory);
