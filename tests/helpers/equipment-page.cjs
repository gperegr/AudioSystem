const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
module.exports=async browser=>{
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
            assert(index>0);
            const hook='window.__signal=window.__equipment={createDevice,selectDevice,deleteDevice,toggleDevicePower,setSourcePlaying,applySavedDevice,projectCapture,restoreLocalProject,createSpotifyVinyl,placeSpotifyVinyl,removeSpotifyVinyl,connectProjectPorts,appState};\n';
            body=source.slice(0,index)+hook+source.slice(index);
        }
        const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json'};
        return route.fulfill({contentType:mime[path.extname(file)]||'application/octet-stream',body});
    });
    require('./studio-entry.cjs')(page);
    await page.goto('http://127.0.0.1:9876/');
    await page.locator('#headphone-calibration-skip').click();
    await page.getByRole('button',{name:'Agora não',exact:true}).click();
    return {page,errors};
};
