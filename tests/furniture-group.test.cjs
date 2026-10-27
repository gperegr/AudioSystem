const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const source=readFileSync(require('node:path').join(__dirname,'../script.js'),'utf8');
function scene(){
    const appState={project:{devices:{}}},context={Hardware:{sizes:{widths:{full:760}}},appState,view:{zoom:.4},snapCoordinate:n=>Math.round(n/20)*20};vm.createContext(context);
    const config=source.slice(source.indexOf('        const FURNITURE_TYPES ='),source.indexOf('        const FURNITURE_MATERIALS ='));
    assert.ok(config.length>0,'Furniture configuration must be included');
    const snap=source.slice(source.indexOf('        function snapOnEquipment('),source.indexOf('        function placementShapes('));
    const group=source.slice(source.indexOf('        function expandFurnitureGroup('),source.indexOf('        const ROOM_PRESETS='));
    vm.runInContext(config+'\nconst STACK_FEET={height:20};\n'+snap+'\n'+group,context);
    function add(id,type,x,y,w,h,chassis=false){return appState.project.devices[id]={id,type,el:{style:{left:String(x),top:String(y)},offsetWidth:w,offsetHeight:h,dataset:chassis?{chassis:'medium'}:{}}};}
    return {context,add,group:devices=>new Set(context.expandFurnitureGroup(devices).map(d=>d.id))};
}
test('shelf and tabletop gaps are never magnetically changed at different zooms',()=>{
    for(const type of ['furnitureTable','furnitureRackTall','furnitureNiche'])for(const zoom of [.4,1,2]){
        const s=scene();s.context.view.zoom=zoom;s.add('f',type,100,500,840,840);const gear=s.add('g','amp',140,300,760,180,true);
        for(const gap of [0,3,8,20]){const y=500-180-gap,p=s.context.snapOnEquipment(gear,140,y);assert.equal(p.x,140);assert.equal(p.y,y);}
    }
});
test('all devices fully inside a rack or niche move even without a visible-foot gap',()=>{
    for(const [type,h]of [['furnitureRackTall',840],['furnitureNiche',280]]){
        const s=scene(),f=s.add('f',type,100,500,840,h);s.add('inside','amp',140,535,760,180);s.add('below','amp',140,1600,760,180);s.add('beside','amp',1000,535,760,180);
        assert.deepEqual([...s.group([f])].sort(),['f','inside']);
    }
});
test('direct contact and small gaps include equipment without chassis metadata',()=>{
    for(const gap of [0,8,20]){const s=scene(),f=s.add('f','furnitureTable',100,1000,1680,760);s.add('deck','turntableLinear',140,1000-252-gap,660,252);assert.ok(s.group([f]).has('deck'));}
});
test('a furniture move follows a multi-level stack regardless of device insertion order',()=>{
    const s=scene(),f=s.add('f','furnitureTable',100,1000,1680,760);
    s.add('top','smallAmp',160,420,380,120);s.add('middle','amp',140,560,760,180);s.add('base','amp',140,760,760,240);
    assert.deepEqual([...s.group([f])].sort(),['base','f','middle','top']);
});
test('supported furniture carries its own contained equipment and stack',()=>{
    const s=scene(),table=s.add('table','furnitureTable',100,1000,1680,760);s.add('niche','furnitureNiche',120,700,840,280);s.add('inside','amp',160,735,760,180);s.add('above','amp',160,560,760,120);
    assert.deepEqual([...s.group([table])].sort(),['above','inside','niche','table']);
});
test('overhanging equipment on the furniture top is carried; unrelated equipment is not',()=>{
    const s=scene(),f=s.add('f','furnitureRackTall',100,500,840,840);s.add('overhang','amp',40,300,760,180);s.add('far','amp',1200,300,760,180);assert.deepEqual([...s.group([f])].sort(),['f','overhang']);
});
test('the open area under a table is not treated as an equipment compartment',()=>{
    const s=scene(),f=s.add('f','furnitureTable',100,1000,1680,760);s.add('under','amp',400,1200,760,180);assert.deepEqual([...s.group([f])],['f']);
});
test('moving equipment alone does not implicitly pick up a stack',()=>{
    const s=scene(),base=s.add('base','amp',100,500,760,180);s.add('top','amp',100,300,760,180);assert.deepEqual([...s.group([base])],['base']);
});
