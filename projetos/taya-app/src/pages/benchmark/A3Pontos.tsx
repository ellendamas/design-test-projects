import { Medal, Trophy } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { Shell } from "./components/Shell";
import { BottomNavA } from "./components/BottomNavA";
import { HISTORICO_PONTOS, MISSOES, RANKING_SEMANAL, RESGATES } from "./mockData";

const SALDO_PONTOS = 1140;
const META_PROXIMO_NIVEL = 1500;

// A3 — Pontos e gamificação do Grupo A: saldo + ranking + missões + resgates + histórico, tudo
// empilhado e visível de uma vez, sem precisar perguntar pra IA "quanto eu tenho".
export default function A3Pontos() {
  const progresso = Math.round((SALDO_PONTOS / META_PROXIMO_NIVEL) * 100);

  return (
    <Shell navBar={<BottomNavA ativo="Pontos" />}>
      <div className="space-y-5 p-4 pb-6">
        <h1 className="text-lg font-bold text-foreground">Pontos</h1>

        <div className="rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">Seu saldo</p>
          <p className="mt-1 text-3xl font-bold">{SALDO_PONTOS.toLocaleString("pt-BR")} pts</p>
          <div className="mt-3">
            <Progress value={progresso} className="bg-white/25" />
            <p className="mt-1 text-[11px] text-white/85">
              Faltam {(META_PROXIMO_NIVEL - SALDO_PONTOS).toLocaleString("pt-BR")} pts pro próximo nível
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Ranking semanal</h3>
          </div>
          <div className="space-y-1.5">
            {RANKING_SEMANAL.map((r) => (
              <div
                key={r.posicao}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs ${
                  r.voce ? "bg-primary-light font-semibold text-primary" : "text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-4 text-center text-muted-foreground">{r.posicao}º</span>
                  {r.nome}
                </span>
                <span>{r.pontos.toLocaleString("pt-BR")} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Missões disponíveis</h3>
          {MISSOES.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-white p-3 shadow-card">
              <p className="text-xs font-medium text-foreground">{m.titulo}</p>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={m.progresso} className="h-1.5" />
                <span className="shrink-0 text-[10px] text-muted-foreground">{m.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Resgates disponíveis</h3>
          <div className="grid grid-cols-2 gap-3">
            {RESGATES.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-white p-3 shadow-card">
                <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-muted">
                  <Medal size={24} className="text-muted-foreground" />
                </div>
                <p className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">{r.nome}</p>
                <p className="mt-1 text-xs font-bold text-primary">{r.pontos.toLocaleString("pt-BR")} pts</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
          {HISTORICO_PONTOS.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-xs">
              <span className="text-foreground">{h.texto}</span>
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">{h.data}</span>
                <span className="font-semibold text-primary">+{h.pontos}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
