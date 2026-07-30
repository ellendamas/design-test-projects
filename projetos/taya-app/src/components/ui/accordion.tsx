import { createContext, useContext, useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react";

type AccordionContextValue = {
  openValue: string | null;
  toggle: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<string | null>(null);

export function Accordion({
  type = "single",
  collapsible = true,
  className = "",
  children,
}: {
  type?: "single";
  collapsible?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [openValue, setOpenValue] = useState<string | null>(null);
  const toggle = (value: string) => {
    setOpenValue((prev) => (prev === value ? (collapsible ? null : prev) : value));
  };
  return (
    <AccordionContext.Provider value={{ openValue, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  className = "",
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={className}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || value === null) return null;
  const open = ctx.openValue === value;
  return (
    <button
      type="button"
      onClick={() => ctx.toggle(value)}
      className={`flex w-full items-center justify-between gap-3 ${className}`}
    >
      <span>{children}</span>
      <CaretDown
        size={16}
        className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function AccordionContent({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || value === null || ctx.openValue !== value) return null;
  return <div className={className}>{children}</div>;
}
