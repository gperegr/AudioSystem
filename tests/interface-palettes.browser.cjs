// Exercises the real audio graph and UI; all app assets are served by Playwright routing.
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
                const source=body.toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,setCanvasTime,setCanvasBackdrop,createDevice,selectDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(()=>{__signal.createDevice('spkElectrostatic',200,200,'palette-speaker');__signal.createDevice('benchMeter',500,200,'palette-meter');__signal.selectDevice('palette-speaker');});
        const samples=[];
        for(const theme of ['light','sepia','graphite','midnight','scene']){
            const scenes=theme==='scene'?['studioIllustrated','listeningIllustrated','loftIllustrated']:['studioIllustrated'];
            const times=theme==='scene'?['dawn','dusk','night']:['dusk'];
            for(const scene of scenes)for(const time of times){
                await page.evaluate(({theme,scene,time})=>{__signal.setCanvasTheme(theme);__signal.setCanvasBackdrop(scene);__signal.setCanvasTime(time);},{theme,scene,time});
                await page.mouse.move(1570,1060);await page.waitForTimeout(500);
                const sample=await page.evaluate(()=>{
                    const rgb=s=>s.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number),lum=c=>{const values=rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*values[0]+.7152*values[1]+.0722*values[2];};
                    const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
                    const calc=(a,b=a)=>contrast(getComputedStyle(document.querySelector(a)).color,getComputedStyle(document.querySelector(b)).backgroundColor);
                    const button=document.querySelector('#inspector-content .tt-insp-btn');
                    return {key:document.documentElement.dataset.uiPalette,side:getComputedStyle(document.querySelector('#inspector')).backgroundColor,top:calc('#app-topbar'),card:calc('.catalog-item>span','.catalog-item'),body:calc('#inspector-content','#inspector'),section:calc('.sonic-signature-panel h3','.sonic-signature-panel'),band:calc('.sonic-band-name','.sonic-band'),bandState:calc('.sonic-band-state','.sonic-band'),button:calc('#inspector-content .tt-insp-btn'),buttonColors:[getComputedStyle(button).color,getComputedStyle(button).backgroundColor],settings:calc('.app-settings>summary'),device:getComputedStyle(document.querySelector('#palette-speaker .electrostatic-frame')).backgroundImage};
                });
                for(const key of ['top','card','body','section','band','bandState','button','settings'])assert(sample[key]>=4.5,`${sample.key}: ${key} contrast ${sample[key]} (${sample.buttonColors})`);
                await page.evaluate(()=>{
                    document.querySelector('.app-settings').open=true;
                    document.querySelectorAll('.app-settings-content .settings-group').forEach(group=>group.open=true);
                });
                await page.waitForTimeout(500);
                const controls=await page.evaluate(()=>{
                    const color=el=>getComputedStyle(el);
                    const visible=el=>!!el.getClientRects().length;
                    const buttons=[...document.querySelectorAll('.app-settings-content button,.app-settings>summary,.sidebar-pin,#inspector .inspector-window-close')].filter(visible);
                    const favorite=document.querySelector('.catalog-favorite:not([aria-pressed="true"])');
                    const header=document.querySelector('.catalog-panel-header');
                    const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
                    const lum=s=>rgb(s).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
                    const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
                    const settingsBackground=color(document.querySelector('.settings-group')).backgroundColor;
                    return {
                        borders:buttons.filter(el=>{const s=color(el);return s.borderTopWidth!=='0px'&&s.borderTopColor!=='rgba(0, 0, 0, 0)';}).map(el=>el.outerHTML.slice(0,160)),
                        header:color(header).backgroundColor,side:color(document.querySelector('#equipment-catalog')).backgroundColor,
                        favorite:contrast(color(favorite).color,color(favorite.closest('.catalog-item')).backgroundColor),
                        labels:[...document.querySelectorAll('.headphone-calibration-setting strong,.listening-level-settings strong,.listening-level-settings label,.settings-particle-control output,.listening-level-settings output')].filter(visible).map(el=>({text:el.textContent,contrast:contrast(color(el).color,settingsBackground)}))
                    };
                });
                assert.deepEqual(controls.borders,[],`${sample.key}: decorative button borders`);
                assert.equal(controls.header,controls.side,`${sample.key}: catalog header follows palette`);
                assert(controls.favorite>=3,`${sample.key}: favorite visibility ${controls.favorite}`);
                for(const label of controls.labels)assert(label.contrast>=4.5,`${sample.key}: ${label.text} contrast ${label.contrast}`);
                await page.evaluate(()=>document.querySelector('.app-settings').open=false);
                samples.push(sample);
                await page.evaluate(()=>__signal.selectDevice('palette-meter'));
                const spectrumColor=await page.$eval('#audio-spectrum',element=>getComputedStyle(element).backgroundColor);
                samples[samples.length-1].spectrum=spectrumColor;
                await page.evaluate(()=>__signal.selectDevice('palette-speaker'));
            }
        }
        assert.equal(new Set(samples.map(s=>s.key)).size,13,'every background/time combination has a palette');
        assert.equal(new Set(samples.map(s=>s.side)).size,13,'each palette has its own sidebar color');
        assert.equal(new Set(samples.map(s=>s.spectrum)).size,13,'spectrum inspector matches every palette');
        assert.equal(new Set(samples.map(s=>s.device)).size,1,'equipment artwork stays unchanged');
        await page.evaluate(()=>{__signal.setCanvasTheme('light');__signal.selectDevice('palette-speaker');});
        await page.waitForTimeout(300);await page.screenshot({path:'/tmp/interface-light.png'});
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');__signal.setCanvasBackdrop('listeningIllustrated');__signal.setCanvasTime('dusk');});
        await page.waitForTimeout(300);await page.screenshot({path:'/tmp/interface-scene.png'});
        await page.setViewportSize({width:390,height:844});await page.locator('[data-mobile-panel=properties]').click();await page.screenshot({path:'/tmp/interface-mobile.png'});
        await page.evaluate(()=>{__signal.deleteDevice(__signal.appState.project.devices['palette-meter'],false);__signal.deleteDevice(__signal.appState.project.devices['palette-speaker'],false);});
        assert.deepEqual(errors,[]);console.log('Interface palettes: 13 combinations, contrast, equipment artwork and mobile layout passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
