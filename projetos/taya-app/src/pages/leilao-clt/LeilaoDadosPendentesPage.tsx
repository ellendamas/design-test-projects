import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Bank, QrCode } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EnderecoSelector from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData, formatPixKey } from "@/components/ContaSelector";

type Step = "endereco" | "forma";

function formatContaResumo(c: ContaData): string {
  return `${c.banco.nome} · Ag ${c.agencia} · ${c.conta}-${c.digito}`;
}

// Dialog no desktop, Drawer no mobile — mesmo padrão de ConfirmarDadosPage.tsx (jornada sem conta).
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
  const [conta, setConta] = useState<ContaData | null>(null);
  const [chavePix, setChavePix] = useState<string | null>(null);
  const [chavePixTemp, setChavePixTemp] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [metodoAberto, setMetodoAberto] = useState(false);
  const [contaAberto, setContaAberto] = useState(false);
  const [contaKey, setContaKey] = useState(0);
  const [pixAberto, setPixAberto] = useState(false);

  const abrirConta = () => {
    setContaKey((k) => k + 1);
    setMetodoAberto(false);
    setContaAberto(true);
  };

  const abrirPix = () => {
    setChavePixTemp(chavePix ?? "");
    setMetodoAberto(false);
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
            {[1, 2].map((i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-[#FD5F31]" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Etapa 2 de 2 — Forma de recebimento</p>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Forma de recebimento</p>
                <p className="text-sm font-medium text-foreground">
                  {conta ? formatContaResumo(conta) : chavePix ? `Chave Pix: ${chavePix}` : "Não informado"}
                </p>
              </div>
              <button type="button" onClick={() => setMetodoAberto(true)} className="text-sm font-medium text-[#FD5F31] hover:underline">
                {conta || chavePix ? "Alterar" : "Adicionar"}
              </button>
            </div>
          </div>

          <Button
            className="h-14 w-full rounded-full"
            disabled={!conta && !chavePix}
            onClick={() => navigate("/leilao/assinatura")}
          >
            Continuar
          </Button>
        </div>
      </SubPageLayout>

      {/* Como quer receber o dinheiro — escolha entre conta bancária ou chave Pix. Fechar e
          reabrir permite trocar de opção a qualquer momento (ex: escolheu Pix por engano). */}
      <ModalOuDrawer aberto={metodoAberto} onFechar={() => setMetodoAberto(false)} titulo="Como você quer receber o dinheiro?" isDesktop={isDesktop}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={abrirConta}
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
            onClick={abrirPix}
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
      </ModalOuDrawer>

      {/* Conta bancária */}
      <ModalOuDrawer aberto={contaAberto} onFechar={() => setContaAberto(false)} titulo="Conta bancária" isDesktop={isDesktop}>
        <ContaSelector
          key={contaKey}
          contas={conta ? [conta] : []}
          permitirExcluir={false}
          maxItens={1}
          semProximoPasso
          onConfirmar={(c) => {
            setConta(c);
            setChavePix(null);
            setContaAberto(false);
          }}
        />
      </ModalOuDrawer>

      {/* Chave Pix */}
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
