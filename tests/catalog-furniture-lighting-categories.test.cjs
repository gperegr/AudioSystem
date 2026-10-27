const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');

const source=readFileSync(path.join(__dirname,'../script.js'),'utf8');

test('catalog separates furniture from lighting and offers both mobile shortcuts',()=>{
    assert.match(source,/\['Móveis',type=>!!FURNITURE_TYPES\[type\]\]/);
    assert.match(source,/\['Iluminação',type=>type==='pendantLamp'\|\|!!WALL_LAMP_TYPES\[type\]\]/);
    assert.match(source,/data-category-target="Móveis"/);
    assert.match(source,/data-category-target="Iluminação"/);
});
