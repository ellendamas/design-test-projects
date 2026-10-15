import { Sparkle } from "@phosphor-icons/react";

// Avatar da Jade, a IA conversacional do Grupo B — só pra esse benchmark, não é um
// personagem real do app hoje. `glow` liga uma sombra colorida mais marcada (pra leitura de
// "personagem", não botão genérico) — opcional e desligada por padrão, pra não mudar a
// aparência em B2/B3, que não passam essa prop.
export function JadeAvatar({
  size = 36,
  className = "",
  glow = false,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FD5F31] to-[#FA9832] text-white ${
        glow ? "shadow-[0_8px_24px_rgba(253,95,49,0.45)]" : "shadow-sm"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <Sparkle size={size * 0.55} weight="fill" />
    </div>
  );
}
