import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, X } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import ContaSelector, { type ContaData } from "@/components/ContaSelector";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type EnderecoData = {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
};

type CreditoPessoalState = {
  dadosConta: { cpf: string; nome: string };
  emailLocal: string;
  celularLocal: string;
  dataNasc: string;
  faixaRenda: string;
  endereco: EnderecoData;
  valorMinimo: number;
  valorMaximo: number;
  ofertaSelecionada: {
    id: string;
    parcelas: number;
    valorParcela: number;
    taxaJuros: number;
    taxaJurosAnual: number;
    tac: number;
    valorIof: number;
    primeiroVenc: string;
  };
  valorSolicitado: number;
  dadosTomador?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// DESIGN ONLY — mock state para acesso direto via URL de design
// ---------------------------------------------------------------------------
const MOCK_STATE: CreditoPessoalState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" },
  valorMinimo: 50000,
  valorMaximo: 500000,
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" },
  valorSolicitado: 275000,
};

// TODO: receber da API — GET /bancarizacao/bancos
// (ContaSelector já possui lista interna; este mock é informativo apenas)
const _bancosMock = [
  { codigo: "001", nome: "Banco do Brasil" },
  { codigo: "033", nome: "Santander" },
  { codigo: "077", nome: "Inter" },
  { codigo: "104", nome: "Caixa Econômica Federal" },
  { codigo: "237", nome: "Bradesco" },
  { codigo: "260", nome: "Nu Pagamentos (Nubank)" },
  { codigo: "341", nome: "Itaú" },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalConta() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState = (location.state as CreditoPessoalState | null) ?? MOCK_STATE; // DESIGN ONLY

  const [contaSelecionada, setContaSelecionada] = useState<ContaData | null>(null);
  const [mostrarModalErro, setMostrarModalErro] = useState(erroParam !== null);

  const tipoContaEnum: Record<string, string> = {
    "Conta corrente": "CORRENTE",
    "Conta poupança": "POUPANCA",
    "Conta de pagamento": "PAGAMENTO",
  };

  const handleConfirmar = (conta: ContaData) => {
    setContaSelecionada(conta);
    navigate("/credito-pessoal/formalizando", {
      state: {
        ...locationState,
        contaBancaria: {
          codigoBanco: conta.banco?.codigo,
          agencia: conta.agencia,
          numeroConta: conta.conta,
          digitoConta: conta.digito,
          tipoConta: tipoContaEnum[conta.tipoConta] ?? conta.tipoConta,
        },
      },
    });
  };

  return (
    <SubPageLayout title="Conta bancária" hideNav>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[560px]">

        {/* ── Título e subtítulo ── */}
        <div>
          <h2 className="text-lg font-bold text-foreground">Em qual conta você quer receber?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O valor será depositado diretamente nesta conta.
          </p>
        </div>

        {/* ── ContaSelector ──
            PIX não suportado na v1 do Crédito Pessoal
            ContaSelector não expõe opção PIX nativamente, portanto nenhum filtro adicional necessário.
        ── */}
        <ContaSelector
          contas={[]}
          onConfirmar={handleConfirmar}
        />

        {/* ── Prazo de transferência ── */}
        <p className="text-sm text-muted-foreground text-center">
          O valor é transferido em até 1 dia útil após a assinatura.
        </p>

        {/* ── Aviso de titularidade ── */}
        <div className="flex items-start gap-2 rounded-xl bg-muted p-3">
          <Lock size={14} className="mt-0.5 shrink-0 text-[#FD5F31]" />
          <p className="text-xs text-muted-foreground">
            A conta deve estar no seu CPF. Não é permitido receber em conta de terceiros.
          </p>
        </div>

        {/* ── CTA sticky — exibido apenas quando uma conta está selecionada no estado local ──
            Nota: ContaSelector possui CTA interno "Continuar" que chama onConfirmar diretamente.
            Este CTA adicional aparece caso queiramos mostrar estado de seleção prévia.
        ── */}
        {contaSelecionada && (
          <div className="sticky bottom-20 z-40 bg-background pb-4 pt-2 md:bottom-0">
            <button
              type="button"
              onClick={() => handleConfirmar(contaSelecionada)}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-white transition-colors bg-[#FD5F31] hover:bg-[#D94E28]"
            >
              Confirmar e enviar proposta
              <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>

      {/* ── Modal/drawer de erro de conta ── */}
      {erroParam && mostrarModalErro && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl md:rounded-3xl bg-background p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Problema com a conta</p>
              <button type="button" onClick={() => setMostrarModalErro(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            <ErrorScreen
              categoria={erroParam}
              compact
              onTentarNovamente={() => setMostrarModalErro(false)}
            />
          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
