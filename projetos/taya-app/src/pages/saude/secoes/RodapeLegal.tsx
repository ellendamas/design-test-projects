import { RODAPE_LEGAL_CONTEUDO } from "@/data/saudeConteudo";
import type { ModoSaudeProduto } from "@/data/saudeConteudo";

export function RodapeLegal({ modo }: { modo: ModoSaudeProduto }) {
  return (
    <footer className="space-y-2 pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
      <p>{RODAPE_LEGAL_CONTEUDO.linhaLegal}</p>
      {modo === "publica" && (
        <>
          <p>{RODAPE_LEGAL_CONTEUDO.razaoSocialPublico}</p>
          <p className="flex justify-center gap-3">
            <a href="/politica-de-privacidade" className="underline">
              Política de Privacidade
            </a>
            <a href="/termos" className="underline">
              Termos
            </a>
          </p>
        </>
      )}
    </footer>
  );
}
