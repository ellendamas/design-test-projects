import { OFERTA_LEILAO, dataExpiracaoExtenso } from "./leilaoData";

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function OfertaResumoCard() {
  return (
    <div className="rounded-2xl border-0 bg-primary p-5 text-white">
      <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Oferta aprovada</span>
      <p className="mt-3 text-3xl font-bold">R$ {formatCurrency(OFERTA_LEILAO.valor)}</p>
      <p className="mt-1 text-sm text-white/90">
        {OFERTA_LEILAO.parcelas}x de R$ {formatCurrency(OFERTA_LEILAO.valorParcela)}
      </p>
      <p className="text-sm text-white/90">Taxa: {OFERTA_LEILAO.taxaMensal}% a.m.</p>
      <p className="mt-3 text-xs text-white/75">Proposta válida até {dataExpiracaoExtenso(7)}</p>
    </div>
  );
}
