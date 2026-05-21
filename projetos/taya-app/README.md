# Taya App Prototype (Mobile)

Protótipo de onboarding + tela inicial inspirado no padrão visual do app meutudo, adaptado para serviços da Taya:

- FGTS
- Crédito CLT
- Saque Fácil (saque com cartão de crédito)

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Radix UI primitives
- Estrutura de componentes no estilo shadcn/ui

## Executar localmente

```bash
cd taya-app
npm install
npm run dev
```

### Porta

O projeto está configurado para subir em **`4173`** (com `strictPort: true`).

URL esperada:

`http://localhost:4173`

## Telas entregues

1. Onboarding (6 passos)
2. Home inicial com cards personalizados por interesse

## Ambientes e publicacao

- **Oficial:** `https://canaldireto-oficial.netlify.app/`
  - Branch: `main`
  - Uso: referencia para dev e QA
  - Env: `VITE_APP_ENV=official`

- **Playground:** `https://canaldireto-playground.netlify.app/`
  - Branch: `playground/design`
  - Uso: exploracao de design
  - Env: `VITE_APP_ENV=playground`
  - Exibe badge fixa: `Not Production`

### Fluxo de trabalho

1. Desenvolver e testar mudancas em `playground/design`.
2. Quando aprovado por design/produto, abrir PR para `main`.
3. Somente o que estiver em `main` deve ser considerado oficial para implementacao.
