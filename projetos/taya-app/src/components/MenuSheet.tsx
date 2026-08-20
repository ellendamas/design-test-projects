import { useNavigate } from "react-router-dom";
import { CaretRight, Coins } from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMenuSheet } from "@/context/MenuSheetContext";

const ITENS_MENU = [
  { icon: <Coins size={20} />, label: "seubônus", path: "/seubolso" },
];

export function MenuSheet() {
  const navigate = useNavigate();
  const { aberto, fecharMenu } = useMenuSheet();

  return (
    <Drawer open={aberto} onOpenChange={(o) => { if (!o) fecharMenu(); }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Menu</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-1 pb-6">
          {ITENS_MENU.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => { fecharMenu(); navigate(item.path); }}
              className="flex w-full items-center justify-between border-b border-border py-3 text-left last:border-b-0"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-foreground">
                <span className="text-[#FD5F31]">{item.icon}</span>
                {item.label}
              </span>
              <CaretRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
