# Edge cases Canal Direto — copy alinhado com o produto

Referência: `docs/Edge cases — Canal Direto.html` (inventário do James, FP-606/607/608/609/613).
Data: 2026-10-06 · Atualizado: 2026-10-06 (sem CTA de suporte, copy existente mantido)

## Como eu li o material do James

O documento dele é um levantamento técnico correto — mapeou certinho os triggers, rotas e
call-sites. O problema é só o copy: foi escrito direto no código pelas squads, sem passar pelo
design, então mistura registro formal e informal, reinventa padrões que a gente já tem definidos
em outras telas do Leilão, e em alguns casos duplica uma tela que **já existe com copy aprovado**
em outro lugar do protótipo.

Abaixo, o alinhamento por item: o que já temos pronto (reaproveitar exatamente como está, sem
mexer) e o que é novo (copy proposto na nossa voz). **Nenhuma dessas telas ganha CTA de suporte
por enquanto** — onde o copy de produção já tem "Falar com suporte" (FalhaAverbacaoPage,
FalhaDesembolsoPage), isso continua como está; nas telas novas, não estou adicionando essa opção.

---

## A. Support screen — 6 variantes

### A1 · Link expirado
**Já existe, mantém exatamente como está** — categoria `leilao_expirada` em `ErrorScreen.tsx`, já
usada em `ExpiradaPage`/`ExpiradaPublicaPage`. Não precisa de nenhuma mudança.

- Título: "Sua sessão expirou"
- Corpo: "O prazo para aceitar esta oferta encerrou. Acesse o aplicativo CTPS Digital para solicitar uma nova consulta."
- CTA: Fechar

*(James tinha: "Esse link já não vale mais" / CTA "Falar com a gente no WhatsApp" + "Voltar" — não usar, a versão acima já é a aprovada.)*

### A2 · Proposta cancelada
**Já existe, mantém exatamente como está** — categoria `leilao_cancelada`, já usada em
`CanceladaPage`/`CanceladaPublicaPage`. Não precisa de nenhuma mudança.

- Título: "Sua oferta foi cancelada"
- Corpo: "A instituição financeira cancelou esta oferta. Você pode acessar o aplicativo CTPS Digital para participar de uma nova consulta."
- CTA: Voltar ao início

*(James tinha: "Essa proposta foi cancelada" / CTA "Falar com a gente no WhatsApp" + "Voltar" — não usar.)*

### A3 · Link já usado
**Categoria nova — concordo com o James: não ativar agora.** `reason="consumed"` não tem nenhum
call-site hoje; o link reaberto depois de assinado cai no fallback genérico (A6). Deixo o rascunho
só pra quando o PM decidir ativar — não é prioridade:

- Título: Você já concluiu essa proposta
- Corpo: Essa oferta já foi aceita anteriormente. Se você já tem conta no Pode Já, entre para acompanhar os detalhes.
- CTA: Entrar na minha conta (se já tiver cadastro) ou Voltar ao início (se não)

### A4 · Link de outra pessoa
**Categoria nova.** Mesma ideia do James, só mais direta — nosso padrão de subtítulo é uma frase
curta, não uma explicação passo a passo.

| | James (atual) | Alinhado |
|---|---|---|
| Título | "Esse link é pra outro CPF" | **Esse link não é seu** |
| Corpo | "Você está logado com uma conta diferente da pessoa que recebeu essa proposta. Faça logout e tente de novo pelo link original." | **Essa proposta foi enviada para outro CPF. Saia da conta atual e abra o link novamente para continuar.** |
| CTA 1 | Falar com a gente no WhatsApp | **Sair da conta** |
| CTA 2 | Voltar pro dashboard | Voltar ao painel |

### A5 · Proposta recusada
**Categoria nova.** Sem CTA de suporte — fica como as outras telas terminais sem saída (A1/A2),
só com um jeito de voltar.

| | James (atual) | Alinhado |
|---|---|---|
| Título | "Sua proposta foi recusada" | **Sua proposta não foi aprovada** |
| Corpo | "Sua proposta foi recusada. Entre em contato pelo WhatsApp pra entender os próximos passos." | **A instituição financeira não aprovou esta oferta.** |
| CTA | Falar com a gente no WhatsApp / Voltar | **Voltar ao início** |

### A6 · Algo deu errado (fallback — alta prioridade, 20+ call-sites)
**Já existe, mantém exatamente como está** — categoria `desconhecido`, usada em todo o app como
fallback genérico (um único CTA, sem opção de suporte). Esse é o item mais importante de alinhar
porque é o catch-all: alinhando só esse já resolve a maior parte da superfície de erro do Leilão.

- Título: "Algo deu errado"
- Corpo: "Tente novamente em alguns instantes."
- CTA: Tentar novamente

*(James tinha eyebrow + "Não conseguimos abrir sua proposta" + WhatsApp — não usar, a versão acima já é a aprovada e está em uso no resto do app.)*

---

## B. Intersticiais

### B1 · Loading da entrada
Baixo risco, só polir o registro pra bater com o padrão "Abrindo X..." usado no B2.

- James: "Abrindo sua proposta pré-aprovada…"
- Alinhado: **"Abrindo sua proposta..."**

### B2 · Redirecionando pra Unico
**Já existe, idêntico — não precisa de copy novo.** Essa tela já está desenhada em
`RedirecionandoUnicoPublicaPage.tsx` (rota `/leilao/oferta/redirecionando/unico`). O James
recriou uma versão própria no código sem saber que já existia; o pedido pro dev aqui é **reaproveitar
o componente/copy existente**, não revisar texto.

- Título: "Abrindo a Unico..."
- Corpo: "Você será direcionado para verificar sua identidade na plataforma da Unico."
- CTA (aparece depois de alguns segundos, se o auto-open falhar): "Abrir verificação na Unico"

### B3 · Preparando / Aguardando assinatura (2 estados)
Preciso separar os dois estados — "preparando" é um estado novo; "aguardando" **já existe**
(componente `UnicoAguardando`, estado ativo com ícone de ampulheta), só que hoje ele é usado com
CTA de ação (porque cobre também o caso do B4). Pro estado passivo do B3 (link já aberto, só
esperando), a tela deve ficar sem botão.

**Estado 1 — Preparando** (novo):
- James: "Estamos preparando seu link de assinatura" / "Assim que estiver pronto, vamos abrir a assinatura em uma nova aba — costuma levar poucos segundos."
- Alinhado: **"Preparando sua assinatura"** / **"Isso leva só alguns segundos."**

**Estado 2 — Aguardando (passivo, sem CTA)**:
- James: "Estamos esperando você terminar de assinar" / "A assinatura abriu em uma nova aba. Assim que você concluir lá, voltamos automaticamente pra continuar."
- Alinhado (mesmo título do componente `UnicoAguardando`): **"Aguardando sua assinatura"** / **"A assinatura abriu em uma nova aba. Assim que você concluir, voltamos automaticamente."**

### B4 · Voltou da Unico sem concluir
**Já existe, praticamente idêntico — reaproveitar tal como está.** É o estado ativo padrão do
componente `UnicoAguardando` (o que o James escreveu bate quase palavra por palavra com o que já
temos — provavelmente foi copiado de lá mesmo).

- Título: "Aguardando sua verificação" *(ou "Aguardando sua assinatura", dependendo do contexto — ver nota abaixo)*
- Corpo: "Você saiu antes de concluir a verificação de identidade. Toque em **Reabrir verificação** para continuar de onde parou."
- CTA: Reabrir verificação

> Nota: hoje o mesmo componente é chamado com dois textos ligeiramente diferentes — "verificação"
> (tela de assinatura pública, antes da Unico) vs. "assinatura" (B3/B4 no sentido estrito, depois
> da Unico). Vale confirmar com o dev em qual etapa exata cada reason dispara pra garantir que
> usamos a palavra certa ("verificação" ou "assinatura") em cada uma.

### B5 · Alerta inline no "Assinar"
Categoria nova — sem tela equivalente ainda. Mantive igual ao James aqui, só ajustando o registro.

- James: "Não foi possível iniciar a assinatura" / "Tente novamente em instantes."
- Alinhado: **"Não foi possível iniciar a assinatura"** / **"Tente novamente em instantes."** *(sem mudança de fundo, já estava bom)*

---

## C. Toasts e alerts inline (9)

Regra de registro aplicada em tudo abaixo: **"para", nunca "pra"** — conferi nas telas que já
existem no Leilão (ConfirmarDadosPage, SucessoPublicaPage, UnicoNotice, UnicoAguardando) e o
padrão é sempre a forma completa, mesmo em copy informal.

| # | James (atual) | Alinhado |
|---|---|---|
| C1 · Converter falhou (catch genérico) | "Não foi possível iniciar a assinatura." | **Algo deu errado. Tente novamente em alguns instantes.** *(mesma voz do fallback A6)* |
| C2 · Oferta ainda processando | "Oferta ainda sendo processada." / "Tente novamente em instantes." | **Sua oferta ainda está sendo processada. Tente novamente em instantes.** |
| C3 · Falta contato | "Precisamos de seu e-mail/telefone pra continuar" / "Volte pra completar os dados e tente de novo." | **Precisamos do seu e-mail e celular para continuar. Complete seus dados e tente novamente.** |
| C4 · Upstream do converter caiu | "Falha ao gerar a assinatura." / "Tente novamente." | **Não foi possível gerar sua assinatura. Tente novamente em instantes.** |
| C5 · Validação local (auth) | "Complete o endereço e a forma de recebimento antes." | **Complete o endereço e a forma de recebimento para continuar.** |
| C6 · Converter inválido genérico | "Confira os dados de recebimento." | **Confira os dados de recebimento e tente novamente.** |
| C7 · OTP errado | "Código inválido" / "Código inválido. Você tem 2 tentativa(s) restantes." | Copy existente da tela mantido ("Código inválido. Verifique e tente novamente.") + contagem de tentativas sem o bug de plural: **"Resta 1 tentativa."** (singular) ou **"Restam N tentativas."** (plural) — nunca "tentativa(s)". |
| C8 · OTP expirado / bloqueado | "Esse código não é mais válido. Toque em Reenviar código pra receber um novo." *(mensagem única pros dois casos)* | São duas situações diferentes — separar:<br>Expirado → **"Código expirou. Solicite um novo código para continuar."**<br>Bloqueado (muitas tentativas) → **"Muitas tentativas. Aguarde 15 minutos antes de tentar de novo."** |
| C9 · Pix não salvou | "Não foi possível salvar a chave Pix." | **Não foi possível salvar sua chave Pix. Tente novamente.** |

**C7/C8 agora dá pra ver rodando no protótipo** — implementei os três estados em `MfaPage.tsx`
(rota `/leilao/mfa`):
- Código errado: digite qualquer código diferente de `123456` → mostra o aviso de tentativas
  restantes (3 chances), e na 3ª errada bloqueia.
- Bloqueado: acontece automaticamente depois de 3 tentativas erradas.
- Expirado: acesse `/leilao/mfa?mfaErro=expirado` (atalho só de design, não existe isso vindo do
  backend ainda) pra ver esse estado direto, sem precisar esperar o código expirar de verdade.

---

## Decisões em aberto (preciso da sua confirmação ou da do PM)

1. **A3 "Link já usado"** — ativar esse reason ou manter caindo no fallback genérico (A6)? Hoje
   não é usado por nenhum call-site.
2. **B3/B4 "verificação" vs. "assinatura"** — confirmar com o dev em qual etapa exata cada uma
   dispara, pra usar a palavra certa.
3. James apontou que a hierarquia de CTA secundário varia tela a tela sem regra clara ("Voltar",
   "Voltar pro dashboard", "Pedir nova proposta", "Completar dados"). Não entrei nisso aqui porque
   é mais sobre navegação/fluxo do que copy — mas vale uma passada separada.
4. **Quantidade máxima de tentativas do OTP** — usei 3 na simulação de `MfaPage.tsx` por ser um
   número comum, mas não vi essa regra confirmada em nenhum lugar do protótipo ou do inventário do
   James. Vale confirmar o número real com o dev antes de finalizar.
