import { useState } from "react";
import { Bank, CaretDown, Check, Plus } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tipos exportados
// ---------------------------------------------------------------------------
export interface ContaData {
  banco: { codigo: string; nome: string };
  tipoConta: string;
  agencia: string;
  conta: string;
  digito: string;
}

interface ContaSelectorProps {
  /** Lista de contas salvas. Vazio = mostra formulário direto. Máx 5. */
  contas?: ContaData[];
  onConfirmar: (conta: ContaData) => void;
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
}: ContaSelectorProps) {
  // Lista local — começa com os props, cresce quando o usuário adiciona
  const [lista, setLista] = useState<ContaData[]>(contasProp);
  // Último índice pré-selecionado (ou null se lista vazia)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    contasProp.length > 0 ? contasProp.length - 1 : null,
  );
  // Abrir/fechar formulário de nova conta
  const [showForm, setShowForm] = useState(contasProp.length === 0);

  // --- Estado do formulário ---
  const [bancoSelecionado, setBancoSelecionado] = useState<{ cod: string; nome: string } | null>(null);
  const [bankSearch, setBankSearch] = useState("");
  const [openBanco, setOpenBanco] = useState(false);
  const [tipoConta, setTipoConta] = useState<"corrente" | "poupanca">("corrente");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [digito, setDigito] = useState("");

  const resetForm = () => {
    setBancoSelecionado(null); setBankSearch(""); setOpenBanco(false);
    setTipoConta("corrente"); setAgencia(""); setConta(""); setDigito("");
  };

  const podeAdicionarForm = !!bancoSelecionado && !!agencia && !!conta && !!digito;

  const handleSalvarNovaConta = () => {
    const nova: ContaData = {
      banco: { codigo: bancoSelecionado!.cod, nome: bancoSelecionado!.nome },
      tipoConta: tipoConta === "corrente" ? "Conta corrente" : "Conta poupança",
      agencia,
      conta,
      digito,
    };
    const novaLista = [...lista, nova];
    setLista(novaLista);
    setSelectedIdx(novaLista.length - 1);
    setShowForm(false);
    resetForm();
  };

  const podeConfirmar = selectedIdx !== null;
  const podeMostrarForm = lista.length < 5;

  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]">
          <Bank size={28} className="text-[#E8590A]" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Para qual conta enviamos o dinheiro?
        </h2>
        <p className="text-sm text-muted-foreground">
          O valor é transferido em até 1 dia útil após a assinatura
        </p>
      </div>

      {/* ── Lista de contas salvas ── */}
      {lista.length > 0 && (
        <div className="space-y-2">
          {lista.map((c, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => { setSelectedIdx(idx); setShowForm(false); }}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-[#E8590A] bg-[#FEF0E7]"
                    : "border-border bg-white hover:border-[#E8590A]/40",
                )}
              >
                <div className="flex items-start gap-3">
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
                    {idx === contasProp.length - 1 && (
                      <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-[#E8590A]">
                        Último utilizado
                      </span>
                    )}
                    <p className="text-sm font-medium text-foreground">{c.banco.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.tipoConta} · Ag {c.agencia} · {c.conta}-{c.digito}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Botão adicionar nova conta ── */}
      {podeMostrarForm && !showForm && (
        <button
          type="button"
          onClick={() => { setShowForm(true); setSelectedIdx(null); }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-[#E8590A]/40 hover:text-[#E8590A]"
        >
          <Plus size={16} />
          {lista.length === 0 ? "Informar conta bancária" : "Adicionar outra conta"}
        </button>
      )}

      {/* ── Formulário de nova conta ── */}
      {showForm && (
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Nova conta</p>
            {lista.length > 0 && (
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="text-xs text-muted-foreground underline underline-offset-2"
              >
                Cancelar
              </button>
            )}
          </div>

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
                    className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F5F4F2]"
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
                    ? "border-[#E8590A] bg-[#FEF0E7] text-[#E8590A]"
                    : "border-border text-foreground",
                )}
              >
                {tipo === "corrente" ? "Conta corrente" : "Conta poupança"}
              </button>
            ))}
          </div>

          <Input
            value={agencia}
            onChange={(e) => setAgencia(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="Agência"
          />
          <div className="grid grid-cols-[1fr_auto_70px] items-end gap-2">
            <Input
              value={conta}
              onChange={(e) => setConta(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="Conta"
            />
            <span className="pb-3 text-muted-foreground">-</span>
            <Input
              value={digito}
              onChange={(e) => setDigito(e.target.value)}
              className="h-12 rounded-xl"
              placeholder="Dígito"
            />
          </div>

          <button
            type="button"
            disabled={!podeAdicionarForm}
            onClick={handleSalvarNovaConta}
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors",
              podeAdicionarForm
                ? "bg-[#E8590A] hover:bg-[#d04e08]"
                : "cursor-not-allowed bg-[#E8590A] opacity-40",
            )}
          >
            Salvar conta
          </button>
        </div>
      )}

      {/* ── CTA Continuar — sempre visível ── */}
      <button
        type="button"
        disabled={!podeConfirmar}
        onClick={() => {
          if (selectedIdx !== null) onConfirmar(lista[selectedIdx]);
        }}
        className={cn(
          "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
          podeConfirmar
            ? "bg-[#E8590A] hover:bg-[#d04e08] active:scale-[0.98]"
            : "cursor-not-allowed bg-[#E8590A] opacity-40",
        )}
      >
        Continuar
      </button>
    </div>
  );
}
