import { ChatCircle, Headset } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { FAQ, FAQ_CATEGORIAS } from "@/data/faq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChat } from "@/context/ChatContext";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function DuvidasPage() {
  const { naoLidas, abrirChat } = useChat();

  return (
    <SubPageLayout title="Dúvidas">
      <div className="space-y-6 pb-24">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Headset size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">Como podemos ajudar?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Reunimos as perguntas mais comuns. Se ainda ficar alguma dúvida, fale com a gente.
            </p>
          </div>
        </div>

        {/* FAQ por produto */}
        {Object.entries(FAQ).map(([chave, perguntas]) => (
          <div key={chave} className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {FAQ_CATEGORIAS[chave]}
            </p>
            <Accordion type="single" collapsible className="space-y-2">
              {perguntas.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`${chave}-${i}`}
                  className="rounded-xl border border-border bg-white px-4 shadow-sm"
                >
                  <AccordionTrigger className="py-4 text-left text-sm font-medium text-foreground">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Box de atendimento — mesmo layout do card da dashboard, abre o chat global (ChatBubble) */}
        <Card className="overflow-hidden rounded-3xl border-border shadow-sm">
          <CardContent className="p-0">
            <div className="flex min-h-[140px] items-stretch bg-[#EDE3DC]">
              <div className="flex flex-1 flex-col justify-center px-5 py-4">
                <p className="text-sm font-semibold leading-tight text-foreground">Ainda com dúvidas?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nosso time atende de segunda a sexta, das 8h às 18h.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={abrirChat}
                    className="relative h-9 gap-1.5 rounded-lg border-border bg-[#ECEEF1] text-sm font-medium text-foreground hover:bg-[#E6E8EB]"
                  >
                    <ChatCircle size={18} />
                    Acessar atendimento
                    {naoLidas > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FD5F31] text-[11px] font-bold text-white">
                        {naoLidas}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <div className="relative w-44 shrink-0 self-stretch">
                <img
                  src="/images/card-dash-contact.png"
                  alt="Atendente Pode Já."
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </SubPageLayout>
  );
}
