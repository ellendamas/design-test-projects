import type { ReactNode } from "react";

// Moldura de celular só pra deixar as 6 telas fáceis de comparar lado a lado numa tela de
// desktop (review de benchmark) — cada tela em si é pensada mobile-first.
export function Shell({ children, navBar }: { children: ReactNode; navBar?: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-[#E7E5E4] py-6">
      <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[2.5rem] border-8 border-[#231E19] bg-background shadow-app">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {children}
        </div>
        {navBar}
      </div>
    </div>
  );
}
