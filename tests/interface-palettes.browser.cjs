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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,setCanvasTime,setCanvasBackdrop,createDevice,selectDevice,setDeviceSelection,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
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
                    const rgb=s=>s.startsWith('#')?s.slice(1).match(/../g).map(value=>parseInt(value,16)):s.match(/\d+(?:\.\d+)?/g).slice(0,3).map(Number),lum=c=>{const values=rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*values[0]+.7152*values[1]+.0722*values[2];};
                    const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
                    const calc=(a,b=a)=>contrast(getComputedStyle(document.querySelector(a)).color,getComputedStyle(document.querySelector(b)).backgroundColor);
                    const button=document.querySelector('#inspector-content .tt-insp-btn');
                    const token=name=>getComputedStyle(document.documentElement).getPropertyValue('--ui-'+name).trim();
                    const stateContrasts=Object.fromEntries([['text','hover'],['text','active'],['secondary','control'],['accent','control'],['muted','panel']].map(([foreground,background])=>[foreground+' on '+background,contrast(token(foreground),token(background))]));
                    return {key:document.documentElement.dataset.uiPalette,stateContrasts,side:getComputedStyle(document.querySelector('#inspector')).backgroundColor,top:calc('#app-topbar'),card:calc('.catalog-item>span','.catalog-item'),body:calc('#inspector-content','#inspector'),section:calc('.sonic-signature-panel h3','.sonic-signature-panel'),band:calc('.sonic-band-name','.sonic-band'),bandState:calc('.sonic-band-state','.sonic-band'),button:calc('#inspector-content .tt-insp-btn'),buttonColors:[getComputedStyle(button).color,getComputedStyle(button).backgroundColor],settings:calc('.app-settings>summary'),device:getComputedStyle(document.querySelector('#palette-speaker .electrostatic-frame')).backgroundImage};
                });
                for(const key of ['top','card','body','section','band','bandState','button','settings'])assert(sample[key]>=4.5,`${sample.key}: ${key} contrast ${sample[key]} (${sample.buttonColors})`);
                if(sample.key.startsWith('scene-'))for(const [state,value] of Object.entries(sample.stateContrasts))assert(value>=4.5,`${sample.key}: ${state} contrast ${value}`);
                await page.evaluate(()=>{
                    document.querySelector('.app-settings').open=true;
                    document.querySelectorAll('.app-settings-content .settings-group').forEach(group=>group.open=true);
                });
                await page.waitForTimeout(500);
                const controls=await page.evaluate(()=>{
                    const color=el=>getComputedStyle(el);
                    const visible=el=>!!el.getClientRects().length;
                    const buttons=[...document.querySelectorAll('.app-settings-content button:not(.app-select-trigger),.sidebar-pin')].filter(visible);
                    const favorite=document.querySelector('.catalog-favorite:not([aria-pressed="true"])');
                    const header=document.querySelector('.catalog-panel-header');
                    const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
                    const lum=s=>rgb(s).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
                    const contrast=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
                    const settingsBackground=color(document.querySelector('.settings-group')).backgroundColor;
                    return {
                        borders:buttons.filter(el=>{const s=color(el);return s.borderTopWidth!=='0px'&&s.borderTopColor!=='rgba(0, 0, 0, 0)';}).map(el=>el.outerHTML.slice(0,160)),
                        header:color(header).backgroundColor,side:color(document.querySelector('#equipment-catalog')).backgroundColor,
                        floatingCloseVisible:visible(document.querySelector('#inspector-sidebar-pin')),
                        favorite:contrast(color(favorite).color,color(favorite.closest('.catalog-item')).backgroundColor),
                        labels:[...document.querySelectorAll('.headphone-calibration-setting strong,.listening-level-settings strong,.listening-level-settings label,.settings-particle-control output,.listening-level-settings output')].filter(visible).map(el=>({text:el.textContent,contrast:contrast(color(el).color,settingsBackground)}))
                    };
                });
                assert.deepEqual(controls.borders,[],`${sample.key}: decorative button borders`);
                assert.equal(controls.header,controls.side,`${sample.key}: catalog header follows palette`);
                assert.equal(controls.floatingCloseVisible,false,`${sample.key}: floating inspector has no close button`);
                assert(controls.favorite>=3,`${sample.key}: favorite visibility ${controls.favorite}`);
                for(const label of controls.labels)assert(label.contrast>=4.5,`${sample.key}: ${label.text} contrast ${label.contrast}`);
                const favoriteStates=await page.evaluate(()=>{
                    const button=document.querySelector('.catalog-favorite[aria-pressed="false"]');
                    const path=button.querySelector('path'),card=button.closest('.catalog-item');
                    const pixel=document.createElement('canvas');pixel.width=pixel.height=1;
                    const context=pixel.getContext('2d');
                    const luminance=color=>{
                        context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);
                        return [...context.getImageData(0,0,1,1).data].slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
                    };
                    const contrast=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
                    const read=()=>{
                        button.getAnimations({subtree:true}).forEach(animation=>animation.finish());
                        const style=getComputedStyle(path),background=luminance(getComputedStyle(card).backgroundColor);
                        return {fill:style.fill,stroke:style.stroke,contrast:contrast(luminance(style.fill),background),outlineContrast:contrast(luminance(style.stroke),background)};
                    };
                    const off=read();button.click();const on=read();button.click();read();
                    return {off,on};
                });
                assert.equal(favoriteStates.off.stroke,'none',`${sample.key}: OFF favorite must have no outline`);
                assert.equal(favoriteStates.on.stroke,'none',`${sample.key}: ON favorite must have no outline`);
                assert(favoriteStates.on.contrast>=3,`${sample.key}: ON must stand out against the card`);
                assert(favoriteStates.on.contrast>favoriteStates.off.contrast*2,`${sample.key}: ON must stand out more than OFF ${JSON.stringify(favoriteStates)}`);

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
        await page.evaluate(()=>__signal.setDeviceSelection(['palette-speaker','palette-meter'],'palette-meter'));
        assert.equal(await page.locator('#inspector').getAttribute('data-floating'),'false','multi-selection closes the floating properties menu');
        assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('inspector-floating')),false,'multi-selection removes floating menu mode');
        assert.equal(await page.evaluate(()=>__signal.appState.interface.selectedDeviceIds.size),2,'multi-selection stays active while properties are closed');
        await page.evaluate(()=>__signal.setDeviceSelection(['palette-speaker'],'palette-speaker'));
        assert.equal(await page.locator('#inspector').getAttribute('data-floating'),'true','single selection reopens properties');
        async function assertInspectorWithinCanvas(){
            await page.waitForTimeout(650);
            const bounds=await page.evaluate(()=>{
                const rect=id=>{const r=document.getElementById(id).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};};
                return {panel:rect('inspector'),layer:rect('inspector-layer'),canvas:rect('canvas'),catalog:rect('equipment-catalog'),toolbar:rect('app-topbar')};
            });
            assert(bounds.layer.left>=bounds.catalog.right-1,JSON.stringify(bounds));
            assert(bounds.layer.top>=bounds.toolbar.bottom-1,JSON.stringify(bounds));
            assert(bounds.layer.right<=bounds.canvas.right+1,JSON.stringify(bounds));
            assert(bounds.layer.bottom<=bounds.canvas.bottom+1,JSON.stringify(bounds));
            assert(bounds.panel.left>=Math.max(bounds.canvas.left,bounds.catalog.right)-1,JSON.stringify(bounds));
            assert(bounds.panel.top>=Math.max(bounds.canvas.top,bounds.toolbar.bottom)-1,JSON.stringify(bounds));
            assert(bounds.panel.right<=bounds.canvas.right+1,JSON.stringify(bounds));
            assert(bounds.panel.bottom<=bounds.canvas.bottom+1,JSON.stringify(bounds));
        }
        async function assertOpeningBounds(){
            const violations=await page.evaluate(async()=>{
                const failures=[],start=performance.now();
                do{
                    await new Promise(requestAnimationFrame);
                    const panel=document.getElementById('inspector').getBoundingClientRect();
                    const area=document.getElementById('inspector-layer').getBoundingClientRect();
                    if(panel.left<area.left-1||panel.top<area.top-1||panel.right>area.right+1||panel.bottom>area.bottom+1)failures.push({left:panel.left-area.left,top:panel.top-area.top,right:area.right-panel.right,bottom:area.bottom-panel.bottom});
                }while(performance.now()-start<600);
                return failures;
            });
            assert.deepEqual(violations,[],'the opening animation stays inside the canvas on every frame');
        }
        const savedSpeakerStyle=await page.$eval('#palette-speaker',el=>el.style.cssText);
        for(const width of [1600,800]){
            await page.setViewportSize({width,height:500});
            for(const offset of [-2000,10000]){
                await page.$eval('#palette-speaker',(el,offset)=>{el.style.left=offset+'px';el.style.top=offset+'px';},offset);
                await page.evaluate(()=>__signal.selectDevice('palette-speaker'));
                await assertOpeningBounds();
                await page.mouse.move(width-20,400);
                await assertInspectorWithinCanvas();
            }
        }
        // Keep the same panel open while crossing desktop/mobile breakpoints.
        for(const viewport of [{width:701,height:280},{width:700,height:280},{width:390,height:844},{width:1600,height:1100}]){
            await page.setViewportSize(viewport);
            await assertInspectorWithinCanvas();
        }
        // Resize the toolbar and catalog without moving the pointer or reselecting a device.
        await page.locator('#app-topbar').evaluate(el=>el.style.height='110px');
        await page.locator('#workspace-shell').evaluate(el=>el.style.setProperty('--catalog-width','320px'));
        await assertInspectorWithinCanvas();
        await page.locator('#app-topbar').evaluate(el=>el.style.removeProperty('height'));
        await page.locator('#workspace-shell').evaluate(el=>el.style.removeProperty('--catalog-width'));
        await page.locator('#inspector-content').evaluate(el=>{const extra=document.createElement('div');extra.id='inspector-test-content';extra.style.cssText='height:1200px;flex-shrink:0';el.appendChild(extra);});
        await assertInspectorWithinCanvas();
        assert(await page.locator('#inspector-content').evaluate(el=>{el.scrollTop=el.scrollHeight;return el.scrollTop>0;}),'long properties content scrolls within the panel');
        await page.locator('#inspector-test-content').evaluate(el=>el.remove());
        await page.$eval('#palette-speaker',(el,style)=>el.style.cssText=style,savedSpeakerStyle);
        await page.setViewportSize({width:1600,height:1100});
        await page.evaluate(()=>{__signal.setCanvasTheme('light');__signal.selectDevice('palette-speaker');});
        await page.waitForTimeout(300);await page.screenshot({path:'/tmp/interface-light.png'});
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');__signal.setCanvasBackdrop('listeningIllustrated');__signal.setCanvasTime('dusk');});
        await page.waitForTimeout(300);await page.screenshot({path:'/tmp/interface-scene.png'});
        await page.setViewportSize({width:390,height:844});if(await page.locator('[data-mobile-panel=properties]').getAttribute('aria-expanded')!=='true')await page.locator('[data-mobile-panel=properties]').click();await assertInspectorWithinCanvas();await page.screenshot({path:'/tmp/interface-mobile.png'});
        await page.evaluate(()=>{__signal.deleteDevice(__signal.appState.project.devices['palette-meter'],false);__signal.deleteDevice(__signal.appState.project.devices['palette-speaker'],false);});
        assert.deepEqual(errors,[]);console.log('Interface palettes: 13 combinations, contrast, equipment artwork and mobile layout passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
