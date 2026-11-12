---
agent: content-strategy
project: taya-app
journey: open-finance-onboarding-celcoin
platform: Mobile
date: 2026-11-12
depends_on: [ux-research, visual-design, open-finance-klavi-comparacao]
status: draft
---

# Journey Spec - Open Finance real via API no cadastro (parceiro: Celcoin)

**O parceiro de Open Finance é a Celcoin.** A Klavi foi avaliada antes (o Erasmo confirmou
que a API de insights dela era restrita demais) e descartada em 12/11/2026: não é mais a
direção do projeto. Pesquisei a documentação pública da Celcoin
(developers.celcoin.com.br/docs/marcas-no-open-finance e páginas relacionadas de
consentimento e diretório de marcas) e isso moldou a jornada descrita aqui: ver seção 5 e
open questions.

**Nota pros devs**: os nomes de arquivo e de componente no código ainda usam o prefixo
`Klavi` (ex.: `KlaviApiIntroPage`), porque foram criados durante a avaliação inicial, antes
da decisão por Celcoin, e ainda não foram renomeados. Isso é só nomenclatura de código
interna, não indica que o parceiro ainda é a Klavi. Avise a Ellen se quiser que esses nomes
sejam atualizados antes de virar PR.

Este spec cobre a integração via API na jornada real de cadastro. Para o detalhamento
completo de cada tela (componentes, microcopy, acessibilidade), ver a seção 5 de
[open-finance-klavi-comparacao-journey-spec.md](./open-finance-klavi-comparacao-journey-spec.md).
Esse outro documento é o registro histórico da comparação entre as duas opções da Klavi
(Whitelabel vs. API Only), mantido como referência; os componentes React usados na jornada
real descrita aqui são os mesmos dali, reaproveitados sem duplicação de arquivo. Este
documento cobre o que muda ao sair do protótipo solto e entrar na jornada real.

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: a jornada de conexão de banco no cadastro precisa
  refletir o mecanismo real de consentimento do parceiro de Open Finance escolhido
  (Celcoin), via API.
- Resultado esperado para o usuário: ao criar conta ou tocar em "Conectar agora", o usuário
  passa a navegar pela jornada via API (proposta de valor, seleção de instituição,
  instrução de como funciona no banco, retorno) em vez da jornada genérica anterior.
- Impacto esperado para o negócio: a jornada de conexão bancária do onboarding passa a
  refletir o mecanismo real de consentimento da Celcoin — o usuário é redirecionado pra
  autorizar diretamente na tela do próprio banco, não numa tela nossa de LGPD — reduzindo
  o risco de retrabalho quando a integração de backend ficar pronta.

## 2) Escopo e contexto

- Tipo: mudança de roteamento/integração (telas já existiam como protótipo de comparação).
- Origem: decisão do Barreto (GPM) e do time de backend, após avaliação do protótipo
  comparativo e troca de mensagens com o Erasmo (tech) sobre como a API de Open Finance da
  Pode Já vai ser montada. Revisado em 12/11/2026 após a troca de parceiro para Celcoin.
- Fora de escopo:
  - Qualquer alteração nos arquivos da jornada genérica anterior
    (`src/pages/open-finance/*`, `OpenFinanceContext.tsx`, `openFinanceData.ts`), que
    continuam intocados e acessíveis por URL direta (`/cadastro/selecionar-banco`,
    `/cadastro/guia-banco/:bancoId`, `/cadastro/conectando`, `/cadastro/conectado`),
    reservados para reaproveitamento com outro parceiro de Open Finance no futuro.
  - O protótipo de comparação solto (`/prototipos/open-finance-klavi/*`), que continua
    funcionando do mesmo jeito, sem gate de login, para referência futura. Ele não foi
    atualizado para refletir a Celcoin: continua mostrando a cadeia antiga
    (documento → LGPD) como registro histórico da comparação original.
  - Integração real com a API da Celcoin (telas continuam com dados mockados: a API de
    diretório de instituições exige autenticação que não temos pra simular de verdade,
    ver seção 5).
  - Dados e insights que o Open Finance traz depois de conectado (próxima fase, por pedido
    da Ellen em 12/11/2026 — foco desta rodada é só o onboarding).

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| of_intro | Entender o valor de conectar o banco | CTA "Conectar agora" (dashboard) ou passo 3 do onboarding (MFA) | of_intro | Decide conectar ou pular |
| of_selecionar | Escolher o banco | CTA "Conectar meu banco" | of_selecionar | Seleciona um banco da lista |
| of_transicao | Entender os passos no banco | Seleção de um banco | of_transicao | Confirma que entendeu os passos |
| of_retorno | Saber o resultado da conexão e seguir | CTA "Entendi, vamos lá" (simula retorno) | of_retorno | Vê sucesso, erro ou cancelamento; banco entra em `OpenFinanceContext` se sucesso |

**Removido nesta atualização (12/11/2026)**: as etapas `of_documento` (confirmação de
CPF/CNPJ) e `of_lgpd` (autorização LGPD numa tela nossa) saíram da jornada real. Pela doc da
Celcoin, quem autoriza de verdade o compartilhamento é a própria tela do banco, depois do
redirecionamento (não existe uma etapa de consentimento renderizada por nós ou pela Celcoin).
As telas continuam existindo e reacessíveis só no protótipo de comparação solto, como
registro de como seria com a Klavi.

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente (reaproveitado) | status | owner |
|---|---|---|---|---|---|
| of_intro | Open Finance: proposta de valor | `/cadastro/open-finance` | `KlaviApiIntroPage` | changed (rota realocada da `OpenFinanceValuePage`) | Ellen |
| of_selecionar | Open Finance: seleção de instituição | `/cadastro/open-finance/selecionar-instituicao` | `KlaviApiSelecionarInstituicaoPage` | changed (lista de bancos trocada pro formato da API da Celcoin) | Ellen |
| of_transicao | Open Finance: instrução de como funciona no banco | `/cadastro/open-finance/transicao-banco` | `KlaviApiTransicaoBancoPage` | changed (ilustração removida; agora é a última tela antes do redirecionamento, sem etapa de LGPD antes) | Ellen |
| of_retorno | Open Finance: retorno e resultado | `/cadastro/open-finance/retorno` | `KlaviApiRetornoPage` | changed (nome do banco e avatar vêm do formato Celcoin) | Ellen |
| ~~of_documento~~ | ~~Confirmação de documento~~ | removida da rota real (12/11/2026) | `KlaviApiConfirmarDocumentoPage` | removed do fluxo real; preservada só no protótipo de comparação | Ellen |
| ~~of_lgpd~~ | ~~Autorização LGPD~~ | removida da rota real (12/11/2026) | `KlaviApiAutorizacaoLgpdPage` | removed do fluxo real; preservada só no protótipo de comparação | Ellen |

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
- **of_selecionar**: a lista de bancos passa a usar `celcoinBrandsData.ts` (novo arquivo),
  que espelha campo a campo a resposta real da API de Discovery da Celcoin
  (`CustomerFriendlyName`, `CustomerFriendlyLogoUri`, flags de suporte a PF/PJ). Tentei
  consumir a API de verdade pra pegar logos reais, mas ela exige autenticação que não
  temos aqui (retornou 401 no teste). Os dados ficaram mockados nesse mesmo formato, com
  `customerFriendlyLogoUri: null` em todos os itens: os devs precisam trocar isso pela
  chamada real em produção. Enquanto isso, a tela mostra um ícone genérico de banco no
  lugar do logo. Também sumiu a distinção "banco disponível / em breve": a lista real da
  Celcoin só devolve instituições que participam de verdade, então todo item da lista é
  clicável. No modo real, ao escolher um banco, pula direto pra `of_transicao` (sem
  `of_documento` nem `of_lgpd` no meio). No protótipo solto, mantém a cadeia antiga.
- **of_transicao**: perdeu o bloco de ilustração por banco ("Ilustração em breve") — a
  Ellen decidiu tirar porque exigiria buscar uma imagem de cada banco, trabalho demais
  pro valor que agrega. Ficou só o passo a passo em texto. No modo real, o botão de voltar
  leva direto pra `of_selecionar` (sem `of_lgpd` no meio). O passo a passo detalhado
  continua só pros 5 bancos em destaque (`instrucoesPorBanco` em `celcoinBrandsData.ts`);
  qualquer outro banco usa um texto genérico, porque não é viável manter instrução
  específica pra cada instituição da lista real.
- **of_retorno**: no sucesso, chama `connectBankById` do `OpenFinanceContext` de verdade
  (o protótipo solto nunca grava no contexto real, só a jornada real faz isso). Como a
  lista de bancos agora inclui instituições fora das 5 fixas do `OpenFinanceContext`,
  `connectBankById` passou a aceitar o nome do banco como segundo parâmetro, pra
  funcionar com qualquer item da lista, não só os 5 originais. Os CTAs finais são
  "Conectar outro banco" (volta pra seleção) e "Ir para o início" (`/cadastro` ou
  `/painel`), replicando o padrão da `OpenFinanceConnectedPage` antiga. O nome e o avatar
  do banco exibidos vêm do formato Celcoin (nome + logo genérico, sem cor nem inicial).
  Além de sucesso, agora cobre mais 3 resultados reais da Celcoin, todos simuláveis por
  parâmetro de URL em vez de variável interna, a pedido da Ellen:
  `?resultado=sucesso|parcial|nao_autorizado|falha_tecnica` e `?tentativas=N` (a partir de 3,
  mostra um card de "falar com o suporte", mesmo padrão usado na escalação da confirmação de
  identidade do onboarding). `parcial` cobre o 403 "no resource allowed" documentado pela
  Celcoin (consentimento aprovado, mas nem todos os dados liberados); `nao_autorizado`
  reconhece que a Celcoin não distingue recusa explícita de simples não resposta a tempo
  (mesmo status REJECTED pros dois); `falha_tecnica` cobre quando o banco já autorizou mas a
  troca do código pelo token falha do nosso lado, pra não jogar a culpa no banco à toa.
- **of_selecionar** ganhou simulação de bancos já conectados via `?jaConectado=nubank,itau`
  ou `?jaConectado=todos`, e clicar num banco já conectado não navega mais: só mostra um
  toast avisando. Antes disso a jornada deixava repetir a conexão de um banco já conectado
  sem necessidade.

> **Regra de negócio obrigatória para `nao_autorizado` e `falha_tecnica` (confirmada pela
> Ellen em 12/11/2026):** sempre oferecer "tentar novamente" primeiro. Só depois de um número
> de tentativas seguidas falhando (no protótipo, 3 — número ainda não validado, ver open
> questions) é que aparece a opção de falar com o suporte. Não é pra pular direto pro suporte
> na primeira falha, nem pra deixar a pessoa tentando pra sempre sem alternativa. Essa regra
> precisa estar implementada no backend/contagem de tentativas, não só na tela: o protótipo
> simula isso por parâmetro de URL (`?tentativas=N`), mas em produção isso tem que vir de uma
> contagem real de tentativas da sessão/consentimento.

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| of_intro | changed | `/cadastro/open-finance` passa a montar `KlaviApiIntroPage` em vez de `OpenFinanceValuePage` | Decisão de integrar via API | Onboarding reflete o fluxo real de consentimento desde a primeira tela |
| of_selecionar | changed | Lista de bancos no formato da API da Celcoin (logo real pendente); sem distinção "disponível/em breve"; pula direto pra `of_transicao` | Troca de parceiro (Klavi → Celcoin) e decisão de simular o formato real da API | Picker fica mais realista pros devs se basearem; um passo a menos até o redirecionamento |
| of_transicao | changed | Removida a ilustração por banco; vira a última tela antes de sair da Pode Já | Custo de manter ilustração por banco; LGPD não é mais etapa nossa | Tela mais simples; expectativa correta de que o próximo passo é sair do app |
| of_retorno | changed | Liga ao `OpenFinanceContext` de verdade (agora aceita qualquer banco, não só os 5 fixos); nome/avatar vêm do formato Celcoin | Sucesso real precisa refletir no dashboard; lista de bancos deixou de ser fixa | Dashboard e "bancos conectados" funcionam com qualquer banco da lista |
| of_documento, of_lgpd | removed (do caminho padrão, arquivos e rota de protótipo preservados) | Saem do fluxo real | Celcoin: quem autoriza de verdade é a tela do próprio banco, não uma etapa nossa | Fluxo real cai de 6 para 4 telas (intro, selecionar, transição, retorno) |
| (jornada genérica) | removed (do caminho padrão, arquivos preservados) | Deixa de ser o destino de qualquer CTA do app | Substituída pela jornada via API | Acessível só por URL direta; reservada para outro parceiro |

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
| openfinance_cadastro_institution_selected | Clique em um banco da lista | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_bank_transition_confirmed | CTA "Entendi, vamos lá" | of_transicao | openfinance_cadastro | transicao_banco | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_pending | Entrada na tela de retorno, estado "confirmando" | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_succeeded | Resultado = sucesso; grava em OpenFinanceContext | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, total_bancos_conectados | - | content-strategy | pending |
| openfinance_cadastro_connection_partial | Resultado = parcial (403 "no resource allowed" da Celcoin); grava em OpenFinanceContext mesmo assim | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result | - | content-strategy | pending |
| openfinance_cadastro_connection_unauthorized | Resultado = nao_autorizado (a Celcoin não distingue recusa explícita de timeout) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_connection_technical_error | Resultado = falha_tecnica (falha nossa depois da autorização no banco) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_support_escalation_shown | Card de suporte exibido (attempt_number >= 3) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_already_connected_tapped | Clique num banco já conectado (sem navegar, só aviso) | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
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

- Impacto em escopo: a jornada de conexão bancária do cadastro passa a ter 4 telas (proposta
  de valor, seleção de instituição, instrução do banco, retorno), 2 a menos do que a versão
  anterior desta mesma rodada (que tinha confirmação de documento e autorização LGPD como
  etapas nossas). A etapa de autorização passa a acontecer na própria tela do banco, fora
  do nosso controle visual.
- Riscos e dependências: depende da confirmação do Erasmo sobre vários pontos técnicos da
  Celcoin que a documentação pública não deixou claros (ver open questions) — prazo de
  consentimento, onde a revogação acontece, se o redirecionamento abre o app nativo do
  banco ou só uma página web, e se o diretório de instituições que encontrei (sob
  `/open/itp/`) é o mesmo usado para consentimento de dados.
- Impacto esperado em métricas: menos telas antes do redirecionamento pode melhorar a taxa
  de conclusão dessa etapa em relação à versão anterior (6 telas) — recomenda-se medir via
  os eventos desta tabela antes/depois do lançamento.
- Plano de rollout: liberar como parte do onboarding assim que o backend confirmar a
  integração; a jornada genérica anterior fica preservada e pode ser reativada trocando o
  componente montado em `/cadastro/open-finance` caso a decisão mude.

## 10) Open questions

Lista compilada em 12/11/2026 para endereçar ao Erasmo de uma vez, depois de finalizado o
estudo da documentação da Celcoin.

| pergunta | owner | prazo | status |
|---|---|---|---|
| Qual é o prazo de retenção/validade do consentimento que a Pode Já vai usar? A API da Celcoin aceita até 1 ano no máximo (`expirationDateTime`), mas não fica claro se é a Pode Já quem fixa esse valor ao criar o consentimento, ou se o usuário escolhe. | Erasmo (backend) | [A CONFIRMAR] | aberta |
| Onde o usuário revoga o consentimento? A API tem um endpoint de revogação (`DELETE /consents/{id}`), mas não ficou claro se isso acontece só dentro do app do banco, ou se a Pode Já vai expor um botão de "desconectar banco" que chama essa API em nome do usuário (nossa copy hoje promete "direto na Pode Já"). | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O redirecionamento pro banco (`authorizationUrl`) abre o app nativo do banco no celular, ou é sempre uma página web (login do banco no navegador)? Isso muda a copy de expectativa que usamos em `of_transicao` ("o app ou o site do seu banco vai abrir"). | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O diretório de instituições que encontrei na documentação pública (`GET /open/itp/participants/brands`) é o mesmo catálogo usado para o consentimento de dados (`/open/dat/`), ou é um catálogo separado, específico de pagamentos (ITP)? Preciso confirmar antes de pedir pros devs ligarem a tela de seleção nele. | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O logo de cada banco (`CustomerFriendlyLogoUri`) vem pronto da API, em que formato? A tela de seleção está mockada com um ícone genérico até isso ser confirmado. | Erasmo (backend) | [A CONFIRMAR] | aberta |
| Qual deve ser o estado vazio da busca em `of_selecionar` quando nenhum resultado é encontrado? Ainda não tem copy definida (herdado do protótipo). | Ellen | [A CONFIRMAR] | aberta |
| "Conectar outro banco" deveria reexibir os bancos já conectados (como a jornada antiga fazia com `modo=adicionar`)? Não foi implementado nesta rodada. | Ellen | [A CONFIRMAR] | aberta |
| O limite de 3 tentativas pra mostrar o card de suporte em `of_retorno` (`SUPPORT_THRESHOLD`) foi um número que escolhi sem validar com ninguém. Esse número faz sentido, ou tem algum dado de produção sobre quantas tentativas as pessoas costumam fazer antes de desistir? | Ellen / Erasmo | [A CONFIRMAR] | aberta |
| Quando o resultado é `parcial` (banco aprovou, mas não liberou todos os dados), a Pode Já consegue saber especificamente qual dado faltou, pra avisar o usuário com mais precisão, ou só sabe que faltou algo? | Erasmo (backend) | [A CONFIRMAR] | aberta |
