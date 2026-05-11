import type { ReactNode } from "react";

export function Dialog({ open, children }: { open: boolean; onOpenChange?: (open: boolean) => void; children: ReactNode }) {
  if (!open) return null;
  return <>{children}</>;
}

export function DialogContent({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className={`absolute left-1/2 top-1/2 w-[92vw] -translate-x-1/2 -translate-y-1/2 bg-white ${className}`}>{children}</div>
    </div>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ className = "", children }: { className?: string; children: ReactNode }) {
  return <h3 className={className}>{children}</h3>;
}
