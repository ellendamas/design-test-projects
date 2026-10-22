import { useEffect, useState } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";

// Mesmo padrão de redirecionamento a parceiro externo usado em fgts/RedirecionandoPage.tsx e
// consignado-clt/RedirecionandoPage.tsx: abre numa aba nova (o navegador decide se isso abre o
// app instalado ou o site, conforme o dispositivo — não é algo que o front controla de verdade),
// com botão de fallback caso o popup seja bloqueado.
// TODO: substituir pela URL real do app/portal da BeneMed quando disponível
const BENEMED_URL = "https://benemed.com.br/app";

export default function AssistenciasRedirecionandoBenemedPage() {
  const [mostrarBotao, setMostrarBotao] = useState(false);

  useEffect(() => {
    const abrirTimer = window.setTimeout(() => {
      window.open(BENEMED_URL, "_blank");
    }, 3000);
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
      <h2 className="mt-6 text-2xl font-bold">Abrindo seu plano</h2>
      <p className="mt-2 text-sm text-white/80">
        Você vai para o app ou o site do parceiro de Saúde por Assinatura.
      </p>
      {mostrarBotao && (
        <button
          type="button"
          onClick={() => window.open(BENEMED_URL, "_blank")}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#FD5F31]"
        >
          Abrir meu plano
        </button>
      )}
    </main>
  );
}
