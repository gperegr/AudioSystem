/* Front views share functional hardware controls; rear I/O is shown in a recessed rail. */
const AudioInterfaceDesign = (() => {
    const icons = {
        mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11a6 6 0 0 0 12 0m-6 6v4m-4 0h8"/>',
        phones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12h4v8H6a2 2 0 0 1-2-2Zm16 0h-4v8h2a2 2 0 0 0 2-2Z"/>',
        usb:'<path d="M12 3v15m-3-12 3-3 3 3m-3 8 6-5V6m-6 11-6-5V9"/><circle cx="12" cy="20" r="2"/><circle cx="6" cy="8" r="1"/><path d="M17 4h2v2h-2Z"/>',
        mix:'<path d="M7 4v16M17 4v16M4 9h6m4 6h6"/>',
        speaker:'<path d="M4 9v6h4l5 4V5L8 9H4Zm12 0a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>',
        bars:'<path d="M5 19v-4m5 4V10m5 9V6m5 13V3"/>'
    };
    const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
    const knob = (binding,label,model,size) => `<button type="button" class="ai-dial" ${binding} data-interface-knob="${model}" data-control-width="${size}" data-control-height="${size}" aria-label="${label}"></button>`;
    const key = (binding,label,content,model='interfaceRound',size=18) => `<button type="button" class="ai-key" ${binding} data-button-model="${model}" data-control-width="${size}" data-control-height="${model==='interfacePill'?18:size}" aria-label="${label}" title="${label}">${content}</button>`;
    const jack = (node,signal,label,type='p10') => `<div class="ai-socket"><div class="port" data-type="${type}" data-io="out" data-node="${node}" data-signal="${signal}" title="${label}"></div></div>`;
    const input = (label,kind='combo') => `<div class="ai-input-socket" title="${label} · entrada física selecionada na captura"><span class="ai-${kind}" aria-hidden="true"><i></i></span><small>${label}</small></div>`;
    const capture = () => key('data-source-play aria-pressed="false"','Conectar entrada de áudio do computador',icon('usb'),'interfaceRound',16);
    const phantom = () => '<span class="ai-phantom-badge" title="48 V é controlado na interface física">48V</span>';
    const rail = (inputs,outputs) => `<div class="ai-io-rail"><div class="ai-rail-inputs">${inputs}</div><div class="ai-rail-outputs"><small>LINE OUT</small>${outputs}</div></div>`;
    const pair = () => `<span class="ai-lr">L</span>${jack('outL','line','Saída de linha esquerda · P10')}<span class="ai-lr">R</span>${jack('outR','line','Saída de linha direita · P10')}`;
    const solo = () => `<section class="audio-interface-face ai-panel ai-solo">
        <div class="ai-solo-gain ai-solo-gain1"><label>1</label>${knob('data-ai-gain="L"','Ganho da entrada 1','scarlettGain',38)}</div>
        <div class="ai-solo-gain ai-solo-gain2"><label>2</label>${knob('data-ai-gain="R"','Ganho da entrada 2','scarlettGain',38)}</div>
        <div class="ai-front-inst">${input('INST 2','jack')}</div>
        <div class="ai-solo-keys"><div><label>Inst</label>${key('data-ai-inst aria-pressed="false"','Entrada de instrumento','')}</div><div><label>48V</label>${phantom()}</div><div><label>Air</label>${key('data-ai-air aria-pressed="false"','Realce de presença Air','')}</div></div>
        <div class="ai-solo-separator"></div><div class="ai-solo-output"><label>Output</label>${knob('data-ai-output','Volume de saída','scarlettOutput',74)}</div>
        <div class="ai-solo-direct"><label>Direct</label>${key('data-ai-direct aria-pressed="true"','Monitoramento direto','')}</div>
        <div class="ai-solo-usb">${capture()}</div>
        <div class="ai-solo-phones">${knob('data-ai-phones','Volume de fones','scarlettGain',29)}${icon('phones')}${jack('outPhone','headphone','Saída de fones · P10')}</div>
        <div class="ai-solo-brand">Scarlett <strong>Solo</strong></div>
        ${rail(input('MIC 1'),pair())}
    </section>`;
    const evo = () => `<section class="audio-interface-face ai-panel ai-evo">
        <div class="ai-evo-brand">evo <b>4</b></div><div class="ai-evo-usb">${capture()}</div>
        <div class="ai-evo-select">${phantom()}${key('data-evo-mode="L" aria-pressed="true"','Selecionar entrada 1','1','interfaceRound',21)}${key('data-evo-mode="R" aria-pressed="false"','Selecionar entrada 2','2','interfaceRound',21)}</div>
        <div class="ai-evo-smart">${key('data-evo-smart','Smartgain · ajuste automático de ganho',icon('mic'),'interfacePill',53)}</div>
        <div class="ai-evo-encoder">${knob('data-evo-dial','Ganho da entrada 1','evoEncoder',86)}<small data-evo-label>GAIN 1</small></div>
        <div class="ai-evo-modes">${key('data-evo-mode="monitor" aria-pressed="false"','Selecionar volume dos monitores',icon('mix'),'interfaceRound',21)}${key('data-evo-mode="phones" aria-pressed="false"','Selecionar volume dos fones',icon('phones'),'interfaceRound',21)}</div>
        ${rail(input('INPUT 1')+input('INPUT 2'),pair()+jack('outPhone','headphone','Saída de fones · P10'))}
    </section>`;
    const quantum = () => `<section class="audio-interface-face ai-panel ai-quantum">
        <div class="ai-fender-brand">Fender<sup>®</sup></div><div class="ai-quantum-input">${input('♩ 1','jack')}</div>
        <div class="ai-quantum-gain"><label>2</label>${knob('data-ai-gain="R"','Ganho da entrada 2','quantumGain',38)}<span class="ai-clip-led"><i></i> Clip</span></div>
        <div class="ai-quantum-48">${phantom()}</div><div class="ai-quantum-main"><label>Main</label>${knob('data-quantum-main','Volume principal','quantumMain',84)}</div>
        <div class="ai-quantum-usb">${capture()}<i class="ai-usb-light"></i></div><div class="ai-quantum-direct"><label>Direct</label>${key('data-quantum-direct aria-pressed="false"','Monitoramento direto nos fones',icon('speaker'),'interfaceRound',32)}</div>
        <div class="ai-quantum-phones">${knob('data-quantum-phones','Volume de fones','quantumGain',36)}${icon('phones')}${jack('outPhone','headphone','Saída de fones · P10')}</div>
        <div class="ai-quantum-brand">QUANTUM <b>LT 2</b></div>${rail(input('MIC 2'),pair())}
    </section>`;
    const volt = () => `<section class="audio-interface-face ai-panel ai-volt"><div class="ai-volt-top"><span class="ai-volt-logo">UA</span><strong>VOLT <b>476P</b></strong><small>UNIVERSAL AUDIO</small><div class="ai-volt-connect">${capture()}</div></div>
        <div class="ai-volt-channels">${[0,1,2,3].map(i=>`<div class="ai-volt-channel"><label>${i+1}</label>${knob(`data-volt-gain="${i}"`,`Ganho da entrada ${i+1}`,'voltGain',30)}<div class="ai-volt-leds"><i></i><i></i><i></i></div><div class="ai-volt-channel-keys">${key(`data-volt-vintage="${i}" aria-pressed="false"`,`Pré Vintage · entrada ${i+1}`,'VINTAGE','interfaceVolt',34)}${key(`data-volt-compressor="${i}"`,`Compressor 76 · entrada ${i+1}`,'76','interfaceVolt',24)}</div>${input(`MIC / LINE ${i+1}`)}</div>`).join('')}</div>
        <div class="ai-volt-monitor"><label>MONITOR</label>${knob('data-volt-main','Volume dos monitores','voltMonitor',54)}<div class="ai-volt-monitor-keys">${key('data-volt-source','Selecionar canais monitorados','IN 1/2','interfaceVolt',39)}${key('data-volt-mono aria-pressed="false"','Monitoramento mono','MONO','interfaceVolt',36)}</div>${phantom()}</div>
        <div class="ai-volt-phones">${[0,1].map(i=>`<div><label>${icon('phones')}${i+1}</label>${knob(`data-volt-phone="${i}"`,`Volume de fones ${i+1}`,'voltGain',25)}${jack(`outPhone${i+1}`,'headphone',`Saída de fones ${i+1} · P10`)}</div>`).join('')}</div>
        <div class="ai-volt-outputs"><small>MONITOR OUT</small>${pair()}</div>
    </section>`;
    const models = Object.freeze({
        audioInterface:{width:420,height:156,skin:'solo',render:solo},
        audioInterfaceEvo:{width:300,height:182,skin:'evo',render:evo},
        audioInterfaceQuantum:{width:420,height:177,skin:'quantum',render:quantum},
        audioInterfaceVolt:{width:510,height:184,skin:'volt',render:volt}
    });
    return Object.freeze({models,markup(type,name){return `<div class="device-header"><span>${name}</span></div>${models[type].render()}`;}});
})();
