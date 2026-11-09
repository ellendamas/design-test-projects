import { useNavigate } from "react-router-dom";
import { ArrowRight, Flask } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// DESIGN ONLY: tela interna de comparação para decisão de produto, não vai para o usuário final.
export default function OpenFinanceKlaviComparePage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-10 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-5 md:pt-10">
        <Badge className="gap-1.5 bg-[#FEF3C7] text-[#92400E]">
          <Flask size={14} weight="fill" />
          Protótipo interno de comparação
        </Badge>

        <div>
          <h1 className="text-2xl font-bold text-foreground">Duas formas de integrar com a Klavi</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta tela e as próximas são para avaliação de produto, não para o usuário final. Compare as
            duas opções antes de decidirmos qual vira a jornada real de Open Finance.
          </p>
        </div>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Opção 1</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">Whitelabel (redirect simplificado)</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              O parceiro mostra a tela de escolha do banco e de autorização. A Pode Já só inicia a conexão
              e recebe o resultado depois. Mais rápido de implementar, mas a gente não controla o visual
              dessa etapa.
            </p>
            <Button
              className="h-11 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
              onClick={() => navigate("/prototipos/open-finance-klavi/whitelabel")}
            >
              Ver essa opção <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="space-y-3 p-5">
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Opção 2</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">API Only (UI própria)</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              A Pode Já constrói a tela de escolha do banco, a confirmação de CPF ou CNPJ e a autorização
              LGPD, chamando a API do parceiro por trás. Mais trabalho de desenvolvimento, mas o visual
              fica inteiro nosso.
            </p>
            <Button
              variant="outline"
              className="h-11 w-full rounded-xl border-border font-semibold"
              onClick={() => navigate("/prototipos/open-finance-klavi/api-only")}
            >
              Ver essa opção <ArrowRight size={16} className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
