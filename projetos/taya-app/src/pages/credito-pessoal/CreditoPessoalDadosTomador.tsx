import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ClipboardText,
  FileText,
  IdentificationCard,
  LockSimple,
  MapPin,
  ShieldCheck,
  User,
  Warning,
} from "@phosphor-icons/react";
import { IMaskInput } from "react-imask";
import { SubPageLayout } from "@/App";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import UnicoNotice from "@/components/UnicoNotice";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const inputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const selectClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none";

function OptionBtn({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-xl border px-3 text-sm transition-colors ${
        selected
          ? "border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]"
          : "border-border text-foreground hover:border-[#E8590A]/40"
      }`}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500">{msg}</p>;
}

const validarDataAdmissao = (v: string): string | undefined => {
  if (!v || v.replace(/\D/g, "").length < 8) return "Data inválida";
  const [d, m, y] = v.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime()) || date.getDate() !== d || date.getMonth() !== m - 1) return "Data inválida";
  if (date > new Date()) return "A data não pode ser futura";
  return undefined;
};

// ---------------------------------------------------------------------------
// Fluxo
//
// Normal:         intro → 1 (doc) → 2 (dados) → 3 (PEP) → 4 (endereço)
// Pre-preench.:   intro → preview  → 1 (doc)   → 3 (PEP) → 4 (endereço)
// Retornante:     intro → 2 (dados) → 3 (PEP) → 4 (endereço)  [step 1 pulado]
// ---------------------------------------------------------------------------
type FormStep = 1 | 2 | 3 | 4;
type FlowStep = "intro" | "preview" | FormStep;

const STEP_LABELS: Record<FormStep, string> = { 1: "Documento", 2: "Dados", 3: "PEP", 4: "Endereço" };

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function CreditoPessoalDadosTomador() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState = (location.state as CreditoPessoalState | null) ?? MOCK_STATE; // DESIGN ONLY

  // DESIGN ONLY — ?modo=pre-preenchido ativa o fluxo com dados já no app
  const prePreenchido = searchParams.get("modo") === "pre-preenchido"; // DESIGN ONLY

  // DESIGN ONLY — ?retornante=true simula usuário com documento já enviado (pula step 1)
  const retornanteParam = searchParams.get("retornante") === "true"; // DESIGN ONLY
  // TODO: verificar via GET /tomadores/{cpf} se documento já foi enviado anteriormente
  const documentoJaEnviado = retornanteParam; // mock — trocar por verificação real

  // DESIGN ONLY — ?step=1|2|3|4 pula direto para um step do formulário
  const stepParam = parseInt(searchParams.get("step") ?? "0", 10); // DESIGN ONLY
  const initialStep: FlowStep = [1, 2, 3, 4].includes(stepParam)
    ? (stepParam as FormStep)
    : "intro";

  const [currentStep, setCurrentStep] = useState<FlowStep>(initialStep);

  // ── Step 1 — Documento ──────────────────────────────────────────────────
  // TEMPORARIAMENTE OCULTO — manter no código para reativação futura
  // Confirmado com Pedro: RG será mockado no backend.
  // Tipo e Estado são obrigatórios para a Zema mas não serão coletados do usuário por ora.
  // Para reativar: mudar step1SubStep inicial para "form" e restaurar step1Completo.
  const [tipoDoc, setTipoDoc] = useState<"RG" | "CNH" | "RNE">("RG");
  const [estadoEmissao, setEstadoEmissao] = useState("");
  const [step1SubStep, setStep1SubStep] = useState<"form" | "unico" | "loading">("unico"); // inicia em "unico" pois campos de tipo/estado estão ocultos
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step1Completo = true; // auto — campos ocultos, tipo default "RG" é suficiente

  // ── Step 2 — Dados pessoais ─────────────────────────────────────────────
  const [nomeMae, setNomeMae] = useState("");
  const [estadoNasc, setEstadoNasc] = useState("");
  const [cidadeNasc, setCidadeNasc] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [sexo, setSexo] = useState("");
  const [nacionalidade, setNacionalidade] = useState("BRASILEIRO"); // backend resolve — campo oculto
  const [ocupacao, setOcupacao] = useState(""); // backend resolve — campo oculto // TODO: confirmar com James — select ou texto livre?
  const [dataAdmissao, setDataAdmissao] = useState(""); // backend resolve — campo oculto
  const [dataAdmissaoErro, setDataAdmissaoErro] = useState<string | undefined>();

  const dataAdmissaoValida = dataAdmissao.replace(/\D/g, "").length === 8 && !validarDataAdmissao(dataAdmissao);
  const step2Completo =
    !!nomeMae && !!estadoNasc && !!cidadeNasc && !!estadoCivil && !!sexo;

  // ── Step 3 — PEP ────────────────────────────────────────────────────────
  const [pep, setPep] = useState<boolean | null>(null);
  const [pepRespondido, setPepRespondido] = useState(false);

  const handlePep = (valor: boolean) => {
    setPep(valor);
    setPepRespondido(true);
  };

  // ── Step 4 — Endereço ───────────────────────────────────────────────────
  const [enderecoConfirmado, setEnderecoConfirmado] = useState<EnderecoData | null>(null);
  const enderecoAlterado =
    enderecoConfirmado !== null &&
    enderecoConfirmado.cep.replace(/\D/g, "") !== locationState.endereco.cep.replace(/\D/g, "");

  // ── Dados pré-preenchidos (DESIGN ONLY) ─────────────────────────────────
  // TODO: substituir por dados reais vindos da API/perfil do usuário
  const dadosPrePreenchidos = [
    { label: "CPF", value: "•••.456.789-••" },
    { label: "Nome completo", value: locationState.dadosConta.nome },
    { label: "Data de nascimento", value: locationState.dataNasc },
    { label: "E-mail", value: locationState.emailLocal },
    { label: "Celular", value: locationState.celularLocal },
    { label: "Sexo", value: "Feminino" },                          // TODO: receber da API
    { label: "Estado civil", value: "Solteiro(a)" },               // TODO: receber da API
    { label: "Nome da mãe", value: "Ana da Silva" },               // TODO: receber da API
    { label: "Estado de nascimento", value: "SP" },                // TODO: receber da API
    { label: "Cidade de nascimento", value: "São Paulo" },         // TODO: receber da API
    {
      label: "Endereço",
      value: `${locationState.endereco.logradouro}, ${locationState.endereco.numero} — ${locationState.endereco.bairro}, ${locationState.endereco.estado}`,
    },
  ]; // TODO: receber da API

  const dadosFaltando = 2; // Documento de identidade + PEP // TODO: calcular dinamicamente

  // ── Navegação ───────────────────────────────────────────────────────────

  const handleIntroNext = () => {
    if (documentoJaEnviado) {
      setCurrentStep(2); // pula step 1 (documento já cadastrado)
    } else {
      setCurrentStep(prePreenchido ? "preview" : 1);
    }
  };

  const goNext = () => {
    if (currentStep === 1) {
      if (!step1Completo) return;
      setStep1SubStep("unico"); // campos ocultos — vai direto ao UnicoNotice
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const goBack = () => {
    if (currentStep === 1) {
      setStep1SubStep("unico"); // reset por segurança
      setCurrentStep(prePreenchido ? "preview" : "intro");
    } else if (currentStep === 2) {
      if (documentoJaEnviado) {
        setCurrentStep("intro");
      } else {
        setCurrentStep(1);
      }
    } else if (currentStep === 3) {
      setCurrentStep(prePreenchido ? 1 : documentoJaEnviado ? 2 : 2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else {
      navigate(-1);
    }
  };

  const canAdvance =
    currentStep === 1 ? step1Completo :
    currentStep === 2 ? step2Completo :
    currentStep === 3 ? pepRespondido :
    true;

  // Auto-avanço após loading de verificação de identidade
  useEffect(() => {
    if (step1SubStep !== "loading") return;
    loadingTimerRef.current = setTimeout(() => {
      setStep1SubStep("unico"); // reset para próxima vez
      setCurrentStep(prePreenchido ? 3 : 2);
    }, 2500); // TODO: substituir por callback real do SDK Unico
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [step1SubStep, prePreenchido]);

  // Itens customizados para captura de documento no Unico
  const unicoItensDocumento = [
    { icon: ShieldCheck,       titulo: "Ambiente seguro",    desc: "Verificação criptografada" },
    { icon: IdentificationCard, titulo: "Foto do documento", desc: "Menos de 1 minuto"         },
    { icon: FileText,           titulo: "Assinatura digital", desc: "Válida juridicamente"      },
  ];

  const handleConfirmarEndereco = (end: EnderecoData) => {
    setEnderecoConfirmado(end);
    navigate("/credito-pessoal/conta", {
      state: {
        ...locationState,
        dadosTomador: {
          // TEMPORARIAMENTE OCULTO — backend envia RG internamente conforme combinado com Pedro
          tipoDoc, estadoEmissao,
          nomeMae:       prePreenchido ? "Ana da Silva"   : nomeMae,     // TODO: receber da API
          estadoNasc:    prePreenchido ? "SP"             : estadoNasc,  // TODO: receber da API
          cidadeNasc:    prePreenchido ? "São Paulo"      : cidadeNasc,  // TODO: receber da API
          estadoCivil:   prePreenchido ? "SOLTEIRO"       : estadoCivil, // TODO: receber da API
          sexo:          prePreenchido ? "FEMININO"       : sexo,        // TODO: receber da API
          nacionalidade: prePreenchido ? "BRASILEIRO"     : nacionalidade, // TODO: receber da API
          ocupacao:      prePreenchido ? "CLT"            : ocupacao,    // TODO: confirmar com James — select ou texto livre?
          dataAdmissao:  prePreenchido ? ""               : dataAdmissao, // TODO: receber da API no modo pre-preenchido
          pep,
          endereco: end,
        },
      },
    });
  };

  // ── Progress bar — adapta ao modo ───────────────────────────────────────
  const isFormStep = typeof currentStep === "number";
  const formStepsAtivos: FormStep[] = documentoJaEnviado ? [2, 3, 4] : prePreenchido ? [1, 3, 4] : [1, 2, 3, 4];
  const stepIndex = isFormStep ? formStepsAtivos.indexOf(currentStep as FormStep) : -1;
  const totalFormSteps = formStepsAtivos.length;

  return (
    <SubPageLayout title="Seus dados" hideNav>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[560px]">

        {/* ── Progress bar — apenas nos steps do formulário ── */}
        {isFormStep && (
          <>
            <div className="flex gap-1">
              {formStepsAtivos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? "bg-[#E8590A]" : "bg-border"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Etapa {stepIndex + 1} de {totalFormSteps} — {STEP_LABELS[currentStep as FormStep]}
            </p>
          </>
        )}

        {/* ══════════════════════════════════════════
            TELA INTRO — antes do formulário
        ══════════════════════════════════════════ */}
        {currentStep === "intro" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7]">
                <ClipboardText size={32} className="text-[#E8590A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Mais alguns dados necessários</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Para formalizar sua proposta, precisamos confirmar algumas informações adicionais.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">O que vamos precisar</p>
              {[
                !documentoJaEnviado && !prePreenchido && { icon: IdentificationCard, text: "Documento de identificação" },
                !prePreenchido && { icon: User, text: "Dados pessoais complementares" },
                { icon: ShieldCheck, text: "Declaração de PEP" },
                { icon: MapPin, text: "Confirmação de endereço" },
              ].filter(Boolean).map((item) => {
                const { icon: Icon, text } = item as { icon: React.ElementType; text: string };
                return (
                  <div key={text} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7]">
                      <Icon size={18} className="text-[#E8590A]" />
                    </div>
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-20 z-40 bg-background pb-4 pt-2 md:bottom-0">
              <button
                type="button"
                onClick={handleIntroNext}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white hover:bg-[#A33D05]"
              >
                Começar
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            TELA PREVIEW — dados já cadastrados
            DESIGN ONLY: ?modo=pre-preenchido
        ══════════════════════════════════════════ */}
        {currentStep === "preview" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Dados que você já nos passou</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Encontramos essas informações no seu cadastro.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Já cadastrado</p>
              </div>
              <div className="divide-y divide-border px-4">
                {dadosPrePreenchidos.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
                    </div>
                    <LockSimple size={16} className="ml-3 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#E8590A]/20 bg-[#FEF0E7] px-4 py-3">
              <ClipboardText size={20} className="shrink-0 text-[#E8590A]" />
              <p className="text-sm text-foreground">
                Você tem mais{" "}
                <span className="font-semibold text-[#E8590A]">
                  {dadosFaltando} {dadosFaltando === 1 ? "dado" : "dados"}
                </span>{" "}
                para nos passar
              </p>
            </div>

            <div className="sticky bottom-20 z-40 bg-background pb-4 pt-2 md:bottom-0">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white hover:bg-[#A33D05]"
              >
                Completar cadastro
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — Documento

            TEMPORARIAMENTE OCULTO — manter no código para reativação futura
            Confirmado com Pedro: RG será mockado no backend.
            Tipo e Estado são obrigatórios para a Zema mas não serão coletados do usuário por ora.
            Para reativar: remover a classe 'hidden' abaixo e mudar step1SubStep inicial para "form".
        ══════════════════════════════════════════ */}
        {currentStep === 1 && step1SubStep === "form" && (
          <div className="hidden space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-base font-semibold text-foreground">Documento de identificação</p>

            {/* TEMPORARIAMENTE OCULTO — Tipo de documento */}
            <div className="hidden space-y-2">
              <FieldLabel>Tipo de documento</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {(["RG", "CNH", "RNE"] as const).map((t) => (
                  <OptionBtn
                    key={t}
                    selected={tipoDoc === t}
                    onClick={() => setTipoDoc(t)}
                  >
                    {t}
                  </OptionBtn>
                ))}
              </div>
            </div>

            {/* TEMPORARIAMENTE OCULTO — Estado de emissão */}
            <div className="hidden space-y-1">
              <FieldLabel>Estado de emissão</FieldLabel>
              <select
                value={estadoEmissao}
                onChange={(e) => setEstadoEmissao(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecione o estado</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* UnicoNotice — exibido diretamente no step 1 (campos de tipo/estado estão ocultos) */}
        {currentStep === 1 && step1SubStep === "unico" && (
          // TODO: substituir onContinuar por acionamento real do token_sdk Unico quando disponível
          <UnicoNotice
            titulo="Vamos verificar seu documento"
            descricao="Você será direcionado para capturar uma foto do seu documento de identidade. O processo é seguro e leva menos de 1 minuto."
            itens={unicoItensDocumento}
            labelBotao="Continuar para captura"
            onContinuar={() => setStep1SubStep("loading")} // TODO: substituir por acionamento real do token_sdk Unico
          />
        )}

        {/* Loading verificação de identidade — entre UnicoNotice e step 2 */}
        {currentStep === 1 && step1SubStep === "loading" && (
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <style>{`@keyframes pulse-dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}}`}</style>
            <div className="flex items-center gap-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-4 w-4 rounded-full bg-[#E8590A]"
                  style={{ animation: "pulse-dot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Verificando sua identidade...</h2>
              <p className="mt-2 text-sm text-muted-foreground">Aguarde enquanto confirmamos seu documento.</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — Dados pessoais
            (não exibido no modo pre-preenchido)
        ══════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-base font-semibold text-foreground">Dados pessoais</p>

            {/* Nota para usuário retornante — documento já cadastrado */}
            {documentoJaEnviado && (
              <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5">
                <CheckCircle size={16} className="shrink-0 text-green-600" weight="fill" />
                <p className="text-xs text-green-700">Seu documento já está cadastrado.</p>
              </div>
            )}

            <div className="space-y-1">
              <FieldLabel>Nome da mãe</FieldLabel>
              <input value={nomeMae} onChange={(e) => setNomeMae(e.target.value)} className={inputClass} placeholder="Nome completo da mãe" />
            </div>

            <div className="space-y-1">
              <FieldLabel>Estado de nascimento</FieldLabel>
              <select value={estadoNasc} onChange={(e) => setEstadoNasc(e.target.value)} className={selectClass}>
                <option value="">Selecione o estado</option>
                {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <FieldLabel>Cidade de nascimento</FieldLabel>
              <input value={cidadeNasc} onChange={(e) => setCidadeNasc(e.target.value)} className={inputClass} placeholder="Cidade" />
            </div>

            <div className="space-y-2">
              <FieldLabel>Estado civil</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Solteiro(a)", value: "SOLTEIRO" },
                  { label: "Casado(a)", value: "CASADO" },
                  { label: "Divorciado(a)", value: "DIVORCIADO" },
                  { label: "Amasiado(a)", value: "AMASIADO" },
                  { label: "Viúvo(a)", value: "VIUVO" },
                  { label: "Desquitado(a)", value: "DESQUITADO" },
                  { label: "Outros", value: "OUTROS" },
                ].map((o) => (
                  <OptionBtn key={o.value} selected={estadoCivil === o.value} onClick={() => setEstadoCivil(o.value)}>
                    {o.label}
                  </OptionBtn>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Sexo</FieldLabel>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: "Masculino", value: "MASCULINO" }, { label: "Feminino", value: "FEMININO" }, { label: "Outro", value: "OUTRO" }].map((o) => (
                  <OptionBtn key={o.value} selected={sexo === o.value} onClick={() => setSexo(o.value)}>{o.label}</OptionBtn>
                ))}
              </div>
            </div>

            {/* TEMPORARIAMENTE OCULTO — backend envia valor genérico. Remover className="hidden" para reativar. */}
            <div className="hidden space-y-2">
              <FieldLabel>Nacionalidade</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {[{ label: "Brasileiro(a)", value: "BRASILEIRO" }, { label: "Estrangeiro(a)", value: "ESTRANGEIRO" }].map((o) => (
                  <OptionBtn key={o.value} selected={nacionalidade === o.value} onClick={() => setNacionalidade(o.value)}>{o.label}</OptionBtn>
                ))}
              </div>
            </div>

            {/* TEMPORARIAMENTE OCULTO — backend envia valor genérico. Remover className="hidden" para reativar. */}
            {/* Ocupação — texto livre // TODO: confirmar com James — select ou texto livre? */}
            <div className="hidden space-y-1">
              <FieldLabel>Ocupação</FieldLabel>
              <input
                type="text"
                value={ocupacao}
                onChange={(e) => setOcupacao(e.target.value)}
                className={inputClass}
                placeholder="Ex: Professor, Engenheiro, Autônomo..."
              />
            </div>

            {/* TEMPORARIAMENTE OCULTO — backend envia valor genérico. Remover className="hidden" para reativar. */}
            <div className="hidden space-y-1">
              <FieldLabel>Data de admissão</FieldLabel>
              <IMaskInput
                mask="00/00/0000"
                value={dataAdmissao}
                onAccept={(v) => {
                  setDataAdmissao(String(v));
                  if (String(v).replace(/\D/g, "").length === 8) {
                    setDataAdmissaoErro(validarDataAdmissao(String(v)));
                  } else {
                    setDataAdmissaoErro(undefined);
                  }
                }}
                className={inputClass}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
              />
              <FieldError msg={dataAdmissaoErro} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — PEP
        ══════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">
                Você é uma Pessoa Politicamente Exposta?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                PEP é quem exerce ou exerceu cargo público relevante — como político,
                dirigente de empresa pública ou familiar direto dessas pessoas.
                Essa informação é exigida pelo Banco Central.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePep(true)}
                className={`flex h-14 items-center justify-center rounded-2xl border text-sm font-semibold transition-all ${
                  pep === true
                    ? "border-[#E8590A] bg-[#FEF0E7] text-[#E8590A]"
                    : "border-border bg-white text-foreground hover:border-[#E8590A]/40"
                }`}
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => handlePep(false)}
                className={`flex h-14 items-center justify-center rounded-2xl border text-sm font-semibold transition-all ${
                  pep === false && pepRespondido
                    ? "border-[#E8590A] bg-[#FEF0E7] text-[#E8590A]"
                    : "border-border bg-white text-foreground hover:border-[#E8590A]/40"
                }`}
              >
                Não
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 4 — Endereço
        ══════════════════════════════════════════ */}
        {currentStep === 4 && (
          <>
            {enderecoAlterado && (
              <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <Warning size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">
                  O CEP deve ser o mesmo informado na consulta de oferta. Alterar pode afetar sua proposta.
                </p>
              </div>
            )}
            <EnderecoSelector
              enderecos={[locationState.endereco]}
              onConfirmar={handleConfirmarEndereco}
            />
          </>
        )}

        {/* ── CTA — oculto na intro, preview, step 4, UnicoNotice e loading ── */}
        {isFormStep && currentStep !== 4 && !(currentStep === 1 && (step1SubStep === "unico" || step1SubStep === "loading")) && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={goBack}
              className="flex h-12 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground transition-colors hover:border-[#E8590A]/40"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={!canAdvance}
              onClick={goNext}
              className={`flex h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-colors ${
                canAdvance ? "bg-[#E8590A] hover:bg-[#A33D05]" : "cursor-not-allowed bg-[#E8590A] opacity-40"
              }`}
            >
              Continuar
              <ArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </SubPageLayout>
  );
}
