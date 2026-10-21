import FaqAcordeon from "@/components/FaqAcordeon";
import { DUVIDAS_EXTRA, DUVIDAS_VISIVEIS } from "@/data/saudeConteudo";

const TODAS_AS_DUVIDAS = [...DUVIDAS_VISIVEIS, ...DUVIDAS_EXTRA];

export function Duvidas() {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-foreground">Ficou com alguma dúvida?</h2>
      <FaqAcordeon items={TODAS_AS_DUVIDAS} visibleCount={DUVIDAS_VISIVEIS.length} />
    </section>
  );
}
