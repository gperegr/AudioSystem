/* Home menu, studio entry, and local project navigation. */
        const homeMenu=document.createElement('dialog');homeMenu.id='home-menu';homeMenu.className='home-menu';homeMenu.setAttribute('aria-labelledby','home-title');
        const homeArrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
        const homeBrand=document.querySelector('.app-brand');
        const homeMark=homeBrand.querySelector('svg').outerHTML;
        homeMenu.innerHTML=`<div class="home-shell">
            <header class="home-header"><span class="home-brand">${homeMark}<span>Audio Lab</span></span></header>
            <main class="home-main"><section class="home-intro"><h1 id="home-title">Audio Lab</h1>
                <nav class="home-actions" aria-label="Menu inicial"><button type="button" class="home-continue" data-home="continue" autofocus><span>Entrar no estúdio</span>${homeArrow}</button>
                <div class="home-project-actions"><button type="button" data-home="new"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Nova montagem</span></button><button type="button" data-home="open"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h6l2 3h10l-2 10H3ZM3 7V4h7l2 3h7v3"/></svg><span>Abrir projeto</span></button></div>
                <div class="home-secondary"><button type="button" data-home="settings">Configurações</button><button type="button" data-home="guide">Como funciona</button></div></nav>
                <p class="home-status" role="status" aria-live="polite"></p></section>
                <fieldset class="home-environments"><legend>Escolha seu ambiente</legend><div>${Object.entries(canvasBackdropModes).map(([scene,label])=>`<button type="button" data-home-scene="${scene}" aria-pressed="false"><img src="./assets/rooms/${RoomScenes.scenes[scene].image}.webp?v=ultrawide-1" alt="" loading="lazy"><span>${label}</span><i aria-hidden="true"></i></button>`).join('')}</div><div class="home-solid-environments">${Object.entries(canvasThemes).filter(([theme])=>theme!=='scene').map(([theme,label])=>`<button type="button" data-home-theme="${theme}" aria-pressed="false"><span class="home-color-preview" data-color="${theme}" aria-hidden="true"></span><span>${label}</span><i aria-hidden="true"></i></button>`).join('')}</div></fieldset>
            </main><section class="home-settings" aria-labelledby="home-settings-title" hidden><div class="home-settings-heading"><button type="button" data-home="back">Voltar</button><h1 id="home-settings-title">Configurações</h1></div><div class="home-settings-body"></div></section><footer class="home-footer"><div class="home-footer-controls"><div class="home-music-controls"><button type="button" data-home="music" aria-label="Ativar música do menu" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4Z M17 8a6 6 0 0 1 0 8"/><path class="home-music-muted" d="m3 3 18 18"/></svg><span>Música</span></button><input type="range" min="0" max="100" step="1" aria-label="Volume da música do menu"></div><div class="home-languages" role="group" aria-label="Idioma"><button type="button" data-home-language="pt" aria-label="Português">PT</button><button type="button" data-home-language="en" aria-label="English">EN</button></div></div></footer></div>`;
        document.body.appendChild(homeMenu);
        let homeWorkspaceStarted=false,homeImporting=false,homeMusicInteracted=false;
        const homeMusicButton=homeMenu.querySelector('[data-home="music"]'),homeMusicSlider=homeMenu.querySelector('.home-music-controls input');
        homeMusicSlider.value=Math.round(appState.preferences.menuMusicVolume*100);
        let homeMusicLastVolume=appState.preferences.menuMusicVolume||.22;
        const menuMusic=AudioLabMenuMusic.create({
            getContext:()=>{prepareUiAudio();return appState.audio.context;},getOutput:()=>appState.audio.listeningToneInput,
            getVolume:()=>appState.preferences.menuMusicVolume*appState.preferences.listening.outputLevel,
            isVisible:()=>homeMenu.open&&document.visibilityState==='visible',onChange:syncHomeMusicButton
        });
        function syncHomeMusicButton(){
            const state=menuMusic.state,label=menuMusic.active?'Pausar música do menu':'Ativar música do menu';
            homeMusicButton.setAttribute('aria-pressed',String(menuMusic.active));homeMusicButton.setAttribute('aria-busy',String(state.loading));
            homeMusicButton.setAttribute('aria-label',AudioSystemLanguage.translate(label));
            homeMusicButton.title=AudioSystemLanguage.translate(state.error?'Não foi possível carregar a música.':label);
        }
        function playHomeMusic(gesture=false){
            if(appState.preferences.menuMusicEnabled&&appState.preferences.menuMusicVolume>0&&homeMusicInteracted&&homeMenu.open)menuMusic.play({gesture});
        }
        function homeMusicGesture(event){
            if(!event.isTrusted||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.type==='pointerdown'&&event.button!==0)return;
            if(event.type==='keydown'&&!['Enter',' ','ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
            homeMusicInteracted=true;
            const action=event.target.closest?.('[data-home]')?.dataset.home;
            if(action||!homeMenu.open)return;
            playHomeMusic(true);
        }
        document.addEventListener('pointerdown',homeMusicGesture,true);document.addEventListener('keydown',homeMusicGesture,true);
        homeMusicButton.addEventListener('click',event=>{
            homeMusicInteracted=homeMusicInteracted||event.isTrusted;
            const enabled=!menuMusic.active;appStateStore.actions.setPreference('menuMusicEnabled',enabled);
            if(enabled){if(!appState.preferences.menuMusicVolume){appStateStore.actions.setPreference('menuMusicVolume',homeMusicLastVolume);homeMusicSlider.value=Math.round(homeMusicLastVolume*100);}playHomeMusic(event.isTrusted);}else menuMusic.stop();
            scheduleAppPreferencesSave();syncHomeMusicButton();
        });
        homeMusicSlider.addEventListener('input',event=>{
            const volume=Number(event.target.value)/100;appStateStore.actions.setPreference('menuMusicVolume',volume);
            if(volume>0)homeMusicLastVolume=volume;
            if(!volume)menuMusic.stop();else{menuMusic.updateVolume();playHomeMusic(event.isTrusted);}
            scheduleAppPreferencesSave();
        });
        homeMenu.addEventListener('close',()=>{if(!homeMenu.open)menuMusic.stop();});
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')menuMusic.stop({fade:.06});else playHomeMusic();});
        window.addEventListener('pagehide',()=>menuMusic.stop({fade:0}));
        AudioSystemLanguage.subscribe(syncHomeMusicButton);syncHomeMusicButton();
        const homeHasProject=()=>Object.keys(appState.project.devices).length>0||spotifyVinyls.size>0||spotifyAlbums.size>0;
        function syncHomeMenu(){
            const scene=appState.canvas.backdrop||DEFAULT_BACKDROP;
            homeMenu.querySelector('[data-home="continue"] span').textContent=homeHasProject()?'Continuar montagem':'Entrar no estúdio';
            homeMenu.querySelectorAll('[data-home-scene]').forEach(button=>button.setAttribute('aria-pressed',String(appState.canvas.theme==='scene'&&button.dataset.homeScene===scene)));
            homeMenu.querySelectorAll('[data-home-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeTheme===appState.canvas.theme)));
            homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeLanguage===AudioSystemLanguage.language)));
        }
        const homePaletteTokens=['top','side','panel','control','hover','border','text','secondary','muted','active','accent','shadow','scheme'];
        let homePreviewGeneration=0;
        async function previewHomeEnvironment(){
            const request=++homePreviewGeneration,theme=appState.canvas.theme;
            const palette=getComputedStyle(document.documentElement);
            const colors=Object.fromEntries(homePaletteTokens.map(key=>[key,palette.getPropertyValue('--ui-'+key).trim()]));
            const layer=document.createElement('div');layer.className='home-environment-layer';layer.setAttribute('aria-hidden','true');layer.style.backgroundColor=colors.side;
            if(theme==='scene'){
                const image=new Image();image.alt='';image.src=`./assets/rooms/${RoomScenes.scenes[appState.canvas.backdrop].image}.webp?v=ultrawide-1`;
                try{await image.decode();}catch{return;}
                if(request!==homePreviewGeneration)return;
                image.style.filter=getComputedStyle(canvas).getPropertyValue('--room-light-filter').trim()||'none';
                const scrim=document.createElement('div');scrim.className='home-environment-scrim';scrim.style.background=`linear-gradient(90deg,${colors.side} 0%,${colors.side}e6 25%,${colors.side}80 65%,${colors.side}33 100%)`;
                layer.append(image,scrim);
            }
            if(request!==homePreviewGeneration)return;
            const previous=[...homeMenu.querySelectorAll('.home-environment-layer')];
            homePaletteTokens.forEach(key=>homeMenu.style.setProperty('--ui-'+key,colors[key]));
            homeMenu.insertBefore(layer,homeMenu.querySelector('.home-shell'));
            const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?0:500;
            const fade=layer.animate([{opacity:0},{opacity:1}],{duration,easing:'ease-in-out'});
            await fade.finished.catch(()=>{});
            previous.forEach(old=>old.remove());
        }
        function showHomeSettings(show){
            homeMenu.querySelector('.home-main').hidden=show;
            homeMenu.querySelector('.home-settings').hidden=!show;
            if(show)homeMenu.querySelector('.home-settings-body').appendChild(clearCatalogFooter);
            else settingsMenu.appendChild(clearCatalogFooter);
            homeMenu.setAttribute('aria-labelledby',show?'home-settings-title':'home-title');
            homeMenu.querySelector(show?'[data-home="back"]':'[data-home="continue"]').focus({preventScroll:true});
        }
        homeMenu.querySelector('[data-home="back"]').addEventListener('click',()=>showHomeSettings(false));
        function openHomeMenu(event){
            if(homeImporting)return;
            activeCatalogPreviewCleanup?.();activeEquipmentMoveCleanup?.();
            settingsMenu.open=false;hideContextHelp();hideToolbarTooltip();stopViewMotion();
            showHomeSettings(false);syncHomeMenu();homeMenu.querySelector('.home-status').textContent='';
            if(!homeMenu.open)homeMenu.showModal();
            disposeRoomRainAudio();stopCableHum();stopRoomMotes();roomBackdrop.classList.add('room-effects-paused');
            homeMenu.querySelector('[data-home="continue"]').focus({preventScroll:true});
            playHomeMusic(!!event?.isTrusted);
        }
        function enterHomeStudio(onboard=true){
            menuMusic.stop();showHomeSettings(false);
            if(homeMenu.open)homeMenu.close();
            stopViewMotion();setOpeningView();applyView();
            roomBackdrop.classList.toggle('room-effects-paused',document.visibilityState!=='visible');startRoomMotes();syncRoomRainAudio();
            if(onboard&&!homeWorkspaceStarted){homeWorkspaceStarted=true;if(!appState.preferences.headphonePromptSeen)openHeadphoneCalibration();else{guidedAccess.restore();guidedAccess.offer();}}
        }
        homeMenu.addEventListener('cancel',event=>{event.preventDefault();if(!homeImporting){if(!homeMenu.querySelector('.home-settings').hidden)showHomeSettings(false);else enterHomeStudio();}});
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
        homeMenu.querySelector('[data-home="settings"]').addEventListener('click',event=>{showHomeSettings(true);playHomeMusic(event.isTrusted);});
        homeMenu.querySelector('[data-home="guide"]').addEventListener('click',()=>{enterHomeStudio(false);guidedAccess.open();});
        homeMenu.querySelectorAll('[data-home-theme]').forEach(button=>button.addEventListener('click',()=>{setCanvasTheme(button.dataset.homeTheme);scheduleAppPreferencesSave();syncHomeMenu();previewHomeEnvironment();}));
        homeMenu.querySelectorAll('[data-home-scene]').forEach(button=>button.addEventListener('click',()=>{setCanvasTheme('scene');setCanvasBackdrop(button.dataset.homeScene);scheduleAppPreferencesSave();syncHomeMenu();previewHomeEnvironment();stopRoomMotes();roomBackdrop.classList.add('room-effects-paused');}));
        homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.addEventListener('click',()=>{AudioSystemLanguage.set(button.dataset.homeLanguage);syncHomeMenu();}));
        AudioSystemLanguage.subscribe(()=>{homeMenu.querySelectorAll('[data-home-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.homeLanguage===AudioSystemLanguage.language)));});
        const homeReturn=document.createElement('button');homeReturn.type='button';homeReturn.className=homeBrand.className;homeReturn.innerHTML=homeBrand.innerHTML;homeReturn.setAttribute('aria-label','Menu inicial');homeReturn.dataset.tooltip='Menu inicial';homeBrand.replaceWith(homeReturn);homeReturn.addEventListener('click',openHomeMenu);
