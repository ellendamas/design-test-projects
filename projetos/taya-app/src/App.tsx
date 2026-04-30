import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { IMaskInput } from "react-imask";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Bank,
  Bell,
  Briefcase,
  CaretRight,
  ChatCircle,
  CheckCircle,
  Clock,
  CreditCard,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FileText,
  Fingerprint,
  Gear,
  Headset,
  House,
  Info,
  LockSimple,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  SealCheck,
  ShieldCheck,
  SignOut,
  Trash,
  UserCircle,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/use-media-query";

type ServiceType = "clt" | "fgts" | "saque-facil";
type OtpChannel = "whatsapp" | "email" | "sms";
type StoredUser = { name: string; email: string };

const HERO_IMAGE =
  "https://static.vecteezy.com/ti/fotos-gratis/p1/75899742-o-negocio-mulher-dentro-cidade-feliz-e-retrato-ao-ar-livre-para-trabalhando-em-criativo-carreira-ou-trabalho-face-empreendedor-e-confiante-pessoa-profissional-desenhador-e-empregado-sorrir-em-urbano-telhado-dentro-brasil-foto.jpg";

const serviceCopy: Record<
  ServiceType,
  {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    icon: ReactNode;
    highlight?: string;
    photo: string;
  }
> = {
  clt: {
    title: "Crédito com desconto em folha",
    subtitle: "Para quem tem carteira assinada",
    description: "Parcelas fixas descontadas direto do seu salário. Sem susto no fim do mês.",
    cta: "Consultar crédito CLT",
    icon: <Briefcase size={20} />,
    highlight: "Até R$ 18.000 disponíveis",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80&fit=crop&crop=face",
  },
  fgts: {
    title: "Antecipar meu FGTS",
    subtitle: "Seu saldo do FGTS disponível agora",
    description: "Receba em minutos com simulação clara e sem burocracia.",
    cta: "Simular antecipação",
    icon: <Bank size={20} />,
    highlight: "Taxa a partir de 1,39% a.m.",
    photo:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&q=80&fit=crop&crop=face",
  },
  "saque-facil": {
    title: "Saque Fácil no cartão",
    subtitle: "Saque com limite do seu cartão",
    description: "Use o limite do seu cartão de crédito. Aprovação rápida.",
    cta: "Ver oferta",
    icon: <CreditCard size={20} />,
    highlight: "Aprovação em minutos",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80&fit=crop&crop=face",
  },
};

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("seutudo_user");
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function SecurityStrip() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-primary-light px-3 py-2.5">
      <LockSimple size={15} className="shrink-0 text-primary-dark" />
      <p className="text-xs leading-snug text-primary-dark">
        Dados protegidos com criptografia ponta a ponta. Seguimos a LGPD.
      </p>
    </div>
  );
}

function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">Passo {step} de {total}</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} className="h-1 bg-secondary [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500" />
      <div className="pt-1">
        <h2 className="text-lg font-bold leading-snug text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function SensitiveData({ value, type = "text" }: { value: string; type?: "cpf" | "phone" | "currency" | "text" }) {
  const [visible, setVisible] = useState(false);
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", currency: "R$ ••••", text: "••••••••" }[
    type
  ];
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium text-foreground">{visible ? value : masked}</span>
      <button
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground transition-colors hover:text-foreground"
        aria-label={visible ? "Ocultar" : "Mostrar"}
      >
        {visible ? <EyeSlash size={16} /> : <Eye size={16} />}
      </button>
    </span>
  );
}

function ThemeSwitcher() {
  if (typeof window === "undefined") return null;
  const hasDebug = window.location.search.includes("debug=true");
  const isLocal = window.location.hostname.includes("localhost");
  if (!hasDebug && !isLocal) return null;

  const themes = [
    { key: "laranja", color: "#E8590A" },
    { key: "azul", color: "#1D4ED8" },
    { key: "verde", color: "#16A34A" },
    { key: "roxo", color: "#7C3AED" },
    { key: "grafite", color: "#374151" },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 rounded-2xl border border-border bg-white p-3 shadow-lg">
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tema</p>
      {themes.map((theme) => (
        <button
          key={theme.key}
          onClick={() => document.documentElement.setAttribute("data-theme", theme.key)}
          className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
          style={{ background: theme.color }}
          title={theme.key}
        />
      ))}
    </div>
  );
}

function AuthHeroLayout({ rightContent }: { rightContent: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col bg-background md:flex-row">
      <div className="relative h-48 shrink-0 overflow-hidden md:h-screen md:w-1/2">
        <img src={HERO_IMAGE} alt="Pessoa CLT" className="h-full w-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <span className="absolute left-5 top-4 text-xl font-bold text-white drop-shadow">seutudo.</span>
      </div>

      <div className="flex flex-1 flex-col justify-between px-5 pb-8 pt-2 md:w-1/2 md:items-start md:justify-center md:px-16 md:py-12">
        <div className="space-y-5">{rightContent}</div>
      </div>
    </main>
  );
}

function ComingSoon({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <main className="mx-auto flex min-h-screen max-w-full flex-col items-center justify-center bg-background px-6">
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light">
          <Clock size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">Esta seção está em desenvolvimento. Em breve disponível.</p>
        <Button variant="outline" className="rounded-xl border-border" onClick={() => navigate("/painel")}>Voltar para o início</Button>
      </div>
    </main>
  );
}

function SubPageLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const firstName = (user?.name || "usuário").split(" ")[0] || "usuário";

  const navItems = [
    { path: "/painel", icon: <House size={18} />, label: "Início" },
    { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" },
    { path: "/duvidas", icon: <Headset size={18} />, label: "Dúvidas" },
    { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" },
  ];

  const logout = () => {
    if (typeof window !== "undefined") window.localStorage.removeItem("seutudo_user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <span className="mb-8 text-xl font-bold text-foreground">seutudo.</span>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-background"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">{firstName[0]?.toUpperCase() ?? "S"}</div>
            <div>
              <p className="text-xs font-semibold text-foreground">{firstName}</p>
              <p className="text-xs text-muted-foreground">Conta verificada</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><SignOut size={16} />Sair</button>
        </div>
      </aside>

      <main className="flex-1 bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-4 md:px-8">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F5F4F2]">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
        </header>
        <div className="px-4 py-5 md:mx-auto md:max-w-[640px] md:px-0 md:py-8">{children}</div>
      </main>
    </div>
  );
}

function MeusDadosPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("cliente@exemplo.com");
  const [celular, setCelular] = useState("(11) 99999-8888");
  const [initial] = useState({ email: "cliente@exemplo.com", celular: "(11) 99999-8888" });
  const changed = email !== initial.email || celular !== initial.celular;

  return (
    <SubPageLayout title="Informações pessoais">
      <div className="space-y-4 pb-24">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-foreground">Suas informações pessoais</h2>
          <p className="mt-1 text-sm text-muted-foreground">Alguns dados não podem ser alterados pois estão vinculados ao seu contrato.</p>
        </div>
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-xs leading-snug text-amber-700">
            Estes dados são usados para confirmações contratuais com os bancos parceiros.
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1"><p className="text-xs text-muted-foreground">Seu CPF</p><SensitiveData value="123.456.789-00" type="cpf" /></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground">Data de nascimento</p><SensitiveData value="12/08/1989" type="text" /></div>
            <div className="space-y-1"><p className="text-xs text-muted-foreground">Documento de identidade (RG)</p><SensitiveData value="12.345.678-9" type="text" /></div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">Seu e-mail de contato</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Seu número com DDD</Label><IMaskInput mask="(00) 00000-0000" value={celular} onAccept={(v) => setCelular(String(v))} className={maskedInputClass} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-white p-4 md:max-w-full">
        <Button
          disabled={!changed}
          onClick={() => {
            toast.success("Dados atualizados.");
            setTimeout(() => navigate("/minha-conta"), 1500);
          }}
          className="h-11 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
        >
          Salvar alterações
        </Button>
      </div>
    </SubPageLayout>
  );
}

function EditarEnderecoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [success, setSuccess] = useState(false);
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("Avenida Paulista");
  const [bairro, setBairro] = useState("Bela Vista");
  const [cidade] = useState("São Paulo");
  const [estado] = useState("SP");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  if (success) {
    return (
      <SubPageLayout title="Editar endereço">
        <div className="flex flex-col items-center space-y-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><CheckCircle size={32} className="text-[#E8590A]" weight="fill" /></div>
          <h2 className="text-lg font-bold text-foreground">Endereço atualizado.</h2>
          <p className="text-sm text-muted-foreground">Suas informações foram salvas com sucesso.</p>
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" onClick={() => navigate("/minha-conta")}>Voltar para minha conta</Button>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Editar endereço">
      {step === 1 && (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold leading-snug text-foreground">Confirme se esse é o seu endereço residencial.</h2>
            <div className="space-y-0.5 text-sm leading-relaxed text-foreground">
              <p>Rua Dona Ana Neri, 581</p><p>de 501/502 ao fim</p><p>Cambuci</p><p>São Paulo / SP</p><p>CEP: 01522-000</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button variant="outline" className="h-11 w-full rounded-xl border-border md:w-auto md:min-w-[160px]" onClick={() => setStep(2)}><PencilSimple size={16} className="mr-2" />Alterar endereço</Button>
            <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] md:w-auto md:min-w-[160px]" onClick={() => navigate("/minha-conta")}>Confirmar endereço</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="mb-1 text-xl font-bold leading-snug text-foreground">Para começar, informe o CEP da sua residência.</h2>
          <p className="mb-5 text-sm text-muted-foreground">A gente preenche o endereço automaticamente para você.</p>
          <div className="space-y-1.5"><Label className="text-sm font-medium">CEP</Label><IMaskInput mask="00000-000" value={cep} onAccept={(v) => setCep(String(v))} className={maskedInputClass} placeholder="00000-000" /></div>
          <button className="text-sm text-primary underline" onClick={() => window.open("https://buscacepinter.correios.com.br", "_blank")}>Não sei o meu CEP</button>
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" onClick={() => setStep(3)}>Buscar</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h2 className="mb-1 text-lg font-bold text-foreground">Complete os dados e confirme o endereço.</h2>
          <p className="mb-5 text-sm text-muted-foreground">Verifique se está tudo certo antes de salvar.</p>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Logradouro</Label><Input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} className="h-12 rounded-xl" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Bairro</Label><Input value={bairro} onChange={(e) => setBairro(e.target.value)} className="h-12 rounded-xl" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Cidade</Label><Input value={cidade} readOnly className="h-12 rounded-xl bg-muted" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Estado</Label><Input value={estado} readOnly className="h-12 rounded-xl bg-muted" /></div>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Número</Label><Input placeholder="Ex: 42" autoFocus value={numero} onChange={(e) => setNumero(e.target.value)} className="h-12 rounded-xl" /></div>
          <label className="flex items-center gap-2 text-sm text-foreground"><Checkbox />Sem número</label>
          <div className="space-y-1.5"><Label className="text-sm font-medium">Complemento</Label><Input value={complemento} onChange={(e) => setComplemento(e.target.value)} className="h-12 rounded-xl" /></div>
          <Button className="mt-2 h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" disabled={!numero.trim()} onClick={() => setSuccess(true)}>Confirmar endereço</Button>
        </div>
      )}
    </SubPageLayout>
  );
}

function DadosBancariosPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ cod: string; nome: string } | null>(null);
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [digito, setDigito] = useState("");
  const [tipo, setTipo] = useState<"corrente" | "poupanca">("corrente");
  const [saved, setSaved] = useState<{ banco: string; agencia: string; conta: string; digito: string; tipo: string } | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const bancosPrincipais = [
    { cod: "001", nome: "Banco do Brasil S.A." },
    { cod: "237", nome: "Banco Bradesco S.A." },
    { cod: "341", nome: "Itaú Unibanco S.A." },
    { cod: "104", nome: "Caixa Econômica Federal" },
    { cod: "033", nome: "Banco Santander S.A." },
    { cod: "260", nome: "Nu Pagamentos S.A. (Nubank)" },
    { cod: "077", nome: "Banco Inter S.A." },
    { cod: "290", nome: "PagSeguro Internet S.A." },
    { cod: "323", nome: "Mercado Pago" },
    { cod: "748", nome: "Banco Cooperativo Sicredi S.A." },
  ];

  const bancosFiltrados = bancosPrincipais.filter((b) => `${b.cod} ${b.nome}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <SubPageLayout title="Dados bancários">
      {!saved ? (
        <>
          <div className="flex flex-col items-center space-y-3 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><Bank size={28} className="text-[#E8590A]" /></div>
            <h3 className="text-base font-semibold text-foreground">Nenhuma conta cadastrada.</h3>
            <p className="text-sm text-muted-foreground">Adicione uma conta para receber seus pagamentos.</p>
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] font-semibold text-white hover:bg-[#A33D05]" onClick={() => setOpen(true)}><Plus size={16} className="mr-2" />Adicionar conta</Button>
        </>
      ) : (
        <div className="rounded-xl border border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{saved.banco}</p>
              <p className="text-xs text-muted-foreground">Agência · <SensitiveData value={saved.agencia} type="text" /></p>
              <p className="text-xs text-muted-foreground">{saved.tipo} · <SensitiveData value={`${saved.conta}-${saved.digito}`} type="text" /></p>
            </div>
            <button onClick={() => setSaved(null)} className="flex items-center gap-1.5 text-xs text-red-500 transition-colors hover:text-red-700">
              <Trash size={14} />
              Remover esta conta
            </button>
          </div>
        </div>
      )}

      {open && (isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-[480px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">Em qual banco deseja receber?</DialogTitle>
            </DialogHeader>
            {!selected ? (
              <>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3"><MagnifyingGlass size={16} className="text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar banco" className="h-10 w-full text-sm outline-none" /></div>
                <div className="max-h-[45vh] space-y-1 overflow-auto">
                  {bancosFiltrados.map((b) => (
                    <button key={b.cod} className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F5F4F2]" onClick={() => setSelected(b)}>{b.cod} · {b.nome}</button>
                  ))}
                </div>
              </>
            ) : (
              <BankFormContent selected={selected} agencia={agencia} conta={conta} digito={digito} tipo={tipo} setAgencia={setAgencia} setConta={setConta} setDigito={setDigito} setTipo={setTipo} confirmando={confirmando} setConfirmando={setConfirmando} onConfirmSave={() => { setSaved({ banco: selected.nome, agencia, conta, digito, tipo: tipo === "corrente" ? "Conta corrente" : "Conta poupança" }); setOpen(false); setSelected(null); setSearch(""); setConfirmando(false); }} />
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <h3 className="mb-3 text-sm font-semibold text-foreground">Em qual banco deseja receber?</h3>
            {!selected ? (
              <>
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-border px-3"><MagnifyingGlass size={16} className="text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar banco" className="h-10 w-full text-sm outline-none" /></div>
                <div className="max-h-[45vh] space-y-1 overflow-auto">
                  {bancosFiltrados.map((b) => (
                    <button key={b.cod} className="w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F5F4F2]" onClick={() => setSelected(b)}>{b.cod} · {b.nome}</button>
                  ))}
                </div>
              </>
            ) : (
              <BankFormContent selected={selected} agencia={agencia} conta={conta} digito={digito} tipo={tipo} setAgencia={setAgencia} setConta={setConta} setDigito={setDigito} setTipo={setTipo} confirmando={confirmando} setConfirmando={setConfirmando} onConfirmSave={() => { setSaved({ banco: selected.nome, agencia, conta, digito, tipo: tipo === "corrente" ? "Conta corrente" : "Conta poupança" }); setOpen(false); setSelected(null); setSearch(""); setConfirmando(false); }} />
            )}
          </div>
        </div>
      ))}
      {saved && (
        <div className="mt-3">
          <Button variant="outline" className="mt-3 w-full rounded-xl border-border md:w-auto" onClick={() => setOpen(true)}><Plus size={16} className="mr-2" />Adicionar outra conta</Button>
        </div>
      )}
    </SubPageLayout>
  );
}

function BankFormContent({
  selected,
  agencia,
  conta,
  digito,
  tipo,
  setAgencia,
  setConta,
  setDigito,
  setTipo,
  confirmando,
  setConfirmando,
  onConfirmSave,
}: {
  selected: { cod: string; nome: string };
  agencia: string;
  conta: string;
  digito: string;
  tipo: "corrente" | "poupanca";
  setAgencia: (v: string) => void;
  setConta: (v: string) => void;
  setDigito: (v: string) => void;
  setTipo: (v: "corrente" | "poupanca") => void;
  confirmando: boolean;
  setConfirmando: (v: boolean) => void;
  onConfirmSave: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{selected.nome}</p>
      <div className="space-y-1.5"><Label className="text-sm font-medium">Agência (sem dígito)</Label><Input value={agencia} onChange={(e) => setAgencia(e.target.value)} className="h-12 rounded-xl" /></div>
      <div className="grid grid-cols-[1fr_auto_70px] items-end gap-2"><div className="space-y-1.5"><Label className="text-sm font-medium">Conta</Label><Input value={conta} onChange={(e) => setConta(e.target.value)} className="h-12 rounded-xl" /></div><span className="pb-3 text-muted-foreground">-</span><div className="space-y-1.5"><Label className="text-sm font-medium">Dígito</Label><Input value={digito} onChange={(e) => setDigito(e.target.value)} className="h-12 rounded-xl" /></div></div>
      <div className="grid grid-cols-2 gap-2">
        <button className={`h-11 rounded-xl border text-sm ${tipo === "corrente" ? "border-primary bg-primary-light text-primary" : "border-border"}`} onClick={() => setTipo("corrente")}>Conta corrente</button>
        <button className={`h-11 rounded-xl border text-sm ${tipo === "poupanca" ? "border-primary bg-primary-light text-primary" : "border-border"}`} onClick={() => setTipo("poupanca")}>Conta poupança</button>
      </div>
      <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" disabled={!agencia || !conta || !digito} onClick={() => setConfirmando(true)}>Confirmar</Button>

      {confirmando && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Confirmar conta</h2>
          <div className="flex gap-3 rounded-xl bg-[#FEF0E7] p-3">
            <Bank size={18} className="mt-0.5 shrink-0 text-[#E8590A]" />
            <p className="text-xs leading-snug text-[#A33D05]">A conta bancária precisa estar no seu nome para que o valor seja depositado para você.</p>
          </div>
          <div className="space-y-3">
            <div><p className="text-xs text-muted-foreground">Instituição bancária</p><p className="text-sm font-semibold text-foreground">{selected.nome}</p></div>
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-muted-foreground">Agência</p><SensitiveData value={agencia} type="text" /></div>
              <div><p className="text-xs text-muted-foreground">{tipo === "corrente" ? "Conta corrente" : "Conta poupança"}</p><SensitiveData value={`${conta}-${digito}`} type="text" /></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <Button variant="outline" className="rounded-xl border-border md:w-auto" onClick={() => setConfirmando(false)}>Alterar conta</Button>
            <Button className="rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] md:w-auto" onClick={onConfirmSave}>Confirmar</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordTelField({
  label,
  value,
  onChange,
  show,
  onToggle,
  inputRef,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <input
          ref={inputRef}
          type={show ? "text" : "tel"}
          maxLength={6}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            onChange(val);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-center text-lg tracking-[0.4em] text-foreground focus:border-[#E8590A] focus:outline-none focus:ring-2 focus:ring-[#E8590A]/20"
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {show ? <EyeSlash size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function AlterarSenhaPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const senhaAtualRef = useRef<HTMLInputElement>(null);
  const novaSenhaRef = useRef<HTMLInputElement>(null);
  const confirmarSenhaRef = useRef<HTMLInputElement>(null);
  const canSave = current.length > 0 && next.length > 0 && confirm.length > 0 && next === confirm;

  return (
    <SubPageLayout title="Alterar senha">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-foreground">Vamos criar uma nova senha.</h2>
        <p className="mt-1 text-sm text-muted-foreground">Primeiro confirme a senha atual, depois escolha a nova.</p>
      </div>
      <ul className="mb-4 space-y-1.5">
        {["Mínimo 6 dígitos numéricos", "Não use sequências como 123456", "Não use sua data de nascimento"].map((rule) => (
          <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />{rule}</li>
        ))}
      </ul>
      <div className="space-y-3">
        <PasswordTelField label="Sua senha atual" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} inputRef={senhaAtualRef} />
        <PasswordTelField label="Escolha uma nova senha" value={next} onChange={setNext} show={showNext} onToggle={() => setShowNext((v) => !v)} inputRef={novaSenhaRef} />
        <PasswordTelField label="Digite a nova senha de novo" value={confirm} onChange={setConfirm} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} inputRef={confirmarSenhaRef} />
      </div>
      <Button
        className="mt-5 h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] disabled:opacity-40"
        disabled={!canSave}
        onClick={() => {
          toast.success("Senha alterada com sucesso.");
          setTimeout(() => navigate(-1), 1500);
        }}
      >
        Salvar nova senha
      </Button>
    </SubPageLayout>
  );
}

function ContratosPage() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-background md:max-w-full">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F5F4F2]"><ArrowLeft size={20} className="text-foreground" /></button>
        <h1 className="text-base font-semibold text-foreground">Contratos</h1>
      </header>

      <div className="px-4 py-5">
        <div className="flex flex-col items-center space-y-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7]"><FileText size={32} className="text-[#E8590A]" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Você ainda não tem contratos.</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Quando você contratar um produto, ele aparece aqui para você acompanhar tudo.</p>
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] font-semibold text-white hover:bg-[#A33D05]" onClick={() => navigate("/painel")}>
            Ver ofertas disponíveis
            <CaretRight size={14} className="ml-1" />
          </Button>
        </div>
        <p className="px-6 pb-8 text-center text-xs text-muted-foreground">Todos os seus contratos ficam aqui — parcelas, vencimentos e histórico de pagamentos.</p>
      </div>
    </main>
  );
}

function App() {
  const shouldReduce = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [pin, setPin] = useState("");
  const [biometria, setBiometria] = useState(false);
  const [biometriaSheetOpen, setBiometriaSheetOpen] = useState(false);
  const [interests, setInterests] = useState<ServiceType[]>(["clt"]);
  const [storedUser, setStoredUser] = useState<StoredUser | null>(() => getStoredUser());

  const [loginCpf, setLoginCpf] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [showLoginSenha, setShowLoginSenha] = useState(false);
  const [otpChannel, setOtpChannel] = useState<OtpChannel | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2 | 3>(1);
  const [otpCountdown, setOtpCountdown] = useState(30);

  const firstName = (storedUser?.name || name || "você").split(" ")[0] || "você";
  const totalSteps = 4;

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: shouldReduce ? 0 : 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: shouldReduce ? 0 : 0.2 } },
  };

  const stepVariants = {
    initial: (dir: number) => ({ opacity: 0, x: shouldReduce ? 0 : dir > 0 ? 40 : -40 }),
    animate: { opacity: 1, x: 0, transition: { duration: shouldReduce ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: shouldReduce ? 0 : dir > 0 ? -40 : 40, transition: { duration: shouldReduce ? 0 : 0.2 } }),
  };

  const cardsContainerVariants = { initial: {}, animate: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } } };
  const cardVariants = { initial: { opacity: 0, y: shouldReduce ? 0 : 20 }, animate: { opacity: 1, y: 0, transition: { duration: shouldReduce ? 0 : 0.4, ease: [0.4, 0, 0.2, 1] } } };

  const canGoNext = useMemo(() => {
    if (step === 1) return name.trim().length > 2 && email.includes("@") && phone.replace(/\D/g, "").length >= 10;
    if (step === 2) return cpf.replace(/\D/g, "").length === 11;
    if (step === 3) return interests.length > 0;
    if (step === 4) return pin.length === 6;
    return true;
  }, [step, name, email, phone, cpf, interests, pin]);

  const canContinueLoginStep1 = loginCpf.replace(/\D/g, "").length === 11 && loginSenha.length >= 6;
  const canSendOtp = Boolean(otpChannel);
  const canConfirmOtp = otpCode.length === 6;

  const resetApp = () => {
    setStep(1);
    setDirection(1);
    setName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setPin("");
    setBiometria(false);
    setBiometriaSheetOpen(false);
    setInterests(["clt"]);
    setStoredUser(null);
    setLoginCpf("");
    setLoginSenha("");
    setShowLoginSenha(false);
    setOtpChannel(null);
    setOtpCode("");
    setLoginStep(1);
    setOtpCountdown(30);
    if (typeof window !== "undefined") window.localStorage.removeItem("seutudo_user");
    navigate("/");
  };

  const completeOnboarding = () => {
    const user = { name, email };
    if (typeof window !== "undefined") window.localStorage.setItem("seutudo_user", JSON.stringify(user));
    setStoredUser(user);
    navigate("/painel");
  };

  useEffect(() => {
    const protectedPaths = ["/painel", "/minha-conta", "/contratos", "/duvidas"];
    if (!protectedPaths.includes(location.pathname)) return;
    const user = getStoredUser();
    if (!user) navigate("/boas-vindas", { replace: true });
    else setStoredUser(user);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!(location.pathname === "/acesso" && loginStep === 3)) return;
    const notifyTimer = window.setTimeout(() => {
      toast("seutudo.", {
        description:
          otpChannel === "whatsapp"
            ? "Seu código de verificação chegou no WhatsApp."
            : otpChannel === "email"
              ? "Seu código de verificação chegou no e-mail."
              : "Seu código de verificação chegou por SMS.",
        icon: <ShieldCheck size={16} className="text-primary" />,
        duration: 4000,
        position: "top-center",
        style: { borderRadius: "12px", background: "white", border: "0.5px solid #E7E5E4", fontSize: "13px" },
      });
    }, 1500);
    return () => window.clearTimeout(notifyTimer);
  }, [location.pathname, loginStep, otpChannel]);

  useEffect(() => {
    if (!(location.pathname === "/acesso" && loginStep === 3)) return;
    setOtpCountdown(30);
    const timer = window.setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [location.pathname, loginStep]);

  const goNext = () => {
    setDirection(1);
    if (step === 4) {
      setStep(5);
      setBiometriaSheetOpen(true);
      return;
    }
    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setDirection(-1);
    if (step === 1) {
      navigate("/boas-vindas");
      return;
    }
    setStep((prev) => prev - 1);
  };

  const toggleInterest = (service: ServiceType) => {
    setInterests((prev) => (prev.includes(service) ? prev.filter((item) => item !== service) : [...prev, service]));
  };

  const renderBottomNav = () => (
    <nav className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm md:hidden">
      <ul className="grid w-full grid-cols-4 text-center">
        {[
          { path: "/painel", icon: <House size={18} />, label: "Início" },
          { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" },
          { path: "/duvidas", icon: <Headset size={18} />, label: "Dúvidas" },
          { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" },
        ].map((item) => (
          <li key={item.path} className="flex flex-col items-center justify-center text-center">
            <button
              onClick={() => navigate(item.path)}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl p-2 text-center text-[11px] ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground"}`}
            >
              <span className="flex items-center justify-center leading-none">{item.icon}</span>
              <span className="block w-full leading-none">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  const WelcomeScreen = (
    <AuthHeroLayout
      rightContent={
        <>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-foreground">
              Quem tem carteira assinada pode ter muito mais do que imagina.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Descubra o que está disponível para você. É gratuito e sem compromisso.
            </p>
          </div>

          <div className="space-y-2.5">
            {["Simulação gratuita, sem compromisso", "Tudo explicado, sem letra miúda", "Seus dados ficam só com você"].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                <CheckCircle size={16} weight="fill" className="shrink-0 text-primary" />
                {text}
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-6 md:w-[60%]">
            <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
              <Button className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary-dark" onClick={() => { setStep(1); setDirection(1); navigate("/cadastro"); }}>
                Quero começar
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>

            <Button variant="outline" className="h-12 w-full rounded-xl border-border" onClick={() => { setLoginStep(1); setOtpChannel(null); setOtpCode(""); navigate("/acesso"); }}>
              Já tenho conta
            </Button>

            <p className="text-center text-xs leading-relaxed text-muted-foreground md:text-left">
              Ao continuar você concorda com os <a href="#" className="text-primary underline underline-offset-2">Termos de Uso</a> e a{" "}
              <a href="#" className="text-primary underline underline-offset-2">Política de Privacidade</a>.
            </p>
          </div>
        </>
      }
    />
  );

  const LoginScreen = (
    <AuthHeroLayout
      rightContent={
        <>
          {loginStep === 1 && (
            <>
              <div>
                <h1 className="text-2xl font-bold leading-tight text-foreground">Bem-vindo de volta.</h1>
                <p className="mt-2 text-sm text-muted-foreground">Entre com seu CPF e senha.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">CPF</Label>
                <IMaskInput mask="000.000.000-00" value={loginCpf} onAccept={(value) => setLoginCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input type={showLoginSenha ? "text" : "password"} value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} className="h-12 rounded-xl pr-10" placeholder="Digite sua senha" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowLoginSenha((prev) => !prev)}>
                    {showLoginSenha ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="text-right"><button className="text-xs text-primary">Esqueci minha senha</button></div>

              <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
                <Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40" disabled={!canContinueLoginStep1} onClick={() => { setOtpChannel("whatsapp"); setLoginStep(2); }}>
                  Entrar
                </Button>
              </motion.div>

              <Button variant="ghost" className="h-12 w-full text-primary" onClick={() => navigate("/cadastro")}>Criar minha conta</Button>

              <p className="text-center text-xs leading-relaxed text-muted-foreground md:text-left">
                Ao continuar você concorda com os <a href="#" className="text-primary underline underline-offset-2">Termos de Uso</a> e a{" "}
                <a href="#" className="text-primary underline underline-offset-2">Política de Privacidade</a>.
              </p>
            </>
          )}

          {loginStep === 2 && (
            <>
              <div>
                <h2 className="text-xl font-bold text-foreground">Como você quer receber o código?</h2>
                <p className="text-sm text-muted-foreground">Vamos confirmar que é você.</p>
              </div>
              {[{ key: "whatsapp" as const, icon: <WhatsappLogo size={20} />, label: "WhatsApp", desc: "Recomendado, mais rápido e seguro", badge: "Recomendado" }, { key: "email" as const, icon: <EnvelopeSimple size={20} />, label: "E-mail", desc: "Enviamos para o e-mail cadastrado" }, { key: "sms" as const, icon: <ChatCircle size={20} />, label: "SMS", desc: "Mensagem de texto para o celular cadastrado" }].map((channel) => {
                const selected = (otpChannel ?? "whatsapp") === channel.key;
                return (
                  <button key={channel.key} onClick={() => setOtpChannel(channel.key)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${selected ? "border-primary bg-primary-light" : "border-border bg-card"}`}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-primary text-white" : "bg-background text-muted-foreground"}`}>{channel.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{channel.label}</p>
                        {channel.badge && <Badge className="border-0 bg-primary-light text-[10px] text-primary-dark">{channel.badge}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{channel.desc}</p>
                    </div>
                  </button>
                );
              })}
              <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
                <Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40" disabled={!canSendOtp} onClick={() => { setOtpCode(""); setLoginStep(3); }}>
                  Enviar código
                </Button>
              </motion.div>
            </>
          )}

          {loginStep === 3 && (
            <>
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                  {(otpChannel ?? "whatsapp") === "whatsapp" ? <WhatsappLogo size={24} /> : (otpChannel ?? "whatsapp") === "email" ? <EnvelopeSimple size={24} /> : <ChatCircle size={24} />}
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Digite o código</h2>
                <p className="text-sm text-muted-foreground">
                  {(otpChannel ?? "whatsapp") === "whatsapp"
                    ? "Enviamos um código de 6 dígitos para o seu WhatsApp."
                    : (otpChannel ?? "whatsapp") === "email"
                      ? "Enviamos um código de 6 dígitos para o seu e-mail."
                      : "Enviamos um código de 6 dígitos por SMS."}
                </p>
              </div>

              <div className="my-6 flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <SecurityStrip />

              <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
                <Button
                  className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                  disabled={!canConfirmOtp}
                  onClick={() => {
                    const user = getStoredUser() ?? { name: "Usuário", email: "" };
                    if (typeof window !== "undefined") window.localStorage.setItem("seutudo_user", JSON.stringify(user));
                    setStoredUser(user);
                    navigate("/painel");
                  }}
                >
                  Confirmar
                </Button>
              </motion.div>

              <div className="text-center text-sm text-primary">
                <button disabled={otpCountdown > 0} className="disabled:text-muted-foreground" onClick={() => setOtpCountdown(30)}>
                  Não recebi o código, reenviar {otpCountdown > 0 ? `(${otpCountdown}s)` : ""}
                </button>
              </div>
            </>
          )}
        </>
      }
    />
  );

  const renderOnboarding = (
    <main className="mx-auto min-h-screen w-full bg-background px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full flex-col md:w-[860px] md:pt-12">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">seutudo.</span>
          <Badge className="border-0 bg-primary-light text-xs font-medium text-primary-dark md:hidden">Cadastro</Badge>
        </div>

        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit">
              {step === 1 && (
                <>
                  <StepHeader step={1} total={totalSteps} title="Vamos começar?" subtitle="Leva menos de 3 minutos." />
                  <Card className="border-border shadow-sm">
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-1.5"><Label className="text-sm font-medium">Nome completo</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Souza" className="h-12 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label className="text-sm font-medium">E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="h-12 rounded-xl" /></div>
                      <div className="space-y-1.5"><Label className="text-sm font-medium">Telefone com DDD</Label><IMaskInput mask="(00) 00000-0000" value={phone} onAccept={(value) => setPhone(String(value))} placeholder="(11) 99999-9999" className={maskedInputClass} /><p className="text-xs text-muted-foreground">Vamos usar para confirmar sua identidade e avisar sobre sua proposta.</p></div>
                    </CardContent>
                  </Card>
                </>
              )}

              {step === 2 && (
                <>
                  <StepHeader step={2} total={totalSteps} title="Qual é o seu CPF?" subtitle="A gente usa para encontrar as ofertas certas para você." />
                  <Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">CPF</Label><IMaskInput mask="000.000.000-00" value={cpf} onAccept={(value) => setCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} /><p className="text-xs text-muted-foreground">Nenhum dado é compartilhado sem sua autorização.</p></div><SecurityStrip /></CardContent></Card>
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader step={3} total={totalSteps} title="O que você está precisando?" subtitle="Pode escolher mais de um." />
                  <div className="space-y-2">
                    {(Object.keys(serviceCopy) as ServiceType[]).map((service) => {
                      const checked = interests.includes(service);
                      const currentService = serviceCopy[service];
                      return (
                        <button key={service} type="button" onClick={() => toggleInterest(service)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${checked ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/40"}`}>
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${checked ? "bg-primary text-white" : "bg-background text-muted-foreground"}`}>{currentService.icon}</div>
                          <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{currentService.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{currentService.subtitle}</p></div>
                          <Checkbox checked={checked} className={checked ? "border-primary data-[state=checked]:bg-primary" : "border-border"} onCheckedChange={() => toggleInterest(service)} />
                        </button>
                      );
                    })}
                    <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#A8A29E]"><ShieldCheck size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[#78716C]">Seguro de Vida</p><span className="inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#78716C]"><Clock size={10} /> Em breve</span></div><p className="mt-0.5 text-xs text-[#A8A29E]">Toque para registrar seu interesse</p></div></div>
                    {interests.length === 0 && <p className="pt-1 text-center text-xs text-primary">Selecione pelo menos 1 produto para continuar.</p>}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <StepHeader step={4} total={totalSteps} title="Crie sua senha de acesso" subtitle="Vai ser usada para entrar no app." />
                  <Card className="border-border shadow-sm">
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-1.5"><Label className="text-sm font-medium">Senha numérica (6 dígitos)</Label><Input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="h-12 rounded-xl text-center text-lg tracking-[0.5em]" /></div>
                      <ul className="space-y-1.5">{["Não use sequências (123456)", "Não use sua data de nascimento", "Você poderá ativar biometria na próxima tela"].map((rule) => <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />{rule}</li>)}</ul>
                    </CardContent>
                  </Card>
                </>
              )}

              {step === 5 && (
                <div className="flex flex-col items-center space-y-4 pt-8 text-center"><CheckCircle size={56} className="text-primary" weight="fill" /><div><h2 className="text-2xl font-bold text-foreground">Pronto, {firstName}.</h2><p className="mx-auto mt-2 text-sm text-muted-foreground">A gente já encontrou uma opção para você. Veja o que está disponível na sua conta.</p></div><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }} className="mt-4 w-full"><Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark" onClick={completeOnboarding}>Ver minha conta<ArrowRight size={16} className="ml-2" /></Button></motion.div></div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step <= 4 && (
          <div className="grid grid-cols-2 gap-3 pt-6">
            <Button variant="outline" onClick={goBack} className="h-12 rounded-xl border-border text-foreground">Voltar</Button>
            <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
              <Button onClick={goNext} disabled={!canGoNext} className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40">Continuar</Button>
            </motion.div>
          </div>
        )}
      </div>

      {step === 5 && biometriaSheetOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setBiometriaSheetOpen(false)} />
          <div className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 rounded-t-2xl bg-white px-6 pb-10 pt-6">
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-border" />
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light"><Fingerprint size={32} className="text-primary" /></div>
            <h3 className="mb-2 text-center text-xl font-bold text-foreground">Quer entrar com sua digital?</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">É mais rápido e você não precisa lembrar da senha.</p>
            <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="mb-3 h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark" onClick={() => { setBiometria(true); setBiometriaSheetOpen(false); }}>Habilitar biometria</Button></motion.div>
            <Button variant="ghost" className="h-12 w-full font-semibold text-primary" onClick={() => setBiometriaSheetOpen(false)}>Agora não</Button>
          </div>
        </>
      )}
    </main>
  );

  const HomeScreen = (
    <div className="min-h-screen w-full md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <span className="mb-8 text-xl font-bold text-foreground">seutudo.</span>
        <nav className="flex flex-col gap-1">
          {[{ path: "/painel", icon: <House size={18} />, label: "Início" }, { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" }, { path: "/duvidas", icon: <Headset size={18} />, label: "Dúvidas" }, { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" }].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-background"}`}>{item.icon}{item.label}</button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 px-3 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">{firstName[0]?.toUpperCase() ?? "S"}</div><div><p className="text-xs font-semibold text-foreground">{firstName}</p><p className="text-xs text-muted-foreground">Conta verificada</p></div></div>
          <button onClick={resetApp} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><SignOut size={16} />Sair</button>
        </div>
      </aside>

      <main className="mx-auto min-h-screen w-full bg-background md:mx-0 md:flex-1 md:overflow-y-auto">
        <header className="relative z-10 rounded-b-[32px] bg-primary px-5 pb-6 pt-8 text-white md:mx-auto md:mt-6 md:max-w-[860px] md:px-6 md:pt-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/75">Olá, {firstName}</p>
              <h2 className="text-xl font-bold">Seu crédito na seutudo.</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60"><SealCheck size={12} /> Conta verificada</p>
            </div>
            <button className="rounded-full bg-white/15 p-2.5"><Bell size={20} /></button>
          </div>
          <Card className="border-0 bg-white shadow-none"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-2"><div className="space-y-0.5"><p className="text-[11px] font-bold uppercase tracking-wide text-primary">Oferta disponível para você</p><p className="text-sm font-bold leading-snug text-foreground">Você pode antecipar até <SensitiveData value="R$ 4.800" type="currency" /> no FGTS</p><p className="text-xs text-muted-foreground">Taxa a partir de 1,39% ao mês</p></div><Badge className="shrink-0 border-0 bg-primary-light text-xs text-primary-dark">Novo</Badge></div><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-dark">Ver minha oferta</Button></motion.div></CardContent></Card>
        </header>

        <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
          <div className="md:mx-auto md:max-w-[860px] md:space-y-3">
            <motion.div variants={cardsContainerVariants} initial="initial" animate="animate" className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {interests.map((interest, idx) => {
                const currentService = serviceCopy[interest];
                const isPrimary = idx === 0;
                if (isPrimary) {
                  return (
                    <motion.div key={interest} variants={cardVariants}><Card className="relative overflow-hidden border-primary/30 shadow-sm"><CardContent className="flex min-h-[140px] items-stretch p-0"><div className="flex flex-1 flex-col justify-between p-4"><div><div className="mb-1 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">{currentService.icon}</div><p className="text-sm font-semibold text-foreground">{currentService.title}</p></div>{currentService.highlight && <p className="mb-1 text-xs font-semibold text-primary">{currentService.highlight}</p>}<p className="mb-3 text-xs text-muted-foreground">{currentService.description}</p></div><Button className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-dark">{currentService.cta} <CaretRight size={14} className="ml-1" /></Button></div><div className="relative w-28 shrink-0 overflow-hidden bg-white"><img src={currentService.photo} alt="" className="absolute inset-0 h-full w-full object-cover object-top" style={{ mixBlendMode: "multiply" }} /></div></CardContent></Card></motion.div>
                  );
                }
                return <motion.div key={interest} variants={cardVariants}><Card className="border-border shadow-sm"><CardContent className="p-4"><div className="mb-2 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground">{currentService.icon}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{currentService.title}</p>{currentService.highlight && <p className="mt-0.5 text-xs font-medium text-primary">{currentService.highlight}</p>}</div></div><p className="mb-3 text-xs text-muted-foreground">{currentService.description}</p><Button variant="outline" className="h-9 w-full rounded-lg border-border text-sm font-medium">{currentService.cta}<CaretRight size={14} className="ml-1" /></Button></CardContent></Card></motion.div>;
              })}
            </motion.div>

            <Card className="mt-4 border-border shadow-sm"><CardContent className="p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground"><Headset size={20} /></div><div><p className="text-sm font-semibold text-foreground">Ficou alguma dúvida?</p><p className="text-xs text-muted-foreground">Atendimento seg a sex, 8h às 18h</p></div></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm"><WhatsappLogo size={15} /> WhatsApp</Button><Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm"><Headset size={15} /> Ligar</Button></div></CardContent></Card>

            <div className="flex items-center justify-center gap-5 py-1">{[{ icon: <LockSimple size={13} />, label: "LGPD" }, { icon: <SealCheck size={13} />, label: "Banco Central" }, { icon: <ShieldCheck size={13} />, label: "Criptografado" }].map((item) => <div key={item.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">{item.icon}{item.label}</div>)}</div>
          </div>
        </div>

        {renderBottomNav()}
      </main>
    </div>
  );

  const AccountScreen = (
    <div className="min-h-screen w-full md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <span className="mb-8 text-xl font-bold text-foreground">seutudo.</span>
        <nav className="flex flex-col gap-1">
          {[{ path: "/painel", icon: <House size={18} />, label: "Início" }, { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" }, { path: "/duvidas", icon: <Headset size={18} />, label: "Dúvidas" }, { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" }].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-background"}`}>{item.icon}{item.label}</button>
          ))}
        </nav>
        <div className="mt-auto space-y-2">
          <div className="flex items-center gap-2 px-3 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">{firstName[0]?.toUpperCase() ?? "S"}</div><div><p className="text-xs font-semibold text-foreground">{firstName}</p><p className="text-xs text-muted-foreground">Conta verificada</p></div></div>
          <button onClick={resetApp} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><SignOut size={16} />Sair</button>
        </div>
      </aside>

      <main className="mx-auto min-h-screen w-full bg-background md:mx-0 md:flex-1 md:overflow-y-auto">
        <header className="sticky top-0 z-10 bg-background px-4 py-4 text-center md:px-0">
          <h2 className="text-base font-semibold text-foreground">Minha conta</h2>
        </header>

        <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
          <div className="md:mx-auto md:max-w-[860px] md:space-y-3">
            <div className="px-0 pb-6 pt-4">
              <p className="text-lg font-bold uppercase text-foreground">{(storedUser?.name || name || "USUÁRIO").toUpperCase()}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">CPF</span>
                <SensitiveData value="123.456.789-00" type="cpf" />
              </div>
            </div>

            <div className="space-y-4 px-0">
              {[
                {
                  title: "Conta",
                  icon: <UserCircle size={18} />,
                  items: [
                    { label: "Meus dados", action: () => navigate("/minha-conta/meus-dados") },
                    { label: "Editar endereço", action: () => navigate("/minha-conta/editar-endereco") },
                    { label: "Dados bancários", action: () => navigate("/minha-conta/dados-bancarios") },
                  ],
                },
                {
                  title: "Segurança",
                  icon: <ShieldCheck size={18} />,
                  items: [
                    { label: "Alterar senha", action: () => navigate("/minha-conta/alterar-senha") },
                    { label: "Avaliar o aplicativo", action: () => window.open("https://play.google.com", "_blank") },
                  ],
                },
                {
                  title: "Configurações",
                  icon: <Gear size={18} />,
                  items: [
                    { label: "Avaliar o aplicativo", external: true, href: "https://play.google.com" },
                  ],
                },
                {
                  title: "Políticas",
                  icon: <Info size={18} />,
                  items: [
                    { label: "Política de Privacidade", external: true, href: "https://seutudo.com.br/politica-de-privacidade" },
                    { label: "Termos de Uso", external: true, href: "https://seutudo.com.br/termos-de-uso" },
                  ],
                },
              ].map((group) => (
                <Card key={group.title} className="border-border shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className="text-primary">{group.icon}</span>
                      <p className="text-sm font-medium text-foreground">{group.title}</p>
                    </div>
                    {group.items.map((item) => (
                      <button key={item.label} onClick={() => (item.external ? window.open(item.href, "_blank") : item.action?.())} className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0">
                        <div className="flex items-center justify-between">
                          {item.label}
                          {item.external ? <ArrowSquareOut size={16} className="text-muted-foreground" /> : <CaretRight size={16} className="text-muted-foreground" />}
                        </div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              ))}

              <button onClick={resetApp} className="w-full py-3 text-center text-sm font-medium text-primary">Sair</button>
              <p className="pb-2 text-center text-xs text-muted-foreground">Versão 0.1.0-mvp</p>
            </div>
          </div>
        </div>

        {renderBottomNav()}
      </main>
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route
              path="/"
              element={
                <main className="relative mx-auto flex min-h-screen w-full cursor-pointer flex-col justify-end overflow-hidden md:items-center md:justify-center md:bg-primary" onClick={() => navigate("/boas-vindas")}>
                  <img src={HERO_IMAGE} alt="Pessoa com carteira assinada" className="absolute inset-0 h-full w-full object-cover object-center md:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/75 to-transparent md:hidden" />
                  <motion.div initial={shouldReduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: shouldReduce ? 0 : 0.5, ease: [0.4, 0, 0.2, 1] }} className="relative z-10 space-y-4 px-6 pb-14 md:pb-0 md:text-center"><div><div className="text-3xl font-bold tracking-tight text-white">seutudo.</div><p className="mt-1 text-sm text-white/75">O que é seu, disponível.</p></div><h1 className="text-2xl font-bold leading-tight text-white">Tudo que é seu, finalmente ao seu alcance.</h1><div className="flex items-center gap-3 pt-1"><div className="h-px flex-1 bg-white/20" /><p className="text-xs text-white/50">Toque para começar</p><div className="h-px flex-1 bg-white/20" /></div></motion.div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 md:hidden"><svg viewBox="0 0 430 64" preserveAspectRatio="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg"><path d="M0,32 C100,64 200,0 300,48 C370,64 400,32 430,40 L430,64 L0,64 Z" fill="rgba(168,61,5,0.4)" /></svg></div>
                </main>
              }
            />
            <Route path="/boas-vindas" element={WelcomeScreen} />
            <Route path="/acesso" element={LoginScreen} />
            <Route path="/cadastro" element={renderOnboarding} />
            <Route path="/painel" element={getStoredUser() ? HomeScreen : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta" element={getStoredUser() ? AccountScreen : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/meus-dados" element={getStoredUser() ? <MeusDadosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/editar-endereco" element={getStoredUser() ? <EditarEnderecoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/dados-bancarios" element={getStoredUser() ? <DadosBancariosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/alterar-senha" element={getStoredUser() ? <AlterarSenhaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos" element={getStoredUser() ? <ContratosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/duvidas" element={getStoredUser() ? <ComingSoon title="Dúvidas" /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster />
      <ThemeSwitcher />
    </>
  );
}

export default App;
