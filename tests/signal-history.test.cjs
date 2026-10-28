const {test}=require('node:test');
const assert=require('node:assert/strict');
const history=require('../src/modules/signal-history.js');

test('signal levels use RMS and absolute peaks without cancelling opposite polarity',()=>{
    assert.deepEqual(history.measure([.5,-.5,.5,-.5]),{rms:.5,peak:.5});
    assert.deepEqual(history.measure([]),{rms:0,peak:0});
    assert.equal(history.measure([NaN,Infinity]).peak,0);
    assert.equal(history.db(0),-Infinity);
    assert.ok(Math.abs(history.db(.5)+6.0206)<.0001);
    assert.equal(history.scale(0),0);assert.equal(history.scale(2),1);
});
test('silence, low levels and digital peaks are distinct from modeled clipping',()=>{
    assert.equal(history.status({rms:0,peak:0},false),'silent');
    assert.equal(history.status({rms:.003,peak:.005},false),'low');
    assert.equal(history.status({rms:.05,peak:.1},false),'signal');
    assert.equal(history.status({rms:.2,peak:1},false),'high');
    assert.equal(history.status({rms:.2,peak:.3},true),'clip');
});
test('the live window expires old data and drops gaps after backgrounding',()=>{
    const samples=[];
    for(let now=0;now<=20000;now+=80)history.append(samples,now,{rms:.1,peak:.2});
    assert.equal(samples.length,151);assert.equal(samples[0].time,8000);
    assert.match(history.path(samples,20000),/^M0\.0,/);
    assert.match(history.path(samples,20000),/L240\.0,/);
    history.append(samples,21000,{rms:0,peak:0});assert.equal(samples.length,1);
});
test('overload events remain visible after the current level returns to normal',()=>{
    const samples=[];
    history.append(samples,0,{rms:.1,peak:.2},true);
    history.append(samples,80,{rms:.1,peak:1.1});
    history.append(samples,160,{rms:.1,peak:.2});
    assert.equal(history.clips(samples,160).match(/M/g).length,2);
});
