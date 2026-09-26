# Match do Vinho · Armazém dos Importados

Demo do quiz "Descubra seu match em 60 segundos": a pessoa informa o e-mail, responde cinco perguntas sobre gostos do dia a dia, recebe um perfil de paladar e um trio de vinhos (MATCH 3) do acervo do Armazém. Cada match concluído é registrado e fica visível para a equipe da loja em `/painel`.

A especificação completa está em [`match-do-vinho-spec.md`](match-do-vinho-spec.md).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173 (quiz) e http://localhost:5173/painel
npm test           # pontuação, seleção e API
npm run build      # gera dist/
```

Node 20 ou superior. Em desenvolvimento os matches ficam em `.data/leads.json` (fora do Git).

## Onde editar

| O quê | Arquivo |
|---|---|
| Perguntas e pesos | `src/data/questions.ts` |
| Perfis, faixas e textos das faixas | `src/data/profiles.ts` |
| Vinhos (83 rótulos) | `src/data/wines.ts` |
| Desconto, WhatsApp, endereço, preços | `src/data/config.ts` |
| Cores e fontes | `src/styles/tokens.css` |
| Imagens das garrafas | `assets-src/bottles/*.png` e depois `npm run optimize:bottles` |

## Onde ficam os dados

- **Site publicado:** cada match é um arquivo privado no **Vercel Blob** do projeto (`leads/{id}.json`). O painel `/painel` lê daí.
- **Cópia no Git:** o workflow `.github/workflows/backup-matches.yml` roda a cada 30 minutos e grava `data/matches.json` e `data/matches.csv` no branch **`dados`** deste repositório. O branch `dados` não gera deploy.
- O repositório precisa continuar **privado**: os arquivos têm e-mails.

## Painel da loja

`https://<domínio>/painel`: lista de matches com busca por e-mail, filtros por perfil e canal, e download em CSV. **Sem senha nesta fase de demonstração**; proteger antes de divulgar a campanha.

## Modo loja

`/?modo=loja` esconde "Como chegar" e WhatsApp, e depois de 90 segundos sem interação no resultado volta ao início apagando tudo, inclusive o e-mail. Para tablet no balcão.

## Garrafas

As seis garrafas foram geradas no Magnific (Seedream 5 Pro, 3:4, seed 448) com rótulo em branco, recortadas com remoção de fundo e convertidas para WebP por `scripts/optimize-bottles.mjs`. Se uma imagem faltar, o card mostra uma silhueta em SVG.
