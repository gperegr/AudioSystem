const {test}=require('node:test');
const assert=require('node:assert/strict');
const {route}=require('../src/modules/orthogonal-cables.js');
const length=points=>points.slice(1).reduce((n,p,i)=>n+Math.abs(p.x-points[i].x)+Math.abs(p.y-points[i].y),0);
function check(points,start,end,obstacles=[]){
    assert.deepEqual(points[0],start);assert.deepEqual(points.at(-1),end);
    for(let i=1;i<points.length;i++){
        const a=points[i-1],b=points[i];
        assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));
        assert.ok((a.x===b.x)!==(a.y===b.y),'segments must be nonzero and axis aligned');
        for(const r of obstacles){
            const crosses=a.y===b.y?a.y>r.top&&a.y<r.bottom&&Math.max(a.x,b.x)>r.left&&Math.min(a.x,b.x)<r.right:
                a.x>r.left&&a.x<r.right&&Math.max(a.y,b.y)>r.top&&Math.min(a.y,b.y)<r.bottom;
            assert.equal(crosses,false,`crosses obstacle: ${JSON.stringify({a,b,r})}`);
        }
        if(i>1){const p=points[i-2];assert.ok(!((p.x===a.x&&a.x===b.x)||(p.y===a.y&&a.y===b.y)),'no retracing or redundant corners');}
    }
}
function reserve(points){
    return points.slice(1).map((b,i)=>{const a=points[i];return a.y===b.y?
        {axis:'h',left:Math.min(a.x,b.x),right:Math.max(a.x,b.x),y:a.y}:
        {axis:'v',top:Math.min(a.y,b.y),bottom:Math.max(a.y,b.y),x:a.x};});
}
test('uses a local Manhattan route, independent of bundle slack and distant equipment',()=>{
    const a={x:0,y:0},b={x:900,y:0},obstacles=[{left:-10,right:1000,top:200,bottom:1600}];
    for(const offset of [0,7,1000]){const points=route(a,b,obstacles,[],offset);check(points,a,b,obstacles);assert.equal(length(points),964);assert.equal(Math.max(...points.map(p=>p.y)),32);}
});
test('stacked terminals stay near the connectors rather than circling their chassis',()=>{
    const a={x:600,y:400},b={x:626,y:600};const points=route(a,b);
    check(points,a,b);assert.equal(length(points),290);assert.ok(points.every(p=>p.x>=600&&p.x<=626&&p.y<=632));
});
test('chooses the near side of a tall obstruction instead of descending to its bottom',()=>{
    const a={x:0,y:0},b={x:100,y:100},obstacles=[{left:30,right:70,top:40,bottom:1000}];
    const points=route(a,b,obstacles);check(points,a,b,obstacles);assert.equal(length(points),264);assert.ok(Math.max(...points.map(p=>p.y))<150);
});
test('shortens the connector exit when another chassis is immediately underneath',()=>{
    const a={x:0,y:0},b={x:100,y:0},obstacles=[{left:-10,right:30,top:18,bottom:300}];
    const points=route(a,b,obstacles);check(points,a,b,obstacles);assert.equal(points[1].y,18);assert.ok(length(points)<200);
});
test('separates long stereo runs by 18px without moving either cable outside the assembly',()=>{
    const first=route({x:0,y:0},{x:900,y:0});const a={x:26,y:0},b={x:926,y:0},points=route(a,b,[],reserve(first));
    check(points,a,b);const horizontal=points.find((p,i)=>i&&p.y===points[i-1].y&&Math.abs(p.x-points[i-1].x)>100);
    assert.equal(horizontal.y,50);assert.equal(length(points),1000);
});
test('crowded cable lanes cannot add more than 72px of detour',()=>{
    const a={x:0,y:0},b={x:900,y:0};const lanes=Array.from({length:30},(_,i)=>({axis:'h',left:-100,right:1000,y:i*18}));
    const points=route(a,b,[],lanes);check(points,a,b);assert.ok(length(points)<=length(route(a,b))+72);assert.ok(Math.max(...points.map(p=>p.y))<100);
});
test('routes through multiple obstacles in either connection direction',()=>{
    const obstacles=[{left:80,right:160,top:-60,bottom:200},{left:200,right:280,top:80,bottom:400},{left:320,right:380,top:-50,bottom:170}];
    for(const [a,b] of [[{x:0,y:0},{x:500,y:100}],[{x:500,y:100},{x:0,y:0}]]){const points=route(a,b,obstacles);check(points,a,b,obstacles);assert.ok(length(points)<1300);}
});
