// Dock regression: keep the search inside the silhouette and paint the canvas behind its cutouts.
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
                assert(index>0);body=source.slice(0,index)+'window.__signal={setCanvasTheme};\n'+source.slice(index);
            }
            const ext=path.extname(file),mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
            return route.fulfill({contentType:mime[ext]||'application/octet-stream',body});
        });
        await page.goto('http://127.0.0.1:9876/');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();

        await page.locator('.setup-object[data-setup-category="sources"]').click();
        const strip=page.locator('#equipment-catalog>.overflow-y-auto');
        await strip.hover();await page.mouse.wheel(0,180);
        await page.waitForFunction(()=>document.querySelector('#equipment-catalog>.overflow-y-auto').scrollLeft>80);
        await page.waitForTimeout(650);
        const forward=await strip.evaluate(el=>el.scrollLeft);
        await page.mouse.wheel(0,-100);
        await page.waitForFunction(before=>document.querySelector('#equipment-catalog>.overflow-y-auto').scrollLeft<before-40,forward);
        await page.waitForTimeout(650);
        const reverse=await strip.evaluate(el=>el.scrollLeft);
        await page.mouse.wheel(140,0);
        await page.waitForFunction(before=>document.querySelector('#equipment-catalog>.overflow-y-auto').scrollLeft>before+40,reverse);
        await page.waitForTimeout(650);
        assert.equal(await strip.evaluate(el=>el.scrollTop),0,'wheel movement stays horizontal');
        await strip.evaluate(el=>el.scrollLeft=0);
        for(const viewport of [{width:1600,height:900},{width:390,height:844},{width:1100,height:420}]){
            await page.setViewportSize(viewport);await page.waitForTimeout(150);
            const geometry=await page.evaluate(()=>{
                const dock=document.getElementById('equipment-catalog'),path=dock.querySelector('.catalog-dock-silhouette path'),search=dock.querySelector('.catalog-search');
                const d=dock.getBoundingClientRect(),s=search.getBoundingClientRect(),canvas=document.getElementById('canvas'),c=canvas.getBoundingClientRect();
                const x=s.left-d.left,y=s.top-d.top,r=parseFloat(getComputedStyle(search).borderRadius),clearance=12;
                const tray=dock.querySelector(':scope > .overflow-y-auto'),trayTop=tray.offsetTop;
                const squareRight=path.isPointInFill(new DOMPoint(d.width-1,trayTop+1));
                const points=[[x+s.width/2,y-clearance],[x-clearance,y+s.height/2],[x+s.width+clearance,y+s.height/2]];
                for(const right of [false,true])for(let angle=0;angle<=Math.PI/2;angle+=Math.PI/12){
                    points.push([(right?x+s.width-r:x+r)+(right?1:-1)*(r+clearance)*Math.sin(angle),y+r-(r+clearance)*Math.cos(angle)]);
                }
                return {squareRight,rightRadius:getComputedStyle(tray).borderTopRightRadius,fits:points.every(([x,y])=>path.isPointInFill(new DOMPoint(x,y))),overflow:getComputedStyle(canvas).overflow,clip:getComputedStyle(canvas).clipPath,paintBottom:parseFloat(getComputedStyle(canvas,'::before').bottom),canvasBottom:c.bottom,dockTop:d.top};
            });
            assert(geometry.squareRight,'the silhouette meets the right edge squarely');
            assert.equal(geometry.rightRadius,'0px','scroll clipping retains the square right edge');
            assert(geometry.fits,JSON.stringify({viewport,geometry}));
            assert.equal(geometry.overflow,'visible');assert(geometry.clip.startsWith('inset('));assert(geometry.paintBottom<0);
            assert(Math.abs(geometry.canvasBottom-geometry.dockTop)<=1,'usable canvas ends at dock');
            await page.mouse.move(viewport.width-50,80);
            const dock=await page.locator('#equipment-catalog').boundingBox();
            await page.screenshot({path:`/tmp/dock-search-fixed-${viewport.width}.png`,clip:{x:0,y:dock.y-40,width:Math.min(viewport.width,1100),height:Math.min(dock.height+40,viewport.height-dock.y+40)}});
        }
        await page.setViewportSize({width:1600,height:900});
        for(const theme of ['light','sepia','graphite','midnight']){
            await page.evaluate(theme=>__signal.setCanvasTheme(theme),theme);await page.waitForTimeout(100);
            const dock=await page.locator('#equipment-catalog').boundingBox();
            await page.screenshot({path:`/tmp/dock-search-fixed-${theme}.png`,clip:{x:0,y:dock.y-25,width:1000,height:120}});
        }
        assert.deepEqual(errors,[]);console.log('Horizontal wheel, reverse and trackpad scrolling; dock search clearance and responsive canvas bounds passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
