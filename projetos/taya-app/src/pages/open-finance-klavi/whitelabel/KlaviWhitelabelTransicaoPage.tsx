import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// DESIGN ONLY: explica a saída para a tela hospedada pelo parceiro, sem afirmar um
// mecanismo técnico específico (redirect, iframe, webview ou SDK): a documentação da
// Klavi não confirma qual deles o modo Whitelabel usa, então o texto evita prometer algo
// que o time de backend pode não confirmar depois.
export default function KlaviWhitelabelTransicaoPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <button
          type="button"
          onClick={() => navigate("/prototipos/open-finance-klavi/whitelabel")}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Você vai sair da Pode Já por um instante</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vamos te levar para uma tela segura, onde você escolhe seu banco e autoriza o
            compartilhamento dos dados.
          </p>
        </div>

        <div className="flex h-[160px] items-center justify-center rounded-xl bg-primary-light">
          <ShieldCheck size={56} className="text-primary" />
        </div>

        <Card className="border-0 bg-primary-light">
          <CardContent className="flex items-start gap-2 p-4">
            <Lock size={16} className="mt-0.5 text-primary" />
            <p className="text-xs text-primary-dark">
              Isso faz parte do processo oficial do Open Finance, regulado pelo Banco Central. Você volta
              para a Pode Já assim que terminar.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/prototipos/open-finance-klavi/whitelabel/retorno")}
          >
            Continuar <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
