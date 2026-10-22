import { useEffect, useRef, type ReactNode } from "react";
import { X } from "@phosphor-icons/react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Esc fecha, Tab/Shift+Tab ficam presos dentro do diálogo (sem escapar pro resto da página) e a
// rolagem do body trava enquanto está aberto — nenhum dos 10 lugares que usam este componente
// dependia de conseguir tabular pra fora ou rolar a página atrás, então isso é só aditivo. Foco
// volta pro elemento que abriu o diálogo ao fechar.
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focarPrimeiroElemento = () => {
      const el = containerRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      el?.focus();
    };
    // Espera o conteúdo montar (children variam por consumidor) antes de focar.
    const raf = window.requestAnimationFrame(focarPrimeiroElemento);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange?.(false);
        return;
      }
      if (e.key !== "Tab" || !containerRef.current) return;
      const focaveis = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focaveis.length === 0) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => onOpenChange?.(false)}
    >
      {children}
    </div>
  );
}

export function DialogContent({
  className = "",
  children,
  footer,
}: {
  className?: string;
  children: ReactNode;
  /** Quando informado, fica fixo embaixo (fora da área que rola) — só `children` rola. Sem
   * `footer`, o comportamento é o de sempre: tudo (header + conteúdo) num único bloco que rola
   * junto, como os outros 9 lugares que usam este componente já esperam. */
  footer?: ReactNode;
}) {
  if (footer) {
    return (
      <div
        className={`relative flex w-full max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        <div className="shrink-0 border-t border-border p-6 pt-4">{footer}</div>
      </div>
    );
  }
  return (
    <div
      className={`relative w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-5">{children}</div>;
}

export function DialogTitle({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h3>
  );
}

export function DialogClose({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
    >
      <X size={16} />
    </button>
  );
}
