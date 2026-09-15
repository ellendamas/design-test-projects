import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const CODIGO_VALIDO = "123456"; // TODO: integrar com endpoint real de MFA

// Rota: /leilao/mfa
export default function LeilaoMfaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { celular?: string } | null) ?? {};
  const celularMascarado = (() => {
    const d = (state.celular ?? "").replace(/\D/g, "");
    return d.length >= 6 ? `+55 (${d.slice(0, 2)}) •••••-${d.slice(-4)}` : "o número informado";
  })();

  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [countdown]);

  const verificar = () => {
    if (codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos.");
      return;
    }
    if (codigo !== CODIGO_VALIDO) {
      setErro("Código inválido. Verifique e tente novamente.");
      setCodigo("");
      return;
    }
    localStorage.setItem("podeja_telefone_validado", "true");
    navigate("/leilao/assinatura", { state });
  };

  return (
    <PublicLayout
      footer={
        <Button
          className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          disabled={codigo.length !== 6}
          onClick={verificar}
        >
          Verificar e continuar
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Confirme seu celular</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enviamos um código por SMS para {celularMascarado}.</p>
        </div>
        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 pt-5">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={codigo}
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
              {countdown > 0 ? (
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
                  }}
                  className="text-sm font-semibold text-primary underline"
                >
                  Reenviar código
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
