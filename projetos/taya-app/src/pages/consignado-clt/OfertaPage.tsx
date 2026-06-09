import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CurrencyCircleDollar,
  ArrowRight,
  Check,
  Receipt,
  CalendarBlank,
  Coins,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout } from "@/App";
import { cn } from "@/lib/utils";

// TODO: receber valor real da API do leilão
const LIMITE_DISPONIVEL_MOCK = 32533.83;

// TODO: receber dados reais do contrato da API
const CONTRATO_MOCK = {
  parcela: 533.65,
  proximoVencimento: "25/07/2026",
  diasParaVencimento: 17,
  totalContratado: 19211.4,
  parcelasRestantes: 36,
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type DashboardEstado = "consultando" | "oferta" | "contrato";

const stages = [
  { id: "started", label: "Consulta iniciada" },
  { id: "margin", label: "Verificando margem disponível" },
  { id: "offer", label: "Calculando melhor oferta" },
];

export default function ConsignadoCLTOfertaPage() {
  const navigate = useNavigate();
  // DESIGN ONLY — estado controlado por query param (?estado=consultando|oferta|contrato)
  // TODO: substituir por estado real da API antes do deploy
  const [searchParams] = useSearchParams();
  const estadoParam = searchParams.get("estado") as DashboardEstado | null;
  const [estado, setEstado] = useState<DashboardEstado>(estadoParam ?? "oferta");

  return (
    <SubPageLayout title="Consignado CLT">
      <div className="space-y-4 pb-24">

        {/* Seletor de estado — visível apenas em DEV */}
        {import.meta.env.DEV && (
          <div className="flex gap-2 p-4">
            {(["consultando", "oferta", "contrato"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setEstado(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs border",
                  estado === s
                    ? "bg-[#E8590A] text-white border-[#E8590A]"
                    : "border-border text-muted-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── Estado: consultando ────────────────────────────────────────── */}
        {estado === "consultando" && (
          <>
            {/* Bloco — identidade e progress */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8590A]">
                  <span className="text-2xl font-bold text-white">s.</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-lg font-semibold text-foreground">
                    Buscando sua melhor oferta
                  </h1>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Estamos consultando várias instituições ao mesmo tempo para encontrar a taxa
                    mais baixa para você.
                  </p>
                </div>
                <div
                  className="w-full overflow-hidden rounded-full bg-muted"
                  style={{ height: "4px" }}
                  role="status"
                  aria-label="Consultando ofertas"
                >
                  <motion.div
                    className="h-full rounded-full bg-[#E8590A]"
                    style={{ width: "40%" }}
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Bloco — etapas */}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-foreground">Etapas da consulta</p>
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const isDone = index < 1; // etapa 0 concluída no mock
                  const isActive = index === 1; // etapa 1 ativa no mock
                  return (
                    <div key={stage.id} className="flex items-center gap-3">
                      <motion.div
                        className={
                          isDone
                            ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700"
                            : isActive
                              ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#E8590A]"
                              : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted"
                        }
                        animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={
                          isActive
                            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                            : {}
                        }
                      >
                        {isDone ? (
                          <Check size={12} weight="bold" />
                        ) : isActive ? (
                          <div className="h-2 w-2 rounded-full bg-[#E8590A]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </motion.div>
                      <div className="flex flex-col">
                        <span
                          className={
                            isDone || isActive
                              ? "text-sm text-foreground"
                              : "text-sm text-muted-foreground"
                          }
                        >
                          {stage.label}
                        </span>
                        {isActive && (
                          <span className="text-xs font-medium text-[#E8590A]">Em andamento</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA secundário */}
            <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
              <button
                type="button"
                onClick={() => navigate("/consignado-clt/aguardando")}
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-medium text-[#E8590A] transition-colors hover:bg-orange-50"
              >
                Aguardar e receber notificação
              </button>
            </div>
          </>
        )}

        {/* ── Estado: oferta ────────────────────────────────────────────── */}
        {estado === "oferta" && (
          <>
            {/* Bloco — limite disponível em destaque */}
            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Limite disponível de até
              </p>
              <p className="mt-1 text-4xl font-bold text-foreground">
                R$ {formatCurrency(LIMITE_DISPONIVEL_MOCK)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Atualizado em hoje</p>
            </div>

            {/* Bloco — ações disponíveis */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground">Disponível para você</p>

              {/* Card de ação — Novo Empréstimo */}
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                    <CurrencyCircleDollar size={20} className="text-[#E8590A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">Novo Empréstimo</p>
                    <p className="text-sm text-[#E8590A]">
                      Receba até R$ {formatCurrency(LIMITE_DISPONIVEL_MOCK)}
                    </p>
                  </div>
                </div>

                <div className="my-3 border-t border-border" />

                <button
                  type="button"
                  onClick={() => navigate("/consignado-clt/simular")}
                  className="flex items-center gap-1 text-sm font-semibold text-[#E8590A] transition-colors hover:text-[#d04e08]"
                >
                  Simular agora
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* TODO V1: adicionar cards de Portabilidade e Refinanciamento aqui */}
            </div>
          </>
        )}

        {/* ── Estado: contrato ──────────────────────────────────────────── */}
        {estado === "contrato" && (
          <>
            {/* Bloco — contrato ativo em destaque */}
            <div className="rounded-2xl bg-[#FEF0E7] p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-[#A33D05]/70">
                Contrato ativo
              </p>
              <p className="mt-1 text-4xl font-bold text-[#A33D05]">
                R$ {formatCurrency(CONTRATO_MOCK.parcela)}
                <span className="text-lg font-medium">/mês</span>
              </p>
              <p className="mt-1 text-xs text-[#A33D05]/70">
                {CONTRATO_MOCK.parcelasRestantes}x parcelas · Crédito consignado CLT
              </p>
            </div>

            {/* Bloco — detalhes do contrato */}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-foreground">Resumo do contrato</p>
              <div className="space-y-3">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                    <CalendarBlank size={18} className="text-[#E8590A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Próximo vencimento</p>
                    <p className="text-sm font-semibold text-foreground">
                      {CONTRATO_MOCK.proximoVencimento}
                      <span className="ml-1 text-xs font-normal text-[#E8590A]">
                        em {CONTRATO_MOCK.diasParaVencimento} dias
                      </span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                    <Coins size={18} className="text-[#E8590A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor total contratado</p>
                    <p className="text-sm font-semibold text-foreground">
                      R$ {formatCurrency(CONTRATO_MOCK.totalContratado)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border" />

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                    <Receipt size={18} className="text-[#E8590A]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Parcelas</p>
                    <p className="text-sm font-semibold text-foreground">
                      {CONTRATO_MOCK.parcelasRestantes}x de R${" "}
                      {formatCurrency(CONTRATO_MOCK.parcela)}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* CTA primário */}
            <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
              <button
                type="button"
                onClick={() => navigate("/contratos")}
                className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
              >
                Ver contrato completo
              </button>
            </div>
          </>
        )}

      </div>
    </SubPageLayout>
  );
}
