const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const {page,errors}=await require('./helpers/equipment-page.cjs')(browser);
        const result=await page.evaluate(()=>{
            const api=__equipment;api.createDevice('shelfRadiator',200,200,'bass-speaker');const d=api.appState.project.devices['bass-speaker'];
            const preview=document.createElement('div');preview.className='equipment-preview-world';preview.style.cssText='position:fixed;left:480px;top:180px;width:400px;height:500px;z-index:100000;pointer-events:auto;background:#263133';document.body.appendChild(preview);preview.appendChild(d.el);d.el.style.left='45px';d.el.style.top='30px';d.el.style.transform='none';
            const frequencies=new Float32Array([20,100,1000,10000]),response=Array(4).fill(1);
            d.voicingNodes.filter(node=>node.getFrequencyResponse).forEach(node=>{const mag=new Float32Array(4),phase=new Float32Array(4);node.getFrequencyResponse(frequencies,mag,phase);mag.forEach((v,i)=>response[i]*=v);});
            api.selectDevice(d.id);
            return {watts:d.state.speakerWatts,ohms:d.state.speakerOhms,width:d.el.offsetWidth,height:d.el.offsetHeight,response:response.map(value=>20*Math.log10(value))};
        });
        assert.equal(result.watts,70);assert.equal(result.ohms,6);assert.equal(result.width,296);assert.equal(result.height,434);
        assert(result.response[1]>4.5,'prominent mid-bass is audible in the real filter graph');
        assert(result.response[0]<-20,'compact cabinet rolls off sub-bass');assert(Math.abs(result.response[2])<1,'midrange stays near neutral');
        const speaker=page.locator('.device-type-shelfRadiator');
        assert.equal(await speaker.locator('.port[data-type="wire"][data-io="in"][data-signal="amplified"]').count(),1);
        assert.equal(await speaker.locator('.power-btn,.port[data-io="out"]').count(),0,'passive mono speaker has no power or output');
        assert.equal(await speaker.getAttribute('data-model'),'B-70');
        await speaker.screenshot({path:'/tmp/radiator-speaker-open.png'});
        await speaker.locator('.grille-restore').click();
        assert(!await speaker.evaluate(el=>el.classList.contains('grille-off')));
        await speaker.screenshot({path:'/tmp/radiator-speaker-grille.png'});
        await page.evaluate(async()=>{const api=__equipment,snapshot=api.projectCapture();await api.restoreLocalProject(snapshot);});
        assert(!await speaker.evaluate(el=>el.classList.contains('grille-off')),'grille setting survives saved project');
        await page.evaluate(()=>{AudioSystemLanguage.set('en');__equipment.selectDevice(Object.values(__equipment.appState.project.devices).find(d=>d.type==='shelfRadiator').id);});
        await page.locator('#inspector-grille').click();
        assert(await speaker.evaluate(el=>el.classList.contains('grille-off')),'inspector can remove grille');
        const text=await page.locator('#inspector-content').textContent();assert(text.includes('70 W'));assert(text.includes('6 Ω'));
        await page.waitForFunction(()=>document.querySelector('#inspector-content .sonic-curve-graph').getAttribute('aria-label').includes('Prominent bass'));
        await page.evaluate(()=>__equipment.deleteDevice(Object.values(__equipment.appState.project.devices).find(d=>d.type==='shelfRadiator'),false));
        assert.deepEqual(errors,[]);
        console.log('B-70: 70 W RMS / 6 Ω, real bass response, passive connection, grille controls and persistence, English inspector and disposal passed.',result);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
