---
agent: content-strategy
project: taya-app
journey: open-finance-gestao-dados
platform: Mobile
date: 2026-11-13
depends_on: [open-finance-onboarding-celcoin, ux-research]
status: draft
---

# Journey Spec - Gestão de bancos conectados via Open Finance (Minha Conta)

Depende da jornada de cadastro (`open-finance-onboarding-celcoin-journey-spec.md`): consome o
`OpenFinanceContext` criado ali (`bancosConectados`, `disconnectBankById`) e reaproveita a
jornada de conexão de banco já existente nessa branch, agora também acessível fora do
onboarding.

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: depois de conectar um banco no cadastro, o usuário não tinha
  nenhum lugar em "Minha Conta" para ver, adicionar, desconectar ou excluir os dados dos bancos
  conectados via Open Finance. O Erasmo (tech) confirmou em 13/11/2026 que são necessárias
  **duas** ações distintas: desconectar um banco (revogação de consentimento) e solicitar a
  exclusão dos dados já coletados (LGPD), e que a Pode Já deve expor as duas.
- Resultado esperado para o usuário: uma tela em "Minha Conta → Open Finance" onde vê os bancos
  conectados, conecta mais bancos, desconecta um banco específico, ou solicita a exclusão de
  todos os dados coletados via Open Finance, sempre com uma confirmação explícita antes de
  qualquer ação destrutiva.
- Impacto esperado para o negócio: fecha o ciclo de consentimento (conectar → gerenciar →
  revogar/excluir) exigido pela LGPD, sem depender de suporte manual para esses pedidos.

## 2) Escopo e contexto

- Tipo: nova tela e novo fluxo de gestão, dentro de "Minha Conta".
- Origem: resposta do Erasmo em 13/11/2026 (ver seção 10 da journey-spec de onboarding) +
  pedido da Ellen em 13/11/2026 para montar a parte de gestão depois do cadastro.
- Revisão da Ellen em 13/11/2026, com 5 ajustes já incorporados nesta versão (ver seção 6):
  card de incentivo no dashboard quando não há banco conectado, retorno ao ponto de origem
  (não ao onboarding) ao conectar banco por aqui, seleção de banco independente do onboarding,
  remoção de padding duplicado nos drawers de confirmação, e etapa de motivo antes da exclusão
  de dados.
- Fora de escopo:
  - Qualquer tela de insights/dashboard financeiro a partir dos dados do Open Finance
    (próxima fase, ainda não iniciada).
  - Granularidade da exclusão de dados: hoje a exclusão é total (desconecta todos os bancos e
    apaga tudo que foi coletado via Open Finance), não por banco individual.
  - Status real do pedido de exclusão (ex.: acompanhamento de "em andamento" → "concluído"):
    a tela de sucesso só confirma o registro do pedido.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| gestao_dashboard_card | Ser incentivado a conectar um banco | Nenhum banco conectado, card "Para você agora" no painel | painel | Toca no CTA e vai direto para a seleção de instituição |
| gestao_lista | Ver bancos conectados e ações disponíveis | Acesso via "Minha Conta → Conta → Open Finance" ou pelo card do painel | gestao_lista | Vê lista de bancos (ou estado vazio), pode conectar mais, desconectar um, ou pedir exclusão de dados |
| gestao_conectar | Conectar um novo banco a partir daqui | CTA "Conectar banco"/"Conectar outro banco" | jornada de conexão (`of_selecionar` → `of_transicao` → `of_retorno`) | Ao concluir (ou desistir), volta para `gestao_lista`, não para o painel ou onboarding |
| gestao_desconectar | Desconectar um banco específico | CTA "Desconectar" num banco da lista | modal de confirmação (Dialog/Drawer) | Banco sai de `bancosConectados`; segue conectável de novo depois |
| gestao_motivo_exclusao | Contar por que quer excluir os dados | CTA "Solicitar exclusão dos meus dados" | gestao_motivo | Escolhe um motivo (lista embaralhada) e, opcionalmente, comenta; avança para a confirmação |
| gestao_confirmar_exclusao | Confirmar o pedido de exclusão | CTA "Continuar" na etapa de motivo | modal de confirmação (Dialog/Drawer) | Todos os bancos são desconectados e o pedido é registrado |
| gestao_exclusao_sucesso | Saber que o pedido foi registrado | Confirmação da exclusão | gestao_sucesso | Vê a confirmação e volta para Minha Conta |

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente | status | owner |
|---|---|---|---|---|---|
| gestao_lista | Open Finance: lista de bancos conectados / estado vazio | `/minha-conta/open-finance` | `OpenFinanceGestaoPage` (estado padrão) | new | Ellen |
| gestao_motivo | Open Finance: motivo da exclusão de dados | `/minha-conta/open-finance` (estado interno `motivoAberto`) | `OpenFinanceGestaoPage` (estado `motivoAberto`) | new | Ellen |
| gestao_sucesso | Open Finance: solicitação de exclusão registrada | `/minha-conta/open-finance` (estado interno `exclusaoConfirmada`) | `OpenFinanceGestaoPage` (estado `exclusaoConfirmada`) | new | Ellen |
| gestao_desconectar_modal | Confirmar desconexão de um banco | (Dialog no desktop, Drawer no mobile, sobre `gestao_lista`) | `OpenFinanceGestaoPage` (modal `desconectarModalContent`) | new | Ellen |
| gestao_exclusao_modal | Confirmar solicitação de exclusão | (Dialog no desktop, Drawer no mobile, sobre `gestao_lista`) | `OpenFinanceGestaoPage` (modal `exclusaoModalContent`) | new | Ellen |

`OpenFinanceGestaoPage` está em `src/App.tsx`, junto com `MOTIVOS_EXCLUSAO_OPEN_FINANCE` e o
helper `embaralhar`. As 4 telas da jornada de conexão (`of_intro`, `of_selecionar`,
`of_transicao`, `of_retorno`, em `src/pages/open-finance-celcoin/`) são reaproveitadas, não
duplicadas: ganharam um `returnTo` (via `location.state`) para saber voltar para
`gestao_lista` quando acessadas por aqui, em vez do destino padrão de onboarding/painel.

## 5) Spec por tela

### gestao_lista

- **Objetivo**: dar visibilidade e controle sobre os bancos conectados via Open Finance.
- **Componentes**: card "Bancos conectados" (lista com nome, data de conexão, CTA
  "Desconectar" por item) ou card de estado vazio com CTA "Conectar banco"; link "Conectar
  outro banco" quando já há pelo menos um banco; card informativo sobre dados do Open Finance,
  com o CTA "Solicitar exclusão dos meus dados".
- **Estados obrigatórios**:
  - empty state: nenhum banco conectado, só o card de incentivo a conectar.
  - default: um ou mais bancos conectados.
- **Dados**: lê `bancosConectados` de `OpenFinanceContext` (o mesmo contexto que a jornada de
  cadastro grava em caso de sucesso ou parcial).
- **Microcopy crítica**: CTA primário no estado vazio "Conectar banco"; link "Conectar outro
  banco"; CTA destrutivo "Solicitar exclusão dos meus dados".

### gestao_motivo

- **Objetivo**: entender a motivação antes de processar o pedido de exclusão, sem travar o
  pedido nessa etapa (motivo é opcional de detalhar, mas obrigatório selecionar algum).
- **Componentes**: lista de motivos como botões (seleção única), campo de comentário opcional
  (até 280 caracteres), barra fixa no rodapé com CTA "Continuar" (desabilitado até escolher um
  motivo) e "Cancelar".
- **Regras de negócio**: a ordem dos motivos é embaralhada a cada visita (`embaralhar`, mesmo
  padrão Fisher-Yates usado na jornada de exclusão de conta), para não viesar a escolha pela
  posição na lista. "Cancelar" volta para `gestao_lista` sem registrar nada.
- **Microcopy crítica**: pergunta "Por que você quer excluir seus dados?"; aviso "Isso ajuda a
  gente a entender e melhorar. Não muda o resultado do seu pedido."; motivos: "Não uso mais o
  Open Finance", "Prefiro não ter meus dados bancários armazenados", "Vou conectar outro banco
  no lugar deste", "Tive algum problema com a funcionalidade", "Só queria ver como
  funcionava", "Outro motivo".

### gestao_desconectar_modal / gestao_exclusao_modal

- **Objetivo**: confirmar explicitamente uma ação que remove conexão ou dados, evitando toque
  acidental.
- **Componentes**: Dialog (desktop, `isDesktop = useMediaQuery("(min-width: 768px)")`) ou
  Drawer (mobile), com o texto de consequência, o CTA destrutivo e "Cancelar".
- **Regra de negócio corrigida nesta rodada**: o conteúdo do modal (`desconectarModalContent`/
  `exclusaoModalContent`) é passado direto como filho do `DrawerContent`, sem nenhum `<div>`
  extra de padding ao redor. `DrawerContent` (`src/components/ui/drawer.tsx`) já aplica seu
  próprio padding interno; um wrapper adicional duplicava esse espaçamento, problema
  recorrente nesse componente em outras telas do app, sinalizado pela Ellen em 13/11/2026 e
  corrigido aqui como referência para os próximos drawers de confirmação.
- **Microcopy crítica**: desconectar: "Você pode conectar o {banco} de novo quando quiser. Os
  dados já importados continuam no seu histórico." / CTA "Desconectar"; exclusão: "Isso apaga
  os dados que já coletamos pelo Open Finance e desconecta todos os seus bancos. Não afeta o
  resto da sua conta na Pode Já. Não dá pra desfazer." / CTA "Solicitar exclusão".

### gestao_sucesso

- **Objetivo**: confirmar que o pedido de exclusão foi registrado.
- **Componentes**: ícone de sucesso, texto de confirmação, CTA "Voltar para minha conta".
- **Regra de negócio**: ao confirmar a exclusão, todos os bancos são desconectados
  (`disconnectBankById` chamado para cada um) antes de mostrar esta tela: a exclusão de dados
  hoje é total, não por banco.
- **Microcopy crítica**: "Solicitação registrada"; "Vamos excluir os dados que coletamos via
  Open Finance e te avisamos quando terminar. Seus bancos já foram desconectados."

### Card no painel (recomendação, não uma tela nova)

- **Objetivo**: incentivar quem ainda não conectou nenhum banco a fazê-lo, sem precisar
  descobrir o caminho em "Minha Conta" sozinho.
- **Componentes**: novo item (`id: "O5"`) no sistema de cards "Para você agora"
  (`RecomendacoesContext`), grupo `"O"`, ícone `Bank`.
- **Regras de negócio**: só aparece quando `bancosConectados.length === 0`; dispensável, e se
  dispensado volta a aparecer depois de 30 dias (`reexibirApos: 30`), mesmo padrão já usado
  pelos cards O1 e O4.
- **Microcopy crítica**: "Conecte seu banco e veja sua vida financeira em um só lugar."; CTA
  "Conectar".

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| (painel) | new | Card "Conecte seu banco..." em Para você agora, só sem banco conectado | Pedido da Ellen em 13/11/2026: incentivar quem ainda não tem nenhum banco | Mais gente descobre a funcionalidade sem precisar navegar até Minha Conta primeiro |
| gestao_lista | new | Tela de gestão em Minha Conta; conectar/desconectar bancos | Erasmo confirmou a necessidade de uma ação de desconectar banco, separada da exclusão de dados | Usuário tem controle total sobre as conexões sem depender de suporte |
| of_selecionar / of_transicao / of_retorno | changed | Passam a receber e propagar `returnTo`; a seta de voltar e os CTAs de saída respeitam de onde vieram | Pedido da Ellen: entrar por Minha Conta não pode levar à tela de intro do cadastro nem sempre voltar pro painel | Jornada de conexão fica reutilizável em qualquer ponto de entrada, não só onboarding |
| gestao_desconectar_modal / gestao_exclusao_modal | fixed | Removido o `<div>` de padding extra dentro do Drawer | Duplicava o padding que o próprio `DrawerContent` já aplica, bug recorrente sinalizado pela Ellen | Drawers de confirmação ficam visualmente consistentes no mobile |
| gestao_motivo | new | Nova etapa de motivo antes da confirmação de exclusão, com lista embaralhada | Pedido da Ellen: entender a motivação, seguindo o padrão já usado na exclusão de conta | Dá sinal qualitativo de por que as pessoas pedem exclusão, sem atrito adicional no fluxo |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `openfinance_gestao_`
- Cobrir eventos de entrada, ação, sucesso e cancelamento em cada etapa.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| openfinance_gestao_viewed | Tela de gestão carregada | gestao_lista | openfinance_gestao | lista | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, total_bancos_conectados | - | content-strategy | pending |
| openfinance_gestao_dashboard_card_shown | Card "Conecte seu banco" exibido no painel | painel | openfinance_gestao | dashboard_card | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_gestao_dashboard_card_tapped | CTA "Conectar" no card do painel | painel | openfinance_gestao | dashboard_card | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_gestao_connect_started | CTA "Conectar banco"/"Conectar outro banco" em gestao_lista | gestao_lista | openfinance_gestao | lista | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, return_to | - | content-strategy | pending |
| openfinance_gestao_disconnect_requested | CTA "Desconectar" num banco | gestao_lista | openfinance_gestao | lista | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_gestao_disconnect_confirmed | CTA "Desconectar" no modal de confirmação | gestao_desconectar_modal | openfinance_gestao | desconectar | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_gestao_deletion_reason_viewed | Entrada na etapa de motivo | gestao_motivo | openfinance_gestao | motivo | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_gestao_deletion_reason_selected | Seleção de um motivo | gestao_motivo | openfinance_gestao | motivo | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, deletion_reason | - | content-strategy | pending |
| openfinance_gestao_deletion_requested | CTA "Solicitar exclusão" no modal de confirmação | gestao_exclusao_modal | openfinance_gestao | exclusao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, deletion_reason, has_comment, total_bancos_desconectados | - | content-strategy | pending |
| openfinance_gestao_deletion_confirmed_viewed | Tela de sucesso da exclusão exibida | gestao_sucesso | openfinance_gestao | sucesso | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "openfinance_gestao_deletion_requested",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-13T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "openfinance_gestao",
  "step_name": "exclusao",
  "screen_name": "gestao_exclusao_modal",
  "deletion_reason": "prefiro_nao_compartilhar",
  "has_comment": false,
  "total_bancos_desconectados": 2
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (entrada na tela, conectar, desconectar, motivo,
  exclusão solicitada e confirmada)
- Conformidade de taxonomia >= 95% (snake_case, prefixo `openfinance_gestao_`)
- Completude de propriedades >= 95%
- PII indevida = 0 (nenhum CPF/CNPJ real ou texto livre do campo de comentário em propriedade
  de evento)
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

- Impacto em escopo: fecha o ciclo de consentimento do Open Finance (conectar → gerenciar →
  revogar/excluir), exigido pelo Erasmo como pré-requisito de compliance. Depende da PR da
  jornada de cadastro (`feature/openfinance-klavi-cadastro`, PR #15) estar mergeada primeiro,
  porque usa o mesmo `OpenFinanceContext`.
- Riscos e dependências: PR #16 (`feature/openfinance-gestao-dados`) está baseada na branch da
  PR #15. A ordem de merge precisa ser #15 antes de #16, ou a base da #16 precisa ser
  reapontada para `main` depois do merge da #15.
- Impacto esperado em métricas: taxa de conexão de banco deve aumentar com o card no painel;
  o motivo de exclusão dá visibilidade qualitativa de por que as pessoas desconectam/excluem
  dados, útil para priorizar a fase de insights.
- Plano de rollout: liberar junto com a jornada de cadastro assim que o backend confirmar a
  integração com a Celcoin; a fase de insights/dashboard financeiro é a próxima, ainda não
  iniciada.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| A exclusão de dados deveria poder ser feita por banco individual, em vez de sempre total? | Ellen / Erasmo | [A CONFIRMAR] | aberta |
| Existe um prazo real (SLA) para a exclusão dos dados depois do pedido, que devemos comunicar na tela de sucesso? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O motivo e o comentário da exclusão devem ser enviados a algum lugar (ex.: ticket interno, CRM), ou ficam só como evento de analytics? | Barreto (GPM) | [A CONFIRMAR] | aberta |
| "Conectar outro banco" a partir daqui deveria reexibir os bancos já conectados, como já está marcado em aberto na jornada de cadastro? | Ellen | [A CONFIRMAR] | aberta |
