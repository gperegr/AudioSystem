const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.join(__dirname,'..');
const app=readFileSync(path.join(root,'script.js'),'utf8');
const inventory=require('./fixtures/equipment-contract-types.json').types;
const translationSource=readFileSync(path.join(root,'src/i18n/languages.js'),'utf8');
const translations=new Map([...translationSource.matchAll(/^\s*'((?:\\.|[^'])*)'\s*:\s*'((?:\\.|[^'])*)',?\s*$/gm)].map(match=>[match[1],match[2]]));

function extract(start,end,name= start.match(/const\s+([\w$]+)/)?.[1],dependencies={}){
    const from=app.indexOf(start),to=app.indexOf(end,from);
    assert(from>=0&&to>from,`source contains ${start}`);
    return vm.runInNewContext(app.slice(from,to)+`;${name}`,dependencies);
}
function positiveDimensions(table,label){
    for(const [type,item]of Object.entries(table)){
        assert(inventory.includes(type),`${label}: ${type} must be registered in the explicit equipment inventory`);
        assert(Number.isFinite(item.width)&&item.width>0,`${type} requires a positive width`);
        assert(Number.isFinite(item.height)&&item.height>0,`${type} requires a positive height`);
    }
}
function validRatings(table,label,fields){
    for(const [type,spec]of Object.entries(table)){
        assert(inventory.includes(type),`${label}: ${type} must be in the equipment inventory`);
        for(const field of fields)assert(Number.isFinite(spec[field])&&spec[field]>0,`${type} requires a valid ${field}`);
    }
}

test('catalog equipment matches the reviewed contract inventory exactly',()=>{
    const names=extract('const DEVICE_NAMES =','const DEVICE_FAMILIES');
    assert.deepEqual(Object.keys(names).sort(),inventory);
    for(const [type,name]of Object.entries(names)){
        assert.equal(typeof name,'string',`${type} needs a Portuguese display name`);
        assert(name.trim(),`${type} needs a non-empty display name`);
        assert(translations.has(name),`${type} display name has no English translation: ${name}`);
        assert(translations.get(name).trim(),`${type} English display name is empty`);
    }
});

test('uncategorized equipment is rejected instead of entering the catalog by fallback',()=>{
    const catalogSource=readFileSync(path.join(root,'src/app/08-catalog-ui.js'),'utf8');
    assert.match(catalogSource,/catalogUnassigned=catalogItems\.filter\(item=>!catalogAssigned\.has\(item\)\)/);
    assert.match(catalogSource,/if\(catalogUnassigned\.length\)throw new Error\(`Equipment contract missing catalog category:/);
    assert.doesNotMatch(catalogSource,/appendCatalogGroup\('Outros equipamentos'/);
});

test('dimension-bearing catalog models declare positive, supported dimensions',()=>{
    const furniture=extract('const FURNITURE_TYPES =','const WALL_LAMP_TYPES');
    const shelves=extract('const BOOKSHELF_SPEAKERS=','const FLOOR_SPEAKERS');
    const floors=extract('const FLOOR_SPEAKERS=','const PASSIVE_SPK');
    positiveDimensions(furniture,'furniture');
    positiveDimensions(shelves,'bookshelf speaker');
    for(const [type,item]of Object.entries(floors)){
        assert(inventory.includes(type),`${type} must be in the equipment inventory`);
        assert(Number.isFinite(item.height)&&item.height>0&&Number.isFinite(item.cabinet)&&item.cabinet>0,`${type} requires positive height and cabinet width`);
    }
    const adapterSource=readFileSync(path.join(root,'src/modules/adapter-design.js'),'utf8');
    const adapters=vm.runInNewContext(adapterSource+';AudioAdapterDesign.models');
    assert.deepEqual(Object.keys(adapters).sort(),['adapterP10P2','adapterP10Rca','adapterP2P10','adapterP2Rca','adapterRcaP10','adapterRcaP2'].sort());
    for(const [type,item]of Object.entries(adapters)){
        assert(inventory.includes(type),`${type} must be in the equipment inventory`);
        assert(item.width>0&&item.height>0&&item.artWidth>0&&item.artHeight>0,`${type} requires chassis and artwork dimensions`);
        assert(item.input&&item.output,`${type} declares both connector formats`);
    }
});

test('electrical ratings exist and are physically positive for each declared model',()=>{
    const amps=extract('const FIXED_AMP_SPECS=','const FIXED_PASSIVE_SPECS');
    const passive=extract('const FIXED_PASSIVE_SPECS=','const isRecommendedSpeakerPower');
    const active=extract('const ACTIVE_SPEAKER_RATINGS=','const ACTIVE_SUB_RATINGS');
    const subs=extract('const ACTIVE_SUB_RATINGS=','const REFERENCE_HEADPHONES');
    const references=extract('const REFERENCE_HEADPHONES=','const HP_TYPES');
    const headphones=extract('const HEADPHONE_SPECS=','const HEADPHONE_OUTPUT_SPECS','HEADPHONE_SPECS',{REFERENCE_HEADPHONES:references});
    const outputs=extract('const HEADPHONE_OUTPUT_SPECS=','const headphoneOutputSpec');
    const voicings=extract('const AMPLIFICATION_VOICINGS=','function modelSaturationCurve');
    const listening=extract('const LISTENING_PROFILES =','function speakerFilterCoefficients');
    validRatings(amps,'amplifier',['watts','minOhms']);
    validRatings(passive,'passive speaker',['watts','ohms']);
    validRatings(active,'active speaker',['watts','inputOhms']);
    validRatings(subs,'active subwoofer',['watts','inputOhms']);
    validRatings(headphones,'headphone',['ohms','powerMw']);
    validRatings(outputs,'headphone output',['voltsRms','currentRms','outputOhms']);
    for(const [type,spec]of Object.entries(amps)){
        assert(voicings[type],`${type} needs an amplifier behavior profile`);
        assert.equal(spec.powerByOhms[8],spec.watts,`${type} nominal rating must match its 8 Ω rating`);
        for(const [ohms,watts]of Object.entries(spec.powerByOhms))assert(Number(ohms)>=spec.minOhms&&watts>0,`${type} has a valid ${ohms} Ω load rating`);
    }
    for(const [type]of Object.entries({...passive,...active,...subs,...headphones}))assert(listening[type],`${type} needs a listening behavior profile`);
});

test('real browser contract suite covers factory dimensions, ports, power, compatibility, and localization',()=>{
    const browserSuite=readFileSync(path.join(__dirname,'equipment-contracts.browser.cjs'),'utf8');
    for(const term of ['createDevice','getPortCompatibility','getBoundingClientRect','power-btn','AudioSystemLanguage.translate','dataset.node','dataset.io'])assert(browserSuite.includes(term),`browser contract must validate ${term}`);
});
