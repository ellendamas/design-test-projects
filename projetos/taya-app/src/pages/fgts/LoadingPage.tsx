import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout } from "@/App";

const stages = [
  { id: "auth", label: "Autorização verificada" },
  { id: "balance", label: "Consultando saldo na Caixa" },
  { id: "offer", label: "Calculando sua oferta" },
];

export default function FGTSLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeStage, setActiveStage] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // DESIGN ONLY — ?resultado=sem-saldo → redireciona para tela negativa
  // TODO: substituir por polling real da API BMP
  const resultado = searchParams.get("resultado");
  useEffect(() => {
    if (resultado === "sem-saldo") {
      navigate("/fgts/sem-saldo", { replace: true });
    }
  }, [resultado, navigate]);

  useEffect(() => {
    // TODO: substituir por polling real da API BMP
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => setActiveStage(1), 3000),
      setTimeout(() => setActiveStage(2), 6000),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setTimedOut(true), 30000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SubPageLayout title="">
      <div className="space-y-4 pb-24">

        {/* Bloco — identidade e status */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8590A]">
              <span className="text-2xl font-bold text-white">s.</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-foreground">
                Consultando seu saldo do FGTS
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Estamos acessando seus dados na Caixa Econômica Federal. Isso leva alguns segundos.
              </p>
            </div>
            <div
              className="w-full overflow-hidden rounded-full bg-muted"
              style={{ height: "4px" }}
              role="status"
              aria-label="Consultando saldo FGTS"
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
                Está demorando mais que o esperado. Você pode tentar novamente
                ou voltar depois — sua autorização continua válida.
              </p>
              <button
                type="button"
                onClick={() => navigate("/fgts/loading", { replace: true })}
                className="flex h-12 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-medium text-[#E8590A] transition-colors hover:bg-orange-50"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => navigate("/painel")}
                className="py-2 text-center text-sm text-muted-foreground"
              >
                Voltar para o início
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/fgts/saldo-disponivel")} // TODO: trocar por polling real da API BMP
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
