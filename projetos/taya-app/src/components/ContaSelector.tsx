import { useState } from "react";
import { Bank, CaretDown, Check, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// ---------------------------------------------------------------------------
// Máscara da chave Pix — detecta CPF, telefone, e-mail ou chave aleatória
// (EVP) no mesmo campo, conforme o usuário digita.
//
// CPF e celular têm os dois 11 dígitos, então não dá pra diferenciar só pela
// quantidade. Usamos a regra prática: todo celular brasileiro tem "9" como
// primeiro dígito da linha, depois do DDD (padrão nacional desde 2016) — bem
// mais confiável aqui do que validar dígito verificador de CPF, já que
// ninguém digita um CPF matematicamente válido só pra testar a tela.
//
// A chave aleatória (EVP) segue o formato de um UUID v4: 32 caracteres
// hexadecimais agrupados 8-4-4-4-12. Só aplicamos esse agrupamento quando o
// valor só tem dígitos/letras hexadecimais (a-f) — uma letra fora desse
// intervalo (ex: digitando um e-mail antes do @) não entra nessa formatação.
//
// Formatação manual (em vez de máscara dinâmica do react-imask) porque o
// dispatch de máscaras dinâmicas do IMask trava a edição (backspace parava
// de funcionar) quando o valor já preenchia o padrão inteiro.
// ---------------------------------------------------------------------------
const PIX_CHARS_PERMITIDOS = /[^\w.@+-]/g;
const APENAS_HEX = /^[a-fA-F0-9]*$/;

function formatChaveAleatoria(valor: string): string {
  const hex = valor.replace(/[^a-fA-F0-9]/g, "").slice(0, 32).toLowerCase();
  const partes = [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)];
  return partes.filter((p) => p.length > 0).join("-");
}

export function formatPixKey(valor: string): string {
  if (valor.includes("@")) return valor;

  const temLetraNaoHex = /[g-zG-Z]/.test(valor);
  const digitos = valor.replace(/\D/g, "");

  if (temLetraNaoHex) {
    // Provavelmente e-mail ainda em digitação (antes do @) ou texto livre — sem formatação
    return valor.replace(PIX_CHARS_PERMITIDOS, "");
  }

  const apenasSemPontuacao = valor.replace(/[-.\s]/g, "");
  if (/[a-fA-F]/.test(valor) && APENAS_HEX.test(apenasSemPontuacao)) {
    return formatChaveAleatoria(valor);
  }

  if (digitos.length > 11) {
    // Chave aleatória só numérica (sem letras) — sem formatação, só limpa
    // caracteres que vieram de uma tentativa anterior de mascarar como telefone/CPF
    return valor.replace(PIX_CHARS_PERMITIDOS, "");
  }

  if (digitos.length > 10) {
    // 11 dígitos — celular (00) 00000-0000 ou CPF 000.000.000-00
    if (digitos[2] === "9") {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }
  if (digitos.length > 6) {
    // telefone fixo em formação (00) 0000-0000
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  if (digitos.length > 2) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  }
  if (digitos.length > 0) {
    return `(${digitos}`;
  }
  return "";
}

// ---------------------------------------------------------------------------
// Tipos exportados
// ---------------------------------------------------------------------------
export interface ContaData {
  banco: { codigo: string; nome: string };
  tipoConta: string;
  agencia: string;
  conta: string;
  digito: string;
  pixKey?: string;
}

interface ContaSelectorProps {
  /** Lista de contas salvas. Vazio = mostra formulário direto. */
  contas?: ContaData[];
  onConfirmar: (conta: ContaData) => void;
  /** Modo sem próximo passo (ex: /minha-conta) — clique no card só seleciona; botão "Salvar" confirma */
  semProximoPasso?: boolean;
  /** false esconde a exclusão de contas (ex: jornadas públicas sem contexto de conta pra gerenciar) */
  permitirExcluir?: boolean;
  /** true mostra um campo opcional de chave Pix no formulário, além dos dados bancários */
  mostrarPix?: boolean;
  /** Quantidade máxima de contas cadastráveis — esconde o botão "Adicionar outra" ao atingir o limite */
  maxItens?: number;
  /** true esconde o cabeçalho (ícone + título + subtítulo) — usado quando a tela que embute o
   * seletor já mostra seu próprio título antes dele */
  ocultarCabecalho?: boolean;
  /** true confirma a seleção automaticamente (ao salvar uma conta nova/editada ou ao clicar em
   * uma conta já salva), sem exigir um botão extra de "Avançar"/"Salvar conta" */
  autoConfirmarSelecao?: boolean;
}

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------
const BANCOS = [
  { cod: "001", nome: "Banco do Brasil" }, { cod: "341", nome: "Itaú Unibanco" },
  { cod: "237", nome: "Bradesco" }, { cod: "033", nome: "Santander" },
  { cod: "104", nome: "Caixa Econômica Federal" }, { cod: "260", nome: "Nubank" },
  { cod: "077", nome: "Banco Inter" }, { cod: "290", nome: "PagBank" },
  { cod: "323", nome: "Mercado Pago" }, { cod: "336", nome: "C6 Bank" },
  { cod: "212", nome: "Banco Original" }, { cod: "756", nome: "Sicoob" },
  { cod: "748", nome: "Sicredi" }, { cod: "422", nome: "Safra" },
  { cod: "070", nome: "BRB" }, { cod: "085", nome: "Via Credi" },
  { cod: "389", nome: "Banco Mercantil" }, { cod: "707", nome: "Daycoval" },
  { cod: "655", nome: "Votorantim" }, { cod: "169", nome: "Banco Olé" },
  { cod: "318", nome: "BMG" }, { cod: "121", nome: "Agibank" },
  { cod: "380", nome: "PicPay" }, { cod: "364", nome: "EFÍ Bank" },
  { cod: "403", nome: "Cora" }, { cod: "461", nome: "Asaas" },
  { cod: "084", nome: "Uniprime" },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ContaSelector({
  contas: contasProp = [],
  onConfirmar,
  semProximoPasso = false,
  permitirExcluir = true,
  mostrarPix = false,
  maxItens = 10,
  ocultarCabecalho = false,
  autoConfirmarSelecao = false,
}: ContaSelectorProps) {
  // Lista local — começa com os props, cresce quando o usuário adiciona/edita
  const [lista, setLista] = useState<ContaData[]>(contasProp);
  // Último índice pré-selecionado (ou null se lista vazia)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    contasProp.length > 0 ? contasProp.length - 1 : null,
  );

  // --- Estado do modal (adicionar/editar) ---
  const [showModal, setShowModal] = useState(contasProp.length === 0);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);

  // --- Estado do modal de exclusão ---
  const [contaParaExcluir, setContaParaExcluir] = useState<{ idx: number; conta: ContaData } | null>(null);
  const [erroUltimaConta, setErroUltimaConta] = useState(false);

  // --- Estado do formulário ---
  const [bancoSelecionado, setBancoSelecionado] = useState<{ cod: string; nome: string } | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [openBanco, setOpenBanco] = useState(false);
  const [tipoConta, setTipoConta] = useState<"corrente" | "poupanca">("corrente");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [digito, setDigito] = useState("");
  const [pixKey, setPixKey] = useState("");

  const resetForm = () => {
    setBancoSelecionado(null); setBankSearch(""); setOpenBanco(false);
    setTipoConta("corrente"); setAgencia(""); setConta(""); setDigito(""); setPixKey("");
  };

  const fecharModal = () => {
    setShowModal(false);
    setModoEdicao(false);
    setEditandoIdx(null);
    resetForm();
  };

  const abrirNovaConta = () => {
    resetForm();
    setModoEdicao(false);
    setEditandoIdx(null);
    setShowModal(true);
  };

  const tentarExcluir = (idx: number) => {
    if (lista.length <= 1) { setErroUltimaConta(true); return; }
    setErroUltimaConta(false);
    setContaParaExcluir({ idx, conta: lista[idx] });
  };

  const confirmarExclusao = () => {
    if (!contaParaExcluir) return;
    const novaLista = lista.filter((_, i) => i !== contaParaExcluir.idx);
    setLista(novaLista);
    if (selectedIdx === contaParaExcluir.idx) setSelectedIdx(novaLista.length > 0 ? novaLista.length - 1 : null);
    else if (selectedIdx !== null && selectedIdx > contaParaExcluir.idx) setSelectedIdx(selectedIdx - 1);
    setContaParaExcluir(null);
    toast.success("Conta excluída com sucesso.");
    // TODO: conectar ao DELETE /contas/{id} quando API disponível
  };

  const abrirEdicao = (idx: number) => {
    const c = lista[idx];
    setBancoSelecionado({ cod: c.banco.codigo, nome: c.banco.nome });
    setBankSearch("");
    setOpenBanco(false);
    setTipoConta(c.tipoConta === "Conta poupança" ? "poupanca" : "corrente");
    setAgencia(c.agencia);
    setConta(c.conta);
    setDigito(c.digito);
    setPixKey(c.pixKey ?? "");
    setModoEdicao(true);
    setEditandoIdx(idx);
    setShowModal(true);
  };

  const podeAdicionarForm = !!bancoSelecionado && !!agencia && !!conta && !!digito;

  const handleSalvar = () => {
    const dados: ContaData = {
      banco: { codigo: bancoSelecionado!.cod, nome: bancoSelecionado!.nome },
      tipoConta: tipoConta === "corrente" ? "Conta corrente" : "Conta poupança",
      agencia,
      conta,
      digito,
      ...(mostrarPix && pixKey ? { pixKey } : {}),
    };
    if (modoEdicao && editandoIdx !== null) {
      setLista(lista.map((c, i) => i === editandoIdx ? dados : c));
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

  const podeMostrarAdicionar = lista.length < maxItens;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const formProps = {
    bancoSelecionado, setBancoSelecionado, bankSearch, setBankSearch,
    openBanco, setOpenBanco, tipoConta, setTipoConta,
    agencia, setAgencia, conta, setConta, digito, setDigito,
    podeAdicionarForm, handleSalvar, fecharModal, modoEdicao,
    mostrarPix, pixKey, setPixKey,
  };

  return (
    <>
    <div className="space-y-3">
      {/* Cabeçalho */}
      {!ocultarCabecalho && (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Bank size={28} className="text-[#FD5F31]" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Para qual conta enviamos o dinheiro?
          </h2>
          <p className="text-sm text-muted-foreground">
            O valor é transferido em até 1 dia útil após a assinatura
          </p>
        </div>
      )}

      {/* ── Lista de contas salvas ── */}
      {lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((c, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <div key={idx} className="relative">
                <button
                  type="button"
                  onClick={() => { setSelectedIdx(idx); if (autoConfirmarSelecao) onConfirmar(c); }}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    isSelected
                      ? "border-[#FD5F31] bg-[#FFF3EE]"
                      : "border-border bg-white hover:border-[#FD5F31]/40",
                  )}
                >
                  <div className="flex items-start gap-3 pr-20">
                    {/* Radio visual */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        isSelected
                          ? "border-[#FD5F31] bg-[#FD5F31]"
                          : "border-border bg-white",
                      )}
                    >
                      {isSelected && <Check size={11} weight="bold" className="text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      {idx === contasProp.length - 1 && (
                        <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-[#FD5F31]">
                          Último utilizado
                        </span>
                      )}
                      <p className="text-sm font-semibold text-foreground">{c.banco.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.tipoConta} · Ag {c.agencia} · {c.conta}-{c.digito}
                      </p>
                      {c.pixKey && <p className="text-xs text-muted-foreground">Pix: {c.pixKey}</p>}
                    </div>
                  </div>
                </button>
                {/* Ícones — lixeira só no desktop (quando permitido), lápis sempre */}
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-4">
                  {permitirExcluir && (
                    <button type="button" onClick={() => tentarExcluir(idx)} className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-red-500 md:flex">
                      <Trash size={24} />
                    </button>
                  )}
                  <button type="button" onClick={() => abrirEdicao(idx)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-[#FD5F31]">
                    <PencilSimple size={24} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {erroUltimaConta && (
        <p className="text-xs text-red-500">Você precisa ter pelo menos uma conta bancária cadastrada.</p>
      )}

      {/* ── Botão de confirmação — aparece quando há seleção (a menos que a confirmação já
          seja automática) ── */}
      {selectedIdx !== null && !autoConfirmarSelecao && (
        <button
          type="button"
          onClick={() => onConfirmar(lista[selectedIdx])}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#d04e08] active:scale-[0.98]"
        >
          {semProximoPasso ? "Salvar conta" : "Avançar"}
        </button>
      )}

      {/* ── Botão adicionar nova conta ── */}
      {podeMostrarAdicionar && (
        <button
          type="button"
          onClick={abrirNovaConta}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-[#FD5F31]/40 hover:text-[#FD5F31]"
        >
          <Plus size={16} />
          {lista.length === 0 ? "Informar conta bancária" : "Adicionar outra conta"}
        </button>
      )}

    </div>

    {/* ── Dialog (desktop) ── */}
    {isDesktop ? (
      <Dialog open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={fecharModal} />
          <DialogHeader>
            <DialogTitle>{modoEdicao ? "Editar conta" : "Adicionar conta"}</DialogTitle>
          </DialogHeader>
          <ContaFormContent {...formProps} />
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={showModal} onOpenChange={(o) => { if (!o) fecharModal(); }}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>{modoEdicao ? "Editar conta" : "Adicionar conta"}</DrawerTitle>
              {permitirExcluir && modoEdicao && lista.length > 1 && (
                <button
                  type="button"
                  onClick={() => { fecharModal(); setContaParaExcluir({ idx: editandoIdx!, conta: lista[editandoIdx!] }); }}
                  className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  <Trash size={14} weight="fill" />
                  Excluir
                </button>
              )}
            </div>
          </DrawerHeader>
          <div className="pb-6">
            <ContaFormContent {...formProps} />
          </div>
        </DrawerContent>
      </Drawer>
    )}
    {/* ── Dialog/Drawer de confirmação de exclusão ── */}
    {isDesktop ? (
      <Dialog open={!!contaParaExcluir} onOpenChange={(o) => { if (!o) setContaParaExcluir(null); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={() => setContaParaExcluir(null)} />
          <DialogHeader>
            <DialogTitle>Excluir conta bancária</DialogTitle>
          </DialogHeader>
          <ContaExclusaoContent conta={contaParaExcluir?.conta ?? null} onCancelar={() => setContaParaExcluir(null)} onConfirmar={confirmarExclusao} />
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={!!contaParaExcluir} onOpenChange={(o) => { if (!o) setContaParaExcluir(null); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Excluir conta bancária</DrawerTitle>
          </DrawerHeader>
          <div className="pb-6">
            <ContaExclusaoContent conta={contaParaExcluir?.conta ?? null} onCancelar={() => setContaParaExcluir(null)} onConfirmar={confirmarExclusao} />
          </div>
        </DrawerContent>
      </Drawer>
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Conteúdo do modal/drawer de exclusão de conta
// ---------------------------------------------------------------------------
function ContaExclusaoContent({ conta, onCancelar, onConfirmar }: { conta: ContaData | null; onCancelar: () => void; onConfirmar: () => void }) {
  if (!conta) return null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="text-sm font-semibold text-foreground">{conta.banco.nome}</p>
        <p className="text-xs text-muted-foreground">{conta.tipoConta} · Ag {conta.agencia} · {conta.conta}-{conta.digito}</p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Tem certeza que deseja excluir esta conta? Você precisará cadastrá-la novamente se quiser usá-la.
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
// Conteúdo interno do modal/drawer — compartilhado entre Dialog e Drawer
// ---------------------------------------------------------------------------
function ContaFormContent({
  bancoSelecionado, setBancoSelecionado, bankSearch, setBankSearch,
  openBanco, setOpenBanco, tipoConta, setTipoConta,
  agencia, setAgencia, conta, setConta, digito, setDigito,
  podeAdicionarForm, handleSalvar, fecharModal, modoEdicao,
  mostrarPix, pixKey, setPixKey,
}: {
  bancoSelecionado: { cod: string; nome: string } | null;
  setBancoSelecionado: (b: { cod: string; nome: string }) => void;
  bankSearch: string; setBankSearch: (v: string) => void;
  openBanco: boolean; setOpenBanco: (v: boolean | ((p: boolean) => boolean)) => void;
  tipoConta: "corrente" | "poupanca"; setTipoConta: (v: "corrente" | "poupanca") => void;
  agencia: string; setAgencia: (v: string) => void;
  conta: string; setConta: (v: string) => void;
  digito: string; setDigito: (v: string) => void;
  podeAdicionarForm: boolean;
  handleSalvar: () => void;
  fecharModal: () => void;
  modoEdicao: boolean;
  mostrarPix: boolean;
  pixKey: string; setPixKey: (v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Conta para receber o dinheiro do empréstimo.
      </p>

      {/* Seletor de banco */}
      <div className="relative">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left"
          onClick={() => setOpenBanco((p) => !p)}
        >
          <span className={bancoSelecionado ? "text-foreground" : "text-muted-foreground"}>
            {bancoSelecionado?.nome ?? "Selecionar banco"}
          </span>
          <CaretDown size={16} className="text-muted-foreground" />
        </button>
        {openBanco && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-white p-2 shadow-sm">
            <input
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              placeholder="Buscar banco..."
              className="mb-2 h-9 w-full rounded-lg border border-border px-3 text-sm"
            />
            {BANCOS.filter((b) =>
              b.nome.toLowerCase().includes(bankSearch.toLowerCase()),
            ).map((b) => (
              <button
                key={`${b.cod}-${b.nome}`}
                type="button"
                className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F0F0F0]"
                onClick={() => { setBancoSelecionado(b); setOpenBanco(false); }}
              >
                <span className="mr-2 text-xs text-muted-foreground">{b.cod}</span>
                {b.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tipo de conta */}
      <div className="flex gap-2">
        {(["corrente", "poupanca"] as const).map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setTipoConta(tipo)}
            className={cn(
              "flex-1 rounded-xl border py-2.5 text-sm transition-colors",
              tipoConta === tipo
                ? "border-[#FD5F31] bg-[#FFF3EE] text-[#FD5F31]"
                : "border-border text-foreground",
            )}
          >
            {tipo === "corrente" ? "Conta corrente" : "Conta poupança"}
          </button>
        ))}
      </div>

      <Input value={agencia} onChange={(e) => setAgencia(e.target.value)} className="h-12 rounded-xl" placeholder="Agência" />
      <div className="grid grid-cols-[1fr_auto_70px] items-end gap-2">
        <Input value={conta} onChange={(e) => setConta(e.target.value)} className="h-12 rounded-xl" placeholder="Conta" />
        <span className="pb-3 text-muted-foreground">-</span>
        <Input value={digito} onChange={(e) => setDigito(e.target.value)} className="h-12 rounded-xl" placeholder="Dígito" />
      </div>

      {mostrarPix && (
        <Input
          value={pixKey}
          onChange={(e) => setPixKey(formatPixKey(e.target.value))}
          className="h-12 rounded-xl"
          placeholder="Chave Pix — CPF, e-mail, telefone ou aleatória (opcional)"
        />
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={fecharModal}
          className="flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground">
          Cancelar
        </button>
        <button type="button" disabled={!podeAdicionarForm} onClick={handleSalvar}
          className={cn("flex h-11 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white transition-colors",
            podeAdicionarForm ? "bg-[#FD5F31] hover:bg-[#d04e08]" : "cursor-not-allowed bg-[#FD5F31] opacity-40")}>
          Salvar alterações
        </button>
      </div>
    </div>
  );
}
