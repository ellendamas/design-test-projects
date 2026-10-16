import { useState } from "react";
import { MagnifyingGlass, Star } from "@phosphor-icons/react";
import { Shell } from "../components/Shell";
import { ProtoBadge } from "./components/ProtoBadge";
import { BottomNavA } from "./components/BottomNavA";
import { ICON_MAP_A } from "./iconMap";
import { CATEGORIAS_GRID_A2, CHIPS_CATEGORIA, EM_ALTA, PARCEIROS_A2 } from "./mock";

// A2 — Hub de serviços/parceiros da Versão A. Guardrail 1: a linha de Crédito Pessoal não tem
// selo, nota nem contagem de uso — só o CTA "Simular", sem nenhuma pressão promocional.
export default function A2Servicos() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  const parceirosFiltrados = PARCEIROS_A2.filter((p) => {
    const bateCategoria = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
    const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    return bateCategoria && bateBusca;
  });

  return (
    <Shell navBar={<BottomNavA ativo="Serviços" />}>
      <ProtoBadge />
      <div className="space-y-5 p-4 pb-6">
        <h1 className="text-lg font-bold text-foreground">Serviços e parceiros</h1>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2.5">
          <MagnifyingGlass size={16} className="text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar parceiro ou categoria"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {CHIPS_CATEGORIA.map((cat) => {
            const ativo = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={`flex h-11 shrink-0 items-center rounded-full border px-3.5 text-xs font-medium ${
                  ativo ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-4">
          {CATEGORIAS_GRID_A2.map((cat) => {
            const Icon = ICON_MAP_A[cat.icone];
            const ativo = categoriaAtiva === cat.nome;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaAtiva(cat.nome)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    ativo ? "bg-primary text-white" : "bg-primary-light text-primary"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span className="text-center text-xs font-medium leading-tight text-foreground">{cat.nome}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Em alta</h3>
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {EM_ALTA.map((e) => (
              <div key={e.id} className="w-[140px] shrink-0 rounded-xl border border-border bg-white p-3 shadow-card">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-sm font-bold text-muted-foreground">
                  {e.nome[0]}
                </div>
                <p className="mt-2 truncate text-sm font-semibold text-foreground">{e.nome}</p>
                <p className="text-xs text-muted-foreground">{e.categoria}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Parceiros</h3>
          {parceirosFiltrados.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum parceiro encontrado.</p>
          )}
          {parceirosFiltrados.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 shadow-card">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-muted-foreground">
                {p.nome[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.categoria}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {p.selo && (
                    <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">{p.selo}</span>
                  )}
                  {p.nota !== null && (
                    <span className="flex items-center gap-0.5 text-xs text-foreground">
                      <Star size={11} weight="fill" className="text-[#FFCC05]" />
                      {p.nota}
                    </span>
                  )}
                  {p.usoHoje && <span className="text-xs text-muted-foreground">{p.usoHoje}</span>}
                </div>
              </div>
              <button
                type="button"
                className="flex h-11 shrink-0 items-center rounded-full border border-primary px-3.5 text-xs font-semibold text-primary"
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
