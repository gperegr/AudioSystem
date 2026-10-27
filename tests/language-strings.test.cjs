const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const source=readFileSync(require('node:path').join(__dirname,'../src/i18n/languages.js'),'utf8');

function objectBlock(start,end){
    const from=source.indexOf(start),to=source.indexOf(end,from);
    assert.ok(from>=0&&to>from,`translation object ${start} exists`);
    const literal=source.slice(from+start.length,to).trim().replace(/\)\s*;?\s*$/,'');
    return vm.runInNewContext('('+literal+')');
}
const translations=objectBlock('const translations = Object.freeze(','\n    const viewTranslations');
const viewTranslations=objectBlock('const viewTranslations = Object.freeze(','\n    const allTranslations');
const context={allTranslations:{...translations,...viewTranslations},localStorage:{getItem:()=> 'en'},Map,WeakMap,Set,Object};
const translateStart=source.indexOf('    const normalized =');
const translateEnd=source.indexOf('    function updateText(',translateStart);
assert.ok(translateStart>=0&&translateEnd>translateStart);
vm.runInNewContext(source.slice(translateStart,translateEnd)+'\nthis.translate=translate;',context);

test('the preamp inspector labels in the reported screen are translated',()=>{
    const expected={
        'Comportamento sonoro':'Sound profile','Graves':'Bass','Enxutos':'Lean','Encorpados':'Full-bodied','Neutros':'Neutral',
        'Agudos':'Treble','Suaves':'Smooth','Brilhantes':'Bright','Saturação':'Saturation','Sutil':'Subtle','Marcante':'Pronounced',
        'Harmônicos pares':'Even harmonics','Discretos':'Subtle','Presentes':'Prominent',
        'Perfil base · escala relativa da simulação':'Base profile · relative simulation scale',
        'Fonte selecionada':'Selected source','Linha 1':'Line 1','Linha 2':'Line 2','Linha 3':'Line 3','Linha 4':'Line 4',
        'Silenciar':'Mute','Mono':'Mono','Inverter polaridade':'Invert polarity','Ganho de saída':'Output gain',
        'Sinais de entrada e saída':'Input and output signals','Saída do pré':'Preamp output'
    };
    for(const [portuguese,english]of Object.entries(expected))assert.equal(context.translate(portuguese),english,portuguese);
});

test('dynamic port descriptions and amplifier accessibility labels translate their fragments',()=>{
    assert.equal(context.translate('Entrada: Linha 1, RCA · L/R. Áudio entre fontes, pré-amplificadores, processadores e caixas ativas. Não alimenta uma caixa passiva.'),'Input: Line 1, RCA · L/R. Line-level audio between sources, preamps, processors, and active speakers. It cannot drive a passive speaker.');
    assert.equal(context.translate('Graves: posição 4 de 7, de Enxutos a Encorpados. Centro neutro.'),'Bass: position 4 of 7, from Lean to Full-bodied. Neutral center.');
});

test('multi-paragraph connection confirmations translate every paragraph and preserve spacing',()=>{
    const source='Canais cruzados: a saída L alimentará a entrada R. As cores RCA indicam canal, mas não impedem o encaixe.\n\nDeseja conectar mesmo assim?';
    const expected='Channels are crossed: output L will feed input R. RCA colors identify channels but do not prevent mismatched connections.\n\nConnect anyway?';
    assert.equal(context.translate(source),expected);
});

test('furniture material labels and select options translate',()=>{
    const expected={'Material':'Material','Metal':'Metal','Preto':'Black','Madeira clara':'Light wood','Madeira escura':'Dark wood'};
    for(const [portuguese,english]of Object.entries(expected))assert.equal(context.translate(portuguese),english,portuguese);
});

test('speaker signature and model specification labels translate',()=>{
    const expected={
        'Assinatura sonora':'Sound signature','Neutro':'Neutral',
        'Sinais de entrada e saída':'Input and output signals','Características do modelo':'Model specifications',
        'Impedância nominal':'Nominal impedance','Amplificação recomendada':'Recommended amplifier power',
        'Escuta desta saída':'Output monitoring'
    };
    for(const [portuguese,english]of Object.entries(expected))assert.equal(context.translate(portuguese),english,portuguese);
});

test('reported tape deck, amplifier and audio interface labels translate',()=>{
    const expected={
        'Ruído de fita':'Tape hiss','Oscilação da fita':'Tape wow and flutter',
        'Oscilação baixa':'Low wow and flutter','Oscilação média':'Medium wow and flutter','Oscilação alta':'High wow and flutter',
        'INICIAR / PARAR':'START / STOP','Potência por canal':'Power per channel',
        'Carga mínima simulada':'Simulated minimum load','Potência por carga':'Power by load',
        'Entrada do computador':'Computer input','AUTORIZAR / BUSCAR ENTRADAS':'ALLOW / FIND INPUTS',
        'Dispositivo de captura':'Capture device','Entrada padrão do sistema':'System default input',
        'INICIAR CAPTURA':'START CAPTURE','PARAR CAPTURA':'STOP CAPTURE','Ganho L':'Gain L','Ganho R':'Gain R',
        'Volume de fones':'Headphone volume','Volume de fones 1':'Headphone volume 1','Volume de fones 2':'Headphone volume 2',
        'BT AUDIO IN · SEM FIO':'BT AUDIO IN · WIRELESS','SEM FIO · HEADPHONES':'WIRELESS · HEADPHONES'
    };
    for(const [portuguese,english]of Object.entries(expected))assert.equal(context.translate(portuguese),english,portuguese);
    assert.equal(context.translate('Escolha um dispositivo de áudio e permita o acesso no navegador.'),'Choose an audio device and allow browser access.');
    assert.equal(context.translate('A captura é encaminhada sem efeitos para as saídas conectadas. Esta interface não tem ganho de entrada; o volume compartilhado oferece até +12 dB.'),'Capture is routed without effects to connected outputs. This interface has no input gain; shared volume provides up to +12 dB.');
    assert.equal(context.translate('A captura é encaminhada sem efeitos para as saídas conectadas. Os ganhos L/R e volumes de saída oferecem até +12 dB para compensar entradas baixas.'),'Capture is routed without effects to connected outputs. L/R gain and output volume provide up to +12 dB to compensate for low input levels.');
});

test('the linear turntable inspector and its changing states are translated',()=>{
    const expected={
        'Energia':'Power','LIGAR / DESLIGAR':'Power on / off','Disco sobre o prato':'Record on the platter',
        'Tamanho do disco':'Record size','INICIAR':'START','PARAR / RETORNAR':'STOP / RETURN',
        'ELEVAR / BAIXAR AGULHA':'RAISE / LOWER TONEARM','Ajuste fino · 33⅓ rpm':'Fine adjustment · 33⅓ rpm',
        'Ajuste fino · 45 rpm':'Fine adjustment · 45 rpm','Ruído do vinil':'Vinyl noise',
        'Nível de ruído do vinil':'Vinyl noise level','Música própria':'Your music','Saída':'Output',
        'Em repouso':'Idle','Desligado':'Off','Detectando o disco':'Detecting record size',
        'Descendo a agulha':'Lowering tonearm','Em reprodução':'Playing','Agulha elevada':'Tonearm raised',
        'Retornando ao repouso':'Returning to rest','Ruído baixo':'Low noise','Ruído médio':'Medium noise',
        'Ruído alto':'High noise','Sem ruído':'No noise',
        'LP · 30 cm. Clique novamente para retirar o disco':'LP · 30 cm. Click again to remove the record',
        'Single · 17 cm. Clique novamente para retirar o disco':'Single · 17 cm. Click again to remove the record',
        'LP · 30 cm · clique novamente para retirar':'LP · 30 cm · click again to remove',
        'Single · 17 cm · clique novamente para retirar':'Single · 17 cm · click again to remove',
        'O carro move os dois braços em linha reta. O sensor detecta o diâmetro escolhido e só baixa a agulha quando há disco.':'The carriage moves both tonearms in a straight line. The sensor detects the selected record size and lowers the tonearm only when a record is present.'
    };
    for(const [portuguese,english]of Object.entries(expected))assert.equal(context.translate(portuguese),english,portuguese);
    assert.equal(context.translate('Mantenha as setas do aparelho pressionadas para mover o carro com a agulha elevada. Shift acelera o movimento. Use ELEVAR / BAIXAR para retomar a escuta. Ao fim do lado, o braço retorna e o motor para.'),'Hold the turntable arrows to move the carriage while the tonearm is raised. Shift speeds up movement. Use RAISE / LOWER to resume playback. At the end of the record side, the tonearm returns and the motor stops.');
});
