import { useState, useRef } from "react";
import { MapPin, PencilSimple, Plus, SpinnerGap, Check, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { IMaskInput } from "react-imask";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// ---------------------------------------------------------------------------
// Tipos exportados
// ---------------------------------------------------------------------------
export interface EnderecoData {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string;
}

interface EnderecoSelectorProps {
  /** Lista de endereços salvos. Vazio = mostra formulário direto. */
  enderecos?: EnderecoData[];
  onConfirmar: (endereco: EnderecoData) => void;
  /** Modo sem próximo passo (ex: /minha-conta) — clique no card só seleciona; botão "Salvar" confirma */
  semProximoPasso?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function formatEndereco(e: EnderecoData): [string, string[]] {
  const primeira = `${e.logradouro}${e.numero ? `, ${e.numero}` : ""}`;
  const demais = [
    e.complemento,
    e.bairro,
    `${e.cidade} / ${e.estado}`,
    `CEP: ${e.cep}`,
  ].filter(Boolean) as string[];
  return [primeira, demais];
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function EnderecoSelector({
  enderecos: enderecosProp = [],
  onConfirmar,
  semProximoPasso = false,
}: EnderecoSelectorProps) {
  // Lista local — começa com os props, cresce quando o usuário adiciona/edita
  const [lista, setLista] = useState<EnderecoData[]>(enderecosProp);
  // Último índice pré-selecionado (ou null se lista vazia)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    enderecosProp.length > 0 ? enderecosProp.length - 1 : null,
  );

  // --- Estado do modal (adicionar/editar) ---
  const [showModal, setShowModal] = useState(enderecosProp.length === 0);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  // --- Estado do modal de exclusão ---
  const [enderecoParaExcluir, setEnderecoParaExcluir] = useState<{ idx: number; end: EnderecoData } | null>(null);
  const [erroUltimoEndereco, setErroUltimoEndereco] = useState(false);

  // --- Estado do formulário ---
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cepErro, setCepErro] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const numeroRef = useRef<HTMLInputElement>(null);

  const buscarCEP = async (v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepErro("");
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = (await res.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) {
        setCepErro("CEP não encontrado. Verifique e tente novamente.");
      } else {
        setLogradouro(data.logradouro ?? "");
        setBairro(data.bairro ?? "");
        setCidade(data.localidade ?? "");
        setEstado(data.uf ?? "");
        setTimeout(() => numeroRef.current?.focus(), 100);
      }
    } catch {
      setCepErro("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const resetForm = () => {
    setCep(""); setLogradouro(""); setNumero(""); setBairro("");
    setCidade(""); setEstado(""); setComplemento(""); setCepErro("");
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setEditandoIdx(null);
    resetForm();
  };

  const abrirNovoEndereco = () => {
    resetForm();
    setModoEdicao(false);
    setEditandoIdx(null);
    setShowModal(true);
  };

  const tentarExcluir = (idx: number) => {
    if (lista.length <= 1) { setErroUltimoEndereco(true); return; }
    setErroUltimoEndereco(false);
    setEnderecoParaExcluir({ idx, end: lista[idx] });
  };

  const confirmarExclusao = () => {
    if (!enderecoParaExcluir) return;
    const novaLista = lista.filter((_, i) => i !== enderecoParaExcluir.idx);
    setLista(novaLista);
    if (selectedIdx === enderecoParaExcluir.idx) setSelectedIdx(novaLista.length > 0 ? novaLista.length - 1 : null);
    else if (selectedIdx !== null && selectedIdx > enderecoParaExcluir.idx) setSelectedIdx(selectedIdx - 1);
    setEnderecoParaExcluir(null);
    toast.success("Endereço excluído com sucesso.");
    // TODO: conectar ao DELETE /enderecos/{id} quando API disponível
  };

  const abrirEdicao = (idx: number) => {
    const e = lista[idx];
    setCep(e.cep);
    setLogradouro(e.logradouro);
    setNumero(e.numero);
    setBairro(e.bairro);
    setCidade(e.cidade);
    setEstado(e.estado);
    setComplemento(e.complemento ?? "");
    setCepErro("");
    setModoEdicao(true);
    setEditandoIdx(idx);
    setShowModal(true);
  };

  const podeAdicionarForm =
    !!cep && !!logradouro && !!numero && !!bairro && !!cidade && !!estado;

  const handleSalvar = () => {
    const dados: EnderecoData = { cep, logradouro, numero, bairro, cidade, estado, complemento };
    if (modoEdicao && editandoIdx !== null) {
      setLista(lista.map((e, i) => i === editandoIdx ? dados : e));
      setSelectedIdx(editandoIdx);
    } else {
      const novaLista = [...lista, dados];
      setLista(novaLista);
      setSelectedIdx(novaLista.length - 1);
    }
    fecharModal();
    // Sem próximo passo: salvar no modal já é a confirmação final
    if (semProximoPasso) onConfirmar(dados);
  };

  const podeMostrarAdicionar = lista.length < 10;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <>
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]">
          <MapPin size={28} className="text-[#E8590A]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Confirme seu endereço de recebimento
        </h2>
        <p className="text-sm text-muted-foreground">
          É para onde enviaremos as comunicações do contrato
        </p>
      </div>

      {/* ── Lista de endereços salvos ── */}
      {lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((end, idx) => {
            const isSelected = selectedIdx === idx;
            const [primeiraLinha, demaisLinhas] = formatEndereco(end);
            return (
              <div key={idx} className="relative">
                <button
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-[#E8590A] bg-[#FEF0E7]"
                      : "border-border bg-white hover:border-[#E8590A]/40",
                  )}
                >
                  <div className="flex items-start gap-3 pr-20">
                    {/* Radio visual */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected
                          ? "border-[#E8590A] bg-[#E8590A]"
                          : "border-border bg-white",
                      )}
                    >
                      {isSelected && <Check size={11} weight="bold" className="text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      {idx === enderecosProp.length - 1 && (
                        <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-[#E8590A]">
                          Último utilizado
                        </span>
                      )}
                      <p className="text-sm font-semibold text-foreground">{primeiraLinha}</p>
                      {demaisLinhas.map((linha, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{linha}</p>
                      ))}
                    </div>
                  </div>
                </button>
                {/* Ícones — lixeira só no desktop, lápis sempre */}
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-4">
                  <button type="button" onClick={() => tentarExcluir(idx)} className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-500 md:flex">
                    <Trash size={24} />
                  </button>
                  <button type="button" onClick={() => abrirEdicao(idx)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-[#E8590A]">
                    <PencilSimple size={24} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {erroUltimoEndereco && (
        <p className="text-xs text-red-500">Você precisa ter pelo menos um endereço cadastrado.</p>
      )}

      {/* ── Botão de confirmação — aparece quando há seleção ── */}
      {selectedIdx !== null && (
        <button
          type="button"
          onClick={() => onConfirmar(lista[selectedIdx])}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white hover:bg-[#d04e08] active:scale-[0.98]"
        >
          {semProximoPasso ? "Salvar endereço" : "Avançar"}
        </button>
      )}

      {/* ── Botão adicionar novo endereço ── */}
      {podeMostrarAdicionar && (
        <button
          type="button"
          onClick={abrirNovoEndereco}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-[#E8590A]/40 hover:text-[#E8590A]"
        >
          <Plus size={16} />
          {lista.length === 0 ? "Informar endereço" : "Adicionar outro endereço"}
        </button>
      )}

    </div>

    {/* ── Dialog (desktop) ── */}
    {isDesktop ? (
      <Dialog open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={fecharModal} />
          <DialogHeader>
            <DialogTitle>{modoEdicao ? "Editar endereço" : "Adicionar endereço"}</DialogTitle>
          </DialogHeader>
          <EnderecoFormContent
            cep={cep} setCep={setCep} logradouro={logradouro} setLogradouro={setLogradouro}
            numero={numero} setNumero={setNumero} bairro={bairro} setBairro={setBairro}
            cidade={cidade} estado={estado} complemento={complemento} setComplemento={setComplemento}
            cepErro={cepErro} cepLoading={cepLoading} buscarCEP={buscarCEP}
            numeroRef={numeroRef} podeAdicionarForm={podeAdicionarForm}
            handleSalvar={handleSalvar} fecharModal={fecharModal} modoEdicao={modoEdicao}
          />
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{modoEdicao ? "Editar endereço" : "Adicionar endereço"}</DrawerTitle>
              {modoEdicao && lista.length > 1 && (
                <button
                  type="button"
                  onClick={() => { fecharModal(); setEnderecoParaExcluir({ idx: editandoIdx!, end: lista[editandoIdx!] }); }}
                  className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  <Trash size={14} weight="fill" />
                  Excluir
                </button>
              )}
            </div>
          </DrawerHeader>
          <div className="pb-6">
            <EnderecoFormContent
              cep={cep} setCep={setCep} logradouro={logradouro} setLogradouro={setLogradouro}
              numero={numero} setNumero={setNumero} bairro={bairro} setBairro={setBairro}
              cidade={cidade} estado={estado} complemento={complemento} setComplemento={setComplemento}
              cepErro={cepErro} cepLoading={cepLoading} buscarCEP={buscarCEP}
              numeroRef={numeroRef} podeAdicionarForm={podeAdicionarForm}
              handleSalvar={handleSalvar} fecharModal={fecharModal} modoEdicao={modoEdicao}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )}
    {/* ── Dialog/Drawer de confirmação de exclusão ── */}
    {isDesktop ? (
      <Dialog open={!!enderecoParaExcluir} onOpenChange={(o) => { if (!o) setEnderecoParaExcluir(null); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={() => setEnderecoParaExcluir(null)} />
          <DialogHeader>
            <DialogTitle>Excluir endereço</DialogTitle>
          </DialogHeader>
          <EnderecoExclusaoContent end={enderecoParaExcluir?.end ?? null} onCancelar={() => setEnderecoParaExcluir(null)} onConfirmar={confirmarExclusao} />
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={!!enderecoParaExcluir} onOpenChange={(o) => { if (!o) setEnderecoParaExcluir(null); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Excluir endereço</DrawerTitle>
          </DrawerHeader>
          <div className="pb-6">
            <EnderecoExclusaoContent end={enderecoParaExcluir?.end ?? null} onCancelar={() => setEnderecoParaExcluir(null)} onConfirmar={confirmarExclusao} />
          </div>
        </DrawerContent>
      </Drawer>
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Conteúdo do modal/drawer de exclusão de endereço
// ---------------------------------------------------------------------------
function EnderecoExclusaoContent({ end, onCancelar, onConfirmar }: { end: EnderecoData | null; onCancelar: () => void; onConfirmar: () => void }) {
  if (!end) return null;
  const [primeiraLinha] = formatEndereco(end);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="text-sm font-semibold text-foreground">{primeiraLinha}</p>
        <p className="text-xs text-muted-foreground">{end.bairro} · {end.cidade}/{end.estado}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Tem certeza que deseja excluir este endereço? Você precisará cadastrá-lo novamente se quiser usá-lo.
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

// ---------------------------------------------------------------------------
// Conteúdo interno do modal/drawer
// ---------------------------------------------------------------------------
function EnderecoFormContent({
  cep, setCep, logradouro, setLogradouro, numero, setNumero,
  bairro, setBairro, cidade, estado, complemento, setComplemento,
  cepErro, cepLoading, buscarCEP, numeroRef,
  podeAdicionarForm, handleSalvar, fecharModal, modoEdicao,
}: {
  cep: string; setCep: (v: string) => void;
  logradouro: string; setLogradouro: (v: string) => void;
  numero: string; setNumero: (v: string) => void;
  bairro: string; setBairro: (v: string) => void;
  cidade: string; estado: string;
  complemento: string; setComplemento: (v: string) => void;
  cepErro: string; cepLoading: boolean;
  buscarCEP: (v: string) => Promise<void>;
  numeroRef: React.RefObject<HTMLInputElement>;
  podeAdicionarForm: boolean;
  handleSalvar: () => void;
  fecharModal: () => void;
  modoEdicao: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Endereço para correspondência e análise de crédito.
      </p>

      <div className="relative">
        <IMaskInput
          mask="00000-000"
          value={cep}
          onAccept={(v) => {
            const val = String(v);
            setCep(val);
            if (!modoEdicao && val.replace(/\D/g, "").length === 8) buscarCEP(val);
          }}
          className={maskedInputClass}
          placeholder="CEP"
        />
        {cepLoading && (
          <SpinnerGap size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <button type="button" className="text-sm text-primary underline underline-offset-2"
        onClick={() => window.open("https://buscacepinter.correios.com.br", "_blank")}>
        Não sei meu CEP
      </button>

      {cepErro && <p className="text-xs text-red-500">{cepErro}</p>}

      <Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)}
        className={cn("h-12 rounded-xl", cepLoading && "animate-pulse bg-[#F5F4F2]")} placeholder="Logradouro" />
      <Input ref={numeroRef} value={numero} onChange={(e) => setNumero(e.target.value)}
        className="h-12 rounded-xl" placeholder="Número" />
      <Input value={bairro} onChange={(e) => setBairro(e.target.value)}
        className={cn("h-12 rounded-xl", cepLoading && "animate-pulse bg-[#F5F4F2]")} placeholder="Bairro" />
      <Input value={cidade} readOnly
        className={cn("h-12 rounded-xl opacity-70", cepLoading && "animate-pulse bg-[#F5F4F2]")} placeholder="Cidade" />
      <Input value={estado} readOnly
        className={cn("h-12 rounded-xl opacity-70", cepLoading && "animate-pulse bg-[#F5F4F2]")} placeholder="Estado" />
      <Input value={complemento} onChange={(e) => setComplemento(e.target.value)}
        className="h-12 rounded-xl" placeholder="Complemento (opcional)" />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={fecharModal}
          className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground">
          Cancelar
        </button>
        <button type="button" disabled={!podeAdicionarForm} onClick={handleSalvar}
          className={cn("flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors",
            podeAdicionarForm ? "bg-[#E8590A] hover:bg-[#d04e08]" : "cursor-not-allowed bg-[#E8590A] opacity-40")}>
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
