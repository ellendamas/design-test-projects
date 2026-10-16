type Cupom = { id: string; titulo: string; parceiro: string; condicao: string };

export function CouponStrip({ cupons }: { cupons: Cupom[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Cupons pra você</h3>
      <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
        {cupons.map((c) => (
          <div key={c.id} className="w-[160px] shrink-0 rounded-2xl border border-dashed border-primary/40 bg-primary-light p-3">
            <p className="text-sm font-bold text-primary">{c.titulo}</p>
            <p className="mt-1 text-xs text-foreground">{c.parceiro}</p>
            <p className="text-xs text-muted-foreground">{c.condicao}</p>
            <button
              type="button"
              className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-primary text-xs font-bold text-white"
            >
              Pegar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
