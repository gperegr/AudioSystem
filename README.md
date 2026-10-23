# Audio System Simulator

Monte um sistema de som virtual, conecte os equipamentos e ouça o resultado no navegador. Explore fontes, amplificadores, equalizadores, caixas e fones com estilos vintage, de estúdio e modernos.

![Exemplo de montagem: catálogo à esquerda, sistema estéreo no centro e ajustes do integrado à direita](docs/images/visao-geral.png)

**[Wiki e guias completos](https://github.com/gperegr/AudioSystem/wiki)** · **[Exemplos de montagem](https://github.com/gperegr/AudioSystem/wiki/Exemplos-de-montagem)** · **[Solução de problemas](https://github.com/gperegr/AudioSystem/wiki/Problemas-frequentes)**

## Abrir e ouvir

1. Baixe o repositório em **Code → Download ZIP** e extraia todo o conteúdo.
2. Abra **index.html** em Chrome, Edge ou outro navegador atualizado, mantendo as pastas juntas.
3. Mantenha internet disponível para os recursos externos de estilo e as fontes da interface.
4. Clique ou toque no programa para liberar o áudio. Comece com o volume do computador baixo.

Se você recebeu o endereço da aplicação publicada, abra-o diretamente. O programa não exige instalar Node.js para ser usado.

## Sua primeira montagem

Adicione um **CD Player**, um **Integrado · Visores Azuis** e duas **Caixas Passivas Vintage**. Arraste do catálogo; no toque, toque no nome para adicionar.

```mermaid
flowchart LR
    CD["CD Player"] -->|"RCA L/R · linha"| INT["Integrado · entrada Linha 1"]
    INT -->|"SPEAKERS L · amplificado"| L["Caixa passiva esquerda"]
    INT -->|"SPEAKERS R · amplificado"| R["Caixa passiva direita"]
```

1. Ligue RCA OUT L/R do CD à entrada **Linha 1 L/R** do integrado.
2. Ligue uma caixa a **SPEAKERS L** e a outra a **SPEAKERS R**.
3. Confira a alimentação dos aparelhos, selecione **Linha 1** e inicie a reprodução no CD.
4. Ajuste o volume do integrado gradualmente.

As fontes musicais oferecem demonstração quando não há música própria. Para ouvir um arquivo local, selecione a fonte e use **Música própria → CARREGAR ÁUDIO**. MP3 e WAV são opções comuns; a compatibilidade depende do navegador. O Streamer Integrado também lê metadados e capa de MP3/FLAC quando disponíveis.

## Entradas, saídas e níveis

| Sinal | Origem | Destino |
| --- | --- | --- |
| Linha / LINE | CD, streamer, pré ou processador | LINE de amplificador, processador ou caixa ativa |
| PHONO | Toca-discos em PHONO | Entrada PHONO ou conversor PHONO → LINHA |
| PHONES | Amplificador ou saída de fones | Fones compatíveis |
| Amplificado / SPEAKERS | Potência, integrado ou receiver | Caixa ou subwoofer passivo |
| SUB / LFE | Saída de graves em nível de linha | Subwoofer ativo |

Preserve **L e R**. P2/P10 podem reunir estéreo, mas há entradas mono, como a P10 da **Caixa Ativa · Precisão**. Confira os rótulos: o formato do plugue sozinho não determina o sinal. Adaptadores passivos mudam conectores e canais; conversores alteram o nível ou a preparação do áudio.

Os avisos explicam níveis incorretos, carga e possíveis danos simulados. Desativar a ajuda em Configurações não permite encaixar plugues de formatos diferentes. Consulte [Sinais e conexões](https://github.com/gperegr/AudioSystem/wiki/Sinais-e-conexoes).

## Navegação e controles

| Ação | Como fazer |
| --- | --- |
| Ajustar um aparelho | Selecione-o; o painel direito mostra seu nome e os controles disponíveis. |
| Recolher o painel direito | Use a seta ao lado de **Configurações**, na barra superior. A largura é fixa entre equipamentos e o painel desliza ao abrir/fechar. |
| Recolher o catálogo | Use a seta no cabeçalho do catálogo; a alça permite reabri-lo. |
| Procurar equipamentos | Busque por nome, função, conector ou sinal. |
| Ajustar knobs e faders | Arraste; controles compatíveis aceitam teclado e mostram o valor durante o ajuste. |
| Selecionar vários | **Shift + clique/arraste**; **Ctrl/Cmd + A** seleciona todos quando o foco está na montagem. |
| Navegar na montagem | Use zoom, **Centralizar** e **Ajustar para exibir tudo**. |
| Desfazer/refazer movimento | Use as setas da barra ou **Ctrl/Cmd + Z** / **Ctrl/Cmd + Shift + Z**. Esse histórico é de posições. |
| Organizar cabos | Selecione um cabo para ajustar etiqueta, cor, visibilidade e folga. Ocultar não corta o áudio. |

Os controles de ajuste usam passos discretos; seletores e sintonia têm escalas próprias. **Restaurar Configurações** aparece nos aparelhos com ajustes restauráveis. Nas potências, o ganho padrão é **5/10**; projetos com ganhos próprios preservam seus valores. Isso não significa metade da potência nominal em watts.

### Cenário, piso e iluminação

Em **Configurações → Fundo**, escolha **Cenário** para mostrar a sala ilustrada. O menu então oferece cinco ambientes: **Estúdio**, **Sala de audição**, **Loft**, **Sala verde-oliva** e **Sala noturna**. O piso acompanha o ambiente por padrão: carpete no estúdio, concreto no loft e madeira nas outras salas. Você pode escolher **Madeira**, **Carpete**, **Concreto** ou **Sem piso** manualmente; a escolha passa a valer ao trocar de cenário. Os outros fundos (Claro, Grafite, Azul noturno e Sépia) continuam disponíveis sem cenário. Fundo, cenário, piso, grade e zoom são lembrados no navegador e acompanham o projeto salvo.

Os fundos e as paisagens vistas pelas janelas são vetoriais. As janelas combinam camadas distantes mais desfocadas com construções ou vegetação próximas, cada uma com sua própria velocidade de paralaxe. A cidade e a paisagem natural reutilizam os mesmos desenhos com paletas de luz diferentes. Paredes, painéis acústicos, tijolos, plantas, arte abstrata, luminárias e janelas são objetos definidos em `assets/rooms/scenes.js` e distribuídos entre três planos de profundidade. Os cenários não incluem móveis nem objetos de áudio: o usuário adiciona esses elementos ao canvas. A posição, cor e formato dos emissores vêm das luminárias e janelas do cenário e influenciam reflexos e sombras dos equipamentos. Knobs, teclas, sliders e plugues têm sombras de contato e alturas diferentes; prateleiras e laterais dos móveis adicionados ao canvas criam sombras no seu interior. A vista permanece frontal; áudio, conexões e funcionamento dos controles não dependem dos efeitos visuais.

A direção visual combina interiores mid-century modernos com ilustração vetorial de jogo indie: madeira de veios discretos, metais suaves, arandelas âmbar e arte geométrica. Os planos mais distantes têm desfoque e contraste um pouco menores; os aparelhos e seus controles permanecem mais definidos na frente.

Ao deslocar ou ampliar o canvas, cenário, detalhes da sala e piso se movem em velocidades diferentes dos equipamentos, criando paralaxe. Mover somente o cursor não altera esse efeito. A junção entre parede e piso permanece fixa, e os aparelhos podem avançar um pouco sobre o piso para parecerem apoiados nele.

O catálogo inclui a categoria **DEBUG**, com **Modelo · Controles** e **Ponto de luz · Teste**. A luz de teste aparece somente depois de adicionada; arraste-a para comparar a incidência, ajuste cor e intensidade no próprio objeto e dê um clique duplo para alterná-la. Ela serve para experimentar o visual e não participa do circuito de áudio. Em caixas com grade removível, um pequeno botão quadrado com ícone permite recolocá-la.

### Celulares e tablets

Os ícones **Equipamentos** e **Propriedades** abrem gavetas sobre a montagem. Feche pelo botão fixo ou tocando fora. Em telas estreitas, deslize a barra superior horizontalmente. Use dois dedos para mover/ampliar o canvas; pressione e segure antes de mover um aparelho, ou ative **Modo Touch** para arraste imediato.

<img src="docs/images/painel-mobile.png" alt="Painel de ajustes aberto em celular, com nome do integrado e botão para ocultar propriedades" width="320">

### Ruído, assinatura sonora e comparação

Nos toca-discos, os quatro ícones de **Ruído do vinil** escolhem sem ruído, baixo, médio ou alto. No tape deck, **Ruído de fita** usa os mesmos quatro níveis; as três ondas em **Oscilação da fita** escolhem baixa, média ou alta. O botão ativo fica iluminado e os nomes aparecem nas dicas e na navegação acessível.

![Painel do tape deck com os ícones de ruído e oscilação da fita](docs/images/tape-controles.png)

Nos fones e caixas com **Assinatura sonora**, os indicadores resumem a mesma curva do gráfico: graves em **60–200 Hz**, médios em **300–2.500 Hz** e agudos em **5.000–12.000 Hz**. O centro é neutro entre **−1 e +1 dB**; recuo/realce forte começa em **4 dB** de desvio. Um pico localizado pode diferir da média da faixa. A redução global de volume para reservar margem não desloca os indicadores.

![Exemplo: realce dos agudos da Bookshelf · Tweeter Superior, coerente com a curva](docs/images/assinatura-agudos.png)

Em amplificadores, **Comportamento sonoro** usa outra escala: compara o perfil base de graves, agudos, saturação e harmônicos pares. Para comparar saídas, mantenha níveis próximos e use **SOLO** e **MUTE** no painel de escuta. A assinatura é um perfil tonal do modelo; o espectro mostra o conteúdo do sinal naquele ponto.

## Guias por assunto

| Guia da wiki | Conteúdo |
| --- | --- |
| [Fontes de áudio](https://github.com/gperegr/AudioSystem/wiki/Fontes-de-audio) | Toca-discos articulados e tangencial, tape, CD, streamer, rádio e Bluetooth virtual |
| [Amplificação](https://github.com/gperegr/AudioSystem/wiki/Amplificacao) | Prés, integrados, receivers, potências e saídas de fones |
| [Caixas, subwoofers e fones](https://github.com/gperegr/AudioSystem/wiki/Caixas-subwoofers-e-fones) | Ativos/passivos, grades, modelos de fones e impedância |
| [Assinatura sonora](https://github.com/gperegr/AudioSystem/wiki/Assinatura-sonora) | Referência de 0 dB, indicadores, faixas e exemplos visuais |
| [Processadores](https://github.com/gperegr/AudioSystem/wiki/Processadores-de-audio) | EQ de sete bandas, mixers e crossovers |
| [Seletores e adaptadores](https://github.com/gperegr/AudioSystem/wiki/Seletores-e-adaptadores) | Caminhos A/B, matriz e conversão de níveis |
| [Geradores e medidores](https://github.com/gperegr/AudioSystem/wiki/Geradores-e-medidores) | Senoide, varredura, ruído rosa e medições do sinal |
| [Configurações e projetos](https://github.com/gperegr/AudioSystem/wiki/Configuracoes-e-projetos) | Móveis, bancada, apresentação, áudio, salvamento e exportação |

Bluetooth e rádio são virtuais; o programa não faz pareamento com aparelhos físicos nem recebe emissoras por uma antena do computador. Compare o mesmo trecho e um componente de cada vez.

## Salvar e compartilhar

O salvamento automático usa o armazenamento local, quando disponível. Confira o status na interface; os dados pertencem ao navegador e ao endereço usados.

```mermaid
flowchart LR
    M["Montagem atual"] -->|"Automático"| N["Armazenamento deste navegador"]
    M -->|"Exportar projeto"| A["Arquivo com montagem e áudios disponíveis"]
    A -->|"Abrir projeto"| R["Montagem restaurada · fontes pausadas"]
```

**Exportar projeto** baixa uma cópia com posições, cabos, ajustes e músicas disponíveis. **Abrir projeto** substitui a montagem atual; exporte antes o que quiser preservar. Limpar dados, mudar de navegador/endereço ou usar navegação privada pode impedir recuperar o salvamento local. Exporte os projetos importantes.

## Se não houver som

1. Clique/toque na aplicação e inicie a fonte; projetos restaurados começam pausados.
2. Confira o volume de mídia, a saída do dispositivo e se a aba está silenciada.
3. Verifique alimentação, volume/ganho, entrada selecionada, SOLO e MUTE.
4. Siga a cadeia da fonte à escuta, conferindo L/R, tipo de sinal e avisos de carga.
5. Para música própria, teste outro arquivo compatível, como MP3 ou WAV.

No Safari de iPhone/iPad, toque em Reproduzir. Ao voltar de outra aba, a sessão já ativada tenta retomar; se necessário, toque novamente. Veja [Problemas frequentes](https://github.com/gperegr/AudioSystem/wiki/Problemas-frequentes).

## Desenvolvimento e referências

A aplicação é composta de HTML, CSS e JavaScript; os testes abaixo exigem Node.js, sem dependências adicionais:

```sh
node --check script.js
node --test tests/*.test.cjs
```

A suíte cobre ativação/retomada do áudio, movimento de grupos em móveis e coerência dos indicadores de assinatura sonora. Consulte [modelo de sinais e limites elétricos](REVISAO-SINAIS.md), [biblioteca de controles](COMPONENTES.md) e [fontes dos equipamentos](assets/fonts/README.md).

As [imagens da documentação](docs/images/README.md) são capturas do simulador; os diagramas mostram percursos de sinal. Os modelos são aproximações virtuais: W, Ω, dB e os gráficos não são medições de equipamentos físicos nem previsão do volume acústico na sala. Para um sistema real, consulte as especificações dos fabricantes.
