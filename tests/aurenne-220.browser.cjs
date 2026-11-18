const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
    const browser=await chromium.launch({
        executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',
        headless:true,
        args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'],
    });
    try{
        const {page,errors}=await require('./helpers/equipment-page.cjs')(browser);
        await page.evaluate(async()=>{
            const api=__equipment,devices=api.appState.project.devices;
            api.createDevice('preAurenne220',200,100,'p220');
            api.createDevice('powerAurenne220',200,360,'r220');
            api.createDevice('cdPlayer',1000,100,'program');
            api.createDevice('cdPlayer',1000,300,'monitor');
            api.createDevice('spkPassiveWood',1000,500,'speakerA');
            api.createDevice('spkPassiveWood',1400,500,'speakerB');
            const {p220,r220}=devices;
            window.footCount=document.querySelectorAll('[data-foot-owner="p220"]').length;
            const host=document.createElement('div');
            host.className='equipment-preview-world';
            host.style.cssText='position:fixed;left:350px;top:125px;width:800px;height:550px;z-index:100000;pointer-events:auto;background:#283133';
            document.body.append(host);
            for(const [dev,y] of [[p220,15],[r220,275]]){
                host.append(dev.el);
                Object.assign(dev.el.style,{left:'20px',top:y+'px',transform:'none'});
            }
            const ctx=api.appState.audio.context;
            await ctx.resume();
            const recording=(frequencies,seconds=1)=>{
                const buffer=ctx.createBuffer(2,seconds*ctx.sampleRate,ctx.sampleRate);
                frequencies.forEach((frequency,channel)=>{
                    const samples=buffer.getChannelData(channel);
                    for(let i=0;i<samples.length;i++)samples[i]=.08*Math.sin(i/ctx.sampleRate*2*Math.PI*frequency);
                });
                return buffer;
            };
            for(const [source,frequencies,prefix] of [['program',[440,880],'aux'],['monitor',[1100,2200],'tape1']]){
                devices[source].audioBuffer=recording(frequencies);
                devices[source].state.repeat=true;
                for(const channel of ['L','R'])api.connectProjectPorts(devices[source],'out'+channel,p220,prefix+channel);
                await api.setSourcePlaying(devices[source],true);
            }
            for(const channel of ['L','R'])api.connectProjectPorts(p220,'pre'+channel,r220,'in'+channel);
            api.connectProjectPorts(r220,'speakerAL',devices.speakerA,'in');
            api.connectProjectPorts(r220,'speakerBL',devices.speakerB,'in');
            window.probes={};
            for(const [dev,names] of [[p220,['preL','preR','rec1L','outPhone2']],[r220,['speakerAL','speakerAR','speakerBL']]]){
                for(const name of names){
                    const analyzer=ctx.createAnalyser();
                    analyzer.fftSize=4096;
                    analyzer.smoothingTimeConstant=0;
                    dev.nodes[name].connect(analyzer);
                    probes[name]=analyzer;
                }
            }
            api.selectDevice('p220',true);
        });

        await page.screenshot({path:'/tmp/aurenne-220-live.png',clip:{x:350,y:125,width:800,height:550}});
        assert.equal(await page.evaluate(()=>footCount),2,'the upper chassis gets the shared pair of automatic feet');
        for(const [id,model] of [['p220','P-220'],['r220','R-220']]){
            assert.deepEqual(await page.locator('#'+id).evaluate(el=>[el.offsetWidth,el.offsetHeight,el.dataset.chassis,el.dataset.model]),[760,240,'high',model]);
            const inaccessible=await page.locator('#'+id).evaluate(el=>[...el.querySelectorAll('button,.port')].filter(control=>{
                const r=control.getBoundingClientRect();
                return !control.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));
            }).map(control=>control.getAttribute('aria-label')));
            assert.deepEqual(inaccessible,[],model+' front controls and jacks are reachable');
        }
        assert.equal(await page.locator('[data-template="preAurenne220"]').count(),1);
        assert.equal(await page.locator('[data-template="powerAurenne220"]').count(),1);

        const measure=()=>page.evaluate(async()=>{
            await new Promise(resolve=>setTimeout(resolve,200));
            const context=__equipment.appState.audio.context;
            return Object.fromEntries(Object.entries(probes).map(([name,analyzer])=>{
                const bins=new Float32Array(analyzer.frequencyBinCount),samples=new Float32Array(analyzer.fftSize);
                analyzer.getFloatFrequencyData(bins);
                analyzer.getFloatTimeDomainData(samples);
                let peak=0;
                for(let i=1;i<bins.length;i++)if(bins[i]>bins[peak])peak=i;
                return [name,{frequency:peak*context.sampleRate/analyzer.fftSize,rms:Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length)}];
            }));
        });
        const near=(actual,expected)=>assert(Math.abs(actual-expected)<16,`expected ${expected} Hz, got ${actual} Hz`);
        const signal=await measure();
        near(signal.speakerAL.frequency,440);
        near(signal.speakerAR.frequency,880);
        assert(signal.outPhone2.rms>.001);
        assert(signal.speakerBL.rms<.00001);
        await page.locator('#p220 [data-aurenne-switch="muted"]').click();
        const muted=await measure();
        assert(Math.abs(muted.preL.rms/signal.preL.rms-.1)<.015,'20 dB muting changes listening gain');
        assert(Math.abs(muted.rec1L.rms/signal.rec1L.rms-1)<.04,'tape record is independent of the listening controls');
        await page.locator('#p220 [data-aurenne-switch="muted"]').click();
        await page.locator('#p220 [data-aurenne-switch="monitor"]').click();
        const tape=await measure();
        near(tape.preL.frequency,1100);
        near(tape.preR.frequency,2200);
        near(tape.rec1L.frequency,440);
        await page.locator('#p220 [data-aurenne-switch="mono"]').click();
        const mono=await measure();
        assert(Math.abs(mono.preL.rms-mono.preR.rms)<.0004);
        await page.locator('#p220 [data-aurenne-switch="mono"]').click();
        await page.locator('#p220 [data-aurenne-knob="treble"]').focus();
        await page.keyboard.press('End');
        const boosted=await measure();
        await page.locator('#p220 [data-aurenne-switch="tone"]').click();
        const bypass=await measure();
        assert(boosted.preR.rms>bypass.preR.rms*1.15,'the tone control reaches the audio graph');
        await page.locator('#p220 [data-aurenne-switch="highFilter"]').click();
        assert((await measure()).preR.rms<bypass.preR.rms*.9,'the first-order 3 kHz filter changes the signal');
        await page.locator('#p220 [data-aurenne-switch="highFilter"]').click();

        await page.locator('#r220 [data-aurenne-switch="speakerB"]').click();
        const protected=await measure();
        assert(protected.speakerAL.rms<.00001&&protected.speakerBL.rms<.00001);
        near(protected.speakerAR.frequency,2200);
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices.r220.channelLoads.L),4);
        await page.locator('#r220 [data-aurenne-switch="speakerA"]').click();
        const alternate=await measure();
        near(alternate.speakerBL.frequency,1100);
        assert(alternate.speakerAL.rms<.00001);
        assert.equal(await page.evaluate(()=>__equipment.appState.project.devices.r220.channelLoads.L),8);

        await page.evaluate(()=>{
            const api=__equipment;
            api.selectDevice('p220',true);
            Object.assign(api.appState.project.devices.p220.state.aurenne220,{monitor:0});
        });
        const source=page.locator('[data-p220-source]');
        await source.selectOption('1',{force:true});
        await page.evaluate(()=>{
            const {context}=__equipment.appState.audio;
            const dev=__equipment.appState.project.devices.p220;
            window.phonoOscillators=[['L',100],['R',1000]].map(([channel,frequency])=>{
                const source=context.createOscillator(),level=context.createGain();
                source.frequency.value=frequency;
                level.gain.value=.0004;
                source.connect(level).connect(dev.nodes['phono1'+channel]);
                source.start();
                return source;
            });
        });
        const phono=await measure();
        near(phono.preL.frequency,100);
        near(phono.preR.frequency,1000);
        assert(phono.preL.rms/phono.preR.rms>3.5,'RIAA boosts 100 Hz relative to 1 kHz');
        await page.locator('#p220 [data-aurenne-knob="impedance"]').focus();
        await page.keyboard.press('End');
        assert.equal(await page.evaluate(()=>{
            const dev=__equipment.appState.project.devices.p220;
            return dev.aurenneInputOhms(dev.el.querySelector('[data-node="phono1L"]'));
        }),100000);
        await page.evaluate(()=>phonoOscillators.forEach(oscillator=>{oscillator.stop();oscillator.disconnect();}));
        await source.selectOption('3',{force:true});
        assert((await measure()).preL.rms>.0001,'untuned FM has audible noise');
        await page.locator('#p220 [data-aurenne-switch="fmMuting"]').click();
        assert((await measure()).preL.rms<.00001);
        const rate=12000,frames=rate,header=Buffer.alloc(44),data=Buffer.alloc(4*frames);
        header.write('RIFF',0);header.writeUInt32LE(36+data.length,4);header.write('WAVEfmt ',8);
        header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(2,22);
        header.writeUInt32LE(rate,24);header.writeUInt32LE(rate*4,28);header.writeUInt16LE(4,32);
        header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(data.length,40);
        for(let frame=0;frame<frames;frame++){
            data.writeInt16LE(Math.round(6000*Math.sin(2*Math.PI*600*frame/rate)),4*frame);
            data.writeInt16LE(Math.round(6000*Math.sin(2*Math.PI*1200*frame/rate)),4*frame+2);
        }
        await page.locator('[data-p220-file]').setInputFiles({name:'station.wav',mimeType:'audio/wav',buffer:Buffer.concat([header,data])});
        await page.waitForFunction(()=>__equipment.appState.project.devices.p220.audioBuffer);
        const dial=page.locator('[data-p220-tuning]');
        const setDial=value=>dial.evaluate((el,x)=>{el.value=x;el.dispatchEvent(new Event('input',{bubbles:true}));},value);
        await setDial('500');
        const fm=await measure();
        near(fm.preL.frequency,600);near(fm.preR.frequency,1200);
        assert.equal(await page.locator('#p220 [data-aurenne-lamp="stereo"]').evaluate(el=>el.classList.contains('green')),true);
        await page.locator('[data-p220-band]').selectOption('am',{force:true});
        await source.selectOption('4',{force:true});
        await setDial('580');
        const am=await measure();
        assert(am.preL.rms>.001&&Math.abs(am.preL.rms-am.preR.rms)<.0003);
        assert.equal(await page.locator('[data-p220-frequency]').textContent(),'1000 kHz');
        await page.locator('#p220 .power-btn').click();
        assert((await measure()).preL.rms<.00001);
        await page.evaluate(async()=>{
            const api=__equipment,old=api.appState.project.devices.p220,snapshot=api.projectCapture(),station=old.mediaBlob;
            const warnings=await api.restoreLocalProject(snapshot,()=>station);
            const restored=Object.values(api.appState.project.devices).find(dev=>dev.type==='preAurenne220');
            window.restored220={warnings,state:restored.state.aurenne220,powered:restored.powered,
                audible:restored.aurenneRadio.audible,fileName:restored.fileName,cables:api.appState.project.connections.length};
        });
        const restored=await page.evaluate(()=>restored220);
        assert.deepEqual(restored.warnings,[]);
        assert.equal(restored.state.tuning,580);
        assert.equal(restored.state.stationBand,'am');
        assert.equal(restored.state.impedance1,2);
        assert.equal(restored.powered,false);
        assert.equal(restored.audible,false);
        assert.equal(restored.fileName,'station.wav');
        assert.equal(restored.cables,8);
        assert.deepEqual(errors,[]);
        console.log('P-220/R-220: front controls, automatic feet, stereo routing, tape, RIAA, tone, FM/AM, load protection and project restore passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
