import { Medal, Trophy } from "@phosphor-icons/react";
import { Progress } from "@/components/ui/progress";
import { Shell } from "../components/Shell";
import { ProtoBadge } from "./components/ProtoBadge";
import { BottomNavA } from "./components/BottomNavA";
import { SpinWheel } from "./components/SpinWheel";
import {
  CONQUISTAS,
  HISTORICO_A3,
  MISSOES_A3,
  PREMIO_ROLETA,
  RANKING_A3,
  RESGATES_A3,
  USUARIO_A,
} from "./mock";

const META_PROXIMO_NIVEL = USUARIO_A.metaProximoNivel;

// A3 — Pontos e gamificação da Versão A. Guardrail 5: toda recompensa de RESGATES_A3 é útil
// pro ICP (farmácia, energia, cashback Pix, streaming, recarga, mercado, assistência,
// combustível) — nenhuma em desconto de juros/crédito, nem aqui nem na roleta.
export default function A3Pontos() {
  const progresso = Math.round((USUARIO_A.pontos / META_PROXIMO_NIVEL) * 100);

  return (
    <Shell navBar={<BottomNavA ativo="Pontos" />}>
      <ProtoBadge />
      <div className="space-y-5 p-4 pb-6">
        <h1 className="text-lg font-bold text-foreground">Pontos</h1>

        <div className="rounded-2xl bg-gradient-to-br from-[#FD5F31] to-[#FA9832] p-4 text-white shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">Seu saldo</p>
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">Nível {USUARIO_A.nivel}</span>
          </div>
          <p className="mt-1 text-3xl font-bold">{USUARIO_A.pontos.toLocaleString("pt-BR")} pts</p>
          <div className="mt-3">
            <Progress value={progresso} className="bg-white/25" />
            <p className="mt-1 text-xs text-white/85">
              Faltam {(META_PROXIMO_NIVEL - USUARIO_A.pontos).toLocaleString("pt-BR")} pts pro próximo nível
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-3.5 shadow-card">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Check-in de 7 dias</h3>
          <div className="flex items-center justify-between gap-1.5">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia, i) => (
              <div key={dia} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                    i < 4
                      ? "border-primary bg-primary text-white"
                      : i === 4
                        ? "border-primary bg-primary-light text-primary"
                        : "border-border bg-white text-muted-foreground"
                  }`}
                >
                  {dia[0]}
                </div>
                <span className={`text-xs ${i === 4 ? "font-bold text-primary" : "text-muted-foreground"}`}>{dia}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-3 shadow-card">
          <div className="mb-2 flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Ranking semanal</h3>
          </div>
          <div className="space-y-1.5">
            {RANKING_A3.map((r) => (
              <div
                key={r.posicao}
                className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm ${
                  r.voce ? "bg-primary-light font-semibold text-primary" : "text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs text-muted-foreground">{r.posicao}º</span>
                  {r.nome}
                </span>
                <span className="text-xs">{r.pontos.toLocaleString("pt-BR")} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Missões</h3>
          {MISSOES_A3.map((m) => (
            <div key={m.id} className="rounded-xl border border-border bg-white p-3 shadow-card">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{m.titulo}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{m.tempoRestante}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Progress value={m.progresso} className="h-1.5" />
                <span className="shrink-0 text-xs text-muted-foreground">{m.meta}</span>
              </div>
            </div>
          ))}
        </div>

        <SpinWheel premio={PREMIO_ROLETA} />

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Conquistas</h3>
          <div className="grid grid-cols-2 gap-2">
            {CONQUISTAS.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-2 rounded-xl border p-2.5 ${
                  c.conquistada ? "border-primary/30 bg-primary-light" : "border-border bg-white opacity-60"
                }`}
              >
                <Medal size={18} className={c.conquistada ? "text-primary" : "text-muted-foreground"} />
                <span className="text-xs font-medium text-foreground">{c.nome}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Resgates disponíveis</h3>
          <div className="grid grid-cols-2 gap-3">
            {RESGATES_A3.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-white p-3 shadow-card">
                <div className="mb-2 flex h-16 w-full items-center justify-center rounded-lg bg-muted">
                  <Medal size={24} className="text-muted-foreground" />
                </div>
                <p className="line-clamp-2 text-xs font-medium leading-tight text-foreground">{r.nome}</p>
                <p className="mt-1 text-sm font-bold text-primary">{r.pontos.toLocaleString("pt-BR")} pts</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Histórico</h3>
          {HISTORICO_A3.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2.5 text-xs">
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
