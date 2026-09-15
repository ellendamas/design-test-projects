import { useNavigate } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { OfertaResumoCard } from "./OfertaResumoCard";

// Rota: /leilao?token=mock (DESIGN ONLY — simula recebimento do link com o usuário já autenticado)
export default function LeilaoOfertaAprovadaPage() {
  const navigate = useNavigate();

  return (
    <SubPageLayout title="Crédito Consignado CLT" hideNav>
      <div className="space-y-4">
        <OfertaResumoCard />
        <p className="text-xs text-muted-foreground">
          Esta oferta foi aprovada com base na sua margem consignável disponível.
        </p>
        {/* NOTA: o briefing aponta este CTA para "/leilao/dados-pendentes", tela não descrita em
            nenhum outro lugar do documento. Como o usuário já tem conta (endereço/conta já
            cadastrados), fui direto para a verificação de identidade — ajustar se não for a intenção. */}
        <Button
          className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark"
          onClick={() => navigate("/leilao/assinatura")}
        >
          Ver minha oferta
        </Button>
      </div>
    </SubPageLayout>
  );
}
