import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarBlank, Check, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";
import { OFERTA_LEILAO } from "./leilaoData";

// ---------------------------------------------------------------------------
// Helpers — mesmos de consignado-clt/RevisaoPage.tsx
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

// Rota: /leilao — oferta já aprovada via leilão CLT, usuário autenticado.
// Base: consignado-clt/RevisaoPage.tsx, com o cabeçalho de sucesso de
// consignado-clt/ConfirmacaoPage.tsx acrescentado acima do primeiro bloco.
export default function LeilaoOfertaPage() {
  const navigate = useNavigate();
  const [termoAceito, setTermoAceito] = useState(false);

  const { valor, parcelas: prazo, valorParcela, taxaMensal } = OFERTA_LEILAO;
  const provedor = "Bull";

  // Consulta via CTPS Digital já concluída — o card correspondente no painel some
  useEffect(() => {
    localStorage.removeItem("podeja_clt_consulta_ts");
  }, []);

  // Cálculos derivados — mesma aproximação usada em RevisaoPage
  // TODO: receber IOF/CET/total real da API
  const iof = valor * 0.0332;
  const valorEmprestimo = valor + iof;
  const taxaAnual = ((Math.pow(1 + taxaMensal / 100, 12) - 1) * 100).toFixed(2);
  const cetMensal = (taxaMensal + 0.21).toFixed(2);
  const totalAPagar = prazo * valorParcela;

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
    <SubPageLayout title="" hideNav>
      <div className="space-y-4 pb-32">

        {/* Cabeçalho de sucesso — igual a consignado-clt/ConfirmacaoPage.tsx */}
        <div className="flex flex-col items-center gap-3 px-2 pb-1 pt-4 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle size={40} className="text-green-600" weight="fill" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Proposta aprovada!</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Encontramos a melhor oferta para você entre as instituições parceiras. Confira os detalhes abaixo.
            </p>
          </div>
        </div>

        {/* Bloco 1 — Composição do empréstimo */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">Sua oferta</p>
            <span className="rounded-full bg-[#FFF3EE] px-2.5 py-1 text-[11px] font-semibold text-[#FD5F31]">
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3EE]">
              <CalendarBlank size={16} className="text-[#FD5F31]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previsão de crédito na conta</p>
              <p className="text-sm font-semibold text-foreground">
                Entre hoje e em até 3 dias úteis
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3 — Detalhes do consignado (bg laranja) */}
        <div className="rounded-2xl bg-[#FFF3EE] p-4">
          <p className="mb-3 text-sm font-semibold text-[#D94E28]">Detalhes do consignado</p>

          <div className="space-y-2">
            {linhasDetalhes.map((linha) => (
              <div key={linha.label} className="flex items-center justify-between">
                <span className="text-xs text-[#D94E28]/70">{linha.label}</span>
                <span className="text-xs font-medium text-[#D94E28]">{linha.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consentimento — botão-checkbox custom */}
        <button
          type="button"
          onClick={() => setTermoAceito(!termoAceito)}
          className={cn(
            "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
            termoAceito
              ? "border-[#FD5F31] bg-[#FFF3EE]"
              : "border-border bg-white hover:border-[#FD5F31]/40"
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              termoAceito ? "border-[#FD5F31] bg-[#FD5F31]" : "border-border bg-white"
            )}
          >
            {termoAceito && <Check size={12} className="text-white" weight="bold" />}
          </div>
          <span className="text-sm leading-relaxed text-foreground">
            Ao continuar, concordo com os termos do contrato de consentimento realizado e autorizo o desconto das
            parcelas em folha de pagamento.
          </span>
        </button>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          disabled={!termoAceito}
          onClick={() => navigate("/leilao/dados-pendentes")}
          className={cn(
            "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
            termoAceito
              ? "bg-[#FD5F31] hover:bg-[#d04e08]"
              : "cursor-not-allowed bg-[#FD5F31] opacity-40"
          )}
        >
          Aceitar e continuar
        </button>
      </div>
    </SubPageLayout>
  );
}
