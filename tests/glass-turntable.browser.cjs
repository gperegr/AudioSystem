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
                assert(index>0);body=source.slice(0,index)+'window.__signal={createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,createSpotifyVinyl,placeSpotifyVinyl,removeSpotifyVinyl,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(async()=>{
            const api=__signal;api.createDevice('turntableBelt',200,200,'glass-deck');
            const dev=api.appState.project.devices['glass-deck'];
            dev.el.style.transform='none';
            if(dev.powered)api.toggleDevicePower(dev);
            api.toggleDevicePower(dev);
            if(!dev.state.playing||!dev.state.tt.running)throw Error('Motor did not start');
            dev.ttSetOutput('phono');if(dev.state.tt.output!=='phono')throw Error('Phono mode');
            dev.ttSetOutput('line');dev.ttSetPitch(.5);if(dev.ttRate()!==1.04)throw Error('Pitch rate');
            dev.ttSetPitch(0);dev.setLidOpen(true);if(!dev.state.lidOpen)throw Error('Lid');dev.setLidOpen(false);
            const ctx=api.appState.audio.context;await ctx.resume();
            dev.audioBuffer=ctx.createBuffer(2,ctx.sampleRate,ctx.sampleRate);
            for(let ch=0;ch<2;ch++){const data=dev.audioBuffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=.1*Math.sin(i/ctx.sampleRate*440*Math.PI*2);}
            if(dev.state.playing)dev.ttToggleRun();dev.ttToggleRun();
            if(!dev.filePlayback)throw Error('Local audio did not start');
            api.toggleDevicePower(dev);if(dev.state.playing||dev.state.tt.running)throw Error('Power off did not stop playback');
            const vinyl=api.createSpotifyVinyl({uri:'spotify:album:GlassDeckTest',name:'Test record'});
            if(!api.placeSpotifyVinyl(vinyl,dev,false)||dev.spotifyVinyl!==vinyl)throw Error('Spotify record placement');
            api.removeSpotifyVinyl(vinyl,false);dev.setLidOpen(false);
            AudioSystemLanguage.set('en');api.selectDevice(dev.id);
        });
        const deck=page.locator('#glass-deck');
        assert.equal(await deck.locator('.port[data-io=out]').count(),2);
        assert.equal(await deck.locator('.port[data-io=in]').count(),0);
        assert.equal(await deck.locator('.at-controls button').count(),1);
        await page.evaluate(()=>{
            const preview=document.createElement('div');preview.className='equipment-preview-world';
            preview.style.cssText='position:fixed;left:350px;top:300px;width:650px;height:200px;z-index:100000;background:#263133';document.body.appendChild(preview);
            const el=document.getElementById('glass-deck');preview.appendChild(el);el.style.left='30px';el.style.top='30px';el.style.transform='none';
        });
        await deck.screenshot({path:'/tmp/glass-deck.png'});
        const dimensions=await deck.evaluate(el=>({width:el.offsetWidth,height:el.offsetHeight}));
        assert(dimensions.width>dimensions.height*2,'front elevation stays low and wide');
        await page.evaluate(()=>__signal.deleteDevice(__signal.appState.project.devices['glass-deck'],false));
        assert.deepEqual(errors,[]);console.log('Glass-platter turntable: motor, local audio, pitch, output modes, cover and disposal passed.',dimensions);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
