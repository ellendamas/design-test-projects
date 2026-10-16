import { useState } from "react";
import { Briefcase, CaretDown, Heartbeat, PiggyBank } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { ChatThread } from "./components/ChatThread";
import { CONVERSAS_SUGESTAO, HISTORICO_CONVERSAS } from "./mockData";

const ICONES = { Heartbeat, PiggyBank, Briefcase };

// B2 — Agora é "Histórico de conversas" (antes era a própria conversa ao vivo, que se mudou
// pra B1 — ver B1Dashboard.tsx). Lista de resumos das conversas que já existem nesse mock
// (uma por roteiro de CONVERSAS_SUGESTAO); tocar num item expande a transcrição completa,
// somente leitura (ChatThread em variant="embedded": sem scroll/auto-scroll próprios, sem
// input — é histórico, não uma conversa ativa).
export default function B2Servicos() {
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <Shell navBar={<BottomNavB ativo="Histórico" />}>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Histórico de conversas</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Tudo que você já resolveu com a Jade.</p>
        </div>

        <div className="space-y-2">
          {HISTORICO_CONVERSAS.map((item) => {
            const Icon = ICONES[item.icone];
            const estaAberto = aberto === item.id;
            const thread = CONVERSAS_SUGESTAO[item.topico];
            return (
              <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                <button
                  type="button"
                  onClick={() => setAberto(estaAberto ? null : item.id)}
                  className="flex w-full items-start gap-3 p-3.5 text-left"
                  aria-expanded={estaAberto}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.topico}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.resumo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.quando}</p>
                  </div>
                  <CaretDown
                    size={16}
                    className={`mt-1 shrink-0 text-muted-foreground transition-transform ${estaAberto ? "rotate-180" : ""}`}
                  />
                </button>
                {estaAberto && thread && (
                  <div className="border-t border-border bg-background">
                    <ChatThread mensagens={thread} novosAPartirDe={0} variant="embedded" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
