import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowSquareOut } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { getStoredUser } from "@/App";

// Mesmo padrão visual de consignado-clt/RedirecionandoUnicoPage.tsx — tela plena, sem
// SubPageLayout/PublicLayout, já que não há distinção visual entre as duas jornadas aqui.
// TODO: substituir pela URL real de verificação/assinatura da Unico quando disponível
const UNICO_VERIFICACAO_URL = "https://unico.io/verificacao";

// Rota: /leilao/redirecionando/unico — compartilhada, mas o destino pós-verificação aponta
// para a tela de assinatura da jornada correta (com conta ou pública/guest, apartadas entre si).
export default function LeilaoRedirecionandoUnicoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarBotao, setMostrarBotao] = useState(false);
  const destino = getStoredUser() ? "/leilao/assinatura?status=aguardando" : "/leilao/oferta/assinatura?status=aguardando";

  useEffect(() => {
    const abrirTimer = window.setTimeout(() => {
      window.open(UNICO_VERIFICACAO_URL, "_blank");
      navigate(destino, {
        replace: true,
        state: location.state,
      });
    }, 3000);
    const botaoTimer = window.setTimeout(() => setMostrarBotao(true), 10000);
    return () => {
      window.clearTimeout(abrirTimer);
      window.clearTimeout(botaoTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowSquareOut size={48} />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold">Abrindo a Unico...</h2>
      <p className="mt-2 text-sm text-white/80">
        Você será direcionado para verificar sua identidade na plataforma da Unico.
      </p>
      {mostrarBotao && (
        <button
          type="button"
          onClick={() => {
            window.open(UNICO_VERIFICACAO_URL, "_blank");
            navigate(destino, {
              replace: true,
              state: location.state,
            });
          }}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#FD5F31]"
        >
          Abrir verificação na Unico
        </button>
      )}
    </main>
  );
}
