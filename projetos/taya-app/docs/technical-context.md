# Contexto Técnico — taya-app (Pode Já)

> **O que é este documento:** uma referência técnica única e abrangente do codebase, pensada para qualquer sessão (humana ou de IA) que precise trabalhar neste projeto sem ter acompanhado o histórico de decisões. Cobre stack, arquitetura, convenções e dívidas conhecidas — **não** cobre UX/fluxo de produto tela a tela, isso é papel dos [journey-specs](journey-specs/) e [design-briefs](design-briefs/). Escrito a partir da leitura direta do código-fonte em 2026-09-22 — nada aqui foi inferido sem checar o arquivo real.
>
> **Gatilho para este documento:** a Ellen vai dar sequência a um protótipo navegável de **backoffice** para este produto. A seção 12 ("Notas para quem for construir o backoffice") reúne as implicações práticas de tudo que está documentado aqui.

## Índice

1. [O que é o projeto](#1-o-que-é-o-projeto)
2. [Stack e como rodar](#2-stack-e-como-rodar)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Produtos/jornadas existentes](#4-produtosjornadas-existentes)
5. [Arquitetura de rotas — App.tsx](#5-arquitetura-de-rotas--apptsx)
6. [Autenticação (é só localStorage)](#6-autenticação-é-só-localstorage)
7. [Context Providers globais](#7-context-providers-globais)
8. [O padrão "DESIGN ONLY" — simulação de estado sem backend](#8-o-padrão-design-only--simulação-de-estado-sem-backend)
9. [Componentes compartilhados](#9-componentes-compartilhados)
10. [Convenções de UI e dívidas de design system](#10-convenções-de-ui-e-dívidas-de-design-system)
11. [Integrações reais com backend (só duas em todo o app)](#11-integrações-reais-com-backend-só-duas-em-todo-o-app)
12. [Notas para quem for construir o backoffice](#12-notas-para-quem-for-construir-o-backoffice)
13. [Documentação existente (docs/)](#13-documentação-existente-docs)
14. [Deploy (Netlify)](#14-deploy-netlify)
15. [Testes e qualidade](#15-testes-e-qualidade)
16. [Git, worktrees e fluxo de trabalho](#16-git-worktrees-e-fluxo-de-trabalho)
17. [Dívidas técnicas e gaps conhecidos](#17-dívidas-técnicas-e-gaps-conhecidos)

---

## 1) O que é o projeto

**taya-app** é um protótipo navegável (não é o app de produção real) da **Pode Já**, uma plataforma digital operada pela Taya Tech que conecta usuários a instituições financeiras parceiras para produtos como Crédito Consignado CLT, Crédito Pessoal, antecipação de FGTS, entre outros. É construído em React/Vite, sem backend próprio (com duas exceções pontuais — seção 11), e existe para **validar design e fluxo** antes da implementação real — por isso a convenção "DESIGN ONLY" está espalhada por todo o código (seção 8).

O repositório GitHub (`ellendamas/design-test-projects`) é um **monorepo "guarda-chuva"** pensado para abrigar múltiplos protótipos de design, mas hoje contém só este: `projetos/taya-app/`. O `README.md` da raiz do repo diz isso explicitamente. **Atenção:** o `README.md` *dentro* de `taya-app/` está desatualizado — descreve um estado muito mais simples do produto (só onboarding + home) do que o que existe hoje (dezenas de jornadas completas). Não confie nele para entender o estado atual; confie neste documento e no código.

## 2) Stack e como rodar

- **React 18** + **TypeScript** (`strict: true`) + **Vite 5**
- **Tailwind CSS 3** para estilos, com componentes no estilo **shadcn/ui** (Radix UI primitives + `class-variance-authority`) em `src/components/ui/`
- **React Router v6** (`react-router-dom`), tudo client-side, um único `<Routes>` gigante em `App.tsx`
- **Framer Motion** para animações/transições de página
- **Phosphor Icons** (`@phosphor-icons/react`) é a biblioteca de ícones usada de fato (`lucide-react` está no `package.json` mas parece residual/não usado na prática)
- **Vaul** (Drawer mobile), **react-imask** (máscaras de input), **input-otp** (código OTP), **sonner** (toasts), **react-credit-cards-2**
- Nenhuma lib de HTTP client (sem axios, sem react-query) — não é necessário, quase tudo é mock local (seção 8)

**Rodar localmente:**
```bash
cd projetos/taya-app
npm install
npm run dev
```
Sobe em `http://localhost:4173` (porta fixa, `strictPort: true` no `vite.config.ts` — se a porta estiver ocupada por outro processo, o servidor recusa subir; não mude a porta, mate o processo antigo).

**Scripts disponíveis** (`package.json`): `dev`, `build`, `typecheck` (`tsc -b`), `preview`. **Não existe script de lint nem de teste.**

**Alias de import:** `@/` aponta para `./src/*` (configurado em `vite.config.ts` e `tsconfig.json` de forma espelhada — se mudar um, mude o outro).

**Theming multi-marca (infraestrutura pronta, não conectada):** `src/index.css` define cores de marca via CSS custom properties (`--brand`, `--brand-light`, `--brand-dark`, `--brand-gradient-start/end`) e há blocos `[data-theme="laranja"|"azul"|"verde"|"roxo"|"grafite"]` prontos com paletas alternativas. Não encontrei nenhum código que efetivamente alterne esse atributo em runtime — parece ter sido construído para um cenário de white-label futuro, mas hoje o tema ativo é sempre o padrão (laranja, `#FD5F31`), fixado no HTML. Se o backoffice precisar de outro tema, essa infraestrutura já existe.

## 3) Estrutura de pastas

```
src/
├── App.tsx                 (~4320 linhas — ver seção 5, é O arquivo central)
├── main.tsx                 (entrypoint; monta a árvore de Context Providers — seção 7)
├── index.css                 (Tailwind directives + CSS vars de tema/marca)
├── components/
│   ├── ChatBubble.tsx         (assistente virtual "Jade")
│   ├── ContaSelector.tsx      (seleção/cadastro de conta bancária + Pix)
│   ├── EnderecoSelector.tsx   (seleção/cadastro de endereço, com busca real de CEP)
│   ├── ErrorScreen.tsx        (tela de erro genérica, por categoria)
│   ├── FaqAcordeon.tsx
│   ├── Logo.tsx
│   ├── PublicLayout.tsx       (layout das telas públicas/sem login — jornada guest do Leilão CLT)
│   ├── SeguroPrestamistalCard.tsx
│   ├── TermosModal.tsx
│   ├── UnicoAguardando.tsx    (tela "aguardando assinatura" via Unico)
│   ├── UnicoNotice.tsx        (aviso antes de redirecionar pra verificação Unico)
│   ├── cards/ConsignadoCLTCard.tsx
│   └── ui/                    (design system estilo shadcn: accordion, badge, button, card,
│                                checkbox, dialog, drawer, input-otp, input, label, progress, switch)
├── context/                   (ver seção 7)
│   ├── ChatContext.tsx
│   ├── InteresseContext.tsx
│   ├── NotificacoesContext.tsx
│   ├── PrivacyContext.tsx
│   ├── RecomendacoesContext.tsx
│   └── SeubolsoContext.tsx
├── data/
│   ├── contratos.ts            (dados mock de contratos por produto)
│   ├── faq.ts
│   └── notificacoes.ts
├── hooks/
│   └── use-media-query.ts      (único hook customizado do repo — ver seção 10)
├── lib/
│   └── utils.ts                 (helper `cn()`, padrão shadcn: clsx + tailwind-merge)
├── pages/                       (ver seção 4 — um subdiretório por produto, nada solto na raiz)
│   ├── consignado-clt/    (13 arquivos)
│   ├── credito-pessoal/   (16 arquivos)
│   ├── duvidas/           (1 arquivo)
│   ├── fgts/              (11 arquivos)
│   ├── leilao-clt/        (23 arquivos — a jornada mais complexa do repo)
│   ├── minha-conta/       (1 arquivo)
│   └── seguro-vida/       (1 arquivo)
└── utils/
    └── analytics.ts        (stub — ver seção 15)
```

**Importante:** vários produtos/seções NÃO têm pasta própria em `src/pages/` — estão definidos como funções/constantes locais **dentro de `App.tsx`**: Assistências, Energia, Seubolso (programa de pontos), Contratos (lista + páginas individuais), Notificações, e quase toda a seção "Minha Conta" (só a verificação de contato tem arquivo próprio, `minha-conta/VerificarContato.tsx`). Isso é relevante se você for procurar uma tela e não achar em `pages/` — ela provavelmente está em `App.tsx`.

## 4) Produtos/jornadas existentes

| Pasta | O que é |
|---|---|
| `consignado-clt/` | Crédito Consignado CLT para **usuário logado**: landing → escolha de provedor → consulta simultânea → oferta(s) → simulação → revisão → dados → assinatura (Unico) → confirmação. |
| `credito-pessoal/` | Crédito Pessoal completo: landing → simulador → dados do tomador (com pergunta de PEP) → análise → revisão → conta → formalização → assinatura → confirmação, com telas de reprovada/inelegível/pendente. |
| `duvidas/` | Central de Ajuda/FAQ — ponto de entrada também para o chat da Jade. |
| `fgts/` | Antecipação de saldo do FGTS: landing → "copiloto" explicativo → consulta de saldo → simulador → revisão → dados → assinatura → confirmação. |
| `leilao-clt/` | Crédito Consignado CLT via **leilão entre instituições parceiras** (integração conceitual com CTPS Digital e com a Celcoin — ver os journey-specs desta jornada). **Duas variantes paralelas e totalmente independentes**: jornada logada (`Leilao*Page.tsx`) e jornada pública/guest (`*PublicaPage.tsx`), sem nenhum componente compartilhado entre elas — decisão deliberada, documentada nos journey-specs, pra nunca misturar auth state entre as duas. |
| `minha-conta/` | Só `VerificarContato.tsx` (verificação/troca de e-mail/celular). O resto de "Minha Conta" está em `App.tsx`. |
| `seguro-vida/` | Landing de Seguro de Vida — produto em estágio inicial, só 1 arquivo, sem fluxo de contratação completo ainda. |

**Nota:** o README interno menciona "Saque Fácil" como produto entregue, mas não existe pasta nem rota correspondente hoje — provavelmente planejado e não implementado, ou renomeado/absorvido por outro produto.

## 5) Arquitetura de rotas — App.tsx

`App.tsx` é o coração do app: define o `<Routes>` completo (todas as rotas de todos os produtos, num único componente), concentra dezenas de telas inteiras como funções/constantes locais (onboarding, login, recuperação de senha, dashboard, minha conta, contratos, notificações, assistências, energia, seubolso), os helpers `getStoredUser`/`setStoredUser`, e o layout `SubPageLayout`. É o único arquivo que importa e "pluga" as páginas de `src/pages/*` nas rotas.

**Padrão de proteção de rota**, repetido em cada `<Route>`:
```tsx
<Route path="/painel" element={getStoredUser() ? <HomeScreen/> : <Navigate to="/boas-vindas" replace/>} />
```
Rotas de onboarding/login (`/`, `/boas-vindas`, `/acesso`, `/recuperar-senha*`, `/cadastro`) são públicas. Praticamente todo o resto (dashboard, minha conta, contratos, os produtos de crédito) é protegido dessa forma. Existe uma exceção com a proteção **invertida**: `/leilao/criar-conta` só é acessível se `!getStoredUser()` (usuário sem conta) — faz sentido, é a tela de criação de conta pós-sucesso da jornada guest.

Além da checagem inline em cada rota, há um `useEffect` redundante em `App` que redireciona pra `/boas-vindas` se o usuário cair numa lista fixa de `protectedPaths` sem estar logado — client-side, roda em toda troca de rota.

A jornada **Leilão CLT** é a única com duas variantes de rota completamente separadas (com conta vs. pública/guest) — veja os dois journey-specs dela para o mapa completo de telas. As demais jornadas (Consignado CLT, Crédito Pessoal, FGTS) só existem na versão logada.

Fallback: qualquer rota não mapeada redireciona pra `/`.

## 6) Autenticação (é só localStorage)

**Não existe backend de autenticação real.** `getStoredUser()`:
```ts
type StoredUser = { name: string; email: string; cpf?: string };

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("podeja_user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
```
"Login" é gravar `localStorage["podeja_user"]`; "logout" é remover essa chave e navegar pra `/`. Nenhuma senha é validada contra servidor — login, recuperação de senha e OTP são inteiramente simulados no cliente. **Se o backoffice precisar de um conceito de "usuário admin logado" separado do usuário final, isso deveria ser uma chave de localStorage diferente** (ex.: `podeja_admin_user`), pra não colidir com a sessão do usuário final.

## 7) Context Providers globais

Montados em `main.tsx`, nesta ordem (de fora para dentro):
```
InteresseProvider → SeubolsoProvider → RecomendacoesProvider → PrivacyProvider
  → NotificacoesProvider → ChatProvider → BrowserRouter → App
```

| Provider | Responsabilidade |
|---|---|
| `InteresseProvider` | Interesses/produtos que o usuário marcou (`localStorage["podeja_interesses"]`) — personaliza cards. |
| `SeubolsoProvider` | Programa de pontos "Seubolso": saldo, streak, extrato — tudo em memória (state), mock inicial. |
| `RecomendacoesProvider` | Motor de recomendação dos cards "Para você agora" (combina interesses + Seubolso + dispensas persistidas). |
| `PrivacyProvider` | Toggle de "ocultar valores" (`localStorage["podeja_data_visible"]`). |
| `NotificacoesProvider` | Lista de notificações mockadas + injeção condicional via query param. |
| `ChatProvider` | Estado do chat com a assistente "Jade" — **único provider conectado a um backend real** (seção 11). |

## 8) O padrão "DESIGN ONLY" — simulação de estado sem backend

Este é **o conceito mais importante para entender o codebase inteiro**. Há 165+ ocorrências do comentário `// DESIGN ONLY` espalhadas pelo código — é uma convenção deliberada e consistente pra marcar qualquer trecho que existe só pra permitir navegar/visualizar estados de produto sem uma API real por trás. Quase sempre vem acompanhado de um `// TODO: substituir por dados reais da API`.

**Padrão geral:** query params controlam o estado "atual" simulado de uma tela/produto (com um default sensato pra quem abre a URL direto, sem navegar o fluxo inteiro); `localStorage` é usado quando o estado precisa persistir entre telas diferentes (ex.: uma flag setada na tela A precisa ser lida no dashboard).

Exemplos reais (nomes exatos):
- `/painel?clt=none|consultando|oferta|contrato|consulta_liberada|leilao_aprovado` — estado do card de CLT na home
- `/painel?fgts=none|autorizado|contrato` — estado do card de FGTS
- `/painel?cp=disponivel|andamento|ativo|assinatura_pendente|contrato_novo|video` — estado do card de Crédito Pessoal
- `/painel?verificacao=email|telefone|email_novo|celular_novo` — isola um único card de verificação no "Para você agora", pensado pra QA testar um card específico sem montar o estado dos outros
- `localStorage["podeja_contrato_novo_ts"]` — timestamp que expira um card "Contrato novo" após 2 dias, simulando um campo de status real
- `localStorage["podeja_email_validado"]` / `"podeja_telefone_validado"` — todo o estado de verificação de contato é mock local
- `ContaSelector`/`EnderecoSelector` via `?conta=N` / `?endereco=N` — simula quantas contas/endereços já estão cadastrados
- Padrão `MOCK_STATE`: praticamente toda tela de "resultado"/etapa avançada faz `(location.state as X | null) ?? MOCK_STATE`, permitindo abrir a URL isolada e ainda ver dados coerentes

Cada um desses pontos é, na prática, **documentação viva do contrato de API esperado** — quando a integração real chegar, é procurar por `// DESIGN ONLY` e `// TODO` pra saber exatamente o que precisa virar chamada de API.

Dois produtos (`consignado-clt`, `fgts`) têm um doc dedicado listando **todos** os parâmetros e "caminhos de teste" prontos: `docs/parametros-url_consignado-clt.md` e `docs/parametros-url_fgts.md`. Os demais produtos não têm esse doc ainda (gap — ver seção 17).

## 9) Componentes compartilhados

| Componente | Props principais | O que faz |
|---|---|---|
| `SubPageLayout` (`App.tsx`) | `{ title, children, hideNav? }` | Layout de telas **logadas**: sidebar fixa desktop (`hidden md:flex`) + bottom nav fixa mobile (`md:hidden`), header sticky com voltar/título/privacidade/notificações. Usado por praticamente toda sub-tela logada. Código completo abaixo. |
| `PublicLayout` (`components/`) | `{ children, footer?, footerTransparente?, ocultarHeader? }` | Layout de telas **públicas/sem login** (jornada guest do Leilão CLT). Header minimalista só com logo (pode ser escondido com `ocultarHeader`, usado na 1ª tela de uma jornada guest). Rodapé de CTA fixo via `createPortal(..., document.body)` — necessário porque a transição de página com framer-motion cria um `transform` que quebraria `position: fixed` se o rodapé ficasse dentro dela. |
| `Logo` | `{ variant?: "default"\|"white", size?: "sm"\|"md"\|"lg", className? }` | Logo Pode Já com fallback textual se a imagem falhar. `variant="white"` pra fundos escuros. |
| `ContaSelector` | `{ contas?, onConfirmar, semProximoPasso?, permitirExcluir?, mostrarPix?, maxItens?, ocultarCabecalho?, autoConfirmarSelecao? }` | CRUD local completo de conta bancária + chave Pix (com formatação automática por heurística — CPF/telefone/e-mail/EVP — via `formatPixKey()` exportado). |
| `EnderecoSelector` | `{ enderecos?, onConfirmar, semProximoPasso?, permitirExcluir?, maxItens?, autoConfirmarSelecao? }` | Espelha `ContaSelector` estruturalmente. **Único componente além do chat com integração de API real** — busca CEP via ViaCEP. |
| `ErrorScreen` | `{ categoria: ErrorCategoria, onTentarNovamente?, labelBotao?, inline?, compact?, icone? }` | Tela de erro genérica e centralizada — um dicionário `ERROS` com headline/subtítulo por categoria (17 categorias hoje, incluindo 4 específicas do Leilão CLT), acionada via `?erro=categoria`. |
| `UnicoNotice` | `{ titulo?, descricao?, itens?, labelBotao?, onContinuar }` | Aviso/consentimento antes de redirecionar pro fluxo de verificação Unico (biometria/KYC). |
| `UnicoAguardando` | `{ titulo?, descricao?, mostrarBotao?, onAssinar?, onCancelar?, ... }` | Tela "aguardando assinatura" — dois modos (ativo/expirado). Tem `TODO: polling GET /propostas/{id}` marcado. |
| `ChatBubble` | (sem props, consome `useChat()`) | Botão flutuante que abre o chat com a Jade. Só aparece se logado OU em rotas específicas de suporte pós-falha; nunca em onboarding/login. |
| `Button` (`ui/button.tsx`) | CVA: `variant: "default"\|"outline"\|"ghost"`, `size: "default"\|"sm"\|"lg"`, `asChild?` | Componente shadcn padrão — **mas a maior parte do app não o usa** (ver seção 10). |

<details>
<summary>Código completo de <code>SubPageLayout</code></summary>

```tsx
export function SubPageLayout({ title, children, hideNav = false }: { title: string; children: ReactNode; hideNav?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { naoLidas } = useNotificacoes();
  const user = getStoredUser();
  const firstName = (user?.name || "usuário").split(" ")[0] || "usuário";

  const navItems = [
    { path: "/painel", icon: <House size={18} />, label: "Início" },
    { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" },
    { path: "/duvidas", icon: <Headset size={18} />, label: "Dúvidas" },
    { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" },
  ];

  const logout = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("podeja_user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <Logo size="md" className="mb-8 self-start" />
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-background"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">{firstName[0]?.toUpperCase() ?? "S"}</div>
            <div>
              <p className="text-xs font-semibold text-foreground">{firstName}</p>
              <p className="text-xs text-muted-foreground">
                {localStorage.getItem("podeja_email_validado") === "true" && localStorage.getItem("podeja_telefone_validado") === "true"
                  ? "Conta verificada"
                  : "Verificação pendente"}
              </p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><SignOut size={16} />Sair</button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-4 md:px-8">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-foreground">{title}</h1>
          <PrivacyToggle size={18} variant="dark" />
          <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <Bell size={18} className="text-muted-foreground" />
            {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FD5F31] text-[9px] font-bold text-white">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
          </button>
        </header>
        <div className={`px-4 py-5 md:mx-auto md:max-w-[640px] md:px-0 md:py-8 ${hideNav ? "pb-6" : "pb-28"}`}>{children}</div>

        {!hideNav && <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm md:hidden">
          <ul className="grid w-full grid-cols-4 text-center">
            {navItems.map((item) => (
              <li key={item.path} className="flex flex-col items-center justify-center text-center">
                <button
                  onClick={() => navigate(item.path)}
                  className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl p-2 text-center text-[11px] ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground"}`}
                >
                  <span className="flex items-center justify-center leading-none">{item.icon}</span>
                  <span className="block w-full leading-none">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>}
      </main>
    </div>
  );
}
```
</details>

**`HomeScreen` (dashboard) e o padrão "Para você agora":** é uma constante JSX dentro de `App.tsx` (não usa `SubPageLayout` — tem layout próprio, com header em gradiente de marca). Logo antes dela, um bloco extenso lê `useSearchParams()` + `localStorage` e computa um conjunto de variáveis `mostrarXxx` por produto, cada uma controlando se um card aparece no carrossel "Para você agora". `temCardParaVoceAgora` é o OR de todas elas — só aparece o título/carrossel se pelo menos uma for `true`; caso contrário a home mostra recomendações genéricas do `RecomendacoesContext`. Ordem de prioridade documentada em comentário: "Segurança → Produto → Conta".

## 10) Convenções de UI e dívidas de design system

**Cores de marca via valor arbitrário, não via token (padrão dominante confirmado por contagem):**
```
474×  #FD5F31   laranja principal ("brand"/"primary")
145×  #D94E28   laranja escuro (hover/dark)
124×  #FFF3EE   laranja bem claro (fundo de destaque)
 34×  #d04e08   variante minúscula de hover (praticamente = D94E28 — inconsistência de caixa)
```
Mesmo existindo tokens Tailwind equivalentes (`primary`, `background`, `border`, `muted-foreground`, `success`) e CSS vars de marca (`--brand`, `--brand-dark`, `--brand-light`), o código majoritariamente usa `bg-[#FD5F31]`/`text-[#D94E28]` direto em vez de `bg-primary`. Isso é sistemático — inclusive em componentes construídos recentemente. **Se for escrever código novo (ex: backoffice), o ideal é usar os tokens semânticos (`primary`, `muted`, etc.), mas saiba que isso quebraria a consistência visual com o resto do app enquanto essa dívida não for paga em geral** — na dúvida, siga o padrão dominante (`#FD5F31` hardcoded) por consistência com o que já existe, e não tente corrigir isso de forma isolada sem alinhar com quem decide.

**Padrão Dialog (desktop) / Drawer (mobile):**
```ts
export function useMediaQuery(query: string) {
  const getMatch = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}
```
Uso universal: `const isDesktop = useMediaQuery("(min-width: 768px)")`, seguido de `isDesktop ? <Dialog>...</Dialog> : <Drawer>...</Drawer>`, mesmo `open`/`onOpenChange` alimentando os dois. **Não existe breakpoint customizado no Tailwind** — `768px` é o breakpoint `md` padrão, replicado manualmente via este hook em vez de usar classes responsivas puras, porque a decisão é estrutural (que componente renderizar), não só de estilo.

**Modal/drawer com formulário — duplicado por arquivo, sem componente genérico compartilhado.** Cada arquivo que precisa desse padrão (ex.: `ContaSelector`, `EnderecoSelector`) escreve sua própria função de conteúdo de formulário e monta manualmente o par `<Dialog>`/`<Drawer>` ao redor dela. Não existe um `<ResponsiveModal>` genérico no design system — se for construir isso de novo pro backoffice, siga essa mesma estrutura manual (copiar o padrão de um arquivo existente) por consistência, já que criar uma abstração nova unilateralmente divergiria do resto do código.

## 11) Integrações reais com backend (só duas em todo o app)

Confirmado por varredura completa: **só existem 2 chamadas `fetch` reais em todo `src/`**. Tudo mais é mock local.

1. **ViaCEP** (`src/components/EnderecoSelector.tsx`) — `https://viacep.com.br/ws/{cep}/json/`, API pública, autopreenche endereço a partir do CEP.
2. **Motor de IA da Jade** (`src/context/ChatContext.tsx`) — `https://taya-ai-engine-571144798728.southamerica-east1.run.app/chat`, com streaming SSE. É o **único ponto de integração com um backend próprio de verdade** no app inteiro — todo o resto (crédito, FGTS, contas, contratos, verificações) é simulado no cliente.

## 12) Notas para quem for construir o backoffice

Isto é uma síntese prática das seções acima, pensada especificamente pra quem for começar o protótipo navegável de backoffice:

- **Não existe conceito de "admin" ou "operador" hoje** — nem no roteamento (`getStoredUser()` só conhece um tipo de usuário/sessão), nem em nenhuma pasta de `src/pages/`. Um backoffice provavelmente precisa de: (a) uma sessão separada (`localStorage["podeja_admin_user"]` ou similar, pra não colidir com a sessão do usuário final — útil inclusive pra testar os dois ao mesmo tempo em abas diferentes), e (b) um novo subdiretório em `src/pages/` (ex.: `backoffice/`) com suas próprias rotas registradas em `App.tsx`, seguindo o mesmo padrão `getStoredUser-do-admin() ? <Componente/> : <Navigate .../>`.
- **Sem backend real, o backoffice também vai precisar da convenção DESIGN ONLY** (seção 8) pra simular estados — dados de usuários, propostas, contratos etc. provavelmente virão de arrays mock em `src/data/` (seguindo o padrão de `contratos.ts`), com estado de UI controlado por query params quando fizer sentido testar variações (ex.: `?operador=admin|analista` pra simular papéis diferentes).
- **Reaproveite `SubPageLayout` como ponto de partida** se o backoffice for uma área "logada" dentro do mesmo app (sidebar + header já prontos) — mas avalie se os 4 itens de nav fixos (`Início`, `Contratos`, `Dúvidas`, `Conta`) fazem sentido pro contexto de admin ou se merece um layout próprio (`AdminLayout`, espelhando a estrutura de `SubPageLayout` mas com nav diferente — é o padrão já usado pra criar `PublicLayout` como variante de layout).
- **Sem testes automatizados nem CI** (seção 15) — qualquer coisa nova só tem `tsc --noEmit` como rede de segurança. Rode isso sempre antes de considerar algo pronto.
- **Documentação esperada:** pelo padrão já estabelecido neste repo, uma jornada nova de backoffice deveria ganhar seu próprio journey-spec (`docs/journey-specs/`) e, se envolver decisão de produto/PO, um design brief (`docs/design-briefs/`) — ver seção 13 pra entender o formato de cada um.
- **Cores/componentes:** siga a convenção dominante (hex arbitrário `#FD5F31` etc., ver seção 10) por consistência visual, mesmo sabendo que não é o ideal — introduzir um padrão novo só no backoffice criaria uma terceira convenção no mesmo app.

## 13) Documentação existente (docs/)

```
docs/
├── design-briefs/
│   ├── leilao-clt-com-conta-design-brief.md
│   └── leilao-clt-sem-conta-design-brief.md
├── journey-specs/
│   ├── leilao-clt-com-conta-journey-spec.md
│   ├── leilao-clt-sem-conta-journey-spec.md
│   └── verificacao-contato-journey-spec.md
├── parametros-url_consignado-clt.md
├── parametros-url_fgts.md
└── technical-context.md    (este documento)
```

- **`design-briefs/`** — brief de negócio/design por jornada: metadados (responsável, status, data, épico Jira), link pro protótipo e pro journey-spec correspondente, resumo em prosa de "o que a jornada faz" e comportamentos de UX tela a tela. Voltado a PO/stakeholders — mais legível e menos técnico que o journey-spec.
- **`journey-specs/`** — a especificação técnica completa por jornada: front-matter YAML, resumo executivo, escopo, mapa passo a passo com `step_id`, inventário de telas com `screen_id`, spec detalhada por tela (estados, regras de negócio, microcopy, acessibilidade), diff de UX, taxonomia de eventos Amplitude proposta, critérios de QA, impacto pra PO/PM e open questions. É o documento "fonte da verdade" pra handoff Design→Dev→Analytics — escrito a partir da leitura do código real, nunca inferido.
- **`parametros-url_*.md`** — um por produto (hoje só `consignado-clt` e `fgts`): lista exaustiva de todo parâmetro "DESIGN ONLY" daquele produto, com valores possíveis, efeito na UI, e sequências de URL prontas pra testar caminho feliz/negativo/timeout sem navegar o fluxo manualmente. **Gap conhecido:** `credito-pessoal`, `leilao-clt` e os demais produtos não têm esse doc ainda, apesar de terem bastante parâmetro DESIGN ONLY no código.

## 14) Deploy (Netlify)

`netlify.toml` fica na **raiz do repo** (não dentro de `taya-app/`):
```toml
[build]
  base = "projetos/taya-app"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
O redirect catch-all é necessário pro client-side routing do react-router-dom funcionar em qualquer URL acessada diretamente (sem isso, um refresh em `/leilao/oferta` daria 404 no servidor). **Se o caminho `projetos/taya-app` mudar de nome/local no repo (ver conversa anterior sobre reorganização de pastas, ainda não feita), este `base` precisa ser atualizado junto — senão o build do Netlify quebra.**

O deploy é automático: push (ou merge de PR) pra `main` no GitHub dispara o build/deploy no Netlify.

## 15) Testes e qualidade

- **Não há nenhum teste automatizado** — sem vitest, jest, playwright, cypress ou testing-library.
- **Não há ESLint configurado.**
- **Não há CI** (`.github/workflows/` não existe).
- O único gate é `npm run typecheck` (`tsc -b`, `strict: true`, `noEmit: true`) — rode manualmente antes de considerar qualquer mudança pronta.
- **Analytics é um stub:**
  ```ts
  export function trackStep(stepName: string) {
    console.log(`[analytics] step: ${stepName}`);
    // amplitude.track(stepName)
  }
  ```
  A integração real com Amplitude está comentada — mesmo a taxonomia de eventos que os journey-specs documentam ainda não está conectada a nada de verdade.

## 16) Git, worktrees e fluxo de trabalho

Este projeto é trabalhado via **múltiplos git worktrees** do mesmo repositório, cada um numa branch diferente, todos compartilhando o mesmo histórico:

| Local | Branch | Papel |
|---|---|---|
| `/home/administrador/projects/design-test-projects` | `ready-to-main-temp` | Checkout principal — branch de staging pessoal da Ellen, acumula trabalho local antes de periodicamente ser mergeada na `main` via PR. |
| `/home/administrador/projects/worktrees/wt-main` | `main` | Espelha a branch de produção (o que está no GitHub `main`, que dispara o deploy Netlify). Usado quando o trabalho vai direto pra `main` (fast-forward, sem passar por `ready-to-main-temp` primeiro). |
| `/home/administrador/projects/worktrees/wt-openfinance` | `feature/openfinance-resume` | Trabalho de Open Finance em andamento — **combinado explicitamente com a Ellen: não tocar, não mergear, não commitar nada aqui a menos que ela peça.** |
| `/home/administrador/orca/workspaces/design-test-projects/res` | `res` | Fora da árvore `~/projects/`, gerenciada por outra ferramenta/processo (não claro qual) — evitar mexer sem necessidade clara. |

**Padrão de trabalho estabelecido nesta sessão** (vale repetir pra sessões futuras):
1. Fazer o trabalho em `wt-main` (branch `main`), commitando ali.
2. Rodar `npx tsc --noEmit` antes de considerar pronto.
3. Mergear `main` dentro de `ready-to-main-temp` localmente (`git merge main`), pra manter as duas em sincronia — normalmente sem conflito, mas checar.
4. Só fazer `git push origin main` **com confirmação explícita da Ellen** — isso dispara o deploy Netlify automaticamente.
5. Autenticação GitHub: usar sempre a conta `ellendamas` (`gh auth switch --hostname github.com --user ellendamas` se necessário) — **nunca apagar ou usar a conta `eraqueldamas`**, que também está configurada na máquina mas pertence a outro contexto.

Para features maiores (não fixes pequenos), o padrão anterior foi: branch `feat/nome-da-feature` a partir de `main`, PR aberta com `gh pr create`, revisão, merge via `gh pr merge`. Para ajustes incrementais pequenos numa feature já em produção, o fluxo direto em `main` (passos 1-4 acima) foi o adotado.

## 17) Dívidas técnicas e gaps conhecidos

- Cores de marca hardcoded como hex arbitrário em vez de tokens Tailwind semânticos (seção 10) — sistemático, não isolado.
- Componente `Button` do design system é subutilizado — a maioria dos CTAs é `<button>` puro com classes repetidas.
- Padrão Dialog/Drawer duplicado manualmente em cada arquivo que precisa dele, sem abstração compartilhada.
- `README.md` de `taya-app/` desatualizado (descreve um estado muito antigo do produto).
- `docs/parametros-url_*.md` só existe para 2 dos 7 produtos.
- Sem testes automatizados, sem lint, sem CI.
- Analytics é só `console.log`, sem integração real com Amplitude.
- Produto "Saque Fácil" mencionado no README mas sem código correspondente.
- Sistema de multi-tema (`data-theme`) existe em CSS mas não está conectado a nenhuma UI de troca de tema.
- Reorganização de pastas discutida com a Ellen (mover `projetos/taya-app` pra `projects/podeja` dentro de um checkout local renomeado pra `taya`) foi **adiada** — se retomada, exige atualizar `netlify.toml` (`base`) e reparar os worktrees (`git worktree repair`) depois de mover a pasta.
