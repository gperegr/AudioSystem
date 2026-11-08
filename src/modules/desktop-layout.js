/* One desktop layout on all devices. Native viewport scaling preserves pointer/grid coordinates. */
(() => {
    'use strict';
    const viewport=document.querySelector('meta[name="viewport"]');
    let lastWidth=0;
    function fitDesktopViewport(){
        const visual=window.visualViewport;
        const available=Math.round(visual?visual.width*visual.scale:window.innerWidth);
        const width=Math.max(1280,available);
        if(width===lastWidth)return;
        lastWidth=width;
        viewport.content=`width=${width}, viewport-fit=cover`;
    }
    fitDesktopViewport();
    window.addEventListener('resize',fitDesktopViewport,{passive:true});
    window.addEventListener('orientationchange',()=>requestAnimationFrame(fitDesktopViewport));
})();
