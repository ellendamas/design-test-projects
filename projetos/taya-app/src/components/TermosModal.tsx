import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface TermosModalProps {
  aberto: boolean;
  onFechar: () => void;
}

export function TermosModal({ aberto, onFechar }: TermosModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={onFechar} />
          <DialogHeader>
            <DialogTitle>Termos de uso e privacidade</DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">Leia antes de continuar</p>
          </DialogHeader>
          <TermosConteudo scrollBoxClassName="max-h-[280px]" />
          <TermosFooter onFechar={onFechar} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={aberto} onOpenChange={(o) => { if (!o) onFechar(); }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Termos de uso e privacidade</DrawerTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Leia antes de continuar</p>
        </DrawerHeader>
        <TermosConteudo scrollBoxClassName="h-[45vh]" />
        <TermosFooter onFechar={onFechar} />
      </DrawerContent>
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Footer — fechar o modal/drawer
// ---------------------------------------------------------------------------
function TermosFooter({ onFechar }: { onFechar: () => void }) {
  return (
    <div className="pt-4 mt-4 shrink-0 border-t border-border">
      <button
        type="button"
        onClick={onFechar}
        className="flex h-12 w-full items-center justify-center rounded-full bg-[#FD5F31] text-sm font-semibold text-white"
      >
        Fechar
      </button>
      <p className="text-xs text-center text-muted-foreground mt-3 leading-relaxed">
        Ao usar o Pode Já, você confirma que leu e aceita estes termos.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conteúdo interno do modal/drawer
// ---------------------------------------------------------------------------
function TermosConteudo({ scrollBoxClassName }: { scrollBoxClassName: string }) {
  return (
    <div className={cn("space-y-4 overflow-y-auto pr-1", scrollBoxClassName)}>
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-600">
        Este é um termo de demonstração para fins de teste. Será substituído pelo texto aprovado pelo jurídico antes do lançamento.
      </p>

      <div className="space-y-3 text-sm leading-relaxed text-foreground">
        <div className="space-y-1">
          <p className="font-semibold">1. O que é o Pode Já</p>
          <p className="text-muted-foreground">
            O Pode Já é uma plataforma digital operada pela Taya Tech que conecta você a instituições financeiras parceiras para acesso a produtos e serviços financeiros, como crédito consignado, crédito pessoal e outros produtos disponibilizados futuramente.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">2. Dados que coletamos</p>
          <p className="text-muted-foreground">
            Coletamos dados de identificação (nome, CPF, data de nascimento, e-mail, telefone), dados financeiros (renda, conta bancária, margem consignável via MTE/DATAPREV) e dados biométricos nas etapas de verificação de identidade, sempre mediante consentimento específico.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">3. Como usamos seus dados</p>
          <p className="text-muted-foreground">
            Seus dados são usados exclusivamente para criar sua conta, apresentar ofertas adequadas ao seu perfil, conectar você às instituições financeiras parceiras e garantir a segurança da sua conta. Não vendemos seus dados para terceiros.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">4. Com quem compartilhamos</p>
          <p className="text-muted-foreground">
            Compartilhamos seus dados com instituições financeiras parceiras credenciadas, parceiros de verificação de identidade (como a Unico) e autoridades regulatórias quando exigido por lei.
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">5. Seus direitos (LGPD)</p>
          <p className="text-muted-foreground">
            Você tem direito a acessar, corrigir, portabilizar e solicitar a eliminação dos seus dados, além de revogar este consentimento a qualquer momento pelo canal: privacidade@taya.com.br
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold">6. Contato</p>
          <p className="text-muted-foreground">DPO: Erasmo de Souza Pinheiro — privacidade@taya.com.br</p>
        </div>
      </div>
    </div>
  );
}
