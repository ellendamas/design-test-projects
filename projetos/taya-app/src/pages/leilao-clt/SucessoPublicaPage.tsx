import { useNavigate, useLocation } from "react-router-dom";
import { CalendarBlank, CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import type { ContaData } from "@/components/ContaSelector";
import { LEAD_MOCK, OFERTA_LEILAO } from "./leilaoData";

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const proximoMesAno = () => {
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${meses[d.getMonth()]}/${d.getFullYear()}`;
};

// Rota: /leilao/oferta/sucesso — jornada pública/guest, apartada da jornada com conta
// (/leilao/sucesso), mas com a mesma estrutura/informações da tela de sucesso interna do app.
// Não existe mais tela de contrato nem CTA "Continuar sem conta" para quem não cria conta —
// o usuário recebe a proposta/CCB por e-mail; esta tela já é o destino final da jornada guest,
// com ou sem clique em "Criar conta para acompanhar".
export default function LeilaoSucessoPublicaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const conta = (location.state as { conta?: ContaData } | null)?.conta ?? null;
  const primeiroNome = LEAD_MOCK.nome.split(" ")[0];
  const provedor = "Celcoin";

  const linhasResumo = [
    {
      label: "Parceiro",
      value: provedor,
      valueClass: "text-sm font-semibold text-[#D94E28]",
    },
    {
      label: "Valor a receber",
      value: `R$ ${formatCurrency(OFERTA_LEILAO.valor)}`,
      valueClass: "text-lg font-bold text-[#D94E28]",
    },
    {
      label: "Parcela mensal",
      value: `${OFERTA_LEILAO.parcelas}x de R$ ${formatCurrency(OFERTA_LEILAO.valorParcela)}`,
      valueClass: "text-sm text-[#D94E28]",
    },
    {
      label: "Primeira parcela",
      // TODO: usar data real da API
      value: proximoMesAno(),
      valueClass: "text-sm text-muted-foreground",
    },
    {
      label: "Banco",
      value: conta?.banco.nome ?? "—",
      valueClass: "text-sm text-muted-foreground",
    },
  ];

  return (
    <PublicLayout
      footerTransparente
      footer={
        <Button className="h-14 w-full rounded-full" onClick={() => navigate("/leilao/criar-conta", { state: location.state })}>
          Criar conta para acompanhar
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-5 px-6 pb-0 pt-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
        >
          <CheckCircle size={40} className="text-green-600" weight="fill" />
        </motion.div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Dinheiro a caminho, {primeiroNome}!
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Agora é com a gente! Você vai receber o contrato e os detalhes da sua proposta no e-mail cadastrado assim que estiverem prontos.
          </p>
        </div>

        {/* Previsão de crédito — movido da tela de oferta aprovada pra cá, já que faz mais
            sentido no momento em que o usuário já sabe que vai receber o dinheiro */}
        <div className="w-full rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF3EE]">
              <CalendarBlank size={16} className="text-[#FD5F31]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previsão de crédito na conta</p>
              <p className="text-sm font-semibold text-foreground">
                Entre hoje e em até 3 dias úteis
              </p>
            </div>
          </div>
        </div>

        <div className="w-full rounded-2xl bg-[#FFF3EE] p-4">
          {linhasResumo.map((linha) => (
            <div
              key={linha.label}
              className="flex items-center justify-between border-b border-[#FD5F31]/20 py-1.5 last:border-0"
            >
              <span className="text-sm text-[#D94E28]/70">{linha.label}</span>
              <span className={linha.valueClass}>{linha.value}</span>
            </div>
          ))}
        </div>

        <div className="w-full rounded-2xl border border-border bg-white p-4 text-left shadow-sm">
          <p className="text-sm font-semibold text-foreground">Você acabou de dar o primeiro passo</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            No Pode Já tem muito mais esperando por você, crédito pessoal, FGTS e benefícios que cabem no bolso.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
