---
agent: content-strategy
project: taya-app
journey: open-finance-onboarding-celcoin
platform: Mobile
date: 2026-11-12
depends_on: [ux-research, visual-design]
status: draft
---

# Journey Spec - Open Finance real via API no cadastro (parceiro: Celcoin)

O parceiro de Open Finance da Pode Já é a Celcoin. A integração é via API: a Pode Já constrói
a tela de seleção de instituição; quem autoriza o compartilhamento de dados de verdade é a
própria tela do banco, depois de um redirecionamento, não uma tela nossa. Pesquisei a
documentação pública da Celcoin (developers.celcoin.com.br/docs/marcas-no-open-finance e
páginas relacionadas de consentimento e diretório de marcas) e isso moldou a jornada descrita
aqui: ver seção 5 e open questions.

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: a jornada de conexão de banco no cadastro precisa
  refletir o mecanismo real de consentimento da Celcoin, via API.
- Resultado esperado para o usuário: ao criar conta ou tocar em "Conectar agora", o usuário
  navega por uma jornada curta (proposta de valor, seleção de instituição, instrução de como
  funciona no banco, retorno) em vez da jornada genérica anterior.
- Impacto esperado para o negócio: a jornada de conexão bancária do onboarding passa a
  refletir o mecanismo real de consentimento da Celcoin. O usuário é redirecionado pra
  autorizar diretamente na tela do próprio banco, não numa tela nossa de LGPD, reduzindo o
  risco de retrabalho quando a integração de backend ficar pronta.

## 2) Escopo e contexto

- Tipo: nova jornada de conexão bancária no cadastro, substituindo a jornada genérica
  anterior no caminho padrão.
- Origem: decisão do Barreto (GPM) e do time de backend, depois de troca de mensagens com o
  Erasmo (tech) sobre como a API de Open Finance da Pode Já vai ser montada em cima da API da
  Celcoin.
- Fora de escopo:
  - Qualquer alteração nos arquivos da jornada genérica anterior
    (`src/pages/open-finance/*`, `OpenFinanceContext.tsx`, `openFinanceData.ts`), que
    continuam intocados e acessíveis por URL direta (`/cadastro/selecionar-banco`,
    `/cadastro/guia-banco/:bancoId`, `/cadastro/conectando`, `/cadastro/conectado`),
    reservados para reaproveitamento com outro parceiro de Open Finance no futuro.
  - Integração real com a API da Celcoin (telas continuam com dados mockados: a API de
    diretório de instituições exige autenticação que não temos pra simular de verdade, ver
    seção 5).
  - Dados e insights que o Open Finance traz depois de conectado (próxima fase, por pedido
    da Ellen em 12/11/2026: foco desta rodada é só o onboarding).

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| of_intro | Entender o valor de conectar o banco | CTA "Conectar agora" (dashboard) ou passo 3 do onboarding (MFA) | of_intro | Decide conectar ou pular |
| of_selecionar | Escolher o banco | CTA "Conectar meu banco" | of_selecionar | Seleciona um banco da lista |
| of_transicao | Entender os passos no banco | Seleção de um banco | of_transicao | Confirma que entendeu os passos |
| of_retorno | Saber o resultado da conexão e seguir | CTA "Entendi, vamos lá" (volta do banco) | of_retorno | Vê sucesso, parcial, não autorizado ou falha técnica; banco entra em `OpenFinanceContext` se sucesso ou parcial |

Pela doc da Celcoin, quem autoriza de verdade o compartilhamento é a própria tela do banco,
depois do redirecionamento: não existe uma etapa de consentimento ou confirmação de
documento renderizada por nós.

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente | status | owner |
|---|---|---|---|---|---|
| of_intro | Open Finance: proposta de valor | `/cadastro/open-finance` | `OpenFinanceIntroPage` | new | Ellen |
| of_selecionar | Open Finance: seleção de instituição | `/cadastro/open-finance/selecionar-instituicao` | `OpenFinanceSelecionarInstituicaoPage` | new | Ellen |
| of_transicao | Open Finance: instrução de como funciona no banco | `/cadastro/open-finance/transicao-banco` | `OpenFinanceTransicaoBancoPage` | new | Ellen |
| of_retorno | Open Finance: retorno e resultado | `/cadastro/open-finance/retorno` | `OpenFinanceRetornoPage` | new | Ellen |

Arquivos em `src/pages/open-finance-celcoin/`. `celcoinBrandsData.ts`, no mesmo diretório,
tem os dados mockados de instituições e os textos de instrução por banco (ver seção 5).

## 5) Spec por tela

### of_intro

- **Objetivo**: explicar o valor de conectar o banco antes de pedir a ação.
- **Componentes**: banner com gradiente + foto (elementos remontados do Figma, texto real
  pra ficar responsivo, não uma imagem com texto embutido), lista de benefícios num único
  box com divisórias, alerta "Somente leitura" em destaque, CTA fixo no rodapé (sem fundo
  branco atrás, flutuante) e link "Prefiro fazer isso depois".
- **Regras de negócio**: "Prefiro fazer isso depois" grava `openfinance_pendente` no
  localStorage e volta pro cadastro (retomando o passo certo) ou pro painel.
- **Microcopy crítica**: CTA primário "Conectar meu banco"; secundário "Prefiro fazer isso
  depois".

### of_selecionar

- **Objetivo**: escolher o banco a conectar.
- **Componentes**: busca, lista de bancos em destaque + "Outros bancos", cada item com
  logo (ou ícone genérico de fallback) e tag "Conectado" quando aplicável.
- **Dados**: `celcoinBrandsData.ts` espelha campo a campo a resposta real da API de
  Discovery da Celcoin (`CustomerFriendlyName`, `CustomerFriendlyLogoUri`, flags de suporte
  a PF/PJ). Tentei consumir a API de verdade pra pegar logos reais, mas ela exige
  autenticação que não temos aqui (retornou 401 no teste). Os dados ficaram mockados nesse
  mesmo formato, com `customerFriendlyLogoUri: null` em todos os itens: os devs precisam
  trocar isso pela chamada real em produção.
- **Regras de negócio**: não existe mais a distinção "banco disponível / em breve". A lista
  real da Celcoin só devolve instituições que participam de verdade, então todo item é
  clicável. Clicar num banco já conectado não navega: mostra um toast avisando
  ("Você já conectou o {banco}."). Ao escolher um banco não conectado, pula direto pra
  `of_transicao`.
- **Simulação (DESIGN ONLY, por parâmetro de URL)**: `?jaConectado=nubank,itau` ou
  `?jaConectado=todos` simula bancos já conectados, pra testar a tag e o clique sem precisar
  passar pela jornada de verdade antes.

### of_transicao

- **Objetivo**: preparar o usuário pro redirecionamento ao banco.
- **Componentes**: banner com fundo sólido + ilustração (elementos remontados do Figma, texto
  real), passo a passo num único box com divisórias, alerta sobre sair da Pode Já.
- **Dados**: o passo a passo detalhado (`instrucoesPorBanco` em `celcoinBrandsData.ts`) só
  existe pros 5 bancos em destaque; qualquer outro banco usa um texto genérico, porque não é
  viável manter instrução específica pra cada instituição da lista real. Não tem ilustração
  por banco: exigiria uma imagem de cada instituição, custo que a Ellen decidiu não valer a
  pena.
- **Microcopy crítica**: CTA "Entendi, vamos lá".

### of_retorno

- **Objetivo**: informar o resultado da conexão e dar o próximo passo.
- **Componentes**: estado "confirmando" (gradiente laranja, pulso) antes de qualquer
  resultado; depois, um dos 4 estados abaixo.
- **Regras de negócio**: no sucesso ou parcial, chama `connectBankById` do
  `OpenFinanceContext` de verdade, aceitando qualquer banco da lista (não só os 5 fixos do
  mock original). CTAs de sucesso: "Conectar outro banco" (volta pra seleção) e "Ir para o
  início" (`/cadastro`, retomando o passo certo, ou `/painel`).
- **Estados obrigatórios** (os 4 resultados vêm do que a doc da Celcoin realmente expõe, não
  de suposição, e são simuláveis por parâmetro de URL, não por variável interna):
  - `sucesso` (default): consentimento aprovado com todos os dados liberados.
  - `parcial`: existe um erro específico da Celcoin (403 "no resource allowed") pra quando o
    banco aprova o consentimento mas não libera todos os recursos pedidos. A conexão existe,
    só que incompleta, diferente de uma falha total. CTAs: "Tentar autorizar de novo" ou
    "Continuar mesmo assim" (ainda conecta o banco).
  - `nao_autorizado`: a Celcoin não distingue "o usuário recusou" de "não respondeu a
    tempo": as duas coisas chegam como o mesmo status (`REJECTED`), por isso a copy não
    afirma qual dos dois aconteceu.
  - `falha_tecnica`: depois que o banco já autorizou, ainda trocamos o código por um token e
    buscamos os primeiros dados. Se isso falhar (rede, timeout), a culpa não é do banco, é
    nossa: copy separada pra não jogar a culpa no lugar errado.
- **Regra de negócio obrigatória para `nao_autorizado` e `falha_tecnica`** (confirmada pela
  Ellen em 12/11/2026): sempre oferecer "tentar novamente" primeiro. Só depois de um número
  de tentativas seguidas falhando (no protótipo, 3: número ainda não validado, ver open
  questions) é que aparece a opção de falar com o suporte. Não é pra pular direto pro
  suporte na primeira falha, nem pra deixar a pessoa tentando pra sempre sem alternativa.
  Essa regra precisa estar implementada no backend/contagem de tentativas, não só na tela: o
  protótipo simula isso por parâmetro de URL (`?tentativas=N`), mas em produção isso tem que
  vir de uma contagem real de tentativas da sessão/consentimento.
- **Simulação (DESIGN ONLY, por parâmetro de URL)**:
  `?resultado=sucesso|parcial|nao_autorizado|falha_tecnica` e `?tentativas=N` (a partir de 3,
  mostra o card de suporte).

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| of_intro | new | Substitui `OpenFinanceValuePage` em `/cadastro/open-finance` | Integração via API com a Celcoin | Onboarding reflete o fluxo real de consentimento desde a primeira tela |
| of_selecionar | new | Lista de bancos no formato da API da Celcoin (logo real pendente); sem distinção "disponível/em breve" | Simula o formato real da API, pros devs se basearem | Picker fica mais realista; menos telas até o redirecionamento |
| of_transicao | new | Sem ilustração por banco; é a última tela antes de sair da Pode Já | Custo de ilustração por banco; autorização não é mais etapa nossa | Tela mais simples; expectativa correta de que o próximo passo é sair do app |
| of_retorno | new | Liga ao `OpenFinanceContext` de verdade (aceita qualquer banco); cobre 4 resultados reais da Celcoin | Sucesso real precisa refletir no dashboard; mapeamento dos cenários reais de erro/pendência da API | Dashboard funciona com qualquer banco; usuário sempre sabe o que aconteceu e o que fazer |
| (jornada genérica) | removed do caminho padrão (arquivos preservados) | Deixa de ser o destino de qualquer CTA do app | Substituída pela jornada via API | Acessível só por URL direta; reservada para outro parceiro |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `openfinance_cadastro_`
- Cobrir eventos de entrada, ação, sucesso, erro e cancelamento.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| openfinance_cadastro_intro_viewed | Tela de proposta de valor carregada | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_connect_started | CTA "Conectar meu banco" | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_skipped | CTA "Prefiro fazer isso depois" (intro) | of_intro | openfinance_cadastro | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, is_onboarding | - | content-strategy | pending |
| openfinance_cadastro_institution_selected | Clique em um banco da lista | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_already_connected_tapped | Clique num banco já conectado (sem navegar, só aviso) | of_selecionar | openfinance_cadastro | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_bank_transition_confirmed | CTA "Entendi, vamos lá" | of_transicao | openfinance_cadastro | transicao_banco | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_pending | Entrada na tela de retorno, estado "confirmando" | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_cadastro_connection_succeeded | Resultado = sucesso; grava em OpenFinanceContext | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, total_bancos_conectados | - | content-strategy | pending |
| openfinance_cadastro_connection_partial | Resultado = parcial (403 "no resource allowed" da Celcoin); grava em OpenFinanceContext mesmo assim | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result | - | content-strategy | pending |
| openfinance_cadastro_connection_unauthorized | Resultado = nao_autorizado (a Celcoin não distingue recusa explícita de timeout) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_connection_technical_error | Resultado = falha_tecnica (falha nossa depois da autorização no banco) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, connection_result, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_support_escalation_shown | Card de suporte exibido (attempt_number >= 3) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id, attempt_number | - | content-strategy | pending |
| openfinance_cadastro_connection_retry_started | CTA "Tentar novamente" (qualquer resultado de falha) | of_retorno | openfinance_cadastro | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
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
- Conformidade de taxonomia >= 95% (snake_case, prefixo `openfinance_cadastro_`)
- Completude de propriedades >= 95%
- PII indevida = 0 (nenhum CPF/CNPJ real em propriedade de evento)
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

- Impacto em escopo: a jornada de conexão bancária do cadastro passa a ter 4 telas (proposta
  de valor, seleção de instituição, instrução do banco, retorno). A etapa de autorização
  acontece na própria tela do banco, fora do nosso controle visual.
- Riscos e dependências: os pontos técnicos da Celcoin que a documentação pública não deixou
  claros já foram confirmados pelo Erasmo em 13/11/2026 (ver seção 10). Seguem em aberto só
  as decisões de produto que dependem da Ellen e a definição de escopo da próxima fase
  (botão de desconectar banco + solicitação de exclusão de dados via LGPD, que o Erasmo
  confirmou serem necessários, mas que são telas de "Minha Conta"/configuração, fora do
  escopo deste documento de cadastro).
- Impacto esperado em métricas: jornada curta (4 telas) pode favorecer a taxa de conclusão
  dessa etapa; recomenda-se medir via os eventos desta tabela depois do lançamento.
- Plano de rollout: liberar como parte do onboarding assim que o backend confirmar a
  integração; a jornada genérica anterior fica preservada e pode ser reativada trocando o
  componente montado em `/cadastro/open-finance` caso a decisão de parceiro mude de novo.

## 10) Open questions

### Respondidas pelo Erasmo em 13/11/2026

| pergunta | resposta do Erasmo | impacto |
|---|---|---|
| Qual é o prazo de retenção/validade do consentimento que a Pode Já vai usar? | "PodeJá controla": é a Pode Já quem fixa o prazo ao criar o consentimento, o usuário não escolhe. | Nenhuma tela nossa precisa de um seletor de prazo; não há copy hoje que afirme um número de meses, então nada a corrigir na jornada de cadastro. |
| Onde o usuário revoga o consentimento? | "Devemos expor esse botão. A qualquer momento o cliente pode não só revogar, mas via LGPD solicitar a exclusão dos dados." | Confirma que a Pode Já vai ter uma ação de "desconectar banco" dentro do app, e que existe também um pedido de exclusão de dados via LGPD, separado da revogação de consentimento. As duas coisas são telas de configuração/"Minha Conta", fora do escopo deste documento de cadastro: guardado para a próxima fase (ver memória do projeto). |
| O redirecionamento pro banco abre o app nativo do banco, ou é sempre uma página web? | "meu entendimento, sempre vai abrir a App do Banco para autorização. No final, ele vai chamar a url de callback, que seria uma pagina de aterrissagem no nosso ambiente." | Copy de `of_transicao` atualizada: "O app do seu banco vai abrir" (tirou o "ou o site", que estava lá por falta de confirmação). A tela "confirmando" de `of_retorno` já representa essa página de aterrissagem no nosso ambiente. |
| O diretório de instituições (`GET /open/itp/participants/brands`) é o mesmo catálogo usado para consentimento de dados, ou é separado (pagamentos/ITP)? | "sim, essa é a estrutura pré aprovação, onde lista os participantes para autorização." | Confirma que `celcoinBrandsData.ts` está modelado no endpoint certo. Segue mockado só por falta de credencial de API pra testar de verdade. |
| O logo de cada banco vem pronto da API, em que formato? | "sim, podemos mapear o padrao da imagem e utilizar sempre da API. Inclusive é mais indicação para questoes de gestão." | Confirma a abordagem: usar sempre o logo da API (`customerFriendlyLogoUri`), sem manter uma biblioteca própria de ícones por banco. Segue `null` no mock, aguardando acesso real à API. |

### Ainda em aberto

| pergunta | owner | prazo | status |
|---|---|---|---|
| Qual deve ser o estado vazio da busca em `of_selecionar` quando nenhum resultado é encontrado? Ainda não tem copy definida. | Ellen | [A CONFIRMAR] | aberta |
| "Conectar outro banco" deveria reexibir os bancos já conectados (como a jornada genérica anterior fazia com `modo=adicionar`)? Não foi implementado nesta rodada. | Ellen | [A CONFIRMAR] | aberta |
| O limite de 3 tentativas pra mostrar o card de suporte em `of_retorno` (`SUPPORT_THRESHOLD`) foi um número escolhido sem validação. Esse número faz sentido? | Ellen / Erasmo | [A CONFIRMAR] | aberta |
| Quando o resultado é `parcial`, a Pode Já consegue saber especificamente qual dado faltou, pra avisar o usuário com mais precisão, ou só sabe que faltou algo? | Erasmo (backend) | [A CONFIRMAR] | aberta |
| O limite de 3 tentativas pra mostrar o card de suporte em `of_retorno` (`SUPPORT_THRESHOLD`) foi um número escolhido sem validação. Esse número faz sentido, ou tem algum dado de produção sobre quantas tentativas as pessoas costumam fazer antes de desistir? | Ellen / Erasmo | [A CONFIRMAR] | aberta |
| Quando o resultado é `parcial` (banco aprovou, mas não liberou todos os dados), a Pode Já consegue saber especificamente qual dado faltou, pra avisar o usuário com mais precisão, ou só sabe que faltou algo? | Erasmo (backend) | [A CONFIRMAR] | aberta |
