import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import { Card } from "@/components/ui/card";

export function FaqAcordeon({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <Card key={item.pergunta} className="overflow-hidden rounded-[14px] border-border bg-white shadow-sm">
          <button
            onClick={() => setOpen(open === idx ? null : idx)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-medium leading-5 text-foreground">{item.pergunta}</span>
            <CaretDown size={16} className={`shrink-0 text-muted-foreground transition-transform ${open === idx ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open === idx ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-xs leading-5 text-muted-foreground">{item.resposta}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Card>
      ))}
    </div>
  );
}
