import type { ReactNode } from "react";

// Wrapper de tela sem moldura de celular — conteúdo ocupa a viewport inteira, sem chrome de
// dispositivo. Cada tela em si continua pensada mobile-first (largura de conteúdo, etc).
//
// h-screen (não min-h-screen) + min-h-0 no miolo: sem isso, um filho flex-1 com overflow-y-auto
// cresce pra caber todo o conteúdo em vez de respeitar a altura disponível (bug clássico de
// flexbox) — é o que fazia o nav bar não ficar fixo e, em telas de chat (Grupo B), o input
// ficar colado embaixo da última mensagem em vez de fixo na parte de baixo da viewport.
export function Shell({ children, navBar }: { children: ReactNode; navBar?: ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {navBar}
    </div>
  );
}
