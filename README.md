# Design Test Projects

Repositorio unico para projetos de teste e validacao de design.

## Estrutura

- `projetos/taya-app/` - Protótipo mobile da Taya (onboarding + home) em React/Vite.

## Fluxo sugerido

1. Cada novo experimento entra em `projetos/<nome-do-projeto>/`.
2. Use Pull Requests para gerar previews no Netlify.
3. `main` fica como branch de referencia para o que ja foi validado.

## Ambientes Netlify (Canal Direto)

- **Oficial (dev/qa):** `https://canaldireto-oficial.netlify.app/`
  - Branch de producao: `main`
  - Env var: `VITE_APP_ENV=official`
- **Playground (design):** `https://canaldireto-playground.netlify.app/`
  - Branch de producao: `playground/design`
  - Env var: `VITE_APP_ENV=playground`

### Regras do fluxo

1. Tudo que e exploracao entra primeiro em `playground/design`.
2. O que virar referencia para dev/qa sobe para `main` via PR.
3. Dev e QA usam apenas a URL oficial como fonte de verdade.
4. O playground exibe a tag fixa `Not Production` para evitar confusao.
