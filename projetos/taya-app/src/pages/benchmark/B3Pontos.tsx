import { useState } from "react";
import { Medal, PaperPlaneTilt } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { JadeAvatar } from "./components/JadeAvatar";
import { MISSOES, RESGATES_INLINE_B } from "./mockData";

// B3 — Pontos e gamificação do Grupo B: a Jade puxa assunto em vez de expor um painel de
// gamificação. Resgates e missões aparecem como cards contextuais dentro/depois da fala dela;
// não existe ranking visível — a posição é só mencionada quando relevante, dentro do texto.
export default function B3Pontos() {
  const [mensagem, setMensagem] = useState("");
  const missaoDestaque = MISSOES[0];

  return (
    <Shell navBar={<BottomNavB ativo="Início" />}>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
          <JadeAvatar size={32} />
          <p className="text-sm font-semibold text-foreground">Jade</p>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <div className="flex items-end gap-2">
            <JadeAvatar size={24} />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-xs leading-relaxed text-foreground shadow-card">
              Você ganhou <span className="font-semibold text-primary">120 pontos</span> essa semana — isso te
              colocou em 2º lugar no ranking semanal. Quer ver o que já pode resgatar?
            </div>
          </div>

          <div className="flex items-start gap-2">
            <JadeAvatar size={24} className="opacity-0" />
            <div className="flex max-w-[85%] flex-col gap-2">
              {RESGATES_INLINE_B.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 text-left shadow-card transition-colors hover:border-primary/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Medal size={18} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{r.nome}</p>
                    <p className="text-[11px] font-semibold text-primary">{r.pontos.toLocaleString("pt-BR")} pts</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <JadeAvatar size={24} />
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-xs leading-relaxed text-foreground shadow-card">
              Também tô de olho na sua missão "{missaoDestaque.titulo}" — falta pouco!
            </div>
          </div>

          <div className="flex items-start gap-2">
            <JadeAvatar size={24} className="opacity-0" />
            <div className="w-full max-w-[85%] rounded-2xl border border-border bg-white p-3 shadow-card">
              <p className="text-xs font-medium text-foreground">{missaoDestaque.titulo}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={missaoDestaque.progresso} className="h-1.5" />
                <span className="shrink-0 text-[10px] text-muted-foreground">{missaoDestaque.meta}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-white p-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Converse com a Jade..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <PaperPlaneTilt size={13} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
