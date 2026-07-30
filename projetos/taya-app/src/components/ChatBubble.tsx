import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ChatCircle, Minus, PaperPlaneTilt, Robot, Warning, X } from "@phosphor-icons/react";
import { getStoredUser } from "@/App";
import { AVATAR_ASSISTENTE, NOME_ASSISTENTE, useChat, type Mensagem } from "@/context/ChatContext";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

// Rotas onde o chat não deve aparecer (onboarding e login — usuário ainda
// não está "dentro" do app).
const ROTAS_SEM_CHAT = ["/", "/boas-vindas", "/acesso", "/cadastro"];

function ChatMensagens({ mensagens, carregando }: { mensagens: Mensagem[]; carregando: boolean }) {
  const fimMensagens = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimMensagens.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, carregando]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto">
      {mensagens.map((m, i) => (
        <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user"
                ? "rounded-br-sm bg-[#FD5F31] text-white"
                : "rounded-bl-sm bg-[#F3F4F6] text-foreground"
            }`}
          >
            {m.content}
          </div>
        </div>
      ))}
      {carregando && (
        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-[#F3F4F6] px-4 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      )}
      <div ref={fimMensagens} />
    </div>
  );
}

// Ícone como base + foto do assistente sobreposta (com fallback silencioso
// para o ícone caso a imagem ainda não exista) — mesmo padrão usado nos
// logos de parceiro do CLT. Foto definitiva ainda não existe (marketing).
function AvatarAssistente({ tamanho, iconeTamanho }: { tamanho: number; iconeTamanho: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFF3EE] text-[#FD5F31]"
      style={{ height: tamanho, width: tamanho }}
    >
      <Robot size={iconeTamanho} />
      <img
        src={AVATAR_ASSISTENTE}
        alt={NOME_ASSISTENTE}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

function ChatPainel({ onMinimizar, onFechar }: { onMinimizar: () => void; onFechar: () => void }) {
  const { mensagens, carregando, inputMensagem, setInputMensagem, enviarMensagem } = useChat();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <AvatarAssistente tamanho={36} iconeTamanho={20} />
          <p className="text-base font-semibold text-foreground">Conversando com {NOME_ASSISTENTE}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinimizar}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Minimizar"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <ChatMensagens mensagens={mensagens} carregando={carregando} />

      <div className="mt-3 flex shrink-0 items-center gap-2 border-t border-border pt-3">
        <input
          type="text"
          value={inputMensagem}
          onChange={(e) => setInputMensagem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensagem();
          }}
          placeholder="Digite sua dúvida..."
          className="h-11 flex-1 rounded-full border border-border bg-white px-4 text-sm outline-none focus:border-[#FD5F31]"
        />
        <button
          type="button"
          onClick={enviarMensagem}
          disabled={!inputMensagem.trim() || carregando}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FD5F31] text-white transition-colors disabled:opacity-40"
          aria-label="Enviar mensagem"
        >
          <PaperPlaneTilt size={18} weight="fill" />
        </button>
      </div>
    </div>
  );
}

export function ChatBubble() {
  const { aberto, mensagens, naoLidas, abrirChat, minimizarChat, encerrarConversa, onNovaRespostaNaoVisivel } =
    useChat();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const usuario = getStoredUser();

  const [mostrarTooltipMinimizado, setMostrarTooltipMinimizado] = useState(false);
  const [mostrarConfirmacaoFechar, setMostrarConfirmacaoFechar] = useState(false);
  const tooltipJaMostrado = useRef(false);

  // mensagens[0] é a mensagem inicial do assistente — só com > 1 há conversa real
  const temConversaAtiva = mensagens.length > 1;

  // Toast quando a resposta chega com o painel fechado/minimizado.
  useEffect(() => {
    onNovaRespostaNaoVisivel((texto) => {
      toast(texto.length > 90 ? `${texto.slice(0, 90)}…` : texto, {
        icon: <Robot size={16} className="text-[#FD5F31]" />,
        description: "Assistente Pode Já respondeu",
      });
    });
  }, [onNovaRespostaNaoVisivel]);

  const handleMinimizar = () => {
    minimizarChat();
    // Tooltip explicando que dá pra acompanhar a conversa navegando —
    // só aparece uma vez por sessão, na primeira vez que o usuário minimiza.
    if (!tooltipJaMostrado.current) {
      tooltipJaMostrado.current = true;
      setMostrarTooltipMinimizado(true);
      setTimeout(() => setMostrarTooltipMinimizado(false), 4000);
    }
  };

  if (!usuario || ROTAS_SEM_CHAT.includes(location.pathname)) return null;
  // Sem conversa real, o botão flutuante não aparece em lugar nenhum —
  // inclusive na Central de Ajuda, que já tem seu próprio CTA "Acessar atendimento".
  if (!aberto && !temConversaAtiva) return null;

  const painel = <ChatPainel onMinimizar={handleMinimizar} onFechar={() => setMostrarConfirmacaoFechar(true)} />;

  return (
    <>
      {!aberto && (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-6 md:right-6">
          <button
            type="button"
            onClick={() => abrirChat()}
            title="Continuar conversa"
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#FD5F31] shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <ChatCircle size={24} className="text-white" />
            <img
              src={AVATAR_ASSISTENTE}
              alt={NOME_ASSISTENTE}
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            {naoLidas > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {naoLidas}
              </span>
            )}
          </button>

          {mostrarTooltipMinimizado && (
            <div className="absolute bottom-16 right-0 w-56 rounded-xl bg-foreground px-3 py-2 text-xs text-white shadow-lg">
              Você pode acompanhar sua conversa enquanto navega no app
              <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 bg-foreground" />
            </div>
          )}
        </div>
      )}

      {aberto &&
        (isDesktop
          ? createPortal(
              // Portal direto no body: wrappers de transição de página
              // (framer-motion) aplicam `transform` num ancestral, o que vira
              // containing block de `position: fixed` e quebraria o posicionamento.
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 16 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{ transformOrigin: "bottom right" }}
                  className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background p-5 shadow-app"
                >
                  {painel}
                </motion.div>
              </AnimatePresence>,
              document.body,
            )
          : // dismissible=false: com um agente que executa ações no app, fechar
            // sem querer (arrastando ou tocando fora) pode confundir o usuário
            // sobre o que já foi feito — só os botões do header fecham/minimizam.
            (
              <Drawer open={aberto} onOpenChange={(open) => !open && handleMinimizar()} dismissible={false}>
                <DrawerContent>
                  <div className="flex h-[85vh] min-h-0 flex-col">{painel}</div>
                </DrawerContent>
              </Drawer>
            ))}

      {mostrarConfirmacaoFechar &&
        createPortal(
          <div className="pointer-events-auto fixed inset-0 z-[60] flex items-end justify-center bg-black/50 md:items-center">
            <div className="w-full max-w-md space-y-4 rounded-t-3xl bg-background p-6 md:rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Warning size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Encerrar conversa?</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Se fechar, a conversa será encerrada e não poderá ser retomada.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacaoFechar(false)}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    encerrarConversa();
                    setMostrarConfirmacaoFechar(false);
                  }}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white"
                >
                  Sim, encerrar
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
