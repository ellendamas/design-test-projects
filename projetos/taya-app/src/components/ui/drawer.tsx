import { Drawer as VaulDrawer } from "vaul";

export function Drawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <VaulDrawer.Root open={open} onOpenChange={onOpenChange} shouldScaleBackground>
      {children}
    </VaulDrawer.Root>
  );
}

export function DrawerContent({ children }: { children: React.ReactNode }) {
  return (
    <VaulDrawer.Portal>
      <VaulDrawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <VaulDrawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-white outline-none">
        {/* Handle */}
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted" />
        <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">{children}</div>
      </VaulDrawer.Content>
    </VaulDrawer.Portal>
  );
}

export function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-5">{children}</div>;
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-foreground">{children}</h3>;
}
