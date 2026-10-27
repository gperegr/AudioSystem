const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const source=readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');

function evaluate(start,end,expression,context={}){
    const from=source.indexOf(start),to=source.indexOf(end,from);
    assert.ok(from>=0&&to>from,`source section ${start} exists`);
    return vm.runInNewContext(source.slice(from,to)+`\n${expression}`,context);
}

test('every catalog speaker and headphone has a matching response profile',()=>{
    const profiles=evaluate('        const LISTENING_PROFILES =','        function speakerFilterCoefficients','LISTENING_PROFILES');
    const types=['speaker','spkPassiveWood','spkPassiveCarbon','spkPassiveGridBlack','spkPassiveGridOrange','shelfCoax','shelfWood','shelfTop','floorDiamond','floorCoax','floorFlax','spkActiveRounded','spkActiveMonitor','spkActiveBookshelf','spkActiveCompact','headphone','hpStudio','hpClassic','hpMonitor','hpMax','hpKubaDisco2','hpOpenRing','hpOpenDome','hpPlanar','subwoofer','subwooferCube','subwooferPro','subwooferPassive','subwooferPassiveVintage'];
    assert.deepEqual(types.filter(type=>!profiles[type]),[]);
    assert.equal(profiles.subwoofer.filterSpecs[0].frequency,120);
    assert.equal(profiles.subwooferPro.filterSpecs[0].frequency,100);
    assert.ok(profiles.subwoofer.filterSpecs[0].type==='lowpass');
});

test('the subwoofer signature filter is a real 2nd order low-pass at its displayed cutoff',()=>{
    const context={};
    evaluate('        function speakerFilterCoefficients(','        function floorListeningFilters','this.speakerFilterCoefficients=speakerFilterCoefficients;',context);
    const {feedforward:b,feedback:a}=context.speakerFilterCoefficients({type:'lowpass',frequency:120,Q:Math.SQRT1_2},48000);
    const magnitude=frequency=>{
        const angle=2*Math.PI*frequency/48000,c=Math.cos(angle),s=Math.sin(angle),c2=Math.cos(2*angle),s2=Math.sin(2*angle);
        const numerator=Math.hypot(b[0]+b[1]*c+b[2]*c2,b[1]*s+b[2]*s2);
        const denominator=Math.hypot(1+a[1]*c+a[2]*c2,a[1]*s+a[2]*s2);
        return 20*Math.log10(numerator/denominator);
    };
    assert.ok(Math.abs(magnitude(120)+3.01)<.08);
    assert.ok(magnitude(40)>-0.1);
    assert.ok(magnitude(1000)<-35);
});

test('catalog ratings describe the electrical quantity they actually show',()=>{
    const context={
        HEADPHONE_SPECS:{hpOpenRing:{ohms:300,powerMw:500}},FLOOR_SPEAKERS:{},BOOKSHELF_SPEAKERS:{},
        FIXED_PASSIVE_SPECS:{speaker:{ohms:8,watts:80},subwooferPassive:{ohms:4,watts:250}},
        ACTIVE_SPEAKER_RATINGS:{spkActiveMonitor:{watts:60,inputOhms:10000}},ACTIVE_SUB_RATINGS:{},
        FIXED_AMP_SPECS:{integratedBlue:{watts:100,minOhms:4,powerByOhms:{4:160,8:100}}},
        HEADPHONE_OUTPUT_SPECS:{headphoneAmpModern:{voltsRms:4,currentRms:.18,outputOhms:1},receiver:{voltsRms:3,currentRms:.04,outputOhms:47}},
        PASSIVE_SUB_TYPES:new Set(['subwooferPassive']),isRecommendedSpeakerPower:()=>false
    };
    evaluate('        function catalogRatingVisualHtml(','        const INTEGRATED_AMPS=',
        'this.catalogRatingVisualHtml=catalogRatingVisualHtml;',context);
    const renderer=context;
    const passive=renderer.catalogRatingVisualHtml('speaker');
    assert.match(passive,/Potência de entrada suportada: 80 W/);
    assert.match(passive,/Impedância nominal: 8 Ω/);
    const headphone=renderer.catalogRatingVisualHtml('hpOpenRing');
    assert.match(headphone,/Potência máxima de entrada do fone: 500 mW/);
    assert.match(headphone,/Impedância nominal do fone: 300 Ω/);
    const ampOutput=renderer.catalogRatingVisualHtml('headphoneAmpModern');
    assert.match(ampOutput,/Potência estimada entregue em 32 Ω: 470 mW/);
    assert.match(ampOutput,/Resistência de saída: 1 Ω/);
    assert.match(renderer.catalogRatingVisualHtml('receiver'),/Potência estimada entregue em 32 Ω: 46 mW/);
    assert.match(renderer.catalogRatingVisualHtml('subwooferPassive'),/Impedância por bobina: 4 Ω/);
});

test('amplifier electrical ratings and tonal voicings exist for every modeled power amplifier',()=>{
    const amps=evaluate('        const FIXED_AMP_SPECS=','        const FIXED_PASSIVE_SPECS','FIXED_AMP_SPECS');
    const voicings=evaluate('        const AMPLIFICATION_VOICINGS=','        function modelSaturationCurve','AMPLIFICATION_VOICINGS');
    assert.deepEqual(Object.keys(amps).filter(type=>!voicings[type]),[]);
    for(const [type,spec]of Object.entries(amps)){
        assert.ok(Number.isFinite(spec.minOhms)&&spec.minOhms>0,`${type} has a valid minimum load`);
        assert.ok(spec.powerByOhms[8]===spec.watts,`${type} nominal watts match its 8 Ω rating`);
        for(const [ohms,watts]of Object.entries(spec.powerByOhms))assert.ok(Number(ohms)>=spec.minOhms&&watts>0,`${type} has a valid ${ohms} Ω rating`);
    }
});
