import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { SubPageLayout, getStoredUser } from "@/App";
import { cn } from "@/lib/utils";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData } from "@/components/ContaSelector";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type Passo = "endereco" | "banco";

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
const ENDERECOS_MOCK: EnderecoData[] = [
  {
    logradouro: "Rua Dona Ana Neri",
    numero: "581",
    complemento: "de 501/502 ao fim",
    bairro: "Cambuci",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01522-000",
  },
  {
    logradouro: "Av. Paulista",
    numero: "1374",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
  },
  {
    logradouro: "Rua Augusta",
    numero: "2140",
    complemento: "Apto 42",
    bairro: "Consolação",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01412-100",
  },
  {
    logradouro: "Rua Oscar Freire",
    numero: "900",
    bairro: "Jardins",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01426-001",
  },
  {
    logradouro: "Av. Rebouças",
    numero: "3970",
    complemento: "Bloco B",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05402-600",
  },
];

const CONTAS_MOCK: ContaData[] = [
  {
    banco: { codigo: "077", nome: "Banco Inter" },
    tipoConta: "Conta corrente",
    agencia: "1234",
    conta: "12345",
    digito: "6",
  },
  {
    banco: { codigo: "260", nome: "Nubank" },
    tipoConta: "Conta corrente",
    agencia: "0001",
    conta: "987654",
    digito: "3",
  },
  {
    banco: { codigo: "341", nome: "Itaú Unibanco" },
    tipoConta: "Conta poupança",
    agencia: "5678",
    conta: "11111",
    digito: "0",
  },
  {
    banco: { codigo: "237", nome: "Bradesco" },
    tipoConta: "Conta corrente",
    agencia: "0123",
    conta: "55555",
    digito: "9",
  },
  {
    banco: { codigo: "033", nome: "Santander" },
    tipoConta: "Conta corrente",
    agencia: "9999",
    conta: "66666",
    digito: "1",
  },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const user = getStoredUser();
  void user;

  // DESIGN ONLY — simular N endereços/contas via query param
  // ?endereco=0 → sem endereço (abre formulário direto)
  // ?endereco=1 → 1 endereço salvo (pré-selecionado)
  // ?endereco=3 → 3 endereços salvos (último pré-selecionado)
  // TODO: substituir por dados reais do StoredUser / API
  const nEnderecos = Math.min(
    5,
    Math.max(0, parseInt(searchParams.get("endereco") ?? "0", 10) || 0),
  );
  const nContas = Math.min(
    5,
    Math.max(0, parseInt(searchParams.get("conta") ?? "0", 10) || 0),
  );

  const enderecosMock = ENDERECOS_MOCK.slice(0, nEnderecos);
  const contasMock = CONTAS_MOCK.slice(0, nContas);

  // TODO: quando StoredUser tiver campos de endereço/banco, usar dados reais aqui.
  const faltaEndereco = true;
  const faltaBanco = true;

  const passosNecessarios: Passo[] = [];
  if (faltaEndereco) passosNecessarios.push("endereco");
  if (faltaBanco) passosNecessarios.push("banco");

  // DESIGN ONLY — ?passo=banco pula direto para o passo de conta bancária
  // Útil para testar ContaSelector sem precisar completar o passo de endereço
  const passoInicial = searchParams.get("passo") === "banco"
    ? Math.max(0, passosNecessarios.indexOf("banco"))
    : 0;

  useEffect(() => {
    if (passosNecessarios.length === 0) {
      navigate("/consignado-clt/assinar", { state: location.state, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [passoIndex, setPassoIndex] = useState(passoInicial);
  const passoAtual = passosNecessarios[passoIndex];

  const [enderecoConfirmado, setEnderecoConfirmado] = useState<EnderecoData | null>(null);

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
    navigate("/consignado-clt/assinar", {
      state: {
        ...location.state,
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
    <SubPageLayout title="Dados para recebimento" hideNav>
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
