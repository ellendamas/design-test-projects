---
agent: content-strategy
project: taya-app
journey: open-finance-vida-financeira
platform: Mobile
date: 2026-11-18
depends_on: [open-finance-gestao-dados]
status: draft
---

# Journey Spec - Vida financeira: painel de insights do Open Finance

Depende da jornada de gestão de bancos (`open-finance-gestao-dados-journey-spec.md`), que já
deixava essa fase explicitamente fora de escopo como "próxima fase, ainda não iniciada". Lê o
mesmo `OpenFinanceContext` (`bancosConectados`, `saldoTotal`) e os catálogos determinísticos por
banco, agora cobrindo os 14 bancos do Discovery da Celcoin.

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: depois de conectar e gerenciar os bancos, o usuário ainda não
  tinha nenhuma visão consolidada do que esses dados diziam sobre a vida financeira dele. Saldo,
  gastos, cartões, assinaturas e cheque especial ficavam espalhados ou simplesmente não
  existiam no produto.
- Resultado esperado para o usuário: um painel único, "Vida financeira" (novo item fixo na
  navegação principal), que resume saldo entre contas, ritmo de gastos do mês comparado ao
  anterior, cartões de crédito, assinaturas recorrentes, cheque especial e destaques automáticos
  (fatos determinísticos, nunca sugestões geradas), com atalho pra aprofundar em cada tema.
- Impacto esperado para o negócio: aumenta o motivo de abrir o app com frequência, já que a vida
  financeira muda todo dia; abre um canal de cross-sell honesto com outros produtos Pode Já
  (Saúde por Assinatura) a partir de um fato real do próprio usuário; e responde à avaliação do
  Barreto (GPM) de que a Pode Já precisa de uma home financeira acionável, no nível do principal
  concorrente direto usado como referência de comparação (Pier).

## 2) Escopo e contexto

- Tipo: evolução de jornada. Abre a fase de insights/dashboard financeiro que a journey-spec de
  gestão de dados já previa como próximo passo.
- Origem: pedido da Ellen a partir de 13/11/2026, com feedback do Barreto (GPM) na sync de
  product do mesmo dia, usando a Pier como referência comparativa de comportamento, não como
  modelo pra copiar: a linguagem final ficou própria da Pode Já ("Destaques", não "Insights";
  "Ritmo do mês", não um nome que remetesse à Pier).
- Revisão contínua entre 13 e 18/11/2026, com várias rodadas de ajuste de layout, copy e
  comportamento (ver seção 6).
- Fora de escopo:
  - Granularidade por transação individual nos destaques (editar ou categorizar uma transação
    manualmente).
  - Qualquer número de economia estimada (ex.: "economize até 80% com farmácia") sem base de
    dado real. Decisão de produto registrada na seção 6.
  - Personalização do painel (mostrar/ocultar cards), ideia levantada pela Ellen e adiada de
    propósito pra depois desta entrega.
  - Conexão com outros produtos além do Saúde por Assinatura nesta fase (ex.: Saque Fácil).
  - Confirmação de custo por chamada à Celcoin além do limite da rede. O limite de 3
    atualizações por dia por banco é decisão de produto, não um limite técnico confirmado. Ver
    open question.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| vf_entrada | Entrar na Vida financeira | Toca "Vida financeira" na navegação principal | vf_home | Vê o painel com saldo, ritmo do mês, destaques e atalhos |
| vf_ritmo_detalhes | Entender se gastou mais ou menos que o mês passado | Toca "Ver detalhes" no card Ritmo do mês | vf_gastos | Vê o detalhamento completo do período |
| vf_ver_destaques | Ver todos os destaques, não só os 4 do carrossel | Toca "Ver mais" no carrossel de destaques | vf_destaques | Lista completa, filtrável por grupo |
| vf_saude_banner | Conhecer o Saúde por Assinatura a partir do próprio gasto com farmácia | Toca o banner abaixo dos destaques | Saúde por Assinatura (fora desta jornada) | Vai pro produto Saúde por Assinatura |
| vf_cartoes | Ver fatura total e detalhar cartão | Toca "Cartões de crédito" ou um atalho de Faturas/Parcelas/Limites | vf_cartoes_faturas / vf_cartoes_parcelas / vf_cartoes_limites | Detalhe específico do cartão selecionado |
| vf_assinaturas | Ver gasto recorrente do mês | Toca o mini-card Assinaturas | vf_assinaturas | Lista de assinaturas, inclusive as em risco |
| vf_limite_conta | Ver uso do cheque especial | Toca o mini-card Limite da conta | vf_limite_conta | Histórico de uso por banco, valor sempre em vermelho |
| vf_saldo_por_banco | Ver saldo banco a banco | Abre o acordeão dentro do box laranja | vf_home | Lista expande com animação, sem sair da tela |
| vf_atualizar | Forçar atualização dos dados de um banco | Toca o ícone de atualizar no box laranja | vf_atualizar_modal | Vê status por banco e atualiza um de cada vez |
| vf_conectar_mais | Conectar mais um banco a partir daqui | Toca "Conectar novo banco" | jornada de conexão existente | Ao concluir, volta pra vf_home |

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente | status | owner |
|---|---|---|---|---|---|
| vf_home | Vida financeira (painel) | `/vida-financeira` | `VidaFinanceiraHomePage` | new | Ellen |
| vf_gastos | Gastos | `/vida-financeira/gastos` | `VidaFinanceiraGastosPage` | new | Ellen |
| vf_limite_conta | Limite da conta | `/vida-financeira/limites` | `VidaFinanceiraLimitesPage` | new | Ellen |
| vf_cartoes_faturas | Cartões: Faturas | `/vida-financeira/cartoes/faturas` | `VidaFinanceiraCartoesFaturasPage` | new | Ellen |
| vf_cartoes_parcelas | Cartões: Parcelas | `/vida-financeira/cartoes/parcelas` | `VidaFinanceiraCartoesParcelasPage` | new | Ellen |
| vf_cartoes_limites | Cartões: Limites | `/vida-financeira/cartoes/limites` | `VidaFinanceiraCartoesLimitesPage` | new | Ellen |
| vf_transacoes | Transações | `/vida-financeira/transacoes` | `VidaFinanceiraTransacoesPage` | new | Ellen |
| vf_fluxo_caixa | Fluxo de caixa | `/vida-financeira/fluxo-de-caixa` | `VidaFinanceiraFluxoCaixaPage` | new | Ellen |
| vf_assinaturas | Assinaturas | `/vida-financeira/assinaturas` | `VidaFinanceiraAssinaturasPage` | new | Ellen |
| vf_destaques | Destaques | `/vida-financeira/destaques` | `VidaFinanceiraDestaquesPage` | new | Ellen |
| vf_atualizar_modal | Atualizar dados | Dialog (desktop) ou Drawer (mobile) sobre vf_home | `VidaFinanceiraHomePage` (estado `atualizarAberto`) | new | Ellen |
| vf_nav | Item "Vida financeira" na navegação principal | bottom nav / sidebar, em todas as telas logadas | `App.tsx` | new | Ellen |

## 5) Spec por tela

### vf_home

- **Objetivo**: dar uma visão acionável e diária da vida financeira, não só um extrato.
- **Componentes**: box laranja com saldo total, contagem de bancos conectados, botão de
  atualizar dados e o acordeão "Saldo por banco" (lista por banco, "Conectar novo banco" ao
  final, abre com animação de altura em spring e bounce elástico, fica recuado dentro do mesmo
  padding dos dados de cima); card "Ritmo do mês" com valor comparado ao mês anterior, badge de
  aumento/redução, gráfico de linha com tooltip próprio e link "Ver detalhes"; carrossel
  "Destaques do mês" com até 4 cards de fatos determinísticos mais um card "Ver mais" quando há
  mais de 4; banner "Conheça o Saúde por Assinatura Pode Já", numa seção separada dos destaques;
  card "Cartão de crédito" com seletor de cartão, fatura total, barra de limite usado e o
  acordeão "Faturas, parcelas e limites" (mesma animação do Saldo por banco, só nesta tela); e um
  grupo secundário com os mini-cards Assinaturas e Limite da conta.
- **Estados obrigatórios**:
  - empty state: nenhum banco conectado, card único com a mensagem "Conecte um banco pra ver sua
    vida financeira" e CTA "Conectar banco".
  - default: um ou mais bancos conectados.
- **Dados**: lê `bancosConectados` e `saldoTotal` de `OpenFinanceContext`, mais os catálogos
  determinísticos por banco (cartões, limite de conta, ritmo de gastos). Nenhum valor é gerado
  aleatoriamente por sessão.
- **Regras de negócio**: estado aberto/fechado dos acordeões é local à sessão (não persiste);
  "Faturas, parcelas e limites" vira acordeão só nesta tela, as rotas internas de cartão
  continuam sempre abertas, porque servem de base pros próximos destaques de cartão.
- **Microcopy crítica**: "Saldo em todas as contas"; "Ritmo do mês"; "abaixo" / "acima";
  "Destaques do mês"; "Gaste menos com farmácia e exames" / "Conheça o Saúde por Assinatura Pode
  Já"; "Faturas, parcelas e limites"; "Limite da conta", com o tooltip "Isso é referente ao
  cheque especial da sua conta."
- **Acessibilidade mínima**: toda ação de acordeão ou navegação é um `<button>` nativo, nunca um
  botão aninhado em outro; alvo de toque mínimo de 44pt; nenhum estado depende só de cor (o
  badge de aumento/redução sempre tem ícone de tendência junto do texto; o valor do Limite da
  conta fica vermelho e mantém o prefixo "-").

### vf_destaques

- **Objetivo**: ver todos os destaques do mês, filtráveis por grupo.
- **Componentes**: filtro Segmented (Todos, Gastos, Cartões, Contas) e lista de cards com ícone,
  título, subtítulo e valor, cada um levando pra tela onde aquele dado já aparece.
- **Estados obrigatórios**: lista vazia por grupo ("Nenhum destaque nesse grupo").
- **Regras de negócio**: cada destaque é 100% determinístico a partir de um dado já existente em
  outra tela, nunca uma opinião ou sugestão gerada.
- **Microcopy crítica**: nome da tela é "Destaques", não "Insights": o ICP da Pode Já não tem
  familiaridade com o termo em inglês.

### vf_gastos

- **Objetivo**: detalhar o gasto do período selecionado, comparado ao anterior, por banco ou por
  categoria.
- **Componentes**: filtro de período (Semana, 1 mês, 6 meses, 1 ano); card de total gasto;
  gráfico (barra na semana, linha comparativa nos demais períodos); lista "Maiores gastos";
  alternância Por banco / Por categoria, com acordeão de subcategorias.
- **Regra de negócio**: "Farmácia" passou a ser categoria própria, antes ficava dentro de
  "Outros". É o dado que alimenta o destaque de farmácia e o banner de Saúde com um número real.

### vf_limite_conta

- **Objetivo**: mostrar o uso do cheque especial por conta, ao longo dos meses.
- **Componentes**: filtro por banco; gráfico de barras por mês, clicável; valor usado em
  destaque, sempre em vermelho e com prefixo "-"; percentual do limite; lista por banco quando o
  filtro é "Todos".
- **Regra de negócio**: catálogo cobre os 14 bancos do Open Finance. Antes só nubank e itaú
  tinham dado cadastrado, o que fazia qualquer outro banco conectado aparecer zerado. Corrigido
  nesta fase.

### vf_cartoes_faturas, vf_cartoes_parcelas, vf_cartoes_limites

- **Objetivo**: detalhar fatura atual, parcelamentos ativos e limite por cartão.
- **Componentes**: sub-navegação fixa (sticky) entre as 3 telas, sempre visível ao rolar.
- **Regra de negócio**: independem do acordeão da Home. Essas rotas continuam sempre abertas,
  servindo de base pros próximos destaques de cartão.

### vf_transacoes, vf_fluxo_caixa, vf_assinaturas

- **Objetivo**: respectivamente, listar lançamentos do mês com filtro por tipo; comparar entradas
  e saídas por período; acompanhar assinaturas recorrentes e identificar as em risco (ex.:
  período de teste perto de virar cobrança).
- **Padrão comum**: as três usam o mesmo tooltip de gráfico do módulo (nunca o tooltip padrão do
  recharts), pra manter a leitura consistente em qualquer gráfico da Vida financeira.

### vf_atualizar_modal

- **Objetivo**: deixar o usuário forçar a sincronização de um banco específico, com o limite
  diário sempre visível.
- **Componentes**: lista por banco (avatar, "atualizado há X" ou aviso de limite atingido,
  contador "restantes/3", botão de atualizar desabilitado no limite) e CTA final "Conectar novo
  banco".
- **Regra de negócio**: 3 atualizações por banco por dia. Ao atingir o limite na própria ação, um
  aviso aparece na hora, sem esperar a pessoa tentar de novo pra só então ser bloqueada.
- **Nota técnica**: o limite real da rede Open Finance Brasil é mensal (420 chamadas por mês pra
  saldo e limite de conta), não diário. O limite de 3 vezes por dia é decisão de produto, não um
  limite técnico confirmado. Falta confirmar se a Celcoin cobra algo a mais por chamada da Pode
  Já além desse limite de rede.

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| vf_nav | new | Novo item "Vida financeira" fixo na navegação principal | Abre a fase de insights do Open Finance | Acesso direto, sem depender de descobrir o caminho em Minha Conta |
| vf_home | new | Card "Ritmo do mês" como elemento principal, acima dos destaques | Pedido do Barreto: a home precisa ser acionável, não só informativa | Usuário entende de cara se precisa segurar o resto do mês |
| vf_home | new | Carrossel de destaques saiu do box laranja de saldo e desceu pra logo abaixo do Ritmo do mês | O Ritmo do mês virou o elemento principal, não deveria competir espaço com o saldo | Hierarquia visual mais clara |
| vf_home | new | Banner "Conheça o Saúde por Assinatura Pode Já", numa seção própria abaixo dos destaques | Pedido do Barreto de conectar Vida financeira a outros produtos Pode Já, sem usar um número de economia sem base | Cross-sell honesto, baseado num dado real do próprio usuário |
| vf_home | changed | "Saldo por banco" virou acordeão dentro do box laranja, com animação de altura em spring e bounce | Pedido da Ellen: reduzir o box sem esconder o dado, com uma abertura "viva" em vez de só trocar cor | Menos poluição visual no primeiro olhar, sem perder a informação |
| vf_home | changed | "Faturas, parcelas e limites" virou acordeão dentro do card de Cartão de crédito, só na Home | Mesmo motivo acima, mas mantendo as rotas internas sempre abertas, porque alimentam os próximos destaques de cartão | Home mais enxuta sem perder acesso aos dados |
| vf_home | fixed | "Limite da conta" passa a aparecer em vermelho quando há uso | É um saldo negativo (cheque especial usado), precisa ler como tal | Leitura mais correta do dado |
| vf_home / vf_gastos / vf_limites / vf_cartoes_* / vf_transacoes / vf_fluxo_caixa / vf_assinaturas | fixed | Tooltip de gráfico unificado em todas as telas com gráfico | Tooltip padrão do recharts tinha visual inconsistente entre telas | Leitura de gráfico consistente em qualquer tela do módulo |
| vf_gastos | fixed | "Farmácia" virou categoria própria (antes dentro de "Outros") | Precisava de um número real pra alimentar o destaque e o banner de Saúde | Dado honesto por trás do cross-sell, não um valor arbitrário |
| (contexto) | fixed | Saldo e limite de conta passam a cobrir os 14 bancos do Open Finance, não só nubank/itaú | Bug: conectar outro banco (ex.: Bradesco, BB) pra testar aparecia tudo zerado | Qualquer banco conectado reflete dado correto, sem exceção |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `vida_financeira_`
- Cobrir eventos de entrada, ação, sucesso e limite atingido.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| vida_financeira_viewed | Painel carregado | vf_home | vida_financeira | home | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, total_bancos_conectados | - | content-strategy | pending |
| vida_financeira_ritmo_detalhes_tapped | Toca "Ver detalhes" no Ritmo do mês | vf_home | vida_financeira | home | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| vida_financeira_saldo_por_banco_toggled | Abre ou fecha o acordeão Saldo por banco | vf_home | vida_financeira | home | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, aberto | - | content-strategy | pending |
| vida_financeira_cartao_opcoes_toggled | Abre ou fecha o acordeão Faturas/Parcelas/Limites | vf_home | vida_financeira | home | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, aberto | - | content-strategy | pending |
| vida_financeira_destaque_tapped | Toca um card de destaque | vf_home ou vf_destaques | vida_financeira | destaques | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, destaque_id, destino | - | content-strategy | pending |
| vida_financeira_destaques_ver_mais_tapped | Toca "Ver mais" no carrossel | vf_home | vida_financeira | destaques | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| vida_financeira_saude_banner_tapped | Toca o banner do Saúde por Assinatura | vf_home | vida_financeira | cross_sell_saude | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| vida_financeira_atualizar_opened | Abre o modal/drawer de atualizar dados | vf_atualizar_modal | vida_financeira | atualizar | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| vida_financeira_banco_atualizado | Atualiza um banco específico | vf_atualizar_modal | vida_financeira | atualizar | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, atualizacoes_restantes | - | content-strategy | pending |
| vida_financeira_atualizar_limite_atingido | Banco atinge o limite diário de atualização | vf_atualizar_modal | vida_financeira | atualizar | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| vida_financeira_conectar_banco_tapped | Toca "Conectar novo banco" a partir daqui | vf_home ou vf_atualizar_modal | vida_financeira | conectar | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, origem | - | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "vida_financeira_saude_banner_tapped",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-18T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "vida_financeira",
  "step_name": "cross_sell_saude",
  "screen_name": "vf_home"
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (entrada no painel, toggles de acordeão, destaque tocado,
  banner de Saúde tocado, atualizar e limite atingido).
- Conformidade de taxonomia >= 95% (snake_case, prefixo `vida_financeira_`).
- Completude de propriedades >= 95%.
- PII indevida = 0: nenhum valor monetário real do usuário (saldo, gasto, limite) em propriedade
  de evento, só ids e flags. Saldo e gasto são dados sensíveis, ficam só na tela.
- Latência p95 <= 30 min.

## 9) Impacto para PO/PM

- Impacto em escopo: abre a fase 2 do Open Finance (insights), depende da fase 1 (onboarding +
  gestão de dados, PRs #15 e #16) já estar mergeada, porque usa o mesmo `OpenFinanceContext`.
  Introduz o primeiro cross-sell entre Open Finance e Saúde por Assinatura: o time de Saúde por
  Assinatura deve estar ciente do banner antes de ir pra produção.
- Riscos e dependências: a claim de economia sugerida pelo Barreto ("até 80%") foi
  conscientemente deixada de fora por falta de base factual. Essa é uma decisão de produto
  registrada aqui, não um esquecimento, e precisaria de validação de compliance pra ser
  reconsiderada. O limite de 3 atualizações por dia por banco é decisão de UX, ainda sem
  confirmação técnica se a Celcoin cobra algo a mais por chamada feita pela Pode Já.
- Impacto esperado em métricas: frequência de abertura do app (a vida financeira muda todo dia,
  dá motivo de visita recorrente) e taxa de cliques pro Saúde por Assinatura a partir de um dado
  real do usuário, mais honesto que um banner genérico.
- Plano de rollout: liberar junto com a fase de gestão de dados, na mesma sequência de PRs (#15
  antes de #16, esta fase em seguida), assim que o backend confirmar a integração real com a
  Celcoin.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| A Celcoin cobra a mais por chamada além do limite da rede Open Finance Brasil (420/mês)? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O limite de 3 atualizações por dia por banco deveria ser configurável no futuro, ou fica fixo? | Ellen / Barreto | [A CONFIRMAR] | aberta |
| O time de Saúde por Assinatura precisa aprovar o copy e o posicionamento do banner antes de ir pra produção? | Ellen / Barreto | [A CONFIRMAR] | aberta |
| A personalização do painel (mostrar/ocultar cards) entra em qual fase? | Ellen | [A CONFIRMAR] | aberta |
| Algum stakeholder quer reconsiderar a claim de economia com farmácia, com um número real por trás? | Barreto | [A CONFIRMAR] | aberta |
