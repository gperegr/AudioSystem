/* Catalog visuals, search, category layout, hover signatures, and port normalization. */
        function catalogIcon(type) {
            const drawing = AudioAdapterDesign.models[type] ? AudioAdapterDesign.icon(type) : CatalogEquipmentIcons[type];
            if(!drawing)throw new Error('Missing catalog artwork: '+type);
            return `<svg class="catalog-equipment-icon" viewBox="0 0 56 46" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`;
        }
        const headphoneCatalogGrid=equipmentCatalog.querySelector('[data-template="hpStudio"]').closest('.grid');
        [['hpMonitor','Fone Monitor'],['hpMax','Fone Max'],...Object.keys(REFERENCE_HEADPHONES).map(type=>[type,DEVICE_NAMES[type]])].forEach(([type,label])=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${label}</span>`;headphoneCatalogGrid.appendChild(item);if(REFERENCE_HEADPHONES[type])catalogDescriptions[type]=REFERENCE_HEADPHONES[type].description;
        });
        const switchCatalogSection=document.createElement('div');switchCatalogSection.className='mb-6';
        switchCatalogSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Seletores</h3><div class="grid grid-cols-2 gap-3"></div>';
        const switchCatalogItems=[...equipmentCatalog.querySelectorAll('.catalog-item')].filter(item=>SELECTOR_TYPES.has(item.dataset.template)||MATRIX_TYPES.has(item.dataset.template));
        if(switchCatalogItems.length){
            const originalSections=new Set(switchCatalogItems.map(item=>item.closest('.mb-6')));
            switchCatalogItems[0].closest('.mb-6').after(switchCatalogSection);
            switchCatalogItems.forEach(item=>switchCatalogSection.querySelector('.grid').appendChild(item));
            originalSections.forEach(section=>{if(!section.querySelector('.catalog-item'))section.remove();});
        }
        const processingGrid=equipmentCatalog.querySelector('[data-template="preamp"]').closest('.mb-6').querySelector('.grid');
        Object.keys(INTEGRATED_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);
            catalogDescriptions[type]=INTEGRATED_AMPS[type].description;
        });
        for(const [type,description] of [
            ['preAurenne220','Pré estéreo com sintonia AM/FM, duas entradas phono MM e monitor de fita.'],
            ['powerAurenne220','Potência estéreo de 220 W por canal a 8 Ω, com bancos A e B para caixas passivas.'],
        ]){
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';
            item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;
            processingGrid.appendChild(item);catalogDescriptions[type]=description;
        }
        Object.keys(CUSTOM_PREAMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_PREAMPS[type].description;
        });
        Object.keys(CUSTOM_POWER_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_POWER_AMPS[type].description;
        });
        const speakerCatalogSection=equipmentCatalog.querySelector('[data-template="spkPassiveWood"]').closest('.mb-6');
        Object.keys({...FLOOR_SPEAKERS,...BOOKSHELF_SPEAKERS,spkActiveRounded:{}}).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;speakerCatalogSection.querySelector('.grid').appendChild(item);if(type!=='spkActiveRounded')catalogDescriptions[type]=(FLOOR_SPEAKERS[type]||BOOKSHELF_SPEAKERS[type]).description;
        });
        for(const [title,types] of [['Caixas Ativas',ACTIVE_SPK],['Caixas Passivas',PASSIVE_SPK],['Subwoofers',new Set([...SUB_TYPES,...PASSIVE_SUB_TYPES])]]){
            const section=document.createElement('div');section.className='mb-6';
            section.innerHTML=`<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">${title}</h3><div class="grid grid-cols-2 gap-3"></div>`;
            const grid=section.querySelector('.grid');
            [...speakerCatalogSection.querySelectorAll('.catalog-item')].filter(item=>types.has(item.dataset.template)).forEach(item=>grid.appendChild(item));
            speakerCatalogSection.before(section);
        }
        speakerCatalogSection.remove();
        const interfaceSection = document.createElement('div');
        interfaceSection.className = 'mb-6';
        interfaceSection.innerHTML = '<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Adaptadores & Conversores</h3><div class="grid grid-cols-2 gap-3">' + Object.entries(INTERFACE_DEVICES).map(([type,config])=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('') + '</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(interfaceSection);
        const furnitureSection=document.createElement('div');furnitureSection.className='mb-6';
        furnitureSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Móveis</h3><div class="grid grid-cols-2 gap-3">'+[...Object.keys(FURNITURE_TYPES),'pendantLamp',...Object.keys(WALL_LAMP_TYPES)].map(type=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('')+'</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(furnitureSection);
        // Build the final catalogue by function after all generated models are present.
        const catalogContainer=equipmentCatalog.querySelector('.flex-1.overflow-y-auto');
        const catalogItems=[...catalogContainer.querySelectorAll('.catalog-item[data-template]')];
        const previousCatalogSections=[...catalogContainer.querySelectorAll('.mb-6')].filter(section=>section.querySelector('.catalog-item'));
        const catalogGroups=[
            ['Fontes de áudio',type=>TURNTABLE_TYPES.has(type)||['tapeDeck','streamer','cdPlayer',...CAPTURE_INTERFACE_TYPES].includes(type)],
            ['Bluetooth',type=>BT_RX_TYPES.has(type)||BT_TX_TYPES.has(type)],
            ['Pré-amplificadores',type=>['preamp','preAurenne220'].includes(type)||!!CUSTOM_PREAMPS[type]],
            ['Amplificadores integrados',type=>!!INTEGRATED_AMPS[type]||type==='streamIntegrated'],
            ['Receivers',type=>['receiver','powerAmp'].includes(type)],
            ['Amplificadores de potência',type=>['powerStereo','powerVintage','powerAurenne220'].includes(type)||!!CUSTOM_POWER_AMPS[type]],
            ['Amplificadores de fones',type=>type.startsWith('headphoneAmp')],
            ['Equalizadores',type=>EQ_TYPES.has(type)],
            ['Crossovers',type=>CROSSOVER_TYPES.has(type)],
            ['Mixers',type=>type==='mixer'||type==='mixerVintage'],
            ['Seletores',type=>SELECTOR_TYPES.has(type)||MATRIX_TYPES.has(type)],
            ['Medição & Análise',type=>SIGNAL_GENERATOR_TYPES.has(type)||['benchMeter','benchMeterVintage'].includes(type)],
            ['Adaptadores & Conversores',type=>!!INTERFACE_DEVICES[type]],
            ['Caixas Ativas',type=>ACTIVE_SPK.has(type)],
            ['Caixas Passivas · Bookshelf',type=>!!BOOKSHELF_SPEAKERS[type]||['spkPassiveCarbon','spkPassiveWood'].includes(type)],
            ['Caixas Passivas · Três vias',type=>['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type)],
            ['Caixas Passivas · Piso',type=>!!FLOOR_SPEAKERS[type]],
            ['Caixas Passivas',type=>PASSIVE_SPK.has(type)],
            ['Subwoofers',type=>SUB_TYPES.has(type)||PASSIVE_SUB_TYPES.has(type)],
            ['Fones de ouvido',type=>HP_TYPES.has(type)],
            ['Móveis',type=>!!FURNITURE_TYPES[type]],
            ['Iluminação',type=>type==='pendantLamp'||!!WALL_LAMP_TYPES[type]],
            ['DEBUG',type=>type==='hardwareDemo']
        ];
        const catalogAssigned=new Set();
        const catalogItemName=item=>item.querySelector(':scope > span')?.textContent.trim()||DEVICE_NAMES[item.dataset.template]||item.dataset.template;
        const appendCatalogGroup=(title,items)=>{
            if(!items.length)return;
            const section=document.createElement('section');section.className='mb-6 catalog-category';
            const heading=document.createElement('h3');heading.className='text-[10px] font-bold text-gray-400 mb-3 tracking-wider uppercase';heading.textContent=title;
            const grid=document.createElement('div');grid.className='grid grid-cols-2 gap-3';
            items.sort((a,b)=>catalogItemName(a).localeCompare(catalogItemName(b),'pt-BR',{sensitivity:'base',numeric:true}))
                .forEach(item=>{catalogAssigned.add(item);item.dataset.catalogCategory=title;grid.appendChild(item);});
            section.append(heading,grid);catalogContainer.appendChild(section);
        };
        catalogGroups.forEach(([title,matches])=>appendCatalogGroup(title,catalogItems.filter(item=>!catalogAssigned.has(item)&&matches(item.dataset.template))));
        const catalogUnassigned=catalogItems.filter(item=>!catalogAssigned.has(item));
        if(catalogUnassigned.length)throw new Error(`Equipment contract missing catalog category: ${catalogUnassigned.map(item=>item.dataset.template).join(', ')}`);
        previousCatalogSections.forEach(section=>section.remove());
        const debugCatalogSection=[...catalogContainer.querySelectorAll('.catalog-category')].find(section=>section.querySelector('[data-template="hardwareDemo"]'));
        debugCatalogSection.hidden=!DEBUG_CATALOG_ENABLED;
        document.querySelectorAll('.catalog-item[data-template]').forEach(item => {
            const oldIcon = item.firstElementChild;
            if (oldIcon) oldIcon.outerHTML = catalogIcon(item.dataset.template);
            item.querySelector(':scope > span')?.classList.add('catalog-product-label');
            EquipmentBrands.catalog(item,item.dataset.template);
        });
        const catalogAmpTip=document.createElement('aside');catalogAmpTip.id='catalog-amp-tooltip';catalogAmpTip.setAttribute('role','tooltip');document.body.appendChild(catalogAmpTip);
        const isCatalogListeningType=type=>PASSIVE_SPK.has(type)||ACTIVE_SPK.has(type)||HP_TYPES.has(type)||SUB_TYPES.has(type)||PASSIVE_SUB_TYPES.has(type);
        let catalogAmpTimer=0,catalogAmpTarget=null;
        const hideCatalogAmpTip=()=>{clearTimeout(catalogAmpTimer);catalogAmpTarget=null;catalogAmpTip.classList.remove('is-visible');};
        const showCatalogAmpTip=(item,delay)=>{
            if(!item)return;
            if(item===catalogAmpTarget)return;
            hideCatalogAmpTip();catalogAmpTarget=item;
            catalogAmpTimer=setTimeout(()=>{
                if(!item.isConnected||item.getClientRects().length===0)return;
                const type=item.dataset.template;
                const title=DEVICE_NAMES[type]||item.textContent.trim();
                const signatureOnly=isCatalogListeningType(type);
                const amplifier=!!AMPLIFICATION_VOICINGS[type];
                if(signatureOnly||amplifier){
                    catalogAmpTip.classList.add('catalog-signature-only');
                    catalogAmpTip.innerHTML=signatureOnly
                        ?`<div class="catalog-listening-preview" aria-label="Assinatura sonora de ${title}">${listeningProfilePreviewHtml(type)}${catalogRatingVisualHtml(type)}</div>`
                        :`<div class="catalog-listening-preview" aria-label="Características do amplificador ${title}">${amplificationInspectorHtml({amplificationProfile:AMPLIFICATION_VOICINGS[type]})}${catalogRatingVisualHtml(type)}</div>`;
                }else{
                    catalogAmpTip.classList.remove('catalog-signature-only');
                    catalogAmpTip.innerHTML='';
                }
                const rect=item.getBoundingClientRect(),w=catalogAmpTip.offsetWidth,h=catalogAmpTip.offsetHeight;
                catalogAmpTip.style.left=Math.min(innerWidth-w-10,rect.right+14)+'px';
                catalogAmpTip.style.top=Math.max(8,Math.min(innerHeight-h-8,rect.top+(rect.height-h)/2))+'px';
                catalogAmpTip.classList.remove('is-visible');void catalogAmpTip.offsetWidth;catalogAmpTip.classList.add('is-visible');
            },delay);
        };
        catalogItems.filter(item=>AMPLIFICATION_VOICINGS[item.dataset.template]||isCatalogListeningType(item.dataset.template)).forEach(item=>{
            item.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')showCatalogAmpTip(item,500);});
            item.addEventListener('pointerleave',hideCatalogAmpTip);
            item.addEventListener('focusin',()=>showCatalogAmpTip(item,0));
            item.addEventListener('focusout',hideCatalogAmpTip);
        });
        equipmentCatalog.addEventListener('scroll',()=>{if(catalogAmpTip.classList.contains('is-visible'))hideCatalogAmpTip();},true);
        equipmentCatalog.addEventListener('pointerdown',hideCatalogAmpTip);
        const EQUIPMENT_HOVER_DELAY = 1600;
        const contextHelp = document.createElement('aside');
        contextHelp.id = 'context-help';
        contextHelp.className = 'context-help';
        contextHelp.setAttribute('role','tooltip');
        contextHelp.innerHTML = '<strong></strong><span></span>';
        document.body.appendChild(contextHelp);
        const contextHeading = contextHelp.querySelector('strong');
        const contextMessage = contextHelp.querySelector('span');
        let contextHelpTarget = null, contextHelpTimer = 0, contextHelpMode = null;
        let blockedHintDevice = null, contextTouchTarget = null, contextTouchStart = null, contextTouchTimer = 0;

        function hideContextHelp(){
            clearTimeout(contextHelpTimer);
            contextHelp.classList.remove('is-visible');
            if(contextHelpTarget){
                const ids = (contextHelpTarget.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== contextHelp.id);
                if(ids.length)contextHelpTarget.setAttribute('aria-describedby', ids.join(' '));
                else contextHelpTarget.removeAttribute('aria-describedby');
            }
            contextHelpTarget = null;
            contextHelpMode = null;
        }
        function cancelContextTouch(){
            clearTimeout(contextTouchTimer);
            contextTouchTarget = contextTouchStart = null;
        }
        // Keep the accessible label and help text without triggering a native title popup.
        function prepareEquipmentHint(element){
            if(!(element instanceof Element) || !element.matches('.device-node *'))return;
            const title = element.getAttribute('title');
            if(!title)return;
            element.dataset.canvasHint = title;
            element.removeAttribute('title');
            if(!element.hasAttribute('aria-label') || element.dataset.canvasHintLabel === 'generated'){
                element.setAttribute('aria-label', title);
                element.dataset.canvasHintLabel = 'generated';
            }
        }
        function prepareEquipmentHints(root){
            if(!(root instanceof Element))return;
            prepareEquipmentHint(root);
            root.querySelectorAll('[title]').forEach(prepareEquipmentHint);
        }
        prepareEquipmentHints(world);
        new MutationObserver(records => {
            if(contextHelpTarget && !world.contains(contextHelpTarget))hideContextHelp();
            if(contextTouchTarget && !world.contains(contextTouchTarget))cancelContextTouch();
            if(blockedHintDevice && !world.contains(blockedHintDevice))blockedHintDevice = null;
            for(const record of records){
                if(record.type === 'attributes')prepareEquipmentHint(record.target);
                else record.addedNodes.forEach(prepareEquipmentHints);
            }
        }).observe(world, {subtree:true, childList:true, attributes:true, attributeFilter:['title']});

        function contextTarget(element){
            if(!(element instanceof Element) || !element.matches('#audio-world .device-node *'))return null;
            return element.closest('.port,button,input,select,[role="switch"],[role="slider"]') || element.closest('[data-canvas-hint]');
        }
        function positionContextHelp(target){
            const rect = target.getBoundingClientRect(), tip = contextHelp.getBoundingClientRect(), gap = 10;
            const {width:w,height:h} = tip;
            const candidates = [
                {x:rect.right+gap,y:rect.top+(rect.height-h)/2},
                {x:rect.left-w-gap,y:rect.top+(rect.height-h)/2},
                {x:rect.left+(rect.width-w)/2,y:rect.bottom+gap},
                {x:rect.left+(rect.width-w)/2,y:rect.top-h-gap}
            ];
            const valid = candidates.find(({x,y}) => x>=8 && x+w<=innerWidth-8 && y>=8 && y+h<=innerHeight-8);
            if(!valid)return false;
            contextHelp.style.left = valid.x+'px';
            contextHelp.style.top = valid.y+'px';
            return true;
        }
        function showContextHelp(element, delay=EQUIPMENT_HOVER_DELAY, mode='hover'){
            const target = contextTarget(element);
            if(!target || (mode === 'hover' && !appState.preferences.equipmentHintsEnabled))return;
            if(contextHelpTarget === target && contextHelpMode === mode)return;
            hideContextHelp();
            contextHelpTarget = target;
            contextHelpMode = mode;
            contextHelpTimer = setTimeout(() => {
                if(!target.isConnected || !target.getClientRects().length){hideContextHelp();return;}
                const port = target.classList.contains('port');
                const title = target.getAttribute('title') || target.dataset.canvasHint;
                const name = (port && target.dataset.baseTitle) || target.getAttribute('aria-label') || target.labels?.[0]?.textContent.trim() || target.textContent.trim();
                const detail = port
                    ? (appState.preferences.connectionGuidanceEnabled && title) || `${target.dataset.io==='out'?'Saída':'Entrada'} ${target.dataset.format||target.dataset.type||'de áudio'} · ${signalName(getPortSignal(target))}.`
                    : title || target.getAttribute('aria-description');
                contextHeading.textContent = detail && detail !== name ? AudioSystemLanguage.translate(name) : '';
                contextHeading.hidden = !contextHeading.textContent;
                contextMessage.textContent = AudioSystemLanguage.translate(detail || name);
                if(!contextMessage.textContent || !positionContextHelp(target)){hideContextHelp();return;}
                const ids = new Set((target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
                ids.add(contextHelp.id);
                target.setAttribute('aria-describedby', [...ids].join(' '));
                contextHelp.classList.add('is-visible');
            }, delay);
        }

        world.addEventListener('pointerover', event => {
            if(event.pointerType === 'touch' || event.buttons || !appState.preferences.equipmentHintsEnabled)return;
            const target = contextTarget(event.target);
            if(!target || target === contextTarget(event.relatedTarget) || target.closest('.device-node') === blockedHintDevice)return;
            showContextHelp(target);
        });
        world.addEventListener('pointerout', event => {
            const next = event.relatedTarget;
            if(blockedHintDevice && !(next instanceof Node && blockedHintDevice.contains(next)))blockedHintDevice = null;
            if(contextHelpMode === 'hover' && contextTarget(event.target) === contextHelpTarget && contextTarget(next) !== contextHelpTarget)hideContextHelp();
        });
        world.addEventListener('focusin', event => {
            const target = contextTarget(event.target);
            if(target?.matches(':focus-visible'))showContextHelp(target, 0, 'focus');
        });
        world.addEventListener('focusout', event => {
            if(contextHelpMode === 'focus' && contextTarget(event.target) === contextHelpTarget)hideContextHelp();
        });
        document.addEventListener('pointerdown', event => {
            hideContextHelp();
            cancelContextTouch();
            if(event.pointerType !== 'touch'){
                blockedHintDevice = event.target.closest?.('#audio-world .device-node') || null;
                return;
            }
            const target = contextTarget(event.target);
            if(!target)return;
            contextTouchTarget = target;
            contextTouchStart = {x:event.clientX,y:event.clientY};
            contextTouchTimer = setTimeout(() => showContextHelp(target, 0, 'touch'), 620);
        }, true);
        document.addEventListener('pointermove', event => {
            if(event.pointerType === 'touch' && contextTouchStart && Math.hypot(event.clientX-contextTouchStart.x,event.clientY-contextTouchStart.y)>9){
                cancelContextTouch();
                if(contextHelpMode === 'touch')hideContextHelp();
            }
        }, true);
        document.addEventListener('pointerup', event => {
            if(event.pointerType === 'touch')cancelContextTouch();
        }, true);
        document.addEventListener('pointercancel', () => {cancelContextTouch();hideContextHelp();}, true);
        window.addEventListener('blur', () => {blockedHintDevice = null;cancelContextTouch();hideContextHelp();});
        const equipmentSearch = document.getElementById('equipment-search');
        const catalogSections = [...equipmentCatalog.querySelectorAll('.mb-6')].filter(section => section.querySelector('.catalog-item'));
        const catalogSearchSynonyms={optica:['optical','toslink','digital'],optical:['optica','toslink','digital'],digital:['optica','optical','toslink'],entrada:['input'],input:['entrada'],saida:['output'],output:['saida'],linha:['line'],line:['linha'],phono:['vinil','toca discos','riaa'],rca:['analogo','audio'],p2:['minijack','fone','headphone'],p10:['jack','fone','headphone','6 35 mm'],wire:['fio','borne','caixa passiva'],fio:['wire','borne','caixa passiva'],passiva:['passive','amplificado','speaker'],passivo:['passive','amplificado','speaker'],caixa:['speaker','alto falante'],fone:['headphone','p2','p10'],bluetooth:['sem fio','wireless'],potencia:['amplificado','speaker']};
        function catalogPortTerms(item){
            const type=item.dataset.template,template=document.getElementById(`tpl-${type}`),ports=template?[...template.content.querySelectorAll('.port')]:[];
            return ports.map(port=>{
                const kind=port.dataset.type||'',signal=port.dataset.signal||'',direction=port.dataset.io||'',format=port.dataset.format||'',node=port.dataset.node||'',title=port.getAttribute('title')||'';
                return `${kind} ${signal} ${direction} ${format} ${node} ${title} ${kind==='wire'?'fio borne speaker passiva amplificada':kind.startsWith('rca')?'rca analógico linha phono subwoofer':kind==='p2'?'p2 fone headphones estéreo':kind==='p10'?'p10 jack headphones microfone':''} ${signal==='line'?'linha audio analógico':signal==='phono'?'phono toca discos riaa':signal==='amplified'?'amplificado potência caixa passiva':signal==='headphone'?'fone headphone amplificado':''}`;
            }).join(' ');
        }
        const catalogSearchText=item=>normalizeSearch(`${item.textContent} ${DEVICE_NAMES[item.dataset.template]||''} ${catalogDescriptions[item.dataset.template]||''} ${item.dataset.catalogCategory||''} ${catalogPortTerms(item)}`);
        const searchEmpty = document.createElement('p');
        searchEmpty.className = 'p-4 text-sm text-gray-400 text-center';
        searchEmpty.setAttribute('role', 'status');
        searchEmpty.textContent = 'Nenhum equipamento encontrado.';
        searchEmpty.hidden = true;
        catalogSections[0]?.parentElement.appendChild(searchEmpty);
        const normalizeSearch = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        let selectedSetupCategory = null;
        equipmentSearch.addEventListener('input', () => {
            const query=normalizeSearch(equipmentSearch.value),terms=query.split(/\s+/).filter(Boolean);
            const exactModels=new Set(catalogItems.filter(item=>item.dataset.model&&[item.dataset.model,`${item.dataset.brand} ${item.dataset.model}`].some(label=>normalizeSearch(label)===query)));
            let total = 0;
            catalogSections.forEach(section => {
                if(section===debugCatalogSection&&!DEBUG_CATALOG_ENABLED){section.hidden=true;return;}
                let visible = 0;
                section.querySelectorAll('.catalog-item').forEach(item => {
                    const text = catalogSearchText(item);
                    item.hidden = exactModels.size ? !exactModels.has(item) : !terms.every(term => [term,...(catalogSearchSynonyms[term]||[])].some(candidate=>text.includes(normalizeSearch(candidate))));
                    if (!item.hidden) visible++;
                });
                section.hidden = visible === 0 || (!terms.length && selectedSetupCategory !== null && !selectedSetupCategory.matches(section.querySelector('.catalog-item').dataset.catalogCategory));
                total += visible;
            });
            searchEmpty.hidden = total > 0;
        });
        equipmentSearch.addEventListener('keydown', event => {
            if (event.key === 'Escape') { equipmentSearch.value = ''; equipmentSearch.dispatchEvent(new Event('input')); event.stopPropagation(); }
        });
        function updateCatalogPlacementPreview(preview,target){
            const el=preview.el,w=el.offsetWidth,h=el.offsetHeight,bottom=target.y+h,wall=!!WALL_LAMP_TYPES[preview.type],pendant=preview.type==='pendantLamp',valid=wall||pendant?target.x>=sceneSideInset()&&target.x+w<=world.offsetWidth-sceneSideInset()&&target.y>=0&&bottom<=(wall?wallPlacementBottom():maxEquipmentBottom()):canPlaceEquipment(preview,target.x,target.y);
            const supported=Math.abs(bottom-maxEquipmentBottom())<=2||Object.values(appState.project.devices).some(other=>placementShapes(other,parseFloat(other.el.style.left)||0,parseFloat(other.el.style.top)||0).some(shape=>Math.abs(bottom-shape.y)<=2&&Math.min(target.x+w,shape.x+shape.width)-Math.max(target.x,shape.x)>0));
            el.style.left=target.x+'px';el.style.top=target.y+'px';el.classList.toggle('is-invalid',!valid);el.classList.toggle('is-supported',valid&&supported);
            const label=!valid?'Espaço indisponível':wall?'Fixado à parede':pendant?'Suspenso':supported?'Apoiado':'Espaço livre';el.dataset.previewLabel=`${AudioSystemLanguage.translate(label)} · ${w} × ${h}`;
            el.querySelector('.catalog-placement-label').textContent=el.dataset.previewLabel;
            Hardware.updateLightingDemo();
        }
        let activeCatalogPreviewCleanup=null;
        let activeEquipmentMoveCleanup=null;
        function consumePlacementClick(event){
            event.preventDefault();event.stopImmediatePropagation();
            // The placement click must not also activate a control beneath the equipment.
            window.addEventListener('click',click=>{click.preventDefault();click.stopImmediatePropagation();},{capture:true,once:true});
        }
        function startCatalogCursorPlacement(item){
            activeCatalogPreviewCleanup?.();activeEquipmentMoveCleanup?.();
            const type=item.dataset.template,preview=createDevice(type,0,0,null,true);
            if(!preview)return;
            equipmentSearch.blur();
            let target=null;
            const inside=event=>{const rect=canvas.getBoundingClientRect();return event.clientX>=rect.left&&event.clientX<rect.right&&event.clientY>=rect.top&&event.clientY<rect.bottom;};
            const move=event=>{
                preview.el.hidden=!inside(event);
                if(preview.el.hidden){target=null;return;}
                const point=screenToWorld(event.clientX,event.clientY),width=preview.el.offsetWidth,height=preview.el.offsetHeight;
                const x=snapCoordinateWithin(point.x-width/2,sceneSideInset(),world.offsetWidth-width-sceneSideInset());
                const bottomLimit=WALL_LAMP_TYPES[type]?wallPlacementBottom():maxEquipmentBottom();
                const y=snapCoordinateWithin(point.y+height/2,height,bottomLimit)-height;
                target=snapOnEquipment(preview,x,y);updateCatalogPlacementPreview(preview,target);
            };
            const cleanup=()=>{
                preview.el.remove();document.body.classList.remove('equipment-cursor-placement','equipment-drag-active');
                window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',place,true);
                window.removeEventListener('keydown',escape,true);window.removeEventListener('blur',cleanup);window.removeEventListener('pointercancel',cleanup);
                if(activeCatalogPreviewCleanup===cleanup)activeCatalogPreviewCleanup=null;
            };
            const place=event=>{
                if(event.button!==0||event.pointerType==='touch'||!inside(event))return;
                consumePlacementClick(event);move(event);
                if(!target||preview.el.classList.contains('is-invalid'))return;
                const {x,y}=target;cleanup();createDevice(type,x,y);playUiSound('drop');
            };
            const escape=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();cleanup();}};
            activeCatalogPreviewCleanup=cleanup;
            document.body.classList.add('equipment-cursor-placement','equipment-drag-active');
            hideCatalogAmpTip();
            window.addEventListener('pointermove',move);window.addEventListener('pointerdown',place,true);
            window.addEventListener('keydown',escape,true);window.addEventListener('blur',cleanup);window.addEventListener('pointercancel',cleanup);
        }

        function bindCatalogItem(item) {
            item.addEventListener('dragstart', e => e.preventDefault());
            item.addEventListener('pointerdown', e => {
                if (e.button !== 0) return;
                if(e.pointerType!=='touch'){e.preventDefault();startCatalogCursorPlacement(item);return;}
                activeCatalogPreviewCleanup?.();activeEquipmentMoveCleanup?.();
                if(e.pointerType==='touch'&&!item.firstElementChild.contains(e.target)){
                    const start={x:e.clientX,y:e.clientY,id:e.pointerId};
                    const cleanup=()=>{item.removeEventListener('pointerup',tap);item.removeEventListener('pointercancel',cleanup);};
                    const tap=event=>{
                        cleanup();if(event.pointerId!==start.id||Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)return;
                        const rect=canvas.getBoundingClientRect(),point=screenToWorld(rect.left+rect.width/2,rect.top+rect.height/2),type=item.dataset.template;
                        const preview=createDevice(type,0,0,null,true);if(!preview)return;
                        preview.el.hidden=false;
                        const x=Math.max(sceneSideInset(),Math.min(world.offsetWidth-preview.el.offsetWidth-sceneSideInset(),snapCoordinate(point.x-preview.el.offsetWidth/2)));
                        const y=Math.max(0,Math.min(maxEquipmentBottom()-preview.el.offsetHeight,snapCoordinate(point.y-preview.el.offsetHeight/2+preview.el.offsetHeight)-preview.el.offsetHeight));
                        const target=snapOnEquipment(preview,x,y);updateCatalogPlacementPreview(preview,target);
                        closeMobilePanels();
                        const actions=document.createElement('div');actions.className='catalog-preview-actions';actions.innerHTML='<button type="button" data-preview-cancel>Cancelar</button><button type="button" data-preview-confirm>Adicionar</button>';document.body.appendChild(actions);
                        const cleanupPreview=()=>{preview.el.remove();actions.remove();document.removeEventListener('keydown',escapePreview);if(activeCatalogPreviewCleanup===cleanupPreview)activeCatalogPreviewCleanup=null;};activeCatalogPreviewCleanup=cleanupPreview;
                        const escapePreview=event=>{if(event.key==='Escape'){event.preventDefault();cleanupPreview();}};document.addEventListener('keydown',escapePreview);
                        actions.querySelector('[data-preview-cancel]').onclick=cleanupPreview;
                        actions.querySelector('[data-preview-confirm]').onclick=()=>{cleanupPreview();createDevice(type,target.x,target.y);playUiSound('drop');
                            const added=appState.project.devices[appState.interface.selectedDeviceId];
                            if(compactLayout.matches&&added){
                                const width=added.el.offsetWidth,height=added.el.offsetHeight,tools=document.querySelector('.canvas-tools'),usableHeight=Math.max(120,rect.height-tools.offsetHeight-40);
                                const zoom=clampZoom(Math.min(view.zoom,(rect.width-32)/width,(usableHeight-32)/height));
                                animateViewTo({zoom,x:(rect.width-width*zoom)/2-(parseFloat(added.el.style.left)||0)*zoom,y:(usableHeight-height*zoom)/2-(parseFloat(added.el.style.top)||0)*zoom});
                            }
                        };actions.querySelector('[data-preview-confirm]').focus({preventScroll:true});
                    };
                    item.addEventListener('pointerup',tap);item.addEventListener('pointercancel',cleanup);return;
                }
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
                const type = item.dataset.template;
                const placementPreview=createDevice(type,0,0,null,true);
                const rect = item.getBoundingClientRect();
                const cRect = canvas.getBoundingClientRect();
                
                const ghost = item.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.width = `${rect.width}px`;
                ghost.style.height = `${rect.height}px`;
                ghost.style.left = `${rect.left}px`;
                ghost.style.top = `${rect.top}px`;
                ghost.style.opacity = '0.8';
                ghost.style.pointerEvents = 'none';
                ghost.style.zIndex = '9999';
                document.body.appendChild(ghost);
                
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                
                const move = ev => {
                    ev.preventDefault();
                    if(e.pointerType==='touch'&&Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)>8)closeMobilePanels();
                    ghost.style.left = `${ev.clientX - offsetX}px`;
                    ghost.style.top = `${ev.clientY - offsetY}px`;
                    if(placementPreview){
                        const inside=ev.clientX>cRect.left&&ev.clientX<cRect.right&&ev.clientY>cRect.top&&ev.clientY<cRect.bottom;
                        placementPreview.el.hidden=!inside;
                        if(inside){const pos=screenToWorld(ev.clientX-offsetX+rect.width/2,ev.clientY-offsetY+rect.height/2),x=Math.max(0,snapCoordinate(pos.x-rect.width/2)),y=Math.max(0,snapCoordinate(pos.y-rect.height/2+placementPreview.el.offsetHeight)-placementPreview.el.offsetHeight),target=snapOnEquipment(placementPreview,x,y);updateCatalogPlacementPreview(placementPreview,target);}
                    }
                };
                
                const up = ev => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    window.removeEventListener('pointercancel', up);
                    ghost.remove();placementPreview?.el.remove();
                    
                    if (ev.type!=='pointercancel' && !ev.cancelled && ev.clientX > cRect.left && ev.clientX < cRect.right && ev.clientY > cRect.top && ev.clientY < cRect.bottom) {
                        const pos = screenToWorld(ev.clientX - offsetX + rect.width / 2, ev.clientY - offsetY + rect.height / 2);
                        createDevice(type, pos.x - rect.width / 2, pos.y - rect.height / 2);

                        playUiSound('drop');
                    }
                };
                
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                window.addEventListener('pointercancel', up);
            });
        }
        document.querySelectorAll('.catalog-item').forEach(bindCatalogItem);
        const quickCatalog=document.createElement('section');quickCatalog.className='catalog-quick-access';
        catalogContainer.prepend(quickCatalog);
        const quickKey='audio-system-catalog-quick-v1';
        let quickData;try{quickData=JSON.parse(localStorage.getItem(quickKey))||{};}catch{quickData={};}
        const validTypes=new Set(catalogItems.map(item=>item.dataset.template));
        const clean=list=>Array.isArray(list)?[...new Set(list.filter(type=>validTypes.has(type)))].slice(0,12):[];
        quickData={favorites:clean(quickData.favorites)};
        function saveQuick(){try{localStorage.setItem(quickKey,JSON.stringify(quickData));}catch{}}
        function updateStars(){catalogItems.forEach(item=>{
            const button=item.querySelector('.catalog-favorite');
            if(!button)return;
            const favorite=quickData.favorites.includes(item.dataset.template);
            button.setAttribute('aria-pressed',String(favorite));
        });}
        function renderQuick(){
            quickCatalog.replaceChildren();
            for(const [title,types] of [['Favoritos',quickData.favorites]]){
                if(!types.length)continue;const section=document.createElement('div');section.className='mb-6';const heading=document.createElement('h3');heading.className='text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase';heading.textContent=title;const grid=document.createElement('div');grid.className='grid grid-cols-2 gap-3';section.append(heading,grid);
                types.forEach(type=>{const original=catalogItems.find(item=>item.dataset.template===type);if(!original)return;const copy=original.cloneNode(true);copy.querySelector('.catalog-favorite')?.remove();bindCatalogItem(copy);grid.appendChild(copy);});quickCatalog.appendChild(section);
            }
            if(!quickData.favorites.length){const empty=document.createElement('p');empty.className='p-4 text-sm';empty.setAttribute('role','status');empty.textContent='Nenhum favorito ainda.';quickCatalog.appendChild(empty);}
            updateStars();AudioSystemLanguage.translateTree?.(quickCatalog);
        }
        catalogItems.forEach(item=>{const button=document.createElement('button');button.type='button';button.className='catalog-favorite';button.title='Favoritar equipamento';button.setAttribute('aria-label','Favoritar equipamento');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.9 6.5.9-4.7 4.6 1.1 6.5-5.7-3.1-5.7 3.1 1.1-6.5L2.7 9.8l6.5-.9Z"/></svg>';button.addEventListener('pointerdown',event=>event.stopPropagation());button.addEventListener('click',event=>{event.stopPropagation();const type=item.dataset.template;quickData.favorites=quickData.favorites.includes(type)?quickData.favorites.filter(t=>t!==type):[type,...quickData.favorites].slice(0,12);saveQuick();renderQuick();equipmentSearch.dispatchEvent(new Event('input'));});item.appendChild(button);});
        renderQuick();

        // A 16-unit outer gutter and compact 6-unit clearances between stacked devices.
        // Shared shallow top-down perspective: every top recedes 1 px inward per 2 px of depth.
        const setupFeet=(left,width,bottom)=>`<g class="setup-feet"><rect x="${left+9}" y="${bottom}" width="6" height="4" rx="1"/><rect x="${left+width-15}" y="${bottom}" width="6" height="4" rx="1"/></g>`;
        const setupCategories = [
            {id:'sources',label:'Fontes de áudio',matches:name=>['Fontes de áudio','Bluetooth'].includes(name),box:[105.5,90,188,54],art:'<path class="setup-top" d="m5 31 9-18h160l9 18Z"/><rect class="setup-face" x="5" y="31" width="178" height="16" rx="2"/><ellipse cx="72" cy="22" rx="35" ry="8"/><ellipse class="setup-detail" cx="72" cy="22" rx="25" ry="5.7"/><ellipse cx="72" cy="22" rx="4" ry="1.5"/><path class="setup-detail" d="M72 18v4"/><ellipse cx="157" cy="18" rx="4" ry="2"/><path d="M157 18v7l-23 6-5-1"/><circle cx="15" cy="39" r="1.5"/><path class="setup-detail" d="M24 39h8m127 0h10"/>'+setupFeet(5,178,47)},
            {id:'amps',label:'Amplificadores',matches:name=>/amplificador|Amplificador|Receivers/.test(name),box:[105.5,144,188,43],art:'<path class="setup-top" d="m5 12 4.5-9h169l4.5 9Z"/><rect class="setup-face" x="5" y="12" width="178" height="25" rx="2"/><path class="setup-detail" d="M17 22h61m-61 5h61"/><rect class="setup-detail" x="94" y="19" width="22" height="10" rx="1"/><circle cx="156" cy="24" r="8"/><path class="setup-detail" d="M156 18v3"/><circle cx="132" cy="24" r="1.7"/>'+setupFeet(5,178,37)},
            {id:'processing',label:'Processamento',matches:name=>['Equalizadores','Crossovers','Mixers','Seletores'].includes(name),box:[105.5,188,188,40],art:'<path class="setup-top" d="m5 11 4-8h170l4 8Z"/><rect class="setup-face" x="5" y="11" width="178" height="23" rx="2"/><path class="setup-detail" d="M24 17v12m23-12v12m23-12v12m23-12v12m23-12v12m23-12v12"/><path d="M20 21h8m15 4h8m15-7h8m15 5h8m15 3h8m15-6h8"/><circle class="setup-detail" cx="166" cy="23" r="2"/>'+setupFeet(5,178,34)},
            {id:'speakers',label:'Caixas & Subwoofers',matches:name=>name.startsWith('Caixas')||name==='Subwoofers',box:[11,132,73,172],art:'<path class="setup-top" d="m5 16 5-10h53l5 10Z"/><rect class="setup-face" x="5" y="16" width="63" height="145" rx="2"/><rect class="setup-detail" x="11" y="23" width="51" height="131" rx="1"/><ellipse cx="36.5" cy="48" rx="7" ry="6.7"/><ellipse class="setup-detail" cx="36.5" cy="48" rx="2.5" ry="2.4"/><ellipse cx="36.5" cy="111" rx="22" ry="21"/><ellipse class="setup-detail" cx="36.5" cy="111" rx="16" ry="15.3"/><ellipse cx="36.5" cy="111" rx="6" ry="5.7"/>'+setupFeet(5,63,161)},
            {id:'phones',label:'Fones de ouvido',matches:name=>name==='Fones de ouvido',box:[15.5,67,64,82],art:'<ellipse class="setup-top" cx="32" cy="76" rx="18" ry="4"/><path class="setup-detail" d="M32 26v48"/><path class="setup-top" d="M9 44V31C9 5 55 5 55 31v13h-4V31c0-20-38-20-38 0v13Z"/><path class="setup-detail" d="M10 32v9m44-9v9M25 20q7-3 14 0"/><g transform="rotate(-8 13 52)"><rect class="setup-face" x="6" y="39" width="14" height="27" rx="6"/><path class="setup-detail" d="M7 43q6-4 12 0m-5 3v15"/></g><g transform="rotate(8 51 52)"><rect class="setup-face" x="44" y="39" width="14" height="27" rx="6"/><path class="setup-detail" d="M45 43q6-4 12 0m-7 3v15"/></g>'},
            {id:'lab',label:'Medição & Conexões',matches:name=>['Medição & Análise','Adaptadores & Conversores','DEBUG'].includes(name),box:[105.5,229,188,43],art:'<path class="setup-top" d="m5 12 4.5-9h169l4.5 9Z"/><rect class="setup-face" x="5" y="12" width="178" height="25" rx="2"/><rect class="setup-detail" x="17" y="18" width="93" height="13" rx="1"/><path d="M21 26h15l7-5 9 8 10-6h43"/><path class="setup-detail" d="M125 20h12m-12 9h12"/><circle cx="159" cy="23" r="4.5"/><circle class="setup-detail" cx="173" cy="28" r="1.8"/>'+setupFeet(5,178,37)},
            {id:'furniture',label:'Móveis & Iluminação',matches:name=>['Móveis','Iluminação'].includes(name),box:[91,274,217,31],art:'<path class="setup-top" d="m4 11 4.5-9h200l4.5 9Z"/><rect class="setup-face" x="4" y="11" width="209" height="6" rx="1"/>'+setupFeet(4,209,17)}
        ];
        const setupNav=document.createElement('section');setupNav.className='catalog-setup';
        setupNav.innerHTML='<div class="catalog-setup-scene" role="group" aria-label="Categorias de equipamentos"><svg class="setup-room" viewBox="0 0 320 320" aria-hidden="true"><ellipse class="setup-ground" cx="160" cy="301" rx="144" ry="5"/></svg><button type="button" class="setup-all" data-setup-all aria-label="Todos os equipamentos" title="Todos os equipamentos"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="5" height="5" rx="1"/><rect x="15" y="4" width="5" height="5" rx="1"/><rect x="4" y="15" width="5" height="5" rx="1"/><rect x="15" y="15" width="5" height="5" rx="1"/></svg></button></div>';
        const setupScene=setupNav.querySelector('.catalog-setup-scene');
        const favoritesCategory={id:'favorites',matches:()=>false};
        const favoritesButton=document.createElement('button');favoritesButton.type='button';favoritesButton.className='setup-all setup-favorites';
        favoritesButton.dataset.setupCategory='favorites';favoritesButton.setAttribute('aria-label','Favoritos');favoritesButton.title='Favoritos';favoritesButton.setAttribute('aria-pressed','false');
        favoritesButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.9 6.5.9-4.7 4.6 1.1 6.5-5.7-3.1-5.7 3.1 1.1-6.5L2.7 9.8l6.5-.9Z"/></svg>';
        favoritesButton.addEventListener('click',()=>selectSetupCategory(favoritesCategory));setupScene.appendChild(favoritesButton);

        setupCategories.forEach(category=>{
            const button=document.createElement('button');button.type='button';button.className='setup-object';
            button.dataset.setupCategory=category.id;button.setAttribute('aria-label',category.label);button.title=category.label;button.setAttribute('aria-pressed','false');
            const [x,y,w,h]=category.box;
            button.style.cssText=`left:${x/3.2}%;top:${y/3.2}%;width:${w/3.2}%;height:${h/3.2}%`;
            button.innerHTML=`<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">${category.art}</svg>`;
            button.addEventListener('click',()=>selectSetupCategory(category));setupScene.appendChild(button);
        });
        function selectSetupCategory(category){
            selectedSetupCategory=category&&selectedSetupCategory?.id===category.id?null:category;equipmentSearch.value='';
            setupNav.querySelectorAll('[data-setup-category]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.setupCategory===selectedSetupCategory?.id)));
            setupNav.querySelector('[data-setup-all]').setAttribute('aria-pressed',String(selectedSetupCategory===null));
            equipmentSearch.dispatchEvent(new Event('input'));
        }
        setupNav.querySelector('[data-setup-all]').addEventListener('click',()=>selectSetupCategory(null));
        equipmentCatalog.appendChild(setupNav);
        const dockSilhouette=document.createElementNS('http://www.w3.org/2000/svg','svg');
        dockSilhouette.classList.add('catalog-dock-silhouette');dockSilhouette.setAttribute('aria-hidden','true');
        const dockContour=document.createElementNS('http://www.w3.org/2000/svg','path');dockSilhouette.appendChild(dockContour);
        equipmentCatalog.prepend(dockSilhouette);
        const setupLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');
        setupLayer.classList.add('catalog-setup-layer');setupLayer.setAttribute('aria-hidden','true');
        setupLayer.innerHTML='<defs><clipPath id="catalog-setup-layer-clip"><rect/></clipPath></defs><path clip-path="url(#catalog-setup-layer-clip)"/>';
        equipmentCatalog.appendChild(setupLayer);

        const sizeDockContour=()=>{
            const w=equipmentCatalog.clientWidth,h=equipmentCatalog.clientHeight;
            const dockBounds=equipmentCatalog.getBoundingClientRect();
            const search=equipmentCatalog.querySelector('.catalog-search');
            const searchBounds=search.getBoundingClientRect();
            const padding=Math.min(16,searchBounds.left-dockBounds.left);
            const left=searchBounds.left-dockBounds.left-padding;
            const searchRadius=parseFloat(getComputedStyle(search).borderTopRightRadius)||10;
            const top=Math.max(1,searchBounds.top-dockBounds.top-padding);
            const radius=searchRadius+padding;
            const shoulder=searchBounds.right-dockBounds.left-searchRadius;
            const outerRight=searchBounds.right-dockBounds.left+padding;
            const trayTop=equipmentCatalog.querySelector(':scope > .overflow-y-auto').offsetTop;
            dockSilhouette.setAttribute('viewBox',`0 0 ${w} ${h}`);
            const contour=`M${left} ${h} V${top+radius} Q${left} ${top} ${left+radius} ${top} H${shoulder} C${outerRight} ${top} ${outerRight} ${trayTop} ${outerRight+padding} ${trayTop} H${w} V${h} Z`;
            dockContour.setAttribute('d',contour);
            setupLayer.setAttribute('viewBox',`0 0 ${w} ${h}`);
            setupLayer.querySelector('path').setAttribute('d',contour);
            const clip=setupLayer.querySelector('rect');
            clip.setAttribute('width',String(equipmentCatalog.querySelector('.catalog-panel-header').offsetWidth));clip.setAttribute('height',String(h));
        };
        const dockContourObserver=new ResizeObserver(sizeDockContour);
        dockContourObserver.observe(equipmentCatalog);
        dockContourObserver.observe(equipmentCatalog.querySelector('.catalog-search'));
        sizeDockContour();

        equipmentSearch.addEventListener('input',()=>{quickCatalog.hidden=!!equipmentSearch.value.trim()||selectedSetupCategory?.id!=='favorites';});
        setupNav.querySelector('[data-setup-all]').setAttribute('aria-pressed','true');
        equipmentSearch.dispatchEvent(new Event('input'));

        function standardizeStereoPorts(root) {
            const channelOf = port => port?.dataset.channel || (/L$/.test(port?.dataset.node || '') ? 'L' : /R$/.test(port?.dataset.node || '') ? 'R' : '');
            [...root.querySelectorAll('*')].forEach(parent => {
                const units = [...parent.children].map(element => {
                    const ports = element.matches('.port') ? [element] : [...element.querySelectorAll('.port')];
                    return ports.length === 1 ? {element,port:ports[0],channel:channelOf(ports[0])} : null;
                }).filter(unit => unit?.channel);
                if (units.length !== 2 || new Set(units.map(unit=>unit.channel)).size !== 2 || units[0].port.dataset.io !== units[1].port.dataset.io) return;
                const groups = units.map(unit => {
                    const label = unit.element.previousElementSibling;
                    const hasLabel = label && !label.querySelector('.port') && !label.matches('.port') && label.textContent.trim() === unit.channel;
                    return {...unit,elements:hasLabel ? [label,unit.element] : [unit.element]};
                });
                const marker = document.createComment('stereo L/R');
                parent.insertBefore(marker,groups[0].elements[0]);
                groups.sort((a,b)=>a.channel==='L'?-1:1).forEach(group=>group.elements.forEach(element=>parent.insertBefore(element,marker)));
                marker.remove();
            });
            const textNodes = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
            while (textNodes.nextNode()) textNodes.currentNode.nodeValue = textNodes.currentNode.nodeValue.replace(/R\/L/g,'L/R');
        }

