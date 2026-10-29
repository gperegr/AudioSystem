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
        await page.evaluate(()=>{__cables.createDevice('cdPlayer',300,500,'source');__cables.createDevice('receiver',1200,500,'amp');__cables.connectProjectPorts(__cables.appState.project.devices.source,'outL',__cables.appState.project.devices.amp,'inL');__cables.updateCables();});
        const cablePath=()=>page.evaluate(()=>__cables.appState.project.connections[0].el.querySelector('path').getAttribute('d'));
        assert.match(await cablePath(),/ C /);
        await page.locator('#orthogonal-cables').evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
        assert.match(await cablePath(),/ L /);assert.doesNotMatch(await cablePath(),/ C /);
        await page.evaluate(()=>{__cables.connectProjectPorts(__cables.appState.project.devices.source,'outR',__cables.appState.project.devices.amp,'inR');__cables.updateCables();});
        const lanes=await page.evaluate(()=>__cables.appState.project.connections.map(c=>{const d=c.el.querySelector('path').getAttribute('d');const points=[...d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map(m=>({x:+m[1],y:+m[2]}));return points.find((p,i)=>i&&p.y===points[i-1].y&&Math.abs(p.x-points[i-1].x)>100)?.y;}));
        assert(lanes.every(Number.isFinite));assert(Math.abs(lanes[0]-lanes[1])>=18,'overlapping horizontal segments must use separate lanes');
        const stacked=await page.evaluate(()=>{
            const a=__cables.appState.project.devices.source,b=__cables.appState.project.devices.amp;
            a.el.style.left='600px';a.el.style.top='400px';b.el.style.left='600px';b.el.style.top=(400+a.el.offsetHeight+4)+'px';__cables.updateCables();
            const d=__cables.appState.project.connections[0].el.querySelector('path').getAttribute('d');
            return [...d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map(m=>({x:+m[1],y:+m[2]}));
        });
        assert(stacked.slice(2).some((p,i)=>p.y===stacked[1].y&&p.x!==stacked[1].x&&i<2),'stacked device must trigger an immediate horizontal escape');
        const segments=await page.evaluate(()=>__cables.appState.project.connections.map(c=>{const points=[...c.el.querySelector('path').getAttribute('d').matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map(m=>({x:+m[1],y:+m[2]}));return points.slice(2,-1).map((p,i)=>({a:points[i+1],b:p})).filter(s=>s.a.x===s.b.x&&s.a.y!==s.b.y);}));
        for(const a of segments[0])for(const b of segments[1])if(Math.max(Math.min(a.a.y,a.b.y),Math.min(b.a.y,b.b.y))<Math.min(Math.max(a.a.y,a.b.y),Math.max(b.a.y,b.b.y)))assert(Math.abs(a.a.x-b.a.x)>=17,'vertical detours must have separate lanes');
        await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('audio-system-interface-preferences')).orthogonalCables),true);
        await page.locator('#orthogonal-cables').evaluate(el=>{el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));});assert.match(await cablePath(),/ C /);
        assert.equal(await page.locator('#alignment-guides-enabled').isChecked(),true);
        await page.locator('#alignment-guides-enabled').evaluate(el=>{el.checked=false;el.dispatchEvent(new Event('change',{bubbles:true}));});
        await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('audio-system-interface-preferences')).alignmentGuides),false);
        await page.reload();assert.equal(await page.locator('#alignment-guides-enabled').isChecked(),false);
        assert.deepEqual(errors,[]);console.log('Right-angle cable toggle and persistence passed');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
