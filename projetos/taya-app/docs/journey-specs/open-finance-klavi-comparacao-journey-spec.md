---
agent: content-strategy
project: taya-app
journey: open-finance-klavi-comparacao
platform: Mobile
date: 2026-11-06
depends_on: [ux-research, visual-design]
status: draft
---

# Journey Spec - Comparação Open Finance via Klavi (Whitelabel vs API Only)

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: o time de produto precisa decidir, com o PM e o backend
  (Pedro), qual dos dois modelos de integração da Klavi usar para conectar bancos via Open
  Finance. Hoje essa decisão não tem nenhum protótipo navegável para comparar.
- Resultado esperado para o usuário: nenhum impacto direto ainda. Estas telas não substituem
  a jornada de Open Finance real (`/cadastro/open-finance*`), que continua intocada. São
  protótipos de avaliação interna, acessíveis por URL direta, sem gate de login.
- Impacto esperado para o negócio: decisão informada entre entregar mais rápido (Whitelabel,
  UI controlada pelo parceiro) ou manter controle total do visual (API Only, mais esforço de
  desenvolvimento). Reduz risco de retrabalho de design depois que o backend escolher um modelo.

## 2) Escopo e contexto

- Tipo: nova jornada (duas variantes de protótipo, lado a lado).
- Origem: pedido direto da Ellen, após o PM relatar que a integração vai usar a Klavi e que o
  onboarding de seleção de banco pode acontecer fora do app da Pode Já. Confirmado em pesquisa
  na documentação pública da Klavi (docs.klavi.ai/connect e docs.klavi.ai/connect/concepts).
- Fora de escopo: qualquer alteração na jornada de Open Finance já existente em
  `src/pages/open-finance/` (mantida intacta de propósito, pode ser reaproveitada com outro
  parceiro no futuro). Integração real com a API da Klavi (todas as telas aqui usam dados
  mockados). Decisão final de qual modelo usar (depende do Pedro/backend).

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| compare_entry | Entender as duas opções em avaliação | Acesso direto à URL do protótipo | compare | Escolhe qual opção explorar |
| wl_intro | Entender o valor de conectar o banco | Clique em "Ver essa opção" (Whitelabel) | wl_intro | Decide conectar ou não |
| wl_transicao | Entender que vai sair da Pode Já por um instante | CTA "Conectar meu banco" | wl_transicao | Confirma a saída |
| wl_retorno | Saber o resultado da conexão | CTA "Continuar" (simula retorno) | wl_retorno | Vê sucesso, erro ou cancelamento |
| api_intro | Entender o valor de conectar o banco | Clique em "Ver essa opção" (API Only) | api_intro | Decide conectar ou não |
| api_selecionar | Escolher o banco | CTA "Conectar meu banco" | api_selecionar | Seleciona um banco disponível |
| api_documento | Confirmar CPF ou CNPJ | Seleção de um banco disponível | api_documento | Documento preenchido |
| api_lgpd | Autorizar compartilhamento (LGPD) | CTA "Continuar" | api_lgpd | Checkbox marcado e autorizado |
| api_transicao | Entender os passos no app do banco | CTA "Autorizar e continuar" | api_transicao | Confirma que entendeu os passos |
| api_retorno | Saber o resultado da conexão | CTA "Entendi, vamos lá" (simula retorno) | api_retorno | Vê sucesso, erro ou cancelamento |

## 4) Inventário de telas

| screen_id | nome da tela | plataforma | status (new/changed/removed) | owner |
|---|---|---|---|---|
| compare | OpenFinanceKlaviComparePage | Mobile | new | Ellen |
| wl_intro | KlaviWhitelabelIntroPage | Mobile | new | Ellen |
| wl_transicao | KlaviWhitelabelTransicaoPage | Mobile | new | Ellen |
| wl_retorno | KlaviWhitelabelRetornoPage | Mobile | new | Ellen |
| api_intro | KlaviApiIntroPage | Mobile | new | Ellen |
| api_selecionar | KlaviApiSelecionarInstituicaoPage | Mobile | new | Ellen |
| api_documento | KlaviApiConfirmarDocumentoPage | Mobile | new | Ellen |
| api_lgpd | KlaviApiAutorizacaoLgpdPage | Mobile | new | Ellen |
| api_transicao | KlaviApiTransicaoBancoPage | Mobile | new | Ellen |
| api_retorno | KlaviApiRetornoPage | Mobile | new | Ellen |

## 5) Spec por tela

### Tela: compare - Comparação Klavi

**Objetivo da tela**
- Explicar as duas opções de integração e deixar escolher qual explorar. Tela interna, não vai
  para o usuário final.

**Componentes principais**
- Badge "Protótipo interno de comparação" - sinaliza que não é tela de produção
- Card Opção 1 (Whitelabel) - resumo + CTA
- Card Opção 2 (API Only) - resumo + CTA

**Estados obrigatórios**
- default (única); sem loading, erro ou vazio aplicável

**Regras de negócio**
- Nenhuma lógica condicional. Navegação direta para cada jornada.

**Microcopy crítica**
- CTA primária: "Ver essa opção" (ambos os cards)
- Badge: "Protótipo interno de comparação"

**Acessibilidade mínima**
- Contraste AA nos textos sobre fundo branco e no badge âmbar
- Alvo de toque mínimo 44x44pt (botões em largura total, h-11)

### Tela: wl_intro - Whitelabel: proposta de valor

**Objetivo da tela**
- Mesma proposta de valor da jornada de Open Finance já existente, sem lista de bancos (quem
  escolhe o banco é a tela do parceiro, não a Pode Já).

**Componentes principais**
- Card de destaque com ícone e headline
- Lista de 3 benefícios
- Card de aviso "somente leitura"

**Estados obrigatórios**
- default (única)

**Regras de negócio**
- Nenhuma. CTA único leva direto para a transição (sem seleção de banco).

**Microcopy crítica**
- CTA primária: "Conectar meu banco"

**Acessibilidade mínima**
- Contraste AA, foco visível no botão de voltar e no CTA

### Tela: wl_transicao - Whitelabel: transição para o parceiro

**Objetivo da tela**
- Avisar que o usuário vai sair da Pode Já por um instante, sem prometer um mecanismo técnico
  específico (redirect, iframe, webview ou SDK), já que a documentação da Klavi não confirma
  qual deles o modo Whitelabel usa.

**Componentes principais**
- Ilustração/ícone de segurança
- Card informativo sobre o processo oficial do Open Finance

**Estados obrigatórios**
- default (única)

**Regras de negócio**
- CTA "Continuar" simula a saída navegando direto para a tela de retorno (não existe, neste
  protótipo, uma chamada real a um serviço externo).

**Microcopy crítica**
- CTA primária: "Continuar"

**Acessibilidade mínima**
- Contraste AA, foco visível no CTA

### Tela: wl_retorno - Whitelabel: retorno e resultado

**Objetivo da tela**
- Simular o retorno do usuário após a Klavi notificar o resultado por evento assíncrono
  (webhook). Por isso sempre passa por um estado de confirmação antes do resultado final.

**Componentes principais**
- Estado "confirmando" com ícone animado
- Estado de sucesso: checklist de 3 itens + card informativo + CTA
- Estado de erro: ícone de alerta + CTA "Tentar novamente" + CTA secundária
- Estado de cancelamento: ícone + CTA "Tentar novamente" + CTA secundária

**Estados obrigatórios**
- loading state (confirmando, ~2.2s)
- success (resultado=sucesso)
- error message (resultado=erro)
- estado adicional: cancelado pelo usuário (resultado=cancelado)

**Regras de negócio**
- DESIGN ONLY: parâmetro de URL `?resultado=sucesso|erro|cancelado` (default `sucesso`) simula
  os três desfechos possíveis do evento assíncrono, sem precisar de backend real.
- Não assume nome de banco certo: a Klavi retorna isso no modelo Whitelabel, então o resultado
  de sucesso é tratado de forma genérica, sem nome de banco específico.

**Microcopy crítica**
- Confirmando: "Confirmando com o seu banco..."
- Sucesso: "Banco conectado!"
- Erro: "Não conseguimos confirmar sua conexão"
- Cancelado: "Você cancelou a conexão"

**Acessibilidade mínima**
- Contraste AA em todos os estados, inclusive o card de sucesso com fundo colorido
- Foco visível nos CTAs de cada estado

### Tela: api_intro - API Only: proposta de valor

**Objetivo da tela**
- Mesma proposta de valor das demais intros. A diferença desta opção começa na próxima tela.

**Componentes principais**
- Idênticos à wl_intro

**Estados obrigatórios**
- default (única)

**Regras de negócio**
- CTA leva para a seleção de instituição (UI própria), diferente da wl_intro.

**Microcopy crítica**
- CTA primária: "Conectar meu banco"

**Acessibilidade mínima**
- Contraste AA, foco visível no CTA

### Tela: api_selecionar - API Only: seleção de instituição

**Objetivo da tela**
- UI própria para escolher o banco, reaproveitando os dados reais de
  `src/pages/open-finance/openFinanceData.ts` (mesmos nomes e cores de banco já usados na
  jornada atual).

**Componentes principais**
- Campo de busca
- Lista de bancos disponíveis (grupo "top") e outros bancos (indisponíveis para Open Finance)

**Estados obrigatórios**
- default
- empty state: busca sem resultado (lista vazia; não há copy dedicada ainda, ver seção 10)

**Regras de negócio**
- Banco disponível (tier 1: Nubank, Caixa, BB, Bradesco, Itaú): navega para confirmação de
  documento.
- Banco indisponível: mostra toast "Em breve! O guia para este banco será disponibilizado em
  breve." e não navega.

**Microcopy crítica**
- Placeholder de busca: "Buscar banco..."
- Tag de indisponível: "Sem Open Finance"

**Acessibilidade mínima**
- Contraste AA nas tags de status
- Alvo de toque mínimo nos itens de lista (linha inteira clicável)

### Tela: api_documento - API Only: confirmação de CPF/CNPJ

**Objetivo da tela**
- Etapa nova desta opção: confirmar o documento que inicia a autorização de consentimento,
  conforme descrito na documentação da Klavi.

**Componentes principais**
- Campo de texto único (CPF ou CNPJ)

**Estados obrigatórios**
- default
- CTA desabilitado quando o campo está vazio

**Regras de negócio**
- DESIGN ONLY: campo vem pré-preenchido com um CPF mock ("123.456.789-00") para evitar tela
  vazia em acesso direto por URL. Sem validação de formato real neste protótipo.
- bancoId chega por `location.state`, com fallback "nubank" para acesso direto por URL.

**Microcopy crítica**
- Título: "Confirme seu CPF ou CNPJ"
- CTA primária: "Continuar"

**Acessibilidade mínima**
- Label associado ao campo (`htmlFor`/`id`), contraste AA

### Tela: api_lgpd - API Only: autorização LGPD

**Objetivo da tela**
- Etapa nova explícita: autorizar o compartilhamento de dados conforme a LGPD, antes de seguir
  para o banco. Reflete que mesmo na opção API Only a Klavi expõe essa etapa de consentimento.

**Componentes principais**
- 3 cards informativos (o que será acessado, por quanto tempo, direito de revogar)
- Card de aviso "somente leitura"
- Checkbox de autorização

**Estados obrigatórios**
- default
- CTA desabilitado até o checkbox ser marcado

**Regras de negócio**
- CTA "Autorizar e continuar" só habilita com o checkbox marcado.
- Prazo de retenção de dados não é citado em número exato: não há confirmação do time de
  backend/jurídico sobre isso ainda (ver seção 10).

**Microcopy crítica**
- Título: "Autorize o compartilhamento dos seus dados"
- CTA primária: "Autorizar e continuar"
- Texto do checkbox: "Li e autorizo o compartilhamento dos meus dados financeiros, conforme a
  LGPD."

**Acessibilidade mínima**
- Checkbox com alvo de toque mínimo e associado ao texto via `label`
- Contraste AA

### Tela: api_transicao - API Only: transição para o banco

**Objetivo da tela**
- Reaproveita o conceito e os passos reais de `OpenFinanceGuidePage.tsx`: mesmo nesta opção, a
  autenticação final acontece no app do próprio banco.

**Componentes principais**
- Lista numerada de passos (dados reais de `openFinanceBanks`)
- Card de aviso sobre sair do app temporariamente

**Estados obrigatórios**
- default (varia por banco, mas sem estado de erro próprio)

**Regras de negócio**
- bancoId chega por `location.state`, com fallback "nubank" para acesso direto por URL.

**Microcopy crítica**
- Título: "Como funciona no {banco}"
- CTA primária: "Entendi, vamos lá"

**Acessibilidade mínima**
- Contraste AA, ordem de leitura lógica na lista numerada

### Tela: api_retorno - API Only: retorno e resultado

**Objetivo da tela**
- Mesmo princípio da wl_retorno: confirmação assíncrona, não instantânea. Aqui o nome do banco
  já é conhecido (veio da seleção), então o resultado de sucesso mostra o banco específico.

**Componentes principais**
- Idênticos à wl_retorno, com card de banco conectado (nome, cor, ícone de confirmado)

**Estados obrigatórios**
- loading state (confirmando, ~2.2s)
- success (resultado=sucesso)
- error message (resultado=erro)
- estado adicional: cancelado pelo usuário (resultado=cancelado)

**Regras de negócio**
- DESIGN ONLY: mesmo parâmetro `?resultado=sucesso|erro|cancelado` da wl_retorno.
- bancoId chega por `location.state`, com fallback "nubank" para acesso direto por URL.

**Microcopy crítica**
- Confirmando: "Confirmando com o {banco}..."
- Sucesso: "Banco conectado!"
- Erro: "Não conseguimos confirmar sua conexão"
- Cancelado: "Você cancelou a conexão"

**Acessibilidade mínima**
- Contraste AA em todos os estados
- Foco visível nos CTAs de cada estado

## 6) Diff de UX por tela

| screen_id | tipo de mudança (new/changed/removed) | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| compare | new | Tela nova de comparação interna | Decisão de produto pendente entre dois modelos de integração | Alinhamento mais rápido entre Ellen, PM e Pedro |
| wl_intro, wl_transicao, wl_retorno | new | Jornada curta de 3 telas (Whitelabel) | A Klavi controla a seleção de banco e autorização neste modelo | Avalia esforço mínimo de telas próprias |
| api_intro, api_selecionar, api_documento, api_lgpd, api_transicao, api_retorno | new | Jornada de 6 telas (API Only), incluindo 2 etapas novas (CPF/CNPJ e LGPD) que não existem na jornada atual | Reflete os conceitos reais de consentimento da API da Klavi | Avalia esforço maior de telas próprias, com UI 100% controlada |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Cobrir eventos de entrada, ação, sucesso, erro e cancelamento
- Cada evento precisa de trigger explícito

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| openfinance_klavi_compare_viewed | Tela de comparação carregada | compare | openfinance_klavi_comparison | compare_entry | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_klavi_option_selected | Clique em "Ver essa opção" | compare | openfinance_klavi_comparison | compare_entry | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type | - | content-strategy | pending |
| openfinance_klavi_intro_viewed | Tela de proposta de valor carregada | wl_intro / api_intro | openfinance_klavi_whitelabel / openfinance_klavi_api_only | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type | - | content-strategy | pending |
| openfinance_klavi_connect_started | CTA "Conectar meu banco" | wl_intro / api_intro | openfinance_klavi_whitelabel / openfinance_klavi_api_only | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type | - | content-strategy | pending |
| openfinance_klavi_handoff_confirmed | CTA "Continuar" na transição Whitelabel | wl_transicao | openfinance_klavi_whitelabel | transicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_klavi_institution_selected | Clique em um banco disponível | api_selecionar | openfinance_klavi_api_only | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_klavi_institution_unavailable | Clique em banco indisponível (toast "Em breve") | api_selecionar | openfinance_klavi_api_only | selecionar_instituicao | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_klavi_document_confirmed | CTA "Continuar" na confirmação de documento | api_documento | openfinance_klavi_api_only | confirmar_documento | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_klavi_lgpd_authorized | CTA "Autorizar e continuar" com checkbox marcado | api_lgpd | openfinance_klavi_api_only | autorizacao_lgpd | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| openfinance_klavi_bank_transition_confirmed | CTA "Entendi, vamos lá" | api_transicao | openfinance_klavi_api_only | transicao_banco | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, institution_id | - | content-strategy | pending |
| openfinance_klavi_connection_pending | Entrada na tela de retorno, estado "confirmando" | wl_retorno / api_retorno | openfinance_klavi_whitelabel / openfinance_klavi_api_only | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type | institution_id | content-strategy | pending |
| openfinance_klavi_connection_succeeded | Resultado assíncrono = sucesso | wl_retorno / api_retorno | openfinance_klavi_whitelabel / openfinance_klavi_api_only | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type, connection_result | institution_id | content-strategy | pending |
| openfinance_klavi_connection_failed | Resultado assíncrono = erro | wl_retorno / api_retorno | openfinance_klavi_whitelabel / openfinance_klavi_api_only | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type, connection_result | institution_id | content-strategy | pending |
| openfinance_klavi_connection_cancelled | Resultado assíncrono = cancelado | wl_retorno / api_retorno | openfinance_klavi_whitelabel / openfinance_klavi_api_only | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type, connection_result | institution_id | content-strategy | pending |
| openfinance_klavi_connection_retry_started | CTA "Tentar novamente" (erro ou cancelado) | wl_retorno / api_retorno | openfinance_klavi_whitelabel / openfinance_klavi_api_only | retorno | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, option_type | institution_id | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "openfinance_klavi_connection_succeeded",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-06T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "openfinance_klavi_api_only",
  "step_name": "retorno",
  "screen_name": "api_retorno",
  "option_type": "api_only",
  "connection_result": "sucesso",
  "institution_id": "nubank"
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (entrada, seleção de opção, início de conexão, cada
  desfecho de retorno, retry)
- Conformidade de taxonomia >= 95% (snake_case, prefixo `openfinance_klavi_`)
- Completude de propriedades >= 95% (todas as propriedades obrigatórias presentes)
- PII indevida = 0 (nenhum CPF/CNPJ real, nome ou dado bancário real em evento; o CPF mock
  usado na tela de confirmação de documento não deve ser enviado como propriedade de evento)
- Latência p95 <= 30 min

## 9) Impacto para PO/PM

- Impacto em escopo: nenhum ainda sobre a jornada real de cadastro. Esta é uma ferramenta de
  decisão, não uma entrega para produção.
- Riscos e dependências: depende da resposta do Pedro (backend) sobre qual modelo a API da
  Pode Já vai usar com a Klavi, e de confirmação técnica da Klavi sobre como o modo Whitelabel
  entrega sua UI (redirect, iframe, webview ou SDK).
- Impacto esperado em métricas: nenhum (protótipo interno, sem exposição a usuário final).
- Plano de rollout: não aplicável nesta fase. Após a decisão de modelo, a opção escolhida deve
  virar a jornada real de Open Finance via Klavi, como uma jornada nova e paralela à existente
  (que fica reservada para outro parceiro).

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Qual modelo (Whitelabel ou API Only) o backend vai usar para integrar a API da Pode Já com a API da Klavi? | Pedro (backend) | [A CONFIRMAR] | aberta |
| Como o modo Whitelabel entrega a UI ao usuário final (redirect externo, iframe, webview ou SDK)? Isso muda a transição e a navegação de volta. | Pedro (backend) / Klavi | [A CONFIRMAR] | aberta |
| Qual é, de fato, o prazo de retenção dos dados compartilhados via Open Finance com a Klavi? Hoje a tela de autorização LGPD evita citar um número exato por falta de confirmação. | Jurídico/Compliance | [A CONFIRMAR] | aberta |
| Qual deve ser o estado vazio da busca de banco em api_selecionar quando nenhum resultado é encontrado? Ainda não tem copy definida. | Ellen | [A CONFIRMAR] | aberta |
| A lista de bancos disponíveis (tier 1) muda com a Klavi, já que o catálogo de instituições dela pode ser diferente do suportado hoje? | Pedro (backend) | [A CONFIRMAR] | aberta |
