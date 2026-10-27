/* Reusable physical controls, skins, bindings, and lighting for equipment. */
/* Shared hardware library. Equipment supplies values and audio setters, never its own drag physics. */
const Hardware = (() => {
    const freeze = records => Object.freeze(Object.fromEntries(Object.entries(records).map(([id,record])=>[id,Object.freeze(record)])));
    const knobs = freeze({
        inputDialSmall:{name:'Ganho de entrada em polímero fosco',width:38,height:38,finish:'interface',face:'#33343b',rim:'#101116',ink:'#f4f4f3'},
        outputDialLarge:{name:'Controle de saída texturizado',width:74,height:74,finish:'interface',face:'#383940',rim:'#74767d',ink:'#f4f4f3'},
        encoderDial:{name:'Controle de saída com LEDs',width:86,height:86,finish:'interface',face:'#3b3c3c',rim:'#101112',ink:'#ddd'},
        inputDial:{name:'Borracha canelada',width:38,height:38,finish:'interface',face:'#343539',rim:'#121315',ink:'#e0e0e2'},
        outputDial:{name:'Alumínio com indicador luminoso',width:84,height:84,finish:'interface',face:'#343539',rim:'#121315',ink:'#258bff'},
        inputDialCompact:{name:'Polímero compacto com indicador',width:30,height:30,finish:'interface',face:'#202321',rim:'#121514',ink:'#eee9dc'},
        monitorDial:{name:'Controle de monitor em alumínio escovado',width:54,height:54,finish:'interface',face:'#b7bbb5',rim:'#313735',ink:'#141a19'},
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
        interfaceRound:{width:18,height:18,radius:18,travel:.4,action:'latch',sound:'hwSoft'},
        interfacePill:{width:53,height:18,radius:12,travel:.4,action:'momentary',sound:'hwSoft'},
        interface:{width:34,height:14,radius:3,travel:.5,action:'latch',sound:'hwSoft'},
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
            '.linear-keys button':{width:130,height:28},
            '[data-linear-lift]':{width:84,height:28},
            '[data-linear-speed]':{width:40,height:28},
            '[data-linear-cue]':{width:40,height:28},
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
            "[data-tape-level]": {width:36, height:36},
            ".tape-transport button": {width:36, height:30},
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
    let knobReadout=null,readoutOwner=null,readoutTimer=null,fineControlPanel=null,fineControlOwner=null,knobHoldTimer=null;
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
    function showFineControl(el){
        const control=bindings.get(el);if(!control||!el.isConnected)return;
        if(!fineControlPanel){
            fineControlPanel=document.createElement('div');fineControlPanel.className='knob-fine-control';fineControlPanel.setAttribute('role','group');fineControlPanel.innerHTML='<output></output><input type="range" aria-label="Ajuste fino do knob">';document.body.appendChild(fineControlPanel);
            fineControlPanel.querySelector('input').addEventListener('input',()=>{
                const owner=fineControlOwner,active=bindings.get(owner);if(!owner||!active)return;
                const value=clamp(snap(Number(fineControlPanel.querySelector('input').value),active.min,active.max,active.fineStep),active.min,active.max);
                active.set(value);paintKnob(owner);fineControlPanel.querySelector('output').textContent=knobValueText(active);
            });
            fineControlPanel.querySelector('input').addEventListener('change',()=>{updateCableFlows();scheduleProjectSave();});
            document.addEventListener('pointerdown',event=>{if(fineControlPanel&&!fineControlPanel.hidden&&!fineControlPanel.contains(event.target)&&!fineControlOwner?.contains(event.target)){fineControlPanel.hidden=true;fineControlOwner=null;}},true);
            document.addEventListener('keydown',event=>{if(event.key==='Escape'&&fineControlPanel&&!fineControlPanel.hidden){fineControlPanel.hidden=true;fineControlOwner=null;}});
        }
        fineControlOwner=el;const range=fineControlPanel.querySelector('input');range.min=control.min;range.max=control.max;range.step=control.fineStep;range.value=control.get();fineControlPanel.querySelector('output').textContent=knobValueText(control);fineControlPanel.hidden=false;
        const rect=el.getBoundingClientRect(),panelWidth=Math.min(220,innerWidth-16);fineControlPanel.style.width=panelWidth+'px';fineControlPanel.style.left=Math.max(8,Math.min(innerWidth-panelWidth-8,rect.left+(rect.width-panelWidth)/2))+'px';fineControlPanel.style.top=Math.max(8,Math.min(innerHeight-96,rect.top-94))+'px';
        range.focus({preventScroll:true});
    }
    function paintKnob(el){
        const control=bindings.get(el);if(!control)return;
        const {get,min,max}=control,value=clamp(get(),min,max);
        el.setAttribute('role','slider');el.setAttribute('aria-valuemin',min);el.setAttribute('aria-valuemax',max);el.setAttribute('aria-valuenow',value);
        el.setAttribute('aria-valuetext',knobValueText(control));
        paintAccent(el,(value-min)/(max-min));
        if(el.dataset.interfaceKnob){
            el.style.setProperty('--ai-turn',(-135+(value-min)/(max-min)*270)+'deg');
            el.querySelectorAll('.ai-meter-dot').forEach((dot,i)=>dot.classList.toggle('is-lit',i<=Math.round((value-min)/(max-min)*18)));
        }
        el.style.setProperty('--hw-halo-value',`${(value-min)/(max-min)*270}deg`);
        if(readoutOwner===el)showKnobReadout(el,false);
    }
    function bindKnob(el,{get,set,min=0,max=1,step=null,activate,format,model,kind='knob',pointerToValue,width,height}){
        if(!el||bindings.has(el))return;
        if(kind==='knob')setControlSize(el,{width,height});
        const continuous=step==null&&kind==='linear',precision=step??(max-min)/(kind==='knob'?physics.detents:1000);
        const keyboardStep=step??(kind==='knob'?precision:min<0&&max>0 ? .1 : (max-min)/100);
        const detents=continuous?(min<0&&max>0?[0]:min===0&&max===1?[0,.5,1]:[min,max]):[];
        const control={get,set,min,max,step:precision,fineStep:step??(max-min)/1000,activate,format,model,kind};bindings.set(el,control);el.tabIndex=0;if(kind==='knob')el.dataset.hardwareKnob='';
        const change=(value,magnetic=false)=>{
            let next=clamp(snap(value,min,max,precision),min,max);
            const detent=magnetic?detents.find(point=>Math.abs(next-point)<(max-min)*.012):undefined;
            if(detent!==undefined)next=detent;
            el.classList.toggle('hw-at-detent',detents.some(point=>Math.abs(next-point)<1e-7));
            if(Math.abs(next-get())>1e-7){set(next);playUiSound(movementSound(el,kind));}paintKnob(el);if(el.dataset.interfaceKnob)el.dispatchEvent(new Event('interface-control-change',{bubbles:true}));
        };
        const commit=()=>{if(el.isConnected){updateCableFlows();scheduleProjectSave();}};
        el.addEventListener('pointerdown',event=>{
            if(event.button!==0||el.disabled)return;event.preventDefault();event.stopPropagation();activate?.();el.classList.add('hw-pointer-focus');el.focus({preventScroll:true});
            const pointer=event.pointerId,start=get(),x=event.clientX,y=event.clientY,zoom=Math.max(.1,view.zoom);let holdOpened=false;el.setPointerCapture(pointer);el.classList.add('hw-turning');showKnobReadout(el);
            clearTimeout(knobHoldTimer);knobHoldTimer=setTimeout(()=>{if(el.hasPointerCapture(pointer)){holdOpened=true;showFineControl(el);}},480);
            if(pointerToValue)change(pointerToValue(event),true);
            const move=e=>{if(e.pointerId===pointer){if(Math.hypot(e.clientX-x,e.clientY-y)>8&&!holdOpened)clearTimeout(knobHoldTimer);e.preventDefault();change(pointerToValue?pointerToValue(e):start+((y-e.clientY)+(e.clientX-x)*.35)*(max-min)/(physics.travel*zoom),true);}};
            const finish=e=>{if(e?.pointerId!=null&&e.pointerId!==pointer)return;clearTimeout(knobHoldTimer);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',finish);el.removeEventListener('pointercancel',finish);el.removeEventListener('lostpointercapture',finish);window.removeEventListener('blur',finish);releases.delete(el);el.classList.remove('hw-turning');if(el.hasPointerCapture(pointer))el.releasePointerCapture(pointer);hideKnobReadout();if(holdOpened&&fineControlPanel){fineControlPanel.querySelector('input').focus({preventScroll:true});}commit();};
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
        if(el.dataset.interfaceKnob)return el.dataset.interfaceKnob;
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
        if(el.matches('[data-tape-level]'))return 'silverFluted';
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
        if(model==='inputDialSmall'||model==='inputDialCompact'||model==='outputDial'){
            const halo=document.createElementNS('http://www.w3.org/2000/svg','svg');halo.classList.add('ai-control-halo');halo.setAttribute('viewBox','0 0 100 100');halo.setAttribute('aria-hidden','true');
            halo.innerHTML='<path d="M19 81a44 44 0 1 1 62 0"/>';el.appendChild(halo);
        }
        if(model==='encoderDial'){
            const ring=document.createElementNS('http://www.w3.org/2000/svg','svg');ring.classList.add('ai-control-leds');ring.setAttribute('viewBox','0 0 100 100');ring.setAttribute('aria-hidden','true');
            for(let i=0;i<19;i++){const a=(-135+i*15)*Math.PI/180,dot=document.createElementNS(ring.namespaceURI,'circle');dot.setAttribute('cx',50+Math.sin(a)*46);dot.setAttribute('cy',50-Math.cos(a)*46);dot.setAttribute('r','1.7');dot.classList.add('ai-meter-dot');ring.appendChild(dot);}el.appendChild(ring);
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
        }else if(model.startsWith('interface')){el.classList.add('hw-interface-key');}
        else if(spec.action==='rocker')skinRocker(el,model);
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
        if(AudioAdapterDesign.models[type]){AudioAdapterDesign.layout(el,type);return;}
        const interfaceDesign=typeof AudioInterfaceDesign!=='undefined'&&AudioInterfaceDesign.models[type];
        if(interfaceDesign){
            const {chassisHeight,chassisWidth}=interfaceDesign,width=sizes.widths[chassisWidth],height=sizes.heights[chassisHeight];el.dataset.chassis=chassisHeight;el.dataset.chassisWidth=chassisWidth;
            if(type==='audioInterface1')el.style.setProperty('--ai-panel-scale',Math.min((width-10)/(interfaceDesign.width-10),(height-10)/(interfaceDesign.height-10)));
            el.style.setProperty('--chassis-height',height+'px');el.style.setProperty('--chassis-width',width+'px');
            for(const [key,value]of Object.entries({width,'min-width':width,'max-width':width,height,'min-height':height,'max-height':height}))el.style.setProperty(key,value+'px','important');
            return;
        }
        if(type==='streamIntegrated'){
            el.dataset.chassis='high';el.style.setProperty('--chassis-height',sizes.heights.high+'px');
            for(const key of ['height','min-height','max-height'])el.style.setProperty(key,sizes.heights.high+'px','important');
            return;
        }
        if(['prePrecision','preGlass'].includes(type))return;
        if(type==='hardwareDemo'||FURNITURE_TYPES[type]||isListeningDevice({type})||(SOURCE_TYPES.has(type)&&!SIGNAL_GENERATOR_TYPES.has(type)&&!['btReceiverA','cdPlayer','streamer',...CAPTURE_INTERFACE_TYPES].includes(type)))return;
        const compact=!!INTERFACE_DEVICES[type]||['headphoneAmp','headphoneAmpModern','btTransmitterPro','btReceiverA',...CAPTURE_INTERFACE_TYPES].includes(type)&&type!=='audioInterface4';
        const height=type==='powerValve'?'high':type==='audioInterface4'||INTEGRATED_AMPS[type]||CUSTOM_PREAMPS[type]||CUSTOM_POWER_AMPS[type]||RADIO_RECEIVERS.has(type)||MIXER_TYPES.has(type)||EQ_TYPES.has(type)||BENCH_METER_TYPES.has(type)||SIGNAL_GENERATOR_TYPES.has(type)?'medium':'low';
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
        if(dev.type!=='hardwareDemo')mountLightingDemo(dev.el);
        sync(dev);
    }
    const lightingProjectedParts='.hw-knob,.hw-button,.hw-linear,.port,.pre-handle,.dual-handle,.bench-handle,.graphic-eq-handle,.mixer-rack-handle,[data-lighting-relief]';
    function mountLightingDemo(device){
        const furniture=device.classList.contains('furniture-node');
        const controls=[...device.querySelectorAll(lightingProjectedParts)].filter(control=>control.getClientRects().length);
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
        });
        if(!furniture&&!device.querySelector(':scope > .lighting-incident-overlay')){
            const overlay=document.createElement('div');overlay.className='lighting-incident-overlay';overlay.setAttribute('aria-hidden','true');device.appendChild(overlay);
        }
        mountLightingSilhouette(device);
        updateLightingDemo();
    }
    function mountLightingSilhouette(device){
        if(!device.matches('.device-type-powerValve,.device-type-turntable,.device-type-turntableVintage,.device-type-turntableLinear,.device-type-streamIntegrated,.headphone-equipment,.floorstanding-speaker,.bookshelf-speaker')&&!device.querySelector('.sp-cab,.classic-box-cab'))return;
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
            device.querySelectorAll('.stream-housing,.stream-heat-sink,.stream-glass,.stream-service-rail,[data-stream-volume]').forEach(part=>fill(box(part),3));
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
        }else if(device.querySelector('.classic-box-cab')){
            fill(box(device.querySelector('.classic-box-cab')),3);
            const stand=device.querySelector('.classic-box-base');
            if(stand){const rect=box(stand);ctx.save();ctx.translate(rect.x,rect.y);ctx.scale(rect.width/244,rect.height/27);stand.querySelectorAll('[data-stand-silhouette]').forEach(part=>ctx.fill(new Path2D(part.getAttribute('d'))));ctx.restore();}
        }else if(device.classList.contains('floorstanding-speaker')||device.classList.contains('bookshelf-speaker')||device.querySelector('.sp-cab')){
            device.querySelectorAll('.sp-cab,.bookshelf-cabinet,.tower-cabinet,.tower-plinth,.tower-foot,.tower-top-tweeter,.shelf-top-tweeter').forEach(part=>fill(box(part),parseFloat(getComputedStyle(part).borderTopLeftRadius)||3));
        }else if(device.classList.contains('device-type-turntableLinear')){
            const art=device.querySelector('.linear-art');
            if(art){
                const rect=box(art),unitX=rect.width/660,unitY=rect.height/252;
                const part=(x,y,w,h,r=0)=>fill({x:rect.x+x*unitX,y:rect.y+y*unitY,width:w*unitX,height:h*unitY},r);
                part(4,122,652,116,3);
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
    let lightingDemoDirty=false;
    const lightingGeometry=new WeakMap();
    let furnitureLightingGeometry={key:'',items:[]};
    let floorShadowKey='';
    function elementWorldPosition(element){const position=state.devices[element.id]?.dragVisualPosition;return position||{x:element.offsetLeft,y:element.offsetTop};}
    function positionedSceneLights(scene,time,world){
        const imageDrop=parseFloat(world.style.getPropertyValue('--room-image-drop'))||0;
        const horizonShift=parseFloat(world.style.getPropertyValue('--room-horizon-shift'))||0;
        return RoomScenes.lights(scene,time).map(source=>{
            const depth=source.layer==='near'?'near':source.layer==='mid'?'mid':'far';
            const farX=parseFloat(world.style.getPropertyValue(`--room-${depth}-x`))||0;
            const farY=parseFloat(world.style.getPropertyValue(`--room-${depth}-y`))||0;
            const scale=parseFloat(world.style.getPropertyValue(`--room-${depth}-scale`))||1;
            const rawX=world.offsetWidth*(-.06+1.12*(240+source.cx*.8)/2400);
            const rawY=world.offsetHeight*(-.1+1.1*(268+source.cy*.8)/1600);
            return {...source,x:world.offsetWidth/2+(rawX-world.offsetWidth/2)*scale+farX,y:world.offsetHeight+(rawY-world.offsetHeight)*scale+farY+imageDrop+horizonShift,width:source.w*.8*1.12*world.offsetWidth/2400*scale,height:source.h*.8*1.1*world.offsetHeight/1600*scale,reach:2100*world.offsetWidth/2736};
        });
    }
    function positionedObjectLights(world){
        const worldRect=world.getBoundingClientRect(),scale=worldRect.width/world.offsetWidth;
        if(!scale)return [];
        const bench=[...world.querySelectorAll('.device-type-furnitureTable .bench-decoration-lamp')].map(lamp=>{
            const owner=lamp.closest('.device-node'),rect=staticLightRect(lamp,owner,worldRect,scale);
            return {id:owner.id,x:rect.x+rect.width*135/284,y:rect.y+rect.height*187/656,width:110,height:24,shape:'bar',fixture:'table',rgb:[255,205,105],strength:1.45,elevation:135,reach:1100,shade:{opening:1.22,penumbra:.24}};
        });
        const pendants=[...world.querySelectorAll('.device-type-pendantLamp .pendant-filament')].map(filament=>{
            const rect=filament.getBoundingClientRect(),owner=filament.closest('.device-node');
            return {id:owner.id,x:(rect.left+rect.width/2-worldRect.left)/scale,y:(rect.top+rect.height/2-worldRect.top)/scale,width:28,height:36,shape:'point',fixture:'pendant',rgb:[255,192,82],strength:1.9,elevation:220,reach:1550,shade:{opening:1.2,penumbra:.2},animated:true};
        });
        const wallLamps=[...world.querySelectorAll('.wall-lamp-node .wall-lamp-filament')].map(filament=>{
            const owner=filament.closest('.wall-lamp-node'),rect=staticLightRect(filament,owner,worldRect,scale),model=owner.dataset.lampModel;
            return {id:owner.id,x:rect.x+rect.width/2,y:rect.y+rect.height/2,width:26,height:32,shape:'point',fixture:model,rgb:model==='cage'?[255,194,110]:[255,200,123],strength:model==='bare'?1.55:model==='dome'?1.75:1.35,elevation:165,reach:1300,...(model==='dome'?{shade:{opening:1.18,penumbra:.25}}:{})};
        });
        return [...bench,...pendants,...wallLamps];
    }
    const staticLightGeometry=new WeakMap();
    function staticLightRect(element,owner,worldRect,scale){
        const world=owner.closest('#audio-world');
        const wallParallax=owner.classList.contains('wall-lamp-node')&&world?['--room-far-x','--room-far-y','--room-far-scale','--room-horizon-shift'].map(name=>world.style.getPropertyValue(name)).join('|'):'';
        const position=elementWorldPosition(owner),key=position.x+'|'+position.y+'|'+owner.offsetWidth+'|'+owner.offsetHeight+'|'+wallParallax;
        const cached=staticLightGeometry.get(element);
        if(cached?.key===key)return cached.rect;
        const box=element.getBoundingClientRect();
        const rect={x:(box.left-worldRect.left)/scale,y:(box.top-worldRect.top)/scale,width:box.width/scale,height:box.height/scale};
        staticLightGeometry.set(element,{key,rect});return rect;
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
        lightingDemoDirty=true;
        window.dispatchEvent(new Event('audio-lighting-dirty'));
    }
    function renderLightingDemo(){if(!lightingDemoDirty)return;lightingDemoDirty=false;paintLightingDemo();}
    function paintFloorShadows(world,roomLights,equipment){
        const layer=world.querySelector(':scope > .room-floor-shadows'),canvas=document.getElementById('canvas');
        if(!layer)return;
        if(canvas.dataset.theme!=='scene'||canvas.dataset.floor==='none'){
            if(floorShadowKey){layer.getContext('2d').clearRect(0,0,layer.width,layer.height);floorShadowKey='';}
            return;
        }
        const furniture=[...world.querySelectorAll('.furniture-node')].map(el=>({...elementWorldPosition(el),el,width:el.offsetWidth,height:el.offsetHeight,furniture:true}));
        const allCasters=[...furniture,...equipment.map(box=>({...box,furniture:false}))];
        const worldHeight=world.offsetHeight,visibleTop=worldHeight-313;
        const worldRect=world.getBoundingClientRect(),viewRect=canvas.getBoundingClientRect(),viewScale=worldRect.width/world.offsetWidth;
        const minX=(viewRect.left-worldRect.left)/viewScale-700,maxX=(viewRect.right-worldRect.left)/viewScale+700;
        const casters=allCasters.filter(box=>box.x+box.width>=minX&&box.x<=maxX&&box.y+box.height>=visibleTop-620);
        const lights=roomLights;
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
            ellipse(base.x,base.y,Math.max(18,radius*.72),box.furniture?19:11,(box.furniture ? .27 : .18)*heightFade);
            // A compact contact core anchors the object to the floor beneath it.
            ellipse(base.x,base.y+2,Math.max(12,Math.min(110,box.width*.22)),box.furniture?7:4,(box.furniture ? .30 : .25)*heightFade);
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
        const world=document.getElementById('audio-world');
        const clamp=(value,limit)=>Math.max(-limit,Math.min(limit,value));
        const incidentPosition=(source,origin,size)=>(Math.max(12,Math.min(88,(source-origin)/Math.max(1,size)*100))).toFixed(1)+'%';
        const viewport=document.getElementById('canvas').getBoundingClientRect();
        const furnitureBodies=[...world.querySelectorAll('.furniture-node .rack-body')];
        const sceneName=viewport&&document.getElementById('canvas').dataset.theme==='scene'?document.getElementById('canvas').dataset.backdrop:'';
        const sceneTime=document.getElementById('canvas').dataset.time;
        const fixtureEmitters=positionedObjectLights(world);
        const sceneEmitters=[...positionedSceneLights(sceneName,sceneTime,world),...fixtureEmitters];
        const lightKeyAt=(x,y,width,height)=>sceneTime+':'+sceneEmitters.filter(source=>{
            const dx=Math.max(0,Math.abs(source.x-x)-(source.width+width)/2);
            const dy=Math.max(0,Math.abs(source.y-y)-(source.height+height)/2);
            return Math.hypot(dx,dy)<(source.reach||2100);
        }).map(source=>{const step=source.animated?4:8;return source.id+','+Math.round(source.x/step)+','+Math.round(source.y/step);}).join(';');
        const furnitureKey=furnitureBodies.map(body=>{const node=body.closest('.furniture-node'),position=elementWorldPosition(node);return node.id+':'+position.x+':'+position.y;}).join('|');
        if(furnitureLightingGeometry.key!==furnitureKey){
            const worldRect=world.getBoundingClientRect(),worldScale=worldRect.width/world.offsetWidth;
            const rectInWorld=element=>{const rect=element.getBoundingClientRect();return{x:(rect.left-worldRect.left)/worldScale,y:(rect.top-worldRect.top)/worldScale,width:rect.width/worldScale,height:rect.height/worldScale};};
            furnitureLightingGeometry={key:furnitureKey,items:furnitureBodies.map(body=>{
                const visualParts=[...body.querySelectorAll('.furniture-part')].map(part=>({el:part,...rectInWorld(part)}));
                return {id:body.closest('.furniture-node').id,...rectInWorld(body),visualParts,
                    parts:visualParts.filter(part=>part.el.matches('.furniture-side,.furniture-shelf,.furniture-top')).map(part=>({...part,kind:part.el.classList.contains('furniture-side')?'side':part.el.classList.contains('furniture-top')?'top':'shelf'}))};
            })};
        }
        const furniture=furnitureLightingGeometry.items;
        const stackBoxes=[...world.querySelectorAll('.device-node:not(.furniture-node):not(.device-type-pendantLamp):not(.wall-lamp-node)')].filter(el=>el.style.visibility!=='hidden').map(el=>({...elementWorldPosition(el),el,width:el.offsetWidth,height:el.offsetHeight}));
        const stackTops=stackBoxes.filter(box=>box.width>=300&&(box.height<box.width*.8||box.el.classList.contains('device-type-tapeDeck')));
        paintFloorShadows(world,sceneEmitters,stackBoxes);
        world.querySelectorAll('.furniture-node.lighting-demo-target').forEach(node=>{
            const rect=node.getBoundingClientRect();
            if(rect.right<viewport.left||rect.left>viewport.right||rect.bottom<viewport.top||rect.top>viewport.bottom)return;
            const rack=furniture.find(item=>item.id===node.id);
            const position=elementWorldPosition(node),key=sceneName+'|'+lightKeyAt(position.x+node.offsetWidth/2,position.y+node.offsetHeight/2,node.offsetWidth,node.offsetHeight)+'|'+position.x+'|'+position.y+'|'+node.dataset.back;
            if(node.dataset.lightPaintKey===key)return;
            node.dataset.lightPaintKey=key;
            rack?.visualParts.forEach(({el:part,x,y,width,height})=>{
                const source=sceneEmitters.map(item=>sampleSceneLight(item,x+width/2,y+height/2)).sort((a,b)=>b.weight-a.weight)[0];
                part.style.setProperty('--demo-scene-light-strength',(source?.weight||0).toFixed(3));
                if(source){part.style.setProperty('--demo-scene-light-rgb',source.rgb.join(' '));part.style.setProperty('--demo-scene-light-x',incidentPosition(source.x,x,width));part.style.setProperty('--demo-scene-light-y',incidentPosition(source.y,y,height));}
            });
            if(rack){
                const source=sceneEmitters.map(item=>sampleSceneLight(item,rack.x+rack.width/2,rack.y+rack.height/2)).reduce((best,item)=>item.weight>(best?.weight||0)?item:best,null);
                drawFurnitureInteriorShadows(node,rack,source?.x||0,source?.y||0,source?.weight||0);
            }
        });
        document.querySelectorAll('#audio-world .lighting-demo-target').forEach(device=>{
            if(device.classList.contains('furniture-node'))return;
            const visibleRect=device.getBoundingClientRect();
            if(visibleRect.right<viewport.left||visibleRect.left>viewport.right||visibleRect.bottom<viewport.top||visibleRect.top>viewport.bottom)return;
            let geometry=lightingGeometry.get(device);
            const orientation=device.dataset.adapterRotation||'';
            if(!geometry||geometry.width!==device.offsetWidth||geometry.height!==device.offsetHeight||geometry.orientation!==orientation){
                const scale=visibleRect.width/device.offsetWidth;
                geometry={width:device.offsetWidth,height:device.offsetHeight,orientation,lastPosition:'',surfaces:[...device.querySelectorAll(':scope > .lighting-shadow-surface')].map(face=>{
                    const faceRect=face.getBoundingClientRect();
                    return {face,x:(faceRect.left-visibleRect.left)/scale,y:(faceRect.top-visibleRect.top)/scale,controls:[...face.querySelectorAll(lightingProjectedParts)].filter(control=>control.getClientRects().length).map(control=>{
                        const rect=control.getBoundingClientRect();
                        return {el:control,x:(rect.left+rect.width/2-visibleRect.left)/scale,y:(rect.top+rect.height/2-visibleRect.top)/scale,faceX:(rect.left+rect.width/2-faceRect.left)/scale,faceY:(rect.top+rect.height/2-faceRect.top)/scale,width:rect.width/scale,height:rect.height/scale,last:''};
                    })};
                })};
                lightingGeometry.set(device,geometry);
            }
            const {x:deviceX,y:deviceY}=elementWorldPosition(device);
            const centerX=deviceX+geometry.width/2,centerY=deviceY+geometry.height/2;
            const rack=furniture.find(item=>centerX>item.x+16&&centerX<item.x+item.width-16&&centerY>item.y+16&&centerY<item.y+item.height-16);
            const stackedAbove=stackTops.filter(upper=>upper.el!==device&&deviceY-upper.y-upper.height>=-.5&&deviceY-upper.y-upper.height<=20.5&&Math.min(deviceX+geometry.width,upper.x+upper.width)-Math.max(deviceX,upper.x)>=Math.min(geometry.width,upper.width)*.7);
            const stackKey=stackedAbove.map(upper=>upper.el.id+':'+upper.x+':'+upper.y).join('|');
            const positionKey=sceneName+'|'+lightKeyAt(centerX,centerY,geometry.width,geometry.height)+'|'+deviceX+'|'+deviceY+'|'+(rack?.id||'')+'|'+(rack?.x||0)+'|'+(rack?.y||0)+'|'+stackKey;
            if(geometry.lastPosition===positionKey)return;
            geometry.lastPosition=positionKey;
            const localScene=sceneEmitters.map(source=>sampleSceneLight(source,centerX,centerY)).sort((a,b)=>b.weight-a.weight);
            const shadowScene=localScene.find(source=>source.weight>.01);
            const shadowX=shadowScene?.x||0,shadowY=shadowScene?.y||0,shadowStrength=shadowScene?.weight||0;
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
                    const relief=Number(control.dataset.lightingRelief);
                    const height=Number.isFinite(relief)?Math.max(0,Math.min(24,relief)):handle?18:plug?1.8:slider?3:knob?(finish==='disc'?5:finish==='recessed'?7:finish==='halo'?13:11):['chromeLever','industrialToggle','powerLarge'].includes(buttonModel)?8:['flushMetal','membrane','plainKey'].includes(buttonModel)?2.5:5;
                    const maxProjection=handle?30:plug?Math.min(4,Math.min(width,controlHeight)*.4+1):Math.min(18,Math.min(width,controlHeight)*.8+4);
                    // The streamer's top dial sits behind the front rim, so it cannot cast onto the face.
                    if(!device.classList.contains('device-type-streamIntegrated')||!control.matches('[data-stream-volume]')){
                        localScene.slice(0,2).forEach(scene=>{
                            if(scene.weight<=.08)return;
                            const source=sampleSceneLight(scene,cx,cy);
                            let sceneX=(cx-source.x)*height/source.elevation,sceneY=(cy-source.y)*height/source.elevation;
                            const travel=Math.hypot(sceneX,sceneY),limit=Math.min(maxProjection,12);
                            if(travel>limit){sceneX*=limit/travel;sceneY*=limit/travel;}
                            frontShadows.push({x,y,width,height:controlHeight,sx:sceneX,sy:sceneY,knob:knob||(plug&&control.dataset.type!=='wire')||control.dataset.lightingShape==='round',plug,slider,handle,weight:scene.weight*.95,softness:scene.spread});
                        });
                    }
                    const highlightX=shadowScene?.x||cx,highlightY=shadowScene?.y||cy;
                    const direction=Math.max(70,Math.hypot(cx-highlightX,cy-highlightY));
                    const values=[(50+clamp((highlightX-cx)/direction,1)*34).toFixed(0)+'%',(50+clamp((highlightY-cy)/direction,1)*34).toFixed(0)+'%'];
                    const key=values.join('|');if(entry.last===key)return;
                    entry.last=key;
                    control.style.setProperty('--demo-highlight-x',values[0]);
                    control.style.setProperty('--demo-highlight-y',values[1]);
                });
            });
            if(frontShadows.length||device.querySelector(':scope > .lighting-control-shadow'))drawFrontControlShadows(device,geometry,frontShadows,0);
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
    return Object.freeze({knobs,buttons,controlSizes,setControlSize,buttonSounds,movementSounds,movementSound,sliders,leds,plugs,accents,sizes,physics,updateAccents,updateLightingDemo,renderLightingDemo,sceneLightAt,demoMarkup,bindDemo,sourceTransport,setButtonLabel,button:skinButton,bindKnob,bindLinear,slider,setLed,layout,mount,sync,dispose,inspector,plugMarkup});
})();
