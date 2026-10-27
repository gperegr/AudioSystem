/* Signal types, compatibility validation, warnings, ports, and connection selection. */
        const signalName = signal => ({line:'sinal de linha',phono:'sinal phono (cápsula MM)',amplified:'sinal de potência para caixas passivas',headphone:'sinal amplificado para fones',interconnect:'linha, phono ou fones (sem conversão)',unknown:'sinal ainda não definido',mixed:'sinais diferentes nos canais L/R'}[signal] || signal);
        const SIGNAL_INFO={
            line:{label:'LINHA',description:'Áudio entre fontes, pré-amplificadores, processadores e caixas ativas. Não alimenta uma caixa passiva.'},
            phono:{label:'PHONO',description:'Baixo nível da cápsula magnética do toca-discos. Precisa de um pré de phono com ganho e equalização RIAA.'},
            amplified:{label:'POTÊNCIA · CAIXAS',description:'Saída amplificada SPEAKER para caixas passivas. Não conecte a entradas de linha, phono ou fones.'},
            headphone:{label:'FONES',description:'Saída amplificada de baixa potência para fones; diferente de SPEAKER. Pode alimentar linha com nível reduzido e adaptador adequado.'},
            interconnect:{label:'PASSAGEM ANALÓGICA',description:'Preserva linha, phono ou fones. Não converte o nível nem aplica RIAA. Não aceita potência SPEAKER.'},
            unknown:{label:'A DEFINIR',description:'O sinal depende da fonte ligada à entrada deste adaptador ou seletor.'},
            mixed:{label:'SINAIS DIFERENTES',description:'As entradas estão recebendo níveis de sinal diferentes. Revise a origem dos canais.'}
        };
        function portSignalLabel(port){return port.dataset.role?.startsWith('lfe-')?'LINHA · SUB/LFE':SIGNAL_INFO[getPortSignal(port)]?.label||'A DEFINIR';}
        function portSignalsMarkup(dev){
            const groups=new Map();
            dev.el.querySelectorAll('.port').forEach(port=>{
                const node=port.dataset.node||'',io=port.dataset.io,signal=getPortSignal(port),format=port.dataset.format||(/^rca/.test(port.dataset.type)?'RCA':({p10:'P10 TRS estéreo',p2:'P2 estéreo',wire:'Bornes +/−'}[port.dataset.type]||port.dataset.type)),base=node.replace(/[LR]$/,'');
                const key=[io,base,format,signal].join(':');
                if(!groups.has(key))groups.set(key,{port,io,node:base,signal,format,channels:[]});
                if(port.dataset.channel)groups.get(key).channels.push(port.dataset.channel);
            });
            if(!groups.size)return '';
            const rows=[...groups.values()].map(group=>{
                const {port,io,node,signal,format}=group,info=SIGNAL_INFO[signal]||SIGNAL_INFO.unknown;
                const groupName=port.dataset.role?.startsWith('lfe-')?'SUB/LFE mono':node.startsWith('outPhone')?'Fones '+node.replace('outPhone',''):node==='line'?'LINE OUT':node.startsWith('spkOut')||node==='speaker'?'SPEAKER':node==='inStereo'||node==='outStereo'?'Estéreo':node.replace(/^in/,'Entrada ').replace(/^out/,'Saída ').replace('Low','Graves').replace('Mid','Médios').replace('High','Agudos');
                const channels=new Set(group.channels),channelText=channels.size===2?' · L/R':channels.size===1?' · '+[...channels][0]:'';
                const direction=io==='in'?'Entrada':'Saída';
                const detail=port.dataset.role?.startsWith('lfe-')?'Nível de linha para subwoofer; SUB/LFE descreve o conteúdo de graves, não um nível de potência.':info.description;
                return `<div class="port-signal-row" role="group" aria-label="${direction}: ${groupName||'áudio'}, ${format}${channelText}. ${detail}" title="${direction} · ${detail}"><div class="port-signal-identity"><strong>${groupName||direction}</strong><small>${format}${channelText}</small></div><span class="port-signal-direction" data-io="${io}" aria-hidden="true" title="${direction}"><svg viewBox="0 0 20 20"><path d="M10 3v13m-5-5 5 5 5-5"/></svg></span><span class="signal-badge" data-level="${signal}" title="${detail}"><i aria-hidden="true"></i>${portSignalLabel(port)}</span></div>`;
            });
            return rows.join('');
        }
        function portSignalsInspectorHtml(dev){
            if(!dev.el.querySelector('.port'))return '';
            return `<section class="port-signal-panel"><h3>Sinais de entrada e saída</h3><div id="port-signal-rows">${portSignalsMarkup(dev)}</div></section>`;
        }
        function refreshPortSignalInspector(){
            const dev=state.devices[state.selectedDeviceId],container=document.getElementById('port-signal-rows');
            if(dev&&container){const markup=portSignalsMarkup(dev);if(container.innerHTML!==markup)container.innerHTML=markup;}
        }

        function getPortSignal(port, visited = new Set(), prospective = null,channelHint='') {
            const dev = state.devices[port?.closest('.device-node')?.id];
            if (!dev) return 'unknown';
            const node = port.dataset.node || '', role = port.dataset.role || '';
            const config=INTERFACE_DEVICES[dev.type];
            const passthrough=config?.passive||RCA_SWITCH_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type);
            if(config&&!config.passive)return port.dataset.io==='in'?config.inputSignal:config.outputSignal;
            if(passthrough){
                if(port.dataset.io==='in')return 'interconnect';
                if(visited.has(dev.id))return 'unknown';
                const next=new Set(visited);next.add(dev.id);
                const routed=routedInputPorts(dev,port,channelHint),accepts=input=>!!input&&routed.includes(input);
                const sources=state.connections.filter(c=>!c.miswired&&c.inId!==prospective?.input?.id&&accepts(document.getElementById(c.inId))).map(c=>({output:document.getElementById(c.outId),input:document.getElementById(c.inId)})).filter(link=>link.output);
                if(accepts(prospective?.input))sources.push(prospective);
                const signals=new Set(sources.map(link=>getPortSignal(link.output,next,prospective,portChannel(link.input)||portChannel(port)||channelHint)).filter(signal=>signal!=='unknown'));
                return signals.size>1?'mixed':signals.values().next().value||'unknown';
            }
            if (role.startsWith('lfe-')) return 'line';
            if (port.dataset.signal) return port.dataset.signal;
            if (port.dataset.io === 'in') {
                if (HP_TYPES.has(dev.type))return 'headphone';
                if (PASSIVE_SPK.has(dev.type) || PASSIVE_SUB_TYPES.has(dev.type) || SPEAKER_SWITCH_TYPES.has(dev.type)) return 'amplified';
                return 'line';
            }
            if (TURNTABLE_TYPES.has(dev.type)) return dev.state.tt?.output === 'phono' ? 'phono' : 'line';
            if (SPEAKER_SWITCH_TYPES.has(dev.type)) return 'amplified';
            if (['powerStereo','powerVintage','powerAmp'].includes(dev.type) && /^(out[RL]|speaker[RL])$/.test(node)) return 'amplified';
            if (dev.type === 'receiver' && /^spkOut/.test(node)) return 'amplified';
            if (/^outPhone|^outAux$/.test(node) && ['receiver','headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(dev.type)) return 'headphone';
            return 'line';
        }
        function signalMatches(actual,expected){
            if(actual==='unknown')return true;
            if(actual==='mixed')return false;
            if(expected==='interconnect')return ['line','phono','headphone'].includes(actual);
            return actual===expected||(['line','phono','headphone'].includes(actual)&&['line','phono','headphone'].includes(expected));
        }
        function revalidateSignalConnections() {
            for (let index = state.connections.length - 1; index >= 0; index--) {
                const cable = state.connections[index];
                if (!getPortCompatibility(document.getElementById(cable.outId), document.getElementById(cable.inId), false).compatible) removeConnection(index);
            }
            updatePortGuidance();
        }

        function signalLevelWarnings(actual,expected){
            if(actual==='phono'&&['line','headphone'].includes(expected))return ['PHONO tem nível muito baixo e precisa de pré com correção RIAA. Esta ligação produzirá áudio fraco e resposta tonal incorreta.'];
            if(['line','headphone'].includes(actual)&&expected==='phono')return ['Esta entrada PHONO amplifica muito mais que LINE e aplica RIAA: este nível provoca sobrecarga e distorção. Prefira uma entrada LINE. Isso não equivale ao dano por sinal SPEAKER.'];
            if(actual==='line'&&expected==='headphone')return ['Uma saída LINE não é um amplificador de fones: a carga pode reduzir o volume e provocar limitação de corrente. Use um amp de fones.'];
            if(actual==='headphone'&&expected==='line')return ['Saída de fones em entrada LINE: comece com volume baixo. O adaptador não atenua nem converte o nível.'];
            return [];
        }
        function connectionLoadWarnings(prospective){
            const warnings=[];
            for(const amp of Object.values(state.devices).filter(dev=>FIXED_AMP_SPECS[dev.type]))for(const ch of ['L','R']){
                const ports=[...amp.el.querySelectorAll('.port[data-io="out"]')].filter(port=>getPortSignal(port)==='amplified'&&portChannel(port)===ch);
                const terminals=uniqueTerminalLoads(ports,prospective),ohms=parallelOhms(terminals.map(load=>load.ohms));
                const previous=parallelOhms(uniqueTerminalLoads(ports).map(load=>load.ohms));
                if(ohms<FIXED_AMP_SPECS[amp.type].minOhms-.01&&Math.abs(ohms-previous)>.01)warnings.push((DEVICE_NAMES[amp.type]||'Amplificador')+' · '+ch+': a carga resultará em '+ohms.toFixed(1)+' Ω, abaixo do mínimo de '+amp.state.minOhms+' Ω. A proteção silenciará este canal; não é uma combinação válida para uso.');
            }
            return warnings;
        }
        function findConnectionDamageRisk(output,input,prospective){
            const direct=connectionDamageRisk(output,input,getPortSignal(output,new Set(),prospective),getPortSignal(input));
            if(direct)return direct;
            // A passive adapter changes the plug, never the electrical signal or its danger.
            for(const cable of prospectiveConnections(prospective)){
                const upstream=document.getElementById(cable.outId),downstream=document.getElementById(cable.inId);
                if(!upstream||!downstream)continue;
                const before=getPortSignal(upstream),after=getPortSignal(upstream,new Set(),prospective);
                const includesPower=after==='amplified'||after==='mixed'&&['L','R'].some(ch=>getPortSignal(upstream,new Set(),prospective,ch)==='amplified');
                if(includesPower&&(before!=='amplified'||cable.inId===input.id)){
                    const risk=connectionDamageRisk(upstream,downstream,'amplified',getPortSignal(downstream));if(risk)return risk;
                }
            }
            return null;
        }
        function applyDeviceDamage(dev,kind){
            if(!dev||dev.state.damage)return;
            dev.state.damage={kind};toggleDevicePower(dev);unpairDevice(dev);
            if(SOURCE_TYPES.has(dev.type))setSourcePlaying(dev,false);
            dev.listeningGain?.gain.setValueAtTime(0,state.audioCtx.currentTime);
            for(let i=state.connections.length-1;i>=0;i--){const cable=state.connections[i];if([cable.outId,cable.inId].some(id=>document.getElementById(id)?.closest('.device-node')?.id===dev.id))removeConnection(i);}
            if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);
            scheduleProjectSave();
        }
        function connectionDamageRisk(output,input,supplied,expected){
            if(supplied!=='amplified'||!['line','phono','headphone'].includes(expected))return null;
            return {deviceId:input.closest('.device-node').id,reason:'Uma saída SPEAKER fornece sinal de potência. Esta entrada recebe '+signalName(expected)+'. Aplicar essa potência pode danificar seu estágio de entrada. Adaptadores de conector não reduzem a tensão; use um conversor de nível alto para linha.'};
        }
        async function offerDamageSimulation(compatibility){
            const risk=compatibility?.damageRisk,dev=state.devices[risk?.deviceId];
            if(!dev)return;
            if(dev.state.damage){await showAppDialog({title:'Equipamento danificado',message:'Este equipamento já está danificado. Substitua-o por outro do catálogo.'});return;}
            const name=DEVICE_NAMES[dev.type]||'Equipamento';
            const accepted=await showAppDialog({title:`${name} · risco de dano`,message:`${risk.reason}\n\nCancelar mantém o equipamento intacto. Confirmar simula a ligação energizada e danifica este equipamento no projeto. O cabo incompatível não será instalado.`,acceptLabel:'Simular dano',requireChoice:true});
            if(!accepted)return;
            applyDeviceDamage(dev,'speaker-level-overload');
        }
        // Explica os impedimentos usando as mesmas regras que validam a conexão.
        function getPortCompatibility(pA, pB, checkNetwork = true) {
            if (!pA || !pB) return { compatible:false, reason:'Selecione duas portas.' };
            if (pA === pB) return { compatible:false, reason:'Escolha uma porta diferente.' };
            if (pA.closest('.device-node') === pB.closest('.device-node')) return { compatible:false, reason:'Conecte equipamentos diferentes.' };
            const typeA=pA.dataset.type,typeB=pB.dataset.type;
            const genericRcaPair=(typeA==='rca'&&(typeB==='rca-r'||typeB==='rca-l'))||(typeB==='rca'&&(typeA==='rca-r'||typeA==='rca-l'));
            const plugFits=typeA===typeB||genericRcaPair||(typeA?.startsWith('rca')&&typeB?.startsWith('rca'));
            const label=type=>({'rca-r':'RCA direito','rca-l':'RCA esquerdo',rca:'RCA',p10:'P10',p2:'P2',wire:'fio de caixa'}[type]||type||'conector');
            if(!plugFits)return{compatible:false,reason:`Barreira física: ${label(typeA)} não encaixa em ${label(typeB)}.`};
            if (connectionGuidanceEnabled && pA.dataset.io === pB.dataset.io) return { compatible:false, reason:'É preciso ligar uma saída a uma entrada.' };
            if([pA,pB].some(port=>state.devices[port.closest('.device-node')?.id]?.state.damage))return {compatible:false,reason:'Equipamento danificado: substitua-o por outro do catálogo antes de ligar novos cabos.'};

            const output = pA.dataset.io === 'out' ? pA : pB;
            const input = output === pA ? pB : pA;
            // A cable must not close a feedback loop through existing equipment.
            const origin=output.closest('.device-node').id,destination=input.closest('.device-node').id;
            const pending=[destination],seen=new Set();
            while(pending.length){
                const id=pending.pop();if(id===origin)return {compatible:false,reason:'Esta ligação fecha um ciclo de realimentação. Mantenha o percurso da fonte até a saída de escuta.'};
                if(seen.has(id))continue;seen.add(id);
                for(const cable of state.connections){
                    if(cable.miswired)continue;
                    if(cable.inId===input.id||cable.outId===output.id)continue;
                    const from=document.getElementById(cable.outId)?.closest('.device-node')?.id;
                    if(from===id){const to=document.getElementById(cable.inId)?.closest('.device-node')?.id;if(to)pending.push(to);}
                }
            }
            const prospective={output,input};
            const supplied = getPortSignal(output,new Set(),prospective), expected = getPortSignal(input);
            const damageRisk=connectionGuidanceEnabled?findConnectionDamageRisk(output,input,prospective):null;
            if(damageRisk)return {compatible:false,damageRisk,reason:damageRisk.reason};
            const warnings=connectionGuidanceEnabled?signalLevelWarnings(supplied,expected):[];
            if (connectionGuidanceEnabled&&!signalMatches(supplied,expected)) {
                return { compatible:false, damageRisk:connectionDamageRisk(output,input,supplied,expected), reason:`Sinal incompatível: a saída fornece ${signalName(supplied)}, mas a entrada espera ${signalName(expected)}. O conector não converte o sinal.` };
            }
            // Simule a nova ligação também nos adaptadores já conectados a outros equipamentos.
            if(checkNetwork&&connectionGuidanceEnabled)for(const cable of state.connections){
                if(cable.inId===input.id||cable.outId===output.id)continue;
                const downstreamOut=document.getElementById(cable.outId),downstreamIn=document.getElementById(cable.inId);
                if(!downstreamOut||!downstreamIn)continue;
                const actual=getPortSignal(downstreamOut,new Set(),prospective), required=getPortSignal(downstreamIn);
                if(actual!==getPortSignal(downstreamOut))warnings.push(...signalLevelWarnings(actual,required));
                if(!signalMatches(actual,required))return {compatible:false,damageRisk:connectionDamageRisk(downstreamOut,downstreamIn,actual,required),reason:`A cadeia passiva preserva ${signalName(actual)}, mas um equipamento conectado depois dele espera ${signalName(required)}. Use um conversor de sinal.`};
            }
            if (connectionGuidanceEnabled&&pA.dataset.channel && pB.dataset.channel && pA.dataset.channel !== pB.dataset.channel)warnings.push('Canais cruzados: a saída '+output.dataset.channel+' alimentará a entrada '+input.dataset.channel+'. As cores RCA indicam canal, mas não impedem o encaixe.');
            if(checkNetwork&&connectionGuidanceEnabled)warnings.push(...connectionLoadWarnings(prospective));
            const unique=[...new Set(warnings)];return {compatible:true,warnings:unique,reason:unique.join(' ')||`Conector compatível${connectionGuidanceEnabled?` · ${signalName(supplied)}`:''}.`};
        }

        function arePortsCompatible(pA, pB) {
            return getPortCompatibility(pA, pB).compatible;
        }

        function isSelectedSwitchOutput(dev, port) {
            if (dev && MATRIX_TYPES.has(dev.type)) return !!dev.state.matrixOutputs[Number(port?.dataset.node?.match(/^out(\d)/)?.[1])-1];
            if (!dev || !SELECTOR_TYPES.has(dev.type)) return true;
            return port?.dataset.node?.startsWith(`out${dev.selectedSource}`);
        }

        function portCarriesSignal(dev, port) {
            if (!dev || !port || dev.state.damage) return false;
            if(dev.type==='streamIntegrated'&&(dev.state.streamMute||dev.state.volume<=0||port.dataset.node.startsWith('speaker')&&dev.streamPhonesConnected))return false;
            if (!isSelectedSwitchOutput(dev, port)) return false;
            const nodeName = port.dataset.node || '';
            const channel=port.dataset.channel;
            if(SIGNAL_GENERATOR_TYPES.has(dev.type)&&(dev.state.signalLevel===0||(channel&&dev.state.signalChannel!=='both'&&dev.state.signalChannel!==channel)))return false;
            if(POWER_OUTPUT_TYPES.has(dev.type)&&getPortSignal(port)==='amplified'&&(dev.channelLoads?.[channel]??8)<dev.state.minOhms-.01)return false;
            if((RADIO_RECEIVERS.has(dev.type)||dev.type==='preamp'||dev.type==='headphoneAmp'||dev.type==='headphoneAmpModern')&&dev.state.volume<=0)return false;
            if(dev.type==='headphoneAmp4'){const index=Number(nodeName.match(/^outPhone(\d)$/)?.[1])-1;if(index>=0&&dev.state.channelVolumes[index]<=0)return false;}
            if(CUSTOM_POWER_AMPS[dev.type])return (dev.state.channelGain[port.dataset.channel]??1)>0;
            if(controlAmpConfig(dev.type))return dev.state.volume>0&&!dev.state.preMuted;
            if (MIXER_TYPES.has(dev.type) && /^out[RL]$/.test(nodeName)) return dev.state.channelVolumes.some(value => value > 0);
            if (CROSSOVER_TYPES.has(dev.type) && /^out(?:Low|Mid|High)[RL]$/.test(nodeName)) return true;
            return true;
        }

        function isPortOccupied(port) {
            return state.connections.some(connection => connection.inId === port.id || connection.outId === port.id);
        }

        function canonicalPortLabel(port){
            const io=port.dataset.io==='out'?'Saída':'Entrada';
            const format=(port.dataset.format||port.dataset.type||'conector').replace(/^rca-[lr]$/i,'RCA').replace(/^p10$/i,'P10').replace(/^p2$/i,'P2').replace(/^wire$/i,'fio para caixas').replace(/^rca$/i,'RCA').toUpperCase();
            const signal=signalName(getPortSignal(port));
            const channel=port.dataset.channel||(/L$/.test(port.dataset.node||'')?'L':/R$/.test(port.dataset.node||'')?'R':'');
            return [io,format,channel?`canal ${channel==='L'?'esquerdo (L)':'direito (R)'}`:'',signal].filter(Boolean).join(' · ');
        }

        let highlightedCompatibilityCable=null;
        function updatePortGuidance(forceCompatibilityRefresh=false) {
            const guidance = document.getElementById('connection-guidance');
            const selectedCable=!isPatching?state.selectedConnection:null;
            const cableOut=selectedCable&&document.getElementById(selectedCable.outId),cableIn=selectedCable&&document.getElementById(selectedCable.inId);
            const cableEndpoints=new Set([cableOut?.closest('.device-node')?.id,cableIn?.closest('.device-node')?.id].filter(Boolean));
            const samePlug=(a,b)=>{const x=a?.dataset.type,y=b?.dataset.type;return x===y||(x==='rca'&&y?.startsWith('rca'))||(y==='rca'&&x?.startsWith('rca'))||(x?.startsWith('rca')&&y?.startsWith('rca'));};
            if(forceCompatibilityRefresh||selectedCable!==highlightedCompatibilityCable){
                highlightedCompatibilityCable=selectedCable;
                document.querySelectorAll('.device-node').forEach(device=>{
                    if(!connectionGuidanceEnabled||!selectedCable||!cableOut||!cableIn){device.classList.remove('no-cable-compatibility');return;}
                    if(cableEndpoints.has(device.id)){device.classList.remove('no-cable-compatibility');return;}
                    const freePort=[...device.querySelectorAll('.port')].some(port=>{
                        if(isPortOccupied(port))return false;
                        if(port.dataset.io==='in')return samePlug(cableOut,port)&&getPortCompatibility(cableOut,port).compatible;
                        if(port.dataset.io==='out')return samePlug(port,cableIn)&&getPortCompatibility(port,cableIn).compatible;
                        return false;
                    });
                    device.classList.toggle('no-cable-compatibility',!freePort);
                });
            }
            document.querySelectorAll('.port').forEach(port => {
                const occupied = isPortOccupied(port);
                const direction = port.dataset.io === 'out' ? 'saída' : 'entrada';
                const type = port.dataset.type || 'conector';
                const name = canonicalPortLabel(port);
                port.dataset.baseTitle = name;
                let status = occupied ? 'ocupado' : 'livre';
                let explanation = occupied ? 'Esta porta já está conectada. Arraste o cabo a partir dela para refazer a ligação.' : `${direction} livre.`;
                port.classList.toggle('port-available', connectionGuidanceEnabled && !occupied && !isPatching);
                port.classList.toggle('port-occupied', connectionGuidanceEnabled && occupied && isPatching);
                port.classList.remove('port-incompatible', 'port-compatible', 'port-source');
                if (connectionGuidanceEnabled && isPatching && startPort) {
                    if (port === startPort) {
                        status = 'origem';
                        explanation = 'Origem selecionada. Solte em uma porta verde.';
                        port.classList.add('port-source');
                    } else if (occupied) {
                        status = 'ocupado';
                        explanation = 'Esta porta já está conectada. Remova ou refaça a ligação existente.';
                        port.classList.add('port-incompatible');
                    } else {
                        const compatibility = getPortCompatibility(startPort, port);
                        status = compatibility.compatible ? 'compatível · livre' : 'incompatível';
                        explanation = compatibility.reason;
                        port.classList.add(compatibility.compatible ? 'port-compatible' : 'port-incompatible');
                    }
                } else if (connectionGuidanceEnabled && !isPatching && state.selectedConnection) {
                    const outPort = document.getElementById(state.selectedConnection.outId);
                    const inPort = document.getElementById(state.selectedConnection.inId);
                    if (port === outPort || port === inPort) {
                        status = 'cabo selecionado';
                        explanation = 'Extremidade do cabo selecionado. Portas verdes mostram destinos alternativos compatíveis.';
                        port.classList.add('port-source');
                    } else if (!occupied && outPort) {
                        const compatibility = getPortCompatibility(outPort, port);
                        if (compatibility.compatible) {
                            status = 'compatível · livre';
                            explanation = `${compatibility.reason} Para mover o cabo, arraste uma das extremidades.`;
                            port.classList.add('port-compatible');
                        } else if (port === hoveredGuidancePort) {
                            status = 'incompatível';
                            explanation = compatibility.reason;
                            port.classList.add('port-incompatible');
                        }
                    }
                }
                const signal = getPortSignal(port);
                port.dataset.signalLevel = signal;
                explanation = `${signalName(signal)}. ${explanation}`;
                port.dataset.status = status;
                port.setAttribute('aria-label', `${name} · ${status}`);
                port.setAttribute('title', connectionGuidanceEnabled?`${name} · ${direction} · ${status}. ${explanation}`:'');
            });
            refreshPortSignalInspector();
            const summaryOut=state.selectedConnection&&document.getElementById(state.selectedConnection.outId),summaryIn=state.selectedConnection&&document.getElementById(state.selectedConnection.inId),cableSummary=document.querySelector('#cable-properties .cable-signal-summary');
            if(cableSummary)cableSummary.textContent=connectionGuidanceEnabled&&summaryOut&&summaryIn?`Transporta ${portSignalLabel(summaryOut)} → entrada espera ${portSignalLabel(summaryIn)}. ${getPortCompatibility(summaryOut,summaryIn).reason}`:'';
            if (!guidance) return;
            const selected = state.selectedConnection;
            guidance.classList.toggle('is-active', connectionGuidanceEnabled&&(isPatching || !!selected));
            guidance.classList.toggle('is-invalid', connectionGuidanceEnabled&&isPatching && !hoveredTargetPort);
            if(!connectionGuidanceEnabled){guidance.textContent='';return;}
            if (isPatching && startPort) {
                const startName = startPort.dataset.baseTitle || startPort.dataset.type || 'porta';
                const hovered = hoveredGuidancePort && hoveredGuidancePort !== startPort ? hoveredGuidancePort : null;
                if (hovered) {
                    const reason = isPortOccupied(hovered) ? 'Esta porta já está conectada; refaça a ligação a partir dela.' : getPortCompatibility(startPort, hovered).reason;
                    guidance.textContent = arePortsCompatible(startPort, hovered) && !isPortOccupied(hovered)
                        ? `Compatível · ${portSignalLabel(startPort)} → ${portSignalLabel(hovered)}. ${getPortCompatibility(startPort,hovered).reason} Solte para conectar.`
                        : `${getPortCompatibility(startPort,hovered).damageRisk?'RISCO DE DANO · Solte para revisar o alerta. ':'Não conecta: '}${reason}`;
                } else {
                    guidance.textContent = `Origem: ${startName} · ${portSignalLabel(startPort)}. Portas verdes aceitam este sinal e conector.`;
                }
            } else if (selected) {
                const output = document.getElementById(selected.outId);
                const input = document.getElementById(selected.inId);
                guidance.textContent = `Cabo selecionado: ${output?.dataset.baseTitle || 'saída'} → ${input?.dataset.baseTitle || 'entrada'}. Portas verdes aceitam essa saída; consulte o motivo no título de outras portas.`;
            } else {
                guidance.textContent = '';
            }
        }

        // Encontra a porta mais próxima do cursor dentro de um raio de atração magnética
        function findTargetPortNear(clientX, clientY, maxDist = 28) {
            let closest = null;
            let minDist = maxDist;
            document.querySelectorAll('.port').forEach(p => {
                if (p === startPort) return;
                const rect = p.getBoundingClientRect();
                const anchor=getPortScreenAnchor(p);
                const cx=anchor.x,cy=anchor.y;
                const dist = Math.hypot(clientX - cx, clientY - cy);
                if (dist < minDist && !isPortOccupied(p) && arePortsCompatible(startPort, p)) {
                    minDist = dist;
                    closest = p;
                }
            });
            return closest;
        }

        let hoveredTargetPort = null;
        let hoveredGuidancePort = null;

        canvas.addEventListener('pointermove', e => {
            if (isPatching) return;
            const port = document.elementFromPoint(e.clientX, e.clientY)?.closest('.port') || null;
            if (port !== hoveredGuidancePort) {
                hoveredGuidancePort = port;
                if (state.selectedConnection) updatePortGuidance();
            }
        });
        canvas.addEventListener('mouseleave', () => {
            hoveredGuidancePort = null;
            if (state.selectedConnection && !isPatching) updatePortGuidance();
        });

        window.addEventListener('pointermove', e => {
            if (isPatching && tempCableEl && startPort) {
                e.preventDefault();
                const guidancePort = document.elementFromPoint(e.clientX, e.clientY)?.closest('.port') || null;
                if (guidancePort !== hoveredGuidancePort) {
                    hoveredGuidancePort = guidancePort;
                    updatePortGuidance();
                }
                const c = canvas.getBoundingClientRect();
                const now = performance.now();
                const dt = Math.max(8, Math.min(50, now - (dragPhysics.lastTime || now))) / 1000;
                
                // Calcula velocidade e aceleração instantânea do mouse com amortecimento
                const vx = (e.clientX - dragPhysics.lastX) / dt;
                const vy = (e.clientY - dragPhysics.lastY) / dt;

                // Força de arrasto sutil (sensação de peso e fricção do ar, sem efeito de estilingue)
                dragPhysics.swingVelX += -vx * 0.016;
                dragPhysics.swingVelY += -vy * 0.010;

                // Limita a velocidade máxima de oscilação para manter o cabo controlado
                dragPhysics.swingVelX = Math.max(-35, Math.min(35, dragPhysics.swingVelX));
                dragPhysics.swingVelY = Math.max(-25, Math.min(25, dragPhysics.swingVelY));

                dragPhysics.lastX = e.clientX;
                dragPhysics.lastY = e.clientY;
                dragPhysics.lastTime = now;
                
                // Busca porta compatível próxima com efeito magnético
                const candidate = findTargetPortNear(e.clientX, e.clientY, 32);
                if (candidate !== hoveredTargetPort) {
                    if (hoveredTargetPort) hoveredTargetPort.classList.remove('port-highlight');
                    hoveredTargetPort = candidate;
                    if (hoveredTargetPort) hoveredTargetPort.classList.add('port-highlight');
                    updatePortGuidance();
                }

                dragPhysics.activeTarget = hoveredTargetPort
                    ? getPortCenter(hoveredTargetPort)
                    : screenToWorld(e.clientX, e.clientY);


            }
        });

        window.addEventListener('pointerup', async e => {
            if(e.cancelled){cancelCableDrag();return;}
            if (isPatching) {
                if (hoveredTargetPort) {
                    hoveredTargetPort.classList.remove('port-highlight');
                }

                // Tenta pegar a porta pelo magnetismo ou diretamente sob o cursor
                tempCableEl.style.visibility = 'hidden';
                const directEl = document.elementFromPoint(e.clientX, e.clientY);
                tempCableEl.style.visibility = 'visible';
                
                let tPort = directEl ? directEl.closest('.port') : null;
                const attempted=tPort&&!isPortOccupied(tPort)?getPortCompatibility(startPort,tPort):null;
                const hazardous=!!attempted?.damageRisk;
                if(connectionGuidanceEnabled&&hazardous){cancelCableDrag();offerDamageSimulation(attempted);return;}
                if (!tPort || isPortOccupied(tPort) || !arePortsCompatible(startPort, tPort)) {
                    tPort = findTargetPortNear(e.clientX, e.clientY, 36);
                }
                
                if (tPort && arePortsCompatible(startPort, tPort)) {
                    const review=getPortCompatibility(startPort,tPort);
                    if(connectionGuidanceEnabled&&review.warnings?.length){
                        const accepted=await showAppDialog({title:'Revisar ligação',message:review.warnings.join('\n\n')+'\n\nDeseja conectar mesmo assim?',acceptLabel:'Conectar',requireChoice:true});
                        if(!accepted){cancelCableDrag();return;}
                    }
                    const outP = startPort.dataset.io === 'out' ? startPort : tPort;
                    const inP = startPort.dataset.io === 'out' ? tPort : startPort;
                    
                    const exIdx = state.connections.findIndex(c => c.inId === inP.id || c.outId === outP.id);
                    if (exIdx > -1) removeConnection(exIdx);

                    tempCableEl.classList.remove('active');
                    const connType = outP.dataset.type || inP.dataset.type;
                    const miswired=outP.dataset.io!=='out'||inP.dataset.io!=='in';
                    const connection={outId:outP.id,inId:inP.id,outDeviceId:outP.closest('.device-node')?.id,inDeviceId:inP.closest('.device-node')?.id,el:tempCableEl,type:connType,wps:[],miswired};
                    if(miswired)tempCableEl.dataset.miswired='true';
                    state.connections.push(connection);invalidateCableBundles();animateCableSeat(connection,tPort);
                    playUiSound('connect');
                    outP.classList.add('connected'); inP.classList.add('connected');
                    updatePortGuidance(true);
                    
                    const devOut = state.devices[outP.closest('.device-node').id];
                    const devIn = state.devices[inP.closest('.device-node').id];
                    if (!miswired && devOut && devIn && devOut.nodes[outP.dataset.node] && devIn.nodes[inP.dataset.node]) {
                        try{devOut.nodes[outP.dataset.node].connect(devIn.nodes[inP.dataset.node]);}catch{}
                    }
                    
                    updateCables(); updateCableFlows();
                } else {
                    tempCableEl.remove();
                }
                stopCableHum();
                isPatching = false; startPort = null; tempCableEl = null; hoveredTargetPort = null;
                hoveredGuidancePort = null;
                updatePortGuidance();
                dragPhysics.activeTarget = null;
            }
        });

        function animateCableSeat(connection,port){
            if(state.restoringProject||powerMotionPreference.matches)return;
            connection.seatStarted=performance.now();connection.seatEnd=port.id===connection.inId?'end':'start';
            connection.seatAnimations=[port.animate([
                {outline:'2px solid rgba(157,224,181,.8)',outlineOffset:'2px'},
                {outline:'2px solid transparent',outlineOffset:'5px'}
            ],{delay:100,duration:300,easing:'ease-out'})];
        }

        function removeConnection(idx) {
            const c = state.connections[idx];
            if (!c) return;
            c.seatAnimations?.forEach(animation=>animation.cancel());
            playUiSound('disconnect');
            if (state.selectedConnection === c) selectCable(null);
            c.el.remove();
            
            const o = document.getElementById(c.outId); const i = document.getElementById(c.inId);
            if(o) o.classList.remove('connected'); if(i) i.classList.remove('connected');
            
            if(o && i && !c.miswired) {
                const dO = state.devices[o.closest('.device-node').id]; const dI = state.devices[i.closest('.device-node').id];
                if(dO && dI && dO.nodes[o.dataset.node] && dI.nodes[i.dataset.node]) {
                    try { dO.nodes[o.dataset.node].disconnect(dI.nodes[i.dataset.node]); } catch(e){}
                }
            }
            state.connections.splice(idx, 1);
            invalidateCableBundles();
            updateCableFlows();
            updatePortGuidance(true);
        }

        function selectCable(connection,restoreInspector=true) {
            state.selectedConnection?.el?.classList.remove('selected');
            state.selectedConnection = connection || null;
            state.selectedConnection?.el?.classList.add('selected');
            if(connection){inspectorEmpty.classList.add('hidden');inspectorContent.classList.add('hidden');document.getElementById('inspector-title').textContent=connection.label||'Cabo';}
            else if(restoreInspector){if(state.selectedDeviceId)selectDevice(state.selectedDeviceId,true);else{inspectorContent.classList.add('hidden');inspectorEmpty.classList.remove('hidden');document.getElementById('inspector-title').textContent='Selecione um equipamento';}}
            renderCableProperties();
            updatePortGuidance();
        }

