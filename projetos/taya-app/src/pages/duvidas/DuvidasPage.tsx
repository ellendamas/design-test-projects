import { ChatCircle, Headset } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { FAQ, FAQ_CATEGORIAS } from "@/data/faq";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

        {/* Box de atendimento — abre o chat global (ChatBubble), que persiste ao navegar */}
        <div className="space-y-3 rounded-2xl bg-[#FFF3EE] p-5 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FD5F31]">
              <Headset size={22} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Ainda com dúvidas?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nosso time atende de segunda a sexta, das 8h às 18h.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirChat}
            className="relative flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FD5F31] text-sm font-semibold text-white"
          >
            <ChatCircle size={18} />
            Acessar atendimento
            {naoLidas > 0 && (
              <span className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#FD5F31]">
                {naoLidas}
              </span>
            )}
          </button>
        </div>

      </div>
    </SubPageLayout>
  );
}
