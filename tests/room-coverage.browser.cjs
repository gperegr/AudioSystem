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
                const source=body.toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,setCanvasBackdrop,setCanvasTime,view,applyView};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();


        await page.emulateMedia({reducedMotion:'reduce'});
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');document.getElementById('room-rain-enabled').click();});
        const viewports=[{width:320,height:568},{width:390,height:844},{width:430,height:932},{width:700,height:280},{width:844,height:390},{width:768,height:1024},{width:1024,height:768},{width:1280,height:720},{width:1600,height:900},{width:2560,height:1080},{width:3840,height:2160},{width:480,height:1400},{width:390,height:844,iphone:true},{width:844,height:390,iphone:true}];
        let cases=0,iphone=false;
        const floorLines=new Map();
        for(const viewport of viewports){
            if(viewport.iphone&&!iphone){
                const cdp=await page.context().newCDPSession(page);
                await cdp.send('Network.setUserAgentOverride',{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
                await page.reload();await page.waitForFunction(()=>!document.documentElement.classList.contains('app-starting'));
                iphone=true;
            }
            await page.setViewportSize({width:viewport.width,height:viewport.height});
            await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
            for(const scene of ['studioIllustrated','listeningIllustrated','loftIllustrated'])for(const time of ['dawn','dusk','night']){
                await page.evaluate(({scene,time})=>{__signal.setCanvasBackdrop(scene);__signal.setCanvasTime(time);}, {scene,time});
                await page.waitForFunction(()=>[...document.querySelectorAll('.room-scene-image.is-visible')].some(img=>img.complete&&img.naturalWidth>0));
                for(const pan of ['top','bottom']){
                    await page.evaluate(pan=>{__signal.view.zoom=0;__signal.view.x=pan==='top'?0:-1e6;__signal.view.y=pan==='top'?0:-1e6;__signal.applyView();},pan);
                    const result=await page.evaluate(()=>{
                        const c=document.getElementById('canvas').getBoundingClientRect();
                        const images=[...document.querySelectorAll('.room-scene-image.is-visible')].map(image=>({rect:image.getBoundingClientRect(),src:image.getAttribute('src')}));
                        const dock=document.getElementById('equipment-catalog'),d=dock.getBoundingClientRect(),path=dock.querySelector('.catalog-dock-silhouette path');
                        const visible=[];
                        for(const x of [1,10,30,100,c.width/2,c.width-30,c.width-10,c.width-1])for(const y of [1,10,24,40,63]){
                            if(!path.isPointInFill(new DOMPoint(x,y)))visible.push({x:d.left+x,y:d.top+y});
                        }
                        const backdrop=document.getElementById('room-backdrop'),b=backdrop.getBoundingClientRect();
                        const clip=getComputedStyle(backdrop).clipPath,clipValues=clip.match(/-?[\d.]+/g).map(Number);
                        const paintBottom=b.bottom-(clipValues[2]||0)*__signal.view.zoom;
                        const failures=visible.filter(p=>p.x<b.left||p.x>b.right||p.y<b.top||p.y>paintBottom||!images.some(({rect:r})=>p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom));
                        const rain=document.querySelector('.room-rain'),r=rain.getBoundingClientRect(),image=images.at(-1).rect;
                        const wet=document.querySelector('.room-rain-static'),wetRect=wet.getBoundingClientRect();
                        if(!wet.hidden&&Math.abs(wetRect.left-image.left)+Math.abs(wetRect.top-image.top)+Math.abs(wetRect.width-image.width)+Math.abs(wetRect.height-image.height)>1)failures.push({staticRainDrift:true});
                        return {failures,floorLine:image.top+image.height*530/720,aspect:image.width/image.height,zoom:__signal.view.zoom,images,canvas:{top:c.top,bottom:c.bottom},dockTop:d.top,clip:getComputedStyle(document.getElementById('room-backdrop')).clipPath,rainMatches:rain.hidden||Math.abs(r.left-image.left)+Math.abs(r.top-image.top)+Math.abs(r.width-image.width)+Math.abs(r.height-image.height)<1};
                    });
                    assert.deepEqual(result.failures,[],JSON.stringify({viewport,scene,time,pan,result}));
                    assert(result.clip.startsWith('inset('));assert(result.rainMatches);
                    assert(Math.abs(result.aspect-3.2)<.001,'panorama keeps its authored aspect ratio');
                    const floorKey=JSON.stringify(viewport)+pan;
                    if(!floorLines.has(floorKey))floorLines.set(floorKey,result.floorLine);
                    assert(Math.abs(floorLines.get(floorKey)-result.floorLine)<1,'floor stays aligned across all rooms and times');
                    cases++;
                }
            }
            if(viewport.width===1600||viewport.width===390){
                const dock=await page.locator('#equipment-catalog').boundingBox();
                await page.screenshot({path:`/tmp/minimum-room-coverage-${viewport.width}.png`,clip:{x:0,y:dock.y-80,width:viewport.width,height:Math.min(dock.height+80,viewport.height-dock.y+80)}});
            }
        }
        assert.deepEqual(errors,[]);console.log(`Room image covers the dock cutouts in ${cases} minimum-zoom cases (${viewports.length} viewport/device configurations, 9 room/time variants, both pan limits).`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
