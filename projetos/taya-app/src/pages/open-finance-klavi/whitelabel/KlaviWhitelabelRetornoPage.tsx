import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowSquareOut, Check, CheckCircle, Prohibit, WarningCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// DESIGN ONLY: ?resultado=sucesso (default) | erro | cancelado
// Simula o evento assíncrono que a Klavi manda por webhook depois que o usuário termina
// (ou abandona) o fluxo do lado dela. Por isso a tela sempre passa por um estado de
// "confirmando" antes do resultado: a confirmação nunca é instantânea nesse modelo.
type Resultado = "sucesso" | "erro" | "cancelado";

export default function KlaviWhitelabelRetornoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [confirmando, setConfirmando] = useState(true);

  const resultado = (searchParams.get("resultado") ?? "sucesso") as Resultado; // DESIGN ONLY

  useEffect(() => {
    const timer = window.setTimeout(() => setConfirmando(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  if (confirmando) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
          <ArrowSquareOut size={48} />
        </motion.div>
        <h2 className="mt-6 text-2xl font-bold">Confirmando com o seu banco...</h2>
        <p className="mt-2 text-sm text-white/80">Isso pode levar alguns instantes.</p>
      </main>
    );
  }

  if (resultado === "erro") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <WarningCircle size={64} weight="fill" className="text-[#DC2626]" />
        <h2 className="mt-5 text-2xl font-bold text-foreground">Não conseguimos confirmar sua conexão</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Isso pode acontecer quando a autorização não foi concluída no banco. Nenhum dado foi
          compartilhado.
        </p>
        <div className="mt-6 w-full space-y-2">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/prototipos/open-finance-klavi/whitelabel/transicao")}
          >
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border"
            onClick={() => navigate("/prototipos/open-finance-klavi")}
          >
            Fazer isso depois
          </Button>
        </div>
      </main>
    );
  }

  if (resultado === "cancelado") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center px-6 text-center">
        <Prohibit size={64} weight="fill" className="text-muted-foreground" />
        <h2 className="mt-5 text-2xl font-bold text-foreground">Você cancelou a conexão</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum dado foi compartilhado. Você pode tentar novamente quando quiser.
        </p>
        <div className="mt-6 w-full space-y-2">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/prototipos/open-finance-klavi/whitelabel/transicao")}
          >
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-border"
            onClick={() => navigate("/prototipos/open-finance-klavi")}
          >
            Fazer isso depois
          </Button>
        </div>
      </main>
    );
  }

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

      <Card className="mt-5 w-full border-0 bg-primary-light">
        <CardContent className="p-3 text-left">
          <p className="text-xs text-primary-dark">
            Você só faz isso uma vez por banco. Nas próximas vezes, tudo acontece aqui mesmo, sem sair do
            app.
          </p>
        </CardContent>
      </Card>

      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/prototipos/open-finance-klavi")}
          >
            Ir para o início <ArrowRight size={16} className="ml-2" />
          </Button>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
