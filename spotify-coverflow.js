/* Spotify account and Coverflow furniture. Playback is separate from the AudioSystem signal graph. */
const SpotifyCoverflow=(()=>{
    const CLIENT_KEY='audio-system-spotify-client-id';
    const DEFAULT_CLIENT_ID='346af0eed59d4119b71d37808aec1f33';
    const TOKEN_KEY='audio-system-spotify-session';
    const VERIFIER_KEY='audio-system-spotify-verifier';
    const STATE_KEY='audio-system-spotify-state';
    const COVER_SPACING=38;
    const CLOSED_RADIUS=32;
    const OPEN_RADIUS=18;
    const REDIRECT=location.origin+location.pathname;
    const SCOPES='user-library-read streaming user-read-email user-read-private user-modify-playback-state';
    const views=new Set();
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let albums=[],status='Conecte sua conta Spotify para ver os álbuns salvos.',clientId=localStorage.getItem(CLIENT_KEY)||DEFAULT_CLIENT_ID;
    let sdkPromise=null,player=null,deviceId=null,playback=null,settings=null,settingsSummary=null,settingsOnOpen=()=>{},beforeRedirect=()=>{},loadPromise=null,albumsLoaded=false,refreshPromise=null;
    const tokenData=()=>{try{return JSON.parse(sessionStorage.getItem(TOKEN_KEY)||'null');}catch{return null;}};
    const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const random=()=>base64(crypto.getRandomValues(new Uint8Array(48)));
    const artist=album=>(album.artists||[]).map(item=>item.name).join(', ');
    const shortTime=ms=>{const seconds=Math.max(0,Math.floor(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
    function broadcast(){views.forEach(view=>view.refresh());renderSettings();}
    function setStatus(message){status=message;broadcast();}
    function setClientId(value){
        const next=value.trim();
        if(next===clientId)return;
        clientId=next;
        if(next)localStorage.setItem(CLIENT_KEY,next);else localStorage.removeItem(CLIENT_KEY);
        disconnect();sessionStorage.removeItem(TOKEN_KEY);albums=[];albumsLoaded=false;loadPromise=null;
        setStatus(next?'Pronto para conectar ao Spotify.':'Informe o Client ID para conectar ao Spotify.');
    }
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
        const input=settings?.querySelector('[data-spotify-client]');
        if(input)setClientId(input.value);
        if(!clientId){setStatus('Informe o Client ID nas configurações.');input?.focus();return;}
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
                next=page.next;status=`Carregando álbuns… ${loaded.length} de ${page.total}`;broadcast();
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
    const sorters={added:(a,b)=>a._added-b._added,artist:(a,b)=>artist(a).localeCompare(artist(b)),name:(a,b)=>a.name.localeCompare(b.name),year:(a,b)=>(b.release_date||'').localeCompare(a.release_date||'')};
    function mount(host,state,onChange,openSettings){
        const stage=host.querySelector('.spotify-flow-stage'),flow=host.querySelector('.spotify-flow-cards'),message=host.querySelector('.spotify-flow-message');
        const title=host.querySelector('.spotify-flow-title'),subtitle=host.querySelector('.spotify-flow-subtitle'),count=host.querySelector('.spotify-flow-count');
        const position=host.querySelector('.spotify-flow-position'),sort=host.querySelector('.spotify-flow-sort'),play=host.querySelector('.spotify-flow-play');
        const nodes=new Map();let ordered=[],orderedSource=null,orderedSort=null,drag=null,dragged=false,suppressClickUntil=0;
        state.coverflowSort=sorters[state.coverflowSort]?state.coverflowSort:'added';
        state.coverflowPosition=Number.isFinite(state.coverflowPosition)?state.coverflowPosition:0;
        state.coverflowAlbum=typeof state.coverflowAlbum==='string'?state.coverflowAlbum:null;
        sort.value=state.coverflowSort;
        const current=()=>ordered.findIndex(album=>album.uri===state.coverflowAlbum);
        const clamp=value=>Math.max(0,Math.min(Math.max(0,ordered.length-1),value));
        function card(index){
            const album=ordered[index],element=document.createElement('button');element.type='button';element.className='spotify-flow-card';element.dataset.index=index;
            element.setAttribute('aria-label',`${album.name} — ${artist(album)}`);
            const vinyl=document.createElement('span');vinyl.className='spotify-flow-vinyl';
            const cover=document.createElement('img');cover.alt='';cover.loading='lazy';cover.referrerPolicy='no-referrer';cover.src=(album.images||[]).filter(image=>image.width>=300).sort((a,b)=>a.width-b.width)[0]?.url||album.images?.[0]?.url||'';
            const back=cover.cloneNode();back.className='spotify-flow-back';
            const label=document.createElement('i');label.className='spotify-flow-label';if(cover.src)label.style.backgroundImage=`url("${cover.src.replaceAll('"','%22')}")`;vinyl.append(label);
            element.append(vinyl,cover,back);element.addEventListener('click',event=>{event.stopPropagation();if(performance.now()<suppressClickUntil)return;if(current()===index){playAlbum(album);return;}select(index);});
            return element;
        }
        function refresh(){
            if(orderedSource!==albums||orderedSort!==state.coverflowSort){ordered=[...albums].sort(sorters[state.coverflowSort]||sorters.added);orderedSource=albums;orderedSort=state.coverflowSort;}
            sort.value=state.coverflowSort;
            const selected=current();
            host.querySelector('.spotify-flow-connect').hidden=!!tokenData();
            if(!ordered.length){nodes.forEach(node=>node.remove());nodes.clear();message.textContent=status;message.hidden=false;title.textContent='Sua coleção de discos';subtitle.textContent='Álbuns salvos no Spotify';count.textContent='';position.max=0;position.value=0;position.disabled=true;play.disabled=true;return;}
            message.hidden=true;const center=selected>=0?selected:clamp(state.coverflowPosition);
            position.disabled=false;position.max=ordered.length-1;position.value=Math.round(center);count.textContent=`${Math.round(center)+1} / ${ordered.length}`;
            title.textContent=selected>=0?ordered[selected].name:'Sua coleção de discos';subtitle.textContent=status|| (selected>=0?`${artist(ordered[selected])} · ${(ordered[selected].release_date||'').slice(0,4)}`:'Arraste ou role as capas para escolher um álbum');
            play.disabled=selected<0||!deviceId;const isPlaying=!!(playback&&selected>=0&&playback.context?.uri===ordered[selected].uri&&!playback.paused);
            play.setAttribute('aria-label',isPlaying?'Pausar álbum':'Tocar álbum');
            play.textContent=isPlaying?'❚❚':'▶';
            const radius=selected>=0?OPEN_RADIUS:CLOSED_RADIUS;
            const visible=new Set();for(let index=Math.max(0,Math.floor(center)-radius);index<=Math.min(ordered.length-1,Math.ceil(center)+radius);index++)visible.add(index);
            for(const [index,node] of nodes)if(!visible.has(index)||node.dataset.uri!==ordered[index]?.uri){node.remove();nodes.delete(index);}
            for(const index of visible){
                let node=nodes.get(index);if(!node){node=card(index);node.dataset.uri=ordered[index].uri;flow.append(node);nodes.set(index,node);}
                const distance=index-center,absolute=Math.abs(distance),side=Math.sign(distance);
                const x=selected>=0?distance===0?-130:side*(560+(absolute-1)*COVER_SPACING):distance*COVER_SPACING;
                const angle=index===selected?0:-90-22*Math.tanh(distance/8);
                node.style.transform=`translateX(${x}px) translateZ(${index===selected?100:-170-Math.min(absolute,6)*8}px) rotateY(${angle}deg)`;
                node.style.zIndex=String(index===selected?200:100-Math.round(absolute));node.classList.toggle('is-open',index===selected);node.classList.toggle('is-playing',index===selected&&isPlaying);
                node.style.opacity=1;
            }
        }
        function select(index){if(!ordered.length)return;const album=ordered[clamp(index)];state.coverflowAlbum=album.uri;state.coverflowPosition=clamp(index);refresh();onChange();}
        function shift(amount){if(!ordered.length)return;const index=current();state.coverflowPosition=clamp((index>=0?index:state.coverflowPosition)+amount);state.coverflowAlbum=null;refresh();onChange();}
        host.querySelector('.spotify-flow-connect').addEventListener('click',event=>{event.stopPropagation();if(clientId)login();else openSettings();});
        host.querySelector('.spotify-flow-settings').addEventListener('click',event=>{event.stopPropagation();openSettings();});
        play.addEventListener('click',event=>{event.stopPropagation();const index=current();if(index>=0)playAlbum(ordered[index]);});
        host.querySelector('.spotify-flow-prev').addEventListener('click',event=>{event.stopPropagation();player?.previousTrack();});
        host.querySelector('.spotify-flow-next').addEventListener('click',event=>{event.stopPropagation();player?.nextTrack();});
        sort.addEventListener('change',()=>{state.coverflowSort=sort.value;nodes.forEach(node=>node.remove());nodes.clear();refresh();onChange();});
        position.addEventListener('input',()=>{state.coverflowAlbum=null;state.coverflowPosition=Number(position.value);refresh();onChange();});
        stage.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();shift(Math.sign(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY));},{passive:false});
        stage.addEventListener('pointerdown',event=>{event.stopPropagation();if(event.button!==0)return;drag={x:event.clientX,index:current()>=0?current():state.coverflowPosition};dragged=false;stage.setPointerCapture(event.pointerId);});
        stage.addEventListener('pointermove',event=>{if(!drag)return;const scale=stage.getBoundingClientRect().width/stage.clientWidth;const delta=(drag.x-event.clientX)/(COVER_SPACING*scale);if(Math.abs(delta)<.1)return;dragged=true;host.classList.add('is-dragging');state.coverflowAlbum=null;state.coverflowPosition=clamp(drag.index+delta);refresh();});
        const release=()=>{if(!drag)return;drag=null;host.classList.remove('is-dragging');if(dragged){suppressClickUntil=performance.now()+300;state.coverflowPosition=clamp(Math.round(state.coverflowPosition));refresh();onChange();dragged=false;}};
        stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
        stage.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key))return;if(event.target!==stage&&['Enter',' '].includes(event.key))return;event.preventDefault();event.stopPropagation();if(event.key==='ArrowLeft')shift(-1);else if(event.key==='ArrowRight')shift(1);else if(event.key==='Home')select(0);else if(event.key==='End')select(ordered.length-1);else if(current()>=0)playAlbum(ordered[current()]);});
        const view={refresh};views.add(view);refresh();if(tokenData()){loadAlbums();ensurePlayer().catch(error=>setStatus(error.message));}
        return {refresh,dispose(){views.delete(view);nodes.clear();if(!views.size)disconnect();}};
    }
    function renderSettings(){
        if(!settings)return;
        const clientInput=settings.querySelector('[data-spotify-client]');
        if(document.activeElement!==clientInput)clientInput.value=clientId;
        settings.querySelector('[data-spotify-redirect]').textContent=REDIRECT;
        settings.querySelector('[data-spotify-status]').textContent=status||`${albums.length} álbuns salvos`;settings.querySelector('[data-spotify-logout]').hidden=!tokenData();
        if(settingsSummary)settingsSummary.textContent=tokenData()?`${albums.length} álbuns · conectado`:'Coleção e reprodução';
    }
    function openSettings(){
        if(!settings)return;
        settingsOnOpen();
        if(!settings.open)settings.showModal();
        settings.querySelector('[data-spotify-client]')?.focus();
    }
    function bindSettings(element,options={}){
        beforeRedirect=options.beforeRedirect||beforeRedirect;settingsOnOpen=options.onOpen||settingsOnOpen;
        element.className='spotify-settings-entry';
        element.innerHTML='<strong>Spotify</strong><button type="button" data-spotify-open>Configurar Spotify</button><small data-spotify-summary></small>';
        settingsSummary=element.querySelector('[data-spotify-summary]');
        element.querySelector('[data-spotify-open]').addEventListener('click',openSettings);
        settings=document.createElement('dialog');settings.className='spotify-settings-dialog';settings.setAttribute('aria-labelledby','spotify-settings-title');
        settings.innerHTML='<div class="spotify-settings"><div class="spotify-settings-header"><div><span class="app-confirm-kicker">Coleção de discos</span><h2 id="spotify-settings-title">Spotify</h2></div><button type="button" data-spotify-close aria-label="Fechar configurações do Spotify" title="Fechar">×</button></div><label>Client ID <input type="text" data-spotify-client spellcheck="false" autocomplete="off" placeholder="Client ID do seu app Spotify"></label><div class="spotify-redirect"><small>Cadastre este Redirect URI no Spotify Dashboard:</small><code data-spotify-redirect></code></div><div class="spotify-setting-actions"><button type="button" data-spotify-connect>Conectar</button><button type="button" data-spotify-logout hidden>Desconectar</button></div><p data-spotify-status role="status" aria-live="polite"></p><small class="spotify-settings-note">A reprodução exige Spotify Premium e não passa pelos cabos do simulador.</small></div>';
        document.body.append(settings);
        settings.querySelector('[data-spotify-close]').addEventListener('click',()=>settings.close());
        settings.addEventListener('click',event=>{if(event.target===settings)settings.close();});
        settings.querySelector('[data-spotify-client]').addEventListener('change',event=>setClientId(event.target.value));
        settings.querySelector('[data-spotify-connect]').addEventListener('click',login);
        settings.querySelector('[data-spotify-logout]').addEventListener('click',logout);renderSettings();
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
        if(tokenData())await loadAlbums();else renderSettings();
    }
    return {mount,bindSettings,openSettings,initialize,login,logout,get clientId(){return clientId;}};
})();
