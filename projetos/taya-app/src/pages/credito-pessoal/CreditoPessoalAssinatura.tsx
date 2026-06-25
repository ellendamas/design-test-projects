import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, DeviceMobileSpeaker, ShieldCheck, Signature } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Mantém DDD + últimos 4 dígitos, mascara o meio com •••••
// Ex: "(11) 99999-8888" → "(11) •••••-8888"
const mascaraCelular = (celular: string): string => {
  const digits = celular.replace(/\D/g, "");
  if (digits.length < 6) return celular;
  const ddd = digits.slice(0, 2);
  const ultimos = digits.slice(-4);
  return `(${ddd}) •••••-${ultimos}`;
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type LocationState = {
  ofertaSelecionada?: {
    parcelas: number;
    valorParcela: number;
    primeiroVenc: string;
  };
  valorSolicitado?: number;
  [key: string]: unknown;
};

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" },
  valorMinimo: 50000,
  valorMaximo: 500000,
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" },
  valorSolicitado: 275000,
  dadosTomador: { tipoDoc: "RG", estadoEmissao: "SP", nomeMae: "Ana da Silva", estadoNasc: "SP", cidadeNasc: "São Paulo", estadoCivil: "SOLTEIRO", sexo: "FEMININO", nacionalidade: "BRASILEIRO", ocupacao: "1", pep: false, endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" } },
  contaBancaria: { codigoBanco: "341", agencia: "1234", numeroConta: "56789", digitoConta: "0", tipoConta: "CORRENTE" },
};

// ---------------------------------------------------------------------------
// Itens do UnicoNotice para assinatura
// ---------------------------------------------------------------------------
const ITENS_ASSINATURA = [
  { icon: ShieldCheck, titulo: "Ambiente seguro",    desc: "Verificação criptografada" },
  { icon: Signature,   titulo: "Assinatura digital", desc: "Válida juridicamente"      },
  { icon: Clock,       titulo: "Rápido",             desc: "Menos de 2 minutos"        },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function CreditoPessoalAssinatura() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get("status") ?? "aviso"; // DESIGN ONLY
  // DESIGN ONLY — ?modo=sms (default atual) | unico (quando link Unico estiver disponível)
  // TODO: trocar default para "unico" quando Pedro confirmar que o link está disponível em produção
  const modoParam = (searchParams.get("modo") ?? "sms") as "sms" | "unico"; // DESIGN ONLY

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const st = (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  // DESIGN ONLY — ?status=aguardando|expirado pula direto para o estado correspondente
  const initialEtapa = (): "aviso" | "aguardando" => {
    if (statusParam === "aguardando" || statusParam === "expirado") return "aguardando"; // DESIGN ONLY
    return "aviso";
  };

  const [etapa, setEtapa] = useState<"aviso" | "aguardando">(initialEtapa);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // DESIGN ONLY — roteamento automático por ?status
  useEffect(() => {
    if (statusParam === "assinado") {
      timerRef.current = setTimeout(() => {
        navigate("/credito-pessoal/confirmacao", { state: st });
      }, 1000);
    } else if (statusParam === "reprovado") {
      timerRef.current = setTimeout(() => {
        navigate("/credito-pessoal/reprovada", { state: st });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: implementar polling real — a cada 30s fazer GET /propostas/{id} e rotear conforme status

  const oferta = st.ofertaSelecionada;
  const valorSolicitado = st.valorSolicitado ?? 0;
  const celularMascarado = mascaraCelular(String(st.celularLocal ?? ""));

  // Ao clicar em "Assinar contrato agora" no UnicoNotice
  const handleIniciarAssinatura = useCallback(() => {
    // TODO: substituir pelo acionamento real do token_sdk Unico
    setEtapa("aguardando");
  }, []);

  // Ao clicar em "Assinar agora" no UnicoAguardando (tentativa de reabrir)
  const handleReabrirAssinatura = useCallback(() => {
    // TODO: reabrir token_sdk Unico diretamente
    // Simular: navegar para confirmação após 1s
    timerRef.current = setTimeout(() => {
      navigate("/credito-pessoal/confirmacao", { state: st });
    }, 1000);
  }, [navigate, st]);

  const handleCancelar = useCallback(() => {
    // TODO: conectar ao DELETE /propostas/{id}
    navigate("/credito-pessoal");
  }, [navigate]);

  // DESIGN ONLY — ?status=expirado → link não disponível
  const linkExpirado = statusParam === "expirado"; // DESIGN ONLY

  return (
    <SubPageLayout title="Assinatura" hideNav>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[560px]">

        {/* ══════════════════════════════════════════
            ESTADO AVISO — card resumo + modo assinatura
        ══════════════════════════════════════════ */}
        {etapa === "aviso" && (
          <>
            {/* Card laranja — resumo da proposta (ambos os modos) */}
            {oferta && (
              <div className="rounded-2xl bg-[#FEF0E7] p-4">
                <p className="text-sm text-[#A33D05]/70">Você vai receber</p>
                <p className="text-3xl font-bold text-[#E8590A]">R$ {formatCents(valorSolicitado)}</p>
                <p className="mt-1 text-base font-medium text-[#A33D05]">
                  {oferta.parcelas}x de R$ {formatCents(oferta.valorParcela)}
                </p>
                <p className="mt-0.5 text-sm text-[#A33D05]/70">1º vencimento: {oferta.primeiroVenc}</p>
              </div>
            )}

            {/* ── Modo SMS (fallback enquanto link Unico não está disponível) ── */}
            {modoParam === "sms" && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm text-center">
                <DeviceMobileSpeaker size={48} className="text-[#E8590A]" />
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground">Verifique seu celular</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Enviamos um link de assinatura por SMS para o número cadastrado. Abra o link e siga as instruções para assinar seu contrato.
                  </p>
                  {celularMascarado && (
                    <p className="mt-1 text-sm font-semibold text-foreground">{celularMascarado}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Após assinar, volte aqui para acompanhar.</p>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: endpoint de reenvio de SMS
                    toast("Reenvio solicitado.");
                  }}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-[#E8590A] text-sm font-semibold text-[#E8590A] transition-colors hover:bg-[#FEF0E7]"
                >
                  Não recebi o SMS
                </button>
              </div>
            )}

            {/* ── Modo Unico (fluxo ideal — quando link estiver disponível) ── */}
            {modoParam === "unico" && (
              <UnicoNotice
                titulo="Falta só sua assinatura!"
                descricao="Sua proposta foi aprovada. Você será direcionado para verificar sua identidade e assinar o contrato digitalmente na plataforma segura da Zema Financeira."
                itens={ITENS_ASSINATURA}
                labelBotao="Assinar contrato agora"
                onContinuar={handleIniciarAssinatura}
              />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            ESTADO AGUARDANDO — UnicoAguardando
        ══════════════════════════════════════════ */}
        {etapa === "aguardando" && (
          <UnicoAguardando
            titulo={linkExpirado ? "Sua assinatura expirou" : "Aguardando sua assinatura"}
            descricao={
              linkExpirado
                ? "A assinatura do seu contrato é feita pela Unico, nossa parceira de verificação de identidade. O link gerado tem um prazo de validade e infelizmente ele expirou antes de ser utilizado."
                : "Você saiu antes de concluir. Toque em Assinar agora para continuar de onde parou."
            }
            descricaoAcao={linkExpirado ? "Você pode iniciar uma nova simulação para gerar um novo contrato." : undefined}
            labelBotao="Assinar agora"
            mostrarBotao={!linkExpirado}
            onAssinar={handleReabrirAssinatura}
            onCancelar={handleCancelar}
            // Props para o estado expirado
            labelAcaoExpirado="Iniciar nova simulação"
            onAcaoExpirado={() => {
              // TODO: conectar ao DELETE /propostas/{id} antes de redirecionar
              navigate("/credito-pessoal/simulador", { state: st });
            }}
            onVoltar={() => navigate("/painel")}
          />
        )}

      </div>
    </SubPageLayout>
  );
}
