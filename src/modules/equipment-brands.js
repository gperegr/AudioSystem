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
    const families=Object.freeze({
        aurenne:{axis:'center',zones:['header-center','footer-center'],margin:24,keyRadius:2,description:'Assinatura central, latão champagne, madeira e comandos com aro marfim.'},
        veltron:{axis:'left',zones:['header-left','footer-left'],margin:26,keyRadius:3,description:'Marca à esquerda, vidro fumê, alumínio usinado e comandos cromados.'},
        nexora:{axis:'left',zones:['header-left','footer-left'],margin:24,keyRadius:5,description:'Masthead à esquerda, grafite com filete cobre e teclas baixas arredondadas.'},
        korden:{axis:'left',zones:['header-left','footer-left'],margin:30,keyRadius:1,description:'Faixa de identificação superior esquerda, rack de cantos retos e teclas técnicas.'},
        linholt:{axis:'left',zones:['header-left','footer-left'],margin:24,keyRadius:3,description:'Instrumentos com masthead esquerdo; interfaces com assinatura inferior esquerda e índice ciano.'},
        bravora:{axis:'center',zones:['footer-center','header-center'],margin:18,keyRadius:2,description:'Assinatura no eixo central, moldura de madeira reta e detalhes em cobre.'},
        soryn:{axis:'center',zones:['header-center','footer-center'],margin:18,keyRadius:8,description:'Assinatura centrada, cantos suaves e controles de acabamento acetinado.'},
        terevon:{axis:'center',zones:['header-center','footer-center'],margin:22,keyRadius:4,description:'Assinatura central de pequeno porte, aros prateados e painéis de linhas sóbrias.'},
        axiomer:{axis:'center',zones:['header-center','footer-center'],margin:18,keyRadius:3,description:'Marca central acima dos controles, baffle grafite e pequenos índices em cobre.'},
        dovara:{axis:'left',zones:['header-left','footer-left'],margin:18,keyRadius:5,description:'Assinatura no lado esquerdo, contornos simples e comandos de borracha escura.'},
    });
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
    const brassFronts=new Set(['integratedSilver','integratedUtility','preClassic','headphoneAmp','eqVintage','mixerVintage','crossoverVintage','powerVintage','rcaSwitchVintage','rcaMatrixVintage','speakerSwitchVintage']);
    function printFinish(root,type){
        const grille=root.querySelector('.speaker-grille');
        if(grille&&!root.classList.contains('grille-off')&&getComputedStyle(grille).display!=='none')return 'woven';
        if(brassFronts.has(type))return 'brass';
        if(type==='preGlass'||type==='streamIntegrated')return 'glass';
        const listening=get(type).manufacturer.group==='listening';
        if(paleFronts.has(type))return listening?'lacquer-light':type==='turntableBelt'?'wood-etched':'alloy';
        if(listening)return get(type).brand==='bravora'||type==='speaker'?'wood':'lacquer-dark';
        return 'anodized';
    }
    const obstacleSelector='.mixer-rack-handle,.speaker-basic-tweeter,.speaker-basic-woofer,.speaker-basic-terminal,.precision-meter,.ai-output-pair,.linear-io,.sub-oblong-duct,.sub-air-ducts>i,.tower-front-vent,.sp-panel,.sp-terminal,.classic-box-connection,.tower-terminal,[role=slider],.poweramp-screen,.poweramp-meter,.linear-readout,.bias-heatsink,.bias-vent,.stereo-power-vent,.dual-top-vents,.at-pitch,.tt-pitch,button:not(.speaker-grille),input,select,output,.port,.hw-knob,.hw-screw-mount,.integrated-gauge,.extra-vu,.bias-meter,.receiver-radio,.device-display,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.cd-lcd,.stream-screen,.sp-woofer,.sp-tweeter,.tower-driver,.classic-box-driver,.tower-top-tweeter,.shelf-top-tweeter,.tape-reel,.tape-head-cover,.at-platter,.at-record,.tt-platter,.tt-record,[data-lighting-relief]';
    function badgeElement(type){
        const p=get(type),badge=document.createElement('span');badge.className='equipment-brand-badge';badge.dataset.brandBadge=p.brand;badge.setAttribute('aria-hidden','true');badge.setAttribute('translate','no');
        badge.innerHTML=logo(p.brand,false,true)+'<span class="equipment-brand-model">'+p.model+'</span>';return badge;
    }
    function placeBadge(root,badge,type){
        const p=get(type),width=root.offsetWidth,height=root.offsetHeight,origin=root.getBoundingClientRect(),scale=origin.width/width||1;
        const rect=el=>{const r=el.getBoundingClientRect(),unit=value=>Math.round(value/scale*100)/100;return {x:unit(r.left-origin.left),y:unit(r.top-origin.top),w:unit(r.width),h:unit(r.height)};};
        const visible=el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&el.getBoundingClientRect().width>0&&!el.closest('.equipment-brand-badge,.device-header');};
        const obstacles=[...root.querySelectorAll(obstacleSelector)].filter(visible).map(rect);
        root.querySelectorAll('span,small,strong,b,label,header,text').forEach(el=>{if(!el.childElementCount&&el.textContent.trim()&&visible(el))obstacles.push(rect(el));});
        const speaker=brands[p.brand].group==='listening';
        const surface=type==='streamIntegrated'?root.querySelector('.stream-glass'):type==='powerValve'?root.querySelector('.custom-power-connections'):speaker?root.querySelector('.sp-cab,.classic-box-cab,.tower-cabinet,.bookshelf-cabinet,.electrostatic-frame'):root.querySelector('.poweramp-body,.integrated-face,.custom-pre-face,.custom-power-face,.rack-face,.ai-panel,.phone-amp-face,.selector-face,.matrix-face,.signal-face,.bench-face,.cd-face,.interface-face,.amp4-rack-face,.at-plinth');
        const shape=surface?getComputedStyle(surface):null;
        const area=surface?rect(surface):{x:0,y:0,w:width,h:height};
        const radii=shape?[shape.borderTopLeftRadius,shape.borderTopRightRadius,shape.borderBottomRightRadius,shape.borderBottomLeftRadius].map(value=>Math.min(parseFloat(value)||0,area.w/2,area.h/2)): [0,0,0,0];
        // Printing is on the face, inside its frame, not across a wooden or
        // rounded cabinet rim. Coordinates below are outer-border coordinates.
        const frame=Object.fromEntries(['Left','Top','Right','Bottom'].map(side=>[side.toLowerCase(),shape?parseFloat(shape['border'+side+'Width'])||0:0]));
        const minY=type.startsWith('turntable')?Math.max(area.y,height*.62):area.y+frame.top;
        const insideCurve=(px,py)=>{
            const corners=[[area.x,area.y,1,1],[area.x+area.w,area.y,-1,1],[area.x+area.w,area.y+area.h,-1,-1],[area.x,area.y+area.h,1,-1]];
            return corners.every(([cx,cy,sx,sy],index)=>{const r=radii[index];if(!r||(px-cx)*sx>=r||(py-cy)*sy>=r)return true;return Math.hypot(px-(cx+sx*r),py-(cy+sy*r))<=r-3;});
        };

        const bottomInset=type==='turntableDirect'?14:type.startsWith('turntable')?7:3;
        const free=(x,y,w,h)=>x>=Math.max(5,area.x+frame.left+4)&&y>=Math.max(5,minY+4)&&x+w<=Math.min(width-5,area.x+area.w-frame.right-4)&&y+h<=Math.min(height-5,area.y+area.h-frame.bottom-bottomInset-2)&&[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].every(([px,py])=>insideCurve(px,py))&&!obstacles.some(o=>x<o.x+o.w+4&&x+w>o.x-4&&y<o.y+o.h+4&&y+h>o.y-4);
        const family=families[p.brand];
        // A family has a small set of named print rails. We reduce the lettering
        // before moving to the alternate rail; no search through the panel centre.
        let zones=family.zones;
        if(type.startsWith('audioInterface'))zones=['footer-left','header-left'];
        if(type==='spkElectrostatic')zones=['footer-center','header-center'];
        if(type.startsWith('turntable'))zones=['footer-left','footer-center','footer-right'];
        const variants=width<=260&&height<=115?[[68,12,'word'],[36,16,'mark'],[26,12,'mark']]:[[100,22,'full'],[88,18,'full'],[85,12,'word'],[90,10,'strip'],[70,9,'word'],[36,16,'mark'],[26,12,'mark'],[20,10,'mark']];
        const candidates=[];
        zones.forEach((zone,zoneIndex)=>variants.forEach(([w,h,mode],variantIndex)=>{
            const left=area.x+family.margin,right=area.x+area.w-family.margin-w;
            const targetX=zone.endsWith('left')?left:zone.endsWith('right')?right:area.x+(area.w-w)/2;
            const targetY=zone.startsWith('header')?Math.max(minY,area.y)+8:area.y+area.h-frame.bottom-bottomInset-h-10;
            const xs=[0,-8,8,-16,16,-24,24,-32,32];
            const ys=zone.startsWith('header')?[0,4,8,12,16,20,24,28,32]:[0,-4,-8,-12,-16,-20,-24,-28,-32];
            xs.forEach(dx=>ys.forEach(dy=>{
                const x=targetX+dx,y=targetY+dy;
                if(free(x,y,w,h))candidates.push({x,y,w,h,mode,zone,score:zoneIndex*1000+variantIndex*80+Math.abs(dx)+Math.abs(dy)*1.3});
            }));
        }));
        // Reserved signature areas for models whose functional front layout
        // interrupts the normal rail. These are deliberate, reviewed exceptions.
        const slots={
            receiver:{x:(width-100)/2,y:112,w:100,h:18,mode:'full',zone:'connector-center'},
            turntableLinear:{x:185,y:207,w:100,h:18,mode:'full',zone:'footer-left'},
            powerValve:{x:130,y:height-43,w:100,h:22,mode:'full',zone:'header-left'},
            powerAmp:{x:30,y:65,w:46,h:10,mode:'word',zone:'power-left'},
            spkActiveRounded:{x:(width-70)/2,y:6,w:70,h:8,mode:'word',zone:'header-center'},
            floorFlax:{x:(width-70)/2,y:9,w:70,h:9,mode:'word',zone:'header-center'},
        };
        if(type==='audioInterface1'||type==='audioInterface3')slots[type]={x:24,y:height-25,w:70,h:12,mode:'word',zone:'footer-left'};
        const slot=slots[type];if(slot&&free(slot.x,slot.y,slot.w,slot.h))candidates.push({...slot,score:-1});
        // Compact decks have controls across the entire front: a small signature
        // beside the power key is their explicitly reserved manufacturing mark.
        if(type==='turntableDirect'){
            const x=area.x+48,y=Math.max(minY,area.y)+5;
            if(free(x,y,28,14))candidates.push({x,y,w:28,h:14,mode:'mark',zone:'deck-power-signature',score:-1});
        }
        if(!candidates.length){
            zones.forEach((zone,zoneIndex)=>{
                const w=24,h=12,target=zone.endsWith('left')?area.x+family.margin:area.x+(area.w-w)/2;
                const ys=zone.startsWith('header')?Array.from({length:12},(_,i)=>Math.max(minY,area.y)+5+i*3):Array.from({length:18},(_,i)=>area.y+area.h-bottomInset-h-5-i*3);
                for(const y of ys)for(let x=area.x+8;x<area.x+area.w-w-8;x+=6)if(free(x,y,w,h))candidates.push({x,y,w,h,mode:'mark',zone,score:3000+zoneIndex*1000+Math.abs(x-target)+Math.abs(y-(zone.startsWith('header')?minY:area.y+area.h))*2});
            });
        }
        const choice=candidates.sort((a,b)=>a.score-b.score)[0];
        if(!choice){badge.dataset.placement='unplaced';badge.hidden=true;return;}
        if(['benchMeter','benchMeterVintage','signalGenerator','signalGeneratorVintage'].includes(type)){
            choice.x=(width-choice.w)/2;choice.zone='header-center';
        }
        if(['speakerConverter','phonoConverter'].includes(type)){
            Object.assign(choice,{x:(width-68)/2,y:height-25,w:68,h:12,mode:'word',zone:'footer-center'});
        }
        if(['rcaSwitch','speakerSwitch'].includes(type)){
            Object.assign(choice,{x:24,y:height-34,w:88,h:18,mode:'full',zone:'footer-left'});
        }
        if(type==='rcaSwitch')Object.assign(choice,{w:68,h:12,y:height-25,mode:'word'});
        const {x,y,w,h,mode,zone}=choice;
        Object.assign(badge.style,{left:(x-root.clientLeft)+'px',top:(y-root.clientTop)+'px',width:w+'px',height:h+'px'});
        badge.dataset.mode=mode;badge.dataset.zone=zone;
        badge.innerHTML=mode==='mark'?logo(p.brand,true):logo(p.brand,false,true)+(mode==='word'?'':'<span class="equipment-brand-model">'+p.model+'</span>');
        badge.querySelector('svg').setAttribute('preserveAspectRatio',zone.endsWith('left')?'xMinYMid meet':zone.endsWith('right')?'xMaxYMid meet':'xMidYMid meet');
    }

    function mount(root,type,role){
        const p=get(type);if(!p||unprinted(type))return;
        root.dataset.productFamily=p.brand;
        root.dataset.manufacturer=p.manufacturer.name;root.dataset.brand=p.brand;root.dataset.model=p.model;
        root.dataset.brandPrint=printFinish(root,type);
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
            if(type==='preGlass')Object.assign(heading.style,{left:'42px',right:'auto',width:'144px'});
            if(type==='tapeDeck')Object.assign(heading.style,{position:'absolute',left:'50%',transform:'translateX(-50%)',top:'10px',width:'140px'});
            const led=heading.querySelector('.device-led');heading.replaceChildren(badge);if(type==='preClassic')badge.innerHTML=logo(p.brand)+'<span class="equipment-brand-model">'+p.model+'</span>';if(led)heading.appendChild(led);badge.dataset.mode=type==='preClassic'||type==='spkActiveCompact'?'full':'strip';badge.dataset.placement='heading';badge.dataset.zone=type==='preClassic'?'header-center':type==='spkActiveCompact'?'footer-center':'header-left';
            if(type==='tapeDeck'){badge.dataset.mode='full';badge.dataset.zone='header-center';}
            Object.assign(badge.style,{position:'relative',width:type==='preClassic'?'160px':type==='spkActiveCompact'?'96px':type==='tapeDeck'?'140px':'112px',height:type==='preClassic'?'32px':type==='spkActiveCompact'?'20px':type==='tapeDeck'?'22px':'12px'});badge.querySelector('svg').setAttribute('preserveAspectRatio',badge.dataset.zone.endsWith('left')?'xMinYMid meet':'xMidYMid meet');return;
        }
        const grille=root.querySelector('.speaker-grille');
        if(grille&&!root.classList.contains('grille-off')&&getComputedStyle(grille).display!=='none'){
            badge.dataset.mode='full';badge.dataset.placement='grille';badge.dataset.zone='footer-center';Object.assign(badge.style,{left:'calc(50% - 46px)',bottom:'6px',width:'92px',height:'20px'});grille.appendChild(badge);return;
        }
        badge.dataset.placement='face';placeBadge(root,badge,type);root.appendChild(badge);
    }
    function catalog(item,type){
        const p=get(type);if(!p||unprinted(type)||item.querySelector('.catalog-product-identity'))return;
        item.dataset.brand=p.manufacturer.name;item.dataset.model=p.model;
        const line=document.createElement('small');line.className='catalog-product-identity';line.setAttribute('translate','no');line.textContent=name(type);item.appendChild(line);
        item.setAttribute('aria-label',name(type,item.querySelector(':scope>span')?.textContent.trim()));
    }
    return Object.freeze({brands,products,get,name,splitName,logo,mount,catalog,unprinted,families});
});
