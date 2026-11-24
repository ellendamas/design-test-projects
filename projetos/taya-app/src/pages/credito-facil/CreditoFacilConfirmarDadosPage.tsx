import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { LockSimple, User } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lerDadosCreditoFacil, type CreditoFacilLeadData } from "./creditoFacilApi";

// Mesma estrutura visual do passo "Seus dados cadastrais" de Crédito Pessoal
// (CreditoPessoalDados.tsx, step dados_conta): card dividido por linha, CPF e nome bloqueados
// (ícone de cadeado), demais campos editáveis ali mesmo — sem precisar ir pra Minha Conta. Ver
// journey-spec: docs/journey-specs/credito-facil-contorno-journey-spec.md

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function isAdultBirthDate(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  const now = new Date();
  if (date > now) return false;
  const age = now.getFullYear() - y - (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d) ? 1 : 0);
  return age >= 18 && age <= 100;
}

type CampoEditavel = "birthDate" | "email" | "phone";

export default function CreditoFacilConfirmarDadosPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ── Dados já na conta (mock) ──
  // TODO: substituir por dados reais assim que existir uma fonte persistida pra data de
  // nascimento (hoje não sobrevive fora do fluxo de cadastro em que foi coletada — ver
  // journey-spec, seção 9/10, dependência com Erasmo/Bruno).
  const [dadosIniciais] = useState(() => lerDadosCreditoFacil());
  const { name: nome, cpf } = dadosIniciais;
  const [email, setEmail] = useState(dadosIniciais.email);
  const [telefone, setTelefone] = useState(dadosIniciais.phone);
  const [dataNascimento, setDataNascimento] = useState(dadosIniciais.birthDate);

  const [campoEditando, setCampoEditando] = useState<CampoEditavel | null>(null);
  const [valorTemp, setValorTemp] = useState("");
  const [editErro, setEditErro] = useState("");
  const editOpen = campoEditando !== null;

  const abrirEdicao = (campo: CampoEditavel, valorAtual: string) => {
    setCampoEditando(campo);
    setValorTemp(valorAtual);
    setEditErro("");
  };

  const salvarEdicao = () => {
    if (campoEditando === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorTemp)) {
        setEditErro("E-mail inválido");
        return;
      }
      setEmail(valorTemp);
    } else if (campoEditando === "phone") {
      if (valorTemp.replace(/\D/g, "").length < 10) {
        setEditErro("Celular inválido");
        return;
      }
      setTelefone(valorTemp);
    } else if (campoEditando === "birthDate") {
      if (!isAdultBirthDate(valorTemp)) {
        setEditErro("Data inválida ou idade mínima de 18 anos");
        return;
      }
      setDataNascimento(valorTemp);
    }
    setCampoEditando(null);
  };

  const tituloCampo: Record<CampoEditavel, string> = {
    birthDate: "Data de nascimento",
    email: "E-mail",
    phone: "Celular",
  };

  const editModalContent = (
    <>
      {campoEditando === "birthDate" && (
        <IMaskInput
          mask="00/00/0000"
          value={valorTemp}
          onAccept={(v) => { setValorTemp(String(v)); setEditErro(""); }}
          className={maskedInputClass}
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          autoFocus
        />
      )}
      {campoEditando === "email" && (
        <Input type="email" value={valorTemp} onChange={(e) => { setValorTemp(e.target.value); setEditErro(""); }} className="h-12 rounded-xl" placeholder="seu@email.com" autoFocus />
      )}
      {campoEditando === "phone" && (
        <IMaskInput mask="(00) 00000-0000" value={valorTemp} onAccept={(v) => { setValorTemp(String(v)); setEditErro(""); }} className={maskedInputClass} placeholder="(00) 00000-0000" inputMode="numeric" autoFocus />
      )}
      {editErro && <p className="mt-2 text-xs text-red-500">{editErro}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl" onClick={() => setCampoEditando(null)}>Cancelar</Button>
        <Button className="h-12 rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={salvarEdicao}>
          Salvar
        </Button>
      </div>
    </>
  );

  const dados: CreditoFacilLeadData = { name: nome, cpf, birthDate: dataNascimento, email, phone: telefone };

  const campos: { label: string; value: string; locked: boolean; campo?: CampoEditavel }[] = [
    { label: "CPF", value: cpf, locked: true },
    { label: "Nome completo", value: nome, locked: true },
    { label: "Data de nascimento", value: dataNascimento, locked: false, campo: "birthDate" },
    { label: "E-mail", value: email, locked: false, campo: "email" },
    { label: "Celular", value: telefone, locked: false, campo: "phone" },
  ];

  return (
    <>
      <SubPageLayout title="Crédito Fácil" hideNav>
        <div className="space-y-4 pb-28 md:mx-auto md:max-w-[560px]">

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
              <User size={28} className="text-[#FD5F31]" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Confirme seus dados</h2>
            <p className="text-sm text-muted-foreground">
              Esses dados vão pra Facio, parceira da Pode Já. Se algo estiver errado, você pode
              corrigir aqui mesmo.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white shadow-sm">
            {campos.map(({ label, value, locked, campo }, i, arr) => (
              <div
                key={label}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
                {locked ? (
                  <LockSimple size={16} className="text-muted-foreground" />
                ) : (
                  <button
                    type="button"
                    onClick={() => abrirEdicao(campo!, value)}
                    className="text-sm font-medium text-[#FD5F31] hover:underline"
                  >
                    Alterar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0">
            <button
              type="button"
              onClick={() => navigate("/credito-facil/redirecionando", { state: { dados } })}
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#D94E28]"
            >
              Confirmar e continuar
            </button>
          </div>

        </div>
      </SubPageLayout>

      {isDesktop ? (
        <Dialog open={editOpen} onOpenChange={(o) => { if (!o) setCampoEditando(null); }}>
          <DialogContent className="max-w-md">
            <DialogClose onClose={() => setCampoEditando(null)} />
            <DialogHeader>
              <DialogTitle>Alterar {campoEditando ? tituloCampo[campoEditando] : ""}</DialogTitle>
            </DialogHeader>
            {editModalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={editOpen} onOpenChange={(o) => { if (!o) setCampoEditando(null); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Alterar {campoEditando ? tituloCampo[campoEditando] : ""}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">{editModalContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
