import type { ReactNode } from "react";

// Wrapper de tela sem moldura de celular — conteúdo ocupa a viewport inteira, sem chrome de
// dispositivo. Cada tela em si continua pensada mobile-first (largura de conteúdo, etc).
export function Shell({ children, navBar }: { children: ReactNode; navBar?: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto">{children}</div>
      {navBar}
    </div>
  );
}
