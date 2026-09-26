---
name: Match do Vinho
description: Ficha de prova do Armazém dos Importados, preenchida à mão sobre o campo azul da marca.
colors:
  navy: "#00273c"
  navy-raised: "#0b3a55"
  paper: "#ffffff"
  plate: "#edf1f4"
  ink: "#00273c"
  ink-2: "#4a6273"
  rule: "#c7d3dc"
  hover: "#f1f5f8"
  on-navy: "#ffffff"
  on-navy-2: "rgba(255, 255, 255, 0.78)"
  on-navy-3: "rgba(255, 255, 255, 0.66)"
  error: "#8a1f1f"
  profile-fresco: "#2F6B5E"
  profile-floral: "#7A4E7E"
  profile-frutado: "#A13D3B"
  profile-seco: "#3B3A36"
  profile-fora: "#B8652A"
typography:
  display-hero:
    fontFamily: "'Libre Caslon Display', 'Libre Caslon Text', Georgia, serif"
    fontSize: "clamp(40px, 10vw, 80px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.012em"
  display:
    fontFamily: "'Libre Caslon Display', 'Libre Caslon Text', Georgia, serif"
    fontSize: "clamp(40px, 11vw, 62px)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "'Libre Caslon Display', 'Libre Caslon Text', Georgia, serif"
    fontSize: "clamp(28px, 7vw, 44px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  title:
    fontFamily: "'Libre Caslon Display', 'Libre Caslon Text', Georgia, serif"
    fontSize: "clamp(26px, 6vw, 34px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  voice:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.3
  lede:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "18.5px"
    fontWeight: 400
    lineHeight: 1.5
  entry:
    fontFamily: "'Libre Caslon Text', Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  body-long:
    fontFamily: "'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
  label:
    fontFamily: "'Archivo', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.14em"
    fontVariation: "'wdth' 78"
rounded:
  none: "0px"
  control: "2px"
  sheet: "3px"
spacing:
  gutter: "16px"
  gutter-wide: "24px"
  field-gap: "14px"
  section-gap: "36px"
  section-gap-wide: "48px"
components:
  button-ink:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-ink-hover:
    backgroundColor: "{colors.navy-raised}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-navy}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  field-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "10px 2px"
    height: "56px"
  option:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "12px 12px 12px 10px"
    height: "60px"
  option-hover:
    backgroundColor: "{colors.hover}"
  option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "18px 20px 28px"
  wine-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
  admin-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  admin-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
---

# Design System: Match do Vinho

## Overview

**Creative North Star: "A Ficha de Prova do Armazém"**

Tudo acontece sobre o azul do Armazém (#00273c), que ocupa regiões inteiras da tela e nunca serve só de acento. Sobre esse campo pousa uma ficha impressa em cartão branco puro, com moldura fina interna, pautas azuis, caixas de marcação quadradas e campos numerados. O visitante preenche a ficha à mão: marcar uma opção desenha um visto de tinta na caixa, e o resultado sai conferido por um carimbo circular. A voz tipográfica é a do impresso de loja antiga: Caslon para o que é dito, Archivo condensado para o que é rótulo de formulário.

A densidade é de formulário, não de revista: uma pergunta por ficha no celular, linhas de opção altas (60px), pautas de 1px e fios de 1.5px separando cabeçalho e rodapé. O painel da equipe herda o mesmo mundo em modo de operação: fundo branco, faixa azul no topo, tabela pautada como livro-razão, sem animação de entrada.

O sistema recusa o quiz de cards coloridos com barra de progresso, a "carta de vinhos" creme com serifa e qualquer linguagem de supermercado (selos, vermelho promocional, preço riscado, confete).

**Key Characteristics:**
- Campo azul dominante; o branco aparece como papel, não como fundo de página.
- Ficha com moldura interna fina (outline de 1px recuado 7px, 9px em telas maiores).
- Pautas finas (#c7d3dc, 1px) para linhas; fios de tinta (1.5px) para abrir e fechar blocos.
- Caixas de marcação quadradas, sem cantos arredondados, com visto desenhado em SVG.
- Rótulos em Archivo condensado (largura 78%), caixa alta, espaçamento 0.14em.
- Cor de perfil só no resultado: nome do perfil, carimbo e bolinhas do painel.

## Colors

Duas cores de marca (azul-marinho e branco) fazem quase todo o trabalho; tons de azul acinzentado dão pauta, prato e texto secundário; cinco cores de perfil entram apenas como identidade de resultado.

### Primary
- **Azul Armazém** (navy): o campo de fundo do quiz, a faixa do painel, o botão principal cheio. É também a tinta (ink) com que tudo é escrito sobre o papel: títulos, fios, caixa marcada, opção selecionada.
- **Azul Armazém Elevado** (navy-raised): somente estado de hover dos botões cheios.

### Secondary
- **Acentos de perfil** (profile-fresco, profile-floral, profile-frutado, profile-seco, profile-fora): cada perfil de paladar tem uma cor terrosa e fechada. Aplicada via a variável `--accent` no nome do perfil em tamanho de herói, no carimbo circular e nas bolinhas de 9px do painel (contagem e coluna Perfil). Nunca em texto corrido, botão ou fundo.

### Neutral
- **Papel** (paper): fundo da ficha, dos cartões de vinho e do painel.
- **Prato** (plate): fundo cinza azulado onde a garrafa pousa no cartão de vinho.
- **Tinta Secundária** (ink-2): texto de apoio, rótulos de campo, lede, numeração das opções, placeholders.
- **Pauta** (rule): linhas entre opções, entre campos do cartão de vinho, moldura interna da ficha, borda lateral dos controles do painel.
- **Hover** (hover): fundo de linha sob o cursor (opção, linha do livro-razão) e faixa de aviso do painel.
- **Branco sobre azul** (on-navy, on-navy-2, on-navy-3): texto direto sobre o campo azul em três intensidades: principal, apoio, notas legais.
- **Erro** (error): vermelho escuro, só para validação de campo. Não é cor promocional.

### Named Rules

**The Blue Field Rule.** O azul é território, não detalhe: no quiz ele ocupa o fundo inteiro e o conteúdo principal pousa nele como papel. No painel, o azul fica restrito à faixa superior e à tinta.

**The Ink Is Brand Rule.** Não existe preto no sistema. Toda tinta sobre papel é o próprio azul da marca (#00273c); texto secundário é ink-2.

**The Profile Colors Stay In The Result Rule.** As cores de perfil só aparecem depois que o perfil foi atribuído (resultado e painel). Antes disso, a ficha é só azul e branco.

## Typography

**Display Font:** Libre Caslon Display (com Libre Caslon Text e Georgia)
**Body Font:** Archivo, eixo de largura variável 62 a 125 (com system-ui)
**Serif de texto:** Libre Caslon Text, romana e itálica

**Character:** Caslon Display em peso 400 dá o título impresso, alto e fino; Caslon Text faz as falas e as anotações "manuscritas" da ficha; Archivo condensado faz o papel do formulário impresso (rótulos, cabeçalhos de coluna, numeração).

### Hierarchy
- **Display Hero** (400, clamp 40 a 80px, 1): só o nome do perfil no resultado, na cor do perfil.
- **Display** (400, clamp 40 a 62px, 1.02): título da intro.
- **Headline** (400, clamp 28 a 44px, 1.12): o enunciado de cada pergunta.
- **Title** (400, clamp 26 a 34px, 1.08): títulos de ficha secundária (loja, tela de menor de idade, interstício). No painel, o título da faixa usa Caslon Display a 28px.
- **Voice** (Caslon Text itálico, 20 a 21px, 1.3 a 1.4): falas da loja: "Você é", tagline do perfil, subtítulo do MATCH 3.
- **Lede** (Caslon Text, 18.5px, 1.5): parágrafo de abertura da intro, em ink-2.
- **Entry** (Caslon Text, 16px, 1.45): respostas escritas nos campos do cartão de vinho ("Por que dá match", "Sirva com"); o nome do vinho sobe para 22px/1.2.
- **Body** (Archivo 400, 16px, 1.5) e **Body Long** (17px, 1.6, máximo 62ch): texto corrido.
- **Label** (Archivo 600 a 700, 11 a 13px, 0.14 a 0.16em, caixa alta, largura 78%): rótulos de campo, cabeçalho da ficha, nome da faixa do vinho, cabeçalhos da tabela do painel.

Números de preço, temperatura, progresso e datas usam `font-variant-numeric: tabular-nums`. O total do trio usa Caslon Display com algarismos alinhados.

### Named Rules

**The Printed Form Rule.** Caixa alta existe só em Archivo condensado, em tamanho de rótulo (11 a 13px), nomeando um campo ou uma coluna. Nunca em Caslon, nunca em texto corrido.

**The Caslon Speaks Rule.** Quando a loja fala com a pessoa (títulos, taglines, respostas do cartão), é Caslon. Quando o sistema organiza (rótulos, botões, metadados), é Archivo.

## Layout

Coluna única centrada em todo o quiz: a ficha tem largura máxima de 560px mais o respiro lateral; o resultado abre para 1080px. O respiro lateral é 16px no celular e 24px a partir de 640px. A moldura da página é uma grade de três linhas: faixa do logo (58px de altura, 70px a partir de 640px), conteúdo centralizado verticalmente e rodapé legal com fio branco a 14% de opacidade.

No resultado, os blocos se empilham com 36px de intervalo (48px a partir de 900px): ficha do perfil, cabeçalho MATCH 3, trio de cartões, condição do trio (entre fios brancos a 30%), ficha da loja e ações. A partir de 900px o trio vira três colunas iguais com 20px de intervalo, o cabeçalho MATCH 3 põe o título à esquerda e o texto ao lado, e a ficha da loja separa texto (esquerda) e botões em coluna (direita, mínimo 260px).

O painel usa largura máxima de 1400px. Abaixo de 900px a tabela vira lista de fichas: cada linha empilha seus campos com o rótulo à esquerda (coluna de 110px) e um fio de tinta entre registros.

Alvos de toque têm no mínimo 44px; botões e campos principais têm 56px; linhas de opção, 60px.

## Elevation & Depth

Híbrido contido: a página é plana, e só o papel sobre o azul ganha sombra, como uma folha apoiada na mesa. Dentro do papel não há sombra nenhuma; a hierarquia vem de fios e pautas.

### Shadow Vocabulary
- **Folha pousada** (`box-shadow: 0 1px 0 rgba(0,0,0,0.12), 0 24px 48px -24px rgba(0,10,20,0.6)`): fichas brancas sobre o campo azul.
- **Cartão pousado** (`box-shadow: 0 24px 48px -28px rgba(0,10,20,0.7)`): cartões de vinho do trio.

### Named Rules

**The Paper On The Table Rule.** Sombra só existe onde papel encontra o azul, e é sempre difusa e deslocada para baixo. Nada dentro da ficha é elevado; o painel, que já é papel, é totalmente plano.

## Shapes

Formas de impresso: retângulos quase retos. A ficha e o cartão de vinho têm canto de 3px; botões, 2px; campos de texto, caixas de marcação, quadrinhos de progresso e controles do painel têm canto zero. O único círculo do sistema é o carimbo (e as bolinhas de 9px que repetem a cor do perfil no painel).

Linhas são a linguagem estrutural: pauta de 1px para separar itens, fio de tinta de 1.5px para abrir o cabeçalho e fechar o preço, sublinhado de 2px nos campos de texto. A ficha leva uma moldura interna de 1px na cor de pauta, recuada da borda.

## Components

### Buttons
Sóbrios e firmes, como botões de balcão.
- **Shape:** canto quase reto (2px), altura 56px, padding horizontal 24px, borda de 1.5px.
- **Cheio (ink):** azul da marca com texto branco; hover passa para navy-raised. É a ação principal de cada ficha (começar, reservar pelo WhatsApp).
- **Contorno (line):** borda de tinta sobre papel; hover preenche de tinta e inverte o texto. Ação secundária dentro da ficha (Como chegar).
- **Papel (paper):** botão branco sobre o campo azul, para a ação seguinte fora da ficha (Ver outro trio).
- **Fantasma (ghost):** borda branca a 60% sobre o azul; hover acende a borda e dá um véu branco de 8%. Ações terciárias (compartilhar, refazer).
- **Transição:** cor, fundo e borda em 160ms com ease-out (cubic-bezier(0.16, 1, 0.3, 1)). Desabilitado: opacidade 0.55.
- **Link:** texto ink-2 sublinhado (1px, offset 4px), 14px, altura mínima 44px, para escapes discretos ("Tenho menos de 18").

### Inputs / Fields
- **Style:** campo pautado: sem caixa, só um sublinhado de tinta de 2px, texto Archivo 500 a 20px, altura 56px. Rótulo acima em Label.
- **Focus:** o sublinhado engrossa (sombra de 2px abaixo) e o foco por teclado ganha contorno de tinta de 2px com recuo de 4px.
- **Error:** sublinhado e mensagem em vermelho escuro (error), mensagem em 14px/600.
- **Painel:** controles de 44px com borda de pauta nos lados e sublinhado de tinta de 2px, canto zero.

### Opção de resposta (assinatura)
Linha pautada de 60px com três colunas: número do campo (13px, condensado, ink-2), caixa de marcação quadrada de 26px com borda de tinta de 1.5px, e o texto a 17px. Hover pinta a linha com o tom hover. Ao marcar, a linha inteira vira tinta com texto branco e o visto é desenhado dentro da caixa (traço SVG de 2.8px, 170ms), e a ficha avança: o conteúdo sai subindo 8px em 280ms (ease-in) e o próximo entra subindo em 380ms (ease-out).

### Progresso
Cinco quadradinhos de 13px no cabeçalho da ficha: vazios com borda ink-2, preenchidos de tinta quando respondidos, e o atual com borda de 2px e miolo de pauta. Ao lado, "3 DE 5" em Label com algarismos tabulares. Voltar fica à esquerda, com seta em traço SVG.

### Cards / Containers
- **Ficha (sheet):** papel, canto de 3px, sombra de folha pousada, moldura interna de pauta. Padding 18/20/28px no celular, 22/40/40px a partir de 640px. Abre com um fio de tinta de 1.5px (ou com o cabeçalho de progresso) e pode fechar com um colofão: linha em Label 11px separada por pauta, que identifica o impresso ("Ficha de paladar · Match do Vinho").
- **Cartão de vinho:** papel, canto de 3px, sombra de cartão pousado. Faixa superior com o nome da posição (O SEGURO, A DESCOBERTA, A SURPRESA) fechada por fio de tinta; prato cinza azulado de 250px com a garrafa apoiada numa faixa de chão; corpo com nome em Caslon, origem em 14px e campos em lista de definição pautada; rodapé de preço fechado por fio de tinta, valor a 19px/600 tabular. Os cartões entram em cascata (120ms entre eles).

### Carimbo (assinatura)
Selo circular em SVG, 92px no celular e 128px a partir de 640px, na cor do perfil: dois anéis, texto circular "ARMAZÉM DOS IMPORTADOS · MATCH 3" em Archivo 600, e um visto no centro. Flutua à direita do nome do perfil, girado -12 graus, e entra com um leve "bater" (escala 1.35 para 1 em 420ms, com atraso de 420ms).

### A ficha que vira trio (coreografia assinatura)
Continuidade física do começo ao fim, feita com a View Transitions API. O tipo de transição fica em `html[data-vt]` e só os elementos daquele momento recebem `view-transition-name`.
- **Resposta (`step`):** a caixa marcada voa da linha da opção até o quadradinho do progresso em 560ms. O cabeçalho fica parado. A pergunta sai subindo em 280ms e a próxima entra subindo em 380ms.
- **Última resposta (`final`):** os quatro quadradinhos do progresso e a caixa da P5 descem para a ficha completa e formam uma fila de cinco vistos, em cascata de 30ms. Na ficha, os vistos se juntam no centro e desaparecem, o carimbo aparece no lugar deles e as três garrafas do trio sobem do prato no pé da ficha.
- **Revelação (`reveal`):** a ficha completa vira a ficha do perfil. O carimbo viaja até o lado do nome com um "bater" de escala (1 para 1.14 para 1). Cada garrafa voa até o prato do seu cartão, em cascata de 70ms.
- **Sem suporte a View Transitions, ou com movimento reduzido:** vale a sequência de fades documentada acima. Um momento só: nenhuma outra transição compete com essa.

### Navigation
Não há menu. A navegação é o próprio fluxo da ficha: Voltar no cabeçalho da pergunta e o bloco de ações ao final do resultado. No painel, a faixa azul superior leva logo, título em Caslon 28px e contagem em 14px on-navy-2.

### Livro-razão (painel)
Tabela de 14px, cabeçalhos em Label sobre fio de tinta de 1.5px e fixos no topo, linhas separadas por pauta com hover no tom hover. E-mail em 600, nome dos vinhos em Caslon Text 15px, metadados em 12.5px ink-2 tabulares. Acima, a contagem por perfil: bolinha na cor do perfil, nome em 13px e número em 20px/600, fechada por fio de tinta.

## Do's and Don'ts

### Do:
- **Do** usar o azul #00273c como campo inteiro de fundo no quiz e como tinta de todo texto sobre papel.
- **Do** apoiar todo conteúdo principal do quiz em fichas brancas com moldura interna de 1px e sombra de folha pousada.
- **Do** separar itens com pauta de 1px (#c7d3dc) e abrir ou fechar blocos com fio de tinta de 1.5px.
- **Do** manter caixas de marcação, campos e controles com canto zero; ficha e cartão com 3px; botões com 2px.
- **Do** escrever rótulos em Archivo condensado (largura 78%), 11 a 13px, caixa alta, 0.14em, e títulos em Caslon Display peso 400.
- **Do** usar algarismos tabulares em preço, temperatura, progresso e datas.
- **Do** manter alvos de toque com no mínimo 44px, e 56px para botão e campo principais.
- **Do** usar ease-out cubic-bezier(0.16, 1, 0.3, 1) para entradas e ease-in cubic-bezier(0.55, 0, 1, 0.45) para saídas, com deslocamento de 8px; reduzir para fade de 120ms com prefers-reduced-motion.

### Don't:
- **Don't** usar preto, cinza neutro ou creme; toda tinta é azul da marca e todo papel é branco puro.
- **Don't** usar cores de perfil antes do resultado, em texto corrido, botões ou fundos.
- **Don't** usar vermelho promocional, selos, preço riscado, contagem regressiva ou confete; o vermelho escuro é exclusivo de erro de campo.
- **Don't** usar cards coloridos por opção ou barra de progresso contínua; progresso são quadradinhos de formulário.
- **Don't** colocar rótulo em caixa alta acima de títulos como sobretítulo; caixa alta nomeia campo, coluna ou colofão, nunca anuncia uma seção.
- **Don't** elevar nada dentro do papel nem usar sombras duras deslocadas; sombra só entre papel e azul.
- **Don't** usar travessão ou meia-risca em texto visível.
