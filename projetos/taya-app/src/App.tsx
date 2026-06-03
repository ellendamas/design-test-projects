import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { IMaskInput } from "react-imask";
import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  Bank,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  Buildings,
  Cake,
  CalendarCheck,
  Car,
  CaretLeft,
  CaretRight,
  CaretDown,
  ChatCircle,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  Coins,
  CreditCard,
  CurrencyCircleDollar,
  DeviceMobile,
  DownloadSimple,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FileText,
  Fingerprint,
  Fire,
  FirstAid,
  ForkKnife,
  Gear,
  GenderIntersex,
  Gift,
  HandHeart,
  Headset,
  Heartbeat,
  House,
  HouseLine,
  IdentificationCard,
  Image,
  Info,
  Lightning,
  ListChecks,
  Lock,
  LockSimple,
  MagnifyingGlass,
  MapPin,
  Newspaper,
  PawPrint,
  PencilSimple,
  Plus,
  SealCheck,
  ShieldCheck,
  ShoppingBag,
  SignOut,
  Sliders,
  SpinnerGap,
  Stethoscope,
  Tag,
  Tooth,
  TrendUp,
  Trophy,
  Trash,
  Umbrella,
  User,
  UserCircle,
  Users,
  Wallet,
  Warning,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

import FaqAcordeon from "@/components/FaqAcordeon";
import { useInteresse } from "@/context/InteresseContext";
import { useRecomendacoes } from "@/context/RecomendacoesContext";
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
import { contratos } from "@/data/contratos";
import { usePrivacy } from "@/context/PrivacyContext";
import { useNotificacoes } from "@/context/NotificacoesContext";
import { CreditCardProvider, useCreditCard } from "@/context/CreditCardContext";
import { useSeubolso } from "@/context/SeubolsoContext";
import type { Notificacao, NotificacaoTipo } from "@/data/notificacoes";
import { trackStep } from "@/utils/analytics";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";

type ServiceType = "clt" | "fgts" | "saque-facil";
type OtpChannel = "whatsapp" | "email" | "sms";
type StoredUser = { name: string; email: string };
type RecoveryChannel = "whatsapp" | "sms" | "email";
type RecoveryRouteState = {
  cpf?: string;
  channel?: RecoveryChannel;
  otpVerified?: boolean;
  passwordUpdated?: boolean;
};

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

function isWeakNumericPin(value: string) {
  if (value.length !== 6) return true;
  if (/^(\d)\1{5}$/.test(value)) return true;
  const asc = "01234567890";
  const desc = "09876543210";
  return asc.includes(value) || desc.includes(value);
}

function isValidRg(value: string) {
  const rg = value.replace(/\D/g, "");
  if (rg.length !== 9) return false;
  if (/^(\d)\1{8}$/.test(rg)) return false;
  return true;
}

function isAdultBirthDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return false;
  const now = new Date();
  if (date > now) return false;
  const age = now.getFullYear() - y - (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d) ? 1 : 0);
  return age >= 18 && age <= 100;
}

function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string) {
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;
  const [mm, yy] = value.split("/").map(Number);
  if (mm < 1 || mm > 12) return false;
  const year = 2000 + yy;
  const expiryEnd = new Date(year, mm, 0, 23, 59, 59, 999);
  return expiryEnd >= new Date();
}

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
    photo: "/images/card-dash-clt.png",
  },
  fgts: {
    title: "Antecipar meu FGTS",
    subtitle: "Seu saldo do FGTS disponível agora",
    description: "Receba em minutos com simulação clara e sem burocracia.",
    cta: "Simular antecipação",
    icon: <FgtsCustomIcon size={20} />,
    highlight: "Taxa a partir de 1,39% a.m.",
    photo: "/images/card-dash-fgts.png",
  },
  "saque-facil": {
    title: "Saque Fácil no cartão",
    subtitle: "Saque com limite do seu cartão",
    description: "Use o limite do seu cartão de crédito. Sem consulta de crédito. Aprovação rápida!",
    cta: "Simular agora",
    icon: <CreditCard size={20} />,
    highlight: "Aprovação em minutos",
    photo: "/images/card-dash-credit-card.png",
  },
};

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function FgtsCustomIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="4" y="4" width="2" height="12" rx="1" fill="currentColor" />
      <rect x="4" y="4" width="10" height="2" rx="1" fill="currentColor" />
      <path d="M8 6H14L8 12V6Z" fill="currentColor" />
      <circle cx="7.2" cy="7.4" r="1" fill="#EFE2D9" />
    </svg>
  );
}

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

function StepHeader({ step, total, title, subtitle, labelWord = "Passo" }: { step: number; total: number; title: string; subtitle: string; labelWord?: string }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">{labelWord} {step} de {total}</span>
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

function RecoveryStepHeader({
  step,
  title,
  subtitle,
  backPath,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  backPath?: string;
}) {
  const navigate = useNavigate();
  const pct = Math.round((step / 4) * 100);

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between">
        {backPath ? (
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F5F4F2]"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <span className="text-xs font-medium text-muted-foreground">Passo {step} de 4</span>
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
  const { dataVisible } = usePrivacy();
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", currency: "R$ ••••", text: "••••••••" }[
    type
  ];
  return <span className="font-medium text-foreground">{dataVisible ? value : masked}</span>;
}

function PrivacyToggle({ size = 20, variant = "dark" }: { size?: number; variant?: "light" | "dark" }) {
  const { dataVisible, toggleVisibility } = usePrivacy();
  const iconClass = variant === "light" ? (dataVisible ? "text-white" : "text-white/60") : dataVisible ? "text-foreground" : "text-muted-foreground";

  return (
    <button
      onClick={toggleVisibility}
      className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/20 md:hover:bg-[#F5F4F2]"
      aria-label={dataVisible ? "Ocultar dados sensíveis" : "Mostrar dados sensíveis"}
      title={dataVisible ? "Ocultar dados" : "Mostrar dados"}
    >
      {dataVisible ? <Eye size={size} className={iconClass} /> : <EyeSlash size={size} className={iconClass} />}
    </button>
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

function FakeDoorCTA({
  registrado,
  onRegister,
  label,
}: {
  registrado: boolean;
  onRegister: () => void;
  label: string;
}) {
  if (registrado) {
    return (
      <Button disabled variant="outline" className="h-12 w-full rounded-xl border-[#E8590A] bg-[#FEF0E7] text-[#E8590A] opacity-100">
        <CheckCircle size={18} className="mr-2" weight="fill" />
        Interesse registrado
      </Button>
    );
  }
  return (
    <Button className="h-12 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" onClick={onRegister}>
      {label}
    </Button>
  );
}

function PlaceholderImagem({ icon, className = "h-full w-full" }: { icon: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#E5E7EB] ${className}`}>
      <div className="text-[#9CA3AF]">{icon}</div>
      <p className="text-xs text-[#9CA3AF]">Imagem em breve</p>
    </div>
  );
}

function SubPageLayout({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { naoLidas } = useNotificacoes();
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
          <h1 className="flex-1 text-base font-semibold text-foreground">{title}</h1>
          <PrivacyToggle size={18} variant="dark" />
          <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F5F4F2]">
            <Bell size={18} className="text-muted-foreground" />
            {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E8590A] text-[9px] font-bold text-white">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
          </button>
        </header>
        <div className="px-4 py-5 pb-28 md:mx-auto md:max-w-[640px] md:px-0 md:py-8">{children}</div>

        <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm md:hidden">
          <ul className="grid w-full grid-cols-5 text-center">
            {navItems.map((item) => (
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
      </main>
    </div>
  );
}

type SaqueFacilStep = "intro" | "simulation" | "data_intro" | "rg" | "birth" | "income" | "civil" | "gender" | "card_due_day" | "address" | "bank" | "stark_analysis" | "card_type" | "card" | "selfie_ownership" | "selfie_identity" | "confirmation" | "success";

const etapasSaqueFacil = [
  { id: "simulacao", label: "Simulação" },
  { id: "dados", label: "Seus dados" },
  { id: "cartao", label: "Cartão" },
  { id: "verificacao", label: "Verificação" },
  { id: "confirmacao", label: "Confirmar" },
] as const;

function StepperSaqueFacil({ etapaAtual }: { etapaAtual: string }) {
  const idx = etapasSaqueFacil.findIndex((e) => e.id === etapaAtual);
  return (
    <div className="mb-6 flex w-full items-center justify-between px-1">
      {etapasSaqueFacil.map((etapa, i) => (
        <motion.div key={etapa.id} className="contents">
          <div key={etapa.id} className="flex min-w-0 flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < idx
                  ? "bg-[#E8590A] text-white"
                  : i === idx
                    ? "bg-[#E8590A] text-white ring-4 ring-[#FEF0E7]"
                    : "border border-border bg-[#F5F4F2] text-muted-foreground"
              }`}
            >
              {i < idx ? <CheckCircle size={14} weight="fill" /> : i + 1}
            </div>
            <span
              className={`max-w-[52px] text-center text-[10px] leading-tight ${
                i === idx ? "font-semibold text-[#E8590A]" : i < idx ? "text-[#E8590A]" : "text-muted-foreground"
              }`}
            >
              {etapa.label}
            </span>
          </div>
          {i < etapasSaqueFacil.length - 1 ? <div className={`mx-1 mb-4 h-0.5 flex-1 ${i < idx ? "bg-[#E8590A]" : "bg-[#F5F4F2]"}`} /> : null}
        </motion.div>
      ))}
    </div>
  );
}

function OptionButton({ selected, onClick, children, fullWidth = false }: { selected: boolean; onClick: () => void; children: ReactNode; fullWidth?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${fullWidth ? "w-full" : ""} ${selected ? "border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]" : "border-border bg-white text-foreground hover:border-[#E8590A]/40"}`}
    >
      {children}
    </button>
  );
}

function SaqueFacilPage() {
  const navigate = useNavigate();
  const { state, setState } = useCreditCard();
  const { adicionarPontos } = useSeubolso();
  const [step, setStep] = useState<SaqueFacilStep>("intro");
  const pontosRegistradosRef = useRef(false);
  const [orgaoExpedidor, setOrgaoExpedidor] = useState("SSP");
  const [faixaRenda, setFaixaRenda] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [taxasOpen, setTaxasOpen] = useState(false);
  const [focused, setFocused] = useState<"number" | "name" | "expiry" | "cvc" | "">("");
  const [addressCep, setAddressCep] = useState("01522-000");
  const [addressStreet, setAddressStreet] = useState("Rua Dona Ana Neri");
  const [addressNumber, setAddressNumber] = useState("581");
  const [agencia, setAgencia] = useState("1234");
  const [addressSelected, setAddressSelected] = useState(true);
  const [bankSelected, setBankSelected] = useState(true);
  const [bankSearch, setBankSearch] = useState("");
  const [bankName, setBankName] = useState("Banco Inter");
  const [bankConta, setBankConta] = useState("12345");
  const [bankDigito, setBankDigito] = useState("6");
  const [cardType, setCardType] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [addressBairro, setAddressBairro] = useState("Cambuci");
  const [addressCidade, setAddressCidade] = useState("São Paulo");
  const [addressEstado, setAddressEstado] = useState("SP");
  const [cepErro, setCepErro] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const numeroRef = useRef<HTMLInputElement>(null);
  const [usarOutroDia, setUsarOutroDia] = useState(false);
  const [openBanco, setOpenBanco] = useState(false);
  const [bancoSelecionado, setBancoSelecionado] = useState<{ cod: string; nome: string } | null>(null);
  const [useOtherAddress, setUseOtherAddress] = useState(false);
  const [useOtherBank, setUseOtherBank] = useState(false);
  const [starkProgress, setStarkProgress] = useState(0);
  const [starkApproved, setStarkApproved] = useState<boolean | null>(null);
  const [showStarkButton, setShowStarkButton] = useState(false);

  const flow: SaqueFacilStep[] = ["simulation", "data_intro", "rg", "birth", "income", "civil", "gender", "card_due_day", "address", "bank", "stark_analysis", "card_type", "card", "selfie_ownership", "selfie_identity", "confirmation", "success"];
  const index = flow.indexOf(step);
  const firstName = (getStoredUser()?.name || "Cliente").split(" ")[0];

  const toCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const parseCurrency = (value: string) => {
    const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
    return Number(normalized) || 0;
  };

  const limiteCartao = state.valorDesejado || 0;
  const valorLiquido = useMemo(() => limiteCartao / 1.1315, [limiteCartao]);
  const valorParcela = useMemo(() => (state.numeroParcelas > 0 ? limiteCartao / state.numeroParcelas : 0), [limiteCartao, state.numeroParcelas]);
  const cardFinal = state.numeroCartao.replace(/\s/g, "").slice(-4) || "----";

  const stepMap: Record<SaqueFacilStep, string> = {
    intro: "credit_card_intro",
    simulation: "credit_card_simulation",
    data_intro: "credit_card_data_intro",
    rg: "credit_card_rg",
    birth: "credit_card_birth_date",
    income: "credit_card_income",
    civil: "credit_card_civil_status",
    gender: "credit_card_gender",
    card_due_day: "credit_card_due_day",
    address: "credit_card_address_confirmation",
    bank: "credit_card_bank_confirmation",
    stark_analysis: "credit_card_stark_analysis",
    card_type: "credit_card_type_selection",
    card: "credit_card_card_data",
    selfie_ownership: "credit_card_selfie_ownership",
    selfie_identity: "credit_card_selfie_identity",
    confirmation: "credit_card_confirmation",
    success: "credit_card_success",
  };

  useEffect(() => {
    trackStep(stepMap[step]);
  }, [step]);

  useEffect(() => {
    if (step !== "selfie_ownership") return;
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, selfieOwnershipOk: true }));
      setStep("selfie_identity");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [step, setState]);

  useEffect(() => {
    if (step !== "selfie_identity") return;
    const timer = window.setTimeout(() => {
      setState((prev) => ({ ...prev, selfieIdentityOk: true }));
      setStep("confirmation");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [step, setState]);

  useEffect(() => {
    if (step !== "stark_analysis") return;
    setStarkApproved(null);
    setShowStarkButton(false);
    setStarkProgress(0);

    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / 4000) * 100));
      setStarkProgress(pct);
    }, 120);

    const timer = window.setTimeout(() => {
      window.clearInterval(interval);
      setStarkProgress(100);
      setStarkApproved(true);
      window.setTimeout(() => setShowStarkButton(true), 1000);
    }, 4000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [step]);

  useEffect(() => {
    if (step === "success") {
      toast("seutudo.", { description: "Você vai receber um e-mail com o contrato assinado." });
    }
  }, [step]);

  useEffect(() => {
    if (step !== "success" || pontosRegistradosRef.current) return;
    if (typeof window !== "undefined" && window.sessionStorage.getItem("seubolso_saque_facil_awarded") === "1") return;
    pontosRegistradosRef.current = true;
    if (typeof window !== "undefined") window.sessionStorage.setItem("seubolso_saque_facil_awarded", "1");
    adicionarPontos(300, "Saque Fácil contratado");
    const timer = window.setTimeout(() => {
      toast("seutudo.", {
        description: "Você ganhou 300 seubônus por contratar o Saque Fácil!",
        icon: <Coins size={16} className="text-[#E8590A]" />,
        duration: 4000,
      });
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [step, adicionarPontos]);

  const goBack = () => {
    if (step === "intro") return navigate("/painel");
    if (step === "simulation") return setStep("intro");
    if (index > 0) return setStep(flow[index - 1]);
    navigate("/painel");
  };

  const goNext = () => {
    if (step === "intro") return setStep("simulation");
    if (step === "confirmation") return setStep("success");
    if (step === "success") return navigate("/painel");
    if (index >= 0 && index < flow.length - 1) setStep(flow[index + 1]);
  };

  const showHeader = !["intro", "data_intro", "success"].includes(step);
  const displayStep = step === "simulation" ? 1 : ["rg", "birth", "income", "civil", "gender", "card_due_day", "address", "bank"].includes(step) ? 2 : ["stark_analysis", "card_type", "card"].includes(step) ? 3 : ["selfie_ownership", "selfie_identity"].includes(step) ? 4 : 5;

  const canAdvance = useMemo(() => {
    if (step === "simulation") return limiteCartao > 0 && state.numeroParcelas >= 4;
    if (step === "data_intro") return true;
    if (step === "rg") return isValidRg(state.rg) && orgaoExpedidor.length > 0;
    if (step === "birth") return isAdultBirthDate(state.dataNascimento);
    if (step === "income") return Boolean(faixaRenda);
    if (step === "civil") return Boolean(state.estadoCivil);
    if (step === "gender") return Boolean(state.sexo);
    if (step === "card_due_day") return Boolean(cardDueDay);
    if (step === "address") return useOtherAddress ? Boolean(addressCep && addressStreet && addressNumber) : addressSelected;
    if (step === "bank") return useOtherBank ? Boolean(bankName && agencia && bankConta && bankDigito) : bankSelected;
    if (step === "stark_analysis") return starkApproved === true && showStarkButton;
    if (step === "card_type") return Boolean(cardType);
    if (step === "card") return Boolean(isValidCardNumber(state.numeroCartao) && state.nomeCartao.trim().length >= 3 && isValidExpiry(state.vencimento) && state.cvv.replace(/\D/g, "").length >= 3);
    if (step === "confirmation") return state.termoAceito;
    return true;
  }, [step, limiteCartao, state, orgaoExpedidor, faixaRenda, cardDueDay, useOtherAddress, addressCep, addressStreet, addressNumber, addressSelected, useOtherBank, bankName, agencia, bankConta, bankDigito, bankSelected, starkApproved, showStarkButton, cardType]);

  const faq = [
    { q: "Quem pode usar o Saque Fácil?", a: "Qualquer pessoa com cartão de crédito com bandeira reconhecida (Visa, Mastercard, Elo, Hipercard ou Amex), função crédito ativa e limite disponível. Cartões Alelo, Sodexo e VR não são aceitos." },
    { q: "Como aparece na fatura?", a: "A cobrança aparece como STARK*SeuTudo junto ao valor de cada parcela." },
    { q: "O que acontece com meu limite?", a: "Seu limite é usado na contratação e vai sendo liberado conforme você paga as parcelas mensais, igual a uma compra comum." },
    { q: "É seguro?", a: "Sim. A operação usa tecnologia Unico para validar sua identidade e seu cartão, com assinatura eletrônica com validade jurídica." },
  ];

  const subtelaParaEtapa: Record<SaqueFacilStep, string> = {
    intro: "simulacao",
    simulation: "simulacao",
    data_intro: "dados",
    rg: "dados",
    birth: "dados",
    income: "dados",
    civil: "dados",
    gender: "dados",
    card_due_day: "dados",
    address: "dados",
    bank: "dados",
    card_type: "cartao",
    card: "cartao",
    stark_analysis: "verificacao",
    selfie_ownership: "verificacao",
    selfie_identity: "verificacao",
    confirmation: "confirmacao",
    success: "confirmacao",
  };

  const bancosBrasil = [
    { cod: "001", nome: "Banco do Brasil" }, { cod: "341", nome: "Itaú Unibanco" }, { cod: "237", nome: "Bradesco" }, { cod: "033", nome: "Santander" },
    { cod: "104", nome: "Caixa Econômica Federal" }, { cod: "260", nome: "Nubank" }, { cod: "077", nome: "Banco Inter" }, { cod: "290", nome: "PagBank" },
    { cod: "323", nome: "Mercado Pago" }, { cod: "336", nome: "C6 Bank" }, { cod: "212", nome: "Banco Original" }, { cod: "756", nome: "Sicoob" },
    { cod: "748", nome: "Sicredi" }, { cod: "422", nome: "Safra" }, { cod: "070", nome: "BRB" }, { cod: "756", nome: "Bancoob" },
    { cod: "085", nome: "Via Credi" }, { cod: "756", nome: "Unicred" }, { cod: "389", nome: "Banco Mercantil" }, { cod: "074", nome: "BCO. J.SAFRA" },
    { cod: "707", nome: "Daycoval" }, { cod: "655", nome: "Votorantim" }, { cod: "169", nome: "Banco Olé" }, { cod: "274", nome: "Money Plus" },
    { cod: "318", nome: "BMG" }, { cod: "121", nome: "Agibank" }, { cod: "380", nome: "PicPay" }, { cod: "364", nome: "EFÍ Bank" },
    { cod: "403", nome: "Cora" }, { cod: "461", nome: "Asaas" }, { cod: "084", nome: "Uniprime" },
  ];

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setCepErro("");
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepErro("CEP não encontrado. Verifique e tente novamente.");
        return;
      }
      setAddressStreet(data.logradouro || "");
      setAddressBairro(data.bairro || "");
      setAddressCidade(data.localidade || "");
      setAddressEstado(data.uf || "");
      requestAnimationFrame(() => numeroRef.current?.focus());
    } catch {
      setCepErro("Não foi possível buscar o CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <SubPageLayout title="Saque Fácil no cartão">
      <style>{`.rccs__card--front{background:linear-gradient(135deg,#1C1917,#374151)!important}.rccs__card--back{background:linear-gradient(135deg,#374151,#1C1917)!important}`}</style>
      <div className="space-y-4 md:mx-auto md:max-w-[640px]">
        {step !== "intro" ? <StepperSaqueFacil etapaAtual={subtelaParaEtapa[step]} /> : null}

        <div>
        {step === "intro" && (
          <div className="space-y-6 px-4 pb-24">
            <div className="relative mb-5 min-h-[200px] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80&fit=crop&crop=center"
                alt="Saque Fácil"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#A33D05] via-[#E8590A]/70 to-transparent" />
              <div className="relative z-10 flex min-h-[200px] flex-col justify-end p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/75">Saque Fácil no cartão</p>
                <h1 className="mb-2 text-2xl font-bold leading-tight text-white">Transforme o limite do seu cartão em dinheiro na conta</h1>
                <p className="text-sm text-white/85">Em poucos minutos, sem análise de crédito</p>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"><CheckCircle size={12} className="text-[#E8590A]" />100% digital</div>
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"><CheckCircle size={12} className="text-[#E8590A]" />Sem burocracia</div>
              <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"><ShieldCheck size={12} className="text-[#E8590A]" />Com segurança</div>
            </div>

            <Card className="mb-6 border-border shadow-sm">
              <CardContent className="divide-y divide-border pt-0">
                {[{ icon: <Lightning size={20} />, titulo: "Dinheiro em até 30 minutos", desc: "Após a aprovação, o valor cai direto na sua conta." }, { icon: <X size={20} />, titulo: "Sem análise de crédito", desc: "Não consultamos SPC ou Serasa. Só precisa ter limite disponível." }, { icon: <Sliders size={20} />, titulo: "Você escolhe as parcelas", desc: "De 4 a 12 vezes, no limite do seu cartão de crédito." }].map((b) => (
                  <div key={b.titulo} className="flex gap-3 py-4 first:pt-5 last:pb-5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF0E7] text-[#E8590A]">{b.icon}</div>
                    <div><p className="text-sm font-semibold text-foreground">{b.titulo}</p><p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <p className="mb-3 text-base font-semibold text-foreground">Saiba mais sobre o Saque Fácil</p>
              {faq.map((item, i) => {
                const open = faqOpen === i;
                return (
                  <Card key={item.q} className="border-border">
                    <CardContent className="p-0">
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left" onClick={() => setFaqOpen(open ? null : i)}>
                        <span className="text-sm font-medium text-foreground">{item.q}</span>
                        <CaretDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open ? <p className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground">{item.a}</p> : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-background pb-6 pt-3">
              <Button className="h-12 w-full rounded-xl bg-[#E8590A] text-base font-semibold text-white hover:bg-[#A33D05]" onClick={goNext}>Quero simular <ArrowRight size={16} className="ml-2" /></Button>
            </div>
          </div>
        )}

        {step === "data_intro" && (
          <Card className="border-border">
            <CardContent className="space-y-4 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><ClipboardText size={36} /></div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Agora precisamos de alguns dados seus</h2>
                <p className="mt-1 text-sm text-muted-foreground">São informações necessárias para o seu contrato. Leva menos de 2 minutos.</p>
              </div>
              <ul className="space-y-2 text-left text-sm">
                {[
                  "Documento de identidade (RG)",
                  "Data de nascimento e renda",
                  "Endereço de cobrança",
                  "Conta bancária para receber",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground"><CheckCircle size={16} className="text-[#E8590A]" />{item}</li>
                ))}
              </ul>
              <SecurityStrip />
            </CardContent>
          </Card>
        )}

        {step === "simulation" && (
          <div className="space-y-4">
            <div><h2 className="text-xl font-bold text-foreground">Qual é o limite disponível no seu cartão?</h2><p className="mt-1 text-sm text-muted-foreground">Informe o limite que está disponível agora para usarmos na simulação.</p></div>
            <IMaskInput mask={Number} scale={2} signed={false} thousandsSeparator="." radix="," mapToRadix={["."]} normalizeZeros padFractionalZeros value={limiteCartao.toString()} onAccept={(v) => setState((prev) => ({ ...prev, valorDesejado: parseCurrency(String(v)) }))} className="h-16 w-full rounded-xl border border-border px-3 text-center text-2xl font-bold" placeholder="R$ 0,00" />
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Número de parcelas</p>
              <input type="range" min={4} max={12} step={1} value={state.numeroParcelas} onChange={(e) => setState((prev) => ({ ...prev, numeroParcelas: Number(e.target.value) }))} className="w-full accent-[#E8590A]" />
              <div className="mt-1 flex justify-between text-xs" style={{ paddingLeft: "8px", paddingRight: "8px" }}>{[4,5,6,7,8,9,10,11,12].map((n)=><span key={n} className={n===state.numeroParcelas?"font-bold text-[#E8590A]":"text-muted-foreground"}>{n}</span>)}</div>
            </div>
            <div className="mt-4">
              <div className="rounded-2xl bg-[#FEF0E7] p-4">
                <p className="mb-1 text-xs font-medium text-[#A33D05]">Você precisa ter este limite disponível no cartão</p>
                <p className="text-3xl font-bold text-[#E8590A]">R$ {toCurrency(limiteCartao)}</p>
                <div className="mt-3 grid grid-cols-2 gap-3"><div><p className="text-xs text-[#A33D05]/70">Você vai receber</p><p className="text-base font-bold text-[#A33D05]">R$ {toCurrency(valorLiquido)}</p></div><div><p className="text-xs text-[#A33D05]/70">Parcelas de</p><p className="text-base font-bold text-[#A33D05]">{state.numeroParcelas}x R$ {toCurrency(valorParcela)}</p></div></div>
              </div>
              <button className="mt-3 flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm" onClick={() => setTaxasOpen((p) => !p)}>
                Ver taxas da operação
                <CaretDown size={16} className={`transition-transform ${taxasOpen ? "rotate-180" : ""}`} />
              </button>
              {taxasOpen ? <div className="mt-2 rounded-xl bg-white p-3 text-xs text-muted-foreground">CET estimado: 13,15%. IOF e encargos já incluídos na simulação.</div> : null}
            </div>
          </div>
        )}

        {step === "rg" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><IdentificationCard size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Qual é o seu RG?</h2></div><IMaskInput mask="00.000.000-0" value={state.rg} onAccept={(v) => setState((p) => ({ ...p, rg: String(v) }))} placeholder="00.000.000-0" className={maskedInputClass} /><div className="grid grid-cols-3 gap-2">{["SSP","DETRAN","PC","PM","SSPDS","Outro"].map((o)=><OptionButton key={o} selected={orgaoExpedidor===o} onClick={()=>setOrgaoExpedidor(o)}>{o}</OptionButton>)}</div></CardContent></Card>}
        {step === "birth" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><Cake size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Data de nascimento</h2></div><IMaskInput mask="00/00/0000" value={state.dataNascimento} onAccept={(v) => setState((p) => ({ ...p, dataNascimento: String(v) }))} placeholder="DD/MM/AAAA" className={maskedInputClass} /></CardContent></Card>}
        {step === "income" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><CurrencyCircleDollar size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Qual é sua renda?</h2></div><div className="grid grid-cols-2 gap-2">{["Até R$ 2.000","R$ 2.001 a R$ 4.000","R$ 4.001 a R$ 8.000","Acima de R$ 8.000"].map((f)=><button key={f} onClick={()=>{ setFaixaRenda(f); setState((p)=>({...p,renda: f==="Até R$ 2.000"?2000:f==="R$ 2.001 a R$ 4.000"?4000:f==="R$ 4.001 a R$ 8.000"?8000:10000})); }} className={`rounded-xl border px-3 py-2 text-xs ${faixaRenda===f?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>{f}</button>)}</div></CardContent></Card>}
        {step === "civil" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><Users size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Estado civil</h2></div><div className="grid grid-cols-2 gap-2">{["Solteiro(a)","Casado(a)","Divorciado(a)","Viúvo(a)"].map((v)=><OptionButton key={v} selected={state.estadoCivil===v} onClick={()=>setState((p)=>({...p,estadoCivil:v}))}>{v}</OptionButton>)}</div></CardContent></Card>}
        {step === "gender" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><GenderIntersex size={28} className="text-[#E8590A]" /><User size={0} className="hidden" /></div><h2 className="text-xl font-bold">Sexo</h2><p className="text-sm text-muted-foreground">Informação necessária para o seu contrato.</p></div><div className="grid grid-cols-2 gap-2"><button onClick={()=>setState((p)=>({...p,sexo:"M"}))} className={`h-11 rounded-xl border text-sm ${state.sexo==="M"?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>Masculino</button><button onClick={()=>setState((p)=>({...p,sexo:"F"}))} className={`h-11 rounded-xl border text-sm ${state.sexo==="F"?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>Feminino</button><button onClick={()=>setState((p)=>({...p,sexo:"N"}))} className={`col-span-2 h-11 rounded-xl border text-sm ${state.sexo==="N"?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>Prefiro não informar</button></div></CardContent></Card>}
        {step === "card_due_day" && <Card className="border-border"><CardContent className="space-y-3 p-4"><h2 className="text-xl font-bold text-foreground">Dia do vencimento do cartão que será usado</h2><p className="text-sm text-muted-foreground">Selecione o dia de vencimento.</p><div className="grid grid-cols-4 gap-2">{[1,5,10,15,20,25].map((d)=><button key={d} onClick={()=>{setUsarOutroDia(false); setCardDueDay(String(d));}} className={`h-10 rounded-xl border text-sm ${cardDueDay===String(d)&&!usarOutroDia?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>{d}</button>)}<button onClick={()=>{setUsarOutroDia(true); if(!cardDueDay) setCardDueDay("1");}} className={`h-10 rounded-xl border text-sm ${usarOutroDia?"border-[#E8590A] bg-[#FEF0E7] text-[#A33D05]":"border-border"}`}>Outro</button></div>{usarOutroDia ? <select value={cardDueDay} onChange={(e)=>setCardDueDay(String(Number(e.target.value)))} className="mt-2 h-12 w-full rounded-xl border border-border bg-white px-4 text-foreground">{Array.from({length:31},(_,i)=>i+1).map((d)=><option key={d} value={d}>Dia {d}</option>)}</select> : null}</CardContent></Card>}
        {step === "address" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><MapPin size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Confirme seu endereço de cobrança</h2><p className="text-sm text-muted-foreground">É para onde enviaremos as comunicações do contrato</p></div>{!useOtherAddress ? <><button onClick={()=>{setAddressSelected(true); setState((p)=>({...p,enderecoConfirmado:true})); goNext();}} className={`w-full space-y-0.5 rounded-xl border p-4 text-left text-sm leading-relaxed ${addressSelected?"border-[#E8590A] bg-[#FEF0E7]/40":"border-border"}`}><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-[#A33D05]">Endereço cadastrado</span>{addressSelected ? <Badge className="border-0 bg-[#FEF0E7] text-[#A33D05]">Usar este endereço</Badge> : null}</div><p>{addressStreet}, {addressNumber}</p><p>{addressBairro}</p><p>{addressCidade} / {addressEstado}</p><p>CEP: {addressCep}</p></button><Button variant="outline" className="h-11 w-full rounded-xl border-border" onClick={()=>setUseOtherAddress(true)}><PencilSimple size={16} className="mr-2" />Adicionar outro endereço</Button></> : <><div className="relative"><IMaskInput mask="00000-000" value={addressCep} onAccept={(v)=>{const val=String(v); setAddressCep(val); if(val.replace(/\D/g,"").length===8) buscarCEP(val);}} className={maskedInputClass} placeholder="CEP" />{cepLoading ? <SpinnerGap size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" /> : null}</div><button className="text-sm text-primary underline" onClick={()=>window.open("https://buscacepinter.correios.com.br","_blank")}>Não sei meu CEP</button>{cepErro ? <p className="text-xs text-red-500">{cepErro}</p> : null}<Input value={addressStreet} onChange={(e)=>setAddressStreet(e.target.value)} className={`h-12 rounded-xl ${cepLoading?"animate-pulse bg-[#F5F4F2]":""}`} placeholder="Logradouro" /><Input ref={numeroRef} value={addressNumber} onChange={(e)=>setAddressNumber(e.target.value)} className="h-12 rounded-xl" placeholder="Número" /><Input value={addressBairro} onChange={(e)=>setAddressBairro(e.target.value)} className={`h-12 rounded-xl ${cepLoading?"animate-pulse bg-[#F5F4F2]":""}`} placeholder="Bairro" /><Input value={addressCidade} readOnly className={`h-12 rounded-xl opacity-70 ${cepLoading?"animate-pulse bg-[#F5F4F2]":""}`} placeholder="Cidade" /><Input value={addressEstado} readOnly className={`h-12 rounded-xl opacity-70 ${cepLoading?"animate-pulse bg-[#F5F4F2]":""}`} placeholder="Estado" /><Input className="h-12 rounded-xl" placeholder="Complemento (opcional)" /><Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" disabled={!addressCep || !addressStreet || !addressNumber || !addressBairro || !addressCidade || !addressEstado} onClick={()=>{setState((p)=>({...p,enderecoConfirmado:true})); goNext();}}>Usar endereço informado</Button></>}</CardContent></Card>}
        {step === "bank" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><Bank size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Para qual conta enviamos o dinheiro?</h2></div>{!useOtherBank ? <><button onClick={()=>{setBankSelected(true); setState((p)=>({...p,bancoConfirmado:true})); goNext();}} className={`w-full rounded-xl border p-4 text-left ${bankSelected?"border-[#E8590A] bg-[#FEF0E7]/40":"border-border"}`}><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold">{bankName}</p>{bankSelected ? <Badge className="border-0 bg-[#FEF0E7] text-[#A33D05]">Receber nesta conta</Badge> : null}</div><p className="text-xs text-muted-foreground">Agência · <SensitiveData value={agencia} type="text" /></p><p className="text-xs text-muted-foreground">Conta corrente · <SensitiveData value={`${bankConta}-${bankDigito}`} type="text" /></p></button><Button variant="outline" className="h-11 w-full rounded-xl border-border" onClick={()=>setUseOtherBank(true)}><Bank size={16} className="mr-2" />Adicionar outra conta</Button></> : <><div className="relative"><button className="flex h-12 w-full items-center justify-between rounded-xl border border-border bg-white px-4 text-left" onClick={()=>setOpenBanco((p)=>!p)}><span className={bancoSelecionado?"text-foreground":"text-muted-foreground"}>{bancoSelecionado?.nome ?? "Selecionar banco"}</span><CaretDown size={16} className="text-muted-foreground" /></button>{openBanco ? <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-white p-2 shadow-sm"><input value={bankSearch} onChange={(e)=>setBankSearch(e.target.value)} placeholder="Buscar banco..." className="mb-2 h-9 w-full rounded-lg border border-border px-3 text-sm" />{bancosBrasil.filter((b)=>b.nome.toLowerCase().includes(bankSearch.toLowerCase())).map((b)=><button key={`${b.cod}-${b.nome}`} className="flex w-full items-center rounded-lg px-2 py-2 text-left text-sm hover:bg-[#F5F4F2]" onClick={()=>{setBancoSelecionado(b); setBankName(b.nome); setOpenBanco(false);}}><span className="mr-2 text-xs text-muted-foreground">{b.cod}</span>{b.nome}</button>)}</div> : null}</div><Input value={agencia} onChange={(e)=>setAgencia(e.target.value)} className="h-12 rounded-xl" placeholder="Agência" /><div className="grid grid-cols-[1fr_auto_70px] items-end gap-2"><Input value={bankConta} onChange={(e)=>setBankConta(e.target.value)} className="h-12 rounded-xl" placeholder="Conta" /><span className="pb-3 text-muted-foreground">-</span><Input value={bankDigito} onChange={(e)=>setBankDigito(e.target.value)} className="h-12 rounded-xl" placeholder="Dígito" /></div><Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" disabled={!bankName || !agencia || !bankConta || !bankDigito} onClick={()=>{setState((p)=>({...p,bancoConfirmado:true})); goNext();}}>Receber nesta conta</Button></>}</CardContent></Card>}

        {step === "card_type" && <Card className="border-border"><CardContent className="space-y-3 p-4"><div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><CreditCard size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Que tipo de cartão você vai usar?</h2><p className="text-sm text-muted-foreground">Vamos identificar as melhores condições para o seu cartão.</p></div><div className="grid grid-cols-2 gap-2">{[{value:"rede",label:"Banco de rede",desc:"Itaú, Bradesco, Santander, BB...",icon:<Bank size={20}/>},{value:"digital",label:"Banco digital",desc:"Nubank, Inter, C6, PicPay...",icon:<DeviceMobile size={20}/>},{value:"porto",label:"Porto Seguro",desc:"Cartão Porto Bank",icon:<ShieldCheck size={20}/>},{value:"inss",label:"Cartão INSS",desc:"Consignado para aposentados",icon:<IdentificationCard size={20}/>},{value:"siape",label:"SIAPE / Servidor",desc:"Funcional público",icon:<Buildings size={20}/>},{value:"loja",label:"Cartão de loja",desc:"Magalu, Renner, Riachuelo...",icon:<ShoppingBag size={20}/>}].map((t)=><button key={t.value} onClick={()=>setCardType(t.value)} className={`rounded-xl border p-3 text-left ${cardType===t.value?"border-[#E8590A] bg-[#FEF0E7]":"border-border"}`}><div className="mb-1 text-[#E8590A]">{t.icon}</div><p className="text-sm font-semibold text-foreground">{t.label}</p><p className="text-xs text-muted-foreground">{t.desc}</p></button>)}</div></CardContent></Card>}

        {step === "stark_analysis" && (
          <Card className="border-border">
            <CardContent className="space-y-4 p-6 text-center">
              {starkApproved === null ? (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><MagnifyingGlass size={32} className="animate-pulse" /></div>
                  <h2 className="text-xl font-bold text-foreground">Verificando sua elegibilidade...</h2>
                  <p className="text-sm text-muted-foreground">Estamos consultando os dados junto ao nosso parceiro.</p>
                  <Progress value={starkProgress} className="h-2 bg-secondary [&>div]:bg-[#E8590A]" />
                  <p className="text-xs text-muted-foreground">Protegido por Stark</p>
                </>
              ) : (
                <>
                  <CheckCircle size={44} weight="fill" className="mx-auto text-[#E8590A]" />
                  <h2 className="text-xl font-bold text-foreground">Tudo certo!</h2>
                  <p className="text-sm text-muted-foreground">Seus dados foram verificados. Agora é só adicionar o cartão.</p>
                  {showStarkButton ? <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] md:w-auto md:min-w-[160px]" onClick={goNext}>Adicionar meu cartão <ArrowRight size={16} className="ml-2" /></Button> : null}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === "card" && (
          <Card className="border-border">
            <CardContent className="space-y-3 p-4">
              <div className="mb-2 flex flex-col items-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7]"><CreditCard size={28} className="text-[#E8590A]" /></div><h2 className="text-xl font-bold">Dados do cartão</h2></div>
               <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FEF0E7] px-3 py-2.5"><LockSimple size={16} className="shrink-0 text-[#A33D05]" /><div><p className="text-xs font-semibold text-[#A33D05]">Ambiente seguro</p><p className="text-xs text-[#A33D05]/80">Seus dados são criptografados e nunca armazenados sem sua autorização.</p></div><ShieldCheck size={20} className="ml-auto shrink-0 text-[#E8590A]" /></div>
               <div className="mb-2 flex justify-center"><Cards number={state.numeroCartao} name={state.nomeCartao} expiry={state.vencimento.replace("/", "")} cvc={state.cvv} focused={focused} placeholders={{ name: "Seu nome aqui" }} locale={{ valid: "Validade" }} /></div>
              <IMaskInput mask="0000 0000 0000 0000" value={state.numeroCartao} onAccept={(v) => setState((p) => ({ ...p, numeroCartao: String(v) }))} onFocus={() => setFocused("number")} onBlur={() => setFocused("")} placeholder="Número do cartão" className={maskedInputClass} />
              <Input value={state.nomeCartao} onChange={(e) => setState((p) => ({ ...p, nomeCartao: e.target.value }))} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} className="h-12 rounded-xl" placeholder="Nome impresso no cartão" />
              <div className="grid grid-cols-2 gap-2"><IMaskInput mask="00/00" value={state.vencimento} onAccept={(v) => setState((p) => ({ ...p, vencimento: String(v) }))} onFocus={() => setFocused("expiry")} onBlur={() => setFocused("")} placeholder="MM/AA" className={maskedInputClass} /><IMaskInput mask="000" value={state.cvv} onAccept={(v) => setState((p) => ({ ...p, cvv: String(v) }))} onFocus={() => setFocused("cvc")} onBlur={() => setFocused("")} placeholder="CVV" className={maskedInputClass} /></div>
            </CardContent>
          </Card>
        )}

        {(step === "selfie_ownership" || step === "selfie_identity") && (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center space-y-4 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><Fingerprint size={28} className="animate-pulse" /></div>
              <SpinnerGap size={28} className="animate-spin text-[#E8590A]" />
              <h2 className="text-xl font-bold text-foreground">{step === "selfie_ownership" ? "Validando titularidade do cartão..." : "Confirmando sua identidade..."}</h2>
              <p className="text-sm text-muted-foreground">{step === "selfie_ownership" ? "Verificando se o cartão pertence a você. Aguarde." : "Verificando seus documentos com segurança."}</p>
              <p className="text-xs text-muted-foreground">Protegido por Unico</p>
            </CardContent>
          </Card>
        )}

        {step === "confirmation" && (
          <Card className="border-border">
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col items-center text-center"><CheckCircle size={42} className="text-[#E8590A]" /><h2 className="mt-2 text-xl font-bold">Tudo pronto. Só falta confirmar.</h2><p className="text-sm text-muted-foreground">Revise os dados e confirme para liberar o dinheiro.</p></div>
              <div className="space-y-2.5 rounded-2xl bg-[#FEF0E7] p-4">{[{label:"Você vai receber",value:`R$ ${toCurrency(valorLiquido)}`},{label:"Limite usado no cartão",value:`R$ ${toCurrency(limiteCartao)}`},{label:"Parcelas",value:`${state.numeroParcelas}x de R$ ${toCurrency(valorParcela)}`},{label:"Cartão",value:`Final ${cardFinal}`},{label:"Conta de destino",value:`Banco ag. ${agencia}`},{label:"Na fatura aparece como",value:"STARK*SeuTudo"}].map((item)=><div key={item.label} className="flex items-center justify-between gap-2"><p className="text-xs text-[#A33D05]/70">{item.label}</p><p className="text-xs font-semibold text-[#A33D05]">{item.value}</p></div>)}</div>
              <button
                type="button"
                onClick={() => setState((p) => ({ ...p, termoAceito: !p.termoAceito }))}
                className={`w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-all ${
                  state.termoAceito ? "border-[#E8590A] bg-[#FEF0E7]" : "border-border bg-white hover:border-[#E8590A]/40"
                }`}
              >
                <div
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    state.termoAceito ? "bg-[#E8590A] border-[#E8590A]" : "border-border bg-white"
                  }`}
                >
                  {state.termoAceito && <Check size={12} className="text-white" weight="bold" />}
                </div>
                <p className="text-sm text-foreground leading-snug">
                  Confirmo que li e aceito os <a href="#" className="text-[#E8590A] underline underline-offset-2">termos</a> desta operação, incluindo as condições
                  de pagamento e o uso do limite do meu cartão de crédito.
                </p>
              </button>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <Card className="border-border">
            <CardContent className="space-y-4 p-6 text-center">
              <CheckCircle size={48} weight="fill" className="mx-auto text-[#E8590A]" />
              <h2 className="text-2xl font-bold text-foreground">Pronto, {firstName}.</h2>
              <p className="text-sm text-muted-foreground">O dinheiro está a caminho. Deve cair em até 30 minutos.</p>
              <div className="rounded-2xl bg-[#FEF0E7] p-4 text-left"><p className="text-xs text-[#A33D05]/70">Você vai receber</p><p className="text-xl font-bold text-[#A33D05]">R$ {toCurrency(valorLiquido)}</p><p className="mt-1 text-xs text-[#A33D05]/70">Cartão final {cardFinal} · {state.numeroParcelas}x</p></div>
              <Card className="border-border bg-white shadow-sm"><CardContent className="flex items-center justify-between gap-3 p-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><Coins size={16} /></div><p className="text-sm text-foreground">+300 seubônus adicionados ao seu saldo</p></div><button className="text-sm font-medium text-[#E8590A]" onClick={() => navigate("/seubolso")}>Ver meu seubônus <CaretRight size={14} className="inline" /></button></CardContent></Card>
              <div className="grid gap-2 md:flex md:justify-center"><Button className="h-12 rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] md:min-w-[160px]" onClick={() => navigate("/contratos/saque-facil-001")}>Ver meu contrato</Button><Button variant="ghost" className="h-12 rounded-xl md:min-w-[160px]" onClick={() => navigate("/painel")}>Voltar para o início</Button></div>
            </CardContent>
          </Card>
        )}

        {step !== "intro" && step !== "selfie_ownership" && step !== "selfie_identity" && step !== "success" && step !== "stark_analysis" && (
          <div className="grid grid-cols-2 gap-3 pt-2 md:flex md:justify-end">
            <Button variant="outline" onClick={goBack} className="h-11 rounded-xl border-border md:min-w-[160px]">Voltar</Button>
            {step !== "address" && step !== "bank" ? <Button disabled={!canAdvance} onClick={goNext} className="h-11 rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] md:min-w-[160px] disabled:opacity-40">{step === "simulation" ? "Começar proposta" : step === "data_intro" ? "Completar meus dados" : step === "confirmation" ? "Pegar meu dinheiro" : "Continuar"} <ArrowRight size={16} className="ml-2" /></Button> : null}
          </div>
        )}
        </div>
      </div>
    </SubPageLayout>
  );
}

function MeusDadosPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("cliente@exemplo.com");
  const [celular, setCelular] = useState("(11) 99999-8888");
  const [error, setError] = useState("");
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
            <div className="space-y-1.5"><Label className="text-sm font-medium">Seu e-mail de contato</Label><Input value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }} className="h-12 rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="text-sm font-medium">Seu número com DDD</Label><IMaskInput mask="(00) 00000-0000" value={celular} onAccept={(v) => { setCelular(String(v)); if (error) setError(""); }} className={maskedInputClass} /></div>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-white p-4 md:max-w-full">
        <Button
          disabled={!changed}
          onClick={() => {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setError("Informe um e-mail válido.");
              return;
            }
            if (celular.replace(/\D/g, "").length < 10) {
              setError("Informe um celular válido com DDD.");
              return;
            }
            if (email.toLowerCase() === "existente@seutudo.com.br") {
              setError("Este e-mail já está em uso.");
              return;
            }
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
  const [error, setError] = useState("");
  const senhaAtualRef = useRef<HTMLInputElement>(null);
  const novaSenhaRef = useRef<HTMLInputElement>(null);
  const confirmarSenhaRef = useRef<HTMLInputElement>(null);
  const canSave = current.length === 6 && next.length === 6 && confirm.length === 6 && next === confirm;

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
        <PasswordTelField label="Sua senha atual" value={current} onChange={(v) => { setCurrent(v); if (error) setError(""); }} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} inputRef={senhaAtualRef} />
        <PasswordTelField label="Escolha uma nova senha" value={next} onChange={(v) => { setNext(v); if (error) setError(""); }} show={showNext} onToggle={() => setShowNext((v) => !v)} inputRef={novaSenhaRef} />
        <PasswordTelField label="Digite a nova senha de novo" value={confirm} onChange={(v) => { setConfirm(v); if (error) setError(""); }} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} inputRef={confirmarSenhaRef} />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
      <Button
        className="mt-5 h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05] disabled:opacity-40"
        disabled={!canSave}
        onClick={() => {
          if (current !== "142536") {
            setError("Senha atual incorreta. Tente novamente.");
            return;
          }
          if (next !== confirm) {
            setError("As senhas não coincidem.");
            return;
          }
          if (next === current) {
            setError("A nova senha deve ser diferente da atual.");
            return;
          }
          if (isWeakNumericPin(next)) {
            setError("Não use sequências simples como 123456.");
            return;
          }
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
  const lista = contratos;
  return (
    <SubPageLayout title="Meus contratos">
      <p className="mb-4 text-sm text-muted-foreground">{lista.length} contratos ativos</p>

      {lista.length < 1 ? (
        <div className="flex flex-col items-center space-y-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF0E7]"><FileText size={32} className="text-[#E8590A]" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Você ainda não tem contratos.</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Quando você contratar um produto, ele aparece aqui para você acompanhar tudo.</p>
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] font-semibold text-white hover:bg-[#A33D05]" onClick={() => navigate("/painel")}>Ver ofertas disponíveis</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((contrato) => (
            <button key={contrato.id} onClick={() => navigate(`/contratos/${contrato.id}`)} className="w-full rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-[#E8590A]/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#FEF0E7] px-2.5 py-1 text-xs font-semibold text-[#A33D05]">{contrato.tipo === "seguro" ? "Seguro de Vida" : contrato.tipo === "saque-facil" ? "Saque Fácil" : "Crédito CLT"}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-700"><div className="h-1.5 w-1.5 rounded-full bg-green-500" />Ativo</span>
              </div>
              <p className="mb-2 text-sm font-bold text-foreground">{contrato.produto}</p>
              {contrato.tipo === "seguro" ? (
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-muted-foreground">Valor mensal</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorMensal.toFixed(2).replace(".", ",")}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Vigência até</p><p className="text-sm font-semibold text-foreground">{contrato.vigencia}</p></div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-muted-foreground">Parcela mensal</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorParcela.toFixed(2).replace(".", ",")}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Próximo desconto</p><p className="text-sm font-semibold text-foreground">{contrato.proximoDesconto}</p></div>
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-xs font-medium text-[#E8590A]">Ver detalhes<CaretRight size={12} /></div>
            </button>
          ))}
        </div>
      )}
    </SubPageLayout>
  );
}

function AccordionItemContrato({ cobertura, hideValue }: { cobertura: { nome: string; valor: number; descricao: string }; hideValue?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-border">
      <div className="p-4">
        <p className="text-sm font-semibold text-foreground">{cobertura.nome}</p>
        {!hideValue && <p className="mt-0.5 text-xs text-muted-foreground">Cobertura de R$ {cobertura.valor.toLocaleString("pt-BR")},00</p>}
        <button onClick={() => setOpen((o) => !o)} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#E8590A]">{open ? "Mostrar menos" : "Mostrar mais"}<CaretDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
      </div>
      {open && <div className="px-4 pb-4 pt-0"><p className="text-xs leading-relaxed text-muted-foreground">{cobertura.descricao}</p></div>}
    </div>
  );
}

function ContratoSeguroPage() {
  const contrato = contratos.find((c) => c.id === "seguro-001" && c.tipo === "seguro");
  if (!contrato) return <Navigate to="/contratos" replace />;
  return (
    <SubPageLayout title="Seguro de Vida">
      <div className="mb-5"><div className="mb-1 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-700">Ativo</span></div><h2 className="text-2xl font-bold text-foreground">Seguro de Vida</h2></div>
      <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <div><p className="text-xs text-muted-foreground">Solicitado em</p><p className="text-sm font-semibold text-foreground">{contrato.dataContratacao}</p></div>
        <div><p className="text-xs text-muted-foreground">Seguradora</p><p className="text-sm font-semibold text-foreground">{contrato.seguradora}</p></div>
        <div><p className="text-xs text-muted-foreground">Plano selecionado</p><p className="text-sm font-semibold text-foreground">{contrato.plano}</p></div>
        <div><p className="text-xs text-muted-foreground">Valor mensal</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
      </div>
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-6"><CreditCard size={16} className="text-muted-foreground" /><span className="text-sm text-muted-foreground">Cartão cadastrado</span><span className="text-sm font-semibold text-foreground">Final ***{contrato.cartaoFinal}</span></div>
      <div className="mb-6"><div className="mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-[#E8590A]" /><h3 className="text-base font-bold text-foreground">Coberturas</h3></div>{contrato.coberturas.map((c) => <AccordionItemContrato cobertura={c} key={c.nome} />)}</div>
      <div className="flex items-start gap-2 border-t border-border pt-4"><Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" /><p className="text-xs text-muted-foreground">Consulte os <a href={contrato.linkTermos} target="_blank" className="text-[#E8590A] underline underline-offset-2">Termos do Seguro</a> e o <a href={contrato.linkPrivacidade} target="_blank" className="text-[#E8590A] underline underline-offset-2">Aviso de Privacidade da Seguradora</a>.</p></div>
    </SubPageLayout>
  );
}

function ContratoCLTPage() {
  const contrato = contratos.find((c) => c.id === "clt-001" && c.tipo === "clt");
  if (!contrato) return <Navigate to="/contratos" replace />;
  const progresso = ((contrato.totalParcelas - contrato.parcelasRestantes) / contrato.totalParcelas) * 100;
  return (
    <SubPageLayout title="Crédito com desconto em folha">
      <div className="mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3"><Info size={15} className="mt-0.5 shrink-0 text-amber-600" /><p className="text-xs leading-snug text-amber-700">Este é um contrato de exemplo para fins de demonstração. Os dados reais serão exibidos após integração com o sistema.</p></div>
      <div className="mb-5"><div className="mb-1 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-700">Ativo</span></div><h2 className="text-2xl font-bold text-foreground">Crédito com desconto em folha</h2></div>
      <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <div><p className="text-xs text-muted-foreground">Número da CCB</p><p className="text-sm font-semibold text-foreground">{contrato.numeroCCB}</p></div>
        <div><p className="text-xs text-muted-foreground">Data de emissão</p><p className="text-sm font-semibold text-foreground">{contrato.dataEmissao}</p></div>
        <div><p className="text-xs text-muted-foreground">Modalidade</p><p className="text-sm font-semibold leading-snug text-foreground">{contrato.modalidade}</p></div>
        <div><p className="text-xs text-muted-foreground">Valor líquido recebido</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
      </div>
      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm border border-border">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[#A33D05]">Parcelas</h3><span className="text-xs text-[#A33D05]">{contrato.parcelasRestantes} de {contrato.totalParcelas} restantes</span></div>
        <div className="mb-3 h-2 rounded-full bg-[#A33D05]/20"><div className="h-2 rounded-full bg-[#E8590A] transition-all" style={{ width: `${progresso}%` }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-[#A33D05]/70">Valor da parcela</p><p className="text-sm font-bold text-[#A33D05]">R$ {contrato.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
          <div><p className="text-xs text-[#A33D05]/70">Próximo desconto</p><p className="text-sm font-bold text-[#A33D05]">{contrato.proximoDesconto}</p></div>
          <div><p className="text-xs text-[#A33D05]/70">Saldo devedor</p><SensitiveData value={`R$ ${contrato.saldoDevedor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} type="currency" /></div>
          <div><p className="text-xs text-[#A33D05]/70">Dia de pagamento</p><p className="text-sm font-bold text-[#A33D05]">Todo dia {contrato.diaPagamento}</p></div>
        </div>
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-bold text-foreground">Taxas e custos</h3><div className="space-y-2.5">{[{ label: "Taxa de juros", value: `${contrato.taxaJurosMes}% a.m. / ${contrato.taxaJurosAno}% a.a.` }, { label: "Custo Efetivo Total (CET)", value: `${contrato.cet}% a.a.` }, { label: "IOF", value: `R$ ${contrato.iof.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` }, { label: "Valor total das parcelas", value: `R$ ${contrato.valorTotalParcelas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` }].map((item) => <div key={item.label} className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-xs font-semibold text-foreground">{item.value}</p></div>)}</div></div>
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-bold text-foreground">Dados do emitente</h3><div className="space-y-3">{[{ label: "Nome completo", value: contrato.nomeCliente, sensitive: true }, { label: "CPF", value: contrato.cpfCliente, sensitive: true, type: "cpf" as const }, { label: "Data de nascimento", value: contrato.dataNascimento }, { label: "Data de admissão", value: contrato.dataAdmissao }, { label: "Cidade", value: contrato.cidade }].map((item) => <div key={item.label} className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{item.label}</p>{item.sensitive ? <SensitiveData value={item.value} type={item.type ?? "text"} /> : <p className="text-xs font-semibold text-foreground">{item.value}</p>}</div>)}</div></div>
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-3 text-sm font-bold text-foreground">Dados para depósito</h3><div className="space-y-3">{[{ label: "Banco", value: contrato.banco }, { label: "Agência", value: contrato.agencia }, { label: "Conta", value: contrato.conta }, { label: "Chave Pix", value: contrato.chavePix }].map((item) => <div key={item.label} className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{item.label}</p><SensitiveData value={item.value} type="text" /></div>)}</div></div>
      <div className="mb-5 rounded-2xl border border-dashed border-border bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-foreground">Quitar antecipadamente</p><p className="mt-0.5 text-xs text-muted-foreground">Pague o saldo devedor e encerre o contrato antes do prazo.</p></div><span className="rounded-full bg-[#E7E5E4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#78716C]">Em breve</span></div></div>
      <AccordionItemContrato hideValue cobertura={{ nome: "Informações do FIDC endossatário", valor: 0, descricao: `Fundo de Investimento em Direitos Creditórios responsável pela operação. Preço de aquisição: R$ ${contrato.precoAquisicao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Data de aquisição: ${contrato.dataAquisicao}. Nome do FIDC: ${contrato.fidcNome}. CNPJ: ${contrato.fidcCnpj}.` }} />
    </SubPageLayout>
  );
}

function ContratoSaqueFacilPage() {
  const contrato = contratos.find((c) => c.id === "saque-facil-001");
  if (!contrato) return <Navigate to="/contratos" replace />;
  const handleDownload = () => {
    const conteudo = `CÉDULA DE CRÉDITO BANCÁRIO — SAQUE FÁCIL\n==========================================\n\nI — PREÂMBULO\nEMITENTE\nNome: [DADO SENSÍVEL]\nCPF: [DADO SENSÍVEL]\nEndereço: [DADO SENSÍVEL]\n\nCREDORA\nNome: Stark Sociedade de Crédito Direto S.A.\nCNPJ: 39.908.427/0001-28\nEndereço: Rua Pamplona, 145 - Bela Vista - 01405-100 - São Paulo/SP\n\nII — CARACTERÍSTICAS DO CRÉDITO\nValor Principal: R$ 106,74\nValor Liberado: R$ 100,00\nData de Emissão: 08/05/2026\nTaxa de Juros Efetiva Mensal: 6,84% ao mês\nTaxa de Juros Efetiva Anual: 121,29% ao ano\nCET Anual: 190,73% ao ano\nIOF: 1,63%\nTarifa de Cadastro: R$ 5,00\n\nIII — LIBERAÇÃO DO CRÉDITO\nForma: Transferência Pix\nData Prevista: 08/05/2026\nData Máxima: 15/05/2026\n\nIV — PAGAMENTO\nForma: Pix Cobrança\nParcelas:\n1 — 08/06/2026 — R$ 25,98\n2 — 08/07/2026 — R$ 25,96\n3 — 08/08/2026 — R$ 25,96\n4 — 08/09/2026 — R$ 25,96\n5 — 08/10/2026 — R$ 25,96`;
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contrato-saque-facil.txt";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <SubPageLayout title="Contrato — Saque Fácil">
      <div className="mb-3 flex justify-end"><button onClick={handleDownload} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[#F5F4F2]" aria-label="Baixar contrato"><DownloadSimple size={18} className="text-foreground" /></button></div>
      <div className="mb-5"><div className="mb-1 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-700">Ativo</span></div><h2 className="text-2xl font-bold text-foreground">Saque Fácil no cartão</h2></div>
      <div className="mb-4 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-2 text-sm font-bold">Dados do emitente</h3><p className="text-xs text-muted-foreground">Emitente</p><p className="text-sm"><SensitiveData value={contrato.emitente.nome} /></p><p className="text-sm"><SensitiveData value={contrato.emitente.cpf} type="cpf" /></p><p className="text-sm"><SensitiveData value={contrato.emitente.endereco} /></p><p className="mt-3 text-xs text-muted-foreground">Credora</p><p className="text-sm font-semibold">{contrato.credora.nome}</p><p className="text-xs">CNPJ {contrato.credora.cnpj}</p></div>
      <div className="mb-4 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-2 text-sm font-bold">Características do crédito</h3><div className="grid grid-cols-2 gap-3 text-xs"><p>Principal: R$ {contrato.valorPrincipal.toFixed(2).replace(".", ",")}</p><p>Liberado: R$ {contrato.valorLiberado.toFixed(2).replace(".", ",")}</p><p>Taxa mensal: {contrato.taxaMensal}%</p><p>Taxa anual: {contrato.taxaAnual}%</p></div></div>
      <div className="mb-4 rounded-2xl border border-border bg-white p-4 shadow-sm"><h3 className="mb-2 text-sm font-bold">Parcelas</h3><div className="overflow-hidden rounded-xl border border-border"><div className="grid grid-cols-2 bg-[#F8F7F5] px-3 py-2 text-[11px] font-semibold text-muted-foreground"><span>Vencimento</span><span className="text-right">Valor</span></div>{contrato.parcelas.map((p)=><div key={p.numero} className="grid grid-cols-2 border-t border-border px-3 py-2 text-xs"><span>{p.vencimento}</span><span className="text-right font-semibold text-foreground">R$ {p.valor.toFixed(2).replace(".", ",")}</span></div>)}</div></div>
      <p className="text-xs text-muted-foreground">Documento com validade jurídica. Consulte os termos em seutudo.com.br.</p>
    </SubPageLayout>
  );
}

function NotificacaoCard({ notificacao }: { notificacao: Notificacao }) {
  const iconePorTipo: Record<NotificacaoTipo, ReactNode> = {
    transacional: <CheckCircle size={18} weight="fill" className="text-green-600" />,
    lembrete: <Clock size={18} weight="fill" className="text-[#E8590A]" />,
    oferta: <Tag size={18} weight="fill" className="text-[#E8590A]" />,
    sistema: <Info size={18} weight="fill" className="text-blue-500" />,
  };

  return (
    <div className={`flex gap-3 rounded-2xl border p-4 transition-colors ${!notificacao.lida ? "border-[#E8590A]/20 bg-[#FEF0E7]" : "border-border bg-white"}`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!notificacao.lida ? "bg-white" : "bg-[#F5F4F2]"}`}>{iconePorTipo[notificacao.tipo]}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!notificacao.lida ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{notificacao.titulo}</p>
          {!notificacao.lida ? <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#E8590A]" /> : null}
        </div>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{notificacao.descricao}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">{notificacao.data}</p>
      </div>
    </div>
  );
}

function NotificacoesPage() {
  const { notificacoes, marcarTodasLidas } = useNotificacoes();

  useEffect(() => {
    marcarTodasLidas();
  }, [marcarTodasLidas]);

  const grupos = [
    { key: "hoje", label: "Hoje" },
    { key: "semana", label: "Esta semana" },
    { key: "anteriores", label: "Anteriores" },
  ] as const;

  const containerVariants = { initial: {}, animate: { transition: { staggerChildren: 0.08 } } };
  const cardVariants = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  return (
    <SubPageLayout title="Notificações">
      {notificacoes.length === 0 ? (
        <div className="flex flex-col items-center space-y-4 px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F4F2]"><Bell size={32} className="text-muted-foreground" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Nada por aqui ainda.</h2>
            <p className="mx-auto mt-1 max-w-[260px] text-sm leading-relaxed text-muted-foreground">Quando tiver novidades sobre seus contratos, ofertas e pagamentos, a gente avisa aqui.</p>
          </div>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="initial" animate="animate">
          {grupos.map((grupo) => {
            const itens = notificacoes.filter((n) => n.grupo === grupo.key);
            if (itens.length === 0) return null;
            return (
              <div key={grupo.key} className="mb-5">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{grupo.label}</p>
                <div className="space-y-2">
                  {itens.map((notificacao) => (
                    <motion.div key={notificacao.id} variants={cardVariants}>
                      <NotificacaoCard notificacao={notificacao} />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </SubPageLayout>
  );
}

function RecomendacoesCarousel({ variant = "default" }: { variant?: "light" | "default" }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const { cards, dispensar } = useRecomendacoes();
  const [exiting, setExiting] = useState<string | null>(null);

  const iconMap: Record<string, ReactNode> = {
    CalendarCheck: <CalendarCheck size={16} />,
    MapPin: <MapPin size={16} />,
    Bank: <Bank size={16} />,
    CreditCard: <CreditCard size={16} />,
    Coins: <Coins size={16} />,
    Heartbeat: <Heartbeat size={16} />,
    Lightning: <Lightning size={16} />,
    Wallet: <Wallet size={16} />,
    Fire: <Fire size={16} />,
  };

  if (cards.length === 0) return null;

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth - el.clientWidth > 2;
    setCanScroll(hasOverflow);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [cards]);

  const handleDismiss = (id: string) => {
    setExiting(id);
    setTimeout(() => {
      dispensar(id);
      setExiting(null);
    }, 200);
  };

  return (
    <div className="relative">
      {variant === "light" ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">Para você agora</p> : null}
      <div
        ref={scrollRef}
        className={`flex gap-2 ${canScroll ? "overflow-x-auto" : "overflow-x-hidden"} ${variant === "light" ? "px-0" : "px-1"} md:[&::-webkit-scrollbar]:hidden`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              animate={exiting === card.id ? { x: -20, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`${variant === "light" ? "border-0 bg-white/95" : "border-border bg-white"} min-h-[120px] w-[200px] min-w-[200px] max-w-[200px] rounded-xl shadow-sm ${variant === "light" ? "" : "border"}`}
            >
              <div className="relative flex h-full flex-col justify-between p-3">
                {card.dispensavel && (
                  <button
                    type="button"
                    onClick={() => handleDismiss(card.id)}
                    className="absolute right-2 top-2 flex items-center justify-center rounded-md transition-colors hover:bg-[#F3F4F6]"
                    style={{ width: 24, height: 24, padding: 4 }}
                    aria-label={`Dispensar ${card.texto}`}
                  >
                    <X size={14} color="#9CA3AF" />
                  </button>
                )}
                <div className="mb-2">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]">{iconMap[card.icone]}</div>
                  <p className="text-sm font-semibold text-foreground">{card.texto}</p>
                </div>
                {card.cta && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.destino) window.location.hash = card.destino;
                    }}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#E8590A]"
                  >
                    {card.cta} <CaretRight size={12} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className={`pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" })}
          disabled={!canLeft}
          className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8590A] shadow disabled:opacity-40"
          aria-label="Ver recomendações anteriores"
        >
          <CaretLeft size={16} />
        </button>
      </div>
      <div className={`pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 md:flex ${canScroll ? "" : "opacity-0"}`}>
        <button
          type="button"
          onClick={() => scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" })}
          disabled={!canRight}
          className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8590A] shadow disabled:opacity-50"
          aria-label="Ver próximas recomendações"
        >
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}

function AssistenciasPage() {
  const navigate = useNavigate();
  const { interesses, registrarInteresse } = useInteresse();
  const assistencias = interesses.includes("assistencias");
  const categoriasRef = useRef<HTMLDivElement>(null);
  const [draggingCategorias, setDraggingCategorias] = useState(false);
  const [canCategoriasLeft, setCanCategoriasLeft] = useState(false);
  const [canCategoriasRight, setCanCategoriasRight] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const categorias = [
    { nome: "Saúde", icon: <Stethoscope size={20} className="text-[#E8590A]" />, hero: <Stethoscope size={48} />, beneficio: "Consultas a partir de R$ 39,90", tag: "Clínico geral e 5 especialidades" },
    { nome: "Odonto", icon: <Tooth size={20} className="text-[#E8590A]" />, hero: <Tooth size={48} />, beneficio: "Até 85% de desconto", tag: "+150 procedimentos" },
    { nome: "Pet", icon: <PawPrint size={20} className="text-[#E8590A]" />, hero: <PawPrint size={48} />, beneficio: "Consultas a R$ 39,90", tag: "Cães e gatos em todo o Brasil" },
    { nome: "Psicologia", icon: <Brain size={20} className="text-[#E8590A]" />, hero: <Brain size={48} />, beneficio: "1ª consulta gratuita", tag: "Demais por R$ 100,00" },
    { nome: "Previdência", icon: <Umbrella size={20} className="text-[#E8590A]" />, hero: <Umbrella size={48} />, beneficio: "Suporte INSS completo", tag: "Análise e orientação de benefícios" },
    { nome: "Bem-estar", icon: <Heartbeat size={20} className="text-[#E8590A]" />, hero: <Heartbeat size={48} />, beneficio: "Monitoramento de saúde", tag: "Sinais vitais pela câmera do celular" },
    { nome: "Educação", icon: <BookOpen size={20} className="text-[#E8590A]" />, hero: <BookOpen size={48} />, beneficio: "+600 cursos digitais", tag: "Finanças, segurança digital e mais" },
    { nome: "Tecnologia", icon: <DeviceMobile size={20} className="text-[#E8590A]" />, hero: <DeviceMobile size={48} />, beneficio: "Suporte 24h", tag: "Celular, apps e segurança digital" },
    { nome: "Residência", icon: <House size={20} className="text-[#E8590A]" />, hero: <House size={48} />, beneficio: "Emergências 24h", tag: "Elétrica, hidráulica, chaveiro" },
    { nome: "Prevenção", icon: <FirstAid size={20} className="text-[#E8590A]" />, hero: <FirstAid size={48} />, beneficio: "Histórico de saúde centralizado", tag: "Lembretes de exames preventivos" },
    { nome: "Notícias", icon: <Newspaper size={20} className="text-[#E8590A]" />, hero: <Newspaper size={48} />, beneficio: "Conteúdo exclusivo", tag: "Portal VIVA — vídeos e podcasts" },
    { nome: "Recompensa", icon: <Gift size={20} className="text-[#E8590A]" />, hero: <Gift size={48} />, beneficio: "Pontos em +250 lojas", tag: "Troque por descontos e produtos" },
    { nome: "Sorteio", icon: <Trophy size={20} className="text-[#E8590A]" />, hero: <Trophy size={48} />, beneficio: "Prêmios diários", tag: "R$ 500 diário · R$ 5mil semanal" },
  ];

  const faqItems = [
    { q: "Quem pode contratar?", a: "Todos os clientes cadastrados no seutudo. com CPF validado." },
    { q: "Preciso contratar todas as categorias?", a: "Não. Você escolhe apenas as assistências que fazem sentido para você e sua família." },
    { q: "Como funciona o pagamento?", a: "Uma mensalidade acessível debitada diretamente pelo app. Sem fidelidade, sem surpresa." },
    { q: "Posso incluir minha família?", a: "Sim. Algumas categorias permitem até 8 dependentes sem necessidade de grau de parentesco." },
  ];

  const updateCategoriasControls = () => {
    const el = categoriasRef.current;
    if (!el) return;
    setCanCategoriasLeft(el.scrollLeft > 2);
    setCanCategoriasRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    updateCategoriasControls();
    const el = categoriasRef.current;
    if (!el) return;
    const onScroll = () => updateCategoriasControls();
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handleInteresse = () => {
    registrarInteresse("assistencias");
    toast("Em breve!", {
      duration: 5000,
      icon: <Bell size={16} className="text-[#E8590A]" />,
      description: "Você será um dos primeiros a saber quando lançarmos. Fique de olho nas suas notificações.",
    });
  };

  return (
    <SubPageLayout title="Assistências">
      <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden pb-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="relative h-[220px] p-0">
            <PlaceholderImagem icon={<Image size={34} />} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <Badge className="mb-2 border-0 bg-white/15 text-[11px] text-white">ASSISTÊNCIAS SEUTUDO.</Badge>
              <h2 className="max-w-[290px] text-[26px] font-bold leading-tight text-white">Cuide de quem você ama sem pesar no bolso</h2>
              <p className="mt-2 max-w-[290px] text-sm text-white/80">Descontos reais em saúde, odonto, pet e muito mais</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[#FEF0E7] shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-[#E8590A]">R$ 4.600</p>
            <p className="mt-2 text-sm font-semibold text-foreground">de economia média por ano em saúde e bem-estar</p>
            <p className="mt-1 text-xs text-muted-foreground">Comparado à contratação individual dos serviços no mercado</p>
          </CardContent>
        </Card>

        <div className="relative">
          <h3 className="text-sm font-semibold text-foreground">O que está incluído</h3>
          <p className="mt-1 text-xs text-muted-foreground">13 categorias de assistência para você e sua família</p>
          <div
            ref={categoriasRef}
            className={`mt-3 flex w-full gap-3 overflow-x-auto pb-1 touch-pan-x select-none [&::-webkit-scrollbar]:hidden ${draggingCategorias ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollSnapType: "x mandatory" }}
            onPointerDown={(e) => {
              const el = categoriasRef.current;
              if (!el) return;
              setDraggingCategorias(true);
              dragStartX.current = e.clientX;
              dragStartScroll.current = el.scrollLeft;
              el.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const el = categoriasRef.current;
              if (!el || !draggingCategorias) return;
              const deltaX = e.clientX - dragStartX.current;
              el.scrollLeft = dragStartScroll.current - deltaX;
            }}
            onPointerUp={(e) => {
              const el = categoriasRef.current;
              if (!el) return;
              setDraggingCategorias(false);
              if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            }}
            onPointerCancel={(e) => {
              const el = categoriasRef.current;
              if (!el) return;
              setDraggingCategorias(false);
              if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
            }}
          >
            {categorias.map((item) => (
              <Card key={item.nome} className="h-[260px] w-[200px] min-w-[200px] shrink-0 overflow-hidden rounded-2xl border-border bg-white shadow-sm" style={{ scrollSnapAlign: "start" }}>
                <div className="h-[120px] p-3">
                  <PlaceholderImagem icon={item.hero} />
                </div>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center gap-2">
                    {item.icon}
                    <p className="text-sm font-semibold text-foreground">{item.nome}</p>
                  </div>
                  <p className="line-clamp-2 text-xs leading-5 text-[#374151]">{item.beneficio}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#FEF0E7] px-2 py-1 text-[11px] text-[#E8590A]">{item.tag}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pointer-events-none absolute left-0 top-[58%] hidden -translate-y-1/2 md:flex">
            <button
              type="button"
              onClick={() => categoriasRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
              disabled={!canCategoriasLeft}
              className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#E8590A] shadow disabled:opacity-40"
              aria-label="Ver categorias anteriores"
            >
              <CaretLeft size={16} />
            </button>
          </div>
          <div className="pointer-events-none absolute right-0 top-[58%] hidden -translate-y-1/2 md:flex">
            <button
              type="button"
              onClick={() => categoriasRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
              disabled={!canCategoriasRight}
              className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#E8590A] shadow disabled:opacity-40"
              aria-label="Ver próximas categorias"
            >
              <CaretRight size={16} />
            </button>
          </div>
        </div>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Como vai funcionar</h3>
            <div className="space-y-3">
              {[
                { icon: <ListChecks size={32} className="text-[#E8590A]" />, titulo: "Escolha as assistências que fazem sentido para você", sub: "Monte seu pacote com as categorias que mais combinam com a sua vida." },
                { icon: <CreditCard size={32} className="text-[#E8590A]" />, titulo: "Pague uma mensalidade acessível sem sair do app", sub: "Tudo dentro do seutudo., simples e sem burocracia." },
                { icon: <HandHeart size={32} className="text-[#E8590A]" />, titulo: "Use quando precisar com descontos de até 85%", sub: "Rede credenciada em todo o Brasil, sem limite de utilizações." },
              ].map((item, idx, arr) => (
                <div key={item.titulo} className={`flex gap-3 ${idx !== arr.length - 1 ? "border-b border-[#F3F4F6] pb-3" : ""}`}>
                  <div className="shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Dúvidas frequentes</h3>
          <FaqAcordeon items={faqItems} />
        </div>

        <div className="rounded-2xl bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <FakeDoorCTA registrado={assistencias} onRegister={handleInteresse} label="Conhecer planos" />
          {assistencias ? (
            <button onClick={() => navigate("/painel")} className="mt-2 w-full text-center text-sm font-medium text-[#E8590A]">
              Voltar para o início
            </button>
          ) : null}
        </div>
      </div>
    </SubPageLayout>
  );
}

function EnergiaPage() {
  const navigate = useNavigate();
  const { interesses, registrarInteresse } = useInteresse();
  const energia = interesses.includes("energia");

  const handleInteresse = () => {
    registrarInteresse("energia");
    toast("Em breve!", {
      duration: 5000,
      icon: <Bell size={16} className="text-[#E8590A]" />,
      description: "Você será um dos primeiros a saber quando lançarmos. Fique de olho nas suas notificações.",
    });
  };

  const faqItems = [
    { q: "Isso é gratuito?", a: "Sim. Você não paga nada para fazer a análise. A economia começa a aparecer diretamente na sua conta de luz." },
    { q: "Precisa trocar algo em casa?", a: "Não. Nenhuma obra, nenhum equipamento novo. Tudo acontece na negociação da sua energia, sem impacto no seu dia a dia." },
    { q: "Funciona para apartamento?", a: "Sim, funciona para residências, apartamentos e comércios de pequeno porte em todo o Brasil." },
    { q: "Quanto tempo leva para começar a economizar?", a: "Após a análise, o processo costuma levar de 30 a 60 dias para a economia aparecer na sua fatura." },
  ];

  return (
    <SubPageLayout title="Energia">
      <div className="min-w-0 max-w-full space-y-4 pb-6">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
          <CardContent className="relative h-[220px] p-0">
            <PlaceholderImagem icon={<Image size={34} />} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <Badge className="mb-2 border-0 bg-white/15 text-[11px] text-white">ECONOMIA DE ENERGIA</Badge>
              <h2 className="max-w-[290px] text-[26px] font-bold leading-tight text-white">Sua conta de luz pode ser menor. Todo mês.</h2>
              <p className="mt-2 max-w-[290px] text-sm text-white/80">Sem obras. Sem trocar equipamentos. Sem custo.</p>
            </div>
          </CardContent>
        </Card>

        <div
          className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {["Sem obras", "Sem fidelidade", "100% gratuito"].map((item) => (
            <div key={item} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-[13px] text-foreground">
              <CheckCircle size={16} className="text-[#E8590A]" weight="fill" />
              {item}
            </div>
          ))}
        </div>

        <Card className="border-0 bg-[#FEF0E7] shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-bold text-[#E8590A]">R$ 80</p>
            <p className="mt-1 text-sm font-semibold text-foreground">de economia média por mês na conta de luz</p>
            <p className="mt-1 text-xs text-muted-foreground">Com base nos clientes já atendidos pelo nosso parceiro</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Como funciona</h3>
            <div className="space-y-3">
              {[
                { icon: <FileText size={32} className="text-[#E8590A]" />, titulo: "Você envia sua conta de luz", sub: "Basta fotografar ou enviar o PDF da sua fatura." },
                { icon: <MagnifyingGlass size={32} className="text-[#E8590A]" />, titulo: "Analisamos as melhores opções para o seu perfil", sub: "Nossa equipe identifica as alternativas disponíveis na sua região." },
                { icon: <CurrencyCircleDollar size={32} className="text-[#E8590A]" />, titulo: "Você começa a economizar sem mudar nada em casa", sub: "Sem obras, sem contratos complicados, sem custo de adesão." },
              ].map((item, idx, arr) => (
                <div key={item.titulo} className={`flex gap-3 ${idx !== arr.length - 1 ? "border-b border-[#F3F4F6] pb-3" : ""}`}>
                  <div className="shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Dúvidas frequentes</h3>
          <FaqAcordeon items={faqItems} />
        </div>

        <div className="rounded-2xl bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <FakeDoorCTA registrado={energia} onRegister={handleInteresse} label="Simular economia" />
          {energia ? (
            <button onClick={() => navigate("/painel")} className="mt-2 w-full text-center text-sm font-medium text-[#E8590A]">
              Voltar para o início
            </button>
          ) : null}
        </div>
      </div>
    </SubPageLayout>
  );
}

function SeubolsoPage() {
  const navigate = useNavigate();
  const { saldo, streak, extrato } = useSeubolso();
  const { dataVisible } = usePrivacy();
  const animated = useMotionValue(0);
  const [saldoAnimado, setSaldoAnimado] = useState(0);

  const progressoStreak = Math.min(100, Math.round((streak / 30) * 100));
  const historico = [...extrato].sort((a, b) => +new Date(b.data) - +new Date(a.data));
  const hoje = new Date().toISOString().slice(0, 10);
  const temDescricao = (txt: string) => historico.some((t) => t.descricao.toLowerCase().includes(txt.toLowerCase()));
  const feitoHoje = (txt: string) => historico.some((t) => t.data === hoje && t.descricao.toLowerCase().includes(txt.toLowerCase()));

  useEffect(() => {
    if (!dataVisible) return;
    const controls = animate(animated, saldo, { duration: 1.5, ease: "easeOut" });
    const unsub = animated.on("change", (v) => setSaldoAnimado(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [saldo, dataVisible, animated]);

  const ganhosConcluidos = [
    { key: "cadastro", nome: "Cadastro completo", valor: "+500 moedas", icon: <UserCircle size={18} />, unica: true, feito: temDescricao("Cadastro completo") },
    { key: "produto", nome: "Contratar um produto", valor: "+300 moedas", icon: <CreditCard size={18} />, unica: true, feito: temDescricao("contratado") || temDescricao("Contratar") },
    { key: "parcela", nome: "Parcela paga em dia", valor: "+50 moedas", icon: <CheckCircle size={18} />, diaria: true, feitoHoje: feitoHoje("Parcela paga em dia") },
    { key: "login", nome: "Login diário", valor: "+10 moedas", icon: <CalendarCheck size={18} />, diaria: true, feitoHoje: feitoHoje("Login diário") },
  ].filter((x) => (x.unica && x.feito) || (x.diaria && x.feitoHoje));

  const pendentes = [
    { key: "login", nome: "Login diário", valor: "+10 moedas", icon: <CalendarCheck size={18} /> },
    { key: "streak7", nome: "Streak de 7 dias", valor: "+100 bônus", icon: <Fire size={18} />, sub: `${streak}/30 dias` },
    { key: "streak30", nome: "Streak de 30 dias", valor: "+500 bônus", icon: <Fire size={18} />, sub: `${streak}/30 dias` },
  ];

  return (
    <SubPageLayout title="seubônus">
      <div className="space-y-4">
        <Card className="overflow-hidden border-0 bg-[#E8590A] text-white shadow-sm">
          <CardContent className="relative p-4">
            <Coins size={48} className="absolute right-4 top-3 text-white/20" />
            <button onClick={() => navigate("/seubolso/como-funciona")} className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#E8590A]">Entenda como funciona <CaretRight size={12} /></button>
            <p className="text-sm text-white/80">Seu saldo</p>
            <p className="mt-1 text-3xl font-bold">{dataVisible ? saldoAnimado.toLocaleString("pt-BR") : "••••"}</p>
            <p className="text-sm text-white/80">moedas</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><Fire size={20} /></div>
              <div>
                <p className="text-sm font-semibold text-foreground">{streak} dias seguidos</p>
                <p className="text-xs text-muted-foreground">Continue abrindo o app todo dia para ganhar mais moedas</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>{streak}/30 dias</span><span>Bônus de 500</span></div>
              <Progress value={progressoStreak} className="h-2 bg-secondary [&>div]:bg-[#E8590A]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-[#FEF0E7] shadow-sm">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#E8590A]">
                <Gift size={18} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold leading-5 text-[#A33D05]">Resgate suas moedas</p>
                <p className="pb-1 text-xs leading-4 text-[#A33D05]/80">Logo você poderá usar seus pontos para desconto em taxas, assistências e muito mais.</p>
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium leading-[15px] text-[#A33D05]">Em breve</div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-white shadow-sm rounded-[14px]">
          <CardContent className="space-y-3 p-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Meus ganhos</h3>
              <div className="space-y-2">
            {ganhosConcluidos.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]">{item.icon}</div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-foreground leading-tight">{item.nome}</p>
                    <p className="text-xs font-semibold text-[#E8590A] leading-tight">{item.valor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">{item.unica ? <Badge className="border-0 bg-[#FEF0E7] text-[#E8590A]">Feito</Badge> : <Badge className="border-0 bg-[#DCFCE7] text-[#16A34A]">Feito hoje</Badge>}<CheckCircle size={18} weight="fill" className={item.unica ? "text-[#E8590A]" : "text-[#16A34A]"} /></div>
              </div>
            ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Pendentes</h3>
              <div className="space-y-2">
            {pendentes.map((item) => (
              <div key={item.key} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]">{item.icon}</div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold leading-tight text-foreground">{item.nome}</p>
                    {item.sub ? <p className="text-[11px] leading-tight text-[#ABA19A]">{item.sub}</p> : null}
                  </div>
                  <p className="text-xs font-semibold leading-tight text-[#E8590A]">{item.valor}</p>
                </div>
              </div>
            ))}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]"><Users size={18} /></div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <p className="text-xs font-semibold leading-tight text-foreground">Indicar um amigo</p>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-[11px] text-[#78716C]">Se cadastrou</p><p className="text-xs font-semibold text-[#E8590A]">+200 moedas</p></div>
                      <div className="text-right"><p className="text-[11px] text-[#78716C]">Contratou um produto</p><p className="text-xs font-semibold text-[#E8590A]">+300 bônus</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm"><button onClick={() => navigate("/seubolso/historico")} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground">Resgates <CaretRight size={16} className="text-muted-foreground" /></button></Card>
      </div>
    </SubPageLayout>
  );
}

function SeubolsoComoFuncionaPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);
  const itens = [
    { icon: <UserCircle size={18} />, nome: "Cadastro completo", valor: "+500 moedas" },
    { icon: <CalendarCheck size={18} />, nome: "Login diário", valor: "+10 moedas" },
    { icon: <Fire size={18} />, nome: "Streak de 7 dias", valor: "+100 bônus" },
    { icon: <Fire size={18} />, nome: "Streak de 30 dias", valor: "+500 bônus" },
    { icon: <CreditCard size={18} />, nome: "Contratar um produto", valor: "+300 moedas" },
    { icon: <CheckCircle size={18} />, nome: "Parcela paga em dia", valor: "+50 moedas" },
    { icon: <Users size={18} />, nome: "Indicar um amigo", valor: "+200 / +300 bônus" },
  ];
  const faqs = [
    ["Quem pode usar?", "Todos os clientes cadastrados no seutudo."],
    ["As moedas expiram?", "Suas moedas são válidas por 12 meses a partir da data em que foram ganhas."],
    ["Como faço para resgatar?", "Em breve você poderá trocar suas moedas por descontos em taxas e outros benefícios. Fique de olho!"],
    ["Perco minhas moedas se cancelar?", "Moedas acumuladas ficam disponíveis por 12 meses independente de cancelamento."],
  ] as const;

  return (
    <SubPageLayout title="seubônus">
      <div className="mx-auto w-full max-w-[608px] space-y-4 pb-20">
        <Card className="overflow-hidden border-0 shadow-sm rounded-2xl">
          <CardContent className="relative min-h-[200px] p-0 text-white">
            <img src="/images/seubolso-hero.jpg-338ee0.png" alt="Pessoa feliz usando celular" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#A33D05_0%,rgba(232,89,10,0.7)_50%,rgba(232,89,10,0)_100%)]" />
            <div className="relative flex min-h-[200px] flex-col justify-end px-5 pb-5 pt-[72px]">
              <p className="pb-1 text-xs font-semibold uppercase tracking-[0.025em] text-white/75">seubônus</p>
              <h2 className="max-w-[280px] pb-2 text-2xl font-bold leading-[30px]">Ganhe moedas com suas ações no app</h2>
              <p className="text-sm leading-5 text-white/85">Quanto mais usa, mais ganha</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground">
            <Coins size={12} className="text-[#E8590A]" />Ganhe usando o app
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground">
            <Gift size={12} className="text-[#E8590A]" />Troque por vantagens
          </div>
        </div>

        <Card className="border-border bg-white shadow-sm rounded-[14px]">
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold leading-5 text-foreground">Como ganhar moedas</h3>
            <div className="flex flex-wrap gap-3">
              {itens.slice(0, 6).map((item) => (
                <div key={item.nome} className="flex min-w-[240px] flex-1 items-start gap-2 rounded-lg border border-border bg-white p-3 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7] text-[#E8590A]">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-4 text-foreground">{item.nome}</p>
                    <p className="text-xs font-semibold leading-4 text-[#E8590A]">{item.valor}</p>
                  </div>
                </div>
              ))}

              <div className="relative flex w-full items-start gap-2 rounded-lg border border-border bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FEF0E7] text-[#E8590A]"><Users size={20} /></div>
                <div className="min-w-0 flex-1 pr-[132px]">
                  <p className="text-xs font-medium leading-4 text-foreground">Indicar um amigo</p>
                  <div className="mt-1 flex flex-wrap gap-4">
                    <p className="text-[11px] leading-4 text-[#78716C]">Se cadastrou <span className="font-semibold text-[#E8590A]">+200 moedas</span></p>
                    <p className="text-[11px] leading-4 text-[#78716C]">Contratou um produto <span className="font-semibold text-[#E8590A]">+300 bônus</span></p>
                  </div>
                </div>
                <Button className="absolute right-3 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-[#E8590A] px-3 text-xs font-semibold text-white hover:bg-[#A33D05]">
                  Indique e ganhe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-6 text-foreground">Saiba mais sobre o seubônus</h3>
          {faqs.map(([q, a], i) => (
            <Card key={q} className="border-border bg-white shadow-sm rounded-[14px]">
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium leading-5 text-foreground">
                {q}
                <CaretDown size={16} className={`text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {open === i ? (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 pb-4 text-xs leading-[19.5px] text-[#78716C]">
                    {a}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white px-4 py-3 md:left-64">
        <div className="mx-auto w-full max-w-[608px]">
          <Button className="h-11 w-full rounded-xl bg-[#E8590A] text-white hover:bg-[#A33D05]" onClick={() => navigate("/seubolso")}>
            Ver minhas moedas <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </SubPageLayout>
  );
}

function SeubolsoHistoricoPage() {
  const { extrato } = useSeubolso();
  const historico = [...extrato].sort((a, b) => +new Date(b.data) - +new Date(a.data));
  const formatarData = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <SubPageLayout title="seubônus">
      <div className="space-y-4">
        <Card className="border-border bg-white shadow-sm"><CardContent className="p-4"><h3 className="mb-3 text-sm font-semibold text-foreground">Histórico de uso do seubônus</h3><div className="space-y-2.5">{historico.map((tx)=><div key={tx.id} className="flex items-start justify-between gap-3 border-b border-border pb-2 last:border-b-0"><div className="flex items-start gap-2">{tx.tipo==="ganho"?<ArrowCircleUp size={16} className="mt-0.5 text-green-600" />:<ArrowCircleDown size={16} className="mt-0.5 text-red-600" />}<div><p className="text-xs font-medium text-foreground">{tx.descricao}</p><p className="text-[11px] text-muted-foreground">{formatarData(tx.data)}</p></div></div><p className={`text-xs font-semibold ${tx.tipo==="ganho"?"text-green-600":"text-red-600"}`}>{tx.valor>0?`+${tx.valor}`:tx.valor} moedas</p></div>)}</div></CardContent></Card>
        <Card className="border-0 bg-[#FEF0E7] shadow-sm"><CardContent className="flex items-start gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#E8590A]"><Gift size={18} /></div><div><p className="text-sm font-semibold text-[#A33D05]">Em breve</p><p className="mt-0.5 text-xs text-[#A33D05]/80">Novidades chegando. Você será notificado quando o resgate estiver disponível.</p></div></CardContent></Card>
      </div>
    </SubPageLayout>
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
  const [loginError, setLoginError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginLockUntil, setLoginLockUntil] = useState<number | null>(null);
  const [showLoginSenha, setShowLoginSenha] = useState(false);
  const [otpChannel, setOtpChannel] = useState<OtpChannel | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2 | 3>(1);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [recoveryCpf, setRecoveryCpf] = useState("");
  const [recoveryCpfError, setRecoveryCpfError] = useState("");
  const [recoveryChannel, setRecoveryChannel] = useState<RecoveryChannel | null>(null);
  const [recoveryOtpCode, setRecoveryOtpCode] = useState("");
  const [recoveryOtpError, setRecoveryOtpError] = useState("");
  const [recoveryOtpAttempts, setRecoveryOtpAttempts] = useState(0);
  const [recoveryOtpLockUntil, setRecoveryOtpLockUntil] = useState<number | null>(null);
  const [recoveryCountdown, setRecoveryCountdown] = useState(60);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { notificacoes, naoLidas, marcarTodasLidas } = useNotificacoes();
  const { saldo } = useSeubolso();
  const { dataVisible } = usePrivacy();

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
    if (step === 2) return isValidCpf(cpf);
    if (step === 3) return interests.length > 0;
    if (step === 4) return pin.length === 6 && !isWeakNumericPin(pin);
    return true;
  }, [step, name, email, phone, cpf, interests, pin]);

  const loginLockedSeconds = loginLockUntil ? Math.max(0, Math.ceil((loginLockUntil - Date.now()) / 1000)) : 0;
  const recoveryLockedSeconds = recoveryOtpLockUntil ? Math.max(0, Math.ceil((recoveryOtpLockUntil - Date.now()) / 1000)) : 0;
  const canContinueLoginStep1 = loginCpf.replace(/\D/g, "").length === 11 && loginSenha.length >= 6 && loginLockedSeconds === 0;
  const canSendOtp = Boolean(otpChannel);
  const canConfirmOtp = otpCode.length === 6;
  const locationState = (location.state as RecoveryRouteState | null) ?? null;

  const passwordStrength = useMemo(() => {
    const hasLength8 = newPassword.length >= 8;
    const hasLetters = /[A-Za-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    if (hasLength8 && hasLetters && hasNumbers) return { label: "Forte", value: 100, tone: "bg-green-500" };
    if (newPassword.length >= 6) return { label: "Média", value: 66, tone: "bg-yellow-500" };
    return { label: "Fraca", value: 33, tone: "bg-red-500" };
  }, [newPassword]);

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
    const protectedPaths = ["/painel", "/minha-conta", "/contratos", "/duvidas", "/notificacoes", "/contratos/seguro-001", "/contratos/clt-001", "/saque-facil", "/seubolso", "/seubolso/como-funciona", "/seubolso/historico", "/contratos/saque-facil-001", "/assistencias", "/energia"];
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

  useEffect(() => {
    if (!loginLockUntil && !recoveryOtpLockUntil) return;
    const timer = window.setInterval(() => {
      if (loginLockUntil && Date.now() >= loginLockUntil) setLoginLockUntil(null);
      if (recoveryOtpLockUntil && Date.now() >= recoveryOtpLockUntil) setRecoveryOtpLockUntil(null);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loginLockUntil, recoveryOtpLockUntil]);

  useEffect(() => {
    if (location.pathname !== "/acesso") return;
    if (!locationState?.passwordUpdated) return;
    toast("Senha atualizada. Faça login para continuar.");
    navigate("/acesso", { replace: true, state: null });
  }, [location.pathname, locationState?.passwordUpdated, navigate]);

  useEffect(() => {
    if (location.pathname !== "/recuperar-senha/otp") return;
    setRecoveryCountdown(60);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/recuperar-senha/otp") return;
    if (recoveryCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setRecoveryCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [location.pathname, recoveryCountdown]);

  useEffect(() => {
    const cpfFromState = locationState?.cpf;
    const channelFromState = locationState?.channel;
    const otpVerified = Boolean(locationState?.otpVerified);
    if (location.pathname === "/recuperar-senha/canal" && !cpfFromState) {
      navigate("/recuperar-senha", { replace: true });
      return;
    }
    if (location.pathname === "/recuperar-senha/otp" && (!cpfFromState || !channelFromState)) {
      navigate("/recuperar-senha", { replace: true });
      return;
    }
    if (location.pathname === "/recuperar-senha/nova-senha" && (!cpfFromState || !channelFromState || !otpVerified)) {
      navigate("/recuperar-senha", { replace: true });
    }

    if (location.pathname.startsWith("/recuperar-senha") && getStoredUser()) {
      navigate("/painel", { replace: true });
    }
  }, [location.pathname, locationState?.cpf, locationState?.channel, locationState?.otpVerified, navigate]);

  useEffect(() => {
    if (location.pathname !== "/recuperar-senha/nova-senha") return;
    const handlePopState = () => {
      navigate("/acesso", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location.pathname, navigate]);

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
                <IMaskInput mask="000.000.000-00" value={loginCpf} onAccept={(value) => { setLoginCpf(String(value)); if (loginError) setLoginError(""); }} placeholder="000.000.000-00" className={maskedInputClass} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Senha</Label>
                <div className="relative">
                  <Input type={showLoginSenha ? "text" : "password"} value={loginSenha} onChange={(e) => { setLoginSenha(e.target.value); if (loginError) setLoginError(""); }} className="h-12 rounded-xl pr-10" placeholder="Digite sua senha" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowLoginSenha((prev) => !prev)}>
                    {showLoginSenha ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {loginError ? <p className="text-xs text-red-600">{loginError}</p> : null}
              {loginLockedSeconds > 0 ? <p className="text-xs text-[#A33D05]">Conta temporariamente bloqueada. Tente novamente em {loginLockedSeconds}s.</p> : null}

              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-medium text-primary"
                  onClick={() => navigate("/recuperar-senha")}
                >
                  Esqueci minha senha
                </button>
              </div>

              <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
                <Button
                  className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
                  disabled={!canContinueLoginStep1}
                  onClick={() => {
                    const cpfDigits = loginCpf.replace(/\D/g, "");
                    if (!isValidCpf(loginCpf)) {
                      setLoginError("CPF inválido. Verifique o número.");
                      return;
                    }
                    if (cpfDigits === "00000000000") {
                      setLoginError("CPF não encontrado. Verifique ou crie sua conta.");
                      return;
                    }
                    if (loginSenha !== "142536") {
                      const nextAttempts = loginAttempts + 1;
                      setLoginAttempts(nextAttempts);
                      setLoginSenha("");
                      if (nextAttempts >= 5) {
                        setLoginLockUntil(Date.now() + 60_000);
                        setLoginAttempts(0);
                        setLoginError("Conta temporariamente bloqueada. Tente novamente em 60 segundos.");
                        return;
                      }
                      setLoginError("Senha incorreta. Tente novamente.");
                      return;
                    }
                    setLoginError("");
                    setLoginAttempts(0);
                    setOtpChannel("whatsapp");
                    setLoginStep(2);
                  }}
                >
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
                  <Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">CPF</Label><IMaskInput mask="000.000.000-00" value={cpf} onAccept={(value) => setCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} />{cpf.replace(/\D/g,"").length===11 && !isValidCpf(cpf) ? <p className="text-xs text-red-600">CPF inválido. Verifique o número e tente novamente.</p> : <p className="text-xs text-muted-foreground">Nenhum dado é compartilhado sem sua autorização.</p>}</div><SecurityStrip /></CardContent></Card>
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader step={3} total={totalSteps} title="O que você está precisando?" subtitle="Pode escolher mais de um." />
                  <div className="space-y-2">
                    {(Object.keys(serviceCopy) as ServiceType[]).filter((s) => s !== "clt" && s !== "fgts").map((service) => {
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
                      <div className="space-y-1.5"><Label className="text-sm font-medium">Senha numérica (6 dígitos)</Label><Input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="h-12 rounded-xl text-center text-lg tracking-[0.5em]" />{pin.length===6 && isWeakNumericPin(pin) ? <p className="text-xs text-red-600">Evite sequências como 123456 ou números repetidos.</p> : null}</div>
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

  const RecoveryCpfScreen = (
    <AuthHeroLayout
      rightContent={
        <div className="w-full space-y-5 md:w-[380px]">
          <RecoveryStepHeader
            step={1}
            title="Esqueci minha senha"
            subtitle="Informe seu CPF para continuar"
            backPath="/acesso"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">CPF</Label>
            <IMaskInput
              mask="000.000.000-00"
              value={recoveryCpf}
              onAccept={(value) => {
                setRecoveryCpf(String(value));
                if (recoveryCpfError) setRecoveryCpfError("");
              }}
              placeholder="000.000.000-00"
              className={maskedInputClass}
            />
            {recoveryCpfError ? <p className="text-xs text-red-600">{recoveryCpfError}</p> : null}
          </div>

          <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={recoveryCpf.trim().length === 0}
              onClick={() => {
                if (!isValidCpf(recoveryCpf)) {
                  setRecoveryCpfError("CPF inválido. Verifique e tente novamente.");
                  return;
                }
                if (recoveryCpf === "000.000.000-00") {
                  setRecoveryCpfError("CPF não encontrado. Verifique ou faça seu cadastro.");
                  return;
                }
                setRecoveryCpfError("");
                setRecoveryChannel(null);
                navigate("/recuperar-senha/canal", { state: { cpf: recoveryCpf } satisfies RecoveryRouteState });
              }}
            >
              Continuar
            </Button>
          </motion.div>
        </div>
      }
    />
  );

  const RecoveryChannelScreen = (
    <AuthHeroLayout
      rightContent={
        <div className="w-full space-y-5 md:w-[380px]">
          <RecoveryStepHeader
            step={2}
            title="Como quer receber o código?"
            subtitle="Escolha onde enviaremos o código de verificação"
            backPath="/recuperar-senha"
          />

          {[
            { key: "whatsapp" as const, label: "WhatsApp", detail: "(**) *****-XX34", icon: <WhatsappLogo size={20} /> },
            { key: "sms" as const, label: "SMS", detail: "(**) *****-XX34", icon: <DeviceMobile size={20} /> },
            { key: "email" as const, label: "E-mail", detail: "el***@gmail.com", icon: <EnvelopeSimple size={20} /> },
          ].map((channel) => {
            const selected = recoveryChannel === channel.key;
            return (
              <button
                key={channel.key}
                type="button"
                onClick={() => setRecoveryChannel(channel.key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  selected ? "border-primary bg-primary-light" : "border-border bg-white"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-primary text-white" : "bg-background text-muted-foreground"}`}>
                  {channel.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{channel.label}</p>
                  <p className="text-xs text-muted-foreground">{channel.detail}</p>
                </div>
              </button>
            );
          })}

          <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={!recoveryChannel}
              onClick={() => {
                if (!recoveryChannel) return;
                toast(`Código enviado via ${recoveryChannel === "whatsapp" ? "WhatsApp" : recoveryChannel === "sms" ? "SMS" : "E-mail"}!`);
                setRecoveryOtpCode("");
                setRecoveryOtpError("");
                navigate("/recuperar-senha/otp", {
                  state: {
                    cpf: locationState?.cpf,
                    channel: recoveryChannel,
                  } satisfies RecoveryRouteState,
                });
              }}
            >
              Enviar código
            </Button>
          </motion.div>
        </div>
      }
    />
  );

  const RecoveryOtpScreen = (
    <AuthHeroLayout
      rightContent={
        <div className="w-full space-y-5 md:w-[380px]">
          <RecoveryStepHeader step={3} title="Digite o código" subtitle={
            locationState?.channel === "whatsapp"
              ? "Enviamos um código de 6 dígitos para o seu WhatsApp"
              : locationState?.channel === "sms"
                ? "Enviamos um código de 6 dígitos por SMS para o seu celular"
                : "Enviamos um código de 6 dígitos para o seu e-mail"
          } backPath="/recuperar-senha/canal" />

          <div className="my-3 flex justify-center">
            <InputOTP
              maxLength={6}
              value={recoveryOtpCode}
              onChange={(value) => {
                setRecoveryOtpCode(value);
                if (recoveryOtpError) setRecoveryOtpError("");
              }}
            >
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

          {recoveryOtpError ? <p className="text-xs text-red-600">{recoveryOtpError}</p> : null}
          {recoveryLockedSeconds > 0 ? <p className="text-xs text-[#A33D05]">Muitas tentativas. Aguarde {recoveryLockedSeconds}s para tentar novamente.</p> : null}

          <div className="text-sm text-muted-foreground">
            {recoveryCountdown > 0 ? (
              <p>Reenviar código em 0:{String(recoveryCountdown).padStart(2, "0")}</p>
            ) : (
              <button
                type="button"
                className="font-medium text-primary"
                onClick={() => {
                  setRecoveryCountdown(60);
                  toast("Código reenviado!");
                }}
              >
                Reenviar código
              </button>
            )}
          </div>

          <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={recoveryOtpCode.length < 6 || recoveryLockedSeconds > 0}
              onClick={() => {
                if (recoveryOtpCode === "000000") {
                  setRecoveryOtpError("Código expirado. Solicite um novo código.");
                  setRecoveryCountdown(0);
                  return;
                }
                if (recoveryOtpCode !== "123456") {
                  const nextAttempts = recoveryOtpAttempts + 1;
                  setRecoveryOtpAttempts(nextAttempts);
                  if (nextAttempts >= 3) {
                    setRecoveryOtpLockUntil(Date.now() + 60_000);
                    setRecoveryOtpAttempts(0);
                    setRecoveryOtpCode("");
                    setRecoveryOtpError("Muitas tentativas. Aguarde 60 segundos para tentar novamente.");
                    return;
                  }
                  setRecoveryOtpError("Código incorreto. Verifique e tente novamente.");
                  setRecoveryOtpCode("");
                  return;
                }
                setRecoveryOtpAttempts(0);
                setRecoveryOtpError("");
                navigate("/recuperar-senha/nova-senha", {
                  state: {
                    cpf: locationState?.cpf,
                    channel: locationState?.channel,
                    otpVerified: true,
                  } satisfies RecoveryRouteState,
                });
              }}
            >
              Verificar
            </Button>
          </motion.div>
        </div>
      }
    />
  );

  const RecoveryNewPasswordScreen = (
    <AuthHeroLayout
      rightContent={
        <div className="w-full space-y-5 md:w-[380px]">
          <RecoveryStepHeader
            step={4}
            title="Crie uma nova senha"
            subtitle="Sua nova senha precisa ser diferente da anterior"
          />

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Nova senha</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError("");
                }}
                className="h-12 rounded-xl pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F5F4F2]">
                <div className={`h-full rounded-full transition-all ${passwordStrength.tone}`} style={{ width: `${passwordStrength.value}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{passwordStrength.label}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                type={showConfirmNewPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError("");
                }}
                className="h-12 rounded-xl pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
              >
                {showConfirmNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {newPasswordError ? <p className="text-xs text-red-600">{newPasswordError}</p> : null}
          </div>

          <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={newPassword.length < 6}
              onClick={() => {
                if (newPassword === "senha123") {
                  setNewPasswordError("A nova senha deve ser diferente da anterior.");
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  setNewPasswordError("As senhas não coincidem.");
                  return;
                }
                setNewPasswordError("");
                toast("Senha alterada com sucesso!");
                window.setTimeout(() => {
                  navigate("/acesso", { state: { passwordUpdated: true } satisfies RecoveryRouteState });
                }, 1500);
              }}
            >
              Salvar nova senha
            </Button>
          </motion.div>
        </div>
      }
    />
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
        <header className="relative z-10 rounded-b-[32px] bg-primary px-5 pb-6 pt-8 text-white md:mx-auto md:max-w-[860px] md:px-6 md:pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/75">Olá, {firstName}</p>
              <h2 className="text-xl font-bold">Seu crédito na seutudo.</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60"><SealCheck size={12} /> Conta verificada</p>
            </div>
            <div className="flex items-center gap-1">
              <PrivacyToggle variant="light" />
              <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/25">
                <Bell size={20} className="text-white" />
                {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#E8590A]">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
              </button>
            </div>
          </div>
          <RecomendacoesCarousel variant="light" />
        </header>

        <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
          <div className="md:mx-auto md:max-w-[860px] md:space-y-3">
            <motion.div variants={cardsContainerVariants} initial="initial" animate="animate" className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {([
                // TODO: reativar quando CLT estiver disponível
                // "clt",
                "saque-facil",
                // TODO: reativar quando FGTS estiver disponível
                // "fgts",
                "assistencias",
                "energia",
                "seguro",
              ] as const).map((interest) => {
                const currentService =
                  interest === "seguro"
                    ? {
                        title: "Seguro de vida",
                        subtitle: "Proteção para sua família",
                        description: "Seguro de vida acessível com contratação simples e sem burocracia.",
                        cta: "Contratar seguro",
                        icon: <ShieldCheck size={20} />,
                        highlight: "Proteção para sua família",
                        photo: "/images/card-dash-security.png",
                      }
                    : interest === "assistencias"
                    ? {
                        title: "Assistências seutudo.",
                        subtitle: "Saúde, odonto, pet e muito mais",
                        description: "Cuide de você e da sua família com descontos de até 85% em consultas e exames.",
                        cta: "Conhecer planos",
                        icon: <Heartbeat size={20} />,
                        highlight: "Saúde, odonto, pet e muito mais",
                        photo: "/images/card-dash-security.png",
                      }
                    : interest === "energia"
                    ? {
                        title: "Economize na conta de luz",
                        subtitle: "Reduza até 20% todo mês",
                        description: "Sem trocar equipamentos. Sem obras. Sem custo. Só economia na sua fatura.",
                        cta: "Simular economia",
                        icon: <Lightning size={20} />,
                        highlight: "Reduza até 20% todo mês",
                        photo: "/images/card-dash-clt.png",
                      }
                    : serviceCopy[interest as ServiceType];
                return (
                  <motion.div key={interest} variants={cardVariants}>
                    <Card className="relative overflow-hidden rounded-2xl border border-[#DADADA] bg-white shadow-sm">
                      <CardContent className="flex min-h-[158px] items-stretch p-0">
                        <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-4">
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FEF0E7] text-[#E8590A]">{currentService.icon}</div>
                              <p className="line-clamp-2 text-[16px] font-semibold leading-tight text-foreground">{currentService.title}</p>
                            </div>
                            {currentService.highlight ? <p className="mb-2 text-[14px] font-semibold text-[#E8590A]">{currentService.highlight}</p> : null}
                            <p className="mb-3 line-clamp-2 text-[14px] leading-snug text-muted-foreground">{currentService.description}</p>
                          </div>
                          <button onClick={() => {
                            if (interest === "saque-facil") navigate("/saque-facil");
                            else if (interest === "assistencias") navigate("/assistencias");
                            else if (interest === "energia") navigate("/energia");
                          }} className="inline-flex w-fit items-center text-[16px] font-semibold text-[#E8590A]">
                            {currentService.cta} <CaretRight size={14} className="ml-1" />
                          </button>
                        </div>
                        <div className="w-36 shrink-0 overflow-hidden bg-white">
                          <img src={currentService.photo} alt="" className="h-full w-full object-contain object-bottom" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Card className="mt-4 overflow-hidden rounded-3xl border-border shadow-sm">
              <CardContent className="p-0">
                <div className="flex min-h-[140px] items-stretch bg-[#EDE3DC]">
                  <div className="flex flex-1 flex-col justify-center px-5 py-4">
                    <p className="text-sm font-semibold leading-tight text-foreground">Ficou alguma dúvida?</p>
                    <p className="mt-1 text-xs text-muted-foreground">Atendimento seg a sex, 8h às 18h</p>
                    <div className="mt-4 flex gap-3">
                      <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border bg-[#ECEEF1] text-sm font-medium text-foreground hover:bg-[#E6E8EB]">
                        <WhatsappLogo size={18} /> WhatsApp
                      </Button>
                      <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border bg-[#ECEEF1] text-sm font-medium text-foreground hover:bg-[#E6E8EB]">
                        <Headset size={18} /> Ligar
                      </Button>
                    </div>
                  </div>
                  <div className="relative w-44 shrink-0 self-stretch">
                    <img src="/images/card-dash-contact.png" alt="Atendente seutudo." className="absolute inset-0 h-full w-full object-cover object-top" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-5 py-1">{[{ icon: <Lock size={13} />, label: "LGPD" }, { icon: <Bank size={13} />, label: "Banco Central" }, { icon: <ShieldCheck size={13} />, label: "Criptografado" }].map((item) => <div key={item.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">{item.icon}{item.label}</div>)}</div>
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
                      <button key={item.label} onClick={() => ("external" in item && item.external ? window.open(item.href, "_blank") : item.action?.())} className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0">
                        <div className="flex items-center justify-between">
                          {item.label}
                          {"external" in item && item.external ? <ArrowSquareOut size={16} className="text-muted-foreground" /> : <CaretRight size={16} className="text-muted-foreground" />}
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
            <Route path="/recuperar-senha" element={RecoveryCpfScreen} />
            <Route path="/recuperar-senha/canal" element={RecoveryChannelScreen} />
            <Route path="/recuperar-senha/otp" element={RecoveryOtpScreen} />
            <Route path="/recuperar-senha/nova-senha" element={RecoveryNewPasswordScreen} />
            <Route path="/cadastro" element={renderOnboarding} />
            <Route path="/painel" element={getStoredUser() ? HomeScreen : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta" element={getStoredUser() ? AccountScreen : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/meus-dados" element={getStoredUser() ? <MeusDadosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/editar-endereco" element={getStoredUser() ? <EditarEnderecoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/dados-bancarios" element={getStoredUser() ? <DadosBancariosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta/alterar-senha" element={getStoredUser() ? <AlterarSenhaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos" element={getStoredUser() ? <ContratosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos/seguro-001" element={getStoredUser() ? <ContratoSeguroPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos/clt-001" element={getStoredUser() ? <ContratoCLTPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos/saque-facil-001" element={getStoredUser() ? <ContratoSaqueFacilPage /> : <Navigate to="/boas-vindas" replace />} />
            {/* TODO(dev): seubolso está em andamento e escondido da navegação pública. */}
            <Route path="/seubolso" element={getStoredUser() ? <SeubolsoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/seubolso/como-funciona" element={getStoredUser() ? <SeubolsoComoFuncionaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/seubolso/historico" element={getStoredUser() ? <SeubolsoHistoricoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/notificacoes" element={getStoredUser() ? <NotificacoesPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/assistencias" element={getStoredUser() ? <AssistenciasPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/energia" element={getStoredUser() ? <EnergiaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/saque-facil" element={getStoredUser() ? <CreditCardProvider><SaqueFacilPage /></CreditCardProvider> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/duvidas" element={getStoredUser() ? <ComingSoon title="Dúvidas" /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster />
    </>
  );
}

export default App;
