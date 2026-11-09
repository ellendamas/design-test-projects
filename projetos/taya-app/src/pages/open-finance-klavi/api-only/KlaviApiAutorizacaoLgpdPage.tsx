import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { OpenFinanceBankId } from "@/pages/open-finance/openFinanceData";
import { useOpenFinanceApiBase } from "./useOpenFinanceApiBase";

// DESIGN ONLY: bancoId tem fallback "nubank" pra permitir acesso direto por URL.
// Etapa nova nesta opção: a autorização LGPD aparece como um passo explícito da jornada
// própria, mesmo com o parceiro de Open Finance por trás da API. O prazo de retenção é
// citado como "prazo determinado" (o backend confirmou que não é indeterminado), sem
// afirmar um número de meses específico. Isso ainda não foi confirmado oficialmente. Na
// jornada real, volta direto pra seleção de instituição (sem a etapa de documento, que só
// existe no protótipo de comparação solto, ver KlaviApiSelecionarInstituicaoPage).
export default function KlaviApiAutorizacaoLgpdPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { base, isReal } = useOpenFinanceApiBase();
  const bancoId = ((location.state as { bancoId?: OpenFinanceBankId } | null)?.bancoId ?? "nubank") as OpenFinanceBankId; // DESIGN ONLY

  const [autorizado, setAutorizado] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full bg-background px-4 pb-28 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-[640px] space-y-4 md:pt-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(isReal ? `${base}/selecionar-instituicao` : `${base}/confirmar-documento`, { state: { bancoId } })}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-background"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">{isReal ? "Passo 2 de 3" : "Passo 3 de 4"}</span>
        </div>
        <Progress value={isReal ? 67 : 75} className="h-1 bg-secondary [&>div]:bg-primary" />

        <div>
          <h2 className="text-2xl font-bold text-foreground">Autorize o compartilhamento dos seus dados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esse passo é exigido pela LGPD antes de conectar com o seu banco.
          </p>
        </div>

        <div className="space-y-2">
          {[
            { titulo: "O que vamos consultar", texto: "Saldo, extrato e dados cadastrais da conta que você conectar." },
            { titulo: "Por quanto tempo", texto: "Por um prazo determinado. Você vê e confirma esse prazo antes de autorizar, não é para sempre." },
            { titulo: "Como revogar", texto: "Você pode cancelar o compartilhamento quando quiser, direto na Pode Já." },
          ].map((topico) => (
            <Card key={topico.titulo} className="border-border bg-white shadow-sm">
              <CardContent className="p-3">
                <p className="text-sm font-semibold text-foreground">{topico.titulo}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{topico.texto}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 bg-primary-light">
          <CardContent className="flex items-start gap-2 p-4">
            <Lock size={16} className="mt-0.5 text-primary" />
            <p className="text-xs text-primary-dark">
              Somente leitura. A Pode Já nunca movimenta dinheiro ou faz pagamentos pela sua conta.
            </p>
          </CardContent>
        </Card>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          <Checkbox checked={autorizado} onCheckedChange={(v) => setAutorizado(v === true)} className="mt-0.5" />
          <span className="text-sm text-foreground">
            Li e autorizo o compartilhamento dos meus dados financeiros, conforme a LGPD.
          </span>
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3">
        <div className="mx-auto w-full max-w-[640px]">
          <Button
            className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
            disabled={!autorizado}
            onClick={() => navigate(`${base}/transicao-banco`, { state: { bancoId } })}
          >
            Autorizar e continuar <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}
