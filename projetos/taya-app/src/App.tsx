import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bank,
  Bell,
  Briefcase,
  CaretRight,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Headset,
  House,
  LockSimple,
  SealCheck,
  ShieldCheck,
  SignOut,
  UserCircle,
  WhatsappLogo,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

type ServiceType = "clt" | "fgts" | "saque-facil";
type FlowType = "splash" | "welcome" | "onboarding" | "home";

const serviceCopy: Record<
  ServiceType,
  {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
    icon: ReactNode;
    highlight?: string;
  }
> = {
  clt: {
    title: "Credito com desconto em folha",
    subtitle: "Para quem tem carteira assinada",
    description: "Parcelas fixas descontadas direto do seu salario. Sem susto no fim do mes.",
    cta: "Consultar credito CLT",
    icon: <Briefcase size={20} />,
    highlight: "Ate R$ 18.000 disponiveis",
  },
  fgts: {
    title: "Antecipar meu FGTS",
    subtitle: "Seu saldo do FGTS disponivel agora",
    description: "Receba em minutos com simulacao clara e sem burocracia.",
    cta: "Simular antecipacao",
    icon: <Bank size={20} />,
    highlight: "Taxa a partir de 1,39% a.m.",
  },
  "saque-facil": {
    title: "Saque Facil no cartao",
    subtitle: "Saque com limite do seu cartao",
    description: "Use o limite do seu cartao de credito. Aprovacao rapida.",
    cta: "Ver oferta",
    icon: <CreditCard size={20} />,
    highlight: "Aprovacao em minutos",
  },
};

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

function StepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  const pct = Math.round((step / total) * 100);

  return (
    <div className="mb-5 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          Passo {step} de {total}
        </span>
        <span>{pct}%</span>
      </div>
      <Progress
        value={pct}
        className="h-1 bg-secondary [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-500"
      />
      <div className="pt-1">
        <h2 className="text-lg font-bold leading-snug text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function App() {
  const [flow, setFlow] = useState<FlowType>("splash");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [pin, setPin] = useState("");
  const [biometria, setBiometria] = useState(false);
  const [interests, setInterests] = useState<ServiceType[]>(["clt"]);

  const firstName = name.split(" ")[0] || "voce";
  const primaryInterest = interests[0] ?? "clt";
  const primaryService = serviceCopy[primaryInterest];
  const totalSteps = 5;

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return (
        name.trim().length > 2 && email.includes("@") && phone.replace(/\D/g, "").length >= 10
      );
    }

    if (step === 2) {
      return cpf.replace(/\D/g, "").length === 11;
    }

    if (step === 3) {
      return interests.length > 0;
    }

    if (step === 4) {
      return pin.length === 6;
    }

    return true;
  }, [cpf, email, interests, name, phone, pin, step]);

  const toggleInterest = (service: ServiceType) => {
    setInterests((prev) => (prev.includes(service) ? prev.filter((i) => i !== service) : [...prev, service]));
  };

  const resetApp = () => {
    setFlow("splash");
    setStep(1);
    setName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setPin("");
    setBiometria(false);
    setInterests(["clt"]);
  };

  if (flow === "splash") {
    return (
      <main
        className="relative mx-auto flex min-h-screen max-w-[430px] cursor-pointer flex-col justify-end overflow-hidden"
        onClick={() => setFlow("welcome")}
      >
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=860&q=80&fit=crop&crop=faces,center"
          alt="Trabalhador com carteira assinada"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/75 to-transparent" />
        <div className="relative z-10 space-y-4 px-6 pb-14">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">seutudo.</div>
            <p className="mt-1 text-sm text-white/75">O que e seu, disponivel.</p>
          </div>
          <h1 className="text-2xl font-bold leading-tight text-white">Credito para quem tem carteira assinada.</h1>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-white/20" />
            <p className="text-xs text-white/50">Toque para comecar</p>
            <div className="h-px flex-1 bg-white/20" />
          </div>
        </div>
      </main>
    );
  }

  if (flow === "welcome") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-background">
        <div className="relative h-52 shrink-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=860&q=80&fit=crop&crop=faces,top"
            alt="Trabalhador CLT"
            className="h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <span className="absolute left-5 top-4 text-xl font-bold text-white drop-shadow">seutudo.</span>
        </div>

        <div className="flex flex-1 flex-col justify-between px-5 pb-8 pt-2">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-foreground">
                Trabalhadores CLT podem ter ate <span className="text-primary">R$ 18.000</span> disponiveis.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Descubra o que e seu. Simulacao gratuita, sem compromisso, em 3 minutos.
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                "Simulacao gratuita e sem compromisso",
                "Transparencia total em taxas e parcelas",
                "Seus dados protegidos pela LGPD",
              ].map((text) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} weight="fill" className="shrink-0 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <Button
              className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-white hover:bg-primary-dark"
              onClick={() => setFlow("onboarding")}
            >
              Criar minha conta gratuita
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button variant="outline" className="h-12 w-full rounded-xl border-border" onClick={() => setFlow("home")}>
              Ja tenho cadastro - entrar
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              Ao continuar voce concorda com os{" "}
              <a href="#" className="text-primary underline underline-offset-2">
                Termos de Uso
              </a>{" "}
              e a{" "}
              <a href="#" className="text-primary underline underline-offset-2">
                Politica de Privacidade
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (flow === "onboarding") {
    return (
      <main className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-background px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">seutudo.</span>
          <Badge className="border-0 bg-primary-light text-xs font-medium text-primary-dark">Cadastro</Badge>
        </div>

        <div className="flex-1 space-y-4">
          {step === 1 && (
            <>
              <StepHeader
                step={1}
                total={totalSteps}
                title="Crie sua conta gratuita"
                subtitle="Esses dados ajudam a personalizar suas ofertas."
              />
              <Card className="border-border shadow-sm">
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nome completo</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Ana Souza"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">E-mail</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Telefone com DDD</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="h-12 rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Vamos usar para confirmar sua identidade e avisar sobre sua proposta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step === 2 && (
            <>
              <StepHeader
                step={2}
                total={totalSteps}
                title="Informe seu CPF"
                subtitle="Usamos para encontrar as ofertas disponiveis para voce."
              />
              <Card className="border-border shadow-sm">
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">CPF</Label>
                    <Input
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="h-12 rounded-xl"
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground">Nenhum dado e compartilhado sem sua autorizacao.</p>
                  </div>
                  <SecurityStrip />
                </CardContent>
              </Card>
            </>
          )}

          {step === 3 && (
            <>
              <StepHeader
                step={3}
                total={totalSteps}
                title="O que voce precisa agora?"
                subtitle="Selecione um ou mais produtos."
              />
              <div className="space-y-2">
                {(Object.keys(serviceCopy) as ServiceType[]).map((service) => {
                  const checked = interests.includes(service);
                  const currentService = serviceCopy[service];

                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleInterest(service)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                        checked ? "border-primary bg-primary-light" : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          checked ? "bg-primary text-white" : "bg-background text-muted-foreground"
                        }`}
                      >
                        {currentService.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{currentService.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{currentService.subtitle}</p>
                      </div>
                      <Checkbox
                        checked={checked}
                        className={checked ? "border-primary data-[state=checked]:bg-primary" : "border-border"}
                        onCheckedChange={() => toggleInterest(service)}
                      />
                    </button>
                  );
                })}

                <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#A8A29E]">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-[#78716C]">Seguro de Vida</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#78716C]">
                        <Clock size={10} /> Em breve
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#A8A29E]">Toque para registrar seu interesse</p>
                  </div>
                </div>

                {interests.length === 0 && (
                  <p className="pt-1 text-center text-xs text-primary">Selecione pelo menos 1 produto para continuar.</p>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <StepHeader
                step={4}
                total={totalSteps}
                title="Crie seu PIN de acesso"
                subtitle="6 numeros para entrar no app com seguranca."
              />
              <Card className="border-border shadow-sm">
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">PIN numerico (6 digitos)</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••••"
                      className="h-12 rounded-xl text-center text-lg tracking-[0.5em]"
                    />
                  </div>
                  <ul className="space-y-1.5">
                    {[
                      "Nao use sequencias (123456)",
                      "Nao use sua data de nascimento",
                      "Voce podera ativar biometria no proximo passo",
                    ].map((rule) => (
                      <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          {step === 5 && (
            <>
              <StepHeader
                step={5}
                total={totalSteps}
                title="Ativar biometria"
                subtitle="Acesse mais rapido e com mais seguranca."
              />
              <Card className="border-border shadow-sm">
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Usar digital para entrar</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Mais rapido e seguro do que digitar o PIN toda vez.
                      </p>
                    </div>
                    <Switch checked={biometria} onCheckedChange={setBiometria} className="data-[state=checked]:bg-primary" />
                  </div>
                  <SecurityStrip />
                </CardContent>
              </Card>
            </>
          )}

          {step === 6 && (
            <div className="space-y-5 pt-4">
              <div className="space-y-3 text-center">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
                    <CheckCircle size={36} className="text-primary" weight="fill" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Tudo certo, {firstName}!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Encontramos uma oferta de{" "}
                    <span className="font-semibold text-foreground">{primaryService.title.toLowerCase()}</span>{" "}
                    disponivel para voce.
                  </p>
                </div>
              </div>

              <Card className="border-primary bg-primary-light shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2 text-primary-dark">
                    {primaryService.icon}
                    <p className="text-sm font-bold">{primaryService.title}</p>
                  </div>
                  {primaryService.highlight && <p className="text-xs font-semibold text-primary">{primaryService.highlight}</p>}
                  <p className="text-xs text-primary-dark">{primaryService.description}</p>
                  <Button
                    className="h-11 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark"
                    onClick={() => setFlow("home")}
                  >
                    {primaryService.cta}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => setFlow("home")}>
                Ver minha tela inicial
                <CaretRight size={14} className="ml-1" />
              </Button>
            </div>
          )}
        </div>

        {step <= 5 && (
          <div className="grid grid-cols-2 gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                if (step === 1) {
                  setFlow("welcome");
                } else {
                  setStep((p) => p - 1);
                }
              }}
              className="h-12 rounded-xl border-border text-foreground"
            >
              Voltar
            </Button>
            <Button
              onClick={() => setStep((p) => p + 1)}
              disabled={!canGoNext}
              className="h-12 rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
            >
              Continuar
            </Button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-background">
      <header className="bg-primary px-5 pb-6 pt-8 text-white">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/75">Ola, {firstName}</p>
            <h2 className="text-xl font-bold">Seu credito na seutudo.</h2>
          </div>
          <button className="rounded-full bg-white/15 p-2.5">
            <Bell size={20} />
          </button>
        </div>

        <Card className="border-0 bg-white shadow-none">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Oferta disponivel para voce</p>
                <p className="text-sm font-bold leading-snug text-foreground">Voce pode antecipar ate R$ 4.800 no FGTS</p>
                <p className="text-xs text-muted-foreground">Taxa a partir de 1,39% ao mes</p>
              </div>
              <Badge className="shrink-0 border-0 bg-primary-light text-xs text-primary-dark">Novo</Badge>
            </div>
            <Button className="h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-dark">
              Simular agora
            </Button>
          </CardContent>
        </Card>
      </header>

      <div className="space-y-3 p-4 pb-28">
        {interests.map((interest, idx) => {
          const currentService = serviceCopy[interest];
          const isPrimary = idx === 0;

          return (
            <Card key={interest} className={`shadow-sm ${isPrimary ? "border-primary/30" : "border-border"}`}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isPrimary ? "bg-primary-light text-primary" : "bg-background text-muted-foreground"
                    }`}
                  >
                    {currentService.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{currentService.title}</p>
                    {isPrimary && currentService.highlight && (
                      <p className="mt-0.5 text-xs font-medium text-primary">{currentService.highlight}</p>
                    )}
                  </div>
                  {isPrimary && (
                    <Badge className="shrink-0 border-0 bg-primary-light text-[10px] text-primary-dark">Principal</Badge>
                  )}
                </div>
                <p className="mb-3 text-xs text-muted-foreground">{currentService.description}</p>
                <Button
                  variant={isPrimary ? "default" : "outline"}
                  className={`h-9 w-full rounded-lg text-sm font-medium ${
                    isPrimary ? "bg-primary text-white hover:bg-primary-dark" : "border-border"
                  }`}
                >
                  {currentService.cta}
                  <CaretRight size={14} className="ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                <Headset size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Precisa de ajuda?</p>
                <p className="text-xs text-muted-foreground">Atendimento seg a sex, 8h as 18h</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm">
                <WhatsappLogo size={15} /> WhatsApp
              </Button>
              <Button variant="outline" className="h-9 gap-1.5 rounded-lg border-border text-sm">
                <Headset size={15} /> Ligar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-5 py-1">
          {[
            { icon: <LockSimple size={13} />, label: "LGPD" },
            { icon: <SealCheck size={13} />, label: "Banco Central" },
            { icon: <ShieldCheck size={13} />, label: "Criptografado" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={resetApp}>
          <SignOut size={16} className="mr-2" /> Reiniciar onboarding
        </Button>
      </div>

      <nav className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-[398px] -translate-x-1/2 rounded-2xl border border-border bg-white p-2 shadow-sm">
        <ul className="grid grid-cols-4 text-center text-[11px]">
          <li className="rounded-xl bg-primary-light p-2 text-primary">
            <House size={18} className="mx-auto mb-1" />
            Inicio
          </li>
          <li className="p-2 text-muted-foreground">
            <FileText size={18} className="mx-auto mb-1" />
            Contratos
          </li>
          <li className="p-2 text-muted-foreground">
            <Headset size={18} className="mx-auto mb-1" />
            Duvidas
          </li>
          <li className="p-2 text-muted-foreground">
            <UserCircle size={18} className="mx-auto mb-1" />
            Conta
          </li>
        </ul>
      </nav>
    </main>
  );
}

export default App;
