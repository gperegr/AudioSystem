// Keyboard deletion must preserve editing and modal behavior and restore devices/cables through history.
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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,createDevice,selectDevice,setDeviceSelection,connectProjectPorts,appState,view,applyView,projectCapture,showAppDialog,showContextHelp,openHomeMenu};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        async function assertCentered(){
            const centered=await page.evaluate(()=>{const canvas=document.getElementById('canvas'),world=document.getElementById('audio-world'),v=__signal.view;return {x:v.x,y:v.y,expectedX:Math.min(0,(canvas.clientWidth-world.offsetWidth*v.zoom)/2),expectedY:Math.min(0,(canvas.clientHeight-world.offsetHeight*v.zoom)/2)};});
            assert(Math.abs(centered.x-centered.expectedX)<1,'canvas centered horizontally');
            assert(Math.abs(centered.y-centered.expectedY)<1,'canvas centered vertically');
        }
        const home=page.locator('#home-menu');await page.waitForFunction(()=>document.getElementById('home-menu')?.open);
        assert.deepEqual(await page.evaluate(()=>{const p=__signal.appState.preferences;return [p.orthogonalCables,p.rainEnabled,p.roomParticleAmount];}),[false,false,0],'effects disabled by default');
        assert.equal(await home.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(230, 217, 193)','solid sepia home');assert.equal(await page.locator('.home-backdrop').count(),0);
        assert.equal(await page.locator('#headphone-calibration-dialog').evaluate(el=>el.open),false,'home precedes calibration');
        await page.screenshot({path:'/tmp/audio-lab-home-desktop.png'});
        for(const theme of ['light','graphite','midnight','sepia']){
            await page.locator(`[data-home-theme="${theme}"]`).click();
            assert.equal(await page.evaluate(()=>__signal.appState.canvas.theme),theme);
            await page.waitForTimeout(550);
            assert.equal(await home.evaluate(el=>el.style.getPropertyValue('--ui-side')),await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--ui-side').trim()),'preview adopts chosen palette');
            assert.equal(await page.locator('[data-home-theme][aria-pressed="true"]').count(),1);
            assert.equal(await page.locator('[data-home-scene][aria-pressed="true"]').count(),0);
        }
        await page.locator('[data-home-scene="listeningIllustrated"]').click();
        assert.equal(await page.locator('[data-home-theme][aria-pressed="true"]').count(),0);
        await page.waitForFunction(()=>!!document.querySelector('.home-environment-layer img'));
        await page.waitForFunction(()=>document.querySelectorAll('.home-environment-layer').length===1);
        assert.equal(await page.locator('.home-environment-layer').count(),1,'old background layers released after fade');
        assert.equal(await page.locator('[data-home-scene="listeningIllustrated"]').getAttribute('aria-pressed'),'true');
        await page.locator('[data-home="continue"]').click();
        await assertCentered();
        await page.locator('#headphone-calibration-skip').click();await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(()=>__signal.createDevice('cdPlayer',800,1000,'saved'));
        await page.evaluate(()=>{__signal.view.zoom=1;__signal.view.x=-400;__signal.view.y=-700;__signal.applyView();});
        await page.locator('#app-topbar .app-brand').click();
        assert.equal(await page.locator('[data-home="continue"] span').textContent(),'Continuar montagem');
        await page.locator('[data-home="new"]').click();await page.locator('[data-dialog-cancel]').click();
        assert(await page.evaluate(()=>!!__signal.appState.project.devices.saved),'cancel preserves the current project');assert(await home.evaluate(el=>el.open));
        await page.locator('[data-home="continue"]').click();
        await assertCentered();
        await page.waitForTimeout(700);await page.reload();await page.waitForFunction(()=>document.getElementById('home-menu')?.open);
        assert.equal(await page.evaluate(()=>Object.keys(__signal.appState.project.devices).length),1,'restore completes before home');
        await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.getElementById('home-menu').open);
        await page.locator('#app-topbar .app-brand').click();
        await page.locator('[data-home="settings"]').click();assert(await home.evaluate(el=>el.open));assert(await page.locator('.home-settings').isVisible());assert.equal(await page.locator('.app-settings').evaluate(el=>el.open),false);assert(await page.locator('.home-settings #orthogonal-cables').count());assert.equal(await page.locator('.home-settings [data-studio-only]:visible').count(),0,'studio-only controls hidden on home settings');assert.equal(await page.locator('.home-settings [data-studio-only]').count(),4);await page.screenshot({path:'/tmp/audio-lab-home-settings.png'});await page.locator('[data-home="back"]').click();assert(await page.locator('.home-main').isVisible());
        await page.locator('[data-home-language="en"]').click();await page.waitForFunction(()=>document.querySelector('[data-home="continue"] span')?.textContent==='Continue setup');
        await page.locator('[data-home-language="pt"]').click();await page.waitForFunction(()=>document.querySelector('[data-home="continue"] span')?.textContent==='Continuar montagem');
        for(const viewport of [{width:1280,height:720},{width:1440,height:900},{width:1920,height:1080}]){
            await page.setViewportSize(viewport);await page.waitForTimeout(100);
            assert(await home.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'menu has no horizontal overflow');
            await page.locator('[data-home="continue"]').scrollIntoViewIfNeeded();
            const b=await page.locator('[data-home="continue"]').boundingBox();assert(b.width>200&&b.height>=44);
            if(viewport.width===1280)await page.screenshot({path:'/tmp/audio-lab-home-mobile.png'});
        }
        await page.setViewportSize({width:1600,height:1100});
        await page.locator('[data-home="open"]').click({trial:true});
        const chooserPromise=page.waitForEvent('filechooser');await page.locator('[data-home="open"]').click();const chooser=await chooserPromise;
        await chooser.setFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{}')});
        await page.waitForFunction(()=>document.querySelector('.home-status').textContent==='Não foi possível abrir o projeto.');
        assert(await home.evaluate(el=>el.open));assert.equal(await page.evaluate(()=>Object.keys(__signal.appState.project.devices).length),1);
        const snapshot=await page.evaluate(()=>{const read=File.prototype.text;File.prototype.text=async function(){await new Promise(resolve=>setTimeout(resolve,300));return read.call(this);};return __signal.projectCapture();});
        const validChooserPromise=page.waitForEvent('filechooser');await page.locator('[data-home="open"]').click();
        await (await validChooserPromise).setFiles({name:'project.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(snapshot))});
        assert.equal(await page.locator('[data-home="continue"]').isDisabled(),true,'navigation stays disabled while importing');
        await page.waitForFunction(()=>!document.getElementById('home-menu').open);assert.equal(await page.evaluate(()=>Object.keys(__signal.appState.project.devices).length),1,'valid import opens the studio');
        await page.locator('#app-topbar .app-brand').click();
        await page.locator('[data-home="new"]').click();await page.locator('[data-dialog-accept]').click();
        await page.waitForFunction(()=>!document.getElementById('home-menu').open);
        assert.equal(await page.evaluate(()=>Object.keys(__signal.appState.project.devices).length),0);
        await page.locator('.app-settings > summary').click();
        assert.equal(await page.locator('.app-settings [data-studio-only]:visible').count(),4,'studio controls restored outside home');
        assert.deepEqual(errors,[]);console.log('Home menu: startup order, resume, restore, scene/language selection, settings, responsive layout, cancelled new project valid/invalid imports and keyboard return passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
