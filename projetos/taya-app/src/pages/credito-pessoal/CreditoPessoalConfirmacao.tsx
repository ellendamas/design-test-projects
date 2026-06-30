import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, FilePdf, Receipt } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// TODO: receber da API — GET /bancarizacao/bancos
const BANCOS_MOCK: Record<string, string> = {
  "001": "Banco do Brasil",
  "033": "Santander",
  "077": "Inter",
  "104": "Caixa Econômica Federal",
  "237": "Bradesco",
  "260": "Nu Pagamentos (Nubank)",
  "341": "Itaú",
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type ContaBancaria = {
  codigoBanco: string;
  agencia: string;
  numeroConta: string;
  digitoConta: string;
  tipoConta: string;
};

type OfertaSelecionada = {
  parcelas: number;
  valorParcela: number;
  primeiroVenc: string;
};

type LocationState = {
  ofertaSelecionada?: OfertaSelecionada;
  valorSolicitado?: number;
  contaBancaria?: ContaBancaria;
  [key: string]: unknown;
};

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" }, // TODO: receber da API
  emailLocal: "cliente@exemplo.com", // TODO: receber da API
  celularLocal: "(11) 99999-8888", // TODO: receber da API
  dataNasc: "12/08/1989", // TODO: receber da API
  faixaRenda: "R$ 4.500,00", // TODO: receber da API
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" }, // TODO: receber da API
  valorMinimo: 50000, // TODO: receber da API
  valorMaximo: 500000, // TODO: receber da API
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API
  valorSolicitado: 275000, // TODO: receber da API
  dadosTomador: { tipoDoc: "RG", numeroDoc: "12.345.678-9", dataEmissao: "15/03/2010", orgaoEmissor: "SSP", estadoEmissao: "SP", nomeMae: "Ana da Silva", estadoNasc: "SP", cidadeNasc: "São Paulo", estadoCivil: "SOLTEIRO", sexo: "FEMININO", nacionalidade: "BRASILEIRO", ocupacao: "1", pep: false, endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" } }, // TODO: receber da API
  contaBancaria: { codigoBanco: "341", agencia: "1234", numeroConta: "56789", digitoConta: "0", tipoConta: "CORRENTE" }, // TODO: receber da API
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function CreditoPessoalConfirmacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const periodo = searchParams.get("periodo") ?? "antes17h"; // DESIGN ONLY

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const st =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  const oferta = st.ofertaSelecionada;
  const valorSolicitado = st.valorSolicitado ?? 0;
  const conta = st.contaBancaria;

  const nomeBanco = conta
    ? (BANCOS_MOCK[conta.codigoBanco] ?? `Banco ${conta.codigoBanco}`) // TODO: receber da API
    : "—";
  const ultimosConta = conta ? conta.numeroConta.slice(-4) : "0000";
  const contaDisplay = conta ? `${nomeBanco} ••••${ultimosConta}` : "—";

  const mensagemPeriodo =
    periodo === "apos17h"
      ? "O valor cai na sua conta no próximo dia útil."
      : "O valor cai na sua conta em até 20 minutos."; // TODO: receber da API

  return (
    <SubPageLayout title="Proposta aprovada">
      <div className="flex flex-col items-center gap-5 pb-24 pt-6 md:mx-auto md:max-w-[560px]">

        {/* ── Animação de sucesso (padrão CLT) ── */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </motion.div>

        {/* ── Textos ── */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">Proposta aprovada!</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {mensagemPeriodo}
          </p>
        </div>

        {/* ── Card resumo — neutro ── */}
        {oferta && (
          <div className="w-full rounded-2xl border border-border bg-white p-4 shadow-sm">
            {[
              {
                label: "Valor liberado",
                value: `R$ ${formatCents(valorSolicitado)}`,
                valueClass: "text-lg font-bold text-[#E8590A]",
              },
              {
                label: "Parcelas",
                value: `${oferta.parcelas}x de R$ ${formatCents(oferta.valorParcela)}`,
                valueClass: "text-sm font-medium text-foreground",
              },
              {
                label: "Primeiro vencimento",
                value: oferta.primeiroVenc,
                valueClass: "text-sm text-foreground",
              },
              {
                label: "Conta de destino",
                value: contaDisplay,
                valueClass: "text-sm text-foreground",
              },
            ].map((linha) => (
              <div
                key={linha.label}
                className="flex items-center justify-between border-b border-border py-2 last:border-0"
              >
                <span className="text-sm text-muted-foreground">{linha.label}</span>
                <span className={linha.valueClass}>{linha.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Card boletos simplificado ── */}
        {/* TODO: conectar ao GET /propostas/{id}/boleto/detalhes */}
        <div className="w-full rounded-2xl bg-[#FEF0E7] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-[#E8590A]" />
            <p className="text-sm font-semibold text-foreground">Seus boletos</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Todos os seus boletos foram gerados. Você pode visualizá-los agora
            ou acessá-los a qualquer momento pela sua conta na Zema Financeira.
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E8590A] text-sm font-semibold text-[#E8590A]"
            // TODO: substituir "#" pela url_boleto de GET /propostas/{id}/boleto/detalhes
          >
            <FilePdf size={16} />
            Ver carnê completo
          </a>
        </div>

      </div>

      {/* ── Rodapé sticky ── */}
      <div className="sticky bottom-20 z-40 w-full bg-background pb-4 pt-2 md:bottom-0 md:mx-auto md:max-w-[560px]">
        <button
          type="button"
          onClick={() => navigate("/painel")}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white hover:bg-[#A33D05]"
        >
          Ir para o início
        </button>
      </div>
    </SubPageLayout>
  );
}
