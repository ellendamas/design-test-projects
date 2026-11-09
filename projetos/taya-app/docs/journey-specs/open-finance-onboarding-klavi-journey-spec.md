---
agent: content-strategy
project: taya-app
journey: open-finance-onboarding-klavi
platform: Mobile
date: 2026-11-09
depends_on: [ux-research, visual-design, open-finance-klavi-comparacao]
status: draft
---

# Journey Spec - Open Finance real via Klavi (API Only) no cadastro

Este spec cobre a integração da opção "API Only" do protótipo de comparação na jornada
real de cadastro. Para o detalhamento completo de cada tela (componentes, microcopy,
acessibilidade), ver a seção 5 de
[open-finance-klavi-comparacao-journey-spec.md](./open-finance-klavi-comparacao-journey-spec.md)
— os componentes React são os mesmos, reaproveitados sem duplicação de arquivo. Este
documento cobre apenas o que muda ao sair do protótipo solto e entrar na jornada real.

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: a decisão de produto saiu (09/11/2026) — a integração
  com a Klavi vai ser via API, não via jornada hospedada pelo parceiro (Whitelabel). A
  jornada de conexão de banco no cadastro precisa refletir essa decisão.
- Resultado esperado para o usuário: ao criar conta ou tocar em "Conectar agora", o usuário
  passa a navegar pela jornada API Only (proposta de valor, seleção de instituição,
  confirmação de documento, autorização LGPD, transição para o banco, retorno) em vez da
  jornada genérica anterior.
- Impacto esperado para o negócio: a jornada de conexão bancária do onboarding passa a
  refletir o mecanismo real de consentimento da Klavi (CPF/CNPJ + LGPD como etapas
  explícitas), reduzindo o risco de retrabalho quando a integração de backend ficar pronta.

## 2) Escopo e contexto

- Tipo: mudança de roteamento/integração (telas já existiam como protótipo de comparação).
- Origem: decisão do Barreto (GPM) e do time de backend, após avaliação do protótipo
  comparativo e troca de mensagens com o Erasmo (tech) sobre como a API de Open Finance da
  Pode Já vai ser montada em cima da API da Klavi.
- Fora de escopo:
  - Qualquer alteração nos arquivos da jornada genérica anterior
    (`src/pages/open-finance/*`, `OpenFinanceContext.tsx`, `openFinanceData.ts`), que
    continuam intocados e acessíveis por URL direta (`/cadastro/selecionar-banco`,
    `/cadastro/guia-banco/:bancoId`, `/cadastro/conectando`, `/cadastro/conectado`),
    reservados para reaproveitamento com outro parceiro de Open Finance no futuro.
  - O protótipo de comparação solto (`/prototipos/open-finance-klavi/*`), que continua
    funcionando do mesmo jeito, sem gate de login, para referência futura.
  - Integração real com a API da Klavi (telas continuam com dados mockados; backend ainda
    não confirmou os detalhes finais do consentimento).
  - Etapa de consentimento tratada como estável: o Erasmo sinalizou que pode ainda mudar
    pra um modelo híbrido (parte do consentimento acontecendo num ambiente seguro do
    parceiro). Isso não foi incorporado aqui — ver open questions.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| of_intro | Entender o valor de conectar o banco | CTA "Conectar agora" (dashboard) ou passo 5 do onboarding | of_intro | Decide conectar ou pular |
| of_selecionar | Escolher o banco | CTA "Conectar meu banco" | of_selecionar | Seleciona um banco disponível |
| of_documento | Confirmar CPF ou CNPJ | Seleção de um banco disponível | of_documento | Documento preenchido |
| of_lgpd | Autorizar compartilhamento (LGPD) | CTA "Continuar" | of_lgpd | Checkbox marcado e autorizado |
| of_transicao | Entender os passos no app do banco | CTA "Autorizar e continuar" | of_transicao | Confirma que entendeu os passos |
| of_retorno | Saber o resultado da conexão e seguir | CTA "Entendi, vamos lá" (simula retorno) | of_retorno | Vê sucesso, erro ou cancelamento; banco entra em `OpenFinanceContext` se sucesso |

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente (reaproveitado) | status | owner |
|---|---|---|---|---|---|
| of_intro | Open Finance: proposta de valor | `/cadastro/open-finance` | `KlaviApiIntroPage` | changed (rota realocada da `OpenFinanceValuePage`) | Ellen |
| of_selecionar | Open Finance: seleção de instituição | `/cadastro/open-finance/selecionar-instituicao` | `KlaviApiSelecionarInstituicaoPage` | new (rota) | Ellen |
| of_documento | Open Finance: confirmação de documento | `/cadastro/open-finance/confirmar-documento` | `KlaviApiConfirmarDocumentoPage` | new (rota) | Ellen |
| of_lgpd | Open Finance: autorização LGPD | `/cadastro/open-finance/autorizacao-lgpd` | `KlaviApiAutorizacaoLgpdPage` | new (rota) | Ellen |
| of_transicao | Open Finance: transição para o banco | `/cadastro/open-finance/transicao-banco` | `KlaviApiTransicaoBancoPage` | new (rota) | Ellen |
| of_retorno | Open Finance: retorno e resultado | `/cadastro/open-finance/retorno` | `KlaviApiRetornoPage` | new (rota) | Ellen |

## 5) O que muda por tela em relação ao protótipo de comparação

Todas as telas usam exatamente os mesmos componentes do protótipo em
`src/pages/open-finance-klavi/api-only/`. Um hook (`useOpenFinanceApiBase`, no mesmo
diretório) detecta pela rota atual (`/cadastro/open-finance/...` vs
`/prototipos/open-finance-klavi/api-only/...`) se está na jornada real ou no protótipo
solto, e ajusta:

- **of_intro**: no modo real, troca o botão de voltar (que não faz sentido fora do
  protótipo) por uma barra de progresso "Passo 4 de 5" igual à `OpenFinanceValuePage`
  antiga, e adiciona o link "Prefiro fazer isso depois" (grava
  `openfinance_pendente` e volta pro cadastro ou painel).
- **of_selecionar, of_documento, of_lgpd, of_transicao**: sem mudança de conteúdo, só os
  `navigate()` internos passam a apontar para as rotas reais em vez das rotas de
  protótipo.
- **of_retorno**: no sucesso, chama `connectBankById` do `OpenFinanceContext` de verdade
  (o protótipo solto nunca grava no contexto real, só a jornada real faz isso). Os CTAs
  finais passam a ser "Conectar outro banco" (volta pra seleção) e "Ir para o início"
  (`/cadastro` com `step: 5` se for onboarding, ou `/painel`), replicando o padrão da
  `OpenFinanceConnectedPage` antiga. Nos estados de erro/cancelado, o botão "Fazer isso
  depois" também usa o padrão real de pular (`openfinance_pendente` + navegação
  condicional), em vez de voltar pra tela de comparação.
- Copy da etapa LGPD foi ajustada (nesta mesma rodada, afeta os dois modos por ser o
  mesmo componente): a linha sobre prazo de retenção deixou de dizer "enquanto a
  autorização estiver ativa" e passou a dizer "por um prazo determinado, que você
  confirma antes de autorizar" — reflete a confirmação do backend de que o prazo não é
  indeterminado, sem afirmar um número de meses que ainda não foi fechado oficialmente.

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| of_intro | changed | `/cadastro/open-finance` passa a montar `KlaviApiIntroPage` em vez de `OpenFinanceValuePage` | Decisão de integrar via API da Klavi (API Only) | Onboarding reflete o fluxo real de consentimento desde a primeira tela |
| of_selecionar..of_transicao | new (rota) | Telas novas no fluxo real, reaproveitando componentes já existentes no protótipo | Mesma decisão acima | Fluxo completo de 6 telas substitui o fluxo antigo de 5 telas no caminho padrão |
| of_retorno | changed | Liga ao `OpenFinanceContext` de verdade; CTAs finais seguem o padrão da tela antiga equivalente | Sucesso real precisa refletir no dashboard (saldo, vida financeira) | Dashboard e "bancos conectados" passam a funcionar com a nova jornada |
| (jornada genérica) | removed (do caminho padrão, arquivos preservados) | Deixa de ser o destino de qualquer CTA do app | Substituída pela jornada Klavi API Only | Acessível só por URL direta; reservada para outro parceiro |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `openfinance_cadastro_` para diferenciar da telemetria do protótipo de
  comparação (`openfinance_klavi_*`, ver journey-spec da comparação), já que esta é a
  jornada real de produção, não uma ferramenta de decisão interna.
- Cobrir eventos de entrada, ação, sucesso, erro e cancelamento.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| openfinance_cadastro_intro_viewed | Tela de proposta de valor carregada | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_connect_started | CTA "Conectar meu banco" | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_skipped | CTA "Prefiro fazer isso depois" (intro) | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_institution_selected | Clique em um banco disponível | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_institution_unavailable | Clique em banco indisponível (toast "Em breve") | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_document_confirmed | CTA "Continuar" na confirmação de documento | of_documento | openfinance_cadastro | confirmar_documento | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_lgpd_authorized | CTA "Autorizar e continuar" com checkbox marcado | of_lgpd | openfinance_cadastro | autorizacao_lgpd | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_bank_transition_confirmed | CTA "Entendi, vamos lá" | of_transicao | openfinance_cadastro | transicao_banco | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_pending | Entrada na tela de retorno, estado "confirmando" | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_succeeded | Resultado assíncrono = sucesso; grava em OpenFinanceContext | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, total_bancos_conectados | - | content-strategy | pending |
| openfinance_cadastro_connection_failed | Resultado assíncrono = erro | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result | - | content-strategy | pending |
| openfinance_cadastro_connection_cancelled | Resultado assíncrono = cancelado | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result | - | content-strategy | pending |
| openfinance_cadastro_connection_retry_started | CTA "Tentar novamente" (erro ou cancelado) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_another_bank_started | CTA "Conectar outro banco" (sucesso) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "openfinance_cadastro_connection_succeeded",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-09T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "openfinance_cadastro",
  "step_name": "retorno",
  "screen_name": "of_retorno",
  "institution_id": "nubank",
  "connection_result": "sucesso",
  "total_bancos_conectados": 2
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (entrada, início de conexão, cada desfecho de
  retorno, retry, pular)
- Conformidade de taxonomia >= 95% (snake_case, prefixo `openfinance_cadastro_`, distinto
  do prefixo `openfinance_klavi_` usado no protótipo de comparação)
- Completude de propriedades >= 95%
- PII indevida = 0 (nenhum CPF/CNPJ real em propriedade de evento; o campo de documento é
  mockado neste protótipo e não deve ser enviado como propriedade)
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

- Impacto em escopo: a jornada de conexão bancária do cadastro muda de 5 para 6 telas, com
  duas etapas novas e visíveis ao usuário (confirmação de documento, autorização LGPD).
- Riscos e dependências: depende da confirmação final do backend (Erasmo) sobre como o
  consentimento vai funcionar de verdade — se o modelo permanecer 100% via API ou se parte
  dele precisar de um ambiente seguro do parceiro, as telas `of_lgpd`/`of_transicao` podem
  mudar de novo. Depende também de definição sobre a origem do avatar do banco (API da
  Klavi vs. SVGs próprios).
- Impacto esperado em métricas: possível aumento no tempo da etapa de conexão bancária
  (mais telas) e possível impacto na taxa de conclusão — recomenda-se medir via os eventos
  desta tabela antes/depois do lançamento.
- Plano de rollout: liberar como parte do onboarding assim que o backend confirmar a
  integração; a jornada genérica anterior fica preservada e pode ser reativada trocando o
  componente montado em `/cadastro/open-finance` caso a decisão mude.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| O consentimento vai ficar 100% em telas nossas, ou uma parte (ex.: `of_lgpd`/`of_transicao`) vai precisar levar o usuário a um ambiente seguro do parceiro? Se sim, isso acontece sem sair do app (iframe/webview/SDK) ou é redirect de verdade? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| Qual é, de fato, o prazo de retenção do consentimento (ex.: 12 meses foi citado como exemplo, não confirmado)? | Backend / Jurídico | [A CONFIRMAR] | aberta |
| O avatar do banco em `of_selecionar` vem pela API da Klavi ou a Pode Já precisa manter uma base própria de SVGs por banco? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| A lista de bancos disponíveis (tier 1) muda com o catálogo real de instituições da Klavi? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| Qual deve ser o estado vazio da busca em `of_selecionar` quando nenhum resultado é encontrado? Ainda não tem copy definida (herdado do protótipo). | Ellen | [A CONFIRMAR] | aberta |
| "Conectar outro banco" deveria reexibir os bancos já conectados (como a jornada antiga fazia com `modo=adicionar`)? Não foi implementado nesta rodada. | Ellen | [A CONFIRMAR] | aberta |
