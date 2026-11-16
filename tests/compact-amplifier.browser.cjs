const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const {page,errors}=await require('./helpers/equipment-page.cjs')(browser);
        await page.evaluate(async()=>{
            const api=__equipment;
            for(const [type,id]of [['integratedCompact','compact-amp'],['cdPlayer','aux-source'],['cdPlayer','bt-source'],['btTransmitterPro','compact-tx'],['shelfRadiator','compact-left'],['shelfRadiator','compact-right']])api.createDevice(type,200,200,id);
            const devices=api.appState.project.devices,amp=devices['compact-amp'],tx=devices['compact-tx'];
            const host=document.createElement('div');host.className='equipment-preview-world';host.style.cssText='position:fixed;left:330px;top:250px;width:800px;height:430px;z-index:100000;pointer-events:auto;background:#283133';document.body.appendChild(host);
            for(const [d,x,y]of [[amp,20,80],[tx,200,250]]){host.appendChild(d.el);Object.assign(d.el.style,{left:x+'px',top:y+'px',transform:'none'});}
            api.connectProjectPorts(devices['aux-source'],'outL',amp,'line0L');api.connectProjectPorts(devices['aux-source'],'outR',amp,'line0R');
            api.connectProjectPorts(devices['bt-source'],'outL',tx,'inL');api.connectProjectPorts(devices['bt-source'],'outR',tx,'inR');
            api.connectProjectPorts(amp,'speakerL',devices['compact-left'],'in');api.connectProjectPorts(amp,'speakerR',devices['compact-right'],'in');
            const ctx=api.appState.audio.context;await ctx.resume();
            for(const [id,frequencies]of [['aux-source',[440,880]],['bt-source',[1100,2200]]]){
                const d=devices[id];d.audioBuffer=ctx.createBuffer(2,ctx.sampleRate,ctx.sampleRate);d.state.repeat=true;
                for(let ch=0;ch<2;ch++){const samples=d.audioBuffer.getChannelData(ch);for(let i=0;i<samples.length;i++)samples[i]=.02*Math.sin(i/ctx.sampleRate*frequencies[ch]*2*Math.PI);}
            }
            window.__compactProbes=['L','R'].map(ch=>{const analyser=ctx.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=0;amp.nodes['speaker'+ch].connect(analyser);return analyser;});
            await api.setSourcePlaying(devices['aux-source'],true);api.selectDevice(amp.id);
        });
        const amp=page.locator('#compact-amp');
        const contract=await amp.evaluate(el=>({width:el.offsetWidth,height:el.offsetHeight,chassis:el.dataset.chassis,model:el.dataset.model,inputs:el.querySelectorAll('.port[data-io="in"]').length,outputs:el.querySelectorAll('.port[data-io="out"]').length,knobs:el.querySelectorAll('[data-integrated-knob]').length}));
        assert.deepEqual(contract,{width:760,height:120,chassis:'low',model:'NX-I20',inputs:2,outputs:2,knobs:3});
        const geometry=await amp.evaluate(el=>{const base=el.getBoundingClientRect();return [...el.querySelectorAll('button,.port')].map(control=>{const r=control.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {label:control.getAttribute('aria-label'),inside:r.left>=base.left&&r.right<=base.right&&r.top>=base.top&&r.bottom<=base.bottom,clickable:!!hit&&control.contains(hit)};});});
        assert(geometry.every(control=>control.inside&&control.clickable),JSON.stringify(geometry));
        assert.equal(await amp.locator('.power-btn > .hw-chrome-collar').count(),1,'lever is mounted directly without a second button face');
        assert.equal(await amp.locator('.power-btn .hw-plunger-face,.power-btn .power-rocker-face').count(),0);
        assert(await amp.evaluate(el=>{const text=el.querySelector('.compact-engraving').getBoundingClientRect(),knob=el.querySelector('[data-integrated-knob="bass"]').getBoundingClientRect();return Math.abs((text.left+text.right-knob.left-knob.right)/2)<.5;}),'engraving is centered over the middle knob');
        assert(await amp.evaluate(el=>{const antenna=el.querySelector('.compact-antenna'),body=el.querySelector('.compact-amp-face');return Number(getComputedStyle(antenna).zIndex)<Number(getComputedStyle(body).zIndex)&&getComputedStyle(antenna).pointerEvents==='none';}),'antenna remains behind the chassis without covering controls');
        const leverOn=await amp.locator('.hw-chrome-stem').evaluate(el=>getComputedStyle(el).transform);

        const probe=()=>page.evaluate(async()=>{await new Promise(resolve=>setTimeout(resolve,320));return __compactProbes.map(analyser=>{const samples=new Float32Array(analyser.fftSize),bins=new Float32Array(analyser.frequencyBinCount);analyser.getFloatTimeDomainData(samples);analyser.getFloatFrequencyData(bins);let peak=0;for(let i=1;i<bins.length;i++)if(bins[i]>bins[peak])peak=i;return {rms:Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length),frequency:peak*__equipment.appState.audio.context.sampleRate/analyser.fftSize};});});
        const aux=await probe();assert(aux.every(ch=>ch.rms>1e-4),'real RCA playback reaches both speaker outputs');assert(Math.abs(aux[0].frequency-440)<30);assert(Math.abs(aux[1].frequency-880)<30);
        await amp.locator('[data-integrated-knob="volume"]').focus();await page.keyboard.press('Home');
        assert((await probe()).every(ch=>ch.rms<1e-6),'volume zero silences both channels');
        await page.keyboard.press('End');const full=await probe();assert(full[0].rms>aux[0].rms*2.5,'volume knob changes actual output gain');
        for(const key of ['bass','treble']){await amp.locator(`[data-integrated-knob="${key}"]`).focus();await page.keyboard.press('End');}
        const tones=await page.evaluate(async()=>{await new Promise(resolve=>setTimeout(resolve,200));const d=__equipment.appState.project.devices['compact-amp'];return d.integratedFilters.map(({bass,treble})=>[bass.gain.value,treble.gain.value]);});
        assert(tones.every(([bass,treble])=>bass>9.9&&treble>9.9),'both tone knobs affect both real channel filters');
        await amp.locator('.power-btn').click();assert((await probe()).every(ch=>ch.rms<1e-6),'power switch gates audio');
        assert.equal(await amp.locator('.power-btn').getAttribute('aria-checked'),'false');
        assert.notEqual(await amp.locator('.hw-chrome-stem').evaluate(el=>getComputedStyle(el).transform),leverOn,'on/off lever articulates between two positions');
        await amp.locator('.power-btn').click();assert((await probe()).every(ch=>ch.rms>1e-4));
        await page.evaluate(()=>{const d=__equipment.appState.project.devices['compact-amp'];Object.assign(d.state,{volume:.3,bass:0,treble:0});d.applyIntegrated();});
        await amp.locator('.btn-bt-pair').click();assert.equal(await amp.locator('.btn-bt-pair').getAttribute('data-pairing'),'search');
        await amp.locator('.power-btn').click();assert.equal(await amp.locator('.btn-bt-pair').getAttribute('data-pairing'),'idle','power off cancels a pending pairing search');
        await amp.locator('.power-btn').click();await amp.locator('.btn-bt-pair').click();
        await amp.locator('.btn-bt-pair').click();assert.equal(await amp.locator('.btn-bt-pair').getAttribute('data-pairing'),'idle','pairing can be cancelled');
        await amp.locator('.btn-bt-pair').click();await page.locator('#compact-tx .btn-bt-pair').click();
        assert.equal(await amp.getAttribute('data-compact-input'),'bt');
        assert((await probe()).every(ch=>ch.rms<1e-6),'paired Bluetooth takes priority even when its source is paused');
        await page.evaluate(()=>__equipment.setSourcePlaying(__equipment.appState.project.devices['bt-source'],true));
        const bluetooth=await probe();assert(bluetooth.every(ch=>ch.rms>1e-4));assert(Math.abs(bluetooth[0].frequency-1100)<30);assert(Math.abs(bluetooth[1].frequency-2200)<30,'Bluetooth preserves stereo channels');
        await amp.locator('.power-btn').click();assert((await probe()).every(ch=>ch.rms<1e-6),'power off gates an active Bluetooth stream');
        assert(await amp.locator('.btn-bt-pair').isDisabled(),'powered-off receiver does not offer pairing');
        await amp.locator('.power-btn').click();assert(Math.abs((await probe())[0].frequency-1100)<30,'Bluetooth resumes with its original pairing after power on');

        assert(await page.evaluate(()=>['compact-left','compact-right'].every(id=>__equipment.appState.project.devices[id].el.classList.contains('device-has-signal'))),'wireless signal propagates through the amplifier to wired speakers');
        await page.locator('#compact-tx .power-btn').click();assert.equal(await amp.getAttribute('data-compact-input'),'aux');assert(Math.abs((await probe())[0].frequency-440)<30,'sender power off returns to RCA');
        await page.locator('#compact-tx .power-btn').click();assert.equal(await amp.getAttribute('data-compact-input'),'bt');
        await page.locator('#inspector-content [data-compact-pair]').click();assert.equal(await amp.getAttribute('data-compact-input'),'aux');
        assert(Math.abs((await probe())[1].frequency-880)<30,'disconnect restores RCA without channel mixing');
        // Reconnect and save: pairing, knobs and power restore without autoplay.
        await page.locator('#inspector-content [data-compact-pair]').click();await page.locator('#compact-tx .btn-bt-pair').click();
        await page.evaluate(async()=>{const api=__equipment,d=api.appState.project.devices['compact-amp'];Object.assign(d.state,{volume:.6,bass:4,treble:-2});d.applyIntegrated();api.toggleDevicePower(d);const snapshot=api.projectCapture();await api.restoreLocalProject(snapshot);});
        const saved=await page.evaluate(()=>{const devices=Object.values(__equipment.appState.project.devices),d=devices.find(d=>d.type==='integratedCompact');window.__restoredCompactId=d.id;return {volume:d.state.volume,bass:d.state.bass,treble:d.state.treble,powered:d.powered,paired:!!d.btPairedId,playing:devices.some(d=>d.state.playing)};});
        assert.deepEqual(saved,{volume:.6,bass:4,treble:-2,powered:false,paired:true,playing:false});
        await page.evaluate(async()=>{const api=__equipment,d=api.appState.project.devices[__restoredCompactId];api.toggleDevicePower(d);api.selectDevice(d.id);await api.restoreDeviceSettings(d);});
        assert.deepEqual(await page.evaluate(()=>{const s=__equipment.appState.project.devices[__restoredCompactId].state;return [s.volume,s.bass,s.treble];}),[.3,0,0]);
        await page.evaluate(()=>{const api=__equipment,tx=Object.values(api.appState.project.devices).find(d=>d.type==='btTransmitterPro');api.deleteDevice(tx,false);AudioSystemLanguage.set('en');api.selectDevice(__restoredCompactId);});
        await page.waitForFunction(()=>document.querySelector('#inspector-content [data-compact-pair]').textContent==='Pair Bluetooth');
        const restored=page.locator('.device-type-integratedCompact');
        assert.equal(await restored.getAttribute('data-compact-input'),'aux','removing a paired sender restores RCA');
        await page.evaluate(()=>{const d=__equipment.appState.project.devices[__restoredCompactId],host=document.querySelector('.equipment-preview-world');host.appendChild(d.el);Object.assign(d.el.style,{left:'20px',top:'80px',transform:'none'});});
        await page.screenshot({path:'/tmp/nx-i20-amplifier.png',clip:{x:350,y:250,width:760,height:210}});
        // The extended receiver set must preserve the existing headphone path.
        await page.evaluate(async()=>{
            const api=__equipment;api.createDevice('btTransmitterPro',0,0,'regression-tx');api.createDevice('hpStudio',0,0,'regression-hp');
            const tx=api.appState.project.devices['regression-tx'],hp=api.appState.project.devices['regression-hp'],amp=api.appState.project.devices[__restoredCompactId];
            if(!api.canPair(tx,hp)||api.canPair(amp,hp))throw Error('pairing compatibility');
            tx.el.querySelector('.btn-bt-pair').click();hp.el.querySelector('.btn-bt-pair').click();
            if(tx.btPairedId!==hp.id||hp.btPairedId!==tx.id)throw Error('headphone pairing');
            const ctx=api.appState.audio.context,osc=ctx.createOscillator(),analyser=ctx.createAnalyser();osc.frequency.value=330;osc.connect(tx.nodes.inL);hp.nodes.in.connect(analyser);osc.start();
            await new Promise(resolve=>setTimeout(resolve,100));const data=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(data);
            if(!data.some(value=>Math.abs(value)>.01))throw Error('headphone audio path');
            hp.el.querySelector('.btn-bt-pair').click();if(tx.btPairedId||hp.btPairedId)throw Error('headphone disconnect');osc.stop();osc.disconnect();analyser.disconnect();
        });
        await page.evaluate(()=>Object.values(__equipment.appState.project.devices).forEach(d=>__equipment.deleteDevice(d,false)));
        assert.deepEqual(errors,[]);console.log('NX-I20: 760×120 low chassis, all front targets, stereo RCA and Bluetooth audio, three knobs, power, priority, cancellation, speaker propagation, restoration, translation, sender removal and disposal passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
