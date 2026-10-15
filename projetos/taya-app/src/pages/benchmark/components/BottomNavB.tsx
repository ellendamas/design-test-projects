import { Bank, ChatCircleDots, House, UserCircle } from "@phosphor-icons/react";

const ITEMS = [
  { label: "Início", icon: House },
  { label: "Conversar", icon: ChatCircleDots },
  { label: "Carteira", icon: Bank },
  { label: "Conta", icon: UserCircle },
];

// Nav bar enxuta do Grupo B — 4 itens, "Conversar" é o acesso universal a tudo o resto.
export function BottomNavB({ ativo }: { ativo: string }) {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t border-border bg-white px-1 py-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isAtivo = item.label === ativo;
        return (
          <button
            key={item.label}
            type="button"
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${
              isAtivo ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={20} weight={isAtivo ? "fill" : "regular"} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
