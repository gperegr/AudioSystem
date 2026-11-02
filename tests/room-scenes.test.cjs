const {test}=require('node:test');
const assert=require('node:assert/strict');
const {existsSync,readFileSync}=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const context={window:{}};
vm.runInNewContext(readFileSync(path.join(__dirname,'../assets/rooms/scenes.js'),'utf8'),context);
const {scenes,imageForTime}=context.window.RoomScenes;

test('each illustrated room resolves to a matching image for dawn, dusk and night',()=>{
    for(const [key,scene] of Object.entries(scenes).filter(([name])=>name.endsWith('Illustrated'))){
        for(const time of ['dawn','dusk','night']){
            const image=imageForTime(scene,time);
            assert.ok(existsSync(path.join(__dirname,`../assets/rooms/${image}.webp`)),`${key} has a ${time} image (${image})`);
        }
    }
});

test('the selected illustrated room stays selected while time variants change',()=>{
    for(const [key,scene] of Object.entries(scenes).filter(([name])=>name.endsWith('Illustrated'))){
        assert.equal(imageForTime(scene,'dusk'),scene.image);
        assert.match(imageForTime(scene,'dawn'),/-dawn$/);
        assert.match(imageForTime(scene,'night'),/-night$/);
        assert.ok(scene.horizon?.dawn!==undefined&&scene.horizon?.night!==undefined,`${key} has horizon alignment for every time`);
    }
});


test('rain glass polygons leave the loft frames and mullions dry',()=>{
    const {rainGlass}=context.window.RoomScenes;
    const inside=(point,polygon)=>{
        let result=false;
        for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
            const [x,y]=polygon[i],[px,py]=polygon[j];
            if((y>point[1])!==(py>point[1])&&point[0]<(px-x)*(point[1]-y)/(py-y)+x)result=!result;
        }
        return result;
    };
    for(const name of ['loft','loftIllustrated']){
        const glass=rainGlass(name).flat();
        for(const x of [126,212,298,756,840,925,1383,1468,1554])for(const y of [120,240,360,500]){
            assert(!glass.some(p=>inside([x,y],p)),`${name}: vertical mullion at ${x},${y}`);
        }
        for(const y of [184,303,428])for(const x of [80,160,250,340,710,800,880,970,1340,1420,1510,1600]){
            assert(!glass.some(p=>inside([x,y],p)),`${name}: horizontal bar at ${x},${y}`);
        }
        assert(glass.some(p=>inside([170,240],p)),'glass interior should receive rain');
    }
});
