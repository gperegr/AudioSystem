// Exercises the real audio graph and UI; all app assets are served by Playwright routing.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100},hasTouch:true}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__signal={findTargetPortNear,createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        const result=await page.evaluate(()=>{
            const before=Object.keys(__signal.appState.project.devices).length;
            const preview=__signal.createDevice('preClassic',0,0,null,true);preview.el.hidden=false;
            const size=[preview.el.offsetWidth,preview.el.offsetHeight],noRegistration=Object.keys(__signal.appState.project.devices).length===before;
            preview.el.remove();
            const failures=[];for(const type of Object.keys(__signal.names)){try{const candidate=__signal.createDevice(type,0,0,null,true);candidate.el.hidden=false;if(!candidate.el.offsetWidth||!candidate.el.offsetHeight)failures.push(type+': empty');candidate.el.remove();}catch(error){failures.push(type+': '+error.message);}}
            return {size,noRegistration,failures};
        });
        assert.deepEqual(result.failures,[]);assert.deepEqual(result.size,[760,240]);assert(result.noRegistration,'preview must not add a device');
        const favorite=page.locator('.catalog-item[data-template="preClassic"] .catalog-favorite');
        await favorite.click();assert.equal(await favorite.getAttribute('aria-pressed'),'true');
        assert.equal(await page.locator('.catalog-quick-access .catalog-item[data-template="preClassic"]').count(),1);
        const card=page.locator('.catalog-item[data-template="preClassic"]').filter({has:page.locator('.catalog-favorite')});
        await card.scrollIntoViewIfNeeded();const a=await card.boundingBox(),canvas=await page.locator('#canvas').boundingBox();
        await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(canvas.x+canvas.width/2,canvas.y+canvas.height/2,{steps:5});
        assert.equal(await page.locator('.catalog-placement-preview').count(),1);await page.mouse.up();
        assert.equal(await page.locator('.catalog-placement-preview').count(),0);assert.equal(await page.locator('.catalog-quick-access .catalog-item[data-template="preClassic"]').count(),1);
        await page.reload();await page.waitForSelector('.catalog-quick-access .catalog-item[data-template="preClassic"]');
        assert.equal(await page.locator('.catalog-item[data-template="preClassic"] .catalog-favorite').getAttribute('aria-pressed'),'true');
        await page.locator('.catalog-item[data-template="preClassic"] .catalog-favorite').click();
        assert.equal(await page.locator('.catalog-quick-access .catalog-item[data-template="preClassic"]').count(),0);
        await page.setViewportSize({width:390,height:844});await page.locator('[data-mobile-panel=catalog]').click();
        const mobileCard=page.locator('.catalog-item[data-template="preClassic"]').filter({has:page.locator('.catalog-favorite')});await mobileCard.scrollIntoViewIfNeeded();
        await mobileCard.locator('span').last().tap();assert.equal(await page.locator('.catalog-preview-actions').count(),1);assert.equal(await page.locator('.catalog-placement-preview').count(),1);
        await page.locator('[data-preview-cancel]').click();assert.equal(await page.locator('.catalog-placement-preview').count(),0);
        await page.locator('[data-mobile-panel=catalog]').click();await mobileCard.scrollIntoViewIfNeeded();await mobileCard.locator('span').last().tap();await page.locator('[data-preview-confirm]').click();assert.equal(await page.locator('.catalog-preview-actions').count(),0);
        await page.setViewportSize({width:1600,height:1100});
        assert.equal(await page.locator('#frame-selection').count(),0);assert.equal(await page.locator('#fit-canvas').count(),1);
        assert.equal(await page.locator('#equipment-sound-volume').count(),1);
        assert.deepEqual(errors,[]);console.log('Quality of life: true-sized preview without device creation, persisted favorites, frame button and separate sound control passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
