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

Observe os avisos apresentados ao conectar equipamentos. O simulador pode alertar ou bloquear ligações inadequadas e representar sobrecarga, proteção e danos simulados.

## Operando os aparelhos

- **Selecione um equipamento** para abrir seus ajustes no painel lateral.
- **Arraste os knobs e faders** para ajustar volume, ganho, tonalidade e outros parâmetros. Os controles compatíveis também respondem ao teclado quando estão em foco.
- **Escolha a entrada correta** em receivers, integrados e seletores. Nos modelos com botões iluminados, a luz identifica a opção selecionada.
- **Experimente os equalizadores** para modificar graves, médios e agudos. Cada fader atua na frequência indicada abaixo dele.
- **Use mixers e seletores** para combinar fontes ou comparar caminhos de áudio.
- **Observe os medidores** e os indicadores para acompanhar a atividade do sinal.

Alguns ajustes aparecem apenas no painel lateral. Na **Potência · Visor Circular**, por exemplo, os ganhos A/B são ajustados por esse painel.

Os aparelhos Bluetooth representam conexões dentro da simulação; não substituem o pareamento Bluetooth do seu computador ou celular.

## Organizando a montagem

Mova os equipamentos pela área de trabalho e use os botões de **zoom**, **Centralizar** e **Ajustar para exibir tudo** para navegar por sistemas maiores.

Para selecionar vários aparelhos, use **Shift + clique** ou **Shift + arraste**. **Ctrl/Cmd + A** seleciona todos os equipamentos quando o foco está na área de montagem.

A **Visão do Sistema** reúne os aparelhos, suas conexões e o percurso do sinal. Clique no título para expandir ou recolher o painel. Em **Configurações**, a opção **Exibir Visão do Sistema** permite ocultá-lo.

## Aprender e experimentar

Abra **Configurações → Modo de aprendizado** para acessar atividades guiadas sobre montagem, conexões e áudio.

Para explorar um componente de cada vez, comece com uma fonte, um amplificador e um par de caixas. Depois acrescente um equalizador, compare seletores ou experimente um subwoofer. O gerador de sinais e os medidores ajudam a investigar o comportamento da montagem.

Em **Configurações**, você também pode alterar o tema e a grade da área de trabalho, ajustar os sons da interface e experimentar o **Ambiente sonoro**. Com intensidade zero, a escuta permanece sem a reverberação desse ambiente. O **Modo contemplação** permite observar a montagem com menos elementos na tela; pressione **Esc** para sair.

## Salvar, continuar e compartilhar

O programa salva a montagem automaticamente no armazenamento local do navegador, quando esse recurso está disponível. Confira a mensagem de salvamento na interface.

- **Exportar projeto:** baixa uma cópia da montagem, incluindo os arquivos de áudio carregados que estiverem disponíveis. Projetos com músicas podem gerar arquivos grandes.
- **Abrir projeto:** restaura uma cópia exportada. Essa ação substitui a montagem atual; exporte-a antes se quiser preservá-la.

Ao restaurar uma montagem, as fontes ficam pausadas. Inicie a reprodução quando estiver pronto para ouvir.

O salvamento local pertence ao navegador e ao endereço em que você abriu a aplicação. Ele pode não estar disponível em navegação privada ou ao abrir arquivos locais, e pode ser perdido ao limpar os dados do navegador. **Exporte os projetos que deseja guardar ou compartilhar.**

## Se não estiver saindo som

1. Clique ou toque na aplicação e inicie a reprodução na fonte.
2. Confira o volume e a saída de áudio do computador, além de verificar se a aba do navegador está silenciada.
3. Verifique se os equipamentos estão ligados, com volume ou ganho acima de zero e sem mute ativo.
4. Confirme a entrada selecionada no amplificador, receiver ou seletor.
5. Siga o caminho dos cabos: fonte → processamento ou amplificação → caixas ou fones.
6. Confira os avisos de conexão, os indicadores de sinal e a Visão do Sistema.
7. Se um arquivo não reproduzir, tente outro formato aceito pelo navegador, como MP3 ou WAV.

## Sobre a simulação

O objetivo é oferecer uma experiência de exploração e aprendizado. Os equipamentos e seus comportamentos são aproximações virtuais; os medidores não representam medições de aparelhos físicos nem o volume acústico real no ambiente.

Use as informações do fabricante e orientação apropriada ao montar um sistema de som real.
