import { useNavigate } from "react-router-dom";
import { Bank, Coins, House, SquaresFour, UserCircle } from "@phosphor-icons/react";

// `path: null` — Carteira/Conta não têm tela construída nesse benchmark. Ficam visíveis (o
// benchmark é sobre arquitetura de IA, não sobre essas duas seções) mas com aparência
// desabilitada, em vez de navegar pra um 404.
const ITEMS = [
  { label: "Início", icon: House, path: "/benchmark/a/dashboard" },
  { label: "Serviços", icon: SquaresFour, path: "/benchmark/a/servicos" },
  { label: "Carteira", icon: Bank, path: null },
  { label: "Pontos", icon: Coins, path: "/benchmark/a/pontos" },
  { label: "Conta", icon: UserCircle, path: null },
];

// Nav bar densa do Grupo A — 5 itens, tudo exposto, nada atrás de conversa.
export function BottomNavA({ ativo }: { ativo: string }) {
  const navigate = useNavigate();

  return (
    <nav className="grid shrink-0 grid-cols-5 border-t border-border bg-white px-1 py-2">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isAtivo = item.label === ativo;
        const desabilitado = item.path === null;
        return (
          <button
            key={item.label}
            type="button"
            disabled={desabilitado}
            onClick={() => item.path && navigate(item.path)}
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium ${
              desabilitado ? "text-muted-foreground/40" : isAtivo ? "text-primary" : "text-muted-foreground"
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
