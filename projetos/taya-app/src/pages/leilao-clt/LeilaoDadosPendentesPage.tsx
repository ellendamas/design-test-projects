import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, QrCode } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData } from "@/components/ContaSelector";
import PixSelector from "./PixSelector";

type Metodo = "conta" | "pix";

// Rota: /leilao/dados-pendentes
// TODO: pré-preencher com dados reais do token quando API disponível
//
// Tudo em uma tela só (sem passo a passo entre endereço e forma de recebimento) — cada seletor
// fica direto na tela; só os inputs de inserção de dados (formulário de conta/chave Pix) abrem
// em modal/drawer.
export default function LeilaoDadosPendentesPage() {
  const navigate = useNavigate();
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);
  const [metodo, setMetodo] = useState<Metodo>("conta");
  const [conta, setConta] = useState<ContaData | null>(null);
  const [chavePix, setChavePix] = useState<string | null>(null);

  const podeContinuar = !!endereco && (!!conta || !!chavePix);

  return (
    <SubPageLayout title="Confirme seus dados" hideNav>
      <div className="space-y-6 pb-32 md:mx-auto md:max-w-[560px]">
        {/* Endereço de recebimento — direto na tela */}
        <EnderecoSelector
          enderecos={[]}
          permitirExcluir={false}
          maxItens={1}
          semProximoPasso
          onConfirmar={setEndereco}
        />

        <div className="h-px bg-border" />

        {/* Forma de recebimento */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
              <Bank size={28} className="text-[#FD5F31]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Para qual conta enviamos o dinheiro?
            </h2>
          </div>

          {/* Seletor de método — direto na tela, não em modal */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMetodo("conta")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                metodo === "conta" ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#FD5F31]">
                <Bank size={22} />
              </div>
              <p className="text-sm font-semibold text-foreground">Conta bancária</p>
            </button>
            <button
              type="button"
              onClick={() => setMetodo("pix")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                metodo === "pix" ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
              )}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#FD5F31]">
                <QrCode size={22} />
              </div>
              <p className="text-sm font-semibold text-foreground">Chave Pix</p>
            </button>
          </div>

          {metodo === "conta" && (
            <ContaSelector
              contas={conta ? [conta] : []}
              permitirExcluir={false}
              maxItens={1}
              semProximoPasso
              ocultarCabecalho
              autoConfirmarSelecao
              onConfirmar={(c) => { setConta(c); setChavePix(null); }}
            />
          )}

          {/* Chave Pix — usuário com conta pode ter mais de uma chave salva, igual a
              endereço/conta bancária (específico desta jornada). */}
          {metodo === "pix" && (
            <PixSelector
              chaves={chavePix ? [chavePix] : []}
              maxItens={5}
              ocultarCabecalho
              autoConfirmarSelecao
              onConfirmar={(chave) => { setChavePix(chave); setConta(null); }}
            />
          )}
        </div>
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button
          className="h-14 w-full rounded-full"
          disabled={!podeContinuar}
          onClick={() => navigate("/leilao/assinatura")}
        >
          Continuar
        </Button>
      </div>
    </SubPageLayout>
  );
}
