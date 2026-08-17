import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Clock, ShieldCheck, Signature } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";
import UnicoNotice from "@/components/UnicoNotice";
import UnicoAguardando from "@/components/UnicoAguardando";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const formatCents = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  // Assinatura 100% via Unico — modo SMS foi descontinuado (Zema liberou acesso ao link da Unico).
  // DESIGN ONLY — parâmetros de simulação disponíveis:
  //   ?status=aviso (default) | ?status=aguardando | ?status=expirado | ?status=assinado | ?status=reprovado
  //   ?erro=biometria_falhou  → tela de erro fullscreen, biometria falhou na Unico
  //   ?erro=documento_invalido → tela de erro fullscreen, documento rejeitado
  //   ?erro=sessao_expirada   → tela de erro fullscreen, sessão de assinatura expirada
  //   Ao clicar "Tentar novamente" em qualquer erro, volta ao estado ?status=aviso
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  const ASSINATURA_ERROS = new Set<string>(["biometria_falhou", "documento_invalido", "sessao_expirada"]);

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

  // Ao clicar em "Assinar contrato agora" no UnicoNotice — abre a tela de redirecionamento
  // para a Unico (assinatura acontece fora do app, na plataforma da Zema/Unico)
  const handleIniciarAssinatura = useCallback(() => {
    navigate("/credito-pessoal/redirecionando", { state: st });
  }, [navigate, st]);

  // Ao clicar em "Assinar agora" no UnicoAguardando — reabre o redirecionamento para a Unico
  const handleReabrirUnico = useCallback(() => {
    navigate("/credito-pessoal/redirecionando", { state: st });
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

        {/* ── Erro de assinatura fullscreen (biometria, documento, sessão) ──
             "Tentar novamente" reabre o link da Unico direto — a verificação/assinatura
             acontece toda lá fora, então não faz sentido voltar para a tela de aviso interna. */}
        {erroParam && ASSINATURA_ERROS.has(erroParam) && (
          <ErrorScreen
            categoria={erroParam}
            onTentarNovamente={() => navigate("/credito-pessoal/redirecionando", { state: st })}
          />
        )}

        {/* ══════════════════════════════════════════
            ESTADO AVISO — card resumo + modo assinatura
        ══════════════════════════════════════════ */}
        {!ASSINATURA_ERROS.has(erroParam ?? "") && etapa === "aviso" && (
          <>
            {/* Card laranja — resumo da proposta (ambos os modos) */}
            {oferta && (
              <div className="rounded-2xl bg-[#FFF3EE] p-4">
                <p className="text-sm text-[#D94E28]/70">Você vai receber</p>
                <p className="text-3xl font-bold text-[#FD5F31]">R$ {formatCents(valorSolicitado)}</p>
                <p className="mt-1 text-base font-medium text-[#D94E28]">
                  {oferta.parcelas}x de R$ {formatCents(oferta.valorParcela)}
                </p>
                <p className="mt-0.5 text-sm text-[#D94E28]/70">1º vencimento: {oferta.primeiroVenc}</p>
              </div>
            )}

            <UnicoNotice
              titulo="Falta só sua assinatura!"
              descricao="Sua proposta foi aprovada. Você será direcionado para verificar sua identidade e assinar o contrato digitalmente na plataforma segura da Zema Financeira."
              itens={ITENS_ASSINATURA}
              labelBotao="Assinar contrato agora"
              onContinuar={handleIniciarAssinatura}
            />
          </>
        )}

        {/* ══════════════════════════════════════════
            ESTADO AGUARDANDO — UnicoAguardando
        ══════════════════════════════════════════ */}
        {!ASSINATURA_ERROS.has(erroParam ?? "") && etapa === "aguardando" && (
          <UnicoAguardando
            titulo={linkExpirado ? "Sua assinatura expirou" : "Aguardando sua assinatura"}
            descricao={
              linkExpirado
                ? "A assinatura do seu contrato é feita pela Unico, nossa parceira de verificação de identidade. O link gerado tem um prazo de validade e infelizmente ele expirou antes de ser utilizado."
                : "Você saiu antes de concluir. Toque em Assinar agora para voltar à Unico e finalizar."
            }
            descricaoAcao={linkExpirado ? "Você pode iniciar uma nova simulação para gerar um novo contrato." : undefined}
            mostrarBotao={!linkExpirado}
            onAssinar={handleReabrirUnico}
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
