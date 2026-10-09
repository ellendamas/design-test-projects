import { AppleLogo, GooglePlayLogo } from "@phosphor-icons/react";
import { toast } from "sonner";

// Não existe ainda um botão padrão de "baixar o app" em nenhum outro lugar do produto — esse é
// o primeiro uso. Deixei como componente compartilhado (em vez de inline só na tela que pediu)
// pra já ficar pronto pra reuso, já que o pedido foi por "aquele botão padrão usado em todos os
// lugares". Sem link real de loja ainda — toque mostra um aviso, mesmo padrão do FakeDoorCTA.
export function AppStoreBadges() {
  const avisarEmBreve = () => toast("Em breve nas lojas de aplicativo.");

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={avisarEmBreve}
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-white"
      >
        <AppleLogo size={22} weight="fill" />
        <span className="text-left leading-none">
          <span className="block text-[9px] text-white/70">Baixar na</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </button>
      <button
        type="button"
        onClick={avisarEmBreve}
        className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-white"
      >
        <GooglePlayLogo size={22} weight="fill" />
        <span className="text-left leading-none">
          <span className="block text-[9px] text-white/70">Disponível no</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </button>
    </div>
  );
}
