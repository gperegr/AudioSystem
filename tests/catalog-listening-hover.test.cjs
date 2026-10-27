const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=readFileSync(path.join(__dirname,'../script.js'),'utf8');

test('the hover filter includes every passive/active speaker, subwoofer and headphone type',()=>{
    const context=vm.createContext({
        PASSIVE_SPK:new Set(['speaker','spkPassiveWood','spkPassiveCarbon','spkPassiveGridBlack','spkPassiveGridOrange','shelfCoax','shelfWood','shelfTop','floorDiamond','floorCoax','floorFlax']),
        ACTIVE_SPK:new Set(['spkActiveRounded','spkActiveMonitor','spkActiveBookshelf','spkActiveCompact']),
        HP_TYPES:new Set(['headphone','hpStudio','hpClassic','hpMonitor','hpMax','hpKubaDisco2','hpOpenRing','hpOpenDome','hpPlanar']),
        SUB_TYPES:new Set(['subwoofer','subwooferCube','subwooferPro']),
        PASSIVE_SUB_TYPES:new Set(['subwooferPassive','subwooferPassiveVintage'])
    });
    const start=source.indexOf('        const isCatalogListeningType='),end=source.indexOf('        let catalogAmpTimer=',start);
    assert.ok(start>=0&&end>start,'catalog hover filter must exist');
    vm.runInContext(source.slice(start,end)+'\nthis.isCatalogListeningType=isCatalogListeningType;',context);
    const types=['speaker','spkPassiveWood','spkPassiveCarbon','spkPassiveGridBlack','spkPassiveGridOrange','shelfCoax','shelfWood','shelfTop','floorDiamond','floorCoax','floorFlax','spkActiveRounded','spkActiveMonitor','spkActiveBookshelf','spkActiveCompact','headphone','hpStudio','hpClassic','hpMonitor','hpMax','hpKubaDisco2','hpOpenRing','hpOpenDome','hpPlanar','subwoofer','subwooferCube','subwooferPro','subwooferPassive','subwooferPassiveVintage'];
    assert.deepEqual(types.filter(type=>!context.isCatalogListeningType(type)),[]);
});

test('visual electrical indicators show both power and impedance without prose blocks',()=>{
    const context=vm.createContext({
        HEADPHONE_SPECS:{hpOpenRing:{ohms:300,powerMw:500}},FLOOR_SPEAKERS:{},BOOKSHELF_SPEAKERS:{},
        FIXED_PASSIVE_SPECS:{speaker:{ohms:8,watts:80}},
        ACTIVE_SPEAKER_RATINGS:{spkActiveMonitor:{watts:60,inputOhms:10000}},ACTIVE_SUB_RATINGS:{},
        FIXED_AMP_SPECS:{integratedBlue:{watts:100,minOhms:4,powerByOhms:{4:160,8:100}}},
        HEADPHONE_OUTPUT_SPECS:{headphoneAmpModern:{voltsRms:4,currentRms:.18,outputOhms:1}}
    });
    const start=source.indexOf('        function catalogRatingVisualHtml('),end=source.indexOf('        const INTEGRATED_AMPS=',start);
    assert.ok(start>=0&&end>start,'catalog electrical indicator renderer must exist');
    vm.runInContext(source.slice(start,end)+'\nthis.catalogRatingVisualHtml=catalogRatingVisualHtml;',context);
    for(const [type,values] of [['speaker',['80','W','8','Ω']],['spkActiveMonitor',['60','W','10k','Ω']],['hpOpenRing',['500','mW','300','Ω']]]){
        const html=context.catalogRatingVisualHtml(type);
        assert.equal((html.match(/class="catalog-rating"/g)||[]).length,2);
        for(const value of values)assert.ok(html.includes(value),`${type} visual contains ${value}`);
    }
    const amp=context.catalogRatingVisualHtml('integratedBlue');
    assert.ok(amp.includes('100')&&amp.includes('W')&&amp.includes('8')&&amp.includes('Ω'));
    const headphoneAmp=context.catalogRatingVisualHtml('headphoneAmpModern');
    assert.ok(headphoneAmp.includes('500')&&headphoneAmp.includes('mW')&&headphoneAmp.includes('1')&&headphoneAmp.includes('Ω'));
});

test('amplifier hovers preserve the visual trait dots alongside electrical ratings',()=>{
    const hover=source.slice(source.indexOf('const showCatalogAmpTip='),source.indexOf('catalogItems.filter(item=>AMPLIFICATION_VOICINGS'));
    assert.match(hover,/amplificationInspectorHtml\(\{amplificationProfile:AMPLIFICATION_VOICINGS\[type\]\}\)\}\$\{catalogRatingVisualHtml\(type\)\}/);
    assert.doesNotMatch(hover,/<p class="catalog-amp-description"/);
});
