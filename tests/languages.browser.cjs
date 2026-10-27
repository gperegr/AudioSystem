// Optional browser integration: serve the repository on localhost:8765, then run this file.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
    const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    try{
        const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        await page.goto(process.env.TEST_BASE_URL||'http://127.0.0.1:8765/');
        assert.equal(await page.evaluate(()=>AudioSystemLanguage.translate('Power')),'Power');
        await page.locator('#headphone-calibration-skip').click();
        await page.getByRole('button',{name:'Agora não',exact:true}).click();
        await page.locator('.app-settings').evaluate(element=>{element.open=true;});
        await page.locator('.language-setting .app-select-trigger').click({force:true});
        await page.locator('.app-select-option').filter({hasText:'English'}).click({force:true});
        await page.waitForFunction(()=>document.documentElement.lang==='en');
        assert.equal(await page.locator('#equipment-search').getAttribute('placeholder'),'Name, function, connector, or signal…');
        assert.equal(await page.locator('.mobile-category-nav [data-category-target="Fontes de áudio"]').textContent(),'Sources');
        assert.equal(await page.locator('#canvas-theme option[value="light"]').textContent(),'Light');
        assert.equal(await page.locator('#canvas-backdrop option[value="listeningIllustrated"]').textContent(),'Listening room');
        assert.equal(await page.locator('#room-preset option[value="small"]').textContent(),'Small room');
        assert.equal(await page.evaluate(()=>AudioSystemLanguage.sourceText('Sources & Connections')),'Fontes & Conexões');
        assert.equal(await page.locator('#app-language').inputValue(),'en');
        assert.deepEqual(await page.evaluate(()=>[
            AudioSystemLanguage.translate('Pré · Precisão'),
            AudioSystemLanguage.translate('Caixa de Piso · Cones Naturais'),
            AudioSystemLanguage.translate('Conversor Amplificado → Linha'),
            AudioSystemLanguage.translate('Adaptador P2 → P10'),
            AudioSystemLanguage.translate('Potência · Valvulado'),
            AudioSystemLanguage.translate('Reprodução exige Spotify Premium.'),
            AudioSystemLanguage.translate('Carregando álbuns… 20 de 50'),
            AudioSystemLanguage.translate('Output · L: a carga resultará em 2.0 Ω, abaixo do mínimo de 4.0 Ω. A proteção silenciará este canal; não é uma combinação válida para uso.'),
            AudioSystemLanguage.translate('Uma saída SPEAKER fornece sinal de potência. Esta entrada recebe sinal phono (cápsula MM). Aplicar essa potência pode danificar seu estágio de entrada. Adaptadores de conector não reduzem a tensão; use um conversor de nível alto para linha.'),
            AudioSystemLanguage.translate('O Safari recusou a captura porque a página não está pronta (InvalidStateError). Abra o endereço do programa diretamente em uma aba ativa do Safari, recarregue e tente novamente. Se persistir, feche outras abas deste programa.'),
            AudioSystemLanguage.translate('Sons de interação'),
            AudioSystemLanguage.translate('O áudio do Spotify não pode ser processado pelos equipamentos. Equalizadores e outros efeitos não são aplicados; a cadeia controla apenas audibilidade e volume.'),
            AudioSystemLanguage.translate('Selecione o gerador e use Play. Ajuste uma faixa do equalizador e compare o som.'),
            AudioSystemLanguage.translate('Conecte caixas ou fones'),
            AudioSystemLanguage.translate('12 faixas'),
            AudioSystemLanguage.translate('Artist · 12 faixas'),
            AudioSystemLanguage.translate('Pratique no seu projeto: conexões, Spotify, entrada externa e MP3.')
        ]),[
            'Precision preamp',
            'Natural-fiber cone floorstanding speaker',
            'Speaker-level-to-line-level converter',
            '3.5 mm-to-6.35 mm adapter',
            'Tube power amplifier',
            'Spotify Premium is required for playback.',
            'Loading albums… 20 of 50',
            'Output · L: load will be 2.0 Ω, below the 4.0 Ω minimum. Protection will mute this channel; this is not a valid operating condition.',
            'A SPEAKER output carries amplified power. This input accepts phono signal (MM cartridge). Applying speaker-level power may damage its input stage. Plug adapters do not reduce voltage; use a speaker-level-to-line-level converter.',
            'Safari could not start capture because the page is not ready (InvalidStateError). Open the app directly in an active Safari tab, reload, and try again. If the problem persists, close other tabs running this app.',
            'Interface sounds',
            'Spotify audio cannot be processed by the equipment. Equalizers and other effects do not apply; the signal chain only controls whether you can hear it and at what volume.',
            'Select the signal generator and press Play. Adjust an equalizer band and compare the sound.',
            'Connect speakers or headphones',
            '12 tracks',
            'Artist · 12 tracks',
            'Practice in your project: connections, Spotify, external input, and MP3.'
        ]);

        await page.locator('.app-settings').evaluate(element=>{element.open=false;});
        await page.locator('#equipment-search').fill('Precision preamp');
        const precisionCard=page.locator('.catalog-item[data-template="prePrecision"]');
        await precisionCard.dragTo('#canvas');
        await page.waitForFunction(()=>document.querySelector('.sonic-profile-title')?.textContent==='Sound profile');
        assert.deepEqual(await page.locator('.sonic-trait-label').allTextContents(),['Bass','Treble','Saturation','Even harmonics']);
        assert.deepEqual(await page.locator('.sonic-trait-extremes').allTextContents(),['LeanNeutralFull-bodied','SmoothNeutralBright','SubtlePronounced','SubtleProminent']);
        assert.equal(await page.locator('.sonic-profile-note').textContent(),'Base profile · relative simulation scale');
        assert.equal(await page.locator('.precision-inspector-options button').nth(0).textContent(),'Mute');
        assert.equal(await page.locator('.precision-inspector-options button').nth(2).textContent(),'Invert polarity');
        assert.equal(await page.locator('.precision-inspector-options label').first().innerText().then(text=>text.trim().startsWith('Output gain')),true);
        assert.equal(await page.locator('.port-signal-panel h3').textContent(),'Input and output signals');
        const portRows=(await page.locator('.port-signal-row').allTextContents()).join(' ');
        assert.match(portRows,/Line 1/);assert.match(portRows,/Preamp output/);assert.doesNotMatch(portRows,/line0|line1|Saída do pré|Linha 1/);

        await page.evaluate(()=>{const node=document.createElement('button');node.title='Ligar / Desligar';node.textContent='Ligar / Desligar';node.id='locale-dynamic-probe';document.body.append(node);});
        await page.waitForFunction(()=>document.getElementById('locale-dynamic-probe')?.textContent==='Power on / off');
        assert.equal(await page.locator('#locale-dynamic-probe').getAttribute('title'),'Power on / off');
        await page.reload();
        await page.waitForFunction(()=>document.documentElement.lang==='en');
        assert.equal(await page.locator('#equipment-search').getAttribute('placeholder'),'Name, function, connector, or signal…');
        await page.evaluate(()=>AudioSystemLanguage.set('pt'));
        assert.equal(await page.locator('#app-language').inputValue(),'pt');
        assert.equal(await page.evaluate(()=>document.documentElement.lang),'pt-BR');
        assert.deepEqual(errors,[]);
        console.log('Browser: language selector, PT/EN toggle, translated labels, dynamic content, attributes, and category lookup passed.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
