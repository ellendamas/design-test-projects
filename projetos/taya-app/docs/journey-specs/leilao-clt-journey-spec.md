---
agent: ellen-damasceno
project: podeja-leilao-clt
journey: leilao-clt
platform: Web (PWA Mobile-first)
date: 2026-09-17
depends_on: [ctps-digital, unico, taya-ai-engine]
status: draft
---

# Journey Spec - Leilão CLT

> **Nota sobre este documento:** mapeia a jornada de Crédito Consignado CLT via leilão exatamente como ela existe hoje no código (`src/pages/leilao-clt/*`, rotas em `src/App.tsx`, componentes compartilhados `ContaSelector`/`EnderecoSelector`/`ErrorScreen`/`UnicoNotice`/`UnicoAguardando`). Toda regra abaixo foi extraída lendo o código-fonte — nenhum comportamento foi inferido ou inventado. PR de referência: [#8](https://github.com/ellendamas/design-test-projects/pull/8), branch `feat/leilao-clt`.

## 1) Resumo executivo da jornada

- **Problema que a jornada resolve:** o usuário já teve seu CPF consultado via CTPS Digital e "ganhou" um leilão entre instituições parceiras — chega com uma oferta de Crédito Consignado CLT **já aprovada**, precisando apenas confirmar dados, verificar identidade e assinar. Existem dois pontos de entrada muito diferentes para essa mesma oferta: (1) um usuário que **já tem conta** no Pode Já e é levado à oferta a partir do próprio app; (2) um usuário que **nunca usou o app**, recebe um link (SMS/e-mail) com a oferta e precisa completar tudo — inclusive decidir se quer ou não criar uma conta — sem nenhuma tela de login/cadastro tradicional no meio do caminho.
- **Resultado esperado para o usuário:** aceitar a oferta, confirmar/informar os dados necessários (endereço, forma de recebimento, e no caso de quem não tem conta também e-mail/celular), verificar a identidade via Unico, assinar e ver a confirmação de que o dinheiro está a caminho — com o mínimo de fricção possível e, na jornada sem conta, **sem nunca ser obrigado a criar uma conta** para receber o dinheiro.
- **Impacto esperado para o negócio:** aumenta a conversão de ofertas de leilão ao remover a barreira de "preciso ter conta no app" (jornada sem conta reduz TTV — time to value); a criação de conta pós-sucesso vira uma oportunidade de retenção (mini-onboarding de 2 passos, sem repetir dados já coletados) em vez de um obstáculo pré-requisito.

## 2) Escopo e contexto

- **Tipo:** nova jornada (feature nova, ponta a ponta).
- **Origem:** demanda "Leilão CLT" — protótipo de design para handoff, sem API real conectada ainda.
- **Telas/componentes que esta jornada *possui* (criados especificamente para ela):** todos os arquivos em `src/pages/leilao-clt/*` (23 arquivos: 13 telas + `leilaoData.ts` + o novo `PixSelector.tsx`, construído exclusivamente para esta jornada).
- **Telas/componentes que esta jornada *integra*, mas não possui:**
  - `ContaSelector` / `EnderecoSelector` (`src/components/*`) — reaproveitados de outros produtos (Consignado CLT, FGTS, Crédito Pessoal). Dois props novos foram adicionados **a esses componentes compartilhados** especificamente para esta jornada: `ocultarCabecalho` e `autoConfirmarSelecao` (ver seção 6) — usados apenas onde a jornada Leilão CLT chama esses componentes; o comportamento default (sem essas props) não muda para os outros produtos.
  - `ErrorScreen` (`src/components/ErrorScreen.tsx`) — 4 categorias de erro novas foram adicionadas ao `Record` compartilhado: `leilao_expirada`, `leilao_cancelada`, `leilao_falha_averbacao`, `leilao_falha_desembolso`.
  - `UnicoNotice` / `UnicoAguardando` (`src/components/*`) — reaproveitados sem alteração do padrão já usado em Consignado CLT.
  - `ContratoCLTPage` (rota `/contratos/clt-001`, em `App.tsx`) — tela de contrato já existente, reaproveitada como destino do card do dashboard e como base estrutural (trimmed) da tela de contrato pública desta jornada.
  - Card "Para você agora" no dashboard (`src/App.tsx`) — novo card `mostrarLeilaoContratoAtivo`, mas inserido dentro da seção já existente de cards.
- **Fora de escopo:**
  - Autenticação real via token do link (hoje é decorativo, `?token=mock`) — dados do lead vêm de um mock fixo (`LEAD_MOCK`).
  - Integração real com Unico (callback de verificação/assinatura) — hoje é um `setTimeout` que abre uma URL fixa em nova aba e navega para um estado "aguardando".
  - Cálculo real de IOF/CET/taxas — hoje é uma aproximação local (mesma fórmula do Consignado CLT).
  - Qualquer trabalho de analytics/instrumentação — a taxonomia da seção 7 é proposta nova, não há nenhum evento disparado hoje.

## 3) Mapa da jornada (passo a passo)

### Com conta (usuário logado)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| LC-00 | Ver que tem uma oferta de leilão aprovada | Card "Oferta de Leilão CLT aprovada" no dashboard — só aparece com `/painel?clt=leilao_aprovado` (**DESIGN ONLY**) | LC-01 | Usuário entra na oferta |
| LC-01 | Aceitar a oferta | Marca o consentimento e clica "Aceitar e continuar" | LC-02 | Avança para completar os dados pendentes |
| LC-02 | Informar endereço de recebimento | Preenche/seleciona endereço — confirmação automática, sem botão de salvar | LC-03 | Avança automaticamente para a forma de recebimento |
| LC-03 | Escolher e informar forma de recebimento | Escolhe Conta bancária ou Chave Pix, informa os dados (confirmação automática) e clica "Continuar" | LC-04 (estado aviso) | Segue para a verificação de identidade |
| LC-04 | Iniciar verificação de identidade | Clica "Continuar para verificação" | LC-05 | É redirecionado (nova aba) para a Unico |
| LC-04b | Retomar verificação abandonada | Reabre `/leilao/assinatura` depois de já ter iniciado — vê estado `aguardando` | LC-05 (via "Reabrir verificação") ou LC-07 (via "Cancelar proposta") | Continua de onde parou, ou cancela a proposta |
| LC-05 | (transição) Ser levado à Unico | Chegada automática (3s) ou clique manual (após 10s) em LC-04/LC-04b | Nova aba: Unico (mock) + retorno a LC-04b | — |
| LC-06 | Ver confirmação de sucesso | Chegada direta por URL nesta fase de protótipo (dependeria do callback real da Unico) | LC-06 | Vê valor, parcela e banco de recebimento; pode ir para o contrato |
| LC-07 | (terminal) Ver erro/exceção | Oferta expira, é cancelada, ou falha averbação/desembolso | Tela de exceção correspondente | Entende o motivo e tem uma ação (voltar ao início ou falar com suporte) |
| LC-08 | Acompanhar o contrato depois | Card "Você tem um contrato Consignado CLT ativo!" no dashboard (só existe para quem veio da jornada sem conta e criou conta) | `/contratos/clt-001` | Vê o contrato; o card some do dashboard a partir desse clique |

### Sem conta (guest, via link)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| LG-00 | Receber o link da oferta | Link externo (SMS/e-mail, fora do app) | LG-01 (`/leilao/oferta?token=mock`) | Abre a oferta sem precisar logar |
| LG-01 | Aceitar a oferta | Marca o consentimento e clica "Aceitar oferta" (ou "Já tenho conta" para logar e cair na jornada com conta) | LG-02 | Avança para dados básicos |
| LG-02 | Informar e-mail e celular | Preenche e-mail/celular válidos, clica "Continuar" | LG-03 | Avança para confirmação de dados |
| LG-03 | Confirmar CPF/nome (bloqueados) e informar endereço + forma de recebimento | Preenche tudo via modais/drawers na mesma tela, clica "Continuar" | LG-04 | Avança para verificação por SMS |
| LG-04 | Verificar celular (MFA) | Digita o código recebido por SMS (mock: `123456`) | LG-06 (estado aviso) | Segue para a verificação de identidade |
| LG-05 | (transição) Ser levado à Unico | Igual a LC-05, rota apartada | Nova aba: Unico (mock) + retorno a LG-06 (estado aguardando) | — |
| LG-06 | Iniciar/retomar verificação de identidade | Igual a LC-04/LC-04b, rota apartada | LG-05 ou cancelamento | — |
| LG-07 | Ver confirmação de sucesso | Chegada direta por URL nesta fase de protótipo | LG-07 | Vê valor/parcela/banco; escolhe criar conta ou continuar sem conta |
| LG-08 | Criar conta para acompanhar | Clica "Criar conta para acompanhar" em LG-07 | LG-08 (2 passos: PIN → necessidades) | Ao concluir, vai **direto para o dashboard já logado**, sem repetir nome/e-mail/celular/CPF (já coletados antes) |
| LG-09 | Continuar sem criar conta | Clica "Continuar sem conta" em LG-07 | LG-09 (`/leilao/contrato`) | Vê o contrato simplificado e pode baixá-lo, sem nunca ter criado conta |
| LG-10 | (terminal) Ver erro/exceção | Oferta expira, é cancelada, ou falha averbação/desembolso | Tela de exceção correspondente (rota apartada) | Entende o motivo; CTA "Fechar"/"Falar com suporte" (não há "voltar ao início" logado, pois não há sessão) |

## 4) Inventário de telas

| screen_id | nome | rota | plataforma | status | owner |
|---|---|---|---|---|---|
| LC-01 | Oferta aprovada (com conta) | `/leilao` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-02 | Dados pendentes — Endereço | `/leilao/dados-pendentes` (etapa 1) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-03 | Dados pendentes — Forma de recebimento | `/leilao/dados-pendentes` (etapa 2) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-04 | Verificação de identidade | `/leilao/assinatura` (+ `?status=aguardando`, `?erro=`) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-05 | Redirecionando para Unico | `/leilao/redirecionando/unico` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-06 | Sucesso | `/leilao/sucesso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-07 | Telas de exceção (4 variantes) | `/leilao/expirada`, `/leilao/cancelada`, `/leilao/falha-averbacao`, `/leilao/falha-desembolso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-08 | Card "Contrato ativo" (dashboard) | `/painel` (seção "Para você agora") | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-01 | Oferta aprovada (guest) | `/leilao/oferta` (+ `?token=`) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-02 | Dados básicos (e-mail/celular) | `/leilao/dados` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-03 | Confirmar dados (CPF/nome/endereço/forma) | `/leilao/confirmar-dados` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-04 | Verificação por SMS (MFA) | `/leilao/mfa` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-05 | Redirecionando para Unico (guest) | `/leilao/oferta/redirecionando/unico` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-06 | Verificação de identidade (guest) | `/leilao/oferta/assinatura` (+ `?status=aguardando`, `?erro=`) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-07 | Sucesso (guest) | `/leilao/oferta/sucesso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-08 | Criar conta (pós-sucesso) | `/leilao/criar-conta` (2 passos) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-09 | Contrato simplificado (sem conta) | `/leilao/contrato` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-10 | Telas de exceção (guest, 4 variantes) | `/leilao/oferta/expirada`, `/oferta/cancelada`, `/oferta/falha-averbacao`, `/oferta/falha-desembolso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |

**Observação de proteção de rota:** todas as rotas `LC-*` seguem `getStoredUser() ? <Componente/> : <Navigate to="/boas-vindas" />`; todas as rotas `LG-*` são públicas (sem checagem de auth), exceto `/leilao/criar-conta`, que é o inverso: `!getStoredUser() ? <LeilaoCriarContaPage/> : <Navigate to="/painel"/>` — um usuário já logado não consegue acessar essa tela. As duas jornadas são **arquivos e rotas totalmente separados**, sem nenhuma checagem de `getStoredUser()`/`localStorage` dentro de um componente compartilhado — decisão deliberada para não repetir um bug anterior em que uma tela de redirecionamento (Unico) decidia o destino com base em auth state e acabava levando usuários guest para a jornada logada por causa de `localStorage` de um teste anterior.

## 5) Spec por tela

### Tela: LC-01 / LG-01 — Oferta aprovada

**Objetivo da tela**
- Apresentar a oferta já aprovada (valor, parcelas, taxa, IOF, previsão de crédito) e coletar o consentimento antes de avançar.

**Componentes principais**
- Ícone de sucesso animado (`CheckCircle`, spring)
- Card "Sua oferta" com badge do parceiro (`Bull`)
- Card "Previsão de crédito na conta"
- Card "Detalhes do consignado" (fundo laranja claro)
- Checkbox de consentimento (custom, não é o componente `Checkbox` padrão)
- CTA primária "Aceitar e continuar" (LC-01) / "Aceitar oferta" (LG-01)
- Só em LG-01: CTA secundária "Já tenho conta" (`variant="outline"`) + rodapé de Termos de Uso/Política de Privacidade (abre `TermosModal`)

**Estados obrigatórios**
- default (consentimento desmarcado, CTA desabilitada)
- consentimento marcado (CTA habilitada)

**Regras de negócio**
- Valores vêm de `OFERTA_LEILAO` (mock): R$ 32.533,83 em 48x de R$ 891,20, taxa 2,49% a.m.
- IOF, taxa anual, CET e total a pagar são **calculados no cliente** (`iof = valor * 0.0332`, `cetMensal = taxaMensal + 0.21`) — `// TODO: receber IOF/CET/total real da API`.
- LC-01: CTA sempre fixa no rodapé (`fixed bottom-0`, `md:relative` no desktop).
- LG-01: CTAs **não são fixas** — ficam no fluxo do conteúdo, decisão deliberada porque a tela tem bastante texto para ler e um rodapé fixo cobriria conteúdo durante o scroll.
- LG-01 propaga `searchParams` (ex.: `?token=mock`) para a próxima rota (`/leilao/dados`).

**Microcopy crítica**
- Título: "Proposta aprovada!" (LC-01) / "Oferta aprovada" (LG-01)
- Descrição: "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo."
- Texto do consentimento: "Ao continuar, concordo com os termos do contrato de consentimento realizado e autorizo o desconto das parcelas em folha de pagamento."
- CTA primária: "Aceitar e continuar" (LC-01) / "Aceitar oferta" (LG-01)
- CTA secundária (só LG-01): "Já tenho conta"

**Acessibilidade mínima**
- Contraste AA nos textos sobre fundo laranja claro (`#FFF3EE`/`#D94E28`)
- Alvo de toque mínimo 44px nos CTAs

---

### Tela: LC-02 — Dados pendentes: Endereço

**Objetivo da tela**
- Coletar o endereço de recebimento de quem já tem conta, sem repetir dados que o app já tem (nome/CPF).

**Componentes principais**
- `EnderecoSelector` (`src/components/EnderecoSelector.tsx`), com `maxItens={1}`, `semProximoPasso` e `autoConfirmarSelecao`

**Estados obrigatórios**
- vazio → modal/drawer de endereço abre automaticamente (comportamento nativo do `EnderecoSelector` quando a lista está vazia)
- preenchido → avança automaticamente para LC-03

**Regras de negócio**
- **Etapa separada de LC-03** (tela própria, sem navegação entre elas dentro do mesmo componente visual) — mas **sem nenhum indicador visual de "passo a passo"** (sem barra de progresso/"Etapa 1 de 2"), decisão explícita para não dar a sensação de uma jornada longa.
- `autoConfirmarSelecao` (prop nova, adicionada ao `EnderecoSelector` nesta feature): ao salvar o endereço (ou selecionar um já salvo), confirma automaticamente e dispara `onConfirmar` — **sem exigir clique em um botão de "Salvar endereço"/"Avançar"** à parte. Isso resolve dois problemas encontrados durante o design: (1) usuário logado não deveria precisar de uma confirmação extra para dados que ele acabou de digitar; (2) quando endereço e forma de recebimento ficaram na mesma tela numa iteração anterior, os dois modais (endereço + conta) abriam simultaneamente — a separação em telas resolveu isso.

**Microcopy crítica**
- Herdada do `EnderecoSelector`: "Confirme seu endereço de recebimento" / "É para onde enviaremos as comunicações do contrato"

**Acessibilidade mínima**
- Foco no primeiro campo do formulário ao abrir o modal/drawer

---

### Tela: LC-03 — Dados pendentes: Forma de recebimento

**Objetivo da tela**
- Coletar a forma de recebimento (conta bancária ou chave Pix), com suporte a múltiplas contas/chaves salvas.

**Componentes principais**
- Cabeçalho próprio da tela: ícone `Bank` + título "Para qual conta enviamos o dinheiro?" (fica **antes** do seletor de método — decisão explícita para não repetir o cabeçalho interno do `ContaSelector`)
- Seletor de método: 2 botões lado a lado (Conta bancária / Chave Pix), nenhum pré-selecionado por padrão
- `ContaSelector` (com `ocultarCabecalho`, `autoConfirmarSelecao`, `maxItens={5}`) quando método = Conta bancária
- `PixSelector` (novo componente local, `src/pages/leilao-clt/PixSelector.tsx`, com `ocultarCabecalho`, `autoConfirmarSelecao`, `maxItens={5}`) quando método = Chave Pix
- CTA fixa no rodapé: "Continuar"

**Estados obrigatórios**
- nenhum método selecionado (nenhum seletor visível ainda — **importante:** não pré-selecionar "Conta bancária" por padrão, pois isso levava o usuário direto para o modal de conta bancária ao sair da tela de endereço, sem chance de escolher Pix)
- método selecionado, lista vazia → modal/drawer de adicionar abre automaticamente
- método selecionado, com item(ns) salvo(s) → lista visível, permite adicionar mais (até 5) e excluir (exceto o último item)
- CTA "Continuar" desabilitada até haver uma conta **ou** uma chave Pix confirmada

**Regras de negócio**
- Escolher um método limpa o outro (`setConta(c); setChavePix(null)` e vice-versa) — mutuamente exclusivos.
- **Suporta múltiplas contas bancárias E múltiplas chaves Pix** (`maxItens={5}` nos dois) — decisão corrigida durante o design: inicialmente só o Pix permitia mais de um item (`maxItens` da conta ficou em 1 por herança de uma versão anterior da tela); igualado depois.
- `ocultarCabecalho`: prop nova no `ContaSelector`, esconde o ícone/título/subtítulo internos do componente (inclusive o subtítulo "O valor é transferido em até 1 dia útil após a assinatura", removido especificamente desta jornada) — usado porque o título já é mostrado uma vez, fora do componente, no topo da tela.
- `autoConfirmarSelecao`: mesmo mecanismo de LC-02, também usado no `ContaSelector` e implementado do zero no `PixSelector`.
- **Somente a inserção de dados (formulário de nova conta/nova chave Pix) acontece em modal/drawer** — a lista/seleção em si fica sempre direto na tela.

**Microcopy crítica**
- Título: "Para qual conta enviamos o dinheiro?"
- Opções: "Conta bancária" (subtítulo interno do card: "Banco, agência e número da conta") / "Chave Pix" ("CPF, e-mail, telefone ou chave aleatória")
- CTA: "Continuar"

**Acessibilidade mínima**
- Estado selecionado do método comunicado por mais que cor (borda + fundo `#FFF3EE`)

---

### Tela: LC-04 / LG-06 — Verificação de identidade

**Objetivo da tela**
- Avisar sobre o redirecionamento para a Unico, permitir retomar uma verificação abandonada, cancelar a proposta, ou exibir um erro do processo de assinatura.

**Componentes principais**
- Estado `aviso`: `UnicoNotice` (logo Unico com fallback textual, 3 itens de benefício — ambiente seguro/selfie/assinatura digital, nota LGPD)
- Estado `aguardando`: `UnicoAguardando` (ícone de ampulheta, CTA "Reabrir verificação" + link "Cancelar proposta" → modal de confirmação)
- Estado `erro`: `ErrorScreen` (ícone `WarningCircle` por padrão, headline/subtítulo por categoria, CTA "Voltar à oferta"/"Fechar")

**Estados obrigatórios**
- `aviso` (default, sem query param)
- `aguardando` (`?status=aguardando`)
- `erro` (`?erro=<categoria>`) — qualquer uma das 16 categorias de `ErrorCategoria` (12 genéricas + 4 específicas de leilão)
- confirmação de cancelamento (modal/drawer sobreposto ao estado `aguardando`)

**Regras de negócio**
- `erroParam` tem prioridade sobre `status` — se `?erro=` estiver presente, o estado de erro é exibido independentemente do valor de `?status=`.
- "Continuar para verificação" e "Reabrir verificação" chamam a **mesma função** (`handleIniciarVerificacao`), que navega para a tela de redirecionamento (LC-05/LG-05).
- "Cancelar proposta" (dentro do modal de confirmação do `UnicoAguardando`) navega para a tela de oferta cancelada (LC-07/LG-10, variante `leilao_cancelada`).
- LC-04: CTA "Voltar à oferta" (no erro) leva para `/leilao` (oferta, mantendo sessão). LG-06: CTA "Voltar à oferta" leva para `/leilao/oferta` (sem sessão).

**Microcopy crítica**
- Aviso — título: "Falta só confirmar sua identidade!" (com conta) / "Falta só confirmar sua identidade!" (guest, mesmo texto) — descrição varia ligeiramente entre as duas ("Sua oferta de Crédito Consignado CLT já está aprovada..." vs "...foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico.")
- Aguardando — título: "Aguardando sua verificação" / descrição: "Você saiu antes de concluir a verificação de identidade. Toque em Reabrir verificação para continuar de onde parou."
- Erro — headline/subtítulo por categoria (ver tabela completa na seção 6)
- Modal de cancelamento: "Cancelar proposta" / "Tem certeza que deseja cancelar? Sua proposta será descartada e não poderá ser recuperada." / "Sim, cancelar" + "Não, continuar"

**Acessibilidade mínima**
- Foco preso no modal de confirmação de cancelamento

---

### Tela: LC-05 / LG-05 — Redirecionando para Unico

**Objetivo da tela**
- Transição visual enquanto o usuário é (supostamente) levado à Unico para verificação de identidade/assinatura.

**Componentes principais**
- Tela cheia, sem `SubPageLayout`/`PublicLayout` (gradiente laranja `#FD5F31` → `#FA9832`)
- Ícone `ArrowSquareOut` com animação de pulso (`scale` em loop)
- Botão manual "Abrir verificação na Unico" (aparece só depois de 10s)

**Estados obrigatórios**
- transição automática (0–3s): sem botão visível
- botão manual disponível (a partir de 10s, permanece mesmo depois do redirecionamento automático já ter ocorrido)

**Regras de negócio**
- Após 3s: `window.open("https://unico.io/verificacao", "_blank")` (URL mock) + `navigate(DESTINO, { replace: true, state })`, onde `DESTINO` é `/leilao/assinatura?status=aguardando` (LC) ou `/leilao/oferta/assinatura?status=aguardando` (LG) — **hardcoded, sem depender de `getStoredUser()`**, decisão deliberada para nunca vazar a jornada errada por causa de `localStorage` de teste.
- Após 10s: mostra o botão manual, que faz o mesmo `window.open` + `navigate` do timer de 3s (útil se o pop-up foi bloqueado pelo navegador).
- `// TODO: substituir pela URL real de verificação/assinatura da Unico quando disponível`.

**Microcopy crítica**
- "Abrindo a Unico..." / "Você será direcionado para verificar sua identidade na plataforma da Unico." / "Abrir verificação na Unico" (botão manual)

**Acessibilidade mínima**
- Anúncio para leitor de tela do redirecionamento automático (hoje não implementado — ver Open Questions)

---

### Tela: LC-06 / LG-07 — Sucesso

**Objetivo da tela**
- Confirmar que o empréstimo foi aprovado e o dinheiro está a caminho, com resumo dos valores.

**Componentes principais**
- Ícone `CheckCircle` verde animado
- Card resumo: Parceiro / Valor a receber / Parcela mensal / Primeira parcela / Banco
- LC-06: CTA "Ver meu contrato" (`/contratos`) + link "Voltar para o início" (`/painel`)
- LG-07: CTA "Criar conta para acompanhar" (`/leilao/criar-conta`) + CTA secundária "Continuar sem conta" (`/leilao/contrato`) — ambas **fixas no rodapé** (`footerTransparente`, via `PublicLayout`), diferente de LG-01 (CTAs não fixas) porque aqui o conteúdo é curto e não há risco de cobrir texto
- LG-07 tem também um bloco "Acompanhe seu contrato" (texto, sem CTA própria) explicando o benefício de criar conta

**Estados obrigatórios**
- default (única — tela de confirmação, sem erro/loading)

**Regras de negócio**
- Nome do banco vem de `location.state.conta` (se o usuário escolheu conta bancária) — mostra `—` se a forma de recebimento foi Pix.
- LC-06: saudação usa o primeiro nome do usuário logado (`getStoredUser()?.name`), condicional (não quebra se vazio).
- LG-07: saudação usa `LEAD_MOCK.nome` (sempre "Ana Souza" — mock fixo, já que ainda não há usuário criado neste ponto).
- Valores de resumo vêm de `OFERTA_LEILAO`; primeira parcela usa a data do mês seguinte calculada no cliente (`// TODO: usar data real da API`).
- Alcançada **diretamente por URL** nesta fase de protótipo — não há nenhuma navegação automática de LC-05/LG-05 até aqui, já que dependeria do callback real da Unico (mesmo padrão do Consignado CLT).

**Microcopy crítica**
- LC-06: "Dinheiro a caminho, {nome}!" / "Seu empréstimo foi aprovado. O valor cai na sua conta entre hoje e em até 3 dias úteis."
- LG-07: mesmo título/subtítulo, mesma estrutura de resumo
- LG-07 CTAs: "Criar conta para acompanhar" / "Continuar sem conta"

**Acessibilidade mínima**
- Ordem de leitura: confirmação → resumo → ações

---

### Tela: LC-07 / LG-10 — Telas de exceção (4 variantes)

**Objetivo da tela**
- Comunicar claramente por que a oferta não pode seguir (expirou, foi cancelada, ou falhou depois de assinada) e dar um próximo passo acionável.

**Componentes principais**
- `ErrorScreen` dentro de `SubPageLayout` (LC) ou `PublicLayout` (LG), sem nenhum outro conteúdo na tela
- `leilao_expirada` usa ícone customizado `ClockCountdown`; as outras 3 usam o ícone padrão (`WarningCircle`)

**Estados obrigatórios**
- Cada rota é uma categoria fixa (não há estado dinâmico dentro da tela) — 4 rotas × 2 jornadas = 8 combinações

**Regras de negócio / microcopy por variante**

| categoria | rota (com conta) | rota (guest) | headline | subtítulo | CTA (com conta) | CTA (guest) |
|---|---|---|---|---|---|---|
| `leilao_expirada` | `/leilao/expirada` | `/leilao/oferta/expirada` | "Sua sessão expirou" | "O prazo para aceitar esta oferta encerrou. Acesse o aplicativo CTPS Digital para solicitar uma nova consulta." | "Voltar ao início" → `/painel` | "Fechar" → `/` |
| `leilao_cancelada` | `/leilao/cancelada` | `/leilao/oferta/cancelada` | "Sua oferta foi cancelada" | "A instituição financeira cancelou esta oferta. Você pode acessar o aplicativo CTPS Digital para participar de uma nova consulta." | "Voltar ao início" → `/painel` | "Fechar" → `/` |
| `leilao_falha_averbacao` | `/leilao/falha-averbacao` | `/leilao/oferta/falha-averbacao` | "Não foi possível finalizar o registro" | "Ocorreu um problema ao registrar sua proposta na folha de pagamento. Entre em contato com nosso suporte." | "Falar com suporte" → abre chat (`useChat().abrirChat`) | "Falar com suporte" → abre chat |
| `leilao_falha_desembolso` | `/leilao/falha-desembolso` | `/leilao/oferta/falha-desembolso` | "Tivemos um problema na liberação do valor" | "O contrato foi assinado, mas houve uma falha ao depositar o valor. Nossa equipe já foi notificada. Entre em contato com o suporte." | "Falar com suporte" → abre chat | "Falar com suporte" → abre chat |

- Nas duas variantes de "falha" (averbação/desembolso), o CTA abre o chat de suporte (`ChatContext`) em vez de navegar — mesmo padrão usado em outros produtos para erros pós-assinatura.
- Nas duas variantes com conta, o CTA sempre volta para `/painel` (usuário tem sessão); no guest, sempre para `/` (sem sessão para onde "voltar").

**Acessibilidade mínima**
- Headline como texto, não só ícone/cor, para diferenciar as 4 categorias

---

### Tela: LG-02 — Dados básicos (e-mail/celular)

**Objetivo da tela**
- Coletar e-mail e celular de quem ainda não tem conta (CPF já vem do token, não é editável nesta tela).

**Componentes principais**
- Campo E-mail (`Input` nativo)
- Campo Celular (`IMaskInput`, máscara `(00) 00000-0000`)
- CTA fixa no rodapé (`PublicLayout`, `footerTransparente`): "Continuar"

**Estados obrigatórios**
- default / CTA desabilitada até e-mail e celular válidos

**Regras de negócio**
- Validação de e-mail: regex simples `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- Validação de celular: pelo menos 10 dígitos após remover máscara.
- Propaga `location.state` recebido (inclusive `token`, se veio de LG-01) + adiciona `email`/`celular` ao state ao navegar para LG-03.

**Microcopy crítica**
- "Confirme seus dados" / "Precisamos de algumas informações para gerar seu contrato." / CTA: "Continuar"

**Acessibilidade mínima**
- `type="email"` no campo de e-mail (teclado correto em mobile)

---

### Tela: LG-03 — Confirmar dados

**Objetivo da tela**
- Reunir CPF/nome (bloqueados), e-mail/celular (editáveis), endereço e forma de recebimento numa única tela, toda em modal/drawer, para que o usuário nunca "saia" da tela de confirmação.

**Componentes principais**
- Card com 4 linhas: CPF (bloqueado, ícone `LockSimple`), Nome completo (bloqueado), E-mail (editável), Celular (editável)
- Card "Endereço de recebimento" (resumo + botão Adicionar/Alterar → modal/drawer com `EnderecoSelector`)
- Card "Forma de recebimento" (resumo + botão Adicionar/Alterar → modal/drawer com seletor de método → `ContaSelector` ou input de chave Pix)
- CTA fixa no rodapé: "Continuar"

**Estados obrigatórios**
- Cada linha/card: "Não informado" (vazio) vs. preenchido
- Erro inline ao editar e-mail/celular (mesma validação de LG-02)

**Regras de negócio**
- CPF e nome vêm de `LEAD_MOCK` e **não são editáveis** (ícone de cadeado, sem botão de ação).
- **Diferente de LC-03: aqui tudo (endereço e forma de recebimento, incluindo a lista/seleção) acontece em modal/drawer** — decisão deliberada e diferente da jornada com conta, para reforçar a sensação de "uma tela só" no fluxo guest (testado e revertido de volta a este padrão depois de uma iteração que colocava o `ContaSelector` direto na tela, como em LC-03).
- Endereço e conta limitados a 1 item cada (`maxItens={1}`) nesta tela — diferente de LC-03, que permite múltiplos.
- Escolher Conta bancária ou Chave Pix limpa o outro (mesma regra de mutual exclusão de LC-03).
- CTA "Continuar" exige e-mail + celular + endereço + (conta OU chave Pix) preenchidos.
- Navega para LG-04 levando `email`, `celular`, `endereco`, `conta`, `chavePix` no state.

**Microcopy crítica**
- "Confirme seus dados" / "Revise as informações abaixo para gerar seu contrato."
- Rótulos: "CPF", "Nome completo", "E-mail", "Celular", "Endereço de recebimento", "Forma de recebimento"
- Botões: "Alterar" (campos preenchidos/bloqueados) / "Adicionar" (campos vazios)

**Acessibilidade mínima**
- Cadeado (`LockSimple`) com significado comunicado por texto (linha bloqueada), não só ícone

---

### Tela: LG-04 — Verificação por SMS (MFA)

**Objetivo da tela**
- Confirmar que o usuário tem acesso ao celular informado, antes de seguir para a verificação de identidade.

**Componentes principais**
- `InputOTP` de 6 dígitos
- Contador de reenvio (30s) → vira link "Reenviar código"
- CTA fixa no rodapé: "Verificar e continuar"

**Estados obrigatórios**
- default (OTP vazio, CTA desabilitada)
- erro: código incompleto ou inválido (mensagem inline)
- contando (30s) vs. pronto para reenviar

**Regras de negócio**
- Celular mascarado: `+55 (XX) •••••-XXXX` (últimos 4 dígitos visíveis) — se não houver celular suficiente no state, mostra "o número informado".
- Código de validação mockado: `CODIGO_VALIDO = "123456"` — **DESIGN ONLY**, `// TODO: integrar com endpoint real de MFA`.
- "Reenviar código": reseta contador para 30s, limpa o campo e o erro — não há chamada real de reenvio.
- Sucesso: `localStorage.setItem("podeja_telefone_validado", "true")` + navega para LG-06 (`/leilao/oferta/assinatura`) levando o state adiante.

**Microcopy crítica**
- "Confirme seu celular" / "Enviamos um código por SMS para {celular mascarado}."
- Erros: "Digite o código de 6 dígitos." / "Código inválido. Verifique e tente novamente."
- "Reenviar em Xs" → link "Reenviar código"
- CTA: "Verificar e continuar"

**Acessibilidade mínima**
- Foco automático no primeiro slot do OTP

---

### Tela: LG-08 — Criar conta (pós-sucesso)

**Objetivo da tela**
- Deixar o usuário que já completou toda a jornada guest criar uma conta para acompanhar o contrato, **sem repetir nenhum dado já coletado** (nome/e-mail/CPF/celular) — só senha e uma pergunta de personalização.

**Componentes principais**
- Passo 1: `StepHeader` (1 de 2) + campo de senha numérica de 6 dígitos + lista de regras de senha
- Passo 2: `StepHeader` (2 de 2) + grid de opções "O que é importante pra você nesse momento?" (`NECESSIDADES`, multi-seleção)
- Layout: `PublicLayout` (sem sidebar/menu — **corrigido nesta feature**: a tela usava `SubPageLayout`, que renderiza a sidebar/nav de usuário logado mesmo com `hideNav`, o que não fazia sentido para quem ainda não tem conta)

**Estados obrigatórios**
- Passo 1: CTA "Continuar" desabilitada até PIN válido (6 dígitos, não sequência fraca)
- Passo 1: aviso inline se o PIN for uma sequência fraca (ex.: `123456`, dígitos repetidos)
- Passo 2: CTA "Concluir" desabilitada até pelo menos 1 necessidade marcada

**Regras de negócio**
- `isWeakNumericPin` (compartilhado com o onboarding principal) bloqueia sequências óbvias.
- Ao concluir (`finalizar`): grava `podeja_user` (nome + e-mail, do `LEAD_MOCK`/state), `podeja_necessidades`, e **`podeja_leilao_contrato_ativo = "true"`** — esta última flag é o que faz o card LC-08 aparecer no dashboard. Depois navega direto para `/painel`, **sem** passar por PIN/necessidades de novo (esse é o próprio mini-onboarding) e sem pedir data de nascimento (que fica pendente para ser solicitada depois, via um card futuro de "completar cadastro" em "Para você agora" — não implementado nesta feature).

**Microcopy crítica**
- Passo 1: "Crie sua senha de acesso" / "Vai ser usada para entrar no app." / regras: "Não use sequências (123456)", "Não use sua data de nascimento", "Guarde essa senha em um lugar seguro"
- Passo 2: "Quase lá" / "O que é importante pra você nesse momento?" / "Escolha tudo que faz sentido para você. Você pode mudar isso depois."
- CTAs: "Continuar" (passo 1) / "Concluir" (passo 2)

**Acessibilidade mínima**
- Máscara de senha (`type="password"`) com `inputMode="numeric"`

---

### Tela: LG-09 — Contrato simplificado (sem conta)

**Objetivo da tela**
- Dar acesso ao contrato para quem optou por **não** criar conta, com uma versão mais simples da tela de contrato já existente no app.

**Componentes principais**
- Aviso amarelo "contrato de exemplo para fins de demonstração"
- Seções: status/produto, Parceiro/Data de emissão/Modalidade/Valor líquido, "Parcelas" (fundo laranja), "Taxas e custos"
- CTA fixa no rodapé (`footerTransparente`): "Baixar contrato"

**Estados obrigatórios**
- default (única)

**Regras de negócio**
- Reaproveita o registro `clt-001` de `src/data/contratos.ts` (mesmo dado usado por `ContratoCLTPage`, a tela de contrato do app logado) — **explicitamente sem os blocos sensíveis de emitente/depósito nem o bloco de quitação antecipada**, que só existem na versão logada.
- Botão "Baixar contrato" ainda não tem ação real (`// TODO: conectar ao GET /propostas/{id}/ccb`).

**Microcopy crítica**
- "Ativo" / nome do produto / "Baixar contrato"

**Acessibilidade mínima**
- Aviso de demonstração legível (contraste AA sobre fundo âmbar claro)

---

### Tela: LC-08 — Card "Contrato ativo" (dashboard)

**Objetivo da tela**
- Dar visibilidade imediata, na primeira entrada no app, de que o usuário já tem um contrato ativo — sem que ele precise procurar.

**Componentes principais**
- Card na seção "Para você agora" (`/painel`), sempre na primeira posição quando visível
- Ícone `Money` (Phosphor, `weight="fill"`) em círculo verde-claro
- Texto "Você tem um contrato Consignado CLT ativo!" + "Ver contrato →"

**Estados obrigatórios**
- visível (ver regra de exibição abaixo)
- oculto (depois do primeiro clique, ou se a flag de origem nunca foi setada)

**Regras de negócio**
- Só aparece se `podeja_leilao_contrato_ativo === "true"` **e** `podeja_leilao_contrato_visto !== "true"` — a primeira flag é setada em LG-08 (criação de conta pós-sucesso da jornada guest); é o **único** jeito de o card aparecer (não existe para quem entrou pela jornada com conta desde o início).
- Ao clicar, grava `podeja_leilao_contrato_visto = "true"` **antes** de navegar para `/contratos/clt-001` — o card não aparece mais em nenhuma visita futura ao dashboard, mesmo se o usuário voltar sem ter "terminado" de ver o contrato.
- Sempre em primeira posição entre os cards de "Para você agora" (à frente inclusive do card de oferta de leilão aprovada, `mostrarLeilaoAprovado`).

**Microcopy crítica**
- "Você tem um contrato Consignado CLT ativo!" / "Ver contrato" + seta

**Acessibilidade mínima**
- Card é um `<button>` real (focável, ativável por teclado), não uma `div` com `onClick`

## 6) Diff de UX por tela

> Jornada 100% nova — não há uma versão anterior desta tela para comparar. A tabela abaixo documenta a adição em si (todas as linhas são `new`) e decisões de design que foram corrigidas/revertidas durante a construção, por serem relevantes para quem for revisar o histórico.

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| LC-02/LC-03 | new | Endereço e forma de recebimento viraram telas **separadas** (sem passo a passo visual) — chegou a existir uma versão com as duas juntas numa única tela rolável | A versão "tudo numa tela" causava 2 modais abertos simultaneamente (endereço + conta), já que os dois seletores auto-abrem seu próprio modal quando vazios | Elimina o bug visual e reduz carga cognitiva por tela, sem reintroduzir uma barra de progresso |
| LC-03 | new | `ContaSelector` e `PixSelector` mostram a lista/seleção **direto na tela**; só o formulário de novo item vai para modal/drawer | Uma iteração anterior colocava o seletor inteiro (lista + formulário) dentro de um modal — ficava "modal dentro de modal" para o caso de lista vazia | Reduz uma camada de indireção; usuário vê o que já tem salvo sem abrir nada |
| LC-03 | new | Método de recebimento não vem mais pré-selecionado por padrão | "Conta bancária" pré-selecionada fazia o usuário cair direto no modal de conta ao sair da tela de endereço, sem chance de escolher Pix | Reduz erro de seleção não intencional |
| LC-03 | new | `ContaSelector` ganhou suporte a múltiplas contas (`maxItens` igualado ao do Pix) | Só o Pix permitia mais de uma chave; conta bancária tinha ficado limitada a 1 por herança de uma versão anterior | Paridade de capacidade entre os dois métodos |
| LG-03 | new | Todo o fluxo de endereço/forma de recebimento acontece em modal/drawer (ao contrário de LC-03) | Decisão de manter a sensação de "uma tela só" mais forte na jornada guest do que na jornada logada | Jornada guest permanece com fricção mínima percebida |
| LG-05 (redirecionamento Unico) | new | Destino da tela de retorno é **hardcoded por rota**, sem checar `getStoredUser()` | Uma versão anterior decidia o destino por auth state e podia levar um usuário guest para a tela de assinatura da jornada logada, por causa de `localStorage` deixado de um teste anterior | Elimina cross-contamination entre as duas jornadas |
| LG-08 (criar conta) | new | Layout trocado de `SubPageLayout` para `PublicLayout` | `SubPageLayout` sempre renderiza a sidebar/menu de usuário logado (mesmo com `hideNav`), o que não fazia sentido para quem ainda está criando a conta | Remove elemento de UI que não deveria existir nesse ponto da jornada |
| LC-08 (card dashboard) | new | Card some após o primeiro clique (`podeja_leilao_contrato_visto`) | Sem essa regra, o card ficaria permanentemente no topo de "Para você agora", competindo por espaço com cards realmente acionáveis | Mantém "Para você agora" relevante ao longo do tempo |

## 7) Taxonomia de eventos Amplitude

### Regras gerais
- Convenção: `snake_case`, padrão `<dominio>_<acao>_<estado>`.
- **Hoje não existe nenhuma instrumentação real** nesta jornada — nenhuma chamada de tracking existe em nenhum arquivo de `src/pages/leilao-clt/*`. A taxonomia abaixo é proposta nova.
- As duas jornadas **compartilham os mesmos nomes de evento** sempre que a ação é conceitualmente igual — a distinção entre "com conta" e "sem conta" é feita pela propriedade `flow_name` (`leilao_clt_com_conta` / `leilao_clt_sem_conta`), não por sufixos no nome do evento. Isso permite comparar as duas jornadas no mesmo funil.
- Todos os eventos com `qa_status: pending`.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| `leilao_oferta_viewed` | Entrada em LC-01/LG-01 | oferta | com_conta \| sem_conta | oferta | (padrão) | `token_presente` (bool, só sem_conta) | Analytics | pending |
| `leilao_oferta_termo_alternado` | Toggle do checkbox de consentimento | oferta | com_conta \| sem_conta | oferta | (padrão) + `aceito` (bool) | — | Analytics | pending |
| `leilao_oferta_aceita` | CTA "Aceitar e continuar"/"Aceitar oferta" | oferta | com_conta \| sem_conta | oferta | (padrão) | — | Analytics | pending |
| `leilao_login_redirecionado` | "Já tenho conta" (só LG-01) | oferta | sem_conta | oferta | (padrão) | — | Analytics | pending |
| `leilao_dados_basicos_confirmados` | "Continuar" em LG-02 | dados_basicos | sem_conta | dados_basicos | (padrão) | — | Analytics | pending |
| `leilao_endereco_confirmado` | Endereço salvo/selecionado (LC-02 ou dentro de LG-03) | dados_pendentes \| confirmar_dados | com_conta \| sem_conta | endereco | (padrão) | — | Analytics | pending |
| `leilao_forma_metodo_selecionado` | Clique em Conta bancária ou Chave Pix | dados_pendentes \| confirmar_dados | com_conta \| sem_conta | forma_recebimento | (padrão) + `metodo` (`conta`\|`pix`) | — | Analytics | pending |
| `leilao_conta_bancaria_adicionada` | Nova conta salva no `ContaSelector` | dados_pendentes \| confirmar_dados | com_conta \| sem_conta | forma_recebimento | (padrão) | `total_contas_salvas` | Analytics | pending |
| `leilao_chave_pix_adicionada` | Nova chave salva no `PixSelector`/input de Pix | dados_pendentes \| confirmar_dados | com_conta \| sem_conta | forma_recebimento | (padrão) | `total_chaves_salvas` | Analytics | pending |
| `leilao_forma_recebimento_confirmada` | "Continuar" em LC-03, ou forma preenchida dentro de LG-03 | dados_pendentes \| confirmar_dados | com_conta \| sem_conta | forma_recebimento | (padrão) + `metodo` | — | Analytics | pending |
| `leilao_confirmar_dados_editado` | Edição de e-mail/celular via modal (só LG-03) | confirmar_dados | sem_conta | confirmar_dados | (padrão) + `campo` (`email`\|`celular`) | — | Analytics | pending |
| `leilao_confirmar_dados_confirmado` | "Continuar" em LG-03 | confirmar_dados | sem_conta | confirmar_dados | (padrão) | — | Analytics | pending |
| `leilao_mfa_codigo_enviado` | Entrada em LG-04 ou "Reenviar código" | mfa | sem_conta | mfa | (padrão) | — | Analytics | pending |
| `leilao_mfa_codigo_submetido` | "Verificar e continuar" clicado | mfa | sem_conta | mfa | (padrão) | — | Analytics | pending |
| `leilao_mfa_falhou` | Código incompleto ou inválido | mfa | sem_conta | mfa | (padrão) + `erro_tipo` (`incompleto`\|`invalido`) | — | Analytics | pending |
| `leilao_mfa_verificado` | Código correto | mfa | sem_conta | mfa | (padrão) | — | Analytics | pending |
| `leilao_verificacao_iniciada` | "Continuar para verificação" (estado aviso) | assinatura | com_conta \| sem_conta | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_reaberta` | "Reabrir verificação" (estado aguardando) | assinatura | com_conta \| sem_conta | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_cancelada` | "Sim, cancelar" confirmado no modal | assinatura | com_conta \| sem_conta | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_erro_exibido` | `?erro=` presente em LC-04/LG-06 | assinatura | com_conta \| sem_conta | verificacao | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_unico_redirecionamento_aberto` | Abertura da aba da Unico (LC-05/LG-05) | redirecionando_unico | com_conta \| sem_conta | redirecionamento | (padrão) + `modo` (`automatico`\|`manual`) | — | Analytics | pending |
| `leilao_sucesso_viewed` | Entrada em LC-06/LG-07 | sucesso | com_conta \| sem_conta | sucesso | (padrão) | — | Analytics | pending |
| `leilao_contrato_acessado` | "Ver meu contrato" / "Continuar sem conta" / card do dashboard | sucesso \| painel | com_conta \| sem_conta | sucesso \| dashboard | (padrão) + `origem` (`sucesso`\|`dashboard_card`) | — | Analytics | pending |
| `leilao_criar_conta_iniciado` | "Criar conta para acompanhar" (LG-07) | sucesso | sem_conta | sucesso | (padrão) | — | Analytics | pending |
| `leilao_criar_conta_pin_definido` | "Continuar" no passo 1 de LG-08 | criar_conta | sem_conta | pin | (padrão) | — | Analytics | pending |
| `leilao_criar_conta_concluida` | "Concluir" no passo 2 de LG-08 | criar_conta | sem_conta | necessidades | (padrão) + `necessidades` (array) | — | Analytics | pending |
| `leilao_erro_terminal_viewed` | Entrada em qualquer variante de LC-07/LG-10 | expirada \| cancelada \| falha_averbacao \| falha_desembolso | com_conta \| sem_conta | erro_terminal | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_erro_terminal_cta_clicado` | Clique no CTA da tela terminal | expirada \| cancelada \| falha_averbacao \| falha_desembolso | com_conta \| sem_conta | erro_terminal | (padrão) + `erro_categoria`, `destino` (`painel`\|`home`\|`chat_suporte`) | — | Analytics | pending |
| `leilao_dashboard_contrato_card_viewed` | Card LC-08 renderizado (impressão) | painel | com_conta | dashboard | (padrão) | — | Analytics | pending |
| `leilao_dashboard_contrato_card_clicado` | Clique no card LC-08 | painel | com_conta | dashboard | (padrão) | — | Analytics | pending |

### Exemplo de payload
```json
{
  "event_name": "leilao_forma_recebimento_confirmada",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-09-17T10:00:00Z",
  "platform": "Web",
  "flow_name": "leilao_clt_com_conta",
  "step_name": "forma_recebimento",
  "screen_name": "dados_pendentes",
  "metodo": "conta"
}
```

## 8) Critérios de QA de tracking
- Cobertura de eventos críticos >= 90% (happy path completo das duas jornadas, do `leilao_oferta_viewed` ao `leilao_sucesso_viewed`, instrumentado antes de considerar "pronto")
- Conformidade de taxonomia >= 95%
- Completude de propriedades >= 95%
- PII indevida = 0 — **atenção especial**: nunca enviar e-mail/celular/CPF/endereço/dados bancários (nem mascarados) como propriedade de evento; usar só flags, categorias e IDs
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

**Impacto em escopo**
- Feature nova ponta a ponta, sem tocar em fluxos existentes de outros produtos, exceto pelos 2 props novos em `ContaSelector`/`EnderecoSelector` (`ocultarCabecalho`, `autoConfirmarSelecao`) e as 4 categorias novas em `ErrorScreen` — todos aditivos, com default que preserva o comportamento anterior para quem já usava esses componentes.

**Riscos e dependências**
- **Toda a jornada roda sobre mocks** — sem token real do link, sem endpoint de MFA, sem callback real da Unico, sem cálculo real de IOF/CET. A tela de sucesso (LC-06/LG-07) é acessada hoje diretamente por URL, já que depende desse callback.
- **Nenhuma instrumentação de analytics ativa** — a taxonomia da seção 7 é pré-requisito para medir conversão/abandono em qualquer etapa.
- **Depende do `taya-ai-engine`** para o CTA "Falar com suporte" das telas de falha (averbação/desembolso) funcionar de ponta a ponta.
- Push do branch (`feat/leilao-clt`) exigiu trocar a conta ativa do GitHub CLI local (`gh auth switch`) — não é um risco de produto, mas vale registrar para quem for reproduzir o setup de outra máquina.

**Impacto esperado em métricas**
- Sem instrumentação, hoje é impossível medir a taxa de conversão da jornada sem conta (que é a principal aposta de negócio desta feature: reduzir fricção de "precisar ter conta") nem comparar abandono por etapa entre as duas jornadas — implementar a taxonomia da seção 7 é pré-requisito para qualquer leitura de funil.

**Plano de rollout**
- Não aplicável a este documento (protótipo de design, PR já aberta para `main`). Rollout futuro relevante: substituição de cada mock por integração real, na ordem sugerida pelas dependências (token do link → MFA → Unico → cálculo de IOF/CET → analytics).

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Qual o contrato real de decodificação do token do link (`?token=`)? Hoje `LEAD_MOCK` é fixo (nome "Ana Souza", CPF "123.456.789-00") independentemente do valor do token. | Devs / Time técnico | — | aberto |
| Qual o endpoint real de envio/validação do código de MFA (`/leilao/mfa`)? Código mock fixo `123456`, sem expiração implementada. | Devs | — | aberto |
| Qual o contrato real do callback da Unico (verificação de identidade + assinatura)? Hoje a tela de sucesso é acessada diretamente por URL, sem nenhum evento real fechando esse loop. | Devs / Unico | — | aberto |
| A jornada "sem conta" deveria, em algum momento, solicitar a data de nascimento do usuário que criou conta (LG-08 já sinaliza isso como pendência, via um card futuro de "completar cadastro")? Esse card não existe ainda. | Design/PO | — | aberto |
| O card de contrato ativo (LC-08) deveria ter algum limite de tempo além de "sumir no primeiro clique" (ex.: expirar depois de N dias sem clique, como o card `mostrarContratoNovo` de outro produto)? | Design/PO | — | aberto |
| Falta uma tela dedicada de "proposta reprovada/negada" para o Leilão CLT (diferente das 4 telas de exceção pós-aprovação já existentes) — confirmado com Ellen em sessão anterior que as 4 telas atuais (expirada/cancelada/falha averbação/falha desembolso) já cobrem o que era esperado, já que esta jornada só começa depois de uma oferta **já aprovada**. Registrado aqui para não ser reaberto sem contexto. | Design/PO | — | resolvido — não se aplica |
