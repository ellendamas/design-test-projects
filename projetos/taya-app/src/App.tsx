import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { IMaskInput } from "react-imask";
import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Bank,
  Bell,
  BookOpen,
  Brain,
  Briefcase,
  CalendarCheck,
  CaretLeft,
  CaretRight,
  CaretDown,
  ChartLineUp,
  ChatCircle,
  Check,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  CurrencyCircleDollar,
  DeviceMobile,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FileText,
  Fingerprint,
  Fire,
  FirstAid,
  Gear,
  Gift,
  HandHeart,
  Headset,
  Heartbeat,
  House,
  Image,
  Info,
  Lightning,
  ListChecks,
  Lock,
  LockSimple,
  MagnifyingGlass,
  MapPin,
  Money,
  Newspaper,
  PawPrint,
  PencilSimple,
  PiggyBank,
  SealCheck,
  ShieldCheck,
  Signature,
  SignOut,
  Stethoscope,
  Tag,
  Tooth,
  Trophy,
  Trash,
  Umbrella,
  UserCircle,
  Users,
  Wallet,
  VideoCamera,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "sonner";

import FaqAcordeon from "@/components/FaqAcordeon";
import { TermosModal } from "@/components/TermosModal";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { contratos } from "@/data/contratos";
import { usePrivacy } from "@/context/PrivacyContext";
import { useNotificacoes } from "@/context/NotificacoesContext";
import { useSeubolso } from "@/context/SeubolsoContext";
import type { Notificacao, NotificacaoTipo } from "@/data/notificacoes";
import { trackStep } from "@/utils/analytics";
import ConsignadoCLTLandingPage from "@/pages/consignado-clt/LandingPage";
import ConsignadoCLTProvedoresPage from "@/pages/consignado-clt/ProvedoresPage";
import ConsignadoCLTRedirecionandoPage from "@/pages/consignado-clt/RedirecionandoPage";
import ConsignadoCLTLoadingPage from "@/pages/consignado-clt/LoadingPage";
import ConsignadoCLTOfertasPage from "@/pages/consignado-clt/OfertasPage";
import ConsignadoCLTAguardandoPage from "@/pages/consignado-clt/AguardandoPage";
import ConsignadoCLTSimuladorPage from "@/pages/consignado-clt/SimuladorPage";
import ConsignadoCLTRevisaoPage from "@/pages/consignado-clt/RevisaoPage";
import ConsignadoCLTDadosPage from "@/pages/consignado-clt/DadosPage";
import ConsignadoCLTAssinaturaPage from "@/pages/consignado-clt/AssinaturaPage";
import ConsignadoCLTConfirmacaoPage from "@/pages/consignado-clt/ConfirmacaoPage";
import ConsignadoCLTSemOfertaPage from "@/pages/consignado-clt/SemOfertaPage";
import FGTSLandingPage from "@/pages/fgts/LandingPage";
import FGTSCopilotoPage from "@/pages/fgts/CopilotoPage";
import FGTSLoadingPage from "@/pages/fgts/LoadingPage";
import FGTSSemSaldoPage from "@/pages/fgts/SemSaldoPage";
import FGTSSimuladorPage from "@/pages/fgts/SimuladorPage";
import FGTSRevisaoPage from "@/pages/fgts/RevisaoPage";
import FGTSDadosPage from "@/pages/fgts/DadosPage";
import FGTSAssinaturaPage from "@/pages/fgts/AssinaturaPage";
import FGTSSaldoDisponivelPage from "@/pages/fgts/SaldoDisponivelPage";
import FGTSConfirmacaoPage from "@/pages/fgts/ConfirmacaoPage";
import CreditoPessoalLanding from "@/pages/credito-pessoal/CreditoPessoalLanding";
import CreditoPessoalDados from "@/pages/credito-pessoal/CreditoPessoalDados";
import CreditoPessoalConsultando from "@/pages/credito-pessoal/CreditoPessoalConsultando";
import CreditoPessoalInelegivel from "@/pages/credito-pessoal/CreditoPessoalInelegivel";
import CreditoPessoalSimulador from "@/pages/credito-pessoal/CreditoPessoalSimulador";
import CreditoPessoalRevisao from "./pages/credito-pessoal/CreditoPessoalRevisao";
import CreditoPessoalDadosTomador from "./pages/credito-pessoal/CreditoPessoalDadosTomador";
import CreditoPessoalConta from "./pages/credito-pessoal/CreditoPessoalConta";
import CreditoPessoalFormalizando from "./pages/credito-pessoal/CreditoPessoalFormalizando";
import CreditoPessoalEmAnalise from "./pages/credito-pessoal/CreditoPessoalEmAnalise";
import CreditoPessoalAssinatura from "./pages/credito-pessoal/CreditoPessoalAssinatura";
import CreditoPessoalConfirmacao from "./pages/credito-pessoal/CreditoPessoalConfirmacao";
import CreditoPessoalReprovada from "./pages/credito-pessoal/CreditoPessoalReprovada";
import CreditoPessoalPendente from "./pages/credito-pessoal/CreditoPessoalPendente";
import CreditoPessoalContratoPage from "./pages/credito-pessoal/CreditoPessoalContratoPage";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector, { type ContaData as ContaSelectorData } from "@/components/ContaSelector";
import { Logo } from "@/components/Logo";

type ServiceType = "clt" | "fgts" | "credito-pessoal" | "assistencias" | "energia";
type OtpChannel = "whatsapp" | "email" | "sms";
type StoredUser = { name: string; email: string; cpf?: string };
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

const HERO_IMAGE = "/images/bem-vindo.png";

const NECESSIDADES = [
  {
    id: "credito",
    icon: Money,
    titulo: "Preciso de dinheiro extra",
    subtitulo: "Crédito, empréstimo ou antecipação",
  },
  {
    id: "dividas",
    icon: ArrowsClockwise,
    titulo: "Quero reduzir minhas dívidas",
    subtitulo: "Renegociar ou quitar o que devo",
  },
  {
    id: "economizar",
    icon: PiggyBank,
    titulo: "Quero economizar no dia a dia",
    subtitulo: "Reduzir gastos fixos e contas",
  },
  {
    id: "proteger",
    icon: ShieldCheck,
    titulo: "Quero proteger minha família",
    subtitulo: "Seguros e assistências",
  },
  {
    id: "organizar",
    icon: ChartLineUp,
    titulo: "Quero entender minha vida financeira",
    subtitulo: "Organizar e planejar melhor",
  },
];

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
    title: "Crédito Consignado CLT",
    subtitle: "Para quem tem carteira assinada",
    description: "Parcelas fixas descontadas direto do seu salário. Sem susto no fim do mês.",
    cta: "Consultar agora",
    icon: <Briefcase size={20} />,
    highlight: "Descubra quanto você pode ter",
    photo: "/images/card-dash-clt.png",
  },
  fgts: {
    title: "Antecipar meu FGTS",
    subtitle: "Seu saldo do FGTS disponível agora",
    description: "Receba em minutos com simulação clara e sem burocracia.",
    cta: "Simular antecipação",
    icon: <FgtsCustomIcon size={20} />,
    highlight: "Receba seu saldo em até 15 minutos",
    photo: "/images/card-dash-fgts.png",
  },
  "credito-pessoal": {
    title: "Crédito Pessoal",
    subtitle: "Dinheiro na conta sem precisar de FGTS ou folha.",
    description: "Crédito pessoal com análise rápida e sem burocracia.",
    cta: "Simular crédito",
    icon: <Money size={20} />,
    photo: "",
  },
  "assistencias": {
    title: "Assistências Pode Já.",
    subtitle: "Saúde, odonto, pet e muito mais com desconto.",
    description: "Pacotes de assistência com cobertura ampla e preço acessível.",
    cta: "Ver assistências",
    icon: <Heartbeat size={20} />,
    photo: "",
  },
  "energia": {
    title: "Economize na conta de luz",
    subtitle: "Reduza até 20% todo mês sem trocar equipamentos.",
    description: "Energia limpa e mais barata direto para você.",
    cta: "Quero economizar",
    icon: <Lightning size={20} />,
    photo: "",
  },
};

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function FgtsCustomIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return <img src="/images/icon-fgts.svg" alt="FGTS" width={14} height={20} className={className} />;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("podeja_user");
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
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]"
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
      className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/20 md:hover:bg-[#F0F0F0]"
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
        <Logo variant="white" size="sm" className="absolute left-5 top-4 drop-shadow" />
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
      <Button disabled variant="outline" className="h-12 w-full rounded-xl border-[#FD5F31] bg-[#FFF3EE] text-[#FD5F31] opacity-100">
        <CheckCircle size={18} className="mr-2" weight="fill" />
        Interesse registrado
      </Button>
    );
  }
  return (
    <Button className="h-12 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={onRegister}>
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

export function SubPageLayout({ title, children, hideNav = false }: { title: string; children: ReactNode; hideNav?: boolean }) {
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
    if (typeof window !== "undefined") window.localStorage.removeItem("podeja_user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <Logo size="md" className="mb-8 self-start" />
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
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-foreground">{title}</h1>
          <PrivacyToggle size={18} variant="dark" />
          <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <Bell size={18} className="text-muted-foreground" />
            {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FD5F31] text-[9px] font-bold text-white">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
          </button>
        </header>
        <div className={`px-4 py-5 md:mx-auto md:max-w-[640px] md:px-0 md:py-8 ${hideNav ? "pb-6" : "pb-28"}`}>{children}</div>

        {!hideNav && <nav className="fixed bottom-4 left-1/2 z-30 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm md:hidden">
          <ul className="grid w-full grid-cols-4 text-center">
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
        </nav>}
      </main>
    </div>
  );
}

function OptionButton({ selected, onClick, children, fullWidth = false }: { selected: boolean; onClick: () => void; children: ReactNode; fullWidth?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${fullWidth ? "w-full" : ""} ${selected ? "border-[#FD5F31] bg-[#FFF3EE] text-[#D94E28]" : "border-border bg-white text-foreground hover:border-[#FD5F31]/40"}`}
    >
      {children}
    </button>
  );
}

function MeusDadosPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // TODO: substituir por dados reais do StoredUser / API
  const [email, setEmail] = useState("cliente@exemplo.com");
  const [celular, setCelular] = useState("(11) 99999-8888");
  const [dataNasc, setDataNasc] = useState("12/08/1989");
  const [sexo, setSexo] = useState("M");
  const [estadoCivil, setEstadoCivil] = useState("Solteiro(a)");
  const [rendaMensal, setRendaMensal] = useState(4500);

  type CampoEditavel = "email" | "celular" | "dataNasc" | "sexo" | "estadoCivil" | "rendaMensal";
  const [campoEditando, setCampoEditando] = useState<CampoEditavel | null>(null);
  const [valorTemp, setValorTemp] = useState("");
  const [editError, setEditError] = useState("");
  const editOpen = campoEditando !== null;

  const labelCampo: Record<CampoEditavel, string> = {
    email: "E-mail",
    celular: "Celular",
    dataNasc: "Data de nascimento",
    sexo: "Sexo",
    estadoCivil: "Estado civil",
    rendaMensal: "Renda mensal",
  };

  const abrirEdicao = (campo: CampoEditavel) => {
    setCampoEditando(campo);
    setEditError("");
    if (campo === "email") setValorTemp(email);
    else if (campo === "celular") setValorTemp(celular);
    else if (campo === "dataNasc") setValorTemp(dataNasc);
    else if (campo === "sexo") setValorTemp(sexo);
    else if (campo === "estadoCivil") setValorTemp(estadoCivil);
    else if (campo === "rendaMensal") setValorTemp(rendaMensal.toString());
  };

  const fecharEdicao = () => { setCampoEditando(null); setValorTemp(""); setEditError(""); };

  const parseCurrencyLocal = (v: string) => {
    const n = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
    return Number(n) || 0;
  };

  const salvarEdicao = () => {
    if (campoEditando === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valorTemp)) { setEditError("E-mail inválido"); return; }
      setEmail(valorTemp);
    } else if (campoEditando === "celular") {
      if (valorTemp.replace(/\D/g, "").length < 10) { setEditError("Celular inválido"); return; }
      setCelular(valorTemp);
    } else if (campoEditando === "dataNasc") {
      if (!isAdultBirthDate(valorTemp)) { setEditError("Data inválida ou idade mínima de 18 anos"); return; }
      setDataNasc(valorTemp);
    } else if (campoEditando === "sexo") {
      if (!valorTemp) { setEditError("Selecione uma opção"); return; }
      setSexo(valorTemp);
    } else if (campoEditando === "estadoCivil") {
      if (!valorTemp) { setEditError("Selecione uma opção"); return; }
      setEstadoCivil(valorTemp);
    } else if (campoEditando === "rendaMensal") {
      const v = parseCurrencyLocal(valorTemp);
      if (v <= 0) { setEditError("Informe um valor válido"); return; }
      setRendaMensal(v);
    }
    toast.success("Dado atualizado.");
    fecharEdicao();
  };

  const toCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sexoLabel: Record<string, string> = { M: "Masculino", F: "Feminino", N: "Prefiro não informar" };

  const editModalContent = (
    <>
      {campoEditando === "email" && (
        <Input type="email" value={valorTemp} onChange={(e) => { setValorTemp(e.target.value); setEditError(""); }} className="h-12 rounded-xl" placeholder="seu@email.com" autoFocus />
      )}
      {campoEditando === "celular" && (
        <IMaskInput mask="(00) 00000-0000" value={valorTemp} onAccept={(v) => { setValorTemp(String(v)); setEditError(""); }} className={maskedInputClass} placeholder="(00) 00000-0000" inputMode="numeric" />
      )}
      {campoEditando === "dataNasc" && (
        <IMaskInput mask="00/00/0000" value={valorTemp} onAccept={(v) => { setValorTemp(String(v)); setEditError(""); }} className={maskedInputClass} placeholder="DD/MM/AAAA" inputMode="numeric" />
      )}
      {campoEditando === "sexo" && (
        <div className="grid gap-2">
          {[{ v: "M", label: "Masculino" }, { v: "F", label: "Feminino" }, { v: "N", label: "Prefiro não informar" }].map(({ v, label }) => (
            <button key={v} type="button" onClick={() => setValorTemp(v)} className={`h-11 rounded-xl border text-sm transition-colors ${valorTemp === v ? "border-[#FD5F31] bg-[#FFF3EE] text-[#D94E28]" : "border-border text-foreground"}`}>{label}</button>
          ))}
        </div>
      )}
      {campoEditando === "estadoCivil" && (
        <div className="grid grid-cols-2 gap-2">
          {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)"].map((v) => (
            <button key={v} type="button" onClick={() => setValorTemp(v)} className={`h-11 rounded-xl border text-sm transition-colors ${valorTemp === v ? "border-[#FD5F31] bg-[#FFF3EE] text-[#D94E28]" : "border-border text-foreground"}`}>{v}</button>
          ))}
        </div>
      )}
      {campoEditando === "rendaMensal" && (
        <div>
          <IMaskInput mask={Number} scale={2} signed={false} thousandsSeparator="." radix="," mapToRadix={["."]} normalizeZeros padFractionalZeros value={valorTemp} onAccept={(v) => { setValorTemp(String(v)); setEditError(""); }} className={maskedInputClass} placeholder="R$ 0,00" inputMode="numeric" />
          <p className="mt-1 text-xs text-muted-foreground">Salário, aposentadoria ou renda principal</p>
        </div>
      )}
      {editError && <p className="mt-2 text-xs text-red-500">{editError}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl" onClick={fecharEdicao}>Cancelar</Button>
        <Button className="h-12 rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={salvarEdicao}>Salvar</Button>
      </div>
    </>
  );

  return (
    <>
      <SubPageLayout title="Meus dados">
        <div className="space-y-5 pb-8">
          <div className="mb-1">
            <h2 className="text-lg font-bold text-foreground">Meus dados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Documentos oficiais não podem ser alterados. Os demais dados podem ser atualizados a qualquer momento.</p>
          </div>

          {/* Documentos */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documentos</p>
            </div>
            <div className="divide-y divide-border px-4">
              {[
                { label: "CPF", value: "•••.456.789-••" },
                { label: "RG", value: "12.345.678-9" },
                { label: "Órgão exp.", value: "SSP" },
              ].map(({ label, value }) => (
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

          {/* Dados pessoais */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dados pessoais</p>
            </div>
            <div className="divide-y divide-border px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Nome completo</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground">{getStoredUser()?.name ?? "Cliente"}</p>
                </div>
                <LockSimple size={16} className="ml-3 shrink-0 text-muted-foreground" />
              </div>
              {[
                { label: "Data de nascimento", value: dataNasc, campo: "dataNasc" as CampoEditavel },
                { label: "Sexo", value: sexoLabel[sexo] ?? sexo, campo: "sexo" as CampoEditavel },
                { label: "Estado civil", value: estadoCivil, campo: "estadoCivil" as CampoEditavel },
              ].map(({ label, value, campo }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
                  </div>
                  <button type="button" onClick={() => abrirEdicao(campo)} className="ml-3 shrink-0 text-sm font-medium text-[#FD5F31] hover:underline">Alterar</button>
                </div>
              ))}
            </div>
          </div>

          {/* Contato */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contato</p>
            </div>
            <div className="divide-y divide-border px-4">
              {[
                { label: "E-mail", value: email, campo: "email" as CampoEditavel, storageKey: "podeja_email_validado" },
                { label: "Celular", value: celular, campo: "celular" as CampoEditavel, storageKey: "podeja_telefone_validado" },
              ].map(({ label, value, campo, storageKey }) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    {/* Label com badge de verificação */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      {localStorage.getItem(storageKey) === "true" ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
                          <CheckCircle size={10} weight="fill" /> Verificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                          <Clock size={10} /> Pendente
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
                  </div>
                  <button type="button" onClick={() => abrirEdicao(campo)} className="ml-3 shrink-0 text-sm font-medium text-[#FD5F31] hover:underline">Alterar</button>
                </div>
              ))}
            </div>
          </div>

          {/* Financeiro */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financeiro</p>
            </div>
            <div className="divide-y divide-border px-4">
              <div className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Renda mensal</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground">R$ {toCurrency(rendaMensal)}</p>
                </div>
                <button type="button" onClick={() => abrirEdicao("rendaMensal")} className="ml-3 shrink-0 text-sm font-medium text-[#FD5F31] hover:underline">Alterar</button>
              </div>
            </div>
          </div>

          {/* Outros dados */}
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Outros dados</p>
            </div>
            <div className="divide-y divide-border">
              <button type="button" onClick={() => navigate("/minha-conta/editar-endereco")} className="flex w-full items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-foreground">Endereço</span>
                <CaretRight size={16} className="text-muted-foreground" />
              </button>
              <button type="button" onClick={() => navigate("/minha-conta/dados-bancarios")} className="flex w-full items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-foreground">Dados bancários</span>
                <CaretRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </SubPageLayout>

      {isDesktop ? (
        <Dialog open={editOpen} onOpenChange={(o) => { if (!o) fecharEdicao(); }}>
          <DialogContent className="max-w-md">
            <DialogClose onClose={fecharEdicao} />
            <DialogHeader>
              <DialogTitle>Alterar {campoEditando ? labelCampo[campoEditando] : ""}</DialogTitle>
            </DialogHeader>
            {editModalContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={editOpen} onOpenChange={(o) => { if (!o) fecharEdicao(); }}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Alterar {campoEditando ? labelCampo[campoEditando] : ""}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-6">
              {editModalContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}

function EditarEnderecoPage() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  // DESIGN ONLY — TODO: substituir por dados reais do StoredUser
  const enderecosMock: EnderecoData[] = [
    { logradouro: "Rua Dona Ana Neri", numero: "581", complemento: "de 501/502 ao fim", bairro: "Cambuci", cidade: "São Paulo", estado: "SP", cep: "01522-000" },
    { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" },
  ];

  if (success) {
    return (
      <SubPageLayout title="Editar endereço">
        <div className="flex flex-col items-center space-y-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <CheckCircle size={32} className="text-[#FD5F31]" weight="fill" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Endereço atualizado.</h2>
          <p className="text-sm text-muted-foreground">Suas informações foram salvas com sucesso.</p>
          <Button className="h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={() => navigate("/minha-conta")}>
            Voltar para minha conta
          </Button>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Editar endereço">
      <div className="pb-6">
        <EnderecoSelector
          enderecos={enderecosMock}
          semProximoPasso
          onConfirmar={() => setSuccess(true)}
        />
      </div>
    </SubPageLayout>
  );
}

function DadosBancariosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [contaSalva, setContaSalva] = useState<ContaSelectorData | null>(null);

  // DESIGN ONLY — simular N contas cadastradas via query param
  // ?conta=0 → sem conta (abre formulário direto)
  // ?conta=1 → 1 conta salva  |  ?conta=3 → 3 contas salvas
  // TODO: substituir por dados reais do StoredUser / API
  const CONTAS_MOCK_BANCARIOS: ContaSelectorData[] = [
    { banco: { codigo: "077", nome: "Banco Inter" }, tipoConta: "Conta corrente", agencia: "1234", conta: "12345", digito: "6" },
    { banco: { codigo: "260", nome: "Nubank" }, tipoConta: "Conta corrente", agencia: "0001", conta: "987654", digito: "3" },
    { banco: { codigo: "341", nome: "Itaú Unibanco" }, tipoConta: "Conta poupança", agencia: "5678", conta: "11111", digito: "0" },
    { banco: { codigo: "237", nome: "Bradesco" }, tipoConta: "Conta corrente", agencia: "0123", conta: "55555", digito: "9" },
    { banco: { codigo: "033", nome: "Santander" }, tipoConta: "Conta corrente", agencia: "9999", conta: "66666", digito: "1" },
  ];
  const nContas = Math.min(5, Math.max(0, parseInt(searchParams.get("conta") ?? "0", 10) || 0));
  const contasMock = CONTAS_MOCK_BANCARIOS.slice(0, nContas);

  if (success && contaSalva) {
    return (
      <SubPageLayout title="Dados bancários">
        <div className="flex flex-col items-center space-y-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Check size={28} className="text-[#FD5F31]" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Conta salva com sucesso</p>
            <p className="text-sm text-muted-foreground">{contaSalva.banco.nome} · {contaSalva.tipoConta}</p>
            <p className="text-sm text-muted-foreground">Ag {contaSalva.agencia} · {contaSalva.conta}-{contaSalva.digito}</p>
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={() => navigate("/minha-conta")}>
            Voltar para minha conta
          </Button>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Dados bancários">
      <div className="pb-6">
        <ContaSelector
          contas={contasMock}
          semProximoPasso
          onConfirmar={(c) => { setContaSalva(c); setSuccess(true); }}
        />
      </div>
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
      <Button className="h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" disabled={!agencia || !conta || !digito} onClick={() => setConfirmando(true)}>Confirmar</Button>

      {confirmando && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <h2 className="text-lg font-bold text-foreground">Confirmar conta</h2>
          <div className="flex gap-3 rounded-xl bg-[#FFF3EE] p-3">
            <Bank size={18} className="mt-0.5 shrink-0 text-[#FD5F31]" />
            <p className="text-xs leading-snug text-[#D94E28]">A conta bancária precisa estar no seu nome para que o valor seja depositado para você.</p>
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
            <Button className="rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28] md:w-auto" onClick={onConfirmSave}>Confirmar</Button>
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
          className="h-12 w-full rounded-xl border border-border bg-white px-4 text-center text-lg tracking-[0.4em] text-foreground focus:border-[#FD5F31] focus:outline-none focus:ring-2 focus:ring-[#FD5F31]/20"
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
        className="mt-5 h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28] disabled:opacity-40"
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE]"><FileText size={32} className="text-[#FD5F31]" /></div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Você ainda não tem contratos.</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Quando você contratar um produto, ele aparece aqui para você acompanhar tudo.</p>
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#FD5F31] font-semibold text-white hover:bg-[#D94E28]" onClick={() => navigate("/painel")}>Ver ofertas disponíveis</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((contrato) => (
            <button key={contrato.id} onClick={() => navigate(contrato.tipo === "credito-pessoal" ? `/credito-pessoal/contrato/${contrato.id}` : `/contratos/${contrato.id}`)} className="w-full rounded-2xl border border-border bg-white p-4 text-left transition-colors hover:border-[#FD5F31]/40">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#FFF3EE] px-2.5 py-1 text-xs font-semibold text-[#D94E28]">
                  {contrato.tipo === "seguro" ? "Seguro de Vida" : contrato.tipo === "fgts" ? "Antecipação FGTS" : contrato.tipo === "credito-pessoal" ? "Crédito Pessoal" : "Crédito Consignado CLT"}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-700"><div className="h-1.5 w-1.5 rounded-full bg-green-500" />Ativo</span>
              </div>
              <p className="mb-2 text-sm font-bold text-foreground">{contrato.produto}</p>
              {contrato.tipo === "seguro" ? (
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-muted-foreground">Valor mensal</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorMensal.toFixed(2).replace(".", ",")}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Vigência até</p><p className="text-sm font-semibold text-foreground">{contrato.vigencia}</p></div>
                </div>
              ) : contrato.tipo === "fgts" ? (
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-muted-foreground">Próximo desconto</p><p className="text-sm font-semibold text-foreground">{contrato.proximoDesconto}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Parcela anual</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorParcela.toFixed(2).replace(".", ",")}</p></div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-muted-foreground">Parcela mensal</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorParcela.toFixed(2).replace(".", ",")}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Próximo desconto</p><p className="text-sm font-semibold text-foreground">{contrato.proximoDesconto}</p></div>
                </div>
              )}
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-xs font-medium text-[#FD5F31]">Ver detalhes<CaretRight size={12} /></div>
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
        <button onClick={() => setOpen((o) => !o)} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#FD5F31]">{open ? "Mostrar menos" : "Mostrar mais"}<CaretDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} /></button>
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
      <div className="mb-6"><div className="mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-[#FD5F31]" /><h3 className="text-base font-bold text-foreground">Coberturas</h3></div>{contrato.coberturas.map((c) => <AccordionItemContrato cobertura={c} key={c.nome} />)}</div>
      <div className="flex items-start gap-2 border-t border-border pt-4"><Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" /><p className="text-xs text-muted-foreground">Consulte os <a href={contrato.linkTermos} target="_blank" className="text-[#FD5F31] underline underline-offset-2">Termos do Seguro</a> e o <a href={contrato.linkPrivacidade} target="_blank" className="text-[#FD5F31] underline underline-offset-2">Aviso de Privacidade da Seguradora</a>.</p></div>
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
        <div><p className="text-xs text-muted-foreground">Parceiro</p><p className="text-sm font-semibold text-foreground">{contrato.provedor}</p></div>
        <div><p className="text-xs text-muted-foreground">Número da CCB</p><p className="text-sm font-semibold text-foreground">{contrato.numeroCCB}</p></div>
        <div><p className="text-xs text-muted-foreground">Data de emissão</p><p className="text-sm font-semibold text-foreground">{contrato.dataEmissao}</p></div>
        <div><p className="text-xs text-muted-foreground">Modalidade</p><p className="text-sm font-semibold leading-snug text-foreground">{contrato.modalidade}</p></div>
        <div><p className="text-xs text-muted-foreground">Valor líquido recebido</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
      </div>
      <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm border border-border">
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-[#D94E28]">Parcelas</h3><span className="text-xs text-[#D94E28]">{contrato.parcelasRestantes} de {contrato.totalParcelas} restantes</span></div>
        <div className="mb-3 h-2 rounded-full bg-[#D94E28]/20"><div className="h-2 rounded-full bg-[#FD5F31] transition-all" style={{ width: `${progresso}%` }} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-[#D94E28]/70">Valor da parcela</p><p className="text-sm font-bold text-[#D94E28]">R$ {contrato.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
          <div><p className="text-xs text-[#D94E28]/70">Próximo desconto</p><p className="text-sm font-bold text-[#D94E28]">{contrato.proximoDesconto}</p></div>
          <div><p className="text-xs text-[#D94E28]/70">Saldo devedor</p><SensitiveData value={`R$ ${contrato.saldoDevedor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} type="currency" /></div>
          <div><p className="text-xs text-[#D94E28]/70">Dia de pagamento</p><p className="text-sm font-bold text-[#D94E28]">Todo dia {contrato.diaPagamento}</p></div>
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

function ContratoFGTSPage() {
  const contrato = contratos.find((c) => c.id === "fgts-001" && c.tipo === "fgts");
  if (!contrato) return <Navigate to="/contratos" replace />;
  return (
    <SubPageLayout title="Antecipação FGTS">
      {/* Banner demo */}
      <div className="mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-xs leading-snug text-amber-700">Este é um contrato de exemplo para fins de demonstração.</p>
      </div>

      {/* Status + título */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500" /><span className="text-sm font-medium text-green-700">Ativo</span></div>
        <h2 className="text-2xl font-bold text-foreground">Antecipação Saque Aniversário</h2>
      </div>

      {/* Dados básicos */}
      <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-4">
        <div><p className="text-xs text-muted-foreground">Número da CCB</p><p className="text-sm font-semibold text-foreground">{contrato.numeroCCB}{/* TODO: receber da API BMP */}</p></div>
        <div><p className="text-xs text-muted-foreground">Data de emissão</p><p className="text-sm font-semibold text-foreground">{contrato.dataEmissao}</p></div>
        <div><p className="text-xs text-muted-foreground">Modalidade</p><p className="text-sm font-semibold leading-snug text-foreground">{contrato.modalidade}</p></div>
        <div><p className="text-xs text-muted-foreground">Valor líquido recebido</p><p className="text-sm font-semibold text-foreground">R$ {contrato.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
      </div>

      {/* Card Parcelas */}
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-[#D94E28]">{contrato.numParcelas} parcela{contrato.numParcelas !== 1 ? "s" : ""} anuais{/* TODO: receber da API BMP */}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs text-[#D94E28]/70">Próxima parcela</p><p className="text-sm font-bold text-[#D94E28]">{contrato.proximoDesconto}{/* TODO: receber da API BMP */}</p></div>
          <div><p className="text-xs text-[#D94E28]/70">Valor da parcela</p><p className="text-sm font-bold text-[#D94E28]">R$ {contrato.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}{/* TODO: receber da API BMP */}</p></div>
          <div><p className="text-xs text-[#D94E28]/70">Saldo a descontar</p><SensitiveData value={`R$ ${contrato.saldoADescontar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} type="currency" />{/* TODO: receber da API BMP */}</div>
          <div><p className="text-xs text-[#D94E28]/70">Data do desconto</p><p className="text-sm font-bold text-[#D94E28]">{contrato.dataDesconto}</p></div>
        </div>
      </div>

      {/* Card Taxas e custos */}
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-foreground">Taxas e custos</h3>
        <div className="space-y-2.5">
          {[
            { label: "Taxa de juros", value: `${contrato.taxaJurosMes}% a.m. / ${contrato.taxaJurosAno}% a.a.` },
            { label: "CET", value: `${contrato.cet}% a.m.` },
            { label: "IOF", value: `R$ ${contrato.iof.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
            { label: "Tarifa de Cadastro", value: `R$ ${contrato.tarifaCadastro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
            { label: "Valor total a descontar", value: `R$ ${contrato.valorTotalADescontar.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-xs font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Card Dados do emitente */}
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-foreground">Dados do emitente</h3>
        <div className="space-y-3">
          {[
            { label: "Nome completo", value: contrato.nomeCliente, sensitive: true },
            { label: "CPF", value: contrato.cpfCliente, sensitive: true, type: "cpf" as const },
            { label: "Data de nascimento", value: contrato.dataNascimento, sensitive: false },
            { label: "Município", value: contrato.municipio, sensitive: false },
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

      {/* Card Dados para depósito */}
      <div className="mb-5 rounded-2xl border border-border bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-foreground">Dados para depósito</h3>
        <div className="space-y-3">
          {[
            { label: "Banco", value: contrato.banco },
            { label: "Agência", value: contrato.agencia },
            { label: "Conta", value: contrato.conta },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <SensitiveData value={item.value} type="text" />
            </div>
          ))}
        </div>
      </div>

      {/* Card Quitar antecipadamente */}
      <div className="mb-5 rounded-2xl border border-dashed border-border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Quitar antecipadamente</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Pague o saldo e encerre o contrato antes do prazo.</p>
          </div>
          <span className="rounded-full bg-[#E7E5E4] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#78716C]">Em breve</span>
        </div>
      </div>
    </SubPageLayout>
  );
}

function NotificacaoCard({ notificacao }: { notificacao: Notificacao }) {
  const iconePorTipo: Record<NotificacaoTipo, ReactNode> = {
    transacional: <CheckCircle size={18} weight="fill" className="text-green-600" />,
    lembrete: <Clock size={18} weight="fill" className="text-[#FD5F31]" />,
    oferta: <Tag size={18} weight="fill" className="text-[#FD5F31]" />,
    sistema: <Info size={18} weight="fill" className="text-blue-500" />,
  };

  return (
    <div className={`flex gap-3 rounded-2xl border p-4 transition-colors ${!notificacao.lida ? "border-[#FD5F31]/20 bg-[#FFF3EE]" : "border-border bg-white"}`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!notificacao.lida ? "bg-white" : "bg-[#F0F0F0]"}`}>{iconePorTipo[notificacao.tipo]}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${!notificacao.lida ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{notificacao.titulo}</p>
          {!notificacao.lida ? <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#FD5F31]" /> : null}
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F0F0]"><Bell size={32} className="text-muted-foreground" /></div>
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
  const navigate = useNavigate();
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
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">{iconMap[card.icone]}</div>
                  <p className="text-sm font-semibold text-foreground">{card.texto}</p>
                </div>
                {card.cta && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (card.destino) navigate(card.destino);
                    }}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]"
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
          className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FD5F31] shadow disabled:opacity-40"
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
          className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#FD5F31] shadow disabled:opacity-50"
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
    { nome: "Saúde", icon: <Stethoscope size={20} className="text-[#FD5F31]" />, hero: <Stethoscope size={48} />, beneficio: "Consultas a partir de R$ 39,90", tag: "Clínico geral e 5 especialidades" },
    { nome: "Odonto", icon: <Tooth size={20} className="text-[#FD5F31]" />, hero: <Tooth size={48} />, beneficio: "Até 85% de desconto", tag: "+150 procedimentos" },
    { nome: "Pet", icon: <PawPrint size={20} className="text-[#FD5F31]" />, hero: <PawPrint size={48} />, beneficio: "Consultas a R$ 39,90", tag: "Cães e gatos em todo o Brasil" },
    { nome: "Psicologia", icon: <Brain size={20} className="text-[#FD5F31]" />, hero: <Brain size={48} />, beneficio: "1ª consulta gratuita", tag: "Demais por R$ 100,00" },
    { nome: "Previdência", icon: <Umbrella size={20} className="text-[#FD5F31]" />, hero: <Umbrella size={48} />, beneficio: "Suporte INSS completo", tag: "Análise e orientação de benefícios" },
    { nome: "Bem-estar", icon: <Heartbeat size={20} className="text-[#FD5F31]" />, hero: <Heartbeat size={48} />, beneficio: "Monitoramento de saúde", tag: "Sinais vitais pela câmera do celular" },
    { nome: "Educação", icon: <BookOpen size={20} className="text-[#FD5F31]" />, hero: <BookOpen size={48} />, beneficio: "+600 cursos digitais", tag: "Finanças, segurança digital e mais" },
    { nome: "Tecnologia", icon: <DeviceMobile size={20} className="text-[#FD5F31]" />, hero: <DeviceMobile size={48} />, beneficio: "Suporte 24h", tag: "Celular, apps e segurança digital" },
    { nome: "Residência", icon: <House size={20} className="text-[#FD5F31]" />, hero: <House size={48} />, beneficio: "Emergências 24h", tag: "Elétrica, hidráulica, chaveiro" },
    { nome: "Prevenção", icon: <FirstAid size={20} className="text-[#FD5F31]" />, hero: <FirstAid size={48} />, beneficio: "Histórico de saúde centralizado", tag: "Lembretes de exames preventivos" },
    { nome: "Notícias", icon: <Newspaper size={20} className="text-[#FD5F31]" />, hero: <Newspaper size={48} />, beneficio: "Conteúdo exclusivo", tag: "Portal VIVA — vídeos e podcasts" },
    { nome: "Recompensa", icon: <Gift size={20} className="text-[#FD5F31]" />, hero: <Gift size={48} />, beneficio: "Pontos em +250 lojas", tag: "Troque por descontos e produtos" },
    { nome: "Sorteio", icon: <Trophy size={20} className="text-[#FD5F31]" />, hero: <Trophy size={48} />, beneficio: "Prêmios diários", tag: "R$ 500 diário · R$ 5mil semanal" },
  ];

  const faqItems = [
    { q: "Quem pode contratar?", a: "Todos os clientes cadastrados no Pode Já com CPF validado." },
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
      icon: <Bell size={16} className="text-[#FD5F31]" />,
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
              <Badge className="mb-2 border-0 bg-white/15 text-[11px] text-white">ASSISTÊNCIAS PODE JÁ.</Badge>
              <h2 className="max-w-[290px] text-[26px] font-bold leading-tight text-white">Cuide de quem você ama sem pesar no bolso</h2>
              <p className="mt-2 max-w-[290px] text-sm text-white/80">Descontos reais em saúde, odonto, pet e muito mais</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[#FFF3EE] shadow-sm">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-[#FD5F31]">R$ 4.600</p>
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
                  <span className="mt-2 inline-flex rounded-full bg-[#FFF3EE] px-2 py-1 text-[11px] text-[#FD5F31]">{item.tag}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pointer-events-none absolute left-0 top-[58%] hidden -translate-y-1/2 md:flex">
            <button
              type="button"
              onClick={() => categoriasRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
              disabled={!canCategoriasLeft}
              className="pointer-events-auto -ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#FD5F31] shadow disabled:opacity-40"
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
              className="pointer-events-auto -mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#FD5F31] shadow disabled:opacity-40"
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
                { icon: <ListChecks size={32} className="text-[#FD5F31]" />, titulo: "Escolha as assistências que fazem sentido para você", sub: "Monte seu pacote com as categorias que mais combinam com a sua vida." },
                { icon: <CreditCard size={32} className="text-[#FD5F31]" />, titulo: "Pague uma mensalidade acessível sem sair do app", sub: "Tudo dentro do Pode Já, simples e sem burocracia." },
                { icon: <HandHeart size={32} className="text-[#FD5F31]" />, titulo: "Use quando precisar com descontos de até 85%", sub: "Rede credenciada em todo o Brasil, sem limite de utilizações." },
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
            <button onClick={() => navigate("/painel")} className="mt-2 w-full text-center text-sm font-medium text-[#FD5F31]">
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
      icon: <Bell size={16} className="text-[#FD5F31]" />,
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
              <CheckCircle size={16} className="text-[#FD5F31]" weight="fill" />
              {item}
            </div>
          ))}
        </div>

        <Card className="border-0 bg-[#FFF3EE] shadow-sm">
          <CardContent className="p-5 text-center">
            <p className="text-4xl font-bold text-[#FD5F31]">R$ 80</p>
            <p className="mt-1 text-sm font-semibold text-foreground">de economia média por mês na conta de luz</p>
            <p className="mt-1 text-xs text-muted-foreground">Com base nos clientes já atendidos pelo nosso parceiro</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Como funciona</h3>
            <div className="space-y-3">
              {[
                { icon: <FileText size={32} className="text-[#FD5F31]" />, titulo: "Você envia sua conta de luz", sub: "Basta fotografar ou enviar o PDF da sua fatura." },
                { icon: <MagnifyingGlass size={32} className="text-[#FD5F31]" />, titulo: "Analisamos as melhores opções para o seu perfil", sub: "Nossa equipe identifica as alternativas disponíveis na sua região." },
                { icon: <CurrencyCircleDollar size={32} className="text-[#FD5F31]" />, titulo: "Você começa a economizar sem mudar nada em casa", sub: "Sem obras, sem contratos complicados, sem custo de adesão." },
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
            <button onClick={() => navigate("/painel")} className="mt-2 w-full text-center text-sm font-medium text-[#FD5F31]">
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
        <Card className="overflow-hidden border-0 bg-[#FD5F31] text-white shadow-sm">
          <CardContent className="relative p-4">
            <Coins size={48} className="absolute right-4 top-3 text-white/20" />
            <button onClick={() => navigate("/seubolso/como-funciona")} className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#FD5F31]">Entenda como funciona <CaretRight size={12} /></button>
            <p className="text-sm text-white/80">Seu saldo</p>
            <p className="mt-1 text-3xl font-bold">{dataVisible ? saldoAnimado.toLocaleString("pt-BR") : "••••"}</p>
            <p className="text-sm text-white/80">moedas</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]"><Fire size={20} /></div>
              <div>
                <p className="text-sm font-semibold text-foreground">{streak} dias seguidos</p>
                <p className="text-xs text-muted-foreground">Continue abrindo o app todo dia para ganhar mais moedas</p>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground"><span>{streak}/30 dias</span><span>Bônus de 500</span></div>
              <Progress value={progressoStreak} className="h-2 bg-secondary [&>div]:bg-[#FD5F31]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-[#FFF3EE] shadow-sm">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#FD5F31]">
                <Gift size={18} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-semibold leading-5 text-[#D94E28]">Resgate suas moedas</p>
                <p className="pb-1 text-xs leading-4 text-[#D94E28]/80">Logo você poderá usar seus pontos para desconto em taxas, assistências e muito mais.</p>
              </div>
            </div>
            <div className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium leading-[15px] text-[#D94E28]">Em breve</div>
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">{item.icon}</div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-foreground leading-tight">{item.nome}</p>
                    <p className="text-xs font-semibold text-[#FD5F31] leading-tight">{item.valor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">{item.unica ? <Badge className="border-0 bg-[#FFF3EE] text-[#FD5F31]">Feito</Badge> : <Badge className="border-0 bg-[#DCFCE7] text-[#16A34A]">Feito hoje</Badge>}<CheckCircle size={18} weight="fill" className={item.unica ? "text-[#FD5F31]" : "text-[#16A34A]"} /></div>
              </div>
            ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Pendentes</h3>
              <div className="space-y-2">
            {pendentes.map((item) => (
              <div key={item.key} className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">{item.icon}</div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold leading-tight text-foreground">{item.nome}</p>
                    {item.sub ? <p className="text-[11px] leading-tight text-[#ABA19A]">{item.sub}</p> : null}
                  </div>
                  <p className="text-xs font-semibold leading-tight text-[#FD5F31]">{item.valor}</p>
                </div>
              </div>
            ))}
                <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]"><Users size={18} /></div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                    <p className="text-xs font-semibold leading-tight text-foreground">Indicar um amigo</p>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-[11px] text-[#78716C]">Se cadastrou</p><p className="text-xs font-semibold text-[#FD5F31]">+200 moedas</p></div>
                      <div className="text-right"><p className="text-[11px] text-[#78716C]">Contratou um produto</p><p className="text-xs font-semibold text-[#FD5F31]">+300 bônus</p></div>
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
    ["Quem pode usar?", "Todos os clientes cadastrados no Pode Já."],
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
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#D94E28_0%,rgba(232,89,10,0.7)_50%,rgba(232,89,10,0)_100%)]" />
            <div className="relative flex min-h-[200px] flex-col justify-end px-5 pb-5 pt-[72px]">
              <p className="pb-1 text-xs font-semibold uppercase tracking-[0.025em] text-white/75">seubônus</p>
              <h2 className="max-w-[280px] pb-2 text-2xl font-bold leading-[30px]">Ganhe moedas com suas ações no app</h2>
              <p className="text-sm leading-5 text-white/85">Quanto mais usa, mais ganha</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground">
            <Coins size={12} className="text-[#FD5F31]" />Ganhe usando o app
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-foreground">
            <Gift size={12} className="text-[#FD5F31]" />Troque por vantagens
          </div>
        </div>

        <Card className="border-border bg-white shadow-sm rounded-[14px]">
          <CardContent className="space-y-3 p-4">
            <h3 className="text-sm font-semibold leading-5 text-foreground">Como ganhar moedas</h3>
            <div className="flex flex-wrap gap-3">
              {itens.slice(0, 6).map((item) => (
                <div key={item.nome} className="flex min-w-[240px] flex-1 items-start gap-2 rounded-lg border border-border bg-white p-3 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#FD5F31]">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-4 text-foreground">{item.nome}</p>
                    <p className="text-xs font-semibold leading-4 text-[#FD5F31]">{item.valor}</p>
                  </div>
                </div>
              ))}

              <div className="relative flex w-full items-start gap-2 rounded-lg border border-border bg-white p-3 shadow-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#FD5F31]"><Users size={20} /></div>
                <div className="min-w-0 flex-1 pr-[132px]">
                  <p className="text-xs font-medium leading-4 text-foreground">Indicar um amigo</p>
                  <div className="mt-1 flex flex-wrap gap-4">
                    <p className="text-[11px] leading-4 text-[#78716C]">Se cadastrou <span className="font-semibold text-[#FD5F31]">+200 moedas</span></p>
                    <p className="text-[11px] leading-4 text-[#78716C]">Contratou um produto <span className="font-semibold text-[#FD5F31]">+300 bônus</span></p>
                  </div>
                </div>
                <Button className="absolute right-3 top-1/2 h-8 -translate-y-1/2 rounded-xl bg-[#FD5F31] px-3 text-xs font-semibold text-white hover:bg-[#D94E28]">
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
          <Button className="h-11 w-full rounded-xl bg-[#FD5F31] text-white hover:bg-[#D94E28]" onClick={() => navigate("/seubolso")}>
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
        <Card className="border-0 bg-[#FFF3EE] shadow-sm"><CardContent className="flex items-start gap-3 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#FD5F31]"><Gift size={18} /></div><div><p className="text-sm font-semibold text-[#D94E28]">Em breve</p><p className="mt-0.5 text-xs text-[#D94E28]/80">Novidades chegando. Você será notificado quando o resgate estiver disponível.</p></div></CardContent></Card>
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
  // Dado sensível — não persistir em localStorage. Usar sessionStorage apenas durante o onboarding.
  const [nascimento, setNascimento] = useState("");
  const [nascimentoErro, setNascimentoErro] = useState<string | undefined>();
  const [mfaCode, setMfaCode] = useState("");
  const [mfaErro, setMfaErro] = useState<string | null>(null);
  const [mfaCountdown, setMfaCountdown] = useState(0);
  const [necessidades, setNecessidades] = useState<string[]>([]);
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [biometriaSheetOpen, setBiometriaSheetOpen] = useState(false);
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
  const phoneMascarado = (() => {
    const d = phone.replace(/\D/g, "");
    return d.length >= 6 ? `+55 (${d.slice(0, 2)}) •••••-${d.slice(-4)}` : "o número cadastrado";
  })();

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
    if (step === 2) return isValidCpf(cpf) && isAdultBirthDate(nascimento);
    if (step === 4) return pin.length === 6 && !isWeakNumericPin(pin);
    return true;
  }, [step, name, email, phone, cpf, nascimento, pin]);

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
    setNecessidades([]);
    setBiometriaSheetOpen(false);
    setStoredUser(null);
    setLoginCpf("");
    setLoginSenha("");
    setShowLoginSenha(false);
    setOtpChannel(null);
    setOtpCode("");
    setLoginStep(1);
    setOtpCountdown(30);
    if (typeof window !== "undefined") window.localStorage.removeItem("podeja_user");
    navigate("/");
  };

  const completeOnboarding = () => {
    const user = { name, email };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("podeja_user", JSON.stringify(user));
      window.localStorage.setItem("podeja_necessidades", JSON.stringify(necessidades));
    }
    // TODO: enviar necessidades ao backend junto com os demais dados do cadastro
    setStoredUser(user);
  };

  useEffect(() => {
    const protectedPaths = ["/painel", "/minha-conta", "/contratos", "/duvidas", "/notificacoes", "/contratos/seguro-001", "/contratos/clt-001", "/contratos/fgts-001", "/seubolso", "/seubolso/como-funciona", "/seubolso/historico", "/assistencias", "/energia"];
    if (!protectedPaths.includes(location.pathname)) return;
    const user = getStoredUser();
    if (!user) navigate("/boas-vindas", { replace: true });
    else setStoredUser(user);
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!(location.pathname === "/acesso" && loginStep === 3)) return;
    const notifyTimer = window.setTimeout(() => {
      toast("Pode Já", {
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

  // Countdown de reenvio do MFA SMS do onboarding (step 3) — isolado do otpCountdown do login
  useEffect(() => {
    if (mfaCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setMfaCountdown((prev) => {
        if (prev <= 1) { window.clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mfaCountdown]);

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
    if (step === 1) {
      localStorage.setItem("podeja_termos_aceitos", "true");
      localStorage.setItem("podeja_termos_aceitos_em", new Date().toISOString());
      // TODO: registrar aceite no backend com timestamp, IP e user_id
      setStep(2);
      return;
    }
    if (step === 2) {
      // TODO: enviar ao backend junto com os demais dados do cadastro
      sessionStorage.setItem("onboarding_nascimento", nascimento);
      setMfaCountdown(30);
      setStep(3);
      return;
    }
    if (step === 3) {
      const CODIGO_VALIDO = "123456"; // TODO: substituir por validação real via API
      if (mfaCode.length !== 6) {
        setMfaErro("Digite o código de 6 dígitos.");
        return;
      }
      if (mfaCode !== CODIGO_VALIDO) {
        setMfaErro("Código inválido. Verifique e tente novamente.");
        setMfaCode("");
        return;
      }
      localStorage.setItem("podeja_telefone_validado", "true");
      setMfaErro(null);
      setStep(4);
      return;
    }
    if (step === 5) {
      if (necessidades.length === 0) return; // validação
      completeOnboarding();
      setBiometriaSheetOpen(true); // abre sheet em vez de navegar direto
      return;
    }
    setStep((prev) => prev + 1);
  };

  const toggleNecessidade = (id: string) => {
    setNecessidades((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  };

  const goBack = () => {
    setDirection(-1);
    if (step === 1) {
      navigate("/boas-vindas");
      return;
    }
    setStep((prev) => prev - 1);
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

  // DESIGN ONLY — preferência de biometria salva no onboarding (mock, sem WebAuthn/FaceID/TouchID real)
  const biometriaAtiva = localStorage.getItem("podeja_biometria_ativa") === "true";
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Oferece biometria assim que o cliente chega na tela de login, se o dispositivo simulado suporta e o usuário já ativou
  const [biometriaLoginOpen, setBiometriaLoginOpen] = useState(false);
  useEffect(() => {
    if (location.pathname === "/acesso" && loginStep === 1 && biometriaAtiva) {
      setBiometriaLoginOpen(true);
    }
  }, [location.pathname, loginStep, biometriaAtiva]);

  const autenticarComBiometria = () => {
    // TODO: acionar WebAuthn / FaceID / TouchID real
    // Mock: simula autenticação bem-sucedida após 1s
    setTimeout(() => {
      const user = getStoredUser() ?? { name: "Usuário", email: "" };
      localStorage.setItem("podeja_user", JSON.stringify(user));
      navigate("/painel");
    }, 1000);
  };

  const biometriaLoginBody = (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE]">
          <Fingerprint size={32} className="text-[#FD5F31]" />
        </div>
        {isDesktop ? (
          <DialogTitle>Entrar com biometria</DialogTitle>
        ) : (
          <DrawerTitle>Entrar com biometria</DrawerTitle>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use sua digital ou reconhecimento facial para entrar no Pode Já sem digitar sua senha.
        </p>
      </div>
      <div className="space-y-2 pt-5">
        <button
          type="button"
          onClick={() => {
            setBiometriaLoginOpen(false);
            autenticarComBiometria();
          }}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white"
        >
          Usar biometria
        </button>
        <button
          type="button"
          onClick={() => setBiometriaLoginOpen(false)}
          className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground underline"
        >
          Entrar com CPF e senha
        </button>
      </div>
    </>
  );

  const BiometriaLoginOverlay = isDesktop ? (
    <Dialog open={biometriaLoginOpen} onOpenChange={setBiometriaLoginOpen}>
      <DialogContent className="max-w-sm">{biometriaLoginBody}</DialogContent>
    </Dialog>
  ) : (
    <Drawer open={biometriaLoginOpen} onOpenChange={setBiometriaLoginOpen}>
      <DrawerContent>{biometriaLoginBody}</DrawerContent>
    </Drawer>
  );

  const LoginScreen = (
    <>
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
              {loginLockedSeconds > 0 ? <p className="text-xs text-[#D94E28]">Conta temporariamente bloqueada. Tente novamente em {loginLockedSeconds}s.</p> : null}

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
                    if (typeof window !== "undefined") window.localStorage.setItem("podeja_user", JSON.stringify(user));
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
    {BiometriaLoginOverlay}
    </>
  );

  {/* ── Oferta de biometria — exibida após concluir o step 5 (necessidades) do onboarding ──
      Biometria é mock: preferência salva em localStorage, sem integração real com FaceID/TouchID/WebAuthn
      Regra do app: Dialog (shadcn) no desktop, Drawer (shadcn/vaul) no mobile */}
  const biometriaOfferBody = (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE]">
          <Fingerprint size={32} className="text-[#FD5F31]" />
        </div>
        {isDesktop ? (
          <DialogTitle>Entre mais rápido com biometria</DialogTitle>
        ) : (
          <DrawerTitle>Entre mais rápido com biometria</DrawerTitle>
        )}
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use sua digital ou reconhecimento facial para acessar o Pode Já sem digitar senha.
        </p>
      </div>
      <div className="space-y-2 pt-5">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("podeja_biometria_ativa", "true");
            // TODO: integrar com WebAuthn / FaceID / TouchID real
            setBiometriaSheetOpen(false);
            navigate("/painel");
          }}
          className="flex h-14 w-full items-center justify-center rounded-full bg-[#FD5F31] text-base font-semibold text-white"
        >
          Ativar biometria
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("podeja_biometria_ativa", "false");
            setBiometriaSheetOpen(false);
            navigate("/painel");
          }}
          className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground underline"
        >
          Agora não
        </button>
      </div>
    </>
  );

  const BiometriaOfferOverlay = isDesktop ? (
    <Dialog open={biometriaSheetOpen} onOpenChange={setBiometriaSheetOpen}>
      <DialogContent className="max-w-sm">{biometriaOfferBody}</DialogContent>
    </Dialog>
  ) : (
    <Drawer open={biometriaSheetOpen} onOpenChange={setBiometriaSheetOpen}>
      <DrawerContent>{biometriaOfferBody}</DrawerContent>
    </Drawer>
  );

  const renderOnboarding = (
    <main className="mx-auto min-h-screen w-full bg-background px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full flex-col md:w-[860px] md:pt-12">
        <div className="mb-5 flex items-center justify-between">
          <Logo size="sm" />
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
                  <Card className="border-border shadow-sm">
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">CPF</Label>
                        <IMaskInput mask="000.000.000-00" value={cpf} onAccept={(value) => setCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} />
                        {cpf.replace(/\D/g,"").length===11 && !isValidCpf(cpf) ? <p className="text-xs text-red-600">CPF inválido. Verifique o número e tente novamente.</p> : <p className="text-xs text-muted-foreground">Nenhum dado é compartilhado sem sua autorização.</p>}
                      </div>
                      {/* Dado sensível — não persistir em localStorage. Usar sessionStorage apenas durante o onboarding. */}
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium">Data de nascimento</Label>
                        <IMaskInput
                          mask="00/00/0000"
                          value={nascimento}
                          onAccept={(v) => {
                            const val = String(v);
                            setNascimento(val);
                            if (val.replace(/\D/g, "").length === 8) {
                              if (!isAdultBirthDate(val)) {
                                setNascimentoErro(
                                  /^\d{2}\/\d{2}\/\d{4}$/.test(val) ? "Você precisa ter pelo menos 18 anos" : "Data inválida"
                                );
                              } else {
                                setNascimentoErro(undefined);
                              }
                            } else {
                              setNascimentoErro(undefined);
                            }
                          }}
                          placeholder="DD/MM/AAAA"
                          inputMode="numeric"
                          className={maskedInputClass}
                        />
                        {nascimentoErro && <p className="text-xs text-red-600">{nascimentoErro}</p>}
                      </div>
                      <SecurityStrip />
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ── Step 3 — MFA SMS ── */}
              {step === 3 && (
                <>
                  <StepHeader
                    step={3}
                    total={totalSteps}
                    title="Confirme seu telefone"
                    subtitle={`Enviamos um código por SMS para ${phoneMascarado}`}
                  />
                  <Card className="border-border shadow-sm">
                    <CardContent className="space-y-4 pt-5">
                      {/* InputOTP — reutilizado do padrão do login */}
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={mfaCode} onChange={(v) => { setMfaCode(v); if (mfaErro) setMfaErro(null); }}>
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
                      {/* Erro inline */}
                      {mfaErro && (
                        <p className="text-center text-sm text-red-500">{mfaErro}</p>
                      )}
                      {/* Reenviar código com countdown */}
                      <div className="text-center">
                        {mfaCountdown > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Reenviar em <span className="font-semibold">{mfaCountdown}s</span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMfaCountdown(30);
                              setMfaCode("");
                              setMfaErro(null);
                              // TODO: acionar reenvio de SMS via API
                              toast(`Código reenviado para ${phoneMascarado}.`);
                            }}
                            className="text-sm font-semibold text-[#FD5F31] underline"
                          >
                            Reenviar código
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ── Step 4 — Senha (PIN) ── */}
              {step === 4 && (
                <>
                  <StepHeader step={4} total={totalSteps} title="Crie sua senha de acesso" subtitle="Vai ser usada para entrar no app." />
                  <Card className="border-border shadow-sm">
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-1.5"><Label className="text-sm font-medium">Senha numérica (6 dígitos)</Label><Input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="h-12 rounded-xl text-center text-lg tracking-[0.5em]" />{pin.length===6 && isWeakNumericPin(pin) ? <p className="text-xs text-red-600">Evite sequências como 123456 ou números repetidos.</p> : null}</div>
                      <ul className="space-y-1.5">{["Não use sequências (123456)", "Não use sua data de nascimento", "Guarde essa senha em um lugar seguro"].map((rule) => <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />{rule}</li>)}</ul>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ── Step 5 — Necessidades ── */}
              {step === 5 && (
                <div className="flex flex-col gap-6 px-4 py-6">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">O que é importante pra você nesse momento?</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Escolha tudo que faz sentido para você. Você pode mudar isso depois.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {NECESSIDADES.map((item) => {
                      const selecionado = necessidades.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleNecessidade(item.id)}
                          className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                            selecionado
                              ? "border-[#FD5F31] bg-[#FFF3EE]"
                              : "border-border bg-white hover:border-[#FD5F31]/40"
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                              selecionado ? "bg-[#FD5F31] text-white" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <item.icon size={22} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.titulo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.subtitulo}</p>
                          </div>
                          {selecionado && (
                            <CheckCircle size={20} className="ml-auto shrink-0 text-[#FD5F31]" weight="fill" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {step === 1 && (
          <p className="pt-6 text-center text-xs leading-relaxed text-muted-foreground px-4">
            Ao continuar, você aceita os{" "}
            <button type="button" onClick={() => setMostrarTermos(true)} className="font-semibold text-foreground underline">
              Termos de Uso
            </button>
            {" "}e a{" "}
            <button type="button" onClick={() => setMostrarTermos(true)} className="font-semibold text-foreground underline">
              Política de Privacidade
            </button>
          </p>
        )}

        {step <= 5 && (
          <div className="grid grid-cols-2 gap-3 pt-3">
            <Button variant="outline" onClick={goBack} className="h-12 rounded-xl border-border text-foreground">Voltar</Button>
            <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}>
              <Button onClick={goNext} disabled={step === 5 ? necessidades.length === 0 : !canGoNext} className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40">Continuar</Button>
            </motion.div>
          </div>
        )}
      </div>

      {BiometriaOfferOverlay}

      <TermosModal aberto={mostrarTermos} onFechar={() => setMostrarTermos(false)} />
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
          {recoveryLockedSeconds > 0 ? <p className="text-xs text-[#D94E28]">Muitas tentativas. Aguarde {recoveryLockedSeconds}s para tentar novamente.</p> : null}

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
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0F0F0]">
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

  // DESIGN ONLY — estados controlados por query params
  // TODO: substituir por dados reais da API antes do deploy
  const [searchParams] = useSearchParams();
  // DESIGN ONLY — default "oferta" para visualização da dashboard no ambiente de design
  // TODO: substituir por estado real da API antes do deploy
  const cltStatus = (searchParams.get("clt") ?? "oferta") as
    | "none"
    | "consultando"
    | "oferta"
    | "contrato"
    | "consulta_liberada";

  // DESIGN ONLY — ?clt=consulta_liberada ativa o card "Consulta concluída" no "Para você agora"
  // Card some quando o usuário avança para a revisão (escolheu uma oferta) ou o contrato é desembolsado
  // TODO: remover localStorage quando API disponibilizar status real
  const cltConsultaTimestamp = localStorage.getItem("podeja_clt_consulta_ts");
  const mostrarCltConsultaLiberada = cltStatus === "consulta_liberada" || cltConsultaTimestamp !== null;
  if (cltStatus === "consulta_liberada" && !cltConsultaTimestamp) {
    localStorage.setItem("podeja_clt_consulta_ts", String(Date.now()));
  }

  // DESIGN ONLY — ?fgts=none|autorizado|contrato — estado do card FGTS na home
  // TODO: substituir por estado real da API antes do deploy
  const fgtsStatus = (searchParams.get("fgts") ?? "none") as "none" | "autorizado" | "contrato";

  // DESIGN ONLY — ?cp=disponivel|andamento|ativo|assinatura_pendente|contrato_novo — estado do card Crédito Pessoal na home
  // TODO: substituir por estado real da API antes do deploy
  const cpStatus = (searchParams.get("cp") ?? "disponivel") as "disponivel" | "andamento" | "ativo" | "assinatura_pendente" | "contrato_novo"; // DESIGN ONLY

  // DESIGN ONLY — flag gravada quando usuário solicita notificação na tela de análise demorada
  // TODO: substituir por estado real da API (polling de elegibilidade concluída)
  const cpOfertaPronta = localStorage.getItem("cp_oferta_pronta") === "true"; // DESIGN ONLY
  // DESIGN ONLY — flag gravada quando video call do CP-E13 está disponível
  // TODO: substituir por estado real da API (webhook/push de disponibilidade do link)
  const cpVideoDisponivel = localStorage.getItem("cp_video_disponivel") === "true"; // DESIGN ONLY

  // DESIGN ONLY — ?cp=contrato_novo ativa o card "Contrato ativo" no "Para você agora" por até 2 dias
  // TODO: em produção, gravar timestamp quando status da proposta mudar para DESEMBOLSO_CONCLUIDO
  const TIMEOUT_CONTRATO_NOVO_MS = 2 * 24 * 60 * 60 * 1000; // 2 dias
  const contratoNovoTimestamp = localStorage.getItem("podeja_contrato_novo_ts"); // DESIGN ONLY
  const mostrarContratoNovo =
    cpStatus === "contrato_novo" ||
    (contratoNovoTimestamp !== null && Date.now() - Number(contratoNovoTimestamp) < TIMEOUT_CONTRATO_NOVO_MS); // DESIGN ONLY
  if (cpStatus === "contrato_novo" && !contratoNovoTimestamp) {
    localStorage.setItem("podeja_contrato_novo_ts", String(Date.now())); // DESIGN ONLY
  }
  // Card do produto sempre igual — status afeta apenas o "Para você agora"
  const fgtsHighlight = "Receba seu saldo em até 15 minutos";
  const fgtsCta = "Antecipar agora";
  const fgtsPath = "/fgts";

  // Título "Para você agora" só aparece quando pelo menos 1 dos cards abaixo está ativo
  // FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o false && para reativar.
  const temCardParaVoceAgora =
    mostrarCltConsultaLiberada ||
    (false && fgtsStatus === "autorizado") ||
    (false && fgtsStatus === "contrato") ||
    cpOfertaPronta ||
    cpVideoDisponivel ||
    cpStatus === "assinatura_pendente" ||
    mostrarContratoNovo;

  const cltHighlight =
    cltStatus === "consultando"
      ? "Consultando sua oferta..."
      : cltStatus === "contrato"
        ? "Parcela de R$ 533,65 · vence em 12 dias"
        : cltStatus === "consulta_liberada"
          ? "Suas ofertas estão prontas"
          : "Descubra quanto você pode ter"; // none e oferta: mesmo highlight padrão

  const cltCta =
    cltStatus === "none"
      ? "Consultar agora"
      : cltStatus === "consultando"
        ? "Ver status"
        : cltStatus === "oferta"
          ? "Consultar agora"
          : cltStatus === "consulta_liberada"
            ? "Ver ofertas"
            : "Ver contrato"; // contrato

  // none | consultando | oferta → sempre a página de introdução do produto primeiro
  const cltPath =
    cltStatus === "contrato"
      ? "/contratos"
      : cltStatus === "consulta_liberada"
        ? "/consignado-clt/ofertas"
        : "/consignado-clt";

  const HomeScreen = (
    <div className="min-h-screen w-full md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <Logo size="md" className="mb-8 self-start" />
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
        <header className="relative z-10 rounded-b-[32px] bg-gradient-to-b from-[#FD5F31] to-[#FA9832] px-5 pb-6 pt-8 text-white md:mx-auto md:max-w-[860px] md:px-6 md:pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/75">Olá, {firstName}</p>
              <h2 className="text-xl font-bold">Seu crédito na Pode Já.</h2>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60"><SealCheck size={12} /> Conta verificada</p>
            </div>
            <div className="flex items-center gap-1">
              <PrivacyToggle variant="light" />
              <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 transition-colors hover:bg-white/25">
                <Bell size={20} className="text-white" />
                {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-[#FD5F31]">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
              </button>
            </div>
          </div>
          {/* Título só aparece quando há pelo menos 1 card ativo — caso contrário, mostra o carrossel de recomendações */}
          {temCardParaVoceAgora ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">Para você agora</p>
              <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>

                {/* Card "Consulta CLT concluída" — exibido quando ?clt=consulta_liberada (ou enquanto persistir no localStorage)
                    DESIGN ONLY — some quando o usuário entra em /consignado-clt/revisao
                    TODO: remover localStorage quando API disponibilizar status real */}
                {mostrarCltConsultaLiberada && (
                  <div className="w-[220px] shrink-0 rounded-xl bg-white/95 p-4 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle size={16} className="text-green-600" weight="fill" />
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                        Consulta concluída
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      Suas ofertas de Crédito Consignado CLT estão prontas
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/consignado-clt/ofertas")}
                      className="flex items-center gap-1 text-xs font-semibold text-[#FD5F31]"
                    >
                      Ver minhas ofertas <CaretRight size={12} />
                    </button>
                  </div>
                )}

                {/* DESIGN ONLY — card FGTS no "Para você agora" quando fgts=autorizado ou fgts=contrato
                    TODO: controlar por estado real da API BMP
                    FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o false && para reativar. */}
                {false && fgtsStatus === "autorizado" && (
                  <button
                    type="button"
                    onClick={() => navigate("/fgts/simular")}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">
                          <Coins size={20} />
                        </div>
                        {/* TODO: receber saldo da API BMP */}
                        <p className="text-sm font-semibold text-foreground">Seu saldo FGTS está disponível!</p>
                        <p className="mt-1 text-xs text-muted-foreground">Você tem R$ 5.841,09 para antecipar. Simule agora e receba em minutos.</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                        Simular agora <CaretRight size={12} />
                      </div>
                    </div>
                  </button>
                )}
                {/* FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o false && para reativar. */}
                {false && fgtsStatus === "contrato" && (
                  <button
                    type="button"
                    onClick={() => navigate("/contratos/fgts-001")}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">
                          <CalendarCheck size={20} />
                        </div>
                        {/* TODO: receber data e valor da API BMP */}
                        <p className="text-sm font-semibold text-foreground">Próxima parcela FGTS em setembro</p>
                        <p className="mt-1 text-xs text-muted-foreground">Seu saldo de R$ 4.703,82 será descontado automaticamente.</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                        Ver contrato <CaretRight size={12} />
                      </div>
                    </div>
                  </button>
                )}

                {/* Card "Sua oferta está pronta" — exibido quando análise de elegibilidade concluiu em background
                    DESIGN ONLY — ativado via localStorage "cp_oferta_pronta"
                    TODO: substituir por estado real da API */}
                {cpOfertaPronta && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("cp_oferta_pronta"); // DESIGN ONLY
                      navigate("/credito-pessoal/simulador");
                    }}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <CheckCircle size={20} weight="fill" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Sua oferta está pronta!</p>
                        <p className="mt-1 text-xs text-muted-foreground">Sua análise de crédito foi concluída. Veja sua oferta agora.</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                        Ver minha oferta <CaretRight size={12} />
                      </div>
                    </div>
                  </button>
                )}

                {/* Card "Chamada agendada" — exibido quando link de vídeo do CP-E13 está disponível
                    DESIGN ONLY — ativado via localStorage "cp_video_disponivel"
                    TODO: substituir por estado real da API */}
                {cpVideoDisponivel && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("cp_video_disponivel"); // DESIGN ONLY
                      navigate("/credito-pessoal/pendente?tipo=video");
                    }}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <VideoCamera size={20} weight="fill" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Chamada agendada!</p>
                        <p className="mt-1 text-xs text-muted-foreground">O link da verificação por vídeo com a Zema está disponível.</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                        Acessar chamada <CaretRight size={12} />
                      </div>
                    </div>
                  </button>
                )}

                {/* Card "Proposta aguardando assinatura" — exibido quando ?cp=assinatura_pendente
                    DESIGN ONLY — substitui o card padrão de ?cp=andamento
                    Clicar no corpo do card navega para a tela de assinatura; clicar em "Reenviar SMS" apenas reenvia (sem navegar)
                    TODO: acionar reenvio real do SMS via API quando disponível */}
                {cpStatus === "assinatura_pendente" && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/credito-pessoal/assinatura?status=aguardando")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate("/credito-pessoal/assinatura?status=aguardando");
                    }}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] cursor-pointer rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                          <Signature size={20} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Você tem uma proposta aguardando assinatura</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast("Reenvio solicitado.");
                        }}
                        className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]"
                      >
                        Reenviar SMS <CaretRight size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Card "Contrato recém-aprovado" — exibido quando ?cp=contrato_novo, some após 2 dias
                    DESIGN ONLY — timestamp gravado em "podeja_contrato_novo_ts"
                    TODO: em produção, gravar timestamp quando status da proposta mudar para DESEMBOLSO_CONCLUIDO
                    TODO: em produção, remover timestamp quando usuário visualizar o contrato ou após 2 dias */}
                {mostrarContratoNovo && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("podeja_contrato_novo_ts"); // DESIGN ONLY
                      navigate("/credito-pessoal/contrato/mock");
                    }}
                    className="min-h-[120px] w-[220px] min-w-[220px] max-w-[220px] rounded-xl border-0 bg-white/95 text-left shadow-sm"
                  >
                    <div className="flex h-full flex-col justify-between p-4">
                      <div>
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <CheckCircle size={20} weight="fill" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Seu contrato do Crédito Pessoal está ativo!</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#FD5F31]">
                        Ver contrato <CaretRight size={12} />
                      </div>
                    </div>
                  </button>
                )}

              </div>
            </div>
          ) : (
            <RecomendacoesCarousel variant="light" />
          )}
        </header>

        <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
          <div className="md:mx-auto md:max-w-[860px] md:space-y-3">
            <motion.div variants={cardsContainerVariants} initial="initial" animate="animate" className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {/* FGTS OCULTO TEMPORARIAMENTE — produto em pausa. Remover o "|| false" do .filter abaixo para reativar. */}
              {([
                "clt",
                "fgts",
                "credito-pessoal",
                "assistencias",
                "energia",
                "seguro",
              ] as const)
                .filter((interest) => interest !== "fgts" || false)
                .map((interest) => {
                // DESIGN ONLY — estado do card Crédito Pessoal varia por ?cp=
                const cpHighlight =
                  cpStatus === "andamento" || cpStatus === "assinatura_pendente"
                    ? "Proposta em andamento" // DESIGN ONLY
                    : cpStatus === "ativo" || cpStatus === "contrato_novo"
                    ? "Contrato ativo" // DESIGN ONLY
                    : "Dinheiro na conta em minutos"; // disponivel (default)
                const cpCta =
                  cpStatus === "assinatura_pendente"
                    ? "Assinar agora" // DESIGN ONLY
                    : cpStatus === "andamento"
                    ? "Acompanhar" // DESIGN ONLY
                    : cpStatus === "ativo" || cpStatus === "contrato_novo"
                    ? "Ver contrato" // DESIGN ONLY
                    : "Simular agora";
                const cpPath =
                  cpStatus === "assinatura_pendente"
                    ? "/credito-pessoal/assinatura?status=aguardando" // DESIGN ONLY
                    : cpStatus === "andamento"
                    ? "/credito-pessoal/assinatura" // DESIGN ONLY
                    : cpStatus === "ativo" || cpStatus === "contrato_novo"
                    ? "/credito-pessoal/contrato/mock" // DESIGN ONLY
                    : "/credito-pessoal";

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
                        title: "Assistências Pode Já.",
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
                    : interest === "credito-pessoal"
                    ? {
                        title: "Crédito Pessoal",
                        subtitle: "Dinheiro na conta em minutos",
                        description: "Sem precisar de FGTS ou desconto em folha.",
                        cta: cpCta,
                        icon: <Money size={20} />,
                        // DESIGN ONLY — ?cp=ativo usa cor verde via override abaixo
                        highlight: cpHighlight,
                        photo: "/images/card-dash-clt.png",
                      }
                    : interest === "clt"
                    ? { ...serviceCopy.clt, highlight: cltHighlight, cta: cltCta }
                    : interest === "fgts"
                    ? { ...serviceCopy.fgts, highlight: fgtsHighlight, cta: fgtsCta }
                    : serviceCopy[interest as ServiceType];
                return (
                  <motion.div key={interest} variants={cardVariants}>
                    <Card className="relative overflow-hidden rounded-2xl border border-[#DADADA] bg-white shadow-sm">
                      <CardContent className="flex min-h-[158px] items-stretch p-0">
                        <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-4">
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EE] text-[#FD5F31]">{currentService.icon}</div>
                              <p className="line-clamp-2 text-[16px] font-semibold leading-tight text-foreground">{currentService.title}</p>
                            </div>
                            {currentService.highlight ? (
                              <p className={`mb-2 font-semibold text-[14px] ${
                                interest === "clt" && cltStatus === "consultando" ? "text-[16px]" : ""
                              } ${
                                // DESIGN ONLY — ?cp=ativo|contrato_novo → highlight verde
                                interest === "credito-pessoal" && (cpStatus === "ativo" || cpStatus === "contrato_novo") ? "text-[#16A34A]" : "text-[#FD5F31]"
                              }`}>{currentService.highlight}</p>
                            ) : null}
                            {!(interest === "clt" && (cltStatus === "consultando" || cltStatus === "contrato")) && (
                              <p className="mb-3 line-clamp-2 text-[14px] leading-snug text-muted-foreground">{currentService.description}</p>
                            )}
                          </div>
                          <button onClick={() => {
                            if (interest === "clt") navigate(cltPath);
                            else if (interest === "fgts") navigate(fgtsPath);
                            else if (interest === "credito-pessoal") navigate(cpPath);
                            else if (interest === "assistencias") navigate("/assistencias");
                            else if (interest === "energia") navigate("/energia");
                          }} className="inline-flex w-fit items-center text-[16px] font-semibold text-[#FD5F31]">
                            {currentService.cta} <CaretRight size={14} className="ml-1" />
                          </button>
                        </div>
                        <div className="w-36 shrink-0 overflow-hidden bg-transparent">
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
                    <img src="/images/card-dash-contact.png" alt="Atendente Pode Já." className="absolute inset-0 h-full w-full object-cover object-top" />
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
        <Logo size="md" className="mb-8 self-start" />
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
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-white px-4 py-4 md:px-8">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="flex-1 text-base font-semibold text-foreground">Minha conta</h1>
          <PrivacyToggle size={18} variant="dark" />
          <button onClick={() => navigate("/notificacoes")} className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-[#F0F0F0]">
            <Bell size={18} className="text-muted-foreground" />
            {naoLidas > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FD5F31] text-[9px] font-bold text-white">{naoLidas > 9 ? "9+" : naoLidas}</span> : null}
          </button>
        </header>

        <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
          <div className="space-y-4 md:mx-auto md:max-w-[860px]">
            {/* Card de perfil */}
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">

                {/* Avatar com iniciais */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#FD5F31] to-[#FA9832]">
                  <span className="text-xl font-bold text-white">
                    {storedUser?.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() ?? "?"}
                  </span>
                </div>

                {/* Nome + badge */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground truncate">
                    {storedUser?.name ?? "Usuário"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {/* Badge de verificação — condicional */}
                    {localStorage.getItem("podeja_telefone_validado") === "true" ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        <CheckCircle size={10} weight="fill" />
                        Conta verificada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        <Clock size={10} />
                        Verificação pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CPF + link "Ver dados" */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3 py-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CPF</p>
                  <SensitiveData
                    value={storedUser?.cpf ?? "123.456.789-00"}
                    type="cpf"
                    // TODO: receber CPF do storedUser quando disponível — hoje hardcoded
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/minha-conta/meus-dados")}
                  className="flex items-center gap-1 text-xs font-semibold text-[#FD5F31]"
                >
                  Ver dados <CaretRight size={12} />
                </button>
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
                  title: "Políticas",
                  icon: <Info size={18} />,
                  items: [
                    { label: "Termos de Uso", action: () => setMostrarTermos(true) },
                    { label: "Política de Privacidade", action: () => setMostrarTermos(true) },
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
                      <button key={item.label} onClick={() => item.action()} className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0">
                        <div className="flex items-center justify-between">
                          {item.label}
                          <CaretRight size={16} className="text-muted-foreground" />
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

      <TermosModal aberto={mostrarTermos} onFechar={() => setMostrarTermos(false)} />
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
                <main className="relative mx-auto flex min-h-screen w-full cursor-pointer flex-col justify-end overflow-hidden md:items-center md:justify-center md:bg-gradient-to-b md:from-[#FD5F31] md:to-[#FA9832]" onClick={() => navigate("/boas-vindas")}>
                  <img src={HERO_IMAGE} alt="Pessoa com carteira assinada" className="absolute inset-0 h-full w-full object-cover object-center md:hidden" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/75 to-transparent md:hidden" />
                  <motion.div initial={shouldReduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: shouldReduce ? 0 : 0.5, ease: [0.4, 0, 0.2, 1] }} className="relative z-10 flex flex-col items-center space-y-4 px-6 pb-14 text-center md:pb-0"><Logo variant="white" size="lg" /><h1 className="text-2xl font-bold leading-tight text-white">Tudo que é seu, finalmente ao seu alcance.</h1><div className="flex items-center gap-3 pt-1"><div className="h-px flex-1 bg-white/20" /><p className="text-xs text-white/50">Toque para começar</p><div className="h-px flex-1 bg-white/20" /></div></motion.div>
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
            <Route path="/contratos/fgts-001" element={getStoredUser() ? <ContratoFGTSPage /> : <Navigate to="/boas-vindas" replace />} />
            {/* TODO(dev): seubolso está em andamento e escondido da navegação pública. */}
            <Route path="/seubolso" element={getStoredUser() ? <SeubolsoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/seubolso/como-funciona" element={getStoredUser() ? <SeubolsoComoFuncionaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/seubolso/historico" element={getStoredUser() ? <SeubolsoHistoricoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/notificacoes" element={getStoredUser() ? <NotificacoesPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/assistencias" element={getStoredUser() ? <AssistenciasPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/energia" element={getStoredUser() ? <EnergiaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal" element={getStoredUser() ? <CreditoPessoalLanding /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/dados" element={getStoredUser() ? <CreditoPessoalDados /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/consultando" element={getStoredUser() ? <CreditoPessoalConsultando /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/inelegivel" element={getStoredUser() ? <CreditoPessoalInelegivel /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/simulador" element={getStoredUser() ? <CreditoPessoalSimulador /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/revisao" element={getStoredUser() ? <CreditoPessoalRevisao /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/dados-tomador" element={getStoredUser() ? <CreditoPessoalDadosTomador /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/conta" element={getStoredUser() ? <CreditoPessoalConta /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/formalizando" element={getStoredUser() ? <CreditoPessoalFormalizando /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/em-analise" element={getStoredUser() ? <CreditoPessoalEmAnalise /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/assinatura" element={getStoredUser() ? <CreditoPessoalAssinatura /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/confirmacao" element={getStoredUser() ? <CreditoPessoalConfirmacao /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/reprovada" element={getStoredUser() ? <CreditoPessoalReprovada /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/pendente" element={getStoredUser() ? <CreditoPessoalPendente /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/credito-pessoal/contrato/:id" element={getStoredUser() ? <CreditoPessoalContratoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/duvidas" element={getStoredUser() ? <ComingSoon title="Dúvidas" /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt" element={getStoredUser() ? <ConsignadoCLTLandingPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/provedores" element={getStoredUser() ? <ConsignadoCLTProvedoresPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/redirecionando/:provedor" element={getStoredUser() ? <ConsignadoCLTRedirecionandoPage /> : <Navigate to="/boas-vindas" replace />} />
            {/* Rota mantida mas fora do fluxo padrão — consulta simultânea legada, superada pelo fluxo provedor a provedor */}
            <Route path="/consignado-clt/loading" element={getStoredUser() ? <ConsignadoCLTLoadingPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/ofertas" element={getStoredUser() ? <ConsignadoCLTOfertasPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/aguardando" element={getStoredUser() ? <ConsignadoCLTAguardandoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/sem-oferta" element={getStoredUser() ? <ConsignadoCLTSemOfertaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/simular" element={getStoredUser() ? <ConsignadoCLTSimuladorPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/revisao" element={getStoredUser() ? <ConsignadoCLTRevisaoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/dados" element={getStoredUser() ? <ConsignadoCLTDadosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/assinar" element={getStoredUser() ? <ConsignadoCLTAssinaturaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/consignado-clt/confirmacao" element={getStoredUser() ? <ConsignadoCLTConfirmacaoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts" element={getStoredUser() ? <FGTSLandingPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/copiloto" element={getStoredUser() ? <FGTSCopilotoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/loading" element={getStoredUser() ? <FGTSLoadingPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/sem-saldo" element={getStoredUser() ? <FGTSSemSaldoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/saldo-disponivel" element={getStoredUser() ? <FGTSSaldoDisponivelPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/simular" element={getStoredUser() ? <FGTSSimuladorPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/revisao" element={getStoredUser() ? <FGTSRevisaoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/dados" element={getStoredUser() ? <FGTSDadosPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/assinar" element={getStoredUser() ? <FGTSAssinaturaPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/fgts/confirmacao" element={getStoredUser() ? <FGTSConfirmacaoPage /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Toaster />
    </>
  );
}

export default App;
