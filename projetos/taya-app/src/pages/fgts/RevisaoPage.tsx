import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarBlank, Check } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const nomeMes = (mes: number) => MESES[mes - 1] ?? "";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface ParcelaFGTS {
  ano: number;
  data: string;
  valorLiberado: number;
}

interface RevisaoFGTSState {
  saldoDisponivel: number;
  numParcelas: number;
  parcelas: ParcelaFGTS[];
  valorTotalReceber: number;
  totalADescontar: number;
  taxaMensal: number;
}

// Fallback mock — TODO: receber da API BMP
const FALLBACK: RevisaoFGTSState = {
  saldoDisponivel: 5842.30,
  numParcelas: 3,
  parcelas: [
    { ano: 2026, data: "01/09/2026", valorLiberado: 1200.0 },
    { ano: 2027, data: "01/09/2027", valorLiberado: 900.0 },
    { ano: 2028, data: "01/09/2028", valorLiberado: 700.0 },
  ],
  valorTotalReceber: 2800.0,
  totalADescontar: 3150.0,
  taxaMensal: 1.99,
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function FGTSRevisaoPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    saldoDisponivel,
    numParcelas,
    parcelas,
    valorTotalReceber,
    totalADescontar,
    taxaMensal,
  } = (location.state as RevisaoFGTSState) ?? FALLBACK;

  const [termoAceito, setTermoAceito] = useState(false);

  // Cálculos derivados
  const iof = valorTotalReceber * 0.0038; // TODO: receber da API BMP
  const cetMensal = (taxaMensal * 1.08).toFixed(2); // TODO: receber da API BMP
  const MES_ANIVERSARIO = 9; // TODO: receber do StoredUser ou API
  const primeiraParcelaLabel = `${nomeMes(MES_ANIVERSARIO)} de ${parcelas[0]?.ano ?? 2026}`;

  return (
    <SubPageLayout title="Revise sua oferta" hideNav>
      <div className="space-y-4 pb-32">

        {/* Bloco 1 — Composição do recebimento */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-base font-semibold text-foreground">Sua antecipação</p>

          <div className="divide-y divide-border">
            {/* Valor a receber */}
            <div className="py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Você vai receber hoje</span>
                <span className="text-sm font-semibold text-green-700">
                  R$ {formatCurrency(valorTotalReceber)}
                </span>
              </div>
            </div>

            {/* IOF */}
            <div className="py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">+ IOF</span>
                <span className="text-sm text-muted-foreground">
                  R$ {formatCurrency(iof)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Imposto federal obrigatório</p>
            </div>

            {/* TC */}
            <div className="py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">+ TC (Tarifa de Cadastro)</span>
                <span className="text-sm text-muted-foreground">R$ 20,00</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Taxa operacional</p>
            </div>

            {/* Total a descontar */}
            <div className="py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">= Total a descontar</span>
                <span className="text-sm font-semibold text-foreground">
                  R$ {formatCurrency(totalADescontar)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2 — Previsão de depósito */}
        {/* TODO: usar tempo real da API BMP */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7]">
              <CalendarBlank size={16} className="text-[#E8590A]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previsão de crédito na conta</p>
              <p className="text-sm font-semibold text-foreground">
                Em até 15 minutos após a aprovação
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3 — Tabela de parcelas */}
        <div className="rounded-2xl bg-[#FEF0E7] p-4">
          <p className="mb-3 text-sm font-semibold text-[#A33D05]">Parcelas anuais antecipadas</p>

          <div className="overflow-hidden rounded-xl border border-[#E8590A]/20">
            <div className="flex bg-[#E8590A]/10 px-3 py-2 text-xs font-medium text-[#A33D05]">
              <span className="flex-1">Data</span>
              <span>Valor liberado</span>
            </div>
            {parcelas.map((p) => (
              <div
                key={p.ano}
                className="flex items-center border-t border-[#E8590A]/10 px-3 py-2.5 text-sm"
              >
                <span className="flex-1 text-[#A33D05]">{p.data}</span>
                <span className="font-medium text-[#A33D05]">
                  R$ {formatCurrency(p.valorLiberado)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-[#A33D05]/70">
            Total de parcelas: {numParcelas}x anuais
          </p>
        </div>

        {/* Bloco 4 — Detalhes */}
        <div className="rounded-2xl bg-[#FEF0E7] p-4">
          <p className="mb-3 text-sm font-semibold text-[#A33D05]">Detalhes</p>
          <div className="space-y-2">
            {[
              { label: "Taxa de juros", value: `${taxaMensal}% a.m.` },
              { label: "CET", value: `${cetMensal}% a.m.` },
              { label: "Primeira parcela", value: primeiraParcelaLabel },
              { label: "Saldo utilizado", value: `R$ ${formatCurrency(saldoDisponivel)}` },
            ].map((linha) => (
              <div key={linha.label} className="flex items-center justify-between">
                <span className="text-xs text-[#A33D05]/70">{linha.label}</span>
                <span className="text-xs font-medium text-[#A33D05]">{linha.value}</span>
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
              ? "border-[#E8590A] bg-[#FEF0E7]"
              : "border-border bg-white hover:border-[#E8590A]/40",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              termoAceito ? "border-[#E8590A] bg-[#E8590A]" : "border-border bg-white",
            )}
          >
            {termoAceito && <Check size={12} className="text-white" weight="bold" />}
          </div>
          <span className="text-sm leading-relaxed text-muted-foreground">
            Ao continuar, concordo com os{" "}
            <a
              href="#"
              className="text-[#E8590A] underline underline-offset-2"
              onClick={(e) => e.stopPropagation()}
            >
              Termos do Contrato
            </a>{" "}
            e autorizo o desconto das parcelas do meu FGTS nas datas acordadas.
          </span>
        </button>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          disabled={!termoAceito}
          onClick={() =>
            navigate("/fgts/dados", {
              state: {
                saldoDisponivel,
                numParcelas,
                parcelas,
                valorTotalReceber,
                totalADescontar,
                taxaMensal,
              },
            })
          }
          className={cn(
            "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
            termoAceito
              ? "bg-[#E8590A] hover:bg-[#d04e08] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#E8590A] opacity-40",
          )}
        >
          Aceitar e continuar
        </button>
      </div>
    </SubPageLayout>
  );
}
