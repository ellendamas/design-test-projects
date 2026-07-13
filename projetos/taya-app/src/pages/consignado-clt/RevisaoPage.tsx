import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarBlank, Check } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const proximoMesPorExtenso = () => {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${meses[d.getMonth()]} de ${d.getFullYear()}`;
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface RevisaoState {
  valor: number;
  prazo: number;
  valorParcela: number;
  totalAPagar: number;
  taxaMensal: number;
  provedor?: string;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTRevisaoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    valor,
    prazo,
    valorParcela,
    totalAPagar,
    taxaMensal,
    provedor = "Bull",
  } = (location.state as RevisaoState) ?? {
    valor: 10000,
    prazo: 36,
    valorParcela: 533.65,
    totalAPagar: 19211.4,
    taxaMensal: 3.48,
  };

  const [termoAceito, setTermoAceito] = useState(false);

  // Usuário avançou para a revisão (escolheu uma oferta) — o card "Consulta concluída" do painel some
  // TODO: remover localStorage quando API disponibilizar status real
  useEffect(() => {
    localStorage.removeItem("podeja_clt_consulta_ts");
  }, []);

  // Cálculos derivados
  // TODO: receber IOF real da API
  const iof = valor * 0.0332;
  const valorEmprestimo = valor + iof;

  // Taxa anual efetiva
  const taxaAnual = ((Math.pow(1 + taxaMensal / 100, 12) - 1) * 100).toFixed(2);
  // TODO: receber CET real da API
  const cetMensal = (taxaMensal + 0.21).toFixed(2);

  const linhasComposicao = [
    {
      label: "Valor que você vai receber",
      value: `R$ ${formatCurrency(valor)}`,
      className: "font-semibold text-green-700",
      sublabel: null,
    },
    {
      label: "+ IOF",
      value: `R$ ${formatCurrency(iof)}`,
      className: "text-muted-foreground text-sm",
      sublabel: "Imposto federal obrigatório",
    },
    {
      label: "= Valor do empréstimo",
      value: `R$ ${formatCurrency(valorEmprestimo)}`,
      className: "font-semibold text-foreground",
      sublabel: null,
    },
  ];

  const linhasDetalhes = [
    { label: "Taxa de juros", value: `${taxaMensal}% a.m. | ${taxaAnual}% a.a.` },
    { label: "CET", value: `${cetMensal}% a.m.` },
    { label: "Parcelas", value: `${prazo}x de R$ ${formatCurrency(valorParcela)}` },
    { label: "Primeira parcela", value: proximoMesPorExtenso() },
    { label: "Total a pagar", value: `R$ ${formatCurrency(totalAPagar)}` },
  ];

  return (
    <SubPageLayout title="Revise sua oferta" hideNav>
      <div className="space-y-4 pb-32">

        {/* Bloco 1 — Composição do empréstimo */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">Sua oferta</p>
            <span className="rounded-full bg-[#FEF0E7] px-2.5 py-1 text-[11px] font-semibold text-[#E8590A]">
              {provedor}
            </span>
          </div>

          <div className="divide-y divide-border">
            {linhasComposicao.map((linha) => (
              <div key={linha.label} className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{linha.label}</span>
                  <span className={cn("text-sm", linha.className)}>{linha.value}</span>
                </div>
                {linha.sublabel && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{linha.sublabel}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 2 — Previsão de crédito */}
        {/* TODO: receber datas reais da API */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7]">
              <CalendarBlank size={16} className="text-[#E8590A]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previsão de crédito na conta</p>
              <p className="text-sm font-semibold text-foreground">
                Entre hoje e em até 3 dias úteis
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3 — Detalhes do consignado (bg laranja, padrão Saque Fácil) */}
        <div className="rounded-2xl bg-[#FEF0E7] p-4">
          <p className="mb-3 text-sm font-semibold text-[#A33D05]">Detalhes do consignado</p>

          <div className="space-y-2">
            {linhasDetalhes.map((linha) => (
              <div key={linha.label} className="flex items-center justify-between">
                <span className="text-xs text-[#A33D05]/70">{linha.label}</span>
                <span className="text-xs font-medium text-[#A33D05]">{linha.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consentimento — botão-checkbox custom (padrão exato do Saque Fácil) */}
        <button
          type="button"
          onClick={() => setTermoAceito(!termoAceito)}
          className={cn(
            "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
            termoAceito
              ? "border-[#E8590A] bg-[#FEF0E7]"
              : "border-border bg-white hover:border-[#E8590A]/40"
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              termoAceito ? "border-[#E8590A] bg-[#E8590A]" : "border-border bg-white"
            )}
          >
            {termoAceito && <Check size={12} className="text-white" weight="bold" />}
          </div>
          <span className="text-sm leading-relaxed text-foreground">
            Ao continuar, concordo com os{" "}
            <a
              href="#"
              className="text-[#E8590A] underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Termos do Contrato
            </a>{" "}
            e autorizo o desconto das parcelas em folha de pagamento.
          </span>
        </button>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          disabled={!termoAceito}
          onClick={() => navigate("/consignado-clt/dados", { state: { ...location.state, valor, prazo, valorParcela, totalAPagar, taxaMensal, provedor } })}
          className={cn(
            "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
            termoAceito
              ? "bg-[#E8590A] hover:bg-[#d04e08]"
              : "cursor-not-allowed bg-[#E8590A] opacity-40"
          )}
        >
          Aceitar e continuar
        </button>
      </div>
    </SubPageLayout>
  );
}
