---
agent: journey-spec-writer
project: taya-app
journey: Crédito Pessoal (simulação → proposta → assinatura → contrato ativo)
platform: Mobile
date: 2026-08-18
depends_on: []
status: draft
---

# Journey Spec - Crédito Pessoal

## Changelog

- **2026-08-18** — Assinatura passou a ir **direto para a Unico**, sem modo SMS. A Zema liberou acesso ao link de assinatura da Unico (antes os devs haviam informado que não havia acesso). Mudanças:
  - Removido o modo SMS (`?modo=sms|unico`) da tela CP-14 — a assinatura agora só acontece via Unico.
  - Nova tela **CP-17 Redirecionando** (`/credito-pessoal/redirecionando`), mesmo padrão visual do redirecionamento externo já usado no CLT/FGTS: abre o link da Unico automaticamente após 3s, com botão de fallback após 10s caso o navegador bloqueie o popup.
  - **Bugfix:** nos 3 erros de assinatura (`?erro=biometria_falhou/documento_invalido/sessao_expirada`), o botão "Tentar novamente" não levava a lugar nenhum (tela em branco) — corrigido para reabrir o link da Unico direto.
  - Linguagem "Reenviar SMS" removida (tela de assinatura e card "Você tem uma proposta aguardando assinatura" no dashboard), trocada por "Assinar agora".
  - Seção 5.3, inventário de telas (seção 4), mapa da jornada (seção 3) e taxonomia de eventos (seção 7) atualizados para refletir a mudança. Ver PR correspondente no GitHub.
  - Aproveitado para sincronizar a seção 5.6 com duas correções anteriores desta mesma sessão que ainda não tinham sido refletidas aqui: `?cp=andamento` e `?cp=ativo` agora também ativam card em "Para você agora" (antes só mudavam o card padrão da grade de produtos), e `?cp=video` foi adicionado como atalho.

> **Nota sobre este documento:** esta é uma spec **retroativa** — mapeia a jornada de Crédito Pessoal exatamente como ela existe hoje no código (`src/pages/credito-pessoal/*.tsx` + lógica de dashboard em `src/App.tsx`), incluindo a lógica que ativa os cards em "Para você agora". Não descreve uma mudança nova; serve como fonte única de verdade para alinhar Design/PO/Analytics antes de qualquer evolução futura (ex.: substituir os mocks pela API real da Zema). Toda regra abaixo foi extraída lendo o código-fonte — nenhum comportamento foi inferido ou inventado. Onde o código diverge do que seria esperado (bugs, inconsistências, dados mockados em duplicidade), isso está sinalizado explicitamente na seção 6 e nas Open Questions.

---

## 1) Resumo executivo da jornada

- **Problema que a documentação resolve:** a jornada de Crédito Pessoal tem 15 telas + uma camada de ativação de cards no dashboard, todas construídas com dados mockados e parâmetros de URL "DESIGN ONLY" que simulam estados reais de API (elegibilidade, análise, assinatura, contrato). Não existe hoje nenhum documento único que amarre tela → regra → estado → evento, o que torna QA, handoff de PO e instrumentação de analytics dependentes de interpretação individual do código.
- **Resultado esperado para o usuário:** simular o crédito, enviar uma proposta, assinar o contrato e acompanhar o status (incluindo pendências/reprovação) de forma linear, com o dashboard sinalizando proativamente quando há algo pendente de ação (oferta pronta, assinatura pendente, chamada de vídeo agendada, contrato recém-ativado).
- **Impacto esperado para o negócio:** ao formalizar esta spec, qualquer integração futura com a API real da Zema Financeira (elegibilidade, simulação, KYC, assinatura Unico, desembolso) tem um contrato claro de onde cada mock precisa virar chamada real, e o time de analytics ganha uma taxonomia de eventos para implementar do zero (hoje **não existe nenhuma instrumentação real** — ver seção 7).

## 2) Escopo e contexto

- **Tipo:** documentação retroativa de jornada existente (não é uma evolução de jornada nem uma tela nova).
- **Origem:** pedido direto de mapeamento completo da jornada de Crédito Pessoal, incluindo a lógica de ativação de cards em "Para você agora".
- **Fora de escopo:**
  - Especificação de contrato de API real (payloads de request/response da Zema) — os TODOs indicam *onde* a API entra, não o payload esperado.
  - As jornadas de Consignado CLT, FGTS, Assistências, Energia e Seguro de Vida (mencionadas apenas quando cruzam com Crédito Pessoal, ex.: cross-sell em telas terminais).
  - Correção de bugs/inconsistências encontradas durante a auditoria (documentadas, não corrigidas neste momento).

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| CP-00 | Descobrir o produto | Acessa `/credito-pessoal` (link do dashboard ou direto) | CP-01 Landing | Entende proposta de valor e parceria com a Zema Financeira |
| CP-01 | Iniciar simulação | CTA "Quero simular agora" | CP-02 Dados | Entra no fluxo de coleta de dados |
| CP-02a | Confirmar cadastro (CPF/nome/e-mail/celular) | Sub-step `dados_conta` | CP-02 (sub-step seguinte) | Dados de identificação confirmados (todos bloqueados/read-only) |
| CP-02b | Confirmar nascimento | Sub-step `nascimento` | CP-02 (sub-step seguinte) | Maioridade validada (18–100 anos) |
| CP-02c | Informar renda | Sub-step `renda` | CP-02 (sub-step seguinte) | Faixa de renda ou valor customizado definido |
| CP-02d | Confirmar endereço | Sub-step `endereco` | CP-03 Consultando | Endereço selecionado, dispara consulta de elegibilidade |
| CP-03 | Aguardar elegibilidade | Timer automático (2–3s mock) | CP-04 Inelegível **ou** CP-05 Simulador | Elegibilidade decidida |
| CP-04 | (terminal) Ver motivo de inelegibilidade | Chegada automática | — | Usuário entende por que não pode seguir; cross-sell oferecido |
| CP-05 | Escolher oferta | Seleciona prazo/valor, marca/desmarca seguro | CP-06 Revisão | Oferta selecionada com parcela calculada |
| CP-06 | Revisar e consentir | Marca checkbox de consentimento, CTA "Prosseguir" | CP-07 Dados do tomador | Consentimento explícito registrado |
| CP-07a | Completar dados pessoais (KYC) | Sub-step 2 (ou `preview` se pré-preenchido) | CP-07 (sub-step seguinte) | Dados complementares confirmados |
| CP-07b | Declarar PEP | Sub-step 3 | CP-07 (sub-step seguinte) | Declaração de Pessoa Exposta Politicamente registrada |
| CP-07c | Confirmar endereço de formalização | Sub-step 4 | CP-08 Conta bancária | Endereço confirmado (com aviso se diferente do usado na simulação) |
| CP-08 | Informar conta de destino | Seleciona/cadastra conta (sem PIX na v1) | CP-09 Formalizando | Conta bancária confirmada |
| CP-09 | Aguardar envio da proposta | Timer automático (2–3s mock) | CP-10 Em análise **ou** CP-12 Reprovada **ou** CP-13 Pendente **ou** CP-11 Confirmação (atalho "desembolso") | Proposta formalizada/roteada por resultado |
| CP-10 | Aguardar análise | Timer automático (2–5s mock) | CP-13 Pendente **ou** CP-14 Assinatura | Análise concluída |
| CP-14 | Iniciar assinatura | CTA "Assinar contrato agora" (tela de aviso Unico) | CP-17 Redirecionando | Usuário informado de que sairá do app para assinar na Unico |
| CP-17 | Assinar na Unico (fora do app) | Auto `window.open` após 3s (ou botão de fallback após 10s) | CP-14 Assinatura (`?status=aguardando`) | Link da Unico aberto em nova aba; app volta ao estado de espera |
| CP-14b | Aguardar assinatura | Chegada em `?status=aguardando` | CP-11 Confirmação **ou** CP-12 Reprovada | Contrato assinado |
| CP-11 | (terminal) Ver confirmação de sucesso | Chegada automática pós-assinatura | CP-15 Contrato ativo (via dashboard) | Usuário sabe quando o dinheiro cai na conta |
| CP-12 | (terminal) Ver motivo de reprovação | Chegada automática (simulação ou formalização) | — | Usuário entende reprovação; cross-sell oferecido (exceto se reprovado na formalização) |
| CP-13 | (terminal/temporário) Resolver pendência | Chegada automática | CP-07 (step 1 ou 2) **ou** aguardar | Divergência de dados, documento ou vídeo resolvidos |
| CP-15 | Acompanhar contrato ativo | Card "Contrato ativo" no dashboard ou lista de contratos | — | Usuário vê parcelas, custos e pode criar conta na Zema |
| CP-16 | Ser notificado proativamente | Qualquer estado com card em "Para você agora" | Varia (ver seção 5.6) | Usuário retoma a jornada no ponto certo sem precisar procurar |

## 4) Inventário de telas

| screen_id | nome da tela | plataforma | status | owner |
|---|---|---|---|---|
| CP-01 | `CreditoPessoalLanding` — `/credito-pessoal` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-02 | `CreditoPessoalDados` — `/credito-pessoal/dados` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-03 | `CreditoPessoalConsultando` — `/credito-pessoal/consultando` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-04 | `CreditoPessoalInelegivel` — `/credito-pessoal/inelegivel` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-05 | `CreditoPessoalSimulador` — `/credito-pessoal/simulador` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-06 | `CreditoPessoalRevisao` — `/credito-pessoal/revisao` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-07 | `CreditoPessoalDadosTomador` — `/credito-pessoal/dados-tomador` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-08 | `CreditoPessoalConta` — `/credito-pessoal/conta` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-09 | `CreditoPessoalFormalizando` — `/credito-pessoal/formalizando` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-10 | `CreditoPessoalEmAnalise` — `/credito-pessoal/em-analise` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-14 | `CreditoPessoalAssinatura` — `/credito-pessoal/assinatura` | Mobile/Web | changed (2026-08-18) | Design/PO Crédito Pessoal |
| CP-17 | `CreditoPessoalRedirecionandoPage` — `/credito-pessoal/redirecionando` | Mobile/Web | new (2026-08-18) | Design/PO Crédito Pessoal |
| CP-11 | `CreditoPessoalConfirmacao` — `/credito-pessoal/confirmacao` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-12 | `CreditoPessoalReprovada` — `/credito-pessoal/reprovada` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-13 | `CreditoPessoalPendente` — `/credito-pessoal/pendente` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-15 | `CreditoPessoalContratoPage` — `/credito-pessoal/contrato/:id` | Mobile/Web | existing | Design/PO Crédito Pessoal |
| CP-16 | Cards de ativação em "Para você agora" + card padrão na grade de produtos (`HomeScreen`, dentro de `App.tsx`) | Mobile/Web | existing | Design/PO Dashboard |

**Observação de proteção de rota:** todas as rotas `/credito-pessoal/*` são protegidas via `getStoredUser() ? <Componente/> : <Navigate to="/boas-vindas" />` **inline em cada `<Route>`**, e não constam no array `protectedPaths` usado pelo restante do app (que dispara um redirect via `useEffect`). É um mecanismo de proteção diferente do padrão usado por Contratos/Dúvidas/Notificações/seubônus — funciona, mas vale alinhamento técnico se o time decidir unificar.

---

## 5) Spec por tela

### 5.1 Simulação

#### Tela: CP-01 - Landing (`/credito-pessoal`)
**Objetivo da tela**
- Apresentar o produto, a parceria com a Zema Financeira e converter para o início da simulação.

**Componentes principais**
- Hero com banner + overlay de gradiente — `banner-intro-credito-pessoal.png` (fallback silencioso via `onError` se a imagem quebrar)
- Bloco de parceria com logo da Zema (mesmo fallback silencioso)
- Card de features (3 benefícios)
- Accordion de FAQ (`FAQ["credito-pessoal"]`, um item aberto por vez via `faqOpen`)
- CTA fixo "Quero simular agora"

**Estados obrigatórios**
- default (única — não há loading/erro nesta tela)
- imagem/logo quebrada → oculta silenciosamente (`display:none`), sem placeholder visível

**Regras de negócio**
- Nenhuma condicional de fluxo; tela estática de entrada.

**Microcopy crítica**
- CTA primária: "Quero simular agora" → navega para `/credito-pessoal/dados`

**Acessibilidade mínima**
- Contraste AA no overlay de texto sobre imagem
- Alvo de toque mínimo 44×44 no CTA fixo

---

#### Tela: CP-02 - Dados (`/credito-pessoal/dados`)
**Objetivo da tela**
- Coletar/confirmar cadastro (identificação, nascimento, renda, endereço) antes de consultar elegibilidade.

**Componentes principais**
- Wizard interno de 5 sub-steps: `intro → dados_conta → nascimento → renda → endereco`
- `EnderecoSelector` (reused component, mock de endereços via `?endereco=0..5`)

**Estados obrigatórios**
- default por sub-step
- error message inline no sub-step `nascimento` ("Data inválida ou idade mínima de 18 anos")
- CTA "Continuar" desabilitado quando `canAdvance` é falso

**Regras de negócio**
- `dados_conta`: CPF, nome, e-mail e celular aparecem **todos com `locked: true`** — comentário no código: *"celular é usado como 2FA — edição aqui seria brecha de sequestro de conta"*. **Inconsistência encontrada:** o botão "Alterar" de e-mail/celular só renderiza quando `!locked`, mas como os 4 campos têm `locked: true` fixo, esse botão nunca aparece — ver Open Questions.
- `nascimento`: validação via `isAdultBirthDate` (18–100 anos, não aceita data futura).
- `renda`: 4 faixas pré-definidas **ou** valor customizado — mutuamente exclusivos (selecionar uma faixa desativa `usarRendaCustom`).
- `endereco`: `canAdvance` exige endereço selecionado.
- Ao confirmar endereço → `navigate("/credito-pessoal/consultando", { state: { dadosConta, emailLocal, celularLocal, dataNasc, faixaRenda, endereco } })`.

**Microcopy crítica**
- CTA primária: "Começar" (intro) / "Continuar" (demais sub-steps)
- CTA secundária: "Voltar" (no `intro`, volta para `/credito-pessoal`)
- Erro: "Data inválida ou idade mínima de 18 anos"

**Acessibilidade mínima**
- Foco visível ao navegar entre sub-steps
- Contraste AA nos estados de erro

---

#### Tela: CP-03 - Consultando (`/credito-pessoal/consultando`)
**Objetivo da tela**
- Loading de consulta de elegibilidade (mock).

**Componentes principais**
- Spinner/loading padrão
- Contador de segundos (exibido só após 30s: "Aguardando há Ns...")
- Card de "análise demorada" (`seconds >= 60` ou `?estado=demorado`)
- Estado de erro/timeout (`?estado=timeout`)

**Estados obrigatórios**
- loading state (default)
- estado demorado (com CTA de notificação)
- error/timeout (com CTA de retry)

**Regras de negócio**
```js
setTimeout(() => {
  if (estado === "inelegivel") navigate("/credito-pessoal/inelegivel", {state});
  else navigate("/credito-pessoal/simulador", {state: {...state, valorMinimo: 50000, valorMaximo: 500000}});
}, estado === "elegivel" || estado === "inelegivel" ? 2000 : 3000);
```
- `valorMinimo`/`valorMaximo` são mock fixos (50.000–500.000 centavos), não vêm de API.
- CTA no estado demorado grava `localStorage["cp_oferta_pronta"] = "true"` e navega para `/painel` — **é isso que ativa o card "Sua oferta está pronta!" no dashboard** (ver 5.6).

**Microcopy crítica**
- CTA (estado demorado): "Receber notificação quando estiver pronto"
- CTA (timeout): "Tentar novamente"

**Acessibilidade mínima**
- Loading anunciado para leitor de tela (aria-live)

---

#### Tela: CP-05 - Simulador (`/credito-pessoal/simulador`)
**Objetivo da tela**
- Permitir escolher valor e prazo, visualizar taxas e selecionar a oferta.

**Componentes principais**
- Grid de ofertas (parcelas) — vira 4 colunas quando `ofertas.length > 4`
- Toggle de Seguro Prestamista (desmarcado por padrão)
- Card de erro inline (`?resultado=reprovado`, DESIGN ONLY)

**Estados obrigatórios**
- default
- error message inline (resultado=reprovado)
- CTA "Continuar com esta oferta" desabilitado se `!ofertaSelecionada`

**Regras de negócio**
- Ofertas 100% mockadas (`ofertasMockMuitas`, 8 prazos) — TODO: API pode retornar N opções.
- `cetAnual` sempre `undefined` no mock → exibe "A calcular" (CET não disponível na simulação, P0 Zema).
- TAC só aparece se `tac > 0`.
- Parcela calculada localmente (fórmula Price / `calcPMT`) — não vem da API.
- IOF calculado localmente (0,38% fixo + 0,0082%/dia até 365 dias) — TODO: usar valor da API.
- Seguro Prestamista: **desmarcado por padrão** (não pode ser venda casada — Roteiro Operacional Zema); valor = 8,5% do valor da operação (não da parcela).

**Microcopy crítica**
- CTA primária: "Continuar com esta oferta" → `/credito-pessoal/revisao`
- Placeholder de CET: "A calcular"

**Acessibilidade mínima**
- Cards de oferta navegáveis por teclado, estado selecionado comunicado via `aria-pressed` ou equivalente

---

### 5.2 Criação de proposta

#### Tela: CP-06 - Revisão (`/credito-pessoal/revisao`)
**Objetivo da tela**
- Revisão final da oferta escolhida + consentimento explícito antes de prosseguir para KYC.

**Componentes principais**
- Bloco de detalhes colapsável (`detalhesAbertos`)
- Linha de seguro (condicional)
- Nota de arrependimento (7 dias) — só aparece se seguro ativo
- Checkbox de consentimento

**Estados obrigatórios**
- default
- CTA "Prosseguir" desabilitado até o checkbox `aceito` ser marcado

**Regras de negócio**
- Linha "Seguro Prestamista" só é exibida se `seguroAtivo && valorSeguro > 0`.
- Navegação: `navigate("/credito-pessoal/dados-tomador", {state})`.

**Microcopy crítica**
- CTA primária: "Prosseguir para meus dados"

**Acessibilidade mínima**
- Checkbox com label clicável e foco visível

---

#### Tela: CP-07 - Dados do tomador (`/credito-pessoal/dados-tomador`)
**Objetivo da tela**
- Coletar dados complementares de KYC (identificação, PEP, endereço) para formalizar a proposta.

**Componentes principais**
- Wizard com 2 modos de entrada:
  - **Normal:** `intro → 2 (dados pessoais) → 3 (PEP) → 4 (endereço)`
  - **Pré-preenchido** (`?modo=pre-preenchido`, DESIGN ONLY): `intro → preview → 3 (PEP) → 4 (endereço)`
- `EnderecoSelector` reutilizado no step 4

**Estados obrigatórios**
- default por sub-step
- tela `preview` (modo pré-preenchido) com contador "você tem mais 1 dado para nos passar" (`dadosFaltando = 1`, fixo — TODO calcular dinamicamente)
- aviso âmbar não-bloqueante no step 4 se o CEP mudou em relação à simulação (`enderecoAlterado`)

**Regras de negócio**
- **Step 1 (Documento) está oculto/removido** (`className="hidden"`, `step1Completo` fixo `true`) — Zema aceita RG mockado do backend (confirmado com Pedro). Mantido no código para reativação futura.
- Step 2 (dados pessoais): nome da mãe, estado/cidade de nascimento, estado civil, sexo — **obrigatórios**. Nacionalidade, ocupação e data de admissão ficam **ocultos** (resolvidos genericamente pelo backend).
- Step 3 (PEP): pergunta Sim/Não.
  - Se "Sim" → exige `pepTipo` ("próprio" ou "relação") + `pepFuncao`.
  - Se "relação" → exige também `pepTipoRelacao`.
  - Se "próprio" → nome vem autopreenchido e **read-only** (confirmado com Erasmo em 16/07).
  - Campos "cargo" e "data do mandato" — obrigatoriedade **ainda não confirmada** (aguardando Erasmo/Pedro).
- Step 4 (endereço): se o CEP for diferente do usado na consulta de oferta, exibe aviso: *"O CEP deve ser o mesmo informado na consulta de oferta. Alterar pode afetar sua proposta."* (não bloqueante).
- Parâmetros DESIGN ONLY: `?modo=pre-preenchido`, `?step=2|3|4`, `?pep=nao|proprio|relacao`.
- Navegação final: `navigate("/credito-pessoal/conta", {state: {...state, dadosTomador}})`.

**Microcopy crítica**
- Aviso de CEP divergente (âmbar, não bloqueia avanço)
- Contador no modo preview: "você tem mais 1 dado para nos passar"

**Acessibilidade mínima**
- Campo read-only (nome PEP "próprio") comunicado como não-editável para leitor de tela

---

#### Tela: CP-08 - Conta bancária (`/credito-pessoal/conta`)
**Objetivo da tela**
- Capturar a conta bancária de destino do crédito.

**Componentes principais**
- `ContaSelector` (sem opção PIX — **PIX não suportado na v1 do Crédito Pessoal**, comentário explícito no código)

**Estados obrigatórios**
- default
- error modal via `?erro=conta_invalida|titularidade|banco_indisponivel`

**Regras de negócio**
- Lista de bancos é mock (`_bancosMock`) — TODO: `GET /bancarizacao/bancos`.
- Navegação: `navigate("/credito-pessoal/formalizando", {state: {...state, contaBancaria}})`.

**Microcopy crítica**
- Mensagens de erro por tipo (conta inválida / titularidade / banco indisponível)

**Acessibilidade mínima**
- Modal de erro com foco preso (focus trap) e leitura anunciada

---

#### Tela: CP-09 - Formalizando (`/credito-pessoal/formalizando`)
**Objetivo da tela**
- Loading de envio/formalização da proposta.

**Componentes principais**
- Loading padrão
- `ErrorScreen` (via `?erro=`)

**Estados obrigatórios**
- loading (default)
- error (com CTA "Tentar novamente", exceto caso especial abaixo)

**Regras de negócio**
```js
if (resultado === "reprovada")       navigate("/credito-pessoal/reprovada")
else if (resultado === "pendente")   navigate("/credito-pessoal/pendente")
else if (resultado === "desembolso") navigate("/credito-pessoal/confirmacao")  // pula em-análise e assinatura
else /* "formalizada" ou sem param */ navigate("/credito-pessoal/em-analise")
```
- Caso de erro `fraude_ou_sensivel`: CTA muda para "Falar com suporte" → `/duvidas` (TODO: confirmar se é a rota correta de suporte).

**Microcopy crítica**
- CTA de erro padrão: "Tentar novamente"
- CTA de erro sensível: "Falar com suporte"

**Acessibilidade mínima**
- Estado de loading anunciado (aria-live)

---

### 5.3 Assinatura

#### Tela: CP-10 - Em análise (`/credito-pessoal/em-analise`)
**Objetivo da tela**
- Loading intermediário entre formalização e assinatura (simula análise de crédito).

**Estados obrigatórios**
- loading (2–5s mock)

**Regras de negócio**
- `resultado === "pendente"` → `/credito-pessoal/pendente`
- senão ("pronto"/sem param) → `/credito-pessoal/assinatura`
- TODO explícito: substituir timer mock por polling real `GET /propostas/{id}`, avançando quando status mudar para `AGUARDANDO_ASSINATURA`.

---

#### Tela: CP-14 - Assinatura (`/credito-pessoal/assinatura`)
**Objetivo da tela**
- Conduzir a assinatura do contrato via Unico. *(Atualizado 2026-08-18 — modo SMS descontinuado; a Zema liberou acesso ao link de assinatura da Unico, então a jornada agora vai 100% por lá.)*

**Componentes principais**
- `UnicoNotice` ("Falta só sua assinatura!") — mesmo padrão já usado no CLT — → CTA "Assinar contrato agora" leva à tela CP-17 Redirecionando
- `UnicoAguardando` (etapa "aguardando" — botão "Assinar agora" reabre CP-17; "Cancelar proposta" com modal de confirmação)

**Estados obrigatórios**
- `?status=aviso` (default) — mostra `UnicoNotice`
- `?status=aguardando` — mostra `UnicoAguardando` (chegada normal: depois de CP-17 abrir o link externo)
- `?status=expirado` (CTA "Iniciar nova simulação" → `/credito-pessoal/simulador`)
- `?status=assinado` (roteia automaticamente para confirmação após 1s)
- `?status=reprovado` (roteia automaticamente para reprovada após 1s)
- error: `?erro=biometria_falhou|documento_invalido|sessao_expirada`

**Regras de negócio**
- Modo SMS **removido** — não existe mais `?modo=sms|unico`; toda assinatura passa pela Unico.
- CTA "Assinar contrato agora" (UnicoNotice) e "Assinar agora" (UnicoAguardando, estado não-expirado) levam ambos para **CP-17 Redirecionando**, não mais para um estado interno de espera direto.
- **Bugfix (2026-08-18):** os 3 erros de assinatura (`biometria_falhou`/`documento_invalido`/`sessao_expirada`) tinham "Tentar novamente" quebrado — a tela ficava em branco porque o parâmetro `?erro=` continuava na URL e bloqueava tanto o estado de aviso quanto o de aguardando. Agora "Tentar novamente" reabre CP-17 (reabre o link da Unico) direto, para os 3 tipos de erro.
- Modal "Assinar depois" (72h) **removido** junto com o modo SMS — não havia mais nenhum caminho de UI que o disparasse depois da mudança; ficou como dead code e foi retirado.
- `handleCancelar` → `navigate("/credito-pessoal")` — TODO: conectar a `DELETE /propostas/{id}` antes de redirecionar.
- Estado expirado → TODO: conectar a `DELETE /propostas/{id}` antes de permitir nova simulação.
- TODO geral: implementar polling real a cada 30s (`GET /propostas/{id}`), roteando conforme status retornado.

**Microcopy crítica**
- "Reenviar SMS" **removido** de toda a tela — trocado por "Assinar agora" (reabre a Unico).
- CTA (expirado): "Iniciar nova simulação"

**Acessibilidade mínima**
- Estados de erro (`ErrorScreen`) e o modal de cancelamento de proposta mantêm foco visível e leitura anunciada

---

#### Tela: CP-17 - Redirecionando (`/credito-pessoal/redirecionando`) — **nova, 2026-08-18**
**Objetivo da tela**
- Avisar que o usuário vai sair do app e abrir o link de assinatura da Unico/Zema automaticamente. Mesmo padrão visual já usado em `consignado-clt/RedirecionandoPage.tsx` e `fgts/RedirecionandoPage.tsx`.

**Componentes principais**
- Tela cheia com gradiente laranja, ícone animado (`ArrowSquareOut`), título "Abrindo a Unico...", descrição
- Botão de fallback ("Abrir assinatura na Unico"), aparece após 10s

**Estados obrigatórios**
- default (única) — sem loading/erro próprios

**Regras de negócio**
- Após 3s: `window.open(UNICO_ASSINATURA_URL, "_blank")` (URL placeholder, `// TODO: substituir pela URL real de assinatura da Unico/Zema quando disponível`) + `navigate("/credito-pessoal/assinatura?status=aguardando", {replace:true, state})`.
- Após 10s sem interação (ex.: popup bloqueado pelo navegador): mostra botão de fallback que repete a mesma ação (abre o link + navega para o estado aguardando).
- Chegada a esta tela: a partir de CP-14 (CTA "Assinar contrato agora"/"Assinar agora") e a partir dos 3 erros de assinatura ("Tentar novamente").

**Microcopy crítica**
- Título: "Abrindo a Unico..."
- Descrição: "Você será direcionado para verificar sua identidade e assinar seu contrato na plataforma da Unico."
- CTA de fallback: "Abrir assinatura na Unico"

**Acessibilidade mínima**
- **Gap confirmado:** a animação do ícone (`framer-motion`, loop infinito de scale) **não** respeita `prefers-reduced-motion` — mesmo padrão das telas irmãs de redirecionamento (CLT/FGTS), nenhuma delas trata isso hoje. Vale item de backlog transversal, não específico desta tela.

---

### 5.4 Pós-assinatura

#### Tela: CP-11 - Confirmação (`/credito-pessoal/confirmacao`)
**Objetivo da tela**
- Confirmar sucesso da contratação e orientar sobre o prazo de desembolso.

**Estados obrigatórios**
- default (sucesso)

**Regras de negócio**
- `?periodo=antes17h` (default) → "cai em até 20 minutos"
- `?periodo=apos17h` → "cai no próximo dia útil"
- TODO: período deve vir da API.
- "Ver carnê completo" aponta para `href="#"` (placeholder) — TODO: substituir pela `url_boleto` de `GET /propostas/{id}/boleto/detalhes`.

**Microcopy crítica**
- CTA primária: "Ir para o início" → `/painel`
- CTA secundária: "Ver carnê completo" (placeholder, não funcional hoje)

---

#### Tela: CP-15 - Contrato ativo (`/credito-pessoal/contrato/:id`)
**Objetivo da tela**
- Área de acompanhamento do contrato ativo pós-desembolso (parcelas, custos, conta na Zema).

**Componentes principais**
- Banner fixo: *"Este é um contrato de exemplo para fins de demonstração"* (TODO: remover quando API estiver conectada)
- Badge de status (verde/amarelo/cinza)
- Bloco "Criar minha conta na Zema Financeira" (onboarding modal de 4 passos) **ou** link direto para conta existente
- Linha "Seguro Prestamista" (condicional)
- Ação "Quitar antecipadamente" — desabilitada, badge "Em breve"

**Estados obrigatórios**
- `?status=ativo|aguardando|encerrado` (badge muda cor/label)
- `?zema=novo` (fluxo de criação de conta) vs `?zema=existente` (link direto para `https://minhaconta.zemafinanceira.com/`)
- `?seguro=sim|nao` (mostra/oculta linha de custo do seguro)

**Regras de negócio**
- Seguro Prestamista = 8,5% do `valorDesembolso` quando ativo.
- **Dados vêm de um `contratoMock` local no próprio arquivo, não de `src/data/contratos.ts`** — ver inconsistência na seção 6.
- Botão de download da CCB sem ação — TODO: conectar a `GET /propostas/{id}/ccb`.
- `boletosMock` local — TODO: `GET /propostas/{id}/boleto/detalhes`.

**Microcopy crítica**
- Banner de demonstração (topo, sempre visível)
- CTA "Criar minha conta na Zema Financeira" / "Acessar minha conta Zema"
- Badge "Em breve" na quitação antecipada

**Acessibilidade mínima**
- Badge de status com texto (não só cor) para leitores de tela

---

### 5.5 Pendências e estados terminais

#### Tela: CP-13 - Pendente (`/credito-pessoal/pendente`)
**Três casos via `?tipo=`:**

| tipo | CTA | destino/ação |
|---|---|---|
| `divergencia` (default) | "Corrigir meus dados" | `/credito-pessoal/dados-tomador?step=2` |
| `documento` | "Reenviar documento" | `/credito-pessoal/dados-tomador?step=1` |
| `video` | "Acessar chamada" (**desabilitado**, tooltip "Em breve") | — |

**Regras de negócio**
- Mensagens de divergência/documento/vídeo são mock — TODO: vir do campo `mensagem` da API.
- `video`: link da chamada ainda não definido pela Zema. Botão DESIGN ONLY simula a chegada da notificação: grava `localStorage["cp_video_disponivel"] = "true"` e navega para `/painel` — **ativa o card "Chamada agendada!" no dashboard** (ver 5.6).

---

#### Tela: CP-12 - Reprovada (`/credito-pessoal/reprovada`)
**Dois casos via `?etapa=`:**

| etapa | bloqueio | CTA de nova proposta | cross-sell |
|---|---|---|---|
| `simulacao` (default) | 7 dias | Não há | Sim (CLT — FGTS filtrado, ver inconsistência) |
| `formalizacao` | Não há | "Iniciar nova proposta" → `/credito-pessoal` | — |

---

#### Tela: CP-04 - Inelegível (`/credito-pessoal/inelegivel`)
**Três casos via `?motivo=`:**

| motivo | bloqueio | CTA | destino |
|---|---|---|---|
| `sem_oferta` (default) | 7 dias | Não há | Cross-sell (mesmo filtro FGTS) |
| `divergencia` | Não | "Corrigir meus dados" | `/minha-conta/meus-dados` |
| `outro` | Não | "Tentar novamente" | `/credito-pessoal` |

**Regras de negócio comuns a CP-04/CP-12 (cross-sell)**
- O bloco de cross-sell filtra o item FGTS via `.filter(item => item.rota !== "/fgts" || false)` — comentário no código diz *"FGTS OCULTO TEMPORARIAMENTE"*, mas a expressão `|| false` é um resíduo sem efeito (mesmo padrão de "dead code" já corrigido em outro ponto do dashboard nesta sessão). **Hoje o FGTS efetivamente some do cross-sell** por causa da primeira parte da condição (`rota !== "/fgts"`), não por causa do `|| false`. Se o objetivo for reativar o FGTS no cross-sell (agora que o produto foi reativado via Lótus+ nesta mesma sessão), essa condição precisa ser revisada — ver Open Questions.

---

### 5.6 Ativação de cards em "Para você agora" (Dashboard)

Toda a lógica abaixo vive em `src/App.tsx`, dentro do `HomeScreen`, e é **100% controlada por query params (`?cp=`) e `localStorage`** — não existe hoje nenhuma fonte real de status vindo de API (todos os pontos abaixo têm comentário `// TODO: substituir por estado real da API`).

**Fonte de estado:** *(atualizado — ver changelog: `andamento`/`ativo` passaram a ativar card em "Para você agora", e `video` foi adicionado como atalho)*
```js
const cpStatus = searchParams.get("cp") ?? "disponivel";
// "disponivel" | "andamento" | "ativo" | "assinatura_pendente" | "contrato_novo" | "video"

const cpOfertaPronta = localStorage.getItem("cp_oferta_pronta") === "true";
// setado em CP-03 (Consultando), botão "Receber notificação quando estiver pronto"

const cpVideoDisponivel = localStorage.getItem("cp_video_disponivel") === "true" || cpStatus === "video";
// setado em CP-13 (Pendente, tipo=video), botão DESIGN ONLY de simulação;
// ou atalho direto via ?cp=video, pedido pelos devs para testar sem passar pelo fluxo de pendência

const TIMEOUT_CONTRATO_NOVO_MS = 2 * 24 * 60 * 60 * 1000; // 2 dias
const mostrarContratoNovo =
  cpStatus === "contrato_novo" ||
  (contratoNovoTimestamp !== null && Date.now() - Number(contratoNovoTimestamp) < TIMEOUT_CONTRATO_NOVO_MS);
```

**Condição-mãe** que decide se a seção "Para você agora" aparece (em vez do carrossel `RecomendacoesCarousel`) inclui, entre outras, estes estados de Crédito Pessoal: `cpOfertaPronta`, `cpVideoDisponivel`, `cpStatus === "andamento"`, `cpStatus === "assinatura_pendente"`, `cpStatus === "ativo"`, `mostrarContratoNovo`. **"Para você agora" e o carrossel de recomendações são mutuamente exclusivos** — se nenhuma condição de nenhum produto for verdadeira, mostra o carrossel.

**Os cards possíveis de Crédito Pessoal dentro de "Para você agora":**

| condição | texto do card | ação ao clicar |
|---|---|---|
| `cpOfertaPronta` | "Sua oferta está pronta!" | Remove a flag do localStorage e navega para `/credito-pessoal/simulador` |
| `cpVideoDisponivel` (flag ou `?cp=video`) | "Chamada agendada!" | Remove a flag (se veio por lá) e navega para `/credito-pessoal/pendente?tipo=video` |
| `cpStatus === "andamento"` | "Sua proposta de Crédito Pessoal está em andamento" | Navega para `/credito-pessoal/assinatura` |
| `cpStatus === "assinatura_pendente"` | "Você tem uma proposta aguardando assinatura" | Card inteiro é um botão único → `/credito-pessoal/assinatura?status=aguardando`. *(Atualizado 2026-08-18: removido o sub-botão "Reenviar SMS" que só disparava toast — não fazia mais sentido após a assinatura passar a ser 100% via Unico.)* |
| `cpStatus === "ativo"` (sem `mostrarContratoNovo`) | "Seu contrato do Crédito Pessoal está ativo!" | Navega para `/credito-pessoal/contrato/mock` — **não expira** (diferente do card abaixo) |
| `mostrarContratoNovo` (`contrato_novo`, até 2 dias) | "Seu contrato do Crédito Pessoal está ativo!" | Remove o timestamp e navega para `/credito-pessoal/contrato/mock` |

**Card padrão de Crédito Pessoal na grade de produtos** (sempre visível, independente de "Para você agora"):

| `cpStatus` | Highlight | CTA | Rota |
|---|---|---|---|
| `disponivel` (default) | "Dinheiro na conta em minutos" | "Simular agora" | `/credito-pessoal` |
| `andamento` | "Proposta em andamento" | "Acompanhar" | `/credito-pessoal/assinatura` |
| `assinatura_pendente` | "Proposta em andamento" | "Assinar agora" | `/credito-pessoal/assinatura?status=aguardando` |
| `ativo` / `contrato_novo` | "Contrato ativo" (cor **verde `#16A34A`**, único caso que sai do laranja padrão `#FD5F31`) | "Ver contrato" | `/credito-pessoal/contrato/mock` |

**Regras de negócio**
- Nenhum destes estados é persistido de forma real — tudo mock via query param ou `localStorage`.
- Crédito Pessoal **não participa** do `InteresseContext` (sem `registrarInteresse("credito-pessoal")` em nenhuma tela) nem do sistema de recomendações dispensáveis do `RecomendacoesContext` (que só cobre Assistências, Energia e um card de Consignado CLT). Isso significa que os cards de status de Crédito Pessoal **não têm lógica de "dispensar"/"reexibir depois"** — ficam visíveis enquanto a condição for verdadeira.

---

## 6) Diff de UX por tela

> Como esta é uma documentação retroativa (não uma mudança proposta), esta seção lista **inconsistências encontradas na auditoria do código** que merecem decisão de produto — não são bugs corrigidos neste momento.

| screen_id | tipo | o que foi encontrado | por que importa | impacto esperado se não resolvido |
|---|---|---|---|---|
| CP-02 | inconsistência | Campos de e-mail/celular em `dados_conta` têm um botão "Alterar" condicionado a `!locked`, mas `locked` é sempre `true` para os 4 campos — o botão nunca aparece | Pode ser intencional (segurança do 2FA) ou UI morta esquecida | Nenhum, se intencional; se não, é uma opção de edição que o usuário nunca vê |
| CP-04 / CP-12 | inconsistência | Filtro de cross-sell `item.rota !== "/fgts" || false` remove o FGTS da lista, mas o comentário indica que isso deveria ser revertido quando o produto reativasse — o `\|\| false` é resíduo sem efeito, mesmo padrão já corrigido em outro ponto do dashboard nesta sessão | FGTS já foi reativado via Lótus+ nesta mesma sessão; este cross-sell ainda está desatualizado em relação a essa mudança | Cross-sell de FGTS continua ausente nas telas de reprovação/inelegibilidade mesmo com o produto ativo |
| CP-15 | inconsistência | `CreditoPessoalContratoPage` usa um `contratoMock` local próprio, diferente da entrada `credito-pessoal-001` em `src/data/contratos.ts` (mesmos valores, formatos diferentes: ex. `taxaJurosMes: 13.0` vs `taxaJuros: 0.13`) | Duas fontes de "verdade" mockadas para o mesmo contrato podem divergir silenciosamente conforme uma for editada sem a outra | Dados inconsistentes entre a lista de Contratos e a tela de detalhe do Crédito Pessoal |
| CP-16 | observação | Crédito Pessoal não usa `InteresseContext` nem participa do sistema de dispensar/reexibir do `RecomendacoesContext`, diferente de Assistências/Energia | Pode ser decisão consciente (cards de status ≠ cards de recomendação) ou lacuna | Usuário não consegue "dispensar" um card de status de Crédito Pessoal que já resolveu manualmente |

## 7) Taxonomia de eventos Amplitude

### Regras gerais
- Convenção: `snake_case`, padrão `<dominio>_<acao>_<estado>`.
- **Hoje não existe nenhuma instrumentação real** — `trackStep()` (`src/utils/analytics.ts`) é apenas um `console.log`, importado em `App.tsx` mas **nunca chamado** em nenhuma tela de Crédito Pessoal (nem em outras jornadas, pelo grep realizado). A taxonomia abaixo é uma proposta nova, não um mapeamento de eventos existentes.
- Cobre entrada, ação, sucesso, erro e cancelamento de cada etapa.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| `cp_landing_viewed` | Carregamento da CP-01 | credito_pessoal_landing | credito_pessoal | landing | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | — | Analytics | pending |
| `cp_simulation_started` | CTA "Quero simular agora" | credito_pessoal_landing | credito_pessoal | simulation_start | (padrão) | — | Analytics | pending |
| `cp_data_step_completed` | Avanço de cada sub-step em CP-02 | credito_pessoal_dados | credito_pessoal | dados_conta \| nascimento \| renda \| endereco | (padrão) + `substep_name` | `renda_faixa`, `renda_custom_valor` | Analytics | pending |
| `cp_eligibility_check_started` | Entrada em CP-03 | credito_pessoal_consultando | credito_pessoal | consultando | (padrão) | — | Analytics | pending |
| `cp_eligibility_result` | Timer de CP-03 resolve | credito_pessoal_consultando | credito_pessoal | consultando | (padrão) + `result` (`elegivel`\|`inelegivel`) | — | Analytics | pending |
| `cp_eligibility_notification_requested` | CTA "Receber notificação" (estado demorado) | credito_pessoal_consultando | credito_pessoal | consultando | (padrão) | — | Analytics | pending |
| `cp_ineligible_viewed` | Chegada em CP-04 | credito_pessoal_inelegivel | credito_pessoal | inelegivel | (padrão) + `motivo` | — | Analytics | pending |
| `cp_offer_selected` | Seleção de prazo/valor em CP-05 | credito_pessoal_simulador | credito_pessoal | simulador | (padrão) + `prazo_meses`, `valor_solicitado`, `seguro_ativo` | `cet_disponivel` | Analytics | pending |
| `cp_offer_confirmed` | CTA "Continuar com esta oferta" | credito_pessoal_simulador | credito_pessoal | simulador | (padrão) + `oferta_id`, `valor_parcela` | — | Analytics | pending |
| `cp_review_consent_accepted` | Checkbox marcado em CP-06 | credito_pessoal_revisao | credito_pessoal | revisao | (padrão) | — | Analytics | pending |
| `cp_review_confirmed` | CTA "Prosseguir para meus dados" | credito_pessoal_revisao | credito_pessoal | revisao | (padrão) | — | Analytics | pending |
| `cp_borrower_data_step_completed` | Avanço de cada sub-step em CP-07 | credito_pessoal_dados_tomador | credito_pessoal | dados_tomador | (padrão) + `substep_name` (`dados_pessoais`\|`pep`\|`endereco`) | `pep_declarado`, `modo_pre_preenchido` | Analytics | pending |
| `cp_borrower_address_mismatch_warning_shown` | Aviso de CEP divergente exibido | credito_pessoal_dados_tomador | credito_pessoal | dados_tomador | (padrão) | — | Analytics | pending |
| `cp_bank_account_confirmed` | CTA de confirmação em CP-08 | credito_pessoal_conta | credito_pessoal | conta | (padrão) | — | Analytics | pending |
| `cp_bank_account_error_shown` | Modal de erro exibido | credito_pessoal_conta | credito_pessoal | conta | (padrão) + `erro_tipo` | — | Analytics | pending |
| `cp_proposal_submitted` | Entrada em CP-09 (Formalizando) | credito_pessoal_formalizando | credito_pessoal | formalizando | (padrão) | — | Analytics | pending |
| `cp_proposal_result` | Timer de CP-09 resolve | credito_pessoal_formalizando | credito_pessoal | formalizando | (padrão) + `resultado` (`formalizada`\|`reprovada`\|`pendente`\|`desembolso`) | — | Analytics | pending |
| `cp_analysis_started` | Entrada em CP-10 | credito_pessoal_em_analise | credito_pessoal | em_analise | (padrão) | — | Analytics | pending |
| `cp_analysis_result` | Timer de CP-10 resolve | credito_pessoal_em_analise | credito_pessoal | em_analise | (padrão) + `resultado` (`pronto`\|`pendente`) | — | Analytics | pending |
| `cp_signature_started` | Entrada em CP-14 | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) | — | Analytics | pending |
| `cp_signature_redirect_opened` | Entrada em CP-17 (Redirecionando) | credito_pessoal_redirecionando | credito_pessoal | redirecionando | (padrão) + `via` (`aviso`\|`erro_retry`\|`aguardando_retry`) | — | Analytics | pending |
| `cp_signature_redirect_fallback_clicked` | Botão de fallback em CP-17 (após 10s) | credito_pessoal_redirecionando | credito_pessoal | redirecionando | (padrão) | — | Analytics | pending |
| `cp_signature_cancelled` | `handleCancelar` disparado | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) | — | Analytics | pending |
| `cp_signature_expired` | Estado `expirado` atingido | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) | — | Analytics | pending |
| `cp_signature_completed` | `?status=assinado` roteia para confirmação | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) | — | Analytics | pending |
| `cp_signature_rejected` | `?status=reprovado` roteia para reprovada | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) | — | Analytics | pending |
| `cp_signature_error_shown` | Erro exibido (biometria/documento/sessão) | credito_pessoal_assinatura | credito_pessoal | assinatura | (padrão) + `erro_tipo` | — | Analytics | pending |
| `cp_confirmation_viewed` | Entrada em CP-11 | credito_pessoal_confirmacao | credito_pessoal | confirmacao | (padrão) + `periodo` (`antes17h`\|`apos17h`) | — | Analytics | pending |
| `cp_rejected_viewed` | Entrada em CP-12 | credito_pessoal_reprovada | credito_pessoal | reprovada | (padrão) + `etapa` (`simulacao`\|`formalizacao`) | — | Analytics | pending |
| `cp_pending_viewed` | Entrada em CP-13 | credito_pessoal_pendente | credito_pessoal | pendente | (padrão) + `tipo` (`divergencia`\|`documento`\|`video`) | — | Analytics | pending |
| `cp_pending_action_taken` | CTA "Corrigir dados"/"Reenviar documento" | credito_pessoal_pendente | credito_pessoal | pendente | (padrão) + `tipo` | — | Analytics | pending |
| `cp_contract_viewed` | Entrada em CP-15 | credito_pessoal_contrato | credito_pessoal | contrato | (padrão) + `status` (`ativo`\|`aguardando`\|`encerrado`) | — | Analytics | pending |
| `cp_zema_account_flow_started` | CTA "Criar minha conta na Zema Financeira" | credito_pessoal_contrato | credito_pessoal | contrato | (padrão) | — | Analytics | pending |
| `cp_dashboard_card_shown` | Qualquer card de CP renderizado em "Para você agora" | painel | credito_pessoal | dashboard | (padrão) + `card_tipo` (`oferta_pronta`\|`video_disponivel`\|`assinatura_pendente`\|`contrato_novo`) | — | Analytics | pending |
| `cp_dashboard_card_clicked` | Clique em qualquer card de CP em "Para você agora" | painel | credito_pessoal | dashboard | (padrão) + `card_tipo` | — | Analytics | pending |

### Exemplo de payload
```json
{
  "event_name": "cp_proposal_result",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-08-13T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "credito_pessoal",
  "step_name": "formalizando",
  "screen_name": "credito_pessoal_formalizando",
  "resultado": "pendente"
}
```

## 8) Critérios de QA de tracking
- Cobertura de eventos críticos >= 90% (todo o happy path CP-01 → CP-11/CP-15 instrumentado antes de considerar "pronto")
- Conformidade de taxonomia >= 95%
- Completude de propriedades >= 95%
- PII indevida = 0 (atenção: CPF, nome completo, dados bancários e dados PEP não podem vazar como propriedade de evento — usar apenas IDs/flags, nunca o valor bruto)
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

**Impacto em escopo**
- Esta spec não altera comportamento; formaliza o que já existe para orientar a próxima etapa (integração com API real da Zema + instrumentação de analytics).

**Riscos e dependências**
- **Toda a jornada roda 100% sobre mocks e parâmetros de URL "DESIGN ONLY"** — não há nenhuma chamada real de API em nenhuma das 15 telas. Qualquer demo/teste externo precisa deixar isso claro.
- **Duas fontes de mock divergentes para o mesmo contrato** (CP-15 vs `contratos.ts`) — risco de inconsistência de dados se um for atualizado sem o outro.
- **Nenhuma instrumentação de analytics ativa hoje** — `trackStep` é um stub. Antes de qualquer decisão de produto baseada em dados desta jornada, a taxonomia da seção 7 precisa ser implementada.
- **Cross-sell de FGTS em telas de reprovação/inelegibilidade está desatualizado** frente à reativação do FGTS (via Lótus+) feita nesta mesma sessão — pode gerar incoerência de produto (FGTS ativo no app, mas ausente do cross-sell do Crédito Pessoal).
- **Pendências de confirmação com stakeholders específicos** (Pedro, Erasmo, James — ver Open Questions) bloqueiam a definição de obrigatoriedade de alguns campos de KYC/PEP.

**Impacto esperado em métricas**
- Sem instrumentação, hoje é impossível medir taxa de conversão por etapa, principal ponto de abandono, ou tempo médio até assinatura — a implementação da taxonomia da seção 7 é pré-requisito para qualquer análise de funil desta jornada.

**Plano de rollout**
- Não aplicável (documentação retroativa). Rollout futuro relevante: substituição incremental dos mocks por chamadas reais, tela a tela, conforme os TODOs listados.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Campos "cargo" e "data do mandato" no step PEP são obrigatórios? | Erasmo / Pedro (Zema) | — | aberto |
| Campo "ocupação" no KYC deve ser select ou texto livre? | James | — | aberto |
| ~~Quando o link de assinatura Unico estará disponível em produção?~~ | Pedro (Zema) | — | **resolvido 2026-08-18** — Zema confirmou acesso ao link; modo SMS foi descontinuado, ver Changelog |
| Lista real de bancos para conta de destino — quando `GET /bancarizacao/bancos` estará disponível? | Time de integração Zema | — | aberto |
| Link/fluxo da chamada de vídeo (pendência tipo=video) — a Zema já definiu como esse dado chega ao app? | Zema | — | aberto |
| O botão "Alterar" de e-mail/celular em CP-02 (`dados_conta`) deveria existir de fato, ou os campos devem continuar sempre bloqueados? | Design/PO Crédito Pessoal | — | aberto |
| Cross-sell de FGTS em CP-04/CP-12 deve ser reativado agora que o FGTS voltou a ficar visível (Lótus+)? | Ellen / PO | — | aberto |
| Qual mock deve ser tratado como fonte de verdade para o contrato de Crédito Pessoal — o de `contratos.ts` ou o `contratoMock` local de `CreditoPessoalContratoPage.tsx`? | Design/Dev | — | aberto |
| Confirmar se `/duvidas` é de fato a rota correta de suporte para o erro `fraude_ou_sensivel` em CP-09 | PO | — | aberto |
| `docs/parametros-url_credito-pessoal.md` deve ser criado seguindo o padrão de `parametros-url_fgts.md`/`parametros-url_consignado-clt.md`? | Design/PO | — | aberto |
