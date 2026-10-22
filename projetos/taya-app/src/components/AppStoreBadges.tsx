import { AppleLogo, GooglePlayLogo } from "@phosphor-icons/react";
import { PARCEIRO_APP_STORE_URL, PARCEIRO_GOOGLE_PLAY_URL } from "@/config/parceiro";

// Compartilhado (não só da tela que pediu primeiro) porque é "aquele botão padrão usado em
// todos os lugares" que baixam o app do parceiro. Prompt 1e (22/10): os links reais já existem
// (PARCEIRO_APP_STORE_URL/PARCEIRO_GOOGLE_PLAY_URL em config/parceiro.ts) — trocou de toque que
// mostrava toast "Em breve" pra link de verdade, nova aba, sem alterar o visual.
export function AppStoreBadges() {
  return (
    <div className="flex gap-2">
      <a
        href={PARCEIRO_APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-white"
      >
        <AppleLogo size={22} weight="fill" />
        <span className="text-left leading-none">
          <span className="block text-[9px] text-white/70">Baixar na</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
      <a
        href={PARCEIRO_GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-white"
      >
        <GooglePlayLogo size={22} weight="fill" />
        <span className="text-left leading-none">
          <span className="block text-[9px] text-white/70">Disponível no</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
