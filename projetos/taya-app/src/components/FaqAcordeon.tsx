import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type FaqItem = {
  q: string;
  a: string;
  /** Âncora estável, usada quando a pergunta precisa ser referenciada de fora da lista (ex:
   * `faq-presencial` na página de Saúde). Opcional — os usos antigos não precisam ter. */
  id?: string;
};

type FaqAcordeonProps = {
  items: FaqItem[];
  /** Quando definido, só as primeiras N perguntas aparecem de início, com um botão "Ver mais
   * perguntas" abaixo da lista que revela o resto na mesma lista (vira "Ver menos perguntas").
   * Sem esse prop, o comportamento é o de sempre: todas as perguntas, sem botão. */
  visibleCount?: number;
};

export default function FaqAcordeon({ items, visibleCount }: FaqAcordeonProps) {
  const [open, setOpen] = useState<number | null>(null);
  const [expandido, setExpandido] = useState(visibleCount === undefined);

  const temMais = visibleCount !== undefined && visibleCount < items.length;
  const visiveis = temMais && !expandido ? items.slice(0, visibleCount) : items;

  return (
    <div className="space-y-2">
      {visiveis.map((item, i) => (
        <Card key={item.id ?? i} id={item.id} className="border-border">
          <CardContent className="p-0">
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="text-sm font-medium text-foreground">{item.q}</span>
              <CaretDown size={16} className={`transition-transform text-muted-foreground ${open === i ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden px-4 pb-4 text-xs leading-relaxed text-muted-foreground"
                >
                  {item.a}
                </motion.p>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
      {temMais && (
        <button
          type="button"
          onClick={() => setExpandido((v) => !v)}
          className="flex min-h-[44px] w-full items-center justify-center text-sm font-semibold text-[#FD5F31]"
        >
          {expandido ? "Ver menos perguntas" : "Ver mais perguntas"}
        </button>
      )}
    </div>
  );
}
