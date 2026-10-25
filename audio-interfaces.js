/* Audio interfaces expose only capture, level controls, and usable outputs. */
const AudioInterfaceDesign = (() => {
    const icons = {
        phones:'<path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12h4v8H6a2 2 0 0 1-2-2Zm16 0h-4v8h2a2 2 0 0 0 2-2Z"/>',
        usb:'<path d="M12 3v15m-3-12 3-3 3 3m-3 8 6-5V6m-6 11-6-5V9"/><circle cx="12" cy="20" r="2"/><circle cx="6" cy="8" r="1"/><path d="M17 4h2v2h-2Z"/>'
    };
    const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
    const knob = (binding,label,model,size) => `<button type="button" class="ai-dial" ${binding} data-interface-knob="${model}" data-control-width="${size}" data-control-height="${size}" aria-label="${label}" title="${label}"></button>`;
    const key = (binding,label,content,model='interfaceRound',size=18) => `<button type="button" class="ai-key" ${binding} data-button-model="${model}" data-control-width="${size}" data-control-height="${size}" aria-label="${label}" title="${label}">${content}</button>`;
    const jack = (node,signal,label,type='p10') => `<div class="ai-socket"><div class="port" data-type="${type}" data-io="out" data-node="${node}" data-signal="${signal}" title="${label}"></div></div>`;
    const decorativeJack = (label,type='p10') => `<span class="ai-socket ai-socket-visual" aria-hidden="true" title="${label}" data-visual-socket="${type}"></span>`;
    const capture = () => key('data-source-play aria-pressed="false"','Iniciar ou parar captura do computador',icon('usb'),'interfaceRound',18);
    const pair = () => `<span class="ai-lr">L</span>${jack('outL','line','Saída de linha esquerda · RCA','rca-l')}<span class="ai-lr">R</span>${jack('outR','line','Saída de linha direita · RCA','rca-r')}`;
    const captureOne = () => `<section class="audio-interface-face ai-panel ai-interface-one">
        <div class="ai-interface-one-gain ai-interface-one-gain1"><label>INPUT L</label>${knob('data-ai-gain="L"','Nível da entrada esquerda','inputDialSmall',38)}${decorativeJack('Entrada de áudio esquerda · visual')}</div>
        <div class="ai-interface-one-gain ai-interface-one-gain2"><label>INPUT R</label>${knob('data-ai-gain="R"','Nível da entrada direita','inputDialSmall',38)}${decorativeJack('Entrada de áudio direita · visual')}</div>
        <div class="ai-interface-one-separator"></div><div class="ai-interface-one-output"><label>LINE</label>${knob('data-ai-line','Volume de linha','outputDialLarge',54)}</div>
        <div class="ai-interface-one-usb">${capture()}</div><div class="ai-interface-one-phones">${knob('data-ai-phones','Volume de fones','inputDialSmall',29)}${icon('phones')}${jack('outPhone','headphone','Saída de fones · P10')}</div>
        <div class="ai-interface-one-marking">STEREO CAPTURE</div><div class="ai-interface-one-outputs">${pair()}</div>
    </section>`;
    const captureTwo = () => `<section class="audio-interface-face ai-panel ai-interface-two">
        <div class="ai-interface-two-marking">USB AUDIO</div><div class="ai-interface-two-usb">${capture()}</div>
        <div class="ai-interface-two-encoder">${knob('data-ai-line','Volume de saída','encoderDial',86)}<small>OUTPUT</small></div>
        <div class="ai-interface-two-phones">${icon('phones')}${jack('outPhone','headphone','Saída de fones · P10')}</div>
        <div class="ai-interface-two-outputs">${pair()}</div>
    </section>`;
    const captureThree = () => `<section class="audio-interface-face ai-panel ai-interface-three">
        <div class="ai-interface-three-gain ai-interface-three-gain1"><label>L</label>${knob('data-ai-gain="L"','Nível da entrada esquerda','inputDial',38)}${decorativeJack('Entrada de áudio esquerda · visual')}</div>
        <div class="ai-interface-three-gain ai-interface-three-gain2"><label>R</label>${knob('data-ai-gain="R"','Nível da entrada direita','inputDial',38)}${decorativeJack('Entrada de áudio direita · visual')}</div>
        <div class="ai-interface-three-main"><label>Main · LINE</label>${knob('data-ai-line','Volume de linha','outputDial',70)}</div>
        <div class="ai-interface-three-usb">${capture()}<i class="ai-usb-light"></i></div>
        <div class="ai-interface-three-phones">${knob('data-ai-phones','Volume de fones','inputDial',32)}${icon('phones')}${jack('outPhone','headphone','Saída de fones · P10')}</div>
        <div class="ai-interface-three-marking">STEREO I/O</div><div class="ai-interface-three-outputs">${pair()}</div>
    </section>`;
    const captureFour = () => `<section class="audio-interface-face ai-panel ai-interface-four"><div class="ai-interface-four-top"><span class="ai-interface-four-logo">USB</span><strong>CAPTURE</strong><small>STEREO OUTPUT</small><div class="ai-interface-four-connect">${capture()}</div></div>
        <div class="ai-interface-four-channels">${['L','R'].map((ch,i)=>`<div class="ai-interface-four-channel"><label>INPUT ${i+1}</label>${knob(`data-ai-gain="${ch}"`,`Nível da entrada ${i===0?'esquerda':'direita'}`,'inputDialCompact',34)}${decorativeJack(`Entrada ${i+1} · visual`)}</div>`).join('')}</div>
        <div class="ai-interface-four-monitor"><label>LINE OUT</label>${knob('data-ai-line','Volume de linha','monitorDial',54)}<div class="ai-interface-four-outputs">${pair()}</div></div>
        <div class="ai-interface-four-phones">${[0,1].map(i=>`<div><label>${icon('phones')} ${i+1}</label>${knob(`data-ai-phones="${i}"`,`Volume de fones ${i+1}`,'inputDialCompact',28)}${jack(`outPhone${i+1}`,'headphone',`Saída de fones ${i+1} · P10`)}</div>`).join('')}</div>
    </section>`;
    const models = Object.freeze({
        audioInterface1:{width:420,height:156,chassisHeight:'low',chassisWidth:'compact',skin:'red',role:'capture-one',render:captureOne},
        audioInterface2:{width:300,height:182,chassisHeight:'medium',chassisWidth:'compact',skin:'gray',role:'capture-two',render:captureTwo},
        audioInterface3:{width:420,height:177,chassisHeight:'medium',chassisWidth:'compact',skin:'graphite',role:'capture-three',render:captureThree},
        audioInterface4:{width:510,height:184,chassisHeight:'medium',chassisWidth:'full',skin:'wood',role:'capture-four',render:captureFour}
    });
    return Object.freeze({models,markup(type,name){return `<div class="device-header"><span>${name}</span></div>${models[type].render()}`;}});
})();
