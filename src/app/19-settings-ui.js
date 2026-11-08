/* Settings panel, theme controls, custom selects, and settings interactions. */
        const settingsMenu=document.createElement('details');settingsMenu.className='app-settings';
        settingsMenu.innerHTML='<summary aria-label="Abrir configurações" title="Configurações"><svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.1"/><circle cx="12" cy="12" r="2.7"/><path d="M12 1.8v3.1m0 14.2v3.1M1.8 12h3.1m14.2 0h3.1M4.3 4.3l2.2 2.2m11 11 2.2 2.2m0-15.4-2.2 2.2m-11 11-2.2 2.2"/></svg></summary>';
        clearCatalogFooter.className='app-settings-content';
        const themeSection=document.createElement('section');themeSection.className='settings-theme-section';themeSection.appendChild(canvasThemeControl);themeSection.appendChild(canvasGridControl);themeSection.appendChild(canvasBackdropControl);themeSection.appendChild(canvasTimeControl);
        const connectionHelpSetting=document.createElement('label');connectionHelpSetting.className='connection-help-setting';connectionHelpSetting.innerHTML='<input id="connection-help-enabled" type="checkbox"><span><strong>Orientação de conexões</strong><small>Mostra dicas e impede ligações incompatíveis. Desative para permitir erros quando os plugues encaixarem.</small></span>';
        const interactionSection=document.createElement('section');interactionSection.className='settings-theme-section';
        const connectionHelpCheckbox=connectionHelpSetting.querySelector('input');connectionHelpCheckbox.checked=appState.preferences.connectionGuidanceEnabled;interactionSection.appendChild(connectionHelpSetting);
        connectionHelpCheckbox.addEventListener('change',()=>{appStateStore.actions.setPreference('connectionGuidanceEnabled',connectionHelpCheckbox.checked);hideContextHelp();updatePortGuidance(true);scheduleAppPreferencesSave();});
        const rightAngleSetting=document.createElement('label');rightAngleSetting.className='connection-help-setting';rightAngleSetting.innerHTML='<input id="orthogonal-cables" type="checkbox"><span><strong>Cabos em ângulos retos</strong><small>Traça cabos com segmentos horizontais e verticais.</small></span>';
        const rightAngleCheckbox=rightAngleSetting.querySelector('input');rightAngleCheckbox.checked=appState.preferences.orthogonalCables;interactionSection.appendChild(rightAngleSetting);
        rightAngleCheckbox.addEventListener('change',()=>{appStateStore.actions.setPreference('orthogonalCables',rightAngleCheckbox.checked);updateCables();scheduleAppPreferencesSave();});
        const atmosphereHeading=document.createElement('div');atmosphereHeading.className='settings-icon-control atmosphere-heading';atmosphereHeading.textContent='Atmosfera';themeSection.appendChild(atmosphereHeading);
        const particleLevels=[12,25,50];
        let particleLevel=particleLevels.reduce((best,level)=>Math.abs(level-(savedAppPreferences.particleLastLevel||appState.preferences.roomParticleAmount||25))<Math.abs(best-(savedAppPreferences.particleLastLevel||appState.preferences.roomParticleAmount||25))?level:best,25);
        appStateStore.actions.setPreference('particleLastLevel',particleLevel);
        if(appState.preferences.roomParticleAmount>0){appStateStore.actions.setPreference('roomParticleAmount',particleLevel);updateRoomMotes(appState.canvas.backdrop,appState.canvas.time);}
        const particleSetting=document.createElement('div');particleSetting.className='settings-particle-control rain-controls particle-controls';
        const particleIcon=marks=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${marks}"/></svg>`;
        const sparkle='M12 2l1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4L12 2ZM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15Zm13-4 .8 2.2L21 14l-2.2.8L18 17l-.8-2.2L15 14l2.2-.8L18 11Z';
        particleSetting.innerHTML='<button id="room-particle-enabled" type="button" aria-label="Partículas" title="Partículas">'+particleIcon(sparkle)+'</button><div class="rain-intensity-control"><span title="Poucas partículas">'+particleIcon('M12 7v10M7 12h10')+'</span><input id="room-particle-amount" aria-label="Quantidade de partículas no cenário" type="range" min="0" max="2" step="1"><span title="Muitas partículas">'+particleIcon(sparkle)+'</span></div>';
        const particleToggle=particleSetting.querySelector('#room-particle-enabled'),particleSlider=particleSetting.querySelector('#room-particle-amount');
        function syncParticleControls(){const enabled=appState.preferences.roomParticleAmount>0;particleToggle.setAttribute('aria-pressed',String(enabled));const action=AudioSystemLanguage.translate(enabled?'Desativar partículas':'Ativar partículas');particleToggle.title=action;particleToggle.setAttribute('aria-label',action);particleSlider.value=particleLevels.indexOf(particleLevel);const name=AudioSystemLanguage.translate(['Poucas partículas','Partículas médias','Muitas partículas'][Number(particleSlider.value)]);particleSlider.setAttribute('aria-valuetext',name);particleSlider.title=name;}
        syncParticleControls();AudioSystemLanguage.subscribe(syncParticleControls);
        particleToggle.addEventListener('click',()=>{appStateStore.actions.setPreference('roomParticleAmount',appState.preferences.roomParticleAmount>0?0:particleLevel);syncParticleControls();updateRoomMotes(appState.canvas.backdrop,appState.canvas.time);scheduleAppPreferencesSave();});
        particleSlider.addEventListener('input',()=>{particleLevel=particleLevels[Number(particleSlider.value)];appStateStore.actions.setPreference('particleLastLevel',particleLevel);if(appState.preferences.roomParticleAmount>0)appStateStore.actions.setPreference('roomParticleAmount',particleLevel);syncParticleControls();updateRoomMotes(appState.canvas.backdrop,appState.canvas.time);scheduleAppPreferencesSave();});
        themeSection.appendChild(particleSetting);
        const rainSetting=document.createElement('section');rainSetting.className='settings-particle-control rain-controls';
        const rainCloud='<path d="M5 16a4 4 0 0 1-.5-8 6 6 0 0 1 11.5-2 4.5 4.5 0 0 1 1 9h-1"/>';
        const rainIcon=lines=>`<svg viewBox="0 0 24 24" aria-hidden="true">${rainCloud}<path d="${lines}"/></svg>`;
        rainSetting.innerHTML='<button id="room-rain-enabled" type="button" aria-label="Chuva nas janelas" title="Chuva nas janelas">'+rainIcon('m8 16-2 4m7-4-2 4m7-4-2 4')+'</button><div class="rain-intensity-control"><span title="Chuva leve">'+rainIcon('m12 17-1 3')+'</span><input id="room-rain-intensity" aria-label="Intensidade da chuva" type="range" min="0" max="2" step="1"><span title="Chuva forte">'+rainIcon('m6 16-2 5m7-5-2 5m7-5-2 5m7-5-2 5')+'</span></div>';
        const rainEnabled=rainSetting.querySelector('#room-rain-enabled'),rainIntensity=rainSetting.querySelector('#room-rain-intensity');
        const rainLevelLabels=['Chuva leve','Chuva média','Chuva forte'];
        function syncRainControls(){
            rainEnabled.setAttribute('aria-pressed',String(appState.preferences.rainEnabled));
            const action=AudioSystemLanguage.translate(appState.preferences.rainEnabled?'Desativar chuva':'Ativar chuva');rainEnabled.title=action;rainEnabled.setAttribute('aria-label',action);
            rainIntensity.value=rainIntensityLevels.indexOf(appState.preferences.rainIntensity);
            const name=AudioSystemLanguage.translate(rainLevelLabels[Number(rainIntensity.value)]);
            rainIntensity.setAttribute('aria-valuetext',name);rainIntensity.title=name;
        }
        syncRainControls();AudioSystemLanguage.subscribe(syncRainControls);
        rainEnabled.addEventListener('click',()=>{appStateStore.actions.setPreference('rainEnabled',!appState.preferences.rainEnabled);syncRainControls();updateRoomRain();scheduleAppPreferencesSave();});
        rainIntensity.addEventListener('input',()=>{appStateStore.actions.setPreference('rainIntensity',rainIntensityLevels[Number(rainIntensity.value)]);syncRainControls();updateRoomRain();scheduleAppPreferencesSave();});
        themeSection.appendChild(rainSetting);

        clearCatalogFooter.insertBefore(themeSection,soundControls);
        setCanvasTheme(appState.canvas.theme);

        const roomSection=document.createElement('section');roomSection.className='room-settings';
        roomSection.innerHTML='<label>Ambiente sonoro<select id="room-preset">'+Object.entries(ROOM_PRESETS).map(([key,value])=>`<option value="${key}">${value.name}</option>`).join('')+'</select></label><label for="room-intensity">Intensidade <output id="room-intensity-value">0/10</output></label><input id="room-intensity" type="range" min="0" max="10" step="1" value="0"><p>Reverberação estéreo na escuta final. Em zero, o áudio permanece seco.</p>';
        const roomPresetSelect=roomSection.querySelector('#room-preset');roomPresetSelect.hidden=true;roomPresetSelect.dataset.iconChoice='';
        const roomPresetIconPaths={
            near:'<path d="M4 13V11a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="7" rx="1.5"/><rect x="17" y="12" width="4" height="7" rx="1.5"/><path d="M7 19c1 2 3 2 5 2h2"/>',
            small:'<path d="M4 20V5h16v15M4 20h16M8 9v7m8-7v7M10 12h4"/><circle cx="12" cy="12" r="1"/>',
            large:'<path d="M2 20V4h20v16H2ZM7 8v9m10-9v9M10 11h4m-4 4h4M5 4l2 4m12-4-2 4"/>'
        };
        const roomPresetButtons=document.createElement('div');roomPresetButtons.className='room-preset-buttons';roomPresetButtons.setAttribute('role','group');
        function syncRoomPresetButtons(){
            roomPresetButtons.setAttribute('aria-label',AudioSystemLanguage.translate('Ambiente sonoro'));
            roomPresetButtons.querySelectorAll('button').forEach(button=>{const name=AudioSystemLanguage.translate(ROOM_PRESETS[button.dataset.value].name);button.title=name;button.setAttribute('aria-label',name);button.setAttribute('aria-pressed',String(button.dataset.value===roomPresetSelect.value));});
        }
        for(const [key,preset] of Object.entries(ROOM_PRESETS)){
            const button=document.createElement('button');button.type='button';button.dataset.value=key;button.setAttribute('aria-pressed','false');
            button.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${roomPresetIconPaths[key]}</svg>`;
            button.addEventListener('click',()=>{roomPresetSelect.value=key;roomPresetSelect.dispatchEvent(new Event('input',{bubbles:true}));});roomPresetButtons.appendChild(button);
        }
        roomPresetSelect.after(roomPresetButtons);syncRoomPresetButtons();AudioSystemLanguage.subscribe(syncRoomPresetButtons);
        clearCatalogFooter.insertBefore(roomSection,soundControls);
        SpotifyCoverflow.setBeforeRedirect(()=>{guidedAccess.save();return saveLocalProject(true);});
        const headphoneCalibrationSetting=document.createElement('section');headphoneCalibrationSetting.className='headphone-calibration-setting';
        headphoneCalibrationSetting.innerHTML='<strong>Ajuste de escuta com fones</strong><p>Volume, detalhes, estéreo, graves, agudos e sons da interface.</p><button id="open-headphone-calibration" type="button">Calibrar volume dos fones</button>';
        clearCatalogFooter.insertBefore(headphoneCalibrationSetting,soundControls);
        headphoneCalibrationSetting.querySelector('button').addEventListener('click',()=>{settingsMenu.open=false;openHeadphoneCalibration();});
        const listeningLevels=document.createElement('section');listeningLevels.className='listening-level-settings';
        listeningLevels.innerHTML=`<strong>Níveis de escuta</strong><label for="listening-output-level">Volume do programa <output id="listening-output-value">${Math.round(appState.preferences.listening.outputLevel*100)}%</output></label><input id="listening-output-level" type="range" min="50" max="120" step="5" value="${Math.round(appState.preferences.listening.outputLevel*100)}" aria-label="Volume de escuta do programa, relativo ao padrão"><label for="listening-bass-level">Graves <output id="listening-bass-value">${appState.preferences.listening.bass} dB</output></label><input id="listening-bass-level" type="range" min="-6" max="6" step="1" value="${appState.preferences.listening.bass}" aria-label="Graves da escuta"><label for="listening-treble-level">Agudos <output id="listening-treble-value">${appState.preferences.listening.treble} dB</output></label><input id="listening-treble-level" type="range" min="-6" max="6" step="1" value="${appState.preferences.listening.treble}" aria-label="Agudos da escuta"><p>Ajustes na saída de escuta; não alteram conexões nem potência simulada.</p>`;
        clearCatalogFooter.insertBefore(listeningLevels,soundControls);listeningLevels.appendChild(soundControls);
        listeningLevels.querySelector('#listening-output-level').addEventListener('input',event=>setListeningOutputLevel(Number(event.target.value)/100));
        for(const kind of ['bass','treble'])listeningLevels.querySelector(`#listening-${kind}-level`).addEventListener('input',event=>setListeningTone(kind,event.target.value));
        function setRoomSettings(settings){
            appStateStore.actions.setAudioEnvironment({preset:Object.hasOwn(ROOM_PRESETS,settings?.preset)?settings.preset:DEFAULT_ROOM_SETTINGS.preset,intensity:Number.isFinite(settings?.intensity)?Math.max(0,Math.min(10,Math.round(settings.intensity))):DEFAULT_ROOM_SETTINGS.intensity});
            roomPresetSelect.value=appState.audio.environment.preset;syncRoomPresetButtons();roomSection.querySelector('#room-intensity').value=appState.audio.environment.intensity;roomSection.querySelector('#room-intensity-value').textContent=appState.audio.environment.intensity+'/10';applyRoomAudio();
        }
        roomSection.addEventListener('input',()=>{setRoomSettings({preset:document.getElementById('room-preset').value,intensity:Number(document.getElementById('room-intensity').value)});scheduleProjectSave();});
        setRoomSettings(appState.audio.environment);

        const settingIcon=path=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
        const choiceIcons={
            scene:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 15h20M7 15V9h4v6m3 0v-4h4v4"/>',
            dots:'<circle cx="5" cy="5" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="19" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/>',
            lines:'<path d="M3 8h18M3 16h18M8 3v18m8-18v18"/>',hidden:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M5 19 19 5"/>',
            studioIllustrated:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M6 10h12M8 15h8m-4-5v5"/>',
            listeningIllustrated:'<path d="M3 4h18v16H3zM9 4v16M3 16h18"/><path d="M5 10h2"/>',
            loftIllustrated:'<path d="M2 20V5h20v15H2ZM8 5v15m8-15v15M2 11h20"/>',
            dawn:'<path d="M3 18h18M6 14a6 6 0 0 1 12 0M12 2v3M4 7l2 2m14-2-2 2"/>',
            dusk:'<path d="M3 18h18M7 16a5 5 0 0 1 10 0M12 4v3M5 10l2 2m12-2-2 2"/>',
            night:'<path d="M20 15.5A8 8 0 0 1 8.5 4a8 8 0 1 0 11.5 11.5ZM17 3v3m-1.5-1.5h3"/>'
        };
        const iconChoices=[
            [canvasThemeControl,'canvas-theme',canvasThemes],
            [canvasGridControl,'canvas-grid',canvasGridModes],
            [canvasBackdropControl,'canvas-backdrop',canvasBackdropModes],
            [canvasTimeControl,'canvas-time',canvasTimeModes]
        ];
        for(const [container,id,options] of iconChoices){
            const select=container.querySelector('select');select.dataset.iconChoice='';select.hidden=true;container.classList.add('settings-icon-control');
            const choices=document.createElement('div');choices.className='settings-icon-options';choices.setAttribute('role','group');choices.setAttribute('aria-label',container.firstElementChild.textContent);
            for(const [value,label] of Object.entries(options)){
                const button=document.createElement('button');button.type='button';button.dataset.value=value;button.title=label;button.setAttribute('aria-label',label);
                button.innerHTML=id==='canvas-theme'&&value!=='scene'?'<span class="settings-color-dot" aria-hidden="true"></span>':settingIcon(choiceIcons[value]||'');
                button.addEventListener('click',()=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));});choices.appendChild(button);
            }
            container.appendChild(choices);
            const sync=()=>choices.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.value===select.value)));
            select.addEventListener('change',sync);new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-theme','data-grid','data-backdrop','data-time']});sync();
        }
        const syncParticleVisibility=()=>{const hidden=canvas.dataset.theme!=='scene';atmosphereHeading.hidden=hidden;particleSetting.hidden=hidden;rainSetting.hidden=hidden;};
        new MutationObserver(syncParticleVisibility).observe(canvas,{attributes:true,attributeFilter:['data-theme']});syncParticleVisibility();
        const settingsGroup=(title,icon,nodes,open=false)=>{
            const group=document.createElement('details');group.className='settings-group';group.open=open;
            const summary=document.createElement('summary');summary.innerHTML=settingIcon(icon)+`<span>${title}</span>`;
            const content=document.createElement('div');content.className='settings-group-content';content.append(...nodes);group.append(summary,content);return group;
        };
        const clearButton=document.getElementById('clear-system');
        const languageSetting=document.createElement('div');languageSetting.className='language-setting';languageSetting.innerHTML='<span>Idioma</span><div class="language-options" role="group" aria-label="Idioma"><button type="button" class="language-choice" data-language="en" aria-label="English">EN</button><button type="button" class="language-choice" data-language="pt" aria-label="Português">PT</button></div>';
        const languageButtons=[...languageSetting.querySelectorAll('[data-language]')];
        languageButtons.forEach(button=>button.addEventListener('click',()=>AudioSystemLanguage.set(button.dataset.language)));
        const syncLanguageButtons=language=>languageButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===language)));
        syncLanguageButtons(AudioSystemLanguage.language);AudioSystemLanguage.subscribe(syncLanguageButtons);
        clearCatalogFooter.replaceChildren(
            languageSetting,
            settingsGroup('Visual','<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 3-4 5 6"/>',[themeSection],true),
            settingsGroup('Interação','<path d="M8 12V5a2 2 0 0 1 4 0v5m0-3a2 2 0 0 1 4 0v4m0-2a2 2 0 0 1 4 0v6c0 4-3 6-7 6h-2c-3 0-5-2-6-5l-2-4a2 2 0 0 1 3-2l2 2"/>',[interactionSection]),
            settingsGroup('Som','<path d="M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 1-2Zm16 0h-3v7h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-1-2Z"/>',[roomSection,headphoneCalibrationSetting,listeningLevels]),
            clearButton
        );

        settingsMenu.appendChild(clearCatalogFooter);
        MenuSlider.mount(settingsMenu);
        const topbarControls=document.getElementById('app-topbar').lastElementChild;
        topbarControls.append(projectTools,settingsMenu);
        topbarControls.insertBefore(document.querySelector('.canvas-tools'),projectTools);
        document.addEventListener('pointerdown',event=>{if(settingsMenu.open&&!settingsMenu.contains(event.target)&&!event.target.closest('.app-select-popup'))settingsMenu.open=false;});
        document.addEventListener('keydown',event=>{if(event.key==='Escape'&&settingsMenu.open){settingsMenu.open=false;settingsMenu.querySelector('summary').focus();}});
        function setupAppDropdowns(){
            const widgets=new WeakMap();let active=null,sequence=0,typeBuffer='',typeTime=0;
            const valueDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value'),indexDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'selectedIndex'),disabledDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'disabled');
            function close(restoreFocus=false){
                if(!active)return;const current=active;active=null;current.popup.remove();current.button.setAttribute('aria-expanded','false');current.button.removeAttribute('aria-activedescendant');if(restoreFocus&&current.button.isConnected)current.button.focus();
            }
            function position(){
                if(!active)return;const rect=active.button.getBoundingClientRect();if(!active.select.isConnected||!rect.width||!rect.height){close();return;}
                const viewport=window.visualViewport,width=viewport?.width||innerWidth,height=viewport?.height||innerHeight,offsetX=viewport?.offsetLeft||0,offsetY=viewport?.offsetTop||0;
                const popupWidth=Math.min(Math.max(rect.width,180),width-16),below=offsetY+height-rect.bottom-10,above=rect.top-offsetY-10,up=below<160&&above>below;
                active.popup.style.width=popupWidth+'px';active.popup.style.maxHeight=Math.max(48,Math.min(280,up?above:below))+'px';
                active.popup.style.left=Math.max(offsetX+8,Math.min(rect.left,offsetX+width-popupWidth-8))+'px';
                const popupHeight=active.popup.getBoundingClientRect().height;active.popup.style.top=(up?Math.max(offsetY+8,rect.top-popupHeight-5):rect.bottom+5)+'px';
            }
            function highlight(index){
                if(!active)return;const choices=active.choices;if(!choices.length)return;
                active.index=index;choices.forEach((choice,i)=>choice.classList.toggle('is-highlighted',i===index));
                const item=choices[index];if(item){active.button.setAttribute('aria-activedescendant',item.id);item.scrollIntoView({block:'nearest'});}
            }
            function choose(index){
                if(!active)return;const {select}=active,option=select.options[index];if(!option||option.disabled||option.parentElement.disabled)return;
                const button=active.button,changed=select.selectedIndex!==index;select.selectedIndex=index;close();
                if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
                if(button.isConnected)button.focus();
            }
            function buildOptions(){
                if(!active)return;const current=active;current.popup.replaceChildren();current.choices=[];
                [...current.select.options].forEach((option,index)=>{
                    const item=document.createElement('div');item.id=current.popup.id+'-'+index;item.className='app-select-option';item.setAttribute('role','option');item.setAttribute('aria-selected',String(index===current.select.selectedIndex));item.setAttribute('aria-disabled',String(option.disabled||!!option.parentElement.disabled));
                    const label=document.createElement('span');label.className='app-select-option-label';label.textContent=option.label||option.textContent;const check=document.createElement('span');check.className='app-select-check';check.textContent=index===current.select.selectedIndex?'✓':'';check.setAttribute('aria-hidden','true');item.append(label,check);
                    item.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'&&item.getAttribute('aria-disabled')!=='true')highlight(index);});
                    item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();choose(index);});current.choices.push(item);current.popup.appendChild(item);
                });
                position();highlight(Math.max(0,current.select.selectedIndex));
            }
            function open(widget){
                if(widget.select.disabled||!widget.select.options.length)return;
                close();const popup=document.createElement('div');popup.className='app-select-popup';popup.id=widget.popupId;popup.setAttribute('role','listbox');popup.setAttribute('aria-label',widget.button.getAttribute('aria-label')||'Opções');
                active={...widget,popup,index:widget.select.selectedIndex,choices:[]};(widget.button.closest('dialog[open]')||document.body).appendChild(popup);widget.button.setAttribute('aria-expanded','true');buildOptions();widget.button.focus();
            }
            function enabledIndex(start,direction){
                const count=active.select.options.length;for(let n=0,index=start;n<count;n++,index=(index+direction+count)%count){const option=active.select.options[index];if(option&&!option.disabled&&!option.parentElement.disabled)return index;}return active.index;
            }
            function enhance(select){
                if(widgets.has(select)||select.multiple||select.dataset.iconChoice!==undefined)return;
                const wrapper=document.createElement('span');wrapper.className='app-select';const button=document.createElement('button');button.type='button';button.className='app-select-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
                if(select.closest('#inspector-content'))Hardware.button(button,'ui');
                const popupId='app-select-list-'+(++sequence);button.setAttribute('aria-controls',popupId);
                const caption=document.createElement('span');caption.className='app-select-caption';const chevron=document.createElement('span');chevron.className='app-select-chevron';chevron.setAttribute('aria-hidden','true');button.append(caption,chevron);
                select.before(wrapper);wrapper.append(select,button);select.classList.add('app-select-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
                const widget={select,wrapper,button,caption,popupId};widgets.set(select,widget);
                const refresh=()=>{
                    const option=select.options[select.selectedIndex];caption.textContent=option?.label||option?.textContent||'Selecionar';button.disabled=select.disabled||!select.options.length;
                    const label=select.getAttribute('aria-label')||[...(select.labels||[])].map(label=>[...label.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join(' ').trim()).filter(Boolean).join(' ')||'Selecionar opção';button.setAttribute('aria-label',label);button.title=caption.textContent;
                    if(active?.select===select){if(button.disabled)close();else buildOptions();}
                };
                for(const [key,descriptor] of [['value',valueDescriptor],['selectedIndex',indexDescriptor],['disabled',disabledDescriptor]])Object.defineProperty(select,key,{configurable:true,get(){return descriptor.get.call(this);},set(value){descriptor.set.call(this,value);refresh();}});
                new MutationObserver(refresh).observe(select,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','selected','label','value','aria-label']});
                select.addEventListener('change',refresh);select.addEventListener('input',refresh);select.addEventListener('focus',()=>button.focus());
                button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(active?.select===select)close();else open(widget);});
                button.addEventListener('keydown',event=>{
                    if(event.ctrlKey||event.metaKey||event.altKey)return;
                    const key=event.key;
                    if(key==='Tab'){close();return;}
                    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(key)){
                        event.preventDefault();event.stopPropagation();
                        if(!active||active.select!==select){open(widget);if(key==='Home')highlight(enabledIndex(0,1));else if(key==='End')highlight(enabledIndex(select.options.length-1,-1));return;}
                        if(key==='Enter'||key===' '){choose(active.index);return;}
                        const direction=key==='ArrowUp'?-1:1,start=key==='Home'?0:key==='End'?select.options.length-1:(active.index+direction+select.options.length)%select.options.length;highlight(enabledIndex(start,key==='End'?-1:direction));
                    }else if(key.length===1){
                        event.preventDefault();const now=performance.now();typeBuffer=now-typeTime>700?key:typeBuffer+key;typeTime=now;if(!active||active.select!==select)open(widget);if(!active)return;
                        const query=typeBuffer.toLocaleLowerCase('pt-BR'),index=[...select.options].findIndex(option=>!option.disabled&&!option.parentElement.disabled&&(option.label||option.textContent).toLocaleLowerCase('pt-BR').startsWith(query));if(index>=0)highlight(index);
                    }
                });refresh();
            }
            document.querySelectorAll('select').forEach(enhance);
            new MutationObserver(records=>{
                records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==Node.ELEMENT_NODE||node.closest('#audio-world'))return;if(node.matches('select'))enhance(node);node.querySelectorAll('select').forEach(enhance);}));
                if(active&&!active.select.isConnected)close();
            }).observe(document.body,{childList:true,subtree:true});
            document.addEventListener('pointerdown',event=>{if(active&&!active.wrapper.contains(event.target)&&!active.popup.contains(event.target))close();},true);
            document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){event.preventDefault();event.stopImmediatePropagation();close(true);}},true);
            document.addEventListener('focusin',event=>{if(active&&!active.wrapper.contains(event.target)&&!active.popup.contains(event.target))close();});
            document.addEventListener('scroll',event=>{if(active&&!active.popup.contains(event.target))close();},true);
            window.addEventListener('resize',()=>close());window.addEventListener('blur',()=>close());
            window.visualViewport?.addEventListener('resize',()=>close());
            document.addEventListener('click',event=>{const label=event.target.closest('label[for]');if(label&&!event.target.closest('button,input,.app-select')){const select=document.getElementById(label.htmlFor),widget=widgets.get(select);if(widget){event.preventDefault();widget.button.focus();}}});
        }
        setupAppDropdowns();


