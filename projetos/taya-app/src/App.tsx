import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  HandCoins,
  Home,
  Lock,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

type ServiceType = "fgts" | "clt" | "saque-facil";

const serviceCopy: Record<ServiceType, { title: string; subtitle: string; cta: string; icon: JSX.Element }> = {
  fgts: {
    title: "Antecipe seu FGTS",
    subtitle: "Receba em minutos com simulação clara e sem burocracia.",
    cta: "Simular FGTS",
    icon: <HandCoins className="h-5 w-5" />,
  },
  clt: {
    title: "Crédito CLT",
    subtitle: "Condições para quem tem carteira assinada, com parcelas previsíveis.",
    cta: "Consultar CLT",
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  "saque-facil": {
    title: "Saque Fácil no cartão",
    subtitle: "Saque com limite do cartão de crédito com aprovação rápida.",
    cta: "Ver oferta",
    icon: <CreditCard className="h-5 w-5" />,
  },
};

function App() {
  const [flow, setFlow] = useState<"onboarding" | "home">("onboarding");
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Ellen");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [pin, setPin] = useState("");
  const [notifyOn, setNotifyOn] = useState(true);
  const [interests, setInterests] = useState<ServiceType[]>(["fgts", "saque-facil"]);

  const canGoNext = useMemo(() => {
    if (step === 2) return name.trim().length > 2 && email.includes("@") && phone.length >= 10;
    if (step === 3) return cpf.replace(/\D/g, "").length === 11;
    if (step === 4) return interests.length > 0;
    if (step === 5) return pin.length === 6;
    return true;
  }, [cpf, email, interests.length, name, phone.length, pin.length, step]);

  const progressValue = Math.min((step / 6) * 100, 100);

  const selectedCards = interests.map((interest) => serviceCopy[interest]);

  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-[#e9eaf2] px-3 py-4">
      <section className="overflow-hidden rounded-[28px] border border-[#dfe3ef] bg-white shadow-[0_20px_40px_rgba(17,24,39,0.12)]">
        {flow === "onboarding" ? (
          <div className="min-h-[850px]">
            <header className="bg-gradient-to-b from-[#2e386d] to-[#1e2850] px-5 pb-6 pt-8 text-white">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xl font-bold">taya.</span>
                <Badge className="bg-white/20 text-white">Onboarding</Badge>
              </div>
              <h1 className="text-2xl font-bold">Seu crédito, suas escolhas.</h1>
              <p className="mt-1 text-sm text-white/90">FGTS, CLT e Saque Fácil no mesmo app.</p>
            </header>

            <div className="space-y-5 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Passo {step} de 6</span>
                  <span>{Math.round(progressValue)}%</span>
                </div>
                <Progress value={progressValue} />
              </div>

              {step === 1 && (
                <>
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#2e386d] to-[#1e2850] p-6 text-white shadow-[0_10px_15px_rgba(0,0,0,0.15)]">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-[#7f8fbf]/30" />
                    <p className="relative text-[15px] text-[#cbd5e1]">TAYA</p>
                    <h2 className="relative mt-2 text-3xl font-semibold leading-tight">
                      Crédito do seu jeito,
                      <br />
                      com clareza.
                    </h2>
                    <p className="relative mt-3 text-sm text-[#cbd5e1]">
                      Simule FGTS, CLT e Saque Fácil em poucos toques.
                    </p>
                    <div className="relative mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-white/10 px-2 py-2">FGTS</div>
                      <div className="rounded-lg bg-white/10 px-2 py-2">CLT</div>
                      <div className="rounded-lg bg-white/10 px-2 py-2">Saque Fácil</div>
                    </div>
                  </div>

                  <Card className="border-[#e2e8f0] bg-[#f8fafc]">
                    <CardHeader>
                      <CardTitle>Bem-vinda à Taya 👋</CardTitle>
                      <CardDescription>
                        Cadastre-se em menos de 3 minutos para receber ofertas personalizadas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-[#475569]">
                      <p>✔ Simulação sem compromisso</p>
                      <p>✔ Transparência de taxas e parcelas</p>
                      <p>✔ Segurança com proteção de dados e biometria</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Crie sua conta gratuita</CardTitle>
                    <CardDescription>Esses dados ajudam a personalizar suas ofertas.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Nome completo</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ellen Souza" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone com DDD</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informe seu CPF</CardTitle>
                    <CardDescription>
                      Usamos seu CPF para mostrar somente ofertas adequadas para você.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>CPF</Label>
                      <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
                    </div>
                    <div className="rounded-lg border border-[#cbd5e1] bg-[#f8fafc] p-3 text-xs text-[#334155]">
                      <p className="mb-1 flex items-center gap-1 font-medium">
                        <Shield className="h-4 w-4" /> Dados protegidos
                      </p>
                      Seus dados seguem LGPD e são criptografados durante todo o processo.
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Quais produtos você procura?</CardTitle>
                    <CardDescription>Selecione um ou mais para personalizar sua Home.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(Object.keys(serviceCopy) as ServiceType[]).map((service) => {
                      const checked = interests.includes(service);
                      return (
                        <label
                          key={service}
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                            checked ? "border-[#2e386d] bg-[#f1f5f9]" : "border-border bg-white"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              if (checked) {
                                setInterests(interests.filter((item) => item !== service));
                              } else {
                                setInterests([...interests, service]);
                              }
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{serviceCopy[service].title}</p>
                            <p className="text-xs text-muted-foreground">{serviceCopy[service].subtitle}</p>
                          </div>
                        </label>
                      );
                    })}
                    {interests.length === 0 && (
                      <p className="text-xs text-[#2e386d]">Selecione pelo menos 1 produto para continuar.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {step === 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Crie seu PIN de acesso</CardTitle>
                    <CardDescription>Use 6 números e evite sequências.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>PIN numérico (6 dígitos)</Label>
                      <Input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                      />
                    </div>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Não use sequência (123456)</li>
                      <li>• Não use datas de nascimento</li>
                      <li>• Recomendado ativar biometria após cadastro</li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              {step === 6 && (
                <Card className="border-[#cbd5e1] bg-[#f8fafc]">
                  <CardContent className="space-y-4 p-5 text-center">
                    <CheckCircle2 className="mx-auto h-14 w-14 text-[#2e386d]" />
                    <div>
                      <h2 className="text-lg font-semibold">Tudo certo, {name.split(" ")[0]}!</h2>
                      <p className="text-sm text-muted-foreground">
                        Seu app está pronto. Já identificamos ofertas de FGTS, CLT e Saque Fácil para você.
                      </p>
                    </div>
                    <Button className="w-full" onClick={() => setFlow("home")}>
                      Ver minha tela inicial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {step < 6 && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                    disabled={step === 1}
                  >
                    Voltar
                  </Button>
                  <Button onClick={() => setStep((prev) => Math.min(prev + 1, 6))} disabled={!canGoNext}>
                    Continuar
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-[850px] bg-[#e9eaf2]">
            <header className="bg-gradient-to-b from-[#2e386d] to-[#1e2850] px-5 pb-6 pt-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/90">Olá, {name.split(" ")[0]}</p>
                  <h2 className="text-xl font-semibold">Seu crédito na Taya</h2>
                </div>
                <button className="rounded-full bg-white/20 p-2">
                  <Bell className="h-5 w-5" />
                </button>
              </div>

              <Card className="mt-4 border-0 bg-white/95">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-[#2e386d]">Oferta destacada</p>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">Você pode antecipar até R$ 4.800 no FGTS</p>
                      <p className="mt-1 text-xs text-muted-foreground">Taxa a partir de 1,39% ao mês</p>
                    </div>
                    <Badge>Novo</Badge>
                  </div>
                  <Button className="mt-3 w-full">Simular agora</Button>
                </CardContent>
              </Card>
            </header>

            <div className="space-y-3 p-4 pb-24">
              <Card className="border-[#cbd5e1] bg-[#f8fafc]">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-semibold">Habilitar biometria</p>
                    <p className="text-xs text-muted-foreground">Proteja seu dinheiro com acesso seguro.</p>
                  </div>
                  <Switch checked={notifyOn} onCheckedChange={setNotifyOn} />
                </CardContent>
              </Card>

              {selectedCards.map((card) => (
                <Card key={card.title}>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-[#2e386d]">
                      {card.icon}
                      <p className="text-sm font-semibold text-[#111827]">{card.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    <Button variant="outline" className="mt-3 w-full">
                      {card.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suporte rápido</CardTitle>
                  <CardDescription>Fale com a Taya para tirar dúvidas sobre contrato e aprovação.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Falar com atendimento
                  </Button>
                </CardContent>
              </Card>

              <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setFlow("onboarding")}> 
                <LogOut className="mr-2 h-4 w-4" /> Voltar para onboarding
              </Button>
            </div>

            <nav className="fixed bottom-4 left-1/2 w-[calc(100%-1.5rem)] max-w-[406px] -translate-x-1/2 rounded-2xl border bg-white p-2 shadow-lg">
              <ul className="grid grid-cols-4 text-center text-[11px]">
                <li className="rounded-xl bg-[#f1f5f9] p-2 text-[#2e386d]">
                  <Home className="mx-auto mb-1 h-4 w-4" />
                  Início
                </li>
                <li className="p-2 text-muted-foreground">
                  <CreditCard className="mx-auto mb-1 h-4 w-4" />
                  Contratos
                </li>
                <li className="p-2 text-muted-foreground">
                  <Lock className="mx-auto mb-1 h-4 w-4" />
                  Dúvidas
                </li>
                <li className="p-2 text-muted-foreground">
                  <User className="mx-auto mb-1 h-4 w-4" />
                  Conta
                </li>
              </ul>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
