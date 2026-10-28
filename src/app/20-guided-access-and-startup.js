/* Guided access, assembly examples, and application startup. */
        const tutorialBindings={};
        const tutorialFileSources=new Set(['cdPlayer','tapeDeck','streamer']);
        function tutorialDevice(topic){
            const matches=dev=>topic==='spotify'?TURNTABLE_TYPES.has(dev.type)&&!!dev.spotifyVinyl:topic==='capture'?CAPTURE_INTERFACE_TYPES.has(dev.type):tutorialFileSources.has(dev.type);
            const selected=appState.project.devices[appState.interface.selectedDeviceId];
            let dev=appState.project.devices[tutorialBindings[topic]];
            if(selected&&matches(selected)){dev=selected;tutorialBindings[topic]=dev.id;}
            if(!dev||!matches(dev)){dev=Object.values(appState.project.devices).find(matches);tutorialBindings[topic]=dev?.id;}
            return dev;
        }
        function tutorialCollection(){return Object.values(appState.project.devices).find(dev=>dev.type==='furnitureCoverflow');}
        function tutorialEdges(dev){return appState.project.connections.filter(c=>!c.miswired&&c.outDeviceId===dev?.id).filter(c=>{const out=document.getElementById(c.outId),input=document.getElementById(c.inId);return out&&input&&(!out.dataset.channel||!input.dataset.channel||out.dataset.channel===input.dataset.channel)&&getPortCompatibility(out,input).compatible;});}
        function tutorialStereoTo(dev,target){
            const edges=tutorialEdges(dev).filter(c=>c.inDeviceId===target.id);
            if(edges.some(c=>/Phone|Stereo/.test(document.getElementById(c.outId)?.dataset.node||'')))return true;
            const outs=[...dev.el.querySelectorAll('.port[data-io="out"]')];
            if(outs.some(port=>port.dataset.node==='outL')&&outs.some(port=>port.dataset.node==='outR'))return ['L','R'].every(ch=>edges.some(c=>document.getElementById(c.outId)?.dataset.node==='out'+ch));
            return edges.length>0;
        }
        function tutorialAmplifier(dev){return Object.values(appState.project.devices).find(other=>(POWER_OUTPUT_TYPES.has(other.type)||['headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(other.type))&&tutorialStereoTo(dev,other));}
        function tutorialListeningPath(source){
            const seen=new Set();
            function visit(dev,input){
                if(!dev||seen.has(dev.id))return false;if(isListeningDevice(dev))return true;seen.add(dev.id);
                const found=tutorialEdges(dev).some(c=>{const output=document.getElementById(c.outId);if(input&&!routedInputPorts(dev,output).includes(input))return false;const next=appState.project.devices[c.inDeviceId];if(dev===source&&!/Phone|Stereo/.test(output.dataset.node)&&next&&!tutorialStereoTo(dev,next))return false;return visit(next,document.getElementById(c.inId));});seen.delete(dev.id);return found;
            }
            return visit(source,null);
        }
        const tutorialLevels=dev=>JSON.stringify([dev?.state.micGainL,dev?.state.micGainR,dev?.state.aiLineLevel,dev?.state.aiPhoneLevels]);
        function tutorialInspect(topic,step,context,observations){
            const dev=tutorialDevice(topic),collection=tutorialCollection();let done=false,target=dev?.el;
            const inspectorOpen=compactLayout.matches?document.body.classList.contains('mobile-properties-open'):!document.body.classList.contains('inspector-collapsed');
            const fileKey=dev?.audioBuffer?(dev.mediaKey||dev.fileName+':'+dev.audioBuffer.duration):null;
            if(topic==='mp3'&&fileKey&&dev.state.playing)observations.mp3PlayedKey=fileKey;
            const ready=()=>{
                if(!dev||dev.state.muted||!tutorialListeningPath(dev)||spotifyPathVolume(dev)<=0)return false;
                if(CAPTURE_INTERFACE_TYPES.has(dev.type)){
                    if(dev.state.micGainL<=0&&dev.state.micGainR<=0)return false;
                    return tutorialEdges(dev).some(c=>{const node=document.getElementById(c.outId)?.dataset.node||'';return /^outPhone/.test(node)?dev.state.aiPhoneLevels[Number(node.slice(8)||1)-1]>0:dev.state.aiLineLevel>0;});
                }
                return true;
            };
            if(topic==='basic'){
                if(step==='source')done=!!dev;
                if(step==='properties'){done=!!dev&&appState.interface.selectedDeviceId===dev.id&&inspectorOpen;target=document.getElementById('inspector-title');}
                if(step==='amplifier')done=!!dev&&!!tutorialAmplifier(dev);
                if(step==='output')done=!!dev&&!!tutorialAmplifier(dev)&&tutorialListeningPath(dev);
                if(step==='ready')done=!!dev&&!!tutorialAmplifier(dev)&&ready();
            }else if(topic==='spotify'){
                if(step==='account'){done=!!collection&&SpotifyCoverflow.getPlaybackState().connected;target=document.querySelector('[data-sp-action="connect"]')||collection?.el;}
                if(step==='cover'){done=!!collection&&(!!collection.el.querySelector('.spotify-flow-card.is-open')||[...spotifyAlbums.values()].some(item=>item.open));target=collection?.el;}
                if(step==='vinyl')done=!!dev&&!dev.el.classList.contains('spotify-vinyl-placing');
                if(step==='ready')done=ready();
                if(step==='play'){done=!!dev&&!!dev.state.playing&&!SpotifyCoverflow.getPlaybackState().paused&&ready();target=dev?.el.querySelector('[data-source-play],.at-startstop')||dev?.el;}
            }else if(topic==='capture'){
                if(step==='permission'){done=!!dev&&(!!dev.captureInputLabelsAvailable||!!dev.micStream);target=document.getElementById('ai-authorize-inputs')||target;}
                if(step==='device'){done=!!dev&&(!!dev.captureInputChosen||!!dev.micDeviceId||!!dev.micStream);target=document.getElementById('ai-input-device')?.closest('label')||target;}
                if(step==='capture'){done=!!dev?.micStream&&dev.micStream.getAudioTracks().some(track=>track.readyState==='live');target=document.getElementById('ai-capture-toggle')||target;}
                if(step==='output')done=!!dev?.micStream&&ready();
                if(step==='level'){
                    if(dev&&context.device!==dev.id){context.device=dev.id;context.levels=tutorialLevels(dev);}
                    done=!!dev&&!!dev.micStream&&tutorialLevels(dev)!==context.levels;
                    target=document.getElementById(dev?.type==='audioInterface2'?'ai-line':'ai-gain-L')?.closest('label')||target;
                }
            }else if(topic==='mp3'){
                if(step==='source')done=!!dev;
                if(step==='file'){done=!!dev?.audioBuffer;target=document.getElementById('source-load-audio')||target;}
                if(step==='ready')done=!!dev?.audioBuffer&&ready();
                if(step==='play')done=!!dev?.audioBuffer&&!!dev.state.playing&&ready();
                if(step==='pause')done=!!fileKey&&observations.mp3PlayedKey===fileKey&&!dev.state.playing;
            }
            const exists=topic==='spotify'?(step==='account'||step==='cover'?!!collection:!!dev):!!dev;
            return {done,target:target?.isConnected?target:null,message:exists?'Faça a ação indicada':'Adicione ou selecione o aparelho necessário'};
        }
        async function tutorialLocate(topic,step,action){
            document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));
            const collection=tutorialCollection();let dev=tutorialDevice(topic);
            if(topic==='spotify'&&(step==='account'||step==='cover'))dev=collection;
            const mobilePanel=key=>{if(key==='catalog')return;if(compactLayout.matches){closeMobilePanels();document.body.classList.add('mobile-properties-open');syncMobilePanels();}else openSidebar(key,15000);};
            let requestedType=null;
            if(topic==='basic'&&step==='amplifier'&&dev&&!tutorialAmplifier(dev)){
                const amp=Object.values(appState.project.devices).find(item=>['headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(item.type)||POWER_OUTPUT_TYPES.has(item.type));
                if(amp)dev=amp;else requestedType='headphoneAmp';
            }
            if(topic==='basic'&&step==='output'&&dev&&!tutorialListeningPath(tutorialDevice(topic)))requestedType='headphone';
            if(!dev||requestedType){
                const type=requestedType||(topic==='spotify'?(step==='account'||step==='cover'?'furnitureCoverflow':'turntable'):topic==='capture'?'audioInterface1':'cdPlayer');
                mobilePanel('catalog');const search=document.getElementById('equipment-search');search.value='';search.dispatchEvent(new Event('input'));const card=equipmentCatalog.querySelector(`[data-template="${type}"]`);card?.scrollIntoView({block:'center',behavior:'instant'});await new Promise(resolve=>setTimeout(resolve,320));return card;
            }
            selectDevice(dev.id,true);mobilePanel('properties');
            const selector={permission:'#ai-authorize-inputs',device:'#ai-input-device',capture:'#ai-capture-toggle',file:'#source-load-audio',level:dev.type==='audioInterface2'?'#ai-line':'#ai-gain-L',spotify:'[data-sp-action="connect"]'}[action];
            const native=selector&&inspectorContent.querySelector(selector);
            const control=native?.closest('.app-select')||native;
            if(compactLayout.matches&&phoneNavigationLayout.matches){document.getElementById('inspector').dataset.sheetLevel='mid';}
            await new Promise(resolve=>setTimeout(resolve,320));
            control?.scrollIntoView({block:'center',behavior:'instant'});
            const rect=canvas.getBoundingClientRect();let left=rect.left,right=rect.right,bottom=rect.bottom;
            for(const panel of [equipmentCatalog,document.getElementById('inspector')]){
                const r=panel.getBoundingClientRect();if(r.right<=rect.left||r.left>=rect.right||r.bottom<=rect.top||r.top>=rect.bottom||getComputedStyle(panel).visibility==='hidden')continue;
                if(phoneNavigationLayout.matches&&panel.id==='inspector')bottom=Math.min(bottom,r.top);
                else if(panel.id==='equipment-catalog')left=Math.max(left,r.right);else right=Math.min(right,r.left);
            }
            if(right-left<100){left=rect.left;right=rect.right;}
            if(bottom-rect.top<100)bottom=rect.bottom;
            const x=parseFloat(dev.el.style.left),y=parseFloat(dev.el.style.top),zoom=clampZoom(Math.min(1,(right-left-48)/dev.el.offsetWidth,(bottom-rect.top-48)/dev.el.offsetHeight));
            animateViewTo({zoom,x:(left+right)/2-rect.left-(x+dev.el.offsetWidth/2)*zoom,y:(rect.top+bottom)/2-rect.top-(y+dev.el.offsetHeight/2)*zoom});
            await new Promise(resolve=>setTimeout(resolve,320));
            return control||dev.el;
        }
        function clearExampleHistory(){movementUndo.length=movementRedo.length=0;updateMovementHistoryButtons();}
        function buildExample(spec){
            [...spotifyVinyls.values()].forEach(removeSpotifyVinyl);[...spotifyAlbums.values()].forEach(removeSpotifyAlbum);Object.values(appState.project.devices).forEach(deleteDevice);selectDevice(null);
            appStateStore.actions.setCanvasOption('hideCables',false);cableVisibilityButton.setAttribute('aria-pressed','false');appStateStore.actions.setProjectRestoring(true);
            const add=type=>{const ids=new Set(Object.keys(appState.project.devices));createDevice(type,sceneSideInset(),0);const dev=Object.values(appState.project.devices).find(item=>!ids.has(item.id));if(!dev)throw new Error('Não foi possível criar '+(DEVICE_NAMES[type]||type));return dev;};
            const support=add(spec.furniture),gear=spec.types.map(add),supports=[support],floor=maxEquipmentBottom();
            const place=(dev,x,y)=>{dev.el.style.left=x+'px';dev.el.style.top=y+'px';};
            const leftFloor=spec.floor?.includes(2)?gear[2].el.offsetWidth+64:0;
            let supportX=sceneSideInset()+48+leftFloor;place(support,supportX,floor-support.el.offsetHeight);
            const config=FURNITURE_TYPES[spec.furniture];
            if(spec.shelves){
                gear.forEach((dev,index)=>{
                    const shelf=spec.shelves[index],surface=config.surfaces[shelf],gap=hasStackFeet(dev)?STACK_FEET.height:0;
                    const available=shelf?surface-config.surfaces[shelf-1]-16:Infinity;
                    if(dev.el.offsetHeight+gap>available||dev.el.offsetWidth>support.el.offsetWidth-2*config.inset)throw new Error('O aparelho não cabe no vão do rack.');
                    place(dev,supportX+(support.el.offsetWidth-dev.el.offsetWidth)/2,parseFloat(support.el.style.top)+surface-gap-dev.el.offsetHeight);
                });
            }else{
                let table=support,cursor=supportX+32;
                gear.forEach((dev,index)=>{
                    if(spec.floor?.includes(index))return;
                    const width=dev.el.offsetWidth;
                    if(width>table.el.offsetWidth-64)throw new Error('O aparelho não cabe sobre o móvel.');
                    if(cursor+width>parseFloat(table.el.style.left)+table.el.offsetWidth-32){const x=parseFloat(table.el.style.left)+table.el.offsetWidth+64;table=add('furnitureTable');supports.push(table);place(table,x,floor-table.el.offsetHeight);cursor=x+32;}
                    place(dev,cursor,parseFloat(table.el.style.top)-dev.el.offsetHeight-(hasStackFeet(dev)?STACK_FEET.height:0));cursor+=width+40;
                });
                if(spec.floor){place(gear[2],supportX-gear[2].el.offsetWidth-48,floor-gear[2].el.offsetHeight);place(gear[3],supportX+support.el.offsetWidth+48,floor-gear[3].el.offsetHeight);}
            }
            // Validate geometry and every port before making any connection.
            const all=[...supports,...gear];
            all.forEach(dev=>{const x=parseFloat(dev.el.style.left),y=parseFloat(dev.el.style.top);if(x<sceneSideInset()||y<0||x+dev.el.offsetWidth>world.offsetWidth-sceneSideInset()||y+dev.el.offsetHeight>floor+.5)throw new Error('A montagem não cabe na área disponível.');});
            gear.forEach((a,index)=>gear.slice(index+1).forEach(b=>{const ax=parseFloat(a.el.style.left),ay=parseFloat(a.el.style.top),bx=parseFloat(b.el.style.left),by=parseFloat(b.el.style.top);if(ax<bx+b.el.offsetWidth&&ax+a.el.offsetWidth>bx&&ay<by+b.el.offsetHeight&&ay+a.el.offsetHeight>by)throw new Error('Há equipamentos sobrepostos na montagem.');}));
            spec.links.forEach(([a,out,b,input])=>{const from=gear[a].el.querySelector(`[data-node="${out}"]`),to=gear[b].el.querySelector(`[data-node="${input}"]`);if(!from||!to||!getPortCompatibility(from,to).compatible)throw new Error('Conexão incompatível no exemplo.');});
            spec.links.forEach(([a,out,b,input])=>connectProjectPorts(gear[a],out,gear[b],input));
            updateCables();updateCableFlows();return {gear,supports};
        }
        let exampleAssembly=null;
        const guidedAccess=GuidedAccess.mount({
            closeSettings:()=>{settingsMenu.open=false;},
            layout:()=>{requestAnimationFrame(()=>{stopViewMotion();applyView();});},
            returnFocus:()=>{(phoneNavigationLayout.matches?mobileControls.querySelector('[data-mobile-action="settings"]'):settingsMenu.querySelector('summary'))?.focus({preventScroll:true});},
            enter:(topic,step)=>{const dev=tutorialDevice(topic);return {device:dev?.id,levels:tutorialLevels(dev)};},
            inspect:tutorialInspect,locate:tutorialLocate,clearContext:()=>{document.querySelectorAll('.tutorial-target').forEach(node=>node.classList.remove('tutorial-target'));},
            hasContent:()=>Object.keys(appState.project.devices).length>0||spotifyVinyls.size>0||spotifyAlbums.size>0,
            examples:{
                checkpoint:async()=>{
                    if(!projectDatabase||projectPersistenceBlocked)throw new Error('O armazenamento local não está disponível. Exporte seu projeto e habilite o armazenamento antes de substituir a montagem.');
                    // Let any existing write finish before freezing the scene and its audio blobs.
                    exampleLoading=true;clearTimeout(projectSaveTimer);
                    try{
                        while(projectSaving)await new Promise(resolve=>setTimeout(resolve,20));
                        if(await saveLocalProject(true,true)!==true)throw new Error('Não foi possível guardar a montagem atual.');
                        return {snapshot:projectCapture(),audio:new Map(Object.values(appState.project.devices).filter(dev=>dev.mediaKey&&dev.mediaBlob).map(dev=>[dev.mediaKey,dev.mediaBlob]))};
                    }catch(error){exampleLoading=false;throw error;}
                },
                begin:()=>{stopViewMotion();cancelCableDrag();projectRestoring=true;appStateStore.actions.setProjectRestoring(true);},
                build:spec=>{exampleAssembly=buildExample(spec);},
                validate:spec=>{if(appState.project.connections.length!==spec.links.length||exampleAssembly.gear.some(dev=>dev.state.playing||dev.micStream))throw new Error('A montagem não foi validada.');},
                restore:previous=>restoreLocalProject(previous.snapshot,key=>Promise.resolve(previous.audio.get(key))),
                recoveryFailed:previous=>{projectPersistenceBlocked=true;try{localStorage.setItem('audio-system-project-fallback',JSON.stringify(previous.snapshot));}catch{}},
                end:()=>{appStateStore.actions.setProjectRestoring(false);projectRestoring=false;exampleLoading=false;clearExampleHistory();},
                commit:async()=>{projectRestoring=false;await saveLocalProject(true,true);document.getElementById('fit-canvas').click();selectDevice(exampleAssembly.gear[0].id,true);}
            }
        });
        const guideSetting=document.createElement('section');guideSetting.className='headphone-calibration-setting';
        guideSetting.innerHTML='<strong>Acesso guiado</strong><p>Pratique no seu projeto: conexões, Spotify, entrada externa e MP3.</p><button type="button">Abrir tutorial</button>';
        const examplesSetting=document.createElement('section');examplesSetting.className='headphone-calibration-setting';
        examplesSetting.innerHTML='<strong>Montagens de exemplo</strong><p>Cinco sistemas em móveis. Substitui a montagem atual.</p><button type="button">Escolher montagem</button>';
        clearCatalogFooter.prepend(guideSetting,examplesSetting);guideSetting.querySelector('button').addEventListener('click',guidedAccess.open);examplesSetting.querySelector('button').addEventListener('click',guidedAccess.openExamples);
        headphoneCalibrationDialog.addEventListener('close',()=>{requestAnimationFrame(guidedAccess.offer);});

        SpotifyCoverflow.initialize().catch(()=>{});
        initializeProjectPersistence().finally(()=>{requestAnimationFrame(()=>{document.documentElement.classList.remove('app-starting');document.getElementById('app-startup')?.remove();if(!appState.preferences.headphonePromptSeen)openHeadphoneCalibration();else{guidedAccess.restore();guidedAccess.offer();}});});

        renderVisuals();
