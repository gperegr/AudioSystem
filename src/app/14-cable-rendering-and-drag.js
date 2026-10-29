/* Cable geometry, plugs, drawing, and pointer interaction. */
        let isPatching = false; let startPort = null; let tempCableEl = null;

        function getPortScreenAnchor(elem){
            const rect=elem.getBoundingClientRect();
            return {x:rect.left+rect.width/2,y:rect.top+rect.height*(elem.dataset.type==='wire'?.69:.5)};
        }
        function getPortCenter(elem) {
            const point=getPortScreenAnchor(elem);
            return screenToWorld(point.x,point.y);
        }

        // --- FÍSICA E GRAVIDADE DINÂMICA COM BALANÇO (PENDULAR / INÉRCIA) ---
        const dragPhysics = {
            lastX: 0,
            lastY: 0,
            lastTime: 0,
            swingX: 0,
            swingY: 0,
            swingVelX: 0,
            swingVelY: 0,
            activeTarget: null,
            displayedTarget: null,
            frameTime: 0
        };

        function calculateSagPath(p1, p2, swing = { x: 0, y: 0 }, routeOffset = 0, slack=5) {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const span = Math.hypot(dx, dy);
            
            // O peso do cabo puxa verticalmente para baixo criando a "barriga" natural
            const baseSag = Math.max(48, span * 0.32);
            const asymmetry = Math.max(0, -dy * 0.20);
            // Variação vertical sutil e contida
            const slackFactor=.12+Math.max(0,Math.min(10,slack))*.176;
            const sag = Math.max(6,Math.min(340,(baseSag+asymmetry)*slackFactor+routeOffset))+(swing.y||0)*.45;

            // Inércia lateral suave e realista (sensação de cabo de borracha pesado e flexível, não elástico)
            const lateralOffset = (swing.x || 0) * 0.45;

            // Pontos de controle cúbicos com curvatura pesada e amortecida
            const cp1x = p1.x + dx * 0.18 + lateralOffset * 0.4;
            const cp1y = p1.y + sag;
            const cp2x = p2.x - dx * 0.18 + lateralOffset * 0.55;
            const cp2y = p2.y + sag;
            return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }

        let rightAngleLanes=null;
        function rightAngleCablePath(start,end,source,target,offset=0){
            const margin=12,rects=Object.values(appState.project.devices).map(dev=>{
                const box=dev.el.getBoundingClientRect(),worldBox=world.getBoundingClientRect();
                return {id:dev.id,left:(box.left-worldBox.left)/view.zoom-margin,right:(box.right-worldBox.left)/view.zoom+margin,top:(box.top-worldBox.top)/view.zoom-margin,bottom:(box.bottom-worldBox.top)/view.zoom+margin};
            });
            const from=rects.find(r=>r.id===source),to=rects.find(r=>r.id===target);
            const startExit={x:start.x,y:Math.max(start.y+32,from?.bottom||0)},endExit={x:end.x,y:Math.max(end.y+32,to?.bottom||0)};
            const obstacles=rects.filter(r=>r.id!==source&&r.id!==target);
            let lane=Math.max(startExit.y,endExit.y,...obstacles.filter(r=>r.left<Math.max(start.x,end.x)&&r.right>Math.min(start.x,end.x)&&r.top<Math.max(startExit.y,endExit.y)+20).map(r=>r.bottom))+20+Math.abs(offset);
            if(rightAngleLanes){
                const left=Math.min(start.x,end.x),right=Math.max(start.x,end.x),spacing=18;
                while(rightAngleLanes.some(other=>other.axis==='h'&&left<other.right+spacing&&right>other.left-spacing&&Math.abs(lane-other.y)<spacing))lane+=spacing;

            }
            // Route around obstacles intersecting either vertical exit using an outside corridor.
            function escape(point,ownId){
                const block=rects.filter(r=>r.id!==ownId&&point.x>r.left&&point.x<r.right&&r.top<lane&&r.bottom>point.y).sort((a,b)=>a.top-b.top)[0];
                if(!block)return [point,{x:point.x,y:lane}];
                const side=Math.abs(point.x-block.left)<Math.abs(point.x-block.right)?-1:1;
                let x=side<0?block.left-1:block.right+1;
                let y=Math.max(point.y,block.top-1);
                if(rightAngleLanes){
                    const spacing=18;
                    while(rightAngleLanes.some(other=>other.axis==='v'&&Math.abs(x-other.x)<spacing&&y<other.bottom&&lane>other.top))x+=side*spacing;
                    while(rightAngleLanes.some(other=>other.axis==='h'&&Math.abs(y-other.y)<spacing&&Math.min(x,point.x)<other.right&&Math.max(x,point.x)>other.left))y+=spacing;
                }
                return [point,{x:point.x,y},{x,y},{x,y:lane}];
            }
            const points=[start,...escape(startExit,source),...escape(endExit,target).reverse(),end];
            if(rightAngleLanes)for(let i=1;i<points.length;i++){
                const a=points[i-1],b=points[i];
                if(a.y===b.y&&a.x!==b.x)rightAngleLanes.push({axis:'h',left:Math.min(a.x,b.x),right:Math.max(a.x,b.x),y:a.y});
                else if(a.x===b.x&&a.y!==b.y&&i>1&&i<points.length-1)rightAngleLanes.push({axis:'v',x:a.x,top:Math.min(a.y,b.y),bottom:Math.max(a.y,b.y)});
            }
            return points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
        }
        const CABLE_GEOMETRY=Hardware.plugs;
        const cableGeometry=type=>CABLE_GEOMETRY[type]||CABLE_GEOMETRY.rca;
        function drawCablePlugs(container, cableType, endpoints) {
            ['start', 'end'].forEach((end, index) => {
                let plug = container.querySelector(`.cable-plug-${end}`);
                if (!plug) {
                    plug = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    plug.setAttribute('class', `cable-plug cable-plug-${end}`);
                    plug.setAttribute('aria-hidden', 'true');
                    container.appendChild(plug);
                }
                if (plug.dataset.type !== cableType) {
                    plug.dataset.type = cableType;
                    plug.innerHTML='<g class="plug-seat-body">'+Hardware.plugMarkup(cableType)+'</g>';
                }
                const body=plug.querySelector('.plug-seat-body');
                body?.setAttribute('transform',`translate(${container.dataset.seatEnd===end?Number(container.dataset.seatOffset||0):0} 0)`);
                if(body&&!body.querySelector('.plug-entry-shadow')){
                    const shadow=document.createElementNS('http://www.w3.org/2000/svg','ellipse');shadow.setAttribute('class','plug-entry-shadow');shadow.setAttribute('cx','1');shadow.setAttribute('cy','0');shadow.setAttribute('rx',cableType==='p2'?'3':'5');shadow.setAttribute('ry',cableType==='p2'?'3':'4');body.insertBefore(shadow,body.firstChild);
                }
                plug.style.opacity=container.dataset.seating==='true'?container.dataset.seatOpacity||'1':'1';
                const {tip,angle,rear}=endpoints[index];
                plug.setAttribute('transform', `translate(${tip.x} ${tip.y}) rotate(${angle})`);
                const sceneLight=Hardware.sceneLightAt(tip.x,tip.y);
                if(sceneLight){
                    const sourceX=sceneLight.x,sourceY=sceneLight.y;
                    const dx=tip.x-sourceX,dy=tip.y-sourceY,length=Math.hypot(dx,dy),factor=Math.min(1,3/(length*1.8/170||1));
                    plug.style.setProperty('--plug-shadow-x',(dx*1.8/170*factor).toFixed(1)+'px');
                    plug.style.setProperty('--plug-shadow-y',(dy*1.8/170*factor).toFixed(1)+'px');
                }else{plug.style.setProperty('--plug-shadow-x','0px');plug.style.setProperty('--plug-shadow-y','0px');}
                if(cableType!=='wire'){
                    let boot=plug.querySelector('.plug-strain-relief');
                    if(!boot){boot=document.createElementNS('http://www.w3.org/2000/svg','path');boot.setAttribute('class','plug-strain-relief');(body||plug).insertBefore(boot,(body||plug).firstChild);}
                    boot.setAttribute('d',`M ${rear-1} 0 L ${rear+8} 0`);
                    boot.setAttribute('fill','none');boot.setAttribute('stroke','#252d32');boot.setAttribute('stroke-width',String(cableGeometry(cableType).outer));boot.setAttribute('stroke-linecap','round');
                    let collar=plug.querySelector('.plug-collar');
                    if(!collar){collar=document.createElementNS('http://www.w3.org/2000/svg','path');collar.setAttribute('class','plug-collar');(body||plug).appendChild(collar);}
                    collar.setAttribute('d',`M ${rear-1} -3.1 L ${rear+1.2} -3.1 L ${rear+1.2} 3.1 L ${rear-1} 3.1 Z`);
                    let ridges=plug.querySelector('.plug-boot-ridge');
                    if(!ridges){ridges=document.createElementNS('http://www.w3.org/2000/svg','path');ridges.setAttribute('class','plug-boot-ridge');(body||plug).appendChild(ridges);}
                    ridges.setAttribute('d',`M ${rear+3} -2.5v5 M ${rear+5} -2.5v5 M ${rear+7} -2.5v5`);
                }

            });
        }

        function drawCable(container, p1, p2, waypoints = [], cableType = 'rca-r', swing = { x: 0, y: 0 }, routeOffset = 0) {
            const seating=container.dataset.seating==='true';
            const showPlugs=seating||(isPatching&&container===tempCableEl&&!appState.project.connections.some(connection=>connection.el===container));
            const geometry=cableGeometry(cableType);
            container.style.setProperty('--cable-outer',geometry.outer+'px');
            container.style.setProperty('--cable-inner',geometry.inner+'px');
            const slack=Number(container.dataset.slack??5);
            const rightAngle=appState.preferences.orthogonalCables;
            const connection=appState.project.connections.find(item=>item.el===container);
            const source=connection?.outDeviceId||startPort?.closest('.device-node')?.id;
            const target=connection?.inDeviceId;
            const lane=Math.max(p1.y,p2.y)+48;
            const guide=rightAngle?rightAngleCablePath(p1,p2,source,target,routeOffset):calculateSagPath(p1,p2,swing,routeOffset,slack);
            const coords=guide.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
            const rear=cableType==='wire'?20:(cableType==='p10'||cableType==='p2')?28*geometry.scale:25;
            const endpoints=[{tip:p1,control:rightAngle?{x:p1.x,y:lane}:{x:coords[2],y:coords[3]}},{tip:p2,control:rightAngle?{x:p2.x,y:lane}:{x:coords[4],y:coords[5]}}].map(({tip,control})=>{
                const dx=control.x-tip.x,dy=control.y-tip.y,length=Math.hypot(dx,dy)||1;
                const direction={x:dx/length,y:dy/length},offset=rear+(cableType==='wire'?0:8);
                return {tip,rear,direction,angle:Math.atan2(dy,dx)*180/Math.PI,base:{x:tip.x+direction.x*offset,y:tip.y+direction.y*offset}};
            });
            const [start,end]=endpoints;
            const pull=Math.max(24,Math.min(180,Math.hypot(p2.x-p1.x,p2.y-p1.y)*.3));
            const pathData=rightAngle?guide:showPlugs&&!seating?`M ${start.base.x} ${start.base.y} C ${start.base.x+start.direction.x*pull} ${start.base.y+start.direction.y*pull}, ${end.base.x+end.direction.x*pull} ${end.base.y+end.direction.y*pull}, ${end.base.x} ${end.base.y}`:guide;

            if (cableType === 'wire') {
                // Desenha o Fio de Caixa Trançado (Vermelho e Preto)
                let blackPath = container.querySelector('.wire-braid-black');
                let redPath = container.querySelector('.wire-braid-red');
                if (!blackPath || !redPath) {
                    container.innerHTML = '';
                    blackPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    blackPath.setAttribute("class", "wire-braid-black");
                    redPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    redPath.setAttribute("class", "wire-braid-red");
                    container.appendChild(blackPath);
                    container.appendChild(redPath);
                }
                blackPath.setAttribute("d", pathData);
                redPath.setAttribute("d", pathData);
            } else {
                let singlePath = container.tagName.toLowerCase() === 'path' ? container : container.querySelector('.cable-path');
                if (!singlePath) {
                    container.innerHTML = '';
                    singlePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    singlePath.setAttribute("class", "cable-path");
                    container.appendChild(singlePath);
                }
                singlePath.dataset.type = cableType;
                singlePath.setAttribute("d", pathData);
            }

            if (container.tagName.toLowerCase() === 'g') {
                let title = container.querySelector('title');
                if (!title) {
                    title = document.createElementNS("http://www.w3.org/2000/svg", "title");
                    container.insertBefore(title, container.firstChild);
                }
                const cableNames = { 'rca-r':'RCA R · canal direito', 'rca-l':'RCA L · canal esquerdo', rca:'RCA', p10:'P10', p2:'P2', wire:'Fio de caixa · par vermelho/preto' };
                title.textContent = cableNames[cableType] || 'Cabo de áudio';

                let outline = container.querySelector('.cable-outline');
                if (!outline) {
                    outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    outline.setAttribute("class", "cable-outline");
                    container.insertBefore(outline, container.firstChild.nextSibling);
                }
                outline.dataset.type = cableType;
                outline.setAttribute("d", pathData);
                if(showPlugs)drawCablePlugs(container, cableType, endpoints);
                else container.querySelectorAll('.cable-plug').forEach(plug=>plug.remove());
            }
        }

        canvas.addEventListener('pointerdown', e => {
            const port = e.target.closest('.port');
            if (port) {
                e.preventDefault();
                window.getSelection()?.removeAllRanges();
                
                // Conectar ou reconectar
                const existingIdx = appState.project.connections.findIndex(c => c.outId === port.id || c.inId === port.id);
                if (existingIdx > -1) {
                    const conn = appState.project.connections[existingIdx];
                    const otherId = conn.outId === port.id ? conn.inId : conn.outId;
                    removeConnection(existingIdx);
                    startPort = document.getElementById(otherId);
                } else {
                    startPort = port;
                    playUiSound('pickup');
                }

                if (!startPort) return;
                
                isPatching = true;
                scheduleVisuals();
                startCableHum();
                dragPhysics.displayedTarget=null;dragPhysics.frameTime=0;
                updatePortGuidance();
                tempCableEl = document.createElementNS("http://www.w3.org/2000/svg", "g");
                tempCableEl.setAttribute("class", "cable-group active");
                tempCableEl.dataset.type = startPort.dataset.type;
                svgLayer.appendChild(tempCableEl);
                
                const pCenter = getPortCenter(startPort);
                const mousePos = screenToWorld(e.clientX, e.clientY);

                // Inicializa variáveis do pêndulo físico para o cabo solto
                dragPhysics.lastX = e.clientX;
                dragPhysics.lastY = e.clientY;
                dragPhysics.lastTime = performance.now();
                dragPhysics.swingX = 0;
                dragPhysics.swingY = 0;
                dragPhysics.swingVelX = 0;
                dragPhysics.swingVelY = 0;
                dragPhysics.activeTarget = mousePos;

                drawCable(tempCableEl, pCenter, mousePos, [], startPort.dataset.type, { x: 0, y: 0 });
                e.stopPropagation();
            }
        });

