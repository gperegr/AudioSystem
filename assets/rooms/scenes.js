/* Three image-backed rooms. Window emitters share the equipment-lighting pipeline. */
(function () {
    'use strict';

    const scenes=Object.freeze({
        studio:{image:'studio',floor:'carpet',windows:[{x:1200,y:520,w:900,h:250}]},
        listening:{image:'listening',floor:'wood',windows:[{x:90,y:450,w:420,h:650}]},
        loft:{image:'loft',floor:'concrete',windows:[{x:185,y:470,w:590,h:650},{x:1200,y:470,w:590,h:650},{x:2215,y:470,w:590,h:650}]}
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
