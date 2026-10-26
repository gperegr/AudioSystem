/* Passive audio adapters. Artwork and connector positions share canvas coordinates. */
const AudioAdapterDesign = (() => {
    const models = Object.freeze({
        adapterP2P10:{input:'p2',output:'p10',width:228,height:70,finish:'gold'},
        adapterP10P2:{input:'p10',output:'p2',width:228,height:70,finish:'silver'},
        adapterP2Rca:{input:'p2',output:'rca',width:300,height:128},
        adapterP10Rca:{input:'p10',output:'rca',width:300,height:128},
        adapterRcaP2:{input:'rca',output:'p2',width:300,height:128},
        adapterRcaP10:{input:'rca',output:'p10',width:300,height:128}
    });
    const angle = value => {const n=Number(value);return Number.isFinite(n)?((Math.round(n/90)*90)%360+360)%360:0;};
    const silhouettes=new Map();
    function silhouette(type,rotation){
        const key=type+':'+rotation;if(silhouettes.has(key))return silhouettes.get(key);
        const m=models[type],vertical=rotation%180!==0,w=vertical?m.height:m.width,h=vertical?m.width:m.height;
        const art=svg(type,'mask-'+type).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
        const image=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g transform="translate(${w/2} ${h/2}) rotate(${rotation}) translate(${-m.width/2} ${-m.height/2})">${art}</g></svg>`;
        const mask=`url("data:image/svg+xml,${encodeURIComponent(image)}")`;silhouettes.set(key,mask);return mask;
    }
    function svg(type,prefix='adapter') {
        const m=models[type];if(!m)return '';
        const gold=m.finish==='gold',metal=gold?['#99732b','#f8e4a0','#c5a24f','#806022']:['#6b7275','#edf0ee','#b4b9b8','#60686b'];
        const defs=`<defs><linearGradient id="${prefix}-metal" x2="0" y2="1"><stop stop-color="${metal[0]}"/><stop offset=".2" stop-color="${metal[1]}"/><stop offset=".5" stop-color="${metal[2]}"/><stop offset=".76" stop-color="${metal[1]}"/><stop offset="1" stop-color="${metal[3]}"/></linearGradient><linearGradient id="${prefix}-shell" x2="0" y2="1"><stop stop-color="#1b2023"/><stop offset=".3" stop-color="#535b5f"/><stop offset=".55" stop-color="#30383c"/><stop offset="1" stop-color="#11171a"/></linearGradient><linearGradient id="${prefix}-pin" x2="0" y2="1"><stop stop-color="#a58136"/><stop offset=".3" stop-color="#f7e4a7"/><stop offset=".6" stop-color="#c8aa60"/><stop offset=".8" stop-color="#f9e9b1"/><stop offset="1" stop-color="#8c702e"/></linearGradient></defs>`;
        let art='';
        if(m.finish){
            art=`<rect x="18" y="13" width="111" height="44" rx="8" fill="url(#${prefix}-metal)" stroke="${metal[3]}"/><path d="M32 15v40m78-40v40M23 22h98M23 48h98" fill="none" stroke="${metal[3]}" stroke-width="1"/>`;
            for(let x=38;x<108;x+=4)art+=`<path d="m${x} 17 8 36m-8 0 8-36" stroke="${metal[3]}" opacity=".32" stroke-width=".65"/>`;
            art+=`<ellipse cx="18" cy="35" rx="10" ry="21" fill="${metal[0]}" stroke="${metal[1]}"/><ellipse cx="18" cy="35" rx="6" ry="13" fill="#101517"/><rect x="126" y="21" width="16" height="28" rx="2" fill="url(#${prefix}-metal)" stroke="${metal[3]}"/><path d="M142 ${m.output==='p10'?24:28}H199Q213 30 218 35Q213 40 199 ${m.output==='p10'?46:42}H142Z" fill="url(#${prefix}-metal)" stroke="${metal[3]}"/><path d="M174 ${m.output==='p10'?24:28}v${m.output==='p10'?22:14}m20-${m.output==='p10'?22:14}v${m.output==='p10'?22:14}" stroke="#161c1e" stroke-width="4"/>`;
        }else{
            const rcaIn=m.input==='rca',join=rcaIn?180:120;
            const wires=rcaIn?['M90 32C132 32 142 64 202 64','M90 96C132 96 142 64 202 64']:['M98 64C156 64 166 32 202 32','M98 64C156 64 166 96 202 96'];
            wires.forEach(d=>art+=`<path d="${d}" fill="none" stroke="#0b1013" stroke-width="9"/><path d="${d}" fill="none" stroke="#657077" stroke-width="2" opacity=".55"/>`);
            art+=`<rect x="${join}" y="54" width="18" height="20" rx="5" fill="url(#${prefix}-shell)"/>`;
            function plug(x,y,rca,color,left){
                const body=rca?58:64,pinRadius=!rca&&m.output==='p10'?8:5;
                const tip=left?`<ellipse cx="${body+12}" cy="0" rx="6" ry="12" fill="url(#${prefix}-pin)" stroke="#7d642e"/><ellipse cx="${body+12}" cy="0" rx="3.5" ry="8" fill="#0c1215"/>`:`<path d="M${body+12}-${pinRadius}h12q6 ${pinRadius} 0 ${pinRadius*2}h-12Z" fill="url(#${prefix}-pin)"/>${rca?'':`<path d="M${body+16}-${pinRadius}v${pinRadius*2}m6-${pinRadius*2}v${pinRadius*2}" stroke="#13191b" stroke-width="2"/>`}`;
                return `<g transform="translate(${x} ${y})${left?' scale(-1 1)':''}"><rect x="0" y="-12" width="12" height="24" rx="3" fill="${color}"/><rect x="8" y="-16" width="${body}" height="32" rx="8" fill="url(#${prefix}-shell)" stroke="#11181b"/><path d="M20-12v24m5-24v24m5-24v24" stroke="#090e11" opacity=".55"/><rect x="${body+3}" y="-11" width="9" height="22" rx="2" fill="url(#${prefix}-pin)"/>${tip}</g>`;
            }
            if(rcaIn){art+=plug(98,32,true,'#d5d6cc',true)+plug(98,96,true,'#ab3d36',true)+plug(198,64,false,'#20292d',false);}
            else {art+=plug(102,64,false,'#20292d',true)+plug(198,32,true,'#d5d6cc',false)+plug(198,96,true,'#ab3d36',false);}
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${m.height}" width="${m.width}" height="${m.height}" aria-hidden="true">${defs}${art}</svg>`;
    }
    function ports(type){
        const m=models[type];
        return ['input','output'].flatMap(side=>{
            const io=side==='input'?'in':'out',format=m[side],x=side==='input'?(m.finish?18:format==='rca'?28:26):m.width-18;
            return (format==='rca'?['L','R']:['Stereo']).map((ch,i)=>({x,y:format==='rca'?(i?96:32):m.height/2,io,node:io+ch,format:format==='rca'?'rca-'+ch.toLowerCase():format,label:`${io==='in'?'Entrada':'Saída'} ${format==='rca'?'RCA '+ch:format.toUpperCase()+' TRS estéreo'}`}));
        });
    }
    function markup(type,prefix){const m=models[type];return `<div class="device-header"><span>Adaptador ${m.input.toUpperCase()} → ${m.output.toUpperCase()}</span></div><div class="adapter-object" style="width:${m.width}px;height:${m.height}px">${svg(type,prefix)}${ports(type).map(p=>`<div class="port adapter-port" style="left:${p.x}px;top:${p.y}px" data-type="${p.format}" data-io="${p.io}" data-node="${p.node}" title="${p.label}"></div>`).join('')}</div>`;}
    function layout(el,type,value=0){const m=models[type],rotation=angle(value),vertical=rotation%180!==0;el.style.setProperty('--adapter-angle',rotation+'deg');el.dataset.adapterRotation=String(rotation);el.style.setProperty('--lighting-silhouette-mask',silhouette(type,rotation));el.classList.add('lighting-shaped-silhouette');for(const [axis,size]of Object.entries({width:vertical?m.height:m.width,height:vertical?m.width:m.height}))for(const key of [axis,'min-'+axis,'max-'+axis])el.style.setProperty(key,size+'px','important');return rotation;}
    function icon(type){const m=models[type],rca=m.input==='rca'||m.output==='rca';return rca?`<g${m.input==='rca'?' transform="translate(56 0) scale(-1 1)"':''}><path d="M5 23h13q10 0 14-9h17M18 23q10 0 14 9h17"/><rect x="5" y="18" width="13" height="10" rx="4"/><rect x="36" y="9" width="12" height="10" rx="3"/><rect x="36" y="27" width="12" height="10" rx="3"/></g>`:'<path d="M8 17h24v12H8zM32 20h14l5 3-5 3H32M13 18v10m4-10v10m4-10v10m4-10v10M41 20v6m5-6v6"/><ellipse cx="8" cy="23" rx="4" ry="6"/>';}
    return Object.freeze({models,angle,svg,ports,markup,layout,icon});
})();
