import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout, getStoredUser } from "@/App";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface ConfirmacaoFGTSState {
  valorTotalReceber?: number;
  numParcelas?: number;
  banco?: { nome: string } | null;
  parcelas?: { ano: number }[];
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function FGTSConfirmacaoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getStoredUser();
  const primeiroNome = user?.name?.split(" ")[0] ?? "";

  // Dados do fluxo com fallbacks mock
  // TODO: receber todos os valores reais da API BMP
  const {
    valorTotalReceber = 2800,
    numParcelas = 3,
    banco = null,
    parcelas = [],
  } = (location.state as ConfirmacaoFGTSState) ?? {};

  const anoAtual = parcelas[0]?.ano ?? 2026;

  const linhasResumo = [
    {
      label: "Valor a receber",
      value: `R$ ${formatCurrency(valorTotalReceber)}`,
      valueClass: "text-lg font-bold text-[#A33D05]",
    },
    {
      label: "Parcelas",
      value: `${numParcelas}x anuais`,
      valueClass: "text-sm text-[#A33D05]",
    },
    {
      label: "Primeira parcela",
      // TODO: usar data real da API BMP
      value: `Setembro de ${anoAtual}`,
      valueClass: "text-sm text-muted-foreground",
    },
    {
      label: "Banco",
      value: banco?.nome ?? "—",
      valueClass: "text-sm text-muted-foreground",
    },
  ];

  return (
    <SubPageLayout title="" hideNav>
      <div className="flex flex-col items-center gap-5 px-6 pb-24 pt-10">

        {/* Animação de sucesso */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </motion.div>

        {/* Textos */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Seu FGTS está a caminho{primeiroNome ? `, ${primeiroNome}` : ""}!
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {/* TODO: usar tempo real da API BMP */}
            Antecipação aprovada. O valor cai na sua conta em até 15 minutos.
          </p>
        </div>

        {/* Card resumo */}
        <div className="w-full rounded-2xl bg-[#FEF0E7] p-4">
          {linhasResumo.map((linha) => (
            <div
              key={linha.label}
              className="flex items-center justify-between border-b border-[#E8590A]/20 py-1.5 last:border-0"
            >
              <span className="text-sm text-[#A33D05]/70">{linha.label}</span>
              <span className={linha.valueClass}>{linha.value}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-2 w-full space-y-1">
          <button
            type="button"
            onClick={() => navigate("/contratos")}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Ver meu contrato
          </button>
          <button
            type="button"
            onClick={() => navigate("/painel")}
            className="w-full py-3 text-center text-sm text-muted-foreground"
          >
            Voltar para o início
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
