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
