# Design Brief — Leilão CLT (jornada com conta)

**Tipo de tarefa:** Design
**Épico pai:** `[a criar no Jira — épico previsto para a semana de 22/09/2026. Atualizar este campo quando o ID existir.]`
**Responsável:** Ellen Damasceno
**Status:** Sendo feito
**Data de entrega:** 2026-09-18

> **Nota sobre a ordem deste brief:** nesta demanda, o design foi construído e testado em código antes de o épico ser aberto no Jira — a ordem inversa do processo usual (normalmente o brief nasce do épico e guia o design). Este documento é retroativo: descreve a solução já validada em protótipo navegável, para servir de base à abertura do épico e das User Stories de desenvolvimento. Não há uma etapa formal de discovery/pesquisa de usuário documentada antes da solução — a oferta em si (leilão entre instituições parceiras via CTPS Digital) é um dado de entrada do negócio, não uma hipótese testada nesta demanda.

---

## Link da tela

| Artefato | Link |
|---|---|
| Protótipo navegável (código) | Branch `feat/leilao-clt`, PR [#8](https://github.com/ellendamas/design-test-projects/pull/8) |
| Especificação completa (todas as telas, estados, regras) | [`docs/journey-specs/leilao-clt-journey-spec.md`](../journey-specs/leilao-clt-journey-spec.md) |
| Entry point de teste | `/painel?clt=leilao_aprovado` → card "Oferta de Leilão CLT aprovada" → `/leilao` |

> Não há arquivo de Figma nesta demanda — o protótipo é o próprio código React (design-to-code direto), rodando em `npm run dev` dentro de `projetos/taya-app`.

---

## O que esta jornada faz

Um usuário que **já tem conta** no Pode Já e teve seu CPF consultado via CTPS Digital chega com uma oferta de Crédito Consignado CLT **já aprovada** (ganhou um leilão entre instituições parceiras). A jornada cobre: aceitar a oferta → confirmar endereço e forma de recebimento → verificar identidade (Unico) → assinar → ver a confirmação de que o dinheiro está a caminho. Ponto de entrada: card no dashboard. Ponto de saída: tela de sucesso, com CTA para o contrato.

---

## Comportamentos de UX

### 1. Oferta aprovada (`/leilao`)
- Card "Sua oferta" (valor, parcelas, taxa, parceiro), card de previsão de crédito, card de detalhes do consignado (IOF, CET, total a pagar)
- Checkbox de consentimento — CTA "Aceitar e continuar" desabilitada até marcar
- CTA fixa no rodapé da viewport (mobile)

### 2. Dados pendentes — Endereço (`/leilao/dados-pendentes`, etapa 1)
- Formulário/lista de endereço salvo (componente já existente no DS, reaproveitado)
- **Confirmação automática** ao salvar/selecionar — sem botão de "Salvar" à parte — avança direto para a etapa seguinte
- Sem indicador visual de progresso ("Etapa 1 de 2") — decisão deliberada para não dar sensação de jornada longa

### 3. Dados pendentes — Forma de recebimento (`/leilao/dados-pendentes`, etapa 2)
- Título "Para qual conta enviamos o dinheiro?" seguido de 2 opções: Conta bancária / Chave Pix — nenhuma pré-selecionada por padrão
- Escolhido o método, a lista/seleção fica direto na tela; só o formulário de um item novo (conta ou chave) abre em modal/drawer
- Suporta múltiplas contas bancárias **e** múltiplas chaves Pix salvas (até 5 de cada), com edição e exclusão
- Escolher um método limpa o outro (mutuamente exclusivos)
- CTA "Continuar" desabilitada até haver uma conta OU uma chave Pix confirmada

### 4. Verificação de identidade (`/leilao/assinatura`)
- **Estado aviso** (default): explica o redirecionamento para a Unico (ambiente seguro, selfie, assinatura digital), CTA "Continuar para verificação"
- **Estado aguardando** (`?status=aguardando`): usuário saiu antes de concluir — CTA "Reabrir verificação" + link "Cancelar proposta" (abre modal de confirmação)
- **Estado erro** (`?erro=`): 16 categorias possíveis de erro (código inválido, conta inválida, biometria falhou, sessão expirada, etc.), cada uma com headline/subtítulo próprios — CTA "Voltar à oferta"

### 5. Redirecionando para Unico (`/leilao/redirecionando/unico`)
- Tela de transição em tela cheia (gradiente laranja), abre a Unico em nova aba automaticamente após 3s
- Depois de 10s, mostra um botão manual (para o caso de pop-up bloqueado)

### 6. Sucesso (`/leilao/sucesso`)
- Confirmação com resumo (parceiro, valor a receber, parcela mensal, primeira parcela, banco)
- CTA "Ver meu contrato" + link "Voltar para o início"
- **Acessada diretamente por URL nesta fase de protótipo** — depende do callback real da Unico para ser alcançada organicamente (ver Questões em aberto)

### 7. Telas de exceção (`/leilao/expirada`, `/cancelada`, `/falha-averbacao`, `/falha-desembolso`)
- 4 variantes, cada uma com headline/subtítulo fixos e um CTA acionável: "Voltar ao início" (expirada/cancelada) ou "Falar com suporte" — que abre o chat de atendimento (falha na averbação/desembolso)

### 8. Card "Contrato ativo" (dashboard, `/painel`)
- Aparece só para quem criou conta pela jornada **sem conta** e já tem um contrato assinado — sempre em primeira posição em "Para você agora"
- **Some do dashboard depois do primeiro clique** — não fica permanentemente ocupando espaço

---

## Microcopy

| Elemento | Texto |
|---|---|
| Oferta — título | "Proposta aprovada!" |
| Oferta — descrição | "Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo." |
| Oferta — consentimento | "Ao continuar, concordo com os termos do contrato de consentimento realizado e autorizo o desconto das parcelas em folha de pagamento." |
| Oferta — CTA | "Aceitar e continuar" |
| Forma de recebimento — título | "Para qual conta enviamos o dinheiro?" |
| Forma de recebimento — opções | "Conta bancária" / "Chave Pix" |
| Verificação — aviso | "Falta só confirmar sua identidade!" / "Sua oferta de Crédito Consignado CLT já está aprovada. Você será redirecionado para a Unico para verificar sua identidade." |
| Verificação — aguardando | "Aguardando sua verificação" / "Você saiu antes de concluir a verificação de identidade. Toque em Reabrir verificação para continuar de onde parou." |
| Verificação — CTA aviso/aguardando | "Continuar para verificação" / "Reabrir verificação" |
| Cancelamento — modal | "Cancelar proposta" / "Tem certeza que deseja cancelar? Sua proposta será descartada e não poderá ser recuperada." / "Sim, cancelar" / "Não, continuar" |
| Redirecionamento — título | "Abrindo a Unico..." / "Você será direcionado para verificar sua identidade na plataforma da Unico." |
| Sucesso — título | "Dinheiro a caminho, {primeiro nome}!" |
| Sucesso — descrição | "Seu empréstimo foi aprovado. O valor cai na sua conta entre hoje e em até 3 dias úteis." |
| Sucesso — CTAs | "Ver meu contrato" / "Voltar para o início" |
| Erro — expirada | "Sua sessão expirou" / "O prazo para aceitar esta oferta encerrou. Acesse o aplicativo CTPS Digital para solicitar uma nova consulta." |
| Erro — cancelada | "Sua oferta foi cancelada" / "A instituição financeira cancelou esta oferta. Você pode acessar o aplicativo CTPS Digital para participar de uma nova consulta." |
| Erro — falha averbação | "Não foi possível finalizar o registro" / "Ocorreu um problema ao registrar sua proposta na folha de pagamento. Entre em contato com nosso suporte." |
| Erro — falha desembolso | "Tivemos um problema na liberação do valor" / "O contrato foi assinado, mas houve uma falha ao depositar o valor. Nossa equipe já foi notificada. Entre em contato com o suporte." |
| Card dashboard | "Você tem um contrato Consignado CLT ativo!" / "Ver contrato" |

> Tabela completa de erros genéricos (`otp_invalido`, `conta_invalida`, `biometria_falhou`, etc.) em `ErrorScreen.tsx` — reaproveitados de outros produtos, não específicos desta jornada.

---

## Especificações de componentes

- **Layout base:** `SubPageLayout` (header fixo com voltar/título/notificações, sidebar desktop, nav mobile — oculta com `hideNav` nas telas de fluxo linear).
- **Seletores reaproveitados do Design System:** `EnderecoSelector` e `ContaSelector` (`src/components/*`) — ganharam 2 props novos nesta demanda, aditivos e opt-in (não afetam quem já usa os componentes sem eles):
  - `ocultarCabecalho` — esconde o ícone/título/subtítulo interno do componente, para quando a tela já mostra um título próprio antes do seletor.
  - `autoConfirmarSelecao` — confirma a seleção automaticamente (ao salvar um item novo ou selecionar um já salvo), sem exigir um botão de confirmação extra.
- **Componente novo criado nesta demanda:** `PixSelector` (`src/pages/leilao-clt/PixSelector.tsx`) — mesmo padrão visual/interação de `ContaSelector`, mas para chave Pix com suporte a múltiplas chaves salvas. É local a esta jornada — não deve ser usado por outros produtos sem avaliação (o padrão de Pix nos demais fluxos continua sendo um campo único dentro do `ContaSelector`).
- **`ErrorScreen`:** componente compartilhado; 4 categorias novas adicionadas ao `Record` de erros (`leilao_expirada`, `leilao_cancelada`, `leilao_falha_averbacao`, `leilao_falha_desembolso`).
- **`UnicoNotice` / `UnicoAguardando`:** reaproveitados sem alteração do padrão já usado no Consignado CLT.
- **Botões:** CTAs de navegação de tela usam o componente `Button` do Design System (`variant="default"`/`outline`) — não usar botão customizado com cor "inventada" fora do DS.
- **Responsivo:** CTA de avanço fixa na extremidade inferior da viewport em mobile (`fixed bottom-0`), volta a fluir no documento em desktop (`md:relative`).

---

## Decisões e justificativas

| Decisão | Motivo |
|---|---|
| Endereço e forma de recebimento em telas separadas, sem barra de progresso visível | Numa iteração colocando os dois na mesma tela, os dois seletores abriam seus modais de "adicionar" simultaneamente (bug); telas separadas resolvem isso sem reintroduzir a sensação de jornada longa de um wizard com progresso |
| Confirmação automática (sem botão de "Salvar") em endereço/conta/pix | Usuário logado não deveria precisar de uma confirmação extra para dados que ele acabou de digitar — reduz cliques |
| Nenhum método de recebimento pré-selecionado por padrão | Pré-selecionar "Conta bancária" fazia o usuário cair direto no modal de conta ao sair da tela de endereço, sem chance de escolher Pix |
| Conta bancária e chave Pix com o mesmo limite de itens (5) | Paridade de capacidade — antes só o Pix permitia mais de um item cadastrado |
| Card "Contrato ativo" some após o primeiro clique | Sem essa regra, ficaria permanentemente ocupando a primeira posição em "Para você agora", competindo com cards realmente acionáveis |
| Jornada com conta é um conjunto de arquivos/rotas totalmente separado da jornada sem conta (nenhuma checagem de auth state dentro de componente compartilhado) | Evita bug já visto neste protótipo: uma tela de redirecionamento decidindo o destino por auth state levava usuários da jornada errada para a outra, por `localStorage` de teste deixado para trás |

---

## Questões em aberto para o PO

1. Qual o contrato real do callback da Unico (verificação de identidade + assinatura)? Hoje a tela de sucesso é alcançada só por navegação direta de URL — não existe nenhum evento real fechando esse loop. Isso bloqueia a User Story de integração com a Unico.
2. Qual o endpoint real de cálculo de IOF/CET/taxas? Hoje é uma aproximação calculada no cliente (mesma fórmula do Consignado CLT).
3. O card "Contrato ativo" deveria ter algum limite de tempo além de "sumir no primeiro clique" (ex.: expirar depois de N dias sem clique)?
4. Nenhuma instrumentação de analytics existe ainda — uma proposta de taxonomia de eventos já está documentada em `docs/journey-specs/leilao-clt-journey-spec.md` (seção 7); precisa de validação do PO/Analytics antes de virar User Story.

---

## O que não está coberto neste Design Brief

- Jornada **sem conta** (guest, via link) → coberta no brief irmão `leilao-clt-sem-conta-design-brief.md`.
- Tela de contrato (`/contratos/clt-001`) → já existe no app, fora do escopo desta demanda (só reaproveitada como destino).
- Autenticação real via token do link, endpoint de MFA e integração real com a Unico → fora do escopo de design; são integrações de backend a serem especificadas em User Stories técnicas separadas.
