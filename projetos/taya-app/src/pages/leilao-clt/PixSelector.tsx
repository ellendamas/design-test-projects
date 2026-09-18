import { useState } from "react";
import { Check, PencilSimple, Plus, QrCode, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { formatPixKey } from "@/components/ContaSelector";

// ---------------------------------------------------------------------------
// Seletor de chave Pix com lista (várias chaves salvas, igual a Endereço/Conta
// bancária). Específico da jornada Leilão CLT — usuários "com conta" podem ter
// mais de uma chave cadastrada; nos demais produtos o Pix segue sendo um campo
// único dentro do formulário de conta bancária (ContaSelector), sem alteração.
// ---------------------------------------------------------------------------
interface PixSelectorProps {
  /** Lista de chaves salvas. Vazio = mostra formulário direto. */
  chaves?: string[];
  onConfirmar: (chave: string) => void;
  /** true esconde o cabeçalho (ícone + título) — usado quando a tela que embute o seletor já
   * mostra seu próprio título antes dele */
  ocultarCabecalho?: boolean;
  /** true confirma a seleção automaticamente (ao salvar uma chave nova/editada ou ao clicar em
   * uma chave já salva), sem exigir um botão extra de "Avançar" */
  autoConfirmarSelecao?: boolean;
  /** Quantidade máxima de chaves cadastráveis — esconde o botão "Adicionar outra" ao atingir o limite */
  maxItens?: number;
}

export default function PixSelector({
  chaves: chavesProp = [],
  onConfirmar,
  ocultarCabecalho = false,
  autoConfirmarSelecao = false,
  maxItens = 10,
}: PixSelectorProps) {
  const [lista, setLista] = useState<string[]>(chavesProp);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    chavesProp.length > 0 ? chavesProp.length - 1 : null,
  );

  const [showModal, setShowModal] = useState(chavesProp.length === 0);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  const [chaveParaExcluir, setChaveParaExcluir] = useState<{ idx: number; chave: string } | null>(null);
  const [erroUltimaChave, setErroUltimaChave] = useState(false);

  const [chaveTemp, setChaveTemp] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setEditandoIdx(null);
    setChaveTemp("");
  };

  const abrirNovaChave = () => {
    setChaveTemp("");
    setModoEdicao(false);
    setEditandoIdx(null);
    setShowModal(true);
  };

  const tentarExcluir = (idx: number) => {
    if (lista.length <= 1) { setErroUltimaChave(true); return; }
    setErroUltimaChave(false);
    setChaveParaExcluir({ idx, chave: lista[idx] });
  };

  const confirmarExclusao = () => {
    if (!chaveParaExcluir) return;
    const novaLista = lista.filter((_, i) => i !== chaveParaExcluir.idx);
    setLista(novaLista);
    if (selectedIdx === chaveParaExcluir.idx) setSelectedIdx(novaLista.length > 0 ? novaLista.length - 1 : null);
    else if (selectedIdx !== null && selectedIdx > chaveParaExcluir.idx) setSelectedIdx(selectedIdx - 1);
    setChaveParaExcluir(null);
    toast.success("Chave Pix excluída com sucesso.");
  };

  const abrirEdicao = (idx: number) => {
    setChaveTemp(lista[idx]);
    setModoEdicao(true);
    setEditandoIdx(idx);
    setShowModal(true);
  };

  const handleSalvar = () => {
    let novaLista: string[];
    let idxSalvo: number;
    if (modoEdicao && editandoIdx !== null) {
      novaLista = lista.map((c, i) => (i === editandoIdx ? chaveTemp : c));
      idxSalvo = editandoIdx;
    } else {
      novaLista = [...lista, chaveTemp];
      idxSalvo = novaLista.length - 1;
    }
    setLista(novaLista);
    setSelectedIdx(idxSalvo);
    fecharModal();
    if (autoConfirmarSelecao) onConfirmar(chaveTemp);
  };

  const podeMostrarAdicionar = lista.length < maxItens;

  return (
    <>
      <div className="space-y-3">
        {!ocultarCabecalho && (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
              <QrCode size={28} className="text-[#FD5F31]" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Qual chave Pix usar?</h2>
          </div>
        )}

        {/* ── Lista de chaves salvas ── */}
        {lista.length > 0 && (
          <div className="space-y-2">
            {lista.map((chave, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div key={idx} className="relative">
                  <button
                    type="button"
                    onClick={() => { setSelectedIdx(idx); if (autoConfirmarSelecao) onConfirmar(chave); }}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-all",
                      isSelected
                        ? "border-[#FD5F31] bg-[#FFF3EE]"
                        : "border-border bg-white hover:border-[#FD5F31]/40",
                    )}
                  >
                    <div className="flex items-start gap-3 pr-20">
                      <div
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected ? "border-[#FD5F31] bg-[#FD5F31]" : "border-border bg-white",
                        )}
                      >
                        {isSelected && <Check size={11} weight="bold" className="text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        {idx === chavesProp.length - 1 && (
                          <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-[#FD5F31]">
                            Último utilizado
                          </span>
                        )}
                        <p className="truncate text-sm font-semibold text-foreground">{chave}</p>
                      </div>
                    </div>
                  </button>
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-4">
                    <button type="button" onClick={() => tentarExcluir(idx)} className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-500 md:flex">
                      <Trash size={24} />
                    </button>
                    <button type="button" onClick={() => abrirEdicao(idx)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-[#FD5F31]">
                      <PencilSimple size={24} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {erroUltimaChave && (
          <p className="text-xs text-red-500">Você precisa ter pelo menos uma chave Pix cadastrada.</p>
        )}

        {/* ── Botão adicionar nova chave ── */}
        {podeMostrarAdicionar && (
          <button
            type="button"
            onClick={abrirNovaChave}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-[#FD5F31]/40 hover:text-[#FD5F31]"
          >
            <Plus size={16} />
            {lista.length === 0 ? "Informar chave Pix" : "Adicionar outra chave"}
          </button>
        )}

        {/* ── Botão de confirmação — aparece quando há seleção (a menos que a confirmação já
            seja automática) ── */}
        {selectedIdx !== null && !autoConfirmarSelecao && (
          <button
            type="button"
            onClick={() => onConfirmar(lista[selectedIdx])}
            className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#d04e08] active:scale-[0.98]"
          >
            Avançar
          </button>
        )}
      </div>

      {/* ── Dialog/Drawer de adicionar/editar chave ── */}
      {isDesktop ? (
        <Dialog open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
          <DialogContent className="max-w-md">
            <DialogClose onClose={fecharModal} />
            <DialogHeader>
              <DialogTitle>{modoEdicao ? "Editar chave Pix" : "Adicionar chave Pix"}</DialogTitle>
            </DialogHeader>
            <PixFormContent chaveTemp={chaveTemp} setChaveTemp={setChaveTemp} handleSalvar={handleSalvar} fecharModal={fecharModal} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
          <DrawerContent>
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <DrawerTitle>{modoEdicao ? "Editar chave Pix" : "Adicionar chave Pix"}</DrawerTitle>
                {modoEdicao && lista.length > 1 && (
                  <button
                    type="button"
                    onClick={() => { fecharModal(); setChaveParaExcluir({ idx: editandoIdx!, chave: lista[editandoIdx!] }); }}
                    className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    <Trash size={14} weight="fill" />
                    Excluir
                  </button>
                )}
              </div>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <PixFormContent chaveTemp={chaveTemp} setChaveTemp={setChaveTemp} handleSalvar={handleSalvar} fecharModal={fecharModal} />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* ── Dialog/Drawer de confirmação de exclusão ── */}
      {isDesktop ? (
        <Dialog open={!!chaveParaExcluir} onOpenChange={(o) => { if (!o) setChaveParaExcluir(null); }}>
          <DialogContent className="max-w-md">
            <DialogClose onClose={() => setChaveParaExcluir(null)} />
            <DialogHeader>
              <DialogTitle>Excluir chave Pix</DialogTitle>
            </DialogHeader>
            <PixExclusaoContent chave={chaveParaExcluir?.chave ?? null} onCancelar={() => setChaveParaExcluir(null)} onConfirmar={confirmarExclusao} />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={!!chaveParaExcluir} onOpenChange={(o) => { if (!o) setChaveParaExcluir(null); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Excluir chave Pix</DrawerTitle>
            </DrawerHeader>
            <div className="pb-6">
              <PixExclusaoContent chave={chaveParaExcluir?.chave ?? null} onCancelar={() => setChaveParaExcluir(null)} onConfirmar={confirmarExclusao} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

function PixExclusaoContent({ chave, onCancelar, onConfirmar }: { chave: string | null; onCancelar: () => void; onConfirmar: () => void }) {
  if (!chave) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="text-sm font-semibold text-foreground">{chave}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Tem certeza que deseja excluir esta chave Pix? Você precisará cadastrá-la novamente se quiser usá-la.
      </p>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancelar}
          className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground">
          Cancelar
        </button>
        <button type="button" onClick={onConfirmar}
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white">
          Sim, excluir
        </button>
      </div>
    </div>
  );
}

function PixFormContent({
  chaveTemp,
  setChaveTemp,
  handleSalvar,
  fecharModal,
}: {
  chaveTemp: string;
  setChaveTemp: (v: string) => void;
  handleSalvar: () => void;
  fecharModal: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">CPF, e-mail, telefone ou chave aleatória</p>
      <Input
        value={chaveTemp}
        onChange={(e) => setChaveTemp(formatPixKey(e.target.value))}
        className="h-12 rounded-xl"
        placeholder="Digite sua chave Pix"
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={fecharModal}
          className="flex h-11 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground">
          Cancelar
        </button>
        <button type="button" disabled={!chaveTemp} onClick={handleSalvar}
          className={cn("flex h-11 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors",
            chaveTemp ? "bg-[#FD5F31] hover:bg-[#d04e08]" : "cursor-not-allowed bg-[#FD5F31] opacity-40")}>
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
