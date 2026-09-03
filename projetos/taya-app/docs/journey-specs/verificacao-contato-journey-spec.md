---
agent: ellen-damasceno
project: podeja-canal-direto
journey: verificacao-contato
platform: Web (PWA Mobile-first)
date: 2026-09-02
depends_on: [taya-ai-engine]
status: draft
---

# Journey Spec - Verificação de Contato

> **Nota sobre este documento:** mapeia a jornada de verificação de e-mail/celular exatamente como ela existe hoje no código (`src/pages/minha-conta/VerificarContato.tsx`, `src/context/ChatContext.tsx` e a seção "Contato" de Meus Dados / badge "Conta verificada" em `src/App.tsx`). Toda regra abaixo foi extraída lendo o código-fonte — nenhum comportamento foi inferido ou inventado.

## 1) Resumo executivo da jornada

- **Problema que a documentação resolve:** a verificação de e-mail/celular é uma única tela parametrizada (`tipo: "email" | "celular"`) que cobre três fluxos de comportamento bem diferentes — verificação simples, troca de contato com confirmação de segurança, e escalonamento para suporte humano — sem nenhum documento único amarrando tela → estado → regra → evento. Isso é agravado pelo fato de a troca de contato envolver uma decisão de segurança não óbvia (confirmar pelo contato **antigo**, não pelo novo).
- **Resultado esperado para o usuário:** verificar um contato pendente com um código de 6 dígitos; trocar e-mail/celular com segurança (a troca só se efetiva depois de confirmar posse do contato atual); e, se não conseguir validar de forma alguma, ser encaminhado ao suporte humano via chat sem precisar reexplicar a situação.
- **Impacto esperado para o negócio:** reduz o risco de sequestro de conta via troca de contato não autorizada (a confirmação pelo contato antigo é a principal barreira), e formaliza um contrato claro de onde os mocks (código `123456`, envio de SMS/e-mail) precisam virar chamadas reais de API.

## 2) Escopo e contexto

- **Tipo:** documentação retroativa de jornada recém-construída (não é uma tela nova a partir deste documento — o código já existe; esta spec formaliza o que foi implementado).
- **Origem:** consolidação da tela `VerificarContato.tsx` original (verificação simples) com dois ajustes de segurança/UX pedidos na mesma sessão: confirmação pelo contato antigo antes de efetivar troca, e escape hatch para suporte.
- **Telas/componentes que esta jornada *possui*:** `VerificarContato.tsx` (3 estados) + o modal de aviso do suporte (`Dialog`/`Drawer`) embutido no mesmo arquivo.
- **Telas/componentes que esta jornada *integra*, mas não possui:**
  - Seção "Contato" de Meus Dados (`src/App.tsx`) — badges "Verificado"/"Pendente" e botões "Verificar"/"Alterar" que originam os Fluxos A e B.
  - Badge "Conta verificada" / "Verificação pendente" em Minha Conta (`src/App.tsx`).
  - Cards "Verifique seu e-mail/celular" no dashboard (`src/App.tsx`, seção "Para você agora").
  - `ChatContext` / `ChatBubble` — o chat em si (já documentado em `central-ajuda-journey-spec.md`); esta jornada só consome `abrirChat()` e `enviarMensagemContexto()`.
- **Fora de escopo:**
  - Especificação de contrato de API real (envio de código por SMS/e-mail, validação do código) — os TODOs indicam *onde* a API entra.
  - Implementação de bloqueio de produto quando o contato não está verificado (ver Open Questions).
  - Mudanças no comportamento do chat em si (`ChatBubble`, `ChatPainel`) — inalterado por esta jornada.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| VC-00a | Ser lembrado de verificar um contato pendente | Card "Verifique seu e-mail/celular" no dashboard **ou** botão "Verificar" em Meus Dados > Contato (só aparece se `!verificado`) | VC-01 (estado `codigo`) | Usuário entra na verificação do contato atual, sem intenção de trocá-lo |
| VC-00b | Trocar e-mail ou celular | Botão "Alterar" em Meus Dados > Contato → modal de edição → "Salvar" com valor diferente do atual | VC-02 (estado `confirmando`) | Novo valor fica pendente de confirmação; nada é salvo ainda |
| VC-01 | Confirmar o contato atual | Digita o código de 6 dígitos recebido, estado `codigo` | VC-03 (`verificado`) | Contato atual marcado como validado (sem mudar o valor) |
| VC-02 | Confirmar a troca | Digita o código de 6 dígitos (enviado ao contato **antigo**), estado `confirmando` | VC-03 (`verificado`) | Novo valor salvo + marcado como validado; contato antigo descartado |
| VC-03 | (terminal) Ver sucesso | Chegada automática após código correto (VC-01 ou VC-02) | Tela anterior (`navigate(-1)`, 1,5s depois) | Usuário volta para onde veio, com o contato validado |
| VC-04 | Buscar ajuda humana por não conseguir validar | Link "Não consigo validar meu contato" — disponível nos estados `codigo` **e** `confirmando` | Modal "Falar com o suporte" | Usuário entende que a troca será concluída com o suporte antes do chat abrir |
| VC-04b | Iniciar atendimento com contexto | Botão "Iniciar chat" no modal VC-04 | `ChatBubble` (painel do chat, fora desta jornada) — expande na própria tela | Jade recebe o contexto do problema sem o usuário precisar digitar nada |

## 4) Inventário de telas

| screen_id | nome | plataforma | status | owner |
|---|---|---|---|---|
| VC-01 | `VerificarContato` — estado `codigo` (`/minha-conta/verificar-email`, `/minha-conta/verificar-celular`) | Web (PWA Mobile-first) | new | Design/PO Minha Conta |
| VC-02 | `VerificarContato` — estado `confirmando` (mesmas rotas; só é alcançado via `navigate(..., { state: { novoValor } })` a partir de Meus Dados) | Web (PWA Mobile-first) | new | Design/PO Minha Conta |
| VC-03 | `VerificarContato` — estado `verificado` (tela de sucesso, comum aos dois fluxos) | Web (PWA Mobile-first) | new | Design/PO Minha Conta |
| VC-04 | Modal "Falar com o suporte" — `Dialog` (desktop ≥768px) / `Drawer` (mobile), dentro do mesmo arquivo | Web (PWA Mobile-first) | new | Design/PO Minha Conta |

**Observação de proteção de rota:** `/minha-conta/verificar-email` e `/minha-conta/verificar-celular` seguem o padrão inline `getStoredUser() ? <VerificarContato tipo="..."/> : <Navigate to="/boas-vindas" />` em `App.tsx`, igual ao restante de `/minha-conta/*`.

## 5) Spec por tela

### Tela: VC-01 — Verificação padrão (estado `codigo`)

**Objetivo da tela**
- Confirmar que o usuário tem acesso ao contato já cadastrado, sem trocar nada.

**Componentes principais**
- Ícone (`EnvelopeSimple` ou `DeviceMobile`, `@phosphor-icons/react`) em círculo `#FFF3EE`
- `InputOTP` de 6 dígitos (`@/components/ui/input-otp`)
- Contador de reenvio (30s) → vira link "Reenviar código"
- Botão primário "Verificar código"
- Link "Não consigo validar meu contato" (abre VC-04)

**Estados obrigatórios**
- default (campo OTP vazio, botão desabilitado)
- erro: código incompleto ou inválido (mensagem inline abaixo do OTP)
- contando (30s) vs. pronto para reenviar

**Regras de negócio**
- Valor mascarado exibido: e-mail → `xx***@dominio` (`maskarEmail`); celular → `(xx) •••••-XXXX` (`maskarCelular`, mostra só os 4 últimos dígitos).
- Código de validação mockado: `CODIGO_VALIDO = "123456"` — **DESIGN ONLY**, não há chamada de API.
- "Reenviar código": reseta o contador para 30s, limpa o campo, dispara `toast("Código reenviado para {contato mascarado}.")`. Não há chamada real de reenvio (`// TODO: acionar reenvio real do código via API`).
- Sucesso: `localStorage.setItem(storageValidadoKey, "true")` → vai para VC-03 → `navigate(-1)` após 1,5s.

**Microcopy crítica**
- Título: "Confirme seu e-mail" / "Confirme seu celular"
- Descrição: "Enviamos um código de verificação para {contato mascarado}"
- Erro (incompleto): "Digite o código de 6 dígitos."
- Erro (inválido): "Código inválido. Verifique e tente novamente."
- Contador: "Reenviar em Xs" → link "Reenviar código"
- Toast de reenvio: "Código reenviado para {contato mascarado}."
- CTA primária: "Verificar código" (desabilitado até 6 dígitos)
- Toast de sucesso: "E-mail verificado!" / "Celular verificado!"

**Acessibilidade mínima**
- Foco automático no primeiro slot do OTP ao entrar na tela
- Erro comunicado por texto (não só cor vermelha)

---

### Tela: VC-02 — Confirmação de troca (estado `confirmando`)

**Objetivo da tela**
- Confirmar que o usuário ainda tem acesso ao contato **antigo** antes de qualquer troca ser efetivada — barreira de segurança contra sequestro de conta.

**Componentes principais**
- Mesmo layout visual de VC-01 (ícone, `InputOTP` de 6 dígitos, botão primário, link de suporte) — **sem** contador de reenvio nem link "Reenviar código".

**Estados obrigatórios**
- default / erro (mesmos comportamentos de VC-01: incompleto vs. inválido)

**Regras de negócio**
- **Só é alcançada via `location.state.novoValor`**, recebido de `navigate("/minha-conta/verificar-email|verificar-celular", { state: { novoValor } })`, disparado por `salvarEdicao()` em Meus Dados quando o valor digitado é diferente do atual. Não há nenhum caminho dentro da própria `VerificarContato.tsx` para chegar a este estado — o antigo formulário "Qual é o seu novo e-mail?" (sub-estado `trocar`) foi removido; a edição do valor acontece inteiramente em Meus Dados.
- **O novo valor NÃO é salvo em `localStorage` neste momento** — fica só em estado local do componente (`useState(novoValorRecebido ?? valor)`). `salvarEdicao()` também não altera `email`/`celular` no state de Meus Dados nem zera o storageKey de validação — literalmente nada muda em `localStorage` até o código ser confirmado aqui.
- Ao entrar na tela (via `useEffect` de montagem), dispara `toast("Código enviado para {contato ANTIGO mascarado}.")` — mock, `// TODO: acionar envio real do código para o contato atual via API`.
- A descrição da tela usa `valorMascarado`, calculado sobre `valor` (o contato **antigo**, lido do `localStorage` ao montar o componente) — nunca sobre `novoValor`.
- Sucesso (`handleConfirmarTroca`): **só agora** `localStorage.setItem(storageValueKey, novoValor)` e `localStorage.setItem(storageValidadoKey, "true")` → vai para VC-03 → `navigate(-1)` após 1,5s.
- Se o usuário abandonar esta tela sem confirmar (navegar para outro lugar), nada é persistido — o contato antigo e seu status de verificação permanecem intocados.

**Microcopy crítica**
- Título: **"Confirme a troca do seu e-mail"** / **"Confirme a troca do seu celular"**
- Descrição: "Para confirmar a troca, enviamos um código para {contato ANTIGO mascarado}. Digite-o abaixo."
- Toast ao entrar: "Código enviado para {contato antigo mascarado}."
- Erros: idênticos a VC-01 ("Digite o código de 6 dígitos." / "Código inválido. Verifique e tente novamente.")
- CTA primária: "Confirmar troca" (desabilitado até 6 dígitos)
- Toast de sucesso: "E-mail verificado!" / "Celular verificado!" (mesmo texto de VC-01 — não diferencia "trocado" de "verificado")

**Acessibilidade mínima**
- Mesma do VC-01

---

### Tela: VC-03 — Sucesso (`verificado`)

**Objetivo da tela**
- Confirmar visualmente a conclusão (de VC-01 ou VC-02) e devolver o usuário ao fluxo de origem.

**Componentes principais**
- Ícone `CheckCircle` (weight `fill`) em círculo verde
- Redirecionamento automático

**Estados obrigatórios**
- default (única — estado terminal, sem erro)

**Regras de negócio**
- `setTimeout(() => navigate(-1), 1500)` — volta para a tela de onde o usuário veio (Meus Dados, na prática, nos dois entry points mapeados).
- Não há distinção de copy entre "contato confirmado" (VC-01) e "contato trocado e confirmado" (VC-02) — o texto é sempre "E-mail verificado!"/"Celular verificado!".

**Microcopy crítica**
- Título: "E-mail verificado!" / "Celular verificado!"
- Subtítulo: "Voltando para a tela anterior..."

**Acessibilidade mínima**
- Transição anunciada para leitor de tela (aria-live), já que a navegação é automática e não depende de ação do usuário

---

### Tela: VC-04 — Modal "Falar com o suporte"

**Objetivo da tela**
- Avisar, antes de abrir o chat, que a validação/troca do contato só pode ser concluída com o suporte — evita que o usuário estranhe o chat abrindo sozinho sem contexto.

**Componentes principais**
- Desktop (`≥768px`, via `useMediaQuery`): `Dialog`/`DialogContent` (`@/components/ui/dialog`), `max-w-md`
- Mobile: `Drawer`/`DrawerContent` (`@/components/ui/drawer`, biblioteca `vaul`) — mesmo padrão já usado no modal "Cancelar proposta" de `UnicoAguardando.tsx`
- 2 botões de ação (primário + outline)

**Estados obrigatórios**
- default (única — sem loading/erro; abrir o chat é síncrono do ponto de vista da UI, mesmo a resposta da Jade sendo assíncrona)

**Regras de negócio**
- Disparado pelo link "Não consigo validar meu contato", presente em VC-01 e VC-02.
- Botão "Iniciar chat" (`handleIniciarChatSuporte`): fecha o modal, chama `abrirChat()` do `ChatContext`, e **imediatamente em seguida** chama `enviarMensagemContexto()` com a mensagem `[SISTEMA] Usuário solicitou ajuda para validar e-mail/celular. Encaminhar para suporte humano.` — essa mensagem **nunca aparece como bolha do usuário** no histórico (`enviarMensagemContexto` não faz `setMensagens` para o `role: "user"`, só para a resposta do `assistant`) — ver seção 6 do `ChatContext` no journey-spec da Central de Ajuda para o mecanismo completo.
- Botão "Cancelar": só fecha o modal (`setAvisoSuporteAberto(false)`), nenhum efeito colateral.
- Não há tratamento de erro específico nesta tela para falha do `enviarMensagemContexto()` — o fallback já existe dentro do `ChatContext` (mensagem "Desculpe, ocorreu um erro. Por favor, tente novamente." aparece como resposta da Jade).

**Microcopy crítica**
- Título: "Falar com o suporte"
- Corpo: "Por segurança, a troca de contato precisa ser concluída junto ao suporte do Pode Já. Vamos iniciar o chat de atendimento para te ajudar."
- Botão primário: "Iniciar chat"
- Botão secundário: "Cancelar"

**Acessibilidade mínima**
- Foco preso no modal (comportamento padrão do Radix `Dialog` / `vaul` `Drawer`)
- Overlay fecha o `Dialog` ao clicar fora (`dismissible` não foi setado como `false`, diferente do `ChatBubble` no mobile)

## 6) Regras de negócio críticas

- **Confirmação pelo contato antigo é obrigatória para qualquer troca** — decisão deliberada de segurança: só quem já tem acesso ao e-mail/celular cadastrado pode trocá-lo, mesmo estando autenticado no app. Não existe caminho de UI que efetive uma troca sem passar por VC-02.
- **Todas as ocorrências de "Conta verificada" em `App.tsx` são condicionais às duas flags** (`podeja_email_validado` e `podeja_telefone_validado` ambas `"true"`) — corrigido em 2026-09-02: as ocorrências na sidebar desktop (`HomeScreen`, `AccountScreen`) e no header do dashboard, que antes eram texto estático, agora seguem a mesma regra da badge de Minha Conta e alternam para "Verificação pendente" quando qualquer uma das duas está pendente. A `SubPageLayout` (sidebar usada por todas as subpáginas, incluindo `VerificarContato`) também foi corrigida — tinha o mesmo texto estático e não havia sido pega na primeira auditoria.
  - Minha Conta (badge com ícone, `AccountScreen`): `localStorage.getItem("podeja_telefone_validado") === "true" && localStorage.getItem("podeja_email_validado") === "true"` → badge verde "Conta verificada" **ou** badge cinza "Verificação pendente".
  - Sidebar desktop (`HomeScreen`, `AccountScreen`, `SubPageLayout`) e header do dashboard: mesmo texto, condicionado à mesma checagem (`contaVerificada`, calculado uma vez em `HomeScreen`/`AccountScreen`; calculado inline na `SubPageLayout`, que é um componente separado sem acesso a essa variável).
- **Meus Dados > Contato** (`src/App.tsx`, seção "Contato"): cada campo (E-mail/Celular) mostra badge "Verificado" (verde) ou "Pendente" (âmbar) lendo o mesmo `storageKey`; só mostra o link "Verificar" quando `!verificado` — "Alterar" aparece sempre, independentemente do status.
- **Trocar contato em Meus Dados redireciona imediatamente para a confirmação (VC-02), mas não zera a verificação do contato antigo antes de confirmar** — `salvarEdicao()` não grava nada em `localStorage` até o código em VC-02 ser validado. Isso significa que, enquanto uma troca está pendente de confirmação, Meus Dados continua mostrando o **valor e o status antigos** (ex.: "Verificado" com o e-mail anterior) — não existe um estado intermediário "trocando..." visível fora da tela VC-02.
- **Código de teste é fixo e compartilhado pelos dois fluxos:** `123456` (`CODIGO_VALIDO`) — **DESIGN ONLY**, não há validação real de API em nenhum dos dois estados (`codigo` e `confirmando`).
- **Chaves de `localStorage` usadas pela jornada** (note a assimetria de nomenclatura entre e-mail e celular):
  - `podeja_email` — valor do e-mail
  - `podeja_celular` — valor do celular
  - `podeja_email_validado` — status de verificação do e-mail
  - `podeja_telefone_validado` — status de verificação do celular (**não** é `podeja_celular_validado`)
- **Histórico do chat aberto via escape hatch (VC-04) é o mesmo `ChatContext` global** — em memória apenas (`useState` no `ChatProvider`), perdido ao recarregar a página. TODO pendente com devs: confirmar persistência (sessionStorage vs. localStorage) — mesmo TODO já registrado no journey-spec da Central de Ajuda, não é específico desta jornada.
- **A mensagem de contexto `[SISTEMA]` é uma convenção interna, não um contrato validado com o backend do `taya-ai-engine`** — o texto é só mais uma mensagem de usuário do ponto de vista do endpoint `/chat`; não há tratamento especial no backend (até onde o front sabe) para esse prefixo. Ver Open Questions.

## 7) Taxonomia de eventos Amplitude

### Regras gerais
- Convenção: `snake_case`, padrão `<dominio>_<acao>_<estado>`.
- **Hoje não existe nenhuma instrumentação real** nesta jornada — assim como em Crédito Pessoal e Central de Ajuda, `trackStep()`/eventos não são chamados em nenhum ponto de `VerificarContato.tsx` ou `ChatContext.tsx`. A taxonomia abaixo é proposta nova.
- Todos os eventos com `qa_status: pending`.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| `contact_verification_started` | Entrada em VC-01 (estado `codigo`) | verificar_contato | verificacao_contato | codigo | (padrão) + `tipo` (`email`\|`celular`) | `origem` (`dashboard_card`\|`meus_dados`) | Analytics | pending |
| `contact_verification_code_submitted` | CTA "Verificar código" clicado | verificar_contato | verificacao_contato | codigo | (padrão) + `tipo` | — | Analytics | pending |
| `contact_verification_success` | Código validado com sucesso (VC-01 → VC-03) | verificar_contato | verificacao_contato | codigo | (padrão) + `tipo` | — | Analytics | pending |
| `contact_verification_failed` | Código inválido ou incompleto | verificar_contato | verificacao_contato | codigo | (padrão) + `tipo`, `erro_tipo` (`incompleto`\|`invalido`) | — | Analytics | pending |
| `contact_verification_resend_requested` | Link "Reenviar código" clicado | verificar_contato | verificacao_contato | codigo | (padrão) + `tipo` | — | Analytics | pending |
| `contact_change_confirmation_started` | Entrada em VC-02 (estado `confirmando`, via `novoValor` recebido) | verificar_contato | verificacao_contato | confirmando | (padrão) + `tipo` | — | Analytics | pending |
| `contact_change_confirmed` | Código validado com sucesso (VC-02 → VC-03), novo valor salvo | verificar_contato | verificacao_contato | confirmando | (padrão) + `tipo` | — | Analytics | pending |
| `contact_support_requested` | Clique em "Não consigo validar meu contato" (abre VC-04) | verificar_contato | verificacao_contato | codigo \| confirmando | (padrão) + `tipo`, `estado_origem` (`codigo`\|`confirmando`) | — | Analytics | pending |
| `contact_support_chat_opened` | Clique em "Iniciar chat" no modal VC-04 | verificar_contato | verificacao_contato | codigo \| confirmando | (padrão) + `tipo`, `estado_origem` | — | Analytics | pending |

### Exemplo de payload
```json
{
  "event_name": "contact_change_confirmed",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-09-02T10:00:00Z",
  "platform": "Web",
  "flow_name": "verificacao_contato",
  "step_name": "confirmando",
  "screen_name": "verificar_contato",
  "tipo": "email"
}
```

## 8) Critérios de QA de tracking
- Cobertura de eventos críticos >= 90% (happy path completo dos Fluxos A, B e C instrumentado antes de considerar "pronto")
- Conformidade de taxonomia >= 95%
- Completude de propriedades >= 95%
- PII indevida = 0 — atenção especial aqui: **nunca** enviar o valor bruto do e-mail/celular (nem mascarado) como propriedade de evento, só `tipo` (`email`/`celular`) e flags/IDs
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

**Impacto em escopo**
- Esta spec não altera comportamento; formaliza o que já existe para orientar a integração com API real (envio/validação de código) e a instrumentação de analytics.

**Riscos e dependências**
- **Toda a jornada roda sobre mocks** — código de verificação fixo (`123456`), sem chamada real de envio de SMS/e-mail nem de validação. Qualquer demo/teste externo precisa deixar isso claro.
- **Nenhuma instrumentação de analytics ativa hoje** — a taxonomia da seção 7 é pré-requisito para qualquer análise de funil desta jornada.
- **Depende do `taya-ai-engine`** para o Fluxo C funcionar de ponta a ponta (mesma dependência/bloqueio de CORS já documentado no journey-spec da Central de Ajuda) — se o endpoint `/chat` não responder, o usuário que clicou "Iniciar chat" recebe só a mensagem de erro genérica da Jade, sem indicação de que foi encaminhado ao suporte.

**Impacto esperado em métricas**
- Sem instrumentação, hoje é impossível medir quantas verificações terminam em sucesso vs. abandono, quantas trocas de contato acontecem, ou qual a taxa de escalonamento para o suporte (Fluxo C) — a implementação da taxonomia da seção 7 é pré-requisito.

**Plano de rollout**
- Não aplicável (documentação retroativa). Rollout futuro relevante: substituição do mock de código por chamada real de API, tela a tela, conforme os TODOs listados na seção 5.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Formato da mensagem `[SISTEMA]` enviada ao abrir o chat via escape hatch — é a convenção esperada pelo time do agente (`taya-ai-engine`), ou precisa de um contrato formal (ex.: campo separado no payload, não concatenado ao `message`)? | Time do agente / AI Engine | — | aberto |
| Persistência do histórico do chat (sessionStorage vs. localStorage) — mesma pendência já registrada no journey-spec da Central de Ajuda; impacta também as conversas iniciadas via este escape hatch | Devs | — | aberto |
| Timeout do código de verificação — não implementado no mock (o código `123456` nunca expira); qual deve ser a janela de validade em produção? | Devs / Segurança | — | aberto |
| Verificação obrigatória bloqueando a jornada de produto — hoje não há nenhum ponto do app que impeça contratação quando `podeja_telefone_validado !== "true"`; isso deve ser implementado, e em quais jornadas? | PO | — | aberto |
| ~~Os textos estáticos "Conta verificada" (sidebar desktop, header do dashboard, `SubPageLayout`) deveriam checar as mesmas flags do badge de Minha Conta?~~ | Design/PO | — | **resolvido 2026-09-02** — corrigido para condicional em todos os pontos, ver seção 6 |
| O botão "Alterar" em Meus Dados > Contato deveria abrir a confirmação de posse do contato **atual** antes mesmo de deixar o usuário digitar o novo valor (ex.: reautenticação), ou o modelo atual (digitar novo valor primeiro, confirmar depois) é o desejado? | Design/PO / Segurança | — | aberto |
