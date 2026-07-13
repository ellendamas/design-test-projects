import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CaretDown, Check } from "@phosphor-icons/react";
import { IMaskInput } from "react-imask";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constantes mock — TODO: receber da API
// ---------------------------------------------------------------------------
const LIMITE_DISPONIVEL = 32533.83;
const TAXA_MENSAL = 3.48; // % a.m. — TODO: receber da API
const PRAZO_OPTIONS = [6, 12, 18, 24, 36];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseCurrency = (v: string) =>
  Number(v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "")) || 0;

const calcParcela = (val: number, p: number) => {
  if (val <= 0 || p <= 0) return 0;
  const r = TAXA_MENSAL / 100;
  return (val * r * Math.pow(1 + r, p)) / (Math.pow(1 + r, p) - 1);
};

const proximoMes = () => {
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${meses[d.getMonth()]} de ${d.getFullYear()}`;
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTSimuladorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nome do parceiro selecionado na tela de ofertas — fallback "Bull" para acesso direto via URL
  const provedor = (location.state as { provedor?: string } | null)?.provedor ?? "Bull";

  const [valor, setValor] = useState<number>(10000);
  // TODO: confirmar com Barreto qual prazo deve ser pré-selecionado como default
  // Por ora: selecionando o maior prazo (36) para maximizar chance de aprovação
  const [prazo, setPrazo] = useState<number>(36);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  // Desmarcado por padrão — não pode ser venda casada
  const [seguroAtivo, setSeguroAtivo] = useState(false);

  // Cálculo de parcela price (juros compostos)
  const valorParcela = useMemo(() => {
    if (valor <= 0 || prazo <= 0) return 0;
    const r = TAXA_MENSAL / 100;
    return (valor * r * Math.pow(1 + r, prazo)) / (Math.pow(1 + r, prazo) - 1);
  }, [valor, prazo]);

  const totalAPagar = useMemo(() => valorParcela * prazo, [valorParcela, prazo]);

  // TODO: receber valor real do seguro da API
  const valorParcelaComSeguro = useMemo(
    () => (seguroAtivo ? valorParcela * 1.03 : valorParcela),
    [valorParcela, seguroAtivo],
  );

  const totalAPagarComSeguro = useMemo(
    () => valorParcelaComSeguro * prazo,
    [valorParcelaComSeguro, prazo],
  );

  const cetMensal = (TAXA_MENSAL + 0.21).toFixed(2); // TODO: receber CET real da API

  const valorInvalido = valor < 110 || valor > LIMITE_DISPONIVEL;
  const podeAvancar = !valorInvalido && valor > 0;

  const handleContinuar = () => {
    navigate("/consignado-clt/revisao", {
      state: {
        valor,
        prazo,
        valorParcela: valorParcelaComSeguro,
        totalAPagar: totalAPagarComSeguro,
        taxaMensal: TAXA_MENSAL,
        seguroAtivo,
        provedor,
      },
    });
  };

  return (
    <SubPageLayout title="Simular Consignado CLT" hideNav>
      <div className="space-y-4 pb-32">

        {/* Bloco 1 — Input de valor */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-base font-semibold text-foreground">Quanto você precisa?</p>

          <IMaskInput
            mask={Number}
            scale={2}
            thousandsSeparator="."
            radix=","
            mapToRadix={["."]}
            normalizeZeros
            padFractionalZeros
            value={formatCurrency(valor)}
            onAccept={(v: unknown) => setValor(parseCurrency(String(v)))}
            className="h-16 w-full rounded-xl border border-border px-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#E8590A]"
            placeholder="R$ 0,00"
          />

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Escolha entre R$ 110,00 e R$ {formatCurrency(LIMITE_DISPONIVEL)}
          </p>

          {valorInvalido && valor > 0 && (
            <p className="mt-1 text-center text-xs font-medium text-red-500">
              Valor fora do limite disponível
            </p>
          )}
        </div>

        {/* Bloco 2 — Seleção de prazo (chips clicáveis) */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">Em quantas vezes?</p>

          <div className="flex flex-wrap gap-2">
            {PRAZO_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrazo(p)}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-4 py-3 text-sm transition-colors",
                  prazo === p
                    ? "border-[#E8590A] bg-[#FEF0E7] text-[#E8590A]"
                    : "border-border bg-white text-foreground"
                )}
              >
                <span className="font-semibold">{p}x</span>
                <span className="text-xs text-muted-foreground">
                  R$ {formatCurrency(calcParcela(valor, p))}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bloco 3 — Proteção prestamista (opcional) */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setSeguroAtivo(!seguroAtivo)}
            className="flex w-full items-start gap-3 text-left"
          >
            <div
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                seguroAtivo ? "border-[#E8590A] bg-[#E8590A]" : "border-border bg-white",
              )}
            >
              {seguroAtivo && <Check size={12} className="text-white" weight="bold" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Proteção prestamista</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Cobre suas parcelas em caso de demissão sem justa causa ou incapacidade temporária.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-[#E8590A]">
                + R$ {formatCurrency(valorParcela * 0.03)}/mês
              </p>
              <p className="text-[10px] text-muted-foreground">~3% da parcela</p>
            </div>
          </button>
        </div>

        {/* Bloco 4 — Preview de valores */}
        <div className="rounded-2xl bg-[#FEF0E7] p-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#A33D05]/70">Valor a receber</span>
            <span className="text-2xl font-bold text-[#E8590A]">
              R$ {formatCurrency(valor > 0 ? valor : 0)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-muted-foreground">Taxa de juros</span>
            <span className="text-sm font-medium text-[#A33D05]">{TAXA_MENSAL}% ao mês</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#A33D05]/70">Total a pagar</span>
            <span className="text-sm font-semibold text-[#A33D05]">
              R$ {formatCurrency(totalAPagarComSeguro)}
            </span>
          </div>

          {/* Accordion — detalhes da operação */}
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-[#E8590A]/30 bg-white/60 px-3 py-2 text-sm text-[#A33D05]"
            onClick={() => setDetalhesOpen((p) => !p)}
          >
            Ver detalhes da operação
            <CaretDown
              size={16}
              className={`transition-transform ${detalhesOpen ? "rotate-180" : ""}`}
            />
          </button>

          {detalhesOpen && (
            <div className="mt-2 space-y-1.5 rounded-xl bg-white/60 px-3 py-3 text-xs text-[#A33D05]/80">
              <div className="flex justify-between">
                <span>CET estimado</span>
                <span className="font-medium">{cetMensal}% a.m.</span>
              </div>
              <div className="flex justify-between">
                <span>Primeira parcela em</span>
                <span className="font-medium">{proximoMes()}</span>
              </div>
              <div className="flex justify-between">
                <span>Número de parcelas</span>
                <span className="font-medium">{prazo}x</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          disabled={!podeAvancar}
          onClick={handleContinuar}
          className={cn(
            "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
            podeAvancar
              ? "bg-[#E8590A] hover:bg-[#d04e08]"
              : "cursor-not-allowed bg-[#E8590A] opacity-40"
          )}
        >
          Continuar
        </button>
      </div>
    </SubPageLayout>
  );
}