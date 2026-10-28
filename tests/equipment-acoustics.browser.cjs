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
                assert(index>0);body=source.slice(0,index)+'window.__signal={syncEquipmentAcoustics,getAmbience:()=>equipmentAcoustics,createDevice,selectDevice,deleteDevice,connectProjectPorts,toggleDevicePower,updateSignalHistory,names:DEVICE_NAMES,appState,records:signalHistoryRecords};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(async()=>{
            const api=__signal;api.createDevice('powerValve',100,100,'hum-test');api.createDevice('powerDual',100,400,'fan-test');
            await api.appState.audio.context.resume();api.syncEquipmentAcoustics(performance.now(),true);
            if(api.getAmbience().voiceCount!==2)throw Error('Expected hum and fan');
            const fan=api.appState.project.devices['fan-test'];api.toggleDevicePower(fan);api.syncEquipmentAcoustics(performance.now(),true);if(api.getAmbience().voiceCount!==1)throw Error('Fan should stop');
            api.deleteDevice(api.appState.project.devices['hum-test'],false);if(api.getAmbience().voiceCount!==0)throw Error('Deletion left active voice');
            api.toggleDevicePower(fan);api.syncEquipmentAcoustics(performance.now(),true);
            Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));if(api.getAmbience().voiceCount!==0)throw Error('Hidden page left active sound');
            delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));api.syncEquipmentAcoustics(performance.now(),true);
            api.appState.preferences.uiSoundVolume=0;api.syncEquipmentAcoustics(performance.now(),true);if(api.getAmbience().voiceCount!==1)throw Error('Interaction mute must not mute equipment');
            api.appState.preferences.equipmentSoundVolume=0;api.syncEquipmentAcoustics(performance.now(),true);if(api.getAmbience().voiceCount!==0)throw Error('Interaction mute ignored');
            api.deleteDevice(fan,false);
            // Render the actual sound engine offline to check aggregate loudness and finite samples.
            const offline=new OfflineAudioContext(1,48000*3,48000),context=new Proxy(offline,{get(target,key){if(key==='state')return 'running';const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
            const engine=EquipmentAcoustics.create(context,offline.destination);engine.sync([{type:'powerValve',powered:true,state:{}},{type:'powerDual',powered:true,state:{}},{type:'tapeDeck',powered:true,state:{playing:true}}],{volume:1});
            const buffer=await offline.startRendering(),samples=buffer.getChannelData(0);let sum=0,peak=0;for(const sample of samples){if(!Number.isFinite(sample))throw Error('Invalid audio sample');sum+=sample*sample;peak=Math.max(peak,Math.abs(sample));}
            const rms=Math.sqrt(sum/samples.length);if(rms<.0001||rms>.004||peak>.012)throw Error('Ambience outside subtle loudness budget: '+rms+' / '+peak);engine.dispose();
        });
        assert.deepEqual(errors,[]);console.log('Equipment acoustics: real audio, bounded loudness, power, deletion, page visibility, mute and disposal passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
