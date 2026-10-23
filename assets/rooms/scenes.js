/* Scene objects share geometry, materials, window views and real light emitters.
   All coordinates use the 2400 x 1400 room plane inside the 2400 x 1600 SVG. */
(function () {
    'use strict';

    const object=(type,x,y,extra={})=>({type,x,y,layer:'mid',...extra});
    const windowAt=(x,y,w,h,vista,extra={})=>object('window',x,y,{w,h,vista,layer:'far',...extra});
    const lamp=(x,y,shape='bar',extra={})=>object('lamp',x,y,{shape,layer:'near',...extra});
    const shelf=(x,y,w,extra={})=>object('shelf',x,y,{w,layer:'mid',...extra});
    const art=(x,y,w,h,extra={})=>object('art',x,y,{w,h,layer:'mid',...extra});

    const materials={
        studio:{wall:'#39454a',wallDark:'#253039',trim:'#98a09a',wood:'#665342',woodLight:'#94775a',metal:'#9a9c95',foam:'#353f42',brick:'#766158',light:'#f3bf85'},
        listening:{wall:'#9d8b74',wallDark:'#625747',trim:'#c8ad85',wood:'#624b36',woodLight:'#9c7956',metal:'#a99f8c',foam:'#625846',brick:'#896c58',light:'#f7bf80'},
        loft:{wall:'#987765',wallDark:'#594b43',trim:'#baa998',wood:'#5c493a',woodLight:'#98785b',metal:'#969b98',foam:'#514942',brick:'#a07964',light:'#f8c98d'},
        library:{wall:'#6b745f',wallDark:'#414b3f',trim:'#b8a982',wood:'#51402e',woodLight:'#8c704c',metal:'#a29f8c',foam:'#465143',brick:'#786654',light:'#f4c788'},
        night:{wall:'#444856',wallDark:'#292e3d',trim:'#9b948d',wood:'#594740',woodLight:'#896b58',metal:'#929496',foam:'#363a48',brick:'#755e59',light:'#f2b783'}
    };
    const views={
        city:{sky:['#81949a','#b7b4a3'],ridge:'#829196',far:'#697d82',near:'#4e646d',glow:'#dbc6a4'},
        dusk:{sky:['#7e8990','#c6ad8f'],ridge:'#89858a',far:'#687b80',near:'#4d626b',glow:'#e7c59c'},
        garden:{sky:['#b3c2b2','#ddd9bc'],ridge:'#91a08c',far:'#69846e',near:'#526f60',glow:'#dfd0a8'},
        gardenDusk:{sky:['#9da997','#d1bc9b'],ridge:'#81917c',far:'#607963',near:'#435e51',glow:'#e6c18d'},
        night:{sky:['#39485e','#67627a'],ridge:'#505a70',far:'#3f4e65',near:'#304056',glow:'#d7b8a1'}
    };

    // Each room lists the same kinds of objects. Layer controls blur and canvas parallax.
    const scenes={
        studio:{material:'studio',floor:'carpet',objects:[
            object('foam',80,170,{w:650,h:890,cols:7,rows:3,layer:'far'}),
            object('foam',1670,170,{w:650,h:890,cols:7,rows:3,layer:'far'}),
            windowAt(840,260,720,520,'city',{light:{shape:'rect',strength:.20,rgb:[195,220,221]}}),
            art(940,95,520,105,{kind:'wave',layer:'near'}),
            lamp(350,500,'bar',{w:48,h:130,rgb:[255,193,123],strength:.53}),
            lamp(2030,500,'bar',{w:48,h:130,rgb:[255,193,123],strength:.48}),
            shelf(190,1040,2020,{kind:'vinyl',rows:2,layer:'mid'}),
            object('console',850,1110,{w:700,h:175,layer:'near'})
        ]},
        listening:{material:'listening',floor:'wood',objects:[
            object('woodPanels',0,120,{w:2400,h:1210,layer:'far'}),
            windowAt(990,250,420,570,'garden',{light:{shape:'rect',strength:.25,rgb:[223,223,177]}}),
            art(140,240,340,420,{kind:'disc'}),art(1910,235,350,420,{kind:'wave'}),
            lamp(550,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.57}),
            lamp(1850,430,'bar',{w:48,h:130,rgb:[255,193,122],strength:.52}),
            shelf(145,940,2110,{kind:'books',rows:3,layer:'mid'}),
            object('plant',110,710,{size:230,layer:'near'}),
            object('console',855,1090,{w:690,h:190,layer:'near'})
        ]},
        loft:{material:'loft',floor:'concrete',objects:[
            object('brick',0,120,{w:2400,h:1130,layer:'far'}),
            windowAt(220,190,520,930,'dusk',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            windowAt(930,190,520,930,'dusk',{light:{shape:'rect',strength:.21,rgb:[224,224,204]}}),
            windowAt(1640,190,520,930,'dusk',{light:{shape:'rect',strength:.20,rgb:[224,224,204]}}),
            lamp(480,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1200,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            lamp(1920,485,'pendant',{w:115,h:60,rgb:[255,216,155],strength:.49}),
            shelf(390,1200,1620,{kind:'vinyl',rows:1,layer:'near'}),
            object('plant',2140,1050,{size:200,layer:'near'})
        ]},
        library:{material:'library',floor:'wood',objects:[
            object('woodPanels',0,120,{w:2400,h:1200,layer:'far'}),
            shelf(115,200,680,{kind:'books',rows:5,layer:'mid'}),
            shelf(1600,200,680,{kind:'books',rows:5,layer:'mid'}),
            windowAt(965,350,460,490,'gardenDusk',{light:{shape:'rect',strength:.17,rgb:[206,193,152]}}),
            art(1030,900,350,240,{kind:'disc'}),
            lamp(710,300,'bar',{w:48,h:130,rgb:[255,224,162],strength:.54}),
            lamp(1690,300,'bar',{w:48,h:130,rgb:[255,224,162],strength:.54}),
            object('console',820,1130,{w:760,h:145,layer:'near'}),
            object('plant',2200,1080,{size:180,layer:'near'})
        ]},
        night:{material:'night',floor:'wood',objects:[
            object('brick',0,100,{w:2400,h:1200,layer:'far'}),
            windowAt(120,130,2160,1010,'night',{light:{shape:'rect',strength:.24,rgb:[153,174,224]}}),
            object('woodPanels',60,1090,{w:2280,h:280,layer:'mid'}),
            shelf(250,1180,1900,{kind:'vinyl',rows:1,layer:'near'}),
            lamp(320,365,'bar',{w:48,h:130,rgb:[255,178,144],strength:.54}),
            lamp(2080,365,'bar',{w:48,h:130,rgb:[181,188,255],strength:.50}),
            art(1070,1160,260,120,{kind:'wave',layer:'near'})
        ]}
    };

    function defs(m){return `<defs>
      <linearGradient id="wall" x2="1" y2=".4"><stop stop-color="${m.wall}"/><stop offset=".52" stop-color="${m.wallDark}"/><stop offset="1" stop-color="${m.wall}"/></linearGradient>
      <linearGradient id="wood" x2=".9" y2="1"><stop stop-color="${m.woodLight}"/><stop offset=".52" stop-color="${m.wood}"/><stop offset="1" stop-color="${m.woodLight}"/></linearGradient>
      <linearGradient id="metal"><stop stop-color="${m.metal}"/><stop offset=".16" stop-color="#c5bdb0"/><stop offset=".42" stop-color="${m.metal}"/><stop offset=".82" stop-color="#58615e"/><stop offset="1" stop-color="${m.metal}"/></linearGradient>
      <linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#e7e0ca" stop-opacity=".18"/><stop offset=".48" stop-color="#35434a" stop-opacity=".42"/><stop offset="1" stop-color="#c3cfc7" stop-opacity=".12"/></linearGradient>
      <radialGradient id="ambient"><stop stop-color="${m.light}" stop-opacity=".19"/><stop offset=".46" stop-color="${m.light}" stop-opacity=".07"/><stop offset="1" stop-color="${m.light}" stop-opacity="0"/></radialGradient>
      <pattern id="grain" width="165" height="63" patternUnits="userSpaceOnUse"><path d="M0 9q38-5 85 0t80-2M0 26q70 7 118 0t47 1M0 51q53-7 97-1t68 0" fill="none" stroke="#e0c9a5" stroke-opacity=".11" stroke-width="1.4"/><path d="M0 17q65 4 165 0M0 39q90-5 165 2" fill="none" stroke="#342820" stroke-opacity=".09" stroke-width="1.5"/></pattern>
      <pattern id="foam" width="36" height="38" patternUnits="userSpaceOnUse"><rect width="36" height="38" fill="${m.foam}"/><path d="M1 0l16 19L1 38M17 0l18 19-18 19" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="8"/><path d="M19 0L35 19 19 38" fill="none" stroke="#fff" stroke-opacity=".11" stroke-width="4"/></pattern>
      <pattern id="brick" width="150" height="78" patternUnits="userSpaceOnUse"><rect width="150" height="78" fill="${m.wallDark}"/><path d="M0 1h148v35H0zM-75 40H73v36H-75zm152 0h148v36H77z" fill="${m.brick}" stroke="#43362f" stroke-opacity=".35" stroke-width="3"/><path d="M5 9h122M16 17h41M93 20h39M3 49h58M82 60h60" stroke="#eed1b1" stroke-opacity=".09" stroke-width="2"/></pattern>
    </defs>`;}

    function records(x,y,w,h,kind){
        const count=Math.max(1,Math.floor((w-40)/(kind==='vinyl'?16:14)));
        const colors=['#927a68','#6d7c78','#aa9476','#806f60','#52676a','#a47f69','#84918a'];
        return Array.from({length:count},(_,i)=>{
            const bw=(w-40)/count,xx=x+20+i*bw,hh=h*(.65+((i*7)%11)/35),yy=y+h-hh;
            return `<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${(bw-1.8).toFixed(1)}" height="${hh.toFixed(1)}" rx="1.5" fill="${colors[i%colors.length]}" opacity=".73"/><path d="M${(xx+2).toFixed(1)} ${yy+6}v${Math.max(0,hh-12).toFixed(1)}" stroke="#f3e5cc" stroke-opacity=".19" stroke-width="1.6"/>`;
        }).join('');
    }

    const renderers={
        woodPanels(o,m){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#wood)" opacity=".5"/><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#grain)"/>${Array.from({length:Math.floor(o.w/190)},(_,i)=>`<path d="M${o.x+i*190} ${o.y}v${o.h}" stroke="#30251e" stroke-opacity=".16" stroke-width="6"/><path d="M${o.x+i*190+5} ${o.y}v${o.h}" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>`).join('')}<path d="M${o.x} ${o.y+o.h*.74}h${o.w}m-${o.w} 12h${o.w}" stroke="${m.trim}" stroke-opacity=".17" stroke-width="4"/>`;},
        brick(o){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" fill="url(#brick)"/><path d="M${o.x} ${o.y+o.h-12}h${o.w}" stroke="#182127" stroke-width="24" opacity=".55"/>`;},
        foam(o,m){return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="8" fill="#121d23" stroke="${m.metal}" stroke-opacity=".25" stroke-width="12"/>${Array.from({length:o.rows},(_,r)=>Array.from({length:o.cols},(_,c)=>{const pw=o.w/o.cols-13,ph=o.h/o.rows-14,x=o.x+c*(o.w/o.cols)+7,y=o.y+r*(o.h/o.rows)+7;return `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="5" fill="url(#foam)" stroke="#a9b2ae" stroke-opacity=".1" stroke-width="3"/>`;}).join('')).join('')}`;},
        window(o,m){const {x,y,w,h}=o;return `<rect x="${x-22}" y="${y-22}" width="${w+44}" height="${h+44}" rx="12" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".44" stroke-width="8"/><rect x="${x-9}" y="${y-9}" width="${w+18}" height="${h+18}" rx="4" fill="#344047" stroke="url(#metal)" stroke-opacity=".53" stroke-width="5"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glass)"/><path d="M${x+w/2} ${y}v${h}M${x} ${y+h/2}h${w}" stroke="#303c3e" stroke-width="17"/><path d="M${x+22} ${y+17}h${w*.44}L${x+45} ${y+h-20}" fill="#f0e8cf" opacity=".055"/><path d="M${x-30} ${y+h+17}h${w+60}" stroke="${m.woodLight}" stroke-opacity=".72" stroke-width="15"/>`;},
        lamp(o,m){const {x,y}=o,w=o.w||48,h=o.h||130,color=o.rgb?`rgb(${o.rgb.join(' ')})`:m.light;
            const glow=`<defs><radialGradient id="glow-${x}-${y}"><stop stop-color="${color}" stop-opacity=".4"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><linearGradient id="shade-${x}-${y}"><stop stop-color="${m.woodLight}"/><stop offset=".3" stop-color="${color}" stop-opacity=".88"/><stop offset=".7" stop-color="${color}" stop-opacity=".88"/><stop offset="1" stop-color="${m.woodLight}"/></linearGradient></defs>`;
            return glow+(o.shape==='pendant'
            ?`<path d="M${x} 75v${y-125}" stroke="${m.metal}" stroke-opacity=".75" stroke-width="7"/><ellipse cx="${x}" cy="${y+8}" rx="175" ry="135" fill="url(#glow-${x}-${y})"/><path d="M${x-82} ${y-84}h164l-33 86h-98z" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".68" stroke-width="7"/><path d="M${x-49} ${y+3}h98" stroke="${m.metal}" stroke-width="8"/><ellipse cx="${x}" cy="${y+10}" rx="44" ry="16" fill="${color}" opacity=".65"/>`
            :`<ellipse cx="${x}" cy="${y}" rx="210" ry="295" fill="url(#glow-${x}-${y})"/><rect x="${x-w*.77}" y="${y-h*.65}" width="${w*1.54}" height="${h*1.3}" rx="${w*.55}" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".54" stroke-width="5"/><rect x="${x-w*.42}" y="${y-h*.48}" width="${w*.84}" height="${h*.96}" rx="${w*.42}" fill="url(#shade-${x}-${y})"/><path d="M${x-w*.55} ${y-h*.52}h${w*1.1}M${x-w*.55} ${y+h*.52}h${w*1.1}" stroke="url(#metal)" stroke-width="6" stroke-linecap="round"/><path d="M${x} ${y-h*.44}v${h*.88}" stroke="#fff5d3" stroke-opacity=".36" stroke-width="3"/>`);},
        shelf(o,m){const rows=o.rows||2,rowH=o.kind==='vinyl'?125:110,h=rowH*rows+45;return `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${h}" rx="11" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".52" stroke-width="8"/><rect x="${o.x+10}" y="${o.y+8}" width="${o.w-20}" height="${h-18}" fill="#252522" opacity=".22"/>${Array.from({length:rows},(_,r)=>{const yy=o.y+20+r*rowH;return `<rect x="${o.x+16}" y="${yy}" width="${o.w-32}" height="${rowH-10}" fill="#222522" opacity=".22"/>${records(o.x+20,yy+8,o.w-40,rowH-24,o.kind)}<path d="M${o.x+5} ${yy+rowH}h${o.w-10}" stroke="${m.woodLight}" stroke-opacity=".68" stroke-width="13"/>`;}).join('')}<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${h}" fill="url(#grain)" opacity=".32"/>`;},
        art(o,m){const {x,y,w,h}=o,disc=o.kind==='disc';return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".48" stroke-width="9"/><rect x="${x+18}" y="${y+18}" width="${w-36}" height="${h-36}" fill="${disc?m.wallDark:m.wood}"/>${disc?`<circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)*.31}" fill="#28302e" stroke="${m.trim}" stroke-opacity=".6" stroke-width="3"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${Math.min(w,h)*.13}" fill="${m.light}" opacity=".57"/><circle cx="${x+w/2}" cy="${y+h/2}" r="4" fill="#39423d"/>`:`<path d="M${x+26} ${y+h*.58}q${w*.12} -${h*.9} ${w*.24} 0t${w*.24} 0t${w*.24} 0t${w*.24} 0" fill="none" stroke="${m.light}" stroke-width="6" opacity=".56"/><path d="M${x+26} ${y+h*.78}h${w-52}" stroke="${m.metal}" stroke-opacity=".4" stroke-width="3"/>`}`;},
        plant(o,m){const s=o.size,x=o.x,y=o.y;return `<path d="M${x-s*.22} ${y+s*.58}h${s*.44}l-${s*.055} ${s*.42}h-${s*.33}z" fill="url(#wood)" stroke="${m.trim}" stroke-opacity=".6" stroke-width="5"/><path d="M${x} ${y+s*.58}v-${s*.48}m0 ${s*.3}l-${s*.28}-${s*.32}m${s*.28} ${s*.27}l${s*.27}-${s*.4}" stroke="#314b3b" stroke-width="8" fill="none"/>${[-2,-1,0,1,2].map(i=>`<path d="M${x+i*s*.07} ${y+s*.25}q${i*s*.13} -${s*.3} ${i*s*.13} -${s*.36}q${s*.18} ${s*.27} ${-i*s*.13} ${s*.36}" fill="${i%2?'#466b52':'#64846a'}" stroke="#274533" stroke-width="2"/>`).join('')}<path d="M${x-s*.18} ${y+s*.61}h${s*.36}" stroke="${m.metal}" stroke-width="6"/>`;},
        console(o,m){return `<path d="M${o.x+42} ${o.y+o.h-8}l-12 57h24l20-57m${o.w-116} 0l20 57h24l-12-57" fill="${m.wood}" stroke="${m.trim}" stroke-opacity=".28" stroke-width="4"/><rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="15" fill="url(#wood)" stroke="${m.trim}" stroke-opacity=".55" stroke-width="7"/><rect x="${o.x+17}" y="${o.y+17}" width="${o.w-34}" height="${o.h-34}" fill="url(#grain)" opacity=".54"/>${[1,2,3].map(i=>`<path d="M${o.x+o.w*i/4} ${o.y+17}v${o.h-34}" stroke="#34271f" stroke-opacity=".32" stroke-width="4"/><path d="M${o.x+o.w*(i-.5)/4-13} ${o.y+o.h*.55}h26" stroke="url(#metal)" stroke-opacity=".72" stroke-width="5" stroke-linecap="round"/>`).join('')}`;}
    };

    function renderLayer(sceneName,layer){
        const scene=scenes[sceneName],m=materials[scene.material];
        const background=layer==='far'?`<rect width="2400" height="1600" fill="url(#wall)"/>`:'';
        const objects=scene.objects.filter(item=>item.layer===layer).map(item=>renderers[item.type](item,m)).join('');
        const atmosphere=layer==='far'?scene.objects.filter(item=>item.type==='lamp').map(item=>`<ellipse cx="${item.x}" cy="${item.y+45}" rx="${item.shape==='pendant'?330:380}" ry="${item.shape==='pendant'?300:420}" fill="url(#ambient)"/>`).join(''):'';
        const trim=layer==='far'?`<path d="M0 112h2400M0 1322h2400" stroke="${m.trim}" stroke-opacity=".25" stroke-width="8"/><path d="M0 1329h2400" stroke="${m.wood}" stroke-opacity=".55" stroke-width="16"/>`:'';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1600" preserveAspectRatio="none">${defs(m)}${background}<g transform="translate(240 268) scale(.8)">${objects}${atmosphere}${trim}</g></svg>`;
    }

    function renderVista(vista,index,layer){
        const p=views[vista],night=vista==='night';
        const skyline=Array.from({length:15},(_,i)=>{const x=i*47-20+(index*17)%23,h=85+(i*41)%150,y=450-h;return `<rect x="${x}" y="${y}" width="42" height="${h}" fill="${i%3?p.near:p.far}"/><path d="M${x+10} ${y+18}v${h-34}m10-${h-34}v${h-34}m10-${h-34}v${h-34}" stroke="${p.glow}" stroke-opacity="${night?.35:.15}" stroke-width="2" stroke-dasharray="4 16"/>`;}).join('');
        const trees=Array.from({length:12},(_,i)=>{const x=i*58-4+(index*29)%33,y=325+(i*19)%55;return `<path d="M${x} ${y+28}v96" stroke="${p.near}" stroke-width="8"/><circle cx="${x-12}" cy="${y+7}" r="27" fill="${p.far}"/><circle cx="${x+11}" cy="${y}" r="30" fill="${p.near}"/>`;}).join('');
        const stars=night?Array.from({length:24},(_,i)=>`<circle cx="${(i*179+index*31)%640}" cy="${(i*83)%210+9}" r="${i%5?1:2}" fill="#e3e7e5" opacity=".5"/>`).join(''):'';
        return `<svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sky" x2=".2" y2="1"><stop stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient></defs>${layer==='far'?`<rect width="640" height="450" fill="url(#sky)"/>${stars}<path d="M0 285Q105 235 213 284T420 263T640 278V450H0Z" fill="${p.ridge}" opacity=".75"/><path d="M0 338Q130 295 280 327T640 316V450H0Z" fill="${p.far}" opacity=".55"/>`:(vista.startsWith('garden')?trees:skyline)}</svg>`;
    }

    function windowPanes(name){return (scenes[name]?.objects||[]).filter(item=>item.type==='window').map((pane,index)=>{
        const left=(240+pane.x*.8)/24,top=(268+pane.y*.8)/16,width=pane.w*.8/24,height=pane.h*.8/16;
        return `<div class="room-window-pane" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%"><div class="room-window-far">${renderVista(pane.vista,index,'far')}</div><div class="room-window-mid">${renderVista(pane.vista,index,'mid')}</div><i class="room-window-glass"></i><i class="room-window-mullion"></i></div>`;
    }).join('');}

    const lightCache=new Map();
    function lights(name){if(lightCache.has(name))return lightCache.get(name);
        const sources=(scenes[name]?.objects||[]).filter(item=>item.light||item.type==='lamp').map(item=>{
        const custom=item.light||{},w=custom.w||item.w||48,h=custom.h||item.h||130;
        return {cx:item.x+(item.type==='window'?item.w/2:0),cy:item.y+(item.type==='window'?item.h/2:0),w,h,shape:custom.shape||item.shape||'rect',rgb:custom.rgb||item.rgb,strength:custom.strength||item.strength,layer:item.layer};
    });lightCache.set(name,sources);return sources;}

    window.RoomScenes={scenes,materials,renderLayer,windowPanes,lights};
})();
