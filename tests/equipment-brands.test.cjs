const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../src/modules/equipment-brands.js'),types=require('./fixtures/equipment-contract-types.json').types;
const excluded=new Set(['cdCollection','furnitureCoverflow','furnitureNiche','furnitureRack','furnitureRackSix','furnitureRackSixTall','furnitureRackTall','furnitureTable','hardwareDemo','pendantLamp','wallLampCage','wallLampDome']);
test('ten fictional manufacturers cover every audio device with unique models',()=>{
    assert.equal(Object.values(api.brands).filter(b=>b.group==='electronics').length,5);
    assert.equal(Object.values(api.brands).filter(b=>b.group==='listening').length,5);
    assert.deepEqual(Object.keys(api.products).sort(),types.filter(t=>!excluded.has(t)).sort());
    const labels=Object.keys(api.products).map(type=>api.name(type));assert.equal(new Set(labels).size,labels.length);
    for(const [type,p]of Object.entries(api.products)){assert(api.brands[p.brand]);assert(p.model.trim());assert(Object.isFrozen(p));assert(api.name(type).startsWith(api.brands[p.brand].name+' '));}
});
test('listening manufacturers each have both speakers and headphones',()=>{
    for(const b of Object.values(api.brands).filter(b=>b.group==='listening')){
        const models=Object.keys(api.products).filter(t=>api.products[t].brand===b.id);
        assert(models.some(t=>t.startsWith('hp')||t==='headphone'),b.name+' needs headphones');
        assert(models.some(t=>/^(spk|shelf|floor|speaker|subwoofer)/.test(t)),b.name+' needs speakers');
    }
});
test('model syntax follows each manufacturer and names retain translated function boundaries',()=>{
    const syntax={aurenne:/^[A-Z]-\d{3}$/,veltron:/^V \d{3}[ipstv]$/,nexora:/^NX-[A-Z]\d{2}$/,korden:/^KR-[A-Z]\d+$/,linholt:/^[MGUCA]-[A-Z0-9]+$/,bravora:/^[BASH]-\d{2}[BO]?$/,soryn:/^Form (?:\d[ACS]|H\d)$/,terevon:/^Reference [HPE]?\d$/,axiomer:/^[MSH]-\d{2}$/,dovara:/^D-[BSH]\d{2}$/};
    for(const [type,p]of Object.entries(api.products)){
        assert.match(p.model,syntax[p.brand],type);
        const role='Entrada · RCA estéreo';if(api.unprinted(type)){assert.equal(api.name(type,role),role);continue;}assert.deepEqual(api.splitName(api.name(type,role)),{product:api.name(type),role});
    }
    assert.equal(api.name('furnitureRack','Rack de Áudio'),'Rack de Áudio');assert.equal(api.splitName('Unknown · Item'),null);
});
test('logos are independent local SVG identities with no remote resources',()=>{
    const marks=new Set();for(const b of Object.values(api.brands)){
        const svg=fs.readFileSync(path.join(__dirname,'../assets/brands',b.id+'.svg'),'utf8');
        assert(svg.includes(b.name.toUpperCase()));assert(svg.includes('<svg'));assert(svg.includes('class="brand-wordmark"'));assert.doesNotMatch(svg,/<text[ >]/,'wordmarks must render outlined lettering rather than substituted fonts');assert.doesNotMatch(svg,/<image|<script|https?:\/\/(?!www\.w3\.org)/);marks.add(b.mark);
    }assert.equal(marks.size,10);
});
