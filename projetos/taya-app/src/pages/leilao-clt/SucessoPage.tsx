import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { SubPageLayout, getStoredUser } from "@/App";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import type { ContaData } from "@/components/ContaSelector";
import { OFERTA_LEILAO } from "./leilaoData";

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

// Rota: /leilao/sucesso — compartilhada entre a jornada com conta (SubPageLayout, mesmo padrão
// de consignado-clt/ConfirmacaoPage.tsx) e a pública/guest (PublicLayout).
export default function LeilaoSucessoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const conta = (location.state as { conta?: ContaData } | null)?.conta ?? null;
  const usuario = getStoredUser();

  if (usuario) {
    const primeiroNome = usuario.name?.split(" ")[0] ?? "";
    const provedor = "Bull";

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
      <SubPageLayout title="" hideNav>
        <div className="flex flex-col items-center gap-5 px-6 pb-24 pt-10">
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
              Dinheiro a caminho{primeiroNome ? `, ${primeiroNome}` : ""}!
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Seu empréstimo foi aprovado. O valor cai na sua conta entre hoje e em até 3 dias úteis.
            </p>
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

          <div className="mt-2 w-full space-y-1">
            <Button
              className="h-14 w-full rounded-full bg-[#FD5F31] text-base font-semibold text-white hover:bg-[#d04e08]"
              onClick={() => navigate("/contratos")}
            >
              Ver meu contrato
            </Button>
            <button
              type="button"
              onClick={() => navigate("/painel")}
              className="w-full py-3 text-center text-sm text-muted-foreground"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </SubPageLayout>
    );
  }

  return (
    <PublicLayout
      footer={
        <>
          <Button
            className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark"
            onClick={() => navigate("/leilao/criar-conta", { state: location.state })}
          >
            Criar conta para acompanhar
          </Button>
          <Button variant="outline" className="h-12 w-full rounded-full border-border text-foreground" onClick={() => navigate("/")}>
            Continuar sem conta
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 pt-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, ease: "backOut" }}>
          <CheckCircle size={64} weight="fill" className="text-[#16A34A]" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Seu crédito foi aprovado!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O valor será depositado em até 1 dia útil na conta informada.
          </p>
        </div>

        <div className="mt-2 w-full rounded-2xl border border-border bg-white p-4 text-left">
          <p className="text-xs text-muted-foreground">Valor liberado</p>
          <p className="text-lg font-bold text-foreground">R$ {formatCurrency(OFERTA_LEILAO.valor)}</p>
          {conta && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">Conta de destino</p>
              <p className="text-sm font-semibold text-foreground">
                {conta.banco.nome} · Ag {conta.agencia} · ••••-{conta.digito}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 w-full border-t border-border pt-4 text-left">
          <p className="text-sm font-semibold text-foreground">Acompanhe seu contrato</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Crie sua conta no Pode Já para ver o contrato, boletos e histórico de pagamentos.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
