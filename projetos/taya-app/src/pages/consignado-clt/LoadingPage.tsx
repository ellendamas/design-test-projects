import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout } from "@/App";

const stages = [
  { id: "started", label: "Consulta iniciada" },
  { id: "margin", label: "Verificando margem disponível" },
  { id: "offer", label: "Calculando melhor oferta" },
];

export default function ConsignadoCLTLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStage, setActiveStage] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // DESIGN ONLY — simular retorno negativo do leilão via query param
  // URL de teste: /consignado-clt/loading?resultado=negativo
  // TODO: substituir por lógica real da API
  const semOferta = searchParams.get("resultado") === "negativo";
  useEffect(() => {
    if (semOferta) {
      navigate("/consignado-clt/sem-oferta", { replace: true });
    }
  }, [semOferta, navigate]);

  useEffect(() => {
    // TODO: substituir setTimeout mock por polling real da API
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => setActiveStage(1), 3000),
      setTimeout(() => setActiveStage(2), 6000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    // Timeout de 30s — se API não retornar, mostrar opção de saída
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 30000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SubPageLayout title="Consultando oferta" hideNav>
      <div className="space-y-4 pb-24">

        {/* Bloco — identidade e status */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 text-center">
            {/* Logo seutudo. */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8590A]">
              <span className="text-2xl font-bold text-white">s.</span>
            </div>

            {/* Título e subtítulo */}
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-foreground">
                Buscando sua melhor oferta
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Estamos consultando várias instituições ao mesmo tempo para encontrar a taxa mais
                baixa para você.
              </p>
            </div>

            {/* Progress bar animada (Framer Motion) */}
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

        {/* Bloco — etapas da consulta */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Etapas da consulta</p>
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isDone = index < activeStage;
              const isActive = index === activeStage;

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

        {/* CTA — condicional por timeout */}
        <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
          {timedOut ? (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-muted-foreground">
                Está demorando mais que o esperado. Você pode aguardar ou voltar depois — sua consulta continua em andamento.
              </p>
              <button
                type="button"
                onClick={() => navigate("/painel")}
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-medium text-[#E8590A] transition-colors hover:bg-orange-50"
              >
                Voltar para o início
              </button>
              <button
                type="button"
                onClick={() => navigate("/consignado-clt/aguardando")}
                className="py-2 text-center text-sm text-muted-foreground"
              >
                Aguardar aqui
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/consignado-clt/aguardando")}
              className="flex h-12 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-medium text-[#E8590A] transition-colors hover:bg-orange-50"
            >
              Aguardar e receber notificação
            </button>
          )}
        </div>

      </div>
    </SubPageLayout>
  );
}
