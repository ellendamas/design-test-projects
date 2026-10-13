import { useLocation, useNavigate } from "react-router-dom";
import { Clock } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { PLANOS, type DiaCobranca, type Plano } from "./shared";

type LocationState = { plano?: Plano; diaCobranca?: DiaCobranca | null };

// DESIGN ONLY — mock state para acesso direto via URL de design, mesmo padrão usado em
// credito-pessoal/CreditoPessoalReprovada.tsx e CreditoPessoalInelegivel.tsx.
const MOCK_STATE: LocationState = {};

// Rota: /assistencias/saude/pagamento/expirado — tela própria pro caminho alternativo de "Pix
// expirou antes de confirmar o pagamento" (ver PagamentoPage.tsx, acessível via ?pixErro=expirado
// DESIGN ONLY). "Gerar novo código" preserva o plano já escolhido, sem voltar pra seleção.
export default function AssistenciasPixExpiradoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? MOCK_STATE;
  const plano = state.plano ?? PLANOS[0];
  const diaCobranca = state.diaCobranca ?? null;

  return (
    <SubPageLayout title="Pagamento" hideNav>
      <div className="flex flex-col items-center gap-6 pb-6 pt-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Clock size={36} className="text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">O código Pix expirou</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Não identificamos a confirmação do pagamento do plano {plano.nome} a tempo. Gere um
            novo código para continuar, você não precisa escolher o plano de novo.
          </p>
        </div>

        <div className="mt-2 w-full space-y-2">
          <Button
            className="h-14 w-full rounded-full"
            onClick={() => navigate("/assistencias/saude/pagamento", { state: { plano, diaCobranca } })}
          >
            Gerar novo código
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-full"
            onClick={() => navigate("/painel")}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    </SubPageLayout>
  );
}
