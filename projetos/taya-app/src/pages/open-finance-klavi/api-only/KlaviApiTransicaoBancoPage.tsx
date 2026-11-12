import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { celcoinBrandsMock, INSTRUCOES_GENERICAS, instrucoesPorBanco } from "./celcoinBrandsData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: bancoId tem fallback "nubank" pra permitir acesso direto por URL. A Celcoin não
// manda logo real aqui (ver celcoinBrandsData.ts), por isso não tem ilustração por banco: só o
// passo a passo em texto, que é conteúdo nosso. Na jornada real, pela doc da Celcoin, quem
// autentica e autoriza o compartilhamento é a própria tela do banco depois do
// redirecionamento, então essa é a última tela nossa antes de sair da Pode Já.
export default function KlaviApiTransicaoBancoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { base, isReal } = useOpenFinanceApiBase();
  const bancoId = (location.state as { bancoId?: string } | null)?.bancoId ?? "nubank"; // DESIGN ONLY
  const bank = celcoinBrandsMock.find((item) => item.brandId === bancoId) ?? celcoinBrandsMock[0];
  const instrucoes = instrucoesPorBanco[bancoId] ?? INSTRUCOES_GENERICAS;

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <button
          type="button"
          onClick={() => navigate(isReal ? `${base}/selecionar-instituicao` : `${base}/autorizacao-lgpd`, { state: { bancoId } })}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Como funciona no {bank.customerFriendlyName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Siga esses passos quando a página abrir:</p>
        </div>

        <div className="space-y-2">
          {instrucoes.map((text, idx) => (
            <div key={text} className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {idx + 1}
              </div>
              <p className="text-sm font-semibold text-foreground">{text}</p>
            </div>
          ))}
        </div>

        <Card className="border-0 bg-primary-light">
          <CardContent className="flex items-start gap-2 p-4">
            <Lock size={16} className="mt-0.5 text-primary" />
            <p className="text-xs text-primary-dark">
              Você vai sair da Pode Já por alguns segundos. Isso é normal e seguro, faz parte do processo
              oficial do Banco Central.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate(`${base}/retorno`, { state: { bancoId: bank.brandId } })}
          >
            Entendi, vamos lá <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
