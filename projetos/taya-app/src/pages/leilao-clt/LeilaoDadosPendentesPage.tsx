import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, QrCode } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import EnderecoSelector from "@/components/EnderecoSelector";
import ContaSelector, { formatPixKey } from "@/components/ContaSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Step = "endereco" | "metodo" | "conta" | "pix";

// Rota: /leilao/dados-pendentes
// TODO: pré-preencher com dados reais do token quando API disponível
export default function LeilaoDadosPendentesPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("endereco");
  const [chavePixTemp, setChavePixTemp] = useState("");

  const etapaNumero = step === "endereco" ? 1 : 2;

  return (
    <SubPageLayout title="Confirme seus dados" hideNav>
      <div className="space-y-4 pb-4 md:mx-auto md:max-w-[560px]">
        {/* Barra de progresso — 2 steps */}
        <div className="flex gap-1">
          {[1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= etapaNumero ? "bg-[#FD5F31]" : "bg-border"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Etapa {etapaNumero} de 2 — {step === "endereco" ? "Endereço" : "Forma de recebimento"}
        </p>

        {step === "endereco" && (
          <EnderecoSelector
            enderecos={[]}
            permitirExcluir={false}
            onConfirmar={() => setStep("metodo")}
          />
        )}

        {step === "metodo" && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <Bank size={28} className="text-[#FD5F31]" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Como você quer receber o dinheiro?</h2>
              <p className="text-sm text-muted-foreground">Escolha uma das opções abaixo</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("conta")}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-[#FD5F31]/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#FD5F31]">
                <Bank size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Conta bancária</p>
                <p className="text-xs text-muted-foreground">Banco, agência e número da conta</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setStep("pix")}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-[#FD5F31]/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#FD5F31]">
                <QrCode size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Chave Pix</p>
                <p className="text-xs text-muted-foreground">CPF, e-mail, telefone ou chave aleatória</p>
              </div>
            </button>
          </div>
        )}

        {step === "conta" && (
          <ContaSelector
            contas={[]}
            permitirExcluir={false}
            onConfirmar={() => navigate("/leilao/assinatura")}
          />
        )}

        {step === "pix" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <QrCode size={28} className="text-[#FD5F31]" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Qual sua chave Pix?</h2>
              <p className="text-sm text-muted-foreground">CPF, e-mail, telefone ou chave aleatória</p>
            </div>
            <Input
              value={chavePixTemp}
              onChange={(e) => setChavePixTemp(formatPixKey(e.target.value))}
              className="h-12 rounded-xl"
              placeholder="Digite sua chave Pix"
              autoFocus
            />
            <Button
              className="h-14 w-full rounded-full"
              disabled={!chavePixTemp}
              onClick={() => navigate("/leilao/assinatura")}
            >
              Salvar chave Pix
            </Button>
          </div>
        )}
      </div>
    </SubPageLayout>
  );
}
