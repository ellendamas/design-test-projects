import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";

// ---------------------------------------------------------------------------
// Provedores
// ---------------------------------------------------------------------------
type Provedor = {
  id: "bull" | "c6" | "v8" | "parana";
  nome: string;
  descricao: string;
  tipo: "automatico" | "externo";
  visivel: boolean;
};

const PROVEDORES: Provedor[] = [
  {
    id: "bull",
    nome: "Bull",
    descricao: "Você será redirecionado para concluir o consentimento",
    tipo: "externo", // era "automatico" — corrigido
    visivel: true,
  },
  {
    id: "c6",
    nome: "C6 Bank",
    descricao: "Você será redirecionado para verificação de identidade",
    tipo: "externo",
    visivel: true,
  },
  {
    id: "v8",
    nome: "V8",
    descricao: "Você será redirecionado para concluir o consentimento",
    tipo: "externo", // era "automatico" — corrigido
    visivel: true,
  },
  {
    id: "parana",
    nome: "Paraná Banco",
    descricao: "Você será redirecionado para jornada de consentimento",
    tipo: "externo",
    visivel: false, // TODO: habilitar quando Paraná Banco confirmado para v1
  },
];

// O termo de consentimento não é mais exibido no app — cada provedor coleta o consentimento
// na própria jornada externa. Por ora, usamos o link mock da Bull para todos os provedores.
// TODO: receber consent_url real por provedor da API: { type: "LINK", consent_url: "https://..." }
const CONSENT_URL_MOCK = "https://consentimento.sandbox.tayatech.com.br/bull";

type StatusProvedor = "aguardando" | "oferta" | "sem_oferta" | "expirado";

const STATUS_BADGE: Record<StatusProvedor, { label: string; className: string }> = {
  aguardando: { label: "Consultando", className: "bg-amber-100 text-amber-700" },
  oferta: { label: "Oferta encontrada", className: "bg-green-100 text-green-700" },
  sem_oferta: { label: "Sem oferta", className: "bg-gray-100 text-gray-500" },
  expirado: { label: "Tempo esgotado", className: "bg-red-100 text-red-600" },
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function ConsignadoCLTProvedoresPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [provedorSelecionado, setProvedorSelecionado] = useState<Provedor["id"] | null>(null);
  const [statusProvedores, setStatusProvedores] = useState<Record<string, StatusProvedor>>({});

  // DESIGN ONLY — ?provedores=nenhum|parcial|todos|expirado simula estados de consulta já em andamento
  // TODO: substituir por estado real da API (polling de status por provedor)
  useEffect(() => {
    const param = searchParams.get("provedores");
    if (param === "parcial") {
      setStatusProvedores({ bull: "oferta" });
    } else if (param === "todos") {
      setStatusProvedores({ bull: "oferta", c6: "aguardando", v8: "sem_oferta" });
    } else if (param === "expirado") {
      // TODO: implementar timeout real quando API disponível (10 min em "aguardando")
      // Por ora: adicionar estado visual "expirado" para design testing
      setStatusProvedores({ bull: "expirado" });
    }
  }, [searchParams]);

  // Atualiza o status do provedor consultado ao retornar da tela de consentimento
  useEffect(() => {
    const state = location.state as { provedorConsultado?: string; status?: StatusProvedor } | null;
    if (state?.provedorConsultado && state.status) {
      setProvedorSelecionado(null);
      setStatusProvedores((prev) => ({ ...prev, [state.provedorConsultado as string]: state.status as StatusProvedor }));
    }
  }, [location.state]);

  const provedoresVisiveis = PROVEDORES.filter((p) => p.visivel);
  // "Ver minhas ofertas" só habilita quando ao menos 1 provedor concluiu (oferta ou sem_oferta) —
  // "aguardando" e "expirado" não contam, pois o provedor ainda não deu uma resposta definitiva
  const podeMostrarOfertas = Object.values(statusProvedores).some(
    (status) => status === "oferta" || status === "sem_oferta",
  );
  const qtdOfertas = Object.values(statusProvedores).filter((s) => s === "oferta").length || 1;
  const provedorAtual = provedorSelecionado
    ? provedoresVisiveis.find((p) => p.id === provedorSelecionado) ?? null
    : null;

  return (
    <SubPageLayout title="Consultar crédito CLT" hideNav>
      <div className="space-y-4 pb-32">
        <div>
          <h1 className="text-xl font-bold text-foreground">Com quem você quer consultar?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultamos sua margem em cada parceiro. Você escolhe com quem contratar depois.
          </p>
        </div>

        <div className="space-y-3">
          {provedoresVisiveis.map((provedor) => {
            const status = statusProvedores[provedor.id];
            const selecionado = provedorSelecionado === provedor.id;

            const avatarENome = (
              <>
                {/* Avatar do parceiro — placeholder de logo (letra) */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF3EE] text-sm font-semibold text-[#FD5F31]">
                  {provedor.nome.charAt(0)}
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{provedor.nome}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{provedor.descricao}</p>
                </div>
              </>
            );

            // Provedor expirado tem uma ação própria ("Tentar novamente") — não pode ser
            // um <button> aninhado dentro do card, então o card vira um <div> não clicável
            if (status === "expirado") {
              return (
                <div
                  key={provedor.id}
                  className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left"
                >
                  {avatarENome}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE.expirado.className}`}
                    >
                      {STATUS_BADGE.expirado.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        // Reabre o fluxo — mesma navegação usada em "Consultar com X"
                        navigate(`/consignado-clt/redirecionando/${provedor.id}`, {
                          state: { consentUrl: CONSENT_URL_MOCK, provedor: provedor.id },
                        });
                      }}
                      className="text-xs font-semibold text-[#FD5F31] underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={provedor.id}
                type="button"
                disabled={Boolean(status)}
                onClick={() => setProvedorSelecionado(provedor.id)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                  status
                    ? "border-border bg-white opacity-60 pointer-events-none"
                    : selecionado
                      ? "border-[#FD5F31] bg-[#FFF3EE]"
                      : "border-border bg-white hover:border-[#FD5F31]/40"
                }`}
              >
                {avatarENome}

                {/* Badge de status — extremidade oposta ao avatar */}
                {/* Todos os provedores são externos agora; sem diferenciação visual de tipo */}
                {status && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_BADGE[status].className}`}
                  >
                    {STATUS_BADGE[status].label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rodapé fixo */}
      <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-border bg-background px-4 py-4 md:relative md:bottom-0 md:border-t-0 md:px-0 md:pt-2">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={!provedorAtual}
            onClick={() => {
              if (!provedorAtual) return;
              // TODO: POST /consentimentos { provedor, timestamp, user_id } — log de clique obrigatório para auditoria
              navigate(`/consignado-clt/redirecionando/${provedorAtual.id}`, {
                state: { consentUrl: CONSENT_URL_MOCK, provedor: provedorAtual.id },
              });
            }}
            className={`flex h-14 w-full items-center justify-center rounded-full text-base font-semibold text-white transition-colors ${
              provedorAtual ? "bg-[#FD5F31] hover:bg-[#d04e08]" : "cursor-not-allowed bg-[#FD5F31] opacity-40"
            }`}
          >
            {provedorAtual ? `Consultar com ${provedorAtual.nome}` : "Selecione um parceiro"}
          </button>
          {podeMostrarOfertas && (
            <button
              type="button"
              onClick={() => navigate(`/consignado-clt/ofertas?qtd=${qtdOfertas}`)}
              className="flex h-12 w-full items-center justify-center rounded-full border border-[#FD5F31] text-sm font-medium text-[#FD5F31] transition-colors hover:bg-orange-50"
            >
              Ver minhas ofertas
            </button>
          )}
        </div>
      </div>
    </SubPageLayout>
  );
}
