import type { ReactNode } from "react";
import { X } from "@phosphor-icons/react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
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
}: {
  className?: string;
  children: ReactNode;
}) {
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
