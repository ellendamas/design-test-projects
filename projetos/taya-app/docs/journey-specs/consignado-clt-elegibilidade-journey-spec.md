---
agent: content-strategy
project: taya-app
journey: consignado-clt-elegibilidade
platform: Mobile
date: 2026-11-18
depends_on: []
status: draft
---

# Journey Spec - Pré-elegibilidade e inelegibilidade do Consignado CLT

## 1) Resumo executivo da jornada

- Problema que a mudança resolve: muitos usuários iniciavam a simulação do Consignado CLT e só
  descobriam, depois de autorizar a consulta ao Dataprev, que eram inelegíveis por não terem
  carteira assinada e emprego ativo (requisito básico do produto). Isso gastava uma consulta à
  toa e entregava uma experiência frustrante só no fim do fluxo.
- Resultado esperado para o usuário: uma pergunta direta logo após a intro do produto, antes do
  consentimento, que já filtra quem não se qualifica por carteira assinada, direciona pro
  Crédito Pessoal nesse caso, e preserva a jornada normal pra quem responde Sim. Quem é
  inelegível por outro motivo, já depois de consentir a consulta, cai numa tela separada,
  porque o motivo não é "carteira assinada" nem "margem consignável indisponível" (isso já tem
  tela própria, `sem-oferta`).
- Impacto esperado para o negócio: menos consultas ao Dataprev desperdiçadas com quem claramente
  não se qualifica; recupera parte dessas pessoas como lead de Crédito Pessoal, produto que não
  depende de carteira assinada.

## 2) Escopo e contexto

- Tipo: nova etapa de pré-qualificação + nova tela de resultado negativo pós-consulta, dentro da
  jornada já existente do Consignado CLT.
- Origem: pedido do Barreto (GPM) em 18/11/2026, com refinamento da Ellen no mesmo dia.
- Decisão de produto registrada em 18/11/2026: a Pode Já trata inelegibilidade como um único
  status ("inelegível"), mas com duas telas separadas, porque o motivo e o momento em que ele é
  conhecido são diferentes:
  - **Pré-consentimento** (`/consignado-clt/inelegivel`): motivo fixo e conhecido antes de
    qualquer consulta (não ter carteira assinada/emprego ativo).
  - **Pós-consentimento** (`/consignado-clt/inelegivel-consulta`): motivo variável, só
    conhecido depois da consulta ao Dataprev, diferente de "sem margem" (que continua em
    `sem-oferta`) e diferente de "sem carteira assinada".
- Fora de escopo:
  - Automatizar a jornada pro Crédito Pessoal a partir dos dados já cadastrados da pessoa
    (pular as perguntas iniciais) ou iniciar a simulação automaticamente ao responder "Não".
    Ideia registrada pelo Barreto, fica pra uma fase futura, condicionada a ver se essa mudança
    já aumenta as simulações e aprovações do Crédito Pessoal.
  - Definir os motivos reais de inelegibilidade pós-consentimento: a tela já existe e funciona,
    mas hoje só tem uma mensagem genérica (`MOTIVO_LABEL.generico`), porque a Pode Já ainda não
    tem, junto ao time técnico, a lista de motivos que a consulta real pode devolver.
  - Cross-sell com Saque Fácil: produto sem rota nem tela ativa no app hoje.

## 3) Mapa da jornada (passo a passo)

| step_id | objetivo do user | trigger | tela destino | resultado esperado |
|---|---|---|---|---|
| clt_elegibilidade | Confirmar se tem carteira assinada e emprego ativo | Toca "Consultar minha oferta" na intro do Consignado CLT | clt_elegibilidade | Vê a pergunta com Sim/Não |
| clt_elegivel | Seguir pro consentimento normalmente | Toca "Sim" | clt_provedores | Continua a jornada já existente (escolha de parceiro → consentimento → consulta) |
| clt_inelegivel_carteira | Entender por que não pode seguir e ver outra opção | Toca "Não" | clt_inelegivel | Vê o motivo e o cross-sell pro Crédito Pessoal |
| clt_inelegivel_pos_consulta | Entender por que a consulta foi negativa (motivo diferente de carteira/margem) | Resultado negativo da consulta ao Dataprev, pós-consentimento | clt_inelegivel_consulta | Vê o motivo e o cross-sell pro Crédito Pessoal |
| clt_cross_sell_credito_pessoal | Seguir pro Crédito Pessoal a partir de qualquer inelegibilidade | Toca o banner ou o CTA "Simular Crédito Pessoal" | `/credito-pessoal` (fora desta jornada) | Começa a jornada do Crédito Pessoal do zero |

## 4) Inventário de telas

| screen_id | nome da tela | rota real | componente | status | owner |
|---|---|---|---|---|---|
| clt_landing | Consignado CLT: intro | `/consignado-clt` | `ConsignadoCLTLandingPage` | changed | Ellen |
| clt_elegibilidade | Pergunta de pré-elegibilidade | `/consignado-clt/elegibilidade` | `ConsignadoCLTElegibilidadePage` | new | Ellen |
| clt_inelegivel | Inelegível: sem carteira assinada | `/consignado-clt/inelegivel` | `ConsignadoCLTInelegivelPage` | new | Ellen |
| clt_inelegivel_consulta | Inelegível: motivo pós-consulta | `/consignado-clt/inelegivel-consulta` | `ConsignadoCLTInelegivelConsultaPage` | new | Ellen |
| clt_loading | Consultando oferta | `/consignado-clt/loading` | `ConsignadoCLTLoadingPage` | changed | Ellen |

## 5) Spec por tela

### clt_elegibilidade

- **Objetivo**: confirmar se a pessoa se qualifica antes de gastar uma consulta ao Dataprev.
- **Componentes**: ícone de contexto (maleta), pergunta, aviso em destaque (box amber)
  explicando que isso é obrigatório pro produto, e dois botões de largura total (Sim/Não).
- **Regra de negócio**: resposta não fica salva em nenhum lugar hoje. É só um gate de UI; se a
  pessoa voltar e entrar de novo, a pergunta aparece de novo.
- **Microcopy crítica**: "Você tem carteira assinada e está empregado atualmente?"; aviso
  "Isso é obrigatório para o Crédito Consignado CLT: a parcela é descontada direto da sua folha
  de pagamento."; botões "Sim" / "Não".
- **Acessibilidade mínima**: os dois botões têm alvo de toque de 56px de altura (h-14),
  contraste AA garantido (laranja da marca sobre branco pro "Sim", borda sobre branco pro
  "Não").

### clt_inelegivel

- **Objetivo**: explicar por que a pessoa não pode seguir com o Consignado CLT agora, e já
  oferecer uma alternativa real.
- **Componentes**: ícone de resultado, título e subtítulo; box amber "Por que isso acontece?";
  banner de destaque do Crédito Pessoal (ver seção de componentes compartilhados); CTA primário
  "Simular Crédito Pessoal" e link secundário "Sair".
- **Regra de negócio**: hoje a pessoa refaz a jornada do Crédito Pessoal do zero ao tocar no CTA
  ou no banner, sem levar nenhum dado já preenchido (ver "fora de escopo" na seção 2).
- **Microcopy crítica**: "Esse crédito é só pra quem tem carteira assinada"; "Sem isso, não
  conseguimos seguir com o Consignado CLT agora."; "A parcela do Consignado CLT é descontada
  direto da folha de pagamento. Por isso, esse crédito só está disponível pra quem tem carteira
  assinada e emprego ativo no momento da contratação."

### clt_inelegivel_consulta

- **Objetivo**: mesma função da tela acima, mas pro caso em que o motivo só é conhecido depois
  da consulta ao Dataprev (pós-consentimento).
- **Componentes**: mesmo padrão visual da `clt_inelegivel` (ícone, título, box amber, banner de
  Crédito Pessoal, CTA + link de saída), com `motivo` como query param (`?motivo=`) pra permitir
  mensagens diferentes quando os motivos reais forem definidos. Hoje só existe o motivo
  `generico`.
- **Regra de negócio**: nunca é alcançada pelo mesmo caminho de `sem-oferta` (margem
  consignável indisponível) nem de `inelegivel` (carteira assinada). São três resultados
  negativos distintos, cada um com sua própria tela.
- **Microcopy crítica**: "Não conseguimos aprovar esse crédito agora"; "Isso pode mudar. Veja o
  motivo abaixo."; mensagem genérica "Pelos dados que recebemos na consulta, não conseguimos
  aprovar esse crédito pra você agora."

### Componente compartilhado: banner de cross-sell do Crédito Pessoal

- Usado nas duas telas de inelegibilidade. Vem como destaque único (não item de carrossel),
  porque hoje só o Crédito Pessoal tem rota e asset reais pra esse cross-sell.
- Altura fixa de 141px (a mesma de um card do carrossel de cross-sell padrão do app), largura
  fluida: o texto (título, descrição, "Simular agora") ocupa o espaço disponível e a
  ilustração (foto + forma decorativa) fica numa coluna de largura fixa à direita, maior a
  partir do breakpoint `sm`.
- Visual baseado em modelo Figma fornecido pela Ellen em 18/11/2026 (fundo em gradiente laranja
  com textura pontilhada, foto de pessoa comemorando, forma orgânica branca decorativa atrás da
  foto).

## 6) Diff de UX por tela

| screen_id | tipo de mudança | o que mudou | por que mudou | impacto esperado |
|---|---|---|---|---|
| clt_landing | changed | CTA "Consultar minha oferta" agora leva pra `clt_elegibilidade`, não direto pro consentimento | Pedido do Barreto: filtrar inelegibilidade óbvia antes de gastar consulta | Menos gente chega até o consentimento só pra descobrir que não se qualifica |
| clt_elegibilidade | new | Pergunta de pré-qualificação (carteira assinada/emprego ativo) | Requisito básico do produto, hoje só descoberto no fim do fluxo | Filtra cedo, sem gastar consulta ao Dataprev |
| clt_inelegivel | new | Tela de inelegibilidade por carteira assinada, com cross-sell pro Crédito Pessoal | Pedido do Barreto: direcionar quem não se qualifica pra outro produto | Recupera parte do público como lead de Crédito Pessoal |
| clt_inelegivel_consulta | new | Tela de inelegibilidade por outros motivos, conhecidos só pós-consentimento | Pedido da Ellen em 18/11/2026: separar do motivo de carteira assinada, já que o motivo real varia e ainda não foi definido com o time técnico | Status "inelegível" continua único, mas cada motivo tem a tela certa pro contexto |
| clt_loading | changed | Novo branch de teste `?resultado=inelegivel`, que leva pra `clt_inelegivel_consulta` | Precisa de um jeito de simular e validar esse resultado sem lógica real da API ainda | Tela testável desde já, mesmo sem a API real |

## 7) Taxonomia de eventos Amplitude

### Regras gerais

- Convenção: snake_case
- Prefixo `clt_elegibilidade_`
- Cobrir entrada, decisão (Sim/Não) e os dois resultados negativos.

### Tabela de eventos

| event_name | trigger | screen_name | flow_name | step_name | required_properties | optional_properties | owner | qa_status |
|---|---|---|---|---|---|---|---|---|
| clt_elegibilidade_viewed | Tela de pergunta carregada | clt_elegibilidade | clt_elegibilidade | pergunta | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| clt_elegibilidade_respondida | Toca "Sim" ou "Não" | clt_elegibilidade | clt_elegibilidade | pergunta | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, resposta | - | content-strategy | pending |
| clt_inelegivel_viewed | Tela de inelegibilidade (carteira assinada) carregada | clt_inelegivel | clt_elegibilidade | inelegivel | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name | - | content-strategy | pending |
| clt_inelegivel_consulta_viewed | Tela de inelegibilidade pós-consulta carregada | clt_inelegivel_consulta | clt_elegibilidade | inelegivel_consulta | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, motivo | - | content-strategy | pending |
| clt_inelegivel_credito_pessoal_tapped | Toca o banner ou o CTA de Crédito Pessoal, em qualquer uma das duas telas | clt_inelegivel ou clt_inelegivel_consulta | clt_elegibilidade | inelegivel | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, origem | - | content-strategy | pending |
| clt_inelegivel_sair_tapped | Toca "Sair", em qualquer uma das duas telas | clt_inelegivel ou clt_inelegivel_consulta | clt_elegibilidade | inelegivel | user_id, session_id, timestamp, platform, flow_name, step_name, screen_name, origem | - | content-strategy | pending |

### Exemplo de payload

```json
{
  "event_name": "clt_elegibilidade_respondida",
  "user_id": "123",
  "session_id": "abc",
  "timestamp": "2026-11-18T10:00:00Z",
  "platform": "Mobile",
  "flow_name": "clt_elegibilidade",
  "step_name": "pergunta",
  "screen_name": "clt_elegibilidade",
  "resposta": "nao"
}
```

## 8) Critérios de QA de tracking

- Cobertura de eventos críticos >= 90% (pergunta vista, resposta dada, cada tela de inelegível
  vista, cross-sell tocado).
- Conformidade de taxonomia >= 95% (snake_case, prefixo `clt_elegibilidade_`).
- Completude de propriedades >= 95%.
- PII indevida = 0.
- Latência p95 <= 30 min.

## 9) Impacto para PO/PM

- Impacto em escopo: muda o início da jornada do Consignado CLT (uma etapa a mais antes do
  consentimento) e adiciona um novo resultado possível pós-consulta. Não depende de nenhuma
  mudança de backend para a pergunta de elegibilidade em si (é só UI); a tela pós-consulta
  precisa que o time técnico defina os motivos reais de negativa antes de sair do genérico.
- Riscos e dependências: a tela `clt_inelegivel_consulta` está pronta e testável
  (`?resultado=inelegivel` no loading), mas só mostra uma mensagem genérica até o time técnico
  confirmar quais motivos a consulta real pode devolver. A automação de pular etapas pro
  Crédito Pessoal (fora de escopo, seção 2) é uma oportunidade registrada, não uma pendência
  bloqueante.
- Impacto esperado em métricas: menos consultas ao Dataprev sem desfecho útil; aumento esperado
  nas simulações de Crédito Pessoal a partir do cross-sell nas duas telas de inelegibilidade.
- Plano de rollout: pode subir independente de qualquer outra feature em andamento (não tem
  dependência de backend nem de outro PR em termos de lógica de produto); tecnicamente, esta
  branch nasceu em cima da branch do Vida Financeira (Open Finance) só para já carregar o item
  "Vida financeira" no menu principal, que substituiu "Contratos" nessa mesma tela compartilhada
  (`SubPageLayout`). A ordem de merge de PR precisa respeitar essa dependência.

## 10) Open questions

| pergunta | owner | prazo | status |
|---|---|---|---|
| Quais são os motivos reais de inelegibilidade pós-consentimento que a consulta ao Dataprev pode devolver? | Erasmo (backend) / Barreto | [A CONFIRMAR] | aberta |
| Vale a pena registrar a resposta da pergunta de elegibilidade em algum lugar (ex.: evitar perguntar de novo numa nova tentativa), ou ela pode continuar efêmera? | Ellen | [A CONFIRMAR] | aberta |
| Quando o Saque Fácil voltar, ele entra como cross-sell nas telas de inelegibilidade do CLT também? | Barreto | [A CONFIRMAR] | aberta |
| A automação de pular etapas pro Crédito Pessoal (ou iniciar a simulação direto ao responder "Não") entra em que fase? | Barreto | [A CONFIRMAR] | aberta |
