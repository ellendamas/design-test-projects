import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { SubPageLayout, StepHeader, NECESSIDADES, isWeakNumericPin } from "@/App";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LEAD_MOCK } from "./leilaoData";

// Rota: /leilao/criar-conta — mini-onboarding de 2 passos (PIN + necessidades), já que
// nome/e-mail/telefone/CPF foram coletados antes na jornada pública.
export default function LeilaoCriarContaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { email?: string } | null) ?? {};

  const [step, setStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [necessidades, setNecessidades] = useState<string[]>([]);

  const toggleNecessidade = (id: string) =>
    setNecessidades((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));

  const podeAvancarPin = pin.length === 6 && !isWeakNumericPin(pin);

  const finalizar = () => {
    const user = { name: LEAD_MOCK.nome, email: state.email ?? "" };
    localStorage.setItem("podeja_user", JSON.stringify(user));
    localStorage.setItem("podeja_necessidades", JSON.stringify(necessidades));
    navigate("/painel");
  };

  return (
    <SubPageLayout title="Criar sua conta" hideNav>
      <div className="space-y-4">
        {step === 1 ? (
          <>
            <StepHeader step={1} total={2} title="Crie sua senha de acesso" subtitle="Vai ser usada para entrar no app." />
            <Card className="border-border shadow-sm">
              <CardContent className="space-y-4 pt-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Senha numérica (6 dígitos)</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="h-12 rounded-xl text-center text-lg tracking-[0.5em]"
                  />
                  {pin.length === 6 && isWeakNumericPin(pin) ? (
                    <p className="text-xs text-red-600">Evite sequências como 123456 ou números repetidos.</p>
                  ) : null}
                </div>
                <ul className="space-y-1.5">
                  {["Não use sequências (123456)", "Não use sua data de nascimento", "Guarde essa senha em um lugar seguro"].map((rule) => (
                    <li key={rule} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={13} className="shrink-0 text-muted-foreground/50" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={!podeAvancarPin}
              onClick={() => setStep(2)}
            >
              Continuar
            </Button>
          </>
        ) : (
          <>
            <StepHeader step={2} total={2} title="Quase lá" subtitle="Personalize sua experiência." />
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">O que é importante pra você nesse momento?</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
                        selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40"
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
                      {selecionado && <CheckCircle size={20} className="ml-auto shrink-0 text-[#FD5F31]" weight="fill" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              className="h-12 w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
              disabled={necessidades.length === 0}
              onClick={finalizar}
            >
              Concluir
            </Button>
          </>
        )}
      </div>
    </SubPageLayout>
  );
}
