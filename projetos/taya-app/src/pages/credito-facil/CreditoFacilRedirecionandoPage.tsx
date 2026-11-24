import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowSquareOut, Warning } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cadastrarLeadCreditoFacil, type CreditoFacilLeadData } from "./creditoFacilApi";

// Mesmo padrão visual do redirecionamento externo já usado no Crédito Pessoal
// (src/pages/credito-pessoal/RedirecionandoPage.tsx, handoff pra Unico): abre sozinho em 3s, com
// botão de fallback em 10s.
type LocationState = { dados?: CreditoFacilLeadData } | null;

export default function CreditoFacilRedirecionandoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"gerando" | "pronto" | "erro">("gerando");
  const [mostrarBotao, setMostrarBotao] = useState(false);
  const urlRef = useRef<string | null>(null);

  // DESIGN ONLY — ?resultado=erro força o estado de falha no cadastro de lead
  const forcarErro = searchParams.get("resultado") === "erro";
  const dados = (location.state as LocationState)?.dados;

  useEffect(() => {
    let cancelado = false;
    cadastrarLeadCreditoFacil(
      dados ?? { name: "", cpf: "", birthDate: "", email: "", phone: "" },
      { forcarErro },
    )
      .then(({ registrationUrl }) => {
        if (cancelado) return;
        urlRef.current = registrationUrl;
        setStatus("pronto");
      })
      .catch(() => {
        if (!cancelado) setStatus("erro");
      });
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "pronto") return;
    const abrirTimer = window.setTimeout(() => {
      if (urlRef.current) window.open(urlRef.current, "_blank");
    }, 3000);
    const botaoTimer = window.setTimeout(() => setMostrarBotao(true), 10000);
    return () => {
      window.clearTimeout(abrirTimer);
      window.clearTimeout(botaoTimer);
    };
  }, [status]);

  if (status === "erro") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <Warning size={48} className="text-[#6B7280]" />
        <h2 className="mt-6 text-xl font-bold text-foreground">
          Não conseguimos continuar com a Facio agora
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente mais tarde.</p>
        <button
          type="button"
          onClick={() => navigate("/painel")}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-[#FD5F31] px-8 text-sm font-semibold text-white hover:bg-[#D94E28]"
        >
          Voltar para o painel
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-6 text-center text-white">
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowSquareOut size={48} />
      </motion.div>
      <h2 className="mt-6 text-2xl font-bold">
        {status === "gerando" ? "Preparando sua simulação..." : "Abrindo a Facio..."}
      </h2>
      <p className="mt-2 text-sm text-white/80">
        Você vai sair do app da Pode Já e continuar direto no ambiente da Facio.
      </p>
      {mostrarBotao && urlRef.current && (
        <button
          type="button"
          onClick={() => urlRef.current && window.open(urlRef.current, "_blank")}
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#FD5F31]"
        >
          Abrir na Facio
        </button>
      )}
    </main>
  );
}
