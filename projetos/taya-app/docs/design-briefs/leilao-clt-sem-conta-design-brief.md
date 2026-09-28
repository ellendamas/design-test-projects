# Design Brief — Leilão CLT (jornada sem conta)

**Tipo de tarefa:** Design
**Épico pai:** `[a criar no Jira — épico previsto para a semana de 22/09/2026. Atualizar este campo quando o ID existir.]`
**Responsável:** Ellen Damasceno
**Status:** Sendo feito
**Data de entrega:** 2026-09-28 (atualizado — entrega original em 2026-09-18)

> **Nota sobre a ordem deste brief:** ver nota equivalente no brief irmão (`leilao-clt-com-conta-design-brief.md`) — o design foi construído e testado em código antes do épico ser aberto no Jira; este documento é retroativo.
>
> **Atualização 2026-09-28:** a jornada perdeu duas telas ("Dados básicos" e "Contrato simplificado") — ver seção "Decisões e justificativas" e o journey-spec (seção 6, Diff de UX) para o histórico completo.

---

## Link da tela

| Artefato | Link |
|---|---|
| Protótipo navegável (código) | Branch `main`, repositório `ellendamas/design-test-projects` |
| Especificação completa (todas as telas, estados, regras) | [`docs/journey-specs/leilao-clt-sem-conta-journey-spec.md`](../journey-specs/leilao-clt-sem-conta-journey-spec.md) |
| Entry point de teste | `/leilao/oferta?token=mock` (simula a chegada pelo link, sem login) |

> Não há arquivo de Figma completo desta demanda — só uma referência pontual de layout para o bloco de parceria Celcoin (Figma, node `273:232`). O protótipo em si é o próprio código React, rodando em `npm run dev` dentro de `projetos/taya-app`.

---

## O que esta jornada faz

Um usuário que **nunca usou o app** recebe um link (SMS/e-mail, fora do app) com uma oferta de Crédito Consignado CLT já aprovada. Ele completa toda a jornada — aceitar a oferta, confirmar CPF/nome e informar e-mail, celular, endereço e forma de recebimento (tudo numa única tela), verificar identidade por SMS e pela Unico, assinar — **sem nenhuma tela de login/cadastro tradicional no meio do caminho**. Na tela de sucesso, ele é informado que vai receber a proposta e a CCB por e-mail; criar uma conta pra acompanhar tudo pelo app é uma escolha **opcional**, não um passo obrigatório. Ponto de entrada: link externo. Ponto de saída: tela de sucesso (destino final para quem não cria conta) ou dashboard logado (para quem cria).

---

## Comportamentos de UX

### 1. Oferta aprovada (`/leilao/oferta?token=`)
- Mesmo conteúdo de oferta da jornada com conta (valor, parcelas, taxa, detalhes em accordion, bloco de parceria Pode Já × Celcoin)
- Sem header/logo da Pode Já nesta tela especificamente (`ocultarHeader`) — a logo volta a aparecer a partir da tela seguinte
- Checkbox de consentimento, CTA "Aceitar oferta" (vai direto para Confirmar dados) + CTA secundária "Já tenho conta" (leva ao login e, a partir daí, segue pela jornada com conta)
- **CTAs não fixas no rodapé** — ficam no fluxo do conteúdo, decisão deliberada porque a tela tem bastante texto para ler e um rodapé fixo cobriria conteúdo durante o scroll
- Rodapé com link para Termos de Uso / Política de Privacidade (modal)

### 2. Confirmar dados (`/leilao/confirmar-dados`)
- Uma única tela reunindo: CPF/nome (bloqueados, ícone de cadeado), e-mail/celular (editáveis via modal, **nascem vazios** — não existe mais uma tela anterior que os pré-preencha), endereço (via modal) e forma de recebimento (via modal)
- **Tudo em modal/drawer, inclusive a lista de contas/endereços salvos** — diferente da jornada com conta, aqui a tela nunca "abre" um seletor inteiro no corpo da página, para reforçar a sensação de que é uma única tela
- Endereço e conta bancária limitados a 1 item cada nesta jornada (na jornada com conta, múltiplos são permitidos)
- Botão de cada linha alterna "Adicionar" (vazio) / "Alterar" (preenchido) — inclusive e-mail/celular agora, já que podem nascer vazios
- CTA "Continuar" exige e-mail + celular + endereço + (conta OU chave Pix)

### 3. Verificação por SMS / MFA (`/leilao/mfa`)
- Código de 6 dígitos, celular mascarado (`+55 (XX) •••••-XXXX`)
- Contador de reenvio de 30s → depois some para "código inválido"

### 4. Verificação de identidade (`/leilao/oferta/assinatura`)
- Mesmos 3 estados da jornada com conta (aviso / aguardando / erro), rota própria (nunca depende de estar logado)

### 5. Redirecionando para Unico (`/leilao/oferta/redirecionando/unico`)
- Idêntico ao da jornada com conta, rota própria

### 6. Sucesso (`/leilao/oferta/sucesso`)
- Resumo (parceiro, valor, parcela, banco) + card de previsão de crédito
- Descrição principal explica que a proposta/CCB chega por e-mail — é o texto que substitui a antiga tela de contrato
- Bloco inferior faz um teaser dos outros produtos do Pode Já, como incentivo (não obrigação) para criar conta
- **Uma única CTA fixa no rodapé:** "Criar conta para acompanhar" — não existe mais um segundo botão, porque não existe mais nada pra "continuar" ver dentro do app

### 7. Criar conta — pós-sucesso (`/leilao/criar-conta`, 2 passos, opcional)
- **Passo 1:** senha numérica de 6 dígitos (com validação contra sequências fracas)
- **Passo 2:** seleção de "o que é importante pra você agora" (mesma lista de necessidades do onboarding principal)
- Ao concluir, cai **direto no dashboard já logado** — sem repetir nome, e-mail, celular ou CPF (já coletados nas etapas anteriores) e sem pedir data de nascimento (fica pendente para depois)
- Layout sem sidebar/menu de usuário logado (usuário ainda não tem conta neste ponto)

### 8. Telas de exceção (`/leilao/oferta/expirada`, `/cancelada`, `/falha-averbacao`, `/falha-desembolso`)
- Mesmas 4 categorias da jornada com conta, mas CTA "Fechar" (leva à home pública `/`, já que não há sessão para "voltar")

---

## Microcopy

| Elemento | Texto |
|---|---|
| Oferta — título | "Oferta aprovada" |
| Oferta — CTAs | "Aceitar oferta" / "Já tenho conta" |
| Oferta — termos | "Ao continuar, você aceita os Termos de Uso e a Política de Privacidade do Pode Já." |
| Oferta — bloco de parceria | "A Celcoin é parceira oficial do leilão de crédito consignado dentro da Carteira de Trabalho Digital." + "Quem cuida da sua contratação a partir de agora é a Pode Já, plataforma digital que conecta você a diversas soluções financeiras." |
| Confirmar dados — título | "Confirme seus dados" / "Revise as informações abaixo para gerar seu contrato." |
| Confirmar dados — rótulos | "CPF", "Nome completo", "E-mail", "Celular", "Endereço de recebimento", "Forma de recebimento" |
| MFA — título | "Confirme seu celular" / "Enviamos um código por SMS para {celular mascarado}." |
| MFA — erros | "Digite o código de 6 dígitos." / "Código inválido. Verifique e tente novamente." |
| Sucesso — título | "Dinheiro a caminho, {nome}!" |
| Sucesso — descrição *(nova)* | "Agora é com a gente! Você vai receber o contrato e os detalhes da sua proposta no e-mail cadastrado assim que estiverem prontos." |
| Sucesso — CTA | "Criar conta para acompanhar" (única) |
| Sucesso — bloco teaser *(novo, substitui "Acompanhe seu contrato")* | "Você acabou de dar o primeiro passo" / "No Pode Já tem muito mais esperando por você, crédito pessoal, FGTS e benefícios que cabem no bolso." |
| Criar conta — passo 1 | "Crie sua senha de acesso" / "Vai ser usada para entrar no app." |
| Criar conta — passo 2 | "Quase lá" / "O que é importante pra você nesse momento?" |
| Erro — genérico (4 categorias) | mesmas do brief da jornada com conta |
| Erro — CTA | "Fechar" (expirada/cancelada) / "Falar com suporte" (falhas) |

**Removido nesta rodada:** microcopy de "Dados básicos" ("Confirme seus dados" / "Precisamos de algumas informações para gerar seu contrato.") e de "Contrato sem conta" ("Este é um contrato de exemplo para fins de demonstração.") — as telas correspondentes foram removidas.

---

## Especificações de componentes

- **Layout base:** `PublicLayout` (header centralizado só com logo, sem sidebar/menu — usado em toda a jornada, exceto a própria tela de oferta, que esconde o header via `ocultarHeader`).
- **Seletores:** mesmos `EnderecoSelector`/`ContaSelector` do Design System, aqui usados **sem** os props `ocultarCabecalho`/`autoConfirmarSelecao` — nesta jornada, a inserção de dados fica inteiramente em modal/drawer, incluindo a lista/seleção (diferente da jornada com conta).
- **Pix:** aqui é um campo único dentro do fluxo de "forma de recebimento" (não usa o `PixSelector` de múltiplas chaves, que é exclusivo da jornada com conta).
- **`ErrorScreen`/`UnicoNotice`/`UnicoAguardando`:** mesmos componentes compartilhados da jornada com conta.
- **Botões:** CTAs usam o componente `Button` do Design System.
- **Responsivo:** CTAs fixas no rodapé variam por tela (oferta = não fixa; confirmar dados, MFA, sucesso, criar conta = fixa).

---

## Decisões e justificativas

| Decisão | Motivo |
|---|---|
| Nenhuma tela de login/cadastro tradicional durante a jornada | Reduzir fricção e TTV — usuário recebe dinheiro sem precisar decidir "vou criar conta?" antes de saber se vale a pena |
| CTAs da tela de oferta não fixas no rodapé | Tela tem bastante texto (composição do empréstimo, detalhes do consignado); CTA fixa cobriria conteúdo durante a leitura/scroll |
| Endereço e forma de recebimento inteiramente em modal/drawer nesta jornada (ao contrário da jornada com conta) | Reforça a sensação de "uma tela só" — mais importante aqui do que na jornada com conta, onde o usuário já confia no app |
| Criação de conta pós-sucesso não repete nenhum dado já coletado | Menos fricção — nome/e-mail/celular/CPF já foram informados antes; só senha e uma pergunta de personalização |
| Layout de "criar conta" usa `PublicLayout` | O layout de usuário logado renderizaria sidebar/menu de conta mesmo com o usuário ainda sem conta — inconsistente com o estado real |
| Rota de redirecionamento para a Unico é hardcoded, sem checar se há usuário logado | Evita que `localStorage` deixado de um teste anterior leve um usuário guest para a tela de assinatura da jornada logada |
| **(nova)** Tela "Dados básicos" removida — e-mail/celular passam a ser preenchidos direto na tela de Confirmar dados | Uma tela a menos entre aceitar a oferta e confirmar tudo; o padrão de "tudo numa tela" já existia pros outros campos, ficava inconsistente ter e-mail/celular isolados numa etapa própria |
| **(nova)** Tela de contrato simplificado removida; CTA "Continuar sem conta" removido da tela de sucesso | Quem não cria conta recebe a proposta e a CCB por e-mail (anexo ou link) — não há mais nada pra essa tela mostrar. A tela de sucesso vira o destino final da jornada guest, sem exigir nenhuma ação |
| **(nova)** Descrição da tela de sucesso reescrita para explicar o envio por e-mail; bloco "Acompanhe seu contrato" trocado por um teaser de outros produtos | O copy antigo prometia acompanhar boletos/histórico, algo que não existe mais para quem não cria conta — o texto novo é preciso sobre o que realmente acontece a seguir |

---

## Questões em aberto para o PO

1. **(nova)** Existe de fato um fluxo de envio de e-mail com a proposta/CCB para quem não cria conta? A tela de sucesso agora promete isso explicitamente — precisa de confirmação do time técnico de que esse envio está no escopo do backend real.
2. "Celcoin" é de fato o nome/identidade exibido para o usuário dentro da Carteira de Trabalho Digital? O bloco de parceria assume isso, mas não foi validado formalmente com o time técnico/CTPS.
3. Qual o contrato real de decodificação do token do link (`?token=`)? Hoje os dados do lead (nome "Ana Souza", CPF "123.456.789-00") são fixos, independentemente do valor do token.
4. Qual o endpoint real de envio/validação do código de MFA? Hoje o código é fixo (`123456`), sem expiração implementada.
5. A jornada deveria, em algum momento após a criação de conta, solicitar a data de nascimento do usuário (hoje fica pendente, sem nenhum card de "completar cadastro" implementado ainda)?
6. Qual o contrato real do callback da Unico? Mesma pendência do brief da jornada com conta — a tela de sucesso hoje só é alcançada por navegação direta de URL.
7. Nenhuma instrumentação de analytics existe ainda — proposta de taxonomia já documentada em `docs/journey-specs/leilao-clt-sem-conta-journey-spec.md` (seção 7), compartilhada com a jornada com conta via `flow_name`; precisa de validação do PO/Analytics.

---

## O que não está coberto neste Design Brief

- Jornada **com conta** (usuário logado) → coberta no brief irmão `leilao-clt-com-conta-design-brief.md`.
- Tela de login (`/acesso`) acionada por "Já tenho conta" → fluxo já existente no app, fora do escopo desta demanda.
- Autenticação real via token do link, endpoint de MFA, integração real com a Unico e envio real do e-mail de proposta/CCB → fora do escopo de design; a serem especificadas em User Stories técnicas separadas.
