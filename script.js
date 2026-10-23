/* Shared hardware library. Equipment supplies values and audio setters, never its own drag physics. */
const Hardware = (() => {
    const freeze = records => Object.freeze(Object.fromEntries(Object.entries(records).map(([id,record])=>[id,Object.freeze(record)])));
    const knobs = freeze({
        rubber:{name:'Borracha técnica',width:22,height:22,finish:'rubber',face:'#273432',rim:'#172520',ink:'#d0d8c6'},
        faceted:{name:'Hexagonal industrial',width:28,height:28,finish:'faceted',face:'#46535b',rim:'#879398',ink:'#e4c397'},
        recessed:{name:'Cilindro rebaixado',width:36,height:36,finish:'recessed',face:'#202c35',rim:'#748997',ink:'#a8d7e6'},
        touchDisc:{name:'Disco minimalista',width:52,height:52,finish:'disc',face:'#1c2529',rim:'#4d5c62',ink:'#b8d4d8'},
        haloDisc:{name:'Disco superior com halo luminoso',width:144,height:144,finish:'halo',face:'#121719',rim:'#89959a',ink:'#edf8fc'},
        plainPlastic:{name:'Plástico moldado com ponteiro',width:34,height:34,finish:'plain',face:'#30342e',rim:'#22271f',ink:'#e0e4d3'},
        silverFluted:{name:'Alumínio torneado com saia canelada',width:42,height:42,finish:'fluted',face:'#d5d9d5',rim:'#82908e',ink:'#152322'},
        machined:{name:'Alumínio usinado',width:36,height:36,finish:'machined',face:'#c7ccc7',rim:'#78817c',ink:'#29372e'},
        skirted:{name:'Saia cromada e miolo preto',width:52,height:52,finish:'skirted',face:'#bec5bf',rim:'#8b9690',ink:'#efe9d2'},
        bakelite:{name:'Baquelite canelada',width:36,height:36,finish:'bakelite',face:'#342a21',rim:'#544a39',ink:'#e9d7a9'},
        ivory:{name:'Marfim com parafuso de latão',width:36,height:36,finish:'ivory',face:'#ded2ae',rim:'#9c8e6c',ink:'#9d4c34'},
        pointer:{name:'Ponteiro de instrumento',width:44,height:44,finish:'pointer',face:'#33372d',rim:'#a79e85',ink:'#ece2c3'},
        flywheel:{name:'Volante de sintonia',width:52,height:52,finish:'flywheel',face:'#3e4b4d',rim:'#b3bfbc',ink:'#d6e7dc'}
    });
    const buttons = freeze({
        vintageSteel:{width:36,height:36,radius:1,travel:0,action:'latch',sound:'hwSteel'},
        vintageRecessed:{width:36,height:36,radius:2,travel:0,action:'latch',sound:'hwRecessed'},
        modernSteel:{width:36,height:36,radius:4,travel:0,action:'momentary',sound:'hwMetal'},
        modernGraphite:{width:36,height:36,radius:4,travel:0,action:'latch',sound:'hwSoft'},
        ivoryPiano:{width:38,height:26,radius:1,travel:2,action:'latch',sound:'hwRecessed'},
        brassPill:{width:44,height:20,radius:10,travel:.8,action:'latch',sound:'hwMetal'},
        studioCap:{width:30,height:26,radius:2,travel:1.5,action:'latch',sound:'hwLatch'},
        flushMetal:{width:44,height:20,radius:1,travel:.5,action:'latch',sound:'hwMetal'},
        illuminatedBar:{width:46,height:24,radius:2,travel:.8,action:'latch',sound:'hwKey'},
        membrane:{width:40,height:24,radius:7,travel:.4,action:'momentary',sound:'hwSoft'},
        key:{height:22,radius:3,travel:1.2,action:'momentary',sound:'hwKey'},
        plainKey:{width:22,height:16,radius:1,travel:1,action:'latch',sound:'hwSoft'},
        industrialToggle:{width:24,height:34,radius:2,travel:0,action:'lever',sound:'hwSwitch'},
        chromeLever:{width:18,height:27,radius:1,travel:0,action:'lever',sound:'hwSwitch'},
        selectorKey:{width:26,height:22,radius:3,travel:.8,action:'latch',sound:'hwLatch'},
        roundKey:{width:28,height:28,radius:14,travel:.8,action:'latch',sound:'hwSoft'},
        slideSelector:{width:112,height:28,radius:3,travel:0,action:'slide',sound:'hwSlide'},
        slideSelectorModern:{width:112,height:28,radius:2,travel:0,action:'slide',sound:'hwSlide'},
        transport:{height:26,radius:4,travel:1.5,action:'latch',sound:'hwTransport'},
        toggle:{height:22,radius:3,travel:.8,action:'latch',sound:'hwLatch'},
        power:{width:24,height:36,radius:4,travel:0,action:'rocker',sound:'hwRocker'},
        powerLarge:{width:32,height:48,radius:4,travel:0,action:'rocker',sound:'hwRocker'},
        powerHorizontal:{width:36,height:24,radius:4,travel:0,action:'rocker',sound:'hwRocker'},
        powerSmall:{width:18,height:26,radius:3,travel:0,action:'rocker',sound:'hwSmallRocker'},
        slidePower:{width:44,height:24,radius:5,travel:0,action:'slide',sound:'hwSlide'},
        ui:{height:40,radius:6,travel:1,action:'momentary',sound:'hwSoft'}
    });
    // Equipment proportions, in canvas pixels. More specific selectors come last.
    // Change a size here without changing the component model or its behavior.
    const controlSizes = {
        preGlass:{'.power-btn':{width:18,height:27},'[data-pre-toggle],[data-glass-toggle],[data-integrated-direct]':{width:18,height:27},'[data-pre-rotary]':{width:58,height:58},'[data-integrated-knob="volume"]':{width:64,height:64},'[data-integrated-knob="bass"],[data-integrated-knob="treble"],[data-integrated-knob="balance"]':{width:40,height:40}},
        streamIntegrated:{'.power-btn':{width:14,height:20},'[data-stream-action]':{width:24,height:24},'[data-stream-input]':{width:131,height:74},'[data-stream-cover]':{width:73,height:73}},
        integratedUtility:{'.power-btn':{width:18,height:27},'[data-integrated-source]':{width:28,height:17},'[data-utility-toggle],.integrated-direct':{width:33,height:17},'[data-integrated-knob="volume"]':{width:61,height:61}},
        prePrecision:{'.power-btn':{width:16,height:25},'[data-pre-toggle],[data-precision-gain]':{width:24,height:34},'[data-pre-rotary]':{width:37,height:37},'[data-integrated-knob="volume"]':{width:64,height:64},'[data-integrated-knob="balance"]':{width:26,height:26}},
        turntableLinear: {
            '.linear-keys button':{width:60,height:27},
            '[data-linear-speed]':{width:28,height:27},
            '[data-linear-cue]':{width:28,height:27},
            '.power-btn':{width:14,height:20},
            '.tt-lid-button':{width:22,height:18},
        },
        turntable: {
            ".power-btn": {width:20, height:30},
            ".at-startstop": {width:48, height:28},
            "[data-tt=\"output\"]": {width:112, height:26},
            ".tt-lid-button": {width:24, height:20},
        },
        turntableVintage: {
            ".power-btn": {width:44, height:24},
            ".at-startstop": {width:48, height:28},
            "[data-tt=\"output\"]": {width:112, height:26},
            ".tt-lid-button": {width:24, height:20},
        },
        cdPlayer: {
            ".power-btn": {width:20, height:30},
            "[data-source-play]": {width:52, height:28},
        },
        streamer: {
            ".power-btn": {width:20, height:30},
            "[data-source-play]": {width:52, height:28},
        },
        tapeDeck: {
            ".power-btn": {width:20, height:30},
            "[data-tape-level]": {width:32, height:32},
            ".tape-transport button": {width:34, height:30},
        },
        signalGenerator: {
            ".power-btn": {width:20, height:30},
            "[data-signal-level-knob]": {width:32, height:32},
            "[data-signal-choice]": {width:34, height:24},
            "[data-signal-choice=\"sweepSeconds\"]": {width:28, height:24},
            "[data-signal-step]": {width:34, height:26},
            "[data-source-play]": {width:60, height:28},
        },
        signalGeneratorVintage: {
            ".power-btn": {width:20, height:30},
            "[data-signal-level-knob]": {width:32, height:32},
            "[data-signal-choice]": {width:34, height:24},
            "[data-signal-choice=\"sweepSeconds\"]": {width:28, height:24},
            "[data-signal-step]": {width:34, height:26},
            "[data-source-play]": {width:60, height:28},
        },
        benchMeter: {
            ".power-btn": {width:20, height:30},
        },
        benchMeterVintage: {
            ".power-btn": {width:20, height:30},
        },
        preamp: {
            ".power-btn": {width:20, height:30},
            "[data-pre-source]": {width:46, height:20},
            "[data-pre-knob]": {width:28, height:28},
            "[data-pre-knob=\"volume\"]": {width:38, height:38},
        },
        preReference: {
            ".power-btn": {width:22, height:32},
            "[data-pre-rotary]": {width:38, height:38},
            "[data-integrated-knob]": {width:30, height:30},
            "[data-integrated-knob=\"volume\"]": {width:50, height:50},
            "[data-pre-toggle]": {width:48, height:18},
        },
        preControl: {
            ".power-btn": {width:40, height:24},
            "[data-pre-rotary]": {width:34, height:34},
            "[data-integrated-knob]": {width:26, height:26},
            "[data-integrated-knob=\"volume\"]": {width:48, height:48},
            "[data-pre-toggle],[data-integrated-direct]": {width:50, height:18},
        },
        preDisplay: {
            ".power-btn": {width:22, height:32},
            "[data-pre-rotary]": {width:44, height:44},
            "[data-integrated-knob]": {width:26, height:26},
            "[data-integrated-knob=\"volume\"]": {width:56, height:56},
            "[data-pre-toggle],[data-integrated-direct]": {width:50, height:18},
        },
        integratedBlue: {
            ".power-btn": {width:22, height:32},
            "[data-integrated-knob]": {width:28, height:28},
            "[data-integrated-knob=\"volume\"]": {width:52, height:52},
            "[data-integrated-source]": {width:48, height:22},
            "[data-integrated-direct]": {width:60, height:18},
        },
        integratedSilver: {
            ".power-btn": {width:22, height:32},
            "[data-integrated-knob]": {width:28, height:28},
            "[data-integrated-knob=\"volume\"]": {width:52, height:52},
            "[data-integrated-source]": {width:48, height:22},
            "[data-integrated-direct]": {width:60, height:18},
        },
        integratedMinimal: {
            ".power-btn": {width:22, height:32},
            "[data-integrated-knob=\"volume\"]": {width:56, height:56},
            "[data-integrated-source]": {width:48, height:24},
        },
        receiver: {
            ".power-btn": {width:26, height:40},
            "[data-receiver-control]": {width:24, height:24},
            "[data-receiver-control=\"volume\"]": {width:44, height:44},
            "[data-radio-knob]": {width:44, height:44},
            "[data-receiver-input]": {width:64, height:24},
        },
        powerAmp: {
            ".power-btn": {width:26, height:40},
            ".poweramp-level": {width:50, height:50},
            "[data-radio-knob]": {width:32, height:32},
            "[data-receiver-input]": {width:64, height:24},
        },
        powerStereo: {
            ".power-btn": {width:20, height:30},
            "[data-power-channel]": {width:38, height:38},
        },
        powerVintage: {
            ".power-btn": {width:20, height:30},
            "[data-power-channel]": {width:38, height:38},
        },
        powerDual: {
            ".power-btn": {width:22, height:32},
        },
        powerValve: {
            ".power-btn": {width:20, height:30},
        },
        powerBias: {
            ".power-btn": {width:22, height:32},
            "[data-bias-gain]": {width:56, height:56},
        },
        headphoneAmp: {
            ".power-btn": {width:20, height:30},
            ".phone-volume": {width:36, height:36},
        },
        headphoneAmpModern: {
            ".power-btn": {width:40, height:24},
            ".phone-volume": {width:40, height:40},
        },
        headphoneAmp4: {
            ".power-btn": {width:20, height:30},
            "[data-channel-knob]": {width:30, height:30},
        },
        eqStudio: {
            ".power-btn": {width:20, height:30},
            ".graphic-eq-level": {width:26, height:26},
        },
        eqVintage: {
            ".power-btn": {width:20, height:30},
            ".graphic-eq-level": {width:26, height:26},
        },
        mixer: {
            ".power-btn": {width:20, height:30},
        },
        mixerVintage: {
            ".power-btn": {width:20, height:30},
        },
        crossover: {
            ".power-btn": {width:20, height:30},
        },
        crossoverVintage: {
            ".power-btn": {width:20, height:30},
        },
        rcaSwitch: {
            ".selector-key": {width:40, height:24},
        },
        rcaSwitchVintage: {
            ".selector-key": {width:40, height:24},
        },
        speakerSwitch: {
            ".selector-key": {width:40, height:24},
        },
        speakerSwitchVintage: {
            ".selector-key": {width:40, height:24},
        },
        rcaMatrix: {
            ".selector-key": {width:32, height:24},
        },
        rcaMatrixVintage: {
            ".selector-key": {width:32, height:24},
        },
        btReceiverA: {
            ".power-btn": {width:28, height:28},
            "[data-source-play]": {width:46, height:24},
            ".btn-bt-pair": {width:76, height:24},
        },
        btTransmitterPro: {
            ".power-btn": {width:28, height:28},
            "[data-source-play]": {width:46, height:24},
            ".btn-bt-pair": {width:76, height:24},
        },
        spkActiveCompact: {
            ".power-btn": {width:14, height:22},
            "[data-sp=\"vol\"]": {width:24, height:24},
        },
        spkActiveBookshelf: {
            ".power-btn": {width:16, height:24},
            "[data-sp=\"vol\"]": {width:26, height:26},
        },
        spkActiveRounded: {
            ".power-btn": {width:16, height:24},
            "[data-sp=\"vol\"]": {width:24, height:24},
        },
        spkActiveMonitor: {
            ".power-btn": {width:18, height:26},
            "[data-sp=\"vol\"]": {width:28, height:28},
        },
        subwoofer: {
            ".power-btn": {width:18, height:26},
            "[data-sp=\"vol\"]": {width:28, height:28},
        },
        subwooferCube: {
            ".power-btn": {width:18, height:26},
            "[data-sp=\"vol\"]": {width:28, height:28},
        },
        subwooferPro: {
            ".power-btn": {width:18, height:28},
            "[data-sp=\"vol\"]": {width:30, height:30},
        },
        headphone: {
            ".headphone-bt-button": {width:24, height:24},
        },
        hpStudio: {
            ".headphone-bt-button": {width:24, height:24},
        },
        hpMax: {
            ".headphone-bt-button": {width:26, height:26},
        },
        speaker: {
            ".grille-restore": {width:108, height:20},
        },
        spkPassiveWood: {
            ".grille-restore": {width:108, height:20},
        },
        spkPassiveCarbon: {
            ".grille-restore": {width:108, height:20},
        },
        spkPassiveGridBlack: {
            ".grille-restore": {width:108, height:20},
        },
        spkPassiveGridOrange: {
            ".grille-restore": {width:108, height:20},
        },
        shelfCoax: {
            ".grille-restore": {width:108, height:20},
        },
        shelfWood: {
            ".grille-restore": {width:108, height:20},
        },
        shelfTop: {
            ".grille-restore": {width:108, height:20},
        },
        floorDiamond: {
            ".grille-restore": {width:108, height:20},
        },
        floorCoax: {
            ".grille-restore": {width:108, height:20},
        },
        floorFlax: {
            ".grille-restore": {width:108, height:20},
        },
        subwooferPassive: {
            ".grille-restore": {width:108, height:20},
        },
        subwooferPassiveVintage: {
            ".grille-restore": {width:108, height:20},
        },
    };
    const controlSizing = new WeakMap();
    const sizeValue=value=>((typeof value==='number'||typeof value==='string')&&String(value).trim()!==''&&Number.isFinite(Number(value))&&Number(value)>0)?Number(value):undefined;
    function applyControlSize(el,kind,model){
        const spec=(kind==='knob'?knobs:buttons)[model];if(!spec)return;
        const entry=controlSizing.get(el)||{overrides:{},applied:{}};
        entry.kind=kind;entry.model=model;controlSizing.set(el,entry);
        const resolved={width:spec.width,height:spec.height};
        const merge=values=>{for(const axis of ['width','height']){const value=sizeValue(values?.[axis]);if(value!==undefined)resolved[axis]=value;}};
        const device=el.closest('.device-node'),rules=controlSizes[device?.dataset.equipmentType];
        for(const [selector,dimensions]of Object.entries(rules||{})){if(el.matches(selector))merge(dimensions);}
        if(el.matches('.grille-restore'))merge({width:24,height:24});
        merge({width:el.dataset.controlWidth,height:el.dataset.controlHeight});merge(entry.overrides);
        for(const axis of ['width','height']){
            const value=sizeValue(resolved[axis]);
            if(value!==undefined){
                for(const property of [axis,'min-'+axis,'max-'+axis])el.style.setProperty(property,value+'px','important');
                el.style.setProperty('--hw-control-'+axis,value+'px');entry.applied[axis]=true;
            }else if(entry.applied[axis]){
                for(const property of [axis,'min-'+axis,'max-'+axis])el.style.removeProperty(property);
                el.style.removeProperty('--hw-control-'+axis);delete entry.applied[axis];
            }
        }
        if(kind==='button'){el.style.setProperty('--hw-button-height',resolved.height+'px');el.style.setProperty('--hw-control-label-size',Math.max(7,Math.min(9,(resolved.height-6)*.5))+'px');}
    }
    function setControlSize(el,dimensions={}){
        if(!el)return el;
        const entry=controlSizing.get(el)||{overrides:{},applied:{}};
        for(const axis of ['width','height']){
            if(!Object.hasOwn(dimensions,axis))continue;
            if(dimensions[axis]===null)delete entry.overrides[axis];
            else {const value=sizeValue(dimensions[axis]);if(value!==undefined)entry.overrides[axis]=value;}
        }
        controlSizing.set(el,entry);
        const kind=entry.kind||(el.dataset.knobModel?'knob':el.dataset.buttonModel?'button':null);
        if(kind)applyControlSize(el,kind,entry.model||el.dataset.knobModel||el.dataset.buttonModel);
        return el;
    }
    // Short, synthesized contact, spring and housing resonances; routed only to interaction audio.
    // Short contact/friction sounds; each construction has its own timbre.
    const movementSounds=freeze({
        moveRubber:{duration:.032,frequency:420,noise:.022,tone:0,body:0,lowpass:1100,cooldown:85},
        moveFaceted:{duration:.021,frequency:1650,noise:.028,tone:310,body:.003,attack:.001,cooldown:65},
        moveRecessed:{duration:.026,frequency:780,noise:.019,tone:155,body:.0025,cooldown:75},
        moveTouchDisc:{duration:.038,frequency:580,noise:.012,tone:0,body:0,lowpass:1500,cooldown:95},
        moveMachined:{duration:.018,frequency:2800,noise:.025,tone:720,body:.002,lowpass:4200,attack:.001,cooldown:60},
        moveSkirted:{duration:.027,frequency:1400,noise:.024,tone:390,body:.0035,attack:.001,cooldown:70},
        moveBakelite:{duration:.029,frequency:690,noise:.032,tone:195,body:.005,lowpass:1900,attack:.001,cooldown:75},
        moveIvory:{duration:.024,frequency:1150,noise:.025,tone:460,body:.003,attack:.001,cooldown:70},
        movePointer:{duration:.022,frequency:2050,noise:.030,tone:260,body:.004,attack:.001,cooldown:65},
        moveFlywheel:{duration:.042,frequency:340,noise:.020,tone:0,body:0,lowpass:950,cooldown:95},
        moveSlider:{duration:.037,frequency:900,noise:.020,tone:0,body:0,lowpass:2100,cooldown:85},
        moveFader:{duration:.043,frequency:480,noise:.025,tone:0,body:0,lowpass:1400,cooldown:90},
        moveSeek:{duration:.022,frequency:2100,noise:.011,tone:0,body:0,lowpass:3100,cooldown:110},
        movePitch:{duration:.035,frequency:660,noise:.023,tone:120,body:.002,lowpass:1700,cooldown:85}
    });
    function movementSound(el,kind='knob'){
        if(kind==='linear')return 'movePitch';
        if(kind==='slider')return el.dataset.hardwareSlider==='seek'?'moveSeek':el.dataset.hardwareSlider==='vertical'||el.closest('.mixer-channel')||el.matches('.mixer-level-control')?'moveFader':'moveSlider';
        const model=el.dataset.knobModel||bindings.get(el)?.model||'recessed';
        return 'move'+model[0].toUpperCase()+model.slice(1);
    }
    const buttonSounds=freeze({
        hwKeyDown:{duration:.032,frequency:2400,noise:.075,tone:340,body:.010,attack:.001,lowpass:6400},
        hwKeyUp:{duration:.022,frequency:3300,noise:.040,tone:440,body:.005,attack:.001,lowpass:7000},
        hwTransportDown:{duration:.050,frequency:1500,noise:.100,tone:180,body:.023,attack:.001,lowpass:4700,bounce:.012,bounceLevel:.22},
        hwTransportUp:{duration:.028,frequency:2600,noise:.045,tone:290,body:.008,attack:.001,lowpass:5600},
        hwLatchDown:{duration:.042,frequency:2100,noise:.085,tone:260,body:.014,attack:.001,lowpass:5600,bounce:.009,bounceLevel:.30},
        hwLatchUp:{duration:.025,frequency:3000,noise:.045,tone:380,body:.006,attack:.001,lowpass:6500},
        hwSteelDown:{duration:.065,frequency:1600,noise:.115,tone:160,body:.029,attack:.001,lowpass:6200,ring:2150,ringLevel:.005,bounce:.013,bounceLevel:.28},
        hwSteelUp:{duration:.040,frequency:2700,noise:.060,tone:290,body:.012,attack:.001,lowpass:6500,ring:2900,ringLevel:.003},
        hwRecessedDown:{duration:.070,frequency:1100,noise:.105,tone:125,body:.033,attack:.001,lowpass:3900,ring:1650,ringLevel:.004,bounce:.017,bounceLevel:.30},
        hwRecessedUp:{duration:.035,frequency:1800,noise:.052,tone:220,body:.014,attack:.001,lowpass:4700},
        hwMetalDown:{duration:.040,frequency:2600,noise:.075,tone:420,body:.009,attack:.001,lowpass:7200,ring:3400,ringLevel:.003},
        hwMetalUp:{duration:.025,frequency:3500,noise:.038,tone:540,body:.005,attack:.001,lowpass:7400},
        hwSoftDown:{duration:.037,frequency:1400,noise:.060,tone:240,body:.014,attack:.002,lowpass:3200},
        hwSoftUp:{duration:.024,frequency:2200,noise:.032,tone:360,body:.006,attack:.001,lowpass:4000},
        hwSwitchPreload:{duration:.020,frequency:900,noise:.022,tone:100,body:.006,attack:.002,lowpass:2400},
        hwRockerOn:{duration:.075,frequency:1600,noise:.130,tone:105,body:.032,attack:.001,lowpass:5100,bounce:.016,bounceLevel:.32},
        hwRockerOff:{duration:.064,frequency:1250,noise:.115,tone:85,body:.029,attack:.001,lowpass:4500,bounce:.012,bounceLevel:.26},
        hwSmallRockerOn:{duration:.046,frequency:2400,noise:.080,tone:280,body:.014,attack:.001,lowpass:6500,bounce:.009,bounceLevel:.24},
        hwSmallRockerOff:{duration:.040,frequency:1950,noise:.070,tone:220,body:.012,attack:.001,lowpass:5800,bounce:.008,bounceLevel:.20},
        hwSlideOn:{duration:.075,frequency:2800,noise:.060,tone:370,body:.010,attack:.008,lowpass:5300,bounce:.045,bounceLevel:.60},
        hwSlideOff:{duration:.070,frequency:2300,noise:.055,tone:300,body:.011,attack:.008,lowpass:4800,bounce:.040,bounceLevel:.55}
    });
    const sliders = freeze({horizontal:{track:4,thumb:14},vertical:{track:4,thumb:12,length:64},seek:{track:3,thumb:10}});
    const leds = freeze({power:{size:4,color:'#82d99c'},signal:{size:4,color:'#87d5b3'},warm:{size:4,color:'#e6b66f'},blue:{size:4,color:'#8ecce0'},clip:{size:4,color:'#ef8275'}});
    const plugs = freeze({
        p10:{outer:5.5,inner:3.5,scale:1.12,kind:'jack'},p2:{outer:2.8,inner:1.6,scale:.64,kind:'jack'},
        wire:{outer:7,inner:3.5,scale:1,kind:'wire'},rca:{outer:4.2,inner:2.6,scale:1,kind:'rca'},
        'rca-l':{outer:4.2,inner:2.6,scale:1,kind:'rca',color:'#e5e7eb'},'rca-r':{outer:4.2,inner:2.6,scale:1,kind:'rca',color:'#cf4545'}
    });
    const sizes = Object.freeze({grid:20,heights:Object.freeze({low:120,medium:180,high:240}),widths:Object.freeze({compact:380,full:760})});
    const physics = Object.freeze({travel:150,detents:10,settleMs:140,pressMs:90});
    const accents = freeze({led:{radius:43,count:21,color:'#c5e6e9'},engraved:{radius:42,count:11,color:'#40514e'}});
    const accentNodes=new WeakMap();
    const bindings = new WeakMap(),releases=new WeakMap();
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):min));
    const snap=(value,min,max,step)=>Number((min+Math.round((clamp(value,min,max)-min)/step)*step).toFixed(6));
    let knobReadout=null,readoutOwner=null,readoutTimer=null;
    const knobValueText=({get,min,max,format})=>{
        const value=clamp(get(),min,max);
        return format?format(value):min===0&&max===1?`${Number((value*100).toFixed(1))}%`:String(Number(value.toFixed(2)));
    };
    function showKnobReadout(el,renew=true){
        const control=bindings.get(el);if(!control||!el.isConnected)return;
        if(renew)clearTimeout(readoutTimer);readoutOwner=el;
        if(!knobReadout){knobReadout=document.createElement('output');knobReadout.className='knob-value-readout';knobReadout.setAttribute('aria-hidden','true');document.body.appendChild(knobReadout);}
        knobReadout.textContent=knobValueText(control);knobReadout.hidden=false;
        const rect=el.getBoundingClientRect(),width=knobReadout.offsetWidth,height=knobReadout.offsetHeight;
        knobReadout.style.left=Math.max(8,Math.min(innerWidth-width-8,rect.left+(rect.width-width)/2))+'px';
        knobReadout.style.top=(rect.top>height+18?rect.top-height-10:rect.bottom+10)+'px';
    }
    function hideKnobReadout(delay=450){
        clearTimeout(readoutTimer);readoutTimer=setTimeout(()=>{if(knobReadout)knobReadout.hidden=true;readoutOwner=null;},delay);
    }
    function paintKnob(el){
        const control=bindings.get(el);if(!control)return;
        const {get,min,max}=control,value=clamp(get(),min,max);
        el.setAttribute('role','slider');el.setAttribute('aria-valuemin',min);el.setAttribute('aria-valuemax',max);el.setAttribute('aria-valuenow',value);
        el.setAttribute('aria-valuetext',knobValueText(control));
        paintAccent(el,(value-min)/(max-min));
        el.style.setProperty('--hw-halo-value',`${(value-min)/(max-min)*270}deg`);
        if(readoutOwner===el)showKnobReadout(el,false);
    }
    function bindKnob(el,{get,set,min=0,max=1,step=null,activate,format,model,kind='knob',pointerToValue,width,height}){
        if(!el||bindings.has(el))return;
        if(kind==='knob')setControlSize(el,{width,height});
        const continuous=step==null&&kind==='linear',precision=step??(max-min)/(kind==='knob'?physics.detents:1000);
        const keyboardStep=step??(kind==='knob'?precision:min<0&&max>0 ? .1 : (max-min)/100);
        const detents=continuous?(min<0&&max>0?[0]:min===0&&max===1?[0,.5,1]:[min,max]):[];
        const control={get,set,min,max,step:precision,activate,format,model,kind};bindings.set(el,control);el.tabIndex=0;if(kind==='knob')el.dataset.hardwareKnob='';
        const change=(value,magnetic=false)=>{
            let next=clamp(snap(value,min,max,precision),min,max);
            const detent=magnetic?detents.find(point=>Math.abs(next-point)<(max-min)*.012):undefined;
            if(detent!==undefined)next=detent;
            el.classList.toggle('hw-at-detent',detents.some(point=>Math.abs(next-point)<1e-7));
            if(Math.abs(next-get())>1e-7){set(next);playUiSound(movementSound(el,kind));}paintKnob(el);
        };
        const commit=()=>{if(el.isConnected){updateCableFlows();scheduleProjectSave();}};
        el.addEventListener('pointerdown',event=>{
            if(event.button!==0||el.disabled)return;event.preventDefault();event.stopPropagation();activate?.();el.classList.add('hw-pointer-focus');el.focus({preventScroll:true});
            const pointer=event.pointerId,start=get(),x=event.clientX,y=event.clientY,zoom=Math.max(.1,view.zoom);el.setPointerCapture(pointer);el.classList.add('hw-turning');showKnobReadout(el);
            if(pointerToValue)change(pointerToValue(event),true);
            const move=e=>{if(e.pointerId===pointer){e.preventDefault();change(pointerToValue?pointerToValue(e):start+((y-e.clientY)+(e.clientX-x)*.35)*(max-min)/(physics.travel*zoom),true);}};
            const finish=e=>{if(e?.pointerId!=null&&e.pointerId!==pointer)return;el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',finish);el.removeEventListener('lostpointercapture',finish);window.removeEventListener('blur',finish);releases.delete(el);el.classList.remove('hw-turning');if(el.hasPointerCapture(pointer))el.releasePointerCapture(pointer);hideKnobReadout();commit();};
            releases.set(el,finish);el.addEventListener('pointermove',move);el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);el.addEventListener('lostpointercapture',finish);window.addEventListener('blur',finish);
        });
        el.addEventListener('blur',()=>{el.classList.remove('hw-pointer-focus');if(readoutOwner===el)hideKnobReadout(0);});
        el.addEventListener('keydown',event=>{
            el.classList.remove('hw-pointer-focus');
            if(!['ArrowUp','ArrowRight','ArrowDown','ArrowLeft','Home','End','PageUp','PageDown'].includes(event.key)||el.disabled)return;
            event.preventDefault();event.stopPropagation();activate?.();const direction=['ArrowUp','ArrowRight','PageUp'].includes(event.key)?1:-1;
            change(event.key==='Home'?min:event.key==='End'?max:get()+direction*keyboardStep*(event.key.startsWith('Page')?5:1));showKnobReadout(el);hideKnobReadout(700);commit();
        });
        paintKnob(el);
    }
    function knobModel(dev,el){
        if(dev.type==='preGlass')return 'silverFluted';
        if(dev.type==='integratedUtility')return 'plainPlastic';
        const vintage=dev.el.classList.contains('device-family-vintage');
        const silver=['integratedSilver','preReference','preControl','powerBias'].includes(dev.type);
        if(el.matches('[data-radio-knob]'))return dev.type==='powerAmp'?'touchDisc':'flywheel';
        if(el.matches('[data-pre-rotary]'))return dev.type==='preReference'?'machined':'faceted';
        if(el.matches('[data-sp="vol"]'))return vintage?'ivory':dev.type==='spkActiveBookshelf'?'faceted':'rubber';
        if(el.matches('[data-signal-level-knob]'))return vintage?'machined':'recessed';
        if(el.matches('.graphic-eq-level'))return vintage?'bakelite':'faceted';
        if(el.matches('.poweramp-level'))return 'touchDisc';
        if(el.matches('[data-channel-knob]'))return 'faceted';
        if(el.matches('[data-power-channel]'))return vintage?'bakelite':'faceted';
        if(el.matches('[data-bias-gain]'))return 'machined';
        if(el.matches('.phone-volume'))return vintage?'ivory':'recessed';
        if(el.matches('.is-large,[data-receiver-control="volume"]'))return ['integratedBlue','integratedMinimal','preDisplay'].includes(dev.type)?'touchDisc':'skirted';
        if(el.matches('[data-tape-level]'))return 'bakelite';
        if(el.matches('[data-pre-knob]'))return 'recessed';
        return vintage||silver?'machined':'recessed';
    }
    function skinKnob(el,model){
        const spec=knobs[model];el.dataset.knobModel=model;el.dataset.knobFinish=spec.finish;el.dataset.knobConstruction=spec.name;el.classList.add('hw-knob');
        applyControlSize(el,'knob',model);
        el.style.setProperty('--hw-knob-face',spec.face);el.style.setProperty('--hw-knob-rim',spec.rim);el.style.setProperty('--hw-knob-ink',spec.ink);
        const face=document.createElement('span');face.className='hw-knob-face';face.setAttribute('aria-hidden','true');face.innerHTML='<span class="hw-knob-cap"><span class="hw-knob-fastener"></span></span><span class="hw-knob-indicator"></span>';el.appendChild(face);
        if(spec.finish==='halo'){const halo=document.createElement('span');halo.className='hw-knob-halo';halo.setAttribute('aria-hidden','true');el.appendChild(halo);}
        if(el.dataset.controlLabel){const caption=document.createElement('span');caption.className='hw-knob-caption';caption.textContent=el.dataset.controlLabel;el.appendChild(caption);}
        const control=bindings.get(el);
        if(control&&control.min<0&&control.max>0){
            const mark=document.createElement('span');mark.className='hw-neutral-mark';mark.setAttribute('aria-hidden','true');
            mark.style.rotate=(-135+(0-control.min)/(control.max-control.min)*270)+'deg';el.appendChild(mark);
        }
        paintKnob(el);
    }
    function accentModel(dev,el){
        const vintage=dev.el.classList.contains('device-family-vintage');
        if(dev.type==='signalGeneratorVintage'&&el.matches('[data-signal-level-knob]'))return 'engraved';
        const volume=el.matches('[data-integrated-knob="volume"],.phone-volume');
        if(!vintage&&volume&&['preDisplay','integratedMinimal','headphoneAmpModern'].includes(dev.type))return 'led';
        if(el.matches('[data-integrated-knob="volume"]')&&['integratedSilver','preControl'].includes(dev.type))return 'engraved';
        if(vintage&&el.matches('[data-receiver-control="volume"],.phone-volume'))return 'engraved';
        return null;
    }
    function skinAccent(dev,el,kind){
        const spec=accents[kind],svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
        svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('aria-hidden','true');svg.classList.add('hw-knob-scale');el.dataset.knobAccent=kind;
        el.style.setProperty('--hw-accent-color',dev.type==='integratedMinimal'?'#abd7b4':spec.color);
        const nodes=[],point=(angle,r)=>({x:50+Math.sin(angle*Math.PI/180)*r,y:50-Math.cos(angle*Math.PI/180)*r});
        for(let index=0;index<spec.count;index++){
            const angle=-135+index/(spec.count-1)*270,position=point(angle,spec.radius);
            if(kind==='led'){
                const dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('cx',position.x.toFixed(3));dot.setAttribute('cy',position.y.toFixed(3));dot.setAttribute('r','1.5');dot.classList.add('hw-ring-dot');svg.appendChild(dot);nodes.push(dot);
            }else{
                const start=point(angle,34),end=point(angle,38),line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('d',`M${start.x} ${start.y}L${end.x} ${end.y}`);line.classList.add('hw-scale-tick');svg.appendChild(line);
                const label=document.createElementNS(svg.namespaceURI,'text'),p=point(angle,46);label.setAttribute('x',p.x);label.setAttribute('y',p.y);label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','central');label.textContent=String(index);svg.appendChild(label);
            }
        }
        el.appendChild(svg);accentNodes.set(el,{nodes,dev,lit:-1,powered:null});paintKnob(el);
    }
    function paintAccent(el,fraction){
        const accent=accentNodes.get(el);if(!accent||!accent.nodes.length)return;
        const powered=!!accent.dev.powered,lit=powered&&fraction>0?Math.round(fraction*(accent.nodes.length-1))+1:0;
        if(accent.lit===lit&&accent.powered===powered)return;accent.lit=lit;accent.powered=powered;
        accent.nodes.forEach((dot,index)=>dot.classList.toggle('is-lit',index<lit));
    }
    function updateAccents(dev){
        dev.el.querySelectorAll('[data-knob-accent="led"]').forEach(el=>{const control=bindings.get(el);if(control)paintAccent(el,(clamp(control.get(),control.min,control.max)-control.min)/(control.max-control.min));});
    }
    function slidingPower(el){
        el.style.position='relative';
        el.classList.remove('power-rocker-switch');el.classList.add('hw-slide-power');el.dataset.rockerAxis='horizontal';
        el.innerHTML='<span class="hw-switch-track" aria-hidden="true"><span class="hw-switch-legend hw-switch-off">OFF</span><span class="hw-switch-legend hw-switch-on">ON</span><span class="hw-switch-thumb"><i class="hw-switch-grip"></i><i class="hw-switch-lamp"></i></span></span>';
    }
    const bluetoothSymbol='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 4V3l5 4L7 17"/></svg>';
    function sourceTransport(el,model='transport'){
        el.classList.add('hw-source-transport');
        el.setAttribute('aria-label','Reproduzir ou pausar');el.title='Reproduzir / pausar';
        el.innerHTML='<svg viewBox="0 0 28 20" width="22" height="16" aria-hidden="true"><path d="M3 3v14l10-7Z" fill="currentColor"/><path d="M18 3v14m6-14v14" stroke="currentColor" stroke-width="3"/></svg>';
        skinButton(el,model);
    }
    function setButtonLabel(el,text){
        if(!el||el.hasAttribute('data-button-model'))return;
        const legend=el.querySelector('.hw-plunger-legend,.hw-mechanical-key-legend');
        (legend||el).textContent=text;
        const sizer=el.querySelector('.hw-button-sizer');if(sizer)sizer.textContent=text;
        if(el.hasAttribute('data-hardware-auto-label'))el.setAttribute('aria-label',text);
    }
    function skinSlideSelector(el){
        const labels=[...el.querySelectorAll('[data-m]')];
        if(!labels.length){for(const [key,label]of [['line','LINE'],['phono','PHONO']]){const node=document.createElement('span');node.dataset.m=key;node.textContent=label;labels.push(node);}}
        el.classList.add('hw-slide-selector');el.replaceChildren(...labels);
        const track=document.createElement('span');track.className='hw-selector-track';track.setAttribute('aria-hidden','true');track.innerHTML='<i class="hw-selector-thumb"></i>';el.appendChild(track);
    }
    function skinRocker(el,model){
        el.classList.remove('power-btn--round','power-btn--square','power-btn--rocker');
        el.classList.add('power-btn','power-rocker-switch');el.dataset.rockerAxis=model==='powerHorizontal'?'horizontal':'vertical';
        el.setAttribute('role','switch');el.setAttribute('aria-checked',String(el.getAttribute('aria-pressed')!=='false'&&!el.classList.contains('off')));
        el.innerHTML='<span class="power-rocker-well" aria-hidden="true"></span><span class="power-rocker-face" aria-hidden="true"><i class="rocker-mark-on"><svg viewBox="0 0 10 12"><path d="M5 2v8"/></svg></i><i class="rocker-mark-off"><svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="3.5"/></svg></i></span>';
    }
    function buttonModel(dev,el){
        if(el.dataset.buttonModel&&Object.hasOwn(buttons,el.dataset.buttonModel))return el.dataset.buttonModel;
        if(['btReceiverA','btTransmitterPro'].includes(dev.type))return 'illuminatedBar';
        if(el.classList.contains('power-btn')){
            if(dev.type==='headphoneAmpModern')return 'powerHorizontal';
            if(['preControl','turntableVintage'].includes(dev.type))return 'slidePower';
            if(RADIO_RECEIVERS.has(dev.type))return 'powerLarge';
            if(el.closest('.sp-power-slot'))return 'powerSmall';
            return el.dataset.rockerAxis==='horizontal'?'powerHorizontal':'power';
        }
        if(el.matches('[data-tt="output"]'))return dev.type==='turntable'?'slideSelectorModern':'slideSelector';
        if(el.classList.contains('headphone-bt-button'))return 'roundKey';
        if(el.matches('.tt-lid-button,.grille-restore'))return 'key';
        if(el.matches('[data-signal-step]'))return dev.type==='signalGeneratorVintage'?'ivoryPiano':'selectorKey';
        if(el.matches('[data-signal-choice]'))return dev.type==='signalGeneratorVintage'?'vintageSteel':'illuminatedBar';
        if(SIGNAL_GENERATOR_TYPES.has(dev.type)&&el.matches('[data-source-play]'))return dev.type==='signalGeneratorVintage'?'vintageSteel':'selectorKey';
        const vintage=dev.el.classList.contains('device-family-vintage');
        if(['tapeDeck','turntableVintage'].includes(dev.type)&&el.matches('[data-source-play],[data-tape-back],[data-tape-stop],[data-tape-forward],.at-startstop'))return 'vintageSteel';
        if(el.matches('[data-source-play],[data-tape-back],[data-tape-stop],[data-tape-forward]'))return 'transport';
        if(el.matches('.at-startstop'))return 'studioCap';
        if((SELECTOR_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type))&&el.matches('.selector-key'))return 'illuminatedBar';
        if(dev.type==='powerAmp'&&el.matches('[data-receiver-input]'))return 'illuminatedBar';
        if(el.matches('.receiver-source-buttons button,.selector-key,[data-integrated-source],[data-pre-source],[data-integrated-direct],[data-pre-toggle]')){
            if(vintage)return 'vintageSteel';
            if(['preDisplay','integratedMinimal'].includes(dev.type))return 'illuminatedBar';
            if(['preControl','integratedSilver'].includes(dev.type))return 'flushMetal';
            if(dev.type==='integratedBlue'&&el.matches('[data-integrated-direct]'))return 'selectorKey';
            if(el.matches('.selector-key'))return 'studioCap';
            return 'modernGraphite';
        }
        if(el.matches('.btn-bt-pair'))return 'membrane';
        return el.hasAttribute('aria-pressed')?'toggle':'key';
    }
    function bindButtonFeedback(el,spec){
        if(!el.closest('.device-node')||el.hasAttribute('data-hardware-feedback'))return;
        el.dataset.hardwareFeedback='';el.dataset.buttonAction=spec.action;
        let held=false,pointer=null,lastDown=-Infinity,releaseTimer=null;
        const switching=spec.action==='rocker'||spec.action==='slide';
        const preview=()=>{
            if(!el.hasAttribute('data-demo-button')||spec.action!=='momentary')return;
            el.setAttribute('aria-pressed',String(held));el.classList.toggle('active',held);el.classList.toggle('off',!held);
            const output=el.closest('.hardware-demo-card')?.querySelector('output');if(output)output.textContent=held?'PRESSIONADO':'SOLTO';
        };
        const finish=event=>{
            if(!held||(event?.pointerId!=null&&pointer!=null&&event.pointerId!==pointer))return;
            const cancelled=['pointercancel','blur','cancel'].includes(event?.type)||!el.isConnected;
            held=false;pointer=null;clearTimeout(releaseTimer);el.classList.remove('hw-pressing');
            document.removeEventListener('pointerup',finish,true);document.removeEventListener('pointercancel',finish,true);window.removeEventListener('blur',finish);
            releases.delete(el);preview();
            if(!cancelled&&!switching)playUiSound(spec.sound+'Up');
        };
        const begin=event=>{
            if(held||el.disabled)return;
            held=true;pointer=event?.pointerId??null;lastDown=performance.now();el.classList.add('hw-pressing');preview();
            document.addEventListener('pointerup',finish,true);document.addEventListener('pointercancel',finish,true);window.addEventListener('blur',finish);
            releases.set(el,()=>finish({type:'cancel'}));
            playUiSound(switching?'hwSwitchPreload':spec.sound+'Down');
        };
        el.addEventListener('pointerdown',event=>{if(event.button===0){el.classList.add('hw-pointer-focus');begin(event);}});
        el.addEventListener('keydown',event=>{el.classList.remove('hw-pointer-focus');if([' ','Enter'].includes(event.key)){if(event.repeat){event.preventDefault();return;}begin(event);}});
        el.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key))finish(event);});
        el.addEventListener('blur',()=>{el.classList.remove('hw-pointer-focus');finish({type:'blur'});});
        el.addEventListener('click',event=>{
            if(el.disabled)return;
            if(event.detail===0&&!held&&performance.now()-lastDown>350){begin();releaseTimer=setTimeout(()=>finish(),90);}
            if(switching)queueMicrotask(()=>{
                if(!el.isConnected)return;
                const on=el.hasAttribute('aria-checked')?el.getAttribute('aria-checked')==='true':!el.classList.contains('off');
                playUiSound(spec.sound+(on?'On':'Off'));
            });
        });
    }
    function skinButton(el,model,dimensions){
        if(model==='chromeLever'&&!el.classList.contains('hw-chrome-lever')){el.classList.add('hw-chrome-lever');el.innerHTML='<span class="hw-chrome-collar"><i class="hw-chrome-stem"><b></b></i></span>';}
        if(model==='industrialToggle'&&!el.classList.contains('hw-industrial-toggle')){el.classList.add('hw-industrial-toggle');el.innerHTML='<span class="hw-lever-well"><i class="hw-lever-stem"></i><b class="hw-lever-tip"></b></span>';}
        if(dimensions)setControlSize(el,dimensions);
        if(el.dataset.buttonModel&&Object.hasOwn(buttons,el.dataset.buttonModel)){bindButtonFeedback(el,buttons[el.dataset.buttonModel]);applyControlSize(el,'button',el.dataset.buttonModel);return;}
        if(model==='illuminatedBar'&&el.classList.contains('power-btn')&&!el.textContent.trim())el.textContent='⏻';
        const spec=buttons[model];if(!spec)throw new Error('Unknown hardware button: '+model);
        el.dataset.buttonModel=model;el.classList.add('hw-button');bindButtonFeedback(el,spec);
        el.style.setProperty('--hw-button-height',spec.height+'px');el.style.setProperty('--hw-button-radius',spec.radius+'px');el.style.setProperty('--hw-button-travel',spec.travel+'px');
        if(!el.closest('.device-node')&&model==='ui'){if(dimensions||el.hasAttribute('data-control-width')||el.hasAttribute('data-control-height'))applyControlSize(el,'button',model);return;}
        if(!el.hasAttribute('aria-label')){const label=el.textContent.trim()||el.title;if(label){el.setAttribute('aria-label',label);el.dataset.hardwareAutoLabel='';}}
        if(['vintageSteel','vintageRecessed','modernSteel','modernGraphite'].includes(model)){
            el.classList.add('hw-mechanical-key');
            const face=document.createElement('span');face.className='hw-mechanical-key-face';face.setAttribute('aria-hidden','true');
            if(el.hasAttribute('data-demo-button')||!el.childNodes.length)face.innerHTML='<i></i>';
            else {const legend=document.createElement('span');legend.className='hw-mechanical-key-legend';legend.append(...el.childNodes);face.appendChild(legend);}
            el.replaceChildren(face);
        }else if(spec.action==='rocker')skinRocker(el,model);
        else if(model==='slidePower'){el.classList.add('power-btn');slidingPower(el);}
        else if(['slideSelector','slideSelectorModern'].includes(model))skinSlideSelector(el);
        else {
            el.classList.add('hw-plunger-key');
            if(model==='roundKey')el.classList.add('hw-round-key');
            const face=document.createElement('span');face.className='hw-plunger-face';face.setAttribute('aria-hidden','true');
            const legend=document.createElement('span');legend.className='hw-plunger-legend';
            if(model==='roundKey'&&el.hasAttribute('data-demo-button'))legend.innerHTML=bluetoothSymbol;
            else if(el.hasAttribute('data-demo-button')&&['ivoryPiano','brassPill','studioCap','flushMetal','illuminatedBar','membrane'].includes(model))legend.textContent='●';
            else if(el.hasAttribute('data-demo-button')&&model!=='ui')legend.innerHTML='<i class="hardware-demo-button-led"></i>';
            else if(el.hasAttribute('data-demo-button'))legend.textContent='OK';
            else legend.append(...el.childNodes);
            face.appendChild(legend);
            const sizer=document.createElement('span');sizer.className='hw-button-sizer';sizer.setAttribute('aria-hidden','true');sizer.textContent=legend.textContent||'●';el.replaceChildren(sizer,face);
        }
        if(model==='illuminatedBar'){const lens=document.createElement('i');lens.className='hw-bar-lens';lens.setAttribute('aria-hidden','true');el.querySelector('.hw-plunger-face')?.appendChild(lens);}
        applyControlSize(el,'button',model);
    }
    function slider(el){
        if(el.dataset.hardwareSlider)return;
        const model=el.matches('#source-progress')?'seek':el.matches('.eq-slider')?'vertical':'horizontal',spec=sliders[model];
        el.dataset.hardwareSlider=model;el.classList.add('hw-slider');el.style.setProperty('--hw-track',spec.track+'px');el.style.setProperty('--hw-thumb',spec.thumb+'px');
        if(model==='vertical')el.style.setProperty('--hw-slider-length',spec.length+'px');
        if(model==='seek')return;
        const min=Number(el.min),max=Number(el.max);if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)return;
        const step=(max-min)/physics.detents;el.step=String(step);
        const magnet=()=>{el.value=snap(Number(el.value),min,max,step);};
        el.addEventListener('input',magnet,{capture:true});el.addEventListener('change',magnet,{capture:true});
    }
    function bindLinear(el,options){
        el.classList.add('hw-linear');el.dataset.hardwareLinear='vertical';
        bindKnob(el,{...options,kind:'linear'});
    }
    function dispose(dev){if(readoutOwner&&dev.el.contains(readoutOwner))hideKnobReadout(0);dev.el.querySelectorAll('[data-hardware-knob],[data-hardware-linear],[data-hardware-feedback]').forEach(el=>releases.get(el)?.());}
    function layout({type,el}){
        if(type==='streamIntegrated'){
            el.dataset.chassis='high';el.style.setProperty('--chassis-height',sizes.heights.high+'px');
            for(const key of ['height','min-height','max-height'])el.style.setProperty(key,sizes.heights.high+'px','important');
            return;
        }
        if(['prePrecision','preGlass'].includes(type))return;
        if(type==='hardwareDemo'||FURNITURE_TYPES[type]||isListeningDevice({type})||(SOURCE_TYPES.has(type)&&!SIGNAL_GENERATOR_TYPES.has(type)&&!['btReceiverA','cdPlayer','streamer'].includes(type)))return;
        const compact=!!INTERFACE_DEVICES[type]||['headphoneAmp','headphoneAmpModern','btTransmitterPro','btReceiverA'].includes(type);
        const height=type==='powerValve'?'high':INTEGRATED_AMPS[type]||CUSTOM_PREAMPS[type]||CUSTOM_POWER_AMPS[type]||RADIO_RECEIVERS.has(type)||MIXER_TYPES.has(type)||EQ_TYPES.has(type)||BENCH_METER_TYPES.has(type)||SIGNAL_GENERATOR_TYPES.has(type)?'medium':'low';
        el.dataset.chassis=height;el.dataset.chassisWidth=compact?'compact':'full';
        const width=sizes.widths[el.dataset.chassisWidth],h=sizes.heights[height];el.style.setProperty('--chassis-height',h+'px');el.style.setProperty('--chassis-width',width+'px');
        for(const [key,value]of Object.entries({width:width+'px','min-width':width+'px','max-width':width+'px',height:h+'px','min-height':h+'px','max-height':h+'px'}))el.style.setProperty(key,value,'important');
    }
    function setLed(el,on,clipping=false){
        el.classList.toggle('is-signal',!!on);el.classList.toggle('is-lit',!!on);el.classList.toggle('is-clipping',!!on&&!!clipping);el.dataset.lit=String(!!on);
    }
    function mount(dev){
        dev.el.style.setProperty('--hw-motion',physics.settleMs+'ms');dev.el.style.setProperty('--hw-press',physics.pressMs+'ms');dev.el.style.setProperty('--hw-led-clip',leds.clip.color);
        dev.el.querySelectorAll('[data-hardware-knob]').forEach(el=>{
            skinKnob(el,bindings.get(el)?.model||knobModel(dev,el));const accent=el.dataset.demoAccent||accentModel(dev,el);if(accent)skinAccent(dev,el,accent);
        });
        dev.el.querySelectorAll('.speaker-grille').forEach(el=>{el.dataset.hardwareSurface='grille';});
        dev.el.querySelectorAll('button:not([data-hardware-knob]):not(.speaker-grille):not(.cd-tray)').forEach(el=>skinButton(el,buttonModel(dev,el)));
        dev.el.querySelectorAll('input[type="range"]').forEach(slider);
        dev.el.querySelectorAll('.device-led,.at-led,.integrated-status-led,.selector-input-led,.graphic-eq-led,[data-dual-led],.stereo-power-meters i,.bt-indicator').forEach(el=>{
            const model=el.hasAttribute('data-dual-led')?'signal':dev.el.classList.contains('device-family-vintage')?'warm':el.classList.contains('bt-indicator')?'blue':'power',spec=leds[model];
            el.dataset.ledModel=model;el.classList.add('hw-led');el.style.setProperty('--hw-led-color',spec.color);el.style.setProperty('--hw-led-size',spec.size+'px');
        });
        dev.el.querySelectorAll('.port').forEach(el=>{el.dataset.socketModel=el.dataset.type;});
        if(!['hardwareDemo','lightPoint'].includes(dev.type))mountLightingDemo(dev.el);
        sync(dev);
    }
    function mountLightingDemo(device){
        const furniture=device.classList.contains('furniture-node');
        const projectedParts='.hw-knob,.hw-button,.hw-linear,.port,.pre-handle,.dual-handle,.bench-handle,.graphic-eq-handle,.mixer-rack-handle';
        const controls=[...device.querySelectorAll(projectedParts)].filter(control=>control.getClientRects().length);
        const surfaces=new Set();
        controls.forEach(control=>{
            let surface=control;
            while(surface.parentElement&&surface.parentElement!==device)surface=surface.parentElement;
            if(surface.parentElement===device&&surface!==control&&surface.clientWidth&&surface.clientHeight)surfaces.add(surface);
        });
        if(!furniture&&!surfaces.size){
            const face=[...device.children].find(child=>child.classList.contains('furniture-body')||(!child.classList.contains('device-header')&&!child.classList.contains('auto-stack-foot')&&child.clientWidth&&child.clientHeight));
            if(face)surfaces.add(face);
        }
        if(!furniture&&!surfaces.size)return;
        device.classList.add('lighting-demo-target');
        surfaces.forEach(surface=>{
            surface.classList.add('lighting-shadow-surface');
            if(getComputedStyle(surface).position==='static')surface.style.position='relative';
            if(surface.querySelector(':scope > .lighting-shadow-canvas'))return;
            const canvas=document.createElement('canvas');canvas.className='lighting-shadow-canvas';canvas.setAttribute('aria-hidden','true');surface.appendChild(canvas);
        });
        if(!furniture&&!device.querySelector(':scope > .lighting-incident-overlay')){
            const overlay=document.createElement('div');overlay.className='lighting-incident-overlay';overlay.setAttribute('aria-hidden','true');device.appendChild(overlay);
        }
        mountLightingSilhouette(device);
        updateLightingDemo();
    }
    function mountLightingSilhouette(device){
        if(!device.matches('.device-type-powerValve,.device-type-turntable,.device-type-turntableVintage,.device-type-turntableLinear,.device-type-streamIntegrated,.headphone-equipment,.floorstanding-speaker,.bookshelf-speaker')&&!device.querySelector('.sp-cab'))return;
        const width=device.offsetWidth,height=device.offsetHeight,deviceRect=device.getBoundingClientRect();
        if(!width||!height||!deviceRect.width)return;
        const scale=width/deviceRect.width,mask=document.createElement('canvas');mask.width=width;mask.height=height;
        const ctx=mask.getContext('2d');if(!ctx)return;
        ctx.fillStyle='#fff';
        const box=element=>{const rect=element.getBoundingClientRect();return{x:(rect.left-deviceRect.left)*scale,y:(rect.top-deviceRect.top)*scale,width:rect.width*scale,height:rect.height*scale};};
        const fill=(rect,radius=0)=>{if(!rect||rect.width<=0||rect.height<=0)return;ctx.beginPath();ctx.roundRect(rect.x,rect.y,rect.width,rect.height,Math.min(radius,rect.width/2,rect.height/2));ctx.fill();};
        if(device.classList.contains('device-type-powerValve')){
            const svg=device.querySelector('.valve-assembly');
            if(svg){
                const svgBox=box(svg);
                fill({x:svgBox.x,y:svgBox.y+svgBox.height*160/184,width:svgBox.width,height:svgBox.height*24/184});
                svg.querySelectorAll(':scope > g').forEach(group=>fill(box(group),group.getBBox().width<100?12:7));
            }
            fill(box(device.querySelector('.custom-power-connections')),4);
        }else if(device.classList.contains('device-type-streamIntegrated')){
            device.querySelectorAll('.stream-housing,.stream-heat-sink,.stream-glass,.stream-service-rail,.stream-foot,[data-stream-volume]').forEach(part=>fill(box(part),3));
        }else if(device.classList.contains('headphone-equipment')){
            const art=device.querySelector('.headphone-artwork,.kuba-art');
            if(art){
                let image=art.tagName.toLowerCase()==='img'?art:art._lightingMaskImage;
                if(!image&&art.tagName.toLowerCase()==='svg'){
                    image=new Image();art._lightingMaskImage=image;
                    image.addEventListener('load',()=>mountLightingSilhouette(device),{once:true});
                    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(art));
                }
                if(image.complete&&image.naturalWidth){const rect=box(art);ctx.drawImage(image,rect.x,rect.y,rect.width,rect.height);}
                else if(art.tagName.toLowerCase()==='img')art.addEventListener('load',()=>mountLightingSilhouette(device),{once:true});
            }
            device.querySelectorAll('.headphone-stand-post,.headphone-stand-cradle,.headphone-stand-base').forEach(part=>fill(box(part),parseFloat(getComputedStyle(part).borderTopLeftRadius)||2));
        }else if(device.classList.contains('floorstanding-speaker')||device.classList.contains('bookshelf-speaker')||device.querySelector('.sp-cab')){
            device.querySelectorAll('.sp-cab,.bookshelf-cabinet,.tower-cabinet,.tower-plinth,.tower-foot,.tower-top-tweeter,.shelf-top-tweeter').forEach(part=>fill(box(part),parseFloat(getComputedStyle(part).borderTopLeftRadius)||3));
        }else if(device.classList.contains('device-type-turntableLinear')){
            const art=device.querySelector('.linear-art');
            if(art){
                const rect=box(art),unitX=rect.width/660,unitY=rect.height/252;
                const part=(x,y,w,h,r=0)=>fill({x:rect.x+x*unitX,y:rect.y+y*unitY,width:w*unitX,height:h*unitY},r);
                part(4,122,652,116,3);part(37,237,37,15,3);part(586,237,37,15,3);
                part(35,102,380,18,3);part(41,40,511,9,2);part(559,56,69,66,2);
            }
        }else{
            const plinth=device.querySelector('.at-plinth');
            if(plinth){const rect=box(plinth),deckHeight=parseFloat(getComputedStyle(device).getPropertyValue('--tt-deck-height'))||120;fill({x:rect.x,y:rect.y+deckHeight,width:rect.width,height:Math.max(0,rect.height-deckHeight)},5);}
            const platter=device.querySelector('.at-front-mechanism .at-platter');if(platter)fill(box(platter),4);
        }
        device.style.setProperty('--lighting-silhouette-mask',`url("${mask.toDataURL()}")`);
        device.classList.add('lighting-shaped-silhouette');
    }
    let lightingDemoFrame=0;
    const lightingGeometry=new WeakMap();
    let furnitureLightingGeometry={key:'',items:[]};
    let floorShadowKey='';
    function positionedSceneLights(scene,time,world){
        return RoomScenes.lights(scene,time).map(source=>{
            const depth=source.layer==='near'?'near':source.layer==='mid'?'mid':'far';
            const farX=parseFloat(world.style.getPropertyValue(`--room-${depth}-x`))||0;
            const farY=parseFloat(world.style.getPropertyValue(`--room-${depth}-y`))||0;
            const scale=parseFloat(world.style.getPropertyValue(`--room-${depth}-scale`))||1;
            const rawX=world.offsetWidth*(-.06+1.12*(240+source.cx*.8)/2400);
            const rawY=world.offsetHeight*(-.1+1.1*(268+source.cy*.8)/1600);
            return {...source,x:world.offsetWidth/2+(rawX-world.offsetWidth/2)*scale+farX,y:world.offsetHeight+(rawY-world.offsetHeight)*scale+farY,width:source.w*.8*1.12*world.offsetWidth/2400*scale,height:source.h*.8*1.1*world.offsetHeight/1600*scale,reach:2100*world.offsetWidth/2736};
        });
    }
    function positionedObjectLights(world){
        const worldRect=world.getBoundingClientRect(),scale=worldRect.width/world.offsetWidth;
        if(!scale)return [];
        const bench=[...world.querySelectorAll('.device-type-furnitureTable .bench-decoration-lamp')].map(lamp=>{
            const rect=lamp.getBoundingClientRect();
            return {x:(rect.left+rect.width*135/284-worldRect.left)/scale,y:(rect.top+rect.height*187/656-worldRect.top)/scale,width:110,height:24,shape:'bar',rgb:[255,205,105],strength:1.45,elevation:135,reach:1100,shade:{opening:1.22,penumbra:.24}};
        });
        const pendants=[...world.querySelectorAll('.device-type-pendantLamp .pendant-filament')].map(filament=>{
            const rect=filament.getBoundingClientRect();
            return {x:(rect.left+rect.width/2-worldRect.left)/scale,y:(rect.top+rect.height/2-worldRect.top)/scale,width:28,height:36,shape:'point',rgb:[255,192,82],strength:1.9,elevation:220,reach:1550,shade:{opening:1.2,penumbra:.2}};
        });
        return [...bench,...pendants];
    }
    function sampleSceneLight(source,x,y){
        const emitterX=source.emitterX??source.x,emitterY=source.emitterY??source.y;
        const nearestX=Math.max(emitterX-source.width/2,Math.min(emitterX+source.width/2,x));
        const nearestY=Math.max(emitterY-source.height/2,Math.min(emitterY+source.height/2,y));
        const distance=Math.hypot(nearestX-x,nearestY-y);
        const inside=!distance,sx=inside?emitterX:nearestX,sy=inside?emitterY:nearestY;
        // A cúpula cobre o bulbo por cima: só a abertura inferior deixa a luz escapar.
        const angle=Math.atan2(Math.abs(x-emitterX),y-emitterY);
        const shade=source.shade?Math.max(0,Math.min(1,(source.shade.opening-angle)/source.shade.penumbra)):1;
        return {...source,emitterX,emitterY,x:sx,y:sy,weight:source.strength*shade*Math.max(0,1-distance/(source.reach||2100)),spread:source.shape==='rect'?7:source.shape==='bar'?4:2};
    }
    function sceneLightAt(x,y){
        const canvas=document.getElementById('canvas');
        const world=document.getElementById('audio-world');
        const roomLights=canvas.dataset.theme==='scene'?positionedSceneLights(canvas.dataset.backdrop,canvas.dataset.time,world):[];
        return [...roomLights,...positionedObjectLights(world)].map(source=>sampleSceneLight(source,x,y)).reduce((best,source)=>source.weight>(best?.weight||0)?source:best,null);
    }
    function updateLightingDemo(){
        if(lightingDemoFrame)return;
        lightingDemoFrame=requestAnimationFrame(()=>{lightingDemoFrame=0;paintLightingDemo();});
    }
    function paintFloorShadows(world,roomLights,equipment,testLight){
        const layer=world.querySelector(':scope > .room-floor-shadows'),canvas=document.getElementById('canvas');
        if(!layer)return;
        if(canvas.dataset.theme!=='scene'||canvas.dataset.floor==='none'){
            if(floorShadowKey){layer.getContext('2d').clearRect(0,0,layer.width,layer.height);floorShadowKey='';}
            return;
        }
        const furniture=[...world.querySelectorAll('.furniture-node:not(.acoustic-node)')].map(el=>({el,x:el.offsetLeft,y:el.offsetTop,width:el.offsetWidth,height:el.offsetHeight,furniture:true}));
        const allCasters=[...furniture,...equipment.map(box=>({...box,furniture:false}))];
        const worldHeight=world.offsetHeight,visibleTop=worldHeight-313;
        const worldRect=world.getBoundingClientRect(),viewRect=canvas.getBoundingClientRect(),viewScale=worldRect.width/world.offsetWidth;
        const minX=(viewRect.left-worldRect.left)/viewScale-700,maxX=(viewRect.right-worldRect.left)/viewScale+700;
        const casters=allCasters.filter(box=>box.x+box.width>=minX&&box.x<=maxX&&box.y+box.height>=visibleTop-620);
        const lights=testLight?[...roomLights,testLight]:roomLights;
        const floorShift=parseFloat(world.style.getPropertyValue('--floor-parallax-x'))||0;
        const floorScale=parseFloat(world.style.getPropertyValue('--floor-parallax-scale'))||1;
        const key=[world.offsetWidth,world.offsetHeight,canvas.dataset.floor,floorShift.toFixed(1),floorScale.toFixed(3),Math.round(minX/30),Math.round(maxX/30),...lights.map(light=>[Math.round(light.x/3),Math.round(light.y/3),light.strength.toFixed(2)]),...allCasters.map(box=>[box.el.id,Math.round(box.x),Math.round(box.y),box.width,box.height,box.el.style.visibility])].join('|');
        if(key===floorShadowKey)return;
        floorShadowKey=key;
        const width=world.offsetWidth*1.16,height=560,resolution=.5;
        if(layer.width!==Math.round(width*resolution)||layer.height!==height*resolution){layer.width=Math.round(width*resolution);layer.height=height*resolution;}
        const ctx=layer.getContext('2d');ctx.setTransform(resolution,0,0,resolution,0,0);ctx.clearRect(0,0,width,height);
        if(!casters.length)return;
        const point=(x,y)=>{
            const displayDistance=Math.max(0,Math.min(312,worldHeight-y));
            const depth=displayDistance/(Math.cos(.6632)-displayDistance*Math.sin(.6632)/850);
            const perspective=1/(1+depth*Math.sin(.6632)/850);
            return {x:width/2+(x-world.offsetWidth/2-floorShift)/(floorScale*perspective),y:height-depth};
        };
        const ellipse=(x,y,rx,ry,alpha)=>{
            if(alpha<=0||rx<=0||ry<=0)return;
            ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
            const fade=ctx.createRadialGradient(0,0,.16,0,0,1);
            fade.addColorStop(0,`rgba(17,14,13,${Math.min(.42,alpha).toFixed(3)})`);
            fade.addColorStop(.62,`rgba(19,16,15,${(alpha*.57).toFixed(3)})`);
            fade.addColorStop(1,'rgba(19,16,15,0)');
            ctx.fillStyle=fade;ctx.fillRect(-1,-1,2,2);ctx.restore();
        };
        const inPath=(light,x,y,box)=>{
            if(box.x<=light.x&&light.x<=box.x+box.width&&box.y<=light.y&&light.y<=box.y+box.height)return false;
            let start=0,end=1,dx=x-light.x,dy=y-light.y;
            for(const [origin,delta,min,max] of [[light.x,dx,box.x+12,box.x+box.width-12],[light.y,dy,box.y+12,box.y+box.height-12]]){
                if(Math.abs(delta)<.001){if(origin<min||origin>max)return false;continue;}
                const a=(min-origin)/delta,b=(max-origin)/delta;
                start=Math.max(start,Math.min(a,b));end=Math.min(end,Math.max(a,b));
                if(start>end)return false;
            }
            return start>.04&&start<.88;
        };
        casters.forEach(box=>{
            if(box.el.style.visibility==='hidden'||box.width<15||box.height<15)return;
            const centerX=box.x+box.width/2,bottom=box.y+box.height;
            if(!box.furniture&&furniture.some(item=>centerX>item.x+20&&centerX<item.x+item.width-20&&bottom<item.y+item.height-20&&bottom>item.y-40))return;
            const heightFade=Math.max(0,1-Math.max(0,visibleTop-bottom)/620);
            if(heightFade<=0)return;
            const baseY=Math.max(visibleTop+8,Math.min(worldHeight-12,bottom));
            const base=point(centerX,baseY),edge=point(centerX+box.width/2,baseY);
            const radius=Math.min(540,Math.abs(edge.x-base.x));
            ellipse(base.x,base.y,Math.max(18,radius),box.furniture?35:20,(box.furniture ? .23 : .13)*heightFade);
            const samples=lights.map(light=>sampleSceneLight(light,centerX,box.y+box.height*.55)).filter(light=>light.weight>.08).sort((a,b)=>b.weight-a.weight).slice(0,2);
            const total=samples.reduce((sum,light)=>sum+light.weight,0)+.45;
            samples.forEach(light=>{
                if(allCasters.some(other=>other!==box&&(other.furniture||other.height>box.height*.55)&&inPath(light,centerX,box.y+box.height*.55,other)))return;
                const physicalHeight=Math.min(180,Math.max(12,box.height*(box.furniture ? .22 : .18)));
                const ratio=physicalHeight/(light.elevation+physicalHeight);
                const shiftX=Math.max(-350,Math.min(350,(centerX-light.x)*ratio));
                const shiftY=Math.max(-230,Math.min(230,(baseY-light.y)*ratio));
                const tip=point(centerX+shiftX,Math.min(worldHeight-5,baseY+shiftY));
                const alpha=(box.furniture ? .38 : .27)*heightFade*light.weight/total;
                ellipse(base.x+(tip.x-base.x)*.45,base.y+(tip.y-base.y)*.45,Math.max(18,radius*.82),box.furniture?52:31,alpha);
                ellipse(tip.x,tip.y,Math.max(15,radius*.65),box.furniture?57:35,alpha*.65);
            });
        });
    }
    function paintLightingDemo(){
        const light=document.querySelector('#audio-world .lighting-demo-light');
        const lx=light?light.offsetLeft+light.offsetWidth/2:0,ly=light?light.offsetTop+light.offsetHeight/2:0,lightHeight=170;
        const color=light?.querySelector('input[type="color"]')?.value||'#e4f4ff';
        const intensity=light&&light.getAttribute('aria-checked')!=='false'?Number(light.querySelector('input[type="range"]')?.value||0)/100:0;
        const rgb=[1,3,5].map(index=>parseInt(color.slice(index,index+2),16));
        if(light){light.style.setProperty('--demo-light-color',color);light.style.setProperty('--demo-light-strength',intensity);}
        const world=document.getElementById('audio-world');
        const zoom=Number(world.style.getPropertyValue('--canvas-zoom'))||1;
        const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
        const incidentPosition=(source,origin,size)=>(Math.max(12,Math.min(88,(source-origin)/Math.max(1,size)*100))).toFixed(1)+'%';
        const viewport=document.getElementById('canvas').getBoundingClientRect();
        const furnitureBodies=[...world.querySelectorAll('.furniture-node .rack-body')];
        const sceneName=viewport&&document.getElementById('canvas').dataset.theme==='scene'?document.getElementById('canvas').dataset.backdrop:'';
        const sceneTime=document.getElementById('canvas').dataset.time;
        const sceneEmitters=[...positionedSceneLights(sceneName,sceneTime,world),...positionedObjectLights(world)];
        const sceneEmitterKey=sceneTime+':'+sceneEmitters.map(source=>Math.round(source.x/8)+','+Math.round(source.y/8)).join(';');
        const furnitureKey=furnitureBodies.map(body=>{const node=body.closest('.furniture-node');return node.id+':'+node.style.left+':'+node.style.top;}).join('|');
        if(furnitureLightingGeometry.key!==furnitureKey){
            const worldRect=world.getBoundingClientRect(),worldScale=worldRect.width/world.offsetWidth;
            const rectInWorld=element=>{const rect=element.getBoundingClientRect();return{x:(rect.left-worldRect.left)/worldScale,y:(rect.top-worldRect.top)/worldScale,width:rect.width/worldScale,height:rect.height/worldScale};};
            furnitureLightingGeometry={key:furnitureKey,items:furnitureBodies.map(body=>({
                id:body.closest('.furniture-node').id,...rectInWorld(body),
                parts:[...body.querySelectorAll('.furniture-side,.furniture-shelf,.furniture-top')].map(part=>({...rectInWorld(part),kind:part.classList.contains('furniture-side')?'side':part.classList.contains('furniture-top')?'top':'shelf'}))
            }))};
        }
        const furniture=furnitureLightingGeometry.items;
        const stackBoxes=[...world.querySelectorAll('.device-node:not(.furniture-node):not(.lighting-demo-light):not(.device-type-pendantLamp)')].filter(el=>el.style.visibility!=='hidden').map(el=>({el,x:el.offsetLeft,y:el.offsetTop,width:el.offsetWidth,height:el.offsetHeight}));
        const stackTops=stackBoxes.filter(box=>box.width>=300&&(box.height<box.width*.8||box.el.classList.contains('device-type-tapeDeck')));
        paintFloorShadows(world,sceneEmitters,stackBoxes,intensity?{x:lx,y:ly,width:20,height:20,strength:intensity,elevation:170,reach:1500,rgb}:null);
        world.querySelectorAll('.furniture-node.lighting-demo-target').forEach(node=>{
            const rect=node.getBoundingClientRect();
            if(rect.right<viewport.left||rect.left>viewport.right||rect.bottom<viewport.top||rect.top>viewport.bottom)return;
            const key=lx+'|'+ly+'|'+color+'|'+intensity+'|'+sceneName+'|'+sceneEmitterKey+'|'+node.offsetLeft+'|'+node.offsetTop+'|'+node.dataset.back;
            if(node.dataset.lightPaintKey===key)return;
            node.dataset.lightPaintKey=key;
            node.style.setProperty('--demo-light-rgb',rgb.join(' '));node.style.setProperty('--demo-light-strength',intensity);
            node.querySelectorAll('.furniture-part,.acoustic-panel').forEach(part=>{
                const box=part.getBoundingClientRect(),scale=rect.width/node.offsetWidth;
                const x=(box.left-rect.left)/scale+node.offsetLeft,y=(box.top-rect.top)/scale+node.offsetTop;
                part.style.setProperty('--demo-part-light-x',((lx-x)/((box.width/scale)||1)*100).toFixed(1)+'%');
                part.style.setProperty('--demo-part-light-y',((ly-y)/((box.height/scale)||1)*100).toFixed(1)+'%');
                const source=sceneEmitters.map(item=>sampleSceneLight(item,x+box.width/scale/2,y+box.height/scale/2)).sort((a,b)=>b.weight-a.weight)[0];
                part.style.setProperty('--demo-scene-light-strength',(source?.weight||0).toFixed(3));
                if(source){part.style.setProperty('--demo-scene-light-rgb',source.rgb.join(' '));part.style.setProperty('--demo-scene-light-x',incidentPosition(source.x,x,box.width/scale));part.style.setProperty('--demo-scene-light-y',incidentPosition(source.y,y,box.height/scale));}
            });
            const rack=furniture.find(item=>item.id===node.id);
            if(rack){
                const source=sceneEmitters.map(item=>sampleSceneLight(item,rack.x+rack.width/2,rack.y+rack.height/2)).reduce((best,item)=>item.weight>(best?.weight||0)?item:best,null);
                drawFurnitureInteriorShadows(node,rack,intensity?lx:source?.x||0,intensity?ly:source?.y||0,intensity||source?.weight||0);
            }
        });
        document.querySelectorAll('#audio-world .lighting-demo-target').forEach(device=>{
            if(device.classList.contains('furniture-node'))return;
            const visibleRect=device.getBoundingClientRect();
            if(visibleRect.right<viewport.left||visibleRect.left>viewport.right||visibleRect.bottom<viewport.top||visibleRect.top>viewport.bottom)return;
            let geometry=lightingGeometry.get(device);
            if(!geometry){
                const scale=visibleRect.width/device.offsetWidth;
                geometry={width:device.offsetWidth,height:device.offsetHeight,lastPosition:'',surfaces:[...device.querySelectorAll(':scope > .lighting-shadow-surface')].map(face=>{
                    const faceRect=face.getBoundingClientRect();
                    return {face,canvas:face.querySelector(':scope > .lighting-shadow-canvas'),x:(faceRect.left-visibleRect.left)/scale,y:(faceRect.top-visibleRect.top)/scale,controls:[...face.querySelectorAll('.hw-knob,.hw-button,.hw-linear,.port,.pre-handle,.dual-handle,.bench-handle,.graphic-eq-handle,.mixer-rack-handle')].filter(control=>control.getClientRects().length).map(control=>{
                        const rect=control.getBoundingClientRect();
                        return {el:control,x:(rect.left+rect.width/2-visibleRect.left)/scale,y:(rect.top+rect.height/2-visibleRect.top)/scale,faceX:(rect.left+rect.width/2-faceRect.left)/scale,faceY:(rect.top+rect.height/2-faceRect.top)/scale,width:rect.width/scale,height:rect.height/scale,last:''};
                    })};
                })};
                lightingGeometry.set(device,geometry);
            }
            const deviceX=device.offsetLeft,deviceY=device.offsetTop;
            const centerX=deviceX+geometry.width/2,centerY=deviceY+geometry.height/2;
            const rack=furniture.find(item=>centerX>item.x+16&&centerX<item.x+item.width-16&&centerY>item.y+16&&centerY<item.y+item.height-16);
            const stackedAbove=stackTops.filter(upper=>upper.el!==device&&deviceY-upper.y-upper.height>=-.5&&deviceY-upper.y-upper.height<=20.5&&Math.min(deviceX+geometry.width,upper.x+upper.width)-Math.max(deviceX,upper.x)>=Math.min(geometry.width,upper.width)*.7);
            const stackKey=stackedAbove.map(upper=>upper.el.id+':'+upper.x+':'+upper.y).join('|');
            const positionKey=lx+'|'+ly+'|'+color+'|'+intensity+'|'+sceneName+'|'+sceneEmitterKey+'|'+deviceX+'|'+deviceY+'|'+(intensity?zoom.toFixed(2):0)+'|'+(rack?.id||'')+'|'+(rack?.x||0)+'|'+(rack?.y||0)+'|'+stackKey;
            if(geometry.lastPosition===positionKey)return;
            geometry.lastPosition=positionKey;
            const dx=clamp((lx-deviceX-geometry.width/2)/(geometry.width*.7),1);
            const dy=clamp((ly-deviceY-geometry.height/2)/(geometry.height*1.5),1);
            const reach=Math.max(geometry.width,geometry.height)*1.8+180;
            const falloff=Math.max(0,1-Math.hypot(lx-centerX,ly-centerY)/reach);
            const localScene=sceneEmitters.map(source=>sampleSceneLight(source,centerX,centerY)).sort((a,b)=>b.weight-a.weight);
            const shadowScene=localScene.find(source=>source.weight>.01);
            const shadowX=intensity?lx:shadowScene?.x||0,shadowY=intensity?ly:shadowScene?.y||0,shadowStrength=intensity||shadowScene?.weight||0;
            device.style.setProperty('--demo-panel-light-x',(50+dx*40).toFixed(1)+'%');
            device.style.setProperty('--demo-panel-light-y',(50+dy*40).toFixed(1)+'%');
            device.style.setProperty('--demo-light-rgb',rgb.join(' '));
            device.style.setProperty('--demo-light-strength',intensity);
            device.style.setProperty('--demo-incident-strength',(intensity*falloff).toFixed(3));
            localScene.slice(0,3).forEach((source,index)=>{
                const suffix=['a','b','c'][index];
                device.style.setProperty('--scene-light-'+suffix+'-rgb',source.rgb.join(' '));
                device.style.setProperty('--scene-light-'+suffix+'-x',incidentPosition(source.x,deviceX,geometry.width));
                device.style.setProperty('--scene-light-'+suffix+'-y',incidentPosition(source.y,deviceY,geometry.height));
                device.style.setProperty('--scene-light-'+suffix+'-strength',source.weight.toFixed(3));
                device.style.setProperty('--scene-light-'+suffix+'-radius-x',source.shape==='rect'?'90%':source.shape==='bar'?'38%':'52%');
                device.style.setProperty('--scene-light-'+suffix+'-radius-y',source.shape==='rect'?'85%':source.shape==='bar'?'75%':'70%');
            });
            if(!localScene[0])device.style.setProperty('--scene-light-a-strength','0');
            if(!localScene[1])device.style.setProperty('--scene-light-b-strength','0');
            if(!localScene[2])device.style.setProperty('--scene-light-c-strength','0');
            drawFurnitureOcclusion(device,geometry,rack,deviceX,deviceY,shadowX,shadowY,shadowStrength);
            drawStackOcclusion(device,geometry,stackedAbove,deviceX,deviceY,shadowX,shadowY,shadowStrength);
            const frontShadows=[];
            geometry.surfaces.forEach(surface=>{
                surface.controls.forEach(entry=>{
                    const {el:control,x,y,width,height:controlHeight}=entry;
                    const cx=deviceX+x,cy=deviceY+y,knob=control.classList.contains('hw-knob'),plug=control.classList.contains('port'),slider=control.classList.contains('hw-linear'),handle=control.matches('.pre-handle,.dual-handle,.bench-handle,.graphic-eq-handle,.mixer-rack-handle');
                    const finish=control.dataset.knobFinish,buttonModel=control.dataset.buttonModel;
                    const height=handle?18:plug?1.8:slider?3:knob?(finish==='disc'?5:finish==='recessed'?7:finish==='halo'?13:11):['chromeLever','industrialToggle','powerLarge'].includes(buttonModel)?8:['flushMetal','membrane','plainKey'].includes(buttonModel)?2.5:5;
                    let sx=(cx-lx)*height/lightHeight,sy=(cy-ly)*height/lightHeight;
                    const projection=Math.hypot(sx,sy),maxProjection=handle?30:plug?Math.min(4,Math.min(width,controlHeight)*.4+1):Math.min(18,Math.min(width,controlHeight)*.8+4);
                    if(projection>maxProjection){sx*=maxProjection/projection;sy*=maxProjection/projection;}
                    // The streamer's top dial sits behind the front rim, so it cannot cast onto the face.
                    if(intensity&&(!device.classList.contains('device-type-streamIntegrated')||!control.matches('[data-stream-volume]')))
                        frontShadows.push({x,y,width,height:controlHeight,sx,sy,knob:knob||(plug&&control.dataset.type!=='wire'),plug,slider,handle,weight:intensity});
                    if(!device.classList.contains('device-type-streamIntegrated')||!control.matches('[data-stream-volume]')){
                        localScene.slice(0,2).forEach(scene=>{
                            if(scene.weight<=.08)return;
                            const source=sampleSceneLight(scene,cx,cy);
                            let sceneX=(cx-source.x)*height/source.elevation,sceneY=(cy-source.y)*height/source.elevation;
                            const travel=Math.hypot(sceneX,sceneY),limit=Math.min(maxProjection,12);
                            if(travel>limit){sceneX*=limit/travel;sceneY*=limit/travel;}
                            frontShadows.push({x,y,width,height:controlHeight,sx:sceneX,sy:sceneY,knob:knob||(plug&&control.dataset.type!=='wire'),plug,slider,handle,weight:scene.weight*.95,softness:scene.spread});
                        });
                    }
                    const highlightX=intensity?lx:shadowScene?.x||cx,highlightY=intensity?ly:shadowScene?.y||cy;
                    const direction=Math.max(70,Math.hypot(cx-highlightX,cy-highlightY));
                    const values=[(50+clamp((highlightX-cx)/direction,-1)*34).toFixed(0)+'%',(50+clamp((highlightY-cy)/direction,-1)*34).toFixed(0)+'%'];
                    const key=values.join('|');if(entry.last===key)return;
                    entry.last=key;
                    control.style.setProperty('--demo-highlight-x',values[0]);
                    control.style.setProperty('--demo-highlight-y',values[1]);
                });
                drawLightingShadows(surface,lx-deviceX-surface.x,ly-deviceY-surface.y,zoom,rgb,intensity);
            });
            if(frontShadows.length)drawFrontControlShadows(device,geometry,frontShadows,intensity);
        });
    }
    function drawFrontControlShadows(device,geometry,shadows,intensity){
        let canvas=device.querySelector(':scope > .lighting-control-shadow');
        if(!canvas){canvas=document.createElement('canvas');canvas.className='lighting-control-shadow';canvas.setAttribute('aria-hidden','true');device.appendChild(canvas);}
        const width=geometry.width,height=geometry.height,ratio=Math.min(1,Math.sqrt(160000/(width*height)));
        const pixelWidth=Math.max(1,Math.round(width*ratio)),pixelHeight=Math.max(1,Math.round(height*ratio));
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
        paintControlShadows(ctx,shadows,intensity);
        ctx.globalCompositeOperation='destination-out';
        for(const shadow of shadows)drawSweptShadow(ctx,{...shadow,sx:0,sy:0},0,'#000');
        ctx.globalCompositeOperation='source-over';
    }
    function drawStackOcclusion(device,geometry,uppers,deviceX,deviceY,lightX,lightY,intensity){
        let canvas=device.querySelector(':scope > .lighting-stack-shadow');
        if(!uppers.length||!intensity){canvas?.classList.remove('is-active');return;}
        if(!canvas){canvas=document.createElement('canvas');canvas.className='lighting-stack-shadow';canvas.setAttribute('aria-hidden','true');device.appendChild(canvas);}
        canvas.classList.add('is-active');
        const width=geometry.width,height=geometry.height,ratio=Math.min(1,Math.sqrt(100000/(width*height)));
        const pixelWidth=Math.max(1,Math.round(width*ratio)),pixelHeight=Math.max(1,Math.round(height*ratio));
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
        for(const upper of uppers){
            const left=Math.max(0,upper.x-deviceX),right=Math.min(width,upper.x+upper.width-deviceX);
            const gap=Math.max(0,deviceY-upper.y-upper.height);
            const fromAbove=Math.max(0,Math.min(1,(deviceY-lightY+160)/320));
            const reach=4+fromAbove*18+Math.max(0,12-gap)*.15;
            const shift=Math.max(-14,Math.min(14,(upper.x+upper.width/2-lightX)*.025));
            const shade=ctx.createLinearGradient(0,0,0,reach);
            shade.addColorStop(0,`rgba(0,4,8,${Math.min(.26,intensity*.23)})`);
            shade.addColorStop(.35,`rgba(0,4,8,${Math.min(.14,intensity*.11)})`);
            shade.addColorStop(1,'rgba(0,4,8,0)');
            ctx.fillStyle=shade;ctx.beginPath();ctx.moveTo(left,0);ctx.lineTo(right,0);ctx.lineTo(right+shift,reach);ctx.lineTo(left+shift,reach);ctx.closePath();ctx.fill();
        }
    }
    function drawFurnitureOcclusion(device,geometry,rack,deviceX,deviceY,lightX,lightY,intensity){
        let canvas=device.querySelector(':scope > .lighting-furniture-shadow');
        if(!rack||!intensity){canvas?.classList.remove('is-active');return;}
        if(!canvas){canvas=document.createElement('canvas');canvas.className='lighting-furniture-shadow';canvas.setAttribute('aria-hidden','true');device.appendChild(canvas);}
        canvas.classList.add('is-active');
        const width=geometry.width,height=geometry.height;
        const ratio=Math.min(.5,Math.sqrt(160000/(width*height)));
        const pixelWidth=Math.max(1,Math.round(width*ratio)),pixelHeight=Math.max(1,Math.round(height*ratio));
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
        const shade=Math.min(.17,intensity*.12);
        const edge=(x,y,w,h,x1,y1,x2,y2,alpha)=>{
            const gradient=ctx.createLinearGradient(x1,y1,x2,y2);
            gradient.addColorStop(0,`rgba(0,4,8,${alpha})`);gradient.addColorStop(1,'rgba(0,4,8,0)');
            ctx.fillStyle=gradient;ctx.fillRect(x,y,w,h);
        };
        const shelves=rack.parts.filter(part=>part.kind==='shelf'||part.kind==='top');
        const above=shelves.filter(part=>part.y+part.height<=deviceY+2).sort((a,b)=>b.y-a.y)[0];
        if(above&&deviceY-above.y-above.height<42){
            const reach=6+Math.max(0,Math.min(1,(deviceY-lightY)/350))*10;
            edge(0,0,width,reach,0,0,0,reach,shade);
        }
        const below=shelves.filter(part=>part.y>=deviceY+height-2).sort((a,b)=>a.y-b.y)[0];
        if(below&&below.y-deviceY-height<22&&lightY>deviceY+height){
            const reach=6;edge(0,height-reach,width,reach,0,height,0,height-reach,shade*.6);
        }
        const sides=rack.parts.filter(part=>part.kind==='side').sort((a,b)=>a.x-b.x);
        const left=sides[0],right=sides.at(-1);
        if(left&&deviceX-left.x-left.width<36){
            const reach=5+Math.max(0,Math.min(1,(deviceX-lightX)/350))*9;
            edge(0,0,reach,height,0,0,reach,0,shade*.75);
        }
        if(right&&right.x-deviceX-width<36){
            const reach=5+Math.max(0,Math.min(1,(lightX-deviceX-width)/350))*9;
            edge(width-reach,0,reach,height,width,0,width-reach,0,shade*.75);
        }
    }
    function drawFurnitureInteriorShadows(node,rack,lightX,lightY,intensity){
        const body=node.querySelector('.rack-body');if(!body)return;
        let canvas=body.querySelector(':scope > .lighting-furniture-interior');
        if(!intensity||node.dataset.back!=='true'){canvas?.classList.remove('is-active');return;}
        if(!canvas){canvas=document.createElement('canvas');canvas.className='lighting-furniture-interior';canvas.setAttribute('aria-hidden','true');body.appendChild(canvas);}
        canvas.classList.add('is-active');
        const width=body.clientWidth,height=body.clientHeight,ratio=Math.min(.5,Math.sqrt(160000/(width*height)));
        const pixelWidth=Math.max(1,Math.round(width*ratio)),pixelHeight=Math.max(1,Math.round(height*ratio));
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
        const top=parseFloat(getComputedStyle(body).getPropertyValue('--back-top'))||16;
        const bottom=parseFloat(getComputedStyle(body).getPropertyValue('--back-bottom'))||20;
        ctx.save();ctx.beginPath();ctx.rect(20,top,width-40,height-top-bottom);ctx.clip();
        paintFurnitureBoardShadows(ctx,rack,rack.x,rack.y,lightX,lightY,intensity,width,height);
        ctx.restore();
    }
    function paintFurnitureBoardShadows(ctx,rack,originX,originY,lightX,lightY,intensity,width,height){
        const shadeAlpha=value=>`rgba(0,4,8,${Math.min(.7,value*intensity)})`;
        // The boards form one rigid frame, so their projected edges must share a displacement.
        const frameX=rack.x+rack.width/2,frameY=rack.y+rack.height/2;
        let sx=(frameX-lightX)*68/170,sy=(frameY-lightY)*68/170;
        const travel=Math.hypot(sx,sy),limit=125;
        if(travel>limit){sx*=limit/travel;sy*=limit/travel;}
        for(const board of rack.parts){
            const centerX=board.x+board.width/2,centerY=board.y+board.height/2;
            const shadow={x:centerX-originX,y:centerY-originY,width:board.width,height:board.height,sx,sy,knob:false};
            if(shadow.x+shadow.width/2+Math.max(0,sx)<-18||shadow.x-shadow.width/2+Math.min(0,sx)>width+18||shadow.y+shadow.height/2+Math.max(0,sy)<-18||shadow.y-shadow.height/2+Math.min(0,sy)>height+18)continue;
            drawSweptShadow(ctx,shadow,14,shadeAlpha(.035));
            drawSweptShadow(ctx,shadow,7,shadeAlpha(.06));
            const gradient=ctx.createLinearGradient(shadow.x,shadow.y,shadow.x+sx+.01,shadow.y+sy+.01);
            gradient.addColorStop(0,shadeAlpha(.22));gradient.addColorStop(1,shadeAlpha(.07));
            drawSweptShadow(ctx,shadow,0,gradient);
        }
    }
    function drawLightingShadows(geometry,lightX,lightY,zoom,rgb,intensity){
        const {canvas,face}=geometry;if(!canvas)return;
        if(!intensity){if(canvas.width&&canvas.height)canvas.getContext('2d')?.clearRect(0,0,canvas.width,canvas.height);return;}
        const width=face.clientWidth,height=face.clientHeight;
        if(!width||!height)return;
        const ratio=Math.min(Math.max(.35,Math.min((window.devicePixelRatio||1)*zoom,1.25)),Math.sqrt(400000/(width*height)));
        const pixelWidth=Math.round(width*ratio),pixelHeight=Math.round(height*ratio);
        if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight;}
        const ctx=canvas.getContext('2d');if(!ctx)return;
        ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
        const radius=Math.max(width,height)*.8,glow=ctx.createRadialGradient(lightX,lightY,0,lightX,lightY,radius);
        glow.addColorStop(0,`rgba(${rgb.join(',')},${Math.min(.65,.2*intensity)})`);glow.addColorStop(.55,`rgba(${rgb.join(',')},${Math.min(.25,.07*intensity)})`);glow.addColorStop(1,`rgba(${rgb.join(',')},0)`);
        ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    }
    function paintControlShadows(ctx,shadows,intensity){
        const shadowAlpha=value=>`rgba(0,4,8,${Math.min(.85,value*Math.max(1,intensity))})`;
        for(const shadow of shadows){
            ctx.globalAlpha=Math.min(1,shadow.weight??intensity);
            const travel=Math.hypot(shadow.sx,shadow.sy);
            if(travel>1){
                const start=.55,tip={...shadow,x:shadow.x+shadow.sx*start,y:shadow.y+shadow.sy*start,sx:shadow.sx*(1-start),sy:shadow.sy*(1-start)};
                drawSweptShadow(ctx,tip,Math.min(shadow.plug?2:8,1+travel*.24+(shadow.softness||0)*.4),shadowAlpha(shadow.plug?.035:.075));
            }
            drawSweptShadow(ctx,{...shadow,sx:0,sy:0},shadow.plug?1.1:shadow.slider?1.3:2.2,shadowAlpha(shadow.plug?.18:.28));
            const {x,y,sx,sy}=shadow,gradient=ctx.createLinearGradient(x,y,x+sx+.01,y+sy+.01);
            gradient.addColorStop(0,shadowAlpha(shadow.plug?.20:.4));
            gradient.addColorStop(1,shadowAlpha(shadow.plug?.055:.11));
            drawSweptShadow(ctx,shadow,0,gradient);
        }
        ctx.globalAlpha=1;
    }
    function drawSweptShadow(ctx,{x,y,sx,sy,width,height,knob},grow,fill){
        ctx.beginPath();ctx.fillStyle=fill;
        if(knob){
            ctx.lineCap='round';ctx.lineWidth=Math.max(width,height)+grow*2;
            ctx.moveTo(x,y);ctx.lineTo(x+sx,y+sy);ctx.strokeStyle=fill;ctx.stroke();
            return;
        }
        const halfW=width/2+grow,halfH=height/2+grow;
        const points=[];
        for(const [ox,oy] of [[0,0],[sx,sy]])for(const px of [-halfW,halfW])for(const py of [-halfH,halfH])points.push([x+ox+px,y+oy+py]);
        points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
        const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
        const lower=[],upper=[];
        for(const point of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),point)<=0)lower.pop();lower.push(point);}
        for(const point of points.reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),point)<=0)upper.pop();upper.push(point);}
        const hull=lower.slice(0,-1).concat(upper.slice(0,-1));
        hull.forEach(([px,py],index)=>index?ctx.lineTo(px,py):ctx.moveTo(px,py));
        ctx.closePath();ctx.fill();
    }
    function sync(dev){dev.syncHardwareDemo?.();dev.el.querySelectorAll('[data-hardware-knob],[data-hardware-linear]').forEach(paintKnob);}
    function inspector(root){root.dataset.hardwarePanel='';root.style.setProperty('--hw-ui-height',buttons.ui.height+'px');root.querySelectorAll('button').forEach(el=>skinButton(el,'ui'));root.querySelectorAll('input[type="range"]').forEach(slider);}
    // Temporary catalog instrument: uses the production controls and their identifiers.
    function demoMarkup(){
        const card=(id,body)=>`<div class="hardware-demo-card"><code>${id}</code><div class="hardware-demo-control">${body}</div><output data-demo-value="${id}"></output></div>`;
        const group=(name,body)=>`<section><h3>${name}</h3><div class="hardware-demo-grid">${body}</div></section>`;
        return '<div class="device-header"><span>MODELO · BIBLIOTECA DE CONTROLES</span></div><div class="hardware-demo-panel">'+
            group('Hardware.knobs',Object.keys(knobs).map(id=>card(id,`<button data-demo-knob="${id}" aria-label="Knob ${id}"></button>`)).join(''))+
            group('Hardware.buttons',Object.keys(buttons).map(id=>card(id,`<button data-demo-button="${id}" aria-label="Botão ${id}">●</button>`)).join(''))+
            group('Hardware.sliders',Object.keys(sliders).map(id=>card(id,`<input type="range" min="0" max="10" value="5" step="1" data-demo-slider="${id}" aria-label="Slider ${id}">`)).join(''))+
            group('Hardware.leds',Object.keys(leds).map(id=>card(id,`<button class="hardware-demo-led-button" data-demo-led="${id}" aria-label="Alternar LED ${id}"><i></i></button>`)).join(''))+
            group('Hardware.accents',Object.keys(accents).map(id=>card('accent-'+id,`<button data-demo-accent="${id}" aria-label="Escala ${id}"></button>`)).join(''))+'</div>';
    }
    function bindDemo(dev){
        const values=()=>dev.state.hardwareDemo||(dev.state.hardwareDemo={});
        const read=(id,fallback=5)=>values()[id]??fallback;
        const output=(id,value)=>{dev.el.querySelector(`[data-demo-value="${id}"]`).textContent=value;};
        const save=(id,value)=>{values()[id]=value;output(id,typeof value==='boolean'?(value?'ON':'OFF'):value+'/10');scheduleProjectSave();};
        dev.el.querySelectorAll('[data-demo-knob],[data-demo-accent]').forEach(el=>{
            const accent=el.dataset.demoAccent,id=accent?'accent-'+accent:el.dataset.demoKnob;
            const model=accent?'machined':id;
            bindKnob(el,{get:()=>read(id),set:value=>{save(id,value);el.style.setProperty('--knob-angle',(-135+value*27)+'deg');},min:0,max:10,step:1,model,format:value=>value+' de 10'});
        });
        dev.el.querySelectorAll('[data-demo-button]').forEach(el=>{
            const id=el.dataset.demoButton;skinButton(el,id);
            el.title=id+' · '+({momentary:'retorno ao soltar',latch:'tecla com trava',rocker:'interruptor basculante',slide:'interruptor deslizante'}[buttons[id].action]);
            el.addEventListener('click',()=>{if(buttons[id].action!=='momentary')save(id,!read(id,false));syncDemo(dev);});
        });
        dev.el.querySelectorAll('[data-demo-slider]').forEach(el=>{
            const id=el.dataset.demoSlider,spec=sliders[id];el.dataset.hardwareSlider=id;el.classList.add('hw-slider');el.style.setProperty('--hw-track',spec.track+'px');el.style.setProperty('--hw-thumb',spec.thumb+'px');if(spec.length)el.style.setProperty('--hw-slider-length',spec.length+'px');
            el.addEventListener('input',()=>save('slider-'+id,Number(el.value)));
            el.closest('.hardware-demo-card').querySelector('output').dataset.demoValue='slider-'+id;
        });
        dev.el.querySelectorAll('[data-demo-led]').forEach(el=>{
            const id=el.dataset.demoLed,spec=leds[id],light=el.querySelector('i');light.classList.add('hw-led');light.dataset.ledModel=id;light.style.setProperty('--hw-led-color',spec.color);light.style.setProperty('--hw-led-size',spec.size+'px');el.closest('.hardware-demo-card').querySelector('output').dataset.demoValue='led-'+id;
            el.addEventListener('click',()=>{save('led-'+id,!read('led-'+id,true));syncDemo(dev);});
        });
        dev.syncHardwareDemo=()=>syncDemo(dev);
    }
    function syncDemo(dev){
        const values=dev.state.hardwareDemo||{},read=(id,fallback)=>values[id]??fallback;
        dev.el.querySelectorAll('[data-demo-knob],[data-demo-accent]').forEach(el=>{const id=el.dataset.demoAccent?'accent-'+el.dataset.demoAccent:el.dataset.demoKnob,value=read(id,5);el.style.setProperty('--knob-angle',(-135+value*27)+'deg');dev.el.querySelector(`[data-demo-value="${id}"]`).textContent=value+'/10';paintKnob(el);});
        dev.el.querySelectorAll('[data-demo-button]').forEach(el=>{
            const id=el.dataset.demoButton,spec=buttons[id],momentary=spec.action==='momentary',on=momentary?el.classList.contains('hw-pressing'):read(id,false);
            el.classList.toggle('off',!on);el.classList.toggle('active',on);
            if(['rocker','slide'].includes(spec.action)){el.setAttribute('role','switch');el.setAttribute('aria-checked',String(on));el.removeAttribute('aria-pressed');}
            else {el.setAttribute('aria-pressed',String(on));el.removeAttribute('aria-checked');}
            dev.el.querySelector(`[data-demo-value="${id}"]`).textContent=momentary?(on?'PRESSIONADO':'SOLTO'):['slideSelector','slideSelectorModern'].includes(id)?(on?'PHONO':'LINE'):(on?'ON':'OFF');
        });
        dev.el.querySelectorAll('[data-demo-slider]').forEach(el=>{const id='slider-'+el.dataset.demoSlider;el.value=read(id,5);dev.el.querySelector(`[data-demo-value="${id}"]`).textContent=el.value+'/10';});
        dev.el.querySelectorAll('[data-demo-led]').forEach(el=>{const id='led-'+el.dataset.demoLed,on=read(id,true);setLed(el.querySelector('i'),on);el.setAttribute('aria-pressed',String(on));dev.el.querySelector(`[data-demo-value="${id}"]`).textContent=on?'ON':'OFF';});
    }
    function plugMarkup(type){
        const spec=plugs[type]||plugs.rca;
        if(spec.kind==='wire')return '<path d="M0 -2 9 -3M0 2 9 3" stroke="#d99b55" stroke-width="2" stroke-linecap="round"/><path d="M9 -3 20 -2" stroke="#d34848" stroke-width="3"/><path d="M9 3 20 2" stroke="#20252a" stroke-width="3"/>';
        if(spec.kind==='jack')return `<g transform="scale(${spec.scale})"><path d="M0 0 3 -2h12v4H3Z" fill="#ddbc77" stroke="#887044" stroke-width=".7"/><path d="M6 -2v4M11 -2v4" stroke="#20252a" stroke-width="1.1"/><rect x="15" y="-4" width="13" height="8" rx="2" fill="#363f45" stroke="#85949c" stroke-width="1"/><path d="M18 -3v6m3-6v6" stroke="#5d6c74"/></g>`;
        return `<path d="M0 0h7" stroke="#e2c283" stroke-width="2.5" stroke-linecap="round"/><rect x="5" y="-4" width="7" height="8" rx="1" fill="#bac2c5" stroke="#677780" stroke-width=".8"/><rect x="12" y="-5" width="13" height="10" rx="2" fill="#262e33" stroke="#788790" stroke-width=".8"/><rect x="14" y="-5" width="4" height="10" rx=".6" fill="${spec.color||'#cf4545'}"/>`;
    }
    return Object.freeze({knobs,buttons,controlSizes,setControlSize,buttonSounds,movementSounds,movementSound,sliders,leds,plugs,accents,sizes,physics,updateAccents,updateLightingDemo,sceneLightAt,demoMarkup,bindDemo,sourceTransport,setButtonLabel,button:skinButton,bindKnob,bindLinear,slider,setLed,layout,mount,sync,dispose,inspector,plugMarkup});
})();

        const state = {
            isPlaying: false,
            devices: {},
            connections: [],
            selectedDeviceId: null,
            selectedDeviceIds: new Set(),
            selectedConnection: null,
            audioCtx: null,
            masterGain: null,
            seqInterval: null,
            pairingId: null
        };

        const APP_PREFERENCES_KEY='audio-system-interface-preferences';
        function readAppPreferences(){try{const value=JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY)||'{}');return value&&typeof value==='object'?value:{};}catch{return {};}}
        const savedAppPreferences=readAppPreferences();
        let connectionGuidanceEnabled=savedAppPreferences.connectionGuidanceEnabled!==false;
        let appPreferencesSaveTimer=0;
        function scheduleAppPreferencesSave(){
            clearTimeout(appPreferencesSaveTimer);
            appPreferencesSaveTimer=setTimeout(()=>{
                if(!canvas.clientWidth||!canvas.clientHeight)return;
                const focusX=(canvas.clientWidth/2-view.x)/view.zoom,focusY=(canvas.clientHeight/2-view.y)/view.zoom;
                try{localStorage.setItem(APP_PREFERENCES_KEY,JSON.stringify({theme:state.canvasTheme,grid:state.canvasGrid,floor:state.canvasFloor,floorAuto:floorFollowsScene,backdrop:state.canvasBackdrop,time:state.canvasTime,connectionGuidanceEnabled,zoom:view.zoom,focusX,focusY}));}catch{}
            },450);
        }
        const appDialog=document.getElementById('app-confirm-dialog');
        function showAppDialog({title='Aviso',message='',acceptLabel='OK',cancelLabel='Cancelar',requireChoice=false}={}){
            return new Promise(resolve=>{
                const titleNode=appDialog.querySelector('#app-confirm-title'),messageNode=appDialog.querySelector('#app-confirm-message'),cancel=appDialog.querySelector('[data-dialog-cancel]'),accept=appDialog.querySelector('[data-dialog-accept]');
                titleNode.textContent=title;messageNode.textContent=message;accept.textContent=acceptLabel;cancel.textContent=cancelLabel;cancel.hidden=!requireChoice;accept.classList.toggle('is-danger',requireChoice&&/risco|dan/i.test(title));
                let settled=false;
                const finish=value=>{if(settled)return;settled=true;if(appDialog.open)appDialog.close();resolve(value);};
                accept.onclick=()=>finish(true);cancel.onclick=()=>finish(false);
                appDialog.oncancel=event=>{event.preventDefault();finish(false);};
                appDialog.onclose=()=>{if(!settled)finish(false);};
                appDialog.showModal();accept.focus();
            });
        }

        const canvas = document.getElementById('canvas');
        const world = document.getElementById('audio-world');
        const ROOM_SIDE_INSET=202;
        const ROOM_FLOOR_OVERLAP=180;
        const floorPlacementBottom=()=>Math.floor((world.offsetHeight-ROOM_FLOOR_OVERLAP)/Hardware.sizes.grid)*Hardware.sizes.grid;
        document.documentElement.classList.add('lighting-demo-enabled');
        const roomBackdrop=document.createElement('div');roomBackdrop.id='room-backdrop';roomBackdrop.setAttribute('aria-hidden','true');
        roomBackdrop.innerHTML=['far','mid','near'].map(layer=>`<img class="room-scene-image room-layer-${layer}" data-room-layer="${layer}" alt="" draggable="false">`).join('')+'<i class="room-depth-room"></i><i class="room-side-wall wall-left"></i><i class="room-side-wall wall-right"></i><i class="room-grid-overlay"></i>';
        const windowLayers=document.createElement('div');windowLayers.className='room-window-layers';
        roomBackdrop.appendChild(windowLayers);
        world.prepend(roomBackdrop);
        const floorShadows=document.createElement('canvas');floorShadows.className='room-floor-shadows';floorShadows.setAttribute('aria-hidden','true');
        world.insertBefore(floorShadows,document.getElementById('cables-layer'));
        canvas.appendChild(document.getElementById('connection-guidance'));
        const canvasThemes={light:'Claro',graphite:'Grafite',midnight:'Azul noturno',sepia:'Sépia',scene:'Cenário'};
        const canvasThemeControl=document.createElement('label');canvasThemeControl.className='canvas-theme-control';
        canvasThemeControl.innerHTML='<span>Fundo</span><select id="canvas-theme" aria-label="Cor do fundo do canvas">'+Object.entries(canvasThemes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        document.querySelector('.canvas-tools').appendChild(canvasThemeControl);
        function setCanvasTheme(theme){
            theme=Object.hasOwn(canvasThemes,theme)?theme:'scene';state.canvasTheme=theme;canvas.dataset.theme=theme;
            if(theme==='scene')Object.values(state.devices).forEach(dev=>{
                if(dev.type==='lightPoint')return;
                dev.el.style.left=Math.max(ROOM_SIDE_INSET,Math.min(world.offsetWidth-dev.el.offsetWidth-ROOM_SIDE_INSET,dev.el.offsetLeft))+'px';
                dev.el.style.top=Math.max(0,Math.min(canvas.dataset.floor==='none'?world.offsetHeight-dev.el.offsetHeight:floorPlacementBottom()-dev.el.offsetHeight,dev.el.offsetTop))+'px';
            });
            document.querySelector('.canvas-tools').dataset.theme=theme;
            document.getElementById('canvas-theme').value=theme;
            document.getElementById('canvas-floor')?.closest('label')?.toggleAttribute('hidden',theme!=='scene');
            document.getElementById('canvas-backdrop')?.closest('label')?.toggleAttribute('hidden',theme!=='scene');
            document.getElementById('canvas-time')?.closest('label')?.toggleAttribute('hidden',theme!=='scene');
            Hardware.updateLightingDemo();
        }
        document.getElementById('canvas-theme').addEventListener('change',event=>{setCanvasTheme(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        setCanvasTheme(savedAppPreferences.theme||'scene');
        const canvasGridModes={dots:'Pontos',lines:'Linhas',hidden:'Invisível'};
        const canvasGridControl=document.createElement('label');canvasGridControl.className='canvas-theme-control';
        canvasGridControl.innerHTML='<span>Grade</span><select id="canvas-grid" aria-label="Visual da grade">'+Object.entries(canvasGridModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        function setCanvasGrid(mode){
            mode=Object.hasOwn(canvasGridModes,mode)?mode:'dots';state.canvasGrid=mode;canvas.dataset.grid=mode;canvasGridControl.querySelector('select').value=mode;
        }
        canvasGridControl.querySelector('select').addEventListener('change',event=>{setCanvasGrid(event.target.value);scheduleProjectSave();scheduleAppPreferencesSave();});
        setCanvasGrid(savedAppPreferences.grid||'dots');
        const canvasFloorModes={wood:'Madeira',carpet:'Carpete',concrete:'Concreto',none:'Sem piso'};
        const canvasFloorControl=document.createElement('label');canvasFloorControl.className='canvas-theme-control';
        canvasFloorControl.innerHTML='<span>Piso</span><select id="canvas-floor" aria-label="Acabamento do piso">'+Object.entries(canvasFloorModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        let floorFollowsScene=savedAppPreferences.floorAuto===true||!savedAppPreferences.floor;
        function setCanvasFloor(mode){
            mode=Object.hasOwn(canvasFloorModes,mode)?mode:'wood';state.canvasFloor=mode;canvas.dataset.floor=mode;canvasFloorControl.querySelector('select').value=mode;
        }
        canvasFloorControl.querySelector('select').addEventListener('change',event=>{floorFollowsScene=false;setCanvasFloor(event.target.value);scheduleProjectSave();scheduleAppPreferencesSave();});
        setCanvasFloor(savedAppPreferences.floor||RoomScenes.scenes[savedAppPreferences.backdrop||'studio']?.floor||'wood');
        const canvasBackdropModes={studio:'Estúdio',listening:'Sala de audição',loft:'Loft'};
        const legacyBackdrops={library:'listening',night:'loft'};
        const canvasTimeModes={dawn:'Nascer do dia',dusk:'Fim de tarde',night:'Noite'};
        const canvasBackdropControl=document.createElement('label');canvasBackdropControl.className='canvas-theme-control';
        canvasBackdropControl.innerHTML='<span>Cenário</span><select id="canvas-backdrop" aria-label="Cenário de fundo">'+Object.entries(canvasBackdropModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        const canvasTimeControl=document.createElement('label');canvasTimeControl.className='canvas-theme-control';
        canvasTimeControl.innerHTML='<span>Hora do dia</span><select id="canvas-time" aria-label="Hora do dia">'+Object.entries(canvasTimeModes).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')+'</select>';
        const roomSceneCache=new Map();
        function setCanvasBackdrop(mode){
            mode=legacyBackdrops[mode]||mode;
            mode=Object.hasOwn(canvasBackdropModes,mode)?mode:'studio';state.canvasBackdrop=mode;canvas.dataset.backdrop=mode;canvasBackdropControl.querySelector('select').value=mode;
            roomBackdrop.querySelectorAll('[data-room-layer]').forEach(image=>{
                const layer=image.dataset.roomLayer,key=mode+':'+state.canvasTime+':'+layer;
                if(!roomSceneCache.has(key))roomSceneCache.set(key,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(RoomScenes.renderLayer(mode,layer,state.canvasTime)));
                const src=roomSceneCache.get(key);
                if(image.getAttribute('src')!==src)image.src=src;
            });
            if(windowLayers.dataset.scene!==mode||windowLayers.dataset.time!==state.canvasTime){
                windowLayers.className='room-window-layers room-window-'+mode;
                windowLayers.innerHTML=RoomScenes.windowPanes(mode,state.canvasTime);
                windowLayers.dataset.scene=mode;windowLayers.dataset.time=state.canvasTime;
            }
            if(floorFollowsScene)setCanvasFloor(RoomScenes.scenes[mode].floor);
            Hardware.updateLightingDemo();
        }
        function setCanvasTime(time){
            time=Object.hasOwn(canvasTimeModes,time)?time:'dusk';state.canvasTime=time;canvas.dataset.time=time;canvasTimeControl.querySelector('select').value=time;
            setCanvasBackdrop(state.canvasBackdrop||'studio');
        }
        canvasBackdropControl.querySelector('select').addEventListener('change',event=>{setCanvasBackdrop(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        canvasTimeControl.querySelector('select').addEventListener('change',event=>{setCanvasTime(event.target.value);updateCables();scheduleProjectSave();scheduleAppPreferencesSave();});
        state.canvasTime=Object.hasOwn(canvasTimeModes,savedAppPreferences.time)?savedAppPreferences.time:savedAppPreferences.backdrop==='night'?'night':'dusk';canvas.dataset.time=state.canvasTime;canvasTimeControl.querySelector('select').value=state.canvasTime;
        setCanvasBackdrop(savedAppPreferences.backdrop||'studio');
        setCanvasTheme(state.canvasTheme);


        const svgLayer = document.getElementById('cables-layer');
        const inspectorEmpty = document.getElementById('inspector-empty');
        const inspectorContent = document.getElementById('inspector-content');
        document.getElementById('inspector').classList.add('inspector-compact');
        const equipmentCatalog = document.getElementById('equipment-catalog');
        equipmentCatalog.querySelector('[data-template="hardwareDemo"]').insertAdjacentHTML('afterend','<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="lightPoint"><div><svg width="52" height="36" viewBox="0 0 52 36" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="26" cy="18" r="7"/><path d="M26 2v6m0 20v6M10 18h7m18 0h7M15 7l5 5m12 12 5 5M37 7l-5 5M20 24l-5 5"/></svg></div><span class="text-xs text-center text-gray-300">Ponto de luz · Teste</span></div>');
        const wheelScrollMotions=new WeakMap();
        function enableWheelMomentumScroll(element){
            if(!element)return;
            const motion={position:element.scrollTop,target:element.scrollTop,frame:0,lastTime:0};
            wheelScrollMotions.set(element,motion);
            element.classList.add('wheel-momentum-scroll');
            element.addEventListener('wheel',event=>{
                if(event.ctrlKey||event.deltaY===0)return;
                event.preventDefault();
                const unit=event.deltaMode===1?32:event.deltaMode===2?element.clientHeight:1;
                const delta=Math.max(-180,Math.min(180,event.deltaY*unit));
                const max=Math.max(0,element.scrollHeight-element.clientHeight);
                if(!motion.frame){motion.position=element.scrollTop;motion.target=motion.position;motion.lastTime=performance.now();}
                motion.target=Math.max(-240,Math.min(max+240,motion.target+delta));
                if(!motion.frame)motion.frame=requestAnimationFrame(step);
            },{passive:false});
            function step(now){
                const elapsed=Math.min(32,now-motion.lastTime||16);motion.lastTime=now;
                const max=Math.max(0,element.scrollHeight-element.clientHeight);
                if(matchMedia('(prefers-reduced-motion: reduce)').matches){
                    motion.position=Math.max(0,Math.min(max,motion.target));motion.target=motion.position;
                }else{
                    const amount=1-Math.pow(.78,elapsed/16.67);
                    motion.position+=(motion.target-motion.position)*amount;
                    if(motion.target<0)motion.target+=(0-motion.target)*amount*.72;
                    else if(motion.target>max)motion.target+=(max-motion.target)*amount*.72;
                }
                const bounded=Math.max(0,Math.min(max,motion.position));
                const over=motion.position-bounded;
                element.scrollTop=bounded;
                element.style.setProperty('--wheel-elastic-offset',`${Math.max(-32,Math.min(32,-over*.32))}px`);element.classList.toggle('wheel-elastic-active',Math.abs(over)>=.25);
                if(Math.abs(motion.target-bounded)<.25&&Math.abs(over)<.5){
                    motion.position=bounded;motion.target=bounded;motion.frame=0;element.style.setProperty('--wheel-elastic-offset','0px');element.classList.remove('wheel-elastic-active');return;
                }
                motion.frame=requestAnimationFrame(step);
            }
        }
        enableWheelMomentumScroll(equipmentCatalog.querySelector('.overflow-y-auto'));
        enableWheelMomentumScroll(document.getElementById('inspector-content'));
        enableWheelMomentumScroll(document.getElementById('inspector-empty'));
        const discardZone=document.createElement('div');
        discardZone.className='catalog-discard-zone';
        discardZone.setAttribute('aria-hidden','true');
        discardZone.innerHTML='<div class="catalog-discard-content"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 14h26M19 14V9h10v5M15 14l2 25h14l2-25M21 21v11m6-11v11"/></svg><strong>Arraste aqui para descartar</strong><p data-discard-caption>Solte nesta área para remover o equipamento e seus cabos.</p><p>Para manter, solte no canvas.<br>Esc cancela o arraste.</p></div>';
        equipmentCatalog.appendChild(discardZone);
        const clearCatalogFooter = document.createElement('div');
        clearCatalogFooter.className = 'p-4 border-t border-gray-800 shrink-0';
        clearCatalogFooter.innerHTML = '<button id="clear-system" type="button" class="w-full rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-900/40">Apagar tudo</button>';
        equipmentCatalog.appendChild(clearCatalogFooter);
        document.getElementById('clear-system').addEventListener('click', () => {
            Object.values(state.devices).forEach(dev => deleteDevice(dev));
            selectDevice(null);
            updateCableFlows();
        });
        const isOverCatalog = event => {
            const rect = equipmentCatalog.getBoundingClientRect();
            return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        };
        const cableVisibilityButton=document.createElement('button');
        cableVisibilityButton.type='button';cableVisibilityButton.className='cable-visibility-toggle';cableVisibilityButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';cableVisibilityButton.setAttribute('aria-label','Visibilidade dos cabos');cableVisibilityButton.dataset.tooltip='Mostrar ou ocultar os cabos';cableVisibilityButton.setAttribute('aria-pressed','false');
        document.querySelector('.canvas-tools').appendChild(cableVisibilityButton);
        cableVisibilityButton.addEventListener('click',()=>{
            if(state.hideCables||state.connections.some(c=>c.hidden)){
                state.hideCables=false;state.connections.forEach(c=>c.hidden=false);
            }else state.hideCables=!state.hideCables;
            cableVisibilityButton.setAttribute('aria-pressed',String(!!state.hideCables));
            updateCables();renderCableProperties();
        });
        const selectionMarquee = document.getElementById('selection-marquee');
        const selectionCount = document.getElementById('selection-count');
        const view = { x: 0, y: 0, zoom: Number.isFinite(savedAppPreferences.zoom)?savedAppPreferences.zoom:1 };
        const MIN_CANVAS_ZOOM = 0.175;
        const MAX_CANVAS_ZOOM = 2.5;
        const clampZoom = zoom => {
            const minimum = Math.max(MIN_CANVAS_ZOOM, canvas.clientWidth / Math.max(1, world.offsetWidth), canvas.clientHeight / Math.max(1, world.offsetHeight));
            return Math.max(minimum, Math.min(MAX_CANVAS_ZOOM, zoom));
        };
        view.zoom=clampZoom(view.zoom);
        view.y=Math.min(0,canvas.clientHeight-world.offsetHeight*view.zoom);
        const snapCoordinate = value => Math.round(value / Hardware.sizes.grid) * Hardware.sizes.grid;
        let viewAnimation=0;
        function stopViewMotion(){cancelAnimationFrame(viewAnimation);viewAnimation=0;}
        function animateViewTo(target){
            stopViewMotion();
            if(matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(view,target);applyView();return;}
            const start={...view},started=performance.now();
            const tick=now=>{
                const progress=matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.max(0,Math.min(1,(now-started)/280)),ease=1-(1-progress)**3;
                for(const key of ['x','y','zoom'])view[key]=start[key]+(target[key]-start[key])*ease;
                applyView();viewAnimation=progress<1?requestAnimationFrame(tick):0;
            };
            viewAnimation=requestAnimationFrame(tick);
        }
        function applyView() {
            view.zoom = clampZoom(view.zoom);
            view.x = Math.max(Math.min(0, canvas.clientWidth - world.offsetWidth * view.zoom), Math.min(0, view.x));
            view.y = Math.max(Math.min(0, canvas.clientHeight - world.offsetHeight * view.zoom), Math.min(0, view.y));
            world.style.setProperty('--canvas-zoom', view.zoom);
            world.style.setProperty('--canvas-inverse-zoom', 1 / view.zoom);
            const farX=Math.max(-90,Math.min(90,-view.x/view.zoom*.09)),farY=Math.max(-55,Math.min(55,-view.y/view.zoom*.06));
            const farScale=Math.max(.9,Math.min(1.08,1-(view.zoom-1)*.08));
            const floorScale=Math.max(.94,Math.min(1.04,1-(view.zoom-1)*.04));
            world.style.setProperty('--room-far-x',farX.toFixed(1)+'px');world.style.setProperty('--room-far-y',farY.toFixed(1)+'px');
            world.style.setProperty('--room-far-scale',farScale.toFixed(3));
            world.style.setProperty('--room-mid-x',(farX*.55).toFixed(1)+'px');world.style.setProperty('--room-mid-y',(farY*.55).toFixed(1)+'px');
            world.style.setProperty('--room-mid-scale',(1+(farScale-1)*.55).toFixed(3));
            world.style.setProperty('--room-near-x',(farX*.25).toFixed(1)+'px');world.style.setProperty('--room-near-y',(farY*.25).toFixed(1)+'px');
            world.style.setProperty('--room-near-scale',(1+(farScale-1)*.25).toFixed(3));
            world.style.setProperty('--room-window-far-x',(farX*.75).toFixed(1)+'px');world.style.setProperty('--room-window-far-y',(farY*.75).toFixed(1)+'px');
            world.style.setProperty('--room-window-mid-x',(farX*.3).toFixed(1)+'px');world.style.setProperty('--room-window-mid-y',(farY*.3).toFixed(1)+'px');
            world.style.setProperty('--floor-parallax-x',(farX*.28).toFixed(1)+'px');
            world.style.setProperty('--floor-parallax-scale',floorScale.toFixed(3));
            world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
            document.getElementById('zoom-label').textContent = `${Math.round(view.zoom * 100)}%`;
            updateCables();
            scheduleAppPreferencesSave();
        }
        new ResizeObserver(() => {stopViewMotion();applyView();}).observe(canvas);
        function screenToWorld(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            return { x: (clientX - rect.left - view.x) / view.zoom, y: (clientY - rect.top - view.y) / view.zoom };
        }
        function setZoomAt(nextZoom, clientX, clientY) {
            stopViewMotion();
            const rect = canvas.getBoundingClientRect();
            const px = clientX - rect.left, py = clientY - rect.top;
            const worldX = (px - view.x) / view.zoom, worldY = (py - view.y) / view.zoom;
            view.zoom = clampZoom(nextZoom);
            view.x = px - worldX * view.zoom;
            view.y = py - worldY * view.zoom;
            applyView();
        }
        document.getElementById('zoom-in').addEventListener('click', () => { const r = canvas.getBoundingClientRect(); setZoomAt(view.zoom * 1.15, r.left + r.width / 2, r.top + r.height / 2); });
        document.getElementById('zoom-out').addEventListener('click', () => { const r = canvas.getBoundingClientRect(); setZoomAt(view.zoom / 1.15, r.left + r.width / 2, r.top + r.height / 2); });
        canvas.addEventListener('wheel',e=>{
            e.preventDefault();
            const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?canvas.clientHeight:1);
            setZoomAt(view.zoom*Math.exp(-Math.max(-160,Math.min(160,pixels))*.001),e.clientX,e.clientY);
        },{passive:false});
        document.getElementById('fit-canvas').addEventListener('click', () => {
            const devices = Object.values(state.devices);
            if (!devices.length) { animateViewTo({zoom:1,x:0,y:0}); return; }
            const bounds = devices.reduce((b, dev) => {
                const left = parseFloat(dev.el.style.left) || 0, top = parseFloat(dev.el.style.top) || 0;
                return { left: Math.min(b.left, left), top: Math.min(b.top, top), right: Math.max(b.right, left + dev.el.offsetWidth), bottom: Math.max(b.bottom, top + dev.el.offsetHeight) };
            }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
            const rect = canvas.getBoundingClientRect(), pad = 48;
            const zoom=clampZoom(Math.min((rect.width-pad*2)/Math.max(1,bounds.right-bounds.left),(rect.height-pad*2)/Math.max(1,bounds.bottom-bounds.top)));
            animateViewTo({zoom,x:(rect.width-(bounds.right-bounds.left)*zoom)/2-bounds.left*zoom,y:(rect.height-(bounds.bottom-bounds.top)*zoom)/2-bounds.top*zoom});
        });

        const canvasTouches=new Map();let canvasPinch=null;
        function cancelPointerInteraction(event){
            const cancel=new PointerEvent('pointerup',{pointerId:event.pointerId||0,pointerType:'touch',clientX:event.clientX||0,clientY:event.clientY||0,button:0,buttons:0});
            Object.defineProperty(cancel,'cancelled',{value:true});window.dispatchEvent(cancel);
        }
        document.addEventListener('pointerdown',event=>{
            if(event.pointerType!=='touch')return;
            if(canvas.contains(event.target)&&!event.target.closest('.canvas-tools')){
                canvasTouches.set(event.pointerId,{x:event.clientX,y:event.clientY});
                if(canvasTouches.size===2){
                    cancelPointerInteraction(event);
                    const [a,b]=[...canvasTouches.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
                    canvasPinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),zoom:view.zoom,anchor:screenToWorld(cx,cy)};
                    event.preventDefault();event.stopImmediatePropagation();
                }
            }
            if(event.isPrimary===false){event.preventDefault();event.stopImmediatePropagation();}
        },{capture:true,passive:false});
        document.addEventListener('pointermove',event=>{
            if(event.pointerType!=='touch')return;
            if(canvasTouches.has(event.pointerId))canvasTouches.set(event.pointerId,{x:event.clientX,y:event.clientY});
            if(canvasPinch){
                if(canvasTouches.size>=2){
                    const [a,b]=[...canvasTouches.values()],rect=canvas.getBoundingClientRect();
                    view.zoom=clampZoom(canvasPinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/canvasPinch.distance);
                    view.x=(a.x+b.x)/2-rect.left-canvasPinch.anchor.x*view.zoom;
                    view.y=(a.y+b.y)/2-rect.top-canvasPinch.anchor.y*view.zoom;applyView();
                }
                event.preventDefault();event.stopImmediatePropagation();
            }else if(event.isPrimary===false)event.stopImmediatePropagation();
        },{capture:true,passive:false});
        document.addEventListener('pointerup',event=>{
            canvasTouches.delete(event.pointerId);
            if(canvasPinch){if(!canvasTouches.size)canvasPinch=null;event.stopImmediatePropagation();}
            else if(event.isPrimary===false)event.stopImmediatePropagation();
        },{capture:true});
        document.addEventListener('pointercancel',event=>{
            canvasTouches.delete(event.pointerId);
            cancelPointerInteraction(event);
            if(!canvasTouches.size)canvasPinch=null;
        },{capture:true});

        const touchMoveModeButton=document.getElementById('touch-move-mode');let touchMovementMode=false;
        document.documentElement.classList.toggle('has-touch-input',navigator.maxTouchPoints>0);
        touchMoveModeButton.addEventListener('click',()=>{touchMovementMode=!touchMovementMode;touchMoveModeButton.setAttribute('aria-pressed',String(touchMovementMode));touchMoveModeButton.dataset.tooltip=touchMovementMode?'Modo Touch ativo · toque e arraste para mover imediatamente':'Modo Touch desligado · segure brevemente um equipamento antes de arrastá-lo';});
        const mobileControls=document.createElement('div');mobileControls.className='mobile-panel-controls';
        mobileControls.innerHTML='<button type="button" data-mobile-panel="catalog" aria-label="Abrir painel de equipamentos" data-tooltip="Equipamentos" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg></button><button type="button" data-mobile-panel="properties" aria-label="Abrir painel de propriedades" data-tooltip="Propriedades" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="18" r="2"/></svg></button>';
        document.getElementById('app-topbar').lastElementChild.prepend(mobileControls);
        const compactLayout=matchMedia('(max-width:1000px), (hover:none) and (pointer:coarse) and (max-width:1400px)');
        function syncCompactViewport(){
            if(compactLayout.matches)document.body.style.setProperty('--compact-viewport-height',(window.visualViewport?.height||innerHeight)+'px');
            else document.body.style.removeProperty('--compact-viewport-height');
        }
        window.visualViewport?.addEventListener('resize',syncCompactViewport);window.addEventListener('resize',syncCompactViewport);syncCompactViewport();
        const mobileBackdrop=document.createElement('button');mobileBackdrop.type='button';mobileBackdrop.className='mobile-panel-backdrop';mobileBackdrop.hidden=true;mobileBackdrop.tabIndex=-1;mobileBackdrop.setAttribute('aria-label','Fechar painéis');document.body.appendChild(mobileBackdrop);
        const mobileCatalogClose=document.createElement('button');mobileCatalogClose.type='button';mobileCatalogClose.className='mobile-catalog-close';mobileCatalogClose.textContent='Fechar equipamentos ×';equipmentCatalog.prepend(mobileCatalogClose);
        function syncMobilePanels(){
            const catalogOpen=compactLayout.matches&&document.body.classList.contains('mobile-catalog-open'),propertiesOpen=compactLayout.matches&&document.body.classList.contains('mobile-properties-open');
            equipmentCatalog.inert=compactLayout.matches&&!catalogOpen;document.getElementById('inspector').inert=compactLayout.matches&&!propertiesOpen;
            mobileBackdrop.hidden=!(catalogOpen||propertiesOpen);
            mobileControls.querySelector('[data-mobile-panel="catalog"]').setAttribute('aria-expanded',String(catalogOpen));mobileControls.querySelector('[data-mobile-panel="properties"]').setAttribute('aria-expanded',String(propertiesOpen));
        }
        function closeMobilePanels(){document.body.classList.remove('mobile-catalog-open','mobile-properties-open');syncMobilePanels();}
        mobileBackdrop.addEventListener('click',()=>{const key=document.body.classList.contains('mobile-catalog-open')?'catalog':'properties';closeMobilePanels();mobileControls.querySelector(`[data-mobile-panel="${key}"]`).focus();});
        mobileCatalogClose.addEventListener('click',()=>{closeMobilePanels();mobileControls.querySelector('[data-mobile-panel="catalog"]').focus();});
        compactLayout.addEventListener('change',()=>{syncCompactViewport();if(!compactLayout.matches)closeMobilePanels();else syncMobilePanels();});
        mobileControls.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
            const className=button.dataset.mobilePanel==='catalog'?'mobile-catalog-open':'mobile-properties-open',open=document.body.classList.contains(className);
            closeMobilePanels();if(!open){document.querySelector('.app-settings')?.removeAttribute('open');document.body.classList.add(className);syncMobilePanels();(button.dataset.mobilePanel==='catalog'?mobileCatalogClose:mobileInspectorClose).focus({preventScroll:true});}
        }));
        canvas.addEventListener('pointerdown',()=>{stopViewMotion();closeMobilePanels();},{capture:true});
        const mobileInspectorClose=document.createElement('button');mobileInspectorClose.type='button';mobileInspectorClose.className='mobile-inspector-close';mobileInspectorClose.textContent='Ocultar propriedades →';mobileInspectorClose.setAttribute('aria-label','Ocultar menu da direita');
        mobileInspectorClose.addEventListener('click',()=>{closeMobilePanels();mobileControls.querySelector('[data-mobile-panel="properties"]').focus();});
        document.getElementById('inspector').prepend(mobileInspectorClose);
        mobileControls.querySelector('[data-mobile-panel="catalog"]').setAttribute('aria-controls','equipment-catalog');
        mobileControls.querySelector('[data-mobile-panel="properties"]').setAttribute('aria-controls','inspector');
        const sidebarToggles=[['catalog-sidebar-toggle','catalog-collapsed','catalog'],['inspector-sidebar-toggle','inspector-collapsed','properties']];
        sidebarToggles.forEach(([id,collapsedClass,key])=>document.getElementById(id).addEventListener('click',event=>{
            if(compactLayout.matches){closeMobilePanels();mobileControls.querySelector(`[data-mobile-panel="${key}"]`).focus();return;}
            const collapsed=document.body.classList.toggle(collapsedClass),button=event.currentTarget;
            button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',`${collapsed?'Expandir':'Recolher'} ${key==='catalog'?'equipamentos':'propriedades'}`);button.title=button.getAttribute('aria-label');button.textContent=key==='catalog'?(collapsed?'›':'‹'):(collapsed?'‹':'›');
            window.dispatchEvent(new Event('resize'));
        }));
        new MutationObserver(syncMobilePanels).observe(document.body,{attributes:true,attributeFilter:['class']});
        syncMobilePanels();
        document.addEventListener('click',event=>{if(compactLayout.matches&&event.target.closest('.app-settings>summary'))closeMobilePanels();});
        document.addEventListener('keydown',event=>{
            if(!compactLayout.matches||mobileBackdrop.hidden)return;
            const panel=document.body.classList.contains('mobile-catalog-open')?equipmentCatalog:document.getElementById('inspector');
            if(event.key==='Escape'){event.preventDefault();const key=panel===equipmentCatalog?'catalog':'properties';closeMobilePanels();mobileControls.querySelector(`[data-mobile-panel="${key}"]`).focus();}
            else if(event.key==='Tab'){
                const controls=[...panel.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.closest('[hidden]'));
                const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
            }
        });

        const touchHint=document.createElement('p');touchHint.className='touch-catalog-hint';touchHint.textContent='Toque no nome para adicionar. No canvas, toque em Mover para arrastar equipamentos sem interferir nos cabos; dois dedos movem a bancada e ajustam o zoom.';
        equipmentCatalog.querySelector(':scope > .p-4').appendChild(touchHint);

        function syncDeviceSelection() {
            Object.values(state.devices).forEach(dev => {
                dev.el.classList.toggle('selected', state.selectedDeviceIds.has(dev.id));
            });
            const count = state.selectedDeviceIds.size;
            selectionCount.textContent = count ? `${count} selecionado${count === 1 ? '' : 's'}` : '';
        }

        function setDeviceSelection(ids, focusId = null) {
            state.selectedDeviceIds = new Set([...ids].filter(id => state.devices[id]));
            const focus = focusId && state.selectedDeviceIds.has(focusId)
                ? focusId
                : [...state.selectedDeviceIds].at(-1) || null;
            selectDevice(focus, true);
        }

        function toggleDeviceSelection(id) {
            const next = new Set(state.selectedDeviceIds);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setDeviceSelection(next, next.has(id) ? id : null);
        }

        function devicesForCanvasAction(useSelection = true) {
            if (useSelection && state.selectedDeviceIds.size) {
                return [...state.selectedDeviceIds].map(id => state.devices[id]).filter(Boolean);
            }
            return Object.values(state.devices);
        }

        function centerDeviceSet(devices) {
            if (!devices.length) return;
            const bounds = devices.reduce((b, dev) => {
                const left = parseFloat(dev.el.style.left) || 0;
                const top = parseFloat(dev.el.style.top) || 0;
                return {
                    left: Math.min(b.left, left),
                    top: Math.min(b.top, top),
                    right: Math.max(b.right, left + dev.el.offsetWidth),
                    bottom: Math.max(b.bottom, top + dev.el.offsetHeight)
                };
            }, { left:Infinity, top:Infinity, right:-Infinity, bottom:-Infinity });
            const rect = canvas.getBoundingClientRect();
            const centerX = (bounds.left + bounds.right) / 2;
            const centerY = (bounds.top + bounds.bottom) / 2;
            animateViewTo({zoom:view.zoom,x:rect.width/2-centerX*view.zoom,y:rect.height/2-centerY*view.zoom});
        }

        function centerSelectedDevices() {
            centerDeviceSet(devicesForCanvasAction(true));
        }

        function organizeDevices() {
            const selected = state.selectedDeviceIds.size > 1;
            const devices = devicesForCanvasAction(selected);
            if (!devices.length) return;
            const order = ['turntable','turntableVintage','turntableLinear','cdPlayer','streamer','btReceiverA','btTransmitterPro','receiver','eqStudio','eqVintage','mixer','mixerVintage','crossover','crossoverVintage','rcaSwitch','speakerSwitch','speakerSwitchVintage','headphoneAmp','headphoneAmp4','powerAmp','spkPassiveWood','spkPassiveCarbon','spkPassiveGridBlack','spkPassiveGridOrange','spkActiveMonitor','spkActiveBookshelf','subwoofer','subwooferCube','subwooferPro','subwooferPassive','subwooferPassiveVintage','headphone','hpStudio','hpClassic'];
            const rank = new Map(order.map((type, index) => [type, index]));
            devices.sort((a, b) => (rank.get(a.type) ?? 99) - (rank.get(b.type) ?? 99) || (DEVICE_NAMES[a.type] || a.type).localeCompare(DEVICE_NAMES[b.type] || b.type));

            const columns = Math.min(4, Math.ceil(Math.sqrt(devices.length)));
            const rows = Math.ceil(devices.length / columns);
            const columnWidths = Array(columns).fill(0);
            const rowHeights = Array(rows).fill(0);
            devices.forEach((dev, index) => {
                const col = index % columns, row = Math.floor(index / columns);
                columnWidths[col] = Math.max(columnWidths[col], dev.el.offsetWidth);
                rowHeights[row] = Math.max(rowHeights[row], dev.el.offsetHeight);
            });
            const columnX = columnWidths.map((_, col) => 48 + columnWidths.slice(0, col).reduce((sum, width) => sum + width + 52, 0));
            const rowY = rowHeights.map((_, row) => 52 + rowHeights.slice(0, row).reduce((sum, height) => sum + height + 52, 0));
            devices.forEach((dev, index) => {
                const col = index % columns, row = Math.floor(index / columns);
                dev.el.style.left = `${Math.max(0, snapCoordinate(columnX[col]))}px`;
                dev.el.style.top = `${Math.max(0, snapCoordinate(rowY[row] + rowHeights[row]) - dev.el.offsetHeight)}px`;
            });
            updateCables();
            updateBluetoothLinks();
            centerDeviceSet(devices);
        }

        document.getElementById('center-devices').addEventListener('click', centerSelectedDevices);

        window.addEventListener('keydown', e => {
            if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
            const key = e.key.toLowerCase();
            if ((e.metaKey || e.ctrlKey) && key === 'a') {
                e.preventDefault();
                setDeviceSelection(Object.keys(state.devices), Object.keys(state.devices)[0] || null);
            } else if (key === 'escape') {
                selectCable(null);
                selectDevice(null);
            } else if (!e.metaKey && !e.ctrlKey && !e.altKey && key === 'o') {
                organizeDevices();
            } else if (!e.metaKey && !e.ctrlKey && !e.altKey && key === 'c') {
                centerSelectedDevices();
            }
        });

        canvas.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            if (e.target.closest('.device-node, .canvas-tools, button, path')) return;
            e.preventDefault();
            if (e.shiftKey) {
                const rect = canvas.getBoundingClientRect();
                const startX = e.clientX, startY = e.clientY;
                let moved = false;
                selectionMarquee.style.display = 'block';
                const move = ev => {
                    const left = Math.min(startX, ev.clientX) - rect.left;
                    const top = Math.min(startY, ev.clientY) - rect.top;
                    const width = Math.abs(ev.clientX - startX);
                    const height = Math.abs(ev.clientY - startY);
                    moved = width > 3 || height > 3 || moved;
                    Object.assign(selectionMarquee.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` });
                };
                const up = () => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    const box = selectionMarquee.getBoundingClientRect();
                    selectionMarquee.style.display = 'none';
                    if (!moved) return;
                    const next = new Set(state.selectedDeviceIds);
                    Object.values(state.devices).forEach(dev => {
                        const deviceRect = dev.el.getBoundingClientRect();
                        const intersects = deviceRect.left <= box.right && deviceRect.right >= box.left && deviceRect.top <= box.bottom && deviceRect.bottom >= box.top;
                        if (intersects) next.add(dev.id);
                    });
                    setDeviceSelection(next);
                };
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
                return;
            }
            const startX = e.clientX, startY = e.clientY, startViewX = view.x, startViewY = view.y;
            let moved = false;
            const move = ev => {
                moved = Math.hypot(ev.clientX - startX, ev.clientY - startY) > 3 || moved;
                if (!moved) return;
                canvas.classList.add('panning');
                view.x = startViewX + ev.clientX - startX;
                view.y = startViewY + ev.clientY - startY;
                applyView();
            };
            const up = () => {
                canvas.classList.remove('panning');
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
                if (!moved) { selectCable(null); selectDevice(null); }
            };
            window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
        });

        const DEVICE_NAMES = {
            furnitureRack:'Rack de Áudio', furnitureRackTall:'Rack com Vãos Altos', furnitureRackSix:'Rack com 6 Prateleiras', furnitureRackSixTall:'Rack com Vãos Altos · 6 Prateleiras', furnitureTable:'Mesa de Áudio', furnitureNiche:'Nicho de Áudio', pendantLamp:'Luminária pendente', acousticHorizontal:'Painel Acústico Horizontal', acousticVertical:'Painel Acústico Vertical',
            adapterRcaP2:'Adaptador RCA → P2', adapterP2Rca:'Adaptador P2 → RCA', adapterP10P2:'Adaptador P10 → P2', adapterP2P10:'Adaptador P2 → P10', adapterRcaP10:'Adaptador RCA → P10', adapterP10Rca:'Adaptador P10 → RCA', phonoConverter:'Conversor Phono → Linha', speakerConverter:'Conversor Amplificado → Linha',
            turntable: 'Toca-discos', turntableVintage: 'Toca-discos Vintage', turntableLinear:'Toca-discos Tangencial',
            hardwareDemo:'Modelo · Controles',lightPoint:'Ponto de luz · Teste',signalGeneratorVintage:'Gerador de Sinais Vintage', signalGenerator:'Gerador de Sinais', cdPlayer: 'CD Player', tapeDeck:'Tape Deck de Rolo', preamp:'Pré · Slim',preReference:'Pré · Visor Verde',preControl:'Pré · Controle 2.1',preDisplay:'Pré · Tela Central', benchMeter:'Medidor de Bancada', benchMeterVintage:'Medidor de Bancada Vintage',
            streamer: 'Streamer Hi-Fi',streamIntegrated:'Streamer Integrado',
            receiver: 'Receiver Vintage',powerValve:'Potência · Valvulado',powerDual:'Potência · Duplo Canal',powerBias:'Potência · Visor Circular',
            integratedBlue:'Integrado · Visores Azuis',integratedMinimal:'Integrado · Minimalista',integratedSilver:'Integrado · Prateado',
            integratedUtility:'Integrado · Essencial',prePrecision:'Pré · Precisão',
            preGlass:'Pré · Vidro Clássico',
            headphoneAmp: 'Amplificador de Fone Vintage', headphoneAmpModern: 'Amplificador de Fone Normal',
            headphoneAmp4: 'Amplificador de Fones 4 Canais',
            rcaSwitch: 'Seletor RCA Estéreo', rcaSwitchVintage: 'Seletor RCA Vintage',
            rcaMatrix: 'Seletor RCA 3×4', rcaMatrixVintage: 'Seletor RCA 3×4 Vintage',
            mixer: 'Mixer 3 Canais', mixerVintage: 'Mixer Vintage',
            subwooferPassive: 'Subwoofer Passivo', subwooferPassiveVintage: 'Subwoofer Passivo Vintage',
            speakerSwitch: 'Seletor de Caixas A/B', speakerSwitchVintage: 'Seletor de Caixas A/B Vintage',
            crossover: 'Crossover 3 Vias', crossoverVintage: 'Crossover Vintage',
            powerAmp: 'Receiver Moderno', powerStereo: 'Amplificador de Potência Tradicional', powerVintage: 'Amplificador de Potência Vintage',
            speaker: 'Caixa Passiva',
            shelfCoax:'Bookshelf · Coaxial',shelfWood:'Bookshelf · Madeira',shelfTop:'Bookshelf · Tweeter Superior',spkPassiveWood: 'Caixa Passiva Vintage',floorDiamond:'Caixa de Piso · Tweeter Superior',floorCoax:'Caixa de Piso · Coaxial',floorFlax:'Caixa de Piso · Cones Naturais',
            spkPassiveCarbon: 'Caixa Passiva Moderna',
            spkPassiveGridBlack: 'Caixa Passiva · 3 Vias Preta',
            spkPassiveGridOrange: 'Caixa Passiva · 3 Vias Laranja',
            spkActiveMonitor: 'Caixa Ativa Vintage',
            spkActiveRounded:'Caixa Ativa · Precisão',spkActiveBookshelf: 'Caixa Ativa Moderna', spkActiveCompact:'Caixa Ativa Compacta',
            subwoofer: 'Subwoofer Ativo',
            subwooferCube: 'Subwoofer Cubo 10"',
            subwooferPro: 'Subwoofer Pro 12"',
            headphone: 'Fones Over-Ear',
            hpStudio: 'Fone Over-Ear Studio',
            hpClassic: 'Fone Vinyl Classic',
            hpKubaDisco2: 'Kuba Disco 2',
            hpOpenRing:'Fone Aberto · Anelar',hpOpenDome:'Fone Aberto · Cúpula',hpPlanar:'Fone Planar',hpMonitor:'Fone Monitor',hpMax:'Fone Max',
            eqStudio: 'Equalizador Studio',
            eqVintage: 'Equalizador Vintage',
            btReceiverA: 'Receptor Bluetooth Slim (Bluetooth → RCA)',
            btTransmitterPro: 'Transmissor Bluetooth Pro (RCA → fones)'
        };

        const DEVICE_FAMILIES = {
            streamIntegrated:'modern',
            integratedUtility:'vintage',prePrecision:'studio',
            preGlass:'vintage',
            turntableLinear:'vintage',
            hpMonitor:'modern',hpMax:'modern',
            signalGeneratorVintage:'vintage',benchMeterVintage:'vintage',benchMeter:'modern',
            headphoneAmpModern: 'modern',
            rcaMatrix: 'modern', rcaMatrixVintage: 'vintage',
            rcaSwitchVintage: 'vintage',
            powerStereo: 'studio', powerVintage: 'vintage',
            turntableVintage: 'vintage', turntable: 'studio', cdPlayer: 'studio', eqVintage: 'vintage', spkPassiveWood: 'vintage', spkPassiveGridOrange: 'vintage', spkActiveMonitor: 'vintage', hpClassic: 'vintage', headphoneAmp: 'vintage',
            eqStudio: 'studio', powerAmp: 'studio', spkPassiveCarbon: 'modern', spkPassiveGridBlack: 'vintage', subwooferPro: 'modern', hpStudio: 'studio',
            receiver: 'vintage',
            mixer: 'studio', mixerVintage: 'vintage', subwooferPassive: 'modern', subwooferPassiveVintage: 'vintage',
            speakerSwitch: 'modern', speakerSwitchVintage: 'vintage', crossover: 'studio', crossoverVintage: 'vintage',
            spkActiveRounded:'studio',streamer: 'modern', btReceiverA: 'modern', btTransmitterPro: 'studio', rcaSwitch: 'modern', headphoneAmp4: 'studio', spkActiveBookshelf: 'modern', subwoofer: 'modern', subwooferCube: 'modern', headphone: 'modern',
            speaker: 'vintage'
        };

        const FURNITURE_TYPES = {
            furnitureRack:{width:840,height:720,surfaces:[0,210,420,630],inset:20,rack:true,back:true,description:'Vãos de 194 px para acomodar equipamentos baixos e médios.'},
            furnitureRackTall:{width:840,height:840,surfaces:[0,260,520,780],inset:20,rack:true,back:true,description:'Use os vãos mais altos para acomodar equipamentos maiores ou empilhados.'},
            furnitureRackSix:{width:840,height:1120,surfaces:[0,210,420,630,840,1050],inset:20,rack:true,back:true,description:'Seis vãos de 194 px para equipamentos baixos e médios.'},
            furnitureRackSixTall:{width:840,height:1370,surfaces:[0,260,520,780,1040,1300],inset:20,rack:true,back:true,description:'Seis vãos de 244 px para acomodar equipamentos médios e altos.'},
            furnitureTable:{width:1680,height:760,surfaces:[0],inset:20,description:'Apoie os equipamentos sobre o tampo. Arraste a mesa pelo tampo ou pelos pés.'},
            acousticHorizontal:{width:Hardware.sizes.widths.full,height:Hardware.sizes.widths.full,surfaces:[],inset:0,acoustic:'horizontal',description:'Espuma acústica grafite com frisos horizontais. Painel quadrado com a largura padrão dos equipamentos.'},
            acousticVertical:{width:Hardware.sizes.widths.full,height:Hardware.sizes.widths.full,surfaces:[],inset:0,acoustic:'vertical',description:'Espuma acústica grafite com frisos verticais. Painel quadrado com a largura padrão dos equipamentos.'},
            furnitureNiche:{width:840,height:280,surfaces:[0,260],inset:20,back:true,description:'Acomode um equipamento dentro do nicho ou sobre ele.'}
        };
        const FURNITURE_MATERIALS = {metal:'Metal',black:'Preto',lightWood:'Madeira clara',darkWood:'Madeira escura'};
        function acousticTile(orientation){
            return `<span class="acoustic-foam foam-${orientation}" aria-hidden="true"></span>`;
        }
        function benchAcousticMarkup(){
            return Array.from({length:32},(_,i)=>acousticTile((Math.floor(i/8)+i%8)%2?'horizontal':'vertical')).join('');
        }
        function furnitureMarkup(type){
            const config=FURNITURE_TYPES[type];
            const part=(name,x,y,width,height)=>`<div class="furniture-part ${name}" style="left:${x}px;top:${y}px;width:${width}px;height:${height}px"></div>`;
            let parts='';
            if(config.acoustic){
                parts=`<div class="acoustic-panel">${acousticTile(config.acoustic)}</div>`;
            }else if(type==='furnitureTable'){
                parts=part('furniture-top',0,0,config.width,28)+part('furniture-leg',60,28,40,config.height-28)+part('furniture-leg',config.width-100,28,40,config.height-28)+part('furniture-brace',100,80,config.width-200,20);
            }else if(config.rack){
                const bodyHeight=config.surfaces.at(-1)+16;
                parts=config.surfaces.map(y=>part('furniture-shelf',20,y,config.width-40,16)).join('')+part('furniture-leg',28,bodyHeight,20,44)+part('furniture-leg',config.width-48,bodyHeight,20,44)+part('furniture-side',0,0,20,bodyHeight)+part('furniture-side',config.width-20,0,20,bodyHeight);
            }else{
                parts=part('furniture-side',0,0,20,280)+part('furniture-side',820,0,20,280)+part('furniture-top',0,0,840,20)+part('furniture-shelf',0,260,840,20);
            }
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><div class="furniture-body ${config.back?'rack-body':''} ${config.rack?'furniture-rack':''}" style="width:${config.width}px;height:${config.height}px;--back-top:${config.rack?16:20}px;--back-bottom:${config.rack?60:20}px">${parts}</div>`;
        }
        const BENCH_SURFACES={wood:'Madeira',felt:'Feltro',studio:'Estúdio'};
        const BENCH_DECORATIONS={records:'Discos',covers:'Capas',cds:'CDs',lamp:'Luminária'};
        const BENCH_DECORATION_ASSETS={records:'vinyl-record',covers:'record-sleeves',cds:'compact-discs',lamp:'desk-lamp'};
        function updateBenchAppearance(dev){
            if(dev.type!=='furnitureTable')return;
            const settings=dev.state;
            settings.benchSurface=Object.hasOwn(BENCH_SURFACES,settings.benchSurface)?settings.benchSurface:'wood';
            settings.benchBackdrop=settings.benchBackdrop===true;
            settings.benchDecorations=Array.isArray(settings.benchDecorations)?Object.keys(BENCH_DECORATIONS).filter(key=>settings.benchDecorations.includes(key)):[];
            dev.el.dataset.benchSurface=settings.benchSurface;
            dev.el.dataset.benchBackdrop=String(settings.benchBackdrop);
            dev.el.querySelector('.bench-scene')?.remove();
            const scene=document.createElement('div');scene.className='bench-scene';scene.setAttribute('aria-hidden','true');
            scene.innerHTML='<div class="bench-backdrop">'+benchAcousticMarkup()+'</div>'+settings.benchDecorations.map(key=>`<img class="bench-decoration bench-decoration-${key}" src="./assets/decorations/${BENCH_DECORATION_ASSETS[key]}.svg" alt="" draggable="false">`).join('');
            dev.el.querySelector('.furniture-body').prepend(scene);
            Hardware.updateLightingDemo();
        }
        const STACK_FEET=Object.freeze({width:22,height:20,insetRatio:.1});
        const maxEquipmentBottom=()=>canvas.dataset.theme==='scene'&&canvas.dataset.floor!=='none'?floorPlacementBottom():world.offsetHeight;
        const sceneSideInset=()=>canvas.dataset.theme==='scene'?ROOM_SIDE_INSET:0;
        function snapOnEquipment(dev,x,y){
            if(FURNITURE_TYPES[dev.type])return{x,y};
            const width=dev.el.offsetWidth,height=dev.el.offsetHeight;
            let best=null;
            // All three chassis heights leave the same physical space for their feet.
            if(!best&&dev.el.dataset.chassis){
                Object.values(state.devices).forEach(lower=>{
                    if(lower===dev||!lower.el.dataset.chassis)return;
                    const lx=parseFloat(lower.el.style.left)||0,ly=parseFloat(lower.el.style.top)||0;
                    const overlap=Math.min(x+width,lx+lower.el.offsetWidth)-Math.max(x,lx);
                    let targetY=ly-height-STACK_FEET.height;
                    // All chassis use the same bottom-edge grid, including mixed-height stacks.
                    // Keep the invariant even for older projects with positions between grid lines.
                    targetY=snapCoordinate(targetY+height)-height;
                    const distance=Math.abs(y-targetY);
                    if(targetY>=0&&overlap>=Math.min(width,lower.el.offsetWidth)*.7&&distance<=14/view.zoom&&(!best||distance<best.distance))best={distance,x,y:targetY};
                });
            }
            return best||{x,y};
        }

        function placementShapes(dev, x, y) {
            if(dev.type==='lightPoint')return [];
            if (FURNITURE_TYPES[dev.type]) return [...dev.el.querySelectorAll('.furniture-part')].map(part => ({
                x:x + part.offsetLeft, y:y + part.offsetTop, width:part.offsetWidth, height:part.offsetHeight
            }));
            return [{x,y,width:dev.el.offsetWidth,height:dev.el.offsetHeight}];
        }
        function canPlaceEquipment(dev, x, y, ignored = new Set()) {
            const inset=dev.type==='lightPoint'?0:sceneSideInset();
            if (x < inset || y < 0 || x + dev.el.offsetWidth > world.offsetWidth-inset || y + dev.el.offsetHeight > maxEquipmentBottom()) return false;
            const shapes = placementShapes(dev,x,y);
            return !Object.values(state.devices).some(other => {
                if (other.id === dev.id || ignored.has(other.id)) return false;
                const obstacles = placementShapes(other,parseFloat(other.el.style.left)||0,parseFloat(other.el.style.top)||0);
                return shapes.some(a => obstacles.some(b => a.x < b.x+b.width-.5 && a.x+a.width > b.x+.5 && a.y < b.y+b.height-.5 && a.y+a.height > b.y+.5));
            });
        }
        function findFreePlacement(dev,x,y) {
            const start = snapOnEquipment(dev,Math.max(0,snapCoordinate(x)),Math.max(0,snapCoordinate(y+dev.el.offsetHeight)-dev.el.offsetHeight));
            if (canPlaceEquipment(dev,start.x,start.y)) return start;
            for (let radius=20;radius<=Math.max(world.offsetWidth,world.offsetHeight);radius+=20) {
                for (let offset=-radius;offset<=radius;offset+=20) {
                    for (const [dx,dy] of [[offset,-radius],[offset,radius],[-radius,offset],[radius,offset]]) {
                        const next={x:start.x+dx,y:start.y+dy};
                        if (canPlaceEquipment(dev,next.x,next.y)) return next;
                    }
                }
            }
            return null;
        }

        function settleEquipmentDrop(targets,ignored,fallback) {
            const obstacles=Object.values(state.devices).filter(dev=>!ignored.has(dev.id)).flatMap(dev=>placementShapes(dev,parseFloat(dev.el.style.left)||0,parseFloat(dev.el.style.top)||0));
            const shapes=targets.map(p=>({p,parts:placementShapes(p.dev,0,0)}));
            const fits=(dx,dy)=>shapes.every(({p,parts})=>{
                const x=p.x+dx,y=p.y+dy;
                const inset=p.dev.type==='lightPoint'?0:sceneSideInset();
                if(x<inset||y<0||x+p.dev.el.offsetWidth>world.offsetWidth-inset||y+p.dev.el.offsetHeight>(p.dev.type==='lightPoint'?world.offsetHeight:maxEquipmentBottom()))return false;
                return parts.every(a=>!obstacles.some(b=>x+a.x<b.x+b.width-.5&&x+a.x+a.width>b.x+.5&&y+a.y<b.y+b.height-.5&&y+a.y+a.height>b.y+.5));
            });
            if(fits(0,0))return targets;
            let best=null;
            const limit=Math.ceil(Math.max(world.offsetWidth,world.offsetHeight)/20);
            for(let ring=1;ring<=limit;ring++){
                if(best&&ring*20>Math.sqrt(best.distance))break;
                const offsets=[];
                for(let step=-ring;step<=ring;step++){
                    offsets.push([step*20,-ring*20],[step*20,ring*20]);
                    if(Math.abs(step)!==ring)offsets.push([-ring*20,step*20],[ring*20,step*20]);
                }
                offsets.sort((a,b)=>(a[0]**2+a[1]**2)-(b[0]**2+b[1]**2));
                for(const [dx,dy] of offsets){
                    const distance=dx*dx+dy*dy;
                    if(best&&distance>=best.distance)continue;
                    if(fits(dx,dy)){best={dx,dy,distance};break;}
                }
            }
            return best?targets.map(p=>({...p,x:p.x+best.dx,y:p.y+best.dy})):fallback;
        }

        // Supports live outside device boxes so they do not alter grid alignment.
        let deployedFootSupports=new Map();
        function updateStackFeet() {
            let layer = document.getElementById('stack-feet');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'stack-feet';
                layer.setAttribute('aria-hidden', 'true');
                layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;';
                world.appendChild(layer);
            }
            // Above furniture backs (1–2), always below equipment chassis (10+).
            layer.style.zIndex = '3';
            const boxes = Object.values(state.devices).map(dev => ({
                dev, x:parseFloat(dev.el.style.left)||0, y:parseFloat(dev.el.style.top)||0,
                width:dev.el.offsetWidth, height:dev.el.offsetHeight
            }));
            const equipment = boxes.filter(b => !FURNITURE_TYPES[b.dev.type] && b.width >= 300 && (b.height < b.width * .8 || b.dev.type==='tapeDeck'));
            const retainedFeet=new Set();
            const reducedFeetMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
            const nextSupports=new Map();
            equipment.forEach(upper => {
                const turntable=TURNTABLE_TYPES.has(upper.dev.type);
                if(turntable)upper.dev.el.classList.remove('turntable-stacked');
                const bottom = upper.y + upper.height;
                const shelfSupports=boxes.flatMap(f=>{
                    const config=FURNITURE_TYPES[f.dev.type];
                    if(!config||upper.x<f.x+config.inset-1||upper.x+upper.width>f.x+config.width-config.inset+1)return [];
                    return config.surfaces.map(surface=>({dev:f.dev,y:f.y+surface}));
                });
                const equipmentSupports=equipment.filter(lower=>{
                    const overlap=Math.min(upper.x+upper.width,lower.x+lower.width)-Math.max(upper.x,lower.x);
                    return lower!==upper&&overlap>=Math.min(upper.width,lower.width)*.7;
                });
                const support=[...shelfSupports,...equipmentSupports].filter(base=>base.y>=bottom&&base.y-bottom<=STACK_FEET.height).sort((a,b)=>a.y-b.y)[0];
                if(!support)return;
                const gap=support.y-bottom;
                if(gap<=.5){
                    // Contact leaves no exposed support: remove immediately, without a retracting foot.
                    layer.querySelectorAll('.auto-stack-foot').forEach(foot=>{if(foot.dataset.footOwner===upper.dev.id){foot.getAnimations().forEach(animation=>animation.cancel());foot.remove();}});
                    return;
                }
                nextSupports.set(upper.dev.id,support.dev.id);
                const newlyDeployed=deployedFootSupports.get(upper.dev.id)!==support.dev.id;
                if(newlyDeployed)playUiSound('feet');
                if(turntable)upper.dev.el.classList.add('turntable-stacked');
                // Turntables retain the original feet in their layout when hidden.
                // Start the replacement feet at the cabinet, not below that reserved space.
                const plinth=turntable?upper.dev.el.querySelector('.at-plinth'):null;
                const footTop=plinth?upper.y+plinth.offsetTop+plinth.offsetHeight:bottom;
                const left=upper.x, right=upper.x+upper.width;
                const inset = Math.max(16, (right - left) * STACK_FEET.insetRatio), width = STACK_FEET.width;
                const footHeight=support.y-footTop;
                [left + inset, right - inset - width].forEach((x,index) => {
                    const key=upper.dev.id+':'+index;
                    let foot=[...layer.querySelectorAll('.auto-stack-foot')].find(el=>el.dataset.footKey===key);
                    const entering=!foot||foot.dataset.retracting==='true';
                    if(!foot){foot=document.createElement('span');foot.className='auto-stack-foot';foot.setAttribute('aria-hidden','true');foot.dataset.footKey=key;foot.dataset.footOwner=upper.dev.id;layer.appendChild(foot);}
                    if(foot.dataset.retracting==='true'){foot.getAnimations().forEach(animation=>animation.cancel());delete foot.dataset.retracting;}
                    retainedFeet.add(foot);
                    foot.dataset.offsetX=String(x-upper.x);foot.dataset.offsetY=String(footTop-upper.y);
                    foot.style.cssText = `position:absolute;display:block;pointer-events:none;margin:0;padding:0;min-width:0;min-height:0;flex:none;visibility:${upper.dev.el.style.visibility==='hidden'?'hidden':'visible'};left:${x}px;top:${footTop}px;width:${width}px;height:${footHeight}px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,#131617,#454b4e 45%,#181b1d);border-bottom:3px solid #111;box-sizing:border-box;box-shadow:0 2px 2px #0003;`;
                    foot.style.transformOrigin='50% 0';
                    if(entering&&!reducedFeetMotion){
                        foot.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)',offset:.65},{transform:'scaleY(.94)',offset:.82},{transform:'scaleY(1)'}],{duration:240,easing:'ease-out'});
                    }
                });
            });
            [...layer.querySelectorAll('.auto-stack-foot')].forEach(foot=>{
                const owner=state.devices[foot.dataset.footOwner];
                if(!owner){foot.remove();return;}
                // Retracting feet keep following their owner, even while it is dragged away.
                foot.style.left=((parseFloat(owner.el.style.left)||0)+Number(foot.dataset.offsetX))+'px';
                foot.style.top=((parseFloat(owner.el.style.top)||0)+Number(foot.dataset.offsetY))+'px';
                foot.style.visibility=owner.el.style.visibility==='hidden'?'hidden':'visible';
                if(retainedFeet.has(foot)||foot.dataset.retracting==='true')return;
                if(reducedFeetMotion){foot.remove();return;}
                foot.dataset.retracting='true';foot.getAnimations().forEach(animation=>animation.cancel());
                const retract=foot.animate([{transform:'scaleY(1)'},{transform:'scaleY(.92)',offset:.25},{transform:'scaleY(0)'}],{duration:170,easing:'ease-in',fill:'forwards'});
                retract.onfinish=()=>{if(foot.dataset.retracting==='true')foot.remove();};
            });
            if([...deployedFootSupports.keys()].some(id=>state.devices[id]&&!nextSupports.has(id)))playUiSound('feetRetract');
            deployedFootSupports=nextSupports;
        }

        const INTERFACE_DEVICES = {
            adapterRcaP2:{name:'ADAPTADOR RCA → P2',input:'rca',output:'p2',passive:true,description:'Une RCA L/R em P2 TRS estéreo. Preserva os canais e o nível de linha, phono ou fones; não amplifica nem aplica RIAA.'},
            adapterP2Rca:{name:'ADAPTADOR P2 → RCA',input:'p2',output:'rca',passive:true,description:'Separa P2 TRS estéreo em RCA L/R, preservando os canais e o nível recebido. Uma saída de fones exige ajuste de volume ao alimentar linha.'},
            adapterP10P2:{name:'ADAPTADOR P10 → P2',input:'p10',output:'p2',passive:true,description:'Adapta P10 TRS estéreo para P2 TRS estéreo. Mantém L/R e o nível recebido; não transforma linha em sinal para fones.'},
            adapterP2P10:{name:'ADAPTADOR P2 → P10',input:'p2',output:'p10',passive:true,description:'Adapta P2 TRS estéreo para P10 TRS estéreo. Permite ligar a saída P2 de fones aos fones P10, sem alterar o sinal.'},
            adapterRcaP10:{name:'ADAPTADOR RCA → P10',input:'rca',output:'p10',passive:true,description:'Adapta RCA R/L para P10 TRS estéreo. Preserva linha, phono ou fones; não amplifica, não atenua e não aplica RIAA.'},
            adapterP10Rca:{name:'ADAPTADOR P10 → RCA',input:'p10',output:'rca',passive:true,description:'Adapta P10 TRS estéreo para RCA R/L. Preserva linha, phono ou fones; não converte o nível do sinal.'},
            phonoConverter:{name:'PHONO → LINHA',input:'rca',output:'rca',inputSignal:'phono',outputSignal:'line',description:'Pré de phono: aplica ganho e equalização RIAA ao sinal phono e entrega nível de linha por RCA R/L.'},
            speakerConverter:{name:'AMPLIFICADO → LINHA',input:'wire',output:'rca',inputSignal:'amplified',outputSignal:'line',description:'Conversor de nível alto para baixo: atenua uma saída SPEAKER amplificada para uma entrada de linha RCA. Não serve para saída de fones.'}
        };
        const TURNTABLE_TYPES = new Set(['turntable', 'turntableVintage','turntableLinear']);
        const BENCH_METER_TYPES=new Set(['benchMeter','benchMeterVintage']);
        const SIGNAL_GENERATOR_TYPES=new Set(['signalGenerator','signalGeneratorVintage']);
        const SOURCE_TYPES = new Set([...TURNTABLE_TYPES, 'cdPlayer', 'streamer','streamIntegrated', 'btReceiverA','tapeDeck','signalGenerator','signalGeneratorVintage']);
        const EQ_TYPES = new Set(['eqStudio', 'eqVintage']);
        const BT_RX_TYPES = new Set(['btReceiverA']);
        const BT_TX_TYPES = new Set(['btTransmitterPro']);
        const SUB_TYPES = new Set(['subwoofer', 'subwooferCube', 'subwooferPro']);
        const MIXER_TYPES = new Set(['mixer', 'mixerVintage']);
        const CROSSOVER_TYPES = new Set(['crossover', 'crossoverVintage']);
        const SPEAKER_SWITCH_TYPES = new Set(['speakerSwitch', 'speakerSwitchVintage']);
        const PASSIVE_SUB_TYPES = new Set(['subwooferPassive', 'subwooferPassiveVintage']);
        const MATRIX_TYPES = new Set(['rcaMatrix','rcaMatrixVintage']);
        const RCA_SWITCH_TYPES = new Set(['rcaSwitch', 'rcaSwitchVintage']);
        const SELECTOR_TYPES = new Set([...RCA_SWITCH_TYPES, ...SPEAKER_SWITCH_TYPES]);
        const BOOKSHELF_SPEAKERS={
            shelfCoax:{height:424,width:280,watts:100,ohms:8,finish:'coax',description:'Bookshelf passiva com frente curva e conjunto coaxial cobre. Médios e agudos equilibrados.'},
            shelfWood:{height:504,width:278,watts:200,ohms:6,finish:'wood',description:'Bookshelf passiva de duas vias com madeira envernizada, tweeter de domo macio e woofer escuro.'},
            shelfTop:{height:578,width:269,watts:120,ohms:8,finish:'top',description:'Bookshelf passiva com tweeter separado no topo e cone prateado. Agudos destacados.'}
        };
        const FLOOR_SPEAKERS={
            floorDiamond:{height:1040,cabinet:244,watts:200,ohms:8,finish:'diamond',description:'Caixa de piso passiva com gabinete curvo, tweeter separado, um médio e dois woofers. Impedância nominal de 8 Ω e amplificação recomendada até 200 W.'},
            floorCoax:{height:1240,cabinet:200,watts:300,ohms:4,finish:'coax',description:'Caixa de piso passiva com conjunto coaxial e quatro woofers em gabinete estreito. Impedância nominal de 4 Ω e amplificação recomendada até 300 W.'},
            floorFlax:{height:1120,cabinet:248,watts:300,ohms:8,finish:'flax',description:'Caixa de piso passiva com médio e três woofers em tom de linho, tweeter de domo invertido e base de vidro. Impedância nominal de 8 Ω e amplificação recomendada até 300 W.'}
        };
        const PASSIVE_SPK = new Set(['speaker', 'spkPassiveWood', 'spkPassiveCarbon', 'spkPassiveGridBlack', 'spkPassiveGridOrange',...Object.keys(FLOOR_SPEAKERS),...Object.keys(BOOKSHELF_SPEAKERS)]);
        const ACTIVE_SPK = new Set(['spkActiveRounded','spkActiveMonitor', 'spkActiveBookshelf','spkActiveCompact']);
        const REFERENCE_HEADPHONES={
            hpKubaDisco2:{ohms:32,enclosure:'Fechado',description:'Kuba Disco 2 com arco clássico de madeira laminada, almofadas XL costuradas e conchas com relevos concêntricos. Acabamentos Tauari, Nogueira e Ébano; conexão P2 no cabo.'},
            hpOpenRing:{ohms:300,description:'Fone aberto com conchas ovais, aros metálicos, grade vazada e arco com almofadas segmentadas. Suporte padrão e entrada P2 estéreo na ponta do cabo.'},
            hpOpenDome:{ohms:80,description:'Fone aberto com conchas arredondadas, grade em colmeia, hastes de carbono e faixa de suspensão. Suporte padrão e entrada P2 estéreo na ponta do cabo.'},
            hpPlanar:{ohms:20,description:'Fone planar aberto com conchas amplas, grades horizontais, hastes metálicas e arco acolchoado. Suporte padrão e entrada P2 estéreo na ponta do cabo.'}
        };
        const HP_TYPES = new Set(['headphone', 'hpStudio', 'hpClassic','hpMonitor','hpMax',...Object.keys(REFERENCE_HEADPHONES)]);
        const BT_HP_TYPES = new Set(['headphone','hpStudio','hpMax']);
        const KUBA_WOOD_FINISHES={tauari:'Tauari',walnut:'Nogueira',ebony:'Ébano'};
        function updateKubaAppearance(dev){
            if(dev.type!=='hpKubaDisco2')return;
            dev.state.kubaWood=Object.hasOwn(KUBA_WOOD_FINISHES,dev.state.kubaWood)?dev.state.kubaWood:'tauari';
            dev.el.dataset.kubaWood=dev.state.kubaWood;
        }

        const GRAPHIC_EQ_FREQUENCIES = [63,160,400,1000,2500,6300,16000];
        const EQ_BANDS = { eqStudio: GRAPHIC_EQ_FREQUENCIES, eqVintage: GRAPHIC_EQ_FREQUENCIES };

        function graphicEqMarkup(type) {
            const ports = (io) => `<div class="graphic-eq-ports"><div class="graphic-eq-pair"><div class="port" data-type="rca-r" data-io="${io}" data-node="${io}R" title="RCA ${io} · R"></div><div class="port" data-type="rca-l" data-io="${io}" data-node="${io}L" title="RCA ${io} · L"></div></div><span>RCA R/L ${io.toUpperCase()}</span><div class="port" data-type="p10" data-io="${io}" data-node="${io}Stereo" title="P10 TRS estéreo · ${io}"></div><span>P10 ${io.toUpperCase()}</span></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]} · 7 bandas</span></div><section class="graphic-eq-face"><i class="graphic-eq-handle handle-left" aria-hidden="true"></i><i class="graphic-eq-handle handle-right" aria-hidden="true"></i>${ports('in')}<div class="graphic-eq-bank">${GRAPHIC_EQ_FREQUENCIES.map((freq,i) => `<div class="graphic-eq-band"><input class="graphic-eq-fader eq-slider" type="range" min="-12" max="12" step="0.5" value="0" data-band="${i}" aria-label="${freq} Hz" title="${freq} Hz · 0 dB"><span aria-hidden="true">${freq>=1000?freq/1000+'k':freq}</span></div>`).join('')}</div>${ports('out')}<div class="graphic-eq-controls"><span class="graphic-eq-led"></span><input type="range" class="graphic-eq-level" min="0" max="1" step="0.01" value="1" aria-label="Nível de saída" title="Nível de saída"><span>LEVEL</span><div data-power-slot class="graphic-eq-power"><button class="power-btn" title="Ligar / desligar"></button></div></div></section>`;
        }

        function createEqFilters(freqs) {
            return freqs.map((freq, i) => {
                const filter = state.audioCtx.createBiquadFilter();
                if (i === 0) filter.type = 'lowshelf';
                else if (i === freqs.length - 1) filter.type = 'highshelf';
                else {
                    filter.type = 'peaking';
                    filter.Q.value = 1.05;
                }
                filter.frequency.value = freq;
                filter.gain.value = 0;
                return filter;
            });
        }

        function wireFilterChain(input, filters, output) {
            let node = input;
            filters.forEach(f => {
                node.connect(f);
                node = f;
            });
            node.connect(output);
        }

        function applyEqGains(dev) {
            (dev.eqFiltersR || []).forEach((f, i) => { f.gain.value = dev.state.eq[i] || 0; });
            (dev.eqFiltersL || []).forEach((f, i) => { f.gain.value = dev.state.eq[i] || 0; });
        }

        function updateKnobAngle(dev, selector, value, min, max) {
            const knob = dev.el.querySelector(selector);
            if (!knob) return;
            const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
            knob.style.setProperty('--knob-angle', `${-135 + ratio * 270}deg`);
        }

        function setHeadphoneAmp4Volume(dev, channel, value) {
            const clamped = Math.max(0, Math.min(1, value));
            dev.state.channelVolumes ||= [0.8, 0.8, 0.8, 0.8];
            dev.state.channelVolumes[channel] = clamped;
            if (dev.channelVolumes?.[channel]) dev.channelVolumes[channel].gain.value = clamped;
            const knob = dev.el.querySelector(`[data-channel-knob="${channel + 1}"]`);
            if (knob) knob.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
            updateKnobAngle(dev, `.amp4-channel:nth-child(${channel + 1}) .amp4-knob`, clamped, 0, 1);
            if (state.selectedDeviceId === dev.id) {
                const inspectorSlider = document.getElementById(`sl-amp4-${channel + 1}`);
                const inspectorLabel = document.getElementById(`lbl-amp4-${channel + 1}`);
                if (inspectorSlider) inspectorSlider.value = clamped;
                if (inspectorLabel) inspectorLabel.textContent = `${Math.round(clamped * 100)}%`;
            }
        }

        const LISTENING_PROFILES = {
            hpKubaDisco2:{label:'Disco 2 · escuta sem coloração adicional',bands:[0,0,0]},
            headphone:{label:'Moderno · graves presentes',bands:[3,-.5,.5]},
            hpStudio:{label:'Studio · graves definidos',bands:[2,0,1]},
            // Perceptual tonal approximations, not raw ear-simulator transfer curves or corrective EQ presets.
            hpOpenRing:{label:'Aberto anelar · graves contidos e brilho',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:12,Q:.70710678},{type:'lowshelf',frequency:65,gain:-3.5},{type:'peaking',frequency:2500,Q:.8,gain:-1.5},{type:'peaking',frequency:6000,Q:2,gain:4},{type:'highshelf',frequency:9000,gain:1.2}]},
            hpOpenDome:{label:'Aberto cúpula · médios presentes',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:10,Q:.70710678},{type:'lowshelf',frequency:100,gain:-2},{type:'peaking',frequency:1500,Q:1.2,gain:3.5},{type:'peaking',frequency:4000,Q:2,gain:1.2},{type:'peaking',frequency:6000,Q:2.5,gain:2}]},
            hpPlanar:{label:'Planar · extensão e presença suave',headroomDb:-8,curveMinDb:-12,filterSpecs:[{type:'highpass',frequency:5,Q:.70710678},{type:'peaking',frequency:4000,Q:1,gain:-3},{type:'peaking',frequency:7500,Q:1.5,gain:-1},{type:'highshelf',frequency:12000,gain:.5}]},
            hpMonitor:{label:'Monitor · corpo e presença',bands:[2.5,1.2,-.5]},
            hpMax:{label:'Max · graves e suavidade',bands:[3,.2,-.7]},
            hpClassic:{label:'Vintage · vozes e guitarras',bands:[.5,2.5,-1.5]},
            // Broad tonal approximations, not digitized measurements or complete acoustic models.
            shelfCoax:{label:'Bookshelf · resposta uniforme',highpass:79,headroomDb:-12,bassAlignment:{minus3:79,minus6:47,subsonic:20},filterSpecs:[]},
            shelfWood:{label:'Bookshelf · agudos suaves',highpass:41,headroomDb:-12,bassAlignment:{frequency:41,order:4},filterSpecs:[{type:'peaking',frequency:1100,Q:2.5,gain:1},{type:'peaking',frequency:1450,Q:4,gain:-1.5},{type:'highshelf',frequency:11000,gain:-2}]},
            shelfTop:{label:'Bookshelf · agudos destacados',highpass:50,headroomDb:-12,curveMaxDb:12,bassAlignment:{frequency:50,order:4},filterSpecs:[{type:'peaking',frequency:10000,Q:1.1,gain:9.5}]},
            floorDiamond:{label:'Coluna · agudos presentes',highpass:24,headroomDb:-6,bassAlignment:{frequency:24,order:4},filterSpecs:[{type:'peaking',frequency:90,Q:.65,gain:.6},{type:'peaking',frequency:2000,Q:.75,gain:-1.5},{type:'highshelf',frequency:3000,gain:3.4},{type:'peaking',frequency:3800,Q:3,gain:1.5},{type:'peaking',frequency:6500,Q:2.5,gain:-2.2},{type:'peaking',frequency:11000,Q:1,gain:1}]},
            floorCoax:{label:'Coluna · resposta equilibrada',highpass:46,headroomDb:-6,bassAlignment:{minus3:46,minus6:30,subsonic:16},filterSpecs:[{type:'highshelf',frequency:7000,gain:-.6}]},
            floorFlax:{label:'Coluna · extensão de graves',highpass:39,headroomDb:-6,bassAlignment:{minus3:39,minus6:32,subsonic:12},filterSpecs:[]},
            speaker:{label:'Vintage · médios quentes',bands:[1,2,-1]},
            spkPassiveWood:{label:'Vintage · presença vocal',bands:[1,2.5,-1.5]},
            spkPassiveCarbon:{label:'Moderna · graves e detalhes',bands:[2.5,-.5,1]},
            spkPassiveGridBlack:{label:'Três vias · corpo e equilíbrio',highpass:40,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:40,Q:.70710678},{type:'highpass',frequency:40,Q:.70710678},{type:'peaking',frequency:90,Q:.7,gain:.6}]},
            spkPassiveGridOrange:{label:'Três vias · corpo e equilíbrio',highpass:40,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:40,Q:.70710678},{type:'highpass',frequency:40,Q:.70710678},{type:'peaking',frequency:90,Q:.7,gain:.6}]},
            spkActiveMonitor:{label:'Monitor vintage · médios presentes',bands:[.5,1.5,-.5]},
            spkActiveCompact:{label:'Compacta · graves contidos e clareza',bands:[1.5,.3,.7],highpass:67},
            spkActiveRounded:{label:'Monitor · precisão e equilíbrio',highpass:47,headroomDb:-8,filterSpecs:[{type:'highpass',frequency:47,Q:.70710678},{type:'highpass',frequency:47,Q:.70710678}]},
            spkActiveBookshelf:{label:'Ativa moderna · graves e clareza',bands:[2,0,1]}
        };

        function speakerFilterCoefficients(spec,sampleRate){
            const frequency=Math.max(1,Math.min(sampleRate*.49,spec.frequency));
            const w=2*Math.PI*frequency/sampleRate,c=Math.cos(w),sn=Math.sin(w),q=spec.Q??Math.SQRT1_2;
            let b,a;
            if(spec.type==='highpass'){
                const alpha=sn/(2*q);b=[(1+c)/2,-1-c,(1+c)/2];a=[1+alpha,-2*c,1-alpha];
            }else if(spec.type==='peaking'){
                const A=10**((spec.gain||0)/40),alpha=sn/(2*q);b=[1+alpha*A,-2*c,1-alpha*A];a=[1+alpha/A,-2*c,1-alpha/A];
            }else if(spec.type==='lowshelf'){
                const A=10**((spec.gain||0)/40),alpha=sn/Math.SQRT2,beta=2*Math.sqrt(A)*alpha;
                b=[A*((A+1)-(A-1)*c+beta),2*A*((A-1)-(A+1)*c),A*((A+1)-(A-1)*c-beta)];
                a=[(A+1)+(A-1)*c+beta,-2*((A-1)+(A+1)*c),(A+1)+(A-1)*c-beta];
            }else if(spec.type==='highshelf'){
                const A=10**((spec.gain||0)/40),alpha=sn/Math.SQRT2,beta=2*Math.sqrt(A)*alpha;
                b=[A*((A+1)+(A-1)*c+beta),-2*A*((A-1)+(A+1)*c),A*((A+1)+(A-1)*c-beta)];
                a=[(A+1)-(A-1)*c+beta,2*((A-1)-(A+1)*c),(A+1)-(A-1)*c-beta];
            }else throw new Error('Filtro de assinatura não suportado');
            return {feedforward:b.map(value=>value/a[0]),feedback:a.map(value=>value/a[0])};
        }
        function floorListeningFilters(profile,sampleRate){
            const alignment=profile.bassAlignment,filters=[];
            if(alignment.order===4){
                // Fourth-order Butterworth approximation to the specified bass extension.
                [.541196100146197,1.306562964876377].forEach(Q=>filters.push({type:'highpass',frequency:alignment.frequency,Q}));
            }else{
                // Interpret the lower ±3 dB bandwidth edge as an approximate -3 dB anchor.
                // Solve the second section after compensating the subsonic section; bilinear
                // prewarping keeps both anchors consistent at different audio sample rates.
                const gsub=Math.tan(Math.PI*alignment.subsonic/sampleRate);
                const anchors=[[alignment.minus3,3],[alignment.minus6,6]].map(([frequency,attenuation])=>{
                    const t=Math.tan(Math.PI*frequency/sampleRate),x=1/(t*t),subPower=1/(1+(gsub/t)**4);
                    return {x,u:10**(attenuation/10)*subPower-1};
                });
                const [p1,p2]=anchors,B=(p2.u/p2.x-p1.u/p1.x)/(p2.x-p1.x),g=B**.25,A=p1.u/p1.x-B*p1.x;
                const Q=1/Math.sqrt(2+A/(g*g)),frequency=Math.atan(g)*sampleRate/Math.PI;
                filters.push({type:'highpass',frequency:alignment.subsonic,Q:Math.SQRT1_2},{type:'highpass',frequency,Q});
            }
            return [...filters,...profile.filterSpecs];
        }
        function listeningCurveHtml(dev) {
            const width=360,height=190,left=35,right=345,top=16,bottom=152;
            const frequencies=Float32Array.from({length:181},(_,i)=>20*1000**(i/180));
            const response=new Float64Array(frequencies.length);
            const magnitude=new Float32Array(frequencies.length),phase=new Float32Array(frequencies.length);
            dev.voicingNodes.filter(node=>typeof node.getFrequencyResponse==='function').forEach(filter=>{
                filter.getFrequencyResponse(frequencies,magnitude,phase);
                magnitude.forEach((gain,i)=>{response[i]+=20*Math.log10(Math.max(1e-8,gain));});
            });
            const minDb=dev.listeningProfile.curveMinDb??(dev.listeningProfile.highpass?-24:-6),maxDb=dev.listeningProfile.curveMaxDb||6;
            const x=f=>left+Math.log10(f/20)/3*(right-left);
            const y=db=>top+(maxDb-db)/(maxDb-minDb)*(bottom-top);
            const path=Array.from(response,(db,i)=>`${i?'L':'M'}${x(frequencies[i]).toFixed(2)},${y(db).toFixed(2)}`).join(' ');
            const horizontal=(minDb<=-12?Array.from({length:(maxDb-minDb)/6+1},(_,i)=>minDb+i*6):[-6,-3,0,3,6]).map(db=>`<line x1="${left}" x2="${right}" y1="${y(db)}" y2="${y(db)}" stroke="${db===0?'#718096':'#303c49'}" ${db===0?'':'stroke-dasharray="3 4"'}/><text x="${left-7}" y="${y(db)+3}" text-anchor="end" fill="#aab6c5" font-size="10">${db>0?'+':''}${db}</text>`).join('');
            const vertical=[[20,'20'],[100,'100'],[1000,'1k'],[10000,'10k'],[20000,'20k']].map(([hz,label])=>`<line x1="${x(hz)}" x2="${x(hz)}" y1="${top}" y2="${bottom}" stroke="#303c49"/><text x="${x(hz)}" y="${bottom+18}" text-anchor="middle" fill="#aab6c5" font-size="10">${label}</text>`).join('');
            const bands=[['Graves',60,200],['Médios',300,2500],['Agudos',5000,12000]].map(([label,low,high])=>{
                const samples=Array.from(response,(db,index)=>({db,frequency:frequencies[index]})).filter(sample=>sample.frequency>=low&&sample.frequency<=high);
                // The response above includes only filters: the global gain trim is
                // already excluded, so indicators share the graph's 0 dB reference.
                const meanDb=samples.length?samples.reduce((sum,sample)=>sum+sample.db,0)/samples.length:0;
                const state=meanDb<=-4?'recuo-forte':meanDb< -1?'recuo-leve':meanDb<=1?'neutro':meanDb<4?'realce-leve':'realce-forte';
                const position={'recuo-forte':0,'recuo-leve':1,neutro:2,'realce-leve':3,'realce-forte':4}[state];
                const stateLabel={'recuo-forte':'Recuo forte','recuo-leve':'Recuo leve',neutro:'Neutro','realce-leve':'Realce leve','realce-forte':'Realce forte'}[state];
                const dots=Array.from({length:5},(_,index)=>`<i class="${index===2?'is-neutral ':''}${index===position?'is-active':''}"></i>`).join('');
                return `<div class="sonic-band" data-tone="${state}" role="img" aria-label="${label}: ${stateLabel.toLowerCase()}. Média da curva entre ${low} e ${high} Hz."><span class="sonic-band-name">${label}</span><span class="sonic-band-dots" title="Média entre ${low} e ${high} Hz · escala de recuo a realce, centro neutro" aria-hidden="true">${dots}</span><span class="sonic-band-state">${stateLabel}</span></div>`;
            }).join('');
            return `<div class="sonic-signature-visuals">${bands}</div><figure class="sonic-curve-figure"><svg viewBox="0 0 ${width} ${height}" class="sonic-curve-graph" role="img" aria-label="Curva da assinatura sonora: ${dev.listeningProfile.label}. Frequência de 20 Hz a 20 kHz; ganho relativo entre ${minDb} e mais ${maxDb} decibéis." style="font-family:Inter,sans-serif"><text x="${left}" y="10" fill="#aab6c5" font-size="9">dB</text>${horizontal}${vertical}<path d="${path}" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><text x="${right}" y="${height-2}" text-anchor="end" fill="#aab6c5" font-size="9">Hz</text></svg></figure>`;
        }

        const INTEGRATED_AMPS={
            integratedUtility:{watts:20,tone:true,meters:false,finish:'utility',description:'Integrado cinza-oliva com controles de plástico, phono, loudness, mono e tone defeat. Amplificação estéreo nominal de 20 W por canal.'},
            integratedBlue:{watts:100,tone:true,meters:true,finish:'blue',description:'Integrado de frente preta com visores azuis e laterais metálicas. Três entradas de linha, phono, saídas para caixas e fones. '},
            integratedMinimal:{watts:70,tone:false,meters:false,finish:'minimal',description:'Integrado preto minimalista com seleção de fontes e volume. Três entradas de linha, phono, saídas para caixas e fones. '},
            integratedSilver:{watts:90,tone:true,meters:true,finish:'silver',description:'Integrado prateado com laterais em madeira, medidores âmbar e controles de tonalidade e balanço. Três entradas de linha, phono, saídas para caixas e fones. '}
        };
        const CUSTOM_PREAMPS={
            preGlass:{finish:'glass',tone:true,balance:true,phono:true,phones:false,sub:false,sources:['Auxiliar','Sintonizador','Tape','Phono'],description:'Pré de vidro preto com laterais de alumínio, knobs prateados e alavancas metálicas. Três entradas de linha, phono, tonalidade, filtros de graves/agudos, loudness, mono, mute e inversão de polaridade.'},
            prePrecision:{finish:'precision',tone:false,balance:true,phono:false,phones:false,sub:false,description:'Pré compacto de alumínio escovado com modulômetro estéreo, seleção rotativa de quatro entradas, ganho 0/6/12 dB, mute, mono e inversão de polaridade.'},
            preReference:{finish:'reference',tone:false,balance:true,phono:false,phones:false,sub:false,description:'Pré de linha com frente prateada, alças e visor verde. Quatro entradas LINE, saída RCA estéreo, volume, balanço, mute, mono e inversão de polaridade. '},
            preControl:{finish:'control',tone:true,balance:true,phono:true,phones:true,sub:true,crossover:true,description:'Pré 2.1 prateado com visor azul, tonalidade e saída de subwoofer ajustável. Três entradas LINE e PHONO, saídas RCA de linha e fones P2. '},
            preDisplay:{finish:'display',tone:true,balance:true,phono:true,phones:true,sub:true,description:'Pré preto com dois knobs grandes e tela central mostrando fonte, volume e níveis L/R. Três entradas LINE e PHONO, saídas RCA de linha, sub mono e fones P10. '}
        };
        const controlAmpConfig=type=>INTEGRATED_AMPS[type]||CUSTOM_PREAMPS[type];
        const controlAmpSources=type=>controlAmpConfig(type).sources||['Linha 1','Linha 2','Linha 3',controlAmpConfig(type).phono===false?'Linha 4':'Phono'];
        const CUSTOM_POWER_AMPS={
            powerValve:{watts:75,finish:'valve',constantPower:true,description:'Potência estéreo com válvulas expostas, transformadores pretos e chassi cromado. Entrada RCA de linha e saídas amplificadas para caixas; 75 W nominais por canal, em simulação simplificada.'},
            powerDual:{watts:300,finish:'dual',description:'Potência estéreo de frente preta robusta, alças e LEDs independentes L/R. Conexões RCA e fio de caixa simplificadas para o simulador.'},
            powerBias:{watts:250,finish:'bias',description:'Potência estéreo prateada, dissipadores laterais e visor circular azul. O ponteiro mostra a potência de saída simulada do canal com maior nível; ganhos A/B ajustáveis no menu lateral.'}
        };
        const DEFAULT_POWER_GAIN=.5;
        // Individual simulation voicings.
        const AMPLIFICATION_VOICINGS={
            preGlass:{bass:.2,treble:-.35,drive:.38,asymmetry:.035},
            integratedUtility:{bass:.15,treble:-.2,drive:.2,asymmetry:0},
            prePrecision:{bass:0,treble:0,drive:.06,asymmetry:0},
            streamIntegrated:{bass:0,treble:0,drive:.08,asymmetry:0},
            powerValve:{bass:.8,treble:-1.5,drive:1.05,asymmetry:.11,knee:-9,ratio:1.55},
            powerDual:{bass:0,treble:0,drive:.12,asymmetry:0},
            powerBias:{bass:.25,treble:-.35,drive:.32,asymmetry:.025},
            powerStereo:{bass:.1,treble:-.1,drive:.22,asymmetry:0},
            powerVintage:{bass:.5,treble:-.8,drive:.52,asymmetry:.055},
            integratedBlue:{bass:.2,treble:-.2,drive:.26,asymmetry:.012},
            integratedMinimal:{bass:0,treble:0,drive:.16,asymmetry:0},
            integratedSilver:{bass:.3,treble:-.4,drive:.36,asymmetry:.018},
            receiver:{bass:.4,treble:-.65,drive:.42,asymmetry:.04},
            powerAmp:{bass:0,treble:0,drive:.1,asymmetry:0},
            preamp:{bass:0,treble:0,drive:.09,asymmetry:0},
            preReference:{bass:.15,treble:-.25,drive:.3,asymmetry:.045},
            preControl:{bass:0,treble:0,drive:.07,asymmetry:0},
            preDisplay:{bass:.05,treble:-.1,drive:.14,asymmetry:.008},
            headphoneAmp:{bass:.35,treble:-.55,drive:.4,asymmetry:.035},
            headphoneAmpModern:{bass:0,treble:0,drive:.08,asymmetry:0},
            headphoneAmp4:{bass:.05,treble:-.05,drive:.15,asymmetry:0}
        };
        function modelSaturationCurve(profile,size=4097){
            const curve=new Float32Array(size),drive=profile.drive,bias=profile.asymmetry||0,offset=Math.tanh(drive*bias),slope=drive*(1-offset*offset);
            for(let i=0;i<size;i++){
                const x=(i/(size-1)*2-1)*4;
                curve[i]=(Math.tanh(drive*(x+bias))-offset)/(slope*4);
            }
            return curve;
        }
        function installAmplificationVoicing(dev){
            const profile=AMPLIFICATION_VOICINGS[dev.type];if(!profile)return;
            const ctx=state.audioCtx,byNode=new Map(),curve=modelSaturationCurve(profile);dev.amplificationProfile=profile;dev.modelAudioNodes||=[];dev.valveWarmGains=[];
            const outputPorts=[...dev.el.querySelectorAll('.port[data-io="out"]')];
            for(const port of outputPorts){
                const key=port.dataset.node,input=dev.nodes[key];if(!input)continue;
                const outputKind=port.dataset.type==='wire'?'speaker':getPortSignal(port)==='headphone'?'phones':'line',cached=byNode.get(input);
                if(cached?.[outputKind]){dev.nodes[key]=cached[outputKind];continue;}
                let previous=input;
                const append=node=>{previous.connect(node);previous=node;dev.modelAudioNodes.push(node);};
                if(profile.bass){const filter=ctx.createBiquadFilter();filter.type='lowshelf';filter.frequency.value=140;filter.gain.value=profile.bass;append(filter);}
                if(profile.treble){const filter=ctx.createBiquadFilter();filter.type='highshelf';filter.frequency.value=4500;filter.gain.value=profile.treble;append(filter);}
                const headroom=ctx.createGain();headroom.gain.value=.25;append(headroom);
                const shaper=ctx.createWaveShaper();shaper.curve=curve;shaper.oversample='2x';append(shaper);
                const restore=ctx.createGain();restore.gain.value=4;append(restore);
                // Remove rectification DC while preserving silence at zero input.
                const dc=ctx.createBiquadFilter();dc.type='highpass';dc.frequency.value=5;dc.Q.value=.707;append(dc);
                if(profile.knee!=null){const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=profile.knee;compressor.knee.value=18;compressor.ratio.value=profile.ratio;compressor.attack.value=.015;compressor.release.value=.18;append(compressor);}
                const trim=ctx.createGain();trim.gain.value=.9;append(trim);
                if(dev.type==='powerValve'){const warm=ctx.createGain();warm.gain.value=0;append(warm);dev.valveWarmGains.push(warm);}
                if(POWER_OUTPUT_TYPES.has(dev.type)&&port.dataset.type==='wire'){
                    const before=ctx.createGain();before.gain.value=.25;append(before);
                    const shaper=ctx.createWaveShaper();shaper.curve=electricalLimitCurve(1.35);shaper.oversample='2x';append(shaper);
                    const after=ctx.createGain();after.gain.value=4;append(after);const gate=ctx.createGain();append(gate);
                    const analyzer=ctx.createAnalyser();analyzer.fftSize=1024;gate.connect(analyzer);dev.modelAudioNodes.push(analyzer);
                    (dev.electricalStages||=[]).push({channel:port.dataset.channel||(/R$/.test(key)?'R':'L'),shaper,gate,analyzer,samples:new Float32Array(analyzer.fftSize),rms:0,peakLimit:Infinity,load:null});
                }
                const output=ctx.createGain();append(output);const variants=byNode.get(input)||{};variants[outputKind]=output;byNode.set(input,variants);dev.nodes[key]=output;
            }
            if(dev.type==='powerValve'){
                dev.valveHeat=0;dev.valveGlowNodes=[...dev.el.querySelectorAll('.valve-svg-glow')];dev.valveGlowNodes.forEach(node=>node.style.opacity='0');
                dev.syncValvePower=()=>{const t=ctx.currentTime;dev.valveWarmGains.forEach(gain=>{gain.gain.cancelAndHoldAtTime(t);gain.gain.linearRampToValueAtTime(dev.powered?1:0,t+(dev.powered?3:.03));});};dev.syncValvePower();
            }
        }
        function amplificationInspectorHtml(dev){
            const profile=dev.amplificationProfile;if(!profile)return '';
            // Fixed, shared ranges describe the base model rather than quality or live signal level.
            const traits=[
                {label:'Graves',value:profile.bass,min:-.8,max:.8,low:'Enxutos',high:'Encorpados',neutral:true},
                {label:'Agudos',value:profile.treble,min:-1.5,max:1.5,low:'Suaves',high:'Brilhantes',neutral:true},
                {label:'Saturação',value:profile.drive,min:0,max:1.05,low:'Sutil',high:'Marcante'},
                {label:'Harmônicos pares',value:profile.asymmetry??0,min:0,max:.11,low:'Discretos',high:'Presentes'}
            ];
            const rows=traits.map(trait=>{
                const position=Math.round(Math.max(0,Math.min(1,(trait.value-trait.min)/(trait.max-trait.min)))*6);
                const dots=Array.from({length:7},(_,index)=>`<i class="sonic-trait-dot${index===position?' is-active':''}${trait.neutral&&index===3?' is-neutral':''}"></i>`).join('');
                const accessible=`${trait.label}: posição ${position+1} de 7, de ${trait.low} a ${trait.high}.${trait.neutral?' Centro neutro.':''}`;
                return `<div class="sonic-trait" role="img" aria-label="${accessible}"><span class="sonic-trait-label">${trait.label}</span><div class="sonic-trait-dots" aria-hidden="true">${dots}</div><div class="sonic-trait-extremes" aria-hidden="true"><span>${trait.low}</span><span>${trait.neutral?'Neutros':''}</span><span>${trait.high}</span></div></div>`;
            }).join('');
            return `<section class="sonic-profile" aria-label="Comportamento sonoro"><h3 class="sonic-profile-title">Comportamento sonoro</h3>${rows}<span class="sonic-profile-note">Perfil base · escala relativa da simulação</span></section>`;
        }

        // Digital samples represent instantaneous voltage; RMS is computed from samples.
        const ELECTRICAL_MODEL=Object.freeze({lineVoltsPerUnit:Math.SQRT2*2,speakerVoltsPerUnit:20,phonoGain:100,converterRatio:.1,lineInputOhms:47000,converterInputOhms:20000});
        const HEADPHONE_SPECS=Object.freeze({headphone:{ohms:32},hpStudio:{ohms:64},hpClassic:{ohms:80},hpMonitor:{ohms:32},hpMax:{ohms:32},...REFERENCE_HEADPHONES});
        const HEADPHONE_OUTPUT_SPECS=Object.freeze({
            streamIntegrated:{voltsRms:2,currentRms:.07,outputOhms:2},
            headphoneAmp:{voltsRms:3,currentRms:.065,outputOhms:12},headphoneAmpModern:{voltsRms:4,currentRms:.18,outputOhms:1},headphoneAmp4:{voltsRms:2.5,currentRms:.08,outputOhms:4},
            receiver:{voltsRms:3,currentRms:.04,outputOhms:47},powerAmp:{voltsRms:2.5,currentRms:.07,outputOhms:10},preControl:{voltsRms:2,currentRms:.07,outputOhms:3},preDisplay:{voltsRms:2.5,currentRms:.08,outputOhms:2}
        });
        const headphoneOutputSpec=dev=>HEADPHONE_OUTPUT_SPECS[dev.type]||{voltsRms:2,currentRms:.06,outputOhms:5};
        const wattsAtLoad=(rms,ohms)=>Number.isFinite(ohms)&&ohms>0?((rms||0)*ELECTRICAL_MODEL.speakerVoltsPerUnit)**2/ohms:0;
        const peakLimitForWatts=(watts,ohms)=>Math.sqrt(2*watts*ohms)/ELECTRICAL_MODEL.speakerVoltsPerUnit;
        const parallelOhms=values=>{const conductance=values.reduce((sum,value)=>sum+(Number.isFinite(value)&&value>0?1/value:0),0);return conductance>0?1/conductance:Infinity;};
        function amplifierChannelRms(dev,channel){return dev.electricalStages?.find(stage=>stage.channel===channel)?.rms||0;}
        function readElectricalStages(){
            for(const dev of Object.values(state.devices))for(const stage of [...(dev.electricalStages||[]),...(dev.outputCircuits||[]).flatMap(circuit=>circuit.paths.filter(path=>path.analyzer))]){
                stage.analyzer.getFloatTimeDomainData(stage.samples);let sum=0,peak=0;
                for(const value of stage.samples){sum+=value*value;peak=Math.max(peak,Math.abs(value));}
                stage.rms=dev.powered&&!dev.state.damage&&state.audioCtx.state==='running'?Math.sqrt(sum/stage.samples.length):0;
                stage.clipping=stage.rms>0&&peak>stage.peakLimit*.94;
            }
        }
        const POWER_OUTPUT_TYPES=new Set(['receiver','powerAmp','powerStereo','powerVintage','streamIntegrated',...Object.keys(INTEGRATED_AMPS),...Object.keys(CUSTOM_POWER_AMPS)]);
        const isListeningDevice=dev=>PASSIVE_SPK.has(dev.type)||ACTIVE_SPK.has(dev.type)||HP_TYPES.has(dev.type)||SUB_TYPES.has(dev.type)||PASSIVE_SUB_TYPES.has(dev.type);
        const FIXED_AMP_SPECS=Object.freeze({
            integratedUtility:{watts:20,minOhms:4,powerByOhms:{4:28,8:20}},
            streamIntegrated:{watts:40,minOhms:4,powerByOhms:{4:65,8:40}},
            receiver:{watts:60,minOhms:4,powerByOhms:{4:85,8:60}},
            powerAmp:{watts:100,minOhms:4,powerByOhms:{4:150,8:100}},
            powerStereo:{watts:80,minOhms:8,powerByOhms:{8:80}},
            powerVintage:{watts:40,minOhms:4,powerByOhms:{4:60,8:40}},
            integratedBlue:{watts:100,minOhms:4,powerByOhms:{4:160,8:100}},
            integratedMinimal:{watts:70,minOhms:4,powerByOhms:{4:100,8:70}},
            integratedSilver:{watts:90,minOhms:4,powerByOhms:{4:150,8:90}},
            powerValve:{watts:75,minOhms:4,powerByOhms:{4:75,8:75,16:75}},
            powerDual:{watts:300,minOhms:4,powerByOhms:{4:500,8:300}},
            powerBias:{watts:250,minOhms:4,powerByOhms:{4:400,8:250}}
        });
        const FIXED_PASSIVE_SPECS=Object.freeze({
            speaker:{ohms:8,watts:80},spkPassiveWood:{ohms:8,watts:60},spkPassiveCarbon:{ohms:6,watts:100},spkPassiveGridBlack:{ohms:4,watts:200,recommended:true},spkPassiveGridOrange:{ohms:4,watts:200,recommended:true},
            subwooferPassive:{ohms:4,watts:250},subwooferPassiveVintage:{ohms:8,watts:120}
        });
        function connectPhonoPlayback(dev,gain,destination){
            const ctx=state.audioCtx,before=ctx.createGain(),clip=ctx.createWaveShaper(),after=ctx.createGain();
            before.gain.value=.25;after.gain.value=4;clip.curve=electricalLimitCurve(1.4);clip.oversample='2x';
            gain.connect(before);before.connect(clip);clip.connect(after);after.connect(destination);
            (dev.modelAudioNodes||=[]).push(before,clip,after);
        }
        function fixDeviceElectricalSpecs(dev){
            const amp=FIXED_AMP_SPECS[dev.type],reference=FLOOR_SPEAKERS[dev.type]||BOOKSHELF_SPEAKERS[dev.type],passive=reference||FIXED_PASSIVE_SPECS[dev.type];
            const fixed=amp?{ratedWatts:amp.watts,ratedOhms:8,minOhms:amp.minOhms}:passive?{speakerWatts:passive.watts,speakerOhms:passive.ohms}:HEADPHONE_SPECS[dev.type]?{headphoneOhms:HEADPHONE_SPECS[dev.type].ohms}:{};
            const phones=HEADPHONE_OUTPUT_SPECS[dev.type];if(phones)Object.assign(fixed,{headphoneMaxVrms:phones.voltsRms,headphoneMaxIrms:phones.currentRms,headphoneOutputOhms:phones.outputOhms});
            dev.electricalSpec=Object.freeze({...fixed});
            for(const [key,value]of Object.entries(fixed))if(!Object.getOwnPropertyDescriptor(dev.state,key)?.get)Object.defineProperty(dev.state,key,{enumerable:true,configurable:false,get:()=>value,set:()=>{}});
        }
        function ampPowerAtLoad(type,load){
            const spec=FIXED_AMP_SPECS[type];if(!spec||!Number.isFinite(load)||load<=0)return 0;
            const points=Object.entries(spec.powerByOhms).map(([ohms,watts])=>[Number(ohms),watts]).sort((a,b)=>a[0]-b[0]);
            if(load<points[0][0])return points[0][1]*points[0][0]/load;
            for(let i=1;i<points.length;i++)if(load<=points[i][0]){const [r0,p0]=points[i-1],[r1,p1]=points[i],t=Math.log(load/r0)/Math.log(r1/r0);return p0*(p1/p0)**t;}
            const [r,p]=points.at(-1);return p*r/load;
        }
        function electricalLimitCurve(limit,size=4097){
            const curve=new Float32Array(size),knee=limit*.85,width=Math.max(.0001,limit-knee);
            for(let i=0;i<size;i++){const x=(i/(size-1)*2-1)*4,a=Math.abs(x);curve[i]=Math.sign(x)*(a<=knee?a:knee+width*Math.tanh((a-knee)/width))/4;}
            return curve;
        }
        function setAmplifierLoad(dev,channel,ohms){
            const spec=FIXED_AMP_SPECS[dev.type];if(!spec)return;
            dev.channelLoads||={};dev.channelLoads[channel]=ohms;
            dev.electricalStages?.filter(stage=>stage.channel===channel).forEach(stage=>{
                if(stage.load===ohms)return;stage.load=ohms;
                const protectedLoad=ohms<spec.minOhms-.01;
                const referenceLoad=Number.isFinite(ohms)?ohms:8,available=ampPowerAtLoad(dev.type,referenceLoad),limit=peakLimitForWatts(available,referenceLoad);
                stage.peakLimit=limit;stage.shaper.curve=electricalLimitCurve(limit);stage.gate.gain.setTargetAtTime(protectedLoad?0:1,state.audioCtx.currentTime,.025);
            });
        }
        function electricalStatusMarkup(dev){
            const data=dev.powerStatusVisual||{},channels=data.channels||[],notes=data.notes||[];
            const state=dev.speakerOverloaded||notes.some(note=>note.state==='protection')?'protection':notes.some(note=>note.state==='attention')?'attention':notes.some(note=>note.state==='compatible')?'compatible':'waiting';
            const labels={protection:'Proteção',attention:'Atenção',compatible:'Compatível',waiting:'Sem conexão'};
            const channelMarkup=channels.map(channel=>`<span class="electrical-channel" data-state="${channel.state}" title="Canal ${channel.channel}: ${channel.detail}"><b>${channel.channel}</b><span>${channel.label}</span>${Number.isFinite(channel.watts)?`<small>${channel.watts} W</small>`:''}</span>`).join('');
            const noteText=notes.map(note=>note.detail).filter(Boolean);
            if(dev.speakerOverloaded)noteText.push('Sobrecarga: reduza o nível. Esta caixa passiva não possui limitador automático.');
            if(state==='waiting'&&!noteText.length)noteText.push('Conecte caixas passivas para calcular a carga por canal.');
            const current=Number(dev.simulatedInputWatts)||0;
            const currentMarkup=current>0?`<span class="electrical-current" title="Potência atual estimada">${current.toFixed(2)} W <small>ATUAL</small></span>`:'';
            return `<div class="electrical-status" data-state="${state}" role="status" aria-label="${[...channels.map(channel=>`${channel.channel}: ${channel.label}`),labels[state],...noteText].join('. ')}">${channelMarkup}<span class="electrical-status-badge" data-state="${state}" title="${noteText.join(' ')}"><i aria-hidden="true"></i>${labels[state]}</span>${currentMarkup}</div>`;
        }
        function applySpeakerLoadDynamics(dev){
            if(!dev.listeningGain)return;
            let gain=dev.electricalBaseGain??1,power=0;
            for(const route of dev.electricalRoutes||[]){
                const rms=route.amp.powered?amplifierChannelRms(route.amp,route.channel):0;
                const delivered=wattsAtLoad(rms,dev.state.speakerOhms);power=PASSIVE_SUB_TYPES.has(dev.type)?power+delivered:Math.max(power,delivered);
            }
            // A maximum recommended amplifier rating is not a measured thermal limit.
            const recommended=['spkPassiveGridBlack','spkPassiveGridOrange'].includes(dev.type)||!!(FLOOR_SPEAKERS[dev.type]||BOOKSHELF_SPEAKERS[dev.type])&&dev.type!=='shelfWood';
            dev.speakerOverloaded=!recommended&&power>dev.state.speakerWatts;
            if(dev.state.damage)gain=0;
            dev.simulatedInputWatts=power;
            dev.powerStatusVisual={...(dev.powerStatusVisual||{}),currentWatts:power,overloaded:dev.speakerOverloaded};
            if(state.selectedDeviceId===dev.id){const status=document.getElementById('power-load-status');if(status)status.innerHTML=electricalStatusMarkup(dev);}
            dev.listeningGain.gain.setTargetAtTime(gain,state.audioCtx.currentTime,.06);
        }
        const isPassiveLoad=dev=>PASSIVE_SPK.has(dev.type)||PASSIVE_SUB_TYPES.has(dev.type);
        function installListeningControls(dev){
            if(!isListeningDevice(dev))return;
            dev.state.muted=false;dev.state.solo=false;
            const output=dev.outputPan||dev.analyzer;
            if(!output)return;
            dev.listeningGain=state.audioCtx.createGain();
            output.disconnect(state.masterGain);output.connect(dev.listeningGain);dev.listeningGain.connect(state.masterGain);
        }
        const portChannel=port=>port?.dataset.channel||(/[LR]$/.exec(port?.dataset.node||'')?.[0])||'';
        const isSignalPassthrough=dev=>!!INTERFACE_DEVICES[dev.type]?.passive||RCA_SWITCH_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type)||SPEAKER_SWITCH_TYPES.has(dev.type);
        function prospectiveConnections(prospective){
            if(!prospective)return state.connections;
            return [...state.connections.filter(c=>c.inId!==prospective.input.id&&c.outId!==prospective.output.id),{outId:prospective.output.id,inId:prospective.input.id}];
        }
        function routedInputPorts(dev,output,channelHint=''){
            const channel=portChannel(output)||channelHint;
            return [...dev.el.querySelectorAll('.port[data-io="in"]')].filter(input=>{
                if(channel&&portChannel(input)&&channel!==portChannel(input))return false;
                return !MATRIX_TYPES.has(dev.type)||input.dataset.node.startsWith('in'+dev.state.matrixInput);
            });
        }
        function inputOhms(dev,input){
            if(isPassiveLoad(dev))return dev.state.speakerOhms;
            if(HP_TYPES.has(dev.type))return dev.state.headphoneOhms||32;
            if(dev.type==='speakerConverter')return ELECTRICAL_MODEL.converterInputOhms;
            return getPortSignal(input)==='phono'?47000:ELECTRICAL_MODEL.lineInputOhms;
        }
        function terminalLoads(output,prospective=null,seen=new Set(),sourceChannel='',routingChannel=''){
            if(!output||seen.has(output.id))return [];
            const next=new Set(seen);next.add(output.id);const channel=sourceChannel||portChannel(output),localChannel=portChannel(output)||routingChannel;
            return prospectiveConnections(prospective).filter(c=>c.outId===output.id).flatMap(c=>{
                const input=document.getElementById(c.inId),dev=state.devices[input?.closest('.device-node')?.id];
                if(!dev)return [];
                const nextChannel=portChannel(input)||localChannel;
                if(!isSignalPassthrough(dev))return [{dev,input,channel:channel||portChannel(input),ohms:inputOhms(dev,input)}];
                return [...dev.el.querySelectorAll('.port[data-io="out"]')].filter(port=>{
                    if(nextChannel&&portChannel(port)&&portChannel(port)!==nextChannel)return false;
                    if(!isSelectedSwitchOutput(dev,port))return false;
                    return routedInputPorts(dev,port).includes(input);
                }).flatMap(port=>terminalLoads(port,prospective,next,channel,nextChannel));
            });
        }
        function uniqueTerminalLoads(ports,prospective=null){
            return [...new Map(ports.flatMap(port=>terminalLoads(port,prospective)).map(load=>[load.input.id+':'+load.channel,load])).values()];
        }
        function installOutputCircuits(dev){
            const ctx=state.audioCtx,byNode=new Map();dev.outputCircuits=[];
            for(const port of dev.el.querySelectorAll('.port[data-io="out"]')){
                const node=dev.nodes[port.dataset.node];if(!node)continue;
                if(byNode.has(node)){const circuit=byNode.get(node);circuit.ports.push(port);dev.nodes[port.dataset.node]=circuit.output;continue;}
                const signal=getPortSignal(port),stereo=['p2','p10'].includes(port.dataset.type)&&!portChannel(port);
                const gate=ctx.createGain(),output=ctx.createGain(),paths=[];
                const split=stereo?ctx.createChannelSplitter(2):null,merge=stereo?ctx.createChannelMerger(2):null;
                const managed=[gate,output,...(stereo?[split,merge]:[])];
                if(split)node.connect(split);
                for(const [index,channel]of (stereo?['L','R']:[portChannel(port)]).entries()){
                    const loadGain=ctx.createGain();if(split)split.connect(loadGain,index);else node.connect(loadGain);
                    let previous=loadGain,shaper=null,analyzer=null;
                    managed.push(loadGain);
                    if(signal==='headphone'){
                        const before=ctx.createGain(),after=ctx.createGain();before.gain.value=.25;after.gain.value=4;
                        shaper=ctx.createWaveShaper();shaper.curve=electricalLimitCurve(2);shaper.oversample='2x';
                        previous.connect(before);before.connect(shaper);shaper.connect(after);previous=after;
                        analyzer=ctx.createAnalyser();analyzer.fftSize=1024;after.connect(analyzer);managed.push(before,shaper,after,analyzer);
                    }
                    if(merge)previous.connect(merge,0,index);else previous.connect(gate);
                    paths.push({channel,loadGain,shaper,analyzer,samples:analyzer?new Float32Array(analyzer.fftSize):null,load:null,rms:0,peakLimit:Infinity});
                }
                if(merge)merge.connect(gate);gate.connect(output);
                const circuit={ports:[port],signal,gate,output,paths};
                dev.outputCircuits.push(circuit);byNode.set(node,circuit);byNode.set(output,circuit);dev.nodes[port.dataset.node]=output;
                (dev.modelAudioNodes||=[]).push(...managed);
            }
        }
        function updateOutputCircuitLoads(){
            Object.values(state.devices).forEach(dev=>dev.refreshStreamRouting?.());
            for(const dev of Object.values(state.devices))for(const circuit of dev.outputCircuits||[]){
                circuit.signal=getPortSignal(circuit.ports[0]);if(circuit.signal==='amplified')continue;
                // RCA and stereo jacks of a source share their channel's output buffer.
                const shared=SOURCE_TYPES.has(dev.type)?dev.outputCircuits.filter(other=>getPortSignal(other.ports[0])===circuit.signal):[circuit];
                const loads=uniqueTerminalLoads(shared.flatMap(other=>other.ports));
                for(const path of circuit.paths){
                    const channelLoads=loads.filter(load=>!path.channel||!load.channel||load.channel===path.channel);
                    const ohms=parallelOhms(channelLoads.map(load=>load.ohms)),signature=circuit.signal+'|'+ohms;
                    if(path.loadSignature===signature)continue;path.loadSignature=signature;path.load=ohms;
                    const phones=!!path.shaper,spec=phones?headphoneOutputSpec(dev):{outputOhms:isSignalPassthrough(dev)?0:TURNTABLE_TYPES.has(dev.type)&&dev.state.tt?.output==='phono'?600:100};
                    const divider=Number.isFinite(ohms)?ohms/(ohms+spec.outputOhms):1;
                    path.loadGain.gain.setTargetAtTime(divider,state.audioCtx.currentTime,.025);
                    if(phones){
                        const availableVrms=Math.min(spec.voltsRms,Number.isFinite(ohms)?spec.currentRms*ohms:spec.voltsRms);
                        path.peakLimit=Math.SQRT2*availableVrms/ELECTRICAL_MODEL.lineVoltsPerUnit;
                        path.shaper.curve=electricalLimitCurve(path.peakLimit);
                    }
                }
            }
        }
        function amplifierOrigins(output,seen=new Set(),channelHint=''){
            if(!output||seen.has(output.id))return [];
            const dev=state.devices[output.closest('.device-node')?.id];if(!dev||!isSelectedSwitchOutput(dev,output))return [];
            const channel=portChannel(output)||channelHint;
            if(POWER_OUTPUT_TYPES.has(dev.type)&&getPortSignal(output)==='amplified')return [{amp:dev,channel,key:dev.id+':'+channel}];
            if(!isSignalPassthrough(dev))return [];
            const next=new Set(seen);next.add(output.id);const inputs=routedInputPorts(dev,output,channel);
            return state.connections.filter(c=>inputs.some(port=>port.id===c.inId)).flatMap(c=>amplifierOrigins(document.getElementById(c.outId),next,portChannel(document.getElementById(c.inId))||channel));
        }
        function amplifierRoutes(dev){
            const routes=state.connections.filter(c=>document.getElementById(c.inId)?.closest('.device-node')?.id===dev.id).flatMap(c=>amplifierOrigins(document.getElementById(c.outId)));
            return [...new Map(routes.map(route=>[route.key,route])).values()];
        }
        function updateListeningControls(){
            if(!state.audioCtx)return;
            const devices=Object.values(state.devices),sinks=devices.filter(isListeningDevice);
            const solo=sinks.some(dev=>dev.state.solo),loads=new Map(),routes=new Map();
            sinks.filter(isPassiveLoad).forEach(dev=>{
                const list=amplifierRoutes(dev);routes.set(dev.id,list);
                new Map(list.map(route=>[route.key,route])).forEach(route=>{
                    if(!loads.has(route.key))loads.set(route.key,{amp:route.amp,speakers:new Set()});
                    loads.get(route.key).speakers.add(dev);
                });
            });
            devices.forEach(dev=>{dev.powerStatus='';});
            devices.filter(dev=>FIXED_AMP_SPECS[dev.type]).forEach(amp=>['L','R'].forEach(ch=>{const ports=[...amp.el.querySelectorAll('.port[data-io="out"]')].filter(port=>getPortSignal(port)==='amplified'&&portChannel(port)===ch);setAmplifierLoad(amp,ch,parallelOhms(uniqueTerminalLoads(ports).map(load=>load.ohms)));}));
            updateOutputCircuitLoads();
            const ampWarnings=new Map();
            sinks.forEach(dev=>{
                let gain=1,notes=[],statusNotes=[],statusChannels=[];
                if(isPassiveLoad(dev)){
                    const list=routes.get(dev.id)||[];
                    if(!list.length){notes.push('Conecte a uma saída amplificada para calcular a carga.');statusNotes.push({state:'waiting',detail:'Conecte a uma saída amplificada para calcular a carga.'});}
                    list.forEach(route=>{
                        const group=loads.get(route.key);
                        const load=route.amp.channelLoads[route.channel];
                        const amp=route.amp,available=ampPowerAtLoad(amp.type,load);
                        const delivered=available*(load/dev.state.speakerOhms);
                        let message=`Carga ${load.toFixed(1)} Ω · até ${Math.round(delivered)} W nominais nesta caixa.`;
                        let statusState='compatible';
                        if(load<amp.state.minOhms-.01){gain=0;statusState='protection';message+=' Proteção: carga abaixo do mínimo do amplificador.';}
                        else if(delivered>dev.state.speakerWatts){statusState='attention';message+=' Atenção ao nível: reserva do amplificador acima da referência desta caixa.';}
                        else message+=' Conjunto compatível.';
                        notes.push(message);
                        const detail=`Canal ${route.channel}: ${message}`;
                        statusNotes.push({state:statusState,detail});
                        statusChannels.push({channel:route.channel,label:`${load.toFixed(1)} Ω`,watts:Math.round(delivered),state:statusState,detail});
                        if(!ampWarnings.has(amp.id))ampWarnings.set(amp.id,[]);
                        ampWarnings.get(amp.id).push({state:statusState,detail});
                    });
                }
                dev.electricalRoutes=routes.get(dev.id)||[];
                dev.powerStatus=notes.join(' ');
                if(isPassiveLoad(dev))dev.powerStatusVisual={channels:statusChannels,notes:statusNotes};
                const audible=!dev.state.damage&&!dev.state.muted&&(!solo||dev.state.solo);
                dev.electricalBaseGain=audible?gain:0;
                if(isPassiveLoad(dev))applySpeakerLoadDynamics(dev);else dev.listeningGain?.gain.setTargetAtTime(audible?gain:0,state.audioCtx.currentTime,.025);
                dev.el.classList.toggle('listening-muted',!audible||gain===0);
                dev.el.classList.toggle('listening-solo',!!dev.state.solo);
            });
            ampWarnings.forEach((notes,id)=>state.devices[id].powerStatus=notes.map(note=>note.detail).join(' '));
            devices.filter(dev=>FIXED_AMP_SPECS[dev.type]).forEach(dev=>{
                const channels=['L','R'].map(ch=>{const ohms=dev.channelLoads?.[ch]??Infinity,min=dev.state.minOhms||0,state=!Number.isFinite(ohms)?'empty':ohms<min-.01?'protection':'compatible',label=Number.isFinite(ohms)?(ohms>=1000?(ohms/1000).toFixed(1)+' kΩ':ohms.toFixed(1)+' Ω'):'Sem carga',watts=Number.isFinite(ohms)?Math.round(ampPowerAtLoad(dev.type,ohms)):null;return {channel:ch,label,watts,state,detail:`Canal ${ch}: ${label}${watts!==null?`, até ${watts} W`:''}${state==='protection'?`; abaixo da carga mínima de ${min} Ω`:''}.`};});
                const valveWarning=dev.type==='powerValve'&&Object.values(dev.channelLoads||{}).some(load=>!Number.isFinite(load)||load>16)?{state:'attention',detail:'Valvulado: use uma carga de caixa adequada; circuito aberto não equivale a 8 Ω.'}:null;
                const notes=[...(ampWarnings.get(dev.id)||[]),...(valveWarning?[valveWarning]:[])];
                dev.powerStatus=[...channels.map(channel=>`${channel.channel}: ${channel.label}`),...notes.map(note=>note.detail)].join(' ');
                dev.powerStatusVisual={channels,notes};
            });

            const selected=state.devices[state.selectedDeviceId];
            const status=document.getElementById('power-load-status');if(status&&selected)status.innerHTML=electricalStatusMarkup(selected);
        }
        function listeningInspectorHtml(dev){
            let html='';
            if(isListeningDevice(dev))html+=`<section class="listening-output-controls flex flex-col gap-2 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Escuta desta saída</span><div class="flex gap-2"><button id="listening-solo" class="tt-insp-btn flex-1 ${dev.state.solo?'is-on':''}" aria-label="Solo" aria-pressed="${!!dev.state.solo}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v18m-5-4V7m10 10V7M3 10v4m18-4v4"/></svg><span>SOLO</span></button><button id="listening-mute" class="tt-insp-btn flex-1 ${dev.state.muted?'is-on':''}" aria-label="Mute" aria-pressed="${!!dev.state.muted}"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M11 5 6 9H3v6h3l5 4zM16 9l5 6m0-6-5 6"/></svg><span>MUTE</span></button></div></section>`;
            if(HEADPHONE_OUTPUT_SPECS[dev.type]){const spec=HEADPHONE_OUTPUT_SPECS[dev.type];html+=`<section class="headphone-output-specs" aria-label="Saída de fones"><div class="headphone-output-heading"><span>Saída de fones</span><span aria-hidden="true">♫</span></div><dl><div><dt>Tensão máx.</dt><dd>${spec.voltsRms} V RMS</dd></div><div><dt>Corrente · canal</dt><dd>${Math.round(spec.currentRms*1000)} mA RMS</dd></div><div><dt>Resistência saída</dt><dd>${spec.outputOhms} Ω</dd></div></dl></section>`;}
            if(HP_TYPES.has(dev.type)&&dev.type!=='hpMax')html+=`<p class="text-sm text-gray-300">Impedância fixa: ${dev.state.headphoneOhms} Ω. A impedância, a resistência de saída e os limites de tensão/corrente do amplificador afetam o sinal.</p>`;
            const amp=POWER_OUTPUT_TYPES.has(dev.type),passive=isPassiveLoad(dev);
            if(amp||passive){
                const spec=FIXED_AMP_SPECS[dev.type],recommended=['spkPassiveGridBlack','spkPassiveGridOrange'].includes(dev.type)||!!(FLOOR_SPEAKERS[dev.type]||BOOKSHELF_SPEAKERS[dev.type])&&dev.type!=='shelfWood';
                const fields=amp?[["power",'Potência por canal',`${dev.state.ratedWatts} W / 8 Ω`],["impedance",'Carga mínima simulada',`${dev.state.minOhms} Ω`],["load",'Potência por carga',Object.entries(spec.powerByOhms).map(([r,p])=>`${p} W / ${r} Ω`).join(' · ')]]:[["impedance",PASSIVE_SUB_TYPES.has(dev.type)?'Impedância por bobina isolada':'Impedância nominal',`${dev.state.speakerOhms} Ω`],["power",recommended?'Amplificação recomendada':'Potência nominal suportada',`${dev.state.speakerWatts} W`]];
                const icons={power:'W',impedance:'Ω',load:'W'};
                html+=`<section class="model-specs"><div class="model-specs-heading"><span>Características do modelo</span></div><dl class="model-specs-grid">${fields.map(([kind,label,value])=>`<div class="model-spec" data-kind="${kind}"><dt><span class="model-spec-icon" aria-hidden="true">${icons[kind]}</span>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><div id="power-load-status" class="model-specs-status"></div></section>`;
            }
            if(PASSIVE_SUB_TYPES.has(dev.type))html+='<p class="text-xs text-gray-400">Entradas L/R representam bobinas eletricamente isoladas. A potência total soma as duas bobinas; não una saídas de amplificadores entre si.</p>';
            return html;
        }
        function bindListeningInspector(dev){
            ['solo','muted'].forEach(key=>{
                document.getElementById(key==='solo'?'listening-solo':'listening-mute')?.addEventListener('click',()=>{
                    dev.state[key]=!dev.state[key];updateListeningControls();selectDevice(dev.id,true);
                });
            });
            updateListeningControls();
        }
        function applyCableAppearance(connection){
            const hidden=!!state.hideCables||!!connection.hidden;
            connection.el.style.display=hidden?'none':'';
            connection.el.querySelectorAll('.cable-path,.wire-braid-red').forEach(path=>{
                if(connection.color)path.style.setProperty('stroke',connection.color,'important');else path.style.removeProperty('stroke');
            });
            let label=connection.el.querySelector('.cable-user-label');
            if(connection.label){
                if(!label){label=document.createElementNS('http://www.w3.org/2000/svg','text');label.classList.add('cable-user-label');connection.el.appendChild(label);}
                label.textContent=connection.label;
                const path=connection.el.querySelector('.cable-path,.wire-braid-red');
                if(path){const point=path.getPointAtLength(path.getTotalLength()/2);label.setAttribute('x',point.x);label.setAttribute('y',point.y-9);}
            }else label?.remove();
        }
        function renderCableProperties(){
            let panel=document.getElementById('cable-properties');
            if(!panel){panel=document.createElement('section');panel.id='cable-properties';panel.className='p-5 border-t border-gray-700 flex flex-col gap-3';document.getElementById('inspector').appendChild(panel);}
            const connection=state.selectedConnection;panel.hidden=!connection;
            if(!connection)return;
            panel.innerHTML='<h3 class="text-sm font-semibold text-gray-200">Organizar cabo</h3><label class="text-sm text-gray-300 flex flex-col gap-2">Etiqueta<input id="cable-label" type="text" maxlength="60" class="p-2 rounded bg-gray-800 border border-gray-600 text-gray-100" placeholder="Ex.: CD → Equalizador"></label><div class="flex flex-col gap-3"><div class="flex items-center justify-between"><span class="text-sm text-gray-300">Cor</span><button id="cable-color-reset" type="button" class="text-xs text-blue-300">Padrão</button></div><div id="cable-color-palette" class="cable-color-palette" role="group" aria-label="Cor do cabo"></div></div><button id="cable-visibility" class="tt-insp-btn"></button><p class="text-xs text-gray-400">Ocultar altera apenas o visual; o áudio continua passando.</p>';
            const out=document.getElementById(connection.outId),input=document.getElementById(connection.inId);
            if(out&&input){const info=document.createElement('p');info.className='cable-signal-summary';info.textContent=`Transporta ${portSignalLabel(out)} → entrada espera ${portSignalLabel(input)}. ${getPortCompatibility(out,input).reason}`;panel.insertBefore(info,panel.children[1]);}
            const slackControl=document.createElement('div');slackControl.className='flex flex-col gap-3';
            slackControl.innerHTML='<span class="text-sm text-gray-300">Folga</span><div class="grid grid-cols-3 gap-2" role="group" aria-label="Folga do cabo"></div>';
            const slackGroup=slackControl.querySelector('[role="group"]');
            const currentSlack=(connection.slack??5)<=2?0:(connection.slack??5)>=8?10:5;
            [[0,'Esticado'],[5,'Normal'],[10,'Solto']].forEach(([value,name])=>{
                const button=document.createElement('button');button.type='button';button.className='tt-insp-btn'+(currentSlack===value?' is-on':'');button.textContent=name;button.setAttribute('aria-pressed',String(currentSlack===value));
                button.addEventListener('click',()=>{connection.slack=value;[...slackGroup.children].forEach(item=>{const active=item===button;item.classList.toggle('is-on',active);item.setAttribute('aria-pressed',String(active));});updateCables();scheduleProjectSave();});slackGroup.appendChild(button);
            });panel.appendChild(slackControl);
            const label=panel.querySelector('#cable-label');label.value=connection.label||'';
            label.addEventListener('input',()=>{connection.label=label.value;applyCableAppearance(connection);});
            const colors=[['Vermelho','#ef4444'],['Laranja','#f97316'],['Amarelo','#facc15'],['Verde','#22c55e'],['Azul','#60a5fa'],['Violeta','#a78bfa'],['Branco','#e5e7eb'],['Cinza','#64748b']];
            const palette=panel.querySelector('#cable-color-palette');
            colors.forEach(([name,color])=>{
                const button=document.createElement('button');button.type='button';button.className='cable-color-swatch';
                button.style.setProperty('--swatch-color',color);button.title=name;button.setAttribute('aria-label',name);
                button.setAttribute('aria-pressed',String(connection.color===color));
                button.onclick=()=>{
                    connection.color=color;applyCableAppearance(connection);
                    [...palette.children].forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
                };
                palette.appendChild(button);
            });
            panel.querySelector('#cable-color-reset').onclick=()=>{delete connection.color;applyCableAppearance(connection);renderCableProperties();};
            const visibility=panel.querySelector('#cable-visibility');visibility.textContent='VISIBILIDADE DO CABO';visibility.setAttribute('aria-pressed',String(!connection.hidden));visibility.classList.toggle('is-on',!connection.hidden);
            visibility.onclick=()=>{connection.hidden=!connection.hidden;applyCableAppearance(connection);renderCableProperties();};
        }

        function wireSpeakerIn(dev, stereo = false) {
            dev.analyzer = state.audioCtx.createAnalyser();
            dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            if (stereo) {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                const compact=dev.type==='spkActiveCompact';
                const summer = compact?state.audioCtx.createChannelMerger(2):state.audioCtx.createGain();
                // A porta RCA mono das caixas ativas usa este mesmo ponto de entrada.
                dev.nodes.in = summer;
                if(compact){
                    dev.nodes.inR.connect(summer,0,1);dev.nodes.inL.connect(summer,0,0);
                    dev.nodes.inStereo=state.audioCtx.createGain();
                    dev.auxSplitter=state.audioCtx.createChannelSplitter(2);
                    dev.nodes.inStereo.connect(dev.auxSplitter);
                    dev.auxSplitter.connect(dev.nodes.inL,0);dev.auxSplitter.connect(dev.nodes.inR,1);
                }else{dev.nodes.inR.connect(summer);dev.nodes.inL.connect(summer);}
                dev.volumeNode = state.audioCtx.createGain();
                summer.connect(dev.volumeNode);
                dev.volumeNode.connect(dev.powerGain);
            } else {
                dev.nodes.in = state.audioCtx.createGain();
                dev.nodes.in.connect(dev.powerGain);
            }
            dev.listeningProfile=LISTENING_PROFILES[dev.type];
            let output=dev.powerGain;
            dev.voicingNodes=[];
            if(dev.listeningProfile){
                // Identical filters process both channels without mixing L and R.
                const trim=state.audioCtx.createGain();
                trim.gain.value=10**((dev.listeningProfile.headroomDb??-4)/20);
                output.connect(trim);output=trim;dev.voicingNodes.push(trim);
                if(dev.listeningProfile.bassAlignment||dev.listeningProfile.filterSpecs){
                    const specs=dev.listeningProfile.bassAlignment?floorListeningFilters(dev.listeningProfile,state.audioCtx.sampleRate):dev.listeningProfile.filterSpecs;
                    specs.forEach(spec=>{
                        const coefficients=speakerFilterCoefficients(spec,state.audioCtx.sampleRate);
                        const filter=state.audioCtx.createIIRFilter(coefficients.feedforward,coefficients.feedback);
                        output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                    });
                }else{
                if(dev.listeningProfile.highpass){
                    const filter=state.audioCtx.createBiquadFilter();filter.type='highpass';filter.frequency.value=dev.listeningProfile.highpass;filter.Q.value=Math.SQRT1_2;
                    output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                }
                ['lowshelf','peaking','highshelf'].forEach((type,index)=>{
                    const filter=state.audioCtx.createBiquadFilter();
                    filter.type=type;filter.frequency.value=[120,1600,5500][index];
                    filter.Q.value=.7;filter.gain.value=dev.listeningProfile.bands[index];
                    output.connect(filter);output=filter;dev.voicingNodes.push(filter);
                });
                }
            }
            output.connect(dev.analyzer);
            if (PASSIVE_SPK.has(dev.type) || ACTIVE_SPK.has(dev.type)) {
                dev.outputPan = state.audioCtx.createStereoPanner();
                dev.analyzer.connect(dev.outputPan);
                dev.outputPan.connect(state.masterGain);
            } else dev.analyzer.connect(state.masterGain);
        }

        function setMixerVolume(dev, channel, value) {
            const level = Math.max(0, Math.min(1, Number(value)));
            dev.state.channelVolumes ||= [0.8, 0.8, 0.8];
            dev.state.channelVolumes[channel] = level;
            ['R', 'L'].forEach(side => { if (dev.channelGains?.[channel]?.[side]) dev.channelGains[channel][side].gain.setTargetAtTime(level, state.audioCtx.currentTime, 0.015); });
            const output = dev.el.querySelector(`[data-mixer-value="${channel}"]`);
            if (output) output.textContent = `${Math.round(level * 100)}%`;
            const onDevice = dev.el.querySelector(`[data-mixer-channel="${channel}"]`);
            if (onDevice && Number(onDevice.value) !== level) onDevice.value = String(level);
            const label = document.getElementById(`lbl-mixer-${channel}`);
            if (label) label.textContent = `${Math.round(level * 100)}%`;
            updateCableFlows();
        }

        let audioUnlocked=false,audioPrimed=false,legacyPlaybackAudio=null;
        const isAppleTouchDevice=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
        function configurePlaybackSession(){
            try{
                if(navigator.audioSession){
                    if(navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';
                    return navigator.audioSession.type==='playback';
                }
            }catch{ /* Older Safari versions have no writable Audio Session API. */ }
            return false;
        }
        function prepareLegacyPlayback(){
            if(configurePlaybackSession()||!isAppleTouchDevice())return;
            if(!legacyPlaybackAudio){
                // Older iOS routes Web Audio through the ringer. A silent media session
                // selects the media output without changing the simulator's audio graph.
                const samples=8000,bytes=new Uint8Array(44+samples),view=new DataView(bytes.buffer);
                const text=(offset,value)=>[...value].forEach((letter,i)=>bytes[offset+i]=letter.charCodeAt(0));
                text(0,'RIFF');view.setUint32(4,36+samples,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true);view.setUint32(28,8000,true);view.setUint16(32,1,true);view.setUint16(34,8,true);text(36,'data');view.setUint32(40,samples,true);bytes.fill(128,44);
                legacyPlaybackAudio=document.createElement('audio');
                legacyPlaybackAudio.loop=true;legacyPlaybackAudio.preload='auto';legacyPlaybackAudio.setAttribute('playsinline','');legacyPlaybackAudio.disableRemotePlayback=true;
                legacyPlaybackAudio.src=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));
            }
            if(legacyPlaybackAudio.paused)legacyPlaybackAudio.play()?.catch(()=>{});
        }
        function initAudio() {
            if (state.audioCtx) return;
            configurePlaybackSession();
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)({latencyHint:'interactive'});
            state.masterGain = state.audioCtx.createGain();
            // Add a little more listening level while leaving headroom for summed sources.
            state.masterGain.gain.value = 0.7;
            setupRoomAudio();
            state.audioCtx.addEventListener('statechange', () => {
                if(state.audioCtx.state==='running')audioUnlocked=true;
                updateCableFlows();
            });
        }
        function activateAudioFromGesture(event){
            if(!event.isTrusted||document.visibilityState==='hidden')return;
            if(event.type==='pointerdown'&&(event.pointerType==='touch'||event.button!==0))return;
            if(event.type==='keydown'&&(event.repeat||event.ctrlKey||event.metaKey||event.altKey||['Shift','Control','Alt','Meta','Escape'].includes(event.key)))return;
            try{
                initAudio();const context=state.audioCtx;
                prepareLegacyPlayback();
                // Start inside the trusted gesture, before any await. Touch Safari may
                // ignore pointerdown but accepts touchend/click and a started buffer.
                if(!audioPrimed){
                    const source=context.createBufferSource();source.buffer=context.createBuffer(1,1,context.sampleRate);source.connect(context.destination);
                    source.onended=()=>{audioPrimed=true;source.disconnect();};source.start(0);
                }
                if(context.state==='running')audioUnlocked=true;
                else context.resume().then(()=>{audioUnlocked=context.state==='running'||audioUnlocked;updateCableFlows();}).catch(()=>{});
            }catch{ /* Playback controls can retry when the browser allows audio. */ }
        }
        for(const name of ['pointerdown','pointerup','touchend','click','keydown'])document.addEventListener(name,activateAudioFromGesture,{capture:true,passive:true});
        function resumeAudioAfterReturn(){
            const context=state.audioCtx;
            if(!audioUnlocked||!context||document.visibilityState==='hidden'||context.state==='closed')return;
            prepareLegacyPlayback();
            if(context.state!=='running')context.resume().then(()=>updateCableFlows()).catch(()=>{});
        }
        document.addEventListener('visibilitychange',()=>{
            if(document.visibilityState==='hidden')legacyPlaybackAudio?.pause();
            else resumeAudioAfterReturn();
        });
        window.addEventListener('pageshow',resumeAudioAfterReturn);
        window.addEventListener('focus',resumeAudioAfterReturn);
        window.addEventListener('pagehide',()=>legacyPlaybackAudio?.pause());

        const uiSoundTimes = {};
        let uiNoiseBuffer=null,uiEffectsGain=null,uiEffectsLimiter=null;
        const interactionGain=value=>Math.min(1.4,Math.max(0,value)*1.3);
        function ensureUiEffectsBus(context){
            if(uiEffectsGain)return;
            uiEffectsGain=context.createGain();uiEffectsGain.gain.value=interactionGain(state.uiSoundVolume??.9);
            uiEffectsLimiter=context.createDynamicsCompressor();uiEffectsLimiter.threshold.value=-14;uiEffectsLimiter.knee.value=12;uiEffectsLimiter.ratio.value=6;uiEffectsLimiter.attack.value=.003;uiEffectsLimiter.release.value=.12;
            uiEffectsGain.connect(uiEffectsLimiter);uiEffectsLimiter.connect(context.destination);
        }
        const uiSoundProfiles={
            click:{duration:.065,frequency:1100,noise:.09,tone:210,body:.014},
            receiverClick:{duration:.048,frequency:1800,noise:.115,tone:155,body:.018},
            pickup:{duration:.12,frequency:420,noise:.075,tone:105,body:.04},
            drop:{duration:.155,frequency:320,noise:.10,tone:85,body:.055},
            feet:{duration:.12,frequency:1900,noise:.045,tone:980,body:.17},
            feetRetract:{duration:.12,frequency:1900,noise:.045,tone:980,body:.17},
            connect:{duration:.095,frequency:1350,noise:.085,tone:240,body:.012},
            disconnect:{duration:.12,frequency:720,noise:.075,tone:165,body:.012},
            adjust:{duration:.055,frequency:950,noise:.04,tone:0,body:0},
            catalogGear:{duration:.024,frequency:1350,noise:.009,tone:185,body:.0015,attack:.0015,lowpass:2400,ring:2100,ringLevel:.0006,cooldown:28},
            discard:{duration:.13,frequency:2400,noise:.20,tone:95,body:.045},
            ...Hardware.buttonSounds,
            ...Hardware.movementSounds
        };
        function prepareUiAudio(){
            initAudio();const context=state.audioCtx;
            ensureUiEffectsBus(context);
            if(!uiNoiseBuffer){
                uiNoiseBuffer=context.createBuffer(1,context.sampleRate,context.sampleRate);
                const data=uiNoiseBuffer.getChannelData(0);let smooth=0;
                for(let i=0;i<data.length;i++){smooth=.65*smooth+.35*(Math.random()*2-1);data[i]=smooth;}
            }
        }
        document.addEventListener('pointerover',()=>{try{prepareUiAudio();}catch{}},{once:true,passive:true});
        document.addEventListener('pointerdown',event=>{
            if(event.button!==0)return;
            try{prepareUiAudio();}catch{}
            const control=event.target.closest('button,input,select,textarea,.port,.speaker-grille,.grille-restore,[role="button"]');
            if(!control&&event.target.closest('.device-node,.catalog-item'))playUiSound('pickup');
        },{capture:true});
        async function playUiSound(kind = 'click', options = {}) {
            if(state.restoringProject)return;
            const now=performance.now(),profile=uiSoundProfiles[kind]||uiSoundProfiles.click;
            if(now-(uiSoundTimes[kind]??-Infinity)<(profile.cooldown??(kind==='drag'?140:kind==='adjust'?95:55)))return;
            uiSoundTimes[kind]=now;
            if(state.uiSoundVolume===0)return;
            try{
                initAudio();const context=state.audioCtx;
                if(context.state!=='running')await context.resume();
                if(context.state!=='running')return;
                prepareUiAudio();
                const variation=(.94+Math.random()*.12)*(options.pitch??1);
                const burst=(delay,level=1)=>{
                    const time=context.currentTime+delay,duration=profile.duration;
                    const noise=context.createBufferSource(),filter=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain();
                    noise.buffer=uiNoiseBuffer;filter.type='bandpass';filter.frequency.value=profile.frequency*variation*(kind==='discard'?.7+Math.random()*.9:1);filter.Q.value=profile.resonance??(kind==='discard'?1.5:.65);
                    const wooden=kind==='pickup'||kind==='drop',bubble=kind==='feet'||kind==='feetRetract';
                    low.type='lowpass';low.frequency.value=profile.lowpass??(wooden?1400:kind==='receiverClick'?4300:kind==='discard'?5600:2200);
                    const constructionLevel=(kind.startsWith('move')?1.8:kind.startsWith('hw')?1.5:1.35)*(options.level??1);
                    gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(profile.noise*level*constructionLevel,time+(profile.attack??(wooden||bubble||kind==='discard'||kind==='receiverClick'?.0015:Math.min(.012,duration*.18))));gain.gain.exponentialRampToValueAtTime(.00001,time+duration);
                    noise.connect(filter);filter.connect(low);low.connect(gain);gain.connect(uiEffectsGain);
                    noise.onended=()=>{noise.disconnect();filter.disconnect();low.disconnect();gain.disconnect();};
                    noise.start(time,Math.random()*.6,duration);
                    if(profile.tone){
                        const tone=context.createOscillator(),body=context.createGain();tone.type='sine';tone.frequency.value=profile.tone*variation;
                        if(wooden)tone.frequency.exponentialRampToValueAtTime(profile.tone*variation*.72,time+.045);
                        if(bubble){tone.frequency.exponentialRampToValueAtTime(260*variation,time+.025);tone.frequency.exponentialRampToValueAtTime(130*variation,time+.075);}
                        body.gain.setValueAtTime(0,time);body.gain.linearRampToValueAtTime(profile.body*level*constructionLevel,time+(profile.attack??(wooden||bubble||kind==='receiverClick'?.002:.008)));body.gain.exponentialRampToValueAtTime(.00001,time+duration);
                        tone.connect(body);body.connect(uiEffectsGain);tone.onended=()=>{tone.disconnect();body.disconnect();};tone.start(time);tone.stop(time+duration);
                    }
                    if(profile.ring){
                        const ring=context.createOscillator(),ringGain=context.createGain();ring.type='sine';ring.frequency.value=profile.ring*variation;
                        ringGain.gain.setValueAtTime(0,time);ringGain.gain.linearRampToValueAtTime(profile.ringLevel*level*constructionLevel,time+.001);ringGain.gain.exponentialRampToValueAtTime(.00001,time+duration);
                        ring.connect(ringGain);ringGain.connect(uiEffectsGain);ring.onended=()=>{ring.disconnect();ringGain.disconnect();};ring.start(time);ring.stop(time+duration);
                    }
                };
                burst(0);
                if(profile.bounce)burst(profile.bounce,profile.bounceLevel??.25);
                if(kind==='connect')burst(.042,.45);
                if(kind==='receiverClick')burst(.018,.38);
                if(kind==='discard'){burst(.023,.62);burst(.061,.35);burst(.104,.16);}
            }catch(error){ /* Feedback is optional when audio is unavailable. */ }
        }
        function enableCatalogScrollSound(element){
            const scrollKeys=new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ']);
            let armed=false,inputType='',lastPosition=element.scrollTop,lastTime=performance.now(),lastMovement=0,distance=0,speed=0;
            function arm(event){
                if(!event.isTrusted||event.ctrlKey||event.metaKey)return;
                if(event.type==='keydown'&&(!scrollKeys.has(event.key)||event.target.closest('input,select,textarea,[contenteditable]')))return;
                const now=performance.now();
                if(!armed||now-lastMovement>220){lastPosition=element.scrollTop;lastTime=now;distance=0;speed=0;}
                armed=true;inputType=event.type==='wheel'?'wheel':event.type==='keydown'?'keyboard':event.pointerType;lastMovement=now;
            }
            for(const type of ['wheel','pointerdown','keydown'])element.addEventListener(type,arm,{capture:true,passive:true});
            element.addEventListener('scroll',()=>{
                const now=performance.now(),position=element.scrollTop,travel=Math.abs(position-lastPosition),elapsed=Math.max(8,now-lastTime);
                lastPosition=position;lastTime=now;
                if(!armed||(inputType==='wheel'&&!wheelScrollMotions.get(element)?.frame)||now-lastMovement>220||state.restoringProject||document.visibilityState!=='visible'||!element.clientHeight||getComputedStyle(element).visibility==='hidden'){
                    armed=false;distance=0;return;
                }
                lastMovement=now;
                speed+=(travel*1000/elapsed-speed)*.4;
                distance+=travel;
                // Each tooth follows actual travel, including native touch and wheel inertia.
                // Discard excess travel instead of queuing sounds after the list has stopped.
                if(distance<16)return;
                distance%=16;
                if(state.uiSoundVolume===0||state.audioCtx?.state!=='running')return;
                const intensity=Math.min(1,speed/1400);
                playUiSound('catalogGear',{level:.4+intensity*.55,pitch:.85+intensity*.35});
            },{passive:true});
        }
        enableCatalogScrollSound(equipmentCatalog.querySelector('.overflow-y-auto'));
        let cableHumVoice=null,cableHumRequest=0;
        function stopCableHum(){
            cableHumRequest++;
            const voice=cableHumVoice;cableHumVoice=null;
            if(!voice)return;
            const now=state.audioCtx.currentTime;
            voice.gain.gain.cancelAndHoldAtTime(now);
            voice.gain.gain.linearRampToValueAtTime(0,now+.006);
            voice.oscillator.stop(now+.008);
        }
        async function startCableHum(){
            stopCableHum();const request=cableHumRequest;
            try{
                initAudio();const context=state.audioCtx;
                if(context.state!=='running')await context.resume();
                if(request!==cableHumRequest||!isPatching||context.state!=='running')return;
                prepareUiAudio();
                uiEffectsGain.gain.setTargetAtTime(interactionGain(state.uiSoundVolume??.9),context.currentTime,.02);
                const oscillator=context.createOscillator(),filter=context.createBiquadFilter(),gain=context.createGain();
                const real=new Float32Array(7),imag=new Float32Array([0,1,.28,.16,.07,.03,.02]);
                oscillator.setPeriodicWave(context.createPeriodicWave(real,imag));oscillator.frequency.value=60;
                filter.type='lowpass';filter.frequency.value=650;filter.Q.value=.5;
                gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(.035,context.currentTime+.035);
                oscillator.connect(filter);filter.connect(gain);gain.connect(uiEffectsGain);
                oscillator.onended=()=>{oscillator.disconnect();filter.disconnect();gain.disconnect();};
                oscillator.start();cableHumVoice={oscillator,gain};
            }catch(error){ /* Cable feedback remains optional if audio is blocked. */ }
        }
        function cancelCableDrag(){
            stopCableHum();
            if(!isPatching)return;
            tempCableEl?.remove();hoveredTargetPort?.classList.remove('port-highlight');
            isPatching=false;startPort=null;tempCableEl=null;hoveredTargetPort=null;hoveredGuidancePort=null;
            dragPhysics.activeTarget=null;updatePortGuidance();
        }
        window.addEventListener('pointerup',stopCableHum,{capture:true});
        window.addEventListener('blur',cancelCableDrag);
        window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelCableDrag();},{capture:true});
        const soundControls=document.createElement('div');
        soundControls.className='flex flex-col gap-2 mb-4';
        soundControls.innerHTML='<label for="ui-sound-volume" class="text-xs text-gray-400">Sons de interação <span id="ui-sound-value">90%</span></label><input id="ui-sound-volume" aria-label="Volume dos sons de interação; zero silencia" type="range" min="0" max="100" step="5" value="90">';
        clearCatalogFooter.prepend(soundControls);
        soundControls.querySelector('input').addEventListener('input',event=>{
            state.uiSoundVolume=Number(event.target.value)/100;
            document.getElementById('ui-sound-value').textContent=state.uiSoundVolume?`${event.target.value}%`:'desligados';
            uiEffectsGain?.gain.setTargetAtTime(interactionGain(state.uiSoundVolume),state.audioCtx.currentTime,.02);
        });
        const sliderSoundValues=new WeakMap();
        document.addEventListener('focusin',event=>{
            if(event.target.matches('input[type="range"]'))sliderSoundValues.set(event.target,Number(event.target.value));
        });
        document.addEventListener('pointerdown',event=>{
            if(event.target.matches('input[type="range"]'))sliderSoundValues.set(event.target,Number(event.target.value));
        },{capture:true});
        document.addEventListener('input',event=>{
            const el=event.target;
            if(!event.isTrusted||!el.matches('input[type="range"]')||el.id==='ui-sound-volume')return;
            const value=Number(el.value),previous=sliderSoundValues.get(el);
            sliderSoundValues.set(el,value);
            if(previous!==undefined&&Math.abs(value-previous)<1e-7)return;
            playUiSound(Hardware.movementSound(el,'slider'));
        });
        function controlClickSound(control){
            if(control.matches('[role="slider"]'))return 'click';
            const device=control.closest('.device-type-receiver,.device-type-powerAmp');
            const inspectorReceiver=control.closest('#inspector')&&RADIO_RECEIVERS.has(state.devices[state.selectedDeviceId]?.type)&&control.matches('[data-receiver-inspector-input],#radio-input-toggle,#inspector-power-toggle');
            return device||inspectorReceiver?'receiverClick':'click';
        }
        document.addEventListener('pointerdown',event=>{
            const control=event.target.closest('button,input[type="checkbox"],[role="button"]');
            if(event.button===0&&control&&!control.disabled&&!control.hasAttribute('data-hardware-feedback')&&!control.matches('[role="slider"],[data-hardware-linear]'))playUiSound(controlClickSound(control));
        },{capture:true});
        document.addEventListener('click',event=>{
            const control=event.target.closest('button,input[type="checkbox"],[role="button"]');
            if(event.detail===0&&control&&!control.disabled&&!control.hasAttribute('data-hardware-feedback')&&!control.matches('[role="slider"],[data-hardware-linear]'))playUiSound(controlClickSound(control));
        },{capture:true});
        document.addEventListener('change', event => {
            if (event.target.matches('select')) playUiSound('click');
        });

        function playNote(freq, type, duration, vol, timeOffset, destNode) {
            if (!state.audioCtx) return;
            const osc = state.audioCtx.createOscillator();
            const gain = state.audioCtx.createGain();
            osc.type = type; osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, state.audioCtx.currentTime + timeOffset);
            gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + timeOffset + duration);
            osc.connect(gain); gain.connect(destNode);
            osc.start(state.audioCtx.currentTime + timeOffset);
            osc.stop(state.audioCtx.currentTime + timeOffset + duration);
        }

        function sourcePosition(dev) {
            if (!dev.audioBuffer) return 0;
            const playback = dev.filePlayback;
            let position = (dev.fileOffset || 0) + (playback ? (state.audioCtx.currentTime - playback.startedAt) * playback.rate : 0);
            if (dev.state.repeat) position %= dev.audioBuffer.duration;
            return Math.max(0, Math.min(dev.audioBuffer.duration, position));
        }
        function formatAudioTime(seconds) {
            const value = Math.max(0, Math.floor(seconds || 0));
            return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`;
        }
        function seekSource(dev, seconds) {
            if (!dev.audioBuffer) return;
            stopFilePlayback(dev);
            dev.fileOffset = Math.max(0,Math.min(dev.audioBuffer.duration,seconds));
            if (dev.fileOffset === dev.audioBuffer.duration && !dev.state.repeat) setSourcePlaying(dev,false);
            else startFilePlayback(dev);
            updateRealtimePanels(performance.now(),true);
        }
        function transportInspectorHtml(dev) {
            return `<div class="audio-transport"><label for="source-progress">Transporte da música</label><div class="transport-time"><span id="source-position">${formatAudioTime(sourcePosition(dev))}</span><span>${formatAudioTime(dev.audioBuffer.duration)}</span></div><input id="source-progress" type="range" min="0" max="${dev.audioBuffer.duration}" step="0.1" value="${sourcePosition(dev)}" aria-label="Posição da faixa"><div class="transport-buttons"><button class="tt-insp-btn" id="source-rewind" title="Retroceder 10 segundos">−10 s</button><button class="tt-insp-btn" id="source-forward" title="Avançar 10 segundos">+10 s</button><button class="tt-insp-btn ${dev.state.repeat?'is-on':''}" id="source-repeat" aria-pressed="${!!dev.state.repeat}">REPETIR</button></div></div>`;
        }
        function bindTransportInspector(dev) {
            document.getElementById('source-progress').addEventListener('input',event=>seekSource(dev,Number(event.target.value)));
            document.getElementById('source-rewind').addEventListener('click',()=>seekSource(dev,sourcePosition(dev)-10));
            document.getElementById('source-forward').addEventListener('click',()=>seekSource(dev,sourcePosition(dev)+10));
            document.getElementById('source-repeat').addEventListener('click',event=>{
                stopFilePlayback(dev);
                dev.state.repeat=!dev.state.repeat;
                startFilePlayback(dev);
                event.currentTarget.classList.toggle('is-on',dev.state.repeat);
                event.currentTarget.setAttribute('aria-pressed',String(dev.state.repeat));
            });
        }
        const RECEIVER_INPUTS=[['line1','LINHA 1'],['line2','LINHA 2'],['line3','LINHA 3'],['phono','PHONO'],['fm','FM']];
        function receiverConnectionsMarkup(type){
            const pair=(io,node,format,signal)=>`<div class="receiver-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${node==='in'?'Linha 1':node==='line2'?'Linha 2':node==='line3'?'Linha 3':node==='phono'?'Phono':signal==='amplified'?'Saída para caixa passiva':'Saída de linha'} · ${ch}"></div>`).join('')}</div>`;
            const group=(name,ports)=>`<div class="receiver-connection"><span>${name}</span>${ports}</div>`;
            return `<div class="receiver-input-bank">${[['LINHA 1','in'],['LINHA 2','line2'],['LINHA 3','line3'],['PHONO','phono']].map(([name,node])=>group(name,pair('in',node,'rca',node==='phono'?'phono':'line'))).join('')}</div><div class="receiver-output-bank">${group('LINE OUT',pair('out',type==='receiver'?'out':'lineOut','rca','line'))}${group('SPEAKERS · L/R',pair('out',type==='receiver'?'spkOut':'out','wire','amplified'))}${group('SUB · MONO','<div class="port" data-type="rca" data-io="out" data-node="outSub" data-signal="line" data-role="lfe-out" title="Saída de linha mono para subwoofer"></div>')}${group('PHONES · P10','<div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída estéreo para fones P10"></div>')}</div>`;
        }
        function receiverSourceButtons(){return `<div class="receiver-source-buttons" role="group" aria-label="Fonte do receiver">${RECEIVER_INPUTS.map(([key,label])=>`<button type="button" data-receiver-input="${key}" aria-pressed="${key==='line1'}"><span>${label}</span></button>`).join('')}</div>`;}
        const RADIO_RECEIVERS=new Set(['receiver','powerAmp']);
        let receiverRadioNoiseBuffer=null;
        const FM_SCALE={min:87.5,max:108,step:.5};
        const fmScalePosition=frequency=>5+(frequency-FM_SCALE.min)/(FM_SCALE.max-FM_SCALE.min)*90;
        const snapFmStation=frequency=>Math.round(frequency/FM_SCALE.step)*FM_SCALE.step;
        const randomFmStation=()=>89+Math.floor(Math.random()*35)*FM_SCALE.step;

        function radioReception(frequency,station){
            const distance=Math.abs(frequency-station);
            return Math.exp(-((distance/.24)**2));
        }
        function setupReceiverRadio(dev){
            const ctx=state.audioCtx;
            Object.assign(dev.state,{receiverInput:'line1',radioOn:false,radioFrequency:88,radioStation:randomFmStation()});
            dev.radioMusic={};dev.radioLine={};dev.receiverInputGates=[];dev.receiverInputNodes=[];
            ['L','R'].forEach(ch=>{
                const target=dev.receiverRadioTargets[ch],line=dev.radioLine[ch]=ctx.createGain(),music=dev.radioMusic[ch]=ctx.createGain();
                dev.nodes['in'+ch].disconnect(target);line.connect(target);music.gain.value=0;music.connect(target);
                for(const [key] of RECEIVER_INPUTS.filter(([key])=>key!=='fm')){
                    const input=key==='line1'?dev.nodes['in'+ch]:(dev.nodes[key+ch]=ctx.createGain()),gate=ctx.createGain();
                    gate.gain.value=key==='line1'?1:0;dev.receiverInputGates.push({gate,key});dev.receiverInputNodes.push(gate);
                    if(key==='phono'){
                        const low=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),gain=ctx.createGain();
                        low.type='lowshelf';low.frequency.value=120;low.gain.value=9;high.type='highshelf';high.frequency.value=2122;high.gain.value=-9;gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        input.connect(low);low.connect(high);high.connect(gain);connectPhonoPlayback(dev,gain,gate);dev.receiverInputNodes.push(low,high,gain);
                    }else input.connect(gate);
                    gate.connect(line);
                }

            });
            if(dev.type==='powerAmp'){
                const sum=ctx.createGain();sum.gain.value=.5;const low=ctx.createBiquadFilter();low.type='lowpass';low.frequency.value=120;low.Q.value=.707;
                dev.nodes.outSub=ctx.createGain();dev.nodes.outPhone=ctx.createChannelMerger(2);dev.receiverInputNodes.push(sum,low);
                ['L','R'].forEach((ch,index)=>{const out=dev.nodes['lineOut'+ch]=ctx.createGain();out.gain.value=.74;dev.nodes['out'+ch].connect(out);out.connect(sum);out.connect(dev.nodes.outPhone,0,index);});
                sum.connect(low);low.connect(dev.nodes.outSub);
            }
            dev.selectReceiverInput=key=>{
                if(!RECEIVER_INPUTS.some(([value])=>value===key))return;
                dev.state.receiverInput=key;dev.state.radioOn=key==='fm';dev.syncRadio();updateCableFlows();scheduleProjectSave();
            };
            dev.el.querySelectorAll('[data-receiver-input]').forEach(button=>{button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',()=>{dev.selectReceiverInput(button.dataset.receiverInput);if(dev.state.radioOn)ctx.resume().then(()=>{if(state.devices[dev.id]){dev.syncRadio();updateCableFlows();}}).catch(()=>{});});});
            dev.radioNoiseGain=ctx.createGain();dev.radioNoiseGain.gain.value=0;
            const filter=dev.radioNoiseFilter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=6500;
            filter.connect(dev.radioNoiseGain);['L','R'].forEach(ch=>dev.radioNoiseGain.connect(dev.receiverRadioTargets[ch]));
            dev.syncRadio=()=>{
                const on=!!dev.state.radioOn&&dev.powered&&ctx.state==='running',frequency=dev.state.radioFrequency,q=dev.audioBuffer?radioReception(frequency,dev.state.radioStation):0,t=ctx.currentTime;
                ['L','R'].forEach(ch=>{dev.radioLine[ch].gain.setTargetAtTime(dev.state.radioOn?0:1,t,.025);dev.radioMusic[ch].gain.setTargetAtTime(on?q*.7:0,t,.03);});
                dev.receiverInputGates.forEach(({gate,key})=>gate.gain.setTargetAtTime(key===dev.state.receiverInput?1:0,t,.025));
                dev.el.querySelectorAll('[data-receiver-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.receiverInput===dev.state.receiverInput)));
                if(state.selectedDeviceId===dev.id)document.querySelectorAll('[data-receiver-inspector-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.receiverInspectorInput===dev.state.receiverInput)));
                dev.radioNoiseGain.gain.setTargetAtTime(on?.055*(1-q)**1.4:0,t,.025);
                if(on&&!dev.radioNoiseSource){
                    if(!receiverRadioNoiseBuffer){receiverRadioNoiseBuffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate);const data=receiverRadioNoiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;}
                    const noise=dev.radioNoiseSource=ctx.createBufferSource();noise.buffer=receiverRadioNoiseBuffer;noise.loop=true;noise.connect(filter);noise.start();
                }
                if(on&&dev.audioBuffer&&!dev.radioVoice){
                    const voice=ctx.createBufferSource(),split=ctx.createChannelSplitter(2);voice.buffer=dev.audioBuffer;voice.loop=true;voice.connect(split);split.connect(dev.radioMusic.L,0);split.connect(dev.radioMusic.R,dev.audioBuffer.numberOfChannels>1?1:0);voice.start();dev.radioVoice={voice,split};
                }
                if(!on)stopReceiverRadioVoices(dev);
                const text=dev.state.radioOn?`FM · ${frequency.toFixed(1)} MHz`:'STEREO · '+(RECEIVER_INPUTS.find(([key])=>key===dev.state.receiverInput)?.[1]||'LINHA 1');
                const display=dev.el.querySelector('.receiver-radio b,.poweramp-screen strong');if(display)display.textContent=text;
                const needle=dev.el.querySelector('.radio-tuning-needle');if(needle)needle.style.left=fmScalePosition(frequency)+'%';
                const knob=dev.el.querySelector('[data-radio-knob]');
                if(knob){knob.style.setProperty('--radio-angle',(-135+(frequency-87.5)/20.5*270)+'deg');knob.setAttribute('aria-valuenow',String(frequency));knob.setAttribute('aria-valuetext',frequency.toFixed(1)+' MHz');}
                dev.el.classList.toggle('receiver-fm-active',!!dev.state.radioOn);
                dev.el.classList.toggle('receiver-fm-tuned',!!dev.state.radioOn&&q>.9);
                updateReceiverRadioDisplay(dev,performance.now());
                if(state.selectedDeviceId===dev.id){
                    const output=document.getElementById('radio-frequency-value'),slider=document.getElementById('radio-frequency'),status=document.getElementById('radio-reception'),toggle=document.getElementById('radio-input-toggle');
                    if(output)output.textContent=frequency.toFixed(1)+' MHz';if(slider)slider.value=frequency;
                    if(status)status.textContent=!dev.state.radioOn?'Selecione FM para ouvir o rádio':!dev.audioBuffer?'Carregue um MP3 para criar uma estação':q>.9?'ESTÉREO · SINTONIZADO':q>.1?'Sinal fraco · ajuste a sintonia':'Buscando estação…';
                    if(toggle){toggle.setAttribute('aria-pressed',String(dev.state.radioOn));}
                }
            };
            dev.tuneRadio=value=>{dev.state.radioFrequency=Math.round(Math.max(87.5,Math.min(108,Number(value)||87.5))*10)/10;dev.syncRadio();scheduleProjectSave();};
            const tuningKnob=dev.el.querySelector('[data-radio-knob]');
            const activateTuner=()=>{if(!dev.state.radioOn)dev.selectReceiverInput('fm');ctx.resume().then(()=>{if(state.devices[dev.id]){dev.syncRadio();updateCableFlows();}}).catch(()=>{});};
            Hardware.bindKnob(tuningKnob,{get:()=>dev.state.radioFrequency,set:dev.tuneRadio,min:87.5,max:108,step:.1,activate:activateTuner,format:value=>value.toFixed(1)+' MHz'});
            const display=dev.el.querySelector('.receiver-radio,.poweramp-screen');
            if(display?.classList.contains('receiver-radio')){
                // The ruler and needle share one frequency-to-position conversion.
                const scale=display.querySelector('i');scale.className='fm-calibrated-scale';scale.replaceChildren();
                for(let frequency=FM_SCALE.min;frequency<=FM_SCALE.max;frequency+=FM_SCALE.step){
                    const tick=document.createElement('em');tick.className='fm-scale-tick';tick.style.left=fmScalePosition(frequency)+'%';
                    if(Number.isInteger(frequency))tick.classList.add('is-major');
                    scale.appendChild(tick);
                }
                const labels=display.querySelector('span');labels.className='fm-calibrated-labels';labels.replaceChildren();
                for(const frequency of [88,92,96,100,104,108]){const label=document.createElement('small');label.textContent=String(frequency);label.style.left=fmScalePosition(frequency)+'%';labels.appendChild(label);}
                const needle=document.createElement('em');needle.className='radio-tuning-needle';needle.setAttribute('aria-hidden','true');display.appendChild(needle);
            }
            if(display){
                display.tabIndex=0;display.setAttribute('role','group');display.setAttribute('aria-label','Sintonia FM: arraste horizontalmente ou use as setas');display.title='Sintonia FM · arraste horizontalmente ou use as setas';
                display.addEventListener('pointerdown',e=>{if(e.button!==0||!dev.state.radioOn)return;e.preventDefault();e.stopPropagation();display.setPointerCapture(e.pointerId);const x=e.clientX,frequency=dev.state.radioFrequency;
                    const move=event=>dev.tuneRadio(frequency+(event.clientX-x)/12/view.zoom);
                    const end=()=>{display.removeEventListener('pointermove',move);display.removeEventListener('pointerup',end);display.removeEventListener('pointercancel',end);display.removeEventListener('lostpointercapture',end);};
                    display.addEventListener('pointermove',move);display.addEventListener('pointerup',end);display.addEventListener('pointercancel',end);display.addEventListener('lostpointercapture',end);
                });
                display.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();dev.tuneRadio(dev.state.radioFrequency+(e.key==='ArrowRight'?.1:-.1));});
            }
            dev.syncRadio();
        }
        function updateReceiverRadioDisplay(dev,now){
            if(dev.type!=='powerAmp')return;
            const screen=dev.el.querySelector('.receiver-fm-animation');if(!screen)return;
            const on=dev.powered&&dev.state.radioOn,q=on&&dev.audioBuffer?radioReception(dev.state.radioFrequency,dev.state.radioStation):0;
            screen.style.opacity=on?'1':'.2';
            const points=[];
            for(let x=0;x<=180;x+=4){
                const frequency=dev.state.radioFrequency+(x/180-.5)*1.8,signal=on&&dev.audioBuffer?radioReception(frequency,dev.state.radioStation):0;
                const jitter=on&&!matchMedia('(prefers-reduced-motion: reduce)').matches?(Math.sin(x*1.73+now*.013)+Math.sin(x*.57-now*.009))*1.3*(1-signal):0;
                points.push(`${x?'L':'M'}${x} ${(21-signal*17-jitter).toFixed(2)}`);
            }
            screen.querySelector('[data-fm-spectrum]').setAttribute('d',points.join(' '));screen.querySelector('[data-fm-strength]').setAttribute('width',String(q*178));
        }
        let lastReceiverRadioFrame=0;
        function updateReceiverRadioDisplays(now){
            if(now-lastReceiverRadioFrame<100)return;lastReceiverRadioFrame=now;
            Object.values(state.devices).filter(dev=>dev.type==='powerAmp').forEach(dev=>updateReceiverRadioDisplay(dev,now));
        }
        function stopReceiverRadioVoices(dev){
            if(dev.radioVoice){dev.radioVoice.voice.stop();dev.radioVoice.voice.disconnect();dev.radioVoice.split.disconnect();dev.radioVoice=null;}
            if(dev.radioNoiseSource){dev.radioNoiseSource.stop();dev.radioNoiseSource.disconnect();dev.radioNoiseSource=null;}
        }
        function radioInspectorHtml(dev){
            return `<section class="flex flex-col gap-3 border-t border-gray-700 pt-4"><strong class="text-sm text-gray-200">Fonte do receiver</strong><div class="grid grid-cols-2 gap-2">${RECEIVER_INPUTS.map(([key,label])=>`<button type="button" class="tt-insp-btn" data-receiver-inspector-input="${key}" aria-pressed="${dev.state.receiverInput===key}">${label}</button>`).join('')}</div><strong class="text-sm text-gray-200">Rádio FM</strong><button type="button" id="radio-input-toggle" class="tt-insp-btn" aria-pressed="${!!dev.state.radioOn}">RÁDIO FM</button><button type="button" id="radio-load" class="tt-insp-btn">CARREGAR MP3 COMO ESTAÇÃO</button><input id="radio-file" type="file" accept="audio/mpeg,.mp3" hidden><p id="radio-file-name" class="text-xs text-gray-400 break-words"></p><div class="flex items-center justify-between gap-2"><button type="button" class="tt-insp-btn" data-radio-step="-1" aria-label="Diminuir frequência">−</button><output id="radio-frequency-value" class="text-sm font-mono">${dev.state.radioFrequency.toFixed(1)} MHz</output><button type="button" class="tt-insp-btn" data-radio-step="1" aria-label="Aumentar frequência">+</button></div><input id="radio-frequency" type="range" min="87.5" max="108" step="0.1" value="${dev.state.radioFrequency}" aria-label="Sintonia FM"><p id="radio-reception" class="text-xs text-gray-400" role="status"></p><p class="text-xs text-gray-500">Varra a faixa com o seletor ou arraste o visor do receiver até o chiado desaparecer. A faixa toca em repetição na estação encontrada.</p></section>`;
        }
        function bindRadioInspector(dev){
            const filename=document.getElementById('radio-file-name');filename.textContent=dev.fileMessage||dev.fileName||'Nenhuma estação carregada';
            const activate=async()=>{try{await state.audioCtx.resume();if(state.devices[dev.id]){dev.syncRadio();updateCableFlows();}}catch{if(state.selectedDeviceId===dev.id)filename.textContent='Não foi possível ativar o áudio. Tente novamente.';}};
            document.getElementById('radio-input-toggle').onclick=()=>{dev.selectReceiverInput(dev.state.radioOn?'line1':'fm');activate();scheduleProjectSave();updateCableFlows();};
            const fileInput=document.getElementById('radio-file');document.getElementById('radio-load').onclick=()=>fileInput.click();
            fileInput.onchange=async()=>{
                const file=fileInput.files[0];if(!file)return;const token=dev.fileLoadToken=(dev.fileLoadToken||0)+1;filename.textContent='Carregando estação…';
                try{
                    await state.audioCtx.resume();const buffer=await state.audioCtx.decodeAudioData(await file.arrayBuffer());if(!state.devices[dev.id]||dev.fileLoadToken!==token)return;
                    stopReceiverRadioVoices(dev);dev.audioBuffer=buffer;dev.mediaBlob=file;dev.mediaKey='radio_'+Date.now()+'_'+Math.random().toString(36).slice(2);dev.fileName=file.name;dev.fileMessage='';dev.state.receiverInput='fm';dev.state.radioStation=randomFmStation();dev.state.radioOn=true;
                    if(Math.abs(dev.state.radioFrequency-dev.state.radioStation)<1)dev.state.radioFrequency=87.5;dev.syncRadio();updateCableFlows();scheduleProjectSave();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);
                }catch{if(dev.fileLoadToken!==token||!state.devices[dev.id])return;dev.fileMessage='Não foi possível carregar o MP3.';if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);}
            };
            document.getElementById('radio-frequency').oninput=e=>{dev.tuneRadio(e.target.value);activate();};
            document.querySelectorAll('[data-radio-step]').forEach(button=>button.onclick=()=>{dev.tuneRadio(dev.state.radioFrequency+Number(button.dataset.radioStep)*.1);activate();});
            document.querySelectorAll('[data-receiver-inspector-input]').forEach(button=>button.onclick=()=>{dev.selectReceiverInput(button.dataset.receiverInspectorInput);activate();});
            dev.syncRadio();
        }

        function setupAudioMeters(dev) {
            const context=state.audioCtx, nodes=[], taps=[];
            const silent=context.createGain();silent.gain.value=0;silent.connect(context.destination);
            const channels=[[],[]];
            const analyze=(node,channel)=>{
                const analyzer=context.createAnalyser();analyzer.fftSize=1024;
                node.connect(analyzer);analyzer.connect(silent);taps.push([node,analyzer]);nodes.push(analyzer);
                channels[channel].push({analyzer,data:new Float32Array(1024)});
            };
            // Receiver meters measure left and right outputs directly. Auxiliary
            // mono/sub and headphone outputs must not be folded into either reading.
            const ports=RADIO_RECEIVERS.has(dev.type)?[]:[...dev.el.querySelectorAll('.port[data-io="out"]')].filter(port=>!POWER_OUTPUT_TYPES.has(dev.type)||port.dataset.type==='wire');
            if(RADIO_RECEIVERS.has(dev.type)){
                analyze(dev.nodes.spkOutL||dev.nodes.outL,0);analyze(dev.nodes.spkOutR||dev.nodes.outR,1);
            }
            const seen=new Set();
            ports.forEach(port=>{
                const node=dev.nodes[port.dataset.node];if(!node || seen.has(node))return;seen.add(node);
                if(port.dataset.channel) analyze(node,port.dataset.channel==='L'?0:1);
                else {const split=context.createChannelSplitter(2);node.connect(split);taps.push([node,split]);nodes.push(split);analyzeChannel(split);}
            });
            function analyzeChannel(node){
                [0,1].forEach(channel=>{const analyzer=context.createAnalyser();analyzer.fftSize=1024;node.connect(analyzer,channel);analyzer.connect(silent);nodes.push(analyzer);channels[channel].push({analyzer,data:new Float32Array(1024)});});
            }
            if(!ports.length&&!RADIO_RECEIVERS.has(dev.type)){const node=dev.listeningGain||dev.outputPan||dev.analyzer;if(node){const split=context.createChannelSplitter(2);node.connect(split);taps.push([node,split]);nodes.push(split);analyzeChannel(split);}}
            if(!channels.some(list=>list.length)){silent.disconnect();return;}
            dev.meters={channels,clipUntil:0,levels:[0,0],peaks:[0,0]};
            dev.disposeMeters=()=>{taps.forEach(([node,target])=>{try{node.disconnect(target)}catch{}});nodes.forEach(node=>node.disconnect());silent.disconnect();};
        }
        // Audio controls update their graphs in target handlers before this bubbles.
        inspectorContent.addEventListener('input',()=>updateCableFlows());
        window.addEventListener('pointerup',event=>{
            if(event.target instanceof Element&&event.target.closest('.integrated-knob,.receiver-dial,.bias-gain-knob,.amp4-knob,[data-pre-knob]'))updateCableFlows();
        });
        const audioDb=value=>value>0.000001?20*Math.log10(value):-Infinity;
        const audioDbText=value=>Number.isFinite(audioDb(value))?`${audioDb(value).toFixed(1)} dBFS`:'−∞ dBFS';
        let lastAudioPanelUpdate=0;
        function updateRealtimePanels(now,force=false){
            if(!force&&now-lastAudioPanelUpdate<80)return;lastAudioPanelUpdate=now;
            drawSpectrum();
            Object.values(state.devices).forEach(dev=>{
                refreshCdDisplay(dev);
                Hardware.updateAccents(dev);
                const meter=dev.meters;if(!meter)return;
                [0,1].forEach(channel=>{
                    let peak=0,rms=0;
                    meter.channels[channel].forEach(tap=>{
                        tap.analyzer.getFloatTimeDomainData(tap.data);let energy=0,localPeak=0;
                        for(const sample of tap.data){localPeak=Math.max(localPeak,Math.abs(sample));energy+=sample*sample;}
                        peak=Math.max(peak,localPeak);rms=Math.max(rms,Math.sqrt(energy/tap.data.length));
                    });
                    if(state.audioCtx.state!=='running'){peak=0;rms=0;}
                    meter.levels[channel]=rms;meter.peaks[channel]=peak;
                    const headphoneClip=dev.outputCircuits?.some(circuit=>circuit.paths.some(path=>path.clipping));
                    const electricalClip=POWER_OUTPUT_TYPES.has(dev.type)?dev.electricalStages?.some(stage=>stage.clipping)||headphoneClip:headphoneClip||peak>=.999;
                    if(electricalClip)meter.clipUntil=now+1800;
                });
                if(dev.type==='powerAmp'){
                    meter.displayLevels||=[0,0];
                    dev.el.querySelectorAll('[data-receiver-level]').forEach(bar=>{
                        const channel=Number(bar.dataset.receiverLevel),value=dev.powered?meter.levels[channel]||0:0;
                        const target=Math.max(0,Math.min(1,(audioDb(value)+60)/60)),previous=meter.displayLevels[channel];
                        const amount=target>previous?target:previous+(target-previous)*.45;
                        meter.displayLevels[channel]=amount;bar.style.width=(amount*100).toFixed(2)+'%';
                        const readout=bar.closest('.poweramp-meter-channel');readout.setAttribute('aria-label',`${channel?'CH B · direito':'CH A · esquerdo'}: ${audioDbText(value)}`);readout.title=audioDbText(value);
                    });
                }
                updateStereoPowerMeters(dev);
                dev.el.querySelectorAll('.receiver-vu i').forEach((needle,index)=>{
                    const level=Math.max(0,Math.min(1,(audioDb(meter.levels[index]||0)+48)/48));
                    needle.style.transform=`rotate(${dampedNeedle(needle,-45+level*75,now,-45)}deg)`;
                });
            });
            readElectricalStages();
            updateReferenceHardware(now);
            Object.values(state.devices).forEach(dev=>dev.refreshStreamDisplay?.());
            Object.values(state.devices).filter(isPassiveLoad).forEach(applySpeakerLoadDynamics);
            const selected=state.devices[state.selectedDeviceId];
            if(selected?.audioBuffer){const progress=document.getElementById('source-progress'),label=document.getElementById('source-position');const position=sourcePosition(selected);if(progress&&document.activeElement!==progress)progress.value=position;if(label)label.textContent=formatAudioTime(position);}
        }

        function readAudioTrackTitle(buffer){
            try{
                const bytes=new Uint8Array(buffer),view=new DataView(buffer);
                if(bytes.length<10||String.fromCharCode(...bytes.slice(0,3))!=='ID3')return '';
                const version=bytes[3];if(![2,3,4].includes(version)||(bytes[5]&0x80))return '';
                const sync=o=>(bytes[o]<<21)|(bytes[o+1]<<14)|(bytes[o+2]<<7)|bytes[o+3];
                const end=Math.min(bytes.length,10+sync(6),1024*1024);let offset=10;
                if(bytes[5]&0x40){if(version===3)offset+=4+view.getUint32(offset);else if(version===4)offset+=sync(offset);else return '';}
                while(offset+(version===2?6:10)<=end){
                    const idLength=version===2?3:4,id=String.fromCharCode(...bytes.slice(offset,offset+idLength));
                    if(!/^[A-Z0-9]+$/.test(id))break;
                    const header=version===2?6:10,size=version===2?(bytes[offset+3]<<16)|(bytes[offset+4]<<8)|bytes[offset+5]:version===4?sync(offset+4):view.getUint32(offset+4);
                    if(size<1||offset+header+size>end)break;
                    if(id==='TIT2'||id==='TT2'){
                        if(version!==2&&bytes[offset+9])return '';
                        const frame=bytes.slice(offset+header,offset+header+size),encoding=frame[0];
                        const text=new TextDecoder(encoding===0?'iso-8859-1':encoding===1?(frame[1]===0xfe&&frame[2]===0xff?'utf-16be':'utf-16le'):encoding===2?'utf-16be':'utf-8').decode(frame.subarray(1));
                        return text.replace(/\u0000/g,' ').replace(/^\uFEFF/,'').trim().slice(0,240);
                    }
                    offset+=header+size;
                }
            }catch{}
            return '';
        }
        function refreshCdDisplay(dev){
            dev.refreshStreamDisplay?.();
            if(dev.type!=='cdPlayer')return;
            const title=dev.el.querySelector('[data-cd-title]');if(!title)return;
            const name=dev.audioBuffer?(dev.trackTitle||dev.fileName?.replace(/\.[^.]+$/,'')||'FAIXA 01'):'DEMONSTRAÇÃO';
            if(title.textContent!==name){title.textContent=name;title.parentElement.title=name;}
            const distance=Math.max(0,title.scrollWidth-title.parentElement.clientWidth);
            title.style.setProperty('--cd-scroll-distance',`${-distance}px`);title.classList.toggle('is-scrolling',distance>2&&dev.powered);
            const seconds=dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?state.audioCtx.currentTime-dev.demoStartedAt:0);
            const time=formatAudioTime(seconds).padStart(5,'0');
            dev.el.querySelector('[data-cd-time]').textContent=time;
            dev.el.querySelector('[data-cd-duration]').textContent=dev.audioBuffer?'/ '+formatAudioTime(dev.audioBuffer.duration).padStart(5,'0'):'DEMO';
            dev.el.querySelector('[data-cd-status]').textContent=!dev.powered?'OFF':dev.state.playing?'▶ PLAY':'Ⅱ PAUSE';
            dev.el.querySelector('[data-cd-repeat]').textContent=dev.state.repeat?'↻ REPEAT':'';
        }

        function stopFilePlayback(dev) {
            const playback = dev.filePlayback;
            if (!playback) return;
            dev.fileOffset = sourcePosition(dev);
            playback.source.onended = null;
            playback.source.stop(); playback.source.disconnect(); playback.splitter.disconnect();
            dev.filePlayback = null;
        }
        function startFilePlayback(dev) {
            if (!dev.audioBuffer || !dev.state.playing || !dev.powered) return;
            const source = state.audioCtx.createBufferSource();
            source.buffer = dev.audioBuffer;
            source.loop = !!dev.state.repeat;
            const rate = dev.ttRate ? dev.ttRate() : 1;
            source.playbackRate.value = rate;
            const splitter = state.audioCtx.createChannelSplitter(2);
            source.connect(splitter);
            splitter.connect(dev.nodes.genL, 0);
            splitter.connect(dev.nodes.genR, dev.audioBuffer.numberOfChannels > 1 ? 1 : 0);
            if ((dev.fileOffset || 0) >= dev.audioBuffer.duration) dev.fileOffset = 0;
            dev.filePlayback = {source,splitter,startedAt:state.audioCtx.currentTime,rate};
            source.onended = () => {
                if (dev.filePlayback?.source !== source) return;
                source.disconnect(); splitter.disconnect(); dev.filePlayback = null; dev.fileOffset = 0;
                setSourcePlaying(dev, false);
            };
            source.start(0, dev.fileOffset || 0);
        }
        async function loadSourceAudio(dev, file) {
            const token = dev.fileLoadToken = (dev.fileLoadToken || 0) + 1;
            await setSourcePlaying(dev, false);
            dev.fileMessage = 'Carregando áudio…';
            if (state.selectedDeviceId === dev.id) selectDevice(dev.id, true);
            try {
                const bytes = await file.arrayBuffer();
                const streamMetadata=dev.type==='streamIntegrated'?readStreamMetadata(bytes):null;
                const trackTitle = readAudioTrackTitle(bytes) || file.name.replace(/\.[^.]+$/, '');
                const buffer = await state.audioCtx.decodeAudioData(bytes);
                if (!state.devices[dev.id] || dev.fileLoadToken !== token) return;
                dev.audioBuffer = buffer; dev.fileOffset = 0;
                dev.mediaBlob=file;dev.mediaKey='audio_'+Date.now()+'_'+Math.random().toString(36).slice(2);scheduleProjectSave();
                dev.fileName = file.name; dev.trackTitle=trackTitle; dev.demoOffset=0; dev.fileMessage = '';
                if(streamMetadata)dev.setStreamMetadata(streamMetadata);
                refreshCdDisplay(dev);
            } catch (error) {
                if (dev.fileLoadToken !== token) return;
                dev.fileMessage = 'Não foi possível ler este áudio. Tente um arquivo MP3 ou WAV.';
            }
            if (state.selectedDeviceId === dev.id && state.devices[dev.id]) selectDevice(dev.id, true);
        }

        const VINYL_NOISE_LEVELS={none:{label:'Sem ruído',gain:0},low:{label:'Ruído baixo',gain:.016},medium:{label:'Ruído médio',gain:.035},high:{label:'Ruído alto',gain:.07}};
        function noiseLevelIcon(level){
            const waveforms={
                low:'M2 12h2l1.5-1.5 2 3 2.5-4 2 5 2-4 2 3 2-2 1.5 .5H22',
                medium:'M2 12h2l1.5-3 2 6 2.5-8 2 10 2-8 2 6 2-4 1.5 1H22',
                high:'M2 12h2l1.5-5 2 10 2.5-13 2 16 2-13 2 10 2-6 1.5 1H22'
            };
            const symbol=level==='none'
                ? '<circle cx="12" cy="12" r="8.25"/><path d="m6.25 17.75 11.5-11.5"/>'
                : `<path class="noise-level-axis" d="M2 12h20"/><path d="${waveforms[level]||waveforms.low}"/>`;
            return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">${symbol}</svg>`;
        }
        function tapeWowLevelIcon(level){
            const controlY={low:8,medium:4,high:-2}[level]??8;
            return `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path class="noise-level-axis" d="M2 12h20"/><path d="M2 12Q4.5 ${controlY} 7 12T12 12T17 12T22 12"/></svg>`;
        }
        let vinylNoiseBuffer=null;
        function stopVinylNoise(dev){
            const voice=dev.vinylNoise;dev.vinylNoise=null;
            if(!voice)return;
            clearTimeout(voice.crackleTimer);
            const time=state.audioCtx.currentTime;
            voice.gain.gain.cancelAndHoldAtTime(time);voice.gain.gain.linearRampToValueAtTime(0,time+.012);
            voice.source.stop(time+.015);
        }
        function syncVinylNoise(dev){
            if(!TURNTABLE_TYPES.has(dev.type))return;
            if(!dev.state.playing||!dev.powered){stopVinylNoise(dev);return;}
            if(dev.vinylNoise)return;
            const context=state.audioCtx;
            if(!vinylNoiseBuffer){
                const size=Math.ceil(context.sampleRate*11);
                vinylNoiseBuffer=context.createBuffer(2,size,context.sampleRate);
                for(let channel=0;channel<2;channel++){
                    const data=vinylNoiseBuffer.getChannelData(channel);let soft=0;
                    for(let i=0;i<size;i++){
                        soft=.6*soft+.4*(Math.random()*2-1);
                        data[i]=soft*.2;
                    }
                    for(let i=0;i<256;i++){data[i]*=i/256;data[size-1-i]*=i/256;}
                }
            }
            const source=context.createBufferSource(),gain=context.createGain(),split=context.createChannelSplitter(2);
            const high=context.createBiquadFilter(),low=context.createBiquadFilter();
            high.type='highpass';high.frequency.value=100;low.type='lowpass';low.frequency.value=5200;
            source.buffer=vinylNoiseBuffer;source.loop=true;
            gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime((VINYL_NOISE_LEVELS[dev.state.vinylNoiseLevel]||VINYL_NOISE_LEVELS.medium).gain,context.currentTime+.06);
            source.connect(high);high.connect(low);low.connect(gain);gain.connect(split);
            split.connect(dev.nodes.genL,0);split.connect(dev.nodes.genR,1);
            source.onended=()=>{source.disconnect();high.disconnect();low.disconnect();gain.disconnect();split.disconnect();};
            source.start(0,Math.random()*9);
            const voice={source,gain,crackleTimer:null};dev.vinylNoise=voice;
            const scheduleCrackle=()=>{
                if(dev.vinylNoise!==voice)return;
                voice.crackleTimer=setTimeout(()=>{
                    if(dev.vinylNoise!==voice||!dev.state.playing||!dev.powered)return;
                    if(context.state==='running'){
                        const duration=.0015+Math.random()*.004;
                        const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
                        const samples=buffer.getChannelData(0),amplitude=.16+Math.random()*.24;
                        for(let i=0;i<samples.length;i++){
                            const phase=i/samples.length;
                            samples[i]=amplitude*(Math.random()*1.2-.6+Math.sin(i*.8)*.35)*Math.min(1,phase*30)*Math.exp(-phase*7);
                        }
                        const tick=context.createBufferSource(),pan=context.createStereoPanner();
                        tick.buffer=buffer;pan.pan.value=(Math.random()-.5)*.8;
                        tick.connect(pan);pan.connect(high);
                        tick.onended=()=>{tick.disconnect();pan.disconnect();};
                        tick.start();
                    }
                    scheduleCrackle();
                },220+Math.random()*1450);
            };
            scheduleCrackle();
        }

        async function setSourcePlaying(dev, playing, mechanism=false) {
            if(dev.type==='streamIntegrated'&&playing&&dev.state.streamInput!=='library')dev.selectStreamInput('library');
            if(dev.linearSetPlaying&&!mechanism)return dev.linearSetPlaying(playing);
            if(dev.state.damage&&playing)return;
            if(playing&&dev.type==='cdPlayer')dev.setTrayOpen?.(false);
            if (!SOURCE_TYPES.has(dev.type)) return;
            if (playing && state.audioCtx.state !== 'running') {
                try {
                    await state.audioCtx.resume();
                    if (state.audioCtx.state !== 'running') throw new Error('Áudio bloqueado pelo navegador.');
                } catch (error) {
                    dev.state.playing = false;
                    if (dev.state.tt) dev.state.tt.running = false;
                    dev.refreshTurntable?.();
                    updateCableFlows();
                    dev.fileMessage = 'O navegador não ativou a saída de áudio. Clique em Reproduzir novamente; confira se a aba está silenciada.';
                    const status = state.selectedDeviceId === dev.id ? document.getElementById('source-file-message') : null;
                    if (status) {
                        status.textContent = 'O navegador não ativou a saída de áudio. Clique em Reproduzir novamente; confira se a aba está silenciada.';
                        status.classList.add('text-red-400');
                    }
                    return;
                }
            }
            if(playing&&(dev.state.damage||!state.devices[dev.id]))return;
            stopFilePlayback(dev);
            if(!dev.audioBuffer){
                if(dev.state.playing && dev.demoStartedAt != null) dev.demoOffset=(dev.demoOffset||0)+state.audioCtx.currentTime-dev.demoStartedAt;
                dev.demoStartedAt=playing?state.audioCtx.currentTime:null;
            }
            dev.state.playing = !!playing;
            syncVinylNoise(dev);
            syncTapeHiss(dev);
            syncSignalGenerator(dev);
            if (dev.state.playing && dev.audioBuffer) startFilePlayback(dev);
            if (dev.state.tt) dev.state.tt.running = dev.state.playing;
            ['genR','genL'].forEach(key => dev.nodes[key]?.gain.setTargetAtTime(dev.state.playing ? 1 : 0, state.audioCtx.currentTime, .015));
            dev.el.querySelectorAll('[data-source-play]').forEach(button => {
                button.setAttribute('aria-label',dev.state.playing?'Pausar':'Reproduzir');
                button.setAttribute('aria-pressed', String(dev.state.playing));
            });
            if (state.selectedDeviceId === dev.id) {
                const button = document.getElementById('source-inspector-play');
                if (button) { button.classList.toggle('is-on', dev.state.playing); button.setAttribute('aria-pressed', String(dev.state.playing)); }
            }
            dev.refreshTurntable?.();
            refreshCdDisplay(dev);
            syncSourceSequencer();
            updateCableFlows();
        }
        function syncSourceSequencer() {
            state.isPlaying = Object.values(state.devices).some(isSourceRunning);
            if (!state.isPlaying) { clearInterval(state.seqInterval); state.seqInterval = null; return; }
            if (state.seqInterval) return;
                let step = 0;
                state.seqInterval = setInterval(() => {
                    if (state.audioCtx.state !== 'running') return;
                    Object.values(state.devices).forEach(dev => {
                        // Só toca se o dispositivo estiver ligado (e, no toca-discos, com o prato girando)
                        if (!isSourceRunning(dev) || dev.audioBuffer || RADIO_RECEIVERS.has(dev.type) || SIGNAL_GENERATOR_TYPES.has(dev.type)) return;

                        const outR = dev.nodes.genR || dev.nodes.outR;
                        const outL = dev.nodes.genL || dev.nodes.outL;
                        if (TURNTABLE_TYPES.has(dev.type)) {
                            const ttr = dev.ttRate ? dev.ttRate() : 1;
                            if (step % 4 === 0) {
                                if (outR) playNote(50 * ttr, 'sine', 0.4, 0.8, 0, outR);
                                if (outL) playNote(50 * ttr, 'sine', 0.4, 0.8, 0, outL);
                            }
                            if (step % 2 !== 0) {
                                if (outR) playNote(400 * ttr, 'square', 0.1, 0.08, 0, outR);
                                if (outL) playNote(400 * ttr, 'square', 0.1, 0.08, 0, outL);
                            }
                        } else if (dev.type === 'streamer' || dev.type==='streamIntegrated' || dev.type === 'cdPlayer' || BT_RX_TYPES.has(dev.type)) {
                            const melodyR = [261.63, 329.63, 392.00, 523.25];
                            const melodyL = [329.63, 392.00, 523.25, 659.25];
                            const noteR = melodyR[step % melodyR.length];
                            const noteL = melodyL[step % melodyL.length];
                            const wave = BT_RX_TYPES.has(dev.type) ? 'sawtooth' : dev.type === 'cdPlayer' ? 'sine' : 'triangle';
                            if (outR) playNote(noteR, wave, 0.25, 0.22, 0, outR);
                            if (outL) playNote(noteL, wave, 0.25, 0.22, 0, outL);
                        }
                    });
                    step++;
                }, 300);
        }

        // --- DRAG & DROP CORRIGIDO (SEM DELAY E SEM OFFSET) ---
        const catalogDescriptions = {
            ...Object.fromEntries(Object.entries(FURNITURE_TYPES).map(([key,config])=>[key,config.description])),
            pendantLamp:'Luminária pendente com cúpula metálica, cabo até o teto, lâmpada de filamento e luz amarela direcional.',
            ...Object.fromEntries(Object.entries(INTERFACE_DEVICES).map(([key,config])=>[key,config.description])),
            turntableVintage: 'Toca-discos vintage com madeira e aço escovado, ajuste de pitch e saída RCA LINE ou PHONO.',
            turntableLinear:'Toca-discos tangencial automático com dois braços paralelos, detecção simulada de diâmetro, velocidades de 33⅓ e 45 rpm, cue e retorno automático.',
            streamIntegrated:'Streamer com amplificador estéreo de 40 W por canal, fonte interna, entrada de linha, fones e pré-out. Tela colorida funcional e volume superior com halo luminoso.',
            turntable: 'Toca discos de vinil. Ajuste o pitch e escolha a SAÍDA: LINE (pré interno) ou PHONO (cápsula MM, sem pré/RIAA de reprodução).',
            streamer: 'Reproduz música digital e envia áudio estéreo de linha por RCA L/R ou AUX P2.',
            signalGeneratorVintage:'Gerador vintage com tela matricial, senoide, varredura, ruído rosa e saídas de linha L/R.',
            signalGenerator:'Senoide, varredura logarítmica e ruído rosa, com saídas de linha L/R e nível ajustável.',
            tapeDeck:'Tape deck de rolo aberto com reprodução estéreo, ruído de fita, wow/flutter e medidores VU.',
            preamp:'Seleciona AUX, CD, TAPE ou PHONO (com equalização RIAA para toca-discos); ajusta volume, graves e agudos e entrega sinal de linha ao amplificador.',
            benchMeter:'Medidor de bancada com LCD, barras VU L/R, espectro e correlação estéreo em tempo real.',
            benchMeterVintage:'Medidor vintage em madeira e metal, com ponteiros VU L/R calibrados, espectro e correlação estéreo.',
            cdPlayer: 'Lê CDs e envia áudio estéreo em nível de linha por RCA.',
            btReceiverA: 'Recebe áudio Bluetooth e converte para saída estéreo RCA.',
            btTransmitterPro: 'Recebe áudio estéreo RCA e transmite para fones Bluetooth.',
            eqStudio: 'Equalizador de 7 bandas com nível de saída e conexões RCA ou P10 estéreo.',
            eqVintage: 'Equalizador de 7 bandas com acabamento vintage e conexões RCA ou P10 estéreo.',
            receiver: 'Recebe fontes de linha, amplifica para caixas e oferece saídas RCA, sub e fones.',
            powerAmp: 'Receiver moderno com volume estéreo e saídas amplificadas para caixas passivas.',
            powerStereo: 'Amplificador de potência com entradas RCA ou P10 estéreo e ganhos A/L e B/R independentes.',
            powerVintage: 'Amplificador de potência vintage com ganhos A/L e B/R independentes e saídas para caixas passivas.',
            headphoneAmp: 'Amplificador vintage de fones com entrada RCA, volume e saídas P10 e P2.',
            headphoneAmpModern: 'Amplificador de fones com entrada RCA, volume e saídas P10 e P2.',
            headphoneAmp4: 'Distribui uma entrada RCA estéreo para quatro saídas P10 com volumes independentes.',
            rcaSwitch: 'Recebe um par RCA e seleciona o envio para a saída A ou B.',
            rcaMatrix: 'Seleciona uma das três entradas RCA estéreo e envia para qualquer combinação das quatro saídas.',
            rcaMatrixVintage: 'Switch vintage: uma de três entradas RCA estéreo para até quatro saídas ativadas individualmente.',
            rcaSwitchVintage: 'Recebe um par RCA e seleciona a saída A ou B, com acabamento vintage em madeira e metal.',
            mixer: 'Combina três fontes estéreo RCA com volume independente por canal.',
            mixerVintage: 'Mixer vintage que combina três fontes estéreo RCA com volume por canal.',
            speakerSwitch: 'Seleciona o par A ou B de caixas passivas ligado à saída amplificada.',
            speakerSwitchVintage: 'Seletor vintage que alterna a saída do amplificador entre caixas A e B.',
            crossover: 'Divide o sinal RCA em graves, médios e agudos para saídas separadas.',
            crossoverVintage: 'Crossover vintage que separa o áudio em três faixas de frequência.',
            spkPassiveWood: 'Caixa passiva: recebe sinal amplificado do receiver ou amplificador por fio.',
            spkPassiveCarbon: 'Caixa passiva: recebe sinal amplificado do receiver ou amplificador por fio.',
            spkPassiveGridBlack: 'Caixa passiva de três vias com tweeter, dois transdutores de médios, woofer, crossover interno e grade preta removível. Impedância nominal de 4 Ω; amplificação recomendada até 200 W.',
            spkPassiveGridOrange: 'Caixa passiva de três vias com tweeter, dois transdutores de médios, woofer, crossover interno e grade laranja removível. Impedância nominal de 4 Ω; amplificação recomendada até 200 W.',
            spkActiveMonitor: 'Caixa ativa: recebe sinal de linha RCA mono, com volume próprio; o lado L/R vem da saída conectada.',
            spkActiveCompact:'Caixa ativa compacta com RCA L/R e AUX P2 de linha, controle de volume e assinatura sonora própria. Preserva os canais estéreo.',
            spkActiveRounded:'Monitor ativo de duas vias, gabinete arredondado, guia de ondas e apoio isolante. Entrada mono P10 de linha adaptada para o simulador, volume e alimentação próprios. Use duas unidades para estéreo.',
            spkActiveBookshelf: 'Caixa ativa: recebe sinal de linha RCA mono, com volume próprio; o lado L/R vem da saída conectada.',
            subwoofer: 'Subwoofer ativo com entrada RCA LFE mono dedicada para frequências graves.',
            subwooferCube: 'Subwoofer ativo compacto com entrada RCA LFE mono dedicada.',
            subwooferPro: 'Subwoofer ativo de maior porte com entrada RCA LFE mono dedicada.',
            subwooferPassive: 'Subwoofer passivo: recebe sinal amplificado do amplificador por fio de caixa.',
            subwooferPassiveVintage: 'Subwoofer passivo vintage: recebe sinal amplificado por fio de caixa.',
            hpStudio: 'Fone de estúdio com arco duplo, faixa de suspensão, almofadas em tecido, entrada P2 estéreo na ponta do cabo e pareamento Bluetooth.',
            hpMonitor:'Fone em couro preto texturizado, almofadas com pregas e hastes articuladas com detalhes metálicos quentes. Suporte padrão e entrada P2 estéreo na ponta do cabo, somente por cabo.',
            hpMax:'Fone com conchas prateadas e arco em malha. Suporte padrão e conexão exclusivamente por Bluetooth com um transmissor do simulador.',
            hpClassic: 'Fone clássico com conchas de madeira, arco costurado e almofadas em couro marrom. Entrada P2 estéreo na ponta do cabo, somente por cabo.'
        };
        // Uma linguagem de ícones para todo o catálogo: mesmo traço, escala e enquadramento.
        function catalogIcon(type) {
            const rack = '<rect x="4" y="10" width="48" height="24" rx="3"/>';
            const pair = '<circle cx="13" cy="27" r="2"/><circle cx="20" cy="27" r="2"/>';
            let drawing;
            if(type==='pendantLamp'){
                drawing='<path d="M28 3v19M13 27q15-12 30 0H13m-15 0h60M24 29v9q4 8 8 0v-9m-6 5h4"/>';
            } else if (FURNITURE_TYPES[type]) {
                drawing = FURNITURE_TYPES[type].acoustic ? '<rect x="10" y="5" width="36" height="36" rx="1"/>'+Array.from({length:6},(_,i)=>FURNITURE_TYPES[type].acoustic==='horizontal'?`<path d="M12 ${9+i*5}h32"/>`:`<path d="M${14+i*5} 7v32"/>`).join('') : type === 'furnitureTable' ? '<path d="M5 15h46v5H5zM10 20v20m36-20v20M12 26h32"/>' : type === 'furnitureNiche' ? '<path d="M6 10h44v28H6zM11 15h34v18H11z"/>' : '<path d="M9 5h38v34H9zM9 16h38M9 27h38M13 39v4m30-4v4"/>';
            } else if (INTERFACE_DEVICES[type]) {
                drawing = '<rect x="6" y="11" width="44" height="24" rx="3"/><circle cx="14" cy="23" r="3"/><circle cx="42" cy="23" r="3"/><path d="M21 23h14m-4-4 4 4-4 4"/>' + (INTERFACE_DEVICES[type].passive ? '' : '<path d="m26 13-3 6h6l-3 6"/>');
            } else if(type==='streamIntegrated'){
                drawing='<path d="M5 12h46v27H5ZM19 12V8h18v4M5 34h46M8 15v17m40-17v17"/><rect x="17" y="17" width="23" height="14" rx="1"/><path d="m20 27 5-5 5 3 6-5m9-3v2m0 4v2M10 38h4m28 0h4"/><circle cx="11" cy="28" r="2"/>';
            } else if(type==='turntableLinear'){
                drawing='<path d="M3 8h50v29H3zM3 24h50M7 15h35M8 21h26m-23-2h20m8-7v9m4-9v9M7 29h8m-8 4h8m6-4h2m4 0h2m6 0h12m-12 4h12"/>';
            } else if (TURNTABLE_TYPES.has(type)) {
                drawing = '<rect x="5" y="6" width="46" height="33" rx="3"/><circle cx="23" cy="22" r="12"/><circle cx="23" cy="22" r="3"/><path d="M43 12v13l-6 5M11 35h7"/>';
            } else if(type==='preGlass'){drawing=rack+'<path d="M8 13v18m40-18v18M11 28h34"/><circle cx="16" cy="20" r="4"/><circle cx="28" cy="20" r="2"/><circle cx="40" cy="20" r="4"/><path d="M16 30v3m6-3v3m6-3v3m6-3v3m6-3v3"/>';
            } else if(type==='prePrecision'){drawing=rack+'<rect x="9" y="15" width="15" height="13" rx="2"/><path d="m16 25-4-6m5 6 4-7M29 17v9m4-7v7"/><circle cx="42" cy="22" r="6"/><path d="m42 22 3-3"/>';
            } else if(type==='integratedUtility'){drawing=rack+'<circle cx="16" cy="23" r="3"/><circle cx="25" cy="23" r="3"/><circle cx="44" cy="23" r="6"/><path d="M31 17h3m-3 4h3m-3 4h3M10 31h36"/>';
            } else if(type==='tapeDeck'){drawing='<rect x="7" y="3" width="42" height="40" rx="2"/><circle cx="18" cy="17" r="8"/><circle cx="38" cy="17" r="8"/><circle cx="18" cy="17" r="2"/><circle cx="38" cy="17" r="2"/><path d="M13 33h14m5 0h10M13 37h7"/>';
            } else if(CUSTOM_PREAMPS[type]){drawing=rack+(type==='preReference'?'<path d="M7 13v18m42-18v18"/><rect x="20" y="15" width="16" height="12" rx="1"/><circle cx="13" cy="21" r="4"/><circle cx="43" cy="21" r="4"/>':type==='preControl'?'<rect x="20" y="15" width="14" height="7" rx="1"/><circle cx="12" cy="23" r="4"/><circle cx="43" cy="22" r="6"/><path d="M22 28h2m4 0h2m4 0h2"/>':'<circle cx="12" cy="22" r="5"/><circle cx="44" cy="22" r="5"/><rect x="22" y="14" width="12" height="16" rx="1"/><path d="M25 19h6m-6 5h4"/>');
            } else if(type==='preamp'){drawing=rack+'<circle cx="31" cy="22" r="5"/><circle cx="43" cy="22" r="3"/><path d="M10 17h12m-12 6h3m3 0h3m3 0h3"/>';
            } else if(BENCH_METER_TYPES.has(type)){drawing=rack+(type==='benchMeterVintage'?'<path d="M9 16h15v11H9zM12 24l4-5M29 27l4-7 4 4 5-9 5 12"/>':'<rect x="9" y="15" width="38" height="15" rx="1"/><path d="M13 19h19M13 25h27M37 19h6"/>');
            } else if (type === 'cdPlayer') {
                drawing = rack + '<rect x="11" y="16" width="25" height="5" rx="1"/><path d="M13 28h20"/><circle cx="44" cy="22" r="3"/>';
            } else if(SIGNAL_GENERATOR_TYPES.has(type)){
                drawing=rack+'<path d="M10 22c5-13 9 13 14 0s9 13 14 0"/><circle cx="45" cy="22" r="2"/>';
            } else if (type === 'streamer') {
                drawing = rack + '<path d="M13 17h14v10H13zM35 18a9 9 0 0 1 10 0M37 22a5 5 0 0 1 6 0"/><circle cx="40" cy="26" r="1"/>';
            } else if (type.startsWith('bt')) {
                drawing = '<rect x="12" y="5" width="32" height="35" rx="6"/><path d="M27 11v23l9-7.5L21 15.5M21 29.5 36 18.5 27 11"/>' + (type === 'btReceiverA' ? '<path d="M3 22h6m-3-3 3 3-3 3"/>' : '<path d="M47 22h6m-3-3 3 3-3 3"/>');
            } else if (type.startsWith('eq')) {
                drawing = rack + '<path d="M14 15v14m9-14v14m10-14v14m9-14v14M11 20h6m3 5h6m4-8h6m3 5h6"/>';
            } else if(INTEGRATED_AMPS[type]){
                drawing=rack+(type==='integratedMinimal'?'<circle cx="15" cy="22" r="6"/><path d="M26 22h3m4 0h3m4 0h3"/><circle cx="47" cy="22" r="2"/>':'<rect x="17" y="15" width="10" height="10" rx="1"/><rect x="29" y="15" width="10" height="10" rx="1"/><path d="m20 22 3-4m9 4 3-4"/><circle cx="10" cy="24" r="3"/><circle cx="46" cy="24" r="4"/>');
            } else if (['receiver','powerAmp'].includes(type)) {
                drawing = rack + '<rect x="10" y="15" width="25" height="9" rx="1"/><path d="M14 19h17M11 29h20"/><circle cx="43" cy="22" r="6"/><path d="m43 22 2-3"/>';
            } else if(CUSTOM_POWER_AMPS[type]){
                drawing=type==='powerValve'?'<path d="M4 31h48v10H4zM8 31V15h12v16m5 0V10h10v21m5 0V15h9v16"/><rect x="10" y="20" width="6" height="12" rx="3"/><rect x="25" y="17" width="6" height="15" rx="3"/><rect x="39" y="20" width="6" height="12" rx="3"/>':rack+(type==='powerDual'?'<path d="M9 13v17m38-17v17M20 29h16"/><circle cx="24" cy="20" r="1"/><circle cx="32" cy="20" r="1"/>':'<circle cx="28" cy="21" r="8"/><path d="m28 21-4-3M8 13v18m4-18v18m32-18v18m4-18v18"/>');
            } else if (['powerStereo','powerVintage'].includes(type)) {
                drawing = rack + '<path d="M10 16v12m4-12v12m28-12v12m4-12v12M27 16v12m3-12v12"/><circle cx="21" cy="22" r="4"/><circle cx="36" cy="22" r="4"/>';
            } else if (type.startsWith('headphoneAmp')) {
                drawing = rack + '<path d="M10 21a5 5 0 0 1 10 0v6m-10-6v6"/><circle cx="31" cy="22" r="6"/><path d="m31 22 2-3"/>' + (type === 'headphoneAmp4' ? '<circle cx="43" cy="17" r="1"/><circle cx="47" cy="17" r="1"/><circle cx="43" cy="26" r="1"/><circle cx="47" cy="26" r="1"/>' : '<circle cx="45" cy="22" r="2"/>');
            } else if (type.startsWith('mixer')) {
                drawing = rack + '<path d="M15 15v14m12-14v14m12-14v14M12 19h6m6 6h6m6-8h6"/><circle cx="46" cy="27" r="1"/>';
            } else if (type.startsWith('crossover')) {
                drawing = rack + '<path d="M10 22h11m0 0 9-7h14m-23 7h23m-23 0 9 7h14"/>';
            } else if (/Switch|Matrix/.test(type)) {
                drawing = rack + (type.startsWith('speaker') ? '<path d="M11 17h6v10h-6zM39 17h6v10h-6zM20 22h8m0 0 7-5m-7 5 7 5"/>' : type.startsWith('rcaMatrix') ? '<path d="M13 16h7m-7 6h7m-7 6h7m3-6h10m0-6h10m-10 4h10m-10 4h10m-10 4h10m-16-6 6-6"/>' : '<path d="M11 22h12m0 0 10-6h11m-11 12h11"/><circle cx="11" cy="22" r="2"/><circle cx="44" cy="16" r="2"/><circle cx="44" cy="28" r="2"/>');
            } else if (type.startsWith('subwoofer')) {
                drawing = '<rect x="11" y="5" width="34" height="34" rx="2"/><circle cx="28" cy="21" r="11"/><circle cx="28" cy="21" r="5"/><path d="M20 35h16"/>' + (type.includes('Passive') ? '' : '<path d="M41 8v4"/>');
            } else if(BOOKSHELF_SPEAKERS[type]){
                drawing=type==='shelfCoax'?'<rect x="15" y="4" width="26" height="36" rx="6"/><circle cx="28" cy="21" r="10"/><circle cx="28" cy="21" r="3"/><path d="m28 11 0 7m0 6v7m-10-10h7m6 0h7"/>':type==='shelfWood'?'<rect x="16" y="3" width="24" height="38" rx="1"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="9"/><circle cx="28" cy="28" r="4"/><path d="M19 5v34m18-34v34"/>':'<rect x="17" y="11" width="22" height="30" rx="3"/><circle cx="28" cy="5" r="4"/><path d="M28 9v2"/><circle cx="28" cy="25" r="9"/><circle cx="28" cy="25" r="4"/>';
            } else if(FLOOR_SPEAKERS[type]){
                drawing=type==='floorDiamond'?'<path d="M19 9h18v30H19zM17 40h22M22 43v-3m12 0v3"/><circle cx="28" cy="5" r="3"/><circle cx="28" cy="16" r="4"/><circle cx="28" cy="26" r="5"/><circle cx="28" cy="35" r="3"/>':type==='floorCoax'?'<path d="M21 3h14v36H21zM17 40h22m-18 3v-3m14 0v3"/><circle cx="28" cy="9" r="4"/><circle cx="28" cy="17" r="3.5"/><circle cx="28" cy="23" r="2.5"/><circle cx="28" cy="29" r="3.5"/><circle cx="28" cy="36" r="3"/>':'<path d="M18 3h20v36H18zM16 40h24m-20 3v-3m16 0v3"/><circle cx="28" cy="9" r="4"/><circle cx="28" cy="16" r="1.6"/><circle cx="28" cy="22" r="4"/><circle cx="28" cy="30" r="4"/><path d="M24 36h8"/>';
            } else if (type.startsWith('spk') || type === 'speaker') {
                drawing = '<rect x="15" y="3" width="26" height="36" rx="2"/>' + (type.includes('Grid') ? '<path d="M21 8v25m7-25v25m7-25v25M19 14h18M19 22h18M19 30h18M19 40v3h18v-3"/>' : '<circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/>' + (type.includes('Active') ? '<path d="M37 6v3"/>' : ''));
            } else if(type==='hpKubaDisco2'){
                drawing='<path d="M9 31V21C9-3 47-3 47 21v10M12 29v-8C12 1 44 1 44 21v8"/><rect x="7" y="24" width="11" height="17" rx="4"/><rect x="38" y="24" width="11" height="17" rx="4"/><path d="M14 27v11m28-11v11M12 41q2 5 16 7 14-2 16-7m-16 7v3"/>';
            } else if(REFERENCE_HEADPHONES[type]){
                const band='<path d="M13 24v-6a15 15 0 0 1 30 0v6M17 18a11 11 0 0 1 22 0"/>';
                drawing=band+(type==='hpOpenRing'?'<ellipse cx="13" cy="32" rx="9" ry="11"/><ellipse cx="43" cy="32" rx="9" ry="11"/><ellipse cx="13" cy="32" rx="5" ry="7"/><ellipse cx="43" cy="32" rx="5" ry="7"/><path d="m7 30 12 4m18-4 12 4"/>':type==='hpOpenDome'?'<ellipse cx="13" cy="32" rx="9" ry="10"/><ellipse cx="43" cy="32" rx="9" ry="10"/><path d="m13 25 5 4v6l-5 4-5-4v-6Zm30 0 5 4v6l-5 4-5-4v-6Z"/>':'<circle cx="13" cy="33" r="10"/><circle cx="43" cy="33" r="10"/><path d="M6 29h14M6 33h14M6 37h14M36 29h14M36 33h14M36 37h14M17 20q11-10 22 0"/>');
            } else if (type.startsWith('hp') || type === 'headphone') {
                const headband='<path d="M13 23v-3a15 15 0 0 1 30 0v3M17 18a11 11 0 0 1 22 0"/>';
                if(type==='hpClassic'){
                    drawing=headband+'<circle cx="13" cy="31" r="9"/><circle cx="43" cy="31" r="9"/><circle cx="13" cy="31" r="5.5"/><circle cx="43" cy="31" r="5.5"/><path d="M13 40v3"/>';
                }else if(type==='hpMonitor'){
                    drawing=headband+'<rect x="6" y="23" width="14" height="18" rx="5"/><rect x="36" y="23" width="14" height="18" rx="5"/><path d="M10 28v8m4-9v10m28-10v10m4-9v8M13 41v3" stroke-width="1.2"/>';
                }else if(type==='hpMax'){
                    drawing='<path d="M13 23v-3a15 15 0 0 1 30 0v3"/><path d="M17 12a12 12 0 0 1 22 0q-11 5-22 0Z" stroke-width="1.1"/><path d="M21 9v4m3-6v7m4-7v8m4-8v7m3-5v4" stroke-width=".65" opacity=".55"/><rect x="5" y="23" width="16" height="20" rx="6"/><rect x="35" y="23" width="16" height="20" rx="6"/><path d="M9 28v10m30-10v10M46 21h2" stroke-width="1.2"/>';
                }else{
                    drawing=headband+'<rect x="5" y="23" width="16" height="20" rx="8"/><rect x="35" y="23" width="16" height="20" rx="8"/><path d="M10 28v10m3-12v14m3-12v10m24-10v10m3-12v14m3-12v10M13 43v2" stroke-width="1.1"/>';
                }
            } else {
                drawing = rack + pair;
            }
            // One solid color per equipment; geometry describes its construction.
            const details={
                receiver:rack+'<path d="M8 15h9v8H8zM19 15h9v8h-9zM31 15h15v8H31zM33 19h11M8 28h23"/><circle cx="44" cy="28" r="3"/><path d="m10 21 3-3m8 3 3-3"/>',
                powerAmp:rack+'<rect x="9" y="14" width="30" height="12" rx="1"/><path d="M12 17h8m-8 3h8m4-3h11m-11 3h11M14 30h18"/><circle cx="46" cy="20" r="4"/><circle cx="46" cy="29" r="2"/>',
                integratedBlue:rack+'<rect x="10" y="14" width="15" height="10" rx="1"/><rect x="29" y="14" width="15" height="10" rx="1"/><path d="m13 21 5-4m14 4 5-4M21 29h14"/><circle cx="10" cy="29" r="3"/><circle cx="46" cy="29" r="3"/>',
                integratedSilver:rack+'<path d="M7 12v20m42-20v20M19 15h9v10h-9zM30 15h9v10h-9zM22 23l3-5m8 5 3-5"/><circle cx="12" cy="20" r="4"/><circle cx="44" cy="21" r="4"/><path d="M17 29h3m4 0h3m4 0h3m4 0h3"/>',
                powerStereo:rack+'<path d="M9 13v18m38-18v18M15 18h9m-9 4h9m8-4h9m-9 4h9"/><circle cx="20" cy="28" r="3"/><circle cx="36" cy="28" r="3"/>',
                powerVintage:rack+'<rect x="10" y="15" width="13" height="10" rx="1"/><rect x="32" y="15" width="13" height="10" rx="1"/><path d="m13 23 4-5m18 5 4-5M10 30h35"/>',
                headphoneAmp4:rack+'<path d="M8 15h40"/>'+[12,23,34,45].map(x=>`<circle cx="${x}" cy="22" r="3"/><circle cx="${x}" cy="29" r="1.3"/>`).join(''),
                headphoneAmpModern:rack+'<rect x="11" y="15" width="19" height="9" rx="1"/><path d="M14 19h12"/><circle cx="40" cy="22" r="6"/><circle cx="14" cy="29" r="1.5"/><circle cx="22" cy="29" r="1.5"/>',
                headphoneAmp:rack+'<path d="M8 12v20m40-20v20"/><rect x="12" y="15" width="14" height="10" rx="1"/><path d="m15 23 4-5"/><circle cx="37" cy="22" r="5"/><circle cx="19" cy="29" r="1.5"/>',
                signalGenerator:rack+'<rect x="8" y="14" width="20" height="14" rx="1"/><path d="M10 21q3-8 6 0t6 0M32 16h12m-12 5h12M32 28h3m4 0h3"/><circle cx="47" cy="28" r="3"/>',
                signalGeneratorVintage:rack+'<path d="M7 12v20m42-20v20"/><rect x="10" y="15" width="18" height="13" rx="1"/><path d="M13 19h2m2 0h2m2 0h2m-10 5h10M32 17h12m-12 5h12"/><circle cx="35" cy="28" r="2"/><circle cx="44" cy="28" r="3"/>',
                benchMeterVintage:rack+'<path d="M8 15h17v13H8zM30 15h17v13H30zM11 25l6-6m16 6 6-6"/>',
                spkActiveRounded:'<rect x="14" y="3" width="28" height="36" rx="10"/><ellipse cx="28" cy="12" rx="9" ry="5"/><circle cx="28" cy="12" r="2"/><circle cx="28" cy="27" r="9"/><circle cx="28" cy="27" r="4"/><path d="M20 40h16v3H20z"/>',
                spkActiveCompact:'<rect x="17" y="3" width="22" height="39" rx="2"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/><circle cx="28" cy="27" r="3"/><path d="M21 38h5m5 0h3"/>',
                spkActiveBookshelf:'<rect x="15" y="3" width="26" height="39" rx="3"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="9"/><circle cx="28" cy="27" r="4"/><path d="M20 38h6"/><circle cx="34" cy="38" r="1.5"/>',
                spkActiveMonitor:'<path d="M14 3h28v39H14zM17 5v34m22-34v34"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="27" r="8"/><path d="M20 38h6"/><circle cx="34" cy="38" r="2"/>',
                spkPassiveCarbon:'<rect x="15" y="3" width="26" height="39" rx="3"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="9"/><circle cx="28" cy="28" r="4"/>',
                spkPassiveWood:'<path d="M14 3h28v39H14zM17 5v35m22-35v35"/><circle cx="28" cy="12" r="4"/><circle cx="28" cy="28" r="8"/><circle cx="28" cy="28" r="3"/>',
                subwoofer:'<rect x="10" y="5" width="36" height="34" rx="3"/><circle cx="28" cy="21" r="12"/><circle cx="28" cy="21" r="5"/><circle cx="16" cy="35" r="1.5"/><circle cx="40" cy="35" r="1.5"/><path d="M15 39v3m26-3v3"/>',
                subwooferCube:'<rect x="10" y="4" width="36" height="36" rx="2"/><circle cx="28" cy="22" r="13"/><circle cx="28" cy="22" r="5"/><path d="M14 40v3m28-3v3"/>',
                subwooferPro:'<rect x="12" y="2" width="32" height="39" rx="2"/><circle cx="28" cy="18" r="12"/><circle cx="28" cy="18" r="5"/><rect x="18" y="33" width="20" height="4" rx="2"/><path d="M16 41v2m24-2v2"/>',
                subwooferPassive:'<rect x="10" y="4" width="36" height="36" rx="2"/><circle cx="28" cy="20" r="12"/><circle cx="28" cy="20" r="5"/><path d="M20 35h16M15 40v3m26-3v3"/>',
                subwooferPassiveVintage:'<path d="M10 4h36v36H10zM13 6v32m30-32v32"/><circle cx="28" cy="20" r="11"/><circle cx="28" cy="20" r="5"/><circle cx="20" cy="35" r="2"/><circle cx="36" cy="35" r="2"/>'
            };
            if(details[type])drawing=details[type];
            if(['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type))drawing='<rect x="14" y="2" width="28" height="36" rx="1"/><path d="M18 6v28m7-28v28m6-28v28m7-28v28M17 11h22M17 18h22M17 25h22M17 32h22M18 39v4h20v-4"/>';
            if(FURNITURE_TYPES[type]?.rack){const count=type==='furnitureRackSix'||type==='furnitureRackSixTall'?6:4;drawing='<path d="M8 3h40v38H8zM12 41v3m32-3v3"/>'+Array.from({length:count},(_,i)=>`<path d="M10 ${5+i*34/(count-1)}h36"/>`).join('');}
            if(type==='turntableVintage')drawing='<path d="M5 7h46v32H5zM8 10v26m40-26v26"/><circle cx="24" cy="22" r="12"/><circle cx="24" cy="22" r="3"/><path d="M43 12v12l-6 6M12 35h6"/>';
            if(type==='eqVintage')drawing=rack+'<path d="M8 12v20m40-20v20M14 15v14m7-14v14m7-14v14m7-14v14m7-14v14M12 22h4m3-4h4m3 7h4m3-5h4m3 4h4"/>';
            if(type==='mixerVintage')drawing=rack+'<path d="M8 12v20m40-20v20M15 22v8m9-8v8m9-8v8m9-8v8M13 26h4m5-2h4m5 3h4m5-2h4"/>'+[15,24,33,42].map(x=>`<circle cx="${x}" cy="17" r="2"/>`).join('');
            const colors={
                turntable:'#9cbbc0',turntableVintage:'#c4ad83',cdPlayer:'#b2bec7',tapeDeck:'#b8bcb0',streamer:'#85b7bb',
                receiver:'#c8b28b',powerAmp:'#88b3c7',powerStereo:'#9faebc',powerVintage:'#baa889',powerValve:'#c3ad86',powerDual:'#94a7b3',powerBias:'#9cbfcf',
                integratedBlue:'#7eadd2',integratedMinimal:'#91b79a',integratedSilver:'#c9baa0',preamp:'#a7b9bb',preReference:'#acd19a',preControl:'#b2c8d3',preDisplay:'#96abbf',
                benchMeter:'#8cbfc3',benchMeterVintage:'#c9be91',signalGenerator:'#8fbac9',signalGeneratorVintage:'#bec785',
                spkPassiveGridBlack:'#a6acb3',spkPassiveGridOrange:'#df985f',spkPassiveWood:'#bea27e',spkPassiveCarbon:'#9aafbd',speaker:'#b7a083',
                spkActiveRounded:'#9caeb0',spkActiveCompact:'#d0c7ab',spkActiveBookshelf:'#a8b9c6',spkActiveMonitor:'#c4aa87',
                shelfCoax:'#c8a07c',shelfWood:'#c09a7c',shelfTop:'#afbac3',floorDiamond:'#b4ada0',floorCoax:'#c4ccc6',floorFlax:'#c4b48d',
                subwoofer:'#9cabb5',subwooferCube:'#a8b9bc',subwooferPro:'#c18f94',subwooferPassive:'#a2b1bd',subwooferPassiveVintage:'#bba282',
                headphone:'#a6b6c2',hpStudio:'#9db9c7',hpClassic:'#c3aa86',hpMonitor:'#bfa77c',hpMax:'#c0cbce',hpOpenRing:'#aebfc8',hpOpenDome:'#acb4c0',hpPlanar:'#b49c81',
                headphoneAmp:'#c6ab87',headphoneAmpModern:'#91b7c7',headphoneAmp4:'#a1b7c0',eqStudio:'#9eb7c5',eqVintage:'#c5ad86',mixer:'#a4b6c6',mixerVintage:'#bfa385',
                crossover:'#93b8bf',crossoverVintage:'#c3ae8b',btReceiverA:'#8abac8',btTransmitterPro:'#99b7cc',
                rcaSwitch:'#a4b5c1',rcaSwitchVintage:'#bda98a',speakerSwitch:'#9eb8bc',speakerSwitchVintage:'#c1a785',rcaMatrix:'#9bacc3',rcaMatrixVintage:'#b9a88b',
                furnitureRack:'#a5b3ad',furnitureRackTall:'#a0b1ab',furnitureRackSix:'#9baaa6',furnitureRackSixTall:'#92a5a0',furnitureTable:'#baa48a',furnitureNiche:'#b7a58d',pendantLamp:'#e6b674'
            };
            const color=colors[type]||(INTERFACE_DEVICES[type]?.passive?'#b6b5aa':DEVICE_FAMILIES[type]==='vintage'?'#c0ab8a':'#a0b8c4');
            drawing=drawing.replace(/ opacity="[^"]*"/g,'');
            return `<svg class="catalog-equipment-icon" style="color:${color}" viewBox="0 0 56 46" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${drawing}</svg>`;
        }
        const headphoneCatalogGrid=equipmentCatalog.querySelector('[data-template="hpStudio"]').closest('.grid');
        [['hpMonitor','Fone Monitor'],['hpMax','Fone Max'],...Object.keys(REFERENCE_HEADPHONES).map(type=>[type,DEVICE_NAMES[type]])].forEach(([type,label])=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${label}</span>`;headphoneCatalogGrid.appendChild(item);if(REFERENCE_HEADPHONES[type])catalogDescriptions[type]=REFERENCE_HEADPHONES[type].description;
        });
        const switchCatalogSection=document.createElement('div');switchCatalogSection.className='mb-6';
        switchCatalogSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Seletores</h3><div class="grid grid-cols-2 gap-3"></div>';
        const switchCatalogItems=[...equipmentCatalog.querySelectorAll('.catalog-item')].filter(item=>SELECTOR_TYPES.has(item.dataset.template)||MATRIX_TYPES.has(item.dataset.template));
        if(switchCatalogItems.length){
            const originalSections=new Set(switchCatalogItems.map(item=>item.closest('.mb-6')));
            switchCatalogItems[0].closest('.mb-6').after(switchCatalogSection);
            switchCatalogItems.forEach(item=>switchCatalogSection.querySelector('.grid').appendChild(item));
            originalSections.forEach(section=>{if(!section.querySelector('.catalog-item'))section.remove();});
        }
        const processingGrid=equipmentCatalog.querySelector('[data-template="preamp"]').closest('.mb-6').querySelector('.grid');
        Object.keys(INTEGRATED_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;
            item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);
            catalogDescriptions[type]=INTEGRATED_AMPS[type].description;
        });
        Object.keys(CUSTOM_PREAMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_PREAMPS[type].description;
        });
        Object.keys(CUSTOM_POWER_AMPS).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;processingGrid.appendChild(item);catalogDescriptions[type]=CUSTOM_POWER_AMPS[type].description;
        });
        const speakerCatalogSection=equipmentCatalog.querySelector('[data-template="spkPassiveWood"]').closest('.mb-6');
        Object.keys({...FLOOR_SPEAKERS,...BOOKSHELF_SPEAKERS,spkActiveRounded:{}}).forEach(type=>{
            const item=document.createElement('div');item.className='catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2';item.dataset.template=type;item.innerHTML=`<div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span>`;speakerCatalogSection.querySelector('.grid').appendChild(item);if(type!=='spkActiveRounded')catalogDescriptions[type]=(FLOOR_SPEAKERS[type]||BOOKSHELF_SPEAKERS[type]).description;
        });
        for(const [title,types] of [['Caixas Ativas',ACTIVE_SPK],['Caixas Passivas',PASSIVE_SPK],['Subwoofers',new Set([...SUB_TYPES,...PASSIVE_SUB_TYPES])]]){
            const section=document.createElement('div');section.className='mb-6';
            section.innerHTML=`<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">${title}</h3><div class="grid grid-cols-2 gap-3"></div>`;
            const grid=section.querySelector('.grid');
            [...speakerCatalogSection.querySelectorAll('.catalog-item')].filter(item=>types.has(item.dataset.template)).forEach(item=>grid.appendChild(item));
            speakerCatalogSection.before(section);
        }
        speakerCatalogSection.remove();
        const interfaceSection = document.createElement('div');
        interfaceSection.className = 'mb-6';
        interfaceSection.innerHTML = '<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Adaptadores & Conversores</h3><div class="grid grid-cols-2 gap-3">' + Object.entries(INTERFACE_DEVICES).map(([type,config])=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('') + '</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(interfaceSection);
        const furnitureSection=document.createElement('div');furnitureSection.className='mb-6';
        furnitureSection.innerHTML='<h3 class="text-[10px] font-bold text-gray-500 mb-3 tracking-wider uppercase">Móveis</h3><div class="grid grid-cols-2 gap-3">'+[...Object.keys(FURNITURE_TYPES),'pendantLamp'].map(type=>`<div class="catalog-item rounded-lg p-3 flex flex-col items-center justify-center gap-2" data-template="${type}"><div></div><span class="text-xs text-center text-gray-300">${DEVICE_NAMES[type]}</span></div>`).join('')+'</div>';
        equipmentCatalog.querySelector('.flex-1.overflow-y-auto').appendChild(furnitureSection);
        // Build the final catalogue by function after all generated models are present.
        const catalogContainer=equipmentCatalog.querySelector('.flex-1.overflow-y-auto');
        const catalogItems=[...catalogContainer.querySelectorAll('.catalog-item[data-template]')];
        const previousCatalogSections=[...catalogContainer.querySelectorAll('.mb-6')].filter(section=>section.querySelector('.catalog-item'));
        const catalogGroups=[
            ['Fontes de áudio',type=>TURNTABLE_TYPES.has(type)||['tapeDeck','streamer','cdPlayer'].includes(type)],
            ['Bluetooth',type=>BT_RX_TYPES.has(type)||BT_TX_TYPES.has(type)],
            ['Pré-amplificadores',type=>type==='preamp'||!!CUSTOM_PREAMPS[type]],
            ['Amplificadores integrados',type=>!!INTEGRATED_AMPS[type]||type==='streamIntegrated'],
            ['Receivers',type=>['receiver','powerAmp'].includes(type)],
            ['Amplificadores de potência',type=>['powerStereo','powerVintage'].includes(type)||!!CUSTOM_POWER_AMPS[type]],
            ['Amplificadores de fones',type=>type.startsWith('headphoneAmp')],
            ['Equalizadores',type=>EQ_TYPES.has(type)],
            ['Crossovers',type=>CROSSOVER_TYPES.has(type)],
            ['Mixers',type=>type==='mixer'||type==='mixerVintage'],
            ['Seletores',type=>SELECTOR_TYPES.has(type)||MATRIX_TYPES.has(type)],
            ['Medição & Análise',type=>SIGNAL_GENERATOR_TYPES.has(type)||['benchMeter','benchMeterVintage'].includes(type)],
            ['Adaptadores & Conversores',type=>!!INTERFACE_DEVICES[type]],
            ['Caixas Ativas',type=>ACTIVE_SPK.has(type)],
            ['Caixas Passivas · Bookshelf',type=>!!BOOKSHELF_SPEAKERS[type]||['spkPassiveCarbon','spkPassiveWood'].includes(type)],
            ['Caixas Passivas · Três vias',type=>['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type)],
            ['Caixas Passivas · Piso',type=>!!FLOOR_SPEAKERS[type]],
            ['Caixas Passivas',type=>PASSIVE_SPK.has(type)],
            ['Subwoofers',type=>SUB_TYPES.has(type)||PASSIVE_SUB_TYPES.has(type)],
            ['Fones de ouvido',type=>HP_TYPES.has(type)],
            ['Móveis',type=>!!FURNITURE_TYPES[type]||type==='pendantLamp'],
            ['DEBUG',type=>['hardwareDemo','lightPoint'].includes(type)]
        ];
        const catalogAssigned=new Set();
        const catalogItemName=item=>item.querySelector(':scope > span')?.textContent.trim()||DEVICE_NAMES[item.dataset.template]||item.dataset.template;
        const appendCatalogGroup=(title,items)=>{
            if(!items.length)return;
            const section=document.createElement('section');section.className='mb-6 catalog-category';
            const heading=document.createElement('h3');heading.className='text-[10px] font-bold text-gray-400 mb-3 tracking-wider uppercase';heading.textContent=title;
            const grid=document.createElement('div');grid.className='grid grid-cols-2 gap-3';
            const rackOrder=['furnitureRack','furnitureRackSix','furnitureRackTall','furnitureRackSixTall'];
            items.sort((a,b)=>{
                if(title==='Móveis'){
                    const ai=rackOrder.indexOf(a.dataset.template),bi=rackOrder.indexOf(b.dataset.template);
                    if(ai!==-1||bi!==-1){if(ai===-1)return 1;if(bi===-1)return-1;return ai-bi;}
                }
                return catalogItemName(a).localeCompare(catalogItemName(b),'pt-BR',{sensitivity:'base',numeric:true});
            }).forEach(item=>{catalogAssigned.add(item);item.dataset.catalogCategory=title;grid.appendChild(item);});
            section.append(heading,grid);catalogContainer.appendChild(section);
        };
        catalogGroups.forEach(([title,matches])=>appendCatalogGroup(title,catalogItems.filter(item=>!catalogAssigned.has(item)&&matches(item.dataset.template))));
        // Keep future, uncategorized equipment visible until it receives a dedicated group.
        appendCatalogGroup('Outros equipamentos',catalogItems.filter(item=>!catalogAssigned.has(item)));
        previousCatalogSections.forEach(section=>section.remove());
        document.querySelectorAll('.catalog-item[data-template]').forEach(item => {
            const oldIcon = item.firstElementChild;
            if (oldIcon) oldIcon.outerHTML = catalogIcon(item.dataset.template);
        });
        const contextHelp=document.createElement('aside');contextHelp.id='context-help';contextHelp.className='context-help';contextHelp.setAttribute('role','status');contextHelp.setAttribute('aria-live','polite');contextHelp.innerHTML='<strong></strong><span></span>';document.body.appendChild(contextHelp);
        let contextHelpTarget=null,contextHelpTimer=0,contextHelpPreviousDescription=null;
        function hideContextHelp(){clearTimeout(contextHelpTimer);contextHelp.classList.remove('is-visible');if(contextHelpTarget){if(contextHelpPreviousDescription)contextHelpTarget.setAttribute('aria-describedby',contextHelpPreviousDescription);else contextHelpTarget.removeAttribute('aria-describedby');}contextHelpTarget=null;contextHelpPreviousDescription=null;}
        function positionContextHelp(target){
            const rect=(target.closest('.device-node')||target).getBoundingClientRect(),tip=contextHelp.getBoundingClientRect(),gap=10,w=tip.width,h=tip.height,vw=innerWidth,vh=innerHeight;
            const candidates=[{x:rect.right+gap,y:rect.top+(rect.height-h)/2},{x:rect.left-w-gap,y:rect.top+(rect.height-h)/2},{x:rect.left+(rect.width-w)/2,y:rect.bottom+gap},{x:rect.left+(rect.width-w)/2,y:rect.top-h-gap}];
            const overlaps=(x,y)=>x<rect.right&&x+w>rect.left&&y<rect.bottom&&y+h>rect.top;
            const valid=candidates.find(({x,y})=>x>=8&&x+w<=vw-8&&y>=8&&y+h<=vh-8&&!overlaps(x,y));
            if(!valid)return false;
            contextHelp.style.left=`${valid.x}px`;contextHelp.style.top=`${valid.y}px`;return true;
        }
        function showContextHelp(target,delay=1000){
            if(!connectionGuidanceEnabled||!target)return;
            const port=target.closest('.port'),control=port?null:target.closest('button,input,select,[role="switch"],[role="slider"]');
            let heading='',message='';
            if(port){heading=port.dataset.baseTitle||port.getAttribute('aria-label')||'Conector';message=port.getAttribute('title')||`${port.dataset.io==='out'?'Saída':'Entrada'} ${port.dataset.format||port.dataset.type||'de áudio'} · sinal ${signalName(getPortSignal(port))}.`;}
            else if(control){heading=control.getAttribute('aria-label')||control.labels?.[0]?.textContent?.trim()||control.title||control.textContent.trim()||'Controle';message=control.title||control.getAttribute('aria-description')||control.labels?.[0]?.textContent?.trim()||'Ajuste este controle para configurar o equipamento.';}
            else return;
            if(!message||contextHelpTarget===target)return;
            hideContextHelp();contextHelpTarget=target;contextHelpPreviousDescription=target.getAttribute('aria-describedby');target.setAttribute('aria-describedby',[contextHelpPreviousDescription,'context-help'].filter(Boolean).join(' '));
            contextHelp.querySelector('strong').textContent=heading;contextHelp.querySelector('span').textContent=message;
            contextHelpTimer=setTimeout(()=>{if(!connectionGuidanceEnabled||!target.isConnected)return;if(positionContextHelp(target))contextHelp.classList.add('is-visible');},delay);
        }
        document.addEventListener('pointerover',event=>{if(event.pointerType==='touch'||!connectionGuidanceEnabled)return;const target=event.target instanceof Element?event.target:null;if(target?.closest('.device-node'))showContextHelp(target);});
        document.addEventListener('pointerout',event=>{const target=event.target instanceof Element?event.target:null,device=target?.closest('.device-node');if(!device||event.relatedTarget instanceof Node&&device.contains(event.relatedTarget))return;if(!contextHelpTarget||!device.contains(contextHelpTarget))return;if(!contextHelpTarget.matches(':focus')&&!contextHelpTarget.contains(document.activeElement))hideContextHelp();});
        document.addEventListener('focusin',event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('.device-node'))showContextHelp(target,0);});
        document.addEventListener('focusout',event=>{if(contextHelpTarget===event.target||contextHelpTarget?.contains(event.target))setTimeout(()=>{if(!contextHelpTarget?.matches(':hover')&&!contextHelpTarget?.contains(document.activeElement))hideContextHelp();},0);});
        const equipmentSearch = document.getElementById('equipment-search');
        const catalogSections = [...equipmentCatalog.querySelectorAll('.mb-6')].filter(section => section.querySelector('.catalog-item'));
        const catalogSearchSynonyms={optica:['optical','toslink','digital'],optical:['optica','toslink','digital'],digital:['optica','optical','toslink'],entrada:['input'],input:['entrada'],saida:['output'],output:['saida'],linha:['line'],line:['linha'],phono:['vinil','toca discos','riaa'],rca:['analogo','audio'],p2:['minijack','fone','headphone'],p10:['jack','fone','headphone','6 35 mm'],wire:['fio','borne','caixa passiva'],fio:['wire','borne','caixa passiva'],passiva:['passive','amplificado','speaker'],passivo:['passive','amplificado','speaker'],caixa:['speaker','alto falante'],fone:['headphone','p2','p10'],bluetooth:['sem fio','wireless'],potencia:['amplificado','speaker']};
        function catalogPortTerms(item){
            const type=item.dataset.template,template=document.getElementById(`tpl-${type}`),ports=template?[...template.content.querySelectorAll('.port')]:[];
            return ports.map(port=>{
                const kind=port.dataset.type||'',signal=port.dataset.signal||'',direction=port.dataset.io||'',format=port.dataset.format||'',node=port.dataset.node||'',title=port.getAttribute('title')||'';
                return `${kind} ${signal} ${direction} ${format} ${node} ${title} ${kind==='wire'?'fio borne speaker passiva amplificada':kind.startsWith('rca')?'rca analógico linha phono subwoofer':kind==='p2'?'p2 fone headphones estéreo':kind==='p10'?'p10 jack headphones microfone':''} ${signal==='line'?'linha audio analógico':signal==='phono'?'phono toca discos riaa':signal==='amplified'?'amplificado potência caixa passiva':signal==='headphone'?'fone headphone amplificado':''}`;
            }).join(' ');
        }
        const catalogSearchText=item=>normalizeSearch(`${item.textContent} ${DEVICE_NAMES[item.dataset.template]||''} ${catalogDescriptions[item.dataset.template]||''} ${item.dataset.catalogCategory||''} ${catalogPortTerms(item)}`);
        const searchEmpty = document.createElement('p');
        searchEmpty.className = 'p-4 text-sm text-gray-400 text-center';
        searchEmpty.setAttribute('role', 'status');
        searchEmpty.textContent = 'Nenhum equipamento encontrado.';
        searchEmpty.hidden = true;
        catalogSections[0]?.parentElement.appendChild(searchEmpty);
        const normalizeSearch = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        equipmentSearch.addEventListener('input', () => {
            const terms = normalizeSearch(equipmentSearch.value).split(/\s+/).filter(Boolean);
            let total = 0;
            catalogSections.forEach(section => {
                let visible = 0;
                section.querySelectorAll('.catalog-item').forEach(item => {
                    const text = catalogSearchText(item);
                    item.hidden = !terms.every(term => [term,...(catalogSearchSynonyms[term]||[])].some(candidate=>text.includes(normalizeSearch(candidate))));
                    if (!item.hidden) visible++;
                });
                section.hidden = visible === 0;
                total += visible;
            });
            searchEmpty.hidden = total > 0;
        });
        equipmentSearch.addEventListener('keydown', event => {
            if (event.key === 'Escape') { equipmentSearch.value = ''; equipmentSearch.dispatchEvent(new Event('input')); }
        });
        document.querySelectorAll('.catalog-item').forEach(item => {
            item.addEventListener('dragstart', e => e.preventDefault());
            item.addEventListener('pointerdown', e => {
                if (e.button !== 0) return;
                if(e.pointerType==='touch'&&!item.firstElementChild.contains(e.target)){
                    const start={x:e.clientX,y:e.clientY,id:e.pointerId};
                    const cleanup=()=>{item.removeEventListener('pointerup',tap);item.removeEventListener('pointercancel',cleanup);};
                    const tap=event=>{
                        cleanup();if(event.pointerId!==start.id||Math.hypot(event.clientX-start.x,event.clientY-start.y)>8)return;
                        const rect=canvas.getBoundingClientRect(),point=screenToWorld(rect.left+rect.width/2,rect.top+rect.height/2);
                        createDevice(item.dataset.template,point.x-150,point.y-70);playUiSound('drop');closeMobilePanels();
                        const added=state.devices[state.selectedDeviceId];
                        if(compactLayout.matches&&added){
                            const width=added.el.offsetWidth,height=added.el.offsetHeight,tools=document.querySelector('.canvas-tools'),usableHeight=Math.max(120,rect.height-tools.offsetHeight-40);
                            const zoom=clampZoom(Math.min(view.zoom,(rect.width-32)/width,(usableHeight-32)/height));
                            animateViewTo({zoom,x:(rect.width-width*zoom)/2-(parseFloat(added.el.style.left)||0)*zoom,y:(usableHeight-height*zoom)/2-(parseFloat(added.el.style.top)||0)*zoom});
                        }
                    };
                    item.addEventListener('pointerup',tap);item.addEventListener('pointercancel',cleanup);return;
                }
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
                const type = item.dataset.template;
                const rect = item.getBoundingClientRect();
                const cRect = canvas.getBoundingClientRect();
                
                const ghost = item.cloneNode(true);
                ghost.style.position = 'fixed';
                ghost.style.width = `${rect.width}px`;
                ghost.style.height = `${rect.height}px`;
                ghost.style.left = `${rect.left}px`;
                ghost.style.top = `${rect.top}px`;
                ghost.style.opacity = '0.8';
                ghost.style.pointerEvents = 'none';
                ghost.style.zIndex = '9999';
                document.body.appendChild(ghost);
                
                const offsetX = e.clientX - rect.left;
                const offsetY = e.clientY - rect.top;
                
                const move = ev => {
                    ev.preventDefault();
                    if(e.pointerType==='touch'&&Math.hypot(ev.clientX-e.clientX,ev.clientY-e.clientY)>8)closeMobilePanels();
                    ghost.style.left = `${ev.clientX - offsetX}px`;
                    ghost.style.top = `${ev.clientY - offsetY}px`;
                };
                
                const up = ev => {
                    window.removeEventListener('pointermove', move);
                    window.removeEventListener('pointerup', up);
                    ghost.remove();
                    
                    if (!ev.cancelled && ev.clientX > cRect.left && ev.clientX < cRect.right && ev.clientY > cRect.top && ev.clientY < cRect.bottom) {
                        const pos = screenToWorld(ev.clientX - offsetX + rect.width / 2, ev.clientY - offsetY + rect.height / 2);
                        createDevice(type, pos.x - rect.width / 2, pos.y - rect.height / 2);
                        playUiSound('drop');
                    }
                };
                
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
            });
        });

        function standardizeStereoPorts(root) {
            const channelOf = port => port?.dataset.channel || (/L$/.test(port?.dataset.node || '') ? 'L' : /R$/.test(port?.dataset.node || '') ? 'R' : '');
            [...root.querySelectorAll('*')].forEach(parent => {
                const units = [...parent.children].map(element => {
                    const ports = element.matches('.port') ? [element] : [...element.querySelectorAll('.port')];
                    return ports.length === 1 ? {element,port:ports[0],channel:channelOf(ports[0])} : null;
                }).filter(unit => unit?.channel);
                if (units.length !== 2 || new Set(units.map(unit=>unit.channel)).size !== 2 || units[0].port.dataset.io !== units[1].port.dataset.io) return;
                const groups = units.map(unit => {
                    const label = unit.element.previousElementSibling;
                    const hasLabel = label && !label.querySelector('.port') && !label.matches('.port') && label.textContent.trim() === unit.channel;
                    return {...unit,elements:hasLabel ? [label,unit.element] : [unit.element]};
                });
                const marker = document.createComment('stereo L/R');
                parent.insertBefore(marker,groups[0].elements[0]);
                groups.sort((a,b)=>a.channel==='L'?-1:1).forEach(group=>group.elements.forEach(element=>parent.insertBefore(element,marker)));
                marker.remove();
            });
            const textNodes = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
            while (textNodes.nextNode()) textNodes.currentNode.nodeValue = textNodes.currentNode.nodeValue.replace(/R\/L/g,'L/R');
        }

        const EXTRA_AUDIO_TYPES=new Set(['preamp','benchMeter','benchMeterVintage','tapeDeck']);
        function extraPair(io,node,signal){const label=signal==='phono'?'phono':'de linha';return `<div class="extra-pair">${['L','R'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}"${signal?` data-signal="${signal}"`:''} title="${io==='in'?'Entrada':'Saída'} ${label} ${ch}"></div>`).join('')}</div>`;}
        const tapeVuAngle=vu=>-48+94*Math.min(1,Math.max(0,10**(vu/20)/10**(3/20)));
        function extraVu(calibrated=false){
            if(!calibrated)return `<div class="extra-vu-pair">${['L','R'].map((ch,i)=>`<div class="extra-vu"><span>−20　−10　0　+3</span><i data-live-vu="${i}"></i><b>VU · ${ch}</b></div>`).join('')}</div>`;
            const point=(angle,radius)=>({x:50+Math.sin(angle*Math.PI/180)*radius,y:62-Math.cos(angle*Math.PI/180)*radius});
            const ticks=[-20,-10,-7,-5,-3,-2,-1,0,1,2,3].map(vu=>{
                const angle=tapeVuAngle(vu),a=point(angle,43),b=point(angle,47),text=point(angle,53);
                return `<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="${vu>0?'#a63326':'#3f4236'}" stroke-width=".8"/>${[-20,-10,0,3].includes(vu)?`<text x="${text.x}" y="${text.y}" fill="${vu>0?'#a63326':'#333b2d'}" text-anchor="middle" dominant-baseline="middle" font-size="6" font-family="Inter,sans-serif" font-weight="700">${vu>0?'+':''}${vu}</text>`:''}`;
            }).join('');
            return `<div class="extra-vu-pair">${['L','R'].map((ch,index)=>`<div class="extra-vu calibrated-tape-vu" title="VU ${ch} · 0 VU = −18 dBFS, referência senoidal"><svg viewBox="0 0 100 70" aria-label="VU ${ch}, referência de zero em menos 18 dBFS"><path d="M${point(-48,45).x} ${point(-48,45).y} A45 45 0 0 1 ${point(46,45).x} ${point(46,45).y}" fill="none" stroke="#6e705b" stroke-width=".7"/>${ticks}<text x="85" y="58" text-anchor="end" fill="#333b2d" font-family="Inter,sans-serif" font-size="7" font-weight="700">VU · ${ch}</text><line x1="50" y1="62" x2="50" y2="19" stroke="#29352b" stroke-width="1.1" data-live-vu="${index}" transform="rotate(-48 50 62)"/><circle cx="50" cy="62" r="2.1" fill="#303b2d"/></svg></div>`).join('')}</div>`;
        }

        function benchLcdMarkup(){
            return `<div class="bench-lcd"><header><span>VU · REF −18 dBFS</span><b data-bench-clip>CLIP</b></header>${['L','R'].map((ch,index)=>`<div class="bench-lcd-channel"><b>${ch}</b><div class="bench-lcd-bar" data-bench-lcd-bar="${index}" role="meter" aria-label="VU ${ch}" aria-valuemin="-20" aria-valuemax="3">${Array.from({length:46},(_,i)=>`<i class="${i>=40?'is-headroom':''}"></i>`).join('')}</div><output data-bench-lcd-value="${index}">−∞</output></div>`).join('')}<div class="bench-lcd-scale">${[-20,-10,-5,0,3].map(value=>`<span style="left:${(value+20)/23*100}%">${value>0?'+':''}${value}</span>`).join('')}</div><footer>STEREO LEVEL · VU</footer></div>`;
        }
        function updateCalibratedVuEnvelope(dev,elapsed){
            dev.vuEnvelope||=[0,0];
            [0,1].forEach(channel=>{
                const samples=dev.meters?.channels[channel]?.[0]?.data;let rectified=0;
                if(dev.powered&&state.audioCtx.state==='running'&&samples){for(const sample of samples)rectified+=Math.abs(sample);rectified=rectified/samples.length*Math.PI/2;}
                dev.vuEnvelope[channel]+=(rectified-dev.vuEnvelope[channel])*(1-Math.exp(-elapsed/.065));
            });
        }
        function updateBenchLcd(dev,now){
            const screen=dev.el.querySelector('.bench-lcd');if(!screen)return;screen.classList.toggle('is-off',!dev.powered);
            [0,1].forEach(channel=>{
                const vu=audioDb(dev.vuEnvelope?.[channel]||0)+18,silent=(dev.vuEnvelope?.[channel]||0)<.000001,lit=dev.powered?Math.round(Math.max(0,Math.min(1,(vu+20)/23))*46):0;
                const bar=screen.querySelector(`[data-bench-lcd-bar="${channel}"]`);
                [...bar.children].forEach((segment,index)=>segment.classList.toggle('is-lit',index<lit));
                const value=screen.querySelector(`[data-bench-lcd-value="${channel}"]`);value.textContent=!dev.powered?'—':silent?'−∞':(vu>0?'+':'')+vu.toFixed(1);
                bar.setAttribute('aria-valuenow',String(Math.max(-20,Math.min(3,vu))));bar.setAttribute('aria-valuetext',!dev.powered?'Desligado':silent?'Sem sinal':vu.toFixed(1)+' VU, zero em menos 18 dBFS');
            });
            screen.querySelector('[data-bench-clip]').classList.toggle('is-clipping',dev.powered&&now<(dev.meters?.clipUntil||0));
        }

        function extraDeviceMarkup(type){
            const power='<div class="extra-power" data-power-slot><button class="power-btn"></button></div>';
            if(type==='preamp')return `<div class="device-header"><span>Pré · Slim</span></div><section class="extra-rack preamp-face"><div class="preamp-inputs"><strong>PRÉ-AMPLIFICADOR</strong><div class="preamp-sources">${['AUX','CD','TAPE','PHONO'].map((name,i)=>`<div><button data-pre-source="${i+1}">${name}</button>${extraPair('in','in'+(i+1),i===3?'phono':undefined)}</div>`).join('')}</div></div><div class="preamp-knobs">${[['volume','VOLUME'],['bass','GRAVES'],['treble','AGUDOS']].map(([key,label])=>`<label><button class="receiver-dial" data-pre-knob="${key}" aria-label="${label}" role="slider" aria-valuemin="${key==='volume'?0:-12}" aria-valuemax="${key==='volume'?100:12}"></button><span>${label}</span></label>`).join('')}</div><div class="extra-io"><small>LINE OUT</small>${extraPair('out','out')}</div>${power}</section>`;
            if(BENCH_METER_TYPES.has(type))return `<div class="device-header"><span>${type==='benchMeterVintage'?'Medidor de bancada vintage':'Medidor de áudio de bancada'}</span></div><section class="extra-rack bench-face"><span class="bench-handle is-left" aria-hidden="true"><i></i></span><span class="bench-handle is-right" aria-hidden="true"><i></i></span><div class="extra-io"><small>LINE IN</small>${extraPair('in','in')}<small>LINE OUT</small>${extraPair('out','out')}</div>${type==='benchMeterVintage'?extraVu(true):benchLcdMarkup()}<div class="bench-screen"><canvas data-bench-spectrum width="360" height="72" aria-label="Espectro real dos canais L e R"></canvas><div class="correlation-scale"><span>−1</span><div><i data-correlation-dot></i></div><span>+1</span></div><output data-correlation-value>SEM SINAL</output></div>${power}</section>`;
            return `<div class="device-header"><span>Tape deck · rolo aberto</span></div><section class="tape-face"><header><strong>STEREO TAPE DECK</strong><span>OPEN REEL · TWO TRACK</span></header><div class="tape-reels">${[0,1].map(i=>`<div class="tape-reel reel-${i}"><div class="tape-winding"></div><div class="reel-metal"><svg viewBox="0 0 180 180" aria-hidden="true"><path fill="#bfc7c4" stroke="#e7ece7" stroke-width="1" fill-rule="evenodd" d="M90 3a87 87 0 1 1 0 174a87 87 0 1 1 0-174 M68 42a22 22 0 1 0 44 0a22 22 0 1 0-44 0 M26 116a22 22 0 1 0 44 0a22 22 0 1 0-44 0 M110 116a22 22 0 1 0 44 0a22 22 0 1 0-44 0"/><circle cx="90" cy="90" r="82" fill="none" stroke="#7f8b85" stroke-width="1.2"/><circle cx="90" cy="90" r="27" fill="#8f9b94" stroke="#e1e7de" stroke-width="2"/></svg><b></b></div></div>`).join('')}</div><div class="tape-threading" aria-label="Fita contornando as guias e passando pelos cabeçotes"><svg viewBox="0 0 462 274" aria-hidden="true"><path d="M39.4 147.1 L58.2 240.8 A9 9 0 0 0 67 248 H395 A9 9 0 0 0 404 240 L414.7 139.6" fill="none" stroke="#513723" stroke-width="2.2" stroke-linecap="butt"/><path d="M39.4 147.1 L58.2 240.8 M404 240 L414.7 139.6" fill="none" stroke="#997255" stroke-width=".5"/></svg><i class="tape-guide tape-guide-left"></i><i class="tape-guide tape-guide-right"></i><div class="tape-head-cover"><span>ANALOG · STEREO</span><small>PRECISION TAPE TRANSPORT</small></div></div><div class="tape-control-panel"><div class="tape-transport"><div><button data-tape-back aria-label="Retroceder dez segundos"><svg class="tape-transport-icon" viewBox="0 0 26 24" aria-hidden="true"><path d="M10 5 2 12l8 7V5Zm10 0-8 7 8 7V5Z"/></svg></button><button data-source-play aria-label="Reproduzir ou pausar fita" aria-pressed="false"><svg class="tape-transport-icon" viewBox="0 0 26 24" aria-hidden="true"><path d="M3 5v14l9-7Z"/><path d="M15 5h3v14h-3zM21 5h3v14h-3z"/></svg></button><button data-tape-stop aria-label="Parar e rebobinar"><svg class="tape-transport-icon" viewBox="0 0 26 24" aria-hidden="true"><path d="M7 7h10v10H7z"/></svg></button><button data-tape-forward aria-label="Avançar dez segundos"><svg class="tape-transport-icon" viewBox="0 0 26 24" aria-hidden="true"><path d="m3 5 8 7-8 7V5Zm10 0 8 7-8 7V5Z"/></svg></button></div></div>${extraVu(true)}<div class="tape-bottom"><div class="extra-io"><small>LINE OUT · L/R</small>${extraPair('out','out')}</div><label class="tape-level"><button class="receiver-dial" data-tape-level aria-label="Nível de saída" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="80"></button><small>OUTPUT</small></label>${power}</div></div></section>`;
        }
        function setupExtraRouting(dev){
            const context=state.audioCtx;
            if(dev.type==='preamp'){
                Object.assign(dev.state,{preSource:1,volume:.8,bass:0,treble:0});dev.preGates=[];dev.preFilters=[];
                ['L','R'].forEach(ch=>{
                    const summer=context.createGain(),low=context.createBiquadFilter(),high=context.createBiquadFilter(),volume=context.createGain(),power=context.createGain();
                    low.type='lowshelf';low.frequency.value=120;high.type='highshelf';high.frequency.value=4000;
                    summer.connect(low);low.connect(high);high.connect(volume);volume.connect(power);dev.nodes['out'+ch]=power;
                    for(let input=1;input<=4;input++){
                        const node=dev.nodes['in'+input+ch]=context.createGain(),gate=context.createGain();
                        if(input===4){
                            // PHONO: equalização RIAA de reprodução (inverso da saída PHONO do toca-discos) + ganho de nível phono para linha.
                            const riaaLow=context.createBiquadFilter(),riaaHigh=context.createBiquadFilter(),riaaGain=context.createGain();
                            riaaLow.type='lowshelf';riaaLow.frequency.value=120;riaaLow.gain.value=9;
                            riaaHigh.type='highshelf';riaaHigh.frequency.value=2122;riaaHigh.gain.value=-9;riaaGain.gain.value=ELECTRICAL_MODEL.phonoGain;
                            node.connect(riaaLow);riaaLow.connect(riaaHigh);riaaHigh.connect(riaaGain);connectPhonoPlayback(dev,riaaGain,gate);
                        }else node.connect(gate);
                        gate.connect(summer);dev.preGates.push({gate,input});
                    }
                    dev.preFilters.push({low,high,volume});(dev.powerNodes||=[]).push(power);
                });
                dev.applyPreamp=()=>{
                    const time=context.currentTime;
                    dev.preGates.forEach(({gate,input})=>gate.gain.setTargetAtTime(input===dev.state.preSource?1:0,time,.015));
                    dev.preFilters.forEach(({low,high,volume})=>{low.gain.setTargetAtTime(dev.state.bass,time,.02);high.gain.setTargetAtTime(dev.state.treble,time,.02);volume.gain.setTargetAtTime(dev.state.volume,time,.015);});
                    dev.el.querySelectorAll('[data-pre-source]').forEach(button=>{const selected=Number(button.dataset.preSource)===dev.state.preSource;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
                    dev.el.querySelectorAll('[data-pre-knob]').forEach(knob=>{
                        const key=knob.dataset.preKnob,fraction=key==='volume'?dev.state.volume:(dev.state[key]+12)/24;
                        knob.style.setProperty('--dial-angle',`${-135+fraction*270}deg`);knob.style.setProperty('--knob-angle',`${-135+fraction*270}deg`);knob.setAttribute('aria-valuenow',key==='volume'?Math.round(dev.state.volume*100):dev.state[key]);
                    });
                };dev.applyPreamp();
            }else if(BENCH_METER_TYPES.has(dev.type)){
                ['L','R'].forEach(ch=>{dev.nodes['in'+ch]=context.createGain();dev.nodes['out'+ch]=context.createGain();dev.nodes['in'+ch].connect(dev.nodes['out'+ch]);(dev.powerNodes||=[]).push(dev.nodes['out'+ch]);});
            }
        }
        function setupTapeAudio(dev){
            const context=state.audioCtx;Object.assign(dev.state,{tapeHiss:35,tapeWow:35,tapeVolume:.8});
            dev.tapeNodes=[];dev.tapeDepths=[];dev.tapeLevels=[];
            const wow=context.createOscillator(),flutter=context.createOscillator();wow.frequency.value=.55;flutter.frequency.value=6.3;
            ['L','R'].forEach(ch=>{
                const gen=dev.nodes['gen'+ch],power=dev.powerNodes[ch==='L'?1:0],delay=context.createDelay(.05),low=context.createBiquadFilter(),volume=context.createGain(),depth=context.createGain(),fine=context.createGain();
                gen.disconnect(power);delay.delayTime.value=.008;low.type='lowpass';low.frequency.value=15000;low.Q.value=.55;
                gen.connect(delay);delay.connect(low);low.connect(volume);volume.connect(power);
                depth.gain.value=.00045*.35;fine.gain.value=.000025*.35;wow.connect(depth);depth.connect(delay.delayTime);flutter.connect(fine);fine.connect(delay.delayTime);
                dev.tapeDepths.push(depth,fine);dev.tapeLevels.push(volume);dev.tapeNodes.push(delay,low,volume,depth,fine);
            });
            wow.start();flutter.start();dev.tapeOscillators=[wow,flutter];
            dev.applyTapeSettings=()=>{
                dev.tapeDepths.forEach((gain,index)=>gain.gain.setTargetAtTime((index%2?.000025:.00045)*dev.state.tapeWow/100,context.currentTime,.04));
                dev.tapeLevels.forEach(gain=>gain.gain.setTargetAtTime(dev.state.tapeVolume,context.currentTime,.02));
                dev.tapeHiss?.gain.gain.setTargetAtTime(dev.state.tapeHiss*.0003,context.currentTime,.03);
                const knob=dev.el.querySelector('[data-tape-level]');if(knob){knob.style.setProperty('--dial-angle',`${-135+dev.state.tapeVolume*270}deg`);knob.setAttribute('aria-valuenow',Math.round(dev.state.tapeVolume*100));}
            };dev.applyTapeSettings();
        }
        let tapeHissBuffer=null;
        function syncTapeHiss(dev){
            if(dev.type!=='tapeDeck')return;
            if(!dev.state.playing||!dev.powered){
                const voice=dev.tapeHiss;dev.tapeHiss=null;if(voice){const t=state.audioCtx.currentTime;voice.gain.gain.cancelAndHoldAtTime(t);voice.gain.gain.linearRampToValueAtTime(0,t+.012);voice.source.stop(t+.015);}return;
            }
            if(dev.tapeHiss)return;
            const context=state.audioCtx;
            if(!tapeHissBuffer){tapeHissBuffer=context.createBuffer(2,context.sampleRate*7,context.sampleRate);for(let ch=0;ch<2;ch++){const data=tapeHissBuffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.35;for(let i=0;i<256;i++){data[i]*=i/256;data[data.length-1-i]*=i/256;}}}
            const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter(),split=context.createChannelSplitter(2);
            source.buffer=tapeHissBuffer;source.loop=true;filter.type='highpass';filter.frequency.value=450;
            gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(dev.state.tapeHiss*.0003,context.currentTime+.035);
            source.connect(filter);filter.connect(gain);gain.connect(split);split.connect(dev.nodes.genL,0);split.connect(dev.nodes.genR,1);
            source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();split.disconnect();};source.start(0,Math.random()*5);dev.tapeHiss={source,gain};
        }
        function extraInspectorHtml(dev){
            if(dev.type==='preamp')return `<section class="flex flex-col gap-4"><label class="text-sm text-gray-300">Fonte<select id="preamp-source" class="w-full bg-gray-800 border border-gray-600 p-2 rounded">${['AUX','CD','TAPE','PHONO'].map((name,i)=>`<option value="${i+1}" ${dev.state.preSource===i+1?'selected':''}>${name}</option>`).join('')}</select></label>${[['volume','Volume',0,100,Math.round(dev.state.volume*100)],['bass','Graves (dB)',-12,12,dev.state.bass],['treble','Agudos (dB)',-12,12,dev.state.treble]].map(([key,label,min,max,value])=>`<label class="text-sm text-gray-300">${label} <output id="preamp-value-${key}">${value}</output><input type="range" data-preamp-setting="${key}" min="${min}" max="${max}" step="${key==='volume'?1:.5}" value="${value}"></label>`).join('')}<p class="text-xs text-gray-400">AUX, CD e TAPE recebem linha; PHONO recebe a cápsula MM do toca-discos. Ligue LINE OUT ao amplificador de potência. Os canais L/R permanecem separados.</p></section>`;
            if(BENCH_METER_TYPES.has(dev.type))return '<p class="text-sm text-gray-400">Ligue em série entre equipamentos de linha: entrada → medidor → saída. VU indica nível; correlação próxima de +1 indica canais semelhantes e valores negativos indicam oposição de fase. Sem sinal, a correlação não é calculada. Os VUs usam 0 VU = −18 dBFS como referência senoidal; +3 VU não indica saturação digital.</p><div class="text-sm text-gray-300">Correlação estéreo: <output id="bench-inspector-correlation">SEM SINAL</output></div>';
            if(dev.type==='tapeDeck')return `<section class="flex flex-col gap-4">${[['tapeVolume','Nível de saída',Math.round(dev.state.tapeVolume*100)]].map(([key,label,value])=>`<label class="text-sm text-gray-300">${label} <output id="tape-value-${key}">${value}%</output><input type="range" data-tape-setting="${key}" min="0" max="100" step="1" value="${value}"></label>`).join('')}${[['tapeHiss','Ruído de fita'],['tapeWow','Oscilação da fita']].map(([key,label])=>`<div class="flex flex-col gap-3"><span class="text-sm text-gray-300">${label}</span><div class="noise-level-buttons ${key==='tapeWow'?'noise-level-buttons--three':''}" role="group" aria-label="${label}">${(key==='tapeHiss'?[[0,'none'],[15,'low'],[35,'medium'],[65,'high']]:[[15,'low'],[35,'medium'],[65,'high']]).map(([value,level])=>{const selected=dev.state[key]===value;const name=key==='tapeWow'?`Oscilação ${level==='low'?'baixa':level==='medium'?'média':'alta'}`:level==='none'?'Sem ruído':`Ruído ${level==='low'?'baixo':level==='medium'?'médio':'alto'}`;return `<button type="button" class="tt-insp-btn noise-level-button ${selected?'is-on':''}" data-tape-preset="${key}" data-value="${value}" aria-label="${name}" title="${name}" aria-pressed="${selected}">${key==='tapeWow'?tapeWowLevelIcon(level):noiseLevelIcon(level)}</button>`}).join('')}</div></div>`).join('')}</section>`;
            return '';
        }
        function bindExtraInspector(dev){
            inspectorContent.querySelectorAll('[data-tape-preset]').forEach(button=>button.addEventListener('click',()=>{
                const key=button.dataset.tapePreset;dev.state[key]=Number(button.dataset.value);dev.applyTapeSettings();
                inspectorContent.querySelectorAll(`[data-tape-preset="${key}"]`).forEach(item=>{const selected=item===button;item.classList.toggle('is-on',selected);item.setAttribute('aria-pressed',String(selected));});
            }));
            document.getElementById('preamp-source')?.addEventListener('change',event=>{dev.state.preSource=Number(event.target.value);dev.applyPreamp();updateCableFlows();});
            inspectorContent.querySelectorAll('[data-preamp-setting]').forEach(input=>input.addEventListener('input',()=>{
                const key=input.dataset.preampSetting;dev.state[key]=Number(input.value)/(key==='volume'?100:1);dev.applyPreamp();document.getElementById('preamp-value-'+key).textContent=input.value;
            }));
            inspectorContent.querySelectorAll('[data-tape-setting]').forEach(input=>input.addEventListener('input',()=>{
                const key=input.dataset.tapeSetting;dev.state[key]=Number(input.value)/(key==='tapeVolume'?100:1);dev.applyTapeSettings();document.getElementById('tape-value-'+key).textContent=input.value+'%';
            }));
        }
        function bindExtraDevice(dev){
            const knobDrag=(knob,get,set,min,max)=>Hardware.bindKnob(knob,{get,set,min,max});
            if(dev.type==='preamp'){
                dev.el.querySelectorAll('[data-pre-source]').forEach(button=>button.onclick=()=>{dev.state.preSource=Number(button.dataset.preSource);dev.applyPreamp();updateCableFlows();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);});
                dev.el.querySelectorAll('[data-pre-knob]').forEach(knob=>{const key=knob.dataset.preKnob;knobDrag(knob,()=>dev.state[key],value=>{dev.state[key]=value;dev.applyPreamp();const input=document.querySelector(`[data-preamp-setting="${key}"]`);if(input&&state.selectedDeviceId===dev.id){input.value=key==='volume'?Math.round(value*100):value.toFixed(1);document.getElementById('preamp-value-'+key).textContent=input.value;}},key==='volume'?0:-12,key==='volume'?1:12);});
            }
            if(dev.type==='tapeDeck'){
                dev.el.querySelector('[data-tape-back]').onclick=()=>{const position=tapePosition(dev);if(dev.audioBuffer)seekSource(dev,position-10);else{dev.demoOffset=Math.max(0,position-10);dev.demoStartedAt=state.audioCtx.currentTime;}};
                dev.el.querySelector('[data-tape-forward]').onclick=()=>{const position=tapePosition(dev);if(dev.audioBuffer)seekSource(dev,position+10);else{dev.demoOffset=Math.min(180,position+10);dev.demoStartedAt=state.audioCtx.currentTime;}};
                dev.el.querySelector('[data-tape-stop]').onclick=async()=>{await setSourcePlaying(dev,false);dev.fileOffset=0;dev.demoOffset=0;};
                knobDrag(dev.el.querySelector('[data-tape-level]'),()=>dev.state.tapeVolume,value=>{dev.state.tapeVolume=value;dev.applyTapeSettings();const input=document.querySelector('[data-tape-setting="tapeVolume"]');if(input&&state.selectedDeviceId===dev.id){input.value=Math.round(value*100);document.getElementById('tape-value-tapeVolume').textContent=input.value+'%';}},0,1);
            }
        }
        function tapePosition(dev){return dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?state.audioCtx.currentTime-dev.demoStartedAt:0);}
        const needleMotion=new WeakMap();
        function dampedNeedle(needle,target,now,rest){
            const previous=needleMotion.get(needle)||{angle:rest,time:now-16};
            const elapsed=Math.max(0,Math.min(.25,(now-previous.time)/1000));
            const response=target>previous.angle?.14:.42;
            const angle=matchMedia('(prefers-reduced-motion: reduce)').matches?target:previous.angle+(target-previous.angle)*(1-Math.exp(-elapsed/response));
            needleMotion.set(needle,{angle,time:now});return angle;
        }
        let lastTransportFrame;
        function updateTransportMotion(now){
            const elapsed=lastTransportFrame==null?0:Math.max(0,Math.min(.1,(now-lastTransportFrame)/1000));lastTransportFrame=now;
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            Object.values(state.devices).forEach(dev=>{
                if(dev.type==='tapeDeck')updateTapeReels(dev,tapePosition(dev),elapsed,isSourceRunning(dev));
                if(!TURNTABLE_TYPES.has(dev.type))return;
                const running=dev.powered&&dev.state.tt?.running;
                const target=running?(dev.type==='turntableLinear'?(dev.state.tt.speed===45?45:100/3)*6*(1+dev.state.tt.pitch*.03):200*(dev.ttRate?.()||1)):0;
                const speed=dev.platterSpeed||0,response=running?.18:.65;
                let next=reduced?0:target+(speed-target)*Math.exp(-elapsed/response);
                if(!running&&next<.1)next=0;
                // Integrate speed to preserve the platter's phase through stop/start.
                const travel=reduced?0:target*elapsed+(speed-target)*response*(1-Math.exp(-elapsed/response));
                dev.platterSpeed=next;dev.platterAngle=((dev.platterAngle||0)+travel)%360;
                dev.el.style.setProperty('--tt-strobe-offset',(dev.platterAngle/360*80).toFixed(3)+'px');
                dev.updateLinearMotion?.(now,elapsed,reduced);
            });
        }
        function updateTapeReels(dev,seconds,elapsed,running){
            const duration=dev.audioBuffer?.duration||180;
            const target=Math.max(0,Math.min(duration,seconds));
            const previous=dev.tapeVisualPosition??target;
            const difference=target-previous;
            const visual=Math.abs(difference)<.03?target:previous+difference*(1-Math.exp(-elapsed/.22));
            dev.tapeVisualPosition=visual;
            const progress=visual/duration;
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            const delta=visual-previous;
            const radii=[Math.sqrt(28**2+(79**2-28**2)*(1-progress)),Math.sqrt(28**2+(79**2-28**2)*progress)];
            dev.tapeReelAngles||=[0,0];
            dev.el.querySelectorAll('.tape-reel').forEach((reel,index)=>{
                const radius=radii[index];reel.querySelector('.tape-winding').style.inset=(88-radius)+'px';
                const metal=reel.querySelector('.reel-metal');
                if(!reduced){dev.tapeReelAngles[index]=(dev.tapeReelAngles[index]+(Math.abs(delta)>.002?Math.max(-7,Math.min(7,delta))*130:running?elapsed*130:0)*(60/radius))%360;}
                metal.style.transform=`rotate(${dev.tapeReelAngles[index]}deg)`;
            });
            // The free tape leaves each changing winding tangentially toward its guide.
            const tangent=(cx,cy,r,px,py,side)=>{const dx=px-cx,dy=py-cy,d2=dx*dx+dy*dy,k=r*r/d2,t=r*Math.sqrt(Math.max(0,d2-r*r))/d2;return {x:cx+k*dx+side*t*(-dy),y:cy+k*dy+side*t*dx};};
            const a=tangent(109,133,radii[0],67,239,1),b=tangent(353,133,radii[1],395,239,-1);
            const paths=dev.el.querySelectorAll('.tape-threading>svg>path');
            paths[0]?.setAttribute('d',`M${a.x} ${a.y} L58.2 240.8 A9 9 0 0 0 67 248 H395 A9 9 0 0 0 404 240 L${b.x} ${b.y}`);
            paths[1]?.setAttribute('d',`M${a.x} ${a.y} L58.2 240.8 M404 240 L${b.x} ${b.y}`);
        }
        let lastExtraDisplay=0;
        function updateExtraDisplays(now){
            if(now-lastExtraDisplay<75)return;
            const elapsed=Math.min(.3,(now-lastExtraDisplay)/1000);lastExtraDisplay=now;
            Object.values(state.devices).forEach(dev=>{
                if(SIGNAL_GENERATOR_TYPES.has(dev.type)){updateSignalGeneratorDisplay(dev);return;}
                if(!EXTRA_AUDIO_TYPES.has(dev.type))return;
                if(dev.type==='tapeDeck'||BENCH_METER_TYPES.has(dev.type))updateCalibratedVuEnvelope(dev,elapsed);
                if(dev.type==='benchMeter')updateBenchLcd(dev,now);
                dev.el.querySelectorAll('[data-live-vu]').forEach(needle=>{
                    const channel=Number(needle.dataset.liveVu),level=dev.powered?(dev.meters?.levels[channel]||0):0;
                    if(dev.type==='tapeDeck'||BENCH_METER_TYPES.has(dev.type)){
                        const vu=audioDb(dev.vuEnvelope[channel])+18;
                        needle.setAttribute('transform',`rotate(${dampedNeedle(needle,tapeVuAngle(vu),now,-48)} 50 62)`);
                        needle.parentElement.setAttribute('aria-label',`VU ${channel?'R':'L'}: ${Number.isFinite(vu)?vu.toFixed(1):'menos infinito'} VU; referência 0 VU = −18 dBFS`);
                    }else needle.style.transform=`rotate(${dampedNeedle(needle,-48+Math.max(0,Math.min(1,(audioDb(level)+48)/48))*94,now,-48)}deg)`;
                });
                if(dev.type==='tapeDeck'){
                    const running=isSourceRunning(dev);dev.el.classList.toggle('tape-running',running);
                    return;
                }
                if(!BENCH_METER_TYPES.has(dev.type)||!dev.meters)return;
                const l=dev.meters.channels[0][0],r=dev.meters.channels[1][0];if(!l||!r)return;
                let lr=0,ll=0,rr=0;
                for(let i=0;i<l.data.length;i++){lr+=l.data[i]*r.data[i];ll+=l.data[i]**2;rr+=r.data[i]**2;}
                const correlation=dev.powered&&state.audioCtx.state==='running'&&ll>1e-7&&rr>1e-7?Math.max(-1,Math.min(1,lr/Math.sqrt(ll*rr))):null;
                const label=correlation===null?'SEM SINAL':correlation.toFixed(2);
                dev.el.querySelector('[data-correlation-value]').textContent='CORR · '+label;
                const dot=dev.el.querySelector('[data-correlation-dot]');dot.style.left=`${((correlation??0)+1)*50}%`;dot.style.opacity=correlation===null?'.2':'1';dot.style.background=correlation!==null&&correlation<0?'#f87171':'#6ee7b7';
                if(state.selectedDeviceId===dev.id){const output=document.getElementById('bench-inspector-correlation');if(output)output.textContent=label;}
                const canvas=dev.el.querySelector('[data-bench-spectrum]'),ctx=canvas.getContext('2d');ctx.fillStyle='#071316';ctx.fillRect(0,0,360,72);
                ctx.strokeStyle='#213b42';ctx.lineWidth=1;for(let y=12;y<72;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke();}
                [l,r].forEach((tap,index)=>{
                    const data=tap.frequencyData||=(new Float32Array(tap.analyzer.frequencyBinCount));tap.analyzer.getFloatFrequencyData(data);
                    ctx.beginPath();ctx.strokeStyle=index?'#f2bd65':'#65cbe1';
                    for(let x=0;x<=360;x+=3){const hz=20*1000**(x/360),bin=Math.min(data.length-1,Math.floor(hz*2/state.audioCtx.sampleRate*data.length));const db=dev.powered&&state.audioCtx.state==='running'?data[bin]:-100,y=68-Math.max(0,Math.min(1,(db+90)/90))*64;if(x)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();
                });
            });
        }

        const SIGNAL_FREQUENCIES=[20,50,100,200,440,1000,2000,5000,10000,20000];
        function signalHardwareSelector(key,label,options){
            return `<div class="signal-control"><span>${label}</span><div class="signal-hardware-selector" data-signal-selector="${key}" role="group" aria-label="${label}">${options.map(([value,text,title])=>`<button type="button" data-signal-choice="${key}" data-value="${value}" aria-pressed="false" title="${title||text}" aria-label="${title||text}">${text}</button>`).join('')}</div></div>`;
        }
        function generatorMarkup(){
            const stepper=(key,label)=>`<div class="signal-control"><span>${label}</span><div class="signal-stepper"><button type="button" data-signal-step="${key}" data-direction="-1" aria-label="Diminuir ${label.toLowerCase()}">−</button><button type="button" data-signal-step="${key}" data-direction="1" aria-label="Aumentar ${label.toLowerCase()}">+</button></div></div>`;
            return `<div class="device-header"><span>GERADOR DE SINAIS</span></div><section class="signal-face"><div class="signal-screen"><div class="signal-screen-heading"><strong data-signal-mode>SENOIDE</strong><b data-signal-status>PAUSADO</b></div><span data-signal-frequency>1.000 Hz</span><svg class="signal-waveform" viewBox="0 0 180 22" aria-label="Prévia ilustrativa da forma de onda"><path d="M0 11H180" class="signal-wave-axis"/><path data-signal-wave fill="none"/></svg><small data-signal-channel>L + R · NÍVEL 2/10</small><div class="signal-sweep-track" hidden><i data-signal-progress></i></div></div><div class="signal-control-bank">${signalHardwareSelector('signalMode','SINAL',[['sine','SENO','Senoide'],['sweep','VAR.','Varredura'],['pink','ROSA','Ruído rosa']])}${stepper('signalFrequency','FREQUÊNCIA')}${signalHardwareSelector('sweepSeconds','VARREDURA · s',[[10,'10'],[20,'20'],[30,'30'],[60,'60']])}${signalHardwareSelector('signalChannel','CANAL',[['L','L','Somente esquerdo'],['both','L+R','Esquerdo e direito'],['R','R','Somente direito']])}<div class="signal-control signal-level-control"><span>NÍVEL</span><button type="button" class="signal-level-knob" data-signal-level-knob role="slider" aria-label="Nível do gerador" aria-valuemin="0" aria-valuemax="10" aria-valuenow="2" title="Arraste para ajustar o nível"></button></div><div class="signal-control"><span>TRANSPORTE</span><button type="button" data-source-play aria-label="Reproduzir sinal">▶ / Ⅱ</button></div></div><div class="signal-ports"><div><div class="port" data-type="rca-l" data-io="out" data-node="outL" title="Saída de linha L"></div><small>L</small></div><div><div class="port" data-type="rca-r" data-io="out" data-node="outR" title="Saída de linha R"></div><small>R</small></div><span>LINE OUT</span></div><div data-power-slot><button class="power-btn"></button></div></section>`;
        }
        const SIGNAL_PIXEL_FONT={
            '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
            A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01110','10001','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['01110','00100','00100','00100','00100','00100','01110'],J:['00001','00001','00001','00001','10001','10001','01110'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
            '.':['0','0','0','0','0','0','1'],'/':['00001','00001','00010','00100','01000','10000','10000'],'+':['00000','00100','00100','11111','00100','00100','00000'],'-':['00000','00000','00000','11111','00000','00000','00000']
        };
        function drawVintageSignalDisplay(dev,{frequency,running,progress,phase,cycles}){
            const canvas=dev.el.querySelector('.signal-vintage-lcd');if(!canvas)return;const ctx=canvas.getContext('2d'),s=dev.state;
            ctx.imageSmoothingEnabled=false;ctx.fillStyle=dev.powered?'#29321f':'#24281e';ctx.fillRect(0,0,168,62);
            // Individual LCD cells stay visible under the active bitmap characters.
            ctx.fillStyle='#354027';for(let y=1;y<62;y+=2)for(let x=1;x<168;x+=2)ctx.fillRect(x,y,1,1);
            ctx.fillStyle=dev.powered?'#bccb72':'#414b30';
            function text(value,x,y,scale=1){
                for(const character of String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()){
                    const glyph=SIGNAL_PIXEL_FONT[character];if(glyph)glyph.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='1')ctx.fillRect(x+dx*scale,y+dy*scale,scale,scale);}));x+=6*scale;
                }
            }
            if(!dev.powered){text('STANDBY',8,26);return;}
            text(signalModeLabels[s.signalMode],3,2);text(running?(s.signalLevel?'ON':'ZERO'):'PAUSA',126,2);
            const readout=s.signalMode==='pink'?'20HZ-20KHZ':Math.round(frequency).toLocaleString('pt-BR')+' HZ';text(readout,3,14,2);
            text((s.signalChannel==='both'?'L+R':s.signalChannel)+' NIVEL '+s.signalLevel+'/10',3,33);
            if(s.signalMode==='sweep')text(s.sweepSeconds+'S',138,33);
            for(let x=0;x<164;x+=2){const wave=s.signalMode==='pink'?(Math.sin(x*1.73+phase)*.4+Math.sin(x*.41+phase*.7)*.35+Math.sin(x*.097+phase*.2)*.25):Math.sin(x/164*Math.PI*2*cycles-phase);ctx.fillRect(x+2,Math.round(50-wave*s.signalLevel/10*6),2,2);}
            if(s.signalMode==='sweep'){ctx.fillStyle='#55613b';ctx.fillRect(2,60,164,1);ctx.fillStyle='#bccb72';ctx.fillRect(2,60,Math.round(164*progress),1);}
        }

        const signalModeLabels={sine:'SENOIDE',sweep:'VARREDURA',pink:'RUÍDO ROSA'};
        function refreshSignalGeneratorControls(dev){
            const s=dev.state;
            dev.el.querySelectorAll('[data-signal-selector]').forEach(selector=>{
                const key=selector.dataset.signalSelector,buttons=[...selector.querySelectorAll('[data-signal-choice]')],index=buttons.findIndex(button=>String(s[key])===button.dataset.value),disabled=key==='sweepSeconds'&&s.signalMode!=='sweep';
                selector.style.setProperty('--selector-position',String(Math.max(0,index)/Math.max(1,buttons.length-1)));selector.classList.toggle('is-disabled',disabled);
                buttons.forEach((button,i)=>{button.setAttribute('aria-pressed',String(i===index));button.disabled=disabled;});
            });
            const knob=dev.el.querySelector('[data-signal-level-knob]');knob.setAttribute('aria-valuenow',String(s.signalLevel));knob.setAttribute('aria-valuetext',s.signalLevel+' de 10');knob.title=`Nível ${s.signalLevel}/10 · arraste para ajustar`;updateKnobAngle(dev,'[data-signal-level-knob]',s.signalLevel,0,10);
            dev.el.querySelectorAll('[data-signal-step]').forEach(button=>{
                const frequencyControl=button.dataset.signalStep==='signalFrequency',index=frequencyControl?SIGNAL_FREQUENCIES.indexOf(s.signalFrequency):s.signalLevel,max=frequencyControl?SIGNAL_FREQUENCIES.length-1:10;
                button.disabled=(frequencyControl&&s.signalMode!=='sine')||(Number(button.dataset.direction)<0?index<=0:index>=max);
            });
            if(state.selectedDeviceId===dev.id){
                [['mode',s.signalMode],['frequency',s.signalFrequency],['sweep',s.sweepSeconds],['channel',s.signalChannel],['level',s.signalLevel]].forEach(([key,value])=>{const input=document.getElementById('signal-'+key);if(input){input.value=value;if(key==='frequency')input.disabled=s.signalMode!=='sine';if(key==='sweep')input.disabled=s.signalMode!=='sweep';}});
                const label=document.getElementById('signal-level-value');if(label)label.textContent=s.signalLevel+'/10';
                const slider=document.getElementById('signal-level');if(slider){slider.setAttribute('aria-valuetext',s.signalLevel+' de 10');slider.nextElementSibling?.querySelectorAll('span').forEach((tick,index)=>tick.classList.toggle('is-current',index===s.signalLevel));}
            }
            updateSignalGeneratorDisplay(dev);
        }
        function updateSignalGeneratorDisplay(dev){
            const s=dev.state,running=dev.powered&&s.playing&&state.audioCtx?.state==='running',elapsed=running&&s.signalMode==='sweep'?Math.max(0,state.audioCtx.currentTime-(dev.signalSweepStartedAt||0)):0,progress=Math.min(1,elapsed/s.sweepSeconds),frequency=s.signalMode==='sweep'?20*1000**progress:s.signalFrequency;
            const screen=dev.el.querySelector('.signal-screen');screen.classList.toggle('is-off',!dev.powered);screen.dataset.running=String(running);
            screen.querySelector('[data-signal-mode]').textContent=signalModeLabels[s.signalMode];
            screen.querySelector('[data-signal-status]').textContent=!dev.powered?'DESLIGADO':running?(s.signalLevel?'ATIVO':'NÍVEL ZERO'):s.playing?'ÁUDIO SUSPENSO':'PAUSADO';
            screen.querySelector('[data-signal-frequency]').textContent=!dev.powered?'— — —':s.signalMode==='pink'?'20 Hz — 20 kHz':Math.round(frequency).toLocaleString('pt-BR')+' Hz';
            screen.querySelector('[data-signal-channel]').textContent=`${s.signalChannel==='both'?'L + R':s.signalChannel} · NÍVEL ${s.signalLevel}/10${s.signalMode==='sweep'?' · '+s.sweepSeconds+' s':''}`;
            screen.querySelector('.signal-sweep-track').hidden=s.signalMode!=='sweep'||!dev.powered;
            screen.querySelector('[data-signal-progress]').style.transform=`scaleX(${progress})`;
            const phase=running&&!matchMedia('(prefers-reduced-motion: reduce)').matches?state.audioCtx.currentTime*2:0,cycles=1+Math.max(0,Math.min(1,Math.log10(frequency/20)/3))*7,amplitude=dev.powered?s.signalLevel/10*9:0;
            const points=[];for(let x=0;x<=180;x+=3){const wave=s.signalMode==='pink'?(Math.sin(x*1.73+phase)*.4+Math.sin(x*.41+phase*.7)*.35+Math.sin(x*.097+phase*.2)*.25):Math.sin(x/180*Math.PI*2*cycles-phase);points.push(`${x===0?'M':'L'}${x} ${(11-wave*amplitude).toFixed(2)}`);}
            screen.querySelector('[data-signal-wave]').setAttribute('d',points.join(' '));
            if(dev.type==='signalGeneratorVintage')drawVintageSignalDisplay(dev,{frequency,running,progress,phase,cycles});
        }
        function setSignalGeneratorSetting(dev,key,value){
            if(!['signalMode','signalFrequency','signalLevel','signalChannel','sweepSeconds'].includes(key))return;
            dev.state[key]=value;configureSignalGenerator(dev);
            const s=dev.state,graph=dev.signalGraph,t=state.audioCtx.currentTime;
            if(graph&&(key==='signalLevel'||key==='signalChannel')){
                graph.gain.gain.setTargetAtTime(s.signalLevel/10*.2,t,.015);
                graph.left.gain.setTargetAtTime(s.signalChannel==='R'?0:1,t,.015);graph.right.gain.setTargetAtTime(s.signalChannel==='L'?0:1,t,.015);
            }else if(key==='signalMode'||(key==='signalFrequency'&&s.signalMode==='sine')||(key==='sweepSeconds'&&s.signalMode==='sweep'))syncSignalGenerator(dev);
            refreshSignalGeneratorControls(dev);updateCableFlows();scheduleProjectSave();
        }
        function bindSignalGeneratorPanel(dev){
            const knob=dev.el.querySelector('[data-signal-level-knob]');
            Hardware.bindKnob(knob,{get:()=>dev.state.signalLevel,set:value=>setSignalGeneratorSetting(dev,'signalLevel',value),min:0,max:10});

            dev.el.querySelectorAll('[data-signal-choice]').forEach(button=>button.addEventListener('click',event=>{
                event.stopPropagation();const key=button.dataset.signalChoice;setSignalGeneratorSetting(dev,key,key==='sweepSeconds'?Number(button.dataset.value):button.dataset.value);
            }));
            dev.el.querySelectorAll('[data-signal-step]').forEach(button=>button.addEventListener('click',event=>{
                event.stopPropagation();const key=button.dataset.signalStep,direction=Number(button.dataset.direction);
                setSignalGeneratorSetting(dev,key,key==='signalFrequency'?SIGNAL_FREQUENCIES[Math.max(0,Math.min(SIGNAL_FREQUENCIES.length-1,SIGNAL_FREQUENCIES.indexOf(dev.state[key])+direction))]:Math.max(0,Math.min(10,dev.state[key]+direction)));
            }));
        }
        function configureSignalGenerator(dev){
            const s=dev.state;
            s.signalMode=['sine','sweep','pink'].includes(s.signalMode)?s.signalMode:'sine';
            s.signalFrequency=SIGNAL_FREQUENCIES.includes(s.signalFrequency)?s.signalFrequency:1000;
            s.signalLevel=Number.isFinite(s.signalLevel)?Math.max(0,Math.min(10,Math.round(s.signalLevel))):2;
            s.signalChannel=['both','L','R'].includes(s.signalChannel)?s.signalChannel:'both';
            s.sweepSeconds=[10,20,30,60].includes(s.sweepSeconds)?s.sweepSeconds:20;
            refreshSignalGeneratorControls(dev);
        }
        function stopSignalGenerator(dev){
            clearTimeout(dev.signalSweepTimer);dev.signalSweepTimer=null;
            const graph=dev.signalGraph;if(!graph)return;dev.signalGraph=null;
            const now=state.audioCtx.currentTime;graph.gain.gain.cancelScheduledValues(now);graph.gain.gain.setTargetAtTime(0,now,.004);
            try{graph.source.stop(now+.03);}catch{}
            graph.source.onended=()=>graph.nodes.forEach(node=>{try{node.disconnect();}catch{}});
        }
        function syncSignalGenerator(dev){
            if(!SIGNAL_GENERATOR_TYPES.has(dev.type))return;
            stopSignalGenerator(dev);configureSignalGenerator(dev);
            if(!dev.state.playing||!dev.powered)return;
            const context=state.audioCtx,s=dev.state,gain=context.createGain();gain.gain.value=0;
            let source;
            if(s.signalMode==='pink'){
                const buffer=context.createBuffer(1,context.sampleRate*8,context.sampleRate),data=buffer.getChannelData(0);
                let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
                for(let i=0;i<data.length;i++){const white=Math.random()*2-1;b0=.99886*b0+white*.0555179;b1=.99332*b1+white*.0750759;b2=.969*b2+white*.153852;b3=.8665*b3+white*.3104856;b4=.55*b4+white*.5329522;b5=-.7616*b5-white*.016898;data[i]=(b0+b1+b2+b3+b4+b5+b6+white*.5362)*.11;b6=white*.115926;}
                source=context.createBufferSource();source.buffer=buffer;source.loop=true;
            }else{source=context.createOscillator();source.type='sine';source.frequency.value=s.signalMode==='sweep'?20:s.signalFrequency;}
            const left=context.createGain(),right=context.createGain();left.gain.value=s.signalChannel==='R'?0:1;right.gain.value=s.signalChannel==='L'?0:1;
            const shaping=[];if(s.signalMode==='pink'){const high=context.createBiquadFilter(),low=context.createBiquadFilter();high.type='highpass';high.frequency.value=20;low.type='lowpass';low.frequency.value=Math.min(20000,context.sampleRate*.45);source.connect(high);high.connect(low);low.connect(gain);shaping.push(high,low);}else source.connect(gain);gain.connect(left);gain.connect(right);left.connect(dev.nodes.genL);right.connect(dev.nodes.genR);
            gain.gain.setTargetAtTime(s.signalLevel/10*.2,context.currentTime,.015);
            dev.signalGraph={source,gain,left,right,nodes:[source,gain,left,right,...shaping]};source.start();
            if(s.signalMode==='sweep'){
                const sweep=()=>{if(dev.signalGraph?.source!==source)return;const now=context.currentTime;dev.signalSweepStartedAt=now;source.frequency.cancelScheduledValues(now);source.frequency.setValueAtTime(20,now);source.frequency.exponentialRampToValueAtTime(20000,now+s.sweepSeconds);source.frequency.setValueAtTime(20,now+s.sweepSeconds+.03);dev.signalSweepTimer=setTimeout(sweep,(s.sweepSeconds+.03)*1000);};sweep();
            }
        }
        function signalInspectorHtml(dev){const s=dev.state;return `<section class="signal-properties"><label>Sinal<select id="signal-mode">${[['sine','Senoide'],['sweep','Varredura'],['pink','Ruído rosa']].map(([v,n])=>`<option value="${v}" ${s.signalMode===v?'selected':''}>${n}</option>`).join('')}</select></label><label>Frequência da senoide<select id="signal-frequency">${SIGNAL_FREQUENCIES.map(f=>`<option value="${f}" ${s.signalFrequency===f?'selected':''}>${f.toLocaleString('pt-BR')} Hz</option>`).join('')}</select></label><label>Duração da varredura<select id="signal-sweep">${[10,20,30,60].map(v=>`<option value="${v}" ${s.sweepSeconds===v?'selected':''}>${v} segundos</option>`).join('')}</select></label><label>Canal<select id="signal-channel">${[['both','L + R'],['L','Somente L'],['R','Somente R']].map(([v,n])=>`<option value="${v}" ${s.signalChannel===v?'selected':''}>${n}</option>`).join('')}</select></label><label>Nível <output id="signal-level-value">${s.signalLevel}/10</output><input id="signal-level" type="range" min="0" max="10" step="1" value="${s.signalLevel}"></label><p>Saída de linha RCA. Varredura logarítmica de 20 Hz a 20 kHz em repetição. Use o espectro de um equalizador ou medidor para observar a resposta.</p></section>`;}
        function bindSignalInspector(dev){
            [['mode','signalMode',String],['frequency','signalFrequency',Number],['sweep','sweepSeconds',Number],['channel','signalChannel',String],['level','signalLevel',Number]].forEach(([id,key,parse])=>document.getElementById('signal-'+id).addEventListener(id==='level'?'input':'change',event=>setSignalGeneratorSetting(dev,key,parse(event.target.value))));
            refreshSignalGeneratorControls(dev);
        }
        function expandFurnitureGroup(devices){
            if(!devices.some(dev=>FURNITURE_TYPES[dev.type]))return devices;
            const group=new Map(devices.map(dev=>[dev.id,dev]));
            const boxes=new Map(Object.values(state.devices).map(dev=>[dev.id,{
                dev,x:parseFloat(dev.el.style.left)||0,y:parseFloat(dev.el.style.top)||0,w:dev.el.offsetWidth,h:dev.el.offsetHeight
            }]));
            const belongsTo=(box,support)=>{
                const overlap=Math.min(box.x+box.w,support.x+support.w)-Math.max(box.x,support.x);
                if(overlap<=.5)return false;
                const config=FURNITURE_TYPES[support.dev.type];
                if(config){
                    // Keep every item inside a bay, including deliberately floating
                    // placements. A table's open space below its top is not a bay.
                    const insideWidth=box.x>=support.x+config.inset-.5&&box.x+box.w<=support.x+support.w-config.inset+.5;
                    const insideBay=insideWidth&&(config.rack||config.back)&&config.surfaces.some((surface,i)=>i>0&&box.y>=support.y+config.surfaces[i-1]+(config.rack?16:20)-.5&&box.y+box.h<=support.y+surface+.5);
                    if(insideBay)return true;
                    // Include contact and the full visible-foot gap, even on a top
                    // with a small overhang. No attraction changes that spacing.
                    return config.surfaces.some(surface=>{const gap=support.y+surface-box.y-box.h;return gap>=-.5&&gap<=STACK_FEET.height+.5;});
                }
                const gap=support.y-box.y-box.h;
                return gap>=-.5&&gap<=STACK_FEET.height+.5&&overlap>=Math.min(box.w,support.w)*.7;
            };
            let changed=true;
            while(changed){
                changed=false;
                for(const box of boxes.values()){
                    if(group.has(box.dev.id))continue;
                    if([...group.keys()].some(id=>belongsTo(box,boxes.get(id)))){group.set(box.dev.id,box.dev);changed=true;}
                }
            }
            return [...group.values()];
        }
        const ROOM_PRESETS={near:{name:'Audição próxima',decay:.18,predelay:.004,tone:12500},small:{name:'Sala pequena',decay:.65,predelay:.012,tone:8500},large:{name:'Sala ampla',decay:1.7,predelay:.025,tone:6500}};
        function setupRoomAudio(){
            const context=state.audioCtx,input=state.masterGain,dry=context.createGain(),wet=context.createGain(),convolver=context.createConvolver(),delay=context.createDelay(.1),filter=context.createBiquadFilter();
            filter.type='lowpass';input.connect(dry);dry.connect(context.destination);input.connect(delay);delay.connect(convolver);convolver.connect(filter);filter.connect(wet);wet.connect(context.destination);
            state.roomAudio={dry,wet,convolver,delay,filter,preset:null,impulses:new Map()};applyRoomAudio();
        }
        function applyRoomAudio(){
            const s=state.environment||(state.environment={preset:'near',intensity:0}),preset=ROOM_PRESETS[s.preset]||ROOM_PRESETS.near,graph=state.roomAudio;if(!graph)return;
            const context=state.audioCtx,t=context.currentTime;
            if(graph.preset!==s.preset){
                if(!graph.impulses.has(s.preset)){
                    const length=Math.ceil(context.sampleRate*preset.decay),buffer=context.createBuffer(2,length,context.sampleRate);let seed=5371;
                    for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=((seed/4294967296)*2-1)*Math.pow(1-i/length,2.5);}}
                    graph.impulses.set(s.preset,buffer);
                }
                graph.convolver.buffer=graph.impulses.get(s.preset);graph.preset=s.preset;
            }
            graph.delay.delayTime.setTargetAtTime(preset.predelay,t,.03);graph.filter.frequency.setTargetAtTime(preset.tone,t,.03);
            graph.dry.gain.setTargetAtTime(1-s.intensity*.018,t,.04);graph.wet.gain.setTargetAtTime(s.intensity*.045,t,.04);
        }


        function streamIntegratedMarkup(){
            const icon=(path)=>`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${path}</svg>`;
            const pair=(io,node,signal,kind='rca')=>`<div class="stream-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${kind==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${kind==='wire'?'data-role="amp-speaker-out"':''} title="${signal==='amplified'?'Caixa passiva':io==='in'?'Entrada de linha':'Pré-out variável'} · ${ch}"></div>`).join('')}</div>`;
            return `<div class="device-header"><span>Streamer Integrado</span></div><section class="stream-console">
                <div class="stream-top"><i class="stream-top-seam"></i><div class="stream-volume-well"><button data-stream-volume role="slider" aria-label="Volume principal" title="Volume · arraste ou use as setas; duplo clique para silenciar"></button><span class="stream-dial-value" aria-hidden="true"><b data-stream-volume-number>30</b><small>VOLUME</small></span></div></div>
                <div class="stream-housing" aria-hidden="true"></div>
                <div class="stream-heat-sink stream-heat-left"></div><div class="stream-heat-sink stream-heat-right"></div>
                <div class="stream-glass"><div class="stream-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button></div><div class="stream-phone"><div class="port" data-type="p2" data-io="out" data-node="outPhone" data-signal="headphone" title="Fones P2 estéreo · silencia as caixas ao conectar"></div><small>PHONES</small></div>
                    <section class="stream-screen" aria-label="Tela do streamer"><header><span data-stream-source-label>DEMONSTRAÇÃO</span><span data-stream-state>PAUSADO</span></header>
                        <div class="stream-now"><button class="stream-cover" data-button-model="ui" data-stream-cover title="Informações da faixa" aria-label="Mostrar informações da faixa"><img src="assets/artwork/stream-cover.svg" alt="Capa da faixa"></button><div class="stream-track"><strong data-stream-title>Horizonte azul</strong><span data-stream-artist>Sessão de demonstração</span><span data-stream-album>Escuta tranquila</span><small data-stream-format>FONTE INTERNA</small></div></div>
                        <div class="stream-track-info" hidden><strong data-stream-info-title>Informações da reprodução</strong><p data-stream-info></p><button data-button-model="ui" data-stream-back>VOLTAR</button></div>
                        <div class="stream-home" hidden><span>ESCOLHA A FONTE</span><button data-button-model="ui" data-stream-input="library" aria-label="Selecionar música interna"><span class="stream-input-icon" aria-hidden="true">${icon('<path d="M9 18V5l12-2v13M9 8l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')}</span><b>Música</b><small>Arquivo / demonstração</small></button><button data-button-model="ui" data-stream-input="line" aria-label="Selecionar entrada de linha"><span class="stream-input-icon" aria-hidden="true">${icon('<path d="M8 3v5m8-5v5M6 8h12v4a6 6 0 0 1-12 0ZM12 18v4"/>')}</span><b>Linha</b><small>Entrada RCA estéreo</small></button></div>
                        <div class="stream-timeline"><input type="range" data-stream-seek data-hardware-slider="seek" min="0" max="180" step="0.1" value="0" aria-label="Posição da faixa"><div><time data-stream-elapsed>0:00</time><span data-stream-screen-volume>VOL 30</span><time data-stream-duration>3:00</time></div></div>
                        <div class="stream-line-view" hidden><div class="stream-line-heading"><strong>LINHA</strong><small>ESPECTRO · ENTRADA RCA</small></div><div class="stream-spectra">${['L','R'].map((ch,i)=>`<div class="stream-spectrum-row" data-stream-spectrum="${i}"><b>${ch}</b><svg viewBox="0 0 240 32" role="img" aria-label="Espectro de frequência da entrada ${ch}"><path class="stream-spectrum-grid" d="M0 10h240M0 20h240M0 30h240M80 0v30m80-30v30"/><path data-stream-spectrum-fill d="M0 30H240Z"/><path data-stream-spectrum-trace d="M0 30H240"/></svg></div>`).join('')}</div><div class="stream-spectrum-scale"><small>20 Hz</small><small>1 kHz</small><small>20 kHz</small></div></div>
                    </section><div class="stream-front-keys">
                        <button data-stream-action="home" data-button-model="roundKey" title="Fontes / tela de reprodução" aria-label="Abrir menu de fontes">${icon('<path d="m3 11 9-8 9 8M6 9v12h12V9M10 21v-7h4v7"/>')}</button>
                        <button data-stream-action="back" data-button-model="roundKey" title="Retroceder 10 segundos" aria-label="Retroceder 10 segundos">${icon('<path d="M5 5v14m14-14-10 7 10 7Z"/>')}</button>
                        <button data-source-play data-stream-action="play" data-button-model="roundKey" title="Reproduzir / pausar música interna" aria-label="Reproduzir ou pausar">${icon('<path data-stream-play-symbol d="m8 4 12 8-12 8Z"/>')}</button>
                        <button data-stream-action="next" data-button-model="roundKey" title="Avançar 10 segundos" aria-label="Avançar 10 segundos">${icon('<path d="M19 5v14M5 5l10 7-10 7Z"/>')}</button>
                        <button data-stream-action="mute" data-button-model="roundKey" title="Silenciar / restaurar volume" aria-label="Silenciar ou restaurar volume" aria-pressed="false">${icon('<path d="M3 9v6h4l5 5V4L7 9Zm13-1 5 8m0-8-5 8"/>')}</button>
                    </div><div class="stream-glass-reflection" aria-hidden="true"></div></div>
                <div class="stream-service-rail"><label><small>LINE IN</small>${pair('in','line','line')}</label><label><small>PRE OUT</small>${pair('out','pre','line')}</label><label><small>SPEAKERS · L / R</small>${pair('out','speaker','amplified','wire')}</label></div><i class="stream-foot stream-foot-left"></i><i class="stream-foot stream-foot-right"></i>
            </section>`;
        }
        function readStreamMetadata(buffer){
            const result={title:readAudioTrackTitle(buffer),artist:'',album:'',cover:null};
            try{
                const bytes=new Uint8Array(buffer),view=new DataView(buffer),ascii=(a,b)=>String.fromCharCode(...bytes.subarray(a,b));
                const text=frame=>new TextDecoder(frame[0]===0?'iso-8859-1':frame[0]===1?(frame[1]===0xfe&&frame[2]===0xff?'utf-16be':'utf-16le'):frame[0]===2?'utf-16be':'utf-8').decode(frame.subarray(1)).replace(/\u0000/g,' ').replace(/^\uFEFF/,'').trim().slice(0,240);
                const picture=(mime,data)=>{if(['image/jpeg','image/png','image/webp'].includes(mime)&&data.length>0&&data.length<=4*1024*1024)result.cover=new Blob([data],{type:mime});};
                if(bytes.length>10&&ascii(0,3)==='ID3'&&[3,4].includes(bytes[3])&&!(bytes[5]&0x80)){
                    const sync=o=>(bytes[o]<<21)|(bytes[o+1]<<14)|(bytes[o+2]<<7)|bytes[o+3],version=bytes[3],end=Math.min(bytes.length,10+sync(6),16*1024*1024);let offset=10;
                    if(bytes[5]&0x40)offset+=version===3?4+view.getUint32(offset):sync(offset);
                    while(offset+10<=end){
                        const id=ascii(offset,offset+4),size=version===4?sync(offset+4):view.getUint32(offset+4);if(!/^[A-Z0-9]{4}$/.test(id)||size<1||offset+10+size>end)break;
                        if(!bytes[offset+9]){
                            const frame=bytes.subarray(offset+10,offset+10+size);
                            if(id==='TIT2')result.title=text(frame);if(id==='TPE1')result.artist=text(frame);if(id==='TALB')result.album=text(frame);
                            if(id==='APIC'&&!result.cover){
                                let p=1;while(p<frame.length&&frame[p])p++;const mime=new TextDecoder().decode(frame.subarray(1,p)).toLowerCase();p+=2;
                                const width=frame[0]===1||frame[0]===2?2:1;
                                while(p+width<=frame.length&&(frame[p]||width===2&&frame[p+1]))p+=width;p+=width;
                                picture(mime,frame.slice(p));
                            }
                        }
                        offset+=10+size;
                    }
                }else if(bytes.length>8&&ascii(0,4)==='fLaC'){
                    let offset=4;
                    while(offset+4<=bytes.length&&offset<16*1024*1024){
                        const type=bytes[offset]&127,last=bytes[offset]&128,size=(bytes[offset+1]<<16)|(bytes[offset+2]<<8)|bytes[offset+3],start=offset+4,end=start+size;if(end>bytes.length)break;
                        if(type===4){
                            let p=start;const length=()=>{if(p+4>end)throw Error('Metadata truncada');const n=view.getUint32(p,true);p+=4;return n;};
                            const vendor=length();p+=vendor;const count=Math.min(1000,length());for(let i=0;i<count;i++){const n=length();if(p+n>end)break;const entry=new TextDecoder().decode(bytes.subarray(p,p+n)),split=entry.indexOf('='),key=entry.slice(0,split).toUpperCase(),value=entry.slice(split+1).slice(0,240);if(key==='TITLE')result.title=value;if(key==='ARTIST')result.artist=value;if(key==='ALBUM')result.album=value;p+=n;}
                        }else if(type===6&&!result.cover){
                            let p=start;const length=()=>{if(p+4>end)throw Error('Capa truncada');const n=view.getUint32(p);p+=4;return n;};
                            length();const mimeLength=length();if(p+mimeLength>end)break;const mime=new TextDecoder().decode(bytes.subarray(p,p+mimeLength));p+=mimeLength;const desc=length();p+=desc+16;const dataLength=length();if(p+dataLength<=end)picture(mime,bytes.slice(p,p+dataLength));
                        }
                        offset=end;if(last)break;
                    }
                }
            }catch{}
            return result;
        }
        function configureStreamIntegrated(dev){
            const ctx=state.audioCtx,el=dev.el,owned=dev.modelAudioNodes||=[];
            const gain=(value=1)=>{const node=ctx.createGain();node.gain.value=value;owned.push(node);return node;};
            Object.assign(dev.state,{volume:.3,streamInput:'library',streamMute:false,streamPage:'playing'});
            dev.streamChannels=[];dev.powerNodes=[];dev.nodes.outPhone=ctx.createChannelMerger(2);owned.push(dev.nodes.outPhone);
            for(const [index,ch]of ['L','R'].entries()){
                const internal=dev.nodes['gen'+ch]=gain(0),line=dev.nodes['line'+ch]=gain(),internalGate=gain(),lineGate=gain(0),bus=gain(),volume=gain(.3),power=gain(),speaker=dev.nodes['speaker'+ch]=gain(),pre=dev.nodes['pre'+ch]=gain();
                internal.connect(internalGate);line.connect(lineGate);internalGate.connect(bus);lineGate.connect(bus);bus.connect(volume);volume.connect(power);power.connect(speaker);power.connect(pre);power.connect(dev.nodes.outPhone,0,index);
                dev.streamChannels.push({internalGate,lineGate,volume,speaker});dev.powerNodes.push(power);
            }
            dev.streamSpectra=['L','R'].map((ch,i)=>{
                const analyzer=ctx.createAnalyser();analyzer.fftSize=2048;analyzer.smoothingTimeConstant=.72;analyzer.minDecibels=-90;analyzer.maxDecibels=-10;
                dev.nodes['line'+ch].connect(analyzer);owned.push(analyzer);
                const row=el.querySelector(`[data-stream-spectrum="${i}"]`);
                return {analyzer,data:new Float32Array(analyzer.frequencyBinCount),trace:row.querySelector('[data-stream-spectrum-trace]'),fill:row.querySelector('[data-stream-spectrum-fill]')};
            });
            const q=selector=>el.querySelector(selector),position=()=>dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?ctx.currentTime-dev.demoStartedAt:0);
            dev.refreshStreamDisplay=()=>{
                const st=dev.state,library=st.streamInput==='library',duration=dev.audioBuffer?.duration||180;
                if(!dev.audioBuffer&&st.playing&&position()>=duration){if(st.repeat){dev.demoOffset=0;dev.demoStartedAt=ctx.currentTime;}else {setSourcePlaying(dev,false);dev.demoOffset=0;}}
                const seconds=Math.min(duration,position()),volume=Math.round(st.volume*100),page=st.streamPage;
                el.dataset.streamPage=page;el.classList.toggle('stream-muted',!!st.streamMute);
                q('[data-stream-volume-number]').textContent=st.streamMute?'—':volume;
                q('[data-stream-volume]').style.setProperty('--knob-angle',`${-135+st.volume*270}deg`);q('[data-stream-volume]').style.setProperty('--hw-halo-value',`${st.volume*270}deg`);
                const dial=q('[data-stream-volume]'),angle=(-135+st.volume*270)*Math.PI/180;dial.style.setProperty('--stream-rim-offset',`${st.volume*60}px`);dial.style.setProperty('--stream-index-offset',`${Math.sin(angle)*64}px`);dial.style.setProperty('--stream-index-visible',Math.cos(angle)>0?'1':'0');
                q('[data-stream-source-label]').textContent=library?dev.audioBuffer?'ARQUIVO LOCAL':'DEMONSTRAÇÃO':'ENTRADA DE LINHA';
                q('[data-stream-state]').textContent=st.streamMute?'MUTE':!library?'AUX':st.playing?'REPRODUZINDO':'PAUSADO';
                q('[data-stream-title]').textContent=dev.audioBuffer?(dev.trackTitle||dev.fileName||'Arquivo local'):'Horizonte azul';
                q('[data-stream-artist]').textContent=dev.audioBuffer?(dev.streamMetadata?.artist||'Arquivo local'):'Sessão de demonstração';
                q('[data-stream-album]').textContent=dev.audioBuffer?(dev.streamMetadata?.album||''):'Escuta tranquila';
                const format=dev.audioBuffer?`PCM · ${(dev.audioBuffer.sampleRate/1000).toLocaleString('pt-BR')} kHz · ${dev.audioBuffer.numberOfChannels} ch`:'SÍNTESE ESTÉREO';
                q('[data-stream-format]').textContent=format;
                q('[data-stream-elapsed]').textContent=formatAudioTime(seconds);q('[data-stream-duration]').textContent=formatAudioTime(duration);q('[data-stream-screen-volume]').textContent=st.streamMute?'MUTE':`VOL ${volume}`;
                const seek=q('[data-stream-seek]');seek.max=duration;if(document.activeElement!==seek)seek.value=seconds;
                q('.stream-now').hidden=page!=='playing'||!library;q('.stream-timeline').hidden=page!=='playing'||!library;q('.stream-line-view').hidden=page!=='playing'||library;q('.stream-home').hidden=page!=='home';q('.stream-track-info').hidden=page!=='info';
                q('[data-stream-info]').textContent=library?`${dev.audioBuffer?dev.fileName||'Arquivo local':'Demonstração interna'} · ${format} · ${formatAudioTime(duration)}`:'Entrada RCA estéreo · sinal de linha · volume variável';
                q('[data-stream-action="mute"]').setAttribute('aria-pressed',String(st.streamMute));q('[data-stream-action="play"]').setAttribute('aria-pressed',String(dev.powered&&st.playing));
                el.querySelectorAll('[data-stream-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.streamInput===st.streamInput)));
                if(!library&&page==='playing')drawStreamLineSpectra(dev);
                if(state.selectedDeviceId===dev.id){const slider=document.getElementById('stream-volume');if(slider&&document.activeElement!==slider)slider.value=volume;const value=document.getElementById('stream-volume-label');if(value)value.textContent=volume+'%';document.getElementById('stream-mute')?.setAttribute('aria-pressed',String(st.streamMute));document.querySelectorAll('[data-stream-inspector-input]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.streamInspectorInput===st.streamInput)));}
            };
            dev.applyStream=()=>{
                const st=dev.state;st.volume=Math.max(0,Math.min(1,Number(st.volume)||0));st.streamInput=st.streamInput==='line'?'line':'library';st.streamMute=!!st.streamMute;st.streamPage=['playing','home','info'].includes(st.streamPage)?st.streamPage:'playing';
                dev.streamChannels.forEach(({internalGate,lineGate,volume})=>{internalGate.gain.setTargetAtTime(st.streamInput==='library'?1:0,ctx.currentTime,.02);lineGate.gain.setTargetAtTime(st.streamInput==='line'?1:0,ctx.currentTime,.02);volume.gain.setTargetAtTime(st.streamMute?0:st.volume,ctx.currentTime,.02);});
                dev.refreshStreamDisplay();Hardware.sync(dev);
            };
            dev.refreshStreamRouting=()=>{
                const connected=state.connections.some(c=>c.outId===q('[data-node="outPhone"]').id);if(connected===dev.streamPhonesConnected)return;dev.streamPhonesConnected=connected;
                dev.streamChannels.forEach(({speaker})=>speaker.gain.setTargetAtTime(connected?0:1,ctx.currentTime,.02));
            };
            dev.selectStreamInput=input=>{dev.state.streamInput=input==='line'?'line':'library';dev.state.streamPage='playing';if(dev.state.streamInput==='line')setSourcePlaying(dev,false);dev.applyStream();updateCableFlows();scheduleProjectSave();};
            dev.setStreamVolume=value=>{dev.state.volume=Number(value);dev.applyStream();scheduleProjectSave();};
            dev.toggleStreamMute=()=>{dev.state.streamMute=!dev.state.streamMute;dev.applyStream();updateCableFlows();scheduleProjectSave();};
            dev.setStreamMetadata=metadata=>{if(dev.streamCoverUrl)URL.revokeObjectURL(dev.streamCoverUrl);dev.streamCoverUrl=metadata?.cover?URL.createObjectURL(metadata.cover):null;dev.streamMetadata=metadata||{};if(metadata?.title)dev.trackTitle=metadata.title;q('.stream-cover img').src=dev.streamCoverUrl||'assets/artwork/stream-cover.svg';dev.refreshStreamDisplay();};
            dev.disposeStream=()=>{dev.state.playing=false;if(dev.streamCoverUrl)URL.revokeObjectURL(dev.streamCoverUrl);};
            dev.resetStream=()=>{Object.assign(dev.state,{volume:.3,streamInput:'library',streamMute:false,streamPage:'playing'});dev.applyStream();};
            const page=value=>{dev.state.streamPage=value;dev.refreshStreamDisplay();scheduleProjectSave();};
            const seek=seconds=>{if(dev.audioBuffer)seekSource(dev,seconds);else {dev.demoOffset=Math.max(0,Math.min(180,seconds));dev.demoStartedAt=dev.state.playing?ctx.currentTime:null;}dev.refreshStreamDisplay();};
            q('[data-stream-action="home"]').onclick=()=>page(dev.state.streamPage==='home'?'playing':'home');q('[data-stream-cover]').onclick=()=>page('info');q('[data-stream-back]').onclick=()=>page('playing');q('[data-stream-action="mute"]').onclick=dev.toggleStreamMute;
            q('[data-stream-action="back"]').onclick=()=>seek(position()-10);q('[data-stream-action="next"]').onclick=()=>seek(position()+10);
            q('[data-stream-seek]').oninput=event=>seek(Number(event.target.value));
            el.querySelectorAll('[data-stream-input]').forEach(button=>button.onclick=()=>dev.selectStreamInput(button.dataset.streamInput));
            Hardware.bindKnob(q('[data-stream-volume]'),{get:()=>dev.state.volume*100,set:value=>dev.setStreamVolume(value/100),min:0,max:100,model:'haloDisc',width:144,height:28,format:value=>`${Math.round(value)}%`});
            q('[data-stream-volume]').addEventListener('dblclick',dev.toggleStreamMute);
            dev.applyStream();
        }
        function drawStreamLineSpectra(dev){
            const active=dev.powered&&state.audioCtx.state==='running',nyquist=state.audioCtx.sampleRate/2,maxHz=Math.min(20000,nyquist),points=96;
            dev.streamSpectra.forEach(({analyzer,data,trace,fill})=>{
                if(active)analyzer.getFloatFrequencyData(data);
                const path=[];
                for(let i=0;i<=points;i++){
                    const hz=20*(maxHz/20)**(i/points),next=20*(maxHz/20)**((i+1)/points);
                    const first=Math.min(data.length-1,Math.max(1,Math.floor(hz/nyquist*data.length))),last=Math.min(data.length-1,Math.max(first,Math.ceil(next/nyquist*data.length)-1));
                    let peak=-90;if(active)for(let bin=first;bin<=last;bin++)peak=Math.max(peak,data[bin]);
                    const x=i/points*240,y=30-Math.max(0,Math.min(1,(peak+90)/80))*28;
                    path.push(`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
                }
                const d=path.join('');trace.setAttribute('d',d);fill.setAttribute('d',d+'L240 30L0 30Z');
            });
        }
        function streamIntegratedInspector(dev){
            return `<section class="stream-inspector"><p>Fonte interna e amplificador estéreo no mesmo aparelho. A biblioteca usa a demonstração ou um arquivo carregado abaixo.</p><div>${[['library','Música interna'],['line','Entrada de linha']].map(([key,label])=>`<button type="button" class="tt-insp-btn" data-stream-inspector-input="${key}" aria-pressed="${dev.state.streamInput===key}">${label}</button>`).join('')}</div><label for="stream-volume">Volume <output id="stream-volume-label">${Math.round(dev.state.volume*100)}%</output></label><input id="stream-volume" type="range" min="0" max="100" step="10" value="${Math.round(dev.state.volume*100)}"><button id="stream-mute" class="tt-insp-btn" aria-pressed="${dev.state.streamMute}">SILENCIAR / RESTAURAR</button><p>O botão superior mantém dez passos de volume, com rotação suave entre eles. Conectar fones silencia as caixas; PRE OUT mantém o volume variável. O halo acompanha o volume e permanece estável durante a música.</p></section>`;
        }
        function bindStreamInspector(dev){
            document.querySelectorAll('[data-stream-inspector-input]').forEach(button=>button.onclick=()=>dev.selectStreamInput(button.dataset.streamInspectorInput));
            document.getElementById('stream-volume').oninput=event=>dev.setStreamVolume(Number(event.target.value)/100);document.getElementById('stream-mute').onclick=dev.toggleStreamMute;
        }

        function hardwarePair(io,node,signal='line'){
            return `<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${signal==='amplified'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${signal==='amplified'?'data-role="amp-speaker-out"':''} title="${signal==='phono'?'Phono':signal==='amplified'?'Caixas passivas':io==='in'?'Entrada de linha':'Saída de linha'} · ${ch}"></div>`).join('')}</div>`;
        }
        function utilityAmpMarkup(){
            const knob=(key,label)=>`<label class="utility-dial utility-${key}"><button data-integrated-knob="${key}" aria-label="${label}" title="${label}"></button><span>${label}</span></label>`;
            return `<div class="device-header"><span>Integrado · Essencial</span></div><section class="integrated-face utility-face"><div class="utility-front"><span class="utility-engraving">STEREO INTEGRATED AMPLIFIER</span><div class="utility-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button><small>POWER</small></div><div class="utility-phones"><div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Fones P10 estéreo"></div><small>PHONES</small></div>${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${knob('volume','VOLUME')}
                <div class="utility-sources">${['AUX','TUNER','TAPE','PHONO'].map((name,index)=>`<label><button data-button-model="plainKey" data-integrated-source="${index}" aria-label="Selecionar ${name}" aria-pressed="${index===0}"></button><span>${name}</span></label>`).join('')}</div>
                <div class="utility-options"><label><button data-button-model="plainKey" data-integrated-direct aria-pressed="false" aria-label="Ignorar controles de tonalidade"></button><span>TONE DEFEAT</span></label>${[['utilityLoudness','LOUDNESS'],['utilityMono','MONO']].map(([key,name])=>`<label><button data-button-model="plainKey" data-utility-toggle="${key}" aria-pressed="false" aria-label="${name}"></button><span>${name}</span></label>`).join('')}</div>
                <div class="utility-power-meter"><span>POWER · W</span><div>${[.1,1,5,10,20].map((value,i)=>`<label><i data-utility-led="${i}"></i><small>${value}</small></label>`).join('')}</div></div></div>
                <div class="integrated-connections utility-connections">${[0,1,2].map((i)=>`<div><small>${['AUX','TUNER','TAPE'][i]}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>PHONO</small>${hardwarePair('in','phono','phono')}</div><div><small>PRE OUT</small>${hardwarePair('out','pre')}</div><div><small>SPEAKERS L/R</small>${hardwarePair('out','speaker','amplified')}</div></div></section>`;
        }
        function configureUtilityAmp(dev){
            const ctx=state.audioCtx,monoGates=[];Object.assign(dev.state,{utilityLoudness:false,utilityMono:false});
            dev.integratedFilters.forEach(({bass},output)=>{
                dev.nodes['in'+['L','R'][output]].disconnect(bass);
                ['L','R'].forEach((ch,input)=>{const gain=ctx.createGain();dev.nodes['in'+ch].connect(gain);gain.connect(bass);monoGates.push({gain,input,output});(dev.modelAudioNodes||=[]).push(gain);});
            });
            const apply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                const st=dev.state;st.utilityLoudness=!!st.utilityLoudness;st.utilityMono=!!st.utilityMono;apply();
                monoGates.forEach(({gain,input,output})=>gain.gain.setTargetAtTime(st.utilityMono?.5:input===output?1:0,ctx.currentTime,.02));
                dev.integratedFilters.forEach(({bass,treble})=>{bass.gain.setTargetAtTime((st.direct?0:st.bass)+(st.utilityLoudness?6*(1-st.volume):0),ctx.currentTime,.025);treble.gain.setTargetAtTime((st.direct?0:st.treble)+(st.utilityLoudness?2*(1-st.volume):0),ctx.currentTime,.025);});
                dev.el.querySelectorAll('[data-utility-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(st[button.dataset.utilityToggle])));
            };
            dev.el.querySelectorAll('[data-utility-toggle]').forEach(button=>button.onclick=()=>{dev.state[button.dataset.utilityToggle]=!dev.state[button.dataset.utilityToggle];dev.applyIntegrated();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();});
            dev.applyIntegrated();
        }
        const GLASS_PREAMP_SWITCHES=[['glassLowCut','LOW FILTER'],['glassHighCut','HIGH FILTER'],['glassLoudness','LOUDNESS']];
        function glassPreampMarkup(){
            const knob=(key,label,extra='')=>`<label class="glass-pre-dial glass-pre-${key}"><button type="button" ${key==='source'?'data-pre-rotary':`data-integrated-knob="${key}"`} aria-label="${label}"></button><span class="glass-lit">${label}</span>${extra}</label>`;
            const lever=(key,label,group='pre')=>`<label class="glass-pre-switch"><button type="button" data-${group==='pre'?'pre-toggle':group==='glass'?'glass-toggle':'integrated-direct'}${group==='direct'?'':`="${key}"`} data-button-model="chromeLever" aria-pressed="false" aria-label="${label}" title="${label}"></button><span>${label}</span></label>`;
            return `<div class="device-header"><span>Pré · Vidro Clássico</span></div><section class="glass-pre-face">
                <div class="glass-pre-top" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
                <div class="glass-pre-glass"><span class="glass-pre-heading glass-lit">STEREO CONTROL CENTER</span><small class="pre-status-text glass-pre-status glass-lit">STEREO</small>
                    ${knob('source','INPUT','<small class="pre-source-text glass-lit">AUXILIAR</small>')}${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${knob('volume','VOLUME','<small class="pre-volume-text" hidden>8/10</small>')}
                    <div class="glass-pre-reflections" aria-hidden="true"></div>
                </div>
                <div class="glass-pre-switch-row"><label class="glass-pre-switch"><div data-power-slot><button type="button" class="power-btn" data-button-model="chromeLever" title="Ligar / desligar"></button></div><span>POWER</span></label>
                    ${lever('preMono','MONO')}${lever('preInvert','PHASE')}${GLASS_PREAMP_SWITCHES.map(([key,label])=>lever(key,label,'glass')).join('')}${lever('','TONE DEFEAT','direct')}${lever('preMuted','MUTE')}
                </div>
                <div class="glass-pre-end glass-pre-end-left" aria-hidden="true"><i></i><i></i></div><div class="glass-pre-end glass-pre-end-right" aria-hidden="true"><i></i><i></i></div>
                <div class="integrated-connections glass-pre-connections">${['AUX','TUNER','TAPE'].map((label,i)=>`<div><small>${label}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>PHONO</small>${hardwarePair('in','phono','phono')}</div><div><small>LINE OUT</small>${hardwarePair('out','pre')}</div></div>
                <div hidden>${controlAmpSources('preGlass').map((label,i)=>`<button type="button" data-integrated-source="${i}">${label}</button>`).join('')}</div>
            </section>`;
        }
        function configureGlassPreamp(dev){
            const ctx=state.audioCtx,filters=[];
            Object.assign(dev.state,{glassLowCut:false,glassHighCut:false,glassLoudness:false});
            dev.integratedFilters.forEach(({treble,volume})=>{
                const highpass=ctx.createBiquadFilter(),lowpass=ctx.createBiquadFilter();highpass.type='highpass';lowpass.type='lowpass';highpass.Q.value=lowpass.Q.value=Math.SQRT1_2;
                treble.disconnect(volume);treble.connect(highpass);highpass.connect(lowpass);lowpass.connect(volume);filters.push({highpass,lowpass});(dev.modelAudioNodes||=[]).push(highpass,lowpass);
            });
            const baseApply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                const st=dev.state;GLASS_PREAMP_SWITCHES.forEach(([key])=>st[key]=!!st[key]);baseApply();
                filters.forEach(({highpass,lowpass})=>{highpass.frequency.setTargetAtTime(st.glassLowCut?35:.01,ctx.currentTime,.03);lowpass.frequency.setTargetAtTime(st.glassHighCut?7000:ctx.sampleRate/2,ctx.currentTime,.03);});
                dev.integratedFilters.forEach(({bass,treble})=>{bass.gain.setTargetAtTime((st.direct?0:st.bass)+(st.glassLoudness?5*(1-st.volume):0),ctx.currentTime,.025);treble.gain.setTargetAtTime((st.direct?0:st.treble)+(st.glassLoudness?2*(1-st.volume):0),ctx.currentTime,.025);});
                dev.el.querySelectorAll('[data-glass-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(st[button.dataset.glassToggle])));
                dev.el.querySelectorAll('[data-pre-toggle],[data-glass-toggle],[data-integrated-direct]').forEach(button=>button.dataset.togglePosition=button.getAttribute('aria-pressed')==='true'?'2':'0');
            };
            dev.el.querySelectorAll('[data-glass-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.glassToggle;dev.state[key]=!dev.state[key];dev.applyIntegrated();updateCableFlows();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.applyIntegrated();
        }
        function glassPreampInspector(dev){
            return `<section class="glass-pre-inspector"><p>Três entradas de linha e PHONO estéreo. LINE OUT alimenta uma potência ou caixas ativas. O painel de vidro e as inscrições iluminadas acompanham o estado de energia.</p>
                <div>${[['preMuted','Mute'],['preMono','Mono'],['preInvert','Inverter polaridade']].map(([key,label])=>`<button type="button" class="tt-insp-btn" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${label}</button>`).join('')}</div>
                <div>${GLASS_PREAMP_SWITCHES.map(([key,label])=>`<button type="button" class="tt-insp-btn" data-glass-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${label}</button>`).join('')}</div>
                <p>LOW FILTER reduz frequências abaixo de 35 Hz; HIGH FILTER suaviza a região acima de 7 kHz. LOUDNESS reforça discretamente graves e agudos em volumes baixos. TONE DEFEAT ignora os ajustes de graves e agudos, preservando os filtros e o loudness.</p></section>`;
        }

        function precisionMeterMarkup(){
            const x=angle=>64+Math.sin(angle*Math.PI/180)*49,y=angle=>77-Math.cos(angle*Math.PI/180)*49;
            const ticks=[-40,-30,-20,-15,-10,-6,-3,0,3].map((value,i)=>{const angle=-55+i*110/8,a=x(angle),b=y(angle);return `<path d="M${a} ${b}l${Math.sin(angle*Math.PI/180)*-5} ${Math.cos(angle*Math.PI/180)*5}" stroke="${value>0?'#a0392e':'#323933'}" stroke-width=".8"/><text x="${64+Math.sin(angle*Math.PI/180)*59}" y="${77-Math.cos(angle*Math.PI/180)*59}" text-anchor="middle" font-size="5" fill="${value>0?'#9c352b':'#3d4439'}">${value>0?'+':''}${value}</text>`;}).join('');
            return `<div class="precision-meter"><svg viewBox="0 0 128 86" role="img" aria-label="Modulômetro estéreo de saída em dBFS"><path d="M3 3h122v79H3Z" fill="#e2dcc2" stroke="#9b9d8d"/><path d="M${x(-55)} ${y(-55)}A49 49 0 0 1 ${x(55)} ${y(55)}" stroke="#525c4c" stroke-width=".6" fill="none"/>${ticks}<text x="64" y="55" text-anchor="middle" fill="#4d5647" font-size="5" letter-spacing="1.3">OUTPUT · dBFS</text><text x="24" y="69" fill="#333b32" font-size="6">L</text><text x="99" y="69" fill="#a44337" font-size="6">R</text><path data-precision-needle="0" d="M63 77V24" stroke="#27372e" stroke-width="1" transform="rotate(-55 64 77)"/><path data-precision-needle="1" d="M65 77V26" stroke="#b13d31" stroke-width=".9" transform="rotate(-55 64 77)"/><ellipse cx="64" cy="78" rx="8" ry="3.5" fill="#3b4637"/></svg><i class="precision-meter-glass"></i></div>`;
        }
        function precisionPreampMarkup(){
            return `<div class="device-header"><span>Pré · Precisão</span></div><section class="precision-face"><div class="precision-front"><i class="precision-screw precision-screw-a"></i><i class="precision-screw precision-screw-b"></i><i class="precision-screw precision-screw-c"></i><i class="precision-screw precision-screw-d"></i><span class="precision-engraving">STEREO LINE PREAMPLIFIER</span>${precisionMeterMarkup()}
                <label class="precision-source"><button data-pre-rotary aria-label="Selecionar entrada de linha"></button><span>INPUT</span><small class="pre-source-text">LINE 1</small></label>
                <label class="precision-gain"><button data-precision-gain data-button-model="industrialToggle" data-toggle-position="0" aria-label="Ganho de saída: 0, 6 ou 12 dB" title="Ganho: 0 / +6 / +12 dB"></button><span>GAIN</span><small data-precision-gain-label>0 dB</small></label>
                <label class="precision-volume"><button data-integrated-knob="volume" aria-label="Volume principal"></button><span>VOLUME</span><small class="pre-volume-text">8/10</small></label>
                <label class="precision-balance"><button data-integrated-knob="balance" aria-label="Balanço esquerdo / direito"></button><span>BALANCE</span></label>
                <div class="precision-switches">${[['preMuted','MUTE'],['preMono','MONO'],['preInvert','PHASE']].map(([key,label])=>`<label><button data-pre-toggle="${key}" data-button-model="industrialToggle" aria-pressed="false" aria-label="${label}"></button><span>${label}</span></label>`).join('')}</div><small class="pre-status-text precision-status">STEREO</small><div class="precision-power" data-power-slot><button class="power-btn" title="Ligar / desligar"></button></div></div>
                <div class="integrated-connections precision-connections">${[0,1,2,3].map(i=>`<div><small>LINE ${i+1}</small>${hardwarePair('in','line'+i)}</div>`).join('')}<div><small>LINE OUT</small>${hardwarePair('out','pre')}</div></div><div hidden>${[0,1,2,3].map(i=>`<button data-integrated-source="${i}">LINE ${i+1}</button>`).join('')}</div></section>`;
        }
        function configurePrecisionPreamp(dev){
            const apply=dev.applyIntegrated;dev.state.precisionGain=0;
            dev.applyIntegrated=()=>{
                const st=dev.state;st.precisionGain=[0,6,12].includes(st.precisionGain)?st.precisionGain:0;apply();
                dev.el.querySelector('[data-precision-gain]').dataset.togglePosition=String(st.precisionGain/6);dev.el.querySelector('[data-precision-gain]').setAttribute('aria-label',`Ganho de saída: ${st.precisionGain} dB. Clique para alternar 0, 6 e 12 dB.`);dev.el.querySelector('[data-precision-gain-label]').textContent=(st.precisionGain?'+':'')+st.precisionGain+' dB';
                dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.dataset.togglePosition=st[button.dataset.preToggle]?'2':'0');
            };
            dev.el.querySelector('[data-precision-gain]').onclick=()=>{dev.state.precisionGain=(dev.state.precisionGain+6)%18;dev.applyIntegrated();scheduleProjectSave();};dev.applyIntegrated();
        }
        function updateReferenceHardware(now){
            Object.values(state.devices).forEach(dev=>{
                if(dev.type==='integratedUtility'){
                    const power=dev.powered?Math.max(...['L','R'].map(ch=>wattsAtLoad(amplifierChannelRms(dev,ch),dev.channelLoads?.[ch]??8))):0;
                    dev.el.querySelectorAll('[data-utility-led]').forEach((led,i)=>led.classList.toggle('is-on',power>=[.1,1,5,10,20][i]));
                }
                if(dev.type==='prePrecision')dev.el.querySelectorAll('[data-precision-needle]').forEach((needle,i)=>{
                    const db=audioDb(dev.powered?dev.meters?.levels[i]||0:0),angle=-55+Math.max(0,Math.min(1,(db+40)/43))*110;
                    needle.setAttribute('transform',`rotate(${dampedNeedle(needle,angle,now,-55).toFixed(3)} 64 77)`);
                });
            });
        }

        function integratedGauge(watts){
            const point=(angle,r)=>({x:50+Math.sin(angle*Math.PI/180)*r,y:62-Math.cos(angle*Math.PI/180)*r});
            const markings=[.0001,.001,.01,.1,1].map(f=>{const a=-48+(Math.log10(f)+4)*24,p=point(a,43),q=point(a,47),t=point(a,53);return `<path d="M${p.x} ${p.y}L${q.x} ${q.y}"/><text x="${t.x}" y="${t.y}" text-anchor="middle" font-size="5.5">${Number((f*watts).toFixed(3))}</text>`;}).join('');
            return `<div class="integrated-gauges">${['L','R'].map((ch,i)=>`<div class="integrated-gauge"><svg viewBox="0 0 100 70" aria-label="Potência simulada ${ch}"><g class="integrated-scale">${markings}<text x="85" y="59" font-size="7" text-anchor="end">W · ${ch}</text></g><line data-integrated-needle="${i}" x1="50" y1="62" x2="50" y2="19" transform="rotate(-48 50 62)"/><circle cx="50" cy="62" r="2"/></svg></div>`).join('')}</div>`;
        }
        function integratedMarkup(type){
            if(type==='integratedUtility')return utilityAmpMarkup();
            const config=INTEGRATED_AMPS[type];
            const knob=(key,label,big=false)=>`<label class="integrated-knob-group"><button type="button" class="integrated-knob ${big?'is-large':''}" data-integrated-knob="${key}" role="slider" tabindex="0" aria-label="${label}" title="${label} · arraste para ajustar"><i></i></button><span>${label}</span></label>`;
            const sources=`<div class="integrated-sources"><span>INPUT</span><div>${['LINE 1','LINE 2','LINE 3','PHONO'].map((label,index)=>`<button type="button" data-integrated-source="${index}" aria-pressed="${index===0}">${label}</button>`).join('')}</div></div>`;
            const ports=(io,node,format,signal)=>`<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${node==='phono'?'Phono':io==='in'?'Linha':signal==='amplified'?'Saída amplificada':'Saída de linha'} ${ch}" ${signal==='amplified'?'data-role="amp-speaker-out"':''}></div>`).join('')}</div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="integrated-face finish-${config.finish}"><div class="integrated-main"><div class="integrated-power"><div data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div><i class="integrated-status-led" aria-hidden="true"></i><div class="port" data-type="p10" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída de fones P10 estéreo"></div><small>PHONES</small></div>${type==='integratedMinimal'?knob('volume','VOLUME',true):sources}${config.meters?integratedGauge(config.watts):'<div class="integrated-green-window" aria-hidden="true"><i></i></div>'}${type==='integratedMinimal'?sources:knob('volume','VOLUME',true)}${config.tone?`<div class="integrated-tones">${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}<button type="button" class="integrated-direct" data-integrated-direct aria-pressed="false">DIRECT</button></div>`:''}</div><div class="integrated-connections">${[0,1,2].map(i=>`<div><small>LINE ${i+1}</small>${ports('in','line'+i,'rca','line')}</div>`).join('')}<div><small>PHONO</small>${ports('in','phono','rca','phono')}</div><div><small>PRE OUT</small>${ports('out','pre','rca','line')}</div><div><small>SPEAKERS · L/R</small>${ports('out','speaker','wire','amplified')}</div></div></section>`;
        }
        function configureIntegratedAmp(dev){
            const config=controlAmpConfig(dev.type),ctx=state.audioCtx;
            Object.assign(dev.state,{integratedSource:0,balance:0,direct:false});
            dev.integratedGates=[];dev.integratedFilters=[];dev.powerNodes=[];
            dev.nodes.outPhone=ctx.createChannelMerger(2);
            ['L','R'].forEach((ch,channel)=>{
                const bus=dev.nodes['in'+ch]=ctx.createGain();
                for(let i=0;i<4;i++){
                    const input=dev.nodes[(i===3&&config.phono!==false?'phono':'line'+i)+ch]=ctx.createGain(),gate=ctx.createGain();
                    dev.integratedGates.push({gate,index:i});
                    if(i===3&&config.phono!==false){
                        const low=ctx.createBiquadFilter(),high=ctx.createBiquadFilter(),gain=ctx.createGain();
                        low.type='lowshelf';low.frequency.value=120;low.gain.value=9;high.type='highshelf';high.frequency.value=2122;high.gain.value=-9;gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        input.connect(low);low.connect(high);high.connect(gain);connectPhonoPlayback(dev,gain,gate);
                    }else input.connect(gate);
                    gate.connect(bus);
                }
                const bass=ctx.createBiquadFilter(),treble=ctx.createBiquadFilter(),volume=ctx.createGain(),power=ctx.createGain();
                bass.type='lowshelf';bass.frequency.value=100;treble.type='highshelf';treble.frequency.value=3500;
                bus.connect(bass);bass.connect(treble);treble.connect(volume);volume.connect(power);
                const speaker=dev.nodes['speaker'+ch]=ctx.createGain(),pre=dev.nodes['pre'+ch]=ctx.createGain();
                power.connect(speaker);power.connect(pre);power.connect(dev.nodes.outPhone,0,channel);
                dev.powerNodes.push(power);dev.integratedFilters.push({bass,treble,volume,ch});
            });
            dev.applyIntegrated=()=>{
                const t=ctx.currentTime,st=dev.state;
                st.volume=Math.max(0,Math.min(1,st.volume));st.bass=Math.max(-10,Math.min(10,st.bass||0));st.treble=Math.max(-10,Math.min(10,st.treble||0));st.balance=Math.max(-1,Math.min(1,st.balance||0));if(CUSTOM_PREAMPS[dev.type]){st.subLevel=Math.max(0,Math.min(1,st.subLevel??.8));st.subFrequency=Math.max(40,Math.min(200,st.subFrequency??80));}st.integratedSource=Math.max(0,Math.min(3,Math.round(st.integratedSource||0)));
                dev.integratedGates.forEach(({gate,index})=>gate.gain.setTargetAtTime(index===st.integratedSource?1:0,t,.02));
                dev.integratedFilters.forEach(({bass,treble,volume,ch})=>{
                    bass.gain.setTargetAtTime(config.tone&&!st.direct?st.bass:0,t,.025);treble.gain.setTargetAtTime(config.tone&&!st.direct?st.treble:0,t,.025);
                    const balance=config.tone||config.balance?st.balance||0:0;volume.gain.setTargetAtTime((st.preMuted?0:st.volume)*(ch==='L'?1-Math.max(0,balance):1+Math.min(0,balance)),t,.02);
                });
                dev.el.querySelectorAll('[data-integrated-source]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.integratedSource)===st.integratedSource)));
                dev.el.querySelector('[data-integrated-direct]')?.setAttribute('aria-pressed',String(!!st.direct));
                dev.el.querySelectorAll('[data-integrated-knob]').forEach(knob=>{
                    const key=knob.dataset.integratedKnob,min=key==='volume'||key==='subLevel'?0:key==='balance'?-1:-10,max=['volume','subLevel','balance'].includes(key)?1:10;
                    knob.style.setProperty('--integrated-angle',(-135+(st[key]-min)/(max-min)*270)+'deg');knob.setAttribute('aria-valuemin',min);knob.setAttribute('aria-valuemax',max);knob.setAttribute('aria-valuenow',st[key]);
                });
            };
            dev.applyIntegrated();
            dev.el.querySelectorAll('[data-integrated-source]').forEach(button=>button.addEventListener('click',()=>{dev.state.integratedSource=Number(button.dataset.integratedSource);dev.applyIntegrated();updateCableFlows();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.el.querySelector('[data-integrated-direct]')?.addEventListener('click',()=>{dev.state.direct=!dev.state.direct;dev.applyIntegrated();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();});
            dev.el.querySelectorAll('[data-integrated-knob]').forEach(knob=>{
                const key=knob.dataset.integratedKnob,min=key==='volume'||key==='subLevel'?0:key==='balance'?-1:-10,max=['volume','subLevel','balance'].includes(key)?1:10;
                const set=value=>{dev.state[key]=Number((min+Math.round(Math.max(0,Math.min(1,(value-min)/(max-min)))*10)/10*(max-min)).toFixed(3));dev.applyIntegrated();const input=document.querySelector(`[data-integrated-setting="${key}"],[data-custom-pre-setting="${key}"]`);if(input&&state.selectedDeviceId===dev.id){input.value=dev.state[key];input.previousElementSibling.querySelector('output').textContent=integratedSettingText(key,dev.state[key]);}scheduleProjectSave();};
                Hardware.bindKnob(knob,{get:()=>dev.state[key],set,min,max});
            });
        }
        function integratedSettingText(key,value){return key==='volume'||key==='subLevel'?Math.round(value*10)+'/10':key==='balance'?value===0?'Centro':(value<0?'L ':'R ')+Math.round(Math.abs(value)*5):(value>0?'+':'')+value+' dB';}
        function integratedInspectorHtml(dev){
            const config=controlAmpConfig(dev.type),keys=config.tone?[['volume','Volume',0,1],['bass','Graves',-10,10],['treble','Agudos',-10,10],['balance','Balanço L/R',-1,1]]:[['volume','Volume',0,1],...(config.balance?[['balance','Balanço L/R',-1,1]]:[])];
            return `<section class="flex flex-col gap-4"><span class="text-sm text-gray-300">Fonte selecionada</span><div class="grid grid-cols-2 gap-2">${controlAmpSources(dev.type).map((name,index)=>`<button class="tt-insp-btn ${dev.state.integratedSource===index?'is-on':''}" data-integrated-inspector-source="${index}" aria-pressed="${dev.state.integratedSource===index}">${name}</button>`).join('')}</div>${keys.map(([key,name,min,max])=>`<label class="flex flex-col gap-2 text-sm text-gray-300"><span>${name} <output>${integratedSettingText(key,dev.state[key])}</output></span><input type="range" data-integrated-setting="${key}" min="${min}" max="${max}" step="${(max-min)/10}" value="${dev.state[key]}"></label>`).join('')}${config.tone?`<button class="tt-insp-btn ${dev.state.direct?'is-on':''}" data-integrated-inspector-direct title="Ignora os ajustes de graves e agudos, deixando a tonalidade neutra. Volume, balanço e subwoofer continuam ativos. Ao desativar, os ajustes anteriores voltam a ser aplicados." aria-pressed="${!!dev.state.direct}">DIRECT</button>`:''}</section>`;
        }
        function bindIntegratedInspector(dev){
            if(!controlAmpConfig(dev.type))return;
            inspectorContent.querySelectorAll('[data-integrated-setting]').forEach(input=>input.addEventListener('input',()=>{const key=input.dataset.integratedSetting;dev.state[key]=Number(input.value);dev.applyIntegrated();input.previousElementSibling.querySelector('output').textContent=integratedSettingText(key,dev.state[key]);scheduleProjectSave();}));
            inspectorContent.querySelectorAll('[data-integrated-inspector-source]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-integrated-source="${button.dataset.integratedInspectorSource}"]`).click()));
            inspectorContent.querySelector('[data-integrated-inspector-direct]')?.addEventListener('click',()=>dev.el.querySelector('[data-integrated-direct]').click());
        }
        let lastIntegratedDisplay=0;
        function updateIntegratedDisplays(now){
            if(now-lastIntegratedDisplay<80)return;const elapsed=Math.min(.3,(now-lastIntegratedDisplay)/1000);lastIntegratedDisplay=now;
            Object.values(state.devices).filter(dev=>CUSTOM_PREAMPS[dev.type]).forEach(dev=>{
                dev.el.querySelectorAll('[data-pre-level]').forEach(bar=>{const level=dev.powered?dev.meters?.levels[Number(bar.dataset.preLevel)]||0:0;bar.style.width=Math.max(0,Math.min(100,(audioDb(level)+60)/60*100))+'%';});
                drawReferencePreampDisplay(dev);
            });
            Object.values(state.devices).filter(dev=>INTEGRATED_AMPS[dev.type]?.meters).forEach(dev=>{
                dev.integratedEnvelope||=[0,0];
                dev.el.querySelectorAll('[data-integrated-needle]').forEach(needle=>{
                    const i=Number(needle.dataset.integratedNeedle),value=dev.powered?amplifierChannelRms(dev,i?'R':'L'):0;
                    dev.integratedEnvelope[i]+=(value-dev.integratedEnvelope[i])*(1-Math.exp(-elapsed/.13));
                    const load=dev.channelLoads?.[i?'R':'L']??Infinity,watts=wattsAtLoad(dev.integratedEnvelope[i],load);
                    const fraction=Math.max(.0001,Math.min(1,watts/dev.state.ratedWatts));
                    needle.setAttribute('transform',`rotate(${dampedNeedle(needle,-48+(Math.log10(fraction)+4)*24,now,-48)} 50 62)`);
                    needle.parentElement.setAttribute('aria-label',`Potência simulada ${i?'R':'L'}: ${watts.toFixed(2)} W`);
                });
            });
        }

        function drawReferencePreampDisplay(dev){
            const canvas=dev.el.querySelector('.pre-reference-pixels');if(!canvas)return;
            const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0b2014';ctx.fillRect(0,0,288,62);
            ctx.fillStyle='#163321';for(let y=1;y<62;y+=2)for(let x=1;x<288;x+=2)ctx.fillRect(x,y,1,1);
            if(!dev.powered){canvas.setAttribute('aria-label','Pré-amplificador desligado');return;}
            const draw=(text,x,y,scale=1)=>{
                ctx.fillStyle='#a7ed7a';for(const char of text){const glyph=SIGNAL_PIXEL_FONT[char];glyph?.forEach((row,dy)=>[...row].forEach((pixel,dx)=>{if(pixel==='1')ctx.fillRect(x+dx*scale,y+dy*scale,scale,scale);}));x+=6*scale;}
            };
            const st=dev.state,source=controlAmpSources(dev.type)[st.integratedSource].toUpperCase(),volume=st.preMuted?'MUTE':Math.round(st.volume*10)+'/10';
            draw(source,8,6,2);draw([st.preMono?'MONO':'STEREO',st.preInvert?'INVERT':''].filter(Boolean).join(' '),8,28);
            draw(volume,196,6,3);
            [0,1].forEach(ch=>{const y=43+ch*8;draw(ch?'R':'L',8,y);const level=dev.meters?.levels[ch]||0,amount=st.preMuted?0:Math.max(0,Math.min(1,(audioDb(level)+60)/60));for(let n=0;n<65;n++){ctx.fillStyle=n<amount*65?'#8ed56c':'#25452c';ctx.fillRect(20+n*4,y+2,2,4);}});
            canvas.setAttribute('aria-label',`${source}, volume ${st.preMuted?'mudo':Math.round(st.volume*10)+' de 10'}, ${st.preMono?'mono':'estéreo'}`);
        }
        function customPreampMarkup(type){
            if(type==='preGlass')return glassPreampMarkup();
            if(type==='prePrecision')return precisionPreampMarkup();
            const config=CUSTOM_PREAMPS[type];
            const knob=(key,label,big=false)=>`<label class="integrated-knob-group"><button class="integrated-knob ${big?'is-large':''}" data-integrated-knob="${key}" role="slider" aria-label="${label}"><i></i></button><span>${label}</span></label>`;
            const encoder=`<label class="integrated-knob-group"><button class="integrated-knob is-large" data-pre-rotary role="slider" aria-label="Selecionar fonte" aria-valuemin="0" aria-valuemax="3" aria-valuenow="0"><i></i></button><span>INPUT</span></label>`;
            const toggle=(key,label)=>`<button type="button" class="integrated-direct" data-pre-toggle="${key}" aria-pressed="false">${label}</button>`;
            const port=(io,node,signal)=>`<div class="integrated-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" title="${signal==='phono'?'Phono':io==='in'?'Entrada de linha':'Saída de linha'} ${ch}"></div>`).join('')}</div>`;
            const screen=`<div class="custom-pre-screen">${type==='preReference'?'<canvas class="pre-reference-pixels" width="288" height="62" role="img" aria-label="Visor verde do pré-amplificador"></canvas>':''}<span class="pre-source-text">LINE 1</span><strong class="pre-volume-text">8/10</strong><small class="pre-status-text">STEREO</small><div class="pre-stereo-levels">${[0,1].map(i=>`<span><b>${i?'R':'L'}</b><em><i data-pre-level="${i}"></i></em></span>`).join('')}</div></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="integrated-face custom-pre-face pre-finish-${config.finish}">${type==='preReference'?'<i class="pre-handle handle-left" aria-hidden="true"></i><i class="pre-handle handle-right" aria-hidden="true"></i>':''}<div class="custom-pre-main">${encoder}<div class="custom-pre-center">${screen}<div class="custom-pre-switches"><div data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div>${toggle('preMuted','MUTE')}${type==='preReference'?toggle('preMono','MONO')+toggle('preInvert','INVERT'):config.tone?'<button type="button" class="integrated-direct" data-integrated-direct aria-pressed="false">DIRECT</button>':''}</div></div>${knob('volume','VOLUME',true)}${config.tone?`<div class="custom-pre-tones">${knob('bass','BASS')}${knob('treble','TREBLE')}${knob('balance','BALANCE')}${config.crossover?knob('subLevel','SUB'):''}</div>`:knob('balance','BALANCE')}</div><div class="integrated-connections">${[0,1,2,3].map(index=>`<div><small>${index===3&&config.phono?'PHONO':'LINE '+(index+1)}</small>${port('in',index===3&&config.phono?'phono':'line'+index,index===3&&config.phono?'phono':'line')}</div>`).join('')}<div><small>LINE OUT</small>${port('out','pre','line')}</div>${config.sub?'<div><small>SUB · MONO</small><div class="port" data-type="rca" data-io="out" data-node="subOut" data-signal="line" data-role="lfe-out" title="Subwoofer · saída mono em nível de linha"></div></div>':''}${config.phones?`<div><small>PHONES</small><div class="port" data-type="${config.finish==='control'?'p2':'p10'}" data-io="out" data-node="outPhone" data-signal="headphone" title="Saída estéreo para fones"></div></div>`:''}</div><div hidden>${controlAmpSources(type).map((name,index)=>`<button data-integrated-source="${index}">${name}</button>`).join('')}</div></section>`;
        }
        function configureCustomPreamp(dev){
            const config=CUSTOM_PREAMPS[dev.type],ctx=state.audioCtx;
            Object.assign(dev.state,{preMuted:false,preMono:false,preInvert:false,subLevel:.8,subFrequency:80});
            // A matrix before the output gates provides real mono and polarity inversion.
            const matrix=[];
            dev.integratedFilters.forEach(({volume},input)=>{
                volume.disconnect(dev.powerNodes[input]);
                [0,1].forEach(output=>{const gain=ctx.createGain();volume.connect(gain);gain.connect(dev.powerNodes[output]);matrix.push({gain,input,output});});
            });
            let subLevel,subFilter;
            if(config.sub){
                const sum=ctx.createGain();sum.gain.value=.5;
                dev.powerNodes.forEach(power=>power.connect(sum));
                subLevel=ctx.createGain();dev.nodes.subOut=ctx.createGain();
                if(config.crossover){subFilter=ctx.createBiquadFilter();subFilter.type='lowpass';subFilter.frequency.value=80;subFilter.Q.value=.707;sum.connect(subFilter);subFilter.connect(subLevel);}else sum.connect(subLevel);
                subLevel.connect(dev.nodes.subOut);
            }
            const baseApply=dev.applyIntegrated;
            dev.applyIntegrated=()=>{
                baseApply();const st=dev.state,t=ctx.currentTime;
                matrix.forEach(({gain,input,output})=>gain.gain.setTargetAtTime((st.preMono ? .5 : input===output ? 1 : 0)*(st.preInvert?-1:1)*(dev.type==='prePrecision'?10**((st.precisionGain||0)/20):1),t,.02));
                subLevel?.gain.setTargetAtTime(st.subLevel,t,.02);subFilter?.frequency.setTargetAtTime(st.subFrequency,t,.03);
                const rotor=dev.el.querySelector('[data-pre-rotary]');rotor.style.setProperty('--integrated-angle',(-120+st.integratedSource*80)+'deg');rotor.setAttribute('aria-valuenow',st.integratedSource);rotor.setAttribute('aria-valuetext',controlAmpSources(dev.type)[st.integratedSource]);
                dev.el.querySelector('.pre-source-text').textContent=controlAmpSources(dev.type)[st.integratedSource].toUpperCase();
                dev.el.querySelector('.pre-volume-text').textContent=st.preMuted?'MUTE':Math.round(st.volume*10)+'/10';
                dev.el.querySelector('.pre-status-text').textContent=[st.preMono?'MONO':'STEREO',st.preInvert?'INVERT':'',st.direct?'DIRECT':''].filter(Boolean).join(' · ');
                dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.setAttribute('aria-pressed',String(!!st[button.dataset.preToggle])));
                drawReferencePreampDisplay(dev);
            };
            const rotor=dev.el.querySelector('[data-pre-rotary]');
            const setSource=index=>{dev.el.querySelector(`[data-integrated-source="${Math.max(0,Math.min(3,index))}"]`).click();};
            Hardware.bindKnob(rotor,{get:()=>dev.state.integratedSource,set:setSource,min:0,max:3,step:1,format:value=>controlAmpSources(dev.type)[value]});
            dev.el.querySelectorAll('[data-pre-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.preToggle;dev.state[key]=!dev.state[key];dev.applyIntegrated();updateCableFlows();if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);scheduleProjectSave();}));
            dev.applyIntegrated();
        }
        function customPreampInspectorHtml(dev){
            if(dev.type==='preGlass')return glassPreampInspector(dev);
            if(dev.type==='prePrecision')return `<div class="precision-inspector-options">${[['preMuted','Mute'],['preMono','Mono'],['preInvert','Inverter polaridade']].map(([key,name])=>`<button class="tt-insp-btn" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${name}</button>`).join('')}<button class="tt-insp-btn" data-precision-inspector-gain>GANHO: ${dev.state.precisionGain} dB · ALTERNAR</button><p>O modulômetro acompanha as saídas L/R reais em dBFS. A agulha preta representa L e a vermelha representa R; o ganho selecionado atua antes das saídas.</p></div>`;
            const config=CUSTOM_PREAMPS[dev.type];
            return `<div class="flex flex-col gap-3">${[['preMuted','Mute'],...(dev.type==='preReference'?[['preMono','Mono'],['preInvert','Inverter polaridade']]:[])].map(([key,name])=>`<button class="tt-insp-btn ${dev.state[key]?'is-on':''}" data-pre-inspector-toggle="${key}" aria-pressed="${!!dev.state[key]}">${name}</button>`).join('')}${config.crossover?`<label class="flex flex-col gap-2 text-sm text-gray-300"><span>Subwoofer <output>${Math.round(dev.state.subLevel*10)}/10</output></span><input type="range" data-custom-pre-setting="subLevel" min="0" max="1" step=".1" value="${dev.state.subLevel}"></label><label class="flex flex-col gap-2 text-sm text-gray-300"><span>Corte do subwoofer <output>${dev.state.subFrequency} Hz</output></span><input type="range" data-custom-pre-setting="subFrequency" min="40" max="200" step="16" value="${dev.state.subFrequency}"></label>`:''}</div>`;
        }
        function bindCustomPreampInspector(dev){
            if(!CUSTOM_PREAMPS[dev.type])return;
            inspectorContent.querySelectorAll('[data-glass-inspector-toggle]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-glass-toggle="${button.dataset.glassInspectorToggle}"]`).click()));
            inspectorContent.querySelector('[data-precision-inspector-gain]')?.addEventListener('click',()=>{dev.el.querySelector('[data-precision-gain]').click();selectDevice(dev.id,true);});
            inspectorContent.querySelectorAll('[data-pre-inspector-toggle]').forEach(button=>button.addEventListener('click',()=>dev.el.querySelector(`[data-pre-toggle="${button.dataset.preInspectorToggle}"]`).click()));
            inspectorContent.querySelectorAll('[data-custom-pre-setting]').forEach(input=>input.addEventListener('input',()=>{const key=input.dataset.customPreSetting;dev.state[key]=Number(input.value);dev.applyIntegrated();input.previousElementSibling.querySelector('output').textContent=key==='subLevel'?Math.round(dev.state[key]*10)+'/10':dev.state[key]+' Hz';scheduleProjectSave();}));
        }


        function valveAssemblyMarkup(){
            const id='valve_'+Math.random().toString(36).slice(2,10);
            const fill=name=>`url(#${id}_${name})`;
            const transformer=(x,y,w,h)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${fill('black')}" stroke="#58645f" stroke-width="1.3"/><path d="M${x+9} ${y+4}H${x+w-9}" stroke="#89948b" stroke-opacity=".35" stroke-width="2"/><rect x="${x+8}" y="${y+h-14}" width="${w-16}" height="14" rx="2" fill="#1c2623" stroke="#56625a" stroke-width=".6"/>${[0,1,2].map(n=>`<path d="M${x+13} ${y+h-10+n*3}h${w-26}" stroke="#526055" stroke-opacity=".45" stroke-width=".7"/>`).join('')}<circle cx="${x+13}" cy="${y+h-7}" r="1.6" fill="#869488"/><circle cx="${x+w-13}" cy="${y+h-7}" r="1.6" fill="#869488"/></g>`;
            const tube=(cx,y,w,h,small=false)=>{
                const x=cx-w/2,base=y+h-11,plateX=x+w*.25,plateY=y+h*.24,plateW=w*.5,plateH=h*.51;
                return `<g><ellipse cx="${cx}" cy="${base+9}" rx="${w*.6}" ry="3" fill="#142321" opacity=".45"/><rect x="${x-3}" y="${base}" width="${w+6}" height="11" rx="3" fill="${fill('socket')}" stroke="#52675a" stroke-width=".8"/><path d="M${x+1} ${base+2}h${w-2}" stroke="#9aafa0" stroke-opacity=".5"/><rect x="${x}" y="${y}" width="${w}" height="${h-7}" rx="${w*.43}" fill="${fill('glass')}" stroke="#b7ced0" stroke-opacity=".8" stroke-width="1.2"/><ellipse cx="${cx}" cy="${y+w*.24}" rx="${w*.29}" ry="${w*.12}" fill="#bdc9bc" opacity=".36"/><rect x="${plateX}" y="${plateY}" width="${plateW}" height="${plateH}" rx="2" fill="${fill('plate')}" stroke="#8e9a8a" stroke-width=".7"/>${Array.from({length:small?5:8},(_,n)=>`<path d="M${plateX+3} ${plateY+5+n*(plateH-10)/(small?4:7)}h${plateW-6}" stroke="#a3ad96" stroke-opacity=".38" stroke-width=".65"/>`).join('')}<path d="M${cx-w*.14} ${y+h*.19}V${base-2}M${cx+w*.14} ${y+h*.19}V${base-2}" stroke="#b0b59a" stroke-opacity=".6" stroke-width=".8"/><path d="M${x+w*.15} ${y+w*.34}v${h-w*.5-17}" stroke="#e7faff" stroke-opacity=".52" stroke-width="${small?1.2:2}" stroke-linecap="round"/><path d="M${x+w*.86} ${y+w*.42}v${h-w*.6-22}" stroke="#c6e5eb" stroke-opacity=".2" stroke-width="1"/><g class="valve-svg-glow"><ellipse cx="${cx}" cy="${base-6}" rx="${w*.22}" ry="${small?8:12}" fill="#ffa13a" opacity=".26" filter="${fill('glow')}"/><path d="M${cx-1.5} ${base-12}v10m3-10v10" stroke="#ffd89a" stroke-width="${small?1:1.5}" stroke-linecap="round"/><ellipse cx="${cx}" cy="${base+2}" rx="${w*.4}" ry="2" fill="#80dc9a" opacity=".6"/></g></g>`;
            };
            return `<svg class="valve-assembly" viewBox="0 0 760 184" aria-hidden="true"><defs><linearGradient id="${id}_black"><stop stop-color="#4b5650"/><stop offset=".13" stop-color="#1c2521"/><stop offset=".75" stop-color="#0b1511"/><stop offset="1" stop-color="#3c4940"/></linearGradient><linearGradient id="${id}_deck" x2="0" y2="1"><stop stop-color="#eef7f3"/><stop offset=".24" stop-color="#bccdc7"/><stop offset=".7" stop-color="#6e8984"/><stop offset="1" stop-color="#ceddd8"/></linearGradient><linearGradient id="${id}_glass"><stop stop-color="#cce7e52b"/><stop offset=".22" stop-color="#5a706a99"/><stop offset=".6" stop-color="#172d25cc"/><stop offset=".84" stop-color="#91b5a426"/><stop offset="1" stop-color="#d6ece447"/></linearGradient><linearGradient id="${id}_plate"><stop stop-color="#7e8980"/><stop offset=".27" stop-color="#38483b"/><stop offset=".75" stop-color="#26382c"/><stop offset="1" stop-color="#7f8d7c"/></linearGradient><linearGradient id="${id}_socket" x2="0" y2="1"><stop stop-color="#7d9381"/><stop offset=".3" stop-color="#324936"/><stop offset="1" stop-color="#182e1d"/></linearGradient><filter id="${id}_glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2"/></filter></defs><path d="M7 161H753L760 181H0Z" fill="${fill('deck')}" stroke="#9aafa8"/><path d="M9 164H751" stroke="#f3fff9" stroke-width="2"/>${transformer(25,27,190,137)}${transformer(285,13,190,151)}${transformer(545,27,190,137)}${[160,306,454,600].map(x=>tube(x,30,60,145)).join('')}${[60,166,272,380,488,594,700].map(x=>tube(x,106,31,76,true)).join('')}<path d="M1 183H759" stroke="#d2e7dd" stroke-width="2"/></svg>`;
        }
        function customPowerMarkup(type){
            const config=CUSTOM_POWER_AMPS[type];
            const ports=(io,node,format,signal)=>`<div class="custom-power-port-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" data-signal="${signal}" ${format==='wire'?'data-role="amp-speaker-out"':''} title="${io==='in'?'Entrada de linha':'Saída amplificada para caixa'} ${ch}"></div>`).join('')}</div>`;
            const connectorRow=`<div class="custom-power-connections"><div><small>LINE IN · L/R</small>${ports('in','in','rca','line')}</div><div class="custom-power-energy" data-power-slot><button class="power-btn" title="Ligar ou desligar"></button></div><div><small>SPEAKERS · L/R</small>${ports('out','out','wire','amplified')}</div></div>`;
            const valveArt=type==='powerValve'?valveAssemblyMarkup():'';
            const powerAngle=watts=>watts<=0?-100:-100+(Math.log10(watts/250)+4)*46;
            const biasTicks=[0,.1,1,10,100,250].map(watts=>{const angle=powerAngle(watts)*Math.PI/180;const label=watts===0?'0':String(watts);return `<path d="M${60+Math.sin(angle)*40} ${62-Math.cos(angle)*40}L${60+Math.sin(angle)*46} ${62-Math.cos(angle)*46}"/><text x="${60+Math.sin(angle)*32}" y="${64-Math.cos(angle)*32}" text-anchor="middle" style="font-size:6px;letter-spacing:0">${label}</text>`;}).join('');
            const biasArt=`<i class="bias-heatsink heatsink-left" aria-hidden="true"></i><i class="bias-heatsink heatsink-right" aria-hidden="true"></i><div class="bias-center"><div class="bias-meter"><svg viewBox="0 0 120 120" role="img" aria-label="Potência de saída simulada em watts"><g>${biasTicks}</g><text x="60" y="97" text-anchor="middle">W</text><line x1="60" y1="62" x2="60" y2="22" data-bias-needle transform="rotate(-100 60 62)"/><circle cx="60" cy="62" r="3"/></svg></div></div><div class="bias-vent vent-left"></div><div class="bias-vent vent-right"></div>`;
            const dualArt='<i class="dual-handle handle-left" aria-hidden="true"></i><i class="dual-handle handle-right" aria-hidden="true"></i><div class="dual-top-vents" aria-hidden="true"></div><div class="custom-power-indicators"><span><i data-dual-led="0"></i><b>L</b></span><span><i data-dual-led="1"></i><b>R</b></span></div>';
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="custom-power-face power-finish-${config.finish}"><div class="custom-power-main">${type==='powerValve'?valveArt:type==='powerBias'?biasArt:dualArt}</div>${connectorRow}</section>`;
        }
        function configureCustomPower(dev){
            const ctx=state.audioCtx,gains={};dev.powerNodes=[];dev.state.channelGain={L:DEFAULT_POWER_GAIN,R:DEFAULT_POWER_GAIN};
            ['L','R'].forEach(ch=>{
                const input=dev.nodes['in'+ch]=ctx.createGain(),gain=gains[ch]=ctx.createGain(),power=ctx.createGain(),stage=ctx.createGain(),output=dev.nodes['out'+ch]=ctx.createGain();
                stage.gain.value=1.35;input.connect(gain);gain.connect(power);power.connect(stage);stage.connect(output);dev.powerNodes.push(power);
            });
            dev.setChannelGain=(ch,value)=>{
                const bounded=Math.max(0,Math.min(1,Number(value)||0)),level=dev.type==='powerBias'?Math.round(bounded*10)/10:bounded;dev.state.channelGain[ch]=level;gains[ch].gain.setTargetAtTime(level,ctx.currentTime,.02);
                const knob=dev.el.querySelector(`[data-bias-gain="${ch}"]`);if(knob){knob.style.setProperty('--gain-angle',(-135+level*270)+'deg');knob.setAttribute('aria-valuenow',String(Math.round(level*10)));knob.setAttribute('aria-valuetext',Math.round(level*10)+' de 10');}
                const slider=state.selectedDeviceId===dev.id?document.getElementById('power-gain-'+ch):null;if(slider){slider.value=level;syncInspectorGainVisual(slider);}
            };
            ['L','R'].forEach(ch=>{
                const knob=dev.el.querySelector(`[data-bias-gain="${ch}"]`);
                dev.setChannelGain(ch,DEFAULT_POWER_GAIN);
                if(knob)Hardware.bindKnob(knob,{get:()=>dev.state.channelGain[ch],set:value=>dev.setChannelGain(ch,value)});
            });
        }
        let lastCustomPowerDisplay=0;
        function updateCustomPowerDisplays(now){
            if(now-lastCustomPowerDisplay<16)return;const elapsed=Math.min(.1,(now-lastCustomPowerDisplay)/1000);lastCustomPowerDisplay=now;
            Object.values(state.devices).filter(dev=>CUSTOM_POWER_AMPS[dev.type]).forEach(dev=>{
                if(dev.type==='powerValve'){
                    const target=dev.powered?1:0;dev.valveHeat+=(target-dev.valveHeat)*(1-Math.exp(-elapsed/(dev.powered?1.8:2.5)));
                    dev.valveGlowNodes.forEach((node,index)=>{node.style.opacity=(dev.valveHeat*(.93+(index%4)*.02)).toFixed(3);});
                }
                dev.el.querySelectorAll('[data-dual-led]').forEach(led=>{
                    const peak=dev.meters?.peaks[Number(led.dataset.dualLed)]||0,active=dev.powered&&peak>.0001;Hardware.setLed(led,active,peak>=.99);
                });
                const needle=dev.el.querySelector('[data-bias-needle]');if(!needle)return;
                const watts=dev.powered?Math.max(...[0,1].map(i=>wattsAtLoad(amplifierChannelRms(dev,i?'R':'L'),dev.channelLoads?.[i?'R':'L']??Infinity))):0;
                const fraction=Math.min(1,watts/dev.state.ratedWatts);
                const target=fraction>.0001?-100+(Math.log10(fraction)+4)*46:-100;
                dev.biasVisual??=-100;
                const response=target>dev.biasVisual?.22:.65;
                dev.biasVisual=matchMedia('(prefers-reduced-motion: reduce)').matches?target:dev.biasVisual+(target-dev.biasVisual)*(1-Math.exp(-elapsed/response));
                needle.setAttribute('transform',`rotate(${dev.biasVisual} 60 62)`);
                needle.closest('svg').setAttribute('aria-label',`Potência de saída simulada: ${watts.toFixed(2)} W, maior nível entre os canais A e B`);
                needle.closest('.bias-meter').title=`${watts.toFixed(2)} W · maior nível entre A e B`;

            });
        }

        function bookshelfSpeakerMarkup(type){
            const config=BOOKSHELF_SPEAKERS[type];
            const driver=(kind,size,top)=>`<div class="tower-driver shelf-${kind} ${kind==='woofer'?'spk-woofer':''}" style="--driver-size:${size}px;top:${top}px" aria-hidden="true"><i class="tower-cone"><b></b>${type==='shelfCoax'?'<em class="shelf-coax-dome"></em>':''}</i><span class="tower-driver-screws"><i></i><i></i><i></i><i></i></span></div>`;
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="bookshelf-body shelf-finish-${config.finish}">${type==='shelfTop'?'<div class="shelf-top-tweeter" aria-hidden="true"><i></i></div>':''}<div class="bookshelf-cabinet">${type==='shelfCoax'?driver('woofer',214,92):type==='shelfWood'?driver('tweeter',94,35)+driver('woofer',224,195):driver('woofer',222,90)}${['shelfWood','shelfCoax','shelfTop'].includes(type)?'':'<button class="speaker-grille bookshelf-grille" type="button" aria-label="Remover grade da caixa" title="Remover grade"></button><button class="grille-restore" type="button" title="Recolocar grade">RECOLOCAR GRADE</button>'}<div class="tower-terminal"><div class="port" data-type="wire" data-io="in" data-node="in" data-signal="amplified" title="Entrada amplificada para caixa passiva"></div><small>SPEAKER IN</small></div></div></section>`;
        }
        function floorSpeakerMarkup(type){
            const config=FLOOR_SPEAKERS[type];
            const driver=(kind,size,top)=>`<div class="tower-driver tower-${kind} ${kind==='bass'?'spk-woofer':''}" style="--driver-size:${size}px;top:${top}px"><i class="tower-cone"><b></b>${kind==='coax'?'<em class="tower-coax-tweeter"></em>':''}</i><span class="tower-driver-screws" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>`;
            const drivers=type==='floorDiamond'?driver('mid',140,38)+driver('bass',172,270)+driver('bass',172,502):type==='floorCoax'?driver('bass',160,50)+driver('bass',160,255)+driver('coax',128,511)+driver('bass',160,735)+driver('bass',160,940):driver('mid',166,20)+driver('tweeter',52,214)+driver('bass',166,300)+driver('bass',166,498)+driver('bass',166,696);
            return `<div class="device-header"><span>${DEVICE_NAMES[type]}</span></div><section class="tower-body tower-${config.finish}">${type==='floorDiamond'?'<div class="tower-top-tweeter" aria-hidden="true"><i><b></b></i></div>':''}<div class="tower-cabinet"><div class="tower-baffle">${drivers}${type==='floorFlax'?'<div class="tower-front-vent" aria-hidden="true"></div>':''}<div class="tower-terminal"><div class="port" data-type="wire" data-io="in" data-node="in" data-signal="amplified" title="Entrada amplificada para caixa passiva"></div><small>SPEAKER IN</small></div></div></div><div class="tower-plinth" aria-hidden="true"></div><i class="tower-foot foot-left" aria-hidden="true"></i><i class="tower-foot foot-right" aria-hidden="true"></i></section>`;
        }
        function syncLightPoint(dev){
            const color=/^#[0-9a-f]{6}$/i.test(dev.state.lightColor||'')?dev.state.lightColor:'#e4f4ff';
            const intensity=Math.max(0,Math.min(200,Number(dev.state.lightIntensity)||0));
            dev.state.lightColor=color;dev.state.lightIntensity=intensity;
            const colorInput=dev.el.querySelector('input[type="color"]'),range=dev.el.querySelector('input[type="range"]');
            colorInput.value=color;range.value=String(intensity);dev.el.querySelector('output').value=intensity+'%';
            dev.el.style.setProperty('--demo-light-color',color);dev.el.style.setProperty('--demo-light-strength',intensity/100);
            dev.el.setAttribute('aria-checked',String(dev.state.lightEnabled!==false));
            Hardware.updateLightingDemo();
        }
        function createLightPoint(x,y){
            const existing=Object.values(state.devices).find(dev=>dev.type==='lightPoint');
            if(existing){existing.el.style.left=Math.max(0,Math.min(world.offsetWidth-52,x))+'px';existing.el.style.top=Math.max(0,Math.min(world.offsetHeight-52,y))+'px';selectDevice(existing.id);updateCables();scheduleProjectSave();return;}
            const id='dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
            const el=document.createElement('div');el.id=id;el.className='device-node device-type-lightPoint lighting-demo-light';el.dataset.equipmentType='lightPoint';
            el.tabIndex=0;el.setAttribute('role','switch');el.setAttribute('aria-label','Ponto de luz de teste. Arraste para mover; use as setas para ajustar. Clique duplo, Enter ou espaço alternam a comparação visual.');
            el.title='Arraste para mover · clique duplo para comparar';
            el.innerHTML='<div class="device-header" aria-hidden="true"><span>Ponto de luz · Teste</span></div><span class="lighting-demo-orb" aria-hidden="true">☀</span><small>LUZ · TESTE</small><div class="lighting-demo-settings"><label>Cor <input type="color" value="#e4f4ff" aria-label="Cor da luz de teste"></label><label>Intensidade <input type="range" min="0" max="200" value="100" aria-label="Intensidade da luz de teste"><output>100%</output></label></div>';
            el.style.left=Math.max(0,Math.min(world.offsetWidth-52,x))+'px';el.style.top=Math.max(0,Math.min(world.offsetHeight-52,y))+'px';world.appendChild(el);
            const dev={id,type:'lightPoint',el,nodes:{},state:{lightColor:'#e4f4ff',lightIntensity:100,lightEnabled:true},powered:true};
            state.devices[id]=dev;
            const settings=el.querySelector('.lighting-demo-settings'),color=settings.querySelector('input[type="color"]'),range=settings.querySelector('input[type="range"]');
            settings.addEventListener('pointerdown',event=>event.stopPropagation());
            color.addEventListener('input',()=>{dev.state.lightColor=color.value;syncLightPoint(dev);scheduleProjectSave();});
            range.addEventListener('input',()=>{dev.state.lightIntensity=Number(range.value);syncLightPoint(dev);updateCables();scheduleProjectSave();});
            const toggle=()=>{dev.state.lightEnabled=dev.state.lightEnabled===false;syncLightPoint(dev);updateCables();scheduleProjectSave();};
            el.addEventListener('dblclick',event=>{if(event.target.closest('.lighting-demo-settings'))return;event.stopPropagation();toggle();});
            el.addEventListener('keydown',event=>{
                if(event.target!==el)return;
                if(event.key==='Enter'||event.key===' '){event.preventDefault();toggle();return;}
                const step=event.shiftKey?20:5,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[event.key];
                if(!delta)return;event.preventDefault();el.style.left=Math.max(0,Math.min(world.offsetWidth-el.offsetWidth,el.offsetLeft+delta[0]))+'px';el.style.top=Math.max(0,Math.min(world.offsetHeight-el.offsetHeight,el.offsetTop+delta[1]))+'px';updateCables();scheduleProjectSave();
            });
            bindDeviceEvents(dev);syncLightPoint(dev);selectDevice(id);updateCables();scheduleProjectSave();
        }
        function createPendantLamp(x,y){
            const id='dev_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
            const el=document.createElement('div');
            el.id=id;el.className='device-node device-type-pendantLamp';el.dataset.equipmentType='pendantLamp';
            el.tabIndex=0;el.setAttribute('aria-label','Luminária pendente. Arraste pela cúpula para mover.');
            el.innerHTML='<div class="device-header" aria-hidden="true"></div><div class="pendant-suspension" aria-hidden="true"><i class="pendant-cord"></i><div class="pendant-fixture"><i class="pendant-socket"></i><i class="pendant-bulb"><i class="pendant-filament"></i></i><i class="pendant-shade"></i></div></div>';
            el.style.left=Math.max(sceneSideInset(),Math.min(world.offsetWidth-504-sceneSideInset(),x))+'px';
            el.style.top=Math.max(0,Math.min(maxEquipmentBottom()-276,y))+'px';
            world.appendChild(el);
            const dev={id,type:'pendantLamp',el,nodes:{},state:{},powered:true};
            state.devices[id]=dev;bindDeviceEvents(dev);selectDevice(id);updateCables();scheduleProjectSave();
        }
        function createDevice(type, x, y) {
            if(type==='lightPoint')return createLightPoint(x,y);
            if(type==='pendantLamp')return createPendantLamp(x,y);
            initAudio();
            const id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            const el = document.createElement('div');
            el.className = 'device-node';el.dataset.equipmentType=type;
            el.classList.add(`device-type-${type}`);
            el.classList.add(`device-family-${DEVICE_FAMILIES[type] || 'modern'}`);
            el.id = id;
            const deviceName = MATRIX_TYPES.has(type) ? `Seletor RCA 3×4${type==='rcaMatrixVintage'?' Vintage':''}` : DEVICE_NAMES[type] || type;
            el.setAttribute('aria-label', deviceName);
            el.tabIndex = 0;
            
            el.style.left = `${Math.max(0, snapCoordinate(x))}px`;
            el.style.top = `${Math.max(0, snapCoordinate(y))}px`;
            
            if (type === 'turntableVintage') el.classList.add('device-type-turntable');
            const tpl = document.getElementById(`tpl-${type === 'turntableVintage' ? 'turntable' : type}`);
            if(tpl) el.innerHTML = tpl.innerHTML;
            else { el.innerHTML = `<div class="device-header"><span>${type}</span></div><div class="p-4"><span class="text-[8px] font-bold">INPUT · RCA R</span><div class="port" data-type="rca-r" data-io="in" data-node="in" title="Entrada RCA direita R"></div></div>`; }
            if (type === 'turntableVintage') el.querySelector('.device-header span').textContent = deviceName;
            if(['spkPassiveGridBlack','spkPassiveGridOrange'].includes(type))el.querySelector('.device-header span').textContent=deviceName;
            if(type==='turntableLinear')el.innerHTML=tpl.innerHTML.replaceAll('linear-art-',`${id}-art-`);
            
            if(type==='hardwareDemo')el.innerHTML=Hardware.demoMarkup();
            if(type==='streamIntegrated')el.innerHTML=streamIntegratedMarkup();
            if(SIGNAL_GENERATOR_TYPES.has(type)){el.innerHTML=generatorMarkup();if(type==='signalGeneratorVintage'){el.classList.add('device-type-signalGenerator');el.querySelector('.device-header span').textContent='GERADOR DE SINAIS VINTAGE';const display=document.createElement('canvas');display.className='signal-vintage-lcd';display.width=168;display.height=62;display.setAttribute('aria-hidden','true');el.querySelector('.signal-screen').appendChild(display);}}
            if(INTEGRATED_AMPS[type]){el.classList.add('integrated-amp');el.innerHTML=integratedMarkup(type);}
            if(CUSTOM_PREAMPS[type]){el.classList.add('integrated-amp','custom-preamp');el.innerHTML=customPreampMarkup(type);}
            if(CUSTOM_POWER_AMPS[type]){el.classList.add('custom-power-amp');el.innerHTML=customPowerMarkup(type);}
            if(BOOKSHELF_SPEAKERS[type]){el.classList.add('bookshelf-speaker','grille-off');el.style.setProperty('--shelf-height',BOOKSHELF_SPEAKERS[type].height+'px');el.style.setProperty('--shelf-width',BOOKSHELF_SPEAKERS[type].width+'px');el.innerHTML=bookshelfSpeakerMarkup(type);}
            if(FLOOR_SPEAKERS[type]){el.classList.add('floorstanding-speaker','grille-off');el.style.setProperty('--tower-height',FLOOR_SPEAKERS[type].height+'px');el.style.setProperty('--tower-cabinet',FLOOR_SPEAKERS[type].cabinet+'px');el.innerHTML=floorSpeakerMarkup(type);}
            if (EQ_TYPES.has(type)) el.innerHTML = graphicEqMarkup(type);
            if (['headphoneAmp','headphoneAmpModern'].includes(type)) {
                el.classList.add('phone-amp');
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="phone-amp-face"><div class="phone-amp-group"><div data-power-slot><button class="power-btn"></button></div></div><div class="phone-amp-group"><div class="phone-amp-pair"><div class="port" data-type="rca-r" data-io="in" data-node="inR" title="RCA IN R"></div><div class="port" data-type="rca-l" data-io="in" data-node="inL" title="RCA IN L"></div></div><span>RCA R/L IN</span></div><button class="receiver-dial amp-volume-knob phone-volume" aria-label="Volume dos fones" title="Arraste para ajustar o volume"></button><div class="phone-amp-group"><div class="port" data-type="p10" data-io="out" data-node="outPhone" title="Fone P10 estéreo"></div><span>FONE P10</span></div><div class="phone-amp-group"><div class="port" data-type="p2" data-io="out" data-node="outAux" title="Fone P2 estéreo"></div><span>FONE P2</span></div></section>`;
            }
            if (MATRIX_TYPES.has(type)) {
                const station = (io,n) => `<div class="selector-station"><button class="selector-key ${io==='in'?'input-key':''} ${n===1?'active':''}" data-matrix-${io}="${n}" aria-pressed="${n===1}" aria-label="${io==='in'?'Selecionar entrada':'Ativar saída'} ${n}"></button><div class="selector-pair">${['R','L'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${io}${n}${ch}" title="${io.toUpperCase()} ${n} · RCA ${ch}"></div>`).join('')}</div><span>${io.toUpperCase()} ${n} · RCA R/L</span></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="matrix-face">${[1,2,3].map(n=>station('in',n)).join('')}<div class="selector-divider"></div>${[1,2,3,4].map(n=>station('out',n)).join('')}</section>`;
            }
            if (MIXER_TYPES.has(type)) {
                const channels = ['CANAL 1','CANAL 2','CANAL 3'];
                const pair = (n) => `<div class="mixer-rack-pair"><div class="port" data-type="rca-r" data-io="in" data-node="in${n}R" title="Entrada ${n} · RCA direito R"></div><div class="port" data-type="rca-l" data-io="in" data-node="in${n}L" title="Entrada ${n} · RCA esquerdo L"></div></div>`;
                const strip = (name,index) => `<div class="mixer-rack-strip"><strong>${name}</strong><small>LINE IN · RCA R/L</small>${pair(index+1)}<div class="mixer-rack-fader"><input class="mixer-level-control" type="range" min="0" max="1" step="0.01" value="0.8" data-mixer-channel="${index}" aria-label="Volume ${name}"><output data-mixer-value="${index}">80%</output></div></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span><button class="power-btn" title="Ligar / desligar"></button></div><section class="mixer-rack-panel"><i class="mixer-rack-handle handle-left" aria-hidden="true"></i><i class="mixer-rack-handle handle-right" aria-hidden="true"></i><div class="mixer-rack-inputs"><header><strong>MIXER ESTÉREO</strong><span>3 ENTRADAS · RCA R/L</span></header><div class="mixer-rack-channels">${channels.map(strip).join('')}</div></div><div class="mixer-rack-output"><span>LINE OUT</span><small>RCA R/L</small><div class="mixer-rack-pair"><div class="port" data-type="rca-r" data-io="out" data-node="outR" title="Line Out · RCA direito R"></div><div class="port" data-type="rca-l" data-io="out" data-node="outL" title="Line Out · RCA esquerdo L"></div></div></div></section>`;
            }
            if (CROSSOVER_TYPES.has(type)) {
                const groups = [
                    ['ENTRADA','LINE IN','in','in'],
                    ['GRAVES','< 250 Hz','outLow','out'],
                    ['MÉDIOS','250 Hz – 2,5 kHz','outMid','out'],
                    ['AGUDOS','> 2,5 kHz','outHigh','out']
                ];
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span><button class="power-btn" title="Ligar / desligar"></button></div><section class="xover-panel">${groups.map(([label,range,node,io])=>`<div class="xover-group"><strong>${label}</strong><small>${range.replace('<','&lt;').replace('>','&gt;')}</small><div class="xover-pair">${['R','L'].map(ch=>`<div class="port" data-type="rca-${ch.toLowerCase()}" data-io="${io}" data-node="${node}${ch}" title="${label} · RCA ${ch} · ${io==='in'?'entrada':'saída'}"></div>`).join('')}</div><span>RCA R/L · ${io.toUpperCase()}</span></div>`).join('')}</section>`;
            }
            if (SELECTOR_TYPES.has(type)) {
                el.classList.add('selector-rack');
                const wire = SPEAKER_SWITCH_TYPES.has(type);
                const format = wire ? 'FIO L/R' : 'RCA R/L';
                const pair = (io,prefix) => `<div class="selector-pair">${['R','L'].map(ch=>`<div class="port" data-type="${wire?'wire':ch==='R'?'rca-r':'rca-l'}" data-io="${io}" data-node="${prefix}${ch}" ${wire&&io==='in'?'data-role="amp-speaker-in"':''} title="${io==='in'?'Entrada':'Saída'} ${prefix} · ${format} · ${ch}"></div>`).join('')}</div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="selector-face"><div class="selector-station"><i class="selector-input-led"></i><b class="selector-input-mark">INPUT</b>${pair('in',wire?'inAmp':'in')}<span>IN · ${format}</span></div><div class="selector-divider"></div>${['A','B'].map(ch=>`<div class="selector-station"><button class="selector-key ${ch==='A'?'active':''}" data-switch-source="${ch}" aria-pressed="${ch==='A'}" aria-label="Selecionar saída ${ch}" title="Selecionar saída ${ch}"></button>${pair('out','out'+ch)}<span>OUT ${ch} · ${format}</span></div>`).join('')}</section>`;
            }
            if (['powerStereo','powerVintage'].includes(type)) {
                el.classList.add('stereo-power');
                const port = (kind,io,node,label,role='') => `<div class="port" data-type="${kind}" data-io="${io}" data-node="${node}" data-role="${role}" title="${label}"></div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="stereo-power-face"><div class="stereo-power-inputs"><div class="stereo-power-pair">${port('rca-r','in','inR','RCA IN R')}${port('rca-l','in','inL','RCA IN L')}</div><span>RCA R/L IN</span>${port('p10','in','inStereo','P10 TRS IN · estéreo')}<span>P10 IN</span></div><div class="stereo-power-vent"></div><label class="stereo-power-gain"><button class="receiver-dial" data-power-channel="L" aria-label="Ganho A esquerdo"></button><span>GAIN A · L</span></label><div class="stereo-power-meters">${['L','R'].map(ch=>`<div data-meter="${ch}">${Array.from({length:8},(_,i)=>`<i style="--led-color:${i<2?'#dc4030':i===2?'#efb02e':'#35ce48'}"></i>`).join('')}</div>`).join('')}</div><label class="stereo-power-gain"><button class="receiver-dial" data-power-channel="R" aria-label="Ganho B direito"></button><span>GAIN B · R</span></label><div class="stereo-power-vent"></div><div class="stereo-power-outputs"><div class="stereo-power-pair">${port('wire','out','outL','SPEAKER OUT L','amp-speaker-out')}${port('wire','out','outR','SPEAKER OUT R','amp-speaker-out')}</div><span>CAIXAS L/R</span><div class="stereo-power-pair">${port('rca-l','out','lineL','LINE OUT RCA L')}${port('rca-r','out','lineR','LINE OUT RCA R')}</div><span>LINE OUT · RCA</span></div><div class="stereo-power-energy"><div data-power-slot><button class="power-btn"></button></div></div></section>`;
            }
            if(EXTRA_AUDIO_TYPES.has(type))el.innerHTML=extraDeviceMarkup(type);
            const rackUnits = {signalGeneratorVintage:3,signalGenerator:3,headphoneAmp4:3,preamp:3,benchMeter:4,benchMeterVintage:4,rcaSwitchVintage:3,powerStereo:3,powerVintage:3,receiver:4,powerAmp:4,eqStudio:3,eqVintage:3,mixer:4.5,mixerVintage:4.5,crossover:3,crossoverVintage:3,cdPlayer:3,streamer:3,btReceiverA:3,btTransmitterPro:3,rcaSwitch:3,speakerSwitch:3,speakerSwitchVintage:3};
            if (MATRIX_TYPES.has(type)) rackUnits[type] = 3;
            if (rackUnits[type]) {
                el.classList.add('rack-device');
                el.style.setProperty('--rack-units', rackUnits[type]);
                if (!MATRIX_TYPES.has(type) && !SELECTOR_TYPES.has(type) && !['signalGeneratorVintage','signalGenerator','headphoneAmp4','receiver','powerAmp','eqStudio','eqVintage','powerStereo','powerVintage','preamp','benchMeter','benchMeterVintage'].includes(type)) {
                    el.classList.add('rack-standard');
                    const face = el.querySelector('.device-header').nextElementSibling;
                    face.classList.add('rack-face');
                    if (el.querySelector('.power-btn')) {
                        const slot = face.querySelector('[data-power-slot]') || document.createElement('div');
                        slot.className = 'rack-power-slot';
                        slot.setAttribute('data-power-slot', '');
                        face.appendChild(slot);
                        slot.appendChild(el.querySelector('.power-btn'));
                    }
                }
            }
            if(type==='streamer'){
                const output=document.createElement('div');output.className='streamer-aux-output';
                output.innerHTML='<div class="port" data-type="p2" data-io="out" data-node="outStereo" data-signal="line" title="Saída AUX P2 TRS estéreo · nível de linha"></div><span>LINE OUT · P2</span>';
                el.querySelector('.rack-face').appendChild(output);
                const transport=document.createElement('button');transport.type='button';transport.className='streamer-transport-button';transport.dataset.sourcePlay='';transport.setAttribute('aria-label','Reproduzir ou pausar');transport.setAttribute('aria-pressed','false');transport.title='Reproduzir / pausar';transport.innerHTML='<svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true"><path d="M3 3v14l10-7Z" fill="currentColor"/><path d="M18 3v14m6-14v14" stroke="currentColor" stroke-width="3"/></svg>';el.querySelector('.rack-face').appendChild(transport);
            }
            if(SIGNAL_GENERATOR_TYPES.has(type))el.querySelector('[data-power-slot]').appendChild(el.querySelector('.power-btn'));
            if(type==='headphoneAmp4')el.querySelector('[data-power-slot]').appendChild(el.querySelector('.power-btn'));
            if (INTERFACE_DEVICES[type]) {
                const config = INTERFACE_DEVICES[type];
                el.classList.add('interface-box');
                const ports = (io,format) => ['p10','p2'].includes(format) ? `<div class="port" data-type="${format}" data-io="${io}" data-node="${io}Stereo" title="${io==='in'?'Entrada':'Saída'} ${format==='p2'?'P2':'P10'} TRS estéreo"></div>` : `<div class="interface-pair">${['L','R'].map(ch=>`<div class="port" data-type="${format==='wire'?'wire':'rca-'+ch.toLowerCase()}" data-io="${io}" data-node="${io}${ch}" title="${io==='in'?'Entrada':'Saída'} ${format==='wire'?'SPEAKER · fio':'RCA'} ${ch}"></div>`).join('')}</div>`;
                el.innerHTML = `<div class="device-header"><span>${deviceName}</span></div><section class="interface-face"><header>${config.name}</header><div class="interface-ports"><div><small>ENTRADA · ${config.input==='rca'?'RCA L/R':config.input==='wire'?'FIO L/R':config.input==='p2'?'P2 TRS':'P10 TRS'}</small>${ports('in',config.input)}</div><span aria-hidden="true">→</span><div><small>SAÍDA · ${config.output==='rca'?'RCA L/R':config.output==='p2'?'P2 TRS':'P10 TRS'}</small>${ports('out',config.output)}</div></div><footer>${config.passive?'PASSIVO · PRESERVA O SINAL':'CONVERSÃO DE NÍVEL'}</footer></section>`;
            }
            if(FURNITURE_TYPES[type]) {
                el.classList.add('furniture-node');
                if(FURNITURE_TYPES[type].acoustic)el.classList.add('acoustic-node');el.dataset.material='black';
                el.innerHTML=furnitureMarkup(type);
            }
            if(HP_TYPES.has(type)&&type!=='hpKubaDisco2'){
                const sideTemplate=document.getElementById('tpl-headphoneSide');
                el.innerHTML=sideTemplate.innerHTML;
                const artFiles={headphone:'over-ear',hpStudio:'studio',hpClassic:'classic',hpMonitor:'monitor',hpMax:'max',hpOpenRing:'open-ring',hpOpenDome:'open-dome',hpPlanar:'planar'};
                el.querySelector('.headphone-artwork').src=`./assets/headphones/${artFiles[type]}.svg`;
                el.querySelector('.device-header span').textContent=deviceName;
                if(REFERENCE_HEADPHONES[type])el.classList.add('reference-headphone');
            }
            if(type==='hpKubaDisco2'){
                // Scope SVG paint servers so multiple headphones keep independent finishes.
                el.innerHTML=tpl.innerHTML.replaceAll('kuba-art-',`${id}-art-`);
                el.classList.add('headphone-equipment','kuba-headphone');
            }
            if(HP_TYPES.has(type)&&type!=='hpKubaDisco2'){
                el.classList.add('headphone-equipment');
                if(type!=='hpMax'){
                    el.classList.add('headphone-cup-input');
                    const input=el.querySelector('.headphone-controls .port'),socket=document.createElement('div');socket.className='headphone-cable-input';
                    input.dataset.type=type==='headphone'?'p10':'p2';input.title=`Entrada de fones · ${type==='headphone'?'P10':'P2'} estéreo na ponta do cabo`;
                    socket.appendChild(input);el.querySelector('.headphone-object').appendChild(socket);
                    el.querySelector('.headphone-controls>span').textContent='BLUETOOTH';
                } else {
                    el.querySelector('.headphone-controls .port')?.remove();
                    el.querySelector('.headphone-controls>span').textContent='BLUETOOTH';
                }
                if(BT_HP_TYPES.has(type)){
                    const button=el.querySelector('.btn-bt-pair');
                    button.classList.add('headphone-bt-button');
                    button.type='button';button.setAttribute('aria-label','Parear Bluetooth');button.title='Parear Bluetooth';
                    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 10 10-5 4V3l5 4L7 17"/></svg>';
                    el.querySelector('.headphone-object').appendChild(button);
                }
                el.querySelector('.headphone-controls')?.remove();

            }
            if(HP_TYPES.has(type)){
                const stand=document.createElement('div');stand.className='headphone-stand';stand.setAttribute('aria-hidden','true');
                stand.innerHTML='<div class="headphone-stand-post"></div><div class="headphone-stand-cradle"></div><div class="headphone-stand-base"></div>';
                el.querySelector('.headphone-object').prepend(stand);
            }
            if(RADIO_RECEIVERS.has(type)){
                const old=type==='receiver'?el.querySelector('.receiver-front').nextElementSibling:el.querySelector('.poweramp-io-panel');
                const io=document.createElement('div');io.className='receiver-io-banks';io.innerHTML=receiverConnectionsMarkup(type);old.replaceWith(io);
                const host=type==='receiver'?el.querySelector('.receiver-front'):el.querySelector('.poweramp-body');
                host.insertAdjacentHTML('beforeend',receiverSourceButtons());
                if(type==='receiver'){const volume=el.querySelector('[data-receiver-control="volume"]'),control=document.createElement('div');control.className='receiver-control receiver-volume-control';volume.replaceWith(control);control.appendChild(volume);const label=document.createElement('span');label.textContent='VOLUME';control.appendChild(label);const slot=el.querySelector('.receiver-power-slot'),holder=slot.parentElement;el.querySelector('.receiver-front').parentElement.appendChild(slot);if(!holder.children.length)holder.remove();}
                const tuning=document.createElement('div');tuning.className='receiver-tuning-control';
                tuning.innerHTML='<button type="button" class="receiver-tuning-knob" data-radio-knob role="slider" aria-label="Sintonia FM" aria-valuemin="87.5" aria-valuemax="108" aria-valuenow="88" title="Sintonia FM · arraste ou use as setas"><i></i></button><span>TUNING</span>';
                el.querySelector(type==='receiver'?'.receiver-instruments':'.poweramp-control-panel').appendChild(tuning);
                if(type==='powerAmp'){const label=document.createElement('span');label.className='modern-receiver-volume-label';label.textContent='VOLUME';host.appendChild(label);}
                if(type==='powerAmp'){const screen=el.querySelector('.poweramp-screen'),meters=el.querySelector('.poweramp-meter');meters.querySelectorAll('.poweramp-meter-channel>div').forEach((track,index)=>track.innerHTML=`<span data-receiver-level="${index}"></span>`);screen.prepend(meters);}
                if(type==='powerAmp')el.querySelector('.poweramp-screen').insertAdjacentHTML('beforeend','<svg class="receiver-fm-animation" viewBox="0 0 180 24" aria-label="Recepção FM"><path class="fm-axis" d="M0 22H180"/><path data-fm-spectrum fill="none"/><line x1="90" y1="1" x2="90" y2="23" class="fm-center"/><rect x="1" y="22" width="178" height="2" class="fm-strength-track"/><rect data-fm-strength x="1" y="22" width="0" height="2"/></svg>');
            }
            if(type==='preamp'||CUSTOM_PREAMPS[type]){
                const slot=el.querySelector('[data-power-slot]');slot.classList.add('preamp-output-power');
                if(CUSTOM_PREAMPS[type]&&!['prePrecision','preGlass'].includes(type))el.querySelector('.integrated-connections').appendChild(slot);
            }
            if(['btReceiverA','btTransmitterPro'].includes(type)){
                const ports=el.querySelector('.bt-ports');
                el.querySelector('.bt-out')?.remove();el.querySelector('.bt-divider')?.remove();
                if(type==='btTransmitterPro'){
                    ports.appendChild(el.querySelector('.btn-bt-pair'));
                    const badge=document.createElement('span');badge.className='bt-badge';badge.textContent='TX';el.querySelector('.bt-display').appendChild(badge);
                }
                else {const play=document.createElement('button');play.type='button';play.dataset.sourcePlay='';play.setAttribute('aria-pressed','false');Hardware.sourceTransport(play,'illuminatedBar');ports.appendChild(play);}
            }
            if(['cdPlayer','streamer'].includes(type))Hardware.sourceTransport(el.querySelector('[data-source-play]'),'selectorKey');
            if(['headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(type)){
                const detail=document.createElement('div');detail.className='phone-housing-detail';detail.setAttribute('aria-hidden','true');
                detail.innerHTML='<span class="phone-housing-cheek is-left"></span><span class="phone-housing-cheek is-right"></span><span class="phone-housing-frame"></span><span class="phone-housing-vent"></span><span class="phone-housing-screws"><i></i><i></i><i></i><i></i></span>';
                el.querySelector('.phone-amp-face,.amp4-rack-face').prepend(detail);
            }
            standardizeStereoPorts(el);
            el.querySelectorAll('.port[data-type="wire"]').forEach(port=>{
                port.innerHTML='<svg class="spring-terminal-art" viewBox="0 0 32 22" aria-hidden="true"><rect x=".5" y=".5" width="31" height="21" rx="1.8" fill="#2e3938" stroke="#66716b" stroke-width=".8"/><rect x="5.5" y="2" width="21" height="18" rx="1" fill="#16201e" stroke="#46534d" stroke-width=".6"/><circle cx="2.9" cy="11" r="1.05" fill="#aeb9ad"/><circle cx="29.1" cy="11" r="1.05" fill="#aeb9ad"/><rect x="7" y="3" width="7.5" height="7.3" rx=".6" fill="#c93237" stroke="#ed6c66" stroke-width=".4"/><path d="M7.8 5.2h6M7.8 7.1h6M7.8 9h6" stroke="#8a1e25" stroke-width=".5"/><rect x="17.5" y="3" width="7.5" height="7.3" rx=".6" fill="#171c1b" stroke="#515e55" stroke-width=".4"/><path d="M18.3 5.2h6M18.3 7.1h6M18.3 9h6" stroke="#050909" stroke-width=".6"/><path d="M7 12h7.5v6H7zM17.5 12H25v6h-7.5z" fill="#26352e" stroke="#415146" stroke-width=".5"/><ellipse class="spring-terminal-hole" cx="10.8" cy="15" rx="2" ry="1.6" fill="#0b1010"/><ellipse class="spring-terminal-hole" cx="21.3" cy="15" rx="2" ry="1.6" fill="#0b1010"/><path d="M9.5 16.6h2.6M20 16.6h2.6" stroke="#9da68c" stroke-width=".5"/></svg>';
            });
            el.querySelectorAll('.port').forEach((p, i) => {
                p.id = `port_${id}_${i}`;
                p.tabIndex=0;
                if (!p.dataset.channel && /R$/.test(p.dataset.node || '')) p.dataset.channel = 'R';
                if (!p.dataset.channel && /L$/.test(p.dataset.node || '')) p.dataset.channel = 'L';
            });
            Hardware.layout({type,el});
            world.appendChild(el);

            const dev = { id, type, el, nodes: {}, state: { volume: 0.8, bass: 0, treble: 0, eq: [0, 0, 0, 0, 0] }, powered: true };
            const placement = state.restoringProject?{
                x:Math.max(sceneSideInset(),Math.min(world.offsetWidth-el.offsetWidth-sceneSideInset(),x)),
                y:Math.max(0,Math.min(maxEquipmentBottom()-el.offsetHeight,y))
            }:findFreePlacement(dev,x,y);
            if (!placement) { el.remove(); return; }
            el.style.left = `${placement.x}px`;
            el.style.top = `${placement.y}px`;
            
            // Cria nó master interno de energia para o aparelho
            dev.powerGain = state.audioCtx.createGain();
            dev.powerGain.gain.value = 1.0;

            if (FURNITURE_TYPES[type]) {
                dev.state.material='black';
                updateBenchAppearance(dev);
                if(FURNITURE_TYPES[type].back){dev.state.hasBack=true;el.dataset.back='true';}
            } else if (INTERFACE_DEVICES[type]) {
                const config = INTERFACE_DEVICES[type];
                dev.nodes.inL = state.audioCtx.createGain(); dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.outL = state.audioCtx.createGain(); dev.nodes.outR = state.audioCtx.createGain();
                ['L','R'].forEach(ch=>{
                    if (type === 'phonoConverter') {
                        // Inverse RIAA playback response, normalized at 1 kHz; gain converts the simulator's phono level to line.
                        const low = state.audioCtx.createBiquadFilter(), high = state.audioCtx.createBiquadFilter();
                        low.type='lowshelf'; low.frequency.value=120; low.gain.value=9;
                        high.type='highshelf'; high.frequency.value=2122; high.gain.value=-9;
                        const gain = state.audioCtx.createGain(); gain.gain.value=ELECTRICAL_MODEL.phonoGain;
                        dev.nodes['in'+ch].connect(low); low.connect(high); high.connect(gain); connectPhonoPlayback(dev,gain,dev.nodes['out'+ch]);
                    } else {
                        const gain=state.audioCtx.createGain(); gain.gain.value=type==='speakerConverter'?ELECTRICAL_MODEL.speakerVoltsPerUnit*ELECTRICAL_MODEL.converterRatio/ELECTRICAL_MODEL.lineVoltsPerUnit:1;
                        dev.nodes['in'+ch].connect(gain);gain.connect(dev.nodes['out'+ch]);
                    }
                });
                if (['p10','p2'].includes(config.input)) {const split=dev.nodes.inStereo=state.audioCtx.createChannelSplitter(2);split.connect(dev.nodes.inL,0);split.connect(dev.nodes.inR,1);}
                if (['p10','p2'].includes(config.output)) {const merge=dev.nodes.outStereo=state.audioCtx.createChannelMerger(2);dev.nodes.outL.connect(merge,0,0);dev.nodes.outR.connect(merge,0,1);}
            } else if(type==='preamp'||BENCH_METER_TYPES.has(type)){
                setupExtraRouting(dev);
            } else if(type==='streamIntegrated'){
                configureStreamIntegrated(dev);
            } else if (SOURCE_TYPES.has(type)) {
                dev.state.playing = false;
                dev.nodes.genR = state.audioCtx.createGain();
                dev.nodes.genL = state.audioCtx.createGain();
                dev.nodes.genR.gain.value = dev.nodes.genL.gain.value = 0;
                dev.nodes.outR = state.audioCtx.createGain();
                dev.nodes.outL = state.audioCtx.createGain();
                const powerR = state.audioCtx.createGain();
                const powerL = state.audioCtx.createGain();
                dev.powerNodes = [powerR, powerL];
                dev.nodes.genR.connect(powerR);
                dev.nodes.genL.connect(powerL);
                if (TURNTABLE_TYPES.has(type)) {
                    // PHONO: nível baixo e curva RIAA invertida (sem equalização no resto do sistema). LINE: pré interno, sinal plano.
                    const stages = [[powerR, dev.nodes.outR], [powerL, dev.nodes.outL]].map(([src, dst]) => {
                        const low = state.audioCtx.createBiquadFilter();
                        const high = state.audioCtx.createBiquadFilter();
                        const level = state.audioCtx.createGain();
                        low.type = 'lowshelf'; low.frequency.value = 120;
                        high.type = 'highshelf'; high.frequency.value = 2122;
                        src.connect(low); low.connect(high); high.connect(level); level.connect(dst);
                        return { low, high, level };
                    });
                    dev.setOutputMode = mode => {
                        const phono = mode === 'phono';
                        const t = state.audioCtx.currentTime;
                        stages.forEach(({ low, high, level }) => {
                            low.gain.setTargetAtTime(phono ? -9 : 0, t, .015);
                            high.gain.setTargetAtTime(phono ? 9 : 0, t, .015);
                            level.gain.setTargetAtTime(phono ? 1/ELECTRICAL_MODEL.phonoGain : 1, t, .015);
                        });
                    };
                    dev.setOutputMode('line');
                } else {
                    powerR.connect(dev.nodes.outR);
                    powerL.connect(dev.nodes.outL);
                }
            } else if (BT_TX_TYPES.has(type)) {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                dev.nodes.btOut = state.audioCtx.createChannelMerger(2);
                const inputPowerR = state.audioCtx.createGain();
                const inputPowerL = state.audioCtx.createGain();
                dev.powerNodes = [inputPowerR, inputPowerL];
                dev.nodes.inR.connect(inputPowerR);
                dev.nodes.inL.connect(inputPowerL);
                inputPowerR.connect(dev.nodes.btOut, 0, 1);
                inputPowerL.connect(dev.nodes.btOut, 0, 0);
            } else if(CUSTOM_POWER_AMPS[type]){
                configureCustomPower(dev);
            } else if(controlAmpConfig(type)){
                configureIntegratedAmp(dev);
                if(CUSTOM_PREAMPS[type])configureCustomPreamp(dev);
                if(type==='integratedUtility')configureUtilityAmp(dev);
                if(type==='prePrecision')configurePrecisionPreamp(dev);
                if(type==='preGlass')configureGlassPreamp(dev);
            } else if (type === 'receiver') {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                dev.nodes.bassR = state.audioCtx.createBiquadFilter(); dev.nodes.bassR.type = 'lowshelf'; dev.nodes.bassR.frequency.value = 100;
                dev.nodes.bassL = state.audioCtx.createBiquadFilter(); dev.nodes.bassL.type = 'lowshelf'; dev.nodes.bassL.frequency.value = 100;
                dev.nodes.trebleR = state.audioCtx.createBiquadFilter(); dev.nodes.trebleR.type = 'highshelf'; dev.nodes.trebleR.frequency.value = 3000;
                dev.nodes.trebleL = state.audioCtx.createBiquadFilter(); dev.nodes.trebleL.type = 'highshelf'; dev.nodes.trebleL.frequency.value = 3000;
                dev.nodes.bass = dev.nodes.bassR;
                dev.nodes.treble = dev.nodes.trebleR;
                dev.nodes.volR = state.audioCtx.createGain(); dev.nodes.volR.gain.value = 0.8;
                dev.nodes.volL = state.audioCtx.createGain(); dev.nodes.volL.gain.value = 0.8;
                dev.nodes.vol = dev.nodes.volR;
                dev.nodes.outR = state.audioCtx.createGain();
                dev.nodes.outL = state.audioCtx.createGain();
                dev.nodes.spkOutR = dev.nodes.outR;
                dev.nodes.spkOutL = dev.nodes.outL;
                dev.powerNodes = [dev.nodes.outR, dev.nodes.outL];
                dev.nodes.outSub = state.audioCtx.createGain();
                dev.nodes.outPhone = state.audioCtx.createChannelMerger(2);
                dev.nodes.subFilter = state.audioCtx.createBiquadFilter();
                dev.nodes.subFilter.type = 'lowpass';
                dev.nodes.subFilter.frequency.value = 120;
                dev.receiverRadioTargets={R:dev.nodes.bassR,L:dev.nodes.bassL};
                dev.nodes.inR.connect(dev.nodes.bassR);
                dev.nodes.bassR.connect(dev.nodes.trebleR);
                dev.nodes.trebleR.connect(dev.nodes.volR);
                dev.nodes.volR.connect(dev.nodes.outR);
                dev.nodes.inL.connect(dev.nodes.bassL);
                dev.nodes.bassL.connect(dev.nodes.trebleL);
                dev.nodes.trebleL.connect(dev.nodes.volL);
                dev.nodes.volL.connect(dev.nodes.outL);
                // O subwoofer soma os canais; os fones preservam L no canal 0 e R no canal 1.
                dev.nodes.outR.connect(dev.nodes.subFilter);
                dev.nodes.outL.connect(dev.nodes.subFilter);
                dev.nodes.subFilter.connect(dev.nodes.outSub);
                dev.nodes.outR.connect(dev.nodes.outPhone, 0, 1);
                dev.nodes.outL.connect(dev.nodes.outPhone, 0, 0);
            } else if (['headphoneAmp','headphoneAmpModern'].includes(type)) {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                const summer = state.audioCtx.createChannelMerger(2);
                dev.nodes.inR.connect(summer,0,1);
                dev.nodes.inL.connect(summer,0,0);
                
                dev.nodes.vol = state.audioCtx.createGain(); dev.nodes.vol.gain.value = 0.8;
                dev.nodes.outPhone = state.audioCtx.createGain();
                summer.connect(dev.nodes.vol);
                dev.nodes.vol.connect(dev.powerGain);
                dev.powerGain.connect(dev.nodes.outPhone);
                dev.nodes.outAux = dev.nodes.outPhone;
                dev.setPhoneVolume = value => {
                    dev.state.volume = Math.max(0,Math.min(1,Number(value)));
                    dev.nodes.vol.gain.setTargetAtTime(dev.state.volume,state.audioCtx.currentTime,.015);
                    updateKnobAngle(dev,'.phone-volume',dev.state.volume,0,1);
                    el.querySelector('.phone-volume').setAttribute('aria-valuenow',Math.round(dev.state.volume*100));
                    if(state.selectedDeviceId===id){const slider=document.getElementById('sl-amp-vol');if(slider)slider.value=dev.state.volume;const label=document.getElementById('lbl-amp-vol');if(label)label.textContent=Math.round(dev.state.volume*100)+'%';}
                };
                const knob=el.querySelector('.phone-volume');knob.setAttribute('role','slider');knob.setAttribute('aria-valuemin','0');knob.setAttribute('aria-valuemax','100');
                Hardware.bindKnob(knob,{get:()=>dev.state.volume,set:dev.setPhoneVolume});
                dev.setPhoneVolume(.8);
            } else if (type === 'headphoneAmp4') {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                const summer = state.audioCtx.createChannelMerger(2);
                dev.nodes.inR.connect(summer, 0, 1);
                dev.nodes.inL.connect(summer, 0, 0);
                dev.channelVolumes = [1, 2, 3, 4].map(() => state.audioCtx.createGain());
                dev.powerNodes = [1, 2, 3, 4].map(() => state.audioCtx.createGain());
                dev.channelVolumes.forEach((volume, index) => {
                    volume.gain.value = 0.8;
                    dev.nodes[`outPhone${index + 1}`] = state.audioCtx.createGain();
                    volume.connect(dev.powerNodes[index]);
                    dev.powerNodes[index].connect(dev.nodes[`outPhone${index + 1}`]);
                    summer.connect(volume);
                });
            } else if (MATRIX_TYPES.has(type)) {
                dev.state.matrixInput = 1; dev.state.matrixOutputs = [true,false,false,false];
                const inputGates = {}, outputGates = {};
                ['R','L'].forEach(ch=>{
                    const bus=state.audioCtx.createGain();
                    [1,2,3].forEach(n=>{const input=dev.nodes[`in${n}${ch}`]=state.audioCtx.createGain();const gate=inputGates[`${n}${ch}`]=state.audioCtx.createGain();gate.gain.value=n===1?1:0;input.connect(gate);gate.connect(bus);});
                    [1,2,3,4].forEach(n=>{const gate=outputGates[`${n}${ch}`]=state.audioCtx.createGain();gate.gain.value=n===1?1:0;dev.nodes[`out${n}${ch}`]=gate;bus.connect(gate);});
                });
                dev.updateMatrix = () => {
                    [1,2,3].forEach(n=>{const active=n===dev.state.matrixInput;['R','L'].forEach(ch=>inputGates[`${n}${ch}`].gain.setTargetAtTime(active?1:0,state.audioCtx.currentTime,.015));const button=el.querySelector(`[data-matrix-in="${n}"]`);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
                    [1,2,3,4].forEach(n=>{const active=dev.state.matrixOutputs[n-1];['R','L'].forEach(ch=>outputGates[`${n}${ch}`].gain.setTargetAtTime(active?1:0,state.audioCtx.currentTime,.015));const button=el.querySelector(`[data-matrix-out="${n}"]`);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
                    revalidateSignalConnections();updateCableFlows();
                };
                el.querySelectorAll('[data-matrix-in],[data-matrix-out]').forEach(button=>{button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('click',e=>{e.stopPropagation();if(button.dataset.matrixIn)dev.state.matrixInput=Number(button.dataset.matrixIn);else {const i=Number(button.dataset.matrixOut)-1;dev.state.matrixOutputs[i]=!dev.state.matrixOutputs[i];}dev.updateMatrix();});});
            } else if (RCA_SWITCH_TYPES.has(type)) {
                dev.selectedSource = 'A';
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                dev.nodes.routeAR = state.audioCtx.createGain();
                dev.nodes.routeAL = state.audioCtx.createGain();
                dev.nodes.routeBR = state.audioCtx.createGain();
                dev.nodes.routeBL = state.audioCtx.createGain();
                dev.nodes.outAR = state.audioCtx.createGain();
                dev.nodes.outAL = state.audioCtx.createGain();
                dev.nodes.outBR = state.audioCtx.createGain();
                dev.nodes.outBL = state.audioCtx.createGain();
                dev.nodes.inR.connect(dev.nodes.routeAR); dev.nodes.routeAR.connect(dev.nodes.outAR);
                dev.nodes.inR.connect(dev.nodes.routeBR); dev.nodes.routeBR.connect(dev.nodes.outBR);
                dev.nodes.inL.connect(dev.nodes.routeAL); dev.nodes.routeAL.connect(dev.nodes.outAL);
                dev.nodes.inL.connect(dev.nodes.routeBL); dev.nodes.routeBL.connect(dev.nodes.outBL);
                dev.nodes.routeAR.gain.value = 1;
                dev.nodes.routeAL.gain.value = 1;
                dev.nodes.routeBR.gain.value = 0;
                dev.nodes.routeBL.gain.value = 0;
            } else if (MIXER_TYPES.has(type)) {
                dev.state.channelVolumes = [0.8, 0.8, 0.8];
                dev.channelGains = [0, 1, 2].map(() => ({ R:state.audioCtx.createGain(), L:state.audioCtx.createGain() }));
                dev.nodes.outR = state.audioCtx.createGain(); dev.nodes.outL = state.audioCtx.createGain();
                const masterR = state.audioCtx.createGain(), masterL = state.audioCtx.createGain();
                    dev.powerNodes = [masterR, masterL];
                dev.channelGains.forEach((gains, index) => {
                    dev.nodes[`in${index + 1}R`] = state.audioCtx.createGain(); dev.nodes[`in${index + 1}L`] = state.audioCtx.createGain();
                    gains.R.gain.value = dev.state.channelVolumes[index]; gains.L.gain.value = dev.state.channelVolumes[index];
                    dev.nodes[`in${index + 1}R`].connect(gains.R); gains.R.connect(masterR);
                    dev.nodes[`in${index + 1}L`].connect(gains.L); gains.L.connect(masterL);
                });
                masterR.connect(dev.nodes.outR); masterL.connect(dev.nodes.outL);
            } else if (SPEAKER_SWITCH_TYPES.has(type)) {
                dev.selectedSource = 'A';
                ['R', 'L'].forEach(channel => { dev.nodes[`in${channel}`] = state.audioCtx.createGain(); dev.nodes[`inAmp${channel}`] = state.audioCtx.createGain(); dev.nodes[`in${channel}`].connect(dev.nodes[`inAmp${channel}`]); });
                ['A', 'B'].forEach(source => ['R', 'L'].forEach(channel => {
                    const route = dev.nodes[`route${source}${channel}`] = state.audioCtx.createGain();
                    const out = dev.nodes[`out${source}${channel}`] = state.audioCtx.createGain();
                    dev.nodes[`inAmp${channel}`].connect(route); route.connect(out);
                    route.gain.value = source === 'A' ? 1 : 0;
                }));
            } else if (PASSIVE_SUB_TYPES.has(type)) {
                dev.nodes.inR = state.audioCtx.createGain(); dev.nodes.inL = state.audioCtx.createGain();
                dev.filter = state.audioCtx.createBiquadFilter(); dev.filter.type = 'lowpass'; dev.filter.frequency.value = 120;
                dev.analyzer = state.audioCtx.createAnalyser();
                dev.nodes.inR.connect(dev.filter); dev.nodes.inL.connect(dev.filter);
                dev.filter.connect(dev.analyzer); dev.analyzer.connect(state.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (CROSSOVER_TYPES.has(type)) {
                dev.nodes.inR = state.audioCtx.createGain(); dev.nodes.inL = state.audioCtx.createGain();
                dev.powerNodes = [];
                [['Low','lowpass',250,0],['Mid','bandpass',Math.sqrt(250*2500),1],['High','highpass',2500,2]].forEach(([band, filterType, frequency, q]) => {
                    ['R', 'L'].forEach(channel => {
                        const filter = state.audioCtx.createBiquadFilter(); filter.type = filterType; filter.frequency.value = frequency;
                        if (filterType === 'bandpass') filter.Q.value = 0.65;
                        const gate = state.audioCtx.createGain(); gate.gain.value = 1; dev.powerNodes.push(gate);
                        const output = dev.nodes[`out${band}${channel}`] = state.audioCtx.createGain();
                        dev.nodes[`in${channel}`].connect(filter); filter.connect(gate); gate.connect(output);
                    });
                });
            } else if (EQ_TYPES.has(type)) {
                dev.state.eq = GRAPHIC_EQ_FREQUENCIES.map(() => 0);
                dev.state.eqLevel = 1;
                const levelDial = document.createElement('button');
                levelDial.className = 'graphic-eq-level receiver-dial';
                levelDial.setAttribute('role', 'slider');
                levelDial.setAttribute('aria-label', 'Nível de saída');
                levelDial.setAttribute('aria-valuemin', '0');
                levelDial.setAttribute('aria-valuemax', '100');
                dev.el.querySelector('.graphic-eq-level').replaceWith(levelDial);
                const freqs = EQ_BANDS[type] || EQ_BANDS.eqStudio;
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                dev.nodes.outR = state.audioCtx.createGain();
                dev.nodes.outL = state.audioCtx.createGain();
                dev.eqFiltersR = createEqFilters(freqs);
                dev.eqFiltersL = createEqFilters(freqs);
                const powerR = state.audioCtx.createGain();
                const powerL = state.audioCtx.createGain();
                dev.powerNodes = [powerR, powerL];
                wireFilterChain(dev.nodes.inR, dev.eqFiltersR, powerR);
                wireFilterChain(dev.nodes.inL, dev.eqFiltersL, powerL);
                powerR.connect(dev.nodes.outR);
                powerL.connect(dev.nodes.outL);
                dev.nodes.inStereo = state.audioCtx.createChannelSplitter(2);
                dev.nodes.inStereo.connect(dev.nodes.inL, 0);
                dev.nodes.inStereo.connect(dev.nodes.inR, 1);
                dev.nodes.outStereo = state.audioCtx.createChannelMerger(2);
                dev.nodes.outL.connect(dev.nodes.outStereo, 0, 0);
                dev.nodes.outR.connect(dev.nodes.outStereo, 0, 1);
                const eqOutputGains=[dev.nodes.outR,dev.nodes.outL];
                dev.setEqLevel = value => {
                    dev.state.eqLevel = Number(value);
                    eqOutputGains.forEach(node => node.gain.setTargetAtTime(dev.state.eqLevel, state.audioCtx.currentTime, .015));
                    dev.el.querySelector('.graphic-eq-level').value = value;
                    updateKnobAngle(dev, '.graphic-eq-level', Number(value), 0, 1);
                    levelDial.setAttribute('aria-valuenow', Math.round(value * 100));
                    dev.el.querySelector('.graphic-eq-level').title = `Nível de saída · ${Math.round(value * 100)}%`;
                    if (state.selectedDeviceId === dev.id) { const slider = document.getElementById('sl-eq-level'); if (slider) slider.value = value; }
                };
                const level = dev.el.querySelector('.graphic-eq-level');
                Hardware.bindKnob(level,{get:()=>dev.state.eqLevel,set:dev.setEqLevel});
                dev.setEqLevel(1);
            } else if (['powerStereo','powerVintage'].includes(type)) {
                dev.state.channelGain = {L:DEFAULT_POWER_GAIN,R:DEFAULT_POWER_GAIN};
                dev.powerNodes = [];
                const gains = {};
                ['L','R'].forEach(ch => {
                    dev.nodes['in'+ch] = state.audioCtx.createGain();
                    gains[ch] = state.audioCtx.createGain();
                    const gate = state.audioCtx.createGain(); dev.powerNodes.push(gate);
                    dev.nodes['out'+ch] = state.audioCtx.createGain();
                    dev.nodes['line'+ch] = state.audioCtx.createGain();
                    dev.nodes['in'+ch].connect(gains[ch]); gains[ch].connect(gate);
                    gate.connect(dev.nodes['line'+ch]);
                    const stage = state.audioCtx.createGain(); stage.gain.value = 1.35;
                    gate.connect(stage); stage.connect(dev.nodes['out'+ch]);
                });
                dev.nodes.inStereo = state.audioCtx.createChannelSplitter(2);
                dev.nodes.inStereo.connect(dev.nodes.inL,0); dev.nodes.inStereo.connect(dev.nodes.inR,1);
                dev.setChannelGain = (ch,value) => {
                    value = Math.max(0,Math.min(1,Number(value))); dev.state.channelGain[ch] = value;
                    gains[ch].gain.setTargetAtTime(value,state.audioCtx.currentTime,.015);
                    const knob = el.querySelector(`[data-power-channel="${ch}"]`);
                    updateKnobAngle(dev,`[data-power-channel="${ch}"]`,value,0,1);
                    knob.setAttribute('aria-valuenow',Math.round(value*100)); knob.title = `Ganho ${ch} · ${Math.round(value*100)}%`;
                    if (state.selectedDeviceId===id) { const slider=document.getElementById('power-gain-'+ch); if(slider){slider.value=value;syncInspectorGainVisual(slider);} }
                    updateStereoPowerMeters(dev);
                };
                el.querySelectorAll('[data-power-channel]').forEach(knob => {
                    const ch=knob.dataset.powerChannel;
                    knob.setAttribute('role','slider'); knob.setAttribute('aria-valuemin','0'); knob.setAttribute('aria-valuemax','100');
                    Hardware.bindKnob(knob,{get:()=>dev.state.channelGain[ch],set:value=>dev.setChannelGain(ch,value)});
                    dev.setChannelGain(ch,DEFAULT_POWER_GAIN);
                });
            } else if (type === 'powerAmp') {
                dev.nodes.inR = state.audioCtx.createGain();
                dev.nodes.inL = state.audioCtx.createGain();
                dev.nodes.outR = state.audioCtx.createGain();
                dev.nodes.outL = state.audioCtx.createGain();
                const channelPowerR = state.audioCtx.createGain();
                const channelPowerL = state.audioCtx.createGain();
                const stageGainR = state.audioCtx.createGain();
                const stageGainL = state.audioCtx.createGain();
                stageGainR.gain.value = type === 'powerAmp' ? 1.35 : 1;
                stageGainL.gain.value = type === 'powerAmp' ? 1.35 : 1;
                dev.receiverRadioTargets={R:stageGainR,L:stageGainL};
                dev.nodes.inR.connect(stageGainR);
                dev.nodes.inL.connect(stageGainL);
                if (type === 'powerAmp') {
                    dev.state.volume = 1;
                    dev.setAmplifierVolume = value => {
                        dev.state.volume = Math.max(0, Math.min(1, value));
                        stageGainR.gain.setTargetAtTime(1.35 * dev.state.volume, state.audioCtx.currentTime, .015);
                        stageGainL.gain.setTargetAtTime(1.35 * dev.state.volume, state.audioCtx.currentTime, .015);
                        updateKnobAngle(dev, '.poweramp-level', dev.state.volume, 0, 1);
                        dev.el.querySelector('[data-amp-level]').textContent = Math.round(dev.state.volume * 100) + '%';
                        dev.el.querySelector('.poweramp-level').setAttribute('aria-valuenow', Math.round(dev.state.volume * 100));
                        if (state.selectedDeviceId === dev.id) {
                            const slider = document.getElementById('sl-poweramp-volume');
                            if (slider) slider.value = dev.state.volume;
                        }
                    };
                    const dial = dev.el.querySelector('.poweramp-level');
                    dial.setAttribute('role', 'slider');
                    dial.setAttribute('aria-valuemin', '0');
                    dial.setAttribute('aria-valuemax', '100');
                    Hardware.bindKnob(dial,{get:()=>dev.state.volume,set:dev.setAmplifierVolume});
                    dev.setAmplifierVolume(1);
                    stageGainR.connect(channelPowerR); channelPowerR.connect(dev.nodes.speakerR = state.audioCtx.createGain());
                    stageGainL.connect(channelPowerL); channelPowerL.connect(dev.nodes.speakerL = state.audioCtx.createGain());
                    dev.nodes.speakerR.connect(dev.nodes.outR); dev.nodes.speakerL.connect(dev.nodes.outL);
                } else {
                    stageGainR.connect(channelPowerR); channelPowerR.connect(dev.nodes.outR);
                    stageGainL.connect(channelPowerL); channelPowerL.connect(dev.nodes.outL);
                }
                dev.powerNodes = [channelPowerR, channelPowerL];
            } else if (PASSIVE_SPK.has(type)) {
                wireSpeakerIn(dev, false);
            } else if (ACTIVE_SPK.has(type)) {
                wireSpeakerIn(dev, true);
            } else if (SUB_TYPES.has(type)) {
                dev.nodes.in = state.audioCtx.createGain();
                dev.filter = state.audioCtx.createBiquadFilter();
                dev.filter.type = 'lowpass';
                dev.filter.frequency.value = type === 'subwooferPro' ? 100 : 120;
                dev.analyzer = state.audioCtx.createAnalyser();
                dev.volumeNode = state.audioCtx.createGain();
                dev.nodes.in.connect(dev.volumeNode);
                dev.volumeNode.connect(dev.powerGain);
                dev.powerGain.connect(dev.filter);
                dev.filter.connect(dev.analyzer);
                dev.analyzer.connect(state.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (PASSIVE_SUB_TYPES.has(type)) {
                dev.nodes.inR = state.audioCtx.createGain(); dev.nodes.inL = state.audioCtx.createGain();
                dev.filter = state.audioCtx.createBiquadFilter(); dev.filter.type = 'lowpass'; dev.filter.frequency.value = 120;
                dev.analyzer = state.audioCtx.createAnalyser();
                dev.nodes.inR.connect(dev.filter); dev.nodes.inL.connect(dev.filter);
                dev.filter.connect(dev.analyzer); dev.analyzer.connect(state.masterGain);
                dev.dataArray = new Uint8Array(dev.analyzer.frequencyBinCount);
            } else if (HP_TYPES.has(type)) {
                wireSpeakerIn(dev, false);
            }

            if(type==='streamer'){
                dev.nodes.outStereo=state.audioCtx.createChannelMerger(2);
                dev.nodes.outL.connect(dev.nodes.outStereo,0,0);dev.nodes.outR.connect(dev.nodes.outStereo,0,1);
            }
            if(type==='tapeDeck')setupTapeAudio(dev);
            if(dev.receiverRadioTargets)setupReceiverRadio(dev);
            state.devices[id] = dev;
            updateKubaAppearance(dev);
            fixDeviceElectricalSpecs(dev);
            installAmplificationVoicing(dev);
            installOutputCircuits(dev);
            installListeningControls(dev);
            bindDeviceEvents(dev);
            if(SIGNAL_GENERATOR_TYPES.has(type)){configureSignalGenerator(dev);bindSignalGeneratorPanel(dev);}
            if(EXTRA_AUDIO_TYPES.has(type))bindExtraDevice(dev);
            if(type==='hardwareDemo')Hardware.bindDemo(dev);
            Hardware.mount(dev);
            if(!FURNITURE_TYPES[type]) setupAudioMeters(dev);
            animateDevicePower(dev);
            selectDevice(id);
            updateCableFlows();
        }

        const powerOnAnimations=new WeakMap();
        const powerMotionPreference=matchMedia('(prefers-reduced-motion: reduce)');
        function stopPowerOnRitual(dev){
            powerOnAnimations.get(dev)?.forEach(animation=>animation.cancel());powerOnAnimations.delete(dev);
        }
        function animateDevicePower(dev){
            stopPowerOnRitual(dev);
            if(!dev.powered||dev.state.damage||state.restoringProject||powerMotionPreference.matches)return;
            const animations=[];
            const fade=(element,delay,duration)=>{
                const opacity=getComputedStyle(element).opacity;
                animations.push(element.animate([{opacity:0},{opacity}],{delay,duration,easing:'ease-out',fill:'backwards'}));
            };
            dev.el.querySelectorAll('.hw-led,.device-led,.hw-bar-lens').forEach(element=>fade(element,0,220));
            const screens='.device-display,.cd-lcd,.poweramp-screen,.receiver-radio,.custom-pre-screen,.signal-screen,.bench-lcd,.bench-screen,.integrated-gauges,.integrated-green-window,.bias-meter,.extra-vu';
            [...dev.el.querySelectorAll(screens)].filter(element=>!element.parentElement.closest(screens)).forEach((element,index)=>fade(element,70+Math.min(index,2)*40,300));
            dev.el.querySelectorAll('[data-integrated-needle],[data-bias-needle],[data-live-vu],.receiver-vu i').forEach(element=>{
                animations.push(element.animate([{translate:'-1px 1.5px'},{translate:'.3px -.4px',offset:.7},{translate:'0px 0px'}],{delay:130,duration:420,easing:'ease-out',fill:'backwards'}));
            });
            powerOnAnimations.set(dev,animations);
        }
        powerMotionPreference.addEventListener('change',event=>{if(event.matches)Object.values(state.devices).forEach(dev=>{stopPowerOnRitual(dev);});});

        function toggleDevicePower(dev) {
            dev.powered = dev.state.damage ? false : !dev.powered;
            (dev.outputCircuits||[]).forEach(circuit=>circuit.gate.gain.setValueAtTime(dev.powered&&!dev.state.damage?1:0,state.audioCtx.currentTime));
            dev.el.classList.toggle('device-damaged',!!dev.state.damage);
            dev.syncRadio?.();
            dev.syncValvePower?.();
            dev.applyStream?.();
            if (!dev.powered && SOURCE_TYPES.has(dev.type)) setSourcePlaying(dev, false);
            const powerTime = state.audioCtx ? state.audioCtx.currentTime : 0;
            if (dev.powerGain) {
                dev.powerGain.gain.setValueAtTime(dev.powered ? 1.0 : 0.0, powerTime);
            }
            (dev.powerNodes || []).forEach(node => node.gain.setValueAtTime(dev.powered ? 1.0 : 0.0, powerTime));
            
            const btn = dev.el.querySelector('.power-btn');
            if (btn) {
                const stateText = btn.parentElement.querySelector('.power-state');
                btn.setAttribute('aria-pressed', String(dev.powered));
                if(btn.matches('.power-rocker-switch,.hw-slide-power,.hw-chrome-lever'))btn.setAttribute('aria-checked',String(dev.powered));
                if (dev.powered) {
                    btn.classList.remove('off');
                    btn.title = 'Ligado (Clique para desligar)';
                    if (stateText) stateText.textContent = 'ON';
                    dev.el.classList.remove('power-off');
                } else {
                    btn.classList.add('off');
                    btn.title = 'Desligado (Clique para ligar)';
                    if (stateText) stateText.textContent = 'OFF';
                    dev.el.classList.add('power-off');
                }
            }

            // Atualiza inspeção caso esteja selecionado
            if (state.selectedDeviceId === dev.id) {
                const statusLbl = document.getElementById('lbl-power-status');
                if (statusLbl) {
                    statusLbl.innerText = dev.powered ? 'LIGADO' : 'DESLIGADO';
                    statusLbl.className = dev.powered ? 'text-xs text-emerald-400 font-bold' : 'text-xs text-red-400 font-bold';
                }
                const propertyToggle = document.getElementById('inspector-power-toggle');
                if (propertyToggle) {
                    propertyToggle.setAttribute('aria-pressed', String(dev.powered));
                    propertyToggle.classList.toggle('is-on', dev.powered);
                }
            }
            dev.refreshTurntable?.();
            refreshCdDisplay(dev);
            animateDevicePower(dev);
            updateCableFlows();
        }

        function setupActiveSpeaker(dev) {
            dev.state.volume = 0.8;
            const knob = dev.el.querySelector('[data-sp="vol"]');
            dev.setSpeakerVolume = v => {
                const n = Math.max(0, Math.min(1, v));
                const pct = Math.round(n * 100);
                dev.state.volume = n;
                dev.volumeNode?.gain.setTargetAtTime(n * 1.25, state.audioCtx.currentTime, 0.015);
                knob.style.setProperty('--knob-angle', `${-135 + n * 270}deg`);
                knob.setAttribute('aria-valuenow', pct);
                if (state.selectedDeviceId === dev.id) {
                    const r = document.getElementById('sp-insp-vol');
                    if (r && Number(r.value) !== pct) r.value = pct;
                    const l = document.getElementById('sp-insp-vol-lbl');
                    if (l) l.textContent = `${pct}%`;
                }
            };
            Hardware.bindKnob(knob,{get:()=>dev.state.volume,set:dev.setSpeakerVolume});
            dev.setSpeakerVolume(0.8);
        }

        function speakerInspectorHtml(dev) {
            const v = Math.round((dev.state.volume ?? 0.8) * 100);
            return `<div class="flex flex-col gap-2 mt-4"><div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume</span><span id="sp-insp-vol-lbl" class="text-xs text-blue-400 font-mono">${v}%</span></div><input id="sp-insp-vol" aria-label="Volume" type="range" min="0" max="100" step="1" value="${v}" class="w-full"></div>`;
        }

        const LINEAR_DISC_TYPES={lp:'30 cm · LP',single:'17 cm · Single',none:'Sem disco'};
        function setupLinearTurntable(dev){
            const tt=dev.state.tt={running:false,pitch:0,output:'line',speed:33,disc:'lp',trim33:0,trim45:0};
            const el=dev.el,mechanism=dev.linear={phase:'idle',deadline:0,arm:485,target:485,operation:0,cue:0,disposed:false,message:''};
            const phaseNames={idle:'Em repouso',scanning:'Detectando o disco',lowering:'Descendo a agulha',playing:'Em reprodução',raised:'Agulha elevada',returning:'Retornando ao repouso'};
            const duration=()=>dev.audioBuffer?.duration||180;
            const leadIn=()=>tt.disc==='single'?297:380;
            const leadOut=()=>tt.disc==='single'?255:270;
            const position=()=>dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?(state.audioCtx.currentTime-dev.demoStartedAt)*dev.ttRate():0);
            const pause=()=>{
                const seconds=position();
                setSourcePlaying(dev,false,true);
                if(!dev.audioBuffer)dev.demoOffset=seconds;
            };
            const refresh=()=>{
                tt.running=dev.powered&&mechanism.phase!=='idle';
                const lowered=mechanism.phase==='playing';
                el.dataset.linearPhase=mechanism.phase;el.dataset.linearDisc=tt.disc;
                el.classList.toggle('tt-motor',tt.running);el.classList.toggle('tt-stopped',!tt.running);
                el.classList.toggle('linear-needle-down',lowered);
                const status=!dev.powered?'Desligado':mechanism.message||phaseNames[mechanism.phase];
                el.querySelector('[data-linear-status]').textContent=status;
                el.querySelector('[data-linear-rpm]').textContent=(dev.powered?(tt.speed===45?45:100/3)*(1+tt.pitch*.03):0).toFixed(2);
                el.querySelectorAll('[data-linear-speed]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.linearSpeed)===tt.speed)));
                el.querySelector('[data-linear-lift]').setAttribute('aria-pressed',String(mechanism.phase==='raised'));
                el.querySelector('[data-linear-start]').setAttribute('aria-pressed',String(lowered||mechanism.phase==='scanning'||mechanism.phase==='lowering'));
                for(const speed of [33,45]){
                    const knob=el.querySelector(`[data-linear-trim="${speed}"]`),value=tt['trim'+speed];
                    knob.style.setProperty('--knob-angle',`${value*135}deg`);knob.setAttribute('aria-valuenow',String(Math.round(value*30)/10));
                }
                if(state.selectedDeviceId===dev.id){
                    const q=id=>document.getElementById(id);
                    if(q('linear-status'))q('linear-status').textContent=status;
                    if(q('linear-disc'))q('linear-disc').value=tt.disc;
                    [33,45].forEach(speed=>{
                        q('linear-speed-'+speed)?.setAttribute('aria-pressed',String(tt.speed===speed));
                        const slider=q('linear-trim-'+speed),value=Math.round(tt['trim'+speed]*30)/10;
                        if(slider)slider.value=value;
                        if(q('linear-trim-value-'+speed))q('linear-trim-value-'+speed).textContent=`${value>0?'+':''}${value.toFixed(1)}%`;
                    });
                    q('linear-lift')?.setAttribute('aria-pressed',String(mechanism.phase==='raised'));
                    q('tt-insp-power')?.setAttribute('aria-pressed',String(dev.powered));
                    ['line','phono'].forEach(mode=>q('tt-insp-out-'+mode)?.classList.toggle('is-on',tt.output===mode));
                }
            };
            dev.refreshTurntable=refresh;
            dev.ttRate=()=>((tt.speed===45?45:100/3)/(tt.disc==='single'?45:100/3))*(1+tt.pitch*.03);
            dev.linearStop=()=>{
                mechanism.operation++;mechanism.cue=0;pause();dev.fileOffset=0;dev.demoOffset=0;
                mechanism.phase=Math.abs(mechanism.arm-485)<.1?'idle':'returning';
                mechanism.deadline=performance.now()+750;mechanism.target=485;refresh();
            };
            dev.linearStart=async()=>{
                if(!dev.powered||dev.state.damage||mechanism.disposed||['scanning','lowering','playing'].includes(mechanism.phase))return;
                const operation=++mechanism.operation;
                try{await state.audioCtx.resume();}catch{}
                if(operation!==mechanism.operation||mechanism.disposed||!dev.powered)return;
                if(state.audioCtx.state!=='running'){mechanism.message='Clique novamente para ativar o áudio';refresh();return;}
                mechanism.message='';mechanism.cue=0;
                if(mechanism.phase==='raised'&&tt.disc!=='none'){
                    mechanism.phase='lowering';mechanism.target=Math.min(leadIn(),mechanism.arm);mechanism.deadline=performance.now()+430;
                }else{
                    // The sensor traverses the rim before a diameter is accepted.
                    mechanism.phase='scanning';mechanism.target=tt.disc==='none'?245:leadIn();mechanism.deadline=performance.now()+1250;
                    tt.speed=tt.disc==='single'?45:33;tt.pitch=tt['trim'+tt.speed];
                    dev.fileOffset=0;dev.demoOffset=0;
                }
                refresh();
            };
            dev.linearSetPlaying=playing=>playing?dev.linearStart():dev.linearStop();
            dev.ttToggleRun=()=>dev.state.playing||['scanning','lowering'].includes(mechanism.phase)?dev.linearStop():dev.linearStart();
            dev.linearLift=()=>{
                if(!dev.powered)return;
                if(mechanism.phase==='playing'){
                    mechanism.operation++;pause();mechanism.phase='raised';mechanism.target=mechanism.arm;refresh();
                }else if(mechanism.phase==='raised')dev.linearStart();
            };
            dev.linearCue=direction=>{
                if(!direction){
                    if(mechanism.cue){
                        const progress=Math.max(0,Math.min(1,(leadIn()-mechanism.target)/(leadIn()-leadOut())));
                        if(dev.audioBuffer)dev.fileOffset=progress*duration();else dev.demoOffset=progress*duration();
                    }
                    mechanism.cue=0;return;
                }
                if(!dev.powered||tt.disc==='none')return;
                mechanism.operation++;pause();mechanism.message='';mechanism.phase='raised';mechanism.cue=direction;mechanism.target=mechanism.arm;refresh();
            };
            const changeRate=callback=>{
                const restart=!!dev.filePlayback,seconds=position();
                if(restart)stopFilePlayback(dev);
                callback();tt.pitch=tt['trim'+tt.speed];
                if(!dev.audioBuffer){dev.demoOffset=seconds;dev.demoStartedAt=dev.state.playing?state.audioCtx.currentTime:null;}
                if(restart)startFilePlayback(dev);
                refresh();
            };
            dev.linearSetSpeed=speed=>changeRate(()=>{tt.speed=Number(speed)===45?45:33;});
            dev.linearSetTrim=(speed,value)=>{
                speed=Number(speed)===45?45:33;
                const trimmed=Math.max(-1,Math.min(1,Number(value)||0));
                if(speed!==tt.speed){tt['trim'+speed]=trimmed;refresh();}
                else changeRate(()=>{tt['trim'+speed]=trimmed;});
            };
            dev.ttSetPitch=value=>dev.linearSetTrim(tt.speed,value);
            dev.ttSetOutput=mode=>{tt.output=mode==='phono'?'phono':'line';dev.setOutputMode(tt.output);revalidateSignalConnections();refresh();updateCableFlows();};
            dev.linearSetDisc=disc=>{
                dev.linearStop();tt.disc=Object.hasOwn(LINEAR_DISC_TYPES,disc)?disc:'lp';
                tt.speed=tt.disc==='single'?45:33;tt.pitch=tt['trim'+tt.speed];mechanism.message='';refresh();scheduleProjectSave();
            };
            dev.restoreLinear=()=>{
                mechanism.operation++;mechanism.phase='idle';mechanism.arm=mechanism.target=485;mechanism.cue=0;mechanism.message='';
                tt.disc=Object.hasOwn(LINEAR_DISC_TYPES,tt.disc)?tt.disc:'lp';tt.speed=tt.speed===45?45:33;
                for(const key of ['trim33','trim45'])tt[key]=Number.isFinite(tt[key])?Math.max(-1,Math.min(1,tt[key])):0;
                tt.pitch=tt['trim'+tt.speed];tt.running=false;refresh();
            };
            dev.resetLinear=()=>{Object.assign(tt,{disc:'lp',speed:33,trim33:0,trim45:0});dev.restoreLinear();};
            dev.disposeLinear=()=>{mechanism.operation++;mechanism.disposed=true;mechanism.cue=0;dev.state.playing=false;};
            dev.updateLinearMotion=(now,elapsed,reduced)=>{
                if(mechanism.disposed)return;
                if(!dev.powered&&mechanism.phase!=='idle'&&mechanism.phase!=='returning')dev.linearStop();
                if(mechanism.phase==='scanning'&&now>=mechanism.deadline){
                    if(tt.disc==='none'){mechanism.message='Sem disco · retorno automático';dev.linearStop();}
                    else {mechanism.phase='lowering';mechanism.deadline=now+430;refresh();}
                }else if(mechanism.phase==='lowering'&&now>=mechanism.deadline&&Math.abs(mechanism.arm-mechanism.target)<.8){
                    mechanism.phase='playing';
                    setSourcePlaying(dev,true,true).then(()=>{if(!dev.state.playing&&mechanism.phase==='playing'){mechanism.phase='raised';refresh();}});
                    refresh();
                }else if(mechanism.phase==='returning'&&now>=mechanism.deadline){
                    mechanism.phase='idle';mechanism.arm=mechanism.target=485;refresh();
                }
                if(mechanism.phase==='playing'){
                    const seconds=position();
                    if(seconds>=duration()&&!dev.state.repeat){dev.linearStop();}
                    else mechanism.target=leadIn()+(leadOut()-leadIn())*Math.min(1,(seconds%duration())/duration());
                }
                if(mechanism.cue){
                    mechanism.target=Math.max(leadOut(),Math.min(485,mechanism.target+mechanism.cue*65*elapsed));
                    const progress=Math.max(0,Math.min(1,(leadIn()-mechanism.target)/(leadIn()-leadOut())));
                    if(dev.audioBuffer)dev.fileOffset=progress*duration();else dev.demoOffset=progress*duration();
                }
                mechanism.arm=reduced?mechanism.target:mechanism.arm+(mechanism.target-mechanism.arm)*(1-Math.exp(-elapsed/(mechanism.cue?.06:.15)));
                el.querySelector('[data-linear-carriage]').setAttribute('transform',`translate(${(mechanism.arm-485).toFixed(3)} 0)`);
                el.querySelector('.linear-rim-pattern')?.setAttribute('patternTransform',`translate(${(reduced?0:(dev.platterAngle||0)/72).toFixed(3)} 0)`);
            };
            const bind=(selector,handler)=>el.querySelector(selector).addEventListener('click',event=>{event.stopPropagation();handler();scheduleProjectSave();});
            bind('[data-linear-start]',dev.linearStart);bind('[data-linear-stop]',dev.linearStop);bind('[data-linear-lift]',dev.linearLift);
            el.querySelectorAll('[data-linear-speed]').forEach(button=>button.addEventListener('click',()=>{dev.linearSetSpeed(button.dataset.linearSpeed);scheduleProjectSave();}));
            el.querySelectorAll('[data-linear-cue]').forEach(button=>{
                button.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();button.setPointerCapture(event.pointerId);dev.linearCue(Number(button.dataset.linearCue)*(event.shiftKey?3:1));});
                for(const name of ['pointerup','pointercancel','lostpointercapture','blur'])button.addEventListener(name,()=>dev.linearCue(0));
                button.addEventListener('keydown',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();if(!event.repeat)dev.linearCue(Number(button.dataset.linearCue));}});
                button.addEventListener('keyup',()=>dev.linearCue(0));
                // Also support activation without a pointer press (assistive technology).
                button.addEventListener('click',event=>{if(event.detail===0&&mechanism.cue===0){dev.linearCue(Number(button.dataset.linearCue));mechanism.target=Math.max(leadOut(),Math.min(485,mechanism.target+Number(button.dataset.linearCue)*12));dev.linearCue(0);}});
            });
            el.querySelectorAll('[data-linear-trim]').forEach(knob=>{
                const speed=Number(knob.dataset.linearTrim);
                Hardware.bindKnob(knob,{get:()=>tt['trim'+speed]*3,set:value=>dev.linearSetTrim(speed,value/3),min:-3,max:3,model:'recessed',width:18,height:18,format:value=>`${value>0?'+':''}${value.toFixed(1)}%`});
                knob.addEventListener('dblclick',()=>dev.linearSetTrim(speed,0));
            });
            refresh();
        }
        function linearTurntableInspector(dev){
            const tt=dev.state.tt;
            return `<section class="linear-inspector"><p>O carro move os dois braços em linha reta. O sensor detecta o diâmetro escolhido e só baixa a agulha quando há disco.</p>
                <label for="linear-disc">Disco sobre o prato</label><select id="linear-disc">${Object.entries(LINEAR_DISC_TYPES).map(([key,label])=>`<option value="${key}" ${tt.disc===key?'selected':''}>${label}</option>`).join('')}</select>
                <output id="linear-status" role="status">${dev.el.querySelector('[data-linear-status]').textContent}</output>
                <div class="linear-inspector-row"><button id="linear-start" class="tt-insp-btn">INICIAR</button><button id="linear-stop" class="tt-insp-btn">PARAR / RETORNAR</button></div>
                <button id="linear-lift" class="tt-insp-btn" aria-pressed="${dev.linear.phase==='raised'}">ELEVAR / BAIXAR AGULHA</button>
                <div class="linear-inspector-row">${[33,45].map(speed=>`<button id="linear-speed-${speed}" class="tt-insp-btn" aria-pressed="${tt.speed===speed}">${speed===33?'33⅓':'45'} RPM</button>`).join('')}</div>
                ${[33,45].map(speed=>`<label for="linear-trim-${speed}">Ajuste fino · ${speed===33?'33⅓':'45'} rpm <output id="linear-trim-value-${speed}">${(tt['trim'+speed]*3).toFixed(1)}%</output></label><input id="linear-trim-${speed}" type="range" min="-3" max="3" step="0.1" value="${tt['trim'+speed]*3}">`).join('')}
                <p>Mantenha as setas do aparelho pressionadas para mover o carro com a agulha elevada. Shift acelera o movimento. Use ELEVAR / BAIXAR para retomar a escuta. Ao fim do lado, o braço retorna e o motor para.</p>
                <label>Saída</label><div class="linear-inspector-row">${['line','phono'].map(mode=>`<button id="tt-insp-out-${mode}" class="tt-insp-btn ${tt.output===mode?'is-on':''}">${mode.toUpperCase()}</button>`).join('')}</div>
                <p>LINE inclui pré interno na simulação. PHONO exige entrada PHONO ou pré externo com RIAA.</p><button id="tt-insp-power" class="tt-insp-btn" aria-pressed="${dev.powered}">LIGAR / DESLIGAR</button></section>`;
        }
        function bindLinearInspector(dev){
            const q=id=>document.getElementById(id);
            q('linear-disc').addEventListener('change',event=>dev.linearSetDisc(event.target.value));
            q('linear-start').onclick=dev.linearStart;q('linear-stop').onclick=dev.linearStop;q('linear-lift').onclick=dev.linearLift;
            for(const speed of [33,45]){
                q('linear-speed-'+speed).onclick=()=>dev.linearSetSpeed(speed);
                q('linear-trim-'+speed).oninput=event=>dev.linearSetTrim(speed,Number(event.target.value)/3);
            }
            for(const mode of ['line','phono'])q('tt-insp-out-'+mode).onclick=()=>dev.ttSetOutput(mode);
            q('tt-insp-power').onclick=()=>toggleDevicePower(dev);
        }

        function setupTurntable(dev) {
            if(dev.type==='turntableLinear'){setupLinearTurntable(dev);return;}
            const tt = dev.state.tt = { running: false, pitch: 0, output: 'line' };
            const el = dev.el;
            const PITCH_RANGE = 0.08;
            dev.ttRate = () => 1 + tt.pitch * PITCH_RANGE;
            const stop = e => e.stopPropagation();
            const startBtn = el.querySelector('[data-tt="startstop"]');
            const outSw = el.querySelector('[data-tt="output"]');
            const pitchEl = el.querySelector('[data-tt="pitch"]');
            const record = el.querySelector('[data-tt="record"]');
            const pitchPct = () => Math.round(tt.pitch * PITCH_RANGE * 1000) / 10;
            const pitchText = () => `${pitchPct() > 0 ? '+' : ''}${pitchPct().toFixed(1)}%`;
            dev.refreshTurntable = () => {
                el.classList.toggle('tt-motor', dev.powered && tt.running);
                el.classList.toggle('tt-stopped', !tt.running);
                record.style.setProperty('--tt-period', (1.8 / (1 + tt.pitch * PITCH_RANGE)).toFixed(3) + 's');
                startBtn.setAttribute('aria-pressed', String(tt.running));
                outSw.setAttribute('aria-checked', String(tt.output === 'phono'));
                outSw.setAttribute('aria-label',`Saída do toca-discos: ${tt.output.toUpperCase()}. Use as setas para selecionar LINE ou PHONO.`);
                outSw.title=tt.output==='line'?'LINE · pré interno ligado, sinal de linha':'PHONO · cápsula MM, requer pré/RIAA externo';
                outSw.querySelectorAll('[data-m]').forEach(n => n.classList.toggle('is-on', n.dataset.m === tt.output));
                pitchEl.style.setProperty('--p', ((tt.pitch + 1) / 2).toFixed(3));
                pitchEl.setAttribute('aria-valuenow', pitchPct());
                pitchEl.title = `Pitch ${pitchText()} · arraste (duplo clique para zerar)`;
                // Painel de propriedades (se este aparelho estiver selecionado)
                if (state.selectedDeviceId === dev.id) {
                    const q = id => document.getElementById(id);
                    const pw = q('tt-insp-power');
                    if (pw) { pw.setAttribute('aria-pressed', String(dev.powered)); pw.classList.toggle('is-on', dev.powered); }
                    const run = q('tt-insp-run');
                    if (run) { run.setAttribute('aria-pressed', String(tt.running)); run.classList.toggle('is-on', tt.running); }
                    ['line', 'phono'].forEach(m => q('tt-insp-out-' + m)?.classList.toggle('is-on', tt.output === m));
                    const ps = q('tt-insp-pitch'); if (ps && Number(ps.value) !== pitchPct()) ps.value = pitchPct();
                    const pl = q('tt-insp-pitch-lbl'); if (pl) pl.textContent = pitchText();
                }
            };
            dev.ttToggleRun = () => {
                if (!dev.powered) return;
                setSourcePlaying(dev, !dev.state.playing);
            };
            dev.ttSetOutput = mode => {
                tt.output = mode === 'line' ? 'line' : 'phono';
                dev.setOutputMode(tt.output);
                revalidateSignalConnections();
                dev.refreshTurntable();
                updateCableFlows();
            };
            dev.ttSetPitch = v => {
                const restartFile = !!dev.filePlayback;
                if (restartFile) stopFilePlayback(dev);
                const n = Math.max(-1, Math.min(1, v));
                tt.pitch = Math.abs(n) < .06 ? 0 : n;
                if (restartFile) startFilePlayback(dev);
                dev.refreshTurntable();
            };
            startBtn.addEventListener('pointerdown', stop);
            startBtn.addEventListener('click', e => { stop(e); dev.ttToggleRun(); });
            outSw.addEventListener('pointerdown', stop);
            outSw.addEventListener('click', e => {stop(e);const mode=e.target.closest('[data-m]')?.dataset.m;dev.ttSetOutput(mode||(tt.output==='phono'?'line':'phono'));});
            outSw.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();dev.ttSetOutput(e.key==='ArrowLeft'||e.key==='Home'?'line':'phono');}});
            Hardware.bindLinear(pitchEl,{get:()=>tt.pitch,set:dev.ttSetPitch,min:-1,max:1,format:()=>pitchText(),pointerToValue:event=>{
                const track=pitchEl.querySelector('.at-pitch-track').getBoundingClientRect();
                return 1-2*Math.max(0,Math.min(1,(event.clientY-track.top)/Math.max(1,track.height)));
            }});
            pitchEl.addEventListener('dblclick',event=>{stop(event);dev.ttSetPitch(0);});
            dev.refreshTurntable();
        }

        function turntableInspectorHtml(dev) {
            if(dev.type==='turntableLinear')return linearTurntableInspector(dev);
            const tt = dev.state.tt;
            const pct = Math.round(tt.pitch * 8 * 10) / 10;
            return `
                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-gray-300">Power</span>
                        <button id="tt-insp-power" type="button" class="tt-insp-btn ${dev.powered ? 'is-on' : ''}" aria-pressed="${dev.powered}">LIGAR / DESLIGAR</button>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-gray-300">Start / Stop</span>
                        <button id="tt-insp-run" type="button" class="tt-insp-btn ${tt.running ? 'is-on' : ''}" aria-pressed="${tt.running}">INICIAR / PARAR</button>
                    </div>
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-gray-300">Saída</span>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="tt-insp-out-line" type="button" class="tt-insp-btn ${tt.output === 'line' ? 'is-on' : ''}">LINE</button>
                            <button id="tt-insp-out-phono" type="button" class="tt-insp-btn ${tt.output === 'phono' ? 'is-on' : ''}">PHONO</button>
                        </div>
                        <p class="text-xs text-gray-400">LINE: pré interno ligado, pronto para entrada de linha. PHONO: sinal da cápsula MM, que exige entrada PHONO com ganho e RIAA ou conversor externo.</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Pitch</span><span class="text-xs text-blue-400 font-mono" id="tt-insp-pitch-lbl">${pct > 0 ? '+' : ''}${pct.toFixed(1)}%</span></div>
                        <input id="tt-insp-pitch" aria-label="Pitch" type="range" min="-8" max="8" step="0.1" value="${pct}" class="w-full">
                    </div>
                </div>`;
        }

        function bindTurntableInspector(dev) {
            if(dev.type==='turntableLinear'){bindLinearInspector(dev);return;}
            const q = id => document.getElementById(id);
            q('tt-insp-power').addEventListener('click', () => toggleDevicePower(dev));
            q('tt-insp-run').addEventListener('click', () => dev.ttToggleRun());
            q('tt-insp-out-line').addEventListener('click', () => dev.ttSetOutput('line'));
            q('tt-insp-out-phono').addEventListener('click', () => dev.ttSetOutput('phono'));
            q('tt-insp-pitch').addEventListener('input', e => dev.ttSetPitch(Number(e.target.value) / 8));
        }

        function bindDeviceEvents(dev) {
            if(dev.type==='cdPlayer'){
                const tray=dev.el.querySelector('.cd-tray');
                dev.setTrayOpen=open=>{
                    dev.state.trayOpen=!!open;dev.el.classList.toggle('cd-tray-open',!!open);
                    tray.setAttribute('aria-expanded',String(!!open));tray.setAttribute('aria-label',open?'Fechar bandeja do CD':'Abrir bandeja do CD');tray.title=open?'Fechar bandeja':'Abrir bandeja';
                    if(open)setSourcePlaying(dev,false);
                };
                tray.addEventListener('pointerdown',event=>event.stopPropagation());
                tray.addEventListener('click',()=>{dev.setTrayOpen(!dev.state.trayOpen);scheduleProjectSave();});
            }

            if (SOURCE_TYPES.has(dev.type) && !TURNTABLE_TYPES.has(dev.type)) {
                const integrated = dev.el.querySelector('[data-source-play]');
                const button = integrated || document.createElement('button');
                if(!integrated){button.type = 'button'; button.className = 'source-play-button';button.dataset.sourcePlay = ''; button.textContent = '▶ / Ⅱ';}
                button.setAttribute('aria-pressed', 'false');
                button.addEventListener('pointerdown', event => event.stopPropagation());
                button.addEventListener('click', event => { event.stopPropagation(); if (dev.powered) setSourcePlaying(dev, !dev.state.playing); });
                if(!integrated) dev.el.appendChild(button);
            }
            if (TURNTABLE_TYPES.has(dev.type)) setupTurntable(dev);
            if (ACTIVE_SPK.has(dev.type) || SUB_TYPES.has(dev.type)) setupActiveSpeaker(dev);
            if(TURNTABLE_TYPES.has(dev.type)){
                const lidButton=document.createElement('button');lidButton.type='button';lidButton.className='tt-lid-button';lidButton.title='Abrir tampa';lidButton.setAttribute('aria-label','Abrir tampa');lidButton.setAttribute('aria-expanded','false');
                lidButton.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 17h18M4 14l3-9h14l-3 9Z"/></svg>';
                const deck=dev.el.querySelector('.at-deck');deck.appendChild(lidButton);deck.style.setProperty('--lid-depth',Math.round(deck.clientWidth*.84)+'px');
                dev.setLidOpen=open=>{dev.state.lidOpen=!!open;dev.el.classList.toggle('lid-open',!!open);lidButton.setAttribute('aria-expanded',String(!!open));lidButton.title=open?'Fechar tampa':'Abrir tampa';lidButton.setAttribute('aria-label',lidButton.title);};
                lidButton.addEventListener('click',()=>{dev.setLidOpen(!dev.state.lidOpen);playUiSound('click');scheduleProjectSave();});
            }
            if((ACTIVE_SPK.has(dev.type)||PASSIVE_SPK.has(dev.type))&&!['spkActiveRounded','spkActiveCompact','spkActiveBookshelf','spkPassiveCarbon','shelfWood','shelfCoax','shelfTop','floorCoax','floorFlax','floorDiamond'].includes(dev.type)&&!dev.el.querySelector('.speaker-grille')){
                const face=dev.el.querySelector('.sp-face'),woofer=face?.querySelector('.spk-woofer');
                if(face&&woofer){
                    const grille=document.createElement('button');grille.type='button';grille.className='speaker-grille fabric-grille';grille.setAttribute('aria-label','Remover grade da caixa');grille.title='Remover grade';
                    const restore=document.createElement('button');restore.type='button';restore.className='grille-restore';restore.textContent='RECOLOCAR GRADE';
                    face.append(grille,restore);
                    const fit=()=>{grille.style.height=Math.min(face.clientHeight-12,woofer.offsetTop+woofer.offsetHeight+8)-8+'px';};
                    fit();requestAnimationFrame(fit);
                }
            }
            const grille = dev.el.querySelector('.speaker-grille');
            if (grille) {
                if (grille.classList.contains('classic-box-grille') && !grille.children.length) {
                    grille.innerHTML = '<i aria-hidden="true"></i>'.repeat(96);
                }
                const toggleGrille = e => {
                    e.stopPropagation();
                    const removed = dev.el.classList.toggle('grille-off');
                    grille.setAttribute('aria-label', removed ? 'Recolocar grade da caixa' : 'Remover grade da caixa');scheduleProjectSave();
                };
                const restore = dev.el.querySelector('.grille-restore');
                if(restore){
                    const label=restore.title||'Recolocar grade';
                    restore.setAttribute('aria-label',label);
                    restore.innerHTML='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v16M12 4v16M16 4v16"/></svg>';
                }
                restore.addEventListener('pointerdown', e => e.stopPropagation());
                restore.addEventListener('click', toggleGrille);
                grille.addEventListener('pointerdown', e => e.stopPropagation());
                grille.addEventListener('click', toggleGrille);
                if (grille.tagName !== 'BUTTON') grille.addEventListener('keydown', e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGrille(e); }
                });
            }

            if (dev.type === 'receiver') {
                dev.state.balance = 0;
                const setReceiverControl = (control, value) => {
                    dev.state[control] = value;
                    const balance = dev.state.balance || 0;
                    dev.nodes.volR.gain.value = dev.state.volume * (balance < 0 ? 1 + balance : 1);
                    dev.nodes.volL.gain.value = dev.state.volume * (balance > 0 ? 1 - balance : 1);
                    dev.nodes.bassR.gain.value = dev.nodes.bassL.gain.value = dev.state.bass;
                    dev.nodes.trebleR.gain.value = dev.nodes.trebleL.gain.value = dev.state.treble;
                    const range = control === 'volume' ? [0,1] : control === 'balance' ? [-1,1] : [-15,15];
                    updateKnobAngle(dev, `[data-receiver-control="${control}"]`, value, ...range);
                    const slider = document.getElementById(control === 'volume' ? 'sl-vol' : `sl-${control}`);
                    if (state.selectedDeviceId === dev.id && slider) {
                        slider.value = value;
                        const label = document.getElementById(control === 'volume' ? 'lbl-vol' : `lbl-${control}`);
                        if (label) label.textContent = control === 'volume' ? `${Math.round(value*100)}%` : control === 'balance' ? (Math.abs(value)<.01 ? 'Centro' : `${value<0?'L':'R'} ${Math.round(Math.abs(value)*100)}%`) : `${value.toFixed(1)}dB`;
                    }
                };
                dev.el.querySelectorAll('[data-receiver-control]').forEach(knob => {
                    const control = knob.dataset.receiverControl;
                    const min = control === 'volume' ? 0 : control === 'balance' ? -1 : -15;
                    const max = control === 'volume' || control === 'balance' ? 1 : 15;
                    knob.setAttribute('role', 'slider');
                    knob.setAttribute('aria-valuemin', min);
                    knob.setAttribute('aria-valuemax', max);
                    Hardware.bindKnob(knob,{get:()=>dev.state[control]||0,set:value=>setReceiverControl(control,value),min,max});
                });
                updateKnobAngle(dev, '[data-receiver-control="volume"]', dev.state.volume, 0, 1);
                updateKnobAngle(dev, '[data-receiver-control="bass"]', dev.state.bass, -15, 15);
                updateKnobAngle(dev, '[data-receiver-control="treble"]', dev.state.treble, -15, 15);
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                updateKnobAngle(dev, '.amp-volume-knob', dev.state.volume, 0, 1);
            } else if (dev.type === 'headphoneAmp4') {
                dev.state.channelVolumes ||= [0.8, 0.8, 0.8, 0.8];
                dev.state.channelVolumes.forEach((value, index) => {
                    const knob = dev.el.querySelector(`[data-channel-knob="${index + 1}"]`);
                    if (knob) knob.setAttribute('aria-valuenow', String(Math.round(value * 100)));
                    updateKnobAngle(dev, `.amp4-channel:nth-child(${index + 1}) .amp4-knob`, value, 0, 1);
                });
            } else if (MIXER_TYPES.has(dev.type)) {
                dev.state.channelVolumes ||= [0.8, 0.8, 0.8];
                dev.state.channelVolumes.forEach((value, channel) => setMixerVolume(dev, channel, value));
            }

            // Power Button físico
            const pBtn = dev.el.querySelector('.power-btn');
            if (pBtn) {
                const panel = document.createElement('div');
                panel.className='power-control-panel power-rocker-housing';
                panel.setAttribute('aria-label','Controle de energia integrado ao equipamento');
                pBtn.setAttribute('role','switch');pBtn.setAttribute('aria-checked','true');
                pBtn.setAttribute('aria-label', 'Ligar ou desligar equipamento');
                pBtn.setAttribute('aria-pressed', 'true');
                pBtn.title = 'Ligado (Clique para desligar)';
                const oldButtonGroup = pBtn.parentElement;
                dev.el.querySelector('.device-header .device-led')?.remove();
                pBtn.remove();
                if (oldButtonGroup && !oldButtonGroup.matches('[data-power-slot]') && oldButtonGroup !== dev.el.querySelector('.device-header') && !oldButtonGroup.children.length) oldButtonGroup.remove();
                panel.appendChild(pBtn);
                const powerSlot = dev.el.querySelector('[data-power-slot]');
                if (powerSlot) {
                    panel.classList.add('power-panel-embedded');
                    powerSlot.appendChild(panel);
                } else {
                    const deviceBody = dev.el.querySelector('.device-header')?.nextElementSibling;
                    (deviceBody || dev.el).appendChild(panel);
                }
                pBtn.dataset.rockerAxis='vertical';
                pBtn.addEventListener('pointerdown', e => e.stopPropagation());
                pBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    toggleDevicePower(dev);
                });
            }

            const handle = dev.el.querySelector('.device-header');
            if (handle) {
                handle.setAttribute('role', 'tooltip');
                handle.setAttribute('aria-hidden', 'true');
                handle.addEventListener('dragstart', e => e.preventDefault());
                dev.el.addEventListener('pointerdown', e => {
                    if (e.button !== 0) return;
                    if (e.target.closest('button, input, select, textarea, .port, .speaker-grille, .grille-restore, [role="button"]')) return;
                    const touchHold = e.pointerType === 'touch';
                    // On touch screens a tap must remain available for wiring and selection.
                    // Movement starts only after a short deliberate press, so passing a cable
                    // across a device does not pick it up accidentally.
                    const directTouchMove=touchHold&&touchMovementMode;
                    let touchReady = !touchHold||directTouchMove;
                    let holdTimer = touchHold&&!directTouchMove ? setTimeout(() => { touchReady = true; }, 320) : null;
                    if (!touchHold) e.preventDefault();
                    window.getSelection()?.removeAllRanges();
                    if (e.shiftKey || e.metaKey || e.ctrlKey) toggleDeviceSelection(dev.id);
                    else if (state.selectedDeviceIds.has(dev.id)) selectDevice(dev.id, true);
                    else selectDevice(dev.id);

                    const startX = e.clientX;
                    const startY = e.clientY;
                    const movingDevices = expandFurnitureGroup([...state.selectedDeviceIds].map(id => state.devices[id]).filter(Boolean));
                    const initialPositions = movingDevices.map(item => ({
                        dev:item,
                        x:parseFloat(item.el.style.left) || 0,
                        y:parseFloat(item.el.style.top) || 0
                    }));
                    const dragBounds={left:Math.min(...initialPositions.map(p=>p.x)),top:Math.min(...initialPositions.map(p=>p.y)),right:Math.max(...initialPositions.map(p=>p.x+p.dev.el.offsetWidth)),bottom:Math.max(...initialPositions.map(p=>p.y+p.dev.el.offsetHeight))};
                    const origin = initialPositions[0] || { x:0, y:0 };
                    const baseY = Math.max(...initialPositions.map(position => position.y + position.dev.el.offsetHeight));
                    const ignored = new Set(movingDevices.map(item => item.id));
                    let isDragging = false, frame = 0, lastTime = 0, released = false;
                    let targets = initialPositions.map(p=>({...p}));
                    const discardPreviews=new Map();
                    let discardPreviewLayer=null;
                    const discardGrabOffsets=new Map(movingDevices.map(item=>{const rect=item.el.getBoundingClientRect();return [item.id,{dx:rect.left-startX,dy:rect.top-startY}];}));
                    function updateDiscardPreview(ev){
                        if(!isOverCatalog(ev)){clearDiscardPreview();return;}
                        document.body.classList.add('dragging-over-discard');
                        movingDevices.forEach(item=>{
                            let preview=discardPreviews.get(item.id);
                            if(!preview){
                                if(!discardPreviewLayer){
                                    discardPreviewLayer=document.createElement('div');discardPreviewLayer.className='equipment-preview-world';
                                    discardPreviewLayer.setAttribute('aria-hidden','true');discardPreviewLayer.inert=true;
                                    const worldStyle=getComputedStyle(world);
                                    for(const property of worldStyle)if(property.startsWith('--'))discardPreviewLayer.style.setProperty(property,worldStyle.getPropertyValue(property));
                                    document.body.appendChild(discardPreviewLayer);
                                }
                                const clone=item.el.cloneNode(true);
                                const originals=[item.el,...item.el.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
                                const previewIds=new Map();
                                copies.forEach((copy,i)=>{if(copy.id){const next='discard_'+copy.id;previewIds.set(copy.id,next);copy.id=next;}if(copy.tagName==='CANVAS')copy.getContext('2d')?.drawImage(originals[i],0,0);});
                                // Keep local SVG masks, gradients and clips pointing at the cloned definitions.
                                copies.forEach(copy=>{for(const attribute of [...copy.attributes]){
                                    let value=attribute.value;
                                    for(const [id,next]of previewIds){value=value.replaceAll('url(#'+id+')','url(#'+next+')');if(['href','xlink:href'].includes(attribute.name)&&value==='#'+id)value='#'+next;}
                                    if(value!==attribute.value)copy.setAttribute(attribute.name,value);
                                }});
                                clone.setAttribute('aria-hidden','true');clone.inert=true;
                                Object.assign(clone.style,{position:'fixed',margin:'0',width:item.el.offsetWidth+'px',height:item.el.offsetHeight+'px',transform:`scale(${view.zoom})`,transformOrigin:'0 0',zIndex:'10000',pointerEvents:'none',transition:'none'});
                                preview={clone,...discardGrabOffsets.get(item.id),visibility:item.el.style.visibility};
                                discardPreviews.set(item.id,preview);discardPreviewLayer.appendChild(clone);item.el.style.visibility='hidden';
                            }
                            preview.clone.style.left=ev.clientX+preview.dx+'px';preview.clone.style.top=ev.clientY+preview.dy+'px';
                        });
                    }
                    function clearDiscardPreview(){
                        document.body.classList.remove('dragging-over-discard');
                        discardPreviews.forEach((preview,id)=>{preview.clone.remove();const item=state.devices[id];if(item)item.el.style.visibility=preview.visibility;});discardPreviews.clear();
                        discardPreviewLayer?.remove();discardPreviewLayer=null;
                    }

                    movingDevices.forEach(item=>item.cancelPlacementMotion?.());
                    const cancel = () => { clearDiscardPreview();cancelAnimationFrame(frame); frame=0;movingDevices.forEach(item=>{item.el.classList.remove('equipment-dragging','history-settling');}); };
                    movingDevices.forEach(item=>item.cancelPlacementMotion=cancel);
                    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
                    const animate = now => {
                        frame=0;
                        if (!targets.every(p=>state.devices[p.dev.id])) return;
                        const dt=Math.min(32,now-(lastTime||now-16));lastTime=now;
                        const blend=!released||reducedMotion?1:1-Math.exp(-dt/55);
                        const intermediate=targets.map(p=>{
                            const x=parseFloat(p.dev.el.style.left)||0,y=parseFloat(p.dev.el.style.top)||0;
                            return {dev:p.dev,x:Math.abs(p.x-x)<.2?p.x:x+(p.x-x)*blend,y:Math.abs(p.y-y)<.2?p.y:y+(p.y-y)*blend};
                        });
                        const resolved=intermediate;
                        let moved=false;
                        resolved.forEach(p=>{
                            const x=parseFloat(p.dev.el.style.left)||0,y=parseFloat(p.dev.el.style.top)||0;
                            moved ||= Math.abs(x-p.x)+Math.abs(y-p.y)>.01;
                            p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;
                        });
                        if(moved) updateCables();
                        const pending=resolved.some((p,i)=>Math.abs(p.x-targets[i].x)+Math.abs(p.y-targets[i].y)>.1);
                        if(pending&&moved) frame=requestAnimationFrame(animate);
                        else if(released){
                            targets.forEach(p=>{p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;p.dev.el.classList.remove('equipment-dragging','history-settling');});
                            updateCables();
                        }
                    };
                    const aim = (ev,settle=false) => {
                        const rawX=(ev.clientX-startX)/view.zoom,rawY=(ev.clientY-startY)/view.zoom;
                        const sideInset=movingDevices.every(item=>item.type==='lightPoint')?0:sceneSideInset();
                        const dx=Math.max(sideInset-dragBounds.left,Math.min(settle?snapCoordinate(origin.x+rawX)-origin.x:rawX,world.offsetWidth-sideInset-dragBounds.right));
                        const bottomLimit=movingDevices.every(item=>item.type==='lightPoint')?world.offsetHeight:maxEquipmentBottom();
                        const dy=Math.max(-dragBounds.top,Math.min(settle?snapCoordinate(baseY+rawY)-baseY:rawY,bottomLimit-dragBounds.bottom));
                        targets=initialPositions.map(p=>{
                            const x=p.x+dx,y=p.y+dy;
                            const target=settle&&initialPositions.length===1?snapOnEquipment(p.dev,x,y):{x,y};
                            return {dev:p.dev,x:target.x,y:target.y};
                        });
                        if(settle)targets=settleEquipmentDrop(targets,ignored,initialPositions);
                        if(!frame){lastTime=0;frame=requestAnimationFrame(animate);}
                    };
                    const move = ev => {
                        if (touchHold && !touchReady) {
                            if (Math.hypot(ev.clientX-startX,ev.clientY-startY) > 8) {
                                clearTimeout(holdTimer); holdTimer = null; touchReady = false;
                            }
                            return;
                        }
                        ev.preventDefault();
                        isDragging = Math.hypot(ev.clientX-startX,ev.clientY-startY)>3||isDragging;
                        if(!isDragging)return;
                            movingDevices.forEach(item=>item.el.classList.add('equipment-dragging'));
                        aim(ev);updateDiscardPreview(ev);
                        if(compactLayout.matches){
                            if(ev.clientX<28)document.body.classList.add('mobile-catalog-open');
                            else if(ev.clientX>equipmentCatalog.getBoundingClientRect().right+32)document.body.classList.remove('mobile-catalog-open');
                        }
                        equipmentCatalog.classList.add('discard-ready');
                        discardZone.setAttribute('aria-hidden','false');
                        discardZone.querySelector('strong').textContent=isOverCatalog(ev)?'Solte para descartar':'Arraste aqui para descartar';
                        discardZone.querySelector('[data-discard-caption]').textContent=movingDevices.length>1?`Remover ${movingDevices.length} equipamentos e seus cabos.`:'Solte nesta área para remover o equipamento e seus cabos.';
                        equipmentCatalog.classList.toggle('return-drag-over',isOverCatalog(ev));
                    };
                    const up = ev => {
                        clearTimeout(holdTimer); holdTimer = null;
                        if(ev.cancelled){abortDrag();return;}
                        window.removeEventListener('pointermove',move);
                        window.removeEventListener('pointerup',up);
                        equipmentCatalog.classList.remove('return-drag-over','discard-ready');
                        discardZone.setAttribute('aria-hidden','true');
                        window.removeEventListener('blur',abortDrag);
                        window.removeEventListener('keydown',cancelWithEscape);
                        released=true;clearDiscardPreview();
                        if(isDragging)movingDevices.forEach(item=>item.el.classList.add('history-settling'));
                        if(isDragging&&isOverCatalog(ev)){
                            playUiSound('discard');showDiscardCloud(ev.clientX,ev.clientY);
                            cancel();initialPositions.forEach(p=>{if(state.devices[p.dev.id])deleteDevice(p.dev);});
                        }else if(isDragging){aim(ev,true);recordMovement(initialPositions,targets);playUiSound('drop');}else cancel();
                    };

                    const abortDrag=()=>{
                        clearTimeout(holdTimer); holdTimer = null;
                        window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);
                        window.removeEventListener('blur',abortDrag);window.removeEventListener('keydown',cancelWithEscape);
                        cancel();
                        initialPositions.forEach(p=>{if(state.devices[p.dev.id]){p.dev.el.style.left=`${p.x}px`;p.dev.el.style.top=`${p.y}px`;}});
                        equipmentCatalog.classList.remove('return-drag-over','discard-ready');discardZone.setAttribute('aria-hidden','true');
                        updateCables();
                    };
                    const cancelWithEscape=event=>{if(event.key==='Escape'){event.preventDefault();abortDrag();}};
                    window.addEventListener('blur',abortDrag);
                    window.addEventListener('keydown',cancelWithEscape);

                    window.addEventListener('pointermove', move);
                    window.addEventListener('pointerup', up);
                });
            }

            dev.el.querySelectorAll('.eq-slider').forEach(sl => {
                sl.addEventListener('pointerdown', e => e.stopPropagation());
                sl.addEventListener('input', () => {
                    const band = parseInt(sl.dataset.band, 10);
                    const val = parseFloat(sl.value);
                    dev.state.eq[band] = val;
                    sl.title = `${EQ_BANDS[dev.type][band]} Hz · ${val} dB`;
                    const lbl = dev.el.querySelector(`.lbl-band-${band}`);
                    if (lbl) lbl.textContent = `${val > 0 ? '+' : ''}${val}dB`;
                    applyEqGains(dev);
                    if (state.selectedDeviceId === dev.id) {
                        const insp = document.getElementById(`lbl-eq-${band}`);
                        if (insp) insp.innerText = `${val > 0 ? '+' : ''}${val}dB`;
                        const slider = document.getElementById(`sl-eq-${band}`);
                        if (slider) slider.value = val;
                    }
                });
            });

            dev.el.querySelectorAll('[data-mixer-channel]').forEach(slider => {
                const channel = Number(slider.dataset.mixerChannel);
                slider.addEventListener('pointerdown', e => e.stopPropagation());
                slider.addEventListener('input', () => {
                    setMixerVolume(dev, channel, Number(slider.value));
                    if (state.selectedDeviceId === dev.id) {
                        const inspectorSlider = document.getElementById(`sl-mixer-${channel}`);
                        if (inspectorSlider) inspectorSlider.value = slider.value;
                    }
                });
            });

            dev.el.querySelectorAll('[data-channel-knob]').forEach(knob=>{
                const channel=Number(knob.dataset.channelKnob)-1;
                Hardware.bindKnob(knob,{get:()=>dev.state.channelVolumes?.[channel]??.8,set:value=>setHeadphoneAmp4Volume(dev,channel,value)});
            });

            dev.el.querySelectorAll('[data-switch-source]').forEach(button => {
                button.addEventListener('pointerdown', e => e.stopPropagation());
                button.addEventListener('click', e => {
                    e.stopPropagation();
                    dev.selectedSource = button.dataset.switchSource;
                    ['A', 'B'].forEach(source => {
                        const active = source === dev.selectedSource;
                        dev.el.querySelector(`[data-switch-source="${source}"]`)?.classList.toggle('active', active);
                        dev.el.querySelector(`[data-switch-source="${source}"]`)?.setAttribute('aria-pressed', String(active));
                        ['R', 'L'].forEach(channel => {
                            const route = dev.nodes[`route${source}${channel}`];
                            if (route) route.gain.setTargetAtTime(active ? 1 : 0, state.audioCtx.currentTime, 0.015);
                        });
                    });
                    updateCableFlows();
                });
            });

            updatePortGuidance();

            const pairBtn = dev.el.querySelector('.btn-bt-pair');
            if (pairBtn) {
                pairBtn.addEventListener('pointerdown', e => e.stopPropagation());
                pairBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    handlePairClick(dev);
                });
            }
        }

        function showDiscardCloud(x,y){
            const cloud=document.createElement('div');cloud.className='discard-cloud';cloud.setAttribute('aria-hidden','true');
            cloud.style.left=x+'px';cloud.style.top=y+'px';document.body.appendChild(cloud);
            const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
            for(let i=0;i<(reduced?8:28);i++){
                const fine=i>=16;
                const puff=document.createElement('i'),angle=i/28*Math.PI*2+Math.random()*.5,distance=fine?38+Math.random()*35:16+Math.random()*35,size=fine?4+Math.random()*9:18+Math.random()*25;
                if(fine){puff.style.filter='blur(.4px)';puff.style.background='#d8d1c2';}
                puff.style.width=size+'px';puff.style.height=size+'px';cloud.appendChild(puff);
                puff.animate(reduced?[{opacity:.6},{opacity:0}]:[
                    {transform:'translate(-50%,-50%) scale(.25)',opacity:0},
                    {transform:`translate(calc(-50% + ${Math.cos(angle)*distance*.55}px),calc(-50% + ${Math.sin(angle)*distance*.55}px)) scale(1)`,opacity:.8,offset:.25},
                    {transform:`translate(calc(-50% + ${Math.cos(angle)*distance}px),calc(-50% + ${Math.sin(angle)*distance-14}px)) scale(1.35)`,opacity:0}
                ],{duration:reduced?140:360+Math.random()*150,delay:reduced?0:Math.random()*30,easing:'ease-out',fill:'both'});
            }
            setTimeout(()=>cloud.remove(),560);
        }
        function deleteDevice(dev) {
            if (!dev || !state.devices[dev.id]) return;
            dev.disposeLinear?.();
            dev.disposeStream?.();
            Hardware.dispose(dev);
            stopPowerOnRitual(dev);
            dev.cancelPlacementMotion?.();
            stopVinylNoise(dev);
            if(dev.syncRadio){stopReceiverRadioVoices(dev);dev.radioNoiseGain.disconnect();dev.radioNoiseFilter.disconnect();Object.values(dev.radioMusic).forEach(node=>node.disconnect());Object.values(dev.radioLine).forEach(node=>node.disconnect());dev.receiverInputNodes.forEach(node=>node.disconnect());}
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))stopSignalGenerator(dev);
            if(dev.type==='tapeDeck'){dev.state.playing=false;syncTapeHiss(dev);dev.tapeOscillators?.forEach(node=>{node.stop();node.disconnect();});dev.tapeNodes?.forEach(node=>node.disconnect());}
            stopFilePlayback(dev);
            dev.disposeMeters?.();
            dev.modelAudioNodes?.forEach(node=>node.disconnect());
            dev.voicingNodes?.forEach(node=>node.disconnect());
            dev.listeningGain?.disconnect();
            dev.auxSplitter?.disconnect();
            dev.audioBuffer = null;dev.mediaBlob=null;dev.mediaKey=null;

            if (state.pairingId === dev.id) clearPairing();
            if (dev.btPairedId) unpairDevice(dev);
            Object.values(state.devices).forEach(other => {
                if (other.btPairedId === dev.id) unpairDevice(other);
            });

            for (let idx = state.connections.length - 1; idx >= 0; idx--) {
                const connection = state.connections[idx];
                const outPort = document.getElementById(connection.outId);
                const inPort = document.getElementById(connection.inId);
                if (outPort?.closest('.device-node')?.id === dev.id || inPort?.closest('.device-node')?.id === dev.id) {
                    removeConnection(idx);
                }
            }

            if (dev.btLinkEl) dev.btLinkEl.remove();
            if (dev.powerGain) {
                try { dev.powerGain.disconnect(); } catch (e) {}
            }
            dev.el.remove();
            delete state.devices[dev.id];
            if(dev.type==='lightPoint')document.documentElement.classList.add('lighting-demo-enabled');
            updateMovementHistoryButtons();
            if (state.selectedDeviceIds.has(dev.id)) {
                const remaining = [...state.selectedDeviceIds].filter(id => id !== dev.id);
                if (state.selectedDeviceId === dev.id) setDeviceSelection(remaining);
                else {
                    state.selectedDeviceIds.delete(dev.id);
                    syncDeviceSelection();
                }
            }
            updateCables();
            updateBluetoothLinks();
            updateCableFlows();
        }

        function setPairingUi(dev, mode) {
            const indicator = dev.el.querySelector('.bt-indicator');
            const nameEl = dev.el.querySelector('.bt-device-name');
            const btn = dev.el.querySelector('.btn-bt-pair');
            if(btn){
                const label=mode==='search'?'Cancelar pareamento Bluetooth':mode==='linked'?'Desconectar Bluetooth':'Parear Bluetooth';
                btn.title=label;btn.setAttribute('aria-label',label);btn.dataset.pairing=mode;btn.setAttribute('aria-pressed',String(mode==='linked'));
            }
            if (mode === 'search') {
                dev.el.classList.add('pairing');
                if (indicator) {
                    indicator.classList.add('searching');
                    indicator.classList.remove('linked');
                }
                if (nameEl) nameEl.textContent = 'Procurando...';
            } else if (mode === 'linked') {
                dev.el.classList.remove('pairing');
                if (indicator) {
                    indicator.classList.remove('searching');
                    indicator.classList.add('linked');
                }
            } else {
                dev.el.classList.remove('pairing');
                if (indicator) {
                    indicator.classList.remove('searching', 'linked');
                }
                if (nameEl && BT_TX_TYPES.has(dev.type)) nameEl.textContent = 'Sem conexão';
            }
        }

        function handlePairClick(dev) {
            if(!BT_TX_TYPES.has(dev.type)&&!BT_HP_TYPES.has(dev.type))return;
            if (dev.btPairedId) {
                unpairDevice(dev);
                return;
            }
            if (state.pairingId === dev.id) {
                clearPairing();
                return;
            }
            if (state.pairingId) {
                const other = state.devices[state.pairingId];
                if (other && canPair(other, dev)) {
                    pairDevices(other, dev);
                    return;
                }
            }
            if (BT_TX_TYPES.has(dev.type) || BT_HP_TYPES.has(dev.type)) {
                clearPairing();
                state.pairingId = dev.id;
                setPairingUi(dev, 'search');
            }
        }

        function canPair(a, b) {
            if(a?.state.damage||b?.state.damage)return false;
            if (!a || !b || a.id === b.id) return false;
            return (BT_TX_TYPES.has(a.type) && BT_HP_TYPES.has(b.type)) || (BT_HP_TYPES.has(a.type) && BT_TX_TYPES.has(b.type));
        }

        function clearPairing() {
            if (state.pairingId && state.devices[state.pairingId] && !state.devices[state.pairingId].btPairedId) {
                setPairingUi(state.devices[state.pairingId], 'idle');
            }
            state.pairingId = null;
        }

        function pairDevices(a, b) {
            if(!canPair(a,b))return;
            const src = BT_TX_TYPES.has(a.type) ? a : b;
            const dest = HP_TYPES.has(a.type) ? a : b;
            unpairDevice(src);
            unpairDevice(dest);
            src.btPairedId = dest.id;
            dest.btPairedId = src.id;
            if (src.nodes.btOut && dest.nodes.in) {
                try { src.nodes.btOut.connect(dest.nodes.in); } catch (e) {}
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'bluetooth-link');
            svgLayer.appendChild(path);
            src.btLinkEl = path;
            dest.btLinkEl = path;
            const srcName = DEVICE_NAMES[src.type] || src.type;
            const destName = DEVICE_NAMES[dest.type] || dest.type;
            const srcLabel = src.el.querySelector('.bt-device-name');
            if (srcLabel) srcLabel.textContent = destName;
            setPairingUi(src, 'linked');
            setPairingUi(dest, 'linked');
            const destBtn = dest.el.querySelector('.btn-bt-pair');
            if (destBtn) destBtn.setAttribute('aria-pressed','true');
            clearPairing();
            src.el.classList.remove('pairing');
            dest.el.classList.remove('pairing');
            updateBluetoothLinks();
            updateCableFlows();
        }

        function unpairDevice(dev) {
            if (!dev || !dev.btPairedId) {
                setPairingUi(dev, 'idle');
                return;
            }
            const other = state.devices[dev.btPairedId];
            const src = BT_TX_TYPES.has(dev.type) ? dev : other;
            const dest = HP_TYPES.has(dev.type) ? dev : other;
            if (src && dest && src.nodes.btOut && dest.nodes.in) {
                try { src.nodes.btOut.disconnect(dest.nodes.in); } catch (e) {}
            }
            if (dev.btLinkEl) {
                dev.btLinkEl.remove();
            }
            [dev, other].forEach(d => {
                if (!d) return;
                d.btPairedId = null;
                d.btLinkEl = null;
                setPairingUi(d, 'idle');
            });
            updateCableFlows();
        }

        function updateBluetoothLinks() {
            Object.values(state.devices).forEach(dev => {
                if (!dev.btLinkEl || !dev.btPairedId || !BT_TX_TYPES.has(dev.type)) return;
                const dest = state.devices[dev.btPairedId];
                if (!dest) return;
                const r1 = dev.el.getBoundingClientRect();
                const r2 = dest.el.getBoundingClientRect();
                const p1 = screenToWorld(r1.left + r1.width / 2, r1.top + r1.height / 2);
                const p2 = screenToWorld(r2.left + r2.width / 2, r2.top + r2.height / 2);
                const midX = (p1.x + p2.x) / 2;
                const midY = Math.min(p1.y, p2.y) - 48;
                dev.btLinkEl.setAttribute('d', `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`);
            });
        }

        function hasRestorableSettings(dev) {
            if(controlAmpConfig(dev.type)||CUSTOM_POWER_AMPS[dev.type])return true;
            // Listening controls and live meters alone are not equipment settings.
            return SOURCE_TYPES.has(dev.type)||EQ_TYPES.has(dev.type)||MIXER_TYPES.has(dev.type)
                ||SELECTOR_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type)
                ||ACTIVE_SPK.has(dev.type)||SUB_TYPES.has(dev.type)||(!!FURNITURE_TYPES[dev.type]&&!FURNITURE_TYPES[dev.type].acoustic)||dev.type==='hpKubaDisco2'
                ||['preamp','receiver','powerAmp','powerStereo','powerVintage','headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(dev.type);
        }
        async function restoreDeviceSettings(dev) {
            if(!state.devices[dev.id]||!hasRestorableSettings(dev))return;
            if(state.selectedDeviceId!==dev.id)selectDevice(dev.id,true);
            const input=(id,value,eventType='input')=>{const element=document.getElementById(id);if(element){element.value=String(value);element.dispatchEvent(new Event(eventType,{bubbles:true}));}};
            let message='Configurações padrão restauradas.';
            if(dev.type==='integratedUtility')Object.assign(dev.state,{utilityLoudness:false,utilityMono:false});
            if(dev.type==='prePrecision')dev.state.precisionGain=0;
            if(dev.type==='preGlass')Object.assign(dev.state,{glassLowCut:false,glassHighCut:false,glassLoudness:false});
            if(dev.type==='hpKubaDisco2'){dev.state.kubaWood='tauari';updateKubaAppearance(dev);}
            if(dev.syncRadio){dev.state.radioOn=false;dev.state.receiverInput='line1';dev.state.radioFrequency=88;dev.syncRadio();}
            if(controlAmpConfig(dev.type)){Object.assign(dev.state,{integratedSource:0,volume:.8,bass:0,treble:0,balance:0,direct:false,preMuted:false,preMono:false,preInvert:false,subLevel:.8,subFrequency:80});dev.applyIntegrated();}
            if(dev.type==='preamp'){Object.assign(dev.state,{preSource:1,volume:.8,bass:0,treble:0});dev.applyPreamp();}
            if(SIGNAL_GENERATOR_TYPES.has(dev.type)){stopSignalGenerator(dev);Object.assign(dev.state,{signalMode:'sine',signalFrequency:1000,signalChannel:'both',signalLevel:2,sweepSeconds:20});configureSignalGenerator(dev);}
            if(dev.type==='tapeDeck'){Object.assign(dev.state,{tapeHiss:35,tapeWow:35,tapeVolume:.8});dev.applyTapeSettings();}
            if(isListeningDevice(dev)){dev.state.solo=false;dev.state.muted=false;}
            if(SOURCE_TYPES.has(dev.type)){
                await setSourcePlaying(dev,false);
                dev.state.repeat=false;dev.fileOffset=0;dev.demoOffset=0;
                if(TURNTABLE_TYPES.has(dev.type)){
                    dev.state.vinylNoiseLevel='medium';
                    dev.resetLinear?.();
                    dev.ttSetPitch(0);
                    const previousMode=dev.state.tt.output;
                    dev.state.tt.output='line';
                    const canResetOutput=state.connections.every(cable=>getPortCompatibility(document.getElementById(cable.outId),document.getElementById(cable.inId)).compatible);
                    dev.state.tt.output=previousMode;
                    if(canResetOutput)dev.ttSetOutput('line');
                    else message='Ajustes restaurados; saída PHONO mantida para preservar as conexões existentes.';
                }
            }
            dev.resetStream?.();
            if(dev.type==='receiver'){
                input('sl-balance',0);input('sl-vol',.8);input('sl-bass',0);input('sl-treble',0);dev.state.finish='vintage';dev.el.classList.remove('receiver-modern');
            }
            if(EQ_TYPES.has(dev.type)){
                GRAPHIC_EQ_FREQUENCIES.forEach((_,index)=>input(`sl-eq-${index}`,0));input('sl-eq-level',1);
                dev.el.querySelectorAll('[data-band]').forEach(slider=>{slider.title=`${GRAPHIC_EQ_FREQUENCIES[Number(slider.dataset.band)]} Hz · 0 dB`;});
            }
            if(MIXER_TYPES.has(dev.type))[0,1,2].forEach(channel=>setMixerVolume(dev,channel,.8));
            if(dev.type==='headphoneAmp4')[0,1,2,3].forEach(channel=>setHeadphoneAmp4Volume(dev,channel,.8));
            if(['headphoneAmp','headphoneAmpModern'].includes(dev.type))dev.setPhoneVolume(.8);
            if(CUSTOM_POWER_AMPS[dev.type]||['powerStereo','powerVintage'].includes(dev.type))['L','R'].forEach(channel=>dev.setChannelGain(channel,DEFAULT_POWER_GAIN));
            if(dev.type==='powerAmp')dev.setAmplifierVolume(1);
            if(ACTIVE_SPK.has(dev.type)||SUB_TYPES.has(dev.type))dev.setSpeakerVolume(.8);
            if(MATRIX_TYPES.has(dev.type)){dev.state.matrixInput=1;dev.state.matrixOutputs=[true,false,false,false];dev.updateMatrix();}
            if(SELECTOR_TYPES.has(dev.type))dev.el.querySelector('[data-switch-source="A"]').click();
            if(dev.type==='furnitureTable'){Object.assign(dev.state,{benchSurface:'wood',benchBackdrop:false,benchDecorations:[]});updateBenchAppearance(dev);}
            if(FURNITURE_TYPES[dev.type]){dev.state.material='black';dev.el.dataset.material='black';if(FURNITURE_TYPES[dev.type].back){dev.state.hasBack=true;dev.el.dataset.back='true';}}
            if(dev.meters)dev.meters.clipUntil=0;
            if(state.selectedDeviceId===dev.id){selectDevice(dev.id,true);document.getElementById('restore-settings-status').textContent=message;}
            updateCableFlows();
        }

        const movementUndo=[],movementRedo=[];
        const historyTools=document.createElement('div');historyTools.className='movement-history-tools';
        historyTools.innerHTML='<button type="button" id="undo-movement" aria-label="Desfazer movimento" data-tooltip="Desfazer movimento · Ctrl/Cmd+Z" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 14 4 9l5-5M4 9h9a7 7 0 0 1 0 14h-2"/></svg></button><button type="button" id="redo-movement" aria-label="Refazer movimento" data-tooltip="Refazer movimento · Ctrl/Cmd+Shift+Z" disabled><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 14 5-5-5-5m5 5h-9a7 7 0 0 0 0 14h2"/></svg></button>';
        document.querySelector('.canvas-tools').prepend(historyTools);
        const toolbarTooltip=document.createElement('div');toolbarTooltip.id='toolbar-tooltip';toolbarTooltip.setAttribute('role','tooltip');document.body.appendChild(toolbarTooltip);
        let toolbarTooltipTimer=0,toolbarTooltipTarget=null,toolbarTooltipPreviousDescription='',touchTooltipTarget=null;
        function hideToolbarTooltip(){clearTimeout(toolbarTooltipTimer);toolbarTooltip.classList.remove('is-visible');if(toolbarTooltipTarget){const ids=(toolbarTooltipTarget.getAttribute('aria-describedby')||'').split(/\s+/).filter(id=>id&&id!=='toolbar-tooltip');if(toolbarTooltipPreviousDescription)ids.unshift(...toolbarTooltipPreviousDescription.split(/\s+/).filter(Boolean));if(ids.length)toolbarTooltipTarget.setAttribute('aria-describedby',[...new Set(ids)].join(' '));else toolbarTooltipTarget.removeAttribute('aria-describedby');}toolbarTooltipTarget=null;toolbarTooltipPreviousDescription='';}
        function scheduleToolbarTooltip(target){if(!target?.dataset.tooltip)return;hideToolbarTooltip();toolbarTooltipTarget=target;toolbarTooltipPreviousDescription=target.getAttribute('aria-describedby')||'';toolbarTooltip.textContent=target.dataset.tooltip;toolbarTooltipTimer=setTimeout(()=>{if(!target.isConnected||!(target.matches(':hover')||document.activeElement===target||touchTooltipTarget===target))return;const rect=target.getBoundingClientRect();toolbarTooltip.classList.add('is-visible');const tip=toolbarTooltip.getBoundingClientRect(),gap=7,left=Math.max(8,Math.min(innerWidth-tip.width-8,rect.left+(rect.width-tip.width)/2)),top=rect.bottom+gap+tip.height<=innerHeight?rect.bottom+gap:Math.max(8,rect.top-gap-tip.height);toolbarTooltip.style.left=`${left}px`;toolbarTooltip.style.top=`${top}px`;const ids=new Set((target.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));ids.add('toolbar-tooltip');target.setAttribute('aria-describedby',[...ids].join(' '));},1000);}
        document.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target)scheduleToolbarTooltip(target);});
        document.addEventListener('pointerout',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target&&!(event.relatedTarget instanceof Node&&target.contains(event.relatedTarget)))hideToolbarTooltip();});
        document.addEventListener('pointerdown',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target&&event.pointerType==='touch'){touchTooltipTarget=target;scheduleToolbarTooltip(target);}});
        document.addEventListener('pointerup',event=>{if(event.pointerType==='touch'){touchTooltipTarget=null;hideToolbarTooltip();}});
        document.addEventListener('pointercancel',()=>{touchTooltipTarget=null;hideToolbarTooltip();});
        document.addEventListener('focusin',event=>{const target=event.target instanceof Element?event.target.closest('#app-topbar [data-tooltip]'):null;if(target)scheduleToolbarTooltip(target);});
        document.addEventListener('focusout',event=>{if(event.target instanceof Element&&event.target.matches('#app-topbar [data-tooltip]')&&!event.target.matches(':hover'))hideToolbarTooltip();});
        function updateMovementHistoryButtons(){
            const valid=entry=>entry.before.every(p=>state.devices[p.id]);
            for(const stack of [movementUndo,movementRedo])for(let i=stack.length-1;i>=0;i--)if(!valid(stack[i]))stack.splice(i,1);
            document.getElementById('undo-movement').disabled=!movementUndo.length;
            document.getElementById('redo-movement').disabled=!movementRedo.length;
        }
        function recordMovement(before,after){
            const positions=list=>list.map(p=>({id:p.dev.id,x:p.x,y:p.y}));
            if(!before.some((p,i)=>Math.abs(p.x-after[i].x)+Math.abs(p.y-after[i].y)>.1))return;
            movementUndo.push({before:positions(before),after:positions(after)});if(movementUndo.length>100)movementUndo.shift();
            movementRedo.length=0;updateMovementHistoryButtons();
        }
        function replayMovement(redo=false){
            if(isPatching||document.querySelector('.equipment-dragging:not(.history-settling)'))return;
            updateMovementHistoryButtons();const from=redo?movementRedo:movementUndo,to=redo?movementUndo:movementRedo,entry=from.pop();if(!entry)return;
            const positions=redo?entry.after:entry.before;
            positions.forEach(p=>{const dev=state.devices[p.id];dev.cancelPlacementMotion?.();dev.el.style.left=`${p.x}px`;dev.el.style.top=`${p.y}px`;});
            to.push(entry);updateCables();updateMovementHistoryButtons();scheduleProjectSave();
        }
        document.getElementById('undo-movement').onclick=()=>replayMovement(false);
        document.getElementById('redo-movement').onclick=()=>replayMovement(true);
        document.addEventListener('keydown',event=>{
            if(!(event.metaKey||event.ctrlKey)||event.altKey||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
            const key=event.key.toLowerCase(),redo=(key==='z'&&event.shiftKey)||(key==='y'&&event.ctrlKey&&!event.metaKey);
            if(key!=='z'&&!redo)return;event.preventDefault();replayMovement(redo);
        });

        function syncInspectorGainVisual(slider){
            const control=slider.closest('.gain-slider-control');if(!control)return;
            const min=Number(slider.min),max=Number(slider.max);
            const amount=Math.max(0,Math.min(1,(Number(slider.value)-min)/(max-min)));
            // The lower half is the normal blue range; energy builds above level five.
            const energy=Math.max(0,(amount-.5)*2);
            const color=[59,130,246].map((blue,i)=>Math.round(blue+([239,68,68][i]-blue)*energy));
            control.style.setProperty('--gain-position',String(amount));
            control.style.setProperty('--gain-energy',String(energy));
            control.style.setProperty('--gain-color',energy===0?'var(--accent)':`rgb(${color.join(' ')})`);
            control.dataset.idle=String(energy===0);
            const index=Math.round(amount*Hardware.physics.detents);
            slider.setAttribute('aria-valuetext',`${index} · ${Number(slider.value)}`);
            control.nextElementSibling?.querySelectorAll('span').forEach((tick,i)=>tick.classList.toggle('is-current',i===index));
        }
        function setupInspectorGainVisual(slider){
            const control=document.createElement('span');control.className='gain-slider-control';
            const visual=document.createElement('span');visual.className='gain-slider-visual';visual.setAttribute('aria-hidden','true');
            const particles=Array.from({length:24},(_,i)=>`<i style="--particle-x:${5+(i*37)%90}%;--particle-y:${16+(i*29)%68}%;--particle-size:${i%3===0?3:2}px;--particle-direction:${i%2?-1:1};--particle-threshold:${i<8?0:((i-8)/16*.7).toFixed(3)};--particle-delay:${-(i*.47).toFixed(2)}s;--particle-duration:${(2.8+(i%4)*.5).toFixed(1)}s"></i>`).join('');
            visual.innerHTML=`<span class="gain-slider-fill"><span class="gain-slider-particles">${particles}</span></span>`;
            slider.before(control);control.append(visual,slider);
            slider.addEventListener('input',()=>syncInspectorGainVisual(slider));
            slider.addEventListener('change',()=>syncInspectorGainVisual(slider));
            syncInspectorGainVisual(slider);
        }
        // Keep physical units for the audio graph while exposing fixed detents in the inspector.
        function setupInspectorDetents() {
            inspectorContent.querySelectorAll('input[type="range"]:not(#source-progress)').forEach(slider=>{
                if(slider.dataset.detents)return;slider.dataset.detents='true';Hardware.slider(slider);
                if(slider.matches('.gain-spark-slider'))setupInspectorGainVisual(slider);
                const min=Number(slider.min),max=Number(slider.max),intervals=Hardware.physics.detents;
                if(!Number.isFinite(min)||!Number.isFinite(max)||max<=min)return;
                const bipolar=min<0&&max>0,scale=document.createElement('div');scale.className='inspector-detent-scale';scale.setAttribute('aria-hidden','true');
                for(let i=0;i<=intervals;i++){const tick=document.createElement('span');tick.textContent=String(bipolar?i-5:i);scale.appendChild(tick);}
                (slider.closest('.gain-slider-control')||slider).insertAdjacentElement('afterend',scale);
                const update=()=>{const index=Math.max(0,Math.min(intervals,Math.round((Number(slider.value)-min)/(max-min)*intervals)));scale.querySelectorAll('span').forEach((tick,i)=>tick.classList.toggle('is-current',i===index));slider.setAttribute('aria-valuetext',`${bipolar?index-5:index} · ${Number(slider.value)}`);};
                slider.addEventListener('input',update);slider.addEventListener('change',update);update();
            });
        }

        function conciseEquipmentInspector(html){
            const template=document.createElement('template');template.innerHTML=html;
            template.content.querySelectorAll('p:not([id]):not([role="status"]):not([role="alert"])').forEach(text=>text.remove());
            template.content.querySelectorAll('div[class*="text-gray-400"],div[class*="text-gray-500"]').forEach(text=>{
                if(text.id||text.getAttribute('role')||text.querySelector('button,input,select,textarea,output,svg,canvas,[role]'))return;
                if(!text.children.length&&text.textContent.trim())text.remove();
            });
            [...template.content.querySelectorAll('div,section')].reverse().forEach(group=>{
                if(group.id||group.getAttribute('role')||group.classList.contains('sonic-trait-dots')||group.querySelector('[id],[role="status"],[role="alert"],button,input,select,textarea,output,svg,canvas')||group.textContent.trim())return;
                group.remove();
            });
            return template.innerHTML;
        }

        function selectDevice(id, preserveSelection = false) {
            if (id && state.selectedConnection) selectCable(null);
            disposeSpectrum();
            if (!preserveSelection) state.selectedDeviceIds = new Set(id ? [id] : []);
            state.selectedDeviceId = id;
            syncDeviceSelection();
            if(!id) {
                document.getElementById('inspector-title').textContent='Selecione um equipamento';
                inspectorEmpty.classList.remove('hidden'); inspectorContent.classList.add('hidden');
                return;
            }
            
            const dev = state.devices[id];
            if (!dev) {
                state.selectedDeviceId = null;
                document.getElementById('inspector-title').textContent='Selecione um equipamento';
                inspectorEmpty.classList.remove('hidden'); inspectorContent.classList.add('hidden');
                return;
            }
            
            inspectorEmpty.classList.add('hidden');
            inspectorContent.classList.remove('hidden');
            
            const names = DEVICE_NAMES;
            const equipmentName=names[dev.type]||dev.el.querySelector('.device-header > span')?.textContent.trim()||dev.type;
            document.getElementById('inspector-title').textContent=equipmentName;

            const hasPowerControl = !!dev.el.querySelector('.power-btn');
            let html=dev.state.damage?'<div class="equipment-damage-notice" role="status">DANIFICADO · Sobrecarga elétrica simulada. Substitua o equipamento por outro do catálogo.</div>':'';

            html+=amplificationInspectorHtml(dev);
                
            if (hasPowerControl && !TURNTABLE_TYPES.has(dev.type)) {
                html += `<div class="flex flex-col gap-2"><span class="text-sm text-gray-300">Power</span><button id="inspector-power-toggle" type="button" aria-label="Ligar ou desligar equipamento" aria-pressed="${dev.powered}" class="tt-insp-btn w-full ${dev.powered ? 'is-on' : ''}">LIGAR / DESLIGAR</button></div>`;
            }

            if(dev.type==='streamIntegrated'){html+=streamIntegratedInspector(dev);
            }else if(SIGNAL_GENERATOR_TYPES.has(dev.type)){html+=signalInspectorHtml(dev);
            }else if(EXTRA_AUDIO_TYPES.has(dev.type)){html+=extraInspectorHtml(dev);
            } else if(controlAmpConfig(dev.type)){
                html+=integratedInspectorHtml(dev);
                if(CUSTOM_PREAMPS[dev.type])html+=customPreampInspectorHtml(dev);
            } else if (dev.type === 'receiver') {
                html += `
                    <div class="flex flex-col gap-4">
                        <p class="text-xs text-gray-400">LINE OUT e SPEAKERS preservam L/R. Conecte cada caixa à saída do mesmo lado.</p>
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume</span><span class="text-xs text-blue-400 font-mono" id="lbl-vol">${Math.round(dev.state.volume*100)}%</span></div>
                        <input type="range" id="sl-vol" min="0" max="1" step="0.01" value="${dev.state.volume}">
                        
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Graves (Bass)</span><span class="text-xs text-blue-400 font-mono" id="lbl-bass">${dev.state.bass}dB</span></div>
                        <input type="range" id="sl-bass" min="-15" max="15" step="1" value="${dev.state.bass}">
                        
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Agudos (Treble)</span><span class="text-xs text-blue-400 font-mono" id="lbl-treble">${dev.state.treble}dB</span></div>
                        <input type="range" id="sl-treble" min="-15" max="15" step="1" value="${dev.state.treble}">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Balanço L/R</span><span id="lbl-balance" class="text-xs text-blue-400">${Math.abs(dev.state.balance || 0)<.01 ? 'Centro' : `${dev.state.balance<0?'L':'R'} ${Math.round(Math.abs(dev.state.balance)*100)}%`}</span></div>
                        <input type="range" id="sl-balance" min="-1" max="1" step="0.01" value="${dev.state.balance || 0}">
                    </div>
                `;
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                html += `
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">Volume dos Fones</span><span class="text-xs text-amber-400 font-mono" id="lbl-amp-vol">${Math.round(dev.state.volume*100)}%</span></div>
                        <input type="range" id="sl-amp-vol" min="0" max="1" step="0.01" value="${dev.state.volume}">
                    </div>
                `;
            } else if (dev.type === 'headphoneAmp4') {
                const channelVolumes = dev.state.channelVolumes || [0.8, 0.8, 0.8, 0.8];
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Quatro saídas P10 com volume independente por canal.</p>`;
                channelVolumes.forEach((value, index) => {
                    html += `<div><div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-300">Canal ${index + 1}</span><span class="text-xs text-red-300 font-mono" id="lbl-amp4-${index + 1}">${Math.round(value * 100)}%</span></div><input type="range" id="sl-amp4-${index + 1}" min="0" max="1" step="0.01" value="${value}"></div>`;
                });
                html += `</div>`;
            } else if (MATRIX_TYPES.has(dev.type)) {
                html += `<p class="text-sm text-gray-400">Selecione uma das três entradas nas chaves do painel. Os quatro botões de saída são independentes: é possível enviar a fonte para várias saídas ou desligar todas. Todas as conexões são RCA estéreo R/L.</p>`;
            } else if (RCA_SWITCH_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Distribui uma entrada RCA estéreo para uma das duas saídas. Use A ou B no aparelho para escolher qual equipamento recebe o sinal.</p>`;
            } else if (MIXER_TYPES.has(dev.type)) {
                const levels = dev.state.channelVolumes || [0.8, 0.8, 0.8];
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Mistura três fontes RCA estéreo. Cada canal tem volume independente; a saída principal mantém os lados R/L.</p>`;
                levels.forEach((value, channel) => { html += `<div><div class="flex items-center justify-between mb-1"><span class="text-sm text-gray-300">Canal ${channel + 1}</span><span class="text-xs text-sky-300 font-mono" id="lbl-mixer-${channel}">${Math.round(value * 100)}%</span></div><input type="range" id="sl-mixer-${channel}" min="0" max="1" step="0.01" value="${value}"></div>`; });
                html += `</div>`;
            } else if (SPEAKER_SWITCH_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Recebe um par amplificado de fio de caixa e o direciona somente ao par passivo A ou B escolhido no painel frontal. Conecte-o às saídas SPEAKER do amplificador de potência.</p>`;
            } else if (PASSIVE_SUB_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Subwoofer passivo: conecte os terminais SPEAKER IN diretamente às saídas de potência do amplificador. Não usa entrada LFE RCA nem tem amplificação própria.</p>`;
            } else if (CROSSOVER_TYPES.has(dev.type)) {
                html += `<p class="text-xs text-gray-400">Divide o sinal RCA estéreo em três faixas: graves abaixo de 250 Hz, médios entre 250 Hz e 2,5 kHz e agudos acima de 2,5 kHz. Cada saída preserva R/L.</p>`;
            } else if (EQ_TYPES.has(dev.type)) {
                const labels = GRAPHIC_EQ_FREQUENCIES.map(() => '');
                const freqs = EQ_BANDS[dev.type] || EQ_BANDS.eqStudio;
                html += `<div class="flex flex-col gap-3"><p class="text-xs text-gray-400">Equalizador gráfico de 7 bandas (−12 a +12 dB)</p><label>Nível de saída<input id="sl-eq-level" type="range" min="0" max="1" step="0.01" value="${dev.state.eqLevel}"></label>`;
                labels.forEach((name, i) => {
                    const v = dev.state.eq[i] || 0;
                    html += `
                        <div class="flex items-center justify-between"><span class="text-sm text-gray-300">${name} <span class="text-[10px] text-gray-500">${freqs[i] >= 1000 ? (freqs[i]/1000)+'kHz' : freqs[i]+'Hz'}</span></span><span class="text-xs text-blue-400 font-mono" id="lbl-eq-${i}">${v > 0 ? '+' : ''}${v}dB</span></div>
                        <input type="range" id="sl-eq-${i}" min="-12" max="12" step="0.5" value="${v}">
                    `;
                });
                html += `</div>`;
            } else if (BT_TX_TYPES.has(dev.type)) {
                const paired = dev.btPairedId ? state.devices[dev.btPairedId] : null;
                html += `<div class="text-sm text-gray-400 mt-2">Transmissor Bluetooth: recebe áudio pela entrada RCA estéreo e envia sem fio para fones pareados. ${paired ? ('Conectado a ' + (DEVICE_NAMES[paired.type] || paired.type) + '.') : 'Clique em Parear aqui e no fone.'}</div>`;
            } else if (BT_RX_TYPES.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Receptor Bluetooth: recebe áudio sem fio de um celular ou computador e converte para saída analógica RCA estéreo. Não transmite para fones Bluetooth.</div>`;
            } else if (HP_TYPES.has(dev.type)) {
                const paired = dev.btPairedId ? state.devices[dev.btPairedId] : null;
                if(REFERENCE_HEADPHONES[dev.type])html+=`<p class="text-xs text-gray-400">${REFERENCE_HEADPHONES[dev.type].enclosure||'Aberto'} · ${REFERENCE_HEADPHONES[dev.type].ohms} Ω nominais · conexão estéreo simplificada para P2 no simulador.</p>`;
                if(dev.type==='hpKubaDisco2')html+=`<div class="kuba-finish-control"><label for="kuba-wood">Madeira do arco</label><select id="kuba-wood">${Object.entries(KUBA_WOOD_FINISHES).map(([key,name])=>`<option value="${key}" ${dev.state.kubaWood===key?'selected':''}>${name}</option>`).join('')}</select><p>Arco clássico laminado, regulagens laterais, conchas com anéis concêntricos e almofadas XL. O acabamento altera a aparência do arco.</p></div>`;
                html += `<div class="text-sm text-gray-400 mt-2">${dev.type==='hpMax'?'Conexão somente por Bluetooth. ':dev.type==='hpKubaDisco2'?'Entrada P2 estéreo na ponta do cabo, abaixo do divisor em Y. ':'Entrada P2 estéreo na parte inferior da concha esquerda. '}${BT_HP_TYPES.has(dev.type)?`Bluetooth: ${paired ? ('pareado com ' + (DEVICE_NAMES[paired.type] || paired.type)) : 'sem conexão. Clique em Parear no transmissor e neste fone.'}`:'Conecte a uma saída de fones com cabo P2.'}</div>`;
            } else if (TURNTABLE_TYPES.has(dev.type)) {
                html += turntableInspectorHtml(dev);
                html+=`<section class="flex flex-col gap-3 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Ruído do vinil</span><div class="noise-level-buttons" role="group" aria-label="Nível de ruído do vinil">${Object.entries(VINYL_NOISE_LEVELS).map(([key,level])=>{const selected=(dev.state.vinylNoiseLevel||'medium')===key;return `<button type="button" data-vinyl-noise="${key}" class="tt-insp-btn noise-level-button ${selected?'is-on':''}" aria-label="${level.label}" title="${level.label}" aria-pressed="${selected}">${noiseLevelIcon(key)}</button>`}).join('')}</div></section>`;
            } else if(dev.type==='pendantLamp'){
                html+='<p class="text-sm text-gray-400">Luminária de filamento com luz amarela. Arraste pela cúpula para posicionar; o cabo acompanha a distância até o teto.</p>';
            } else if(FURNITURE_TYPES[dev.type]) {
                const config=FURNITURE_TYPES[dev.type];
                if(config.acoustic)html+=`<p class="text-sm text-gray-300">${config.description}</p><p class="text-xs text-gray-400">${config.width} × ${config.height} px · Arraste o painel pela espuma para posicioná-lo atrás dos equipamentos.</p>`;
                else html += `<div class="flex flex-col gap-3"><label class="text-sm text-gray-300" for="furniture-material">Material</label><select id="furniture-material" class="w-full p-2 rounded bg-gray-800 text-gray-200 border border-gray-700">${Object.entries(FURNITURE_MATERIALS).map(([key,name])=>`<option value="${key}" ${dev.state.material===key?'selected':''}>${name}</option>`).join('')}</select><p class="text-xs text-gray-400">${config.description}</p><p class="text-xs text-gray-400">Aproxime a base do equipamento de uma prateleira para apoiá-lo. Arraste o móvel pelas partes sólidas.${config.rack?' Os equipamentos apoiados nas prateleiras e empilhados acompanham o rack.':''}</p></div>`;
                if(dev.type==='furnitureTable')html+=`<fieldset class="bench-options"><legend>Ambiente da bancada</legend><label for="bench-surface">Superfície</label><select id="bench-surface">${Object.entries(BENCH_SURFACES).map(([key,label])=>`<option value="${key}" ${dev.state.benchSurface===key?'selected':''}>${label}</option>`).join('')}</select><label><input type="checkbox" id="bench-backdrop" ${dev.state.benchBackdrop===true?'checked':''}> Painel acústico</label><span>Objetos decorativos</span>${Object.entries(BENCH_DECORATIONS).map(([key,label])=>`<label><input type="checkbox" data-bench-decoration="${key}" ${dev.state.benchDecorations?.includes(key)?'checked':''}> ${label}</label>`).join('')}</fieldset>`;
                if(config.back)html+=`<div class="flex flex-col gap-2"><span class="text-sm text-gray-300">Fundo do móvel</span><button id="furniture-back" class="tt-insp-btn ${dev.state.hasBack?'is-on':''}" aria-pressed="${!!dev.state.hasBack}">FUNDO DO MÓVEL</button><p class="text-xs text-gray-400">O fundo acompanha o material do móvel, com acabamento escurecido pela sombra.</p></div>`;
            } else if (INTERFACE_DEVICES[dev.type]) {
                html += `<p class="text-sm text-gray-400">${INTERFACE_DEVICES[dev.type].description}</p>`;
            } else if (dev.type === 'cdPlayer') {
                html += `<div class="text-sm text-gray-400 mt-2">Fonte digital estéreo. Conecte as saídas RCA R/L a um pré, receiver ou monitor ativo do mesmo lado.</div>`;
            } else if (['powerStereo','powerVintage'].includes(dev.type)||CUSTOM_POWER_AMPS[dev.type]) {
                html += ['L','R'].map(ch=>`<label class="block text-sm mt-4">Ganho ${ch==='L'?'A · esquerdo':'B · direito'}<input id="power-gain-${ch}" class="gain-spark-slider" type="range" min="0" max="1" step=".01" aria-label="Ganho ${ch==='L'?'A esquerdo':'B direito'}" value="${dev.state.channelGain[ch]}"></label>`).join('');
            } else if (dev.type === 'powerAmp') {
                html += `<label class="block text-sm text-gray-400 mt-4">Volume</label><input id="sl-poweramp-volume" aria-label="Volume do amplificador" type="range" min="0" max="1" step="0.01" value="${dev.state.volume ?? 1}" class="w-full">`;
                html += `<div class="text-sm text-gray-400 mt-2">Receiver moderno. Recebe RCA R/L e entrega saídas SPEAKER R/L para caixas passivas.</div>`;
            } else if (SUB_TYPES.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Entrada SUB/LFE mono em nível de linha. Conecte preferencialmente a saída SUB do receiver; uma saída de linha comum também é aceita, com filtragem de graves nesta caixa.</div>`;
                html += speakerInspectorHtml(dev);
            } else if (PASSIVE_SPK.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Conecte a entrada SPEAKER IN a qualquer saída para caixas usando fio de caixa. O canal estéreo é definido pela saída do receiver ou amplificador.</div>`;
            } else if (dev.type==='spkActiveCompact') {
                html+='<p class="text-sm text-gray-400">Caixa ativa compacta: conecte sinal de linha às entradas RCA L/R ou AUX P2. Os canais estéreo são preservados; a amplificação é interna.</p>';
                html+=speakerInspectorHtml(dev);
            } else if (ACTIVE_SPK.has(dev.type)) {
                html += `<div class="text-sm text-gray-400 mt-2">Conecte a entrada de linha a uma saída LINE OUT com conector compatível. O canal do monitor é determinado pelo lado da saída usada (L ou R); dois monitores ligados a saídas diferentes formam o par estéreo.</div>`;
                html += speakerInspectorHtml(dev);
            } else {
                html += `<div class="text-sm text-gray-500 italic mt-4">Sem propriedades ajustáveis para este modelo.</div>`;
            }

            if (SOURCE_TYPES.has(dev.type) && !TURNTABLE_TYPES.has(dev.type)) html += `<div class="flex flex-col gap-2"><span class="text-sm text-gray-300">Reprodução</span><button id="source-inspector-play" type="button" class="tt-insp-btn ${dev.state.playing ? 'is-on' : ''}" aria-pressed="${!!dev.state.playing}">REPRODUZIR / PAUSAR</button></div>`;
            if (SOURCE_TYPES.has(dev.type)&&!SIGNAL_GENERATOR_TYPES.has(dev.type)) html += `<div class="flex flex-col gap-2 border-t border-gray-700 pt-4"><span class="text-sm text-gray-300">Música própria</span><button id="source-load-audio" type="button" class="tt-insp-btn">CARREGAR ÁUDIO</button><input id="source-audio-file" type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" hidden><p id="source-file-name" class="text-xs text-gray-300 break-words"></p><p id="source-file-message" class="text-xs text-gray-400"></p><button id="source-remove-audio" type="button" class="tt-insp-btn" ${dev.audioBuffer ? '' : 'hidden'}>REMOVER ARQUIVO</button></div>`;
            if (dev.listeningProfile) html += `<section class="sonic-signature-panel"><h3>Assinatura sonora</h3>${listeningCurveHtml(dev)}</section>`;
            if(RADIO_RECEIVERS.has(dev.type))html+=radioInspectorHtml(dev);
            if (dev.audioBuffer&&!RADIO_RECEIVERS.has(dev.type)) html += transportInspectorHtml(dev);
            if (EQ_TYPES.has(dev.type) || CROSSOVER_TYPES.has(dev.type) || BENCH_METER_TYPES.has(dev.type)) html += spectrumInspectorHtml(dev);
            if(hasRestorableSettings(dev))html += '<div class="flex flex-col gap-2 border-t border-gray-700 pt-4"><button id="restore-device-settings" type="button" class="tt-insp-btn w-full">RESTAURAR CONFIGURAÇÕES</button><p id="restore-settings-status" role="status" class="text-xs text-gray-400"></p></div>';
            html+=portSignalsInspectorHtml(dev);
            html+=listeningInspectorHtml(dev);
            if(dev.el.querySelector('.speaker-grille'))html+=`<button type="button" class="tt-insp-btn" id="inspector-grille" aria-pressed="${dev.el.classList.contains('grille-off')}">GRADE</button>`;
            Hardware.sync(dev);
            inspectorContent.innerHTML = conciseEquipmentInspector(html);
            Hardware.inspector(inspectorContent);
            document.getElementById('inspector-grille')?.addEventListener('click',event=>{dev.el.querySelector(dev.el.classList.contains('grille-off')?'.grille-restore':'.speaker-grille').click();event.currentTarget.setAttribute('aria-pressed',String(dev.el.classList.contains('grille-off')));event.currentTarget.classList.toggle('is-on',dev.el.classList.contains('grille-off'));});
            queueMicrotask(setupInspectorDetents);
            bindListeningInspector(dev);
            bindIntegratedInspector(dev);
            bindCustomPreampInspector(dev);
            bindExtraInspector(dev);
            inspectorContent.querySelectorAll('[data-vinyl-noise]').forEach(button=>button.addEventListener('click',()=>{
                dev.state.vinylNoiseLevel=button.dataset.vinylNoise;
                dev.vinylNoise?.gain.gain.setTargetAtTime(VINYL_NOISE_LEVELS[dev.state.vinylNoiseLevel].gain,state.audioCtx.currentTime,.04);
                inspectorContent.querySelectorAll('[data-vinyl-noise]').forEach(item=>{const selected=item===button;item.classList.toggle('is-on',selected);item.setAttribute('aria-pressed',String(selected));});
            }));
            document.getElementById('restore-device-settings')?.addEventListener('click',async event=>{
                event.currentTarget.disabled=true;
                try{await restoreDeviceSettings(dev);}finally{const button=document.getElementById('restore-device-settings');if(button)button.disabled=false;}
            });
            document.getElementById('bench-surface')?.addEventListener('change',event=>{dev.state.benchSurface=event.target.value;updateBenchAppearance(dev);});
            document.getElementById('kuba-wood')?.addEventListener('change',event=>{dev.state.kubaWood=event.target.value;updateKubaAppearance(dev);});
            document.getElementById('bench-backdrop')?.addEventListener('change',event=>{dev.state.benchBackdrop=event.target.checked;updateBenchAppearance(dev);});
            document.querySelectorAll('[data-bench-decoration]').forEach(input=>input.addEventListener('change',()=>{
                dev.state.benchDecorations=[...document.querySelectorAll('[data-bench-decoration]:checked')].map(item=>item.dataset.benchDecoration);updateBenchAppearance(dev);
            }));
            if(FURNITURE_TYPES[dev.type])document.getElementById('furniture-material')?.addEventListener('change',event=>{dev.state.material=event.target.value;dev.el.dataset.material=event.target.value;});
            document.getElementById('furniture-back')?.addEventListener('click',event=>{
                dev.state.hasBack=!dev.state.hasBack;dev.el.dataset.back=String(dev.state.hasBack);
                event.currentTarget.classList.toggle('is-on',dev.state.hasBack);
                event.currentTarget.setAttribute('aria-pressed',String(dev.state.hasBack));
            });
            if (EQ_TYPES.has(dev.type) || CROSSOVER_TYPES.has(dev.type) || BENCH_METER_TYPES.has(dev.type)) {
                setupSpectrum(dev);
                document.getElementById('spectrum-channel').addEventListener('change',()=>setupSpectrum(dev));
                document.getElementById('spectrum-band')?.addEventListener('change',()=>setupSpectrum(dev));
            }
            if(RADIO_RECEIVERS.has(dev.type))bindRadioInspector(dev);
            if (dev.audioBuffer&&!RADIO_RECEIVERS.has(dev.type)) bindTransportInspector(dev);
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))bindSignalInspector(dev);
            if (SOURCE_TYPES.has(dev.type)&&!SIGNAL_GENERATOR_TYPES.has(dev.type)) {
                document.getElementById('source-file-name').textContent = dev.fileName || 'Nenhum arquivo carregado · som de demonstração';
                document.getElementById('source-file-message').textContent = dev.fileMessage || (dev.audioBuffer ? `Duração: ${Math.floor(dev.audioBuffer.duration / 60)}:${String(Math.floor(dev.audioBuffer.duration % 60)).padStart(2,'0')}` : 'MP3, WAV e outros formatos de áudio compatíveis com o navegador.');
                const input = document.getElementById('source-audio-file');
                document.getElementById('source-load-audio').addEventListener('click', () => input.click());
                input.addEventListener('change', () => { if (input.files[0]) loadSourceAudio(dev, input.files[0]); });
                document.getElementById('source-remove-audio').addEventListener('click', async () => {
                    ++dev.fileLoadToken;
                    await setSourcePlaying(dev, false);
                    dev.audioBuffer = null; dev.mediaBlob=null;dev.mediaKey=null; dev.fileName = ''; dev.trackTitle=''; dev.demoOffset=0; dev.fileMessage = ''; dev.fileOffset = 0;dev.setStreamMetadata?.(null);
                    refreshCdDisplay(dev);
                    selectDevice(dev.id, true);
                });
            }
            document.getElementById('source-inspector-play')?.addEventListener('click', () => { if (dev.powered) setSourcePlaying(dev, !dev.state.playing); });
            if(dev.type==='streamIntegrated')bindStreamInspector(dev);
            document.getElementById('inspector-power-toggle')?.addEventListener('click', () => toggleDevicePower(dev));
            if (TURNTABLE_TYPES.has(dev.type)) bindTurntableInspector(dev);
            if (ACTIVE_SPK.has(dev.type) || SUB_TYPES.has(dev.type)) document.getElementById('sp-insp-vol').addEventListener('input', e => dev.setSpeakerVolume(Number(e.target.value) / 100));
            if (['powerStereo','powerVintage'].includes(dev.type)||CUSTOM_POWER_AMPS[dev.type]) ['L','R'].forEach(ch=>document.getElementById('power-gain-'+ch).addEventListener('input',e=>dev.setChannelGain(ch,e.target.value)));
            if (dev.type === 'powerAmp') document.getElementById('sl-poweramp-volume').addEventListener('input', e => dev.setAmplifierVolume(Number(e.target.value)));

            if (dev.type === 'receiver') {
                document.getElementById('sl-balance').addEventListener('input', e => {
                    dev.state.balance = parseFloat(e.target.value);
                    dev.nodes.volR.gain.value = dev.state.volume * (dev.state.balance < 0 ? 1 + dev.state.balance : 1);
                    dev.nodes.volL.gain.value = dev.state.volume * (dev.state.balance > 0 ? 1 - dev.state.balance : 1);
                    document.getElementById('lbl-balance').textContent = Math.abs(dev.state.balance)<.01 ? 'Centro' : `${dev.state.balance<0?'L':'R'} ${Math.round(Math.abs(dev.state.balance)*100)}%`;
                    updateKnobAngle(dev, '[data-receiver-control="balance"]', dev.state.balance, -1, 1);
                });
                document.getElementById('sl-vol').addEventListener('input', e => {
                    dev.state.volume = parseFloat(e.target.value);
                    document.getElementById('lbl-vol').innerText = `${Math.round(dev.state.volume*100)}%`;
                    if(dev.nodes.vol) dev.nodes.vol.gain.value = dev.state.volume * ((dev.state.balance || 0) < 0 ? 1 + dev.state.balance : 1);
                    if(dev.nodes.volL) dev.nodes.volL.gain.value = dev.state.volume * ((dev.state.balance || 0) > 0 ? 1 - dev.state.balance : 1);
                    updateKnobAngle(dev, '[data-receiver-control="volume"]', dev.state.volume, 0, 1);
                });
                document.getElementById('sl-bass').addEventListener('input', e => {
                    dev.state.bass = parseFloat(e.target.value);
                    document.getElementById('lbl-bass').innerText = `${dev.state.bass}dB`;
                    if(dev.nodes.bassR) dev.nodes.bassR.gain.value = dev.state.bass;
                    if(dev.nodes.bassL) dev.nodes.bassL.gain.value = dev.state.bass;
                    updateKnobAngle(dev, '[data-receiver-control="bass"]', dev.state.bass, -15, 15);
                });
                document.getElementById('sl-treble').addEventListener('input', e => {
                    dev.state.treble = parseFloat(e.target.value);
                    document.getElementById('lbl-treble').innerText = `${dev.state.treble}dB`;
                    if(dev.nodes.trebleR) dev.nodes.trebleR.gain.value = dev.state.treble;
                    if(dev.nodes.trebleL) dev.nodes.trebleL.gain.value = dev.state.treble;
                    updateKnobAngle(dev, '[data-receiver-control="treble"]', dev.state.treble, -15, 15);
                });
            } else if (['headphoneAmp','headphoneAmpModern'].includes(dev.type)) {
                document.getElementById('sl-amp-vol').addEventListener('input', e => {
                    dev.state.volume = parseFloat(e.target.value);
                    document.getElementById('lbl-amp-vol').innerText = `${Math.round(dev.state.volume*100)}%`;
                    if (dev.setPhoneVolume) dev.setPhoneVolume(dev.state.volume);
                    updateKnobAngle(dev, '.amp-volume-knob', dev.state.volume, 0, 1);
                });
            } else if (dev.type === 'headphoneAmp4') {
                for (let i = 0; i < 4; i++) {
                    const slider = document.getElementById(`sl-amp4-${i + 1}`);
                    if (!slider) continue;
                    slider.addEventListener('input', e => {
                        setHeadphoneAmp4Volume(dev, i, Number(e.target.value));
                    });
                }
            } else if (MIXER_TYPES.has(dev.type)) {
                for (let channel = 0; channel < 3; channel++) {
                    const slider = document.getElementById(`sl-mixer-${channel}`);
                    slider?.addEventListener('input', e => setMixerVolume(dev, channel, Number(e.target.value)));
                }
            } else if (EQ_TYPES.has(dev.type)) {
                document.getElementById('sl-eq-level').addEventListener('input', e => dev.setEqLevel(e.target.value));
                for (let i = 0; i < GRAPHIC_EQ_FREQUENCIES.length; i++) {
                    const sl = document.getElementById(`sl-eq-${i}`);
                    if (!sl) continue;
                    sl.addEventListener('input', e => {
                        const val = parseFloat(e.target.value);
                        dev.state.eq[i] = val;
                        document.getElementById(`lbl-eq-${i}`).innerText = `${val > 0 ? '+' : ''}${val}dB`;
                        const onDevice = dev.el.querySelector(`.eq-slider[data-band="${i}"]`);
                        if (onDevice) onDevice.value = val;
                        const lbl = dev.el.querySelector(`.lbl-band-${i}`);
                        if (lbl) lbl.textContent = `${val > 0 ? '+' : ''}${val}dB`;
                        applyEqGains(dev);
                    });
                }
            }
        }
        
        canvas.addEventListener('pointerdown', e => {
            if(e.target === canvas || e.target === world || e.target.id === 'cables-layer') {
                selectCable(null);
                selectDevice(null);
            }
        });

        let isPatching = false; let startPort = null; let tempCableEl = null;

        function getPortScreenAnchor(elem){
            const rect=elem.getBoundingClientRect();
            return {x:rect.left+rect.width/2,y:rect.top+rect.height*(elem.dataset.type==='wire'?.69:.5)};
        }
        function getPortCenter(elem) {
            const point=getPortScreenAnchor(elem);
            return screenToWorld(point.x,point.y);
        }

        // --- FÍSICA E GRAVIDADE DINÂMICA COM BALANÇO (PENDULAR / INÉRCIA) ---
        const dragPhysics = {
            lastX: 0,
            lastY: 0,
            lastTime: 0,
            swingX: 0,
            swingY: 0,
            swingVelX: 0,
            swingVelY: 0,
            activeTarget: null,
            displayedTarget: null,
            frameTime: 0
        };

        function calculateSagPath(p1, p2, swing = { x: 0, y: 0 }, routeOffset = 0, slack=5) {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const span = Math.hypot(dx, dy);
            
            // O peso do cabo puxa verticalmente para baixo criando a "barriga" natural
            const baseSag = Math.max(48, span * 0.32);
            const asymmetry = Math.max(0, -dy * 0.20);
            // Variação vertical sutil e contida
            const slackFactor=.12+Math.max(0,Math.min(10,slack))*.176;
            const sag = Math.max(6,Math.min(340,(baseSag+asymmetry)*slackFactor+routeOffset))+(swing.y||0)*.45;

            // Inércia lateral suave e realista (sensação de cabo de borracha pesado e flexível, não elástico)
            const lateralOffset = (swing.x || 0) * 0.45;

            // Pontos de controle cúbicos com curvatura pesada e amortecida
            const cp1x = p1.x + dx * 0.18 + lateralOffset * 0.4;
            const cp1y = p1.y + sag;
            const cp2x = p2.x - dx * 0.18 + lateralOffset * 0.55;
            const cp2y = p2.y + sag;
            return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        const CABLE_GEOMETRY=Hardware.plugs;
        const cableGeometry=type=>CABLE_GEOMETRY[type]||CABLE_GEOMETRY.rca;
        function drawCablePlugs(container, cableType, endpoints) {
            ['start', 'end'].forEach((end, index) => {
                let plug = container.querySelector(`.cable-plug-${end}`);
                if (!plug) {
                    plug = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    plug.setAttribute('class', `cable-plug cable-plug-${end}`);
                    plug.setAttribute('aria-hidden', 'true');
                    container.appendChild(plug);
                }
                if (plug.dataset.type !== cableType) {
                    plug.dataset.type = cableType;
                    plug.innerHTML='<g class="plug-seat-body">'+Hardware.plugMarkup(cableType)+'</g>';
                }
                const body=plug.querySelector('.plug-seat-body');
                body?.setAttribute('transform',`translate(${container.dataset.seatEnd===end?Number(container.dataset.seatOffset||0):0} 0)`);
                plug.style.opacity=container.dataset.seating==='true'?container.dataset.seatOpacity||'1':'1';
                const {tip,angle,rear}=endpoints[index];
                plug.setAttribute('transform', `translate(${tip.x} ${tip.y}) rotate(${angle})`);
                const candidate=document.querySelector('#audio-world .lighting-demo-light');
                const light=candidate&&candidate.querySelector('input[type="range"]').value>0&&candidate.getAttribute('aria-checked')==='true'?candidate:null;
                const sceneLight=light?null:Hardware.sceneLightAt(tip.x,tip.y);
                if(light||sceneLight){
                    const sourceX=light?light.offsetLeft+light.offsetWidth/2:sceneLight.x,sourceY=light?light.offsetTop+light.offsetHeight/2:sceneLight.y;
                    const dx=tip.x-sourceX,dy=tip.y-sourceY,length=Math.hypot(dx,dy),factor=Math.min(1,3/(length*1.8/170||1));
                    plug.style.setProperty('--plug-shadow-x',(dx*1.8/170*factor).toFixed(1)+'px');
                    plug.style.setProperty('--plug-shadow-y',(dy*1.8/170*factor).toFixed(1)+'px');
                }else{plug.style.setProperty('--plug-shadow-x','0px');plug.style.setProperty('--plug-shadow-y','0px');}
                if(cableType!=='wire'){
                    let boot=plug.querySelector('.plug-strain-relief');
                    if(!boot){boot=document.createElementNS('http://www.w3.org/2000/svg','path');boot.setAttribute('class','plug-strain-relief');(body||plug).insertBefore(boot,(body||plug).firstChild);}
                    boot.setAttribute('d',`M ${rear-1} 0 L ${rear+8} 0`);
                    boot.setAttribute('fill','none');boot.setAttribute('stroke','#252d32');boot.setAttribute('stroke-width',String(cableGeometry(cableType).outer));boot.setAttribute('stroke-linecap','round');
                }

            });
        }

        function drawCable(container, p1, p2, waypoints = [], cableType = 'rca-r', swing = { x: 0, y: 0 }, routeOffset = 0) {
            const seating=container.dataset.seating==='true';
            const showPlugs=seating||(isPatching&&container===tempCableEl&&!state.connections.some(connection=>connection.el===container));
            const geometry=cableGeometry(cableType);
            container.style.setProperty('--cable-outer',geometry.outer+'px');
            container.style.setProperty('--cable-inner',geometry.inner+'px');
            const slack=Number(container.dataset.slack??5);
            const guide=calculateSagPath(p1,p2,swing,routeOffset,slack);
            const coords=guide.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
            const rear=cableType==='wire'?20:(cableType==='p10'||cableType==='p2')?28*geometry.scale:25;
            const endpoints=[{tip:p1,control:{x:coords[2],y:coords[3]}},{tip:p2,control:{x:coords[4],y:coords[5]}}].map(({tip,control})=>{
                const dx=control.x-tip.x,dy=control.y-tip.y,length=Math.hypot(dx,dy)||1;
                const direction={x:dx/length,y:dy/length},offset=rear+(cableType==='wire'?0:8);
                return {tip,rear,direction,angle:Math.atan2(dy,dx)*180/Math.PI,base:{x:tip.x+direction.x*offset,y:tip.y+direction.y*offset}};
            });
            const [start,end]=endpoints;
            const pull=Math.max(24,Math.min(180,Math.hypot(p2.x-p1.x,p2.y-p1.y)*.3));
            const pathData=showPlugs&&!seating?`M ${start.base.x} ${start.base.y} C ${start.base.x+start.direction.x*pull} ${start.base.y+start.direction.y*pull}, ${end.base.x+end.direction.x*pull} ${end.base.y+end.direction.y*pull}, ${end.base.x} ${end.base.y}`:guide;

            if (cableType === 'wire') {
                // Desenha o Fio de Caixa Trançado (Vermelho e Preto)
                let blackPath = container.querySelector('.wire-braid-black');
                let redPath = container.querySelector('.wire-braid-red');
                if (!blackPath || !redPath) {
                    container.innerHTML = '';
                    blackPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    blackPath.setAttribute("class", "wire-braid-black");
                    redPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    redPath.setAttribute("class", "wire-braid-red");
                    container.appendChild(blackPath);
                    container.appendChild(redPath);
                }
                blackPath.setAttribute("d", pathData);
                redPath.setAttribute("d", pathData);
            } else {
                let singlePath = container.tagName.toLowerCase() === 'path' ? container : container.querySelector('.cable-path');
                if (!singlePath) {
                    container.innerHTML = '';
                    singlePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    singlePath.setAttribute("class", "cable-path");
                    container.appendChild(singlePath);
                }
                singlePath.dataset.type = cableType;
                singlePath.setAttribute("d", pathData);
            }

            if (container.tagName.toLowerCase() === 'g') {
                let title = container.querySelector('title');
                if (!title) {
                    title = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    container.insertBefore(title, container.firstChild);
                }
                const cableNames = { 'rca-r':'RCA R · canal direito', 'rca-l':'RCA L · canal esquerdo', rca:'RCA', p10:'P10', p2:'P2', wire:'Fio de caixa · par vermelho/preto' };
                title.textContent = cableNames[cableType] || 'Cabo de áudio';

                let outline = container.querySelector('.cable-outline');
                if (!outline) {
                    outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    outline.setAttribute("class", "cable-outline");
                    container.insertBefore(outline, container.firstChild.nextSibling);
                }
                outline.dataset.type = cableType;
                outline.setAttribute("d", pathData);
                if(showPlugs)drawCablePlugs(container, cableType, endpoints);
                else container.querySelectorAll('.cable-plug').forEach(plug=>plug.remove());
            }
        }

        canvas.addEventListener('pointerdown', e => {
            const port = e.target.closest('.port');
            if (port) {
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
                
                // Conectar ou reconectar
                const existingIdx = state.connections.findIndex(c => c.outId === port.id || c.inId === port.id);
                if (existingIdx > -1) {
                    const conn = state.connections[existingIdx];
                    const otherId = conn.outId === port.id ? conn.inId : conn.outId;
                    removeConnection(existingIdx);
                    startPort = document.getElementById(otherId);
                } else {
                    startPort = port;
                    playUiSound('pickup');
                }

                if (!startPort) return;
                
                isPatching = true;
                startCableHum();
                dragPhysics.displayedTarget=null;dragPhysics.frameTime=0;
                updatePortGuidance();
                tempCableEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tempCableEl.setAttribute("class", "cable-group active");
                tempCableEl.dataset.type = startPort.dataset.type;
                svgLayer.appendChild(tempCableEl);
                
                const pCenter = getPortCenter(startPort);
                const mousePos = screenToWorld(e.clientX, e.clientY);

                // Inicializa variáveis do pêndulo físico para o cabo solto
                dragPhysics.lastX = e.clientX;
                dragPhysics.lastY = e.clientY;
                dragPhysics.lastTime = performance.now();
                dragPhysics.swingX = 0;
                dragPhysics.swingY = 0;
                dragPhysics.swingVelX = 0;
                dragPhysics.swingVelY = 0;
                dragPhysics.activeTarget = mousePos;

                drawCable(tempCableEl, pCenter, mousePos, [], startPort.dataset.type, { x: 0, y: 0 });
                e.stopPropagation();
            }
        });

        const signalName = signal => ({line:'sinal de linha',phono:'sinal phono (cápsula MM)',amplified:'sinal de potência para caixas passivas',headphone:'sinal amplificado para fones',interconnect:'linha, phono ou fones (sem conversão)',unknown:'sinal ainda não definido',mixed:'sinais diferentes nos canais L/R'}[signal] || signal);
        const SIGNAL_INFO={
            line:{label:'LINHA',description:'Áudio entre fontes, pré-amplificadores, processadores e caixas ativas. Não alimenta uma caixa passiva.'},
            phono:{label:'PHONO',description:'Baixo nível da cápsula magnética do toca-discos. Precisa de um pré de phono com ganho e equalização RIAA.'},
            amplified:{label:'POTÊNCIA · CAIXAS',description:'Saída amplificada SPEAKER para caixas passivas. Não conecte a entradas de linha, phono ou fones.'},
            headphone:{label:'FONES',description:'Saída amplificada de baixa potência para fones; diferente de SPEAKER. Pode alimentar linha com nível reduzido e adaptador adequado.'},
            interconnect:{label:'PASSAGEM ANALÓGICA',description:'Preserva linha, phono ou fones. Não converte o nível nem aplica RIAA. Não aceita potência SPEAKER.'},
            unknown:{label:'A DEFINIR',description:'O sinal depende da fonte ligada à entrada deste adaptador ou seletor.'},
            mixed:{label:'SINAIS DIFERENTES',description:'As entradas estão recebendo níveis de sinal diferentes. Revise a origem dos canais.'}
        };
        function portSignalLabel(port){return port.dataset.role?.startsWith('lfe-')?'LINHA · SUB/LFE':SIGNAL_INFO[getPortSignal(port)]?.label||'A DEFINIR';}
        function portSignalsMarkup(dev){
            const groups=new Map();
            dev.el.querySelectorAll('.port').forEach(port=>{
                const node=port.dataset.node||'',io=port.dataset.io,signal=getPortSignal(port),format=port.dataset.format||(/^rca/.test(port.dataset.type)?'RCA':({p10:'P10 TRS estéreo',p2:'P2 estéreo',wire:'Bornes +/−'}[port.dataset.type]||port.dataset.type)),base=node.replace(/[LR]$/,'');
                const key=[io,base,format,signal].join(':');
                if(!groups.has(key))groups.set(key,{port,io,node:base,signal,format,channels:[]});
                if(port.dataset.channel)groups.get(key).channels.push(port.dataset.channel);
            });
            if(!groups.size)return '';
            const rows=[...groups.values()].map(group=>{
                const {port,io,node,signal,format}=group,info=SIGNAL_INFO[signal]||SIGNAL_INFO.unknown;
                const groupName=port.dataset.role?.startsWith('lfe-')?'SUB/LFE mono':node.startsWith('outPhone')?'Fones '+node.replace('outPhone',''):node==='line'?'LINE OUT':node.startsWith('spkOut')||node==='speaker'?'SPEAKER':node==='inStereo'||node==='outStereo'?'Estéreo':node.replace(/^in/,'Entrada ').replace(/^out/,'Saída ').replace('Low','Graves').replace('Mid','Médios').replace('High','Agudos');
                const channels=new Set(group.channels),channelText=channels.size===2?' · L/R':channels.size===1?' · '+[...channels][0]:'';
                const direction=io==='in'?'Entrada':'Saída';
                const detail=port.dataset.role?.startsWith('lfe-')?'Nível de linha para subwoofer; SUB/LFE descreve o conteúdo de graves, não um nível de potência.':info.description;
                return `<div class="port-signal-row" role="group" aria-label="${direction}: ${groupName||'áudio'}, ${format}${channelText}. ${detail}" title="${direction} · ${detail}"><div class="port-signal-identity"><strong>${groupName||direction}</strong><small>${format}${channelText}</small></div><span class="port-signal-direction" data-io="${io}" aria-hidden="true" title="${direction}"><svg viewBox="0 0 20 20"><path d="M10 3v13m-5-5 5 5 5-5"/></svg></span><span class="signal-badge" data-level="${signal}" title="${detail}"><i aria-hidden="true"></i>${portSignalLabel(port)}</span></div>`;
            });
            return rows.join('');
        }
        function portSignalsInspectorHtml(dev){
            if(!dev.el.querySelector('.port'))return '';
            return `<section class="port-signal-panel"><h3>Sinais de entrada e saída</h3><div id="port-signal-rows">${portSignalsMarkup(dev)}</div></section>`;
        }
        function refreshPortSignalInspector(){
            const dev=state.devices[state.selectedDeviceId],container=document.getElementById('port-signal-rows');
            if(dev&&container){const markup=portSignalsMarkup(dev);if(container.innerHTML!==markup)container.innerHTML=markup;}
        }

        function getPortSignal(port, visited = new Set(), prospective = null,channelHint='') {
            const dev = state.devices[port?.closest('.device-node')?.id];
            if (!dev) return 'unknown';
            const node = port.dataset.node || '', role = port.dataset.role || '';
            const config=INTERFACE_DEVICES[dev.type];
            const passthrough=config?.passive||RCA_SWITCH_TYPES.has(dev.type)||MATRIX_TYPES.has(dev.type);
            if(config&&!config.passive)return port.dataset.io==='in'?config.inputSignal:config.outputSignal;
            if(passthrough){
                if(port.dataset.io==='in')return 'interconnect';
                if(visited.has(dev.id))return 'unknown';
                const next=new Set(visited);next.add(dev.id);
                const routed=routedInputPorts(dev,port,channelHint),accepts=input=>!!input&&routed.includes(input);
                const sources=state.connections.filter(c=>c.inId!==prospective?.input?.id&&accepts(document.getElementById(c.inId))).map(c=>({output:document.getElementById(c.outId),input:document.getElementById(c.inId)})).filter(link=>link.output);
                if(accepts(prospective?.input))sources.push(prospective);
                const signals=new Set(sources.map(link=>getPortSignal(link.output,next,prospective,portChannel(link.input)||portChannel(port)||channelHint)).filter(signal=>signal!=='unknown'));
                return signals.size>1?'mixed':signals.values().next().value||'unknown';
            }
            if (role.startsWith('lfe-')) return 'line';
            if (port.dataset.signal) return port.dataset.signal;
            if (port.dataset.io === 'in') {
                if (HP_TYPES.has(dev.type))return 'headphone';
                if (PASSIVE_SPK.has(dev.type) || PASSIVE_SUB_TYPES.has(dev.type) || SPEAKER_SWITCH_TYPES.has(dev.type)) return 'amplified';
                return 'line';
            }
            if (TURNTABLE_TYPES.has(dev.type)) return dev.state.tt?.output === 'phono' ? 'phono' : 'line';
            if (SPEAKER_SWITCH_TYPES.has(dev.type)) return 'amplified';
            if (['powerStereo','powerVintage','powerAmp'].includes(dev.type) && /^(out[RL]|speaker[RL])$/.test(node)) return 'amplified';
            if (dev.type === 'receiver' && /^spkOut/.test(node)) return 'amplified';
            if (/^outPhone|^outAux$/.test(node) && ['receiver','headphoneAmp','headphoneAmpModern','headphoneAmp4'].includes(dev.type)) return 'headphone';
            return 'line';
        }
        function signalMatches(actual,expected){
            if(actual==='unknown')return true;
            if(actual==='mixed')return false;
            if(expected==='interconnect')return ['line','phono','headphone'].includes(actual);
            return actual===expected||(['line','phono','headphone'].includes(actual)&&['line','phono','headphone'].includes(expected));
        }
        function revalidateSignalConnections() {
            for (let index = state.connections.length - 1; index >= 0; index--) {
                const cable = state.connections[index];
                if (!getPortCompatibility(document.getElementById(cable.outId), document.getElementById(cable.inId), false).compatible) removeConnection(index);
            }
            updatePortGuidance();
        }

        function signalLevelWarnings(actual,expected){
            if(actual==='phono'&&['line','headphone'].includes(expected))return ['PHONO tem nível muito baixo e precisa de pré com correção RIAA. Esta ligação produzirá áudio fraco e resposta tonal incorreta.'];
            if(['line','headphone'].includes(actual)&&expected==='phono')return ['Esta entrada PHONO amplifica muito mais que LINE e aplica RIAA: este nível provoca sobrecarga e distorção. Prefira uma entrada LINE. Isso não equivale ao dano por sinal SPEAKER.'];
            if(actual==='line'&&expected==='headphone')return ['Uma saída LINE não é um amplificador de fones: a carga pode reduzir o volume e provocar limitação de corrente. Use um amp de fones.'];
            if(actual==='headphone'&&expected==='line')return ['Saída de fones em entrada LINE: comece com volume baixo. O adaptador não atenua nem converte o nível.'];
            return [];
        }
        function connectionLoadWarnings(prospective){
            const warnings=[];
            for(const amp of Object.values(state.devices).filter(dev=>FIXED_AMP_SPECS[dev.type]))for(const ch of ['L','R']){
                const ports=[...amp.el.querySelectorAll('.port[data-io="out"]')].filter(port=>getPortSignal(port)==='amplified'&&portChannel(port)===ch);
                const terminals=uniqueTerminalLoads(ports,prospective),ohms=parallelOhms(terminals.map(load=>load.ohms));
                const previous=parallelOhms(uniqueTerminalLoads(ports).map(load=>load.ohms));
                if(ohms<FIXED_AMP_SPECS[amp.type].minOhms-.01&&Math.abs(ohms-previous)>.01)warnings.push((DEVICE_NAMES[amp.type]||'Amplificador')+' · '+ch+': a carga resultará em '+ohms.toFixed(1)+' Ω, abaixo do mínimo de '+amp.state.minOhms+' Ω. A proteção silenciará este canal; não é uma combinação válida para uso.');
            }
            return warnings;
        }
        function findConnectionDamageRisk(output,input,prospective){
            const direct=connectionDamageRisk(output,input,getPortSignal(output,new Set(),prospective),getPortSignal(input));
            if(direct)return direct;
            // A passive adapter changes the plug, never the electrical signal or its danger.
            for(const cable of prospectiveConnections(prospective)){
                const upstream=document.getElementById(cable.outId),downstream=document.getElementById(cable.inId);
                if(!upstream||!downstream)continue;
                const before=getPortSignal(upstream),after=getPortSignal(upstream,new Set(),prospective);
                const includesPower=after==='amplified'||after==='mixed'&&['L','R'].some(ch=>getPortSignal(upstream,new Set(),prospective,ch)==='amplified');
                if(includesPower&&(before!=='amplified'||cable.inId===input.id)){
                    const risk=connectionDamageRisk(upstream,downstream,'amplified',getPortSignal(downstream));if(risk)return risk;
                }
            }
            return null;
        }
        function applyDeviceDamage(dev,kind){
            if(!dev||dev.state.damage)return;
            dev.state.damage={kind};toggleDevicePower(dev);unpairDevice(dev);
            if(SOURCE_TYPES.has(dev.type))setSourcePlaying(dev,false);
            dev.listeningGain?.gain.setValueAtTime(0,state.audioCtx.currentTime);
            for(let i=state.connections.length-1;i>=0;i--){const cable=state.connections[i];if([cable.outId,cable.inId].some(id=>document.getElementById(id)?.closest('.device-node')?.id===dev.id))removeConnection(i);}
            if(state.selectedDeviceId===dev.id)selectDevice(dev.id,true);
            scheduleProjectSave();
        }
        function connectionDamageRisk(output,input,supplied,expected){
            if(supplied!=='amplified'||!['line','phono','headphone'].includes(expected))return null;
            return {deviceId:input.closest('.device-node').id,reason:'Uma saída SPEAKER fornece sinal de potência. Esta entrada recebe '+signalName(expected)+'. Aplicar essa potência pode danificar seu estágio de entrada. Adaptadores de conector não reduzem a tensão; use um conversor de nível alto para linha.'};
        }
        async function offerDamageSimulation(compatibility){
            const risk=compatibility?.damageRisk,dev=state.devices[risk?.deviceId];
            if(!dev)return;
            if(dev.state.damage){await showAppDialog({title:'Equipamento danificado',message:'Este equipamento já está danificado. Substitua-o por outro do catálogo.'});return;}
            const name=DEVICE_NAMES[dev.type]||'Equipamento';
            const accepted=await showAppDialog({title:`${name} · risco de dano`,message:`${risk.reason}\n\nCancelar mantém o equipamento intacto. Confirmar simula a ligação energizada e danifica este equipamento no projeto. O cabo incompatível não será instalado.`,acceptLabel:'Simular dano',requireChoice:true});
            if(!accepted)return;
            applyDeviceDamage(dev,'speaker-level-overload');
        }
        // Explica os impedimentos usando as mesmas regras que validam a conexão.
        function getPortCompatibility(pA, pB, checkNetwork = true) {
            if (!pA || !pB) return { compatible:false, reason:'Selecione duas portas.' };
            if (pA === pB) return { compatible:false, reason:'Escolha uma porta diferente.' };
            if (pA.closest('.device-node') === pB.closest('.device-node')) return { compatible:false, reason:'Conecte equipamentos diferentes.' };
            const typeA=pA.dataset.type,typeB=pB.dataset.type;
            const genericRcaPair=(typeA==='rca'&&(typeB==='rca-r'||typeB==='rca-l'))||(typeB==='rca'&&(typeA==='rca-r'||typeA==='rca-l'));
            const plugFits=typeA===typeB||genericRcaPair||(typeA?.startsWith('rca')&&typeB?.startsWith('rca'));
            const label=type=>({'rca-r':'RCA direito','rca-l':'RCA esquerdo',rca:'RCA',p10:'P10',p2:'P2',wire:'fio de caixa'}[type]||type||'conector');
            if(!plugFits)return{compatible:false,reason:`Barreira física: ${label(typeA)} não encaixa em ${label(typeB)}.`};
            if (connectionGuidanceEnabled && pA.dataset.io === pB.dataset.io) return { compatible:false, reason:'É preciso ligar uma saída a uma entrada.' };
            if([pA,pB].some(port=>state.devices[port.closest('.device-node')?.id]?.state.damage))return {compatible:false,reason:'Equipamento danificado: substitua-o por outro do catálogo antes de ligar novos cabos.'};

            const output = pA.dataset.io === 'out' ? pA : pB;
            const input = output === pA ? pB : pA;
            // A cable must not close a feedback loop through existing equipment.
            const origin=output.closest('.device-node').id,destination=input.closest('.device-node').id;
            const pending=[destination],seen=new Set();
            while(pending.length){
                const id=pending.pop();if(id===origin)return {compatible:false,reason:'Esta ligação fecha um ciclo de realimentação. Mantenha o percurso da fonte até a saída de escuta.'};
                if(seen.has(id))continue;seen.add(id);
                for(const cable of state.connections){
                    if(cable.inId===input.id||cable.outId===output.id)continue;
                    const from=document.getElementById(cable.outId)?.closest('.device-node')?.id;
                    if(from===id){const to=document.getElementById(cable.inId)?.closest('.device-node')?.id;if(to)pending.push(to);}
                }
            }
            const prospective={output,input};
            const supplied = getPortSignal(output,new Set(),prospective), expected = getPortSignal(input);
            const damageRisk=connectionGuidanceEnabled?findConnectionDamageRisk(output,input,prospective):null;
            if(damageRisk)return {compatible:false,damageRisk,reason:damageRisk.reason};
            const warnings=connectionGuidanceEnabled?signalLevelWarnings(supplied,expected):[];
            if (connectionGuidanceEnabled&&!signalMatches(supplied,expected)) {
                return { compatible:false, damageRisk:connectionDamageRisk(output,input,supplied,expected), reason:`Sinal incompatível: a saída fornece ${signalName(supplied)}, mas a entrada espera ${signalName(expected)}. O conector não converte o sinal.` };
            }
            // Simule a nova ligação também nos adaptadores já conectados a outros equipamentos.
            if(checkNetwork&&connectionGuidanceEnabled)for(const cable of state.connections){
                if(cable.inId===input.id||cable.outId===output.id)continue;
                const downstreamOut=document.getElementById(cable.outId),downstreamIn=document.getElementById(cable.inId);
                if(!downstreamOut||!downstreamIn)continue;
                const actual=getPortSignal(downstreamOut,new Set(),prospective), required=getPortSignal(downstreamIn);
                if(actual!==getPortSignal(downstreamOut))warnings.push(...signalLevelWarnings(actual,required));
                if(!signalMatches(actual,required))return {compatible:false,damageRisk:connectionDamageRisk(downstreamOut,downstreamIn,actual,required),reason:`A cadeia passiva preserva ${signalName(actual)}, mas um equipamento conectado depois dele espera ${signalName(required)}. Use um conversor de sinal.`};
            }
            if (connectionGuidanceEnabled&&pA.dataset.channel && pB.dataset.channel && pA.dataset.channel !== pB.dataset.channel)warnings.push('Canais cruzados: a saída '+output.dataset.channel+' alimentará a entrada '+input.dataset.channel+'. As cores RCA indicam canal, mas não impedem o encaixe.');
            if(checkNetwork&&connectionGuidanceEnabled)warnings.push(...connectionLoadWarnings(prospective));
            const unique=[...new Set(warnings)];return {compatible:true,warnings:unique,reason:unique.join(' ')||`Conector compatível${connectionGuidanceEnabled?` · ${signalName(supplied)}`:''}.`};
        }

        function arePortsCompatible(pA, pB) {
            return getPortCompatibility(pA, pB).compatible;
        }

        function isSelectedSwitchOutput(dev, port) {
            if (dev && MATRIX_TYPES.has(dev.type)) return !!dev.state.matrixOutputs[Number(port?.dataset.node?.match(/^out(\d)/)?.[1])-1];
            if (!dev || !SELECTOR_TYPES.has(dev.type)) return true;
            return port?.dataset.node?.startsWith(`out${dev.selectedSource}`);
        }

        function portCarriesSignal(dev, port) {
            if (!dev || !port || dev.state.damage) return false;
            if(dev.type==='streamIntegrated'&&(dev.state.streamMute||dev.state.volume<=0||port.dataset.node.startsWith('speaker')&&dev.streamPhonesConnected))return false;
            if (!isSelectedSwitchOutput(dev, port)) return false;
            const nodeName = port.dataset.node || '';
            const channel=port.dataset.channel;
            if(SIGNAL_GENERATOR_TYPES.has(dev.type)&&(dev.state.signalLevel===0||(channel&&dev.state.signalChannel!=='both'&&dev.state.signalChannel!==channel)))return false;
            if(POWER_OUTPUT_TYPES.has(dev.type)&&getPortSignal(port)==='amplified'&&(dev.channelLoads?.[channel]??8)<dev.state.minOhms-.01)return false;
            if((RADIO_RECEIVERS.has(dev.type)||dev.type==='preamp'||dev.type==='headphoneAmp'||dev.type==='headphoneAmpModern')&&dev.state.volume<=0)return false;
            if(dev.type==='headphoneAmp4'){const index=Number(nodeName.match(/^outPhone(\d)$/)?.[1])-1;if(index>=0&&dev.state.channelVolumes[index]<=0)return false;}
            if(CUSTOM_POWER_AMPS[dev.type])return (dev.state.channelGain[port.dataset.channel]??1)>0;
            if(controlAmpConfig(dev.type))return dev.state.volume>0&&!dev.state.preMuted;
            if (MIXER_TYPES.has(dev.type) && /^out[RL]$/.test(nodeName)) return dev.state.channelVolumes.some(value => value > 0);
            if (CROSSOVER_TYPES.has(dev.type) && /^out(?:Low|Mid|High)[RL]$/.test(nodeName)) return true;
            return true;
        }

        function isPortOccupied(port) {
            return state.connections.some(connection => connection.inId === port.id || connection.outId === port.id);
        }

        function canonicalPortLabel(port){
            const io=port.dataset.io==='out'?'Saída':'Entrada';
            const format=(port.dataset.format||port.dataset.type||'conector').replace(/^rca-[lr]$/i,'RCA').replace(/^p10$/i,'P10').replace(/^p2$/i,'P2').replace(/^wire$/i,'fio para caixas').replace(/^rca$/i,'RCA').toUpperCase();
            const signal=signalName(getPortSignal(port));
            const channel=port.dataset.channel||(/L$/.test(port.dataset.node||'')?'L':/R$/.test(port.dataset.node||'')?'R':'');
            return [io,format,channel?`canal ${channel==='L'?'esquerdo (L)':'direito (R)'}`:'',signal].filter(Boolean).join(' · ');
        }

        let highlightedCompatibilityCable=null;
        function updatePortGuidance(forceCompatibilityRefresh=false) {
            const guidance = document.getElementById('connection-guidance');
            const selectedCable=!isPatching?state.selectedConnection:null;
            const cableOut=selectedCable&&document.getElementById(selectedCable.outId),cableIn=selectedCable&&document.getElementById(selectedCable.inId);
            const cableEndpoints=new Set([cableOut?.closest('.device-node')?.id,cableIn?.closest('.device-node')?.id].filter(Boolean));
            const samePlug=(a,b)=>{const x=a?.dataset.type,y=b?.dataset.type;return x===y||(x==='rca'&&y?.startsWith('rca'))||(y==='rca'&&x?.startsWith('rca'))||(x?.startsWith('rca')&&y?.startsWith('rca'));};
            if(forceCompatibilityRefresh||selectedCable!==highlightedCompatibilityCable){
                highlightedCompatibilityCable=selectedCable;
                document.querySelectorAll('.device-node').forEach(device=>{
                    if(!connectionGuidanceEnabled||!selectedCable||!cableOut||!cableIn){device.classList.remove('no-cable-compatibility');return;}
                    if(cableEndpoints.has(device.id)){device.classList.remove('no-cable-compatibility');return;}
                    const freePort=[...device.querySelectorAll('.port')].some(port=>{
                        if(isPortOccupied(port))return false;
                        if(port.dataset.io==='in')return samePlug(cableOut,port)&&getPortCompatibility(cableOut,port).compatible;
                        if(port.dataset.io==='out')return samePlug(port,cableIn)&&getPortCompatibility(port,cableIn).compatible;
                        return false;
                    });
                    device.classList.toggle('no-cable-compatibility',!freePort);
                });
            }
            document.querySelectorAll('.port').forEach(port => {
                const occupied = isPortOccupied(port);
                const direction = port.dataset.io === 'out' ? 'saída' : 'entrada';
                const type = port.dataset.type || 'conector';
                const name = canonicalPortLabel(port);
                port.dataset.baseTitle = name;
                let status = occupied ? 'ocupado' : 'livre';
                let explanation = occupied ? 'Esta porta já está conectada. Arraste o cabo a partir dela para refazer a ligação.' : `${direction} livre.`;
                port.classList.toggle('port-available', connectionGuidanceEnabled && !occupied && !isPatching);
                port.classList.toggle('port-occupied', connectionGuidanceEnabled && occupied && isPatching);
                port.classList.remove('port-incompatible', 'port-compatible', 'port-source');
                if (connectionGuidanceEnabled && isPatching && startPort) {
                    if (port === startPort) {
                        status = 'origem';
                        explanation = 'Origem selecionada. Solte em uma porta verde.';
                        port.classList.add('port-source');
                    } else if (occupied) {
                        status = 'ocupado';
                        explanation = 'Esta porta já está conectada. Remova ou refaça a ligação existente.';
                        port.classList.add('port-incompatible');
                    } else {
                        const compatibility = getPortCompatibility(startPort, port);
                        status = compatibility.compatible ? 'compatível · livre' : 'incompatível';
                        explanation = compatibility.reason;
                        port.classList.add(compatibility.compatible ? 'port-compatible' : 'port-incompatible');
                    }
                } else if (connectionGuidanceEnabled && !isPatching && state.selectedConnection) {
                    const outPort = document.getElementById(state.selectedConnection.outId);
                    const inPort = document.getElementById(state.selectedConnection.inId);
                    if (port === outPort || port === inPort) {
                        status = 'cabo selecionado';
                        explanation = 'Extremidade do cabo selecionado. Portas verdes mostram destinos alternativos compatíveis.';
                        port.classList.add('port-source');
                    } else if (!occupied && outPort) {
                        const compatibility = getPortCompatibility(outPort, port);
                        if (compatibility.compatible) {
                            status = 'compatível · livre';
                            explanation = `${compatibility.reason} Para mover o cabo, arraste uma das extremidades.`;
                            port.classList.add('port-compatible');
                        } else if (port === hoveredGuidancePort) {
                            status = 'incompatível';
                            explanation = compatibility.reason;
                            port.classList.add('port-incompatible');
                        }
                    }
                }
                const signal = getPortSignal(port);
                port.dataset.signalLevel = signal;
                explanation = `${signalName(signal)}. ${explanation}`;
                port.dataset.status = status;
                port.setAttribute('aria-label', `${name} · ${status}`);
                port.setAttribute('title', connectionGuidanceEnabled?`${name} · ${direction} · ${status}. ${explanation}`:'');
            });
            refreshPortSignalInspector();
            const summaryOut=state.selectedConnection&&document.getElementById(state.selectedConnection.outId),summaryIn=state.selectedConnection&&document.getElementById(state.selectedConnection.inId),cableSummary=document.querySelector('#cable-properties .cable-signal-summary');
            if(cableSummary)cableSummary.textContent=connectionGuidanceEnabled&&summaryOut&&summaryIn?`Transporta ${portSignalLabel(summaryOut)} → entrada espera ${portSignalLabel(summaryIn)}. ${getPortCompatibility(summaryOut,summaryIn).reason}`:'';
            if (!guidance) return;
            const selected = state.selectedConnection;
            guidance.classList.toggle('is-active', connectionGuidanceEnabled&&(isPatching || !!selected));
            guidance.classList.toggle('is-invalid', connectionGuidanceEnabled&&isPatching && !hoveredTargetPort);
            if(!connectionGuidanceEnabled){guidance.textContent='';return;}
            if (isPatching && startPort) {
                const startName = startPort.dataset.baseTitle || startPort.dataset.type || 'porta';
                const hovered = hoveredGuidancePort && hoveredGuidancePort !== startPort ? hoveredGuidancePort : null;
                if (hovered) {
                    const reason = isPortOccupied(hovered) ? 'Esta porta já está conectada; refaça a ligação a partir dela.' : getPortCompatibility(startPort, hovered).reason;
                    guidance.textContent = arePortsCompatible(startPort, hovered) && !isPortOccupied(hovered)
                        ? `Compatível · ${portSignalLabel(startPort)} → ${portSignalLabel(hovered)}. ${getPortCompatibility(startPort,hovered).reason} Solte para conectar.`
                        : `${getPortCompatibility(startPort,hovered).damageRisk?'RISCO DE DANO · Solte para revisar o alerta. ':'Não conecta: '}${reason}`;
                } else {
                    guidance.textContent = `Origem: ${startName} · ${portSignalLabel(startPort)}. Portas verdes aceitam este sinal e conector.`;
                }
            } else if (selected) {
                const output = document.getElementById(selected.outId);
                const input = document.getElementById(selected.inId);
                guidance.textContent = `Cabo selecionado: ${output?.dataset.baseTitle || 'saída'} → ${input?.dataset.baseTitle || 'entrada'}. Portas verdes aceitam essa saída; consulte o motivo no título de outras portas.`;
            } else {
                guidance.textContent = '';
            }
        }

        // Encontra a porta mais próxima do cursor dentro de um raio de atração magnética
        function findTargetPortNear(clientX, clientY, maxDist = 28) {
            let closest = null;
            let minDist = maxDist;
            document.querySelectorAll('.port').forEach(p => {
                if (p === startPort) return;
                const rect = p.getBoundingClientRect();
                const anchor=getPortScreenAnchor(p);
                const cx=anchor.x,cy=anchor.y;
                const dist = Math.hypot(clientX - cx, clientY - cy);
                if (dist < minDist && !isPortOccupied(p) && arePortsCompatible(startPort, p)) {
                    minDist = dist;
                    closest = p;
                }
            });
            return closest;
        }

        let hoveredTargetPort = null;
        let hoveredGuidancePort = null;

        canvas.addEventListener('pointermove', e => {
            if (isPatching) return;
            const port = document.elementFromPoint(e.clientX, e.clientY)?.closest('.port') || null;
            if (port !== hoveredGuidancePort) {
                hoveredGuidancePort = port;
                if (state.selectedConnection) updatePortGuidance();
            }
        });
        canvas.addEventListener('mouseleave', () => {
            hoveredGuidancePort = null;
            if (state.selectedConnection && !isPatching) updatePortGuidance();
        });

        window.addEventListener('pointermove', e => {
            if (isPatching && tempCableEl && startPort) {
                e.preventDefault();
                const guidancePort = document.elementFromPoint(e.clientX, e.clientY)?.closest('.port') || null;
                if (guidancePort !== hoveredGuidancePort) {
                    hoveredGuidancePort = guidancePort;
                    updatePortGuidance();
                }
                const c = canvas.getBoundingClientRect();
                const now = performance.now();
                const dt = Math.max(8, Math.min(50, now - (dragPhysics.lastTime || now))) / 1000;
                
                // Calcula velocidade e aceleração instantânea do mouse com amortecimento
                const vx = (e.clientX - dragPhysics.lastX) / dt;
                const vy = (e.clientY - dragPhysics.lastY) / dt;

                // Força de arrasto sutil (sensação de peso e fricção do ar, sem efeito de estilingue)
                dragPhysics.swingVelX += -vx * 0.016;
                dragPhysics.swingVelY += -vy * 0.010;

                // Limita a velocidade máxima de oscilação para manter o cabo controlado
                dragPhysics.swingVelX = Math.max(-35, Math.min(35, dragPhysics.swingVelX));
                dragPhysics.swingVelY = Math.max(-25, Math.min(25, dragPhysics.swingVelY));

                dragPhysics.lastX = e.clientX;
                dragPhysics.lastY = e.clientY;
                dragPhysics.lastTime = now;
                
                // Busca porta compatível próxima com efeito magnético
                const candidate = findTargetPortNear(e.clientX, e.clientY, 32);
                if (candidate !== hoveredTargetPort) {
                    if (hoveredTargetPort) hoveredTargetPort.classList.remove('port-highlight');
                    hoveredTargetPort = candidate;
                    if (hoveredTargetPort) hoveredTargetPort.classList.add('port-highlight');
                    updatePortGuidance();
                }

                dragPhysics.activeTarget = hoveredTargetPort
                    ? getPortCenter(hoveredTargetPort)
                    : screenToWorld(e.clientX, e.clientY);


            }
        });

        window.addEventListener('pointerup', async e => {
            if(e.cancelled){cancelCableDrag();return;}
            if (isPatching) {
                if (hoveredTargetPort) {
                    hoveredTargetPort.classList.remove('port-highlight');
                }

                // Tenta pegar a porta pelo magnetismo ou diretamente sob o cursor
                tempCableEl.style.visibility = 'hidden';
                const directEl = document.elementFromPoint(e.clientX, e.clientY);
                tempCableEl.style.visibility = 'visible';
                
                let tPort = directEl ? directEl.closest('.port') : null;
                const attempted=tPort&&!isPortOccupied(tPort)?getPortCompatibility(startPort,tPort):null;
                const hazardous=!!attempted?.damageRisk;
                if(connectionGuidanceEnabled&&hazardous){cancelCableDrag();offerDamageSimulation(attempted);return;}
                if (!tPort || isPortOccupied(tPort) || !arePortsCompatible(startPort, tPort)) {
                    tPort = findTargetPortNear(e.clientX, e.clientY, 36);
                }
                
                if (tPort && arePortsCompatible(startPort, tPort)) {
                    const review=getPortCompatibility(startPort,tPort);
                    if(connectionGuidanceEnabled&&review.warnings?.length){
                        const accepted=await showAppDialog({title:'Revisar ligação',message:review.warnings.join('\n\n')+'\n\nDeseja conectar mesmo assim?',acceptLabel:'Conectar',requireChoice:true});
                        if(!accepted){cancelCableDrag();return;}
                    }
                    const outP = startPort.dataset.io === 'out' ? startPort : tPort;
                    const inP = startPort.dataset.io === 'out' ? tPort : startPort;
                    
                    const exIdx = state.connections.findIndex(c => c.inId === inP.id || c.outId === outP.id);
                    if (exIdx > -1) removeConnection(exIdx);

                    tempCableEl.classList.remove('active');
                    const connType = outP.dataset.type || inP.dataset.type;
                    const connection={outId:outP.id,inId:inP.id,el:tempCableEl,type:connType,wps:[]};
                    state.connections.push(connection);animateCableSeat(connection,tPort);
                    playUiSound('connect');
                    outP.classList.add('connected'); inP.classList.add('connected');
                    updatePortGuidance(true);
                    
                    const devOut = state.devices[outP.closest('.device-node').id];
                    const devIn = state.devices[inP.closest('.device-node').id];
                    if (devOut && devIn && devOut.nodes[outP.dataset.node] && devIn.nodes[inP.dataset.node]) {
                        try{devOut.nodes[outP.dataset.node].connect(devIn.nodes[inP.dataset.node]);}catch{}
                    }
                    
                    updateCables(); updateCableFlows();
                } else {
                    tempCableEl.remove();
                }
                stopCableHum();
                isPatching = false; startPort = null; tempCableEl = null; hoveredTargetPort = null;
                hoveredGuidancePort = null;
                updatePortGuidance();
                dragPhysics.activeTarget = null;
            }
        });

        function animateCableSeat(connection,port){
            if(state.restoringProject||powerMotionPreference.matches)return;
            connection.seatStarted=performance.now();connection.seatEnd=port.id===connection.inId?'end':'start';
            connection.seatAnimations=[port.animate([
                {outline:'2px solid rgba(157,224,181,.8)',outlineOffset:'2px'},
                {outline:'2px solid transparent',outlineOffset:'5px'}
            ],{delay:100,duration:300,easing:'ease-out'})];
        }

        function removeConnection(idx) {
            const c = state.connections[idx];
            if (!c) return;
            c.seatAnimations?.forEach(animation=>animation.cancel());
            playUiSound('disconnect');
            if (state.selectedConnection === c) selectCable(null);
            c.el.remove();
            
            const o = document.getElementById(c.outId); const i = document.getElementById(c.inId);
            if(o) o.classList.remove('connected'); if(i) i.classList.remove('connected');
            
            if(o && i) {
                const dO = state.devices[o.closest('.device-node').id]; const dI = state.devices[i.closest('.device-node').id];
                if(dO && dI && dO.nodes[o.dataset.node] && dI.nodes[i.dataset.node]) {
                    try { dO.nodes[o.dataset.node].disconnect(dI.nodes[i.dataset.node]); } catch(e){}
                }
            }
            state.connections.splice(idx, 1);
            updateCableFlows();
            updatePortGuidance(true);
        }

        function selectCable(connection) {
            state.selectedConnection?.el?.classList.remove('selected');
            state.selectedConnection = connection || null;
            state.selectedConnection?.el?.classList.add('selected');
            renderCableProperties();
            updatePortGuidance();
        }

        function getCableBundleOffset(connection) {
            const outPort = document.getElementById(connection.outId);
            const inPort = document.getElementById(connection.inId);
            const outDevice = outPort?.closest('.device-node')?.id;
            const inDevice = inPort?.closest('.device-node')?.id;
            if (!outDevice || !inDevice) return 0;
            const pairKey = [outDevice, inDevice].sort().join('|');
            const bundle = state.connections.filter(item => {
                const from = document.getElementById(item.outId)?.closest('.device-node')?.id;
                const to = document.getElementById(item.inId)?.closest('.device-node')?.id;
                return from && to && [from, to].sort().join('|') === pairKey;
            });
            const position = bundle.indexOf(connection);
            return position < 0 ? 0 : (position - (bundle.length - 1) / 2) * 14;
        }

        function updateCables() {
            world.querySelectorAll('.device-type-pendantLamp').forEach(lamp=>{
                const drop=Math.round(lamp.offsetTop+80)+'px';
                if(lamp.style.getPropertyValue('--pendant-drop')!==drop)lamp.style.setProperty('--pendant-drop',drop);
            });
            Hardware.updateLightingDemo();
            updateStackFeet();
            state.connections.forEach(c => {
                const p1 = document.getElementById(c.outId); const p2 = document.getElementById(c.inId);
                c.el.dataset.slack=String(c.slack??5);
                let settle=0;
                if(c.seatStarted!=null){
                    const progress=Math.min(1,(performance.now()-c.seatStarted)/440);
                    if(progress>=1||powerMotionPreference.matches){
                        delete c.seatStarted;delete c.el.dataset.seating;delete c.el.dataset.seatEnd;delete c.el.dataset.seatOffset;delete c.el.dataset.seatOpacity;
                        c.seatAnimations?.forEach(animation=>animation.cancel());delete c.seatAnimations;
                    }else{
                        c.el.dataset.seating='true';c.el.dataset.seatEnd=c.seatEnd;
                        c.el.dataset.seatOffset=String(6*(1-Math.min(1,progress/.45))**3);
                        c.el.dataset.seatOpacity=String(Math.min(1,(1-progress)*4));
                        settle=Math.sin(progress*Math.PI*2)*3*(1-progress);
                    }
                }
                if(p1 && p2) drawCable(c.el, getPortCenter(p1), getPortCenter(p2), [], c.type, {x:0,y:settle}, getCableBundleOffset(c));
                applyCableAppearance(c);
            });
            updateBluetoothLinks();
        }

        // --- PROPAGAÇÃO REAL DE ENERGIA/SINAL PELA CADEIA DE ÁUDIO ---
        function isSourceRunning(dev) {
            return state.audioCtx?.state === 'running' && !!dev.powered && (RADIO_RECEIVERS.has(dev.type)?!!dev.state.radioOn:SOURCE_TYPES.has(dev.type)&&dev.state.playing===true&&(!SIGNAL_GENERATOR_TYPES.has(dev.type)||dev.state.signalLevel>0));
        }

        function updateStereoPowerMeters(dev) {
            if (!dev || !['powerStereo','powerVintage'].includes(dev.type)) return;
            ['L', 'R'].forEach(channel => {
                const peak = dev.meters?.peaks[channel === 'L' ? 0 : 1] || 0;
                const thresholds = [-48,-36,-24,-18,-12,-6,-3,0];
                const litCount = dev.powered ? thresholds.filter(db => audioDb(peak) >= db).length : 0;
                const leds = [...dev.el.querySelectorAll(`[data-meter="${channel}"] i`)];
                leds.forEach((led,index)=>Hardware.setLed(led,index>=leds.length-litCount));
            });
        }

        function updateCableFlows() {
            updateListeningControls();
            updateStackFeet();
            syncSourceSequencer();
            // Atualiza compatibilidade após trocas de sinal, entrada ou estado dos aparelhos.
            if (state.selectedConnection) updatePortGuidance(true);
            // Uma caixa mono ocupa o lado definido pela saída à qual está conectada.
            Object.values(state.devices).forEach(dev => {
                if (!dev.outputPan) return;
                if(dev.type==='spkActiveCompact'){dev.outputPan.pan.setTargetAtTime(0,state.audioCtx.currentTime,.015);return;}
                const cable = state.connections.find(connection => document.getElementById(connection.inId)?.closest('.device-node')?.id === dev.id);
                const output = cable && document.getElementById(cable.outId);
                const channel = output?.dataset.channel || (/R$/.test(output?.dataset.node || '') ? 'R' : /L$/.test(output?.dataset.node || '') ? 'L' : '');
                dev.outputPan.pan.setTargetAtTime(channel === 'L' ? -1 : channel === 'R' ? 1 : 0, state.audioCtx.currentTime, .015);
            });
            // Descobre quais aparelhos estão recebendo ou gerando sinal sonoro
            const activeDevices = new Set();
            const connectedDevices = new Set();
            
            // 1. Fontes de áudio geradoras (toca-discos, streamer, Bluetooth) que estão ligadas
            if (state.isPlaying) {
                Object.values(state.devices).forEach(dev => {
                    if (isSourceRunning(dev)) activeDevices.add(dev.id);
                });
            }

            // 2. Propagação através das conexões da cadeia (ex: Fonte -> Receiver -> Caixas/Sub/Fones)
            let changed = true;
            let iterations = 0;
            while (changed && iterations < Object.keys(state.devices).length) {
                changed = false;
                iterations++;
                state.connections.forEach(c => {
                    const outPortEl = document.getElementById(c.outId);
                    const inPortEl = document.getElementById(c.inId);
                    if (!outPortEl || !inPortEl) return;

                    const outDevEl = outPortEl.closest('.device-node');
                    const inDevEl = inPortEl.closest('.device-node');
                    if (!outDevEl || !inDevEl) return;

                    const devOut = state.devices[outDevEl.id];
                    const devIn = state.devices[inDevEl.id];
                    connectedDevices.add(devOut.id);
                    connectedDevices.add(devIn.id);

                    if(RADIO_RECEIVERS.has(devIn.type)){const selected=devIn.state.receiverInput||'line1',prefix=selected==='line1'?'in':selected;if(selected==='fm'||!new RegExp('^'+prefix+'[LR]$').test(inPortEl.dataset.node))return;}
                    if(devIn.type==='streamIntegrated'&&devIn.state.streamInput!=='line')return;
                    if(controlAmpConfig(devIn.type)&&!inPortEl.dataset.node.startsWith(devIn.state.integratedSource===3&&controlAmpConfig(devIn.type).phono!==false?'phono':'line'+devIn.state.integratedSource))return;
                    if(devIn.type==='preamp'&&!inPortEl.dataset.node.startsWith('in'+devIn.state.preSource))return;
                    if (MATRIX_TYPES.has(devIn.type) && !inPortEl.dataset.node.startsWith(`in${devIn.state.matrixInput}`)) return;
                    if (devIn.state.damage||!portCarriesSignal(devOut, outPortEl)) return;

                    // O seletor RCA só encaminha sinal para o par de saída escolhido.
                    if (!isSelectedSwitchOutput(devOut, outPortEl)) return;

                    // Se o aparelho de origem tem sinal e está ligado, ele transmite sinal pelo cabo
                    if (devOut && devOut.powered && activeDevices.has(devOut.id)) {
                        if (devIn && !activeDevices.has(devIn.id)) {
                            const needsPower = !PASSIVE_SPK.has(devIn.type) && !PASSIVE_SUB_TYPES.has(devIn.type) && !HP_TYPES.has(devIn.type);
                            if (!needsPower || devIn.powered) {
                                activeDevices.add(devIn.id);
                                changed = true;
                            }
                        }
                    }
                });
            }

            // 2b. Ligação sem fio Bluetooth (transmissor → fone)
            Object.values(state.devices).forEach(dev => {
                if (BT_TX_TYPES.has(dev.type) && dev.powered && activeDevices.has(dev.id) && dev.btPairedId) {
                    const hp = state.devices[dev.btPairedId];
                    if (hp&&!hp.state.damage&&!dev.state.damage) {
                        connectedDevices.add(dev.id);
                        connectedDevices.add(hp.id);
                        activeDevices.add(hp.id);
                    }
                }
            });

            Object.values(state.devices).forEach(dev => {
                const hasSignal = activeDevices.has(dev.id);
                const isConnected = connectedDevices.has(dev.id);
                dev.el.classList.toggle('device-connected', isConnected);
                dev.el.classList.toggle('device-disconnected', !isConnected);
                dev.el.classList.toggle('device-has-signal', hasSignal);
                dev.el.classList.toggle('device-no-signal', !hasSignal);
                dev.el.dataset.power = dev.el.querySelector('.power-btn') ? (dev.powered ? 'on' : 'off') : 'n/a';
                dev.el.dataset.connection = isConnected ? 'connected' : 'disconnected';
                dev.el.dataset.signal = hasSignal ? 'ativo' : 'sem sinal';
                updateStereoPowerMeters(dev);
                const deviceName = DEVICE_NAMES[dev.type] || dev.type;
                const powerLabel = dev.el.dataset.power === 'n/a' ? 'energia não aplicável' : (dev.powered ? 'ligado' : 'sem energia');
                dev.el.setAttribute('aria-label', `${deviceName}, ${powerLabel}, ${isConnected ? 'conectado' : 'desconectado'}, ${hasSignal ? 'com sinal' : 'sem sinal'}`);
            });

            // 3. Aplica a animação de pulso/fluxo APENAS nos cabos onde a corrente de áudio realmente está passando
            state.connections.forEach(c => {
                const outPortEl = document.getElementById(c.outId);
                const outDevEl = outPortEl ? outPortEl.closest('.device-node') : null;
                const devOut = outDevEl ? state.devices[outDevEl.id] : null;

                // O cabo só tem fluxo se a fonte estiver ligada e com áudio ativo alcançando essa saída
                const isCarryingSignal = !!(devOut && devOut.powered && activeDevices.has(devOut.id) && portCarriesSignal(devOut, outPortEl));
                c.el.classList.toggle('signal-idle', !isCarryingSignal);
                c.el.dataset.signal = isCarryingSignal ? 'ativo' : 'sem sinal';
                c.el.setAttribute('aria-label', `${c.el.querySelector('title')?.textContent || 'Cabo de áudio'} · ${isCarryingSignal ? 'sinal ativo' : 'sem sinal'}`);
                
                c.el.querySelectorAll('path').forEach(p => {
                    if (isCarryingSignal) {
                        p.classList.add('active');
                    } else {
                        p.classList.remove('active');
                    }
                });
            });
        }

        canvas.addEventListener('click', e => {
            const targetPath = e.target.closest('path');
            if (targetPath) {
                const group = targetPath.closest('.cable-group');
                const conn = state.connections.find(c => c.el === group || c.el === targetPath);
                if (conn) {
                    selectCable(conn);
                }
            } else if (e.target === canvas || e.target === world || e.target.id === 'cables-layer') {
                selectCable(null);
            }
        });

        let activeSpectrum = null;
        function disposeSpectrum() {
            if(!activeSpectrum)return;
            activeSpectrum.taps.forEach(tap=>{try{tap.source.disconnect(tap.analyzer);}catch{}tap.analyzer.disconnect();});
            activeSpectrum.silent.disconnect();activeSpectrum=null;
        }
        function spectrumInspectorHtml(dev) {
            return `<section class="spectrum-panel"><h3>Analisador de espectro</h3><div class="spectrum-selectors"><label>Canal<select id="spectrum-channel"><option value="L">Esquerdo · L</option><option value="R">Direito · R</option></select></label>${CROSSOVER_TYPES.has(dev.type)?'<label>Saída<select id="spectrum-band"><option value="Low">Graves</option><option value="Mid">Médios</option><option value="High">Agudos</option></select></label>':''}</div><div class="spectrum-legend"><span>━ Entrada</span><span>━ Saída</span></div><canvas id="audio-spectrum" role="img" aria-label="Espectro ao vivo comparando entrada e saída, de 20 Hz a 20 kHz e de menos 90 a zero dBFS"></canvas><p id="spectrum-description">Reproduza uma fonte conectada para comparar o áudio antes e depois do processamento.</p></section>`;
        }
        function setupSpectrum(dev) {
            disposeSpectrum();
            const canvas=document.getElementById('audio-spectrum');if(!canvas)return;
            const channel=document.getElementById('spectrum-channel').value;
            const band=document.getElementById('spectrum-band')?.value||'';
            const sourceNodes=[dev.nodes['in'+channel],dev.nodes['out'+band+channel]];
            if(sourceNodes.some(node=>!node))return;
            const silent=state.audioCtx.createGain();silent.gain.value=0;silent.connect(state.audioCtx.destination);
            const taps=sourceNodes.map(source=>{const analyzer=state.audioCtx.createAnalyser();analyzer.fftSize=8192;analyzer.smoothingTimeConstant=.65;analyzer.minDecibels=-100;analyzer.maxDecibels=0;source.connect(analyzer);analyzer.connect(silent);return{source,analyzer,data:new Float32Array(analyzer.frequencyBinCount)};});
            activeSpectrum={dev,canvas,silent,taps};
            drawSpectrum();
        }
        function drawSpectrum(){
            const spectrum=activeSpectrum;if(!spectrum)return;
            if(!spectrum.canvas.isConnected||!state.devices[spectrum.dev.id]){disposeSpectrum();return;}
            const canvas=spectrum.canvas,width=Math.max(220,canvas.clientWidth),height=170,ratio=window.devicePixelRatio||1;
            if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}
            const ctx=canvas.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.fillStyle='#10171c';ctx.fillRect(0,0,width,height);
            const left=30,right=12,top=14,bottom=25,w=width-left-right,h=height-top-bottom;
            const x=f=>left+Math.log10(f/20)/3*w,y=db=>top+(1-Math.max(0,Math.min(1,(db+90)/90)))*h;
            ctx.font='9px "Inter",sans-serif';ctx.lineWidth=1;
            [0,-30,-60,-90].forEach(db=>{ctx.strokeStyle='#34404a';ctx.beginPath();ctx.moveTo(left,y(db));ctx.lineTo(width-right,y(db));ctx.stroke();ctx.fillStyle='#8294a0';ctx.textAlign='right';ctx.fillText(String(db),left-5,y(db)+3);});
            [[20,'20'],[100,'100'],[1000,'1k'],[10000,'10k'],[20000,'20k']].forEach(([f,label])=>{ctx.strokeStyle='#25323b';ctx.beginPath();ctx.moveTo(x(f),top);ctx.lineTo(x(f),height-bottom);ctx.stroke();ctx.fillStyle='#8294a0';ctx.textAlign='center';ctx.fillText(label,x(f),height-9);});
            let inputPeak=-Infinity;
            spectrum.taps.forEach((tap,index)=>{
                tap.analyzer.getFloatFrequencyData(tap.data);
                ctx.strokeStyle=index?'#55c7ff':'#a3adb8';ctx.lineWidth=index?1.8:1.2;ctx.beginPath();
                for(let step=0;step<=180;step++){
                    const f=20*Math.pow(1000,step/180),next=20*Math.pow(1000,(step+1)/180);
                    const bin=f/(state.audioCtx.sampleRate/2)*tap.data.length,end=Math.min(tap.data.length-1,Math.ceil(next/(state.audioCtx.sampleRate/2)*tap.data.length));
                    let db=-100;for(let k=Math.max(1,Math.floor(bin));k<=end;k++)db=Math.max(db,tap.data[k]);
                    if(!index)inputPeak=Math.max(inputPeak,db);
                    const px=left+step/180*w,py=y(db);if(step===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
                }
                ctx.stroke();
            });
            const info=document.getElementById('spectrum-description');
            if(info)info.textContent=inputPeak>-85?'Comparação ao vivo · frequência em Hz e nível em dBFS. Cinza: entrada. Azul: saída.':'Sem áudio na entrada. Reproduza uma fonte conectada; o gráfico responde também à sua música.';
        }

        function connectProjectPorts(from,nodeOut,to,nodeIn){
            const output=from.el.querySelector(`[data-node="${nodeOut}"]`),input=to.el.querySelector(`[data-node="${nodeIn}"]`);
            if(!output||!input||!getPortCompatibility(output,input).compatible)throw new Error('Ligação do projeto incompatível.');
            const el=document.createElementNS('http://www.w3.org/2000/svg','g');el.setAttribute('class','cable-group');svgLayer.appendChild(el);
            const type=output.dataset.type;drawCable(el,getPortCenter(output),getPortCenter(input),[],type);
            state.connections.push({outId:output.id,inId:input.id,el,type,wps:[]});from.nodes[nodeOut].connect(to.nodes[nodeIn]);output.classList.add('connected');input.classList.add('connected');
        }

        function renderVisuals() {
            requestAnimationFrame(renderVisuals);
            if(state.connections.some(connection=>connection.seatStarted!=null))updateCables();
            updateRealtimePanels(performance.now());
            updateTransportMotion(performance.now());
            updateExtraDisplays(performance.now());
            updateIntegratedDisplays(performance.now());
            updateReceiverRadioDisplays(performance.now());
            updateCustomPowerDisplays(performance.now());

            // Simulação física de cabo com alta densidade e amortecimento de borracha
            if (isPatching && tempCableEl && startPort && dragPhysics.activeTarget) {
                const now=performance.now(),dt=Math.min(32,now-(dragPhysics.frameTime||now-16));
                dragPhysics.frameTime=now;
                const target=dragPhysics.activeTarget;
                const previous=dragPhysics.displayedTarget||target;
                const blend=matchMedia('(prefers-reduced-motion: reduce)').matches?1:1-Math.exp(-dt/(hoveredTargetPort?45:18));
                dragPhysics.displayedTarget=hoveredTargetPort?{x:previous.x+(target.x-previous.x)*blend,y:previous.y+(target.y-previous.y)*blend}:{...target};
                const springK = 0.095; // Força restauradora suave da gravidade
                const damping = 0.80;  // Amortecimento alto para dissipar o movimento sem efeito "elástico/mola"

                // Força restauradora em direção à posição de equilíbrio
                const forceX = -dragPhysics.swingX * springK;
                const forceY = -dragPhysics.swingY * springK;

                dragPhysics.swingVelX = (dragPhysics.swingVelX + forceX) * damping;
                dragPhysics.swingVelY = (dragPhysics.swingVelY + forceY) * damping;

                dragPhysics.swingX += dragPhysics.swingVelX;
                dragPhysics.swingY += dragPhysics.swingVelY;

                // Redesenha a oscilação a 60fps enquanto o cabo balança
                drawCable(
                    tempCableEl, 
                    getPortCenter(startPort), 
                    dragPhysics.displayedTarget, 
                    [], 
                    startPort.dataset.type, 
                    { x: dragPhysics.swingX, y: dragPhysics.swingY }
                );
            }

            // Animação de cones dos alto-falantes se a simulação de som estiver ativa
            {
                const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
                Object.values(state.devices).forEach(dev => {
                    if (dev.analyzer && dev.dataArray && dev.el.querySelector('.spk-woofer,.classic-box-woofer')) {
                        dev.analyzer.getByteFrequencyData(dev.dataArray);
                        let avg = dev.dataArray.slice(0, 10).reduce((a,b)=>a+b,0)/10;
                        const punch = (SUB_TYPES.has(dev.type) || PASSIVE_SUB_TYPES.has(dev.type)) ? .025 : .014;
                        const scale=1+(!reduced&&dev.powered!==false?(avg/255)*punch:0);
                        dev.el.querySelectorAll('.spk-woofer,.classic-box-woofer').forEach(w=>{w.style.transform=`${w.classList.contains('classic-box-woofer')?'translateX(-50%) ':''}scale(${scale})`;});
                    }
                });
            }
        }
        const PROJECT_FORMAT='audio-system-project',PROJECT_VERSION=1;
        let projectDatabase=null,projectPersistenceBlocked=false,projectRestoring=false,projectSaving=false,projectSaveAgain=false,lastProjectSignature='',knownAudioKeys=new Set();
        const projectTools=document.createElement('section');projectTools.className='project-tools';
        projectTools.innerHTML='<div class="project-file-actions"><button type="button" id="export-project">Exportar projeto</button><button type="button" id="import-project">Abrir projeto</button></div><input id="project-file" type="file" accept=".json,application/json" hidden><span id="project-save-status" class="sr-only" role="status" aria-live="polite"></span>';
        clearCatalogFooter.appendChild(projectTools);
        const projectStatus=(message,error=false)=>{const node=document.getElementById('project-save-status');node.textContent=message;node.classList.toggle('is-error',error);};
        const projectJSON=value=>JSON.parse(JSON.stringify(value),(key,item)=>['__proto__','constructor','prototype'].includes(key)?undefined:item);
        function projectCapture(){
            const devices=Object.values(state.devices).map(dev=>{
                const settings=projectJSON(dev.state);settings.playing=false;if(settings.tt)settings.tt.running=false;
                return {id:dev.id,type:dev.type,x:parseFloat(dev.el.style.left)||0,y:parseFloat(dev.el.style.top)||0,settings,powered:dev.powered,selectedSource:dev.selectedSource,grilleOff:dev.el.classList.contains('grille-off'),pairedId:dev.btPairedId||null,mediaKey:dev.audioBuffer?dev.mediaKey||null:null,fileName:dev.fileName||'',trackTitle:dev.trackTitle||'',position:dev.audioBuffer?sourcePosition(dev):(dev.demoOffset||0)+(dev.state.playing&&dev.demoStartedAt!=null?state.audioCtx.currentTime-dev.demoStartedAt:0)};
            });
            const connections=state.connections.map(c=>{const out=document.getElementById(c.outId),input=document.getElementById(c.inId);return {from:out?.closest('.device-node')?.id,out:out?.dataset.node,to:input?.closest('.device-node')?.id,input:input?.dataset.node,label:c.label||'',color:c.color||null,hidden:!!c.hidden,slack:c.slack??5};});
            const catalogScroll=equipmentCatalog.querySelector('.overflow-y-auto');
            return {format:PROJECT_FORMAT,version:PROJECT_VERSION,devices,connections,view:{...view},world:{width:world.offsetWidth,height:world.offsetHeight},ui:{
                environment:{...(state.environment||{preset:'near',intensity:0})},
                canvasGrid:state.canvasGrid||'dots',canvasTheme:state.canvasTheme||'scene',canvasFloor:state.canvasFloor||'wood',canvasFloorAuto:floorFollowsScene,canvasBackdrop:state.canvasBackdrop||'studio',canvasTime:state.canvasTime||'dusk',
                soundVolume:state.uiSoundVolume??.9,hideCables:!!state.hideCables,
                selected:[...state.selectedDeviceIds],selectedCable:state.connections.indexOf(state.selectedConnection),
                search:document.getElementById('equipment-search').value,catalogScroll:catalogScroll?.scrollTop||0,inspectorScroll:inspectorContent.scrollTop
            }};
        }
        function projectValidate(value){
            if(!value||value.format!==PROJECT_FORMAT||value.version!==PROJECT_VERSION||!Array.isArray(value.devices)||!Array.isArray(value.connections))throw new Error('Arquivo de projeto inválido ou versão incompatível.');
            if(value.devices.length>500||value.connections.length>4000)throw new Error('O projeto excede a quantidade de equipamentos ou cabos suportada.');
            const ids=new Set();
            value.devices.forEach(dev=>{
                if(!dev||typeof dev.id!=='string'||ids.has(dev.id)||!Object.hasOwn(DEVICE_NAMES,dev.type)||!Number.isFinite(dev.x)||!Number.isFinite(dev.y)||dev.x<0||dev.y<0||dev.x>20000||dev.y>20000)throw new Error('O projeto contém um equipamento inválido.');
                ids.add(dev.id);
                if(!dev.settings||typeof dev.settings!=='object'||Array.isArray(dev.settings))throw new Error('Configurações inválidas.');
                for(const key of ['eq','channelVolumes','matrixOutputs'])if(dev.settings[key]!=null&&!Array.isArray(dev.settings[key]))throw new Error('Ajustes de canais inválidos.');
                if(dev.settings.channelGain!=null&&(typeof dev.settings.channelGain!=='object'||Array.isArray(dev.settings.channelGain)))throw new Error('Ganho inválido.');
                if(dev.settings.tt!=null&&(typeof dev.settings.tt!=='object'||Array.isArray(dev.settings.tt)))throw new Error('Ajustes do toca-discos inválidos.');
                if(dev.mediaKey!=null&&typeof dev.mediaKey!=='string')throw new Error('Referência de áudio inválida.');
            });
            value.connections.forEach(c=>{if(!c||!ids.has(c.from)||!ids.has(c.to)||typeof c.out!=='string'||typeof c.input!=='string')throw new Error('O projeto contém uma conexão inválida.');});
            if(value.ui?.selected!=null&&!Array.isArray(value.ui.selected))throw new Error('Seleção inválida.');
            return value;
        }
        function openProjectDatabase(){
            return new Promise((resolve,reject)=>{
                if(!window.indexedDB){reject(new Error('Armazenamento de áudio indisponível.'));return;}
                const request=indexedDB.open('audio-system-local-project',1);
                request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects');if(!db.objectStoreNames.contains('audio'))db.createObjectStore('audio');};
                request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>db.close();resolve(db);};request.onerror=()=>reject(request.error);request.onblocked=()=>reject(new Error('Feche outras abas deste programa e tente novamente.'));
            });
        }
        const dbRead=(store,key)=>new Promise((resolve,reject)=>{const request=projectDatabase.transaction(store).objectStore(store).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
        const dbKeys=()=>new Promise((resolve,reject)=>{const request=projectDatabase.transaction('audio').objectStore('audio').getAllKeys();request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
        async function saveLocalProject(force=false){
            if(projectRestoring||projectPersistenceBlocked)return;
            if(projectSaving){projectSaveAgain=true;return;}
            if(!force&&(isPatching||document.querySelector('.equipment-dragging')))return;
            const snapshot=projectCapture(),signature=JSON.stringify(snapshot);
            snapshot.savedAt=Date.now();
            if(!force&&signature===lastProjectSignature)return;
            projectSaving=true;projectStatus('Salvando neste navegador…');
            try{
                if(!projectDatabase)throw new Error('Banco local indisponível.');
                const used=new Set(snapshot.devices.map(dev=>dev.mediaKey).filter(Boolean));
                const media=new Map(Object.values(state.devices).filter(dev=>dev.mediaBlob&&dev.mediaKey).map(dev=>[dev.mediaKey,dev.mediaBlob]));
                await new Promise((resolve,reject)=>{
                    const transaction=projectDatabase.transaction(['projects','audio'],'readwrite'),audio=transaction.objectStore('audio');
                    transaction.objectStore('projects').put(snapshot,'current');
                    media.forEach((blob,key)=>{if(used.has(key)&&!knownAudioKeys.has(key))audio.put(blob,key);});
                    knownAudioKeys.forEach(key=>{if(!used.has(key))audio.delete(key);});
                    transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error||new Error('Salvamento cancelado.'));
                });
                knownAudioKeys=used;lastProjectSignature=signature;
                try{localStorage.setItem('audio-system-project-fallback',JSON.stringify(snapshot));}catch{}
                projectStatus('Salvo neste navegador · músicas incluídas');
            }catch(error){
                try{localStorage.setItem('audio-system-project-fallback',JSON.stringify(snapshot));projectStatus('Configurações salvas; áudio não confirmado. Exporte uma cópia.',true);}catch{projectStatus('Não foi possível salvar. Exporte o projeto para não perder a montagem.',true);}
            }finally{projectSaving=false;if(projectSaveAgain){projectSaveAgain=false;saveLocalProject();}}
        }
        function applySavedDevice(dev,saved){
            const clean=projectJSON(saved.settings||{}),tt=clean.tt;delete clean.tt;
            clean.damage=['speaker-level-overload','speaker-thermal-overload'].includes(clean.damage?.kind)?{kind:clean.damage.kind}:null;
            Object.assign(dev.state,clean);dev.state.playing=false;
            if(dev.type==='lightPoint'){syncLightPoint(dev);return;}
            if(dev.type==='pendantLamp')return;
            if(tt&&dev.state.tt)Object.assign(dev.state.tt,tt,{running:false});
            const s=dev.state,clamp=(number,min,max,fallback)=>typeof number==='number'&&Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
            updateKubaAppearance(dev);
            s.volume=clamp(s.volume,0,1,.8);s.bass=clamp(s.bass,-15,15,0);s.treble=clamp(s.treble,-15,15,0);s.balance=clamp(s.balance,-1,1,0);
            if(dev.syncRadio){s.receiverInput=RECEIVER_INPUTS.some(([key])=>key===s.receiverInput)?s.receiverInput:'line1';s.radioOn=s.receiverInput==='fm';s.radioFrequency=Math.round(clamp(s.radioFrequency,87.5,108,88)*10)/10;s.radioStation=snapFmStation(clamp(s.radioStation,89,106,98));if(s.radioOn){s.receiverInput='line1';s.radioOn=false;}dev.syncRadio();}
            if(dev.setPhoneVolume)dev.setPhoneVolume(s.volume);
            if(dev.setAmplifierVolume)dev.setAmplifierVolume(s.volume);
            if(dev.setSpeakerVolume)dev.setSpeakerVolume(s.volume);
            if(dev.setChannelGain)['L','R'].forEach(ch=>dev.setChannelGain(ch,clamp(s.channelGain?.[ch],0,1,DEFAULT_POWER_GAIN)));
            if(MIXER_TYPES.has(dev.type))Array.from({length:3},(_,i)=>setMixerVolume(dev,i,clamp(s.channelVolumes?.[i],0,1,.8)));
            if(dev.type==='headphoneAmp4')Array.from({length:4},(_,i)=>setHeadphoneAmp4Volume(dev,i,clamp(s.channelVolumes?.[i],0,1,.8)));
            if(EQ_TYPES.has(dev.type)){
                s.eq=GRAPHIC_EQ_FREQUENCIES.map((_,i)=>clamp(s.eq?.[i],-12,12,0));applyEqGains(dev);dev.setEqLevel(clamp(s.eqLevel,0,1,1));
                dev.el.querySelectorAll('[data-band]').forEach(slider=>{const index=Number(slider.dataset.band);slider.value=s.eq[index];slider.title=`${GRAPHIC_EQ_FREQUENCIES[index]} Hz · ${s.eq[index]} dB`;});
            }
            if(dev.type==='receiver'){
                dev.nodes.volR.gain.value=s.volume*(s.balance<0?1+s.balance:1);dev.nodes.volL.gain.value=s.volume*(s.balance>0?1-s.balance:1);
                ['L','R'].forEach(ch=>{dev.nodes['bass'+ch].gain.value=s.bass;dev.nodes['treble'+ch].gain.value=s.treble;});
                ['volume','bass','treble','balance'].forEach(key=>updateKnobAngle(dev,`[data-receiver-control="${key}"]`,s[key],key==='volume'?0:key==='balance'?-1:-15,key==='volume'||key==='balance'?1:15));
                s.finish='vintage';dev.el.classList.remove('receiver-modern');
            }
            if(TURNTABLE_TYPES.has(dev.type)){dev.restoreLinear?.();dev.ttSetPitch(clamp(s.tt.pitch,-1,1,0));dev.ttSetOutput(s.tt.output==='phono'?'phono':'line');dev.refreshTurntable();}
            if(SIGNAL_GENERATOR_TYPES.has(dev.type))configureSignalGenerator(dev);
            if(dev.applyPreamp){s.preSource=clamp(s.preSource,1,4,1);dev.applyPreamp();}
            if(dev.applyTapeSettings){s.tapeVolume=clamp(s.tapeVolume,0,1,.8);s.tapeHiss=clamp(s.tapeHiss,0,100,35);s.tapeWow=clamp(s.tapeWow,1,100,35);dev.applyTapeSettings();}
            dev.applyStream?.();
            if(dev.updateMatrix)dev.updateMatrix();
            if(SELECTOR_TYPES.has(dev.type)){const source=saved.selectedSource==='B'?'B':'A';dev.el.querySelector(`[data-switch-source="${source}"]`)?.click();}
            updateBenchAppearance(dev);
            if(FURNITURE_TYPES[dev.type]){dev.el.dataset.material=Object.hasOwn(FURNITURE_MATERIALS,s.material)?s.material:'black';dev.el.dataset.back=String(s.hasBack!==false);}
            if(controlAmpConfig(dev.type)){s.integratedSource=clamp(s.integratedSource,0,3,0);s.integratedSource=Math.round(s.integratedSource);s.direct=!!s.direct;s.subLevel=clamp(s.subLevel,0,1,.8);s.subFrequency=clamp(s.subFrequency,40,200,80);s.preMuted=!!s.preMuted;s.preMono=!!s.preMono;s.preInvert=!!s.preInvert;dev.applyIntegrated();}
            dev.setLidOpen?.(!!dev.state.lidOpen);
            dev.setTrayOpen?.(!!dev.state.trayOpen);
            dev.el.classList.toggle('grille-off',!!saved.grilleOff);dev.el.querySelector('.speaker-grille')?.setAttribute('aria-label',saved.grilleOff?'Recolocar tela da caixa':'Remover tela da caixa');
            if((saved.powered===false||dev.state.damage)&&dev.powered)toggleDevicePower(dev);
            dev.el.classList.toggle('device-damaged',!!dev.state.damage);
            Hardware.sync(dev);
        }
        async function restoreLocalProject(snapshot,mediaReader){
            projectValidate(snapshot);projectRestoring=true;state.restoringProject=true;
            const shield=document.createElement('div');shield.className='project-restore-shield';shield.textContent='Restaurando montagem local…';document.body.appendChild(shield);
            const ids=new Map(),restored=[],warnings=[];
            try{
                stopViewMotion();cancelCableDrag();Object.values(state.devices).forEach(deleteDevice);
                world.style.removeProperty('min-width');world.style.removeProperty('min-height');
                const ui=snapshot.ui||{};floorFollowsScene=ui.canvasFloorAuto===true;setCanvasTheme(ui.canvasTheme);setCanvasGrid(ui.canvasGrid);setCanvasFloor(ui.canvasFloor);setCanvasTime(ui.canvasTime||(ui.canvasBackdrop==='night'?'night':'dusk'));setCanvasBackdrop(ui.canvasBackdrop);
                for(const saved of snapshot.devices){
                    const before=new Set(Object.keys(state.devices));createDevice(saved.type,Math.min(saved.x,world.offsetWidth-150),Math.min(saved.y,maxEquipmentBottom()-150));
                    const dev=Object.values(state.devices).find(item=>!before.has(item.id));if(!dev)throw new Error('Não foi possível restaurar um equipamento.');
                    ids.set(saved.id,dev.id);restored.push([saved,dev]);
                    const inset=dev.type==='lightPoint'?0:sceneSideInset(),bottom=dev.type==='lightPoint'?world.offsetHeight:maxEquipmentBottom();
                    if(saved.x>=inset&&saved.x+dev.el.offsetWidth<=world.offsetWidth-inset)dev.el.style.left=`${saved.x}px`;
                    if(saved.y>=0&&saved.y+dev.el.offsetHeight<=bottom){
                        const oldFloorBottom=world.offsetHeight-196;
                        dev.el.style.top=canvas.dataset.theme==='scene'&&canvas.dataset.floor!=='none'&&Math.abs(saved.y+dev.el.offsetHeight-oldFloorBottom)<1?`${bottom-dev.el.offsetHeight}px`:`${saved.y}px`;
                    }
                    applySavedDevice(dev,saved);
                    dev.fileName=typeof saved.fileName==='string'?saved.fileName:'';dev.trackTitle=typeof saved.trackTitle==='string'?saved.trackTitle:'';
                    if(saved.mediaKey){
                        try{const blob=await mediaReader(saved.mediaKey);if(!(blob instanceof Blob))throw new Error('Arquivo de áudio ausente.');const bytes=await blob.arrayBuffer(),metadata=dev.type==='streamIntegrated'?readStreamMetadata(bytes):null;dev.audioBuffer=await state.audioCtx.decodeAudioData(bytes);dev.mediaBlob=blob;dev.mediaKey=saved.mediaKey;dev.fileOffset=Math.max(0,Math.min(Number(saved.position)||0,dev.audioBuffer.duration));if(metadata)dev.setStreamMetadata(metadata);}
                        catch(error){warnings.push(dev.fileName||DEVICE_NAMES[dev.type]);dev.fileMessage='Não foi possível restaurar a música. Carregue o arquivo novamente.';}
                    }else dev.demoOffset=Math.max(0,Number(saved.position)||0);
                    refreshCdDisplay(dev);
                }
                const links=[];
                snapshot.connections.forEach(saved=>{
                    const from=state.devices[ids.get(saved.from)],to=state.devices[ids.get(saved.to)];
                    const output=from?.el.querySelector(`[data-node="${CSS.escape(saved.out)}"]`),input=to?.el.querySelector(`[data-node="${CSS.escape(saved.input)}"]`);
                    if(!output||!input||isPortOccupied(output)||isPortOccupied(input)||!getPortCompatibility(output,input).compatible){warnings.push('conexão incompatível');links.push(null);return;}
                    connectProjectPorts(from,saved.out,to,saved.input);const connection=state.connections.at(-1);
                    connection.label=typeof saved.label==='string'?saved.label.slice(0,60):'';connection.color=/^#[0-9a-f]{6}$/i.test(saved.color||'')?saved.color:undefined;connection.hidden=!!saved.hidden;connection.slack=Number.isFinite(saved.slack)?Math.max(0,Math.min(10,Math.round(saved.slack))):5;links.push(connection);
                });
                restored.forEach(([saved,dev])=>{const other=state.devices[ids.get(saved.pairedId)];if(other&&BT_TX_TYPES.has(dev.type)&&canPair(dev,other))pairDevices(dev,other);});
                setRoomSettings(ui.environment);
                cableVisibilityButton.setAttribute('aria-pressed',String(!!ui.hideCables));
                state.uiSoundVolume=typeof ui.soundVolume==='number'?Math.max(0,Math.min(1,ui.soundVolume)):.9;state.hideCables=!!ui.hideCables;
                const sound=document.getElementById('ui-sound-volume');sound.value=Math.round(state.uiSoundVolume*100);document.getElementById('ui-sound-value').textContent=state.uiSoundVolume?`${sound.value}%`:'desligados';uiEffectsGain?.gain.setValueAtTime(interactionGain(state.uiSoundVolume),state.audioCtx.currentTime);
                const search=document.getElementById('equipment-search');search.value=typeof ui.search==='string'?ui.search:'';search.dispatchEvent(new Event('input'));
                if(snapshot.view&&snapshot.devices.length){view.zoom=clampZoom(Number(snapshot.view.zoom)||1);view.x=Number(snapshot.view.x)||0;view.y=Number(snapshot.view.y)||0;}
                else view.y=Math.min(0,canvas.clientHeight-world.offsetHeight*view.zoom);
                applyView();
                setDeviceSelection((ui.selected||[]).map(id=>ids.get(id)).filter(Boolean));if(links[ui.selectedCable])selectCable(links[ui.selectedCable]);else selectCable(null);
                const scroll=equipmentCatalog.querySelector('.overflow-y-auto');if(scroll)scroll.scrollTop=Number(ui.catalogScroll)||0;inspectorContent.scrollTop=Number(ui.inspectorScroll)||0;
                updateCables();updateCableFlows();
                return warnings;
            }finally{shield.remove();state.restoringProject=false;projectRestoring=false;}
        }
        const readBlobDataURL=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
        document.getElementById('export-project').onclick=async()=>{
            const button=document.getElementById('export-project');button.disabled=true;
            try{
                await saveLocalProject(true);const snapshot=projectCapture(),embeddedAudio={};
                for(const dev of Object.values(state.devices)){if(dev.mediaKey&&dev.mediaBlob)embeddedAudio[dev.mediaKey]=await readBlobDataURL(dev.mediaBlob);}
                const url=URL.createObjectURL(new Blob([JSON.stringify({...snapshot,embeddedAudio})],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='audio-system-projeto.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);projectStatus('Cópia exportada com os arquivos de áudio.');
            }catch(error){projectStatus('Não foi possível exportar: '+error.message,true);}finally{button.disabled=false;}
        };
        document.getElementById('import-project').onclick=()=>document.getElementById('project-file').click();
        document.getElementById('project-file').onchange=async event=>{
            const file=event.target.files[0];if(!file)return;
            const previous=projectCapture(),previousAudio=new Map(Object.values(state.devices).filter(dev=>dev.mediaKey&&dev.mediaBlob).map(dev=>[dev.mediaKey,dev.mediaBlob]));let replacing=false;
            try{
                if(file.size>400*1024*1024)throw new Error('Arquivo de projeto muito grande.');
                const snapshot=projectValidate(JSON.parse(await file.text(),(key,value)=>['__proto__','constructor','prototype'].includes(key)?undefined:value));
                const audio=new Map();for(const [key,data] of Object.entries(snapshot.embeddedAudio||{})){
                    if(typeof data!=='string'||!/^data:[^,]*;base64,/.test(data))throw new Error('Áudio incorporado inválido.');
                    const base64=data.slice(data.indexOf(',')+1),binary=atob(base64),bytes=new Uint8Array(binary.length);for(let i=0;i<bytes.length;i++)bytes[i]=binary.charCodeAt(i);audio.set(key,new Blob([bytes]));
                }
                replacing=true;const warnings=await restoreLocalProject(snapshot,key=>Promise.resolve(audio.get(key)));projectPersistenceBlocked=false;await saveLocalProject(true);if(warnings.length)projectStatus('Projeto aberto; alguns áudios ou cabos precisam de revisão.',true);
            }catch(error){if(replacing){try{await restoreLocalProject(previous,key=>Promise.resolve(previousAudio.get(key)));}catch{projectPersistenceBlocked=true;}}projectStatus('Não foi possível abrir: '+error.message,true);}finally{event.target.value='';}
        };
        let projectSaveTimer;
        function scheduleProjectSave(){if(projectRestoring)return;clearTimeout(projectSaveTimer);projectSaveTimer=setTimeout(()=>saveLocalProject(),650);}
        ['pointerup','input','change','click','keyup'].forEach(type=>document.addEventListener(type,scheduleProjectSave,{capture:true,passive:true}));
        setInterval(()=>saveLocalProject(),2500);
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveLocalProject(true);});
        window.addEventListener('pagehide',()=>{if(projectRestoring||projectPersistenceBlocked)return;try{localStorage.setItem('audio-system-project-fallback',JSON.stringify({...projectCapture(),savedAt:Date.now()}));}catch{}saveLocalProject(true);});
        async function initializeProjectPersistence(){
            projectRestoring=true;
            const initialShield=document.createElement('div');initialShield.className='project-restore-shield';initialShield.textContent='Abrindo projeto local…';document.body.appendChild(initialShield);
            try{
                try{projectDatabase=await openProjectDatabase();knownAudioKeys=new Set(await dbKeys());}catch{}
                let snapshot=null;try{if(projectDatabase)snapshot=await dbRead('projects','current');}catch{}
                try{const raw=localStorage.getItem('audio-system-project-fallback'),backup=raw?JSON.parse(raw):null;if(backup&&(!snapshot||(backup.savedAt||0)>(snapshot.savedAt||0)))snapshot=backup;}catch{}
                if(snapshot){const warnings=await restoreLocalProject(snapshot,key=>projectDatabase?dbRead('audio',key):Promise.resolve(null));projectStatus(warnings.length?'Montagem restaurada; alguns áudios ou cabos precisam de revisão.':'Montagem restaurada · fontes pausadas',!!warnings.length);}
                else projectStatus(projectDatabase?'Salvamento automático local ativado.':'Armazenamento limitado; exporte uma cópia do projeto.',!projectDatabase);
                lastProjectSignature=JSON.stringify(projectCapture());
            }catch(error){projectPersistenceBlocked=true;projectStatus('Falha ao restaurar o projeto local. Você pode abrir uma cópia exportada.',true);}
            finally{initialShield.remove();projectRestoring=false;state.restoringProject=false;}
        }
        const settingsMenu=document.createElement('details');settingsMenu.className='app-settings';
        settingsMenu.innerHTML='<summary aria-label="Abrir configurações"><svg class="settings-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="7.1"/><circle cx="12" cy="12" r="2.7"/><path d="M12 1.8v3.1m0 14.2v3.1M1.8 12h3.1m14.2 0h3.1M4.3 4.3l2.2 2.2m11 11 2.2 2.2m0-15.4-2.2 2.2m-11 11-2.2 2.2"/></svg><span>Configurações</span></summary>';
        clearCatalogFooter.className='app-settings-content';
        const themeSection=document.createElement('section');themeSection.className='settings-theme-section';themeSection.appendChild(canvasThemeControl);themeSection.appendChild(canvasGridControl);themeSection.appendChild(canvasFloorControl);themeSection.appendChild(canvasBackdropControl);themeSection.appendChild(canvasTimeControl);setCanvasGrid('dots');
        const connectionHelpSetting=document.createElement('label');connectionHelpSetting.className='connection-help-setting';connectionHelpSetting.innerHTML='<input id="connection-help-enabled" type="checkbox"><span><strong>Orientação de conexões</strong><small>Mostra dicas e impede ligações incompatíveis. Desative para permitir erros quando os plugues encaixarem.</small></span>';
        const connectionHelpCheckbox=connectionHelpSetting.querySelector('input');connectionHelpCheckbox.checked=connectionGuidanceEnabled;themeSection.appendChild(connectionHelpSetting);
        connectionHelpCheckbox.addEventListener('change',()=>{connectionGuidanceEnabled=connectionHelpCheckbox.checked;hideContextHelp();updatePortGuidance(true);scheduleAppPreferencesSave();});
        clearCatalogFooter.insertBefore(themeSection,soundControls);
        setCanvasTheme(state.canvasTheme);

        const roomSection=document.createElement('section');roomSection.className='room-settings';
        roomSection.innerHTML='<label>Ambiente sonoro<select id="room-preset">'+Object.entries(ROOM_PRESETS).map(([key,value])=>`<option value="${key}">${value.name}</option>`).join('')+'</select></label><label for="room-intensity">Intensidade <output id="room-intensity-value">0/10</output></label><input id="room-intensity" type="range" min="0" max="10" step="1" value="0"><p>Reverberação estéreo na escuta final. Em zero, o áudio permanece seco.</p>';
        clearCatalogFooter.insertBefore(roomSection,soundControls);
        function setRoomSettings(settings){
            state.environment={preset:Object.hasOwn(ROOM_PRESETS,settings?.preset)?settings.preset:'near',intensity:Number.isFinite(settings?.intensity)?Math.max(0,Math.min(10,Math.round(settings.intensity))):0};
            roomSection.querySelector('#room-preset').value=state.environment.preset;roomSection.querySelector('#room-intensity').value=state.environment.intensity;roomSection.querySelector('#room-intensity-value').textContent=state.environment.intensity+'/10';applyRoomAudio();
        }
        roomSection.addEventListener('input',()=>{setRoomSettings({preset:document.getElementById('room-preset').value,intensity:Number(document.getElementById('room-intensity').value)});scheduleProjectSave();});
        setRoomSettings(state.environment);

        settingsMenu.appendChild(clearCatalogFooter);
        const topbarControls=document.getElementById('app-topbar').lastElementChild;
        topbarControls.appendChild(settingsMenu);
        topbarControls.appendChild(document.getElementById('inspector-sidebar-toggle'));
        topbarControls.insertBefore(document.querySelector('.canvas-tools'),settingsMenu);
        document.addEventListener('pointerdown',event=>{if(settingsMenu.open&&!settingsMenu.contains(event.target)&&!event.target.closest('.app-select-popup'))settingsMenu.open=false;});
        document.addEventListener('keydown',event=>{if(event.key==='Escape'&&settingsMenu.open){settingsMenu.open=false;settingsMenu.querySelector('summary').focus();}});
        function setupAppDropdowns(){
            const widgets=new WeakMap();let active=null,sequence=0,typeBuffer='',typeTime=0;
            const valueDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value'),indexDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'selectedIndex'),disabledDescriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'disabled');
            function close(restoreFocus=false){
                if(!active)return;const current=active;active=null;current.popup.remove();current.button.setAttribute('aria-expanded','false');current.button.removeAttribute('aria-activedescendant');if(restoreFocus&&current.button.isConnected)current.button.focus();
            }
            function position(){
                if(!active)return;const rect=active.button.getBoundingClientRect();if(!active.select.isConnected||!rect.width||!rect.height){close();return;}
                const viewport=window.visualViewport,width=viewport?.width||innerWidth,height=viewport?.height||innerHeight,offsetX=viewport?.offsetLeft||0,offsetY=viewport?.offsetTop||0;
                const popupWidth=Math.min(Math.max(rect.width,180),width-16),below=offsetY+height-rect.bottom-10,above=rect.top-offsetY-10,up=below<160&&above>below;
                active.popup.style.width=popupWidth+'px';active.popup.style.maxHeight=Math.max(48,Math.min(280,up?above:below))+'px';
                active.popup.style.left=Math.max(offsetX+8,Math.min(rect.left,offsetX+width-popupWidth-8))+'px';
                const popupHeight=active.popup.getBoundingClientRect().height;active.popup.style.top=(up?Math.max(offsetY+8,rect.top-popupHeight-5):rect.bottom+5)+'px';
            }
            function highlight(index){
                if(!active)return;const choices=active.choices;if(!choices.length)return;
                active.index=index;choices.forEach((choice,i)=>choice.classList.toggle('is-highlighted',i===index));
                const item=choices[index];if(item){active.button.setAttribute('aria-activedescendant',item.id);item.scrollIntoView({block:'nearest'});}
            }
            function choose(index){
                if(!active)return;const {select}=active,option=select.options[index];if(!option||option.disabled||option.parentElement.disabled)return;
                const button=active.button,changed=select.selectedIndex!==index;select.selectedIndex=index;close();
                if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
                if(button.isConnected)button.focus();
            }
            function buildOptions(){
                if(!active)return;const current=active;current.popup.replaceChildren();current.choices=[];
                [...current.select.options].forEach((option,index)=>{
                    const item=document.createElement('div');item.id=current.popup.id+'-'+index;item.className='app-select-option';item.setAttribute('role','option');item.setAttribute('aria-selected',String(index===current.select.selectedIndex));item.setAttribute('aria-disabled',String(option.disabled||!!option.parentElement.disabled));
                    const label=document.createElement('span');label.textContent=option.label||option.textContent;const check=document.createElement('span');check.className='app-select-check';check.textContent=index===current.select.selectedIndex?'✓':'';check.setAttribute('aria-hidden','true');item.append(label,check);
                    item.addEventListener('pointermove',event=>{if(event.pointerType!=='touch'&&item.getAttribute('aria-disabled')!=='true')highlight(index);});
                    item.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();choose(index);});current.choices.push(item);current.popup.appendChild(item);
                });
                position();highlight(Math.max(0,current.select.selectedIndex));
            }
            function open(widget){
                if(widget.select.disabled||!widget.select.options.length)return;
                close();const popup=document.createElement('div');popup.className='app-select-popup';popup.id=widget.popupId;popup.setAttribute('role','listbox');popup.setAttribute('aria-label',widget.button.getAttribute('aria-label')||'Opções');
                active={...widget,popup,index:widget.select.selectedIndex,choices:[]};document.body.appendChild(popup);widget.button.setAttribute('aria-expanded','true');buildOptions();widget.button.focus();
            }
            function enabledIndex(start,direction){
                const count=active.select.options.length;for(let n=0,index=start;n<count;n++,index=(index+direction+count)%count){const option=active.select.options[index];if(option&&!option.disabled&&!option.parentElement.disabled)return index;}return active.index;
            }
            function enhance(select){
                if(widgets.has(select)||select.multiple)return;
                const wrapper=document.createElement('span');wrapper.className='app-select';const button=document.createElement('button');button.type='button';button.className='app-select-trigger';button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');
                if(select.closest('#inspector-content'))Hardware.button(button,'ui');
                const popupId='app-select-list-'+(++sequence);button.setAttribute('aria-controls',popupId);
                const caption=document.createElement('span');caption.className='app-select-caption';const chevron=document.createElement('span');chevron.className='app-select-chevron';chevron.setAttribute('aria-hidden','true');button.append(caption,chevron);
                select.before(wrapper);wrapper.append(select,button);select.classList.add('app-select-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
                const widget={select,wrapper,button,caption,popupId};widgets.set(select,widget);
                const refresh=()=>{
                    const option=select.options[select.selectedIndex];caption.textContent=option?.label||option?.textContent||'Selecionar';button.disabled=select.disabled||!select.options.length;
                    const label=select.getAttribute('aria-label')||[...(select.labels||[])].map(label=>[...label.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).map(node=>node.textContent).join(' ').trim()).filter(Boolean).join(' ')||'Selecionar opção';button.setAttribute('aria-label',label);button.title=caption.textContent;
                    if(active?.select===select){if(button.disabled)close();else buildOptions();}
                };
                for(const [key,descriptor] of [['value',valueDescriptor],['selectedIndex',indexDescriptor],['disabled',disabledDescriptor]])Object.defineProperty(select,key,{configurable:true,get(){return descriptor.get.call(this);},set(value){descriptor.set.call(this,value);refresh();}});
                new MutationObserver(refresh).observe(select,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['disabled','selected','label','value','aria-label']});
                select.addEventListener('change',refresh);select.addEventListener('input',refresh);select.addEventListener('focus',()=>button.focus());
                button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();if(active?.select===select)close();else open(widget);});
                button.addEventListener('keydown',event=>{
                    if(event.ctrlKey||event.metaKey||event.altKey)return;
                    const key=event.key;
                    if(key==='Tab'){close();return;}
                    if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(key)){
                        event.preventDefault();event.stopPropagation();
                        if(!active||active.select!==select){open(widget);if(key==='Home')highlight(enabledIndex(0,1));else if(key==='End')highlight(enabledIndex(select.options.length-1,-1));return;}
                        if(key==='Enter'||key===' '){choose(active.index);return;}
                        const direction=key==='ArrowUp'?-1:1,start=key==='Home'?0:key==='End'?select.options.length-1:(active.index+direction+select.options.length)%select.options.length;highlight(enabledIndex(start,key==='End'?-1:direction));
                    }else if(key.length===1){
                        event.preventDefault();const now=performance.now();typeBuffer=now-typeTime>700?key:typeBuffer+key;typeTime=now;if(!active||active.select!==select)open(widget);if(!active)return;
                        const query=typeBuffer.toLocaleLowerCase('pt-BR'),index=[...select.options].findIndex(option=>!option.disabled&&!option.parentElement.disabled&&(option.label||option.textContent).toLocaleLowerCase('pt-BR').startsWith(query));if(index>=0)highlight(index);
                    }
                });refresh();
            }
            document.querySelectorAll('select').forEach(enhance);
            new MutationObserver(records=>{
                records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==Node.ELEMENT_NODE||node.closest('#audio-world'))return;if(node.matches('select'))enhance(node);node.querySelectorAll('select').forEach(enhance);}));
                if(active&&!active.select.isConnected)close();
            }).observe(document.body,{childList:true,subtree:true});
            document.addEventListener('pointerdown',event=>{if(active&&!active.wrapper.contains(event.target)&&!active.popup.contains(event.target))close();},true);
            document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){event.preventDefault();event.stopImmediatePropagation();close(true);}},true);
            document.addEventListener('focusin',event=>{if(active&&!active.wrapper.contains(event.target)&&!active.popup.contains(event.target))close();});
            document.addEventListener('scroll',event=>{if(active&&!active.popup.contains(event.target))close();},true);
            window.addEventListener('resize',()=>close());window.addEventListener('blur',()=>close());
            window.visualViewport?.addEventListener('resize',()=>close());
            document.addEventListener('click',event=>{const label=event.target.closest('label[for]');if(label&&!event.target.closest('button,input,.app-select')){const select=document.getElementById(label.htmlFor),widget=widgets.get(select);if(widget){event.preventDefault();widget.button.focus();}}});
        }
        setupAppDropdowns();

        initializeProjectPersistence();

        renderVisuals();
