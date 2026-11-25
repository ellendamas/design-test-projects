import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { trackStep } from "@/utils/analytics";
import { gerarProtocoloExclusao, type MotivoExclusaoId } from "./shared";

const CODIGO_VALIDO = "123456"; // TODO: integrar com endpoint real de verificação
const MAX_TENTATIVAS = 3;

// Rota: /minha-conta/excluir/codigo — confirmação por OTP, mesmo padrão de
// VerificarCelularPage.tsx (Saúde). Exclusão é uma ação destrutiva igual à suspensão em
// produção: o código nunca confirma sozinho (nem colado, nem autopreenchido por WebOTP neste
// protótipo, que não simula isso) — quem aperta "Confirmar exclusão" é sempre a pessoa.
export default function ExcluirContaCodigoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { motivo?: MotivoExclusaoId; comentario?: string; canal?: "email" | "sms" } | null;

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

  const confirmar = () => {
    if (bloqueado) return;
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
    const protocolo = gerarProtocoloExclusao();
    trackStep("conta_exclusao_confirmada", { motivo: state?.motivo, protocolo });
    navigate("/minha-conta/excluir/protocolo", { state: { protocolo } });
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <ShieldCheck size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Digite o código</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviamos um código de 6 dígitos por {state?.canal === "sms" ? "SMS" : "e-mail"}.
            </p>
          </div>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 pt-5">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={codigo}
                disabled={bloqueado}
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
            <div className="space-y-2 text-center">
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
              {/* Ellen pediu pra sempre mostrar essa opção desde que a tela abre (pra pessoa
                  saber que existe, não precisar descobrir), mas só liberar quando o timer do
                  reenvio zerar — mesmo momento em que "Reenviar código" libera. Volta pra
                  /canal em vez de reenviar no mesmo lugar, pra pessoa escolher de novo com a
                  máscara do destino visível (mesmo comportamento de IndiqueGanhePage/outras
                  telas de OTP do app, que sempre mostram a máscara na etapa de escolha). */}
              {!bloqueado && (
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => navigate("/minha-conta/excluir/canal", { state: { motivo: state?.motivo, comentario: state?.comentario } })}
                  className="block w-full text-sm font-medium text-muted-foreground underline decoration-dotted disabled:cursor-not-allowed disabled:text-muted-foreground/40 disabled:no-underline"
                >
                  {state?.canal === "sms" ? "Não recebeu? Tente por e-mail" : "Não recebeu? Tente por SMS"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <Button variant="outline" className="h-14 w-full rounded-full" disabled={codigo.length !== 6 || bloqueado} onClick={confirmar}>
          Confirmar exclusão
        </Button>
      </div>
    </SubPageLayout>
  );
}
