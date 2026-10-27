const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createStore}=require('../src/modules/application-state.js');

test('application state owns values in separate domains and maps legacy fields to them',()=>{
    const store=createStore(),state=store.legacyState;
    assert.equal(state.devices,store.domains.project.devices);
    assert.equal(state.audioCtx,store.domains.audio.context);
    assert.equal(state.canvasTheme,store.domains.canvas.theme);
    assert.equal(state.listeningBass,store.domains.preferences.listening.bass);
    assert.equal(state.selectedDeviceIds,store.domains.interface.selectedDeviceIds);
});

test('named canvas and listening actions update the correct domain and publish changes',()=>{
    const store=createStore(),events=[];
    const unsubscribe=store.subscribe(event=>events.push(event));
    store.actions.setCanvasTheme('sepia');
    store.actions.setListeningPreferences({bass:3,treble:-2});
    assert.equal(store.domains.canvas.theme,'sepia');
    assert.deepEqual({...store.domains.preferences.listening},{outputLevel:1,bass:3,treble:-2});
    assert.deepEqual(events.map(({type,domain,path})=>({type,domain,path})),[
        {type:'canvas/themeChanged',domain:'canvas',path:'theme'},
        {type:'preferences/listeningChanged',domain:'preferences',path:'listening'}
    ]);
    unsubscribe();
});

test('legacy root assignments are routed to their owning domain as actions',()=>{
    const store=createStore(),events=[];store.subscribe(event=>events.push(event));
    store.legacyState.audioCtx={state:'running'};
    store.legacyState.canvasGrid='lines';
    assert.equal(store.domains.audio.context.state,'running');
    assert.equal(store.domains.canvas.grid,'lines');
    assert.deepEqual(events.map(({domain,path})=>[domain,path]),[['audio','context'],['canvas','grid']]);
});

test('the project and Spotify domains are isolated from canvas and audio updates',()=>{
    const store=createStore();
    store.actions.registerDevice({id:'deviceA'});
    const cable={id:'cableA'};store.actions.addConnection(cable);
    store.actions.setCanvasTime('night');
    assert.deepEqual(Object.keys(store.domains.project.devices),['deviceA']);
    assert.equal(store.domains.project.connections[0],cable);
    assert.equal(Object.hasOwn(store.domains,'spotify'),false,'Spotify state remains encapsulated by its dedicated service module.');
    assert.equal(store.domains.canvas.time,'night');
    assert.equal(store.domains.audio.context,null);
    store.actions.removeConnection(0);store.actions.removeDevice('deviceA');
    assert.deepEqual(Object.keys(store.domains.project.devices),[]);
    assert.equal(store.domains.project.connections.length,0);
});
