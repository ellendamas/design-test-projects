import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Calendar, IdentificationCard } from "@phosphor-icons/react";
import { getStoredUser, SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/context/PrivacyContext";
import { obterDataHojeSimulada } from "@/pages/saude/useMensalidades";
import { ContratoBenemedViewer } from "./ContratoBenemedViewer";
import { CONTRATO_BENEMED_HASH, CONTRATO_BENEMED_VERSAO } from "./contratoBenemedConteudo";
import {
  calcularProximoVencimento,
  DIAS_COBRANCA,
  formatarDataBR,
  PLANOS,
  registrarAceiteContrato,
  type AceiteContrato,
  type DiaCobranca,
  type Plano,
} from "./shared";

// Replica o padrão de SensitiveData do App.tsx (não é exportado de lá) — mesmo mascaramento
// usado em outras telas de contrato/dados sensíveis do app.
function SensitiveData({ value, type = "text" }: { value: string; type?: "cpf" | "phone" | "email" | "text" }) {
  const { dataVisible } = usePrivacy();
  const masked = { cpf: "•••.•••.•••-••", phone: "(••) •••••-••••", email: "••••••@••••.com", text: "••••••••" }[type];
  return <span className="text-sm font-semibold text-foreground">{dataVisible ? value : masked}</span>;
}

// Rota: /assistencias/saude/confirmar-dados — nome, CPF, celular e e-mail vêm da conta já
// logada, sem pedir de novo (os dois últimos já chegam aqui verificados — ver
// VerificarCelularPage.tsx/VerificarEmailPage.tsx e proximaEtapaAposVerificacao em shared.ts).
// Avança só libera depois do aceite explícito dos termos (checkbox, não o "ao continuar você
// aceita..." implícito usado no cadastro) e, nos planos Mensal e Familiar (Prompt 1f, 22/10),
// também da escolha do dia de cobrança — Semestral/Anual não têm essa etapa, cobrança num
// ciclo mais longo (ver DIAS_COBRANCA em shared.ts).
export default function AssistenciasConfirmarDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const plano = (location.state as { plano?: Plano } | null)?.plano ?? PLANOS[0];
  const user = getStoredUser();
  const celular = localStorage.getItem("podeja_celular") ?? "(11) 99999-8888";

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [contratoJaFoiAberto, setContratoJaFoiAberto] = useState(false);
  const [contratoAberto, setContratoAberto] = useState(false);
  const [aceite, setAceite] = useState<AceiteContrato | null>(null);
  const [diaCobranca, setDiaCobranca] = useState<DiaCobranca | null>(null);

  const precisaEscolherDia = plano.id === "mensal" || plano.id === "familiar";
  const podeAvancar = aceitouTermos && (!precisaEscolherDia || diaCobranca !== null);

  // IG-07 (Prompt 1g, 22/10) — a caixa de aceite só libera depois de abrir o contrato uma vez;
  // continua liberada mesmo se a pessoa desmarcar e marcar de novo. Marcar (aqui ou pelo botão
  // "Li e aceito" dentro do contrato) grava versão, hash e o horário exato desse aceite.
  const abrirContrato = () => {
    setContratoJaFoiAberto(true);
    setContratoAberto(true);
  };

  const marcarAceite = () => {
    const registro: AceiteContrato = {
      versao: CONTRATO_BENEMED_VERSAO,
      hash: CONTRATO_BENEMED_HASH,
      aceitoEm: new Date().toISOString(),
    };
    setAceite(registro);
    setAceitouTermos(true);
    registrarAceiteContrato(registro);
  };

  // Preview de vencimento (seção 3 do Prompt 1f) — contratação é "hoje" aqui, antes de qualquer
  // pagamento acontecer de verdade; ?dataHoje= (DESIGN ONLY) simula outro "hoje" pra testar a
  // regra dos 30 dias sem esperar o calendário real.
  const proximoVencimento = diaCobranca
    ? calcularProximoVencimento(obterDataHojeSimulada(searchParams), diaCobranca)
    : null;

  const avancar = () => {
    navigate("/assistencias/saude/pagamento", { state: { plano, diaCobranca, aceite } });
  };

  const linhas = [
    { label: "Nome completo", value: user?.name ?? "Não informado", type: "text" as const },
    { label: "CPF", value: user?.cpf ?? "Não informado", type: "cpf" as const },
    { label: "Celular", value: celular, type: "phone" as const },
    { label: "E-mail", value: user?.email ?? "Não informado", type: "email" as const },
  ];

  return (
    <SubPageLayout title="Confirme seus dados" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <IdentificationCard size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Confirme seus dados</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plano {plano.nome} · {plano.precoMes} por mês
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-sm">
          {linhas.map((linha, i) => (
            <div
              key={linha.label}
              className={`flex items-center justify-between px-4 py-3 ${i < linhas.length - 1 ? "border-b border-border" : ""}`}
            >
              <p className="text-xs text-muted-foreground">{linha.label}</p>
              <SensitiveData value={linha.value} type={linha.type} />
            </div>
          ))}
        </div>

        {precisaEscolherDia && (
          <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#FD5F31]" />
              <h3 className="text-sm font-semibold text-foreground">Melhor dia para a cobrança</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Você autoriza o Pix automático uma vez, e a cobrança acontece todo mês nesse dia.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {DIAS_COBRANCA.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => setDiaCobranca(dia)}
                  className={cn(
                    "h-11 rounded-xl border text-sm font-medium transition-colors",
                    diaCobranca === dia ? "border-[#FD5F31] bg-[#FFF3EE] text-[#D94E28]" : "border-border text-foreground hover:border-[#FD5F31]/40",
                  )}
                >
                  {dia}
                </button>
              ))}
            </div>
            {proximoVencimento && (
              <p className="text-xs text-muted-foreground">
                A próxima mensalidade vence em {formatarDataBR(proximoVencimento)}.
              </p>
            )}
          </div>
        )}

        <div className="space-y-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          {/* Antes de abrir o contrato, a caixa fica visualmente desativada e sem foco de
              teclado (`disabled` de verdade no Radix Checkbox não dispara clique nem foco) —
              por isso o toque nela é capturado por este `div` ao redor via `pointer-events-none`
              no Checkbox, que deixa o clique "passar" pro div. O link do texto é um elemento
              interativo de verdade, sempre clicável e sempre focável por teclado, com o próprio
              onClick (e `stopPropagation` pra não também alternar o aceite no mesmo toque) — por
              isso o `div` em volta da caixa NÃO leva `role`/`aria-disabled`: isso desativaria o
              link também pra leitor de tela, que é exatamente o único jeito de abrir o contrato
              por teclado antes da caixa habilitar. */}
          <div className="flex items-start gap-3">
            <div onClick={() => { if (!contratoJaFoiAberto) abrirContrato(); }} className={!contratoJaFoiAberto ? "cursor-pointer" : ""}>
              <Checkbox
                checked={aceitouTermos}
                disabled={!contratoJaFoiAberto}
                onCheckedChange={(v) => { if (v === true) marcarAceite(); else setAceitouTermos(false); }}
                className={cn("mt-0.5", !contratoJaFoiAberto && "pointer-events-none")}
              />
            </div>
            <span className="text-sm leading-relaxed text-foreground">
              Li e aceito os{" "}
              {/* `<a>`, não `<button>`: `button` é inline-block por padrão no navegador,
                  mesmo com a classe `inline` do Tailwind por cima (o reset de formulário do
                  navegador ganha) — por isso quebrava como um bloco à parte em vez de fluir
                  junto com "Li e aceito os" igual um link de verdade. `<a>` já é inline nativo,
                  sem precisar sobrescrever nada, e é também o elemento certo pra algo que a
                  Ellen pediu pra "ser um link mesmo". href="#" + preventDefault porque não
                  navega de verdade, só abre o contrato. */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  abrirContrato();
                }}
                className="underline underline-offset-2"
              >
                termos da assinatura de assistência à saúde BeneMed.
              </a>
            </span>
          </div>
          {!contratoJaFoiAberto && (
            <p className="pl-8 text-xs text-[#D94E28]">Leia os termos para aceitar.</p>
          )}
        </div>

        {/* Movido pra fora do card do aceite a pedido da Ellen (22/10) — mesmo texto, mesmo
            estilo, só não faz mais parte visualmente da caixa de aceite. */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          A BeneMed Cuidado não é um plano de saúde e não cobre atendimentos de urgência ou
          emergência. Consultas e exames presenciais são pagos à parte, com desconto.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button
          className="h-14 w-full rounded-full"
          disabled={!podeAvancar}
          onClick={avancar}
        >
          Avançar
        </Button>
      </div>

      <ContratoBenemedViewer
        aberto={contratoAberto}
        onFechar={() => setContratoAberto(false)}
        onAceitar={() => {
          marcarAceite();
          setContratoAberto(false);
        }}
      />
    </SubPageLayout>
  );
}
