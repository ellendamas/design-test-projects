import { useEffect } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";

// Mesmo padrão usado em OpenFinanceConnectingPage.tsx (branch merge/openfinance-integration)
// para o redirecionamento ao banco durante a conexão de Open Finance.

type ProvedorId = "bull" | "c6" | "v8" | "parana";

const NOMES_PROVEDORES: Record<ProvedorId, string> = {
  bull: "Bull",
  c6: "C6 Bank",
  v8: "V8",
  parana: "Paraná Banco",
};

export default function ConsignadoCLTRedirecionandoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { provedor } = useParams<{ provedor: string }>();
  const provedorValido = provedor && provedor in NOMES_PROVEDORES ? (provedor as ProvedorId) : null;

  const { consentUrl } = (location.state as { consentUrl?: string } | null) ?? {};

  useEffect(() => {
    if (!provedorValido) return;
    const timer = window.setTimeout(() => {
      // TODO: substituir window.open por fluxo real quando API disponível
      if (consentUrl) {
        window.open(consentUrl, "_blank");
      }
      navigate("/consignado-clt/provedores", {
        replace: true,
        state: { provedorConsultado: provedorValido, status: "aguardando" },
      });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [provedorValido, consentUrl, navigate]);

  if (!provedorValido) {
    return <Navigate to="/consignado-clt/provedores" replace />;
  }

  const nome = NOMES_PROVEDORES[provedorValido];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowSquareOut size={48} />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold">Abrindo o {nome}...</h2>
      <p className="mt-2 text-sm text-white/80">
        Você volta aqui automaticamente após concluir a verificação.
      </p>
    </main>
  );
}
