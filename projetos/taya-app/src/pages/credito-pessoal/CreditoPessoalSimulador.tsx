import { useState } from "react";
import { IMaskInput } from "react-imask";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, XCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type LocationState = Record<string, unknown>;

type SimuladorState = LocationState & {
  valorMinimo: number; // centavos
  valorMaximo: number; // centavos
};

// ---------------------------------------------------------------------------
// Mocks — TODO: receber da API
// ---------------------------------------------------------------------------

// TODO: receber da API
const ofertasMock = [
  { id: "1", parcelas: 6,  valorParcela: 45012, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "3", parcelas: 18, valorParcela: 16834, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "4", parcelas: 24, valorParcela: 13290, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
]; // TODO: receber da API

// DESIGN ONLY — ?prazos=muitos → simula retorno da API com 8 opções de prazo
const ofertasMockMuitas = [
  { id: "1", parcelas: 6,  valorParcela: 45012, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "2", parcelas: 9,  valorParcela: 30812, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "3", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "4", parcelas: 15, valorParcela: 19340, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "5", parcelas: 18, valorParcela: 16834, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "6", parcelas: 21, valorParcela: 14820, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "7", parcelas: 24, valorParcela: 13290, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
  { id: "8", parcelas: 36, valorParcela: 10120, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, cetAnual: undefined as number | undefined, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API quando Zema disponibilizar CET na simulação (P0)
]; // DESIGN ONLY

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: SimuladorState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
  valorMinimo: 50000,  // centavos // TODO: receber da API
  valorMaximo: 300000, // centavos // TODO: receber da API — teto real da Zema é R$ 3.000,00
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseCurrencyStr = (v: string): number => {
  const n = String(v).replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return parseFloat(n) || 0;
};

// Fórmula Price (Sistema Francês de Amortização)
// pv = valor em centavos, i = taxa mensal decimal, n = número de parcelas
// Retorna valor da parcela em centavos (arredondado)
const calcPMT = (pv: number, i: number, n: number): number => {
  if (pv <= 0 || n <= 0) return 0;
  if (i === 0) return Math.round(pv / n);
  return Math.round((pv * i) / (1 - Math.pow(1 + i, -n)));
};

// IOF crédito pessoal — calculado localmente // TODO: usar valor retornado pela API
// Composição: 0,38% fixo sobre principal + 0,0082% ao dia (máx. 365 dias)
const calcIOF = (pv: number, n: number): number => {
  const diasTotais = Math.min(n * 30, 365);
  const iofFixo   = pv * 0.0038;
  const iofDiario = pv * 0.000082 * diasTotais;
  return Math.round(iofFixo + iofDiario);
};

const maskedInputClass =
  "flex h-14 w-full rounded-xl border border-border bg-white px-4 py-2 text-xl font-bold text-[#FD5F31] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalSimulador() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resultadoParam = searchParams.get("resultado") ?? "aprovado"; // DESIGN ONLY
  const ofertas = ofertasMockMuitas; // TODO: receber da API — pode retornar N opções de prazo

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState =
    (location.state as SimuladorState | null) ?? MOCK_STATE; // DESIGN ONLY

  const valorMinimo = locationState.valorMinimo ?? 50000;  // centavos
  const valorMaximo = locationState.valorMaximo ?? 500000; // centavos
  const valorMedio = Math.round((valorMinimo + valorMaximo) / 2);

  // Valor em reais (string formatada para o IMaskInput)
  const [valorStr, setValorStr] = useState(
    (valorMedio / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  );

  // Valor em centavos derivado do input
  const valorAtual = Math.round(parseCurrencyStr(valorStr) * 100); // TODO: receber da API

  const [ofertaSelecionada, setOfertaSelecionada] = useState(ofertas[1]); // 12x por padrão

  const usarGrid = ofertas.length > 4;

  // Valores calculados reativos ao valorAtual e à oferta selecionada
  // TODO: substituir por valores retornados diretamente pela API quando disponíveis
  const valorParcelaCalc = calcPMT(valorAtual, ofertaSelecionada.taxaJuros, ofertaSelecionada.parcelas);
  const totalAPagarCalc  = valorParcelaCalc * ofertaSelecionada.parcelas;
  const valorIofCalc     = calcIOF(valorAtual, ofertaSelecionada.parcelas);

  return (
    <SubPageLayout title="Simule seu crédito" hideNav>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[560px]">

        {/* ── Input de valor ── */}
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Quanto você precisa?</p>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#FD5F31]">
              R$
            </span>
            <IMaskInput
              mask={Number}
              scale={2}
              signed={false}
              thousandsSeparator="."
              radix=","
              mapToRadix={["."]}
              normalizeZeros
              padFractionalZeros
              min={valorMinimo / 100}
              max={valorMaximo / 100}
              value={valorStr}
              onAccept={(v) => setValorStr(String(v))}
              className="flex h-14 w-full rounded-xl border border-border bg-white pl-12 pr-4 py-2 text-xl font-bold text-[#FD5F31] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="0,00"
              inputMode="numeric"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mín. R$ {formatCents(valorMinimo)}</span>
            <span>Máx. R$ {formatCents(valorMaximo)}</span>
          </div>
        </div>

        {/* ── Card de erro — DESIGN ONLY ── */}
        {resultadoParam === "reprovado" && ( // DESIGN ONLY
          <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <XCircle size={20} className="shrink-0 text-red-500" />
              <p className="text-sm font-semibold text-red-700">Não foi possível aprovar esse valor</p>
            </div>
            <ul className="space-y-1 pl-7">
              {[
                "Tente simular com um valor menor",
                "Mais parcelas aumentam a chance de aprovação",
                "Verifique pendências no seu CPF antes de tentar novamente",
                "Aguarde 7 dias para uma nova análise",
              ].map((t) => (
                <li key={t} className="list-disc text-xs text-red-600">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Seleção de parcelas (pills) ── */}
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Em quantas parcelas?</p>
          <div className={usarGrid ? "grid grid-cols-4 gap-2" : "flex flex-wrap gap-2"}>
            {ofertas.map((oferta) => {
              const sel = ofertaSelecionada?.id === oferta.id;
              return (
                <button
                  key={oferta.id}
                  type="button"
                  onClick={() => setOfertaSelecionada(oferta)}
                  className={`h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    sel
                      ? "border-[#FD5F31] bg-[#FFF3EE] text-[#D94E28]"
                      : "border-border bg-white text-foreground hover:border-[#FD5F31]/40"
                  }`}
                >
                  {oferta.parcelas}x
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Detalhe da oferta selecionada ── */}
        {ofertaSelecionada && (
          <div className="space-y-2.5 rounded-2xl border border-[#FD5F31]/25 bg-[#FFF3EE] p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-muted-foreground">Valor da parcela</p>
              <p className="text-lg font-bold text-[#D94E28]">
                R$ {formatCents(valorParcelaCalc)}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Total a pagar</p>
              <p className="text-sm font-semibold text-foreground">
                R$ {formatCents(totalAPagarCalc)}
              </p>
            </div>
            <div className="h-px bg-[#FD5F31]/15" />
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Juros</p>
              <p className="text-sm text-foreground">
                {(ofertaSelecionada.taxaJuros * 100).toFixed(2).replace(".", ",")}% a.m.
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Juros anual</p>
              <p className="text-sm text-foreground">
                {(ofertaSelecionada.taxaJurosAnual * 100).toFixed(2).replace(".", ",")}% a.a.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CET</span>
              <span className={`text-sm ${ofertaSelecionada.cetAnual !== undefined ? "text-foreground" : "text-muted-foreground"}`}>
                {/* TODO: receber da API — CET não disponível na simulação ainda (P0 Zema) */}
                {ofertaSelecionada.cetAnual !== undefined
                  ? `${(ofertaSelecionada.cetAnual * 100).toFixed(2).replace(".", ",")}% a.a.`
                  : "A calcular"}
              </span>
            </div>
            {ofertaSelecionada.tac > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">TAC</p>
                <p className="text-sm text-foreground">R$ {formatCents(ofertaSelecionada.tac)}</p>
              </div>
            )}
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">IOF</p>
              <p className="text-sm text-foreground">R$ {formatCents(valorIofCalc)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">1º vencimento</p>
              <p className="text-sm text-foreground">{ofertaSelecionada.primeiroVenc}</p>
            </div>
          </div>
        )}

        {/* ── CTA — sticky dentro do container (não full-viewport) ── */}
        <div className="sticky bottom-20 z-40 bg-background pb-4 pt-2 md:bottom-0">
          <button
            type="button"
            disabled={!ofertaSelecionada}
            onClick={() =>
              navigate("/credito-pessoal/revisao", {
                state: {
                  ...locationState,
                  ofertaSelecionada: {
                    ...ofertaSelecionada,
                    valorParcela: valorParcelaCalc, // calculado via Price — TODO: usar valor da API
                    valorIof:     valorIofCalc,     // calculado localmente — TODO: usar valor da API
                  },
                  valorSolicitado: valorAtual, // centavos
                },
              })
            }
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-colors ${
              ofertaSelecionada
                ? "bg-[#FD5F31] hover:bg-[#D94E28]"
                : "cursor-not-allowed bg-[#FD5F31] opacity-40"
            }`}
          >
            Continuar com esta oferta
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </SubPageLayout>
  );
}
