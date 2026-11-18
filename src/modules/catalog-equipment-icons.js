/* Front-view artwork for the 56 × 46 catalog icons. Fine lines describe recessed details. */
const CatalogEquipmentIcons = (() => {
    const path = d => `<path d="${d}"/>`;
    const detail = d => `<path d="${d}" stroke-width="1.05"/>`;
    const rect = (x,y,w,h,r=0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
    const circle = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
    const dot = (x,y) => `<circle cx="${x}" cy="${y}" r=".85" fill="currentColor" stroke="none"/>`;
    const dots = (xs,y) => xs.map(x=>dot(x,y)).join('');
    const pair = (x,y) => circle(x-1.8,y,1)+circle(x+1.8,y,1);
    const pairs = (xs,y) => xs.map(x=>pair(x,y)).join('');
    const dial = (x,y,r) => circle(x,y,r)+detail(`M${x} ${y-r+1}v${r-1}`);
    const screen = (x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="currentColor" fill-opacity=".14"/>`;
    const meter = (x,y,w=10,h=8) => screen(x,y,w,h)+detail(`M${x+2} ${y+h-1.8}l${w*.45} -${h*.6}`);
    const chassis = (w,h,face,r=2,y=(46-h)/2) => {
        const x=(56-w)/2, bottom=y+h;
        return rect(x,y,w,h,r)+detail(`M${x+5} ${bottom}v2h4v-2m${w-18} 0v2h4v-2`)+face;
    };
    const rails = (y,bottom) => detail(`M8 ${y}V${bottom}M48 ${y}V${bottom}`);
    const vents = (xs,y,h) => detail(xs.map(x=>`M${x} ${y}v${h}`).join(''));
    const faders = (xs,top,bottom,levels) => detail(xs.map((x,i)=>`M${x} ${top}V${bottom}m-2 ${levels[i]-bottom}h4`).join(''));
    const driver = (x,y,r,cap=r*.42) => circle(x,y,r)+circle(x,y,cap);
    const bluetooth = (x,y) => detail(`M${x} ${y-4}v8l3-2.6-6-4.8m0 4.8 6-4.8-3-2.6`);
    const rackShelves = (width,top,height,count) => {
        const x=(56-width)/2, bottom=top+height;
        const shelves=Array.from({length:count-1},(_,i)=>`M${x+2} ${top+Math.round((i+1)*height/count)}h${width-4}`).join('');
        return rect(x,top,width,height,1)+detail(shelves+`M${x+3} ${bottom}v2m${width-6}-2v2`);
    };
    const headphones = (cups,band='M10 23v-2a18 18 0 0 1 36 0v2M14 21a14 14 0 0 1 28 0') =>
        path(band)+cups+detail('M13 36q1 6 11 6h8q10 0 11-6');
    const grille = (x,y,w,h,pattern) => rect(x,y,w,h,1)+detail(pattern);
    const plugBank = (xs,{y=25,keys=false,speakers=false}={}) => {
        const sockets = speakers
            ? xs.map(x=>rect(x-3,y-1.5,2,3,.5)+rect(x+1,y-1.5,2,3,.5)).join('')
            : pairs(xs,y);
        return sockets+(keys?xs.slice(1).map(x=>rect(x-2,y-7,4,2,.45)).join(''):'');
    };
    const reel = (x,y) => circle(x,y,9)+circle(x,y,2.1)+detail(`M${x-1} ${y-4}l-2-3m-1 9-3 2m10 0 2 2`);
    const lid = '<path d="M10 24V7h36v9" stroke-width="1.05" opacity=".55"/>';
    const platter = (height=3) => rect(7,28-height,29,height,.5)+detail(`M21 ${26-height}v2`);
    const bentArm = path('M44 28V19H38l-3 3h-3')+detail('M32 22v1.5m12-4.5h3');
    const turntableDeck = (height,arm,controls,record=platter()) =>
        lid+record+arm+chassis(48,height,controls,1.5,28);

    return Object.freeze({
        // Sources, capture interfaces and Bluetooth.
        cdPlayer:chassis(48,17,
            path('M9 22h15')+screen(27,18,11,8)+detail('M29 21h7m-7 2.5h4')+dots([42,46],22)),
        streamer:chassis(48,15,
            screen(8,19,20,7)+detail('M10 23h9m2 0h3M32 22h3')+pair(42,23)+dot(48,23)),
        streamIntegrated:chassis(50,26,
            detail('M19 10V7h18v3M7 13v17m42-17v17M5 30h46')+
            screen(13,14,30,13)+rect(16,17,6,6,.6)+detail('M25 18h14m-14 3h11m-11 3h6')+dots([9,46],19)+pairs([13,28,43],33)),
        tapeDeck:rect(8,3,40,39,2)+reel(18,15)+reel(38,15)+
            path('M18 25h20l-3 3H21zM8 30h40')+meter(30,33,6,6)+meter(39,33,6,6)+detail('M12 35h3m3 0h3m3 0h2M13 42v2m30-2v2'),
        turntable:turntableDeck(10,bentArm,
            rect(8,31,5,3,.6)+detail('M17 32.5h9m4-1.5v5m-2-3h4m8-4v8')+pair(46,34)),
        turntableVintage:turntableDeck(10,bentArm,
            detail('M7 29v8m42-8v8M17 32.5h9m4-1.5v5m-2-3h4m8-4v8')+rect(10,31,4,3,.6)+
            rect(34,31.5,3.5,2,.5)+pair(45,34)),
        turntableBelt:turntableDeck(5.5,path('M44 28V18l-12 4v1.5')+detail('M44 18h5'),
            rect(8,29.6,3,2,.5)+pair(45,31),platter(4)+detail('M8 26h27')),
        turntableDirect:turntableDeck(9,
            path('M44 28V18h-2q-2 0-3 2t-3 2h-4')+detail('M32 22v1.5m12-5.5h3'),
            circle(8.5,32.5,1.1)+rect(13,31,4,2.5,.5)+detail('M21 32h2m3 0h2m3 0h2m4-1v4m-2-2h4')+
            pair(46,34),platter(5)+detail('M10 25.5h1m3 0h1m3 0h1m3 0h1m3 0h1m3 0h1')),
        turntableAutomatic:turntableDeck(10,path('M44 28V19l-12 3.5v1.5')+detail('M44 19h3'),
            detail('M8 31.5h3m3 0h3m15 0h3m3 0h3m3 0h3M8 35h6')+circle(47,35,1)),
        turntableLinear:turntableDeck(13,
            path('M7 16h38m-37 0v9m36-9v12')+rect(31,14,6,4,1)+detail('M33 18v5m2-5v5'),
            screen(8,31,9,3.5)+pair(12.5,37)+detail('M22 32h2m3 0h2m3 0h4m3 0h2m3 0h2M25 36h8m3 0h8M7 39h42')),
        audioInterface1:chassis(48,20,
            rect(6,15,44,16,2)+dial(11,22,2.1)+dial(19,22,2.1)+dial(28,22,3.6)+dot(37,22)+circle(44,22,2.1)+dot(44,27),3),
        audioInterface2:chassis(36,26,
            dial(28,22,6)+dot(16,21)+circle(40,22,1.4)+pair(28,32),3),
        audioInterface3:chassis(40,25,
            dial(17,22,5)+dot(28,21)+dial(40,20,2.2)+circle(40,27,1.2)+pair(28,31),3),
        audioInterface4:chassis(50,20,
            detail('M6 16h44')+dial(16,23,3.5)+pair(16,29)+dot(29,18)+
            circle(38,23,2)+circle(44,23,2)+dots([38,44],28),1.5),
        btReceiverA:chassis(44,22,
            screen(10,15,31,8)+bluetooth(15,19)+detail('M21 20h16')+pair(15,28)+path('m33 26 3 2-3 2z')+dot(45,23)),
        btTransmitterPro:chassis(46,22,
            screen(9,15,33,8)+bluetooth(14,19)+detail('M20 20h17')+pair(14,28)+rect(32,26,9,4,.8)+dot(46,23)),

        // Preamplifiers and receivers.
        preClassic:chassis(50,24,
            rails(12,34)+detail('M8 28h40')+
            [12,19,37,44].map(x=>circle(x,18,2)+circle(x,24,2)).join('')+
            faders([25,28,31],20,26,[23,22,24])+pairs([13,23,34,44],31),1),
        preControl:chassis(48,22,
            dial(10,21,2.8)+screen(17,15,15,9)+detail('M20 20h8m-7 7h9')+
            dial(38,21,3.3)+dots([44,47],18)+dots([44,47],23)+pairs([12,23,35,45],30)),
        prePrecision:chassis(50,26,
            meter(7,14,13,13)+dial(25,18,2.2)+dial(33,18,3.4)+dial(43,19,5)+
            faders([26,34],24,28,[26,26])+pairs([11,22,34,46],32)),
        preAurenne220:chassis(50,30,
            rails(9,37)+screen(10,11,36,12)+detail('M10 20h36m-28-9v7m7-7v7m7-7v7m7-7v7M12 21h32')+
            dial(23,29,4)+dial(34,29,4)+faders([13,16,40,43],26,33,[28,30,28,30])+dots([13,17,42],35),1),
        preamp:chassis(48,17,
            pairs([11,18],24)+faders([27,34,41],19,26,[22,21,24])+dot(47,25)),
        preDisplay:chassis(48,22,
            dial(10,21,3)+screen(17,15,17,9)+detail('M20 20h10m-10 6h11')+dial(40,21,4.3)+dots([46,48],16)+pairs([12,22,33,45],30)),
        preGlass:chassis(50,24,
            rect(6,13,44,14,1)+[11,20,28,36,45].map(x=>circle(x,20,x===11||x===45?3:1.8)).join('')+
            detail('M6 28h44m-37 4h3m4 0h3m4 0h3m4 0h3m5 0h3'),1),
        preReference:chassis(50,22,
            rails(13,33)+dial(12,20,2.8)+screen(17,15,22,10)+detail('M20 19h8m3 0h5M20 22h15')+
            dial(44,20,2.8)+pairs([13,23,34,44],30),1),
        receiver:chassis(50,25,
            rails(11,35)+meter(10,14,6,7)+meter(18,14,6,7)+screen(26,14,15,7)+
            detail('M28 18h11m-24 7h26')+dial(45,18,2.8)+pairs([13,23,33,43],31),1),
        powerAmp:chassis(50,23,
            screen(7,14,33,8)+detail('M10 18h15m3 0h8M10 25h30')+
            dial(45,17,3)+dot(46,24)+pairs([11,20,30,40,47],29)),

        // Integrated, power and headphone amplifiers.
        integratedCompact:chassis(50,17,
            path('M46 14V9')+detail('M8 23l2-4')+dial(16,22,2.7)+dial(24,22,2.7)+dial(32,22,2.7)+pair(40,22)+pairs([47],20)+pairs([47],25)),
        integratedUtility:chassis(48,22,
            detail('M5 27h46')+dots([9,11],20)+circle(16,21,2)+circle(23,21,2)+
            dots([29,33,37],18)+dots([29,33,37],23)+dial(45,22,3.7)+pairs([12,23,35,45],30)),
        integratedMinimal:chassis(50,19,
            dot(8,21)+dial(17,22,4)+dot(29,22)+detail('M34 22h2m3 0h2m3 0h2')+pairs([13,23,34,44],28)),
        integratedSilver:chassis(50,22,
            rails(13,33)+dot(10,21)+meter(15,15,9,9)+meter(26,15,9,9)+
            dial(40,21,3)+dots([46,48],17)+pairs([13,23,34,45],29),1),
        integratedBlue:chassis(50,23,
            dot(8,20)+detail('M11 17h3m-3 5h3')+meter(17,15,9,9)+meter(28,15,9,9)+
            dial(42,21,3)+dots([47,49],17)+pairs([12,22,34,45],30)),
        powerAurenne220:chassis(50,29,
            vents([8,11,14,17,20,36,39,42,45,48],13,18)+driver(28,20,5.5,3.4)+
            detail('M24 30h2m4 0h2M7 33h42')+dot(28,33),1),
        powerDual:chassis(50,22,
            rails(13,33)+detail('M12 16h32m-32 3h32m-32 3h32m-32 3h32')+
            pair(12,29)+pair(44,29)+dot(28,29)),
        powerValve:rect(4,31,48,8,1.5)+
            rect(7,23,5,8,2)+rect(15,16,5,15,2)+rect(23,12,5,19,2)+rect(31,15,5,16,2)+rect(39,13,5,18,2)+rect(47,24,3,7,1)+
            detail('M17.5 20v7m8-11v11m8-7v7m8-9v9M9 39v2m38-2v2')+pairs([13,43],35)+dot(28,35),
        powerBias:chassis(50,23,
            vents([7,10,13,43,46,49],14,12)+circle(28,21,6.5)+detail('m28 23-3-5m-2 4 1-1m6-3 1-1')+
            pairs([12,44],30)+dot(28,30),1),
        powerStereo:chassis(50,18,
            vents([12,15,18,21,35,38,41,44],18,10)+circle(25,22,2.4)+circle(31,22,2.4)+
            dots([8,48],19)+dots([8,48],26)),
        powerVintage:chassis(50,18,
            rails(15,31)+detail('M12 20h9m-9 5h9m14-5h9m-9 5h9')+circle(25,23,2.2)+circle(31,23,2.2)+dots([10,46],27),1),
        headphoneAmp4:chassis(50,17,
            pair(9,23)+detail('M13 18v10m8-10v10m9-10v10m9-10v10m9-10v10')+
            [17,25.5,34.5,43.5].map(x=>circle(x,23,1.5)).join('')+dot(50,23)),
        headphoneAmpModern:chassis(46,24,
            detail('M8 13v20m40-20v20')+rect(11,20,4,4,.7)+pair(19,22)+dial(27,22,4.2)+
            circle(37,22,2)+circle(44,22,1.3),3),
        headphoneAmp:chassis(46,22,
            rails(13,33)+rect(11,20,3,5,.5)+pair(19,22)+dial(28,22,4)+
            circle(37,22,2)+circle(44,22,1.2)+detail('M18 30h20'),1),

        // Processing, selectors and bench equipment.
        eqStudio:chassis(50,22,
            pair(8,21)+pair(48,21)+faders([15,21.5,28,34.5,41],16,29,[23,21,25,20,23])+dot(48,28)),
        eqVintage:chassis(50,23,
            rails(12,34)+pair(11,22)+pair(45,22)+faders([16,22,28,34,40],16,28,[22,20,24,20,22])+detail('M9 31h38'),1),
        mixer:chassis(50,23,
            pairs([12,21,30,43],19)+faders([12,21,30],23,31,[27,25,29])+detail('M36 15v16')+dot(48,25)),
        mixerVintage:chassis(50,23,
            rails(12,34)+pairs([13,22,31,42],19)+faders([13,22,31],23,31,[27,25,29])+detail('M36 15v16M39 28h7'),1),
        crossover:chassis(50,17,
            plugBank([11,22,34,45])+detail('M16 17v11m11-11v11m12-11v11M9 19h4m7 0h4m8 0h4m7 0h4')),
        crossoverVintage:chassis(50,18,
            rails(15,31)+plugBank([12,22,34,44])+detail('M10 19h4m6 0h4m8 0h4m6 0h4M10 29h36'),1),
        rcaSwitch:chassis(48,17,
            plugBank([13,29,44],{keys:true})+detail('M21 18v10')+dot(13,19)),
        rcaSwitchVintage:chassis(50,18,
            rails(15,31)+plugBank([13,29,44],{keys:true})+detail('M21 17v12')+dot(13,18),1),
        speakerSwitch:chassis(48,17,
            plugBank([13,29,44],{keys:true,speakers:true})+detail('M21 18v10')+dot(13,19)),
        speakerSwitchVintage:chassis(50,18,
            rails(15,31)+plugBank([13,29,44],{keys:true,speakers:true})+detail('M21 17v12')+dot(13,18),1),
        rcaMatrix:chassis(50,18,
            pairs([8.5,15,21.5,29,35,41,47],25)+detail('M25 16v13')+dots([8.5,15,21.5,29,35,41,47],19)),
        rcaMatrixVintage:chassis(50,20,
            rails(14,32)+pairs([11,16.5,22,29,34.5,40,45.5],26)+detail('M25 16v14M10 30h36')+
            dots([11,16.5,22,29,34.5,40,45.5],19),1),
        signalGenerator:chassis(50,22,
            screen(7,16,16,14)+detail('M10 24q2-5 4 0t4 0m8-5h3m3 0h3m3 0h3m-15 5h3m3 0h3m3 0h3m-13 5h10')+pair(46,24)),
        signalGeneratorVintage:chassis(50,22,
            rails(13,33)+screen(10,16,14,13)+detail('M12 22h2m2 0h2m2 0h2m-10 3h8')+
            rect(28,17,4,3,.5)+rect(35,17,4,3,.5)+rect(28,24,4,3,.5)+rect(35,24,4,3,.5)+pair(44,22),1),
        benchMeter:chassis(50,24,
            circle(8,19,1.2)+circle(8,26,1.2)+screen(12,15,11,16)+detail('M14 20h6m-6 4h4')+
            screen(27,15,21,16)+detail('m29 25 4-3 4 2 4-5 4 3M29 28h17'),1),
        benchMeterVintage:chassis(50,24,
            rails(12,34)+dots([11],18)+dots([11],25)+meter(14,17,8,10)+meter(24,17,8,10)+
            screen(35,15,11,15)+detail('m37 24 2-4 2 3 3-5M37 27h7'),1),
        speakerConverter:chassis(46,21,
            rect(10,21,3,4,.5)+rect(16,21,3,4,.5)+detail('M24 23h7m-2-2 2 2-2 2')+pair(40,23)),
        phonoConverter:chassis(46,21,
            pair(14,23)+detail('M23 23h8m-2-2 2 2-2 2M10 18h8m20 0h5')+pair(40,23)),

        // Active speakers, bookshelf speakers and the two classic three-way grilles.
        spkActiveRounded:rect(15,3,26,38,8)+`<ellipse cx="28" cy="12" rx="8" ry="4.8"/>`+
            circle(28,12,1.8)+driver(28,26,8.5)+dots([21,28,35],37)+detail('M22 41v2h12v-2'),
        spkActiveCompact:rect(16,3,24,39,1.6)+circle(28,11,3.1)+driver(28,25,8.4)+detail('M17 34h22')+dots([21,26,32,37],38),
        spkActiveBookshelf:rect(15,3,26,39,2)+driver(28,11.5,3.4,1.25)+driver(28,25.5,8.6,3.2)+dots([21,28,35],37),
        spkActiveMonitor:rect(15,3,26,39,1.5)+grille(18,6,20,27,'M22 8v23m4-23v23m4-23v23m4-23v23')+
            detail('M18 34h20')+dots([21,28,35],38),
        shelfCoax:rect(15,3,26,39,5)+driver(28,21,9.5,3.2)+detail('M28 12v2m0 14v2m-9-9h2m14 0h2')+rect(25,36,6,2,1),
        shelfWood:rect(17,3,22,39,1.5)+circle(28,11,3.4)+driver(28,26.5,8,3)+rect(25,37,6,2,.5),
        shelfRadiator:rect(15,8,26,34,1.5)+rect(18,4,20,4,1)+driver(28,16,3.5,1.45)+driver(28,30,9,4)+detail('M18 39h20'),
        shelfTop:rect(17,11,22,31,2)+driver(28,5.8,3.5,1.2)+driver(28,24,8.5,4.3)+rect(25,36,6,2,.5),
        spkPassiveCarbon:rect(15,3,26,39,2)+circle(28,10.5,3.4)+driver(28,25,9,3.2)+rect(25,37,6,2,1)+detail('M17 40h22'),
        spkPassiveWood:rect(16,3,24,39,1.5)+grille(19,6,18,27,'M23 8v23m5-23v23m5-23v23')+rect(25,36.5,6,2.5,.5),
        spkPassiveGridBlack:rect(14,3,28,36,1)+
            '<rect x="17" y="6" width="22" height="28" rx="1" fill="currentColor" fill-opacity=".07"/>'+
            detail('M22 7v26m6-26v26m6-26v26M18 12h20m-20 6h20m-20 6h20m-20 6h20M16 36h24M18 39l-2 3h24l-2-3'),
        spkPassiveGridOrange:rect(14,3,28,36,1)+
            '<rect x="17" y="6" width="22" height="28" rx="1" fill="currentColor" fill-opacity=".37"/>'+
            detail('M22 7v26m6-26v26m6-26v26M18 12h20m-20 6h20m-20 6h20m-20 6h20M16 36h24M18 39l-2 3h24l-2-3'),

        // Floorstanders and subwoofers.
        floorCoax:rect(21,3,14,38,1.3)+[8,15,29,36].map(y=>driver(28,y,2.7,1)).join('')+
            driver(28,22,2.7,1.3)+detail('M18 41h20m-16 0v2m12-2v2'),
        floorDiamond:path('M19 12q9-6 18 0v28H19zM17 41h22')+circle(28,5,2.6)+
            driver(28,14,3,1.2)+driver(28,24,4)+driver(28,34,4)+detail('M21 41v2m14-2v2'),
        floorFlax:rect(19,3,18,37,1)+driver(28,8,3)+circle(28,14,1)+
            [19,27,35].map(y=>driver(28,y,3.3,1.2)).join('')+path('M16 41h24'),
        spkElectrostatic:path('M10 36V9q0-4 4-4h28q4 0 4 4v27zM15 36l-2 6h6l2-6m14 0 2 6h6l-2-6')+
            grille(13,8,30,23,'M17 10v19m5-19v19m6-19v19m6-19v19m5-19v19')+detail('M24 33h8'),
        subwooferCube:rect(10,4,36,38,2)+driver(28,19,11.8,4.8)+detail('M11 33h34')+dots([17,28,39],38),
        subwooferPassive:rect(11,4,34,38,2)+driver(28,19,11.7,4.5)+pair(28,36)+detail('M14 40h28'),
        subwooferPassiveVintage:rect(9,4,38,38,1)+rect(12,7,32,32,1)+driver(28,19,10.6,4.2)+
            circle(16,31,1.2)+circle(40,31,1.2)+pair(28,35),
        subwooferPro:rect(11,3,34,39,1.6)+driver(28,16.5,10.8,4.3)+
            rect(19,30,18,3,1.5)+dots([17,28,39],38),

        // Headphones keep the same head-on pose, with model-specific arches and cups.
        hpClassic:headphones(`<ellipse cx="13" cy="28.5" rx="6.8" ry="9"/><ellipse cx="43" cy="28.5" rx="6.8" ry="9"/>`+
            circle(13,28.5,3.4)+circle(43,28.5,3.4),'M10 22v-2a18 18 0 0 1 36 0v2M14 20a14 14 0 0 1 28 0'),
        hpStudio:headphones(rect(6,21,13,16,5)+rect(37,21,13,16,5)+detail('M10 24v10m6-10v10m24-10v10m6-10v10')),
        hpMonitor:headphones(rect(6,20,14,18,4)+rect(36,20,14,18,4)+detail('M9 23v12m38-12v12M13 24h3m-3 9h3m24-9h3m-3 9h3'),
            'M8 23v-2a20 20 0 0 1 40 0v2M14 20a14 14 0 0 1 28 0'),
        hpMax:headphones(rect(5,21,15,17,4)+rect(36,21,15,17,4)+detail('M9 24v11m38-11v11m-3-11h2'),
            'M10 21a18 18 0 0 1 36 0M15 13q13 6 26 0M18 10q10-5 20 0'),
        hpKubaDisco2:headphones(rect(7,21,12,17,4)+rect(37,21,12,17,4)+detail('M11 24v11m34-11v11'),
            'M9 25V21a19 19 0 0 1 38 0v4h-3v-4a16 16 0 0 0-32 0v4z'),
        hpOpenRing:headphones(`<ellipse cx="13" cy="29" rx="8" ry="9.5"/><ellipse cx="43" cy="29" rx="8" ry="9.5"/><ellipse cx="13" cy="29" rx="4.5" ry="6"/><ellipse cx="43" cy="29" rx="4.5" ry="6"/>`+
            detail('m7 27 12 4m18-4 12 4')),
        hpOpenDome:headphones(`<ellipse cx="13" cy="29" rx="8" ry="9.5"/><ellipse cx="43" cy="29" rx="8" ry="9.5"/>`+
            detail('m13 24 4 2.5v5L13 34l-4-2.5v-5zM43 24l4 2.5v5L43 34l-4-2.5v-5z'),
            'M10 23v-3a18 18 0 0 1 36 0v3M15 18q13-12 26 0'),
        hpPlanar:headphones(circle(13,29,9)+circle(43,29,9)+detail('M7 26h12m-13 3h14m-13 3h12m18-6h12m-13 3h14m-13 3h12'),
            'M9 22a19 19 0 0 1 38 0M15 18q13-12 26 0'),

        // Furniture and lighting.
        furnitureRack:rackShelves(37,5,35,4),
        furnitureRackTall:rackShelves(32,4,37,4),
        furnitureRackSix:rackShelves(26,3,39,6),
        furnitureRackSixTall:rackShelves(22,2,41,6),
        furnitureCoverflow:rect(3,14,50,21,1.4)+rect(6,17,44,15,1)+
            detail('M10 19v11m4-11v11m4-11v11m4-11v11M28 19h12v11H28zM9 35v2m38-2v2')+circle(39,24.5,4),
        cdCollection:rect(5,15,46,16,1)+detail('M9 17v12m4-13v13m4-12v11m4-11v13m4-13v12m4-12v12m4-13v12m4-11v13m4-13v11m4-12v13m3-12v11'),
        furnitureTable:rect(3,14,50,4,1)+path('M8 18v21h3V18m34 0v21h3V18')+detail('M12 21h32'),
        furnitureNiche:rect(5,13,46,20,1.5)+rect(8,16,40,14,1),
        pendantLamp:path('M28 4v10m-4 0h8v4c2 5 8 9 16 12-12 4-28 4-40 0 8-3 14-7 16-12zM24 33v2a4 4 0 0 0 8 0v-2')+
            detail('M28 41v2m-8-5-2 2m18-2 2 2'),
        wallLampDome:path('M22 20V12a6 6 0 0 1 12 0v8m-13 0h14q2 6 10 10c-10 4-24 4-34 0q8-4 10-10zM24 33v3a4 4 0 0 0 8 0v-3')+
            detail('M28 12v4m0 26v1'),
        wallLampCage:path('M21 16V10a7 7 0 0 1 14 0v6m-16 0h18v17a9 9 0 0 1-18 0zM19 23h18m-18 9h18')+
            detail('M24 17v19m8-19v19m-4-10v5'),
        hardwareDemo:rect(13,3,30,40,1.5)+[11,20,29,38].map(y=>detail(`M17 ${y-2}h5`)+dots([27,32,37],y-2)).join('')+
            detail('M15 14h26m-26 9h26m-26 9h26')
    });
})();
