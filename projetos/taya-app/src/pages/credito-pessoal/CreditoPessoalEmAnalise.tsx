import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";

export default function CreditoPessoalEmAnalise() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resultado = searchParams.get("resultado"); // DESIGN ONLY

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // TODO: substituir timer mock por polling real GET /propostas/{id} — avançar quando status mudar para AGUARDANDO_ASSINATURA
    const delay = resultado ? 2000 : 5000;

    timerRef.current = setTimeout(() => {
      if (resultado === "pendente") {
        navigate("/credito-pessoal/pendente", { state: location.state });
      } else {
        // "pronto" ou sem param → assinatura
        navigate("/credito-pessoal/assinatura", { state: location.state });
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubPageLayout title="Crédito Pessoal" hideNav>
      <style>{`@keyframes pulse-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
      <div className="flex flex-col items-center justify-center gap-6 pt-10 text-center">
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full bg-[#FD5F31]"
              style={{
                animation: "pulse-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Sua proposta está em análise</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos concluindo os últimos detalhes antes de liberar o link de assinatura.
            Isso costuma ser rápido — você pode aguardar aqui ou deixaremos você atualizado.
          </p>
        </div>
      </div>
    </SubPageLayout>
  );
}
