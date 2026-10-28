/* Spotify album and vinyl objects, placement, and playback volume. */
        const spotifyNotice=document.createElement('div');spotifyNotice.className='spotify-vinyl-notice';spotifyNotice.setAttribute('role','status');document.body.append(spotifyNotice);
        function spotifyVinylNotice(message){spotifyNotice.textContent=message;spotifyNotice.classList.add('is-visible');clearTimeout(spotifyNoticeTimer);spotifyNoticeTimer=setTimeout(()=>spotifyNotice.classList.remove('is-visible'),5200);}
        function refreshSpotifyVinyls(){SpotifyCoverflow.markExtracted(new Set([...spotifyVinyls.values()].map(item=>item.uri)));spotifyAlbums.forEach(syncSpotifyAlbum);}
        function refreshSpotifyAlbums(){SpotifyCoverflow.markRemoved(new Set(spotifyAlbums.keys()));}
        const SPOTIFY_VINYL_SIZE=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spotify-vinyl-size'));
        const SPOTIFY_ALBUM_SIZE=SPOTIFY_VINYL_SIZE+16;
        const spotifyGridCoordinate=(value,limit)=>Math.max(0,Math.min(Math.floor(limit/Hardware.sizes.grid)*Hardware.sizes.grid,snapCoordinate(value)));
        function createSpotifyDragGhost(element,event){
            const rect=element.getBoundingClientRect(),ghost=element.cloneNode(true),worldStyle=getComputedStyle(world),scale=rect.width/Math.max(1,element.offsetWidth);
            for(const property of worldStyle)if(property.startsWith('--'))ghost.style.setProperty(property,worldStyle.getPropertyValue(property));
            Object.assign(ghost.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:element.offsetWidth+'px',height:element.offsetHeight+'px',margin:'0',transform:`scale(${scale})`,transformOrigin:'0 0',transition:'none',zIndex:'10010',pointerEvents:'none'});
            ghost.setAttribute('aria-hidden','true');ghost.inert=true;document.body.appendChild(ghost);
            const previousVisibility=element.style.visibility;element.style.visibility='hidden';
            const offsetX=event.clientX-rect.left,offsetY=event.clientY-rect.top;
            return {move(ev){ghost.style.left=(ev.clientX-offsetX)+'px';ghost.style.top=(ev.clientY-offsetY)+'px';},restore(){ghost.remove();element.style.visibility=previousVisibility;}};
        }
        function updateSpotifyDiscardTarget(event,kind){
            const over=isOverCatalog(event),label=kind==='vinyl'?'disco':'capa';
            equipmentCatalog.classList.add('discard-ready');discardZone.setAttribute('aria-hidden','false');
            discardZone.querySelector('strong').textContent=over?`Solte para guardar ${label}`:`Arraste aqui para guardar ${label}`;
            discardZone.querySelector('[data-discard-caption]').textContent=kind==='vinyl'?'O vinil volta para a capa do álbum na coleção.':'A capa volta para a Coleção de Discos Spotify.';
            equipmentCatalog.classList.toggle('return-drag-over',over);
        }
        function clearSpotifyDiscardTarget(){equipmentCatalog.classList.remove('return-drag-over','discard-ready');discardZone.setAttribute('aria-hidden','true');}
        function moveSpotifyAlbum(item,x,y,settle=false){item.x=settle?spotifyGridCoordinate(x,world.offsetWidth-SPOTIFY_ALBUM_SIZE):Math.max(0,Math.min(world.offsetWidth-SPOTIFY_ALBUM_SIZE,x));item.y=settle?spotifyGridCoordinate(y,maxEquipmentBottom()-SPOTIFY_ALBUM_SIZE):Math.max(0,Math.min(maxEquipmentBottom()-SPOTIFY_ALBUM_SIZE,y));item.el.style.left=item.x+'px';item.el.style.top=item.y+'px';}
        function syncSpotifyAlbum(item){item.el.classList.toggle('has-vinyl',item.open&&!spotifyVinyls.has(item.uri));item.el.classList.toggle('is-open',item.open);}
        function removeSpotifyAlbum(item,recordHistory=true){if(recordHistory)recordDeletedSpotify('album',item);spotifyAlbums.delete(item.uri);item.el.remove();refreshSpotifyAlbums();scheduleProjectSave();}
        function createSpotifyAlbum(record){
            if(!record||!/^spotify:(album|playlist):[A-Za-z0-9]+$/.test(record.uri||'')||spotifyAlbums.has(record.uri))return null;
            const item={id:record.id||'album_'+Math.random().toString(36).slice(2),uri:record.uri,name:String(record.name||'Álbum').slice(0,160),image:/^https:\/\//.test(record.image||'')?record.image:'',origin:record.origin||null,x:0,y:0,open:!!record.open};
            const el=document.createElement('div');el.className='spotify-canvas-album';el.tabIndex=0;el.setAttribute('aria-label',item.name+' · arraste ou clique para abrir');
            const cover=document.createElement('span');cover.className='spotify-canvas-album-cover';if(item.image)cover.style.backgroundImage=`url("${item.image.replaceAll('"','%22')}")`;
            const disc=document.createElement('span');disc.className='spotify-canvas-album-disc';disc.title='Retirar o disco';el.append(disc,cover);item.el=el;world.append(el);spotifyAlbums.set(item.uri,item);moveSpotifyAlbum(item,Number(record.x)||0,Number(record.y)||0,true);syncSpotifyAlbum(item);refreshSpotifyAlbums();
            disc.addEventListener('pointerdown',event=>{if(event.button!==0||spotifyVinyls.has(item.uri))return;event.preventDefault();event.stopPropagation();const at=screenToWorld(event.clientX,event.clientY),vinyl=createSpotifyVinyl({uri:item.uri,name:item.name,image:item.image,origin:item.origin,x:at.x-SPOTIFY_VINYL_SIZE/2,y:at.y-SPOTIFY_VINYL_SIZE/2});syncSpotifyAlbum(item);if(vinyl)beginSpotifyVinylDrag(vinyl,event);});
            el.addEventListener('pointerdown',event=>{if(event.button!==0||event.target===disc)return;event.preventDefault();event.stopPropagation();item.dragStart={x:item.x,y:item.y};const start=screenToWorld(event.clientX,event.clientY),offsetX=start.x-item.x,offsetY=start.y-item.y;let moved=false,ghost=null;const move=ev=>{if(ev.pointerId!==event.pointerId||ev.type==='pointercancel')return;const at=screenToWorld(ev.clientX,ev.clientY);if(!moved&&Math.hypot(ev.clientX-event.clientX,ev.clientY-event.clientY)<8)return;if(!moved){moved=true;el.classList.add('is-dragging');ghost=createSpotifyDragGhost(el,event);}moveSpotifyAlbum(item,at.x-offsetX,at.y-offsetY);ghost?.move(ev);updateSpotifyDiscardTarget(ev,'album');};const end=ev=>{if(ev.pointerId!==event.pointerId)return;window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);ghost?.restore();el.classList.remove('is-dragging');clearSpotifyDiscardTarget();el.style.pointerEvents='none';const overFurniture=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('.device-type-furnitureCoverflow');el.style.pointerEvents='';moveSpotifyAlbum(item,item.x,item.y,true);if(!moved){item.open=!item.open;syncSpotifyAlbum(item);}else if(ev.type!=='pointercancel'&&(isOverCatalog(ev)||overFurniture)){showDiscardCloud(ev.clientX,ev.clientY);removeSpotifyAlbum(item);return;}item.dragStart=null;scheduleProjectSave();};window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);});
            return item;
        }
        document.addEventListener('spotify-album-pickup',event=>{const furniture=event.target.closest('.device-node'),data=event.detail;if(!furniture||!data||spotifyAlbums.has(data.uri))return;const at=screenToWorld(data.clientX,data.clientY),item=createSpotifyAlbum({...data,origin:furniture.id,x:at.x-SPOTIFY_ALBUM_SIZE/2,y:at.y-SPOTIFY_ALBUM_SIZE/2});if(item){item.el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,pointerId:data.pointerId,clientX:data.clientX,clientY:data.clientY}));scheduleProjectSave();}});
        function vinylPlatterCenter(dev){
            const marker=dev.el.querySelector(dev.type==='turntableLinear'?'.linear-disc-size':'[data-tt="record"]')||dev.el;
            const rect=marker.getBoundingClientRect();return screenToWorld(rect.left+rect.width/2,rect.top+rect.height/2);
        }
        function syncPlatterVinyls(affectedDeviceIds=null){for(const item of spotifyVinyls.values()){if(affectedDeviceIds&&!affectedDeviceIds.has(item.turntableId))continue;const dev=appState.project.devices[item.turntableId];if(!dev)continue;const at=vinylPlatterCenter(dev);moveSpotifyVinyl(item,at.x-SPOTIFY_VINYL_SIZE/2,at.y-6);}}
        function moveSpotifyVinyl(item,x,y,settle=false){const snap=settle&&!item.turntableId;item.x=snap?spotifyGridCoordinate(x,world.offsetWidth-SPOTIFY_VINYL_SIZE):Math.max(0,Math.min(world.offsetWidth-SPOTIFY_VINYL_SIZE,x));item.y=snap?spotifyGridCoordinate(y,maxEquipmentBottom()-SPOTIFY_VINYL_SIZE):Math.max(0,Math.min(maxEquipmentBottom()-(item.turntableId?12:SPOTIFY_VINYL_SIZE),y));item.el.style.left=item.x+'px';item.el.style.top=item.y+'px';}
        function placeSpotifyVinyl(item,dev,animate=true){
            if(dev.spotifyVinyl&&dev.spotifyVinyl!==item){spotifyVinylNotice('Este prato já tem um disco.');return false;}
            if(dev.state.playing)setSourcePlaying(dev,false);
            if(item.turntableId&&appState.project.devices[item.turntableId]){const previous=appState.project.devices[item.turntableId];if(previous.state.playing)setSourcePlaying(previous,false);previous.spotifyVinyl=null;}
            const fromX=item.x,fromY=item.y;
            item.turntableId=dev.id;item.dragStart=null;dev.spotifyVinyl=item;dev.spotifyNeedsRestart=true;if(dev.type==='turntableLinear'&&dev.state.tt?.disc==='none'){dev.state.tt.disc='lp';dev.refreshTurntable?.();}dev.setLidOpen?.(true);dev.el.classList.add('spotify-vinyl-placing');const center=vinylPlatterCenter(dev);moveSpotifyVinyl(item,center.x-SPOTIFY_VINYL_SIZE/2,center.y-6);
            item.el.classList.toggle('is-linear',dev.type==='turntableLinear');item.el.classList.add('is-on-platter');
            const finish=()=>{dev.el.classList.remove('spotify-vinyl-placing');GuidedAccess.notify();};
            if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
                const dx=fromX-item.x,dy=fromY-item.y;
                item.el.animate([{transform:`translate(${dx}px,${dy}px) scaleY(32)`,opacity:.85,offset:0},{transform:'translate(0,-54px) scaleY(.16)',opacity:1,offset:.42},{transform:'translate(0,0) scaleY(1)',opacity:1,offset:1}],{duration:900,easing:'cubic-bezier(.2,.7,.22,1)'}).finished.then(finish,finish);
            }else finish();
            if(!projectRestoring){selectDevice(dev.id,true);spotifyVinylNotice('O Play controla o Spotify. Cabos e volumes determinam se você o ouve. O ruído do vinil pode tocar junto, mas os demais efeitos dos aparelhos não alteram a música.');}scheduleProjectSave();return true;
        }
        function createSpotifyVinyl(record){
            if(!record||typeof record.uri!=='string'||!/^spotify:(album|playlist):[A-Za-z0-9]+$/.test(record.uri)||spotifyVinyls.has(record.uri))return null;
            const item={id:record.id||'vinyl_'+Math.random().toString(36).slice(2),uri:record.uri,name:String(record.name||'Disco do Spotify').slice(0,160),image:/^https:\/\//.test(record.image||'')?record.image:'',origin:record.origin||null,turntableId:null,x:0,y:0};
            const el=document.createElement('div');el.className='spotify-canvas-vinyl';el.tabIndex=0;el.title=item.name+' · arraste ao toca-discos ou de volta ao móvel';el.setAttribute('aria-label',el.title);
            const label=document.createElement('span');if(item.image)label.style.backgroundImage=`url("${item.image.replaceAll('"','%22')}")`;el.append(label);item.el=el;world.append(el);spotifyVinyls.set(item.uri,item);moveSpotifyVinyl(item,Number(record.x)||0,Number(record.y)||0,true);refreshSpotifyVinyls();
            el.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();event.stopPropagation();beginSpotifyVinylDrag(item,event);});
            return item;
        }
        function removeSpotifyVinyl(item,recordHistory=true){if(recordHistory)recordDeletedSpotify('vinyl',item);if(item.turntableId){const dev=appState.project.devices[item.turntableId];if(dev?.state.playing)setSourcePlaying(dev,false);if(dev){dev.spotifyVinyl=null;if(appState.interface.selectedDeviceId===dev.id)selectDevice(dev.id,true);}}spotifyVinyls.delete(item.uri);item.el.remove();refreshSpotifyVinyls();scheduleProjectSave();}
        function beginSpotifyVinylDrag(item,event){
            const prior=appState.project.devices[item.turntableId];item.dragStart={x:item.x,y:item.y,turntableId:prior?.id||null};if(prior){if(prior.state.playing)setSourcePlaying(prior,false);prior.spotifyVinyl=null;item.turntableId=null;item.el.classList.remove('is-on-platter','is-linear','is-playing');if(appState.interface.selectedDeviceId===prior.id)selectDevice(prior.id,true);}
            const point=screenToWorld(event.clientX,event.clientY),offsetX=prior?SPOTIFY_VINYL_SIZE/2:point.x-item.x,offsetY=prior?SPOTIFY_VINYL_SIZE/2:point.y-item.y;item.el.classList.add('is-dragging');const ghost=createSpotifyDragGhost(item.el,event);
            let autoLid=null;
            const hitDevice=(x,y)=>{item.el.style.pointerEvents='none';const target=document.elementFromPoint(x,y)?.closest('.device-node');item.el.style.pointerEvents='';return appState.project.devices[target?.id];};
            const releaseAutoLid=keepOpen=>{if(autoLid&&!keepOpen&&appState.project.devices[autoLid.id]===autoLid)autoLid.setLidOpen?.(false);autoLid=null;};
            const move=ev=>{if(ev.pointerId!==event.pointerId)return;const at=screenToWorld(ev.clientX,ev.clientY);moveSpotifyVinyl(item,at.x-offsetX,at.y-offsetY);ghost.move(ev);updateSpotifyDiscardTarget(ev,'vinyl');const hovered=hitDevice(ev.clientX,ev.clientY);const next=hovered&&TURNTABLE_TYPES.has(hovered.type)?hovered:null;if(next!==autoLid){releaseAutoLid(false);if(next&&!next.state.lidOpen){next.setLidOpen?.(true);autoLid=next;}}};
            const end=ev=>{if(ev.pointerId!==event.pointerId)return;window.removeEventListener('pointermove',move,true);window.removeEventListener('pointerup',end,true);window.removeEventListener('pointercancel',end,true);ghost.restore();item.el.classList.remove('is-dragging');clearSpotifyDiscardTarget();
                const dev=ev.type==='pointercancel'?null:hitDevice(ev.clientX,ev.clientY);
                const placed=dev&&TURNTABLE_TYPES.has(dev.type)&&placeSpotifyVinyl(item,dev);
                releaseAutoLid(!!placed&&autoLid===dev);
                if(!placed&&ev.type!=='pointercancel'&&(isOverCatalog(ev)||dev?.type==='furnitureCoverflow')){showDiscardCloud(ev.clientX,ev.clientY);removeSpotifyVinyl(item);if(prior&&appState.interface.selectedDeviceId===prior.id)selectDevice(prior.id,true);playUiSound('discard');spotifyVinylNotice('Disco guardado na capa do álbum.');}
                else if(!placed){moveSpotifyVinyl(item,item.x,item.y,true);item.dragStart=null;if(prior&&appState.interface.selectedDeviceId===prior.id)selectDevice(prior.id,true);scheduleProjectSave();}
            };
            updateSpotifyDiscardTarget(event,'vinyl');
            window.addEventListener('pointermove',move,true);window.addEventListener('pointerup',end,true);window.addEventListener('pointercancel',end,true);
        }
        document.addEventListener('spotify-vinyl-pickup',event=>{
            const furniture=event.target.closest('.device-node'),data=event.detail;if(!furniture||!data||spotifyVinyls.has(data.uri))return;
            const at=screenToWorld(data.clientX,data.clientY),item=createSpotifyVinyl({...data,origin:furniture.id,x:at.x-SPOTIFY_VINYL_SIZE/2,y:at.y-SPOTIFY_VINYL_SIZE/2});if(item)beginSpotifyVinylDrag(item,{...data,button:0});
        });
        function spotifyPathVolume(source){
            const solo=Object.values(appState.project.devices).some(dev=>isListeningDevice(dev)&&dev.state.solo),seen=new Set();let best=0;
            function walk(dev,input,gain){
                if(!dev||dev.state.damage||!dev.powered)return;
                if(dev!==source){if(dev.state.muted||dev.state.streamMute||dev.state.preMuted)return;if(typeof dev.state.volume==='number')gain*=Math.max(0,Math.min(1,dev.state.volume));if(Array.isArray(dev.state.channelVolumes))gain*=Math.max(0,...dev.state.channelVolumes.map(value=>Math.max(0,Math.min(1,value))));}
                if(isListeningDevice(dev)){if(!dev.state.muted&&(!solo||dev.state.solo))best=Math.max(best,gain);return;}
                for(const output of dev.el.querySelectorAll('.port[data-io="out"]')){
                    if(input&&!routedInputPorts(dev,output).includes(input))continue;
                    if(!portCarriesSignal(dev,output))continue;
                    for(const cable of appState.project.connections){if(cable.miswired||cable.outId!==output.id)continue;const nextInput=document.getElementById(cable.inId),next=appState.project.devices[nextInput?.closest('.device-node')?.id];if(!next||seen.has(next.id+':'+nextInput.id))continue;
                        if(RADIO_RECEIVERS.has(next.type)){const selected=next.state.receiverInput||'line1',prefix=selected==='line1'?'in':selected;if(selected==='fm'||!new RegExp('^'+prefix+'[LR]$').test(nextInput.dataset.node))continue;}
                        if(next.type==='streamIntegrated'&&next.state.streamInput!=='line')continue;
                        if(controlAmpConfig(next.type)&&!nextInput.dataset.node.startsWith(next.state.integratedSource===3&&controlAmpConfig(next.type).phono!==false?'phono':'line'+next.state.integratedSource))continue;
                        if(next.type==='preamp'&&!nextInput.dataset.node.startsWith('in'+next.state.preSource))continue;
                        if(MATRIX_TYPES.has(next.type)&&!nextInput.dataset.node.startsWith('in'+next.state.matrixInput))continue;
                        seen.add(next.id+':'+nextInput.id);walk(next,nextInput,gain);seen.delete(next.id+':'+nextInput.id);
                    }
                }
            }
            walk(source,null,1);return Math.min(.65,best*.55*Math.min(1,appState.preferences.listening.outputLevel));
        }
        function scheduleSpotifyVolume(){if(spotifyVolumeTimer)return;spotifyVolumeTimer=setTimeout(()=>{spotifyVolumeTimer=0;const dev=appState.project.devices[spotifyPlayingTurntable],target=dev&&dev.state.playing?spotifyPathVolume(dev):0;spotifyVolume+=Math.max(-.08,Math.min(.08,target-spotifyVolume));if(Math.abs(spotifyVolume-target)<.004)spotifyVolume=target;SpotifyCoverflow.setPlaybackVolume(spotifyVolume).catch(()=>{});if(spotifyPlayingTurntable&&Math.abs(spotifyVolume-target)>.004)scheduleSpotifyVolume();},100);}
        setInterval(()=>{if(spotifyPlayingTurntable)scheduleSpotifyVolume();},240);
