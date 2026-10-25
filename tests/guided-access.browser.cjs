// Optional integration suite: start python -m http.server 8000 and run this file
// with Playwright and Chromium installed. Instrumentation is injected only in tests.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
function wav(){const b=Buffer.alloc(44+16000);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(8000,24);b.writeUInt32LE(16000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(16000,40);return b;}
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.route('**/guided-access.js?*',route=>{const body=fs.readFileSync(path.join(root,'guided-access.js'),'utf8')+'\nconst originalMount=GuidedAccess.mount;GuidedAccess.mount=a=>{window.__adapter=a;return originalMount(a)};';return route.fulfill({contentType:'application/javascript',body});});
        await page.route('**/script.js?*',route=>{let body=fs.readFileSync(path.join(root,'script.js'),'utf8');const i=body.lastIndexOf('        renderVisuals();');body=body.slice(0,i)+'window.__test={state,world,createDevice,deleteDevice,selectDevice,updateCableFlows,guidedAccess,maxEquipmentBottom,tutorialInspect,projectCapture,saveLocalProject};\n'+body.slice(i);return route.fulfill({contentType:'application/javascript',body});});
        const url=process.env.TEST_BASE_URL||'http://127.0.0.1:8000/';await page.goto(url);
        await page.locator('#headphone-calibration-skip').click();await page.getByRole('button',{name:'Começar tutorial',exact:true}).click();
        await page.waitForTimeout(150);assert(await page.locator('[data-tutorial-next]').isDisabled());
        await page.evaluate(()=>__test.createDevice('cdPlayer',500,200));await page.waitForTimeout(150);assert(await page.locator('[data-tutorial-next]').isEnabled());
        await page.locator('[data-tutorial-next]').click();
        await page.evaluate(()=>{Object.values(__test.state.devices).forEach(__test.deleteDevice);});await page.waitForTimeout(150);assert(await page.locator('[data-tutorial-next]').isDisabled());
        await page.getByRole('button',{name:'Sair do tutorial'}).click();
        // Every example is built by the production adapter, with real dimensions and ports.
        for(let index=0;index<5;index++){
            await page.evaluate(async index=>{await GuidedAccess.replaceExample(__adapter.examples,GuidedAccess.examples[index]);},index);
            await page.waitForTimeout(160);
            const result=await page.evaluate(()=>({floor:__test.maxEquipmentBottom(),links:__test.state.connections.length,items:Object.values(__test.state.devices).map(d=>({type:d.type,x:d.el.offsetLeft,y:d.el.offsetTop,w:d.el.offsetWidth,h:d.el.offsetHeight,z:Number(getComputedStyle(d.el).zIndex),playing:!!d.state.playing,capture:!!d.micStream}))}));
            const spec=require('../guided-access.js').examples[index];assert.equal(result.links,spec.links.length);
            for(const d of result.items){assert(!d.playing&&!d.capture);assert(d.y>=0&&d.y+d.h<=result.floor+1);if(d.type.startsWith('furniture')){assert.equal(d.y+d.h,result.floor);assert.equal(d.z,2);}}
            if(index===1)for(const d of result.items.filter(d=>d.type==='spkPassiveWood'))assert.equal(d.y+d.h,result.floor);
        }
        const typesBefore=await page.evaluate(()=>Object.values(__test.state.devices).map(d=>d.type));await page.reload();await page.waitForFunction(()=>window.__test&&document.querySelector('.project-restore-shield')===null);
        assert.deepEqual(await page.evaluate(()=>Object.values(__test.state.devices).map(d=>d.type)),typesBefore);
        // Cancel must not alter the scene.
        await page.evaluate(()=>__test.guidedAccess.openExamples());await page.getByRole('button',{name:'Carregar MP3 / CD · caixas ativas'}).click();await page.getByRole('button',{name:'Cancelar substituição'}).click();assert.deepEqual(await page.evaluate(()=>Object.values(__test.state.devices).map(d=>d.type)),typesBefore);await page.getByRole('button',{name:'Fechar exemplos'}).click();
        // Preserve a real decoded local WAV and its Blob through a failed replacement.
        await page.evaluate(async()=>GuidedAccess.replaceExample(__adapter.examples,GuidedAccess.examples[0]));
        await page.locator('#source-audio-file').setInputFiles({name:'guide-test.wav',mimeType:'audio/wav',buffer:wav()});
        await page.waitForFunction(()=>Object.values(__test.state.devices).some(d=>d.audioBuffer));
        await page.evaluate(async()=>{const adapter={...__adapter.examples,validate(){throw Error('forced validation failure');}};try{await GuidedAccess.replaceExample(adapter,GuidedAccess.examples[2]);throw Error('expected failure');}catch(e){if(!e.message.includes('forced validation failure'))throw e;}});
        const restored=await page.evaluate(()=>Object.values(__test.state.devices).find(d=>d.audioBuffer)?.mediaBlob?.size);assert.equal(restored,wav().length);
        // Completion is based on live state, not a remembered click.
        const checks=await page.evaluate(()=>{const obs={},ctx={};const source=Object.values(__test.state.devices).find(d=>d.type==='cdPlayer');__test.selectDevice(source.id,true);const before=__test.tutorialInspect('mp3','pause',ctx,obs).done;source.state.playing=true;const playing=__test.tutorialInspect('mp3','play',ctx,obs).done;source.state.playing=false;const paused=__test.tutorialInspect('mp3','pause',ctx,obs).done;source.powered=false;const disconnected=__test.tutorialInspect('mp3','ready',ctx,obs).done;return {before,playing,paused,disconnected};});assert.deepEqual(checks,{before:false,playing:true,paused:true,disconnected:false});
        const captureChecks=await page.evaluate(()=>{
            __test.createDevice('audioInterface4',2800,200);const d=Object.values(__test.state.devices).find(item=>item.type==='audioInterface4');__test.selectDevice(d.id,true);
            const before=__test.tutorialInspect('capture','capture',{},{}).done;
            d.micStream={getAudioTracks:()=>[{readyState:'live'}],getTracks:()=>[]};
            const silent=__test.tutorialInspect('capture','capture',{},{}).done;
            const outputs=!!d.nodes.outPhone1&&!!d.nodes.outPhone2;d.micStream=null;
            return {before,silent,outputs};
        });assert.deepEqual(captureChecks,{before:false,silent:true,outputs:true});
        // A continuation preserves position. The bar always reserves canvas space.
        await page.evaluate(()=>__test.guidedAccess.open());await page.getByRole('button',{name:'Continuar tutorial'}).click();
        for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
            await page.setViewportSize(viewport);await page.waitForTimeout(180);
            const rects=await page.evaluate(()=>({bar:document.querySelector('.tutorial-bar').getBoundingClientRect().toJSON(),canvas:document.querySelector('#canvas').getBoundingClientRect().toJSON(),footer:document.querySelector('.tutorial-bar footer').getBoundingClientRect().toJSON(),nav:document.querySelector('.mobile-panel-controls').getBoundingClientRect().toJSON()}));
            assert(rects.canvas.bottom<=rects.bar.top+1);assert(rects.footer.bottom<=rects.bar.bottom+1);assert(rects.bar.height<=240);
            if(viewport.width===390)await page.screenshot({path:'/tmp/tutorial-mobile-final.png',animations:'disabled'});
            if(viewport.width<=700){assert(rects.nav.top>=rects.bar.bottom-1);assert(rects.nav.bottom<=viewport.height+1);}
            const originalHeight=rects.bar.height;await page.getByRole('combobox',{name:'Tema do tutorial'}).click();await page.getByRole('option',{name:'Spotify'}).click();await page.waitForTimeout(80);assert.equal(await page.locator('.tutorial-bar').evaluate(n=>n.getBoundingClientRect().height),originalHeight);
        }
        const tabletContext=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,isMobile:true});
        const tablet=await tabletContext.newPage();tablet.on('pageerror',e=>errors.push(e.message));await tablet.goto(url);
        await tablet.locator('#headphone-calibration-skip').tap();await tablet.getByRole('button',{name:'Começar tutorial',exact:true}).tap();
        await tablet.getByRole('button',{name:'Localizar controle deste passo'}).tap();
        await tablet.locator('.catalog-item[data-template="cdPlayer"] span').last().tap();
        await tablet.waitForFunction(()=>document.querySelector('#audio-world>.device-type-cdPlayer'));
        assert(await tablet.locator('[data-tutorial-next]').isEnabled());await tabletContext.close();
        assert.deepEqual(errors,[]);console.log('Browser: five examples, persistence, cancellation, audio rollback, live guide checks, four viewports and tablet touch passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
