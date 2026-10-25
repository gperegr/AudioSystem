/* Spotify account and Coverflow furniture. Playback is separate from the AudioSystem signal graph. */
const SpotifyCoverflow=(()=>{
    const DEFAULT_CLIENT_ID='346af0eed59d4119b71d37808aec1f33';
    const TOKEN_KEY='audio-system-spotify-session';
    const VERIFIER_KEY='audio-system-spotify-verifier';
    const STATE_KEY='audio-system-spotify-state';
    const COVER_SIZE=400;
    const COVER_SPACING=38;
    const CLOSED_RADIUS=76;
    const OPEN_RADIUS=18;
    const REDIRECT=location.origin+location.pathname;
    const SCOPES='user-library-read playlist-read-private playlist-read-collaborative streaming user-read-email user-read-private user-modify-playback-state';
    const views=new Set();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const collections={albums:[],playlists:[]},loadedCollections={albums:false,playlists:false},loadPromises={albums:null,playlists:null},collectionStatus={albums:'',playlists:''};
    let status='Conecte sua conta Spotify para ver sua coleção.';
    const clientId=DEFAULT_CLIENT_ID;
    let sdkPromise=null,player=null,deviceId=null,playback=null,playbackUpdatedAt=0,trackRepeat=false,shuffleEnabled=false,beforeRedirect=()=>{},refreshPromise=null,inspector=null;
    const extracted=new Set();
    const trackLists=new Map();
    const tokenData=()=>{try{return JSON.parse(sessionStorage.getItem(TOKEN_KEY)||'null');}catch{return null;}};
    const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const random=()=>base64(crypto.getRandomValues(new Uint8Array(48)));
    const artist=item=>item.owner?.display_name||item.owner?.id||(item.artists||[]).map(part=>part.name).join(', ');
    const details=(item,mode)=>mode==='playlists'?`${artist(item)} · ${item.tracks?.total||0} faixas`:`${artist(item)} · ${(item.release_date||'').slice(0,4)}`;
    const shortTime=ms=>{const seconds=Math.max(0,Math.floor(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
    const sleeveOffset=distance=>COVER_SPACING*distance;
    function broadcast(){views.forEach(view=>view.refresh());}
    function setStatus(message){status=message;broadcast();}
    async function tokenRequest(params){
        const response=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,...params})});
        if(!response.ok)throw new Error(`Falha de autenticação (${response.status}).`);
        const data=await response.json(),previous=tokenData()||{};
        const saved={access:data.access_token,refresh:data.refresh_token||previous.refresh,expires:Date.now()+data.expires_in*1000-60000};
        sessionStorage.setItem(TOKEN_KEY,JSON.stringify(saved));return saved.access;
    }
    async function getToken(){
        const data=tokenData();if(!data)return null;
        if(Date.now()<data.expires)return data.access;
        if(!data.refresh)return null;
        try{refreshPromise||=tokenRequest({grant_type:'refresh_token',refresh_token:data.refresh});return await refreshPromise;}
        catch{sessionStorage.removeItem(TOKEN_KEY);setStatus('A sessão terminou. Conecte ao Spotify novamente.');return null;}
        finally{refreshPromise=null;}
    }
    async function login(){
        if(!crypto.subtle){setStatus('Abra o programa em HTTPS ou em 127.0.0.1 para conectar ao Spotify.');return;}
        const verifier=random(),state=random();
        sessionStorage.setItem(VERIFIER_KEY,verifier);sessionStorage.setItem(STATE_KEY,state);
        const challenge=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))));
        await beforeRedirect();
        location.assign('https://accounts.spotify.com/authorize?'+new URLSearchParams({response_type:'code',client_id:clientId,scope:SCOPES,redirect_uri:REDIRECT,code_challenge_method:'S256',code_challenge:challenge,state}));
    }
    function logout(){disconnect();sessionStorage.removeItem(TOKEN_KEY);trackLists.clear();for(const mode of ['albums','playlists']){collections[mode]=[];loadedCollections[mode]=false;loadPromises[mode]=null;collectionStatus[mode]='';}setStatus('Conta desconectada.');}
    async function spotifyFetch(url,options={}){
        for(let attempt=0;attempt<4;attempt++){
            const token=await getToken();if(!token)throw new Error('Conecte ao Spotify novamente.');
            const response=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,...options.headers}});
            if(response.status===429&&attempt<3){await new Promise(resolve=>setTimeout(resolve,Math.min(10000,(Number(response.headers.get('Retry-After'))||2)*1000)));continue;}
            if(response.status===401){sessionStorage.removeItem(TOKEN_KEY);throw new Error('A sessão terminou. Conecte novamente.');}
            return response;
        }
    }
    async function loadCollection(mode){
        if(!tokenData()||loadedCollections[mode])return;
        if(loadPromises[mode])return loadPromises[mode];
        loadPromises[mode]=(async()=>{
        collectionStatus[mode]=mode==='albums'?'Carregando álbuns salvos…':'Carregando playlists…';broadcast();
        try{
            let next=`https://api.spotify.com/v1/me/${mode}?limit=50`;const loaded=[];
            while(next){
                const response=await spotifyFetch(next);
                if(!response.ok)throw new Error(response.status===403?'Permissão insuficiente. Desconecte e conecte o Spotify novamente.':`Não foi possível carregar ${mode==='albums'?'os álbuns':'as playlists'} (${response.status}).`);
                const page=await response.json();loaded.push(...page.items.map(item=>mode==='albums'?item.album:item).filter(item=>item?.uri).map((item,index)=>({...item,_added:loaded.length+index})));
                next=page.next;collections[mode]=loaded.slice();collectionStatus[mode]=`Carregando ${mode==='albums'?'álbuns':'playlists'}… ${loaded.length} de ${page.total}`;broadcast();
            }
            collections[mode]=loaded;loadedCollections[mode]=true;collectionStatus[mode]=loaded.length?'':mode==='albums'?'Nenhum álbum salvo na sua biblioteca do Spotify.':'Nenhuma playlist encontrada na sua biblioteca do Spotify.';broadcast();
            if(views.size)ensurePlayer().catch(error=>setStatus(error.message));
        }catch(error){collectionStatus[mode]=error.message||'Não foi possível carregar a coleção.';broadcast();}
        finally{loadPromises[mode]=null;}
        })();return loadPromises[mode];
    }
    function sdk(){
        if(window.Spotify?.Player)return Promise.resolve();
        if(sdkPromise)return sdkPromise;
        sdkPromise=new Promise((resolve,reject)=>{
            window.onSpotifyWebPlaybackSDKReady=resolve;
            const script=document.createElement('script');script.src='https://sdk.scdn.co/spotify-player.js';script.async=true;
            script.onerror=()=>{sdkPromise=null;reject(new Error('Não foi possível carregar o player do Spotify.'));};
            document.head.append(script);
        });return sdkPromise;
    }
    async function ensurePlayer(){
        if(player||!tokenData())return;
        await sdk();if(player)return;
        player=new Spotify.Player({name:'AudioSystem · Discos',volume:.5,getOAuthToken:async callback=>callback(await getToken()||'')});
        player.addListener('ready',event=>{deviceId=event.device_id;broadcast();});
        player.addListener('not_ready',()=>{deviceId=null;broadcast();});
        player.addListener('player_state_changed',state=>{playback=state;playbackUpdatedAt=Date.now();trackRepeat=state?.repeat_mode===2;shuffleEnabled=!!state?.shuffle;broadcast();});
        player.addListener('account_error',()=>setStatus('Reprodução exige Spotify Premium.'));
        player.addListener('authentication_error',()=>setStatus('Sessão expirada. Conecte novamente.'));
        player.addListener('initialization_error',()=>setStatus('Este navegador não oferece suporte ao player do Spotify.'));
        player.addListener('playback_error',()=>setStatus('Não foi possível reproduzir esta faixa.'));
        try{if(!await player.connect())setStatus('O player do Spotify não conseguiu iniciar neste navegador.');}
        catch(error){setStatus(error.message||'Não foi possível iniciar o player.');}
    }
    function disconnect(){if(player){player.pause().catch(()=>{});player.disconnect();}player=null;deviceId=null;playback=null;shuffleEnabled=false;broadcast();}
    async function loadTracks(uri){
        if(!/^spotify:(album|playlist):[A-Za-z0-9]+$/.test(uri))throw new Error('Disco inválido.');
        if(trackLists.has(uri))return trackLists.get(uri);
        const loading=(async()=>{
            const [,kind,id]=uri.split(':'),tracks=[];
            let next=`https://api.spotify.com/v1/${kind==='album'?'albums':'playlists'}/${id}/tracks?limit=50`;
            while(next){
                const response=await spotifyFetch(next);
                if(!response.ok)throw new Error(`Não foi possível carregar as faixas (${response.status}).`);
                const page=await response.json();
                for(const entry of page.items||[]){const track=kind==='album'?entry:entry.track;tracks.push(track?.uri?{uri:track.uri,name:track.name||'Faixa sem título',duration:track.duration_ms||0,number:tracks.length+1}:null);}
                next=page.next;
            }
            return tracks;
        })();
        trackLists.set(uri,loading);
        try{return await loading;}catch(error){trackLists.delete(uri);throw error;}
    }
    async function playAlbum(album,trackIndex=null){
        try{
            if(!player||!deviceId){await ensurePlayer();for(let attempt=0;attempt<40&&!deviceId;attempt++)await new Promise(resolve=>setTimeout(resolve,100));if(!deviceId)throw new Error('O player ainda está conectando. Tente novamente.');}
            await player.activateElement();
            await player.setVolume(0);
            const response=await spotifyFetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({context_uri:album.uri,...(Number.isInteger(trackIndex)?{offset:{position:trackIndex}}:{})})});
            if(response.status===403)throw new Error('Reprodução exige Spotify Premium.');
            if(!response.ok&&response.status!==204)throw new Error(`Não foi possível tocar o álbum (${response.status}).`);
        }catch(error){setStatus(error.message||'Não foi possível iniciar a reprodução.');throw error;}
    }
    async function selectTrack(album,index){
        if(!deviceId)throw new Error('O player do Spotify não está conectado.');
        const response=await spotifyFetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({context_uri:album.uri,offset:{position:index}})});
        if(!response.ok&&response.status!==204)throw new Error(`Não foi possível tocar a faixa (${response.status}).`);
    }
    async function pauseAlbum(){if(player)await player.pause();}
    async function setPlaybackVolume(value){if(player)await player.setVolume(Math.max(0,Math.min(1,value)));}
    function getPlaybackState(){
        const track=playback?.track_window?.current_track,duration=track?.duration_ms||0;
        const position=Math.min(duration,(playback?.position||0)+(playback&&!playback.paused?Date.now()-playbackUpdatedAt:0));
        return {connected:!!deviceId,track:track?.name||'',trackUri:track?.uri||'',duration:duration/1000,position:position/1000,repeat:trackRepeat,shuffle:shuffleEnabled,context:playback?.context?.uri||''};
    }
    async function seekTo(seconds){if(!player||!playback)return;await player.seek(Math.max(0,Math.min(playback.track_window?.current_track?.duration_ms||0,Math.round(seconds*1000))));}
    async function setTrackRepeat(enabled){
        if(!deviceId)return;
        const response=await spotifyFetch(`https://api.spotify.com/v1/me/player/repeat?state=${enabled?'track':'off'}&device_id=${encodeURIComponent(deviceId)}`,{method:'PUT'});
        if(!response.ok&&response.status!==204)throw new Error(`Não foi possível mudar a repetição (${response.status}).`);
        trackRepeat=!!enabled;broadcast();
    }
    async function setShuffle(enabled){
        if(!deviceId)throw new Error('O player do Spotify não está conectado.');
        const response=await spotifyFetch(`https://api.spotify.com/v1/me/player/shuffle?state=${enabled?'true':'false'}&device_id=${encodeURIComponent(deviceId)}`,{method:'PUT'});
        if(!response.ok&&response.status!==204)throw new Error(`Não foi possível mudar a ordem aleatória (${response.status}).`);
        shuffleEnabled=!!enabled;broadcast();
    }
    function markExtracted(uris){extracted.clear();uris.forEach(uri=>extracted.add(uri));broadcast();}
    const artistCollator=new Intl.Collator('pt',{sensitivity:'base'});
    const sorters={added:(a,b)=>a._added-b._added,artist:(a,b)=>artistCollator.compare(artist(a),artist(b))||artistCollator.compare(a.name,b.name),name:(a,b)=>a.name.localeCompare(b.name),year:(a,b)=>(b.release_date||'').localeCompare(a.release_date||'')};
    const sorterFor=(mode,key)=>mode==='playlists'&&key==='year'?(a,b)=>(b.tracks?.total||0)-(a.tracks?.total||0):sorters[key]||sorters.added;
    function inspectorHtml(){
        return '<section class="spotify-coverflow-inspector"><h3>Coleção de discos</h3><div class="spotify-collection-modes" role="group" aria-label="Tipo de coleção"><button type="button" data-sp-mode="albums" aria-pressed="true">Álbuns</button><button type="button" data-sp-mode="playlists" aria-pressed="false">Playlists</button></div><strong data-sp-title>Sua coleção de discos</strong><span data-sp-subtitle>Álbuns salvos no Spotify</span><p data-sp-status role="status">Conecte ao Spotify para carregar a coleção.</p><div class="spotify-inspector-actions"><button type="button" data-sp-action="connect">Conectar Spotify</button><button type="button" data-sp-action="logout" hidden>Desconectar Spotify</button></div><div class="spotify-inspector-transport" role="group" aria-label="Transporte do Spotify"><button type="button" data-sp-action="prev" aria-label="Faixa anterior" title="Faixa anterior">◀</button><button type="button" data-sp-action="play" aria-label="Tocar álbum" title="Tocar álbum">▶</button><button type="button" data-sp-action="next" aria-label="Próxima faixa" title="Próxima faixa">▶</button></div><label>Ordenar álbuns<select data-sp-sort><option value="added">Recentes</option><option value="artist">Artista</option><option value="name">Título</option><option value="year">Ano</option></select></label><label>Posição na coleção <output data-sp-count>0 / 0</output><input type="range" min="0" max="0" value="0" data-spotify-position aria-label="Posição na coleção" data-hardware-slider="coverflow"></label><small>Role o mouse para navegar. Clique em um álbum para abrir ou guardar; reproduza pelo botão acima.</small></section>';
    }
    function syncInspector(host){
        if(!inspector||inspector.host!==host||!inspector.root.isConnected)return;
        const root=inspector.root,read=selector=>host.querySelector(selector);
        root.querySelector('[data-sp-title]').textContent=read('.spotify-flow-title').textContent;
        root.querySelector('[data-sp-subtitle]').textContent=read('.spotify-flow-subtitle').textContent;
        root.querySelector('[data-sp-status]').textContent=status||collectionStatus[host.dataset.coverflowMode||'albums'];
        root.querySelector('[data-sp-action="connect"]').hidden=read('.spotify-flow-connect').hidden;
        root.querySelector('[data-sp-action="logout"]').hidden=!tokenData();
        const mode=host.dataset.coverflowMode||'albums';root.querySelectorAll('[data-sp-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.spMode===mode)));
        const play=root.querySelector('[data-sp-action="play"]'),sourcePlay=read('.spotify-flow-play');play.disabled=sourcePlay.disabled;play.textContent=sourcePlay.textContent;play.setAttribute('aria-label',sourcePlay.getAttribute('aria-label'));
        for(const action of ['prev','next'])root.querySelector(`[data-sp-action="${action}"]`).disabled=!deviceId;
        const visibleSort=root.querySelector('[data-sp-sort]'),sourceSort=read('.spotify-flow-sort');visibleSort.options[1].textContent=sourceSort.options[1].textContent;visibleSort.options[3].textContent=sourceSort.options[3].textContent;visibleSort.value=sourceSort.value;
        const caption=visibleSort.closest('.app-select')?.querySelector('.app-select-caption');if(caption)caption.textContent=visibleSort.selectedOptions[0]?.textContent||'';
        const sourcePosition=read('.spotify-flow-position'),position=root.querySelector('[data-spotify-position]');position.max=sourcePosition.max;position.disabled=sourcePosition.disabled;
        if(document.activeElement!==position)position.value=sourcePosition.value;
        root.querySelector('[data-sp-count]').textContent=read('.spotify-flow-count').textContent;
    }
    function bindInspector(container,host){
        const root=container.querySelector('.spotify-coverflow-inspector');if(!root||!host)return;
        inspector={root,host};
        root.querySelectorAll('[data-sp-action]').forEach(button=>button.addEventListener('click',()=>{
            const action=button.dataset.spAction;if(action==='logout'){logout();return;}
            host.querySelector(`.spotify-flow-${action}`)?.click();
        }));
        root.querySelectorAll('[data-sp-mode]').forEach(button=>button.addEventListener('click',()=>host.dispatchEvent(new CustomEvent('spotify-mode-change',{detail:button.dataset.spMode}))));
        root.querySelector('[data-sp-sort]').addEventListener('change',event=>{const source=host.querySelector('.spotify-flow-sort');source.value=event.target.value;source.dispatchEvent(new Event('change',{bubbles:true}));});
        root.querySelector('[data-spotify-position]').addEventListener('input',event=>{const source=host.querySelector('.spotify-flow-position');source.value=event.target.value;source.dispatchEvent(new Event('input',{bubbles:true}));});
        syncInspector(host);
    }
    function mount(host,state,onChange){
        const stage=host.querySelector('.spotify-flow-stage'),flow=host.querySelector('.spotify-flow-cards'),message=host.querySelector('.spotify-flow-message');
        const hitLayer=document.createElement('div');hitLayer.className='spotify-flow-hits';stage.append(hitLayer);
        const title=host.querySelector('.spotify-flow-title'),subtitle=host.querySelector('.spotify-flow-subtitle'),count=host.querySelector('.spotify-flow-count');
        const position=host.querySelector('.spotify-flow-position'),sort=host.querySelector('.spotify-flow-sort'),play=host.querySelector('.spotify-flow-play');
        const nodes=new Map(),hits=new Map();let ordered=[],orderedSource=null,orderedSort=null,drag=null,dragged=false,suppressClickUntil=0;
        state.coverflowMode=state.coverflowMode==='playlists'?'playlists':'albums';
        const saved=state.coverflowCollections||{};
        state.coverflowCollections=Object.fromEntries(['albums','playlists'].map(mode=>{
            const entry=saved[mode]||{},legacy=mode==='albums';
            return [mode,{sort:sorters[entry.sort]?entry.sort:legacy&&sorters[state.coverflowSort]&&state.coverflowSort!=='added'?state.coverflowSort:legacy?'artist':'added',position:Number.isFinite(entry.position)?entry.position:legacy&&Number.isFinite(state.coverflowPosition)?state.coverflowPosition:0,selected:typeof entry.selected==='string'?entry.selected:legacy&&typeof state.coverflowAlbum==='string'?state.coverflowAlbum:null}];
        }));
        delete state.coverflowSort;delete state.coverflowPosition;delete state.coverflowAlbum;
        function migrateLegacy(){
            if(!('coverflowSort' in state||'coverflowPosition' in state||'coverflowAlbum' in state))return;
            const savedAlbums=state.coverflowCollections.albums;
            if(sorters[state.coverflowSort])savedAlbums.sort=state.coverflowSort==='added'?'artist':state.coverflowSort;
            if(Number.isFinite(state.coverflowPosition))savedAlbums.position=state.coverflowPosition;
            if(typeof state.coverflowAlbum==='string')savedAlbums.selected=state.coverflowAlbum;
            delete state.coverflowSort;delete state.coverflowPosition;delete state.coverflowAlbum;
        }
        const active=()=>state.coverflowCollections[state.coverflowMode];
        sort.value=active().sort;
        const current=()=>ordered.findIndex(album=>album.uri===active().selected);
        const clamp=value=>Math.max(0,Math.min(Math.max(0,ordered.length-1),value));
        function activate(index){if(performance.now()<suppressClickUntil||!ordered[index])return;if(current()===index){active().selected=null;active().position=index;refresh();onChange();return;}select(index);}
        function card(index){
            const album=ordered[index],element=document.createElement('div');element.className='spotify-flow-card';element.dataset.index=index;element.setAttribute('role','button');element.tabIndex=0;
            element.setAttribute('aria-label',`${album.name} — ${artist(album)}`);
            const vinyl=document.createElement('span');vinyl.className='spotify-flow-vinyl';
            vinyl.title='Retirar disco da capa';vinyl.setAttribute('role','button');vinyl.setAttribute('aria-label',`Retirar ${album.name} da capa`);
            vinyl.addEventListener('pointerdown',event=>{if(event.button!==0||extracted.has(album.uri))return;event.preventDefault();event.stopPropagation();host.dispatchEvent(new CustomEvent('spotify-vinyl-pickup',{bubbles:true,detail:{uri:album.uri,name:album.name,image:album.images?.[0]?.url||'',clientX:event.clientX,clientY:event.clientY,pointerId:event.pointerId}}));});
            const cover=document.createElement('img');cover.alt='';cover.loading='lazy';cover.referrerPolicy='no-referrer';
            const artUrl=(album.images||[]).filter(image=>image.width>=300).sort((a,b)=>a.width-b.width)[0]?.url||album.images?.[0]?.url;
            if(artUrl)cover.src=artUrl;
            const spine=document.createElement('span');spine.className='spotify-flow-spine spotify-flow-spine-right';const spineText=document.createElement('span');spineText.textContent=album.name;spine.append(spineText);
            if(artUrl)element.style.setProperty('--album-art',`url("${artUrl.replaceAll('"','%22')}")`);
            const label=document.createElement('i');label.className='spotify-flow-label';if(artUrl)label.style.backgroundImage=`url("${artUrl.replaceAll('"','%22')}")`;vinyl.append(label);
            element.append(vinyl,cover,spine);element.addEventListener('click',event=>{event.stopPropagation();activate(index);});
            element.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;event.preventDefault();event.stopPropagation();element.click();});
            return element;
        }
        function refresh(){
            migrateLegacy();
            const mode=state.coverflowMode,items=collections[mode],selection=active();host.dataset.coverflowMode=mode;
            if(orderedSource!==items||orderedSort!==selection.sort){ordered=[...items].sort(sorterFor(mode,selection.sort));orderedSource=items;orderedSort=selection.sort;}
            sort.value=selection.sort;
            sort.options[1].textContent=mode==='albums'?'Artista':'Criador';sort.options[3].textContent=mode==='albums'?'Ano':'Faixas';
            const selected=current();
            host.querySelector('.spotify-flow-connect').hidden=!!tokenData();
            if(!ordered.length){nodes.forEach(node=>node.remove());nodes.clear();hits.forEach(hit=>hit.remove());hits.clear();message.textContent=status||collectionStatus[mode]||(mode==='albums'?'Nenhum álbum salvo.':'Nenhuma playlist encontrada.');message.hidden=false;title.textContent=mode==='albums'?'Sua coleção de discos':'Suas playlists';subtitle.textContent=mode==='albums'?'Álbuns salvos no Spotify':'Playlists do Spotify';count.textContent='';position.max=0;position.value=0;position.disabled=true;play.disabled=true;syncInspector(host);return;}
            message.hidden=true;const center=selected>=0?selected:clamp(selection.position);
            const edgeSpan=Math.max(0,stage.clientWidth/2-24);
            const edgeRange=Math.min(36,Math.max(1,(ordered.length-1)/2));
            const edgeOffset=selected>=0?0:-edgeSpan*Math.max(0,1-center/edgeRange)+edgeSpan*Math.max(0,1-(ordered.length-1-center)/edgeRange);
            position.disabled=false;position.max=ordered.length-1;position.value=Math.round(center);count.textContent=`${Math.round(center)+1} / ${ordered.length}`;
            title.textContent=selected>=0?ordered[selected].name:mode==='albums'?'Sua coleção de discos':'Suas playlists';subtitle.textContent=status||collectionStatus[mode]|| (selected>=0?details(ordered[selected],mode):`Arraste ou role as capas para escolher ${mode==='albums'?'um álbum':'uma playlist'}`);
            play.disabled=selected<0||!deviceId||(mode==='playlists'&&!ordered[selected].tracks?.total);const isPlaying=!!(playback&&selected>=0&&playback.context?.uri===ordered[selected].uri&&!playback.paused);
            play.setAttribute('aria-label',isPlaying?'Pausar':`Tocar ${mode==='albums'?'álbum':'playlist'}`);
            play.textContent=isPlaying?'❚❚':'▶';
            const radius=selected>=0?OPEN_RADIUS:CLOSED_RADIUS;
            const visible=new Set();for(let index=Math.max(0,Math.floor(center)-radius);index<=Math.min(ordered.length-1,Math.ceil(center)+radius);index++){
                const distance=index-center, x=selected>=0?(distance===0?-100:Math.sign(distance)*(500+sleeveOffset(Math.abs(distance)-1))):Math.sign(distance)*sleeveOffset(Math.abs(distance))+edgeOffset;
                if(Math.abs(x)<stage.clientWidth/2+COVER_SIZE/2)visible.add(index);
            }
            for(const [index,node] of nodes)if(!visible.has(index)||node.dataset.uri!==ordered[index]?.uri){node.remove();nodes.delete(index);hits.get(index)?.remove();hits.delete(index);}
            for(const index of visible){
                let node=nodes.get(index);if(!node){node=card(index);node.dataset.uri=ordered[index].uri;flow.append(node);nodes.set(index,node);}
                let hit=hits.get(index);if(!hit){hit=document.createElement('div');hit.className='spotify-flow-hit';hit.dataset.index=index;hit.setAttribute('aria-hidden','true');hit.addEventListener('click',event=>{event.stopPropagation();activate(index);});hitLayer.append(hit);hits.set(index,hit);}
                hit.style.pointerEvents=index===selected?'none':'auto';
                const distance=index-center,absolute=Math.abs(distance),side=Math.sign(distance);
                const x=selected>=0?distance===0?-100:side*(500+sleeveOffset(absolute-1)):side*sleeveOffset(absolute)+edgeOffset;
                const angle=index===selected?0:-90;
                node.style.transform=`translateX(${x}px) translateZ(${index===selected?100:-170-Math.min(absolute,6)*8}px) rotateY(${angle}deg)`;
                node.style.zIndex=String(index===selected?200:100-Math.round(absolute));node.classList.toggle('is-open',index===selected);node.classList.toggle('is-playing',index===selected&&isPlaying);node.classList.toggle('is-extracted',extracted.has(ordered[index].uri));node.setAttribute('aria-pressed',String(index===selected));
                node.style.opacity=1;
                const hitWidth=index===selected?COVER_SIZE*1.55:Math.max(26,sleeveOffset(absolute+.5)-sleeveOffset(Math.max(0,absolute-.5)));
                const hitCenter=x+(index===selected?COVER_SIZE/4:0);
                hit.style.left=`calc(50% + ${hitCenter-hitWidth/2}px)`;hit.style.width=`${hitWidth}px`;
            }
            syncInspector(host);
        }
        function select(index){if(!ordered.length)return;const album=ordered[clamp(index)];active().selected=album.uri;active().position=clamp(index);refresh();onChange();}
        function shift(amount){if(!ordered.length)return;const index=current();active().position=clamp((index>=0?index:active().position)+amount);active().selected=null;refresh();onChange();}
        host.addEventListener('spotify-mode-change',event=>{
            const mode=event.detail;if(mode===state.coverflowMode||!Object.hasOwn(collections,mode))return;
            state.coverflowMode=mode;nodes.forEach(node=>node.remove());nodes.clear();hits.forEach(hit=>hit.remove());hits.clear();orderedSource=null;refresh();onChange();
            if(tokenData())loadCollection(mode);
        });
        host.querySelector('.spotify-flow-connect').addEventListener('click',event=>{event.stopPropagation();login();});
        play.addEventListener('click',event=>event.stopPropagation());
        host.querySelector('.spotify-flow-prev').addEventListener('click',event=>{event.stopPropagation();player?.previousTrack();});
        host.querySelector('.spotify-flow-next').addEventListener('click',event=>{event.stopPropagation();player?.nextTrack();});
        sort.addEventListener('change',()=>{active().sort=sort.value;nodes.forEach(node=>node.remove());nodes.clear();refresh();onChange();});
        position.addEventListener('input',()=>{active().selected=null;active().position=Number(position.value);refresh();onChange();});
        stage.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();shift(Math.sign(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY));},{passive:false});
        stage.addEventListener('pointerdown',event=>{event.stopPropagation();if(event.button!==0)return;drag={x:event.clientX,index:current()>=0?current():active().position};dragged=false;if(event.target===stage)stage.setPointerCapture(event.pointerId);});
        stage.addEventListener('pointermove',event=>{if(!drag)return;const scale=stage.getBoundingClientRect().width/stage.clientWidth;const delta=(drag.x-event.clientX)/(COVER_SPACING*scale);if(Math.abs(delta)<.1)return;if(!stage.hasPointerCapture(event.pointerId))stage.setPointerCapture(event.pointerId);dragged=true;host.classList.add('is-dragging');active().selected=null;active().position=clamp(drag.index+delta);refresh();});
        const release=()=>{if(!drag)return;drag=null;host.classList.remove('is-dragging');if(dragged){suppressClickUntil=performance.now()+300;active().position=clamp(Math.round(active().position));refresh();onChange();dragged=false;}};
        stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
        stage.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key))return;if(event.target!==stage&&['Enter',' '].includes(event.key))return;event.preventDefault();event.stopPropagation();if(event.key==='ArrowLeft')shift(-1);else if(event.key==='ArrowRight')shift(1);else if(event.key==='Home')select(0);else if(event.key==='End')select(ordered.length-1);else activate(current()>=0?current():Math.round(active().position));});
        const view={refresh};views.add(view);if(tokenData())status='';refresh();if(tokenData()){loadCollection(state.coverflowMode);ensurePlayer().catch(error=>setStatus(error.message));}
        return {refresh(){refresh();if(tokenData())loadCollection(state.coverflowMode);},dispose(){views.delete(view);nodes.clear();hitLayer.remove();hits.clear();}};
    }
    async function initialize(){
        const url=new URL(location.href),code=url.searchParams.get('code'),error=url.searchParams.get('error');
        const returnedState=url.searchParams.get('state');
        if(code||error){url.searchParams.delete('code');url.searchParams.delete('state');url.searchParams.delete('error');history.replaceState(null,'',url.pathname+url.search+url.hash);}
        if(error){setStatus('O Spotify não autorizou a conexão.');return;}
        if(code){
            const verifier=sessionStorage.getItem(VERIFIER_KEY),expected=sessionStorage.getItem(STATE_KEY);
            sessionStorage.removeItem(VERIFIER_KEY);sessionStorage.removeItem(STATE_KEY);
            if(!verifier||!expected||expected!==returnedState){setStatus('Falha na verificação da conexão com Spotify. Tente novamente.');return;}
            try{await tokenRequest({grant_type:'authorization_code',code,redirect_uri:REDIRECT,code_verifier:verifier});}
            catch(error){setStatus(error.message||'Não foi possível concluir a conexão.');return;}
        }
        if(tokenData()){status='';await loadCollection('albums');}
    }
    return {mount,inspectorHtml,bindInspector,initialize,login,logout,playAlbum,loadTracks,selectTrack,pauseAlbum,setPlaybackVolume,getPlaybackState,seekTo,setTrackRepeat,setShuffle,markExtracted,setBeforeRedirect(callback){beforeRedirect=callback;}};
})();
