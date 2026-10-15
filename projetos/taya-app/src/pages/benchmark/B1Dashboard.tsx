import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { JadeAvatar } from "./components/JadeAvatar";
import { SAUDACAO_CONTEXTUAL_B1, SUGESTOES_CHAT, USUARIO } from "./mockData";

// B1 — Dashboard conversacional do Grupo B: tela inicial estática (ainda sem conversa em
// andamento), seguindo a referência de Claude.ai/Perplexity/ChatGPT — o input é o elemento
// hero, com uma saudação grande centralizada como foco visual, muito espaço em branco.
//
// Sem cards de produto aqui de propósito: cards contextuais (FGTS/CLT) só fariam sentido
// depois da primeira resposta da Jade numa conversa de verdade — fora de escopo nesse mock
// estático (ver B2Servicos.tsx pra como uma conversa em andamento se parece).
//
// Mesmo padrão de rodapé fixo corrigido em B2/B3 (Shell.tsx: h-screen + min-h-0 na cadeia) —
// aqui o bloco de sugestões+input fica shrink-0, preso acima do nav bar, com a saudação
// central ocupando o espaço restante via flex-1 + justify-center.
export default function B1Dashboard() {
  const [mensagem, setMensagem] = useState("");

  return (
    <Shell navBar={<BottomNavB ativo="Início" />}>
      <div className="flex h-full flex-col">
        <div className="flex flex-col items-center gap-1.5 pt-10">
          <JadeAvatar size={32} glow />
          <p className="text-xs font-light tracking-wide text-muted-foreground">Jade</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <div>
            <p className="text-3xl font-bold leading-tight text-foreground">Olá, {USUARIO.nome}.</p>
            <p className="mt-1 text-xl font-medium leading-snug text-foreground/70">
              {SAUDACAO_CONTEXTUAL_B1.pergunta}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary">{SAUDACAO_CONTEXTUAL_B1.contexto}</p>
        </div>

        <div className="shrink-0 space-y-3 p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {SUGESTOES_CHAT.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMensagem(s)}
                className="rounded-full border border-primary/30 bg-white px-3.5 py-1.5 text-xs font-medium text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-4 py-4 shadow-[0_4px_20px_rgba(35,30,25,0.1)]">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Pergunte qualquer coisa à Jade..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              <PaperPlaneTilt size={15} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
