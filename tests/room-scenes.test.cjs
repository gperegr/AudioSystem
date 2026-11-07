const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,statSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(readFileSync(path.join(__dirname,'../assets/rooms/scenes.js'),'utf8'),context);
const {scenes,imageForTime,rainGlass,lights}=context.window.RoomScenes;
const names=['studioIllustrated','listeningIllustrated','loftIllustrated'];

test('ultrawide rooms share one lightweight image and one floor line across all lighting settings',()=>{
    let total=0;
    for(const name of names){
        const scene=scenes[name],images=new Set();
        assert.equal(scene.width/scene.height,3.2);
        for(const time of ['dawn','dusk','night']){
            images.add(imageForTime(scene,time));
            assert.equal(scene.horizon[time],530,`${name}/${time} floor line`);
        }
        assert.equal(images.size,1,'time changes must reuse the same geometry and decoded image');
        const size=statSync(path.join(__dirname,`../assets/rooms/${scene.image}.webp`)).size;
        assert(size<125000,`${name} image is bounded for mobile connections`);total+=size;
    }
    assert(total<350000,'the three panoramas stay below 350 KB in total');
});

test('rain and light emitters use matching source-image windows in every room and time',()=>{
    const counts={studioIllustrated:[4],listeningIllustrated:[2,2],loftIllustrated:[15,15,15]};
    for(const name of names){
        const scene=scenes[name],glass=rainGlass(name);
        assert.equal(JSON.stringify(glass.map(group=>group.length)),JSON.stringify(counts[name]));
        for(const time of ['dawn','dusk','night']){
            const emitters=lights(name,time);
            assert.equal(emitters.length,glass.length);
            glass.forEach((group,index)=>{
                const e=emitters[index],points=group.flat();
                const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
                assert(Math.abs(e.cx-(Math.min(...xs)+Math.max(...xs))/2)<.01);
                assert(Math.abs(e.cy-(Math.min(...ys)+Math.max(...ys))/2)<.01);
                assert(points.every(([x,y])=>x>0&&x<scene.width&&y>0&&y<scene.horizon[time]),'glass stays within its image and above the floor');
            });
        }
    }
});

test('rain leaves the new loft mullions and horizontal bars dry',()=>{
    const glass=rainGlass('loftIllustrated').flat();
    const wet=([x,y])=>glass.some(p=>x>p[0][0]&&x<p[2][0]&&y>p[0][1]&&y<p[2][1]);
    for(const x of [230,342,453,562,997,1105,1215,1323,1765,1874,1983,2090])for(const y of [100,200,320])assert(!wet([x,y]),`mullion at ${x},${y}`);
    for(const y of [159,265])for(const x of [180,280,400,500,600,950,1050,1150,1250,1400,1700,1800,1900,2000,2150])assert(!wet([x,y]),`horizontal bar at ${x},${y}`);
    assert(wet([180,200]),'the interior of a glass pane receives rain');
});
