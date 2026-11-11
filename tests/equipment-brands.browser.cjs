// Full identity coverage, collision-free maker printing, translations and previews.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));await page.emulateMedia({reducedMotion:'reduce'});
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString(),index=source.lastIndexOf('        renderVisuals();');assert(index>0);
                body=source.slice(0,index)+'window.__brands={createDevice,deleteDevice,selectDevice,names:DEVICE_NAMES,devices:appState.project.devices};\n'+source.slice(index);
            }
            return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(()=>Promise.all([document.fonts.ready,document.fonts.load('600 12px "Equipment Vintage"'),document.fonts.load('500 12px "Equipment Digital"')]));
        const result=await page.evaluate(()=>{
            const issues=[],collisions=[],placements={},api=__brands;
            for(const type of Object.keys(EquipmentBrands.products)){
                const product=EquipmentBrands.get(type),id='identity-'+type;api.createDevice(type,120,120,id);const dev=api.devices[id];
                if(!dev){issues.push(type+': factory');continue;}
                const badge=dev.el.querySelector('[data-brand-badge]');
                if(EquipmentBrands.unprinted(type)){
                    if(badge||dev.el.dataset.brand||dev.el.querySelector('.device-header')?.textContent.includes(product.manufacturer.name)||document.getElementById('inspector-title').textContent.includes(product.manufacturer.name))issues.push(type+': visible manufacturer must be suppressed');
                    const preview=api.createDevice(type,0,0,null,true);if(preview.el.querySelector('[data-brand-badge]'))issues.push(type+': branded preview');
                    preview.el.remove();api.deleteDevice(dev,false);continue;
                }
                if(!badge||dev.el.querySelectorAll('[data-brand-badge]').length!==1){issues.push(type+': maker print');api.deleteDevice(dev,false);continue;}
                if(dev.el.dataset.manufacturer!==product.manufacturer.name||dev.el.dataset.model!==product.model)issues.push(type+': manufacturer/model');
                if(!dev.el.getAttribute('aria-label').includes(EquipmentBrands.name(type)))issues.push(type+': accessible identity');
                if(!document.getElementById('inspector-title').textContent.includes(EquipmentBrands.name(type)))issues.push(type+': properties identity');
                if(badge.dataset.placement==='unplaced')issues.push(type+': no safe print area');
                const box=badge.getBoundingClientRect(),outer=dev.el.getBoundingClientRect();
                if(box.left<outer.left-.5||box.top<outer.top-.5||box.right>outer.right+.5||box.bottom>outer.bottom+.5)issues.push(type+': print outside enclosure');
                const printedLabels=[...dev.el.querySelectorAll('span,small,strong,b,label,header,text')].filter(part=>!part.childElementCount&&part.textContent.trim());
                const obstacles=[...dev.el.querySelectorAll('.mixer-rack-handle,.speaker-basic-tweeter,.speaker-basic-woofer,.speaker-basic-terminal,.precision-meter,.ai-output-pair,.linear-io,.sub-oblong-duct,.sub-air-ducts>i,.tower-front-vent,.sp-panel,.sp-terminal,.classic-box-connection,.tower-terminal,.sp-woofer,.sp-tweeter,.tower-driver,.classic-box-driver,.tower-top-tweeter,.shelf-top-tweeter,.tape-reel,.tape-head-cover,.at-platter,.at-record,.tt-platter,.tt-record,[role=slider],.poweramp-screen,.poweramp-meter,.linear-readout,.bias-heatsink,.bias-vent,.stereo-power-vent,.dual-top-vents,.at-pitch,.tt-pitch,button:not(.speaker-grille),input,select,output,.port,.hw-knob,.hw-screw-mount,.integrated-gauge,.extra-vu,.bias-meter,.receiver-radio,.device-display,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.cd-lcd,.stream-screen,[data-lighting-relief]'),...printedLabels];
                obstacles.forEach(part=>{
                    if(part.contains(badge)||badge.contains(part))return;
                    // Opaque removable grilles conceal both cones and their
                    // basket fasteners. Only visible front parts can collide.
                    if(badge.closest('.speaker-grille')&&part.closest('.sp-woofer,.sp-tweeter,.tower-driver,.classic-box-driver'))return;
                    const r=part.getBoundingClientRect(),s=getComputedStyle(part);if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none')return;
                    const w=Math.min(box.right,r.right)-Math.max(box.left,r.left),h=Math.min(box.bottom,r.bottom)-Math.max(box.top,r.top);
                    if(w>.5&&h>.5)collisions.push({type,part:part.className||part.tagName,placement:badge.dataset.placement,mode:badge.dataset.mode});
                });
                if(dev.el.dataset.productFamily!==product.brand||!badge.dataset.zone)issues.push(type+': missing product family / print rail');
                const cap=dev.el.querySelector('.hw-mechanical-key-face');
                if(cap&&parseFloat(getComputedStyle(cap).borderTopLeftRadius)!==EquipmentBrands.families[product.brand].keyRadius)issues.push(type+': inconsistent shared key profile');
                placements[type]={mode:badge.dataset.mode,placement:badge.dataset.placement,zone:badge.dataset.zone,left:badge.style.left,top:badge.style.top,width:badge.style.width,height:badge.style.height};
                const preview=api.createDevice(type,0,0,null,true);
                if(preview.el.dataset.manufacturer!==dev.el.dataset.manufacturer||preview.el.dataset.model!==dev.el.dataset.model||preview.el.querySelectorAll('[data-brand-badge]').length!==1)issues.push(type+': preview identity');
                preview.el.remove();api.deleteDevice(dev,false);
            }
            const items=[...document.querySelectorAll('.catalog-item[data-template]')].filter(item=>EquipmentBrands.get(item.dataset.template)&&!EquipmentBrands.unprinted(item.dataset.template));
            for(const item of items)if(!item.querySelector('.catalog-product-identity')?.textContent.includes(EquipmentBrands.name(item.dataset.template)))issues.push(item.dataset.template+': catalog identity');
            for(const item of document.querySelectorAll('.catalog-item[data-template]'))if(EquipmentBrands.unprinted(item.dataset.template)&&item.querySelector('.catalog-product-identity'))issues.push(item.dataset.template+': catalog brand must be suppressed');
            AudioSystemLanguage.set('en');
            for(const type of ['receiver','preClassic','hpKubaDisco2','spkActiveCompact']){
                const role=api.names[type],full=EquipmentBrands.name(type,role),translated=AudioSystemLanguage.translate(full);
                if(translated!==EquipmentBrands.name(type,AudioSystemLanguage.translate(role)))issues.push(type+': translated function changed model');
            }
            return {count:Object.keys(EquipmentBrands.products).length,issues,collisions,placements,catalogCount:items.length};
        });
        fs.writeFileSync(process.env.BRAND_REPORT||'/tmp/audio-brand-validation.json',JSON.stringify(result,null,2));
        assert.deepEqual(result.issues,[],'complete manufacturer/model identity');
        assert.deepEqual(result.collisions,[],'maker printing must clear controls, sockets and meters');
        // Exercise actual pointer hit areas on the layouts with reserved print
        // regions and moved USB outputs, at full display size.
        const targets=await page.evaluate(()=>{
            const issues=[];let count=0;
            for(const type of ['audioInterface1','audioInterface2','audioInterface3','audioInterface4','powerAmp','mixer','speaker','spkActiveRounded']){
                const id='family-target-'+type;__brands.createDevice(type,120,120,id);const dev=__brands.devices[id];
                const host=document.createElement('div');host.className='equipment-preview-world';host.style.cssText='position:fixed;left:310px;top:150px;width:800px;height:650px;z-index:100000;pointer-events:auto';document.body.appendChild(host);
                host.appendChild(dev.el);Object.assign(dev.el.style,{left:'20px',top:'20px',transform:'none'});
                const face=dev.el.getBoundingClientRect();
                dev.el.querySelectorAll('.port,button,input,[role=slider]').forEach(control=>{
                    const r=control.getBoundingClientRect(),s=getComputedStyle(control);if(!r.width||!r.height||s.display==='none'||s.visibility==='hidden')return;
                    count++;const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
                    if(!hit||!control.contains(hit))issues.push(type+': covered target '+control.className);
                    if(r.left<face.left-.5||r.top<face.top-.5||r.right>face.right+.5||r.bottom>face.bottom+.5)issues.push(type+': target outside face');
                    if(control.matches('.port')&&!Object.hasOwn(dev.nodes,control.dataset.node))issues.push(type+': unroutable socket');
                });
                __brands.deleteDevice(dev,false);host.remove();
            }
            return {issues,count};
        });
        assert.deepEqual(targets.issues,[],'family printing preserves usable controls and routable sockets');
        const search=page.locator('#equipment-search');
        const lines=await page.evaluate(()=>Object.values(EquipmentBrands.brands).map(brand=>({name:brand.name,types:[...document.querySelectorAll('.catalog-item[data-template]')].filter(item=>EquipmentBrands.get(item.dataset.template)?.brand===brand.id&&!EquipmentBrands.unprinted(item.dataset.template)).map(item=>item.dataset.template)})));
        for(const brand of lines){
            await search.fill(brand.name);
            assert.deepEqual((await page.locator('.catalog-item:visible').evaluateAll(items=>items.map(item=>item.dataset.template))).sort(),brand.types.sort(),'search by '+brand.name);
            const type=brand.types[0],model=await page.evaluate(type=>EquipmentBrands.name(type),type);await search.fill(model);
            assert.deepEqual(await page.locator('.catalog-item:visible').evaluateAll(items=>items.map(item=>item.dataset.template)),[type],'search by '+model);
        }
        await page.evaluate(()=>__brands.createDevice('receiver',120,120,'identity-live'));
        await page.waitForFunction(()=>__brands.devices['identity-live'].el.getAttribute('aria-label')==='Aurenne R-780 · Vintage receiver, On, disconnected, No signal');
        await page.evaluate(()=>__brands.deleteDevice(__brands.devices['identity-live'],false));
        await search.fill('');await page.setViewportSize({width:1600,height:450});
        const overflow=await page.locator('.catalog-item:visible>.catalog-product-identity').evaluateAll(labels=>labels.filter(label=>{const a=label.getBoundingClientRect(),b=label.parentElement.getBoundingClientRect();return a.top<b.top||a.bottom>b.bottom+.5;}).map(label=>label.textContent));
        assert.deepEqual(overflow,[],'brand and model fit the short catalog dock');
        assert.deepEqual(errors,[],'no application errors');
        console.log(`Equipment brands: ${result.count} products, ${result.catalogCount} catalog cards, identities, printing clearance, previews, ${targets.count} pointer targets, model search, short dock and live translations passed.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
