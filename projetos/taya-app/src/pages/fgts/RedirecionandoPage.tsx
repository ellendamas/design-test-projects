import { useEffect, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";

// Mesmo padrão visual de ConsignadoCLTRedirecionandoPage.tsx (redirecionamento a parceiro externo)
// TODO: substituir pela URL real de auto contratação da Lótus+ quando disponível
const LOTUS_AUTOCONTRATACAO_URL = "https://lotus.com.br/autocontratacao";

export default function FGTSRedirecionandoPage() {
  const [mostrarBotao, setMostrarBotao] = useState(false);

  useEffect(() => {
    const abrirTimer = window.setTimeout(() => {
      window.open(LOTUS_AUTOCONTRATACAO_URL, "_blank");
    }, 3000);
    // Fallback — caso o navegador bloqueie o popup ou o redirecionamento automático falhe
    const botaoTimer = window.setTimeout(() => setMostrarBotao(true), 10000);
    return () => {
      window.clearTimeout(abrirTimer);
      window.clearTimeout(botaoTimer);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowSquareOut size={48} />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold">Abrindo a Lótus+</h2>
      <p className="mt-2 text-sm text-white/80">
        Você será direcionado para a contratação no nosso parceiro.
      </p>
      {mostrarBotao && (
        <button
          type="button"
          onClick={() => window.open(LOTUS_AUTOCONTRATACAO_URL, "_blank")}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#FD5F31]"
        >
          Abrir contratação na Lótus+
        </button>
      )}
    </main>
  );
}
