import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { Bank, IdentificationCard, LockSimple, QrCode } from "@phosphor-icons/react";
import { PublicLayout } from "@/components/PublicLayout";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData, formatPixKey } from "@/components/ContaSelector";
import { LEAD_MOCK } from "./leilaoData";

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

type CampoEditavel = "email" | "celular";

interface LocationState {
  email?: string;
  celular?: string;
}

function formatEnderecoResumo(e: EnderecoData): string {
  return `${e.logradouro}, ${e.numero} · ${e.cidade}/${e.estado}`;
}

function formatContaResumo(c: ContaData): string {
  return `${c.banco.nome} · Ag ${c.agencia} · ${c.conta}-${c.digito}`;
}

// Dialog no desktop, Drawer no mobile — mesmo padrão usado em toda a tela.
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

// Rota: /leilao/confirmar-dados — revisão dos dados já conhecidos do lead (nome/CPF, vindos
// junto no webhook que originou o link) mais e-mail/celular (etapa anterior) e endereço/forma
// de recebimento (coletados aqui). CPF e nome não são editáveis; os demais podem ser alterados.
// Endereço e conta são limitados a 1 cada. Tudo acontece em modal/drawer — o usuário nunca sai
// desta tela, pra não dar a impressão de uma jornada grande.
export default function LeilaoConfirmarDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const [email, setEmail] = useState(state.email ?? "");
  const [celular, setCelular] = useState(state.celular ?? "");
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);
  const [conta, setConta] = useState<ContaData | null>(null);
  const [chavePix, setChavePix] = useState<string | null>(null);
  const [chavePixTemp, setChavePixTemp] = useState("");

  const [campoEditando, setCampoEditando] = useState<CampoEditavel | null>(null);
  const [valorTemp, setValorTemp] = useState("");
  const [erroEdicao, setErroEdicao] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [enderecoAberto, setEnderecoAberto] = useState(false);
  const [enderecoKey, setEnderecoKey] = useState(0);
  const [metodoAberto, setMetodoAberto] = useState(false);
  const [contaAberto, setContaAberto] = useState(false);
  const [contaKey, setContaKey] = useState(0);
  const [pixAberto, setPixAberto] = useState(false);

  const podeContinuar = !!email && !!celular && !!endereco && (!!conta || !!chavePix);

  const abrirEdicao = (campo: CampoEditavel) => {
    const valores: Record<CampoEditavel, string> = { email, celular };
    setValorTemp(valores[campo]);
    setErroEdicao("");
    setCampoEditando(campo);
  };

  const salvarEdicao = () => {
    if (campoEditando === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorTemp)) {
      setErroEdicao("E-mail inválido");
      return;
    }
    if (campoEditando === "celular" && valorTemp.replace(/\D/g, "").length < 10) {
      setErroEdicao("Celular inválido");
      return;
    }
    if (campoEditando === "email") setEmail(valorTemp);
    else if (campoEditando === "celular") setCelular(valorTemp);
    setCampoEditando(null);
  };

  const abrirEndereco = () => {
    setEnderecoKey((k) => k + 1);
    setEnderecoAberto(true);
  };

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

  const editModalContent = (
    <>
      {campoEditando === "email" && (
        <Input type="email" value={valorTemp} onChange={(e) => { setValorTemp(e.target.value); setErroEdicao(""); }} className="h-12 rounded-xl" placeholder="seu@email.com" autoFocus />
      )}
      {campoEditando === "celular" && (
        <IMaskInput
          mask="(00) 00000-0000"
          value={valorTemp}
          onAccept={(v) => { setValorTemp(String(v)); setErroEdicao(""); }}
          className={maskedInputClass}
          placeholder="(11) 99999-9999"
          inputMode="numeric"
        />
      )}
      {erroEdicao && <p className="mt-2 text-xs text-red-500">{erroEdicao}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl" onClick={() => setCampoEditando(null)}>Cancelar</Button>
        <Button className="h-12 rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={salvarEdicao}>Salvar</Button>
      </div>
    </>
  );

  const labelCampo = campoEditando === "email" ? "E-mail" : "Celular";

  return (
    <>
      <PublicLayout
        footerTransparente
        footer={
          <Button
            className="h-14 w-full rounded-full"
            disabled={!podeContinuar}
            onClick={() => navigate("/leilao/mfa", { state: { ...state, email, celular, endereco, conta, chavePix } })}
          >
            Continuar
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
              <IdentificationCard size={28} className="text-[#FD5F31]" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Confirme seus dados</h2>
            <p className="text-sm text-muted-foreground">
              Revise as informações abaixo para gerar seu contrato.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-sm">
            {[
              { label: "CPF", value: LEAD_MOCK.cpf, locked: true as const, campo: undefined },
              { label: "Nome completo", value: LEAD_MOCK.nome, locked: true as const, campo: undefined },
              { label: "E-mail", value: email || "Não informado", locked: false as const, campo: "email" as const },
              { label: "Celular", value: celular || "Não informado", locked: false as const, campo: "celular" as const },
            ].map(({ label, value, locked, campo }, i, arr) => (
              <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
                {locked ? (
                  <LockSimple size={16} className="text-muted-foreground" />
                ) : (
                  <button type="button" onClick={() => abrirEdicao(campo!)} className="text-sm font-medium text-[#FD5F31] hover:underline">
                    Alterar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Endereço de recebimento</p>
                <p className="text-sm font-medium text-foreground">
                  {endereco ? formatEnderecoResumo(endereco) : "Não informado"}
                </p>
              </div>
              <button type="button" onClick={abrirEndereco} className="text-sm font-medium text-[#FD5F31] hover:underline">
                {endereco ? "Alterar" : "Adicionar"}
              </button>
            </div>
          </div>

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
        </div>
      </PublicLayout>

      {/* Alterar e-mail/celular */}
      <ModalOuDrawer aberto={campoEditando !== null} onFechar={() => setCampoEditando(null)} titulo={`Alterar ${labelCampo}`} isDesktop={isDesktop}>
        {editModalContent}
      </ModalOuDrawer>

      {/* Endereço de recebimento */}
      <ModalOuDrawer aberto={enderecoAberto} onFechar={() => setEnderecoAberto(false)} titulo="Endereço de recebimento" isDesktop={isDesktop}>
        <EnderecoSelector
          key={enderecoKey}
          enderecos={endereco ? [endereco] : []}
          permitirExcluir={false}
          maxItens={1}
          semProximoPasso
          onConfirmar={(end) => {
            setEndereco(end);
            setEnderecoAberto(false);
          }}
        />
      </ModalOuDrawer>

      {/* Como quer receber o dinheiro — escolha entre conta bancária ou chave Pix */}
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
              className="h-12 rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]"
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
