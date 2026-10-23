/* Scene objects share geometry, materials, window views and real light emitters.
   All coordinates use the 2400 x 1400 room plane inside the 2400 x 1600 SVG. */
(function () {
    'use strict';

    const object=(type,x,y,extra={})=>({type,x,y,layer:'mid',...extra});
    const windowAt=(x,y,w,h,vista,extra={})=>object('window',x,y,{w,h,vista,layer:'far',...extra});
    const lamp=(x,y,shape='bar',extra={})=>object('lamp',x,y,{shape,layer:'near',...extra});
    const art=(x,y,w,h,extra={})=>object('art',x,y,{w,h,layer:'mid',...extra});

    const materials={
        studio:{wall:'#39454a',wallDark:'#253039',trim:'#98a09a',wood:'#665342',woodLight:'#94775a',metal:'#9a9c95',foam:'#353f42',brick:'#766158',light:'#f3bf85'},
        listening:{wall:'#9d8b74',wallDark:'#625747',trim:'#c8ad85',wood:'#624b36',woodLight:'#9c7956',metal:'#a99f8c',foam:'#625846',brick:'#896c58',light:'#f7bf80'},
        loft:{wall:'#987765',wallDark:'#594b43',trim:'#baa998',wood:'#5c493a',woodLight:'#98785b',metal:'#969b98',foam:'#514942',brick:'#a07964',light:'#f8c98d'}
    };
    const times={
        dawn:{lamp:.36,window:1.65,windowRgb:[255,216,168],sky:['#748fa8','#efd3ae'],gardenSky:['#a9bdba','#f3dcc0'],ridge:'#9ba9a3',far:'#8194a0',near:'#607b80',glow:'#ffd9a5'},
        dusk:{lamp:1,window:1.1,windowRgb:[255,175,112],sky:['#777d9d','#e6ae82'],gardenSky:['#adb6a1','#e9b890'],ridge:'#9c8588',far:'#797d89',near:'#5b6976',glow:'#ffca90'},
        night:{lamp:1.35,window:.34,windowRgb:[118,153,211],sky:['#1d2a46','#4c476b'],gardenSky:['#243547','#57516a'],ridge:'#495373',far:'#394963',near:'#2d3c54',glow:'#d8b9a7'}
    };

    // Each room lists the same kinds of objects. Layer controls blur and canvas parallax.
    const scenes={
        studio:{material:'studio',floor:'carpet',objects:[
            object('foam',80,170,{w:650,h:890,cols:7,rows:3,layer:'far'}),
            object('foam',1670,170,{w:650,h:890,cols:7,rows:3,layer:'far'}),
            windowAt(840,260,720,520,'city',{light:{shape:'rect',strength:.20,rgb:[195,220,221]}}),
            lamp(350,500,'bar',{w:48,h:130,rgb:[255,193,123],strength:.53}),
            lamp(2030,500,'bar',{w:48,h:130,rgb:[255,193,123],strength:.48})
        ]},
        listening:{material:'listening',floor:'wood',objects:[
            object('woodPanels',0,-300,{w:2400,h:1700,layer:'far'}),
            windowAt(990,250,420,570,'garden',{light:{shape:'rect',strength:.25,rgb:[223,223,177]}}),
            art(140,240,340,420,{kind:'geometric'}),art(1910,235,350,420,{kind:'landscape'}),
            lamp(550,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.57}),
            lamp(1850,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.52})
        ]},
        loft:{material:'loft',floor:'concrete',objects:[
            object('brick',0,-300,{w:2400,h:1700,layer:'far'}),
            windowAt(220,190,520,930,'city',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            windowAt(930,190,520,930,'city',{light:{shape:'rect',strength:.21,rgb:[224,224,204]}}),
            windowAt(1640,190,520,930,'city',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            lamp(480,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1200,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1920,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49})
        ]}
    };

    function defs(m){
        const flecks=Array.from({length:85},(_,i)=>`<circle cx="${(i*137+23)%196}" cy="${(i*i*71+17)%164}" r="${i%5===0?1.1:.55}" fill="${i%3?'#fff5de':'#192228'}" opacity="${i%4===0?.26:.11}"/>`).join('');
        return `<defs>
      <linearGradient id="wall" x2=".86" y2="1"><stop stop-color="${m.wall}"/><stop offset=".36" stop-color="${m.wallDark}"/><stop offset=".72" stop-color="${m.wall}"/><stop offset="1" stop-color="${m.wallDark}"/></linearGradient>
      <radialGradient id="wall-wash" cx=".43" cy=".35" r=".83"><stop stop-color="${m.light}" stop-opacity=".17"/><stop offset=".48" stop-color="${m.light}" stop-opacity=".04"/><stop offset="1" stop-color="#090f14" stop-opacity=".31"/></radialGradient>
      <linearGradient id="wood" x2=".92" y2="1"><stop stop-color="${m.woodLight}"/><stop offset=".26" stop-color="${m.wood}"/><stop offset=".58" stop-color="${m.woodLight}"/><stop offset="1" stop-color="${m.wood}"/></linearGradient>
      <linearGradient id="metal"><stop stop-color="#3d4644"/><stop offset=".08" stop-color="${m.metal}"/><stop offset=".18" stop-color="#d0c8b8"/><stop offset=".44" stop-color="${m.metal}"/><stop offset=".84" stop-color="#4c5755"/><stop offset="1" stop-color="#9b9f98"/></linearGradient>
      <linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#e7e0ca" stop-opacity=".21"/><stop offset=".48" stop-color="#35434a" stop-opacity=".32"/><stop offset="1" stop-color="#c3cfc7" stop-opacity=".14"/></linearGradient>
      <linearGradient id="foam-ridge"><stop stop-color="#151e21"/><stop offset=".23" stop-color="#3e4c4e"/><stop offset=".47" stop-color="#485557"/><stop offset=".76" stop-color="#252e31"/><stop offset="1" stop-color="#11191c"/></linearGradient>
      <radialGradient id="ambient"><stop stop-color="${m.light}" stop-opacity=".30"/><stop offset=".46" stop-color="${m.light}" stop-opacity=".11"/><stop offset="1" stop-color="${m.light}" stop-opacity="0"/></radialGradient>
      <filter id="surface-noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".18" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <filter id="surface-mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="3" seed="11" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <filter id="wall-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>
      <pattern id="plaster" width="196" height="164" patternUnits="userSpaceOnUse"><path d="M0 28q47 2 91-3t105 1M0 102q59-4 102 0t94-3" fill="none" stroke="#fff2d7" stroke-opacity=".035"/>${flecks}</pattern>
      <pattern id="grain" width="165" height="112" patternUnits="userSpaceOnUse"><path d="M-12 10q47-8 94-1t95-4M-12 22q70 7 127-1t62 1M-12 41q50-7 99 0t90-2M-12 59q88-8 189 3M-12 85q63 8 111-2t78 2M-12 103q66-4 189 1" fill="none" stroke="#e3c59d" stroke-opacity=".16" stroke-width="1.3"/><path d="M0 16q85 6 165-2M0 47q96-8 165 2M0 69q98 4 165-2M0 94q87-5 165 1" fill="none" stroke="#251c18" stroke-opacity=".16" stroke-width="2"/></pattern>
      <pattern id="fabric" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 1h9M1 0v9M5 0v9" stroke="#d6d6c4" stroke-opacity=".11" stroke-width=".7"/><path d="M0 5h9" stroke="#080e10" stroke-opacity=".19" stroke-width=".9"/></pattern>
      <pattern id="foam" width="28" height="42" patternUnits="userSpaceOnUse"><rect width="28" height="42" fill="url(#foam-ridge)"/><path d="M4 0v42M24 0v42" stroke="#d9ded1" stroke-opacity=".09" stroke-width="2"/><path d="M0 0h28" stroke="#e3e7d5" stroke-opacity=".07"/><rect width="28" height="42" fill="url(#fabric)"/></pattern>
      <pattern id="brick" width="200" height="98" patternUnits="userSpaceOnUse"><rect width="200" height="98" fill="#493d38"/><path d="M2 3h94v42H2zM101 3h97v42h-97zM-48 51H48v43h-96zm101 0h94v43H53zm99 0h96v43h-96z" fill="${m.brick}"/><path d="M5 7h88M104 8h89M-45 56h91M56 55h88M155 56h88" stroke="#e7c4aa" stroke-opacity=".19" stroke-width="3"/><path d="M7 36q28-5 80 1M110 28q37 5 76-1M58 77q34-6 80 0M161 79q29 4 60-1" fill="none" stroke="#3c302c" stroke-opacity=".32" stroke-width="3"/><path d="M2 3h94v42H2zM101 3h97v42h-97zM-48 51H48v43h-96zm101 0h94v43H53zm99 0h96v43h-96z" fill="url(#plaster)" opacity=".75"/></pattern>
    </defs>`;}

    const renderers={
        woodPanels(o,m){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#wood)" opacity=".67"/><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#grain)" opacity=".8"/>${Array.from({length:Math.floor(o.w/190)},(_,i)=>{const x=o.x+i*190;return `<path d="M${x} ${o.y}v${o.h}" stroke="#231a16" stroke-opacity=".38" stroke-width="7"/><path d="M${x+7} ${o.y}v${o.h}" stroke="#e6caa4" stroke-opacity=".18" stroke-width="2"/><path d="M${x+21} ${o.y+12}q-6 240 3 420t-2 420" fill="none" stroke="#321f17" stroke-opacity=".11" stroke-width="3"/>`;}).join('')}<path d="M${o.x} ${o.y+o.h*.74}h${o.w}" stroke="#291e18" stroke-opacity=".58" stroke-width="20"/><path d="M${o.x} ${o.y+o.h*.74-9}h${o.w}" stroke="${m.trim}" stroke-opacity=".48" stroke-width="3"/><path d="M${o.x} ${o.y+o.h*.74+10}h${o.w}" stroke="#dfc4a0" stroke-opacity=".22" stroke-width="2"/>`;},
        brick(o){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#brick)"/><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#plaster)" opacity=".57"/><path d="M${o.x} ${o.y+o.h-12}h${o.w}" stroke="#182127" stroke-width="24" opacity=".55"/>`;},
        foam(o,m){return `<rect x="${o.x+10}" y="${o.y+15}" width="${o.w}" height="${o.h}" rx="8" fill="#03080b" opacity=".55" filter="url(#wall-shadow)"/><rect x="${o.x-5}" y="${o.y-5}" width="${o.w+10}" height="${o.h+10}" rx="7" fill="#161d20" stroke="#b1aaa0" stroke-opacity=".32" stroke-width="4"/><path d="M${o.x} ${o.y+o.h+2}h${o.w}" stroke="#060b0d" stroke-opacity=".65" stroke-width="15"/>${Array.from({length:o.rows},(_,r)=>Array.from({length:o.cols},(_,c)=>{const pw=o.w/o.cols-13,ph=o.h/o.rows-14,x=o.x+c*(o.w/o.cols)+7,y=o.y+r*(o.h/o.rows)+7;return `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="3" fill="#11191c" stroke="#0a1114" stroke-width="3"/><rect x="${x+3}" y="${y+3}" width="${pw-6}" height="${ph-6}" rx="2" fill="url(#foam)"/><path d="M${x+5} ${y+5}h${pw-10}" stroke="#d1d3c4" stroke-opacity=".12" stroke-width="2"/><path d="M${x+pw-5} ${y+7}v${ph-14}" stroke="#020809" stroke-opacity=".38" stroke-width="4"/>`;}).join('')).join('')}`;},
        window(o,m){const {x,y,w,h}=o;return `<rect x="${x-23}" y="${y-15}" width="${w+65}" height="${h+68}" rx="5" fill="#090e10" opacity=".62" filter="url(#wall-shadow)"/><rect x="${x-31}" y="${y-31}" width="${w+62}" height="${h+72}" rx="5" fill="#172126" opacity=".46"/><rect x="${x-25}" y="${y-25}" width="${w+50}" height="${h+50}" rx="5" fill="${m.wood}" stroke="#211e1a" stroke-opacity=".58" stroke-width="6"/><rect x="${x-14}" y="${y-14}" width="${w+28}" height="${h+28}" rx="3" fill="#1d292c" stroke="url(#metal)" stroke-opacity=".77" stroke-width="8"/><path d="M${x-14} ${y+h+14}h${w+28}M${x-14} ${y-14}h${w+28}" stroke="#e4d8ba" stroke-opacity=".34" stroke-width="2"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><path d="M${x+w/2} ${y}v${h}M${x} ${y+h/2}h${w}" stroke="#182326" stroke-width="21"/><path d="M${x+w/2-6} ${y}v${h}M${x} ${y+h/2-6}h${w}" stroke="#d5d2bd" stroke-opacity=".28" stroke-width="2"/><path d="M${x+22} ${y+17}h${w*.44}L${x+45} ${y+h-20}" fill="#f0e8cf" opacity=".048"/><path d="M${x-31} ${y+h+22}h${w+62}" stroke="#171b1b" stroke-opacity=".5" stroke-width="20"/><path d="M${x-30} ${y+h+17}h${w+60}" stroke="${m.woodLight}" stroke-opacity=".76" stroke-width="9"/><path d="M${x-25} ${y+h+12}h${w+50}" stroke="#f4e5c5" stroke-opacity=".25" stroke-width="2"/>`;},
        lamp(o,m,time){const {x,y}=o,w=o.w||48,h=o.h||130,color=o.rgb?`rgb(${o.rgb.join(' ')})`:m.light,brightness=times[time].lamp;
            const shadeOpacity=Math.min(.96,.18+.55*brightness).toFixed(2);
            const glow=`<defs><radialGradient id="glow-${x}-${y}"><stop stop-color="${color}" stop-opacity="${Math.min(.8,.56*brightness).toFixed(2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><linearGradient id="shade-${x}-${y}"><stop stop-color="${m.woodLight}"/><stop offset=".3" stop-color="${color}" stop-opacity="${shadeOpacity}"/><stop offset=".7" stop-color="${color}" stop-opacity="${shadeOpacity}"/><stop offset="1" stop-color="${m.woodLight}"/></linearGradient></defs>`;
            return glow+(o.shape==='pendant'
            ?`<path d="M${x} 75v${y-159}" stroke="#1b2527" stroke-width="8"/><path d="M${x-2} 75v${y-159}" stroke="${m.metal}" stroke-opacity=".54" stroke-width="2"/><ellipse cx="${x}" cy="${y+3}" rx="204" ry="184" fill="url(#glow-${x}-${y})"/><rect x="${x-24}" y="${y-131}" width="48" height="46" rx="9" fill="url(#metal)" stroke="#252d2d" stroke-width="5"/><path d="M${x-30} ${y-90}Q${x-55} ${y-50} ${x-112} ${y-8}Q${x} ${y+1} ${x+112} ${y-8}Q${x+55} ${y-50} ${x+30} ${y-90}Z" fill="#353a35" stroke="#141d1e" stroke-width="7"/><path d="M${x-30} ${y-85}Q${x-63} ${y-31} ${x-112} ${y-9}" fill="none" stroke="#b6a992" stroke-opacity=".37" stroke-width="4"/><path d="M${x-111} ${y-8}Q${x} ${y+8} ${x+111} ${y-8}" fill="none" stroke="url(#metal)" stroke-width="9"/><ellipse cx="${x}" cy="${y+13}" rx="49" ry="15" fill="${color}" opacity=".56"/><ellipse cx="${x}" cy="${y+17}" rx="20" ry="8" fill="#fff4c8" opacity=".8"/>`
            :`<ellipse cx="${x}" cy="${y}" rx="220" ry="320" fill="url(#glow-${x}-${y})"/><rect x="${x-w*.84}" y="${y-h*.72}" width="${w*1.68}" height="${h*1.44}" rx="${w*.19}" fill="#252d2c" stroke="url(#metal)" stroke-opacity=".7" stroke-width="5"/><rect x="${x-w*.57}" y="${y-h*.55}" width="${w*1.14}" height="${h*1.1}" rx="${w*.3}" fill="url(#shade-${x}-${y})" stroke="#f2d3a0" stroke-opacity=".42" stroke-width="3"/><path d="M${x-w*.6} ${y-h*.52}h${w*1.2}M${x-w*.6} ${y+h*.52}h${w*1.2}" stroke="url(#metal)" stroke-width="9" stroke-linecap="round"/><path d="M${x-w*.34} ${y-h*.42}v${h*.84}" stroke="#fff8dc" stroke-opacity=".34" stroke-width="3"/><path d="M${x+w*.31} ${y-h*.42}v${h*.84}" stroke="#3a2822" stroke-opacity=".22" stroke-width="4"/><circle cx="${x}" cy="${y-h*.63}" r="4" fill="#d5bd99"/><circle cx="${x}" cy="${y+h*.63}" r="4" fill="#d5bd99"/>`);},
        art(o,m){const {x,y,w,h}=o,landscape=o.kind==='landscape',px=x+31,py=y+31,pw=w-62,ph=h-62;return `<rect x="${x+11}" y="${y+14}" width="${w}" height="${h}" fill="#0c0e0d" opacity=".52" filter="url(#wall-shadow)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#wood)" stroke="#211d18" stroke-opacity=".72" stroke-width="6"/><rect x="${x+12}" y="${y+12}" width="${w-24}" height="${h-24}" fill="#d1c4aa" stroke="#e8d9bb" stroke-opacity=".48" stroke-width="3"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${landscape?'#656f68':'#a29780'}"/>${landscape?`<circle cx="${px+pw*.7}" cy="${py+ph*.29}" r="${pw*.1}" fill="#d4b78b" opacity=".58"/><path d="M${px} ${py+ph*.7}Q${px+pw*.24} ${py+ph*.42} ${px+pw*.47} ${py+ph*.63}T${px+pw} ${py+ph*.46}V${py+ph}H${px}Z" fill="#858879"/><path d="M${px} ${py+ph*.84}Q${px+pw*.4} ${py+ph*.65} ${px+pw} ${py+ph*.79}V${py+ph}H${px}Z" fill="#414f4e"/>`:`<path d="M${px+pw*.16} ${py+ph*.88}Q${px+pw*.08} ${py+ph*.35} ${px+pw*.42} ${py+ph*.2}Q${px+pw*.78} ${py+ph*.08} ${px+pw*.84} ${py+ph*.88}Z" fill="#5f685f"/><path d="M${px+pw*.29} ${py+ph*.87}Q${px+pw*.31} ${py+ph*.38} ${px+pw*.53} ${py+ph*.36}Q${px+pw*.71} ${py+ph*.37} ${px+pw*.68} ${py+ph*.87}Z" fill="#d6b891" opacity=".67"/><path d="M${px+pw*.1} ${py+ph*.73}Q${px+pw*.38} ${py+ph*.7} ${px+pw*.83} ${py+ph*.6}" fill="none" stroke="#eee1c3" stroke-opacity=".43" stroke-width="7"/>`}<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="url(#plaster)" opacity=".8"/><path d="M${px+11} ${py+8}h${pw*.4}L${px+pw*.21} ${py+ph-8}" fill="#fff9e4" opacity=".055"/><rect x="${x+30}" y="${y+30}" width="${w-60}" height="${h-60}" fill="none" stroke="#342d28" stroke-opacity=".32" stroke-width="2"/>`;},
    };

    function renderLayer(sceneName,layer,time='dusk'){
        time=times[time]?time:'dusk';
        const scene=scenes[sceneName],m=materials[scene.material];
        const background=layer==='far'?`<rect width="2400" height="1600" fill="url(#wall)"/><rect width="2400" height="1600" fill="url(#wall-wash)"/><rect width="2400" height="1600" fill="url(#plaster)" opacity=".7"/>`:'';
        const objects=scene.objects.filter(item=>item.layer===layer).map(item=>renderers[item.type](item,m,time)).join('');
        const atmosphere=layer==='far'?scene.objects.filter(item=>item.type==='lamp').map(item=>`<ellipse cx="${item.x}" cy="${item.y+45}" rx="${item.shape==='pendant'?330:380}" ry="${item.shape==='pendant'?300:420}" fill="url(#ambient)" opacity="${Math.min(1,times[time].lamp).toFixed(2)}"/>`).join(''):'';
        const trim=layer==='far'?`<path d="M0 112h2400M0 1322h2400" stroke="${m.trim}" stroke-opacity=".25" stroke-width="8"/><path d="M0 1329h2400" stroke="${m.wood}" stroke-opacity=".55" stroke-width="16"/>`:'';
        const surface=layer==='far'?'<rect width="2400" height="1600" filter="url(#surface-mottle)" opacity=".27" style="mix-blend-mode:soft-light"/><rect width="2400" height="1600" filter="url(#surface-noise)" opacity=".15" style="mix-blend-mode:soft-light"/>':'';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1600" preserveAspectRatio="none">${defs(m)}${background}<g transform="translate(240 268) scale(.8)">${objects}${atmosphere}${trim}</g>${surface}</svg>`;
    }

    function renderVista(vista,index,layer,time='dusk'){
        const p=times[time]||times.dusk,night=time==='night',garden=vista==='garden';
        const skyline=Array.from({length:13},(_,i)=>{const x=i*57-30+(index*17)%23,h=99+(i*43)%160,y=450-h,w=48+(i*7)%18;
            const windows=Array.from({length:Math.floor((h-24)/20)},(_,row)=>`<path d="M${x+8} ${y+15+row*20}h5m8 0h5m8 0h5" stroke="${p.glow}" stroke-opacity="${night?(row+i)%3===0?.48:.14:.08}" stroke-width="3"/>`).join('');
            return `<path d="M${x} 450V${y+7}h${w*.16}v-7h${w*.68}v7H${x+w}V450Z" fill="${i%3?p.near:p.far}"/><path d="M${x+4} ${y+12}v${h-12}m${w-9} -${h-12}V${y+12}" stroke="#e1d8c5" stroke-opacity=".09" stroke-width="2"/>${windows}${i%4===0?`<path d="M${x+w*.55} ${y}v-22" stroke="${p.far}" stroke-width="2"/>`:''}`;}).join('');
        const trees=Array.from({length:10},(_,i)=>{const x=i*72-12+(index*29)%33,y=316+(i*19)%53,spread=36+(i*7)%17;
            return `<path d="M${x} ${y+17}q-3 59 1 118m-2-89q-${spread*.7} -40 -${spread} -49m${spread+1} 50q${spread*.7} -43 ${spread} -56" fill="none" stroke="${p.near}" stroke-opacity=".75" stroke-width="5"/><path d="M${x-spread} ${y+24}q-${spread*.2} -${spread*.7} ${spread*.43} -${spread*.85}q${spread*.1} -${spread*.63} ${spread*.73} -${spread*.51}q${spread*.49} -${spread*.62} ${spread*.87} 0q${spread*.75} -${spread*.31} ${spread*.88} ${spread*.53}q${spread*.43} ${spread*.28} ${spread*.22} ${spread*.65}Z" fill="${i%3?p.near:p.far}" opacity=".83"/><path d="M${x-spread*.7} ${y+11}q${spread*.75} -${spread*.5} ${spread*1.6} ${spread*.1}" fill="none" stroke="#e4d2b7" stroke-opacity=".12" stroke-width="3"/>`;}).join('');
        const stars=night?Array.from({length:24},(_,i)=>`<circle cx="${(i*179+index*31)%640}" cy="${(i*83)%210+9}" r="${i%5?1:2}" fill="#e3e7e5" opacity=".5"/>`).join(''):'';
        const sky=garden?p.gardenSky:p.sky;
        return `<svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sky" x2=".2" y2="1"><stop stop-color="${sky[0]}"/><stop offset=".65" stop-color="${sky[1]}"/><stop offset="1" stop-color="${p.ridge}"/></linearGradient><linearGradient id="haze" x2="0" y2="1"><stop stop-color="${sky[1]}" stop-opacity="0"/><stop offset="1" stop-color="${sky[1]}" stop-opacity=".4"/></linearGradient></defs>${layer==='far'?`<rect width="640" height="450" fill="url(#sky)"/>${stars}<path d="M-20 143q105-35 239-11t248 6q103-12 193 12" fill="none" stroke="#fff4db" stroke-opacity=".1" stroke-width="21"/><path d="M0 285Q105 235 213 284T420 263T640 278V450H0Z" fill="${p.ridge}" opacity=".65"/><path d="M0 338Q130 295 280 327T640 316V450H0Z" fill="${p.far}" opacity=".53"/><rect y="260" width="640" height="190" fill="url(#haze)"/>`:(garden?trees:skyline)}</svg>`;
    }

    function windowPanes(name,time='dusk'){return (scenes[name]?.objects||[]).filter(item=>item.type==='window').map((pane,index)=>{
        const left=(240+pane.x*.8)/24,top=(268+pane.y*.8)/16,width=pane.w*.8/24,height=pane.h*.8/16;
        return `<div class="room-window-pane" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><div class="room-window-far">${renderVista(pane.vista,index,'far',time)}</div><div class="room-window-mid">${renderVista(pane.vista,index,'mid',time)}</div><i class="room-window-glass"></i><i class="room-window-mullion"></i></div>`;
    }).join('');}

    const lightCache=new Map();
    function lights(name,time='dusk'){time=times[time]?time:'dusk';const key=name+':'+time;if(lightCache.has(key))return lightCache.get(key);
        const sources=(scenes[name]?.objects||[]).filter(item=>item.light||item.type==='lamp').map((item,index)=>{
        const custom=item.light||{},w=custom.w||item.w||48,h=custom.h||item.h||130;
        const daylight=item.type==='window',profile=times[time];
        // Invisible light-point objects share the equipment-lighting pipeline with the test light.
        return {id:`${name}-light-${index}`,type:'lightPoint',visible:false,cx:item.x+(daylight?item.w*(time==='dawn'?.3:time==='dusk'?.7:.5):0),cy:item.y+(daylight?item.h/2:0),w,h,shape:custom.shape||item.shape||'rect',rgb:daylight?profile.windowRgb:custom.rgb||item.rgb,strength:Math.min(1.25,(custom.strength||item.strength)*(daylight?profile.window:profile.lamp)*1.45),elevation:daylight?260:170,layer:item.layer};
    });lightCache.set(key,sources);return sources;}

    window.RoomScenes={scenes,materials,times,renderLayer,windowPanes,lights};
})();
