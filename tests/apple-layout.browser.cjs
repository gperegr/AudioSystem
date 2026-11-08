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
            let body=fs.readFileSync(file);
            if(path.basename(file)==='script.js'){const source=body.toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);body=source.slice(0,index)+'window.__desktop={createDevice,selectDevice,appState,view,applyView,screenToWorld};\n'+source.slice(index);}
            return route.fulfill({contentType:mime[path.extname(file)]||'application/octet-stream',body});
          });
          await p.goto('http://127.0.0.1:9876/');await p.waitForFunction(()=>document.getElementById('home-menu')?.open);
          const menu=await p.evaluate(()=>({width:innerWidth,scale:visualViewport.scale,columns:getComputedStyle(document.querySelector('.home-main')).gridTemplateColumns.split(' ').length,overflow:document.getElementById('home-menu').scrollWidth>document.getElementById('home-menu').clientWidth+1,verticalOverflow:document.getElementById('home-menu').scrollHeight>document.getElementById('home-menu').clientHeight+1}));
          assert(menu.width>=1280&&menu.scale<1&&menu.columns===2&&!menu.overflow&&!menu.verticalOverflow,JSON.stringify({item,menu}));
          if(item.name==='iphone')await p.screenshot({path:'/tmp/audio-lab-home-mobile.png'});
          await p.locator('[data-home="continue"]').tap();await p.locator('#headphone-calibration-skip').tap();await p.getByRole('button',{name:'Agora não',exact:true}).click();
          const state=await p.evaluate(()=>({width:innerWidth,nav:getComputedStyle(document.querySelector('.mobile-panel-controls')).display,catalog:getComputedStyle(document.querySelector('#equipment-catalog')).visibility,touch:document.documentElement.classList.contains('has-touch-input'),icon:document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href'),particles:document.querySelector('.room-mote-canvas').width}));
          assert.equal(state.nav,'none',JSON.stringify({item,state}));assert(state.width>=1280);assert.equal(state.catalog,'visible');assert.equal(state.touch,true);assert(state.particles<=item.width+2,'effect resolution follows the physical display rather than the wide layout viewport');assert.match(state.icon,/apple-touch-icon.png/);
          await p.evaluate(()=>{__desktop.createDevice('headphoneAmp',400,200,'touch-amp');__desktop.view.zoom=1;__desktop.view.x=0;__desktop.view.y=0;__desktop.applyView();__desktop.selectDevice('touch-amp');});
          await p.waitForFunction(()=>document.getElementById('inspector').dataset.floating==='true');
          const power=await p.evaluate(()=>__desktop.appState.project.devices['touch-amp'].powered);
          await p.locator('#touch-amp .power-btn').tap();
          assert.notEqual(await p.evaluate(()=>__desktop.appState.project.devices['touch-amp'].powered),power,'scaled touch hits the desktop control');
          if(item.name==='iphone'){
            await p.screenshot({path:'/tmp/audio-lab-desktop-on-phone.png'});
            await p.setViewportSize({width:844,height:390});await p.waitForTimeout(200);
            const rotated=await p.evaluate(()=>({width:innerWidth,scale:visualViewport.scale,nav:getComputedStyle(document.querySelector('.mobile-panel-controls')).display}));
            assert(rotated.width>=1280&&rotated.scale<1&&rotated.nav==='none',JSON.stringify(rotated));
            await p.screenshot({path:'/tmp/audio-lab-desktop-phone-landscape.png'});
          }
          console.log(item.name,JSON.stringify(state));await context.close();
        }
        assert.deepEqual(errors,[]);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
