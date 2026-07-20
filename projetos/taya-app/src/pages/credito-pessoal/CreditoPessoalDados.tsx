import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IMaskInput } from "react-imask";
import {
  ArrowRight,
  Cake,
  CheckCircle,
  ClipboardText,
  CurrencyCircleDollar,
  IdentificationCard,
  LockSimple,
  MapPin,
  User,
} from "@phosphor-icons/react";
import { getStoredUser, SubPageLayout } from "@/App";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function isAdultBirthDate(value: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  )
    return false;
  const now = new Date();
  if (date > now) return false;
  const age =
    now.getFullYear() -
    y -
    (now.getMonth() < m - 1 ||
    (now.getMonth() === m - 1 && now.getDate() < d)
      ? 1
      : 0);
  return age >= 18 && age <= 100;
}

function parseCurrency(v: string): number {
  const n = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  return Number(n) || 0;
}

// ---------------------------------------------------------------------------
// Mock de endereços — DESIGN ONLY
// TODO: substituir por dados reais do StoredUser / API
// ---------------------------------------------------------------------------

const CP_ENDERECOS_MOCK: EnderecoData[] = [
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
];

// ---------------------------------------------------------------------------
// Tipos e fluxo
// ---------------------------------------------------------------------------

type CPStep = "intro" | "dados_conta" | "nascimento" | "renda" | "endereco";

const flow: CPStep[] = ["intro", "dados_conta", "nascimento", "renda", "endereco"];

// ---------------------------------------------------------------------------
// Componente auxiliar — botão de opção
// ---------------------------------------------------------------------------

function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function CreditoPessoalDados() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = getStoredUser();

  // ── Step atual ──
  const [step, setStep] = useState<CPStep>("intro");
  const idx = flow.indexOf(step);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // ── Dados já na conta (mock) ──
  // TODO: substituir por dados reais do StoredUser / API
  const dadosConta = {
    cpf: "123.456.789-00",               // TODO: receber da API
    nome: user?.name ?? "Cliente",
  };

  const [emailLocal, setEmailLocal] = useState(user?.email ?? "cliente@exemplo.com");
  const [celularLocal, setCelularLocal] = useState("(11) 99999-8888"); // TODO: receber da API

  // ── Estado para edição inline de email/celular ──
  const [campoEditandoCP, setCampoEditandoCP] = useState<"email" | "celular" | null>(null);
  const [valorTempCP, setValorTempCP] = useState("");
  const [editErrorCP, setEditErrorCP] = useState("");
  const editOpenCP = campoEditandoCP !== null;

  // ── Dados a coletar ──
  const [dataNasc, setDataNasc] = useState("");
  const [erroDataNasc, setErroDataNasc] = useState("");
  const [faixaRenda, setFaixaRenda] = useState("");
  const [rendaCustom, setRendaCustom] = useState(0);
  const [usarRendaCustom, setUsarRendaCustom] = useState(false);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<EnderecoData | null>(null);

  // ── DESIGN ONLY — ?endereco=N para simular endereços salvos ──
  const nEnderecos = Math.min(
    5,
    Math.max(0, parseInt(searchParams.get("endereco") ?? "2", 10) || 0),
  );
  const enderecosMock = CP_ENDERECOS_MOCK.slice(0, nEnderecos);

  // ── Navegação ──
  const goNext = () => {
    if (idx < flow.length - 1) setStep(flow[idx + 1]);
  };

  const goBack = () => {
    if (step === "intro") return navigate("/credito-pessoal");
    if (idx > 0) setStep(flow[idx - 1]);
  };

  const canAdvance = useMemo(() => {
    if (step === "intro") return true;
    if (step === "dados_conta") return true; // dados já confirmados
    if (step === "nascimento") return isAdultBirthDate(dataNasc);
    if (step === "renda")
      return usarRendaCustom ? rendaCustom > 0 : faixaRenda !== "";
    if (step === "endereco") return enderecoSelecionado !== null;
    return false;
  }, [step, dataNasc, faixaRenda, rendaCustom, usarRendaCustom, enderecoSelecionado]);

  const toCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const cpEditModalContent = (
    <>
      {campoEditandoCP === "email" && (
        <Input type="email" value={valorTempCP} onChange={(e) => { setValorTempCP(e.target.value); setEditErrorCP(""); }} className="h-12 rounded-xl" placeholder="seu@email.com" autoFocus />
      )}
      {campoEditandoCP === "celular" && (
        <IMaskInput mask="(00) 00000-0000" value={valorTempCP} onAccept={(v) => { setValorTempCP(String(v)); setEditErrorCP(""); }} className="flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" placeholder="(00) 00000-0000" inputMode="numeric" />
      )}
      {editErrorCP && <p className="mt-2 text-xs text-red-500">{editErrorCP}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl" onClick={() => setCampoEditandoCP(null)}>Cancelar</Button>
        <Button
          className="h-12 rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]"
          onClick={() => {
            if (campoEditandoCP === "email") {
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorTempCP)) { setEditErrorCP("E-mail inválido"); return; }
              setEmailLocal(valorTempCP);
            } else if (campoEditandoCP === "celular") {
              if (valorTempCP.replace(/\D/g, "").length < 10) { setEditErrorCP("Celular inválido"); return; }
              setCelularLocal(valorTempCP);
            }
            setCampoEditandoCP(null);
          }}
        >
          Salvar
        </Button>
      </div>
    </>
  );

  return (
    <>
    <SubPageLayout title="Crédito Pessoal" hideNav>
      <div className="space-y-4 pb-28 md:mx-auto md:max-w-[560px]">

        {/* ── Stepper visual simples ── */}
        <div className="flex items-center gap-1">
          {flow.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= idx ? "bg-[#E8590A]" : "bg-[#F5F4F2]"
              }`}
            />
          ))}
        </div>

        {/* ═══════════════════════════════════════════════
            STEP: intro
        ════════════════════════════════════════════════ */}
        {step === "intro" && (
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]">
                <ClipboardText size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Vamos montar sua proposta
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Precisamos confirmar algumas informações. Leva menos de 2 minutos.
                </p>
              </div>
              <ul className="w-full space-y-2 text-left text-sm">
                {[
                  "Confirmar seus dados cadastrais",
                  "Data de nascimento",
                  "Renda mensal",
                  "Endereço de correspondência",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground">
                    <CheckCircle size={16} className="shrink-0 text-[#E8590A]" weight="fill" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP: dados_conta — confirmar dados já cadastrados
        ════════════════════════════════════════════════ */}
        {step === "dados_conta" && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]">
                <User size={28} className="text-[#E8590A]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Seus dados cadastrais</h2>
              <p className="text-sm text-muted-foreground">
                Estas informações já estão na sua conta. Confirme para continuar.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white shadow-sm">
              {[
                { label: "CPF", value: dadosConta.cpf, locked: true, campo: undefined },
                { label: "Nome completo", value: dadosConta.nome, locked: true, campo: undefined },
                // Bloqueado por segurança: celular é usado como 2FA — edição aqui seria brecha de sequestro de conta.
                // TODO: avaliar com Erasmo se haverá fluxo separado de troca de telefone com validação reforçada.
                { label: "E-mail", value: emailLocal, locked: true, campo: "email" as const },
                { label: "Celular", value: celularLocal, locked: true, campo: "celular" as const },
              ].map(({ label, value, locked, campo }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < arr.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                  {locked ? (
                    <LockSimple size={16} className="text-muted-foreground" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setCampoEditandoCP(campo!); setValorTempCP(value); setEditErrorCP(""); }}
                      className="text-sm font-medium text-[#E8590A] hover:underline"
                    >
                      Alterar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP: nascimento
        ════════════════════════════════════════════════ */}
        {step === "nascimento" && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]">
                <Cake size={28} className="text-[#E8590A]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Data de nascimento</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Necessária para verificar sua elegibilidade.
              </p>
            </div>
            <IMaskInput
              mask="00/00/0000"
              value={dataNasc}
              onAccept={(v) => {
                setDataNasc(String(v));
                if (erroDataNasc) setErroDataNasc("");
              }}
              onBlur={() => {
                if (dataNasc && !isAdultBirthDate(dataNasc))
                  setErroDataNasc("Data inválida ou idade mínima de 18 anos");
              }}
              className={`${maskedInputClass} ${erroDataNasc ? "border-red-400 focus-visible:ring-red-400/40" : ""}`}
              placeholder="DD/MM/AAAA"
              inputMode="numeric"
            />
            {erroDataNasc && (
              <p className="mt-1 text-xs text-red-500">{erroDataNasc}</p>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP: renda
        ════════════════════════════════════════════════ */}
        {step === "renda" && (
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]">
                <CurrencyCircleDollar size={28} className="text-[#E8590A]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Qual é sua renda mensal?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Informe sua renda principal (salário, aposentadoria, etc.)
              </p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Até R$ 2.000", value: "ate2k" },
                  { label: "R$ 2.001 a R$ 4.000", value: "2k_4k" },
                  { label: "R$ 4.001 a R$ 8.000", value: "4k_8k" },
                  { label: "Acima de R$ 8.000", value: "acima8k" },
                ].map((f) => (
                  <OptionBtn
                    key={f.value}
                    selected={!usarRendaCustom && faixaRenda === f.value}
                    onClick={() => { setFaixaRenda(f.value); setUsarRendaCustom(false); }}
                  >
                    {f.label}
                  </OptionBtn>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">ou informe o valor exato</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <IMaskInput
                mask={Number}
                scale={2}
                signed={false}
                thousandsSeparator="."
                radix=","
                mapToRadix={["."]}
                normalizeZeros
                padFractionalZeros
                value={rendaCustom > 0 ? rendaCustom.toString() : ""}
                onAccept={(v) => {
                  const val = parseCurrency(String(v));
                  setRendaCustom(val);
                  if (val > 0) { setUsarRendaCustom(true); setFaixaRenda(""); }
                }}
                className={maskedInputClass}
                placeholder="R$ 0,00"
                inputMode="numeric"
              />
              {usarRendaCustom && rendaCustom > 0 && (
                <p className="text-xs text-muted-foreground">
                  Renda informada: R$ {toCurrency(rendaCustom)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            STEP: endereco — reutiliza EnderecoSelector
        ════════════════════════════════════════════════ */}
        {step === "endereco" && (
          <EnderecoSelector
            enderecos={enderecosMock}
            onConfirmar={(endereco) => {
              setEnderecoSelecionado(endereco);
              // Navega para a próxima etapa (CP-E3 consultando)
              navigate("/credito-pessoal/consultando", {
                state: {
                  dadosConta,
                  emailLocal,
                  celularLocal,
                  dataNasc,
                  faixaRenda: usarRendaCustom ? `R$ ${toCurrency(rendaCustom)}` : faixaRenda,
                  endereco,
                },
              });
            }}
          />
        )}

        {/* ── CTA / navegação — oculto no step de endereço (selector tem CTA próprio) ── */}
        {step !== "endereco" && (
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
                canAdvance
                  ? "bg-[#E8590A] hover:bg-[#d04e08]"
                  : "cursor-not-allowed bg-[#E8590A] opacity-40"
              }`}
            >
              {step === "intro" ? "Começar" : "Continuar"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Indicador de localização */}
        {step === "endereco" && (
          <div className="flex items-center gap-1.5 rounded-xl bg-[#FEF0E7] px-3 py-2">
            <MapPin size={14} className="shrink-0 text-[#E8590A]" />
            <p className="text-xs text-[#A33D05]">
              Último passo antes de consultar sua oferta
            </p>
          </div>
        )}

      </div>
    </SubPageLayout>

      {isDesktop ? (
        <Dialog open={editOpenCP} onOpenChange={(o) => { if (!o) setCampoEditandoCP(null); }}>
          <DialogContent className="max-w-md">
            <DialogClose onClose={() => setCampoEditandoCP(null)} />
            <DialogHeader>
              <DialogTitle>Alterar {campoEditandoCP === "email" ? "E-mail" : "Celular"}</DialogTitle>
            </DialogHeader>
            {cpEditModalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={editOpenCP} onOpenChange={(o) => { if (!o) setCampoEditandoCP(null); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Alterar {campoEditandoCP === "email" ? "E-mail" : "Celular"}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              {cpEditModalContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
