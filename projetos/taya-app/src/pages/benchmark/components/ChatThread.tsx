import { useEffect, useRef } from "react";
import { JadeAvatar } from "./JadeAvatar";
import { useReducedMotion } from "../useReducedMotion";
import type { MensagemConversa } from "../mockData";
import "./chatBubbleAnimations.css";

// Renderizador de bolhas de chat compartilhado entre B1 (thread ao vivo) e B2 (transcrição
// somente-leitura no histórico) — a estilização de bolha (usuário/Jade/cards) é a mesma de
// antes, só ganhou o efeito de "subida" nas mensagens novas.
//
// `novosAPartirDe`: índice a partir do qual as mensagens são tratadas como "novas" nesse
// carregamento e animam com stagger; mensagens antes desse índice já estavam na tela (ou são
// de uma rodada anterior) e não reanimam. `variant="full"` é a tela cheia de chat (B1): tem
// scroll próprio e rola pro fim sozinha a cada mensagem nova. `variant="embedded"` é o uso
// dentro de um item de histórico (B2): sem scroll próprio (fica no fluxo normal da lista) e
// sem auto-scroll, pra não puxar a página inteira quando um item é expandido.
export function ChatThread({
  mensagens,
  novosAPartirDe = 0,
  variant = "full",
}: {
  mensagens: MensagemConversa[];
  novosAPartirDe?: number;
  variant?: "full" | "embedded";
}) {
  const reduced = useReducedMotion();
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "full") return;
    fimRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "end" });
  }, [mensagens.length, reduced, variant]);

  return (
    <div className={variant === "full" ? "min-h-0 flex-1 space-y-3 overflow-y-auto p-4" : "space-y-3 p-3"}>
      {mensagens.map((item, i) => {
        const ehNova = i >= novosAPartirDe;
        const animClass = !reduced && ehNova ? "benchmark-chat-bubble-rise" : "";
        const style = !reduced && ehNova ? { animationDelay: `${(i - novosAPartirDe) * 180}ms` } : undefined;

        if (item.autor === "usuario") {
          return (
            <div key={i} className={`flex justify-end ${animClass}`} style={style}>
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-xs text-white">
                {item.texto}
              </div>
            </div>
          );
        }
        if (item.autor === "jade") {
          return (
            <div key={i} className={`flex items-end gap-2 ${animClass}`} style={style}>
              <JadeAvatar size={24} />
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-xs text-foreground shadow-card">
                {item.texto}
              </div>
            </div>
          );
        }
        return (
          <div key={i} className={`flex items-start gap-2 ${animClass}`} style={style}>
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
                  <p className="mt-1 text-xs text-muted-foreground">{op.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
      {variant === "full" && <div ref={fimRef} />}
    </div>
  );
}
