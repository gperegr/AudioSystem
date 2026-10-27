/* Project validation, local persistence, imports, exports, and restore. */
        const PROJECT_FORMAT='audio-system-project',PROJECT_VERSION=1;
        let exampleLoading=false;
        let projectDatabase=null,projectPersistenceBlocked=false,projectRestoring=false,projectSaving=false,projectSaveAgain=false,lastProjectSignature='',knownAudioKeys=new Set();
        const projectTools=document.createElement('section');projectTools.className='project-tools';
        projectTools.innerHTML='<div class="project-file-actions"><button type="button" id="export-project">Exportar projeto</button><button type="button" id="import-project">Abrir projeto</button></div><input id="project-file" type="file" accept=".json,application/json" hidden><span id="project-save-status" class="sr-only" role="status" aria-live="polite"></span>';
        clearCatalogFooter.appendChild(projectTools);
        const projectStatus=(message,error=false)=>{const node=document.getElementById('project-save-status');node.textContent=message;node.classList.toggle('is-error',error);};
        const projectJSON=value=>JSON.parse(JSON.stringify(value),(key,item)=>['__proto__','constructor','prototype'].includes(key)?undefined:item);
        function projectCapture(){
            const devices=Object.values(appState.project.devices).map(dev=>{
                const settings=projectJSON(dev.state);settings.playing=false;if(settings.tt)settings.tt.running=false;
                return {id:dev.id,type:dev.type,x:parseFloat(dev.el.style.left)||0,y:parseFloat(dev.el.style.top)||0,settings,powered:dev.powered,selectedSource:dev.selectedSource,grilleOff:dev.el.classList.contains('grille-off'),pairedId:dev.btPairedId||null,mediaKey:dev.audioBuffer?dev.mediaKey||null:null,fileName:dev.fileName||'',trackTitle:dev.trackTitle||'',position:dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?appState.audio.context.currentTime-dev.demoStartedAt:0)};
            });
            const connections=appState.project.connections.map(c=>{const out=document.getElementById(c.outId),input=document.getElementById(c.inId);return {from:out?.closest('.device-node')?.id,out:out?.dataset.node,to:input?.closest('.device-node')?.id,input:input?.dataset.node,label:c.label||'',color:c.color||null,hidden:!!c.hidden,slack:c.slack??5};});
            const catalogScroll=equipmentCatalog.querySelector('.overflow-y-auto');
            const vinyls=[...spotifyVinyls.values()].map(item=>({id:item.id,uri:item.uri,name:item.name,image:item.image,origin:item.origin,x:item.x,y:item.y,turntableId:item.turntableId}));
            const albums=[...spotifyAlbums.values()].map(item=>({id:item.id,uri:item.uri,name:item.name,image:item.image,origin:item.origin,x:item.x,y:item.y,open:item.open}));
            return {format:PROJECT_FORMAT,version:PROJECT_VERSION,devices,connections,vinyls,albums,view:{...view},world:{width:world.offsetWidth,height:world.offsetHeight},ui:{
                environment:{...(appState.audio.environment||DEFAULT_ROOM_SETTINGS)},
                canvasGrid:appState.canvas.grid||'dots',canvasTheme:appState.canvas.theme||'scene',canvasBackdrop:appState.canvas.backdrop||DEFAULT_BACKDROP,canvasTime:appState.canvas.time||'dusk',
                soundVolume:appState.preferences.uiSoundVolume??DEFAULT_UI_SOUND_VOLUME,hideCables:!!appState.canvas.hideCables,
                selected:[...appState.interface.selectedDeviceIds],selectedCable:appState.project.connections.indexOf(appState.interface.selectedConnection),
                search:document.getElementById('equipment-search').value,catalogScroll:catalogScroll?.scrollTop||0,inspectorScroll:inspectorContent.scrollTop
            }};
        }
        function projectValidate(value){
            if(!value||value.format!==PROJECT_FORMAT||value.version!==PROJECT_VERSION||!Array.isArray(value.devices)||!Array.isArray(value.connections))throw new Error('Arquivo de projeto inválido ou versão incompatível.');
            if(value.devices.length>500||value.connections.length>4000)throw new Error('O projeto excede a quantidade de equipamentos ou cabos suportada.');
            const retiredTypes=new Set(['lightPoint','acousticHorizontal','acousticVertical']);
            const ids=new Set();
            value.devices.forEach(dev=>{
                if(dev&&typeof dev.type==='string'&&dev.type.startsWith('audioInterface')&&!Object.hasOwn(DEVICE_NAMES,dev.type))dev.type='audioInterface1';
                if(dev&&['furnitureRecordOne','furnitureRecordThree'].includes(dev.type))dev.type='furnitureRack';
                if(!dev||typeof dev.id!=='string'||ids.has(dev.id)||(!Object.hasOwn(DEVICE_NAMES,dev.type)&&!retiredTypes.has(dev.type))||!Number.isFinite(dev.x)||!Number.isFinite(dev.y)||dev.x<0||dev.y<0||dev.x>20000||dev.y>20000)throw new Error('O projeto contém um equipamento inválido.');
                ids.add(dev.id);
                if(!dev.settings||typeof dev.settings!=='object'||Array.isArray(dev.settings))throw new Error('Configurações inválidas.');
                for(const key of ['eq','channelVolumes','matrixOutputs'])if(dev.settings[key]!=null&&!Array.isArray(dev.settings[key]))throw new Error('Ajustes de canais inválidos.');
                if(dev.settings.channelGain!=null&&(typeof dev.settings.channelGain!=='object'||Array.isArray(dev.settings.channelGain)))throw new Error('Ganho inválido.');
                if(dev.settings.tt!=null&&(typeof dev.settings.tt!=='object'||Array.isArray(dev.settings.tt)))throw new Error('Ajustes do toca-discos inválidos.');
                if(dev.mediaKey!=null&&typeof dev.mediaKey!=='string')throw new Error('Referência de áudio inválida.');
            });
            value.connections.forEach(c=>{if(!c||!ids.has(c.from)||!ids.has(c.to)||typeof c.out!=='string'||typeof c.input!=='string')throw new Error('O projeto contém uma conexão inválida.');});
            if(value.ui?.selected!=null&&!Array.isArray(value.ui.selected))throw new Error('Seleção inválida.');
            return value;
        }
        function openProjectDatabase(){
            return new Promise((resolve,reject)=>{
                if(!window.indexedDB){reject(new Error('Armazenamento de áudio indisponível.'));return;}
                const request=indexedDB.open('audio-system-local-project',1);
                request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects');if(!db.objectStoreNames.contains('audio'))db.createObjectStore('audio');};
                request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Feche outras abas deste programa e tente novamente.'));
            });
        }
        const dbRead=(store,key)=>new Promise((resolve,reject)=>{const request=projectDatabase.transaction(store).objectStore(store).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
        const dbKeys=()=>new Promise((resolve,reject)=>{const request=projectDatabase.transaction('audio').objectStore('audio').getAllKeys();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
        async function saveLocalProject(force=false,exampleCommit=false){
            if(projectRestoring||projectPersistenceBlocked||(exampleLoading&&!exampleCommit))return;
            if(projectSaving){projectSaveAgain=true;return;}
            if(!force&&(isPatching||document.querySelector('.equipment-dragging')))return;
            const snapshot=projectCapture(),signature=JSON.stringify(snapshot);
            snapshot.savedAt=Date.now();
            if(!force&&signature===lastProjectSignature)return;
            projectSaving=true;projectStatus('Salvando neste navegador…');
            try{
                if(!projectDatabase)throw new Error('Banco local indisponível.');
                const used=new Set(snapshot.devices.map(dev=>dev.mediaKey).filter(Boolean));
                const media=new Map(Object.values(appState.project.devices).filter(dev=>dev.mediaBlob&&dev.mediaKey).map(dev=>[dev.mediaKey,dev.mediaBlob]));
                await new Promise((resolve,reject)=>{
                    const transaction=projectDatabase.transaction(['projects','audio'],'readwrite'),audio=transaction.objectStore('audio');
                    transaction.objectStore('projects').put(snapshot,'current');
                    media.forEach((blob,key)=>{if(used.has(key)&&!knownAudioKeys.has(key))audio.put(blob,key);});
                    knownAudioKeys.forEach(key=>{if(!used.has(key))audio.delete(key);});
                    transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('Salvamento cancelado.'));
                });
                knownAudioKeys=used;lastProjectSignature=signature;
                try{localStorage.setItem('audio-system-project-fallback',JSON.stringify(snapshot));}catch{}
                projectStatus('Salvo neste navegador · músicas incluídas');return true;
            }catch(error){
                if(exampleCommit)throw error;
                try{localStorage.setItem('audio-system-project-fallback',JSON.stringify(snapshot));projectStatus('Configurações salvas; áudio não confirmado. Exporte uma cópia.',true);}catch{projectStatus('Não foi possível salvar. Exporte o projeto para não perder a montagem.',true);}
            }finally{projectSaving=false;if(projectSaveAgain){projectSaveAgain=false;saveLocalProject();}}
        }
        function applySavedDevice(dev,saved){
            const clean=projectJSON(saved.settings||{}),tt=clean.tt;delete clean.tt;
            clean.damage=['speaker-level-overload','speaker-thermal-overload'].includes(clean.damage?.kind)?{kind:clean.damage.kind}:null;
            Object.assign(dev.state,clean);dev.state.playing=false;
            if(AudioAdapterDesign.models[dev.type])AudioAdapterDesign.layout(dev.el,dev.type,dev.state.adapterRotation=AudioAdapterDesign.angle(dev.state.adapterRotation));
            if(CAPTURE_INTERFACE_TYPES.has(dev.type)){
                for(const channel of ['L','R'])dev.setMicGain(channel,dev.state['micGain'+channel]);
                dev.setAiLine(dev.state.aiLineLevel??.8);
                const savedPhones=dev.state.aiPhoneLevels||[.75,.75];
                savedPhones.forEach((value,index)=>{if(index<(dev.type==='audioInterface4'?2:1))dev.setAiPhones(index,value);});
            }            if(dev.type==='pendantLamp'||WALL_LAMP_TYPES[dev.type])return;
            if(tt&&dev.state.tt)Object.assign(dev.state.tt,tt,{running:false});
            const s=dev.state,clamp=(number,min,max,fallback)=>typeof number==='number'&&Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
            updateKubaAppearance(dev);
            s.volume=clamp(s.volume,0,1,.8);s.bass=clamp(s.bass,-15,15,0);s.treble=clamp(s.treble,-15,15,0);s.balance=clamp(s.balance,-1,1,0);
            if(dev.syncRadio){s.receiverInput=RECEIVER_INPUTS.some(([key])=>key===s.receiverInput)?s.receiverInput:'line1';s.radioOn=s.receiverInput==='fm';s.radioFrequency=Math.round(clamp(s.radioFrequency,87.5,108,88)*10)/10;s.radioStation=snapFmStation(clamp(s.radioStation,89,106,98));if(s.radioOn){s.receiverInput='line1';s.radioOn=false;}dev.syncRadio();}
            if(dev.setPhoneVolume)dev.setPhoneVolume(s.volume);
            if(dev.setAmplifierVolume)dev.setAmplifierVolume(s.volume);
            if(dev.setSpeakerVolume)dev.setSpeakerVolume(s.volume);
            if(dev.setChannelGain)['L','R'].forEach(ch=>dev.setChannelGain(ch,clamp(s.channelGain?.[ch],0,1,DEFAULT_POWER_GAIN)));
            if(MIXER_TYPES.has(dev.type))Array.from({length:3},(_,i)=>setMixerVolume(dev,i,clamp(s.channelVolumes?.[i],0,1,.8)));
            if(dev.type==='headphoneAmp4')Array.from({length:4},(_,i)=>setHeadphoneAmp4Volume(dev,i,clamp(s.channelVolumes?.[i],0,1,.8)));
            if(EQ_TYPES.has(dev.type)){
                s.eq=GRAPHIC_EQ_FREQUENCIES.map((_,i)=>clamp(s.eq?.[i],-12,12,0));applyEqGains(dev);dev.setEqLevel(clamp(s.eqLevel,0,1,1));
                dev.el.querySelectorAll('[data-band]').forEach(slider=>{const index=Number(slider.dataset.band);slider.value=s.eq[index];slider.title=`${GRAPHIC_EQ_FREQUENCIES[index]} Hz · ${s.eq[index]} dB`;});
            }
            if(dev.type==='receiver'){
                dev.nodes.volR.gain.value=s.volume*(s.balance<0?1+s.balance:1);dev.nodes.volL.gain.value=s.volume*(s.balance>0?1-s.balance:1);
                ['L','R'].forEach(ch=>{dev.nodes['bass'+ch].gain.value=s.bass;dev.nodes['treble'+ch].gain.value=s.treble;});
                ['volume','bass','treble','balance'].forEach(key=>updateKnobAngle(dev,`[data-receiver-control="${key}"]`,s[key],key==='volume'?0:key==='balance'?-1:-15,key==='volume'||key==='balance'?1:15));
                s.finish='vintage';dev.el.classList.remove('receiver-modern');
            }
            if(TURNTABLE_TYPES.has(dev.type)){dev.restoreLinear?.();dev.ttSetPitch(clamp(s.tt.pitch,-1,1,0));dev.ttSetOutput(s.tt.output==='phono'?'phono':'line');dev.refreshTurntable();}
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))configureSignalGenerator(dev);
            if(dev.applyPreamp){s.preSource=clamp(s.preSource,1,4,1);dev.applyPreamp();}
            if(dev.applyTapeSettings){s.tapeVolume=clamp(s.tapeVolume,0,1,.8);s.tapeHiss=clamp(s.tapeHiss,0,100,35);s.tapeWow=clamp(s.tapeWow,1,100,35);dev.applyTapeSettings();}
            dev.applyStream?.();
            if(dev.updateMatrix)dev.updateMatrix();
            if(SELECTOR_TYPES.has(dev.type)){const source=saved.selectedSource==='B'?'B':'A';dev.el.querySelector(`[data-switch-source="${source}"]`)?.click();}
            updateBenchAppearance(dev);
            if(FURNITURE_TYPES[dev.type]){s.material=furnitureMaterialFor(dev.type,s.material);dev.el.dataset.material=s.material;if(FURNITURE_TYPES[dev.type].back){s.hasBack=true;dev.el.dataset.back='true';}}
            dev.refreshCoverflow?.();
            if(controlAmpConfig(dev.type)){s.integratedSource=clamp(s.integratedSource,0,3,0);s.integratedSource=Math.round(s.integratedSource);s.direct=!!s.direct;s.subLevel=clamp(s.subLevel,0,1,.8);s.subFrequency=clamp(s.subFrequency,40,200,80);s.preMuted=!!s.preMuted;s.preMono=!!s.preMono;s.preInvert=!!s.preInvert;dev.applyIntegrated();}
            dev.setLidOpen?.(!!dev.state.lidOpen);
            dev.setTrayOpen?.(!!dev.state.trayOpen);
            dev.el.classList.toggle('grille-off',!!saved.grilleOff);dev.el.querySelector('.speaker-grille')?.setAttribute('aria-label',saved.grilleOff?'Recolocar tela da caixa':'Remover tela da caixa');
            if((saved.powered===false||dev.state.damage)&&dev.powered)toggleDevicePower(dev);
            dev.el.classList.toggle('device-damaged',!!dev.state.damage);
            Hardware.sync(dev);
        }
        async function restoreLocalProject(snapshot,mediaReader){
            projectValidate(snapshot);projectRestoring=true;appStateStore.actions.setProjectRestoring(true);
            const shield=document.createElement('div');shield.className='project-restore-shield';shield.textContent='Restaurando montagem local…';document.body.appendChild(shield);
            const ids=new Map(),restored=[],warnings=[];
            try{
                stopViewMotion();cancelCableDrag();spotifyPlayingTurntable=null;SpotifyCoverflow.setPlaybackVolume(0).catch(()=>{});SpotifyCoverflow.pauseAlbum().catch(()=>{});spotifyVinyls.forEach(item=>item.el.remove());spotifyVinyls.clear();spotifyAlbums.forEach(item=>item.el.remove());spotifyAlbums.clear();refreshSpotifyVinyls();refreshSpotifyAlbums();Object.values(appState.project.devices).forEach(deleteDevice);
                world.style.removeProperty('min-width');world.style.removeProperty('min-height');
                const ui=snapshot.ui||{};setCanvasTheme(ui.canvasTheme);setCanvasGrid(ui.canvasGrid);setCanvasTime(ui.canvasTime||(ui.canvasBackdrop==='night'?'night':'dusk'));setCanvasBackdrop(ui.canvasBackdrop);
                for(const saved of snapshot.devices){
                    if(!DEVICE_NAMES[saved.type]||['lightPoint','acousticHorizontal','acousticVertical'].includes(saved.type))continue; // Discard unknown or retired items from older projects.
                    const before=new Set(Object.keys(appState.project.devices));createDevice(saved.type,Math.min(saved.x,world.offsetWidth-150),Math.min(saved.y,maxEquipmentBottom()-150));
                    const dev=Object.values(appState.project.devices).find(item=>!before.has(item.id));if(!dev)throw new Error('Não foi possível restaurar um equipamento.');
                    if(AudioAdapterDesign.models[dev.type])AudioAdapterDesign.layout(dev.el,dev.type,saved.settings?.adapterRotation);
                    ids.set(saved.id,dev.id);restored.push([saved,dev]);
                    const inset=sceneSideInset(),bottom=WALL_LAMP_TYPES[dev.type]?wallPlacementBottom():maxEquipmentBottom();
                    if(saved.x>=inset&&saved.x+dev.el.offsetWidth<=world.offsetWidth-inset)dev.el.style.left=`${saved.x}px`;
                    if(saved.y>=0){
                        const oldFloorBottom=world.offsetHeight-196;
                        const legacyHeight=dev.type==='turntableLinear'?252:TURNTABLE_TYPES.has(dev.type)?dev.el.offsetHeight+8:dev.el.offsetHeight;
                        const legacyY=saved.y+Math.max(0,legacyHeight-dev.el.offsetHeight);
                        const targetY=canvas.dataset.theme==='scene'&&Math.abs(saved.y+legacyHeight-oldFloorBottom)<1?bottom-dev.el.offsetHeight:legacyY;
                        dev.el.style.top=`${Math.max(0,Math.min(bottom-dev.el.offsetHeight,targetY))}px`;
                    }
                    applySavedDevice(dev,saved);
                    dev.fileName=typeof saved.fileName==='string'?saved.fileName:'';dev.trackTitle=typeof saved.trackTitle==='string'?saved.trackTitle:'';
                    if(saved.mediaKey){
                        try{const blob=await mediaReader(saved.mediaKey);if(!(blob instanceof Blob))throw new Error('Arquivo de áudio ausente.');const bytes=await blob.arrayBuffer(),metadata=dev.type==='streamIntegrated'?readStreamMetadata(bytes):null;dev.audioBuffer=await appState.audio.context.decodeAudioData(bytes);dev.mediaBlob=blob;dev.mediaKey=saved.mediaKey;dev.fileOffset=Math.max(0,Math.min(Number(saved.position)||0,dev.audioBuffer.duration));if(metadata)dev.setStreamMetadata(metadata);}
                        catch(error){warnings.push(dev.fileName||DEVICE_NAMES[dev.type]);dev.fileMessage='Não foi possível restaurar a música. Carregue o arquivo novamente.';}
                    }else dev.demoOffset=Math.max(0,Number(saved.position)||0);
                    refreshCdDisplay(dev);
                }
                const links=[];
                snapshot.connections.forEach(saved=>{
                    const from=appState.project.devices[ids.get(saved.from)],to=appState.project.devices[ids.get(saved.to)];
                    const output=from?.el.querySelector(`[data-node="${CSS.escape(saved.out)}"]`),input=to?.el.querySelector(`[data-node="${CSS.escape(saved.input)}"]`);
                    if(!output||!input||isPortOccupied(output)||isPortOccupied(input)||!getPortCompatibility(output,input).compatible){warnings.push('conexão incompatível');links.push(null);return;}
                    connectProjectPorts(from,saved.out,to,saved.input);const connection=appState.project.connections.at(-1);
                    connection.label=typeof saved.label==='string'?saved.label.slice(0,60):'';connection.color=/^#[0-9a-f]{6}$/i.test(saved.color||'')?saved.color:undefined;connection.hidden=!!saved.hidden;connection.slack=Number.isFinite(saved.slack)?Math.max(0,Math.min(10,Math.round(saved.slack))):5;links.push(connection);
                });
                restored.forEach(([saved,dev])=>{const other=appState.project.devices[ids.get(saved.pairedId)];if(other&&BT_TX_TYPES.has(dev.type)&&canPair(dev,other))pairDevices(dev,other);});
                for(const record of Array.isArray(snapshot.vinyls)?snapshot.vinyls.slice(0,200):[]){const item=createSpotifyVinyl({...record,origin:ids.get(record.origin)||null});const platter=appState.project.devices[ids.get(record.turntableId)];if(item&&platter&&TURNTABLE_TYPES.has(platter.type))placeSpotifyVinyl(item,platter,false);}
                for(const record of Array.isArray(snapshot.albums)?snapshot.albums.slice(0,200):[])createSpotifyAlbum({...record,origin:ids.get(record.origin)||null});
                setRoomSettings(ui.environment);
                cableVisibilityButton.setAttribute('aria-pressed',String(!!ui.hideCables));
                appStateStore.actions.setPreference('uiSoundVolume',typeof ui.soundVolume==='number'?Math.max(0,Math.min(1,ui.soundVolume)):DEFAULT_UI_SOUND_VOLUME);appStateStore.actions.setCanvasOption('hideCables',!!ui.hideCables);
                const sound=document.getElementById('ui-sound-volume');sound.value=Math.round(appState.preferences.uiSoundVolume*100);document.getElementById('ui-sound-value').textContent=appState.preferences.uiSoundVolume?`${sound.value}%`:'desligados';uiEffectsGain?.gain.setValueAtTime(interactionGain(appState.preferences.uiSoundVolume),appState.audio.context.currentTime);
                const search=document.getElementById('equipment-search');search.value=typeof ui.search==='string'?ui.search:'';search.dispatchEvent(new Event('input'));
                if(snapshot.view&&snapshot.devices.length){view.zoom=clampZoom(Number(snapshot.view.zoom)||1);view.x=Number(snapshot.view.x)||0;view.y=Number(snapshot.view.y)||0;}
                else view.y=Math.min(0,canvas.clientHeight-world.offsetHeight*view.zoom);
                applyView();
                setDeviceSelection((ui.selected||[]).map(id=>ids.get(id)).filter(Boolean));if(links[ui.selectedCable])selectCable(links[ui.selectedCable]);else selectCable(null);
                const scroll=equipmentCatalog.querySelector('.overflow-y-auto');if(scroll)scroll.scrollTop=Number(ui.catalogScroll)||0;inspectorContent.scrollTop=Number(ui.inspectorScroll)||0;
                updateCables();updateCableFlows();
                return warnings;
            }finally{shield.remove();appStateStore.actions.setProjectRestoring(false);projectRestoring=false;}
        }
        const readBlobDataURL=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
        document.getElementById('export-project').onclick=async()=>{
            const button=document.getElementById('export-project');button.disabled=true;
            try{
                await saveLocalProject(true);const snapshot=projectCapture(),embeddedAudio={};
                for(const dev of Object.values(appState.project.devices)){if(dev.mediaKey&&dev.mediaBlob)embeddedAudio[dev.mediaKey]=await readBlobDataURL(dev.mediaBlob);}
                const url=URL.createObjectURL(new Blob([JSON.stringify({...snapshot,embeddedAudio})],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='audio-system-projeto.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);projectStatus('Cópia exportada com os arquivos de áudio.');
            }catch(error){projectStatus('Não foi possível exportar: '+error.message,true);}finally{button.disabled=false;}
        };
        document.getElementById('import-project').onclick=()=>document.getElementById('project-file').click();
        document.getElementById('project-file').onchange=async event=>{
            const file=event.target.files[0];if(!file)return;
            const previous=projectCapture(),previousAudio=new Map(Object.values(appState.project.devices).filter(dev=>dev.mediaKey&&dev.mediaBlob).map(dev=>[dev.mediaKey,dev.mediaBlob]));let replacing=false;
            try{
                if(file.size>400*1024*1024)throw new Error('Arquivo de projeto muito grande.');
                const snapshot=projectValidate(JSON.parse(await file.text(),(key,value)=>['__proto__','constructor','prototype'].includes(key)?undefined:value));
                const audio=new Map();for(const [key,data] of Object.entries(snapshot.embeddedAudio||{})){
                    if(typeof data!=='string'||!/^data:[^,]*;base64,/.test(data))throw new Error('Áudio incorporado inválido.');
                    const base64=data.slice(data.indexOf(',')+1),binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<bytes.length;i++)bytes[i]=binary.charCodeAt(i);audio.set(key,new Blob([bytes]));
                }
                replacing=true;const warnings=await restoreLocalProject(snapshot,key=>Promise.resolve(audio.get(key)));projectPersistenceBlocked=false;await saveLocalProject(true);if(warnings.length)projectStatus('Projeto aberto; alguns áudios ou cabos precisam de revisão.',true);
            }catch(error){if(replacing){try{await restoreLocalProject(previous,key=>Promise.resolve(previousAudio.get(key)));}catch{projectPersistenceBlocked=true;}}projectStatus('Não foi possível abrir: '+error.message,true);}finally{event.target.value='';}
        };
        let projectSaveTimer;
        function scheduleProjectSave(){if(projectRestoring)return;clearTimeout(projectSaveTimer);projectSaveTimer=setTimeout(()=>saveLocalProject(),350);}
        ['pointerup','input','change','click','keyup'].forEach(type=>document.addEventListener(type,scheduleProjectSave,{capture:true,passive:true}));
        setInterval(()=>saveLocalProject(),2500);
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveLocalProject(true);});
        window.addEventListener('pagehide',()=>{if(projectRestoring||projectPersistenceBlocked||exampleLoading)return;try{localStorage.setItem('audio-system-project-fallback',JSON.stringify({...projectCapture(),savedAt:Date.now()}));}catch{}saveLocalProject(true);});
        async function initializeProjectPersistence(){
            projectRestoring=true;
            const initialShield=document.createElement('div');initialShield.className='project-restore-shield';initialShield.textContent='Abrindo projeto local…';document.body.appendChild(initialShield);
            try{
                try{projectDatabase=await openProjectDatabase();knownAudioKeys=new Set(await dbKeys());}catch{}
                let snapshot=null;try{if(projectDatabase)snapshot=await dbRead('projects','current');}catch{}
                try{const raw=localStorage.getItem('audio-system-project-fallback'),backup=raw?JSON.parse(raw):null;if(backup&&(!snapshot||(backup.savedAt||0)>(snapshot.savedAt||0)))snapshot=backup;}catch{}
                if(snapshot){const warnings=await restoreLocalProject(snapshot,key=>projectDatabase?dbRead('audio',key):Promise.resolve(null));setOpeningView();applyView();projectStatus(warnings.length?'Montagem restaurada; alguns áudios ou cabos precisam de revisão.':'Montagem restaurada · fontes pausadas',!!warnings.length);}
                else projectStatus(projectDatabase?'Salvamento automático local ativado.':'Armazenamento limitado; exporte uma cópia do projeto.',!projectDatabase);
                lastProjectSignature=JSON.stringify(projectCapture());
            }catch(error){projectPersistenceBlocked=true;projectStatus('Falha ao restaurar o projeto local. Você pode abrir uma cópia exportada.',true);}
            finally{initialShield.remove();projectRestoring=false;appStateStore.actions.setProjectRestoring(false);}
        }
