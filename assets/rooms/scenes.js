/* Three image-backed rooms with original and illustrated variants. Window emitters share the equipment-lighting pipeline. */
(function () {
    'use strict';

    // Horizon positions use the images' equivalent 720 px height; rendering aligns each one to y=550.
    const originalScenes={
        studio:{image:'studio',floor:'carpet',horizon:{dawn:544,dusk:543,night:543},windows:[{x:1200,y:520,w:900,h:250}]},
        listening:{image:'listening',floor:'wood',horizon:{dawn:557,dusk:557,night:557},windows:[{x:90,y:450,w:420,h:650}]},
        loft:{image:'loft',floor:'concrete',horizon:{dawn:536,dusk:536,night:532},windows:[{x:185,y:470,w:590,h:650},{x:1200,y:470,w:590,h:650},{x:2215,y:470,w:590,h:650}]}
    };
    const scenes=Object.freeze({
        ...originalScenes,
        studioIllustrated:{...originalScenes.studio,image:'studio-illustrated',timeImageBase:'studio'},
        listeningIllustrated:{...originalScenes.listening,image:'listening-illustrated',timeImageBase:'listening'},
        loftIllustrated:{...originalScenes.loft,image:'loft-illustrated',timeImageBase:'loft'}
    });
    const times=Object.freeze({
        dawn:{rgb:[255,222,177],strength:1.1},
        dusk:{rgb:[255,185,124],strength:.78},
        night:{rgb:[125,164,222],strength:.23}
    });
    function imageForTime(scene,time='dusk'){
        if(!scene)return '';
        const base=time==='dusk'?scene.image:(scene.timeImageBase||scene.image);
        return base+(time==='dusk'?'':`-${time}`);
    }
    function lights(name,time='dusk'){
        const scene=scenes[name],daylight=times[time]||times.dusk;
        return (scene?.windows||[]).map((window,index)=>({
            id:`${name}-window-${index}`,type:'lightPoint',visible:false,
            cx:window.x,cy:window.y,w:window.w,h:window.h,
            shape:'rect',rgb:daylight.rgb,strength:daylight.strength,
            elevation:260,layer:'far'
        }));
    }
    // Glass-only polygons in the source images' 1672 × 941 coordinate space.
    // Leave a small inset around painted frames, mullions and the curved heads.
    function rainGlass(name){
        if(name.startsWith('studio'))return [[[[540,236],[1130,236],[1130,446],[540,446]]]];
        if(name.startsWith('listening'))return [[[[3,5],[35,5],[201,90],[201,705],[3,750]]]];
        const columns=[[[49,120],[135,203],[220,290],[306,375]],[[678,749],[766,833],[850,917],[934,1005]],[[1305,1375],[1393,1460],[1478,1546],[1563,1631]]];
        const rows=[[86,175],[194,291],[316,418],[439,552]];
        return columns.map(window=>window.flatMap(([left,right],col)=>rows.map(([top,bottom],row)=>{
            // The top lights follow the arch; middle columns start higher.
            const archTop=row===0?(col===1||col===2?65:top):top;
            return [[left,archTop],[right,archTop],[right,bottom],[left,bottom]];
        })));
    }
    window.RoomScenes={scenes,times,lights,imageForTime,rainGlass};
})();
