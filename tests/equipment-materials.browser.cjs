// Artwork must not move controls, intercept pointers, or obscure cable guidance.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString(),index=source.lastIndexOf('        renderVisuals();');assert(index>0);
                body=source.slice(0,index)+'window.__materials={createDevice,deleteDevice,names:DEVICE_NAMES,devices:appState.project.devices};\n'+source.slice(index);
            }
            return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        const result=await page.evaluate(()=>{
            const api=__materials,sheets=[...document.styleSheets].filter(s=>/\/(tactile-finishes|depth)\.css/.test(s.href||''));
            if(sheets.length!==2)throw Error('Material and depth stylesheets must both load');
            const enableFinishes=value=>sheets.forEach(sheet=>sheet.disabled=!value);
            const moved=[],interactive=[],guidance=[],previewDifferences=[],missingScrewParts=[],screwOverlaps=[],constructionIssues=[];
            const frontSelector='.assembly-fastener,.classic-screw,.precision-screw,.tape-screw,.electrostatic-fastener,.phone-housing-screws>i,.glass-pre-end>i';
            const driverSelector='.driver-fastener,.tower-driver-screws>i';
            const cleanFronts=new Set(['receiver','integratedBlue','integratedSilver','integratedMinimal','preGlass','cdPlayer','streamer','audioInterface1','audioInterface4','headphoneAmp','headphoneAmpModern','powerBias','rcaSwitch']);
            const servicePanels=new Set(['preClassic','prePrecision','tapeDeck','eqStudio','mixer','powerDual','signalGenerator','spkElectrostatic']);
            const coveredDrivers=new Set(['floorCoax','floorDiamond','shelfCoax','shelfTop','spkActiveCompact','spkActiveRounded','spkPassiveCarbon','subwooferCube']);
            const serviceDrivers=new Set(['spkActiveBookshelf','spkPassiveGridOrange','shelfWood','subwooferPro']);
            const screwFinishes=new Set(),screwAngles=new Set();let screwCount=0;
            const bounds=el=>{
                const origin=el.getBoundingClientRect();
                return [el,...el.querySelectorAll('button,.port,input,small,svg')].map(node=>{
                    const r=node.getBoundingClientRect();return [r.x-origin.x,r.y-origin.y,r.width,r.height];
                });
            };
            const socketStyle=port=>{const s=getComputedStyle(port);return [s.backgroundColor,s.borderColor,s.boxShadow];};
            for(const type of Object.keys(api.names)){
                const id='material-test-'+type;api.createDevice(type,120,120,id);
                const dev=api.devices[id];if(!dev)throw new Error('Factory did not register '+type);
                const layers=[...dev.el.querySelectorAll('.equipment-material')];
                const frontCount=dev.el.querySelectorAll(frontSelector).length,driverCount=dev.el.querySelectorAll(driverSelector).length;
                if(cleanFronts.has(type)&&frontCount)constructionIssues.push(type+': front fixings should be concealed');
                if(servicePanels.has(type)&&!frontCount)constructionIssues.push(type+': removable panel lost its fasteners');
                if(coveredDrivers.has(type)&&driverCount)constructionIssues.push(type+': trim ring should hide basket fasteners');
                if(serviceDrivers.has(type)&&!driverCount)constructionIssues.push(type+': exposed basket lost its fasteners');
                const finished=bounds(dev.el);
                layers.forEach(layer=>{if(getComputedStyle(layer).pointerEvents!=='none'||layer.getAttribute('aria-hidden')!=='true')interactive.push(type);layer.style.display='none';});
                enableFinishes(false);
                const plain=bounds(dev.el);
                enableFinishes(true);layers.forEach(layer=>layer.style.removeProperty('display'));
                if(finished.some((r,i)=>r.some((v,j)=>Math.abs(v-plain[i][j])>.05)))moved.push(type);
                dev.el.querySelectorAll('.hw-screw-object').forEach(screw=>{
                    screwCount++;screwFinishes.add(screw.dataset.screwFinish);screwAngles.add(screw.dataset.screwRotation);
                    screw.querySelectorAll('use').forEach(part=>{if(!document.querySelector(part.getAttribute('href')))missingScrewParts.push(type);});
                });
                const textLabels=[...dev.el.querySelectorAll('span,b,strong,label')].filter(part=>!part.childElementCount&&part.textContent.trim()&&!part.closest('[aria-hidden="true"]'));
                const obstacles=[...dev.el.querySelectorAll('button:not(.speaker-grille),.port,input,.receiver-radio,.device-display,.integrated-gauge,.extra-vu,.bias-meter,.bench-lcd,.bench-screen,.signal-screen,.cd-lcd,.custom-pre-screen,.stream-screen,small,.classic-dial-label,.classic-preamp-heading'),...textLabels];
                dev.el.querySelectorAll('.hw-screw-mount').forEach(screw=>{
                    const r=screw.getBoundingClientRect();if(!r.width||!r.height)return;
                    obstacles.forEach(part=>{
                        if(part.contains(screw)||screw.contains(part))return;
                        const s=part.getBoundingClientRect(),style=getComputedStyle(part);if(!s.width||!s.height||style.visibility==='hidden'||style.display==='none')return;
                        const width=Math.min(r.right,s.right)-Math.max(r.left,s.left),height=Math.min(r.bottom,s.bottom)-Math.max(r.top,s.top);
                        if(width>.5&&height>.5)screwOverlaps.push({type,screw:screw.className,part:part.className||part.tagName});
                    });
                });
                const port=dev.el.querySelector('.port:not([data-type="wire"])');
                if(port)for(const state of ['port-compatible','port-source','port-incompatible']){
                    port.classList.add(state);const current=socketStyle(port);enableFinishes(false);const original=socketStyle(port);enableFinishes(true);port.classList.remove(state);
                    if(JSON.stringify(current)!==JSON.stringify(original))guidance.push(type+':'+state);
                }
                if(layers.length){
                    const preview=api.createDevice(type,0,0,null,true);
                    if(preview.el.querySelectorAll('.equipment-material').length!==layers.length)previewDifferences.push(type);
                    if(preview.el.querySelectorAll(frontSelector).length!==frontCount||preview.el.querySelectorAll(driverSelector).length!==driverCount)previewDifferences.push(type+': fastener construction');
                    preview.el.remove();
                }
                api.deleteDevice(dev,false);
            }
            return {count:Object.keys(api.names).length,moved,interactive,guidance,previewDifferences,missingScrewParts,screwOverlaps,constructionIssues,screwCount,screwFinishes:[...screwFinishes].sort(),screwAngles:screwAngles.size,screwDefinitions:document.querySelectorAll('#hw-screw-definitions').length};
        });
        assert.deepEqual(result.moved,[],'finishes preserve equipment and control geometry');
        assert.deepEqual(result.interactive,[],'texture layers are hidden from assistive technology and pointer input');
        assert.deepEqual(result.guidance,[],'cable guidance retains its original colors and halos');
        assert.deepEqual(result.previewDifferences,[],'placement previews receive the same finishes');
        assert.deepEqual(result.missingScrewParts,[],'mounted screws resolve their head and drive artwork');
        assert.deepEqual(result.screwFinishes,['gold','silver']);
        assert(result.screwCount>0&&result.screwAngles>4,'retained mechanical fixings use varied screw orientations');
        assert.equal(result.screwDefinitions,1,'equipment and previews share one SVG definition set');
        assert.deepEqual(result.screwOverlaps,[],'seated screws clear controls, displays, and labels');
        assert.deepEqual(result.constructionIssues,[],'front panels and driver trim respect their model construction');
        const textures=await page.evaluate(async()=>{
            const names=['machined-aluminium','powder-coat','walnut-veneer','woven-linen','cabinet-leather'];
            return Promise.all(names.map(async name=>{const image=new Image();image.src='/assets/textures/'+name+'.png';await image.decode();return image.naturalWidth>0;}));
        });
        assert(textures.every(Boolean),'all local texture files decode');
        assert.deepEqual(errors,[]);
        console.log(`Equipment materials: ${result.count} models retain geometry, cable guidance, accessible controls, and matching placement previews; all textures decode. ${result.screwCount} gold/silver screws resolve shared vector artwork with varied orientations.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
