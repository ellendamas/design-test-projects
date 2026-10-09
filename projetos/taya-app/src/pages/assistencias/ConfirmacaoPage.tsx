import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { ativarAssinaturaBenemed, PLANOS, type Plano } from "./shared";

// Rota: /assistencias/saude/confirmacao — tela final do fluxo de contratação. Texto genérico
// sobre o acesso ao app/portal da BeneMed já que o canal exato (e-mail, SMS, dentro do próprio
// Pode Já) ainda não foi definido.
export default function AssistenciasConfirmacaoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];

  // Marca a assinatura como ativa (mock, sem backend) — é o que faz o card "O2" do Para Você
  // Agora sumir e a tela "Minha assinatura" ter o que mostrar.
  useEffect(() => {
    ativarAssinaturaBenemed(plano);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SubPageLayout title="Assinatura confirmada" hideNav>
      <div className="flex flex-col items-center gap-5 pb-6 pt-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Pagamento confirmado!</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Sua assinatura do plano {plano.nome} da BeneMed foi contratada com sucesso.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
          <p className="text-sm font-semibold text-foreground">Ativação em até 48 horas</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Seu plano fica disponível para uso assim que a ativação for concluída pela BeneMed.
          </p>
        </div>

        <div className="w-full rounded-2xl bg-[#FFF3EE] p-4 text-left">
          <p className="text-sm font-semibold text-[#D94E28]">Acesso ao app da BeneMed</p>
          <p className="mt-1 text-xs leading-relaxed text-[#D94E28]">
            Você receberá as informações de acesso em breve.
          </p>
        </div>

        <div className="mt-2 w-full space-y-2">
          <Button
            className="h-14 w-full rounded-full"
            onClick={() => navigate("/assistencias/saude/assinatura", { state: { plano } })}
          >
            Ver minha assinatura
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
