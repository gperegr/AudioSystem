const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const {page,errors}=await require('./helpers/equipment-page.cjs')(browser);
        await page.evaluate(()=>{
            const api=__equipment;api.createDevice('turntableAutomatic',200,200,'auto-deck');const dev=api.appState.project.devices['auto-deck'];
            const preview=document.createElement('div');preview.className='equipment-preview-world';preview.style.cssText='position:fixed;left:350px;top:300px;width:650px;height:300px;z-index:100000;pointer-events:auto;background:#263133';document.body.appendChild(preview);preview.appendChild(dev.el);dev.el.style.left='30px';dev.el.style.top='30px';dev.el.style.transform='none';
            const ctx=api.appState.audio.context;dev.audioBuffer=ctx.createBuffer(2,ctx.sampleRate*8,ctx.sampleRate);
            for(let ch=0;ch<2;ch++){const data=dev.audioBuffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=(ch===0?.1:.05)*Math.sin(i/ctx.sampleRate*(ch===0?440:880)*Math.PI*2);}
        });
        const deck=page.locator('#auto-deck');
        assert.equal(await deck.locator('.power-btn,[data-tt="pitch"]').count(),0,'no invented power or pitch controls');
        assert.equal(await deck.locator('.port[data-io="out"]').count(),1);
        assert.equal(await deck.locator('.port[data-type="p2"][data-node="outStereo"]').count(),1);
        assert.equal(await deck.getAttribute('data-model'),'NX-T60');
        assert(await deck.locator('[data-auto-size]').evaluate(button=>{const a=button.getBoundingClientRect(),b=button.closest('.device-node').getBoundingClientRect();return a.left>=b.left&&a.right<=b.right&&a.top>=b.top&&a.bottom<=b.bottom;}),'size selector stays on the chassis after hardware skinning');
        assert(await deck.locator('[data-auto-size]').evaluate(button=>{const size=button.getBoundingClientRect(),rpm=button.closest('.at-controls')?.querySelector('[data-auto-speed]').getBoundingClientRect();return !!rpm&&size.left>rpm.right&&size.left-rpm.right<=20&&Math.abs(size.top-rpm.top)<1;}),'record-size selector sits beside RPM on the front fascia');
        assert(await deck.locator('.auto-format-controls button').evaluateAll(buttons=>buttons.length===2&&buttons.every(button=>{const s=getComputedStyle(button);return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.borderTopWidth==='0px'&&s.boxShadow==='none';})),'both left keys have no surrounding background or frame');
        const keys=await deck.locator('.at-controls button').evaluateAll(buttons=>buttons.map(button=>{const r=button.getBoundingClientRect(),s=getComputedStyle(button.querySelector('.hw-plunger-legend'));return [r.width,r.height,r.top,s.fontSize];}));
        assert.equal(keys.length,5);assert(keys.every(key=>key.every((value,i)=>value===keys[0][i])),'all five keys share dimensions, baseline and typography');
        assert.equal(await deck.locator('.auto-drive-caption').count(),0);
        assert.equal(await deck.locator('[data-auto-start]').getAttribute('data-button-action'),'momentary');
        assert.equal(await deck.locator('[data-auto-stop]').getAttribute('data-button-action'),'momentary');
        assert.deepEqual(await deck.locator('[data-tt="output"]').evaluate(button=>{const s=getComputedStyle(button);return [s.backgroundColor,s.borderTopWidth,s.boxShadow];}),['rgba(0, 0, 0, 0)','0px','none']);
        // Idle cueing never starts the motor, and moves vertically without a jump.
        await deck.locator('[data-auto-lift]').click();await page.waitForTimeout(100);
        assert(await page.evaluate(()=>{const d=__equipment.appState.project.devices['auto-deck'];return d.automatic.lift>0&&d.automatic.lift<1&&!d.state.playing&&!d.state.tt.running;}));
        await deck.locator('[data-auto-lift]').click();
        // STOP invalidates an asynchronous START before browser activation resolves.
        await page.evaluate(async()=>{const d=__equipment.appState.project.devices['auto-deck'],ctx=__equipment.appState.audio.context,resume=ctx.resume.bind(ctx);let release;ctx.resume=()=>new Promise(resolve=>release=resolve);try{const pending=d.autoStart();d.autoStop();release();await pending;if(d.automatic.phase!=='idle'||d.state.playing)throw Error('Cancelled START resumed');}finally{ctx.resume=resume;}});
        await deck.locator('[data-auto-start]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].automatic.phase==='preparing');
        await deck.locator('[data-auto-lift]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].automatic.phase==='raised');
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].state.playing),false,'cue during automatic travel holds the needle raised');
        await deck.locator('[data-auto-lift]').click();await page.waitForTimeout(100);
        await deck.locator('[data-auto-lift]').click();await page.waitForTimeout(500);
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].state.playing),false,'interrupting descent cannot start delayed audio');
        await deck.locator('[data-auto-lift]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].state.playing);
        await deck.locator('[data-auto-stop]').click();
        await page.evaluate(()=>{const d=__equipment.appState.project.devices['auto-deck'],deadline=d.automatic.deadline;d.autoStop();d.autoStop();if(deadline!==d.automatic.deadline)throw Error('Repeated STOP restarted the return');if(d.state.playing||d.filePlayback)throw Error('STOP did not mute immediately');});
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].automatic.phase==='idle');
        await deck.locator('[data-auto-start]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].state.playing);
        assert(await page.evaluate(()=>!!__equipment.appState.project.devices['auto-deck'].filePlayback),'real local audio starts after arm travel');
        const stereo=await page.evaluate(async()=>{const d=__equipment.appState.project.devices['auto-deck'],ctx=__equipment.appState.audio.context,split=ctx.createChannelSplitter(2),sink=ctx.createGain();sink.gain.value=0;sink.connect(ctx.destination);d.nodes.outStereo.connect(split);const probes=[0,1].map(ch=>{const a=ctx.createAnalyser();split.connect(a,ch);a.connect(sink);return a;});await new Promise(resolve=>setTimeout(resolve,150));const rms=probes.map(a=>{const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length);});split.disconnect();probes.forEach(a=>a.disconnect());sink.disconnect();return rms;});
        assert(stereo[0]>1e-4&&stereo[0]>stereo[1]*1.8,'P2 preserves independent left and right audio channels');

        await deck.locator('[data-auto-speed]').click();
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].filePlayback.rate),1.35);
        await deck.locator('[data-auto-lift]').click();
        assert.deepEqual(await page.evaluate(()=>{const d=__equipment.appState.project.devices['auto-deck'];return [d.state.playing,d.state.tt.running,!!d.filePlayback];}),[false,true,false],'cue lift mutes playback but keeps the motor running');
        await deck.locator('[data-auto-lift]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].state.playing);
        await deck.locator('[data-auto-stop]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].automatic.phase==='idle');
        assert.deepEqual(await page.evaluate(()=>{const d=__equipment.appState.project.devices['auto-deck'];return [d.state.tt.running,d.fileOffset,d.automatic.arm];}),[false,0,0]);
        await deck.locator('[data-auto-size]').click();
        assert.deepEqual(await page.evaluate(()=>{const t=__equipment.appState.project.devices['auto-deck'].state.tt;return [t.size,t.speed];}),[7,45],'size and speed are independent selectors');
        await page.evaluate(()=>{const d=__equipment.appState.project.devices['auto-deck'];d.ttSetOutput('phono');if(d.state.tt.output!=='phono')throw Error('PHONO');d.ttSetOutput('line');d.autoSetSpeed(33);d.fileOffset=d.audioBuffer.duration-.2;d.automatic.phase='raised';d.autoStart();});
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].state.playing);
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].automatic.phase==='idle');
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].state.playing),false,'track end returns the arm and stops');
        await page.evaluate(async()=>{
            const api=__equipment,d=api.appState.project.devices['auto-deck'];
            await d.autoStart();d.autoStop();
            api.toggleDevicePower(d);await d.autoStart();if(d.state.playing)throw Error('power off');api.toggleDevicePower(d);
            api.applySavedDevice(d,{settings:{tt:{speed:45,size:7,pitch:.8,output:'phono',running:true},lidOpen:true}});
            if(d.state.playing||d.state.tt.running||d.state.tt.pitch!==0||d.state.tt.speed!==45||d.state.tt.size!==7||d.state.tt.output!=='phono'||!d.state.lidOpen)throw Error('restore');
            const vinyl=api.createSpotifyVinyl({uri:'spotify:album:AutomaticTest',name:'Test record'});
            if(!api.placeSpotifyVinyl(vinyl,d,false))throw Error('record placement');api.removeSpotifyVinyl(vinyl,false);
            d.autoSetSize(12);d.ttSetOutput('line');d.setLidOpen(false);AudioSystemLanguage.set('en');api.selectDevice(d.id);
        });
        await deck.screenshot({path:'/tmp/automatic-deck.png'});
        await require('./turntable-geometry.helpers.cjs')(page,deck,'automatic');
        await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].setLidOpen(true));
        assert(await deck.evaluate(el=>Number(getComputedStyle(el.querySelector('.at-lid-scene')).zIndex)<Number(getComputedStyle(el.querySelector('.at-plinth'),'::before').zIndex)),'open cover stays behind the chassis and controls');
        await page.emulateMedia({reducedMotion:'reduce'});
        const freezeLighting=await page.addStyleTag({content:'#auto-deck{filter:none!important}'});
        const panelWithCover=await deck.locator('.at-controls').screenshot();
        await deck.locator('.at-lid-scene').evaluate(el=>el.style.visibility='hidden');
        const panelWithoutCover=await deck.locator('.at-controls').screenshot();
        const maxPixelDifference=await page.evaluate(async images=>{
            const pixels=await Promise.all(images.map(async data=>{const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),bitmap=await createImageBitmap(new Blob([bytes],{type:'image/png'})),canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);const result=ctx.getImageData(0,0,bitmap.width,bitmap.height).data;bitmap.close();return result;}));
            let max=0;for(let i=0;i<pixels[0].length;i++)max=Math.max(max,Math.abs(pixels[0][i]-pixels[1][i]));return max;
        },[panelWithCover.toString('base64'),panelWithoutCover.toString('base64')]);
        // Permit only subpixel rasterization rounding, never acrylic borders or tint.
        assert(maxPixelDifference<=2,'open cover must not paint over the front panel');
        await freezeLighting.evaluate(el=>el.remove());
        await deck.locator('.at-lid-scene').evaluate(el=>el.style.removeProperty('visibility'));
        assert(await deck.locator('.auto-adapter').evaluate(el=>{const base=el.closest('.at-deck').getBoundingClientRect(),r=el.getBoundingClientRect();return Math.abs(r.bottom-(base.bottom-6))<1;}),'45 rpm adapter rests on the deck surface');
        await page.evaluate(()=>__equipment.appState.project.devices['auto-deck'].setLidOpen(false));
        await page.emulateMedia({reducedMotion:'reduce'});
        await deck.locator('[data-auto-start]').click();
        await page.waitForFunction(()=>__equipment.appState.project.devices['auto-deck'].state.playing);
        await page.evaluate(()=>__equipment.deleteDevice(__equipment.appState.project.devices['auto-deck'],false));
        assert.deepEqual(errors,[]);
        console.log('Automatic turntable: local audio, cue lift, speed/size, auto-return, cancellation, power, output, saved settings, Spotify placement, cover geometry, reduced motion and cleanup passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
