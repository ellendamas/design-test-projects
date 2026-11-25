import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Info, Trash } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackStep } from "@/utils/analytics";
import { COMENTARIO_EXCLUSAO_MAX_LENGTH, MOTIVOS_EXCLUSAO, MOTIVO_COM_DESVIO_SUSPENSAO, embaralharMotivos, type MotivoExclusaoId } from "./shared";

// Rota: /minha-conta/excluir/motivo — só no ramo sem contrato ativo (ver
// ExcluirContaImpactosPage.tsx). Mesmo padrão de lista selecionável já usado em
// CancelarMotivoPage.tsx (Saúde). Motivos são os mesmos 7 reais da suspensão de conta em
// produção (shared.ts). O desvio pra "pausar em vez de excluir" é uma adaptação minha do desvio
// real que a suspensão tem em produção pro motivo "notificações demais" — aqui só aparece pro
// único motivo com sinal claro de "pode voltar" (not_using), e é só texto, porque o protótipo
// ainda não tem uma jornada de suspensão própria pra linkar.
export default function ExcluirContaMotivoPage() {
  const navigate = useNavigate();
  const [motivoSelecionado, setMotivoSelecionado] = useState<MotivoExclusaoId | null>(null);
  const [comentario, setComentario] = useState("");
  // Ordem embaralhada uma vez por visita (não a cada render), mesmo padrão de
  // `categoriasEmBreve` em App.tsx — evita viés de sempre mostrar o mesmo motivo primeiro.
  const motivosEmbaralhados = useMemo(() => embaralharMotivos(MOTIVOS_EXCLUSAO), []);

  const mostrarDesvioSuspensao = motivoSelecionado === MOTIVO_COM_DESVIO_SUSPENSAO;

  const avancar = () => {
    if (!motivoSelecionado) return;
    trackStep("conta_exclusao_motivo_selecionado", { motivo: motivoSelecionado });
    navigate("/minha-conta/excluir/revisao", { state: { motivo: motivoSelecionado, comentario: comentario.trim() || undefined } });
  };

  return (
    <SubPageLayout title="Excluir conta" hideNav>
      <div className="space-y-5 pb-28">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
            <Trash size={28} className="text-[#FD5F31]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Qual o principal motivo para excluir sua conta?</h1>
            <p className="mt-1 text-sm text-muted-foreground">Isso nos ajuda a melhorar a Pode Já.</p>
          </div>
        </div>

        <div className="space-y-3">
          {motivosEmbaralhados.map((motivo) => {
            const selecionado = motivoSelecionado === motivo.id;
            return (
              <button
                key={motivo.id}
                type="button"
                onClick={() => setMotivoSelecionado(motivo.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                  selecionado ? "border-[#FD5F31] bg-[#FFF3EE]" : "border-border bg-white hover:border-[#FD5F31]/40",
                )}
              >
                <span className="text-sm font-medium text-foreground">{motivo.label}</span>
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                    selecionado ? "border-[#FD5F31] bg-[#FD5F31] text-white" : "border-border bg-white text-transparent",
                  )}
                >
                  <CheckCircle size={16} weight="fill" />
                </div>
              </button>
            );
          })}
        </div>

        {mostrarDesvioSuspensao && (
          <div className="flex gap-3 rounded-2xl border border-border bg-[#F3F6FF] p-4">
            <Info size={20} className="mt-0.5 shrink-0 text-[#2563EB]" />
            <p className="text-xs leading-relaxed text-foreground">
              Você pode pausar sua conta em vez de excluir. Dá para reativar depois, sem perder
              nada.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="comentario-exclusao" className="text-sm font-medium text-foreground">
            Quer contar mais alguma coisa? (opcional)
          </label>
          <textarea
            id="comentario-exclusao"
            value={comentario}
            maxLength={COMENTARIO_EXCLUSAO_MAX_LENGTH}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
            placeholder="Conte o que aconteceu, se quiser."
            className="w-full resize-none rounded-xl border border-border bg-white p-3 text-sm text-foreground outline-none focus:border-[#FD5F31]"
          />
          <p className="text-right text-xs text-muted-foreground">
            {comentario.length}/{COMENTARIO_EXCLUSAO_MAX_LENGTH}
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <Button className="h-14 w-full rounded-full" disabled={!motivoSelecionado} onClick={avancar}>
          Continuar
        </Button>
      </div>
    </SubPageLayout>
  );
}
