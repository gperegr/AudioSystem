/* Room scene, backdrop, time-of-day, and canvas theme behavior. */
        const ROOM_SIDE_INSET=202;
        const ROOM_FLOOR_OVERLAP=220;
        const ROOM_HORIZON_IMAGE_Y=550;
        const wallPlacementBottom=()=>world.offsetHeight-450;
        const floorPlacementBottom=()=>Math.floor((world.offsetHeight-ROOM_FLOOR_OVERLAP)/Hardware.sizes.grid)*Hardware.sizes.grid;
        document.documentElement.classList.add('lighting-demo-enabled');
        const roomBackdrop=document.createElement('div');roomBackdrop.id='room-backdrop';roomBackdrop.setAttribute('aria-hidden','true');
        roomBackdrop.innerHTML='<img class="room-scene-image room-layer-far is-visible" alt="" decoding="async" draggable="false"><i class="room-grid-overlay"></i>';
        const roomRain=document.createElement('div');roomRain.className='room-rain';roomRain.setAttribute('aria-hidden','true');roomBackdrop.appendChild(roomRain);
        // Clip after the rain filter as well, so blur cannot bleed onto the frames.
        const rainMaskSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        rainMaskSvg.setAttribute('width','0');rainMaskSvg.setAttribute('height','0');
        rainMaskSvg.style.position='absolute';rainMaskSvg.innerHTML='<defs><clipPath id="room-window-glass-clip" clipPathUnits="objectBoundingBox"><path/></clipPath></defs>';
        roomBackdrop.appendChild(rainMaskSvg);
        const rainMaskPath=rainMaskSvg.querySelector('path');
        roomRain.style.clipPath='url(#room-window-glass-clip)';
        // Stop offscreen glass animations without polling during pan/zoom.
        const rainVisibilityObserver=new IntersectionObserver(entries=>{
            entries.forEach(entry=>entry.target.classList.toggle('rain-offscreen',!entry.isIntersecting));
        },{root:canvas,rootMargin:'80px'});
        let roomRainAudio=null,roomCoverageReady=false;
        function randomizeRainDrop(drop,height,first=false){
            const duration=drop.classList.contains('is-bead')?9+Math.random()*23:4+Math.random()*17;
            drop.style.left=(3+Math.random()*92)+'%';drop.style.top=(Math.random()*92)+'%';
            if(first){drop.style.setProperty('--rain-duration',duration+'s');drop.style.setProperty('--rain-delay',-Math.random()*duration+'s');}
            drop.style.setProperty('--rain-size',(4+Math.random()**1.5*11)+'px');
            drop.style.setProperty('--rain-trail',(15+Math.random()**1.2*150)+'px');
            drop.style.setProperty('--rain-drift',((Math.random()-.5)*14)+'px');
            drop.style.setProperty('--rain-mid-y',(5+Math.random()*45)+'px');
            drop.style.setProperty('--rain-travel',Math.max(70,height*(.4+Math.random()*.9))+'px');
            drop.style.setProperty('--rain-opacity',(.55+Math.random()*.4).toFixed(2));
        }
        roomRain.addEventListener('animationiteration',event=>{
            if(event.target.classList.contains('room-rain-drop'))randomizeRainDrop(event.target,event.target.parentElement.offsetHeight);
        });

        let soakedGlassTexture='';
        function getSoakedGlassTexture(){
            if(soakedGlassTexture)return soakedGlassTexture;
            // One small cached texture supplies thousands of stationary beads without DOM nodes.
            const texture=document.createElement('canvas');texture.width=256;texture.height=384;
            const ctx=texture.getContext('2d');let seed=1937;
            const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
            ctx.fillStyle='rgba(155,179,193,.10)';ctx.fillRect(0,0,256,384);
            for(let i=0;i<850;i++){
                const x=random()*256,y=random()*384,r=.6+random()**2*3.4;
                ctx.beginPath();ctx.ellipse(x,y,r,r*(1+random()*.65),0,0,Math.PI*2);
                ctx.fillStyle='rgba(15,25,31,.26)';ctx.fill();
                ctx.strokeStyle='rgba(231,244,249,.62)';ctx.lineWidth=.65;ctx.stroke();
                ctx.beginPath();ctx.arc(x-r*.25,y-r*.35,Math.max(.35,r*.28),0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.82)';ctx.fill();
            }
            for(let i=0;i<26;i++){
                const x=random()*256,y=random()*384,length=24+random()*130;
                ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-3,y+length*.3,x+4,y+length*.6,x+1,y+length);
                ctx.strokeStyle='rgba(15,28,37,.30)';ctx.lineWidth=1.5+random()*2;ctx.stroke();
                ctx.strokeStyle='rgba(232,247,255,.47)';ctx.lineWidth=.8;ctx.stroke();
            }
            soakedGlassTexture=texture.toDataURL('image/png');return soakedGlassTexture;
        }
        function updateRoomRain(){
            syncRoomRainAudio();
            roomRain.style.setProperty('--rain-visibility',(.8+appState.preferences.rainIntensity/100*.6).toFixed(2));
            roomRain.style.setProperty('--rain-speed',(.7+1.8*appState.preferences.rainIntensity/100).toFixed(3));
            roomRain.dataset.soaked=String(appState.preferences.rainIntensity===100);
            if(appState.preferences.rainEnabled&&appState.preferences.rainIntensity===100)roomRain.style.setProperty('--soaked-glass-texture',`url("${getSoakedGlassTexture()}")`);
            const scene=appState.canvas.backdrop||'studioIllustrated';
            const type=scene.startsWith('studio')?'studio':scene.startsWith('listening')?'listening':'loft';
            roomRain.dataset.scene=type;
            roomRain.hidden=canvas.dataset.theme!=='scene'||!appState.preferences.rainEnabled||!appState.preferences.rainIntensity;
            if(roomRain.hidden){rainVisibilityObserver.disconnect();roomRain.replaceChildren();roomRain.dataset.count='';return;}
            const definition=RoomScenes.scenes[scene];
            // The cached wet-glass texture supplies density; bound moving drops independently.
            const intensity=appState.preferences.rainIntensity/100;
            const count=Math.round(90*intensity*(1-.2*intensity**4));
            const key=scene+':'+count;
            if(roomRain.dataset.count===key)return;
            roomRain.dataset.count=key;rainVisibilityObserver.disconnect();roomRain.replaceChildren();
            rainMaskPath.setAttribute('d',RoomScenes.rainGlass(scene).flat().map(polygon=>polygon.map(([x,y],index)=>(index?'L':'M')+(x/definition.width)+' '+(y/definition.height)).join(' ')+'Z').join(' '));
            RoomScenes.rainGlass(scene).forEach((glass,w)=>{
                const pane=document.createElement('div');pane.className='room-rain-pane';pane.dataset.pane=String(w);
                const areas=glass.map(polygon=>{const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]);return (Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys));});
                const total=areas.reduce((sum,area)=>sum+area,0);let assigned=0;
                glass.forEach((polygon,cell)=>{
                    const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]);
                    const left=Math.min(...xs),top=Math.min(...ys),width=Math.max(...xs)-left,height=Math.max(...ys)-top;
                    const sheet=document.createElement('div');sheet.className='room-rain-glass';
                    Object.assign(sheet.style,{left:left/definition.width*100+'%',top:top/definition.height*100+'%',width:width/definition.width*100+'%',height:height/definition.height*100+'%',clipPath:'polygon('+polygon.map(([x,y])=>`${(x-left)/width*100}% ${(y-top)/height*100}%`).join(',')+')'});
                    const cumulative=areas.slice(0,cell+1).reduce((sum,area)=>sum+area,0);
                    const number=Math.round(count*cumulative/total)-assigned;assigned+=number;
                    for(let i=0;i<number;i++){
                        const drop=document.createElement('i');drop.className='room-rain-drop'+(Math.random()<.35?' is-bead':'');
                        randomizeRainDrop(drop,height/definition.height*world.offsetHeight*1.12,true);
                        sheet.appendChild(drop);
                    }
                    pane.appendChild(sheet);rainVisibilityObserver.observe(sheet);
                });
                roomRain.appendChild(pane);
            });
        }
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
            updateRoomRain();
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
            const shift=((ROOM_HORIZON_IMAGE_Y-imageHorizon)*world.offsetHeight*1.12/720*farScale).toFixed(1)+'px';
            image.style.setProperty('--room-horizon-shift',shift);roomRain.style.setProperty('--room-horizon-shift',shift);
            if(roomCoverageReady)updateRoomImageCoverage(image);
        }
        // Keep the authored image proportions, adding only the translation/scale needed
        // to cover the visible viewport and the transparent corners of the dock.
        function updateRoomImageCoverage(image){
            const style=getComputedStyle(canvas),width=world.offsetWidth,height=world.offsetHeight,zoom=view.zoom;
            if(!width||!height||!zoom)return;
            const cutout=Math.max(40,parseFloat(style.getPropertyValue('--catalog-tray-inset'))||25);
            const bleed=Math.max(2/zoom,(parseFloat(style.getPropertyValue('--room-depth-blur'))||2)*3/zoom),left=(-view.x)/zoom-bleed,top=(-view.y)/zoom-bleed;
            const right=(canvas.clientWidth-view.x)/zoom+bleed,bottom=(canvas.clientHeight+cutout-view.y)/zoom+bleed;
            const farScale=parseFloat(world.style.getPropertyValue('--room-far-scale'))||1;
            const cover=Math.max(1,(right-left)/(width*1.12*farScale),(bottom-top)/(height*1.12*farScale));
            const farX=parseFloat(world.style.getPropertyValue('--room-far-x'))||0;
            const farY=parseFloat(world.style.getPropertyValue('--room-far-y'))||0;
            const drop=parseFloat(world.style.getPropertyValue('--room-image-drop'))||0;
            const horizon=parseFloat(image.style.getPropertyValue('--room-horizon-shift'))||0;
            const imageLeft=width/2-width*.56*farScale*cover+farX;
            const imageRight=width/2+width*.56*farScale*cover+farX;
            const imageTop=height-height*1.12*farScale*cover+farY+drop+horizon;
            const imageBottom=height+farY+drop+horizon;
            const x=Math.min(left-imageLeft,Math.max(0,right-imageRight));
            const y=Math.min(top-imageTop,Math.max(0,bottom-imageBottom));
            for(const element of [image,roomRain]){
                element.style.setProperty('--room-cover-x',x+'px');element.style.setProperty('--room-cover-y',y+'px');
                element.style.setProperty('--room-cover-scale',String(cover));
            }
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
                const scene=RoomScenes.scenes[mode];
                const x=light.cx/scene.width,y=(light.cy+light.h*.05)/scene.height;
                const color=light.rgb.join(' ');
                const strength=Math.min(1,light.strength*(daylight?1.15:time==='night'?.28:.8));
                const panes=scene.glass[index];
                const areas=panes.map(p=>(p[2][0]-p[0][0])*(p[2][1]-p[0][1]));
                const area=areas.reduce((sum,value)=>sum+value,0);
                const particles=Array.from({length:count},(_,particle)=>{
                    const seed=index*37+particle*17;
                    // Stratify samples by glass area, keeping the existing per-window budget.
                    const sample=(particle+.5)/Math.max(1,count)*area;
                    let paneIndex=0,cumulative=areas[0];
                    while(cumulative<sample&&paneIndex<panes.length-1)cumulative+=areas[++paneIndex];
                    const u=.08+((seed*43)%101)/100*.84,v=.08+((seed*29)%103)/102*.84;
                    const size=dusk?(particle%7===0?7:particle%3===0?5:3.5):daylight?(particle%7===0?5:particle%3===0?3.5:2.5):(particle%7===0?3.5:2);
                    const duration=(11+seed%9)*(dusk?.75:1);
                    return {paneIndex,u,v,depth:(seed%97)/96,size,duration:duration*1000,delay:(seed%41)*430};
                });
                return {x,y,scene:mode,windowIndex:index,rgb:color,strength,particles};
            });
            stopRoomMotes();
            if(appState.preferences.roomParticleAmount>0)startRoomMotes();
            else {
                roomMoteContext.setTransform(1,0,0,1,0,0);
                roomMoteContext.clearRect(0,0,roomMoteCanvas.width,roomMoteCanvas.height);
            }
        }
        function stopRoomMotes(){cancelAnimationFrame(roomMoteFrame);clearTimeout(roomMoteTimer);roomMoteFrame=0;roomMoteTimer=0;}
        function startRoomMotes(){if(!roomMoteFrame&&!roomMoteTimer&&document.visibilityState==='visible'&&canvas.dataset.theme==='scene'&&appState.preferences.roomParticleAmount>0)roomMoteFrame=requestAnimationFrame(drawRoomMotes);}
        function drawRoomMotes(now){
            roomMoteFrame=0;
            if(document.visibilityState!=='visible'||canvas.dataset.theme!=='scene')return;
            // Bound the effect buffer even on 4K/ultrawide displays.
            const width=canvas.clientWidth,height=canvas.clientHeight,resolution=Math.min(.8,1600/Math.max(1,width));
            if(width&&height){
                const pixelWidth=Math.round(width*resolution),pixelHeight=Math.round(height*resolution);
                if(roomMoteCanvas.width!==pixelWidth||roomMoteCanvas.height!==pixelHeight){roomMoteCanvas.width=pixelWidth;roomMoteCanvas.height=pixelHeight;}
                const ctx=roomMoteContext;ctx.setTransform(resolution,0,0,resolution,0,0);ctx.clearRect(0,0,width,height);
                const image=roomBackdrop.querySelector('.room-scene-image.is-visible:last-of-type')||roomBackdrop.querySelector('.room-scene-image');
                const imageBounds=image.getBoundingClientRect(),canvasBounds=canvas.getBoundingClientRect();
                const sceneZoom=imageBounds.width/Math.max(1,image.offsetWidth);
                const offsetX=imageBounds.left-canvasBounds.left,offsetY=imageBounds.top-canvasBounds.top;
                const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
                roomMoteBeams.forEach(beam=>{
                    const scene=RoomScenes.scenes[beam.scene],glass=scene.glass[beam.windowIndex];
                    const window=scene.windows[beam.windowIndex];
                    ctx.fillStyle=`rgb(${beam.rgb.replaceAll(' ', ',')})`;
                    beam.particles.forEach((particle,index)=>{
                        const phase=reduced?.5:(now+particle.delay)%(particle.duration*2)/particle.duration;
                        const progress=reduced?.5:phase<=1?phase:2-phase;
                        const eased=(1-Math.cos(Math.PI*progress))/2;
                        const alpha=reduced?.38:Math.sin(Math.PI*progress)*.65;
                        const depth=Math.max(0,Math.min(1,particle.depth+(eased-.5)*.12));
                        const point=RoomScenes.particlePoint(beam.scene,beam.windowIndex,particle.paneIndex,particle.u,particle.v,depth);
                        // Before entering the interior, opaque mullions block the light.
                        if(point.x>=window.x-window.w/2&&point.x<=window.x+window.w/2&&point.y>=window.y-window.h/2&&point.y<=window.y+window.h/2&&
                            !glass.some(p=>point.x>p[0][0]&&point.x<p[2][0]&&point.y>p[0][1]&&point.y<p[2][1]))return;
                        const x=offsetX+imageBounds.width*point.x/scene.width,y=offsetY+imageBounds.height*point.y/scene.height;
                        const radius=particle.size*sceneZoom/2;
                        if(x+radius<0||x-radius>width||y+radius<0||y-radius>height)return;
                        ctx.globalAlpha=beam.strength*.7*alpha*(1-depth*.55);
                        if(index%9===0){
                            const glowRadius=Math.max(2,radius*4),glow=ctx.createRadialGradient(x,y,0,x,y,glowRadius);
                            glow.addColorStop(0,`rgb(${beam.rgb.replaceAll(' ', ',')})`);glow.addColorStop(1,`rgba(${beam.rgb.replaceAll(' ', ',')},0)`);
                            ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,glowRadius,0,Math.PI*2);ctx.fill();
                            ctx.fillStyle=`rgb(${beam.rgb.replaceAll(' ', ',')})`;
                        }
                        ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
                    });
                });
                ctx.globalAlpha=1;
            }
            if(!matchMedia('(prefers-reduced-motion: reduce)').matches)roomMoteTimer=setTimeout(()=>{roomMoteTimer=0;startRoomMotes();},42);
        }
        document.addEventListener('visibilitychange',()=>{
            roomBackdrop.classList.toggle('room-effects-paused',document.visibilityState!=='visible');
            if(document.visibilityState==='visible')startRoomMotes();else stopRoomMotes();
        });
        matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>{stopRoomMotes();startRoomMotes();});
        function setCanvasBackdrop(mode){
            mode=legacyBackdrops[mode]||mode;
            mode=Object.hasOwn(canvasBackdropModes,mode)?mode:'studioIllustrated';appStateStore.actions.setCanvasBackdrop(mode);canvas.dataset.backdrop=mode;syncInterfacePalette();canvasBackdropControl.querySelector('select').value=mode;
            const scene=RoomScenes.scenes[mode];
            updateRoomRain();
            const imageName=RoomScenes.imageForTime(scene,appState.canvas.time);
            const src=`./assets/rooms/${imageName}.webp?v=ultrawide-1`;
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
        function enableWheelMomentumScroll(element,{horizontal=false}={}){
            if(!element)return;
            const positionKey=horizontal?'scrollLeft':'scrollTop';
            const sizeKey=horizontal?'clientWidth':'clientHeight';
            const extentKey=horizontal?'scrollWidth':'scrollHeight';
            element.dataset.scrollAxis=horizontal?'horizontal':'vertical';
            const motion={position:element[positionKey],target:element[positionKey],frame:0,lastTime:0};
            wheelScrollMotions.set(element,motion);
            element.classList.add('wheel-momentum-scroll');
            element.addEventListener('wheel',event=>{
                const wheelDelta=horizontal&&Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
                if(event.ctrlKey||wheelDelta===0)return;
                event.preventDefault();
                const unit=event.deltaMode===1?32:event.deltaMode===2?element[sizeKey]:1;
                const delta=Math.max(-180,Math.min(180,wheelDelta*unit));
                const max=Math.max(0,element[extentKey]-element[sizeKey]);
                if(!motion.frame){motion.position=element[positionKey];motion.target=motion.position;motion.lastTime=performance.now();}
                motion.target=Math.max(-240,Math.min(max+240,motion.target+delta));
                if(!motion.frame)motion.frame=requestAnimationFrame(step);
            },{passive:false});
            function step(now){
                const elapsed=Math.min(32,now-motion.lastTime||16);motion.lastTime=now;
                const max=Math.max(0,element[extentKey]-element[sizeKey]);
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
                element[positionKey]=bounded;
                element.style.setProperty('--wheel-elastic-offset',`${Math.max(-32,Math.min(32,-over*.32))}px`);element.classList.toggle('wheel-elastic-active',Math.abs(over)>=.25);
                if(Math.abs(motion.target-bounded)<.25&&Math.abs(over)<.5){
                    motion.position=bounded;motion.target=bounded;motion.frame=0;element.style.setProperty('--wheel-elastic-offset','0px');element.classList.remove('wheel-elastic-active');return;
                }
                motion.frame=requestAnimationFrame(step);
            }
        }
        enableWheelMomentumScroll(equipmentCatalog.querySelector('.overflow-y-auto'),{horizontal:true});
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
