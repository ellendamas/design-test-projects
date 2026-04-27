import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IMaskInput } from "react-imask";
import {
  ArrowRight,
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
  SealCheck,
  ShieldCheck,
  SignOut,
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

type ServiceType = "clt" | "fgts" | "saque-facil";
type OtpChannel = "whatsapp" | "email" | "sms";
type StoredUser = { name: string; email: string };

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
    title: "Credito com desconto em folha",
    subtitle: "Para quem tem carteira assinada",
    description: "Parcelas fixas descontadas direto do seu salario. Sem susto no fim do mes.",
    cta: "Consultar credito CLT",
    icon: <Briefcase size={20} />,
    highlight: "Ate R$ 18.000 disponiveis",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80&fit=crop&crop=face",
  },
  fgts: {
    title: "Antecipar meu FGTS",
    subtitle: "Seu saldo do FGTS disponivel agora",
    description: "Receba em minutos com simulacao clara e sem burocracia.",
    cta: "Simular antecipacao",
    icon: <Bank size={20} />,
    highlight: "Taxa a partir de 1,39% a.m.",
    photo:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&q=80&fit=crop&crop=face",
  },
  "saque-facil": {
    title: "Saque Facil no cartao",
    subtitle: "Saque com limite do seu cartao",
    description: "Use o limite do seu cartao de credito. Aprovacao rapida.",
    cta: "Ver oferta",
    icon: <CreditCard size={20} />,
    highlight: "Aprovacao em minutos",
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
  const masked = {
    cpf: "•••.•••.•••-••",
    phone: "(••) •••••-••••",
    currency: "R$ ••••",
    text: "••••••••",
  }[type];

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium text-foreground">{visible ? value : masked}</span>
      <button onClick={() => setVisible((v) => !v)} className="text-muted-foreground transition-colors hover:text-foreground" aria-label={visible ? "Ocultar" : "Mostrar"}>
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
      {themes.map((t) => (
        <button
          key={t.key}
          onClick={() => document.documentElement.setAttribute("data-theme", t.key)}
          className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
          style={{ background: t.color }}
          title={t.key}
        />
      ))}
    </div>
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
        <p className="text-sm text-muted-foreground">Esta secao esta em desenvolvimento. Em breve disponivel.</p>
        <Button variant="outline" className="rounded-xl border-border" onClick={() => navigate("/painel")}>Voltar para o inicio</Button>
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

  const firstName = (storedUser?.name || name || "voce").split(" ")[0] || "voce";
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

  useEffect(() => {
    if (!(location.pathname === "/acesso" && loginStep === 3)) return;

    const notifyTimer = window.setTimeout(() => {
      toast("seutudo.", {
        description:
          otpChannel === "whatsapp"
            ? "Seu codigo de verificacao chegou no WhatsApp."
            : otpChannel === "email"
              ? "Seu codigo de verificacao chegou no e-mail."
              : "Seu codigo de verificacao chegou por SMS.",
        icon: <ShieldCheck size={16} className="text-primary" />,
        duration: 4000,
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "white",
          border: "0.5px solid #E7E5E4",
          fontSize: "13px",
        },
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
    if (location.pathname === "/painel" || location.pathname === "/minha-conta" || location.pathname === "/contratos" || location.pathname === "/duvidas") {
      const user = getStoredUser();
      if (!user) {
        navigate("/boas-vindas", { replace: true });
      } else {
        setStoredUser(user);
      }
    }
  }, [location.pathname, navigate]);

  const completeOnboarding = () => {
    const user = { name, email };
    if (typeof window !== "undefined") window.localStorage.setItem("seutudo_user", JSON.stringify(user));
    setStoredUser(user);
    navigate("/painel");
  };

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

  const renderHomeLayout = (mode: "home" | "account") => (
    <div className="min-h-screen w-full md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-white md:px-6 md:py-8">
        <span className="mb-8 text-xl font-bold text-foreground">seutudo.</span>
        <nav className="flex flex-col gap-1">
          {[{ key: "/painel", icon: <House size={18} />, label: "Inicio" }, { key: "/contratos", icon: <FileText size={18} />, label: "Contratos" }, { key: "/duvidas", icon: <Headset size={18} />, label: "Duvidas" }, { key: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" }].map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location.pathname === item.key ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-background"}`}
            >
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
          <button onClick={resetApp} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"><SignOut size={16} />Sair</button>
        </div>
      </aside>

      <main className="mx-auto min-h-screen w-full bg-background md:mx-0 md:flex-1 md:overflow-y-auto">
        {mode === "home" ? (
          <>
            <header className="relative z-10 rounded-b-[32px] bg-primary px-5 pb-6 pt-8 text-white md:mx-auto md:mt-6 md:max-w-[860px] md:px-6 md:pt-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/75">Ola, {firstName}</p>
                  <h2 className="text-xl font-bold">Seu credito na seutudo.</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/60"><SealCheck size={12} /> Conta verificada</p>
                </div>
                <button className="rounded-full bg-white/15 p-2.5"><Bell size={20} /></button>
              </div>
              <Card className="border-0 bg-white shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Oferta disponivel para voce</p>
                      <p className="text-sm font-bold leading-snug text-foreground">Voce pode antecipar ate <SensitiveData value="R$ 4.800" type="currency" /> no FGTS</p>
                      <p className="text-xs text-muted-foreground">Taxa a partir de 1,39% ao mes</p>
                    </div>
                    <Badge className="shrink-0 border-0 bg-primary-light text-xs text-primary-dark">Novo</Badge>
                  </div>
                  <motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-dark">Ver minha oferta</Button></motion.div>
                </CardContent>
              </Card>
            </header>

            <div className="mt-0 space-y-3 p-4 pb-28 md:px-8 md:pb-8">
              <div className="md:mx-auto md:max-w-[860px] md:space-y-3">
                <motion.div variants={cardsContainerVariants} initial="initial" animate="animate" className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  {interests.map((interest, idx) => {
                    const currentService = serviceCopy[interest];
                    const isPrimary = idx === 0;
                    if (isPrimary) {
                      return (
                        <motion.div key={interest} variants={cardVariants}>
                          <Card className="relative overflow-hidden border-primary/30 shadow-sm">
                            <CardContent className="flex min-h-[140px] items-stretch p-0">
                              <div className="flex flex-1 flex-col justify-between p-4">
                                <div>
                                  <div className="mb-1 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary">{currentService.icon}</div><p className="text-sm font-semibold text-foreground">{currentService.title}</p></div>
                                  {currentService.highlight && <p className="mb-1 text-xs font-semibold text-primary">{currentService.highlight}</p>}
                                  <p className="mb-3 text-xs text-muted-foreground">{currentService.description}</p>
                                </div>
                                <Button className="h-9 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-dark">{currentService.cta} <CaretRight size={14} className="ml-1" /></Button>
                              </div>
                              <div className="relative w-28 shrink-0 overflow-hidden bg-white"><img src={currentService.photo} alt="" className="absolute inset-0 h-full w-full object-cover object-top" style={{ mixBlendMode: "multiply" }} /></div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    }
                    return (
                      <motion.div key={interest} variants={cardVariants}>
                        <Card className="border-border shadow-sm"><CardContent className="p-4"><div className="mb-2 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground">{currentService.icon}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{currentService.title}</p>{currentService.highlight && <p className="mt-0.5 text-xs font-medium text-primary">{currentService.highlight}</p>}</div></div><p className="mb-3 text-xs text-muted-foreground">{currentService.description}</p><Button variant="outline" className="h-9 w-full rounded-lg border-border text-sm font-medium">{currentService.cta}<CaretRight size={14} className="ml-1" /></Button></CardContent></Card>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <Card className="mt-4 border-border shadow-sm"><CardContent className="p-4"><div className="mb-3 flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground"><Headset size={20} /></div><div><p className="text-sm font-semibold text-foreground">Ficou alguma duvida?</p><p className="text-xs text-muted-foreground">Atendimento seg a sex, 8h as 18h</p></div></div><div className="grid grid-cols-2 gap-2"><Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm"><WhatsappLogo size={15} /> WhatsApp</Button><Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm"><Headset size={15} /> Ligar</Button></div></CardContent></Card>

                <div className="flex items-center justify-center gap-5 py-1">{[{ icon: <LockSimple size={13} />, label: "LGPD" }, { icon: <SealCheck size={13} />, label: "Banco Central" }, { icon: <ShieldCheck size={13} />, label: "Criptografado" }].map((item) => <div key={item.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">{item.icon}{item.label}</div>)}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="md:flex md:min-h-screen">
            <div className="relative h-48 overflow-hidden md:h-screen md:w-1/2">
              <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=860&q=80&fit=crop&crop=faces,top" alt="Pessoa CLT" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>
            <div className="flex-1 bg-background pb-28 md:px-8 md:py-10 md:pb-8">
              <header className="sticky top-0 z-10 bg-background px-4 py-4 text-center md:px-0"><h2 className="text-base font-semibold text-foreground">Conta</h2></header>
              <div className="px-4 pb-6 pt-4 md:max-w-[860px] md:px-0">
                <p className="text-lg font-bold uppercase text-foreground">{(storedUser?.name || name || "USUARIO").toUpperCase()}</p>
                <div className="mt-1 flex items-center gap-2"><span className="text-sm text-muted-foreground">CPF</span><SensitiveData value="123.456.789-00" type="cpf" /></div>
              </div>
              <div className="space-y-4 px-4 md:max-w-[860px] md:px-0">
                {[
                  { title: "Conta", icon: <UserCircle size={18} />, items: ["Meus dados", "Editar endereco"] },
                  { title: "Seguranca", icon: <ShieldCheck size={18} />, items: ["Alterar PIN"] },
                  { title: "Configuracoes", icon: <Gear size={18} />, items: ["Avaliar o aplicativo"] },
                  { title: "Informacoes", icon: <Info size={18} />, items: ["Politica de Privacidade", "Termos de Uso"] },
                ].map((group) => (
                  <Card key={group.title} className="border-border shadow-sm"><CardContent className="p-0"><div className="flex items-center gap-2 px-4 py-3"><span className="text-primary">{group.icon}</span><p className="text-sm font-bold text-foreground">{group.title}</p></div>{group.items.map((item) => <button key={item} className="w-full border-b border-border px-4 py-3.5 text-left text-sm text-foreground last:border-0"><div className="flex items-center justify-between">{item}<CaretRight size={16} className="text-muted-foreground" /></div></button>)}</CardContent></Card>
                ))}
                <button onClick={resetApp} className="w-full py-3 text-center text-sm font-medium text-primary">Sair</button>
                <p className="pb-2 text-center text-xs text-muted-foreground">Versao 0.1.0-mvp</p>
              </div>
            </div>
          </div>
        )}

        <nav className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm md:hidden">
          <ul className="grid grid-cols-4 text-center">
            {[{ path: "/painel", icon: <House size={18} />, label: "Inicio" }, { path: "/contratos", icon: <FileText size={18} />, label: "Contratos" }, { path: "/duvidas", icon: <Headset size={18} />, label: "Duvidas" }, { path: "/minha-conta", icon: <UserCircle size={18} />, label: "Conta" }].map((item) => (
              <li key={item.path} className="flex flex-col items-center justify-center">
                <button onClick={() => navigate(item.path)} className={`w-full rounded-xl p-2 text-[11px] ${location.pathname === item.path ? "bg-primary-light text-primary" : "text-muted-foreground"}`}>
                  <span className="mx-auto mb-1 block">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );

  const renderLogin = () => {
    const channels = [
      { key: "whatsapp" as const, icon: <WhatsappLogo size={20} />, label: "WhatsApp", desc: "Recomendado, mais rapido e seguro", badge: "Recomendado" },
      { key: "email" as const, icon: <EnvelopeSimple size={20} />, label: "E-mail", desc: "Enviamos para o e-mail cadastrado" },
      { key: "sms" as const, icon: <ChatCircle size={20} />, label: "SMS", desc: "Mensagem de texto para o celular cadastrado" },
    ];

    const channel = otpChannel ?? "whatsapp";

    return (
      <main className="mx-auto min-h-screen w-full bg-background px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full flex-col md:w-[860px] md:pt-12">
          <div className="mb-5 flex items-center justify-between"><span className="text-lg font-bold text-foreground">seutudo.</span><Badge className="border-0 bg-primary-light text-xs font-medium text-primary-dark">Entrar</Badge></div>
          {loginStep === 1 && (
            <Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">CPF</Label><IMaskInput mask="000.000.000-00" value={loginCpf} onAccept={(value) => setLoginCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} /></div><div className="space-y-1.5"><Label className="text-sm font-medium">Senha</Label><div className="relative"><Input type={showLoginSenha ? "text" : "password"} value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} className="h-12 rounded-xl pr-10" placeholder="Digite sua senha" /><button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowLoginSenha((prev) => !prev)}>{showLoginSenha ? <EyeSlash size={18} /> : <Eye size={18} />}</button></div></div><div className="text-right"><button className="text-xs text-primary">Esqueci minha senha</button></div><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40" disabled={!canContinueLoginStep1} onClick={() => { setOtpChannel("whatsapp"); setLoginStep(2); }}>Continuar</Button></motion.div><Button variant="ghost" className="h-12 w-full text-primary" onClick={() => navigate("/boas-vindas")}>Criar minha conta</Button></CardContent></Card>
          )}

          {loginStep === 2 && (
            <div className="space-y-4"><div><h2 className="text-xl font-bold text-foreground">Como voce quer receber o codigo?</h2><p className="text-sm text-muted-foreground">Vamos confirmar que e voce.</p></div><div className="space-y-2">{channels.map((ch) => { const selected = (otpChannel ?? "whatsapp") === ch.key; return <button key={ch.key} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${selected ? "border-primary bg-primary-light" : "border-border bg-card"}`} onClick={() => setOtpChannel(ch.key)}><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? "bg-primary text-white" : "bg-background text-muted-foreground"}`}>{ch.icon}</div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold text-foreground">{ch.label}</p>{ch.badge && <Badge className="border-0 bg-primary-light text-[10px] text-primary-dark">{ch.badge}</Badge>}</div><p className="text-xs text-muted-foreground">{ch.desc}</p></div></button>; })}</div><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40" disabled={!canSendOtp} onClick={() => { setOtpCode(""); setLoginStep(3); }}>Enviar codigo</Button></motion.div></div>
          )}

          {loginStep === 3 && (
            <div className="space-y-4"><div className="flex justify-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">{channel === "whatsapp" ? <WhatsappLogo size={24} /> : channel === "email" ? <EnvelopeSimple size={24} /> : <ChatCircle size={24} />}</div></div><div className="text-center"><h2 className="text-xl font-bold text-foreground">Digite o codigo</h2><p className="text-sm text-muted-foreground">{channel === "whatsapp" ? "Enviamos um codigo de 6 digitos para o seu WhatsApp." : channel === "email" ? "Enviamos um codigo de 6 digitos para o seu e-mail." : "Enviamos um codigo de 6 digitos por SMS."}</p></div><div className="my-6 flex justify-center"><InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}><InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup></InputOTP></div><SecurityStrip /><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40" disabled={!canConfirmOtp} onClick={() => { const user = getStoredUser() ?? { name: "Usuario", email: "" }; if (typeof window !== "undefined") window.localStorage.setItem("seutudo_user", JSON.stringify(user)); setStoredUser(user); navigate("/painel"); }}>Confirmar</Button></motion.div><div className="text-center text-sm text-primary"><button disabled={otpCountdown > 0} className="disabled:text-muted-foreground" onClick={() => setOtpCountdown(30)}>Nao recebi o codigo, reenviar {otpCountdown > 0 ? `(${otpCountdown}s)` : ""}</button></div></div>
          )}
        </div>
      </main>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Routes location={location}>
            <Route path="/" element={<main className="relative mx-auto flex min-h-screen w-full cursor-pointer flex-col justify-end overflow-hidden md:items-center md:justify-center md:bg-primary" onClick={() => navigate("/boas-vindas")}><img src="https://static.vecteezy.com/ti/fotos-gratis/p1/75899742-o-negocio-mulher-dentro-cidade-feliz-e-retrato-ao-ar-livre-para-trabalhando-em-criativo-carreira-ou-trabalho-face-empreendedor-e-confiante-pessoa-profissional-desenhador-e-empregado-sorrir-em-urbano-telhado-dentro-brasil-foto.jpg" alt="Pessoa com carteira assinada" className="absolute inset-0 h-full w-full object-cover object-center md:hidden" /><div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/75 to-transparent md:hidden" /><motion.div initial={shouldReduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: shouldReduce ? 0 : 0.5, ease: [0.4, 0, 0.2, 1] }} className="relative z-10 space-y-4 px-6 pb-14 md:pb-0 md:text-center"><div><div className="text-3xl font-bold tracking-tight text-white">seutudo.</div><p className="mt-1 text-sm text-white/75">O que e seu, disponivel.</p></div><h1 className="text-2xl font-bold leading-tight text-white">Credito para quem trabalha de carteira assinada.</h1><div className="flex items-center gap-3 pt-1"><div className="h-px flex-1 bg-white/20" /><p className="text-xs text-white/50">Toque para comecar</p><div className="h-px flex-1 bg-white/20" /></div></motion.div><div className="absolute bottom-0 left-0 right-0 h-16 md:hidden"><svg viewBox="0 0 430 64" preserveAspectRatio="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg"><path d="M0,32 C100,64 200,0 300,48 C370,64 400,32 430,40 L430,64 L0,64 Z" fill="rgba(168,61,5,0.4)" /></svg></div></main>} />

            <Route path="/boas-vindas" element={<main className="mx-auto flex min-h-screen w-full flex-col bg-background md:flex-row"><div className="relative h-52 shrink-0 overflow-hidden md:h-screen md:w-1/2"><img src="https://static.vecteezy.com/ti/fotos-gratis/p1/75899742-o-negocio-mulher-dentro-cidade-feliz-e-retrato-ao-ar-livre-para-trabalhando-em-criativo-carreira-ou-trabalho-face-empreendedor-e-confiante-pessoa-profissional-desenhador-e-empregado-sorrir-em-urbano-telhado-dentro-brasil-foto.jpg" alt="Pessoa CLT" className="h-full w-full object-cover object-top" /><div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" /><span className="absolute left-5 top-4 text-xl font-bold text-white drop-shadow">seutudo.</span></div><div className="flex flex-1 flex-col justify-between px-5 pb-8 pt-2 md:w-1/2 md:items-start md:justify-center md:px-16 md:py-12"><div className="space-y-5 md:w-[60%]"><div><h1 className="text-2xl font-bold leading-tight text-foreground">Quem tem carteira assinada pode ter muito mais do que imagina.</h1><p className="mt-2 text-sm text-muted-foreground">Descubra o que esta disponivel para voce. E gratuito e sem compromisso.</p></div><div className="space-y-2.5">{["Simulacao gratuita, sem compromisso", "Tudo explicado, sem letra miuda", "Seus dados ficam so com voce"].map((text) => <div key={text} className="flex items-center gap-2.5 text-sm text-foreground"><CheckCircle size={16} weight="fill" className="shrink-0 text-primary" />{text}</div>)}</div></div><div className="space-y-3 pt-6 md:w-[60%]"><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary-dark" onClick={() => { setStep(1); setDirection(1); navigate("/cadastro"); }}>Quero comecar<ArrowRight size={18} className="ml-2" /></Button></motion.div><Button variant="outline" className="h-12 w-full rounded-xl border-border" onClick={() => { setLoginStep(1); setOtpChannel(null); setOtpCode(""); navigate("/acesso"); }}>Ja tenho conta</Button><p className="text-center text-xs leading-relaxed text-muted-foreground md:text-left">Ao continuar voce concorda com os <a href="#" className="text-primary underline underline-offset-2">Termos de Uso</a> e a <a href="#" className="text-primary underline underline-offset-2">Politica de Privacidade</a>.</p></div></div></main>} />

            <Route path="/cadastro" element={<main className="mx-auto min-h-screen w-full bg-background px-4 py-6 md:px-8"><div className="mx-auto flex w-full flex-col md:w-[860px] md:pt-12"><div className="mb-5 flex items-center justify-between"><span className="text-lg font-bold text-foreground">seutudo.</span><Badge className="border-0 bg-primary-light text-xs font-medium text-primary-dark md:hidden">Cadastro</Badge></div><div className="flex-1 space-y-4"><AnimatePresence mode="wait" custom={direction}><motion.div key={step} custom={direction} variants={stepVariants} initial="initial" animate="animate" exit="exit">{(() => {
              if (step === 1) return <><StepHeader step={1} total={totalSteps} title="Vamos comecar?" subtitle="Leva menos de 3 minutos." /><Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">Nome completo</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Souza" className="h-12 rounded-xl" /></div><div className="space-y-1.5"><Label className="text-sm font-medium">E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="h-12 rounded-xl" /></div><div className="space-y-1.5"><Label className="text-sm font-medium">Telefone com DDD</Label><IMaskInput mask="(00) 00000-0000" value={phone} onAccept={(value) => setPhone(String(value))} placeholder="(11) 99999-9999" className={maskedInputClass} /><p className="text-xs text-muted-foreground">Vamos usar para confirmar sua identidade e avisar sobre sua proposta.</p></div></CardContent></Card></>;
              if (step === 2) return <><StepHeader step={2} total={totalSteps} title="Qual e o seu CPF?" subtitle="A gente usa para encontrar as ofertas certas para voce." /><Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">CPF</Label><IMaskInput mask="000.000.000-00" value={cpf} onAccept={(value) => setCpf(String(value))} placeholder="000.000.000-00" className={maskedInputClass} /><p className="text-xs text-muted-foreground">Nenhum dado e compartilhado sem sua autorizacao.</p></div><SecurityStrip /></CardContent></Card></>;
              if (step === 3) return <><StepHeader step={3} total={totalSteps} title="O que voce esta precisando?" subtitle="Pode escolher mais de um." /><div className="space-y-2">{(Object.keys(serviceCopy) as ServiceType[]).map((service) => { const checked = interests.includes(service); const currentService = serviceCopy[service]; return <button key={service} type="button" onClick={() => toggleInterest(service)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${checked ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/40"}`}><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${checked ? "bg-primary text-white" : "bg-background text-muted-foreground"}`}>{currentService.icon}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-foreground">{currentService.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{currentService.subtitle}</p></div><Checkbox checked={checked} className={checked ? "border-primary data-[state=checked]:bg-primary" : "border-border"} onCheckedChange={() => toggleInterest(service)} /></button>; })}<div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#A8A29E]"><ShieldCheck size={20} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[#78716C]">Seguro de Vida</p><span className="inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#78716C]"><Clock size={10} /> Em breve</span></div><p className="mt-0.5 text-xs text-[#A8A29E]">Toque para registrar seu interesse</p></div></div>{interests.length === 0 && <p className="pt-1 text-center text-xs text-primary">Selecione pelo menos 1 produto para continuar.</p>}</div></>;
              if (step === 4) return <><StepHeader step={4} total={totalSteps} title="Escolha um PIN de acesso." subtitle="Vai ser usado para entrar no app." /><Card className="border-border shadow-sm"><CardContent className="space-y-4 pt-5"><div className="space-y-1.5"><Label className="text-sm font-medium">PIN numerico (6 digitos)</Label><Input type="password" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="••••••" className="h-12 rounded-xl text-center text-lg tracking-[0.5em]" /></div><ul className="space-y-1.5">{["Nao use sequencias (123456)", "Nao use sua data de nascimento", "Voce podera ativar biometria na proxima tela"].map((rule) => <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />{rule}</li>)}</ul></CardContent></Card></>;
              return <div className="flex flex-col items-center space-y-4 pt-8 text-center"><CheckCircle size={56} className="text-primary" weight="fill" /><div><h2 className="text-2xl font-bold text-foreground">Pronto, {firstName}.</h2><p className="mx-auto mt-2 text-sm text-muted-foreground">A gente ja encontrou uma opcao para voce. Veja o que esta disponivel na sua conta.</p></div><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }} className="mt-4 w-full"><Button className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark" onClick={completeOnboarding}>Ver minha conta<ArrowRight size={16} className="ml-2" /></Button></motion.div></div>;
            })()}</motion.div></AnimatePresence></div>{step <= 4 && <div className="grid grid-cols-2 gap-3 pt-6"><Button variant="outline" onClick={() => { setDirection(-1); if (step === 1) navigate("/boas-vindas"); else setStep((prev) => prev - 1); }} className="h-12 rounded-xl border-border text-foreground">Voltar</Button><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button onClick={() => { setDirection(1); if (step === 4) { setStep(5); setBiometriaSheetOpen(true); } else setStep((prev) => prev + 1); }} disabled={!canGoNext} className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40">Continuar</Button></motion.div></div>}</div>{step === 5 && biometriaSheetOpen && <><div className="fixed inset-0 z-40 bg-black/40" onClick={() => setBiometriaSheetOpen(false)} /><div className="fixed bottom-0 left-1/2 z-50 w-full -translate-x-1/2 rounded-t-2xl bg-white px-6 pb-10 pt-6"><div className="mx-auto mb-6 h-1 w-10 rounded-full bg-border" /><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light"><Fingerprint size={32} className="text-primary" /></div><h3 className="mb-2 text-center text-xl font-bold text-foreground">Quer entrar com sua digital?</h3><p className="mb-6 text-center text-sm text-muted-foreground">E mais rapido e voce nao precisa lembrar do PIN.</p><motion.div whileTap={shouldReduce ? undefined : { scale: 0.97 }}><Button className="mb-3 h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark" onClick={() => { setBiometria(true); setBiometriaSheetOpen(false); }}>Habilitar biometria</Button></motion.div><Button variant="ghost" className="h-12 w-full font-semibold text-primary" onClick={() => setBiometriaSheetOpen(false)}>Agora nao</Button></div></>}</main>} />

            <Route path="/acesso" element={renderLogin()} />
            <Route path="/painel" element={getStoredUser() ? renderHomeLayout("home") : <Navigate to="/boas-vindas" replace />} />
            <Route path="/minha-conta" element={getStoredUser() ? renderHomeLayout("account") : <Navigate to="/boas-vindas" replace />} />
            <Route path="/contratos" element={getStoredUser() ? <ComingSoon title="Contratos" /> : <Navigate to="/boas-vindas" replace />} />
            <Route path="/duvidas" element={getStoredUser() ? <ComingSoon title="Duvidas" /> : <Navigate to="/boas-vindas" replace />} />
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
