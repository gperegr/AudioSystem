// Real pointer interactions: latched placement, grid, cancellation, wiring and touch regressions.
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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme,createDevice,selectDevice,setDeviceSelection,deleteDevice,connectProjectPorts,appState,view,applyView,projectCapture};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();

        await page.evaluate(()=>{__signal.setCanvasTheme('light');__signal.view.zoom=1;__signal.view.x=0;__signal.view.y=0;__signal.applyView();});
        const devices=()=>page.evaluate(()=>Object.values(__signal.appState.project.devices).map(dev=>({id:dev.id,type:dev.type,x:parseFloat(dev.el.style.left),y:parseFloat(dev.el.style.top),w:dev.el.offsetWidth,h:dev.el.offsetHeight,visual:dev.dragVisualPosition,powered:dev.powered})));
        const preview=()=>page.locator('.catalog-placement-preview:visible').evaluate(el=>({x:parseFloat(el.style.left),y:parseFloat(el.style.top),h:el.offsetHeight,invalid:el.classList.contains('is-invalid')}));
        const grid=p=>{assert.equal(p.x%20,0);assert.equal((p.y+p.h)%20,0);};
        const clean=async()=>{assert.equal(await page.locator('.catalog-placement-preview').count(),0);assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('equipment-cursor-placement')),false);};
        const grab=async id=>{
            const rect=await page.locator('#'+id).boundingBox();
            await page.mouse.click(rect.x+12,rect.y+8);
            assert(await page.locator('body').evaluate(el=>el.classList.contains('equipment-cursor-placement')));
        };
        await page.locator('.setup-object[data-setup-category="sources"]').click();
        const card=page.locator('.catalog-item[data-template="cdPlayer"]');
        await card.click();
        assert.equal((await devices()).length,0,'pickup does not create a live device');
        await page.mouse.move(500,300);await page.waitForTimeout(60);
        const first=await preview();grid(first);assert(!first.invalid);
        await page.mouse.move(547,327);await page.waitForTimeout(60);
        const desired=await preview();grid(desired);assert.notEqual(first.x,desired.x);
        await page.mouse.click(547,327);await clean();
        let [dev]=await devices();assert.equal(dev.x,desired.x);assert.equal(dev.y,desired.y);grid(dev);
        const original={x:dev.x,y:dev.y};
        await grab(dev.id);await page.mouse.move(647,367);await page.waitForTimeout(80);
        let moving=(await devices())[0];assert(moving.visual);grid({...moving,...moving.visual});
        await page.mouse.click(647,367);await page.waitForTimeout(700);await clean();
        dev=(await devices())[0];grid(dev);assert.notEqual(dev.x,original.x);
        const dropped={x:dev.x,y:dev.y};
        await page.locator('#undo-movement').click();await page.waitForTimeout(700);
        dev=(await devices())[0];assert.equal(dev.x,original.x);assert.equal(dev.y,original.y);
        await page.locator('#redo-movement').click();await page.waitForTimeout(700);
        dev=(await devices())[0];assert.equal(dev.x,dropped.x);assert.equal(dev.y,dropped.y);
        await grab(dev.id);await page.mouse.move(800,420);await page.waitForTimeout(60);await page.keyboard.press('Escape');await clean();
        dev=(await devices())[0];assert.equal(dev.x,dropped.x);assert.equal(dev.y,dropped.y);
        await grab(dev.id);await page.mouse.move(750,400);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await clean();
        dev=(await devices())[0];assert.equal(dev.x,dropped.x,'blur restores the committed position');
        await grab(dev.id);await page.mouse.move(700,390);await page.keyboard.press('Escape');await clean();
        dev=(await devices())[0];assert.equal(dev.x,dropped.x,'repeated cancel does not leave stale state');
        const power=page.locator('#'+dev.id+' .power-btn').first();
        const beforePower=dev.powered;await power.click();assert.equal((await devices())[0].powered,!beforePower);await clean();
        // Invalid placement remains a preview until cancelled; no nearby auto-placement.
        await card.click();const rect=await page.locator('#'+dev.id).boundingBox();
        await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.waitForTimeout(60);
        assert((await preview()).invalid);await page.mouse.click(rect.x+rect.width/2,rect.y+rect.height/2);
        assert.equal((await devices()).length,1);assert.equal(await page.locator('.catalog-placement-preview').count(),1);
        await page.keyboard.press('Escape');await clean();
        await card.click();await page.mouse.move(900,400);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await clean();assert.equal((await devices()).length,1);
        // Connected equipment keeps its signal wiring while moving as a selected group.
        await page.evaluate(()=>{
            Object.values(__signal.appState.project.devices).forEach(dev=>__signal.deleteDevice(dev));
            __signal.createDevice('cdPlayer',100,220,'group-source');
            __signal.createDevice('headphoneAmp',800,220,'group-amp');
            const from=__signal.appState.project.devices['group-source'],to=__signal.appState.project.devices['group-amp'];
            __signal.connectProjectPorts(from,'outL',to,'inL');
            __signal.connectProjectPorts(from,'outR',to,'inR');
            __signal.setDeviceSelection(['group-source','group-amp'],'group-source');
        });
        const groupBefore=await devices();
        const cableBefore=await page.locator('.cable-group').first().innerHTML();
        await grab('group-source');
        const sourceBounds=await page.locator('#group-source').boundingBox();
        await page.mouse.move(sourceBounds.x+92,sourceBounds.y+88);await page.waitForTimeout(80);
        assert.equal(await page.evaluate(()=>__signal.appState.project.connections.length),2);
        assert.notEqual(await page.locator('.cable-group').first().innerHTML(),cableBefore,'cables follow live movement');
        await page.mouse.click(sourceBounds.x+92,sourceBounds.y+88);await page.waitForTimeout(700);await clean();
        const groupAfter=await devices();
        const deltas=groupAfter.map((d,i)=>({x:d.x-groupBefore[i].x,y:d.y-groupBefore[i].y}));
        assert.deepEqual(deltas[0],deltas[1],'selected equipment retains its relative offsets');
        groupAfter.forEach(grid);
        // A Ctrl/Shift click only changes selection and never picks up equipment.
        await page.keyboard.down('Shift');await page.locator('#group-amp').click({position:{x:12,y:8}});await page.keyboard.up('Shift');await clean();
        // Cursor following uses world coordinates when zoom changes after pickup.
        await page.evaluate(()=>__signal.selectDevice('group-source'));
        await grab('group-source');
        await page.evaluate(()=>{__signal.view.zoom=.75;__signal.applyView();});
        await page.mouse.move(400,400);await page.waitForTimeout(80);
        const zoomed=(await devices()).find(d=>d.id==='group-source');grid({...zoomed,...zoomed.visual});
        await page.keyboard.press('Escape');await clean();
        // Reduced motion uses the same two-click placement semantics.
        await page.emulateMedia({reducedMotion:'reduce'});
        await card.click();await page.mouse.move(1100,550);await page.waitForTimeout(50);grid(await preview());
        await page.keyboard.press('Escape');await clean();
        // Furniture pickup includes the equipment supported by its top surface.
        await page.evaluate(()=>{
            Object.values(__signal.appState.project.devices).forEach(dev=>__signal.deleteDevice(dev));
            __signal.view.zoom=.7;__signal.view.x=0;__signal.view.y=0;__signal.applyView();
            __signal.createDevice('furnitureNiche',160,400,'support');
            __signal.createDevice('cdPlayer',200,100,'supported');
            const gear=__signal.appState.project.devices.supported;
            gear.el.style.top=(400-gear.el.offsetHeight)+'px';
            __signal.selectDevice('support');
        });
        const furnitureBefore=await devices();
        const furnitureRect=await page.locator('#support .furniture-top').first().boundingBox();
        await page.mouse.click(furnitureRect.x+10,furnitureRect.y+4);
        await page.mouse.move(furnitureRect.x+110,furnitureRect.y+84);await page.waitForTimeout(60);
        assert.equal(await page.locator('.equipment-dragging').count(),2);
        await page.mouse.click(furnitureRect.x+110,furnitureRect.y+84);await page.waitForTimeout(500);await clean();
        const furnitureAfter=await devices();
        assert.equal(furnitureAfter[0].x-furnitureBefore[0].x,furnitureAfter[1].x-furnitureBefore[1].x);
        assert.equal(furnitureAfter[0].y-furnitureBefore[0].y,furnitureAfter[1].y-furnitureBefore[1].y);
        // Touch retains the existing tap-preview/cancel flow.
        const labelRect=await card.locator(':scope > span').boundingBox();
        await page.touchscreen.tap(labelRect.x+labelRect.width/2,labelRect.y+labelRect.height/2);
        await page.locator('[data-preview-cancel]').click();await clean();
        assert.equal((await devices()).length,2);
        // A deliberate touch drag still releases on finger-up.
        const touchBefore=(await devices()).find(d=>d.id==='supported');
        const touchRect=await page.locator('#supported').boundingBox();
        const touchStart={x:touchRect.x+12,y:touchRect.y+8};
        const cdp=await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touchStart]});await page.waitForTimeout(350);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touchStart.x+70,y:touchStart.y-70}]});await page.waitForTimeout(70);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(500);
        await clean();assert.equal(await page.locator('.equipment-dragging').count(),0);
        const touchAfter=(await devices()).find(d=>d.id==='supported');
        assert(touchAfter.x!==touchBefore.x||touchAfter.y!==touchBefore.y,'touch hold-drag still moves the equipment');
        grid(touchAfter);
        // Scene boundaries remain aligned even though the side inset is 202 px.
        await page.evaluate(()=>{__signal.setCanvasTheme('scene');__signal.view.x=0;__signal.view.y=0;__signal.applyView();});
        await card.click();await page.mouse.move(1,300);await page.waitForTimeout(60);
        const edge=await preview();grid(edge);assert(edge.x>=202);
        await page.keyboard.press('Escape');await clean();
        await page.screenshot({path:'/tmp/click-to-place-equipment.png'});
        assert.deepEqual(errors,[]);console.log('Click placement: catalog/canvas, grid, undo/redo, cancellation, controls, cables, groups, furniture, zoom and touch passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
