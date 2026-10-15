import { Sparkle } from "@phosphor-icons/react";

// Avatar da Jade, a IA conversacional do Grupo B — só pra esse benchmark, não é um
// personagem real do app hoje.
export function JadeAvatar({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FD5F31] to-[#FA9832] text-white shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <Sparkle size={size * 0.55} weight="fill" />
    </div>
  );
}
