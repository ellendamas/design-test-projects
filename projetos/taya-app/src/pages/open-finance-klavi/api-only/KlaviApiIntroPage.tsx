import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChartLineUp, Eye, Lightbulb, Lock, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: mesmo componente em dois contextos (ver useOpenFinanceApiBase). No protótipo de
// comparação solto, mostra um botão de voltar pra tela de comparação. Na jornada real de
// cadastro, segue o padrão da OpenFinanceValuePage que substitui (barra de progresso do
// onboarding + opção de pular), sem o botão de voltar.
export default function KlaviApiIntroPage() {
  const navigate = useNavigate();
  const { base, isReal } = useOpenFinanceApiBase();
  const isOnboarding = typeof window !== "undefined" && !!sessionStorage.getItem("onboarding_step");

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        {isReal ? (
          <div className="mb-2">
            <span className="text-xs font-medium text-muted-foreground">Passo 4 de 5</span>
            <Progress value={80} className="mt-2 h-1 bg-secondary [&>div]:bg-primary" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/prototipos/open-finance-klavi")}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <Card className="border-0 bg-primary-light shadow-sm">
          <CardContent className="space-y-3 p-6 text-center">
            <ChartLineUp size={48} className="mx-auto text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Vamos entender sua vida financeira</h2>
            <p className="text-sm text-muted-foreground">
              Conecte seu banco de forma segura e veja para onde seu dinheiro vai, sem julgamento e sem
              pegadinha.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {[
            { icon: <Eye size={24} className="text-primary" />, title: "Tudo em um lugar só", text: "Veja seus gastos, entradas e padrões financeiros sem abrir planilha." },
            { icon: <ShieldCheck size={24} className="text-primary" />, title: "100% seguro e regulado", text: "O Open Finance é regulado pelo Banco Central. Seus dados só saem com sua autorização." },
            { icon: <Lightbulb size={24} className="text-primary" />, title: "Dicas que fazem sentido para você", text: "Quanto mais você conecta, mais a Pode Já entende o que você precisa." },
          ].map((item) => (
            <Card key={item.title} className="border-border bg-white shadow-sm">
              <CardContent className="flex gap-3 p-4">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border border-[#E5E7EB] bg-white">
          <CardContent className="flex items-start gap-2 px-4 py-3">
            <Lock size={16} className="mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Somente leitura. A Pode Já nunca movimenta dinheiro ou faz pagamentos pela sua conta.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate(`${base}/selecionar-instituicao`)}
          >
            Conectar meu banco <ArrowRight size={16} className="ml-2" />
          </Button>
          {isReal && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") window.localStorage.setItem("openfinance_pendente", "true");
                navigate(isOnboarding ? "/cadastro" : "/painel");
              }}
              className="mt-3 w-full text-center text-sm font-medium text-primary"
            >
              Prefiro fazer isso depois
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
