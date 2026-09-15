import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaretDown, CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { TermosModal } from "@/components/TermosModal";

// ---------------------------------------------------------------------------
// Mock (DESIGN ONLY) — TODO: substituir pelos dados reais decodificados do token do link
// ---------------------------------------------------------------------------
const MOCK_LEILAO = {
  valorLiberado: 3253383, // centavos
  parcelas: 48,
  valorParcela: 89120, // centavos
  taxaMensal: 0.0249,
};

const formatCents = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dataExpiracaoExtenso = () => {
  const data = new Date();
  data.setDate(data.getDate() + 7);
  return data.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
};

// Rota: /leilao?token=mock — oferta já aprovada via leilão CLT, usuário autenticado
export default function LeilaoOfertaPage() {
  const navigate = useNavigate();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [termosAbertos, setTermosAbertos] = useState(false);

  const valorReais = MOCK_LEILAO.valorLiberado / 100;
  const taxaMensalPct = MOCK_LEILAO.taxaMensal * 100;
  // TODO: receber IOF/CET reais da API — mesma aproximação usada em ConsignadoCLTRevisaoPage
  const iof = valorReais * 0.0332;
  const cetMensal = (taxaMensalPct + 0.21).toFixed(2);

  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <div className="space-y-4 pb-4 md:mx-auto md:max-w-[560px]">
        {/* Card laranja — oferta aprovada */}
        <div className="rounded-2xl bg-primary p-5 text-white">
          <span className="inline-block rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
            Oferta aprovada
          </span>
          <p className="mt-3 text-3xl font-bold">R$ {formatCents(MOCK_LEILAO.valorLiberado)}</p>
          <p className="mt-1 text-sm text-white/90">
            {MOCK_LEILAO.parcelas}x de R$ {formatCents(MOCK_LEILAO.valorParcela)}
          </p>
          <p className="text-sm text-white/90">Taxa: {taxaMensalPct.toFixed(2)}% a.m.</p>
          <p className="mt-3 text-xs text-white/75">Proposta válida até {dataExpiracaoExtenso()}</p>
        </div>

        {/* Bloco expansível — detalhes (IOF, CET) */}
        <div className="rounded-2xl border border-border bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setDetalhesAbertos((v) => !v)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <p className="text-sm font-semibold text-foreground">Ver detalhes</p>
            <CaretDown size={16} className={`text-muted-foreground transition-transform ${detalhesAbertos ? "rotate-180" : ""}`} />
          </button>
          {detalhesAbertos && (
            <div className="space-y-2 px-4 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">IOF</span>
                <span className="text-xs font-medium text-foreground">R$ {formatCents(Math.round(iof * 100))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">CET estimado</span>
                <span className="text-xs font-medium text-foreground">{cetMensal}% a.m.</span>
              </div>
            </div>
          )}
        </div>

        {/* Nota discreta */}
        <p className="text-xs text-muted-foreground">
          Esta oferta foi gerada com base na sua margem consignável disponível.
        </p>

        {/* Termos de uso */}
        <p className="text-xs text-muted-foreground">
          Ao continuar, você concorda com os{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => setTermosAbertos(true)}>
            Termos de Uso
          </button>
          .
        </p>
      </div>

      {/* CTA fixo no rodapé */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          onClick={() => navigate("/leilao/dados-pendentes")}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
        >
          <CheckCircle size={18} />
          Ver minha oferta
        </button>
      </div>

      <TermosModal aberto={termosAbertos} onFechar={() => setTermosAbertos(false)} />
    </SubPageLayout>
  );
}
