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
                assert(index>0);body=source.slice(0,index)+'window.__signal={findTargetPortNear,createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });

        const cases=[
          {name:'ipad',width:768,height:1024,platform:'MacIntel',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',touch:5,phone:false},
          {name:'ipad-split',width:540,height:1024,platform:'MacIntel',ua:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',touch:5,phone:false},
          {name:'iphone-landscape',width:844,height:390,platform:'iPhone',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',touch:5,phone:true},
          {name:'iphone',width:390,height:844,platform:'iPhone',ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',touch:5,phone:true},
          {name:'tablet',width:900,height:1100,platform:'Linux armv8l',ua:'Mozilla/5.0 (Linux; Android 14; Tablet) AppleWebKit/537.36 Chrome/120 Safari/537.36',touch:5,phone:false}
        ];
        for(const item of cases){
          const context=await browser.newContext({viewport:{width:item.width,height:item.height},screen:{width:item.width,height:item.height},isMobile:true,hasTouch:true,userAgent:item.ua});
          await context.addInitScript(({platform,touch})=>{Object.defineProperty(navigator,'platform',{get:()=>platform});Object.defineProperty(navigator,'maxTouchPoints',{get:()=>touch});},{platform:item.platform,touch:item.touch});
          const p=await context.newPage();p.on('pageerror',error=>errors.push(error.message));await p.route('**/*',async route=>{
            const url=new URL(route.request().url());if(url.hostname==='cdn.tailwindcss.com')return route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)});
            if(url.hostname!=='127.0.0.1')return route.abort();const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
            return route.fulfill({contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
          });
          await p.goto('http://127.0.0.1:9876/');await p.locator('#headphone-calibration-skip').click();await p.getByRole('button',{name:'Agora não',exact:true}).click();
          const state=await p.evaluate(()=>({width:innerWidth,nav:getComputedStyle(document.querySelector('.mobile-panel-controls')).display,catalog:getComputedStyle(document.querySelector('#equipment-catalog')).visibility,touch:document.documentElement.classList.contains('has-touch-input'),icon:document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')}));
          assert.equal(state.nav==='grid',item.phone,JSON.stringify({item,state}));assert.equal(state.catalog,'visible');assert.equal(state.touch,true);assert.match(state.icon,/apple-touch-icon.png/);
          console.log(item.name,JSON.stringify(state));await context.close();
        }
        assert.deepEqual(errors,[]);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
