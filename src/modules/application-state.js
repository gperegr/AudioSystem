/* Domain-owned application state with named actions and a temporary legacy facade. */
((root,factory)=>{
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.AudioSystemApplicationState=api;
})(globalThis,()=>{
    'use strict';

    const aliases=Object.freeze({
        devices:['project','devices'],connections:['project','connections'],restoringProject:['project','restoringProject'],adapterRotation:['project','adapterRotation'],
        canvasTheme:['canvas','theme'],canvasGrid:['canvas','grid'],canvasBackdrop:['canvas','backdrop'],canvasTime:['canvas','time'],canvasFloor:['canvas','floor'],hideCables:['canvas','hideCables'],
        audioCtx:['audio','context'],masterGain:['audio','masterGain'],isPlaying:['audio','isPlaying'],playing:['audio','playing'],environment:['audio','environment'],seqInterval:['audio','sequenceInterval'],roomAudio:['audio','roomAudio'],listeningToneInput:['audio','listeningToneInput'],listeningToneFilters:['audio','listeningToneFilters'],
        listeningOutputLevel:['preferences','listening.outputLevel'],listeningBass:['preferences','listening.bass'],listeningTreble:['preferences','listening.treble'],uiSoundVolume:['preferences','uiSoundVolume'],equipmentSoundVolume:['preferences','equipmentSoundVolume'],
        selectedDeviceId:['interface','selectedDeviceId'],selectedDeviceIds:['interface','selectedDeviceIds'],selectedConnection:['interface','selectedConnection'],pairingId:['interface','pairingId'],hardwareDemo:['interface','hardwareDemo']
    });

    function createStore(initial={}){
        const domains={
            project:{devices:{},connections:[],restoringProject:false,adapterRotation:0},
            canvas:{theme:'scene',grid:'dots',backdrop:'loftIllustrated',time:'dusk',floor:null,hideCables:false},
            audio:{isPlaying:false,playing:false,context:null,masterGain:null,environment:{preset:'small',intensity:5},sequenceInterval:null,roomAudio:null,listeningToneInput:null,listeningToneFilters:null},
            preferences:{connectionGuidanceEnabled:true,roomParticleAmount:25,developerModeEnabled:false,headphonePromptSeen:false,listening:{outputLevel:1,bass:0,treble:0},uiSoundVolume:.5,equipmentSoundVolume:.5},
            interface:{selectedDeviceId:null,selectedDeviceIds:new Set(),selectedConnection:null,pairingId:null,hardwareDemo:null},
            legacy:{}
        };
        for(const [name,value]of Object.entries(initial))if(Object.hasOwn(domains,name)&&value&&typeof value==='object')Object.assign(domains[name],value);
        const listeners=new Set();
        function readPath(domain,path){return path.split('.').reduce((value,key)=>value?.[key],domains[domain]);}
        function writePath(domain,path,value){
            const keys=path.split('.');let target=domains[domain];
            for(const key of keys.slice(0,-1)){if(!target[key]||typeof target[key]!=='object')target[key]={};target=target[key];}
            target[keys.at(-1)]=value;
        }
        function dispatch(action){
            if(!action||typeof action.type!=='string')throw new TypeError('A state action must have a type.');
            let domain,path,value,applied=false;
            if(action.type==='project/deviceRegistered'){
                domains.project.devices[action.device.id]=action.device;domain='project';path=`devices.${action.device.id}`;value=action.device;applied=true;
            }else if(action.type==='project/deviceRemoved'){
                value=domains.project.devices[action.id]||null;delete domains.project.devices[action.id];domain='project';path=`devices.${action.id}`;applied=true;
            }else if(action.type==='project/connectionAdded'){
                domains.project.connections.push(action.connection);domain='project';path='connections';value=action.connection;applied=true;
            }else if(action.type==='project/connectionRemoved'){
                value=domains.project.connections.splice(action.index,1)[0]||null;domain='project';path='connections';applied=true;
            }else if(action.type==='project/restorationChanged'){
                domain='project';path='restoringProject';value=!!action.value;
            }else if(action.type==='domain/set')({domain,path,value}=action);
            else if(action.type==='canvas/themeChanged'){domain='canvas';path='theme';value=action.value;}
            else if(action.type==='canvas/gridChanged'){domain='canvas';path='grid';value=action.value;}
            else if(action.type==='canvas/backdropChanged'){domain='canvas';path='backdrop';value=action.value;}
            else if(action.type==='canvas/timeChanged'){domain='canvas';path='time';value=action.value;}
            else if(action.type==='canvas/settingChanged'){domain='canvas';path=action.key;value=action.value;}
            else if(action.type==='preferences/listeningChanged'){
                domain='preferences';path='listening';value={...domains.preferences.listening,...action.value};
            }else if(action.type==='preferences/settingChanged'){
                domain='preferences';path=action.key;value=action.value;
            }else if(action.type==='audio/environmentChanged'){
                domain='audio';path='environment';value={...domains.audio.environment,...action.value};
            }else if(action.type==='audio/settingChanged'){
                domain='audio';path=action.key;value=action.value;
            }else throw new TypeError(`Unknown state action: ${action.type}`);
            if(!Object.hasOwn(domains,domain)||typeof path!=='string')throw new TypeError('Invalid state action target.');
            if(!applied)writePath(domain,path,value);
            const event=Object.freeze({type:action.type,domain,path,value});
            listeners.forEach(listener=>listener(event,domains));
            return value;
        }
        const legacyState=new Proxy({}, {
            get(_target,key){
                if(key==='domains')return domains;
                if(key==='dispatch')return dispatch;
                if(typeof key!=='string')return undefined;
                const [domain,path]=aliases[key]||['legacy',key];
                return readPath(domain,path);
            },
            set(_target,key,value){
                if(typeof key!=='string')return false;
                const [domain,path]=aliases[key]||['legacy',key];
                dispatch({type:'domain/set',domain,path,value});
                return true;
            },
            deleteProperty(_target,key){
                if(typeof key!=='string')return false;
                const [domain,path]=aliases[key]||['legacy',key],keys=path.split('.');let target=domains[domain];
                for(const part of keys.slice(0,-1))target=target?.[part];
                if(target)delete target[keys.at(-1)];
                const event=Object.freeze({type:'domain/delete',domain,path});listeners.forEach(listener=>listener(event,domains));
                return true;
            }
        });
        return Object.freeze({
            domains,legacyState,dispatch,
            subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);},
            actions:Object.freeze({
                setCanvasTheme:value=>dispatch({type:'canvas/themeChanged',value}),
                setCanvasGrid:value=>dispatch({type:'canvas/gridChanged',value}),
                setCanvasBackdrop:value=>dispatch({type:'canvas/backdropChanged',value}),
                setCanvasTime:value=>dispatch({type:'canvas/timeChanged',value}),
                setCanvasOption:(key,value)=>dispatch({type:'canvas/settingChanged',key,value}),
                setListeningPreferences:value=>dispatch({type:'preferences/listeningChanged',value}),
                setPreference:(key,value)=>dispatch({type:'preferences/settingChanged',key,value}),
                setAudioEnvironment:value=>dispatch({type:'audio/environmentChanged',value}),
                setAudioRuntime:(key,value)=>dispatch({type:'audio/settingChanged',key,value}),
                registerDevice:device=>dispatch({type:'project/deviceRegistered',device}),
                removeDevice:id=>dispatch({type:'project/deviceRemoved',id}),
                addConnection:connection=>dispatch({type:'project/connectionAdded',connection}),
                removeConnection:index=>dispatch({type:'project/connectionRemoved',index}),
                setProjectRestoring:value=>dispatch({type:'project/restorationChanged',value}),
                setSelectedDevice:value=>dispatch({type:'domain/set',domain:'interface',path:'selectedDeviceId',value}),
                setSelectedDevices:value=>dispatch({type:'domain/set',domain:'interface',path:'selectedDeviceIds',value}),
                setSelectedConnection:value=>dispatch({type:'domain/set',domain:'interface',path:'selectedConnection',value}),
                setPairingId:value=>dispatch({type:'domain/set',domain:'interface',path:'pairingId',value})
            })
        });
    }
    return Object.freeze({createStore});
});
