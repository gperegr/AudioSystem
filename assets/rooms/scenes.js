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
            object('woodPanels',0,120,{w:2400,h:1210,layer:'far'}),
            windowAt(990,250,420,570,'garden',{light:{shape:'rect',strength:.25,rgb:[223,223,177]}}),
            art(140,240,340,420,{kind:'geometric'}),art(1910,235,350,420,{kind:'landscape'}),
            lamp(550,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.57}),
            lamp(1850,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.52}),
            object('plant',140,1092,{size:230,layer:'near'})
        ]},
        loft:{material:'loft',floor:'concrete',objects:[
            object('brick',0,120,{w:2400,h:1130,layer:'far'}),
            windowAt(220,190,520,930,'city',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            windowAt(930,190,520,930,'city',{light:{shape:'rect',strength:.21,rgb:[224,224,204]}}),
            windowAt(1640,190,520,930,'city',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            lamp(480,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1200,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1920,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            object('plant',2140,1122,{size:200,layer:'near'})
        ]}
    };

    function defs(m){return `<defs>
      <linearGradient id="wall" x2="1" y2=".4"><stop stop-color="${m.wall}"/><stop offset=".52" stop-color="${m.wallDark}"/><stop offset="1" stop-color="${m.wall}"/></linearGradient>
      <linearGradient id="wood" x2=".9" y2="1"><stop stop-color="${m.woodLight}"/><stop offset=".52" stop-color="${m.wood}"/><stop offset="1" stop-color="${m.woodLight}"/></linearGradient>
      <linearGradient id="metal"><stop stop-color="${m.metal}"/><stop offset=".16" stop-color="#c5bdb0"/><stop offset=".42" stop-color="${m.metal}"/><stop offset=".82" stop-color="#58615e"/><stop offset="1" stop-color="${m.metal}"/></linearGradient>
      <linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#e7e0ca" stop-opacity=".18"/><stop offset=".48" stop-color="#35434a" stop-opacity=".42"/><stop offset="1" stop-color="#c3cfc7" stop-opacity=".12"/></linearGradient>
      <radialGradient id="ambient"><stop stop-color="${m.light}" stop-opacity=".27"/><stop offset=".46" stop-color="${m.light}" stop-opacity=".10"/><stop offset="1" stop-color="${m.light}" stop-opacity="0"/></radialGradient>
      <pattern id="grain" width="165" height="63" patternUnits="userSpaceOnUse"><path d="M0 9q38-5 85 0t80-2M0 26q70 7 118 0t47 1M0 51q53-7 97-1t68 0" fill="none" stroke="#e0c9a5" stroke-opacity=".11" stroke-width="1.4"/><path d="M0 17q65 4 165 0M0 39q90-5 165 2" fill="none" stroke="#342820" stroke-opacity=".09" stroke-width="1.5"/></pattern>
      <pattern id="foam" width="36" height="38" patternUnits="userSpaceOnUse"><rect width="36" height="38" fill="${m.foam}"/><path d="M1 0l16 19L1 38M17 0l18 19-18 19" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="8"/><path d="M19 0L35 19 19 38" fill="none" stroke="#fff" stroke-opacity=".11" stroke-width="4"/></pattern>
      <pattern id="brick" width="150" height="78" patternUnits="userSpaceOnUse"><rect width="150" height="78" fill="${m.wallDark}"/><path d="M0 1h148v35H0zM-75 40H73v36H-75zm152 0h148v36H77z" fill="${m.brick}" stroke="#43362f" stroke-opacity=".35" stroke-width="3"/><path d="M5 9h122M16 17h41M93 20h39M3 49h58M82 60h60" stroke="#eed1b1" stroke-opacity=".09" stroke-width="2"/></pattern>
    </defs>`;}

    const renderers={
        woodPanels(o,m){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#wood)" opacity=".5"/><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#grain)"/>${Array.from({length:Math.floor(o.w/190)},(_,i)=>`<path d="M${o.x+i*190} ${o.y}v${o.h}" stroke="#30251e" stroke-opacity=".16" stroke-width="6"/><path d="M${o.x+i*190+5} ${o.y}v${o.h}" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>`).join('')}<path d="M${o.x} ${o.y+o.h*.74}h${o.w}m-${o.w} 12h${o.w}" stroke="${m.trim}" stroke-opacity=".17" stroke-width="4"/>`;},
        brick(o){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#brick)"/><path d="M${o.x} ${o.y+o.h-12}h${o.w}" stroke="#182127" stroke-width="24" opacity=".55"/>`;},
        foam(o,m){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="8" fill="#121d23" stroke="${m.metal}" stroke-opacity=".25" stroke-width="12"/>${Array.from({length:o.rows},(_,r)=>Array.from({length:o.cols},(_,c)=>{const pw=o.w/o.cols-13,ph=o.h/o.rows-14,x=o.x+c*(o.w/o.cols)+7,y=o.y+r*(o.h/o.rows)+7;return `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="5" fill="url(#foam)" stroke="#a9b2ae" stroke-opacity=".1" stroke-width="3"/>`;}).join('')).join('')}`;},
        window(o,m){const {x,y,w,h}=o;return `<rect x="${x-22}" y="${y-22}" width="${w+44}" height="${h+44}" rx="12" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".44" stroke-width="8"/><rect x="${x-9}" y="${y-9}" width="${w+18}" height="${h+18}" rx="4" fill="#344047" stroke="url(#metal)" stroke-opacity=".53" stroke-width="5"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><path d="M${x+w/2} ${y}v${h}M${x} ${y+h/2}h${w}" stroke="#303c3e" stroke-width="17"/><path d="M${x+22} ${y+17}h${w*.44}L${x+45} ${y+h-20}" fill="#f0e8cf" opacity=".055"/><path d="M${x-30} ${y+h+17}h${w+60}" stroke="${m.woodLight}" stroke-opacity=".72" stroke-width="15"/>`;},
        lamp(o,m,time){const {x,y}=o,w=o.w||48,h=o.h||130,color=o.rgb?`rgb(${o.rgb.join(' ')})`:m.light,brightness=times[time].lamp;
            const shadeOpacity=Math.min(.96,.18+.55*brightness).toFixed(2);
            const glow=`<defs><radialGradient id="glow-${x}-${y}"><stop stop-color="${color}" stop-opacity="${Math.min(.8,.56*brightness).toFixed(2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><linearGradient id="shade-${x}-${y}"><stop stop-color="${m.woodLight}"/><stop offset=".3" stop-color="${color}" stop-opacity="${shadeOpacity}"/><stop offset=".7" stop-color="${color}" stop-opacity="${shadeOpacity}"/><stop offset="1" stop-color="${m.woodLight}"/></linearGradient></defs>`;
            return glow+(o.shape==='pendant'
            ?`<path d="M${x} 75v${y-125}" stroke="${m.metal}" stroke-opacity=".75" stroke-width="7"/><ellipse cx="${x}" cy="${y+8}" rx="175" ry="135" fill="url(#glow-${x}-${y})"/><path d="M${x-82} ${y-84}h164l-33 86h-98z" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".68" stroke-width="7"/><path d="M${x-49} ${y+3}h98" stroke="${m.metal}" stroke-width="8"/><ellipse cx="${x}" cy="${y+10}" rx="44" ry="16" fill="${color}" opacity=".65"/>`
            :`<ellipse cx="${x}" cy="${y}" rx="210" ry="295" fill="url(#glow-${x}-${y})"/><rect x="${x-w*.77}" y="${y-h*.65}" width="${w*1.54}" height="${h*1.3}" rx="${w*.55}" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".54" stroke-width="5"/><rect x="${x-w*.42}" y="${y-h*.48}" width="${w*.84}" height="${h*.96}" rx="${w*.42}" fill="url(#shade-${x}-${y})"/><path d="M${x-w*.55} ${y-h*.52}h${w*1.1}M${x-w*.55} ${y+h*.52}h${w*1.1}" stroke="url(#metal)" stroke-width="6" stroke-linecap="round"/><path d="M${x} ${y-h*.44}v${h*.88}" stroke="#fff5d3" stroke-opacity=".36" stroke-width="3"/>`);},
        art(o,m){const {x,y,w,h}=o,landscape=o.kind==='landscape';return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".48" stroke-width="9"/><rect x="${x+18}" y="${y+18}" width="${w-36}" height="${h-36}" fill="${m.wallDark}"/>${landscape?`<circle cx="${x+w*.69}" cy="${y+h*.34}" r="${Math.min(w,h)*.11}" fill="${m.light}" opacity=".52"/><path d="M${x+19} ${y+h*.75}Q${x+w*.24} ${y+h*.43} ${x+w*.48} ${y+h*.66}T${x+w-19} ${y+h*.54}V${y+h-19}H${x+19}Z" fill="${m.woodLight}" opacity=".58"/><path d="M${x+19} ${y+h*.83}Q${x+w*.39} ${y+h*.68} ${x+w-19} ${y+h*.79}V${y+h-19}H${x+19}Z" fill="${m.wall}"/>`:`<path d="M${x+w*.2} ${y+h*.83}V${y+h*.43}a${w*.3} ${h*.29} 0 0 1 ${w*.6} 0v${h*.4}z" fill="${m.woodLight}" opacity=".65"/><path d="M${x+w*.36} ${y+h*.82}V${y+h*.47}a${w*.14} ${h*.14} 0 0 1 ${w*.28} 0v${h*.35}z" fill="${m.wallDark}" opacity=".75"/><rect x="${x+w*.16}" y="${y+h*.22}" width="${w*.68}" height="${h*.05}" fill="${m.light}" opacity=".4"/>`}`;},
        plant(o,m){const s=o.size,x=o.x,y=o.y;return `<path d="M${x-s*.22} ${y+s*.58}h${s*.44}l-${s*.055} ${s*.42}h-${s*.33}z" fill="url(#wood)" stroke="${m.trim}" stroke-opacity=".6" stroke-width="5"/><path d="M${x} ${y+s*.58}v-${s*.48}m0 ${s*.3}l-${s*.28}-${s*.32}m${s*.28} ${s*.27}l${s*.27}-${s*.4}" stroke="#314b3b" stroke-width="8" fill="none"/>${[-2,-1,0,1,2].map(i=>`<path d="M${x+i*s*.07} ${y+s*.25}q${i*s*.13} -${s*.3} ${i*s*.13} -${s*.36}q${s*.18} ${s*.27} ${-i*s*.13} ${s*.36}" fill="${i%2?'#466b52':'#64846a'}" stroke="#274533" stroke-width="2"/>`).join('')}<path d="M${x-s*.18} ${y+s*.61}h${s*.36}" stroke="${m.metal}" stroke-width="6"/>`;}
    };

    function renderLayer(sceneName,layer,time='dusk'){
        time=times[time]?time:'dusk';
        const scene=scenes[sceneName],m=materials[scene.material];
        const background=layer==='far'?`<rect width="2400" height="1600" fill="url(#wall)"/>`:'';
        const objects=scene.objects.filter(item=>item.layer===layer).map(item=>renderers[item.type](item,m,time)).join('');
        const atmosphere=layer==='far'?scene.objects.filter(item=>item.type==='lamp').map(item=>`<ellipse cx="${item.x}" cy="${item.y+45}" rx="${item.shape==='pendant'?330:380}" ry="${item.shape==='pendant'?300:420}" fill="url(#ambient)" opacity="${Math.min(1,times[time].lamp).toFixed(2)}"/>`).join(''):'';
        const trim=layer==='far'?`<path d="M0 112h2400M0 1322h2400" stroke="${m.trim}" stroke-opacity=".25" stroke-width="8"/><path d="M0 1329h2400" stroke="${m.wood}" stroke-opacity=".55" stroke-width="16"/>`:'';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1600" preserveAspectRatio="none">${defs(m)}${background}<g transform="translate(240 268) scale(.8)">${objects}${atmosphere}${trim}</g></svg>`;
    }

    function renderVista(vista,index,layer,time='dusk'){
        const p=times[time]||times.dusk,night=time==='night',garden=vista==='garden';
        const skyline=Array.from({length:15},(_,i)=>{const x=i*47-20+(index*17)%23,h=85+(i*41)%150,y=450-h;return `<rect x="${x}" y="${y}" width="42" height="${h}" fill="${i%3?p.near:p.far}"/><path d="M${x+10} ${y+18}v${h-34}m10-${h-34}v${h-34}m10-${h-34}v${h-34}" stroke="${p.glow}" stroke-opacity="${night?.35:.15}" stroke-width="2" stroke-dasharray="4 16"/>`;}).join('');
        const trees=Array.from({length:12},(_,i)=>{const x=i*58-4+(index*29)%33,y=325+(i*19)%55;return `<path d="M${x} ${y+28}v96" stroke="${p.near}" stroke-width="8"/><circle cx="${x-12}" cy="${y+7}" r="27" fill="${p.far}"/><circle cx="${x+11}" cy="${y}" r="30" fill="${p.near}"/>`;}).join('');
        const stars=night?Array.from({length:24},(_,i)=>`<circle cx="${(i*179+index*31)%640}" cy="${(i*83)%210+9}" r="${i%5?1:2}" fill="#e3e7e5" opacity=".5"/>`).join(''):'';
        const sky=garden?p.gardenSky:p.sky;
        return `<svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sky" x2=".2" y2="1"><stop stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>${layer==='far'?`<rect width="640" height="450" fill="url(#sky)"/>${stars}<path d="M0 285Q105 235 213 284T420 263T640 278V450H0Z" fill="${p.ridge}" opacity=".75"/><path d="M0 338Q130 295 280 327T640 316V450H0Z" fill="${p.far}" opacity=".55"/>`:(garden?trees:skyline)}</svg>`;
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
