// Keyboard deletion must preserve editing and modal behavior and restore devices/cables through history.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100},hasTouch:true}),errors=[];
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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,createDevice,selectDevice,setDeviceSelection,connectProjectPorts,appState,view,applyView,projectCapture,showAppDialog};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();


        await page.evaluate(()=>{
            __signal.setCanvasTheme('light');__signal.view.zoom=1;__signal.view.x=0;__signal.view.y=0;__signal.applyView();
            __signal.createDevice('cdPlayer',100,200,'source');__signal.createDevice('headphoneAmp',800,200,'amp');__signal.createDevice('benchMeter',1100,500,'unselected');
            const source=__signal.appState.project.devices.source,amp=__signal.appState.project.devices.amp;
            source.state.volume=.43;__signal.connectProjectPorts(source,'outL',amp,'inL');__signal.connectProjectPorts(source,'outR',amp,'inR');
            __signal.selectDevice('source');source.el.focus();
        });
        const snapshot=()=>page.evaluate(()=>({devices:Object.keys(__signal.appState.project.devices).sort(),connections:__signal.appState.project.connections.length,selected:[...__signal.appState.interface.selectedDeviceIds]}));
        const original=await page.evaluate(()=>__signal.projectCapture().devices.find(d=>d.id==='source'));
        const undo=async()=>{await page.locator('#undo-movement').click();await page.waitForFunction(()=>!!__signal.appState.project.devices.source);};
        const sourceRect=await page.locator('#source').boundingBox();
        await page.keyboard.press('Delete');
        const cloud=page.locator('.discard-cloud');
        assert.equal(await cloud.count(),1,'Delete uses the same discard cloud effect');
        const point=await cloud.evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top)}));
        assert(Math.abs(point.x-sourceRect.x-sourceRect.width/2)<1&&Math.abs(point.y-sourceRect.y-sourceRect.height/2)<1,'smoke appears where the equipment was displayed');
        assert.deepEqual((await snapshot()).devices,['amp','unselected']);assert.equal((await snapshot()).connections,0);
        await undo();await page.waitForFunction(()=>__signal.appState.project.connections.length===2);
        const restored=await page.evaluate(()=>__signal.projectCapture().devices.find(d=>d.id==='source'));
        assert.equal(restored.x,original.x);assert.equal(restored.y,original.y);assert.equal(restored.settings.volume,.43);
        await page.locator('#redo-movement').click();await page.waitForFunction(()=>!__signal.appState.project.devices.source);
        await undo();await page.waitForFunction(()=>__signal.appState.project.connections.length===2);
        await page.evaluate(()=>__signal.setDeviceSelection(['source','amp'],'source'));
        await page.keyboard.press('Delete');assert.deepEqual((await snapshot()).devices,['unselected']);
        await undo();await page.waitForFunction(()=>Object.keys(__signal.appState.project.devices).length===3&&__signal.appState.project.connections.length===2);
        // Editing the actual search field consumes Delete as text editing.
        await page.locator('#equipment-search').fill('abc');await page.keyboard.press('Home');await page.keyboard.press('Delete');
        assert.equal(await page.locator('#equipment-search').inputValue(),'bc');assert.equal((await snapshot()).devices.length,3);
        await page.locator('#equipment-search').fill('');
        await page.evaluate(()=>{const editor=document.createElement('div');editor.id='delete-editor';editor.contentEditable='plaintext-only';editor.textContent='Text';document.body.appendChild(editor);editor.focus();});
        await page.keyboard.press('Delete');assert.equal((await snapshot()).devices.length,3);
        await page.evaluate(()=>document.getElementById('delete-editor').remove());
        await page.evaluate(()=>{void __signal.showAppDialog({title:'Teste',message:'Diálogo aberto',requireChoice:true});});
        await page.keyboard.press('Delete');assert.equal((await snapshot()).devices.length,3);await page.locator('[data-dialog-cancel]').click();
        await page.evaluate(()=>{__signal.selectDevice('source');__signal.appState.project.devices.source.el.focus();});
        await page.keyboard.press('Control+Delete');assert.equal((await snapshot()).devices.length,3);
        await page.keyboard.press('Backspace');assert.deepEqual((await snapshot()).devices,['amp','unselected']);await undo();
        // Delete while following the cursor clears the pending move and remains undoable.
        await page.locator('#source').click({position:{x:12,y:8}});await page.mouse.move(650,400);await page.waitForTimeout(60);
        await page.keyboard.press('Delete');assert(!((await snapshot()).devices.includes('source')));
        assert.equal(await page.locator('.equipment-dragging').count(),0);assert.equal(await page.locator('body.equipment-cursor-placement').count(),0);
        await undo();const after=await page.evaluate(()=>__signal.projectCapture().devices.find(d=>d.id==='source'));
        assert.equal(after.x,original.x);assert.equal(after.y,original.y);
        // A pending new item is only a preview; Delete must not erase a different device.
        await page.locator('.setup-object[data-setup-category="sources"]').click();await page.locator('.catalog-item[data-template="cdPlayer"]').click();
        await page.mouse.move(650,450);await page.keyboard.press('Delete');
        assert.equal((await snapshot()).devices.length,3);assert.equal(await page.locator('.catalog-placement-preview').count(),0);
        assert.deepEqual(errors,[]);console.log('Delete/Backspace: single/multiple selection, cables, undo/redo, editing/modal guards and pending placement passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
