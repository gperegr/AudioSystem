/* Panoramic rooms: one geometry and one decoded image per room for all three light settings. */
(function () {
    'use strict';
    const definitions={
        studio:{image:'studio-wide',floor:'carpet',panes:[
            [[433.86,91.29,779.67,381.94],[798.76,91.29,1143.51,381.94],[1159.43,91.29,1509.48,381.94],[1525.39,91.29,1875.45,381.94]]
        ]},
        listening:{image:'listening-wide',floor:'wood',panes:[
            [[7.53,37.21,313.92,509.5],[347.85,37.21,634.1,509.5]],
            [[1669.9,37.21,1955.09,509.5],[1990.08,37.21,2295.41,509.5]]
        ]},
        loft:{image:'loft-wide',floor:'concrete',panes:[
            [[126.23,56.98,224.88,151.39],[126.23,165.18,224.88,259.59],[126.23,272.32,224.88,377.34],[235.49,56.98,337.33,151.39],[235.49,165.18,337.33,259.59],[235.49,272.32,337.33,377.34],[346.87,56.98,447.65,151.39],[346.87,165.18,447.65,259.59],[346.87,272.32,447.65,377.34],[458.25,56.98,556.91,151.39],[458.25,165.18,556.91,259.59],[458.25,272.32,556.91,377.34],[567.51,56.98,659.8,151.39],[567.51,165.18,659.8,259.59],[567.51,272.32,659.8,377.34]],
            [[893.17,56.98,991.82,151.39],[893.17,165.18,991.82,259.59],[893.17,272.32,991.82,377.34],[1002.43,56.98,1100.02,151.39],[1002.43,165.18,1100.02,259.59],[1002.43,272.32,1100.02,377.34],[1110.63,56.98,1209.28,151.39],[1110.63,165.18,1209.28,259.59],[1110.63,272.32,1209.28,377.34],[1219.89,56.98,1317.48,151.39],[1219.89,165.18,1317.48,259.59],[1219.89,272.32,1317.48,377.34],[1329.15,56.98,1422.5,151.39],[1329.15,165.18,1422.5,259.59],[1329.15,272.32,1422.5,377.34]],
            [[1665.41,56.98,1759.82,151.39],[1665.41,165.18,1759.82,259.59],[1665.41,272.32,1759.82,377.34],[1771.49,56.98,1868.02,151.39],[1771.49,165.18,1868.02,259.59],[1771.49,272.32,1868.02,377.34],[1879.69,56.98,1978.34,151.39],[1879.69,165.18,1978.34,259.59],[1879.69,272.32,1978.34,377.34],[1988.95,56.98,2084.42,151.39],[1988.95,165.18,2084.42,259.59],[1988.95,272.32,2084.42,377.34],[2096.09,56.98,2191.56,151.39],[2096.09,165.18,2191.56,259.59],[2096.09,272.32,2191.56,377.34]]
        ]}
    };
    const scenes={};
    for(const [name,definition] of Object.entries(definitions)){
        const glass=definition.panes.map(group=>group.map(([left,top,right,bottom])=>[[left,top],[right,top],[right,bottom],[left,bottom]]));
        const windows=definition.panes.map(group=>{
            const left=Math.min(...group.map(p=>p[0])),top=Math.min(...group.map(p=>p[1]));
            const w=Math.max(...group.map(p=>p[2]))-left,h=Math.max(...group.map(p=>p[3]))-top;
            return {x:left+w/2,y:top+h/2,w,h};
        });
        const scene=Object.freeze({image:definition.image,floor:definition.floor,width:2304,height:720,horizon:Object.freeze({dawn:530,dusk:530,night:530}),glass,windows});
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
    function rainGlass(name){return scenes[name]?.glass||[];}
    window.RoomScenes={scenes,times,lights,imageForTime,rainGlass};
})();
