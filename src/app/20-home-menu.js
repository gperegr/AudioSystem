/* Home menu, studio entry, and local project navigation. */
        const homeMenu=document.createElement('dialog');homeMenu.id='home-menu';homeMenu.className='home-menu';homeMenu.setAttribute('aria-labelledby','home-title');
        const homeArrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
        const homeBrand=document.querySelector('.app-brand');
        const homeMark=homeBrand.querySelector('svg').outerHTML;
        homeMenu.innerHTML=`<img class="home-backdrop" alt="" aria-hidden="true"><div class="home-scrim" aria-hidden="true"></div><div class="home-shell">
            <header class="home-header"><span class="home-brand">${homeMark}<span>Audio Lab</span></span></header>
            <main class="home-main"><section class="home-intro"><p class="home-eyebrow">Menu inicial</p><h1 id="home-title">Audio Lab</h1>
                <nav class="home-actions" aria-label="Menu inicial"><button type="button" class="home-continue" data-home="continue" autofocus><span>Entrar no estúdio</span>${homeArrow}</button>
                <div class="home-project-actions"><button type="button" data-home="new"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Nova montagem</span></button><button type="button" data-home="open"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 3h10l-2 10H3ZM3 7V4h7l2 3h7v3"/></svg><span>Abrir projeto</span></button></div>
                <div class="home-secondary"><button type="button" data-home="settings">Configurações</button><button type="button" data-home="guide">Como funciona</button></div></nav>
                <p class="home-status" role="status" aria-live="polite"></p></section>
                <fieldset class="home-environments"><legend>Escolha seu ambiente</legend><div>${Object.entries(canvasBackdropModes).map(([scene,label])=>`<button type="button" data-home-scene="${scene}" aria-pressed="false"><img src="./assets/rooms/${RoomScenes.scenes[scene].image}.webp?v=ultrawide-1" alt="" loading="lazy"><span>${label}</span><i aria-hidden="true"></i></button>`).join('')}</div></fieldset>
            </main><footer class="home-footer"><span class="home-local"><i aria-hidden="true"></i><span>Neste dispositivo</span></span><div class="home-languages" role="group" aria-label="Idioma"><button type="button" data-home-language="pt" aria-label="Português">PT</button><button type="button" data-home-language="en" aria-label="English">EN</button></div></footer></div>`;
        document.body.appendChild(homeMenu);
        let homeWorkspaceStarted=false,homeImporting=false;
        const homeHasProject=()=>Object.keys(appState.project.devices).length>0||spotifyVinyls.size>0||spotifyAlbums.size>0;
        function syncHomeMenu(){
            const scene=appState.canvas.backdrop||DEFAULT_BACKDROP,definition=RoomScenes.scenes[scene];
            const backdrop=homeMenu.querySelector('.home-backdrop'),src=`./assets/rooms/${definition.image}.webp?v=ultrawide-1`;
            if(backdrop.getAttribute('src')!==src)backdrop.src=src;
            homeMenu.style.setProperty('--home-scene-filter',getComputedStyle(canvas).getPropertyValue('--room-light-filter').trim()||'none');
            homeMenu.querySelector('[data-home="continue"] span').textContent=homeHasProject()?'Continuar montagem':'Entrar no estúdio';
            homeMenu.querySelectorAll('[data-home-scene]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeScene===scene)));
            homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeLanguage===AudioSystemLanguage.language)));
        }
        function openHomeMenu(){
            if(homeImporting)return;
            activeCatalogPreviewCleanup?.();activeEquipmentMoveCleanup?.();
            settingsMenu.open=false;hideContextHelp();hideToolbarTooltip();stopViewMotion();
            syncHomeMenu();homeMenu.querySelector('.home-status').textContent='';
            if(!homeMenu.open)homeMenu.showModal();
            stopRoomMotes();roomBackdrop.classList.add('room-effects-paused');
            homeMenu.querySelector('[data-home="continue"]').focus({preventScroll:true});
        }
        function enterHomeStudio(onboard=true){
            if(homeMenu.open)homeMenu.close();
            roomBackdrop.classList.toggle('room-effects-paused',document.visibilityState!=='visible');startRoomMotes();
            if(onboard&&!homeWorkspaceStarted){homeWorkspaceStarted=true;if(!appState.preferences.headphonePromptSeen)openHeadphoneCalibration();else{guidedAccess.restore();guidedAccess.offer();}}
        }
        homeMenu.addEventListener('cancel',event=>{event.preventDefault();if(!homeImporting)enterHomeStudio();});
        homeMenu.addEventListener('keydown',event=>{if(event.key!=='Escape')event.stopPropagation();});
        homeMenu.querySelector('[data-home="continue"]').addEventListener('click',()=>enterHomeStudio());
        homeMenu.querySelector('[data-home="new"]').addEventListener('click',async()=>{
            if(homeHasProject()&&!await showAppDialog({title:'Nova montagem',message:'Substituir a montagem atual? Exporte uma cópia se quiser guardá-la.',acceptLabel:'Começar nova montagem',requireChoice:true}))return;
            const devices=Object.values(appState.project.devices);if(devices.length)recordDeletedDevices(devices);
            [...spotifyVinyls.values()].forEach(removeSpotifyVinyl);[...spotifyAlbums.values()].forEach(removeSpotifyAlbum);devices.forEach(dev=>deleteDevice(dev));
            selectDevice(null);selectCable(null);updateCables();updateCableFlows();setOpeningView();applyView();scheduleProjectSave();enterHomeStudio();
        });
        homeMenu.querySelector('[data-home="open"]').addEventListener('click',()=>{homeMenu.querySelector('.home-status').textContent='';document.getElementById('project-file').click();});
        document.getElementById('project-file').addEventListener('change',event=>{
            if(!homeMenu.open||!event.target.files.length)return;
            homeImporting=true;homeMenu.querySelectorAll('button').forEach(button=>button.disabled=true);
            homeMenu.querySelector('.home-status').textContent='Abrindo projeto…';
        },true);
        window.addEventListener('audio-project-import',event=>{homeImporting=false;homeMenu.querySelectorAll('button').forEach(button=>button.disabled=false);if(!homeMenu.open)return;if(event.detail.ok)enterHomeStudio();else homeMenu.querySelector('.home-status').textContent='Não foi possível abrir o projeto.';});
        homeMenu.querySelector('[data-home="settings"]').addEventListener('click',()=>{enterHomeStudio(false);settingsMenu.open=true;settingsMenu.querySelector('summary').focus();});
        homeMenu.querySelector('[data-home="guide"]').addEventListener('click',()=>{enterHomeStudio(false);guidedAccess.open();});
        homeMenu.querySelectorAll('[data-home-scene]').forEach(button=>button.addEventListener('click',()=>{setCanvasTheme('scene');setCanvasBackdrop(button.dataset.homeScene);scheduleAppPreferencesSave();syncHomeMenu();stopRoomMotes();roomBackdrop.classList.add('room-effects-paused');}));
        homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.addEventListener('click',()=>{AudioSystemLanguage.set(button.dataset.homeLanguage);syncHomeMenu();}));
        AudioSystemLanguage.subscribe(()=>{homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeLanguage===AudioSystemLanguage.language)));});
        const homeReturn=document.createElement('button');homeReturn.type='button';homeReturn.className=homeBrand.className;homeReturn.innerHTML=homeBrand.innerHTML;homeReturn.setAttribute('aria-label','Menu inicial');homeReturn.dataset.tooltip='Menu inicial';homeBrand.replaceWith(homeReturn);homeReturn.addEventListener('click',openHomeMenu);
