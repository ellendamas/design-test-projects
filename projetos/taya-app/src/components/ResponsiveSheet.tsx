import type { ReactNode } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Padrão "modal no desktop (≥768px), drawer no celular (<768px)" — existia duplicado em
// TermosModal.tsx e ProgramRulesSheet.tsx, cada um com sua própria checagem de
// `useMediaQuery("(min-width: 768px)")` e ramificação Dialog/Drawer. Extraído aqui (Prompt 1g,
// 22/10) pra virar um componente só; TermosModal.tsx foi migrado pra usar este, sem mudar nada
// visível/comportamental pra quem já usa (CreditoPessoalDados.tsx). ProgramRulesSheet.tsx não
// foi migrado nesta rodada — segue com a própria implementação, candidato a uma próxima limpeza.
export function ResponsiveSheet({
  aberto,
  onFechar,
  titulo,
  subtitulo,
  children,
  footer,
  dialogClassName = "max-w-md",
  botaoFecharX = false,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  footer?: ReactNode;
  dialogClassName?: string;
  /** X no canto, só no modal de desktop — mesmo padrão que o TermosModal já tinha antes de
   * migrar pra este componente. O drawer nunca teve essa X (fecha arrastando ou tocando fora). */
  botaoFecharX?: boolean;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const subtituloNode = subtitulo ? (
    <p className="mt-0.5 text-xs text-muted-foreground">{subtitulo}</p>
  ) : null;

  if (isDesktop) {
    return (
      <Dialog open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
        <DialogContent className={dialogClassName} footer={footer}>
          {botaoFecharX && <DialogClose onClose={onFechar} />}
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {subtituloNode}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DrawerContent footer={footer}>
        <DrawerHeader>
          <DrawerTitle>{titulo}</DrawerTitle>
          {subtituloNode}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
