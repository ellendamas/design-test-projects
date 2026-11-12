import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, Lightbulb, Lock, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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

        <div className="overflow-hidden rounded-2xl">
          <img src="/images/banner-intro-open-finance.png" alt="" className="w-full object-cover" />
        </div>

        <div className="rounded-2xl border border-border bg-white p-4">
          <div className="divide-y divide-border">
            {[
              { icon: <Eye size={24} className="text-primary" />, title: "Tudo em um lugar só", text: "Veja seus gastos, entradas e padrões financeiros sem abrir planilha." },
              { icon: <ShieldCheck size={24} className="text-primary" />, title: "100% seguro e regulado", text: "O Open Finance é regulado pelo Banco Central. Seus dados só saem com sua autorização." },
              { icon: <Lightbulb size={24} className="text-primary" />, title: "Dicas que fazem sentido para você", text: "Quanto mais você conecta, mais a Pode Já entende o que você precisa." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary-light p-4">
          <div className="flex items-start gap-2">
            <Lock size={16} className="mt-0.5 text-primary" />
            <p className="text-xs text-primary-dark">
              Somente leitura. A Pode Já nunca movimenta dinheiro ou faz pagamentos pela sua conta.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 py-3">
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
