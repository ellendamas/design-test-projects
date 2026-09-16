import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, QrCode } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import EnderecoSelector from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData, formatPixKey } from "@/components/ContaSelector";

type Step = "endereco" | "forma";
type Metodo = "conta" | "pix";

// Dialog no desktop, Drawer no mobile — usado só para o input de inserção da chave Pix.
// O seletor de método (conta ou pix) e o seletor de conta em si (lista/formulário via
// ContaSelector) ficam direto na tela, sem modal.
function ModalOuDrawer({
  aberto,
  onFechar,
  titulo,
  isDesktop,
  children,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  isDesktop: boolean;
  children: ReactNode;
}) {
  if (isDesktop) {
    return (
      <Dialog open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={onFechar} />
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{titulo}</DrawerTitle>
        </DrawerHeader>
        <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

// Rota: /leilao/dados-pendentes
// TODO: pré-preencher com dados reais do token quando API disponível
export default function LeilaoDadosPendentesPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("endereco");
  const [metodo, setMetodo] = useState<Metodo | null>(null);
  const [conta, setConta] = useState<ContaData | null>(null);
  const [chavePix, setChavePix] = useState<string | null>(null);
  const [chavePixTemp, setChavePixTemp] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [pixAberto, setPixAberto] = useState(false);

  const abrirPix = () => {
    setChavePixTemp(chavePix ?? "");
    setPixAberto(true);
  };

  if (step === "endereco") {
    return (
      <SubPageLayout title="Confirme seus dados" hideNav>
        <div className="space-y-4 pb-4 md:mx-auto md:max-w-[560px]">
          <div className="flex gap-1">
            {[1, 2].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= 1 ? "bg-[#FD5F31]" : "bg-border"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Etapa 1 de 2 — Endereço</p>
          <EnderecoSelector enderecos={[]} permitirExcluir={false} onConfirmar={() => setStep("forma")} />
        </div>
      </SubPageLayout>
    );
  }

  return (
    <>
      <SubPageLayout title="Confirme seus dados" hideNav>
        <div className="space-y-4 pb-4 md:mx-auto md:max-w-[560px]">
          <div className="flex gap-1">
            {[1, 2].map((i) => (<div key={i} className="h-1 flex-1 rounded-full bg-[#FD5F31]" />))}
          </div>
          <p className="text-xs text-muted-foreground">Etapa 2 de 2 — Forma de recebimento</p>

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

          {/* Seletor de conta — direto na tela; só o formulário de adicionar/editar (dentro do
              próprio ContaSelector) abre em modal/drawer */}
          {metodo === "conta" && (
            <ContaSelector
              contas={conta ? [conta] : []}
              permitirExcluir={false}
              maxItens={1}
              semProximoPasso
              onConfirmar={(c) => { setConta(c); setChavePix(null); }}
            />
          )}

          {/* Chave Pix — resumo na tela; só o input de digitação abre em modal/drawer */}
          {metodo === "pix" && (
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Chave Pix</p>
                  <p className="text-sm font-medium text-foreground">{chavePix ?? "Não informado"}</p>
                </div>
                <button type="button" onClick={abrirPix} className="text-sm font-medium text-[#FD5F31] hover:underline">
                  {chavePix ? "Alterar" : "Adicionar"}
                </button>
              </div>
            </div>
          )}

          <Button
            className="h-14 w-full rounded-full"
            disabled={!conta && !chavePix}
            onClick={() => navigate("/leilao/assinatura")}
          >
            Continuar
          </Button>
        </div>
      </SubPageLayout>

      {/* Chave Pix — único conteúdo em modal/drawer nesta etapa (a inserção do dado em si) */}
      <ModalOuDrawer aberto={pixAberto} onFechar={() => setPixAberto(false)} titulo="Chave Pix" isDesktop={isDesktop}>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">CPF, e-mail, telefone ou chave aleatória</p>
          <Input
            value={chavePixTemp}
            onChange={(e) => setChavePixTemp(formatPixKey(e.target.value))}
            className="h-12 rounded-xl"
            placeholder="Digite sua chave Pix"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-xl" onClick={() => setPixAberto(false)}>Cancelar</Button>
            <Button
              className="h-12 rounded-xl"
              disabled={!chavePixTemp}
              onClick={() => {
                setChavePix(chavePixTemp);
                setConta(null);
                setPixAberto(false);
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </ModalOuDrawer>
    </>
  );
}
