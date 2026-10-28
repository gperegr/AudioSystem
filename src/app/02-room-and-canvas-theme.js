/* Room scene, backdrop, time-of-day, and canvas theme behavior. */
        const ROOM_SIDE_INSET=202;
        const ROOM_FLOOR_OVERLAP=220;
        const ROOM_HORIZON_IMAGE_Y=550;
        const wallPlacementBottom=()=>world.offsetHeight-450;
        const floorPlacementBottom=()=>Math.floor((world.offsetHeight-ROOM_FLOOR_OVERLAP)/Hardware.sizes.grid)*Hardware.sizes.grid;
        document.documentElement.classList.add('lighting-demo-enabled');
        const roomBackdrop=document.createElement('div');roomBackdrop.id='room-backdrop';roomBackdrop.setAttribute('aria-hidden','true');
        roomBackdrop.innerHTML='<img class="room-scene-image room-layer-far is-visible" alt="" decoding="async" draggable="false"><i class="room-grid-overlay"></i>';
        const roomMotes=document.createElement('div');roomMotes.className='room-motes';roomMotes.setAttribute('aria-hidden','true');
        const roomMoteCanvas=document.createElement('canvas');roomMoteCanvas.className='room-mote-canvas';roomMoteCanvas.setAttribute('aria-hidden','true');
        const roomMoteContext=roomMoteCanvas.getContext('2d',{alpha:true});
        let roomMoteBeams=[],roomMoteFrame=0,roomMoteTimer=0;
        roomBackdrop.appendChild(roomMotes);
        world.style.setProperty('--room-image-drop','260px');
        world.prepend(roomBackdrop);
        canvas.appendChild(roomMoteCanvas);
        const wallLampLayer=document.createElement('div');wallLampLayer.className='room-wall-lamps';
        world.appendChild(wallLampLayer);
        const floorShadows=document.createElement('canvas');floorShadows.className='room-floor-shadows';floorShadows.setAttribute('aria-hidden','true');
        world.insertBefore(floorShadows,document.getElementById('cables-layer'));
        canvas.appendChild(document.getElementById('connection-guidance'));
        const canvasThemes={light:'Claro',graphite:'Grafite',midnight:'Azul noturno',sepia:'Sépia',scene:'Cenário'};
        const canvasThemeControl=document.createElement('label');canvasThemeControl.className='canvas-theme-control';
        canvasThemeControl.innerHTML='<span>Fundo</span><select id="canvas-theme" aria-label="Cor do fundo do canvas">'+Object.entries(canvasThemes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        document.querySelector('.canvas-tools').appendChild(canvasThemeControl);
        function syncInterfacePalette(){
            const state=appState.canvas,root=document.documentElement;
            root.dataset.uiPalette=state.theme==='scene'?`scene-${state.backdrop||'studioIllustrated'}-${state.time||'dusk'}`:state.theme;
        }
        function setCanvasTheme(theme){
            theme=Object.hasOwn(canvasThemes,theme)?theme:'scene';appStateStore.actions.setCanvasTheme(theme);canvas.dataset.theme=theme;syncInterfacePalette();
            if(theme==='scene')startRoomMotes();else stopRoomMotes();
            if(theme==='scene')Object.values(appState.project.devices).forEach(dev=>{
                dev.el.style.left=Math.max(ROOM_SIDE_INSET,Math.min(world.offsetWidth-dev.el.offsetWidth-ROOM_SIDE_INSET,dev.el.offsetLeft))+'px';
                dev.el.style.top=Math.max(0,Math.min((dev.el.classList.contains('wall-lamp-node')?wallPlacementBottom():floorPlacementBottom())-dev.el.offsetHeight,dev.el.offsetTop))+'px';
            });
            document.querySelector('.canvas-tools').dataset.theme=theme;
            document.getElementById('canvas-theme').value=theme;
            document.getElementById('canvas-backdrop')?.closest('label')?.toggleAttribute('hidden',theme!=='scene');
            document.getElementById('canvas-time')?.closest('label')?.toggleAttribute('hidden',theme!=='scene');
            Hardware.updateLightingDemo();
        }
        document.getElementById('canvas-theme').addEventListener('change',event=>{setCanvasTheme(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        setCanvasTheme(savedAppPreferences.theme||'scene');
        const canvasGridModes={dots:'Pontos',lines:'Linhas',hidden:'Invisível'};
        const canvasGridControl=document.createElement('label');canvasGridControl.className='canvas-theme-control';
        canvasGridControl.innerHTML='<span>Grade</span><select id="canvas-grid" aria-label="Visual da grade">'+Object.entries(canvasGridModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        function setCanvasGrid(mode){
            mode=Object.hasOwn(canvasGridModes,mode)?mode:'dots';appStateStore.actions.setCanvasGrid(mode);canvas.dataset.grid=mode;canvasGridControl.querySelector('select').value=mode;
        }
        canvasGridControl.querySelector('select').addEventListener('change',event=>{setCanvasGrid(event.target.value);scheduleProjectSave();scheduleAppPreferencesSave();});
        setCanvasGrid(savedAppPreferences.grid||'dots');
        const canvasBackdropModes={studioIllustrated:'Estúdio',listeningIllustrated:'Sala de audição',loftIllustrated:'Loft industrial'};
        const legacyBackdrops={library:'listeningIllustrated',night:'loftIllustrated',loftPhoto:'loftIllustrated',studio:'studioIllustrated',listening:'listeningIllustrated',loft:'loftIllustrated'};
        const canvasTimeModes={dawn:'Nascer do dia',dusk:'Fim de tarde',night:'Noite'};
        const canvasBackdropControl=document.createElement('label');canvasBackdropControl.className='canvas-theme-control';
        canvasBackdropControl.innerHTML='<span>Cenário</span><select id="canvas-backdrop" aria-label="Cenário de fundo">'+Object.entries(canvasBackdropModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        const canvasTimeControl=document.createElement('label');canvasTimeControl.className='canvas-theme-control';
        canvasTimeControl.innerHTML='<span>Hora do dia</span><select id="canvas-time" aria-label="Hora do dia">'+Object.entries(canvasTimeModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        let roomImageRequest=0,roomImageTarget='',roomBackdropTransitionTimer=0;
        function beginRoomBackdropTransition(){
            if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
            roomBackdrop.classList.add('is-changing');
            clearTimeout(roomBackdropTransitionTimer);
            roomBackdropTransitionTimer=setTimeout(()=>{roomBackdropTransitionTimer=0;roomBackdrop.classList.remove('is-changing');},900);
        }
        function positionRoomImage(image,horizon){
            const imageHorizon=Number.isFinite(horizon)?horizon:Number(image.dataset.roomHorizon);
            if(!Number.isFinite(imageHorizon))return;
            image.dataset.roomHorizon=String(imageHorizon);
            const farScale=parseFloat(world.style.getPropertyValue('--room-far-scale'))||1;
            image.style.setProperty('--room-horizon-shift',((ROOM_HORIZON_IMAGE_Y-imageHorizon)*world.offsetHeight*1.1/720*farScale).toFixed(1)+'px');
        }
        function showRoomImage(src,horizon=ROOM_HORIZON_IMAGE_Y){
            if(src===roomImageTarget){roomBackdrop.querySelectorAll('.room-scene-image').forEach(image=>positionRoomImage(image,horizon));return;}
            roomImageTarget=src;
            const request=++roomImageRequest,images=[...roomBackdrop.querySelectorAll('.room-scene-image')];
            if(!images[0].getAttribute('src')||appState.project.restoringProject||matchMedia('(prefers-reduced-motion: reduce)').matches){
                images.slice(1).forEach(image=>image.remove());
                positionRoomImage(images[0],horizon);
                images[0].src=src;images[0].classList.add('is-visible');
                return;
            }
            const next=document.createElement('img');
            next.className='room-scene-image room-layer-far';next.alt='';next.loading='eager';next.decoding='async';next.draggable=false;
            next.src=src;
            positionRoomImage(next,horizon);
            next.decode().then(()=>{
                if(request!==roomImageRequest)return;
                const previous=[...roomBackdrop.querySelectorAll('.room-scene-image')];
                roomBackdrop.insertBefore(next,roomBackdrop.querySelector('.room-grid-overlay'));
                void next.offsetWidth;
                // Start the transition clock only after decode; slow decoding must not
                // shorten the fade or remove the previous image before the new one settles.
                beginRoomBackdropTransition();
                requestAnimationFrame(()=>{
                    if(request!==roomImageRequest){next.remove();return;}
                    previous.forEach(image=>image.classList.remove('is-visible'));
                    next.classList.add('is-visible');
                    setTimeout(()=>previous.forEach(image=>image.remove()),1050);
                });
            }).catch(()=>{});
        }
        function updateRoomMotes(mode,time){
            const daylight=time==='dawn';
            const dusk=time==='dusk';
            roomMoteBeams=RoomScenes.lights(mode,time).map((light,index)=>{
                const count=Math.round((dusk?28:daylight?24:12)*appState.preferences.roomParticleAmount/25);
                const x=(240+light.cx*.8)/24,y=mode.startsWith('listening')?36:mode.startsWith('studio')?34:33;
                const width=Math.min(32,Math.max(15,light.w*.8/24));
                const color=light.rgb.join(' ');
                const strength=Math.min(1,light.strength*(daylight?1.15:time==='night'?.28:.8));
                const particles=Array.from({length:count},(_,particle)=>{
                    const seed=index*37+particle*17;
                    const px=12+(seed*43)%76,py=9+(seed*29)%82;
                    const size=dusk?(particle%7===0?7:particle%3===0?5:3.5):daylight?(particle%7===0?5:particle%3===0?3.5:2.5):(particle%7===0?3.5:2);
                    const duration=(11+seed%9)*(dusk?.75:1);
                    return {x:px/100,y:py/100,size,duration:duration*1000,delay:(seed%41)*430,drift:(seed%2?-1:1)*(13+seed%19)};
                });
                return {x:x/100,y:y/100,width:width/100,rgb:color,strength,particles};
            });
            startRoomMotes();
        }
        function stopRoomMotes(){cancelAnimationFrame(roomMoteFrame);clearTimeout(roomMoteTimer);roomMoteFrame=0;roomMoteTimer=0;}
        function startRoomMotes(){if(!roomMoteFrame&&!roomMoteTimer&&document.visibilityState==='visible'&&canvas.dataset.theme==='scene')roomMoteFrame=requestAnimationFrame(drawRoomMotes);}
        function drawRoomMotes(now){
            roomMoteFrame=0;
            if(document.visibilityState!=='visible'||canvas.dataset.theme!=='scene')return;
            const width=canvas.clientWidth,height=canvas.clientHeight,resolution=.8;
            if(width&&height){
                const pixelWidth=Math.round(width*resolution),pixelHeight=Math.round(height*resolution);
                if(roomMoteCanvas.width!==pixelWidth||roomMoteCanvas.height!==pixelHeight){roomMoteCanvas.width=pixelWidth;roomMoteCanvas.height=pixelHeight;}
                const ctx=roomMoteContext;ctx.setTransform(resolution,0,0,resolution,0,0);ctx.clearRect(0,0,width,height);
                const moteBounds=roomMotes.getBoundingClientRect(),canvasBounds=canvas.getBoundingClientRect();
                const sceneWidth=roomMotes.clientWidth,sceneHeight=roomMotes.clientHeight,sceneZoom=moteBounds.width/sceneWidth;
                const offsetX=moteBounds.left-canvasBounds.left,offsetY=moteBounds.top-canvasBounds.top;
                const read=name=>parseFloat(world.style.getPropertyValue(name))||0;
                const farX=read('--room-far-x'),farY=read('--room-far-y'),drop=read('--room-image-drop'),horizon=read('--room-horizon-shift'),scale=read('--room-far-scale')||1;
                const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
                roomMoteBeams.forEach(beam=>{
                    const beamWidth=sceneWidth*beam.width*scale,beamHeight=sceneHeight*.30*scale;
                    const left=offsetX+(sceneWidth*beam.x+farX-beamWidth/2)*sceneZoom,top=offsetY+(sceneHeight*beam.y+farY+drop+horizon)*sceneZoom;
                    ctx.fillStyle=`rgb(${beam.rgb.replaceAll(' ', ',')})`;
                    beam.particles.forEach(particle=>{
                        const phase=reduced?.5:(now+particle.delay)%(particle.duration*2)/particle.duration;
                        const progress=reduced?.5:phase<=1?phase:2-phase;
                        const eased=(1-Math.cos(Math.PI*progress))/2;
                        const alpha=reduced?.38:progress<.24?progress/.24*.72:progress<.78?.72-(progress-.24)/.54*.26:(1-progress)/.22*.46;
                        const localX=particle.x+particle.drift*eased/beamWidth,localY=particle.y+(15-60*eased)/beamHeight;
                        const falloff=Math.max(0,1-Math.hypot((localX-.5)/.65,(localY-.25)/.95));
                        if(!falloff)return;
                        ctx.globalAlpha=beam.strength*.7*alpha*falloff;
                        const x=left+beamWidth*localX*sceneZoom,y=top+beamHeight*localY*sceneZoom,radius=particle.size*scale*sceneZoom/2;
                        if(x+radius<0||x-radius>width||y+radius<0||y-radius>height)return;
                        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
                    });
                });
                const count=Math.round((appState.canvas.time==='night'?5:10)*appState.preferences.roomParticleAmount/25);
                const color=appState.canvas.time==='night'?'198,217,229':'255,224,177';
                for(let i=0;i<count;i++){
                    const phase=reduced?.5:(now/(9500+i%6*1100)+i*.317)%1;
                    const fade=Math.sin(Math.PI*phase),size=9+i%4*3;
                    const x=((i*73+19)%101)/101*width+Math.sin(now/6200+i*2.7)*12;
                    const y=((i*47+13)%89)/89*height-phase*42;
                    if(x+size<0||x-size>width||y+size<0||y-size>height)continue;
                    const strength=(appState.canvas.time==='night'?.13:.28)*fade;
                    const glow=ctx.createRadialGradient(x,y,0,x,y,size);
                    glow.addColorStop(0,`rgba(${color},${strength})`);glow.addColorStop(.32,`rgba(${color},${strength*.5})`);glow.addColorStop(1,`rgba(${color},0)`);
                    ctx.globalAlpha=1;ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
                    ctx.fillStyle=`rgba(${color},${strength*.65})`;ctx.beginPath();ctx.arc(x,y,Math.max(1.5,size*.1),0,Math.PI*2);ctx.fill();
                }
                ctx.globalAlpha=1;
            }
            roomMoteTimer=setTimeout(()=>{roomMoteTimer=0;startRoomMotes();},42);
        }
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')startRoomMotes();else stopRoomMotes();});
        function setCanvasBackdrop(mode){
            mode=legacyBackdrops[mode]||mode;
            mode=Object.hasOwn(canvasBackdropModes,mode)?mode:'studioIllustrated';appStateStore.actions.setCanvasBackdrop(mode);canvas.dataset.backdrop=mode;syncInterfacePalette();canvasBackdropControl.querySelector('select').value=mode;
            const scene=RoomScenes.scenes[mode];
            const imageName=RoomScenes.imageForTime(scene,appState.canvas.time);
            const src=`./assets/rooms/${imageName}.webp?v=aligned-floor`;
            showRoomImage(src,scene.horizon?.[appState.canvas.time]);
            requestAnimationFrame(applyView);
            appStateStore.actions.setCanvasOption('floor',scene.floor);canvas.dataset.floor=appState.canvas.floor;
            updateRoomMotes(mode,appState.canvas.time);
            Hardware.updateLightingDemo();
        }
        function setCanvasTime(time){
            time=Object.hasOwn(canvasTimeModes,time)?time:'dusk';appStateStore.actions.setCanvasTime(time);canvas.dataset.time=time;canvasTimeControl.querySelector('select').value=time;
            setCanvasBackdrop(appState.canvas.backdrop||'studio');
        }
        canvasBackdropControl.querySelector('select').addEventListener('change',event=>{setCanvasBackdrop(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        canvasTimeControl.querySelector('select').addEventListener('change',event=>{setCanvasTime(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        appStateStore.actions.setCanvasTime(Object.hasOwn(canvasTimeModes,savedAppPreferences.time)?savedAppPreferences.time:savedAppPreferences.backdrop==='night'?'night':'dusk');canvas.dataset.time=appState.canvas.time;canvasTimeControl.querySelector('select').value=appState.canvas.time;
        setCanvasBackdrop(savedAppPreferences.backdrop||DEFAULT_BACKDROP);
        setCanvasTheme(appState.canvas.theme);


        const svgLayer = document.getElementById('cables-layer');
        const inspectorEmpty = document.getElementById('inspector-empty');
        const inspectorContent = document.getElementById('inspector-content');
        document.getElementById('inspector').classList.add('inspector-compact');
        const equipmentCatalog = document.getElementById('equipment-catalog');
        const wheelScrollMotions=new WeakMap();
        function enableWheelMomentumScroll(element){
            if(!element)return;
            const motion={position:element.scrollTop,target:element.scrollTop,frame:0,lastTime:0};
            wheelScrollMotions.set(element,motion);
            element.classList.add('wheel-momentum-scroll');
            element.addEventListener('wheel',event=>{
                if(event.ctrlKey||event.deltaY===0)return;
                event.preventDefault();
                const unit=event.deltaMode===1?32:event.deltaMode===2?element.clientHeight:1;
                const delta=Math.max(-180,Math.min(180,event.deltaY*unit));
                const max=Math.max(0,element.scrollHeight-element.clientHeight);
                if(!motion.frame){motion.position=element.scrollTop;motion.target=motion.position;motion.lastTime=performance.now();}
                motion.target=Math.max(-240,Math.min(max+240,motion.target+delta));
                if(!motion.frame)motion.frame=requestAnimationFrame(step);
            },{passive:false});
            function step(now){
                const elapsed=Math.min(32,now-motion.lastTime||16);motion.lastTime=now;
                const max=Math.max(0,element.scrollHeight-element.clientHeight);
                if(matchMedia('(prefers-reduced-motion: reduce)').matches){
                    motion.position=Math.max(0,Math.min(max,motion.target));motion.target=motion.position;
                }else{
                    const amount=1-Math.pow(.78,elapsed/16.67);
                    motion.position+=(motion.target-motion.position)*amount;
                    if(motion.target<0)motion.target+=(0-motion.target)*amount*.72;
                    else if(motion.target>max)motion.target+=(max-motion.target)*amount*.72;
                }
                const bounded=Math.max(0,Math.min(max,motion.position));
                const over=motion.position-bounded;
                element.scrollTop=bounded;
                element.style.setProperty('--wheel-elastic-offset',`${Math.max(-32,Math.min(32,-over*.32))}px`);element.classList.toggle('wheel-elastic-active',Math.abs(over)>=.25);
                if(Math.abs(motion.target-bounded)<.25&&Math.abs(over)<.5){
                    motion.position=bounded;motion.target=bounded;motion.frame=0;element.style.setProperty('--wheel-elastic-offset','0px');element.classList.remove('wheel-elastic-active');return;
                }
                motion.frame=requestAnimationFrame(step);
            }
        }
        enableWheelMomentumScroll(equipmentCatalog.querySelector('.overflow-y-auto'));
        enableWheelMomentumScroll(document.getElementById('inspector-content'));
        enableWheelMomentumScroll(document.getElementById('inspector-empty'));
        const discardZone=document.createElement('div');
        discardZone.className='catalog-discard-zone';
        discardZone.setAttribute('aria-hidden','true');
        discardZone.innerHTML='<div class="catalog-discard-content"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 14h26M19 14V9h10v5M15 14l2 25h14l2-25M21 21v11m6-11v11"/></svg><strong>Arraste aqui para descartar</strong><p data-discard-caption>Solte nesta área para remover o equipamento e seus cabos.</p><p>Para manter, solte no canvas.<br>Esc cancela o arraste.</p></div>';
        equipmentCatalog.appendChild(discardZone);
        const clearCatalogFooter = document.createElement('div');
        clearCatalogFooter.className = 'p-4 border-t border-gray-800 shrink-0';
        clearCatalogFooter.innerHTML = '<button id="clear-system" type="button" class="w-full rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-900/40">Apagar tudo</button>';
        equipmentCatalog.appendChild(clearCatalogFooter);
        document.getElementById('clear-system').addEventListener('click', () => {
            Object.values(appState.project.devices).forEach(dev => deleteDevice(dev));
            selectDevice(null);
            updateCableFlows();
        });
        const isOverCatalog = event => {
            const rect = equipmentCatalog.getBoundingClientRect();
            return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        };
        const cableVisibilityButton=document.createElement('button');
        cableVisibilityButton.type='button';cableVisibilityButton.className='cable-visibility-toggle';cableVisibilityButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';cableVisibilityButton.setAttribute('aria-label','Visibilidade dos cabos');cableVisibilityButton.dataset.tooltip='Mostrar ou ocultar os cabos';cableVisibilityButton.setAttribute('aria-pressed','false');
        document.querySelector('.canvas-tools').appendChild(cableVisibilityButton);
        cableVisibilityButton.addEventListener('click',()=>{
            if(appState.canvas.hideCables||appState.project.connections.some(c=>c.hidden)){
                appStateStore.actions.setCanvasOption('hideCables',false);appState.project.connections.forEach(c=>c.hidden=false);
            }else appStateStore.actions.setCanvasOption('hideCables',!appState.canvas.hideCables);
            cableVisibilityButton.setAttribute('aria-pressed',String(!!appState.canvas.hideCables));
            updateCables();renderCableProperties();
        });
        const selectionMarquee = document.getElementById('selection-marquee');
        const selectionCount = document.getElementById('selection-count');
        const view = { x: 0, y: 0, zoom: 1 };
