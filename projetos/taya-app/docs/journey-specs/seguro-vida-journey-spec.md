---
agent: ellen-damasceno
project: podeja-canal-direto
journey: seguro-vida-fake-door
platform: Web (PWA Mobile-first)
date: 2026-07-30
depends_on: []
status: draft
---

## Resumo executivo

Fake door para medir interesse no produto Seguro de Vida antes de desenvolver a jornada completa de contratação. Usuário vê a landing, clica "Quero ser avisado quando disponível" e o interesse é registrado (localStorage por ora — TODO backend).

## Escopo

- Novo: landing `/seguro-vida` (`src/pages/seguro-vida/SeguroVidaLandingPage.tsx`).
- Card "Para você agora" do painel conectado: quando o interesse do usuário (`RecomendacoesContext`) aponta para `"seguro"`, o CTA navega para `/seguro-vida`.
- **Fora de escopo v1:** simulador, contratação, qualquer fluxo além do registro de interesse.

## Telas

| screen_id | nome | status |
|-----------|------|--------|
| SV-01 | Landing Seguro de Vida (`/seguro-vida`) | new |

## Regras críticas

- **Sem banner de aviso "produto ainda não disponível"** — havia um banner âmbar nesse sentido numa versão anterior; foi removido por decisão de produto. Hoje a única indicação de que o produto ainda não está disponível é o texto de rodapé abaixo do CTA: *"Em breve disponível no Pode Já."*.
- Hero: imagem `/images/banner-intro-seguros.png` (`object-cover object-right`, com `onError` ocultando a imagem se falhar) — segue o mesmo padrão visual das outras 5 landings de produto (CLT, FGTS, Crédito Pessoal, Assistências, Energia):
  - **Mobile:** overlay sólido `bg-[#FD5F31]/75` + filtro escuro `bg-black/25` (contraste do texto), texto ocupa a largura toda.
  - **Desktop:** gradiente horizontal `linear-gradient(90deg, #D94E28 0%, rgba(253,95,49,0.70) 40%, rgba(253,95,49,0) 85%)`, texto limitado a `max-w-[55%]` (imagem visível à direita).
- Textos do hero: eyebrow "Seguro de Vida", título "Proteção para você e sua família", subtítulo "Com parcelas que cabem no bolso".
- 3 pills de benefício rápido ("Aprovação simplificada", "Cobertura completa", "Parcelas acessíveis") + card com 3 features (Morte natural ou acidental, Invalidez permanente, Assistência funeral) + FAQ (2 perguntas, de `src/data/faq.ts["seguro-vida"]`).
- CTA: "Quero ser avisado quando disponível" → `registrarInteresse("seguro-vida")` (hook `useInteresse`, persiste em `localStorage: podeja_interesses`) + toast "Ótimo! Você será notificado assim que o produto estiver disponível." — TODO: salvar interesse no backend (comentário explícito no código).
- Se o usuário já registrou interesse (`interesses.includes("seguro-vida")`), o CTA vira um botão desabilitado "Interesse registrado" (com ícone de check) em vez do CTA ativo.
- Card no dashboard: quando `interest === "seguro"` (contexto de recomendações), o CTA "Para você agora" navega para `/seguro-vida` (`App.tsx:3699`). Não há uma imagem de card dedicada para esse interesse — reaproveita `card-dash-security.png` (genérica).

## Eventos Amplitude

Nenhum evento de analytics implementado no código hoje — lista abaixo é proposta, `qa_status: pending`:

- `seguro_vida_landing_viewed`
- `seguro_vida_interest_registered` — ao clicar "Quero ser avisado quando disponível"

## Open questions

- Copy final e cobertura real do produto (hoje é conteúdo placeholder de fake door).
- Se/quando este fake door vira jornada real, será preciso simulador + contratação — fora de escopo deste spec.
