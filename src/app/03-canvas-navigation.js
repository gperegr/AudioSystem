/* Canvas viewport, mobile navigation, sidebars, and device selection. */
        const MIN_CANVAS_ZOOM = 0.175;
        const MAX_CANVAS_ZOOM = 2.5;
        const clampZoom = zoom => {
            const minimum = Math.max(MIN_CANVAS_ZOOM, canvas.clientWidth / Math.max(1, world.offsetWidth), canvas.clientHeight / Math.max(1, world.offsetHeight));
            return Math.max(minimum, Math.min(MAX_CANVAS_ZOOM, zoom));
        };
        function setOpeningView(){
            view.zoom=clampZoom(MIN_CANVAS_ZOOM);
            view.x=Math.min(0,(canvas.clientWidth-world.offsetWidth*view.zoom)/2);
            view.y=Math.min(0,canvas.clientHeight-world.offsetHeight*view.zoom);
        }
        setOpeningView();
        const snapCoordinate = value => Math.round(value / Hardware.sizes.grid) * Hardware.sizes.grid;
        let viewAnimation=0;
        let viewLightingTimer=0;
        function scheduleViewLighting(){
            clearTimeout(viewLightingTimer);
            viewLightingTimer=setTimeout(()=>{viewLightingTimer=0;Hardware.updateLightingDemo();},120);
        }
        function stopViewMotion(){cancelAnimationFrame(viewAnimation);viewAnimation=0;}
        function animateViewTo(target){
            stopViewMotion();
            if(matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(view,target);applyView();return;}
            const start={...view},started=performance.now();
            const tick=now=>{
                const progress=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.max(0,Math.min(1,(now-started)/280)),ease=1-(1-progress)**3;
                for(const key of ['x','y','zoom'])view[key]=start[key]+(target[key]-start[key])*ease;
                applyView();viewAnimation=progress<1?requestAnimationFrame(tick):0;
            };
            viewAnimation=requestAnimationFrame(tick);
        }
        function applyView() {
            view.zoom = clampZoom(view.zoom);
            view.x = Math.max(Math.min(0, canvas.clientWidth - world.offsetWidth * view.zoom), Math.min(0, view.x));
            view.y = Math.max(Math.min(0, canvas.clientHeight - world.offsetHeight * view.zoom), Math.min(0, view.y));
            if(world.style.getPropertyValue('--canvas-zoom')!==String(view.zoom)){
                world.style.setProperty('--canvas-zoom', view.zoom);
                world.style.setProperty('--canvas-inverse-zoom', 1 / view.zoom);
            }
            const farX=Math.max(-90,Math.min(90,-view.x/view.zoom*.09)),farY=Math.max(-55,Math.min(55,-view.y/view.zoom*.06));
            const farScale=Math.max(.9,Math.min(1.08,1-(view.zoom-1)*.08));
            const floorScale=Math.max(.94,Math.min(1.04,1-(view.zoom-1)*.04));
            const scene=RoomScenes.scenes[appState.canvas.backdrop];
            const horizonShift=(ROOM_HORIZON_IMAGE_Y-(scene?.horizon?.[appState.canvas.time]??ROOM_HORIZON_IMAGE_Y))*world.offsetHeight*1.1/720*farScale;
            world.style.setProperty('--room-far-x',farX.toFixed(1)+'px');world.style.setProperty('--room-far-y',farY.toFixed(1)+'px');
            world.style.setProperty('--room-far-scale',farScale.toFixed(3));
            world.style.setProperty('--room-horizon-shift',horizonShift.toFixed(1)+'px');
            roomBackdrop.querySelectorAll('.room-scene-image').forEach(image=>positionRoomImage(image));
            world.style.setProperty('--floor-parallax-x',(farX*.28).toFixed(1)+'px');
            world.style.setProperty('--floor-parallax-scale',floorScale.toFixed(3));
            world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
            document.getElementById('zoom-label').textContent = `${Math.round(view.zoom * 100)}%`;
            // Os cabos pertencem ao mundo transformado e acompanham o zoom sem redesenho.
            scheduleViewLighting();
            scheduleAppPreferencesSave();
        }
        new ResizeObserver(() => {stopViewMotion();applyView();}).observe(canvas);
        function screenToWorld(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            return { x: (clientX - rect.left - view.x) / view.zoom, y: (clientY - rect.top - view.y) / view.zoom };
        }
        function setZoomAt(nextZoom, clientX, clientY) {
            stopViewMotion();
            const rect = canvas.getBoundingClientRect();
            const px = clientX - rect.left, py = clientY - rect.top;
            const worldX = (px - view.x) / view.zoom, worldY = (py - view.y) / view.zoom;
            view.zoom = clampZoom(nextZoom);
            view.x = px - worldX * view.zoom;
            view.y = py - worldY * view.zoom;
            applyView();
        }
        document.getElementById('zoom-in').addEventListener('click', () => { const r = canvas.getBoundingClientRect(); setZoomAt(view.zoom * 1.15, r.left + r.width / 2, r.top + r.height / 2); });
        document.getElementById('zoom-out').addEventListener('click', () => { const r = canvas.getBoundingClientRect(); setZoomAt(view.zoom / 1.15, r.left + r.width / 2, r.top + r.height / 2); });
        canvas.addEventListener('wheel',e=>{
            e.preventDefault();
            const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1);
            setZoomAt(view.zoom*Math.exp(-Math.max(-160,Math.min(160,pixels))*.001),e.clientX,e.clientY);
        },{passive:false});
        function frameSelectedDevices(){
            const devices=[...appState.interface.selectedDeviceIds].map(id=>appState.project.devices[id]).filter(Boolean);if(!devices.length)return;
            const bounds=devices.reduce((b,d)=>{const x=parseFloat(d.el.style.left)||0,y=parseFloat(d.el.style.top)||0;return {left:Math.min(b.left,x),top:Math.min(b.top,y),right:Math.max(b.right,x+d.el.offsetWidth),bottom:Math.max(b.bottom,y+d.el.offsetHeight)};},{left:Infinity,top:Infinity,right:-Infinity,bottom:-Infinity});
            const rect=canvas.getBoundingClientRect(),pad=48,w=bounds.right-bounds.left,h=bounds.bottom-bounds.top,zoom=clampZoom(Math.min((rect.width-pad*2)/Math.max(1,w),(rect.height-pad*2)/Math.max(1,h),2));
            animateViewTo({zoom,x:(rect.width-w*zoom)/2-bounds.left*zoom,y:(rect.height-h*zoom)/2-bounds.top*zoom});
        }
        const frameSelectionButton=document.getElementById('fit-canvas').cloneNode(true);
        frameSelectionButton.id='frame-selection';frameSelectionButton.title='Enquadrar seleção';frameSelectionButton.setAttribute('aria-label','Enquadrar seleção');frameSelectionButton.dataset.tooltip='Enquadrar seleção';frameSelectionButton.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>';
        frameSelectionButton.addEventListener('click',frameSelectedDevices);document.getElementById('fit-canvas').after(frameSelectionButton);
        document.getElementById('fit-canvas').addEventListener('click', () => {
            const devices = Object.values(appState.project.devices);
            if (!devices.length) { animateViewTo({zoom:1,x:0,y:0}); return; }
            const bounds = devices.reduce((b, dev) => {
                const left = parseFloat(dev.el.style.left) || 0, top = parseFloat(dev.el.style.top) || 0;
                return { left: Math.min(b.left, left), top: Math.min(b.top, top), right: Math.max(b.right, left + dev.el.offsetWidth), bottom: Math.max(b.bottom, top + dev.el.offsetHeight) };
            }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
            const rect = canvas.getBoundingClientRect(), pad = 48;
            const zoom=clampZoom(Math.min((rect.width-pad*2)/Math.max(1,bounds.right-bounds.left),(rect.height-pad*2)/Math.max(1,bounds.bottom-bounds.top)));
            animateViewTo({zoom,x:(rect.width-(bounds.right-bounds.left)*zoom)/2-bounds.left*zoom,y:(rect.height-(bounds.bottom-bounds.top)*zoom)/2-bounds.top*zoom});
        });

        const canvasTouches=new Map();let canvasPinch=null;
        function cancelPointerInteraction(event){
            const cancel=new PointerEvent('pointerup',{pointerId:event.pointerId||0,pointerType:'touch',clientX:event.clientX||0,clientY:event.clientY||0,button:0,buttons:0});
            Object.defineProperty(cancel,'cancelled',{value:true});window.dispatchEvent(cancel);
        }
        document.addEventListener('pointerdown',event=>{
            if(event.pointerType!=='touch')return;
            if(canvas.contains(event.target)&&!event.target.closest('.canvas-tools')){
                canvasTouches.set(event.pointerId,{x:event.clientX,y:event.clientY});
                if(canvasTouches.size===2){
                    cancelPointerInteraction(event);
                    const [a,b]=[...canvasTouches.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
                    canvasPinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:view.zoom,anchor:screenToWorld(cx,cy)};
                    event.preventDefault();event.stopImmediatePropagation();
                }
            }
            if(event.isPrimary===false){event.preventDefault();event.stopImmediatePropagation();}
        },{capture:true,passive:false});
        document.addEventListener('pointermove',event=>{
            if(event.pointerType!=='touch')return;
            if(canvasTouches.has(event.pointerId))canvasTouches.set(event.pointerId,{x:event.clientX,y:event.clientY});
            if(canvasPinch){
                if(canvasTouches.size>=2){
                    const [a,b]=[...canvasTouches.values()],rect=canvas.getBoundingClientRect();
                    view.zoom=clampZoom(canvasPinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/canvasPinch.distance);
                    view.x=(a.x+b.x)/2-rect.left-canvasPinch.anchor.x*view.zoom;
                    view.y=(a.y+b.y)/2-rect.top-canvasPinch.anchor.y*view.zoom;applyView();
                }
                event.preventDefault();event.stopImmediatePropagation();
            }else if(event.isPrimary===false)event.stopImmediatePropagation();
        },{capture:true,passive:false});
        document.addEventListener('pointerup',event=>{
            canvasTouches.delete(event.pointerId);
            if(canvasPinch){if(!canvasTouches.size)canvasPinch=null;event.stopImmediatePropagation();}
            else if(event.isPrimary===false)event.stopImmediatePropagation();
        },{capture:true});
        document.addEventListener('pointercancel',event=>{
            canvasTouches.delete(event.pointerId);
            cancelPointerInteraction(event);
            if(!canvasTouches.size)canvasPinch=null;
        },{capture:true});

        const touchMoveModeButton=document.getElementById('touch-move-mode');let touchMovementMode=false;
        document.documentElement.classList.toggle('has-touch-input',navigator.maxTouchPoints>0);
        touchMoveModeButton.addEventListener('click',()=>{touchMovementMode=!touchMovementMode;touchMoveModeButton.setAttribute('aria-pressed',String(touchMovementMode));touchMoveModeButton.dataset.tooltip=touchMovementMode?'Modo Touch ativo · toque e arraste para mover imediatamente':'Modo Touch desligado · segure brevemente um equipamento antes de arrastá-lo';});
        const mobileControls=document.createElement('div');mobileControls.className='mobile-panel-controls';
        mobileControls.innerHTML='<button type="button" data-mobile-panel="catalog" aria-label="Equipamentos" data-tooltip="Equipamentos" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg><small>Equip.</small></button><button type="button" data-mobile-panel="properties" aria-label="Propriedades" data-tooltip="Propriedades" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></svg><small>Ajustes</small></button><button type="button" data-mobile-action="center" aria-label="Centralizar" data-tooltip="Centralizar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v5m0 8v5M3 12h5m8 0h5"/><circle cx="12" cy="12" r="4"/></svg><small>Centro</small></button><button type="button" data-mobile-action="undo" aria-label="Desfazer" data-tooltip="Desfazer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h9a7 7 0 0 1 0 14h-2"/></svg><small>Desfazer</small></button><button type="button" data-mobile-action="redo" aria-label="Refazer" data-tooltip="Refazer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 14 5-5-5-5m5 5h-9a7 7 0 0 0 0 14h2"/></svg><small>Refazer</small></button><button type="button" data-mobile-action="settings" aria-label="Configurações" data-tooltip="Configurações"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3m14 0h3"/></svg><small>Ajustes</small></button>';
        document.getElementById('app-topbar').lastElementChild.prepend(mobileControls);
        // Fixed phone navigation must escape the topbar's scrolling container.
        const phoneNavigationLayout=matchMedia('(max-width:700px)');
        const placePhoneNavigation=()=>{if(phoneNavigationLayout.matches)document.body.append(mobileControls);else document.querySelector('#app-topbar>.topbar-controls').prepend(mobileControls);};
        phoneNavigationLayout.addEventListener('change',placePhoneNavigation);placePhoneNavigation();
        const mobileContextActions=document.createElement('div');mobileContextActions.className='mobile-context-actions';mobileContextActions.hidden=true;mobileContextActions.setAttribute('aria-label','Ações do equipamento selecionado');
        mobileContextActions.innerHTML='<button type="button" data-context-action="power"><svg viewBox="0 0 24 24"><path d="M12 3v9"/><path d="M6.1 6.1a8 8 0 1 0 11.8 0"/></svg><span>Ligar</span></button><button type="button" data-context-action="play"><svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z"/></svg><span>Reproduzir</span></button><button type="button" data-context-action="center"><svg viewBox="0 0 24 24"><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/><circle cx="12" cy="12" r="4"/></svg><span>Centralizar</span></button><button type="button" data-context-action="remove"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5"/></svg><span>Remover</span></button>';
        document.body.appendChild(mobileContextActions);
        function syncMobileContextActions(){
            const id=appState.interface.selectedDeviceId,dev=id&&appState.project.devices[id];mobileContextActions.hidden=!compactTouchLayout.matches||!dev||document.body.classList.contains('mobile-catalog-open')||document.body.classList.contains('mobile-properties-open');
            if(!dev)return;
            const power=mobileContextActions.querySelector('[data-context-action="power"]'),play=mobileContextActions.querySelector('[data-context-action="play"]');
            power.hidden=!dev.el.querySelector('.power-btn');power.querySelector('span').textContent=dev.powered===false?'Ligar':'Desligar';power.setAttribute('aria-label',dev.powered===false?'Ligar equipamento':'Desligar equipamento');
            const playControl=dev.el.querySelector('[data-source-play],.at-startstop');play.hidden=!playControl||!SOURCE_TYPES.has(dev.type);play.querySelector('span').textContent=dev.state.playing?'Pausar':'Reproduzir';play.setAttribute('aria-label',dev.state.playing?'Pausar':'Reproduzir');play.dataset.target=dev.id;
        }
        mobileContextActions.addEventListener('click',event=>{
            const button=event.target.closest('[data-context-action]');if(!button)return;const dev=appState.project.devices[appState.interface.selectedDeviceId];if(!dev)return;
            if(button.dataset.contextAction==='power'){dev.el.querySelector('.power-btn')?.click();setTimeout(syncMobileContextActions,0);}
            if(button.dataset.contextAction==='play')dev.el.querySelector('[data-source-play],.at-startstop')?.click();
            if(button.dataset.contextAction==='center')centerDeviceSet([dev]);
            if(button.dataset.contextAction==='remove'){deleteDevice(dev,true);scheduleProjectSave();}
        });
        const compactLayout=matchMedia('(max-width:1000px), (hover:none) and (pointer:coarse) and (max-width:1400px)');
        compactLayout.addEventListener('change',syncMobileContextActions);
        const compactTouchLayout=matchMedia('(max-width:700px), (hover:none) and (pointer:coarse)');
        compactTouchLayout.addEventListener('change',syncMobileContextActions);
        function syncCompactViewport(){
            if(compactLayout.matches)document.body.style.setProperty('--compact-viewport-height',(window.visualViewport?.height||innerHeight)+'px');
            else document.body.style.removeProperty('--compact-viewport-height');
        }
        window.visualViewport?.addEventListener('resize',syncCompactViewport);window.addEventListener('resize',syncCompactViewport);syncCompactViewport();
        const mobileBackdrop=document.createElement('button');mobileBackdrop.type='button';mobileBackdrop.className='mobile-panel-backdrop';mobileBackdrop.hidden=true;mobileBackdrop.tabIndex=-1;mobileBackdrop.setAttribute('aria-label','Fechar painéis');document.body.appendChild(mobileBackdrop);
        const mobileCatalogClose=document.createElement('button');mobileCatalogClose.type='button';mobileCatalogClose.className='mobile-catalog-close';mobileCatalogClose.textContent='Fechar equipamentos ×';equipmentCatalog.prepend(mobileCatalogClose);
        function syncMobilePanels(){
            const catalogOpen=compactLayout.matches&&document.body.classList.contains('mobile-catalog-open'),propertiesOpen=compactLayout.matches&&document.body.classList.contains('mobile-properties-open');
            const inspector=document.getElementById('inspector');if(propertiesOpen&&!inspector.dataset.sheetLevel)inspector.dataset.sheetLevel='mid';
            equipmentCatalog.inert=compactLayout.matches?!catalogOpen:document.body.classList.contains('catalog-collapsed');document.getElementById('inspector').inert=compactLayout.matches?!propertiesOpen:document.body.classList.contains('inspector-collapsed');
            mobileBackdrop.hidden=!(catalogOpen||propertiesOpen);
            mobileControls.querySelector('[data-mobile-panel="catalog"]').setAttribute('aria-expanded',String(catalogOpen));mobileControls.querySelector('[data-mobile-panel="properties"]').setAttribute('aria-expanded',String(propertiesOpen));
            syncMobileContextActions();
        }
        function closeMobilePanels(){document.body.classList.remove('mobile-catalog-open','mobile-properties-open');syncMobilePanels();}
        mobileBackdrop.addEventListener('click',()=>{const key=document.body.classList.contains('mobile-catalog-open')?'catalog':'properties';closeMobilePanels();mobileControls.querySelector(`[data-mobile-panel="${key}"]`).focus();});
        mobileCatalogClose.addEventListener('click',()=>{closeMobilePanels();mobileControls.querySelector('[data-mobile-panel="catalog"]').focus();});
        compactLayout.addEventListener('change',()=>{syncCompactViewport();if(!compactLayout.matches)closeMobilePanels();else syncMobilePanels();});
        mobileControls.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
            if(button.dataset.mobileAction==='center'){document.getElementById('center-devices')?.click();return;}
            if(button.dataset.mobileAction==='undo'){document.getElementById('undo-movement')?.click();return;}
            if(button.dataset.mobileAction==='redo'){document.getElementById('redo-movement')?.click();return;}
            if(button.dataset.mobileAction==='settings'){document.querySelector('.app-settings>summary')?.click();return;}
            const className=button.dataset.mobilePanel==='catalog'?'mobile-catalog-open':'mobile-properties-open',open=document.body.classList.contains(className);
            closeMobilePanels();if(!open){document.querySelector('.app-settings')?.removeAttribute('open');document.body.classList.add(className);syncMobilePanels();(button.dataset.mobilePanel==='catalog'?mobileCatalogClose:mobileInspectorClose).focus({preventScroll:true});}
        }));
        canvas.addEventListener('pointerdown',()=>{stopViewMotion();closeMobilePanels();},{capture:true});
        const mobileInspectorClose=document.createElement('button');mobileInspectorClose.type='button';mobileInspectorClose.className='mobile-inspector-close';mobileInspectorClose.textContent='Ocultar propriedades →';mobileInspectorClose.setAttribute('aria-label','Ocultar menu da direita');
        document.getElementById('inspector').prepend(mobileInspectorClose);
        mobileInspectorClose.addEventListener('click',()=>{
            if(mobileInspectorClose.dataset.dragged==='true'){delete mobileInspectorClose.dataset.dragged;return;}
            const panel=document.getElementById('inspector');
            const level=panel.dataset.sheetLevel||'mid';
            panel.dataset.sheetLevel=level==='mid'?'full':level==='full'?'peek':'mid';
            mobileInspectorClose.setAttribute('aria-label',`Painel de propriedades: ${panel.dataset.sheetLevel}`);
        });
        mobileInspectorClose.textContent='⌃';mobileInspectorClose.setAttribute('aria-label','Expandir propriedades');
        let sheetStartY=0;
        mobileInspectorClose.addEventListener('pointerdown',event=>{sheetStartY=event.clientY;mobileInspectorClose.setPointerCapture?.(event.pointerId);});
        mobileInspectorClose.addEventListener('pointerup',event=>{const delta=sheetStartY-event.clientY;if(Math.abs(delta)<18)return;mobileInspectorClose.dataset.dragged='true';const panel=document.getElementById('inspector');panel.dataset.sheetLevel=delta>0?'full':'peek';});
        mobileControls.querySelector('[data-mobile-panel="catalog"]').setAttribute('aria-controls','equipment-catalog');
        mobileControls.querySelector('[data-mobile-panel="properties"]').setAttribute('aria-controls','inspector');
        const sidebarConfig={catalog:{panel:equipmentCatalog,button:document.getElementById('catalog-sidebar-toggle'),pin:document.getElementById('catalog-sidebar-pin'),collapsed:'catalog-collapsed',name:'equipamentos'},properties:{panel:document.getElementById('inspector'),button:document.getElementById('inspector-sidebar-toggle'),pin:document.getElementById('inspector-sidebar-pin'),collapsed:'inspector-collapsed',name:'propriedades'}};
        const sidebarPinned={catalog:savedAppPreferences.catalogPinned===true,properties:savedAppPreferences.inspectorPinned===true};
        const sidebarTimers={catalog:0,properties:0},sidebarHoverTimers={catalog:0,properties:0},sidebarHoverOpenedAt={catalog:0,properties:0};
        function syncSidebar(key){
            const config=sidebarConfig[key],closed=document.body.classList.contains(config.collapsed),label=`${closed?'Expandir':'Recolher'} ${config.name}`;
            document.body.classList.toggle(`${key}-pinned`,sidebarPinned[key]&&!closed&&!compactLayout.matches);
            config.button.setAttribute('aria-expanded',String(!closed));config.button.setAttribute('aria-label',label);config.button.title=label;config.button.textContent=key==='catalog'?(closed?'›':'‹'):(closed?'‹':'›');
            config.pin.setAttribute('aria-pressed',String(sidebarPinned[key]));config.pin.setAttribute('aria-label',`${sidebarPinned[key]?'Soltar':'Fixar'} painel de ${config.name}`);config.pin.title=sidebarPinned[key]?'Soltar painel':'Fixar painel aberto';
            if(!compactLayout.matches)config.panel.inert=closed;
        }
        function cancelSidebarTimer(key){clearTimeout(sidebarTimers[key]);sidebarTimers[key]=0;clearTimeout(sidebarHoverTimers[key]);sidebarHoverTimers[key]=0;}
        function closeSidebar(key){if(compactLayout.matches||sidebarPinned[key]||document.body.classList.contains(sidebarConfig[key].collapsed))return;cancelSidebarTimer(key);document.body.classList.add(sidebarConfig[key].collapsed);syncSidebar(key);}
        function scheduleSidebarClose(key,delay=800){
            if(compactLayout.matches||sidebarPinned[key])return;clearTimeout(sidebarTimers[key]);sidebarTimers[key]=setTimeout(()=>{
                const panel=sidebarConfig[key].panel;if(panel.matches(':hover')||panel.contains(document.activeElement))return;
                closeSidebar(key);
            },delay);
        }
        function openSidebar(key,delay=3200){
            if(compactLayout.matches)return;cancelSidebarTimer(key);document.body.classList.remove(sidebarConfig[key].collapsed);syncSidebar(key);
            if(!sidebarPinned[key])scheduleSidebarClose(key,delay);
        }
        for(const [key,config] of Object.entries(sidebarConfig)){
            config.button.addEventListener('click',()=>{if(compactLayout.matches)return;if(document.body.classList.contains(config.collapsed))openSidebar(key);else if(Date.now()-sidebarHoverOpenedAt[key]>800){sidebarPinned[key]=false;closeSidebar(key);scheduleAppPreferencesSave();}config.button.focus();});
            config.button.addEventListener('pointerenter',event=>{if(compactLayout.matches||event.pointerType==='touch'||!document.body.classList.contains(config.collapsed))return;sidebarHoverTimers[key]=setTimeout(()=>{openSidebar(key);sidebarHoverOpenedAt[key]=Date.now();},230);});
            config.button.addEventListener('pointerleave',()=>clearTimeout(sidebarHoverTimers[key]));
            config.panel.addEventListener('pointerenter',()=>cancelSidebarTimer(key));
            config.panel.addEventListener('pointerleave',()=>scheduleSidebarClose(key));
            config.panel.addEventListener('focusin',()=>cancelSidebarTimer(key));
            config.panel.addEventListener('focusout',()=>scheduleSidebarClose(key,1200));
            config.pin.addEventListener('click',()=>{sidebarPinned[key]=!sidebarPinned[key];if(sidebarPinned[key])openSidebar(key);else scheduleSidebarClose(key,1800);syncSidebar(key);scheduleAppPreferencesSave();});
        }
        if(!sidebarPinned.properties)document.body.classList.add('inspector-collapsed');
        syncSidebar('catalog');syncSidebar('properties');
        canvas.addEventListener('pointerdown',()=>{closeSidebar('catalog');closeSidebar('properties');},{capture:true});
        document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!compactLayout.matches){closeSidebar('catalog');closeSidebar('properties');}});
        compactLayout.addEventListener('change',()=>{for(const key of Object.keys(sidebarConfig))syncSidebar(key);});
        new MutationObserver(syncMobilePanels).observe(document.body,{attributes:true,attributeFilter:['class']});
        syncMobilePanels();
        document.addEventListener('click',event=>{if(compactLayout.matches&&event.target.closest('.app-settings>summary'))closeMobilePanels();});
        document.addEventListener('keydown',event=>{
            if(!compactLayout.matches||mobileBackdrop.hidden)return;
            const panel=document.body.classList.contains('mobile-catalog-open')?equipmentCatalog:document.getElementById('inspector');
            if(event.key==='Escape'){event.preventDefault();const key=panel===equipmentCatalog?'catalog':'properties';closeMobilePanels();mobileControls.querySelector(`[data-mobile-panel="${key}"]`).focus();}
            else if(event.key==='Tab'){
                const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
                const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
            }
        });

        const touchHint=document.createElement('p');touchHint.className='touch-catalog-hint';touchHint.textContent='Toque no nome para adicionar. No canvas, toque em Mover para arrastar equipamentos sem interferir nos cabos; dois dedos movem a bancada e ajustam o zoom.';
        equipmentCatalog.querySelector(':scope > .p-4').appendChild(touchHint);
        const mobileCategoryNav=document.createElement('nav');mobileCategoryNav.className='mobile-category-nav';mobileCategoryNav.setAttribute('aria-label','Categorias de equipamentos');
        mobileCategoryNav.innerHTML='<button type="button" data-category-target="Fontes de áudio">Fontes</button><button type="button" data-category-target="Amplificadores">Amplificadores</button><button type="button" data-category-target="Caixas">Caixas</button><button type="button" data-category-target="Móveis">Móveis</button><button type="button" data-category-target="Iluminação">Iluminação</button>';
        equipmentCatalog.querySelector('.catalog-panel-header')?.appendChild(mobileCategoryNav);
        mobileCategoryNav.addEventListener('click',event=>{const button=event.target.closest('[data-category-target]');if(!button)return;const title=button.dataset.categoryTarget,sections=[...equipmentCatalog.querySelectorAll('.flex-1.overflow-y-auto>.mb-6')],section=sections.find(candidate=>AudioSystemLanguage.sourceText(candidate.querySelector('h3')?.textContent.trim()||'').startsWith(title));section?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});

        function syncDeviceSelection() {
            Object.values(appState.project.devices).forEach(dev => {
                dev.el.classList.toggle('selected', appState.interface.selectedDeviceIds.has(dev.id));
            });
            const count = appState.interface.selectedDeviceIds.size;
            selectionCount.textContent = count ? `${count} selecionado${count === 1 ? '' : 's'}` : '';
        }

        function setDeviceSelection(ids, focusId = null) {
            appStateStore.actions.setSelectedDevices(new Set([...ids].filter(id => appState.project.devices[id])));
            const focus = focusId && appState.interface.selectedDeviceIds.has(focusId)
                ? focusId
                : [...appState.interface.selectedDeviceIds].at(-1) || null;
            selectDevice(focus, true);
        }

        function toggleDeviceSelection(id) {
            const next = new Set(appState.interface.selectedDeviceIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setDeviceSelection(next, next.has(id) ? id : null);
        }

        function devicesForCanvasAction(useSelection = true) {
            if (useSelection && appState.interface.selectedDeviceIds.size) {
                return [...appState.interface.selectedDeviceIds].map(id => appState.project.devices[id]).filter(Boolean);
            }
            return Object.values(appState.project.devices);
        }

        function centerDeviceSet(devices) {
            if (!devices.length) return;
            const bounds = devices.reduce((b, dev) => {
                const left = parseFloat(dev.el.style.left) || 0;
                const top = parseFloat(dev.el.style.top) || 0;
                return {
                    left: Math.min(b.left, left),
                    top: Math.min(b.top, top),
                    right: Math.max(b.right, left + dev.el.offsetWidth),
                    bottom: Math.max(b.bottom, top + dev.el.offsetHeight)
                };
            }, { left:Infinity, top:Infinity, right:-Infinity, bottom:-Infinity });
            const rect = canvas.getBoundingClientRect();
            const centerX = (bounds.left + bounds.right) / 2;
            const centerY = (bounds.top + bounds.bottom) / 2;
            animateViewTo({zoom:view.zoom,x:rect.width/2-centerX*view.zoom,y:rect.height/2-centerY*view.zoom});
        }

        function centerSelectedDevices() {
            centerDeviceSet(devicesForCanvasAction(true));
        }

        function organizeDevices() {
            const selected = appState.interface.selectedDeviceIds.size > 1;
            const devices = devicesForCanvasAction(selected);
            if (!devices.length) return;
            const order = ['turntable','turntableVintage','turntableLinear','cdPlayer','streamer','btReceiverA','btTransmitterPro','receiver','eqStudio','eqVintage','mixer','mixerVintage','crossover','crossoverVintage','rcaSwitch','speakerSwitch','speakerSwitchVintage','headphoneAmp','headphoneAmp4','powerAmp','spkPassiveWood','spkPassiveCarbon','spkPassiveGridBlack','spkPassiveGridOrange','spkActiveMonitor','spkActiveBookshelf','subwoofer','subwooferCube','subwooferPro','subwooferPassive','subwooferPassiveVintage','headphone','hpStudio','hpClassic'];
            const rank = new Map(order.map((type, index) => [type, index]));
            devices.sort((a, b) => (rank.get(a.type) ?? 99) - (rank.get(b.type) ?? 99) || (DEVICE_NAMES[a.type] || a.type).localeCompare(DEVICE_NAMES[b.type] || b.type));

            const columns = Math.min(4, Math.ceil(Math.sqrt(devices.length)));
            const rows = Math.ceil(devices.length / columns);
            const columnWidths = Array(columns).fill(0);
            const rowHeights = Array(rows).fill(0);
            devices.forEach((dev, index) => {
                const col = index % columns, row = Math.floor(index / columns);
                columnWidths[col] = Math.max(columnWidths[col], dev.el.offsetWidth);
                rowHeights[row] = Math.max(rowHeights[row], dev.el.offsetHeight);
            });
            const columnX = columnWidths.map((_, col) => 48 + columnWidths.slice(0, col).reduce((sum, width) => sum + width + 52, 0));
            const rowY = rowHeights.map((_, row) => 52 + rowHeights.slice(0, row).reduce((sum, height) => sum + height + 52, 0));
            devices.forEach((dev, index) => {
                const col = index % columns, row = Math.floor(index / columns);
                dev.el.style.left = `${Math.max(0, snapCoordinate(columnX[col]))}px`;
                dev.el.style.top = `${Math.max(0, snapCoordinate(rowY[row] + rowHeights[row]) - dev.el.offsetHeight)}px`;
            });
            updateCables();
            updateBluetoothLinks();
            centerDeviceSet(devices);
        }

        document.getElementById('center-devices').addEventListener('click', centerSelectedDevices);

        window.addEventListener('keydown', e => {
            if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
            const key = e.key.toLowerCase();
            if ((e.metaKey || e.ctrlKey) && key === 'a') {
                e.preventDefault();
                setDeviceSelection(Object.keys(appState.project.devices), Object.keys(appState.project.devices)[0] || null);
            } else if (key === 'escape') {
                selectCable(null);
                selectDevice(null);
            } else if (!e.metaKey && !e.ctrlKey && !e.altKey && key === 'o') {
                organizeDevices();
            } else if (!e.metaKey && !e.ctrlKey && !e.altKey && key === 'c') {
                centerSelectedDevices();
            }
        });

        canvas.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            if (e.target.closest('.device-node, .canvas-tools, button, path')) return;
            e.preventDefault();
            if (e.shiftKey) {
                const rect = canvas.getBoundingClientRect();
                const startX = e.clientX, startY = e.clientY;
                let moved = false;
                selectionMarquee.style.display = 'block';
                const move = ev => {
                    const left = Math.min(startX, ev.clientX) - rect.left;
                    const top = Math.min(startY, ev.clientY) - rect.top;
                    const width = Math.abs(ev.clientX - startX);
                    const height = Math.abs(ev.clientY - startY);
                    moved = width > 3 || height > 3 || moved;
                    Object.assign(selectionMarquee.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` });
                };
                const up = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    const box = selectionMarquee.getBoundingClientRect();
                    selectionMarquee.style.display = 'none';
                    if (!moved) return;
                    const next = new Set(appState.interface.selectedDeviceIds);
                    Object.values(appState.project.devices).forEach(dev => {
                        const deviceRect = dev.el.getBoundingClientRect();
                        const intersects = deviceRect.left <= box.right && deviceRect.right >= box.left && deviceRect.top <= box.bottom && deviceRect.bottom >= box.top;
                        if (intersects) next.add(dev.id);
                    });
                    setDeviceSelection(next);
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                return;
            }
            const startX = e.clientX, startY = e.clientY, startViewX = view.x, startViewY = view.y;
            let moved = false;
            const move = ev => {
                moved = Math.hypot(ev.clientX - startX, ev.clientY - startY) > 3 || moved;
                if (!moved) return;
                canvas.classList.add('panning');
                view.x = startViewX + ev.clientX - startX;
                view.y = startViewY + ev.clientY - startY;
                applyView();
            };
            const up = () => {
                canvas.classList.remove('panning');
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                if (!moved) { selectCable(null); selectDevice(null); }
            };
            window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        });

