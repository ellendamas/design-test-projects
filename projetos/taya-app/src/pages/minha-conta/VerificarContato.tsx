import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, EnvelopeSimple, DeviceMobile } from "@phosphor-icons/react";
import { toast } from "sonner";
import { SubPageLayout } from "@/App";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useChat } from "@/context/ChatContext";

// Mesmo padrão visual da verificação de telefone por SMS do onboarding (step 3 do cadastro),
// só que reaproveitável dentro do app logado (com menus disponíveis) para e-mail e celular —
// tanto para a primeira verificação do e-mail quanto para revalidar sempre que o contato mudar.

const CODIGO_VALIDO = "123456"; // TODO: substituir por validação real via API

type Tipo = "email" | "celular";

const CONFIG: Record<Tipo, { titulo: string; storageValueKey: string; storageValidadoKey: string; storageTrocadoPendenteKey: string; defaultValue: string; icon: typeof EnvelopeSimple }> = {
  email: {
    titulo: "Verificar e-mail",
    storageValueKey: "podeja_email",
    storageValidadoKey: "podeja_email_validado",
    storageTrocadoPendenteKey: "podeja_email_trocado_pendente",
    defaultValue: "cliente@exemplo.com",
    icon: EnvelopeSimple,
  },
  celular: {
    titulo: "Verificar celular",
    storageValueKey: "podeja_celular",
    storageValidadoKey: "podeja_telefone_validado",
    storageTrocadoPendenteKey: "podeja_celular_trocado_pendente",
    defaultValue: "(11) 99999-8888",
    icon: DeviceMobile,
  },
};

const maskarEmail = (v: string) => {
  const [local, dominio] = v.split("@");
  if (!local || !dominio) return v;
  return `${local.slice(0, 2)}***@${dominio}`;
};

const maskarCelular = (v: string) => {
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) return v;
  return `(${digits.slice(0, 2)}) •••••-${digits.slice(-4)}`;
};

export default function VerificarContato({ tipo }: { tipo: Tipo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { abrirChat, enviarMensagemContexto } = useChat();
  const cfg = CONFIG[tipo];
  const Icon = cfg.icon;

  // Vindo da edição em Minha Conta: o novo valor chega via navigation state
  // (ainda não salvo) e a tela já abre direto na confirmação pelo contato antigo.
  const novoValorRecebido = (location.state as { novoValor?: string } | null)?.novoValor;

  const [valor, setValor] = useState(() => localStorage.getItem(cfg.storageValueKey) ?? cfg.defaultValue);
  const [etapa, setEtapa] = useState<"codigo" | "confirmando">(novoValorRecebido ? "confirmando" : "codigo");
  const [novoValor] = useState(novoValorRecebido ?? valor);
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState<string | null>(null);
  const [verificado, setVerificado] = useState(false);
  const [avisoSuporteAberto, setAvisoSuporteAberto] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const valorMascarado = tipo === "email" ? maskarEmail(valor) : maskarCelular(valor);

  useEffect(() => {
    if (!novoValorRecebido) return;
    // TODO: acionar envio real do código para o contato atual via API
    toast(`Código enviado para ${valorMascarado}.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerificar = () => {
    if (codigo.length !== 6) {
      setErro("Digite o código de 6 dígitos.");
      return;
    }
    if (codigo !== CODIGO_VALIDO) {
      setErro("Código inválido. Verifique e tente novamente.");
      setCodigo("");
      return;
    }
    localStorage.setItem(cfg.storageValidadoKey, "true");
    // Se esse contato tinha acabado de ser trocado (Fluxo B), a confirmação
    // aqui encerra a pendência — remove a flag que ativa o card "Confirme seu
    // novo e-mail/celular" no painel.
    localStorage.removeItem(cfg.storageTrocadoPendenteKey);
    setErro(null);
    setVerificado(true);
    toast.success(tipo === "email" ? "E-mail verificado!" : "Celular verificado!");
    setTimeout(() => navigate(-1), 1500);
  };

  const handleReenviar = () => {
    setCountdown(30);
    setCodigo("");
    setErro(null);
    // TODO: acionar reenvio real do código via API
    toast(`Código reenviado para ${valorMascarado}.`);
  };

  // Só após validar o código do contato ANTIGO é que o novo valor é de fato salvo.
  const handleConfirmarTroca = () => {
    if (codigoConfirmacao.length !== 6) {
      setErroConfirmacao("Digite o código de 6 dígitos.");
      return;
    }
    if (codigoConfirmacao !== CODIGO_VALIDO) {
      setErroConfirmacao("Código inválido. Verifique e tente novamente.");
      setCodigoConfirmacao("");
      return;
    }
    // O novo contato ainda não foi confirmado por ele mesmo — só a posse do
    // contato ANTIGO foi comprovada aqui. Fica marcado como não verificado até
    // o usuário validar o novo e-mail/celular (o card de verificação correspondente
    // volta a aparecer no painel automaticamente, já que lê a mesma storageKey).
    localStorage.setItem(cfg.storageValueKey, novoValor);
    localStorage.setItem(cfg.storageValidadoKey, "false");
    // Ativa o card "Confirme seu novo e-mail/celular" no painel (Ajuste 2) — distinto
    // do card de verificação inicial, já que este contato JÁ foi confirmado uma vez
    // (via posse do contato antigo), só falta validar o novo.
    localStorage.setItem(cfg.storageTrocadoPendenteKey, "true");
    setValor(novoValor);
    setErroConfirmacao(null);
    setVerificado(true);
    toast.success("Troca realizada!");
    setTimeout(() => navigate(-1), 1500);
  };

  // Abre o chat da Jade e já manda uma mensagem de contexto (invisível pro
  // usuário, não vira bolha) pra encaminhar direto pro suporte humano, sem o
  // usuário precisar reexplicar a situação.
  const handleIniciarChatSuporte = () => {
    setAvisoSuporteAberto(false);
    abrirChat();
    enviarMensagemContexto(
      `[SISTEMA] Usuário solicitou ajuda para validar ${tipo === "email" ? "e-mail" : "celular"}. Encaminhar para suporte humano.`
    );
  };

  const linkSuporte = (
    <button
      type="button"
      onClick={() => setAvisoSuporteAberto(true)}
      className="py-1 text-center text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
    >
      Não consigo validar meu contato
    </button>
  );

  // Aviso antes de abrir o chat — deixa claro que a troca de contato precisa
  // ser feita com o suporte por segurança, evitando que o usuário estranhe o
  // chat abrindo sozinho.
  const avisoSuporteConteudo = (
    <p className="text-sm text-muted-foreground">
      Por segurança, a troca de contato precisa ser concluída junto ao suporte do Pode Já. Vamos iniciar o chat de atendimento para te ajudar.
    </p>
  );

  const avisoSuporteBotoes = (
    <>
      <Button
        className="h-12 rounded-full bg-[#FD5F31] text-white hover:bg-[#D94E28]"
        onClick={handleIniciarChatSuporte}
      >
        Iniciar chat
      </Button>
      <Button
        variant="outline"
        className="h-12 rounded-full"
        onClick={() => setAvisoSuporteAberto(false)}
      >
        Cancelar
      </Button>
    </>
  );

  return (
    <SubPageLayout title={cfg.titulo}>
      <div className="flex flex-col gap-4 pb-4 md:mx-auto md:max-w-[480px]">
        {verificado ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle size={32} weight="fill" />
            </div>
            <div>
              {etapa === "confirmando" ? (
                <>
                  <h2 className="text-lg font-bold text-foreground">Troca realizada!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confirme seu novo {tipo === "email" ? "e-mail" : "celular"} para finalizar.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-foreground">{tipo === "email" ? "E-mail verificado!" : "Celular verificado!"}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Voltando para a tela anterior...</p>
                </>
              )}
            </div>
          </div>
        ) : etapa === "codigo" ? (
          <>
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <Icon size={28} className="text-[#FD5F31]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {tipo === "email" ? "Confirme seu e-mail" : "Confirme seu celular"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enviamos um código de verificação para {valorMascarado}
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={codigo} onChange={(v) => { setCodigo(v); if (erro) setErro(null); }}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {erro && <p className="mt-3 text-center text-sm text-red-500">{erro}</p>}
              <div className="mt-3 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Reenviar em <span className="font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button type="button" onClick={handleReenviar} className="text-sm font-semibold text-[#FD5F31] underline">
                    Reenviar código
                  </button>
                )}
              </div>
            </div>

            <Button
              className="h-12 rounded-full bg-[#FD5F31] text-white hover:bg-[#D94E28]"
              disabled={codigo.length !== 6}
              onClick={handleVerificar}
            >
              Verificar código
            </Button>

            {linkSuporte}
          </>
        ) : (
          <>
            {/* ── Confirmação no contato ANTIGO antes de efetivar a troca ── */}
            <div className="flex flex-col items-center gap-3 pt-2 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF3EE]">
                <Icon size={28} className="text-[#FD5F31]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {tipo === "email" ? "Confirme a troca do seu e-mail" : "Confirme a troca do seu celular"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para confirmar a troca, enviamos um código para {valorMascarado}. Digite-o abaixo.
                </p>
              </div>
            </div>

            <div className="mt-2 rounded-2xl border border-border bg-white p-5 shadow-sm">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={codigoConfirmacao}
                  onChange={(v) => { setCodigoConfirmacao(v); if (erroConfirmacao) setErroConfirmacao(null); }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {erroConfirmacao && <p className="mt-3 text-center text-sm text-red-500">{erroConfirmacao}</p>}
            </div>

            <Button
              className="h-12 rounded-full bg-[#FD5F31] text-white hover:bg-[#D94E28]"
              disabled={codigoConfirmacao.length !== 6}
              onClick={handleConfirmarTroca}
            >
              Confirmar troca
            </Button>

            {linkSuporte}
          </>
        )}
      </div>

      {isDesktop ? (
        <Dialog open={avisoSuporteAberto} onOpenChange={setAvisoSuporteAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Falar com o suporte</DialogTitle>
            </DialogHeader>
            {avisoSuporteConteudo}
            <div className="flex flex-col gap-2 pt-2">{avisoSuporteBotoes}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={avisoSuporteAberto} onOpenChange={setAvisoSuporteAberto}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Falar com o suporte</DrawerTitle>
            </DrawerHeader>
            {avisoSuporteConteudo}
            <div className="flex flex-col gap-2 pt-4">{avisoSuporteBotoes}</div>
          </DrawerContent>
        </Drawer>
      )}
    </SubPageLayout>
  );
}
