/* Fictional manufacturers, model families, vector identities and faceplate printing. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.EquipmentBrands=api;})(globalThis,()=>{
    'use strict';
    const brands=Object.freeze(Object.fromEntries(Object.entries({
        aurenne:{name:'Aurenne',group:'electronics',style:'Vintage em nogueira e alumínio champagne; tradição analógica.',tier:'Clássico / hi-fi',accent:'#b9924f',lightInk:'#e4cf9f',darkInk:'#5a4024',font:'Georgia, serif',weight:600,italic:true,tracking:1.1,rule:'Letra da função + três algarismos de série: R receiver, I integrado, P pré, T toca-discos, D tape deck, H fones, E EQ, M mixer, X crossover, S seletor, A potência.',mark:'<path d="M3 27 15 4l12 23M8 19h14"/><path class="brand-accent" d="M3 31h24M15 1v3M1 12l3 1m22 0 3-1"/>'},
        veltron:{name:'Veltron',group:'electronics',style:'Referência de bancada hi-fi: vidro, metal usinado, visores luminosos e válvulas.',tier:'Referência / premium',accent:'#81bcb3',lightInk:'#c2e0d2',darkInk:'#294b44',font:'Arial, sans-serif',weight:700,tracking:2.4,rule:'V + plataforma de três algarismos + função: i integrado, p pré, s potência de estado sólido, v válvulas, t toca-discos.',mark:'<path d="m2 5 13 24L28 5M7 5l8 15 8-15"/><path class="brand-accent" d="M3 31h24M12 4h6"/>'},
        nexora:{name:'Nexora',group:'electronics',style:'Hi-fi contemporâneo: frentes limpas, vidro escuro, grafite e detalhes discretos.',tier:'Hi-fi moderno',accent:'#8ea9a8',lightInk:'#d8e3df',darkInk:'#344c4b',font:'Arial, sans-serif',weight:400,tracking:3.3,rule:'NX + função + patamar da plataforma: I integrado, P pré, R receiver, S streaming, D disco, H fones, L link, X seletor.',mark:'<path d="M3 28V4l24 24V4M8 28V16m14 0V4"/><path class="brand-accent" d="M14 2h4M12 31h6"/>'},
        korden:{name:'Korden',group:'electronics',style:'Racks de estúdio robustos: anodizado escuro, tipografia condensada e marca de índice âmbar.',tier:'Profissional / estúdio',accent:'#d6a257',lightInk:'#d0d9dc',darkInk:'#34424a',font:'Equipment Vintage, Arial Narrow, sans-serif',weight:700,tracking:1.8,rule:'KR + família: E equalização, M mixagem/matriz, X crossover, P potência/pré, H fones, T toca-discos, L link. Sufixos identificam função ou plataforma, sem alterar especificações.',mark:'<path d="M3 4v24M8 16 23 4M8 16l15 12M27 4v24"/><path class="brand-accent" d="M1 31h28M25 12v8"/>'},
        linholt:{name:'Linholt',group:'electronics',style:'Instrumentação e captura: marca geométrica de calibração, azul mineral e legibilidade técnica.',tier:'Precisão / utilitário',accent:'#6da9b3',lightInk:'#c6e1e3',darkInk:'#315865',font:'Equipment Digital, Consolas, monospace',weight:500,tracking:.8,rule:'M medição, G gerador, U interface USB, C conversor, A adaptador. Na linha A, 35 e 63 identificam P2/P10 e R identifica RCA.',mark:'<path d="M7 4v23h21M2 10h10M2 20h10M17 3v9m-4-4h9"/><path class="brand-accent" d="M17 18h9v-4M2 31h26"/>'},
        bravora:{name:'Bravora',group:'listening',style:'Caixas clássicas e fones de madeira: nogueira, tecido, espuma e cobre envelhecido.',tier:'Clássico / musical',accent:'#bc784b',lightInk:'#ead4b0',darkInk:'#633d26',font:'Georgia, serif',weight:700,tracking:1.1,rule:'B bookshelf/passiva, A caixa ativa, S subwoofer e H fones. B/O distinguem as grades preta e laranja da mesma série B-30.',mark:'<path d="M5 28V4h10c13 0 13 12 0 12H5m10 0c14 0 14 12 0 12H5"/><path class="brand-accent" d="M1 2v28M9 8h6m-6 14h6"/>'},
        soryn:{name:'Soryn',group:'listening',style:'Áudio doméstico minimalista: lacas claras, curvas suaves e aros com fixação oculta.',tier:'Doméstico / design',accent:'#8aa9a3',lightInk:'#d5e5df',darkInk:'#3e5b57',font:'Arial, sans-serif',weight:400,tracking:2.5,rule:'Form + plataforma. A identifica ativa, C coaxial, S subwoofer e H fone; números distinguem tamanho e posição na linha.',mark:'<path d="M26 7C11-5-5 13 11 16l8 1C35 20 19 39 3 26"/><path class="brand-accent" d="M9 9c4-4 10-4 14-1M7 24c4 3 9 3 13 0"/>'},
        terevon:{name:'Terevon',group:'listening',style:'Transdutores de referência: titânio, cones naturais, painéis eletrostáticos e fones abertos.',tier:'Referência / premium',accent:'#b3a47b',lightInk:'#e3ded0',darkInk:'#504c40',font:'Georgia, serif',weight:400,tracking:2.1,rule:'Reference + plataforma; H identifica fones dinâmicos, P planar e E eletrostática. A numeração ordena plataformas sem representar watts ou preço.',mark:'<path d="M2 4h27M15.5 4v26M8 9h15"/><path class="brand-accent" d="m3 16 4 4-4 4m25-8-4 4 4 4M11 31h9"/>'},
        axiomer:{name:'Axiomer',group:'listening',style:'Monitores e fones de trabalho: baffles escuros, montagem acessível, precisão e índice laranja.',tier:'Profissional / monitoramento',accent:'#db914e',lightInk:'#d2dfe2',darkInk:'#344b57',font:'Equipment Vintage, Arial Narrow, sans-serif',weight:700,tracking:1.5,rule:'M monitor, S subwoofer, H fones; o número de dois algarismos identifica o patamar da plataforma.',mark:'<path d="m3 28 12-24 12 24M8 20h14M15 1v4M15 28v4M1 16h5m18 0h5"/><path class="brand-accent" d="M12 16h6M15 13v6"/>'},
        dovara:{name:'Dovara',group:'listening',style:'Áudio acessível e durável: superfícies simples, tons quentes, conforto e construção sem excesso de adornos.',tier:'Essencial / acessível',accent:'#bfa16b',lightInk:'#e3d7bd',darkInk:'#5e5039',font:'Arial, sans-serif',weight:600,tracking:.8,rule:'D + B caixa, S subwoofer ou H fone + plataforma. A linha 10 é essencial; 20–40 ampliam construção e acabamento.',mark:'<path d="M4 4h9c20 0 20 24 0 24H4ZM10 10h4c10 0 10 12 0 12h-4"/><path class="brand-accent" d="M2 31h24"/>'}
    }).map(([id,brand])=>[id,Object.freeze({...brand,id})])));
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
    const name=(type,role)=>{const p=get(type);return p?`${p.manufacturer.name} ${p.model}${role?' · '+role:''}`:role||type;};
    const productNames=new Set(Object.keys(products).map(type=>name(type)));
    const splitName=value=>{const at=value.indexOf(' · ');return at>0&&productNames.has(value.slice(0,at))?{product:value.slice(0,at),role:value.slice(at+3)}:null;};
    function logo(id,markOnly=false){
        const b=brands[id];if(!b)return '';
        return `<svg class="equipment-brand-logo" viewBox="0 0 ${markOnly?32:188} 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${b.mark}</g>${markOnly?'':`<text x="39" y="25" fill="currentColor" font-family="${b.font}" font-size="22" font-weight="${b.weight}" font-style="${b.italic?'italic':'normal'}" style="font-family:${b.font}!important;font-weight:${b.weight}!important;font-style:${b.italic?'italic':'normal'}!important" letter-spacing="${b.tracking}" textLength="146" lengthAdjust="spacingAndGlyphs">${b.name.toUpperCase()}</text>`}</svg>`;
    }
    const paleFronts=new Set(['receiver','integratedSilver','integratedUtility','preClassic','tapeDeck','eqVintage','mixerVintage','crossoverVintage','powerVintage','rcaSwitchVintage','rcaMatrixVintage','speakerSwitchVintage','signalGeneratorVintage','benchMeterVintage','preReference','preControl','prePrecision','powerBias','audioInterface4','turntableDirect','turntableBelt','spkActiveCompact','floorCoax','shelfTop','hpKubaDisco2']);
    const obstacleSelector='button:not(.speaker-grille),input,select,output,.port,.hw-knob,.hw-screw-mount,.integrated-gauge,.extra-vu,.bias-meter,.receiver-radio,.device-display,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.cd-lcd,.stream-screen,.sp-woofer,.sp-tweeter,.tower-driver,.classic-box-driver,.tower-top-tweeter,.shelf-top-tweeter,.tape-reel,.tape-head-cover,.at-platter,.at-record,.tt-platter,.tt-record,[data-lighting-relief]';
    function badgeElement(type){
        const p=get(type),badge=document.createElement('span');badge.className='equipment-brand-badge';badge.dataset.brandBadge=p.brand;badge.setAttribute('aria-hidden','true');badge.setAttribute('translate','no');
        badge.innerHTML=logo(p.brand)+'<span class="equipment-brand-model">'+p.model+'</span>';return badge;
    }
    function placeBadge(root,badge,type){
        const p=get(type),width=root.offsetWidth,height=root.offsetHeight,origin=root.getBoundingClientRect(),scale=origin.width/width||1;
        const rect=el=>{const r=el.getBoundingClientRect();return {x:(r.left-origin.left)/scale,y:(r.top-origin.top)/scale,w:r.width/scale,h:r.height/scale};};
        const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getBoundingClientRect().width>0&&!el.closest('.equipment-brand-badge,.device-header');};
        const obstacles=[...root.querySelectorAll(obstacleSelector)].filter(visible).map(rect);
        root.querySelectorAll('span,small,strong,b,label,header').forEach(el=>{if(!el.childElementCount&&el.textContent.trim()&&visible(el))obstacles.push(rect(el));});
        const speaker=brands[p.brand].group==='listening';
        const surface=type==='streamIntegrated'?root.querySelector('.stream-glass'):type==='powerValve'?root.querySelector('.custom-power-connections'):speaker?root.querySelector('.sp-cab,.classic-box-cab,.tower-cabinet,.bookshelf-cabinet,.electrostatic-frame'):root.querySelector('.integrated-face,.custom-pre-face,.custom-power-face,.rack-face,.ai-panel,.phone-amp-face,.selector-face,.matrix-face,.signal-face,.bench-face,.cd-face,.interface-face,.amp4-rack-face,.at-plinth');
        const area=surface?rect(surface):{x:0,y:0,w:width,h:height};
        const minY=type.startsWith('turntable')?Math.max(area.y,height*.62):area.y;
        const free=(x,y,w,h)=>x>=Math.max(3,area.x+3)&&y>=Math.max(3,minY+3)&&x+w<=Math.min(width-3,area.x+area.w-3)&&y+h<=Math.min(height-3,area.y+area.h-3)&&!obstacles.some(o=>x<o.x+o.w+2&&x+w>o.x-2&&y<o.y+o.h+2&&y+h>o.y-2);
        for(const [w,h,mode]of [[108,23,'full'],[86,17,'full'],[96,10,'strip'],[65,8,'strip']]){
            if(w>width-6||h>height-6)continue;
            const ys=speaker?[area.y+area.h-h-12,area.y+area.h-h-40,height*.8,height*.65,8]:[area.y+6,area.y+area.h-h-6,height*.65,height*.4];
            const xs=[(width-w)/2,12,width-w-12];
            for(const y of ys)for(const x of xs)if(free(x,y,w,h)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});badge.dataset.mode=mode;return;}
            for(let y=5;y<=height-h-5;y+=5)for(let x=8;x<=width-w-8;x+=8)if(free(x,y,w,h)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});badge.dataset.mode=mode;return;}
        }
        // Very small parts carry a maker's stamp; the full model remains in the
        // catalog, accessible equipment name, and properties panel.
        badge.dataset.mode='mark';badge.innerHTML=logo(p.brand,true);
        for(let y=5;y<=height-12;y+=3)for(let x=5;x<=width-12;x+=3)if(free(x,y,7,7)){Object.assign(badge.style,{left:x+'px',top:y+'px',width:'7px',height:'7px'});return;}
        badge.dataset.placement='unplaced';Object.assign(badge.style,{left:'6px',top:'5px',width:'7px',height:'7px'});
    }
    function mount(root,type,role){
        const p=get(type);if(!p)return;
        root.dataset.manufacturer=p.manufacturer.name;root.dataset.brand=p.brand;root.dataset.model=p.model;
        root.style.setProperty('--equipment-brand-ink',paleFronts.has(type)?p.manufacturer.darkInk:p.manufacturer.lightInk);
        root.style.setProperty('--equipment-brand-light-ink',p.manufacturer.lightInk);
        root.style.setProperty('--equipment-brand-accent',p.manufacturer.accent);
        root.setAttribute('aria-label',name(type,role));
        const caption=root.querySelector('.device-header>span');if(caption)caption.textContent=name(type,role);
        if(root.querySelector('[data-brand-badge]'))return;
        const badge=badgeElement(type);
        const heading=type==='preClassic'?root.querySelector('.classic-preamp-heading'):type==='preGlass'?root.querySelector('.glass-pre-heading'):type==='tapeDeck'?root.querySelector('.tape-face>header>strong'):type==='spkActiveCompact'?root.querySelector('.compact-name'):null;
        if(heading){
            const led=heading.querySelector('.device-led');heading.replaceChildren(badge);if(led)heading.appendChild(led);badge.dataset.mode=type==='preClassic'||type==='spkActiveCompact'?'full':'strip';badge.dataset.placement='heading';
            Object.assign(badge.style,{position:'relative',width:type==='preClassic'?'152px':type==='spkActiveCompact'?'108px':'126px',height:type==='preClassic'?'30px':type==='spkActiveCompact'?'23px':'12px'});return;
        }
        const headphone=root.querySelector('.headphone-artwork,.kuba-art');
        if(headphone){
            const box=headphone.getBoundingClientRect(),r=root.getBoundingClientRect(),s=r.width/root.offsetWidth||1;
            badge.dataset.mode='strip';badge.dataset.placement='headband';Object.assign(badge.style,{left:((box.left-r.left+box.width/2)/s-34)+'px',top:((box.top-r.top)/s+17)+'px',width:'68px',height:'9px'});root.appendChild(badge);return;
        }
        const adapter=root.querySelector('.adapter-object');
        if(adapter){badge.dataset.mode='mark';badge.dataset.placement='adapter';badge.innerHTML=logo(p.brand,true);Object.assign(badge.style,{left:'24%',top:'33%',width:adapter.offsetWidth<100?'7px':'10px',height:adapter.offsetWidth<100?'7px':'10px'});adapter.appendChild(badge);return;}
        const grille=root.querySelector('.speaker-grille');
        if(grille&&!root.classList.contains('grille-off')&&getComputedStyle(grille).display!=='none'){
            badge.dataset.mode='full';badge.dataset.placement='grille';Object.assign(badge.style,{right:'12px',bottom:'12px',width:'96px',height:'21px'});grille.appendChild(badge);return;
        }
        badge.dataset.placement='face';placeBadge(root,badge,type);root.appendChild(badge);
    }
    function catalog(item,type){
        const p=get(type);if(!p||item.querySelector('.catalog-product-identity'))return;
        item.dataset.brand=p.manufacturer.name;item.dataset.model=p.model;
        const line=document.createElement('small');line.className='catalog-product-identity';line.setAttribute('translate','no');line.textContent=name(type);item.appendChild(line);
        item.setAttribute('aria-label',name(type,item.querySelector(':scope>span')?.textContent.trim()));
    }
    return Object.freeze({brands,products,get,name,splitName,logo,mount,catalog});
});
