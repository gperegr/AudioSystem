/* Create and initialize equipment instances and their audio graphs. */
        function createDevice(type, x, y, requestedId=null) {
            if(type==='pendantLamp')return createPendantLamp(x,y,requestedId);
            if(WALL_LAMP_TYPES[type])return createWallLamp(type,x,y,requestedId);
            initAudio();
            const id = requestedId||'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const el = document.createElement('div');
            el.className = 'device-node';el.dataset.equipmentType=type;
            el.classList.add(`device-type-${type}`);
            el.classList.add(`device-family-${DEVICE_FAMILIES[type] || 'modern'}`);
            el.id = id;
            const deviceName = MATRIX_TYPES.has(type) ? `Seletor RCA 3×4${type==='rcaMatrixVintage'?' Vintage':''}` : DEVICE_NAMES[type] || type;
            el.setAttribute('aria-label', deviceName);
            el.tabIndex = 0;
            
            el.style.left = `${Math.max(0, snapCoordinate(x))}px`;
            el.style.top = `${Math.max(0, snapCoordinate(y))}px`;
            
            if (['turntableVintage','turntableBelt'].includes(type)) el.classList.add('device-type-turntable');
            const tpl = document.getElementById(`tpl-${type === 'turntableVintage' ? 'turntable' : type}`);
            if(tpl) el.innerHTML = tpl.innerHTML;
            else { el.innerHTML = `<div class="device-header"><span>${type}</span></div><div class="p-4"><span class="text-[8px] font-bold">INPUT · RCA R</span><div class="port" data-type="rca-r" data-io="in" data-node="in" title="Entrada RCA direita R"></div></div>`; }
            if (type === 'turntableVintage') el.querySelector('.device-header span').textContent = deviceName;
            if(ACTIVE_SPK.has(type)){
                el.classList.add('active-speaker');
                el.querySelectorAll(type==='spkActiveRounded'?'.sp-woofer':'.sp-woofer,.sp-tweeter').forEach(driver=>driver.insertAdjacentHTML('beforeend','<span class="speaker-driver-screws" aria-hidden="true"></span>'));
            }
            if(['subwooferCube','subwooferPassive','subwooferPassiveVintage','subwooferPro'].includes(type)){
                el.classList.add('detailed-subwoofer');
                el.querySelector('.sp-woofer').insertAdjacentHTML('beforeend','<span class="speaker-driver-screws" aria-hidden="true"></span>');
            }
            if(BOOKSHELF_SPEAKERS[type]||['spkPassiveWood','spkPassiveCarbon'].includes(type)){
                el.classList.add('passive-bookshelf-details');
                if(!BOOKSHELF_SPEAKERS[type])el.querySelectorAll('.sp-woofer,.sp-tweeter').forEach(driver=>driver.insertAdjacentHTML('beforeend','<span class="speaker-driver-screws" aria-hidden="true"></span>'));
            }
            if(['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type)){
                el.querySelector('.device-header span').textContent=deviceName;
                el.querySelectorAll('.classic-box-tweeter,.classic-box-midrange,.classic-box-woofer').forEach(driver=>driver.insertAdjacentHTML('beforeend','<i class="speaker-driver-screws" aria-hidden="true"></i>'));
                const trims=el.querySelectorAll('.classic-box-control-panel span');trims.forEach((trim,i)=>trim.insertAdjacentHTML('beforeend',i?'HIGH':'MID'));
                el.querySelector('.classic-box-base').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 27" aria-hidden="true"><defs><linearGradient id="${id}-stand" x2="0" y2="1"><stop stop-color="#525852"/><stop offset=".25" stop-color="#292e29"/><stop offset="1" stop-color="#0c100d"/></linearGradient></defs><path data-stand-silhouette d="M1 0h242v6H1Z" fill="url(#${id}-stand)" stroke="#111712" stroke-width=".7"/><path d="M3 1h238" stroke="#9ba392" stroke-width=".6"/><path data-stand-silhouette d="M11 6h15l9 17H19Zm222 0h-15l-9 17h16Z" fill="url(#${id}-stand)" stroke="#131914" stroke-width=".7"/><path d="m13 7 8 15m210-15-8 15" stroke="#707b69" stroke-width=".7"/><path data-stand-silhouette d="M31 17h182v4H31Z" fill="#161d16"/><path d="M32 17.5h180" stroke="#4d5847" stroke-width=".5"/><path data-stand-silhouette d="M17 23h23v4H17Zm187 0h23v4h-23Z" fill="#111511"/><path d="M18 24h21m166 0h21" stroke="#475140" stroke-width=".65"/><path d="M14 2h17m182 0h17" stroke="#0e150d" stroke-width="2"/><circle cx="23" cy="10" r="1.4" fill="#a1aa95"/><circle cx="221" cy="10" r="1.4" fill="#a1aa95"/></svg>`;
            }
            if(type==='turntableLinear')el.innerHTML=tpl.innerHTML.replaceAll('linear-art-',`${id}-art-`);
            
            if(type==='hardwareDemo')el.innerHTML=Hardware.demoMarkup();
            if(type==='streamIntegrated')el.innerHTML=streamIntegratedMarkup();
            if(SIGNAL_GENERATOR_TYPES.has(type)){el.innerHTML=generatorMarkup();if(type==='signalGeneratorVintage'){el.classList.add('device-type-signalGenerator');el.querySelector('.device-header span').textContent='GERADOR DE SINAIS VINTAGE';const display=document.createElement('canvas');display.className='signal-vintage-lcd';display.width=168;display.height=62;display.setAttribute('aria-hidden','true');el.querySelector('.signal-screen').appendChild(display);}}
            if(INTEGRATED_AMPS[type]){el.classList.add('integrated-amp');el.innerHTML=integratedMarkup(type);}
            if(CUSTOM_PREAMPS[type]){el.classList.add('integrated-amp','custom-preamp');el.innerHTML=customPreampMarkup(type);}
            if(CUSTOM_POWER_AMPS[type]){el.classList.add('custom-power-amp');el.innerHTML=customPowerMarkup(type);}
            if(BOOKSHELF_SPEAKERS[type]){el.classList.add('bookshelf-speaker','grille-off');el.style.setProperty('--shelf-height',BOOKSHELF_SPEAKERS[type].height+'px');el.style.setProperty('--shelf-width',BOOKSHELF_SPEAKERS[type].width+'px');el.innerHTML=bookshelfSpeakerMarkup(type);}
            if(FLOOR_SPEAKERS[type]){el.classList.add('floorstanding-speaker','grille-off');el.style.setProperty('--tower-height',FLOOR_SPEAKERS[type].height+'px');el.style.setProperty('--tower-cabinet',FLOOR_SPEAKERS[type].cabinet+'px');el.innerHTML=floorSpeakerMarkup(type);}
            if (EQ_TYPES.has(type)) el.innerHTML = graphicEqMarkup(type);
            if (['headphoneAmp','headphoneAmpModern'].includes(type)) {
                el.classList.add('phone-amp');
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="phone-amp-face"><div class="phone-amp-group"><div data-power-slot><button class="power-btn"></button></div></div><div class="phone-amp-group"><div class="phone-amp-pair"><div class="port" data-type="rca-r" data-io="in" data-node="inR" title="RCA IN R"></div><div class="port" data-type="rca-l" data-io="in" data-node="inL" title="RCA IN L"></div></div><span>RCA R/L IN</span></div><button class="receiver-dial amp-volume-knob phone-volume" aria-label="Volume dos fones" title="Arraste para ajustar o volume"></button><div class="phone-amp-group"><div class="port" data-type="p10" data-io="out" data-node="outPhone" title="Fone P10 estéreo"></div><span>FONE P10</span></div><div class="phone-amp-group"><div class="port" data-type="p2" data-io="out" data-node="outAux" title="Fone P2 estéreo"></div><span>FONE P2</span></div></section>`;
            }
            if (MATRIX_TYPES.has(type)) {
                const station = (io,n) => `<div class="selector-station"><button class="selector-key ${io==='in'?'input-key':''} ${n===1?'active':''}" data-matrix-${io}="${n}" aria-pressed="${n===1}" aria-label="${io==='in'?'Selecionar entrada':'Ativar saída'} ${n}"></button><div class="selector-pair">${['R','L'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${io}${n}${ch}" title="${io.toUpperCase()} ${n} · RCA ${ch}"></div>`).join('')}</div><span>${io.toUpperCase()} ${n} · RCA R/L</span></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="matrix-face">${[1,2,3].map(n=>station('in',n)).join('')}<div class="selector-divider"></div>${[1,2,3,4].map(n=>station('out',n)).join('')}</section>`;
            }
            if (MIXER_TYPES.has(type)) {
                const channels = ['CANAL 1','CANAL 2','CANAL 3'];
                const pair = (n) => `<div class="mixer-rack-pair"><div class="port" data-type="rca-r" data-io="in" data-node="in${n}R" title="Entrada ${n} · RCA direito R"></div><div class="port" data-type="rca-l" data-io="in" data-node="in${n}L" title="Entrada ${n} · RCA esquerdo L"></div></div>`;
                const strip = (name,index) => `<div class="mixer-rack-strip"><strong>${name}</strong><small>LINE IN · RCA R/L</small>${pair(index+1)}<div class="mixer-rack-fader"><input class="mixer-level-control" type="range" min="0" max="1" step="0.01" value="0.8" data-mixer-channel="${index}" aria-label="Volume ${name}"><output data-mixer-value="${index}">80%</output></div></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span><button class="power-btn" title="Ligar / desligar"></button></div><section class="mixer-rack-panel"><i class="mixer-rack-handle handle-left" aria-hidden="true"></i><i class="mixer-rack-handle handle-right" aria-hidden="true"></i><div class="mixer-rack-inputs"><header><strong>MIXER ESTÉREO</strong><span>3 ENTRADAS · RCA R/L</span></header><div class="mixer-rack-channels">${channels.map(strip).join('')}</div></div><div class="mixer-rack-output"><span>LINE OUT</span><small>RCA R/L</small><div class="mixer-rack-pair"><div class="port" data-type="rca-r" data-io="out" data-node="outR" title="Line Out · RCA direito R"></div><div class="port" data-type="rca-l" data-io="out" data-node="outL" title="Line Out · RCA esquerdo L"></div></div></div></section>`;
            }
            if (CROSSOVER_TYPES.has(type)) {
                const groups = [
                    ['ENTRADA','LINE IN','in','in'],
                    ['GRAVES','< 250 Hz','outLow','out'],
                    ['MÉDIOS','250 Hz – 2,5 kHz','outMid','out'],
                    ['AGUDOS','> 2,5 kHz','outHigh','out']
                ];
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span><button class="power-btn" title="Ligar / desligar"></button></div><section class="xover-panel">${groups.map(([label,range,node,io])=>`<div class="xover-group"><strong>${label}</strong><small>${range.replace('<','&lt;').replace('>','&gt;')}</small><div class="xover-pair">${['R','L'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" title="${label} · RCA ${ch} · ${io==='in'?'entrada':'saída'}"></div>`).join('')}</div><span>RCA R/L · ${io.toUpperCase()}</span></div>`).join('')}</section>`;
            }
            if (SELECTOR_TYPES.has(type)) {
                el.classList.add('selector-rack');
                const wire = SPEAKER_SWITCH_TYPES.has(type);
                const format = wire ? 'FIO L/R' : 'RCA R/L';
                const pair = (io,prefix) => `<div class="selector-pair">${['R','L'].map(ch=>`<div class="port" data-type="${wire?'wire':ch==='R'?'rca-r':'rca-l'}" data-io="${io}" data-node="${prefix}${ch}" ${wire&&io==='in'?'data-role="amp-speaker-in"':''} title="${io==='in'?'Entrada':'Saída'} ${prefix} · ${format} · ${ch}"></div>`).join('')}</div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="selector-face"><div class="selector-station"><i class="selector-input-led"></i><b class="selector-input-mark">INPUT</b>${pair('in',wire?'inAmp':'in')}<span>IN · ${format}</span></div><div class="selector-divider"></div>${['A','B'].map(ch=>`<div class="selector-station"><button class="selector-key ${ch==='A'?'active':''}" data-switch-source="${ch}" aria-pressed="${ch==='A'}" aria-label="Selecionar saída ${ch}" title="Selecionar saída ${ch}"></button>${pair('out','out'+ch)}<span>OUT ${ch} · ${format}</span></div>`).join('')}</section>`;
            }
            if (['powerStereo','powerVintage'].includes(type)) {
                el.classList.add('stereo-power');
                const port = (kind,io,node,label,role='') => `<div class="port" data-type="${kind}" data-io="${io}" data-node="${node}" data-role="${role}" title="${label}"></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="stereo-power-face"><div class="stereo-power-inputs"><div class="stereo-power-pair">${port('rca-r','in','inR','RCA IN R')}${port('rca-l','in','inL','RCA IN L')}</div><span>RCA R/L IN</span>${port('p10','in','inStereo','P10 TRS IN · estéreo')}<span>P10 IN</span></div><div class="stereo-power-vent"></div><label class="stereo-power-gain"><button class="receiver-dial" data-power-channel="L" aria-label="Ganho A esquerdo"></button><span>GAIN A · L</span></label><div class="stereo-power-meters">${['L','R'].map(ch=>`<div data-meter="${ch}">${Array.from({length:8},(_,i)=>`<i style="--led-color:${i<2?'#dc4030':i===2?'#efb02e':'#35ce48'}"></i>`).join('')}</div>`).join('')}</div><label class="stereo-power-gain"><button class="receiver-dial" data-power-channel="R" aria-label="Ganho B direito"></button><span>GAIN B · R</span></label><div class="stereo-power-vent"></div><div class="stereo-power-outputs"><div class="stereo-power-pair">${port('wire','out','outL','SPEAKER OUT L','amp-speaker-out')}${port('wire','out','outR','SPEAKER OUT R','amp-speaker-out')}</div><span>CAIXAS L/R</span><div class="stereo-power-pair">${port('rca-l','out','lineL','LINE OUT RCA L')}${port('rca-r','out','lineR','LINE OUT RCA R')}</div><span>LINE OUT · RCA</span></div><div class="stereo-power-energy"><div data-power-slot><button class="power-btn"></button></div></div></section>`;
            }
            if(EXTRA_AUDIO_TYPES.has(type))el.innerHTML=extraDeviceMarkup(type);
            const rackUnits = {signalGeneratorVintage:3,signalGenerator:3,headphoneAmp4:3,preamp:3,benchMeter:4,benchMeterVintage:4,rcaSwitchVintage:3,powerStereo:3,powerVintage:3,receiver:4,powerAmp:4,eqStudio:3,eqVintage:3,mixer:4.5,mixerVintage:4.5,crossover:3,crossoverVintage:3,cdPlayer:3,streamer:3,audioInterface1:3,audioInterface2:3,audioInterface3:4,audioInterface4:4.5,btReceiverA:3,btTransmitterPro:3,rcaSwitch:3,speakerSwitch:3,speakerSwitchVintage:3};
            if (MATRIX_TYPES.has(type)) rackUnits[type] = 3;
            if (rackUnits[type]) {
                el.classList.add('rack-device');
                el.style.setProperty('--rack-units', rackUnits[type]);
                if (!MATRIX_TYPES.has(type) && !SELECTOR_TYPES.has(type) && !['signalGeneratorVintage','signalGenerator','headphoneAmp4','receiver','powerAmp','eqStudio','eqVintage','powerStereo','powerVintage','preamp','benchMeter','benchMeterVintage'].includes(type)) {
                    el.classList.add('rack-standard');
                    const face = el.querySelector('.device-header').nextElementSibling;
                    face.classList.add('rack-face');
                    if (el.querySelector('.power-btn')) {
                        const slot = face.querySelector('[data-power-slot]') || document.createElement('div');
                        slot.className = 'rack-power-slot';
                        slot.setAttribute('data-power-slot', '');
                        face.appendChild(slot);
                        slot.appendChild(el.querySelector('.power-btn'));
                    }
                }
            }
            if(type==='streamer'){
                const output=document.createElement('div');output.className='streamer-aux-output';
                output.innerHTML='<div class="port" data-type="p2" data-io="out" data-node="outStereo" data-signal="line" title="Saída AUX P2 TRS estéreo · nível de linha"></div><span>LINE OUT · P2</span>';
                el.querySelector('.rack-face').appendChild(output);
                const transport=document.createElement('button');transport.type='button';transport.className='streamer-transport-button';transport.dataset.sourcePlay='';transport.setAttribute('aria-label','Reproduzir ou pausar');transport.setAttribute('aria-pressed','false');transport.title='Reproduzir / pausar';transport.innerHTML='<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><path d="M3 3v14l10-7Z" fill="currentColor"/><path d="M18 3v14m6-14v14" stroke="currentColor" stroke-width="3"/></svg>';el.querySelector('.rack-face').appendChild(transport);
            }
            if(SIGNAL_GENERATOR_TYPES.has(type))el.querySelector('[data-power-slot]').appendChild(el.querySelector('.power-btn'));
            if(type==='headphoneAmp4')el.querySelector('[data-power-slot]').appendChild(el.querySelector('.power-btn'));
            if (INTERFACE_DEVICES[type]) {
                const config = INTERFACE_DEVICES[type];
                el.classList.add(AudioAdapterDesign.models[type]?'passive-adapter':'interface-box');
                const ports = (io,format) => ['p10','p2'].includes(format) ? `<div class="port" data-type="${format}" data-io="${io}" data-node="${io}Stereo" title="${io==='in'?'Entrada':'Saída'} ${format==='p2'?'P2':'P10'} TRS estéreo"></div>` : `<div class="interface-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${io}${ch}" title="${io==='in'?'Entrada':'Saída'} ${format==='wire'?'SPEAKER · fio':'RCA'} ${ch}"></div>`).join('')}</div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="interface-face"><header>${config.name}</header><div class="interface-ports"><div><small>ENTRADA · ${config.input==='rca'?'RCA L/R':config.input==='wire'?'FIO L/R':config.input==='p2'?'P2 TRS':'P10 TRS'}</small>${ports('in',config.input)}</div><span aria-hidden="true">→</span><div><small>SAÍDA · ${config.output==='rca'?'RCA L/R':config.output==='p2'?'P2 TRS':'P10 TRS'}</small>${ports('out',config.output)}</div></div><footer>${config.passive?'PASSIVO · PRESERVA O SINAL':'CONVERSÃO DE NÍVEL'}</footer></section>`;
                if(AudioAdapterDesign.models[type])el.innerHTML=AudioAdapterDesign.markup(type,id);
            }
            if(CAPTURE_INTERFACE_TYPES.has(type)){
                const design=AudioInterfaceDesign.models[type];
                el.classList.add('audio-interface','ai-art-v3',design.skin+'-interface');
                el.innerHTML=AudioInterfaceDesign.markup(type,deviceName);
            }
            if(FURNITURE_TYPES[type]) {
                el.classList.add('furniture-node');
                el.dataset.material=furnitureMaterialFor(type);
                el.innerHTML=furnitureMarkup(type);
            }
            if(HP_TYPES.has(type)&&type!=='hpKubaDisco2'){
                const sideTemplate=document.getElementById('tpl-headphoneSide');
                el.innerHTML=sideTemplate.innerHTML;
                const artFiles={headphone:'over-ear',hpStudio:'studio',hpClassic:'classic',hpMonitor:'monitor',hpMax:'max',hpOpenRing:'open-ring',hpOpenDome:'open-dome',hpPlanar:'planar'};
                el.querySelector('.headphone-artwork').src=`./assets/headphones/${artFiles[type]}.svg`;
                el.querySelector('.device-header span').textContent=deviceName;
                if(REFERENCE_HEADPHONES[type])el.classList.add('reference-headphone');
            }
            if(type==='hpKubaDisco2'){
                // Scope SVG paint servers so multiple headphones keep independent finishes.
                el.innerHTML=tpl.innerHTML.replaceAll('kuba-art-',`${id}-art-`);
                el.classList.add('headphone-equipment','kuba-headphone');
            }
            if(HP_TYPES.has(type)&&type!=='hpKubaDisco2'){
                el.classList.add('headphone-equipment');
                if(type!=='hpMax'){
                    el.classList.add('headphone-cup-input');
                    const input=el.querySelector('.headphone-controls .port'),socket=document.createElement('div');socket.className='headphone-cable-input';
                    input.dataset.type=type==='headphone'?'p10':'p2';input.title=`Entrada de fones · ${type==='headphone'?'P10':'P2'} estéreo na ponta do cabo`;
                    socket.appendChild(input);el.querySelector('.headphone-object').appendChild(socket);
                    el.querySelector('.headphone-controls>span').textContent='BLUETOOTH';
                } else {
                    el.querySelector('.headphone-controls .port')?.remove();
                    el.querySelector('.headphone-controls>span').textContent='BLUETOOTH';
                }
                if(BT_HP_TYPES.has(type)){
                    const button=el.querySelector('.btn-bt-pair');
                    button.classList.add('headphone-bt-button');
                    button.type='button';button.setAttribute('aria-label','Parear Bluetooth');button.title='Parear Bluetooth';
                    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 10 10-5 4V3l5 4L7 17"/></svg>';
                    el.querySelector('.headphone-object').appendChild(button);
                }
                el.querySelector('.headphone-controls')?.remove();

            }
            if(HP_TYPES.has(type)){
                const stand=document.createElement('div');stand.className='headphone-stand';stand.setAttribute('aria-hidden','true');
                stand.innerHTML='<div class="headphone-stand-post"></div><div class="headphone-stand-cradle"></div><div class="headphone-stand-base"></div>';
                el.querySelector('.headphone-object').prepend(stand);
            }
            if(RADIO_RECEIVERS.has(type)){
                const old=type==='receiver'?el.querySelector('.receiver-front').nextElementSibling:el.querySelector('.poweramp-io-panel');
                const io=document.createElement('div');io.className='receiver-io-banks';io.innerHTML=receiverConnectionsMarkup(type);old.replaceWith(io);
                const host=type==='receiver'?el.querySelector('.receiver-front'):el.querySelector('.poweramp-body');
                host.insertAdjacentHTML('beforeend',receiverSourceButtons());
                if(type==='receiver'){const volume=el.querySelector('[data-receiver-control="volume"]'),control=document.createElement('div');control.className='receiver-control receiver-volume-control';volume.replaceWith(control);control.appendChild(volume);const label=document.createElement('span');label.textContent='VOLUME';control.appendChild(label);const slot=el.querySelector('.receiver-power-slot'),holder=slot.parentElement;el.querySelector('.receiver-front').parentElement.appendChild(slot);if(!holder.children.length)holder.remove();}
                const tuning=document.createElement('div');tuning.className='receiver-tuning-control';
                tuning.innerHTML='<button type="button" class="receiver-tuning-knob" data-radio-knob role="slider" aria-label="Sintonia FM" aria-valuemin="87.5" aria-valuemax="108" aria-valuenow="88" title="Sintonia FM · arraste ou use as setas"><i></i></button><span>TUNING</span>';
                el.querySelector(type==='receiver'?'.receiver-instruments':'.poweramp-control-panel').appendChild(tuning);
                if(type==='powerAmp'){const label=document.createElement('span');label.className='modern-receiver-volume-label';label.textContent='VOLUME';host.appendChild(label);}
                if(type==='powerAmp'){const screen=el.querySelector('.poweramp-screen'),meters=el.querySelector('.poweramp-meter');meters.querySelectorAll('.poweramp-meter-channel>div').forEach((track,index)=>track.innerHTML=`<span data-receiver-level="${index}"></span>`);screen.prepend(meters);}
                if(type==='powerAmp')el.querySelector('.poweramp-screen').insertAdjacentHTML('beforeend','<svg class="receiver-fm-animation" viewBox="0 0 180 24" aria-label="Recepção FM"><path class="fm-axis" d="M0 22H180"/><path data-fm-spectrum fill="none"/><line x1="90" y1="1" x2="90" y2="23" class="fm-center"/><rect x="1" y="22" width="178" height="2" class="fm-strength-track"/><rect data-fm-strength x="1" y="22" width="0" height="2"/></svg>');
            }
            if(type==='preamp'||CUSTOM_PREAMPS[type]){
                const slot=el.querySelector('[data-power-slot]');slot.classList.add('preamp-output-power');
                if(CUSTOM_PREAMPS[type]&&!['prePrecision','preGlass'].includes(type))el.querySelector('.integrated-connections').appendChild(slot);
            }
            if(['btReceiverA','btTransmitterPro'].includes(type)){
                const ports=el.querySelector('.bt-ports');
                el.querySelector('.bt-out')?.remove();el.querySelector('.bt-divider')?.remove();
                if(type==='btTransmitterPro'){
                    ports.appendChild(el.querySelector('.btn-bt-pair'));
                    const badge=document.createElement('span');badge.className='bt-badge';badge.textContent='TX';el.querySelector('.bt-display').appendChild(badge);
                }
                else {const play=document.createElement('button');play.type='button';play.dataset.sourcePlay='';play.setAttribute('aria-pressed','false');Hardware.sourceTransport(play,'illuminatedBar');ports.appendChild(play);}
            }
            if(['cdPlayer','streamer'].includes(type))Hardware.sourceTransport(el.querySelector('[data-source-play]'),'selectorKey');
            if(['headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(type)){
                const detail=document.createElement('div');detail.className='phone-housing-detail';detail.setAttribute('aria-hidden','true');
                detail.innerHTML='<span class="phone-housing-cheek is-left"></span><span class="phone-housing-cheek is-right"></span><span class="phone-housing-frame"></span><span class="phone-housing-vent"></span><span class="phone-housing-screws"><i></i><i></i><i></i><i></i></span>';
                el.querySelector('.phone-amp-face,.amp4-rack-face').prepend(detail);
            }
            const assemblySurface=el.querySelector([
                '.audio-interface-face','.integrated-face','.receiver-front','.poweramp-body',
                '.eq-studio-face','.eq-vintage-face','.mixer-rack-panel','.xover-panel',
                '.selector-face','.signal-face','.bench-face','.streamer-face','.cd-face',
                '.interface-face','.custom-pre-face','.custom-power-face'
            ].join(','));
            if(assemblySurface&&!assemblySurface.querySelector('.assembly-details')){
                assemblySurface.classList.add('assembly-detail-surface');
                const assembly=document.createElement('span');
                assembly.className=`assembly-details assembly-details--${el.classList.contains('device-family-vintage')?'warm':el.classList.contains('device-family-studio')?'steel':'dark'}`;
                assembly.setAttribute('aria-hidden','true');
                assembly.innerHTML='<i class="assembly-fastener assembly-fastener--tl"></i><i class="assembly-fastener assembly-fastener--tr"></i><i class="assembly-fastener assembly-fastener--bl"></i><i class="assembly-fastener assembly-fastener--br"></i>';
                assemblySurface.appendChild(assembly);
            }
            standardizeStereoPorts(el);
            el.querySelectorAll('.port[data-type="wire"]').forEach(port=>{
                port.innerHTML='<svg class="spring-terminal-art" viewBox="0 0 32 22" aria-hidden="true"><rect x=".5" y=".5" width="31" height="21" rx="1.8" fill="#2e3938" stroke="#66716b" stroke-width=".8"/><rect x="5.5" y="2" width="21" height="18" rx="1" fill="#16201e" stroke="#46534d" stroke-width=".6"/><circle cx="2.9" cy="11" r="1.05" fill="#aeb9ad"/><circle cx="29.1" cy="11" r="1.05" fill="#aeb9ad"/><rect x="7" y="3" width="7.5" height="7.3" rx=".6" fill="#c93237" stroke="#ed6c66" stroke-width=".4"/><path d="M7.8 5.2h6M7.8 7.1h6M7.8 9h6" stroke="#8a1e25" stroke-width=".5"/><rect x="17.5" y="3" width="7.5" height="7.3" rx=".6" fill="#171c1b" stroke="#515e55" stroke-width=".4"/><path d="M18.3 5.2h6M18.3 7.1h6M18.3 9h6" stroke="#050909" stroke-width=".6"/><path d="M7 12h7.5v6H7zM17.5 12H25v6h-7.5z" fill="#26352e" stroke="#415146" stroke-width=".5"/><ellipse class="spring-terminal-hole" cx="10.8" cy="15" rx="2" ry="1.6" fill="#0b1010"/><ellipse class="spring-terminal-hole" cx="21.3" cy="15" rx="2" ry="1.6" fill="#0b1010"/><path d="M9.5 16.6h2.6M20 16.6h2.6" stroke="#9da68c" stroke-width=".5"/></svg>';
            });
            el.querySelectorAll('.port').forEach((p, i) => {
                p.id = `port_${id}_${i}`;
                p.tabIndex=0;
                if (!p.dataset.channel && /R$/.test(p.dataset.node || '')) p.dataset.channel = 'R';
                if (!p.dataset.channel && /L$/.test(p.dataset.node || '')) p.dataset.channel = 'L';
            });
            Hardware.layout({type,el});
            world.appendChild(el);

            const dev = { id, type, el, nodes: {}, state: { volume: 0.8, bass: 0, treble: 0, eq: [0, 0, 0, 0, 0] }, powered: true };
            const placement = appState.project.restoringProject?{
                x:Math.max(sceneSideInset(),Math.min(world.offsetWidth-el.offsetWidth-sceneSideInset(),x)),
                y:Math.max(0,Math.min(maxEquipmentBottom()-el.offsetHeight,y))
            }:findFreePlacement(dev,x,y);
            if (!placement) { el.remove(); return; }
            el.style.left = `${placement.x}px`;
            el.style.top = `${placement.y}px`;
            
            // Cria nó master interno de energia para o aparelho
            dev.powerGain = appState.audio.context.createGain();
            dev.powerGain.gain.value = 1.0;

            if (FURNITURE_TYPES[type]) {
                dev.state.material=furnitureMaterialFor(type);
                updateBenchAppearance(dev);
                if(FURNITURE_TYPES[type].back){dev.state.hasBack=true;el.dataset.back='true';}
            } else if (INTERFACE_DEVICES[type]) {
                const config = INTERFACE_DEVICES[type];
                if(AudioAdapterDesign.models[type])dev.state.adapterRotation=0;
                dev.nodes.inL = appState.audio.context.createGain(); dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.outL = appState.audio.context.createGain(); dev.nodes.outR = appState.audio.context.createGain();
                ['L','R'].forEach(ch=>{
                    if (type === 'phonoConverter') {
                        // Inverse RIAA playback response, normalized at 1 kHz; gain converts the simulator's phono level to line.
                        const low = appState.audio.context.createBiquadFilter(), high = appState.audio.context.createBiquadFilter();
                        low.type='lowshelf'; low.frequency.value=120; low.gain.value=9;
                        high.type='highshelf'; high.frequency.value=2122; high.gain.value=-9;
                        const gain = appState.audio.context.createGain(); gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        dev.nodes['in'+ch].connect(low); low.connect(high); high.connect(gain); connectPhonoPlayback(dev,gain,dev.nodes['out'+ch]);
                    } else {
                        const gain=appState.audio.context.createGain(); gain.gain.value=type==='speakerConverter'?ELECTRICAL_MODEL.speakerVoltsPerUnit*ELECTRICAL_MODEL.converterRatio/ELECTRICAL_MODEL.lineVoltsPerUnit:1;
                        dev.nodes['in'+ch].connect(gain);gain.connect(dev.nodes['out'+ch]);
                    }
                });
                if (['p10','p2'].includes(config.input)) {const split=dev.nodes.inStereo=appState.audio.context.createChannelSplitter(2);split.connect(dev.nodes.inL,0);split.connect(dev.nodes.inR,1);}
                if (['p10','p2'].includes(config.output)) {const merge=dev.nodes.outStereo=appState.audio.context.createChannelMerger(2);dev.nodes.outL.connect(merge,0,0);dev.nodes.outR.connect(merge,0,1);}
            } else if(type==='preamp'||BENCH_METER_TYPES.has(type)){
                setupExtraRouting(dev);
            } else if(type==='streamIntegrated'){
                configureStreamIntegrated(dev);
            } else if (SOURCE_TYPES.has(type)) {
                dev.state.playing = false;
                dev.nodes.genR = appState.audio.context.createGain();
                dev.nodes.genL = appState.audio.context.createGain();
                dev.nodes.genR.gain.value = dev.nodes.genL.gain.value = 0;
                dev.nodes.outR = appState.audio.context.createGain();
                dev.nodes.outL = appState.audio.context.createGain();
                const powerR = appState.audio.context.createGain();
                const powerL = appState.audio.context.createGain();
                dev.powerNodes = [powerR, powerL];
                dev.nodes.genR.connect(powerR);
                dev.nodes.genL.connect(powerL);
                if (TURNTABLE_TYPES.has(type)) {
                    // PHONO: nível baixo e curva RIAA invertida (sem equalização no resto do sistema). LINE: pré interno, sinal plano.
                    const stages = [[powerR, dev.nodes.outR], [powerL, dev.nodes.outL]].map(([src, dst]) => {
                        const low = appState.audio.context.createBiquadFilter();
                        const high = appState.audio.context.createBiquadFilter();
                        const level = appState.audio.context.createGain();
                        low.type = 'lowshelf'; low.frequency.value = 120;
                        high.type = 'highshelf'; high.frequency.value = 2122;
                        src.connect(low); low.connect(high); high.connect(level); level.connect(dst);
                        return { low, high, level };
                    });
                    dev.setOutputMode = mode => {
                        const phono = mode === 'phono';
                        const t = appState.audio.context.currentTime;
                        stages.forEach(({ low, high, level }) => {
                            low.gain.setTargetAtTime(phono ? -9 : 0, t, .015);
                            high.gain.setTargetAtTime(phono ? 9 : 0, t, .015);
                            level.gain.setTargetAtTime(phono ? 1/ELECTRICAL_MODEL.phonoGain : 1, t, .015);
                        });
                    };
                    dev.setOutputMode('line');
                } else {
                    powerR.connect(dev.nodes.outR);
                    powerL.connect(dev.nodes.outL);
                }
            } else if (BT_TX_TYPES.has(type)) {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                dev.nodes.btOut = appState.audio.context.createChannelMerger(2);
                const inputPowerR = appState.audio.context.createGain();
                const inputPowerL = appState.audio.context.createGain();
                dev.powerNodes = [inputPowerR, inputPowerL];
                dev.nodes.inR.connect(inputPowerR);
                dev.nodes.inL.connect(inputPowerL);
                inputPowerR.connect(dev.nodes.btOut, 0, 1);
                inputPowerL.connect(dev.nodes.btOut, 0, 0);
            } else if(CUSTOM_POWER_AMPS[type]){
                configureCustomPower(dev);
            } else if(controlAmpConfig(type)){
                configureIntegratedAmp(dev);
                if(CUSTOM_PREAMPS[type])configureCustomPreamp(dev);
                if(type==='integratedUtility')configureUtilityAmp(dev);
                if(type==='prePrecision')configurePrecisionPreamp(dev);
                if(type==='preGlass')configureGlassPreamp(dev);
            } else if (type === 'receiver') {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                dev.nodes.bassR = appState.audio.context.createBiquadFilter(); dev.nodes.bassR.type = 'lowshelf'; dev.nodes.bassR.frequency.value = 100;
                dev.nodes.bassL = appState.audio.context.createBiquadFilter(); dev.nodes.bassL.type = 'lowshelf'; dev.nodes.bassL.frequency.value = 100;
                dev.nodes.trebleR = appState.audio.context.createBiquadFilter(); dev.nodes.trebleR.type = 'highshelf'; dev.nodes.trebleR.frequency.value = 3000;
                dev.nodes.trebleL = appState.audio.context.createBiquadFilter(); dev.nodes.trebleL.type = 'highshelf'; dev.nodes.trebleL.frequency.value = 3000;
                dev.nodes.bass = dev.nodes.bassR;
                dev.nodes.treble = dev.nodes.trebleR;
                dev.nodes.volR = appState.audio.context.createGain(); dev.nodes.volR.gain.value = 0.8;
                dev.nodes.volL = appState.audio.context.createGain(); dev.nodes.volL.gain.value = 0.8;
                dev.nodes.vol = dev.nodes.volR;
                dev.nodes.outR = appState.audio.context.createGain();
                dev.nodes.outL = appState.audio.context.createGain();
                dev.nodes.spkOutR = dev.nodes.outR;
                dev.nodes.spkOutL = dev.nodes.outL;
                dev.powerNodes = [dev.nodes.outR, dev.nodes.outL];
                dev.nodes.outSub = appState.audio.context.createGain();
                dev.nodes.outPhone = appState.audio.context.createChannelMerger(2);
                dev.nodes.subFilter = appState.audio.context.createBiquadFilter();
                dev.nodes.subFilter.type = 'lowpass';
                dev.nodes.subFilter.frequency.value = 120;
                dev.receiverRadioTargets={R:dev.nodes.bassR,L:dev.nodes.bassL};
                dev.nodes.inR.connect(dev.nodes.bassR);
                dev.nodes.bassR.connect(dev.nodes.trebleR);
                dev.nodes.trebleR.connect(dev.nodes.volR);
                dev.nodes.volR.connect(dev.nodes.outR);
                dev.nodes.inL.connect(dev.nodes.bassL);
                dev.nodes.bassL.connect(dev.nodes.trebleL);
                dev.nodes.trebleL.connect(dev.nodes.volL);
                dev.nodes.volL.connect(dev.nodes.outL);
                // O subwoofer soma os canais; os fones preservam L no canal 0 e R no canal 1.
                dev.nodes.outR.connect(dev.nodes.subFilter);
                dev.nodes.outL.connect(dev.nodes.subFilter);
                dev.nodes.subFilter.connect(dev.nodes.outSub);
                dev.nodes.outR.connect(dev.nodes.outPhone, 0, 1);
                dev.nodes.outL.connect(dev.nodes.outPhone, 0, 0);
            } else if (['headphoneAmp','headphoneAmpModern'].includes(type)) {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                const summer = appState.audio.context.createChannelMerger(2);
                dev.nodes.inR.connect(summer,0,1);
                dev.nodes.inL.connect(summer,0,0);
                
                dev.nodes.vol = appState.audio.context.createGain(); dev.nodes.vol.gain.value = 0.8;
                dev.nodes.outPhone = appState.audio.context.createGain();
                summer.connect(dev.nodes.vol);
                dev.nodes.vol.connect(dev.powerGain);
                dev.powerGain.connect(dev.nodes.outPhone);
                dev.nodes.outAux = dev.nodes.outPhone;
                dev.setPhoneVolume = value => {
                    dev.state.volume = Math.max(0,Math.min(1,Number(value)));
                    dev.nodes.vol.gain.setTargetAtTime(dev.state.volume,appState.audio.context.currentTime,.015);
                    updateKnobAngle(dev,'.phone-volume',dev.state.volume,0,1);
                    el.querySelector('.phone-volume').setAttribute('aria-valuenow',Math.round(dev.state.volume*100));
                    if(appState.interface.selectedDeviceId===id){const slider=document.getElementById('sl-amp-vol');if(slider)slider.value=dev.state.volume;const label=document.getElementById('lbl-amp-vol');if(label)label.textContent=Math.round(dev.state.volume*100)+'%';}
                };
                const knob=el.querySelector('.phone-volume');knob.setAttribute('role','slider');knob.setAttribute('aria-valuemin','0');knob.setAttribute('aria-valuemax','100');
                Hardware.bindKnob(knob,{get:()=>dev.state.volume,set:dev.setPhoneVolume});
                dev.setPhoneVolume(.8);
            } else if (type === 'headphoneAmp4') {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                const summer = appState.audio.context.createChannelMerger(2);
                dev.nodes.inR.connect(summer, 0, 1);
                dev.nodes.inL.connect(summer, 0, 0);
                dev.channelVolumes = [1, 2, 3, 4].map(() => appState.audio.context.createGain());
                dev.powerNodes = [1, 2, 3, 4].map(() => appState.audio.context.createGain());
                dev.channelVolumes.forEach((volume, index) => {
                    volume.gain.value = 0.8;
                    dev.nodes[`outPhone${index + 1}`] = appState.audio.context.createGain();
                    volume.connect(dev.powerNodes[index]);
                    dev.powerNodes[index].connect(dev.nodes[`outPhone${index + 1}`]);
                    summer.connect(volume);
                });
            } else if (MATRIX_TYPES.has(type)) {
                dev.state.matrixInput = 1; dev.state.matrixOutputs = [true,false,false,false];
                const inputGates = {}, outputGates = {};
                ['R','L'].forEach(ch=>{
                    const bus=appState.audio.context.createGain();
                    [1,2,3].forEach(n=>{const input=dev.nodes[`in${n}${ch}`]=appState.audio.context.createGain();const gate=inputGates[`${n}${ch}`]=appState.audio.context.createGain();gate.gain.value=n===1?1:0;input.connect(gate);gate.connect(bus);});
                    [1,2,3,4].forEach(n=>{const gate=outputGates[`${n}${ch}`]=appState.audio.context.createGain();gate.gain.value=n===1?1:0;dev.nodes[`out${n}${ch}`]=gate;bus.connect(gate);});
                });
                dev.updateMatrix = () => {
                    [1,2,3].forEach(n=>{const active=n===dev.state.matrixInput;['R','L'].forEach(ch=>inputGates[`${n}${ch}`].gain.setTargetAtTime(active?1:0,appState.audio.context.currentTime,.015));const button=el.querySelector(`[data-matrix-in="${n}"]`);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
                    [1,2,3,4].forEach(n=>{const active=dev.state.matrixOutputs[n-1];['R','L'].forEach(ch=>outputGates[`${n}${ch}`].gain.setTargetAtTime(active?1:0,appState.audio.context.currentTime,.015));const button=el.querySelector(`[data-matrix-out="${n}"]`);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
                    revalidateSignalConnections();updateCableFlows();
                };
                el.querySelectorAll('[data-matrix-in],[data-matrix-out]').forEach(button=>{button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',e=>{e.stopPropagation();if(button.dataset.matrixIn)dev.state.matrixInput=Number(button.dataset.matrixIn);else {const i=Number(button.dataset.matrixOut)-1;dev.state.matrixOutputs[i]=!dev.state.matrixOutputs[i];}dev.updateMatrix();});});
            } else if (RCA_SWITCH_TYPES.has(type)) {
                dev.selectedSource = 'A';
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                dev.nodes.routeAR = appState.audio.context.createGain();
                dev.nodes.routeAL = appState.audio.context.createGain();
                dev.nodes.routeBR = appState.audio.context.createGain();
                dev.nodes.routeBL = appState.audio.context.createGain();
                dev.nodes.outAR = appState.audio.context.createGain();
                dev.nodes.outAL = appState.audio.context.createGain();
                dev.nodes.outBR = appState.audio.context.createGain();
                dev.nodes.outBL = appState.audio.context.createGain();
                dev.nodes.inR.connect(dev.nodes.routeAR); dev.nodes.routeAR.connect(dev.nodes.outAR);
                dev.nodes.inR.connect(dev.nodes.routeBR); dev.nodes.routeBR.connect(dev.nodes.outBR);
                dev.nodes.inL.connect(dev.nodes.routeAL); dev.nodes.routeAL.connect(dev.nodes.outAL);
                dev.nodes.inL.connect(dev.nodes.routeBL); dev.nodes.routeBL.connect(dev.nodes.outBL);
                dev.nodes.routeAR.gain.value = 1;
                dev.nodes.routeAL.gain.value = 1;
                dev.nodes.routeBR.gain.value = 0;
                dev.nodes.routeBL.gain.value = 0;
            } else if (MIXER_TYPES.has(type)) {
                dev.state.channelVolumes = [0.8, 0.8, 0.8];
                dev.channelGains = [0, 1, 2].map(() => ({ R:appState.audio.context.createGain(), L:appState.audio.context.createGain() }));
                dev.nodes.outR = appState.audio.context.createGain(); dev.nodes.outL = appState.audio.context.createGain();
                const masterR = appState.audio.context.createGain(), masterL = appState.audio.context.createGain();
                    dev.powerNodes = [masterR, masterL];
                dev.channelGains.forEach((gains, index) => {
                    dev.nodes[`in${index + 1}R`] = appState.audio.context.createGain(); dev.nodes[`in${index + 1}L`] = appState.audio.context.createGain();
                    gains.R.gain.value = dev.state.channelVolumes[index]; gains.L.gain.value = dev.state.channelVolumes[index];
                    dev.nodes[`in${index + 1}R`].connect(gains.R); gains.R.connect(masterR);
                    dev.nodes[`in${index + 1}L`].connect(gains.L); gains.L.connect(masterL);
                });
                masterR.connect(dev.nodes.outR); masterL.connect(dev.nodes.outL);
            } else if (SPEAKER_SWITCH_TYPES.has(type)) {
                dev.selectedSource = 'A';
                ['R', 'L'].forEach(channel => { dev.nodes[`in${channel}`] = appState.audio.context.createGain(); dev.nodes[`inAmp${channel}`] = appState.audio.context.createGain(); dev.nodes[`in${channel}`].connect(dev.nodes[`inAmp${channel}`]); });
                ['A', 'B'].forEach(source => ['R', 'L'].forEach(channel => {
                    const route = dev.nodes[`route${source}${channel}`] = appState.audio.context.createGain();
                    const out = dev.nodes[`out${source}${channel}`] = appState.audio.context.createGain();
                    dev.nodes[`inAmp${channel}`].connect(route); route.connect(out);
                    route.gain.value = source === 'A' ? 1 : 0;
                }));
            } else if (PASSIVE_SUB_TYPES.has(type)) {
                dev.nodes.inR = appState.audio.context.createGain(); dev.nodes.inL = appState.audio.context.createGain();
                dev.filter = appState.audio.context.createBiquadFilter(); dev.filter.type = 'lowpass'; dev.filter.frequency.value = 120;
                dev.analyzer = appState.audio.context.createAnalyser();
                dev.nodes.inR.connect(dev.filter); dev.nodes.inL.connect(dev.filter);
                dev.filter.connect(dev.analyzer); dev.analyzer.connect(appState.audio.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (CROSSOVER_TYPES.has(type)) {
                dev.nodes.inR = appState.audio.context.createGain(); dev.nodes.inL = appState.audio.context.createGain();
                dev.powerNodes = [];
                [['Low','lowpass',250,0],['Mid','bandpass',Math.sqrt(250*2500),1],['High','highpass',2500,2]].forEach(([band, filterType, frequency, q]) => {
                    ['R', 'L'].forEach(channel => {
                        const filter = appState.audio.context.createBiquadFilter(); filter.type = filterType; filter.frequency.value = frequency;
                        if (filterType === 'bandpass') filter.Q.value = 0.65;
                        const gate = appState.audio.context.createGain(); gate.gain.value = 1; dev.powerNodes.push(gate);
                        const output = dev.nodes[`out${band}${channel}`] = appState.audio.context.createGain();
                        dev.nodes[`in${channel}`].connect(filter); filter.connect(gate); gate.connect(output);
                    });
                });
            } else if (EQ_TYPES.has(type)) {
                dev.state.eq = GRAPHIC_EQ_FREQUENCIES.map(() => 0);
                dev.state.eqLevel = 1;
                const levelDial = document.createElement('button');
                levelDial.className = 'graphic-eq-level receiver-dial';
                levelDial.setAttribute('role', 'slider');
                levelDial.setAttribute('aria-label', 'Nível de saída');
                levelDial.setAttribute('aria-valuemin', '0');
                levelDial.setAttribute('aria-valuemax', '100');
                dev.el.querySelector('.graphic-eq-level').replaceWith(levelDial);
                const freqs = EQ_BANDS[type] || EQ_BANDS.eqStudio;
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                dev.nodes.outR = appState.audio.context.createGain();
                dev.nodes.outL = appState.audio.context.createGain();
                dev.eqFiltersR = createEqFilters(freqs);
                dev.eqFiltersL = createEqFilters(freqs);
                const powerR = appState.audio.context.createGain();
                const powerL = appState.audio.context.createGain();
                dev.powerNodes = [powerR, powerL];
                wireFilterChain(dev.nodes.inR, dev.eqFiltersR, powerR);
                wireFilterChain(dev.nodes.inL, dev.eqFiltersL, powerL);
                powerR.connect(dev.nodes.outR);
                powerL.connect(dev.nodes.outL);
                dev.nodes.inStereo = appState.audio.context.createChannelSplitter(2);
                dev.nodes.inStereo.connect(dev.nodes.inL, 0);
                dev.nodes.inStereo.connect(dev.nodes.inR, 1);
                dev.nodes.outStereo = appState.audio.context.createChannelMerger(2);
                dev.nodes.outL.connect(dev.nodes.outStereo, 0, 0);
                dev.nodes.outR.connect(dev.nodes.outStereo, 0, 1);
                const eqOutputGains=[dev.nodes.outR,dev.nodes.outL];
                dev.setEqLevel = value => {
                    dev.state.eqLevel = Number(value);
                    eqOutputGains.forEach(node => node.gain.setTargetAtTime(dev.state.eqLevel, appState.audio.context.currentTime, .015));
                    dev.el.querySelector('.graphic-eq-level').value = value;
                    updateKnobAngle(dev, '.graphic-eq-level', Number(value), 0, 1);
                    levelDial.setAttribute('aria-valuenow', Math.round(value * 100));
                    dev.el.querySelector('.graphic-eq-level').title = `Nível de saída · ${Math.round(value * 100)}%`;
                    if (appState.interface.selectedDeviceId === dev.id) { const slider = document.getElementById('sl-eq-level'); if (slider) slider.value = value; }
                };
                const level = dev.el.querySelector('.graphic-eq-level');
                Hardware.bindKnob(level,{get:()=>dev.state.eqLevel,set:dev.setEqLevel});
                dev.setEqLevel(1);
            } else if (['powerStereo','powerVintage'].includes(type)) {
                dev.state.channelGain = {L:DEFAULT_POWER_GAIN,R:DEFAULT_POWER_GAIN};
                dev.powerNodes = [];
                const gains = {};
                ['L','R'].forEach(ch => {
                    dev.nodes['in'+ch] = appState.audio.context.createGain();
                    gains[ch] = appState.audio.context.createGain();
                    const gate = appState.audio.context.createGain(); dev.powerNodes.push(gate);
                    dev.nodes['out'+ch] = appState.audio.context.createGain();
                    dev.nodes['line'+ch] = appState.audio.context.createGain();
                    dev.nodes['in'+ch].connect(gains[ch]); gains[ch].connect(gate);
                    gate.connect(dev.nodes['line'+ch]);
                    const stage = appState.audio.context.createGain(); stage.gain.value = 1.35;
                    gate.connect(stage); stage.connect(dev.nodes['out'+ch]);
                });
                dev.nodes.inStereo = appState.audio.context.createChannelSplitter(2);
                dev.nodes.inStereo.connect(dev.nodes.inL,0); dev.nodes.inStereo.connect(dev.nodes.inR,1);
                dev.setChannelGain = (ch,value) => {
                    value = Math.max(0,Math.min(1,Number(value))); dev.state.channelGain[ch] = value;
                    gains[ch].gain.setTargetAtTime(value,appState.audio.context.currentTime,.015);
                    const knob = el.querySelector(`[data-power-channel="${ch}"]`);
                    updateKnobAngle(dev,`[data-power-channel="${ch}"]`,value,0,1);
                    knob.setAttribute('aria-valuenow',Math.round(value*100)); knob.title = `Ganho ${ch} · ${Math.round(value*100)}%`;
                    if (appState.interface.selectedDeviceId===id) { const slider=document.getElementById('power-gain-'+ch); if(slider){slider.value=value;syncInspectorGainVisual(slider);} }
                    updateStereoPowerMeters(dev);
                };
                el.querySelectorAll('[data-power-channel]').forEach(knob => {
                    const ch=knob.dataset.powerChannel;
                    knob.setAttribute('role','slider'); knob.setAttribute('aria-valuemin','0'); knob.setAttribute('aria-valuemax','100');
                    Hardware.bindKnob(knob,{get:()=>dev.state.channelGain[ch],set:value=>dev.setChannelGain(ch,value)});
                    dev.setChannelGain(ch,DEFAULT_POWER_GAIN);
                });
            } else if (type === 'powerAmp') {
                dev.nodes.inR = appState.audio.context.createGain();
                dev.nodes.inL = appState.audio.context.createGain();
                dev.nodes.outR = appState.audio.context.createGain();
                dev.nodes.outL = appState.audio.context.createGain();
                const channelPowerR = appState.audio.context.createGain();
                const channelPowerL = appState.audio.context.createGain();
                const stageGainR = appState.audio.context.createGain();
                const stageGainL = appState.audio.context.createGain();
                stageGainR.gain.value = type === 'powerAmp' ? 1.35 : 1;
                stageGainL.gain.value = type === 'powerAmp' ? 1.35 : 1;
                dev.receiverRadioTargets={R:stageGainR,L:stageGainL};
                dev.nodes.inR.connect(stageGainR);
                dev.nodes.inL.connect(stageGainL);
                if (type === 'powerAmp') {
                    dev.state.volume = 1;
                    dev.setAmplifierVolume = value => {
                        dev.state.volume = Math.max(0, Math.min(1, value));
                        stageGainR.gain.setTargetAtTime(1.35 * dev.state.volume, appState.audio.context.currentTime, .015);
                        stageGainL.gain.setTargetAtTime(1.35 * dev.state.volume, appState.audio.context.currentTime, .015);
                        updateKnobAngle(dev, '.poweramp-level', dev.state.volume, 0, 1);
                        dev.el.querySelector('[data-amp-level]').textContent = Math.round(dev.state.volume * 100) + '%';
                        dev.el.querySelector('.poweramp-level').setAttribute('aria-valuenow', Math.round(dev.state.volume * 100));
                        if (appState.interface.selectedDeviceId === dev.id) {
                            const slider = document.getElementById('sl-poweramp-volume');
                            if (slider) slider.value = dev.state.volume;
                        }
                    };
                    const dial = dev.el.querySelector('.poweramp-level');
                    dial.setAttribute('role', 'slider');
                    dial.setAttribute('aria-valuemin', '0');
                    dial.setAttribute('aria-valuemax', '100');
                    Hardware.bindKnob(dial,{get:()=>dev.state.volume,set:dev.setAmplifierVolume});
                    dev.setAmplifierVolume(1);
                    stageGainR.connect(channelPowerR); channelPowerR.connect(dev.nodes.speakerR = appState.audio.context.createGain());
                    stageGainL.connect(channelPowerL); channelPowerL.connect(dev.nodes.speakerL = appState.audio.context.createGain());
                    dev.nodes.speakerR.connect(dev.nodes.outR); dev.nodes.speakerL.connect(dev.nodes.outL);
                } else {
                    stageGainR.connect(channelPowerR); channelPowerR.connect(dev.nodes.outR);
                    stageGainL.connect(channelPowerL); channelPowerL.connect(dev.nodes.outL);
                }
                dev.powerNodes = [channelPowerR, channelPowerL];
            } else if (PASSIVE_SPK.has(type)) {
                wireSpeakerIn(dev, false);
            } else if (ACTIVE_SPK.has(type)) {
                wireSpeakerIn(dev, true);
            } else if (SUB_TYPES.has(type)) {
                dev.nodes.in = appState.audio.context.createGain();
                dev.filter = appState.audio.context.createBiquadFilter();
                dev.filter.type = 'lowpass';
                dev.filter.frequency.value = type === 'subwooferPro' ? 100 : 120;
                dev.analyzer = appState.audio.context.createAnalyser();
                dev.volumeNode = appState.audio.context.createGain();
                dev.nodes.in.connect(dev.volumeNode);
                dev.volumeNode.connect(dev.powerGain);
                dev.powerGain.connect(dev.filter);
                dev.filter.connect(dev.analyzer);
                dev.analyzer.connect(appState.audio.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (PASSIVE_SUB_TYPES.has(type)) {
                dev.nodes.inR = appState.audio.context.createGain(); dev.nodes.inL = appState.audio.context.createGain();
                dev.filter = appState.audio.context.createBiquadFilter(); dev.filter.type = 'lowpass'; dev.filter.frequency.value = 120;
                dev.analyzer = appState.audio.context.createAnalyser();
                dev.nodes.inR.connect(dev.filter); dev.nodes.inL.connect(dev.filter);
                dev.filter.connect(dev.analyzer); dev.analyzer.connect(appState.audio.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (HP_TYPES.has(type)) {
                wireSpeakerIn(dev, false);
            }
            if(CAPTURE_INTERFACE_TYPES.has(type)){
                dev.state.micGainL=Number.isFinite(dev.state.micGainL)?dev.state.micGainL:.8;
                dev.state.micGainR=Number.isFinite(dev.state.micGainR)?dev.state.micGainR:.8;
                dev.state.aiLineLevel=Number.isFinite(dev.state.aiLineLevel)?dev.state.aiLineLevel:.8;
                const phoneCount=type==='audioInterface4'?2:1;
                if(!Array.isArray(dev.state.aiPhoneLevels))dev.state.aiPhoneLevels=Array(phoneCount).fill(.75);
                dev.state.aiPhoneLevels=Array.from({length:phoneCount},(_,i)=>Number.isFinite(dev.state.aiPhoneLevels[i])?dev.state.aiPhoneLevels[i]:.75);
                const phoneStages=Array.from({length:phoneCount},(_,index)=>{
                    const left=appState.audio.context.createGain(),right=appState.audio.context.createGain();
                    const output=dev.nodes[index===0?'outPhone':'outPhone'+(index+1)]=appState.audio.context.createChannelMerger(2);
                    dev.powerNodes[1].connect(left);left.connect(output,0,0);dev.powerNodes[0].connect(right);right.connect(output,0,1);
                    return [left,right];
                });
                if(type==='audioInterface4')dev.nodes.outPhone1=dev.nodes.outPhone;
                const interfaceLevelGain=control=>control<=.8?control/.8:10**(((control-.8)/.2)*12/20);
                dev.setMicGain=(channel,value)=>{
                    const control=Math.max(0,Math.min(1,Number(value)||0));dev.state['micGain'+channel]=control;
                    // Preserve the old 0–80% range (0–unity gain), then provide up to
                    // +12 dB of gain for quiet external sources.
                    const linearGain=interfaceLevelGain(control);
                    dev.nodes['gen'+channel].gain.setTargetAtTime(dev.state.playing?linearGain:0,appState.audio.context.currentTime,.02);
                    const slider=document.getElementById(`ai-gain-${channel}`);if(slider&&appState.interface.selectedDeviceId===dev.id){slider.value=control;syncInspectorGainVisual(slider);}
                    const knob=el.querySelector(`[data-ai-gain="${channel}"]`);knob?.style.setProperty('--ai-turn',`${-135+control*270}deg`);knob?.style.setProperty('--knob-angle',`${-135+control*270}deg`);
                    const halo=knob?.querySelector('.ai-control-halo path');if(halo)halo.style.strokeDasharray=`${control*138} 138`;
                };
                dev.setAiLine=value=>{
                    const level=Math.max(0,Math.min(1,Number(value)||0));dev.state.aiLineLevel=level;
                    const linearGain=interfaceLevelGain(level);for(const channel of ['L','R'])dev.nodes['out'+channel].gain.setTargetAtTime(linearGain,appState.audio.context.currentTime,.02);
                    const slider=document.getElementById('ai-line');if(slider&&appState.interface.selectedDeviceId===dev.id)slider.value=level;
                    el.querySelector('[data-ai-line]')?.style.setProperty('--ai-turn',`${-135+level*270}deg`);
                };
                dev.setAiPhones=(index,value)=>{
                    if(value===undefined){value=index;index=0;}
                    index=Math.max(0,Math.min(phoneCount-1,Number(index)||0));const level=Math.max(0,Math.min(1,Number(value)||0));dev.state.aiPhoneLevels[index]=level;
                    const linearGain=interfaceLevelGain(level);phoneStages[index].forEach(node=>node.gain.setTargetAtTime(linearGain,appState.audio.context.currentTime,.02));
                    const slider=document.getElementById(`ai-phones-${index}`);if(slider&&appState.interface.selectedDeviceId===dev.id)slider.value=level;
                    el.querySelector(`[data-ai-phones="${index}"]`)?.style.setProperty('--ai-turn',`${-135+level*270}deg`);
                };
                if(type==='audioInterface2')dev.setAiLine=value=>{
                    const level=Math.max(0,Math.min(1,Number(value)||0));dev.state.aiLineLevel=level;
                    const linearGain=interfaceLevelGain(level);for(const channel of ['L','R'])dev.nodes['out'+channel].gain.setTargetAtTime(linearGain,appState.audio.context.currentTime,.02);
                    phoneStages[0].forEach(node=>node.gain.setTargetAtTime(linearGain,appState.audio.context.currentTime,.02));dev.state.aiPhoneLevels[0]=level;
                    const slider=document.getElementById('ai-line');if(slider&&appState.interface.selectedDeviceId===dev.id)slider.value=level;
                    el.querySelector('[data-ai-line]')?.style.setProperty('--ai-turn',`${-135+level*270}deg`);
                };
                for(const channel of ['L','R']){const knob=el.querySelector(`[data-ai-gain="${channel}"]`);if(knob)Hardware.bindKnob(knob,{get:()=>dev.state['micGain'+channel],set:value=>dev.setMicGain(channel,value)});dev.setMicGain(channel,dev.state['micGain'+channel]);}
                const lineKnob=el.querySelector('[data-ai-line]');if(lineKnob)Hardware.bindKnob(lineKnob,{get:()=>dev.state.aiLineLevel,set:dev.setAiLine,model:lineKnob.dataset.interfaceKnob});
                el.querySelectorAll('[data-ai-phones]').forEach(knob=>{const index=Number(knob.dataset.aiPhones||0);Hardware.bindKnob(knob,{get:()=>dev.state.aiPhoneLevels[index],set:value=>dev.setAiPhones(index,value),model:knob.dataset.interfaceKnob});});
                dev.setAiLine(dev.state.aiLineLevel);dev.state.aiPhoneLevels.forEach((value,index)=>dev.setAiPhones(index,value));
                dev.stopMicCapture=(refresh=true)=>{
                    ++dev.captureToken;dev.micStream?.getTracks().forEach(track=>track.stop());dev.micStream=null;clearInterval(dev.micMeterTimer);dev.micMeterTimer=0;
                    dev.micSource?.disconnect();dev.micSplitter?.disconnect();dev.micAnalyser?.disconnect();dev.micSource=dev.micSplitter=dev.micAnalyser=null;
                    dev.state.playing=false;for(const ch of ['L','R'])dev.nodes['gen'+ch].gain.setTargetAtTime(0,appState.audio.context.currentTime,.015);
                    dev.el.classList.remove('ai-live','ai-signal','ai-clip');const button=dev.el.querySelector('[data-source-play]');button?.setAttribute('aria-pressed','false');button?.setAttribute('aria-label','Iniciar captura do computador');
                    configurePlaybackSession();dev.micMessage='Captura parada.';if(refresh&&appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);updateCableFlows();
                };
                dev.startMicCapture=async()=>{
                    if(dev.capturePending||dev.state.playing)return;
                    if(!dev.powered||!navigator.mediaDevices?.getUserMedia){dev.micMessage='Captura indisponível. Use HTTPS ou localhost e permita o acesso ao dispositivo de áudio.';if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);return;}
                    const token=++dev.captureToken;dev.capturePending=true;
                    let captureStream=null;
                    try{
                        const selectedDevice=dev.micDeviceId;
                        const audio=dev.captureInputLabelsAvailable?{...(selectedDevice?{deviceId:{exact:selectedDevice}}:{}),channelCount:{ideal:2},echoCancellation:false,noiseSuppression:false,autoGainControl:false}:true;
                        // Start the permission request in the original click gesture. Safari can
                        // lose that gesture if AudioContext.resume() is awaited first.
                        const firstRequest=requestCaptureAudio(audio);
                        appState.audio.context.resume().catch(()=>{});
                        try{captureStream=await firstRequest;}catch(error){
                            // Safari versions vary in which processing constraints they expose.
                            // Retry the chosen device without those optional constraints; never
                            // silently switch an explicitly selected input to the built-in mic.
                            if(['OverconstrainedError','TypeError'].includes(error.name)){
                                const retryAudio=selectedDevice?{deviceId:{exact:selectedDevice}}:true;
                                captureStream=await requestCaptureAudio(retryAudio);
                                if(appState.audio.context.state!=='running')await appState.audio.context.resume();
                            }else throw error;
                        }
                        if(token!==dev.captureToken||!appState.project.devices[dev.id]||!dev.powered){captureStream.getTracks().forEach(track=>track.stop());return;}
                        const stream=captureStream;
                        const channels=stream.getAudioTracks()[0]?.getSettings().channelCount||2;dev.micStream=stream;dev.micSource=appState.audio.context.createMediaStreamSource(stream);dev.micSplitter=appState.audio.context.createChannelSplitter(2);dev.micSource.connect(dev.micSplitter);
                        dev.micSplitter.connect(dev.nodes.genL,0);dev.micSplitter.connect(dev.nodes.genR,channels===1?0:1);
                        dev.micAnalyser=appState.audio.context.createAnalyser();dev.micAnalyser.fftSize=256;dev.micSource.connect(dev.micAnalyser);const samples=new Uint8Array(dev.micAnalyser.fftSize);
                        dev.micMeterTimer=setInterval(()=>{if(!dev.micAnalyser)return;dev.micAnalyser.getByteTimeDomainData(samples);const peak=samples.reduce((max,value)=>Math.max(max,Math.abs(value-128)/128),0);dev.lastMicPeak=peak;dev.el.classList.toggle('ai-signal',peak>.035);dev.el.classList.toggle('ai-clip',peak>.9);},100);
                        dev.state.playing=true;for(const ch of ['L','R'])dev.setMicGain(ch,dev.state['micGain'+ch]);
                        stream.getAudioTracks()[0]?.addEventListener('ended',()=>{if(dev.micStream===stream)dev.stopMicCapture();},{once:true});dev.el.classList.add('ai-live');const button=dev.el.querySelector('[data-source-play]');button?.setAttribute('aria-pressed','true');button?.setAttribute('aria-label','Parar captura do computador');
                        dev.micMessage=`Captura ativa · ${channels===1?'mono':'estéreo'}. O áudio segue às saídas conectadas.`;if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);updateCableFlows();
                        refreshCaptureInputs(dev);
                    }catch(error){
                        captureStream?.getTracks().forEach(track=>track.stop());
                        dev.micSource?.disconnect();dev.micSplitter?.disconnect();dev.micAnalyser?.disconnect();dev.micSource=dev.micSplitter=dev.micAnalyser=null;dev.micStream=null;
                        const messages={
                            InvalidStateError:captureStateMessage(),
                            NotAllowedError:'Permita o microfone para este site nas configurações do Safari e do macOS e tente novamente.',
                            NotFoundError:'O Safari não encontrou essa entrada. Confira se a interface aparece em Ajustes do Sistema → Som → Entrada.',
                            NotReadableError:'A entrada está ocupada ou bloqueada pelo macOS. Feche outros apps de áudio e confira a permissão de microfone do Safari.',
                            OverconstrainedError:'A entrada selecionada não está disponível. Reconecte-a ou escolha outra entrada.',
                            SecurityError:'A captura foi bloqueada pelo navegador. Abra o programa em HTTPS ou localhost e confira as permissões do site.'
                        };
                        dev.micMessage=messages[error.name]||`Não foi possível iniciar a captura (${error.name||'erro de áudio'}). Confira a entrada selecionada e as permissões do navegador.`;
                        if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);
                        refreshCaptureInputs(dev);
                    }
                    finally{dev.capturePending=false;configurePlaybackSession();}
                };
                dev.syncCaptureControls=()=>{if(appState.interface.selectedDeviceId===dev.id){for(const channel of ['L','R']){const input=document.getElementById(`ai-gain-${channel}`);if(input)input.value=dev.state['micGain'+channel];}const line=document.getElementById('ai-line');if(line)line.value=dev.state.aiLineLevel;dev.state.aiPhoneLevels.forEach((value,index)=>{const input=document.getElementById(`ai-phones-${index}`);if(input)input.value=value;});}Hardware.sync(dev);};
                for(const name of ['setMicGain','setAiLine','setAiPhones']){const setter=dev[name];dev[name]=(...args)=>{const result=setter(...args);dev.syncCaptureControls();scheduleProjectSave();return result;};}
                el.addEventListener('interface-control-change',dev.syncCaptureControls);el.addEventListener('click',dev.syncCaptureControls);dev.captureToken=0;
            }
            if(type==='streamer'){
                dev.nodes.outStereo=appState.audio.context.createChannelMerger(2);
                dev.nodes.outL.connect(dev.nodes.outStereo,0,0);dev.nodes.outR.connect(dev.nodes.outStereo,0,1);
            }
            if(type==='tapeDeck')setupTapeAudio(dev);
            if(dev.receiverRadioTargets)setupReceiverRadio(dev);
            appStateStore.actions.registerDevice(dev);
            updateKubaAppearance(dev);
            fixDeviceElectricalSpecs(dev);
            installAmplificationVoicing(dev);
            installOutputCircuits(dev);
            installListeningControls(dev);
            bindDeviceEvents(dev);
            if(type==='furnitureCoverflow'){
                const controller=SpotifyCoverflow.mount(el.querySelector('.spotify-coverflow-host'),dev.state,scheduleProjectSave);
                dev.refreshCoverflow=controller.refresh;dev.disposeCoverflow=controller.dispose;
            }
            if(SIGNAL_GENERATOR_TYPES.has(type)){configureSignalGenerator(dev);bindSignalGeneratorPanel(dev);}
            if(EXTRA_AUDIO_TYPES.has(type))bindExtraDevice(dev);
            if(type==='hardwareDemo')Hardware.bindDemo(dev);
            Hardware.mount(dev);
            if(!FURNITURE_TYPES[type]) setupAudioMeters(dev);
            animateDevicePower(dev);
            selectDevice(id);
            settleNewDeviceWithGravity(dev);
            updateCableFlows();
        }

