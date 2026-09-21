---
agent: ellen-damasceno
project: podeja-leilao-clt
journey: leilao-clt-com-conta
platform: Web (PWA Mobile-first)
date: 2026-09-21
depends_on: [ctps-digital, unico, celcoin, taya-ai-engine]
status: draft
---

# Journey Spec - Leilão CLT (com conta)

> **Nota sobre este documento:** mapeia a jornada de Crédito Consignado CLT via leilão, para usuários que **já têm conta** no Pode Já, exatamente como ela existe hoje no código (`src/pages/leilao-clt/*`, rotas em `src/App.tsx`, componentes compartilhados `ContaSelector`/`EnderecoSelector`/`ErrorScreen`/`UnicoNotice`/`UnicoAguardando`). Toda regra abaixo foi extraída lendo o código-fonte — nenhum comportamento foi inferido ou inventado.
>
> Este documento era um único arquivo cobrindo as duas jornadas (com e sem conta); foi separado em dois, espelhando a divisão já feita nos Design Briefs (`docs/design-briefs/leilao-clt-com-conta-design-brief.md` / `leilao-clt-sem-conta-design-brief.md`). A jornada sem conta está em `leilao-clt-sem-conta-journey-spec.md`.

## 1) Resumo executivo da jornada

- **Problema que a jornada resolve:** o usuário já tem conta no Pode Já, já teve seu CPF consultado via CTPS Digital e "ganhou" um leilão entre instituições parceiras — chega com uma oferta de Crédito Consignado CLT **já aprovada** dentro do próprio app, precisando apenas confirmar dados, verificar identidade e assinar.
- **Resultado esperado para o usuário:** aceitar a oferta, confirmar/informar os dados necessários (endereço, forma de recebimento), verificar a identidade via Unico, assinar e ver a confirmação de que o dinheiro está a caminho — com o mínimo de fricção possível.
- **Impacto esperado para o negócio:** converte uma oferta já pré-aprovada de um usuário que já confia no app, sem repetir nenhum dado que o Pode Já já tem sobre ele.

## 2) Escopo e contexto

- **Tipo:** nova jornada (feature nova, ponta a ponta).
- **Origem:** demanda "Leilão CLT" — protótipo de design para handoff, sem API real conectada ainda.
- **Telas/componentes que esta jornada *possui* (criados especificamente para ela):** `LeilaoOfertaPage.tsx`, `LeilaoDadosPendentesPage.tsx`, `AssinaturaPage.tsx`, `RedirecionandoUnicoPage.tsx`, `SucessoPage.tsx`, `ExpiradaPage.tsx`, `CanceladaPage.tsx`, `FalhaAverbacaoPage.tsx`, `FalhaDesembolsoPage.tsx` (em `src/pages/leilao-clt/*`), mais `leilaoData.ts` e `PixSelector.tsx` (compartilhados com a jornada sem conta, mas construídos exclusivamente para esta feature).
- **Telas/componentes que esta jornada *integra*, mas não possui:**
  - `ContaSelector` / `EnderecoSelector` (`src/components/*`) — reaproveitados de outros produtos. Dois props novos foram adicionados **a esses componentes compartilhados** especificamente para esta jornada: `ocultarCabecalho` e `autoConfirmarSelecao` (ver seção 6) — usados apenas onde a jornada Leilão CLT chama esses componentes; o comportamento default (sem essas props) não muda para os outros produtos.
  - `ErrorScreen` (`src/components/ErrorScreen.tsx`) — 4 categorias de erro novas foram adicionadas ao `Record` compartilhado: `leilao_expirada`, `leilao_cancelada`, `leilao_falha_averbacao`, `leilao_falha_desembolso`.
  - `UnicoNotice` / `UnicoAguardando` (`src/components/*`) — reaproveitados sem alteração do padrão já usado em Consignado CLT.
  - `ContratoCLTPage` (rota `/contratos/clt-001`, em `App.tsx`) — tela de contrato já existente, reaproveitada como destino do card do dashboard.
  - Card "Para você agora" no dashboard (`src/App.tsx`) — novo card `mostrarLeilaoContratoAtivo`, inserido dentro da seção já existente de cards (mas só aparece para quem veio pela jornada **sem conta** e criou conta depois — ver `leilao-clt-sem-conta-journey-spec.md`).
- **Fora de escopo:**
  - Integração real com Unico (callback de verificação/assinatura) — hoje é um `setTimeout` que abre uma URL fixa em nova aba e navega para um estado "aguardando".
  - Cálculo real de IOF/CET/taxas — hoje é uma aproximação local (mesma fórmula do Consignado CLT).
  - Confirmação formal de que "Celcoin" é de fato o nome correto exibido na CTPS (ver Open Questions).
  - Qualquer trabalho de analytics/instrumentação — a taxonomia da seção 7 é proposta nova, não há nenhum evento disparado hoje.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| LC-00 | Ver que tem uma oferta de leilão aprovada | Card "Oferta de Leilão CLT aprovada" no dashboard — só aparece com `/painel?clt=leilao_aprovado` (**DESIGN ONLY**) | LC-01 | Usuário entra na oferta |
| LC-01 | Aceitar a oferta | Marca o consentimento e clica "Aceitar e continuar" | LC-02 | Avança para completar os dados pendentes |
| LC-02 | Informar endereço de recebimento | Preenche/seleciona endereço — confirmação automática, sem botão de salvar | LC-03 | Avança automaticamente para a forma de recebimento |
| LC-03 | Escolher e informar forma de recebimento | Escolhe Conta bancária ou Chave Pix, informa os dados (confirmação automática) e clica "Continuar" | LC-04 (estado aviso) | Segue para a verificação de identidade |
| LC-04 | Iniciar verificação de identidade | Clica "Continuar para verificação" | LC-05 | É redirecionado (nova aba) para a Unico |
| LC-04b | Retomar verificação abandonada | Reabre `/leilao/assinatura` depois de já ter iniciado — vê estado `aguardando` | LC-05 (via "Reabrir verificação") ou LC-07 (via "Cancelar proposta") | Continua de onde parou, ou cancela a proposta |
| LC-05 | (transição) Ser levado à Unico | Chegada automática (3s) ou clique manual (após 10s) em LC-04/LC-04b | Nova aba: Unico (mock) + retorno a LC-04b | — |
| LC-06 | Ver confirmação de sucesso | Chegada direta por URL nesta fase de protótipo (dependeria do callback real da Unico) | LC-06 | Vê que o empréstimo foi aprovado, a previsão de crédito e o resumo (valor, parcela, banco); pode ir para o contrato |
| LC-07 | (terminal) Ver erro/exceção | Oferta expira, é cancelada, ou falha averbação/desembolso | Tela de exceção correspondente | Entende o motivo e tem uma ação (voltar ao início ou falar com suporte) |
| LC-08 | Acompanhar o contrato depois | Card "Você tem um contrato Consignado CLT ativo!" no dashboard (só existe para quem veio da jornada sem conta e criou conta) | `/contratos/clt-001` | Vê o contrato; o card some do dashboard a partir desse clique |

## 4) Inventário de telas

| screen_id | nome | rota | plataforma | status | owner |
|---|---|---|---|---|---|
| LC-01 | Oferta aprovada | `/leilao` | Web (PWA Mobile-first) | changed | Design/PO Leilão CLT |
| LC-02 | Dados pendentes — Endereço | `/leilao/dados-pendentes` (etapa 1) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-03 | Dados pendentes — Forma de recebimento | `/leilao/dados-pendentes` (etapa 2) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-04 | Verificação de identidade | `/leilao/assinatura` (+ `?status=aguardando`, `?erro=`) | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-05 | Redirecionando para Unico | `/leilao/redirecionando/unico` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-06 | Sucesso | `/leilao/sucesso` | Web (PWA Mobile-first) | changed | Design/PO Leilão CLT |
| LC-07 | Telas de exceção (4 variantes) | `/leilao/expirada`, `/leilao/cancelada`, `/leilao/falha-averbacao`, `/leilao/falha-desembolso` | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |
| LC-08 | Card "Contrato ativo" (dashboard) | `/painel` (seção "Para você agora") | Web (PWA Mobile-first) | new | Design/PO Leilão CLT |

**Observação de proteção de rota:** todas as rotas `LC-*` seguem `getStoredUser() ? <Componente/> : <Navigate to="/boas-vindas" />`. Esta jornada é um conjunto de **arquivos e rotas totalmente separado** da jornada sem conta, sem nenhuma checagem de `getStoredUser()`/`localStorage` dentro de um componente compartilhado — decisão deliberada para não repetir um bug anterior em que uma tela de redirecionamento (Unico) decidia o destino com base em auth state e acabava levando usuários guest para a jornada logada por causa de `localStorage` de um teste anterior.

## 5) Spec por tela

### Tela: LC-01 — Oferta aprovada

**Objetivo da tela**
- Apresentar a oferta já aprovada (valor, parcelas, taxa, IOF) e coletar o consentimento antes de avançar.

**Componentes principais**
- Ícone de sucesso animado (`CheckCircle`, spring)
- Bloco de parceria Pode Já × Celcoin (logo `/images/logo-celcoin.svg`, rótulo "Parceiro oficial", texto explicativo)
- Card "Sua oferta" com badge do parceiro (`Celcoin`)
- Card "Detalhes do consignado" (fundo laranja claro), agora em **accordion colapsável**
- Checkbox de consentimento (custom, não é o componente `Checkbox` padrão)
- CTA primária "Aceitar e continuar", fixa no rodapé (`fixed bottom-0`, `md:relative` no desktop)

**Estados obrigatórios**
- default (consentimento desmarcado, CTA desabilitada; accordion "Detalhes do consignado" fechado)
- consentimento marcado (CTA habilitada)
- accordion aberto / fechado (independente do estado do consentimento)

**Regras de negócio**
- Valores vêm de `OFERTA_LEILAO` (mock): R$ 32.533,83 em 48x de R$ 891,20, taxa 2,49% a.m.
- IOF, taxa anual, CET e total a pagar são **calculados no cliente** (`iof = valor * 0.0332`, `cetMensal = taxaMensal + 0.21`) — `// TODO: receber IOF/CET/total real da API`.
- **Bloco de parceria Celcoin** *(adicionado nesta rodada)*: explica que o leilão acontece dentro da Carteira de Trabalho Digital sob o nome "Celcoin" (instituição parceira que participa do leilão); ao abrir o link, o usuário passa a ver a identidade da Pode Já. Existe pra essa troca de nome não gerar estranhamento. Logo com fallback (`onError` esconde a imagem se o arquivo não carregar).
- **Accordion "Detalhes do consignado"** *(era um card sempre visível; convertido nesta rodada)*: mesmos 5 rótulos de antes (Taxa de juros, CET, Parcelas, Primeira parcela, Total a pagar), agora escondidos por padrão atrás de um botão-trigger com `CaretDown` que gira 180° ao abrir — mesmo padrão de interação de `consignado-clt/SimuladorPage.tsx`. O copy dos rótulos/valores não mudou, só a apresentação (reduzir quantidade de informação visível de uma vez na tela).
- **Removida** *(nesta rodada)* a frase de descrição "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo." — não fazia sentido com o que realmente acontece no leilão.
- **Removido** *(nesta rodada)* o card "Previsão de crédito na conta" desta tela — mudou de lugar para LC-06 (Sucesso), por fazer mais sentido no momento em que o usuário já sabe que vai receber o dinheiro.
- Provedor mock trocado de `"Bull"` (herdado por engano do Consignado CLT, onde é um parceiro real e diferente) para `"Celcoin"`, coerente com o bloco de parceria.

**Microcopy crítica**
- Título: **"Oferta aprovada!"** — *unificado nesta rodada* com o título já usado na jornada sem conta (antes desta mudança era "Proposta aprovada!", só nesta versão)
- Bloco de parceria: rótulo "Parceiro oficial" / texto "A Celcoin é parceira oficial do leilão de crédito consignado dentro da Carteira de Trabalho Digital. Quem cuida da sua contratação a partir de agora é a Pode Já, plataforma digital que conecta você a diversas soluções financeiras."
- Accordion: rótulo do trigger "Detalhes do consignado" (conteúdo interno sem alteração de copy)
- Texto do consentimento: "Ao continuar, concordo com os termos do contrato de consentimento realizado e autorizo o desconto das parcelas em folha de pagamento."
- CTA primária: "Aceitar e continuar"

**Acessibilidade mínima**
- Contraste AA nos textos sobre fundo laranja claro (`#FFF3EE`/`#D94E28`)
- Alvo de toque mínimo 44px nos CTAs
- Estado do accordion comunicado visualmente pela rotação do ícone — **falta** `aria-expanded` no botão-trigger (ver Open Questions)

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
- **Etapa separada de LC-03** (tela própria) — mas **sem nenhum indicador visual de "passo a passo"** (sem barra de progresso/"Etapa 1 de 2"), decisão explícita para não dar a sensação de uma jornada longa.
- `autoConfirmarSelecao` (prop nova, adicionada ao `EnderecoSelector` nesta feature): ao salvar o endereço (ou selecionar um já salvo), confirma automaticamente e dispara `onConfirmar` — sem exigir clique em um botão de "Salvar endereço"/"Avançar" à parte.

**Microcopy crítica**
- Herdada do `EnderecoSelector`: "Confirme seu endereço de recebimento" / "É para onde enviaremos as comunicações do contrato"

**Acessibilidade mínima**
- Foco no primeiro campo do formulário ao abrir o modal/drawer

---

### Tela: LC-03 — Dados pendentes: Forma de recebimento

**Objetivo da tela**
- Coletar a forma de recebimento (conta bancária ou chave Pix), com suporte a múltiplas contas/chaves salvas.

**Componentes principais**
- Cabeçalho próprio da tela: ícone `Bank` + título "Para qual conta enviamos o dinheiro?" (fica **antes** do seletor de método)
- Seletor de método: 2 botões lado a lado (Conta bancária / Chave Pix), nenhum pré-selecionado por padrão
- `ContaSelector` (com `ocultarCabecalho`, `autoConfirmarSelecao`, `maxItens={5}`) quando método = Conta bancária
- `PixSelector` (novo componente local, `src/pages/leilao-clt/PixSelector.tsx`, com `ocultarCabecalho`, `autoConfirmarSelecao`, `maxItens={5}`) quando método = Chave Pix
- CTA fixa no rodapé: "Continuar"

**Estados obrigatórios**
- nenhum método selecionado (não pré-seleciona "Conta bancária" — evita cair direto no modal de conta ao sair da tela de endereço)
- método selecionado, lista vazia → modal/drawer de adicionar abre automaticamente
- método selecionado, com item(ns) salvo(s) → lista visível, permite adicionar mais (até 5) e excluir (exceto o último item)
- CTA "Continuar" desabilitada até haver uma conta **ou** uma chave Pix confirmada

**Regras de negócio**
- Escolher um método limpa o outro — mutuamente exclusivos.
- Suporta múltiplas contas bancárias **e** múltiplas chaves Pix (`maxItens={5}` nos dois).
- `ocultarCabecalho`: esconde o cabeçalho interno do `ContaSelector` (título já mostrado uma vez, fora do componente).
- Somente a inserção de dados (formulário de nova conta/nova chave Pix) acontece em modal/drawer — a lista/seleção em si fica sempre direto na tela.

**Microcopy crítica**
- Título: "Para qual conta enviamos o dinheiro?"
- Opções: "Conta bancária" / "Chave Pix"
- CTA: "Continuar"

**Acessibilidade mínima**
- Estado selecionado do método comunicado por mais que cor (borda + fundo `#FFF3EE`)

---

### Tela: LC-04 — Verificação de identidade

**Objetivo da tela**
- Avisar sobre o redirecionamento para a Unico, permitir retomar uma verificação abandonada, cancelar a proposta, ou exibir um erro do processo de assinatura.

**Componentes principais**
- Estado `aviso`: `UnicoNotice` (logo Unico com fallback textual, 3 itens de benefício, nota LGPD)
- Estado `aguardando`: `UnicoAguardando` (CTA "Reabrir verificação" + link "Cancelar proposta" → modal de confirmação)
- Estado `erro`: `ErrorScreen` (headline/subtítulo por categoria, CTA "Voltar à oferta")

**Estados obrigatórios**
- `aviso` (default, sem query param)
- `aguardando` (`?status=aguardando`)
- `erro` (`?erro=<categoria>`) — qualquer uma das 16 categorias de `ErrorCategoria`
- confirmação de cancelamento (modal/drawer sobreposto ao estado `aguardando`)

**Regras de negócio**
- `erroParam` tem prioridade sobre `status`.
- "Continuar para verificação" e "Reabrir verificação" chamam a mesma função, que navega para LC-05.
- "Cancelar proposta" navega para a tela de oferta cancelada (LC-07, variante `leilao_cancelada`).
- CTA "Voltar à oferta" (no erro) leva para `/leilao`, mantendo sessão.

**Microcopy crítica**
- Aviso — título: "Falta só confirmar sua identidade!" / descrição: "Sua oferta de Crédito Consignado CLT já está aprovada. Você será redirecionado para a Unico para verificar sua identidade."
- Aguardando — título: "Aguardando sua verificação" / descrição: "Você saiu antes de concluir a verificação de identidade. Toque em Reabrir verificação para continuar de onde parou."
- Erro — headline/subtítulo por categoria (ver tabela completa na seção 6)
- Modal de cancelamento: "Cancelar proposta" / "Tem certeza que deseja cancelar? Sua proposta será descartada e não poderá ser recuperada." / "Sim, cancelar" + "Não, continuar"

**Acessibilidade mínima**
- Foco preso no modal de confirmação de cancelamento

---

### Tela: LC-05 — Redirecionando para Unico

**Objetivo da tela**
- Transição visual enquanto o usuário é (supostamente) levado à Unico para verificação de identidade/assinatura.

**Componentes principais**
- Tela cheia, sem `SubPageLayout` (gradiente laranja `#FD5F31` → `#FA9832`)
- Ícone `ArrowSquareOut` com animação de pulso
- Botão manual "Abrir verificação na Unico" (aparece só depois de 10s)

**Estados obrigatórios**
- transição automática (0–3s): sem botão visível
- botão manual disponível (a partir de 10s)

**Regras de negócio**
- Após 3s: `window.open("https://unico.io/verificacao", "_blank")` (URL mock) + `navigate("/leilao/assinatura?status=aguardando", { replace: true, state })` — **hardcoded, sem depender de `getStoredUser()`**.
- Após 10s: mostra o botão manual, faz o mesmo `window.open` + `navigate` (útil se o pop-up foi bloqueado).
- `// TODO: substituir pela URL real de verificação/assinatura da Unico quando disponível`.

**Microcopy crítica**
- "Abrindo a Unico..." / "Você será direcionado para verificar sua identidade na plataforma da Unico." / "Abrir verificação na Unico"

**Acessibilidade mínima**
- Anúncio para leitor de tela do redirecionamento automático (hoje não implementado — ver Open Questions)

---

### Tela: LC-06 — Sucesso

**Objetivo da tela**
- Confirmar que o empréstimo foi aprovado e o dinheiro está a caminho, com resumo dos valores.

**Componentes principais**
- Ícone `CheckCircle` verde animado
- **Card "Previsão de crédito na conta"** *(adicionado nesta rodada — veio da tela de oferta, LC-01)*: ícone `CalendarBlank`, logo abaixo da descrição
- Card resumo: Parceiro (`Celcoin`) / Valor a receber / Parcela mensal / Primeira parcela / Banco
- CTA "Ver meu contrato" (`/contratos`) + link "Voltar para o início" (`/painel`)

**Estados obrigatórios**
- default (única — tela de confirmação, sem erro/loading)

**Regras de negócio**
- Nome do banco vem de `location.state.conta` — mostra `—` se a forma de recebimento foi Pix.
- Saudação usa o primeiro nome do usuário logado (`getStoredUser()?.name`), condicional.
- Valores de resumo vêm de `OFERTA_LEILAO`; primeira parcela usa a data do mês seguinte calculada no cliente.
- **Box "Previsão de crédito na conta" movido pra cá nesta rodada** (antes ficava na tela de oferta, LC-01) — decisão de fazer mais sentido no momento em que o usuário já sabe que vai receber o dinheiro, em vez de antes de aceitar a oferta.
- Alcançada **diretamente por URL** nesta fase de protótipo — não há navegação automática de LC-05 até aqui, já que dependeria do callback real da Unico.

**Microcopy crítica**
- Título: "Dinheiro a caminho, {nome}!"
- Descrição: **"Seu empréstimo foi aprovado."** *(encurtada nesta rodada — antes incluía "O valor cai na sua conta entre hoje e em até 3 dias úteis.", removido porque o box novo já transmite essa informação)*
- Box: "Previsão de crédito na conta" / "Entre hoje e em até 3 dias úteis"
- CTA: "Ver meu contrato" / "Voltar para o início"

**Acessibilidade mínima**
- Ordem de leitura: confirmação → previsão de crédito → resumo → ações

---

### Tela: LC-07 — Telas de exceção (4 variantes)

**Objetivo da tela**
- Comunicar claramente por que a oferta não pode seguir (expirou, foi cancelada, ou falhou depois de assinada) e dar um próximo passo acionável.

**Componentes principais**
- `ErrorScreen` dentro de `SubPageLayout`, sem nenhum outro conteúdo na tela
- `leilao_expirada` usa ícone customizado `ClockCountdown`; as outras 3 usam o ícone padrão (`WarningCircle`)

**Estados obrigatórios**
- Cada rota é uma categoria fixa (não há estado dinâmico dentro da tela) — 4 rotas

**Regras de negócio / microcopy por variante**

| categoria | rota | headline | subtítulo | CTA |
|---|---|---|---|---|
| `leilao_expirada` | `/leilao/expirada` | "Sua sessão expirou" | "O prazo para aceitar esta oferta encerrou. Acesse o aplicativo CTPS Digital para solicitar uma nova consulta." | "Voltar ao início" → `/painel` |
| `leilao_cancelada` | `/leilao/cancelada` | "Sua oferta foi cancelada" | "A instituição financeira cancelou esta oferta. Você pode acessar o aplicativo CTPS Digital para participar de uma nova consulta." | "Voltar ao início" → `/painel` |
| `leilao_falha_averbacao` | `/leilao/falha-averbacao` | "Não foi possível finalizar o registro" | "Ocorreu um problema ao registrar sua proposta na folha de pagamento. Entre em contato com nosso suporte." | "Falar com suporte" → abre chat |
| `leilao_falha_desembolso` | `/leilao/falha-desembolso` | "Tivemos um problema na liberação do valor" | "O contrato foi assinado, mas houve uma falha ao depositar o valor. Nossa equipe já foi notificada. Entre em contato com o suporte." | "Falar com suporte" → abre chat |

- Nas duas variantes de "falha", o CTA abre o chat de suporte (`ChatContext`) em vez de navegar.
- O CTA sempre volta para `/painel` (usuário tem sessão).

**Acessibilidade mínima**
- Headline como texto, não só ícone/cor

---

### Tela: LC-08 — Card "Contrato ativo" (dashboard)

**Objetivo da tela**
- Dar visibilidade imediata, na primeira entrada no app, de que o usuário já tem um contrato ativo — sem que ele precise procurar.

**Componentes principais**
- Card na seção "Para você agora" (`/painel`), sempre na primeira posição quando visível
- Ícone `Money` (Phosphor, `weight="fill"`) em círculo verde-claro
- Texto "Você tem um contrato Consignado CLT ativo!" + "Ver contrato →"

**Estados obrigatórios**
- visível / oculto (depois do primeiro clique, ou se a flag de origem nunca foi setada)

**Regras de negócio**
- Só aparece se `podeja_leilao_contrato_ativo === "true"` **e** `podeja_leilao_contrato_visto !== "true"` — a primeira flag é setada na jornada **sem conta** ao criar a conta pós-sucesso (ver `leilao-clt-sem-conta-journey-spec.md`, tela LG-08); é o **único** jeito de o card aparecer.
- Ao clicar, grava `podeja_leilao_contrato_visto = "true"` **antes** de navegar para `/contratos/clt-001` — o card não aparece mais em nenhuma visita futura.
- Sempre em primeira posição entre os cards de "Para você agora".

**Microcopy crítica**
- "Você tem um contrato Consignado CLT ativo!" / "Ver contrato" + seta

**Acessibilidade mínima**
- Card é um `<button>` real (focável, ativável por teclado)

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| LC-02/LC-03 | new | Endereço e forma de recebimento viraram telas **separadas** (sem passo a passo visual) | A versão "tudo numa tela" causava 2 modais abertos simultaneamente | Elimina o bug visual e reduz carga cognitiva por tela |
| LC-03 | new | `ContaSelector` e `PixSelector` mostram a lista/seleção **direto na tela**; só o formulário de novo item vai para modal/drawer | Uma iteração anterior colocava o seletor inteiro dentro de um modal | Reduz uma camada de indireção |
| LC-03 | new | Método de recebimento não vem mais pré-selecionado por padrão | "Conta bancária" pré-selecionada fazia o usuário cair direto no modal de conta, sem chance de escolher Pix | Reduz erro de seleção não intencional |
| LC-03 | new | `ContaSelector` ganhou suporte a múltiplas contas (`maxItens` igualado ao do Pix) | Só o Pix permitia mais de uma chave | Paridade de capacidade entre os dois métodos |
| LC-05 (redirecionamento Unico) | new | Destino da tela de retorno é **hardcoded por rota**, sem checar `getStoredUser()` | Evita cross-contamination com a jornada sem conta | Elimina bug de roteamento cruzado |
| LC-08 (card dashboard) | new | Card some após o primeiro clique (`podeja_leilao_contrato_visto`) | Sem essa regra, o card ficaria permanentemente no topo de "Para você agora" | Mantém "Para você agora" relevante |
| LC-01 | changed | Adicionado o bloco de parceria Pode Já × Celcoin | O leilão aparece com o nome "Celcoin" dentro da CTPS; sem essa explicação o usuário estranha a troca de identidade ao abrir o link | Reduz desconfiança/estranhamento no início da jornada |
| LC-01 | changed | Removida a frase "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo." | Não fazia sentido com o que realmente acontece no leilão (feedback direto do PO) | Remove informação incorreta/confusa |
| LC-01 | changed | Card "Detalhes do consignado" virou accordion colapsável (copy inalterado) | Tela tinha informação demais visível de uma vez | Reduz densidade de informação percebida |
| LC-01 → LC-06 | changed | Card "Previsão de crédito na conta" mudou da tela de oferta para a tela de sucesso | Faz mais sentido no momento em que o usuário já sabe que vai receber o dinheiro, não antes de aceitar a oferta | Reduz informação na tela de oferta; reforça a confirmação na tela de sucesso |
| LC-01 | changed | Título unificado para "Oferta aprovada!" (era "Proposta aprovada!", só nesta versão) | Consistência com o título já usado na jornada sem conta | Mesma terminologia nas duas jornadas |
| LC-01/LC-06 | changed | Provedor mock trocado de "Bull" para "Celcoin" | "Bull" era um resquício copiado do Consignado CLT, sem relação real com este produto; ficava contraditório ao lado do bloco de parceria novo | Consistência entre o badge do parceiro e o texto explicativo |

## 7) Taxonomia de eventos Amplitude

> Convenção `snake_case`, padrão `<dominio>_<acao>_<estado>`. Os eventos abaixo são **compartilhados com a jornada sem conta** (mesmo `event_name`, diferenciados pela propriedade `flow_name`) sempre que a ação é conceitualmente igual — isso permite comparar as duas jornadas no mesmo funil. A lista completa dos dois lados está espelhada em `leilao-clt-sem-conta-journey-spec.md`; aqui estão só os eventos que existem no flow `leilao_clt_com_conta`.
>
> **Hoje não existe nenhuma instrumentação real** nesta jornada. Todos os eventos com `qa_status: pending`.

| event_name | trigger | screen_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|
| `leilao_oferta_viewed` | Entrada em LC-01 | oferta | oferta | (padrão) + `flow_name=leilao_clt_com_conta` | — | Analytics | pending |
| `leilao_oferta_termo_alternado` | Toggle do checkbox de consentimento | oferta | oferta | (padrão) + `aceito` (bool) | — | Analytics | pending |
| `leilao_oferta_aceita` | CTA "Aceitar e continuar" | oferta | oferta | (padrão) | — | Analytics | pending |
| `leilao_endereco_confirmado` | Endereço salvo/selecionado (LC-02) | dados_pendentes | endereco | (padrão) | — | Analytics | pending |
| `leilao_forma_metodo_selecionado` | Clique em Conta bancária ou Chave Pix (LC-03) | dados_pendentes | forma_recebimento | (padrão) + `metodo` (`conta`\|`pix`) | — | Analytics | pending |
| `leilao_conta_bancaria_adicionada` | Nova conta salva no `ContaSelector` | dados_pendentes | forma_recebimento | (padrão) | `total_contas_salvas` | Analytics | pending |
| `leilao_chave_pix_adicionada` | Nova chave salva no `PixSelector` | dados_pendentes | forma_recebimento | (padrão) | `total_chaves_salvas` | Analytics | pending |
| `leilao_forma_recebimento_confirmada` | "Continuar" em LC-03 | dados_pendentes | forma_recebimento | (padrão) + `metodo` | — | Analytics | pending |
| `leilao_verificacao_iniciada` | "Continuar para verificação" (LC-04, estado aviso) | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_reaberta` | "Reabrir verificação" (LC-04, estado aguardando) | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_cancelada` | "Sim, cancelar" confirmado no modal | assinatura | verificacao | (padrão) | — | Analytics | pending |
| `leilao_verificacao_erro_exibido` | `?erro=` presente em LC-04 | assinatura | verificacao | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_unico_redirecionamento_aberto` | Abertura da aba da Unico (LC-05) | redirecionando_unico | redirecionamento | (padrão) + `modo` (`automatico`\|`manual`) | — | Analytics | pending |
| `leilao_sucesso_viewed` | Entrada em LC-06 | sucesso | sucesso | (padrão) | — | Analytics | pending |
| `leilao_contrato_acessado` | "Ver meu contrato" (LC-06) ou card do dashboard (LC-08) | sucesso \| painel | sucesso \| dashboard | (padrão) + `origem` (`sucesso`\|`dashboard_card`) | — | Analytics | pending |
| `leilao_erro_terminal_viewed` | Entrada em qualquer variante de LC-07 | expirada \| cancelada \| falha_averbacao \| falha_desembolso | erro_terminal | (padrão) + `erro_categoria` | — | Analytics | pending |
| `leilao_erro_terminal_cta_clicado` | Clique no CTA da tela terminal (LC-07) | expirada \| cancelada \| falha_averbacao \| falha_desembolso | erro_terminal | (padrão) + `erro_categoria`, `destino` (`painel`\|`chat_suporte`) | — | Analytics | pending |
| `leilao_dashboard_contrato_card_viewed` | Card LC-08 renderizado (impressão) | painel | dashboard | (padrão) | — | Analytics | pending |
| `leilao_dashboard_contrato_card_clicado` | Clique no card LC-08 | painel | dashboard | (padrão) | — | Analytics | pending |

### Exemplo de payload
```json
{
  "event_name": "leilao_forma_recebimento_confirmada",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-09-21T10:00:00Z",
  "platform": "Web",
  "flow_name": "leilao_clt_com_conta",
  "step_name": "forma_recebimento",
  "screen_name": "dados_pendentes",
  "metodo": "conta"
}
```

## 8) Critérios de QA de tracking
- Cobertura de eventos críticos >= 90% (happy path completo, do `leilao_oferta_viewed` ao `leilao_sucesso_viewed`, instrumentado antes de considerar "pronto")
- Conformidade de taxonomia >= 95%
- Completude de propriedades >= 95%
- PII indevida = 0 — nunca enviar endereço/dados bancários (nem mascarados) como propriedade de evento
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

**Impacto em escopo**
- Feature nova ponta a ponta. Mudanças desta rodada (bloco Celcoin, accordion, reorganização de informação entre oferta/sucesso) são só de UI/copy, sem alterar nenhuma regra de negócio ou navegação.

**Riscos e dependências**
- **Toda a jornada roda sobre mocks** — sem callback real da Unico, sem cálculo real de IOF/CET. A tela de sucesso (LC-06) é acessada hoje diretamente por URL.
- **Nenhuma instrumentação de analytics ativa** — a taxonomia da seção 7 é pré-requisito para medir conversão/abandono em qualquer etapa.
- **Depende do `taya-ai-engine`** para o CTA "Falar com suporte" das telas de falha funcionar de ponta a ponta.
- **Depende de confirmação do nome/identidade visual real da Celcoin** dentro da CTPS Digital — hoje o texto do bloco de parceria assume que "Celcoin" é o nome exibido lá, mas isso não foi validado com o time técnico/CTPS (ver Open Questions).

**Impacto esperado em métricas**
- Sem instrumentação, hoje é impossível medir a taxa de conversão desta jornada nem comparar abandono por etapa com a jornada sem conta — implementar a taxonomia da seção 7 é pré-requisito para qualquer leitura de funil.

**Plano de rollout**
- Não aplicável a este documento (protótipo de design). Rollout futuro relevante: substituição de cada mock por integração real (Unico → cálculo de IOF/CET → analytics).

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| "Celcoin" é de fato o nome/identidade exibido para o usuário dentro da Carteira de Trabalho Digital? O bloco de parceria assume isso, mas não foi validado formalmente com o time técnico/CTPS. | PO / Time técnico | — | aberto |
| Qual o contrato real do callback da Unico (verificação de identidade + assinatura)? Hoje a tela de sucesso é acessada diretamente por URL, sem nenhum evento real fechando esse loop. | Devs / Unico | — | aberto |
| O card de contrato ativo (LC-08) deveria ter algum limite de tempo além de "sumir no primeiro clique" (ex.: expirar depois de N dias sem clique, como o card `mostrarContratoNovo` de outro produto)? | Design/PO | — | aberto |
| O botão-trigger do accordion "Detalhes do consignado" (LC-01) não tem `aria-expanded` — adicionar antes de considerar a tela pronta para acessibilidade? | Devs / Accessibility | — | aberto |
| Falta uma tela dedicada de "proposta reprovada/negada" para o Leilão CLT? Confirmado com Ellen em sessão anterior que as 4 telas de exceção pós-aprovação (LC-07) já cobrem o que era esperado, já que esta jornada só começa depois de uma oferta **já aprovada**. Registrado aqui para não ser reaberto sem contexto. | Design/PO | — | resolvido — não se aplica |
