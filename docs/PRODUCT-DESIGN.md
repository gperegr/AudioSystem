# Linguagem de produto

Os produtos de uma mesma fabricante compartilham peças, acabamentos e áreas de
assinatura. Tamanho externo, função, conexões e silhuetas particulares continuam
sendo características de cada modelo. As referências tipográficas e a relação
completa de modelos estão em [EQUIPMENT-BRANDS.md](EQUIPMENT-BRANDS.md).

| Marca | Elementos comuns | Posição da assinatura |
| --- | --- | --- |
| Aurenne | Latão champagne, madeira, reflexos quentes, teclas de cantos discretos | Eixo central do painel; junto à faixa de conexões quando os instrumentos ocupam o topo |
| Veltron | Alumínio frio, vidro fumê, aros cromados e moldura fina | Esquerda; no valvulado, na parte metálica frontal, distante das válvulas |
| Nexora | Grafite, filete cobre, teclas arredondadas e reflexos neutros | Superior esquerda; módulos Bluetooth usam a faixa inferior esquerda |
| Korden | Racks retos, molduras frias e teclas de cantos quase retos | Superior esquerda, respeitando alças laterais e grades existentes |
| Linholt | Grafite mineral, aros azulados, índices ciano e teclas de raio curto | Instrumentos: superior esquerda. Interfaces USB: inferior esquerda |
| Bravora | Madeira, molduras retas e detalhe cobre | Central, na base da grade; no baffle exposto, central na área livre |
| Soryn | Acabamento acetinado, contornos suaves e teclas arredondadas | Central acima dos falantes; na compacta, entre o woofer e os controles |
| Terevon | Aros de metal frio, painéis discretos e lettering serifado pequeno | Superior central, dentro da moldura; no painel eletrostático, central na base |
| Axiomer | Baffle de monitor, aros frios e detalhes em cobre | Central acima dos falantes; lettering reduzido no monitor curvo |
| Dovara | Painéis simples, comandos escuros e cantos moderadamente arredondados | Esquerda, no topo ou na faixa inferior livre |

## Controles e variações

Os aros, temperaturas dos metais, raios das teclas e acabamento dos painéis de
conexões se repetem por marca. Acabamentos especiais, como baquelite, marfim,
flywheel e controle por toque, mantêm suas construções. A hierarquia existente
de seleção de fonte, ajuste principal e conexões é preservada; nos pré-amplificadores
Nexora, por exemplo, fonte à esquerda, visor central e volume à direita formam
um conjunto reconhecível mesmo com painéis de cores diferentes.

No mixer Korden, a descrição funcional fica ao lado do logo, liberando a mesma
área superior esquerda dos outros racks e afastando a impressão da alça lateral.

Nas interfaces Linholt, o logo ocupa a mesma faixa inferior esquerda. Nos modelos
U-10 e U-30, as saídas L/R foram alinhadas ao lado dessa área, dentro de suas
próprias células. As conexões continuam na ordem L/R e mantêm o roteamento.

Toca-discos mantêm a assinatura na frente do pedestal, fora do prato, da tampa,
dos comandos de pitch e das teclas de transporte. O tangencial tem uma área
reservada sob os ajustes; o modelo de tração direta usa lettering compacto perto
da tecla de energia. Não são acrescentadas extensões traseiras.

## Regras para os logos

- O posicionamento usa faixas nomeadas da família, com pequenos ajustes locais.
  Reduzir o lettering tem prioridade sobre deslocá-lo para outra faixa.
- Não procurar espaço no centro dos controles. Exceções são áreas reservadas e
  explícitas para receiver, tangencial, valvulado e monitor curvo.
- Verificar a caixa inteira dos instrumentos, painéis de conexões, dutos,
  parafusos, legendas HTML/SVG e grupos de saídas. Manter quatro pixels de folga
  nas áreas calculadas, além da espessura da moldura.
- Calcular posições na escala do equipamento e compensar a borda do elemento
  que contém o logo. Isso evita deslocamentos em gabinetes de bordas grossas.
- Usar lettering completo, versão sem modelo ou letras compactas da mesma
  tipografia. O nome completo permanece disponível nas propriedades e no catálogo.
- Logos nas grades removíveis acompanham a própria grade; os falantes e seus
  parafusos ficam encobertos enquanto ela está colocada.
- Fones de ouvido e adaptadores não recebem marca visível.

## Manutenção e verificação

`src/modules/equipment-brands.js` define as famílias e faixas de impressão;
`styles/equipment/product-families.css` define as peças e acabamentos comuns.
As regras de material não alteram estados elétricos, LEDs de sinal ou feedback
de compatibilidade dos conectores.

`tests/equipment-brands.browser.cjs` verifica os 90 produtos, as áreas de impressão,
colisões, perfis das teclas, previews, busca e traduções. O teste de materiais
compara os 102 tipos do catálogo com as quatro camadas de acabamento desativadas,
preservando medidas externas e controles; apenas os dois grupos de saídas USB
reposicionados são excluídos da comparação de coordenadas. Mudanças em qualquer
modelo também precisam de revisão visual em tamanho real e de teste dos controles.
