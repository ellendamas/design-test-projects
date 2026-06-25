import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, CaretDown, CaretUp, Check } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EnderecoData = {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

type CreditoPessoalState = {
  dadosConta: { cpf: string; nome: string };
  emailLocal: string;
  celularLocal: string;
  dataNasc: string;
  faixaRenda: string;
  endereco: EnderecoData;
  valorMinimo: number;
  valorMaximo: number;
  ofertaSelecionada: {
    id: string;
    parcelas: number;
    valorParcela: number;     // centavos
    taxaJuros: number;        // ex: 0.0249
    taxaJurosAnual: number;   // ex: 0.3433
    tac: number;              // centavos
    valorIof: number;         // centavos
    primeiroVenc: string;     // "DD/MM/AAAA"
  };
  valorSolicitado: number;    // centavos
};

// ---------------------------------------------------------------------------
// DESIGN ONLY — mock state para acesso direto via URL de design
// ---------------------------------------------------------------------------
const MOCK_STATE: CreditoPessoalState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" },
  valorMinimo: 50000,
  valorMaximo: 500000,
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" },
  valorSolicitado: 275000,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalRevisao() {
  const navigate = useNavigate();
  const location = useLocation();

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState = (location.state as CreditoPessoalState | null) ?? MOCK_STATE; // DESIGN ONLY
  const st = locationState;

  const { parcelas, valorParcela, taxaJuros, taxaJurosAnual, tac, valorIof, primeiroVenc } =
    st.ofertaSelecionada;

  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [aceito, setAceito] = useState(false);

  return (
    <SubPageLayout title="Revisão da oferta" hideNav>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[560px]">

        {/* ── Card destaque (laranja) ── */}
        <div className="rounded-2xl bg-[#FEF0E7] p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Você vai receber</p>
          <p className="text-3xl font-bold text-[#E8590A]">R$ {formatCents(st.valorSolicitado)}</p>
          <p className="text-base text-foreground font-medium">
            {parcelas}x de R$ {formatCents(valorParcela)}
          </p>
          <p className="text-sm text-muted-foreground">1º vencimento: {primeiroVenc}</p>
        </div>

        {/* ── Botão toggle detalhes ── */}
        <button
          type="button"
          onClick={() => setDetalhesAbertos((v) => !v)}
          className="flex items-center gap-1 text-sm text-[#E8590A] font-medium"
        >
          {detalhesAbertos ? <CaretUp size={14} /> : <CaretDown size={14} />}
          {detalhesAbertos ? "Ocultar detalhes" : "Ver detalhes"}
        </button>

        {/* ── Bloco de detalhes expansível ── */}
        {detalhesAbertos && (
          <div className="space-y-2.5 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Juros</p>
              <p className="text-sm">{(taxaJuros * 100).toFixed(2).replace(".", ",")}% a.m.</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Juros anual</p>
              <p className="text-sm">{(taxaJurosAnual * 100).toFixed(2).replace(".", ",")}% a.a.</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">IOF</p>
              <p className="text-sm">R$ {formatCents(valorIof)}</p>
            </div>
            {tac > 0 && (
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">TAC</p>
                <p className="text-sm">R$ {formatCents(tac)}</p>
              </div>
            )}
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <p className="text-sm font-medium text-foreground">Total a pagar</p>
              <p className="text-sm font-semibold text-foreground">
                R$ {formatCents(valorParcela * parcelas)}
              </p>
            </div>
          </div>
        )}

        {/* ── Checkbox de consentimento (padrão RevisaoPage do CLT) ── */}
        <button
          type="button"
          onClick={() => setAceito((v) => !v)}
          className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
            aceito
              ? "border-[#E8590A] bg-[#FEF0E7]"
              : "border-border bg-white hover:border-[#E8590A]/40"
          }`}
        >
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
              aceito ? "border-[#E8590A] bg-[#E8590A]" : "border-border bg-white"
            }`}
          >
            {aceito && <Check size={12} weight="bold" className="text-white" />}
          </div>
          <span className="text-sm leading-relaxed text-foreground">
            Li e concordo com as condições desta proposta
          </span>
        </button>

        {/* ── CTA sticky ── */}
        <div className="sticky bottom-20 z-40 bg-background pb-4 pt-2 md:bottom-0">
          <button
            type="button"
            disabled={!aceito}
            onClick={() => navigate("/credito-pessoal/dados-tomador", { state: locationState })}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-colors ${
              aceito ? "bg-[#E8590A] hover:bg-[#A33D05]" : "cursor-not-allowed bg-[#E8590A] opacity-40"
            }`}
          >
            Prosseguir para meus dados
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
