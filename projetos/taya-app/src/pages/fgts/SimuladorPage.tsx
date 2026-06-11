import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretDown } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constantes mock — TODO: receber da API BMP
// ---------------------------------------------------------------------------
const SALDO_DISPONIVEL = 5842.30;
const TAXA_MENSAL = 1.99; // % a.m. — TODO: receber da API BMP
const ANO_ATUAL = 2026; // TODO: usar new Date().getFullYear() após resolver Date.now() em workflow
const MES_ANIVERSARIO = 9; // Setembro — TODO: receber do StoredUser ou API

const PARCELAS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const nomeMes = (mes: number) => MESES[mes - 1] ?? "";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface ParcelaFGTS {
  ano: number;
  data: string;
  valorLiberado: number;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function FGTSSimuladorPage() {
  const navigate = useNavigate();
  const [numParcelas, setNumParcelas] = useState<number>(3);
  const [detalhesOpen, setDetalhesOpen] = useState(false);

  // Cálculo das parcelas antecipadas por ano
  // Simplificação para mock: distribuição proporcional decrescente por fator de desconto
  // TODO: substituir por cálculo real da API BMP
  const parcelasCalculadas = useMemo<ParcelaFGTS[]>(() => {
    const parcelas: ParcelaFGTS[] = [];
    let saldoRestante = SALDO_DISPONIVEL;
    for (let i = 0; i < numParcelas; i++) {
      const ano = ANO_ATUAL + i;
      const fatorDesconto = Math.pow(1 + TAXA_MENSAL / 100, 12 * (i + 1));
      const valorParcela = (saldoRestante / fatorDesconto / numParcelas) * (numParcelas - i);
      parcelas.push({
        ano,
        data: `01/${String(MES_ANIVERSARIO).padStart(2, "0")}/${ano}`,
        valorLiberado: valorParcela,
      });
      saldoRestante -= valorParcela;
    }
    return parcelas;
  }, [numParcelas]);

  const valorTotalReceber = useMemo(
    () => parcelasCalculadas.reduce((acc, p) => acc + p.valorLiberado, 0),
    [parcelasCalculadas],
  );

  const totalADescontar = useMemo(
    () => valorTotalReceber * (1 + TAXA_MENSAL / 100), // simplificação — TODO: API BMP
    [valorTotalReceber],
  );

  const cetMensal = (TAXA_MENSAL * 1.08).toFixed(2); // TODO: receber da API BMP
  const iof = valorTotalReceber * 0.0038; // TODO: receber da API BMP

  const handleContinuar = () => {
    navigate("/fgts/revisao", {
      state: {
        saldoDisponivel: SALDO_DISPONIVEL,
        numParcelas,
        parcelas: parcelasCalculadas,
        valorTotalReceber,
        totalADescontar,
        taxaMensal: TAXA_MENSAL,
      },
    });
  };

  return (
    <SubPageLayout title="Simular antecipação">
      <div className="space-y-4 pb-32">

        {/* Bloco 1 — Saldo disponível em destaque */}
        <div className="rounded-2xl bg-[#FEF0E7] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#A33D05]/70">
            Seu saldo disponível para antecipar
          </p>
          <p className="mt-1 text-4xl font-bold text-[#A33D05]">
            R$ {formatCurrency(SALDO_DISPONIVEL)}
          </p>
          <p className="mt-1 text-xs text-[#A33D05]/70">
            Consultado agora via Caixa Econômica Federal
            {/* TODO: exibir timestamp real da consulta */}
          </p>
        </div>

        {/* Bloco 2 — Seleção de parcelas */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Quantas parcelas anuais você quer antecipar?
          </p>
          <div className="flex flex-wrap gap-2">
            {PARCELAS_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumParcelas(n)}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-4 py-3 text-sm transition-colors",
                  numParcelas === n
                    ? "border-[#E8590A] bg-[#FEF0E7] text-[#E8590A]"
                    : "border-border bg-white text-foreground",
                )}
              >
                <span className="font-semibold">{n}x</span>
                <span className="text-xs text-muted-foreground">anual</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3 — Tabela de parcelas por ano */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Parcelas que serão antecipadas
          </p>
          <div className="overflow-hidden rounded-xl border border-border">
            {/* Header */}
            <div className="flex bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
              <span className="flex-1">Data</span>
              <span>Valor liberado</span>
            </div>
            {/* Linhas */}
            {parcelasCalculadas.map((p) => (
              <div
                key={p.ano}
                className="flex items-center border-t border-border px-3 py-2.5 text-sm"
              >
                <span className="flex-1 text-foreground">{p.data}</span>
                <span className="font-medium text-foreground">
                  R$ {formatCurrency(p.valorLiberado)}
                </span>
              </div>
            ))}
            {/* Total */}
            <div className="flex items-center border-t border-[#E8590A]/30 bg-[#FEF0E7] px-3 py-2.5 text-sm">
              <span className="flex-1 font-semibold text-[#A33D05]">Total a receber</span>
              <span className="font-bold text-[#E8590A]">
                R$ {formatCurrency(valorTotalReceber)}
              </span>
            </div>
          </div>
        </div>

        {/* Bloco 4 — Preview de resultado */}
        <div className="rounded-2xl bg-[#FEF0E7] p-4">
          <p className="text-xs text-[#A33D05]/70">Você vai receber hoje</p>
          <p className="mt-1 text-3xl font-bold text-[#A33D05]">
            R$ {formatCurrency(valorTotalReceber)}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <span className="text-[#A33D05]/70">Taxa</span>
            <span className="font-medium text-[#A33D05]">{TAXA_MENSAL}% a.m.</span>

            <span className="text-[#A33D05]/70">CET</span>
            <span className="font-medium text-[#A33D05]">{cetMensal}% a.m.</span>

            <span className="text-[#A33D05]/70">IOF</span>
            <span className="font-medium text-[#A33D05]">R$ {formatCurrency(iof)}</span>

            <span className="text-[#A33D05]/70">TC</span>
            <span className="font-medium text-[#A33D05]">R$ 20,00</span>

            <div className="col-span-2 mt-1 border-t border-[#E8590A]/20 pt-1.5" />

            <span className="font-semibold text-[#A33D05]">Total a descontar</span>
            <span className="font-bold text-[#A33D05]">R$ {formatCurrency(totalADescontar)}</span>
          </div>

          {/* Accordion — detalhes por período */}
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#E8590A]/30 bg-white/60 px-3 py-2 text-sm text-[#A33D05]"
            onClick={() => setDetalhesOpen((p) => !p)}
          >
            Ver detalhes por período
            <CaretDown
              size={16}
              className={`transition-transform ${detalhesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {detalhesOpen && (
            <div className="mt-2 rounded-xl bg-white/60 px-3 py-3 text-xs text-[#A33D05]/80">
              <div className="mb-2 flex font-semibold">
                <span className="flex-1">Período</span>
                <span className="mr-16">Parcela</span>
                <span>Desconto no ano</span>
              </div>
              {parcelasCalculadas.map((p) => (
                <div key={p.ano} className="flex border-t border-[#E8590A]/10 py-1.5">
                  <span className="flex-1">
                    {nomeMes(MES_ANIVERSARIO)}/{p.ano}
                  </span>
                  <span className="mr-4">R$ {formatCurrency(p.valorLiberado)}</span>
                  <span>
                    R$ {formatCurrency(p.valorLiberado * (1 + TAXA_MENSAL / 100))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          onClick={handleContinuar}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
        >
          Quero contratar
        </button>
      </div>
    </SubPageLayout>
  );
}
