import { useNavigate, useLocation } from "react-router-dom";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    valor = 10000,
    prazo = 36,
    taxaMensal = 3.48,
    ...restState
  } = (location.state as Record<string, unknown> & {
    valor?: number;
    prazo?: number;
    taxaMensal?: number;
  }) ?? {};

  const handleContinuar = () => {
    // TODO: integrar SDK Unico para biometria facial real
    navigate("/consignado-clt/confirmacao", {
      state: { ...location.state, valor, prazo, taxaMensal, ...restState, biometriaOk: true },
    });
  };

  return (
    <SubPageLayout title="Verificação de identidade" hideNav>
      <UnicoNotice onContinuar={handleContinuar} />
    </SubPageLayout>
  );
}
