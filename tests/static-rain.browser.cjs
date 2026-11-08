// Dock regression: keep the search inside the silhouette and paint the canvas behind its cutouts.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:2}),errors=[];
        let materialRequests=0;
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.pathname.endsWith('/rain-glass-material.webp'))materialRequests++;
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
        await page.evaluate(()=>{
            __signal.setCanvasTheme('scene');
            document.getElementById('room-rain-enabled').click();
            const rain=document.getElementById('room-rain-intensity');rain.value=2;rain.dispatchEvent(new Event('input',{bubbles:true}));
            const grid=document.getElementById('canvas-grid');grid.value='hidden';grid.dispatchEvent(new Event('change'));
            document.getElementById('room-particle-enabled').click();
        });
        const sources=new Map();
        for(const scene of ['studioIllustrated','listeningIllustrated','loftIllustrated'])for(const time of ['dusk','night']){
            await page.evaluate(({scene,time})=>{__signal.setCanvasBackdrop(scene);__signal.setCanvasTime(time);__signal.setOpeningView();__signal.applyView();},{scene,time});
            await page.waitForFunction(scene=>{const img=document.querySelector('.room-rain-static');return img.dataset.scene===scene&&img.complete&&img.naturalWidth===4608;},scene);
            const result=await page.evaluate(()=>{
                const img=document.querySelector('.room-rain-static'),scene=RoomScenes.scenes[img.dataset.scene],ratio=img.naturalWidth/scene.width;
                const probe=document.createElement('canvas');probe.width=probe.height=128;const ctx=probe.getContext('2d');
                const sample=(x,y,w,h)=>{ctx.clearRect(0,0,128,128);ctx.drawImage(img,x*ratio,y*ratio,w*ratio,h*ratio,0,0,128,128);return ctx.getImageData(0,0,128,128).data;};
                const [first,second]=scene.glass[0],a=first[0],b=first[2];
                const gap=second[0][1]>b[1]?[(a[0]+b[0])/2,(b[1]+second[0][1])/2]:[(b[0]+second[0][0])/2,(a[1]+b[1])/2];
                const dry=[...sample(0,0,4,4),...sample(gap[0]-.5,gap[1]-.5,1,1)].every((value,index)=>index%4!==3||value===0);
                const glass=sample(a[0],a[1],b[0]-a[0],b[1]-a[1]);let wet=0,translucent=0;
                for(let i=3;i<glass.length;i+=4){if(glass[i]>0)wet++;if(glass[i]>0&&glass[i]<255)translucent++;}
                return {source:img.src,width:img.naturalWidth,height:img.naturalHeight,dry,wet,translucent,drops:document.querySelectorAll('.room-rain-drop').length};
            });
            assert.equal(result.width,4608);assert.equal(result.height,1440);
            assert(result.dry,'frames and outside glass remain transparent');assert(result.wet>50&&result.translucent>50,'glass contains translucent water detail');
            assert(result.drops<=18,'image quality does not increase the animation budget');
            if(sources.has(scene))assert.equal(result.source,sources.get(scene),'lighting reuses the same cached PNG');else sources.set(scene,result.source);
            assert(result.source.length<4000000,'retina PNG remains within its cache budget');
            await page.screenshot({path:`/tmp/rain-quality-${scene.replace('Illustrated','')}-${time}.png`,scale:'css'});
            if(scene==='loftIllustrated'&&time==='dusk')await page.screenshot({path:'/tmp/rain-quality-detail.png',clip:{x:500,y:70,width:650,height:430},scale:'css'});
        }
        assert.equal(materialRequests,1,'all rooms share one material decode/download');
        assert(fs.statSync(path.join(root,'assets/rooms/rain-glass-material.webp')).size<125000,'the shared material stays below 125 KB');
        await page.evaluate(()=>{document.getElementById('room-rain-enabled').click();});
        assert(await page.locator('.room-rain-static').evaluate(el=>el.hidden),'disabled rain hides its cached image');
        assert.deepEqual(errors,[]);console.log('Static rain: photographic material shared by three rooms; Retina detail, transparent frames, cached lighting variants and sparse animation verified.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
