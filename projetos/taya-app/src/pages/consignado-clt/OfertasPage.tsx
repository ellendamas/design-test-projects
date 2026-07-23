import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CaretRight, CheckCircle, FileX, X } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Mock de propostas
// ---------------------------------------------------------------------------
type Proposta = {
  id: string;
  provedor: string;
  valorMaximo: number; // centavos
  taxaMensal: number; // ex: 0.0199
  prazoMinimo: number; // meses
  prazoMaximo: number; // meses
  parcelaEstimada: number; // centavos (base: valor máximo / prazo máximo)
};

// TODO: receber da API após multiproviders
const PROPOSTAS_MOCK: Proposta[] = [
  {
    id: "bull-001",
    provedor: "Bull",
    valorMaximo: 3253383,
    taxaMensal: 0.0199,
    prazoMinimo: 6,
    prazoMaximo: 36,
    parcelaEstimada: 112000,
  },
  {
    id: "v8-001",
    provedor: "V8",
    valorMaximo: 2800000,
    taxaMensal: 0.0179,
    prazoMinimo: 6,
    prazoMaximo: 48,
    parcelaEstimada: 87000,
  },
  {
    id: "c6-001",
    provedor: "C6 Bank",
    valorMaximo: 4100000,
    taxaMensal: 0.0215,
    prazoMinimo: 12,
    prazoMaximo: 24,
    parcelaEstimada: 198000,
  },
];

const formatCurrency = (centavos: number) =>
  `R$ ${(centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTOfertasPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [propostaSelecionada, setPropostaSelecionada] = useState<string | null>(null);

  // DESIGN ONLY — ?qtd=0|1|2|3 controla quantas propostas mock são exibidas (0 = estado vazio)
  const qtdParamRaw = searchParams.get("qtd");
  const qtd =
    qtdParamRaw === null
      ? PROPOSTAS_MOCK.length
      : Math.min(Math.max(Number(qtdParamRaw) || 0, 0), PROPOSTAS_MOCK.length);
  const propostas = PROPOSTAS_MOCK.slice(0, qtd);

  const maiorValor = Math.max(...propostas.map((p) => p.valorMaximo));
  const maiorPrazo = Math.max(...propostas.map((p) => p.prazoMaximo));

  // Label só quando há mais de 1 proposta
  const getLabel = (p: Proposta) => {
    if (propostas.length <= 1) return null;
    if (p.valorMaximo === maiorValor) return "Maior valor";
    if (p.prazoMaximo === maiorPrazo) return "Maior prazo";
    return null;
  };

  const proposta = propostas.find((p) => p.id === propostaSelecionada) ?? null;

  return (
    <SubPageLayout title="Consignado CLT" hideNav>
      <div className="space-y-4 pb-24">

        {/* Estado vazio — nenhuma oferta disponível */}
        {propostas.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileX size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Nenhuma oferta disponível agora
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Infelizmente não encontramos ofertas disponíveis para você neste momento.
                Isso pode mudar — tente novamente em alguns dias.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate("/consignado-clt/provedores")}
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#FD5F31] text-sm font-semibold text-[#FD5F31]"
              >
                Tentar com outro parceiro
              </button>
              <button
                type="button"
                onClick={() => navigate("/painel")}
                className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground underline"
              >
                Voltar ao painel
              </button>
            </div>
            {/* Cross-sell */}
            <div className="mt-2 w-full rounded-2xl border border-border bg-white p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Outras opções para você
              </p>
              <button
                type="button"
                onClick={() => navigate("/credito-pessoal")}
                className="flex items-center gap-2 text-sm font-semibold text-[#FD5F31]"
              >
                <ArrowRight size={16} />
                Crédito Pessoal — sem desconto em folha
              </button>
            </div>
          </div>
        )}

        {/* Header de celebração */}
        {propostas.length > 0 && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={32} className="text-green-600" weight="fill" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {propostas.length === 1
                  ? "Encontramos uma oferta para você!"
                  : `Encontramos ${propostas.length} ofertas para você!`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha a que faz mais sentido para você agora.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {propostas.map((p) => {
            const label = getLabel(p);
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setPropostaSelecionada(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setPropostaSelecionada(p.id);
                }}
                className="relative w-full cursor-pointer rounded-2xl border border-border bg-white p-4 text-left shadow-sm transition-colors hover:border-[#FD5F31]/40 active:bg-[#FFF3EE]/30 md:flex md:items-end md:justify-between md:gap-4"
              >
                {/* Label — fixada na extremidade superior direita do card */}
                {label && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#FFF3EE] px-2 py-0.5 text-[10px] font-semibold text-[#FD5F31]">
                    {label}
                  </span>
                )}

                <div className="space-y-3 md:flex-1">
                  {/* Header: avatar + nome do provedor */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF3EE] text-sm font-semibold text-[#FD5F31]">
                      {p.provedor.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{p.provedor}</p>
                  </div>

                  {/* Valor em destaque + parcelas, agrupados */}
                  <div>
                    <p className="text-xs text-muted-foreground">Disponível até</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(p.valorMaximo)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Parcelas em até {p.prazoMaximo}x</p>
                  </div>
                </div>

                {/* "Ver condições" — alinhado à direita */}
                <div className="mt-3 flex md:mt-0 md:shrink-0 md:justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPropostaSelecionada(p.id);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#FD5F31]"
                  >
                    Ver condições
                    <CaretRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Drawer/modal de condições */}
      {proposta && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPropostaSelecionada(null);
          }}
        >
          <div className="w-full max-w-md space-y-5 rounded-t-3xl bg-background p-6 md:rounded-3xl">

            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">{proposta.provedor}</p>
              <button type="button" onClick={() => setPropostaSelecionada(null)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor disponível até</span>
                <span className="text-sm font-semibold">{formatCurrency(proposta.valorMaximo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Taxa de juros</span>
                <span className="text-sm font-semibold">
                  {(proposta.taxaMensal * 100).toFixed(2)}% a.m.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Prazo disponível</span>
                <span className="text-sm font-semibold">
                  {proposta.prazoMinimo} a {proposta.prazoMaximo} meses
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Parcela estimada</span>
                <span className="text-sm font-semibold">{formatCurrency(proposta.parcelaEstimada)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/consignado-clt/simular", {
                state: { proposta, provedor: proposta.provedor },
              })}
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white"
            >
              Escolher esta oferta
            </button>

          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
