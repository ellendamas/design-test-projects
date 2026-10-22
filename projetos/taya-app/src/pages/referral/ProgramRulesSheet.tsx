import { useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// IG-03 — "Regras do programa", bottom sheet no mobile / dialog no desktop, mesmo padrão
// responsivo de TermosModal.tsx. Conteúdo estático (só o estado "default" existe na spec).
const REGRAS = [
  "Você recebe 10% do valor da primeira mensalidade paga por quem contratar a BeneMed pelo seu link. Individual: R$ 3,99. Familiar: R$ 5,39.",
  "A comissão vale só para a primeira mensalidade, não para as seguintes.",
  "A comissão é liberada depois que o primeiro pagamento é confirmado e o prazo de segurança termina.",
  "Se a pessoa cancelar ou pedir reembolso antes disso, a comissão é cancelada.",
  "Indique só para quem tem interesse e não prometa o que a BeneMed não oferece: ela não é plano de saúde.",
  "Contratar a BeneMed é opcional e não depende de crédito nem de qualquer outro produto da Pode Já.",
  // Escondido a pedido da Ellen (22/10) até confirmar a regra de prazo de pagamento da
  // comissão — mantido no código, só não é exibido na tela.
  // "Como e quando você recebe: [A CONFIRMAR].",
];

export function ProgramRulesSheet({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const botaoRef = useRef<HTMLButtonElement>(null);

  if (isDesktop) {
    return (
      <Dialog open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={onFechar} />
          <DialogHeader>
            <DialogTitle>Regras do programa</DialogTitle>
          </DialogHeader>
          <RegrasConteudo />
          <RegrasFooter onFechar={onFechar} botaoRef={botaoRef} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Regras do programa</DrawerTitle>
        </DrawerHeader>
        <RegrasConteudo />
        <RegrasFooter onFechar={onFechar} botaoRef={botaoRef} />
      </DrawerContent>
    </Drawer>
  );
}

function RegrasConteudo() {
  return (
    <ul className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed text-foreground">
      {REGRAS.map((regra) => (
        <li key={regra} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FD5F31]" />
          <span>{regra}</span>
        </li>
      ))}
    </ul>
  );
}

function RegrasFooter({ onFechar, botaoRef }: { onFechar: () => void; botaoRef: React.RefObject<HTMLButtonElement> }) {
  return (
    <div className="mt-4 shrink-0 border-t border-border pt-4">
      <button
        ref={botaoRef}
        type="button"
        autoFocus
        onClick={onFechar}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#FD5F31] text-sm font-semibold text-white"
      >
        Entendi
      </button>
    </div>
  );
}
