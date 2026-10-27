const {test}=require('node:test');
const assert=require('node:assert/strict');
const {topics,examples,readProgress,replaceExample}=require('../src/modules/guided-access.js');
const storage=value=>({getItem:()=>value});
test('guide progress tolerates blocked storage, corrupt JSON and invalid positions',()=>{
    assert.equal(readProgress({getItem(){throw Error('blocked');}}).step,0);
    assert.equal(readProgress(storage('{broken')).topic,0);
    const p=readProgress(storage(JSON.stringify({topic:99,step:1000,completed:[null,'mp3:file']})));
    assert.equal(p.topic,topics.length-1);assert.equal(p.step,topics.at(-1).steps.length-1);assert.deepEqual(p.completed,['mp3:file']);
});
test('guide preserves position, completion and playback evidence across authentication',()=>{
    const p={invited:true,topic:1,step:2,completed:['basic:source','spotify:account'],observations:{mp3PlayedKey:'local-file'},finished:false};
    assert.deepEqual(readProgress(storage(JSON.stringify(p))),p);
});
test('all examples have distinct identities, explicit prerequisites and valid connection indexes',()=>{
    assert.equal(examples.length,5);assert.equal(new Set(examples.map(e=>e.id)).size,5);
    for(const spec of examples){assert(spec.requirement&&spec.hint&&spec.furniture);for(const [a,out,b,input] of spec.links){assert(spec.types[a]&&spec.types[b]);assert.notEqual(a,b);assert(out&&input);}}
});
function transaction(failAt){
    const calls=[],audio=new Blob(['local-audio']);let scene={name:'original',audio},locked=false;
    const adapter={
        checkpoint:async()=>{calls.push('checkpoint');return scene;},
        begin:async()=>{calls.push('begin');locked=true;},
        build:async()=>{assert(locked);calls.push('build');scene={name:'example'};if(failAt==='build')throw Error('build failed');},
        validate:async()=>{assert(locked);calls.push('validate');if(failAt==='validate')throw Error('bad port');},
        commit:async()=>{assert(locked);calls.push('commit');if(failAt==='commit')throw Error('storage full');},
        restore:async previous=>{assert(locked);calls.push('restore');if(failAt==='restore')throw Error('restore failed');scene=previous;},
        end:async()=>{calls.push('end');locked=false;},
        recoveryFailed:()=>calls.push('recover')
    };
    return {adapter,calls,get scene(){return scene;},audio,get locked(){return locked;}};
}
test('example commits only after validation and keeps persistence locked through commit',async()=>{
    const tx=transaction();await replaceExample(tx.adapter,examples[0]);assert.deepEqual(tx.calls,['checkpoint','begin','build','validate','commit','end']);assert.equal(tx.scene.name,'example');assert(!tx.locked);
});
for(const failure of ['build','validate','commit'])test('failed '+failure+' restores the previous scene and its audio blob before unlocking',async()=>{
    const tx=transaction(failure);await assert.rejects(replaceExample(tx.adapter,examples[0]));assert.equal(tx.scene.name,'original');assert.equal(tx.scene.audio,tx.audio);assert(tx.calls.indexOf('restore')<tx.calls.indexOf('end'));assert(!tx.locked);
});
test('failed checkpoint never begins destructive replacement',async()=>{
    let began=false;await assert.rejects(replaceExample({checkpoint(){throw Error('storage unavailable');},begin(){began=true;}},examples[0]));assert(!began);
});
test('a failed restoration preserves recovery handling and unlocks the transaction',async()=>{
    const tx=transaction('restore');tx.adapter.build=async()=>{throw Error('build failed');};await assert.rejects(replaceExample(tx.adapter,examples[0]),/restauração falhou/);assert(tx.calls.includes('recover'));assert(!tx.locked);
});
