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
        const result=await page.evaluate(()=>{
            const api=__signal;api.createDevice('spkElectrostatic',200,200,'electro-panel');const dev=api.appState.project.devices['electro-panel'];
            const preview=document.createElement('div');preview.className='equipment-preview-world';preview.style.cssText='position:fixed;left:310px;top:120px;width:920px;height:830px;z-index:100000;pointer-events:auto;background:#263133';document.body.appendChild(preview);preview.appendChild(dev.el);dev.el.style.left='20px';dev.el.style.top='20px';dev.el.style.transform='none';
            const frequency=new Float32Array([20,55,1000,18000]),response=Array(4).fill(1);
            dev.voicingNodes.filter(n=>n.getFrequencyResponse).forEach(n=>{const mag=new Float32Array(4),phase=new Float32Array(4);n.getFrequencyResponse(frequency,mag,phase);mag.forEach((v,i)=>response[i]*=v);});
            AudioSystemLanguage.set('en');api.selectDevice(dev.id);
            return {watts:dev.state.speakerWatts,ohms:dev.state.speakerOhms,curve:response.map(v=>20*Math.log10(v)),trim:dev.voicingNodes[0].gain.value,width:dev.el.offsetWidth,height:dev.el.offsetHeight};
        });
        assert.equal(result.watts,15);assert.equal(result.ohms,15);assert.equal(result.width,876);assert.equal(result.height,790);
        assert(result.curve[0]<-17,'dipole panel has restrained sub-bass');assert(result.curve[1]<-5&&result.curve[1]>-7,'55 Hz bass roll-off');assert(Math.abs(result.curve[2])<1,'natural midband');assert(result.curve[3]<-3,'smooth top octave');assert(Math.abs(result.trim-10**(-12/20))<.001,'relative low-sensitivity trim');
        const panel=page.locator('#electro-panel');assert.equal(await panel.locator('.port').count(),1);assert.equal(await panel.locator('.port[data-signal=amplified][data-io=in]').count(),1);assert.equal(await panel.locator('.spk-woofer,.spk-tweeter').count(),0);
        assert((await page.locator('#inspector-content').textContent()).includes('84 dB / 2,83 V / 1 m'));
        await panel.screenshot({path:'/tmp/electrostatic-speaker.png'});
        await page.evaluate(()=>__signal.deleteDevice(__signal.appState.project.devices['electro-panel'],false));assert.deepEqual(errors,[]);
        console.log('Electrostatic panel: dimensions, passive input, ratings, sensitivity, actual audio-filter response, inspector, translation and disposal passed.',result);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
