import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Chat com IA — endpoint validado manualmente (a doc pública em /docs/json
// retorna 404; o contrato abaixo foi confirmado testando o serviço direto):
// POST /chat  body: { message: string, sessionId: string }
// Resposta: text/event-stream, eventos "data: {\"text\": \"...\"}", finalizando com "data: [DONE]"
// ---------------------------------------------------------------------------
const CHAT_ENDPOINT = "https://taya-ai-engine-571144798728.southamerica-east1.run.app/chat";

const MENSAGEM_INICIAL = "Olá! Sou o assistente do Pode Já. Como posso te ajudar hoje?";

export const NOME_ASSISTENTE = "Jade";
export const AVATAR_ASSISTENTE = "/images/assistente-avatar.png";

export type Mensagem = { role: "user" | "assistant"; content: string };

type ChatContextType = {
  mensagens: Mensagem[];
  aberto: boolean;
  minimizado: boolean;
  naoLidas: number;
  inputMensagem: string;
  carregando: boolean;
  setInputMensagem: (v: string) => void;
  abrirChat: () => void;
  fecharChat: () => void;
  minimizarChat: () => void;
  encerrarConversa: () => void;
  enviarMensagem: () => Promise<void>;
  onNovaRespostaNaoVisivel: (callback: (texto: string) => void) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ role: "assistant", content: MENSAGEM_INICIAL }]);
  const [aberto, setAberto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [inputMensagem, setInputMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const sessionIdRef = useRef<string>();
  if (!sessionIdRef.current) sessionIdRef.current = crypto.randomUUID();

  // "Visível" = painel aberto e não minimizado. Guardado em ref (não state)
  // para o fetch em andamento sempre ler o valor mais recente ao decidir se
  // dispara toast/badge, sem precisar recriar a função a cada render.
  const visivelRef = useRef(false);
  visivelRef.current = aberto && !minimizado;
  const notificarCallbackRef = useRef<((texto: string) => void) | null>(null);

  const abrirChat = useCallback(() => {
    setAberto(true);
    setMinimizado(false);
    setNaoLidas(0);
  }, []);

  const fecharChat = useCallback(() => {
    setAberto(false);
    setMinimizado(false);
  }, []);

  const minimizarChat = useCallback(() => {
    setAberto(false);
    setMinimizado(true);
  }, []);

  const encerrarConversa = useCallback(() => {
    // Encerra de fato: reseta o histórico, não só esconde o painel.
    // TODO: encerrar sessão no backend se necessário.
    setMensagens([{ role: "assistant", content: MENSAGEM_INICIAL }]);
    setAberto(false);
    setMinimizado(false);
    setNaoLidas(0);
  }, []);

  const enviarMensagem = useCallback(async () => {
    const conteudo = inputMensagem.trim();
    if (!conteudo || carregando) return;
    const nova: Mensagem = { role: "user", content: conteudo };
    setMensagens((prev) => [...prev, nova]);
    setInputMensagem("");
    setCarregando(true);

    const notificarResposta = (texto: string) => {
      setMensagens((prev) => [...prev, { role: "assistant", content: texto }]);
      if (!visivelRef.current) {
        setNaoLidas((prev) => prev + 1);
        notificarCallbackRef.current?.(texto);
      }
    };

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nova.content, sessionId: sessionIdRef.current }),
      });
      if (!res.ok || !res.body) throw new Error("Falha na resposta do agente");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let textoAcumulado = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocos = buffer.split("\n\n");
        buffer = blocos.pop() ?? "";
        for (const bloco of blocos) {
          const linha = bloco.replace(/^data: /, "").trim();
          if (!linha || linha === "[DONE]") continue;
          try {
            const parsed = JSON.parse(linha);
            if (typeof parsed.text === "string") textoAcumulado += parsed.text;
          } catch {
            // ignora chunks que não são JSON válido
          }
        }
      }

      notificarResposta(textoAcumulado || "Desculpe, não consegui processar sua mensagem.");
    } catch {
      notificarResposta("Desculpe, ocorreu um erro. Por favor, tente novamente.");
    } finally {
      setCarregando(false);
    }
  }, [inputMensagem, carregando]);

  // Histórico da conversa: por ora em memória (state), perde ao recarregar a
  // página. TODO: confirmar com devs se deve persistir em sessionStorage
  // (perde ao fechar a aba) ou localStorage (sobrevive) antes de v1.
  //
  // Múltiplas abas: cada aba tem seu próprio state, sem sincronização entre
  // elas — aceitável para v1.

  // Permite a quem consome (ChatBubble) registrar o toast sem o Context
  // depender de "sonner" diretamente — mantém a lógica de UI fora do estado.
  const onNovaRespostaNaoVisivel = useCallback((callback: (texto: string) => void) => {
    notificarCallbackRef.current = callback;
  }, []);

  return (
    <ChatContext.Provider
      value={{
        mensagens,
        aberto,
        minimizado,
        naoLidas,
        inputMensagem,
        carregando,
        setInputMensagem,
        abrirChat,
        fecharChat,
        minimizarChat,
        encerrarConversa,
        enviarMensagem,
        onNovaRespostaNaoVisivel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat deve ser usado dentro de ChatProvider");
  return ctx;
}
