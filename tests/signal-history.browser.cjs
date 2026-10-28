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
                assert(index>0);body=source.slice(0,index)+'window.__signal={createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(async()=>{
            const api=__signal;api.createDevice('streamer',100,100,'history-source');api.createDevice('headphoneAmp',500,100,'history-amp');
            const source=api.appState.project.devices['history-source'],amp=api.appState.project.devices['history-amp'];
            if(!source.powered)api.toggleDevicePower(source);if(!amp.powered)api.toggleDevicePower(amp);
            api.connectProjectPorts(source,'outL',amp,'inL');
            const context=api.appState.audio.context;await context.resume();
            const tone=context.createOscillator();tone.frequency.value=1000;const gain=context.createGain();gain.gain.value=.2;
            tone.connect(gain);gain.connect(source.nodes.outL);tone.start();api.tone=tone;api.gain=gain;
            api.selectDevice(amp.id);AudioSystemLanguage.set('en');
        });
        await page.evaluate(()=>document.getElementById('inspector-sidebar-pin').click());
        const panel=page.locator('#signal-history-panel');await panel.scrollIntoViewIfNeeded();
        assert(await panel.evaluate(el=>!el.open&&!el.nextElementSibling),'history starts collapsed after every other inspector element');
        await panel.locator('summary').click();
        await page.waitForFunction(()=>document.querySelectorAll('.signal-history-device').length===2);
        await page.waitForFunction(()=>[...document.querySelectorAll('.signal-history-reading[data-direction=in]')].some(row=>row.dataset.state==='signal'));
        assert.match(await panel.innerText(),/Signal history/);
        assert(!/Histórico|Entrada|Saída|Saturação/.test(await panel.innerText()));
        await page.evaluate(()=>__signal.toggleDevicePower(__signal.appState.project.devices['history-amp']));
        await panel.scrollIntoViewIfNeeded();await panel.locator('summary').click();
        await page.waitForFunction(()=>document.querySelector('.signal-history-device [data-direction=out]')?.dataset.state==='silent');
        assert.equal(await panel.locator('.signal-history-device').first().locator('[data-direction=in]').getAttribute('data-state'),'signal','an unpowered amp still has an incoming signal');
        await page.evaluate(()=>__signal.toggleDevicePower(__signal.appState.project.devices['history-amp']));
        await panel.scrollIntoViewIfNeeded();await panel.locator('summary').click();
        // Attenuating a real incoming tone produces a low-level indication.
        await page.evaluate(()=>__signal.gain.gain.value=.003);
        await page.waitForFunction(()=>[...document.querySelectorAll('.signal-history-reading')].some(row=>row.dataset.state==='low'));
        await page.evaluate(()=>__signal.gain.gain.value=1.2);
        await page.waitForFunction(()=>[...document.querySelectorAll('.signal-history-reading')].some(row=>row.dataset.state==='high'));
        if(process.env.SIGNAL_HISTORY_SCREENSHOT)await page.screenshot({path:process.env.SIGNAL_HISTORY_SCREENSHOT});
        await page.evaluate(()=>__signal.gain.gain.value=0);
        await page.waitForFunction(()=>[...document.querySelectorAll('.signal-history-reading')].every(row=>['silent','unavailable'].includes(row.dataset.state)));
        await panel.locator('summary').click();
        await page.waitForFunction(()=>__signal.records.size===0);
        await panel.locator('summary').click();
        await page.waitForFunction(()=>__signal.records.size===2);
        await page.evaluate(()=>{__signal.tone.stop();__signal.deleteDevice(__signal.appState.project.devices['history-source'],false);});
        await page.waitForFunction(()=>__signal.records.size===1);
        await page.setViewportSize({width:390,height:844});
        await panel.scrollIntoViewIfNeeded();
        assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+2),'panel fits mobile width');
        await page.setViewportSize({width:1600,height:1100});
        const checked=await page.evaluate(()=>{
            const api=__signal;api.deleteDevice(api.appState.project.devices['history-amp'],false);let count=0;
            for(const type of Object.keys(api.names)){
                api.createDevice(type,100,100,'history-contract');
                const panel=document.getElementById('signal-history-panel');
                if(panel){if(panel.open||panel.nextElementSibling)throw Error(type+' history is not collapsed and last');panel.open=true;panel.scrollIntoView({block:'center'});api.updateSignalHistory(performance.now());if(!api.records.has('history-contract'))throw Error(type+' has no signal history');count++;}
                api.deleteDevice(api.appState.project.devices['history-contract'],false);
                if(api.records.size)throw Error(type+' leaked signal taps');
            }
            return count;
        });
        assert(checked>60,'shared history adapter covers all routable catalog models');
        assert.deepEqual(errors,[]);console.log(`Signal history: real levels, chain, power, translation, lifecycle and mobile layout passed; ${checked} catalog models checked.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
