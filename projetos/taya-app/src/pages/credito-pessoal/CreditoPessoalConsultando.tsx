import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, WifiX } from "@phosphor-icons/react";

type LocationState = Record<string, unknown>;

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
};

export default function CreditoPessoalConsultando() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const estado = searchParams.get("estado") ?? "consultando"; // DESIGN ONLY

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timedOut, setTimedOut] = useState(estado === "timeout"); // DESIGN ONLY
  const [seconds, setSeconds] = useState(0);
  // DESIGN ONLY — ?estado=demorado exibe card de análise demorada imediatamente
  const [demorado, setDemorado] = useState(estado === "demorado"); // DESIGN ONLY

  // Ativa estado demorado quando counter atinge 60s
  useEffect(() => {
    if (seconds >= 60 && !demorado) setDemorado(true);
  }, [seconds, demorado]);

  // Counter — incrementa a cada segundo enquanto não há timeout
  useEffect(() => {
    if (timedOut) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timedOut]);

  const startTimer = useCallback(() => {
    setTimedOut(false);
    setSeconds(0);
    setDemorado(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    // TODO: substituir por polling real da API
    timerRef.current = setTimeout(
      () => {
        if (estado === "inelegivel") {
          navigate("/credito-pessoal/inelegivel", { state: locationState });
        } else {
          navigate("/credito-pessoal/simulador", {
            state: {
              ...locationState,
              valorMinimo: 50000,  // centavos // TODO: receber da API
              valorMaximo: 500000, // centavos // TODO: receber da API
            },
          });
        }
      },
      estado === "elegivel" || estado === "inelegivel" ? 2000 : 3000, // TODO: substituir por polling real da API
    );
  }, [estado, locationState, navigate]);

  useEffect(() => {
    if (estado !== "timeout" && estado !== "demorado") startTimer(); // DESIGN ONLY
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNotificacao = () => {
    // TODO: conectar ao sistema de notificações do app
    localStorage.setItem("cp_oferta_pronta", "true"); // DESIGN ONLY — removido quando usuário acessa o simulador
    navigate("/painel");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <style>{`@keyframes pulse-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>

      {timedOut ? (
        /* ── Estado de erro (timeout de conexão) ── */
        <>
          <WifiX size={48} className="text-[#E8590A]" />
          <p className="max-w-xs text-base text-foreground">
            Não conseguimos consultar sua oferta. Verifique sua conexão e tente novamente.
          </p>
          <button
            type="button"
            onClick={() => startTimer()}
            className="flex h-14 w-full max-w-sm items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white"
          >
            Tentar novamente
          </button>
        </>
      ) : (
        /* ── Estado de carregamento ── */
        <>
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full bg-[#E8590A]"
                style={{
                  animation: "pulse-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Consultando sua oferta...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Isso pode levar até 1 minuto. Não feche o aplicativo.
            </p>
          </div>

          {/* Counter — exibido apenas após 30s */}
          {seconds >= 30 && (
            <p className="text-xs text-muted-foreground">Aguardando há {seconds}s...</p>
          )}

          {/* Card de análise demorada — exibido após ~60s ou via ?estado=demorado */}
          {demorado && (
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-4 text-center shadow-sm">
              <Bell size={24} className="mx-auto mb-2 text-[#E8590A]" />
              <p className="text-sm font-medium text-foreground">
                A análise está demorando mais que o esperado.
              </p>
              <button
                type="button"
                onClick={handleNotificacao}
                className="mt-3 flex h-10 w-full items-center justify-center rounded-full border border-[#E8590A] text-xs font-semibold text-[#E8590A] transition-colors hover:bg-[#FEF0E7]"
              >
                Receber notificação quando estiver pronto
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
