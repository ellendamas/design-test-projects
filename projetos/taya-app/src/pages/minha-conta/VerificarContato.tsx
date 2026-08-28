import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, EnvelopeSimple, DeviceMobile } from "@phosphor-icons/react";
import { toast } from "sonner";
import { IMaskInput } from "react-imask";
import { SubPageLayout } from "@/App";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Mesmo padrão visual da verificação de telefone por SMS do onboarding (step 3 do cadastro),
// só que reaproveitável dentro do app logado (com menus disponíveis) para e-mail e celular —
// tanto para a primeira verificação do e-mail quanto para revalidar sempre que o contato mudar.

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const CODIGO_VALIDO = "123456"; // TODO: substituir por validação real via API

type Tipo = "email" | "celular";

const CONFIG: Record<Tipo, { titulo: string; storageValueKey: string; storageValidadoKey: string; defaultValue: string; icon: typeof EnvelopeSimple }> = {
  email: {
    titulo: "Verificar e-mail",
    storageValueKey: "podeja_email",
    storageValidadoKey: "podeja_email_validado",
    defaultValue: "cliente@exemplo.com",
    icon: EnvelopeSimple,
  },
  celular: {
    titulo: "Verificar celular",
    storageValueKey: "podeja_celular",
    storageValidadoKey: "podeja_telefone_validado",
    defaultValue: "(11) 99999-8888",
    icon: DeviceMobile,
  },
};

const maskarEmail = (v: string) => {
  const [local, dominio] = v.split("@");
  if (!local || !dominio) return v;
  return `${local.slice(0, 2)}***@${dominio}`;
};

const maskarCelular = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) return v;
  return `(${digits.slice(0, 2)}) •••••-${digits.slice(-4)}`;
};

export default function VerificarContato({ tipo }: { tipo: Tipo }) {
  const navigate = useNavigate();
  const cfg = CONFIG[tipo];
  const Icon = cfg.icon;

  const [valor, setValor] = useState(() => localStorage.getItem(cfg.storageValueKey) ?? cfg.defaultValue);
  const [etapa, setEtapa] = useState<"codigo" | "trocar">("codigo");
  const [novoValor, setNovoValor] = useState(valor);
  const [novoValorErro, setNovoValorErro] = useState("");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const valorMascarado = tipo === "email" ? maskarEmail(valor) : maskarCelular(valor);

  const handleVerificar = () => {
    if (codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos.");
      return;
    }
    if (codigo !== CODIGO_VALIDO) {
      setErro("Código inválido. Verifique e tente novamente.");
      setCodigo("");
      return;
    }
    localStorage.setItem(cfg.storageValidadoKey, "true");
    setErro(null);
    setVerificado(true);
    toast.success(tipo === "email" ? "E-mail verificado!" : "Celular verificado!");
    setTimeout(() => navigate(-1), 1500);
  };

  const handleReenviar = () => {
    setCountdown(30);
    setCodigo("");
    setErro(null);
    // TODO: acionar reenvio real do código via API
    toast(`Código reenviado para ${valorMascarado}.`);
  };

  const handleEnviarNovoValor = () => {
    if (tipo === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoValor)) { setNovoValorErro("E-mail inválido"); return; }
    } else {
      if (novoValor.replace(/\D/g, "").length < 10) { setNovoValorErro("Celular inválido"); return; }
    }
    localStorage.setItem(cfg.storageValueKey, novoValor);
    setValor(novoValor);
    setNovoValorErro("");
    setEtapa("codigo");
    setCodigo("");
    setErro(null);
    setCountdown(30);
    // TODO: acionar envio real do código para o novo contato via API
    toast(`Código enviado para ${tipo === "email" ? maskarEmail(novoValor) : maskarCelular(novoValor)}.`);
  };

  return (
    <SubPageLayout title={cfg.titulo}>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[480px]">
        {verificado ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={32} weight="fill" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{tipo === "email" ? "E-mail verificado!" : "Celular verificado!"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">Voltando para a tela anterior...</p>
            </div>
          </div>
        ) : etapa === "codigo" ? (
          <>
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <Icon size={28} className="text-[#FD5F31]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {tipo === "email" ? "Confirme seu e-mail" : "Confirme seu celular"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enviamos um código de verificação para {valorMascarado}
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={codigo} onChange={(v) => { setCodigo(v); if (erro) setErro(null); }}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {erro && <p className="mt-3 text-center text-sm text-red-500">{erro}</p>}
              <div className="mt-3 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Reenviar em <span className="font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleReenviar} className="text-sm font-semibold text-[#FD5F31] underline">
                    Reenviar código
                  </button>
                )}
              </div>
            </div>

            <Button
              className="h-12 rounded-full bg-[#FD5F31] text-white hover:bg-[#D94E28]"
              disabled={codigo.length !== 6}
              onClick={handleVerificar}
            >
              Verificar código
            </Button>

            <button
              type="button"
              onClick={() => { setNovoValor(valor); setNovoValorErro(""); setEtapa("trocar"); }}
              className="py-1 text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {tipo === "email" ? "Não é esse o seu e-mail? Trocar e-mail" : "Não é esse o seu celular? Trocar celular"}
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <Icon size={28} className="text-[#FD5F31]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {tipo === "email" ? "Qual é o seu novo e-mail?" : "Qual é o seu novo celular?"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vamos enviar um novo código de verificação para o contato informado.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
              {tipo === "email" ? (
                <Input
                  type="email"
                  value={novoValor}
                  onChange={(e) => { setNovoValor(e.target.value); setNovoValorErro(""); }}
                  className="h-12 rounded-xl"
                  placeholder="seu@email.com"
                  autoFocus
                />
              ) : (
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={novoValor}
                  onAccept={(v) => { setNovoValor(String(v)); setNovoValorErro(""); }}
                  className={maskedInputClass}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                />
              )}
              {novoValorErro && <p className="mt-2 text-xs text-red-500">{novoValorErro}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl" onClick={() => setEtapa("codigo")}>
                Cancelar
              </Button>
              <Button className="h-12 rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={handleEnviarNovoValor}>
                Enviar código
              </Button>
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
}
