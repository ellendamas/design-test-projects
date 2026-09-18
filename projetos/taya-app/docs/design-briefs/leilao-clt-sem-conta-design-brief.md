# Design Brief — Leilão CLT (jornada sem conta)

**Tipo de tarefa:** Design
**Épico pai:** `[a criar no Jira — épico previsto para a semana de 22/09/2026. Atualizar este campo quando o ID existir.]`
**Responsável:** Ellen Damasceno
**Status:** Sendo feito
**Data de entrega:** 2026-09-18

> **Nota sobre a ordem deste brief:** ver nota equivalente no brief irmão (`leilao-clt-com-conta-design-brief.md`) — o design foi construído e testado em código antes do épico ser aberto no Jira; este documento é retroativo.

---

## Link da tela

| Artefato | Link |
|---|---|
| Protótipo navegável (código) | Branch `feat/leilao-clt`, PR [#8](https://github.com/ellendamas/design-test-projects/pull/8) |
| Especificação completa (todas as telas, estados, regras) | [`docs/journey-specs/leilao-clt-journey-spec.md`](../journey-specs/leilao-clt-journey-spec.md) |
| Entry point de teste | `/leilao/oferta?token=mock` (simula a chegada pelo link, sem login) |

> Não há arquivo de Figma nesta demanda — o protótipo é o próprio código React, rodando em `npm run dev` dentro de `projetos/taya-app`.

---

## O que esta jornada faz

Um usuário que **nunca usou o app** recebe um link (SMS/e-mail, fora do app) com uma oferta de Crédito Consignado CLT já aprovada. Ele completa toda a jornada — aceitar a oferta, informar e-mail/celular, confirmar endereço e forma de recebimento, verificar identidade por SMS e pela Unico, assinar — **sem nenhuma tela de login/cadastro tradicional no meio do caminho**. Só ao final, na tela de sucesso, ele escolhe se quer criar uma conta para acompanhar o contrato ou seguir sem conta. Ponto de entrada: link externo. Ponto de saída: contrato disponível, com ou sem conta criada.

---

## Comportamentos de UX

### 1. Oferta aprovada (`/leilao/oferta?token=`)
- Mesmo conteúdo de oferta da jornada com conta (valor, parcelas, taxa, detalhes)
- Checkbox de consentimento, CTA "Aceitar oferta" + CTA secundária "Já tenho conta" (leva ao login e, a partir daí, segue pela jornada com conta)
- **CTAs não fixas no rodapé** — ficam no fluxo do conteúdo, decisão deliberada porque a tela tem bastante texto para ler e um rodapé fixo cobriria conteúdo durante o scroll
- Rodapé com link para Termos de Uso / Política de Privacidade (modal)

### 2. Dados básicos (`/leilao/dados`)
- Campos: e-mail e celular (CPF/nome já vêm do token, não aparecem aqui)
- CTA "Continuar" desabilitada até e-mail válido e celular com 10+ dígitos

### 3. Confirmar dados (`/leilao/confirmar-dados`)
- Uma única tela reunindo: CPF/nome (bloqueados, ícone de cadeado), e-mail/celular (editáveis via modal), endereço (via modal) e forma de recebimento (via modal)
- **Tudo em modal/drawer, inclusive a lista de contas/endereços salvos** — diferente da jornada com conta, aqui a tela nunca "abre" um seletor inteiro no corpo da página, para reforçar a sensação de que é uma única tela
- Endereço e conta bancária limitados a 1 item cada nesta jornada (na jornada com conta, múltiplos são permitidos)
- CTA "Continuar" exige e-mail + celular + endereço + (conta OU chave Pix)

### 4. Verificação por SMS / MFA (`/leilao/mfa`)
- Código de 6 dígitos, celular mascarado (`+55 (XX) •••••-XXXX`)
- Contador de reenvio de 30s → depois some para "código inválido"

### 5. Verificação de identidade (`/leilao/oferta/assinatura`)
- Mesmos 3 estados da jornada com conta (aviso / aguardando / erro), rota própria (nunca depende de estar logado)

### 6. Redirecionando para Unico (`/leilao/oferta/redirecionando/unico`)
- Idêntico ao da jornada com conta, rota própria

### 7. Sucesso (`/leilao/oferta/sucesso`)
- Resumo (parceiro, valor, parcela, banco) + bloco explicando o benefício de criar conta
- **Duas CTAs fixas no rodapé:** "Criar conta para acompanhar" e "Continuar sem conta" — aqui, diferente da tela de oferta, são fixas porque o conteúdo é curto e não há risco de cobrir texto

### 8. Criar conta — pós-sucesso (`/leilao/criar-conta`, 2 passos)
- **Passo 1:** senha numérica de 6 dígitos (com validação contra sequências fracas)
- **Passo 2:** seleção de "o que é importante pra você agora" (mesma lista de necessidades do onboarding principal)
- Ao concluir, cai **direto no dashboard já logado** — sem repetir nome, e-mail, celular ou CPF (já coletados nas etapas anteriores) e sem pedir data de nascimento (fica pendente para depois)
- Layout sem sidebar/menu de usuário logado (usuário ainda não tem conta neste ponto)

### 9. Contrato simplificado sem conta (`/leilao/contrato`)
- Versão da tela de contrato já existente no app, sem as seções sensíveis (dados de emitente/depósito, quitação antecipada)
- CTA fixa: "Baixar contrato"

### 10. Telas de exceção (`/leilao/oferta/expirada`, `/cancelada`, `/falha-averbacao`, `/falha-desembolso`)
- Mesmas 4 categorias da jornada com conta, mas CTA "Fechar" (leva à home pública `/`, já que não há sessão para "voltar")

---

## Microcopy

| Elemento | Texto |
|---|---|
| Oferta — título | "Oferta aprovada" |
| Oferta — CTAs | "Aceitar oferta" / "Já tenho conta" |
| Oferta — termos | "Ao continuar, você aceita os Termos de Uso e a Política de Privacidade do Pode Já." |
| Dados básicos — título | "Confirme seus dados" / "Precisamos de algumas informações para gerar seu contrato." |
| Confirmar dados — título | "Confirme seus dados" / "Revise as informações abaixo para gerar seu contrato." |
| Confirmar dados — rótulos | "CPF", "Nome completo", "E-mail", "Celular", "Endereço de recebimento", "Forma de recebimento" |
| MFA — título | "Confirme seu celular" / "Enviamos um código por SMS para {celular mascarado}." |
| MFA — erros | "Digite o código de 6 dígitos." / "Código inválido. Verifique e tente novamente." |
| Sucesso — título | "Dinheiro a caminho, {nome}!" |
| Sucesso — CTAs | "Criar conta para acompanhar" / "Continuar sem conta" |
| Sucesso — bloco de conta | "Acompanhe seu contrato" (explica o benefício de criar conta) |
| Criar conta — passo 1 | "Crie sua senha de acesso" / "Vai ser usada para entrar no app." |
| Criar conta — passo 2 | "Quase lá" / "O que é importante pra você nesse momento?" |
| Contrato sem conta — aviso | "Este é um contrato de exemplo para fins de demonstração." |
| Erro — genérico (4 categorias) | mesmas do brief da jornada com conta |
| Erro — CTA | "Fechar" (expirada/cancelada) / "Falar com suporte" (falhas) |

---

## Especificações de componentes

- **Layout base:** `PublicLayout` (header centralizado só com logo, sem sidebar/menu — usado em toda a jornada, inclusive na tela de criar conta, que **antes** usava por engano o layout de usuário logado e foi corrigida nesta demanda).
- **Seletores:** mesmos `EnderecoSelector`/`ContaSelector` do Design System, aqui usados **sem** os props `ocultarCabecalho`/`autoConfirmarSelecao` — nesta jornada, a inserção de dados fica inteiramente em modal/drawer, incluindo a lista/seleção (diferente da jornada com conta).
- **Pix:** aqui é um campo único dentro do fluxo de "forma de recebimento" (não usa o `PixSelector` de múltiplas chaves, que é exclusivo da jornada com conta).
- **`ErrorScreen`/`UnicoNotice`/`UnicoAguardando`:** mesmos componentes compartilhados da jornada com conta.
- **Botões:** CTAs usam o componente `Button` do Design System.
- **Responsivo:** CTAs fixas no rodapé variam por tela conforme a decisão de UX documentada acima (oferta = não fixa; sucesso, dados básicos, confirmar dados, MFA, criar conta, contrato = fixa).

---

## Decisões e justificativas

| Decisão | Motivo |
|---|---|
| Nenhuma tela de login/cadastro tradicional durante a jornada | Reduzir fricção e TTV — usuário recebe dinheiro sem precisar decidir "vou criar conta?" antes de saber se vale a pena |
| CTAs da tela de oferta não fixas no rodapé | Tela tem bastante texto (composição do empréstimo, detalhes do consignado); CTA fixa cobriria conteúdo durante a leitura/scroll |
| Endereço e forma de recebimento inteiramente em modal/drawer nesta jornada (ao contrário da jornada com conta) | Reforça a sensação de "uma tela só" — mais importante aqui do que na jornada com conta, onde o usuário já confia no app |
| Criação de conta pós-sucesso não repete nenhum dado já coletado | Menos fricção — nome/e-mail/celular/CPF já foram informados antes; só senha e uma pergunta de personalização |
| Layout de "criar conta" trocado para `PublicLayout` | O layout anterior (de usuário logado) renderizava sidebar/menu de conta mesmo com o usuário ainda sem conta — inconsistente com o estado real |
| Rota de redirecionamento para a Unico é hardcoded, sem checar se há usuário logado | Evita que `localStorage` deixado de um teste anterior leve um usuário guest para a tela de assinatura da jornada logada |

---

## Questões em aberto para o PO

1. Qual o contrato real de decodificação do token do link (`?token=`)? Hoje os dados do lead (nome "Ana Souza", CPF "123.456.789-00") são fixos, independentemente do valor do token.
2. Qual o endpoint real de envio/validação do código de MFA? Hoje o código é fixo (`123456`), sem expiração implementada.
3. A jornada deveria, em algum momento após a criação de conta, solicitar a data de nascimento do usuário (hoje fica pendente, sem nenhum card de "completar cadastro" implementado ainda)?
4. Qual o contrato real do callback da Unico? Mesma pendência do brief da jornada com conta — a tela de sucesso hoje só é alcançada por navegação direta de URL.
5. Nenhuma instrumentação de analytics existe ainda — proposta de taxonomia já documentada em `docs/journey-specs/leilao-clt-journey-spec.md` (seção 7), compartilhada com a jornada com conta via `flow_name`; precisa de validação do PO/Analytics.

---

## O que não está coberto neste Design Brief

- Jornada **com conta** (usuário logado) → coberta no brief irmão `leilao-clt-com-conta-design-brief.md`.
- Tela de login (`/acesso`) acionada por "Já tenho conta" → fluxo já existente no app, fora do escopo desta demanda.
- Autenticação real via token do link, endpoint de MFA e integração real com a Unico → fora do escopo de design; a serem especificadas em User Stories técnicas separadas.
