/* One desktop layout on all devices. Native viewport scaling preserves pointer/grid coordinates. */
(() => {
    'use strict';
    const viewport=document.querySelector('meta[name="viewport"]');
    let lastWidth=0,heightFrame=0;
    function fitDesktopViewport(){
        const visual=window.visualViewport;
        const available=Math.round(visual?visual.width*visual.scale:window.innerWidth);
        const width=Math.max(1280,available);
        if(width===lastWidth)return;
        lastWidth=width;
        viewport.content=`width=${width}, viewport-fit=cover`;
    }
    function fitDesktopHeight(){
        if(heightFrame)return;
        heightFrame=requestAnimationFrame(()=>{
            heightFrame=0;
            const visual=window.visualViewport;
            // Browser bars and keyboards change the visible height independently of 100vh.
            // Keep the workspace stable while the user pinches into the desktop layout.
            if(visual&&visual.width<document.documentElement.clientWidth-1)return;
            document.documentElement.style.setProperty('--desktop-viewport-height',(visual?.height||window.innerHeight)+'px');
        });
    }
    fitDesktopViewport();
    fitDesktopHeight();
    window.addEventListener('resize',fitDesktopViewport,{passive:true});
    window.addEventListener('orientationchange',()=>requestAnimationFrame(fitDesktopViewport));
    window.addEventListener('resize',fitDesktopHeight,{passive:true});
    window.addEventListener('pageshow',fitDesktopHeight,{passive:true});
    window.visualViewport?.addEventListener('resize',fitDesktopHeight,{passive:true});
})();
