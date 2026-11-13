// Preview/live parity: production skins, default displays, no audio allocation, cursor and touch placement.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const page=await browser.newPage({viewport:{width:1600,height:1100},hasTouch:true}),errors=[];
        page.on('pageerror',error=>errors.push(error.message));await page.emulateMedia({reducedMotion:'reduce'});
        await page.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.tailwindcss.com')return process.env.TAILWIND_SCRIPT_FILE?route.fulfill({contentType:'application/javascript',body:fs.readFileSync(process.env.TAILWIND_SCRIPT_FILE)}):route.continue();
            if(url.hostname!=='127.0.0.1')return route.abort();
            const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
            if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
            let body=fs.readFileSync(file);
            if(file===path.join(root,'script.js')){
                const source=body.toString(),index=source.lastIndexOf('        renderVisuals();');assert(index>0);
                body=source.slice(0,index)+'window.__previews={createDevice,deleteDevice,startCatalogCursorPlacement,appState,names:DEVICE_NAMES,devices:appState.project.devices};\n'+source.slice(index);
            }
            return route.fulfill({contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'})[path.extname(file)]||'application/octet-stream',body});
        });
        require('./helpers/studio-entry.cjs')(page);await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.evaluate(()=>Promise.all([document.fonts.ready,document.fonts.load('600 12px "Equipment Vintage"'),document.fonts.load('500 12px "Equipment Digital"')]));
        await page.evaluate(()=>{
            const selector='button,.port,input,select,output,[data-brand-badge],.hw-knob-face,.hw-knob-halo,.hw-slider-thumb,canvas,.tape-winding,.reel-metal,[data-live-vu],[data-bias-needle],.receiver-radio,.custom-pre-screen,.signal-screen,.bench-lcd,.spotify-flow-title,.spotify-flow-message,.bench-backdrop,svg,svg [class],[data-linear-carriage]';
            window.previewSnapshot=el=>{
                const base=el.getBoundingClientRect(),unit=el.offsetWidth/base.width;
                return {size:[el.offsetWidth,el.offsetHeight],parts:[...el.querySelectorAll(selector)].filter(n=>{
                    const r=n.getBoundingClientRect(),s=getComputedStyle(n);
                    return r.width&&r.height&&s.visibility!=='hidden'&&!n.closest('.lighting-control-shadow,.lighting-furniture-interior,.lighting-furniture-shadow,.lighting-control-mask');
                }).map(n=>{
                    const r=n.getBoundingClientRect(),s=getComputedStyle(n);
                    return {part:n.getAttribute('class')||n.tagName,model:n.dataset.knobModel||n.dataset.buttonModel||'',text:n.textContent.trim(),bounds:[r.left-base.left,r.top-base.top,r.width,r.height].map(v=>v*unit),background:s.backgroundImage,color:s.color,shadow:s.boxShadow,transform:s.transform,opacity:s.opacity,reflection:JSON.stringify(['transform','width','height','left','top','backgroundImage'].map(key=>getComputedStyle(n,'::after')[key])),children:n.children.length,pixels:n.tagName==='CANVAS'?n.toDataURL():''};
                })};
            };
            window.comparePreview=(type,a,b)=>{
                const issues=[];
                if(JSON.stringify(a.size)!==JSON.stringify(b.size))issues.push(type+': enclosure dimensions');
                if(a.parts.length!==b.parts.length)return [...issues,type+': visual parts '+a.parts.length+' / '+b.parts.length];
                a.parts.forEach((part,i)=>{
                    for(const key of ['model','text','bounds','background','color','shadow','transform','opacity','reflection','children','pixels']){
                        const changed=key==='bounds'?part.bounds.some((v,j)=>Math.abs(v-b.parts[i].bounds[j])>.25):part[key]!==b.parts[i][key];
                        if(changed)issues.push(type+': '+part.part+' / '+key);
                    }
                });return issues;
            };
        });
        const issues=[],types=await page.evaluate(()=>Object.keys(__previews.names));
        for(const type of types){
            const result=await page.evaluate(async type=>{
                const api=__previews,ctx=api.appState.audio.context,before=Object.keys(api.devices).length,createGain=ctx?.createGain;let gains=0;
                if(ctx)ctx.createGain=function(...args){gains++;return createGain.apply(this,args);};
                let preview;
                try{preview=api.createDevice(type,120,120,null,true);}finally{if(ctx)ctx.createGain=createGain;}
                const problems=[];
                if(api.appState.audio.context!==ctx||gains||Object.keys(api.devices).length!==before)problems.push(type+': preview allocated audio or registered a device');
                preview.el.hidden=false;
                const id='parity-'+type;api.createDevice(type,120,120,id);const live=api.devices[id];live.gaugeCalibration=null;
                Object.assign(preview.el.style,{left:live.el.style.left,top:live.el.style.top});Hardware.updateLightingDemo();
                await new Promise(resolve=>setTimeout(resolve,120));
                problems.push(...comparePreview(type,previewSnapshot(preview.el),previewSnapshot(live.el)));
                preview.el.remove();api.deleteDevice(live,false);return problems;
            },type);
            issues.push(...result);
        }
        fs.writeFileSync(process.env.PREVIEW_REPORT||'/tmp/audio-preview-parity.json',JSON.stringify({count:types.length,issues},null,2));
        assert.deepEqual(issues,[],'catalog preview and live equipment use identical default artwork');
        const reflectionIssues=await page.evaluate(()=>{
            const dev=__previews.createDevice('receiver',120,120,null,true);dev.el.hidden=false;
            const knob=dev.el.querySelector('[data-receiver-control="volume"]'),issues=[];
            for(const angle of [-135,0,81,135]){
                knob.style.setProperty('--knob-angle',angle+'deg');const reflection=getComputedStyle(knob,'::after');
                if(reflection.transform!=='none'||Math.abs(parseFloat(reflection.width)-(knob.clientWidth-2))>2||Math.abs(parseFloat(reflection.height)-(knob.clientHeight-2))>2)issues.push(angle);
            }
            dev.el.remove();return issues;
        });
        assert.deepEqual(reflectionIssues,[],'receiver reflection stays stationary and inside the knob at every angle');
        // The actual desktop placement path must keep the same geometry and ink,
        // including the ghost's CSS, cancellation and the click that confirms it.
        for(const type of ['turntableDirect','receiver','powerAmp','preClassic','spkActiveMonitor']){
            await page.evaluate(type=>__previews.startCatalogCursorPlacement(document.querySelector('.catalog-item[data-template="'+type+'"]')),type);
            const canvas=await page.locator('#canvas').boundingBox();let point;
            for(const [fx,fy]of [[.5,.5],[.4,.65],[.65,.6],[.55,.4]]){
                point={x:canvas.x+canvas.width*fx,y:canvas.y+canvas.height*fy};await page.mouse.move(point.x,point.y);await page.waitForTimeout(80);
                if(await page.locator('.catalog-placement-preview:not(.is-invalid):visible').count())break;
            }
            const preview=page.locator('.catalog-placement-preview:visible');assert.equal(await preview.count(),1);
            assert.equal(await preview.evaluate(el=>getComputedStyle(el).opacity),'1','placement does not wash out equipment colours');
            const label=await preview.locator('.catalog-placement-label').evaluate(el=>({height:el.offsetHeight,width:el.offsetWidth}));
            assert(label&&label.height<32&&label.width>100,'placement label stays a compact horizontal badge');
            if(type==='powerAmp')assert.equal(await preview.evaluate(el=>getComputedStyle(el,'::after').width),'25px','preview preserves the receiver rack ear');
            const before=await preview.evaluate(el=>previewSnapshot(el));
            await page.mouse.click(point.x,point.y);
            await page.mouse.move(5,5); // Compare resting artwork, outside the live hover state.
            assert.equal(await page.locator('.catalog-placement-preview').count(),0,'confirmation consumes the preview');
            const result=await page.evaluate(async({type,before})=>{
                const dev=Object.values(__previews.devices).find(d=>d.type===type);if(!dev)return [type+': placement failed'];
                dev.gaugeCalibration=null;await new Promise(resolve=>setTimeout(resolve,150));
                const differences=comparePreview(type,before,previewSnapshot(dev.el));__previews.deleteDevice(dev,false);return differences;
            },{type,before});assert.deepEqual(result,[],'confirmation preserves '+type+' artwork');
        }
        await page.evaluate(()=>__previews.startCatalogCursorPlacement(document.querySelector('.catalog-item[data-template="receiver"]')));
        await page.keyboard.press('Escape');assert.equal(await page.locator('.catalog-placement-preview').count(),0,'Escape disposes the preview');
        await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
        await page.evaluate(()=>{
            const item=document.querySelector('.catalog-item[data-template="turntableDirect"]');
            for(const type of ['pointerdown','pointerup'])item.querySelector('span').dispatchEvent(new PointerEvent(type,{bubbles:true,button:0,pointerType:'touch',isPrimary:true,pointerId:1,clientX:100,clientY:100}));
        });
        assert.equal(await page.locator('.catalog-preview-actions').count(),1,'touch placement offers confirmation');
        const touchPreview=await page.locator('.catalog-placement-preview').evaluate(el=>previewSnapshot(el));
        await page.locator('[data-preview-confirm]').click();await page.mouse.move(5,5);
        const touchResult=await page.evaluate(async before=>{
            const dev=Object.values(__previews.devices).find(d=>d.type==='turntableDirect');if(!dev)return ['touch placement failed'];
            dev.gaugeCalibration=null;await new Promise(resolve=>setTimeout(resolve,600));
            const differences=comparePreview('touch turntableDirect',before,previewSnapshot(dev.el));__previews.deleteDevice(dev,false);return differences;
        },touchPreview);
        assert.deepEqual(touchResult,[],'touch confirmation preserves the preview artwork');
        assert.equal(await page.locator('.catalog-placement-preview').count(),0);
        assert.deepEqual(errors,[],'no application errors');
        console.log(`Preview parity: ${types.length} models, skins, geometry, displays, idle canvases, no audio/registration, five cursor placements, touch confirmation and cancellation passed.`);
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
