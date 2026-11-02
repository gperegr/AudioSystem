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
                assert(index>0);body=source.slice(0,index)+'window.__cables={createDevice,connectProjectPorts,updateCables,appState};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        const toggle=page.locator('#room-rain-enabled'),slider=page.locator('#room-rain-intensity');
        assert.equal(await toggle.isChecked(),false);
        await toggle.evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
        await page.waitForTimeout(200);assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'loft');assert.equal(await page.locator('.room-rain-pane').count(),3);
        await slider.evaluate(el=>{el.value=20;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('.room-rain-drop').count(),54);
        await page.evaluate(()=>{const select=document.getElementById('canvas-backdrop');select.value='listeningIllustrated';select.dispatchEvent(new Event('change'));});
        assert.equal(await page.locator('.room-rain-pane').count(),1);assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'listening');
        await page.evaluate(()=>{const select=document.getElementById('canvas-backdrop');select.value='studioIllustrated';select.dispatchEvent(new Event('change'));});
        assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'studio');
        await page.waitForTimeout(900);await page.reload();await page.waitForFunction(()=>document.querySelector('#room-rain-enabled')?.checked);
        assert.equal(await slider.inputValue(),'20');assert.deepEqual(errors,[]);console.log('Window rain, intensity, scenes and persistence passed');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
