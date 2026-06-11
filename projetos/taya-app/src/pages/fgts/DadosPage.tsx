import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { SubPageLayout, getStoredUser } from "@/App";
import { cn } from "@/lib/utils";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData } from "@/components/ContaSelector";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type Passo = "dados_pessoais" | "endereco" | "banco";

interface DadosPessoais {
  dataNascimento: string;
  celular: string;
  rg: string;
  orgaoEmissor: string;
  estadoEmissor: string;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const ORGAOS_EMISSORES = ["SSP", "DETRAN", "SESP", "PC", "PM", "outro"];

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

// ---------------------------------------------------------------------------
// Mocks — DESIGN ONLY
// ---------------------------------------------------------------------------
const ENDERECOS_MOCK: EnderecoData[] = [
  { logradouro: "Rua Dona Ana Neri", numero: "581", complemento: "de 501/502 ao fim", bairro: "Cambuci", cidade: "São Paulo", estado: "SP", cep: "01522-000" },
  { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" },
  { logradouro: "Rua Augusta", numero: "2140", complemento: "Apto 42", bairro: "Consolação", cidade: "São Paulo", estado: "SP", cep: "01412-100" },
  { logradouro: "Rua Oscar Freire", numero: "900", bairro: "Jardins", cidade: "São Paulo", estado: "SP", cep: "01426-001" },
  { logradouro: "Av. Rebouças", numero: "3970", complemento: "Bloco B", bairro: "Pinheiros", cidade: "São Paulo", estado: "SP", cep: "05402-600" },
];

const CONTAS_MOCK: ContaData[] = [
  { banco: { codigo: "077", nome: "Banco Inter" }, tipoConta: "Conta corrente", agencia: "1234", conta: "12345", digito: "6" },
  { banco: { codigo: "260", nome: "Nubank" }, tipoConta: "Conta corrente", agencia: "0001", conta: "987654", digito: "3" },
  { banco: { codigo: "341", nome: "Itaú Unibanco" }, tipoConta: "Conta poupança", agencia: "5678", conta: "11111", digito: "0" },
  { banco: { codigo: "237", nome: "Bradesco" }, tipoConta: "Conta corrente", agencia: "0123", conta: "55555", digito: "9" },
  { banco: { codigo: "033", nome: "Santander" }, tipoConta: "Conta corrente", agencia: "9999", conta: "66666", digito: "1" },
];

const inputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8590A]/40";
const selectClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8590A]/40 appearance-none";
const labelClass = "mb-1 block text-xs font-medium text-muted-foreground";

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function FGTSDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = getStoredUser();

  // DESIGN ONLY — simular dados pré-preenchidos via query param
  // ?rg=sim → dados pessoais já coletados (pula passo dados_pessoais)
  // ?endereco=N → N endereços salvos simulados
  // ?conta=N → N contas bancárias salvas simuladas
  // TODO: substituir por dados reais do StoredUser / API BMP
  const temRgMock = searchParams.get("rg") === "sim";
  const nEnderecos = Math.min(5, Math.max(0, parseInt(searchParams.get("endereco") ?? "0", 10) || 0));
  const nContas = Math.min(5, Math.max(0, parseInt(searchParams.get("conta") ?? "0", 10) || 0));

  const enderecosMock = ENDERECOS_MOCK.slice(0, nEnderecos);
  const contasMock = CONTAS_MOCK.slice(0, nContas);

  // StoredUser só tem name e email — RG é sempre novo
  // DESIGN ONLY: ?rg=sim simula que RG já foi coletado
  const faltaDadosPessoais = !temRgMock;
  const faltaEndereco = true; // TODO: verificar user?.cep quando API disponível
  const faltaBanco = true;    // TODO: verificar user?.banco quando API disponível
  void user;

  const passosNecessarios: Passo[] = [];
  if (faltaDadosPessoais) passosNecessarios.push("dados_pessoais");
  if (faltaEndereco) passosNecessarios.push("endereco");
  if (faltaBanco) passosNecessarios.push("banco");

  // DESIGN ONLY — ?passo=banco pula direto para conta bancária
  const passoInicial =
    searchParams.get("passo") === "banco"
      ? Math.max(0, passosNecessarios.indexOf("banco"))
      : 0;

  useEffect(() => {
    if (passosNecessarios.length === 0) {
      navigate("/fgts/assinar", { state: location.state, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [passoIndex, setPassoIndex] = useState(passoInicial);
  const passoAtual = passosNecessarios[passoIndex];

  const [dadosPessoais, setDadosPessoais] = useState<DadosPessoais>({
    dataNascimento: "",
    celular: "",
    rg: "",
    orgaoEmissor: "SSP",
    estadoEmissor: "SP",
  });
  const [enderecoConfirmado, setEnderecoConfirmado] = useState<EnderecoData | null>(null);

  const dadosPessoaisValidos =
    dadosPessoais.dataNascimento.length === 10 &&
    dadosPessoais.celular.replace(/\D/g, "").length === 11 &&
    dadosPessoais.rg.trim().length >= 5 &&
    dadosPessoais.orgaoEmissor !== "" &&
    dadosPessoais.estadoEmissor !== "";

  const avancar = () => {
    if (passoIndex < passosNecessarios.length - 1) {
      setPassoIndex(passoIndex + 1);
    }
  };

  const handleEnderecoConfirmado = (endereco: EnderecoData) => {
    setEnderecoConfirmado(endereco);
    avancar();
  };

  const handleContaConfirmada = (conta: ContaData) => {
    navigate("/fgts/assinar", {
      state: {
        ...location.state,
        dadosPessoais,
        endereco: enderecoConfirmado,
        banco: {
          nome: conta.banco.nome,
          agencia: conta.agencia,
          conta: conta.conta,
          digito: conta.digito,
        },
      },
    });
  };

  return (
    <SubPageLayout title="Dados para contratação">
      <div className="space-y-4 pb-6">

        {/* Indicador de progresso */}
        {passosNecessarios.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            {passosNecessarios.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === passoIndex
                    ? "w-8 bg-[#E8590A]"
                    : i < passoIndex
                      ? "w-2 bg-[#E8590A]/40"
                      : "w-2 bg-border",
                )}
              />
            ))}
          </div>
        )}

        {/* ── Passo: dados pessoais ── */}
        {passoAtual === "dados_pessoais" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <p className="mb-4 text-base font-semibold text-foreground">Complete seus dados</p>

              <div className="space-y-3">
                {/* Data de nascimento */}
                <div>
                  <label className={labelClass}>Data de nascimento *</label>
                  <IMaskInput
                    mask="00/00/0000"
                    value={dadosPessoais.dataNascimento}
                    onAccept={(v: unknown) =>
                      setDadosPessoais((p) => ({ ...p, dataNascimento: String(v) }))
                    }
                    className={inputClass}
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className={labelClass}>Celular *</label>
                  <IMaskInput
                    mask="(00) 00000-0000"
                    value={dadosPessoais.celular}
                    onAccept={(v: unknown) =>
                      setDadosPessoais((p) => ({ ...p, celular: String(v) }))
                    }
                    className={inputClass}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                {/* RG */}
                <div>
                  <label className={labelClass}>RG *</label>
                  <IMaskInput
                    mask="00.000.000-[0]"
                    value={dadosPessoais.rg}
                    onAccept={(v: unknown) =>
                      setDadosPessoais((p) => ({ ...p, rg: String(v) }))
                    }
                    className={inputClass}
                    placeholder="00.000.000-0"
                  />
                </div>

                {/* Órgão emissor + Estado emissor — mesma linha */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Órgão emissor *</label>
                    <div className="relative">
                      <select
                        value={dadosPessoais.orgaoEmissor}
                        onChange={(e) =>
                          setDadosPessoais((p) => ({ ...p, orgaoEmissor: e.target.value }))
                        }
                        className={selectClass}
                      >
                        {ORGAOS_EMISSORES.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Estado emissor *</label>
                    <div className="relative">
                      <select
                        value={dadosPessoais.estadoEmissor}
                        onChange={(e) =>
                          setDadosPessoais((p) => ({ ...p, estadoEmissor: e.target.value }))
                        }
                        className={selectClass}
                      >
                        {ESTADOS_BR.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA deste passo */}
            <div className="sticky bottom-20 z-40 bg-background pb-6 pt-3 md:bottom-0">
              <button
                type="button"
                disabled={!dadosPessoaisValidos}
                onClick={avancar}
                className={cn(
                  "flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors",
                  dadosPessoaisValidos
                    ? "bg-[#E8590A] hover:bg-[#d04e08] active:scale-[0.98]"
                    : "cursor-not-allowed bg-[#E8590A] opacity-40",
                )}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ── Passo: endereço ── */}
        {passoAtual === "endereco" && (
          <EnderecoSelector
            enderecos={enderecosMock}
            onConfirmar={handleEnderecoConfirmado}
          />
        )}

        {/* ── Passo: banco ── */}
        {passoAtual === "banco" && (
          <ContaSelector
            contas={contasMock}
            onConfirmar={handleContaConfirmada}
          />
        )}

      </div>
    </SubPageLayout>
  );
}
