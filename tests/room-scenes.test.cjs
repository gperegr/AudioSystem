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
