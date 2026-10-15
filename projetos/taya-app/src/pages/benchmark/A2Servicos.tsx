import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavA } from "./components/BottomNavA";
import { ICON_MAP } from "./components/iconMap";
import { CATEGORIAS_SERVICOS, PARCEIROS } from "./mockData";

// A2 — Hub de serviços/parceiros do Grupo A: busca + filtros por categoria sempre visíveis,
// grid de categorias e lista de parceiros expostos de uma vez, sem esconder nada atrás de chat.
export default function A2Servicos() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);

  const parceirosFiltrados = PARCEIROS.filter((p) => {
    const bateCategoria = !categoriaAtiva || p.categoria === categoriaAtiva;
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    return bateCategoria && bateBusca;
  });

  return (
    <Shell navBar={<BottomNavA ativo="Serviços" />}>
      <div className="space-y-5 p-4 pb-6">
        <h1 className="text-lg font-bold text-foreground">Serviços e parceiros</h1>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5 shadow-card">
          <MagnifyingGlass size={16} className="text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar parceiro ou categoria"
            className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {CATEGORIAS_SERVICOS.map((cat) => {
            const Icon = ICON_MAP[cat.icone];
            const ativa = categoriaAtiva === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaAtiva(ativa ? null : cat.id)}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-colors ${
                  ativa ? "border-primary bg-primary-light" : "border-border bg-white"
                }`}
              >
                <Icon size={26} className={ativa ? "text-primary" : "text-foreground"} />
                <span className="text-[11px] font-medium text-foreground">{cat.nome}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {["Todas", ...CATEGORIAS_SERVICOS.map((c) => c.nome)].map((label, i) => {
            const id = i === 0 ? null : CATEGORIAS_SERVICOS[i - 1].id;
            const ativo = categoriaAtiva === id;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setCategoriaAtiva(id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                  ativo ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Parceiros</h3>
          {parceirosFiltrados.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">Nenhum parceiro encontrado.</p>
          )}
          {parceirosFiltrados.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                {p.nome[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{p.nome}</p>
                <p className="text-[10px] text-muted-foreground">
                  {CATEGORIAS_SERVICOS.find((c) => c.id === p.categoria)?.nome}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-semibold text-primary">
                {p.oferta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
