# Revisão das identidades tipográficas

As dez marcas foram refeitas a partir das referências fornecidas, com lettering,
faixas, molduras e sombras. Não há pictogramas separados junto aos nomes.
A origem de cada letra e a referência visual estão em `EQUIPMENT-BRANDS.md`;
as fontes comerciais das imagens não são incluídas no projeto.

São três versões por marca em `assets/brands/`: arte completa, nome sem ornamentos
e assinatura curta com letras da mesma família. O encaixe considera cada painel;
marcas maiores recebem ornamentos quando há espaço. Um toca-discos compacto,
por exemplo, pode receber apenas `KR`, em vez de reduzir o nome até ficar ilegível.

A revisão foi feita em pranchas dos 90 equipamentos, incluindo os nove fones e
os seis adaptadores sem marcas visíveis. Dos 90 modelos, 75 recebem identificação
física; 73 estão no catálogo atual e dois são compatíveis com projetos antigos.
Os nomes de marca também são omitidos no catálogo e nas propriedades de fones e
adaptadores. IDs e associações internas continuam compatíveis com projetos salvos.

Os ajustes de posicionamento incluíram:

- poços e escalas de pitch nos toca-discos;
- visor do receiver moderno e leitura de velocidade do tangencial;
- dissipadores e grades dos amplificadores;
- cantos arredondados das caixas e interfaces;
- painéis de conexões, dutos bass-reflex e bordas inferiores dos gabinetes;
- contraste de tinta em metal claro, latão, madeira e pintura escura.

A verificação no Chromium cobre encaixe físico, sobreposição com controles,
visores, textos HTML/SVG, grades e dutos, prévias de posicionamento, tradução e
busca de modelos. O teste de materiais verifica a geometria dos 102 tipos do
programa; a revisão não muda dimensões, conexões ou comportamento de áudio.
