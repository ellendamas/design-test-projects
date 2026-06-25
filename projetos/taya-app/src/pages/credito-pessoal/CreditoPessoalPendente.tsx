import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { IdentificationCard, Video, Warning } from "@phosphor-icons/react";
import { SubPageLayout } from "@/App";

type LocationState = Record<string, unknown>;

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" }, // TODO: receber da API
  emailLocal: "cliente@exemplo.com", // TODO: receber da API
  celularLocal: "(11) 99999-8888", // TODO: receber da API
  dataNasc: "12/08/1989", // TODO: receber da API
  faixaRenda: "R$ 4.500,00", // TODO: receber da API
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" }, // TODO: receber da API
  valorMinimo: 50000, // TODO: receber da API
  valorMaximo: 500000, // TODO: receber da API
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API
  valorSolicitado: 275000, // TODO: receber da API
  dadosTomador: { tipoDoc: "RG", numeroDoc: "12.345.678-9", dataEmissao: "15/03/2010", orgaoEmissor: "SSP", estadoEmissao: "SP", nomeMae: "Ana da Silva", estadoNasc: "SP", cidadeNasc: "São Paulo", estadoCivil: "SOLTEIRO", sexo: "FEMININO", nacionalidade: "BRASILEIRO", ocupacao: "1", pep: false, endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" } }, // TODO: receber da API
  contaBancaria: { codigoBanco: "341", agencia: "1234", numeroConta: "56789", digitoConta: "0", tipoConta: "CORRENTE" }, // TODO: receber da API
};

// TODO: receber do campo "mensagem" da API
const mensagemMock = {
  divergencia: "Seu nome está divergente na Receita Federal. Corrija e solicite nova análise.",
  documento: "O documento enviado está ilegível. Por favor, reenvie uma foto mais nítida.",
  video: "É necessário realizar uma verificação por chamada de vídeo com a equipe da Zema.",
};

export default function CreditoPessoalPendente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const _locationState =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  // DESIGN ONLY — ?tipo=divergencia (default) | documento | video
  const tipo = (searchParams.get("tipo") ?? "divergencia") as
    | "divergencia"
    | "documento"
    | "video"; // DESIGN ONLY

  const configs = {
    divergencia: {
      icon: Warning,
      titulo: "Encontramos uma divergência nos seus dados",
      mensagem: mensagemMock.divergencia,
      labelCta: "Corrigir meus dados",
      onCta: () => navigate("/credito-pessoal/dados-tomador?step=2"),
      ctaDisabled: false,
      ctaTooltip: undefined,
    },
    documento: {
      icon: IdentificationCard,
      titulo: "Documento precisa ser reenviado",
      mensagem: mensagemMock.documento,
      labelCta: "Reenviar documento",
      onCta: () => navigate("/credito-pessoal/dados-tomador?step=1"),
      ctaDisabled: false,
      ctaTooltip: undefined,
    },
    video: {
      icon: Video,
      titulo: "Verificação por chamada de vídeo necessária",
      mensagem: mensagemMock.video,
      labelCta: "Acessar chamada",
      // TODO: link da chamada de vídeo — Zema ainda não forneceu detalhes de como chega ao app
      onCta: () => {},
      ctaDisabled: true,
      ctaTooltip: "Em breve",
    },
  }[tipo];

  const { icon: Icon } = configs;

  return (
    <SubPageLayout title="Pendência">
      <div className="flex flex-col items-center gap-6 pb-6 text-center md:mx-auto md:max-w-[560px]">

        <Icon size={48} className="text-amber-500" />

        <div>
          <h2 className="text-xl font-bold text-foreground">{configs.titulo}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Resolva a pendência abaixo para dar continuidade à sua proposta.
          </p>
        </div>

        {/* Card âmbar — mensagem da API */}
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
          <div className="flex items-start gap-3">
            <Warning size={18} className="mt-0.5 shrink-0 text-amber-600" />
            {/* TODO: substituir mensagemMock pelo campo "mensagem" da API */}
            <p className="text-sm leading-relaxed text-amber-800">{configs.mensagem}</p>
          </div>
        </div>

        {/* CTA principal */}
        <div className="w-full">
          {configs.ctaDisabled ? (
            <div className="relative" title={configs.ctaTooltip}>
              <button
                type="button"
                disabled
                className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#E8590A] text-base font-semibold text-white opacity-40"
              >
                {configs.labelCta}
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">Em breve</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={configs.onCta}
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#E8590A] text-base font-semibold text-white transition-colors hover:bg-[#A33D05]"
            >
              {configs.labelCta}
            </button>
          )}
        </div>

        {/* DESIGN ONLY — simula chegada da notificação de link disponível para o tipo vídeo */}
        {tipo === "video" && (
          <button
            type="button"
            onClick={() => {
              // DESIGN ONLY — em produção isso virá por push/webhook da Zema
              localStorage.setItem("cp_video_disponivel", "true");
              navigate("/painel");
            }}
            className="rounded-lg border border-dashed border-muted-foreground/30 px-4 py-2 text-xs text-muted-foreground/50 hover:border-muted-foreground/60 hover:text-muted-foreground"
          >
            [DESIGN] Simular: link de vídeo disponível → ir ao painel
          </button>
        )}

        {/* Link secundário — suporte */}
        <p className="text-xs text-muted-foreground">
          Nossa equipe pode te ajudar:{" "}
          <button
            type="button"
            onClick={() => navigate("/duvidas")}
            className="underline underline-offset-2 hover:text-foreground"
          >
            suporte
          </button>
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="py-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Voltar ao início
        </button>

      </div>
    </SubPageLayout>
  );
}
