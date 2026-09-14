# QA Brief — Central de Ajuda (FAQ + Chat com IA)

**Design Brief aprovado verbalmente pelo PO (Vinícius Barreto) em 29/07/2026 — sem ticket formal.**

Journey spec de referência: [`docs/journey-specs/central-ajuda-journey-spec.md`](../journey-specs/central-ajuda-journey-spec.md)

## User Stories

1. Como usuário autenticado, quero acessar perguntas frequentes organizadas por produto, para resolver dúvidas sem precisar contatar o suporte.
2. Como usuário autenticado, quero iniciar uma conversa com o assistente de IA, para obter respostas personalizadas às minhas dúvidas.
3. Como usuário no meio de uma contratação, quero que o chat fique disponível minimizado, para poder continuar a conversa ao terminar o fluxo.

## Critérios de aceite

**FAQ**
- [ ] Accordion abre e fecha ao toque/clique.
- [ ] Dentro de cada categoria de produto, apenas 1 pergunta fica aberta por vez — mas categorias diferentes são independentes entre si (pode haver uma pergunta aberta em "Crédito Consignado CLT" e outra em "FGTS" ao mesmo tempo).
- [ ] Todas as 6 categorias de produto visíveis com seus labels corretos: Crédito Consignado CLT, Antecipação FGTS, Crédito Pessoal, Assistências, Energia, Seguro de Vida.

**Chat — abertura e visibilidade**
- [ ] Botão flutuante NÃO aparece antes de haver mensagem do usuário (`mensagens.length > 1` — a mensagem inicial do assistente sozinha não conta como conversa ativa).
- [ ] Fora da tela `/duvidas`, o botão flutuante só aparece se o usuário minimizou uma conversa ativa (não aparece "do nada" em nenhuma outra tela).
- [ ] Clicar no botão flutuante minimizado expande o painel na tela atual, **sem navegar** para `/duvidas`.
- [ ] Ao navegar para fora de `/duvidas` com o chat aberto (sem ter clicado em minimizar), ele minimiza sozinho.

**Chat — minimizar, fechar, tooltip**
- [ ] Tooltip "Você pode acompanhar sua conversa enquanto navega no app" aparece exatamente 1 vez por sessão, na primeira minimização, e some sozinho após ~4s.
- [ ] Botão Minimizar (ícone `Minus`) fecha só o painel — não abre confirmação, não reseta a conversa.
- [ ] Botão X abre modal "Encerrar conversa?" — não encerra direto.
- [ ] No modal: "Cancelar" fecha só o modal, mantendo a conversa como estava.
- [ ] No modal: "Sim, encerrar" reseta o histórico (volta para a mensagem inicial do assistente) e some com o botão flutuante (sem conversa ativa).

**Chat — erro e integração**
- [ ] Falha na chamada ao agente exibe a mensagem "Desculpe, ocorreu um erro. Por favor, tente novamente." — o chat não trava nem quebra a tela.
- [ ] **Atenção QA:** hoje o endpoint do agente (`taya-ai-engine`) não responde a `OPTIONS` (preflight CORS), então **toda tentativa real de enviar mensagem pelo navegador cai no fallback de erro** — isso é esperado até o time do AI Engine ajustar o CORS, não é um bug do frontend. Validar comportamento visual do fallback, não a resposta em si.
- [ ] Badge de não lidas aparece no botão flutuante quando uma resposta chega com o chat minimizado, e some ao reabrir.

**Chat — mobile**
- [ ] Mobile usa drawer com `dismissible={false}` — não fecha arrastando para baixo nem tocando fora do conteúdo.
- [ ] Modal de confirmação de encerrar continua clicável no mobile mesmo com o drawer aberto por trás (checar `pointer-events`, foi um bug já corrigido — não deve regredir).

## Edge cases prioritários

- Usuário abre chat, navega para outra tela, volta para `/duvidas` — histórico preservado.
- Usuário envia mensagem e fecha/minimiza rápido, antes da resposta chegar — resposta some assim que chega, com toast + badge (chat não estava visível no momento da resposta).
- Usuário encerra conversa (modal "Sim, encerrar") e reabre — volta a mensagem inicial do assistente, sem vestígio da conversa anterior.
- API do agente offline/CORS bloqueado (cenário atual) — mensagem de erro amigável, chat não quebra, usuário consegue tentar de novo.
- **FAQ de produto oculto (FGTS):** o produto FGTS está temporariamente oculto em outras partes do app (dashboard, listagem de produtos — ver comentários `FGTS OCULTO TEMPORARIAMENTE` em `App.tsx`), mas a categoria "Antecipação FGTS" **continua aparecendo normalmente** na tela de Dúvidas, pois `src/data/faq.ts` não tem nenhuma lógica de visibilidade condicional. **Decisão pendente com produto:** isso é intencional (FAQ pode ficar visível mesmo com produto pausado) ou precisa ser ocultado também?
- Múltiplas abas abertas: cada aba tem seu próprio estado de chat — não há sincronização (aceitável para v1, mas vale confirmar que não gera confusão perceptível para o usuário).
