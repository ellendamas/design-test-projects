---
agent: journey-spec-writer
project: taya-app
journey: Crédito Fácil (solução de contorno pós-negativa no Crédito Pessoal)
platform: Mobile
date: 2026-11-23
depends_on: [credito-pessoal]
status: draft
---

# Journey Spec - Crédito Fácil (solução de contorno)

> **Nota sobre este documento:** esta spec cobre uma mudança na tela CP-12 (Reprovada) do Crédito
> Pessoal e três telas novas, próprias da jornada do Crédito Fácil (produto operado pela Facio).
> O nome correto do parceiro é **Facio**; o produto mostrado ao usuário se chama **Crédito Fácil**. As
> regras de negócio vêm do Product Sync de 19/11/2026 (Barreto/Filipe/Ellen) e do alinhamento
> técnico entre Ellen e Erasmo em 23/11/2026, mais a documentação pública da LeadGen API. Prazo
> combinado: design fechado em 23/11/2026, entrega em produção até 27/11/2026.
>
> **Branch:** esta feature nasce em `feature/credito-facil-contorno`, a partir da ponta da pilha
> de Open Finance + Consignado CLT (`feature/consignado-clt-elegibilidade`), não a partir de
> `main` nem de `ready-to-main-temp`. Essas duas branches não têm o Open Finance mergeado ainda e
> não devem ser tocadas por este trabalho.

## 1) Resumo executivo da jornada

- **Problema que a mudança resolve:** quem é negado no Crédito Pessoal (Zema) hoje só vê um cross-sell genérico (Saúde por Assinatura, Consignado CLT) e sai do funil de crédito sem mais nenhuma tentativa. A Fácil é um produto de microcrédito (tickets de R$50 a ~R$600), operado pela Facio, que aceita autônomos, negativados e quem não tem carteira assinada: exatamente o público que mais é negado nos produtos principais da Pode Já.
- **Resultado esperado para o usuário:** quem é negado no CLT e também no Crédito Pessoal vê uma última alternativa de crédito, com um valor estimado pré-aprovado, antes de sair do funil para sempre.
- **Impacto esperado para o negócio:** recupera parte dos ~10 a 11% da base que hoje é negada tanto no CLT quanto no Crédito Pessoal, gerando comissão no primeiro desembolso de cada CPF novo pra Facio, sem custo de chamada de API e sem exigir que a Pode Já assuma qualquer responsabilidade pós-venda.

## 2) Escopo e contexto

- **Tipo:** nova jornada de contorno (3 telas novas) + uma mudança pontual na tela CP-12 do Crédito Pessoal (banner).
- **Origem:** Product Sync de 19/11/2026 (decisão do Barreto de tratar a Fácil como solução de contorno, não como produto de prateleira) + alinhamento técnico com o Erasmo em 23/11/2026 (fluxo de API, regra de dados obrigatórios, prazo de entrega).
- **Decisão de produto confirmada nos dois alinhamentos:** a Fácil **não** vira um produto na grade principal nem aparece no Lotus. Ela só é oferecida depois que a pessoa já foi negada no CLT **e** no Crédito Pessoal, como uma "última cartada", mantendo o volume de leads direcionados ao parceiro sob controle (gestão de risco).
- **Fora de escopo:**
  - Qualquer etapa de verificação de telefone ou e-mail antes do redirecionamento: a própria jornada da Facio não tem essa etapa, então a Pode Já também não adiciona uma.
  - Mostrar taxa, CET ou valor de comissão na Pode Já: a Facio pediu explicitamente pra não expor isso, porque são estimativas que mudam depois da conexão real com Open Finance do lado da Facio.
  - Qualquer acompanhamento de status pós-redirecionamento (se o crédito foi aprovado, valor fechado, parcelas pagas): a Pode Já não tem acesso a esses dados, só ao saldo total de comissão do mês, sem detalhamento por proposta.
  - Abstrair a Fácil como produto no Lotus ou distribuí-la em outros canais: decisão consciente, pela falta de visibilidade de dado (ver acima).
  - Reconciliação financeira de comissão (ex.: numa ferramenta interna tipo "The Coffee"): ideia registrada, não faz parte desta entrega.
  - Corrigir a inconsistência do FGTS sumir do carrossel de cross-sell padrão da CP-12 (bug pré-existente, não relacionado a esta entrega): não é tocada aqui.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| CF-00 | Ver o Crédito Fácil como alternativa | CP-12/CP-04 carrega e a consulta de disponibilidade (CPF) retorna que há crédito disponível | CP-12/CP-04 (com banner) | Vê o banner do Crédito Fácil, com valor estimado |
| CF-01 | Entender a proposta do Crédito Fácil | Toca o banner | credito_facil_intro | Vê a proposta de valor, no mesmo padrão visual das intros de produto já existentes |
| CF-02 | Confirmar os próprios dados | Toca "Continuar" | credito_facil_confirmar_dados | Revê e, se precisar, corrige nome*, CPF*, data de nascimento, e-mail e celular (*nome e CPF são bloqueados, identidade não se edita aqui) |
| CF-03 | Ir para o ambiente da Facio | Toca "Confirmar e continuar" | credito_facil_redirecionando | Cadastro de lead enviado à Facio, link de redirecionamento gerado |
| CF-04 | Chegar na Facio | Redirecionamento automático (3s) ou toque no botão de fallback (10s) | ambiente externo da Facio | Sai do app Pode Já, falando de Pode Já |

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente | status | owner |
|---|---|---|---|---|---|
| cp_12_banner_credito_facil | Banner do Crédito Fácil nas telas de reprovação/inelegibilidade do Crédito Pessoal | `/credito-pessoal/reprovada` (ambos os `?etapa=`) e `/credito-pessoal/inelegivel` (`?motivo=sem_oferta`) | `CreditoPessoalReprovada` + `CreditoPessoalInelegivel` (changed) + novo `CreditoFacilBanner` | changed | Ellen |
| credito_facil_intro | Crédito Fácil: proposta de valor | `/credito-facil` | `CreditoFacilIntroPage` (new), mesma estrutura de `CreditoPessoalLanding.tsx` | new | Ellen |
| credito_facil_confirmar_dados | Crédito Fácil: confirmar meus dados | `/credito-facil/confirmar-dados` | `CreditoFacilConfirmarDadosPage` (new), mesma estrutura do passo "dados_conta" de `CreditoPessoalDados.tsx` | new | Ellen |
| credito_facil_redirecionando | Crédito Fácil: redirecionando | `/credito-facil/redirecionando` | `CreditoFacilRedirecionandoPage` (new, reaproveita o padrão visual de `RedirecionandoPage.tsx`, já usado no redirecionamento externo pra Unico) | new | Ellen |

## 5) Spec por tela

### cp_12_banner_credito_facil (mudança na CP-12 e na CP-04 existentes)

- **Objetivo:** oferecer o Crédito Fácil como última alternativa de crédito, sem forçar o caminho pra quem não é elegível.
- **Componentes:** novo `CreditoFacilBanner`, destaque único (mesmo padrão visual e altura fixa de 141px do `CreditoPessoalBanner`), com o mesmo fundo (imagem + gradiente laranja da marca Pode Já) da tela de introdução do produto, sem logo do parceiro: o foco é no copy. Aparece **dentro** da seção "Outros produtos disponíveis para você" (logo abaixo do título da seção, antes do carrossel de cross-sell padrão), não como um bloco à parte antes dela: o usuário só vê o Crédito Fácil ali, junto dos outros produtos. Aparece na CP-12 (Reprovada, ambos os `?etapa=`) e na CP-04 (Inelegível, só no caso `?motivo=sem_oferta`, que é o único com cross-sell hoje): qualquer negativa no Crédito Pessoal é gatilho, não só uma delas.
- **Regra de negócio (produto):** ao carregar a tela, ela chama a Consulta de disponibilidade (`POST /leadgen/availability`, só com o CPF do usuário, já disponível na sessão). Essa chamada não tem custo, não cadastra nada e não altera nenhum dado do lado da Facio. O banner só deveria aparecer se a consulta retornar `isAvailable: true`. Se vier `false`, se a chamada falhar (erro técnico) ou se o usuário já tiver dispensado o banner antes, a seção inteira do banner não deveria ser renderizada, sem nenhum estado de erro visível nesta tela. A Facio não expõe o motivo de uma indisponibilidade a terceiros, então a Pode Já também não tenta explicar isso ao usuário aqui. Depois do primeiro toque no banner, ele nunca mais deveria aparecer pra esse usuário (regra de "nunca mais mostrar").
- **Regra de negócio (dupla negativa, decidida 23/11/2026):** quem já foi negado no Consignado CLT **e** chega negado também no Crédito Pessoal não vê o cross-sell genérico (Saúde por Assinatura, Consignado CLT) nesta seção, só o Crédito Fácil. Não faz sentido oferecer Saúde por Assinatura, algo pra gastar, pra quem acabou de ser negado duas vezes e está precisando de dinheiro. O sinal de "veio negado do CLT" é gravado quando o usuário sai das telas de inelegibilidade do CLT em direção ao Crédito Pessoal (`localStorage["veio_negativado_clt"]`, ver Dependências).
- **No protótipo:** a regra de disponibilidade/dispensa ainda não está implementada de verdade (não há CPF persistido nem chamada real a decidir isso). Pra facilitar revisar e simular o design, o banner aparece **sempre por padrão** nas duas telas, com parâmetros de simulação: `?facil=indisponivel` ou `?facil=erro` (esconde o banner, simula não ter oferta), `?facilDispensado=true` (esconde o banner, simula "o usuário já tinha dispensado antes") e `?origemClt=negativado` (simula a dupla negativa, sem precisar repetir o fluxo do CLT inteiro). A regra de dupla negativa já está implementada de verdade via `localStorage`, por ser simples o suficiente pra não precisar esperar a implementação real da API.
- **Dado levado adiante:** o valor estimado (`offer.maxValue`) é levado para `credito_facil_intro` via estado de navegação, pra não repetir a mesma chamada de API duas vezes em sequência.
- **Microcopy crítica:** título com o valor estimado, por exemplo "Simule até R$ {valor} com o Crédito Fácil"; subtítulo "Dinheiro na conta em minutos, mesmo sem carteira assinada"; CTA "Simular agora".

### credito_facil_intro

- **Objetivo:** apresentar o Crédito Fácil e o valor estimado antes do usuário decidir seguir, no mesmo padrão visual que todas as outras intros de produto já usam.
- **Estrutura (idêntica à de `CreditoPessoalLanding.tsx`):** hero com imagem de fundo (`/images/banner-intro-credito-facil.png`) e gradiente **nas cores da marca Pode Já** (laranja, não nas cores da Facio), eyebrow "Crédito Fácil · Facio"; pills de benefícios rápidos; bloco de parceria (logo da Facio + "Parceiro oficial" + descrição curta); card de benefícios (lista com ícone); nota de segurança/operador; CTA fixo no rodapé. O valor estimado pré-aprovado entra no título do hero, no lugar da headline genérica que os outros produtos usam: é o ponto central desta tela, por isso fica ali, não escondido mais abaixo.
- **Dados:** recebe o valor estimado via estado de navegação (vindo do banner da CP-12). Se a tela for acessada direto (sem esse estado, ex.: acesso direto por URL), ela mesma chama a Consulta de disponibilidade com o CPF do usuário logado.
- **Estados obrigatórios:**
  - **Carregamento:** enquanto a consulta de disponibilidade está em andamento (só no caso de acesso direto, sem estado de navegação).
  - **Happy path (disponível):** valor estimado exibido no hero, CTA "Continuar" habilitado.
  - **Empty state (indisponível):** mensagem genérica, por exemplo "No momento não temos uma oferta disponível pra você", sem expor o motivo, com CTA "Voltar" (sem oferecer "tentar de novo", já que o motivo pode ser definitivo). **Quando acontece de verdade:** só quando a regra de produto estiver implementada (CP-12/CP-04 já filtrando pelo `isAvailable`), esta tela só chega aqui em caso raro, tipo acesso direto por link/favorito sem passar pelo banner, ou uma condição de corrida entre as duas consultas (a da tela anterior e a desta). Os motivos reais, pela documentação da LeadGen API, são: o CPF já tem janela de atribuição ativa de outro canal; o CPF já recebeu um depósito antes (conversão é terminal, nunca mais fica disponível); ou o CPF está bloqueado (suspeita de fraude) ou em prazo de retorno após uma análise de crédito negada. A Facio não informa qual desses motivos se aplica.
  - **Erro:** falha técnica na chamada (timeout, 500), mensagem de erro padrão do app com CTA "Tentar novamente".
- **Regra de negócio (fast-track, pedida pela Ellen em 24/11/2026):** se o usuário já tem nome, CPF, e-mail, celular e data de nascimento disponíveis no app, **e** pelo menos um método de contato verificado (e-mail ou celular), o CTA "Continuar" pula direto a tela `credito_facil_confirmar_dados` e vai pra `credito_facil_redirecionando`, levando os dados já montados. Quem não cumpre essa condição segue o fluxo normal, passando pela confirmação.
  - **No protótipo:** nome, CPF, e-mail e data de nascimento são tratados como sempre disponíveis (coletados no cadastro e já persistidos em produção, confirmado pela Ellen em 24/11/2026). O único dado que pode faltar de verdade é o celular, que só conta como disponível se o usuário já tiver configurado em Minha Conta. `?pularConfirmacao=true` força o fast-track pra revisar o comportamento mesmo sem essas condições; `?pularConfirmacao=false` força o fluxo normal mesmo que a condição real fechasse.
- **Microcopy crítica:** "Você pode ter até R$ {valor} pré-aprovado"; "Esse valor é uma estimativa e pode mudar depois que você conectar sua conta na Facio"; CTA "Continuar"; empty state "No momento não temos uma oferta disponível pra você."

### credito_facil_confirmar_dados

- **Objetivo:** confirmar, antes de enviar à Facio, os dados obrigatórios do cadastro de lead (nome, CPF, data de nascimento, e-mail e telefone), deixando corrigir ali mesmo o que estiver errado.
- **Estrutura (idêntica ao passo "Seus dados cadastrais" / `dados_conta` de `CreditoPessoalDados.tsx`):** ícone + título + subtítulo, card branco dividido por linha (label + valor + controle à direita), CTA fixo no rodapé. CPF e nome completo ficam bloqueados (ícone de cadeado), por serem dados de identidade. Data de nascimento, e-mail e celular são editáveis ali mesmo, com "Alterar" abrindo um Dialog (desktop) ou Drawer (mobile), mesmo padrão já usado em `CreditoPessoalDados.tsx` para editar e-mail/celular.
- **Regra de negócio importante (correção de uma versão anterior deste documento):** diferente do passo equivalente em Crédito Pessoal (onde hoje e-mail e celular aparecem bloqueados por decisão de segurança, já que celular é usado como 2FA), aqui a Facio **não depende de 2FA** nem de nenhuma verificação adicional. Por isso, e por pedido explícito da Ellen (não forçar o usuário a sair pra Minha Conta pra corrigir um dado), os três campos variáveis (nascimento, e-mail, celular) são editáveis direto nesta tela.
- **Nota técnica:** data de nascimento já é coletada no cadastro (etapa 2) e persistida em produção (confirmado pela Ellen em 24/11/2026; exibida hoje em Minha Conta → Meus dados). Celular pode não estar configurado ainda. Os dois continuam editáveis aqui mesmo, caso o usuário precise corrigir algo.
- **Microcopy crítica:** título "Confirme seus dados"; aviso "Esses dados vão pra Facio, parceira da Pode Já. Se algo estiver errado, você pode corrigir aqui mesmo."; CTA "Confirmar e continuar".

### credito_facil_redirecionando

- **Objetivo:** levar o usuário ao ambiente da Facio depois de registrar o lead.
- **Componentes:** mesma estrutura visual do redirecionamento externo já usado na assinatura da Unico (`RedirecionandoPage.tsx`): abre o link automaticamente após 3 segundos, com botão de fallback após 10 segundos, caso o navegador bloqueie o redirecionamento automático.
- **Regras de negócio:**
  - Ao entrar nesta tela, chama o Cadastro de lead (`POST /leadgen/lead`) com nome, CPF, data de nascimento, e-mail e telefone confirmados na tela anterior. A resposta traz a URL de redirecionamento (`registrationUrl`), que já contém os parâmetros de rastreio da Pode Já.
  - O redirecionamento automático só acontece depois que a URL chega com sucesso. Enquanto a chamada está em andamento, mostra um estado de carregamento (mesmo padrão visual de "Formalizando"/"Consultando" já usado no Crédito Pessoal).
- **Estados obrigatórios:**
  - **Carregamento:** durante a chamada ao cadastro de lead.
  - **Happy path:** URL recebida, redirecionamento automático em 3s, com botão de fallback em 10s.
  - **Erro:** a chamada falha. Pode ser erro de validação, CPF não atribuível no momento (ex.: 409 por já ter janela ativa de outro canal ou já ter recebido depósito antes), ou erro interno 500. Mensagem genérica, sem expor o motivo (mesma regra da Facio de não expor o estado de um cliente a terceiros), CTA "Voltar para o painel". Não é oferecido "tentar novamente" aqui, porque o cenário mais provável (CPF não atribuível) não muda numa nova tentativa imediata.
- **Microcopy crítica:** "Abrindo a Facio..."; fallback "Abrir na Facio"; erro "Não conseguimos continuar com a Facio agora. Tente novamente mais tarde."

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| cp_12_banner_credito_facil | changed | Novo banner de destaque único do Crédito Fácil, acima do carrossel padrão (na CP-12 e na CP-04); no protótipo aparece sempre, com a regra real de disponibilidade/dispensa só documentada aqui | Decisão do Barreto de oferecer o Crédito Fácil como última alternativa pra quem é negado no CLT e no Crédito Pessoal | Recupera parte dos leads negados nos dois produtos principais, sem direcionar todo mundo ao parceiro |
| credito_facil_intro | new | Tela de proposta de valor com estimativa de crédito pré-aprovado, no mesmo padrão das outras intros de produto; CTA faz fast-track direto pro redirecionamento quando o usuário já tem todos os dados e algum contato verificado | Mostrar o valor sem comprometer taxa/comissão, por pedido da Facio, mantendo consistência visual com o resto do app; fast-track evita uma etapa redundante pra quem já está com tudo em dia | Usuário decide seguir sabendo de um valor real, ainda que estimado, numa tela que já reconhece de outros produtos; quem já tem tudo certo leva menos tempo até a Facio |
| credito_facil_confirmar_dados | new | Tela de confirmação dos dados obrigatórios do cadastro de lead, com edição inline pros campos variáveis | A API de cadastro da Facio exige nome, CPF, data de nascimento, e-mail e telefone; usuário não deveria precisar sair pra Minha Conta pra corrigir algo | Usuário confirma e corrige dados sem sair do fluxo |
| credito_facil_redirecionando | new | Reaproveita o padrão de redirecionamento externo já usado na Unico, agora pra Facio | Consistência visual e técnica com um redirecionamento externo que já existe no app | Menos retrabalho de implementação, comportamento já validado pelo usuário em outro produto |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `credito_facil_`
- Cobrir entrada, decisão de seguir, confirmação de dados, erro e redirecionamento concluído.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| credito_facil_banner_viewed | Banner renderizado na CP-12 (disponível e não dispensado) | credito_pessoal_reprovada | credito_facil | banner | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, etapa | - | content-strategy | pending |
| credito_facil_banner_tapped | Toque no banner | credito_pessoal_reprovada | credito_facil | banner | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, etapa | - | content-strategy | pending |
| credito_facil_intro_viewed | Tela credito_facil_intro carregada | credito_facil_intro | credito_facil | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| credito_facil_disponibilidade_checked | Resultado da consulta de disponibilidade (quando chamada direto na intro) | credito_facil_intro | credito_facil | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, resultado (`disponivel`/`indisponivel`/`erro`) | valor_estimado | content-strategy | pending |
| credito_facil_continuar_tapped | CTA "Continuar" na intro | credito_facil_intro | credito_facil | intro | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, fast_track (`true`/`false`) | - | content-strategy | pending |
| credito_facil_dado_editado | Usuário corrige um campo na tela de confirmar dados | credito_facil_confirmar_dados | credito_facil | confirmar_dados | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, campo (`birthDate`/`email`/`phone`) | - | content-strategy | pending |
| credito_facil_dados_confirmados | CTA "Confirmar e continuar" na tela de dados | credito_facil_confirmar_dados | credito_facil | confirmar_dados | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| credito_facil_cadastro_erro | Falha na chamada do cadastro de lead | credito_facil_redirecionando | credito_facil | redirecionando | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| credito_facil_redirecionado | Link da Facio aberto (automático ou via botão de fallback) | credito_facil_redirecionando | credito_facil | redirecionando | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, via (`automatico`/`fallback`) | - | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "credito_facil_banner_tapped",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-23T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "credito_facil",
  "step_name": "banner",
  "screen_name": "credito_pessoal_reprovada",
  "etapa": "simulacao"
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (banner visto e tocado, intro vista, continuar tocado, dados confirmados, erro de cadastro, redirecionado).
- Conformidade de taxonomia >= 95% (snake_case, prefixo `credito_facil_`).
- Completude de propriedades >= 95%.
- PII indevida = 0: nenhum CPF, nome, e-mail, telefone ou valor exato de oferta em propriedade de evento (`valor_estimado` é opcional e deve ser avaliado com o time de dados antes de habilitar, por ser um dado sensível de crédito).
- Latência p95 <= 30 min.

## 9) Impacto para PO/PM

- **Impacto em escopo:** três telas novas fora da grade principal de produtos, mais uma mudança pontual na CP-12 do Crédito Pessoal. Não cria um novo item na navegação principal nem no dashboard, por ser uma solução de contorno, não um produto de prateleira.
- **Riscos e dependências:**
  - **Resolvido (24/11/2026):** nome, CPF, e-mail e data de nascimento são coletados no cadastro e já ficam persistidos em produção (a Ellen confirmou que data de nascimento vive em Minha Conta → Meus dados). No protótipo, isso é simulado via `localStorage["podeja_data_nascimento"]`, gravado também quando o usuário edita o dado em Meus Dados (mesmo padrão já usado pra e-mail/celular). Só o celular segue como dado que pode genuinamente faltar, se o usuário nunca tiver configurado em Minha Conta.
  - **Prazo de expiração do link gerado pela API:** a documentação pública da LeadGen API diz que o token da `registrationUrl` expira em 24 horas, mas o time ainda tem isso como item de verificação em aberto direto com o canal da Facio.
  - **Erasmo ainda vai testar a chamada em produção** pra antecipar problemas, e **compartilhar as duas APIs (consulta e cadastro) com o Bruno** antes da implementação.
  - Autenticação via Basic Auth, com chaves de produção já disponíveis (sem bloqueio de acesso).
  - **Sinal de dupla negativa via `localStorage`:** hoje é um sinal local ao navegador (`localStorage["veio_negativado_clt"]`), gravado nas telas de inelegibilidade do CLT. Isso não cobre, por exemplo, a pessoa trocar de aparelho entre a negativa do CLT e a do Crédito Pessoal. Suficiente pro protótipo e pra v1; se isso importar de verdade, migrar pra um sinal do lado do servidor (vinculado ao CPF) é trabalho futuro de dev.
  - **Bug pré-existente corrigido nesta entrega:** o login por biometria e por código OTP, quando não havia `podeja_user` salvo antes, gravava `email: ""` no `localStorage` em vez de um valor válido. Como isso ficava persistido, o campo de e-mail aparecia em branco em qualquer tela que lesse esse dado, inclusive na confirmação de dados do Crédito Fácil. Corrigido nos dois pontos de login (`src/App.tsx`), e a leitura em `lerDadosCreditoFacil()` também passou a tratar string vazia como dado ausente, por precaução.
- **Impacto esperado em métricas:** público-alvo estimado de ~10 a 11% da base (quem já foi negado no CLT e no Crédito Pessoal). Medir taxa de toque no banner e taxa de conclusão até o redirecionamento (ver Métricas de Sucesso na US correspondente); a conversão real (comissão) só é confirmada pelo evento de webhook `deposited`, do lado da Facio, fora do alcance do Amplitude deste app.
- **Plano de rollout:** prazo combinado de entrega em produção até 27/11/2026. Definição de design precisa estar fechada ainda em 23/11/2026 pra não comprometer o prazo de dev. Branch: `feature/credito-facil-contorno`, a partir de `feature/consignado-clt-elegibilidade` (ponta da pilha Open Finance + CLT).

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Resolvido 24/11/2026: data de nascimento é coletada no cadastro e já persistida em produção (vive em Minha Conta → Meus dados). Não é mais uma dependência bloqueante. | n/a | n/a | resolvida |
| O prazo de expiração do link gerado pela API é mesmo 24 horas (como diz a documentação pública), ou o time confirmou outro valor direto com o canal da Facio? | Erasmo | 27/11/2026 | aberta |
| Qual é o prazo real pra um lead "virar da Facio" se o cliente não fechar: 7 dias (documentação pública) ou 14 dias (mencionado também na reunião)? Não muda o desenho da tela, mas vale confirmar pro time de dados. | Erasmo | A confirmar | aberta |
| Vale implementar de verdade a regra de disponibilidade/dispensa do banner (hoje só documentada, no protótipo ele aparece sempre), ou isso fica só pro time de dev decidir na implementação real? | Ellen / Erasmo | Antes da implementação | aberta |
| Decidido 23/11/2026: na dupla negativa (CLT + Crédito Pessoal), o cross-sell genérico (Saúde por Assinatura, Consignado CLT) some e só o Crédito Fácil aparece. Não faz sentido oferecer algo pra gastar (Saúde) pra quem está precisando de dinheiro. Ver seção 5. | n/a | n/a | resolvida |
| Se a dupla negativa acontecer mas o Crédito Fácil também estiver indisponível (ou dispensado), a seção "Outros produtos disponíveis para você" fica sem nenhum item. Cai de volta pro cross-sell genérico nesse caso, ou fica vazia mesmo? | Ellen / Barreto | A confirmar | aberta |
