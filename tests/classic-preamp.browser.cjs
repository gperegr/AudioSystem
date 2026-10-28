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
                assert(index>0);body=source.slice(0,index)+'window.__signal={restoreDeviceSettings,applySavedDevice,createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,createSpotifyVinyl,placeSpotifyVinyl,removeSpotifyVinyl,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(async()=>{
            const api=__signal;api.createDevice('preClassic',200,200,'classic-pre');
            const dev=api.appState.project.devices['classic-pre'];
            api.selectDevice(dev.id);if(!dev.powered)api.toggleDevicePower(dev);
            const preview=document.createElement('div');preview.className='equipment-preview-world';
            preview.style.cssText='position:fixed;left:310px;top:280px;width:800px;height:330px;z-index:100000;pointer-events:auto;background:#263133';document.body.appendChild(preview);
            preview.appendChild(dev.el);dev.el.style.left='20px';dev.el.style.top='20px';dev.el.style.transform='none';
        });
        const device=page.locator('#classic-pre');
        await device.screenshot({path:'/tmp/classic-preamp.png'});
        assert.equal(await device.locator('.port[data-io=in]').count(),8);
        assert.equal(await device.locator('.port[data-io=out]').count(),2);
        assert.equal(await device.locator('.port[data-signal=phono]').count(),2);
        for(const selector of ['[data-pre-rotary]','[data-integrated-knob=volume]','[data-integrated-knob=balance]','[data-classic-knob=classicMode]','[data-classic-knob=classicBassL]','[data-classic-knob=classicBassR]','[data-classic-knob=classicTrebleL]','[data-classic-knob=classicTrebleR]']){
            const knob=device.locator(selector);await knob.focus();const previous=Number(await knob.getAttribute('aria-valuenow'));await page.keyboard.press('ArrowUp');
            assert(Number(await knob.getAttribute('aria-valuenow'))>previous,selector+' responds to keyboard');
        }
        for(const selector of ['[data-classic-toggle=classicMonitor]','[data-classic-toggle=classicLowCut]','[data-classic-toggle=classicHighCut]','[data-integrated-direct]']){
            const button=device.locator(selector);await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');await button.click();
        }
        await device.locator('.power-btn').click();assert.equal(await device.locator('.power-btn').getAttribute('aria-checked'),'false');
        await device.locator('.power-btn').click();assert.equal(await device.locator('.power-btn').getAttribute('aria-checked'),'true');
        const levels=await page.evaluate(async()=>{
            const api=__signal,dev=api.appState.project.devices['classic-pre'],ctx=api.appState.audio.context;
            await ctx.resume();Object.assign(dev.state,{volume:.8,balance:0,direct:false,integratedSource:0,classicMode:2,classicBassL:0,classicBassR:0,classicTrebleL:0,classicTrebleR:0});dev.applyIntegrated();
            const oscillators=[],analyzers=[];const silent=ctx.createGain();silent.gain.value=0;silent.connect(ctx.destination);
            for(const [i,ch]of ['L','R'].entries()){
                const osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=i?880:440;gain.gain.value=i?.02:.04;osc.connect(gain);gain.connect(dev.nodes['line0'+ch]);osc.start();oscillators.push({osc,gain});
                const analyzer=ctx.createAnalyser();analyzer.fftSize=2048;dev.nodes['pre'+ch].connect(analyzer);analyzer.connect(silent);analyzers.push(analyzer);
            }
            const sample=async()=>{await new Promise(r=>setTimeout(r,360));return analyzers.map(a=>{const values=new Float32Array(a.fftSize);a.getFloatTimeDomainData(values);return Math.sqrt(values.reduce((sum,n)=>sum+n*n,0)/values.length);});};
            const stereo=await sample();dev.setClassicPreamp('classicMode',3);const reversed=await sample();dev.setClassicPreamp('classicMode',0);const left=await sample();dev.setClassicPreamp('classicMode',4);const right=await sample();dev.setClassicPreamp('classicMode',1);const mono=await sample();
            dev.state.balance=1;dev.applyIntegrated();const balanced=await sample();if(balanced[0]>.00001||balanced[1]<.005)throw Error('Output balance in mono mode');dev.state.balance=0;dev.applyIntegrated();
            dev.state.preMuted=true;dev.applyIntegrated();const muted=await sample();if(muted.some(n=>n>.00001))throw Error('Mute');dev.state.preMuted=false;dev.applyIntegrated();
            dev.setClassicPreamp('classicBassL',8);dev.setClassicPreamp('classicTrebleR',-6);if(document.querySelector('[data-classic-setting=classicBassL]').value!=='8')throw Error('Sidebar not synchronized');await sample();
            if(Math.abs(dev.integratedFilters[0].bass.gain.value-8)>.05||Math.abs(dev.integratedFilters[1].bass.gain.value)>.05||Math.abs(dev.integratedFilters[1].treble.gain.value+6)>.05)throw Error('Independent tone controls');
            dev.state.direct=true;dev.applyIntegrated();await sample();if(dev.integratedFilters.some(f=>Math.abs(f.bass.gain.value)>.05||Math.abs(f.treble.gain.value)>.05))throw Error('Tone bypass');
            dev.setClassicPreamp('classicLowCut',true);dev.setClassicPreamp('classicHighCut',true);await sample();if(Math.abs(dev.classicFilters[0].highpass.frequency.value-35)>.05||Math.abs(dev.classicFilters[1].lowpass.frequency.value-7000)>1)throw Error('Filters');
            dev.setClassicPreamp('classicMonitor',true);const monitor=await sample();if(dev.state.integratedSource!==0)throw Error('Monitor moved selector');
            dev.setClassicPreamp('classicMonitor',false);api.toggleDevicePower(dev);const off=await sample();
            const settings=JSON.parse(JSON.stringify(dev.state));api.applySavedDevice(dev,{settings});if(dev.state.classicBassL!==8||dev.state.classicTrebleR!==-6||!dev.state.classicLowCut||dev.state.classicMode!==1)throw Error('Saved settings restore');
            await api.restoreDeviceSettings(dev);if(dev.state.classicMode!==2||dev.state.classicBassL!==0||dev.state.classicMonitor||dev.state.classicLowCut||dev.state.classicHighCut)throw Error('Factory settings restore');
            oscillators.forEach(({osc,gain})=>{osc.stop();osc.disconnect();gain.disconnect();});analyzers.forEach(a=>a.disconnect());silent.disconnect();
            return {stereo,reversed,left,right,mono,monitor,off};
        });
        const near=(a,b)=>Math.abs(a-b)<Math.max(a,b)*.08;
        assert(levels.stereo[0]>.005&&levels.stereo[1]>.003,'real signal passes');
        assert(near(levels.stereo[0],levels.reversed[1])&&near(levels.stereo[1],levels.reversed[0]),'channel reversal');
        for(const mode of ['left','right','mono'])assert(near(...levels[mode]),mode+' reaches both outputs');
        assert(levels.left[0]>levels.right[0]*1.8,'channel-only modes use correct input');
        assert(levels.monitor.every(n=>n<.00001),'tape monitor selects unconnected tape input');assert(levels.off.every(n=>n<.00001),'power off silences output');
        await page.evaluate(()=>{AudioSystemLanguage.set('en');__signal.selectDevice('classic-pre');});
        assert.equal(await page.locator('[data-classic-setting=classicMode] option:checked').textContent(),'Stereo');
        const geometry=await device.evaluate(el=>{const base=el.getBoundingClientRect();return [...el.querySelectorAll('.classic-preamp-panel button,.classic-preamp-connections .port')].filter(n=>n.getClientRects().length).map(n=>{const r=n.getBoundingClientRect();return {label:n.getAttribute('aria-label')||n.title,x:r.x-base.x,y:r.y-base.y,right:r.right-base.x,bottom:r.bottom-base.y};});});
        for(const r of geometry)assert(r.x>=0&&r.y>=0&&r.right<=760&&r.bottom<=286,'control stays inside chassis: '+r.label);
        for(let i=0;i<geometry.length;i++)for(let j=i+1;j<geometry.length;j++){const a=geometry[i],b=geometry[j];assert(!(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1),'controls overlap: '+a.label+' / '+b.label);}
        await page.evaluate(()=>__signal.deleteDevice(__signal.appState.project.devices['classic-pre'],false));
        assert.deepEqual(errors,[]);console.log('Classic preamp: real stereo audio, five channel modes, independent tones, filters, monitor, power, controls, saved settings, translation and geometry passed.',levels);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
