import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Fingerprint, Camera, ShieldCheck, FileText } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    valor = 10000,
    prazo = 36,
    taxaMensal = 3.48,
    ...restState
  } = (location.state as Record<string, unknown> & {
    valor?: number;
    prazo?: number;
    taxaMensal?: number;
  }) ?? {};

  const [unicoLogoError, setUnicoLogoError] = useState(false);

  const handleContinuar = () => {
    // TODO: integrar SDK Unico para biometria facial real
    navigate("/consignado-clt/confirmacao", {
      state: { ...location.state, valor, prazo, taxaMensal, ...restState, biometriaOk: true },
    });
  };

  const unicoItens = [
    { icon: ShieldCheck, titulo: "Ambiente seguro",   desc: "Verificação criptografada" },
    { icon: Camera,      titulo: "Selfie rápida",     desc: "Menos de 1 minuto"         },
    { icon: FileText,    titulo: "Assinatura digital", desc: "Válida juridicamente"      },
  ];

  return (
    <SubPageLayout title="Verificação de identidade">
      <div className="space-y-4 pb-32">

        {/* Card principal */}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center">

            {/* Logo Unico com fallback */}
            <div className="flex h-10 items-center justify-center">
              {!unicoLogoError ? (
                <img
                  src="/images/unico-logo.png"
                  alt="Unico"
                  className="h-8 object-contain"
                  onError={() => setUnicoLogoError(true)}
                />
              ) : (
                <span className="text-lg font-semibold text-foreground">unico</span>
              )}
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Verificação de identidade
            </p>

            <h2 className="text-xl font-semibold text-foreground">
              Você será direcionado para o ambiente seguro da Unico
            </h2>

            <p className="text-sm leading-relaxed text-muted-foreground">
              A Unico é nossa parceira de verificação de identidade. O processo acontece
              inteiramente no ambiente deles — seguro, rápido e regulamentado.
            </p>
          </div>
        </div>

        {/* Card com os 3 itens */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="divide-y divide-border">
            {unicoItens.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7]">
                  <Icon size={20} className="text-[#E8590A]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{titulo}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nota LGPD */}
        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          Ao continuar, você será redirecionado para o app/ambiente da Unico.
          Seus dados são protegidos conforme a LGPD.
        </p>

      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <button
          type="button"
          onClick={handleContinuar}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08]"
        >
          <Fingerprint size={20} />
          Continuar para verificação
        </button>
      </div>
    </SubPageLayout>
  );
}
