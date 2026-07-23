import { Briefcase, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

interface ConsignadoCLTCardProps {
  hasOpenFinance?: boolean;
  availableLimit?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ConsignadoCLTCard({ hasOpenFinance = false, availableLimit = 0 }: ConsignadoCLTCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Briefcase size={20} className="text-[#FD5F31]" />
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-[#FD5F31]">
          Onda 1
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-foreground">Consignado CLT</h3>
      <p className="text-xs text-muted-foreground">
        {hasOpenFinance
          ? `Você pode ter até ${formatCurrency(availableLimit)}`
          : "Descubra quanto você pode ter com crédito descontado em folha"}
      </p>
      <div className="mt-3 border-t border-border pt-3">
        <Link
          to="/consignado-clt"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#FD5F31] transition-colors hover:text-[#d04e08]"
        >
          Consultar minha oferta
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
