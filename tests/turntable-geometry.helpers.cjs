const assert=require('node:assert/strict');
module.exports=async function verifyGeometry(page,deck,prefix){
    // Native button interaction must articulate the same five-sided cover as the existing deck.
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.evaluate(()=>{
        __signal.createDevice('turntable',0,0,'lid-reference');
        __signal.appState.project.devices['lid-reference'].el.style.visibility='hidden';
    });
    const snapshot=()=>deck.evaluate(el=>{
        const cover=el.querySelector('.at-dust-cover'),style=getComputedStyle(cover),m=new DOMMatrixReadOnly(style.transform);
        const reference=document.querySelector('#lid-reference .at-dust-cover'),r=new DOMMatrixReadOnly(getComputedStyle(reference).transform);
        const box=node=>{const b=node.getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};};
        return {rotation:[m.m11,m.m22,m.m23,m.m32,m.m33],reference:[r.m11,r.m22,r.m23,r.m32,r.m33],surfaces:[...cover.children].map(n=>getComputedStyle(n).display),hinge:box(el.querySelector('.at-lid-hinge')),controls:[...el.querySelectorAll('.at-controls button,.at-controls [role=slider],.at-io .port')].map(box),base:box(el),front:box(el.querySelector('.at-cover-front'))};
    });
    const closed=await snapshot();assert.deepEqual(closed.rotation,closed.reference,'closed cover shares the standard hinge transform');
    assert(closed.surfaces.every(v=>v!=='none'),'all five cover surfaces must remain visible');
    for(const box of closed.controls){assert(box.x>=closed.base.x-1&&box.right<=closed.base.right+1,'control inside chassis');assert(box.bottom<=closed.base.bottom+1,'control above base');}
    for(let i=0;i<closed.controls.length;i++)for(let j=i+1;j<closed.controls.length;j++){
        const a=closed.controls[i],b=closed.controls[j];assert(!(Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1),'controls must not overlap');
    }
    await deck.locator('.tt-lid-button').click();
    await page.evaluate(()=>__signal.appState.project.devices['lid-reference'].setLidOpen(true));
    const open=await snapshot();assert.deepEqual(open.rotation,open.reference,'open cover shares standard articulation');assert.notDeepEqual(open.rotation,closed.rotation);
    assert.deepEqual(open.hinge,closed.hinge,'rear hinge stays attached');assert(Math.abs(open.front.y-closed.front.y)>20,'front panel moves around hinge');
    await page.screenshot({path:`/tmp/${prefix}-lid-open.png`});
    await deck.locator('.tt-lid-button').focus();await page.keyboard.press('Enter');
    assert.equal(await deck.locator('.tt-lid-button').getAttribute('aria-expanded'),'false');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await deck.locator('.tt-lid-button').click();
    await page.waitForFunction(id=>new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#'+id+' .at-dust-cover')).transform).m22<-.33,await deck.getAttribute('id'));
    await deck.locator('.tt-lid-button').click();
    await page.waitForFunction(id=>Math.abs(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#'+id+' .at-dust-cover')).transform).m22-1)<.001,await deck.getAttribute('id'));
    await page.evaluate(()=>__signal.deleteDevice(__signal.appState.project.devices['lid-reference'],false));
};
