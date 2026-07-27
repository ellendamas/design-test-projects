import { Check } from "@phosphor-icons/react";

// Valores em centavos, consistente com o restante da jornada de Crédito Pessoal
const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type SeguroPrestamistalCardProps = {
  ativo: boolean;
  onToggle: () => void;
  valorOperacao: number; // centavos — valor do empréstimo solicitado
};

export function SeguroPrestamistalCard({ ativo, onToggle, valorOperacao }: SeguroPrestamistalCardProps) {
  // 8,5% do valor da operação — confirmado no Roteiro Operacional Zema
  // TODO: substituir pelo valor real retornado pela API quando disponível
  const valorSeguro = Math.round(valorOperacao * 0.085);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 text-left"
      >
        {/* Checkbox visual custom — mesmo padrão do CLT */}
        <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          ativo ? "border-[#FD5F31] bg-[#FD5F31]" : "border-border bg-white"
        }`}>
          {ativo && <Check size={12} weight="bold" className="text-white" />}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            Seguro Prestamista Bem Seguro
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Protege você e sua família em caso de morte, invalidez ou perda de renda.
            Direito de arrependimento em até 7 dias.
          </p>
        </div>

        {/* Valor */}
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-[#FD5F31]">
            + R$ {formatCents(valorSeguro)}
          </p>
          <p className="text-[10px] text-muted-foreground">8,5% do valor</p>
        </div>
      </button>
    </div>
  );
}
