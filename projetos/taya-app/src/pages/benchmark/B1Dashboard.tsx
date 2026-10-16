import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Shell } from "./components/Shell";
import { BottomNavB } from "./components/BottomNavB";
import { JadeAvatar } from "./components/JadeAvatar";
import { ChatThread } from "./components/ChatThread";
import { CONVERSAS_SUGESTAO, SAUDACAO_CONTEXTUAL_B1, SUGESTOES_CHAT, USUARIO, type MensagemConversa } from "./mockData";

// B1 — Dashboard conversacional do Grupo B, com duas fases na mesma tela (sem trocar de rota):
//
// 1) Apresentação — saudação grande centralizada (nome, pergunta, cutucão contextual) + chips,
//    igual ao design original (ref Claude.ai/Perplexity/ChatGPT). Visível enquanto `mensagens`
//    está vazio — ou seja, antes de qualquer clique ou envio.
// 2) Conversa — assim que o usuário clica numa sugestão ou manda uma mensagem, a apresentação
//    some e dá lugar à thread de chat com os balões (ChatThread, variant="full"), ocupando o
//    mesmo espaço que antes era da saudação. Chips e input continuam fixos embaixo o tempo
//    todo, nas duas fases.
//
// Clicar numa sugestão (ou mandar um texto livre que bata com uma delas) ADICIONA aquele
// roteiro à thread — não troca de rota. Texto livre sem match cai no roteiro de assistência
// como padrão. Mensagens novas sobem com stagger entre elas (ChatThread.tsx); novosAPartirDe
// marca onde termina o que já tava na tela e começa o lote novo, pra só esse lote animar.
export default function B1Dashboard() {
  const [mensagens, setMensagens] = useState<MensagemConversa[]>([]);
  const [novosAPartirDe, setNovosAPartirDe] = useState(0);
  const [mensagem, setMensagem] = useState("");

  const conversaIniciada = mensagens.length > 0;

  const abrirConversa = (sugestaoOuTexto: string) => {
    const roteiro = CONVERSAS_SUGESTAO[sugestaoOuTexto] ?? CONVERSAS_SUGESTAO["Contratar assistência"];
    setMensagens((prev) => {
      setNovosAPartirDe(prev.length);
      return [...prev, ...roteiro];
    });
  };

  const enviarMensagem = () => {
    if (!mensagem.trim()) return;
    abrirConversa(mensagem.trim());
    setMensagem("");
  };

  return (
    <Shell navBar={<BottomNavB ativo="Início" />}>
      <div className="flex h-full flex-col">
        {conversaIniciada ? (
          <ChatThread mensagens={mensagens} novosAPartirDe={novosAPartirDe} variant="full" />
        ) : (
          <>
            <div className="flex flex-col items-center gap-1.5 pt-10">
              <JadeAvatar size={32} glow />
              <p className="text-xs font-light tracking-wide text-muted-foreground">Jade</p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
              <div>
                <p className="text-3xl font-bold leading-tight text-foreground">Olá, {USUARIO.nome}.</p>
                <p className="mt-1 text-xl font-medium leading-snug text-foreground/70">
                  {SAUDACAO_CONTEXTUAL_B1.pergunta}
                </p>
              </div>
              <p className="text-sm font-semibold text-primary">{SAUDACAO_CONTEXTUAL_B1.contexto}</p>
            </div>
          </>
        )}

        <div className="shrink-0 space-y-3 border-t border-border bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {SUGESTOES_CHAT.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => abrirConversa(s)}
                className="rounded-full border border-primary/30 bg-white px-3.5 py-1.5 text-xs font-medium text-primary"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3.5 shadow-[0_4px_20px_rgba(35,30,25,0.06)]">
            <input
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarMensagem();
              }}
              placeholder="Pergunte qualquer coisa à Jade..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={enviarMensagem}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white"
            >
              <PaperPlaneTilt size={15} weight="fill" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
