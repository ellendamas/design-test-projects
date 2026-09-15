import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

// Layout para telas públicas (sem login) da jornada Leilão CLT — só a marca
// no header, sem sino/olho/avatar/nav, já que não existe conta pra gerenciar
// nesse ponto da jornada. Mesmo padrão visual do header de /cadastro e /acesso.
export function PublicLayout({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-white px-4 py-4 md:px-8">
        <Logo size="md" />
      </header>
      <main className={`mx-auto w-full max-w-[560px] px-4 py-6 md:px-0 ${footer ? "pb-28" : ""}`}>
        {children}
      </main>
      {footer && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-white p-4">
          <div className="mx-auto w-full max-w-[560px] space-y-2">{footer}</div>
        </div>
      )}
    </div>
  );
}
