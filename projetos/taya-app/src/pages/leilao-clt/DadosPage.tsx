import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EnderecoSelector, { type EnderecoData } from "@/components/EnderecoSelector";
import ContaSelector from "@/components/ContaSelector";

const maskedInputClass =
  "flex h-12 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

type Etapa = "contato" | "endereco" | "conta";

// Rota: /leilao/dados — CPF já vem via token (não exibido para edição)
export default function LeilaoDadosPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [etapa, setEtapa] = useState<Etapa>("contato");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [endereco, setEndereco] = useState<EnderecoData | null>(null);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const celularValido = celular.replace(/\D/g, "").length >= 10;

  if (etapa === "endereco") {
    return (
      <PublicLayout>
        <EnderecoSelector
          permitirExcluir={false}
          onConfirmar={(end) => {
            setEndereco(end);
            setEtapa("conta");
          }}
        />
      </PublicLayout>
    );
  }

  if (etapa === "conta") {
    return (
      <PublicLayout>
        <ContaSelector
          permitirExcluir={false}
          mostrarPix
          onConfirmar={(conta) => {
            navigate("/leilao/mfa", {
              state: { ...(location.state as object), email, celular, endereco, conta },
            });
          }}
        />
      </PublicLayout>
    );
  }

  return (
    <PublicLayout
      footer={
        <Button
          className="h-14 w-full rounded-full bg-primary text-base font-semibold text-white hover:bg-primary-dark disabled:opacity-40"
          disabled={!emailValido || !celularValido}
          onClick={() => setEtapa("endereco")}
        >
          Continuar
        </Button>
      }
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Confirme seus dados</h2>
          <p className="mt-1 text-sm text-muted-foreground">Precisamos de algumas informações para gerar seu contrato.</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">E-mail</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Celular</Label>
          <IMaskInput
            mask="(00) 00000-0000"
            value={celular}
            onAccept={(v) => setCelular(String(v))}
            placeholder="(11) 99999-9999"
            className={maskedInputClass}
          />
        </div>
      </div>
    </PublicLayout>
  );
}
