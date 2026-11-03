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
                const source=(process.env.CABLE_SOURCE_FILE?fs.readFileSync(process.env.CABLE_SOURCE_FILE):body).toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__cables={createDevice,connectProjectPorts,updateCables,appState,setDeviceSelection};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.locator('#orthogonal-cables').evaluate(el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}));});
        const count=await page.evaluate(()=>{
            const {createDevice,appState,connectProjectPorts,updateCables}=__cables;
            const layout=[['table','furnitureTable',450,1100],['deck','turntableDirect',950,170],['eq','eqStudio',900,460],
                ['amp','benchMeter',900,700],['matrix','rcaMatrix',900,990],['left','spkActiveCompact',460,570],['right','spkActiveCompact',1860,570]];
            for(const [id,type] of layout)createDevice(type,0,0,id);
            for(const [id,,x,y] of layout){const el=appState.project.devices[id].el;el.style.left=x+'px';el.style.top=y+'px';}
            const link=(a,out,b,input)=>connectProjectPorts(appState.project.devices[a],out,appState.project.devices[b],input);
            for(const channel of ['L','R']){link('deck','out'+channel,'eq','in'+channel);link('eq','out'+channel,'amp','in'+channel);link('amp','out'+channel,'matrix','in1'+channel);}
            link('matrix','out1L','left','inL');link('matrix','out1R','left','inR');
            link('matrix','out2L','right','inL');link('matrix','out2R','right','inR');updateCables();
            return appState.project.connections.length;
        });
        assert.equal(count,10);
        await page.waitForTimeout(700);
        const result=await page.evaluate(()=>{
            const {appState,updateCables}=__cables;
            const routes=()=>appState.project.connections.map(c=>{
                const d=c.el.querySelector('path').getAttribute('d'),points=[...d.matchAll(/[ML] ([\d.-]+) ([\d.-]+)/g)].map(m=>({x:+m[1],y:+m[2]}));
                return {from:c.outDeviceId,to:c.inDeviceId,maxY:Math.max(...points.map(p=>p.y)),length:points.slice(1).reduce((n,p,i)=>n+Math.abs(p.x-points[i].x)+Math.abs(p.y-points[i].y),0),points};
            });
            updateCables();const before=routes();
            // Extending furniture downwards must never pull the cable route toward the floor.
            const table=appState.project.devices.table.el;table.style.height='3000px';updateCables();const after=routes();table.style.height='';updateCables();
            const start=performance.now();for(let i=0;i<10;i++)updateCables();
            return {routes:before,furnitureChangesRoute:JSON.stringify(before)!==JSON.stringify(after),averageUpdateMs:(performance.now()-start)/10};
        });
        if(!process.env.CABLE_SOURCE_FILE){
            assert.equal(result.furnitureChangesRoute,false);
            for(const route of result.routes){assert.ok(route.maxY<1200,JSON.stringify(route));assert.ok(route.length<2000,JSON.stringify(route));}
        }
        await page.evaluate(()=>__cables.setDeviceSelection([]));
        await page.locator('#fit-selection').click();await page.waitForTimeout(350);
        await page.screenshot({path:process.env.CABLE_SCREENSHOT||'/tmp/right-angle-cable-lengths.png'});
        assert.deepEqual(errors,[]);console.log(JSON.stringify(result,null,2));
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
