# Audio System Simulator

Monte um sistema de som virtual, conecte os equipamentos e ouça o resultado diretamente no navegador.

O **Audio System Simulator** é um simulador interativo de áudio para experimentar combinações de aparelhos, entender o percurso do sinal e explorar ajustes de reprodução. O catálogo reúne equipamentos com estilos vintage, de estúdio e modernos: toca-discos, CD players, streamers, receivers, amplificadores, equalizadores, mixers, seletores, caixas, subwoofers, fones e instrumentos de áudio.

## Wiki e guias de uso

Acesse a **[Wiki do programa](https://github.com/gperegr/AudioSystem/wiki)** para consultar guias por categoria de equipamento, exemplos de montagem, conceitos de áudio e solução de problemas.

## Como começar

1. Neste repositório, clique em **Code → Download ZIP**.
2. Extraia o arquivo inteiro, mantendo as pastas e os arquivos juntos.
3. Abra **index.html** em um navegador atualizado, preferencialmente Chrome ou Edge.
4. Mantenha acesso à internet para carregar os estilos e as fontes externas usados pela interface.

Se você recebeu um endereço da aplicação já publicada, basta abri-lo no navegador. Para uma utilização mais confortável, use um computador com mouse e uma tela ampla. Em telas de toque, há controles para abrir os painéis de equipamentos e propriedades.

Em celulares e tablets, **Equipamentos** e **Propriedades** abrem painéis sobre a montagem, com botão de fechar sempre acessível e toque fora para dispensar. O catálogo usa duas colunas; toque no nome para adicionar e enquadrar o aparelho automaticamente, ou arraste pelo ícone. Pressione e segure um equipamento por um instante para movê-lo sem confundir o gesto com a passagem de cabos; **Modo Touch** ativa o arraste imediato. Essa opção aparece em dispositivos de toque. Use dois dedos para mover e ampliar o canvas. Os controles inferiores e as configurações se adaptam à orientação e ao espaço disponível com o teclado aberto. No desktop, os painéis e a interface permanecem como antes.

Comece com o volume do computador baixo e aumente aos poucos. O navegador pode exigir um clique ou toque antes de liberar o som.

## Seu primeiro sistema de som

Uma montagem simples para começar é:

**CD Player → Amplificador Integrado → duas Caixas Passivas Vintage**

1. Encontre os aparelhos no catálogo usando a busca e arraste-os para a área de montagem. Em telas de toque, toque no nome do equipamento para adicioná-lo.
2. Ligue as saídas **RCA L/R** do CD Player a uma das entradas **LINE L/R** do integrado. Arraste de um conector até o conector de destino.
3. Ligue a saída **SPEAKERS L** do integrado à entrada da caixa esquerda e **SPEAKERS R** à entrada da caixa direita.
4. Confira se os aparelhos estão ligados e selecione no integrado a entrada que recebeu o CD Player.
5. Inicie a reprodução na fonte e ajuste o volume do integrado gradualmente.

As fontes musicais oferecem som de demonstração quando não há arquivo próprio carregado. Você também pode selecionar a fonte, abrir **Música própria → CARREGAR ÁUDIO** no painel lateral e escolher uma música do seu dispositivo. A compatibilidade dos formatos depende do navegador.

## Entendendo as conexões

Os nomes dos conectores ajudam a escolher o caminho correto:

| Indicação | Para que serve |
| --- | --- |
| **LINE / RCA / AUX** | Conectar fontes a entradas de linha de amplificadores, processadores ou caixas ativas. |
| **PHONO** | Receber o sinal de um toca-discos em modo Phono. Use uma entrada Phono ou um conversor adequado. |
| **SPEAKERS / SPEAKER IN** | Ligar a saída de potência de um amplificador a caixas passivas. |
| **PHONES** | Conectar fones de ouvido. |
| **SUB / LFE** | Encaminhar sinal de linha para a entrada correspondente de um subwoofer. |
| **L / R** | Identificar os canais esquerdo e direito. Preserve a correspondência entre eles. |

**Caixas ativas** têm amplificação própria e recebem sinal de linha. **Caixas passivas** precisam de uma saída amplificada. O formato do plugue, sozinho, não garante que os sinais sejam compatíveis.

As caixas passivas de três vias, disponíveis em acabamentos preto e laranja, exibem tweeter, dois transdutores de médios e woofer, além de crossover passivo interno. Conecte **SPEAKER OUT** do amplificador à entrada **SPEAKER IN** da caixa por fio.

Os rótulos acessíveis dos conectores identificam direção, conector, canal e sinal em um formato consistente. Observe os avisos apresentados ao conectar equipamentos. O simulador pode alertar ou bloquear ligações inadequadas e representar sobrecarga, proteção e danos simulados; a barreira física do plugue continua ativa.

## Operando os aparelhos

- **Selecione um equipamento** para abrir seus ajustes no painel lateral.
- **Arraste os knobs e faders** para ajustar volume, ganho, tonalidade e outros parâmetros. Os knobs de ajuste mantêm dez passos fixos, com rotação suave entre eles e valor numérico durante a interação. Seletores e sintonia preservam seus passos específicos. Os controles compatíveis também respondem ao teclado quando estão em foco.
- **Escolha a entrada correta** em receivers, integrados e seletores. Nos modelos com botões iluminados, a luz identifica a opção selecionada.
- **Experimente os equalizadores** para modificar graves, médios e agudos. Cada fader atua na frequência indicada abaixo dele.
- **Use mixers e seletores** para combinar fontes ou comparar caminhos de áudio.
- **Observe os medidores dos aparelhos** e os indicadores para acompanhar a atividade do sinal.

A busca do catálogo também encontra equipamentos por função, conector ou tipo de sinal, como **entrada óptica** ou **caixa passiva**. Em **Configurações**, você pode desativar os avisos de compatibilidade e a ajuda contextual para experimentar ligações incorretas; essa opção não remove as barreiras físicas entre plugues incompatíveis. Com a ajuda ativa, as dicas de mouseover aparecem após um segundo sobre o item; ao navegar pelo teclado, elas aparecem ao focar o controle.

No cabeçalho de **Propriedades**, **Compacto** reduz espaços e descrições para navegar por aparelhos com muitos controles. O modo escolhido é lembrado.

O botão **Restaurar Configurações** aparece apenas nos modelos com ajustes restauráveis. Alguns ajustes aparecem apenas no painel lateral. Na **Potência · Visor Circular**, por exemplo, os ganhos A/B são ajustados por esse painel.

Os toca-discos de braço articulado são vistos de frente, com o prato e o disco em perfil e o braço visível acima deles. O slider **PITCH**, no painel frontal, ajusta a velocidade de reprodução; arraste para alterar e dê duplo clique para zerar. Use o botão **Abrir tampa / Fechar tampa** para movimentar a tampa de acrílico, que abre para trás a partir das dobradiças traseiras.

O **Toca-discos Tangencial** é visto totalmente de frente, com prato e disco em perfil, carro de leitura linear e os dois braços paralelos vistos pela extremidade. Os comandos ficam na face frontal. No painel lateral, escolha **30 cm · LP**, **17 cm · Single** ou **Sem disco**. **INICIAR** detecta o diâmetro simulado, seleciona **33⅓** ou **45 rpm** e baixa a agulha antes de liberar o áudio; sem disco, retorna ao repouso. As teclas de velocidade permitem alterar a rotação durante a escuta, e os dois ajustes finos frontais guardam correções independentes de até ±3%. **Elevar / baixar agulha** pausa ou retoma a leitura mantendo o prato em movimento. Segure as setas para mover o carro com a agulha elevada; **Shift** acelera o deslocamento. **PARAR**, ou o fim do lado, eleva a agulha, retorna o carro e desliga o motor. A saída oferece **LINE** ou **PHONO**, e a tampa abre para trás. Disco, velocidade, ajustes finos e tampa acompanham o projeto; a reprodução é restaurada em repouso.

Os ponteiros dos medidores respondem com inércia e retorno suave. Os rolos do tape deck giram durante a reprodução, e o prato do toca-discos desacelera gradualmente ao parar. Os movimentos respeitam a preferência de movimento reduzido do sistema ou navegador.

Os aparelhos Bluetooth representam conexões dentro da simulação; não substituem o pareamento Bluetooth do seu computador ou celular.

Em **Fones de Ouvido**, o **Kuba Disco 2** é visto totalmente de frente, no mesmo suporte de madeira dos demais fones, e reproduz o arco clássico de madeira laminada, as regulagens laterais com trilhos que seguem a curvatura do arco e encaixes alinhados ao centro das conchas, as conchas com relevos concêntricos e as almofadas XL costuradas. Selecione o fone para escolher **Tauari**, **Nogueira** ou **Ébano** em **Madeira do arco**; o acabamento acompanha o projeto salvo. Conecte uma saída de fones ao **P2 na ponta do cabo**, abaixo do divisor em Y. A escuta desse modelo não acrescenta coloração tonal e não pretende reproduzir medições acústicas do produto real.

Os fones usam uma vista frontal com conchas em perfil e almofadas voltadas para dentro, mantendo proporções compactas no suporte de madeira. Cada modelo tem construção própria: arco duplo e tecido no **Studio**, madeira e couro marrom no **Clássico Vinyl**, couro com pregas e hastes articuladas no **Monitor**, alumínio e malha no **Max**, aros e almofadas segmentadas no **Aberto · Anelar**, colmeias e suspensão no **Aberto · Cúpula**, grades horizontais e arco acolchoado no **Planar**.

Nos modelos com fio, a conexão fica na ponta do cabo, abaixo do divisor em Y: **P10** no **Over-Ear** e **P2** nos demais. **Over-Ear**, **Studio** e **Max** também permitem parear Bluetooth; o **Max** usa exclusivamente essa conexão sem fio.

O **Streamer Integrado**, em **Amplificadores integrados**, reúne uma fonte interna e amplificação nominal de **40 W por canal / 8 Ω** na simulação. A tela mostra faixa, artista, álbum e capa quadrada de arquivos MP3/FLAC quando esses metadados estão disponíveis, além do progresso, tempo, fonte e volume. Os dados de reprodução PCM correspondem ao áudio decodificado pelo navegador. O menu frontal alterna **Música** e **Linha**, com ícones e legendas centralizados. Em **Linha**, dois espectros coloridos mostram as frequências reais das entradas **L** e **R** de forma independente. Os controles permitem reproduzir, pausar e avançar ou retroceder 10 segundos. O botão de play mantém o triângulo fixo e se ilumina durante a reprodução. O aparelho é visto totalmente de frente; o disco superior iluminado aparece em perfil, com ranhuras e indicador que acompanham a rotação, em uma camada atrás do housing e da face frontal, que encobrem sua parte inferior. O conjunto completo, incluindo botão e pés, respeita a altura alta de 240 px. Ele ajusta o volume em dez passos; o duplo clique silencia. As saídas **SPEAKERS L/R** alimentam caixas passivas, **PRE OUT** tem volume variável e conectar **fones P2** silencia as caixas. A fonte interna usa demonstração ou música própria carregada; a entrada **LINE IN** recebe outra fonte por RCA.

O **Integrado · Essencial** tem acabamento cinza-oliva, controles de plástico e amplificação nominal de **20 W por canal / 8 Ω**. Selecione **AUX**, **TUNER**, **TAPE** ou **PHONO** e use volume, balanço, graves e agudos. **TONE DEFEAT** ignora os ajustes de tonalidade, **LOUDNESS** reforça discretamente os extremos em volumes baixos e **MONO** combina os canais. Os pequenos LEDs indicam a potência simulada entregue às caixas.

O **Pré · Precisão** oferece quatro entradas de linha e **LINE OUT** para uma potência ou caixas ativas. O modulômetro mede as saídas reais em **dBFS**, com agulha preta para L e vermelha para R, ambas com inércia. A chave **GAIN** alterna **0, +6 e +12 dB**; as demais chaves controlam **MUTE**, **MONO** e **PHASE** (inversão de polaridade). Seleção rotativa, volume e balanço também são funcionais. Esses ajustes acompanham o projeto salvo e podem ser restaurados pelo painel lateral.

O **Pré · Vidro Clássico** combina vidro preto, inscrições verdes discretas, laterais de alumínio escovado, knobs prateados canelados e oito alavancas metálicas. O seletor escolhe **AUX**, **TUNER**, **TAPE** ou **PHONO**; PHONO aplica ganho e equalização RIAA. **LINE OUT** tem volume variável e alimenta uma potência ou caixas ativas. Graves, agudos e balanço são funcionais. **MONO** combina os canais, **PHASE** inverte a polaridade e **MUTE** silencia. **LOW FILTER** atenua abaixo de **35 Hz**, **HIGH FILTER** acima de **7 kHz** e **LOUDNESS** reforça graves e agudos em volumes baixos. **TONE DEFEAT** ignora os ajustes de graves/agudos, mantendo filtros e loudness. Seleção, knobs e chaves acompanham o projeto salvo e o comando de restaurar configurações. A coloração suave é uma interpretação sonora da simulação.

## Organizando a montagem

No catálogo, a **Caixa Passiva Moderna** e a **Caixa Passiva Vintage** ficam em **Caixas Passivas · Bookshelf**, junto aos demais modelos dessa categoria.

Arraste os equipamentos pela área de trabalho: eles acompanham o cursor com uma sombra discreta. Em telas de toque, pressione e segure um equipamento por um instante antes de arrastá-lo; isso evita mover aparelhos ao passar fios sobre eles. O zoom pela roda do mouse preserva o ponto sob o cursor. Use **Centralizar** e **Ajustar para exibir tudo** para navegar com transições suaves; um novo gesto interrompe o movimento.

Para selecionar vários aparelhos, use **Shift + clique** ou **Shift + arraste**. **Ctrl/Cmd + A** seleciona todos os equipamentos quando o foco está na área de montagem.

Na categoria **Móveis**, adicione racks, nichos ou a **Mesa de Áudio** e posicione os aparelhos nas prateleiras ou no tampo. **Rack de Áudio** e **Rack com 6 Prateleiras** têm vãos livres de 194 px para equipamentos baixos e médios; **Rack com Vãos Altos** tem quatro vãos de 244 px; **Rack com Vãos Altos · 6 Prateleiras** oferece seis vãos nessa altura para equipamentos médios e altos. Os móveis não atraem os aparelhos magneticamente: você pode manter o espaço desejado para os pezinhos, respeitando a grade de posicionamento. Ao arrastar um móvel, os aparelhos dentro dos vãos ou apoiados nele, com contato ou espaço de até 20 px, acompanham o movimento, assim como toda a pilha acima deles. As distâncias entre os itens são preservadas, inclusive nos limites da área de trabalho. Os equipamentos compatíveis exibem pezinhos automáticos apenas quando há um pequeno espaço até a base de apoio. Ao encostar na base, os pezinhos automáticos desaparecem; ficam sempre atrás do aparelho, sem animação de descida. Nos toca-discos, o apoio automático se liga diretamente ao gabinete, sem deixar um vão acima dos pés.

Selecione a **Mesa de Áudio** e, no painel lateral, abra **Ambiente da bancada**. Escolha a superfície **Madeira**, **Feltro** ou **Estúdio**, ative ou oculte o **Painel acústico** e combine os objetos opcionais: **Discos**, **Capas**, **CDs** e **Luminária**. Os acessórios incluem um LP com capa em proporção correspondente, CD em estojo transparente e luminária articulada. Essas escolhas acompanham o projeto salvo e exportado.

## Experimentar a montagem

Para explorar um componente de cada vez, comece com uma fonte, um amplificador e um par de caixas. Depois acrescente um equalizador, compare seletores ou experimente um subwoofer. O gerador de sinais e os medidores ajudam a investigar o comportamento da montagem.

Novas montagens começam com **Luz neutra**, fundo **Sépia** e grade de **Pontos**. A opção **Luz quente**, em **Configurações → Iluminação**, oferece uma iluminação suave e estável. A iluminação, o fundo, a grade, o zoom e a posição da montagem são lembrados para a próxima visita. Em **Configurações**, você também pode ajustar o volume dos sons de interação e experimentar o **Ambiente sonoro**. Os sons de interação começam em um nível mais alto e podem ser ajustados ou silenciados. Com intensidade zero, a escuta permanece sem a reverberação do ambiente sonoro.

## Salvar, continuar e compartilhar

O programa salva a montagem automaticamente no armazenamento local do navegador, quando esse recurso está disponível. Confira a mensagem de salvamento na interface.

- **Exportar projeto:** baixa uma cópia da montagem, incluindo os arquivos de áudio carregados que estiverem disponíveis. Projetos com músicas podem gerar arquivos grandes.
- **Abrir projeto:** restaura uma cópia exportada. Essa ação substitui a montagem atual; exporte-a antes se quiser preservá-la.

Ao restaurar uma montagem, as fontes ficam pausadas. Inicie a reprodução quando estiver pronto para ouvir.

O salvamento local pertence ao navegador e ao endereço em que você abriu a aplicação. Ele pode não estar disponível em navegação privada ou ao abrir arquivos locais, e pode ser perdido ao limpar os dados do navegador. **Exporte os projetos que deseja guardar ou compartilhar.**

## Se não estiver saindo som

1. Clique ou toque na aplicação e inicie a reprodução na fonte.
2. Confira o volume de mídia e a saída de áudio do dispositivo, além de verificar se a aba do navegador está silenciada.
3. Verifique se os equipamentos estão ligados, com volume ou ganho acima de zero e sem mute ativo.
4. Confirme a entrada selecionada no amplificador, receiver ou seletor.
5. Siga o caminho dos cabos: fonte → processamento ou amplificação → caixas ou fones.
6. Confira os avisos de conexão, os medidores dos aparelhos e os indicadores de sinal.
7. Se um arquivo não reproduzir, tente outro formato aceito pelo navegador, como MP3 ou WAV.

No Safari do iPhone e iPad, o áudio é ativado por um toque em **Reproduzir**. A aplicação configura a sessão para reprodução de mídia e tenta retomar uma sessão já ativada ao voltar de outra aba ou após desbloquear a tela. Se o sistema exigir uma nova interação, toque em Reproduzir novamente. Abrir ou restaurar um projeto mantém as fontes pausadas.

O desbloqueio usa toque, clique ou teclado, mesmo com os sons de interação desligados. Em versões antigas do iOS sem a API de sessão de áudio, um áudio silencioso local mantém a rota de mídia; ele pausa quando a página fica oculta. A música continua passando pelo circuito Web Audio da montagem.

Para verificar regressões de ativação e retomada, execute `node --test tests/audio-activation.test.cjs` (Node.js, sem dependências adicionais). O agrupamento de móveis e a preservação dos espaços podem ser verificados com `node --test tests/furniture-group.test.cjs`.

## Sobre a simulação

O objetivo é oferecer uma experiência de exploração e aprendizado. Os equipamentos e seus comportamentos são aproximações virtuais; os medidores não representam medições de aparelhos físicos nem o volume acústico real no ambiente.

Use as informações do fabricante e orientação apropriada ao montar um sistema de som real.

Na categoria **Móveis**, os painéis acústicos **Horizontal** e **Vertical** medem **760 × 760 px**, seguindo a largura padrão dos equipamentos. A espuma grafite tem frisos em relevo; na Mesa de Áudio, o painel combina módulos com orientações alternadas. Os painéis ficam atrás dos aparelhos e suas posições acompanham o projeto salvo.
