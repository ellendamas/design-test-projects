import { DownloadSimple } from "@phosphor-icons/react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { contratos } from "@/data/contratos";

// Rota: /leilao/contrato — jornada pública/guest ("Continuar sem conta" na tela de sucesso).
// Versão simplificada da tela de contrato que já existe no app (ContratoCLTPage, em App.tsx,
// rota /contratos/clt-001): mesmos dados/seções principais, sem as seções de dados sensíveis do
// emitente/depósito nem o bloco de quitação antecipada, e com um único botão de baixar contrato.
export default function LeilaoContratoPublicaPage() {
  const contrato = contratos.find((c) => c.id === "clt-001" && c.tipo === "clt")!;

  return (
    <PublicLayout
      footerTransparente
      footer={
        <Button
          className="h-14 w-full rounded-full"
          onClick={() => {
            // TODO: conectar ao GET /propostas/{id}/ccb
          }}
        >
          <DownloadSimple size={18} className="mr-2" />
          Baixar contrato
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs leading-snug text-amber-700">
            Este é um contrato de exemplo para fins de demonstração. Os dados reais serão exibidos após integração com o sistema.
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-green-700">Ativo</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{contrato.produto}</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Parceiro</p>
            <p className="text-sm font-semibold text-foreground">{contrato.provedor}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data de emissão</p>
            <p className="text-sm font-semibold text-foreground">{contrato.dataEmissao}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modalidade</p>
            <p className="text-sm font-semibold leading-snug text-foreground">{contrato.modalidade}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor líquido recebido</p>
            <p className="text-sm font-semibold text-foreground">
              R$ {contrato.valorLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFF3EE] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#D94E28]">Parcelas</h3>
            <span className="text-xs text-[#D94E28]">{contrato.totalParcelas} parcelas</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#D94E28]/70">Valor da parcela</p>
              <p className="text-sm font-bold text-[#D94E28]">
                R$ {contrato.valorParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#D94E28]/70">Próximo desconto</p>
              <p className="text-sm font-bold text-[#D94E28]">{contrato.proximoDesconto}</p>
            </div>
            <div>
              <p className="text-xs text-[#D94E28]/70">Dia de pagamento</p>
              <p className="text-sm font-bold text-[#D94E28]">Todo dia {contrato.diaPagamento}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Taxas e custos</h3>
          <div className="space-y-2.5">
            {[
              { label: "Taxa de juros", value: `${contrato.taxaJurosMes}% a.m. / ${contrato.taxaJurosAno}% a.a.` },
              { label: "Custo Efetivo Total (CET)", value: `${contrato.cet}% a.a.` },
              { label: "IOF", value: `R$ ${contrato.iof.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
              { label: "Valor total das parcelas", value: `R$ ${contrato.valorTotalParcelas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xs font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
