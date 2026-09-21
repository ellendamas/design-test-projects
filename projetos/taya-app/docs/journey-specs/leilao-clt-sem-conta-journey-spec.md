---
agent: ellen-damasceno
project: podeja-leilao-clt
journey: leilao-clt-sem-conta
platform: Web (PWA Mobile-first)
date: 2026-09-21
depends_on: [ctps-digital, unico, celcoin, taya-ai-engine]
status: draft
---

# Journey Spec - Leilão CLT (sem conta)

> **Nota sobre este documento:** mapeia a jornada de Crédito Consignado CLT via leilão, para usuários **sem conta** no Pode Já (guest, via link), exatamente como ela existe hoje no código (`src/pages/leilao-clt/*`, rotas em `src/App.tsx`, componentes compartilhados `PublicLayout`/`ContaSelector`/`EnderecoSelector`/`ErrorScreen`/`UnicoNotice`/`UnicoAguardando`). Toda regra abaixo foi extraída lendo o código-fonte — nenhum comportamento foi inferido ou inventado.
>
> Este documento era um único arquivo cobrindo as duas jornadas (com e sem conta); foi separado em dois, espelhando a divisão já feita nos Design Briefs (`docs/design-briefs/leilao-clt-com-conta-design-brief.md` / `leilao-clt-sem-conta-design-brief.md`). A jornada com conta está em `leilao-clt-com-conta-journey-spec.md`.

## 1) Resumo executivo da jornada

- **Problema que a jornada resolve:** o usuário **nunca usou o app**, teve seu CPF consultado via CTPS Digital e "ganhou" um leilão entre instituições parceiras — recebe um link (SMS/e-mail) com uma oferta de Crédito Consignado CLT **já aprovada** e precisa completar tudo (dados, verificação, assinatura) sem nenhuma tela de login/cadastro tradicional no meio do caminho, decidindo só ao final se quer ou não criar uma conta.
- **Resultado esperado para o usuário:** aceitar a oferta, informar e-mail/celular, confirmar CPF/nome (já preenchidos), endereço e forma de recebimento, verificar celular e identidade, assinar e ver a confirmação — **sem nunca ser obrigado a criar uma conta** para receber o dinheiro.
- **Impacto esperado para o negócio:** aumenta a conversão de ofertas de leilão ao remover a barreira de "preciso ter conta no app" (reduz TTV — time to value); a criação de conta pós-sucesso vira uma oportunidade de retenção (mini-onboarding de 2 passos, sem repetir dados já coletados) em vez de um obstáculo pré-requisito.

## 2) Escopo e contexto

- **Tipo:** nova jornada (feature nova, ponta a ponta).
- **Origem:** demanda "Leilão CLT" — protótipo de design para handoff, sem API real conectada ainda.
- **Telas/componentes que esta jornada *possui* (criados especificamente para ela):** `OfertaPublicaPage.tsx`, `DadosPage.tsx`, `ConfirmarDadosPage.tsx`, `MfaPage.tsx`, `AssinaturaPublicaPage.tsx`, `RedirecionandoUnicoPublicaPage.tsx`, `SucessoPublicaPage.tsx`, `CriarContaPage.tsx`, `ContratoPublicaPage.tsx`, `ExpiradaPublicaPage.tsx`, `CanceladaPublicaPage.tsx`, `FalhaAverbacaoPublicaPage.tsx`, `FalhaDesembolsoPublicaPage.tsx` (em `src/pages/leilao-clt/*`), mais `leilaoData.ts` e `PixSelector.tsx` (compartilhados com a jornada com conta, mas construídos exclusivamente para esta feature).
- **Telas/componentes que esta jornada *integra*, mas não possui:**
  - `PublicLayout` (`src/components/PublicLayout.tsx`) — layout guest sem sidebar/menu, header centralizado só com logo, usado em toda a jornada.
  - `ContaSelector` / `EnderecoSelector` (`src/components/*`) — reaproveitados de outros produtos, usados aqui **sem** os props `ocultarCabecalho`/`autoConfirmarSelecao` (esses props existem, mas quem os usa é a jornada com conta — ver `leilao-clt-com-conta-journey-spec.md`).
  - `ErrorScreen` (`src/components/ErrorScreen.tsx`) — 4 categorias de erro novas foram adicionadas ao `Record` compartilhado: `leilao_expirada`, `leilao_cancelada`, `leilao_falha_averbacao`, `leilao_falha_desembolso`.
  - `UnicoNotice` / `UnicoAguardando` (`src/components/*`) — reaproveitados sem alteração do padrão já usado em Consignado CLT.
  - `ContratoCLTPage` (rota `/contratos/clt-001`) — usada como base estrutural (trimmed) da tela de contrato pública (LG-09).
- **Fora de escopo:**
  - Autenticação real via token do link (hoje é decorativo, `?token=mock`) — dados do lead vêm de um mock fixo (`LEAD_MOCK`).
  - Integração real com Unico (callback de verificação/assinatura) — hoje é um `setTimeout` que abre uma URL fixa em nova aba e navega para um estado "aguardando".
  - Cálculo real de IOF/CET/taxas — hoje é uma aproximação local (mesma fórmula do Consignado CLT).
  - Confirmação formal de que "Celcoin" é de fato o nome correto exibido na CTPS (ver Open Questions).
  - Qualquer trabalho de analytics/instrumentação — a taxonomia da seção 7 é proposta nova, não há nenhum evento disparado hoje.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| LG-00 | Receber o link da oferta | Link externo (SMS/e-mail, fora do app) | LG-01 (`/leilao/oferta?token=mock`) | Abre a oferta sem precisar logar |
| LG-01 | Aceitar a oferta | Marca o consentimento e clica "Aceitar oferta" (ou "Já tenho conta" para logar e cair na jornada com conta) | LG-02 | Avança para dados básicos |
| LG-02 | Informar e-mail e celular | Preenche e-mail/celular válidos, clica "Continuar" | LG-03 | Avança para confirmação de dados |
| LG-03 | Confirmar CPF/nome (bloqueados) e informar endereço + forma de recebimento | Preenche tudo via modais/drawers na mesma tela, clica "Continuar" | LG-04 | Avança para verificação por SMS |
| LG-04 | Verificar celular (MFA) | Digita o código recebido por SMS (mock: `123456`) | LG-06 (estado aviso) | Segue para a verificação de identidade |
| LG-05 | (transição) Ser levado à Unico | Igual a LC-05, rota apartada | Nova aba: Unico (mock) + retorno a LG-06 (estado aguardando) | — |
| LG-06 | Iniciar/retomar verificação de identidade | Igual a LC-04/LC-04b, rota apartada | LG-05 ou cancelamento | — |
| LG-07 | Ver confirmação de sucesso | Chegada direta por URL nesta fase de protótipo | LG-07 | Vê que o empréstimo foi aprovado, a previsão de crédito e o resumo; escolhe criar conta ou continuar sem conta |
| LG-08 | Criar conta para acompanhar | Clica "Criar conta para acompanhar" em LG-07 | LG-08 (2 passos: PIN → necessidades) | Ao concluir, vai **direto para o dashboard já logado**, sem repetir nome/e-mail/celular/CPF (já coletados antes) |
| LG-09 | Continuar sem criar conta | Clica "Continuar sem conta" em LG-07 | LG-09 (`/leilao/contrato`) | Vê o contrato simplificado e pode baixá-lo, sem nunca ter criado conta |
| LG-10 | (terminal) Ver erro/exceção | Oferta expira, é cancelada, ou falha averbação/desembolso | Tela de exceção correspondente (rota apartada) | Entende o motivo; CTA "Fechar"/"Falar com suporte" (não há "voltar ao início" logado, pois não há sessão) |

## 4) Inventário de telas

| screen_id | nome | rota | plataforma | status | owner |
|---|---|---|---|---|---|
| LG-01 | Oferta aprovada | `/leilao/oferta` (+ `?token=`) | Web (PWA Mobile-first) | changed | Design/PO Leilão CLT |
| LG-02 | Dados básicos (e-mail/celular) | `/leilao/dados` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-03 | Confirmar dados (CPF/nome/endereço/forma) | `/leilao/confirmar-dados` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-04 | Verificação por SMS (MFA) | `/leilao/mfa` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-05 | Redirecionando para Unico | `/leilao/oferta/redirecionando/unico` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-06 | Verificação de identidade | `/leilao/oferta/assinatura` (+ `?status=aguardando`, `?erro=`) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-07 | Sucesso | `/leilao/oferta/sucesso` | Web (PWA Mobile-first) | changed | Design/PO Leilão CLT |
| LG-08 | Criar conta (pós-sucesso) | `/leilao/criar-conta` (2 passos) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-09 | Contrato simplificado | `/leilao/contrato` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LG-10 | Telas de exceção (4 variantes) | `/leilao/oferta/expirada`, `/oferta/cancelada`, `/oferta/falha-averbacao`, `/oferta/falha-desembolso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |

**Observação de proteção de rota:** todas as rotas `LG-*` são públicas (sem checagem de auth), exceto `/leilao/criar-conta`, que é o inverso: `!getStoredUser() ? <LeilaoCriarContaPage/> : <Navigate to="/painel"/>` — um usuário já logado não consegue acessar essa tela. Esta jornada é um conjunto de **arquivos e rotas totalmente separado** da jornada com conta, sem nenhuma checagem de `getStoredUser()`/`localStorage` dentro de um componente compartilhado — decisão deliberada para não repetir um bug anterior em que uma tela de redirecionamento (Unico) decidia o destino com base em auth state e acabava levando usuários guest para a jornada logada por causa de `localStorage` de um teste anterior.

## 5) Spec por tela

### Tela: LG-01 — Oferta aprovada

**Objetivo da tela**
- Apresentar a oferta já aprovada (valor, parcelas, taxa, IOF) e coletar o consentimento antes de avançar, sem exigir login.

**Componentes principais**
- Ícone de sucesso animado (`CheckCircle`, spring)
- Bloco de parceria Pode Já × Celcoin (logo `/images/logo-celcoin.svg`, rótulo "Parceiro oficial", texto explicativo)
- Card "Sua oferta" com badge do parceiro (`Celcoin`)
- Card "Detalhes do consignado" (fundo laranja claro), agora em **accordion colapsável**
- Checkbox de consentimento (custom)
- CTA primária "Aceitar oferta" + CTA secundária "Já tenho conta" (`variant="outline"`) + rodapé de Termos de Uso/Política de Privacidade (abre `TermosModal`)

**Estados obrigatórios**
- default (consentimento desmarcado, CTA desabilitada; accordion "Detalhes do consignado" fechado)
- consentimento marcado (CTA habilitada)
- accordion aberto / fechado (independente do estado do consentimento)

**Regras de negócio**
- Valores vêm de `OFERTA_LEILAO` (mock): R$ 32.533,83 em 48x de R$ 891,20, taxa 2,49% a.m.
- IOF, taxa anual, CET e total a pagar são **calculados no cliente** — `// TODO: receber IOF/CET/total real da API`.
- CTAs **não são fixas** no rodapé — ficam no fluxo do conteúdo, decisão deliberada porque a tela tem bastante texto para ler e um rodapé fixo cobriria conteúdo durante o scroll.
- Propaga `searchParams` (ex.: `?token=mock`) para a próxima rota (`/leilao/dados`).
- **Bloco de parceria Celcoin** *(adicionado nesta rodada)*: explica que o leilão acontece dentro da Carteira de Trabalho Digital sob o nome "Celcoin"; ao abrir o link, o usuário passa a ver a identidade da Pode Já. Logo com fallback (`onError` esconde a imagem se o arquivo não carregar).
- **Accordion "Detalhes do consignado"** *(era um card sempre visível; convertido nesta rodada)*: mesmos 5 rótulos de antes, agora escondidos por padrão atrás de um botão-trigger com `CaretDown` que gira 180° ao abrir — mesmo padrão de `consignado-clt/SimuladorPage.tsx`. Copy inalterado.
- **Removida** *(nesta rodada)* a frase de descrição "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo." — não fazia sentido com o que realmente acontece no leilão.
- **Removido** *(nesta rodada)* o card "Previsão de crédito na conta" desta tela — mudou de lugar para LG-07 (Sucesso).
- Provedor mock trocado de `"Bull"` para `"Celcoin"`, coerente com o bloco de parceria.

**Microcopy crítica**
- Título: "Oferta aprovada" *(já era este texto; agora também é o título usado na jornada com conta, que antes dizia "Proposta aprovada!")*
- Bloco de parceria: rótulo "Parceiro oficial" / texto "A Celcoin é parceira oficial do leilão de crédito consignado dentro da Carteira de Trabalho Digital. Quem cuida da sua contratação a partir de agora é a Pode Já, plataforma digital que conecta você a diversas soluções financeiras."
- Accordion: rótulo do trigger "Detalhes do consignado" (conteúdo interno sem alteração de copy)
- Texto do consentimento: "Ao continuar, concordo com os termos do contrato de consentimento realizado e autorizo o desconto das parcelas em folha de pagamento."
- CTA primária: "Aceitar oferta" / CTA secundária: "Já tenho conta"

**Acessibilidade mínima**
- Contraste AA nos textos sobre fundo laranja claro (`#FFF3EE`/`#D94E28`)
- Alvo de toque mínimo 44px nos CTAs
- Estado do accordion comunicado visualmente pela rotação do ícone — **falta** `aria-expanded` no botão-trigger (ver Open Questions)

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
- CPF e nome vêm de `LEAD_MOCK` e **não são editáveis**.
- **Diferente da jornada com conta: aqui tudo (endereço e forma de recebimento, incluindo a lista/seleção) acontece em modal/drawer** — decisão deliberada para reforçar a sensação de "uma tela só" no fluxo guest (testado e revertido de volta a este padrão depois de uma iteração que colocava o `ContaSelector` direto na tela).
- Endereço e conta limitados a 1 item cada (`maxItens={1}`) nesta tela — diferente da jornada com conta, que permite múltiplos.
- Escolher Conta bancária ou Chave Pix limpa o outro.
- CTA "Continuar" exige e-mail + celular + endereço + (conta OU chave Pix) preenchidos.
- Navega para LG-04 levando `email`, `celular`, `endereco`, `conta`, `chavePix` no state.

**Microcopy crítica**
- "Confirme seus dados" / "Revise as informações abaixo para gerar seu contrato."
- Rótulos: "CPF", "Nome completo", "E-mail", "Celular", "Endereço de recebimento", "Forma de recebimento"
- Botões: "Alterar" (campos preenchidos/bloqueados) / "Adicionar" (campos vazios)

**Acessibilidade mínima**
- Cadeado (`LockSimple`) com significado comunicado por texto, não só ícone

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
- Celular mascarado: `+55 (XX) •••••-XXXX`.
- Código de validação mockado: `CODIGO_VALIDO = "123456"` — `// TODO: integrar com endpoint real de MFA`.
- "Reenviar código": reseta contador para 30s, limpa o campo e o erro.
- Sucesso: `localStorage.setItem("podeja_telefone_validado", "true")` + navega para LG-06.

**Microcopy crítica**
- "Confirme seu celular" / "Enviamos um código por SMS para {celular mascarado}."
- Erros: "Digite o código de 6 dígitos." / "Código inválido. Verifique e tente novamente."
- "Reenviar em Xs" → link "Reenviar código"
- CTA: "Verificar e continuar"

**Acessibilidade mínima**
- Foco automático no primeiro slot do OTP

---

### Tela: LG-05 — Redirecionando para Unico

**Objetivo da tela**
- Transição visual enquanto o usuário é (supostamente) levado à Unico para verificação de identidade/assinatura.

**Componentes principais**
- Tela cheia, sem `PublicLayout` (gradiente laranja `#FD5F31` → `#FA9832`)
- Ícone `ArrowSquareOut` com animação de pulso
- Botão manual "Abrir verificação na Unico" (aparece só depois de 10s)

**Estados obrigatórios**
- transição automática (0–3s): sem botão visível
- botão manual disponível (a partir de 10s)

**Regras de negócio**
- Após 3s: `window.open("https://unico.io/verificacao", "_blank")` + `navigate("/leilao/oferta/assinatura?status=aguardando", { replace: true, state })` — **hardcoded, sem depender de `getStoredUser()`**, pra nunca depender de `localStorage` de teste.
- Após 10s: mostra o botão manual.

**Microcopy crítica**
- "Abrindo a Unico..." / "Você será direcionado para verificar sua identidade na plataforma da Unico." / "Abrir verificação na Unico"

**Acessibilidade mínima**
- Anúncio para leitor de tela do redirecionamento automático (hoje não implementado — ver Open Questions)

---

### Tela: LG-06 — Verificação de identidade

**Objetivo da tela**
- Avisar sobre o redirecionamento para a Unico, permitir retomar uma verificação abandonada, cancelar a proposta, ou exibir um erro do processo de assinatura.

**Componentes principais**
- Estado `aviso`: `UnicoNotice`
- Estado `aguardando`: `UnicoAguardando`
- Estado `erro`: `ErrorScreen`

**Estados obrigatórios**
- `aviso` (default) / `aguardando` (`?status=aguardando`) / `erro` (`?erro=<categoria>`) / confirmação de cancelamento

**Regras de negócio**
- `erroParam` tem prioridade sobre `status`.
- "Continuar para verificação" e "Reabrir verificação" navegam para LG-05.
- "Cancelar proposta" navega para a oferta cancelada (LG-10, variante `leilao_cancelada`).
- CTA "Voltar à oferta" (no erro) leva para `/leilao/oferta` (sem sessão).

**Microcopy crítica**
- Aviso — título: "Falta só confirmar sua identidade!" / descrição: "Sua oferta de Crédito Consignado CLT foi aprovada. Você será direcionado para verificar sua identidade na plataforma segura da Unico."
- Aguardando — mesma copy da jornada com conta
- Erro — headline/subtítulo por categoria (ver tabela completa na seção 6)

**Acessibilidade mínima**
- Foco preso no modal de confirmação de cancelamento

---

### Tela: LG-07 — Sucesso

**Objetivo da tela**
- Confirmar que o empréstimo foi aprovado e o dinheiro está a caminho, com resumo dos valores, e oferecer a escolha entre criar conta ou continuar sem conta.

**Componentes principais**
- Ícone `CheckCircle` verde animado
- **Card "Previsão de crédito na conta"** *(adicionado nesta rodada — veio da tela de oferta, LG-01)*: ícone `CalendarBlank`, logo abaixo da descrição
- Card resumo: Parceiro (`Celcoin`) / Valor a receber / Parcela mensal / Primeira parcela / Banco
- Bloco "Acompanhe seu contrato" (texto, sem CTA própria) explicando o benefício de criar conta
- CTA "Criar conta para acompanhar" (`/leilao/criar-conta`) + CTA secundária "Continuar sem conta" (`/leilao/contrato`) — ambas fixas no rodapé (`footerTransparente`)

**Estados obrigatórios**
- default (única — tela de confirmação, sem erro/loading)

**Regras de negócio**
- Nome do banco vem de `location.state.conta` — mostra `—` se a forma de recebimento foi Pix.
- Saudação usa `LEAD_MOCK.nome` (sempre "Ana Souza" — mock fixo).
- **Box "Previsão de crédito na conta" movido pra cá nesta rodada** (antes ficava na tela de oferta, LG-01).
- Alcançada **diretamente por URL** nesta fase de protótipo — não há navegação automática de LG-05/LG-06 até aqui.

**Microcopy crítica**
- Título: "Dinheiro a caminho, {nome}!"
- Descrição: **"Seu empréstimo foi aprovado."** *(encurtada nesta rodada — antes incluía "O valor cai na sua conta entre hoje e em até 3 dias úteis.", removido porque o box novo já transmite essa informação)*
- Box: "Previsão de crédito na conta" / "Entre hoje e em até 3 dias úteis"
- CTAs: "Criar conta para acompanhar" / "Continuar sem conta"

**Acessibilidade mínima**
- Ordem de leitura: confirmação → previsão de crédito → resumo → ações

---

### Tela: LG-08 — Criar conta (pós-sucesso)

**Objetivo da tela**
- Deixar o usuário que já completou toda a jornada guest criar uma conta para acompanhar o contrato, **sem repetir nenhum dado já coletado** — só senha e uma pergunta de personalização.

**Componentes principais**
- Passo 1: `StepHeader` (1 de 2) + campo de senha numérica de 6 dígitos + lista de regras de senha
- Passo 2: `StepHeader` (2 de 2) + grid de opções "O que é importante pra você nesse momento?" (`NECESSIDADES`, multi-seleção)
- Layout: `PublicLayout` (sem sidebar/menu — a tela usava `SubPageLayout` antes, corrigido nesta feature, já que não fazia sentido pra quem ainda não tem conta)

**Estados obrigatórios**
- Passo 1: CTA "Continuar" desabilitada até PIN válido (6 dígitos, não sequência fraca)
- Passo 1: aviso inline se o PIN for uma sequência fraca
- Passo 2: CTA "Concluir" desabilitada até pelo menos 1 necessidade marcada

**Regras de negócio**
- `isWeakNumericPin` bloqueia sequências óbvias.
- Ao concluir (`finalizar`): grava `podeja_user`, `podeja_necessidades`, e **`podeja_leilao_contrato_ativo = "true"`** — esta flag é o que faz o card LC-08 aparecer no dashboard (ver `leilao-clt-com-conta-journey-spec.md`). Depois navega direto para `/painel`, sem pedir data de nascimento (pendente para depois).

**Microcopy crítica**
- Passo 1: "Crie sua senha de acesso" / "Vai ser usada para entrar no app."
- Passo 2: "Quase lá" / "O que é importante pra você nesse momento?"
- CTAs: "Continuar" (passo 1) / "Concluir" (passo 2)

**Acessibilidade mínima**
- Máscara de senha (`type="password"`) com `inputMode="numeric"`

---

### Tela: LG-09 — Contrato simplificado

**Objetivo da tela**
- Dar acesso ao contrato para quem optou por **não** criar conta, com uma versão mais simples da tela de contrato já existente no app.

**Componentes principais**
- Aviso amarelo "contrato de exemplo para fins de demonstração"
- Seções: status/produto, Parceiro/Data de emissão/Modalidade/Valor líquido, "Parcelas" (fundo laranja), "Taxas e custos"
- CTA fixa no rodapé (`footerTransparente`): "Baixar contrato"

**Estados obrigatórios**
- default (única)

**Regras de negócio**
- Reaproveita o registro `clt-001` de `src/data/contratos.ts` — **sem** os blocos sensíveis de emitente/depósito nem o bloco de quitação antecipada.
- Botão "Baixar contrato" ainda não tem ação real (`// TODO: conectar ao GET /propostas/{id}/ccb`).

**Microcopy crítica**
- "Ativo" / nome do produto / "Baixar contrato"

**Acessibilidade mínima**
- Aviso de demonstração legível (contraste AA sobre fundo âmbar claro)

---

### Tela: LG-10 — Telas de exceção (4 variantes)

**Objetivo da tela**
- Comunicar claramente por que a oferta não pode seguir e dar um próximo passo acionável.

**Componentes principais**
- `ErrorScreen` dentro de `PublicLayout`, sem nenhum outro conteúdo na tela

**Regras de negócio / microcopy por variante**

| categoria | rota | headline | subtítulo | CTA |
|---|---|---|---|---|
| `leilao_expirada` | `/leilao/oferta/expirada` | "Sua sessão expirou" | "O prazo para aceitar esta oferta encerrou. Acesse o aplicativo CTPS Digital para solicitar uma nova consulta." | "Fechar" → `/` |
| `leilao_cancelada` | `/leilao/oferta/cancelada` | "Sua oferta foi cancelada" | "A instituição financeira cancelou esta oferta. Você pode acessar o aplicativo CTPS Digital para participar de uma nova consulta." | "Fechar" → `/` |
| `leilao_falha_averbacao` | `/leilao/oferta/falha-averbacao` | "Não foi possível finalizar o registro" | "Ocorreu um problema ao registrar sua proposta na folha de pagamento. Entre em contato com nosso suporte." | "Falar com suporte" → abre chat |
| `leilao_falha_desembolso` | `/leilao/oferta/falha-desembolso` | "Tivemos um problema na liberação do valor" | "O contrato foi assinado, mas houve uma falha ao depositar o valor. Nossa equipe já foi notificada. Entre em contato com o suporte." | "Falar com suporte" → abre chat |

- CTA sempre para `/` (sem sessão para onde "voltar", diferente da jornada com conta que volta pro `/painel`).

**Acessibilidade mínima**
- Headline como texto, não só ícone/cor

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| LG-03 | new | Todo o fluxo de endereço/forma de recebimento acontece em modal/drawer (diferente da jornada com conta) | Decisão de manter a sensação de "uma tela só" mais forte na jornada guest | Jornada guest permanece com fricção mínima percebida |
| LG-05 (redirecionamento Unico) | new | Destino da tela de retorno é **hardcoded por rota**, sem checar `getStoredUser()` | Evita cross-contamination com a jornada com conta | Elimina bug de roteamento cruzado |
| LG-08 (criar conta) | new | Layout trocado de `SubPageLayout` para `PublicLayout` | `SubPageLayout` sempre renderiza a sidebar/menu de usuário logado, o que não fazia sentido pra quem ainda está criando a conta | Remove elemento de UI que não deveria existir nesse ponto |
| LG-01 | changed | Adicionado o bloco de parceria Pode Já × Celcoin | O leilão aparece com o nome "Celcoin" dentro da CTPS; sem essa explicação o usuário estranha a troca de identidade ao abrir o link | Reduz desconfiança/estranhamento no início da jornada |
| LG-01 | changed | Removida a frase "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo." | Não fazia sentido com o que realmente acontece no leilão (feedback direto do PO) | Remove informação incorreta/confusa |
| LG-01 | changed | Card "Detalhes do consignado" virou accordion colapsável (copy inalterado) | Tela tinha informação demais visível de uma vez | Reduz densidade de informação percebida |
| LG-01 → LG-07 | changed | Card "Previsão de crédito na conta" mudou da tela de oferta para a tela de sucesso | Faz mais sentido no momento em que o usuário já sabe que vai receber o dinheiro | Reduz informação na tela de oferta; reforça a confirmação na tela de sucesso |
| LG-01/LG-07 | changed | Provedor mock trocado de "Bull" para "Celcoin" | "Bull" era um resquício copiado do Consignado CLT; ficava contraditório ao lado do bloco de parceria novo | Consistência entre o badge do parceiro e o texto explicativo |

## 7) Taxonomia de eventos Amplitude

> Convenção `snake_case`, padrão `<dominio>_<acao>_<estado>`. Os eventos abaixo são **compartilhados com a jornada com conta** (mesmo `event_name`, diferenciados pela propriedade `flow_name`) sempre que a ação é conceitualmente igual. A lista completa dos dois lados está espelhada em `leilao-clt-com-conta-journey-spec.md`; aqui estão todos os eventos do flow `leilao_clt_sem_conta`, incluindo os exclusivos desta jornada (login redirecionado, dados básicos, MFA, criar conta).
>
> **Hoje não existe nenhuma instrumentação real** nesta jornada. Todos os eventos com `qa_status: pending`.

| event_name | trigger | screen_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|
| `leilao_oferta_viewed` | Entrada em LG-01 | oferta | oferta | (padrão) + `flow_name=leilao_clt_sem_conta` | `token_presente` (bool) | Analytics | pending |
| `leilao_oferta_termo_alternado` | Toggle do checkbox de consentimento | oferta | oferta | (padrão) + `aceito` (bool) | — | Analytics | pending |
| `leilao_oferta_aceita` | CTA "Aceitar oferta" | oferta | oferta | (padrão) | — | Analytics | pending |
| `leilao_login_redirecionado` | "Já tenho conta" (LG-01) | oferta | oferta | (padrão) | — | Analytics | pending |
| `leilao_dados_basicos_confirmados` | "Continuar" em LG-02 | dados_basicos | dados_basicos | (padrão) | — | Analytics | pending |
| `leilao_endereco_confirmado` | Endereço salvo (dentro de LG-03) | confirmar_dados | endereco | (padrão) | — | Analytics | pending |
| `leilao_forma_metodo_selecionado` | Clique em Conta bancária ou Chave Pix (LG-03) | confirmar_dados | forma_recebimento | (padrão) + `metodo` (`conta`\|`pix`) | — | Analytics | pending |
| `leilao_conta_bancaria_adicionada` | Nova conta salva | confirmar_dados | forma_recebimento | (padrão) | — | Analytics | pending |
| `leilao_chave_pix_adicionada` | Nova chave salva | confirmar_dados | forma_recebimento | (padrão) | — | Analytics | pending |
| `leilao_forma_recebimento_confirmada` | Forma preenchida dentro de LG-03 | confirmar_dados | forma_recebimento | (padrão) + `metodo` | — | Analytics | pending |
| `leilao_confirmar_dados_editado` | Edição de e-mail/celular via modal (LG-03) | confirmar_dados | confirmar_dados | (padrão) + `campo` (`email`\|`celular`) | — | Analytics | pending |
| `leilao_confirmar_dados_confirmado` | "Continuar" em LG-03 | confirmar_dados | confirmar_dados | (padrão) | — | Analytics | pending |
| `leilao_mfa_codigo_enviado` | Entrada em LG-04 ou "Reenviar código" | mfa | mfa | (padrão) | — | Analytics | pending |
| `leilao_mfa_codigo_submetido` | "Verificar e continuar" clicado | mfa | mfa | (padrão) | — | Analytics | pending |
| `leilao_mfa_falhou` | Código incompleto ou inválido | mfa | mfa | (padrão) + `erro_tipo` (`incompleto`\|`invalido`) | — | Analytics | pending |
| `leilao_mfa_verificado` | Código correto | mfa | mfa | (padrão) | — | Analytics | pending |
| `leilao_verificacao_iniciada` | "Continuar para verificação" (LG-06, estado aviso) | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_reaberta` | "Reabrir verificação" (LG-06, estado aguardando) | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_cancelada` | "Sim, cancelar" confirmado no modal | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_erro_exibido` | `?erro=` presente em LG-06 | assinatura | verificacao | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_unico_redirecionamento_aberto` | Abertura da aba da Unico (LG-05) | redirecionando_unico | redirecionamento | (padrão) + `modo` (`automatico`\|`manual`) | — | Analytics | pending |
| `leilao_sucesso_viewed` | Entrada em LG-07 | sucesso | sucesso | (padrão) | — | Analytics | pending |
| `leilao_contrato_acessado` | "Continuar sem conta" (LG-07) | sucesso | sucesso | (padrão) + `origem=sucesso` | — | Analytics | pending |
| `leilao_criar_conta_iniciado` | "Criar conta para acompanhar" (LG-07) | sucesso | sucesso | (padrão) | — | Analytics | pending |
| `leilao_criar_conta_pin_definido` | "Continuar" no passo 1 de LG-08 | criar_conta | pin | (padrão) | — | Analytics | pending |
| `leilao_criar_conta_concluida` | "Concluir" no passo 2 de LG-08 | criar_conta | necessidades | (padrão) + `necessidades` (array) | — | Analytics | pending |
| `leilao_erro_terminal_viewed` | Entrada em qualquer variante de LG-10 | expirada \| cancelada \| falha_averbacao \| falha_desembolso | erro_terminal | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_erro_terminal_cta_clicado` | Clique no CTA da tela terminal (LG-10) | expirada \| cancelada \| falha_averbacao \| falha_desembolso | erro_terminal | (padrão) + `erro_categoria`, `destino` (`home`\|`chat_suporte`) | — | Analytics | pending |

### Exemplo de payload
```json
{
  "event_name": "leilao_criar_conta_concluida",
  "user_id": "anon-123",
  "session_id": "abc",
  "timestamp": "2026-09-21T10:00:00Z",
  "platform": "Web",
  "flow_name": "leilao_clt_sem_conta",
  "step_name": "necessidades",
  "screen_name": "criar_conta",
  "necessidades": ["organizar_financas", "conseguir_credito"]
}
```

## 8) Critérios de QA de tracking
- Cobertura de eventos críticos >= 90% (happy path completo, do `leilao_oferta_viewed` ao `leilao_sucesso_viewed`, instrumentado antes de considerar "pronto")
- Conformidade de taxonomia >= 95%
- Completude de propriedades >= 95%
- PII indevida = 0 — nunca enviar e-mail/celular/CPF/endereço/dados bancários (nem mascarados) como propriedade de evento
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

**Impacto em escopo**
- Feature nova ponta a ponta. Mudanças desta rodada (bloco Celcoin, accordion, reorganização de informação entre oferta/sucesso) são só de UI/copy, sem alterar nenhuma regra de negócio ou navegação.

**Riscos e dependências**
- **Toda a jornada roda sobre mocks** — sem token real do link, sem endpoint de MFA, sem callback real da Unico, sem cálculo real de IOF/CET. A tela de sucesso (LG-07) é acessada hoje diretamente por URL.
- **Nenhuma instrumentação de analytics ativa** — a taxonomia da seção 7 é pré-requisito para medir conversão/abandono em qualquer etapa (é a principal aposta de negócio desta feature: reduzir fricção de "precisar ter conta").
- **Depende do `taya-ai-engine`** para o CTA "Falar com suporte" das telas de falha funcionar de ponta a ponta.
- **Depende de confirmação do nome/identidade visual real da Celcoin** dentro da CTPS Digital — hoje o texto do bloco de parceria assume que "Celcoin" é o nome exibido lá, mas isso não foi validado com o time técnico/CTPS (ver Open Questions).

**Impacto esperado em métricas**
- Sem instrumentação, hoje é impossível medir a taxa de conversão desta jornada (a principal aposta de negócio da feature) nem comparar abandono por etapa com a jornada com conta — implementar a taxonomia da seção 7 é pré-requisito para qualquer leitura de funil.

**Plano de rollout**
- Não aplicável a este documento (protótipo de design). Rollout futuro relevante: substituição de cada mock por integração real, na ordem sugerida pelas dependências (token do link → MFA → Unico → cálculo de IOF/CET → analytics).

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| "Celcoin" é de fato o nome/identidade exibido para o usuário dentro da Carteira de Trabalho Digital? O bloco de parceria assume isso, mas não foi validado formalmente com o time técnico/CTPS. | PO / Time técnico | — | aberto |
| Qual o contrato real de decodificação do token do link (`?token=`)? Hoje `LEAD_MOCK` é fixo (nome "Ana Souza", CPF "123.456.789-00") independentemente do valor do token. | Devs / Time técnico | — | aberto |
| Qual o endpoint real de envio/validação do código de MFA (`/leilao/mfa`)? Código mock fixo `123456`, sem expiração implementada. | Devs | — | aberto |
| Qual o contrato real do callback da Unico (verificação de identidade + assinatura)? Hoje a tela de sucesso é acessada diretamente por URL, sem nenhum evento real fechando esse loop. | Devs / Unico | — | aberto |
| A jornada deveria, em algum momento após a criação de conta, solicitar a data de nascimento do usuário (LG-08 já sinaliza isso como pendência, via um card futuro de "completar cadastro")? Esse card não existe ainda. | Design/PO | — | aberto |
| O botão-trigger do accordion "Detalhes do consignado" (LG-01) não tem `aria-expanded` — adicionar antes de considerar a tela pronta para acessibilidade? | Devs / Accessibility | — | aberto |
| Falta uma tela dedicada de "proposta reprovada/negada" para o Leilão CLT? Confirmado com Ellen em sessão anterior que as 4 telas de exceção pós-aprovação (LG-10) já cobrem o que era esperado, já que esta jornada só começa depois de uma oferta **já aprovada**. Registrado aqui para não ser reaberto sem contexto. | Design/PO | — | resolvido — não se aplica |
