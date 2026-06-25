import { useState } from "react";
import { Fingerprint, HourglassMedium } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type UnicoAguardandoProps = {
  titulo?: string;
  descricao?: string;
  labelBotao?: string;
  mostrarBotao?: boolean;
  onAssinar?: () => void;          // obrigatório se mostrarBotao=true
  onCancelar?: () => void;         // quando mostrarBotao=true: abre modal de confirmação
  // Props para o estado expirado (mostrarBotao=false)
  descricaoAcao?: string;          // texto do bloco de ação (exibido junto do botão de nova simulação)
  labelAcaoExpirado?: string;      // default: "Iniciar nova simulação"
  onAcaoExpirado?: () => void;     // cancela a proposta e inicia nova simulação
  onVoltar?: () => void;           // link secundário "Voltar para o início"
};

// ---------------------------------------------------------------------------
// Hook — detecta mobile por largura de tela
// ---------------------------------------------------------------------------

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

// TODO: polling GET /propostas/{id} a cada 30s — transitar automaticamente quando status mudar

export default function UnicoAguardando({
  titulo     = "Aguardando sua assinatura",
  descricao  = "Você saiu antes de concluir. Toque em Assinar agora para continuar de onde parou.",
  labelBotao = "Assinar agora",
  mostrarBotao = true,
  onAssinar,
  onCancelar,
  descricaoAcao,
  labelAcaoExpirado = "Iniciar nova simulação",
  onAcaoExpirado,
  onVoltar,
}: UnicoAguardandoProps) {
  const isMobile = useIsMobile();
  const [cancelarAberto, setCancelarAberto] = useState(false);

  const handleConfirmarCancelamento = () => {
    setCancelarAberto(false);
    onCancelar?.();
  };

  // ── Conteúdo do modal ───────────────────────────────────────────────────
  const modalConteudo = (
    <p className="text-sm text-muted-foreground">
      Tem certeza que deseja cancelar? Sua proposta será descartada e não poderá ser recuperada.
    </p>
  );

  const modalBotoes = (
    <>
      <button
        type="button"
        onClick={handleConfirmarCancelamento}
        className="flex h-12 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-semibold text-[#E8590A] hover:bg-[#FEF0E7]"
      >
        Sim, cancelar
      </button>
      <button
        type="button"
        onClick={() => setCancelarAberto(false)}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#E8590A] text-sm font-semibold text-white hover:bg-[#A33D05]"
      >
        Não, continuar
      </button>
    </>
  );

  return (
    <>
      {mostrarBotao ? (
        /* ── Estado ativo ─────────────────────────────────────────────────── */
        <>
          <div className="flex flex-col items-center gap-5 pb-32 pt-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7]">
              <HourglassMedium size={32} className="text-[#E8590A]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">{titulo}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
            </div>
          </div>

          {/* Rodapé fixo — botão assinar + link cancelar */}
          <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onAssinar}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#d04e08]"
              >
                <Fingerprint size={20} />
                {labelBotao}
              </button>
              {onCancelar && (
                <button
                  type="button"
                  onClick={() => setCancelarAberto(true)}
                  className="py-1 text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Cancelar proposta
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ── Estado expirado ──────────────────────────────────────────────── */
        <>
          <div className="flex flex-col gap-4 pt-4 pb-6">

            {/* Ícone + título centralizados */}
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7]">
                <HourglassMedium size={32} className="text-[#E8590A]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{titulo}</h2>
            </div>

            {/* Card branco — explicação */}
            {descricao && (
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">{descricao}</p>
              </div>
            )}

            {/* Card de ação — texto + botão juntos */}
            {(descricaoAcao || onAcaoExpirado) && (
              <div className="rounded-2xl border border-[#E8590A]/20 bg-[#FEF0E7] p-4 space-y-3">
                {descricaoAcao && (
                  <p className="text-sm leading-relaxed text-[#A33D05]">{descricaoAcao}</p>
                )}
                {onAcaoExpirado && (
                  <button
                    type="button"
                    onClick={onAcaoExpirado}
                    className="flex h-12 w-full items-center justify-center rounded-full bg-[#E8590A] text-sm font-semibold text-white transition-colors hover:bg-[#d04e08]"
                  >
                    {labelAcaoExpirado}
                  </button>
                )}
              </div>
            )}

            {/* Link secundário — voltar para o início */}
            {onVoltar && (
              <button
                type="button"
                onClick={onVoltar}
                className="py-1 text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Voltar para o início
              </button>
            )}

          </div>
        </>
      )}

      {/* Modal de confirmação de cancelamento */}
      {isMobile ? (
        <Drawer open={cancelarAberto} onOpenChange={setCancelarAberto}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Cancelar proposta</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">{modalConteudo}</div>
            <div className="flex flex-col gap-2 px-4 pb-6 pt-2">{modalBotoes}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={cancelarAberto} onOpenChange={setCancelarAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancelar proposta</DialogTitle>
            </DialogHeader>
            {modalConteudo}
            <div className="flex flex-col gap-2 pt-2">{modalBotoes}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
