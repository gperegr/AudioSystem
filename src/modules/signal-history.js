/* Shared signal statistics and bounded history. No application or DOM dependencies. */
(function(root,factory){
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.SignalHistory=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const FLOOR=-60,WINDOW_MS=12000;
    function measure(samples){
        let energy=0,peak=0;
        for(const value of samples){const sample=Number.isFinite(value)?value:0;energy+=sample*sample;peak=Math.max(peak,Math.abs(sample));}
        return {rms:samples.length?Math.sqrt(energy/samples.length):0,peak};
    }
    const db=value=>value>1e-6?20*Math.log10(value):-Infinity;
    const scale=value=>Math.max(0,Math.min(1,(db(value)-FLOOR)/-FLOOR));
    function append(history,now,reading,clipping=false){
        const previous=history.at(-1);
        // A paused or hidden panel has no measurements: never join across that gap.
        if(previous&&now-previous.time>500)history.length=0;
        history.push({time:now,rms:reading.rms,peak:reading.peak,clipping});
        while(history.length&&(history[0].time<now-WINDOW_MS||history.length>151))history.shift();
        return history;
    }
    function status(reading,clipping){
        if(clipping)return 'clip';
        if(reading.peak>=.999)return 'high';
        if(db(reading.peak)<=FLOOR)return 'silent';
        return db(reading.rms)<-45?'low':'signal';
    }
    function path(history,now,key='rms'){
        return history.map((sample,index)=>`${index?'L':'M'}${Math.max(0,Math.min(240,240*(1-(now-sample.time)/WINDOW_MS))).toFixed(1)},${(25-24*scale(sample[key])).toFixed(1)}`).join(' ');
    }
    function clips(history,now){
        return history.filter(sample=>sample.clipping||sample.peak>=.999).map(sample=>`M${Math.max(0,240*(1-(now-sample.time)/WINDOW_MS)).toFixed(1)},1v24`).join(' ');
    }
    return Object.freeze({measure,db,scale,append,status,path,clips,WINDOW_MS});
});
