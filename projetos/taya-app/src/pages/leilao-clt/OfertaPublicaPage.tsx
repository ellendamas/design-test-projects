import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { TermosModal } from "@/components/TermosModal";
import { OfertaResumoCard } from "./OfertaResumoCard";

// Rota: /leilao/oferta?token=mock (DESIGN ONLY — simula recebimento do link, sem login)
export default function LeilaoOfertaPublicaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [termosAbertos, setTermosAbertos] = useState(false);

  return (
    <PublicLayout
      footer={
        <>
          <Button
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate(`/leilao/dados${searchParams.toString() ? `?${searchParams.toString()}` : ""}`)}
          >
            Aceitar oferta
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-primary text-primary hover:bg-primary-light"
            onClick={() => navigate("/acesso?redirect=/leilao/oferta")}
          >
            Já tenho conta
          </Button>
          <p className="pt-1 text-center text-xs leading-relaxed text-muted-foreground">
            Ao continuar, você aceita os{" "}
            <button type="button" className="underline underline-offset-2" onClick={() => setTermosAbertos(true)}>
              Termos de Uso
            </button>{" "}
            e a{" "}
            <button type="button" className="underline underline-offset-2" onClick={() => setTermosAbertos(true)}>
              Política de Privacidade
            </button>{" "}
            do Pode Já.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        <OfertaResumoCard />
        <p className="text-xs text-muted-foreground">
          Esta oferta foi aprovada com base na sua margem consignável disponível.
        </p>
      </div>
      <TermosModal aberto={termosAbertos} onFechar={() => setTermosAbertos(false)} />
    </PublicLayout>
  );
}
