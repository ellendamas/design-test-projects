import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/Logo";

// Layout para telas públicas (sem login) da jornada Leilão CLT — só a marca
// no header, sem sino/olho/avatar/nav, já que não existe conta pra gerenciar
// nesse ponto da jornada. Header transparente com logo centralizada, estático
// no topo (não acompanha o scroll). O rodapé de CTAs, quando existe, fica
// sempre fixo na borda inferior da viewport — renderizado via portal direto
// no body, pois o wrapper de transição de página (motion.div com transform)
// cria um novo containing block e quebra position:fixed se o rodapé ficar
// dentro dele.
export function PublicLayout({
  children,
  footer,
  footerTransparente = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** true remove o fundo branco do rodapé fixo (ex: telas com CTA sobre o próprio conteúdo) */
  footerTransparente?: boolean;
}) {
  return (
    <div className="min-h-screen w-full bg-background">
      <header className="flex justify-center bg-transparent px-4 py-4 md:px-8">
        <Logo size="md" />
      </header>
      <main className={`mx-auto w-full max-w-[560px] px-4 py-6 md:px-0 ${footer ? "pb-28" : ""}`}>
        {children}
      </main>
      {footer &&
        createPortal(
          <div
            className={`fixed bottom-0 left-0 right-0 z-10 p-4 ${
              footerTransparente ? "bg-transparent" : "border-t border-border bg-white"
            }`}
          >
            <div className="mx-auto w-full max-w-[560px] space-y-2">{footer}</div>
          </div>,
          document.body
        )}
    </div>
  );
}
