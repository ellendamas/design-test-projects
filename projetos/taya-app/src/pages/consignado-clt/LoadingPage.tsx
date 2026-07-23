import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, DeviceMobileSpeaker, XCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Logo } from "@/components/Logo";

// ---------------------------------------------------------------------------
// Provedores
// ---------------------------------------------------------------------------
type ProvedorId = "bull" | "c6" | "v8";
type StatusProvedor = "consultando" | "oferta" | "sem_oferta" | "aguardando_externo";

const PROVEDORES_IDS: ProvedorId[] = ["bull", "c6", "v8"];

const NOMES_PROVEDORES: Record<ProvedorId, string> = {
  bull: "Bull",
  c6: "C6 Bank",
  v8: "V8",
};

// Mock de estados para design testing — TODO: substituir por polling real
const MOCK_TIMELINE: { delay: number; updates: Partial<Record<ProvedorId, StatusProvedor>> }[] = [
  { delay: 1500, updates: { bull: "consultando", v8: "consultando" } },
  { delay: 3000, updates: { bull: "oferta" } },
  { delay: 4500, updates: { v8: "sem_oferta" } },
  { delay: 5500, updates: { c6: "aguardando_externo" } },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTLoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<Partial<Record<ProvedorId, StatusProvedor>>>({});
  const [timedOut, setTimedOut] = useState(false);

  // DESIGN ONLY — simular resultado da consulta via query param
  // URLs de teste: /consignado-clt/loading?resultado=negativo|nenhuma|uma|multiplas
  // TODO: substituir por lógica real da API
  const resultado = searchParams.get("resultado") ?? "multiplas";
  const semOferta = resultado === "negativo" || resultado === "nenhuma";
  const qtd = resultado === "uma" ? 1 : 3; // multiplas (default) = 3

  useEffect(() => {
    if (semOferta) {
      navigate("/consignado-clt/sem-oferta", { replace: true });
    }
  }, [semOferta, navigate]);

  useEffect(() => {
    if (semOferta) return;
    // TODO: substituir MOCK_TIMELINE por polling real da API (status por provedor)
    const timers = MOCK_TIMELINE.map(({ delay, updates }) =>
      setTimeout(() => setStatus((prev) => ({ ...prev, ...updates })), delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [semOferta]);

  useEffect(() => {
    if (semOferta) return;
    // Timeout de 60s — se nem todos os provedores responderem, mostrar opção de saída
    const timeout = setTimeout(() => setTimedOut(true), 60000);
    return () => clearTimeout(timeout);
  }, [semOferta]);

  // Navegação automática quando todos os provedores mock já responderam
  useEffect(() => {
    if (semOferta) return;
    const todosResponderam = PROVEDORES_IDS.every((id) => Boolean(status[id]));
    if (!todosResponderam) return;
    const timer = setTimeout(() => {
      navigate(`/consignado-clt/ofertas?qtd=${qtd}`, { replace: true });
    }, 800);
    return () => clearTimeout(timer);
  }, [status, semOferta, qtd, navigate]);

  const handleVerDisponiveis = () => {
    navigate(`/consignado-clt/ofertas?qtd=${qtd}`);
  };

  return (
    <SubPageLayout title="Consultando oferta" hideNav>
      <div className="space-y-4 pb-24">

        {/* Bloco — identidade e status */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FD5F31]">
              <Logo variant="white" size="sm" />
            </div>
            <div className="mt-2 space-y-1">
              <h1 className="text-lg font-semibold text-foreground">
                Consultando sua margem...
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Buscando as melhores condições para você.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco — status por parceiro */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-foreground">Status por parceiro</p>
          <div className="space-y-4">
            {PROVEDORES_IDS.map((id) => {
              const nome = NOMES_PROVEDORES[id];
              const s = status[id];

              if (s === "oferta") {
                return (
                  <div key={id} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-600" weight="fill" />
                    <span className="text-sm text-foreground">{nome} encontrou uma oferta</span>
                  </div>
                );
              }
              if (s === "sem_oferta") {
                return (
                  <div key={id} className="flex items-center gap-3">
                    <XCircle size={18} className="text-muted-foreground" weight="fill" />
                    <span className="text-sm text-muted-foreground">{nome} não encontrou oferta no momento</span>
                  </div>
                );
              }
              if (s === "aguardando_externo") {
                return (
                  <div key={id} className="flex items-center gap-3">
                    <DeviceMobileSpeaker size={18} className="text-amber-600" />
                    <span className="text-sm text-foreground">Aguardando verificação do {nome}</span>
                  </div>
                );
              }
              // consultando (ou ainda sem status inicial)
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FD5F31] border-t-transparent" />
                  <span className="text-sm text-foreground">Aguardando {nome}...</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA — exibido apenas após timeout de 60s */}
        {timedOut && (
          <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
            <button
              type="button"
              onClick={handleVerDisponiveis}
              className="flex h-12 w-full items-center justify-center rounded-full border border-[#FD5F31] text-sm font-medium text-[#FD5F31] transition-colors hover:bg-orange-50"
            >
              Ver ofertas disponíveis até agora
            </button>
          </div>
        )}

      </div>
    </SubPageLayout>
  );
}
