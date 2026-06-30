import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowSquareOut,
  DownloadSimple,
  FilePdf,
  Info,
  UserPlus,
  X,
} from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { usePrivacy } from "@/context/PrivacyContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (v: number) =>
  (v * 100).toFixed(4).replace(/\.?0+$/, "").replace(".", ",");

// ---------------------------------------------------------------------------
// SensitiveData — replica o padrão do App.tsx (SensitiveData não é exportado)
// ---------------------------------------------------------------------------

function SensitiveData({ value, type = "text" }: { value: string; type?: "cpf" | "phone" | "currency" | "text" }) {
  const { dataVisible } = usePrivacy();
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", currency: "R$ ••••", text: "••••••••" }[type];
  return <span className="text-xs font-semibold text-foreground">{dataVisible ? value : masked}</span>;
}

// ---------------------------------------------------------------------------
// Mock — TODO: receber da API
// ---------------------------------------------------------------------------

const contratoMock = {
  id: "mock-001",
  numeroCCB: "0011113541",          // campo 3.0 — TODO: receber da API
  dataEmissao: "10/06/2026",        // TODO: receber da API
  valorMutuo: 183420,               // centavos — campo 3.1 — TODO: receber da API
  valorDesembolso: 170000,          // centavos — campo 3.2 (valor solicitado) — TODO: receber da API
  parcelas: 6,                      // TODO: receber da API
  parcelasPagas: 1,                 // TODO: receber da API
  valorParcela: 45883,              // centavos — campo 3.6 — TODO: receber da API
  totalAPagar: 275298,              // centavos — campo 3.6 total — TODO: receber da API
  primeiroVenc: "10/07/2026",       // campo 3.4 — TODO: receber da API
  ultimoVenc: "10/12/2026",         // campo 3.5 — TODO: receber da API
  taxaJuros: 0.13,                  // decimal — campo 3.8 — TODO: receber da API
  taxaJurosAnual: 3.3345,           // decimal — campo 3.9 — TODO: receber da API
  cetMensal: 0.1551,                // decimal — campo 3.10 — TODO: receber da API
  cetAnual: 4.7782,                 // decimal — campo 3.11 — TODO: receber da API
  valorIof: 2420,                   // centavos — campo 3.18.3 — TODO: receber da API
  tac: 11000,                       // centavos — campo 3.18.1 — TODO: receber da API
  valorSeguro: 0,                   // centavos — campo 3.18.2 — TODO: receber da API
  formaPagamento: "Boleto",         // campo 3.13 — TODO: receber da API
  multaAtraso: 2.0,                 // % — TODO: receber da API
  jurosMora: 1.0,                   // % ao mês — TODO: receber da API
  // Dados do emitente — TODO: receber da API (dados reais virão da CCB)
  nomeEmitente: "DADO SENSÍVEL",
  cpfEmitente: "DADO SENSÍVEL",
  dataNasc: "23/06/1985",           // TODO: receber da API
  // Dados bancários — TODO: receber da API
  banco: "Nubank",
  agencia: "0001",
  numeroConta: "12345678",
  digitoConta: "9",
  tipoConta: "CORRENTE",
};

// TODO: receber de GET /propostas/{id}/boleto/detalhes
const boletosMock = {
  url_boleto: "#",
  parcelas: [
    { numero: 1, vencimento: "2026-07-10", valor: 45883 },
    { numero: 2, vencimento: "2026-08-10", valor: 45883 },
    { numero: 3, vencimento: "2026-09-10", valor: 45883 },
    { numero: 4, vencimento: "2026-10-10", valor: 45883 },
    { numero: 5, vencimento: "2026-11-10", valor: 45883 },
    { numero: 6, vencimento: "2026-12-10", valor: 45883 },
  ],
};

const fmtISODate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalContratoPage() {
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — ?status=ativo|aguardando|encerrado
  const statusParam = (searchParams.get("status") ?? "ativo") as "ativo" | "aguardando" | "encerrado"; // DESIGN ONLY

  // DESIGN ONLY — ?zema=novo|existente
  const zemaStatus = (searchParams.get("zema") ?? "novo") as "novo" | "existente"; // DESIGN ONLY

  const [mostrarOnboardingZema, setMostrarOnboardingZema] = useState(false);

  const parcelasPagas = contratoMock.parcelasPagas;
  const totalParcelas = contratoMock.parcelas;
  const progresso = (parcelasPagas / totalParcelas) * 100;
  // TODO: receber da API
  const saldoDevedor = contratoMock.valorParcela * (totalParcelas - parcelasPagas);
  // Dia de pagamento derivado do campo 3.4 (primeiroVenc)
  const diaPagamento = contratoMock.primeiroVenc.split("/")[0];

  const statusConfig = {
    ativo:      { cor: "bg-green-500",  texto: "Ativo",                 corTexto: "text-green-700"  },
    aguardando: { cor: "bg-yellow-400", texto: "Aguardando assinatura", corTexto: "text-yellow-700" },
    encerrado:  { cor: "bg-gray-400",   texto: "Encerrado",             corTexto: "text-gray-600"   },
  }[statusParam];

  return (
    <SubPageLayout title="Crédito Pessoal">
      <div className="flex flex-col gap-5 pb-10 md:mx-auto md:max-w-[560px]">

        {/* Botão download CCB — alinhado à direita antes do conteúdo */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              // TODO: conectar ao GET /propostas/{id}/ccb
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-muted"
            aria-label="Baixar contrato"
          >
            <DownloadSimple size={18} className="text-foreground" />
          </button>
        </div>

        {/* ── Seção 1 — Banner de demonstração ── */}
        {/* TODO: remover quando API estiver conectada */}
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs leading-snug text-amber-700">
            Este é um contrato de exemplo para fins de demonstração. Os dados reais serão exibidos após integração com o sistema.
          </p>
        </div>

        {/* ── Seção 2 — Status e identificação ── */}
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusConfig.cor}`} />
            <span className={`text-sm font-medium ${statusConfig.corTexto}`}>{statusConfig.texto}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Crédito Pessoal</h2>
        </div>

        {/* ── Seção 3 — Metadados da CCB (grid 2 colunas) ── */}
        {/* TODO: campos reais da CCB — aguardando modelo do Pedro */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Número da CCB</p>
            <p className="text-sm font-semibold text-foreground">{contratoMock.numeroCCB}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data de emissão</p>
            <p className="text-sm font-semibold text-foreground">{contratoMock.dataEmissao}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modalidade</p>
            <p className="text-sm font-semibold leading-snug text-foreground">EP – Empréstimo Pessoal</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor líquido recebido</p>
            <p className="text-sm font-semibold text-foreground">R$ {formatCents(contratoMock.valorDesembolso)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data 1º vencimento</p>
            <p className="text-sm font-semibold text-foreground">{contratoMock.primeiroVenc}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data último vencimento</p>
            <p className="text-sm font-semibold text-foreground">{contratoMock.ultimoVenc}</p>
          </div>
        </div>

        {/* ── Seção 4 — Card de parcelas ── */}
        <div className="rounded-2xl bg-[#A33D05] p-4 text-white">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Parcelas</h3>
            <span className="text-xs opacity-80">{totalParcelas - parcelasPagas} de {totalParcelas} restantes</span>
          </div>

          {/* Barra de progresso */}
          <div className="mb-4 h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs opacity-70">Valor da parcela</p>
              <p className="text-sm font-bold">R$ {formatCents(contratoMock.valorParcela)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Próximo vencimento</p>
              <p className="text-sm font-bold">{contratoMock.primeiroVenc}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Saldo devedor</p>
              {/* TODO: receber da API */}
              <p className="text-sm font-bold">R$ {formatCents(saldoDevedor)}</p>
            </div>
            <div>
              <p className="text-xs opacity-70">Dia de pagamento</p>
              <p className="text-sm font-bold">Todo dia {diaPagamento}</p>
            </div>
          </div>
        </div>

        {/* ── Botão carnê isolado ── */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#E8590A] text-sm font-semibold text-[#E8590A] transition-colors hover:bg-[#FEF0E7]"
          // TODO: substituir "#" pela url_boleto de GET /propostas/{id}/boleto/detalhes
        >
          <FilePdf size={18} />
          Ver carnê completo
        </a>

        {/* ── Seção 5 — Taxas e custos ── */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Taxas e custos</h3>
          <div className="space-y-2.5">
            {[
              {
                label: "Taxa de juros",
                value: `${fmtPct(contratoMock.taxaJuros)}% a.m. / ${fmtPct(contratoMock.taxaJurosAnual)}% a.a.`,
              },
              {
                // CET vem da CCB (campos 3.10 e 3.11)
                // TODO: quando API disponibilizar CET na simulação (P2), usar valor da API em vez do mock
                label: "CET",
                value: `${fmtPct(contratoMock.cetMensal)}% a.m. / ${fmtPct(contratoMock.cetAnual)}% a.a.`,
              },
              { label: "IOF", value: `R$ ${formatCents(contratoMock.valorIof)}` },
              ...(contratoMock.tac > 0
                ? [{ label: "TAC", value: `R$ ${formatCents(contratoMock.tac)}` }]
                : []),
              ...(contratoMock.valorSeguro > 0
                ? [{ label: "Seguro", value: `R$ ${formatCents(contratoMock.valorSeguro)}` }]
                : []),
              { label: "Total a pagar", value: `R$ ${formatCents(contratoMock.totalAPagar)}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xs font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
            {/* Encargos por atraso */}
            <div className="border-t border-border pt-2.5">
              <p className="text-xs text-muted-foreground">Encargos por atraso</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">
                Multa {contratoMock.multaAtraso.toFixed(0)}% + Juros de mora {contratoMock.jurosMora.toFixed(0)}% + Juros remuneratórios {fmtPct(contratoMock.taxaJuros)}% a.m.
              </p>
            </div>
          </div>
        </div>

        {/* ── Seção 6 — Dados do emitente ── */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Dados do emitente</h3>
          {/* TODO: completar com campos reais da CCB quando Pedro enviar modelo */}
          <div className="space-y-3">
            {[
              { label: "Nome completo", value: contratoMock.nomeEmitente, sensitive: true, type: "text" as const },
              { label: "CPF", value: contratoMock.cpfEmitente, sensitive: true, type: "cpf" as const },
              { label: "Data de nascimento", value: contratoMock.dataNasc, sensitive: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                {item.sensitive ? (
                  <SensitiveData value={item.value} type={item.type ?? "text"} />
                ) : (
                  <p className="text-xs font-semibold text-foreground">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Seção 7 — Dados para depósito ── */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Dados para depósito</h3>
          {/* TODO: completar com campos reais da CCB */}
          <div className="space-y-3">
            {[
              { label: "Banco", value: contratoMock.banco },
              { label: "Agência", value: contratoMock.agencia },
              { label: "Conta", value: `${contratoMock.numeroConta}-${contratoMock.digitoConta}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <SensitiveData value={item.value} type="text" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Bloco: Gerenciar contrato na Zema ── */}
        {/* DESIGN ONLY — ?zema=novo (default) | existente */}
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Gerencie seu contrato</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Boletos, histórico de pagamentos e segunda via estão disponíveis
              na área do cliente da Zema Financeira.
            </p>
          </div>

          {zemaStatus === "novo" ? (
            <button
              type="button"
              onClick={() => setMostrarOnboardingZema(true)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-sm font-semibold text-white"
            >
              <UserPlus size={18} />
              Criar minha conta na Zema Financeira
            </button>
          ) : (
            <a
              href="https://minhaconta.zemafinanceira.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-sm font-semibold text-white"
            >
              <ArrowSquareOut size={18} />
              Acessar minha conta Zema
            </a>
          )}
        </div>

        {/* ── Seção 8 — Quitar antecipadamente (desabilitado) ── */}
        <div className="pointer-events-none rounded-2xl border border-dashed border-border bg-white p-4 opacity-60 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Quitar antecipadamente</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Pague o saldo devedor e encerre o contrato antes do prazo.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              EM BREVE
            </span>
          </div>
        </div>

        {/* ── Rodapé informativo ── */}
        <p className="text-center text-xs text-muted-foreground">
          {/* TODO: atualizar para domínio definitivo quando registrado */}
          Documento com validade jurídica. Consulte os termos em podeja.com.br.
        </p>

      </div>

      {/* ── Modal/drawer: Como criar conta na Zema ── */}
      {mostrarOnboardingZema && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-t-3xl md:rounded-3xl bg-background p-6 space-y-5">

            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Como criar sua conta na Zema</p>
              <button type="button" onClick={() => setMostrarOnboardingZema(false)}>
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { numero: "1", titulo: "Acesse o cadastro da Zema", descricao: "Toque no botão abaixo para ir direto à página de cadastro da Zema Financeira." },
                { numero: "2", titulo: "Crie sua conta", descricao: "Preencha o cadastro com os mesmos dados que você usou aqui no Pode Já (mesmo CPF)." },
                { numero: "3", titulo: "Defina sua senha", descricao: "Siga as instruções da Zema para criar sua senha de acesso." },
                { numero: "4", titulo: "Pronto!", descricao: "Lá você encontra seus boletos, histórico de pagamentos e segunda via." },
              ].map((passo) => (
                <div key={passo.numero} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF0E7] text-xs font-bold text-[#E8590A]">
                    {passo.numero}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{passo.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{passo.descricao}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* TODO: quando Zema confirmar criação automática de conta, substituir os passos
                acima por exibição de CPF + senha de primeiro acesso gerada automaticamente */}
            <p className="text-xs text-muted-foreground text-center" />

            <a
              href="https://minhaconta.zemafinanceira.com/cadastro-dados-pessoais"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-sm font-semibold text-white"
            >
              <ArrowSquareOut size={18} />
              Ir para o cadastro da Zema
            </a>

          </div>
        </div>
      )}
    </SubPageLayout>
  );
}
