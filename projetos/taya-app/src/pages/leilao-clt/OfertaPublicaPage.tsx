import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretDown, Check, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { TermosModal } from "@/components/TermosModal";
import { cn } from "@/lib/utils";
import { OFERTA_LEILAO } from "./leilaoData";

// ---------------------------------------------------------------------------
// Helpers — mesmos de LeilaoOfertaPage.tsx (jornada com conta)
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

// Rota: /leilao/oferta?token=mock (DESIGN ONLY — simula recebimento do link, sem login).
// Mesmo conteúdo de LeilaoOfertaPage.tsx (jornada com conta), com o header e os CTAs da
// jornada pública (PublicLayout + Aceitar oferta / Já tenho conta).
export default function LeilaoOfertaPublicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termoAceito, setTermoAceito] = useState(false);
  const [termosAbertos, setTermosAbertos] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  const { valor, parcelas: prazo, valorParcela, taxaMensal } = OFERTA_LEILAO;
  const provedor = "Celcoin";

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
    <PublicLayout>
      <div className="space-y-4">

        {/* Cabeçalho de sucesso — igual a LeilaoOfertaPage.tsx (jornada com conta) */}
        <div className="flex flex-col items-center gap-3 px-2 pb-1 pt-2 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle size={40} className="text-green-600" weight="fill" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Oferta aprovada</h1>
          </div>
        </div>

        {/* Bloco de parceria Pode Já × Celcoin — o leilão acontece dentro da Carteira de
            Trabalho Digital sob o nome Celcoin (instituição parceira regulamentada); ao abrir
            o link, o usuário passa a ver a identidade da Pode Já. Este box existe pra explicar
            essa troca de nome antes que ela gere estranhamento. */}
        <div className="rounded-2xl border border-border bg-white p-3">
          <div className="flex flex-col items-center gap-3 text-center">
            <img
              src="/images/logo-celcoin.svg"
              alt="Celcoin"
              className="h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <p className="text-xs font-medium text-muted-foreground">Parceiro oficial</p>
            <p className="text-xs text-muted-foreground leading-relaxed w-full">
              A Celcoin é parceira oficial do leilão de crédito consignado dentro da Carteira de Trabalho Digital. Quem cuida da sua contratação a partir de agora é a Pode Já, plataforma digital que conecta você a diversas soluções financeiras.
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

        {/* Bloco 2 — Detalhes do consignado (bg laranja), em accordion pra reduzir a
            quantidade de informação já visível nesta tela — mesmo padrão de accordion de
            consignado-clt/SimuladorPage.tsx, copy inalterado. */}
        <div className="rounded-2xl bg-[#FFF3EE] p-4">
          <button
            type="button"
            onClick={() => setDetalhesAbertos((p) => !p)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-[#D94E28]">Detalhes do consignado</span>
            <CaretDown
              size={16}
              className={cn("text-[#D94E28] transition-transform", detalhesAbertos && "rotate-180")}
            />
          </button>

          {detalhesAbertos && (
            <div className="mt-3 space-y-2">
              {linhasDetalhes.map((linha) => (
                <div key={linha.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#D94E28]/70">{linha.label}</span>
                  <span className="text-xs font-medium text-[#D94E28]">{linha.value}</span>
                </div>
              ))}
            </div>
          )}
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

        {/* CTAs — no fluxo do conteúdo (não fixos), já que a tela tem bastante texto para
            ler e um rodapé fixo cobriria parte dele durante o scroll */}
        <div className="space-y-2 pt-2">
          <Button
            className="h-14 w-full rounded-full"
            disabled={!termoAceito}
            onClick={() => navigate(`/leilao/dados${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)}
          >
            Aceitar oferta
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={() => navigate("/acesso?redirect=/leilao/oferta")}
          >
            Já tenho conta
          </Button>
          <p className="pt-1 text-center text-xs leading-relaxed text-muted-foreground">
            Ao continuar, você aceita os{" "}
            <button type="button" className="underline underline-offset-2" onClick={() => setTermosAbertos(true)}>
              Termos de Uso
            </button>{" "}
            e a{" "}
            <button type="button" className="underline underline-offset-2" onClick={() => setTermosAbertos(true)}>
              Política de Privacidade
            </button>{" "}
            do Pode Já.
          </p>
        </div>

      </div>
      <TermosModal aberto={termosAbertos} onFechar={() => setTermosAbertos(false)} />
    </PublicLayout>
  );
}
