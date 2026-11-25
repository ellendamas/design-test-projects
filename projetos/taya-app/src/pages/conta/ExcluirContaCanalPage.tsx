import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DeviceMobile, EnvelopeSimple, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout, getStoredUser } from "@/App";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MotivoExclusaoId } from "./shared";

type CanalExclusao = "email" | "sms";

// Fallback igual ao de maskarCelular logo abaixo: o mock de login tem vários caminhos (login
// rápido, biometria) que gravam `email: ""` em `podeja_user` — sem isso, a tela mostrava a
// linha do e-mail em branco embaixo de "E-mail" (achado da Ellen testando com uma conta mock).
const maskarEmail = (v: string) => {
  const [local, dominio] = v.split("@");
  if (!local || !dominio) return "o e-mail cadastrado na sua conta";
  return `${local.slice(0, 2)}***@${dominio}`;
};

const maskarCelular = (v: string) => {
  const d = v.replace(/\D/g, "");
  return d.length >= 10 ? `(${d.slice(0, 2)}) •••••-${d.slice(-4)}` : "o número cadastrado na sua conta";
};

// Rota: /minha-conta/excluir/canal — "Confirme que é você" antes de liberar o código. Só
// e-mail e SMS, sem WhatsApp: mesma escolha que a suspensão de conta já faz em produção pra
// ações destrutivas de conta (diferente do WhatsApp disponível em outros fluxos do app).
export default function ExcluirContaCanalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { motivo?: MotivoExclusaoId; comentario?: string } | null;
  const user = getStoredUser();
  const [canal, setCanal] = useState<CanalExclusao | null>(null);

  const canais: { key: CanalExclusao; label: string; detalhe: string; icon: React.ReactNode }[] = [
    { key: "email", label: "E-mail", detalhe: maskarEmail(user?.email ?? ""), icon: <EnvelopeSimple size={20} /> },
    { key: "sms", label: "SMS", detalhe: maskarCelular(localStorage.getItem("podeja_celular") ?? ""), icon: <DeviceMobile size={20} /> },
  ];

  const enviarCodigo = () => {
    if (!canal) return;
    toast(`Código enviado via ${canal === "email" ? "e-mail" : "SMS"}!`);
    navigate("/minha-conta/excluir/codigo", { state: { motivo: state?.motivo, comentario: state?.comentario, canal } });
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <ShieldCheck size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Confirme que é você</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escolha onde enviaremos o código de verificação.</p>
          </div>
        </div>

        <div className="space-y-3">
          {canais.map((item) => {
            const selecionado = canal === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCanal(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    selecionado ? "bg-[#FD5F31] text-white" : "bg-background text-muted-foreground",
                  )}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detalhe}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button className="h-14 w-full rounded-full" disabled={!canal} onClick={enviarCodigo}>
          Enviar código
        </Button>
      </div>
    </SubPageLayout>
  );
}
