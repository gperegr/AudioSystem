// Optional: serve the repository on localhost:8000, then node tests/tape-deck.browser.cjs.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/script.js?*',route=>{
            let body=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8');const index=body.lastIndexOf('        renderVisuals();');
            body=body.slice(0,index)+'window.__tape={state,view,world,createDevice,selectDevice,centerDeviceSet,updateTapeReels,tapePosition,saveLocalProject};\n'+body.slice(index);
            return route.fulfill({contentType:'application/javascript',body});
        });
        await page.goto(process.env.TEST_BASE_URL||'http://127.0.0.1:8000/');
        await page.locator('#headphone-calibration-skip').click();await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(()=>{__tape.createDevice('tapeDeck',1000,900);__tape.view.zoom=1.3;__tape.centerDeviceSet(Object.values(__tape.state.devices));});
        await page.waitForTimeout(1100);
        const deck=page.locator('#audio-world>.device-type-tapeDeck');
        const geometry=await deck.evaluate(el=>{const rect=el.getBoundingClientRect(),parts=[...el.querySelectorAll('button,.extra-vu')].map(n=>n.getBoundingClientRect());return {width:el.offsetWidth,height:el.offsetHeight,contained:parts.every(r=>r.left>=rect.left&&r.right<=rect.right&&r.top>=rect.top&&r.bottom<=rect.bottom),ports:[...el.querySelectorAll('.port')].map(n=>[n.dataset.io,n.dataset.node]),reliefs:el.querySelectorAll('[data-lighting-relief]').length};});
        assert.deepEqual(geometry,{width:480,height:440,contained:true,ports:[['out','outL'],['out','outR']],reliefs:5});
        // Use real source controls and real AudioNodes, without routing sound to the system output.
        await page.evaluate(()=>{const d=Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck');d.audioBuffer=__tape.state.audioCtx.createBuffer(2,30*8000,8000);d.fileOffset=0;});
        await deck.locator('[data-source-play]').click();await page.waitForFunction(()=>Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck').state.playing);
        await page.waitForTimeout(250);assert.equal(await deck.locator('[data-source-play]').getAttribute('aria-pressed'),'true');
        await deck.locator('[data-tape-forward]').click();await page.waitForTimeout(100);
        assert(await page.evaluate(()=>__tape.tapePosition(Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck'))>=10));
        await deck.locator('[data-source-play]').click();assert(!await page.evaluate(()=>Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck').state.playing));
        await deck.locator('[data-tape-back]').click();await page.waitForTimeout(80);
        assert(await page.evaluate(()=>__tape.tapePosition(Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck'))<2));
        const knob=deck.locator('[data-tape-level]');await knob.focus();await knob.press('ArrowDown');
        assert(await page.evaluate(()=>Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck').state.tapeVolume<.8));
        await deck.locator('[data-tape-stop]').click();await page.waitForTimeout(250);assert.equal(await deck.locator('[data-tape-counter]').textContent(),'00:00');
        // Deterministic visual state: accelerate, coast down, exchange winding sizes, honor reduced motion.
        const motion=await page.evaluate(()=>{
            const d={el:document.querySelector('.device-type-tapeDeck').cloneNode(true)},dt=1/60;
            __tape.updateTapeReels(d,0,dt,false);__tape.updateTapeReels(d,dt,dt,true);const initial=d.tapeReelSpeeds[0];
            for(let n=2;n<30;n++)__tape.updateTapeReels(d,n*dt,dt,true);const full=d.tapeReelSpeeds[0];
            __tape.updateTapeReels(d,29*dt,dt,false);const coast=d.tapeReelSpeeds[0];
            for(let n=0;n<160;n++)__tape.updateTapeReels(d,29*dt,dt,false);const rest=d.tapeReelSpeeds[0];
            for(let n=0;n<160;n++)__tape.updateTapeReels(d,170,dt,false);
            return{initial,full,coast,rest,radii:d.tapeVisualParts.map(p=>p.radius),counter:d.el.querySelector('[data-tape-counter]').textContent};
        });
        assert(motion.initial>0&&motion.initial<motion.full);assert(motion.coast>0&&motion.coast<motion.full);assert.equal(motion.rest,0);assert(motion.radii[1]>motion.radii[0]);assert.equal(motion.counter,'02:50');
        await page.emulateMedia({reducedMotion:'reduce'});
        assert(await page.evaluate(()=>{const d={el:document.querySelector('.device-type-tapeDeck').cloneNode(true)};__tape.updateTapeReels(d,100,.1,true);return d.tapeReelAngles.every(a=>a===0)&&d.tapeVisualPosition===100;}));
        await page.emulateMedia({reducedMotion:'no-preference'});
        // One actual movable fixture lights the new stationary reliefs; rotating does not repaint shadows.
        await page.evaluate(()=>{RoomScenes.lights=()=>[];document.querySelector('#canvas').dataset.theme='dark';__tape.createDevice('wallLampCage',700,650);Hardware.updateLightingDemo();});await page.waitForTimeout(180);
        const lightSample=()=>page.evaluate(()=>{const d=document.querySelector('.device-type-tapeDeck');return {highlight:parseFloat(d.querySelector('.tape-reel').style.getPropertyValue('--demo-highlight-x')),shadow:d.querySelector('.lighting-control-shadow').toDataURL()};});
        const left=await lightSample();
        await page.evaluate(()=>{const lamp=Object.values(__tape.state.devices).find(d=>d.type==='wallLampCage');lamp.el.style.left='1600px';Hardware.updateLightingDemo();});await page.waitForTimeout(180);
        const right=await lightSample();assert(left.highlight<50&&right.highlight>50);assert.notEqual(left.shadow,right.shadow);
        await page.evaluate(()=>{const d=Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck');__tape.updateTapeReels(d,20,.05,true);});await page.waitForTimeout(100);assert.equal((await lightSample()).shadow,right.shadow);
        await page.evaluate(()=>{const d=Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck');__tape.selectDevice(d.id);document.documentElement.classList.remove('lighting-demo-enabled');});
        await deck.screenshot({path:'/tmp/tape-deck-neutral.png'});
        await page.evaluate(()=>document.documentElement.classList.add('lighting-demo-enabled'));
        await deck.locator('.power-btn').click();assert(!await page.evaluate(()=>Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck').powered));
        await deck.locator('.power-btn').click();
        await page.evaluate(()=>__tape.saveLocalProject(true));await page.reload();await page.waitForFunction(()=>window.__tape&&Object.values(__tape.state.devices).some(d=>d.type==='tapeDeck'));
        assert(!await page.evaluate(()=>Object.values(__tape.state.devices).find(d=>d.type==='tapeDeck').state.playing));
        assert.deepEqual(errors,[]);
        console.log('Tape Deck: layout, real transport controls, knob, inertia, reduced motion, lighting direction/cache and reload passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
