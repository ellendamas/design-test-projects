import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { JadeAvatar } from "./components/JadeAvatar";
import { CONVERSA_B2 } from "./mockData";

// B2 — "Hub de serviços" do Grupo B: não existe hub separado — tudo flui pela conversa com a
// Jade. Sem grid, sem lista de parceiros; as opções de produto aparecem como cards embutidos
// dentro da própria mensagem da IA.
export default function B2Servicos() {
  const [mensagem, setMensagem] = useState("");

  return (
    <Shell navBar={<BottomNavB ativo="Conversar" />}>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-border bg-white px-4 py-3">
          <JadeAvatar size={32} />
          <p className="text-sm font-semibold text-foreground">Jade</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {CONVERSA_B2.map((item, i) => {
            if (item.autor === "usuario") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-xs text-white">
                    {item.texto}
                  </div>
                </div>
              );
            }
            if (item.autor === "jade") {
              return (
                <div key={i} className="flex items-end gap-2">
                  <JadeAvatar size={24} />
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-xs text-foreground shadow-card">
                    {item.texto}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex items-start gap-2">
                <JadeAvatar size={24} />
                <div className="flex max-w-[85%] flex-col gap-2">
                  {item.opcoes.map((op) => (
                    <button
                      key={op.nome}
                      type="button"
                      className="rounded-2xl border border-border bg-white p-3 text-left shadow-card transition-colors hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">{op.nome}</p>
                        <p className="text-xs font-bold text-primary">{op.preco}</p>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{op.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-border bg-white p-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Converse com a Jade..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <PaperPlaneTilt size={13} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
