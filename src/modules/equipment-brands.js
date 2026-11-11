/* Fictional manufacturers, model families, vector identities and faceplate printing. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EquipmentBrands=api;})(globalThis,()=>{
    'use strict';
    const lettering=typeof module==='object'&&module.exports?require('./brand-lettering.js'):globalThis.BrandLettering;
    const brands=Object.freeze(Object.fromEntries(Object.entries({
        aurenne:{name:'Aurenne',reference:'Harlow Solid',letteringSource:'Pacifico',art:'script',secondary:'#702e39',group:'electronics',style:'Assinatura cursiva cremosa com sublinhado longo e sombra vinho; referência Harlow Solid.',tier:'Clássico / hi-fi',accent:'#de7b52',lightInk:'#eee9d6',darkInk:'#292a25',rule:'Letra da função + três algarismos de série: R receiver, I integrado, P pré, T toca-discos, D tape deck, H fones, E EQ, M mixer, X crossover, S seletor, A potência.'},
        veltron:{name:'Veltron',reference:'Microgramma',letteringSource:'Audiowide',art:'orbit',secondary:'#6b8dc9',group:'electronics',style:'Letras quadradas largas e trilhas curvas em vermelho, amarelo e azul; referência Microgramma.',tier:'Referência / premium',accent:'#e9a62d',lightInk:'#eee9d6',darkInk:'#292a25',rule:'V + plataforma de três algarismos + função: i integrado, p pré, s potência de estado sólido, v válvulas, t toca-discos.'},
        nexora:{name:'Nexora',reference:'Avant Garde',letteringSource:'Righteous',art:'parallel',secondary:'#e6c580',group:'electronics',style:'Geometria circular em caixa baixa e cinco linhas paralelas; referência Avant Garde.',tier:'Hi-fi moderno',accent:'#d55b2b',lightInk:'#eee9d6',darkInk:'#292a25',rule:'NX + função + patamar da plataforma: I integrado, P pré, R receiver, S streaming, D disco, H fones, L link, X seletor.'},
        korden:{name:'Korden',reference:'New Zelek',letteringSource:'Bungee',art:'speed',secondary:'#529cbe',group:'electronics',style:'Letras angulares, recortes e linhas de velocidade azuis; referência New Zelek.',tier:'Profissional / estúdio',accent:'#d85a35',lightInk:'#eee9d6',darkInk:'#292a25',rule:'KR + família: E equalização, M mixagem/matriz, X crossover, P potência/pré, H fones, T toca-discos, L link. Sufixos identificam função ou plataforma, sem alterar especificações.'},
        linholt:{name:'Linholt',reference:'Microgramma',letteringSource:'Audiowide',art:'calibration',secondary:'#d7ae55',group:'electronics',style:'Geometria técnica quadrada com índices de calibração e faixas minerais; referência Microgramma.',tier:'Precisão / utilitário',accent:'#68a6b6',lightInk:'#eee9d6',darkInk:'#292a25',rule:'M medição, G gerador, U interface USB, C conversor, A adaptador. Na linha A, 35 e 63 identificam P2/P10 e R identifica RCA.'},
        bravora:{name:'Bravora',reference:'Verona',letteringSource:'DM Serif Display',art:'steps',secondary:'#c95663',group:'listening',style:'Serifa expressiva com sombra escura e faixas coloridas em degraus; referência Verona.',tier:'Clássico / musical',accent:'#da963a',lightInk:'#eee9d6',darkInk:'#292a25',rule:'B bookshelf/passiva, A caixa ativa, S subwoofer e H fones. B/O distinguem as grades preta e laranja da mesma série B-30.'},
        soryn:{name:'Soryn',reference:'Star Avenue',letteringSource:'Righteous',art:'avenue',secondary:'#b33f4a',group:'listening',style:'Letras circulares baixas, sombra deslocada e detalhes em mostarda e coral; referência Star Avenue.',tier:'Doméstico / design',accent:'#dca637',lightInk:'#eee9d6',darkInk:'#292a25',rule:'Form + plataforma. A identifica ativa, C coaxial, S subwoofer e H fone; números distinguem tamanho e posição na linha.'},
        terevon:{name:'Terevon',reference:'Made Mirage',letteringSource:'DM Serif Display',art:'frame',secondary:'#eee4c8',group:'listening',style:'Serifa de alto contraste com moldura de cantos suaves e filete dourado; referência Made Mirage.',tier:'Referência / premium',accent:'#d3b744',lightInk:'#eee9d6',darkInk:'#292a25',rule:'Reference + plataforma; H identifica fones dinâmicos, P planar e E eletrostática. A numeração ordena plataformas sem representar watts ou preço.'},
        axiomer:{name:'Axiomer',reference:'New Zelek',letteringSource:'Bungee',art:'signal',secondary:'#58a2bf',group:'listening',style:'Letras industriais angulares e três pistas de sinal inclinadas; referência New Zelek.',tier:'Profissional / monitoramento',accent:'#d4663c',lightInk:'#eee9d6',darkInk:'#292a25',rule:'M monitor, S subwoofer, H fones; o número de dois algarismos identifica o patamar da plataforma.'},
        dovara:{name:'Dovara',reference:'Newstar',letteringSource:'Changa One',art:'echo',secondary:'#cf4b6b',group:'listening',style:'Letras compactas e robustas com ecos coloridos em coral e verde; referência Newstar.',tier:'Essencial / acessível',accent:'#e7a238',lightInk:'#eee9d6',darkInk:'#292a25',rule:'D + B caixa, S subwoofer ou H fone + plataforma. A linha 10 é essencial; 20–40 ampliam construção e acabamento.'},
    }).map(([id,brand])=>[id,Object.freeze({...brand,id,mark:lettering[id].compactPath})])));
    const products={};
    const line=(brand,models)=>Object.entries(models).forEach(([type,model])=>products[type]=Object.freeze({brand,model}));
    line('aurenne',{receiver:'R-780',integratedSilver:'I-740',integratedUtility:'I-420',preClassic:'P-260',headphoneAmp:'H-120',turntableVintage:'T-240',turntableLinear:'T-360',tapeDeck:'D-340',eqVintage:'E-270',mixerVintage:'M-330',crossoverVintage:'X-310',powerVintage:'A-640',rcaSwitchVintage:'S-210',rcaMatrixVintage:'S-340',speakerSwitchVintage:'S-220'});
    line('veltron',{integratedBlue:'V 520i',preGlass:'V 320p',preReference:'V 420p',powerValve:'V 620v',powerBias:'V 720s',turntableBelt:'V 240t'});
    line('nexora',{integratedMinimal:'NX-I60',preControl:'NX-P40',preDisplay:'NX-P60',powerAmp:'NX-R80',streamer:'NX-S40',streamIntegrated:'NX-S90',cdPlayer:'NX-D30',headphoneAmpModern:'NX-H20',btReceiverA:'NX-L10',rcaSwitch:'NX-X10',speakerSwitch:'NX-X20'});
    line('korden',{turntable:'KR-T2',turntableDirect:'KR-T4',eqStudio:'KR-E7',mixer:'KR-M3',crossover:'KR-X3',powerStereo:'KR-P20',powerDual:'KR-P40',headphoneAmp4:'KR-H4',rcaMatrix:'KR-M34',btTransmitterPro:'KR-L2',preamp:'KR-P10',prePrecision:'KR-P60'});
    line('linholt',{benchMeter:'M-20',benchMeterVintage:'M-10',signalGenerator:'G-20',signalGeneratorVintage:'G-10',audioInterface1:'U-10',audioInterface2:'U-20',audioInterface3:'U-30',audioInterface4:'U-40',phonoConverter:'C-P1',speakerConverter:'C-S1',adapterP10P2:'A-635',adapterP2P10:'A-356',adapterP2Rca:'A-35R',adapterP10Rca:'A-63R',adapterRcaP2:'A-R35',adapterRcaP10:'A-R63'});
    line('bravora',{spkPassiveWood:'B-20',spkPassiveGridBlack:'B-30B',spkPassiveGridOrange:'B-30O',spkActiveMonitor:'A-20',shelfWood:'B-25',subwooferPassiveVintage:'S-30',hpKubaDisco2:'H-20'});
    line('soryn',{spkActiveCompact:'Form 1A',shelfCoax:'Form 2C',floorCoax:'Form 5C',subwooferCube:'Form 8S',subwoofer:'Form 6S',hpMax:'Form H2'});
    line('terevon',{shelfTop:'Reference 3',floorDiamond:'Reference 7',floorFlax:'Reference 6',spkElectrostatic:'Reference E5',hpOpenRing:'Reference H3',hpOpenDome:'Reference H2',hpPlanar:'Reference P4'});
    line('axiomer',{spkActiveBookshelf:'M-40',spkActiveRounded:'M-60',subwooferPro:'S-90',hpStudio:'H-40',hpMonitor:'H-60'});
    line('dovara',{speaker:'D-B10',spkPassiveCarbon:'D-B40',subwooferPassive:'D-S30',headphone:'D-H10',hpClassic:'D-H20'});
    Object.freeze(products);
    const get=type=>products[type]?Object.freeze({...products[type],manufacturer:brands[products[type].brand]}):null;
    const unprinted=type=>type.startsWith('adapter')||type.startsWith('hp')||type==='headphone';
    const name=(type,role)=>{const p=get(type);if(role&&unprinted(type))return role;return p?`${p.manufacturer.name} ${p.model}${role?' · '+role:''}`:role||type;};
    const productNames=new Set(Object.keys(products).map(type=>name(type)));
    const splitName=value=>{const at=value.indexOf(' · ');return at>0&&productNames.has(value.slice(0,at))?{product:value.slice(0,at),role:value.slice(at+3)}:null;};
    // Outlined letters are shaped from vendored OFL fonts. Reference names
    // describe the supplied artwork; runtime rendering never substitutes fonts.
    function logo(id,markOnly=false,simple=false){
        const b=brands[id];if(!b)return '';
        const path=lettering[id].path;
        const stripe=(d,color,width=2)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
        const accent='var(--brand-color-1,currentColor)',secondary='var(--brand-color-2,currentColor)';
        const shadow=`<path d="${path}" fill="var(--brand-shadow,#141819)" opacity=".55" transform="translate(1.3 1.8)"/>`;
        let art='';
        if(b.art==='script')art=stripe('M57 41Q102 43 150 40H226',accent,2.2);
        if(b.art==='orbit')art=['#d45a35','#e2b24b','#6b8dc9'].map((c,i)=>stripe(`M59 ${37+i*3}H${210-i*3}Q${233-i*3} ${37+i*3} ${233-i*3} 47`,c,1.5)).join('');
        if(b.art==='parallel')art=[0,1,2,3,4].map(i=>stripe(`M57 ${37+i*2}H226`,accent,.9)).join('');
        if(b.art==='speed')art=[0,1,2].map(i=>stripe(`M${157+i*4} ${38+i*3}H232`,secondary,1.5)).join('');
        if(b.art==='calibration')art=stripe('M57 39H226',accent,1.6)+stripe('M57 44H185',secondary,1.5)+stripe('M218 42v4m5-4v4m5-4v4',accent,1);
        if(b.art==='steps')art=['#d45a35','#d6ac46','#6a9f75','#6a9eb6','#8573ac'].map((c,i)=>`<path d="M${57+i*31} ${37+i*1.5}h34v2h-34Z" fill="${c}"/>`).join('');
        if(b.art==='avenue')art=stripe('M60 41h165',accent,2.4)+stripe('M65 45h165',secondary,1.6);
        if(b.art==='frame')art='<rect x="50" y="1" width="186" height="45" rx="9" fill="none" stroke="'+accent+'" stroke-width="1.2"/>';
        if(b.art==='signal')art=[0,1,2].map(i=>stripe(`M${61+i*45} 44l8-7h31`,secondary,2)).join('');
        if(b.art==='echo')art=`<path d="${path}" fill="${secondary}" transform="translate(0 7)" opacity=".8"/><path d="${path}" fill="${accent}" transform="translate(0 3.5)"/>`;
        const data=lettering[id];
        const viewBox=markOnly?'0 0 48 39':simple?data.bounds.join(' '):'45 0 195 48';
        const content=markOnly?`<path d="${data.compactPath}" fill="currentColor"/>`:(simple?'':art+shadow)+`<path class="brand-wordmark" d="${path}" fill="currentColor" stroke="currentColor" stroke-width="${b.art==='orbit'||b.art==='calibration'?.45:0}" stroke-linejoin="round"/>`;
        return `<svg class="equipment-brand-logo" data-wordmark="${b.name.toUpperCase()}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${content}</svg>`;
    }
    const paleFronts=new Set(['headphoneAmp','powerValve','turntableVintage','turntableLinear','receiver','integratedSilver','integratedUtility','preClassic','tapeDeck','eqVintage','mixerVintage','crossoverVintage','powerVintage','rcaSwitchVintage','rcaMatrixVintage','speakerSwitchVintage','signalGeneratorVintage','benchMeterVintage','preReference','preControl','prePrecision','powerBias','audioInterface4','turntableDirect','turntableBelt','spkActiveCompact','floorCoax','shelfTop','hpKubaDisco2']);
    const obstacleSelector='.sub-oblong-duct,.sub-air-ducts>i,.tower-front-vent,.sp-panel,.classic-box-connection,.tower-terminal,[role=slider],.poweramp-screen,.poweramp-meter,.linear-readout,.bias-heatsink,.bias-vent,.stereo-power-vent,.dual-top-vents,.at-pitch,.tt-pitch,button:not(.speaker-grille),input,select,output,.port,.hw-knob,.hw-screw-mount,.integrated-gauge,.extra-vu,.bias-meter,.receiver-radio,.device-display,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.cd-lcd,.stream-screen,.sp-woofer,.sp-tweeter,.tower-driver,.classic-box-driver,.tower-top-tweeter,.shelf-top-tweeter,.tape-reel,.tape-head-cover,.at-platter,.at-record,.tt-platter,.tt-record,[data-lighting-relief]';
    function badgeElement(type){
        const p=get(type),badge=document.createElement('span');badge.className='equipment-brand-badge';badge.dataset.brandBadge=p.brand;badge.setAttribute('aria-hidden','true');badge.setAttribute('translate','no');
        badge.innerHTML=logo(p.brand,false,true)+'<span class="equipment-brand-model">'+p.model+'</span>';return badge;
    }
    function placeBadge(root,badge,type){
        const p=get(type),width=root.offsetWidth,height=root.offsetHeight,origin=root.getBoundingClientRect(),scale=origin.width/width||1;
        const rect=el=>{const r=el.getBoundingClientRect();return {x:(r.left-origin.left)/scale,y:(r.top-origin.top)/scale,w:r.width/scale,h:r.height/scale};};
        const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getBoundingClientRect().width>0&&!el.closest('.equipment-brand-badge,.device-header');};
        const obstacles=[...root.querySelectorAll(obstacleSelector)].filter(visible).map(rect);
        root.querySelectorAll('span,small,strong,b,label,header,text').forEach(el=>{if(!el.childElementCount&&el.textContent.trim()&&visible(el))obstacles.push(rect(el));});
        const speaker=brands[p.brand].group==='listening';
        const surface=type==='streamIntegrated'?root.querySelector('.stream-glass'):type==='powerValve'?root.querySelector('.custom-power-connections'):speaker?root.querySelector('.sp-cab,.classic-box-cab,.tower-cabinet,.bookshelf-cabinet,.electrostatic-frame'):root.querySelector('.poweramp-body,.integrated-face,.custom-pre-face,.custom-power-face,.rack-face,.ai-panel,.phone-amp-face,.selector-face,.matrix-face,.signal-face,.bench-face,.cd-face,.interface-face,.amp4-rack-face,.at-plinth');
        const area=surface?rect(surface):{x:0,y:0,w:width,h:height};
        const minY=type.startsWith('turntable')?Math.max(area.y,height*.62):area.y;
        const shape=surface?getComputedStyle(surface):null;
        const radii=shape?[shape.borderTopLeftRadius,shape.borderTopRightRadius,shape.borderBottomRightRadius,shape.borderBottomLeftRadius].map(value=>Math.min(parseFloat(value)||0,area.w/2,area.h/2)): [0,0,0,0];
        const insideCurve=(px,py)=>{
            const corners=[[area.x,area.y,1,1],[area.x+area.w,area.y,-1,1],[area.x+area.w,area.y+area.h,-1,-1],[area.x,area.y+area.h,1,-1]];
            return corners.every(([cx,cy,sx,sy],index)=>{const r=radii[index];if(!r||(px-cx)*sx>=r||(py-cy)*sy>=r)return true;return Math.hypot(px-(cx+sx*r),py-(cy+sy*r))<=r-3;});
        };

        const bottomInset=type==='turntableDirect'?14:type.startsWith('turntable')?7:3;
        const free=(x,y,w,h)=>x>=Math.max(3,area.x+3)&&y>=Math.max(3,minY+3)&&x+w<=Math.min(width-3,area.x+area.w-3)&&y+h<=Math.min(height-3,area.y+area.h-bottomInset)&&[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].every(([px,py])=>insideCurve(px,py))&&!obstacles.some(o=>x<o.x+o.w+2&&x+w>o.x-2&&y<o.y+o.h+2&&y+h>o.y-2);
        const sizes=width<=260&&height<=115?[[28,18,'mark'],[18,14,'mark']]:[[144,32,'art'],[108,23,'full'],[86,17,'full'],[96,10,'strip'],[65,8,'strip'],[28,18,'mark'],[18,14,'mark']];
        for(const [w,h,mode]of sizes){
            if(w>width-6||h>height-6)continue;
            const ys=speaker?[area.y+area.h-h-12,area.y+area.h-h-40,height*.8,height*.65,8]:[area.y+6,area.y+area.h-h-6,height*.65,height*.4];
            const xs=[(width-w)/2,12,width-w-12];
            for(const y of ys)for(const x of xs)if(free(x,y,w,h)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});badge.dataset.mode=mode;if(mode==='art')badge.innerHTML=logo(p.brand)+'<span class="equipment-brand-model">'+p.model+'</span>';else if(mode==='mark')badge.innerHTML=logo(p.brand,true);else if(mode==='strip')badge.innerHTML=logo(p.brand,false,true)+'<span class="equipment-brand-model">'+p.model+'</span>';return;}
            for(let y=5;y<=height-h-5;y+=5)for(let x=8;x<=width-w-8;x+=8)if(free(x,y,w,h)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});badge.dataset.mode=mode;if(mode==='art')badge.innerHTML=logo(p.brand)+'<span class="equipment-brand-model">'+p.model+'</span>';else if(mode==='mark')badge.innerHTML=logo(p.brand,true);else if(mode==='strip')badge.innerHTML=logo(p.brand,false,true)+'<span class="equipment-brand-model">'+p.model+'</span>';return;}
        }
        // Very small parts carry a maker's stamp; the full model remains in the
        // catalog, accessible equipment name, and properties panel.
        badge.dataset.mode='mark';badge.innerHTML=logo(p.brand,true);
        for(let y=5;y<=height-12;y+=3)for(let x=5;x<=width-12;x+=3)if(free(x,y,7,7)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:'7px',height:'7px'});return;}
        badge.dataset.placement='unplaced';Object.assign(badge.style,{left:'6px',top:'5px',width:'7px',height:'7px'});
    }
    function mount(root,type,role){
        const p=get(type);if(!p||unprinted(type))return;
        root.dataset.manufacturer=p.manufacturer.name;root.dataset.brand=p.brand;root.dataset.model=p.model;
        root.style.setProperty('--equipment-brand-ink',paleFronts.has(type)?p.manufacturer.darkInk:p.manufacturer.lightInk);
        root.style.setProperty('--equipment-brand-light-ink',p.manufacturer.lightInk);
        root.style.setProperty('--equipment-brand-accent',p.manufacturer.accent);
        root.style.setProperty('--brand-color-1',p.manufacturer.accent);
        root.style.setProperty('--brand-color-2',p.manufacturer.secondary);
        root.setAttribute('aria-label',name(type,role));
        const caption=root.querySelector('.device-header>span');if(caption)caption.textContent=name(type,role);
        if(root.querySelector('[data-brand-badge]'))return;
        const badge=badgeElement(type);
        const heading=type==='preClassic'?root.querySelector('.classic-preamp-heading'):type==='preGlass'?root.querySelector('.glass-pre-heading'):type==='tapeDeck'?root.querySelector('.tape-face>header>strong'):type==='spkActiveCompact'?root.querySelector('.compact-name'):null;
        if(heading){
            const led=heading.querySelector('.device-led');heading.replaceChildren(badge);if(type==='preClassic')badge.innerHTML=logo(p.brand)+'<span class="equipment-brand-model">'+p.model+'</span>';if(led)heading.appendChild(led);badge.dataset.mode=type==='preClassic'||type==='spkActiveCompact'?'full':'strip';badge.dataset.placement='heading';
            Object.assign(badge.style,{position:'relative',width:type==='preClassic'?'190px':type==='spkActiveCompact'?'108px':'126px',height:type==='preClassic'?'40px':type==='spkActiveCompact'?'23px':'12px'});return;
        }
        const grille=root.querySelector('.speaker-grille');
        if(grille&&!root.classList.contains('grille-off')&&getComputedStyle(grille).display!=='none'){
            badge.dataset.mode='full';badge.dataset.placement='grille';Object.assign(badge.style,{right:'12px',bottom:'12px',width:'96px',height:'21px'});grille.appendChild(badge);return;
        }
        badge.dataset.placement='face';placeBadge(root,badge,type);root.appendChild(badge);
    }
    function catalog(item,type){
        const p=get(type);if(!p||unprinted(type)||item.querySelector('.catalog-product-identity'))return;
        item.dataset.brand=p.manufacturer.name;item.dataset.model=p.model;
        const line=document.createElement('small');line.className='catalog-product-identity';line.setAttribute('translate','no');line.textContent=name(type);item.appendChild(line);
        item.setAttribute('aria-label',name(type,item.querySelector(':scope>span')?.textContent.trim()));
    }
    return Object.freeze({brands,products,get,name,splitName,logo,mount,catalog,unprinted});
});
