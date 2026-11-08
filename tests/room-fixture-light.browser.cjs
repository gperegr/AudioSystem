// Dock regression: keep the search inside the silhouette and paint the canvas behind its cutouts.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString().replace('    function positionedObjectLights(world){','    window.__roomLights=positionedSceneLights;\n    function positionedObjectLights(world){'),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__signal={appState,createDevice,deleteDevice,renderLight:()=>{Hardware.updateLightingDemo();Hardware.renderLightingDemo();},setCanvasTheme,setCanvasBackdrop,setCanvasTime,setOpeningView,view,applyView,getEffects:()=>({beams:roomMoteBeams,frame:roomMoteFrame,timer:roomMoteTimer})};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();


        await page.emulateMedia({reducedMotion:'reduce'});
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');__signal.setCanvasTime('night');__signal.setOpeningView();__signal.applyView();});
        const paint=()=>page.evaluate(()=>{
            __signal.renderLight();const c=document.querySelector('.room-fixture-light');
            const alpha=c.hidden?0:c.getContext('2d').getImageData(0,0,c.width,c.height).data.reduce((sum,v,i)=>sum+(i%4===3?v:0),0);
            return {hidden:c.hidden,alpha,width:c.width};
        });
        assert.equal((await paint()).hidden,true);
        for(const type of ['wallLampCage','wallLampDome','pendantLamp']){
            await page.evaluate(type=>{__signal.createDevice(type,4300,1600,'light');__signal.applyView();},type);
            await page.waitForTimeout(200);
            const lit=await paint();assert(!lit.hidden&&lit.alpha>0,type+' illuminates the background');assert(lit.width<=1400);
            await page.screenshot({path:'/tmp/room-fixture-'+type+'.png'});
            assert(await page.evaluate(()=>{const layer=document.querySelector('.room-fixture-light'),before=layer.toDataURL();const el=__signal.appState.project.devices.light.el;el.style.left=(el.offsetLeft+600)+'px';__signal.renderLight();return before!==layer.toDataURL();}),'moving the fixture moves the background illumination');
            await page.evaluate(()=>__signal.deleteDevice(__signal.appState.project.devices.light));
            assert.equal((await paint()).hidden,true,'removing the last fixture clears the illumination');
        }
        await page.evaluate(()=>{__signal.createDevice('wallLampCage',4300,1600,'light');__signal.setCanvasTheme('light');});
        assert.equal((await paint()).hidden,true,'solid themes do not receive room illumination');
        assert.deepEqual(errors,[]);console.log('Room fixtures illuminate scene backgrounds, clear on removal, respect themes and cap the rendering buffer.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
