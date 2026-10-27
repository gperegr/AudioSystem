# Sinais de áudio e modelo elétrico

Atualizado em **27 de outubro de 2026**, conforme a implementação em [script.js](../../script.js).

Este documento descreve o funcionamento atual e suas aproximações. As constantes e funções do código são a fonte dos parâmetros; este arquivo não é um histórico de testes nem uma certificação de equipamentos físicos. A biblioteca visual de controles está em [COMPONENTES.md](COMPONENTES.md).

## 1. Tipos de sinal

| Sinal | Exemplos de origem | Uso adequado |
| --- | --- | --- |
| `line` | CD, streamer, tape, gerador, pré, EQ, crossover, receptor Bluetooth e LINE OUT | Entradas de linha de processadores, amplificadores e caixas ativas |
| `phono` | Toca-discos em PHONO | Entrada PHONO MM ou conversor phono → linha, com ganho e correção RIAA |
| `headphone` | Saídas PHONES | Fones; entrada LINE também pode receber com adaptação e ajuste de volume |
| `amplified` | Saídas SPEAKER | Caixas/subwoofers passivos, seletores de caixas ou conversor de potência para linha |
| `interconnect` | Entrada de adaptador passivo, seletor RCA ou matriz | Aceita linha, phono e fones, preservando o nível de origem |
| `unknown` / `mixed` | Cadeia ainda sem origem / porta estéreo com níveis diferentes nos canais | Identifica origem indefinida ou combinação que precisa ser revista |

SUB/LFE é uma função de áudio mono em nível de linha, não um nível elétrico separado. O filtro de graves segue o modelo do aparelho.

O conector não determina o sinal. RCA, P2, P10 e bornes têm regras físicas próprias; P2/P10 estéreo preservam os canais. A entrada P10 da caixa ativa de precisão é explicitamente mono.

## 2. Compatibilidade e alertas

`getPortCompatibility` verifica direção, equipamentos distintos, ciclos de realimentação, conectores, sinais e efeitos da ligação na cadeia existente.

| Ligação | Comportamento |
| --- | --- |
| Nível adequado e conector compatível | Conecta |
| PHONO → LINE/fones | Permite com aviso de nível baixo e correção RIAA ausente |
| LINE/fones → PHONO MM | Permite com aviso de sobrecarga e resposta tonal incorreta; o estágio phono satura localmente |
| LINE → fones | Permite com aviso; a carga reduz o nível, sem criar um amplificador no adaptador |
| Fones → LINE | Permite com aviso para começar com volume baixo |
| RCA com canais L/R cruzados | Permite com aviso; a ligação troca o destino do canal |
| SPEAKER → entrada sensível | Bloqueia e oferece a simulação explícita de dano descrita abaixo |
| Conectores que não encaixam, entrada → entrada, saída → saída ou ciclo | Bloqueia |
| Carga de caixas abaixo do mínimo do amplificador | Avisa antes da conexão; se confirmada, a proteção simulada silencia o canal |

Os avisos são apresentados antes de instalar uma ligação potencialmente inadequada. A compatibilidade é reavaliada quando a origem ou seleção muda. Um aviso de distorção não equivale a afirmar que o equipamento será destruído.

### Adaptadores e conversores

- Adaptadores passivos mudam conectores e distribuição de canais; não acrescentam ganho, atenuação ou conversão elétrica.
- Seletores e matrizes encaminham os caminhos selecionados, preservando o nível recebido.
- O conversor PHONO → LINE acrescenta ganho e equalização aproximada.
- O conversor Amplificado → Linha tem entrada de **20 kΩ** e atenua a tensão física em **10:1**, além de converter a escala interna de potência para a de linha.
- A análise prospectiva acompanha o sinal até os destinos após adaptadores. Um adaptador não esconde o risco para o equipamento ligado depois dele.

## 3. Tensão, potência e carga

`ELECTRICAL_MODEL` define a interpretação das amostras digitais:

| Grandeza | Referência da simulação |
| --- | --- |
| Amostra de linha/fones | 1 unidade instantânea = `2 × √2` volts |
| Amostra SPEAKER | 1 unidade instantânea = 100 volts |
| Ganho de reprodução PHONO MM | 100 vezes em tensão, ou 40 dB |
| Entrada de linha padrão | 47 kΩ |

Essas referências pertencem ao simulador. Não calibram a tensão da placa de som nem a intensidade acústica ouvida pelo usuário.

A potência usa tensão **RMS**, enquanto o teto do waveshaper usa tensão **de pico**:

```text
V_rms = RMS das amostras SPEAKER × 100
P = V_rms² / R
limite_de_pico_normalizado = √(2 × P_nominal × R) / 100
R_paralelo = 1 / soma(1 / R_de_cada_carga)
```

`wattsAtLoad`, `peakLimitForWatts` e `parallelOhms` centralizam essas relações. `ampPowerAtLoad` estima a potência disponível a partir dos pontos fixos do modelo; valores intermediários e extrapolações não são medições adicionais.

A escala de 100 V por unidade permite que uma saída digital próxima do limite represente centenas de watts em 8 Ω. O valor **ATUAL** no painel da caixa é a potência RMS estimada do áudio em reprodução e varia com o nível do sinal; a potência nominal do amplificador indica sua capacidade máxima, não a potência entregue continuamente.

### Regras de carga

- `terminalLoads` acompanha conexões, adaptadores e seletores por canal. Esquerdo e direito não entram em paralelo entre si.
- Ausência de carga é circuito aberto (`Infinity`), com potência entregue zero, e não uma caixa fictícia de 8 Ω.
- Carga abaixo de `minOhms` ativa a proteção simulada. O valvulado informa quando falta uma carga adequada.
- Mute e solo alteram a escuta, mas não desconectam a carga física.
- O subwoofer passivo com entradas L/R representa **bobinas eletricamente isoladas**. A impedância é por bobina e a potência estimada total soma as duas. A soma do áudio no simulador não ensina a unir saídas de amplificadores.

Potência, impedância e limites de saída são características fixas dos modelos. Valores antigos importados não substituem essas especificações. Volume, ganho e seleção continuam sendo controles de operação.

## 4. Fones e saídas compartilhadas

`HEADPHONE_SPECS` define a impedância dos fones; `HEADPHONE_OUTPUT_SPECS` define tensão máxima RMS, corrente máxima RMS e resistência de saída dos estágios de fones.

`installOutputCircuits` e `updateOutputCircuitLoads` aplicam:

- Divisor resistivo `R_carga / (R_carga + R_saída)`.
- Limite de tensão disponível conforme `min(V_máximo, I_máxima × R_carga)`.
- Caminhos de áudio independentes para L/R em saídas estéreo.
- Cargas combinadas quando P2/P10 compartilham o mesmo estágio.
- Cargas por canal compartilhadas entre RCA e saída estéreo das fontes que usam a mesma origem.

O indicador da saída de fones estima a potência entregue a uma carga de 32 Ω usando a mesma queda pela resistência de saída e o mesmo limite de corrente do circuito simulado. Não é a potência máxima abstrata do chip nem uma medição acústica.

O valor em ohms influencia o áudio. Ele não permite deduzir sozinho volume acústico, qualidade ou facilidade de acionamento sem conhecer a sensibilidade do transdutor.

## 5. Dano e sobrecarga

### Ligação de potência em entrada sensível

Ao tentar aplicar SPEAKER a uma entrada de linha, phono ou fones, o programa apresenta o risco antes de qualquer dano.

1. **Cancelar:** preserva o equipamento.
2. **Confirmar a simulação:** representa uma ligação deliberadamente energizada e aplica `state.damage` ao destino.

O cabo incompatível não é instalado nem conectado ao Web Audio. Confirmar representa a energização hipotética, inclusive se o aparelho de origem estava desligado no canvas; não é uma ligação física realizada pelo conector mostrado.

`applyDeviceDamage` desliga o destino, corta sua saída, desfaz cabos e pareamentos e impede religamento/reprodução. O dano persiste no projeto, é validado ao carregar e aparece no painel. A recuperação disponível é substituir o equipamento pelo catálogo.

### Potência disponível não é dano automático

Um amplificador com potência nominal maior que a recomendada para uma caixa possui reserva. O nível efetivamente entregue determina o esforço.

Caixas passivas não recebem um limitador de DSP automático. O programa mostra potência atual estimada e sobrecarga nos modelos com capacidade nominal definida. Uma recomendação de amplificação não é tratada como limite térmico medido. Não há cálculo de temperatura ou dano térmico acumulado.

## 6. Assinaturas sonoras e medição

Os perfis de caixas, subwoofers e fones ficam em `LISTENING_PROFILES`; os estágios de amplificação ficam em `AMPLIFICATION_VOICINGS`. Eles definem as diferenças tonais e de saturação dos modelos. Os subwoofers exibem no catálogo o corte passa-baixas do caminho de áudio (100 ou 120 Hz); caixas e fones exibem curvas aproximadas específicas. Os limites elétricos são aplicados além dessas características.

As curvas de caixas/fones são aproximações com filtros, compensação de nível e resposta própria por modelo. O gráfico tonal não representa sensibilidade acústica absoluta nem a resposta do ambiente.

A potência é medida a partir dos estágios SPEAKER correspondentes, sem misturar saídas auxiliares ou a impedância do outro canal. O nível do EQ atua antes da separação de suas saídas RCA e estéreo. Os medidores de bancada observam o sinal da cadeia de linha.

O valvulado tem aquecimento visual, entrada progressiva do áudio e perfil de saturação próprio. Esses comportamentos são escolhas da simulação, com tempos abreviados.

## 7. Limites e estado da revisão

O modelo usa impedâncias resistivas nominais e proteções simplificadas. Os nomes e os números de potência são modelos didáticos, não especificações certificadas de produtos físicos. Não reproduz circuitos completos, impedância complexa por frequência, capacitância de cápsula/cabo, taps físicos do transformador, diretividade, sala, sensibilidade acústica, temperatura de bobina ou tempo real até falhar. A RIAA é aproximada por filtros; cápsulas MC e cerâmicas não têm modelos separados.

A revisão de 27 de outubro conferiu as especificações dos amplificadores contra suas curvas de potência por carga, a presença de perfis para todos os tipos de caixas e fones, as curvas dos subwoofers e as grandezas elétricas exibidas no catálogo. Os testes de unidade (`node --test tests/*.test.cjs`), a montagem do bundle e a sintaxe de `script.js` passaram. Os testes de integração de navegador e a comparação auditiva não foram executados nesta revisão.
