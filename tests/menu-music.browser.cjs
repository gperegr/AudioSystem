// Keyboard deletion must preserve editing and modal behavior and restore devices/cables through history.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100},hasTouch:true}),errors=[];
        let musicRequests=0;
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.pathname.endsWith('/menu-blues.mp3')){musicRequests++;if(musicRequests===1)await new Promise(resolve=>setTimeout(resolve,650));}
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString(),marker='        renderVisuals();',index=source.lastIndexOf(marker);
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,createDevice,selectDevice,setDeviceSelection,connectProjectPorts,appState,view,applyView,projectCapture,showAppDialog,showContextHelp,openHomeMenu,menuMusic,syncRoomRainAudio,get rainAudioActive(){return !!roomRainAudio;}};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.addInitScript(()=>{
            localStorage.setItem('audio-system-interface-preferences',JSON.stringify({headphonePromptSeen:true,uiSoundVolume:0,roomParticleAmount:0,rainEnabled:false}));
            localStorage.setItem('audio-system-guide-v1','true');
        });
        await page.goto('http://127.0.0.1:9876/');await page.waitForFunction(()=>document.getElementById('home-menu')?.open);
        assert.equal(await page.evaluate(()=>{__signal.appState.preferences.rainEnabled=true;__signal.syncRoomRainAudio();return __signal.rainAudioActive;}),false,'home blocks saved rain audio');
        assert.equal(musicRequests,0,'menu does not download or play music before a gesture');
        assert.equal(await page.evaluate(()=>__signal.menuMusic.state.playing),false);
        await page.getByRole('button',{name:'Ativar música do menu',exact:true}).click();
        await page.waitForFunction(()=>__signal.menuMusic.state.loading);
        assert.equal(await page.evaluate(()=>{__signal.syncRoomRainAudio();return __signal.rainAudioActive;}),false,'home blocks rain with running audio context');
        await page.evaluate(()=>__signal.appState.preferences.rainEnabled=false);
        await page.locator('[data-home="continue"]').click();
        await page.waitForFunction(()=>__signal.menuMusic.state.loaded);
        assert.equal(await page.evaluate(()=>__signal.menuMusic.state.playing),false,'a pending decode must not start after leaving home');
        await page.locator('#app-topbar .app-brand').click();
        await page.waitForFunction(()=>__signal.menuMusic.state.playing);
        await page.evaluate(()=>{const ctx=__signal.appState.audio.context,a=ctx.createAnalyser();a.fftSize=2048;__signal.appState.audio.listeningToneInput.connect(a);window.__musicAnalyser=a;});
        const rms=()=>page.evaluate(()=>{const a=window.__musicAnalyser,d=new Float32Array(a.fftSize);a.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((s,v)=>s+v*v,0)/d.length);});
        await page.waitForTimeout(850);assert(await rms()>.002,'music produces actual audio');
        const state=await page.evaluate(()=>__signal.menuMusic.state);assert(state.loop&&state.duration>37.5&&state.duration<38.1);
        assert.equal(musicRequests,1,'opening the menu reuses the decoded track');
        const volume=page.getByRole('slider',{name:'Volume da música do menu'});
        await volume.evaluate(el=>{el.value=50;el.dispatchEvent(new Event('input',{bubbles:true}));});
        assert.equal(await page.evaluate(()=>__signal.menuMusic.state.volume),.5);
        await volume.evaluate(el=>{el.value=0;el.dispatchEvent(new Event('input',{bubbles:true}));});
        await page.waitForTimeout(450);assert(await rms()<.00001,'zero volume stops and silences the source');
        await page.getByRole('button',{name:'Ativar música do menu',exact:true}).click();await page.waitForFunction(()=>__signal.menuMusic.state.playing);
        assert.equal(await volume.inputValue(),'50','unmute restores the previous level');
        await page.locator('[data-home-scene="studioIllustrated"]').click();assert.equal(musicRequests,1);
        await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
        await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>__signal.menuMusic.state.playing),false);assert(await rms()<.00001);
        await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));});
        await page.waitForFunction(()=>__signal.menuMusic.state.playing);
        await page.getByRole('button',{name:'Pausar música do menu',exact:true}).click();
        await page.waitForTimeout(650);assert(await rms()<.00001);
        const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('audio-system-interface-preferences')));
        assert.equal(saved.menuMusicEnabled,false);assert.equal(saved.menuMusicVolume,.5);
        assert.equal(musicRequests,1);assert(fs.statSync(path.join(root,'assets/audio/menu-blues.mp3')).size<600000);
        assert.match(fs.readFileSync(path.join(root,'assets/audio/LICENSE.txt'),'utf8'),/CC0-1.0/);
        await page.locator('[data-home="continue"]').click();await page.locator('#app-topbar .app-brand').click();assert.equal(await page.evaluate(()=>__signal.menuMusic.active),false,'a muted menu stays muted');
        assert.deepEqual(errors,[]);console.log('Menu blues: gesture-only start, real audio, native loop, pending-load cancellation, cached decode, volume/mute persistence and hidden-page cleanup passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
