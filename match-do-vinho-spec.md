# Match do Vinho · Armazém dos Importados
## Especificação para o Claude Code: demo funcional do quiz "Descubra seu match em 60 segundos"

> **Para o Claude Code:** este documento é a fonte única de verdade. Construa o site exatamente como descrito aqui. Todo o conteúdo (perguntas, pesos, perfis, rótulos e textos) já está definido abaixo e deve ser copiado literalmente para os arquivos de dados. Quando algo não estiver especificado, escolha a opção mais simples que respeite as regras de marca da seção 2. Ao terminar, rode o checklist da seção 16.

> **Revisão de 26/09/2026:** (1) removida a promessa de abrir uma garrafa para prova; (2) desconto do MATCH 3 definido em 20%; (3) WhatsApp da loja definido; (4) captura de e-mail antes do quiz; (5) registro de cada match em banco de dados próprio; (6) painel da loja em `/painel`. **Revisão 2:** banco em produção trocado de Upstash Redis para Vercel Blob (sem instalação manual) com cópia automática no branch `dados` do Git. Seções afetadas: 0, 1, 2, 3, 6.5, 7, 9, 12, 13, 14 (nova), 15 e 16.

---

## 0. Contexto

**Cliente:** Armazém dos Importados, empório de vinhos e delicatessen com mais de 25 anos em Porto Alegre, hoje na Rua Anita Garibaldi, 448, Mont'Serrat. Trabalha com cerca de 1.500 rótulos, dos quais ~600 importados pela Enoteca Decanter (todos os vinhos da Decanter também estão à venda no Armazém).

**Campanha:** "Match do Vinho". O consumidor responde 5 perguntas divertidas, sem nenhum termo técnico de vinho, recebe um perfil de paladar e um trio de vinhos (MATCH 3) montado para ele. O trio sempre tem **um tinto, um branco e um adicional** (espumante, rosé, laranja, fortificado ou outro branco/tinto), distribuídos em três faixas:

- **O SEGURO:** perto do que a pessoa já conhece.
- **A DESCOBERTA:** um passo além.
- **A SURPRESA:** algo que ela provavelmente não escolheria sozinha.

O fechamento converte a curiosidade em deslocamento até a loja: *"Quer descobrir se acertamos? Prove seu match no Armazém."* A mensagem não é "venha conhecer a loja", é "venha buscar os vinhos que selecionamos para você". **A loja não abre garrafas para prova:** "provar" aqui é levar o trio e descobrir em casa se acertamos. Nenhum texto pode prometer degustação no balcão.

**Objetivo desta entrega:** uma demo navegável, publicada em URL pública (GitHub + Vercel), para apresentar ao cliente a mecânica completa. Não é o site definitivo da campanha: não há login nem e-commerce. Há um backend mínimo (funções serverless da Vercel) que registra **e-mail, perfil e trio apresentado** de cada pessoa que conclui o quiz, e um **painel da loja** em `/painel`, sem senha nesta fase de demonstração (seção 14).

---

## 1. Stack e estrutura

- **Vite + React 18 + TypeScript**, SPA (quiz em `/`, painel em `/painel`).
- **Backend:** funções serverless da Vercel em `api/` (TypeScript, runtime Node). Sem framework de servidor.
- **Banco de dados:** interface única `LeadStore` com dois adaptadores (seção 14.1): arquivo JSON local (`.data/leads.json`) em desenvolvimento e **Vercel Blob** (armazenamento nativo da Vercel, criado e conectado por API no deploy, sem instalação manual) em produção. Não é SQL. O adaptador é escolhido pela presença de `BLOB_READ_WRITE_TOKEN`, que a própria Vercel injeta ao conectar o store; sem ela o app roda localmente sem configuração nenhuma.
- **Cópia no Git:** um workflow do GitHub Actions (`.github/workflows/backup-matches.yml`) exporta os matches a cada 30 minutos para o branch `dados` do repositório (`data/matches.json` e `data/matches.csv`), usando o `GITHUB_TOKEN` automático do Actions. Nenhuma chave precisa ser criada à mão (seção 14.7).
- Desenvolvimento local: `npm run dev` sobe o Vite com um plugin de dev (`server/vite-api-plugin.ts`) que monta os mesmos handlers de `api/` em `/api/*`, usando o adaptador de arquivo. Não depende de `vercel dev`.
- Estilo com **CSS Modules ou CSS puro com custom properties** (não usar Tailwind para manter o CSS legível pelo time de design; se preferir Tailwind, mapeie os tokens da seção 8 no `tailwind.config`).
- Animações: CSS transitions controladas por estado **ou** a lib `motion` (`AnimatePresence mode="wait"`). Nada além disso.
- Testes: **Vitest** para a lógica de pontuação e seleção (seção 6).
- Fontes via Google Fonts (seção 8).
- Node 20+. Gerenciador: npm.

```
match-do-vinho/
├─ public/
│  ├─ bottles/            # 6 imagens geradas no Magnific (seção 10)
│  │  ├─ tinto.webp
│  │  ├─ branco.webp
│  │  ├─ rose.webp
│  │  ├─ laranja.webp
│  │  ├─ espumante.webp
│  │  └─ porto.webp
│  ├─ og-image.jpg        # 1200x630, gerado a partir da tela inicial
│  └─ favicon.svg
├─ src/
│  ├─ data/
│  │  ├─ questions.ts     # seção 4
│  │  ├─ profiles.ts      # seção 5
│  │  ├─ wines.ts         # seção 11 (dados copiados literalmente do JSON)
│  │  └─ config.ts        # seção 13
│  ├─ lib/
│  │  ├─ scoring.ts       # computeProfile()
│  │  ├─ selection.ts     # selectTrio()
│  │  ├─ hash.ts          # fnv1a()
│  │  ├─ session.ts       # sessionStorage + querystring
│  │  ├─ leads.ts         # cliente HTTP: saveLead(), appendTrio()
│  │  ├─ email.ts         # isValidEmail(), normalizeEmail()
│  │  └─ __tests__/scoring.test.ts
│  ├─ admin/
│  │  ├─ AdminPage.tsx    # painel da loja (seção 14.5)
│  │  └─ admin.module.css
│  ├─ components/
│  │  ├─ Intro.tsx        # e-mail + confirmação 18+
│  │  ├─ Question.tsx
│  │  ├─ Progress.tsx
│  │  ├─ Loading.tsx
│  │  ├─ Result.tsx
│  │  ├─ WineCard.tsx
│  │  └─ Bottle.tsx       # <img> com fallback SVG
│  ├─ App.tsx             # máquina de estados das telas
│  ├─ main.tsx            # roteia "/painel" → AdminPage, resto → App
│  └─ styles/
│     ├─ tokens.css
│     └─ global.css
├─ api/
│  ├─ leads.ts            # POST (cria), GET (lista para o painel)
│  └─ leads/[id].ts       # PATCH (acrescenta trio visto)
├─ server/
│  ├─ store.ts            # interface LeadStore + getStore()
│  ├─ store-file.ts       # adaptador JSON local (.data/leads.json)
│  ├─ store-blob.ts       # adaptador Vercel Blob
│  ├─ validate.ts         # validação do payload contra wines.json e profiles.ts
│  ├─ vite-api-plugin.ts  # monta api/ no dev server do Vite
│  └─ __tests__/leads.test.ts
├─ .data/                 # criado em runtime no dev; no .gitignore
├─ index.html
├─ vercel.json
├─ package.json
└─ README.md
```

---

## 2. Regras de marca e de texto (obrigatórias)

1. Todo texto visível em **português do Brasil**, registro curto, caloroso e humano. Nada de jargão técnico de vinho nas perguntas; no resultado, termos técnicos só quando inevitáveis e sempre explicados de forma simples.
2. **Não usar travessão (—) nem meia-risca (–) em nenhum texto visível.** Use vírgula, dois-pontos ou ponto.
3. Não usar enquadramento de "novidade" ("novo", "chegou", "lançamento").
4. O Armazém fala de **uso**: ocasião, harmonização, serviço (temperatura). Por isso cada vinho no resultado mostra "por que dá match", "sirva com" e temperatura. Não escrever sobre safra, denominação ou método de produção além do que já está no JSON.
5. Estética sóbria e editorial. **Proibido** qualquer linguagem visual de supermercado: selos estourados, "OFERTA!", vermelho promocional, preço riscado gigante, contagem regressiva, confete.
6. Endereço sempre como: **Rua Anita Garibaldi, 448, Mont'Serrat, Porto Alegre**. Sem emoji de pin.
7. Rodapé legal fixo em todas as telas: **"Aprecie com moderação. Venda proibida para menores de 18 anos."**
8. Não copiar o texto de nenhum outro site. Todo o texto está neste documento.
9. **Nunca prometer degustação ou garrafa aberta na loja.** O convite é para buscar o trio, com a condição do MATCH 3.
10. O pedido de e-mail vem sempre acompanhado da nota de uso (seção 3.1). Não pedir nenhum outro dado pessoal (nome, telefone, data de nascimento).

---

## 3. Fluxo de telas

```
[Intro: e-mail + confirmação 18+] → [P1] → [P2] → [P3] → [P4] → [P5] → [Montando seu trio + registro] → [Resultado]
                                        ↑______ botão "voltar" em P2..P5 ______|

[/painel] → lista de matches registrados (equipe da loja, seção 14.5)
```

`App.tsx` controla `screen: 'intro' | 'question' | 'loading' | 'result'` e `step: 0..4`. O quiz **não começa** sem e-mail válido e confirmação 18+.

### 3.1 Intro
- Sobrelinha pequena: `ARMAZÉM DOS IMPORTADOS`
- Título: **Descubra seu match em 60 segundos**
- Subtítulo: *Cinco perguntas sobre você. Nenhuma sobre vinho. No final, três garrafas escolhidas para o seu paladar.*
- **Campo de e-mail** (primeiro elemento interativo da tela):
  - `<label>` visível: **"Seu e-mail"**. `<input type="email" autocomplete="email" inputmode="email" required>`, altura mínima 56px, placeholder `voce@email.com`.
  - Nota abaixo do campo (Inter 13px, `--ink-2`): *"Usamos seu e-mail só para guardar seu match e falar com você sobre ele. Nada de spam."*
  - Validação no cliente com `isValidEmail()` (formato `algo@dominio.tld`, sem espaços, até 254 caracteres). Normalizar com `trim()` e caixa baixa antes de gravar.
  - Erro só depois de tentar avançar ou ao sair do campo com conteúdo inválido: *"Confere o e-mail? Parece que falta alguma coisa."*, ligado ao campo por `aria-describedby`, com `aria-invalid="true"`.
  - `Enter` no campo equivale a clicar no botão principal.
- Confirmação etária: botão principal **"Tenho 18 anos ou mais, vamos lá"**, que valida o e-mail e, se estiver ok, grava e-mail + `ageConfirmed` e inicia a P1. Link discreto abaixo: "Tenho menos de 18" → substitui o conteúdo por "Volte quando fizer 18. A gente guarda uma taça para você." (sem avançar e sem gravar o e-mail).
- Ao confirmar, gravar `email` e `ageConfirmed: true` na sessão (seção 7) para não perguntar de novo na mesma aba. Se já existirem na sessão (por exemplo, depois de "Refazer o quiz"), a Intro mostra o e-mail preenchido com o link **"Não é você? Trocar e-mail"**, que limpa o campo.
- O e-mail **não é enviado ao servidor nesta tela**; ele só é gravado no banco junto com o resultado (seção 14), para que o registro sempre corresponda a um quiz concluído.

### 3.2 Pergunta (uma por tela)
- Topo: indicador de progresso com 5 segmentos + texto "1 de 5".
- Pergunta centralizada, tipografia display grande.
- As 5 opções logo abaixo, empilhadas (mobile) ou em coluna única de até 560px (desktop). Cada opção é um `<button>` grande (altura mínima 56px) com um índice discreto (1 a 5) à esquerda e o texto da resposta.
- **Interação:**
  1. Toque/clique na opção → a opção recebe estado selecionado (fundo preenchido) por **180ms**.
  2. O bloco inteiro (pergunta + opções) faz **fade out** em **280ms** (`opacity 1→0`, `translateY 0→-8px`, `ease-in`).
  3. Troca o conteúdo para a próxima pergunta.
  4. O novo bloco faz **fade in** em **380ms** (`opacity 0→1`, `translateY 8px→0`, `ease-out`).
  5. Durante a transição, cliques ficam bloqueados (evita resposta dupla).
- Botão "voltar" (texto pequeno, canto superior esquerdo) a partir da P2: faz a mesma transição para a pergunta anterior, com a resposta dada anteriormente já destacada. Escolher outra opção sobrescreve.
- Teclado: teclas `1` a `5` escolhem a opção; `Backspace` volta. Após cada transição, mover o foco para o título da pergunta (`tabIndex={-1}`) e anunciar via `aria-live="polite"`.
- `prefers-reduced-motion: reduce` → sem deslocamento, fades de 120ms.

### 3.3 Montando seu trio (interstício)
- Após a P5, tela de ~1.400ms com fade in/out: texto **"Montando seu trio..."** e uma linha fina animada (não usar spinner genérico). É teatro de produto: dá a sensação de curadoria. Não pular, exceto com `prefers-reduced-motion` (reduzir para 500ms).
- **Durante o interstício**, disparar `saveLead()` (seção 14.4) com e-mail e respostas; o servidor recalcula e grava perfil e trio. O resultado aparece ao fim do tempo mínimo **sem esperar** a resposta do servidor: a gravação nunca bloqueia nem quebra a experiência. Se falhar, tentar de novo uma vez após 3s; se falhar de novo, seguir silenciosamente (registrar `console.warn`) e guardar o payload pendente na sessão para reenviar na próxima ação do usuário na tela de resultado.

### 3.4 Resultado
Ordem vertical:

1. Sobrelinha: `SEU PERFIL`
2. Frase: "Você é" + **nome do perfil** em display grande, na cor de destaque do perfil.
3. Tagline do perfil (itálico) e descrição curta (seção 5).
4. Título de seção: **MATCH 3** · subtítulo "o trio do seu paladar" · texto: *"Montamos três vinhos que têm tudo para dar match com você."*
5. **Três cards** (seção 9.1), na ordem O SEGURO, A DESCOBERTA, A SURPRESA. Desktop: 3 colunas. Mobile: empilhados, com leve entrada escalonada (fade in de 380ms com 120ms de atraso entre cards).
6. Bloco de condição do trio (seção 9.2).
7. Bloco de convite à loja (seção 9.3).
8. Ações: **"Ver outro trio"** (seção 6.5), **"Compartilhar meu match"** (Web Share API; fallback: copiar link), **"Refazer o quiz"** (limpa respostas, rotação e `leadId`, mantém e-mail e 18+, e volta à Intro com o e-mail preenchido). Cada quiz concluído gera um **novo registro** no banco, mesmo com o mesmo e-mail.

---

## 4. As 5 perguntas

Princípios de desenho:
- Nenhuma pergunta menciona vinho, uva, acidez, tanino, corpo ou qualquer termo técnico.
- Cada pergunta tem **5 opções**, e em cada pergunta **cada um dos 5 perfis é a resposta principal de exatamente uma opção** (3 pontos). Algumas opções dão 1 ponto secundário a um perfil vizinho. Isso garante equilíbrio: numa simulação de todas as 3.125 combinações possíveis, cada perfil sai entre 17% e 23% das vezes.
- Além dos perfis, existe um **eixo oculto de "corpo"** (0 a 9 pontos) alimentado por respostas como café forte, chocolate amargo e costela. Ele não muda o perfil: muda **qual tinto** aparece dentro do perfil (leve, médio ou estruturado). Assim, quem ama churrasco e cai em "Fresco & Cítrico" recebe um tinto com mais corpo, sem precisarmos de um sexto perfil.
- A pergunta sobre "sabores que você prefere" da ideia original foi descartada de propósito: era direta demais e entregaria a mecânica.

### Tabela de perguntas e pesos

Chaves de perfil: `fresco`, `floral`, `frutado`, `elegante`, `curva`. `corpo` é o eixo oculto.

| # | Pergunta | Opção | Texto exibido | Pontos |
|---|---|---|---|---|
| 1 | **Seu café ideal é...** | a | Espresso curto, sem açúcar | elegante 3, corpo 2 |
| | | b | Espresso tônica com limão | fresco 3, curva 1 |
| | | c | Cappuccino com canela | floral 3, frutado 1 |
| | | d | Com leite e um docinho do lado | frutado 3 |
| | | e | Um método que ninguém na mesa conhece | curva 3, elegante 1 |
| 2 | **Na fruteira, qual some primeiro?** | a | Bergamota | fresco 3, floral 1 |
| | | b | Lichia | floral 3 |
| | | c | Morango | frutado 3 |
| | | d | Maçã verde | elegante 3, fresco 1 |
| | | e | Figo fresco | curva 3, frutado 1, corpo 1 |
| 3 | **Hoje à noite, o jantar perfeito seria...** | a | Sushi no balcão | fresco 3, elegante 1 |
| | | b | Um curry tailandês bem perfumado | floral 3, curva 1 |
| | | c | Massa ao sugo com muito queijo | frutado 3, corpo 1 |
| | | d | Costela no fogo de chão | elegante 2, frutado 1, corpo 3 |
| | | e | A cozinha de um país que você nunca visitou | curva 3 |
| 4 | **A sobremesa que você pediria sem olhar o cardápio:** | a | Torta de limão | fresco 3 |
| | | b | Algo com flor de laranjeira ou água de rosas | floral 3 |
| | | c | Pavlova de frutas vermelhas | frutado 3 |
| | | d | Um quadradinho de chocolate 70% | elegante 3, corpo 2 |
| | | e | Doce? Prefiro queijo com mel e pimenta | curva 3, corpo 1 |
| 5 | **Sábado livre. O plano é...** | a | Piscina e mais nada | fresco 3, frutado 1 |
| | | b | Passear sem pressa por um jardim | floral 3 |
| | | c | Um brunch que vira almoço | frutado 3, floral 1 |
| | | d | Jantar com reserva num lugar que você adora | elegante 3, corpo 1 |
| | | e | Ir a um lugar onde você ainda não esteve | curva 3, fresco 1 |

### `src/data/questions.ts`

```ts
export type ProfileId = 'fresco' | 'floral' | 'frutado' | 'elegante' | 'curva';
export type OptionKey = 'a' | 'b' | 'c' | 'd' | 'e';
export type Weights = Partial<Record<ProfileId | 'corpo', number>>;

export interface Option { key: OptionKey; label: string; weights: Weights; }
export interface Question { id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5'; title: string; options: Option[]; }

export const QUESTIONS: Question[] = [
  { id: 'q1', title: 'Seu café ideal é...', options: [
    { key: 'a', label: 'Espresso curto, sem açúcar', weights: { elegante: 3, corpo: 2 } },
    { key: 'b', label: 'Espresso tônica com limão', weights: { fresco: 3, curva: 1 } },
    { key: 'c', label: 'Cappuccino com canela', weights: { floral: 3, frutado: 1 } },
    { key: 'd', label: 'Com leite e um docinho do lado', weights: { frutado: 3 } },
    { key: 'e', label: 'Um método que ninguém na mesa conhece', weights: { curva: 3, elegante: 1 } },
  ]},
  { id: 'q2', title: 'Na fruteira, qual some primeiro?', options: [
    { key: 'a', label: 'Bergamota', weights: { fresco: 3, floral: 1 } },
    { key: 'b', label: 'Lichia', weights: { floral: 3 } },
    { key: 'c', label: 'Morango', weights: { frutado: 3 } },
    { key: 'd', label: 'Maçã verde', weights: { elegante: 3, fresco: 1 } },
    { key: 'e', label: 'Figo fresco', weights: { curva: 3, frutado: 1, corpo: 1 } },
  ]},
  { id: 'q3', title: 'Hoje à noite, o jantar perfeito seria...', options: [
    { key: 'a', label: 'Sushi no balcão', weights: { fresco: 3, elegante: 1 } },
    { key: 'b', label: 'Um curry tailandês bem perfumado', weights: { floral: 3, curva: 1 } },
    { key: 'c', label: 'Massa ao sugo com muito queijo', weights: { frutado: 3, corpo: 1 } },
    { key: 'd', label: 'Costela no fogo de chão', weights: { elegante: 2, frutado: 1, corpo: 3 } },
    { key: 'e', label: 'A cozinha de um país que você nunca visitou', weights: { curva: 3 } },
  ]},
  { id: 'q4', title: 'A sobremesa que você pediria sem olhar o cardápio:', options: [
    { key: 'a', label: 'Torta de limão', weights: { fresco: 3 } },
    { key: 'b', label: 'Algo com flor de laranjeira ou água de rosas', weights: { floral: 3 } },
    { key: 'c', label: 'Pavlova de frutas vermelhas', weights: { frutado: 3 } },
    { key: 'd', label: 'Um quadradinho de chocolate 70%', weights: { elegante: 3, corpo: 2 } },
    { key: 'e', label: 'Doce? Prefiro queijo com mel e pimenta', weights: { curva: 3, corpo: 1 } },
  ]},
  { id: 'q5', title: 'Sábado livre. O plano é...', options: [
    { key: 'a', label: 'Piscina e mais nada', weights: { fresco: 3, frutado: 1 } },
    { key: 'b', label: 'Passear sem pressa por um jardim', weights: { floral: 3 } },
    { key: 'c', label: 'Um brunch que vira almoço', weights: { frutado: 3, floral: 1 } },
    { key: 'd', label: 'Jantar com reserva num lugar que você adora', weights: { elegante: 3, corpo: 1 } },
    { key: 'e', label: 'Ir a um lugar onde você ainda não esteve', weights: { curva: 3, fresco: 1 } },
  ]},
];
```

> A ordem de exibição das opções é a da tabela (fixa, não embaralhar), para que o resultado seja reprodutível na apresentação ao cliente.

---

## 5. Os 5 perfis

### `src/data/profiles.ts`

```ts
import type { ProfileId } from './questions';

export type Slot = 'tinto' | 'branco' | 'adicional';
export type Tier = 'seguro' | 'descoberta' | 'surpresa';

export interface Profile {
  id: ProfileId;
  name: string;          // exibido em caixa alta
  tagline: string;
  description: string;
  accent: string;        // cor de destaque do perfil
  tiers: Record<Tier, Slot>; // qual slot ocupa cada faixa (antes da regra de corpo)
}

export const PROFILES: Record<ProfileId, Profile> = {
  fresco: {
    id: 'fresco',
    name: 'Fresco & Cítrico',
    tagline: 'Sua taça gosta de acidez, leveza e frescor.',
    description: 'Você pede limão na água, prefere o mar ao sofá e acha que o primeiro gole tem que acordar. Seus vinhos têm energia, leveza e aquele frescor que chama o segundo gole.',
    accent: '#2F6B5E',
    tiers: { seguro: 'branco', descoberta: 'adicional', surpresa: 'tinto' },
  },
  floral: {
    id: 'floral',
    name: 'Floral & Aromático',
    tagline: 'Você gosta de vinho que chega primeiro pelo nariz.',
    description: 'Para você, o perfume é metade da experiência. Flores, frutas cheirosas, especiarias: você gosta de vinho que se apresenta antes mesmo do primeiro gole.',
    accent: '#7A4E7E',
    tiers: { seguro: 'branco', descoberta: 'adicional', surpresa: 'tinto' },
  },
  frutado: {
    id: 'frutado',
    name: 'Frutado & Macio',
    tagline: 'Você prefere vinhos fáceis de gostar e difíceis de largar.',
    description: 'Nada de aspereza nem complicação. Você gosta de fruta madura, textura macia e vinhos que combinam com mesa cheia e conversa longa.',
    accent: '#A13D3B',
    tiers: { seguro: 'tinto', descoberta: 'adicional', surpresa: 'branco' },
  },
  elegante: {
    id: 'elegante',
    name: 'Seco & Elegante',
    tagline: 'Menos exuberância, mais precisão.',
    description: 'Você prefere o detalhe ao exagero. Gosta de vinhos secos, bem desenhados, que acompanham a comida em vez de disputar atenção com ela.',
    accent: '#3B3A36',
    tiers: { seguro: 'branco', descoberta: 'tinto', surpresa: 'adicional' },
  },
  curva: {
    id: 'curva',
    name: 'Fora da Curva',
    tagline: 'Você provavelmente não quer beber sempre a mesma coisa.',
    description: 'Uva que ninguém conhece, país improvável, vinho feito em talha de barro: se tem história, você quer provar. Seu paladar é curioso, e a gente adora isso.',
    accent: '#B8652A',
    tiers: { seguro: 'branco', descoberta: 'tinto', surpresa: 'adicional' },
  },
};

export const TIER_COPY: Record<Tier, { label: string; hint: string }> = {
  seguro:     { label: 'O SEGURO',     hint: 'Perto do que você já conhece.' },
  descoberta: { label: 'A DESCOBERTA', hint: 'Um passo além.' },
  surpresa:   { label: 'A SURPRESA',   hint: 'Algo que você provavelmente não escolheria sozinho.' },
};
```

### O que compõe cada perfil (visão para o cliente)

| Perfil | O Seguro | A Descoberta | A Surpresa |
|---|---|---|---|
| Fresco & Cítrico | Branco cítrico (Sauvignon Blanc, Alvarinho, Albariño, Loureiro, Verdejo) | Espumante brut ou nature | Tinto leve para servir fresco (Gamay, Pardusco, Cinsault, Barbera) |
| Floral & Aromático | Branco aromático (Torrontés, Riesling, Gewürztraminer, Viognier) | Rosé de Moscatel, espumante Moscato ou Moscatel de Setúbal | Tinto perfumado (Gamay de Morgon, Pinot Noir, Touriga Nacional, Nebbiolo) |
| Frutado & Macio | Tinto macio (Pinot Noir, Malbec, Merlot, Côtes-du-Rhône, Primitivo) | Rosé frutado ou espumante rosé | Branco de fruta madura (Grillo, Chardonnay, blends do sul da França) |
| Seco & Elegante | Branco mineral (Petit Chablis, Muscadet, Gavi, Verdicchio, Mâcon) | Tinto seco e fino (Pinot Noir francês, Chianti Classico, Bordeaux, Madiran, Tannat) | Jerez Manzanilla, Porto Branco Extra Dry ou espumante de longa maturação |
| Fora da Curva | Branco de uva improvável (Roditis, Assyrtiko, Grüner Veltliner, Retsina, Encruzado) | Tinto raro (Mavro Kalavrytino, Agiorgitiko, Baga, Pinotage, Casetta) | **Vinho laranja**, conectando com a seção "Saia do comum. Prove o Laranja" |

---

## 6. Lógica de pontuação e seleção

### 6.1 Hash determinístico (`src/lib/hash.ts`)

```ts
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
```

### 6.2 Pontuação (`src/lib/scoring.ts`)

```ts
type Answers = Partial<Record<'q1'|'q2'|'q3'|'q4'|'q5', OptionKey>>;

interface ProfileResult {
  profileId: ProfileId;
  scores: Record<ProfileId, number>;
  corpo: number;                               // 0..9
  corpoLevel: 1 | 2 | 3;                       // 1 leve, 2 médio, 3 estruturado
  answersKey: string;                          // "q1:a|q2:c|q3:d|q4:b|q5:e"
  tieBroken: boolean;
}
```

Regras:
1. Somar os pesos de cada resposta nos 5 perfis e no `corpo`.
2. Perfil com maior soma vence.
3. **Desempate** (acontece em ~17% das combinações): percorrer as perguntas na ordem de prioridade **q3, q4, q2, q1, q5** (jantar é o preditor mais forte). Em cada uma, ver qual perfil a resposta dada favorece como principal (o de 3 pontos, ou o de maior peso). Se esse perfil estiver entre os empatados, ele vence. Se nenhuma pergunta resolver, usar a ordem fixa `frutado > fresco > elegante > floral > curva` (do mais acessível ao mais ousado).
4. `corpoLevel`: `corpo <= 1` → 1 · `corpo 2..3` → 2 · `corpo >= 4` → 3. Distribuição esperada: ~40% leve, ~38% médio, ~22% estruturado.
5. `answersKey` é a concatenação ordenada `q1:x|q2:x|q3:x|q4:x|q5:x`.

### 6.3 Regra de corpo sobre as faixas

Partindo de `profile.tiers`: se `corpoLevel === 3` **e** o slot `tinto` não estiver na faixa `seguro`, trocar: o tinto passa a ser O SEGURO e o slot que estava em seguro assume a faixa que era do tinto. Racional: para quem escolheu costela e chocolate amargo, o terreno conhecido é o tinto.

### 6.4 Seleção dos rótulos (`src/lib/selection.ts`)

```ts
selectTrio(result: ProfileResult, rotation: number): Array<{ tier: Tier; slot: Slot; wine: Wine }>
```

- **Tinto:** filtrar o pool `wines[profileId].tinto` por `corpo === corpoLevel`. Se vier vazio, usar o nível mais próximo (empate: o mais leve). Índice = `(fnv1a(answersKey + '|tinto') + rotation) % pool.length`.
- **Branco:** pool completo `wines[profileId].branco`. Índice = `(fnv1a(answersKey + '|branco') + rotation) % pool.length`.
- **Adicional:** pool completo `wines[profileId].adicional`. Índice = `(fnv1a(answersKey + '|adicional') + rotation) % pool.length`.
- Retornar sempre na ordem seguro, descoberta, surpresa.

Consequência desejada: as mesmas respostas sempre geram o mesmo trio (essencial para a apresentação), mas pessoas diferentes no mesmo perfil veem rótulos diferentes. Com 83 rótulos no total, o sistema produz centenas de trios distintos com apenas 5 perfis.

### 6.5 "Ver outro trio"
Incrementa `rotation` em 1, grava na sessão, e re-renderiza os três cards com fade out/in (mesmos tempos da seção 3.2). Não muda o perfil. Depois de percorrer os pools, os trios se repetem naturalmente.

Cada novo trio exibido é acrescentado ao registro da pessoa com `appendTrio(leadId, rotation)` (seção 14.4), em segundo plano e sem bloquear a interface. O painel mostra o primeiro trio em destaque e os demais como "outros trios vistos".

### 6.6 Testes obrigatórios (`scoring.test.ts`)
1. Iterar as 3.125 combinações possíveis e verificar que **todas** retornam um perfil válido e que cada perfil fica entre 15% e 25% do total (valores de referência: frutado 722, curva 635, floral 629, fresco 613, elegante 526).
2. Casos fixos:
   - `a,a,a,a,a` → `fresco`
   - `b,b,b,b,b` → `floral`
   - `c,c,c,c,c` → `frutado`
   - `d,d,d,d,d` → `elegante`, `corpoLevel 3`
   - `e,e,e,e,e` → `curva`
3. `selectTrio` sempre retorna exatamente um vinho com slot `tinto`, um `branco` e um `adicional`, e é determinístico para o mesmo `(answersKey, rotation)`.

---

## 7. Sessão: como as respostas são guardadas

A lógica do quiz roda toda no navegador. O único dado que sai do dispositivo é o **registro do match** (e-mail, perfil e trios exibidos), enviado ao backend quando o quiz é concluído (seção 14). Respostas individuais às perguntas também são enviadas (`answersKey`) para permitir reproduzir o resultado no painel; nada além disso.

### 7.1 Estado em memória
`App.tsx` usa `useReducer` com o estado abaixo. O reducer é a única fonte de verdade; o `sessionStorage` é um espelho.

```ts
interface QuizState {
  version: 2;
  ageConfirmed: boolean;
  email: string | null;                   // normalizado; obrigatório para START
  screen: 'intro' | 'question' | 'loading' | 'result';
  step: 0 | 1 | 2 | 3 | 4;               // índice da pergunta atual
  answers: Partial<Record<'q1'|'q2'|'q3'|'q4'|'q5', OptionKey>>;
  rotation: number;                       // "ver outro trio"
  leadId: string | null;                  // crypto.randomUUID() gerado ao entrar em 'loading'
  pendingLead?: unknown;                  // payload não enviado (seção 3.3)
  source: 'quiz' | 'shared';              // 'shared' = aberto por link ?m= de outra pessoa
  startedAt: string;                      // ISO
  completedAt?: string;
}
```

Ações: `CONFIRM_AGE {email}`, `START`, `ANSWER {questionId, key}`, `BACK`, `FINISH_LOADING`, `NEXT_TRIO`, `LEAD_SAVED`, `LEAD_FAILED {payload}`, `CHANGE_EMAIL`, `RESET`.

- `CONFIRM_AGE` só é aceito com e-mail válido; grava `email` e `ageConfirmed`.
- `START` é recusado se `email` for nulo ou `ageConfirmed` falso.
- `ANSWER` grava a resposta, avança `step` e, se era a P5, gera `leadId`, muda `screen` para `loading` e marca `completedAt`.
- `BACK` volta um passo sem apagar a resposta (ela aparece destacada).
- `CHANGE_EMAIL` limpa `email` e volta à Intro.
- `RESET` limpa `answers`, `rotation`, `leadId`, `pendingLead` e `completedAt`, mantém `ageConfirmed` e `email`, vai para `intro`.

### 7.2 Persistência (`src/lib/session.ts`)
- Chave: `armazem-match-do-vinho:v2` no **`sessionStorage`** (ignorar e descartar a chave antiga `:v1`) (escopo da aba: fechar a aba zera o quiz, o que é o comportamento certo para um tablet na loja).
- Gravar após **toda** ação do reducer (`useEffect` sobre o estado).
- Na carga do app: ler, validar (versão igual a 2, e-mail válido ou nulo, chaves e valores de resposta válidos) e restaurar. Se estiver inválido ou corrompido, descartar e começar do zero. Se `screen === 'loading'` na restauração, pular direto para `result`.
- Envolver toda leitura e escrita em `try/catch` (modo privado do Safari pode lançar erro); se falhar, o app segue funcionando só em memória.

### 7.3 Link compartilhável
- Ao chegar no resultado, atualizar a URL com `history.replaceState` para `?m=<respostas><rotação>`, por exemplo `?m=acdbe-0`.
- Se o app abrir com `?m=` válido, ignorar a sessão salva, reconstruir `answers` e `rotation` a partir do parâmetro, marcar `source: 'shared'` e abrir direto no resultado (ainda pedindo a confirmação de 18+ se `ageConfirmed` for falso; nesse caso a Intro mostra só o botão de 18+, **sem o campo de e-mail**, porque a pessoa está vendo o match de outra pessoa).
- Resultado aberto por link compartilhado **não gera registro** no banco. No lugar de "Ver outro trio" e "Refazer o quiz", mostrar um único botão **"Descobrir o meu match"**, que limpa a sessão e leva à Intro completa (com e-mail).
- O `?m=` nunca contém o e-mail nem o `leadId`.
- "Compartilhar meu match" usa esse link. Texto do compartilhamento: `Meu match no Armazém dos Importados é {NOME DO PERFIL}. Descubra o seu:`

### 7.4 Derivações
Na sessão do navegador, perfil, faixas e trio **nunca são gravados**: são sempre recalculados de `answers` + `rotation` por `computeProfile` e `selectTrio`. Isso evita estado inconsistente se os dados dos vinhos mudarem entre um deploy e outro. **Exceção deliberada:** o registro no banco (seção 14) guarda uma **cópia** do nome do perfil e dos vinhos (id, nome, tipo, preço) como foram exibidos, porque o painel precisa mostrar o que a pessoa realmente viu, mesmo que o `wines.json` mude depois.

---

## 8. Layout e design

### 8.1 Direção
Editorial, sóbria, com cara de carta de vinhos impressa e não de app de promoção. Muito espaço em branco, uma tipografia serifada expressiva para títulos e uma sans-serif limpa para o resto. Mobile-first: a maior parte do tráfego virá do Instagram.

> Se houver manual de identidade do Armazém disponível, substitua os tokens abaixo pelas cores e fontes oficiais. Os valores aqui são um ponto de partida neutro. Considere que a cor principal da marca armazém dos importados é o azul #00273c e branco #ffffff. Dentro da pasta já existe o logotipo do Armazém em formato .svg . 

### 8.2 Tokens (`src/styles/tokens.css`)

```css
:root {
  --paper:   #F4EFE6;   /* fundo */
  --paper-2: #EBE4D7;   /* painéis, fundo das garrafas */
  --ink:     #1F1B18;   /* texto principal */
  --ink-2:   #5E564E;   /* texto secundário */
  --line:    #D6CCBC;   /* divisórias, bordas */
  --wine:    #5B1A24;   /* cor institucional de apoio (botões principais) */
  --focus:   #2F6B5E;

  --font-display: 'Fraunces', Georgia, serif;         /* opsz alto, peso 400/600 */
  --font-body:    'Inter', system-ui, sans-serif;

  --radius: 4px;
  --maxw-quiz: 560px;
  --maxw-result: 1080px;
  --gutter: 20px;
}
```

- Tipografia: título das perguntas `clamp(28px, 6vw, 44px)`, Fraunces 400, entrelinha 1.15. Nome do perfil no resultado `clamp(40px, 10vw, 80px)`. Corpo 16/17px Inter. Sobrelinhas em Inter 12px, caixa alta, `letter-spacing: .14em`.
- Botões de opção: fundo transparente, borda 1px `--line`, texto `--ink`. Hover: borda `--ink`. Selecionado: fundo `--ink`, texto `--paper`. Foco visível: `outline 2px var(--focus)` com offset.
- Botão principal: fundo `--wine`, texto `--paper`, sem gradiente, sem sombra.
- Uma textura sutil de papel (ruído SVG com opacidade ~3%) no fundo é bem-vinda, opcional.
- Tema escuro não é necessário para a demo.

### 8.3 Grid
- Quiz: coluna central única, `max-width: var(--maxw-quiz)`, conteúdo verticalmente centrado na viewport (`min-height: 100svh`), rodapé legal ancorado embaixo.
- Resultado: `max-width: var(--maxw-result)`; cards em `grid-template-columns: repeat(3, 1fr)` a partir de 900px; 1 coluna abaixo disso.

---

## 9. Componentes do resultado

### 9.1 `WineCard`
```
┌───────────────────────────────┐
│ O SEGURO                      │ ← TIER_COPY.label (sobrelinha)
│ Perto do que você já conhece. │ ← TIER_COPY.hint (Inter 13px, --ink-2)
│ ┌───────────────────────────┐ │
│ │        [garrafa]          │ │ ← /bottles/{tipo}.webp sobre painel --paper-2
│ └───────────────────────────┘ │
│ BRANCO                        │ ← chip do tipo (Tinto, Branco, Rosé, Laranja, Espumante, Fortificado)
│ Anselmo Mendes Alvarinho      │ ← wine.nome (Fraunces 22px)
│ Muros Antigos                 │
│ Portugal · Alvarinho          │ ← wine.pais · wine.uva
│                               │
│ Por que dá match              │
│ Cítrico e salino, feito...    │ ← wine.porQueDaMatch
│ Sirva com                     │
│ Peixe grelhado, frutos...     │ ← wine.sirvaCom
│ Temperatura: 8 a 10 °C        │ ← wine.temperatura
│ ───────────────────────────── │
│ R$ 234,00                     │ ← só se config.showPrices
└───────────────────────────────┘
```
- Mapeamento do chip: `tinto→Tinto`, `branco→Branco`, `rose→Rosé`, `laranja→Laranja`, `espumante→Espumante`, `porto→Fortificado`.
- A garrafa é **genérica por tipo**: o nome do rótulo aparece como texto HTML no card, nunca dentro da imagem.
- Preço em formato brasileiro (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`).

### 9.2 Bloco "condição do trio"
- Desconto atual: **20%** (`config.trioDiscountPercent = 20`).
- Linha de condição (sempre): "Na loja, o MATCH 3 sai com 20% de desconto." (gerada a partir de `config.trioDiscountPercent`; se algum dia for `null`, usar "Na loja, o MATCH 3 tem condição especial.").
- Se `config.showPrices`: abaixo da linha de condição, "Levando os três: {soma com desconto}" em Fraunces, e em Inter 13px `--ink-2`: "Preço cheio {soma}, com 20% no trio." Arredondar para centavos após aplicar o desconto sobre a soma (`Math.round(soma * (1 - pct/100) * 100) / 100`). Se algum vinho tiver `precoReferencia: null`, esconder os valores e manter só a linha de condição.
- **Não usar preço riscado.** O preço cheio aparece como texto secundário, nunca com `line-through`.
- Nota pequena: `config.priceNote`.
- Tom institucional. Nada de selo, estrela, "%OFF" em destaque ou vermelho promocional.

### 9.3 Bloco "prove seu match"
- Título: **Quer descobrir se acertamos?**
- Texto: **Prove seu match no Armazém.** *Mostre esta tela no balcão: a gente separa seu trio e te ajuda a escolher.*
- **Não mencionar** degustação, taça servida ou garrafa aberta na loja.
- Endereço: Rua Anita Garibaldi, 448, Mont'Serrat, Porto Alegre
- Botões: **"Como chegar"** (abre `config.mapsUrl` em nova aba) e **"Reservar pelo WhatsApp"** (número da loja: `5551997647911`; o botão só aparece se `config.whatsappNumber` estiver preenchido). A mensagem pré-preenchida do WhatsApp é:
  `Oi! Fiz o Match do Vinho e meu perfil é {NOME}. Meu trio: {vinho seguro}, {vinho descoberta} e {vinho surpresa}. Quero reservar meu trio com os 20% de desconto.`
  (Se `trioDiscountPercent` for `null`, a última frase vira `Quero reservar meu trio.`)
  URL: `https://wa.me/5551997647911?text={encodeURIComponent(mensagem)}`, aberta em nova aba com `rel="noopener"`.

### 9.4 Modo loja (opcional, se sobrar tempo)
Com `?modo=loja` na URL: esconder "Como chegar" e o WhatsApp, trocar o texto do bloco 9.3 por "Chame alguém da nossa equipe e leve seu trio hoje.", e após 90 segundos sem interação na tela de resultado, voltar automaticamente para a Intro **limpando a sessão inteira, inclusive o e-mail** (o próximo cliente do tablet não pode ver nem herdar o e-mail anterior). Nesse modo, o campo de e-mail usa `autocomplete="off"`. Registros criados no modo loja levam `channel: 'loja'` (seção 14.2). Útil para um tablet no balcão.

---

## 10. Imagens das garrafas com o Magnific

O Claude Code tem acesso ao conector **Magnific** (ferramentas `mcp__Magnific__*`). Gerar **6 imagens**, uma por tipo, com aparência de família (mesma luz, ângulo, enquadramento e fundo).

### 10.1 Passos
1. Rodar `account_balance` e `simulate_cost` antes de gerar; se o saldo não cobrir 6 imagens mais 1 rodada de refação, parar e avisar.
2. Rodar `images_models_list` e escolher um modelo fotorrealista de produto. Usar **o mesmo modelo, a mesma proporção (3:4 vertical) e, se o modelo aceitar, a mesma seed** para as seis.
3. Gerar com `images_generate` usando o prompt-base + a variação de cada tipo (10.2).
4. Mostrar as criações com `creations_show` e confirmar com `creations_wait` para obter a URL final.
5. **Inspeção obrigatória:** abrir cada imagem. Rejeitar e gerar de novo se houver letras, números, logotipos ou texto ilegível no rótulo (IA costuma deformar rótulos), mais de uma garrafa, garrafa cortada, ou taça/objetos extras.
6. Remover o fundo com `images_remove_background` para ter PNG com transparência (o card já tem painel de fundo próprio).
7. Baixar as seis para `public/bottles/`, converter para **WebP**, altura 900px, fundo transparente, com o script `sharp` (`npm i -D sharp`, script em `scripts/optimize-bottles.mjs`). Cada arquivo deve ficar abaixo de 120 KB.
8. Nomes finais: `tinto.webp`, `branco.webp`, `rose.webp`, `laranja.webp`, `espumante.webp`, `porto.webp`.

### 10.2 Prompts
**Prompt-base (em inglês, funciona melhor nos modelos):**
```
Studio product photograph of a single 750ml wine bottle standing upright, front view, perfectly centered,
{VARIAÇÃO}.
The label is completely blank matte cream paper with no text, no letters, no numbers, no logo, no illustration.
Soft diffused window light from the left, gentle realistic shadow on the ground,
seamless warm off-white background, editorial still life, photorealistic, high detail, sharp focus,
vertical 3:4 composition, bottle occupies 80% of the frame height.
```
**Negative prompt (se o modelo aceitar):** `text, letters, typography, logo, watermark, brand, multiple bottles, glass, cork on table, hands, cropped bottle`

| Arquivo | `{VARIAÇÃO}` |
|---|---|
| `tinto` | `classic Bordeaux-shape bottle in very dark green glass, deep red wine inside barely visible, dark burgundy foil capsule` |
| `branco` | `tall Bordeaux-shape bottle in clear flint glass, pale straw-gold white wine visible through the glass, gold foil capsule` |
| `rose` | `slender elegant bottle in clear flint glass, pale salmon-pink rosé wine visible through the glass, pale pink capsule` |
| `laranja` | `Burgundy-shape bottle in clear flint glass, amber-orange colored wine visible through the glass, copper foil capsule` |
| `espumante` | `heavy sparkling wine bottle in dark green glass with sloped shoulders, gold foil covering the neck and a wire muselet cage over the cork` |
| `porto` | `port wine bottle in very dark glass with a short bulbous neck and a bar-top cork stopper, dark ruby wine, deep red wax-style capsule` |

### 10.3 Fallback
`Bottle.tsx` deve renderizar uma **silhueta SVG inline** (garrafa simples em traço fino, preenchida com a cor do tipo) se a imagem não carregar (`onError`) ou se os arquivos ainda não existirem. Assim o site funciona antes das imagens estarem prontas e nunca mostra ícone quebrado. Cores da silhueta: tinto `#4A1520`, branco `#D9C58A`, rosé `#E7A9A0`, laranja `#D08A3C`, espumante `#2E3B2A`, porto `#3A0F16`.

---

## 11. Dados dos vinhos (`src/data/wines.json`)

**Copiar literalmente.** São 83 rótulos selecionados do Catálogo Consolidado Decanter + Armazém (1.313 itens), todos disponíveis no Armazém. Critérios da seleção:
- Faixa de preço acessível para uma campanha de descoberta (R$ 85 a R$ 392; 60 dos 83 entre R$ 100 e R$ 250).
- Uvas e estilos que representam claramente cada perfil.
- Diversidade de países (14 origens), incluindo nacionais da Serra Gaúcha e um laranja gaúcho (Delta do Jacuí) para o perfil Fora da Curva.
- Preferência pelas linhas da Decanter, que têm grafia e composição de uvas mais confiáveis no catálogo.

Campos:
- `catalogo`: nome exatamente como está no catálogo (para conferência com o estoque; **não exibir**).
- `nome`: nome limpo para exibição.
- `tipo`: define a imagem (`tinto | branco | rose | laranja | espumante | porto`).
- `corpo`: 1 leve, 2 médio, 3 estruturado. Só é usado para filtrar tintos (seção 6.4).
- `precoReferencia`: preço em reais conforme o catálogo consolidado.
- `porQueDaMatch`, `sirvaCom`, `temperatura`: textos de uso, no tom do Armazém. As notas descrevem o estilo da uva e da região; não são fichas técnicas do produtor.

Tipagem sugerida:
```ts
export interface Wine {
  id: string; catalogo: string; nome: string; pais: string; uva: string;
  tipo: 'tinto' | 'branco' | 'rose' | 'laranja' | 'espumante' | 'porto';
  corpo: 1 | 2 | 3; precoReferencia: number | null;
  porQueDaMatch: string; sirvaCom: string; temperatura: string;
}
export type WinesByProfile = Record<ProfileId, Record<Slot, Wine[]>>;
```

```json
{
  "fresco": {
    "branco": [
      {"id": "fresco-branco-1", "catalogo": "Terranoble Sauvignon Blanc Estate Reserve 2024", "nome": "Terranoble Sauvignon Blanc Estate Reserve", "pais": "Chile", "uva": "Sauvignon Blanc", "tipo": "branco", "corpo": 1, "precoReferencia": 85.0, "porQueDaMatch": "Limão, maracujá e aquela mordida fresca que acorda o paladar.", "sirvaCom": "Ceviche, salada com queijo de cabra, fim de tarde na piscina.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-branco-2", "catalogo": "Anselmo Mendes Alvarinho Muros Antigos 2023", "nome": "Anselmo Mendes Alvarinho Muros Antigos", "pais": "Portugal", "uva": "Alvarinho", "tipo": "branco", "corpo": 2, "precoReferencia": 234.0, "porQueDaMatch": "Cítrico e salino, feito para quem pede peixe olhando o mar.", "sirvaCom": "Peixe grelhado, frutos do mar, sushi.", "temperatura": "8 a 10 °C"},
      {"id": "fresco-branco-3", "catalogo": "Vinho Branco Reserva Albariño Garzón 750ml", "nome": "Garzón Albariño Reserva", "pais": "Uruguai", "uva": "Albariño", "tipo": "branco", "corpo": 2, "precoReferencia": 191.0, "porQueDaMatch": "Um branco de beira de oceano, vibrante do primeiro ao último gole.", "sirvaCom": "Moqueca leve, camarão na manteiga, bolinho de bacalhau.", "temperatura": "8 a 10 °C"},
      {"id": "fresco-branco-4", "catalogo": "Vinho Branco Sauvignon Blanc Hunter's 750ml", "nome": "Hunter's Sauvignon Blanc", "pais": "Nova Zelândia", "uva": "Sauvignon Blanc", "tipo": "branco", "corpo": 2, "precoReferencia": 278.0, "porQueDaMatch": "Toranja, ervas e muita energia. O jeito neozelandês de refrescar.", "sirvaCom": "Aspargos, saladas verdes, tacos de peixe.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-branco-5", "catalogo": "Anselmo Mendes Loureiro Muros Antigos 2024", "nome": "Anselmo Mendes Loureiro Muros Antigos", "pais": "Portugal", "uva": "Loureiro", "tipo": "branco", "corpo": 1, "precoReferencia": 183.0, "porQueDaMatch": "Leve, perfumado de lima e flor branca. Pede segunda taça.", "sirvaCom": "Petiscos de verão, ostras, tempurá.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-branco-6", "catalogo": "Lozano Verdejo Marques de Toledo 2023", "nome": "Marqués de Toledo Verdejo", "pais": "Espanha", "uva": "Verdejo", "tipo": "branco", "corpo": 1, "precoReferencia": 118.0, "porQueDaMatch": "Fresco, com um toque herbal que combina com dia de sol.", "sirvaCom": "Tapas, tortilha, saladas de verão.", "temperatura": "6 a 8 °C"}
    ],
    "adicional": [
      {"id": "fresco-adicional-1", "catalogo": "Hermann Espumante Lírica Brut", "nome": "Hermann Lírica Brut", "pais": "Brasil", "uva": "Chardonnay e Pinot Noir", "tipo": "espumante", "corpo": 1, "precoReferencia": 142.0, "porQueDaMatch": "Bolha fina da Serra Gaúcha, fresca e sem cerimônia.", "sirvaCom": "Brinde, entradinhas, pastel de feira.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-adicional-2", "catalogo": "Bella Conchi Cava Brut Selección", "nome": "Bella Conchi Cava Brut Selección", "pais": "Espanha", "uva": "Macabeo, Xarel-lo e Parellada", "tipo": "espumante", "corpo": 1, "precoReferencia": 220.0, "porQueDaMatch": "O espumante espanhol que combina com tudo que é frito e salgado.", "sirvaCom": "Jamón, croquetes, batata frita.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-adicional-3", "catalogo": "Hermann Espumante Nature Lírica Crua", "nome": "Hermann Lírica Crua Nature", "pais": "Brasil", "uva": "Chardonnay e Pinot Noir", "tipo": "espumante", "corpo": 2, "precoReferencia": 142.0, "porQueDaMatch": "Sem açúcar, sem filtro, com a acidez lá em cima.", "sirvaCom": "Ostras, sashimi, queijo fresco.", "temperatura": "6 a 8 °C"},
      {"id": "fresco-adicional-4", "catalogo": "Luigi Bosca Espumante Extra Brut La Linda", "nome": "Luigi Bosca La Linda Extra Brut", "pais": "Argentina", "uva": "Chardonnay e Sémillon", "tipo": "espumante", "corpo": 1, "precoReferencia": 109.0, "porQueDaMatch": "Leve, cítrico e fácil de abrir numa terça-feira qualquer.", "sirvaCom": "Canapés, saladas, frango grelhado.", "temperatura": "6 a 8 °C"}
    ],
    "tinto": [
      {"id": "fresco-tinto-1", "catalogo": "Marc Jambon Beaujolais-Villages 2024", "nome": "Marc Jambon Beaujolais-Villages", "pais": "França", "uva": "Gamay", "tipo": "tinto", "corpo": 1, "precoReferencia": 204.0, "porQueDaMatch": "Um tinto que vai para o balde de gelo. Fruta vermelha, leveza e zero peso.", "sirvaCom": "Tábua de frios, sanduíche, piquenique.", "temperatura": "12 a 14 °C"},
      {"id": "fresco-tinto-2", "catalogo": "Anselmo Mendes Pardusco 2023", "nome": "Anselmo Mendes Pardusco", "pais": "Portugal", "uva": "Alvarelhão, Pedral e Caínho", "tipo": "tinto", "corpo": 1, "precoReferencia": 225.0, "porQueDaMatch": "Um tinto da terra do Vinho Verde: leve, crocante e servido fresco.", "sirvaCom": "Bacalhau, sardinha, pizza de margherita.", "temperatura": "12 a 14 °C"},
      {"id": "fresco-tinto-3", "catalogo": "Luis Canas Rioja Tinto Maceracion Carbonica 2024", "nome": "Luis Cañas Maceración Carbónica", "pais": "Espanha", "uva": "Tempranillo", "tipo": "tinto", "corpo": 1, "precoReferencia": 122.25, "porQueDaMatch": "Suco de fruta vermelha para adultos: jovem, vivo e sem madeira.", "sirvaCom": "Tapas, hambúrguer, massa ao sugo.", "temperatura": "12 a 14 °C"},
      {"id": "fresco-tinto-4", "catalogo": "Gonzalo Guzmán Cinsault Oriundo de Itata 2023", "nome": "Gonzalo Guzmán Cinsault Oriundo de Itata", "pais": "Chile", "uva": "Cinsault", "tipo": "tinto", "corpo": 2, "precoReferencia": 292.0, "porQueDaMatch": "Tinto de vinhas antigas do sul do Chile, leve como uma brisa.", "sirvaCom": "Salmão grelhado, cogumelos, frango assado.", "temperatura": "13 a 15 °C"},
      {"id": "fresco-tinto-5", "catalogo": "Bel Colle Barbera d’Asti 2024", "nome": "Bel Colle Barbera d'Asti", "pais": "Itália", "uva": "Barbera", "tipo": "tinto", "corpo": 2, "precoReferencia": 162.0, "porQueDaMatch": "Cereja, acidez suculenta e pouca aspereza. O tinto da cantina italiana.", "sirvaCom": "Lasanha, pizza, salame.", "temperatura": "14 a 16 °C"},
      {"id": "fresco-tinto-6", "catalogo": "Paul Mas Estate Carignan Vieilles Vignes 2023", "nome": "Paul Mas Carignan Vieilles Vignes", "pais": "França", "uva": "Carignan", "tipo": "tinto", "corpo": 3, "precoReferencia": 213.0, "porQueDaMatch": "Mais corpo sem perder o frescor que você gosta.", "sirvaCom": "Linguiça na brasa, cassoulet, ratatouille.", "temperatura": "15 a 17 °C"},
      {"id": "fresco-tinto-7", "catalogo": "Umani Ronchi Montepulciano d'Abruzzo Podere 2024", "nome": "Umani Ronchi Montepulciano d'Abruzzo Podere", "pais": "Itália", "uva": "Montepulciano", "tipo": "tinto", "corpo": 3, "precoReferencia": 152.0, "porQueDaMatch": "Fruta escura com acidez viva, bom parceiro de carne.", "sirvaCom": "Costela, ragu, polenta com molho.", "temperatura": "16 a 18 °C"}
    ]
  },
  "floral": {
    "branco": [
      {"id": "floral-branco-1", "catalogo": "Alta-Yarí Torrontes 2024", "nome": "Alta-Yarí Torrontés", "pais": "Argentina", "uva": "Torrontés", "tipo": "branco", "corpo": 1, "precoReferencia": 110.0, "porQueDaMatch": "Você sente o perfume antes do primeiro gole: flor de laranjeira e pêssego.", "sirvaCom": "Comida tailandesa, empanadas, queijos suaves.", "temperatura": "7 a 9 °C"},
      {"id": "floral-branco-2", "catalogo": "Eugen Müller Riesling Kabinett Forster Mariengarten 2024", "nome": "Eugen Müller Riesling Kabinett", "pais": "Alemanha", "uva": "Riesling", "tipo": "branco", "corpo": 1, "precoReferencia": 227.0, "porQueDaMatch": "Levemente adocicado, com maçã verde e flores. Delicado e viciante.", "sirvaCom": "Curry, comida picante, porco com maçã.", "temperatura": "7 a 9 °C"},
      {"id": "floral-branco-3", "catalogo": "Paul Mas Gewürztraminer 2024", "nome": "Paul Mas Gewürztraminer", "pais": "França", "uva": "Gewürztraminer", "tipo": "branco", "corpo": 2, "precoReferencia": 172.0, "porQueDaMatch": "Lichia e pétala de rosa na taça. Impossível passar despercebido.", "sirvaCom": "Cozinha indiana, queijos de casca lavada, pato.", "temperatura": "8 a 10 °C"},
      {"id": "floral-branco-4", "catalogo": "Paul Mas Viognier Reserve 2024", "nome": "Paul Mas Viognier Reserve", "pais": "França", "uva": "Viognier", "tipo": "branco", "corpo": 2, "precoReferencia": 213.0, "porQueDaMatch": "Damasco e flor branca, macio e perfumado.", "sirvaCom": "Frango ao curry, risoto de abóbora, moqueca.", "temperatura": "9 a 11 °C"},
      {"id": "floral-branco-5", "catalogo": "Luigi Bosca Riesling 2025", "nome": "Luigi Bosca Riesling", "pais": "Argentina", "uva": "Riesling", "tipo": "branco", "corpo": 1, "precoReferencia": 215.0, "porQueDaMatch": "Seco, cítrico e floral ao mesmo tempo.", "sirvaCom": "Sushi, frutos do mar, salada de manga.", "temperatura": "7 a 9 °C"},
      {"id": "floral-branco-6", "catalogo": "Amalaya Blanco de Corte 2024", "nome": "Amalaya Blanco de Corte", "pais": "Argentina", "uva": "Torrontés e Riesling", "tipo": "branco", "corpo": 1, "precoReferencia": 117.0, "porQueDaMatch": "Aromático e leve, uma dupla de uvas perfumadas.", "sirvaCom": "Petiscos, saladas, ceviche.", "temperatura": "7 a 9 °C"}
    ],
    "adicional": [
      {"id": "floral-adicional-1", "catalogo": "José Maria da Fonseca Roxo Rosé DSF 2022", "nome": "José Maria da Fonseca Roxo Rosé", "pais": "Portugal", "uva": "Moscatel Roxo", "tipo": "rose", "corpo": 1, "precoReferencia": 239.0, "porQueDaMatch": "Um rosé feito de Moscatel: perfume de rosas e frutas cítricas.", "sirvaCom": "Salmão, comida japonesa, entradas frias.", "temperatura": "8 a 10 °C"},
      {"id": "floral-adicional-2", "catalogo": "Bel Colle Asti Dolce Millesimato 2024", "nome": "Bel Colle Asti Dolce", "pais": "Itália", "uva": "Moscato Bianco", "tipo": "espumante", "corpo": 1, "precoReferencia": 182.0, "porQueDaMatch": "Bolha doce e floral, com cheiro de uva fresca.", "sirvaCom": "Sobremesas de frutas, panettone, bolo de laranja.", "temperatura": "5 a 7 °C"},
      {"id": "floral-adicional-3", "catalogo": "Hermann Espumante Bossa Moscatel N4", "nome": "Hermann Bossa Moscatel N°4", "pais": "Brasil", "uva": "Moscato", "tipo": "espumante", "corpo": 1, "precoReferencia": 87.0, "porQueDaMatch": "Doce na medida, perfumado e festivo.", "sirvaCom": "Salada de frutas, torta de limão, brunch.", "temperatura": "5 a 7 °C"},
      {"id": "floral-adicional-4", "catalogo": "José Maria da Fonseca Moscatel de Setúbal Alambre 2021", "nome": "José Maria da Fonseca Alambre Moscatel de Setúbal", "pais": "Portugal", "uva": "Moscatel de Setúbal", "tipo": "porto", "corpo": 2, "precoReferencia": 198.0, "porQueDaMatch": "Um fortificado de flor de laranjeira, mel e casca de laranja.", "sirvaCom": "Pudim, doces de ovos, queijos azuis.", "temperatura": "12 a 14 °C"}
    ],
    "tinto": [
      {"id": "floral-tinto-1", "catalogo": "Marc Jambon Morgon Les Charmes 2021", "nome": "Marc Jambon Morgon Les Charmes", "pais": "França", "uva": "Gamay", "tipo": "tinto", "corpo": 1, "precoReferencia": 350.0, "porQueDaMatch": "Violeta e cereja, leve e perfumado como o nome promete.", "sirvaCom": "Charcutaria, frango assado, queijos de massa mole.", "temperatura": "13 a 15 °C"},
      {"id": "floral-tinto-2", "catalogo": "Villard Pinot Noir Reserve Expresión 2025", "nome": "Villard Pinot Noir Expresión", "pais": "Chile", "uva": "Pinot Noir", "tipo": "tinto", "corpo": 1, "precoReferencia": 199.0, "porQueDaMatch": "Fruta vermelha e flores num tinto delicado.", "sirvaCom": "Salmão, cogumelos, massas leves.", "temperatura": "13 a 15 °C"},
      {"id": "floral-tinto-3", "catalogo": "Quinta dos Roques Dão Touriga Nacional Correio 2023", "nome": "Quinta dos Roques Touriga Nacional", "pais": "Portugal", "uva": "Touriga Nacional", "tipo": "tinto", "corpo": 2, "precoReferencia": 245.0, "porQueDaMatch": "A uva portuguesa que cheira a violeta e bergamota.", "sirvaCom": "Cabrito, arroz de pato, queijo serra.", "temperatura": "15 a 17 °C"},
      {"id": "floral-tinto-4", "catalogo": "Arrogant Frog Syrah Viognier Croak Rotie 2022", "nome": "Arrogant Frog Syrah Viognier", "pais": "França", "uva": "Syrah e Viognier", "tipo": "tinto", "corpo": 2, "precoReferencia": 178.0, "porQueDaMatch": "Um toque de uva branca perfumada deixa o Syrah mais floral.", "sirvaCom": "Cordeiro, hambúrguer, pizza de linguiça.", "temperatura": "15 a 17 °C"},
      {"id": "floral-tinto-5", "catalogo": "Bel Colle Nebbiolo Langhe 2023", "nome": "Bel Colle Nebbiolo Langhe", "pais": "Itália", "uva": "Nebbiolo", "tipo": "tinto", "corpo": 3, "precoReferencia": 288.0, "porQueDaMatch": "Rosa e cereja com estrutura firme. Perfume com personalidade.", "sirvaCom": "Risoto de funghi, carnes assadas, trufas.", "temperatura": "16 a 18 °C"},
      {"id": "floral-tinto-6", "catalogo": "Sutil Syrah Limited Release 2023", "nome": "Sutil Syrah Limited Release", "pais": "Chile", "uva": "Syrah", "tipo": "tinto", "corpo": 3, "precoReferencia": 238.0, "porQueDaMatch": "Fruta escura, pimenta e violeta. Aromático e encorpado.", "sirvaCom": "Churrasco, costela de porco, embutidos.", "temperatura": "16 a 18 °C"}
    ]
  },
  "frutado": {
    "tinto": [
      {"id": "frutado-tinto-1", "catalogo": "Schroeder Pinot Noir Saurus 2025", "nome": "Schroeder Saurus Pinot Noir", "pais": "Argentina", "uva": "Pinot Noir", "tipo": "tinto", "corpo": 1, "precoReferencia": 147.0, "porQueDaMatch": "Morango, cereja e textura macia. Fácil de gostar, difícil de largar.", "sirvaCom": "Massas, pizza, frango.", "temperatura": "14 a 16 °C"},
      {"id": "frutado-tinto-2", "catalogo": "Luigi Bosca Pinot Noir 2025", "nome": "Luigi Bosca Pinot Noir", "pais": "Argentina", "uva": "Pinot Noir", "tipo": "tinto", "corpo": 1, "precoReferencia": 215.0, "porQueDaMatch": "Fruta vermelha madura e leveza aveludada.", "sirvaCom": "Salmão, risoto, tábua de queijos.", "temperatura": "14 a 16 °C"},
      {"id": "frutado-tinto-3", "catalogo": "Phebus Malbec Reserva 2023", "nome": "Phebus Malbec Reserva", "pais": "Argentina", "uva": "Malbec", "tipo": "tinto", "corpo": 2, "precoReferencia": 101.25, "porQueDaMatch": "Ameixa e amora com taninos macios. Um abraço em forma de vinho.", "sirvaCom": "Hambúrguer, massa com carne, empanadas.", "temperatura": "15 a 17 °C"},
      {"id": "frutado-tinto-4", "catalogo": "Schroeder Merlot Saurus 2023", "nome": "Schroeder Saurus Merlot", "pais": "Argentina", "uva": "Merlot", "tipo": "tinto", "corpo": 2, "precoReferencia": 147.0, "porQueDaMatch": "Frutado, redondo e sem arestas.", "sirvaCom": "Lasanha, carnes de panela, queijos.", "temperatura": "15 a 17 °C"},
      {"id": "frutado-tinto-5", "catalogo": "Brunel de la Gardine Côtes-du-Rhône Tinto 2022", "nome": "Brunel de la Gardine Côtes-du-Rhône", "pais": "França", "uva": "Grenache, Mourvèdre e Syrah", "tipo": "tinto", "corpo": 2, "precoReferencia": 166.5, "porQueDaMatch": "Fruta vermelha madura e um toque de especiarias do sul da França.", "sirvaCom": "Frango assado, ratatouille, pizza.", "temperatura": "15 a 17 °C"},
      {"id": "frutado-tinto-6", "catalogo": "PietraPura Primitivo di Manduria Mandus 2023", "nome": "PietraPura Primitivo di Manduria Mandus", "pais": "Itália", "uva": "Primitivo", "tipo": "tinto", "corpo": 3, "precoReferencia": 228.0, "porQueDaMatch": "Generoso, com fruta em compota e maciez de sobra.", "sirvaCom": "Churrasco, ragu, queijos curados.", "temperatura": "16 a 18 °C"},
      {"id": "frutado-tinto-7", "catalogo": "Luigi Bosca Malbec Vistalba 2024", "nome": "Luigi Bosca Malbec Vistalba", "pais": "Argentina", "uva": "Malbec", "tipo": "tinto", "corpo": 3, "precoReferencia": 199.0, "porQueDaMatch": "Malbec encorpado com fruta madura e final macio.", "sirvaCom": "Picanha, costela, parrilla.", "temperatura": "16 a 18 °C"}
    ],
    "adicional": [
      {"id": "frutado-adicional-1", "catalogo": "Vins Breban Rosé Lavendette 2024", "nome": "Vins Breban Lavendette Rosé", "pais": "França", "uva": "Grenache, Syrah e Cinsault", "tipo": "rose", "corpo": 1, "precoReferencia": 191.0, "porQueDaMatch": "Rosé claro de estilo provençal, com morango e pêssego.", "sirvaCom": "Saladas, peixe grelhado, tarde de sol.", "temperatura": "8 a 10 °C"},
      {"id": "frutado-adicional-2", "catalogo": "Luigi Bosca Rosé Malbec La Linda 2024", "nome": "Luigi Bosca La Linda Rosé de Malbec", "pais": "Argentina", "uva": "Malbec", "tipo": "rose", "corpo": 1, "precoReferencia": 109.0, "porQueDaMatch": "Fruta vermelha fresca e cor viva. Alegria na taça.", "sirvaCom": "Pizza, hambúrguer, sushi.", "temperatura": "8 a 10 °C"},
      {"id": "frutado-adicional-3", "catalogo": "Hermann Rosé de Pinot Noir Bossa 2024", "nome": "Hermann Bossa Rosé de Pinot Noir", "pais": "Brasil", "uva": "Pinot Noir", "tipo": "rose", "corpo": 1, "precoReferencia": 99.0, "porQueDaMatch": "Morango e framboesa num rosé leve da Serra Gaúcha.", "sirvaCom": "Petiscos, saladas, brunch.", "temperatura": "8 a 10 °C"},
      {"id": "frutado-adicional-4", "catalogo": "Arrogant Frog Tutti-Frutti Rosé 2024", "nome": "Arrogant Frog Tutti-Frutti Rosé", "pais": "França", "uva": "Syrah", "tipo": "rose", "corpo": 1, "precoReferencia": 138.0, "porQueDaMatch": "O nome já diz tudo: frutado, divertido e sem complicação.", "sirvaCom": "Piscina, petiscos, pizza.", "temperatura": "8 a 10 °C"},
      {"id": "frutado-adicional-5", "catalogo": "Hermann Espumante Lírica Brut Rosé", "nome": "Hermann Lírica Brut Rosé", "pais": "Brasil", "uva": "Pinot Noir e Chardonnay", "tipo": "espumante", "corpo": 1, "precoReferencia": 142.0, "porQueDaMatch": "Bolhas com cara de fruta vermelha.", "sirvaCom": "Brinde, sushi, frutas vermelhas.", "temperatura": "6 a 8 °C"}
    ],
    "branco": [
      {"id": "frutado-branco-1", "catalogo": "Curatolo Arini Grillo Borgo Selene 2023", "nome": "Curatolo Arini Grillo Borgo Selene", "pais": "Itália", "uva": "Grillo", "tipo": "branco", "corpo": 1, "precoReferencia": 143.0, "porQueDaMatch": "Um branco siciliano com fruta amarela e muita simpatia.", "sirvaCom": "Massa com frutos do mar, peixe assado, caponata.", "temperatura": "8 a 10 °C"},
      {"id": "frutado-branco-2", "catalogo": "Luigi Bosca Chardonnay La Linda 2025", "nome": "Luigi Bosca La Linda Chardonnay", "pais": "Argentina", "uva": "Chardonnay", "tipo": "branco", "corpo": 1, "precoReferencia": 109.0, "porQueDaMatch": "Abacaxi, pera e textura macia. Um branco que abraça.", "sirvaCom": "Frango, massas com molho branco, queijos.", "temperatura": "9 a 11 °C"},
      {"id": "frutado-branco-3", "catalogo": "J. Lohr Chardonnay Cypress 2023", "nome": "J. Lohr Cypress Chardonnay", "pais": "Estados Unidos", "uva": "Chardonnay", "tipo": "branco", "corpo": 2, "precoReferencia": 201.75, "porQueDaMatch": "Fruta madura e um toque cremoso do estilo californiano.", "sirvaCom": "Camarão na manteiga, bacalhau, risoto.", "temperatura": "10 a 12 °C"},
      {"id": "frutado-branco-4", "catalogo": "Arrogant Frog Tutti-Frutti Branco 2023", "nome": "Arrogant Frog Tutti-Frutti Branco", "pais": "França", "uva": "Grenache Blanc, Vermentino e Chardonnay", "tipo": "branco", "corpo": 1, "precoReferencia": 138.0, "porQueDaMatch": "Frutado, leve e bem-humorado.", "sirvaCom": "Saladas, sanduíches, petiscos.", "temperatura": "8 a 10 °C"}
    ]
  },
  "elegante": {
    "branco": [
      {"id": "elegante-branco-1", "catalogo": "Alain Geoffroy Petit Chablis 2023", "nome": "Alain Geoffroy Petit Chablis", "pais": "França", "uva": "Chardonnay", "tipo": "branco", "corpo": 1, "precoReferencia": 392.0, "porQueDaMatch": "Chardonnay sem maquiagem: limão, pedra molhada e precisão.", "sirvaCom": "Ostras, peixe branco, queijo de cabra.", "temperatura": "8 a 10 °C"},
      {"id": "elegante-branco-2", "catalogo": "Château des Gillières Muscadet Sèvre-et-Maine Sur Lie 2024", "nome": "Château des Gillières Muscadet Sur Lie", "pais": "França", "uva": "Melon de Bourgogne", "tipo": "branco", "corpo": 1, "precoReferencia": 208.0, "porQueDaMatch": "Seco, salino e discreto. O clássico francês das ostras.", "sirvaCom": "Ostras, mariscos, peixe na manteiga.", "temperatura": "8 a 10 °C"},
      {"id": "elegante-branco-3", "catalogo": "Bel Colle Gavi di Gavi 2024", "nome": "Bel Colle Gavi di Gavi", "pais": "Itália", "uva": "Cortese", "tipo": "branco", "corpo": 1, "precoReferencia": 265.0, "porQueDaMatch": "Um branco piemontês limpo, com amêndoa e flor branca.", "sirvaCom": "Vitello tonnato, massa ao pesto, peixe.", "temperatura": "8 a 10 °C"},
      {"id": "elegante-branco-4", "catalogo": "Umani Ronchi Verdicchio dei Castelli di Jesi Villa Bianchi 2024", "nome": "Umani Ronchi Verdicchio Villa Bianchi", "pais": "Itália", "uva": "Verdicchio", "tipo": "branco", "corpo": 1, "precoReferencia": 178.0, "porQueDaMatch": "Fresco, com final levemente amendoado. Elegante sem esforço.", "sirvaCom": "Frutos do mar, risoto de limão, saladas.", "temperatura": "8 a 10 °C"},
      {"id": "elegante-branco-5", "catalogo": "Vinho Branco Mâcon-Lugny Les Genièvres Louis Latour 750ml", "nome": "Louis Latour Mâcon-Lugny Les Genièvres", "pais": "França", "uva": "Chardonnay", "tipo": "branco", "corpo": 2, "precoReferencia": 298.0, "porQueDaMatch": "Borgonha branco de textura fina, sem excesso de madeira.", "sirvaCom": "Frango com cogumelos, peixe ao molho, queijos.", "temperatura": "10 a 12 °C"}
    ],
    "tinto": [
      {"id": "elegante-tinto-1", "catalogo": "François Labet Pinot Noir Méditerranée 2023", "nome": "François Labet Pinot Noir Méditerranée", "pais": "França", "uva": "Pinot Noir", "tipo": "tinto", "corpo": 1, "precoReferencia": 238.0, "porQueDaMatch": "Pinot de mão francesa: delicado, seco e preciso.", "sirvaCom": "Pato, cogumelos, salmão.", "temperatura": "14 a 16 °C"},
      {"id": "elegante-tinto-2", "catalogo": "Albino Armani Pinot Nero 2022", "nome": "Albino Armani Pinot Nero", "pais": "Itália", "uva": "Pinot Noir", "tipo": "tinto", "corpo": 1, "precoReferencia": 211.0, "porQueDaMatch": "Leve, terroso e elegante, do norte da Itália.", "sirvaCom": "Vitela, risoto, queijos de média cura.", "temperatura": "14 a 16 °C"},
      {"id": "elegante-tinto-3", "catalogo": "Tenuta di Nozzole Chianti Classico Villa Nozzole 2023", "nome": "Tenuta di Nozzole Chianti Classico", "pais": "Itália", "uva": "Sangiovese", "tipo": "tinto", "corpo": 2, "precoReferencia": 303.0, "porQueDaMatch": "Cereja ácida, ervas e taninos finos. Toscana na taça.", "sirvaCom": "Bistecca, massas ao ragu, pecorino.", "temperatura": "16 a 18 °C"},
      {"id": "elegante-tinto-4", "catalogo": "Château Tour de Luchey Bordeaux 2022", "nome": "Château Tour de Luchey Bordeaux", "pais": "França", "uva": "Merlot e Cabernet", "tipo": "tinto", "corpo": 2, "precoReferencia": 208.0, "porQueDaMatch": "Bordeaux clássico e comedido, feito para acompanhar comida.", "sirvaCom": "Carne assada, cordeiro, queijos duros.", "temperatura": "16 a 18 °C"},
      {"id": "elegante-tinto-5", "catalogo": "Alain Brumont Madiran Torus Rouge 2019", "nome": "Alain Brumont Madiran Torus", "pais": "França", "uva": "Tannat, Cabernet Sauvignon e Cabernet Franc", "tipo": "tinto", "corpo": 3, "precoReferencia": 315.0, "porQueDaMatch": "Firme, seco e sério. Nasceu para carne na brasa.", "sirvaCom": "Costela, cordeiro, confit de pato.", "temperatura": "16 a 18 °C"},
      {"id": "elegante-tinto-6", "catalogo": "Bouza Tannat 2024", "nome": "Bouza Tannat", "pais": "Uruguai", "uva": "Tannat", "tipo": "tinto", "corpo": 3, "precoReferencia": 340.0, "porQueDaMatch": "O Tannat uruguaio de estrutura firme e acabamento polido.", "sirvaCom": "Churrasco gaúcho, parrilla, carnes de caça.", "temperatura": "16 a 18 °C"}
    ],
    "adicional": [
      {"id": "elegante-adicional-1", "catalogo": "Vinho Fortificado Jerez Manzanilla Barbadillo 750ml", "nome": "Barbadillo Manzanilla", "pais": "Espanha", "uva": "Palomino", "tipo": "porto", "corpo": 1, "precoReferencia": 173.0, "porQueDaMatch": "Um vinho de Jerez seco e salino, que se bebe gelado como aperitivo.", "sirvaCom": "Azeitonas, amêndoas, jamón, frituras.", "temperatura": "6 a 8 °C"},
      {"id": "elegante-adicional-2", "catalogo": "Vinho Porto Noval Branco Extra Dry 750ml", "nome": "Noval Porto Branco Extra Dry", "pais": "Portugal", "uva": "Uvas do Douro", "tipo": "porto", "corpo": 1, "precoReferencia": 162.0, "porQueDaMatch": "Porto branco seco: perfeito com tônica e limão.", "sirvaCom": "Aperitivo, porto tônico, castanhas.", "temperatura": "6 a 8 °C"},
      {"id": "elegante-adicional-3", "catalogo": "Hermann Espumante Extra Brut 84 Meses", "nome": "Hermann Extra Brut 84 Meses", "pais": "Brasil", "uva": "Chardonnay e Pinot Noir", "tipo": "espumante", "corpo": 2, "precoReferencia": 329.0, "porQueDaMatch": "Sete anos de espera deixaram este espumante com pão tostado e bolha finíssima.", "sirvaCom": "Ostras, queijos curados, jantar especial.", "temperatura": "8 a 10 °C"},
      {"id": "elegante-adicional-4", "catalogo": "Paul Mas Prima Perla Brut Chardonnay", "nome": "Paul Mas Prima Perla Brut", "pais": "França", "uva": "Chardonnay", "tipo": "espumante", "corpo": 1, "precoReferencia": 229.0, "porQueDaMatch": "Espumante seco e limpo do sul da França.", "sirvaCom": "Aperitivo, peixe cru, canapés.", "temperatura": "6 a 8 °C"}
    ]
  },
  "curva": {
    "branco": [
      {"id": "curva-branco-1", "catalogo": "Tetramythos Roditis 2024", "nome": "Tetramythos Roditis", "pais": "Grécia", "uva": "Roditis", "tipo": "branco", "corpo": 1, "precoReferencia": 225.0, "porQueDaMatch": "Uma uva grega que você talvez nunca tenha provado: cítrica e mineral.", "sirvaCom": "Salada grega, lula grelhada, feta.", "temperatura": "8 a 10 °C"},
      {"id": "curva-branco-2", "catalogo": "Vinho Branco Estate Argyros Atlantis White 750ml", "nome": "Estate Argyros Atlantis", "pais": "Grécia", "uva": "Assyrtiko", "tipo": "branco", "corpo": 2, "precoReferencia": 375.0, "porQueDaMatch": "De Santorini, uma ilha vulcânica. Salino e cortante.", "sirvaCom": "Polvo, peixe grelhado, frutos do mar.", "temperatura": "8 a 10 °C"},
      {"id": "curva-branco-3", "catalogo": "Hiedler Grüner Veltliner Löss 2022", "nome": "Hiedler Grüner Veltliner Löss", "pais": "Áustria", "uva": "Grüner Veltliner", "tipo": "branco", "corpo": 1, "precoReferencia": 351.0, "porQueDaMatch": "A uva da Áustria: pimenta branca, ervas e frescor.", "sirvaCom": "Schnitzel, aspargos, cozinha asiática.", "temperatura": "8 a 10 °C"},
      {"id": "curva-branco-4", "catalogo": "Tetramythos Retsina", "nome": "Tetramythos Retsina", "pais": "Grécia", "uva": "Roditis", "tipo": "branco", "corpo": 1, "precoReferencia": 222.0, "porQueDaMatch": "Um vinho grego com resina de pinho. Estranho no primeiro gole, inesquecível no segundo.", "sirvaCom": "Meze, azeitonas, peixe frito.", "temperatura": "8 a 10 °C"},
      {"id": "curva-branco-5", "catalogo": "Quinta dos Roques Encruzado 2023", "nome": "Quinta dos Roques Encruzado", "pais": "Portugal", "uva": "Encruzado", "tipo": "branco", "corpo": 2, "precoReferencia": 348.0, "porQueDaMatch": "A uva branca mais nobre do Dão, pouco conhecida fora de Portugal.", "sirvaCom": "Bacalhau, aves, queijos amanteigados.", "temperatura": "10 a 12 °C"},
      {"id": "curva-branco-6", "catalogo": "Marcelo Retamal RETA Sémillon 2023", "nome": "RETA Sémillon", "pais": "Chile", "uva": "Sémillon", "tipo": "branco", "corpo": 2, "precoReferencia": 290.0, "porQueDaMatch": "Sémillon de enólogo inquieto: textura, cera de abelha e frescor.", "sirvaCom": "Peixes gordos, frango, queijos.", "temperatura": "10 a 12 °C"}
    ],
    "tinto": [
      {"id": "curva-tinto-1", "catalogo": "Tetramythos Mavro Kalavrytino 2024", "nome": "Tetramythos Mavro Kalavrytino", "pais": "Grécia", "uva": "Mavro Kalavrytino", "tipo": "tinto", "corpo": 1, "precoReferencia": 225.0, "porQueDaMatch": "Uma uva grega rara, leve e com especiarias.", "sirvaCom": "Moussaká, cordeiro com ervas, berinjela.", "temperatura": "14 a 16 °C"},
      {"id": "curva-tinto-2", "catalogo": "Anselmo Mendes Pardusco 2023", "nome": "Anselmo Mendes Pardusco", "pais": "Portugal", "uva": "Alvarelhão, Pedral e Caínho", "tipo": "tinto", "corpo": 1, "precoReferencia": 225.0, "porQueDaMatch": "Tinto de uvas quase esquecidas do Minho, servido fresquinho.", "sirvaCom": "Bacalhau, petiscos, polvo.", "temperatura": "12 a 14 °C"},
      {"id": "curva-tinto-3", "catalogo": "Tetramythos Agiorgitiko 2023", "nome": "Tetramythos Agiorgitiko", "pais": "Grécia", "uva": "Agiorgitiko", "tipo": "tinto", "corpo": 2, "precoReferencia": 225.0, "porQueDaMatch": "O tinto grego de São Jorge: cereja, especiarias e maciez.", "sirvaCom": "Carnes grelhadas, massas, queijos.", "temperatura": "15 a 17 °C"},
      {"id": "curva-tinto-4", "catalogo": "Kompassus Colheita Tinto 2022", "nome": "Kompassus Colheita Tinto", "pais": "Portugal", "uva": "Baga e Touriga Nacional", "tipo": "tinto", "corpo": 2, "precoReferencia": 191.0, "porQueDaMatch": "Baga, a uva teimosa da Bairrada, com acidez e personalidade.", "sirvaCom": "Leitão, arroz de pato, embutidos.", "temperatura": "15 a 17 °C"},
      {"id": "curva-tinto-5", "catalogo": "Raka Pinotage 2022", "nome": "Raka Pinotage", "pais": "África do Sul", "uva": "Pinotage", "tipo": "tinto", "corpo": 2, "precoReferencia": 277.0, "porQueDaMatch": "A uva que só a África do Sul tem: fruta escura e um toque defumado.", "sirvaCom": "Churrasco, costela de porco, hambúrguer.", "temperatura": "16 a 18 °C"},
      {"id": "curva-tinto-6", "catalogo": "Albino Armani Casetta Foja Tonda 2020", "nome": "Albino Armani Casetta Foja Tonda", "pais": "Itália", "uva": "Casetta", "tipo": "tinto", "corpo": 3, "precoReferencia": 305.0, "porQueDaMatch": "Uma uva que quase desapareceu dos Alpes italianos. Rara e intensa.", "sirvaCom": "Carnes de caça, polenta, queijos curados.", "temperatura": "16 a 18 °C"},
      {"id": "curva-tinto-7", "catalogo": "Tenuta Castelbuono Montefalco Rosso Ziggurat 2022", "nome": "Tenuta Castelbuono Ziggurat Montefalco Rosso", "pais": "Itália", "uva": "Sangiovese e Sagrantino", "tipo": "tinto", "corpo": 3, "precoReferencia": 329.0, "porQueDaMatch": "Da Úmbria, com a potência da Sagrantino e uma vinícola que é obra de arte.", "sirvaCom": "Cordeiro, javali, massas com trufa.", "temperatura": "16 a 18 °C"}
    ],
    "adicional": [
      {"id": "curva-adicional-1", "catalogo": "Terranoble Naranjo Disidente 2021", "nome": "Terranoble Disidente Naranjo", "pais": "Chile", "uva": "Pinot Blanc e Pinot Gris", "tipo": "laranja", "corpo": 1, "precoReferencia": 175.5, "porQueDaMatch": "Um branco feito como tinto, com as cascas. Cor de âmbar e muita conversa.", "sirvaCom": "Comida indiana, queijos, cogumelos.", "temperatura": "10 a 12 °C"},
      {"id": "curva-adicional-2", "catalogo": "Arrogant Frog Orange in Terrae Veritas 2024", "nome": "Arrogant Frog Orange in Terrae Veritas", "pais": "França", "uva": "Grenache Blanc, Grenache Gris e Macabeu", "tipo": "laranja", "corpo": 1, "precoReferencia": 209.0, "porQueDaMatch": "Laranja de porta de entrada: fresco, com chá e damasco.", "sirvaCom": "Curry, falafel, tábua de queijos.", "temperatura": "10 a 12 °C"},
      {"id": "curva-adicional-3", "catalogo": "Albino Armani Orange From The Basement 2022", "nome": "Albino Armani Orange From The Basement", "pais": "Itália", "uva": "Pinot Grigio", "tipo": "laranja", "corpo": 1, "precoReferencia": 245.25, "porQueDaMatch": "Pinot Grigio com contato de casca, cor de cobre e textura.", "sirvaCom": "Risoto, frango ao limão, antepastos.", "temperatura": "10 a 12 °C"},
      {"id": "curva-adicional-4", "catalogo": "Vinho Laranja Naranza Malvasia De Candia Delta Do Jacui 750ml", "nome": "Delta do Jacuí Naranza Malvasia de Cândia", "pais": "Brasil", "uva": "Malvasia de Cândia", "tipo": "laranja", "corpo": 1, "precoReferencia": 250.0, "porQueDaMatch": "Laranja gaúcho, feito aqui do lado. Perfumado e surpreendente.", "sirvaCom": "Peixe de rio, comida árabe, queijos.", "temperatura": "10 a 12 °C"},
      {"id": "curva-adicional-5", "catalogo": "José de Sousa Branco Puro Talha 2017", "nome": "José de Sousa Puro Talha Branco", "pais": "Portugal", "uva": "Antão Vaz, Manteúdo e Diagalves", "tipo": "laranja", "corpo": 2, "precoReferencia": 281.1, "porQueDaMatch": "Feito em talhas de barro, como os romanos faziam no Alentejo.", "sirvaCom": "Bacalhau, carne de porco, queijos de ovelha.", "temperatura": "11 a 13 °C"},
      {"id": "curva-adicional-6", "catalogo": "Villard Pinot Grigio Ramato JCV 2024", "nome": "Villard Pinot Grigio Ramato", "pais": "Chile", "uva": "Pinot Grigio", "tipo": "laranja", "corpo": 1, "precoReferencia": 274.0, "porQueDaMatch": "Ramato quer dizer acobreado: fruta, textura e cor de pôr do sol.", "sirvaCom": "Salmão, sushi, saladas com frutas.", "temperatura": "10 a 12 °C"}
    ]
  }
}
```

Distribuição por perfil:

| Perfil | Brancos | Tintos (leve / médio / estruturado) | Adicionais |
|---|---|---|---|
| Fresco & Cítrico | 6 | 7 (3 / 2 / 2) | 4 espumantes |
| Floral & Aromático | 6 | 6 (2 / 2 / 2) | 1 rosé, 2 espumantes, 1 fortificado |
| Frutado & Macio | 4 | 7 (2 / 3 / 2) | 4 rosés, 1 espumante rosé |
| Seco & Elegante | 5 | 6 (2 / 2 / 2) | 2 fortificados secos, 2 espumantes |
| Fora da Curva | 6 | 7 (2 / 3 / 2) | 6 laranjas |

---

## 12. Acessibilidade, SEO e desempenho

- Contraste AA em todo texto. Alvos de toque com no mínimo 44x44px.
- Cada tela tem um único `<h1>` (título da pergunta ou nome do perfil).
- Imagens das garrafas com `alt=""` (decorativas; o nome do vinho já está em texto).
- `<html lang="pt-BR">`. `<title>`: "Match do Vinho · Armazém dos Importados".
- Open Graph: título "Descubra seu match em 60 segundos", descrição "Cinco perguntas sobre você. Três vinhos escolhidos para o seu paladar.", imagem `/og-image.jpg`.
- **Demo:** incluir `<meta name="robots" content="noindex, nofollow">` enquanto for demonstração (config `isDemo: true`).
- **Painel:** `/painel` e `/api/*` respondem sempre com `X-Robots-Tag: noindex, nofollow` (via `vercel.json` headers) e o painel também tem a meta `noindex`, mesmo quando `isDemo` for `false`. O painel não é linkado em nenhum lugar do quiz.
- Formulário de e-mail: `label` associado, erro anunciado via `aria-describedby` + `aria-live="polite"`, foco volta para o campo quando o envio falha na validação.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95. Pré-carregar as 6 garrafas com `<link rel="preload">` apenas na tela de loading, não na intro.

---

## 13. Configurações (`src/data/config.ts`)

```ts
export const CONFIG = {
  isDemo: true,
  campaignName: 'MATCH 3',
  campaignSubtitle: 'o trio do seu paladar',
  showPrices: true,
  trioDiscountPercent: 20 as number | null,       // confirmado com o cliente em 26/09/2026
  priceNote: 'Preços de referência do catálogo de setembro de 2026, sujeitos a alteração e à disponibilidade em loja.',
  storeName: 'Armazém dos Importados',
  storeAddress: "Rua Anita Garibaldi, 448, Mont'Serrat, Porto Alegre",
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Armaz%C3%A9m%20dos%20Importados%20Rua%20Anita%20Garibaldi%20448%20Porto%20Alegre',
  whatsappNumber: '5551997647911', // formato 55 + DDD + número; vazio esconde o botão
  loadingMs: 1400,
  adminPath: '/painel',          // painel da loja, sem senha na fase de demo
};
```

> A antiga opção `tastingPromise` foi **removida**: a loja não abre garrafas para prova. Não recriar essa opção nem o texto correspondente.

---

## 14. Registro de matches e painel da loja

### 14.1 Por que não um arquivo local em produção
Na Vercel, o sistema de arquivos das funções é somente leitura e efêmero: um `leads.json` gravado em produção some a cada deploy ou reinício. Por isso:
- **Desenvolvimento:** `server/store-file.ts` grava em `.data/leads.json` (criar a pasta se não existir; escrita atômica: gravar em `.tmp` e renomear).
- **Produção:** `server/store-blob.ts` usa **Vercel Blob** via `@vercel/blob`, num store **privado** criado por API e conectado ao projeto (a Vercel injeta `BLOB_READ_WRITE_TOKEN`). Não é SQL e não exige cadastro em serviço externo.
- Por que não gravar direto no Git a partir do site: uma função da Vercel só consegue dar push com um token pessoal do GitHub guardado nas variáveis do projeto, e esse token teria de ser criado e colado à mão. O Blob recebe cada match na hora; o Git recebe a cópia pelo Actions (14.7).
- `getStore()` escolhe o Blob se `BLOB_READ_WRITE_TOKEN` existir; senão, o arquivo. Em produção (`VERCEL_ENV === 'production'`) sem Blob, `POST` responde `503` e o painel mostra o aviso *"Banco de dados não configurado."*; o quiz continua funcionando normalmente.

### 14.2 Modelo do registro

```ts
// server/store.ts
export interface TrioItem {
  tier: Tier; slot: Slot;
  wineId: string; nome: string; tipo: Wine['tipo'];
  precoReferencia: number | null;
}
export interface TrioShown { rotation: number; shownAt: string; items: TrioItem[]; } // sempre 3 itens
export interface Lead {
  id: string;                 // uuid gerado no cliente (idempotência)
  email: string;              // normalizado
  profileId: ProfileId;
  profileName: string;        // cópia do nome exibido
  corpoLevel: 1 | 2 | 3;
  answersKey: string;         // "q1:a|q2:c|..."
  shareCode: string;          // o mesmo valor do ?m=, para reabrir o resultado
  trios: TrioShown[];         // [0] = trio inicial; demais = "ver outro trio"
  channel: 'online' | 'loja'; // 'loja' quando ?modo=loja
  createdAt: string;          // ISO, definido pelo servidor
  updatedAt: string;
}
export interface LeadStore {
  create(lead: Lead): Promise<'created' | 'exists'>;
  appendTrio(id: string, trio: TrioShown): Promise<'ok' | 'not_found'>;
  list(): Promise<Lead[]>;    // mais recentes primeiro
}
```

No Blob: cada lead é um arquivo `leads/{id}.json` (acesso privado, sobrescrito no `appendTrio`). `list()` pagina `list({ prefix: 'leads/' })`, lê os arquivos em paralelo (até 8 simultâneos) e ordena por `createdAt`. Limite de 2.000 registros por listagem na demo.

### 14.3 API (`api/leads.ts`, `api/leads/[id].ts`)
| Método | Rota | Corpo | Resposta |
|---|---|---|---|
| `POST` | `/api/leads` | `{ id, email, answersKey, rotation, channel }` | `201` criado · `200` já existia (mesmo `id`) · `400` inválido |
| `PATCH` | `/api/leads/{id}` | `{ rotation }` | `200` · `404` · `400` |
| `GET` | `/api/leads` | (sem corpo) | `200 { leads: Lead[] }`; com `?format=csv`, o mesmo CSV do painel |

- **O servidor recalcula tudo.** O cliente envia só e-mail, `answersKey`, `rotation` e canal; o servidor roda `computeProfile()` e `selectTrio()` (os mesmos módulos de `src/lib/`, importados pelas funções) e monta perfil e vinhos. Assim ninguém grava no banco um perfil ou vinho inventado, e o painel sempre bate com o que o quiz exibiu.
- Validação (`server/validate.ts`): e-mail válido e normalizado (até 254 caracteres); `answersKey` com as 5 perguntas e opções `a`..`e`; `rotation` inteiro entre 0 e 999; `id` no formato uuid; corpo até 2 KB. Qualquer falha → `400 { error }`, sem ecoar o conteúdo recebido.
- `PATCH` ignora rotação já registrada naquele lead (não duplica trio).
- Respostas com `Cache-Control: no-store` e `X-Robots-Tag: noindex, nofollow`.
- Não registrar e-mails em `console.log` no servidor.

### 14.4 Cliente (`src/lib/leads.ts`)
- `saveLead(state)`: `POST` com `keepalive: true`, timeout de 8s via `AbortController`. Uma nova tentativa após 3s; depois disso, `LEAD_FAILED` guarda o payload para reenviar na próxima ação na tela de resultado.
- `appendTrio(leadId, rotation)`: `PATCH` em segundo plano, sem retry.
- Nenhum erro de rede aparece para o usuário do quiz.

### 14.5 Painel da loja (`/painel`)
- Acesso: basta abrir `https://<dominio>/painel`. **Sem senha nesta fase de demonstração**, por decisão do cliente. Não linkar em lugar nenhum do quiz. `main.tsx` decide pela `location.pathname` (sem biblioteca de rotas).
- Mesma identidade do quiz, mas em modo de trabalho: denso, legível, sem animações de entrada.
- Topo: `ARMAZÉM DOS IMPORTADOS` · título **"Matches registrados"** · contagem total ("128 pessoas, 141 matches") e contagem por perfil (5 números em linha, cada um com a cor de destaque do perfil em um marcador pequeno).
- Faixa de aviso discreta enquanto `isDemo`: *"Painel de demonstração, sem senha. Não compartilhe este endereço fora da equipe."*
- Controles: busca por e-mail (filtra no cliente), filtro por perfil, filtro por canal (online / loja), botão **"Atualizar"** e botão **"Baixar CSV"**.
- Tabela (mais recentes primeiro), colunas: **Data e hora** (`dd/mm/aaaa hh:mm`, fuso `America/Sao_Paulo`) · **E-mail** · **Perfil** · **O Seguro** · **A Descoberta** · **A Surpresa** · **Canal**. Cada vinho mostra nome e, em texto secundário, tipo e preço. Se houver mais de um trio, uma linha "+ 2 outros trios vistos" expande os demais na própria linha.
- Link "Ver resultado" em cada linha abre `/?m={shareCode}` em nova aba (reproduz exatamente o que a pessoa viu).
- Abaixo de 900px, a tabela vira lista de blocos empilhados (um por registro), sem scroll horizontal.
- Estados: carregando ("Carregando matches..."), vazio (*"Nenhum match registrado ainda. Assim que alguém concluir o quiz, ele aparece aqui."*), erro (*"Não foi possível carregar os matches. Tente atualizar."* com botão), banco não configurado (14.1).
- CSV: UTF-8 com BOM (para abrir certo no Excel), separador `;`, colunas `data;email;perfil;seguro;descoberta;surpresa;canal;outros_trios;link_resultado`, nome `matches-armazem-{aaaa-mm-dd}.csv`.
- **Quando sair da demonstração**, proteger o painel antes de qualquer divulgação (por exemplo, Vercel Password Protection ou autenticação básica em middleware). Fica registrado como pendência de lançamento.

### 14.6 Testes (`server/__tests__/leads.test.ts`)
1. `POST` com payload válido cria o registro com perfil e trio iguais aos de `computeProfile`/`selectTrio` para o mesmo `answersKey` e `rotation`.
2. `POST` repetido com o mesmo `id` não duplica.
3. `POST` com e-mail inválido, `answersKey` incompleto ou `rotation` negativo → `400`.
4. `PATCH` acrescenta trio novo, ignora rotação repetida, `404` para id inexistente.
5. `list()` devolve os mais recentes primeiro. Rodar os testes contra o adaptador de arquivo num diretório temporário.

### 14.7 Cópia dos matches no repositório Git
- Workflow `.github/workflows/backup-matches.yml`: `schedule` a cada 30 minutos + `workflow_dispatch`, `permissions: contents: write`.
- Passos: `curl` em `${SITE_URL}/api/leads` e `${SITE_URL}/api/leads?format=csv`; se o JSON for válido, gravar `data/matches.json` e `data/matches.csv` no branch `dados` (criar o branch órfão na primeira execução) e fazer commit só se houver mudança, com autor `github-actions[bot]`.
- O branch `dados` não gera deploy: `vercel.json` tem `"git": { "deploymentEnabled": { "dados": false } }`.
- O repositório deve continuar **privado**: os arquivos contêm e-mails.

---

## 15. Deploy (GitHub + Vercel)

### 15.1 Preparação do repositório
- `README.md` com: o que é, como rodar (`npm install`, `npm run dev`), como gerar build (`npm run build`), onde editar perguntas, perfis, vinhos e configurações, **como acessar o painel (`/painel`)**, onde ficam os dados em desenvolvimento (`.data/leads.json`) e como funciona o armazenamento em produção (Blob + cópia no branch `dados`).
- `.gitignore` padrão de Vite (`node_modules`, `dist`, `.env*`, `.DS_Store`) **mais `.data/`** (e-mails nunca vão para o Git).
- Dependências novas: `@vercel/blob` (produção) e `@vercel/node` (tipos, dev). O `tsconfig` cobre `src/`, `api/` e `server/`.
- `package.json` com scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `test` (`vitest run`), `optimize:bottles`.
- `vercel.json` (o rewrite da SPA **não pode** capturar `/api`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "git": { "deploymentEnabled": { "dados": false } },
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/painel", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] },
    { "source": "/api/(.*)", "headers": [
      { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
      { "key": "Cache-Control", "value": "no-store" }
    ] }
  ]
}
```

### 15.2 Publicação
1. `npm run test` e `npm run build` precisam passar sem erro nem warning de TypeScript.
2. `git init`, commit inicial. Conferir que `.data/` não entrou no commit.
3. Se o `gh` estiver autenticado: `gh repo create match-do-vinho-armazem --private --source=. --push`. Se não estiver, parar aqui e mostrar ao usuário os comandos exatos para criar o repositório e dar o push.
4. Na Vercel: **Add New → Project → Import** o repositório. Preset Vite é detectado automaticamente. Alternativa via CLI: `npx vercel` e depois `npx vercel --prod`.
5. **Banco de dados:** criar um Blob store privado por API (Vercel REST/MCP) com `projectId` do projeto; a Vercel conecta e injeta `BLOB_READ_WRITE_TOKEN`. Fazer um novo deploy de produção depois de conectar. Nenhum passo manual no painel da Vercel.
6. **Cópia no Git:** ajustar `SITE_URL` no workflow de backup para o domínio de produção e disparar o workflow uma vez (ou aguardar o agendamento).
7. Verificar em produção: concluir um quiz com um e-mail de teste e conferir que ele aparece em `/painel`.
8. Cada push na `main` gera deploy de produção; cada branch gera URL de preview (útil para mostrar variações ao cliente). Previews usam o mesmo banco, a menos que se conecte um banco separado ao ambiente Preview.

---

## 16. Checklist de aceite (o Claude Code deve verificar antes de entregar)

- [ ] A Intro pede e-mail antes de tudo; o quiz não começa sem e-mail válido e confirmação 18+; a mensagem de erro aparece para e-mail inválido.
- [ ] "Refazer o quiz" mantém o e-mail; "Trocar e-mail" limpa.
- [ ] As 5 perguntas aparecem uma de cada vez, com as 5 opções logo abaixo, textos idênticos à seção 4.
- [ ] Ao responder, a pergunta some em fade out e a próxima entra em fade in, sem cliques duplos possíveis.
- [ ] "Voltar" funciona e mantém a resposta anterior destacada.
- [ ] Recarregar a página no meio do quiz retoma na mesma pergunta com as respostas e o e-mail preservados.
- [ ] Fechar a aba e abrir de novo começa do zero.
- [ ] O resultado mostra nome do perfil, tagline, descrição e 3 cards com **exatamente um tinto, um branco e um adicional**, nas faixas O SEGURO, A DESCOBERTA e A SURPRESA.
- [ ] `d,d,d,d,d` mostra o tinto como O SEGURO (regra de corpo).
- [ ] "Ver outro trio" troca os rótulos sem trocar o perfil, e o novo trio aparece no painel como "outro trio visto".
- [ ] O link `?m=` reproduz exatamente o mesmo resultado em outra aba, sem pedir e-mail e **sem criar registro**.
- [ ] Concluir o quiz cria **um** registro com e-mail, perfil e os três vinhos exibidos; recarregar a tela de resultado não duplica.
- [ ] Com a API fora do ar, o quiz chega ao resultado normalmente, sem erro visível.
- [ ] `/painel` lista os registros (mais recentes primeiro), filtra por e-mail, perfil e canal, e o CSV abre certo no Excel com acentos.
- [ ] O bloco de condição diz "Na loja, o MATCH 3 sai com 20% de desconto." e os valores batem com a soma menos 20%; nenhum preço riscado.
- [ ] Nenhum texto promete degustação ou garrafa aberta: `grep -rni "abre um\|degust\|taça para provar" src/` volta vazio (a frase da Intro para menores de 18, "A gente guarda uma taça para você.", é permitida).
- [ ] O botão do WhatsApp abre `wa.me/5551997647911` com a mensagem da seção 9.3.
- [ ] As 6 imagens de garrafa estão em `public/bottles/`, sem texto nos rótulos, com fundo transparente; o fallback SVG aparece se uma delas for removida.
- [ ] Nenhum travessão (—) ou meia-risca (–) em texto visível: `grep -rn "—\|–" src/` deve voltar vazio.
- [ ] Rodapé "Aprecie com moderação. Venda proibida para menores de 18 anos." em todas as telas do quiz; confirmação de 18+ na intro.
- [ ] Testes do Vitest (pontuação, seleção e API) passando; build sem erros; Lighthouse mobile dentro das metas.
- [ ] Testado em 375px (iPhone SE), 390px, 768px e 1440px, inclusive o painel.
- [ ] `.data/` fora do Git; nenhum e-mail em logs.
- [ ] Deploy público funcionando, Blob conectado, branch `dados` recebendo a cópia, e URLs do quiz e do painel informadas ao usuário.
