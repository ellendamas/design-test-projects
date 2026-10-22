import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { EnvelopeSimple } from "@phosphor-icons/react";
import { getStoredUser, SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { EMAIL_VALIDADO_KEY, PLANOS, proximaEtapaAposVerificacao, type Plano } from "./shared";

const CODIGO_VALIDO = "123456"; // TODO: integrar com endpoint real de verificação
const MAX_TENTATIVAS = 3;

const maskarEmail = (v: string) => {
  const [local, dominio] = v.split("@");
  if (!local || !dominio) return v;
  return `${local.slice(0, 2)}***@${dominio}`;
};

// Rota: /assistencias/saude/verificar-email — intercalada antes da confirmação de dados só
// quando o e-mail do usuário ainda não foi validado (ver shared.ts, proximaEtapaAposVerificacao).
// Mesmo padrão de verificar-celular/MfaPage.tsx (erro inline, contagem de tentativas, bloqueio
// após 3 erradas, ?emailErro=expirado DESIGN ONLY) — só muda o canal (e-mail em vez de SMS).
// Reaproveita a mesma chave de validação de minha-conta/VerificarContato.tsx (tipo="email"),
// que já é o jeito existente de verificar e-mail no resto do app.
export default function AssistenciasVerificarEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const forcarExpirado = searchParams.get("emailErro") === "expirado"; // DESIGN ONLY
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const emailMascarado = maskarEmail(getStoredUser()?.email ?? "");

  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [tentativasRestantes, setTentativasRestantes] = useState(MAX_TENTATIVAS);
  const [bloqueado, setBloqueado] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  // DESIGN ONLY — mostra o estado de código expirado direto, sem precisar digitar nada.
  useEffect(() => {
    if (forcarExpirado) setErro("Código expirou. Solicite um novo código para continuar.");
  }, [forcarExpirado]);

  const verificar = () => {
    if (forcarExpirado || bloqueado) return;
    if (codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos.");
      return;
    }
    if (codigo !== CODIGO_VALIDO) {
      const restantes = tentativasRestantes - 1;
      setCodigo("");
      if (restantes <= 0) {
        setBloqueado(true);
        setErro("Muitas tentativas. Aguarde 15 minutos antes de tentar de novo.");
        return;
      }
      setTentativasRestantes(restantes);
      const sufixo = restantes === 1 ? "Resta 1 tentativa." : `Restam ${restantes} tentativas.`;
      setErro(`Código inválido. Verifique e tente novamente. ${sufixo}`);
      return;
    }
    localStorage.setItem(EMAIL_VALIDADO_KEY, "true");
    navigate(proximaEtapaAposVerificacao(), { state: { plano } });
  };

  return (
    <SubPageLayout title="Verificar e-mail" hideNav>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <EnvelopeSimple size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Confirme seu e-mail</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Antes de continuar com a contratação, enviamos um código para {emailMascarado}.
            </p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 pt-5">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={codigo}
                disabled={bloqueado || forcarExpirado}
                onChange={(v) => {
                  setCodigo(v);
                  if (erro) setErro(null);
                }}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {erro && <p className="text-center text-sm text-red-500">{erro}</p>}
            <div className="text-center">
              {bloqueado ? null : countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reenviar em <span className="font-semibold">{countdown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCountdown(30);
                    setCodigo("");
                    setErro(null);
                    setTentativasRestantes(MAX_TENTATIVAS);
                  }}
                  className="text-sm font-semibold text-primary underline"
                >
                  Reenviar código
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Button
          className="h-14 w-full rounded-full"
          disabled={codigo.length !== 6 || bloqueado || forcarExpirado}
          onClick={verificar}
        >
          Verificar e continuar
        </Button>
      </div>
    </SubPageLayout>
  );
}
