const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const source=readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('        function listeningCurveHtml('),source.indexOf('        const INTEGRATED_AMPS=')),context);

function filter(responseDb){
    return {getFrequencyResponse(frequencies,magnitude,phase){
        frequencies.forEach((frequency,index)=>{magnitude[index]=10**(responseDb(frequency)/20);phase[index]=0;});
    }};
}
function render(responseDb,headroomDb,extraFilters=[]){
    const html=context.listeningCurveHtml({
        listeningProfile:{label:'Test profile',headroomDb},
        voicingNodes:[{gain:{value:10**((headroomDb??-4)/20)}},filter(responseDb),...extraFilters]
    });
    const bands=[...html.matchAll(/<div class="sonic-band" data-tone="([^"]+)"[\s\S]*?<span class="sonic-band-dots"[^>]*>([\s\S]*?)<\/span>/g)];
    assert.equal(bands.length,3);
    const states=bands.map(match=>match[1]);
    const positions=bands.map(match=>{
        const dots=[...match[2].matchAll(/<i class="([^"]*)"><\/i>/g)];
        assert.equal(dots.length,5);
        assert.equal(dots.filter(dot=>dot[1].includes('is-active')).length,1);
        assert.ok(dots[2][1].includes('is-neutral'));
        return dots.findIndex(dot=>dot[1].includes('is-active'));
    });
    return {html,states,positions};
}

test('flat headphones and speakers stay neutral for every global headroom setting',()=>{
    for(const headroomDb of [undefined,-4,-6,-8,-12]){
        const result=render(()=>0,headroomDb);
        assert.deepEqual(result.states,['neutro','neutro','neutro']);
        assert.deepEqual(result.positions,[2,2,2]);
        // A flat response is also drawn on the 0 dB reference line.
        const path=result.html.match(/<path d="([^"]+)"/)[1];
        assert.ok([...path.matchAll(/,([\d.]+)/g)].every(point=>Number(point[1])===84));
    }
});

test('the active dots show cuts and boosts relative to the graph, regardless of headroom',()=>{
    for(const headroomDb of [-4,-8,-12]){
        const result=render(frequency=>frequency<250?-5:frequency<3000?0:2,headroomDb);
        assert.deepEqual(result.states,['recuo-forte','neutro','realce-leve']);
        assert.deepEqual(result.positions,[0,2,3]);
    }
});

test('neutral, mild and strong deviations use the same thresholds in all three bands',()=>{
    for(const [gain,expected,position] of [
        [-4.1,'recuo-forte',0],[-3.9,'recuo-leve',1],[-1.1,'recuo-leve',1],
        [-.9,'neutro',2],[.9,'neutro',2],[1.1,'realce-leve',3],
        [3.9,'realce-leve',3],[4.1,'realce-forte',4]
    ]){
        const result=render(()=>gain,-8);
        assert.deepEqual(result.states,Array(3).fill(expected));
        assert.deepEqual(result.positions,Array(3).fill(position));
    }
});

test('indicators include the combined response of all filters rather than individual settings',()=>{
    const result=render(()=>3,-12,[filter(()=>-5)]);
    assert.deepEqual(result.states,['recuo-leve','recuo-leve','recuo-leve']);
    assert.deepEqual(result.positions,[1,1,1]);
});

test('a narrow peak and out-of-band rolloff do not misrepresent a broad neutral band',()=>{
    const result=render(frequency=>frequency<60?-20:frequency>1400&&frequency<1500?5:frequency>12000?8:0,-8);
    assert.deepEqual(result.states,['neutro','neutro','neutro']);
    assert.match(result.html,/Média da curva entre 60 e 200 Hz/);
    assert.match(result.html,/Média da curva entre 300 e 2500 Hz/);
    assert.match(result.html,/Média da curva entre 5000 e 12000 Hz/);
});
