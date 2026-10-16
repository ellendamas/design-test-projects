import { CheckCircle } from "@phosphor-icons/react";

type DiaCheckin = { dia: string; feito: boolean; hoje: boolean };

// Faixa de check-in de 7 dias — dia atual destacado, botão "+10 pts" é o único alvo de toque
// real aqui (os círculos de dia são só status, não ação), então só ele precisa dos 44px.
export function CheckInStrip({ dias }: { dias: DiaCheckin[] }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3.5 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Check-in diário</h3>
        <button type="button" className="flex h-11 shrink-0 items-center rounded-full bg-primary px-4 text-xs font-bold text-white">
          +10 pts
        </button>
      </div>
      <div className="flex items-center justify-between gap-1.5">
        {dias.map((d) => (
          <div key={d.dia} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                d.feito
                  ? "border-primary bg-primary text-white"
                  : d.hoje
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-white text-muted-foreground"
              }`}
            >
              {d.feito ? <CheckCircle size={16} weight="fill" /> : d.dia[0]}
            </div>
            <span className={`text-xs ${d.hoje ? "font-bold text-primary" : "text-muted-foreground"}`}>{d.dia}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
