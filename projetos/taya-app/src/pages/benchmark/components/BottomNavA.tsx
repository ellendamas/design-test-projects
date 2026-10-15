import { Bank, Coins, House, SquaresFour, UserCircle } from "@phosphor-icons/react";

const ITEMS = [
  { label: "Início", icon: House },
  { label: "Serviços", icon: SquaresFour },
  { label: "Carteira", icon: Bank },
  { label: "Pontos", icon: Coins },
  { label: "Conta", icon: UserCircle },
];

// Nav bar densa do Grupo A — 5 itens, tudo exposto, nada atrás de conversa.
export function BottomNavA({ ativo }: { ativo: string }) {
  return (
    <nav className="grid shrink-0 grid-cols-5 border-t border-border bg-white px-1 py-2">
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
