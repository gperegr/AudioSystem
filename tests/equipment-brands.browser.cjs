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
                if(!badge||dev.el.querySelectorAll('[data-brand-badge]').length!==1){issues.push(type+': maker print');api.deleteDevice(dev,false);continue;}
                if(dev.el.dataset.manufacturer!==product.manufacturer.name||dev.el.dataset.model!==product.model)issues.push(type+': manufacturer/model');
                if(!dev.el.getAttribute('aria-label').includes(EquipmentBrands.name(type)))issues.push(type+': accessible identity');
                if(!document.getElementById('inspector-title').textContent.includes(EquipmentBrands.name(type)))issues.push(type+': properties identity');
                if(badge.dataset.placement==='unplaced')issues.push(type+': no safe print area');
                const box=badge.getBoundingClientRect(),outer=dev.el.getBoundingClientRect();
                if(box.left<outer.left-.5||box.top<outer.top-.5||box.right>outer.right+.5||box.bottom>outer.bottom+.5)issues.push(type+': print outside enclosure');
                const printedLabels=[...dev.el.querySelectorAll('span,small,strong,b,label,header')].filter(part=>!part.childElementCount&&part.textContent.trim());
                const obstacles=[...dev.el.querySelectorAll('button:not(.speaker-grille),input,select,output,.port,.hw-knob,.hw-screw-mount,.integrated-gauge,.extra-vu,.bias-meter,.receiver-radio,.device-display,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.cd-lcd,.stream-screen,[data-lighting-relief]'),...printedLabels];
                obstacles.forEach(part=>{
                    if(part.contains(badge)||badge.contains(part))return;
                    const r=part.getBoundingClientRect(),s=getComputedStyle(part);if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none')return;
                    const w=Math.min(box.right,r.right)-Math.max(box.left,r.left),h=Math.min(box.bottom,r.bottom)-Math.max(box.top,r.top);
                    if(w>.5&&h>.5)collisions.push({type,part:part.className||part.tagName,placement:badge.dataset.placement,mode:badge.dataset.mode});
                });
                placements[type]={mode:badge.dataset.mode,placement:badge.dataset.placement};
                const preview=api.createDevice(type,0,0,null,true);
                if(preview.el.dataset.manufacturer!==dev.el.dataset.manufacturer||preview.el.dataset.model!==dev.el.dataset.model||preview.el.querySelectorAll('[data-brand-badge]').length!==1)issues.push(type+': preview identity');
                preview.el.remove();api.deleteDevice(dev,false);
            }
            const items=[...document.querySelectorAll('.catalog-item[data-template]')].filter(item=>EquipmentBrands.get(item.dataset.template));
            for(const item of items)if(!item.querySelector('.catalog-product-identity')?.textContent.includes(EquipmentBrands.name(item.dataset.template)))issues.push(item.dataset.template+': catalog identity');
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
        const search=page.locator('#equipment-search');
        const lines=await page.evaluate(()=>Object.values(EquipmentBrands.brands).map(brand=>({name:brand.name,types:[...document.querySelectorAll('.catalog-item[data-template]')].filter(item=>EquipmentBrands.get(item.dataset.template)?.brand===brand.id).map(item=>item.dataset.template)})));
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
        console.log(`Equipment brands: ${result.count} products, ${result.catalogCount} catalog cards, identities, printing clearance, previews, model search, short dock and live translations passed.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
