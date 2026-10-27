// Browser contract suite. Serve the repository on localhost:8765, then run this file.
// It creates every registered equipment type through the real device factory and
// removes it again, so the contract covers markup, initialized state, and cleanup.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');

(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/script.js?*',route=>{
            const source=fs.readFileSync(path.join(root,'script.js'),'utf8');
            const marker='        renderVisuals();',index=source.lastIndexOf(marker);
            assert(index>=0,'application test seam exists');
            const hook=`window.__equipmentContract={names:DEVICE_NAMES,createDevice,deleteDevice,appState,devices:appState.project.devices,compatibility:getPortCompatibility,amps:FIXED_AMP_SPECS,passive:FIXED_PASSIVE_SPECS,active:ACTIVE_SPEAKER_RATINGS,activeSubs:ACTIVE_SUB_RATINGS,bookshelf:BOOKSHELF_SPEAKERS,floor:FLOOR_SPEAKERS,headphones:HEADPHONE_SPECS,furniture:FURNITURE_TYPES,adapters:INTERFACE_DEVICES};\n`;
            return route.fulfill({contentType:'application/javascript',body:source.slice(0,index)+hook+source.slice(index)});
        });
        await page.goto(process.env.TEST_BASE_URL||'http://127.0.0.1:8765/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        const types=await page.evaluate(()=>Object.keys(__equipmentContract.names));
        assert.deepEqual(types.slice().sort(),require('./fixtures/equipment-contract-types.json').types,'inventory must be reviewed when a model is added or removed');
        assert(types.length>=90,`expected broad catalog coverage, got ${types.length}`);
        const catalog=await page.locator('.catalog-item[data-template]').evaluateAll(items=>items.map(item=>({type:item.dataset.template,category:item.dataset.catalogCategory||''})));
        assert.deepEqual(catalog.map(item=>item.type).sort(),types.slice().sort(),'every registered model must appear exactly once in the visible catalog');
        assert(catalog.every(item=>item.category&&item.category!=='Outros equipamentos'),'every model must be assigned an explicit catalog category');
        await page.evaluate(()=>AudioSystemLanguage.set('en'));

        const untranslated=new Set();
        async function scanVisibleLanguage(){
            const issues=await page.evaluate(()=>{
                const candidates=[],portuguese=/\b(?:entrada|sa[ií]da|ligar|desligar|desligado|ligado|volume|ganho|pot[eê]ncia|imped[aâ]ncia|sinal|canal|m[uú]sica|configura[cç][aã]o|propriedades|fone|caixa|equipamento|conectar|conecte|desconectar|disco|faixa|carregando|nenhum|nenhuma|buscar|autorizar|captura|material|madeira|preto|prata|cinza|agudo|graves|m[eé]dios|prefer[eê]ncias|restaurar|salvar|iniciar|parar|pausar|reproduzir|ligue|desativado|ativo|passivo|esquerdo|direito|clique|arraste|selecione|painel|menu|ajuste|reprodu[cç][aã]o|bot[aã]o|m[oó]vel|prateleira|cen[aá]rio|hor[aá]rio|noite|claro|escuro|conversor|amplificado|fones|caixas)\b|[áàãâéêíóôõúüç]/i;
                const visible=element=>{if(!element?.isConnected)return false;const style=getComputedStyle(element);return style.display!=='none'&&style.visibility!=='hidden'&&!!element.getClientRects().length;};
                const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
                while(walker.nextNode()){const node=walker.currentNode,text=node.data.trim();if(text&&visible(node.parentElement)&&!node.parentElement.closest('script,style,code,pre'))candidates.push(text);}
                document.querySelectorAll('[aria-label],[title],[placeholder],[alt],[data-tooltip]').forEach(element=>{
                    if(!visible(element))return;
                    for(const key of ['aria-label','title','placeholder','alt','data-tooltip']){const value=element.getAttribute(key)?.trim();if(value)candidates.push(value);}
                });
                document.querySelectorAll('option').forEach(option=>{const value=option.textContent.trim();if(value)candidates.push(value);});
                return [...new Set(candidates.filter(value=>portuguese.test(value)&&AudioSystemLanguage.sourceText(value)===value&&AudioSystemLanguage.translate(value)===value))];
            });
            for(const value of issues)untranslated.add(value);
        }
        await page.locator('.app-settings').evaluate(element=>{element.open=true;});
        await scanVisibleLanguage();
        await page.locator('.app-settings').evaluate(element=>{element.open=false;});

        const contractFailures=[];
        for(const type of types){
            try{
                await page.evaluate(type=>__equipmentContract.createDevice(type,120,120,`contract-${type}`),type);
                await scanVisibleLanguage();
                const result=await page.evaluate(type=>{
                    const api=__equipmentContract,name=api.names[type];
                    if(!name)return {error:'missing Portuguese name'};
                    const english=AudioSystemLanguage.translate(name);
                    if(!english.trim())return {error:'missing English label'};
                    const id=`contract-${type}`;
                    const dev=api.devices[id];
                    if(!dev)return {error:'factory did not register device'};
                    const box=dev.el.getBoundingClientRect();
                    const noCableRequired=new Set([...Object.keys(api.furniture),'pendantLamp','wallLampCage','wallLampDome','hardwareDemo','hpMax']);
                    const ports=[...dev.el.querySelectorAll('.port')].map(port=>({
                        type:port.dataset.type,io:port.dataset.io,node:port.dataset.node,
                        nodeExists:Object.hasOwn(dev.nodes,port.dataset.node),
                        rect:(()=>{const r=port.getBoundingClientRect(),d=dev.el.getBoundingClientRect();return {left:r.left-d.left,top:r.top-d.top,right:r.right-d.left,bottom:r.bottom-d.top};})()
                    }));
                    const malformed=ports.filter(port=>!['rca','rca-r','rca-l','p2','p10','wire'].includes(port.type)||!['in','out'].includes(port.io)||!port.node||!port.nodeExists);
                    const missingPorts=!noCableRequired.has(type)&&ports.length===0;
                    const outside=ports.filter(port=>port.rect.left < -2||port.rect.top < -2||port.rect.right > box.width+2||port.rect.bottom > box.height+2);
                    const button=dev.el.querySelector('.power-btn');
                    let power=null;
                    if(button){const before=dev.powered;button.click();const off=dev.powered;button.click();power={before,off,on:dev.powered};}
                    const specs=api.amps[type]||api.passive[type]||api.active[type]||api.activeSubs[type]||api.bookshelf[type]||api.floor[type]||api.headphones[type]||api.furniture[type]||api.adapters[type]||null;
                    const expectedElectrical=!!(api.amps[type]||api.passive[type]||api.active[type]||api.activeSubs[type]||api.bookshelf[type]||api.floor[type]||api.headphones[type]);
                    const dimensions={width:box.width,height:box.height};
                    const badDimensions=!Number.isFinite(box.width)||!Number.isFinite(box.height)||box.width<=0||box.height<=0;
                    const result={type,name,english,ports,malformed,missingPorts,outside,power,specs,electricalSpec:dev.electricalSpec,expectedElectrical,dimensions,badDimensions};
                    api.deleteDevice(dev,false);
                    return result;
                },type);
                await scanVisibleLanguage();
                if(result.error)throw new Error(result.error);
                assert(!result.badDimensions,`zero or invalid dimensions ${JSON.stringify(result.dimensions)}`);
                assert(!result.missingPorts,'audio equipment must expose at least one routable port');
                assert.equal(result.malformed.length,0,`invalid port contract ${JSON.stringify(result.malformed)}`);
                assert.equal(result.outside.length,0,`ports outside chassis ${JSON.stringify(result.outside)}`);
                if(result.power)assert.deepEqual(result.power,{before:true,off:false,on:true},'power button must switch off and on');
                if(result.expectedElectrical)assert(Object.keys(result.electricalSpec||{}).length>0,`missing electrical specification for ${type}`);
                for(const [key,value]of Object.entries(result.electricalSpec||{}))assert(Number.isFinite(value)&&value>0,`${type} has invalid ${key}`);
            }catch(error){await page.evaluate(type=>{const dev=__equipmentContract.devices[`contract-${type}`];if(dev)__equipmentContract.deleteDevice(dev,false);},type).catch(()=>{});contractFailures.push(`${type}: ${error.message}`);}
        }

        // Verify the compatibility engine responds with a stable contract for every
        // connection direction/format pair present in the catalog.
        const compatibility=await page.evaluate(()=>{
            const results=[];
            const a=document.createElement('div'),b=document.createElement('div');a.className=b.className='device-node';a.id='contract-a';b.id='contract-b';
            const api=__equipmentContract,previousGuidance=api.appState.preferences.connectionGuidanceEnabled;
            api.appState.preferences.connectionGuidanceEnabled=true;
            api.devices[a.id]={id:a.id,type:'contract',state:{},nodes:{},el:a};api.devices[b.id]={id:b.id,type:'contract',state:{},nodes:{},el:b};
            for(const ioA of ['in','out'])for(const ioB of ['in','out'])for(const typeA of ['rca','rca-r','rca-l','p2','p10','wire'])for(const typeB of ['rca','rca-r','rca-l','p2','p10','wire']){
                const left=document.createElement('div'),right=document.createElement('div');left.className=right.className='port';left.dataset.io=ioA;right.dataset.io=ioB;left.dataset.type=typeA;right.dataset.type=typeB;a.append(left);b.append(right);
                const value=api.compatibility(left,right,false),fits=typeA===typeB||(typeA==='rca'&&typeB.startsWith('rca'))||(typeB==='rca'&&typeA.startsWith('rca'))||(typeA.startsWith('rca')&&typeB.startsWith('rca'));
                const expected=fits&&ioA!==ioB;
                results.push(value&&value.compatible===expected&&typeof value.reason==='string'&&value.reason.length>0);left.remove();right.remove();
            }
            delete api.devices[a.id];delete api.devices[b.id];api.appState.preferences.connectionGuidanceEnabled=previousGuidance;
            return results.length===144&&results.every(Boolean);
        });
        assert(compatibility,'port compatibility must return a reasoned result for all connector and direction combinations');
        assert.deepEqual(errors,[],'uncaught application errors');
        assert.deepEqual(contractFailures,[],contractFailures.join('\n'));
        assert.deepEqual([...untranslated],[],'visible Portuguese text/ARIA/title/options have no English translation: '+[...untranslated].join(' | '));
        console.log(`Equipment contracts passed for ${types.length} catalog types: dimensions, ports, ratings, power behavior, translations, and compatibility.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
