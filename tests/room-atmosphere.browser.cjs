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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,setCanvasBackdrop,setCanvasTime,setOpeningView,view,applyView,getEffects:()=>({beams:roomMoteBeams,frame:roomMoteFrame,timer:roomMoteTimer})};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();


        await page.emulateMedia({reducedMotion:'reduce'});
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');document.getElementById('room-rain-enabled').click();const grid=document.getElementById('canvas-grid');grid.value='hidden';grid.dispatchEvent(new Event('change'));});
        await page.setViewportSize({width:1920,height:1000});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        let floorLine=null;
        for(const scene of ['studioIllustrated','listeningIllustrated','loftIllustrated']){
            await page.evaluate(scene=>{__signal.setCanvasBackdrop(scene);__signal.setOpeningView();__signal.applyView();window.__lastImage=document.querySelector('.room-scene-image');window.__lastDrop=document.querySelector('.room-rain-drop');},scene);
            await page.waitForFunction(()=>document.querySelector('.room-scene-image')?.naturalWidth===2304);
            for(const time of ['dawn','dusk','night']){
                await page.evaluate(time=>__signal.setCanvasTime(time),time);
                await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
                const state=await page.evaluate(()=>{
                    const image=document.querySelector('.room-scene-image'),r=image.getBoundingClientRect(),definition=RoomScenes.scenes[document.getElementById('canvas').dataset.backdrop],effects=__signal.getEffects();
                    return {sameImage:image===window.__lastImage,sameRain:document.querySelector('.room-rain-drop')===window.__lastDrop,
                        mask:getComputedStyle(document.querySelector('.room-rain')).clipPath,origins:effects.beams.flatMap(b=>b.particles.map(p=>{const point=RoomScenes.particlePoint(b.scene,b.windowIndex,p.paneIndex,p.u,p.v,0),pane=definition.glass[b.windowIndex][p.paneIndex];return point.x>pane[0][0]&&point.x<pane[2][0]&&point.y>pane[0][1]&&point.y<pane[2][1];})),count:document.querySelectorAll('.room-scene-image').length,floor:r.top+r.height*definition.horizon.dusk/definition.height,
                        blur:getComputedStyle(image).filter,zoom:__signal.view.zoom,frame:effects.frame,timer:effects.timer,
                        beams:effects.beams.map(b=>({x:b.x,y:b.y})),windows:definition.windows.map(w=>({left:(w.x-w.w/2)/definition.width,right:(w.x+w.w/2)/definition.width,top:(w.y-w.h/2)/definition.height,bottom:(w.y+w.h/2)/definition.height}))};
                });
                assert(state.origins.every(Boolean),'all dust origins belong to individual glass panes');assert.match(state.mask,/room-window-glass-clip/,'the final rain blur is clipped to the glass');
                assert(state.sameImage,'time reuses the same image element and decoded texture');assert(state.sameRain,'time changes retain existing rain drops');assert.equal(state.count,1);
                const blur=parseFloat(state.blur.match(/blur\(([\d.]+)px\)/)?.[1]);
                assert(Math.abs(blur*state.zoom-2)<.01,'depth blur stays at 2 screen pixels in every time setting');
                if(floorLine===null)floorLine=state.floor;assert(Math.abs(floorLine-state.floor)<1,'all nine combinations share the floor line');
                assert.equal(state.frame,0);assert.equal(state.timer,0,'reduced motion draws once');
                state.beams.forEach((b,i)=>{const w=state.windows[i];assert(b.x>w.left&&b.x<w.right&&b.y>w.top&&b.y<w.bottom,'particle origins remain in the windows');});
                await page.screenshot({path:`/tmp/room-ultrawide-${scene.replace('Illustrated','')}-${time}.png`});
            }
        }
        // Emitters must track the actual image, including coverage shifts and parallax.
        for(const zoom of [.175,.6,1.8])for(const pan of [0,-1e6]){
            const matches=await page.evaluate(({zoom,pan})=>{
                Object.assign(__signal.view,{zoom,x:pan,y:pan});__signal.applyView();
                const world=document.getElementById('audio-world'),wr=world.getBoundingClientRect(),image=document.querySelector('.room-scene-image').getBoundingClientRect(),definition=RoomScenes.scenes.loftIllustrated,z=wr.width/world.offsetWidth;
                return __roomLights('loftIllustrated','night',world).every((light,index)=>{
                    const source=definition.windows[index];
                    return Math.abs(wr.left+light.x*z-(image.left+image.width*source.x/definition.width))<1&&Math.abs(wr.top+light.y*z-(image.top+image.height*source.y/definition.height))<1;
                });
            },{zoom,pan});
            assert(matches,'equipment light emitters follow the window positions at every pan/zoom');
        }
        await page.setViewportSize({width:3840,height:2160});
        await page.evaluate(()=>{__signal.setOpeningView();__signal.applyView();});
        await page.waitForTimeout(200);
        const buffers=await page.evaluate(()=>({particles:document.querySelector('.room-mote-canvas').width,shadows:document.querySelector('.room-floor-shadows').width}));
        assert(buffers.particles>0&&buffers.particles<=1600);assert(buffers.shadows>0&&buffers.shadows<=2560);
        await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(100);
        assert(await page.evaluate(()=>{const e=__signal.getEffects();return e.frame>0||e.timer>0;}),'animation resumes when reduced motion is disabled');
        await page.evaluate(()=>document.getElementById('room-particle-enabled').click());
        const off=await page.evaluate(()=>{const e=__signal.getEffects(),c=document.querySelector('.room-mote-canvas');return {frame:e.frame,timer:e.timer,painted:c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((value,index)=>index%4===3&&value>0)};});
        assert.deepEqual(off,{frame:0,timer:0,painted:false},'disabled particles release their loop and clear the canvas');
        await page.evaluate(()=>document.getElementById('room-rain-enabled').click());
        assert.equal(await page.locator('.room-rain-drop').count(),0,'disabled rain retains no animated drop elements');
        assert.deepEqual(errors,[]);console.log('All nine ultrawide room/time settings retain their image, floor, window effects and blur; 4K effect buffers and disabled animations stay bounded.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
