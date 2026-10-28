/* Undo/redo, inspector controls, and device property panels. */
        const movementUndo=[],movementRedo=[];
        const historyTools=document.createElement('div');historyTools.className='movement-history-tools';
        historyTools.innerHTML='<button type="button" id="undo-movement" aria-label="Desfazer última ação" data-tooltip="Desfazer última ação · Ctrl/Cmd+Z" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h9a7 7 0 0 1 0 14h-2"/></svg></button><button type="button" id="redo-movement" aria-label="Refazer última ação" data-tooltip="Refazer última ação · Ctrl/Cmd+Shift+Z" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 14 5-5-5-5m5 5h-9a7 7 0 0 0 0 14h2"/></svg></button>';
        document.querySelector('.canvas-tools').prepend(historyTools);
        const toolbarTooltip=document.createElement('div');toolbarTooltip.id='toolbar-tooltip';toolbarTooltip.setAttribute('role','tooltip');document.body.appendChild(toolbarTooltip);
        let toolbarTooltipTimer=0,toolbarTooltipTarget=null,toolbarTooltipPreviousDescription='',touchTooltipTarget=null;
        function hideToolbarTooltip(){clearTimeout(toolbarTooltipTimer);toolbarTooltip.classList.remove('is-visible');if(toolbarTooltipTarget){const ids=(toolbarTooltipTarget.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!=='toolbar-tooltip');if(toolbarTooltipPreviousDescription)ids.unshift(...toolbarTooltipPreviousDescription.split(/\s+/).filter(Boolean));if(ids.length)toolbarTooltipTarget.setAttribute('aria-describedby',[...new Set(ids)].join(' '));else toolbarTooltipTarget.removeAttribute('aria-describedby');}toolbarTooltipTarget=null;toolbarTooltipPreviousDescription='';}
        function scheduleToolbarTooltip(target){if(!target?.dataset.tooltip)return;hideToolbarTooltip();toolbarTooltipTarget=target;toolbarTooltipPreviousDescription=target.getAttribute('aria-describedby')||'';toolbarTooltip.textContent=target.dataset.tooltip;toolbarTooltipTimer=setTimeout(()=>{if(!target.isConnected||!(target.matches(':hover')||document.activeElement===target||touchTooltipTarget===target))return;const rect=target.getBoundingClientRect();toolbarTooltip.classList.add('is-visible');const tip=toolbarTooltip.getBoundingClientRect(),gap=7,left=Math.max(8,Math.min(innerWidth-tip.width-8,rect.left+(rect.width-tip.width)/2)),top=rect.bottom+gap+tip.height<=innerHeight?rect.bottom+gap:Math.max(8,rect.top-gap-tip.height);toolbarTooltip.style.left=`${left}px`;toolbarTooltip.style.top=`${top}px`;const ids=new Set((target.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add('toolbar-tooltip');target.setAttribute('aria-describedby',[...ids].join(' '));},1000);}
        document.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target)scheduleToolbarTooltip(target);});
        document.addEventListener('pointerout',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target&&!(event.relatedTarget instanceof Node&&target.contains(event.relatedTarget)))hideToolbarTooltip();});
        document.addEventListener('pointerdown',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target&&event.pointerType==='touch'){touchTooltipTarget=target;scheduleToolbarTooltip(target);}});
        document.addEventListener('pointerup',event=>{if(event.pointerType==='touch'){touchTooltipTarget=null;hideToolbarTooltip();}});
        document.addEventListener('pointercancel',()=>{touchTooltipTarget=null;hideToolbarTooltip();});
        document.addEventListener('focusin',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target)scheduleToolbarTooltip(target);});
        document.addEventListener('focusout',event=>{if(event.target instanceof Element&&event.target.matches('#app-topbar [data-tooltip]')&&!event.target.matches(':hover'))hideToolbarTooltip();});
        function updateMovementHistoryButtons(){
            const valid=entry=>entry.kind!=='move'||entry.before.every(p=>appState.project.devices[p.id]);
            for(const stack of [movementUndo,movementRedo])for(let i=stack.length-1;i>=0;i--)if(!valid(stack[i]))stack.splice(i,1);
            const undo=document.getElementById('undo-movement'),redo=document.getElementById('redo-movement'),label=entry=>!entry?'última ação':entry.kind==='move'?'movimento':entry.kind==='delete-device'?'remoção de equipamento':entry.kind==='delete-spotify'?'remoção de álbum ou disco':'ação';
            undo.disabled=!movementUndo.length;redo.disabled=!movementRedo.length;
            mobileControls.querySelector('[data-mobile-action="undo"]').disabled=undo.disabled;mobileControls.querySelector('[data-mobile-action="redo"]').disabled=redo.disabled;
            undo.dataset.tooltip=`Desfazer ${label(movementUndo.at(-1))} · Ctrl/Cmd+Z`;undo.setAttribute('aria-label',`Desfazer ${label(movementUndo.at(-1))}`);
            redo.dataset.tooltip=`Refazer ${label(movementRedo.at(-1))} · Ctrl/Cmd+Shift+Z`;redo.setAttribute('aria-label',`Refazer ${label(movementRedo.at(-1))}`);
        }
        function recordMovement(before,after){
            const positions=list=>list.map(p=>({id:p.dev.id,x:p.x,y:p.y}));
            if(!before.some((p,i)=>Math.abs(p.x-after[i].x)+Math.abs(p.y-after[i].y)>.1))return;
            movementUndo.push({kind:'move',before:positions(before),after:positions(after)});if(movementUndo.length>100)movementUndo.shift();
            movementRedo.length=0;updateMovementHistoryButtons();
        }
        function recordDeletedDevices(devices){
            const existing=devices.filter(dev=>dev&&appState.project.devices[dev.id]);if(!existing.length)return;
            const snapshot=projectCapture(),ids=new Set(existing.map(dev=>dev.id)),records=existing.map(dev=>({saved:snapshot.devices.find(item=>item.id===dev.id),audio:dev.mediaBlob||null,vinylUri:dev.spotifyVinyl?.uri||null})).filter(item=>item.saved);
            const connections=snapshot.connections.filter(connection=>ids.has(connection.from)||ids.has(connection.to));
            movementUndo.push({kind:'delete-device',records,connections,selected:[...appState.interface.selectedDeviceIds]});if(movementUndo.length>100)movementUndo.shift();
            movementRedo.length=0;updateMovementHistoryButtons();
        }
        function recordDeletedSpotify(kind,item){
            if(!item)return;
            const origin=item.dragStart||item,record={id:item.id,uri:item.uri,name:item.name,image:item.image,origin:item.origin,x:origin.x,y:origin.y};
            if(kind==='album')record.open=item.open;
            else record.turntableId=item.dragStart?.turntableId||item.turntableId||null;
            movementUndo.push({kind:'delete-spotify',itemKind:kind,record});if(movementUndo.length>100)movementUndo.shift();
            movementRedo.length=0;updateMovementHistoryButtons();
        }
        async function restoreDeletedDevices(entry,restore){
            if(!restore){entry.records.forEach(({saved})=>{const dev=appState.project.devices[saved.id];if(dev)deleteDevice(dev,false);});return;}
            projectRestoring=true;appStateStore.actions.setProjectRestoring(true);
            try{
                for(const {saved,audio} of entry.records){
                    if(appState.project.devices[saved.id])continue;
                    createDevice(saved.type,saved.x,saved.y,saved.id);const dev=appState.project.devices[saved.id];if(!dev)throw new Error('Não foi possível restaurar o equipamento removido.');
                    applySavedDevice(dev,saved);dev.fileName=saved.fileName||'';dev.trackTitle=saved.trackTitle||'';dev.demoOffset=Math.max(0,Number(saved.position)||0);
                    if(audio instanceof Blob){try{const bytes=await audio.arrayBuffer(),metadata=dev.type==='streamIntegrated'?readStreamMetadata(bytes):null;dev.audioBuffer=await appState.audio.context.decodeAudioData(bytes);dev.mediaBlob=audio;dev.mediaKey=saved.mediaKey;dev.fileOffset=Math.max(0,Math.min(Number(saved.position)||0,dev.audioBuffer.duration));if(metadata)dev.setStreamMetadata(metadata);}catch{dev.fileMessage='Recarregue o arquivo de áudio para continuar.';}}
                }
                for(const {saved} of entry.records){const dev=appState.project.devices[saved.id],paired=appState.project.devices[saved.pairedId];if(dev&&paired&&BT_TX_TYPES.has(dev.type)&&canPair(dev,paired))pairDevices(dev,paired);}
                for(const connection of entry.connections){
                    const from=appState.project.devices[connection.from],to=appState.project.devices[connection.to];if(!from||!to)continue;
                    const already=appState.project.connections.some(c=>c.outDeviceId===from.id&&c.inDeviceId===to.id&&document.getElementById(c.outId)?.dataset.node===connection.out&&document.getElementById(c.inId)?.dataset.node===connection.input);if(already)continue;
                    try{connectProjectPorts(from,connection.out,to,connection.input);const cable=appState.project.connections.at(-1);Object.assign(cable,{label:connection.label||'',color:connection.color||null,hidden:!!connection.hidden,slack:connection.slack??5});applyCableAppearance(cable);}catch{}
                }
                for(const {saved,vinylUri} of entry.records){const dev=appState.project.devices[saved.id],vinyl=vinylUri&&spotifyVinyls.get(vinylUri);if(dev&&vinyl&&!dev.spotifyVinyl){vinyl.turntableId=dev.id;dev.spotifyVinyl=vinyl;vinyl.el.classList.add('is-on-platter');vinyl.el.classList.toggle('is-linear',dev.type==='turntableLinear');moveSpotifyVinyl(vinyl,vinyl.x,vinyl.y);}}
                setDeviceSelection(entry.selected.filter(id=>appState.project.devices[id]));if(!appState.interface.selectedDeviceIds.size&&entry.records[0])selectDevice(entry.records[0].saved.id,true);
            }finally{projectRestoring=false;appStateStore.actions.setProjectRestoring(false);updateCables();updateBluetoothLinks();updateCableFlows();scheduleProjectSave();}
        }
        async function replayHistoryEntry(entry,redo){
            if(entry.kind==='move'){
                const positions=redo?entry.after:entry.before;
                positions.forEach(p=>{const dev=appState.project.devices[p.id];if(dev){dev.cancelPlacementMotion?.();dev.el.style.left=`${p.x}px`;dev.el.style.top=`${p.y}px`;}});updateCables();
            }else if(entry.kind==='delete-device')await restoreDeletedDevices(entry,!redo);
            else if(entry.kind==='delete-spotify'){
                if(entry.itemKind==='album'){
                    const current=spotifyAlbums.get(entry.record.uri);
                    if(redo&&current)removeSpotifyAlbum(current,false);else if(!redo&&!current)createSpotifyAlbum(entry.record);
                }else{
                    const current=spotifyVinyls.get(entry.record.uri);
                    if(redo&&current)removeSpotifyVinyl(current,false);
                    else if(!redo&&!current){const vinyl=createSpotifyVinyl({...entry.record,turntableId:null});const dev=appState.project.devices[entry.record.turntableId];if(vinyl&&dev&&!dev.spotifyVinyl)placeSpotifyVinyl(vinyl,dev,false);}
                }
            }
            scheduleProjectSave();updateMovementHistoryButtons();
        }
        async function replayMovement(redo=false){
            if(isPatching||document.querySelector('.equipment-dragging:not(.history-settling)'))return;
            updateMovementHistoryButtons();const from=redo?movementRedo:movementUndo,to=redo?movementUndo:movementRedo,entry=from.at(-1);if(!entry)return;
            try{await replayHistoryEntry(entry,redo);from.pop();to.push(entry);}
            catch(error){projectStatus(`Não foi possível ${redo?'refazer':'desfazer'}: ${error.message}`,true);}
            updateMovementHistoryButtons();
        }
        document.getElementById('undo-movement').onclick=()=>replayMovement(false);
        document.getElementById('redo-movement').onclick=()=>replayMovement(true);
        document.addEventListener('keydown',event=>{
            if(!(event.metaKey||event.ctrlKey)||event.altKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
            const key=event.key.toLowerCase(),redo=(key==='z'&&event.shiftKey)||(key==='y'&&event.ctrlKey&&!event.metaKey);
            if(key!=='z'&&!redo)return;event.preventDefault();replayMovement(redo);
        });

        function syncInspectorGainVisual(slider){
            const control=slider.closest('.gain-slider-control');if(!control)return;
            const min=Number(slider.min),max=Number(slider.max);
            const amount=Math.max(0,Math.min(1,(Number(slider.value)-min)/(max-min)));
            // The lower half is the normal blue range; energy builds above level five.
            const energy=slider.dataset.gainColor?amount:Math.max(0,(amount-.5)*2);
            const target=slider.dataset.gainColor==='green'?[34,197,94]:slider.dataset.gainColor==='red'?[239,68,68]:[239,68,68];
            const color=[59,130,246].map((blue,i)=>Math.round(blue+(target[i]-blue)*energy));
            control.style.setProperty('--gain-position',String(amount));
            control.style.setProperty('--gain-energy',String(energy));
            control.style.setProperty('--gain-color',energy===0?'var(--accent)':`rgb(${color.join(' ')})`);
            control.dataset.idle=String(energy===0);
            const intervals=slider.dataset.gainSteps?Number(slider.dataset.gainSteps)-1:Hardware.physics.detents;
            const index=Math.round(amount*intervals);
            slider.setAttribute('aria-valuetext',slider.dataset.gainSteps?`${Number(slider.value)?'+':''}${Number(slider.value)} dB`:`${index} · ${Number(slider.value)}`);
            control.nextElementSibling?.querySelectorAll('span').forEach((tick,i)=>tick.classList.toggle('is-current',i===index));
        }
        function setupInspectorGainVisual(slider){
            const control=document.createElement('span');control.className='gain-slider-control';
            const visual=document.createElement('span');visual.className='gain-slider-visual';visual.setAttribute('aria-hidden','true');
            const particles=Array.from({length:24},(_,i)=>`<i style="--particle-x:${5+(i*37)%90}%;--particle-y:${16+(i*29)%68}%;--particle-size:${i%3===0?3:2}px;--particle-direction:${i%2?-1:1};--particle-threshold:${i<8?0:((i-8)/16*.7).toFixed(3)};--particle-delay:${-(i*.47).toFixed(2)}s;--particle-duration:${(2.8+(i%4)*.5).toFixed(1)}s"></i>`).join('');
            visual.innerHTML=`<span class="gain-slider-fill"></span>`;
            const particlesEl=document.createElement('span');particlesEl.className='gain-slider-particles';particlesEl.setAttribute('aria-hidden','true');particlesEl.innerHTML=particles;
            slider.before(control);control.append(visual,slider,particlesEl);
            slider.addEventListener('input',()=>syncInspectorGainVisual(slider));
            slider.addEventListener('change',()=>syncInspectorGainVisual(slider));
            syncInspectorGainVisual(slider);
        }
        const MenuSlider={
            mount(root){
                root.querySelectorAll('input[type="range"]:not(.gain-spark-slider)').forEach(slider=>{
                    slider.classList.add('app-menu-slider');
                    slider.dataset.menuSlider='standard';
                });
            }
        };
        // Keep physical units for the audio graph while exposing fixed detents in the inspector.
        function setupInspectorDetents() {
            inspectorContent.querySelectorAll('input[type="range"]:not(#source-progress):not([data-spotify-position])').forEach(slider=>{
                if(slider.dataset.detents)return;slider.dataset.detents='true';Hardware.slider(slider);
                if(slider.dataset.gainSteps)slider.step=String((Number(slider.max)-Number(slider.min))/(Number(slider.dataset.gainSteps)-1));
                if(slider.matches('.gain-spark-slider'))setupInspectorGainVisual(slider);
                const min=Number(slider.min),max=Number(slider.max),intervals=slider.dataset.gainSteps?Number(slider.dataset.gainSteps)-1:Hardware.physics.detents;
                if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)return;
                const bipolar=min<0&&max>0,scale=document.createElement('div');scale.className='inspector-detent-scale';scale.setAttribute('aria-hidden','true');
                for(let i=0;i<=intervals;i++){const tick=document.createElement('span');tick.textContent=slider.dataset.gainSteps?`${i?'+':''}${min+(max-min)*i/intervals} dB`:String(bipolar?i-5:i);scale.appendChild(tick);}
                (slider.closest('.gain-slider-control')||slider).insertAdjacentElement('afterend',scale);
                const update=()=>{const index=Math.max(0,Math.min(intervals,Math.round((Number(slider.value)-min)/(max-min)*intervals)));scale.querySelectorAll('span').forEach((tick,i)=>tick.classList.toggle('is-current',i===index));slider.setAttribute('aria-valuetext',slider.dataset.gainSteps?`${Number(slider.value)?'+':''}${Number(slider.value)} dB`:`${bipolar?index-5:index} · ${Number(slider.value)}`);};
                slider.addEventListener('input',update);slider.addEventListener('change',update);update();
            });
        }

        function conciseEquipmentInspector(html){
            const template=document.createElement('template');template.innerHTML=html;
            template.content.querySelectorAll('p:not([id]):not([role="status"]):not([role="alert"])').forEach(text=>text.remove());
            template.content.querySelectorAll('div[class*="text-gray-400"],div[class*="text-gray-500"]').forEach(text=>{
                if(text.id||text.getAttribute('role')||text.querySelector('button,input,select,textarea,output,svg,canvas,[role]'))return;
                if(!text.children.length&&text.textContent.trim())text.remove();
            });
            [...template.content.querySelectorAll('div,section')].reverse().forEach(group=>{
                if(group.id||group.getAttribute('role')||group.classList.contains('sonic-trait-dots')||group.querySelector('[id],[role="status"],[role="alert"],button,input,select,textarea,output,svg,canvas')||group.textContent.trim())return;
                group.remove();
            });
            return template.innerHTML;
        }

        const inspectorWindow=document.getElementById('inspector');
        let inspectorAnchorDevice=null,inspectorPositionFrame=0;
        function positionInspectorWindow(){
            inspectorPositionFrame=0;
            if(!inspectorAnchorDevice?.isConnected||inspectorWindow.dataset.floating!=='true')return;
            const anchor=inspectorAnchorDevice.getBoundingClientRect(),panel=inspectorWindow.getBoundingClientRect(),gap=16,margin=12;
            const width=Math.min(380,innerWidth-margin*2),height=Math.min(panel.height,innerHeight-margin*2);
            const rightSpace=innerWidth-anchor.right,leftSpace=anchor.left;
            const left=rightSpace>=width+gap?anchor.right+gap:leftSpace>=width+gap?anchor.left-width-gap:Math.max(margin,Math.min(innerWidth-width-margin,anchor.left+(anchor.width-width)/2));
            const top=Math.max(margin,Math.min(innerHeight-height-margin,anchor.top+(anchor.height-height)/2));
            inspectorWindow.style.left=`${Math.round(left)}px`;inspectorWindow.style.top=`${Math.round(top)}px`;
        }
        function scheduleInspectorPosition(){if(!inspectorPositionFrame)inspectorPositionFrame=requestAnimationFrame(positionInspectorWindow);}
        window.addEventListener('resize',scheduleInspectorPosition,{passive:true});
        window.addEventListener('pointermove',scheduleInspectorPosition,{passive:true});
        window.addEventListener('wheel',scheduleInspectorPosition,{passive:true});
        const inspectorCloseButton=document.getElementById('inspector-sidebar-pin');
        inspectorCloseButton.addEventListener('click',event=>{if(inspectorWindow.dataset.floating!=='true')return;event.preventDefault();event.stopImmediatePropagation();selectDevice(null);},{capture:true});

        function selectDevice(id, preserveSelection = false) {
            GuidedAccess.notify();
            const floating=id&&matchMedia('(min-width:701px)').matches;
            inspectorWindow.dataset.floating=String(!!floating);
            document.body.classList.toggle('inspector-floating',!!floating);
            inspectorAnchorDevice=id?appState.project.devices[id]?.el||null:null;
            inspectorWindow.style.removeProperty('left');inspectorWindow.style.removeProperty('top');
            if(id&&!appState.project.restoringProject&&!compactLayout.matches)openSidebar('properties',4000);
            if (id && appState.interface.selectedConnection) selectCable(null,false);
            disposeSpectrum();
            if (!preserveSelection) appStateStore.actions.setSelectedDevices(new Set(id ? [id] : []));
            appStateStore.actions.setSelectedDevice(id);
            syncDeviceSelection();
            syncMobileContextActions();
            if(!id) {
                document.getElementById('inspector-title').textContent='Selecione um equipamento';
                inspectorEmpty.classList.remove('hidden'); inspectorContent.classList.add('hidden');
                return;
            }
            
            const dev = appState.project.devices[id];
            if (!dev) {
                appStateStore.actions.setSelectedDevice(null);
                document.getElementById('inspector-title').textContent='Selecione um equipamento';
                inspectorEmpty.classList.remove('hidden'); inspectorContent.classList.add('hidden');
                return;
            }
            
            inspectorEmpty.classList.add('hidden');
            inspectorContent.classList.remove('hidden');
            
            const names = DEVICE_NAMES;
            const equipmentName=names[dev.type]||dev.el.querySelector('.device-header > span')?.textContent.trim()||dev.type;
            document.getElementById('inspector-title').textContent=equipmentName;

            const hasPowerControl = !!dev.el.querySelector('.power-btn');
            let html='';
            if (hasPowerControl) {
                html += `<div class="flex flex-col gap-2"><span class="text-sm text-gray-300">Energia</span><button id="inspector-power-toggle" type="button" aria-label="Ligar ou desligar equipamento" aria-pressed="${dev.powered}" class="tt-insp-btn w-full ${dev.powered ? 'is-on' : ''}">LIGAR / DESLIGAR</button></div>`;
            }
            if(dev.state.damage)html+='<div class="equipment-damage-notice" role="status">DANIFICADO · Sobrecarga elétrica simulada. Substitua o equipamento por outro do catálogo.</div>';
            html+=amplificationInspectorHtml(dev);

            if(dev.type==='streamIntegrated'){html+=streamIntegratedInspector(dev);
            }else if(SIGNAL_GENERATOR_TYPES.has(dev.type)){html+=signalInspectorHtml(dev);
            }else if(EXTRA_AUDIO_TYPES.has(dev.type)){html+=extraInspectorHtml(dev);
            } else if(controlAmpConfig(dev.type)){
                html+=integratedInspectorHtml(dev);
                if(CUSTOM_PREAMPS[dev.type])html+=customPreampInspectorHtml(dev);
            } else if (dev.type === 'receiver') {
                html += `
                    <div class="flex flex-col gap-4">
                        <p class="text-xs text-gray-400">LINE OUT e SPEAKERS preservam L/R. Conecte cada caixa à saída do mesmo lado.</p>
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume</span><span class="text-xs text-blue-400 font-mono" id="lbl-vol">${Math.round(dev.state.volume*100)}%</span></div>
                        <input type="range" id="sl-vol" min="0" max="1" step="0.01" value="${dev.state.volume}">
                        
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Graves (Bass)</span><span class="text-xs text-blue-400 font-mono" id="lbl-bass">${dev.state.bass}dB</span></div>
                        <input type="range" id="sl-bass" min="-15" max="15" step="1" value="${dev.state.bass}">
                        
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Agudos (Treble)</span><span class="text-xs text-blue-400 font-mono" id="lbl-treble">${dev.state.treble}dB</span></div>
                        <input type="range" id="sl-treble" min="-15" max="15" step="1" value="${dev.state.treble}">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Balanço L/R</span><span id="lbl-balance" class="text-xs text-blue-400">${Math.abs(dev.state.balance || 0)<.01 ? 'Centro' : `${dev.state.balance<0?'L':'R'} ${Math.round(Math.abs(dev.state.balance)*100)}%`}</span></div>
                        <input type="range" id="sl-balance" min="-1" max="1" step="0.01" value="${dev.state.balance || 0}">
                    </div>
                `;
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                html += `
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume dos Fones</span><span class="text-xs text-amber-400 font-mono" id="lbl-amp-vol">${Math.round(dev.state.volume*100)}%</span></div>
                        <input type="range" id="sl-amp-vol" min="0" max="1" step="0.01" value="${dev.state.volume}">
                    </div>
                `;
            } else if (dev.type === 'headphoneAmp4') {
                const channelVolumes = dev.state.channelVolumes || [0.8, 0.8, 0.8, 0.8];
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Quatro saídas P10 com volume independente por canal.</p>`;
                channelVolumes.forEach((value, index) => {
                    html += `<div><div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-300">Canal ${index + 1}</span><span class="text-xs text-red-300 font-mono" id="lbl-amp4-${index + 1}">${Math.round(value * 100)}%</span></div><input type="range" id="sl-amp4-${index + 1}" min="0" max="1" step="0.01" value="${value}"></div>`;
                });
                html += `</div>`;
            } else if (MATRIX_TYPES.has(dev.type)) {
                html += `<p class="text-sm text-gray-400">Selecione uma das três entradas nas chaves do painel. Os quatro botões de saída são independentes: é possível enviar a fonte para várias saídas ou desligar todas. Todas as conexões são RCA estéreo R/L.</p>`;
            } else if (RCA_SWITCH_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Distribui uma entrada RCA estéreo para uma das duas saídas. Use A ou B no aparelho para escolher qual equipamento recebe o sinal.</p>`;
            } else if (MIXER_TYPES.has(dev.type)) {
                const levels = dev.state.channelVolumes || [0.8, 0.8, 0.8];
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Mistura três fontes RCA estéreo. Cada canal tem volume independente; a saída principal mantém os lados R/L.</p>`;
                levels.forEach((value, channel) => { html += `<div><div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-300">Canal ${channel + 1}</span><span class="text-xs text-sky-300 font-mono" id="lbl-mixer-${channel}">${Math.round(value * 100)}%</span></div><input type="range" id="sl-mixer-${channel}" min="0" max="1" step="0.01" value="${value}"></div>`; });
                html += `</div>`;
            } else if (SPEAKER_SWITCH_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Recebe um par amplificado de fio de caixa e o direciona somente ao par passivo A ou B escolhido no painel frontal. Conecte-o às saídas SPEAKER do amplificador de potência.</p>`;
            } else if (PASSIVE_SUB_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Subwoofer passivo: conecte os terminais SPEAKER IN diretamente às saídas de potência do amplificador. Não usa entrada LFE RCA nem tem amplificação própria.</p>`;
            } else if (CROSSOVER_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Divide o sinal RCA estéreo em três faixas: graves abaixo de 250 Hz, médios entre 250 Hz e 2,5 kHz e agudos acima de 2,5 kHz. Cada saída preserva R/L.</p>`;
            } else if (EQ_TYPES.has(dev.type)) {
                const labels = GRAPHIC_EQ_FREQUENCIES.map(() => '');
                const freqs = EQ_BANDS[dev.type] || EQ_BANDS.eqStudio;
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Equalizador gráfico de 7 bandas (−12 a +12 dB)</p><label>Nível de saída<input id="sl-eq-level" type="range" min="0" max="1" step="0.01" value="${dev.state.eqLevel}"></label>`;
                labels.forEach((name, i) => {
                    const v = dev.state.eq[i] || 0;
                    html += `
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">${name} <span class="text-[10px] text-gray-500">${freqs[i] >= 1000 ? (freqs[i]/1000)+'kHz' : freqs[i]+'Hz'}</span></span><span class="text-xs text-blue-400 font-mono" id="lbl-eq-${i}">${v > 0 ? '+' : ''}${v}dB</span></div>
                        <input type="range" id="sl-eq-${i}" min="-12" max="12" step="0.5" value="${v}">
                    `;
                });
                html += `</div>`;
            } else if (BT_TX_TYPES.has(dev.type)) {
                const paired = dev.btPairedId ? appState.project.devices[dev.btPairedId] : null;
                html += `<div class="text-sm text-gray-400 mt-2">Transmissor Bluetooth: recebe áudio pela entrada RCA estéreo e envia sem fio para fones pareados. ${paired ? ('Conectado a ' + (DEVICE_NAMES[paired.type] || paired.type) + '.') : 'Clique em Parear aqui e no fone.'}</div>`;
            } else if (BT_RX_TYPES.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Receptor Bluetooth: recebe áudio sem fio de um celular ou computador e converte para saída analógica RCA estéreo. Não transmite para fones Bluetooth.</div>`;
            } else if (HP_TYPES.has(dev.type)) {
                const paired = dev.btPairedId ? appState.project.devices[dev.btPairedId] : null;
                if(REFERENCE_HEADPHONES[dev.type])html+=`<p class="text-xs text-gray-400">${REFERENCE_HEADPHONES[dev.type].enclosure||'Aberto'} · ${REFERENCE_HEADPHONES[dev.type].ohms} Ω nominais · conexão estéreo simplificada para P2 no simulador.</p>`;
                if(dev.type==='hpKubaDisco2')html+=`<div class="kuba-finish-control"><label for="kuba-wood">Madeira do arco</label><select id="kuba-wood">${Object.entries(KUBA_WOOD_FINISHES).map(([key,name])=>`<option value="${key}" ${dev.state.kubaWood===key?'selected':''}>${name}</option>`).join('')}</select><p>Arco clássico laminado, regulagens laterais, conchas com anéis concêntricos e almofadas XL. O acabamento altera a aparência do arco.</p></div>`;
                html += `<div class="text-sm text-gray-400 mt-2">${dev.type==='hpMax'?'Conexão somente por Bluetooth. ':dev.type==='hpKubaDisco2'?'Entrada P2 estéreo na ponta do cabo, abaixo do divisor em Y. ':'Entrada P2 estéreo na parte inferior da concha esquerda. '}${BT_HP_TYPES.has(dev.type)?`Bluetooth: ${paired ? ('pareado com ' + (DEVICE_NAMES[paired.type] || paired.type)) : 'sem conexão. Clique em Parear no transmissor e neste fone.'}`:'Conecte a uma saída de fones com cabo P2.'}</div>`;
            } else if (TURNTABLE_TYPES.has(dev.type)) {
                html += turntableInspectorHtml(dev);
                html+=`<section class="flex flex-col gap-3 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Ruído do vinil</span><div class="noise-level-buttons" role="group" aria-label="Nível de ruído do vinil">${Object.entries(VINYL_NOISE_LEVELS).map(([key,level])=>{const selected=(dev.state.vinylNoiseLevel||'medium')===key;return `<button type="button" data-vinyl-noise="${key}" class="tt-insp-btn noise-level-button ${selected?'is-on':''}" aria-label="${level.label}" title="${level.label}" aria-pressed="${selected}">${noiseLevelIcon(key)}</button>`}).join('')}</div></section>`;
            } else if(dev.type==='pendantLamp'){
                html+='<p class="text-sm text-gray-400">Luminária de filamento com luz amarela. Arraste pela cúpula para posicionar; o cabo acompanha a distância até o teto.</p>';
            } else if(WALL_LAMP_TYPES[dev.type]){
                html+=`<p class="text-sm text-gray-400">${catalogDescriptions[dev.type]} Arraste para posicionar na parede. A fonte de luz acompanha a luminária e projeta sombras nos equipamentos.</p>`;
            } else if(FURNITURE_TYPES[dev.type]) {
                const config=FURNITURE_TYPES[dev.type];
                if(dev.type==='furnitureCoverflow')html+=SpotifyCoverflow.inspectorHtml();
                if(dev.type==='cdCollection')html+=`<p class="text-xs text-gray-400">${config.description}</p>`;
                else html += `<div class="flex flex-col gap-3"><label class="text-sm text-gray-300" for="furniture-material">Material</label><select id="furniture-material" class="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700">${Object.entries(furnitureMaterialsFor(dev.type)).map(([key,name])=>`<option value="${key}" ${dev.state.material===key?'selected':''}>${name}</option>`).join('')}</select><p class="text-xs text-gray-400">${config.description}</p><p class="text-xs text-gray-400">Aproxime a base do equipamento de uma prateleira para apoiá-lo. Arraste o móvel pelas partes sólidas.${config.rack?' Os equipamentos apoiados nas prateleiras e empilhados acompanham o rack.':''}</p></div>`;
                if(dev.type==='furnitureTable')html+=`<fieldset class="bench-options"><legend>Ambiente da bancada</legend><label for="bench-surface">Superfície</label><select id="bench-surface">${Object.entries(BENCH_SURFACES).map(([key,label])=>`<option value="${key}" ${dev.state.benchSurface===key?'selected':''}>${label}</option>`).join('')}</select><label><input type="checkbox" id="bench-backdrop" ${dev.state.benchBackdrop===true?'checked':''}> Painel acústico</label><span>Objetos decorativos</span>${Object.entries(BENCH_DECORATIONS).map(([key,label])=>`<label><input type="checkbox" data-bench-decoration="${key}" ${dev.state.benchDecorations?.includes(key)?'checked':''}> ${label}</label>`).join('')}</fieldset>`;
            } else if (INTERFACE_DEVICES[dev.type]) {
                html += `<p class="text-sm text-gray-400">${INTERFACE_DEVICES[dev.type].description}</p>`;
                if(AudioAdapterDesign.models[dev.type])html+=`<section class="adapter-rotation"><span>Orientação</span><div><button type="button" class="tt-insp-btn" data-adapter-rotate="-90" aria-label="Girar 90 graus para a esquerda"><svg viewBox="0 0 24 24"><path d="M4 4v6h6M4 10a8 8 0 1 1 0 5"/></svg></button><output data-adapter-angle>${dev.state.adapterRotation||0}°</output><button type="button" class="tt-insp-btn" data-adapter-rotate="90" aria-label="Girar 90 graus para a direita"><svg viewBox="0 0 24 24"><path d="M20 4v6h-6m6 0a8 8 0 1 0 0 5"/></svg></button></div><p>Gire em passos de 90°. Os conectores acompanham o adaptador.</p><p data-adapter-rotation-status role="status"></p></section>`;
            } else if (dev.type === 'cdPlayer') {
                html += `<div class="text-sm text-gray-400 mt-2">Fonte digital estéreo. Conecte as saídas RCA R/L a um pré, receiver ou monitor ativo do mesmo lado.</div>`;
            } else if (['powerStereo','powerVintage'].includes(dev.type)||CUSTOM_POWER_AMPS[dev.type]) {
                html += ['L','R'].map(ch=>`<label class="block text-sm mt-4">Ganho ${ch==='L'?'A · esquerdo':'B · direito'}<input id="power-gain-${ch}" class="gain-spark-slider" type="range" min="0" max="1" step=".01" aria-label="Ganho ${ch==='L'?'A esquerdo':'B direito'}" value="${dev.state.channelGain[ch]}"></label>`).join('');
            } else if (dev.type === 'powerAmp') {
                html += `<label class="block text-sm text-gray-400 mt-4">Volume</label><input id="sl-poweramp-volume" aria-label="Volume do amplificador" type="range" min="0" max="1" step="0.01" value="${dev.state.volume ?? 1}" class="w-full">`;
                html += `<div class="text-sm text-gray-400 mt-2">Receiver moderno. Recebe RCA R/L e entrega saídas SPEAKER R/L para caixas passivas.</div>`;
            } else if (SUB_TYPES.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Entrada SUB/LFE mono em nível de linha. Conecte preferencialmente a saída SUB do receiver; uma saída de linha comum também é aceita, com filtragem de graves nesta caixa.</div>`;
                html += speakerInspectorHtml(dev);
            } else if (PASSIVE_SPK.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Conecte a entrada SPEAKER IN a qualquer saída para caixas usando fio de caixa. O canal estéreo é definido pela saída do receiver ou amplificador.</div>`;
            } else if (dev.type==='spkActiveCompact') {
                html+='<p class="text-sm text-gray-400">Caixa ativa compacta: conecte sinal de linha às entradas RCA L/R ou AUX P2. Os canais estéreo são preservados; a amplificação é interna.</p>';
                html+=speakerInspectorHtml(dev);
            } else if (ACTIVE_SPK.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Conecte a entrada de linha a uma saída LINE OUT com conector compatível. O canal do monitor é determinado pelo lado da saída usada (L ou R); dois monitores ligados a saídas diferentes formam o par estéreo.</div>`;
                html += speakerInspectorHtml(dev);
            } else {
                html += `<div class="text-sm text-gray-500 italic mt-4">Sem propriedades ajustáveis para este modelo.</div>`;
            }

            if(CAPTURE_INTERFACE_TYPES.has(dev.type)){
                const phoneCount=dev.type==='audioInterface4'?2:1;
                const gainControls=dev.type==='audioInterface2'?'':['L','R'].map(ch=>`<label>Ganho ${ch}<input id="ai-gain-${ch}" class="gain-spark-slider" data-gain-color="${ch==='L'?'green':'red'}" type="range" min="0" max="1" step=".01" value="${dev.state['micGain'+ch]}" aria-label="Ganho ${ch}"></label>`).join('');
                const phoneControls=dev.type==='audioInterface2'?'':Array.from({length:phoneCount},(_,index)=>`<label>Volume de fones${phoneCount>1?' '+(index+1):''}<input id="ai-phones-${index}" type="range" min="0" max="1" step=".01" value="${dev.state.aiPhoneLevels?.[index]??.75}"></label>`).join('');
                html+=`<section class="ai-inspector"><h3>Entrada do computador</h3><button id="ai-authorize-inputs" class="tt-insp-btn" type="button">AUTORIZAR / BUSCAR ENTRADAS</button><label>Dispositivo de captura<select id="ai-input-device"><option value="">Entrada padrão do sistema</option></select></label><button id="ai-capture-toggle" class="tt-insp-btn" type="button">${dev.state.playing?'PARAR CAPTURA':'INICIAR CAPTURA'}</button><p role="status" id="ai-capture-status">${dev.micMessage||'Escolha um dispositivo de áudio e permita o acesso no navegador.'}</p>${gainControls}<label>${dev.type==='audioInterface2'?'Volume geral · linha e fones':'Saída de linha'}<input id="ai-line" type="range" min="0" max="1" step=".01" value="${dev.state.aiLineLevel??.8}"></label>${phoneControls}<small>A captura é encaminhada sem efeitos para as saídas conectadas. ${dev.type==='audioInterface2'?'Esta interface não tem ganho de entrada; o volume compartilhado oferece até +12 dB.':'Os ganhos L/R e volumes de saída oferecem até +12 dB para compensar entradas baixas.'}</small></section>`;
            }
            if (SOURCE_TYPES.has(dev.type) && !TURNTABLE_TYPES.has(dev.type)&&!CAPTURE_INTERFACE_TYPES.has(dev.type)) html += `<div class="flex flex-col gap-2"><span class="text-sm text-gray-300">Reprodução</span><button id="source-inspector-play" type="button" class="tt-insp-btn ${dev.state.playing ? 'is-on' : ''}" aria-pressed="${!!dev.state.playing}">REPRODUZIR / PAUSAR</button></div>`;
            if (SOURCE_TYPES.has(dev.type)&&!SIGNAL_GENERATOR_TYPES.has(dev.type)&&!CAPTURE_INTERFACE_TYPES.has(dev.type)&&!(TURNTABLE_TYPES.has(dev.type)&&dev.spotifyVinyl)) html += `<div class="flex flex-col gap-2 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Música própria</span><button id="source-load-audio" type="button" class="tt-insp-btn">CARREGAR ÁUDIO</button><input id="source-audio-file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" hidden><div class="source-file-row"><p id="source-file-name" class="text-xs text-gray-300 break-words"></p><button id="source-remove-audio" type="button" aria-label="Remover arquivo de áudio" title="Remover arquivo" ${dev.audioBuffer ? '' : 'hidden'}><svg viewBox="0 0 24 24" aria-hidden="true"><path class="source-trash-lid" d="M4 7h16M9 7V5h6v2"/><path class="source-trash-bin" d="M6.5 9 7.5 20h9L17.5 9M10 11v6m4-6v6"/></svg></button></div><p id="source-file-message" class="text-xs text-gray-400"></p></div>`;
            if (dev.listeningProfile) html += `<section class="sonic-signature-panel"><h3>Assinatura sonora</h3>${listeningCurveHtml(dev)}</section>`;
            if(RADIO_RECEIVERS.has(dev.type))html+=radioInspectorHtml(dev);
            if(dev.spotifyVinyl)html+=spotifyTrackInspectorHtml();
            if ((dev.spotifyVinyl||dev.audioBuffer)&&!RADIO_RECEIVERS.has(dev.type)) html += transportInspectorHtml(dev);
            if (EQ_TYPES.has(dev.type) || CROSSOVER_TYPES.has(dev.type) || BENCH_METER_TYPES.has(dev.type)) html += spectrumInspectorHtml(dev);
            if(hasRestorableSettings(dev))html += '<div class="flex flex-col gap-2 border-t border-gray-700 pt-4"><button id="restore-device-settings" type="button" class="tt-insp-btn w-full">RESTAURAR CONFIGURAÇÕES</button><p id="restore-settings-status" role="status" class="text-xs text-gray-400"></p></div>';
            html+=portSignalsInspectorHtml(dev);
            html+=listeningInspectorHtml(dev);
            if(dev.el.querySelector('.speaker-grille'))html+=`<button type="button" class="tt-insp-btn" id="inspector-grille" aria-pressed="${dev.el.classList.contains('grille-off')}">GRADE</button>`;
            html+=signalHistoryInspectorHtml(dev);
            Hardware.sync(dev);
            inspectorContent.innerHTML = conciseEquipmentInspector(html);
            if(floating){
                inspectorWindow.setAttribute('role','region');
                inspectorCloseButton.setAttribute('aria-label',document.documentElement.lang==='en'?'Close parameters':'Fechar parâmetros');
                inspectorCloseButton.title=inspectorCloseButton.getAttribute('aria-label');
                inspectorCloseButton.classList.add('inspector-window-close');
                inspectorCloseButton.setAttribute('aria-pressed','false');
                inspectorCloseButton.setAttribute('aria-label',document.documentElement.lang==='en'?'Close parameters':'Fechar parâmetros');
                inspectorCloseButton.title=inspectorCloseButton.getAttribute('aria-label');
                scheduleInspectorPosition();
                inspectorWindow.classList.remove('inspector-window-enter');
                void inspectorWindow.offsetWidth;
                inspectorWindow.classList.add('inspector-window-enter');
            }else inspectorCloseButton.classList.remove('inspector-window-close');
            Hardware.inspector(inspectorContent);
            MenuSlider.mount(inspectorContent);
            if(dev.type==='furnitureCoverflow')SpotifyCoverflow.bindInspector(inspectorContent,dev.el.querySelector('.spotify-coverflow-host'));
            document.getElementById('inspector-grille')?.addEventListener('click',event=>{dev.el.querySelector(dev.el.classList.contains('grille-off')?'.grille-restore':'.speaker-grille').click();event.currentTarget.setAttribute('aria-pressed',String(dev.el.classList.contains('grille-off')));event.currentTarget.classList.toggle('is-on',dev.el.classList.contains('grille-off'));});
            queueMicrotask(setupInspectorDetents);
            bindListeningInspector(dev);
            bindIntegratedInspector(dev);
            bindCustomPreampInspector(dev);
            bindExtraInspector(dev);
            inspectorContent.querySelectorAll('[data-adapter-rotate]').forEach(button=>button.addEventListener('click',()=>rotateAudioAdapter(dev,Number(button.dataset.adapterRotate))));
            inspectorContent.querySelectorAll('[data-vinyl-noise]').forEach(button=>button.addEventListener('click',()=>{
                dev.state.vinylNoiseLevel=button.dataset.vinylNoise;
                dev.vinylNoise?.gain.gain.setTargetAtTime(VINYL_NOISE_LEVELS[dev.state.vinylNoiseLevel].gain,appState.audio.context.currentTime,.04);
                inspectorContent.querySelectorAll('[data-vinyl-noise]').forEach(item=>{const selected=item===button;item.classList.toggle('is-on',selected);item.setAttribute('aria-pressed',String(selected));});
            }));
            document.getElementById('restore-device-settings')?.addEventListener('click',async event=>{
                event.currentTarget.disabled=true;
                try{await restoreDeviceSettings(dev);}finally{const button=document.getElementById('restore-device-settings');if(button)button.disabled=false;}
            });
            document.getElementById('bench-surface')?.addEventListener('change',event=>{dev.state.benchSurface=event.target.value;updateBenchAppearance(dev);});
            document.getElementById('kuba-wood')?.addEventListener('change',event=>{dev.state.kubaWood=event.target.value;updateKubaAppearance(dev);});
            document.getElementById('bench-backdrop')?.addEventListener('change',event=>{dev.state.benchBackdrop=event.target.checked;updateBenchAppearance(dev);});
            document.querySelectorAll('[data-bench-decoration]').forEach(input=>input.addEventListener('change',()=>{
                dev.state.benchDecorations=[...document.querySelectorAll('[data-bench-decoration]:checked')].map(item=>item.dataset.benchDecoration);updateBenchAppearance(dev);
            }));
            if(FURNITURE_TYPES[dev.type])document.getElementById('furniture-material')?.addEventListener('change',event=>{dev.state.material=furnitureMaterialFor(dev.type,event.target.value);dev.el.dataset.material=dev.state.material;});
            if (EQ_TYPES.has(dev.type) || CROSSOVER_TYPES.has(dev.type) || BENCH_METER_TYPES.has(dev.type)) {
                setupSpectrum(dev);
                document.getElementById('spectrum-channel').addEventListener('change',()=>setupSpectrum(dev));
                document.getElementById('spectrum-band')?.addEventListener('change',()=>setupSpectrum(dev));
            }
            if(RADIO_RECEIVERS.has(dev.type))bindRadioInspector(dev);
            if ((dev.spotifyVinyl||dev.audioBuffer)&&!RADIO_RECEIVERS.has(dev.type)) bindTransportInspector(dev);
            if(dev.spotifyVinyl)bindSpotifyTrackInspector(dev);
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))bindSignalInspector(dev);
            if (document.getElementById('source-audio-file')) {
                document.getElementById('source-file-name').textContent = dev.fileName || 'Nenhum arquivo carregado · som de demonstração';
                document.getElementById('source-file-message').textContent = dev.fileMessage || (dev.audioBuffer ? `Duração: ${Math.floor(dev.audioBuffer.duration / 60)}:${String(Math.floor(dev.audioBuffer.duration % 60)).padStart(2,'0')}` : 'MP3, WAV e outros formatos de áudio compatíveis com o navegador.');
                const input = document.getElementById('source-audio-file');
                document.getElementById('source-load-audio').addEventListener('click', () => input.click());
                input.addEventListener('change', () => { if (input.files[0]) loadSourceAudio(dev, input.files[0]); });
                document.getElementById('source-remove-audio').addEventListener('click', async () => {
                    ++dev.fileLoadToken;
                    await setSourcePlaying(dev, false);
                    dev.audioBuffer = null; dev.mediaBlob=null;dev.mediaKey=null; dev.fileName = ''; dev.trackTitle=''; dev.demoOffset=0; dev.fileMessage = ''; dev.fileOffset = 0;dev.setStreamMetadata?.(null);
                    refreshCdDisplay(dev);
                    selectDevice(dev.id, true);
                });
            }
            document.getElementById('source-inspector-play')?.addEventListener('click', () => { if (dev.powered) setSourcePlaying(dev, !dev.state.playing); });
            if(CAPTURE_INTERFACE_TYPES.has(dev.type)){
                const select=document.getElementById('ai-input-device');
                refreshCaptureInputs(dev,select);
                document.getElementById('ai-authorize-inputs').addEventListener('click',event=>authorizeCaptureInputs(dev,event.currentTarget));
                select.addEventListener('change',()=>{const active=dev.state.playing;if(active)dev.stopMicCapture(false);dev.micDeviceId=select.value;dev.captureInputChosen=true;if(active)dev.startMicCapture();});
                document.getElementById('ai-capture-toggle').addEventListener('click',()=>setSourcePlaying(dev,!dev.state.playing));
                for(const channel of ['L','R'])document.getElementById(`ai-gain-${channel}`)?.addEventListener('input',event=>dev.setMicGain(channel,event.target.value));
                document.getElementById('ai-line').addEventListener('input',event=>dev.setAiLine(event.target.value));
                if(dev.type!=='audioInterface2')for(let index=0;index<(dev.type==='audioInterface4'?2:1);index++)document.getElementById(`ai-phones-${index}`).addEventListener('input',event=>dev.setAiPhones(index,event.target.value));
            }
            if(dev.type==='streamIntegrated')bindStreamInspector(dev);
            document.getElementById('inspector-power-toggle')?.addEventListener('click', () => toggleDevicePower(dev));
            if (TURNTABLE_TYPES.has(dev.type)) bindTurntableInspector(dev);
            if (ACTIVE_SPK.has(dev.type) || SUB_TYPES.has(dev.type)) document.getElementById('sp-insp-vol').addEventListener('input', e => dev.setSpeakerVolume(Number(e.target.value) / 100));
            if (['powerStereo','powerVintage'].includes(dev.type)||CUSTOM_POWER_AMPS[dev.type]) ['L','R'].forEach(ch=>document.getElementById('power-gain-'+ch).addEventListener('input',e=>dev.setChannelGain(ch,e.target.value)));
            if (dev.type === 'powerAmp') document.getElementById('sl-poweramp-volume').addEventListener('input', e => dev.setAmplifierVolume(Number(e.target.value)));

            if (dev.type === 'receiver') {
                document.getElementById('sl-balance').addEventListener('input', e => {
                    dev.state.balance = parseFloat(e.target.value);
                    dev.nodes.volR.gain.value = dev.state.volume * (dev.state.balance < 0 ? 1 + dev.state.balance : 1);
                    dev.nodes.volL.gain.value = dev.state.volume * (dev.state.balance > 0 ? 1 - dev.state.balance : 1);
                    document.getElementById('lbl-balance').textContent = Math.abs(dev.state.balance)<.01 ? 'Centro' : `${dev.state.balance<0?'L':'R'} ${Math.round(Math.abs(dev.state.balance)*100)}%`;
                    updateKnobAngle(dev, '[data-receiver-control="balance"]', dev.state.balance, -1, 1);
                });
                document.getElementById('sl-vol').addEventListener('input', e => {
                    dev.state.volume = parseFloat(e.target.value);
                    document.getElementById('lbl-vol').innerText = `${Math.round(dev.state.volume*100)}%`;
                    if(dev.nodes.vol) dev.nodes.vol.gain.value = dev.state.volume * ((dev.state.balance || 0) < 0 ? 1 + dev.state.balance : 1);
                    if(dev.nodes.volL) dev.nodes.volL.gain.value = dev.state.volume * ((dev.state.balance || 0) > 0 ? 1 - dev.state.balance : 1);
                    updateKnobAngle(dev, '[data-receiver-control="volume"]', dev.state.volume, 0, 1);
                });
                document.getElementById('sl-bass').addEventListener('input', e => {
                    dev.state.bass = parseFloat(e.target.value);
                    document.getElementById('lbl-bass').innerText = `${dev.state.bass}dB`;
                    if(dev.nodes.bassR) dev.nodes.bassR.gain.value = dev.state.bass;
                    if(dev.nodes.bassL) dev.nodes.bassL.gain.value = dev.state.bass;
                    updateKnobAngle(dev, '[data-receiver-control="bass"]', dev.state.bass, -15, 15);
                });
                document.getElementById('sl-treble').addEventListener('input', e => {
                    dev.state.treble = parseFloat(e.target.value);
                    document.getElementById('lbl-treble').innerText = `${dev.state.treble}dB`;
                    if(dev.nodes.trebleR) dev.nodes.trebleR.gain.value = dev.state.treble;
                    if(dev.nodes.trebleL) dev.nodes.trebleL.gain.value = dev.state.treble;
                    updateKnobAngle(dev, '[data-receiver-control="treble"]', dev.state.treble, -15, 15);
                });
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                document.getElementById('sl-amp-vol').addEventListener('input', e => {
                    dev.state.volume = parseFloat(e.target.value);
                    document.getElementById('lbl-amp-vol').innerText = `${Math.round(dev.state.volume*100)}%`;
                    if (dev.setPhoneVolume) dev.setPhoneVolume(dev.state.volume);
                    updateKnobAngle(dev, '.amp-volume-knob', dev.state.volume, 0, 1);
                });
            } else if (dev.type === 'headphoneAmp4') {
                for (let i = 0; i < 4; i++) {
                    const slider = document.getElementById(`sl-amp4-${i + 1}`);
                    if (!slider) continue;
                    slider.addEventListener('input', e => {
                        setHeadphoneAmp4Volume(dev, i, Number(e.target.value));
                    });
                }
            } else if (MIXER_TYPES.has(dev.type)) {
                for (let channel = 0; channel < 3; channel++) {
                    const slider = document.getElementById(`sl-mixer-${channel}`);
                    slider?.addEventListener('input', e => setMixerVolume(dev, channel, Number(e.target.value)));
                }
            } else if (EQ_TYPES.has(dev.type)) {
                document.getElementById('sl-eq-level').addEventListener('input', e => dev.setEqLevel(e.target.value));
                for (let i = 0; i < GRAPHIC_EQ_FREQUENCIES.length; i++) {
                    const sl = document.getElementById(`sl-eq-${i}`);
                    if (!sl) continue;
                    sl.addEventListener('input', e => {
                        const val = parseFloat(e.target.value);
                        dev.state.eq[i] = val;
                        document.getElementById(`lbl-eq-${i}`).innerText = `${val > 0 ? '+' : ''}${val}dB`;
                        const onDevice = dev.el.querySelector(`.eq-slider[data-band="${i}"]`);
                        if (onDevice) onDevice.value = val;
                        const lbl = dev.el.querySelector(`.lbl-band-${i}`);
                        if (lbl) lbl.textContent = `${val > 0 ? '+' : ''}${val}dB`;
                        applyEqGains(dev);
                    });
                }
            }
        }
        
        canvas.addEventListener('pointerdown', e => {
            if(e.target === canvas || e.target === world || e.target.id === 'cables-layer') {
                selectCable(null);
                selectDevice(null);
            }
        });

