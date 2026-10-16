type Oferta = { id: string; parceiro: string; titulo: string; desconto: string; resgatadoPct: number; tempoRestante: string };

// Ofertas relâmpago — só parceiros não financeiros (guardrail 1: crédito nunca recebe
// contagem regressiva/urgência). A contagem é texto estático (não um timer que tiqueteia de
// verdade) de propósito: guardrail 3 pede que nenhuma contagem regressiva reinicie sozinha —
// um texto fixo nunca "reinicia", então já nasce em conformidade sem precisar de lógica extra.
export function FlashDeals({ ofertas }: { ofertas: Oferta[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Ofertas relâmpago</h3>
      <div className="space-y-2">
        {ofertas.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-white p-3.5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{o.titulo}</p>
                <p className="text-xs text-muted-foreground">{o.parceiro}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-xs font-bold text-[#B91C1C]">{o.desconto}</span>
                <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{o.tempoRestante}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${o.resgatadoPct}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{o.resgatadoPct}% já resgatado</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
