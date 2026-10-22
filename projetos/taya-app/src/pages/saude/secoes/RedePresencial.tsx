import { Scan, Sparkle, Stethoscope, Tooth, type Icon } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { REDE_PRESENCIAL_CONTEUDO } from "@/data/saudeConteudo";

const ICONE_POR_SLOT: Record<string, Icon> = {
  R1: Stethoscope,
  R2: Scan,
  R3: Sparkle,
  R4: Tooth,
};

// Grade 2x2 fixa (a v1 tinha 4 colunas no desktop, estourando o texto pra 11px) de Card branco
// com ícone em fundo pêssego — mesmo padrão dos outros blocos desta página, em vez da tile em
// degradê com texto branco que a v1 usava aqui.
export function RedePresencial() {
  return (
    <section>
      <h2 className="text-lg font-bold text-foreground">Na rede presencial, valor reduzido.</h2>
      <p className="mt-1 text-sm text-muted-foreground">{REDE_PRESENCIAL_CONTEUDO.subtitulo}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {REDE_PRESENCIAL_CONTEUDO.itens.map((item) => {
          const Icone = ICONE_POR_SLOT[item.slot] ?? Stethoscope;
          return (
            <Card key={item.slot} className="border-border bg-white">
              <CardContent className="p-3.5">
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE]">
                  <Icone size={22} className="text-[#FD5F31]" />
                </div>
                <p className="text-sm font-bold leading-tight text-foreground">{item.titulo}</p>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{item.exemplos}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{REDE_PRESENCIAL_CONTEUDO.nota}</p>
    </section>
  );
}
