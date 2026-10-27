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
