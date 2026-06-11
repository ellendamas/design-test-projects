import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Camera,
  FileText,
  Fingerprint,
  ShieldCheck,
} from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type SubPasso = "unico_intro" | "biometria";

interface ParcelaFGTS {
  ano: number;
  data: string;
  valorLiberado: number;
}

interface AssinaturaState {
  valorTotalReceber?: number;
  totalADescontar?: number;
  taxaMensal?: number;
  numParcelas?: number;
  parcelas?: ParcelaFGTS[];
  dadosPessoais?: {
    rg?: string;
    orgaoEmissor?: string;
    estadoEmissor?: string;
    celular?: string;
    dataNascimento?: string;
  };
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    cidade?: string;
    cep?: string;
    estado?: string;
  };
  banco?: {
    nome?: string;
    agencia?: string;
    conta?: string;
    digito?: string;
  };
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function FGTSAssinaturaPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as AssinaturaState) ?? {};
  const {
    valorTotalReceber = 2800,
    numParcelas = 3,
    taxaMensal = 1.99,
    parcelas = [] as ParcelaFGTS[],
    banco = {},
    ...restState
  } = state;

  const [subPasso, setSubPasso] = useState<SubPasso>("unico_intro");
  const [unicoLogoError, setUnicoLogoError] = useState(false);

  // Sub-passo biometria — mock: 1.5s e navega para confirmação
  useEffect(() => {
    if (subPasso !== "biometria") return;
    // TODO: integrar SDK Unico para biometria facial real
    const timer = setTimeout(() => {
      navigate("/fgts/confirmacao", {
        state: {
          ...state,
          valorTotalReceber,
          numParcelas,
          taxaMensal,
          parcelas,
          banco,
          biometriaOk: true,
          ...restState,
        },
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, [subPasso]); // eslint-disable-line react-hooks/exhaustive-deps

  const unicoItens = [
    { icon: ShieldCheck, titulo: "Ambiente seguro",    desc: "Verificação criptografada" },
    { icon: Camera,      titulo: "Selfie rápida",      desc: "Menos de 1 minuto"         },
    { icon: FileText,    titulo: "Assinatura digital", desc: "Válida juridicamente"       },
  ];

  return (
    <SubPageLayout title="Verificação de identidade">
      <div className="space-y-4 pb-32">

        {/* ── Sub-passo: unico_intro ── */}
        {subPasso === "unico_intro" && (
          <>
            {/* Card principal */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center gap-4 text-center">
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

            <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
              <button
                type="button"
                onClick={() => setSubPasso("biometria")}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08] active:scale-[0.98]"
              >
                <Fingerprint size={20} />
                Continuar para verificação
              </button>
            </div>
          </>
        )}

        {/* ── Sub-passo: biometria (mock automático) ── */}
        {subPasso === "biometria" && (
          <div className="flex flex-col items-center gap-6 pt-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF0E7]">
              <Fingerprint size={40} className="animate-pulse text-[#E8590A]" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Verificando identidade...</p>
              <p className="text-sm text-muted-foreground">Aguarde um instante</p>
            </div>
          </div>
        )}

      </div>
    </SubPageLayout>
  );
}
