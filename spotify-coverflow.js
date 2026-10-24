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
    const SCOPES='user-library-read streaming user-read-email user-read-private user-modify-playback-state';
    const views=new Set();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let albums=[],status='Conecte sua conta Spotify para ver os álbuns salvos.';
    const clientId=DEFAULT_CLIENT_ID;
    let sdkPromise=null,player=null,deviceId=null,playback=null,beforeRedirect=()=>{},loadPromise=null,albumsLoaded=false,refreshPromise=null,inspector=null;
    const tokenData=()=>{try{return JSON.parse(sessionStorage.getItem(TOKEN_KEY)||'null');}catch{return null;}};
    const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const random=()=>base64(crypto.getRandomValues(new Uint8Array(48)));
    const artist=album=>(album.artists||[]).map(item=>item.name).join(', ');
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
    function logout(){disconnect();sessionStorage.removeItem(TOKEN_KEY);albums=[];albumsLoaded=false;loadPromise=null;setStatus('Conta desconectada.');}
    async function spotifyFetch(url,options={}){
        for(let attempt=0;attempt<4;attempt++){
            const token=await getToken();if(!token)throw new Error('Conecte ao Spotify novamente.');
            const response=await fetch(url,{...options,headers:{Authorization:`Bearer ${token}`,...options.headers}});
            if(response.status===429&&attempt<3){await new Promise(resolve=>setTimeout(resolve,Math.min(10000,(Number(response.headers.get('Retry-After'))||2)*1000)));continue;}
            if(response.status===401){sessionStorage.removeItem(TOKEN_KEY);throw new Error('A sessão terminou. Conecte novamente.');}
            return response;
        }
    }
    async function loadAlbums(){
        if(!tokenData()||albumsLoaded)return;
        if(loadPromise)return loadPromise;
        loadPromise=(async()=>{
        setStatus('Carregando álbuns salvos…');
        try{
            let next='https://api.spotify.com/v1/me/albums?limit=50';const loaded=[];
            while(next){
                const response=await spotifyFetch(next);
                if(!response.ok)throw new Error(`Não foi possível carregar os álbuns (${response.status}).`);
                const page=await response.json();loaded.push(...page.items.map((item,index)=>({...item.album,_added:loaded.length+index})));
                next=page.next;albums=loaded.slice();status=`Carregando álbuns… ${loaded.length} de ${page.total}`;broadcast();
            }
            albums=loaded;albumsLoaded=true;setStatus(loaded.length?'':'Nenhum álbum salvo na sua biblioteca do Spotify.');
            if(views.size)ensurePlayer().catch(error=>setStatus(error.message));
        }catch(error){setStatus(error.message||'Não foi possível carregar os álbuns.');}
        finally{loadPromise=null;}
        })();return loadPromise;
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
        if(player||!views.size||!tokenData())return;
        await sdk();if(player||!views.size)return;
        player=new Spotify.Player({name:'AudioSystem · Discos',volume:.5,getOAuthToken:async callback=>callback(await getToken()||'')});
        player.addListener('ready',event=>{deviceId=event.device_id;broadcast();});
        player.addListener('not_ready',()=>{deviceId=null;broadcast();});
        player.addListener('player_state_changed',state=>{playback=state;broadcast();});
        player.addListener('account_error',()=>setStatus('Reprodução exige Spotify Premium.'));
        player.addListener('authentication_error',()=>setStatus('Sessão expirada. Conecte novamente.'));
        player.addListener('initialization_error',()=>setStatus('Este navegador não oferece suporte ao player do Spotify.'));
        player.addListener('playback_error',()=>setStatus('Não foi possível reproduzir esta faixa.'));
        try{if(!await player.connect())setStatus('O player do Spotify não conseguiu iniciar neste navegador.');}
        catch(error){setStatus(error.message||'Não foi possível iniciar o player.');}
    }
    function disconnect(){if(player){player.pause().catch(()=>{});player.disconnect();}player=null;deviceId=null;playback=null;broadcast();}
    async function playAlbum(album){
        try{
            if(!player||!deviceId){await ensurePlayer();if(!deviceId)throw new Error('O player ainda está conectando. Tente novamente.');}
            await player.activateElement();
            if(playback?.context?.uri===album.uri){await player.togglePlay();return;}
            const response=await spotifyFetch(`https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({context_uri:album.uri})});
            if(response.status===403)throw new Error('Reprodução exige Spotify Premium.');
            if(!response.ok&&response.status!==204)throw new Error(`Não foi possível tocar o álbum (${response.status}).`);
        }catch(error){setStatus(error.message||'Não foi possível iniciar a reprodução.');}
    }
    const artistCollator=new Intl.Collator('pt',{sensitivity:'base'});
    const sorters={added:(a,b)=>a._added-b._added,artist:(a,b)=>artistCollator.compare(artist(a),artist(b))||artistCollator.compare(a.name,b.name),name:(a,b)=>a.name.localeCompare(b.name),year:(a,b)=>(b.release_date||'').localeCompare(a.release_date||'')};
    function inspectorHtml(){
        return '<section class="spotify-coverflow-inspector"><h3>Coleção de discos</h3><strong data-sp-title>Sua coleção de discos</strong><span data-sp-subtitle>Álbuns salvos no Spotify</span><p data-sp-status role="status">Conecte ao Spotify para carregar a coleção.</p><div class="spotify-inspector-actions"><button type="button" data-sp-action="connect">Conectar Spotify</button><button type="button" data-sp-action="logout" hidden>Desconectar Spotify</button></div><div class="spotify-inspector-transport" role="group" aria-label="Transporte do Spotify"><button type="button" data-sp-action="prev" aria-label="Faixa anterior" title="Faixa anterior">◀</button><button type="button" data-sp-action="play" aria-label="Tocar álbum" title="Tocar álbum">▶</button><button type="button" data-sp-action="next" aria-label="Próxima faixa" title="Próxima faixa">▶</button></div><label>Ordenar álbuns<select data-sp-sort><option value="added">Recentes</option><option value="artist">Artista</option><option value="name">Título</option><option value="year">Ano</option></select></label><label>Posição na coleção <output data-sp-count>0 / 0</output><input type="range" min="0" max="0" value="0" data-spotify-position aria-label="Posição na coleção" data-hardware-slider="coverflow"></label><small>Role o mouse para navegar. Clique em um álbum para abrir ou guardar; reproduza pelo botão acima.</small></section>';
    }
    function syncInspector(host){
        if(!inspector||inspector.host!==host||!inspector.root.isConnected)return;
        const root=inspector.root,read=selector=>host.querySelector(selector);
        root.querySelector('[data-sp-title]').textContent=read('.spotify-flow-title').textContent;
        root.querySelector('[data-sp-subtitle]').textContent=read('.spotify-flow-subtitle').textContent;
        root.querySelector('[data-sp-status]').textContent=status;
        root.querySelector('[data-sp-action="connect"]').hidden=read('.spotify-flow-connect').hidden;
        root.querySelector('[data-sp-action="logout"]').hidden=!tokenData();
        const play=root.querySelector('[data-sp-action="play"]'),sourcePlay=read('.spotify-flow-play');play.disabled=sourcePlay.disabled;play.textContent=sourcePlay.textContent;play.setAttribute('aria-label',sourcePlay.getAttribute('aria-label'));
        for(const action of ['prev','next'])root.querySelector(`[data-sp-action="${action}"]`).disabled=!deviceId;
        root.querySelector('[data-sp-sort]').value=read('.spotify-flow-sort').value;
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
        state.coverflowSort=sorters[state.coverflowSort]&&state.coverflowSort!=='added'?state.coverflowSort:'artist';
        state.coverflowPosition=Number.isFinite(state.coverflowPosition)?state.coverflowPosition:0;
        state.coverflowAlbum=typeof state.coverflowAlbum==='string'?state.coverflowAlbum:null;
        sort.value=state.coverflowSort;
        const current=()=>ordered.findIndex(album=>album.uri===state.coverflowAlbum);
        const clamp=value=>Math.max(0,Math.min(Math.max(0,ordered.length-1),value));
        function activate(index){if(performance.now()<suppressClickUntil||!ordered[index])return;if(current()===index){state.coverflowAlbum=null;state.coverflowPosition=index;refresh();onChange();return;}select(index);}
        function card(index){
            const album=ordered[index],element=document.createElement('div');element.className='spotify-flow-card';element.dataset.index=index;element.setAttribute('role','button');element.tabIndex=0;
            element.setAttribute('aria-label',`${album.name} — ${artist(album)}`);
            const vinyl=document.createElement('span');vinyl.className='spotify-flow-vinyl';
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
            if(orderedSource!==albums||orderedSort!==state.coverflowSort){ordered=[...albums].sort(sorters[state.coverflowSort]||sorters.added);orderedSource=albums;orderedSort=state.coverflowSort;}
            sort.value=state.coverflowSort;
            const selected=current();
            host.querySelector('.spotify-flow-connect').hidden=!!tokenData();
            if(!ordered.length){nodes.forEach(node=>node.remove());nodes.clear();hits.forEach(hit=>hit.remove());hits.clear();message.textContent=status;message.hidden=false;title.textContent='Sua coleção de discos';subtitle.textContent='Álbuns salvos no Spotify';count.textContent='';position.max=0;position.value=0;position.disabled=true;play.disabled=true;syncInspector(host);return;}
            message.hidden=true;const center=selected>=0?selected:clamp(state.coverflowPosition);
            const edgeSpan=Math.max(0,stage.clientWidth/2-24);
            const edgeRange=Math.min(36,Math.max(1,(ordered.length-1)/2));
            const edgeOffset=selected>=0?0:-edgeSpan*Math.max(0,1-center/edgeRange)+edgeSpan*Math.max(0,1-(ordered.length-1-center)/edgeRange);
            position.disabled=false;position.max=ordered.length-1;position.value=Math.round(center);count.textContent=`${Math.round(center)+1} / ${ordered.length}`;
            title.textContent=selected>=0?ordered[selected].name:'Sua coleção de discos';subtitle.textContent=status|| (selected>=0?`${artist(ordered[selected])} · ${(ordered[selected].release_date||'').slice(0,4)}`:'Arraste ou role as capas para escolher um álbum');
            play.disabled=selected<0||!deviceId;const isPlaying=!!(playback&&selected>=0&&playback.context?.uri===ordered[selected].uri&&!playback.paused);
            play.setAttribute('aria-label',isPlaying?'Pausar álbum':'Tocar álbum');
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
                const distance=index-center,absolute=Math.abs(distance),side=Math.sign(distance);
                const x=selected>=0?distance===0?-100:side*(500+sleeveOffset(absolute-1)):side*sleeveOffset(absolute)+edgeOffset;
                const angle=index===selected?0:-90;
                node.style.transform=`translateX(${x}px) translateZ(${index===selected?100:-170-Math.min(absolute,6)*8}px) rotateY(${angle}deg)`;
                node.style.zIndex=String(index===selected?200:100-Math.round(absolute));node.classList.toggle('is-open',index===selected);node.classList.toggle('is-playing',index===selected&&isPlaying);node.setAttribute('aria-pressed',String(index===selected));
                node.style.opacity=1;
                const hitWidth=index===selected?COVER_SIZE*1.55:Math.max(26,sleeveOffset(absolute+.5)-sleeveOffset(Math.max(0,absolute-.5)));
                const hitCenter=x+(index===selected?COVER_SIZE/4:0);
                hit.style.left=`calc(50% + ${hitCenter-hitWidth/2}px)`;hit.style.width=`${hitWidth}px`;
            }
            syncInspector(host);
        }
        function select(index){if(!ordered.length)return;const album=ordered[clamp(index)];state.coverflowAlbum=album.uri;state.coverflowPosition=clamp(index);refresh();onChange();}
        function shift(amount){if(!ordered.length)return;const index=current();state.coverflowPosition=clamp((index>=0?index:state.coverflowPosition)+amount);state.coverflowAlbum=null;refresh();onChange();}
        host.querySelector('.spotify-flow-connect').addEventListener('click',event=>{event.stopPropagation();login();});
        play.addEventListener('click',event=>{event.stopPropagation();const index=current();if(index>=0)playAlbum(ordered[index]);});
        host.querySelector('.spotify-flow-prev').addEventListener('click',event=>{event.stopPropagation();player?.previousTrack();});
        host.querySelector('.spotify-flow-next').addEventListener('click',event=>{event.stopPropagation();player?.nextTrack();});
        sort.addEventListener('change',()=>{state.coverflowSort=sort.value;nodes.forEach(node=>node.remove());nodes.clear();refresh();onChange();});
        position.addEventListener('input',()=>{state.coverflowAlbum=null;state.coverflowPosition=Number(position.value);refresh();onChange();});
        stage.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();shift(Math.sign(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY));},{passive:false});
        stage.addEventListener('pointerdown',event=>{event.stopPropagation();if(event.button!==0)return;drag={x:event.clientX,index:current()>=0?current():state.coverflowPosition};dragged=false;if(event.target===stage)stage.setPointerCapture(event.pointerId);});
        stage.addEventListener('pointermove',event=>{if(!drag)return;const scale=stage.getBoundingClientRect().width/stage.clientWidth;const delta=(drag.x-event.clientX)/(COVER_SPACING*scale);if(Math.abs(delta)<.1)return;if(!stage.hasPointerCapture(event.pointerId))stage.setPointerCapture(event.pointerId);dragged=true;host.classList.add('is-dragging');state.coverflowAlbum=null;state.coverflowPosition=clamp(drag.index+delta);refresh();});
        const release=()=>{if(!drag)return;drag=null;host.classList.remove('is-dragging');if(dragged){suppressClickUntil=performance.now()+300;state.coverflowPosition=clamp(Math.round(state.coverflowPosition));refresh();onChange();dragged=false;}};
        stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
        stage.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key))return;if(event.target!==stage&&['Enter',' '].includes(event.key))return;event.preventDefault();event.stopPropagation();if(event.key==='ArrowLeft')shift(-1);else if(event.key==='ArrowRight')shift(1);else if(event.key==='Home')select(0);else if(event.key==='End')select(ordered.length-1);else activate(current()>=0?current():Math.round(state.coverflowPosition));});
        const view={refresh};views.add(view);refresh();if(tokenData()){loadAlbums();ensurePlayer().catch(error=>setStatus(error.message));}
        return {refresh,dispose(){views.delete(view);nodes.clear();hitLayer.remove();hits.clear();if(!views.size)disconnect();}};
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
        if(tokenData())await loadAlbums();
    }
    return {mount,inspectorHtml,bindInspector,initialize,login,logout,setBeforeRedirect(callback){beforeRedirect=callback;}};
})();
