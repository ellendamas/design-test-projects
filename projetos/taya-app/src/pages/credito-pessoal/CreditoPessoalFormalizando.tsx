import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { SubPageLayout } from "@/App";
import { ErrorScreen, type ErrorCategoria } from "@/components/ErrorScreen";

type LocationState = Record<string, unknown>;

// DESIGN ONLY — mock state para acesso direto via URL de design
const MOCK_STATE: LocationState = {
  dadosConta: { cpf: "123.456.789-00", nome: "Maria da Silva" },
  emailLocal: "cliente@exemplo.com",
  celularLocal: "(11) 99999-8888",
  dataNasc: "12/08/1989",
  faixaRenda: "R$ 4.500,00",
  endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" }, // TODO: receber da API
  valorMinimo: 50000, // TODO: receber da API
  valorMaximo: 500000, // TODO: receber da API
  ofertaSelecionada: { id: "2", parcelas: 12, valorParcela: 23512, taxaJuros: 0.0249, taxaJurosAnual: 0.3433, tac: 0, valorIof: 399, primeiroVenc: "11/08/2026" }, // TODO: receber da API
  valorSolicitado: 275000, // TODO: receber da API
  dadosTomador: { tipoDoc: "RG", numeroDoc: "12.345.678-9", dataEmissao: "15/03/2010", orgaoEmissor: "SSP", estadoEmissao: "SP", nomeMae: "Ana da Silva", estadoNasc: "SP", cidadeNasc: "São Paulo", estadoCivil: "SOLTEIRO", sexo: "FEMININO", nacionalidade: "BRASILEIRO", ocupacao: "1", pep: false, endereco: { logradouro: "Av. Paulista", numero: "1374", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", cep: "01310-100" } }, // TODO: receber da API
  contaBancaria: { codigoBanco: "341", agencia: "1234", numeroConta: "56789", digitoConta: "0", tipoConta: "CORRENTE" }, // TODO: receber da API
};

export default function CreditoPessoalFormalizando() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resultado = searchParams.get("resultado"); // DESIGN ONLY
  const erroParam = searchParams.get("erro") as ErrorCategoria | null; // DESIGN ONLY

  // DESIGN ONLY — fallback mock quando state é null (acesso direto via URL)
  const locationState =
    (location.state as LocationState | null) ?? MOCK_STATE; // DESIGN ONLY

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [retrying, setRetrying] = useState(false);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // TODO: substituir por polling real da API
    const delay = resultado ? 2000 : 3000;

    timerRef.current = setTimeout(() => {
      if (resultado === "reprovada") {
        navigate("/credito-pessoal/reprovada", { state: locationState });
      } else if (resultado === "pendente") {
        navigate("/credito-pessoal/pendente", { state: locationState });
      } else if (resultado === "desembolso") {
        navigate("/credito-pessoal/confirmacao", { state: locationState });
      } else {
        // "formalizada" ou sem param → em análise (antes de liberar a assinatura)
        navigate("/credito-pessoal/em-analise", { state: locationState });
      }
    }, delay);
  }, [resultado, locationState, navigate]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (erroParam && !retrying) {
    const isFraude = erroParam === "fraude_ou_sensivel";
    return (
      <SubPageLayout title="Crédito Pessoal" hideNav>
        <ErrorScreen
          categoria={erroParam}
          onTentarNovamente={
            isFraude
              ? () => navigate("/duvidas") // TODO: confirmar rota de suporte
              : () => { setRetrying(true); startTimer(); }
          }
          labelBotao={isFraude ? "Falar com suporte" : "Tentar novamente"}
        />
      </SubPageLayout>
    );
  }

  return (
    <SubPageLayout title="Crédito Pessoal" hideNav>
      <style>{`@keyframes pulse-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
      <div className="flex flex-col items-center justify-center gap-6 pt-10 text-center">
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full bg-[#E8590A]"
              style={{
                animation: "pulse-dot 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Enviando sua proposta...</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos finalizando tudo para você. Não feche o aplicativo.
          </p>
        </div>
      </div>
    </SubPageLayout>
  );
}
