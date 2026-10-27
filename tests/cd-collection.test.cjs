const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');

const source=readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
const configStart=source.indexOf('        const FURNITURE_TYPES =');
const configEnd=source.indexOf('        const WALL_LAMP_TYPES=');
const markupStart=source.indexOf('        function furnitureMarkup(type){');
const markupEnd=source.indexOf('        const BENCH_SURFACES=',markupStart);
const context={DEVICE_NAMES:{cdCollection:'Conjunto de CDs'}};
vm.createContext(context);
vm.runInContext(`${source.slice(configStart,configEnd)}\n${source.slice(markupStart,markupEnd)}\nthis.config=FURNITURE_TYPES.cdCollection;this.markup=furnitureMarkup;`,context);

test('Conjunto de CDs tem dimensão alta e largura de rack de potência',()=>{
    assert.equal(context.config.width,760);
    assert.equal(context.config.height,240);
});

test('Conjunto de CDs mostra capas guardadas sem controles ou conectores funcionais',()=>{
    const html=context.markup('cdCollection');
    assert.equal((html.match(/class="cd-collection-case"/g)||[]).length,47);
    assert.match(html,/class="furniture-part cd-collection-body" style="left:0px;top:0px;width:760px;height:240px"/);
    assert.match(html,/Conjunto de CDs/);
    assert.doesNotMatch(html,/class="port|<button|<input/);
    assert.doesNotMatch(html,/cd-collection-base/);
    const styles=readFileSync(require('node:path').join(__dirname,'../styles/app.css'),'utf8');
    assert.match(styles,/device-type-cdCollection \.cd-collection-body \{overflow:visible;border:0;border-radius:0;background:transparent;box-shadow:none;\}/);
});
