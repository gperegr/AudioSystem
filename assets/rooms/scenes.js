/* Panoramic rooms: one geometry and one decoded image per room for all three light settings. */
(function () {
    'use strict';
    // Glass bounds measured on the final 2304 × 720 WebPs, inset from painted frames.
    // Loft columns share three rows; the gaps are the steel mullions, not glass.
    const loftRows=[[58,151],[165,260],[273,378]];
    const definitions={
        studio:{image:'studio-wide',floor:'carpet',projection:{x:24,y:190},panes:[
            [[436,95,779,381],[801,95,1143,381],[1162,95,1507,381],[1527,95,1870,381]]
        ]},
        listening:{image:'listening-wide',floor:'wood',projection:{x:0,y:115},panes:[
            [[9,40,313,506],[350,40,634,506]],
            [[1671,40,1959,506],[1993,40,2297,506]]
        ]},
        loft:{image:'loft-wide',floor:'concrete',projection:{x:32,y:195},panes:[
            [[129,224],[237,335],[348,447],[460,555],[568,660]],
            [[893,990],[1003,1098],[1112,1208],[1221,1316],[1330,1421]],
            [[1667,1758],[1771,1865],[1879,1974],[1987,2083],[2096,2188]]
        ].map(columns=>columns.flatMap(([left,right])=>loftRows.map(([top,bottom])=>[left,top,right,bottom])))}
    };
    const scenes={};
    for(const [name,definition] of Object.entries(definitions)){
        const glass=definition.panes.map(group=>group.map(([left,top,right,bottom])=>[[left,top],[right,top],[right,bottom],[left,bottom]]));
        const windows=definition.panes.map(group=>{
            const left=Math.min(...group.map(p=>p[0])),top=Math.min(...group.map(p=>p[1]));
            const w=Math.max(...group.map(p=>p[2]))-left,h=Math.max(...group.map(p=>p[3]))-top;
            return {x:left+w/2,y:top+h/2,w,h};
        });
        const scene=Object.freeze({image:definition.image,floor:definition.floor,width:2304,height:720,horizon:Object.freeze({dawn:530,dusk:530,night:530}),glass,windows,projection:definition.projection});
        scenes[name]=scene;scenes[name+'Illustrated']=scene;
    }
    Object.freeze(scenes);
    const times=Object.freeze({
        dawn:{rgb:[255,222,177],strength:1.1},
        dusk:{rgb:[255,185,124],strength:.78},
        night:{rgb:[125,164,222],strength:.23}
    });
    function imageForTime(scene){return scene?.image||'';}
    function lights(name,time='dusk'){
        const scene=scenes[name],daylight=times[time]||times.dusk;
        return (scene?.windows||[]).map((window,index)=>({
            id:`${name}-window-${index}`,type:'lightPoint',visible:false,
            cx:window.x,cy:window.y,w:window.w,h:window.h,
            shape:'rect',rgb:daylight.rgb,strength:daylight.strength,
            elevation:260,layer:'far'
        }));
    }
    // Project an illuminated dust sample from a particular glass opening into the room.
    // All coordinates remain in source pixels until the renderer applies the image transform.
    function particlePoint(name,windowIndex,paneIndex,u,v,depth){
        const scene=scenes[name],pane=scene?.glass[windowIndex]?.[paneIndex];
        if(!pane)return null;
        const [left,top]=pane[0],[right,bottom]=pane[2];
        return {x:left+(right-left)*u+scene.projection.x*depth,y:top+(bottom-top)*v+scene.projection.y*depth};
    }
    function rainGlass(name){return scenes[name]?.glass||[];}
    window.RoomScenes={scenes,times,lights,imageForTime,rainGlass,particlePoint};
})();
