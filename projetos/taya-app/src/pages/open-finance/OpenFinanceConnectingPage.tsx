import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { openFinanceBanks, type OpenFinanceBankId } from "./openFinanceData";

export default function OpenFinanceConnectingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bankId = (location.state as { bancoId?: OpenFinanceBankId } | null)?.bancoId ?? "nubank";
  const bank = openFinanceBanks.find((item) => item.id === bankId) ?? openFinanceBanks[0];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/cadastro/conectado", { state: { bancoId: bank.id } });
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [bank.id, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center text-white">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowSquareOut size={48} />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold">Abrindo o {bank.name}...</h2>
      <p className="mt-2 text-sm text-white/80">Você volta aqui automaticamente após autorizar.</p>
    </main>
  );
}
