# Product

<!-- impeccable:product-schema 1 -->

> Fonte de verdade detalhada: `match-do-vinho-spec.md` (perguntas, pesos, perfis, rótulos, textos, lógica, config). Este arquivo registra só a verdade de produto durável.

## Platform

web

## Stack

Vite + React 18 + TypeScript (SPA: quiz em `/`, painel em `/painel`), com funções serverless da Vercel em `api/` (spec, seções 1 e 14). Banco de dados não SQL: arquivo JSON local (`.data/leads.json`) em desenvolvimento e Vercel Blob em produção (criado por API, sem passo manual), atrás de uma interface única; cópia automática a cada 30 min no branch `dados` do repositório `agenciatweed/armazem-match-vinhos` via GitHub Actions. CSS Modules ou CSS puro com custom properties, sem Tailwind. Animação só com CSS transitions ou `motion`. Vitest para pontuação, seleção e API. Fontes via Google Fonts. Deploy: GitHub + Vercel.

## Users

Dois públicos com o mesmo peso nas decisões:

- **Consumidor final**, em geral leigo em vinho, no celular, chegando pelo Instagram. Quer descobrir, em cerca de 60 segundos e sem vocabulário técnico, que vinhos combinam com ele. Uso secundário: tablet no balcão da loja (`?modo=loja`).
- **O cliente (Armazém dos Importados)**, que vai avaliar a demo numa apresentação. Precisa ver a mecânica completa funcionando como se já estivesse no ar, com resultados reprodutíveis.
- **A equipe da loja**, que consulta no painel `/painel` quem fez o quiz (e-mail), o perfil atribuído e os vinhos apresentados, para atender e dar sequência no balcão ou por e-mail.

## Product Purpose

"Match do Vinho": quiz de 5 perguntas sobre gostos do dia a dia (café, fruta, jantar, sobremesa, sábado) que entrega um perfil de paladar entre 5 e um trio de vinhos (MATCH 3: O SEGURO, A DESCOBERTA, A SURPRESA; sempre um tinto, um branco e um adicional) do acervo real da loja. Sucesso é converter curiosidade em deslocamento: a pessoa vai ao Armazém buscar o trio escolhido para ela, com 20% de desconto no MATCH 3, e prova em casa. A mensagem é "venha buscar o seu trio", não "venha conhecer a loja". Sucesso secundário: a loja passa a ter uma lista de e-mails com o paladar de cada pessoa.

Esta entrega é uma demo navegável em URL pública, não o site definitivo: sem login nem e-commerce. O único dado pessoal coletado é o e-mail.

## Positioning

Curadoria de uma loja física real com mais de 25 anos: os 83 rótulos saem do estoque do Armazém (incluindo linhas da Enoteca Decanter), e o fechamento é presencial: "mostre esta tela no balcão", com a condição do MATCH 3 e a equipe sabendo, pelo painel, qual é o seu perfil. Um quiz genérico de vinho não tem estoque, balcão nem equipe por trás.

## Operating Context

- Tráfego principalmente mobile, vindo de posts e stories do Instagram.
- Tablet na loja em modo balcão, com retorno automático à intro após inatividade.
- Apresentação ao cliente: mesmas respostas sempre geram o mesmo trio; link `?m=` reproduz o resultado.
- A lógica do quiz roda no navegador; sessão em `sessionStorage` por aba. Ao concluir, o registro (e-mail, perfil, trios) vai para o backend; o servidor recalcula perfil e trio a partir das respostas.
- Equipe da loja consulta `/painel` (sem senha na fase de demo), filtra e baixa CSV.

## Capabilities and Constraints

- 5 perguntas fixas, 5 opções cada, ordem fixa; eixo oculto de "corpo" escolhe o tinto dentro do perfil.
- 5 perfis: Fresco & Cítrico, Floral & Aromático, Frutado & Macio, Seco & Elegante, Fora da Curva.
- E-mail obrigatório antes de começar (junto da confirmação 18+), com nota de uso. Nenhum outro dado pessoal.
- Cada quiz concluído gera um registro; "ver outro trio" acrescenta trios ao mesmo registro. Link compartilhado não gera registro.
- Gravação nunca bloqueia o resultado: se a API falhar, o quiz segue.
- "Ver outro trio", compartilhar (Web Share API ou copiar link), refazer o quiz, confirmação 18+.
- MATCH 3 com 20% de desconto na loja; sem preço riscado.
- WhatsApp da loja: 5551997647911 (botão "Reservar pelo WhatsApp").
- A loja **não** abre garrafas para prova: nenhum texto pode prometer degustação.
- Garrafas genéricas por tipo (6 imagens), nunca com nome de rótulo na imagem; fallback em SVG.
- Todo texto visível em pt-BR, curto, caloroso; sem jargão nas perguntas; termos técnicos no resultado só quando inevitáveis e explicados.
- Proibido travessão (—) e meia-risca (–) em texto visível.
- Proibido enquadramento de "novidade" e qualquer linguagem de supermercado (selos, "OFERTA!", vermelho promocional, preço riscado, contagem regressiva, confete).
- Endereço sempre "Rua Anita Garibaldi, 448, Mont'Serrat, Porto Alegre", sem emoji de pin.
- Rodapé legal em todas as telas: "Aprecie com moderação. Venda proibida para menores de 18 anos."
- `noindex` enquanto for demo.

**Decididos em 26/09/2026:** sem degustação na loja; desconto do trio de 20%; WhatsApp 5551997647911; captura de e-mail; painel sem senha durante a demo.

**Pendências antes de ir ao ar (fora da demo):**
- Proteger o painel `/painel` com senha ou autenticação (hoje qualquer pessoa com o endereço vê os e-mails).
- Política de privacidade e base legal da LGPD para o uso do e-mail (a nota da Intro diz só "guardar seu match e falar com você sobre ele").
- Manter o repositório privado: o branch `dados` guarda os e-mails.

## Brand Commitments

- Nome: Armazém dos Importados, empório de vinhos e delicatessen em Porto Alegre, mais de 25 anos.
- Logotipo oficial: `Logo-Armazém-Branco-Curvas.svg` (versão branca).
- Cores oficiais da marca: azul `#00273c` e branco `#ffffff`. Não há manual, fontes oficiais nem outro material de marca.
- Voz: fala de uso (ocasião, harmonização, temperatura de serviço), não de safra, denominação ou método de produção.
- Registro sóbrio e editorial, nunca promocional (restrição de marca da spec, seção 2).

## Evidence on Hand

- Dados reais: 83 rótulos com país, uva, preço de referência, "por que dá match", "sirva com" e temperatura (spec, seção 11), selecionados de um catálogo de 1.313 itens.
- Fatos da loja: cerca de 1.500 rótulos, ~600 importados pela Enoteca Decanter; endereço acima.
- Matches registrados (e-mail, perfil, trios) passam a existir a partir do deploy, no banco; nunca versionar `.data/` no Git.
- Ausentes, não inventar: depoimentos, avaliações, números de clientes, prêmios, fotos reais da loja ou das garrafas com rótulo.

## Product Principles

1. **Sobre você, não sobre vinho.** Nenhuma pergunta exige conhecimento; a mecânica fica escondida.
2. **O fim é o balcão.** Cada tela empurra para buscar o trio na loja, não para comprar online nem para "conhecer a loja". Nunca prometer degustação.
3. **Curadoria, não promoção.** O resultado deve soar como recomendação de quem entende, nunca como oferta.
4. **Reprodutível e honesto.** Mesmas respostas, mesmo trio; derivado sempre de respostas + rotação. Só o e-mail é pedido, sempre com o motivo, e o registro guarda exatamente o que a pessoa viu.
5. **Uso antes de técnica.** Por que dá match, com o que servir, a que temperatura.

## Accessibility & Inclusion

- Contraste AA em todo texto; alvos de toque de no mínimo 44x44px (opções do quiz com 56px).
- Teclas 1 a 5 escolhem, Backspace volta; foco vai para o título da pergunta com `aria-live="polite"`.
- `prefers-reduced-motion` respeitado (fades de 120ms, sem deslocamento, interstício de 500ms).
- Campo de e-mail com `label` visível, erro via `aria-describedby`/`aria-live`, alvo de 56px.
- Um único `<h1>` por tela; `lang="pt-BR"`; garrafas decorativas com `alt=""`.
- Metas Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
