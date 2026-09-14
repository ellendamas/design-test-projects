---
agent: ellen-damasceno
project: podeja-canal-direto
journey: central-ajuda-chat-ia
platform: Web (PWA Mobile-first)
date: 2026-07-30
depends_on: [taya-ai-engine]
status: draft
---

## Resumo executivo

- **Problema:** usuários sem canal de suporte integrado ao app — eram direcionados para WhatsApp/telefone externos (botões no card "Ficou alguma dúvida?" do painel).
- **Resultado esperado:** usuário encontra respostas às dúvidas frequentes e acessa atendimento via chat com IA sem sair do app.
- **Impacto:** redução de volume no suporte externo, experiência de atendimento integrada.

## Escopo

- Novo: tela `/duvidas` (Central de Ajuda) com FAQ centralizado + acesso ao chat.
- Novo: `ChatBubble` — componente global, montado uma única vez em `App.tsx` (ao lado do `<Toaster />`, fora do `<Routes>`), visível em todas as telas autenticadas conforme regras da seção FAQ-02.
- Novo: `src/data/faq.ts` como fonte de verdade única para as FAQs dos 6 produtos (Consignado CLT, FGTS, Crédito Pessoal, Assistências, Energia, Seguro de Vida).
- Novo: `ChatContext` (`src/context/ChatContext.tsx`) — estado do chat compartilhado globalmente via `ChatProvider`, registrado em `main.tsx`.
- Alterado: card "Ficou alguma dúvida?" do painel (dashboard) — botões de WhatsApp/Ligar substituídos por um único botão "Acessar atendimento" que navega para `/duvidas`.
- **Fora de escopo v1:**
  - Histórico persistente entre sessões (hoje em memória — `useState` no `ChatProvider`, perdido ao recarregar a página).
  - Transferência para atendente humano.
  - Sincronização do chat entre abas/dispositivos.

## Telas/componentes

| screen_id | nome | status |
|-----------|------|--------|
| FAQ-01 | Tela de Dúvidas (`/duvidas`) | new |
| FAQ-02 | ChatBubble (componente global flutuante) | new |
| FAQ-03 | ChatPainel (painel de conversa) | new |

## Spec por tela

### FAQ-01 — Dúvidas (`src/pages/duvidas/DuvidasPage.tsx`)

- FAQ organizado por produto usando `src/data/faq.ts` — 6 chaves: `consignado-clt`, `fgts`, `credito-pessoal`, `assistencias`, `energia`, `seguro-vida`. Labels de exibição vêm de `FAQ_CATEGORIAS` (ex.: `credito-pessoal` → "Crédito Pessoal").
- Cada categoria renderiza seu próprio `<Accordion type="single" collapsible>` (componente interno do projeto em `src/components/ui/accordion.tsx`, não é o Shadcn/Radix — implementação própria sem dependência nova). **Importante:** o comportamento "só 1 pergunta aberta por vez" vale **dentro de cada categoria**, não na tela inteira — é possível ter uma pergunta aberta em "Crédito Consignado CLT" e outra aberta em "FGTS" simultaneamente, pois cada categoria é uma instância separada do Accordion.
- Box de atendimento (footer da tela): mesmo layout visual do card "Ficou alguma dúvida?" do painel (`Card` com imagem da atendente à direita, `/images/card-dash-contact.png`, fundo `#EDE3DC`) — botão único "Acessar atendimento" (`variant="outline"`) chama `abrirChat()` do `ChatContext`, com badge de não lidas sobreposto ao botão quando `naoLidas > 0`.
- Estados: FAQ estático (sem loading, dados vêm de import local); o chat em si (loading/erro) é responsabilidade do `ChatPainel` (FAQ-03), não desta tela.

### FAQ-02 — ChatBubble (`src/components/ChatBubble.tsx`)

- Não aparece em `/`, `/boas-vindas`, `/acesso`, `/cadastro` (array `ROTAS_SEM_CHAT`), nem se `getStoredUser()` for `null`.
- **Sem conversa ativa** (`mensagens.length <= 1` — só a mensagem inicial do assistente): o botão flutuante **não renderiza em nenhuma tela**, incluindo `/duvidas` (que já tem seu próprio CTA "Acessar atendimento").
- **Painel expandido**: renderiza sempre que `aberto === true`, independentemente da rota atual — abrir o chat (seja pela Central de Ajuda ou pela bolha minimizada em qualquer outra tela) expande o painel na própria tela onde o usuário está, sem navegar.
- **Bolha minimizada**: fora de `/duvidas`, só aparece se `minimizado === true` (usuário minimizou uma conversa ativa anteriormente). Se o chat foi fechado via modal de confirmação (não minimizado), a bolha não aparece em nenhuma tela — só volta a existir reabrindo pela Central de Ajuda.
- Ao navegar para fora de `/duvidas` com o chat `aberto`, ele minimiza automaticamente (efeito em `ChatBubble`) — evita o painel expandido "vazar" fixo em telas sem relação com o chat.
- Desktop: painel fixo `360×520px` (`h-[520px] w-[360px]`), canto inferior direito, renderizado via `createPortal(document.body)` (necessário porque wrappers de transição de página com `framer-motion` aplicam `transform` num ancestral, o que quebraria `position: fixed`).
- Mobile: `Drawer` (vaul) de `85vh`, `dismissible={false}` — não fecha arrastando nem tocando fora do conteúdo; só os botões do header (Minimizar/Fechar) controlam o estado.
- Tooltip "Você pode acompanhar sua conversa enquanto navega no app" aparece 4s ao minimizar pela primeira vez na sessão (`useRef` `tooltipJaMostrado`, não reaparece depois).
- Badge de não lidas (vermelho, contador) no botão flutuante quando `naoLidas > 0`; zera ao reabrir o chat (`abrirChat()`).
- Botão **X** no header do `ChatPainel` abre modal de confirmação ("Encerrar conversa?") em vez de fechar direto — só "Sim, encerrar" chama `encerrarConversa()`.
- Botão **Minimizar** (ícone `Minus`) não abre confirmação — só chama `minimizarChat()`, sem resetar nada.
- **Não existe** hoje distinção de "rota bloqueante" (jornada de contratação) com botão desabilitado/ponto âmbar — essa lógica foi implementada e depois removida por decisão de produto durante o desenvolvimento; o comportamento atual é o descrito acima (painel abre em qualquer tela onde o usuário estiver).

### FAQ-03 — ChatPainel (dentro de `ChatBubble.tsx`)

- Mensagem inicial do assistente ao carregar o `ChatProvider`: *"Olá! Sou o assistente do Pode Já. Como posso te ajudar hoje?"*.
- Header do painel: avatar (ícone `Robot` como fallback + `<img src="/images/assistente-avatar.png">` sobreposta, com `onError` ocultando a imagem se falhar) e título **"Conversando com Bia"** — nome e foto são placeholders (ver Open questions).
- Lista de mensagens em `<div className="overflow-y-auto">` (não é o componente `ScrollArea` do Shadcn — não está instalado no projeto; usa scroll nativo).
- Indicador de "digitando": 3 bolinhas com `animate-bounce` enquanto `carregando === true`.
- Integração com o agente: `POST https://taya-ai-engine-571144798728.southamerica-east1.run.app/chat`, body `{ message, sessionId }`, resposta via `text/event-stream` (`data: {"text": "..."}` até `data: [DONE]`). Contrato **não documentado publicamente** (endpoint `/docs/json` retorna 404) — validado manualmente testando o serviço direto.
- Erro de API (fetch falha, resposta não-ok, ou `OPTIONS` bloqueado por CORS — ver Regras críticas) é tratado com mensagem amigável: *"Desculpe, ocorreu um erro. Por favor, tente novamente."*.

## Regras de negócio críticas

- Chat em memória (`useState` dentro do `ChatProvider`) — histórico perdido ao recarregar a página. TODO: confirmar com devs se deve persistir (sessionStorage vs. localStorage).
- `encerrarConversa()` no `ChatContext` reseta tudo: `mensagens` volta para a mensagem inicial, `aberto`, `minimizado` e `naoLidas` voltam ao estado zerado.
- FAQ centralizado: alterar `src/data/faq.ts` reflete automaticamente em todas as 6 landings de produto (cada uma faz `const faq = FAQ["<chave>"]`) e na tela de Dúvidas.
- **Bloqueio técnico conhecido:** o endpoint `/chat` do `taya-ai-engine` não responde a requisições `OPTIONS` (preflight CORS) — retorna 404. Isso significa que, hoje, o chat **não completa respostas reais quando chamado direto do navegador** (o `fetch` falha antes de enviar o `POST`); o app cai no fallback de mensagem de erro. Depende do time do AI Engine liberar CORS na rota para funcionar de ponta a ponta.

## Eventos Amplitude

Todos com `qa_status: pending` — nenhum evento de analytics foi implementado no código ainda; lista abaixo é a proposta de instrumentação, não o estado atual.

- `faq_viewed` — entrada na tela de dúvidas
- `faq_question_opened` — accordion aberto (propriedades: `product_key`, `question_index`)
- `chat_opened` — chat aberto (propriedade `trigger_source`: `duvidas_button` | `floating_bubble`)
- `chat_message_sent` — mensagem enviada pelo usuário
- `chat_response_received` — resposta do agente recebida
- `chat_minimized` — chat minimizado
- `chat_closed` — conversa encerrada via modal de confirmação
- `chat_error` — erro de API do agente

## Open questions

- Histórico da conversa: sessionStorage vs. localStorage — confirmar com devs.
- Nome e avatar definitivos do assistente ("Bia" é placeholder) — aguardando marketing.
- Número de WhatsApp/telefone para fallback se o agente falhar — aguardando produto (hoje não existe fallback de contato humano na jornada do chat).
- CORS do endpoint `/chat` do `taya-ai-engine` — depende do time do AI Engine para o chat funcionar de fato em produção.
