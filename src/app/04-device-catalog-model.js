/* Equipment names, families, furniture, placement, ports, and type groups. */
        const DEVICE_NAMES = {
            furnitureRack:'Rack de Áudio', furnitureCoverflow:'Coleção de Discos · Spotify', furnitureRackTall:'Rack com Vãos Altos', furnitureRackSix:'Rack com 6 Prateleiras', furnitureRackSixTall:'Rack com Vãos Altos · 6 Prateleiras', furnitureTable:'Mesa de Áudio', furnitureNiche:'Nicho de Áudio', cdCollection:'Conjunto de CDs', pendantLamp:'Luminária pendente', wallLampCage:'Arandela industrial', wallLampDome:'Arandela de prato',
            adapterRcaP2:'Adaptador RCA → P2', adapterP2Rca:'Adaptador P2 → RCA', adapterP10P2:'Adaptador P10 → P2', adapterP2P10:'Adaptador P2 → P10', adapterRcaP10:'Adaptador RCA → P10', adapterP10Rca:'Adaptador P10 → RCA', phonoConverter:'Conversor Phono → Linha', speakerConverter:'Conversor Amplificado → Linha',
            turntable: 'Toca-discos', turntableVintage: 'Toca-discos Vintage', turntableLinear:'Toca-discos Tangencial',
            hardwareDemo:'Modelo · Controles',signalGeneratorVintage:'Gerador de Sinais Vintage', signalGenerator:'Gerador de Sinais', cdPlayer: 'CD Player', tapeDeck:'Tape Deck de Rolo', preamp:'Pré · Slim',preReference:'Pré · Visor Verde',preControl:'Pré · Controle 2.1',preDisplay:'Pré · Tela Central', benchMeter:'Medidor de Bancada', benchMeterVintage:'Medidor de Bancada Vintage',
            streamer: 'Streamer Hi-Fi',streamIntegrated:'Streamer Integrado',audioInterface1:'Interface USB · Compacta',audioInterface2:'Interface USB · Central',audioInterface3:'Interface USB · Estéreo',audioInterface4:'Interface USB · Dupla',
            receiver: 'Receiver Vintage',powerValve:'Potência · Valvulado',powerDual:'Potência · Duplo Canal',powerBias:'Potência · Visor Circular',
            integratedBlue:'Integrado · Visores Azuis',integratedMinimal:'Integrado · Minimalista',integratedSilver:'Integrado · Prateado',
            integratedUtility:'Integrado · Essencial',prePrecision:'Pré · Precisão',
            preGlass:'Pré · Vidro Clássico',
            headphoneAmp: 'Amplificador de Fone Vintage', headphoneAmpModern: 'Amplificador de Fone Normal',
            headphoneAmp4: 'Amplificador de Fones 4 Canais',
            rcaSwitch: 'Seletor RCA Estéreo', rcaSwitchVintage: 'Seletor RCA Vintage',
            rcaMatrix: 'Seletor RCA 3×4', rcaMatrixVintage: 'Seletor RCA 3×4 Vintage',
            mixer: 'Mixer 3 Canais', mixerVintage: 'Mixer Vintage',
            subwooferPassive: 'Subwoofer Passivo', subwooferPassiveVintage: 'Subwoofer Passivo Vintage',
            speakerSwitch: 'Seletor de Caixas A/B', speakerSwitchVintage: 'Seletor de Caixas A/B Vintage',
            crossover: 'Crossover 3 Vias', crossoverVintage: 'Crossover Vintage',
            powerAmp: 'Receiver Moderno', powerStereo: 'Amplificador de Potência Tradicional', powerVintage: 'Amplificador de Potência Vintage',
            speaker: 'Caixa Passiva',
            shelfCoax:'Bookshelf · Coaxial',shelfWood:'Bookshelf · Madeira',shelfTop:'Bookshelf · Tweeter Superior',spkPassiveWood: 'Caixa Passiva Vintage',floorDiamond:'Caixa de Piso · Tweeter Superior',floorCoax:'Caixa de Piso · Coaxial',floorFlax:'Caixa de Piso · Cones Naturais',
            spkPassiveCarbon: 'Caixa Passiva Moderna',
            spkPassiveGridBlack: 'Caixa Passiva · 3 Vias Preta',
            spkPassiveGridOrange: 'Caixa Passiva · 3 Vias Laranja',
            spkActiveMonitor: 'Caixa Ativa Vintage',
            spkActiveRounded:'Caixa Ativa · Precisão',spkActiveBookshelf: 'Caixa Ativa Moderna', spkActiveCompact:'Caixa Ativa Compacta',
            subwoofer: 'Subwoofer Ativo',
            subwooferCube: 'Subwoofer Cubo 10"',
            subwooferPro: 'Subwoofer Pro 12"',
            headphone: 'Fones Over-Ear',
            hpStudio: 'Fone Over-Ear Studio',
            hpClassic: 'Fone Vinyl Classic',
            hpKubaDisco2: 'Kuba Disco 2',
            hpOpenRing:'Fone Aberto · Anelar',hpOpenDome:'Fone Aberto · Cúpula',hpPlanar:'Fone Planar',hpMonitor:'Fone Monitor',hpMax:'Fone Max',
            eqStudio: 'Equalizador Studio',
            eqVintage: 'Equalizador Vintage',
            btReceiverA: 'Receptor Bluetooth Slim (Bluetooth → RCA)',
            btTransmitterPro: 'Transmissor Bluetooth Pro (RCA → fones)'
        };

        const DEVICE_FAMILIES = {
            streamIntegrated:'modern',
            integratedUtility:'vintage',prePrecision:'studio',
            preGlass:'vintage',
            turntableLinear:'vintage',
            hpMonitor:'modern',hpMax:'modern',
            signalGeneratorVintage:'vintage',benchMeterVintage:'vintage',benchMeter:'modern',
            headphoneAmpModern: 'modern',
            rcaMatrix: 'modern', rcaMatrixVintage: 'vintage',
            rcaSwitchVintage: 'vintage',
            powerStereo: 'studio', powerVintage: 'vintage',
            turntableVintage: 'vintage', turntable: 'studio', cdPlayer: 'studio', eqVintage: 'vintage', spkPassiveWood: 'vintage', spkPassiveGridOrange: 'vintage', spkActiveMonitor: 'vintage', hpClassic: 'vintage', headphoneAmp: 'vintage',
            eqStudio: 'studio', powerAmp: 'studio', spkPassiveCarbon: 'modern', spkPassiveGridBlack: 'vintage', subwooferPro: 'modern', hpStudio: 'studio',
            receiver: 'vintage',
            mixer: 'studio', mixerVintage: 'vintage', subwooferPassive: 'modern', subwooferPassiveVintage: 'vintage',
            speakerSwitch: 'modern', speakerSwitchVintage: 'vintage', crossover: 'studio', crossoverVintage: 'vintage',
            spkActiveRounded:'studio',streamer: 'modern', btReceiverA: 'modern', btTransmitterPro: 'studio', rcaSwitch: 'modern', headphoneAmp4: 'studio', spkActiveBookshelf: 'modern', subwoofer: 'modern', subwooferCube: 'modern', headphone: 'modern',
            speaker: 'vintage'
        };

        const FURNITURE_TYPES = {
            furnitureRack:{width:840,height:720,surfaces:[0,210,420,630],inset:20,rack:true,back:true,description:'Vãos de 194 px para acomodar equipamentos baixos e médios.'},
            furnitureRackTall:{width:840,height:840,surfaces:[0,260,520,780],inset:20,rack:true,back:true,description:'Use os vãos mais altos para acomodar equipamentos maiores ou empilhados.'},
            furnitureRackSix:{width:840,height:1120,surfaces:[0,210,420,630,840,1050],inset:20,rack:true,back:true,description:'Seis vãos de 194 px para equipamentos baixos e médios.'},
            furnitureRackSixTall:{width:840,height:1370,surfaces:[0,260,520,780,1040,1300],inset:20,rack:true,back:true,description:'Seis vãos de 244 px para acomodar equipamentos médios e altos.'},
            furnitureCoverflow:{width:2440,height:514,surfaces:[0],inset:26,rack:true,back:true,materials:['lightWood','darkWood'],defaultMaterial:'darkWood',description:'Coleção de álbuns e playlists do Spotify. Retire um vinil da capa aberta e coloque-o em um toca-discos; cabos e volumes controlam a escuta.'},
            cdCollection:{width:760,height:240,surfaces:[],inset:0,description:'Conjunto decorativo de CDs guardados lado a lado, com a lombada à vista.'},
            furnitureTable:{width:1680,height:760,surfaces:[0],inset:20,description:'Apoie os equipamentos sobre o tampo. Arraste a mesa pelo tampo ou pelos pés.'},
            furnitureNiche:{width:840,height:280,surfaces:[0,260],inset:20,back:true,description:'Acomode um equipamento dentro do nicho ou sobre ele.'}
        };
        const WALL_LAMP_TYPES=Object.freeze({wallLampCage:'cage',wallLampDome:'dome'});
        const FURNITURE_MATERIALS = {metal:'Metal',black:'Preto',lightWood:'Madeira clara',darkWood:'Madeira escura'};
        const furnitureMaterialsFor=type=>Object.fromEntries(Object.entries(FURNITURE_MATERIALS).filter(([key])=>!FURNITURE_TYPES[type]?.materials||FURNITURE_TYPES[type].materials.includes(key)));
        const furnitureMaterialFor=(type,value)=>Object.hasOwn(furnitureMaterialsFor(type),value)?value:(FURNITURE_TYPES[type]?.defaultMaterial||'black');
        function acousticTile(orientation){
            return `<span class="acoustic-foam foam-${orientation}" aria-hidden="true"></span>`;
        }
        function benchAcousticMarkup(){
            return Array.from({length:32},(_,i)=>acousticTile((Math.floor(i/8)+i%8)%2?'horizontal':'vertical')).join('');
        }
        function furnitureMarkup(type){
            const config=FURNITURE_TYPES[type];
            const part=(name,x,y,width,height,content='')=>`<div class="furniture-part ${name}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px">${content}</div>`;
            let parts='';
            if(type==='furnitureCoverflow'){
                parts='<div class="spotify-coverflow-host"><div class="spotify-flow-stage" tabindex="0" role="region" aria-label="Capas dos álbuns. Arraste, role ou use as setas para navegar."><div class="spotify-flow-cards"></div><p class="spotify-flow-message"></p></div><div class="spotify-flow-console"><div class="spotify-flow-info"><strong class="spotify-flow-title">Sua coleção de discos</strong><span class="spotify-flow-subtitle">Álbuns salvos no Spotify</span></div><div class="spotify-flow-actions"><button type="button" class="spotify-flow-connect">Conectar Spotify</button><button type="button" class="spotify-flow-prev" aria-label="Faixa anterior">◀</button><button type="button" class="spotify-flow-play" aria-label="Tocar álbum">▶</button><button type="button" class="spotify-flow-next" aria-label="Próxima faixa">▶</button><label>Ordenar <select class="spotify-flow-sort" aria-label="Ordenar álbuns"><option value="added">Recentes</option><option value="artist">Artista</option><option value="name">Título</option><option value="year">Ano</option></select></label></div><div class="spotify-flow-position-row"><input class="spotify-flow-position" type="range" min="0" max="0" value="0" data-hardware-slider="coverflow" aria-label="Posição na coleção"><span class="spotify-flow-count"></span></div></div></div>'+
                    part('furniture-top',0,0,config.width,28)+part('furniture-side',0,28,26,416)+part('furniture-side',config.width-26,28,26,416)+part('furniture-shelf',0,444,config.width,30)+part('furniture-caster',42,474,42,40,'<span class="caster-stem"></span><span class="caster-wheel"></span>')+part('furniture-caster',config.width-84,474,42,40,'<span class="caster-stem"></span><span class="caster-wheel"></span>');
            }else if(type==='furnitureTable'){
                parts=part('furniture-top',0,0,config.width,28)+part('furniture-leg',60,28,40,config.height-28)+part('furniture-leg',config.width-100,28,40,config.height-28)+part('furniture-brace',100,80,config.width-200,20);
            }else if(type==='cdCollection'){
                const colors=['#7d2529','#294d55','#a06d38','#343c65','#697341','#663b58','#9a4930','#355f52'];
                const cases=Array.from({length:47},(_,index)=>`<span class="cd-collection-case" style="--case-x:${26+index*15}px;--case-height:${212+(index%4)*3}px;--case-color:${colors[index%colors.length]}" aria-hidden="true"><i></i><b>${String(index+1).padStart(2,'0')}</b></span>`).join('');
                parts=part('cd-collection-body',0,0,config.width,config.height,`<span class="cd-collection-cases">${cases}</span>`);
            }else if(config.rack){
                const bodyHeight=config.surfaces.at(-1)+16;
                parts=config.surfaces.map(y=>part('furniture-shelf',20,y,config.width-40,16)).join('')+part('furniture-leg',28,bodyHeight,20,44)+part('furniture-leg',config.width-48,bodyHeight,20,44)+part('furniture-side',0,0,20,bodyHeight)+part('furniture-side',config.width-20,0,20,bodyHeight);
            }else{
                parts=part('furniture-side',0,0,20,280)+part('furniture-side',820,0,20,280)+part('furniture-top',0,0,840,20)+part('furniture-shelf',0,260,840,20);
            }
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><div class="furniture-body ${config.back?'rack-body':''} ${config.rack?'furniture-rack':''}" style="width:${config.width}px;height:${config.height}px;--back-top:${config.rack?16:20}px;--back-bottom:${config.rack?60:20}px">${parts}</div>`;
        }
        const BENCH_SURFACES={wood:'Madeira',felt:'Feltro',studio:'Estúdio'};
        const BENCH_DECORATIONS={records:'Discos',covers:'Capas',cds:'CDs',lamp:'Luminária'};
        const BENCH_DECORATION_ASSETS={records:'vinyl-record',covers:'record-sleeves',cds:'compact-discs',lamp:'desk-lamp'};
        function updateBenchAppearance(dev){
            if(dev.type!=='furnitureTable')return;
            const settings=dev.state;
            settings.benchSurface=Object.hasOwn(BENCH_SURFACES,settings.benchSurface)?settings.benchSurface:'wood';
            settings.benchBackdrop=settings.benchBackdrop===true;
            settings.benchDecorations=Array.isArray(settings.benchDecorations)?Object.keys(BENCH_DECORATIONS).filter(key=>settings.benchDecorations.includes(key)):[];
            dev.el.dataset.benchSurface=settings.benchSurface;
            dev.el.dataset.benchBackdrop=String(settings.benchBackdrop);
            dev.el.querySelector('.bench-scene')?.remove();
            const scene=document.createElement('div');scene.className='bench-scene';scene.setAttribute('aria-hidden','true');
            scene.innerHTML='<div class="bench-backdrop">'+benchAcousticMarkup()+'</div>'+settings.benchDecorations.map(key=>`<img class="bench-decoration bench-decoration-${key}" src="./assets/decorations/${BENCH_DECORATION_ASSETS[key]}.svg" alt="" loading="lazy" decoding="async" draggable="false">`).join('');
            dev.el.querySelector('.furniture-body').prepend(scene);
            Hardware.updateLightingDemo();
        }
        const STACK_FEET=Object.freeze({width:22,height:20,insetRatio:.1});
        const hasStackFeet=dev=>!FURNITURE_TYPES[dev.type]&&!INTERFACE_DEVICES[dev.type]?.passive&&dev.type!=='pendantLamp'&&!WALL_LAMP_TYPES[dev.type]&&dev.el.offsetWidth>=300&&(dev.el.offsetHeight<dev.el.offsetWidth*.8||dev.type==='tapeDeck');
        const maxEquipmentBottom=()=>canvas.dataset.theme==='scene'?floorPlacementBottom():world.offsetHeight;
        const sceneSideInset=()=>canvas.dataset.theme==='scene'?ROOM_SIDE_INSET:0;
        function snapOnEquipment(dev,x,y){
            if(FURNITURE_TYPES[dev.type])return{x,y};
            const width=dev.el.offsetWidth,height=dev.el.offsetHeight;
            let best=null;
            let touching=null;
            // All three chassis heights leave the same physical space for their feet.
            if(!best&&dev.el.dataset.chassis){
                Object.values(state.devices).forEach(lower=>{
                    if(lower===dev||!lower.el.dataset.chassis)return;
                    const lx=parseFloat(lower.el.style.left)||0,ly=parseFloat(lower.el.style.top)||0;
                    const overlap=Math.min(x+width,lx+lower.el.offsetWidth)-Math.max(x,lx);
                    if(overlap>=Math.min(width,lower.el.offsetWidth)*.7&&Math.abs(y+height-ly)<=Math.max(4,4/view.zoom))touching={x,y:ly-height};
                    let targetY=ly-height-STACK_FEET.height;
                    // All chassis use the same bottom-edge grid, including mixed-height stacks.
                    // Keep the invariant even for older projects with positions between grid lines.
                    targetY=snapCoordinate(targetY+height)-height;
                    const distance=Math.abs(y-targetY);
                    if(targetY>=0&&overlap>=Math.min(width,lower.el.offsetWidth)*.7&&distance<=14/view.zoom&&(!best||distance<best.distance))best={distance,x,y:targetY};
                });
            }
            return touching||best||{x,y};
        }

        function placementShapes(dev, x, y) {
            if (FURNITURE_TYPES[dev.type]) return [...dev.el.querySelectorAll('.furniture-part')].map(part => ({
                x:x + part.offsetLeft, y:y + part.offsetTop, width:part.offsetWidth, height:part.offsetHeight
            }));
            return [{x,y,width:dev.el.offsetWidth,height:dev.el.offsetHeight}];
        }
        function canPlaceEquipment(dev, x, y, ignored = new Set()) {
            const inset=sceneSideInset();
            if (x < inset || y < 0 || x + dev.el.offsetWidth > world.offsetWidth-inset || y + dev.el.offsetHeight > maxEquipmentBottom()) return false;
            const shapes = placementShapes(dev,x,y);
            return !Object.values(state.devices).some(other => {
                if (other.id === dev.id || ignored.has(other.id)) return false;
                const obstacles = placementShapes(other,parseFloat(other.el.style.left)||0,parseFloat(other.el.style.top)||0);
                return shapes.some(a => obstacles.some(b => a.x < b.x+b.width-.5 && a.x+a.width > b.x+.5 && a.y < b.y+b.height-.5 && a.y+a.height > b.y+.5));
            });
        }
        function findFreePlacement(dev,x,y) {
            const start = snapOnEquipment(dev,Math.max(0,snapCoordinate(x)),Math.max(0,snapCoordinate(y+dev.el.offsetHeight)-dev.el.offsetHeight));
            if (canPlaceEquipment(dev,start.x,start.y)) return start;
            for (let radius=20;radius<=Math.max(world.offsetWidth,world.offsetHeight);radius+=20) {
                for (let offset=-radius;offset<=radius;offset+=20) {
                    for (const [dx,dy] of [[offset,-radius],[offset,radius],[-radius,offset],[radius,offset]]) {
                        const next={x:start.x+dx,y:start.y+dy};
                        if (canPlaceEquipment(dev,next.x,next.y)) return next;
                    }
                }
            }
            return null;
        }

        function settleEquipmentDrop(targets,ignored,fallback) {
            const obstacles=Object.values(state.devices).filter(dev=>!ignored.has(dev.id)).flatMap(dev=>placementShapes(dev,parseFloat(dev.el.style.left)||0,parseFloat(dev.el.style.top)||0));
            const shapes=targets.map(p=>({p,parts:placementShapes(p.dev,0,0)}));
            const fits=(dx,dy)=>shapes.every(({p,parts})=>{
                const x=p.x+dx,y=p.y+dy;
                const inset=sceneSideInset();
                if(x<inset||y<0||x+p.dev.el.offsetWidth>world.offsetWidth-inset||y+p.dev.el.offsetHeight>maxEquipmentBottom())return false;
                return parts.every(a=>!obstacles.some(b=>x+a.x<b.x+b.width-.5&&x+a.x+a.width>b.x+.5&&y+a.y<b.y+b.height-.5&&y+a.y+a.height>b.y+.5));
            });
            if(fits(0,0))return targets;
            let best=null;
            const limit=Math.ceil(Math.max(world.offsetWidth,world.offsetHeight)/20);
            for(let ring=1;ring<=limit;ring++){
                if(best&&ring*20>Math.sqrt(best.distance))break;
                const offsets=[];
                for(let step=-ring;step<=ring;step++){
                    offsets.push([step*20,-ring*20],[step*20,ring*20]);
                    if(Math.abs(step)!==ring)offsets.push([-ring*20,step*20],[ring*20,step*20]);
                }
                offsets.sort((a,b)=>(a[0]**2+a[1]**2)-(b[0]**2+b[1]**2));
                for(const [dx,dy] of offsets){
                    const distance=dx*dx+dy*dy;
                    if(best&&distance>=best.distance)continue;
                    if(fits(dx,dy)){best={dx,dy,distance};break;}
                }
            }
            return best?targets.map(p=>({...p,x:p.x+best.dx,y:p.y+best.dy})):fallback;
        }
        function gravityDropTargets(targets,ignored){
            if(!gravityEnabled||targets.some(p=>p.dev.type==='pendantLamp'||WALL_LAMP_TYPES[p.dev.type]))return targets;
            const obstacles=Object.values(state.devices).filter(dev=>!ignored.has(dev.id)&&dev.type!=='pendantLamp'&&!WALL_LAMP_TYPES[dev.type]).flatMap(dev=>placementShapes(dev,parseFloat(dev.el.style.left)||0,parseFloat(dev.el.style.top)||0).map(shape=>({...shape,dev})));
            let distance=Math.min(...targets.map(p=>maxEquipmentBottom()-p.y-p.dev.el.offsetHeight));
            for(const p of targets){
                for(const shape of placementShapes(p.dev,p.x,p.y)){
                    for(const obstacle of obstacles){
                        const overlap=Math.min(shape.x+shape.width,obstacle.x+obstacle.width)-Math.max(shape.x,obstacle.x);
                        if(overlap<Math.min(12,shape.width*.2))continue;
                        const furniture=FURNITURE_TYPES[obstacle.dev.type],supportX=parseFloat(obstacle.dev.el.style.left)||0;
                        const shelf=furniture?.surfaces.some(surface=>Math.abs(obstacle.y-(parseFloat(obstacle.dev.el.style.top)||0)-surface)<.5);
                        const feet=hasStackFeet(p.dev)&&((furniture&&shelf&&p.x>=supportX+furniture.inset-1&&p.x+p.dev.el.offsetWidth<=supportX+furniture.width-furniture.inset+1)||(!furniture&&hasStackFeet(obstacle.dev)&&overlap>=Math.min(shape.width,obstacle.width)*.7))?STACK_FEET.height:0;
                        const gap=obstacle.y-shape.y-shape.height;
                        if(gap>=-.5)distance=Math.min(distance,Math.max(0,gap-feet));
                    }
                }
            }
            return distance>.5?targets.map(p=>({...p,y:p.y+distance})):targets;
        }
        function settleNewDeviceWithGravity(dev){
            if(state.restoringProject||!gravityEnabled||dev.type==='pendantLamp'||WALL_LAMP_TYPES[dev.type])return;
            const startY=parseFloat(dev.el.style.top)||0;
            const target=gravityDropTargets([{dev,x:parseFloat(dev.el.style.left)||0,y:startY}],new Set([dev.id]))[0];
            if(target.y-startY<1)return;
            if(matchMedia('(prefers-reduced-motion: reduce)').matches){dev.el.style.top=target.y+'px';updateCables();scheduleProjectSave();return;}
            const started=performance.now(),duration=Math.min(1150,540+(target.y-startY)*.24);
            let frame=0;
            const step=now=>{
                if(!state.devices[dev.id])return;
                const progress=Math.min(1,(now-started)/duration),ease=progress*progress;
                dev.el.style.top=(startY+(target.y-startY)*ease)+'px';updateCables(new Set([dev.id]));
                if(progress<1)frame=requestAnimationFrame(step);
                else {frame=0;dev.cancelPlacementMotion=null;updateCables();scheduleProjectSave();}
            };
            dev.cancelPlacementMotion=()=>{cancelAnimationFrame(frame);frame=0;dev.cancelPlacementMotion=null;};
            frame=requestAnimationFrame(step);
        }

        // Supports live outside device boxes so they do not alter grid alignment.
        let deployedFootSupports=new Map();
        function updateStackFeet() {
            let layer = document.getElementById('stack-feet');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'stack-feet';
                layer.setAttribute('aria-hidden', 'true');
                layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;';
                world.appendChild(layer);
            }
            // Above furniture backs (1–2), always below equipment chassis (10+).
            layer.style.zIndex = '3';
            const boxes = Object.values(state.devices).map(dev => ({
                dev, x:dev.dragVisualPosition?.x??(parseFloat(dev.el.style.left)||0), y:dev.dragVisualPosition?.y??(parseFloat(dev.el.style.top)||0),
                width:dev.el.offsetWidth, height:dev.el.offsetHeight
            }));
            const equipment = boxes.filter(b => hasStackFeet(b.dev));
            const retainedFeet=new Set();
            const reducedFeetMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
            const nextSupports=new Map();
            equipment.forEach(upper => {
                const turntable=TURNTABLE_TYPES.has(upper.dev.type);
                if(turntable)upper.dev.el.classList.remove('turntable-stacked');
                const bottom = upper.y + upper.height;
                const shelfSupports=boxes.flatMap(f=>{
                    const config=FURNITURE_TYPES[f.dev.type];
                    if(!config||upper.x<f.x+config.inset-1||upper.x+upper.width>f.x+config.width-config.inset+1)return [];
                    return config.surfaces.map(surface=>({dev:f.dev,y:f.y+surface}));
                });
                const equipmentSupports=equipment.filter(lower=>{
                    const overlap=Math.min(upper.x+upper.width,lower.x+lower.width)-Math.max(upper.x,lower.x);
                    return lower!==upper&&overlap>=Math.min(upper.width,lower.width)*.7;
                });
                const support=[...shelfSupports,...equipmentSupports].filter(base=>base.y>=bottom&&base.y-bottom<=STACK_FEET.height).sort((a,b)=>a.y-b.y)[0];
                if(!support)return;
                const gap=support.y-bottom;
                if(gap<=.5){
                    // Contact leaves no exposed support: remove immediately, without a retracting foot.
                    layer.querySelectorAll('.auto-stack-foot').forEach(foot=>{if(foot.dataset.footOwner===upper.dev.id){foot.getAnimations().forEach(animation=>animation.cancel());foot.remove();}});
                    return;
                }
                nextSupports.set(upper.dev.id,support.dev.id);
                const newlyDeployed=deployedFootSupports.get(upper.dev.id)!==support.dev.id;
                if(newlyDeployed)playUiSound('feet');
                if(turntable)upper.dev.el.classList.add('turntable-stacked');
                // Turntables retain the original feet in their layout when hidden.
                // Start the replacement feet at the cabinet, not below that reserved space.
                const plinth=turntable?upper.dev.el.querySelector('.at-plinth'):null;
                const footTop=plinth?upper.y+plinth.offsetTop+plinth.offsetHeight:bottom;
                const left=upper.x, right=upper.x+upper.width;
                const inset = Math.max(16, (right - left) * STACK_FEET.insetRatio), width = STACK_FEET.width;
                const footHeight=support.y-footTop;
                [left + inset, right - inset - width].forEach((x,index) => {
                    const key=upper.dev.id+':'+index;
                    let foot=[...layer.querySelectorAll('.auto-stack-foot')].find(el=>el.dataset.footKey===key);
                    const entering=!foot||foot.dataset.retracting==='true';
                    if(!foot){foot=document.createElement('span');foot.className='auto-stack-foot';foot.setAttribute('aria-hidden','true');foot.dataset.footKey=key;foot.dataset.footOwner=upper.dev.id;layer.appendChild(foot);}
                    if(foot.dataset.retracting==='true'){foot.getAnimations().forEach(animation=>animation.cancel());delete foot.dataset.retracting;}
                    retainedFeet.add(foot);
                    foot.dataset.offsetX=String(x-upper.x);foot.dataset.offsetY=String(footTop-upper.y);
                    foot.style.cssText = `position:absolute;display:block;pointer-events:none;margin:0;padding:0;min-width:0;min-height:0;flex:none;visibility:${upper.dev.el.style.visibility==='hidden'?'hidden':'visible'};left:${x}px;top:${footTop}px;width:${width}px;height:${footHeight}px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,#131617,#454b4e 45%,#181b1d);border-bottom:3px solid #111;box-sizing:border-box;box-shadow:0 2px 2px #0003;`;
                    foot.style.transformOrigin='50% 0';
                    if(entering&&!reducedFeetMotion){
                        foot.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)',offset:.65},{transform:'scaleY(.94)',offset:.82},{transform:'scaleY(1)'}],{duration:240,easing:'ease-out'});
                    }
                });
            });
            [...layer.querySelectorAll('.auto-stack-foot')].forEach(foot=>{
                const owner=state.devices[foot.dataset.footOwner];
                if(!owner){foot.remove();return;}
                // Retracting feet keep following their owner, even while it is dragged away.
                foot.style.left=((owner.dragVisualPosition?.x??(parseFloat(owner.el.style.left)||0))+Number(foot.dataset.offsetX))+'px';
                foot.style.top=((owner.dragVisualPosition?.y??(parseFloat(owner.el.style.top)||0))+Number(foot.dataset.offsetY))+'px';
                foot.style.visibility=owner.el.style.visibility==='hidden'?'hidden':'visible';
                if(retainedFeet.has(foot)||foot.dataset.retracting==='true')return;
                if(reducedFeetMotion){foot.remove();return;}
                foot.dataset.retracting='true';foot.getAnimations().forEach(animation=>animation.cancel());
                const retract=foot.animate([{transform:'scaleY(1)'},{transform:'scaleY(.92)',offset:.25},{transform:'scaleY(0)'}],{duration:170,easing:'ease-in',fill:'forwards'});
                retract.onfinish=()=>{if(foot.dataset.retracting==='true')foot.remove();};
            });
            if([...deployedFootSupports.keys()].some(id=>state.devices[id]&&!nextSupports.has(id)))playUiSound('feetRetract');
            deployedFootSupports=nextSupports;
        }

        const INTERFACE_DEVICES = {
            adapterRcaP2:{name:'ADAPTADOR RCA → P2',input:'rca',output:'p2',passive:true,description:'Une RCA L/R em P2 TRS estéreo. Preserva os canais e o nível de linha, phono ou fones; não amplifica nem aplica RIAA.'},
            adapterP2Rca:{name:'ADAPTADOR P2 → RCA',input:'p2',output:'rca',passive:true,description:'Separa P2 TRS estéreo em RCA L/R, preservando os canais e o nível recebido. Uma saída de fones exige ajuste de volume ao alimentar linha.'},
            adapterP10P2:{name:'ADAPTADOR P10 → P2',input:'p10',output:'p2',passive:true,description:'Adapta P10 TRS estéreo para P2 TRS estéreo. Mantém L/R e o nível recebido; não transforma linha em sinal para fones.'},
            adapterP2P10:{name:'ADAPTADOR P2 → P10',input:'p2',output:'p10',passive:true,description:'Adapta P2 TRS estéreo para P10 TRS estéreo. Permite ligar a saída P2 de fones aos fones P10, sem alterar o sinal.'},
            adapterRcaP10:{name:'ADAPTADOR RCA → P10',input:'rca',output:'p10',passive:true,description:'Adapta RCA R/L para P10 TRS estéreo. Preserva linha, phono ou fones; não amplifica, não atenua e não aplica RIAA.'},
            adapterP10Rca:{name:'ADAPTADOR P10 → RCA',input:'p10',output:'rca',passive:true,description:'Adapta P10 TRS estéreo para RCA R/L. Preserva linha, phono ou fones; não converte o nível do sinal.'},
            phonoConverter:{name:'PHONO → LINHA',input:'rca',output:'rca',inputSignal:'phono',outputSignal:'line',description:'Pré de phono: aplica ganho e equalização RIAA ao sinal phono e entrega nível de linha por RCA R/L.'},
            speakerConverter:{name:'AMPLIFICADO → LINHA',input:'wire',output:'rca',inputSignal:'amplified',outputSignal:'line',description:'Conversor de nível alto para baixo: atenua uma saída SPEAKER amplificada para uma entrada de linha RCA. Não serve para saída de fones.'}
        };
        const TURNTABLE_TYPES = new Set(['turntable', 'turntableVintage','turntableLinear']);
        function rotateAudioAdapter(dev,delta){
            if(!AudioAdapterDesign.models[dev.type])return;
            dev.adapterErrorMotion?.cancel();
            const old=dev.state.adapterRotation||0,x=parseFloat(dev.el.style.left)||0,y=parseFloat(dev.el.style.top)||0;
            const center={x:x+dev.el.offsetWidth/2,y:y+dev.el.offsetHeight/2};
            const next=AudioAdapterDesign.layout(dev.el,dev.type,old+delta);
            const target={x:Math.max(sceneSideInset(),Math.min(world.offsetWidth-dev.el.offsetWidth-sceneSideInset(),snapCoordinate(center.x-dev.el.offsetWidth/2))),y:Math.max(0,Math.min(maxEquipmentBottom()-dev.el.offsetHeight,snapCoordinate(center.y-dev.el.offsetHeight/2)))};
            const status=inspectorContent.querySelector('[data-adapter-rotation-status]');
            if(!canPlaceEquipment(dev,target.x,target.y)){
                AudioAdapterDesign.layout(dev.el,dev.type,old);
                const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
                dev.adapterErrorMotion=dev.el.animate(reduced?[{opacity:1},{opacity:.65},{opacity:1}]:[0,-6,5,-4,3,-1,0].map(x=>({transform:`translateX(${x}px)`})),{duration:reduced?240:340,easing:'ease-out'});
                if(status)status.textContent='Afaste o adaptador dos outros objetos para girar.';
                return;
            }
            dev.state.adapterRotation=next;dev.el.style.left=target.x+'px';dev.el.style.top=target.y+'px';
            const output=inspectorContent.querySelector('[data-adapter-angle]');if(output)output.textContent=next+'°';if(status)status.textContent='';
            updateCables(new Set([dev.id]));updateStackFeet();window.dispatchEvent(new Event('audio-lighting-dirty'));scheduleProjectSave();
        }
        const BENCH_METER_TYPES=new Set(['benchMeter','benchMeterVintage']);
        const SIGNAL_GENERATOR_TYPES=new Set(['signalGenerator','signalGeneratorVintage']);
        const CAPTURE_INTERFACE_TYPES=new Set(['audioInterface1','audioInterface2','audioInterface3','audioInterface4']);
        const SOURCE_TYPES = new Set([...TURNTABLE_TYPES, 'cdPlayer', 'streamer','streamIntegrated', 'btReceiverA','tapeDeck','signalGenerator','signalGeneratorVintage',...CAPTURE_INTERFACE_TYPES]);
        const spotifyVinyls=new Map(),spotifyAlbums=new Map();
        let spotifyPlayingTurntable=null,spotifyVolume=0,spotifyVolumeTimer=0,spotifyNoticeTimer=0;
        const EQ_TYPES = new Set(['eqStudio', 'eqVintage']);
        const BT_RX_TYPES = new Set(['btReceiverA']);
        const BT_TX_TYPES = new Set(['btTransmitterPro']);
        const SUB_TYPES = new Set(['subwoofer', 'subwooferCube', 'subwooferPro']);
        const MIXER_TYPES = new Set(['mixer', 'mixerVintage']);
        const CROSSOVER_TYPES = new Set(['crossover', 'crossoverVintage']);
        const SPEAKER_SWITCH_TYPES = new Set(['speakerSwitch', 'speakerSwitchVintage']);
        const PASSIVE_SUB_TYPES = new Set(['subwooferPassive', 'subwooferPassiveVintage']);
        const MATRIX_TYPES = new Set(['rcaMatrix','rcaMatrixVintage']);
        const RCA_SWITCH_TYPES = new Set(['rcaSwitch', 'rcaSwitchVintage']);
        const SELECTOR_TYPES = new Set([...RCA_SWITCH_TYPES, ...SPEAKER_SWITCH_TYPES]);
        const BOOKSHELF_SPEAKERS={
            shelfCoax:{height:424,width:280,watts:100,ohms:8,recommended:true,finish:'coax',description:'Bookshelf passiva com frente curva e conjunto coaxial cobre. Médios e agudos equilibrados.'},
            shelfWood:{height:504,width:278,watts:200,ohms:6,finish:'wood',description:'Bookshelf passiva de duas vias com madeira envernizada, tweeter de domo macio e woofer escuro.'},
            shelfTop:{height:578,width:269,watts:120,ohms:8,recommended:true,finish:'top',description:'Bookshelf passiva com tweeter separado no topo e cone prateado. Agudos destacados.'}
        };
        const FLOOR_SPEAKERS={
            floorDiamond:{height:1040,cabinet:244,watts:200,ohms:8,recommended:true,finish:'diamond',description:'Caixa de piso passiva com gabinete curvo, tweeter separado, um médio e dois woofers. Impedância nominal de 8 Ω e amplificação recomendada até 200 W.'},
            floorCoax:{height:1240,cabinet:200,watts:300,ohms:4,recommended:true,finish:'coax',description:'Caixa de piso passiva com conjunto coaxial e quatro woofers em gabinete estreito. Impedância nominal de 4 Ω e amplificação recomendada até 300 W.'},
            floorFlax:{height:1120,cabinet:248,watts:300,ohms:8,recommended:true,finish:'flax',description:'Caixa de piso passiva com médio e três woofers em tom de linho, tweeter de domo invertido e base de vidro. Impedância nominal de 8 Ω e amplificação recomendada até 300 W.'}
        };
        const PASSIVE_SPK = new Set(['speaker', 'spkPassiveWood', 'spkPassiveCarbon', 'spkPassiveGridBlack', 'spkPassiveGridOrange',...Object.keys(FLOOR_SPEAKERS),...Object.keys(BOOKSHELF_SPEAKERS)]);
        const ACTIVE_SPK = new Set(['spkActiveRounded','spkActiveMonitor', 'spkActiveBookshelf','spkActiveCompact']);
        const ACTIVE_SPEAKER_RATINGS=Object.freeze({spkActiveRounded:{watts:100,inputOhms:10000},spkActiveMonitor:{watts:60,inputOhms:10000},spkActiveBookshelf:{watts:80,inputOhms:10000},spkActiveCompact:{watts:36,inputOhms:10000}});
        const ACTIVE_SUB_RATINGS=Object.freeze({subwoofer:{watts:150,inputOhms:10000},subwooferCube:{watts:80,inputOhms:10000},subwooferPro:{watts:300,inputOhms:10000}});
        const REFERENCE_HEADPHONES={
            hpKubaDisco2:{ohms:32,powerMw:300,enclosure:'Fechado',description:'Kuba Disco 2 com arco clássico de madeira laminada, almofadas XL costuradas e conchas com relevos concêntricos. Acabamentos Tauari, Nogueira e Ébano; conexão P2 no cabo.'},
            hpOpenRing:{ohms:300,powerMw:500,description:'Fone aberto com conchas ovais, aros metálicos, grade vazada e arco com almofadas segmentadas. Suporte padrão e entrada P2 estéreo na ponta do cabo.'},
            hpOpenDome:{ohms:80,powerMw:500,description:'Fone aberto com conchas arredondadas, grade em colmeia, hastes de carbono e faixa de suspensão. Suporte padrão e entrada P2 estéreo na ponta do cabo.'},
            hpPlanar:{ohms:20,powerMw:1000,description:'Fone planar aberto com conchas amplas, grades horizontais, hastes metálicas e arco acolchoado. Suporte padrão e entrada P2 estéreo na ponta do cabo.'}
        };
        const HP_TYPES = new Set(['headphone', 'hpStudio', 'hpClassic','hpMonitor','hpMax',...Object.keys(REFERENCE_HEADPHONES)]);
        const BT_HP_TYPES = new Set(['headphone','hpStudio','hpMax']);
        const KUBA_WOOD_FINISHES={tauari:'Tauari',walnut:'Nogueira',ebony:'Ébano'};
        function updateKubaAppearance(dev){
            if(dev.type!=='hpKubaDisco2')return;
            dev.state.kubaWood=Object.hasOwn(KUBA_WOOD_FINISHES,dev.state.kubaWood)?dev.state.kubaWood:'tauari';
            dev.el.dataset.kubaWood=dev.state.kubaWood;
        }

        const GRAPHIC_EQ_FREQUENCIES = [63,160,400,1000,2500,6300,16000];
        const EQ_BANDS = { eqStudio: GRAPHIC_EQ_FREQUENCIES, eqVintage: GRAPHIC_EQ_FREQUENCIES };

        function graphicEqMarkup(type) {
            const ports = (io) => `<div class="graphic-eq-ports"><div class="graphic-eq-pair"><div class="port" data-type="rca-r" data-io="${io}" data-node="${io}R" title="RCA ${io} · R"></div><div class="port" data-type="rca-l" data-io="${io}" data-node="${io}L" title="RCA ${io} · L"></div></div><span>RCA R/L ${io.toUpperCase()}</span><div class="port" data-type="p10" data-io="${io}" data-node="${io}Stereo" title="P10 TRS estéreo · ${io}"></div><span>P10 ${io.toUpperCase()}</span></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]} · 7 bandas</span></div><section class="graphic-eq-face"><i class="graphic-eq-handle handle-left" aria-hidden="true"></i><i class="graphic-eq-handle handle-right" aria-hidden="true"></i>${ports('in')}<div class="graphic-eq-bank">${GRAPHIC_EQ_FREQUENCIES.map((freq,i) => `<div class="graphic-eq-band"><input class="graphic-eq-fader eq-slider" type="range" min="-12" max="12" step="0.5" value="0" data-band="${i}" aria-label="${freq} Hz" title="${freq} Hz · 0 dB"><span aria-hidden="true">${freq>=1000?freq/1000+'k':freq}</span></div>`).join('')}</div>${ports('out')}<div class="graphic-eq-controls"><span class="graphic-eq-led"></span><input type="range" class="graphic-eq-level" min="0" max="1" step="0.01" value="1" aria-label="Nível de saída" title="Nível de saída"><span>LEVEL</span><div data-power-slot class="graphic-eq-power"><button class="power-btn" title="Ligar / desligar"></button></div></div></section>`;
        }

        function createEqFilters(freqs) {
            return freqs.map((freq, i) => {
                const filter = state.audioCtx.createBiquadFilter();
                if (i === 0) filter.type = 'lowshelf';
                else if (i === freqs.length - 1) filter.type = 'highshelf';
                else {
                    filter.type = 'peaking';
                    filter.Q.value = 1.05;
                }
                filter.frequency.value = freq;
                filter.gain.value = 0;
                return filter;
            });
        }

        function wireFilterChain(input, filters, output) {
            let node = input;
            filters.forEach(f => {
                node.connect(f);
                node = f;
            });
            node.connect(output);
        }

        function applyEqGains(dev) {
            (dev.eqFiltersR || []).forEach((f, i) => { f.gain.value = dev.state.eq[i] || 0; });
            (dev.eqFiltersL || []).forEach((f, i) => { f.gain.value = dev.state.eq[i] || 0; });
        }

        function updateKnobAngle(dev, selector, value, min, max) {
            const knob = dev.el.querySelector(selector);
            if (!knob) return;
            const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
            knob.style.setProperty('--knob-angle', `${-135 + ratio * 270}deg`);
        }

        function setHeadphoneAmp4Volume(dev, channel, value) {
            const clamped = Math.max(0, Math.min(1, value));
            dev.state.channelVolumes ||= [0.8, 0.8, 0.8, 0.8];
            dev.state.channelVolumes[channel] = clamped;
            if (dev.channelVolumes?.[channel]) dev.channelVolumes[channel].gain.value = clamped;
            const knob = dev.el.querySelector(`[data-channel-knob="${channel + 1}"]`);
            if (knob) knob.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
            updateKnobAngle(dev, `.amp4-channel:nth-child(${channel + 1}) .amp4-knob`, clamped, 0, 1);
            if (state.selectedDeviceId === dev.id) {
                const inspectorSlider = document.getElementById(`sl-amp4-${channel + 1}`);
                const inspectorLabel = document.getElementById(`lbl-amp4-${channel + 1}`);
                if (inspectorSlider) inspectorSlider.value = clamped;
                if (inspectorLabel) inspectorLabel.textContent = `${Math.round(clamped * 100)}%`;
            }
        }

