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
        studioIllustrated:{...originalScenes.studio,image:'studio-illustrated',timeImages:false},
        listeningIllustrated:{...originalScenes.listening,image:'listening-illustrated',timeImages:false},
        loftIllustrated:{...originalScenes.loft,image:'loft-illustrated',timeImages:false}
    });
    const times=Object.freeze({
        dawn:{rgb:[255,222,177],strength:1.1},
        dusk:{rgb:[255,185,124],strength:.78},
        night:{rgb:[125,164,222],strength:.23}
    });
    function lights(name,time='dusk'){
        const scene=scenes[name],daylight=times[time]||times.dusk;
        return (scene?.windows||[]).map((window,index)=>({
            id:`${name}-window-${index}`,type:'lightPoint',visible:false,
            cx:window.x,cy:window.y,w:window.w,h:window.h,
            shape:'rect',rgb:daylight.rgb,strength:daylight.strength,
            elevation:260,layer:'far'
        }));
    }
    window.RoomScenes={scenes,times,lights};
})();
