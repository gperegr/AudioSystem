# Componentes compartilhados

A biblioteca `Hardware`, no início de `script.js`, concentra as definições de controles. Os equipamentos fornecem os parâmetros e os setters do áudio. `Hardware.mount(dev)` aplica os modelos ao terminar a construção de cada aparelho.

## Knobs

| Modelo | Diâmetro | Construção e uso principal |
| --- | --- | --- |
| rubber | 22 px | Borracha moldada com grip recortado; volume de caixas compactas, monitor de precisão e subs |
| faceted | 28 px | Face metálica facetada em moldura quadrada; canais do amp de fones, potência tradicional, entrada dos prés modernos e nível do EQ moderno |
| recessed | 36 px | Cilindro dentro de um poço circular; amplificador de fones moderno, controles de prés e nível do gerador moderno |
| touchDisc | 52 px | Disco fino, liso e quase rente à frente; volume do integrado minimalista, pré de tela central e receiver moderno |
| machined | 36 px | Alumínio usinado com face radial e índice preto; tonalidade clássica, ganho da potência de visor circular e nível do gerador vintage com escala gravada |
| skirted | 52 px | Saia cromada larga com miolo preto elevado; volume dos integrados e prés de frente metálica/clássica |
| bakelite | 36 px | Baquelite marrom com recortes profundos e traço marfim; tape deck, potência e equalizador vintage |
| ivory | 36 px | Marfim moldado, parafuso central de latão e triângulo vermelho; caixa ativa vintage e amplificador de fones vintage |
| pointer | 44 px | Ponteiro saliente de instrumento com pegador largo; disponível na biblioteca |
| flywheel | 52 px | Volante com borda serrilhada, anéis metálicos e concavidade central; sintonia FM |

O mesmo modelo compartilha face e movimento, com dimensões padrão que podem ser sobrescritas por equipamento ou instância. A face gira dentro do aro; posição e rótulo pertencem ao layout do equipamento. Os indicadores usam as variáveis de ângulo atualizadas pelos setters existentes.

```js
Hardware.bindKnob(element, {
    model: 'recessed',
    get: () => dev.state.volume,
    set: dev.setSpeakerVolume,
    min: 0,
    max: 1
});
```

O modelo pode ser declarado explicitamente ou escolhido pela função central `knobModel`. A física compartilhada oferece arraste com mouse/touch, compensação do zoom, captura de ponteiro, teclado, Home/End, PageUp/PageDown e limpeza ao cancelar, perder foco ou excluir o aparelho. Há dez intervalos magnéticos por padrão; seleção de entrada e sintonia FM especificam passos próprios. A interação não modifica os parâmetros apenas por abrir o painel.

## Demais componentes

- `Hardware.buttons`: teclas, transporte, toggles, interruptores verticais/horizontais, versões compactas e botões de menu. As ações continuam sendo específicas do equipamento; tamanho e resposta visual pertencem ao modelo.
- `Hardware.sliders`: trilhos e cursores horizontais, verticais e de busca. Os faders usam dez intervalos; a busca de músicas permanece contínua. O pitch mecânico usa `Hardware.bindLinear`, compartilhando interação e cancelamento com os knobs.
- `Hardware.leds` e `Hardware.setLed`: dimensões, cores, estado aceso/apagado e indicação de saturação. Os instrumentos continuam determinando quando há sinal.
- `Hardware.plugs` e `Hardware.plugMarkup`: desenho dos plugues e espessuras de P2, P10, RCA e fio de caixa em um único registro.
- `Hardware.inspector`: superfície, botões, sliders e medidas de controles dos menus, mantendo os parâmetros particulares de cada equipamento.

Os estilos compartilhados ficam na seção final de `style.css`. A duração de movimento é definida por `Hardware.physics`. A preferência de movimento reduzido desativa as transições dos controles.

## Chassis

`Hardware.sizes` define três alturas: baixo **120 px**, médio **180 px** e alto **240 px**. As larguras são compacta **380 px** e completa **760 px**.

`Hardware.layout` escolhe o formato antes de medir a colocação no canvas. Processadores, seletores e amplificadores compactos usam o formato baixo; integrados, prés completos, receivers, instrumentos e potências maiores usam o médio; a potência com válvulas expostas e o Streamer Integrado usam o alto. No streamer, os 240 px incluem o botão superior, o gabinete, os conectores e os pés; a largura própria de 520 px é preservada. Interfaces e amplificadores de fones compactos usam a largura compacta.

Fontes musicais, caixas, subwoofers, fones e móveis preservam as proporções próprias. Visores, gráficos, gauges e processamento de áudio continuam específicos dos equipamentos. O formato é reconstruído pelo tipo do aparelho ao abrir um projeto; não exige migração do arquivo salvo.

A grade usa `Hardware.sizes.grid` (20 px). As três alturas são múltiplas desse passo: 120, 180 e 240 px. Somados os pezinhos de 20 px, o empilhamento também mantém o alinhamento.

## Variações decorativas opcionais

`Hardware.accents` acrescenta escalas gravadas ou arcos de LEDs aos modelos de knob existentes. A escolha é centralizada em `accentModel`, por equipamento e função do controle; não é aplicada indiscriminadamente.

- Arco luminoso: volume do Pré · Tela Central, Integrado Minimalista e amplificador de fones moderno. Os pontos seguem o ajuste real de volume e apagam ao desligar.
- Escala gravada: controles de volume selecionados em frentes clássicas e metálicas. Sem iluminação.
- Interruptor deslizante metálico: Pré · Controle 2.1 e amplificador de fones moderno. Usa o mesmo estado e a mesma função de energia, com deslocamento animado da peça física.

A seleção de arco luminoso bloqueia explicitamente equipamentos da família vintage. Os detalhes são SVG/CSS, sem imagens externas ou mudanças no processamento de áudio.

A construção de cada modelo é definida por `data-knob-model` e recebe camadas próprias de aro, corpo, miolo, fixação e indicador. Os detalhes luminosos e escalas não substituem essa construção. O material e a silhueta diferenciam os modelos mesmo sem considerar o diâmetro.

## Botões e interruptores: materiais, movimento e som

Os identificadores permanecem os mesmos no equipamento **Modelo · Controles**. Cada construção combina moldura fixa, peça móvel, percurso e perfil sonoro. As inscrições dos botões permanecem fixas.

| Modelo | Construção | Ação no modelo de demonstração |
| --- | --- | --- |
| `vintageSteel` | Tecla elevada de aço escovado, bordas polidas e marca gravada | Com trava |
| `vintageRecessed` | Tecla metálica rebaixada em moldura funda | Com trava |
| `modernSteel` | Tecla de metal acetinado com cantos suaves | Retorno ao soltar |
| `modernGraphite` | Tecla de metal escuro e indicação discreta | Com trava |
| `key` | Tecla compacta moldada com lente central | Retorno ao soltar |
| `transport` | Tecla de transporte com superfície metálica e lente central | Com trava |
| `toggle` | Tecla rebaixada com lente vermelha/verde | Com trava |
| `power`, `powerLarge`, `powerHorizontal`, `powerSmall` | Interruptor com corpo basculante, marcas I/O e eixo horizontal ou vertical | Duas posições estáveis |
| `slidePower` | Trilho rebaixado, cursor metálico estriado e luz embutida | Duas posições estáveis |
| `ui` | Botão moderno de superfície suave | Retorno ao soltar |

`Hardware.buttons` define `action` e `sound`. `action` controla a demonstração; as funções reais dos equipamentos continuam determinando seus próprios estados. `Hardware.buttonSounds` reúne os sons sintetizados de contato, retorno de mola, ressonância metálica e encaixe, com variação pequena por interação. Interruptores têm sons distintos para ON/OFF. O áudio usa o volume global de interação e não entra na cadeia de música.

O controlador visual mantém a pressão até soltar o ponteiro ou a tecla. Cancelamento, perda de foco e remoção do equipamento liberam a peça e removem os listeners temporários. A navegação por teclado mantém o foco visível; movimento reduzido desativa as transições. Não há animação ou áudio contínuo em repouso.

## Regra de composição dos equipamentos

`buttonModel(dev, element)` é o único resolvedor dos botões físicos. `Hardware.mount(dev)` passa todos os controles por `skinButton`; a mesma fábrica desenha os exemplos do Modelo. Um equipamento escolhe o identificador, o texto/ícone e a função, preservando o material, a animação e o som da biblioteca; as dimensões padrão aceitam ajustes explícitos por equipamento ou instância. A largura das teclas de texto acompanha a inscrição; modelos com largura declarada mantêm a medida exata.

Foram incluídas três construções no demonstrador:

- `roundKey`: botão circular de 28 × 28 px, usado no Bluetooth dos fones.
- `selectorKey`: tecla de seleção de 26 × 22 px, usada nos seletores de posições fixas dos geradores.
- `slideSelector`: interruptor de seleção de 112 × 28 px, usado para LINE/PHONO nos toca-discos.

Os botões do Tape Deck e o START/STOP do toca-discos vintage mantêm `vintageSteel`. Os dois aparelhos Bluetooth usam `power`. Reproduzir/pausar do CD Player e do Streamer compartilha `transport`, com a mesma inscrição vetorial fixa. Os botões de tampa e de recolocar grade usam `key`. A própria grade removível é uma superfície de manipulação, identificada por `data-hardware-surface="grille"`, e mantém a geometria da caixa.

As inscrições são definidas na construção. `Hardware.setButtonLabel` aceita apenas elementos ainda não montados; componentes já construídos mantêm o texto e os ícones fixos. Os menus mantêm o modelo `ui`; o desenho do instrumento não é copiado para os botões dos menus.

Os modelos `power*` compartilham uma moldura moldada, cavidade escura, detalhes do eixo e face curva com marcas I/O em SVG, preservando o círculo sem deformação em qualquer orientação. `powerSmall` reduz o rebaixo para manter a face legível; `powerLarge` aumenta a borda interna sem alterar a geometria do componente. O estado e a pressão mudam a inclinação e a sombra da mesma peça.

## Largura e altura ajustáveis no código

As medidas são em pixels do canvas, antes do zoom. O tamanho é aplicado à caixa real do controle e à área de interação.

### Tamanho padrão do modelo

Edite `width` e `height` nos registros `knobs` e `buttons`, no começo de `script.js`. Os knobs agora também declaram as duas medidas, em vez de um único `diameter`. Botões de texto sem `width` continuam acompanhando a inscrição.

### Por equipamento e função

Edite a tabela `controlSizes`, logo após os modelos de botões:

```js
const controlSizes = {
    tapeDeck: {
        '[data-tape-level]': {width:44, height:44},
        '.tape-transport button': {width:40, height:36}
    },
    btReceiverA: {
        '.power-btn': {width:28, height:42}
    }
};
```

As regras do equipamento são aplicadas na ordem da tabela. É possível informar somente a largura ou somente a altura.

### Na construção do controle

```js
Hardware.bindKnob(knob, {
    model:'bakelite',
    width:44, height:44,
    get:()=>dev.state.tapeVolume,
    set:value=>{dev.state.tapeVolume=value;dev.applyTapeSettings();},
    min:0, max:1
});
Hardware.button(button, 'power', {width:28, height:42});
```

Também é possível definir medidas no HTML:

```html
<button class="power-btn" data-control-width="28" data-control-height="42"></button>
```

Ou alterar uma instância já construída:

```js
Hardware.setControlSize(element, {width:48, height:48});
Hardware.setControlSize(element, {width:null, height:null}); // Remove ajustes da API.
```

A prioridade é: padrão do modelo → tabela do equipamento → atributos HTML → opções da construção/API. `null` remove um ajuste da API, recuperando a medida dos níveis anteriores. Valores inválidos são ignorados. Os ajustes feitos na tabela são reconstruídos ao carregar o projeto, sem adicionar controles de tamanho à interface.

## Inscrições fixas

Acionar um botão nunca troca sua inscrição. Reproduzir/pausar mantém o símbolo combinado; energia mantém seus símbolos fixos; o pareamento Bluetooth mantém o símbolo ou BLUETOOTH. Os controles de propriedades também usam títulos fixos. A posição mecânica, iluminação, `aria-pressed`/`aria-checked` e os visores informam o estado. Tooltips e descrições acessíveis podem informar a ação disponível sem alterar a superfície do equipamento.

## Proporções por equipamento

A tabela `controlSizes` contém a revisão dos controles de fontes, receivers, integrados, prés, potências, amplificadores de fones, instrumentos, seletores, Bluetooth, caixas ativas, subwoofers e fones Bluetooth. Os mesmos modelos de componentes são reutilizados com medidas adequadas a cada função. O demonstrador mantém as medidas de referência dos modelos.

- Volume principal e sintonia têm mais destaque; tonalidade, seleção e comandos auxiliares usam medidas menores.
- Botões com inscrições longas usam formatos retangulares, e as inscrições acompanham a altura disponível.
- CD Player e Streamer mantêm controles de transporte idênticos, agora de 52 × 28 px.
- Os controles do Tape Deck mantêm `vintageSteel` e `bakelite`, ajustados ao espaço dos VUs e conexões.
- Os amplificadores de fones preservam seus três gabinetes detalhados e alinham os controles aos respectivos canais.
- As caixas e fones preservam as proporções dos gabinetes/conchas; controles e etiquetas recebem ajustes locais.
- Mixers usam o chassi médio de 180 px para acomodar faders e inscrições; as três alturas e duas larguras continuam sendo as mesmas.

Os layouts dos painéis foram ajustados junto com a tabela: fontes, blocos de tonalidade, comandos abaixo dos visores, saídas e interruptores têm seus próprios espaços. Gabinetes passivos e móveis mantêm suas proporções.

### Sons de movimento

`Hardware.movementSounds` reúne dez timbres de knobs e quatro de sliders. Borracha e disco usam atrito suave; alumínio usinado e seletor facetado usam contatos mais secos; baquelite tem um contato grave; o volante tem atrito baixo. Sliders horizontais, faders verticais, busca e pitch têm perfis próprios.

`Hardware.movementSound(elemento, tipo)` resolve o perfil pela construção compartilhada. O som só é disparado ao mudar efetivamente o valor com mouse, toque ou teclado; montagem, restauração e atualizações programáticas não produzem movimento sonoro. Envelopes curtos e intervalos mínimos por perfil evitam sobreposição excessiva. Todos respeitam o volume global de sons de interação, incluindo zero. Os botões mantêm seus próprios sons de pressionar, soltar e comutar.

### Novas construções de botões

Todas aparecem automaticamente no equipamento Modelo, com o identificador abaixo, e usam o mesmo sistema de dimensões ajustáveis e inscrições fixas.

| Modelo | Construção | Aplicação |
| --- | --- | --- |
| `ivoryPiano` | Marfim, borda inferior chanfrada e movimento articulado | Frequência do gerador vintage |
| `brassPill` | Cápsula metálica com aro de latão | DIRECT do integrado de visores azuis |
| `studioCap` | Capa técnica escura, ranhuras inferiores e trava | Seletores de bancada e Start/Stop do toca-discos moderno |
| `flushMetal` | Alumínio escovado rente ao painel e curso curto | Pré Controle 2.1 e integrado prateado |
| `illuminatedBar` | Capa escura e lente linear integrada | Pré Tela Central, integrado minimalista, gerador moderno e RX/TX Bluetooth |
| `membrane` | Superfície arredondada em elastômero, deformação curta | Modelo disponível na biblioteca |

Cada construção reutiliza o som de contato adequado da biblioteca (metálico, trava, contato grave ou macio). A barra luminosa acompanha `aria-pressed` e apaga com a energia; as inscrições não mudam. Os transportes de CD/streamer e as teclas `vintageSteel` de tape deck/toca-discos vintage permanecem nos modelos já escolhidos.

### Inscrições e contraste

As cores de impressão são centralizadas em `--hw-legend-ink` e `--hw-legend-relief`, por modelo de botão. Metal claro, marfim e latão usam tinta escura; grafite, membrana e teclas escuras usam tinta clara. Nos controles escuros vintage, o branco é aquecido. Textos aninhados e símbolos SVG herdam a mesma tinta. Pressionar, selecionar ou desligar o equipamento não troca nem esmaece a inscrição física; lentes e LEDs mantêm sua própria indicação de estado.

`slideSelectorModern`: variante LINE/PHONO aplicada ao toca-discos moderno e disponível no Modelo. Placa de grafite anodizado, inscrições claras fixas, trilho escuro e cursor de alumínio com três ranhuras. Compartilha dimensões ajustáveis, duas posições, som de contato e interação do `slideSelector`; o toca-discos vintage conserva a variante original.

### Estado de dano

Os componentes visuais respeitam `state.damage`: o equipamento fica desligado e identificado no painel. As regras de ligação, alerta, persistência e corte de áudio estão em [REVISAO-SINAIS.md](REVISAO-SINAIS.md#5-dano-e-sobrecarga).

### Legibilidade dos geradores

Os seletores SINAL/CANAL/VARREDURA usam `vintageSteel` no vintage e `illuminatedBar` no moderno. Frequência usa `ivoryPiano` no vintage e `selectorKey` no moderno; transporte usa `vintageSteel`/`selectorKey`. Teclas de seleção medem 34×24 px (durações: 28×24), frequência 34×26 e transporte 60×28. Inscrições de seleção usam 7,5 px; símbolos de frequência 13 px. A cor definida pelo material tem prioridade sobre a preferência genérica do tema vintage, evitando tinta clara sobre metal claro. Controles indisponíveis continuam legíveis e mantêm as inscrições fixas.

## Lógica de áudio

A referência atual para níveis de sinal, compatibilidade, potência, impedância, dano e limites da simulação é [REVISAO-SINAIS.md](REVISAO-SINAIS.md). As constantes e funções de `script.js` definem os parâmetros; este documento concentra a biblioteca visual e as interações dos controles.
