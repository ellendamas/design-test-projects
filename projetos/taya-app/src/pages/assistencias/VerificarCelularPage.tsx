import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { DeviceMobile } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PLANOS, proximaEtapaAposVerificacao, TELEFONE_VALIDADO_KEY, type Plano } from "./shared";

const CODIGO_VALIDO = "123456"; // TODO: integrar com endpoint real de verificação
const MAX_TENTATIVAS = 3;

// Rota: /assistencias/saude/verificar-celular — intercalada antes da confirmação de dados só
// quando o telefone do usuário ainda não foi validado (ver shared.ts, proximaEtapaAposVerificacao).
// Ao concluir, verifica se falta e-mail também antes de seguir pra confirmação de dados — telefone
// e e-mail são sempre exigidos agora, não só em planos com cobrança recorrente.
// Mesmo padrão de leilao-clt/MfaPage.tsx: erro inline abaixo do campo (nunca troca de tela),
// contagem de tentativas restantes, bloqueio após 3 erradas, e ?celularErro=expirado (DESIGN
// ONLY) pra pré-visualizar o estado de código expirado sem esperar de verdade.
export default function AssistenciasVerificarCelularPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const forcarExpirado = searchParams.get("celularErro") === "expirado"; // DESIGN ONLY
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const celularMascarado = (() => {
    const raw = localStorage.getItem("podeja_celular") ?? "";
    const d = raw.replace(/\D/g, "");
    return d.length >= 10 ? `(${d.slice(0, 2)}) •••••-${d.slice(-4)}` : "o número cadastrado na sua conta";
  })();

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
    localStorage.setItem(TELEFONE_VALIDADO_KEY, "true");
    navigate(proximaEtapaAposVerificacao(), { state: { plano } });
  };

  return (
    <SubPageLayout title="Verificar celular" hideNav>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <DeviceMobile size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Confirme seu celular</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Antes de continuar com a assinatura BeneMed, enviamos um código por SMS para {celularMascarado}.
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
