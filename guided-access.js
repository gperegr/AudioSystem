/* Guide UI and lesson data. Audio, project and device operations stay in the app adapter. */
(function(root){
    'use strict';
    const KEY='audio-system-tutorial-v2';
    const icons={equipment:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 10h5m-5 4h5"/>',cable:'<path d="M6 3v5M3 8h6v3a3 3 0 0 1-6 0V8m3 6v3a4 4 0 0 0 8 0v-4m-2-3h4v3h-4z"/>',record:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',usb:'<path d="M12 3v17m-3-14 3-3 3 3m-3 9 6-5V6m-6 11-6-5V9"/><circle cx="6" cy="8" r="1"/>',file:'<path d="M14 2H5v20h14V7ZM14 2v5h5M9 17v-6l5-1v6"/>',play:'<path d="m8 5 11 7-11 7Z"/>',speaker:'<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="15" r="4"/><circle cx="12" cy="6" r="1"/>',phones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12h4v8H6a2 2 0 0 1-2-2Zm16 0h-4v8h2a2 2 0 0 0 2-2Z"/>'};
    const topics=[
        {id:'basic',name:'Montagem básica',icon:'cable',steps:[
            ['source','Escolha uma fonte','Em Equipamentos, adicione um CD Player, Tape Deck ou Streamer. Você também pode selecionar um que já esteja no canvas.','catalog'],
            ['properties','Abra as propriedades','Selecione a fonte e abra Propriedades para ver seus controles.','properties'],
            ['amplifier','Conecte o amplificador','Adicione um amplificador e conecte a fonte à entrada de linha. Nas ligações RCA estéreo, conecte L e R. Arraste entre portas ou toque nas duas.','ports'],
            ['output','Conecte caixas ou fones','Ligue a saída para caixas ou PHONES ao destino correspondente. Entradas de linha e de caixas não são intercambiáveis.','output'],
            ['ready','Prepare a escuta','Ligue os aparelhos, escolha a entrada conectada e retire o mute. Comece com volume baixo; esta etapa não inicia áudio.','ready']
        ]},
        {id:'spotify',name:'Spotify',icon:'record',note:'O áudio do Spotify não pode ser processado pelos equipamentos. Equalizadores e outros efeitos não são aplicados; a cadeia controla apenas audibilidade e volume.',steps:[
            ['account','Conecte o Spotify','Adicione Coleção de Discos · Spotify. Nas propriedades, toque em Conectar Spotify. A reprodução exige Premium. Sem conta disponível? Pule este tópico.','spotify'],
            ['cover','Abra uma capa','Percorra a coleção com rolagem ou arraste e toque em uma capa para abri-la.','cover'],
            ['vinyl','Coloque o vinil no prato','Retire o disco exposto e leve-o até um toca-discos com o prato vazio. Solte e aguarde a colocação.','vinyl'],
            ['ready','Conecte a cadeia','Ligue o toca-discos ao amplificador e às caixas ou fones. Ligue os aparelhos e selecione a entrada conectada.','ready'],
            ['play','Use o Play do toca-discos','Acione Play no aparelho. O Spotify inicia pelo toca-discos; o caminho conectado determina se você ouve.','play']
        ]},
        {id:'capture',name:'Entrada externa',icon:'usb',steps:[
            ['permission','Autorize a entrada','Conecte sua interface física. Adicione uma Interface USB e, nas propriedades, toque em Autorizar / buscar entradas. Permita o microfone.','permission'],
            ['device','Escolha o dispositivo','Selecione sua entrada na lista. Para usar a entrada padrão, toque em Iniciar captura. Sem dispositivo ou permissão? Pule o tópico.','device'],
            ['capture','Inicie a captura','Toque em Iniciar captura. A entrada pode estar ativa mesmo quando não há sinal chegando.','capture'],
            ['output','Conecte a saída','Use LINE para um amplificador ou caixa ativa, ou PHONES para fones. Verifique energia, entrada selecionada e mute.','output'],
            ['level','Ajuste o nível','Mova um controle de ganho ou volume da interface aos poucos. O modelo Central tem apenas volume compartilhado.','level']
        ]},
        {id:'mp3',name:'Arquivos MP3',icon:'file',steps:[
            ['source','Selecione uma fonte','Adicione ou selecione um CD Player, Tape Deck ou Streamer para carregar seu arquivo.','catalog'],
            ['file','Carregue sua música','Nas propriedades da fonte, toque em Carregar áudio e escolha um arquivo local. Espere o carregamento terminar.','file'],
            ['ready','Conecte a escuta','Conecte a fonte ao amplificador e às caixas ou fones. Você também pode usar uma caixa ativa ligada à saída de linha.','ready'],
            ['play','Inicie a faixa','Use Play na fonte ou nas propriedades. O arquivo local percorre os efeitos e equipamentos conectados.','play'],
            ['pause','Pause a faixa','Use o controle de pausa da mesma fonte. A posição fica guardada para continuar depois.','play']
        ]}
    ];
    const examples=[
        {id:'cd',name:'MP3 / CD · caixas ativas',icon:'speaker',diagram:'CD → caixas ativas',requirement:'Arquivo local ou demonstração',hint:'Selecione o CD Player. Carregue um arquivo ou use Play para ouvir a demonstração.',furniture:'furnitureTable',types:['cdPlayer','spkActiveCompact'],links:[[0,'outL',1,'inL'],[0,'outR',1,'inR']]},
        {id:'capture',name:'Entrada externa · caixas passivas',icon:'usb',diagram:'USB → potência → caixas L/R',requirement:'Entrada de áudio e permissão do navegador',hint:'Selecione a Interface USB, autorize a entrada, escolha o dispositivo e inicie a captura.',furniture:'furnitureTable',types:['audioInterface1','powerStereo','spkPassiveWood','spkPassiveWood'],floor:[2,3],links:[[0,'outL',1,'inL'],[0,'outR',1,'inR'],[1,'outL',2,'in'],[1,'outR',3,'in']]},
        {id:'lab',name:'Laboratório · equalização',icon:'equipment',diagram:'Gerador → EQ → amp → fones',requirement:'Sem arquivo ou conta externa',hint:'Selecione o gerador e use Play. Ajuste uma faixa do equalizador e compare o som.',furniture:'furnitureRackTall',types:['signalGenerator','eqStudio','headphoneAmp','headphone'],shelves:[1,2,3,0],links:[[0,'outL',1,'inL'],[0,'outR',1,'inR'],[1,'outL',2,'inL'],[1,'outR',2,'inR'],[2,'outPhone',3,'in']]},
        {id:'tape',name:'Fita · escuta compartilhada',icon:'phones',diagram:'Tape → amp de 4 saídas → 2 fones',requirement:'Arquivo local ou demonstração',hint:'Use Play no Tape Deck. Cada saída do amplificador tem seu próprio volume.',furniture:'furnitureTable',types:['tapeDeck','headphoneAmp4','headphone','headphone'],links:[[0,'outL',1,'inL'],[0,'outR',1,'inR'],[1,'outPhone1',2,'in'],[1,'outPhone2',3,'in']]},
        {id:'spotify',name:'Spotify · coleção de vinil',icon:'record',diagram:'Coleção + toca-discos → amp → fones',requirement:'Conta Spotify Premium e internet',hint:'Conecte o Spotify na coleção, abra uma capa, coloque o vinil no prato e use Play do toca-discos.',furniture:'furnitureCoverflow',types:['turntable','headphoneAmp','headphone'],links:[[0,'outL',1,'inL'],[0,'outR',1,'inR'],[1,'outPhone',2,'in']]}
    ];
    function readProgress(storage){
        let value={};try{value=JSON.parse(storage.getItem(KEY)||'{}')||{};}catch{}
        const topic=Math.max(0,Math.min(topics.length-1,Number.isInteger(value.topic)?value.topic:0));
        return {invited:!!value.invited,topic,step:Math.max(0,Math.min(topics[topic].steps.length-1,Number.isInteger(value.step)?value.step:0)),completed:Array.isArray(value.completed)?value.completed.filter(id=>typeof id==='string'):[],observations:value.observations&&typeof value.observations==='object'?value.observations:{},finished:!!value.finished};
    }
    // The adapter holds audio blobs in its checkpoint and keeps persistence suspended
    // across both the destructive build and the full restoration on failure.
    async function replaceExample(adapter,spec){
        const checkpoint=await adapter.checkpoint();
        try{await adapter.begin();await adapter.build(spec);await adapter.validate(spec);await adapter.commit();}
        catch(error){try{await adapter.restore(checkpoint);}catch(restoreError){adapter.recoveryFailed?.(checkpoint);throw new Error('A restauração falhou. Recarregue para recuperar o projeto anterior. '+restoreError.message);}throw error;}
        finally{await adapter.end();}
    }
    let activeController;
    function mount(adapter){
        let storage=adapter.storage;
        if(!storage){try{storage=root.localStorage;}catch{}}
        storage||={getItem:()=>null,setItem:()=>{}};
        let progress=readProgress(storage),active=false,frame=0,highlight=null,stepContext=null;
        let lastSaved='';
        const save=()=>{const json=JSON.stringify(progress);if(json===lastSaved)return;try{storage.setItem(KEY,json);lastSaved=json;}catch{}};
        const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[name]+'</svg>';
        const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
        const button=(text,label,action)=>{const b=el('button','',text);b.type='button';b.setAttribute('aria-label',label||text);b.addEventListener('click',action);return b;};
        const bar=el('section','tutorial-bar');bar.hidden=true;bar.setAttribute('aria-label','Tutorial interativo');document.body.append(bar);
        const dialog=el('dialog','tutorial-dialog');document.body.append(dialog);let opener=null;
        function showDialog(){opener=document.activeElement;if(!dialog.open)dialog.showModal();}
        dialog.addEventListener('close',()=>{if(opener?.isConnected)opener.focus({preventScroll:true});});
        function clearHighlight(){highlight?.classList.remove('tutorial-target');highlight=null;}
        function stop(){progress.active=false;save();active=false;bar.hidden=true;document.body.classList.remove('tutorial-open');clearHighlight();adapter.layout();if(frame)cancelAnimationFrame(frame);frame=0;adapter.clearContext?.();adapter.returnFocus?.();}
        function start(restart=false){if(restart)progress={invited:true,topic:0,step:0,completed:[],observations:{},finished:false};progress.invited=true;progress.active=true;save();dialog.close();active=true;bar.hidden=false;document.body.classList.add('tutorial-open');adapter.layout();render();}
        function move(topic,step){progress.topic=topic;progress.step=step;stepContext=null;save();render();bar.querySelector('h2')?.focus({preventScroll:true});}
        function next(){if(progress.step+1<topics[progress.topic].steps.length)move(progress.topic,progress.step+1);else if(progress.topic+1<topics.length)move(progress.topic+1,0);else{progress.finished=true;stop();dialog.replaceChildren(el('h2','','Tutorial concluído'),el('p','','Sua montagem fica no projeto. Os cinco exemplos estão nas configurações.'),button('Fechar','Fechar',()=>dialog.close()));showDialog();}}
        function render(){
            clearHighlight();bar.replaceChildren();stepContext=null;
            const topic=topics[progress.topic],task=topic.steps[progress.step];
            const header=el('header');const heading=el('h2','',topic.name+' · '+(progress.step+1)+'/'+topic.steps.length);heading.tabIndex=-1;
            const topicSelect=el('select');topicSelect.setAttribute('aria-label','Tema do tutorial');topics.forEach((item,index)=>topicSelect.add(new Option(item.name,index)));topicSelect.value=progress.topic;topicSelect.addEventListener('change',()=>move(Number(topicSelect.value),0));header.append(heading,topicSelect,button('×','Sair do tutorial',stop));
            const content=el('div','tutorial-instructions');const title=el('h3');title.innerHTML=icon(topic.icon);title.append(document.createTextNode(task[1]));content.append(title,el('p','',task[2]));if(topic.note)content.append(el('p','tutorial-note',topic.note));
            const footer=el('footer');const status=el('span','tutorial-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
            const back=button('←','Passo anterior',()=>progress.step?move(progress.topic,progress.step-1):move(progress.topic-1,topics[progress.topic-1].steps.length-1));back.disabled=progress.topic===0&&progress.step===0;
            const locate=button('Localizar','Localizar controle deste passo',()=>{stepContext.locatedTarget=adapter.locate(topic.id,task[0],task[3]);notify();});
            const skip=button('Pular tópico','Pular este tópico',()=>{if(progress.topic+1<topics.length)move(progress.topic+1,0);else stop();});
            const forward=button('→','Próximo passo',next);forward.dataset.tutorialNext='';forward.disabled=true;footer.append(back,locate,skip,status,forward);bar.append(header,content,footer);stepContext=adapter.enter?.(topic.id,task[0])||{};notify();
        }
        function check(){frame=0;if(!active||document.hidden)return;
            const topic=topics[progress.topic],task=topic.steps[progress.step];const result=adapter.inspect(topic.id,task[0],stepContext,progress.observations);
            const forward=bar.querySelector('[data-tutorial-next]');forward.disabled=!result.done;
            const text=result.done?'✓ Concluído':result.message||'Faça a ação indicada';const status=bar.querySelector('.tutorial-status');if(status.textContent!==text)status.textContent=text;
            const target=stepContext.locatedTarget?.isConnected?stepContext.locatedTarget:result.target;
            if(highlight!==target){clearHighlight();highlight=target;if(highlight?.isConnected)highlight.classList.add('tutorial-target');}
            if(result.done){const id=topic.id+':'+task[0];if(!progress.completed.includes(id))progress.completed.push(id);}save();
        }
        function notify(){if(active&&!frame&&!document.hidden)frame=requestAnimationFrame(check);}
        function open(){adapter.closeSettings();if(active){bar.querySelector('h2')?.focus();return;}dialog.replaceChildren(el('h2','','Acesso guiado'),el('p','','Pratique no projeto atual. As alterações que você fizer ficam na montagem.'));
            if(!progress.finished&&(progress.completed.length||progress.step||progress.topic))dialog.append(button('Continuar','Continuar tutorial',()=>start()));dialog.append(button('Recomeçar','Começar tutorial do início',()=>start(true)),button('Agora não','Fechar',()=>dialog.close()));showDialog();}
        function offer(){let legacy=false;try{legacy=storage.getItem('audio-system-guide-v1')==='true';}catch{}if(progress.invited||legacy)return;progress.invited=true;save();dialog.replaceChildren(el('h2','','Quer conhecer o programa?'),el('p','','Aprenda montando: conexões, Spotify, entrada externa e MP3.'),button('Começar tutorial','Começar tutorial',()=>start(true)),button('Agora não','Agora não',()=>dialog.close()));showDialog();}
        function openExamples(){adapter.closeSettings();dialog.replaceChildren(el('h2','','Montagens de exemplo'),el('p','','Cada exemplo substitui o canvas. A reprodução começa apenas pela sua ação.'));
            const status=el('p','tutorial-example-status');status.setAttribute('role','status');
            examples.forEach(spec=>{const card=button('','Carregar '+spec.name,()=>confirmExample(spec));card.className='tutorial-example-card';card.innerHTML=icon(spec.icon);const text=el('span');text.append(el('strong','',spec.name),el('span','',spec.diagram),el('small','',spec.requirement));card.append(text);dialog.append(card);});dialog.append(status,button('Fechar','Fechar exemplos',()=>dialog.close()));showDialog();}
        function confirmExample(spec){if(!adapter.hasContent()){loadExample(spec);return;}dialog.replaceChildren(el('h2','','Substituir a montagem?'),el('p','','Todo o conteúdo do canvas será removido para carregar “'+spec.name+'”. Exporte seu projeto antes se quiser guardá-lo.'),button('Cancelar','Cancelar substituição',openExamples),button('Substituir','Substituir pelo exemplo',()=>loadExample(spec)));}
        async function loadExample(spec){stop();dialog.replaceChildren(el('h2','','Preparando montagem…'));try{await replaceExample(adapter.examples,spec);dialog.replaceChildren(el('h2','',spec.name),el('p','',spec.hint),button('Explorar','Explorar montagem',()=>dialog.close()));}
            catch(error){dialog.replaceChildren(el('h2','','Não foi possível carregar'),el('p','',error.message),button('Voltar','Voltar aos exemplos',openExamples));}}
        for(const event of ['click','input','change','pointerup','keydown'])document.addEventListener(event,notify,{passive:true});document.addEventListener('visibilitychange',notify);
        document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active&&!dialog.open){stop();}});
        activeController={open,offer,openExamples,notify,save,restore(){let raw;try{raw=JSON.parse(storage.getItem(KEY)||'{}');}catch{}if(raw?.active)start();}};return activeController;
    }
    const api={topics,examples,readProgress,replaceExample,mount,notify(){activeController?.notify();}};
    if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GuidedAccess=api;
})(globalThis);
