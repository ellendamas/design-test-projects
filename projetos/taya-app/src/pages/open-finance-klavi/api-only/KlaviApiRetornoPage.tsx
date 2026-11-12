import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowSquareOut, Bank as BankIcon, Check, CheckCircle, Prohibit, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { celcoinBrandsMock } from "./celcoinBrandsData";
import { useOpenFinance } from "@/context/OpenFinanceContext";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: ?resultado=sucesso (default) | erro | cancelado; bancoId tem fallback
// "nubank" pra permitir acesso direto por URL. Pela doc da Celcoin, o retorno é um redirect
// de volta pra Pode Já com um código, e aí a gente ainda troca esse código por um token e
// busca os primeiros dados: por isso passa por um estado de "confirmando" antes do resultado,
// mesmo não sendo um evento assíncrono de verdade. Na jornada real (ver useOpenFinanceApiBase),
// o sucesso grava no OpenFinanceContext de verdade; no protótipo de comparação solto, não.
type Resultado = "sucesso" | "erro" | "cancelado";

export default function KlaviApiRetornoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { base, isReal } = useOpenFinanceApiBase();
  const { connectBankById, bancosConectados } = useOpenFinance();
  const [confirmando, setConfirmando] = useState(true);
  const isOnboarding = typeof window !== "undefined" && !!sessionStorage.getItem("onboarding_step");

  const bancoId = (location.state as { bancoId?: string } | null)?.bancoId ?? "nubank"; // DESIGN ONLY
  const bank = celcoinBrandsMock.find((item) => item.brandId === bancoId) ?? celcoinBrandsMock[0];
  const resultado = (searchParams.get("resultado") ?? "sucesso") as Resultado; // DESIGN ONLY

  useEffect(() => {
    const timer = window.setTimeout(() => setConfirmando(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!confirmando && resultado === "sucesso" && isReal) {
      connectBankById(bank.brandId, bank.customerFriendlyName);
    }
  }, [confirmando, resultado, isReal, bank.brandId, bank.customerFriendlyName, connectBankById]);

  const voltarDepois = () => {
    if (isReal) {
      if (typeof window !== "undefined") window.localStorage.setItem("openfinance_pendente", "true");
      navigate(isOnboarding ? "/cadastro" : "/painel");
      return;
    }
    navigate("/prototipos/open-finance-klavi");
  };

  if (confirmando) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          <ArrowSquareOut size={48} />
        </motion.div>
        <h2 className="mt-6 text-2xl font-bold">Confirmando com o {bank.customerFriendlyName}...</h2>
        <p className="mt-2 text-sm text-white/80">Isso pode levar alguns instantes.</p>
      </main>
    );
  }

  if (resultado === "erro") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 pb-28 text-center">
        <WarningCircle size={64} weight="fill" className="text-[#DC2626]" />
        <h2 className="mt-5 text-2xl font-bold text-foreground">Não conseguimos confirmar sua conexão</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Isso pode acontecer quando a autorização não foi concluída no {bank.customerFriendlyName}. Nenhum
          dado foi compartilhado.
        </p>
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3">
          <div className="mx-auto w-full max-w-[640px] space-y-2">
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
              onClick={() => navigate(`${base}/transicao-banco`, { state: { bancoId } })}
            >
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-border"
              onClick={voltarDepois}
            >
              Fazer isso depois
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (resultado === "cancelado") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 pb-28 text-center">
        <Prohibit size={64} weight="fill" className="text-muted-foreground" />
        <h2 className="mt-5 text-2xl font-bold text-foreground">Você cancelou a conexão</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum dado foi compartilhado. Você pode tentar novamente quando quiser.
        </p>
        <div className="fixed bottom-0 left-0 right-0 px-4 py-3">
          <div className="mx-auto w-full max-w-[640px] space-y-2">
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
              onClick={() => navigate(`${base}/transicao-banco`, { state: { bancoId } })}
            >
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-border"
              onClick={voltarDepois}
            >
              Fazer isso depois
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 pb-28 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease: "backOut" }}>
        <CheckCircle size={64} weight="fill" className="text-[#16A34A]" />
      </motion.div>
      <h2 className="mt-5 text-2xl font-bold text-foreground">Banco conectado!</h2>
      <p className="mt-2 text-sm text-muted-foreground">Estamos buscando seus dados financeiros...</p>

      <motion.div
        className="mt-6 flex flex-col items-start gap-2"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.6 } } }}
      >
        {["Transações importadas", "Categorias identificadas", "Primeiro insight gerado"].map((item) => (
          <motion.div
            key={item}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            className="flex items-center gap-2"
          >
            <Check size={16} className="text-[#16A34A]" />
            <p className="text-sm text-foreground">{item}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-5 w-full rounded-xl border border-[#E5E7EB] bg-white p-3 text-left">
        <div className="flex items-center gap-2">
          {bank.customerFriendlyLogoUri ? (
            <img src={bank.customerFriendlyLogoUri} alt="" className="h-8 w-8 rounded-full object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <BankIcon size={16} />
            </div>
          )}
          <p className="text-sm font-semibold text-foreground">{bank.customerFriendlyName}</p>
          {isReal && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {bancosConectados.length} {bancosConectados.length === 1 ? "banco conectado" : "bancos conectados"}
            </span>
          )}
          <CheckCircle size={18} weight="fill" className="ml-auto text-[#16A34A]" />
        </div>
      </div>

      <p className="mt-3 w-full text-xs text-muted-foreground">
        Você só faz isso uma vez por banco. Nas próximas vezes, tudo acontece aqui mesmo, sem sair do app.
      </p>

      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed bottom-0 left-0 right-0 px-4 py-3">
          <div className="mx-auto w-full max-w-[640px]">
            {isReal ? (
              <>
                <Button
                  className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
                  onClick={() => navigate(`${base}/selecionar-instituicao`)}
                >
                  Conectar outro banco
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 h-12 w-full rounded-xl border-border"
                  onClick={() => navigate(isOnboarding ? "/cadastro" : "/painel")}
                >
                  Ir para o início <ArrowRight size={16} className="ml-2" />
                </Button>
              </>
            ) : (
              <Button
                className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
                onClick={() => navigate("/prototipos/open-finance-klavi")}
              >
                Ir para o início <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
