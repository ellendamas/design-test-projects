import { useState, useRef } from "react";
import { MapPin, PencilSimple, Plus, SpinnerGap, Check } from "@phosphor-icons/react";
import { IMaskInput } from "react-imask";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  /** Lista de endereços salvos. Vazio = mostra formulário direto. Máx 5. */
  enderecos?: EnderecoData[];
  onConfirmar: (endereco: EnderecoData) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function formatEndereco(e: EnderecoData) {
  return [
    `${e.logradouro}${e.numero ? `, ${e.numero}` : ""}`,
    e.complemento,
    e.bairro,
    `${e.cidade} / ${e.estado}`,
    `CEP: ${e.cep}`,
  ].filter(Boolean);
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function EnderecoSelector({
  enderecos: enderecosProp = [],
  onConfirmar,
}: EnderecoSelectorProps) {
  // Lista local — começa com os props, cresce quando o usuário adiciona
  const [lista, setLista] = useState<EnderecoData[]>(enderecosProp);
  // Último índice pré-selecionado (ou null se lista vazia)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(
    enderecosProp.length > 0 ? enderecosProp.length - 1 : null,
  );
  // Abrir/fechar formulário de novo endereço
  const [showForm, setShowForm] = useState(enderecosProp.length === 0);

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

  const podeAdicionarForm =
    !!cep && !!logradouro && !!numero && !!bairro && !!cidade && !!estado;

  const handleSalvarNovoEndereco = () => {
    const novo: EnderecoData = { cep, logradouro, numero, bairro, cidade, estado, complemento };
    const novaLista = [...lista, novo];
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
                    {idx === enderecosProp.length - 1 && (
                      <span className="mb-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-[#E8590A]">
                        Último utilizado
                      </span>
                    )}
                    <div className="space-y-0.5 text-sm leading-relaxed text-foreground">
                      {formatEndereco(end).map((linha, i) => (
                        <p key={i}>{linha}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Botão adicionar novo endereço ── */}
      {podeMostrarForm && !showForm && (
        <button
          type="button"
          onClick={() => { setShowForm(true); setSelectedIdx(null); }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:border-[#E8590A]/40 hover:text-[#E8590A]"
        >
          <Plus size={16} />
          {lista.length === 0 ? "Informar endereço" : "Adicionar outro endereço"}
        </button>
      )}

      {/* ── Formulário de novo endereço ── */}
      {showForm && (
        <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Novo endereço</p>
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

          <div className="relative">
            <IMaskInput
              mask="00000-000"
              value={cep}
              onAccept={(v) => {
                const val = String(v);
                setCep(val);
                if (val.replace(/\D/g, "").length === 8) buscarCEP(val);
              }}
              className={maskedInputClass}
              placeholder="CEP"
            />
            {cepLoading && (
              <SpinnerGap
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground"
              />
            )}
          </div>

          <button
            type="button"
            className="text-sm text-primary underline underline-offset-2"
            onClick={() => window.open("https://buscacepinter.correios.com.br", "_blank")}
          >
            Não sei meu CEP
          </button>

          {cepErro && <p className="text-xs text-red-500">{cepErro}</p>}

          <Input
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            className={cn("h-12 rounded-xl", cepLoading && "animate-pulse bg-[#F5F4F2]")}
            placeholder="Logradouro"
          />
          <Input
            ref={numeroRef}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="Número"
          />
          <Input
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className={cn("h-12 rounded-xl", cepLoading && "animate-pulse bg-[#F5F4F2]")}
            placeholder="Bairro"
          />
          <Input
            value={cidade}
            readOnly
            className={cn("h-12 rounded-xl opacity-70", cepLoading && "animate-pulse bg-[#F5F4F2]")}
            placeholder="Cidade"
          />
          <Input
            value={estado}
            readOnly
            className={cn("h-12 rounded-xl opacity-70", cepLoading && "animate-pulse bg-[#F5F4F2]")}
            placeholder="Estado"
          />
          <Input
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className="h-12 rounded-xl"
            placeholder="Complemento (opcional)"
          />

          <button
            type="button"
            disabled={!podeAdicionarForm}
            onClick={handleSalvarNovoEndereco}
            className={cn(
              "flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors",
              podeAdicionarForm
                ? "bg-[#E8590A] hover:bg-[#d04e08]"
                : "cursor-not-allowed bg-[#E8590A] opacity-40",
            )}
          >
            <PencilSimple size={16} className="mr-2" />
            Salvar endereço
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
