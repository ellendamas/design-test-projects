import { useState } from "react";
import { ArrowRight, Briefcase, CaretRight, Heartbeat, PaperPlaneTilt, PiggyBank, Wallet } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { JadeAvatar } from "./components/JadeAvatar";
import { ICON_MAP } from "./components/iconMap";
import { CARDS_CONTEXTUAIS_B1, SAUDACAO_CONTEXTUAL_B1, SUGESTOES_CHAT, USUARIO } from "./mockData";

const ACOES_RAPIDAS = [
  { label: "CLT", icon: Briefcase },
  { label: "FGTS", icon: PiggyBank },
  { label: "Crédito", icon: Wallet },
  { label: "Saúde", icon: Heartbeat },
];

// B1 — Dashboard conversacional do Grupo B (Alipay pós-2026 / Abao): a IA Jade é o ponto de
// entrada, não um grid de produtos. Serviços aparecem por contexto (cards abaixo do chat), com
// um atalho discreto pra quem quer navegar direto mesmo assim.
export default function B1Dashboard() {
  const [mensagem, setMensagem] = useState("");

  return (
    <Shell navBar={<BottomNavB ativo="Início" />}>
      <div className="space-y-5 p-4 pb-6">
        <div className="flex items-center gap-3">
          <JadeAvatar size={48} glow />
          <div>
            <p className="text-lg font-bold leading-tight text-foreground">{USUARIO.nome}</p>
            <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
              {SAUDACAO_CONTEXTUAL_B1.destaque}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{SAUDACAO_CONTEXTUAL_B1.complemento}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-white px-3 py-3 shadow-card">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Pergunte alguma coisa pra Jade..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <PaperPlaneTilt size={13} weight="fill" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_CHAT.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMensagem(s)}
                className="rounded-full border border-primary/30 bg-primary-light px-3 py-1.5 text-[11px] font-medium text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {CARDS_CONTEXTUAIS_B1.map((card) => {
            const Icon = ICON_MAP[card.icone];
            return (
              <div
                key={card.id}
                className="rounded-2xl bg-gradient-to-br from-[#FFF3EE] to-[#FFE0D1] p-3.5 shadow-card"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-primary">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold leading-tight text-[#D94E28]">{card.valor}</p>
                    <p className="mt-0.5 text-xs leading-snug text-foreground/80">{card.texto}</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {card.cta} <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ações rápidas
          </h3>
          <div className="flex justify-between">
            {ACOES_RAPIDAS.map((a) => (
              <button key={a.label} type="button" className="flex flex-col items-center gap-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <a.icon size={16} />
                </div>
                <span className="text-[10px] text-muted-foreground">{a.label}</span>
              </button>
            ))}
            <button type="button" className="flex flex-col items-center gap-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <CaretRight size={16} />
              </div>
              <span className="text-[10px] text-muted-foreground">Mais</span>
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
