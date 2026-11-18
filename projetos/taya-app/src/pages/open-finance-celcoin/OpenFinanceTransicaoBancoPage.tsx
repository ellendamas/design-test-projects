import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { celcoinBrandsMock, INSTRUCOES_GENERICAS, instrucoesPorBanco } from "./celcoinBrandsData";

const BASE = "/cadastro/open-finance";

// DESIGN ONLY: bancoId tem fallback "nubank" pra permitir acesso direto por URL. A Celcoin não
// manda logo real aqui (ver celcoinBrandsData.ts), por isso não tem ilustração por banco: só o
// passo a passo em texto, que é conteúdo nosso. Quem autentica e autoriza o compartilhamento é
// a própria tela do banco depois do redirecionamento, então essa é a última tela nossa antes
// de sair da Pode Já.
export default function OpenFinanceTransicaoBancoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const bancoId = (location.state as { bancoId?: string } | null)?.bancoId ?? "nubank"; // DESIGN ONLY
  const bank = celcoinBrandsMock.find((item) => item.brandId === bancoId) ?? celcoinBrandsMock[0];
  const instrucoes = instrucoesPorBanco[bancoId] ?? INSTRUCOES_GENERICAS;

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <button
          type="button"
          onClick={() => navigate(`${BASE}/selecionar-instituicao`, { state: { bancoId } })}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
        >
          <ArrowLeft size={20} />
        </button>

        {/* DESIGN ONLY: montada a partir dos elementos separados do banner no Figma (fundo sólido
            + ilustração), com o texto como texto de verdade pra se adequar ao responsivo. */}
        <div className="flex items-center justify-between gap-3 overflow-hidden rounded-2xl bg-[#FEF2EC] p-5">
          <div className="min-w-0 space-y-2">
            <h3 className="text-xl font-semibold leading-tight text-foreground md:text-2xl">
              Conecte seu banco
            </h3>
            <p className="text-xs leading-relaxed text-foreground/70 md:text-sm">
              Siga os passos abaixo para compartilhar suas informações com a Pode Já.
            </p>
          </div>
          <img
            src="/images/open-finance-banner-passos-ilustracao.svg"
            alt=""
            className="h-24 w-auto shrink-0 md:h-28"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">Como funciona no {bank.customerFriendlyName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Siga esses passos quando a página abrir:</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3">
          <div className="divide-y divide-border">
            {instrucoes.map((text, idx) => (
              <div key={text} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <p className="text-sm font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>
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

      <div className="fixed bottom-0 left-0 right-0 px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate(`${BASE}/retorno`, { state: { bancoId: bank.brandId } })}
          >
            Entendi, vamos lá <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
