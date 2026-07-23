import { useState } from "react";
import { Camera, FileText, Fingerprint, ShieldCheck } from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type UnicoItem = {
  icon: React.ElementType;
  titulo: string;
  desc: string;
};

type UnicoNoticeProps = {
  titulo?: string;
  descricao?: string;
  itens?: UnicoItem[];
  labelBotao?: string;
  onContinuar: () => void;
};

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_ITENS: UnicoItem[] = [
  { icon: ShieldCheck, titulo: "Ambiente seguro",    desc: "Verificação criptografada" },
  { icon: Camera,      titulo: "Selfie rápida",      desc: "Menos de 1 minuto"         },
  { icon: FileText,    titulo: "Assinatura digital", desc: "Válida juridicamente"       },
];

const DEFAULT_TITULO =
  "Você será direcionado para o ambiente seguro da Unico";

const DEFAULT_DESCRICAO =
  "A Unico é nossa parceira de verificação de identidade. O processo acontece inteiramente no ambiente deles — seguro, rápido e regulamentado.";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function UnicoNotice({
  titulo    = DEFAULT_TITULO,
  descricao = DEFAULT_DESCRICAO,
  itens     = DEFAULT_ITENS,
  labelBotao = "Continuar para verificação",
  onContinuar,
}: UnicoNoticeProps) {
  const [unicoLogoError, setUnicoLogoError] = useState(false);

  return (
    <>
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

            <h2 className="text-xl font-semibold text-foreground">{titulo}</h2>

            <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
          </div>
        </div>

        {/* Card com itens de benefícios */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="divide-y divide-border">
            {itens.map(({ icon: Icon, titulo: t, desc }) => (
              <div key={t} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE]">
                  <Icon size={20} className="text-[#FD5F31]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t}</p>
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
          onClick={onContinuar}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-base font-semibold text-white transition-colors hover:bg-[#d04e08]"
        >
          <Fingerprint size={20} />
          {labelBotao}
        </button>
      </div>
    </>
  );
}
