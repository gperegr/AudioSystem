# Design system da interface

Este guia é a referência para menus, catálogo, configurações, painéis, diálogos e controles do Audio Lab. O desenho dos equipamentos e do ambiente no canvas possui estilos próprios. Ao alterar a interface, reutilize os componentes existentes e os tokens de `styles/interface-palettes.css`; não copie cores fixas de uma paleta para outra.

A marca combina um A com uma onda sonora. Os vetores originais ficam em `assets/brand/`; a barra superior usa o símbolo em `--ui-accent`, acompanhado pelo nome Audio Lab em Inter Bold. Em telas pequenas, o símbolo aparece sozinho com o nome acessível preservado.

## Paletas e tokens

`document.documentElement.dataset.uiPalette` é sincronizado com o fundo, cenário e horário em `src/app/02-room-and-canvas-theme.js`. As definições e valores reais ficam em `styles/interface-palettes.css`; consulte esse arquivo como fonte de verdade. Existem `light`, `sepia`, `graphite`, `midnight` e `scene-{studioIllustrated|listeningIllustrated|loftIllustrated}-{dawn|dusk|night}`. O seletor `:root` oferece valores de reserva. Não atribua o atributo manualmente a partir de um componente.

| Token | Uso |
| --- | --- |
| `--ui-top` | Barra superior |
| `--ui-side` | Fundos de barras laterais e configurações |
| `--ui-panel` | Cartões, seções e diálogos |
| `--ui-control` | Fundo de controles e campos |
| `--ui-hover` | Superfície sob o ponteiro |
| `--ui-active` | Controle selecionado ou acionado |
| `--ui-border` | Bordas e divisórias |
| `--ui-text` | Texto principal |
| `--ui-secondary` | Rótulos e texto secundário |
| `--ui-muted` | Texto discreto e indicações auxiliares |
| `--ui-accent` | Destaque, foco e seleção |
| `--ui-shadow` | Sombras da interface |
| `--ui-scheme` | `color-scheme` dos controles nativos |

Cores de estado de sinal, alerta e perigo têm significado próprio; preserve esse significado e garanta contraste em fundos claros e escuros. Para gráficos desenhados em canvas da interface, obtenha os tokens por `getComputedStyle(document.documentElement)` ao desenhar, como no analisador de espectro. Não aplique esses tokens ao desenho de equipamentos.

## Paletas dos cenários

As nove paletas acompanham os materiais e a iluminação das imagens de `assets/rooms`, conforme o mapeamento de `assets/rooms/scenes.js`:

| Cenário | Nascer do dia | Fim de tarde | Noite |
| --- | --- | --- | --- |
| Estúdio | Carvão com madeira suave | Nogueira e âmbar | Grafite azulado e luz fria |
| Sala de audição | Calcário, madeira e oliva discreto | Areia dourada e mel | Ardósia suave e azul do luar |
| Loft industrial | Concreto claro e terracota | Tijolo queimado e cobre | Aço azulado e reflexos quentes da cidade |

A claridade da interface acompanha o interior da imagem: o estúdio permanece escuro mesmo ao amanhecer; a sala de audição conserva a luminosidade da parede ao pôr do sol. Estados ativos e favoritos usam o destaque de cada paleta, mantendo contraste com o fundo.

## Tipografia e composição

Use `var(--font-ui, "Inter", sans-serif)`. O padrão existente usa títulos de seção em torno de 16 px e peso 700, rótulos de 12–13 px e peso 600, e texto auxiliar de 11–12 px com entrelinha de aproximadamente 1,4. Mantenha a hierarquia legível, sem depender apenas de caixa alta ou cor. Use alinhamento consistente, espaçamento de 8–14 px entre elementos e cartões com borda de 1 px e raio de 7–10 px, acompanhando os componentes próximos. Os tamanhos são referências do estilo existente, não classes ou tokens CSS já implementados.

## Componentes

| Componente | Referência existente | Aplicação |
| --- | --- | --- |
| Botão | `.tt-insp-btn`, `.app-settings-content button` | Fundo `--ui-control`, texto `--ui-text`, borda `--ui-border`; hover `--ui-hover`, estado ativo `--ui-active`. Use `button` e `aria-pressed` para alternância. |
| Botão de ícone | `.canvas-tools button`, `.sidebar-pin` | Ícone com `currentColor`, nome acessível via `aria-label` e foco visível. |
| Slider | `input[type=range]`, `--menu-slider-track`, `--menu-slider-thumb` | Use range nativo com rótulo, valor e unidade; permita teclado. A trilha e o controle usam os tokens existentes; preserve cores de medição com significado. |
| Dropdown | `.app-select-trigger`, `.app-select-popup`, `.app-select-option` | Reutilize o seletor compartilhado e o `select` que o alimenta; mantenha estado selecionado, navegação por teclado e foco. Não implemente uma segunda versão local. |
| Checkbox | `input[type=checkbox]` com `label` | Use controle nativo associado ao rótulo e `color-scheme: var(--ui-scheme)`; estados marcado, desabilitado e foco devem ser perceptíveis. Não existe classe global específica consolidada. |
| Campo de texto | Busca do catálogo | Use `--ui-control`, `--ui-text`, `--ui-border` e placeholder `--ui-muted`; inclua rótulo acessível. |
| Grupo expansível | `.settings-group`, `.signal-history-panel` | Use `details`/`summary`, título claro, indicador de abertura e foco de teclado. |
| Cartão | `.model-specs`, `.sonic-signature-panel`, `.settings-group` | Fundo `--ui-panel`, borda `--ui-border`, títulos `--ui-text` e texto auxiliar `--ui-secondary`. |
| Diálogo | `.app-confirm-dialog`, `.tutorial-dialog` | Reutilize o fluxo de diálogo existente, com título, ação principal clara, cancelamento e gerenciamento de foco. |
| Gráfico e legenda | `.spectrum-panel`, `#audio-spectrum` | Diferencie séries por legenda e cor; use os tokens para superfície e eixos, mantendo contraste em todas as paletas. |

Evite criar componentes visualmente semelhantes com comportamento ou classes independentes. Onde ainda não houver componente compartilhado, siga os contratos acima e registre a implementação neste documento quando ela for consolidada.

## Estados, acessibilidade e idioma

Inclua estados normal, hover, foco visível, selecionado, desabilitado e erro quando aplicáveis. Foco deve continuar visível com teclado; não dependa de hover para acesso no toque. Como referência, a interface usa áreas de toque de 44 px em opções de seleção para ponteiros de toque. Preserve os rótulos, `title`, `aria-label` e opções traduzíveis em PT e EN pelos mecanismos de `src/i18n/`. Texto normal deve atingir contraste de pelo menos 4,5:1; verifique também ícones, bordas, estados e mensagens sobre seus fundos reais.

## Checklist para agentes

1. Identifique o componente compartilhado e seus estilos em `styles/app.css` e `styles/interface-palettes.css` antes de criar outro.
2. Use os tokens semânticos, mantenha o estado e as traduções, e preserve o comportamento por mouse, teclado e toque.
3. Confira temas claros e escuros, cenário e horário, controles ativos e desabilitados, além de uma largura móvel.
4. Execute as verificações pertinentes. `node tests/interface-palettes.browser.cjs` cobre as 13 combinações, contraste dos componentes principais e preservação do visual de um equipamento; aceita `TAILWIND_SCRIPT_FILE` para uso offline. `node --test tests/*.test.cjs` executa a suíte Node.
5. Se alterar tokens ou contratos compartilhados, atualize este guia e os pontos de uso relevantes. CSS de equipamentos em `styles/equipment/` e seus controles no canvas seguem suas próprias regras.

## Catálogo permanente

O catálogo à esquerda permanece visível, sem seta, alfinete, recolhimento automático ou preferência de fixação. O canvas reserva a largura do catálogo; em telas de até 700 px, o catálogo usa 136 px e uma coluna de equipamentos. A busca, os favoritos e o descarte por arraste continuam disponíveis. O cabeçalho da busca desfoca gradualmente os itens que rolam atrás dele; a busca permanece aberta enquanto houver texto, até que ele seja apagado.

Os painéis de propriedades ficam em uma camada com os limites do canvas, abaixo da barra superior e à direita do catálogo. Posição, tamanho, animação e sombra respeitam esses limites; quando falta espaço, reduzem largura e altura com rolagem interna. O posicionamento se atualiza quando o painel, o catálogo ou a barra superior mudam de tamanho.
