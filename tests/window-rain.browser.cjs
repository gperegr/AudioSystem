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
                assert(index>0);body=source.slice(0,index)+'window.__cables={createDevice,connectProjectPorts,updateCables,appState,view,applyView,getRainAudio:()=>roomRainAudio};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        const heading=page.locator('.atmosphere-heading');assert.equal(await heading.textContent(),'Atmosfera');
        await page.evaluate(()=>AudioSystemLanguage.set('en'));await page.waitForFunction(()=>document.querySelector('.atmosphere-heading')?.textContent==='Atmosphere');
        await page.evaluate(()=>AudioSystemLanguage.set('pt'));await page.waitForFunction(()=>document.querySelector('.atmosphere-heading')?.textContent==='Atmosfera');
        const particles=page.locator('#room-particle-enabled'),particleSlider=page.locator('#room-particle-amount');
        assert.equal(await particles.getAttribute('aria-pressed'),'true');assert.equal(await particleSlider.getAttribute('max'),'2');
        await particleSlider.evaluate(el=>{el.value=2;el.dispatchEvent(new Event('input',{bubbles:true}));});
        await particles.evaluate(el=>el.click());assert.equal(await particles.getAttribute('aria-pressed'),'false');
        await page.waitForTimeout(650);await page.reload();
        assert.equal(await particles.getAttribute('aria-pressed'),'false');assert.equal(await particleSlider.inputValue(),'2');
        await particles.evaluate(el=>el.click());assert.equal(await particles.getAttribute('aria-pressed'),'true');
        const toggle=page.locator('#room-rain-enabled'),slider=page.locator('#room-rain-intensity');
        assert.equal(await toggle.getAttribute('aria-pressed'),'false');assert.equal(await toggle.getAttribute('title'),'Ativar chuva');
        assert.notEqual(await toggle.evaluate(el=>getComputedStyle(el,'::after').display),'none','off icon shows slash');
        await toggle.evaluate(el=>el.click());
        assert.equal(await toggle.evaluate(el=>getComputedStyle(el,'::after').display),'none','on icon hides slash');
        await page.waitForTimeout(200);assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'loft');assert.equal(await page.locator('.room-rain-pane').count(),3);
        await slider.evaluate(el=>{el.value=0;el.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal(await page.locator('.room-rain-drop').count(),54);
        assert.equal(await page.locator('.room-rain-glass').count(),45,'loft rain must be clipped to individual glass lights');
        const variation=await page.locator('.room-rain-drop').evaluateAll(els=>new Set(els.map(el=>el.style.getPropertyValue('--rain-duration'))).size);
        assert(variation>30,'drops should have independently varied speeds');
        const changing=page.locator('.room-rain-drop').first();const before=await changing.getAttribute('style');
        await changing.evaluate(el=>el.dispatchEvent(new AnimationEvent('animationiteration',{bubbles:true,animationName:'room-rain-slide'})));
        assert.notEqual(await changing.getAttribute('style'),before,'each new cycle must vary drop placement and trajectory');

        for(const time of ['dawn','dusk','night']){
            await page.evaluate(time=>{const select=document.getElementById('canvas-time');select.value=time;select.dispatchEvent(new Event('change'));},time);
            assert.equal(await page.locator('.room-rain-glass').count(),45);
            const clips=await page.locator('.room-rain-glass').evaluateAll(els=>els.map(el=>({clip:getComputedStyle(el).clipPath,overflow:getComputedStyle(el).overflow})));
            assert(clips.every(p=>p.clip.startsWith('polygon(')&&p.overflow==='hidden'));
        }
        const slowRatio=await page.locator('.room-rain-drop').first().evaluate(el=>parseFloat(getComputedStyle(el).animationDuration)/parseFloat(el.style.getPropertyValue('--rain-duration')));
        await slider.evaluate(el=>{el.value=2;el.dispatchEvent(new Event('input',{bubbles:true}));});
        assert.equal(await page.locator('.room-rain-drop').count(),216,'maximum loft rain caps animated drops while retaining dense wet glass');
        assert.equal(await page.locator('.room-rain').getAttribute('data-soaked'),'true');
        assert.match(await page.locator('.room-rain-glass').first().evaluate(el=>getComputedStyle(el,'::after').backgroundImage),/data:image\/png/,'maximum rain adds the cached wet-glass texture');
        const fastRatio=await page.locator('.room-rain-drop').first().evaluate(el=>parseFloat(getComputedStyle(el).animationDuration)/parseFloat(el.style.getPropertyValue('--rain-duration')));
        assert(fastRatio<slowRatio*.6,'increasing intensity must accelerate the rain');
        await page.waitForTimeout(700);
        const focus=await page.evaluate(()=>({rain:getComputedStyle(document.querySelector('.room-rain')).filter,image:getComputedStyle(document.querySelector('.room-scene-image')).filter}));
        assert.match(focus.image,/blur\(/);assert.notEqual(focus.rain,focus.image,'maximum rain keeps adhered droplets sharper than the background');assert.match(focus.rain,/blur\(/);

        await page.evaluate(()=>{Object.assign(__cables.view,{x:0,y:0,zoom:.32});__cables.applyView();});
        await page.evaluate(()=>{const grid=document.getElementById('canvas-grid');grid.value='hidden';grid.dispatchEvent(new Event('change'));});
        await page.waitForTimeout(1200);
        assert(await page.locator('.room-rain-glass.rain-offscreen').count()>0,'offscreen glass is culled');
        assert.equal(await page.locator('.room-rain-glass.rain-offscreen .room-rain-drop').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
        await page.screenshot({path:'/tmp/window-rain-loft.png'});
        await slider.evaluate(el=>{el.value=0;el.dispatchEvent(new Event('input',{bubbles:true}));});

        await page.evaluate(()=>{const select=document.getElementById('canvas-backdrop');select.value='listeningIllustrated';select.dispatchEvent(new Event('change'));});
        assert.equal(await page.locator('.room-rain-pane').count(),2);assert.equal(await page.locator('.room-rain-glass').count(),4);assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'listening');
        await page.evaluate(()=>{const select=document.getElementById('canvas-backdrop');select.value='studioIllustrated';select.dispatchEvent(new Event('change'));});
        assert.equal(await page.locator('.room-rain').getAttribute('data-scene'),'studio');
        await page.waitForTimeout(900);await page.reload();await page.waitForFunction(()=>document.querySelector('#room-rain-enabled')?.getAttribute('aria-pressed')==='true');
        assert.equal(await slider.inputValue(),'0');
        assert.equal(await slider.getAttribute('step'),'1');assert.equal(await slider.getAttribute('max'),'2');
        await page.locator('#app-topbar').click({position:{x:8,y:8}});
        // Measure the actual noise output rather than only checking the slider.
        await page.evaluate(()=>{
            const audio=__cables.getRainAudio(),ctx=__cables.appState.audio.context;
            const analyser=ctx.createAnalyser();analyser.fftSize=2048;audio.gain.connect(analyser);window.__rainAnalyser=analyser;window.__rainSource=audio.source;
        });
        const rms=()=>page.evaluate(()=>{const data=new Float32Array(window.__rainAnalyser.fftSize);window.__rainAnalyser.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,x)=>sum+x*x,0)/data.length);});
        await page.waitForTimeout(800);const quiet=await rms();assert(quiet>0,'rain must produce audio');
        await slider.evaluate(el=>{el.value=2;el.dispatchEvent(new Event('input',{bubbles:true}));});await page.waitForTimeout(900);
        assert(await rms()>quiet*3,'noise level must follow intensity');
        assert(await page.evaluate(()=>__cables.getRainAudio().source===window.__rainSource),'intensity changes must reuse the source');
        await toggle.evaluate(el=>el.click());
        assert.equal(await page.locator('.room-rain').isVisible(),false);
        await page.waitForTimeout(850);assert.equal(await page.evaluate(()=>__cables.getRainAudio()),null,'disabled rain must release its audio nodes');

        assert.deepEqual(errors,[]);console.log('Window rain, intensity, scenes and persistence passed');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
