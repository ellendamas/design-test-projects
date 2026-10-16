import { Link, Route, Routes } from "react-router-dom";
import { Logo } from "@/components/Logo";
import A1Dashboard from "./a/A1Dashboard";
import A2Servicos from "./a/A2Servicos";
import A3Pontos from "./a/A3Pontos";
import B1Dashboard from "./B1Dashboard";
import B2Servicos from "./B2Servicos";
import B3Pontos from "./B3Pontos";

const GRUPOS = [
  {
    titulo: "Grupo A — Alipay arquitetura",
    sub: "Dashboard denso, tudo exposto, nada escondido em menus.",
    telas: [
      { path: "/benchmark/a/dashboard", nome: "A1 — Dashboard" },
      { path: "/benchmark/a/servicos", nome: "A2 — Hub de serviços/parceiros" },
      { path: "/benchmark/a/pontos", nome: "A3 — Pontos e gamificação" },
    ],
  },
  {
    titulo: "Grupo B — Alipay futuro / conversacional",
    sub: "Interface conversacional com IA (Jade) no centro.",
    telas: [
      { path: "/benchmark/b/dashboard", nome: "B1 — Dashboard conversacional" },
      { path: "/benchmark/b/servicos", nome: "B2 — Hub de serviços via conversa" },
      { path: "/benchmark/b/pontos", nome: "B3 — Pontos e gamificação conversacional" },
    ],
  },
];

function Indice() {
  return (
    <div className="mx-auto min-h-screen max-w-xl space-y-8 p-8">
      <div className="flex items-center gap-3">
        <Logo size="md" />
        <div>
          <h1 className="text-lg font-bold text-foreground">Benchmark visual</h1>
          <p className="text-xs text-muted-foreground">Protótipo interno — não faz parte do app Pode Já.</p>
        </div>
      </div>

      {GRUPOS.map((grupo) => (
        <div key={grupo.titulo} className="space-y-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{grupo.titulo}</h2>
            <p className="text-xs text-muted-foreground">{grupo.sub}</p>
          </div>
          <div className="space-y-2">
            {grupo.telas.map((tela) => (
              <Link
                key={tela.path}
                to={tela.path}
                className="block rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground shadow-card transition-colors hover:border-primary/40"
              >
                {tela.nome}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Entry point isolado do benchmark visual — nunca importado por src/App.tsx. Montado por
// src/benchmark/main-benchmark.tsx via benchmark.html (ver nota lá sobre como o Vite serve
// esse HTML extra sem precisar mexer na config de build).
export default function BenchmarkApp() {
  return (
    <Routes>
      <Route path="/benchmark" element={<Indice />} />
      <Route path="/benchmark/a/dashboard" element={<A1Dashboard />} />
      <Route path="/benchmark/a/servicos" element={<A2Servicos />} />
      <Route path="/benchmark/a/pontos" element={<A3Pontos />} />
      <Route path="/benchmark/b/dashboard" element={<B1Dashboard />} />
      <Route path="/benchmark/b/servicos" element={<B2Servicos />} />
      <Route path="/benchmark/b/pontos" element={<B3Pontos />} />
      <Route path="*" element={<Indice />} />
    </Routes>
  );
}
