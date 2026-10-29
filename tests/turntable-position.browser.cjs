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
                assert(index>0);body=source.slice(0,index)+'window.__cables={createDevice,saveLocalProject,appState};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.waitForSelector('.project-restore-shield',{state:'detached'});
        const types=['turntable','turntableDirect','turntableBelt','turntableLinear'];
        const available=await page.evaluate(types=>{for(let i=0;i<types.length;i++)__cables.createDevice(types[i],300+i*800,700,types[i]);return Object.values(__cables.appState.project.devices).map(d=>({type:d.type,x:parseFloat(d.el.style.left),y:parseFloat(d.el.style.top)}));},types);
        assert(available.length>=3,'turntable models created');
        await page.evaluate(()=>__cables.saveLocalProject(true));await page.reload();
        await page.waitForFunction(count=>window.__cables&&Object.keys(__cables.appState.project.devices).length===count,available.length);
        const restored=await page.evaluate(()=>Object.values(__cables.appState.project.devices).map(d=>({type:d.type,x:parseFloat(d.el.style.left),y:parseFloat(d.el.style.top)})));
        assert.deepEqual(restored,available,'restoring must preserve each turntable position');
        await page.evaluate(()=>__cables.saveLocalProject(true));await page.reload();
        await page.waitForFunction(count=>window.__cables&&Object.keys(__cables.appState.project.devices).length===count,available.length);
        const twice=await page.evaluate(()=>Object.values(__cables.appState.project.devices).map(d=>({type:d.type,x:parseFloat(d.el.style.left),y:parseFloat(d.el.style.top)})));
        assert.deepEqual(twice,available,'positions must not drift after repeated reloads');
        assert.deepEqual(errors,[]);console.log('Turntable positions survive repeated reloads');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
