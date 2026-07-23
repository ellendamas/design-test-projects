import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";

export type ErrorCategoria =
  | "otp_invalido"
  | "otp_expirado"
  | "otp_max_tentativas"
  | "conta_invalida"
  | "titularidade"
  | "banco_indisponivel"
  | "biometria_falhou"
  | "documento_invalido"
  | "sessao_expirada"
  | "fraude_ou_sensivel"
  | "operacional"
  | "desconhecido";

export const ERROS: Record<ErrorCategoria, { headline: string; subtitulo: string }> = {
  otp_invalido: {
    headline: "Código incorreto",
    subtitulo: "Confira o código que enviamos por SMS e tente novamente.",
  },
  otp_expirado: {
    headline: "Código expirou",
    subtitulo: "Solicite um novo código para continuar.",
  },
  otp_max_tentativas: {
    headline: "Muitas tentativas",
    subtitulo: "Aguarde 15 minutos antes de tentar de novo.",
  },
  conta_invalida: {
    headline: "Conta não foi cadastrada",
    subtitulo: "Confira agência, conta e dígito — depois tente outra conta.",
  },
  titularidade: {
    headline: "Conta fora da titularidade",
    subtitulo: "Use uma conta em que você seja o titular.",
  },
  banco_indisponivel: {
    headline: "Banco fora do ar",
    subtitulo: "O sistema do banco está indisponível. Tente outro banco.",
  },
  biometria_falhou: {
    headline: "Não conseguimos confirmar sua identidade",
    subtitulo: "A biometria não bateu. Vamos tentar de novo?",
  },
  documento_invalido: {
    headline: "Documento não foi aceito",
    subtitulo: "Garanta que o documento está legível e tente novamente.",
  },
  sessao_expirada: {
    headline: "Sessão de assinatura expirou",
    subtitulo: "Inicie a assinatura novamente.",
  },
  fraude_ou_sensivel: {
    headline: "Não foi possível continuar",
    subtitulo: "Detectamos algo que precisa de verificação. Fale com nosso suporte.",
  },
  operacional: {
    headline: "Tivemos um problema",
    subtitulo: "Tente novamente em alguns instantes.",
  },
  desconhecido: {
    headline: "Algo deu errado",
    subtitulo: "Tente novamente em alguns instantes.",
  },
};

type ErrorScreenProps = {
  categoria: ErrorCategoria;
  onTentarNovamente?: () => void;
  labelBotao?: string;
  /** inline=true → card com borda (dentro da página). inline=false (default) → min-h-[60vh] centralizado. */
  inline?: boolean;
  /** compact=true → só o conteúdo, sem wrapper e sem padding interno. Use dentro de modais. */
  compact?: boolean;
};

export function ErrorScreen({
  categoria,
  onTentarNovamente,
  labelBotao = "Tentar novamente",
  inline = false,
  compact = false,
}: ErrorScreenProps) {
  const erro = ERROS[categoria];

  const conteudo = (
    <div className={`flex flex-col items-center text-center gap-3 ${compact ? "" : "p-6"}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
        <WarningCircle size={28} className="text-[#FD5F31]" />
      </div>
      <p className="text-base font-semibold text-foreground">{erro.headline}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{erro.subtitulo}</p>
      {onTentarNovamente && (
        <button
          type="button"
          onClick={onTentarNovamente}
          className="flex h-11 items-center gap-2 rounded-full border border-[#FD5F31] px-5 text-sm font-semibold text-[#FD5F31] mt-2"
        >
          <ArrowClockwise size={16} />
          {labelBotao}
        </button>
      )}
    </div>
  );

  if (compact) return conteudo;

  if (inline) {
    return (
      <div className="rounded-2xl border border-border bg-white shadow-sm">{conteudo}</div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">{conteudo}</div>
  );
}
