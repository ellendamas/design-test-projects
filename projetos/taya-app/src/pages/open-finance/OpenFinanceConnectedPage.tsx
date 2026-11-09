import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Check, CheckCircle, Info } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { openFinanceBanks, type OpenFinanceBankId } from "./openFinanceData";

export default function OpenFinanceConnectedPage() {
  const navigate = useNavigate();
  const isOnboarding = typeof window !== "undefined" && !!sessionStorage.getItem("onboarding_step");
  const location = useLocation();
  const { bancosConectados, connectBankById } = useOpenFinance();
  const [showCta, setShowCta] = useState(false);

  const bankId = (location.state as { bancoId?: OpenFinanceBankId } | null)?.bancoId ?? "nubank";
  const bank = openFinanceBanks.find((item) => item.id === bankId) ?? openFinanceBanks[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setShowCta(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    connectBankById(bank.id);
  }, [bank.id, connectBankById]);

  const totalConnected = bancosConectados.length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease: "backOut" }}>
        <CheckCircle size={64} weight="fill" className="text-[#16A34A]" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-bold text-foreground">Banco conectado!</h2>
      <p className="mt-2 text-sm text-muted-foreground">Estamos buscando seus dados financeiros...</p>

      <motion.div
        className="mt-6 w-full space-y-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.6 } } }}
      >
        {["Transações importadas", "Categorias identificadas", "Primeiro insight gerado"].map((item) => (
          <motion.div
            key={item}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2"
          >
            <Check size={16} className="text-[#16A34A]" />
            <p className="text-sm text-foreground">{item}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-5 w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: bank.color }}
            >
              {bank.initials}
            </div>
            <p className="text-sm font-semibold text-foreground">{bank.name}</p>
          </div>
          <CheckCircle size={18} weight="fill" className="text-[#16A34A]" />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {totalConnected} {totalConnected === 1 ? "banco conectado" : "bancos conectados"}
        </p>
      </div>

      <Card className="mt-3 w-full border-0 bg-primary-light">
        <CardContent className="flex items-start gap-2 p-3 text-left">
          <Info size={16} className="mt-0.5 text-primary" />
          <p className="text-xs text-primary-dark">
            Você só faz isso uma vez por banco. Nas próximas vezes, tudo acontece aqui mesmo, sem sair do app.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showCta && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full">
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
              onClick={() => navigate("/cadastro/selecionar-banco", { state: { modo: "adicionar" } })}
            >
              Conectar outro banco
            </Button>
            <Button
              variant="outline"
              className="mt-2 h-12 w-full rounded-xl border-border"
              onClick={() => navigate(isOnboarding ? "/cadastro" : "/painel", isOnboarding ? { state: { step: 5 } } : undefined)}
            >
              Ir para o início <ArrowRight size={16} className="ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
