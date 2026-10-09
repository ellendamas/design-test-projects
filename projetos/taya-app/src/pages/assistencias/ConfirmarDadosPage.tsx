import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IdentificationCard } from "@phosphor-icons/react";
import { getStoredUser, SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usePrivacy } from "@/context/PrivacyContext";
import { PLANOS, type Plano } from "./shared";

// Replica o padrão de SensitiveData do App.tsx (não é exportado de lá) — mesmo mascaramento
// usado em outras telas de contrato/dados sensíveis do app.
function SensitiveData({ value, type = "text" }: { value: string; type?: "cpf" | "phone" | "text" }) {
  const { dataVisible } = usePrivacy();
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", text: "••••••••" }[type];
  return <span className="text-sm font-semibold text-foreground">{dataVisible ? value : masked}</span>;
}

// Rota: /assistencias/saude/confirmar-dados — nome, CPF e celular vêm da conta já logada, sem
// pedir de novo. Avança só libera depois do aceite explícito dos termos (checkbox, não o
// "ao continuar você aceita..." implícito usado no cadastro).
export default function AssistenciasConfirmarDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const user = getStoredUser();
  const celular = localStorage.getItem("podeja_celular") ?? "(11) 99999-8888";

  const [aceitouTermos, setAceitouTermos] = useState(false);

  const avancar = () => {
    navigate("/assistencias/saude/pagamento", { state: { plano } });
  };

  const linhas = [
    { label: "Nome completo", value: user?.name ?? "—", type: "text" as const },
    { label: "CPF", value: user?.cpf ?? "—", type: "cpf" as const },
    { label: "Celular", value: celular, type: "phone" as const },
  ];

  return (
    <SubPageLayout title="Confirme seus dados" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <IdentificationCard size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Confirme seus dados</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plano {plano.nome} · {plano.precoMes} por mês
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm">
          {linhas.map((linha, i) => (
            <div
              key={linha.label}
              className={`flex items-center justify-between px-4 py-3 ${i < linhas.length - 1 ? "border-b border-border" : ""}`}
            >
              <p className="text-xs text-muted-foreground">{linha.label}</p>
              <SensitiveData value={linha.value} type={linha.type} />
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={aceitouTermos}
              onCheckedChange={(v) => setAceitouTermos(v === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed text-foreground">
              Li e aceito os termos da assinatura de assistência à saúde BeneMed.
            </span>
          </label>
          <p className="text-xs leading-relaxed text-muted-foreground">
            A BeneMed Cuidado não é um plano de saúde e não cobre atendimentos de urgência ou
            emergência. Consultas e exames presenciais são pagos à parte, com desconto.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button
          className="h-14 w-full rounded-full"
          disabled={!aceitouTermos}
          onClick={avancar}
        >
          Avançar
        </Button>
      </div>
    </SubPageLayout>
  );
}
