type Missao = { id: string; titulo: string; pontos: number; progresso: number };

export function DailyMissions({ missoes }: { missoes: Missao[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Missões do dia</h3>
      <div className="space-y-2">
        {missoes.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-white p-3.5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{m.titulo}</p>
              <span className="shrink-0 text-xs font-bold text-primary">+{m.pontos} pts</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${m.progresso}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
